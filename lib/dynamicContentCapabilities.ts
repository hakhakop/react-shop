import type {
  DynamicContentContextDescriptor,
  DynamicContentValueType,
} from "@/lib/dynamicContent";

export type DynamicContentSourceCapability = {
  key: "static" | "wordpress-post-collection";
  label: string;
  provider?: "wordpress";
  source?: "post";
  mode?: "collection";
  fields?: readonly DynamicContentSourceField[];
};

export type DynamicContentSourceField = {
  path: string;
  label: string;
  valueType: DynamicContentValueType;
};

export type DynamicBindingDestination =
  | "title"
  | "meta"
  | "text"
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
  title: { label: "Title", acceptedTypes: ["string", "richText"] },
  meta: { label: "Meta", acceptedTypes: ["string", "richText"] },
  text: { label: "Content", acceptedTypes: ["string", "richText"] },
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

export const WORDPRESS_POST_COLLECTION_FIELDS: readonly DynamicContentSourceField[] = [
  { path: "title", label: "Title", valueType: "string" },
  { path: "content", label: "Content", valueType: "richText" },
  { path: "excerpt", label: "Excerpt", valueType: "richText" },
  { path: "date", label: "Date", valueType: "string" },
  { path: "modifiedDate", label: "Modified Date", valueType: "string" },
  { path: "meta", label: "Meta", valueType: "metadata" },
  { path: "categories", label: "Categories", valueType: "metadata" },
  { path: "tags", label: "Tags", valueType: "metadata" },
  { path: "featuredImage", label: "Featured Image", valueType: "media" },
  { path: "featuredImage.url", label: "Featured Image URL", valueType: "url" },
  { path: "featuredImage.alt", label: "Featured Image Alt", valueType: "string" },
  { path: "featuredImage.caption", label: "Featured Image Caption", valueType: "richText" },
  { path: "link", label: "Link", valueType: "url" },
  { path: "id", label: "ID", valueType: "identifier" },
] as const;

/**
 * The single source/query capability registry shared by the inspector and
 * server orchestration. Unsupported YOOtheme providers are intentionally not
 * advertised until a provider adapter exists.
 */
export const DYNAMIC_CONTENT_SOURCE_CAPABILITIES: readonly DynamicContentSourceCapability[] = [
  { key: "static", label: "None / Static" },
  {
    key: "wordpress-post-collection",
    label: "Custom Posts",
    provider: "wordpress",
    source: "post",
    mode: "collection",
    fields: WORDPRESS_POST_COLLECTION_FIELDS,
  },
] as const;

export const WORDPRESS_POST_COLLECTION_SOURCE =
  DYNAMIC_CONTENT_SOURCE_CAPABILITIES[1];

export function dynamicContentSourceKey(
  descriptor: DynamicContentContextDescriptor | null | undefined,
): DynamicContentSourceCapability["key"] {
  if (!descriptor) return "static";
  if (
    descriptor?.provider === WORDPRESS_POST_COLLECTION_SOURCE.provider &&
    descriptor.source === WORDPRESS_POST_COLLECTION_SOURCE.source &&
    descriptor.mode === WORDPRESS_POST_COLLECTION_SOURCE.mode
  ) {
    return WORDPRESS_POST_COLLECTION_SOURCE.key;
  }
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
