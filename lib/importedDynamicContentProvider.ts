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
  return registration ? { ...descriptor, ...registration } : descriptor;
}
