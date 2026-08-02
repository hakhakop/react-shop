import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { resolveHeaderBehavior, type HeaderBehavior } from "@/lib/headerBehavior";
import {
  normalizeHeaderCustomHeight,
  normalizeHeaderHeight,
} from "@/lib/headerHeight";
import {
  backupRootBuilderFileBeforeWrite,
  ensureRootBuilderData,
  getBuilderShellPath,
} from "@/lib/websiteBuilderData";

export type BuilderHeaderLayout =
  | "wordpress"
  | "simple"
  | "two-row"
  | "hero"
  | "pill"
  | "princity";
export type BuilderHeaderBrandMode = "logo" | "brand" | "both";
export type BuilderHeaderIconId =
  | "wishlist"
  | "cart"
  | "account"
  | "theme"
  | "search";
export type BuilderHeaderIconVariant = "muted" | "solid" | "ghost" | "icon";
export type BuilderHeaderActiveIndicator = "underline" | "princity" | "none";
export type BuilderHeaderBackgroundMode = "default" | "glass" | "accent" | "none";
export type BuilderHeaderTextMode = "auto" | "light" | "dark";

export type BuilderMenuPresentation = {
  showHeading: boolean;
  icon: string | null;
  submenuLayout: "list" | "grid" | "mega";
  submenuColumns: number;
  badgeText: string | null;
};

export type BuilderMenuPresentationMap = Record<string, BuilderMenuPresentation>;

export type ReactMenuItem = {
  id: string;
  label: string;
  url: string;
  parentId?: string | null;
};

