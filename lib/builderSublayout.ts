import type { BuilderRow } from "@/components/dashboard/builderTypes";
import { builderRowLayoutPresets } from "@/components/dashboard/builderLayoutPresets";

const id = () => crypto.randomUUID();
export function createSublayoutRow(): BuilderRow {
  return { id: id(), layout: "1-col", spacingContract: "yootheme", columns: [{ id: id(), elements: [] }] };
}

/** Changing widths must never throw away authored content. */
export function applySublayoutPreset(row: BuilderRow, key: string): BuilderRow {
  const preset = builderRowLayoutPresets.find(preset => preset.key === key);
  if (!preset) return row;
  const columns = preset.ratios.map((_, index) => ({ ...(row.columns[index] ?? { id: id(), elements: [] }), responsiveWidths: undefined }));
  const overflow = row.columns.slice(columns.length).flatMap(column => column.elements);
  if (overflow.length) columns[columns.length - 1] = { ...columns[columns.length - 1], elements: [...columns[columns.length - 1].elements, ...overflow] };
  return { ...row, layout: key, customLayout: undefined, columns };
}

/** Remap every descendant identity, including repeatable item and nested row IDs. */
export function duplicateSublayoutNode<T>(node: T): T {
  const copy = structuredClone(node);
  const ids = new Map<string, string>();
  const collect = (value: unknown) => {
    if (!value || typeof value !== "object") return;
    if ("id" in value && typeof value.id === "string") ids.set(value.id, id());
    Object.entries(value).forEach(([key, entry]) => { if (key !== "dynamicContext" && key !== "dynamicBindings") collect(entry); });
  };
  const replace = (value: unknown) => {
    if (!value || typeof value !== "object") return;
    for (const [key, entry] of Object.entries(value)) {
      if (key === "dynamicContext" || key === "dynamicBindings") continue;
      if ((key === "id" || key === "columnId" || key === "rowId") && typeof entry === "string" && ids.has(entry)) (value as Record<string, unknown>)[key] = ids.get(entry);
      else replace(entry);
    }
  };
  collect(copy); replace(copy); return copy;
}
