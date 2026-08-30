import type { DynamicContentContextDescriptor } from "@/lib/dynamicContent";

export type TemplateAssignmentFilterKind =
  | "content-identity"
  | "taxonomy-term"
  | "request-taxonomy-term"
  | "page-number"
  | "language";

export type TemplatePageTypeDefinition = {
  /** Stable registration key. Providers register capabilities, not templates. */
  id: string;
  label: string;
  group: string;
  view: "singular" | "archive";
  provider: string;
  contentType: string;
  source: string;
  sourceKind: "content" | "taxonomy" | "system";
  filters: readonly TemplateAssignmentFilterKind[];
  previewDescriptor?: DynamicContentContextDescriptor;
  taxonomy?: string;
  defaultStorefrontHref?: string;
};

const definition = (
  value: Omit<TemplatePageTypeDefinition, "group"> & { group?: string },
): TemplatePageTypeDefinition => ({ ...value, group: value.group ?? value.label });

/**
 * Offline-safe registrations. Connected WordPress schemas extend this catalog
 * on the server with every exposed post type and taxonomy.
 */
export const BUILTIN_TEMPLATE_PAGE_TYPES: readonly TemplatePageTypeDefinition[] = [
  definition({
    id: "singular:post", label: "Single Post", view: "singular", provider: "wordpress",
    contentType: "post", source: "post", sourceKind: "content",
    filters: ["taxonomy-term", "language"],
    previewDescriptor: { provider: "wordpress", source: "post", mode: "collection", query: { quantity: 24, order: "date", direction: "desc", filters: {} } },
  }),
  definition({
    id: "singular:page", label: "Single Page", view: "singular", provider: "wordpress",
    contentType: "page", source: "content", sourceKind: "content",
    filters: ["content-identity", "language"],
    previewDescriptor: { provider: "wordpress", source: "content", mode: "collection", query: { sourceKind: "contentType", sourceName: "page", graphqlSingleName: "page", graphqlPluralName: "pages", quantity: 24 } },
  }),
  definition({
    id: "singular:product", label: "Single Product", view: "singular", provider: "woocommerce",
    contentType: "product", source: "product", sourceKind: "content",
    filters: ["taxonomy-term", "language"],
    previewDescriptor: { provider: "woocommerce", source: "product", mode: "collection", query: { quantity: 24, order: "date", direction: "desc" } },
  }),
  definition({
    id: "archive:post", label: "Posts Archive", view: "archive", provider: "wordpress",
    contentType: "post-archive", source: "post", sourceKind: "content",
    filters: ["page-number", "language"], defaultStorefrontHref: "/blog",
  }),
  definition({
    id: "archive:product", label: "Products Archive", view: "archive", provider: "woocommerce",
    contentType: "product-archive", source: "product", sourceKind: "content",
    filters: ["page-number", "language"], defaultStorefrontHref: "/shop",
  }),
  definition({
    id: "taxonomy:category", label: "Category Archive", view: "archive", provider: "wordpress",
    contentType: "post-category", source: "content", sourceKind: "taxonomy", taxonomy: "category",
    filters: ["taxonomy-term", "request-taxonomy-term", "page-number", "language"],
    previewDescriptor: { provider: "wordpress", source: "content", mode: "collection", query: { sourceKind: "taxonomy", sourceName: "category", graphqlSingleName: "category", graphqlPluralName: "categories", quantity: 24 } },
  }),
  definition({
    id: "taxonomy:post_tag", label: "Tag Archive", view: "archive", provider: "wordpress",
    contentType: "post-tag", source: "content", sourceKind: "taxonomy", taxonomy: "post_tag",
    filters: ["taxonomy-term", "request-taxonomy-term", "page-number", "language"],
    previewDescriptor: { provider: "wordpress", source: "content", mode: "collection", query: { sourceKind: "taxonomy", sourceName: "post_tag", graphqlSingleName: "tag", graphqlPluralName: "tags", quantity: 24 } },
  }),
  definition({
    id: "taxonomy:product_cat", label: "Product Category Archive", view: "archive", provider: "woocommerce",
    contentType: "product-category", source: "product-category", sourceKind: "taxonomy", taxonomy: "product_cat",
    filters: ["taxonomy-term", "request-taxonomy-term", "page-number", "language"],
  }),
  definition({
    id: "taxonomy:product_tag", label: "Product Tag Archive", view: "archive", provider: "woocommerce",
    contentType: "product-tag", source: "content", sourceKind: "taxonomy", taxonomy: "product_tag",
    filters: ["taxonomy-term", "request-taxonomy-term", "page-number", "language"],
  }),
  definition({
    id: "taxonomy:product_brand", label: "Brand Archive", view: "archive", provider: "woocommerce",
    contentType: "product-brand", source: "content", sourceKind: "taxonomy", taxonomy: "product_brand",
    filters: ["taxonomy-term", "request-taxonomy-term", "page-number", "language"],
  }),
  definition({
    id: "archive:author", label: "Author Archive", view: "archive", provider: "wordpress",
    contentType: "author-archive", source: "author", sourceKind: "system",
    filters: ["page-number", "language"],
  }),
  definition({
    id: "archive:date", label: "Date Archive", view: "archive", provider: "wordpress",
    contentType: "date-archive", source: "date", sourceKind: "system",
    filters: ["page-number", "language"],
  }),
  definition({
    id: "system:search", label: "Search", view: "archive", provider: "wordpress",
    contentType: "search", source: "search", sourceKind: "system", filters: ["language"],
  }),
  definition({
    id: "system:live-search", label: "Live Search", view: "archive", provider: "wordpress",
    contentType: "live-search", source: "live-search", sourceKind: "system", filters: ["language"],
  }),
  definition({
    id: "system:error-404", label: "Error 404", view: "archive", provider: "system",
    contentType: "error-404", source: "error-404", sourceKind: "system", filters: [],
  }),
] as const;

export function legacyTemplatePageType(view: "singular" | "archive", contentType: string) {
  const direct = BUILTIN_TEMPLATE_PAGE_TYPES.find((item) =>
    item.view === view && item.contentType === contentType,
  );
  if (direct) return direct.id;
  return view === "singular" ? `singular:${contentType}` : `archive:${contentType}`;
}

export function findTemplatePageType(
  pageTypes: readonly TemplatePageTypeDefinition[],
  id: string,
) {
  return pageTypes.find((item) => item.id === id);
}