export type BuilderShellSettings = {
  headerVisible: boolean;
  topToolbarVisible: boolean;
  topToolbarText: string;
  topToolbarPhone: string;
  topToolbarMeta: string;
  headerBackgroundMode: BuilderHeaderBackgroundMode;
  headerTextMode: BuilderHeaderTextMode;
  headerLayout: BuilderHeaderLayout;
  headerBrandMode: BuilderHeaderBrandMode;
  headerBrandText: string;
  headerLogoUrl: string | null;
  headerLogoAlt: string;
  headerLogoMaxWidth: number;
  headerButtonLabel: string;
  headerButtonUrl: string;
  headerIconVariant: BuilderHeaderIconVariant;
  headerIconOrder: BuilderHeaderIconId[];
  headerActiveIndicator: BuilderHeaderActiveIndicator;
  headerBehavior: HeaderBehavior;
  /** Legacy compatibility input. Header rendering uses headerBehavior. */
  headerSticky?: boolean;
  headerTransparent: boolean;
  headerOverlay: boolean;
  headerWidthMode: "boxed" | "full";
  headerHeight?: string;
  headerCustomHeight?: number;
  headerZIndex: number;
  sectionPaddingTop: BuilderSectionSpacing;
  sectionPaddingBottom: BuilderSectionSpacing;
  sectionMarginTop: BuilderSectionSpacing;
  sectionMarginBottom: BuilderSectionSpacing;
  rowPaddingTop: BuilderSectionSpacing;
  rowPaddingBottom: BuilderSectionSpacing;
  rowMarginTop: BuilderSectionSpacing;
  rowMarginBottom: BuilderSectionSpacing;
  rowGap: BuilderSectionSpacing;
  columnGap: BuilderSectionSpacing;
  elementPaddingTop: BuilderSectionSpacing;
  elementPaddingRight: BuilderSectionSpacing;
  elementPaddingBottom: BuilderSectionSpacing;
  elementPaddingLeft: BuilderSectionSpacing;
  elementMarginTop: BuilderSectionSpacing;
  elementMarginRight: BuilderSectionSpacing;
  elementMarginBottom: BuilderSectionSpacing;
  elementMarginLeft: BuilderSectionSpacing;
  menuPresentation: BuilderMenuPresentationMap;
  storefrontPreset: string;
  primaryColor: string;
  accentColor: string;
  secondaryColor?: string;
  mutedColor?: string;
  successColor?: string;
  warningColor?: string;
  dangerColor?: string;
  textColor?: string;
  backgroundColor?: string;
  fontFamilyBody?: string;
  fontFamilyHeading?: string;
  baseFontSize?: string;
  baseLineHeight?: string;
  headingFontWeight?: string;
  headingSmallFontSize?: string;
  headingMediumFontSize?: string;
  headingLargeFontSize?: string;
  headingXLargeFontSize?: string;
  smallTextFontSize?: string;
  largeTextFontSize?: string;
  emphasisColor?: string;
  mutedTextColor?: string;
  linkColor?: string;
  linkHoverColor?: string;
  mutedBackgroundColor?: string;
  borderWidth?: string;
  borderColor?: string;
  borderRadius?: string;
  shadowSmall?: string;
  shadowMedium?: string;
  shadowLarge?: string;
  shadowXLarge?: string;
  marginSmall?: string;
  marginDefault?: string;
  marginMedium?: string;
  marginLarge?: string;
  marginXLarge?: string;
  controlHeightSmall?: string;
  controlHeightLarge?: string;
  pageContainerMaxWidth?: string;
  cardPrimaryBackground?: string;
  cardSecondaryBackground?: string;
  buttonDefaultBackground?: string;
  buttonDefaultText?: string;
  buttonTextColorSemantic?: string;
  buttonHoverShadow?: string;
  buttonHoverGradient?: string;
  accordionTitleFontSize?: string;
  accordionTitleHoverColor?: string;
  accordionContentMarginTop?: string;
  accordionTitlePaddingVertical?: string;
  accordionIconColor?: string;
  accordionTitleFontWeight?: string;
  accordionTitleLetterSpacing?: string;
  accordionItemBorderWidth?: string;
  accordionItemBorder?: string;
  accordionItemBoxShadow?: string;
  buttonFontSize?: string;
  buttonFontFamily?: string;
  buttonFontStyle?: string;
  buttonLineHeight?: string;
  buttonTextTransform?: string;
  buttonBorderMode?: string;
  buttonBackgroundSize?: string;
  buttonBackgroundPosition?: string;
  buttonHoverBackgroundPosition?: string;
  buttonSmallFontSize?: string;
  buttonSmallLineHeight?: string;
  buttonSmallPaddingX?: string;
  buttonSmallRadius?: string;
  buttonLargeFontSize?: string;
  buttonLargeLineHeight?: string;
  buttonLargePaddingX?: string;
  buttonLargeRadius?: string;
  buttonDefaultHoverBackground?: string;
  buttonDefaultHoverText?: string;
  buttonDefaultBorder?: string;
  buttonDefaultHoverBorder?: string;
  buttonPrimaryHoverText?: string;
  buttonSecondaryHoverBackground?: string;
  buttonSecondaryHoverText?: string;
  buttonTextHoverColor?: string;
  buttonTransitionDuration?: string;
  buttonPrimaryGradient?: string;
  buttonPrimaryHoverGradient?: string;
  buttonPrimaryActiveGradient?: string;
  buttonSecondaryHoverGradient?: string;
  buttonSecondaryActiveGradient?: string;
  buttonDefaultShadow?: string;
  buttonDefaultHoverShadow?: string;
  buttonPrimaryShadow?: string;
  buttonPrimaryHoverShadow?: string;
  buttonSecondaryShadow?: string;
  buttonSecondaryHoverShadow?: string;
  buttonDefaultActiveBackground?: string;
  buttonDefaultActiveText?: string;
  buttonDefaultActiveBorder?: string;
  buttonDefaultActiveShadow?: string;
  buttonPrimaryHoverBorder?: string;
  buttonPrimaryActiveBackground?: string;
  buttonPrimaryActiveText?: string;
  buttonPrimaryActiveBorder?: string;
  buttonPrimaryActiveShadow?: string;
  buttonSecondaryBorder?: string;
  buttonSecondaryHoverBorder?: string;
  buttonSecondaryActiveBackground?: string;
  buttonSecondaryActiveText?: string;
  buttonSecondaryActiveBorder?: string;
  buttonSecondaryActiveShadow?: string;
  buttonDangerBackground?: string;
  buttonDangerText?: string;
  buttonDangerBorder?: string;
  buttonDangerHoverBackground?: string;
  buttonDangerHoverText?: string;
  buttonDangerHoverBorder?: string;
  buttonDangerHoverShadow?: string;
  buttonDangerActiveBackground?: string;
  buttonDangerActiveText?: string;
  buttonDangerActiveBorder?: string;
  buttonDangerActiveShadow?: string;
  buttonDisabledBackground?: string;
  buttonDisabledText?: string;
  buttonDisabledBorder?: string;
  buttonTextBackground?: string;
  buttonTextBorder?: string;
  buttonTextHoverBorder?: string;
  buttonTextActiveColor?: string;
  buttonLinkColor?: string;
  buttonLinkHoverColor?: string;
  buttonBackdropFilter?: string;
  cardDefaultHoverBackground?: string;
  cardPrimaryHoverBackground?: string;
  cardSecondaryHoverBackground?: string;
  cardDefaultText?: string;
  cardPrimaryText?: string;
  cardSecondaryText?: string;
  cardDefaultHoverText?: string;
  cardPrimaryHoverText?: string;
  cardSecondaryHoverText?: string;
  cardDefaultTitle?: string;
  cardPrimaryTitle?: string;
  cardSecondaryTitle?: string;
  cardDefaultHoverTitle?: string;
  cardPrimaryHoverTitle?: string;
  cardSecondaryHoverTitle?: string;
  cardDefaultBorder?: string;
  cardPrimaryBorder?: string;
  cardSecondaryBorder?: string;
  cardDefaultHoverBorder?: string;
  cardPrimaryHoverBorder?: string;
  cardSecondaryHoverBorder?: string;
  cardBorderWidth?: string;
  cardTransitionDuration?: string;
  cardImageBodySpacing?: string;
  cardTitleSpacing?: string;
  cardMetaSpacing?: string;
  cardHeaderSpacing?: string;
  cardFooterSpacing?: string;
  cardHoverShadow?: string;
  cardDefaultShadow?: string;
  cardDefaultHoverShadow?: string;
  cardPrimaryShadow?: string;
  cardPrimaryHoverShadow?: string;
  cardSecondaryShadow?: string;
  cardSecondaryHoverShadow?: string;
  cardPaddingSmall?: string;
  cardPaddingDefault?: string;
  cardPaddingLarge?: string;
  headingSmallFontSizeResponsive?: string;
  headingMediumFontSizeResponsive?: string;
  headingMediumLineHeight?: string;
  headingSmallFontWeight?: string;
  headingMediumFontWeight?: string;
  selectionBackground?: string;
  selectionColor?: string;
  baseInsBackground?: string;
  baseInsColor?: string;
  baseMarkBackground?: string;
  baseMarkColor?: string;
  globalStylePresetName?: string;
  globalStylePresetBackup?: { design?: Record<string, unknown>; shellSettings?: Record<string, unknown> };
  sectionPaddingSmall?: string;
  sectionPaddingDefault?: string;
  sectionPaddingMedium?: string;
  sectionPaddingLarge?: string;
  sectionPaddingXLarge?: string;
  gridGutterSmall?: string;
  gridGutterDefault?: string;
  gridGutterMedium?: string;
  gridGutterLarge?: string;
  containerSmall?: string;
  containerDefault?: string;
  containerLarge?: string;
  containerXLarge?: string;
  containerExpand?: boolean;
  cardBackground?: string;
  cardBorderRadius?: string;
  cardBorderColor?: string;
  cardShadow?: string;
  cardShadowHover?: string;
  buttonPrimaryBackground?: string;
  buttonPrimaryText?: string;
  buttonSecondaryBackground?: string;
  buttonSecondaryText?: string;
  buttonHeight?: string;
  buttonRadius?: string;
  productCardRadius: string;
  productCardBg: string;
  productCardShadow: string;
  productCardShadowHover: string;
  productCardMinHeight: string;
  productCardMaxWidth: string;
  productImageWidth: string;
  productImageHeight: string;
  productImageMaxWidth: string;
  productImageMaxHeight: string;
  productImageAspectRatio: string;
  productImageNoPadding: boolean;
  productImagePadding: string;
  productImageObjectFit: string;
  buttonBg: string;
  buttonTextColor: string;
  buttonBorderRadius: string;
  buttonBorderWidth: string;
  buttonBorderColor: string;
  buttonPaddingY: string;
  buttonPaddingX: string;
  buttonFontWeight: string;
  buttonLetterSpacing: string;
  buttonHoverBg: string;
  buttonHoverTextColor: string;
  buttonHoverBorderColor: string;
  buttonHoverEffect: "none" | "lift" | "grow";
  menuItems: ReactMenuItem[];
  updatedAt?: string;
};

