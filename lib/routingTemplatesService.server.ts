import { randomUUID } from "node:crypto";
import {
  parseLayoutDocumentId,
  parseRoutingTemplateId,
  type LayoutDocumentId,
  type RoutingTemplate,
  type RoutingTemplateId,
  type SingularTemplateCondition,
} from "@/lib/layoutRouting";
import {
  BuilderDocumentNotFoundError,
  InvalidBuilderDocumentIdError,
  createDynamicBuilderDocument,
  deleteDynamicBuilderDocument,
  duplicateDynamicBuilderDocument,
  parseDynamicBuilderDocumentId,
  readDynamicBuilderDocument,
  type DynamicBuilderDocumentCreateInput,
} from "@/lib/builderLayoutDocuments.server";
import {
  ensurePostSingleRoutingCompatibility,
  ensurePostCategoryRoutingCompatibility,
  ensureProductCategoryRoutingCompatibility,
  ensureProductSingleRoutingCompatibility,
  getBuilderLayoutByDocumentId,
  mutateLayoutRoutingRegistry,
  readLayoutRoutingRegistry,
  writeLayoutRoutingRegistry,
  type LayoutRoutingRegistry,
} from "@/lib/layoutRoutingStore.server";
import {
  InvalidLayoutReferenceRequestError,
  ReferencedLayoutNotFoundError,
  inspectLayoutDocumentReferences,
} from "@/lib/layoutDocumentReferences.server";
import type { BuilderDataScope } from "@/lib/builderLayouts";
import { createRoutingTemplateStarterSections, type RoutingTemplateStarter } from "@/lib/routingTemplateStarters";

const GENERATED_TEMPLATE_ID = /^routing:template:([a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12})$/i;
const COMPATIBILITY_TEMPLATE_IDS = new Set([
  "routing:legacy-product-single",
  "routing:legacy-post-single",
  "routing:legacy-product-category",
  "routing:legacy-post-category",
]);

export type RoutingTemplateContentType = "product" | "post" | "product-category" | "post-category";

export class InvalidRoutingTemplateRequestError extends Error {}
export class RoutingTemplateNotFoundError extends Error {}
export class RoutingTemplateConflictError extends Error {}

export type RoutingTemplateReferences = {
  layoutId: LayoutDocumentId;
  routingTemplates: Array<{ id: RoutingTemplateId; name: string }>;
  individualOverrides: Array<{ provider: string; contentType: string; contentId: string }>;
  pages: Array<{ pageId: string }>;
  documents: Array<{ document: string }>;
  hasReferences: boolean;
};

type ServiceDependencies = {
  readRegistry: typeof readLayoutRoutingRegistry;
  writeRegistry: typeof writeLayoutRoutingRegistry;
  createDocument: typeof createDynamicBuilderDocument;
  readDocument: typeof readDynamicBuilderDocument;
  duplicateDocument: typeof duplicateDynamicBuilderDocument;
  deleteDocument: typeof deleteDynamicBuilderDocument;
};

const defaultDependencies: ServiceDependencies = {
  readRegistry: readLayoutRoutingRegistry,
  writeRegistry: writeLayoutRoutingRegistry,
  createDocument: createDynamicBuilderDocument,
  readDocument: readDynamicBuilderDocument,
  duplicateDocument: duplicateDynamicBuilderDocument,
  deleteDocument: deleteDynamicBuilderDocument,
};

function parseServiceTemplateId(value: unknown): RoutingTemplateId {
  if (typeof value !== "string" ||
      (!GENERATED_TEMPLATE_ID.test(value) && !COMPATIBILITY_TEMPLATE_IDS.has(value))) {
    throw new InvalidRoutingTemplateRequestError("Invalid Routing Template ID.");
  }
  return parseRoutingTemplateId(value);
}

function generatedTemplateId() {
  return parseServiceTemplateId(`routing:template:${randomUUID()}`);
}

function cleanName(value: unknown) {
  if (typeof value !== "string" || !value.trim()) {
    throw new InvalidRoutingTemplateRequestError("Routing Template name is required.");
  }
  return value.trim();
}

