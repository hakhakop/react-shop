import {
  getPublishedBuilderLayout,
  isBuilderCustomPageKey,
  normalizeBuilderLayoutKey,
  readBuilderCustomPages,
  type BuilderDataScope,
  type BuilderLayout,
  type BuilderLayoutKey,
} from "@/lib/builderLayouts";
import type { DynamicContentContextResolver } from "@/lib/builderDynamicContentMaterializer.server";
import {
  encodeIndividualBuilderIdentity,
  resolveIndividualBuilderContext,
} from "@/lib/individualBuilderContext.server";
import {
  resolveLayout,
  type CanonicalRouteContext,
  type LayoutResolution,
  type StableContentIdentity,
} from "@/lib/layoutRouting";
import {
  ensurePostSingleRoutingCompatibility,
  ensureProductSingleRoutingCompatibility,
  ensureProductCategoryRoutingCompatibility,
  ensurePostCategoryRoutingCompatibility,
  readLayoutRoutingRegistry,
  type LayoutRoutingRegistry,
} from "@/lib/layoutRoutingStore.server";
import { legacyTemplatePageType } from "@/lib/templatePageTypes";
import { BUILTIN_TEMPLATE_PAGE_TYPES } from "@/lib/templatePageTypes";
import {
  resolveTemplateBuilderContext,
  type TemplatePreviewCandidate,
} from "@/lib/templateBuilderContext.server";
import type { SaaSWebsite } from "@/lib/websites";
import type {
  BuilderEditorContext,
  BuilderEditorLayoutReference,
  EditableLayoutTarget,
} from "@/lib/builderEditorContext";

export class BuilderEditorContextMismatchError extends Error {}

type TemplateResolution = Awaited<ReturnType<typeof resolveTemplateBuilderContext>>;
type IndividualResolution = Awaited<ReturnType<typeof resolveIndividualBuilderContext>>;

const PAGE_LABELS: Partial<Record<BuilderLayoutKey, string>> = {
  home: "Home",
  shop: "Shop",
  client: "Client",
  "page:cart": "Cart",
  "page:checkout": "Checkout",
  "page:my-account": "My Account",
  header: "Header",
  footer: "Footer",
};

function builderBaseHref(scope: BuilderDataScope) {
  return scope.websiteId
    ? `/app/websites/${encodeURIComponent(scope.websiteId)}/builder`
    : "/dashboard";
}

function managementHref(scope: BuilderDataScope, surface: "pages" | "templates" | "content") {
  return `${builderBaseHref(scope)}#${surface}`;
}

function builderHref(scope: BuilderDataScope, values: Record<string, string>) {
  return `${builderBaseHref(scope)}?${new URLSearchParams(values).toString()}`;
}

function layoutReference(value: { source: BuilderEditorLayoutReference["source"]; layoutId?: string }) {
  return {
    source: value.source,
    ...(value.layoutId ? { layoutId: value.layoutId } : {}),
  } satisfies BuilderEditorLayoutReference;
}

function selectedTemplateCandidate(resolution: TemplateResolution): TemplatePreviewCandidate | undefined {
  return resolution.candidates.find((candidate) =>
    candidate.identity.provider === resolution.previewIdentity?.provider &&
    candidate.identity.contentType === resolution.previewIdentity?.contentType &&
    candidate.identity.contentId === resolution.previewIdentity?.contentId,
  );
}

function resolvedOwnership(resolution: LayoutResolution): BuilderEditorLayoutReference {
  if (resolution.outcome === "individual") return { source: "individual", layoutId: resolution.layoutId };
  if (resolution.outcome === "routing-template") return { source: "routing-template", layoutId: resolution.layoutId };
  if (resolution.outcome === "native-fallback") return { source: "native-fallback" };
  return { source: "not-found", ...(resolution.layoutId ? { layoutId: resolution.layoutId } : {}) };
}

function activeTemplateReference(resolution: LayoutResolution) {
  return resolution.outcome === "routing-template"
    ? { templateId: resolution.template.id, name: resolution.template.name, layoutId: resolution.template.layoutId }
    : undefined;
}

