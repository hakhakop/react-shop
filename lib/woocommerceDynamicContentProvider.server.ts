import type {
  DynamicContentContextDescriptor,
  DynamicContentData,
  DynamicItemContext,
  DynamicItemContextValue,
} from "@/lib/dynamicContent";
import { getDynamicItemContextValue } from "@/lib/dynamicContent";
import { getStorefrontContentHref } from "@/lib/storefrontContentHref";
import { getCmsConnection, getWordPressAuthHeaders } from "@/lib/cmsConnection";
import {
  getWooCommerceConnection,
  wooCommerceFetch,
} from "@/lib/woocommerce";
import type { SaaSWebsite } from "@/lib/websites";

const DEFAULT_QUANTITY = 10;
const MAX_QUERY_WINDOW = 100;

export type WooCommerceProductCollectionOrder =
  | "date"
  | "title"
  | "price"
  | "menuOrder"
  | "id"
  | "popularity"
  | "rating";

export type CompiledWooCommerceProductRequest = {
  path: string;
  mode: "single" | "collection";
  postFilterCategoryIds?: number[];
  postFilterStart?: number;
  postFilterQuantity?: number;
};

/**
 * Compose a transient Product Category route constraint with an authored
 * WooCommerce collection query. Authored filters remain intact; only the
 * canonical route category is injected. Ordinary Pages and singular contexts
 * do not expose this normalized route identity and therefore remain unchanged.
 */
export function composeWooCommerceProductDescriptorWithInheritedContext(
  descriptor: DynamicContentContextDescriptor,
  inheritedContext: DynamicItemContext | undefined,
): DynamicContentContextDescriptor {
  if (
    descriptor.provider !== "woocommerce" ||
    descriptor.source !== "product" ||
    descriptor.mode !== "collection" ||
    getDynamicItemContextValue(inheritedContext, "kind", "string") !== "product-category" ||
    getDynamicItemContextValue(inheritedContext, "taxonomy", "string") !== "product_cat"
  ) return descriptor;

  const termId = getDynamicItemContextValue(inheritedContext, "termId", "identifier");
  const numericTermId = typeof termId === "number"
    ? termId
    : typeof termId === "string" && /^\d+$/.test(termId)
      ? Number(termId)
      : undefined;
  if (!numericTermId || numericTermId < 1) return descriptor;

  return {
    ...descriptor,
    query: {
      ...(descriptor.query ?? {}),
      // This field exists only in the transient render descriptor. It is not
      // persisted and cannot be replaced by element-authored query controls.
      routeCategory: numericTermId,
    },
  };
}

type WooCommerceImage = {
  id?: unknown;
  src?: unknown;
  name?: unknown;
  alt?: unknown;
};

type WooCommerceTerm = {
  id?: unknown;
  name?: unknown;
  slug?: unknown;
};

type WooCommerceAttribute = {
  id?: unknown;
  name?: unknown;
  slug?: unknown;
  position?: unknown;
  visible?: unknown;
  variation?: unknown;
  options?: unknown;
};

