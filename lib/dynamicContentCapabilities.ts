import type {
  DynamicContentContextDescriptor,
  DynamicContentValueType,
} from "@/lib/dynamicContent";
import { wordPressPostAcfSourceFields } from "@/lib/wordpressDynamicContentFields";

export type DynamicContentSourceCapability = {
  key: string;
  label: string;
  provider?: string;
  source?: string;
  mode?: "collection" | "single";
  fields?: readonly DynamicContentSourceField[];
  queryControls?: readonly DynamicContentQueryControl[];
  defaultQuery?: DynamicContentContextDescriptor["query"];
};

export type DynamicContentSourceField = {
  path: string;
  label: string;
  valueType: DynamicContentValueType;
};

export type DynamicContentQueryControl = {
  key: string;
  label: string;
  control: "integer" | "text" | "list" | "select";
  minimum?: number;
  placeholder?: string;
  description?: string;
  options?: readonly { value: string; label: string }[];
};

export type DynamicBindingDestination =
  | "headingText"
  | "body"
  | "eyebrow"
  | "alertLinkUrl"
  | "title"
  | "meta"
  | "text"
  | "content"
  | "label"
  | "url"
  | "linkUrl"
  | "linkLabel"
  | "imageUrl"
  | "imageAlt"
  | "buttonLabel"
  | "buttonUrl";

export type DynamicBindingDestinationCapability = {
  label: string;
  acceptedTypes: readonly DynamicContentValueType[];
};

export const DYNAMIC_BINDING_DESTINATION_CAPABILITIES: Readonly<
  Record<DynamicBindingDestination, DynamicBindingDestinationCapability>
> = {
  headingText: { label: "Content", acceptedTypes: ["string", "richText"] },
  body: { label: "Content", acceptedTypes: ["string", "richText"] },
  eyebrow: { label: "Meta", acceptedTypes: ["string"] },
  alertLinkUrl: { label: "Link URL", acceptedTypes: ["url"] },
  title: { label: "Title", acceptedTypes: ["string", "richText"] },
  meta: { label: "Meta", acceptedTypes: ["string", "richText"] },
  text: { label: "Content", acceptedTypes: ["string", "richText"] },
  content: { label: "Content", acceptedTypes: ["string", "richText"] },
  label: { label: "Label", acceptedTypes: ["string", "richText"] },
  url: { label: "Link URL", acceptedTypes: ["url"] },
  linkUrl: { label: "Link URL", acceptedTypes: ["url"] },
  linkLabel: { label: "Link Text", acceptedTypes: ["string", "richText"] },
  imageUrl: { label: "Image", acceptedTypes: ["url"] },
  imageAlt: { label: "Image Alt", acceptedTypes: ["string", "richText"] },
  buttonLabel: { label: "Button Label", acceptedTypes: ["string", "richText"] },
  buttonUrl: { label: "Button URL", acceptedTypes: ["url"] },
};

export function dynamicBindingDestinationCapability(
  destination: string,
): DynamicBindingDestinationCapability | undefined {
  return DYNAMIC_BINDING_DESTINATION_CAPABILITIES[
    destination as DynamicBindingDestination
  ];
}

const sourceIdentity = (value: unknown) => {
  const compact = typeof value === "string"
    ? value.replace(/[^0-9A-Za-z]/g, "").toLowerCase()
    : "";
  return compact.endsWith("ies")
    ? `${compact.slice(0, -3)}y`
    : compact.endsWith("s") && !compact.endsWith("ss")
      ? compact.slice(0, -1)
      : compact;
};

export function dynamicContentCapabilityMatchesDescriptor(
  candidate: DynamicContentSourceCapability,
  descriptor: DynamicContentContextDescriptor | null | undefined,
): boolean {
  if (!descriptor) return false;
  if (
    candidate.provider !== descriptor.provider ||
    candidate.source !== descriptor.source ||
    candidate.mode !== descriptor.mode
  ) return false;
  if (candidate.source !== "content") return true;

  const candidateQuery = candidate.defaultQuery ?? {};
  const descriptorQuery = descriptor.query ?? {};
  if (
    candidateQuery.sourceName === descriptorQuery.sourceName ||
    candidateQuery.graphqlPluralName === descriptorQuery.graphqlPluralName ||
    candidateQuery.graphqlPluralName === descriptorQuery.graphqlRoot
  ) return true;

  const namespace = typeof descriptorQuery.yoothemeQueryName === "string"
    ? descriptorQuery.yoothemeQueryName.split(".")[0]
    : descriptorQuery.graphqlRoot;
  const importedIdentity = sourceIdentity(namespace);
  return Boolean(importedIdentity && [
    candidateQuery.sourceName,
    candidateQuery.graphqlSingleName,
    candidateQuery.graphqlPluralName,
  ].some((value) => sourceIdentity(value) === importedIdentity));
}

