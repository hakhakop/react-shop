export type BuilderCustomPageKey = `page:${string}`;
export type BuilderPage = "home" | "shop" | "client" | BuilderCustomPageKey;
export type BuilderTemplate =
  | "product-single"
  | "post-single"
  | "post-category"
  | "product-category"
  | "product-category-specific"
  | "search-results";
export type BuilderDocumentKey = "header" | "footer";
export type DynamicBuilderDocumentKey = `dynamic:${string}`;
export type BuilderLayoutKey = BuilderPage | BuilderTemplate | BuilderDocumentKey | DynamicBuilderDocumentKey;
export type BuilderTargetType = "page" | "template" | "document" | BuilderDocumentKey;
import type {
  BuilderHeaderLayout,
  BuilderHeaderBrandMode,
  BuilderHeaderIconId,
  BuilderHeaderIconVariant,
  BuilderHeaderActiveIndicator,
  BuilderHeaderBackgroundMode,
  BuilderShellSettings,
  BuilderHeaderTextMode,
} from "@/lib/builderShell";
import type { CanonicalButtonVariant } from "@/lib/uikitTokens";
import type { LayoutLibraryType } from "@/lib/layoutLibrary";
import type {
  DynamicContentContextDescriptor,
  DynamicFieldBindings,
  DynamicItemContext,
} from "@/lib/dynamicContent";

export type {
  BuilderHeaderLayout,
  BuilderHeaderBrandMode,
  BuilderHeaderIconId,
  BuilderHeaderIconVariant,
  BuilderHeaderActiveIndicator,
  BuilderHeaderBackgroundMode,
  BuilderShellSettings,
  BuilderHeaderTextMode,
};
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
export type MenuPresentationSettings = {
  showHeading: boolean;
  icon: string | null;
  submenuLayout: "list" | "grid" | "mega";
  submenuColumns: number;
  submenuWidth: string | null;
  mobileAccordion: boolean;
  badgeText: string | null;
};
export type SectionKind =
  | "hero"
  | "productArchive"
  | "recentlyViewed"
  | "filters"
  | "promo"
  | "slider"
  | "badgeGrid"
  | "contentLayout"
  | "embed"
  | "scrollPinnedDemo"
  | (string & {});
export type PreviewDevice = "desktop" | "laptop" | "tablet" | "mobile";
export type GlobalSectionSpacing = "none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "small" | "medium" | "large" | string;
export type SectionSpacing = "inherit" | GlobalSectionSpacing;
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

