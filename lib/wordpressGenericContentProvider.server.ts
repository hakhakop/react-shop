import { getCmsConnection, getWordPressAuthHeaders } from "@/lib/cmsConnection";
import type {
  DynamicContentContextDescriptor,
  DynamicContentData,
  DynamicItemContext,
  DynamicItemContextValue,
} from "@/lib/dynamicContent";
import { getWebsiteGraphQLEndpoint, graphqlFetch } from "@/lib/graphql";
import type { SaaSWebsite } from "@/lib/websites";
import { discoverWordPressContentSchema } from "@/lib/wordpressContentSchema.server";
import type { WordPressDiscoveredField, WordPressDiscoveredSource } from "@/lib/wordpressContentSchema";

const MAX_QUERY_WINDOW = 100;

type GenericNode = Record<string, unknown> & {
  id?: unknown;
  databaseId?: unknown;
  title?: unknown;
  content?: unknown;
  excerpt?: unknown;
  date?: unknown;
  modified?: unknown;
  uri?: unknown;
  slug?: unknown;
  name?: unknown;
  description?: unknown;
  featuredImage?: { node?: Record<string, unknown> | null } | null;
};

type GenericResponse = Record<string, { nodes?: GenericNode[] | null } | null | undefined>;
type GenericTermResponse = {
  terms?: { nodes?: Array<{ databaseId?: unknown; __typename?: unknown }> | null } | null;
};

type TermRelation = { graphqlField: string; ids: Set<string> };
type MetaRelation = { graphqlField: string };

const asRecord = (value: unknown): Record<string, DynamicContentData> =>
  value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, DynamicContentData>
    : {};

const stringValue = (value: unknown) => typeof value === "string" ? value : undefined;
const identifierValue = (value: unknown) =>
  typeof value === "string" || (typeof value === "number" && Number.isFinite(value)) ? value : undefined;

const setField = (
  fields: Record<string, DynamicItemContextValue>,
  path: string,
  value: DynamicItemContextValue | undefined,
) => {
  if (value) fields[path] = value;
};

const quantity = (query: Record<string, DynamicContentData>) => {
  const value = typeof query.quantity === "number" ? query.quantity : 10;
  return Math.max(1, Math.min(MAX_QUERY_WINDOW, Math.trunc(value)));
};

const start = (query: Record<string, DynamicContentData>) => {
  const value = typeof query.start === "number" ? query.start : 0;
  return Math.max(0, Math.trunc(value));
};

const camelCase = (value: string) =>
  value.replace(/_([a-zA-Z0-9])/g, (_match, letter: string) => letter.toUpperCase());

const pascalCase = (value: string) => {
  const result = camelCase(value);
  return result ? result[0].toUpperCase() + result.slice(1) : result;
};

const requestedAcfFields = (
  query: Record<string, DynamicContentData>,
  source: WordPressDiscoveredSource,
): WordPressDiscoveredField[] => {
  const paths = Array.isArray(query.requestedFields) ? query.requestedFields : [];
  const requested = new Map<string, WordPressDiscoveredField>();
  for (const value of paths) {
    if (typeof value !== "string" || !/^acf\.[a-zA-Z0-9_]+(?:\.[a-zA-Z0-9_]+)?$/.test(value)) continue;
    const [, base, child] = value.split(".");
    if (!base) continue;
    const path = `acf.${base}`;
    const media = ["url", "alt", "caption", "id"].includes(child ?? "");
    requested.set(path, {
      path,
      label: base,
      valueType: media ? "media" : "string",
      graphqlName: camelCase(base),
      // WPGraphQL for ACF v2 exposes fields below the field-group name. The
      // source single name is the safest convention-only fallback when schema
      // introspection is disabled; introspected fields override this guess.
      graphqlContainer: `${source.graphqlSingleName}Fields`,
      graphqlKind: media ? "media" : "scalar",
    });
  }
  return Array.from(requested.values());
};

