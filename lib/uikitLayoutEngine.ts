/**
 * WebPages UIkit Canonical Layout Engine
 *
 * Canonical implementation defining UIkit row grid layouts, column responsive width
 * classes, and layout normalization matching YOOtheme-style grid architecture.
 *
 * Principles:
 * 1. Section -> Layout Items (Rows) -> Columns -> Elements document model.
 * 2. UIkit is the sole canonical layout engine for Rows and Columns.
 * 3. Both DashboardBuilder (canvas preview) and StorefrontBuilderRenderer consume this module.
 */

export type UikitLayoutPresetKey =
  | "1-col"
  | "2-col-equal"
  | "3-col-equal"
  | "4-col-equal"
  | "5-col-equal"
  | "6-col-equal"
  | "thirds-2-1"
  | "thirds-1-2"
  | "quarters-3-1"
  | "quarters-1-3"
  | "quarters-2-1-1"
  | "quarters-1-1-2"
  | "quarters-1-2-1"
  | "fifths-2-3"
  | "fifths-3-2"
  | "fifths-1-4"
  | "fifths-4-1"
  | "fifths-3-1-1"
  | "fifths-1-1-3"
  | "fifths-1-3-1"
  | "fifths-2-1-1-1"
  | "fifths-1-1-1-2"
  | "sixths-1-5"
  | "sixths-5-1"
  | "fixed-left"
  | "fixed-right"
  | "fixed-inner"
  | "fixed-outer"
  | "auto-expand";

export type UikitLayoutPreset = {
  key: UikitLayoutPresetKey;
  label: string;
  description: string;
  columnCount: number;
  columnClasses: string[];
};

