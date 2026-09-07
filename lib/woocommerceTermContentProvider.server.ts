import type {
  DynamicContentContextDescriptor,
  DynamicContentData,
  DynamicItemContext,
  DynamicItemContextValue,
} from "@/lib/dynamicContent";
import { getWooCommerceConnection, wooCommerceFetch } from "@/lib/woocommerce";
import type { SaaSWebsite } from "@/lib/websites";
import { resolveWordPressGenericContentContexts } from "@/lib/wordpressGenericContentProvider.server";
import { resolveWordPressTermAcf } from "@/lib/wordpressTermAcf.server";

type WooCommerceTermRecord = {
  id?: unknown;
  name?: unknown;
  slug?: unknown;
  description?: unknown;
  parent?: unknown;
  count?: unknown;
  menu_order?: unknown;
  image?: { id?: unknown; src?: unknown; alt?: unknown } | null;
};

type TermBatchWaiter = {
  id: number;
  resolve: (term: WooCommerceTermRecord) => void;
  reject: (error: unknown) => void;
};
const termBatchQueues = new Map<string, {
  connection: ReturnType<typeof getWooCommerceConnection>;
  endpoint: string;
  waiters: TermBatchWaiter[];
}>();

const enqueueWooCommerceTerm = (
  cacheScope: string,
  connection: ReturnType<typeof getWooCommerceConnection>,
  endpoint: string,
  id: number,
) => new Promise<WooCommerceTermRecord>((resolve, reject) => {
  const key = `${cacheScope}:${endpoint}`;
  const queue = termBatchQueues.get(key) ?? { connection, endpoint, waiters: [] };
  queue.waiters.push({ id, resolve, reject });
  if (!termBatchQueues.has(key)) {
    termBatchQueues.set(key, queue);
    queueMicrotask(async () => {
      termBatchQueues.delete(key);
      const ids = [...new Set(queue.waiters.map(waiter => waiter.id))];
      try {
        const params = new URLSearchParams({
          include: ids.join(","),
          per_page: String(ids.length),
          hide_empty: "false",
        });
        const terms = await wooCommerceFetch<WooCommerceTermRecord[]>(
          queue.connection,
          `${queue.endpoint}?${params}`,
        );
        const byId = new Map(terms.map(term => [String(term.id), term]));
        queue.waiters.forEach(waiter => {
          const term = byId.get(String(waiter.id));
          if (term) waiter.resolve(term);
          else waiter.reject(new Error(`WooCommerce term ${waiter.id} was not found.`));
        });
      } catch (error) {
        queue.waiters.forEach(waiter => waiter.reject(error));
      }
    });
  }
});

const TERM_CONTEXT_CACHE_TTL_MS = 30_000;
const TERM_CONTEXT_CACHE_MAX_ENTRIES = 200;
const termContextCache = new Map<string, { expiresAt: number; value: Promise<DynamicItemContext[]> }>();

const stableValue = (value: unknown): unknown => {
  if (Array.isArray(value)) return value.map(stableValue);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(Object.entries(value as Record<string, unknown>)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, child]) => [key, stableValue(child)]));
};

