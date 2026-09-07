import type { DynamicContentContextDescriptor } from "@/lib/dynamicContent";

type ImportedSourceRegistration = {
  provider: string;
  source: string;
};

/**
 * Provider ownership for source namespaces emitted by upstream builders.
 *
 * YOOtheme exposes WooCommerce entities beside WordPress entities in one source
 * picker, but that does not make them WPGraphQL-owned. Keep this registry at the
 * provider boundary so importers and renderers do not grow element or route
 * specific branches.
 */
const IMPORTED_SOURCE_REGISTRY: Readonly<Record<string, ImportedSourceRegistration>> = {
  product: { provider: "woocommerce", source: "product" },
  product_cat: { provider: "woocommerce", source: "product-category" },
  product_tag: { provider: "woocommerce", source: "product-tag" },
};

/** YOOtheme custom-query aliases do not necessarily equal taxonomy slugs. */
const IMPORTED_QUERY_REGISTRY: Readonly<Record<string, ImportedSourceRegistration>> = {
  // YOOtheme's Custom Product Categories source is a product_cat taxonomy
  // query. Treating it as product_tag made imported links resolve through the
  // wrong archive and also bypassed the query's hierarchical parent filter.
  "productCats.customProductCats": { provider: "woocommerce", source: "product-category" },
  // On product-category archives YOOtheme names the relation from the active
  // category to its products after the category namespace. It is still a
  // Product collection, not a product_cat term collection.
  "productCats.productCatProduct": { provider: "woocommerce", source: "product" },
};

const asRecord = (value: unknown): Record<string, unknown> | undefined =>
  value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : undefined;

/**
 * YOOtheme stores both executable query values and import provenance in the
 * same descriptor. Provider adapters intentionally accept only their
 * canonical query contract, so project the YOOtheme Custom Products payload
 * once at this boundary instead of teaching every consumer about upstream
 * field names.
 */
const projectWooCommerceProductQuery = (
  query: DynamicContentContextDescriptor["query"],
): DynamicContentContextDescriptor["query"] => {
  const sourceQuery = asRecord(query?.sourceQuery);
  const sourceArguments = asRecord(sourceQuery?.arguments);
  const output: Record<string, unknown> = {};
  const copy = (key: string) => {
    if (query?.[key] !== undefined) output[key] = query[key];
  };
  ["start", "quantity", "order", "direction", "search", "categories", "tags", "featured", "onSale", "stockStatus", "include", "exclude", "routeCategory"].forEach(copy);

  if (output.start === undefined && Number.isInteger(sourceArguments?.offset)) output.start = sourceArguments?.offset;
  if (output.quantity === undefined && Number.isInteger(sourceArguments?.limit)) output.quantity = sourceArguments?.limit;
  if (output.order === undefined && typeof sourceArguments?.order === "string") {
    const order = sourceArguments.order.toLowerCase();
    output.order = order === "menu_order" ? "menuOrder" : order === "views" ? "popularity" : order;
  }
  if (output.direction === undefined && typeof sourceArguments?.order_direction === "string") {
    const direction = sourceArguments.order_direction.toLowerCase();
    // YOOtheme exports `all` for the default direction. Match the existing
    // WooCommerce imported-source adapter instead of passing an invalid enum.
    output.direction = direction === "all" ? "desc" : direction;
  }
  // YOOtheme's Custom Products `terms` array is the selected taxonomy filter.
  // The Product REST adapter's canonical collection contract owns this as a
  // category list (the common Custom Products source used by Panel Slider).
  if (
    output.categories === undefined &&
    Array.isArray(sourceArguments?.terms)
  ) output.categories = sourceArguments.terms;

  return output as DynamicContentContextDescriptor["query"];
};

const projectWooCommerceTermQuery = (
  query: DynamicContentContextDescriptor["query"],
): DynamicContentContextDescriptor["query"] => {
  const sourceQuery = asRecord(query?.sourceQuery);
  const sourceArguments = asRecord(sourceQuery?.arguments);
  // Keep import provenance and requestedFields: the term provider uses the
  // latter to enrich custom fields after fetching the canonical taxonomy.
  const output: Record<string, unknown> = { ...(query ?? {}) };

  if (output.start === undefined && Number.isInteger(sourceArguments?.offset)) {
    output.start = sourceArguments?.offset;
  }
  if (output.quantity === undefined && Number.isInteger(sourceArguments?.limit)) {
    output.quantity = sourceArguments?.limit;
  }
  if (output.parentId === undefined && Number.isInteger(sourceArguments?.id)) {
    output.parentId = sourceArguments?.id;
  }
  if (output.order === undefined && typeof sourceArguments?.order === "string") {
    const order = sourceArguments.order.toLowerCase();
    output.order = order === "term_order" || order === "menu_order" ? "menuOrder" : order;
  }
  if (output.direction === undefined && typeof sourceArguments?.order_direction === "string") {
    const direction = sourceArguments.order_direction.toLowerCase();
    output.direction = direction === "all" ? "asc" : direction;
  }
  // WordPress get_terms(), which owns YOOtheme taxonomy collections, hides
  // empty terms unless the source explicitly says otherwise.
  if (output.hideEmpty === undefined) output.hideEmpty = true;

  return output as DynamicContentContextDescriptor["query"];
};

export function projectImportedDynamicContentProvider(
  descriptor: DynamicContentContextDescriptor,
): DynamicContentContextDescriptor;
export function projectImportedDynamicContentProvider(
  descriptor: undefined,
): undefined;
export function projectImportedDynamicContentProvider(
  descriptor: DynamicContentContextDescriptor | undefined,
): DynamicContentContextDescriptor | undefined;
export function projectImportedDynamicContentProvider(
  descriptor: DynamicContentContextDescriptor | undefined,
): DynamicContentContextDescriptor | undefined {
  if (!descriptor) return undefined;
  if (descriptor.provider !== "wordpress" || descriptor.source !== "content") return descriptor;
  const queryName = descriptor.query?.yoothemeQueryName;
  const queryRegistration = typeof queryName === "string"
    ? IMPORTED_QUERY_REGISTRY[queryName]
    : undefined;
  if (queryRegistration) return {
    ...descriptor,
    ...queryRegistration,
    query: queryRegistration.source === "product-category" || queryRegistration.source === "product-tag"
      ? projectWooCommerceTermQuery(descriptor.query)
      : queryRegistration.source === "product"
        ? projectWooCommerceProductQuery(descriptor.query)
        : descriptor.query,
  };
  const sourceName = descriptor.query?.sourceName;
  if (typeof sourceName !== "string") return descriptor;
  const registration = IMPORTED_SOURCE_REGISTRY[sourceName];
  if (!registration) return descriptor;
  const projected = { ...descriptor, ...registration };
  if (registration.source === "product") {
    return { ...projected, query: projectWooCommerceProductQuery(descriptor.query) };
  }
  if (registration.source === "product-category" || registration.source === "product-tag") {
    return { ...projected, query: projectWooCommerceTermQuery(descriptor.query) };
  }
  return projected;
}