export const WORDPRESS_POST_COLLECTION_FIELDS: readonly DynamicContentSourceField[] = [
  { path: "title", label: "Title", valueType: "string" },
  { path: "content", label: "Content", valueType: "richText" },
  // YOOtheme exposes the WordPress excerpt as the authored "Teaser" field.
  // Keep the canonical provider path while matching that field vocabulary in
  // every element's dynamic picker.
  { path: "excerpt", label: "Teaser", valueType: "richText" },
  { path: "date", label: "Date", valueType: "string" },
  { path: "modifiedDate", label: "Modified Date", valueType: "string" },
  { path: "meta", label: "Meta", valueType: "metadata" },
  { path: "categories", label: "Categories", valueType: "metadata" },
  { path: "categories.label", label: "Category Names", valueType: "string" },
  { path: "tags", label: "Tags", valueType: "metadata" },
  { path: "tags.label", label: "Tag Names", valueType: "string" },
  { path: "featuredImage", label: "Featured Image", valueType: "media" },
  { path: "featuredImage.url", label: "Featured Image URL", valueType: "url" },
  { path: "featuredImage.alt", label: "Featured Image Alt", valueType: "string" },
  { path: "featuredImage.caption", label: "Featured Image Caption", valueType: "richText" },
  { path: "link", label: "Link", valueType: "url" },
  { path: "id", label: "ID", valueType: "identifier" },
  ...wordPressPostAcfSourceFields().map(({ path, label, valueType }) => ({ path, label, valueType })),
] as const;

export const WOOCOMMERCE_PRODUCT_FIELDS: readonly DynamicContentSourceField[] = [
  { path: "id", label: "ID", valueType: "identifier" },
  { path: "databaseId", label: "Database ID", valueType: "identifier" },
  { path: "title", label: "Title", valueType: "string" },
  { path: "description", label: "Description", valueType: "richText" },
  { path: "excerpt", label: "Excerpt", valueType: "richText" },
  { path: "slug", label: "Slug", valueType: "string" },
  { path: "link", label: "Product URL", valueType: "url" },
  { path: "image", label: "Image", valueType: "media" },
  { path: "image.url", label: "Image URL", valueType: "url" },
  { path: "image.alt", label: "Image Alt", valueType: "string" },
  { path: "gallery", label: "Gallery", valueType: "metadata" },
  { path: "price", label: "Price", valueType: "string" },
  { path: "price.amount", label: "Price Amount", valueType: "number" },
  { path: "regularPrice", label: "Regular Price", valueType: "string" },
  { path: "regularPrice.amount", label: "Regular Price Amount", valueType: "number" },
  { path: "salePrice", label: "Sale Price", valueType: "string" },
  { path: "salePrice.amount", label: "Sale Price Amount", valueType: "number" },
  { path: "sku", label: "SKU", valueType: "string" },
  { path: "stockStatus", label: "Stock Status", valueType: "string" },
  { path: "stockQuantity", label: "Stock Quantity", valueType: "number" },
  { path: "categories", label: "Categories", valueType: "metadata" },
  { path: "categories.label", label: "Category Labels", valueType: "string" },
  { path: "tags", label: "Tags", valueType: "metadata" },
  { path: "attributes", label: "Attributes", valueType: "metadata" },
  { path: "meta", label: "Product Metadata", valueType: "metadata" },
] as const;

const WOOCOMMERCE_PRODUCT_COLLECTION_QUERY_CONTROLS: readonly DynamicContentQueryControl[] = [
  { key: "start", label: "Start", control: "integer", minimum: 0, placeholder: "0" },
  { key: "quantity", label: "Quantity", control: "integer", minimum: 1, placeholder: "10" },
  { key: "order", label: "Order", control: "select", options: [
    { value: "date", label: "Date" }, { value: "title", label: "Title" },
    { value: "price", label: "Price" }, { value: "menuOrder", label: "Menu Order" },
    { value: "id", label: "ID" }, { value: "popularity", label: "Popularity" },
    { value: "rating", label: "Rating" },
  ] },
  { key: "direction", label: "Direction", control: "select", options: [
    { value: "desc", label: "Descending" }, { value: "asc", label: "Ascending" },
  ] },
  { key: "search", label: "Search", control: "text", placeholder: "Product search" },
  { key: "categories", label: "Categories", control: "list", placeholder: "3, 7", description: "Comma-separated WooCommerce category IDs." },
  { key: "featured", label: "Featured", control: "select", options: [{ value: "", label: "Any" }, { value: "true", label: "Yes" }, { value: "false", label: "No" }] },
  { key: "onSale", label: "On Sale", control: "select", options: [{ value: "", label: "Any" }, { value: "true", label: "Yes" }, { value: "false", label: "No" }] },
  { key: "stockStatus", label: "Stock Status", control: "select", options: [
    { value: "", label: "Any" },
    { value: "instock", label: "In stock" }, { value: "outofstock", label: "Out of stock" }, { value: "onbackorder", label: "On backorder" },
  ] },
  { key: "include", label: "Include", control: "list", placeholder: "41, 42", description: "Comma-separated WooCommerce product IDs." },
  { key: "exclude", label: "Exclude", control: "list", placeholder: "99", description: "Comma-separated WooCommerce product IDs." },
] as const;

