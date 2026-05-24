export type BuilderRowLayoutPreset = {
  key: string;
  label: string;
  description: string;
  ratios: number[];
};

export const builderRowLayoutPresets: BuilderRowLayoutPreset[] = [
  {
    key: "whole",
    label: "Whole",
    description: "1 column",
    ratios: [1],
  },
  {
    key: "halves",
    label: "Halves",
    description: "1-1",
    ratios: [1, 1],
  },
  {
    key: "thirds",
    label: "Thirds",
    description: "1-1-1",
    ratios: [1, 1, 1],
  },
  {
    key: "quarters",
    label: "Quarters",
    description: "1-1-1-1",
    ratios: [1, 1, 1, 1],
  },
  {
    key: "fifths",
    label: "Fifths",
    description: "1-1-1-1-1",
    ratios: [1, 1, 1, 1, 1],
  },
  {
    key: "sixths",
    label: "Sixths",
    description: "1-1-1-1-1-1",
    ratios: [1, 1, 1, 1, 1, 1],
  },
  {
    key: "thirds-2-1",
    label: "Thirds",
    description: "2-1",
    ratios: [2, 1],
  },
  {
    key: "thirds-1-2",
    label: "Thirds",
    description: "1-2",
    ratios: [1, 2],
  },
  {
    key: "quarters-3-1",
    label: "Quarters",
    description: "3-1",
    ratios: [3, 1],
  },
  {
    key: "quarters-1-3",
    label: "Quarters",
    description: "1-3",
    ratios: [1, 3],
  },
  {
    key: "quarters-2-1-1",
    label: "Quarters",
    description: "2-1-1",
    ratios: [2, 1, 1],
  },
  {
    key: "quarters-1-1-2",
    label: "Quarters",
    description: "1-1-2",
    ratios: [1, 1, 2],
  },
  {
    key: "quarters-1-2-1",
    label: "Quarters",
    description: "1-2-1",
    ratios: [1, 2, 1],
  },
  {
    key: "fifths-2-3",
    label: "Fifths",
    description: "2-3",
    ratios: [2, 3],
  },
  {
    key: "fifths-3-2",
    label: "Fifths",
    description: "3-2",
    ratios: [3, 2],
  },
  {
    key: "fifths-1-4",
    label: "Fifths",
    description: "1-4",
    ratios: [1, 4],
  },
  {
    key: "fifths-4-1",
    label: "Fifths",
    description: "4-1",
    ratios: [4, 1],
  },
  {
    key: "fifths-3-1-1",
    label: "Fifths",
    description: "3-1-1",
    ratios: [3, 1, 1],
  },
  {
    key: "fifths-1-1-3",
    label: "Fifths",
    description: "1-1-3",
    ratios: [1, 1, 3],
  },
  {
    key: "fifths-1-3-1",
    label: "Fifths",
    description: "1-3-1",
    ratios: [1, 3, 1],
  },
  {
    key: "fifths-2-1-1-1",
    label: "Fifths",
    description: "2-1-1-1",
    ratios: [2, 1, 1, 1],
  },
  {
    key: "fifths-1-1-1-2",
    label: "Fifths",
    description: "1-1-1-2",
    ratios: [1, 1, 1, 2],
  },
  {
    key: "sixths-1-5",
    label: "Sixths",
    description: "1-5",
    ratios: [1, 5],
  },
  {
    key: "sixths-5-1",
    label: "Sixths",
    description: "5-1",
    ratios: [5, 1],
  },
];

export function getBuilderRowLayoutPreset(key: string | null | undefined) {
  return builderRowLayoutPresets.find((preset) => preset.key === key) ?? null;
}

export function getBuilderRowLayoutPreviewTemplate(
  key: string | null | undefined,
) {
  const preset = getBuilderRowLayoutPreset(key);
  if (!preset) return null;
  return preset.ratios.map((ratio) => `${ratio}fr`).join(" ");
}

export function getBuilderRowLayoutSummary(
  key: string | null | undefined,
  fallbackColumns?: number | null,
) {
  const preset = getBuilderRowLayoutPreset(key);
  if (preset) return `${preset.label} ${preset.description}`;
  if (typeof fallbackColumns === "number" && fallbackColumns > 0) {
    return `${fallbackColumns} columns`;
  }
  return "Choose a row layout";
}