export type BuilderSectionSpacing = string;

type BuilderShellScope = {
  websiteId?: string;
};

export const defaultBuilderShellSettings: BuilderShellSettings = {
  headerVisible: true,
  topToolbarVisible: true,
  topToolbarText: "Fast support & setup by Webpages",
  topToolbarPhone: "+374 xx xx xx",
  topToolbarMeta: "AMD ֏",
  headerBackgroundMode: "default",
  headerTextMode: "auto",
  headerLayout: "wordpress",
  headerBrandMode: "logo",
  headerBrandText: "WebPages",
  headerLogoUrl: null,
  headerLogoAlt: "Site logo",
  headerLogoMaxWidth: 160,
  headerButtonLabel: "Start",
  headerButtonUrl: "/client",
  headerIconVariant: "muted",
  headerIconOrder: ["wishlist", "cart", "account", "theme", "search"],
  headerActiveIndicator: "underline",
  headerBehavior: "sticky",
  headerTransparent: false,
  headerOverlay: false,
  headerWidthMode: "boxed",
  headerHeight: "comfortable",
  headerZIndex: 40,
  sectionPaddingTop: "lg",
  sectionPaddingBottom: "lg",
  sectionMarginTop: "none",
  sectionMarginBottom: "none",
  rowPaddingTop: "none",
  rowPaddingBottom: "none",
  rowMarginTop: "none",
  rowMarginBottom: "none",
  rowGap: "md",
  columnGap: "md",
  elementPaddingTop: "xs",
  elementPaddingRight: "xs",
  elementPaddingBottom: "xs",
  elementPaddingLeft: "xs",
  elementMarginTop: "none",
  elementMarginRight: "none",
  elementMarginBottom: "none",
  elementMarginLeft: "none",
  menuPresentation: {},
  storefrontPreset: "princity",
  primaryColor: "#111111",
  accentColor: "#111111",
  secondaryColor: "#64748b",
  mutedColor: "#f1f5f9",
  successColor: "#16a34a",
  warningColor: "#d97706",
  dangerColor: "#dc2626",
  textColor: "#111827",
  backgroundColor: "#ffffff",
  fontFamilyBody: "system-ui, -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif",
  fontFamilyHeading: "inherit",
  baseFontSize: "16px",
  baseLineHeight: "1.5",
  sectionPaddingSmall: "40px",
  sectionPaddingDefault: "70px",
  sectionPaddingMedium: "80px",
  sectionPaddingLarge: "100px",
  gridGutterSmall: "15px",
  gridGutterDefault: "30px",
  gridGutterLarge: "40px",
  containerSmall: "900px",
  containerDefault: "1200px",
  containerLarge: "1400px",
  containerXLarge: "1600px",
  containerExpand: false,
  cardBackground: "#ffffff",
  cardPrimaryBackground: "#1991ee",
  cardSecondaryBackground: "#0c273a",
  cardBorderRadius: "8px",
  cardBorderColor: "#e5e7eb",
  cardBorderWidth: "1px",
  cardShadow: "0 8px 24px rgba(0, 0, 0, 0.08)",
  cardShadowHover: "0 12px 30px rgba(0, 0, 0, 0.12)",
  cardDefaultHoverBackground: "#ffffff",
  cardPrimaryHoverBackground: "#1991ee",
  cardSecondaryHoverBackground: "#0c273a",
  cardDefaultText: "#6b7280",
  cardPrimaryText: "#ffffff",
  cardSecondaryText: "#ffffff",
  cardDefaultTitle: "#111827",
  cardPrimaryTitle: "#ffffff",
  cardSecondaryTitle: "#ffffff",
  cardDefaultBorder: "#e5e7eb",
  cardPrimaryBorder: "transparent",
  cardSecondaryBorder: "transparent",
  cardTransitionDuration: "0.1s",
  cardImageBodySpacing: "20px",
  cardTitleSpacing: "0px",
  cardMetaSpacing: "10px",
  cardHeaderSpacing: "20px",
  cardFooterSpacing: "20px",
  cardPaddingSmall: "15px",
  cardPaddingDefault: "30px",
  cardPaddingLarge: "40px",
  buttonPrimaryBackground: "#111111",
  buttonPrimaryText: "#ffffff",
  buttonSecondaryBackground: "#e5e7eb",
  buttonSecondaryText: "#111111",
  buttonHeight: "44px",
  buttonRadius: "8px",
  productCardRadius: "10px",
  productCardBg: "#ffffff",
  productCardShadow: "0 0 0 rgba(15, 23, 42, 0)",
  productCardShadowHover: "0 18px 40px rgba(15, 23, 42, 0.14)",
  productCardMinHeight: "0px",
  productCardMaxWidth: "100%",
  productImageWidth: "100%",
  productImageHeight: "260px",
  productImageMaxWidth: "100%",
  productImageMaxHeight: "100%",
  productImageAspectRatio: "auto",
  productImageNoPadding: false,
  productImagePadding: "clamp(22px, 2.4vw, 36px)",
  productImageObjectFit: "contain",
  buttonBg: "",
  buttonTextColor: "",
  buttonBorderRadius: "999px",
  buttonBorderWidth: "0px",
  buttonBorderColor: "transparent",
  buttonPaddingY: "11px",
  buttonPaddingX: "18px",
  buttonFontWeight: "720",
  buttonLetterSpacing: "0px",
  buttonHoverBg: "",
  buttonHoverTextColor: "",
  buttonHoverBorderColor: "transparent",
  buttonHoverEffect: "lift",
  menuItems: [
    { id: "home", label: "Home", url: "/" },
    { id: "shop", label: "Shop", url: "/shop" },
  ],
};