export const UIKIT_LAYOUT_PRESETS: Record<UikitLayoutPresetKey, UikitLayoutPreset> = {
  "1-col": {
    key: "1-col",
    label: "Whole",
    description: "1 column",
    columnCount: 1,
    columnClasses: ["uk-width-1-1"],
  },
  "2-col-equal": {
    key: "2-col-equal",
    label: "Halves",
    description: "1-1",
    columnCount: 2,
    columnClasses: ["uk-width-1-2@m", "uk-width-1-2@m"],
  },
  "3-col-equal": {
    key: "3-col-equal",
    label: "Thirds",
    description: "1-1-1",
    columnCount: 3,
    columnClasses: ["uk-width-1-3@m", "uk-width-1-3@m", "uk-width-1-3@m"],
  },
  "4-col-equal": {
    key: "4-col-equal",
    label: "Quarters",
    description: "1-1-1-1",
    columnCount: 4,
    columnClasses: [
      "uk-width-1-4@m",
      "uk-width-1-4@m",
      "uk-width-1-4@m",
      "uk-width-1-4@m",
    ],
  },
  "5-col-equal": {
    key: "5-col-equal",
    label: "Fifths",
    description: "1-1-1-1-1",
    columnCount: 5,
    columnClasses: [
      "uk-width-1-5@m",
      "uk-width-1-5@m",
      "uk-width-1-5@m",
      "uk-width-1-5@m",
      "uk-width-1-5@m",
    ],
  },
  "6-col-equal": {
    key: "6-col-equal",
    label: "Sixths",
    description: "1-1-1-1-1-1",
    columnCount: 6,
    columnClasses: [
      "uk-width-1-6@m",
      "uk-width-1-6@m",
      "uk-width-1-6@m",
      "uk-width-1-6@m",
      "uk-width-1-6@m",
      "uk-width-1-6@m",
    ],
  },
  "thirds-2-1": {
    key: "thirds-2-1",
    label: "Thirds 2-1",
    description: "2-1",
    columnCount: 2,
    columnClasses: ["uk-width-2-3@m", "uk-width-1-3@m"],
  },
  "thirds-1-2": {
    key: "thirds-1-2",
    label: "Thirds 1-2",
    description: "1-2",
    columnCount: 2,
    columnClasses: ["uk-width-1-3@m", "uk-width-2-3@m"],
  },
  "quarters-3-1": {
    key: "quarters-3-1",
    label: "Quarters 3-1",
    description: "3-1",
    columnCount: 2,
    columnClasses: ["uk-width-3-4@m", "uk-width-1-4@m"],
  },
  "quarters-1-3": {
    key: "quarters-1-3",
    label: "Quarters 1-3",
    description: "1-3",
    columnCount: 2,
    columnClasses: ["uk-width-1-4@m", "uk-width-3-4@m"],
  },
  "quarters-2-1-1": {
    key: "quarters-2-1-1",
    label: "Quarters 2-1-1",
    description: "2-1-1",
    columnCount: 3,
    columnClasses: ["uk-width-1-2@m", "uk-width-1-4@m", "uk-width-1-4@m"],
  },
  "quarters-1-1-2": {
    key: "quarters-1-1-2",
    label: "Quarters 1-1-2",
    description: "1-1-2",
    columnCount: 3,
    columnClasses: ["uk-width-1-4@m", "uk-width-1-4@m", "uk-width-1-2@m"],
  },
  "quarters-1-2-1": {
    key: "quarters-1-2-1",
    label: "Quarters 1-2-1",
    description: "1-2-1",
    columnCount: 3,
    columnClasses: ["uk-width-1-4@m", "uk-width-1-2@m", "uk-width-1-4@m"],
  },
  "fifths-2-3": {
    key: "fifths-2-3",
    label: "Fifths 2-3",
    description: "2-3",
    columnCount: 2,
    columnClasses: ["uk-width-2-5@m", "uk-width-3-5@m"],
  },
  "fifths-3-2": {
    key: "fifths-3-2",
    label: "Fifths 3-2",
    description: "3-2",
    columnCount: 2,
    columnClasses: ["uk-width-3-5@m", "uk-width-2-5@m"],
  },
  "fifths-1-4": {
    key: "fifths-1-4",
    label: "Fifths 1-4",
    description: "1-4",
    columnCount: 2,
    columnClasses: ["uk-width-1-5@m", "uk-width-4-5@m"],
  },
  "fifths-4-1": {
    key: "fifths-4-1",
    label: "Fifths 4-1",
    description: "4-1",
    columnCount: 2,
    columnClasses: ["uk-width-4-5@m", "uk-width-1-5@m"],
  },
  "fifths-3-1-1": {
    key: "fifths-3-1-1",
    label: "Fifths 3-1-1",
    description: "3-1-1",
    columnCount: 3,
    columnClasses: ["uk-width-3-5@m", "uk-width-1-5@m", "uk-width-1-5@m"],
  },
  "fifths-1-1-3": {
    key: "fifths-1-1-3",
    label: "Fifths 1-1-3",
    description: "1-1-3",
    columnCount: 3,
    columnClasses: ["uk-width-1-5@m", "uk-width-1-5@m", "uk-width-3-5@m"],
  },
  "fifths-1-3-1": {
    key: "fifths-1-3-1",
    label: "Fifths 1-3-1",
    description: "1-3-1",
    columnCount: 3,
    columnClasses: ["uk-width-1-5@m", "uk-width-3-5@m", "uk-width-1-5@m"],
  },
  "fifths-2-1-1-1": {
    key: "fifths-2-1-1-1",
    label: "Fifths 2-1-1-1",
    description: "2-1-1-1",
    columnCount: 4,
    columnClasses: [
      "uk-width-2-5@m",
      "uk-width-1-5@m",
      "uk-width-1-5@m",
      "uk-width-1-5@m",
    ],
  },
  "fifths-1-1-1-2": {
    key: "fifths-1-1-1-2",
    label: "Fifths 1-1-1-2",
    description: "1-1-1-2",
    columnCount: 4,
    columnClasses: [
      "uk-width-1-5@m",
      "uk-width-1-5@m",
      "uk-width-1-5@m",
      "uk-width-2-5@m",
    ],
  },
  "sixths-1-5": {
    key: "sixths-1-5",
    label: "Sixths 1-5",
    description: "1-5",
    columnCount: 2,
    columnClasses: ["uk-width-1-6@m", "uk-width-5-6@m"],
  },
  "sixths-5-1": {
    key: "sixths-5-1",
    label: "Sixths 5-1",
    description: "5-1",
    columnCount: 2,
    columnClasses: ["uk-width-5-6@m", "uk-width-1-6@m"],
  },
  "fixed-left": {
    key: "fixed-left",
    label: "Fixed-Left",
    description: "Auto content width + expanding fill",
    columnCount: 2,
    columnClasses: ["uk-width-auto", "uk-width-expand"],
  },
  "fixed-right": {
    key: "fixed-right",
    label: "Fixed-Right",
    description: "Expanding fill + Auto content width",
    columnCount: 2,
    columnClasses: ["uk-width-expand", "uk-width-auto"],
  },
  "fixed-inner": {
    key: "fixed-inner",
    label: "Fixed-Inner",
    description: "Expand + Auto + Expand",
    columnCount: 3,
    columnClasses: ["uk-width-expand", "uk-width-auto", "uk-width-expand"],
  },
  "fixed-outer": {
    key: "fixed-outer",
    label: "Fixed-Outer",
    description: "Auto + Expand + Auto",
    columnCount: 3,
    columnClasses: ["uk-width-auto", "uk-width-expand", "uk-width-auto"],
  },
  "auto-expand": {
    key: "auto-expand",
    label: "Auto / Expand",
    description: "Auto content width + expanding fill",
    columnCount: 2,
    columnClasses: ["uk-width-auto", "uk-width-expand"],
  },
};

export const UIKIT_LAYOUT_PRESET_LIST: UikitLayoutPreset[] = Object.values(
  UIKIT_LAYOUT_PRESETS
);

/**
 * Normalizes legacy keys into the nearest canonical UIkit preset.
 */
