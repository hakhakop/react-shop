export type BuilderCustomPageKey = `page:${string}`;
export type BuilderPage = "home" | "shop" | "client" | BuilderCustomPageKey;
export type BuilderTemplate =
  | "product-single"
  | "product-category"
  | "product-category-specific"
  | "search-results";
export type BuilderLayoutKey = BuilderPage | BuilderTemplate;
export type BuilderTargetType = "page" | "template";
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
export type InspectorTab =
  | "content"
  | "layout"
  | "spacing"
  | "style"
  | "typography"
  | "advanced";
export type SidebarTab =
  | "elements"
  | "inspector"
  | "globalStyles"
  | "menu"
  | "pages"
  | "templates"
  | "settings";
export type SlideImagePadding = "frameless" | "small" | "medium" | "max";
export type SectionBackgroundMode = "full" | "boxed";
export type SectionContentMode = "full" | "boxed" | "narrow";
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
  | "promoStrip"
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
  | "accountContent";

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
  id?: string;
  kind?: LayoutBlockKind;
  eyebrow?: string;
  title?: string;
  body?: string;
  buttonLabel?: string;
  buttonUrl?: string;
  buttonTarget?: "_self" | "_blank";
  buttonStyle?: "primary" | "secondary" | "outline" | "ghost" | "light";
  secondaryButtonLabel?: string;
  secondaryButtonUrl?: string;
  secondaryButtonTarget?: "_self" | "_blank";
  secondaryButtonStyle?: "primary" | "secondary" | "outline" | "ghost" | "light";
  buttonsLayout?: "inline" | "stacked";
  buttons?: {
    id?: string;
    label?: string;
    url?: string;
    target?: "_self" | "_blank";
    style?: "primary" | "secondary" | "outline" | "ghost" | "light";
  }[];
  imageUrl?: string;
  imageAlt?: string;
  imageAlignment?: "left" | "center" | "right";
  imageMaxWidth?: number;
  imageBorderRadius?: number;
  borderRadius?: number;
  imageCaption?: string;
  elementBackgroundMode?: "default" | "transparent" | "custom";
  elementBackground?: string;
  elementPadding?: "none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "small" | "medium" | "large" | string;
  elementAlign?: "left" | "center" | "right";
  panelStyle?: BuilderPanelStyle;
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
  iconName?: "sparkles" | "heart" | "truck" | "shield";
  items?: string[];
  listIcon?: "check" | "circleCheck" | "arrowRight" | "star" | "heart" | "sparkles" | "shield";
  listIconColorScheme?: "default" | "gradient-cycle";
  listIconSize?: number;
  headingText?: string;
  headingLevel?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  headingAlign?: "left" | "center" | "right";
  dateLabel?: string;
  tableHeadings?: string[];
  tableRows?: string[][];
  tableStyle?: "striped" | "bordered" | "plain";
  gridSource?: "static" | "products";
  gridRows?: number;
  gridGap?: "none" | "small" | "medium" | "large" | "max";
  gridMargin?: "inherit" | "none" | "small" | "medium" | "large";
  cardPadding?: "none" | "small" | "medium" | "large" | "max";
  imagePadding?: "none" | "small" | "medium" | "large" | "max";
  imageFit?: "contain" | "cover" | "fill";
  imageRatio?: "auto" | "square" | "4:5" | "3:4";
  gridImagePadding?: "frameless" | "small" | "medium" | "max";
  gridContentPadding?: "none" | "small" | "medium" | "large";
  gridImageFrame?: "none" | "soft";
  addToCartStyle?: "blue" | "dark" | "light" | "inherit";
  addToCartSize?: "compact" | "medium" | "large" | "full";
  addToCartPosition?: "below" | "under-price" | "under-wishlist";
  addToCartVisibility?: "hover" | "always";
  addToCartDisplay?: "button" | "icon";
  gridShowImage?: boolean;
  gridShowEyebrow?: boolean;
  gridShowMeta?: boolean;
  gridShowText?: boolean;
  gridShowButton?: boolean;
  gridItems?: {
    id?: string;
    imageUrl?: string;
    imageAlt?: string;
    eyebrow?: string;
    title?: string;
    meta?: string;
    text?: string;
    buttonLabel?: string;
    buttonUrl?: string;
    typography?: TypographySettings;
    items?: string[];
    listIcon?: "check" | "circleCheck" | "arrowRight" | "star" | "heart" | "sparkles" | "shield";
    listIconColorScheme?: "default" | "gradient-cycle";
    listIconSize?: number;
  }[];
  galleryShowThumbnails?: boolean;
  galleryThumbnailPosition?: "bottom" | "left";
  galleryImageFit?: "contain" | "cover";
  galleryHeight?: number;
  typography?: TypographySettings | TypographyGroup;
  visualStyle?: BuilderVisualStyle;
  animation?: BuilderAnimationSettings;
  typewriterEnabled?: boolean;
  typewriterSpeed?: number;
  typewriterEraseSpeed?: number;
  typewriterDelay?: number;
  typewriterLoop?: boolean;
  typewriterUseGradient?: boolean;
  typewriterGradientPreset?: string;
  premiumButtonStyle?: "neon-glow" | "cyber-glitch" | "glassmorphic" | "default";
  premiumCardStyle?: "neon-border" | "glass-morph" | "cyber-grid" | "none";
  textGradientPreset?: "indigo-purple" | "cyan-blue" | "emerald-teal" | "sunset-orange" | "none" | "custom";
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
};

export type WordPressMediaItem = {
  id: number;
  title: string;
  altText?: string;
  mimeType?: string;
  sourceUrl: string;
  thumbnailUrl: string;
  date?: string;
};

export type BuilderSection = {
  id: string;
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
  gridGap?: "none" | "small" | "medium" | "large" | "max";
  cardPadding?: "none" | "small" | "medium" | "large" | "max";
  imagePadding?: "none" | "small" | "medium" | "large" | "max";
  imageFit?: "contain" | "cover" | "fill";
  imageRatio?: "auto" | "square" | "4:5" | "3:4";
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
    rowBorderRadius?: number;
    rowVisualStyle?: BuilderVisualStyle;
    rowAnimation?: BuilderAnimationSettings;
  }[];
  badges?: {
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
    loop?: boolean;
    autoplay?: boolean;
    autoplayDelayMs?: number;
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
  typewriterSpeed?: number;
  typewriterEraseSpeed?: number;
  typewriterDelay?: number;
  typewriterLoop?: boolean;
  typewriterUseGradient?: boolean;
  typewriterGradientPreset?: string;
  premiumButtonStyle?: "neon-glow" | "cyber-glitch" | "glassmorphic" | "default";
  premiumCardStyle?: "neon-border" | "glass-morph" | "cyber-grid" | "none";
  textGradientPreset?: "indigo-purple" | "cyan-blue" | "emerald-teal" | "sunset-orange" | "none" | "custom";
  textGradientCustomStart?: string;
  textGradientCustomMiddle?: string;
  textGradientCustomEnd?: string;
  textGradientCustomAngle?: number;
  textGradientCustomStartOffset?: number;
  textGradientCustomMiddleOffset?: number;
  textGradientCustomEndOffset?: number;
};

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