export type BuilderSocialItem = {
  id: string;
  link: string;
  linkAriaLabel?: string;
  iconName?: string;
  imageUrl?: string;
  dynamicContext?: DynamicContentContextDescriptor;
  dynamicBindings?: DynamicFieldBindings<"link" | "linkAriaLabel" | "iconName" | "imageUrl">;
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

export type BuilderSubnavItem = {
  id: string;
  label: string;
  url?: string;
  target?: "_self" | "_blank";
  /** Preserve YOOtheme's authored uk-scroll behavior for anchor links. */
  scroll?: boolean;
};
export type InspectorTab =
  | "content"
  | "settings"
  | "layout"
  | "spacing"
  | "style"
  | "appearance"
  | "typography"
  | "behavior"
  | "effects"
  | "advanced"
  | "library";
export type SidebarTab =
  | "builder"
  | "content"
  | "elements"
  | "globalStyles"
  | "history"
  | "menu"
  | "pages"
  | "templates"
  | "routingTemplates"
  | "settings";
export type SlideImagePadding = "frameless" | "small" | "medium" | "max";
/** Shared carousel values persisted by the Slideshow/Panel Slider adapters. */
export type BuilderCarouselBreakpoint = "small" | "medium" | "large" | "xlarge";
export type BuilderCarouselImageFit = "natural" | "contain" | "cover" | "fill";
export type BuilderCarouselImageRatio = "natural" | "auto" | "square" | "4:3" | "3:2" | "4:5" | "3:4" | "16:9" | "portrait";
export type BuilderCarouselImageAlignment = "left" | "center" | "right";
export type BuilderCarouselImagePosition = "top-left" | "top-center" | "top-right" | "center-left" | "center" | "center-right" | "bottom-left" | "bottom-center" | "bottom-right";
export type BuilderCarouselMetaPosition = "above-title" | "below-title" | "above-content" | "below-content";
export type BuilderCarouselMetaElement = "div" | "span" | "p";
export type BuilderCarouselActionTarget = "_self" | "_blank";
export type BuilderCarouselActionSize = "small" | "default" | "large";
export type BuilderCarouselPanelSize = "none" | "small" | "default" | "large";
export type SectionBackgroundMode = "full" | "boxed" | string;
export type SectionContentMode = "none" | "xsmall" | "small" | "default" | "medium" | "large" | "xlarge" | "expand" | "full" | "boxed" | "narrow" | string;
export type SectionHeight = "none" | "auto" | "viewport" | "viewport-20" | "viewport-percent" | "viewport-80";
export type SectionContentVerticalAlign = "top" | "middle" | "center" | "bottom";
export type BuilderColorScheme = "auto" | "light" | "dark";
export type SectionColorScheme = "inherit" | "light" | "dark";
export type EmbedMode = "iframe" | "code";
export type BuilderAnimationPreset =
  | "none"
  | "fade-up"
  | "fade-down"
  | "fade-in"
  | "slide-left"
  | "slide-right"
  | "scale-up"
  | "zoom-in"
  | "flip-up"
  | "blur-in"
  | "stagger"
  | "scale-soft"
  | "blur-reveal"
  | "stagger-up"
  | "step-sequence"
  | "progress-line"
  | "scroll-progress-horizontal"
  | "scroll-progress-vertical"
  | "parallax"
  | "princity-gradient";
export type BuilderParallaxStop = {
  value: string;
  position?: number;
};
export type BuilderParallaxTransformOrigin =
  | "top-left" | "top-center" | "top-right"
  | "center-left" | "center-center" | "center-right"
  | "bottom-left" | "bottom-center" | "bottom-right";
export type BuilderParallaxSettings = {
  x?: BuilderParallaxStop[];
  y?: BuilderParallaxStop[];
  scale?: BuilderParallaxStop[];
  rotate?: BuilderParallaxStop[];
  opacity?: BuilderParallaxStop[];
  blur?: BuilderParallaxStop[];
  transformOrigin?: BuilderParallaxTransformOrigin;
  easing?: number;
  target?: string;
  start?: string;
  end?: string;
  zIndex?: boolean;
  breakpoint?: "s" | "m" | "l" | "xl" | "";
};
export type BuilderAnimationSettings = {
  preset?: BuilderAnimationPreset;
  delayMs?: number;
  durationMs?: number;
  easing?: "ease-out" | "ease-in-out" | "spring";
  triggerOffset?: number;
  playOnce?: boolean;
  progressSmoothingMs?: number;
  scrubDistanceVh?: number;
  stepOffset?: number;
  once?: boolean;
  pauseUntilComplete?: boolean;
  progressDirection?: "horizontal" | "vertical";
  parallax?: BuilderParallaxSettings;
  /** YOOtheme compound parallax range, in source order (start,end). */
  parallaxY?: [number, number];
  /** YOOtheme parallax easing coefficient. */
  parallaxEasing?: number;
};
export type LayoutBlockKind =
  | "hero"
  | "button"
  | "grid"
  | "heading"
  | "hero"
  | "image"
  | "overlay"
  | "panel"
  | "table"
  | "text"
  | "slider"
  | "slideshow"
  | "overlaySlider"
  | "panelSlider"
  | "embed"
  | "fluentForm"
  | "badgeGrid"
  | "icon"
  | "social"
  | "list"
  | "subnav"
  | "menu"
  | "headerUtility"
  | "headerSearch"
  | "headerWishlist"
  | "headerCart"
  | "headerAccount"
  | "headerTheme"
  | "headerCategories"
  | "headerLanguage"
  | "datePicker"
  | "products"
  | "categoryFilters"
  | "breadcrumbs"
  | "scrollPinnedDemo"
  | "productHero"
  | "productInfoStack"
  | "productPurchasePanel"
  | "productSpecsPanel"
  | "productGallery"
  | "productTitle"
  | "productPrice"
  | "productAddToCart"
  | "productAttributes"
  | "productDescription"
  | "cartContent"
  | "checkoutContent"
  | "accountContent"
  | "divider"
  | "accordion"
  | "alert"
  | "gallery"
  | (string & {});
  

export type BuilderDesign = {
  preset?: "princity" | "editorial" | "contrast";
  colorScheme?: BuilderColorScheme;
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

export type {
  TypographyVariant,
  TypographySettings,
  TypographyGroup,
} from "@/lib/builderTypography";

export type {
  BuilderVisualStyle,
  BuilderSpacingSides,
  BuilderBackgroundStyle,
  BuilderBorderStyle,
  BuilderEffectsStyle,
  BuilderVisibilityStyle,
} from "@/lib/builderVisualStyle";

import type { BuilderVisualStyle } from "@/lib/builderVisualStyle";
import type {
  TypographyGroup,
  TypographySettings,
} from "@/lib/builderTypography";

export type BuilderLayoutHtmlElement =
  | "div"
  | "address"
  | "article"
  | "aside"
  | "footer"
  | "header"
  | "hgroup"
  | "main"
  | "nav"
  | "section";

export type BuilderLayoutAdvancedSettings = {
  status?: "published" | "disabled" | "draft" | (string & {});
  htmlId?: string;
  className?: string;
  attributes?: Record<string, string> | string;
  css?: string;
  /**
   * @deprecated Import-staging only. It has no runtime ownership; canonical
   * item Dynamic Content uses dynamicContext + dynamicBindings.
   */
  dynamicSource?: unknown;
};

export type BuilderResponsiveColumnWidths = {
  default?: string;
  small?: string;
  medium?: string;
  large?: string;
  xlarge?: string;
};

export type BuilderResponsiveColumnOrder = {
  default?: number | "first" | "last";
  small?: number | "first" | "last";
  medium?: number | "first" | "last";
  large?: number | "first" | "last";
  xlarge?: number | "first" | "last";
};

export type BuilderColumnBackground = {
  color?: string;
  imageUrl?: string;
  videoUrl?: string;
  position?: string;
  size?: "auto" | "cover" | "contain" | (string & {});
  repeat?: string;
  gradient?: string;
  parallax?: BuilderParallaxSettings;
};

export type BuilderColumnStickySettings = {
  mode?:
    | "none"
    | "elements-within-column"
    | "column-within-row"
    | "column-within-section"
    | "always";
  topOffset?: string;
  bottomOffset?: string;
  breakpoint?: "s" | "m" | "l" | "xl" | "";
  blend?: boolean;
};

export type BuilderColumn = {
  id: string;
  dynamicContext?: DynamicContentContextDescriptor;
  responsiveWidths?: BuilderResponsiveColumnWidths;
  order?: BuilderResponsiveColumnOrder;
  verticalAlign?: "top" | "middle" | "bottom";
  background?: BuilderColumnBackground;
  style?: string;
  textColor?: "none" | "light" | "dark";
  preserveColor?: boolean;
  padding?: SectionSpacing;
  htmlElement?: BuilderLayoutHtmlElement;
  sticky?: BuilderColumnStickySettings;
  keepEmpty?: boolean;
  advanced?: BuilderLayoutAdvancedSettings;
  elements: BuilderLayoutBlock[];
};

export type BuilderRowCustomLayout = {
  template?: string;
  columns?: Array<{
    columnId: string;
    widths?: BuilderResponsiveColumnWidths;
    order?: BuilderResponsiveColumnOrder;
  }>;
};

export type BuilderRowHeightSettings = {
  mode?: "none" | "pixels" | "viewport";
  value?: string;
  offset?: string;
  subtractHeightAbove?: boolean;
};

export type BuilderRowColumnParallaxSettings = {
  enabled?: boolean;
  justifyAtBottom?: boolean;
  start?: string;
  end?: string;
};

export type BuilderRow = {
  id: string;
  /** Optional Header semantic; the row remains an ordinary Builder row. */
  role?: "toolbar";
  /** Optional responsive ownership inside the one canonical Header document. */
  headerVariant?: "desktop" | "mobile";
  dynamicContext?: DynamicContentContextDescriptor;
  layout: string;
  /** Provenance for source-specific structural spacing semantics. */
  spacingContract?: "yootheme";
  customLayout?: BuilderRowCustomLayout;
  columnGap?: SectionSpacing;
  rowGap?: SectionSpacing;
  divider?: boolean;
  horizontalDistribution?: "justify" | "left" | "center";
  maxWidth?: SectionContentMode;
  removeHorizontalPadding?: boolean;
  expandOneSide?: "none" | "left" | "right";
  height?: BuilderRowHeightSettings;
  topMargin?: SectionSpacing;
  bottomMargin?: SectionSpacing;
  htmlElement?: BuilderLayoutHtmlElement;
  columnParallax?: BuilderRowColumnParallaxSettings;
  advanced?: BuilderLayoutAdvancedSettings;
  /** Header-row compatibility fields retained by the canonical Row editor. */
  headerGap?: string;
  headerJustify?: "start" | "center" | "space-between" | "end";
  headerAlign?: "start" | "center" | "end" | "stretch";
  rowBackground?: string;
  rowColorScheme?: SectionColorScheme;
  rowTopSpacing?: SectionSpacing;
  rowBottomSpacing?: SectionSpacing;
  rowTopMargin?: SectionSpacing;
  rowBottomMargin?: SectionSpacing;
  rowBorderRadius?: number;
  rowVisualStyle?: BuilderVisualStyle;
  rowAnimation?: BuilderAnimationSettings;
  columns: BuilderColumn[];
};


export type BuilderLayoutBlock = {
  /** Original YOOtheme Panel props retained for parity phases beyond import. */
  yoothemeSource?: {
    type: "panel";
    props: Record<string, unknown>;
  };
  contentTranslations?: BuilderContentTranslations;
  id?: string;
  /** Legacy Advanced aliases retained for existing documents. */
  customId?: string;
  customClass?: string;
  customAttributes?: string;
  customCss?: string;
  kind?: LayoutBlockKind;
  /** Cart element presentation. Inline is the backwards-compatible default. */
  cartPresentation?: "inline" | "floating";
  cartFloatingPosition?: "bottom-right" | "bottom-left";
  dynamicContext?: DynamicContentContextDescriptor;
  dynamicBindings?: DynamicFieldBindings<
    | "headingText" | "body" | "eyebrow" | "title"
    | "imageUrl" | "imageAlt" | "buttonLabel" | "buttonUrl" | "alertLinkUrl"
  >;
  /** Transient canonical Product contexts supplied by materialization/preview. */
  dynamicProductContexts?: DynamicItemContext[];
  loggedOutLabel?: string;
  loggedInLabel?: string;
  loggedOutUrl?: string;
  loggedInUrl?: string;
  previewState?: "auto" | "logged-out" | "logged-in";
  eyebrow?: string;
  title?: string;
  body?: string;
  buttonLabel?: string;
  buttonUrl?: string;
  buttonTarget?: "_self" | "_blank";
  buttonStyle?: BuilderButtonStyle;
  size?: "small" | "default" | "large";
  secondaryButtonLabel?: string;
  secondaryButtonUrl?: string;
  secondaryButtonTarget?: "_self" | "_blank";
  secondaryButtonStyle?: BuilderButtonStyle;
  secondaryButtonSize?: "small" | "default" | "large";
  buttonsLayout?: "inline" | "stacked";
  buttonGap?: string;
  buttonColumnGap?: "none" | "small" | "medium" | "large" | string;
  buttonRowGap?: "none" | "small" | "medium" | "large" | string;
  fullWidthButton?: boolean;
  linkMarginTop?: string;
  buttons?: {
    contentTranslations?: BuilderContentTranslations;
    id?: string;
    label?: string;
    url?: string;
    target?: "_self" | "_blank";
    style?: BuilderButtonStyle;
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
  buttonHoverEffect?: "none" | "lift" | "grow" | "inherit";
  headerButtonOverrides?: {
    variant?: boolean;
    size?: boolean;
    width?: boolean;
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
  imageAlignment?: "left" | "center" | "right";
  imageMaxWidth?: number;
  imageBorderRadius?: number;
  imageShape?: "none" | "rounded" | "circle" | "pill";
  imageShadow?: "none" | "small" | "medium" | "large" | "xlarge" | "bottom" | (string & {});
  imageBoxShadow?: "none" | "small" | "medium" | "large" | "xlarge" | "bottom" | (string & {});
  imageHoverBoxShadow?: "none" | "small" | "medium" | "large" | "xlarge" | "bottom" | (string & {});
  imageHoverBorder?: boolean;
  imageInverse?: boolean;
  imageIconWidth?: string | number;
  imageIconColor?: string;
  imageTextColor?: string;
  imageBoxDecoration?: "none" | "default" | "primary" | "secondary" | "shadow" | "mask" | (string & {});
  imagePosition?: "top-left" | "top-center" | "top-right" | "center-left" | "center" | "center-right" | "bottom-left" | "bottom-center" | "bottom-right";
  imageWidth?: "auto" | "full" | "small" | "medium" | "large" | "xlarge" | (string & {});
  imageHeight?: string | number;
  /** Source media dimensions used for responsive crop geometry, not CSS sizing. */
  imageIntrinsicWidth?: number;
  imageIntrinsicHeight?: number;
  imageMinHeight?: string | number;
  videoUrl?: string;
  /** Shared media spacing token. Structural consumers decide when it applies. */
  imageMarginTop?: "default" | "none" | "small" | "medium" | "large" | "xlarge" | (string & {});
  imageLoading?: "lazy" | "eager";
  /** YOOtheme Overlay/Image presentation contract. */
  imageFocalPoint?: string;
  imageTransition?: string;
  imageHasBorder?: boolean;
  imageHoverFocalPoint?: string;
  hoverImageUrl?: string;
  hoverVideoUrl?: string;
  containerHeightExpand?: boolean;
  linkOverlay?: boolean;
  htmlElement?: string;
  overlayAnimateBackground?: boolean;
  overlayExpandContent?: boolean;
  overlayMaxWidth?: string;
  overlayTextColorHover?: boolean;
  overlayBlendImage?: boolean;
  titleTransition?: string;
  titleStyle?: string;
  titleHoverStyle?: string;
  titleLink?: boolean;
  titleFontFamily?: string;
  titleElement?: string;
  metaTransition?: string;
  metaFontFamily?: string;
  metaColor?: string;
  metaAlignment?: string;
  metaElement?: string;
  contentTransition?: string;
  contentFontFamily?: string;
  linkTransition?: string;
  linkStyle?: string;
  linkSize?: string;
  linkFullWidth?: boolean;
  meta?: string;
  linkText?: string;
  linkAriaLabel?: string;
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
  elementBackgroundMode?: "default" | "transparent" | "custom";
  elementBackground?: string;
  elementPadding?: "none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "small" | "medium" | "large" | string;
  /** Imported UIkit/YOOtheme elements use explicit source margins on the
   * shared General shell instead of inheriting authoring defaults. */
  spacingContract?: "yootheme";
  elementAlign?: "left" | "center" | "right";
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
  /** YOOtheme Panel text presets for meta and body content. */
  gridContentAlign?: boolean;
  gridContentDropcap?: boolean;
  gridContentColumn?: "none" | "1-2" | "1-3" | "1-4" | "1-5" | "1-6";
  gridContentColumnDivider?: boolean;
  gridContentColumnBreakpoint?: "always" | "s" | "m" | "l" | "xl";
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
  embedMode?: EmbedMode;
  embedCode?: string;
  embedUrl?: string;
  embedHeight?: number;
  fluentFormId?: string;
  columns?: number;
  /** Canonical YOOtheme Grid filter navigation, kept separate from item tags. */
  gridFilterControls?: { label: string; tag: string }[];
  /** Semantic tag selected when the Grid first mounts or the document changes. */
  gridFilterDefault?: string;
  /** Whether a synthetic "All" control is part of this Grid's authored navigation. */
  gridFilterShowAll?: boolean;
  filterPosition?: "left" | "top" | "drawer" | "hidden";
  cardStyle?: "flat" | "soft" | "lined" | "none";
  cardPreset?:
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
  gridLimit?: number;
  source?: "all" | "featured" | "category";
  categoryId?: string;
  hiddenCategorySlugs?: string[];
  layoutVariant?: "grid" | "carousel";
  badges?: BuilderSection["badges"];
  slides?: BuilderSection["slides"];
  carouselSettings?: BuilderSection["carouselSettings"];
  heroHeadingElement?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  heroHeadingStyle?: "inherit" | "h1" | "h2" | "h3" | "h4" | "h5" | "article-title" | "small" | "medium" | "large" | "xlarge";
  heroContentAlign?: "left" | "center" | "right";
  heroVerticalAlign?: "top" | "center" | "bottom";
  heroContentWidth?: "small" | "medium" | "large" | "full";
  heroMediaPlacement?: "none" | "right" | "left" | "background";
  heroMediaFit?: "contain" | "cover";
  heroMediaRatio?: "natural" | "square" | "4:3" | "3:2" | "16:9" | "portrait";
  heroHeight?: "auto" | "small" | "medium" | "large" | "viewport";
  heroOverlayStrength?: "none" | "light" | "medium" | "strong";
  heroInverse?: boolean;
  heroPrimaryActionVisible?: boolean;
  heroSecondaryActionVisible?: boolean;
  heroMediaLoading?: "lazy" | "eager";
  iconName?: string;
  iconSize?: number;
  socialItems?: BuilderSocialItem[];
  socialStyle?: "icon" | "button" | "link" | "muted" | "text" | "reset" | "iconnav" | "thumbnav";
  socialGrid?: "horizontal" | "vertical";
  socialGridBreakpoint?: "always" | "small" | "medium" | "large" | "xlarge";
  socialColumnGap?: "none" | "small" | "medium" | "default" | "large";
  socialRowGap?: "none" | "small" | "medium" | "default" | "large";
  socialIconWidth?: number;
  socialImageWidth?: number;
  socialImageHeight?: number;
  socialImageLoading?: "lazy" | "eager";
  socialImageSvgInline?: boolean;
  socialLinkTarget?: "_self" | "_blank";
  socialLinkAriaLabel?: string;
  items?: string[];
  menuSource?: "main" | string;
  menuItemGap?: string;
  menuHoverColor?: string;
  menuActiveColor?: string;
  menuActiveIndicator?: BuilderHeaderActiveIndicator;
  menuHoverVariant?: "none" | "line" | "glow" | "line-glow";
  menuHoverLine?: "none" | "top" | "bottom" | "left" | "right";
  menuDropdownIndicator?: "none" | "chevron";
  menuDividerMode?: "none" | "partial" | "all";
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
  headerBrandMode?: BuilderHeaderBrandMode;
  headerBrandText?: string;
  headerUtilityAction?: BuilderHeaderIconId;
  headerUtilityVariant?: BuilderHeaderIconVariant;
  headerSocialItems?: Array<{ link: string }>;
  headerSocialStyle?: boolean;
  headerSocialGap?: string;
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
  listIcon?: "check" | "circleCheck" | "arrowRight" | "star" | "heart" | "sparkles" | "shield";
  listIconColorScheme?: "default" | "gradient-cycle";
  listIconSize?: number;
  listItems?: BuilderListItem[];
  /** Canonical UIkit Subnav links, including authored scroll targets. */
  subnavItems?: BuilderSubnavItem[];
  subnavStyle?: "default" | "divider" | "pill";
  subnavAlign?: "left" | "center" | "right";
  listPresentation?: "default" | "bullet" | "divider" | "striped" | "large";
  listMarker?: "none" | "disc" | "circle" | "square";
  listAlign?: "left" | "center" | "right";
  listSpacing?: "compact" | "default" | "large";
  headingText?: string;
  headingLevel?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "div";
  headingAlign?: "left" | "center" | "right";
  headingSize?: "none" | "text-meta" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "article-title" | "small" | "medium" | "large" | "xlarge" | "2xlarge" | "3xlarge";
  textVariant?: "default" | "lead" | "meta" | "small" | "large" | "muted";
  textAlign?: "left" | "center" | "right";
  /** Canonical YOOtheme Text element presentation fields. */
  textColor?: "none" | "muted" | "emphasis" | "primary" | "secondary" | "success" | "warning" | "danger";
  textDropcap?: boolean;
  textColumns?: "none" | "1-2" | "1-3" | "1-4" | "1-5" | "1-6";
  textColumnDivider?: boolean;
  textColumnBreakpoint?: "always" | "small" | "medium" | "large" | "xlarge";
  textHtmlElement?: "div" | "address" | "aside" | "footer";
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
  dateLabel?: string;
  tableHeadings?: string[];
  tableRows?: string[][];
  /** Canonical structured rows used when a Table contains media or actions. */
  tableItems?: {
    id: string;
    title?: string;
    meta?: string;
    content?: string;
    imageUrl?: string;
    imageAlt?: string;
    linkUrl?: string;
    linkLabel?: string;
    linkTarget?: "_self" | "_blank";
  }[];
  tableColumnFields?: ("image" | "title" | "meta" | "content" | "link")[];
  tableShowImage?: boolean;
  tableShowLink?: boolean;
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
  tableImageWidth?: string | number;
  tableImageHeight?: string | number;
  tableImageLoading?: "lazy" | "eager";
  tableImageBorder?: "none" | "rounded" | "circle" | "pill" | string;
  tableImageShadow?: "none" | "small" | "medium" | "large" | "xlarge" | string;
  tableImageSvgInline?: boolean;
  tableImageSvgColor?: string;
  tableLinkStyle?: string;
  tableLinkSize?: string;
  tableLinkFullWidth?: boolean;
  tableLinkTarget?: "_self" | "_blank";
  tableStyle?: "striped" | "bordered" | "plain";
  tableHover?: boolean;
  tableJustify?: boolean;
  tableOrder?: "1" | "2" | "3" | "4" | "5" | "6";
  tableWidthTitle?: "expand" | "shrink" | "small" | "medium";
  tableWidthMeta?: "expand" | "shrink" | "small" | "medium";
  tableWidthContent?: "expand" | "shrink" | "small" | "medium";
  gridSource?: "static" | "products";
  gridRows?: number;
  gridGap?: "none" | "small" | "medium" | "large" | "max" | string;
  gridMargin?: "inherit" | "none" | "small" | "medium" | "large";
  cardPadding?: "none" | "small" | "medium" | "large" | "max" | string;
  imagePadding?: "none" | "small" | "medium" | "large" | "max" | string;
  imageFit?: "contain" | "cover" | "fill";
  imageRatio?: "auto" | "natural" | "square" | "4:3" | "3:2" | "4:5" | "3:4" | "16:9" | "portrait";
  gridImagePadding?: "frameless" | "small" | "medium" | "max" | string;
  gridContentPadding?: "none" | "small" | "medium" | "large" | string;
  gridImageFrame?: "none" | "soft";
  addToCartStyle?: "blue" | "dark" | "light" | "inherit";
  addToCartSize?: "compact" | "medium" | "large" | "full";
  addToCartPosition?: "below" | "under-price" | "under-wishlist";
  addToCartVisibility?: "hover" | "always";
  addToCartDisplay?: "button" | "icon";
  showTitle?: boolean;
  showMeta?: boolean;
  showContent?: boolean;
  showImage?: boolean;
  showVideo?: boolean;
  showLink?: boolean;
  showNavigationThumbnail?: boolean;
  showHoverImage?: boolean;
  showHoverVideo?: boolean;
  gridMasonry?: string;
  gridParallax?: number;
  gridParallaxJustify?: boolean;
  gridParallaxStart?: string;
  gridParallaxEnd?: string;
  columnGap?: string;
  rowGap?: string;
  showDividers?: boolean;
  centerColumns?: boolean;
  columnsPhonePortrait?: string;
  columnsPhoneLandscape?: string;
  columnsTabletLandscape?: string;
  columnsDesktop?: string;
  columnsLargeScreens?: string;
  enableFilter?: boolean;
  filterAnimation?: string;
  filterStyle?: string;
  enableLightbox?: boolean;
  /** YOOtheme Gallery whole-media/overlay link. Kept separate from visible item actions. */
  overlayLink?: boolean;
  overlayMode?: "cover" | "caption";
  overlayStyle?: "none" | "overlay-default" | "overlay-primary" | "tile-default" | "tile-muted" | "tile-primary" | "tile-secondary" | string;
  overlayPosition?: string;
  overlayHover?: boolean;
  overlayTransition?: string;
  overlayPadding?: "none" | "small" | "default" | "large" | string;
  overlayMargin?: "none" | "small" | "default" | "large" | string;
  overlayTextColor?: "none" | "light" | "dark" | string;
  lightboxAnimation?: string;
  lightboxNav?: string;
  gridShowImage?: boolean;
  gridShowEyebrow?: boolean;
  gridShowMeta?: boolean;
  gridShowText?: boolean;
  gridShowButton?: boolean;
  gridRowGap?: "none" | "small" | "medium" | "large";
  gridItemRenderer?: "plain" | "card";
  gridCardVariant?: "default" | "primary" | "secondary" | "blank" | "card-hover" | "tile-default" | "tile-muted" | "tile-primary" | "tile-secondary" | "tile-checked";
  gridCardSize?: "none" | "small" | "default" | "large";
  gridCardHover?: boolean;
  /** Grid-owned item composition; shared Panel/Media primitives supply its surfaces and media. */
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
  gridMediaAlignment?: "left" | "center" | "right";
  gridItemAlign?: "left" | "center" | "right";
  gridStacking?: "inherit" | "stack";
  gridItems?: {
    contentTranslations?: BuilderContentTranslations;
    id?: string;
    imageUrl?: string;
    imageAlt?: string;
    thumbnailUrl?: string;
    thumbnailPosition?: BuilderCarouselImagePosition;
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
    buttonAlign?: "left" | "center" | "right";
    buttonTarget?: "_self" | "_blank";
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
    typography?: TypographySettings;
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
  galleryThumbnailPosition?: "bottom" | "left";
  galleryImageFit?: "contain" | "cover";
  galleryHeight?: number;
  typography?: TypographySettings | TypographyGroup;
  headingTypographyRole?: "default" | "primary" | "secondary" | "tertiary";
  textTypographyRole?: "default" | "primary" | "secondary" | "tertiary";
  titleTypographyRole?: "default" | "primary" | "secondary" | "tertiary";
  contentTypographyRole?: "default" | "primary" | "secondary" | "tertiary";
  metaTypographyRole?: "default" | "primary" | "secondary" | "tertiary";
  visualStyle?: BuilderVisualStyle;
  animation?: BuilderAnimationSettings;
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
  premiumButtonStyle?: "neon-glow" | "cyber-glitch" | "glassmorphic" | "default";
  premiumCardStyle?: "neon-border" | "glass-morph" | "cyber-grid" | "none";
  textGradientPreset?: "indigo-purple" | "cyan-blue" | "emerald-teal" | "sunset-orange" | "indigo-purple-cyan" | "sunset-pink" | "gold-amber" | "none" | "custom";
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
  dividerStyle?: "default" | "small" | "icon" | "vertical";
  alertStyle?: "primary" | "success" | "warning" | "danger";
};

export type WordPressMediaItem = {
  id: number;
  title: string;
  altText?: string;
  mimeType?: string;
  sourceUrl: string;
  thumbnailUrl: string;
  date?: string;
  filename?: string;
  caption?: string;
  description?: string;
  width?: number;
  height?: number;
  fileSize?: number;
};

export type BuilderSection = {
  /** Version 2 makes the Header document the canonical owner of Header-wide settings. */
  headerArchitectureVersion?: 2;
  headerPresetKey?: string;
  headerVisible?: boolean;
  headerTransparent?: boolean;
  headerOverlay?: boolean;
  headerHeight?: string;
  headerCustomHeight?: number;
  headerLayout?: "wordpress" | "simple" | "two-row" | "hero" | "pill" | "princity";
  headerBehavior?: "static" | "sticky" | "sticky-on-scroll-up" | "pill-on-scroll";
  headerWidthMode?: "boxed" | "full";
  headerBackgroundMode?: "default" | "glass" | "accent" | "none";
  headerTextMode?: "auto" | "light" | "dark";
  headerZIndex?: number;
  headerBreakpoint?: string;
  headerMobileBreakpoint?: string;
  headerMobileLayout?: "horizontal-left" | "horizontal-center" | "horizontal-right";
  headerMobileBehavior?: "static" | "sticky" | "sticky-on-scroll-up" | "pill-on-scroll";
  headerMobileSearchPosition?: string;
  headerMobileSearchLayout?: string;
  headerMobileSearchDropdownStretch?: string;
  headerMobileSearchDropdownLarge?: boolean;
  headerMobileSearchIconPosition?: "" | "left" | "right";
  headerMobileSocialPosition?: string;
  headerMobileSocialStyle?: boolean;
  headerMobileSocialGap?: string;
  headerMobileSocialItems?: Array<{ link: string }>;
  headerMobileLogoPaddingRemove?: boolean;
  headerMobileDialogTogglePosition?: string;
  headerMobileDialogLayout?: string;
  headerMobileDialogClose?: boolean;
  headerMobileDialogMenuStyle?: string;
  headerMobileDialogCenter?: boolean;
  headerMobileDialogPushAfter?: number;
  headerMobileOffcanvasMode?: string;
  headerMobileOffcanvasFlip?: boolean;
  headerMobileOffcanvasOverlay?: boolean;
  headerMobileDialogDropbarAnimation?: string;
  headerStickyShowOnUp?: boolean;
  headerStickyAnimation?: string;
  headerDropdownAlign?: "left" | "right" | "center";
  headerDropdownAlignToNavbar?: boolean;
  headerDropbarEnabled?: boolean;
  headerParentIconEnabled?: boolean;
  headerClickModeEnabled?: boolean;
  headerDialogTogglePosition?: string;
  headerDialogLayout?: string;
  headerDialogMenuStyle?: string;
  headerDialogCenter?: boolean;
  headerDialogPushAfter?: number;
  headerOffcanvasMode?: string;
  headerOffcanvasFlip?: boolean;
  headerOffcanvasOverlay?: boolean;
  headerDialogDropbarAnimation?: string;
  headerSearchPosition?: string;
  headerSearchLayout?: string;
  headerSearchDropdownStretch?: string;
  headerSearchDropdownLarge?: boolean;
  headerSearchIconPosition?: "" | "left" | "right";
  headerSocialPosition?: string;
  headerSocialStyle?: boolean;
  headerSocialGap?: string;
  headerSocialItems?: Array<{ link: string }>;
  headerLogoPaddingRemove?: boolean;
  headerMobileLogoUrl?: string | null;
  headerInverseLogoUrl?: string | null;
  headerMobileComposition?: "separate" | "responsive";
  headerTopToolbarVisible?: boolean;
  headerTopToolbarText?: string;
  headerTopToolbarPhone?: string;
  headerTopToolbarMeta?: string;
  contentTranslations?: BuilderContentTranslations;
  headerUtilityMigrationVersion?: 1 | 2 | 3;
  id: string;
  dynamicContext?: DynamicContentContextDescriptor;
  dynamicBindings?: DynamicFieldBindings<"backgroundImageUrl">;
  /** User-facing label in Builder navigation. */
  name?: string;
  /** Optional public HTML anchor; internal Builder identity remains `id`. */
  anchorId?: string;
  kind: SectionKind;
  title: string;
  eyebrow?: string;
  body?: string;
  items?: string[];
  listIcon?: "check" | "circleCheck" | "arrowRight" | "star" | "heart" | "sparkles" | "shield";
  listIconColorScheme?: "default" | "gradient-cycle";
  listIconSize?: number;
  background: string;
  /** Global Styles semantic background ownership. */
  backgroundRole?: "default" | "muted" | "primary" | "secondary";
  /** Explicit local color override; legacy `background` remains a migration fallback. */
  backgroundOverride?: string;
  backgroundMode?: SectionBackgroundMode;
  backgroundEffect?: string;
  antigravitySpeed?: number;
  antigravityParticleCount?: number;
  antigravityColor?: string;
  antigravityGridDensity?: "compact" | "normal" | "sparse";
  antigravityInteractive?: boolean;
  antigravityShowGrid?: boolean;
  antigravityShowParticles?: boolean;
  antigravityGridMoveSpeed?: number;
  antigravityGlowIntensity?: number;
  antigravityVisualMode?: "full" | "transparent-grid" | "no-grid" | "lines-only";
  antigravityInteractionScope?: "section" | "global" | "none";
  contentMode?: SectionContentMode;
  maxWidth?: SectionContentMode;
  removeHorizontalPadding?: boolean;
  expandOneSide?: "none" | "left" | "right";
  sectionHeight?: SectionHeight;
  heightOffset?: number | string;
  subtractHeightAbove?: boolean;
  contentVerticalAlign?: SectionContentVerticalAlign;
  sectionVariant?: "default" | "muted" | "primary" | "secondary" | "image" | "video";
  preserveColor?: boolean;
  overlap?: boolean;
  textColor?: "none" | "light" | "dark";
  sectionPadding?: "none" | "xsmall" | "small" | "default" | "medium" | "large" | "xlarge";
  removeTopPadding?: boolean;
  removeBottomPadding?: boolean;
  htmlElement?: "div" | "section" | "header" | "footer" | "aside" | "main";
  stickyEffect?: "none" | "cover" | "reveal";
  pullUnderHeader?: boolean;
  headerTextColor?: "none" | "light" | "dark";
  animationDelay?: number | string;
  sectionTitlePosition?: string;
  sectionTitleRotation?: "left" | "right" | "none";
  sectionTitleBreakpoint?: string;
  colorScheme?: SectionColorScheme;
  layout?: string;
  topSpacing?: SectionSpacing;
  bottomSpacing?: SectionSpacing;
  margin?: SectionSpacing;
  topMargin?: SectionSpacing;
  bottomMargin?: SectionSpacing;
  removeTopMargin?: boolean;
  removeBottomMargin?: boolean;
  buttonLabel?: string;
  buttonUrl?: string;
  buttonTarget?: "_self" | "_blank";
  columns?: number;
  filterPosition?: "left" | "top" | "drawer" | "hidden";
  cardStyle?: "flat" | "soft" | "lined" | "none";
  cardPreset?:
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
  gridGap?: "none" | "small" | "medium" | "large" | "max" | string;
  cardPadding?: "none" | "small" | "medium" | "large" | "max" | string;
  imagePadding?: "none" | "small" | "medium" | "large" | "max" | string;
  imageFit?: "contain" | "cover" | "fill";
  imageRatio?: "auto" | "square" | "4:5" | "3:4" | "16:9";
  borderRadius?: number;
  addToCartStyle?: "blue" | "dark" | "light" | "inherit";
  addToCartSize?: "compact" | "medium" | "large" | "full";
  addToCartPosition?: "below" | "under-price" | "under-wishlist";
  addToCartVisibility?: "hover" | "always";
  addToCartDisplay?: "button" | "icon";
  source?: "all" | "featured" | "category";
  categoryId?: string;
  hiddenCategorySlugs?: string[];
  gridLimit?: number;
  layoutVariant?: "grid" | "carousel";
  promoVariant?: "default" | "accent" | "soft";
  ctaLabel?: string;
  ctaUrl?: string;
  embedMode?: EmbedMode;
  embedCode?: string;
  embedUrl?: string;
  embedHeight?: number;
  layoutColumns?: number;
  layoutRows?: number;
  /** Canonical Section -> Row -> Column structure. Legacy documents continue to use layoutItems. */
  rows?: BuilderRow[];
  layoutItems?: {
    id?: string;
    dynamicContext?: DynamicContentContextDescriptor;
    rowId?: string;
    rowLayout?: string;
    role?: "toolbar";
    headerVariant?: "desktop" | "mobile";
    maxWidth?: SectionContentMode;
    removeHorizontalPadding?: boolean;
    horizontalDistribution?: "justify" | "left" | "center";
    eyebrow?: string;
    title?: string;
    body?: string;
    buttonLabel?: string;
    buttonUrl?: string;
    blocks?: BuilderLayoutBlock[];
    nestedLayout?: {
      version: 1;
      direction: "vertical";
      distribution: "equal";
      gap?: SectionSpacing;
      rows: {
        id: string;
        dynamicContext?: DynamicContentContextDescriptor;
        weight: number;
        layout: "whole";
        columns: {
          id: string;
          dynamicContext?: DynamicContentContextDescriptor;
          rowId: string;
          rowLayout: "whole";
          blocks: BuilderLayoutBlock[];
        }[];
      }[];
    };
    rowBackground?: string;
    rowBackgroundMode?: SectionBackgroundMode;
    rowBackgroundEffect?: string;
    rowAntigravitySpeed?: number;
    rowAntigravityParticleCount?: number;
    rowAntigravityColor?: string;
    rowAntigravityGridDensity?: "compact" | "normal" | "sparse";
    rowAntigravityInteractive?: boolean;
    rowAntigravityShowGrid?: boolean;
    rowAntigravityShowParticles?: boolean;
    rowAntigravityGridMoveSpeed?: number;
    rowAntigravityGlowIntensity?: number;
    rowAntigravityVisualMode?: "full" | "transparent-grid" | "no-grid" | "lines-only";
    rowAntigravityInteractionScope?: "section" | "global" | "none";
    rowColorScheme?: SectionColorScheme;
    rowTopSpacing?: SectionSpacing;
    rowBottomSpacing?: SectionSpacing;
    rowTopMargin?: SectionSpacing;
    rowBottomMargin?: SectionSpacing;
    rowGap?: SectionSpacing;
    rowAlignment?: "top" | "center" | "bottom";
    rowJustify?: "start" | "center" | "between" | "around";
    rowMatchHeight?: boolean;
    columnHorizontalAlign?: "left" | "center" | "right";
    columnVerticalAlign?: "top" | "center" | "bottom";
    columnFlex?: "none" | "expand";
    columnResponsiveWidth?: "inherit" | "stack";
    rowBorderRadius?: number;
    rowVisualStyle?: BuilderVisualStyle;
    headerGap?: string;
    headerJustify?: "start" | "center" | "space-between" | "end";
    headerAlign?: "start" | "center" | "end" | "stretch";
    rowAnimation?: BuilderAnimationSettings;
  }[];
  badges?: {
    contentTranslations?: BuilderContentTranslations;
    id?: string;
    label?: string;
    title?: string;
    body?: string;
    items?: string[];
    listIcon?: "check" | "circleCheck" | "arrowRight" | "star" | "heart" | "sparkles" | "shield";
    listIconColorScheme?: "default" | "gradient-cycle";
    listIconSize?: number;
  }[];
  slides?: {
    contentTranslations?: BuilderContentTranslations;
    id?: string;
    title?: string;
    meta?: string;
    subtitle?: string;
    text?: string;
    badge?: string;
    imageUrl?: string;
    imageAlt?: string;
    thumbnailUrl?: string;
    thumbnailPosition?: BuilderCarouselImagePosition;
    imagePadding?: SlideImagePadding;
    imageFit?: BuilderCarouselImageFit;
    imageRatio?: BuilderCarouselImageRatio;
    imageShape?: string;
    imageShadow?: "none" | "small" | "medium" | "large" | "xlarge" | string;
    imageAlignment?: BuilderCarouselImageAlignment;
    imagePosition?: BuilderCarouselImagePosition;
    textColor?: "none" | "light" | "dark";
    itemElement?: "div" | "article" | "section" | "li";
    navigationLabel?: string;
    buttonAriaLabel?: string;
    imageWidth?: string;
    imageHeight?: string | number;
    imageLoading?: "lazy" | "eager";
    imageHoverTransition?: "none" | "scale-up" | "scale-down" | string;
    imageSvgInline?: boolean;
    imageSvgColor?: string;
    imageBorder?: string;
    imageBoxShadow?: string;
    iconName?: string;
    iconSize?: number;
    panelStyle?: string;
    panelSize?: BuilderCarouselPanelSize;
    panelHover?: boolean;
    linkPanel?: boolean;
    headingLevel?: BuilderLayoutBlock["headingLevel"];
    headingSize?: BuilderLayoutBlock["headingSize"];
    titleTypographyRole?: string;
    headingAlign?: string;
    titleDecoration?: string;
    titleColor?: string;
    metaTypographyRole?: string;
    metaAlign?: BuilderCarouselMetaPosition;
    metaHtmlElement?: BuilderCarouselMetaElement;
    metaStyle?: string;
    metaColor?: string;
    gridMetaAlign?: BuilderCarouselMetaPosition;
    contentTypographyRole?: string;
    contentAlign?: string;
    contentStyle?: string;
    showAction?: boolean;
    fullWidthButton?: boolean;
    buttonLabel?: string;
    buttonUrl?: string;
    buttonTarget?: BuilderCarouselActionTarget;
    buttonStyle?: BuilderLayoutBlock["buttonStyle"];
    buttonSize?: BuilderCarouselActionSize;
    typography?: TypographySettings;
    items?: string[];
    listIcon?: "check" | "circleCheck" | "arrowRight" | "star" | "heart" | "sparkles" | "shield";
    listIconColorScheme?: "default" | "gradient-cycle";
    listIconSize?: number;
    dynamicContext?: DynamicContentContextDescriptor;
    dynamicBindings?: DynamicFieldBindings<
      | "title"
      | "meta"
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
    slideMode?: string;
    /** Public semantic adapter over the shared carousel primitive. */
    presentation?: "slideshow" | "overlay-slider" | "panel-slider";
    loop?: boolean;
    autoplay?: boolean;
    autoplayDelayMs?: number;
    speed?: number;
    align?: "center" | "start";
    dragFree?: boolean;
    effect?: "slide" | "fade";
    spaceBetween?: number;
    coverflowRotate?: number;
    coverflowDepth?: number;
    coverflowStretch?: number;
    cardsRotate?: boolean;
    cardsShadows?: boolean;
    creativePreset?: "soft-stack" | "deep" | "scale";
    fadeCrossFade?: boolean;
    freeModeMomentum?: boolean;
    cardsPerView?: number;
    cardsPerViewPhone?: number;
    cardsPerViewSmall?: number;
    cardsPerViewMedium?: number;
    cardsPerViewLarge?: number;
    cardsPerViewXLarge?: number;
    contentAlign?: "left" | "center" | "right";
    /** Panel Slider element-level media defaults. Item values remain local overrides. */
    imageWidth?: string;
    imageHeight?: string | number;
    imageFit?: BuilderCarouselImageFit;
    imageRatio?: BuilderCarouselImageRatio;
    imageShape?: string;
    imageShadow?: "none" | "small" | "medium" | "large" | "xlarge" | string;
    imagePosition?: BuilderCarouselImagePosition;
    imageLoading?: "lazy" | "eager";
    imageHoverTransition?: "none" | "scale-up" | "scale-down" | string;
    imageSvgInline?: boolean;
    imageSvgColor?: string;
    headingLevel?: BuilderLayoutBlock["headingLevel"];
    headingSize?: BuilderLayoutBlock["headingSize"];
    titleTypographyRole?: BuilderLayoutBlock["titleTypographyRole"];
    metaTypographyRole?: BuilderLayoutBlock["metaTypographyRole"];
    contentTypographyRole?: BuilderLayoutBlock["contentTypographyRole"];
    contentStyle?: string;
    contentMarginTop?: string;
    titleMarginTop?: string;
    buttonStyle?: BuilderLayoutBlock["buttonStyle"];
    buttonSize?: BuilderCarouselActionSize;
    metaPosition?: BuilderCarouselMetaPosition;
    metaHtmlElement?: BuilderCarouselMetaElement;
    metaStyle?: string;
    linkTarget?: BuilderCarouselActionTarget;
    /** Whole-element link; distinct from an individual slide action. */
    elementLinkUrl?: string;
    elementLinkTarget?: BuilderCarouselActionTarget;
    /** Shared Panel Slider divider between visible items. */
    divider?: boolean;
    showArrows?: boolean;
    showDots?: boolean;
    showNavigation?: boolean;
    pauseOnHover?: boolean;
    sets?: boolean;
    velocity?: number;
    fillColumnSpace?: boolean;
    sliderParallax?: boolean;
    sliderParallaxEasing?: number;
    sliderParallaxTarget?: string;
    sliderParallaxStart?: string;
    sliderParallaxEnd?: string;
    showVideo?: boolean;
    showHoverImage?: boolean;
    showHoverVideo?: boolean;
    linkImage?: boolean;
    arrowStyle?: string;
    arrowPosition?: string;
    /** Existing shared slidenav visibility threshold. */
    slidenavBreakpoint?: BuilderCarouselBreakpoint;
    paginationStyle?: string;
    paginationPosition?: string;
    aspectRatio?: string;
    overlayGradient?: string;
    overlayContainer?: "none" | "default" | "small" | "large" | "xlarge" | "expand" | string;
    overlayContainerPadding?: "default" | "xsmall" | "small" | "large" | "xlarge" | string;
    overlayMargin?: "default" | "small" | "large" | "none" | string;
    overlayPosition?: string;
    overlayAnimation?: "parallax" | "fade" | "scale-up" | "scale-down" | string;
    overlayParallax?: BuilderParallaxSettings;
    overlayColor?: string;
    overlayTextColor?: string;
    overlayMode?: "cover" | "caption";
    overlayDisplay?: "always" | "hover" | "active";
    overlayPadding?: string;
    overlayWidth?: "none" | "small" | "medium" | "large" | "xlarge" | "2xlarge" | string;
    contentExpand?: boolean;
    overlayLink?: boolean;
    /** Panel/Card defaults remain inherited by items unless the item overrides. */
    panelStyle?: string;
    panelSize?: BuilderCarouselPanelSize;
    panelHover?: boolean;
    itemWidthMode?: "fixed" | "auto";
    slideshowHeight?: "auto" | "viewport" | "section";
    slideshowViewportHeight?: number;
    slideshowHeightExpand?: boolean;
    slideshowRatio?: string;
    slideshowMinHeight?: number;
    slideshowMaxHeight?: number;
    /** Persisted source values; runtime responsiveness remains deferred. */
    navigationBreakpoint?: BuilderCarouselBreakpoint;
    /** Slideshow navigation is a UIkit semantic (none / dotnav). */
    navigationType?: "none" | "dotnav" | "thumbnav" | string;
    /** UIkit navigation position and its semantic inset/margin tier. */
    navigationMargin?: "none" | "small" | "medium" | "large" | string;
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
    slidenavOutsideBreakpoint?: BuilderCarouselBreakpoint;
    kenBurns?: boolean;
    scrubSpeed?: number;
    pinHeightFactor?: number;
  };
  pagination?: {
    enabled: boolean;
    perPage: number;
    mode: "loadMore" | "pageNumbers" | "infinite";
    infiniteScroll?: boolean;
    style?: "standard" | "solid" | "minimal" | "rounded";
  };
  visible: boolean;
  typography?: TypographySettings | TypographyGroup;
  visualStyle?: BuilderVisualStyle;
  animation?: BuilderAnimationSettings;
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
  premiumButtonStyle?: "neon-glow" | "cyber-glitch" | "glassmorphic" | "default";
  premiumCardStyle?: "neon-border" | "glass-morph" | "cyber-grid" | "none";
  textGradientPreset?: "indigo-purple" | "cyan-blue" | "emerald-teal" | "sunset-orange" | "indigo-purple-cyan" | "sunset-pink" | "gold-amber" | "none" | "custom";
  textGradientCustomStart?: string;
  textGradientCustomMiddle?: string;
  textGradientCustomEnd?: string;
  textGradientCustomAngle?: number;
  textGradientCustomStartOffset?: number;
  textGradientCustomMiddleOffset?: number;
  textGradientCustomEndOffset?: number;
};

export type BuilderContentTranslations = Record<
  string,
  Record<string, unknown>
>;

export type BuilderState = {
  page: BuilderLayoutKey;
  targetType?: BuilderTargetType;
  template?: BuilderTemplate;
  documentId?: string;
  displayName?: string;
  design: BuilderDesign;
  sections: BuilderSection[];
};

export type BuilderCustomPage = {
  id: string;
  key: BuilderCustomPageKey;
  title: string;
  slug: string;
  systemRole?: "shop" | "cart" | "checkout" | "my-account" | "front-page" | "posts-page";
  sourceDatabaseId?: number;
  updatedAt?: string;
};

export type BuilderSavedTemplate = {
  id: string;
  title: string;
  /** Library ownership supplied by the templates API. */
  libraryScope?: "site" | "shared";
  templateType?: LayoutLibraryType;
  description?: string;
  sourcePage?: BuilderLayoutKey;
  design?: BuilderDesign;
  sections: BuilderSection[];
  updatedAt: string;
};
