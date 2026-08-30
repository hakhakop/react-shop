import { cookies, headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { graphqlFetch } from "../../lib/graphql";
import Breadcrumbs from "../../components/Breadcrumbs";
import StorefrontBuilderRenderer from "../../components/builder/StorefrontBuilderRenderer";
import WebsiteFrontend from "../../components/website/WebsiteFrontend";
import {
  getPublishedBuilderLayout,
  readBuilderCustomPages,
  type BuilderCustomPageKey,
} from "../../lib/builderLayouts";
import { materializeBuilderDynamicContent } from "@/lib/builderDynamicContentMaterializer.server";
import {
  getWebsiteByDomainHost,
  getWebsiteByIdOrSlug,
} from "../../lib/websites";
import { resolveContentSections } from "../../lib/builderContentLanguages";
import { getBuilderShellSettings } from "../../lib/builderShell";
import { getPublishedHeaderDocumentSettings } from "../../lib/publishedHeaderDocumentSettings";
import { getCanonicalPostSingularBySlug } from "@/lib/postSingularContext.server";
import { resolveLayout, type SingularRouteContext } from "@/lib/layoutRouting";
import {
  ensurePostSingleRoutingCompatibility,
  getBuilderLayoutByDocumentId,
} from "@/lib/layoutRoutingStore.server";
import type { SaaSWebsite } from "@/lib/websites";

type WPPageParams = {
  slug?: string[];
};

type PageByUriResult = {
  pageBy: {
    title: string;
    uri?: string | null;
    content?: string | null;
  } | null;
};

async function renderCanonicalPost(
  slug: string,
  website?: SaaSWebsite | null,
  websiteMode: "domain" | "tenant-path" = "domain",
) {
  const canonical = await getCanonicalPostSingularBySlug(slug, website);
  if (!canonical) return null;
  const { post } = canonical;
  const context: SingularRouteContext = {
    view: "singular",
    pageType: "singular:post",
    provider: "wordpress",
    contentType: "post",
    contentId: post.id,
    ...(post.databaseId !== undefined ? { databaseId: post.databaseId } : {}),
    slug: post.slug,
    uri: post.uri ?? `/${post.slug}/`,
    taxonomyTerms: canonical.taxonomyTerms,
  };
  const scope = website ? { websiteId: website.id } : {};
  let selectedLayout = null;
  try {
    const registry = await ensurePostSingleRoutingCompatibility(scope);
    const resolution = resolveLayout({
      context,
      individualOverrides: registry.individualOverrides,
      routingTemplates: registry.routingTemplates,
      nativeFallbackAvailable: true,
    });
    if (resolution.outcome === "individual" || resolution.outcome === "routing-template") {
      selectedLayout = await getBuilderLayoutByDocumentId(resolution.layoutId, scope);
    }
  } catch (error) {
    console.error("[layout-routing] Post resolution failed", error);
  }

  const fallbackContent = (
    <main className="page">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: post.title, href: post.uri ?? `/${post.slug}/` }]} />
      <h1 className="page-title">{post.title}</h1>
      {post.featuredImage?.sourceUrl ? <img src={post.featuredImage.sourceUrl} alt={post.featuredImage.altText ?? ""} /> : null}
      <article className="prose" dangerouslySetInnerHTML={{ __html: post.content ?? post.excerpt ?? "" }} />
    </main>
  );

  if (website) {
    return (
      <WebsiteFrontend
        website={website}
        requestedPage="post-single"
        pageLabelOverride={post.title}
        mode={websiteMode}
        layoutOverride={selectedLayout ?? undefined}
        dynamicItemContextOverride={canonical.dynamicContext}
        fallbackContent={fallbackContent}
        rendererProps={{ breadcrumbItems: [{ label: "Home", href: "/" }, { label: post.title }] }}
      />
    );
  }
  if (!selectedLayout) return fallbackContent;
  const [materialization, shellSettings] = await Promise.all([
    materializeBuilderDynamicContent(selectedLayout, { rootContext: canonical.dynamicContext }),
    getBuilderShellSettings(),
  ]);
  return (
    <StorefrontBuilderRenderer
      layout={materialization.renderLayout}
      page="post-single"
      pageLabel={post.title}
      breadcrumbItems={[{ label: "Home", href: "/" }, { label: post.title }]}
      shellSettings={shellSettings}
    />
  );
}

