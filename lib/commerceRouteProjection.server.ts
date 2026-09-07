import type { StorefrontBuilderRendererProps } from "@/components/builder/StorefrontBuilderRenderer";
import type { BuilderDataScope, BuilderLayout } from "@/lib/builderLayouts";
import type { DynamicItemContext } from "@/lib/dynamicContent";
import { resolveLayout, type RouteTaxonomyTerm, type SingularRouteContext } from "@/lib/layoutRouting";
import {
  ensureProductCategoryRoutingCompatibility,
  ensureProductSingleRoutingCompatibility,
  getBuilderLayoutByDocumentId,
} from "@/lib/layoutRoutingStore.server";
import type { CommerceRouteAlias } from "@/lib/navigationTargets";
import { getCanonicalProductCategoryBySlug, projectProductCategoryRouteContext } from "@/lib/productCategoryContext.server";
import { getCanonicalProductSingularBySlug } from "@/lib/productSingularContext.server";
import type { SaaSWebsite } from "@/lib/websites";
import { resolveWooCommerceTermContexts } from "@/lib/woocommerceTermContentProvider.server";

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
  pageNumber?: number;
  requestProductTagSlugs?: string[];
}): Promise<CommerceRouteProjection | null> {
  if (input.alias.pageKey === "product-category") {
    const [resolved, requestTagContexts] = await Promise.all([
      getCanonicalProductCategoryBySlug(input.alias.target.slug, input.website),
      Promise.all((input.requestProductTagSlugs ?? []).map((slug) => resolveWooCommerceTermContexts({
        website: input.website,
        descriptor: { provider: "woocommerce", source: "product-tag", mode: "single", query: { slug } },
      }).catch(() => []))).then((groups) => groups.flat()),
    ]);
    if (!resolved) return null;
    const requestTaxonomyTerms: RouteTaxonomyTerm[] = requestTagContexts.flatMap((context) => {
      const value = context.fields.slug?.value;
      return context.id !== undefined && typeof value === "string"
        ? [{ taxonomy: "product_tag", id: String(context.id), slug: value }]
        : [];
    });
    const routeContext = projectProductCategoryRouteContext(resolved.category, input.alias.path, {
      pageNumber: input.pageNumber,
      requestTaxonomyTerms,
    });
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
    const templatePageSize = resolution.outcome === "routing-template"
      ? resolution.template.postsPerPage
      : undefined;
    const pageSize = templatePageSize ?? resolved.products.length;
    const pageOffset = Math.max(0, (input.pageNumber ?? 1) - 1) * pageSize;
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
        products: templatePageSize ? resolved.products.slice(pageOffset, pageOffset + templatePageSize) : resolved.products,
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
