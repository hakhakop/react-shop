import type { BuilderLayout, BuilderLayoutBlock, BuilderSection } from "@/lib/builderLayouts";
import {
  getDynamicItemContextValue,
  resolveDynamicItem,
  type DynamicContentContextDescriptor,
  type DynamicFieldBindings,
  type DynamicItemContext,
} from "@/lib/dynamicContent";
import {
  resolveDynamicContentContexts,
  type DynamicContentProviderInput,
} from "@/lib/dynamicContentProviders.server";
import type { SaaSWebsite } from "@/lib/websites";

type GridItem = NonNullable<BuilderLayoutBlock["gridItems"]>[number];
type PanelSliderSlide = NonNullable<BuilderLayoutBlock["slides"]>[number];

export type DynamicContentMaterializationDiagnostic = {
  status: "materialized" | "fallback";
  sectionId: string;
  columnKey: string;
  blockKey: string;
  templateItemId?: string;
  contextCount?: number;
  message?: string;
};

export type MaterializedGridBlock = {
  sectionId: string;
  columnKey: string;
  blockKey: string;
};

export type BuilderDynamicContentMaterialization = {
  /** Transient render projection. Never pass this object to persistence. */
  renderLayout: BuilderLayout;
  diagnostics: DynamicContentMaterializationDiagnostic[];
  materializedGridBlocks: MaterializedGridBlock[];
};

export type DynamicContentContextResolver = (
  input: DynamicContentProviderInput,
) => Promise<DynamicItemContext[]>;

type BlockLocation = MaterializedGridBlock;

const descriptorCacheKey = (descriptor: DynamicContentContextDescriptor) =>
  JSON.stringify(descriptor, (_key, value) => {
    if (!value || typeof value !== "object" || Array.isArray(value)) return value;
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([left], [right]) => left.localeCompare(right)),
    );
  });

const withRequestedBindingFields = (
  descriptor: DynamicContentContextDescriptor,
  bindings: DynamicFieldBindings | undefined,
): DynamicContentContextDescriptor => {
  if (descriptor.provider !== "wordpress" || descriptor.source !== "content") return descriptor;
  const requestedFields = Array.from(new Set(
    Object.values(bindings ?? {})
      .map((binding) => binding?.path)
      .filter((path): path is string => typeof path === "string" && path.startsWith("acf.")),
  ));
  if (requestedFields.length === 0) return descriptor;
  return {
    ...descriptor,
    query: { ...(descriptor.query ?? {}), requestedFields },
  };
};

const asDataRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};

const resolveInheritedDescriptor = (
  descriptor: DynamicContentContextDescriptor | undefined,
  inheritedContext: DynamicItemContext | undefined,
): DynamicContentContextDescriptor | undefined => {
  if (!descriptor) return undefined;
  const query = asDataRecord(descriptor.query);
  const legacyParent = descriptor.provider === "yootheme" && descriptor.source === "#parent";
  const sourceQuery = asDataRecord(query.sourceQuery);
  const field = asDataRecord(sourceQuery.field);
  const relationRoot = typeof field.name === "string" ? field.name : "";
  const parentRelation = query.parentRelation === true || (legacyParent && Boolean(relationRoot));
  if (legacyParent && !parentRelation) return undefined;
  if (!parentRelation) return descriptor;

  const databaseId = getDynamicItemContextValue(inheritedContext, "databaseId", "identifier");
  const graphqlRoot = typeof query.graphqlRoot === "string" ? query.graphqlRoot : relationRoot;
  if (!graphqlRoot || databaseId === undefined) return descriptor;
  const relationArguments = asDataRecord(field.arguments);
  const relationStart = typeof relationArguments.offset === "number"
    ? relationArguments.offset
    : undefined;
  const relationQuantity = typeof relationArguments.limit === "number"
    ? relationArguments.limit
    : undefined;
  return {
    provider: "wordpress",
    source: "content",
    mode: "collection",
    query: {
      ...query,
      graphqlRoot,
      ...(typeof query.start !== "number" && relationStart !== undefined
        ? { start: relationStart }
        : {}),
      ...(typeof query.quantity !== "number" && relationQuantity !== undefined
        ? { quantity: relationQuantity }
        : {}),
      sourceQuery: {
        ...sourceQuery,
        arguments: {
          ...relationArguments,
          terms: [databaseId],
        },
      },
    } as DynamicContentContextDescriptor["query"],
  };
};

