import { randomUUID } from "node:crypto";
import { mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  backupRootBuilderFileBeforeWrite,
  ensureRootBuilderData,
  getBuilderLayoutStorePath,
  getBuilderPagesPath,
  getBuilderTemplatesPath,
} from "@/lib/websiteBuilderData";
import type {
  BuilderParallaxSettings,
  BuilderSection,
  BuilderSubnavItem,
} from "@/components/dashboard/builderTypes";
import type { CanonicalButtonVariant } from "@/lib/uikitTokens";
import type {
  DynamicContentContextDescriptor,
  DynamicFieldBindings,
  DynamicItemContext,
} from "@/lib/dynamicContent";
import type { LayoutLibraryType } from "@/lib/layoutLibrary";
export type { BuilderSection };

export type BuilderCustomPageKey = `page:${string}`;
export type BuilderPage = "home" | "shop" | "client" | BuilderCustomPageKey;
export type BuilderTemplate =
  | "product-single"
  | "post-single"
  | "product-category"
  | "product-category-specific"
  | "search-results";
export type BuilderDocumentKey = "header" | "footer";
/** Internal storage key for a strictly validated opaque Builder document ID. */
export type DynamicBuilderDocumentKey = `dynamic:${string}`;
export type BuilderLayoutKey = BuilderPage | BuilderTemplate | BuilderDocumentKey | DynamicBuilderDocumentKey;
export type BuilderPanelStyle =
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
export type BuilderButtonStyle = CanonicalButtonVariant;

export type BuilderListItem = {
  id: string;
  text: string;
  url?: string;
  target?: "_self" | "_blank";
  iconName?: string;
  iconSize?: number;
  dynamicContext?: DynamicContentContextDescriptor;
  dynamicBindings?: DynamicFieldBindings<"text" | "url">;
};

export type BuilderGalleryItem = {
  id: string;
  imageUrl?: string;
  imageAlt?: string;
  title?: string;
  meta?: string;
  content?: string;
  tags?: string[];
  linkUrl?: string;
  linkTarget?: "_self" | "_blank";
  linkLabel?: string;
  linkAriaLabel?: string;
  dynamicContext?: DynamicContentContextDescriptor;
  dynamicBindings?: DynamicFieldBindings<
    "imageUrl" | "imageAlt" | "title" | "meta" | "content" | "linkUrl" | "linkLabel"
  >;
};

export type BuilderDesign = {
  preset?: string;
  colorScheme?: string;
  pageBackground?: string;
  textColor?: string;
  mutedTextColor?: string;
  accentColor?: string;
  surfaceColor?: string;
  buttonBackground?: string;
  buttonTextColor?: string;
  radius?: string;
  sectionMaxWidth?: string;
  sectionGutter?: string;
  headingFontFamily?: string;
  headingSize?: string;
  headingWeight?: string;
  headingLineHeight?: string;
  headingColor?: string;
  cardBg?: string;
  cardRadius?: string;
  cardBorder?: string;
  cardShadow?: string;
  cardShadowHover?: string;
  cardImageBg?: string;
  cardImagePadding?: string;
};

