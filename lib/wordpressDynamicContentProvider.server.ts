import type {
  DynamicContentContextDescriptor,
  DynamicContentData,
  DynamicItemContext,
  DynamicItemContextValue,
} from "@/lib/dynamicContent";
import {
  getWebsiteGraphQLEndpoint,
  graphqlFetch,
} from "@/lib/graphql";
import type { SaaSWebsite } from "@/lib/websites";
import { WORDPRESS_POST_ACF_FIELDS } from "@/lib/wordpressDynamicContentFields";
import { getStorefrontContentHref } from "@/lib/storefrontContentHref";

const DEFAULT_QUANTITY = 10;
const MAX_QUERY_WINDOW = 100;

const WORDPRESS_POST_COLLECTION_QUERY = `
  query DynamicContentWordPressPosts(
    $first: Int!
    $where: RootQueryToPostConnectionWhereArgs
  ) {
    posts(first: $first, where: $where) {
      nodes {
        id
        databaseId
        slug
        uri
        status
        title
        content
        excerpt
        date
        modified
        link
        author {
          node {
            id
            databaseId
            name
            slug
          }
        }
        categories {
          nodes {
            id
            databaseId
            name
            slug
            uri
          }
        }
        tags {
          nodes {
            id
            databaseId
            name
            slug
            uri
          }
        }
        featuredImage {
          node {
            id
            databaseId
            sourceUrl
            altText
            caption
          }
        }
        # Keep the provider's GraphQL projection generic: aliases map the
        # schema's ACF field names to the canonical ACF field keys consumed by
        # the shared media normalizer.
        acfFields: postAcfFields {
          intro_image: introImage {
            node {
              id
              databaseId
              sourceUrl
              altText
              caption
            }
          }
          teaser_image: teaserImage {
            node {
              id
              databaseId
              sourceUrl
              altText
              caption
            }
          }
        }
      }
    }
  }
`;

const WORDPRESS_POST_SINGLE_QUERY = WORDPRESS_POST_COLLECTION_QUERY
  .replace("query DynamicContentWordPressPosts(\n    $first: Int!\n    $where: RootQueryToPostConnectionWhereArgs\n  )", "query DynamicContentWordPressPost($id: ID!)")
  .replace("posts(first: $first, where: $where) {\n      nodes {", "post(id: $id, idType: SLUG) {")
  .replace(/\n      }\n    }\n  }\n$/, "\n    }\n  }\n");

const WORDPRESS_POST_SINGLE_BY_ID_QUERY = WORDPRESS_POST_SINGLE_QUERY
  .replace("post(id: $id, idType: SLUG)", "post(id: $id, idType: ID)");

function withoutOptionalAcfProjection(query: string) {
  return query.replace(
    /\n        acfFields: postAcfFields \{[\s\S]*?\n        \}\n/,
    "\n",
  );
}

async function fetchWordPressPosts<T>(
  query: string,
  variables: Record<string, unknown>,
  endpoint: string,
) {
  try {
    return await graphqlFetch<T>(query, variables, { endpoint });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!/postAcfFields|acfFields/i.test(message)) throw error;
    return graphqlFetch<T>(withoutOptionalAcfProjection(query), variables, { endpoint });
  }
}

const WORDPRESS_TERM_RESOLUTION_QUERY = `
  query DynamicContentWordPressTerms(
    $where: RootQueryToTermNodeConnectionWhereArgs
  ) {
    terms(where: $where) {
      nodes {
        databaseId
        slug
        __typename
      }
    }
  }
`;

export type WordPressPostCollectionOrder =
  | "date"
  | "modifiedDate"
  | "title"
  | "menuOrder"
  | "id";

export type WordPressPostCollectionQuery = {
  /** Semantic provenance for imported archive templates. */
  archive?: "single" | "collection";
  start?: number;
  quantity?: number;
  order?: WordPressPostCollectionOrder;
  direction?: "asc" | "desc";
  search?: string;
  filters?: {
    authors?: Array<string | number>;
    categories?: Array<string | number>;
    tags?: Array<string | number>;
    terms?: Array<{
      taxonomy: "category" | "tag";
      ids: Array<string | number>;
    }>;
    /** Raw YOOtheme IDs; taxonomy is intentionally resolved by the provider. */
    rawTermIds?: Array<string | number>;
    /** Core WPGraphQL `*In` filters provide OR/any matching within a taxonomy. */
    termMatch?: "any";
  };
};