async function resolveInheritedContext(
  descriptor: DynamicContentContextDescriptor | undefined,
  inheritedContext: DynamicItemContext | undefined,
  website: SaaSWebsite | null | undefined,
  resolveContexts: DynamicContentContextResolver,
) {
  if (!descriptor) return inheritedContext;
  const contexts = await resolveContexts({ website, descriptor });
  return contexts[0];
}

const DYNAMIC_SINGLE_ELEMENT_KINDS = new Set([
  "heading", "image", "overlay", "text", "button", "panel", "alert",
]);

const safeErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Dynamic Content resolution failed.";

function stableIdentifierHash(value: string) {
  let hash = 0x811c9dc5;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(36);
}

/** Deterministic render-only identity derived from template and context identity. */
export function dynamicGridRenderItemId(
  templateItemId: string,
  contextId: string | number,
) {
  const templateToken = templateItemId
    .trim()
    .replace(/[^a-zA-Z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "") || "grid-item";
  return `${templateToken}--dynamic-${stableIdentifierHash(String(contextId))}`;
}

/** Panel Slider uses the same deterministic template/context identity as Grid. */
export function dynamicPanelSliderRenderItemId(
  templateItemId: string,
  contextId: string | number,
) {
  return dynamicGridRenderItemId(templateItemId, contextId);
}

/** Structural templates use the same deterministic authored/context identity. */
export function dynamicStructureRenderId(
  templateId: string,
  contextId: string | number,
) {
  return dynamicGridRenderItemId(templateId, contextId);
}

type StructuralNode = {
  id: string;
  dynamicContext?: DynamicContentContextDescriptor;
  dynamicBindings?: DynamicFieldBindings<"backgroundImageUrl">;
  visualStyle?: Record<string, unknown>;
};

const projectStructuralNode = <Node extends StructuralNode>(
  node: Node,
  context: DynamicItemContext | undefined,
  renderId?: string,
): Node => {
  const binding = node.dynamicBindings?.backgroundImageUrl;
  const backgroundImageUrl = binding
    ? getDynamicItemContextValue(context, binding.path, "url")
    : undefined;
  const projected = { ...node, ...(renderId ? { id: renderId } : {}) } as Node & Record<string, unknown>;
  delete projected.dynamicContext;
  delete projected.dynamicBindings;
  const resolvedUrl = backgroundImageUrl;
  if (resolvedUrl) {
    const visualStyle = asDataRecord(node.visualStyle);
    const background = asDataRecord(visualStyle.background);
    projected.visualStyle = {
      ...visualStyle,
      background: { ...background, type: "image", imageUrl: resolvedUrl },
    };
  }
  return projected as Node;
};

async function expandStructuralNode<Node extends StructuralNode>(
  node: Node,
  inheritedContext: DynamicItemContext | undefined,
  website: SaaSWebsite | null | undefined,
  resolveContexts: DynamicContentContextResolver,
): Promise<Array<{ node: Node; context?: DynamicItemContext }>> {
  const descriptor = node.dynamicContext;
  if (!descriptor) return [{ node, context: inheritedContext }];
  const contexts = await resolveContexts({
    website,
    descriptor: withRequestedBindingFields(descriptor, node.dynamicBindings),
  });
  if (descriptor.mode !== "collection") {
    return [{ node: projectStructuralNode(node, contexts[0]), context: contexts[0] }];
  }
  const identified = contexts.filter((context): context is DynamicItemContext & { id: string | number } =>
    (typeof context.id === "string" && context.id.length > 0) ||
    (typeof context.id === "number" && Number.isFinite(context.id)),
  );
  if (identified.length === 0) return [{ node, context: inheritedContext }];
  return identified.map((context) => {
    const projected = projectStructuralNode(node, context, dynamicStructureRenderId(node.id, context.id));
    return { node: projected, context };
  });
}

const staticGridTemplate = (item: GridItem): GridItem => {
  const projected = { ...item };
  delete projected.dynamicContext;
  delete projected.dynamicBindings;
  return projected;
};

const staticPanelSliderTemplate = (slide: PanelSliderSlide): PanelSliderSlide => {
  const projected = { ...slide };
  delete projected.dynamicContext;
  delete projected.dynamicBindings;
  return projected;
};

const staticElementTemplate = (block: BuilderLayoutBlock): BuilderLayoutBlock => {
  const projected = { ...block };
  delete projected.dynamicContext;
  delete projected.dynamicBindings;
  delete projected.dynamicProductContexts;
  return projected;
};

const staticRepeatableItemTemplate = <Item extends RepeatableItem>(item: Item): Item => {
  const projected = { ...item };
  delete projected.dynamicContext;
  delete projected.dynamicBindings;
  return projected;
};

type RepeatableItem = {
  id?: string;
  dynamicContext?: DynamicContentContextDescriptor;
  dynamicBindings?: DynamicFieldBindings;
} & Record<string, unknown>;

async function materializeRepeatableItems<Item extends RepeatableItem>(
  items: Item[],
  kind: "list" | "button" | "gallery",
  location: BlockLocation,
  website: SaaSWebsite | null | undefined,
  resolveContexts: DynamicContentContextResolver,
  diagnostics: DynamicContentMaterializationDiagnostic[],
  inheritedContext?: DynamicItemContext,
): Promise<Item[]> {
  const output: Item[] = [];
  let expanded = false;
  for (const item of items) {
    const descriptor = resolveInheritedDescriptor(
      item.dynamicContext as DynamicContentContextDescriptor | undefined,
      inheritedContext,
    );
    if (!descriptor) {
      output.push(inheritedContext && item.dynamicBindings
        ? resolveDynamicItem(item, inheritedContext, item.dynamicBindings) as Item
        : item);
      if (inheritedContext && item.dynamicBindings) expanded = true;
      continue;
    }
    if (descriptor.mode === "collection" && !item.id) {
      diagnostics.push({
        status: "fallback",
        ...location,
        templateItemId: item.id,
        message: `A collection ${kind} template requires a stable authored item ID.`,
      });
      output.push(item);
      continue;
    }
    try {
      const contexts = await resolveContexts({
        website,
        descriptor: withRequestedBindingFields(descriptor, item.dynamicBindings),
      });
      if (descriptor.mode === "single") {
        const context = contexts[0];
        if (!context) {
          diagnostics.push({ status: "fallback", ...location, templateItemId: item.id, contextCount: 0, message: "The provider returned no repeatable item." });
          output.push(item);
          continue;
        }
        output.push(resolveDynamicItem(staticRepeatableItemTemplate(item), context, item.dynamicBindings as DynamicFieldBindings) as Item);
        expanded = true;
        diagnostics.push({ status: "materialized", ...location, templateItemId: item.id, contextCount: 1 });
        continue;
      }
      const identified = contexts.filter((context): context is DynamicItemContext & { id: string | number } =>
        (typeof context.id === "string" && context.id.length > 0) ||
        (typeof context.id === "number" && Number.isFinite(context.id)),
      );
      if (identified.length === 0) {
        diagnostics.push({ status: "fallback", ...location, templateItemId: item.id, contextCount: contexts.length, message: "The provider returned no identified repeatable items." });
        output.push(item);
        continue;
      }
      const template = staticRepeatableItemTemplate(item);
      output.push(...identified.map((context) => ({
        ...resolveDynamicItem(template, context, item.dynamicBindings as DynamicFieldBindings),
        id: dynamicGridRenderItemId(String(item.id), context.id),
      } as unknown as Item)));
      expanded = true;
      diagnostics.push({ status: "materialized", ...location, templateItemId: item.id, contextCount: identified.length });
    } catch (error) {
      diagnostics.push({ status: "fallback", ...location, templateItemId: item.id, message: safeErrorMessage(error) });
      output.push(item);
    }
  }
  return expanded ? output : items;
}

async function materializeRepeatableElement(
  block: BuilderLayoutBlock,
  location: BlockLocation,
  website: SaaSWebsite | null | undefined,
  resolveContexts: DynamicContentContextResolver,
  diagnostics: DynamicContentMaterializationDiagnostic[],
  inheritedContext?: DynamicItemContext,
): Promise<BuilderLayoutBlock> {
  if (block.kind === "list" && block.listItems?.length) {
    const listItems = await materializeRepeatableItems(block.listItems, "list", location, website, resolveContexts, diagnostics, inheritedContext);
    return listItems === block.listItems ? block : { ...block, listItems };
  }
  if (block.kind === "button" && block.buttons?.length) {
    const buttons = await materializeRepeatableItems(block.buttons, "button", location, website, resolveContexts, diagnostics, inheritedContext);
    return buttons === block.buttons ? block : { ...block, buttons };
  }
  if (block.kind === "gallery" && block.galleryItems?.length) {
    const galleryItems = await materializeRepeatableItems(block.galleryItems, "gallery", location, website, resolveContexts, diagnostics, inheritedContext);
    return galleryItems === block.galleryItems ? block : { ...block, galleryItems };
  }
  return block;
}

async function materializeElementBlock(
  block: BuilderLayoutBlock,
  location: BlockLocation,
  website: SaaSWebsite | null | undefined,
  resolveContexts: DynamicContentContextResolver,
  diagnostics: DynamicContentMaterializationDiagnostic[],
  inheritedContext?: DynamicItemContext,
): Promise<BuilderLayoutBlock> {
  if (block.kind === "products") {
    const productDescriptor = block.dynamicContext ?? {
      provider: "woocommerce",
      source: "product",
      mode: "collection" as const,
      query: { quantity: 8 },
    };
    try {
      const contexts = await resolveContexts({ website, descriptor: productDescriptor });
      if (productDescriptor.mode !== "collection") {
        diagnostics.push({ status: "fallback", ...location, message: "Products requires a collection Dynamic Content source." });
        return block;
      }
      diagnostics.push({ status: "materialized", ...location, contextCount: contexts.length });
      return { ...block, dynamicProductContexts: contexts };
    } catch (error) {
      diagnostics.push({ status: "fallback", ...location, message: safeErrorMessage(error) });
      return block;
    }
  }
  if (!DYNAMIC_SINGLE_ELEMENT_KINDS.has(String(block.kind))) return block;

  const blockDescriptor = resolveInheritedDescriptor(block.dynamicContext, inheritedContext);
  if (!blockDescriptor) {
    if (!inheritedContext || !block.dynamicBindings) return block;
    return resolveDynamicItem(staticElementTemplate(block), inheritedContext, block.dynamicBindings);
  }

  try {
    const contexts = await resolveContexts({
      website,
      descriptor: withRequestedBindingFields(blockDescriptor, block.dynamicBindings),
    });
    const context = contexts[0];
    if (!context) {
      diagnostics.push({ status: "fallback", ...location, message: "The provider returned no item for the element context." });
      return block;
    }
    const template = staticElementTemplate(block);
    const resolved = resolveDynamicItem(template, context, block.dynamicBindings);
    diagnostics.push({ status: "materialized", ...location, contextCount: contexts.length });
    return resolved;
  } catch (error) {
    diagnostics.push({ status: "fallback", ...location, message: safeErrorMessage(error) });
    return block;
  }
}

async function materializeGridBlock(
  block: BuilderLayoutBlock,
  location: BlockLocation,
  website: SaaSWebsite | null | undefined,
  resolveContexts: DynamicContentContextResolver,
  diagnostics: DynamicContentMaterializationDiagnostic[],
  materializedGridBlocks: MaterializedGridBlock[],
  inheritedContext?: DynamicItemContext,
): Promise<BuilderLayoutBlock> {
  if (block.kind !== "grid") return block;

  if (block.gridSource === "products") {
    const quantity = typeof block.gridLimit === "number" && block.gridLimit > 0
      ? Math.round(block.gridLimit)
      : Math.max(1, (block.columns ?? 3) * (block.gridRows ?? 1));
    try {
      const contexts = await resolveContexts({
        website,
        descriptor: {
          provider: "woocommerce",
          source: "product",
          mode: "collection",
          query: { quantity },
        },
      });
      const gridItems: GridItem[] = contexts.slice(0, quantity).map((context, index) => {
        const image = getDynamicItemContextValue(context, "image", "media");
        return {
          id: `product-grid-${String(context.id ?? index)}`,
          imageUrl: image?.url,
          imageAlt: image?.alt ?? getDynamicItemContextValue(context, "title", "string"),
          eyebrow: "Product",
          title: getDynamicItemContextValue(context, "title", "string") ?? "Product",
          meta: getDynamicItemContextValue(context, "price", "string"),
          text: getDynamicItemContextValue(context, "categories.label", "string"),
          buttonLabel: "View product",
          buttonUrl: getDynamicItemContextValue(context, "storefront.href", "url"),
        };
      });
      diagnostics.push({ status: "materialized", ...location, contextCount: contexts.length });
      materializedGridBlocks.push(location);
      return { ...block, gridItems };
    } catch (error) {
      diagnostics.push({ status: "fallback", ...location, message: safeErrorMessage(error) });
      return block;
    }
  }

  if (!block.gridItems?.length) return block;

  let changed = false;
  let blockMaterialized = false;
  const renderItems: GridItem[] = [];

  for (const item of block.gridItems) {
    const descriptor = resolveInheritedDescriptor(item.dynamicContext, inheritedContext);
    if (!descriptor) {
      if (inheritedContext && item.dynamicBindings) {
        renderItems.push(resolveDynamicItem(staticGridTemplate(item), inheritedContext, item.dynamicBindings));
        changed = true;
      } else renderItems.push(item);
      continue;
    }
    if (descriptor.mode !== "collection") {
      diagnostics.push({
        status: "fallback",
        ...location,
        templateItemId: item.id,
        message: `Unsupported Grid Dynamic Content mode: ${descriptor.mode}.`,
      });
      renderItems.push(item);
      continue;
    }

    const templateItemId = item.id?.trim();
    if (!templateItemId) {
      diagnostics.push({
        status: "fallback",
        ...location,
        message: "A collection Grid template requires a stable authored item ID.",
      });
      renderItems.push(item);
      continue;
    }

    try {
      // A paginated Grid needs the complete bounded result window so the
      // shared client renderer can change pages without browser-side GraphQL.
      const resolvedDescriptor = block.pagination?.enabled
        ? {
            ...descriptor,
            query: {
              ...(descriptor.query ?? {}),
              quantity: 100 - Math.min(99, Math.max(0, Number(descriptor.query?.start ?? 0))),
            },
          }
        : descriptor;
      const contexts = await resolveContexts({
        website,
        descriptor: withRequestedBindingFields(resolvedDescriptor, item.dynamicBindings),
      });
      const identifiedContexts = contexts.filter(
        (context): context is DynamicItemContext & { id: string | number } =>
          (typeof context.id === "string" && context.id.length > 0) ||
          (typeof context.id === "number" && Number.isFinite(context.id)),
      );
      if (identifiedContexts.length === 0) {
        diagnostics.push({
          status: "fallback",
          ...location,
          templateItemId,
          contextCount: contexts.length,
          message: contexts.length === 0
            ? "The provider returned no collection items."
            : "The provider returned no items with a normalized identifier.",
        });
        renderItems.push(item);
        continue;
      }

      const template = staticGridTemplate(item);
      const unavailableAcfPaths = Object.values(item.dynamicBindings ?? {})
        .map((binding) => binding?.path)
        .filter((path): path is string => typeof path === "string" && path.startsWith("acf.") && !identifiedContexts.some((context) => context.fields[path]));
      renderItems.push(
        ...identifiedContexts.map((context) => ({
          ...resolveDynamicItem(template, context, item.dynamicBindings),
          id: dynamicGridRenderItemId(templateItemId, context.id),
        })),
      );
      changed = true;
      blockMaterialized = true;
      diagnostics.push({
        status: "materialized",
        ...location,
        templateItemId,
        contextCount: identifiedContexts.length,
        ...(identifiedContexts.length !== contexts.length
          ? { message: `${contexts.length - identifiedContexts.length} context item(s) without an identifier were skipped.` }
          : unavailableAcfPaths.length > 0
            ? { message: `ACF value unavailable from the WordPress GraphQL Post projection: ${Array.from(new Set(unavailableAcfPaths)).join(", ")}. Static fallbacks were retained.` }
            : {}),
      });
    } catch (error) {
      diagnostics.push({
        status: "fallback",
        ...location,
        templateItemId,
        message: safeErrorMessage(error),
      });
      renderItems.push(item);
    }
  }

  if (blockMaterialized) materializedGridBlocks.push(location);
  return changed ? { ...block, gridItems: renderItems } : block;
}

async function materializeCarouselCollectionBlock(
  block: BuilderLayoutBlock,
  location: BlockLocation,
  website: SaaSWebsite | null | undefined,
  resolveContexts: DynamicContentContextResolver,
  diagnostics: DynamicContentMaterializationDiagnostic[],
  inheritedContext?: DynamicItemContext,
): Promise<BuilderLayoutBlock> {
  if (!(block.kind === "panelSlider" || block.kind === "slideshow" || block.kind === "overlaySlider" || block.kind === "slider") || !block.slides?.length) return block;

  let changed = false;
  const renderSlides: PanelSliderSlide[] = [];

  for (const slide of block.slides) {
    const descriptor = resolveInheritedDescriptor(slide.dynamicContext, inheritedContext);
    if (!descriptor) {
      if (inheritedContext && slide.dynamicBindings) {
        renderSlides.push(resolveDynamicItem(staticPanelSliderTemplate(slide), inheritedContext, slide.dynamicBindings));
        changed = true;
      } else renderSlides.push(slide);
      continue;
    }
    if (descriptor.mode !== "collection" && descriptor.mode !== "single") {
      diagnostics.push({
        status: "fallback",
        ...location,
        templateItemId: slide.id,
        message: `Unsupported ${block.kind} Dynamic Content mode: ${descriptor.mode}.`,
      });
      renderSlides.push(slide);
      continue;
    }

    const templateItemId = slide.id?.trim();
    if (!templateItemId) {
      diagnostics.push({
        status: "fallback",
        ...location,
        message: `A dynamic ${block.kind} template requires a stable authored slide ID.`,
      });
      renderSlides.push(slide);
      continue;
    }

    try {
      const contexts = await resolveContexts({
        website,
        descriptor: withRequestedBindingFields(descriptor, slide.dynamicBindings),
      });
      const identifiedContexts = contexts.filter(
        (context): context is DynamicItemContext & { id: string | number } =>
          (typeof context.id === "string" && context.id.length > 0) ||
          (typeof context.id === "number" && Number.isFinite(context.id)),
      ).slice(0, descriptor.mode === "single" ? 1 : undefined);
      if (identifiedContexts.length === 0) {
        diagnostics.push({
          status: "fallback",
          ...location,
          templateItemId,
          contextCount: contexts.length,
          message: contexts.length === 0
            ? `The provider returned no ${descriptor.mode} item.`
            : "The provider returned no items with a normalized identifier.",
        });
        renderSlides.push(slide);
        continue;
      }

      const template = staticPanelSliderTemplate(slide);
      const unavailableAcfPaths = Object.values(slide.dynamicBindings ?? {})
        .map((binding) => binding?.path)
        .filter((path): path is string => typeof path === "string" && path.startsWith("acf.") && !identifiedContexts.some((context) => context.fields[path]));
      renderSlides.push(
        ...identifiedContexts.map((context) => ({
          ...resolveDynamicItem(template, context, slide.dynamicBindings),
          id: descriptor.mode === "single"
            ? templateItemId
            : dynamicPanelSliderRenderItemId(templateItemId, context.id),
        })),
      );
      changed = true;
      diagnostics.push({
        status: "materialized",
        ...location,
        templateItemId,
        contextCount: identifiedContexts.length,
        ...(identifiedContexts.length !== contexts.length
          ? { message: `${contexts.length - identifiedContexts.length} context item(s) without an identifier were skipped.` }
          : unavailableAcfPaths.length > 0
            ? { message: `ACF value unavailable from the WordPress GraphQL content projection: ${Array.from(new Set(unavailableAcfPaths)).join(", ")}. Static fallbacks were retained.` }
            : {}),
      });
    } catch (error) {
      diagnostics.push({
        status: "fallback",
        ...location,
        templateItemId,
        message: safeErrorMessage(error),
      });
      renderSlides.push(slide);
    }
  }

  return changed ? { ...block, slides: renderSlides } : block;
}

async function materializeBlocks(
  blocks: BuilderLayoutBlock[],
  sectionId: string,
  columnKey: string,
  website: SaaSWebsite | null | undefined,
  resolveContexts: DynamicContentContextResolver,
  diagnostics: DynamicContentMaterializationDiagnostic[],
  materializedGridBlocks: MaterializedGridBlock[],
  inheritedContext?: DynamicItemContext,
) {
  let changed = false;
  const renderBlocks = await Promise.all(blocks.map(async (block, index) => {
    const blockKey = block.id ?? `${columnKey}-block-${index}`;
    const location = { sectionId, columnKey, blockKey };
    const renderBlock = block.kind === "grid"
      ? await materializeGridBlock(
          block,
          location,
          website,
          resolveContexts,
          diagnostics,
          materializedGridBlocks,
          inheritedContext,
        )
      : (block.kind === "panelSlider" || block.kind === "slideshow" || block.kind === "overlaySlider" || block.kind === "slider")
        ? await materializeCarouselCollectionBlock(
            block,
            location,
            website,
            resolveContexts,
            diagnostics,
            inheritedContext,
          )
        : ((block.kind === "list" && Boolean(block.listItems?.length)) ||
          (block.kind === "button" && Boolean(block.buttons?.length)) ||
          (block.kind === "gallery" && Boolean(block.galleryItems?.length)))
          ? await materializeRepeatableElement(
              block,
              location,
              website,
              resolveContexts,
              diagnostics,
              inheritedContext,
            )
          : await materializeElementBlock(
            block,
            location,
            website,
            resolveContexts,
            diagnostics,
            inheritedContext,
          );
    if (renderBlock !== block) changed = true;
    return renderBlock;
  }));
  return changed ? renderBlocks : blocks;
}

async function materializeSectionInstance(
  section: BuilderSection,
  inheritedContext: DynamicItemContext | undefined,
  website: SaaSWebsite | null | undefined,
  resolveContexts: DynamicContentContextResolver,
  diagnostics: DynamicContentMaterializationDiagnostic[],
  materializedGridBlocks: MaterializedGridBlock[],
): Promise<BuilderSection> {
  const sectionContext = inheritedContext;
  if (section.rows !== undefined) {
    let changed = false;
    const rowGroups = await Promise.all(section.rows.map(async (authoredRow) => {
      const projections = await expandStructuralNode(authoredRow, sectionContext, website, resolveContexts);
      return Promise.all(projections.map(async ({ node: row, context: rowContext }) => {
      let rowChanged = false;
      const columnGroups = await Promise.all(row.columns.map(async (authoredColumn) => {
        const columnProjections = await expandStructuralNode(authoredColumn, rowContext, website, resolveContexts);
        if (columnProjections.length !== 1 || columnProjections[0]?.node !== authoredColumn) rowChanged = true;
        return Promise.all(columnProjections.map(async ({ node: column, context: columnContext }) => {
        const elements = await materializeBlocks(
          column.elements,
          section.id,
          column.id,
          website,
          resolveContexts,
          diagnostics,
          materializedGridBlocks,
          columnContext,
        );
        if (elements === column.elements) return column;
        rowChanged = true;
        return { ...column, elements };
        }));
      }));
      const columns = columnGroups.flat();
      if (!rowChanged && columns.length === row.columns.length) return row;
      changed = true;
      return { ...row, columns };
      }));
    }));
    const rows = rowGroups.flat();
    if (rows.length !== section.rows.length) changed = true;
    return changed ? { ...section, rows } as unknown as BuilderSection : section;
  }

  let changed = false;
  const layoutItems = await Promise.all((section.layoutItems ?? []).map(async (column, columnIndex) => {
    const columnKey = column.id ?? `${section.id}-column-${columnIndex}`;
    const columnContext = await resolveInheritedContext(column.dynamicContext, sectionContext, website, resolveContexts);
    const blocks = await materializeBlocks(
      column.blocks ?? [],
      section.id,
      columnKey,
      website,
      resolveContexts,
      diagnostics,
      materializedGridBlocks,
      columnContext,
    );
    let nestedChanged = false;
    const nestedRows = column.nestedLayout
      ? await Promise.all(column.nestedLayout.rows.map(async (row) => {
          const rowContext = await resolveInheritedContext(row.dynamicContext, columnContext, website, resolveContexts);
          let rowChanged = false;
          const columns = await Promise.all(row.columns.map(async (nestedColumn) => {
            const nestedColumnContext = await resolveInheritedContext(nestedColumn.dynamicContext, rowContext, website, resolveContexts);
            const nestedBlocks = await materializeBlocks(
              nestedColumn.blocks,
              section.id,
              nestedColumn.id,
              website,
              resolveContexts,
              diagnostics,
              materializedGridBlocks,
              nestedColumnContext,
            );
            if (nestedBlocks === nestedColumn.blocks) return nestedColumn;
            rowChanged = true;
            return { ...nestedColumn, blocks: nestedBlocks };
          }));
          if (!rowChanged) return row;
          nestedChanged = true;
          return { ...row, columns };
        }))
      : undefined;
    if (blocks === column.blocks && !nestedChanged) return column;
    changed = true;
    return {
      ...column,
      blocks,
      ...(column.nestedLayout && nestedRows
        ? { nestedLayout: { ...column.nestedLayout, rows: nestedRows } }
        : {}),
    };
  }));
  return changed ? { ...section, layoutItems } as unknown as BuilderSection : section;
}

async function materializeSection(
  section: BuilderSection,
  inheritedContext: DynamicItemContext | undefined,
  website: SaaSWebsite | null | undefined,
  resolveContexts: DynamicContentContextResolver,
  diagnostics: DynamicContentMaterializationDiagnostic[],
  materializedGridBlocks: MaterializedGridBlock[],
): Promise<BuilderSection[]> {
  const projections = await expandStructuralNode(section, inheritedContext, website, resolveContexts);
  return Promise.all(projections.map(({ node, context }) => materializeSectionInstance(
    node,
    context,
    website,
    resolveContexts,
    diagnostics,
    materializedGridBlocks,
  )));
}

/**
 * Materialize Dynamic Content into a transient render projection. The authored
 * layout is read-only input and is never mutated or returned as persistence data.
 */
export async function materializeBuilderDynamicContent(
  authoredLayout: BuilderLayout,
  options: {
    website?: SaaSWebsite | null;
    resolveContexts?: DynamicContentContextResolver;
    rootContext?: DynamicItemContext;
  } = {},
): Promise<BuilderDynamicContentMaterialization> {
  const diagnostics: DynamicContentMaterializationDiagnostic[] = [];
  const materializedGridBlocks: MaterializedGridBlock[] = [];
  const providerResolveContexts = options.resolveContexts ?? resolveDynamicContentContexts;
  const contextResolutionCache = new Map<string, Promise<DynamicItemContext[]>>();
  const resolveContexts: DynamicContentContextResolver = (input) => {
    const key = descriptorCacheKey(input.descriptor);
    const cached = contextResolutionCache.get(key);
    if (cached) return cached;
    const pending = Promise.resolve().then(() => providerResolveContexts(input));
    contextResolutionCache.set(key, pending);
    return pending;
  };
  let changed = false;
  const sectionGroups = await Promise.all(authoredLayout.sections.map(async (section) => {
    const renderSections = await materializeSection(
      section,
      options.rootContext,
      options.website,
      resolveContexts,
      diagnostics,
      materializedGridBlocks,
    );
    if (renderSections.length !== 1 || renderSections[0] !== section) changed = true;
    return renderSections;
  }));
  const sections = sectionGroups.flat();

  return {
    renderLayout: changed ? { ...authoredLayout, sections } : authoredLayout,
    diagnostics,
    materializedGridBlocks,
  };
}
