/**
 * Canonical, provider-independent layout-routing contracts.
 *
 * This module deliberately owns selection only. Content fetching, dynamic
 * content materialization, rendering, and persistence adapters live elsewhere.
 */

export type RouteTaxonomyTerm = {
  taxonomy: string;
  id: string;
  slug?: string;
};

export type SingularRouteContext = {
  view: "singular";
  provider: string;
  contentType: string;
  /** Stable provider identity. Slugs and URIs must never be used instead. */
  contentId: string;
  databaseId?: number;
  slug: string;
  uri: string;
  taxonomyTerms: readonly RouteTaxonomyTerm[];
};

export type ArchiveRouteContext = Omit<SingularRouteContext, "view"> & {
  view: "archive";
};

export type CanonicalRouteContext = SingularRouteContext | ArchiveRouteContext;

export type StableContentIdentity = Readonly<{
  provider: string;
  contentType: string;
  contentId: string;
}>;

export type LayoutDocumentId = string & { readonly __layoutDocumentId: unique symbol };
export type RoutingTemplateId = string & { readonly __routingTemplateId: unique symbol };

const OPAQUE_ID = /^[a-z][a-z0-9]*(?::[a-z0-9][a-z0-9._-]*)+$/i;

function parseOpaqueId<Value extends string>(value: unknown, label: string): Value {
  if (typeof value !== "string" || !OPAQUE_ID.test(value)) {
    throw new Error(`Invalid ${label}.`);
  }
  return value as Value;
}

export function parseLayoutDocumentId(value: unknown): LayoutDocumentId {
  return parseOpaqueId<LayoutDocumentId>(value, "layout document ID");
}

export function parseRoutingTemplateId(value: unknown): RoutingTemplateId {
  return parseOpaqueId<RoutingTemplateId>(value, "routing template ID");
}

export function builderLayoutDocumentId(builderKey: string): LayoutDocumentId {
  if (!/^[a-z0-9]+(?::[a-z0-9]+)?(?:-[a-z0-9]+)*$/i.test(builderKey)) {
    throw new Error("Invalid Builder layout key.");
  }
  return parseLayoutDocumentId(`layout:builder:${builderKey}`);
}

export function builderKeyFromLayoutDocumentId(layoutId: LayoutDocumentId): string {
  const prefix = "layout:builder:";
  if (!layoutId.startsWith(prefix)) throw new Error("Unsupported layout document ID.");
  const key = layoutId.slice(prefix.length);
  if (!key || builderLayoutDocumentId(key) !== layoutId) {
    throw new Error("Invalid Builder layout document ID.");
  }
  return key;
}

export type LayoutTarget =
  | { kind: "individual"; identity: StableContentIdentity; layoutId: LayoutDocumentId }
  | { kind: "routing-template"; templateId: RoutingTemplateId; layoutId: LayoutDocumentId }
  | { kind: "page"; pageId: string; layoutId: LayoutDocumentId }
  | { kind: "document"; document: "header" | "footer"; layoutId: LayoutDocumentId };

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

export function parseStableContentIdentity(value: unknown): StableContentIdentity {
  if (!isRecord(value)) throw new Error("Invalid stable content identity.");
  const { provider, contentType, contentId } = value;
  if (
    typeof provider !== "string" || !provider.trim() ||
    typeof contentType !== "string" || !contentType.trim() ||
    typeof contentId !== "string" || !contentId.trim()
  ) {
    throw new Error("Invalid stable content identity.");
  }
  return { provider, contentType, contentId };
}

/** Strict boundary parser: malformed targets throw and never alias Shop. */
export function parseLayoutTarget(value: unknown): LayoutTarget {
  if (!isRecord(value) || typeof value.kind !== "string") {
    throw new Error("Invalid layout target.");
  }
  const layoutId = parseLayoutDocumentId(value.layoutId);
  if (value.kind === "individual") {
    return { kind: value.kind, identity: parseStableContentIdentity(value.identity), layoutId };
  }
  if (value.kind === "routing-template") {
    return {
      kind: value.kind,
      templateId: parseRoutingTemplateId(value.templateId),
      layoutId,
    };
  }
  if (value.kind === "page" && typeof value.pageId === "string" && value.pageId.trim()) {
    return { kind: value.kind, pageId: value.pageId, layoutId };
  }
  if (value.kind === "document" && (value.document === "header" || value.document === "footer")) {
    return { kind: value.kind, document: value.document, layoutId };
  }
  throw new Error("Invalid layout target.");
}

export type SingularTemplateCondition =
  | { subject: "content-type"; operator: "include" | "exclude"; contentType: string }
  | { subject: "content-identity"; operator: "include" | "exclude"; identity: StableContentIdentity }
  | {
      subject: "taxonomy-term";
      operator: "include" | "exclude";
      taxonomy: string;
      termId: string;
    };

export type RoutingTemplate = {
  id: RoutingTemplateId;
  name: string;
  enabled: boolean;
  /** Lower order wins. Registry position breaks equal-order ties deterministically. */
  order: number;
  view: "singular" | "archive";
  conditions: readonly SingularTemplateCondition[];
  layoutId: LayoutDocumentId;
};

