import type { BuilderLayoutBlock } from "@/components/dashboard/builderTypes";
import type { BuilderLayout } from "@/lib/builderLayouts";

/** A menu-owned fragment, using exactly the page builder's canonical nodes. */
export type MenuDropdownContent = BuilderLayoutBlock & {
  id: string;
  kind: "sublayout";
  sublayout: NonNullable<BuilderLayoutBlock["sublayout"]>;
};

export function emptyMenuDropdown(): MenuDropdownContent {
  return { id: crypto.randomUUID(), kind: "sublayout", sublayout: { rows: [] } };
}

export function normalizeMenuDropdown(value: unknown): MenuDropdownContent | undefined {
  if (!value || typeof value !== "object") return undefined;
  const block = value as MenuDropdownContent;
  if (block.kind !== "sublayout" || typeof block.id !== "string" || !Array.isArray(block.sublayout?.rows)) return undefined;
  if (!block.sublayout.rows.every(row => row && typeof row.id === "string" && Array.isArray(row.columns) && row.columns.every(column => column && typeof column.id === "string" && Array.isArray(column.elements) && column.elements.every(element => element && typeof element === "object" && typeof element.kind === "string")))) return undefined;
  return structuredClone(block);
}

export function exportMenuDropdown(content: MenuDropdownContent) {
  return { format: "webpages.menu-dropdown", version: 1, content: structuredClone(content) };
}

/** Transient adapter to the existing page resolver; never persisted as a page. */
export function menuDropdownRenderLayout(contents: MenuDropdownContent[]): BuilderLayout {
  return { version: 1, page: "header", updatedAt: "", sections: contents.map(content => ({
    id: content.id, kind: "contentLayout", title: "Dropdown", visible: true, background: "default",
    rows: [{ id: `${content.id}-row`, layout: "1-col", columns: [{ id: `${content.id}-column`, elements: [content] }] }],
  })) };
}