const uniqueBaseFields = (source: WordPressDiscoveredSource) =>
  source.fields.filter((field, index, fields) =>
    field.path.split(".").length === 2 && fields.findIndex((candidate) => candidate.graphqlName === field.graphqlName) === index,
  );

const acfSelection = (field: WordPressDiscoveredField) => {
  if (field.graphqlKind === "scalar") return field.graphqlName;
  if (field.graphqlKind === "media") {
    return `${field.graphqlName} { node { id databaseId sourceUrl altText caption } }`;
  }
  return "";
};

const acfSelections = (fields: WordPressDiscoveredField[]) => {
  const direct: string[] = [];
  const containers = new Map<string, string[]>();
  for (const field of fields) {
    const selection = acfSelection(field);
    if (!selection) continue;
    if (!field.graphqlContainer) direct.push(selection);
    else containers.set(field.graphqlContainer, [...(containers.get(field.graphqlContainer) ?? []), selection]);
  }
  return [
    ...direct,
    ...Array.from(containers, ([container, selections]) => `${container} { ${selections.join("\n")} }`),
  ].join("\n");
};

const OPTIONAL_CONTENT_INTERFACES = [
  "NodeWithTitle",
  "NodeWithContentEditor",
  "NodeWithExcerpt",
  "NodeWithFeaturedImage",
] as const;

type OptionalContentInterface = typeof OPTIONAL_CONTENT_INTERFACES[number];

const supportedInterfaceCache = new Map<string, Set<OptionalContentInterface>>();

const contentSelection = (
  fields: WordPressDiscoveredField[],
  interfaces: ReadonlySet<OptionalContentInterface>,
  termRelations: TermRelation[],
  metaRelation?: MetaRelation,
) => `
  __typename
  id
  databaseId
  uri
  slug
  ${interfaces.has("NodeWithTitle") ? "... on NodeWithTitle { title }" : ""}
  ${interfaces.has("NodeWithContentEditor") ? "... on NodeWithContentEditor { content }" : ""}
  ${interfaces.has("NodeWithExcerpt") ? "... on NodeWithExcerpt { excerpt }" : ""}
  ${interfaces.has("NodeWithFeaturedImage") ? `... on NodeWithFeaturedImage {
    featuredImage { node { id databaseId sourceUrl altText caption } }
  }` : ""}
  ${termRelations.map((relation) => `${relation.graphqlField} { nodes { databaseId } }`).join("\n")}
  ${metaRelation ? `${metaRelation.graphqlField} { nodes { name uri } }` : ""}
  ${acfSelections(fields)}
`;

const taxonomySelection = (fields: WordPressDiscoveredField[]) => `
  __typename
  id
  databaseId
  name
  slug
  uri
  description
  ${acfSelections(fields)}
`;

const normalizeMedia = (
  fields: Record<string, DynamicItemContextValue>,
  path: string,
  value: unknown,
) => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return;
  const record = value as Record<string, unknown>;
  const raw = record.node && typeof record.node === "object" && !Array.isArray(record.node)
    ? record.node as Record<string, unknown>
    : record;
  const url = stringValue(raw.sourceUrl) ?? stringValue(raw.url);
  const alt = stringValue(raw.altText) ?? stringValue(raw.alt);
  const caption = stringValue(raw.caption);
  const id = identifierValue(raw.databaseId) ?? identifierValue(raw.id);
  if (url !== undefined) {
    setField(fields, path, { type: "media", value: { url, ...(id !== undefined ? { id } : {}), ...(alt !== undefined ? { alt } : {}), ...(caption !== undefined ? { caption } : {}) } });
    setField(fields, `${path}.url`, { type: "url", value: url });
  }
  if (alt !== undefined) setField(fields, `${path}.alt`, { type: "string", value: alt });
  if (caption !== undefined) setField(fields, `${path}.caption`, { type: "richText", value: caption });
  if (id !== undefined) setField(fields, `${path}.id`, { type: "identifier", value: id });
};