function contentTypeOf(template: RoutingTemplate): RoutingTemplateContentType | null {
  const values = template.conditions.flatMap((condition) =>
    condition.subject === "content-type" && condition.operator === "include"
      ? [condition.contentType]
      : [],
  );
  return values.length === 1 && ["product", "post", "product-category", "post-category"].includes(values[0] ?? "")
    ? values[0] as RoutingTemplateContentType
    : null;
}

function validateConditions(
  contentType: RoutingTemplateContentType,
  input?: readonly SingularTemplateCondition[],
): SingularTemplateCondition[] {
  const defaults: SingularTemplateCondition[] = [{
    subject: "content-type",
    operator: "include",
    contentType,
  }];
  const conditions: SingularTemplateCondition[] = structuredClone(input
    ? [...input]
    : defaults);
  if (!conditions.length) {
    throw new InvalidRoutingTemplateRequestError("At least one assignment condition is required.");
  }
  let positiveIdentityConditions = 0;
  let matchingTypeConditions = 0;
  for (const condition of conditions) {
    if (condition.operator !== "include" && condition.operator !== "exclude") {
      throw new InvalidRoutingTemplateRequestError("Invalid condition operator.");
    }
    if (condition.subject === "content-type") {
      if (!["product", "post", "product-category", "post-category"].includes(condition.contentType)) {
        throw new InvalidRoutingTemplateRequestError("Unsupported routing content type.");
      }
      if (condition.operator === "include" && condition.contentType === contentType) {
        matchingTypeConditions += 1;
      }
      continue;
    }
    if (condition.subject === "content-identity") {
      const identity = condition.identity;
      if (!identity?.provider?.trim() || !identity.contentType?.trim() || !identity.contentId?.trim()) {
        throw new InvalidRoutingTemplateRequestError("Invalid content identity condition.");
      }
      if (condition.operator === "include") positiveIdentityConditions += 1;
      continue;
    }
    if (condition.subject === "taxonomy-term") {
      if (!condition.taxonomy?.trim() || !condition.termId?.trim()) {
        throw new InvalidRoutingTemplateRequestError("Invalid taxonomy condition.");
      }
      if (condition.operator === "include") positiveIdentityConditions += 1;
      continue;
    }
    throw new InvalidRoutingTemplateRequestError("Unsupported routing condition.");
  }
  if (matchingTypeConditions !== 1) {
    throw new InvalidRoutingTemplateRequestError(
      `A ${contentType} template requires one matching include condition.`,
    );
  }
  if (positiveIdentityConditions > 1) {
    throw new InvalidRoutingTemplateRequestError(
      "Multiple positive identity conditions have unsupported AND semantics.",
    );
  }
  return conditions;
}

function normalizeOrder(templates: readonly RoutingTemplate[]) {
  return templates.map((template, index) => ({ ...template, order: index * 10 }));
}

async function compatibilityRegistry(scope: BuilderDataScope) {
  await ensureProductSingleRoutingCompatibility(scope);
  await ensurePostSingleRoutingCompatibility(scope);
  await ensureProductCategoryRoutingCompatibility(scope);
  return ensurePostCategoryRoutingCompatibility(scope);
}

