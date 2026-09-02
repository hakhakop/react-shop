import type { DynamicContentContextDescriptor, DynamicItemContext, DynamicItemContextValue } from "@/lib/dynamicContent";
import { getDynamicItemContextValue } from "@/lib/dynamicContent";
import { resolveDynamicContentContexts } from "@/lib/dynamicContentProviders.server";
import { getDefaultCanonicalProductCategory, getCanonicalProductCategoryById } from "@/lib/productCategoryContext.server";
import type { CanonicalRouteContext, StableContentIdentity } from "@/lib/layoutRouting";
import {
  BUILTIN_TEMPLATE_PAGE_TYPES,
  type TemplatePageTypeDefinition,
} from "@/lib/templatePageTypes";
import { discoverWordPressContentSchema } from "@/lib/wordpressContentSchema.server";
import type { WordPressDiscoveredSource } from "@/lib/wordpressContentSchema";
import type { SaaSWebsite } from "@/lib/websites";

export type TemplatePagePreviewEntry = {
  identity: StableContentIdentity;
  label: string;
  storefrontHref?: string;
  routeContext: CanonicalRouteContext;
  rootContext?: DynamicItemContext;
};

export function productCategoryStorefrontHref(category: {
  slug: string;
  ancestry: Array<{ slug: string }>;
}) {
  const path = [...category.ancestry, category]
    .map((item) => encodeURIComponent(item.slug))
    .join("/");
  return `/product-category/${path}`;
}

const taxonomyContentType = (name: string) => ({
  category: "post-category",
  post_tag: "post-tag",
  product_cat: "product-category",
  product_tag: "product-tag",
  product_brand: "product-brand",
}[name] ?? name);

const providerForSource = (source: WordPressDiscoveredSource) =>
  source.name === "product" || source.name.startsWith("product_") ? "woocommerce" : "wordpress";

function discoveredDefinitions(source: WordPressDiscoveredSource): TemplatePageTypeDefinition[] {
  if (source.kind === "taxonomy") {
    const provider = providerForSource(source);
    return [{
      id: `taxonomy:${source.name}`,
      label: `${source.label.replace(/\s+$/g, "")} Archive`,
      group: `${source.label.replace(/\s+$/g, "")} Archive`,
      view: "archive",
      provider,
      contentType: taxonomyContentType(source.name),
      source: source.name === "product_cat" ? "product-category" : "content",
      sourceKind: "taxonomy",
      taxonomy: source.name,
      filters: ["taxonomy-term", "request-taxonomy-term", "page-number", "language"],
      ...(source.name === "product_cat" ? {} : {
        previewDescriptor: {
          provider: "wordpress",
          source: "content",
          mode: "collection",
          query: {
            sourceKind: source.kind,
            sourceName: source.name,
            graphqlSingleName: source.graphqlSingleName,
            graphqlPluralName: source.graphqlPluralName,
            quantity: 24,
          },
        } satisfies DynamicContentContextDescriptor,
      }),
    }];
  }

  if (source.name === "attachment") return [];
  const provider = providerForSource(source);
  const singularId = `singular:${source.name}`;
  const singular: TemplatePageTypeDefinition = {
    id: singularId,
    label: `Single ${source.label.replace(/s$/i, "")}`,
    group: `Single ${source.label.replace(/s$/i, "")}`,
    view: "singular",
    provider,
    contentType: source.name,
    source: source.name === "product" || source.name === "post" ? source.name : "content",
    sourceKind: "content",
    filters: ["content-identity", "taxonomy-term", "language"],
    previewDescriptor: source.name === "product"
      ? BUILTIN_TEMPLATE_PAGE_TYPES.find((item) => item.id === "singular:product")?.previewDescriptor
      : source.name === "post"
        ? BUILTIN_TEMPLATE_PAGE_TYPES.find((item) => item.id === "singular:post")?.previewDescriptor
        : {
            provider: "wordpress",
            source: "content",
            mode: "collection",
            query: {
              sourceKind: source.kind,
              sourceName: source.name,
              graphqlSingleName: source.graphqlSingleName,
              graphqlPluralName: source.graphqlPluralName,
              quantity: 24,
            },
          },
  };
  if (source.name === "page") return [singular];
  return [singular, {
    id: `archive:${source.name}`,
    label: `${source.label} Archive`,
    group: `${source.label} Archive`,
    view: "archive",
    provider,
    contentType: `${source.name}-archive`,
    source: singular.source,
    sourceKind: "content",
    filters: ["page-number", "language"],
    previewDescriptor: singular.previewDescriptor,
  }];
}

/** Registered template types are a server-side capability projection. */
export async function getTemplatePageTypeCatalog(
  website?: SaaSWebsite | null,
): Promise<TemplatePageTypeDefinition[]> {
  let discovered: TemplatePageTypeDefinition[] = [];
  try {
    const schema = await discoverWordPressContentSchema(website);
    discovered = schema.sources.flatMap(discoveredDefinitions);
  } catch {
    // Independent WebPages sites retain the built-in page-type catalog.
  }
  const byId = new Map(BUILTIN_TEMPLATE_PAGE_TYPES.map((item) => [item.id, item]));
  for (const item of discovered) byId.set(item.id, { ...byId.get(item.id), ...item });
  return Array.from(byId.values());
}