const WOOCOMMERCE_PRODUCT_SINGLE_QUERY_CONTROLS: readonly DynamicContentQueryControl[] = [
  { key: "slug", label: "Slug", control: "text", placeholder: "product-slug" },
  { key: "id", label: "Numeric ID", control: "integer", minimum: 1, placeholder: "41" },
] as const;

/**
 * The single source/query capability registry shared by the inspector and
 * server orchestration. Query controls are declared alongside each source so
 * authoring remains a projection of the canonical provider contract.
 */
export const DYNAMIC_CONTENT_SOURCE_CAPABILITIES: readonly DynamicContentSourceCapability[] = [
  { key: "static", label: "None / Static" },
  {
    key: "wordpress-post-collection",
    label: "Posts",
    provider: "wordpress",
    source: "post",
    mode: "collection",
    fields: WORDPRESS_POST_COLLECTION_FIELDS,
  },
  {
    key: "wordpress-archive-post-collection",
    label: "Archive Posts",
    provider: "wordpress",
    source: "post",
    mode: "collection",
    fields: WORDPRESS_POST_COLLECTION_FIELDS,
    defaultQuery: { archive: "collection" },
  },
  {
    key: "wordpress-archive-post-single",
    label: "Archive Post",
    provider: "wordpress",
    source: "post",
    mode: "collection",
    fields: WORDPRESS_POST_COLLECTION_FIELDS,
    defaultQuery: { archive: "single", quantity: 1 },
  },
  {
    key: "woocommerce-product-collection",
    label: "Custom Products",
    provider: "woocommerce",
    source: "product",
    mode: "collection",
    fields: WOOCOMMERCE_PRODUCT_FIELDS,
    queryControls: WOOCOMMERCE_PRODUCT_COLLECTION_QUERY_CONTROLS,
  },
  {
    key: "woocommerce-product-single",
    label: "Product",
    provider: "woocommerce",
    source: "product",
    mode: "single",
    fields: WOOCOMMERCE_PRODUCT_FIELDS,
    queryControls: WOOCOMMERCE_PRODUCT_SINGLE_QUERY_CONTROLS,
  },
] as const;

export const WORDPRESS_POST_COLLECTION_SOURCE =
  DYNAMIC_CONTENT_SOURCE_CAPABILITIES.find((source) => source.key === "wordpress-post-collection")!;

export const WOOCOMMERCE_PRODUCT_COLLECTION_SOURCE =
  DYNAMIC_CONTENT_SOURCE_CAPABILITIES.find((source) => source.key === "woocommerce-product-collection")!;

export const WOOCOMMERCE_PRODUCT_SINGLE_SOURCE =
  DYNAMIC_CONTENT_SOURCE_CAPABILITIES.find((source) => source.key === "woocommerce-product-single")!;

export function dynamicContentSourceKey(
  descriptor: DynamicContentContextDescriptor | null | undefined,
): string {
  if (!descriptor) return "static";
  if (descriptor.provider === "wordpress" && descriptor.source === "post" && descriptor.mode === "collection") {
    if (descriptor.query?.archive === "single") return "wordpress-archive-post-single";
    if (descriptor.query?.archive === "collection") return "wordpress-archive-post-collection";
  }
  const capability = DYNAMIC_CONTENT_SOURCE_CAPABILITIES.find(
    (candidate) =>
      candidate.provider === descriptor.provider &&
      candidate.source === descriptor.source &&
      candidate.mode === descriptor.mode,
  );
  if (capability) return capability.key;
  return "static";
}

export function dynamicContentSourceCapability(
  descriptor: DynamicContentContextDescriptor | null | undefined,
) {
  const key = dynamicContentSourceKey(descriptor);
  return DYNAMIC_CONTENT_SOURCE_CAPABILITIES.find((capability) => capability.key === key);
}

export function dynamicContentSourceFields(
  descriptor: DynamicContentContextDescriptor | null | undefined,
): readonly DynamicContentSourceField[] {
  return dynamicContentSourceCapability(descriptor)?.fields ?? [];
}