export function createRoutingTemplatesService(
  scope: BuilderDataScope = {},
  dependencies: Partial<ServiceDependencies> = {},
) {
  const deps = { ...defaultDependencies, ...dependencies };

  async function readRegistry() {
    if (dependencies.readRegistry) return deps.readRegistry(scope);
    return compatibilityRegistry(scope);
  }

  async function persistTemplates(registry: LayoutRoutingRegistry, templates: RoutingTemplate[]) {
    const next = { ...registry, routingTemplates: normalizeOrder(templates) };
    if (dependencies.readRegistry || dependencies.writeRegistry) {
      await deps.writeRegistry(next, scope);
      return next;
    }
    return mutateLayoutRoutingRegistry(scope, (current) => {
      const merged = { ...current, routingTemplates: next.routingTemplates };
      return { registry: merged, result: merged };
    });
  }

  async function get(value: unknown) {
    const id = parseServiceTemplateId(value);
    const template = (await readRegistry()).routingTemplates.find((item) => item.id === id);
    if (!template) throw new RoutingTemplateNotFoundError("Routing Template not found.");
    return template;
  }

  async function inspectReferences(layoutIdValue: unknown, excludingTemplateId?: RoutingTemplateId) {
    if (!dependencies.readRegistry && !dependencies.readDocument) {
      try {
        return await inspectLayoutDocumentReferences(layoutIdValue, scope, {
          routingTemplateId: excludingTemplateId,
        });
      } catch (error) {
        if (error instanceof InvalidLayoutReferenceRequestError) {
          throw new InvalidRoutingTemplateRequestError(error.message);
        }
        if (error instanceof ReferencedLayoutNotFoundError) {
          throw new RoutingTemplateNotFoundError(error.message);
        }
        throw error;
      }
    }
    let layoutId: LayoutDocumentId;
    try {
      layoutId = parseDynamicBuilderDocumentId(layoutIdValue);
      await deps.readDocument(layoutId, scope);
    } catch (dynamicError) {
      if (typeof layoutIdValue === "string" && layoutIdValue.startsWith("layout:builder:dynamic:")) {
        if (dynamicError instanceof InvalidBuilderDocumentIdError) {
          throw new InvalidRoutingTemplateRequestError("Invalid layout document ID.");
        }
        if (dynamicError instanceof BuilderDocumentNotFoundError) {
          throw new RoutingTemplateNotFoundError("Builder layout document not found.");
        }
      }
      // Compatibility layouts are valid references even though they are not dynamic documents.
      try {
        layoutId = parseLayoutDocumentId(layoutIdValue);
      } catch {
        throw new InvalidRoutingTemplateRequestError("Invalid layout document ID.");
      }
      if (!layoutId.startsWith("layout:builder:") || !await getBuilderLayoutByDocumentId(layoutId, scope)) {
        throw new RoutingTemplateNotFoundError("Builder layout document not found.");
      }
    }
    const registry = await readRegistry();
    const routingTemplates = registry.routingTemplates
      .filter((template) => template.id !== excludingTemplateId && template.layoutId === layoutId)
      .map(({ id, name }) => ({ id, name }));
    const individualOverrides = registry.individualOverrides
      .filter((override) => override.layoutId === layoutId)
      .map(({ provider, contentType, contentId }) => ({ provider, contentType, contentId }));
    return {
      layoutId,
      routingTemplates,
      individualOverrides,
      // Current page/header/footer contracts store their own Builder keys, not layoutId references.
      pages: [],
      documents: [],
      hasReferences: routingTemplates.length > 0 || individualOverrides.length > 0,
    } satisfies RoutingTemplateReferences;
  }

  return {
    async list() {
      return (await readRegistry()).routingTemplates;
    },
    get,
    async create(input: {
      name: string;
      contentType: RoutingTemplateContentType;
      conditions?: readonly SingularTemplateCondition[];
      enabled?: boolean;
      layout?: DynamicBuilderDocumentCreateInput;
      starter?: RoutingTemplateStarter;
    }) {
      if (!["product", "post", "product-category", "post-category"].includes(input.contentType)) {
        throw new InvalidRoutingTemplateRequestError("Unsupported Routing Template content type.");
      }
      const name = cleanName(input.name);
      const conditions = validateConditions(input.contentType, input.conditions);
      const registry = await readRegistry();
      const document = await deps.createDocument({
        ...input.layout,
        displayName: input.layout?.displayName ?? name,
        sections: input.layout?.sections ?? createRoutingTemplateStarterSections(input.contentType, input.starter ?? "blank"),
      }, scope);
      const template: RoutingTemplate = {
        id: generatedTemplateId(),
        name,
        enabled: input.enabled ?? true,
        order: registry.routingTemplates.length * 10,
        view: input.contentType.endsWith("-category") ? "archive" : "singular",
        conditions,
        layoutId: document.documentId,
      };
      try {
        await persistTemplates(registry, [...registry.routingTemplates, template]);
      } catch (error) {
        try { await deps.deleteDocument(document.documentId, scope); } catch { /* retain original failure */ }
        throw error;
      }
      return { template, document };
    },
    async update(value: unknown, input: {
      name?: string;
      enabled?: boolean;
      conditions?: readonly SingularTemplateCondition[];
    }) {
      const id = parseServiceTemplateId(value);
      const registry = await readRegistry();
      const index = registry.routingTemplates.findIndex((item) => item.id === id);
      if (index < 0) throw new RoutingTemplateNotFoundError("Routing Template not found.");
      const current = registry.routingTemplates[index]!;
      const contentType = contentTypeOf(current);
      if (!contentType) throw new RoutingTemplateConflictError("Template has unsupported assignment conditions.");
      const template: RoutingTemplate = {
        ...current,
        name: input.name === undefined ? current.name : cleanName(input.name),
        enabled: input.enabled ?? current.enabled,
        conditions: input.conditions === undefined
          ? current.conditions
          : validateConditions(contentType, input.conditions),
      };
      const templates = [...registry.routingTemplates];
      templates[index] = template;
      await persistTemplates(registry, templates);
      return template;
    },
    async setEnabled(value: unknown, enabled: boolean) {
      if (typeof enabled !== "boolean") {
        throw new InvalidRoutingTemplateRequestError("Enabled state must be boolean.");
      }
      return this.update(value, { enabled });
    },
    async reorder(values: readonly unknown[]) {
      const registry = await readRegistry();
      if (!Array.isArray(values) || values.length !== registry.routingTemplates.length) {
        throw new InvalidRoutingTemplateRequestError("Reorder must include every Routing Template exactly once.");
      }
      const ids = values.map(parseServiceTemplateId);
      if (new Set(ids).size !== ids.length) {
        throw new InvalidRoutingTemplateRequestError("Duplicate Routing Template ID in reorder.");
      }
      const byId = new Map(registry.routingTemplates.map((template) => [template.id, template]));
      const templates = ids.map((id) => {
        const template = byId.get(id);
        if (!template) throw new RoutingTemplateNotFoundError("Routing Template not found in this website.");
        return template;
      });
      return (await persistTemplates(registry, templates)).routingTemplates;
    },
    async duplicate(value: unknown) {
      const id = parseServiceTemplateId(value);
      const registry = await readRegistry();
      const index = registry.routingTemplates.findIndex((item) => item.id === id);
      if (index < 0) throw new RoutingTemplateNotFoundError("Routing Template not found.");
      const source = registry.routingTemplates[index]!;
      let document;
      if (source.layoutId.startsWith("layout:builder:dynamic:")) {
        document = await deps.duplicateDocument(source.layoutId, scope);
      } else {
        const legacyLayout = await getBuilderLayoutByDocumentId(source.layoutId, scope);
        if (!legacyLayout) throw new RoutingTemplateConflictError("Referenced Builder layout was not found.");
        document = await deps.createDocument({
          displayName: `${source.name} Copy`,
          design: structuredClone(legacyLayout.design),
          sections: structuredClone(legacyLayout.sections),
        }, scope);
      }
      const template: RoutingTemplate = {
        ...source,
        id: generatedTemplateId(),
        name: `${source.name} Copy`,
        layoutId: document.documentId,
      };
      try {
        await persistTemplates(registry, [
          ...registry.routingTemplates.slice(0, index + 1),
          template,
          ...registry.routingTemplates.slice(index + 1),
        ]);
      } catch (error) {
        try { await deps.deleteDocument(document.documentId, scope); } catch { /* retain original failure */ }
        throw error;
      }
      return { template, document };
    },
    inspectReferences,
    async delete(value: unknown, options: { deleteUnreferencedLayout?: boolean } = {}) {
      const id = parseServiceTemplateId(value);
      const registry = await readRegistry();
      const template = registry.routingTemplates.find((item) => item.id === id);
      if (!template) throw new RoutingTemplateNotFoundError("Routing Template not found.");
      await persistTemplates(registry, registry.routingTemplates.filter((item) => item.id !== id));
      const references = await inspectReferences(template.layoutId, id);
      let layoutDeleted = false;
      if (options.deleteUnreferencedLayout !== false && !references.hasReferences) {
        try {
          await deps.deleteDocument(template.layoutId, scope);
          layoutDeleted = true;
        } catch {
          // Legacy compatibility layouts are preserved; dynamic lookup failures stay non-destructive.
        }
      }
      return { template, layoutDeleted, references };
    },
  };
}