const normalizeAcfFields = (
  fields: Record<string, DynamicItemContextValue>,
  node: GenericNode,
  source: WordPressDiscoveredSource,
) => {
  for (const field of uniqueBaseFields(source)) {
    const container = field.graphqlContainer ? node[field.graphqlContainer] : node;
    const raw = container && typeof container === "object" && !Array.isArray(container)
      ? (container as Record<string, unknown>)[field.graphqlName]
      : undefined;
    if (field.graphqlKind === "media") {
      normalizeMedia(fields, field.path, raw);
    } else if (field.graphqlKind === "scalar") {
      if (field.valueType === "number" && typeof raw === "number") setField(fields, field.path, { type: "number", value: raw });
      else if (field.valueType === "identifier" && identifierValue(raw) !== undefined) setField(fields, field.path, { type: "identifier", value: identifierValue(raw)! });
      else if (typeof raw === "string") setField(fields, field.path, { type: field.valueType === "richText" ? "richText" : "string", value: raw });
    }
  }
};

const normalizeNode = (
  node: GenericNode,
  source: WordPressDiscoveredSource,
  metaRelation?: MetaRelation,
): DynamicItemContext => {
  const fields: Record<string, DynamicItemContextValue> = {};
  const id = identifierValue(node.id) ?? identifierValue(node.databaseId);
  const databaseId = identifierValue(node.databaseId);
  setField(fields, "id", id === undefined ? undefined : { type: "identifier", value: id });
  setField(fields, "databaseId", databaseId === undefined ? undefined : { type: "identifier", value: databaseId });

  if (source.kind === "taxonomy") {
    const name = stringValue(node.name);
    const description = stringValue(node.description);
    const slug = stringValue(node.slug);
    const link = stringValue(node.uri);
    if (name !== undefined) setField(fields, "name", { type: "string", value: name });
    if (description !== undefined) setField(fields, "description", { type: "richText", value: description });
    if (slug !== undefined) setField(fields, "slug", { type: "string", value: slug });
    if (link !== undefined) setField(fields, "link", { type: "url", value: link });
    normalizeAcfFields(fields, node, source);
    return { ...(id !== undefined ? { id } : {}), fields };
  }

  const scalarFields = [
    ["title", "string"], ["content", "richText"], ["excerpt", "richText"],
    ["date", "string"], ["modified", "string"], ["slug", "string"], ["uri", "url"],
  ] as const;
  scalarFields.forEach(([key, type]) => {
    const value = stringValue(node[key]);
    if (value !== undefined) setField(fields, key === "modified" ? "modifiedDate" : key === "uri" ? "link" : key, { type, value } as DynamicItemContextValue);
  });
  normalizeMedia(fields, "featuredImage", node.featuredImage);
  if (metaRelation) {
    const relation = node[metaRelation.graphqlField];
    const relationNodes = relation && typeof relation === "object" && !Array.isArray(relation)
      ? (relation as { nodes?: Array<{ name?: unknown }> }).nodes ?? []
      : [];
    const labels = relationNodes.map((term) => stringValue(term.name)).filter((name): name is string => Boolean(name));
    if (labels.length > 0) setField(fields, "metaString", { type: "string", value: labels.join(", ") });
  }
  normalizeAcfFields(fields, node, source);
  return { ...(id !== undefined ? { id } : {}), fields };
};

const resolveSource = (
  sources: WordPressDiscoveredSource[],
  query: Record<string, DynamicContentData>,
) => {
  const sourceName = stringValue(query.sourceName);
  const graphqlPluralName = stringValue(query.graphqlPluralName) ?? stringValue(query.graphqlRoot);
  const yoothemeNamespace = stringValue(query.yoothemeQueryName)?.split(".")[0];
  const identity = (value: string | undefined) => {
    const compact = value?.replace(/[^0-9A-Za-z]/g, "").toLowerCase() ?? "";
    return compact.endsWith("ies")
      ? `${compact.slice(0, -3)}y`
      : compact.endsWith("s") && !compact.endsWith("ss")
        ? compact.slice(0, -1)
        : compact;
  };
  const yoothemeIdentity = identity(yoothemeNamespace);
  return sources.find((source) => sourceName && source.name === sourceName) ??
    sources.find((source) => graphqlPluralName && source.graphqlPluralName === graphqlPluralName) ??
    sources.find((source) => yoothemeIdentity && [source.name, source.graphqlSingleName, source.graphqlPluralName]
      .some((candidate) => identity(candidate) === yoothemeIdentity));
};