export type BuilderLayoutBlock = {
  /** Original YOOtheme Panel props retained for parity phases beyond import. */
  yoothemeSource?: {
    type: "panel";
    props: Record<string, unknown>;
  };
  id?: string;
  kind?: string;
  /** Cart element presentation. Inline is the backwards-compatible default. */
  cartPresentation?: "inline" | "floating";
  cartFloatingPosition?: "bottom-right" | "bottom-left";
  dynamicContext?: DynamicContentContextDescriptor;
  dynamicBindings?: DynamicFieldBindings<
    | "headingText" | "body" | "eyebrow" | "title"
    | "imageUrl" | "imageAlt" | "imageLinkUrl" | "linkText"
    | "buttonLabel" | "buttonUrl" | "alertLinkUrl"
  >;
  /** Transient canonical Product contexts; never authored persistence data. */
  dynamicProductContexts?: DynamicItemContext[];
  loggedOutLabel?: string;
  loggedInLabel?: string;
  loggedOutUrl?: string;
  loggedInUrl?: string;
  previewState?: "auto" | "logged-out" | "logged-in";
  menuSource?: string;
  menuItemGap?: string;
  menuHoverColor?: string;
  menuActiveColor?: string;
  menuActiveIndicator?: "princity" | "underline" | "none";
  menuHoverVariant?: "none" | "line" | "glow" | "line-glow";
  menuHoverLine?: "none" | "top" | "bottom" | "left" | "right";
  menuDropdownIndicator?: "none" | "chevron";
  menuDividerMode?: "none" | "partial" | "all";
  menuColumns?: number;
  menuMegaWidth?: string;
  menuDropbar?: boolean;
  menuClickMode?: boolean;
  menuShowParentIcon?: boolean;
  menuItems?: unknown[];
  /** Canonical UIkit Subnav links, including authored scroll targets. */
  subnavItems?: BuilderSubnavItem[];
  subnavStyle?: "default" | "divider" | "pill";
  subnavAlign?: "left" | "center" | "right";
  imageInverseUrl?: string | null;
  imageMobileUrl?: string | null;
  headerNavigationOverrides?: {
    gap?: boolean;
    hoverColor?: boolean;
    activeColor?: boolean;
    indicator?: boolean;
    hoverVariant?: boolean;
    hoverLine?: boolean;
    dropdownIndicator?: boolean;
    divider?: boolean;
    typography?: boolean;
  };
  headerBrandMode?: "logo" | "brand" | "both";
  headerBrandText?: string;
  headerUtilityAction?: string;
  headerUtilityVariant?: string;
  headerCategoriesLabel?: string;
  headerCategoriesShowLabel?: boolean;
  headerCategoriesDisplay?: "icon" | "icon-label" | "label";
  headerCategoriesIcon?: "menu" | "grid";
  headerCategoriesIconPosition?: "left" | "right";
  headerCategoriesDropdownAlign?: "left" | "right";
  headerCategoriesShowAll?: boolean;
  headerCategoriesShowCounts?: boolean;
  headerCategoriesShowHierarchy?: boolean;
  headerLanguageDisplay?: "native" | "code";
  eyebrow?: string;
  title?: string;
  body?: string;
  buttonLabel?: string;
  buttonUrl?: string;
  buttonTarget?: string;
  buttonStyle?: string;
  size?: "small" | "default" | "large";
  fullWidthButton?: boolean;
  linkMarginTop?: string;
  secondaryButtonLabel?: string;
  secondaryButtonUrl?: string;
  secondaryButtonTarget?: string;
  secondaryButtonStyle?: string;
  secondaryButtonSize?: "small" | "default" | "large";
  buttonsLayout?: "inline" | "stacked";
  buttonGap?: string;
  buttonColumnGap?: "none" | "small" | "medium" | "large" | string;
  buttonRowGap?: "none" | "small" | "medium" | "large" | string;
  buttons?: {
    id?: string;
    label?: string;
    url?: string;
    target?: string;
    style?: string;
    size?: "small" | "default" | "large";
    dynamicContext?: DynamicContentContextDescriptor;
    dynamicBindings?: DynamicFieldBindings<"label" | "url">;
  }[];
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
  buttonHoverTransform?: string;
  buttonHoverBoxShadow?: string;
  buttonHoverEffect?: string;
  headerButtonOverrides?: {
    variant?: boolean;
    background?: boolean;
    text?: boolean;
    border?: boolean;
    radius?: boolean;
    padding?: boolean;
    typography?: boolean;
    hoverBackground?: boolean;
    hoverText?: boolean;
    hoverBorder?: boolean;
    hoverEffect?: boolean;
  };
  imageUrl?: string;
  imageAlt?: string;
  imageBorder?: string;
  imageAlignment?: "left" | "center" | "right";
  imageMaxWidth?: number;
  imageBorderRadius?: number;
  imageFit?: "contain" | "cover" | "fill";
  imageRatio?: "auto" | "natural" | "square" | "4:3" | "3:2" | "4:5" | "3:4" | "16:9" | "portrait";
  imageShape?: "none" | "rounded" | "circle" | "pill";
  imageShadow?: "none" | "small" | "medium" | "large" | "xlarge" | "bottom" | (string & {});
  imageBoxShadow?: "none" | "small" | "medium" | "large" | "xlarge" | "bottom" | (string & {});
  imageBoxDecoration?: "none" | "default" | "primary" | "secondary" | "shadow" | "mask" | (string & {});
  imageHoverBorder?: boolean;
  imageInverse?: boolean;
  imageIconWidth?: string | number;
  imageIconColor?: string;
  imageTextColor?: string;
  imagePosition?: "top-left" | "top-center" | "top-right" | "center-left" | "center" | "center-right" | "bottom-left" | "bottom-center" | "bottom-right";
  imageWidth?: "auto" | "full" | "small" | "medium" | "large" | "xlarge" | (string & {});
  imageHeight?: string | number;
  /** Shared media spacing token. Structural consumers decide when it applies. */
  imageMarginTop?: "default" | "none" | "small" | "medium" | "large" | "xlarge" | (string & {});
  imageLoading?: "lazy" | "eager";
  imageSvgInline?: boolean;
  imageSvgAnimate?: boolean;
  imageSvgColor?: string;
  gridMetaHtmlElement?: string;
  imageLinkUrl?: string;
  /** YOOtheme Panel image-link toggle; uses the Panel link URL. */
  linkImage?: boolean;
  imageLinkTarget?: "_self" | "_blank";
  borderRadius?: number;
  imageCaption?: string;
  elementBackgroundMode?: string;
  elementBackground?: string;
  elementPadding?: string;
  /**
   * Provenance for the General spacing contract. Imported UIkit/YOOtheme
   * elements own their spacing through their explicit source margin, rather
   * than inheriting WebPages' authoring-oriented shell padding default.
   */
  spacingContract?: "yootheme";
  elementAlign?: string;
  panelStyle?: BuilderPanelStyle;
  panelVariant?: "default" | "primary" | "secondary" | "blank" | "tile-default" | "tile-muted" | "tile-primary" | "tile-secondary" | "tile-checked";
  panelHover?: boolean;
  panelSize?: "none" | "small" | "default" | "large";
  panelImageNoPadding?: boolean;
  panelHeightExpand?: boolean;
  panelExpand?: "none" | "image" | "content" | "both";
  panelMetaPosition?: "above-title" | "below-title" | "above-content" | "below-content";
  linkPanel?: boolean;
  panelShowMedia?: boolean;
  panelMediaPlacement?: "top" | "bottom" | "left" | "right" | "between";
  panelMediaVerticalAlign?: "top" | "center" | "bottom";
  panelMediaFit?: "natural" | "cover" | "contain" | "fill";
  panelMediaWidth?: "auto" | "4-5" | "3-4" | "2-3" | "3-5" | "1-2" | "2-5" | "1-3" | "1-4" | "1-5" | "small" | "medium" | "large" | "xlarge" | "2xlarge";
  panelMediaAlignment?: "left" | "center" | "right";
  panelTextAlign?: "left" | "center" | "right";
  columnsPhonePortrait?: string;
  columnsPhoneLandscape?: string;
  columnsTabletLandscape?: string;
  columnsDesktop?: string;
  columnsLargeScreens?: string;
  overlayLink?: boolean;
  overlayMode?: "cover" | "caption";
  overlayStyle?: string;
  overlayPosition?: string;
  overlayHover?: boolean;
  overlayTransition?: string;
  overlayPadding?: string;
  overlayMargin?: string;
  overlayTextColor?: string;
  /** YOOtheme Panel text presets for meta and body content. */
  metaStyle?: string;
  contentStyle?: string;
  panelMetaHtmlElement?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "div";
  panelVerticalAlign?: "top" | "center" | "bottom";
  panelTitleElement?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "div";
  panelTitleStyle?: string;
  titleDecoration?: string;
  titleColor?: string;
  linkTitle?: boolean;
  panelTitleHoverStyle?: "none" | "heading-link" | "default-link";
  panelTitleAlign?: "top" | "left";
  panelTitleGridWidth?: string;
  panelTitleGridBreakpoint?: "always" | "small" | "medium" | "large" | "xlarge";
  panelTitleGridColumnGap?: "small" | "medium" | "default" | "large" | "none";
  panelTitleGridRowGap?: "small" | "medium" | "default" | "large" | "none";
  titleMarginTop?: string;
  metaMarginTop?: string;
  contentMarginTop?: string;
  panelContentWidth?: "auto" | "xsmall" | "small" | "medium" | "large" | "full";
  panelActionVisible?: boolean;
  panelActionStyle?: BuilderButtonStyle;
  panelActionSize?: "small" | "default" | "large";
  panelActionAlign?: "inherit" | "left" | "center" | "right";
  hoverPreset?: string;
  embedMode?: string;
  embedCode?: string;
  embedUrl?: string;
  embedHeight?: number;
  fluentFormId?: string;
  columns?: number;
  filterPosition?: string;
  cardStyle?: string;
  cardPreset?: string;
  gridLimit?: number;
  cardPadding?: string;
  imagePadding?: string;
  source?: string;
  categoryId?: string;
  hiddenCategorySlugs?: string[];
  layoutVariant?: string;
  badges?: {
    id?: string;
    label?: string;
    title?: string;
    body?: string;
    items?: string[];
    listIcon?: string;
    listIconColorScheme?: string;
    listIconSize?: number;
  }[];
  slides?: {
    id?: string;
    title?: string;
    subtitle?: string;
    text?: string;
    badge?: string;
    imageUrl?: string;
    imageAlt?: string;
    thumbnailUrl?: string;
    thumbnailPosition?: string;
    imagePadding?: string;
    textColor?: "none" | "light" | "dark";
    itemElement?: "div" | "article" | "section" | "li";
    navigationLabel?: string;
    buttonAriaLabel?: string;
    buttonLabel?: string;
    buttonUrl?: string;
    items?: string[];
    listIcon?: string;
    listIconColorScheme?: string;
    listIconSize?: number;
    dynamicContext?: DynamicContentContextDescriptor;
    dynamicBindings?: DynamicFieldBindings<
      | "title"
      | "subtitle"
      | "text"
      | "badge"
      | "imageUrl"
      | "imageAlt"
      | "thumbnailUrl"
      | "navigationLabel"
      | "buttonAriaLabel"
      | "buttonLabel"
      | "buttonUrl"
    >;
  }[];
  carouselSettings?: {
    variant?: string;
    loop?: boolean;
    autoplay?: boolean;
    autoplayDelayMs?: number;
    align?: string;
    dragFree?: boolean;
    effect?: string;
    spaceBetween?: number;
    coverflowRotate?: number;
    coverflowDepth?: number;
    coverflowStretch?: number;
    cardsRotate?: boolean;
    cardsShadows?: boolean;
    creativePreset?: string;
    fadeCrossFade?: boolean;
    freeModeMomentum?: boolean;
    cardsPerView?: number;
    cardsPerViewPhone?: number;
    cardsPerViewSmall?: number;
    cardsPerViewMedium?: number;
    cardsPerViewLarge?: number;
    cardsPerViewXLarge?: number;
    centered?: boolean;
    divider?: boolean;
    showArrows?: boolean;
    showDots?: boolean;
    pauseOnHover?: boolean;
    arrowStyle?: string;
    arrowPosition?: string;
    paginationStyle?: string;
    paginationPosition?: string;
    navigationType?: "none" | "dotnav" | "thumbnav" | string;
    navigationMargin?: "none" | "small" | "medium" | "large" | string;
    navigationBreakpoint?: "small" | "medium" | "large" | "xlarge" | string;
    navigationBelow?: boolean;
    navigationHoverOnly?: boolean;
    navigationVertical?: boolean;
    thumbnavWidth?: number;
    thumbnavHeight?: number;
    thumbnavNoWrap?: boolean;
    showNavigationThumbnail?: boolean;
    thumbnavInlineSvg?: boolean;
    thumbnavSvgColor?: string;
    slidenavHoverOnly?: boolean;
    slidenavLarger?: boolean;
    slidenavMargin?: "none" | "small" | "medium" | "large" | string;
    slidenavOutsideBreakpoint?: "small" | "medium" | "large" | "xlarge" | string;
    kenBurns?: boolean;
    speed?: number;
    slideMode?: string;
    presentation?: "slideshow" | "overlay-slider" | "panel-slider";
    overlayGradient?: string;
    overlayContainer?: "none" | "default" | "small" | "large" | "xlarge" | "expand" | string;
    overlayContainerPadding?: "default" | "xsmall" | "small" | "large" | "xlarge" | string;
    overlayMargin?: "default" | "small" | "large" | "none" | string;
    overlayPosition?: string;
    overlayColor?: string;
    overlayTextColor?: string;
    overlayMode?: "cover" | "caption";
    overlayDisplay?: "always" | "hover" | "active";
    overlayPadding?: string;
    overlayAnimation?: "parallax" | "fade" | "scale-up" | "scale-down" | string;
    overlayParallax?: BuilderParallaxSettings;
    overlayWidth?: "none" | "small" | "medium" | "large" | "xlarge" | "2xlarge" | string;
    contentExpand?: boolean;
    overlayLink?: boolean;
    /** Whole-element link; distinct from an individual slide action. */
    elementLinkUrl?: string;
    elementLinkTarget?: "_self" | "_blank";
    itemWidthMode?: "fixed" | "auto";
    slideshowHeight?: "auto" | "viewport" | "section";
    slideshowViewportHeight?: number;
    slideshowHeightExpand?: boolean;
    slideshowRatio?: string;
    slideshowMinHeight?: number;
    slideshowMaxHeight?: number;
  };
  heroHeadingElement?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  heroHeadingStyle?: "inherit" | "h1" | "h2" | "h3" | "h4" | "h5" | "article-title" | "small" | "medium" | "large" | "xlarge";
  heroContentAlign?: "left" | "center" | "right";
  heroVerticalAlign?: "top" | "center" | "bottom";
  heroContentWidth?: "small" | "medium" | "large" | "full";
  heroMediaPlacement?: "none" | "right" | "left" | "background";
  heroMediaFit?: "contain" | "cover";
  heroMediaRatio?: "natural" | "square" | "4:3" | "3:2" | "16:9" | "portrait";
  heroHeight?: "auto" | "small" | "medium" | "large" | "viewport";
  heroInverse?: boolean;
  heroPrimaryActionVisible?: boolean;
  heroSecondaryActionVisible?: boolean;
  heroMediaLoading?: "lazy" | "eager";
  iconName?: string;
  iconSize?: number;
  items?: string[];
  listIcon?: string;
  listIconColorScheme?: "default" | "gradient-cycle";
  listIconSize?: number;
  listItems?: BuilderListItem[];
  listPresentation?: "default" | "bullet" | "divider" | "striped" | "large";
  listMarker?: "none" | "disc" | "circle" | "square";
  listAlign?: "left" | "center" | "right";
  listSpacing?: "compact" | "default" | "large";
  headingText?: string;
  headingLevel?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "div";
  accordionItems?: { id: string; title: string; content: string }[];
  accordionMultiple?: boolean;
  accordionCollapsible?: boolean;
  accordionOpenItems?: number[];
  accordionStyle?: "default" | "divided" | "striped" | "minimal";
  accordionIndicator?: "default" | "plus-minus" | "chevron" | "none";
  accordionIndicatorPosition?: "start" | "end";
  accordionTitleEmphasis?: "inherit" | "muted" | "default" | "emphasis" | "bold";
  accordionItemSpacing?: "inherit" | "small" | "default" | "large";
  accordionContentSpacing?: "inherit" | "small" | "default" | "large";
  accordionDivider?: boolean;
  accordionTitleStyle?: "inherit" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "article-title" | "small" | "medium" | "large" | "xlarge";
  accordionContentStyle?: "inherit" | "none" | "text-bold" | "text-lead" | "text-meta" | "text-small" | "text-large" | "text-muted" | "heading-small" | "heading-h1" | "heading-h2" | "heading-h3" | "heading-h4" | "heading-h5" | "heading-h6" | "default" | "lead" | "meta" | "small" | "large" | "muted";
  /** @deprecated Read-only migration fallback for older Accordion documents. */
  accordionRowStyle?: "plain" | "divided" | "striped";
  /** @deprecated Read-only migration fallback for older Accordion documents. */
  accordionSpacing?: "compact" | "default" | "large";
  /** @deprecated Read-only migration fallback for older Accordion documents. */
  accordionOpenEmphasis?: "none" | "muted" | "primary";
  headingAlign?: "left" | "center" | "right";
  textVariant?: "default" | "lead" | "meta" | "small" | "large" | "muted";
  textColor?: "none" | "muted" | "emphasis" | "primary" | "secondary" | "success" | "warning" | "danger";
  textDropcap?: boolean;
  textColumns?: "none" | "1-2" | "1-3" | "1-4" | "1-5" | "1-6";
  textColumnDivider?: boolean;
  textColumnBreakpoint?: "always" | "small" | "medium" | "large" | "xlarge";
  textHtmlElement?: "div" | "address" | "aside" | "footer";
  textAlign?: "left" | "center" | "right";
  dateLabel?: string;
  tableHeadings?: string[];
  tableRows?: string[][];
  tableStyle?: string;
  tableShowTitle?: boolean;
  tableShowMeta?: boolean;
  tableShowContent?: boolean;
  tableHeadTitle?: string;
  tableHeadMeta?: string;
  tableHeadContent?: string;
  tableHeadImage?: string;
  tableHeadLink?: string;
  tableTitleStyle?: string;
  tableTitleFontFamily?: "default" | "primary" | "secondary" | "tertiary";
  tableTitleColor?: string;
  tableMetaStyle?: string;
  tableMetaColor?: string;
  tableContentStyle?: string;
  tableHover?: boolean;
  tableJustify?: boolean;
  tableOrder?: "1" | "2" | "3" | "4" | "5" | "6";
  tableWidthTitle?: "expand" | "shrink" | "small" | "medium";
  tableWidthMeta?: "expand" | "shrink" | "small" | "medium";
  tableWidthContent?: "expand" | "shrink" | "small" | "medium";
  gridSource?: string;
  gridRows?: number;
  gridGap?: string;
  gridMargin?: string;
  gridImagePadding?: string;
  gridContentPadding?: string;
  gridImageFrame?: string;
  addToCartStyle?: string;
  addToCartSize?: string;
  addToCartPosition?: string;
  addToCartVisibility?: string;
  addToCartDisplay?: string;
  gridShowImage?: boolean;
  gridShowEyebrow?: boolean;
  gridShowMeta?: boolean;
  gridShowText?: boolean;
  gridShowButton?: boolean;
  gridRowGap?: "none" | "small" | "medium" | "large";
  /** Canonical YOOtheme Grid filter navigation, kept separate from item tags. */
  gridFilterControls?: { label: string; tag: string }[];
  /** Semantic tag selected when the Grid first mounts or the document changes. */
  gridFilterDefault?: string;
  /** Whether a synthetic "All" control is part of this Grid's authored navigation. */
  gridFilterShowAll?: boolean;
  gridItemRenderer?: "plain" | "card";
  gridCardVariant?: "default" | "primary" | "secondary" | "blank" | "card-hover" | "tile-default" | "tile-muted" | "tile-primary" | "tile-secondary" | "tile-checked";
  gridCardSize?: "none" | "small" | "default" | "large";
  gridCardHover?: boolean;
  gridItemMaxWidth?: "none" | "small" | "medium" | "large" | "xlarge" | "2xlarge";
  gridTitlePlacement?: "top" | "left";
  gridTitleWidth?: string;
  gridTitleColumnGap?: string;
  gridTitleRowGap?: string;
  gridTitleBreakpoint?: "always" | "s" | "m" | "l" | "xl";
  gridMediaPlacement?: "top" | "bottom" | "left" | "right" | "between";
  gridMediaWidth?: string;
  gridMediaColumnGap?: string;
  gridMediaRowGap?: string;
  gridMediaBreakpoint?: "always" | "s" | "m" | "l" | "xl";
  gridMediaVerticalAlign?: boolean;
  gridItems?: {
    id?: string;
    imageUrl?: string;
    imageAlt?: string;
    eyebrow?: string;
    /** Canonical Grid filter metadata. Source tags normalize to this array. */
    tags?: string[];
    title?: string;
    meta?: string;
    text?: string;
    buttonLabel?: string;
    buttonUrl?: string;
    buttonStyle?: BuilderButtonStyle;
    /** Source provenance for an item-specific YOOtheme link style. */
    buttonStyleSource?: "item";
    buttonTarget?: "_self" | "_blank";
    buttonAlign?: "left" | "center" | "right";
    renderer?: "plain" | "card";
    cardVariant?: "default" | "primary" | "secondary" | "blank";
    cardSize?: "small" | "default" | "large";
    cardHover?: boolean;
    mediaPlacement?: "top" | "bottom" | "left" | "right" | "between";
    mediaWidth?: string;
    mediaRatio?: "natural" | "square" | "4:3" | "3:2" | "16:9" | "portrait";
    mediaFit?: "natural" | "cover" | "contain" | "fill";
    imagePosition?: "top-left" | "top-center" | "top-right" | "center-left" | "center" | "center-right" | "bottom-left" | "bottom-center" | "bottom-right";
    textAlign?: "left" | "center" | "right";
    titleElement?: "h2" | "h3" | "h4" | "div";
    titleStyle?: "inherit" | "h3" | "h4" | "h5";
    actionStyle?: BuilderButtonStyle;
    actionSize?: "small" | "default" | "large";
    typography?: Record<string, unknown>;
    items?: string[];
    iconName?: string;
    iconSize?: number;
    listIcon?: "check" | "circleCheck" | "arrowRight" | "star" | "heart" | "sparkles" | "shield";
    listIconColorScheme?: "default" | "gradient-cycle";
    listIconSize?: number;
    dynamicContext?: DynamicContentContextDescriptor;
    dynamicBindings?: DynamicFieldBindings<
      | "imageUrl"
      | "imageAlt"
      | "eyebrow"
      | "title"
      | "meta"
      | "text"
      | "buttonLabel"
      | "buttonUrl"
    >;
  }[];
  galleryItems?: BuilderGalleryItem[];
  galleryShowThumbnails?: boolean;
  galleryThumbnailPosition?: string;
  galleryImageFit?: string;
  galleryHeight?: number;
  typography?: Record<string, unknown>;
  headingTypographyRole?: "default" | "primary" | "secondary" | "tertiary";
  textTypographyRole?: "default" | "primary" | "secondary" | "tertiary";
  titleTypographyRole?: "default" | "primary" | "secondary" | "tertiary";
  contentTypographyRole?: "default" | "primary" | "secondary" | "tertiary";
  metaTypographyRole?: "default" | "primary" | "secondary" | "tertiary";
  visualStyle?: Record<string, unknown>;
  animation?: Record<string, unknown>;
  typewriterEnabled?: boolean;
  typewriterPhrases?: string[];
  typewriterSpeed?: number;
  typewriterEraseSpeed?: number;
  typewriterDelay?: number;
  typewriterLoop?: boolean;
  typewriterUseGradient?: boolean;
  typewriterGradientPreset?: string;
  typewriterPreserveHeight?: boolean;
  typewriterReservedLines?: number;
  typewriterMobileReservedLines?: number;
  premiumButtonStyle?: string;
  premiumCardStyle?: string;
  textGradientPreset?: string;
  textGradientCustomStart?: string;
  textGradientCustomMiddle?: string;
  textGradientCustomEnd?: string;
  textGradientCustomAngle?: number;
  textGradientCustomStartOffset?: number;
  textGradientCustomMiddleOffset?: number;
  textGradientCustomEndOffset?: number;
  pagination?: {
    enabled: boolean;
    perPage: number;
    mode: "loadMore" | "pageNumbers" | "infinite";
    infiniteScroll?: boolean;
    style?: "standard" | "solid" | "minimal" | "rounded";
    margin?: "none" | "small" | "medium" | "large" | "xlarge";
    alignment?: "left" | "center" | "right";
    animation?: string;
  };
};

