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
  start?: number;
  quantity?: number;
  order?: WordPressPostCollectionOrder;
  direction?: "asc" | "desc";
  filters?: {
    authors?: Array<string | number>;
    categories?: Array<string | number>;
    tags?: Array<string | number>;
    terms?: Array<{
      taxonomy: "category" | "tag";
      ids: Array<string | number>;
    }>;
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
};

type WordPressPostsResponse = {
  posts?: {
    nodes?: WordPressPostNode[] | null;
  } | null;
};

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
): CompiledWordPressPostCollectionQuery {
  const query = assertRecord(queryData, "WordPress post collection query");
  assertAllowedKeys(
    query,
    ["start", "quantity", "order", "direction", "filters"],
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
    ["authors", "categories", "tags", "terms", "termMatch"],
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
  const categories = Array.from(new Set([
    ...readIdList(filters.categories, "query.filters.categories"),
    ...terms.categories,
  ]));
  const tags = Array.from(new Set([
    ...readIdList(filters.tags, "query.filters.tags"),
    ...terms.tags,
  ]));

  const where: Record<string, unknown> = {
    orderby: [{ field: ORDER_FIELDS[order], order: direction.toUpperCase() }],
  };
  if (authors.length > 0) where.authorIn = authors;
  if (categories.length > 0) where.categoryIn = categories;
  if (tags.length > 0) where.tagIn = tags;

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
  const link = stringValue(post.link);

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
  if (link !== undefined) setField(fields, "link", { type: "url", value: link });

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

  return { ...(id !== undefined ? { id } : {}), fields };
}

export async function resolveWordPressPostCollection(input: {
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
  if (descriptor.mode !== "collection") {
    throw new Error(`Unsupported WordPress post Dynamic Content mode: ${descriptor.mode}.`);
  }

  const endpoint = getWebsiteGraphQLEndpoint(website);
  if (!endpoint) {
    throw new Error("The active website has no WordPress GraphQL endpoint configured.");
  }

  const compiled = compileWordPressPostCollectionQuery(descriptor.query);
  const data = await graphqlFetch<WordPressPostsResponse>(
    compiled.query,
    compiled.variables,
    { endpoint },
  );
  const posts = data.posts?.nodes ?? [];
  return posts
    .slice(compiled.start, compiled.start + compiled.quantity)
    .map(normalizeWordPressPostContext);
}
