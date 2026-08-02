import {
  UIKIT_LAYOUT_PRESETS,
  UIKIT_LAYOUT_PRESET_LIST,
  normalizeLayoutToUikitPreset,
  getUikitColumnWidthClass,
  type UikitLayoutPresetKey,
  type UikitLayoutPreset,
} from "@/lib/uikitLayoutEngine";

export type BuilderRowLayoutPreset = {
  key: string;
  label: string;
  description: string;
  ratios: number[];
};

export const builderRowLayoutPresets: BuilderRowLayoutPreset[] = UIKIT_LAYOUT_PRESET_LIST.map(
  (preset) => ({
    key: preset.key,
    label: preset.label,
    description: preset.description,
    ratios: preset.columnClasses.map(() => 1),
  })
);

export function getBuilderRowLayoutPreset(key: string | null | undefined) {
  const normalizedKey = normalizeLayoutToUikitPreset(key || undefined);
  const uikitPreset = UIKIT_LAYOUT_PRESETS[normalizedKey];
  return {
    key: uikitPreset.key,
    label: uikitPreset.label,
    description: uikitPreset.description,
    ratios: uikitPreset.columnClasses.map(() => 1),
  };
}

export function getBuilderRowLayoutPreviewTemplate(
  key: string | null | undefined,
) {
  const preset = getBuilderRowLayoutPreset(key);
  if (!preset) return null;
  return preset.ratios.map(() => "1fr").join(" ");
}

export function getBuilderRowLayoutSummary(
  key: string | null | undefined,
  fallbackColumns?: number | null,
) {
  const preset = getBuilderRowLayoutPreset(key);
  if (preset) return `${preset.label} (${preset.description})`;
  if (typeof fallbackColumns === "number" && fallbackColumns > 0) {
    return `${fallbackColumns} columns`;
  }
  return "Choose a row layout";
}

export type LayoutItem = {
  id?: string;
  rowId?: string;
  rowLayout?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  blocks?: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
};

export type BuilderLayoutRow = {
  id: string;
  items: LayoutItem[];
  layoutKey?: string;
  startIndex: number;
};

export function getBuilderLayoutRows(
  section: { layout?: string; layoutColumns?: number },
  items: LayoutItem[],
): BuilderLayoutRow[] {
  if (items.length === 0) return [];

  const rows: BuilderLayoutRow[] = [];
  const normalizedKey = normalizeLayoutToUikitPreset(section.layout);
  const uikitPreset = UIKIT_LAYOUT_PRESETS[normalizedKey];
  const fallbackColumns = Math.max(uikitPreset.columnCount, 1);
  let index = 0;

  while (index < items.length) {
    const item = items[index];
    if (!item) break;
    const rowId = item.rowId;
    const rowLayout = item.rowLayout ?? section.layout;

    if (rowId) {
      const rowItems: LayoutItem[] = [];
      const startIndex = index;
      while (index < items.length && items[index]?.rowId === rowId) {
        rowItems.push(items[index]!);
        index += 1;
      }
      rows.push({
        id: rowId,
        items: rowItems,
        layoutKey: rowLayout,
        startIndex,
      });
      continue;
    }

    const startIndex = index;
    const rowItems = items.slice(index, index + fallbackColumns);
    rows.push({
      id: `legacy-row-${startIndex}`,
      items: rowItems,
      layoutKey: rowLayout,
      startIndex,
    });
    index += rowItems.length;
  }

  return rows;
}
