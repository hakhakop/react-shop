import { getCmsConnection, getWordPressAuthHeaders } from "@/lib/cmsConnection";
import type { DynamicItemContextValue } from "@/lib/dynamicContent";
import type { SaaSWebsite } from "@/lib/websites";

type TermAcfResult = Map<string, Record<string, DynamicItemContextValue>>;
const TERM_ACF_CACHE_TTL_MS = 30_000;
const TERM_ACF_CACHE_MAX_ENTRIES = 200;
const termAcfCache = new Map<string, { expiresAt: number; value: Promise<TermAcfResult> }>();
type TermAcfBatchRequest = {
  input: Parameters<typeof loadWordPressTermAcf>[0];
  resolve: (result: TermAcfResult) => void;
  reject: (error: unknown) => void;
};
const termAcfBatchQueues = new Map<string, TermAcfBatchRequest[]>();

const trimTermAcfCache = () => {
  while (termAcfCache.size > TERM_ACF_CACHE_MAX_ENTRIES) {
    const oldest = termAcfCache.keys().next().value;
    if (typeof oldest !== "string") break;
    termAcfCache.delete(oldest);
  }
};

/** Read only requested term fields; never depend on a browser login or scrape admin HTML. */
async function loadWordPressTermAcf(input: {
  website?: SaaSWebsite | null;
  taxonomy: string;
  ids: Array<string | number>;
  requestedFields: string[];
}): Promise<TermAcfResult> {
  const cms = getCmsConnection(input.website);
  const result = new Map<string, Record<string, DynamicItemContextValue>>();
  if (!cms.siteUrl || !input.ids.length) return result;
  const read = async (path: string) => {
    const response = await fetch(`${cms.siteUrl.replace(/\/$/, "")}/wp-json/${path}`, {
      headers: getWordPressAuthHeaders(cms) ?? undefined,
      cache: "no-store", redirect: "error", signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) throw new Error(`WordPress term fields returned HTTP ${response.status}.`);
    return response.json();
  };
  const catalog = await read("wp/v2/taxonomies");
  const taxonomy = catalog[input.taxonomy];
  if (!taxonomy?.rest_base || !taxonomy?.rest_namespace) return result;
  const safePath = (value: unknown) => typeof value === "string" && /^[a-zA-Z0-9_/-]+$/.test(value) && !value.includes("..") ? value : null;
  const namespace = safePath(taxonomy.rest_namespace);
  const base = safePath(taxonomy.rest_base);
  if (!namespace || !base) return result;
  // WordPress supports selecting the authored terms as one bounded collection.
  // Retain the individual route fallback for older/custom REST controllers.
  const params = new URLSearchParams({
    include: input.ids.map(String).join(","),
    per_page: String(Math.max(1, input.ids.length)),
    acf_format: "standard",
  });
  const collection = await read(`${namespace}/${base}?${params}`).catch(() => null);
  const terms = Array.isArray(collection)
    ? collection
    : await Promise.all(input.ids.map(id => read(`${namespace}/${base}/${encodeURIComponent(String(id))}?acf_format=standard`).catch(() => null)));
  await Promise.all(terms.map(async (term) => {
    if (!term) return;
    const fields: Record<string, DynamicItemContextValue> = {};
    const media = new Map<string, Promise<Record<string, unknown>>>();
    for (const path of input.requestedFields) {
      const match = /^acf\.([a-zA-Z0-9_]+)(?:\.(url|alt|caption|id))?$/.exec(path);
      if (!match) continue;
      const [, key, child] = match;
      let value = term.acf?.[key];
      // Older Webpages imports used generic term-media aliases. YOOtheme's
      // Product Category ACF group stores the same values under its authored
      // WordPress names. Resolve both so saved imports begin working without
      // rewriting their persisted dynamic bindings.
      if (value === undefined && input.taxonomy === "product_cat") {
        const authoredKey = ({
          image_intro: "products_intro_image",
          image_featured: "products_hover_video",
        } as const)[key as "image_intro" | "image_featured"];
        if (authoredKey) value = term.acf?.[authoredKey];
      }
      if (child && Number.isInteger(value) && value > 0) {
        if (!media.has(key)) media.set(key, read(`wp/v2/media/${value}`).catch(() => ({})));
        value = await media.get(key);
      }
      if (child) {
        value = typeof value === "string" && child === "url" ? value
          : value?.[child] ?? value?.[({ url: "source_url", alt: "alt_text", id: "ID", caption: "caption" } as Record<string, string>)[child]];
        if (child === "caption" && value && typeof value === "object") value = value.rendered;
      }
      if (typeof value === "string") fields[path] = { type: child === "url" ? "url" : "string", value };
      else if (typeof value === "number" && Number.isFinite(value)) fields[path] = { type: child === "id" ? "identifier" : "number", value };
    }
    result.set(String(term.id), fields);
  }));
  return result;
}

const enqueueWordPressTermAcf = (input: Parameters<typeof loadWordPressTermAcf>[0]) => {
  const cms = getCmsConnection(input.website);
  const batchKey = `${input.website?.id ?? "default"}:${cms.siteUrl ?? "missing"}:${input.taxonomy}`;
  return new Promise<TermAcfResult>((resolve, reject) => {
    const queue = termAcfBatchQueues.get(batchKey) ?? [];
    queue.push({ input, resolve, reject });
    if (!termAcfBatchQueues.has(batchKey)) {
      termAcfBatchQueues.set(batchKey, queue);
      queueMicrotask(async () => {
        termAcfBatchQueues.delete(batchKey);
        const ids = [...new Set(queue.flatMap(request => request.input.ids.map(String)))];
        const requestedFields = [...new Set(queue.flatMap(request => request.input.requestedFields))];
        try {
          const combined = await loadWordPressTermAcf({
            ...queue[0].input,
            ids,
            requestedFields,
          });
          queue.forEach(request => {
            const requestedIds = new Set(request.input.ids.map(String));
            const requestedPaths = new Set(request.input.requestedFields);
            const projected: TermAcfResult = new Map();
            combined.forEach((fields, id) => {
              if (!requestedIds.has(id)) return;
              projected.set(id, Object.fromEntries(Object.entries(fields).filter(([path]) => requestedPaths.has(path))));
            });
            request.resolve(projected);
          });
        } catch (error) {
          queue.forEach(request => request.reject(error));
        }
      });
    }
  });
};

/** Coalesce identical term/ACF reads across independently materialized layouts. */
export function resolveWordPressTermAcf(input: {
  website?: SaaSWebsite | null;
  taxonomy: string;
  ids: Array<string | number>;
  requestedFields: string[];
}): Promise<TermAcfResult> {
  const cms = getCmsConnection(input.website);
  const cacheKey = JSON.stringify([
    input.website?.id ?? "default",
    cms.siteUrl,
    input.taxonomy,
    [...new Set(input.ids.map(String))].sort(),
    [...new Set(input.requestedFields)].sort(),
  ]);
  const cached = termAcfCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) return cached.value;
  const value = enqueueWordPressTermAcf(input);
  termAcfCache.set(cacheKey, { expiresAt: Date.now() + TERM_ACF_CACHE_TTL_MS, value });
  trimTermAcfCache();
  value.catch(() => {
    if (termAcfCache.get(cacheKey)?.value === value) termAcfCache.delete(cacheKey);
  });
  return value;
}
