import { getCmsConnection, getWordPressAuthHeaders } from "@/lib/cmsConnection";
import { getWebsiteGraphQLEndpoint, graphqlFetch } from "@/lib/graphql";
import type { DynamicContentValueType } from "@/lib/dynamicContent";
import type { SaaSWebsite } from "@/lib/websites";
import type {
  WordPressContentSchema,
  WordPressDiscoveredField,
  WordPressDiscoveredSource,
} from "@/lib/wordpressContentSchema";

type TypeNode = {
  name?: string | null;
  graphqlSingleName?: string | null;
  graphqlPluralName?: string | null;
  label?: string | null;
};

type SchemaCatalogResponse = {
  contentTypes?: { nodes?: TypeNode[] | null } | null;
  taxonomies?: { nodes?: TypeNode[] | null } | null;
};

type IntrospectionTypeRef = {
  kind?: string | null;
  name?: string | null;
  ofType?: IntrospectionTypeRef | null;
};

type IntrospectionField = { name?: string | null; type?: IntrospectionTypeRef | null };
type IntrospectionType = {
  name?: string | null;
  interfaces?: Array<{ name?: string | null }> | null;
  fields?: IntrospectionField[] | null;
};

type IntrospectionResponse = { __type?: IntrospectionType | null };

const CATALOG_QUERY = `
  query WebPagesWordPressContentSchema {
    contentTypes(first: 100) {
      nodes { name graphqlSingleName graphqlPluralName label }
    }
    taxonomies(first: 100) {
      nodes { name graphqlSingleName graphqlPluralName label }
    }
  }
`;

const TYPE_QUERY = `
  query WebPagesWordPressType($name: String!) {
    __type(name: $name) {
      name
      interfaces { name }
      fields {
        name
        type { kind name ofType { kind name ofType { kind name ofType { kind name } } } }
      }
    }
  }
`;

const SCHEMA_CACHE_TTL_MS = 60_000;
const schemaCache = new Map<string, { expiresAt: number; value: Promise<WordPressContentSchema> }>();

const validGraphQLName = (value: unknown): value is string =>
  typeof value === "string" && /^[_A-Za-z][_0-9A-Za-z]*$/.test(value);

const pascalCase = (value: string) =>
  value
    .replace(/(^|[_-]+)([a-zA-Z0-9])/g, (_match, _prefix, letter: string) => letter.toUpperCase())
    .replace(/[^_0-9A-Za-z]/g, "");

const snakeCase = (value: string) =>
  value.replace(/([a-z0-9])([A-Z])/g, "$1_$2").replace(/[-\s]+/g, "_").toLowerCase();

const labelForField = (value: string) =>
  snakeCase(value).split("_").filter(Boolean).map((word) => word[0]?.toUpperCase() + word.slice(1)).join(" ");

const unwrapType = (value: IntrospectionTypeRef | null | undefined): IntrospectionTypeRef | null => {
  let current = value ?? null;
  while (current?.ofType && (current.kind === "NON_NULL" || current.kind === "LIST")) current = current.ofType;
  return current;
};

const fieldShape = (field: IntrospectionField) => {
  const type = unwrapType(field.type);
  const name = type?.name ?? "";
  if (name === "String") return { valueType: "string" as const, graphqlKind: "scalar" as const };
  if (name === "Int" || name === "Float") return { valueType: "number" as const, graphqlKind: "scalar" as const };
  if (name === "ID") return { valueType: "identifier" as const, graphqlKind: "scalar" as const };
  if (/MediaItem/i.test(name)) return { valueType: "media" as const, graphqlKind: "media" as const };
  return { valueType: "metadata" as const, graphqlKind: "metadata" as const };
};

const discoveredFields = (
  fields: IntrospectionField[] | null | undefined,
  graphqlContainer?: string,
): WordPressDiscoveredField[] =>
  (fields ?? []).flatMap((field) => {
    if (!validGraphQLName(field.name)) return [];
    const shape = fieldShape(field);
    const name = snakeCase(field.name);
    const base: WordPressDiscoveredField = {
      path: `acf.${name}`,
      label: labelForField(field.name),
      graphqlName: field.name,
      ...(graphqlContainer ? { graphqlContainer } : {}),
      ...shape,
    };
    if (shape.graphqlKind !== "media") return [base];
    return [
      base,
      { ...base, path: `${base.path}.url`, label: `${base.label} → URL`, valueType: "url" as DynamicContentValueType },
      { ...base, path: `${base.path}.alt`, label: `${base.label} → Alt`, valueType: "string" as DynamicContentValueType },
      { ...base, path: `${base.path}.caption`, label: `${base.label} → Caption`, valueType: "richText" as DynamicContentValueType },
      { ...base, path: `${base.path}.id`, label: `${base.label} → ID`, valueType: "identifier" as DynamicContentValueType },
    ];
  });