export type BuilderLayout = {
  version: 1;
  key?: BuilderLayoutKey;
  page: BuilderLayoutKey;
  targetType?: "page" | "template" | "document" | BuilderDocumentKey;
  template?: BuilderTemplate;
  /** Canonical external identity for dynamically created documents only. */
  documentId?: string;
  displayName?: string;
  design?: BuilderDesign;
  sections: BuilderSection[];
  updatedAt: string;
};

type BuilderLayoutStore = Partial<Record<BuilderLayoutKey, BuilderLayout>>;
export type BuilderCustomPage = {
  key: BuilderCustomPageKey;
  title: string;
  slug: string;
  updatedAt: string;
};

export type BuilderSavedTemplate = {
  id: string;
  title: string;
  /** Response-only Library ownership; omitted from persisted compositions. */
  libraryScope?: "site" | "shared";
  templateType?: LayoutLibraryType;
  description?: string;
  sourcePage?: BuilderLayoutKey;
  design?: BuilderDesign;
  sections: BuilderSection[];
  updatedAt: string;
};

export type BuilderDataScope = {
  websiteId?: string;
};
const pages = new Set(["home", "shop", "client"]);
const templates = new Set([
  "product-single",
  "post-single",
  "product-category",
  "product-category-specific",
  "search-results",
]);
const layoutKeys = new Set([...pages, ...templates, "header", "footer"]);