export default async function WPPage({
  params,
}: {
  params: Promise<WPPageParams>;
}) {
  // Next 16: params is a Promise → we must await it
  const resolved = await params;
  const slugSegments = resolved.slug;
  const domainWebsite = await getWebsiteByDomainHost((await headers()).get("host"));

  if (domainWebsite && slugSegments?.length === 1) {
    const domainPages = await readBuilderCustomPages({ websiteId: domainWebsite.id });
    if (!domainPages.some((page) => page.slug === slugSegments[0])) {
      try {
        const post = await renderCanonicalPost(slugSegments[0], domainWebsite);
        if (post) return post;
      } catch (error) {
        console.error("[wordpress/post] singular resolution failed", error);
      }
    }
  }

  if (domainWebsite) {
    return (
      <WebsiteFrontend
        website={domainWebsite}
        requestedPage={slugSegments?.join("/") || "home"}
        mode="domain"
      />
    );
  }

  // A local path can address a tenant without needing a custom domain:
  // `/circle` is its home page and `/circle/about` is its `about` page.
  const [tenantSlug, ...tenantPath] = slugSegments ?? [];
  if (tenantSlug) {
    const tenantWebsite = await getWebsiteByIdOrSlug(tenantSlug);
    if (tenantWebsite?.slug === tenantSlug) {
      if (tenantPath.length === 1) {
        const tenantPages = await readBuilderCustomPages({ websiteId: tenantWebsite.id });
        if (!tenantPages.some((page) => page.slug === tenantPath[0])) {
          try {
            const post = await renderCanonicalPost(tenantPath[0], tenantWebsite, "tenant-path");
            if (post) return post;
          } catch (error) {
            console.error("[wordpress/post] tenant-path resolution failed", error);
          }
        }
      }
      return (
        <WebsiteFrontend
          website={tenantWebsite}
          requestedPage={tenantPath.join("/") || "home"}
          mode="tenant-path"
        />
      );
    }
  }

  // Special-case: /shop → redirect to main store (home)
  if (
    slugSegments &&
    Array.isArray(slugSegments) &&
    slugSegments.length === 1 &&
    slugSegments[0] === "shop"
  ) {
    redirect("/");
  }

  // Build WordPress URI from slug segments, e.g. ["about"] → "/about/"
  const uri =
    !slugSegments || slugSegments.length === 0
      ? "/"
      : `/${slugSegments.join("/")}/`;

  if (slugSegments?.length === 1) {
    const slug = slugSegments[0];
    const builderPages = await readBuilderCustomPages();
    const builderPage = builderPages.find((page) => page.slug === slug);

    if (builderPage) {
      const [layout, shellSettings] = await Promise.all([
        getPublishedBuilderLayout(builderPage.key as BuilderCustomPageKey),
        getBuilderShellSettings(),
      ]);
      const headerDocumentSettings = await getPublishedHeaderDocumentSettings(shellSettings);
      const cookieStore = await cookies();
      const languageCookie = cookieStore.get("website_content_language_root")?.value;
      const activeContentLanguage = ["hy", "en", "ru"].includes(languageCookie as never)
        ? languageCookie!
        : "hy";

      const localizedLayout = layout
        ? {
            ...layout,
            sections: resolveContentSections(
              layout.sections as never,
              activeContentLanguage,
              "hy",
            ) as typeof layout.sections,
          }
        : layout;
      const materialization = localizedLayout
        ? await materializeBuilderDynamicContent(localizedLayout)
        : null;
      const renderLayout = materialization?.renderLayout ?? localizedLayout;
      materialization?.diagnostics
        .filter((diagnostic) => diagnostic.status === "fallback")
        .forEach((diagnostic) => {
          console.warn("[dynamic-content] root storefront fallback", diagnostic);
        });

      if (renderLayout?.sections?.some((section) => section.visible)) {
        return (
          <StorefrontBuilderRenderer
            layout={renderLayout}
            page={builderPage.key}
            pageLabel={builderPage.title}
            breadcrumbItems={[
              { label: "Home", href: "/" },
              { label: builderPage.title, href: `/${builderPage.slug}` },
            ]}
            headerOverlay={headerDocumentSettings.overlay}
            shellSettings={shellSettings}
          />
        );
      }

      return (
        <main className="page">
          <h1 className="page-title">{builderPage.title}</h1>
          <p className="page-subtitle">
            Publish this builder page from the dashboard to show its layout.
          </p>
        </main>
      );
    }

    try {
      const post = await renderCanonicalPost(slug);
      if (post) return post;
    } catch (error) {
      console.error("[wordpress/post] singular resolution failed", error);
    }
  }

  // Fetch page by URI from WordPress via GraphQL
  let data: PageByUriResult;

  try {
    data = await graphqlFetch<PageByUriResult>(`
      query {
        pageBy(uri: "${uri}") {
          title
          uri
          content
        }
      }
    `);
  } catch (error: any) {
    throw error;
  }

  const page = data.pageBy;

  if (!page) {
    return (
      <main className="page">
        <h1 className="page-title">Page not found</h1>
        <p className="page-subtitle">
          We couldn&apos;t find this page in WordPress.
        </p>
        <Link href="/" className="home-section-link">
          ← Back to store
        </Link>
      </main>
    );
  }

  return (
    <main className="page">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: page.title, href: page.uri || uri },
        ]}
      />

      <h1 className="page-title">{page.title}</h1>

      <article
        className="prose"
        dangerouslySetInnerHTML={{ __html: page.content ?? "" }}
      />
    </main>
  );
}
