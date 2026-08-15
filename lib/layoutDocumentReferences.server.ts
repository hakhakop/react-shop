import {
  parseLayoutDocumentId,
  sameContentIdentity,
  type LayoutDocumentId,
  type RoutingTemplateId,
  type StableContentIdentity,
} from "@/lib/layoutRouting";
import { getBuilderLayoutByDocumentId, readLayoutRoutingRegistry } from "@/lib/layoutRoutingStore.server";
import {
  BuilderDocumentNotFoundError,
  InvalidBuilderDocumentIdError,
  parseDynamicBuilderDocumentId,
  readDynamicBuilderDocument,
} from "@/lib/builderLayoutDocuments.server";
import type { BuilderDataScope } from "@/lib/builderLayouts";

export class InvalidLayoutReferenceRequestError extends Error {}
export class ReferencedLayoutNotFoundError extends Error {}

export type LayoutDocumentReferences = {
  layoutId: LayoutDocumentId;
  dynamicDocument: boolean;
  routingTemplates: Array<{ id: RoutingTemplateId; name: string }>;
  individualOverrides: StableContentIdentity[];
  pages: Array<{ pageId: string }>;
  documents: Array<{ document: string }>;
  hasReferences: boolean;
};

export async function inspectLayoutDocumentReferences(
  layoutIdValue: unknown,
  scope: BuilderDataScope = {},
  exclusions: {
    routingTemplateId?: RoutingTemplateId;
    individualIdentity?: StableContentIdentity;
  } = {},
): Promise<LayoutDocumentReferences> {
  let layoutId: LayoutDocumentId;
  let dynamicDocument = false;
  try {
    layoutId = parseDynamicBuilderDocumentId(layoutIdValue);
    await readDynamicBuilderDocument(layoutId, scope);
    dynamicDocument = true;
  } catch (error) {
    if (typeof layoutIdValue === "string" && layoutIdValue.startsWith("layout:builder:dynamic:")) {
      if (error instanceof InvalidBuilderDocumentIdError) {
        throw new InvalidLayoutReferenceRequestError("Invalid layout document ID.");
      }
      if (error instanceof BuilderDocumentNotFoundError) {
        throw new ReferencedLayoutNotFoundError("Builder layout document not found.");
      }
    }
    try { layoutId = parseLayoutDocumentId(layoutIdValue); } catch {
      throw new InvalidLayoutReferenceRequestError("Invalid layout document ID.");
    }
    if (!layoutId.startsWith("layout:builder:") || !await getBuilderLayoutByDocumentId(layoutId, scope)) {
      throw new ReferencedLayoutNotFoundError("Builder layout document not found.");
    }
  }

  const registry = await readLayoutRoutingRegistry(scope);
  const routingTemplates = registry.routingTemplates
    .filter((item) => item.id !== exclusions.routingTemplateId && item.layoutId === layoutId)
    .map(({ id, name }) => ({ id, name }));
  const individualOverrides = registry.individualOverrides
    .filter((item) => item.layoutId === layoutId &&
      (!exclusions.individualIdentity || !sameContentIdentity(item, exclusions.individualIdentity)))
    .map(({ provider, contentType, contentId }) => ({ provider, contentType, contentId }));
  return {
    layoutId,
    dynamicDocument,
    routingTemplates,
    individualOverrides,
    pages: [],
    documents: [],
    hasReferences: routingTemplates.length > 0 || individualOverrides.length > 0,
  };
}