type CompiledWordPressPostCollectionQuery = {
  query: string;
  variables: {
    first: number;
    where: Record<string, unknown>;
  };
  start: number;
  quantity: number;
};

type ResolvedRawTerm = { taxonomy: "category" | "tag"; id: string | number };

type WordPressTermNode = {
  id?: unknown;
  databaseId?: unknown;
  name?: unknown;
  slug?: unknown;
  uri?: unknown;
};

type WordPressPostNode = {
  id?: unknown;
  databaseId?: unknown;
  slug?: unknown;
  uri?: unknown;
  status?: unknown;
  title?: unknown;
  content?: unknown;
  excerpt?: unknown;
  date?: unknown;
  modified?: unknown;
  link?: unknown;
  author?: { node?: WordPressTermNode | null } | null;
  categories?: { nodes?: WordPressTermNode[] | null } | null;
  tags?: { nodes?: WordPressTermNode[] | null } | null;
  featuredImage?: {
    node?: (WordPressTermNode & {
      sourceUrl?: unknown;
      altText?: unknown;
      caption?: unknown;
    }) | null;
  } | null;
  /** Optional provider projection populated when WPGraphQL ACF is available. */
  acfFields?: Record<string, unknown> | null;
};

type WordPressPostsResponse = {
  posts?: {
    nodes?: WordPressPostNode[] | null;
  } | null;
};

type WordPressPostResponse = { post?: WordPressPostNode | null };

export function compileWordPressPostSingleQuery(
  queryData: DynamicContentContextDescriptor["query"],
) {
  const query = assertRecord(queryData, "WordPress post single query");
  assertAllowedKeys(query, ["slug", "id"], "WordPress post single query");
  const slug = typeof query.slug === "string" ? query.slug.trim() : "";
  const id = typeof query.id === "string" ? query.id.trim() : "";
  if (query.id === undefined && !slug) {
    throw new Error("query.slug must be a non-empty string.");
  }
  if ((slug ? 1 : 0) + (id ? 1 : 0) !== 1) {
    throw new Error("WordPress post single query requires exactly one non-empty slug or stable id.");
  }
  return id
    ? { query: WORDPRESS_POST_SINGLE_BY_ID_QUERY, variables: { id } }
    : { query: WORDPRESS_POST_SINGLE_QUERY, variables: { id: slug } };
}

const ORDER_FIELDS: Record<WordPressPostCollectionOrder, string> = {
  date: "DATE",
  modifiedDate: "MODIFIED",
  title: "TITLE",
  menuOrder: "MENU_ORDER",
  id: "ID",
};

