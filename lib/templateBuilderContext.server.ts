import type { BuilderDataScope, BuilderLayout } from "@/lib/builderLayouts";
import { readDynamicBuilderDocument } from "@/lib/builderLayoutDocuments.server";
import { materializeBuilderDynamicContent, type DynamicContentContextResolver } from "@/lib/builderDynamicContentMaterializer.server";
import { getDynamicItemContextValue } from "@/lib/dynamicContent";
import { parseLayoutDocumentId, resolveLayout, type StableContentIdentity } from "@/lib/layoutRouting";
import { getBuilderLayoutByDocumentId, readLayoutRoutingRegistry } from "@/lib/layoutRoutingStore.server";
import { createRoutingTemplatesService } from "@/lib/routingTemplatesService.server";
import { legacyTemplatePageType } from "@/lib/templatePageTypes";
import type { SaaSWebsite } from "@/lib/websites";
import {
  getTemplatePageTypeCatalog,
  resolveTemplatePagePreviewEntries,
  type TemplatePagePreviewEntry,
} from "@/lib/templatePageTypes.server";

export class TemplateBuilderContextMismatchError extends Error {}
export class TemplatePreviewIdentityNotFoundError extends Error {}

export type TemplatePreviewCandidate = {
  identity: StableContentIdentity;
  label: string;
  storefrontHref?: string;
};

export type TemplateBuilderContext = {
  documentId: string;
  routingTemplateId: string;
  displayName: string;
  family: string;
  familyLabel: string;
  pageType: string;
  provider: string;
  source: string;
  websiteId?: string;
  assignmentSummary: string;
};

async function readLayout(documentId: string, scope: BuilderDataScope) {
  try {
    const parsed = parseLayoutDocumentId(documentId);
    if (documentId.startsWith("layout:builder:dynamic:")) {
      return await readDynamicBuilderDocument(documentId, scope);
    }
    const layout = await getBuilderLayoutByDocumentId(parsed, scope);
    if (!layout) throw new TemplateBuilderContextMismatchError("Builder layout document not found.");
    return layout;
  } catch (error) {
    if (error instanceof TemplateBuilderContextMismatchError) throw error;
    throw new TemplateBuilderContextMismatchError("Invalid or unknown Builder document ID.");
  }
}

