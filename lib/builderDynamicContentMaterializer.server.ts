import type { BuilderLayout, BuilderLayoutBlock, BuilderSection } from "@/lib/builderLayouts";
import {
  resolveDynamicItem,
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

async function materializeGridBlock(
  block: BuilderLayoutBlock,
  location: BlockLocation,
  website: SaaSWebsite | null | undefined,
  resolveContexts: DynamicContentContextResolver,
  diagnostics: DynamicContentMaterializationDiagnostic[],
  materializedGridBlocks: MaterializedGridBlock[],
): Promise<BuilderLayoutBlock> {
  if (block.kind !== "grid" || !block.gridItems?.length) return block;

  let changed = false;
  let blockMaterialized = false;
  const renderItems: GridItem[] = [];

  for (const item of block.gridItems) {
    const descriptor = item.dynamicContext;
    if (!descriptor) {
      renderItems.push(item);
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
      const contexts = await resolveContexts({ website, descriptor });
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

async function materializePanelSliderBlock(
  block: BuilderLayoutBlock,
  location: BlockLocation,
  website: SaaSWebsite | null | undefined,
  resolveContexts: DynamicContentContextResolver,
  diagnostics: DynamicContentMaterializationDiagnostic[],
): Promise<BuilderLayoutBlock> {
  if (block.kind !== "panelSlider" || !block.slides?.length) return block;

  let changed = false;
  const renderSlides: PanelSliderSlide[] = [];

  for (const slide of block.slides) {
    const descriptor = slide.dynamicContext;
    if (!descriptor) {
      renderSlides.push(slide);
      continue;
    }
    if (descriptor.mode !== "collection") {
      diagnostics.push({
        status: "fallback",
        ...location,
        templateItemId: slide.id,
        message: `Unsupported Panel Slider Dynamic Content mode: ${descriptor.mode}.`,
      });
      renderSlides.push(slide);
      continue;
    }

    const templateItemId = slide.id?.trim();
    if (!templateItemId) {
      diagnostics.push({
        status: "fallback",
        ...location,
        message: "A collection Panel Slider template requires a stable authored slide ID.",
      });
      renderSlides.push(slide);
      continue;
    }

    try {
      const contexts = await resolveContexts({ website, descriptor });
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
        renderSlides.push(slide);
        continue;
      }

      const template = staticPanelSliderTemplate(slide);
      renderSlides.push(
        ...identifiedContexts.map((context) => ({
          ...resolveDynamicItem(template, context, slide.dynamicBindings),
          id: dynamicPanelSliderRenderItemId(templateItemId, context.id),
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
        )
      : block.kind === "panelSlider"
        ? await materializePanelSliderBlock(
            block,
            location,
            website,
            resolveContexts,
            diagnostics,
          )
        : block;
    if (renderBlock !== block) changed = true;
    return renderBlock;
  }));
  return changed ? renderBlocks : blocks;
}

async function materializeSection(
  section: BuilderSection,
  website: SaaSWebsite | null | undefined,
  resolveContexts: DynamicContentContextResolver,
  diagnostics: DynamicContentMaterializationDiagnostic[],
  materializedGridBlocks: MaterializedGridBlock[],
): Promise<BuilderSection> {
  if (section.rows !== undefined) {
    let changed = false;
    const rows = await Promise.all(section.rows.map(async (row) => {
      let rowChanged = false;
      const columns = await Promise.all(row.columns.map(async (column) => {
        const elements = await materializeBlocks(
          column.elements,
          section.id,
          column.id,
          website,
          resolveContexts,
          diagnostics,
          materializedGridBlocks,
        );
        if (elements === column.elements) return column;
        rowChanged = true;
        return { ...column, elements };
      }));
      if (!rowChanged) return row;
      changed = true;
      return { ...row, columns };
    }));
    return changed ? { ...section, rows } : section;
  }

  let changed = false;
  const layoutItems = await Promise.all((section.layoutItems ?? []).map(async (column, columnIndex) => {
    const columnKey = column.id ?? `${section.id}-column-${columnIndex}`;
    const blocks = await materializeBlocks(
      column.blocks ?? [],
      section.id,
      columnKey,
      website,
      resolveContexts,
      diagnostics,
      materializedGridBlocks,
    );
    let nestedChanged = false;
    const nestedRows = column.nestedLayout
      ? await Promise.all(column.nestedLayout.rows.map(async (row) => {
          let rowChanged = false;
          const columns = await Promise.all(row.columns.map(async (nestedColumn) => {
            const nestedBlocks = await materializeBlocks(
              nestedColumn.blocks,
              section.id,
              nestedColumn.id,
              website,
              resolveContexts,
              diagnostics,
              materializedGridBlocks,
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
  return changed ? { ...section, layoutItems } : section;
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
  } = {},
): Promise<BuilderDynamicContentMaterialization> {
  const diagnostics: DynamicContentMaterializationDiagnostic[] = [];
  const materializedGridBlocks: MaterializedGridBlock[] = [];
  const resolveContexts = options.resolveContexts ?? resolveDynamicContentContexts;
  let changed = false;
  const sections = await Promise.all(authoredLayout.sections.map(async (section) => {
    const renderSection = await materializeSection(
      section,
      options.website,
      resolveContexts,
      diagnostics,
      materializedGridBlocks,
    );
    if (renderSection !== section) changed = true;
    return renderSection;
  }));

  return {
    renderLayout: changed ? { ...authoredLayout, sections } : authoredLayout,
    diagnostics,
    materializedGridBlocks,
  };
}
