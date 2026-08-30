import type { StorefrontBuilderRendererProps } from "@/components/builder/StorefrontBuilderRenderer";
import type { BuilderDataScope, BuilderLayout } from "@/lib/builderLayouts";
import type { DynamicItemContext } from "@/lib/dynamicContent";
import { resolveLayout, type ArchiveRouteContext, type SingularRouteContext } from "@/lib/layoutRouting";
import {
  ensureProductCategoryRoutingCompatibility,
  ensureProductSingleRoutingCompatibility,
  getBuilderLayoutByDocumentId,
} from "@/lib/layoutRoutingStore.server";
import type { CommerceRouteAlias } from "@/lib/navigationTargets";
import { getCanonicalProductCategoryBySlug } from "@/lib/productCategoryContext.server";
import { getCanonicalProductSingularBySlug } from "@/lib/productSingularContext.server";
import type { SaaSWebsite } from "@/lib/websites";

export type CommerceRouteProjection = {
  page: "product-category" | "product-single";
  pageLabel: string;
  layout: BuilderLayout | null;
  dynamicContext?: DynamicItemContext;
  rendererProps: Omit<StorefrontBuilderRendererProps, "layout" | "page" | "pageLabel" | "website">;
};

export async function resolveCommerceRouteProjection(input: {
  alias: CommerceRouteAlias;
  website: SaaSWebsite;
  scope: BuilderDataScope;
}): Promise<CommerceRouteProjection | null> {
  if (input.alias.pageKey === "product-category") {
    const resolved = await getCanonicalProductCategoryBySlug(input.alias.target.slug, input.website);
    if (!resolved) return null;
    const routeContext: ArchiveRouteContext = {
      view: "archive",
      pageType: "taxonomy:product_cat",
      provider: "woocommerce",
      contentType: "product-category",
      contentId: String(resolved.category.id),
      databaseId: resolved.category.id,
      slug: resolved.category.slug,
      uri: input.alias.path,
      taxonomyTerms: [
        { taxonomy: "product_cat", id: String(resolved.category.id), slug: resolved.category.slug },
        ...resolved.category.ancestry.map((category) => ({ taxonomy: "product_cat", id: String(category.id), slug: category.slug })),
      ],
    };
    const registry = await ensureProductCategoryRoutingCompatibility(input.scope);
    const resolution = resolveLayout({
      context: routeContext,
      individualOverrides: registry.individualOverrides,
      routingTemplates: registry.routingTemplates,
      nativeFallbackAvailable: false,
    });
    const layout = resolution.outcome === "individual" || resolution.outcome === "routing-template"
      ? await getBuilderLayoutByDocumentId(resolution.layoutId, input.scope)
      : null;
    return {
      page: "product-category",
      pageLabel: resolved.category.name,
      layout,
      dynamicContext: resolved.dynamicContext,
      rendererProps: {
        breadcrumbItems: [
          { label: "Home", href: "/" },
          { label: "Shop", href: "/shop" },
          ...resolved.category.ancestry.map((category) => ({ label: category.name })),
          { label: resolved.category.name },
        ],
        products: resolved.products,
        categoryTree: resolved.categoryTree,
        activeCategorySlug: resolved.category.slug,
      },
    };
  }

  const canonical = await getCanonicalProductSingularBySlug(input.alias.target.slug, input.website);
  if (!canonical) return null;
  const product = canonical.product;
  const routeContext: SingularRouteContext = {
    view: "singular",
    pageType: "singular:product",
    provider: "woocommerce",
    contentType: "product",
    contentId: product.id,
    ...(product.databaseId != null ? { databaseId: product.databaseId } : {}),
    slug: product.slug,
    uri: input.alias.path,
    taxonomyTerms: canonical.taxonomyTerms,
  };
  const registry = await ensureProductSingleRoutingCompatibility(input.scope);
  const resolution = resolveLayout({
    context: routeContext,
    individualOverrides: registry.individualOverrides,
    routingTemplates: registry.routingTemplates,
    nativeFallbackAvailable: true,
  });
  const layout = resolution.outcome === "individual" || resolution.outcome === "routing-template"
    ? await getBuilderLayoutByDocumentId(resolution.layoutId, input.scope)
    : null;
  const priceNumber = product.price ? Number.parseFloat(product.price) : null;
  return {
    page: "product-single",
    pageLabel: product.name,
    layout,
    dynamicContext: canonical.dynamicContext,
    rendererProps: {
      breadcrumbItems: [
        { label: "Home", href: "/" },
        { label: "Shop", href: "/shop" },
        { label: product.name },
      ],
      product: {
        id: product.id,
        slug: product.slug,
        name: product.name,
        description: product.description,
        priceNumber: priceNumber !== null && Number.isFinite(priceNumber) ? priceNumber : null,
        priceFormatted: product.price ?? null,
        imageUrl: product.image?.sourceUrl,
        images: [
          ...(product.image?.sourceUrl ? [product.image] : []),
          ...(product.galleryImages?.nodes ?? []).filter((image) => image.sourceUrl !== product.image?.sourceUrl),
        ],
        attributes: product.attributes?.nodes ?? [],
      },
    },
  };
}
