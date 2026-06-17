import type { CSSProperties } from "react";

export type BuilderButtonHoverEffect = "none" | "lift" | "grow" | "inherit";
export type BuilderButtonPresetKey =
  | "solid"
  | "soft"
  | "outline"
  | "sharp"
  | "luxury";

export type BuilderButtonStyleFields = {
  buttonBg?: string;
  buttonTextColor?: string;
  buttonBorderRadius?: string;
  buttonBorderWidth?: string;
  buttonBorderColor?: string;
  buttonPaddingY?: string;
  buttonPaddingX?: string;
  buttonFontWeight?: string;
  buttonLetterSpacing?: string;
  buttonHoverBg?: string;
  buttonHoverTextColor?: string;
  buttonHoverBorderColor?: string;
  buttonHoverEffect?: BuilderButtonHoverEffect | string;
};

export type BuilderButtonPreset = {
  key: BuilderButtonPresetKey;
  label: string;
  description: string;
  fields: Required<Omit<BuilderButtonStyleFields, "buttonHoverEffect">> & {
    buttonHoverEffect: Exclude<BuilderButtonHoverEffect, "inherit">;
  };
};

export const BUILDER_BUTTON_PRESETS: BuilderButtonPreset[] = [
  {
    key: "solid",
    label: "Solid",
    description: "Clean filled button",
    fields: {
      buttonBg: "var(--builder-preview-section-button-bg, var(--builder-section-button-bg, var(--builder-button-bg, #111111)))",
      buttonTextColor: "var(--builder-preview-section-button-text, var(--builder-section-button-text, var(--builder-button-text, #ffffff)))",
      buttonBorderRadius: "999px",
      buttonBorderWidth: "0px",
      buttonBorderColor: "transparent",
      buttonPaddingY: "11px",
      buttonPaddingX: "18px",
      buttonFontWeight: "720",
      buttonLetterSpacing: "0px",
      buttonHoverBg: "var(--builder-preview-section-button-bg, var(--builder-section-button-bg, var(--builder-button-bg, #111111)))",
      buttonHoverTextColor: "var(--builder-preview-section-button-text, var(--builder-section-button-text, var(--builder-button-text, #ffffff)))",
      buttonHoverBorderColor: "transparent",
      buttonHoverEffect: "lift",
    },
  },
  {
    key: "soft",
    label: "Soft",
    description: "Quiet filled surface",
    fields: {
      buttonBg: "color-mix(in srgb, var(--builder-preview-section-button-bg, var(--builder-section-button-bg, var(--builder-button-bg, #111111))) 10%, var(--builder-preview-section-surface, var(--builder-section-surface, var(--builder-surface, #efefe9))))",
      buttonTextColor: "var(--builder-preview-section-button-bg, var(--builder-section-button-bg, var(--builder-button-bg, #111111)))",
      buttonBorderRadius: "14px",
      buttonBorderWidth: "1px",
      buttonBorderColor: "color-mix(in srgb, var(--builder-preview-section-button-bg, var(--builder-section-button-bg, var(--builder-button-bg, #111111))) 22%, transparent)",
      buttonPaddingY: "10px",
      buttonPaddingX: "16px",
      buttonFontWeight: "650",
      buttonLetterSpacing: "0px",
      buttonHoverBg: "color-mix(in srgb, var(--builder-preview-section-button-bg, var(--builder-section-button-bg, var(--builder-button-bg, #111111))) 16%, var(--builder-preview-section-surface, var(--builder-section-surface, var(--builder-surface, #efefe9))))",
      buttonHoverTextColor: "var(--builder-preview-section-button-bg, var(--builder-section-button-bg, var(--builder-button-bg, #111111)))",
      buttonHoverBorderColor: "color-mix(in srgb, var(--builder-preview-section-button-bg, var(--builder-section-button-bg, var(--builder-button-bg, #111111))) 28%, transparent)",
      buttonHoverEffect: "lift",
    },
  },
  {
    key: "outline",
    label: "Outline",
    description: "Border-led action",
    fields: {
      buttonBg: "transparent",
      buttonTextColor: "var(--builder-preview-section-button-bg, var(--builder-section-button-bg, var(--builder-button-bg, #111111)))",
      buttonBorderRadius: "999px",
      buttonBorderWidth: "1.5px",
      buttonBorderColor: "var(--builder-preview-section-button-bg, var(--builder-section-button-bg, var(--builder-button-bg, #111111)))",
      buttonPaddingY: "10px",
      buttonPaddingX: "18px",
      buttonFontWeight: "700",
      buttonLetterSpacing: "0px",
      buttonHoverBg: "var(--builder-preview-section-button-bg, var(--builder-section-button-bg, var(--builder-button-bg, #111111)))",
      buttonHoverTextColor: "var(--builder-preview-section-button-text, var(--builder-section-button-text, var(--builder-button-text, #ffffff)))",
      buttonHoverBorderColor: "var(--builder-preview-section-button-bg, var(--builder-section-button-bg, var(--builder-button-bg, #111111)))",
      buttonHoverEffect: "lift",
    },
  },
  {
    key: "sharp",
    label: "Sharp",
    description: "Modern squared CTA",
    fields: {
      buttonBg: "var(--builder-preview-section-button-bg, var(--builder-section-button-bg, var(--builder-button-bg, #111111)))",
      buttonTextColor: "var(--builder-preview-section-button-text, var(--builder-section-button-text, var(--builder-button-text, #ffffff)))",
      buttonBorderRadius: "6px",
      buttonBorderWidth: "0px",
      buttonBorderColor: "transparent",
      buttonPaddingY: "12px",
      buttonPaddingX: "18px",
      buttonFontWeight: "760",
      buttonLetterSpacing: "0px",
      buttonHoverBg: "var(--builder-preview-section-button-bg, var(--builder-section-button-bg, var(--builder-button-bg, #111111)))",
      buttonHoverTextColor: "var(--builder-preview-section-button-text, var(--builder-section-button-text, var(--builder-button-text, #ffffff)))",
      buttonHoverBorderColor: "transparent",
      buttonHoverEffect: "none",
    },
  },
  {
    key: "luxury",
    label: "Luxury",
    description: "Dark with accent glow",
    fields: {
      buttonBg: "#1f2937",
      buttonTextColor: "#f8fafc",
      buttonBorderRadius: "12px",
      buttonBorderWidth: "1px",
      buttonBorderColor: "#334155",
      buttonPaddingY: "12px",
      buttonPaddingX: "20px",
      buttonFontWeight: "720",
      buttonLetterSpacing: "0.02em",
      buttonHoverBg: "#d8ff65",
      buttonHoverTextColor: "#111111",
      buttonHoverBorderColor: "#d8ff65",
      buttonHoverEffect: "lift",
    },
  },
];