const trimTermContextCache = () => {
  while (termContextCache.size > TERM_CONTEXT_CACHE_MAX_ENTRIES) {
    const oldest = termContextCache.keys().next().value;
    if (typeof oldest !== "string") break;
    termContextCache.delete(oldest);
  }
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
const nonNegativeInteger = (value: unknown) => {
  const number = Number(value);
  return Number.isInteger(number) && number >= 0 ? number : undefined;
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

async function loadWooCommerceTermContexts(input: {
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
    terms = [await enqueueWooCommerceTerm(
      `${input.website?.id ?? "default"}:${connection.apiUrl ?? "missing"}`,
      connection,
      owner.endpoint,
      id,
    )];
  } else {
    const quantity = Math.max(1, Math.min(100, Math.trunc(Number(query.quantity) || 10)));
    const offset = Math.max(0, Math.trunc(Number(query.start) || 0));
    const requestedOrder = text(query.order);
    const emulateTermOrder = requestedOrder === "menuOrder";
    const params = new URLSearchParams({
      // WooCommerce does not accept `menu_order` for taxonomy collections.
      // Fetch one canonical window and apply its returned menu_order locally;
      // the stable ID tie-break matches get_terms() when all values are zero.
      per_page: String(emulateTermOrder ? 100 : quantity),
      offset: String(emulateTermOrder ? 0 : offset),
      hide_empty: query.hideEmpty === true ? "true" : "false",
    });
    const parentId = nonNegativeInteger(query.parentId);
    if (owner.taxonomy === "product_cat" && parentId !== undefined) {
      params.set("parent", String(parentId));
    }
    if (requestedOrder) {
      const orderBy = ({
        menuOrder: "id",
        name: "name",
        id: "id",
        slug: "slug",
        count: "count",
      } as const)[requestedOrder as "menuOrder" | "name" | "id" | "slug" | "count"];
      if (orderBy) params.set("orderby", orderBy);
    }
    const direction = text(query.direction)?.toLowerCase();
    if (direction === "asc" || direction === "desc") params.set("order", direction);
    if (slug) params.set("slug", slug);
    terms = await wooCommerceFetch<WooCommerceTermRecord[]>(connection, `${owner.endpoint}?${params}`);
    if (emulateTermOrder) {
      const directionFactor = direction === "desc" ? -1 : 1;
      terms = [...terms]
        .sort((left, right) => {
          const menuDifference = (Number(left.menu_order) || 0) - (Number(right.menu_order) || 0);
          if (menuDifference !== 0) return menuDifference * directionFactor;
          return ((Number(left.id) || 0) - (Number(right.id) || 0)) * directionFactor;
        })
        .slice(offset, offset + quantity);
    }
  }
  const contexts = terms.map((term) => normalizeTerm(term, owner));
  if (Array.isArray(query.requestedFields) && query.requestedFields.some(field => typeof field === "string" && field.startsWith("acf."))) {
    const requestedFields = query.requestedFields.filter((field): field is string => typeof field === "string");
    const rest = await resolveWordPressTermAcf({
      website: input.website, taxonomy: owner.taxonomy,
      ids: contexts.flatMap(context => context.id === undefined ? [] : [context.id]),
      requestedFields,
    }).catch(() => new Map<string, Record<string, DynamicItemContextValue>>());
    const needsGraphQLFallback = contexts.some(context => requestedFields.some(path => !rest.get(String(context.id))?.[path]));
    const enriched = needsGraphQLFallback
      ? await resolveWordPressGenericContentContexts({ website: input.website, descriptor: {
          ...input.descriptor, provider: "wordpress", source: "content", query: { ...query, sourceName: owner.taxonomy },
        } }).catch(() => [])
      : [];
    return contexts.map(context => {
      const extra = enriched.find(candidate => String(candidate.fields.databaseId?.value) === String(context.id));
      return { ...context, fields: { ...context.fields, ...Object.fromEntries(Object.entries(extra?.fields ?? {}).filter(([key]) => key.startsWith("acf."))), ...rest.get(String(context.id)) } };
    });
  }
  return contexts;
}

/** Share selected-term projections between page and header materialization. */
export function resolveWooCommerceTermContexts(input: {
  website?: SaaSWebsite | null;
  descriptor: DynamicContentContextDescriptor;
}): Promise<DynamicItemContext[]> {
  const connection = getWooCommerceConnection(input.website);
  const cacheKey = JSON.stringify([
    input.website?.id ?? "default",
    connection.apiUrl,
    stableValue(input.descriptor),
  ]);
  const cached = termContextCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) return cached.value;
  const value = loadWooCommerceTermContexts(input);
  termContextCache.set(cacheKey, { expiresAt: Date.now() + TERM_CONTEXT_CACHE_TTL_MS, value });
  trimTermContextCache();
  value.catch(() => {
    if (termContextCache.get(cacheKey)?.value === value) termContextCache.delete(cacheKey);
  });
  return value;
}