export function projectTemplateBuilderEditorContext(
  resolution: TemplateResolution,
  scope: BuilderDataScope = {},
): BuilderEditorContext {
  const owner = resolution.context;
  const candidate = selectedTemplateCandidate(resolution);
  const assignedTemplate = {
    templateId: owner.routingTemplateId,
    name: owner.displayName,
    layoutId: owner.documentId,
  };
  const frontendHref = candidate?.storefrontHref;
  return {
    document: { id: owner.documentId, kind: "routing-template", displayName: owner.displayName },
    scope: { ...(scope.websiteId ? { websiteId: scope.websiteId } : {}) },
    content: {
      mode: "preview",
      pageType: owner.pageType,
      family: owner.family,
      ...(resolution.previewIdentity ? { identity: resolution.previewIdentity } : {}),
      ...(candidate?.label ? { label: candidate.label } : {}),
      ...(frontendHref ? { storefrontHref: frontendHref } : {}),
    },
    ownership: {
      resolved: resolvedOwnership(resolution.activeResolution),
      ...(activeTemplateReference(resolution.activeResolution)
        ? { activeTemplate: activeTemplateReference(resolution.activeResolution) }
        : {}),
      effective: { source: "routing-template", layoutId: owner.documentId },
      assignedTemplate,
      fallback: { source: "native-fallback" },
      assignmentSummary: owner.assignmentSummary,
    },
    navigation: {
      returnHref: managementHref(scope, "templates"),
      returnLabel: "Back to Templates",
      ...(frontendHref ? { frontendHref } : {}),
    },
    capabilities: {
      canChangePreview: true,
      canOpenFrontend: Boolean(frontendHref),
      canEditAssignedTemplate: false,
    },
  };
}

export function projectIndividualBuilderEditorContext(
  resolution: IndividualResolution,
  scope: BuilderDataScope = {},
): BuilderEditorContext {
  const owner = resolution.context;
  const status = resolution.status;
  const frontendHref = owner.storefrontHref;
  return {
    document: {
      id: owner.documentId,
      kind: "individual",
      displayName: owner.title ?? owner.familyLabel,
    },
    scope: { ...(scope.websiteId ? { websiteId: scope.websiteId } : {}) },
    content: {
      mode: "fixed",
      pageType: owner.pageType,
      family: owner.family,
      identity: owner.identity,
      ...(owner.title ? { label: owner.title } : {}),
      availability: owner.availability,
      ...(frontendHref ? { storefrontHref: frontendHref } : {}),
    },
    ownership: {
      resolved: layoutReference(status.effective),
      ...(status.effective.source === "routing-template" && status.assignedTemplate
        ? { activeTemplate: status.assignedTemplate }
        : {}),
      effective: layoutReference(status.effective),
      ...(status.individualLayout ? { individual: status.individualLayout } : {}),
      ...(status.assignedTemplate ? { assignedTemplate: status.assignedTemplate } : {}),
      fallback: layoutReference(status.fallback),
    },
    navigation: {
      returnHref: managementHref(scope, "content"),
      returnLabel: "Back to Content",
      ...(frontendHref ? { frontendHref } : {}),
    },
    capabilities: {
      canChangePreview: false,
      canOpenFrontend: Boolean(frontendHref),
      canEditAssignedTemplate: Boolean(status.assignedTemplate),
    },
  };
}

function ordinaryPageFrontendHref(page: BuilderLayoutKey, slug?: string) {
  if (page === "home") return "/";
  if (page === "shop") return "/shop";
  if (page === "client") return "/client";
  if (page === "page:cart") return "/cart";
  if (page === "page:checkout") return "/checkout";
  if (page === "page:my-account") return "/my-account";
  if (isBuilderCustomPageKey(page)) return slug ? `/${encodeURIComponent(slug)}` : undefined;
  return undefined;
}

