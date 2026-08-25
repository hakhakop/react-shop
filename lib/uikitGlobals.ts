/**
 * WebPages UIkit Globals Engine
 *
 * Canonical generator mapping WebPages Global Theme Settings directly to
 * root UIkit CSS custom properties and variables.
 */

import type { BuilderShellSettings } from "@/lib/builderShell";
import { resolveGlobalStyleToken } from "@/lib/globalStyleTokens";
import { fontFamilyStack } from "@/lib/webFonts";
import { resolveBackgroundPaint } from "@/lib/backgroundPaint";

function yoothemeButtonTextArrow(color: string) {
  const svg = `<svg width="20" height="11" viewBox="0 0 20 11" xmlns="http://www.w3.org/2000/svg"><polyline fill="none" stroke="${color}" stroke-width="1.2" points="13 1 18 5.5 13 10"/><line fill="none" stroke="${color}" stroke-width="1.2" x1="0" y1="5.5" x2="18.4" y2="5.5"/></svg>`;
  return `url("data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}")`;
}

export type UikitGlobalsConfig = {
  // Spacing Scale
  marginSmall?: string;
  marginDefault?: string;
  marginLarge?: string;
  marginXLarge?: string;
  sectionPaddingXSmall?: string;
  sectionPaddingSmall?: string;
  sectionPaddingDefault?: string;
  sectionPaddingLarge?: string;
  sectionPaddingXLarge?: string;

  // Container Max Widths
  containerSmall?: string;
  containerDefault?: string;
  containerLarge?: string;
  containerXLarge?: string;

  // Grid Gutters
  gridGutterSmall?: string;
  gridGutterMedium?: string;
  gridGutterLarge?: string;

  // Typography
  fontFamilyBody?: string;
  fontFamilyHeading?: string;

  // Surfaces & Colors
  primaryColor?: string;
  accentColor?: string;
  cardDefaultBg?: string;
  cardPrimaryBg?: string;
  cardSecondaryBg?: string;
  cardMutedBg?: string;

  // Radii & Controls
  globalRadius?: string;
  cardRadius?: string;
  buttonRadius?: string;

  // Box Shadows
  shadowSmall?: string;
  shadowMedium?: string;
  shadowLarge?: string;
};

/**
 * Returns canonical CSS variable declarations for UIkit root configuration.
 */
