import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  builderKeyFromLayoutDocumentId,
  builderLayoutDocumentId,
  createLegacyPostSingleRoutingTemplate,
  createLegacyProductSingleRoutingTemplate,
  parseLayoutDocumentId,
  parseRoutingTemplateId,
  parseStableContentIdentity,
  type IndividualLayoutOverride,
  type RoutingTemplate,
  type SingularTemplateCondition,
} from "@/lib/layoutRouting";
import {
  mutateBuilderLayoutStore,
  readBuilderLayoutStore,
  type BuilderDataScope,
  type BuilderLayout,
  type BuilderLayoutKey,
} from "@/lib/builderLayouts";
import { getBuilderRoutingPath } from "@/lib/websiteBuilderData";

export type LayoutRoutingRegistry = {
  version: 1;
  routingTemplates: RoutingTemplate[];
  individualOverrides: IndividualLayoutOverride[];
};

const emptyRegistry = (): LayoutRoutingRegistry => ({
  version: 1,
  routingTemplates: [],
  individualOverrides: [],
});

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

function parseCondition(value: unknown): SingularTemplateCondition {
  if (!isRecord(value) || (value.operator !== "include" && value.operator !== "exclude")) {
    throw new Error("Invalid routing-template condition.");
  }
  if (value.subject === "content-type" && typeof value.contentType === "string" && value.contentType) {
    return { subject: value.subject, operator: value.operator, contentType: value.contentType };
  }
  if (value.subject === "content-identity") {
    return { subject: value.subject, operator: value.operator, identity: parseStableContentIdentity(value.identity) };
  }
  if (
    value.subject === "taxonomy-term" &&
    typeof value.taxonomy === "string" && value.taxonomy &&
    typeof value.termId === "string" && value.termId
  ) {
    return {
      subject: value.subject,
      operator: value.operator,
      taxonomy: value.taxonomy,
      termId: value.termId,
    };
  }
  throw new Error("Invalid routing-template condition.");
}

function isExplicitPostTemplate(template: RoutingTemplate) {
  return template.view === "singular" && template.conditions.some(
    (condition) => condition.subject === "content-type" &&
      condition.operator === "include" && condition.contentType === "post",
  );
}

function createPostSingleCompatibilityLayout(): BuilderLayout {
  return {
    version: 1,
    page: "post-single",
    targetType: "template",
    template: "post-single",
    updatedAt: new Date(0).toISOString(),
    sections: [{
      id: "post-single-content",
      kind: "contentLayout",
      title: "",
      eyebrow: "",
      body: "",
      visible: true,
      contentMode: "default",
      layout: "whole",
      layoutColumns: 1,
      layoutRows: 1,
      layoutItems: [{
        id: "post-single-column",
        rowId: "post-single-row",
        rowLayout: "whole",
        blocks: [
          {
            id: "post-single-heading",
            kind: "heading",
            headingText: "Post title",
            dynamicBindings: { headingText: { path: "title", valueType: "string" } },
          },
          {
            id: "post-single-image",
            kind: "image",
            imageUrl: "",
            imageAlt: "",
            dynamicBindings: {
              imageUrl: { path: "featuredImage.url", valueType: "url" },
              imageAlt: { path: "featuredImage.alt", valueType: "string" },
            },
          },
          {
            id: "post-single-content-body",
            kind: "text",
            body: "Post content",
            dynamicBindings: { body: { path: "content", valueType: "richText" } },
          },
        ],
      }],
    }],
  } as BuilderLayout;
}

/** Persistently and idempotently exposes a minimal Single Post document. */
export async function ensurePostSingleRoutingCompatibility(
  scope: BuilderDataScope = {},
): Promise<LayoutRoutingRegistry> {
  let registry = await readLayoutRoutingRegistry(scope);
  if (registry.routingTemplates.some((template) => template.id === "routing:legacy-post-single")) {
    return registry;
  }

  await mutateBuilderLayoutStore((layouts) => {
    if (!layouts["post-single"]) {
      layouts["post-single"] = createPostSingleCompatibilityLayout();
    }
  }, scope);

  registry = {
    ...registry,
    routingTemplates: [
      ...registry.routingTemplates,
      createLegacyPostSingleRoutingTemplate(builderLayoutDocumentId("post-single")),
    ],
  };
  await writeLayoutRoutingRegistry(registry, scope);
  return registry;
}

function parseTemplate(value: unknown): RoutingTemplate {
  if (
    !isRecord(value) || typeof value.name !== "string" || !value.name.trim() ||
    typeof value.enabled !== "boolean" || typeof value.order !== "number" ||
    !Number.isFinite(value.order) || value.view !== "singular" || !Array.isArray(value.conditions)
  ) {
    throw new Error("Invalid routing template.");
  }
  return {
    id: parseRoutingTemplateId(value.id),
    name: value.name,
    enabled: value.enabled,
    order: value.order,
    view: value.view,
    conditions: value.conditions.map(parseCondition),
    layoutId: parseLayoutDocumentId(value.layoutId),
  };
}

