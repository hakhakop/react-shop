import {
  parseStableContentIdentity,
  resolveLayout,
  sameContentIdentity,
  type IndividualLayoutOverride,
  type LayoutDocumentId,
  type LayoutResolution,
  type RoutingTemplate,
  type StableContentIdentity,
} from "@/lib/layoutRouting";
import {
  createDynamicBuilderDocument,
  deleteDynamicBuilderDocument,
  readDynamicBuilderDocument,
  type DynamicBuilderDocumentCreateInput,
  type DynamicBuilderLayout,
} from "@/lib/builderLayoutDocuments.server";
import {
  ensurePostSingleRoutingCompatibility,
  ensureProductSingleRoutingCompatibility,
  mutateLayoutRoutingRegistry,
  writeLayoutRoutingRegistry,
  type LayoutRoutingRegistry,
} from "@/lib/layoutRoutingStore.server";
import {
  inspectLayoutDocumentReferences,
  type LayoutDocumentReferences,
} from "@/lib/layoutDocumentReferences.server";
import type { BuilderDataScope } from "@/lib/builderLayouts";

export type IndividualContentAvailability = "unknown" | "published" | "unpublished" | "missing";

export type IndividualLayoutStatus = {
  identity: StableContentIdentity;
  contentAvailability: IndividualContentAvailability;
  individualLayout: null | { layoutId: LayoutDocumentId };
  assignedTemplate: null | {
    templateId: RoutingTemplate["id"];
    name: string;
    layoutId: LayoutDocumentId;
  };
  effective: { source: LayoutResolution["outcome"]; layoutId?: LayoutDocumentId };
  fallback: { source: LayoutResolution["outcome"]; layoutId?: LayoutDocumentId };
};

export class InvalidIndividualLayoutRequestError extends Error {}
export class UnsupportedIndividualLayoutTargetError extends Error {}
export class IndividualLayoutNotFoundError extends Error {}
export class IndividualLayoutConflictError extends Error {}

type RegistryMutation<Result> = (
  mutate: (registry: LayoutRoutingRegistry) => Promise<{
    registry: LayoutRoutingRegistry;
    result: Result;
  }> | { registry: LayoutRoutingRegistry; result: Result },
) => Promise<Result>;

type ServiceDependencies = {
  readRegistry: (scope: BuilderDataScope) => Promise<LayoutRoutingRegistry>;
  writeRegistry: typeof writeLayoutRoutingRegistry;
  mutateRegistry: <Result>(
    scope: BuilderDataScope,
    mutate: Parameters<RegistryMutation<Result>>[0],
  ) => Promise<Result>;
  createDocument: typeof createDynamicBuilderDocument;
  readDocument: typeof readDynamicBuilderDocument;
  deleteDocument: typeof deleteDynamicBuilderDocument;
  inspectReferences: typeof inspectLayoutDocumentReferences;
};

const defaultDependencies: ServiceDependencies = {
  readRegistry: async (scope) => {
    await ensureProductSingleRoutingCompatibility(scope);
    return ensurePostSingleRoutingCompatibility(scope);
  },
  writeRegistry: writeLayoutRoutingRegistry,
  mutateRegistry: mutateLayoutRoutingRegistry,
  createDocument: createDynamicBuilderDocument,
  readDocument: readDynamicBuilderDocument,
  deleteDocument: deleteDynamicBuilderDocument,
  inspectReferences: inspectLayoutDocumentReferences,
};

export function parseSupportedIndividualIdentity(value: unknown): StableContentIdentity {
  let identity: StableContentIdentity;
  try { identity = parseStableContentIdentity(value); } catch {
    throw new InvalidIndividualLayoutRequestError("Invalid stable content identity.");
  }
  if (
    identity.provider !== identity.provider.trim() ||
    identity.contentType !== identity.contentType.trim() ||
    identity.contentId !== identity.contentId.trim()
  ) {
    throw new InvalidIndividualLayoutRequestError("Invalid stable content identity.");
  }
  const supported =
    (identity.provider === "woocommerce" && identity.contentType === "product") ||
    (identity.provider === "wordpress" && identity.contentType === "post");
  if (!supported) {
    throw new UnsupportedIndividualLayoutTargetError(
      "Only WooCommerce Products and WordPress Posts support Individual Layouts.",
    );
  }
  return identity;
}

function resolverContext(identity: StableContentIdentity) {
  return {
    view: "singular" as const,
    ...identity,
    slug: "",
    uri: "",
    taxonomyTerms: [],
  };
}

function resolutionProjection(resolution: LayoutResolution) {
  return {
    source: resolution.outcome,
    ...(resolution.outcome === "individual" || resolution.outcome === "routing-template" ||
      (resolution.outcome === "not-found" && resolution.layoutId)
      ? { layoutId: resolution.layoutId }
      : {}),
  };
}

function statusFromRegistry(
  identity: StableContentIdentity,
  registry: LayoutRoutingRegistry,
): IndividualLayoutStatus {
  const individual = registry.individualOverrides.find((item) => sameContentIdentity(item, identity));
  const input = {
    context: resolverContext(identity),
    routingTemplates: registry.routingTemplates,
    nativeFallbackAvailable: true,
  };
  const effective = resolveLayout({ ...input, individualOverrides: registry.individualOverrides });
  const fallback = resolveLayout({
    ...input,
    individualOverrides: registry.individualOverrides.filter((item) => !sameContentIdentity(item, identity)),
  });
  return {
    identity,
    contentAvailability: "unknown",
    individualLayout: individual ? { layoutId: individual.layoutId } : null,
    assignedTemplate: fallback.outcome === "routing-template" ? {
      templateId: fallback.template.id,
      name: fallback.template.name,
      layoutId: fallback.layoutId,
    } : null,
    effective: resolutionProjection(effective),
    fallback: resolutionProjection(fallback),
  };
}