export function isBuilderCustomPageKey(
  value: string | null | undefined,
): value is BuilderCustomPageKey {
  return /^page:[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value ?? "");
}

export function normalizeBuilderPage(value: string | null): BuilderPage {
  if (pages.has(value ?? "") || isBuilderCustomPageKey(value)) {
    return value as BuilderPage;
  }
  return "shop";
}

export function normalizeBuilderLayoutKey(
  value: string | null,
): BuilderLayoutKey {
  if (layoutKeys.has(value ?? "") || isBuilderCustomPageKey(value)) {
    return value as BuilderLayoutKey;
  }
  return "shop";
}

export function normalizeLayoutBlockKind(
  block: { kind?: string; type?: string } | string | null | undefined,
): string {
  if (!block) return "text";
  const raw = typeof block === "string" ? block : block.kind || block.type || "text";
  if (raw === "accountAccess") return "headerAccount";
  return raw;
}


export function getBuilderTargetType(key: BuilderLayoutKey) {
  if (key.startsWith("dynamic:")) return "document";
  return key === "header" || key === "footer"
    ? key
    : templates.has(key)
      ? "template"
      : "page";
}

export function isBuilderTemplate(
  key: BuilderLayoutKey,
): key is BuilderTemplate {
  return templates.has(key);
}

