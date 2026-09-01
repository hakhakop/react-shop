import type {
  DynamicContentContextDescriptor,
  DynamicContentData,
  DynamicItemContext,
  DynamicItemContextValue,
} from "@/lib/dynamicContent";
import { getWooCommerceConnection, wooCommerceFetch } from "@/lib/woocommerce";
import type { SaaSWebsite } from "@/lib/websites";

type WooCommerceTermRecord = {
  id?: unknown;
  name?: unknown;
  slug?: unknown;
  description?: unknown;
  parent?: unknown;
  count?: unknown;
  image?: { id?: unknown; src?: unknown; alt?: unknown } | null;
};

const isRecord = (value: unknown): value is Record<string, DynamicContentData> =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);
const text = (value: unknown) => typeof value === "string" ? value : undefined;
const identifier = (value: unknown) =>
  typeof value === "number" && Number.isFinite(value) || typeof value === "string" && value.length > 0
    ? value as string | number
    : undefined;
const positiveInteger = (value: unknown) => {
  const number = Number(value);
  return Number.isInteger(number) && number > 0 ? number : undefined;
};
const setField = (
  fields: Record<string, DynamicItemContextValue>,
  key: string,
  value: DynamicItemContextValue | undefined,
) => {
  if (value !== undefined) fields[key] = value;
};

const registration = (source: string) => source === "product-category"
  ? { endpoint: "products/categories", taxonomy: "product_cat", route: "product-category", kind: "product-category" }
  : source === "product-tag"
    ? { endpoint: "products/tags", taxonomy: "product_tag", route: "product-tag", kind: "product-tag" }
    : null;

const normalizeTerm = (
  term: WooCommerceTermRecord,
  owner: NonNullable<ReturnType<typeof registration>>,
): DynamicItemContext => {
  const fields: Record<string, DynamicItemContextValue> = {};
  const id = identifier(term.id);
  const name = text(term.name);
  const slug = text(term.slug);
  const description = text(term.description);
  const link = slug ? `/${owner.route}/${encodeURIComponent(slug)}` : undefined;
  if (id !== undefined) {
    setField(fields, "id", { type: "identifier", value: id });
    setField(fields, "databaseId", { type: "identifier", value: id });
    setField(fields, "termId", { type: "identifier", value: id });
  }
  if (name !== undefined) {
    setField(fields, "name", { type: "string", value: name });
    setField(fields, "title", { type: "string", value: name });
  }
  if (slug !== undefined) {
    setField(fields, "slug", { type: "string", value: slug });
    setField(fields, "termSlug", { type: "string", value: slug });
  }
  if (description !== undefined) setField(fields, "description", { type: "richText", value: description });
  if (link !== undefined) setField(fields, "link", { type: "url", value: link });
  setField(fields, "kind", { type: "string", value: owner.kind });
  setField(fields, "taxonomy", { type: "string", value: owner.taxonomy });
  const imageUrl = text(term.image?.src);
  const imageAlt = text(term.image?.alt);
  if (imageUrl) {
    setField(fields, "image.url", { type: "url", value: imageUrl });
    setField(fields, "thumbnail.url", { type: "url", value: imageUrl });
    setField(fields, "image", { type: "media", value: {
      url: imageUrl,
      ...(identifier(term.image?.id) !== undefined ? { id: identifier(term.image?.id) } : {}),
      ...(imageAlt !== undefined ? { alt: imageAlt } : {}),
    } });
  }
  if (imageAlt !== undefined) {
    setField(fields, "image.alt", { type: "string", value: imageAlt });
    setField(fields, "thumbnail.alt", { type: "string", value: imageAlt });
  }
  return { ...(id !== undefined ? { id } : {}), fields };
};

export async function resolveWooCommerceTermContexts(input: {
  website?: SaaSWebsite | null;
  descriptor: DynamicContentContextDescriptor;
}): Promise<DynamicItemContext[]> {
  const owner = registration(input.descriptor.source);
  if (input.descriptor.provider !== "woocommerce" || !owner) {
    throw new Error(`WooCommerce term adapter cannot handle ${input.descriptor.provider}/${input.descriptor.source}.`);
  }
  const query = isRecord(input.descriptor.query) ? input.descriptor.query : {};
  const connection = getWooCommerceConnection(input.website);
  const id = positiveInteger(query.databaseId ?? query.id);
  const slug = text(query.slug);
  let terms: WooCommerceTermRecord[];
  if (id) {
    terms = [await wooCommerceFetch<WooCommerceTermRecord>(connection, `${owner.endpoint}/${id}`)];
  } else {
    const quantity = Math.max(1, Math.min(100, Math.trunc(Number(query.quantity) || 10)));
    const offset = Math.max(0, Math.trunc(Number(query.start) || 0));
    const params = new URLSearchParams({ per_page: String(quantity), offset: String(offset), hide_empty: "false" });
    if (slug) params.set("slug", slug);
    terms = await wooCommerceFetch<WooCommerceTermRecord[]>(connection, `${owner.endpoint}?${params}`);
  }
  return terms.map((term) => normalizeTerm(term, owner));
}