function normalizeHeaderLayout(value: unknown): BuilderHeaderLayout {
  return value === "simple" ||
    value === "two-row" ||
    value === "hero" ||
    value === "pill" ||
    value === "princity"
    ? value
    : "wordpress";
}

function normalizeHeaderBrandMode(value: unknown): BuilderHeaderBrandMode {
  return value === "brand" || value === "both" || value === "logo"
    ? value
    : "logo";
}

function normalizeHeaderIconVariant(value: unknown): BuilderHeaderIconVariant {
  return value === "solid" || value === "ghost" || value === "icon"
    ? value
    : "muted";
}

function normalizeHeaderActiveIndicator(
  value: unknown,
): BuilderHeaderActiveIndicator {
  return value === "princity" || value === "none" || value === "underline"
    ? value
    : "underline";
}

function normalizeHeaderBackgroundMode(
  value: unknown,
): BuilderHeaderBackgroundMode {
  return value === "none" || value === "glass" || value === "accent"
    ? value
    : "default";
}

function normalizeHeaderTextMode(value: unknown): BuilderHeaderTextMode {
  return value === "light" || value === "dark" ? value : "auto";
}

function normalizeHeaderIconOrder(value: unknown): BuilderHeaderIconId[] {
  const allowed = new Set<BuilderHeaderIconId>([
    "wishlist",
    "cart",
    "account",
    "theme",
    "search",
  ]);
  if (!Array.isArray(value)) {
    return defaultBuilderShellSettings.headerIconOrder;
  }

  const normalized = value.filter(
    (item): item is BuilderHeaderIconId =>
      typeof item === "string" && allowed.has(item as BuilderHeaderIconId),
  );

  return normalized.length > 0
    ? [...new Set(normalized)]
    : defaultBuilderShellSettings.headerIconOrder;
}

