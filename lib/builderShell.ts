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

/**
 * The four editable UIkit/YOOtheme responsive tiers.  The base (phone
 * portrait) tier is intentionally implicit: it applies below `small`.
 *
 * This is only the canonical policy owner.  Consumers will be moved to this
 * policy in Phase 10 Batch 2; keeping validation here prevents the Global
 * Styles UI and importer from defining competing breakpoint rules.
 */
export type BuilderMenuPresentation = {
  showHeading: boolean;
  icon: string | null;
  submenuLayout: "list" | "grid" | "mega";
  submenuColumns: number;
  submenuWidth: string | null;
  mobileAccordion: boolean;
  badgeText: string | null;
};

export type BuilderMenuPresentationMap = Record<string, BuilderMenuPresentation>;

export type ReactMenuItem = {
  id: string;
  label: string;
  url: string;
  parentId?: string | null;
  iconName?: string | null;
  iconUrl?: string | null;
  subtitle?: string | null;
  mobileUrl?: string | null;
  target?: "_self" | "_blank";
  visibility?: "all" | "desktop" | "mobile";
};

/** A named, semantic Global Styles snapshot created from a YOOtheme import. */
export type BuilderCustomGlobalStylePreset = {
  id: string;
  name: string;
  shellSettings: Record<string, unknown>;
  design?: Record<string, unknown>;
  source: "yootheme-less";
  createdAt: string;
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
  headerBreakpoint?: string;
  headerMobileBreakpoint?: string;
  headerStickyShowOnUp?: boolean;
  headerStickyAnimation?: string;
  headerDropdownAlign?: "left" | "right" | "center";
  headerDropdownAlignToNavbar?: boolean;
  headerDropbarEnabled?: boolean;
  headerParentIconEnabled?: boolean;
  headerClickModeEnabled?: boolean;
  headerDialogTogglePosition?: string;
  headerDialogLayout?: string;
  headerDialogCenter?: boolean;
  headerDialogPushAfter?: number;
  headerSearchPosition?: string;
  headerSearchLayout?: string;
  headerSocialPosition?: string;
  headerMobileLogoUrl?: string | null;
  headerInverseLogoUrl?: string | null;
  headerMobileComposition?: "separate" | "responsive";
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
  /** Canonical YOOtheme semantic section backgrounds. */
  backgroundDefault?: string;
  backgroundMuted?: string;
  backgroundPrimary?: string;
  backgroundSecondary?: string;
  /** UIkit section color modes are global semantic context tokens. */
  sectionDefaultColorMode?: "light" | "dark";
  sectionMutedColorMode?: "light" | "dark";
  sectionPrimaryColorMode?: "light" | "dark";
  sectionSecondaryColorMode?: "light" | "dark";
  /** Optional semantic section background image/gradient layers. */
  backgroundDefaultImage?: string;
  backgroundMutedImage?: string;
  backgroundPrimaryImage?: string;
  backgroundSecondaryImage?: string;
  backgroundDefaultGradient?: string;
  backgroundPrimaryGradient?: string;
  textBackgroundGradient?: string;
  /** Legacy aliases retained only for document migration. */
  backgroundColor?: string;
  fontFamilyBody?: string;
  fontFamilyHeading?: string;
  fontFamilyPrimary?: string;
  fontStylePrimary?: string;
  fontWeightPrimary?: string;
  letterSpacingPrimary?: string;
  textTransformPrimary?: string;
  fontFamilySecondary?: string;
  fontStyleSecondary?: string;
  fontWeightSecondary?: string;
  letterSpacingSecondary?: string;
  textTransformSecondary?: string;
  fontFamilyTertiary?: string;
  fontStyleTertiary?: string;
  fontWeightTertiary?: string;
  letterSpacingTertiary?: string;
  textTransformTertiary?: string;
  baseFontSize?: string;
  baseLineHeight?: string;
  fontSizeSmall?: string;
  fontSizeMedium?: string;
  fontSizeLarge?: string;
  fontSizeXLarge?: string;
  fontSize2XLarge?: string;
  visibilityDesktop?: boolean;
  visibilityTablet?: boolean;
  visibilityMobile?: boolean;
  headingFontWeight?: string;
  headingH3FontSize?: string;
  headingH1FontSize?: string;
  headingH1FontWeight?: string;
  headingSmallFontSize?: string;
  headingMediumFontSize?: string;
  headingLargeFontSize?: string;
  headingXLargeFontSize?: string;
  smallTextFontSize?: string;
  largeTextFontSize?: string;
  emphasisColor?: string;
  inverseColor?: string;
  inverseTextColor?: string;
  inverseEmphasisColor?: string;
  inverseMutedTextColor?: string;
  inverseLinkColor?: string;
  inverseLinkHoverColor?: string;
  inverseBorderColor?: string;
  inverseInverseColor?: string;
  inversePrimaryBackground?: string;
  inverseMutedBackground?: string;
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
  controlHeightDefault?: string;
  controlHeightLarge?: string;
  globalZIndex?: string;
  breakpointSmall?: string;
  breakpointMedium?: string;
  breakpointLarge?: string;
  breakpointXLarge?: string;
  pageContainerMaxWidth?: string;
  cardPrimaryBackground?: string;
  cardSecondaryBackground?: string;
  buttonDefaultBackground?: string;
  buttonDefaultText?: string;
  /**
   * Records whether a YOOtheme LESS Button token was explicitly authored or
   * intentionally inherited. This prevents historic WebPages defaults from
   * masquerading as a YOOtheme component override after a style import.
   */
  buttonTokenInheritance?: Record<string, "authored" | "inherit">;
  buttonTextColorSemantic?: string;
  buttonHoverShadow?: string;
  buttonHoverGradient?: string;
  accordionTitleFontSize?: string;
  accordionTitleLineHeight?: string;
  accordionTitleHoverColor?: string;
  accordionContentMarginTop?: string;
  accordionTitlePaddingVertical?: string;
  accordionIconColor?: string;
  accordionTitleFontWeight?: string;
  accordionTitleLetterSpacing?: string;
  accordionItemBorderWidth?: string;
  accordionItemBorder?: string;
  accordionItemBoxShadow?: string;
  /** Canonical UIkit/YOOtheme Nav presentation tokens. */
  navDividerMarginVertical?: string;
  navDividerMarginHorizontal?: string;
  navLargeFontSize?: string;
  navLargeFontSizeL?: string;
  navLargeFontSizeM?: string;
  navLargeLineHeight?: string;
  navMediumFontSize?: string;
  navMediumFontSizeL?: string;
  navMediumFontSizeM?: string;
  navMediumLineHeight?: string;
  navXLargeFontSize?: string;
  navXLargeFontSizeL?: string;
  navXLargeFontSizeM?: string;
  navXLargeLineHeight?: string;
  navItemPaddingHorizontal?: string;
  navItemPaddingVertical?: string;
  navSublistDeeperPaddingLeft?: string;
  navSublistItemPaddingVertical?: string;
  navSublistPaddingLeft?: string;
  navSublistPaddingVertical?: string;
  navParentIconMarginLeft?: string;
  navDefaultFontSize?: string;
  navDefaultFontFamily?: string;
  navDefaultFontStyle?: string;
  navDefaultFontWeight?: string;
  navDefaultLetterSpacing?: string;
  navDefaultLineHeight?: string;
  navDefaultTextTransform?: string;
  navDefaultItemColor?: string;
  navDefaultItemHoverColor?: string;
  navDefaultItemActiveColor?: string;
  navDefaultSubtitleFontSize?: string;
  navDefaultSubtitleColor?: string;
  navDefaultSubtitleFontWeight?: string;
  navDefaultHeaderColor?: string;
  navDefaultSublistItemHoverColor?: string;
  navDefaultSublistItemActiveColor?: string;
  navDefaultDividerBoxShadow?: string;
  navDefaultDividerBorder?: string;
  navDefaultDividerBorderWidth?: string;
  navDefaultItemPaddingHorizontal?: string;
  navDefaultItemPaddingVertical?: string;
  navDefaultItemBorderRadius?: string;
  navDefaultItemHoverBackground?: string;
  navDefaultItemHoverBoxShadow?: string;
  navDefaultItemActiveBackground?: string;
  navDefaultItemLineBackground?: string;
  navDefaultItemLineBottom?: string;
  navDefaultItemLineHeight?: string;
  navDefaultItemLineLeft?: string;
  navDefaultItemLineRight?: string;
  navDefaultItemLineTransitionDuration?: string;
  navDefaultItemLineTransitionTimingFunction?: string;
  navDefaultItemLineHoverLeft?: string;
  navDefaultItemLineHoverRight?: string;
  navDefaultSiblingsFilter?: string;
  navDefaultSiblingsOpacity?: string;
  /** Canonical UIkit/YOOtheme Subnav pill tokens. */
  subnavPillItemPaddingVertical?: string;
  subnavPillItemPaddingHorizontal?: string;
  subnavPillItemColor?: string;
  subnavPillItemHoverBackground?: string;
  subnavPillItemHoverColor?: string;
  subnavPillItemOnclickBackground?: string;
  subnavPillItemOnclickColor?: string;
  subnavPillItemActiveBackground?: string;
  subnavPillItemActiveColor?: string;
  subnavPillItemBorderRadius?: string;
  subnavPillItemActiveBoxShadow?: string;
  internalSubnavPillItemMode?: string;
  internalSubnavPillItemGlowGradient?: string;
  internalSubnavPillItemGlowFilter?: string;
  internalSubnavPillItemGlowOpacity?: string;
  internalSubnavPillItemHoverGlowOpacity?: string;
  navPrimaryItemColor?: string;
  navPrimaryItemHoverColor?: string;
  navPrimaryItemActiveColor?: string;
  navPrimarySubtitleFontSize?: string;
  navPrimarySubtitleColor?: string;
  navPrimarySubtitleFontWeight?: string;
  navPrimaryHeaderColor?: string;
  navPrimarySublistItemHoverColor?: string;
  navPrimarySublistItemActiveColor?: string;
  navPrimaryDividerBoxShadow?: string;
  navPrimaryDividerBorder?: string;
  navPrimaryDividerBorderWidth?: string;
  navPrimaryItemPaddingHorizontal?: string;
  navPrimaryItemPaddingVertical?: string;
  navPrimaryItemBorderRadius?: string;
  navPrimaryItemHoverBackground?: string;
  navPrimaryItemHoverBoxShadow?: string;
  navPrimaryItemActiveBackground?: string;
  navPrimaryItemLineBackground?: string;
  navPrimaryItemLineBottom?: string;
  navPrimaryItemLineHeight?: string;
  navPrimaryItemLineLeft?: string;
  navPrimaryItemLineRight?: string;
  navPrimaryItemLineTransitionDuration?: string;
  navPrimaryItemLineTransitionTimingFunction?: string;
  navPrimaryItemLineHoverLeft?: string;
  navPrimaryItemLineHoverRight?: string;
  navPrimarySiblingsFilter?: string;
  navPrimarySiblingsOpacity?: string;
  navSecondaryLineHeight?: string;
  navSecondaryItemHoverColor?: string;
  navSecondaryItemActiveColor?: string;
  navSecondarySubtitleActiveColor?: string;
  navSecondarySublistFontSize?: string;
  navSecondarySublistItemHoverColor?: string;
  navSecondarySublistItemActiveColor?: string;
  navSecondarySubtitleFontWeight?: string;
  navSecondaryMarginTop?: string;
  navSecondaryItemPaddingVertical?: string;
  navSecondaryItemPaddingHorizontal?: string;
  navSecondaryItemHoverBackground?: string;
  navSecondaryItemActiveBackground?: string;
  navSecondaryItemBorderRadius?: string;
  navSecondaryFontFamily?: string;
  navSecondaryFontSize?: string;
  navSecondaryFontStyle?: string;
  navSecondaryFontWeight?: string;
  navSecondaryLetterSpacing?: string;
  navSecondaryTextTransform?: string;
  navSecondaryItemColor?: string;
  navSecondarySubtitleColor?: string;
  navSecondaryHeaderColor?: string;
  navSecondaryDividerBorder?: string;
  navSecondaryDividerBorderWidth?: string;
  navSecondaryDividerBoxShadow?: string;
  navSecondaryItemHoverBoxShadow?: string;
  navSecondaryItemActiveBoxShadow?: string;
  navSecondarySiblingsFilter?: string;
  navSecondarySiblingsOpacity?: string;
  navHeaderFontSize?: string;
  navHeaderFontWeight?: string;
  navHeaderLetterSpacing?: string;
  navHeaderMarginTop?: string;
  navHeaderPaddingHorizontal?: string;
  navHeaderPaddingVertical?: string;
  navHeaderTextTransform?: string;
  navMediumFontSizeResponsive?: string;
  navDividersMarginTop?: string;
  navDividersBoxShadow?: string;
  inverseNavSecondarySubtitleHoverColor?: string;
  inverseNavBackgroundItemHoverBackground?: string;
  inverseNavBackgroundItemActiveBackground?: string;
  inverseNavSecondaryItemHoverBackground?: string;
  inverseNavSecondaryItemActiveBackground?: string;
  /** Canonical UIkit/YOOtheme Navbar presentation tokens. */
  navbarBackground?: string;
  navbarGap?: string;
  navbarGapMedium?: string;
  navbarNavGap?: string;
  navbarNavGapMedium?: string;
  navbarNavItemHeight?: string;
  navbarNavItemPaddingHorizontal?: string;
  navbarNavItemPaddingHorizontalMedium?: string;
  navbarNavItemColor?: string;
  navbarNavItemHoverColor?: string;
  navbarNavItemOnclickColor?: string;
  navbarNavItemActiveColor?: string;
  navbarNavItemHoverBackground?: string;
  navbarNavItemActiveBackground?: string;
  navbarNavItemHoverTextShadow?: string;
  navbarNavItemActiveTextShadow?: string;
  navbarNavItemHoverBoxShadow?: string;
  navbarNavItemActiveBoxShadow?: string;
  navbarNavItemFontSize?: string;
  navbarNavItemFontFamily?: string;
  navbarNavItemFontStyle?: string;
  navbarNavItemFontWeight?: string;
  navbarNavItemLetterSpacing?: string;
  navbarNavItemTransitionDuration?: string;
  navbarNavItemTextTransform?: string;
  navbarPaddingTop?: string;
  navbarPaddingBottom?: string;
  navbarPaddingTopMedium?: string;
  navbarPaddingBottomMedium?: string;
  navbarPrimaryNavItemFontSize?: string;
  navbarToggleColor?: string;
  navbarToggleHoverColor?: string;
  navbarSubtitleFontSize?: string;
  navbarSubtitleColor?: string;
  navbarItemPaddingHorizontal?: string;
  navbarItemPaddingHorizontalMedium?: string;
  navbarBackdropFilter?: string;
  navbarMode?: string;
  /** UIkit Navbar vertical divider mode: none, partial, or all. */
  navbarModeBorderVertical?: "none" | "partial" | "all" | string;
  navbarBorderWidth?: string;
  navbarBorder?: string;
  navbarNavItemLineMode?: string;
  navbarNavItemLinePositionMode?: string;
  navbarNavItemLineSlideMode?: string;
  navbarNavItemLineHeight?: string;
  navbarNavItemLineTransitionDuration?: string;
  navbarNavItemLineHoverHeight?: string;
  navbarNavItemLineOnclickHeight?: string;
  navbarNavItemLineActiveHeight?: string;
  navbarNavItemLineOpacity?: string;
  navbarNavItemLineGradient?: string;
  navbarNavItemLineBorderRadius?: string;
  navbarNavItemLineMarginHorizontal?: string;
  navbarNavItemLineMarginVertical?: string;
  navbarNavItemLineHoverBackground?: string;
  navbarNavItemLineHoverOpacity?: string;
  navbarNavItemLineOnclickBackground?: string;
  navbarNavItemLineOnclickOpacity?: string;
  navbarNavItemLineActiveBackground?: string;
  navbarNavItemLineActiveOpacity?: string;
  navbarParentIconMarginLeft?: string;
  navbarPrimaryNavGap?: string;
  navbarPrimaryNavGapMedium?: string;
  navbarPrimaryNavItemFontFamily?: string;
  navbarPrimaryNavItemFontStyle?: string;
  navbarPrimaryNavItemFontWeight?: string;
  navbarPrimaryNavItemLetterSpacing?: string;
  navbarPrimaryNavItemPaddingHorizontal?: string;
  navbarPrimaryNavItemPaddingHorizontalMedium?: string;
  navbarPrimaryNavItemHoverColor?: string;
  navbarPrimaryNavItemOnclickColor?: string;
  navbarPrimaryNavItemActiveColor?: string;
  navbarPrimaryItemPaddingHorizontal?: string;
  navbarPrimaryItemPaddingHorizontalMedium?: string;
  navbarPrimaryToggleIconWidth?: string;
  navbarStickyBoxShadow?: string;
  /** Visual marker shown after top-level navbar items that own a dropdown. */
  navbarDropdownIndicator?: "none" | "chevron" | string;
  navbarDropdownMargin?: string;
  navbarDropdownShiftMargin?: string;
  navbarDropdownWidth?: string;
  navbarDropdownPadding?: string;
  navbarDropdownBackground?: string;
  navbarDropdownColor?: string;
  navbarDropdownColorMode?: string;
  navbarDropdownBorderWidth?: string;
  navbarDropdownBorder?: string;
  navbarDropdownViewportMargin?: string;
  navbarDropdownFocusOutline?: string;
  navbarDropdownLargeShiftMargin?: string;
  navbarDropdownLargePadding?: string;
  navbarDropdownLargeShiftMarginMedium?: string;
  navbarDropdownDropbarShiftMargin?: string;
  navbarDropdownDropbarPaddingTop?: string;
  navbarDropdownDropbarPaddingBottom?: string;
  navbarDropdownDropbarViewportMargin?: string;
  navbarDropdownDropbarViewportMarginMedium?: string;
  navbarDropdownDropbarViewportMarginSmall?: string;
  navbarDropdownDropbarLargeShiftMargin?: string;
  navbarDropdownDropbarLargePaddingTop?: string;
  navbarDropdownDropbarLargePaddingBottom?: string;
  navbarDropdownDropbarLargeShiftMarginMedium?: string;
  navbarDropdownGridGutterHorizontal?: string;
  navbarDropdownGridGutterVertical?: string;
  navbarDropdownNavItemColor?: string;
  navbarDropdownNavItemHoverColor?: string;
  navbarDropdownNavItemActiveColor?: string;
  navbarDropdownNavSubtitleFontSize?: string;
  navbarDropdownNavSubtitleColor?: string;
  navbarDropdownNavSublistItemHoverColor?: string;
  navbarDropdownNavSublistItemActiveColor?: string;
  navbarDropdownNavItemPaddingVertical?: string;
  navbarDropdownNavItemPaddingHorizontal?: string;
  navbarDropdownNavItemBorderRadius?: string;
  navbarDropdownNavItemHoverBackground?: string;
  navbarDropdownNavItemActiveBackground?: string;
  navbarDropdownNavFontFamily?: string;
  navbarDropdownNavFontStyle?: string;
  navbarDropdownNavFontWeight?: string;
  navbarDropdownNavLetterSpacing?: string;
  navbarDropdownNavLineHeight?: string;
  navbarDropdownNavTextTransform?: string;
  navbarDropdownNavHeaderColor?: string;
  navbarDropdownNavDividerBorder?: string;
  navbarDropdownNavDividerBorderWidth?: string;
  navbarDropdownNavDividerMarginVertical?: string;
  navbarDropdownNavSublistItemColor?: string;
  navbarDropdownNavSublistPaddingLeft?: string;
  navbarDropdownNavFontSize?: string;
  navbarDropdownBorderRadius?: string;
  navbarDropdownBoxShadow?: string;
  navbarDropdownShiftMarginMedium?: string;
  navbarDropdownDropbarShiftMarginMedium?: string;
  inverseNavbarNavItemHoverColor?: string;
  /** Canonical UIkit/YOOtheme Alert presentation tokens. */
  alertBackground?: string;
  alertColor?: string;
  alertBorderRadius?: string;
  alertPrimaryBackground?: string;
  alertPrimaryColor?: string;
  alertSuccessBackground?: string;
  alertSuccessColor?: string;
  alertWarningBackground?: string;
  alertWarningColor?: string;
  alertDangerBackground?: string;
  alertDangerColor?: string;
  buttonFontSize?: string;
  buttonFontFamily?: string;
  buttonFontStyle?: string;
  buttonLineHeight?: string;
  buttonTextTransform?: string;
  paginationMarginHorizontal?: string;
  paginationItemPaddingVertical?: string;
  paginationItemPaddingHorizontal?: string;
  paginationItemColor?: string;
  paginationItemHoverColor?: string;
  paginationItemActiveColor?: string;
  paginationItemMinWidth?: string;
  paginationItemHeight?: string;
  paginationItemHoverBackground?: string;
  paginationItemActiveBackground?: string;
  paginationItemBorderWidth?: string;
  paginationItemBorderRadius?: string;
  paginationItemHoverBoxShadow?: string;
  paginationItemActiveBoxShadow?: string;
  paginationItemMode?: string;
  paginationItemGlowGradient?: string;
  paginationItemGlowFilter?: string;
  paginationItemGlowOpacity?: string;
  inversePaginationItemHoverBackground?: string;
  inversePaginationItemActiveBackground?: string;
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
  buttonDefaultMode?: string;
  buttonDefaultGlowGradient?: string;
  buttonDefaultGlowFilter?: string;
  buttonDefaultHoverGlowFilter?: string;
  buttonPrimaryMode?: string;
  buttonPrimaryGlowGradient?: string;
  buttonPrimaryGlowFilter?: string;
  buttonPrimaryHoverGlowFilter?: string;
  buttonSecondaryMode?: string;
  buttonSecondaryGlowGradient?: string;
  buttonSecondaryGlowFilter?: string;
  buttonSecondaryHoverGlowFilter?: string;
  themeBoxDecorationBorderRadius?: string;
  themeBoxDecorationDefaultGradient?: string;
  themeBoxDecorationPrimaryGlowFilter?: string;
  themeBoxDecorationPrimaryGlowGradient?: string;
  themeBoxDecorationPrimaryBackground?: string;
  themeBoxDecorationPrimaryBorder?: string;
  themeBoxDecorationSecondaryGlowFilter?: string;
  themeBoxDecorationSecondaryBackground?: string;
  themeBoxDecorationSecondaryBorder?: string;
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
  /** Imported UIkit/YOOtheme Button tokens used only on inverse surfaces. */
  buttonInverseDefaultShadow?: string;
  buttonInverseDefaultBackground?: string;
  buttonInverseDefaultText?: string;
  buttonInverseDefaultHoverBackground?: string;
  buttonInverseDefaultHoverText?: string;
  buttonInverseDefaultActiveBackground?: string;
  buttonInverseDefaultActiveText?: string;
  buttonInverseDefaultBorder?: string;
  buttonInverseDefaultHoverBorder?: string;
  buttonInverseDefaultActiveBorder?: string;
  buttonInversePrimaryShadow?: string;
  buttonInverseSecondaryBackground?: string;
  buttonInverseSecondaryText?: string;
  buttonInverseSecondaryHoverBackground?: string;
  buttonInverseSecondaryActiveBackground?: string;
  buttonInverseSecondaryBorder?: string;
  buttonInverseSecondaryHoverText?: string;
  buttonInverseSecondaryActiveText?: string;
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
  /** Shared Card hover movement. YOOtheme's DevStack surface uses a pressed 3px offset. */
  cardHoverTransform?: string;
  cardDefaultShadow?: string;
  cardDefaultHoverShadow?: string;
  cardPrimaryShadow?: string;
  cardPrimaryHoverShadow?: string;
  cardSecondaryShadow?: string;
  cardSecondaryHoverShadow?: string;
  cardPaddingSmall?: string;
  cardPaddingDefault?: string;
  cardPaddingLarge?: string;
  /** Global defaults consumed by the canonical Image capability. */
  imageDefaultRatio?: string;
  imageDefaultFit?: string;
  /** Version 3 distinguishes the historic implicit-cover default from an explicit choice. */
  imageMediaDefaultsVersion?: 2 | 3;
  imageDefaultLoading?: string;
  imageDefaultBorder?: string;
  imageDefaultShadow?: string;
  imageDefaultAlignment?: string;
  /** Global defaults consumed by the canonical Slider navigation capability. */
  sliderArrowStyle?: string;
  sliderArrowPosition?: string;
  sliderDotnavStyle?: string;
  sliderDotnavPosition?: string;
  headingSmallFontSizeResponsive?: string;
  headingSmallLineHeight?: string;
  headingLargeLineHeight?: string;
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
  customGlobalStylePresets?: BuilderCustomGlobalStylePreset[];
  sectionPaddingXSmall?: string;
  sectionPaddingSmall?: string;
  sectionPaddingDefault?: string;
  sectionPaddingDefaultMedium?: string;
  sectionPaddingMedium?: string;
  sectionPaddingLarge?: string;
  sectionPaddingLargeMedium?: string;
  sectionPaddingXLarge?: string;
  sectionPaddingXLargeMedium?: string;
  gridGutterSmall?: string;
  gridGutterDefault?: string;
  gridGutterMedium?: string;
  gridGutterLarge?: string;
  containerSmall?: string;
  containerXSmall?: string;
  containerDefault?: string;
  containerLarge?: string;
  containerXLarge?: string;
  containerPaddingHorizontal?: string;
  containerPaddingHorizontalSmall?: string;
  containerPaddingHorizontalMedium?: string;
  containerExpand?: boolean;
  cardBackground?: string;
  cardBackdropFilter?: string;
  cardDefaultColorMode?: "light" | "dark";
  overlayDefaultBackground?: string;
  overlayDefaultBackdropFilter?: string;
  overlayPrimaryBackground?: string;
  overlayPrimaryBackdropFilter?: string;
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
  backgroundDefault: "#ffffff",
  backgroundMuted: "#f8fafc",
  backgroundPrimary: "#111111",
  backgroundSecondary: "#64748b",
  sectionDefaultColorMode: "light",
  sectionMutedColorMode: "light",
  sectionPrimaryColorMode: "light",
  sectionSecondaryColorMode: "light",
  backgroundColor: "#ffffff",
  fontFamilyBody: "system-ui, -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif",
  fontFamilyHeading: "inherit",
  fontFamilyPrimary: "inherit",
  fontStylePrimary: "inherit",
  fontWeightPrimary: "700",
  letterSpacingPrimary: "inherit",
  textTransformPrimary: "inherit",
  fontFamilySecondary: "inherit",
  fontStyleSecondary: "inherit",
  fontWeightSecondary: "400",
  letterSpacingSecondary: "inherit",
  textTransformSecondary: "inherit",
  fontFamilyTertiary: "inherit",
  fontStyleTertiary: "inherit",
  fontWeightTertiary: "400",
  letterSpacingTertiary: "inherit",
  textTransformTertiary: "inherit",
  baseFontSize: "16px",
  baseLineHeight: "1.5",
  fontSizeSmall: "14px",
  fontSizeMedium: "20px",
  fontSizeLarge: "24px",
  fontSizeXLarge: "34px",
  fontSize2XLarge: "44px",
  headingSmallLineHeight: "1.2",
  headingLargeLineHeight: "1.1",
  headingMediumLineHeight: "1.2",
  inverseColor: "#ffffff",
  controlHeightDefault: "48px",
  globalZIndex: "1000",
  breakpointSmall: "640px",
  breakpointMedium: "960px",
  breakpointLarge: "1200px",
  breakpointXLarge: "1600px",
  visibilityDesktop: true,
  visibilityTablet: true,
  visibilityMobile: true,
  sectionPaddingSmall: "40px",
  sectionPaddingDefault: "40px",
  sectionPaddingDefaultMedium: "70px",
  sectionPaddingMedium: "80px",
  sectionPaddingLarge: "70px",
  sectionPaddingLargeMedium: "140px",
  sectionPaddingXSmall: "20px",
  sectionPaddingXLarge: "140px",
  sectionPaddingXLargeMedium: "210px",
  gridGutterSmall: "15px",
  gridGutterDefault: "30px",
  gridGutterLarge: "40px",
  containerSmall: "900px",
  containerXSmall: "750px",
  containerDefault: "1200px",
  containerLarge: "1400px",
  containerXLarge: "1600px",
  containerPaddingHorizontal: "15px",
  containerPaddingHorizontalSmall: "30px",
  containerPaddingHorizontalMedium: "40px",
  containerExpand: false,
  cardBackground: "#ffffff",
  cardBackdropFilter: "none",
  cardDefaultColorMode: "dark",
  overlayDefaultBackground: "rgba(255, 255, 255, 0.9)",
  overlayDefaultBackdropFilter: "none",
  overlayPrimaryBackground: "rgba(34, 34, 34, 0.8)",
  overlayPrimaryBackdropFilter: "none",
  cardPrimaryBackground: "#1991ee",
  cardSecondaryBackground: "#0c273a",
  cardBorderRadius: "8px",
  cardBorderColor: "#e5e7eb",
  cardBorderWidth: "1px",
  cardShadow: "0 8px 24px rgba(0, 0, 0, 0.08)",
  cardShadowHover: "0 12px 30px rgba(0, 0, 0, 0.12)",
  // Card variants own their shadows. An absent YOOtheme variant shadow is
  // intentionally explicit `none`; it must not inherit another variant's
  // authored glow through a generic fallback.
  cardDefaultHoverShadow: "0 12px 30px rgba(0, 0, 0, 0.12)",
  cardPrimaryShadow: "none",
  cardPrimaryHoverShadow: "none",
  cardSecondaryShadow: "none",
  cardSecondaryHoverShadow: "none",
  cardHoverTransform: "translateY(3px)",
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
  imageDefaultRatio: "natural",
  // YOOtheme Image has no default crop mode. Preserve natural media until an
  // element explicitly opts into a crop/object-fit behavior.
  imageDefaultFit: "natural",
  imageMediaDefaultsVersion: 3,
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
    submenuWidth:
      typeof raw.submenuWidth === "string" && raw.submenuWidth.trim().length > 0
        ? raw.submenuWidth.trim()
        : null,
    mobileAccordion: raw.mobileAccordion !== false,
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
  const normalizedInput: Partial<BuilderShellSettings> = { ...(value ?? {}) };
  // Older YOOtheme imports stored the default-card shadows in the generic
  // Card fields. Promote those values once at the normalization boundary so
  // existing DevStack tenants receive the same canonical UIkit hover tokens
  // as newly imported tenants.
  if (/^devstack\b/i.test(String(value?.globalStylePresetName ?? ""))) {
    if (normalizedInput.navbarDropdownIndicator == null) {
      normalizedInput.navbarDropdownIndicator = "chevron";
    }
    if (normalizedInput.cardDefaultShadow == null && value?.cardShadow != null) {
      normalizedInput.cardDefaultShadow = value.cardShadow;
    }
    if (
      (normalizedInput.cardDefaultHoverShadow == null ||
        normalizedInput.cardDefaultHoverShadow === defaultBuilderShellSettings.cardDefaultHoverShadow) &&
      value?.cardShadowHover != null
    ) {
      normalizedInput.cardDefaultHoverShadow = value.cardShadowHover;
    }
  }
  const preset = typeof value?.storefrontPreset === "string" && allowedPresets.includes(value.storefrontPreset.trim().toLowerCase())
    ? value.storefrontPreset.trim().toLowerCase()
    : defaultBuilderShellSettings.storefrontPreset;

  return {
    ...defaultBuilderShellSettings,
    ...normalizedInput,
    // Version 2 was written while Cover was the implicit product default, so
    // `cover` there is indistinguishable from an author choice. Treat that
    // historical ambiguity as Natural for YOOtheme-compatible media. Version
    // 3 is written after this migration and preserves an explicit Cover.
    imageDefaultFit: value?.imageMediaDefaultsVersion === 3
      ? normalizeOptionalString(value?.imageDefaultFit) ?? defaultBuilderShellSettings.imageDefaultFit
      : value?.imageDefaultFit === "cover"
        ? "natural"
        : normalizeOptionalString(value?.imageDefaultFit) ?? defaultBuilderShellSettings.imageDefaultFit,
    imageMediaDefaultsVersion: 3,
    backgroundDefault: normalizeOptionalString(value?.backgroundDefault) ?? normalizeOptionalString(value?.backgroundColor) ?? defaultBuilderShellSettings.backgroundDefault,
    backgroundMuted: normalizeOptionalString(value?.backgroundMuted) ?? normalizeOptionalString(value?.mutedBackgroundColor) ?? defaultBuilderShellSettings.backgroundMuted,
    backgroundPrimary: normalizeOptionalString(value?.backgroundPrimary) ?? normalizeOptionalString(value?.primaryColor) ?? defaultBuilderShellSettings.backgroundPrimary,
    backgroundSecondary: normalizeOptionalString(value?.backgroundSecondary) ?? normalizeOptionalString(value?.secondaryColor) ?? defaultBuilderShellSettings.backgroundSecondary,
    sectionDefaultColorMode: value?.sectionDefaultColorMode === "dark" ? "dark" : "light",
    sectionMutedColorMode: value?.sectionMutedColorMode === "dark" ? "dark" : "light",
    sectionPrimaryColorMode: value?.sectionPrimaryColorMode === "dark" ? "dark" : "light",
    sectionSecondaryColorMode: value?.sectionSecondaryColorMode === "dark" ? "dark" : "light",
    backgroundDefaultImage: normalizeOptionalString(value?.backgroundDefaultImage) ?? undefined,
    backgroundMutedImage: normalizeOptionalString(value?.backgroundMutedImage) ?? undefined,
    backgroundPrimaryImage: normalizeOptionalString(value?.backgroundPrimaryImage) ?? undefined,
    backgroundSecondaryImage: normalizeOptionalString(value?.backgroundSecondaryImage) ?? undefined,
    backgroundDefaultGradient: normalizeOptionalString(value?.backgroundDefaultGradient) ?? undefined,
    backgroundPrimaryGradient: normalizeOptionalString(value?.backgroundPrimaryGradient) ?? undefined,
    textBackgroundGradient: normalizeOptionalString(value?.textBackgroundGradient) ?? undefined,
    headingH3FontSize: normalizeOptionalString(value?.headingH3FontSize) ?? undefined,
    headingH1FontSize: normalizeOptionalString(value?.headingH1FontSize) ?? undefined,
    headingH1FontWeight: normalizeOptionalString(value?.headingH1FontWeight) ?? undefined,
    headingSmallLineHeight: normalizeOptionalString(value?.headingSmallLineHeight)
      ?? defaultBuilderShellSettings.headingSmallLineHeight,
    headingLargeLineHeight: normalizeOptionalString(value?.headingLargeLineHeight)
      ?? defaultBuilderShellSettings.headingLargeLineHeight,
    headingMediumLineHeight: normalizeOptionalString(value?.headingMediumLineHeight)
      ?? defaultBuilderShellSettings.headingMediumLineHeight,
    cardBackdropFilter: normalizeOptionalString(value?.cardBackdropFilter) ?? undefined,
    cardDefaultColorMode: value?.cardDefaultColorMode === "light" ? "light" : "dark",
    overlayDefaultBackground: normalizeOptionalString(value?.overlayDefaultBackground) ?? undefined,
    overlayDefaultBackdropFilter: normalizeOptionalString(value?.overlayDefaultBackdropFilter) ?? undefined,
    overlayPrimaryBackground: normalizeOptionalString(value?.overlayPrimaryBackground) ?? undefined,
    overlayPrimaryBackdropFilter: normalizeOptionalString(value?.overlayPrimaryBackdropFilter) ?? undefined,
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
    sectionPaddingDefault: normalizeSectionSpacing(
      value?.sectionPaddingDefault,
      defaultBuilderShellSettings.sectionPaddingDefault ?? "40px",
    ),
    sectionPaddingDefaultMedium: normalizeSectionSpacing(
      value?.sectionPaddingDefaultMedium,
      defaultBuilderShellSettings.sectionPaddingDefaultMedium ?? "70px",
    ),
    sectionPaddingLarge: normalizeSectionSpacing(
      value?.sectionPaddingLarge,
      defaultBuilderShellSettings.sectionPaddingLarge ?? "70px",
    ),
    sectionPaddingLargeMedium: normalizeSectionSpacing(
      value?.sectionPaddingLargeMedium,
      defaultBuilderShellSettings.sectionPaddingLargeMedium ?? "140px",
    ),
    sectionPaddingXLarge: normalizeSectionSpacing(
      value?.sectionPaddingXLarge,
      defaultBuilderShellSettings.sectionPaddingXLarge ?? "140px",
    ),
    sectionPaddingXLargeMedium: normalizeSectionSpacing(
      value?.sectionPaddingXLargeMedium,
      defaultBuilderShellSettings.sectionPaddingXLargeMedium ?? "210px",
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
    visibilityDesktop:
      typeof value?.visibilityDesktop === "boolean"
        ? value.visibilityDesktop
        : defaultBuilderShellSettings.visibilityDesktop,
    visibilityTablet:
      typeof value?.visibilityTablet === "boolean"
        ? value.visibilityTablet
        : defaultBuilderShellSettings.visibilityTablet,
    visibilityMobile:
      typeof value?.visibilityMobile === "boolean"
        ? value.visibilityMobile
        : defaultBuilderShellSettings.visibilityMobile,
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
    const visibility = raw.visibility === "desktop" || raw.visibility === "mobile"
      ? raw.visibility
      : "all";

    if (id && label) {
      normalized.push({
        id,
        label,
        url: url || "",
        parentId: parentId || null,
        iconName: typeof raw.iconName === "string" ? raw.iconName.trim() || null : null,
        iconUrl: typeof raw.iconUrl === "string" ? raw.iconUrl.trim() || null : null,
        subtitle: typeof raw.subtitle === "string" ? raw.subtitle.trim() || null : null,
        mobileUrl: typeof raw.mobileUrl === "string" ? raw.mobileUrl.trim() || null : null,
        target: raw.target === "_blank" ? "_blank" : "_self",
        visibility,
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
