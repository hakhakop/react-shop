/**
 * WebPages UIkit Globals Engine
 *
 * Canonical generator mapping WebPages Global Theme Settings directly to
 * root UIkit CSS custom properties and variables.
 */

import type { BuilderShellSettings } from "@/lib/builderShell";
import { resolveGlobalStyleToken } from "@/lib/globalStyleTokens";
import { fontFamilyStack } from "@/lib/webFonts";

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
  const primary = resolveGlobalStyleToken("primaryColor", shellSettings, design, "#111111").value;
  const accent = resolveGlobalStyleToken("accentColor", shellSettings, design, "#111111").value;
  const value = (key: string, fallback: string) =>
    resolveGlobalStyleToken(key, shellSettings, design, fallback).value;
  const globalRadius = value("borderRadius", design?.radius || "8px");
  const cardRadius = value("cardBorderRadius", shellSettings?.productCardRadius || globalRadius);
  const inheritedFamily = (family: string, fallback: string) => family.trim().toLowerCase() === "inherit" ? fallback : family;
  const bodyFamily = value("fontFamilyBody", "system-ui");
  const headingFamily = inheritedFamily(value("fontFamilyHeading", "inherit"), bodyFamily);
  const primaryFamily = inheritedFamily(value("fontFamilyPrimary", "inherit"), headingFamily);
  const secondaryFamily = inheritedFamily(value("fontFamilySecondary", "inherit"), bodyFamily);
  const tertiaryFamily = inheritedFamily(value("fontFamilyTertiary", "inherit"), bodyFamily);

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
    "--uk-section-padding-large": value("sectionPaddingLarge", "100px"),
    "--uk-section-padding-xlarge": value("sectionPaddingXLarge", "140px"),

    // Container max-widths
    "--uk-container-small-max-width": value("containerSmall", "900px"),
    "--uk-container-default-max-width": value("containerDefault", "1200px"),
    "--uk-container-large-max-width": value("containerLarge", "1400px"),
    "--uk-container-xlarge-max-width": value("containerXLarge", "1600px"),
    "--uk-container-expand-max-width": value("containerExpand", "none"),
    "--uk-page-container-max-width": value("pageContainerMaxWidth", value("containerXLarge", "1600px")),

    // Grid gutters
    "--uk-grid-gutter-small": value("gridGutterSmall", "15px"),
    "--uk-grid-gutter-medium": value("gridGutterMedium", value("gridGutterDefault", "30px")),
    "--uk-grid-gutter-large": value("gridGutterLarge", "40px"),

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
    "--uk-global-background-color": value("backgroundDefault", value("backgroundColor", "#ffffff")),
    // Canonical YOOtheme section background roles. The legacy field names stay
    // readable for existing saved documents, but sections resolve these roles.
    "--webpages-background-default": value("backgroundDefault", value("backgroundColor", "#ffffff")),
    "--webpages-background-muted": value("backgroundMuted", value("mutedBackgroundColor", "#f8fafc")),
    "--webpages-background-primary": value("backgroundPrimary", primary),
    "--webpages-background-secondary": value("backgroundSecondary", value("secondaryColor", "#64748b")),
    "--uikit-section-default-bg": value("backgroundDefault", value("backgroundColor", "#ffffff")),
    "--uikit-section-muted-bg": value("backgroundMuted", value("mutedBackgroundColor", "#f8fafc")),
    "--uikit-section-primary-bg": value("backgroundPrimary", primary),
    "--uikit-section-secondary-bg": value("backgroundSecondary", value("secondaryColor", "#64748b")),
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
    "--uk-heading-small-font-size": value("headingSmallFontSize", "30px"),
    "--uk-heading-medium-font-size": value("headingMediumFontSize", "34px"),
    "--uk-heading-large-font-size": value("headingLargeFontSize", "38px"),
    "--uk-heading-xlarge-font-size": value("headingXLargeFontSize", "44px"),
    "--uk-heading-small-font-size-responsive": value("headingSmallFontSizeResponsive", "54px"),
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
    "--uk-global-link-color": value("linkColor", primary),
    "--uk-global-link-hover-color": value("linkHoverColor", accent),
    "--uk-global-muted-background": value("backgroundMuted", value("mutedBackgroundColor", "#f8fafc")),
    "--uk-base-selection-background": value("selectionBackground", primary),
    "--uk-base-selection-color": value("selectionColor", "#fff"),
    "--uk-base-ins-background": value("baseInsBackground", "transparent"),
    "--uk-base-ins-color": value("baseInsColor", primary),
    "--uk-base-mark-background": value("baseMarkBackground", "transparent"),
    "--uk-base-mark-color": value("baseMarkColor", primary),
    "--uk-global-border-width": value("borderWidth", "1px"),
    "--uk-global-border-color": value("borderColor", "#e5e7eb"),
    "--uk-card-default-background": value("cardBackground", "#ffffff"),
    "--uk-card-primary-background": value("cardPrimaryBackground", primary),
    "--uk-card-secondary-background": value("cardSecondaryBackground", "#111827"),
    "--uk-card-muted-background": "#f8fafc",

    // Controls & Radii
    "--uk-global-border-radius": typeof globalRadius === "number" ? `${globalRadius}px` : globalRadius,
    "--uk-card-border-radius": typeof cardRadius === "number" ? `${cardRadius}px` : cardRadius,
    "--uk-button-border-radius": value("buttonRadius", cardRadius),
    "--uk-button-border-width": value("buttonBorderWidth", value("borderWidth", "1px")),
    "--uk-card-border-width": value("cardBorderWidth", value("borderWidth", "1px")),
    "--uk-card-border-color": value("cardBorderColor", "#e5e7eb"),
    "--uk-card-default-border": value("cardDefaultBorder", value("cardBorderColor", "#e5e7eb")),
    "--uk-card-primary-border": value("cardPrimaryBorder", "transparent"),
    "--uk-card-secondary-border": value("cardSecondaryBorder", "transparent"),
    "--uk-card-transition-duration": value("cardTransitionDuration", "0.1s"),
    "--uk-card-shadow": value("cardShadow", "0 8px 24px rgba(0,0,0,.08)"),
    "--uk-card-hover-shadow": value("cardHoverShadow", value("cardShadowHover", "0 8px 24px rgba(0,0,0,.08)")),
    "--uk-card-default-hover-background": value("cardDefaultHoverBackground", value("cardBackground", "#fff")),
    "--uk-card-primary-hover-background": value("cardPrimaryHoverBackground", primary),
    "--uk-card-secondary-hover-background": value("cardSecondaryHoverBackground", "#111827"),
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
    "--uk-card-primary-shadow": value("cardPrimaryShadow", value("cardShadow", "none")),
    "--uk-card-primary-hover-shadow": value("cardPrimaryHoverShadow", value("cardHoverShadow", "none")),
    "--uk-card-secondary-shadow": value("cardSecondaryShadow", value("cardShadow", "none")),
    "--uk-card-secondary-hover-shadow": value("cardSecondaryHoverShadow", value("cardHoverShadow", "none")),
    "--uk-card-padding-small": value("cardPaddingSmall", "15px"),
    "--uk-card-padding": value("cardPaddingDefault", "30px"),
    "--uk-card-padding-large": value("cardPaddingLarge", "40px"),
    "--uk-card-image-body-spacing": value("cardImageBodySpacing", "20px"),
    "--uk-card-title-spacing": value("cardTitleSpacing", "0px"),
    "--uk-card-meta-spacing": value("cardMetaSpacing", "10px"),
    "--uk-card-header-spacing": value("cardHeaderSpacing", "20px"),
    "--uk-card-footer-spacing": value("cardFooterSpacing", "20px"),
    "--uk-button-primary-background": value("buttonPrimaryBackground", primary),
    "--uk-button-primary-text": value("buttonPrimaryText", "#fff"),
    "--uk-button-primary-hover-background": value("buttonHoverBg", primary),
    "--uk-button-font-size": value("buttonFontSize", "15px"),
    "--uk-button-font-family": value("buttonFontFamily", "inherit"),
    "--uk-button-font-style": value("buttonFontStyle", "normal"),
    "--uk-button-font-weight": value("buttonFontWeight", "600"),
    "--uk-button-line-height": value("buttonLineHeight", value("buttonHeight", "48px")),
    "--uk-button-text-transform": value("buttonTextTransform", "uppercase"),
    "--uk-button-border-mode": value("buttonBorderMode", "solid"),
    "--uk-button-background-size": value("buttonBackgroundSize", "200%"),
    "--uk-button-background-position": value("buttonBackgroundPosition", "100%"),
    "--uk-button-hover-background-position": value("buttonHoverBackgroundPosition", "0%"),
    "--uk-button-small-font-size": value("buttonSmallFontSize", "14px"),
    "--uk-button-small-line-height": value("buttonSmallLineHeight", value("controlHeightSmall", "40px")),
    "--uk-button-small-padding-x": value("buttonSmallPaddingX", "20px"),
    "--uk-button-small-radius": value("buttonSmallRadius", value("buttonRadius", cardRadius)),
    "--uk-button-large-font-size": value("buttonLargeFontSize", value("baseFontSize", "16px")),
    "--uk-button-large-line-height": value("buttonLargeLineHeight", value("controlHeightLarge", "56px")),
    "--uk-button-large-padding-x": value("buttonLargePaddingX", value("gridGutterMedium", value("buttonPaddingX", "40px"))),
    "--uk-button-large-radius": value("buttonLargeRadius", value("buttonRadius", cardRadius)),
    "--uk-button-letter-spacing": value("buttonLetterSpacing", "0px"),
    "--uk-button-default-hover-background": value("buttonDefaultHoverBackground", value("buttonDefaultBackground", "#fff")),
    "--uk-button-default-hover-text": value("buttonDefaultHoverText", value("buttonDefaultText", "#111")),
    "--uk-button-default-border": value("buttonDefaultBorder", value("borderColor", "transparent")),
    "--uk-button-default-hover-border": value("buttonDefaultHoverBorder", value("buttonDefaultBorder", "#b2b2b2")),
    "--uk-button-default-active-background": value("buttonDefaultActiveBackground", value("buttonDefaultBackground", "#fff")),
    "--uk-button-default-active-text": value("buttonDefaultActiveText", value("buttonDefaultText", "#111")),
    "--uk-button-default-active-border": value("buttonDefaultActiveBorder", value("buttonDefaultBorder", "transparent")),
    "--uk-button-default-active-shadow": value("buttonDefaultActiveShadow", value("shadowSmall", "none")),
    "--uk-button-secondary-hover-background": value("buttonSecondaryHoverBackground", primary),
    "--uk-button-secondary-hover-text": value("buttonSecondaryHoverText", "#fff"),
    "--uk-button-secondary-border": value("buttonSecondaryBorder", primary),
    "--uk-button-secondary-hover-border": value("buttonSecondaryHoverBorder", primary),
    "--uk-button-secondary-active-background": value("buttonSecondaryActiveBackground", primary),
    "--uk-button-secondary-active-text": value("buttonSecondaryActiveText", "#fff"),
    "--uk-button-secondary-active-border": value("buttonSecondaryActiveBorder", primary),
    "--uk-button-secondary-active-shadow": value("buttonSecondaryActiveShadow", value("shadowSmall", "none")),
    "--uk-button-primary-hover-border": value("buttonPrimaryHoverBorder", "transparent"),
    "--uk-button-primary-hover-text": value("buttonPrimaryHoverText", value("buttonHoverTextColor", "#fff")),
    "--uk-button-primary-active-background": value("buttonPrimaryActiveBackground", primary),
    "--uk-button-primary-active-text": value("buttonPrimaryActiveText", "#fff"),
    "--uk-button-primary-active-border": value("buttonPrimaryActiveBorder", "transparent"),
    "--uk-button-primary-active-shadow": value("buttonPrimaryActiveShadow", value("shadowSmall", "none")),
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
    "--uk-button-text-background": value("buttonTextBackground", "transparent"),
    "--uk-button-text-hover-color": value("buttonTextHoverColor", primary),
    "--uk-button-text-border": value("buttonTextBorder", "transparent"),
    "--uk-button-text-hover-border": value("buttonTextHoverBorder", primary),
    "--uk-button-text-active-color": value("buttonTextActiveColor", primary),
    "--uk-button-link-color": value("buttonLinkColor", primary),
    "--uk-button-link-hover-color": value("buttonLinkHoverColor", primary),
    "--uk-button-backdrop-filter": value("buttonBackdropFilter", "none"),
    "--uk-button-transition-duration": value("buttonTransitionDuration", "0.2s"),
    "--uk-button-primary-gradient": value("buttonPrimaryGradient", "none"),
    "--uk-button-primary-hover-gradient": value("buttonPrimaryHoverGradient", value("buttonPrimaryGradient", "none")),
    "--uk-button-primary-active-gradient": value("buttonPrimaryActiveGradient", value("buttonPrimaryGradient", "none")),
    "--uk-button-secondary-hover-gradient": value("buttonSecondaryHoverGradient", "none"),
    "--uk-button-secondary-active-gradient": value("buttonSecondaryActiveGradient", "none"),
    "--uk-button-default-shadow": value("buttonDefaultShadow", value("shadowLarge", "none")),
    "--uk-button-default-hover-shadow": value("buttonDefaultHoverShadow", value("shadowMedium", "none")),
    "--uk-button-primary-shadow": value("buttonPrimaryShadow", value("shadowLarge", "none")),
    "--uk-button-primary-hover-shadow": value("buttonPrimaryHoverShadow", value("buttonHoverShadow", "none")),
    "--uk-button-secondary-shadow": value("buttonSecondaryShadow", "none"),
    "--uk-button-secondary-hover-shadow": value("buttonSecondaryHoverShadow", value("buttonHoverShadow", "none")),
    "--uk-button-default-background": value("buttonDefaultBackground", "#fff"),
    "--uk-button-default-text": value("buttonDefaultText", "#111"),
    "--uk-button-secondary-background": value("buttonSecondaryBackground", "#e5e7eb"),
    "--uk-button-secondary-text": value("buttonSecondaryText", "#111"),
    "--uk-button-text-color": value("buttonTextColorSemantic", primary),
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