function normalizeOptionalString(value: unknown) {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : null;
}

function normalizeToolbarString(value: unknown, fallback: string) {
  return typeof value === "string" ? value.trim() : fallback;
}

function normalizeHeaderLogoMaxWidth(value: unknown) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue)
    ? Math.min(Math.max(Math.round(numberValue), 40), 360)
    : defaultBuilderShellSettings.headerLogoMaxWidth;
}

function normalizeSectionSpacing(value: unknown, fallback: BuilderSectionSpacing) {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : fallback;
}

function normalizeMenuPresentation(value: unknown): BuilderMenuPresentation {
  const raw = (value && typeof value === "object" ? value : {}) as Partial<
    BuilderMenuPresentation
  >;
  const submenuColumnsNumber = Number(raw.submenuColumns);

  return {
    showHeading: typeof raw.showHeading === "boolean" ? raw.showHeading : false,
    icon:
      typeof raw.icon === "string" && raw.icon.trim().length > 0
        ? raw.icon.trim()
        : null,
    submenuLayout:
      raw.submenuLayout === "grid" || raw.submenuLayout === "mega"
        ? raw.submenuLayout
        : "list",
    submenuColumns: Number.isFinite(submenuColumnsNumber)
      ? Math.min(Math.max(Math.round(submenuColumnsNumber), 1), 6)
      : 3,
    badgeText:
      typeof raw.badgeText === "string" && raw.badgeText.trim().length > 0
        ? raw.badgeText.trim()
        : null,
  };
}

function normalizeMenuPresentationMap(
  value: unknown
): BuilderMenuPresentationMap {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  const entries = Object.entries(value as Record<string, unknown>);
  const normalized: BuilderMenuPresentationMap = {};

  for (const [id, item] of entries) {
    if (typeof id !== "string" || id.trim().length === 0) continue;
    normalized[id] = normalizeMenuPresentation(item);
  }

  return normalized;
}

