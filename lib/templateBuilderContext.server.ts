import type { BuilderDataScope, BuilderLayout } from "@/lib/builderLayouts";
import { readDynamicBuilderDocument } from "@/lib/builderLayoutDocuments.server";
import { materializeBuilderDynamicContent, type DynamicContentContextResolver } from "@/lib/builderDynamicContentMaterializer.server";
import { getDynamicItemContextValue, type DynamicContentContextDescriptor, type DynamicItemContext } from "@/lib/dynamicContent";
import { resolveDynamicContentContexts } from "@/lib/dynamicContentProviders.server";
import { parseLayoutDocumentId, type StableContentIdentity } from "@/lib/layoutRouting";
import { getBuilderLayoutByDocumentId } from "@/lib/layoutRoutingStore.server";
import { createRoutingTemplatesService } from "@/lib/routingTemplatesService.server";
import type { SaaSWebsite } from "@/lib/websites";

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
  family: "product" | "post";
  familyLabel: "Single Product" | "Single Post";
  provider: "woocommerce" | "wordpress";
  source: "product" | "post";
  websiteId?: string;
  assignmentSummary: "All Products" | "All Posts";
};

function familyOf(conditions: readonly { subject: string; operator: string; contentType?: string }[]) {
  const types = conditions.filter((condition) =>
    condition.subject === "content-type" && condition.operator === "include",
  ).map((condition) => condition.contentType);
  if (types.length !== 1 || (types[0] !== "product" && types[0] !== "post")) {
    throw new TemplateBuilderContextMismatchError("Routing Template has an unsupported content family.");
  }
  return types[0];
}

function descriptor(family: "product" | "post"): DynamicContentContextDescriptor {
  return family === "product"
    ? { provider: "woocommerce", source: "product", mode: "collection" as const, query: { quantity: 24, order: "date", direction: "desc" } }
    : { provider: "wordpress", source: "post", mode: "collection" as const, query: { quantity: 24, order: "date", direction: "desc", filters: {} } };
}

function candidateFromContext(family: "product" | "post", context: DynamicItemContext): TemplatePreviewCandidate | null {
  if (context.id === undefined || context.id === null) return null;
  const title = getDynamicItemContextValue(context, "title", "string")?.trim();
  const storefrontHref = getDynamicItemContextValue(context, "storefront.href", "url");
  return {
    identity: {
      provider: family === "product" ? "woocommerce" : "wordpress",
      contentType: family,
      contentId: String(context.id),
    },
    label: title || `${family === "product" ? "Product" : "Post"} ${String(context.id)}`,
    ...(storefrontHref ? { storefrontHref } : {}),
  };
}

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
  const template = await createRoutingTemplatesService(scope).get(input.routingTemplateId);
  if (template.layoutId !== input.documentId) {
    throw new TemplateBuilderContextMismatchError("Routing Template does not own this Builder document.");
  }
  const family = familyOf(template.conditions);
  const persistedLayout = await readLayout(input.documentId, scope);
  const layout = input.authoredLayout ?? persistedLayout;
  const resolveContexts = input.resolveContexts ?? resolveDynamicContentContexts;
  const contexts = await resolveContexts({ website: input.website, descriptor: descriptor(family) });
  const entries = contexts.flatMap((rootContext) => {
    const candidate = candidateFromContext(family, rootContext);
    return candidate ? [{ candidate, rootContext }] : [];
  });
  const candidates = entries.map((entry) => entry.candidate);
  let selectedIndex = 0;
  if (input.previewIdentity) {
    selectedIndex = candidates.findIndex((candidate) =>
      candidate.identity.provider === input.previewIdentity!.provider &&
      candidate.identity.contentType === input.previewIdentity!.contentType &&
      candidate.identity.contentId === input.previewIdentity!.contentId,
    );
    if (selectedIndex < 0) throw new TemplatePreviewIdentityNotFoundError("Preview entity is not available in this website.");
  }
  const previewIdentity = candidates[selectedIndex]?.identity;
  const rootContext = previewIdentity ? entries[selectedIndex]?.rootContext : undefined;
  const materialization = await materializeBuilderDynamicContent(layout, {
    website: input.website,
    rootContext,
    resolveContexts,
  });
  const context: TemplateBuilderContext = {
    documentId: input.documentId,
    routingTemplateId: template.id,
    displayName: template.name,
    family,
    familyLabel: family === "product" ? "Single Product" : "Single Post",
    provider: family === "product" ? "woocommerce" : "wordpress",
    source: family,
    websiteId: scope.websiteId,
    assignmentSummary: family === "product" ? "All Products" : "All Posts",
  };
  return {
    layout,
    renderLayout: materialization.renderLayout,
    diagnostics: materialization.diagnostics,
    context,
    candidates,
    previewIdentity,
  };
}