const assertRecord = (
  value: unknown,
  owner: string,
): Record<string, unknown> => {
  if (value === undefined) return {};
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${owner} must be an object.`);
  }
  return value as Record<string, unknown>;
};

const assertAllowedKeys = (
  value: Record<string, unknown>,
  allowed: readonly string[],
  owner: string,
) => {
  const unexpected = Object.keys(value).filter((key) => !allowed.includes(key));
  if (unexpected.length > 0) {
    throw new Error(
      `Unsupported ${owner} field${unexpected.length === 1 ? "" : "s"}: ${unexpected.join(", ")}.`,
    );
  }
};

const readInteger = (
  value: unknown,
  fallback: number,
  owner: string,
  minimum: number,
) => {
  if (value === undefined) return fallback;
  if (!Number.isInteger(value) || (value as number) < minimum) {
    throw new Error(`${owner} must be an integer greater than or equal to ${minimum}.`);
  }
  return value as number;
};

const readEnum = <Value extends string>(
  value: unknown,
  fallback: Value,
  allowed: readonly Value[],
  owner: string,
): Value => {
  if (value === undefined) return fallback;
  if (typeof value !== "string" || !allowed.includes(value as Value)) {
    throw new Error(`${owner} must be one of: ${allowed.join(", ")}.`);
  }
  return value as Value;
};

const readIdList = (value: unknown, owner: string): Array<string | number> => {
  if (value === undefined) return [];
  if (!Array.isArray(value)) throw new Error(`${owner} must be an array.`);
  const result = value.filter(
    (entry): entry is string | number =>
      (typeof entry === "string" && entry.trim().length > 0) ||
      (typeof entry === "number" && Number.isInteger(entry) && entry > 0),
  );
  if (result.length !== value.length) {
    throw new Error(`${owner} must contain only non-empty IDs.`);
  }
  return result;
};

const readTerms = (
  value: unknown,
): { categories: Array<string | number>; tags: Array<string | number> } => {
  if (value === undefined) return { categories: [], tags: [] };
  if (!Array.isArray(value)) throw new Error("query.filters.terms must be an array.");

  const categories: Array<string | number> = [];
  const tags: Array<string | number> = [];
  value.forEach((entry, index) => {
    const term = assertRecord(entry, `query.filters.terms[${index}]`);
    assertAllowedKeys(
      term,
      ["taxonomy", "ids"],
      `WordPress post collection term filter at index ${index}`,
    );
    if (term.taxonomy === undefined || term.ids === undefined) {
      throw new Error(
        `query.filters.terms[${index}] requires taxonomy and ids.`,
      );
    }
    const taxonomy = readEnum(
      term.taxonomy,
      "category",
      ["category", "tag"] as const,
      `query.filters.terms[${index}].taxonomy`,
    );
    const ids = readIdList(term.ids, `query.filters.terms[${index}].ids`);
    if (taxonomy === "category") categories.push(...ids);
    else tags.push(...ids);
  });
  return { categories, tags };
};

/**
 * Compile inert document data into the one approved WPGraphQL operation.
 * Document values can affect variables only; they can never alter query text.
 */
export function compileWordPressPostCollectionQuery(
  queryData: DynamicContentContextDescriptor["query"],
  options?: { resolvedRawTerms?: ResolvedRawTerm[] },
): CompiledWordPressPostCollectionQuery {
  const query = assertRecord(queryData, "WordPress post collection query");
  assertAllowedKeys(
    query,
    ["archive", "start", "quantity", "order", "direction", "search", "filters"],
    "WordPress post collection query",
  );

  const start = readInteger(query.start, 0, "query.start", 0);
  const quantity = readInteger(
    query.quantity,
    DEFAULT_QUANTITY,
    "query.quantity",
    1,
  );
  if (start + quantity > MAX_QUERY_WINDOW) {
    throw new Error(
      `WordPress post collection start + quantity cannot exceed ${MAX_QUERY_WINDOW}.`,
    );
  }

  const order = readEnum(
    query.order,
    "date",
    Object.keys(ORDER_FIELDS) as WordPressPostCollectionOrder[],
    "query.order",
  );
  const direction = readEnum(
    query.direction,
    "desc",
    ["asc", "desc"] as const,
    "query.direction",
  );

  const filters = assertRecord(query.filters, "query.filters");
  assertAllowedKeys(
    filters,
    ["authors", "categories", "tags", "terms", "rawTermIds", "termMatch"],
    "WordPress post collection filter",
  );
  const termMatch = readEnum(
    filters.termMatch,
    "any",
    ["any"] as const,
    "query.filters.termMatch",
  );
  const authors = readIdList(filters.authors, "query.filters.authors");
  const terms = readTerms(filters.terms);
  const rawTermIds = readIdList(filters.rawTermIds, "query.filters.rawTermIds");
  if (rawTermIds.length > 0 && !options?.resolvedRawTerms) {
    throw new Error("query.filters.rawTermIds must be resolved by the WordPress provider before compilation.");
  }
  const resolvedTerms = options?.resolvedRawTerms ?? [];
  const categories = Array.from(new Set([
    ...readIdList(filters.categories, "query.filters.categories"),
    ...terms.categories,
  ]));
  const tags = Array.from(new Set([
    ...readIdList(filters.tags, "query.filters.tags"),
    ...terms.tags,
    ...resolvedTerms.filter((term) => term.taxonomy === "tag").map((term) => term.id),
  ]));
  categories.push(...resolvedTerms.filter((term) => term.taxonomy === "category").map((term) => term.id));
  const uniqueCategories = Array.from(new Set(categories));
  const uniqueTags = Array.from(new Set(tags));

  const where: Record<string, unknown> = {
    orderby: [{ field: ORDER_FIELDS[order], order: direction.toUpperCase() }],
  };
  if (query.search !== undefined) {
    if (typeof query.search !== "string") throw new Error("query.search must be a string.");
    const search = query.search.trim();
    if (search) where.search = search;
  }
  if (authors.length > 0) where.authorIn = authors;
  if (uniqueCategories.length > 0) where.categoryIn = uniqueCategories;
  if (uniqueTags.length > 0) where.tagIn = uniqueTags;

  // Kept explicit so broadening term matching requires an intentional compiler change.
  void termMatch;

  return {
    query: WORDPRESS_POST_COLLECTION_QUERY,
    variables: { first: start + quantity, where },
    start,
    quantity,
  };
}

const stringValue = (value: unknown): string | undefined =>
  typeof value === "string" ? value : undefined;

const identifierValue = (value: unknown): string | number | undefined =>
  (typeof value === "string" && value.length > 0) ||
  (typeof value === "number" && Number.isFinite(value))
    ? value
    : undefined;

const compactRecord = (
  values: Record<string, DynamicContentData | undefined>,
): Record<string, DynamicContentData> =>
  Object.fromEntries(
    Object.entries(values).filter(
      (entry): entry is [string, DynamicContentData] => entry[1] !== undefined,
    ),
  );

const normalizeTerm = (
  node: WordPressTermNode | null | undefined,
): Record<string, DynamicContentData> | undefined => {
  if (!node || typeof node !== "object") return undefined;
  const normalized = compactRecord({
    id: identifierValue(node.id) ?? identifierValue(node.databaseId),
    databaseId: identifierValue(node.databaseId),
    name: stringValue(node.name),
    slug: stringValue(node.slug),
    uri: stringValue(node.uri),
  });
  return Object.keys(normalized).length > 0 ? normalized : undefined;
};

type WordPressTermResolutionNode = {
  databaseId?: unknown;
  __typename?: unknown;
};

type WordPressTermsResponse = {
  terms?: { nodes?: WordPressTermResolutionNode[] | null } | null;
};

const normalizeResolvedTaxonomy = (typename: unknown): "category" | "tag" => {
  if (typename === "Category") return "category";
  if (typename === "Tag" || typename === "PostTag") return "tag";
  throw new Error(`Unsupported WordPress taxonomy returned for raw term ID: ${String(typename)}.`);
};

async function resolveRawWordPressTerms(
  rawTermIds: Array<string | number>,
  endpoint: string,
): Promise<ResolvedRawTerm[]> {
  const uniqueIds = Array.from(new Set(rawTermIds));
  const data = await graphqlFetch<WordPressTermsResponse>(
    WORDPRESS_TERM_RESOLUTION_QUERY,
    { where: { include: uniqueIds } },
    { endpoint },
  );
  const nodes = data.terms?.nodes ?? [];
  // YOOtheme term IDs are site-local. A freshly connected WordPress site may
  // have no matching categories/tags at all (for example, every post is still
  // Uncategorized). In that case, keep the collection usable by broadening
  // the imported filter to all posts. A partial match remains an error so we
  // do not silently change an intentional taxonomy selection.
  if (nodes.length === 0) return [];
  const seen = new Set<string>();
  const resolved = nodes.map((node) => {
    const id = identifierValue(node.databaseId);
    const key = id === undefined ? "" : String(id);
    if (id === undefined || seen.has(key)) {
      throw new Error("WordPress raw term resolution returned an ambiguous or invalid term ID.");
    }
    seen.add(key);
    return { taxonomy: normalizeResolvedTaxonomy(node.__typename), id };
  });
  const missing = uniqueIds.filter((id) => !seen.has(String(id)));
  if (missing.length > 0) {
    throw new Error(`WordPress raw term ID(s) did not resolve: ${missing.join(", ")}.`);
  }
  return rawTermIds.map((id) => {
    const match = resolved.find((term) => String(term.id) === String(id));
    if (!match) throw new Error(`WordPress raw term ID did not resolve: ${String(id)}.`);
    return match;
  });
}

const setField = (
  fields: Record<string, DynamicItemContextValue>,
  path: string,
  value: DynamicItemContextValue | undefined,
) => {
  if (value !== undefined) fields[path] = value;
};

/** Normalize a selected WordPress post shape; the raw response is never retained. */
export function normalizeWordPressPostContext(
  post: WordPressPostNode,
): DynamicItemContext {
  const fields: Record<string, DynamicItemContextValue> = {};
  const id = identifierValue(post.id) ?? identifierValue(post.databaseId);
  const title = stringValue(post.title);
  const content = stringValue(post.content);
  const excerpt = stringValue(post.excerpt);
  const date = stringValue(post.date);
  const modifiedDate = stringValue(post.modified);
  const originPermalink = stringValue(post.link);
  const slug = stringValue(post.slug);
  const uri = stringValue(post.uri);
  const storefrontHref = slug
    ? getStorefrontContentHref({ contentType: "post", slug })
    : null;

  if (id !== undefined) setField(fields, "id", { type: "identifier", value: id });
  if (title !== undefined) setField(fields, "title", { type: "string", value: title });
  if (content !== undefined) {
    setField(fields, "content", { type: "richText", value: content });
  }
  if (excerpt !== undefined) {
    setField(fields, "excerpt", { type: "richText", value: excerpt });
  }
  if (date !== undefined) setField(fields, "date", { type: "string", value: date });
  if (modifiedDate !== undefined) {
    setField(fields, "modifiedDate", { type: "string", value: modifiedDate });
  }
  if (originPermalink !== undefined) {
    setField(fields, "origin.permalink", { type: "url", value: originPermalink });
  }
  if (storefrontHref) {
    setField(fields, "storefront.href", { type: "url", value: storefrontHref });
    // Preserve existing authored buttonUrl → link bindings while projecting
    // navigation to the internal WebPages Post route.
    setField(fields, "link", { type: "url", value: storefrontHref });
  }
  if (slug !== undefined) setField(fields, "slug", { type: "string", value: slug });
  if (uri !== undefined) setField(fields, "uri", { type: "url", value: uri });
  if (post.databaseId !== undefined) {
    const databaseId = identifierValue(post.databaseId);
    if (databaseId !== undefined) setField(fields, "databaseId", { type: "identifier", value: databaseId });
  }

  const author = normalizeTerm(post.author?.node);
  const meta = compactRecord({
    slug: stringValue(post.slug),
    status: stringValue(post.status),
    author,
  });
  setField(fields, "meta", { type: "metadata", value: meta });

  const categories = (post.categories?.nodes ?? [])
    .map(normalizeTerm)
    .filter((value): value is Record<string, DynamicContentData> => Boolean(value));
  const tags = (post.tags?.nodes ?? [])
    .map(normalizeTerm)
    .filter((value): value is Record<string, DynamicContentData> => Boolean(value));
  setField(fields, "categories", {
    type: "metadata",
    value: { items: categories },
  });
  setField(fields, "tags", { type: "metadata", value: { items: tags } });

  const image = post.featuredImage?.node;
  const imageUrl = stringValue(image?.sourceUrl);
  const imageAlt = stringValue(image?.altText);
  const imageCaption = stringValue(image?.caption);
  if (imageUrl !== undefined) {
    setField(fields, "featuredImage.url", { type: "url", value: imageUrl });
    setField(fields, "featuredImage", {
      type: "media",
      value: {
        url: imageUrl,
        id: identifierValue(image?.id) ?? identifierValue(image?.databaseId),
        ...(imageAlt !== undefined ? { alt: imageAlt } : {}),
        ...(imageCaption !== undefined ? { caption: imageCaption } : {}),
      },
    });
  }
  if (imageAlt !== undefined) {
    setField(fields, "featuredImage.alt", { type: "string", value: imageAlt });
  }
  if (imageCaption !== undefined) {
    setField(fields, "featuredImage.caption", {
      type: "richText",
      value: imageCaption,
    });
  }

  // Normalize provider-owned ACF media without leaking the GraphQL response.
  // The current public Post schema may omit this projection; in that case the
  // authored binding remains a safe fallback and materialization reports it.
  const acfFields = post.acfFields;
  for (const field of WORDPRESS_POST_ACF_FIELDS) {
    const raw = acfFields?.[field.name];
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) continue;
    // WPGraphQL for ACF exposes media fields as connection edges. Accept the
    // normalized direct shape too so this owner remains compatible with
    // existing provider fixtures and future ACF field types.
    const edge = raw as Record<string, unknown>;
    const media = edge.node && typeof edge.node === "object" && !Array.isArray(edge.node)
      ? edge.node as Record<string, unknown>
      : edge;
    const url = stringValue(media.sourceUrl) ?? stringValue(media.url);
    const alt = stringValue(media.altText) ?? stringValue(media.alt);
    const caption = stringValue(media.caption);
    const id = identifierValue(media.databaseId) ?? identifierValue(media.id);
    if (url !== undefined) setField(fields, `acf.${field.name}.url`, { type: "url", value: url });
    if (alt !== undefined) setField(fields, `acf.${field.name}.alt`, { type: "string", value: alt });
    if (caption !== undefined) setField(fields, `acf.${field.name}.caption`, { type: "richText", value: caption });
    if (id !== undefined) setField(fields, `acf.${field.name}.id`, { type: "identifier", value: id });
    if (url !== undefined) {
      setField(fields, `acf.${field.name}`, {
        type: "media",
        value: { url, ...(id !== undefined ? { id } : {}), ...(alt !== undefined ? { alt } : {}), ...(caption !== undefined ? { caption } : {}) },
      });
    }
  }

  return { ...(id !== undefined ? { id } : {}), fields };
}

export async function resolveWordPressPostContexts(input: {
  website?: SaaSWebsite | null;
  descriptor: DynamicContentContextDescriptor;
}): Promise<DynamicItemContext[]> {
  const { descriptor, website } = input;
  if (descriptor.provider !== "wordpress") {
    throw new Error(`WordPress adapter cannot handle provider: ${descriptor.provider}.`);
  }
  if (descriptor.source !== "post") {
    throw new Error(`Unsupported WordPress Dynamic Content source: ${descriptor.source}.`);
  }
  if (descriptor.mode !== "collection" && descriptor.mode !== "single") {
    throw new Error(`Unsupported WordPress post Dynamic Content mode: ${descriptor.mode}.`);
  }

  const endpoint = getWebsiteGraphQLEndpoint(website);
  if (!endpoint) {
    throw new Error("The active website has no WordPress GraphQL endpoint configured.");
  }

  if (descriptor.mode === "single") {
    const compiled = compileWordPressPostSingleQuery(descriptor.query);
    const data = await fetchWordPressPosts<WordPressPostResponse>(
      compiled.query,
      compiled.variables,
      endpoint,
    );
    return data.post ? [normalizeWordPressPostContext(data.post)] : [];
  }

  const query = assertRecord(descriptor.query, "WordPress post collection query");
  const filters = assertRecord(query.filters, "query.filters");
  const rawTermIds = readIdList(filters.rawTermIds, "query.filters.rawTermIds");
  const resolvedRawTerms = rawTermIds.length > 0
    ? await resolveRawWordPressTerms(rawTermIds, endpoint)
    : undefined;
  const compiled = compileWordPressPostCollectionQuery(descriptor.query, { resolvedRawTerms });
  const data = await fetchWordPressPosts<WordPressPostsResponse>(
    compiled.query,
    compiled.variables,
    endpoint,
  );
  const posts = data.posts?.nodes ?? [];
  return posts
    .slice(compiled.start, compiled.start + compiled.quantity)
    .map(normalizeWordPressPostContext);
}


/** Backwards-compatible collection-owner export. */
export const resolveWordPressPostCollection = resolveWordPressPostContexts;
