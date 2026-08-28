import type { DynamicContentSourceCapability, DynamicContentSourceField } from "@/lib/dynamicContentCapabilities";

export type WordPressDiscoveredField = DynamicContentSourceField & {
  graphqlName: string;
  graphqlContainer?: string;
  graphqlKind: "scalar" | "media" | "metadata";
};

export type WordPressDiscoveredSource = {
  kind: "contentType" | "taxonomy";
  name: string;
  label: string;
  graphqlSingleName: string;
  graphqlPluralName: string;
  fields: WordPressDiscoveredField[];
};

export type WordPressContentSchema = {
  endpoint: string;
  introspectionAvailable: boolean;
  sources: WordPressDiscoveredSource[];
};

const contentFields: readonly DynamicContentSourceField[] = [
  { path: "title", label: "Title", valueType: "string" },
  { path: "content", label: "Content", valueType: "richText" },
  { path: "excerpt", label: "Excerpt", valueType: "richText" },
  { path: "date", label: "Date", valueType: "string" },
  { path: "modifiedDate", label: "Modified Date", valueType: "string" },
  { path: "featuredImage", label: "Featured Image", valueType: "media" },
  { path: "featuredImage.url", label: "Featured Image URL", valueType: "url" },
  { path: "featuredImage.alt", label: "Featured Image Alt", valueType: "string" },
  { path: "featuredImage.caption", label: "Featured Image Caption", valueType: "richText" },
  { path: "link", label: "Link", valueType: "url" },
  { path: "id", label: "ID", valueType: "identifier" },
];

const taxonomyFields: readonly DynamicContentSourceField[] = [
  { path: "name", label: "Name", valueType: "string" },
  { path: "description", label: "Description", valueType: "richText" },
  { path: "slug", label: "Slug", valueType: "string" },
  { path: "link", label: "Link", valueType: "url" },
  { path: "id", label: "ID", valueType: "identifier" },
];

export function wordpressContentSchemaCapabilities(
  schema: WordPressContentSchema | null | undefined,
): DynamicContentSourceCapability[] {
  if (!schema) return [];
  return schema.sources.flatMap((source) => {
    const fields = [
      ...(source.kind === "contentType" ? contentFields : taxonomyFields),
      ...source.fields,
    ];
    const sourceQuery = {
      sourceKind: source.kind,
      sourceName: source.name,
      graphqlSingleName: source.graphqlSingleName,
      graphqlPluralName: source.graphqlPluralName,
    };
    return [{
      key: `wordpress-${source.kind}-${source.name}-collection`,
      label: source.label,
      provider: "wordpress",
      source: "content",
      mode: "collection" as const,
      fields,
      defaultQuery: { ...sourceQuery, quantity: 10 },
    }, {
      key: `wordpress-${source.kind}-${source.name}-single`,
      label: `${source.label} (Single)`,
      provider: "wordpress",
      source: "content",
      mode: "single" as const,
      fields,
      queryControls: [{
        key: "databaseId",
        label: "Database ID",
        control: "integer" as const,
        minimum: 1,
        placeholder: "6",
      }],
      defaultQuery: { ...sourceQuery, quantity: 1 },
    }];
  });
}