export function normalizeBuilderShellSettings(
  value: Partial<BuilderShellSettings> | null | undefined
): BuilderShellSettings {
  const allowedPresets = ["minimal", "soft", "elevated", "boutique", "princity"];
  const preset = typeof value?.storefrontPreset === "string" && allowedPresets.includes(value.storefrontPreset.trim().toLowerCase())
    ? value.storefrontPreset.trim().toLowerCase()
    : defaultBuilderShellSettings.storefrontPreset;

  return {
    ...defaultBuilderShellSettings,
    ...(value ?? {}),
    headerVisible:
      typeof value?.headerVisible === "boolean"
        ? value.headerVisible
        : defaultBuilderShellSettings.headerVisible,
    topToolbarVisible:
      typeof value?.topToolbarVisible === "boolean"
        ? value.topToolbarVisible
        : defaultBuilderShellSettings.topToolbarVisible,
    topToolbarText: normalizeToolbarString(
      value?.topToolbarText,
      defaultBuilderShellSettings.topToolbarText,
    ),
    topToolbarPhone: normalizeToolbarString(
      value?.topToolbarPhone,
      defaultBuilderShellSettings.topToolbarPhone,
    ),
    topToolbarMeta: normalizeToolbarString(
      value?.topToolbarMeta,
      defaultBuilderShellSettings.topToolbarMeta,
    ),
    headerBackgroundMode: normalizeHeaderBackgroundMode(
      value?.headerBackgroundMode,
    ),
    headerTextMode: normalizeHeaderTextMode(value?.headerTextMode),
    headerLayout: normalizeHeaderLayout(value?.headerLayout),
    headerBrandMode: normalizeHeaderBrandMode(value?.headerBrandMode),
    headerBrandText:
      normalizeOptionalString(value?.headerBrandText) ??
      defaultBuilderShellSettings.headerBrandText,
    headerLogoUrl: normalizeOptionalString(value?.headerLogoUrl),
    headerLogoAlt:
      normalizeOptionalString(value?.headerLogoAlt) ??
      defaultBuilderShellSettings.headerLogoAlt,
    headerLogoMaxWidth: normalizeHeaderLogoMaxWidth(value?.headerLogoMaxWidth),
    headerButtonLabel:
      normalizeOptionalString(value?.headerButtonLabel) ??
      defaultBuilderShellSettings.headerButtonLabel,
    headerButtonUrl:
      normalizeOptionalString(value?.headerButtonUrl) ??
      defaultBuilderShellSettings.headerButtonUrl,
    headerIconVariant: normalizeHeaderIconVariant(value?.headerIconVariant),
    headerIconOrder: normalizeHeaderIconOrder(value?.headerIconOrder),
    headerActiveIndicator: normalizeHeaderActiveIndicator(
      value?.headerActiveIndicator,
    ),
    headerBehavior: resolveHeaderBehavior(value ?? {}),
    headerTransparent: typeof value?.headerTransparent === "boolean" ? value.headerTransparent : false,
    headerOverlay: typeof value?.headerOverlay === "boolean" ? value.headerOverlay : false,
    headerWidthMode: value?.headerWidthMode === "full" ? "full" : "boxed",
    headerHeight: normalizeHeaderHeight(value?.headerHeight),
    headerCustomHeight: normalizeHeaderCustomHeight(value?.headerCustomHeight),
    headerZIndex: typeof value?.headerZIndex === "number" && Number.isFinite(value.headerZIndex)
      ? Math.max(0, Math.min(999, Math.round(value.headerZIndex)))
      : 40,
    sectionPaddingTop: normalizeSectionSpacing(
      value?.sectionPaddingTop,
      defaultBuilderShellSettings.sectionPaddingTop
    ),
    sectionPaddingBottom: normalizeSectionSpacing(
      value?.sectionPaddingBottom,
      defaultBuilderShellSettings.sectionPaddingBottom
    ),
    sectionMarginTop: normalizeSectionSpacing(
      value?.sectionMarginTop,
      defaultBuilderShellSettings.sectionMarginTop
    ),
    sectionMarginBottom: normalizeSectionSpacing(
      value?.sectionMarginBottom,
      defaultBuilderShellSettings.sectionMarginBottom
    ),
    rowPaddingTop: normalizeSectionSpacing(
      value?.rowPaddingTop,
      defaultBuilderShellSettings.rowPaddingTop
    ),
    rowPaddingBottom: normalizeSectionSpacing(
      value?.rowPaddingBottom,
      defaultBuilderShellSettings.rowPaddingBottom
    ),
    rowMarginTop: normalizeSectionSpacing(
      value?.rowMarginTop,
      defaultBuilderShellSettings.rowMarginTop
    ),
    rowMarginBottom: normalizeSectionSpacing(
      value?.rowMarginBottom,
      defaultBuilderShellSettings.rowMarginBottom
    ),
    rowGap: normalizeSectionSpacing(
      value?.rowGap,
      defaultBuilderShellSettings.rowGap
    ),
    columnGap: normalizeSectionSpacing(
      value?.columnGap,
      defaultBuilderShellSettings.columnGap
    ),
    elementPaddingTop: normalizeSectionSpacing(
      value?.elementPaddingTop,
      defaultBuilderShellSettings.elementPaddingTop
    ),
    elementPaddingRight: normalizeSectionSpacing(
      value?.elementPaddingRight,
      defaultBuilderShellSettings.elementPaddingRight
    ),
    elementPaddingBottom: normalizeSectionSpacing(
      value?.elementPaddingBottom,
      defaultBuilderShellSettings.elementPaddingBottom
    ),
    elementPaddingLeft: normalizeSectionSpacing(
      value?.elementPaddingLeft,
      defaultBuilderShellSettings.elementPaddingLeft
    ),
    elementMarginTop: normalizeSectionSpacing(
      value?.elementMarginTop,
      defaultBuilderShellSettings.elementMarginTop
    ),
    elementMarginRight: normalizeSectionSpacing(
      value?.elementMarginRight,
      defaultBuilderShellSettings.elementMarginRight
    ),
    elementMarginBottom: normalizeSectionSpacing(
      value?.elementMarginBottom,
      defaultBuilderShellSettings.elementMarginBottom
    ),
    elementMarginLeft: normalizeSectionSpacing(
      value?.elementMarginLeft,
      defaultBuilderShellSettings.elementMarginLeft
    ),
    menuPresentation: normalizeMenuPresentationMap(value?.menuPresentation),
    storefrontPreset: preset,
    primaryColor: typeof value?.primaryColor === "string" && value.primaryColor.trim().length > 0
      ? value.primaryColor.trim()
      : defaultBuilderShellSettings.primaryColor,
    accentColor: typeof value?.accentColor === "string" && value.accentColor.trim().length > 0
      ? value.accentColor.trim()
      : defaultBuilderShellSettings.accentColor,
    productCardRadius: normalizeSizeString(
      value?.productCardRadius,
      defaultBuilderShellSettings.productCardRadius
    ),
    productCardBg: normalizeColorString(
      value?.productCardBg,
      defaultBuilderShellSettings.productCardBg
    ),
    productCardShadow: normalizeOptionalString(value?.productCardShadow) ?? defaultBuilderShellSettings.productCardShadow,
    productCardShadowHover: normalizeOptionalString(value?.productCardShadowHover) ?? defaultBuilderShellSettings.productCardShadowHover,
    productCardMinHeight: normalizeSizeString(
      value?.productCardMinHeight,
      defaultBuilderShellSettings.productCardMinHeight
    ),
    productCardMaxWidth: normalizeSizeString(
      value?.productCardMaxWidth,
      defaultBuilderShellSettings.productCardMaxWidth
    ),
    productImageWidth: normalizeSizeString(
      value?.productImageWidth,
      defaultBuilderShellSettings.productImageWidth
    ),
    productImageHeight: normalizeSizeString(
      value?.productImageHeight,
      defaultBuilderShellSettings.productImageHeight
    ),
    productImageMaxWidth: normalizeSizeString(
      value?.productImageMaxWidth,
      defaultBuilderShellSettings.productImageMaxWidth
    ),
    productImageMaxHeight: normalizeSizeString(
      value?.productImageMaxHeight,
      defaultBuilderShellSettings.productImageMaxHeight
    ),
    productImageAspectRatio: normalizeAspectRatio(
      value?.productImageAspectRatio,
      defaultBuilderShellSettings.productImageAspectRatio
    ),
    productImageNoPadding: typeof value?.productImageNoPadding === "boolean"
      ? value.productImageNoPadding
      : defaultBuilderShellSettings.productImageNoPadding,
    productImagePadding: normalizeOptionalString(value?.productImagePadding) ?? defaultBuilderShellSettings.productImagePadding,
    productImageObjectFit: normalizeObjectFit(
      value?.productImageObjectFit,
      defaultBuilderShellSettings.productImageObjectFit
    ),
    buttonBg: normalizeColorString(value?.buttonBg, ""),
    buttonTextColor: normalizeColorString(value?.buttonTextColor, ""),
    buttonBorderRadius: normalizeSizeString(value?.buttonBorderRadius, defaultBuilderShellSettings.buttonBorderRadius),
    buttonBorderWidth: normalizeSizeString(value?.buttonBorderWidth, defaultBuilderShellSettings.buttonBorderWidth),
    buttonBorderColor: normalizeColorString(value?.buttonBorderColor, defaultBuilderShellSettings.buttonBorderColor),
    buttonPaddingY: normalizeSizeString(value?.buttonPaddingY, defaultBuilderShellSettings.buttonPaddingY),
    buttonPaddingX: normalizeSizeString(value?.buttonPaddingX, defaultBuilderShellSettings.buttonPaddingX),
    buttonFontWeight: typeof value?.buttonFontWeight === "string" ? value.buttonFontWeight.trim() : defaultBuilderShellSettings.buttonFontWeight,
    buttonLetterSpacing: typeof value?.buttonLetterSpacing === "string" ? value.buttonLetterSpacing.trim() : defaultBuilderShellSettings.buttonLetterSpacing,
    buttonHoverBg: normalizeColorString(value?.buttonHoverBg, ""),
    buttonHoverTextColor: normalizeColorString(value?.buttonHoverTextColor, ""),
    buttonHoverBorderColor: normalizeColorString(value?.buttonHoverBorderColor, defaultBuilderShellSettings.buttonHoverBorderColor),
    buttonHoverEffect: (value?.buttonHoverEffect === "none" || value?.buttonHoverEffect === "lift" || value?.buttonHoverEffect === "grow") ? value.buttonHoverEffect : defaultBuilderShellSettings.buttonHoverEffect,
    menuItems: normalizeMenuItems(value?.menuItems),
  };
}