export type IndividualLayoutOverride = StableContentIdentity & {
  layoutId: LayoutDocumentId;
};

export type LayoutResolution =
  | { outcome: "individual"; layoutId: LayoutDocumentId; override: IndividualLayoutOverride }
  | { outcome: "routing-template"; layoutId: LayoutDocumentId; template: RoutingTemplate }
  | { outcome: "native-fallback" }
  | { outcome: "not-found"; layoutId?: LayoutDocumentId };

export type LayoutResolverInput = {
  context: CanonicalRouteContext;
  individualOverrides: readonly IndividualLayoutOverride[];
  routingTemplates: readonly RoutingTemplate[];
  /** Provider says the resolved entity has a native renderable fallback. */
  nativeFallbackAvailable: boolean;
  notFoundLayoutId?: LayoutDocumentId;
};

export function sameContentIdentity(
  left: StableContentIdentity,
  right: StableContentIdentity,
) {
  return left.provider === right.provider &&
    left.contentType === right.contentType &&
    left.contentId === right.contentId;
}

function conditionMatches(
  context: CanonicalRouteContext,
  condition: SingularTemplateCondition,
) {
  if (condition.subject === "content-type") {
    return context.contentType === condition.contentType;
  }
  if (condition.subject === "content-identity") {
    return sameContentIdentity(context, condition.identity);
  }
  return context.taxonomyTerms.some(
    (term) => term.taxonomy === condition.taxonomy && term.id === condition.termId,
  );
}

/** Entity → relationship/taxonomy → global type. Order only breaks ties. */
export function routingTemplateSpecificity(template: RoutingTemplate) {
  const includes = template.conditions.filter((condition) => condition.operator === "include");
  if (includes.some((condition) => condition.subject === "content-identity")) return 3;
  if (includes.some((condition) => condition.subject === "taxonomy-term")) return 2;
  return 1;
}

export function routingTemplateMatches(
  context: CanonicalRouteContext,
  template: RoutingTemplate,
) {
  if (!template.enabled || template.view !== context.view) return false;
  const includes = template.conditions.filter((condition) => condition.operator === "include");
  const excludes = template.conditions.filter((condition) => condition.operator === "exclude");
  if (excludes.some((condition) => conditionMatches(context, condition))) return false;
  return includes.length === 0 || includes.every((condition) => conditionMatches(context, condition));
}

/** Pure, deterministic layout ownership resolution. */
export function resolveLayout(input: LayoutResolverInput): LayoutResolution {
  const identity: StableContentIdentity = input.context;
  const override = input.individualOverrides.find((item) => sameContentIdentity(item, identity));
  if (override) {
    return { outcome: "individual", layoutId: override.layoutId, override };
  }

  const template = input.routingTemplates
    .map((item, registryIndex) => ({ item, registryIndex }))
    .filter(({ item }) => routingTemplateMatches(input.context, item))
    .sort((left, right) =>
      routingTemplateSpecificity(right.item) - routingTemplateSpecificity(left.item) ||
      left.item.order - right.item.order ||
      left.registryIndex - right.registryIndex,
    )[0]
    ?.item;
  if (template) {
    return { outcome: "routing-template", layoutId: template.layoutId, template };
  }

  if (input.nativeFallbackAvailable) return { outcome: "native-fallback" };
  return { outcome: "not-found", layoutId: input.notFoundLayoutId };
}

/** Narrow migration bridge; production Product routing is intentionally unchanged. */
export function createLegacyProductSingleRoutingTemplate(
  layoutId: LayoutDocumentId,
): RoutingTemplate {
  return {
    id: parseRoutingTemplateId("routing:legacy-product-single"),
    name: "Product Single",
    enabled: true,
    order: 0,
    view: "singular",
    conditions: [{ subject: "content-type", operator: "include", contentType: "product" }],
    layoutId,
  };
}

/** Narrow migration bridge for the compatibility Single Post document. */
export function createLegacyPostSingleRoutingTemplate(
  layoutId: LayoutDocumentId,
): RoutingTemplate {
  return {
    id: parseRoutingTemplateId("routing:legacy-post-single"),
    name: "Single Post",
    enabled: true,
    order: 0,
    view: "singular",
    conditions: [{ subject: "content-type", operator: "include", contentType: "post" }],
    layoutId,
  };
}

export function createLegacyProductCategoryRoutingTemplate(
  layoutId: LayoutDocumentId,
): RoutingTemplate {
  return {
    id: parseRoutingTemplateId("routing:legacy-product-category"),
    name: "Global Product Category",
    enabled: true,
    order: 20,
    view: "archive",
    conditions: [{ subject: "content-type", operator: "include", contentType: "product-category" }],
    layoutId,
  };
}

export function createLegacyPostCategoryRoutingTemplate(
  layoutId: LayoutDocumentId,
): RoutingTemplate {
  return {
    id: parseRoutingTemplateId("routing:legacy-post-category"),
    name: "Global Post Category",
    enabled: true,
    order: 30,
    view: "archive",
    conditions: [{ subject: "content-type", operator: "include", contentType: "post-category" }],
    layoutId,
  };
}