export type WooCommerceProductRecord = {
  id?: unknown;
  name?: unknown;
  slug?: unknown;
  permalink?: unknown;
  type?: unknown;
  status?: unknown;
  description?: unknown;
  short_description?: unknown;
  sku?: unknown;
  price?: unknown;
  price_html?: unknown;
  regular_price?: unknown;
  sale_price?: unknown;
  featured?: unknown;
  on_sale?: unknown;
  purchasable?: unknown;
  virtual?: unknown;
  downloadable?: unknown;
  catalog_visibility?: unknown;
  stock_status?: unknown;
  stock_quantity?: unknown;
  images?: unknown;
  categories?: unknown;
  tags?: unknown;
  attributes?: unknown;
  acf?: unknown;
  meta_data?: unknown;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

const assertRecord = (value: unknown, owner: string) => {
  if (value === undefined) return {};
  if (!isRecord(value)) throw new Error(`${owner} must be an object.`);
  return value;
};

const assertAllowedKeys = (
  value: Record<string, unknown>,
  allowed: readonly string[],
  owner: string,
) => {
  const unexpected = Object.keys(value).filter((key) => !allowed.includes(key));
  if (unexpected.length) throw new Error(`Unsupported ${owner} field${unexpected.length === 1 ? "" : "s"}: ${unexpected.join(", ")}.`);
};

const readInteger = (value: unknown, fallback: number, owner: string, minimum: number) => {
  if (value === undefined) return fallback;
  if (!Number.isInteger(value) || (value as number) < minimum) throw new Error(`${owner} must be an integer greater than or equal to ${minimum}.`);
  return value as number;
};

const readEnum = <Value extends string>(value: unknown, fallback: Value, allowed: readonly Value[], owner: string) => {
  if (value === undefined) return fallback;
  if (typeof value !== "string" || !allowed.includes(value as Value)) throw new Error(`${owner} must be one of: ${allowed.join(", ")}.`);
  return value as Value;
};

const readBoolean = (value: unknown, owner: string): boolean | undefined => {
  if (value === undefined) return undefined;
  if (typeof value !== "boolean") throw new Error(`${owner} must be a boolean.`);
  return value;
};

const readText = (value: unknown, owner: string): string | undefined => {
  if (value === undefined) return undefined;
  if (typeof value !== "string") throw new Error(`${owner} must be a string.`);
  const text = value.trim();
  return text || undefined;
};

const readNumericIds = (value: unknown, owner: string): number[] => {
  if (value === undefined) return [];
  if (!Array.isArray(value)) throw new Error(`${owner} must be an array.`);
  const ids = value.map((entry) => typeof entry === "string" && /^\d+$/.test(entry) ? Number(entry) : entry);
  if (!ids.every((entry) => Number.isInteger(entry) && Number(entry) > 0)) throw new Error(`${owner} must contain only positive WooCommerce numeric IDs.`);
  return ids as number[];
};

const encodeQuery = (values: Record<string, string | number | boolean | undefined>) => {
  const params = new URLSearchParams();
  Object.entries(values).forEach(([key, value]) => {
    if (value !== undefined) params.set(key, String(value));
  });
  return params.toString();
};

const ORDER_FIELDS: Record<WooCommerceProductCollectionOrder, string> = {
  date: "date",
  title: "title",
  price: "price",
  menuOrder: "menu_order",
  id: "id",
  popularity: "popularity",
  rating: "rating",
};

export function compileWooCommerceProductRequest(
  descriptor: DynamicContentContextDescriptor,
): CompiledWooCommerceProductRequest {
  if (descriptor.provider !== "woocommerce" || descriptor.source !== "product") {
    throw new Error("WooCommerce Product adapter requires provider 'woocommerce' and source 'product'.");
  }
  const query = assertRecord(descriptor.query, "WooCommerce Product query");

  if (descriptor.mode === "single") {
    assertAllowedKeys(query, ["id", "slug"], "WooCommerce Product single query");
    const ids = readNumericIds(query.id === undefined ? undefined : [query.id], "query.id");
    const slug = readText(query.slug, "query.slug");
    if (ids[0]) return { mode: "single", path: `products/${ids[0]}` };
    if (slug) return { mode: "single", path: `products?${encodeQuery({ slug, per_page: 1 })}` };
    throw new Error("WooCommerce Product single query requires a numeric id or slug.");
  }

  if (descriptor.mode !== "collection") throw new Error(`Unsupported WooCommerce Product Dynamic Content mode: ${descriptor.mode}.`);
  assertAllowedKeys(query, ["start", "quantity", "order", "direction", "search", "categories", "tags", "featured", "onSale", "stockStatus", "include", "exclude", "routeCategory"], "WooCommerce Product collection query");
  const start = readInteger(query.start, 0, "query.start", 0);
  const quantity = readInteger(query.quantity, DEFAULT_QUANTITY, "query.quantity", 1);
  if (start + quantity > MAX_QUERY_WINDOW) throw new Error(`WooCommerce Product collection start + quantity cannot exceed ${MAX_QUERY_WINDOW}.`);
  const order = readEnum(query.order, "date", Object.keys(ORDER_FIELDS) as WooCommerceProductCollectionOrder[], "query.order");
  const direction = readEnum(query.direction, "desc", ["asc", "desc"] as const, "query.direction");
  const stockStatus = query.stockStatus === undefined ? undefined : readEnum(query.stockStatus, "instock", ["instock", "outofstock", "onbackorder"] as const, "query.stockStatus");
  const categories = readNumericIds(query.categories, "query.categories");
  const tags = readNumericIds(query.tags, "query.tags");
  const routeCategories = readNumericIds(query.routeCategory === undefined ? undefined : [query.routeCategory], "query.routeCategory");
  const routeCategory = routeCategories[0];
  const postFilterCategoryIds = routeCategory && categories.length && !categories.includes(routeCategory)
    ? categories
    : [];
  const include = readNumericIds(query.include, "query.include");
  const exclude = readNumericIds(query.exclude, "query.exclude");
  const parameters = encodeQuery({
    offset: postFilterCategoryIds.length ? 0 : start,
    per_page: postFilterCategoryIds.length ? MAX_QUERY_WINDOW : quantity,
    order: direction,
    orderby: ORDER_FIELDS[order],
    search: readText(query.search, "query.search"),
    // Route ownership is mandatory. Element categories may refine the route,
    // but must never replace it. The common case sends the canonical route ID.
    category: routeCategory ?? (categories.length ? categories.join(",") : undefined),
    tag: tags.length ? tags.join(",") : undefined,
    featured: readBoolean(query.featured, "query.featured"),
    on_sale: readBoolean(query.onSale, "query.onSale"),
    stock_status: stockStatus,
    include: include.length ? include.join(",") : undefined,
    exclude: exclude.length ? exclude.join(",") : undefined,
  });
  return {
    mode: "collection",
    path: `products?${parameters}`,
    ...(postFilterCategoryIds.length
      ? { postFilterCategoryIds, postFilterStart: start, postFilterQuantity: quantity }
      : {}),
  };
}

const stringValue = (value: unknown) => typeof value === "string" ? value : undefined;
const identifierValue = (value: unknown) =>
  (typeof value === "string" && value.length > 0) || (typeof value === "number" && Number.isFinite(value)) ? value : undefined;
const numberValue = (value: unknown) => typeof value === "number" && Number.isFinite(value) ? value : undefined;
const booleanValue = (value: unknown) => typeof value === "boolean" ? value : undefined;
const compactRecord = (values: Record<string, DynamicContentData | undefined>) =>
  Object.fromEntries(Object.entries(values).filter((entry): entry is [string, DynamicContentData] => entry[1] !== undefined));
const setField = (fields: Record<string, DynamicItemContextValue>, path: string, value: DynamicItemContextValue | undefined) => {
  if (value !== undefined) fields[path] = value;
};

/** Convert WooCommerce's presentation fragment into plain display text once. */
const cleanWooCommercePrice = (value: unknown) => {
  const raw = stringValue(value)?.trim();
  if (!raw) return undefined;
  return raw
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;|&#160;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&euro;/gi, "€")
    .replace(/&pound;/gi, "£")
    .replace(/&yen;/gi, "¥")
    .replace(/&dollar;/gi, "$")
    .replace(/&ndash;/gi, "–")
    .replace(/&mdash;/gi, "—")
    .replace(/&#x([0-9a-f]+);/gi, (_, hex: string) => String.fromCodePoint(Number.parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number.parseInt(code, 10)))
    .replace(/\s+/g, " ")
    .trim() || undefined;
};

const normalizedTerm = (term: WooCommerceTerm) => compactRecord({
  id: identifierValue(term.id),
  name: stringValue(term.name),
  slug: stringValue(term.slug),
});

const normalizedImage = (image: WooCommerceImage) => compactRecord({
  id: identifierValue(image.id),
  url: stringValue(image.src),
  name: stringValue(image.name),
  alt: stringValue(image.alt),
});

const parseSafeSingularPrice = (value: unknown, productType: unknown) => {
  if (productType === "variable" || productType === "grouped") return undefined;
  const text = stringValue(value)?.trim();
  if (!text || !/^-?\d+(?:\.\d+)?$/.test(text)) return undefined;
  const amount = Number(text);
  return Number.isFinite(amount) ? amount : undefined;
};

/** Normalize a WooCommerce REST Product; raw response properties are never retained. */
export function normalizeWooCommerceProductContext(product: WooCommerceProductRecord): DynamicItemContext {
  const fields: Record<string, DynamicItemContextValue> = {};
  const id = identifierValue(product.id);
  const title = stringValue(product.name);
  const description = stringValue(product.description);
  const excerpt = stringValue(product.short_description);
  const slug = stringValue(product.slug);
  const originPermalink = stringValue(product.permalink);
  const storefrontHref = slug
    ? getStorefrontContentHref({ contentType: "product", slug })
    : null;
  const price = product.type === "variable" || product.type === "grouped"
    ? cleanWooCommercePrice(product.price_html) ?? cleanWooCommercePrice(product.price)
    : cleanWooCommercePrice(product.price);
  const regularPrice = stringValue(product.regular_price);
  const salePrice = stringValue(product.sale_price);
  const sku = stringValue(product.sku);
  const stockStatus = stringValue(product.stock_status);
  const stockQuantity = numberValue(product.stock_quantity);

  if (id !== undefined) {
    setField(fields, "id", { type: "identifier", value: id });
    setField(fields, "databaseId", { type: "identifier", value: id });
  }
  if (title !== undefined) setField(fields, "title", { type: "string", value: title });
  if (description !== undefined) setField(fields, "description", { type: "richText", value: description });
  if (excerpt !== undefined) setField(fields, "excerpt", { type: "richText", value: excerpt });
  if (slug !== undefined) setField(fields, "slug", { type: "string", value: slug });
  if (originPermalink !== undefined) {
    setField(fields, "origin.permalink", { type: "url", value: originPermalink });
  }
  if (storefrontHref) {
    setField(fields, "storefront.href", { type: "url", value: storefrontHref });
    // Existing navigation bindings keep using `link`; Product-only provider
    // ownership now projects it to the WebPages route. Post semantics are untouched.
    setField(fields, "link", { type: "url", value: storefrontHref });
  }
  if (price !== undefined) setField(fields, "price", { type: "string", value: price });
  if (regularPrice !== undefined) setField(fields, "regularPrice", { type: "string", value: regularPrice });
  if (salePrice !== undefined) setField(fields, "salePrice", { type: "string", value: salePrice });
  const priceAmount = parseSafeSingularPrice(product.price, product.type);
  const regularPriceAmount = parseSafeSingularPrice(product.regular_price, product.type);
  const salePriceAmount = parseSafeSingularPrice(product.sale_price, product.type);
  if (priceAmount !== undefined) setField(fields, "price.amount", { type: "number", value: priceAmount });
  if (regularPriceAmount !== undefined) setField(fields, "regularPrice.amount", { type: "number", value: regularPriceAmount });
  if (salePriceAmount !== undefined) setField(fields, "salePrice.amount", { type: "number", value: salePriceAmount });
  if (sku !== undefined) setField(fields, "sku", { type: "string", value: sku });
  if (stockStatus !== undefined) setField(fields, "stockStatus", { type: "string", value: stockStatus });
  if (stockQuantity !== undefined) setField(fields, "stockQuantity", { type: "number", value: stockQuantity });

  const images = Array.isArray(product.images) ? product.images.filter(isRecord) as WooCommerceImage[] : [];
  const primaryImage = images[0];
  const imageUrl = stringValue(primaryImage?.src);
  const imageAlt = stringValue(primaryImage?.alt);
  if (imageUrl !== undefined) {
    setField(fields, "image.url", { type: "url", value: imageUrl });
    setField(fields, "image", { type: "media", value: { url: imageUrl, ...(identifierValue(primaryImage?.id) !== undefined ? { id: identifierValue(primaryImage?.id) } : {}), ...(imageAlt !== undefined ? { alt: imageAlt } : {}) } });
  }
  if (imageAlt !== undefined) setField(fields, "image.alt", { type: "string", value: imageAlt });
  setField(fields, "gallery", { type: "metadata", value: { items: images.map(normalizedImage) } });

  // YOOtheme Custom Products exposes ACF media subfields (for example
  // `field.product_video.url`) even when WooCommerce delivers the value via
  // REST `acf` or `meta_data`. Normalize both response shapes to the same
  // canonical path used by the imported binding.
  const productAcf = isRecord(product.acf) ? product.acf : {};
  const productMeta = Array.isArray(product.meta_data)
    ? product.meta_data.filter(isRecord)
    : [];
  const productVideoMeta = productMeta.find((entry) => entry.key === "product_video")?.value;
  const productVideoValue = productAcf.product_video ?? productVideoMeta;
  const rawProductVideoUrl = stringValue(productVideoValue) ?? (
    isRecord(productVideoValue)
      ? stringValue(productVideoValue.url) ?? stringValue(productVideoValue.src)
      : undefined
  );
  const productVideoUrl = rawProductVideoUrl && !/^\d+$/.test(rawProductVideoUrl)
    ? rawProductVideoUrl
    : undefined;
  if (productVideoUrl) {
    setField(fields, "acf.product_video.url", { type: "url", value: productVideoUrl });
  }

  const categories = Array.isArray(product.categories) ? product.categories.filter(isRecord).map((term) => normalizedTerm(term as WooCommerceTerm)) : [];
  const tags = Array.isArray(product.tags) ? product.tags.filter(isRecord).map((term) => normalizedTerm(term as WooCommerceTerm)) : [];
  setField(fields, "categories", { type: "metadata", value: { items: categories } });
  setField(fields, "categories.label", { type: "string", value: categories.map((term) => term.name).filter((name): name is string => typeof name === "string").join(", ") });
  setField(fields, "tags", { type: "metadata", value: { items: tags } });

  const attributes = Array.isArray(product.attributes) ? product.attributes.filter(isRecord).map((attribute) => {
    const value = attribute as WooCommerceAttribute;
    return compactRecord({
      id: identifierValue(value.id),
      name: stringValue(value.name),
      slug: stringValue(value.slug),
      position: numberValue(value.position),
      visible: booleanValue(value.visible),
      variation: booleanValue(value.variation),
      options: Array.isArray(value.options) ? value.options.filter((option): option is string => typeof option === "string") : undefined,
    });
  }) : [];
  setField(fields, "attributes", { type: "metadata", value: { items: attributes } });
  setField(fields, "meta", { type: "metadata", value: compactRecord({
    type: stringValue(product.type),
    status: stringValue(product.status),
    featured: booleanValue(product.featured),
    onSale: booleanValue(product.on_sale),
    purchasable: booleanValue(product.purchasable),
    virtual: booleanValue(product.virtual),
    downloadable: booleanValue(product.downloadable),
    catalogVisibility: stringValue(product.catalog_visibility),
  }) });

  return { ...(id !== undefined ? { id } : {}), fields };
}

export async function resolveWooCommerceProductContexts(input: {
  website?: SaaSWebsite | null;
  descriptor: DynamicContentContextDescriptor;
}): Promise<DynamicItemContext[]> {
  const products = await fetchWooCommerceProductRecords(input);
  const cms = getCmsConnection(input.website);
  const headers = getWordPressAuthHeaders(cms);
  const hydrated = await Promise.all(products.map(async (product) => {
    const acf = isRecord(product.acf) ? product.acf : {};
    const metadata = Array.isArray(product.meta_data) ? product.meta_data.filter(isRecord) : [];
    const metaValue = metadata.find((entry) => entry.key === "product_video")?.value;
    const videoValue = acf.product_video ?? metaValue;
    const attachmentId = typeof videoValue === "number"
      ? videoValue
      : typeof videoValue === "string" && /^\d+$/.test(videoValue)
        ? Number(videoValue)
        : undefined;
    if (!attachmentId || !cms.siteUrl) return product;
    try {
      const response = await fetch(`${cms.siteUrl}/wp-json/wp/v2/media/${attachmentId}?context=edit`, {
        headers,
        cache: "no-store",
      });
      if (!response.ok) return product;
      const media = await response.json() as { source_url?: unknown };
      const url = stringValue(media.source_url);
      return url ? { ...product, acf: { ...acf, product_video: { url } } } : product;
    } catch {
      return product;
    }
  }));
  return hydrated.map((product) => normalizeWooCommerceProductContext(product));
}

/** Fetch through the canonical authenticated WooCommerce product provider. */
export async function fetchWooCommerceProductRecords(input: {
  website?: SaaSWebsite | null;
  descriptor: DynamicContentContextDescriptor;
}): Promise<WooCommerceProductRecord[]> {
  const connection = getWooCommerceConnection(input.website);
  const descriptor = await normalizeImportedProductDescriptor(input.descriptor, connection);
  const compiled = compileWooCommerceProductRequest(descriptor);
  const payload = await wooCommerceFetch<WooCommerceProductRecord | WooCommerceProductRecord[]>(connection, compiled.path);
  const products = Array.isArray(payload) ? payload : [payload];
  const records = products.filter(isRecord);
  if (!compiled.postFilterCategoryIds?.length) return records;
  const filtered = records.filter((product) => {
    const categoryIds = Array.isArray(product.categories)
      ? product.categories.filter(isRecord).flatMap((category) => {
          const id = identifierValue(category.id);
          return typeof id === "number" ? [id] : typeof id === "string" && /^\d+$/.test(id) ? [Number(id)] : [];
        })
      : [];
    return compiled.postFilterCategoryIds!.some((id) => categoryIds.includes(id));
  });
  const start = compiled.postFilterStart ?? 0;
  return filtered.slice(start, start + (compiled.postFilterQuantity ?? DEFAULT_QUANTITY));
}

async function normalizeImportedProductDescriptor(
  descriptor: DynamicContentContextDescriptor,
  connection: ReturnType<typeof getWooCommerceConnection>,
): Promise<DynamicContentContextDescriptor> {
  const query = isRecord(descriptor.query) ? descriptor.query : {};
  const sourceQuery = isRecord(query.sourceQuery) ? query.sourceQuery : null;
  if (!sourceQuery) return descriptor;
  if (descriptor.mode === "single") {
    return {
      provider: "woocommerce",
      source: "product",
      mode: "single",
      query: {
        ...(query.databaseId !== undefined ? { id: query.databaseId } : {}),
        ...(query.slug !== undefined ? { slug: query.slug } : {}),
      },
    };
  }
  const argumentsValue = isRecord(sourceQuery.arguments) ? sourceQuery.arguments : {};
  const termIds = Array.isArray(argumentsValue.terms)
    ? argumentsValue.terms.flatMap((value) => {
        const id = typeof value === "number" ? value : typeof value === "string" && /^\d+$/.test(value) ? Number(value) : NaN;
        return Number.isInteger(id) && id > 0 ? [id] : [];
      })
    : [];
  const include = termIds.join(",");
  const lookup = async (path: string) => {
    if (!include) return [] as number[];
    try {
      const values = await wooCommerceFetch<Array<{ id?: unknown }>>(connection, `${path}?include=${include}&per_page=100&hide_empty=false`);
      return values.flatMap((value) => {
        const id = Number(value.id);
        return Number.isInteger(id) && id > 0 ? [id] : [];
      });
    } catch {
      return [] as number[];
    }
  };
  const [categories, tags] = await Promise.all([
    lookup("products/categories"),
    lookup("products/tags"),
  ]);
  const orderValue = stringValue(argumentsValue.order)?.toLowerCase();
  const order = orderValue === "title" || orderValue === "price" || orderValue === "rating"
    ? orderValue
    : orderValue === "views" ? "popularity" : "date";
  const direction = stringValue(argumentsValue.order_direction)?.toLowerCase() === "asc" ? "asc" : "desc";
  return {
    provider: "woocommerce",
    source: "product",
    mode: descriptor.mode,
    query: {
      ...(query.databaseId !== undefined ? { id: query.databaseId } : {}),
      ...(query.start !== undefined ? { start: query.start } : {}),
      ...(query.quantity !== undefined ? { quantity: query.quantity } : {}),
      order,
      direction,
      ...(categories.length ? { categories } : {}),
      ...(tags.length ? { tags } : {}),
    },
  };
}