export function createIndividualLayoutsService(
  scope: BuilderDataScope = {},
  dependencies: Partial<ServiceDependencies> = {},
) {
  const deps = { ...defaultDependencies, ...dependencies };

  async function readRegistry() {
    return deps.readRegistry(scope);
  }

  async function mutateRegistry<Result>(
    mutate: Parameters<RegistryMutation<Result>>[0],
  ): Promise<Result> {
    if (dependencies.mutateRegistry) return deps.mutateRegistry(scope, mutate);
    if (dependencies.readRegistry || dependencies.writeRegistry) {
      const next = await mutate(await deps.readRegistry(scope));
      await deps.writeRegistry(next.registry, scope);
      return next.result;
    }
    return deps.mutateRegistry(scope, mutate);
  }

  async function getStatus(value: unknown) {
    const identity = parseSupportedIndividualIdentity(value);
    return statusFromRegistry(identity, await readRegistry());
  }

  return {
    async listAssignments() {
      return (await readRegistry()).individualOverrides;
    },
    async getAssignment(value: unknown) {
      const identity = parseSupportedIndividualIdentity(value);
      return (await readRegistry()).individualOverrides.find((item) =>
        sameContentIdentity(item, identity)) ?? null;
    },
    getStatus,
    async create(value: unknown, layout: DynamicBuilderDocumentCreateInput = {}) {
      const identity = parseSupportedIndividualIdentity(value);
      const registry = await readRegistry();
      if (registry.individualOverrides.some((item) => sameContentIdentity(item, identity))) {
        throw new IndividualLayoutConflictError("An Individual Layout already exists for this content identity.");
      }
      const document = await deps.createDocument({
        ...layout,
        design: layout.design === undefined ? undefined : structuredClone(layout.design),
        sections: layout.sections === undefined ? undefined : structuredClone(layout.sections),
      }, scope);
      try {
        const status = await mutateRegistry((current) => {
          if (current.individualOverrides.some((item) => sameContentIdentity(item, identity))) {
            throw new IndividualLayoutConflictError("An Individual Layout already exists for this content identity.");
          }
          const override: IndividualLayoutOverride = { ...identity, layoutId: document.documentId };
          const next = { ...current, individualOverrides: [...current.individualOverrides, override] };
          return { registry: next, result: statusFromRegistry(identity, next) };
        });
        return { assignment: { ...identity, layoutId: document.documentId }, document, status };
      } catch (error) {
        try { await deps.deleteDocument(document.documentId, scope); } catch { /* retain original failure */ }
        throw error;
      }
    },
    async inspectReferences(layoutId: unknown, excludingIdentity?: unknown) {
      return deps.inspectReferences(layoutId, scope, {
        individualIdentity: excludingIdentity === undefined
          ? undefined
          : parseSupportedIndividualIdentity(excludingIdentity),
      });
    },
    async remove(value: unknown, options: { deleteUnreferencedLayout?: boolean } = {}) {
      const identity = parseSupportedIndividualIdentity(value);
      const removed = await mutateRegistry((registry) => {
        const override = registry.individualOverrides.find((item) => sameContentIdentity(item, identity));
        if (!override) throw new IndividualLayoutNotFoundError("Individual Layout not found.");
        return {
          registry: {
            ...registry,
            individualOverrides: registry.individualOverrides.filter((item) => !sameContentIdentity(item, identity)),
          },
          result: override,
        };
      });
      const status = await getStatus(identity);
      let references: LayoutDocumentReferences | null = null;
      let cleanup: { outcome: "deleted" | "preserved" | "failed"; message?: string };
      try {
        references = await deps.inspectReferences(removed.layoutId, scope, { individualIdentity: identity });
        if (options.deleteUnreferencedLayout !== false &&
            references.dynamicDocument && !references.hasReferences) {
          try {
            await deps.deleteDocument(removed.layoutId, scope);
            cleanup = { outcome: "deleted" };
          } catch (error) {
            cleanup = { outcome: "failed", message: error instanceof Error ? error.message : "Layout cleanup failed." };
          }
        } else {
          cleanup = { outcome: "preserved" };
        }
      } catch (error) {
        cleanup = { outcome: "failed", message: error instanceof Error ? error.message : "Reference inspection failed." };
      }
      return { assignment: removed, status, references, cleanup };
    },
    async validateBuilderOwnership(value: unknown, documentId: unknown): Promise<DynamicBuilderLayout> {
      const identity = parseSupportedIndividualIdentity(value);
      const assignment = (await readRegistry()).individualOverrides.find((item) =>
        sameContentIdentity(item, identity));
      if (!assignment || assignment.layoutId !== documentId) {
        throw new IndividualLayoutNotFoundError(
          "The Individual Layout assignment does not own this document in the current website.",
        );
      }
      return deps.readDocument(documentId, scope);
    },
  };
}
