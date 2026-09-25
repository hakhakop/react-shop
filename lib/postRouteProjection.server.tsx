import Breadcrumbs from "@/components/Breadcrumbs";
import type { StorefrontBuilderRendererProps } from "@/components/builder/StorefrontBuilderRenderer";
import type { BuilderDataScope, BuilderLayout } from "@/lib/builderLayouts";
import type { DynamicItemContext } from "@/lib/dynamicContent";
import { resolveLayout, type SingularRouteContext } from "@/lib/layoutRouting";
import {
  ensurePostSingleRoutingCompatibility,
  getBuilderLayoutByDocumentId,
} from "@/lib/layoutRoutingStore.server";
import { getCanonicalPostSingularBySlug } from "@/lib/postSingularContext.server";
import type { SaaSWebsite } from "@/lib/websites";

export type PostRouteProjection = {
  page: "post-single";
  pageLabel: string;
  layout: BuilderLayout | null;
  dynamicContext: DynamicItemContext;
  rendererProps: Omit<StorefrontBuilderRendererProps, "layout" | "page" | "pageLabel" | "website">;
  fallbackContent: React.ReactNode;
};

/** Resolve the canonical WordPress Post Single route for every delivery mode. */
export async function resolvePostRouteProjection(input: {
  slug: string;
  website?: SaaSWebsite | null;
  scope: BuilderDataScope;
}): Promise<PostRouteProjection | null> {
  const canonical = await getCanonicalPostSingularBySlug(input.slug, input.website);
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
  let layout: BuilderLayout | null = null;
  try {
    const registry = await ensurePostSingleRoutingCompatibility(input.scope);
    const resolution = resolveLayout({
      context,
      individualOverrides: registry.individualOverrides,
      routingTemplates: registry.routingTemplates,
      nativeFallbackAvailable: true,
    });
    layout = resolution.outcome === "individual" || resolution.outcome === "routing-template"
      ? await getBuilderLayoutByDocumentId(resolution.layoutId, input.scope)
      : null;
  } catch (error) {
    console.error("[layout-routing] Post resolution failed", error);
  }
  const breadcrumbItems = [{ label: "Home", href: "/" }, { label: post.title }];

  return {
    page: "post-single",
    pageLabel: post.title,
    layout,
    dynamicContext: canonical.dynamicContext,
    rendererProps: { breadcrumbItems },
    fallbackContent: (
      <main className="page">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: post.title, href: post.uri ?? `/${post.slug}/` }]} />
        <h1 className="page-title">{post.title}</h1>
        {post.featuredImage?.sourceUrl ? <img src={post.featuredImage.sourceUrl} alt={post.featuredImage.altText ?? ""} /> : null}
        <article className="prose" dangerouslySetInnerHTML={{ __html: post.content ?? post.excerpt ?? "" }} />
      </main>
    ),
  };
}
