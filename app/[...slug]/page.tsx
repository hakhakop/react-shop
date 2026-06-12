// wc-store/app/[...slug]/page.tsx
import Link from "next/link";
import { redirect } from "next/navigation";
import { graphqlFetch } from "../../lib/graphql";
import Breadcrumbs from "../../components/Breadcrumbs";
import StorefrontBuilderRenderer from "../../components/builder/StorefrontBuilderRenderer";
import {
  getPublishedBuilderLayout,
  readBuilderCustomPages,
  type BuilderCustomPageKey,
} from "../../lib/builderLayouts";

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

export default async function WPPage({
  params,
}: {
  params: Promise<WPPageParams>;
}) {
  // Next 16: params is a Promise → we must await it
  const resolved = await params;
  const slugSegments = resolved.slug;

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
      const layout = await getPublishedBuilderLayout(
        builderPage.key as BuilderCustomPageKey
      );

      if (layout?.sections?.some((section) => section.visible)) {
        return (
          <StorefrontBuilderRenderer
            layout={layout}
            page={builderPage.key}
            pageLabel={builderPage.title}
            breadcrumbItems={[
              { label: "Home", href: "/" },
              { label: builderPage.title, href: `/${builderPage.slug}` },
            ]}
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