const resolveMetaRelation = (
  query: Record<string, DynamicContentData>,
  sources: WordPressDiscoveredSource[],
): MetaRelation | undefined => {
  const taxonomyName = stringValue(query.metaTaxonomy);
  if (!taxonomyName) return undefined;
  const taxonomy = sources.find((source) => source.kind === "taxonomy" && source.name === taxonomyName);
  return taxonomy ? { graphqlField: taxonomy.graphqlPluralName } : undefined;
};

const rawSourceTermIds = (query: Record<string, DynamicContentData>) => {
  const sourceQuery = asRecord(query.sourceQuery);
  const args = asRecord(sourceQuery.arguments);
  return Array.isArray(args.terms)
    ? args.terms.filter((value): value is string | number =>
        typeof value === "string" || (typeof value === "number" && Number.isFinite(value)),
      )
    : [];
};

async function resolveTermRelations(input: {
  query: Record<string, DynamicContentData>;
  sources: WordPressDiscoveredSource[];
  endpoint: string;
  headers?: Record<string, string>;
}): Promise<TermRelation[]> {
  const ids = rawSourceTermIds(input.query);
  if (ids.length === 0) return [];
  const data = await graphqlFetch<GenericTermResponse>(`
    query WebPagesGenericWordPressTerms($where: RootQueryToTermNodeConnectionWhereArgs) {
      terms(where: $where) { nodes { databaseId __typename } }
    }
  `, { where: { include: Array.from(new Set(ids)) } }, {
    endpoint: input.endpoint,
    headers: input.headers,
  });
  const grouped = new Map<string, Set<string>>();
  for (const node of data.terms?.nodes ?? []) {
    const id = identifierValue(node.databaseId);
    const typename = stringValue(node.__typename);
    if (id === undefined || !typename) continue;
    const taxonomy = input.sources.find((candidate) =>
      candidate.kind === "taxonomy" && pascalCase(candidate.graphqlSingleName) === typename,
    );
    if (!taxonomy) continue;
    const values = grouped.get(taxonomy.graphqlPluralName) ?? new Set<string>();
    values.add(String(id));
    grouped.set(taxonomy.graphqlPluralName, values);
  }
  return Array.from(grouped, ([graphqlField, resolvedIds]) => ({ graphqlField, ids: resolvedIds }));
}