const metadataFields = (
  context: DynamicItemContext,
  definition: TemplatePageTypeDefinition,
): DynamicItemContext => {
  const fields: Record<string, DynamicItemContextValue> = { ...context.fields };
  fields.kind = { type: "string", value: definition.sourceKind === "taxonomy" ? "taxonomy" : definition.contentType };
  fields.pageType = { type: "string", value: definition.id };
  if (definition.taxonomy) {
    fields.taxonomy = { type: "string", value: definition.taxonomy };
    const id = getDynamicItemContextValue(context, "databaseId", "identifier") ?? context.id;
    if (id !== undefined) fields.termId = { type: "identifier", value: id };
    const slug = getDynamicItemContextValue(context, "slug", "string");
    if (slug) fields.termSlug = { type: "string", value: slug };
  }
  return { ...context, fields };
};

const syntheticEntry = (definition: TemplatePageTypeDefinition): TemplatePagePreviewEntry => {
  const contentId = definition.id;
  const identity = { provider: definition.provider, contentType: definition.contentType, contentId };
  const rootContext = metadataFields({ id: contentId, fields: {} }, definition);
  return {
    identity,
    label: definition.label,
    ...(definition.defaultStorefrontHref ? { storefrontHref: definition.defaultStorefrontHref } : {}),
    routeContext: {
      view: definition.view,
      pageType: definition.id,
      provider: definition.provider,
      contentType: definition.contentType,
      contentId,
      slug: definition.source,
      uri: definition.defaultStorefrontHref ?? "/",
      taxonomyTerms: [],
      pageNumber: 1,
    },
    rootContext,
  };
};

export async function resolveTemplatePagePreviewEntries(input: {
  definition: TemplatePageTypeDefinition;
  website?: SaaSWebsite | null;
  preferredIdentity?: StableContentIdentity;
}): Promise<TemplatePagePreviewEntry[]> {
  const { definition, website } = input;
  if (definition.id === "taxonomy:product_cat") {
    const category = input.preferredIdentity?.contentId
      ? await getCanonicalProductCategoryById(input.preferredIdentity.contentId, website)
      : await getDefaultCanonicalProductCategory(website);
    if (!category) return [];
    const identity = { provider: "woocommerce", contentType: definition.contentType, contentId: String(category.category.id) };
    const storefrontHref = productCategoryStorefrontHref(category.category);
    return [{
      identity,
      label: category.category.name,
      storefrontHref,
      routeContext: {
        view: "archive",
        pageType: definition.id,
        provider: identity.provider,
        contentType: identity.contentType,
        contentId: identity.contentId,
        databaseId: category.category.id,
        slug: category.category.slug,
        uri: storefrontHref,
        taxonomyTerms: [
          { taxonomy: "product_cat", id: identity.contentId, slug: category.category.slug },
          ...category.category.ancestry.map((item) => ({ taxonomy: "product_cat", id: String(item.id), slug: item.slug })),
        ],
        pageNumber: 1,
      },
      rootContext: category.dynamicContext,
    }];
  }
  if (!definition.previewDescriptor || definition.view === "archive" && definition.sourceKind !== "taxonomy") {
    return [syntheticEntry(definition)];
  }
  const contexts = await resolveDynamicContentContexts({ website, descriptor: definition.previewDescriptor });
  return contexts.flatMap((rawContext) => {
    const context = metadataFields(rawContext, definition);
    // Stable identity is the provider context ID used by Content discovery and
    // individual ownership. A WordPress databaseId remains route metadata; it
    // must not silently replace the identity used by ordinary Builder navigation.
    const rawId = context.id ?? getDynamicItemContextValue(context, "databaseId", "identifier");
    if (rawId === undefined || rawId === null) return [];
    const contentId = String(rawId);
    const label = getDynamicItemContextValue(context, "title", "string") ??
      getDynamicItemContextValue(context, "name", "string") ?? `${definition.label} ${contentId}`;
    const slug = getDynamicItemContextValue(context, "slug", "string") ?? contentId;
    const href = getDynamicItemContextValue(context, "storefront.href", "url") ??
      getDynamicItemContextValue(context, "link", "url");
    const identity = { provider: definition.provider, contentType: definition.contentType, contentId };
    const taxonomyTerms = definition.taxonomy
      ? [{ taxonomy: definition.taxonomy, id: contentId, slug }]
      : [];
    const databaseId = getDynamicItemContextValue(context, "databaseId", "identifier");
    return [{
      identity,
      label,
      ...(href ? { storefrontHref: href } : {}),
      routeContext: {
        view: definition.view,
        pageType: definition.id,
        provider: identity.provider,
        contentType: identity.contentType,
        contentId,
        ...(typeof databaseId === "number" ? { databaseId } : {}),
        slug,
        uri: href ?? `/${slug}`,
        taxonomyTerms,
        pageNumber: 1,
      },
      rootContext: context,
    }];
  });
}
