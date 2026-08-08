import type { BuilderShellSettings } from "@/lib/builderShell";

export type GlobalStyleTokenSource = "global" | "design" | "default";

export type GlobalStyleTokenResolution = {
  value: string;
  source: GlobalStyleTokenSource;
};

/**
 * Canonical appearance-token defaults for the WebPages UIkit foundation.
 * Component renderers may choose semantic defaults, but they must resolve
 * appearance through this table and the generated UIkit variables.
 */
export const GLOBAL_STYLE_TOKEN_DEFAULTS = {
  primaryColor: "#111111",
  accentColor: "#111111",
  secondaryColor: "#64748b",
  mutedColor: "#f1f5f9",
  successColor: "#16a34a",
  warningColor: "#d97706",
  dangerColor: "#dc2626",
  textColor: "#111827",
  backgroundDefault: "#ffffff",
  backgroundMuted: "#f8fafc",
  backgroundPrimary: "#111111",
  backgroundSecondary: "#64748b",
  backgroundColor: "#ffffff",
  mutedTextColor: "#6b7280",
  emphasisColor: "#111827",
  linkColor: "#111111",
  linkHoverColor: "#111111",
  mutedBackgroundColor: "#f8fafc",
  fontFamilyBody: "system-ui, -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif",
  fontFamilyHeading: "inherit",
  fontFamilyPrimary: "inherit",
  fontWeightPrimary: "700",
  fontFamilySecondary: "inherit",
  fontWeightSecondary: "400",
  fontFamilyTertiary: "inherit",
  fontWeightTertiary: "400",
  baseFontSize: "16px",
  baseLineHeight: "1.5",
  headingFontWeight: "700",
  headingSmallFontSize: "30px",
  headingMediumFontSize: "34px",
  headingLargeFontSize: "38px",
  headingXLargeFontSize: "44px",
  smallTextFontSize: "14px",
  largeTextFontSize: "24px",
  marginSmall: "15px",
  marginDefault: "30px",
  marginMedium: "40px",
  marginLarge: "70px",
  marginXLarge: "140px",
  gridGutterSmall: "15px",
  gridGutterDefault: "30px",
  gridGutterMedium: "30px",
  gridGutterLarge: "40px",
  containerSmall: "900px",
  containerDefault: "1200px",
  containerLarge: "1400px",
  containerXLarge: "1600px",
  pageContainerMaxWidth: "1600px",
  borderWidth: "1px",
  borderColor: "#e5e7eb",
  borderRadius: "8px",
  shadowSmall: "0 2px 8px rgba(0, 0, 0, 0.06)",
  shadowMedium: "0 8px 24px rgba(0, 0, 0, 0.08)",
  shadowLarge: "0 16px 40px rgba(0, 0, 0, 0.12)",
  shadowXLarge: "0 24px 56px rgba(0, 0, 0, 0.14)",
  cardBackground: "#ffffff",
  cardPrimaryBackground: "#1991ee",
  cardSecondaryBackground: "#0c273a",
  cardBorderRadius: "8px",
  cardBorderWidth: "1px",
  cardBorderColor: "#e5e7eb",
  cardShadow: "0 8px 24px rgba(0, 0, 0, 0.08)",
  cardShadowHover: "0 12px 30px rgba(0, 0, 0, 0.12)",
  cardPaddingSmall: "15px",
  cardPaddingDefault: "30px",
  cardPaddingLarge: "40px",
  imageDefaultRatio: "natural",
  imageDefaultFit: "cover",
  imageDefaultLoading: "lazy",
  imageDefaultBorder: "none",
  imageDefaultShadow: "none",
  imageDefaultAlignment: "center",
  sliderArrowStyle: "chevron",
  sliderArrowPosition: "overlay",
  sliderDotnavStyle: "minimal-dots",
  sliderDotnavPosition: "bottom",
  buttonPrimaryBackground: "#111111",
  buttonPrimaryText: "#ffffff",
  buttonDefaultBackground: "#ffffff",
  buttonDefaultText: "#111111",
  buttonSecondaryBackground: "#e5e7eb",
  buttonSecondaryText: "#111111",
  buttonHeight: "44px",
  controlHeightSmall: "40px",
  controlHeightLarge: "56px",
  buttonRadius: "8px",
  buttonBorderWidth: "0px",
  buttonFontSize: "15px",
  buttonLineHeight: "48px",
  buttonFontFamily: "inherit",
  buttonFontStyle: "normal",
  buttonFontWeight: "600",
  buttonTextTransform: "uppercase",
  buttonLetterSpacing: "0px",
  buttonTransitionDuration: "0.2s",
} as const satisfies Record<string, string>;

const DESIGN_ALIASES: Record<string, string[]> = {
  primaryColor: ["primary_color", "primary"],
  accentColor: ["accent_color", "accent"],
  textColor: ["text_color", "text"],
  backgroundColor: ["pageBackground", "page_background", "background"],
  mutedTextColor: ["muted_text_color", "mutedText"],
  mutedBackgroundColor: ["muted_background", "mutedBackground"],
  cardBackground: ["cardBackground", "card_background"],
  cardPrimaryBackground: ["cardPrimaryBackground", "card_primary_background"],
  cardSecondaryBackground: ["cardSecondaryBackground", "card_secondary_background"],
  fontFamilyBody: ["fontFamilyBody", "font_family_body"],
  fontFamilyHeading: ["fontFamilyHeading", "font_family_heading"],
};

function present(value: unknown): value is string | number {
  return value !== undefined && value !== null && String(value).trim() !== "";
}

export function resolveGlobalStyleToken(
  key: string,
  shellSettings?: Partial<BuilderShellSettings>,
  design?: Record<string, unknown>,
  fallback?: string,
): GlobalStyleTokenResolution {
  const shellValue = shellSettings?.[key as keyof BuilderShellSettings];
  if (present(shellValue)) return { value: String(shellValue), source: "global" };

  const aliases = DESIGN_ALIASES[key] ?? [];
  for (const alias of [key, ...aliases]) {
    const designValue = design?.[alias];
    if (present(designValue)) return { value: String(designValue), source: "design" };
  }

  const defaultValue = GLOBAL_STYLE_TOKEN_DEFAULTS[key as keyof typeof GLOBAL_STYLE_TOKEN_DEFAULTS];
  return { value: defaultValue ?? fallback ?? "", source: "default" };
}

export function resolveAppearanceValue<T>(options: {
  global?: T;
  componentDefault: T;
  local?: T;
}): { value: T; source: "global" | "component-default" | "local" } {
  if (options.local !== undefined) return { value: options.local, source: "local" };
  if (options.global !== undefined) return { value: options.global, source: "global" };
  return { value: options.componentDefault, source: "component-default" };
}

export const GLOBAL_STYLE_GROUPS = [
  { id: "appearance", label: "Appearance", items: ["Colors", "Typography", "Links", "Buttons", "Panels", "Forms", "Icons"] },
  { id: "layout", label: "Layout", items: ["Containers", "Sections", "Grid", "Spacing"] },
  { id: "media", label: "Media", items: ["Images", "Video", "Slider navigation"] },
  { id: "effects", label: "Effects", items: ["Radius", "Borders", "Shadows", "Transitions"] },
] as const;