function normalizeMenuItems(value: unknown): ReactMenuItem[] {
  if (!Array.isArray(value)) {
    return defaultBuilderShellSettings.menuItems;
  }

  const normalized: ReactMenuItem[] = [];

  for (const item of value) {
    if (!item || typeof item !== "object") continue;
    const raw = item as Record<string, unknown>;
    const id = typeof raw.id === "string" ? raw.id.trim() : "";
    const label = typeof raw.label === "string" ? raw.label.trim() : "";
    const url = typeof raw.url === "string" ? raw.url.trim() : "";
    const parentId = typeof raw.parentId === "string" ? raw.parentId.trim() : null;

    if (id && label) {
      normalized.push({
        id,
        label,
        url: url || "",
        parentId: parentId || null,
      });
    }
  }

  return normalized.length > 0 ? normalized : defaultBuilderShellSettings.menuItems;
}

function normalizeSizeString(value: unknown, fallback: string): string {
  if (value === undefined || value === null) return fallback;
  const raw = String(value).trim();
  if (!raw) return fallback;
  return /^\d+(\.\d+)?$/.test(raw) ? `${raw}px` : raw;
}

function normalizeColorString(value: unknown, fallback: string): string {
  if (value === undefined || value === null) return fallback;
  const raw = String(value).trim();
  if (!raw) return fallback;
  return raw.startsWith("#") || raw.startsWith("rgb") || raw.startsWith("hsl") || raw === "transparent" ? raw : fallback;
}