function parseOverride(value: unknown): IndividualLayoutOverride {
  if (!isRecord(value)) throw new Error("Invalid individual layout override.");
  return {
    ...parseStableContentIdentity(value),
    layoutId: parseLayoutDocumentId(value.layoutId),
  };
}

export function parseLayoutRoutingRegistry(value: unknown): LayoutRoutingRegistry {
  if (!isRecord(value) || value.version !== 1) throw new Error("Invalid layout routing registry.");
  if (!Array.isArray(value.routingTemplates) || !Array.isArray(value.individualOverrides)) {
    throw new Error("Invalid layout routing registry.");
  }
  return {
    version: 1,
    routingTemplates: value.routingTemplates.map(parseTemplate),
    individualOverrides: value.individualOverrides.map(parseOverride),
  };
}

export async function readLayoutRoutingRegistry(
  scope: BuilderDataScope = {},
): Promise<LayoutRoutingRegistry> {
  try {
    return parseLayoutRoutingRegistry(
      JSON.parse(await readFile(getBuilderRoutingPath(scope.websiteId), "utf8")),
    );
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return emptyRegistry();
    throw error;
  }
}

export async function writeLayoutRoutingRegistry(
  registry: LayoutRoutingRegistry,
  scope: BuilderDataScope = {},
) {
  const validated = parseLayoutRoutingRegistry(registry);
  const filePath = getBuilderRoutingPath(scope.websiteId);
  await mkdir(path.dirname(filePath), { recursive: true });
  const temporaryPath = `${filePath}.${process.pid}.${crypto.randomUUID()}.tmp`;
  await writeFile(temporaryPath, `${JSON.stringify(validated, null, 2)}\n`, "utf8");
  await rename(temporaryPath, filePath);
}

const registryMutationQueues = new Map<string, Promise<void>>();

/**
 * Canonical in-process routing-registry mutation boundary. Mutators receive the
 * latest validated registry while holding the website-specific queue, so one
 * route family cannot persist a stale snapshot over another family.
 */
export async function mutateLayoutRoutingRegistry<Result>(
  scope: BuilderDataScope,
  mutate: (registry: LayoutRoutingRegistry) => Promise<{
    registry: LayoutRoutingRegistry;
    result: Result;
  }> | { registry: LayoutRoutingRegistry; result: Result },
): Promise<Result> {
  const queueKey = getBuilderRoutingPath(scope.websiteId);
  const previous = registryMutationQueues.get(queueKey) ?? Promise.resolve();
  let release!: () => void;
  const current = new Promise<void>((resolve) => { release = resolve; });
  const queued = previous.then(() => current);
  registryMutationQueues.set(queueKey, queued);
  await previous;
  try {
    const next = await mutate(await readLayoutRoutingRegistry(scope));
    await writeLayoutRoutingRegistry(next.registry, scope);
    return next.result;
  } finally {
    release();
    if (registryMutationQueues.get(queueKey) === queued) registryMutationQueues.delete(queueKey);
  }
}

function isExplicitProductTemplate(template: RoutingTemplate) {
  return template.view === "singular" && template.conditions.some(
    (condition) => condition.subject === "content-type" &&
      condition.operator === "include" && condition.contentType === "product",
  );
}

/** Idempotently exposes the existing document through the new routing model. */
export async function ensureProductSingleRoutingCompatibility(
  scope: BuilderDataScope = {},
): Promise<LayoutRoutingRegistry> {
  const registry = await readLayoutRoutingRegistry(scope);
  if (registry.routingTemplates.some((template) => template.id === "routing:legacy-product-single")) {
    return registry;
  }

  const layouts = await readBuilderLayoutStore(scope);
  if (!layouts["product-single"]) return registry;

  const next = {
    ...registry,
    routingTemplates: [
      ...registry.routingTemplates,
      createLegacyProductSingleRoutingTemplate(builderLayoutDocumentId("product-single")),
    ],
  };
  await writeLayoutRoutingRegistry(next, scope);
  return next;
}

/** Strict document lookup; no legacy key normalization or Shop fallback. */
export async function getBuilderLayoutByDocumentId(
  layoutId: ReturnType<typeof parseLayoutDocumentId>,
  scope: BuilderDataScope = {},
): Promise<BuilderLayout | null> {
  const key = builderKeyFromLayoutDocumentId(layoutId);
  const layouts = await readBuilderLayoutStore(scope);
  if (!Object.prototype.hasOwnProperty.call(layouts, key)) return null;
  return layouts[key as BuilderLayoutKey] ?? null;
}