export function normalizeLayoutToUikitPreset(layoutKey?: string): UikitLayoutPresetKey {
  if (!layoutKey) return "1-col";
  const key = layoutKey.toLowerCase().trim().replace(/\s+/g, "");

  if (key in UIKIT_LAYOUT_PRESETS) return key as UikitLayoutPresetKey;

  // Exact fraction / dash / ratio mappings matching YOOtheme & WebPages canonical presets
  if (key === "whole" || key === "12" || key === "1" || key === "1-1" || key === "1/1") return "1-col";
  if (key === "halves" || key === "6-6" || key === "2-col" || key === "1-2,1-2" || key === "1/2,1/2") return "2-col-equal";
  if (key === "thirds-1-2" || key === "4-8" || key === "1-2" || key === "1-3,2-3" || key === "1/3,2/3") return "thirds-1-2";
  if (key === "thirds-2-1" || key === "8-4" || key === "2-1" || key === "2-3,1-3" || key === "2/3,1/3") return "thirds-2-1";
  if (key === "thirds" || key === "4-4-4" || key === "1-1-1" || key === "3-col" || key === "1-3,1-3,1-3" || key === "1/3,1/3,1/3") return "3-col-equal";
  if (key === "quarters" || key === "3-3-3-3" || key === "1-1-1-1" || key === "4-col" || key === "1-4,1-4,1-4,1-4" || key === "1/4,1/4,1/4,1/4") return "4-col-equal";
  if (key === "quarters-3-1" || key === "9-3" || key === "3-1" || key === "3-4,1-4" || key === "3/4,1/4") return "quarters-3-1";
  if (key === "quarters-1-3" || key === "3-9" || key === "1-3" || key === "1-4,3-4" || key === "1/4,3/4") return "quarters-1-3";
  if (key === "quarters-2-1-1" || key === "6-3-3" || key === "2-1-1" || key === "1-2,1-4,1-4" || key === "1/2,1/4,1/4") return "quarters-2-1-1";
  if (key === "quarters-1-1-2" || key === "3-3-6" || key === "1-1-2" || key === "1-4,1-4,1-2" || key === "1/4,1/4,1/2") return "quarters-1-1-2";
  if (key === "quarters-1-2-1" || key === "3-6-3" || key === "1-2-1" || key === "1-4,1-2,1-4" || key === "1/4,1/2,1/4") return "quarters-1-2-1";
  if (key === "fifths-2-3" || key === "2-5,3-5" || key === "2/5,3/5") return "fifths-2-3";
  if (key === "fifths-3-2" || key === "3-5,2-5" || key === "3/5,2/5") return "fifths-3-2";
  if (key === "fifths-1-4" || key === "1-5,4-5" || key === "1/5,4/5") return "fifths-1-4";
  if (key === "fifths-4-1" || key === "4-5,1-5" || key === "4/5,1/5") return "fifths-4-1";
  if (key === "fifths-3-1-1" || key === "3-5,1-5,1-5" || key === "3/5,1/5,1/5") return "fifths-3-1-1";
  if (key === "fifths-1-1-3" || key === "1-5,1-5,3-5" || key === "1/5,1/5,3/5") return "fifths-1-1-3";
  if (key === "fifths-1-3-1" || key === "1-5,3-5,1-5" || key === "1/5,3/5,1/5") return "fifths-1-3-1";
  if (key === "fifths-2-1-1-1" || key === "2-5,1-5,1-5,1-5" || key === "2/5,1/5,1/5,1/5") return "fifths-2-1-1-1";
  if (key === "fifths-1-1-1-2" || key === "1-5,1-5,1-5,2-5" || key === "1/5,1/5,1/5,2/5") return "fifths-1-1-1-2";
  if (key === "sixths-1-5" || key === "1-6,5-6" || key === "1/6,5/6") return "sixths-1-5";
  if (key === "sixths-5-1" || key === "5-6,1-6" || key === "5/6,1/6") return "sixths-5-1";
  if (key === "fifths" || key === "5-col" || key === "1-5,1-5,1-5,1-5,1-5" || key === "1/5,1/5,1/5,1/5,1/5") return "5-col-equal";
  if (key === "sixths" || key === "6-col" || key === "1-6,1-6,1-6,1-6,1-6,1-6" || key === "1/6,1/6,1/6,1/6,1/6,1/6") return "6-col-equal";
  if (key === "auto" || key === "expand") return "auto-expand";

  return "1-col";
}

/**
 * Returns the canonical UIkit width class for a column at a given index.
 */
export function getUikitColumnWidthClass(
  presetKey: string | undefined,
  columnIndex: number,
  breakpoint: "@s" | "@m" | "@l" | "@xl" = "@m"
): string {
  const normalizedKey = normalizeLayoutToUikitPreset(presetKey);
  const preset = UIKIT_LAYOUT_PRESETS[normalizedKey];
  const classes = preset.columnClasses;
  const baseClass = classes[columnIndex] ?? classes[classes.length - 1] ?? "uk-width-1-1";

  if (breakpoint === "@m") return baseClass;
  return baseClass.replace(/@m$/, breakpoint);
}