export async function resolveWordPressGenericContentContexts(input: {
  website?: SaaSWebsite | null;
  descriptor: DynamicContentContextDescriptor;
}): Promise<DynamicItemContext[]> {
  const { descriptor, website } = input;
  if (descriptor.provider !== "wordpress" || descriptor.source !== "content") {
    throw new Error(`Generic WordPress adapter cannot handle ${descriptor.provider}/${descriptor.source}.`);
  }
  const query = asRecord(descriptor.query);
  const schema = await discoverWordPressContentSchema(website);
  const source = resolveSource(schema.sources, query);
  if (!source) throw new Error("The requested WordPress content type or taxonomy is not exposed by WPGraphQL.");
  const root = source.graphqlPluralName;
  if (!/^[_A-Za-z][_0-9A-Za-z]*$/.test(root)) throw new Error("WordPress returned an invalid GraphQL root field name.");
  const cms = getCmsConnection(website);
  const endpoint = getWebsiteGraphQLEndpoint(website);
  if (!endpoint) throw new Error("The active website has no WordPress GraphQL endpoint configured.");
  const headers = getWordPressAuthHeaders(cms) ?? undefined;
  const termRelations = source.kind === "contentType"
    ? await resolveTermRelations({ query, sources: schema.sources, endpoint, headers })
    : [];
  const metaRelation = source.kind === "contentType"
    ? resolveMetaRelation(query, schema.sources)
    : undefined;
  const offset = start(query);
  const limit = quantity(query);
  const requestedDatabaseId = identifierValue(query.databaseId);
  const first = termRelations.length > 0 || requestedDatabaseId !== undefined
    ? MAX_QUERY_WINDOW
    : Math.min(MAX_QUERY_WINDOW, offset + limit);
  const discoveredFields = uniqueBaseFields(source);
  const guessedFields = requestedAcfFields(query, source)
    .filter((field) => !discoveredFields.some((candidate) => candidate.path === field.path));
  let projectedFields = [...discoveredFields, ...guessedFields];
  let data: GenericResponse;
  if (source.kind === "taxonomy") {
    while (true) {
      const document = `query WebPagesGenericWordPressContent { ${root}(first: ${first}) { nodes { ${taxonomySelection(projectedFields)} } } }`;
      try {
        data = await graphqlFetch<GenericResponse>(document, undefined, { endpoint, headers });
        break;
      } catch (error) {
        if (guessedFields.length > 0 && projectedFields.some((field) => guessedFields.includes(field))) {
          projectedFields = discoveredFields;
          continue;
        }
        throw error;
      }
    }
  } else {
    const cacheKey = `${schema.endpoint}:${source.name}`;
    const interfaces = new Set(supportedInterfaceCache.get(cacheKey) ?? OPTIONAL_CONTENT_INTERFACES);
    while (true) {
      const document = `query WebPagesGenericWordPressContent { ${root}(first: ${first}) { nodes { ${contentSelection(projectedFields, interfaces, termRelations, metaRelation)} } } }`;
      try {
        data = await graphqlFetch<GenericResponse>(document, undefined, { endpoint, headers });
        supportedInterfaceCache.set(cacheKey, new Set(interfaces));
        break;
      } catch (error) {
        const message = error instanceof Error ? error.message : "";
        const unsupported = OPTIONAL_CONTENT_INTERFACES.find((name) =>
          interfaces.has(name) && message.includes(`never be of type \"${name}\"`),
        );
        if (unsupported) {
          interfaces.delete(unsupported);
          continue;
        }
        // ACF may be enabled while a field group is not yet queryable (for
        // example, it has not been saved after enabling Show in GraphQL). Keep
        // the standard CPT projection usable and retain authored fallbacks.
        if (guessedFields.length > 0 && projectedFields.some((field) => guessedFields.includes(field))) {
          projectedFields = discoveredFields;
          continue;
        }
        throw error;
      }
    }
  }
  const normalizationSource = { ...source, fields: [
    ...source.fields,
    ...requestedAcfFields(query, source).filter((field) => !source.fields.some((candidate) => candidate.path === field.path)),
  ] };
  const nodes = (data[root]?.nodes ?? []).filter((node) => {
    if (requestedDatabaseId !== undefined && String(identifierValue(node.databaseId)) !== String(requestedDatabaseId)) {
      return false;
    }
    if (termRelations.length === 0) return true;
    return termRelations.some((relation) => {
      const value = node[relation.graphqlField];
      const relationNodes = value && typeof value === "object" && !Array.isArray(value)
        ? (value as { nodes?: Array<{ databaseId?: unknown }> }).nodes ?? []
        : [];
      return relationNodes.some((term) => {
        const id = identifierValue(term.databaseId);
        return id !== undefined && relation.ids.has(String(id));
      });
    });
  });
  const selectedNodes = descriptor.mode === "single"
    ? nodes.slice(0, 1)
    : nodes.slice(offset, offset + limit);
  return selectedNodes.map((node) => normalizeNode(node, normalizationSource, metaRelation));
}
