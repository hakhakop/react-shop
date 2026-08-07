export type BuilderCustomPageKey = `page:${string}`;
export type BuilderPage = "home" | "shop" | "client" | BuilderCustomPageKey;
export type BuilderTemplate =
  | "product-single"
  | "product-category"
  | "product-category-specific"
  | "search-results";
export type BuilderDocumentKey = "header" | "footer";
export type BuilderLayoutKey = BuilderPage | BuilderTemplate | BuilderDocumentKey;
export type BuilderTargetType = "page" | "template" | BuilderDocumentKey;
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
export type MenuPresentationSettings = {
  showHeading: boolean;
  icon: string | null;
  submenuLayout: "list" | "grid" | "mega";
  submenuColumns: number;
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
  | "scrollPinnedDemo";
export type PreviewDevice = "desktop" | "tablet" | "mobile";
export type GlobalSectionSpacing = "none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "small" | "medium" | "large" | string;
export type SectionSpacing = "inherit" | GlobalSectionSpacing;
export type BuilderListItem = {
  id: string;
  text: string;
  url?: string;
  target?: "_self" | "_blank";
  iconName?: string;
  iconSize?: number;
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
  | "advanced";
export type SidebarTab =
  | "builder"
  | "elements"
  | "globalStyles"
  | "history"
  | "menu"
  | "pages"
  | "templates"
  | "settings";
export type SlideImagePadding = "frameless" | "small" | "medium" | "max";
export type SectionBackgroundMode = "full" | "boxed";
export type SectionContentMode = "full" | "boxed" | "narrow";
export type SectionHeight = "auto" | "viewport" | "viewport-80";
export type SectionContentVerticalAlign = "top" | "center" | "bottom";
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
  | "princity-gradient";
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
};
export type LayoutBlockKind =
  | "hero"
  | "button"
  | "grid"
  | "heading"
  | "hero"
  | "image"
  | "panel"
  | "table"
  | "text"
  | "slider"
  | "embed"
  | "fluentForm"
  | "badgeGrid"
  | "icon"
  | "list"
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
  | "gallery";
  

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


export type BuilderLayoutBlock = {
  contentTranslations?: BuilderContentTranslations;
  id?: string;
  kind?: LayoutBlockKind;
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
  buttonStyle?: "primary" | "secondary" | "outline" | "ghost" | "light";
  size?: "small" | "default" | "large";
  secondaryButtonLabel?: string;
  secondaryButtonUrl?: string;
  secondaryButtonTarget?: "_self" | "_blank";
  secondaryButtonStyle?: "primary" | "secondary" | "outline" | "ghost" | "light";
  secondaryButtonSize?: "small" | "default" | "large";
  buttonsLayout?: "inline" | "stacked";
  buttonGap?: string;
  buttons?: {
    contentTranslations?: BuilderContentTranslations;
    id?: string;
    label?: string;
    url?: string;
    target?: "_self" | "_blank";
    style?: "primary" | "secondary" | "outline" | "ghost" | "light";
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
  imageUrl?: string;
  imageAlt?: string;
  imageAlignment?: "left" | "center" | "right";
  imageMaxWidth?: number;
  imageBorderRadius?: number;
  imageShape?: "none" | "rounded" | "circle" | "pill";
  imageShadow?: "none" | "small" | "medium" | "large" | "xlarge";
  imageWidth?: "auto" | "full" | "small" | "medium" | "large" | "xlarge";
  imageLoading?: "lazy" | "eager";
  imageLinkUrl?: string;
  imageLinkTarget?: "_self" | "_blank";
  borderRadius?: number;
  imageCaption?: string;
  elementBackgroundMode?: "default" | "transparent" | "custom";
  elementBackground?: string;
  elementPadding?: "none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "small" | "medium" | "large" | string;
  elementAlign?: "left" | "center" | "right";
  panelStyle?: BuilderPanelStyle;
  panelVariant?: "default" | "primary" | "secondary" | "blank";
  panelHover?: boolean;
  panelSize?: "small" | "default" | "large";
  panelShowMedia?: boolean;
  panelMediaPlacement?: "top" | "left" | "right";
  panelMediaFit?: "cover" | "contain";
  panelMediaWidth?: "small" | "medium" | "large";
  panelMediaAlignment?: "left" | "center" | "right";
  panelTextAlign?: "left" | "center" | "right";
  panelVerticalAlign?: "top" | "center" | "bottom";
  panelTitleElement?: "h2" | "h3" | "h4" | "div";
  panelTitleStyle?: "inherit" | "h3" | "h4" | "h5";
  panelContentWidth?: "auto" | "small" | "medium" | "large" | "full";
  panelActionVisible?: boolean;
  panelActionStyle?: "default" | "primary" | "secondary" | "text";
  panelActionSize?: "small" | "default" | "large";
  panelActionAlign?: "inherit" | "left" | "center" | "right";
  hoverPreset?: string;
  embedMode?: EmbedMode;
  embedCode?: string;
  embedUrl?: string;
  embedHeight?: number;
  fluentFormId?: string;
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
  items?: string[];
  menuSource?: "main" | string;
  menuItemGap?: string;
  menuHoverColor?: string;
  menuActiveColor?: string;
  menuActiveIndicator?: BuilderHeaderActiveIndicator;
  headerBrandMode?: BuilderHeaderBrandMode;
  headerBrandText?: string;
  headerUtilityAction?: BuilderHeaderIconId;
  headerUtilityVariant?: BuilderHeaderIconVariant;
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
  listPresentation?: "default" | "bullet" | "divider" | "striped" | "large";
  listMarker?: "none" | "disc" | "circle" | "square";
  listAlign?: "left" | "center" | "right";
  listSpacing?: "compact" | "default" | "large";
  headingText?: string;
  headingLevel?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  headingAlign?: "left" | "center" | "right";
  headingSize?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "article-title" | "small" | "medium" | "large" | "xlarge";
  textVariant?: "default" | "lead" | "meta" | "small" | "large" | "muted";
  textAlign?: "left" | "center" | "right";
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
  accordionTitleStyle?: "inherit" | "h3" | "h4" | "h5";
  accordionContentStyle?: "inherit" | "default" | "lead" | "small" | "large" | "muted";
  /** @deprecated Read-only migration fallback for older Accordion documents. */
  accordionRowStyle?: "plain" | "divided" | "striped";
  /** @deprecated Read-only migration fallback for older Accordion documents. */
  accordionSpacing?: "compact" | "default" | "large";
  /** @deprecated Read-only migration fallback for older Accordion documents. */
  accordionOpenEmphasis?: "none" | "muted" | "primary";
  dateLabel?: string;
  tableHeadings?: string[];
  tableRows?: string[][];
  tableStyle?: "striped" | "bordered" | "plain";
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
  showHoverImage?: boolean;
  showHoverVideo?: boolean;
  gridMasonry?: string;
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
  lightboxAnimation?: string;
  lightboxNav?: string;
  gridShowImage?: boolean;
  gridShowEyebrow?: boolean;
  gridShowMeta?: boolean;
  gridShowText?: boolean;
  gridShowButton?: boolean;
  gridRowGap?: "none" | "small" | "medium" | "large";
  gridItemRenderer?: "plain" | "card";
  gridCardVariant?: "default" | "primary" | "secondary" | "blank";
  gridCardSize?: "small" | "default" | "large";
  gridCardHover?: boolean;
  gridMediaPlacement?: "top" | "left" | "right";
  gridMediaWidth?: "small" | "medium" | "large";
  gridMediaAlignment?: "left" | "center" | "right";
  gridItemAlign?: "left" | "center" | "right";
  gridStacking?: "inherit" | "stack";
  gridItems?: {
    contentTranslations?: BuilderContentTranslations;
    id?: string;
    imageUrl?: string;
    imageAlt?: string;
    eyebrow?: string;
    title?: string;
    meta?: string;
    text?: string;
    buttonLabel?: string;
    buttonUrl?: string;
    buttonStyle?: "primary" | "secondary" | "outline" | "ghost" | "link";
    buttonAlign?: "left" | "center" | "right";
    buttonTarget?: "_self" | "_blank";
    renderer?: "plain" | "card";
    cardVariant?: "default" | "primary" | "secondary" | "blank";
    cardSize?: "small" | "default" | "large";
    cardHover?: boolean;
    mediaPlacement?: "top" | "left" | "right";
    mediaRatio?: "natural" | "square" | "4:3" | "3:2" | "16:9" | "portrait";
    mediaFit?: "cover" | "contain";
    textAlign?: "left" | "center" | "right";
    titleElement?: "h2" | "h3" | "h4" | "div";
    titleStyle?: "inherit" | "h3" | "h4" | "h5";
    actionStyle?: "default" | "primary" | "secondary" | "text";
    actionSize?: "small" | "default" | "large";
    typography?: TypographySettings;
    items?: string[];
    iconName?: string;
    iconSize?: number;
    listIcon?: "check" | "circleCheck" | "arrowRight" | "star" | "heart" | "sparkles" | "shield";
    listIconColorScheme?: "default" | "gradient-cycle";
    listIconSize?: number;
  }[];
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
  headerTopToolbarVisible?: boolean;
  headerTopToolbarText?: string;
  headerTopToolbarPhone?: string;
  headerTopToolbarMeta?: string;
  contentTranslations?: BuilderContentTranslations;
  headerUtilityMigrationVersion?: 1 | 2 | 3;
  id: string;
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
  sectionHeight?: SectionHeight;
  contentVerticalAlign?: SectionContentVerticalAlign;
  sectionVariant?: "default" | "muted" | "primary" | "secondary";
  pullUnderHeader?: boolean;
  colorScheme?: SectionColorScheme;
  layout?: string;
  topSpacing?: SectionSpacing;
  bottomSpacing?: SectionSpacing;
  topMargin?: SectionSpacing;
  bottomMargin?: SectionSpacing;
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
  layoutItems?: {
    id?: string;
    rowId?: string;
    rowLayout?: string;
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
        weight: number;
        layout: "whole";
        columns: {
          id: string;
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
    subtitle?: string;
    text?: string;
    badge?: string;
    imageUrl?: string;
    imageAlt?: string;
    imagePadding?: SlideImagePadding;
    buttonLabel?: string;
    buttonUrl?: string;
    typography?: TypographySettings;
    items?: string[];
    listIcon?: "check" | "circleCheck" | "arrowRight" | "star" | "heart" | "sparkles" | "shield";
    listIconColorScheme?: "default" | "gradient-cycle";
    listIconSize?: number;
  }[];
  carouselSettings?: {
    variant?: string;
    slideMode?: string;
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
    showArrows?: boolean;
    showDots?: boolean;
    showNavigation?: boolean;
    pauseOnHover?: boolean;
    arrowStyle?: string;
    arrowPosition?: string;
    paginationStyle?: string;
    paginationPosition?: string;
    aspectRatio?: string;
    overlayGradient?: string;
    overlayPosition?: string;
    overlayColor?: string;
    overlayTextColor?: string;
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
  design: BuilderDesign;
  sections: BuilderSection[];
};

export type BuilderCustomPage = {
  key: BuilderCustomPageKey;
  title: string;
  slug: string;
  updatedAt?: string;
};

export type BuilderSavedTemplate = {
  id: string;
  title: string;
  templateType?: "page" | "section" | "row" | "element";
  description?: string;
  sourcePage?: BuilderLayoutKey;
  design?: BuilderDesign;
  sections: BuilderSection[];
  updatedAt: string;
};