export const BUILDER_BUTTON_FIELD_KEYS = [
  "buttonBg",
  "buttonTextColor",
  "buttonBorderRadius",
  "buttonBorderWidth",
  "buttonBorderColor",
  "buttonPaddingY",
  "buttonPaddingX",
  "buttonFontWeight",
  "buttonLetterSpacing",
  "buttonHoverBg",
  "buttonHoverTextColor",
  "buttonHoverBorderColor",
  "buttonHoverEffect",
] as const;

export function getBuilderButtonPreset(
  key: BuilderButtonPresetKey | string | undefined,
) {
  return BUILDER_BUTTON_PRESETS.find((preset) => preset.key === key);
}

export function buttonColorInputValue(value: unknown, fallback: string) {
  const raw = typeof value === "string" ? value.trim() : "";
  return /^#[0-9a-f]{6}$/i.test(raw) ? raw : fallback;
}

export function hasLocalButtonStyles(values: BuilderButtonStyleFields) {
  return BUILDER_BUTTON_FIELD_KEYS.some((key) => {
    const value = values[key];
    return value !== undefined && value !== null && String(value).trim() !== "";
  });
}

export function getBuilderButtonPresetKey(
  values: BuilderButtonStyleFields,
): BuilderButtonPresetKey | "custom" {
  const normalized = normalizeButtonStyleFields(values);
  const match = BUILDER_BUTTON_PRESETS.find((preset) =>
    BUILDER_BUTTON_FIELD_KEYS.every((key) => {
      const presetValue = preset.fields[key];
      const value = normalized[key];
      return String(value ?? "") === String(presetValue ?? "");
    }),
  );
  return match?.key ?? "custom";
}

export function clearBuilderButtonOverrides(): BuilderButtonStyleFields {
  return Object.fromEntries(
    BUILDER_BUTTON_FIELD_KEYS.map((key) => [key, undefined]),
  ) as BuilderButtonStyleFields;
}

export function builderButtonPresetFields(
  key: BuilderButtonPresetKey,
): BuilderButtonPreset["fields"] {
  return { ...getBuilderButtonPreset(key)!.fields };
}