export function getUikitGlobalsCssVars(
  shellSettings?: Partial<BuilderShellSettings>,
  design?: Record<string, any>
): Record<string, string> {
  // `backgroundPrimary` is the canonical UIkit/YOOtheme primary surface.
  // `primaryColor` remains a legacy native alias, but must not replace an
  // imported YOOtheme `@global-primary-background`.
  const legacyPrimary = resolveGlobalStyleToken("primaryColor", shellSettings, design, "#111111").value;
  const primary = resolveGlobalStyleToken("backgroundPrimary", shellSettings, design, legacyPrimary).value;
  const accent = resolveGlobalStyleToken("accentColor", shellSettings, design, "#111111").value;
  const value = (key: string, fallback: string) =>
    resolveGlobalStyleToken(key, shellSettings, design, fallback).value;
  const buttonValue = (key: string, fallback: string) => {
    const provenance = shellSettings?.buttonTokenInheritance?.[key];
    const raw = shellSettings?.[key as keyof BuilderShellSettings];
    if (provenance !== "inherit" && raw !== undefined && raw !== null && String(raw).trim() !== "") {
      // Migration for imports saved before token provenance existed. Only
      // discard the old generic WebPages default on a recognized YOOtheme
      // style; a non-default authored value remains an explicit override.
      const legacyYoothemeImport = !provenance && /^devstack\b/i.test(String(shellSettings?.globalStylePresetName ?? ""));
      const genericDefault = resolveGlobalStyleToken(key, undefined, undefined, fallback).value;
      if (!legacyYoothemeImport || String(raw) !== genericDefault) return String(raw);
    }
    return fallback;
  };
  const globalRadius = value("borderRadius", design?.radius || "8px");
  const cardRadius = value("cardBorderRadius", shellSettings?.productCardRadius || globalRadius);
  // Small and large controls inherit the main YOOtheme button radius unless
  // the theme explicitly declares separate values. This prevents a previous
  // theme's legacy 2px values from surviving a live switch back to DevStack.
  const buttonRadius = value("buttonRadius", cardRadius);
  const buttonSmallRadius = shellSettings?.buttonSmallRadius || buttonRadius;
  const buttonLargeRadius = shellSettings?.buttonLargeRadius || buttonRadius;
  const inheritedFamily = (family: string, fallback: string) => family.trim().toLowerCase() === "inherit" ? fallback : family;
  const bodyFamily = value("fontFamilyBody", "system-ui");
  const headingFamily = inheritedFamily(value("fontFamilyHeading", "inherit"), bodyFamily);
  const primaryFamily = inheritedFamily(value("fontFamilyPrimary", "inherit"), headingFamily);
  const secondaryFamily = inheritedFamily(value("fontFamilySecondary", "inherit"), bodyFamily);
  const tertiaryFamily = inheritedFamily(value("fontFamilyTertiary", "inherit"), bodyFamily);
  const buttonBorderWidth = value("buttonBorderWidth", value("borderWidth", "1px"));
  const controlLineHeight = (height: string, fallback: string) => {
    const heightMatch = /^(-?(?:\d+\.?\d*|\.\d+))px$/.exec(height.trim());
    const borderMatch = /^(-?(?:\d+\.?\d*|\.\d+))px$/.exec(buttonBorderWidth.trim());
    if (!heightMatch || !borderMatch) return fallback;
    return `${Math.max(0, Number(heightMatch[1]) - Number(borderMatch[1]) * 2)}px`;
  };
  const buttonControlHeight = value("controlHeightDefault", value("buttonHeight", "48px"));
  const buttonLargeControlHeight = value("controlHeightLarge", "56px");
  const backgroundDefault = resolveBackgroundPaint(value("backgroundDefault", value("backgroundColor", "#ffffff")), "#ffffff");
  const backgroundMuted = resolveBackgroundPaint(value("backgroundMuted", value("mutedBackgroundColor", "#f8fafc")), "#f8fafc");
  const backgroundPrimary = resolveBackgroundPaint(value("backgroundPrimary", primary), primary);
  const backgroundSecondary = resolveBackgroundPaint(value("backgroundSecondary", value("secondaryColor", "#64748b")), "#64748b");
  const backgroundDefaultImage = resolveBackgroundPaint(shellSettings?.backgroundDefaultImage, "none");
  const backgroundMutedImage = resolveBackgroundPaint(shellSettings?.backgroundMutedImage, "none");
  const backgroundPrimaryImage = resolveBackgroundPaint(shellSettings?.backgroundPrimaryImage, "none");
  const backgroundSecondaryImage = resolveBackgroundPaint(shellSettings?.backgroundSecondaryImage, "none");
  // These are tenant/theme-owned tokens. Missing or null values stay absent;
  // a YOOtheme paint must never become a global fallback for other tenants.
  const explicitSectionGradient = (key: "backgroundDefaultGradient" | "backgroundPrimaryGradient") =>
    resolveBackgroundPaint(shellSettings?.[key] ?? design?.[key], "none");
  const backgroundDefaultGradient = resolveBackgroundPaint(
    explicitSectionGradient("backgroundDefaultGradient"),
    "none",
  );
  const backgroundPrimaryGradient = resolveBackgroundPaint(
    explicitSectionGradient("backgroundPrimaryGradient"),
    "none",
  );
  const sectionDefaultBackgroundImage = backgroundDefaultImage === "none"
    ? (backgroundDefaultGradient === "none" ? "none" : `var(--uikit-section-default-gradient, ${backgroundDefaultGradient})`)
    : backgroundDefaultImage;
  const sectionPrimaryBackgroundImage = backgroundPrimaryImage === "none"
    ? (backgroundPrimaryGradient === "none" ? "none" : `var(--uikit-section-primary-gradient, ${backgroundPrimaryGradient})`)
    : backgroundPrimaryImage;
  const globalText = value("textColor", "#111827");
  const globalEmphasis = value("emphasisColor", globalText);
  const globalInverse = value("inverseColor", "#fff");
  const globalLink = value("linkColor", primary);
  const globalBorder = value("borderColor", "transparent");
  const cardDefaultBackground = resolveBackgroundPaint(value("cardBackground", "#ffffff"), "#ffffff");
  const cardPrimaryBackground = resolveBackgroundPaint(value("cardPrimaryBackground", primary), primary);
  const cardSecondaryBackground = resolveBackgroundPaint(value("cardSecondaryBackground", "#111827"), "#111827");
  const cardDefaultHoverBackground = resolveBackgroundPaint(value("cardDefaultHoverBackground", cardDefaultBackground), cardDefaultBackground);
  const cardPrimaryHoverBackground = resolveBackgroundPaint(value("cardPrimaryHoverBackground", cardPrimaryBackground), cardPrimaryBackground);
  const cardSecondaryHoverBackground = resolveBackgroundPaint(value("cardSecondaryHoverBackground", cardSecondaryBackground), cardSecondaryBackground);
  // Alert presentation is its own UIkit semantic surface. An imported
  // @alert-background must not be collapsed into a generic Builder/card
  // background; when it is absent, UIkit's normal muted/default surface
  // remains the canonical fallback.
  const alertBackground = resolveBackgroundPaint(value("alertBackground", "#f8f8f8"), "#f8f8f8");
  const alertPrimaryBackground = resolveBackgroundPaint(value("alertPrimaryBackground", "#d8eafc"), "#d8eafc");
  const alertSuccessBackground = resolveBackgroundPaint(value("alertSuccessBackground", "#edfbf6"), "#edfbf6");
  const alertWarningBackground = resolveBackgroundPaint(value("alertWarningBackground", "#fef5ee"), "#fef5ee");
  const alertDangerBackground = resolveBackgroundPaint(value("alertDangerBackground", "#fef4f6"), "#fef4f6");

  const vars: Record<string, string> = {
    // Spacing scale
    "--uk-global-margin-small": value("marginSmall", "15px"),
    "--uk-global-margin": value("marginDefault", "30px"),
    "--uk-global-margin-medium": value("marginMedium", "40px"),
    "--uk-global-margin-large": value("marginLarge", "70px"),
    "--uk-global-margin-xlarge": value("marginXLarge", "140px"),

    // Section paddings
    "--uk-section-padding-xsmall": value("sectionPaddingXSmall", "20px"),
    "--uk-section-padding-small": value("sectionPaddingSmall", "40px"),
    "--uk-section-padding-default": value("sectionPaddingDefault", "70px"),
    "--uk-section-padding-medium": value("sectionPaddingMedium", "80px"),
    "--uk-section-padding-large": value("sectionPaddingLarge", "140px"),
    "--uk-section-padding-xlarge": value("sectionPaddingXLarge", "140px"),

    // Container max-widths
    "--uk-container-small-max-width": value("containerSmall", "900px"),
    "--uk-container-xsmall-max-width": value("containerXSmall", "750px"),
    "--uk-container-default-max-width": value("containerDefault", "1200px"),
    "--uk-container-large-max-width": value("containerLarge", "1400px"),
    "--uk-container-xlarge-max-width": value("containerXLarge", "1600px"),
    "--uk-container-expand-max-width": value("containerExpand", "none"),
    "--uk-container-padding-horizontal": value("containerPaddingHorizontal", "15px"),
    "--uk-container-padding-horizontal-s": value("containerPaddingHorizontalSmall", "30px"),
    "--uk-container-padding-horizontal-m": value("containerPaddingHorizontalMedium", "40px"),
    "--uk-page-container-max-width": value("pageContainerMaxWidth", value("containerXLarge", "1600px")),

    // Grid gutters
    "--uk-grid-gutter-small": value("gridGutterSmall", "15px"),
    "--uk-grid-gutter-medium": value("gridGutterMedium", value("gridGutterDefault", "30px")),
    "--uk-grid-gutter-large": value("gridGutterLarge", "40px"),
    // UIkit component spacing aliases used by Card/Panel tokens. These stay
    // tenant-provided rather than baking one theme's numeric gutters into
    // shared component CSS.
    "--uk-global-gutter": value("gridGutterDefault", "30px"),
    "--uk-global-medium-gutter": value("gridGutterMedium", value("gridGutterDefault", "30px")),
    "--uk-global-large-gutter": value("gridGutterLarge", "40px"),

    // Colors & Surfaces
    "--uk-global-primary-color": primary,
    "--uk-global-accent-color": accent,
    "--uk-global-secondary-color": value("secondaryColor", "#64748b"),
    "--uk-global-muted-color": value("mutedColor", "#f1f5f9"),
    "--uk-global-success-color": value("successColor", "#16a34a"),
    "--uk-global-warning-color": value("warningColor", "#d97706"),
    "--uk-global-danger-color": value("dangerColor", "#dc2626"),
    "--uk-global-text-color": value("textColor", "#111827"),
    "--uk-global-muted-text-color": value("mutedTextColor", "#6b7280"),
    "--uk-global-background-color": backgroundDefault,
    // Canonical YOOtheme section background roles. The legacy field names stay
    // readable for existing saved documents, but sections resolve these roles.
    "--webpages-background-default": backgroundDefault,
    "--webpages-background-muted": backgroundMuted,
    "--webpages-background-primary": backgroundPrimary,
    "--webpages-background-secondary": backgroundSecondary,
    "--uikit-section-default-bg": backgroundDefault,
    "--uikit-section-muted-bg": backgroundMuted,
    "--uikit-section-primary-bg": backgroundPrimary,
    "--uikit-section-secondary-bg": backgroundSecondary,
    "--webpages-background-default-image": backgroundDefaultImage,
    "--webpages-background-muted-image": backgroundMutedImage,
    "--webpages-background-primary-image": backgroundPrimaryImage,
    "--webpages-background-secondary-image": backgroundSecondaryImage,
    "--uikit-section-default-bg-image": sectionDefaultBackgroundImage,
    "--uikit-section-muted-bg-image": backgroundMutedImage,
    "--uikit-section-primary-bg-image": sectionPrimaryBackgroundImage,
    "--uikit-section-default-gradient": backgroundDefaultGradient,
    "--uikit-section-primary-gradient": backgroundPrimaryGradient,
    "--uk-text-background-gradient": value("textBackgroundGradient", backgroundPrimaryGradient),
    "--uikit-section-secondary-bg-image": backgroundSecondaryImage,
    "--uk-global-font-family": fontFamilyStack(bodyFamily, "system-ui, sans-serif"),
    "--uk-heading-font-family": fontFamilyStack(headingFamily, "system-ui, sans-serif"),
    "--webpages-font-primary": fontFamilyStack(primaryFamily, "system-ui, sans-serif"),
    "--webpages-font-primary-weight": value("fontWeightPrimary", value("headingFontWeight", "700")),
    "--webpages-font-primary-style": value("fontStylePrimary", "inherit"),
    "--webpages-font-primary-letter-spacing": value("letterSpacingPrimary", "inherit"),
    "--webpages-font-primary-text-transform": value("textTransformPrimary", "inherit"),
    "--webpages-font-secondary": fontFamilyStack(secondaryFamily, "system-ui, sans-serif"),
    "--webpages-font-secondary-weight": value("fontWeightSecondary", "400"),
    "--webpages-font-secondary-style": value("fontStyleSecondary", "inherit"),
    "--webpages-font-secondary-letter-spacing": value("letterSpacingSecondary", "inherit"),
    "--webpages-font-secondary-text-transform": value("textTransformSecondary", "inherit"),
    "--webpages-font-tertiary": fontFamilyStack(tertiaryFamily, "system-ui, sans-serif"),
    "--webpages-font-tertiary-weight": value("fontWeightTertiary", "400"),
    "--webpages-font-tertiary-style": value("fontStyleTertiary", "inherit"),
    "--webpages-font-tertiary-letter-spacing": value("letterSpacingTertiary", "inherit"),
    "--webpages-font-tertiary-text-transform": value("textTransformTertiary", "inherit"),
    "--uk-base-font-size": value("baseFontSize", "16px"),
    "--uk-base-line-height": value("baseLineHeight", "1.5"),
    "--uk-heading-font-weight": value("headingFontWeight", "700"),
    "--uk-heading-h3-font-size": value("headingH3FontSize", "22px"),
    // YOOtheme's h1 preset is a distinct semantic heading contract.
    "--uk-heading-h1-font-size": value("headingH1FontSize", "42px"),
    "--uk-heading-h1-font-weight": value("headingH1FontWeight", "700"),
    "--uk-heading-small-font-size": value("headingSmallFontSize", "30px"),
    "--uk-heading-medium-font-size": value("headingMediumFontSize", "46.2px"),
    "--uk-heading-large-font-size": value("headingLargeFontSize", "38px"),
    "--uk-heading-xlarge-font-size": value("headingXLargeFontSize", "44px"),
    "--uk-heading-small-font-size-responsive": value("headingSmallFontSizeResponsive", "52px"),
    "--uk-heading-medium-font-size-responsive": value("headingMediumFontSizeResponsive", "62px"),
    "--uk-heading-medium-line-height": value("headingMediumLineHeight", "1.2"),
    "--uk-heading-small-font-weight": value("headingSmallFontWeight", "700"),
    "--uk-heading-medium-font-weight": value("headingMediumFontWeight", "700"),
    "--uk-text-small-font-size": value("smallTextFontSize", "14px"),
    "--uk-text-large-font-size": value("largeTextFontSize", "24px"),
    "--uk-global-font-size-small": value("fontSizeSmall", value("smallTextFontSize", "14px")),
    "--uk-global-font-size-medium": value("fontSizeMedium", "20px"),
    "--uk-global-font-size-large": value("fontSizeLarge", value("largeTextFontSize", "24px")),
    "--uk-global-font-size-xlarge": value("fontSizeXLarge", "34px"),
    "--uk-global-font-size-2xlarge": value("fontSize2XLarge", "44px"),
    "--uk-global-emphasis-color": value("emphasisColor", "#111827"),
    "--uk-global-inverse-color": value("inverseColor", "#fff"),
    "--uk-inverse-global-color": value("inverseTextColor", `color-mix(in srgb, ${globalInverse} 70%, transparent)`),
    "--uk-inverse-global-emphasis-color": value("inverseEmphasisColor", globalInverse),
    "--uk-inverse-global-muted-color": value("inverseMutedTextColor", `color-mix(in srgb, ${globalInverse} 50%, transparent)`),
    "--uk-inverse-global-link-color": value("inverseLinkColor", globalInverse),
    "--uk-inverse-global-link-hover-color": value("inverseLinkHoverColor", globalInverse),
    "--uk-inverse-global-border": value("inverseBorderColor", `color-mix(in srgb, ${globalInverse} 20%, transparent)`),
    "--uk-inverse-global-inverse-color": value("inverseInverseColor", globalText),
    "--uk-inverse-global-primary-background": value("inversePrimaryBackground", globalInverse),
    "--uk-inverse-global-muted-background": value("inverseMutedBackground", `color-mix(in srgb, ${globalInverse} 10%, transparent)`),
    "--uk-global-link-color": value("linkColor", primary),
    "--uk-global-link-hover-color": value("linkHoverColor", accent),
    "--uk-global-muted-background": backgroundMuted,
    "--uk-base-selection-background": value("selectionBackground", primary),
    "--uk-base-selection-color": value("selectionColor", "#fff"),
    "--uk-base-ins-background": value("baseInsBackground", "transparent"),
    "--uk-base-ins-color": value("baseInsColor", primary),
    "--uk-base-mark-background": value("baseMarkBackground", "transparent"),
    "--uk-base-mark-color": value("baseMarkColor", primary),
    "--uk-global-border-width": value("borderWidth", "1px"),
    "--uk-global-border-color": value("borderColor", "#e5e7eb"),
    // UIkit Alert presentation. These values are consumed by the shared
    // `.uk-alert` renderer in both Builder and storefront, never by a
    // fixture-specific selector.
    "--uk-alert-background": alertBackground,
    "--uk-alert-color": value("alertColor", "#666"),
    "--uk-alert-border-radius": value("alertBorderRadius", "0"),
    "--uk-alert-primary-background": alertPrimaryBackground,
    "--uk-alert-primary-color": value("alertPrimaryColor", "#1e87f0"),
    "--uk-alert-success-background": alertSuccessBackground,
    "--uk-alert-success-color": value("alertSuccessColor", "#32d296"),
    "--uk-alert-warning-background": alertWarningBackground,
    "--uk-alert-warning-color": value("alertWarningColor", "#faa05a"),
    "--uk-alert-danger-background": alertDangerBackground,
    "--uk-alert-danger-color": value("alertDangerColor", "#f0506e"),
    "--uk-card-default-background": cardDefaultBackground,
    "--uk-card-default-backdrop-filter": value("cardBackdropFilter", "none"),
    "--uk-card-primary-background": cardPrimaryBackground,
    "--uk-card-secondary-background": cardSecondaryBackground,
    "--uk-card-muted-background": "#f8fafc",

    // Controls & Radii
    "--uk-global-border-radius": typeof globalRadius === "number" ? `${globalRadius}px` : globalRadius,
    "--uk-card-border-radius": typeof cardRadius === "number" ? `${cardRadius}px` : cardRadius,
    "--uk-button-border-radius": buttonRadius,
    "--uk-button-border-width": buttonBorderWidth,
    "--uk-card-border-width": value("cardBorderWidth", value("borderWidth", "1px")),
    "--uk-card-border-color": value("cardBorderColor", "#e5e7eb"),
    "--uk-card-default-border": value("cardDefaultBorder", value("cardBorderColor", "#e5e7eb")),
    "--uk-card-primary-border": value("cardPrimaryBorder", "transparent"),
    "--uk-card-secondary-border": value("cardSecondaryBorder", "transparent"),
    "--uk-card-transition-duration": value("cardTransitionDuration", "0.1s"),
    "--uk-card-shadow": value("cardShadow", "0 8px 24px rgba(0,0,0,.08)"),
    // YOOtheme's default-card shadow is imported into the canonical card
    // shadow field; expose the semantic alias consumed by card projections.
    "--uk-card-default-box-shadow": value("cardDefaultShadow", value("cardShadow", "none")),
    "--uk-card-hover-shadow": value("cardHoverShadow", value("cardShadowHover", "0 8px 24px rgba(0,0,0,.08)")),
    "--uk-card-hover-transform": value("cardHoverTransform", "translateY(3px)"),
    "--uk-card-default-hover-background": cardDefaultHoverBackground,
    "--uk-card-primary-hover-background": cardPrimaryHoverBackground,
    "--uk-card-secondary-hover-background": cardSecondaryHoverBackground,
    "--uk-card-default-text": value("cardDefaultText", value("mutedTextColor", "#6b7280")),
    "--uk-card-primary-text": value("cardPrimaryText", "#fff"),
    "--uk-card-secondary-text": value("cardSecondaryText", "#fff"),
    "--uk-card-default-title": value("cardDefaultTitle", value("emphasisColor", "#111827")),
    "--uk-card-primary-title": value("cardPrimaryTitle", "#fff"),
    "--uk-card-secondary-title": value("cardSecondaryTitle", "#fff"),
    "--uk-card-default-hover-text": value("cardDefaultHoverText", value("cardDefaultText", "#6b7280")),
    "--uk-card-primary-hover-text": value("cardPrimaryHoverText", value("cardPrimaryText", "#fff")),
    "--uk-card-secondary-hover-text": value("cardSecondaryHoverText", value("cardSecondaryText", "#fff")),
    "--uk-card-default-hover-title": value("cardDefaultHoverTitle", value("cardDefaultTitle", "#111827")),
    "--uk-card-primary-hover-title": value("cardPrimaryHoverTitle", value("cardPrimaryTitle", "#fff")),
    "--uk-card-secondary-hover-title": value("cardSecondaryHoverTitle", value("cardSecondaryTitle", "#fff")),
    "--uk-card-default-hover-border": value("cardDefaultHoverBorder", value("cardDefaultBorder", "#e5e7eb")),
    "--uk-card-primary-hover-border": value("cardPrimaryHoverBorder", value("cardPrimaryBorder", "transparent")),
    "--uk-card-secondary-hover-border": value("cardSecondaryHoverBorder", value("cardSecondaryBorder", "transparent")),
    // Card variants own their shadow tokens. Never fall back from Primary or
    // Secondary to the generic Card shadow: that allows a DevStack glow to
    // leak into a tenant whose imported variant intentionally has no shadow.
    "--uk-card-default-hover-shadow": value("cardDefaultHoverShadow", value("cardShadowHover", "0 12px 30px rgba(0,0,0,.12)")),
    "--uk-card-primary-shadow": value("cardPrimaryShadow", "none"),
    "--uk-card-primary-hover-shadow": value("cardPrimaryHoverShadow", "none"),
    "--uk-card-secondary-shadow": value("cardSecondaryShadow", "none"),
    "--uk-card-secondary-hover-shadow": value("cardSecondaryHoverShadow", "none"),
    "--uk-card-padding-small": value("cardPaddingSmall", "15px"),
    "--uk-card-padding": value("cardPaddingDefault", "30px"),
    "--uk-card-padding-large": value("cardPaddingLarge", "40px"),
    "--uk-card-image-body-spacing": value("cardImageBodySpacing", "20px"),
    "--uk-card-title-spacing": value("cardTitleSpacing", "0px"),
    "--uk-card-meta-spacing": value("cardMetaSpacing", "10px"),
    "--uk-card-header-spacing": value("cardHeaderSpacing", "20px"),
    "--uk-card-footer-spacing": value("cardFooterSpacing", "20px"),
    "--uk-button-primary-background": buttonValue("buttonPrimaryBackground", primary),
    "--uk-button-primary-text": buttonValue("buttonPrimaryText", globalInverse),
    "--uk-button-primary-hover-background": buttonValue("buttonHoverBg", buttonValue("buttonPrimaryBackground", primary)),
    "--uk-button-font-size": value("buttonFontSize", "15px"),
    "--uk-button-font-family": value("buttonFontFamily", "inherit"),
    "--uk-button-font-style": value("buttonFontStyle", "normal"),
    "--uk-button-font-weight": value("buttonFontWeight", "600"),
    "--uk-button-line-height": value("buttonLineHeight", controlLineHeight(buttonControlHeight, "44px")),
    "--uk-button-text-transform": value("buttonTextTransform", "none"),
    "--uk-button-border-mode": value("buttonBorderMode", "solid"),
    "--uk-button-background-size": value("buttonBackgroundSize", "200%"),
    "--uk-button-background-position": value("buttonBackgroundPosition", "100%"),
    "--uk-button-hover-background-position": value("buttonHoverBackgroundPosition", "0%"),
    "--uk-button-small-font-size": value("buttonSmallFontSize", "14px"),
    "--uk-button-small-line-height": value("buttonSmallLineHeight", value("controlHeightSmall", "40px")),
    "--uk-button-small-padding-x": value("buttonSmallPaddingX", "20px"),
    "--uk-button-small-radius": buttonSmallRadius,
    "--uk-button-large-font-size": value("buttonLargeFontSize", value("baseFontSize", "16px")),
    "--uk-button-large-line-height": value("buttonLargeLineHeight", controlLineHeight(buttonLargeControlHeight, "52px")),
    "--uk-button-large-padding-x": value("buttonLargePaddingX", value("gridGutterMedium", value("buttonPaddingX", "40px"))),
    "--uk-button-large-radius": buttonLargeRadius,
    "--uk-button-letter-spacing": value("buttonLetterSpacing", "0px"),
    "--uk-button-default-hover-background": buttonValue("buttonDefaultHoverBackground", buttonValue("buttonDefaultBackground", backgroundDefault)),
    "--uk-button-default-hover-text": buttonValue("buttonDefaultHoverText", buttonValue("buttonDefaultText", globalText)),
    "--uk-button-default-border": buttonValue("buttonDefaultBorder", "transparent"),
    "--uk-button-default-hover-border": buttonValue("buttonDefaultHoverBorder", "transparent"),
    "--uk-button-default-active-background": buttonValue("buttonDefaultActiveBackground", buttonValue("buttonDefaultBackground", backgroundDefault)),
    "--uk-button-default-active-text": buttonValue("buttonDefaultActiveText", buttonValue("buttonDefaultText", globalText)),
    "--uk-button-default-active-border": buttonValue("buttonDefaultActiveBorder", buttonValue("buttonDefaultBorder", globalBorder)),
    "--uk-button-default-active-shadow": buttonValue("buttonDefaultActiveShadow", value("shadowSmall", "none")),
    "--uk-button-secondary-hover-background": buttonValue("buttonSecondaryHoverBackground", primary),
    "--uk-button-secondary-hover-text": buttonValue("buttonSecondaryHoverText", globalInverse),
    "--uk-button-secondary-border": buttonValue("buttonSecondaryBorder", primary),
    "--uk-button-secondary-hover-border": buttonValue("buttonSecondaryHoverBorder", buttonValue("buttonSecondaryBorder", primary)),
    "--uk-button-secondary-active-background": buttonValue("buttonSecondaryActiveBackground", buttonValue("buttonSecondaryHoverBackground", primary)),
    "--uk-button-secondary-active-text": buttonValue("buttonSecondaryActiveText", globalInverse),
    "--uk-button-secondary-active-border": buttonValue("buttonSecondaryActiveBorder", buttonValue("buttonSecondaryBorder", primary)),
    "--uk-button-secondary-active-shadow": buttonValue("buttonSecondaryActiveShadow", value("shadowSmall", "none")),
    "--uk-button-primary-hover-border": buttonValue("buttonPrimaryHoverBorder", "transparent"),
    "--uk-button-primary-hover-text": buttonValue("buttonPrimaryHoverText", buttonValue("buttonHoverTextColor", globalInverse)),
    "--uk-button-primary-active-background": buttonValue("buttonPrimaryActiveBackground", buttonValue("buttonPrimaryBackground", primary)),
    "--uk-button-primary-active-text": buttonValue("buttonPrimaryActiveText", globalInverse),
    "--uk-button-primary-active-border": buttonValue("buttonPrimaryActiveBorder", "transparent"),
    "--uk-button-primary-active-shadow": buttonValue("buttonPrimaryActiveShadow", value("shadowSmall", "none")),
    "--uk-button-danger-background": value("buttonDangerBackground", value("dangerColor", "#f0506e")),
    "--uk-button-danger-text": value("buttonDangerText", "#fff"),
    "--uk-button-danger-border": value("buttonDangerBorder", "transparent"),
    "--uk-button-danger-hover-background": value("buttonDangerHoverBackground", value("buttonDangerBackground", "#f0506e")),
    "--uk-button-danger-hover-text": value("buttonDangerHoverText", "#fff"),
    "--uk-button-danger-hover-border": value("buttonDangerHoverBorder", "transparent"),
    "--uk-button-danger-hover-shadow": value("buttonDangerHoverShadow", "none"),
    "--uk-button-danger-active-background": value("buttonDangerActiveBackground", value("buttonDangerBackground", "#f0506e")),
    "--uk-button-danger-active-text": value("buttonDangerActiveText", "#fff"),
    "--uk-button-danger-active-border": value("buttonDangerActiveBorder", "transparent"),
    "--uk-button-danger-active-shadow": value("buttonDangerActiveShadow", value("shadowSmall", "none")),
    "--uk-button-disabled-background": value("buttonDisabledBackground", "#f8f8f8"),
    "--uk-button-disabled-text": value("buttonDisabledText", "#999"),
    "--uk-button-disabled-border": value("buttonDisabledBorder", "transparent"),
    "--uk-button-text-background": buttonValue("buttonTextBackground", "transparent"),
    "--uk-button-text-arrow-image": yoothemeButtonTextArrow(primary),
    "--uk-button-text-arrow-inverse-image": yoothemeButtonTextArrow(globalInverse),
    "--uk-button-text-hover-color": buttonValue("buttonTextHoverColor", primary),
    "--uk-button-text-border": buttonValue("buttonTextBorder", "transparent"),
    "--uk-button-text-hover-border": buttonValue("buttonTextHoverBorder", primary),
    "--uk-button-text-active-color": buttonValue("buttonTextActiveColor", primary),
    // Link owns the theme's global Link color. It remains distinct from
    // Button Text by presentation (no arrow), not by a substituted palette.
    "--uk-button-link-color": buttonValue("buttonLinkColor", globalLink),
    // The Link variant follows the global Link interaction token, not the
    // Button Text/Button Link token family. DevStack resolves this to its
    // muted purple hover color.
    "--uk-button-link-hover-color": value("linkHoverColor", globalLink),
    "--uk-button-backdrop-filter": value("buttonBackdropFilter", "none"),
    "--uk-button-transition-duration": value("buttonTransitionDuration", "0.2s"),
    "--uk-button-primary-gradient": buttonValue("buttonPrimaryGradient", "none"),
    "--uk-button-primary-hover-gradient": buttonValue("buttonPrimaryHoverGradient", buttonValue("buttonPrimaryGradient", "none")),
    "--uk-button-primary-active-gradient": buttonValue("buttonPrimaryActiveGradient", buttonValue("buttonPrimaryGradient", "none")),
    "--uk-button-secondary-hover-gradient": buttonValue("buttonSecondaryHoverGradient", "none"),
    "--uk-button-secondary-active-gradient": buttonValue("buttonSecondaryActiveGradient", "none"),
    "--uk-button-default-mode": buttonValue("buttonDefaultMode", "none"),
    "--uk-button-default-glow-display": buttonValue("buttonDefaultMode", "none") === "glow" ? "block" : "none",
    "--uk-button-default-glow-gradient": buttonValue("buttonDefaultGlowGradient", "none"),
    "--uk-button-default-glow-filter": buttonValue("buttonDefaultGlowFilter", "none"),
    "--uk-button-default-hover-glow-filter": buttonValue("buttonDefaultHoverGlowFilter", buttonValue("buttonDefaultGlowFilter", "none")),
    "--uk-button-default-render-background": buttonValue("buttonDefaultMode", "none") === "glow" ? "transparent" : buttonValue("buttonDefaultBackground", backgroundDefault),
    "--uk-button-default-render-gradient": buttonValue("buttonDefaultMode", "none") === "glow" ? "none" : "none",
    "--uk-button-primary-mode": buttonValue("buttonPrimaryMode", "none"),
    "--uk-button-primary-glow-display": buttonValue("buttonPrimaryMode", "none") === "glow" ? "block" : "none",
    "--uk-button-primary-glow-gradient": buttonValue("buttonPrimaryGlowGradient", "none"),
    "--uk-button-primary-glow-filter": buttonValue("buttonPrimaryGlowFilter", "none"),
    "--uk-button-primary-hover-glow-filter": buttonValue("buttonPrimaryHoverGlowFilter", buttonValue("buttonPrimaryGlowFilter", "none")),
    "--uk-button-primary-render-background": buttonValue("buttonPrimaryMode", "none") === "glow" ? "transparent" : buttonValue("buttonPrimaryBackground", primary),
    "--uk-button-primary-render-hover-background": buttonValue("buttonPrimaryMode", "none") === "glow" ? "transparent" : buttonValue("buttonHoverBg", buttonValue("buttonPrimaryBackground", primary)),
    "--uk-button-primary-render-active-background": buttonValue("buttonPrimaryMode", "none") === "glow" ? "transparent" : buttonValue("buttonPrimaryActiveBackground", buttonValue("buttonPrimaryBackground", primary)),
    "--uk-button-primary-render-gradient": buttonValue("buttonPrimaryMode", "none") === "glow" ? "none" : buttonValue("buttonPrimaryGradient", "none"),
    "--uk-button-primary-render-hover-gradient": buttonValue("buttonPrimaryMode", "none") === "glow" ? "none" : buttonValue("buttonPrimaryHoverGradient", buttonValue("buttonPrimaryGradient", "none")),
    "--uk-button-primary-render-active-gradient": buttonValue("buttonPrimaryMode", "none") === "glow" ? "none" : buttonValue("buttonPrimaryActiveGradient", buttonValue("buttonPrimaryGradient", "none")),
    "--uk-button-secondary-mode": buttonValue("buttonSecondaryMode", "none"),
    "--uk-button-secondary-glow-display": buttonValue("buttonSecondaryMode", "none") === "glow" ? "block" : "none",
    "--uk-button-secondary-glow-gradient": buttonValue("buttonSecondaryGlowGradient", "none"),
    "--uk-button-secondary-glow-filter": buttonValue("buttonSecondaryGlowFilter", "none"),
    "--uk-button-secondary-hover-glow-filter": buttonValue("buttonSecondaryHoverGlowFilter", buttonValue("buttonSecondaryGlowFilter", "none")),
    "--uk-button-secondary-render-background": buttonValue("buttonSecondaryMode", "none") === "glow" ? "transparent" : buttonValue("buttonSecondaryBackground", "#e5e7eb"),
    "--uk-button-secondary-render-gradient": buttonValue("buttonSecondaryMode", "none") === "glow" ? "none" : "none",
    "--uk-theme-box-decoration-border-radius": value("themeBoxDecorationBorderRadius", "10px"),
    "--uk-theme-box-decoration-default-gradient": value("themeBoxDecorationDefaultGradient", "conic-gradient(from 70deg, #FD3D8F, #B823C3, #4901AC, #063AD8, #4901AC, #B823C3, #FD3D8F, #E8533C)"),
    "--uk-theme-box-decoration-primary-glow-filter": value("themeBoxDecorationPrimaryGlowFilter", "blur(7px)"),
    "--uk-theme-box-decoration-primary-glow-gradient": value("themeBoxDecorationPrimaryGlowGradient", "conic-gradient(from 70deg, #FD3D8F, #B823C3, #4901AC, #063AD8, #4901AC, #B823C3, #FD3D8F, #E8533C)"),
    "--uk-theme-box-decoration-primary-background": value("themeBoxDecorationPrimaryBackground", "rgba(255,255,255,0.1)"),
    "--uk-theme-box-decoration-primary-border": value("themeBoxDecorationPrimaryBorder", "rgba(255,255,255,0.1)"),
    "--uk-theme-box-decoration-secondary-glow-filter": value("themeBoxDecorationSecondaryGlowFilter", "blur(7px)"),
    "--uk-theme-box-decoration-secondary-background": value("themeBoxDecorationSecondaryBackground", "rgba(255,255,255,0.1)"),
    "--uk-theme-box-decoration-secondary-border": value("themeBoxDecorationSecondaryBorder", "rgba(255,255,255,0.1)"),
    // Inverse Button tokens remain aliases at the Global Styles layer. The
    // semantic surface context consumes them only for dark/inverse sections,
    // so the normal Button presentation retains its authored values.
    // UIkit's inverse Button defaults are part of the same canonical Global
    // Styles owner. Theme LESS can override any token below; the fallbacks
    // are UIkit theme defaults, not a separate WebPages palette.
    // UIkit's inverse default Button inherits the inverse primary surface
    // (normally the global inverse color) and the normal global text color.
    // DevStack leaves these variables undeclared and relies on this exact
    // UIkit fallback, as the live YOOtheme hero demonstrates.
    "--uk-button-inverse-default-background": buttonValue("buttonInverseDefaultBackground", globalInverse),
    "--uk-button-inverse-default-text": buttonValue("buttonInverseDefaultText", globalText),
    "--uk-button-inverse-default-hover-background": buttonValue("buttonInverseDefaultHoverBackground", `color-mix(in srgb, ${globalInverse} 95%, #000)`),
    "--uk-button-inverse-default-hover-text": buttonValue("buttonInverseDefaultHoverText", globalText),
    "--uk-button-inverse-default-active-background": buttonValue("buttonInverseDefaultActiveBackground", `color-mix(in srgb, ${globalInverse} 90%, #000)`),
    "--uk-button-inverse-default-active-text": buttonValue("buttonInverseDefaultActiveText", globalText),
    "--uk-button-inverse-default-border": buttonValue("buttonInverseDefaultBorder", globalInverse),
    "--uk-button-inverse-default-hover-border": buttonValue("buttonInverseDefaultHoverBorder", globalInverse),
    "--uk-button-inverse-default-active-border": buttonValue("buttonInverseDefaultActiveBorder", globalInverse),
    "--uk-button-inverse-default-shadow": buttonValue("buttonInverseDefaultShadow", "0 5px 15px rgba(0,0,0,0.2)"),
    "--uk-button-inverse-primary-shadow": buttonValue("buttonInversePrimaryShadow", "0 5px 15px rgba(0,0,0,0.2)"),
    "--uk-button-inverse-secondary-background": buttonValue("buttonInverseSecondaryBackground", "transparent"),
    "--uk-button-inverse-secondary-text": buttonValue("buttonInverseSecondaryText", globalInverse),
    "--uk-button-inverse-secondary-hover-background": buttonValue("buttonInverseSecondaryHoverBackground", globalInverse),
    "--uk-button-inverse-secondary-active-background": buttonValue("buttonInverseSecondaryActiveBackground", "rgba(255, 255, 255, 0.8)"),
    "--uk-button-inverse-secondary-border": buttonValue("buttonInverseSecondaryBorder", globalInverse),
    "--uk-button-inverse-secondary-hover-text": buttonValue("buttonInverseSecondaryHoverText", globalText),
    "--uk-button-inverse-secondary-active-text": buttonValue("buttonInverseSecondaryActiveText", globalText),
    "--uk-button-default-shadow": buttonValue("buttonDefaultShadow", value("shadowLarge", "none")),
    "--uk-button-default-hover-shadow": buttonValue("buttonDefaultHoverShadow", value("shadowMedium", "none")),
    "--uk-button-primary-shadow": buttonValue("buttonPrimaryShadow", value("shadowLarge", "none")),
    "--uk-button-primary-hover-shadow": buttonValue("buttonPrimaryHoverShadow", buttonValue("buttonHoverShadow", "none")),
    "--uk-button-secondary-shadow": buttonValue("buttonSecondaryShadow", "none"),
    "--uk-button-secondary-hover-shadow": buttonValue("buttonSecondaryHoverShadow", buttonValue("buttonHoverShadow", "none")),
    "--uk-button-default-background": buttonValue("buttonDefaultBackground", backgroundDefault),
    // UIkit's default button text follows the imported global text role when
    // the theme does not author a dedicated button color.
    "--uk-button-default-text": buttonValue("buttonDefaultText", globalText),
    "--uk-button-secondary-background": buttonValue("buttonSecondaryBackground", "#e5e7eb"),
    "--uk-button-secondary-text": buttonValue("buttonSecondaryText", globalText),
    "--uk-button-text-color": buttonValue("buttonTextColorSemantic", primary),
    "--uk-global-control-height": value("controlHeightDefault", value("buttonHeight", "48px")),
    "--uk-global-control-height-small": value("controlHeightSmall", "40px"),
    "--uk-global-control-height-large": value("controlHeightLarge", "56px"),
    "--uk-button-height": value("buttonHeight", value("controlHeightDefault", "48px")),
    "--uk-button-height-small": value("controlHeightSmall", "40px"),
    "--uk-button-height-large": value("controlHeightLarge", "56px"),
    "--uk-accordion-title-font-size": value("accordionTitleFontSize", "1rem"),
    "--uk-accordion-title-hover-color": value("accordionTitleHoverColor", primary),
    "--uk-accordion-content-margin-top": value("accordionContentMarginTop", "12px"),
    "--uk-accordion-title-padding-vertical": value("accordionTitlePaddingVertical", "10px"),
    "--uk-accordion-icon-color": value("accordionIconColor", "currentColor"),
    "--uk-accordion-title-font-weight": value("accordionTitleFontWeight", "500"),
    "--uk-accordion-title-letter-spacing": value("accordionTitleLetterSpacing", "0px"),
    "--uk-accordion-item-border-width": value("accordionItemBorderWidth", "1px"),
    "--uk-accordion-item-border": value("accordionItemBorder", "rgba(0,0,0,.12)"),
    "--uk-accordion-item-box-shadow": value("accordionItemBoxShadow", "none"),

    // Nav
    "--uk-nav-divider-margin-vertical": value("navDividerMarginVertical", "0"),
    "--uk-nav-divider-margin-horizontal": value("navDividerMarginHorizontal", "0"),
    "--uk-nav-large-font-size": value("navLargeFontSize", "3.4rem"),
    "--uk-nav-large-font-size-l": value("navLargeFontSizeL", "6rem"),
    "--uk-nav-large-font-size-m": value("navLargeFontSizeM", "4rem"),
    "--uk-nav-large-line-height": value("navLargeLineHeight", "1"),
    "--uk-nav-medium-font-size": value("navMediumFontSize", "2.8875rem"),
    "--uk-nav-medium-font-size-l": value("navMediumFontSizeL", "4rem"),
    "--uk-nav-medium-font-size-m": value("navMediumFontSizeM", "3.5rem"),
    "--uk-nav-medium-line-height": value("navMediumLineHeight", "1"),
    "--uk-nav-xlarge-font-size": value("navXLargeFontSize", "4rem"),
    "--uk-nav-xlarge-font-size-l": value("navXLargeFontSizeL", "8rem"),
    "--uk-nav-xlarge-font-size-m": value("navXLargeFontSizeM", "6rem"),
    "--uk-nav-xlarge-line-height": value("navXLargeLineHeight", "1"),
    "--uk-nav-item-padding-horizontal": value("navItemPaddingHorizontal", "0"),
    "--uk-nav-item-padding-vertical": value("navItemPaddingVertical", "5px"),
    "--uk-nav-sublist-deeper-padding-left": value("navSublistDeeperPaddingLeft", "15px"),
    "--uk-nav-sublist-item-padding-vertical": value("navSublistItemPaddingVertical", "2px"),
    "--uk-nav-sublist-padding-left": value("navSublistPaddingLeft", "15px"),
    "--uk-nav-sublist-padding-vertical": value("navSublistPaddingVertical", "5px"),
    "--uk-nav-parent-icon-margin-left": value("navParentIconMarginLeft", "0.25em"),
    "--uk-nav-default-item-color": value("navDefaultItemColor", globalText),
    "--uk-nav-default-font-family": value("navDefaultFontFamily", "inherit"),
    "--uk-nav-default-font-style": value("navDefaultFontStyle", "normal"),
    "--uk-nav-default-font-weight": value("navDefaultFontWeight", "400"),
    "--uk-nav-default-letter-spacing": value("navDefaultLetterSpacing", "0"),
    "--uk-nav-default-line-height": value("navDefaultLineHeight", "1.5"),
    "--uk-nav-default-text-transform": value("navDefaultTextTransform", "none"),
    "--uk-nav-default-item-hover-color": value("navDefaultItemHoverColor", primary),
    "--uk-nav-default-item-active-color": value("navDefaultItemActiveColor", primary),
    "--uk-nav-default-subtitle-font-size": value("navDefaultSubtitleFontSize", "12px"),
    "--uk-nav-default-header-color": value("navDefaultHeaderColor", globalText),
    "--uk-nav-default-sublist-item-hover-color": value("navDefaultSublistItemHoverColor", primary),
    "--uk-nav-default-sublist-item-active-color": value("navDefaultSublistItemActiveColor", primary),
    "--uk-nav-primary-item-color": value("navPrimaryItemColor", globalText),
    "--uk-nav-primary-item-hover-color": value("navPrimaryItemHoverColor", primary),
    "--uk-nav-primary-item-active-color": value("navPrimaryItemActiveColor", primary),
    "--uk-nav-primary-subtitle-font-size": value("navPrimarySubtitleFontSize", "14px"),
    "--uk-nav-primary-header-color": value("navPrimaryHeaderColor", globalText),
    "--uk-nav-primary-sublist-item-hover-color": value("navPrimarySublistItemHoverColor", primary),
    "--uk-nav-primary-sublist-item-active-color": value("navPrimarySublistItemActiveColor", primary),
    "--uk-nav-secondary-line-height": value("navSecondaryLineHeight", "1.6"),
    "--uk-nav-secondary-item-hover-color": value("navSecondaryItemHoverColor", primary),
    "--uk-nav-secondary-item-active-color": value("navSecondaryItemActiveColor", primary),
    "--uk-nav-secondary-subtitle-active-color": value("navSecondarySubtitleActiveColor", globalText),
    "--uk-nav-secondary-sublist-font-size": value("navSecondarySublistFontSize", "16px"),
    "--uk-nav-secondary-sublist-item-hover-color": value("navSecondarySublistItemHoverColor", primary),
    "--uk-nav-secondary-sublist-item-active-color": value("navSecondarySublistItemActiveColor", primary),
    "--uk-nav-dividers-margin-top": value("navDividersMarginTop", "10px"),
    "--uk-nav-secondary-margin-top": value("navSecondaryMarginTop", "4px"),
    "--uk-nav-secondary-item-padding-vertical": value("navSecondaryItemPaddingVertical", "15px"),
    "--uk-nav-secondary-item-padding-horizontal": value("navSecondaryItemPaddingHorizontal", "15px"),
    "--uk-nav-secondary-item-hover-background": value("navSecondaryItemHoverBackground", "transparent"),
    "--uk-nav-secondary-item-active-background": value("navSecondaryItemActiveBackground", "transparent"),
    "--uk-nav-default-subtitle-color": value("navDefaultSubtitleColor", value("mutedTextColor", "#6b7280")),
    "--uk-nav-default-subtitle-font-weight": value("navDefaultSubtitleFontWeight", "normal"),
    "--uk-nav-primary-subtitle-color": value("navPrimarySubtitleColor", value("mutedTextColor", "#6b7280")),
    "--uk-nav-primary-subtitle-font-weight": value("navPrimarySubtitleFontWeight", "normal"),
    "--uk-nav-secondary-subtitle-font-weight": value("navSecondarySubtitleFontWeight", "normal"),
    "--uk-nav-secondary-item-border-radius": value("navSecondaryItemBorderRadius", "0px"),
    "--uk-nav-secondary-font-family": value("navSecondaryFontFamily", "inherit"),
    "--uk-nav-secondary-font-size": value("navSecondaryFontSize", "16px"),
    "--uk-nav-secondary-font-style": value("navSecondaryFontStyle", "normal"),
    "--uk-nav-secondary-font-weight": value("navSecondaryFontWeight", "700"),
    "--uk-nav-secondary-letter-spacing": value("navSecondaryLetterSpacing", "0"),
    "--uk-nav-secondary-text-transform": value("navSecondaryTextTransform", "none"),
    "--uk-nav-secondary-item-color": value("navSecondaryItemColor", globalText),
    "--uk-nav-secondary-subtitle-color": value("navSecondarySubtitleColor", globalText),
    "--uk-nav-secondary-header-color": value("navSecondaryHeaderColor", globalText),
    "--uk-nav-secondary-divider-border": value("navSecondaryDividerBorder", "transparent"),
    "--uk-nav-secondary-divider-border-width": value("navSecondaryDividerBorderWidth", "1px"),
    "--uk-nav-secondary-divider-box-shadow": value("navSecondaryDividerBoxShadow", "none"),
    "--uk-nav-secondary-item-hover-box-shadow": value("navSecondaryItemHoverBoxShadow", "none"),
    "--uk-nav-secondary-item-active-box-shadow": value("navSecondaryItemActiveBoxShadow", "none"),
    "--uk-nav-secondary-siblings-filter": value("navSecondarySiblingsFilter", "none"),
    "--uk-nav-secondary-siblings-opacity": value("navSecondarySiblingsOpacity", "1"),
    "--uk-nav-header-font-size": value("navHeaderFontSize", "13px"),
    "--uk-nav-header-font-weight": value("navHeaderFontWeight", "inherit"),
    "--uk-nav-header-letter-spacing": value("navHeaderLetterSpacing", "0"),
    "--uk-nav-header-margin-top": value("navHeaderMarginTop", "20px"),
    "--uk-nav-header-padding-horizontal": value("navHeaderPaddingHorizontal", "0"),
    "--uk-nav-header-padding-vertical": value("navHeaderPaddingVertical", "5px"),
    "--uk-nav-header-text-transform": value("navHeaderTextTransform", "uppercase"),
    "--uk-nav-default-divider-box-shadow": value("navDefaultDividerBoxShadow", "none"),
    "--uk-nav-default-divider-border": value("navDefaultDividerBorder", "transparent"),
    "--uk-nav-default-divider-border-width": value("navDefaultDividerBorderWidth", "1px"),
    "--uk-nav-default-item-padding-horizontal": value("navDefaultItemPaddingHorizontal", "0"),
    "--uk-nav-default-item-padding-vertical": value("navDefaultItemPaddingVertical", "5px"),
    "--uk-nav-default-item-border-radius": value("navDefaultItemBorderRadius", "0"),
    "--uk-nav-default-item-hover-background": value("navDefaultItemHoverBackground", "transparent"),
    "--uk-nav-default-item-hover-box-shadow": value("navDefaultItemHoverBoxShadow", "none"),
    "--uk-nav-default-item-active-background": value("navDefaultItemActiveBackground", "transparent"),
    "--uk-nav-default-item-line-background": value("navDefaultItemLineBackground", "transparent"),
    "--uk-nav-default-item-line-bottom": value("navDefaultItemLineBottom", "0"),
    "--uk-nav-default-item-line-height": value("navDefaultItemLineHeight", "1px"),
    "--uk-nav-default-item-line-left": value("navDefaultItemLineLeft", "0"),
    "--uk-nav-default-item-line-right": value("navDefaultItemLineRight", "100%"),
    "--uk-nav-default-item-line-transition-duration": value("navDefaultItemLineTransitionDuration", "0.3s"),
    "--uk-nav-default-item-line-transition-timing-function": value("navDefaultItemLineTransitionTimingFunction", "ease-out"),
    "--uk-nav-default-item-line-hover-left": value("navDefaultItemLineHoverLeft", "0"),
    "--uk-nav-default-item-line-hover-right": value("navDefaultItemLineHoverRight", "0"),
    "--uk-nav-default-siblings-filter": value("navDefaultSiblingsFilter", "none"),
    "--uk-nav-default-siblings-opacity": value("navDefaultSiblingsOpacity", "1"),
    "--uk-nav-primary-divider-box-shadow": value("navPrimaryDividerBoxShadow", "none"),
    "--uk-nav-primary-divider-border": value("navPrimaryDividerBorder", "transparent"),
    "--uk-nav-primary-divider-border-width": value("navPrimaryDividerBorderWidth", "1px"),
    "--uk-nav-primary-item-padding-horizontal": value("navPrimaryItemPaddingHorizontal", "0"),
    "--uk-nav-primary-item-padding-vertical": value("navPrimaryItemPaddingVertical", "5px"),
    "--uk-nav-primary-item-border-radius": value("navPrimaryItemBorderRadius", "0"),
    "--uk-nav-primary-item-hover-background": value("navPrimaryItemHoverBackground", "transparent"),
    "--uk-nav-primary-item-hover-box-shadow": value("navPrimaryItemHoverBoxShadow", "none"),
    "--uk-nav-primary-item-active-background": value("navPrimaryItemActiveBackground", "transparent"),
    "--uk-nav-primary-item-line-background": value("navPrimaryItemLineBackground", "transparent"),
    "--uk-nav-primary-item-line-bottom": value("navPrimaryItemLineBottom", "0"),
    "--uk-nav-primary-item-line-height": value("navPrimaryItemLineHeight", "1px"),
    "--uk-nav-primary-item-line-left": value("navPrimaryItemLineLeft", "0"),
    "--uk-nav-primary-item-line-right": value("navPrimaryItemLineRight", "100%"),
    "--uk-nav-primary-item-line-transition-duration": value("navPrimaryItemLineTransitionDuration", "0.3s"),
    "--uk-nav-primary-item-line-transition-timing-function": value("navPrimaryItemLineTransitionTimingFunction", "ease-out"),
    "--uk-nav-primary-item-line-hover-left": value("navPrimaryItemLineHoverLeft", "0"),
    "--uk-nav-primary-item-line-hover-right": value("navPrimaryItemLineHoverRight", "0"),
    "--uk-nav-primary-siblings-filter": value("navPrimarySiblingsFilter", "none"),
    "--uk-nav-primary-siblings-opacity": value("navPrimarySiblingsOpacity", "1"),
    "--uk-nav-dividers-box-shadow": value("navDividersBoxShadow", "none"),

    // Navbar
    "--uk-navbar-background": value("navbarBackground", backgroundDefault),
    "--uk-navbar-gap": value("navbarGap", "10px"),
    "--uk-navbar-nav-gap": value("navbarNavGap", "10px"),
    "--uk-navbar-nav-item-height": value("navbarNavItemHeight", "90px"),
    "--uk-navbar-nav-item-padding-horizontal": value("navbarNavItemPaddingHorizontal", "7px"),
    "--uk-navbar-nav-item-color": value("navbarNavItemColor", globalText),
    "--uk-navbar-nav-item-font-size": value("navbarNavItemFontSize", "16px"),
    "--uk-navbar-nav-item-font-family": value("navbarNavItemFontFamily", value("fontFamilyBody", "inherit")),
    "--uk-navbar-nav-item-font-style": value("navbarNavItemFontStyle", "normal"),
    "--uk-navbar-nav-item-font-weight": value("navbarNavItemFontWeight", "400"),
    "--uk-navbar-nav-item-letter-spacing": value("navbarNavItemLetterSpacing", "0"),
    "--uk-navbar-nav-item-transition-duration": value("navbarNavItemTransitionDuration", "0.1s"),
    "--uk-navbar-nav-item-hover-color": value("navbarNavItemHoverColor", primary),
    "--uk-navbar-nav-item-onclick-color": value("navbarNavItemOnclickColor", primary),
    "--uk-navbar-nav-item-active-color": value("navbarNavItemActiveColor", primary),
    "--uk-navbar-nav-item-hover-background": value("navbarNavItemHoverBackground", "transparent"),
    "--uk-navbar-nav-item-active-background": value("navbarNavItemActiveBackground", "transparent"),
    "--uk-navbar-nav-item-hover-text-shadow": value("navbarNavItemHoverTextShadow", "none"),
    "--uk-navbar-nav-item-active-text-shadow": value("navbarNavItemActiveTextShadow", "none"),
    "--uk-navbar-nav-item-hover-box-shadow": value("navbarNavItemHoverBoxShadow", "none"),
    "--uk-navbar-nav-item-active-box-shadow": value("navbarNavItemActiveBoxShadow", "none"),
    "--uk-navbar-padding-top": value("navbarPaddingTop", "0"),
    "--uk-navbar-padding-bottom": value("navbarPaddingBottom", "0"),
    "--uk-navbar-padding-top-m": value("navbarPaddingTopMedium", "0"),
    "--uk-navbar-padding-bottom-m": value("navbarPaddingBottomMedium", "0"),
    "--uk-navbar-toggle-color": value("navbarToggleColor", globalText),
    "--uk-navbar-toggle-hover-color": value("navbarToggleHoverColor", primary),
    "--uk-navbar-subtitle-font-size": value("navbarSubtitleFontSize", "12px"),
    "--uk-navbar-dropdown-margin": value("navbarDropdownMargin", "5px"),
    "--uk-navbar-dropdown-shift-margin": value("navbarDropdownShiftMargin", "-19px"),
    "--uk-navbar-dropdown-width": value("navbarDropdownWidth", "260px"),
    "--uk-navbar-dropdown-padding": value("navbarDropdownPadding", "26px"),
    "--uk-navbar-dropdown-background": value("navbarDropdownBackground", backgroundDefault),
    "--uk-navbar-dropdown-color": value("navbarDropdownColor", globalText),
    "--uk-navbar-dropdown-color-mode": value("navbarDropdownColorMode", "light"),
    "--uk-navbar-dropdown-border-width": value("navbarDropdownBorderWidth", value("navbarBorderWidth", "1px")),
    "--uk-navbar-dropdown-border": value("navbarDropdownBorder", value("navbarBorder", globalBorder)),
    "--uk-navbar-dropdown-viewport-margin": value("navbarDropdownViewportMargin", "15px"),
    "--uk-navbar-dropdown-focus-outline": value("navbarDropdownFocusOutline", "none"),
    "--uk-navbar-dropdown-dropbar-shift-margin": value("navbarDropdownDropbarShiftMargin", "7px"),
    "--uk-navbar-dropdown-dropbar-padding-top": value("navbarDropdownDropbarPaddingTop", "20px"),
    "--uk-navbar-dropdown-dropbar-padding-bottom": value("navbarDropdownDropbarPaddingBottom", "20px"),
    "--uk-navbar-dropdown-dropbar-viewport-margin": value("navbarDropdownDropbarViewportMargin", "15px"),
    "--uk-navbar-dropdown-dropbar-viewport-margin-m": value("navbarDropdownDropbarViewportMarginMedium", "40px"),
    "--uk-navbar-dropdown-dropbar-viewport-margin-s": value("navbarDropdownDropbarViewportMarginSmall", "30px"),
    "--uk-navbar-dropdown-dropbar-large-shift-margin": value("navbarDropdownDropbarLargeShiftMargin", "7px"),
    "--uk-navbar-dropdown-nav-item-color": value("navbarDropdownNavItemColor", globalText),
    "--uk-navbar-dropdown-nav-item-hover-color": value("navbarDropdownNavItemHoverColor", primary),
    "--uk-navbar-dropdown-nav-item-active-color": value("navbarDropdownNavItemActiveColor", primary),
    "--uk-navbar-dropdown-nav-subtitle-font-size": value("navbarDropdownNavSubtitleFontSize", "12px"),
    "--uk-navbar-dropdown-nav-sublist-item-hover-color": value("navbarDropdownNavSublistItemHoverColor", primary),
    "--uk-navbar-dropdown-nav-sublist-item-active-color": value("navbarDropdownNavSublistItemActiveColor", primary),
    "--uk-navbar-backdrop-filter": value("navbarBackdropFilter", "none"),
    "--uk-navbar-gap-m": value("navbarGapMedium", "20px"),
    "--uk-navbar-nav-gap-m": value("navbarNavGapMedium", "20px"),
    "--uk-navbar-nav-item-padding-horizontal-m": value("navbarNavItemPaddingHorizontalMedium", "14px"),
    "--uk-navbar-nav-item-line-mode": value("navbarNavItemLineMode", "false"),
    "--uk-navbar-nav-item-line-position-mode": value("navbarNavItemLinePositionMode", "bottom"),
    "--uk-navbar-nav-item-line-slide-mode": value("navbarNavItemLineSlideMode", "fixed"),
    "--uk-navbar-nav-item-line-height": value("navbarNavItemLineHeight", "3px"),
    "--uk-navbar-nav-item-line-transition-duration": value("navbarNavItemLineTransitionDuration", "0.35s"),
    "--uk-navbar-nav-item-line-hover-height": value("navbarNavItemLineHoverHeight", "3px"),
    "--uk-navbar-nav-item-line-onclick-height": value("navbarNavItemLineOnclickHeight", "3px"),
    "--uk-navbar-nav-item-line-active-height": value("navbarNavItemLineActiveHeight", "3px"),
    "--uk-navbar-nav-item-line-opacity": value("navbarNavItemLineOpacity", "0"),
    "--uk-navbar-item-padding-horizontal-m": value("navbarItemPaddingHorizontalMedium", "0"),
    "--uk-navbar-dropdown-shift-margin-m": value("navbarDropdownShiftMarginMedium", "-12px"),
    "--uk-navbar-dropdown-dropbar-shift-margin-m": value("navbarDropdownDropbarShiftMarginMedium", "14px"),
    "--uk-navbar-dropdown-dropbar-large-shift-margin-m": value("navbarDropdownDropbarLargeShiftMarginMedium", "14px"),
    "--uk-navbar-dropdown-nav-item-padding-vertical": value("navbarDropdownNavItemPaddingVertical", "4px"),
    "--uk-navbar-dropdown-large-padding": value("navbarDropdownLargePadding", "40px"),
    "--uk-navbar-dropdown-large-shift-margin-m": value("navbarDropdownLargeShiftMarginMedium", "0"),
    "--uk-navbar-dropdown-dropbar-large-padding-top": value("navbarDropdownDropbarLargePaddingTop", "40px"),
    "--uk-navbar-dropdown-dropbar-large-padding-bottom": value("navbarDropdownDropbarLargePaddingBottom", "40px"),
    "--uk-navbar-dropdown-grid-gutter-horizontal": value("navbarDropdownGridGutterHorizontal", "30px"),
    "--uk-navbar-dropdown-grid-gutter-vertical": value("navbarDropdownGridGutterVertical", "30px"),
    "--uk-navbar-dropdown-nav-item-padding-horizontal": value("navbarDropdownNavItemPaddingHorizontal", "0"),
    "--uk-navbar-dropdown-nav-item-border-radius": value("navbarDropdownNavItemBorderRadius", "0"),
    "--uk-navbar-dropdown-nav-item-hover-background": value("navbarDropdownNavItemHoverBackground", "transparent"),
    "--uk-navbar-dropdown-nav-item-active-background": value("navbarDropdownNavItemActiveBackground", "transparent"),
    "--uk-navbar-dropdown-nav-font-family": value("navbarDropdownNavFontFamily", value("fontFamilyBody", "inherit")),
    "--uk-navbar-dropdown-nav-font-style": value("navbarDropdownNavFontStyle", "normal"),
    "--uk-navbar-dropdown-nav-font-weight": value("navbarDropdownNavFontWeight", "400"),
    "--uk-navbar-dropdown-nav-letter-spacing": value("navbarDropdownNavLetterSpacing", "0"),
    "--uk-navbar-dropdown-nav-line-height": value("navbarDropdownNavLineHeight", "inherit"),
    "--uk-navbar-dropdown-nav-text-transform": value("navbarDropdownNavTextTransform", "none"),
    "--uk-navbar-dropdown-nav-header-color": value("navbarDropdownNavHeaderColor", globalText),
    "--uk-navbar-dropdown-nav-divider-border": value("navbarDropdownNavDividerBorder", globalBorder),
    "--uk-navbar-dropdown-nav-divider-border-width": value("navbarDropdownNavDividerBorderWidth", "1px"),
    "--uk-navbar-dropdown-nav-divider-margin-vertical": value("navbarDropdownNavDividerMarginVertical", "5px"),
    "--uk-navbar-dropdown-nav-sublist-item-color": value("navbarDropdownNavSublistItemColor", globalText),
    "--uk-navbar-dropdown-nav-sublist-padding-left": value("navbarDropdownNavSublistPaddingLeft", "15px"),
    "--uk-navbar-subtitle-color": value("navbarSubtitleColor", value("mutedTextColor", "#6b7280")),
    "--uk-navbar-primary-nav-item-font-size": value("navbarPrimaryNavItemFontSize", "20px"),
    "--uk-navbar-dropdown-nav-font-size": value("navbarDropdownNavFontSize", "15px"),
    "--uk-navbar-dropdown-nav-subtitle-color": value("navbarDropdownNavSubtitleColor", value("mutedTextColor", "#6b7280")),
    "--uk-navbar-mode": value("navbarMode", "border"),
    "--uk-navbar-mode-border-vertical": value("navbarModeBorderVertical", "none"),
    "--uk-navbar-border-width": value("navbarBorderWidth", value("borderWidth", "1px")),
    "--uk-navbar-border": value("navbarBorder", globalBorder),
    "--uk-navbar-dropdown-border-radius": value("navbarDropdownBorderRadius", "12px"),
    "--uk-navbar-nav-item-line-gradient": value("navbarNavItemLineGradient", "none"),
    "--uk-navbar-nav-item-line-border-radius": value("navbarNavItemLineBorderRadius", "0"),
    "--uk-navbar-nav-item-line-margin-horizontal": value("navbarNavItemLineMarginHorizontal", "0"),
    "--uk-navbar-nav-item-line-margin-vertical": value("navbarNavItemLineMarginVertical", "-1px"),
    "--uk-navbar-nav-item-line-hover-background": value("navbarNavItemLineHoverBackground", "transparent"),
    "--uk-navbar-nav-item-line-hover-opacity": value("navbarNavItemLineHoverOpacity", value("navbarNavItemLineOpacity", "0")),
    "--uk-navbar-nav-item-line-onclick-background": value("navbarNavItemLineOnclickBackground", "transparent"),
    "--uk-navbar-nav-item-line-onclick-opacity": value("navbarNavItemLineOnclickOpacity", value("navbarNavItemLineOpacity", "0")),
    "--uk-navbar-nav-item-line-active-background": value("navbarNavItemLineActiveBackground", "transparent"),
    "--uk-navbar-nav-item-line-active-opacity": value("navbarNavItemLineActiveOpacity", value("navbarNavItemLineOpacity", "0")),
    "--uk-navbar-parent-icon-margin-left": value("navbarParentIconMarginLeft", "4px"),
    "--uk-navbar-primary-nav-gap": value("navbarPrimaryNavGap", "0"),
    "--uk-navbar-primary-nav-gap-m": value("navbarPrimaryNavGapMedium", "0"),
    "--uk-navbar-primary-nav-item-font-family": value("navbarPrimaryNavItemFontFamily", value("fontFamilyBody", "inherit")),
    "--uk-navbar-primary-nav-item-font-style": value("navbarPrimaryNavItemFontStyle", "normal"),
    "--uk-navbar-primary-nav-item-font-weight": value("navbarPrimaryNavItemFontWeight", "400"),
    "--uk-navbar-primary-nav-item-letter-spacing": value("navbarPrimaryNavItemLetterSpacing", "0"),
    "--uk-navbar-primary-nav-item-padding-horizontal": value("navbarPrimaryNavItemPaddingHorizontal", "15px"),
    "--uk-navbar-primary-nav-item-padding-horizontal-m": value("navbarPrimaryNavItemPaddingHorizontalMedium", "30px"),
    "--uk-navbar-primary-nav-item-hover-color": value("navbarPrimaryNavItemHoverColor", primary),
    "--uk-navbar-primary-nav-item-onclick-color": value("navbarPrimaryNavItemOnclickColor", primary),
    "--uk-navbar-primary-nav-item-active-color": value("navbarPrimaryNavItemActiveColor", primary),
    "--uk-navbar-primary-item-padding-horizontal": value("navbarPrimaryItemPaddingHorizontal", "10px"),
    "--uk-navbar-primary-item-padding-horizontal-m": value("navbarPrimaryItemPaddingHorizontalMedium", "30px"),
    "--uk-navbar-primary-toggle-icon-width": value("navbarPrimaryToggleIconWidth", "26px"),
    "--uk-navbar-sticky-box-shadow": value("navbarStickyBoxShadow", "none"),
    "--uk-navbar-dropdown-box-shadow": value("navbarDropdownBoxShadow", "none"),

    // Shadows
    "--uk-global-box-shadow-small": value("shadowSmall", "0 2px 8px rgba(0, 0, 0, 0.06)"),
    "--uk-global-box-shadow-medium": value("shadowMedium", "0 8px 24px rgba(0, 0, 0, 0.08)"),
    "--uk-global-box-shadow-large": value("shadowLarge", "0 16px 40px rgba(0, 0, 0, 0.12)"),
    "--uk-global-box-shadow-xlarge": value("shadowXLarge", "0 24px 56px rgba(0, 0, 0, 0.14)"),
    "--uk-global-z-index": value("globalZIndex", "1000"),
    "--uk-breakpoint-small": value("breakpointSmall", "640px"),
    "--uk-breakpoint-medium": value("breakpointMedium", "960px"),
    "--uk-breakpoint-large": value("breakpointLarge", "1200px"),
    "--uk-breakpoint-xlarge": value("breakpointXLarge", "1600px"),
  };

  return vars;
}

/**
 * Returns a inline <style> tag payload for injecting UIkit globals into SSR head.
 */
export function getUikitGlobalsCssString(
  shellSettings?: Partial<BuilderShellSettings>,
  design?: Record<string, any>
): string {
  const vars = getUikitGlobalsCssVars(shellSettings, design);
  const rules = Object.entries(vars)
    .map(([key, val]) => `  ${key}: ${val};`)
    .join("\n");
  return `:root {\n${rules}\n}`;
}