export async function resolveTemplateBuilderContext(input: {
  documentId: unknown;
  routingTemplateId: unknown;
  previewIdentity?: StableContentIdentity;
  authoredLayout?: BuilderLayout;
  scope?: BuilderDataScope;
  website?: SaaSWebsite | null;
  resolveContexts?: DynamicContentContextResolver;
}) {
  const scope = input.scope ?? {};
  if (typeof input.documentId !== "string") {
    throw new TemplateBuilderContextMismatchError("Invalid Builder document ID.");
  }
  const pageTypes = await getTemplatePageTypeCatalog(input.website);
  const service = createRoutingTemplatesService(scope, {}, { pageTypes });
  const template = await service.get(input.routingTemplateId);
  if (template.layoutId !== input.documentId) {
    throw new TemplateBuilderContextMismatchError("Routing Template does not own this Builder document.");
  }
  const legacyContentType = template.conditions.find((condition) =>
    condition.subject === "content-type" && condition.operator === "include",
  );
  const templatePageType = template.pageType ?? legacyTemplatePageType(
    template.view,
    legacyContentType?.subject === "content-type" ? legacyContentType.contentType : "unknown",
  );
  const definition = pageTypes.find((item) => item.id === templatePageType);
  if (!definition) throw new TemplateBuilderContextMismatchError("Routing Template Page type is not registered.");
  const assignedIdentity = template.conditions
    .filter((condition) => condition.operator === "include")
    .flatMap((condition): StableContentIdentity[] => {
      if (condition.subject === "content-identity") return [condition.identity];
      if (condition.subject === "taxonomy-term" && condition.taxonomy === definition.taxonomy) {
        return [{
          provider: definition.provider,
          contentType: definition.contentType,
          contentId: condition.termId,
        }];
      }
      return [];
    })[0];
  // YOOtheme opens a template against a context that satisfies its assignment.
  // An explicit preview selection wins; otherwise use the first assigned entity/term.
  const requestedPreviewIdentity = input.previewIdentity ?? assignedIdentity;
  const persistedLayout = await readLayout(input.documentId, scope);
  const layout = input.authoredLayout ?? persistedLayout;
  const resolveContexts = input.resolveContexts;
  const entries: TemplatePagePreviewEntry[] = resolveContexts && definition.previewDescriptor
    ? (await resolveContexts({ website: input.website, descriptor: definition.previewDescriptor })).flatMap((rootContext) => {
        if (rootContext.id === undefined || rootContext.id === null) return [];
        const identity = { provider: definition.provider, contentType: definition.contentType, contentId: String(rootContext.id) };
        const label = getDynamicItemContextValue(rootContext, "title", "string") ??
          getDynamicItemContextValue(rootContext, "name", "string") ?? `${definition.label} ${String(rootContext.id)}`;
        const storefrontHref = getDynamicItemContextValue(rootContext, "storefront.href", "url") ??
          getDynamicItemContextValue(rootContext, "link", "url");
        return [{
          identity,
          label,
          ...(storefrontHref ? { storefrontHref } : {}),
          routeContext: {
            view: definition.view, pageType: definition.id, provider: identity.provider,
            contentType: identity.contentType, contentId: identity.contentId, slug: identity.contentId,
            uri: "/", taxonomyTerms: [], pageNumber: 1,
          },
          rootContext,
        }];
      })
    : await resolveTemplatePagePreviewEntries({ definition, website: input.website, preferredIdentity: requestedPreviewIdentity });
  const candidates: TemplatePreviewCandidate[] = entries.map((entry) => ({
    identity: entry.identity,
    label: entry.label,
    ...(entry.storefrontHref ? { storefrontHref: entry.storefrontHref } : {}),
  }));
  let selectedIndex = 0;
  if (requestedPreviewIdentity) {
    selectedIndex = candidates.findIndex((candidate) =>
      candidate.identity.provider === requestedPreviewIdentity.provider &&
      candidate.identity.contentType === requestedPreviewIdentity.contentType &&
      candidate.identity.contentId === requestedPreviewIdentity.contentId,
    );
    if (selectedIndex < 0) throw new TemplatePreviewIdentityNotFoundError("Preview entity is not available in this website.");
  }
  const previewIdentity = candidates[selectedIndex]?.identity;
  const rootContext = previewIdentity ? entries[selectedIndex]?.rootContext : undefined;
  const routeContext = previewIdentity ? entries[selectedIndex]?.routeContext : undefined;
  if (!routeContext) throw new TemplatePreviewIdentityNotFoundError(`Preview ${definition.label} is not available in this website.`);
  const registry = await readLayoutRoutingRegistry(scope);
  const resolution = resolveLayout({
    context: routeContext,
    individualOverrides: [],
    routingTemplates: registry.routingTemplates,
    nativeFallbackAvailable: true,
    editorTemplateId: template.id,
  });
  if (resolution.outcome !== "routing-template" || resolution.template.id !== template.id) {
    throw new TemplateBuilderContextMismatchError("Routing Template does not match its contextual preview.");
  }
  // Editing/previewing a Template is intentionally forced, including when it
  // is disabled. The active Template must remain the unforced storefront
  // result for this exact context.
  const activeResolution = resolveLayout({
    context: routeContext,
    individualOverrides: registry.individualOverrides,
    routingTemplates: registry.routingTemplates,
    nativeFallbackAvailable: true,
  });
  const materialization = await materializeBuilderDynamicContent(layout, {
    website: input.website,
    rootContext,
    resolveContexts,
  });
  const context: TemplateBuilderContext = {
    documentId: input.documentId,
    routingTemplateId: template.id,
    displayName: template.name,
    family: definition.contentType,
    familyLabel: definition.label,
    pageType: definition.id,
    provider: definition.provider,
    source: definition.source,
    websiteId: scope.websiteId,
    assignmentSummary: definition.label,
  };
  return {
    layout,
    renderLayout: materialization.renderLayout,
    diagnostics: materialization.diagnostics,
    context,
    candidates,
    previewIdentity,
    activeResolution,
  };
}
