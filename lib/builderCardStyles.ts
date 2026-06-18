import type {
  BuilderCardPreset,
  BuilderHoverPreset,
} from "@/lib/builderVisualStyle";

export type BuilderCardPresetOption = {
  label: string;
  value: BuilderCardPreset;
  description: string;
  legacyPanelStyle?:
    | "default"
    | "princity"
    | "princity-flat"
    | "princity-line"
    | "secondary"
    | "dark"
    | "light"
    | "clean-shadow"
    | "flat-dark"
    | "flat-white"
    | "antigravity";
  productPreset?:
    | "standard"
    | "graph"
    | "gallery"
    | "editorial"
    | "compact"
    | "minimal"
    | "luxury"
    | "princity"
    | "princity-flat"
    | "princity-line";
  productCardStyle?: "flat" | "soft" | "lined" | "none";
};

export const BUILDER_CARD_PRESETS: BuilderCardPresetOption[] = [
  {
    label: "None / Flat",
    value: "none",
    description: "No added surface treatment.",
    legacyPanelStyle: "flat-white",
    productPreset: "minimal",
    productCardStyle: "none",
  },
  {
    label: "Soft Card",
    value: "soft",
    description: "Subtle filled card with a quiet border.",
    legacyPanelStyle: "secondary",
    productPreset: "standard",
    productCardStyle: "soft",
  },
  {
    label: "Elevated",
    value: "elevated",
    description: "Clean white card with a stronger shadow.",
    legacyPanelStyle: "clean-shadow",
    productPreset: "standard",
    productCardStyle: "soft",
  },
  {
    label: "Glass",
    value: "glass",
    description: "Translucent panel with blur and a light border.",
    legacyPanelStyle: "light",
    productPreset: "gallery",
    productCardStyle: "soft",
  },
  {
    label: "Outline",
    value: "outline",
    description: "Transparent surface with a clear outline.",
    legacyPanelStyle: "princity-line",
    productPreset: "princity-line",
    productCardStyle: "lined",
  },
  {
    label: "Gradient",
    value: "gradient",
    description: "Soft gradient surface for feature cards.",
    legacyPanelStyle: "princity",
    productPreset: "luxury",
    productCardStyle: "soft",
  },
  {
    label: "Dark Panel",
    value: "dark",
    description: "Dark surface with readable light content.",
    legacyPanelStyle: "dark",
    productPreset: "standard",
    productCardStyle: "soft",
  },
  {
    label: "Image Overlay Card",
    value: "image-overlay",
    description: "Image-first card with content over the media.",
    legacyPanelStyle: "flat-dark",
    productPreset: "gallery",
    productCardStyle: "none",
  },
];

export const BUILDER_HOVER_PRESETS: {
  label: string;
  value: BuilderHoverPreset;
  description: string;
}[] = [
  { label: "None", value: "none", description: "No hover motion." },
  { label: "Lift Soft", value: "lift-soft", description: "Small upward lift." },
  { label: "Lift Strong", value: "lift-strong", description: "More visible lift and shadow." },
  { label: "Image Zoom", value: "image-zoom", description: "Keep card stable and zoom media." },
  { label: "Glow Subtle", value: "glow-subtle", description: "Soft accent glow." },
  { label: "Press Down", value: "press-down", description: "Tactile pressed state." },
  { label: "Shadow Grow", value: "shadow-grow", description: "Shadow grows without moving." },
];

export function getBuilderCardPreset(value?: string) {
  return BUILDER_CARD_PRESETS.find((preset) => preset.value === value);
}