export function normalizeButtonStyleFields(
  values: BuilderButtonStyleFields,
  fallback: BuilderButtonStyleFields = {},
): BuilderButtonStyleFields {
  return {
    buttonBg: values.buttonBg || fallback.buttonBg || "#111111",
    buttonTextColor:
      values.buttonTextColor || fallback.buttonTextColor || "#ffffff",
    buttonBorderRadius:
      values.buttonBorderRadius || fallback.buttonBorderRadius || "999px",
    buttonBorderWidth:
      values.buttonBorderWidth || fallback.buttonBorderWidth || "0px",
    buttonBorderColor:
      values.buttonBorderColor || fallback.buttonBorderColor || "transparent",
    buttonPaddingY: values.buttonPaddingY || fallback.buttonPaddingY || "11px",
    buttonPaddingX: values.buttonPaddingX || fallback.buttonPaddingX || "18px",
    buttonFontWeight:
      values.buttonFontWeight || fallback.buttonFontWeight || "720",
    buttonLetterSpacing:
      values.buttonLetterSpacing || fallback.buttonLetterSpacing || "0px",
    buttonHoverBg: values.buttonHoverBg || fallback.buttonHoverBg || values.buttonBg || fallback.buttonBg || "#111111",
    buttonHoverTextColor:
      values.buttonHoverTextColor ||
      fallback.buttonHoverTextColor ||
      values.buttonTextColor ||
      fallback.buttonTextColor ||
      "#ffffff",
    buttonHoverBorderColor:
      values.buttonHoverBorderColor ||
      fallback.buttonHoverBorderColor ||
      values.buttonBorderColor ||
      fallback.buttonBorderColor ||
      "transparent",
    buttonHoverEffect:
      values.buttonHoverEffect || fallback.buttonHoverEffect || "lift",
  };
}

export function builderButtonCssVars(
  values: BuilderButtonStyleFields,
  fallback: BuilderButtonStyleFields = {},
): CSSProperties {
  const normalized = normalizeButtonStyleFields(values, fallback);
  const hoverEffect =
    normalized.buttonHoverEffect === "inherit"
      ? fallback.buttonHoverEffect || "lift"
      : normalized.buttonHoverEffect || "lift";
  return {
    "--button-bg": normalized.buttonBg,
    "--button-text-color": normalized.buttonTextColor,
    "--button-radius": normalized.buttonBorderRadius,
    "--button-border-width": normalized.buttonBorderWidth,
    "--button-border-color": normalized.buttonBorderColor,
    "--button-padding-y": normalized.buttonPaddingY,
    "--button-padding-x": normalized.buttonPaddingX,
    "--button-font-weight": normalized.buttonFontWeight,
    "--button-letter-spacing": normalized.buttonLetterSpacing,
    "--button-hover-bg": normalized.buttonHoverBg,
    "--button-hover-text-color": normalized.buttonHoverTextColor,
    "--button-hover-border-color": normalized.buttonHoverBorderColor,
    "--button-hover-transform":
      hoverEffect === "lift"
        ? "translateY(-2px)"
        : hoverEffect === "grow"
          ? "scale(1.04)"
          : "none",
    "--button-hover-shadow":
      hoverEffect === "lift" ? "0 16px 34px rgba(17, 17, 17, 0.16)" : "none",
  } as CSSProperties;
}

export function builderButtonOverrideCssVars(
  values: BuilderButtonStyleFields,
): CSSProperties {
  const vars: Record<string, string> = {};
  if (values.buttonBg) vars["--button-bg"] = values.buttonBg;
  if (values.buttonTextColor) vars["--button-text-color"] = values.buttonTextColor;
  if (values.buttonBorderRadius) vars["--button-radius"] = values.buttonBorderRadius;
  if (values.buttonBorderWidth) vars["--button-border-width"] = values.buttonBorderWidth;
  if (values.buttonBorderColor) vars["--button-border-color"] = values.buttonBorderColor;
  if (values.buttonPaddingY) vars["--button-padding-y"] = values.buttonPaddingY;
  if (values.buttonPaddingX) vars["--button-padding-x"] = values.buttonPaddingX;
  if (values.buttonFontWeight) vars["--button-font-weight"] = values.buttonFontWeight;
  if (values.buttonLetterSpacing) {
    vars["--button-letter-spacing"] = values.buttonLetterSpacing;
  }
  if (values.buttonHoverBg) vars["--button-hover-bg"] = values.buttonHoverBg;
  if (values.buttonHoverTextColor) {
    vars["--button-hover-text-color"] = values.buttonHoverTextColor;
  }
  if (values.buttonHoverBorderColor) {
    vars["--button-hover-border-color"] = values.buttonHoverBorderColor;
  }
  if (values.buttonHoverEffect && values.buttonHoverEffect !== "inherit") {
    vars["--button-hover-transform"] =
      values.buttonHoverEffect === "lift"
        ? "translateY(-2px)"
        : values.buttonHoverEffect === "grow"
          ? "scale(1.04)"
          : "none";
    vars["--button-hover-shadow"] =
      values.buttonHoverEffect === "lift"
        ? "0 16px 34px rgba(17, 17, 17, 0.16)"
        : "none";
  }
  return vars as CSSProperties;
}
