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
    output.order = order === "menu_order" ? "menuOrder" : order;
  }
  if (output.direction === undefined && typeof sourceArguments?.order_direction === "string") {
    output.direction = sourceArguments.order_direction.toLowerCase();
  }
  // YOOtheme's Custom Products `terms` array is the selected taxonomy filter.
  // The Product REST adapter's canonical collection contract owns this as a
  // category list (the common Custom Products source used by Panel Slider).
  if (
    output.categories === undefined &&
    Array.isArray(sourceArguments?.terms)
  ) output.categories = sourceArguments.terms;

  return output;
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
  const sourceName = descriptor.query?.sourceName;
  if (typeof sourceName !== "string") return descriptor;
  const registration = IMPORTED_SOURCE_REGISTRY[sourceName];
  if (!registration) return descriptor;
  const projected = { ...descriptor, ...registration };
  return registration.source === "product"
    ? { ...projected, query: projectWooCommerceProductQuery(descriptor.query) }
    : projected;
}
