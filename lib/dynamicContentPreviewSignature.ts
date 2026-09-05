import type { BuilderSection } from "@/components/dashboard/builderTypes";

type DynamicRecord = Record<string, unknown>;

const records = (value: unknown): DynamicRecord[] =>
  Array.isArray(value)
    ? value.filter((entry): entry is DynamicRecord => Boolean(entry) && typeof entry === "object")
    : [];

/** Only Dynamic Content metadata participates in the render-preview refresh key. */
export function dynamicContentPreviewSignature(sections: BuilderSection[]) {
  const metadata: Array<Record<string, unknown>> = [];
  const visitBlocks = (blocks: unknown[], owner: string) => {
    records(blocks).forEach((block) => {
      const gridItems = records(block.gridItems);
      const slides = records(block.slides);
      const listItems = records(block.listItems);
      const buttons = records(block.buttons);
      const galleryItems = records(block.galleryItems);
      if (block.dynamicContext || block.dynamicBindings) {
        metadata.push({ owner, kind: block.kind, id: block.id, dynamicContext: block.dynamicContext, dynamicBindings: block.dynamicBindings });
      }
      // Products render from a transient materialized collection. Any authored
      // Products setting invalidates the render projection, even when the
      // canonical descriptor itself is unchanged.
      if (block.kind === "products") {
        metadata.push({ owner, kind: block.kind, id: block.id, productBlock: block });
      }
      gridItems.forEach((item) => {
        if (item.dynamicContext || item.dynamicBindings) {
          metadata.push({ owner, kind: "grid", id: item.id, dynamicContext: item.dynamicContext, dynamicBindings: item.dynamicBindings });
        }
      });
      slides.forEach((slide) => {
        if (slide.dynamicContext || slide.dynamicBindings) {
          metadata.push({ owner, kind: "panel-slider", id: slide.id, dynamicContext: slide.dynamicContext, dynamicBindings: slide.dynamicBindings });
        }
      });
      listItems.forEach((item) => {
        if (item.dynamicContext || item.dynamicBindings) {
          metadata.push({ owner, kind: "list-item", id: item.id, dynamicContext: item.dynamicContext, dynamicBindings: item.dynamicBindings });
        }
      });
      buttons.forEach((item) => {
        if (item.dynamicContext || item.dynamicBindings) {
          metadata.push({ owner, kind: "button-item", id: item.id, dynamicContext: item.dynamicContext, dynamicBindings: item.dynamicBindings });
        }
      });
      galleryItems.forEach((item) => {
        if (item.dynamicContext || item.dynamicBindings) {
          metadata.push({ owner, kind: "gallery-item", id: item.id, dynamicContext: item.dynamicContext, dynamicBindings: item.dynamicBindings });
        }
      });
      const sublayout = block.sublayout as { rows?: Array<{ id?: string; dynamicContext?: unknown; columns: Array<{ id?: string; dynamicContext?: unknown; elements: unknown[] }> }> } | undefined;
      sublayout?.rows?.forEach(row => {
        metadata.push({ owner, id: row.id, dynamicContext: row.dynamicContext });
        row.columns.forEach(column => {
          metadata.push({ owner, id: column.id, dynamicContext: column.dynamicContext });
          visitBlocks(column.elements, column.id ?? owner);
        });
      });
      const nestedLayout = block.nestedLayout as { rows?: Array<{ columns?: Array<{ blocks?: unknown[]; id?: string }> }> } | undefined;
      nestedLayout?.rows?.forEach((row) => row.columns?.forEach((column) => visitBlocks(column.blocks ?? [], column.id ?? owner)));
    });
  };

  sections.forEach((section) => {
    section.rows?.forEach((row) => row.columns.forEach((column) => visitBlocks(column.elements, column.id)));
    section.layoutItems?.forEach((column) => visitBlocks(column.blocks ?? [], column.id ?? section.id));
  });
  return JSON.stringify(metadata);
}