export async function resolveOrdinaryBuilderEditorContext(input: {
  page: unknown;
  scope?: BuilderDataScope;
  layout?: BuilderLayout | null;
}): Promise<BuilderEditorContext> {
  if (typeof input.page !== "string" || normalizeBuilderLayoutKey(input.page) !== input.page) {
    throw new BuilderEditorContextMismatchError("Invalid ordinary Builder page context.");
  }
  const page = input.page as BuilderLayoutKey;
  const scope = input.scope ?? {};
  const layout = input.layout === undefined ? await getPublishedBuilderLayout(page, scope) : input.layout;
  const customPage = isBuilderCustomPageKey(page)
    ? (await readBuilderCustomPages(scope)).find((item) => item.key === page)
    : undefined;
  const frontendHref = ordinaryPageFrontendHref(page, customPage?.slug);
  const kind = page === "header" ? "header" : page === "footer" ? "footer" : "page";
  const documentId = layout?.documentId ?? `layout:builder:${page}`;
  const routingOwner = kind === "page"
    ? (await readLayoutRoutingRegistry(scope)).routingTemplates.find(
        (template) => template.layoutId === documentId,
      )
    : undefined;
  const pageType = routingOwner?.pageType ?? (
    kind === "page" && layout?.targetType !== "template"
      ? legacyTemplatePageType("singular", "page")
      : undefined
  );
  const displayName = layout?.displayName ?? routingOwner?.name ?? customPage?.title ?? PAGE_LABELS[page] ?? "Page";
  let canvasResolution: LayoutResolution | undefined;
  if (routingOwner) {
    const registry = await readLayoutRoutingRegistry(scope);
    const definition = BUILTIN_TEMPLATE_PAGE_TYPES.find((item) => item.id === pageType);
    const typeCondition = routingOwner.conditions.find(
      (condition): condition is Extract<typeof condition, { subject: "content-type" }> =>
        condition.subject === "content-type" && condition.operator === "include",
    );
    const contentType = definition?.contentType ?? typeCondition?.contentType ?? page;
    canvasResolution = resolveLayout({
      context: {
        view: routingOwner.view,
        ...(pageType ? { pageType } : {}),
        provider: definition?.provider ?? "webpages",
        contentType,
        contentId: `builder-canvas:${page}`,
        slug: String(page),
        uri: frontendHref ?? "/",
        taxonomyTerms: [],
        pageNumber: 1,
      },
      individualOverrides: registry.individualOverrides,
      routingTemplates: registry.routingTemplates,
      nativeFallbackAvailable: true,
    });
  }
  return {
    document: {
      id: documentId,
      kind,
      displayName,
    },
    scope: { ...(scope.websiteId ? { websiteId: scope.websiteId } : {}) },
    content: { mode: "none", ...(pageType ? { pageType } : {}) },
    ownership: canvasResolution ? {
      resolved: resolvedOwnership(canvasResolution),
      ...(activeTemplateReference(canvasResolution)
        ? { activeTemplate: activeTemplateReference(canvasResolution) }
        : {}),
    } : { resolved: { source: "native-fallback" } },
    navigation: {
      returnHref: managementHref(scope, "pages"),
      returnLabel: "Back to Pages",
      ...(frontendHref ? { frontendHref } : {}),
    },
    capabilities: {
      canChangePreview: false,
      canOpenFrontend: Boolean(frontendHref),
      canEditAssignedTemplate: false,
    },
  };
}

export async function resolveBuilderEditorSession(input: {
  documentId?: unknown;
  routingTemplateId?: unknown;
  individual?: unknown;
  page?: unknown;
  previewIdentity?: StableContentIdentity;
  authoredLayout?: BuilderLayout;
  scope?: BuilderDataScope;
  website?: SaaSWebsite | null;
  resolveContexts?: DynamicContentContextResolver;
}) {
  const hasTemplate = input.routingTemplateId !== undefined && input.routingTemplateId !== null;
  const hasIndividual = input.individual !== undefined && input.individual !== null;
  if (hasTemplate && hasIndividual) {
    throw new BuilderEditorContextMismatchError("Template and Individual Builder contexts cannot be combined.");
  }
  const scope = input.scope ?? {};
  if (hasTemplate) {
    const resolution = await resolveTemplateBuilderContext({
      documentId: input.documentId,
      routingTemplateId: input.routingTemplateId,
      previewIdentity: input.previewIdentity,
      authoredLayout: input.authoredLayout,
      scope,
      website: input.website,
      resolveContexts: input.resolveContexts,
    });
    return { mode: "routing-template" as const, resolution, editorContext: projectTemplateBuilderEditorContext(resolution, scope) };
  }
  if (hasIndividual) {
    const resolution = await resolveIndividualBuilderContext({
      documentId: input.documentId,
      individual: input.individual,
      authoredLayout: input.authoredLayout,
      scope,
      website: input.website,
      resolveContexts: input.resolveContexts,
    });
    return { mode: "individual" as const, resolution, editorContext: projectIndividualBuilderEditorContext(resolution, scope) };
  }
  if (input.documentId !== undefined && input.documentId !== null) {
    throw new BuilderEditorContextMismatchError("A strict Builder document requires its validated owner context.");
  }
  const editorContext = await resolveOrdinaryBuilderEditorContext({ page: input.page, scope });
  return { mode: "page" as const, resolution: null, editorContext };
}