function normalizeAspectRatio(value: unknown, fallback: string): string {
  if (value === undefined || value === null) return fallback;
  const raw = String(value).trim();
  if (!raw) return fallback;
  const match = raw.match(/^(\d+)\s*[/:-]\s*(\d+)$/);
  if (match) {
    return `${match[1]} / ${match[2]}`;
  }
  return raw;
}

function normalizeObjectFit(value: unknown, fallback: string): string {
  if (value === undefined || value === null) return fallback;
  const raw = String(value).trim().toLowerCase();
  if (
    raw === "contain" ||
    raw === "cover" ||
    raw === "fill" ||
    raw === "none" ||
    raw === "scale-down"
  ) {
    return raw;
  }
  return fallback;
}

export async function getBuilderShellSettings(
  scope: BuilderShellScope = {},
): Promise<BuilderShellSettings> {
  try {
    if (!scope.websiteId) {
      await ensureRootBuilderData();
    }
    const filePath = getBuilderShellPath(scope.websiteId);
    console.log("[builder-scope] read builder-shell", {
      websiteId: scope.websiteId ?? null,
      filePath,
    });
    const raw = await readFile(filePath, "utf8");
    return normalizeBuilderShellSettings(JSON.parse(raw));
  } catch {
    return defaultBuilderShellSettings;
  }
}

export async function writeBuilderShellSettings(
  settings: BuilderShellSettings,
  scope: BuilderShellScope = {},
) {
  const filePath = getBuilderShellPath(scope.websiteId);
  console.log("[builder-scope] write builder-shell", {
    websiteId: scope.websiteId ?? null,
    filePath,
  });
  await mkdir(path.dirname(filePath), { recursive: true });
  if (!scope.websiteId) {
    await backupRootBuilderFileBeforeWrite("builder-shell.json");
  }
  await writeFile(
    filePath,
    `${JSON.stringify(
      {
        ...normalizeBuilderShellSettings(settings),
        updatedAt: new Date().toISOString(),
      },
      null,
      2
    )}\n`,
    "utf8"
  );
}