export async function readBuilderLayoutStore(
  scope: BuilderDataScope = {},
): Promise<BuilderLayoutStore> {
  try {
    if (!scope.websiteId) {
      await ensureRootBuilderData();
    }
    const filePath = getBuilderLayoutStorePath(scope.websiteId);
    console.log("[builder-scope] read builder-layouts", {
      websiteId: scope.websiteId ?? null,
      filePath,
    });
    const raw = await readFile(filePath, "utf8");
    const parsed = JSON.parse(raw) as BuilderLayoutStore;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export async function getPublishedBuilderLayout(
  page: BuilderLayoutKey,
  scope: BuilderDataScope = {},
): Promise<BuilderLayout | null> {
  const store = await readBuilderLayoutStore(scope);
  return store[page] ?? null;
}

export async function writeBuilderLayoutStore(
  store: BuilderLayoutStore,
  scope: BuilderDataScope = {},
) {
  const filePath = getBuilderLayoutStorePath(scope.websiteId);
  console.log("[builder-scope] write builder-layouts", {
    websiteId: scope.websiteId ?? null,
    filePath,
  });
  await mkdir(path.dirname(filePath), { recursive: true });
  if (!scope.websiteId) {
    await backupRootBuilderFileBeforeWrite("builder-layouts.json");
  }
  const temporaryPath = `${filePath}.${process.pid}.${randomUUID()}.tmp`;
  try {
    await writeFile(temporaryPath, `${JSON.stringify(store, null, 2)}\n`, "utf8");
    await rename(temporaryPath, filePath);
  } finally {
    await rm(temporaryPath, { force: true }).catch(() => undefined);
  }
}

const builderLayoutStoreMutationQueues = new Map<string, Promise<void>>();

/**
 * Serializes a latest-state read/mutate/atomic-write transaction per website.
 * Callers must mutate only the entries they own and return their operation result.
 */
export async function mutateBuilderLayoutStore<Result>(
  mutate: (store: BuilderLayoutStore) => Result | Promise<Result>,
  scope: BuilderDataScope = {},
): Promise<Result> {
  const filePath = getBuilderLayoutStorePath(scope.websiteId);
  const previous = builderLayoutStoreMutationQueues.get(filePath) ?? Promise.resolve();
  let release!: () => void;
  const current = new Promise<void>((resolve) => { release = resolve; });
  const queued = previous.then(() => current);
  builderLayoutStoreMutationQueues.set(filePath, queued);
  await previous;
  try {
    const store = await readBuilderLayoutStore(scope);
    const result = await mutate(store);
    await writeBuilderLayoutStore(store, scope);
    return result;
  } finally {
    release();
    if (builderLayoutStoreMutationQueues.get(filePath) === queued) {
      builderLayoutStoreMutationQueues.delete(filePath);
    }
  }
}

export async function readBuilderCustomPages(
  scope: BuilderDataScope = {},
): Promise<BuilderCustomPage[]> {
  try {
    if (!scope.websiteId) {
      await ensureRootBuilderData();
    }
    const filePath = getBuilderPagesPath(scope.websiteId);
    console.log("[builder-scope] read builder-pages", {
      websiteId: scope.websiteId ?? null,
      filePath,
    });
    const raw = await readFile(filePath, "utf8");
    const parsed = JSON.parse(raw) as BuilderCustomPage[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (page) =>
        isBuilderCustomPageKey(page.key) &&
        typeof page.title === "string" &&
        typeof page.slug === "string",
    );
  } catch {
    return [];
  }
}

export async function writeBuilderCustomPages(
  pagesToWrite: BuilderCustomPage[],
  scope: BuilderDataScope = {},
) {
  const filePath = getBuilderPagesPath(scope.websiteId);
  console.log("[builder-scope] write builder-pages", {
    websiteId: scope.websiteId ?? null,
    filePath,
  });
  await mkdir(path.dirname(filePath), { recursive: true });
  if (!scope.websiteId) {
    await backupRootBuilderFileBeforeWrite("builder-pages.json");
  }
  await writeFile(
    filePath,
    `${JSON.stringify(pagesToWrite, null, 2)}\n`,
    "utf8",
  );
}

export async function readBuilderSavedTemplates(
  scope: BuilderDataScope = {},
): Promise<
  BuilderSavedTemplate[]
> {
  try {
    const raw = await readFile(getBuilderTemplatesPath(scope.websiteId), "utf8");
    const parsed = JSON.parse(raw) as BuilderSavedTemplate[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isValidBuilderSavedTemplate);
  } catch {
    return [];
  }
}

export async function writeBuilderSavedTemplates(
  templatesToWrite: BuilderSavedTemplate[],
  scope: BuilderDataScope = {},
) {
  const filePath = getBuilderTemplatesPath(scope.websiteId);
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(
    filePath,
    `${JSON.stringify(templatesToWrite, null, 2)}\n`,
    "utf8",
  );
}

export function isValidBuilderSection(value: unknown): value is BuilderSection {
  if (!value || typeof value !== "object") return false;
  const section = value as Partial<BuilderSection>;
  return (
    typeof section.id === "string" &&
    typeof section.kind === "string" &&
    typeof section.title === "string" &&
    typeof section.background === "string" &&
    typeof section.visible === "boolean"
  );
}

export function isValidBuilderSavedTemplate(
  value: unknown,
): value is BuilderSavedTemplate {
  if (!value || typeof value !== "object") return false;
  const template = value as Partial<BuilderSavedTemplate>;
  return (
    typeof template.id === "string" &&
    typeof template.title === "string" &&
    Array.isArray(template.sections) &&
    template.sections.every(isValidBuilderSection) &&
    typeof template.updatedAt === "string"
  );
}