type EditableRequest =
  | {
      kind: "dynamic" | "singular";
      context: CanonicalRouteContext;
      storefrontHref?: string;
      label?: string;
    }
  | {
      kind: "page";
      pageId: string;
    };

async function canonicalRegistry(
  _context: CanonicalRouteContext,
  scope: BuilderDataScope,
): Promise<LayoutRoutingRegistry | null> {
  // Compatibility helpers only expose pre-existing layouts. Page-type
  // ownership belongs to the registry and is no longer gated by four families.
  await ensureProductSingleRoutingCompatibility(scope);
  await ensurePostSingleRoutingCompatibility(scope);
  await ensureProductCategoryRoutingCompatibility(scope);
  await ensurePostCategoryRoutingCompatibility(scope);
  return readLayoutRoutingRegistry(scope);
}

export async function getEditableLayoutTargetForCurrentRequest(input: {
  request: EditableRequest;
  scope?: BuilderDataScope;
  readRegistry?: (context: CanonicalRouteContext, scope: BuilderDataScope) => Promise<LayoutRoutingRegistry | null>;
}): Promise<EditableLayoutTarget | null> {
  const scope = input.scope ?? {};
  if (input.request.kind === "page") {
    return {
      label: "Edit Page",
      targetKind: "page",
      builderHref: builderHref(scope, { page: input.request.pageId }),
      effectiveSource: "page",
    };
  }
  const registry = await (input.readRegistry ?? canonicalRegistry)(input.request.context, scope);
  if (!registry) return null;
  const resolution: LayoutResolution = resolveLayout({
    context: input.request.context,
    individualOverrides: registry.individualOverrides,
    routingTemplates: registry.routingTemplates,
    nativeFallbackAvailable: true,
  });
  const identity: StableContentIdentity = input.request.context;
  if (resolution.outcome === "individual") {
    return {
      label: "Edit Individual Layout",
      targetKind: "individual",
      builderHref: builderHref(scope, {
        document: resolution.layoutId,
        individual: encodeIndividualBuilderIdentity(identity),
      }),
      effectiveSource: resolution.outcome,
      documentId: resolution.layoutId,
      individualIdentity: identity,
    };
  }
  if (resolution.outcome === "routing-template") {
    const knownLabel = ({
      post: "Edit Single Post Template",
      product: "Edit Product Template",
      "product-category": "Edit Product Category Template",
      "post-category": "Edit Post Category Template",
    } as const)[input.request.context.contentType as "post" | "product" | "product-category" | "post-category"];
    return {
      label: knownLabel ?? `Edit ${input.request.context.contentType} Template`,
      targetKind: "routing-template",
      builderHref: builderHref(scope, {
        document: resolution.layoutId,
        routingTemplate: resolution.template.id,
        previewProvider: identity.provider,
        previewContentType: identity.contentType,
        previewContentId: identity.contentId,
        ...(input.request.context.contentType === "product-category"
          ? { category: input.request.context.slug }
          : {}),
      }),
      effectiveSource: resolution.outcome,
      documentId: resolution.layoutId,
      routingTemplateId: resolution.template.id,
      individualIdentity: identity,
    };
  }
  if (resolution.outcome === "native-fallback") {
    const category = input.request.context.contentType.endsWith("-category");
    return {
      label: input.request.context.contentType === "product-category"
        ? "Create Global Product Category Template"
        : input.request.context.contentType === "post-category"
          ? "Create Global Post Category Template"
          : "Create Layout",
      targetKind: "content-management",
      builderHref: managementHref(scope, category ? "templates" : "content"),
      effectiveSource: resolution.outcome,
      individualIdentity: identity,
    };
  }
  return null;
}
