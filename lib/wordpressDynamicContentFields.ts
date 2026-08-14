import type { DynamicContentValueType } from "@/lib/dynamicContent";

/** Provider-owned description of an ACF field exposed by WPGraphQL. */
export type WordPressAcfFieldDescriptor = {
  name: string;
  label: string;
  graphqlName: string;
  acfType: "image" | "text" | "number" | "url" | "unknown";
  valueType: DynamicContentValueType;
  children?: readonly {
    key: string;
    label: string;
    valueType: DynamicContentValueType;
  }[];
};

/**
 * Schema-derived ACF catalog for the active WordPress provider. The catalog
 * is intentionally provider-owned; consumers only see canonical paths and
 * friendly labels, never GraphQL syntax.
 */
export const WORDPRESS_POST_ACF_FIELDS: readonly WordPressAcfFieldDescriptor[] = [
  {
    name: "intro_image",
    label: "Intro Image",
    graphqlName: "introImage",
    acfType: "image",
    valueType: "media",
    children: [
      { key: "url", label: "URL", valueType: "url" },
      { key: "alt", label: "Alt", valueType: "string" },
      { key: "caption", label: "Caption", valueType: "richText" },
      { key: "id", label: "ID", valueType: "identifier" },
    ],
  },
  {
    name: "teaser_image",
    label: "Teaser Image",
    graphqlName: "teaserImage",
    acfType: "image",
    valueType: "media",
    children: [
      { key: "url", label: "URL", valueType: "url" },
      { key: "alt", label: "Alt", valueType: "string" },
      { key: "caption", label: "Caption", valueType: "richText" },
      { key: "id", label: "ID", valueType: "identifier" },
    ],
  },
];

export type WordPressProviderField = {
  path: string;
  label: string;
  valueType: DynamicContentValueType;
  providerField?: WordPressAcfFieldDescriptor;
};

export const wordPressPostAcfSourceFields = (): readonly WordPressProviderField[] =>
  WORDPRESS_POST_ACF_FIELDS.flatMap((field) => [
    { path: `acf.${field.name}`, label: field.label, valueType: field.valueType, providerField: field },
    ...(field.children ?? []).map((child) => ({
      path: `acf.${field.name}.${child.key}`,
      label: `${field.label} → ${child.label}`,
      valueType: child.valueType,
      providerField: field,
    })),
  ]);

export const wordPressPostAcfSourceField = (path: string) =>
  wordPressPostAcfSourceFields().find((field) => field.path === path);