const toSource = (node: TypeNode, kind: WordPressDiscoveredSource["kind"]): WordPressDiscoveredSource | null => {
  if (!validGraphQLName(node.name) || !validGraphQLName(node.graphqlSingleName) || !validGraphQLName(node.graphqlPluralName)) return null;
  return {
    kind,
    name: node.name,
    label: node.label?.trim() || node.graphqlPluralName,
    graphqlSingleName: node.graphqlSingleName,
    graphqlPluralName: node.graphqlPluralName,
    fields: [],
  };
};

async function loadWordPressContentSchema(
  website?: SaaSWebsite | null,
): Promise<WordPressContentSchema> {
  const cms = getCmsConnection(website);
  const endpoint = getWebsiteGraphQLEndpoint(website);
  if (!endpoint) throw new Error("The active website has no WordPress GraphQL endpoint configured.");
  const headers = getWordPressAuthHeaders(cms) ?? undefined;
  const catalog = await graphqlFetch<SchemaCatalogResponse>(CATALOG_QUERY, undefined, { endpoint, headers });
  const sources = [
    ...(catalog.contentTypes?.nodes ?? []).flatMap((node) => toSource(node, "contentType") ?? []),
    ...(catalog.taxonomies?.nodes ?? []).flatMap((node) => toSource(node, "taxonomy") ?? []),
  ];

  let introspectionAvailable = true;
  try {
    await Promise.all(sources.map(async (source) => {
      const objectType = await graphqlFetch<IntrospectionResponse>(TYPE_QUERY, {
        name: pascalCase(source.graphqlSingleName),
      }, { endpoint, headers });
      const acfInterfaces = (objectType.__type?.interfaces ?? [])
        .map((entry) => entry.name)
        .filter((name): name is string => typeof name === "string" && name !== "AcfFieldGroup" && /(?:_Fields|Fields)$/i.test(name));
      const interfaceTypes = await Promise.all(acfInterfaces.map((name) =>
        graphqlFetch<IntrospectionResponse>(TYPE_QUERY, { name }, { endpoint, headers }),
      ));
      const groupFields = (objectType.__type?.fields ?? []).flatMap((field) => {
        const type = unwrapType(field.type);
        return validGraphQLName(field.name) && type?.kind === "OBJECT" && validGraphQLName(type.name) &&
          (type.name.includes("_") || /acf/i.test(type.name))
          ? [{ fieldName: field.name, typeName: type.name }]
          : [];
      });
      const groupTypes = await Promise.all(groupFields.map(async (group) => ({
        group,
        type: await graphqlFetch<IntrospectionResponse>(TYPE_QUERY, { name: group.typeName }, { endpoint, headers }),
      })));
      const nestedGroupFields = groupTypes.flatMap(({ group, type }) =>
        (type.__type?.interfaces ?? []).some((entry) => entry.name === "AcfFieldGroup")
          ? discoveredFields(type.__type?.fields, group.fieldName)
          : [],
      );
      source.fields = [
        ...interfaceTypes.flatMap((entry) => discoveredFields(entry.__type?.fields)),
        ...nestedGroupFields,
      ];
    }));
  } catch {
    introspectionAvailable = false;
  }

  return { endpoint, introspectionAvailable, sources };
}

export async function discoverWordPressContentSchema(
  website?: SaaSWebsite | null,
): Promise<WordPressContentSchema> {
  const endpoint = getWebsiteGraphQLEndpoint(website);
  if (!endpoint) throw new Error("The active website has no WordPress GraphQL endpoint configured.");
  const cacheKey = `${website?.id ?? "default"}:${endpoint}`;
  const cached = schemaCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) return cached.value;
  const value = loadWordPressContentSchema(website);
  schemaCache.set(cacheKey, { expiresAt: Date.now() + SCHEMA_CACHE_TTL_MS, value });
  value.catch(() => {
    if (schemaCache.get(cacheKey)?.value === value) schemaCache.delete(cacheKey);
  });
  return value;
}
