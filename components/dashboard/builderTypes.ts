export type BuilderCustomPageKey = `page:${string}`;
export type BuilderPage = "home" | "shop" | "client" | BuilderCustomPageKey;
export type BuilderTemplate =
  | "product-single"
  | "product-category"
  | "product-category-specific"
  | "search-results";
export type BuilderLayoutKey = BuilderPage | BuilderTemplate;
export type BuilderTargetType = "page" | "template";
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
export type BuilderShellSettings = {
  headerVisible: boolean;
  headerLayout: BuilderHeaderLayout;
  headerBrandMode: BuilderHeaderBrandMode;
  headerBrandText: string;
  headerLogoUrl: string | null;
  headerLogoAlt: string;
  headerLogoMaxWidth: number;
  headerIconVariant: BuilderHeaderIconVariant;
  headerIconOrder: BuilderHeaderIconId[];
  headerActiveIndicator: BuilderHeaderActiveIndicator;
  sectionPaddingTop: GlobalSectionSpacing;
  sectionPaddingBottom: GlobalSectionSpacing;
  sectionMarginTop: GlobalSectionSpacing;
  sectionMarginBottom: GlobalSectionSpacing;
  menuPresentation: Record<string, MenuPresentationSettings>;
};
export type BuilderPanelStyle =
  | "default"
  | "secondary"
  | "dark"
  | "light"
  | "clean-shadow"
  | "flat-dark"
  | "flat-white";
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
  | "embed";
export type PreviewDevice = "desktop" | "tablet" | "mobile";
export type GlobalSectionSpacing = "none" | "small" | "medium" | "large";
export type SectionSpacing = "inherit" | GlobalSectionSpacing;
export type InspectorTab = "section" | "element" | "style" | "advanced";
export type SidebarTab =
  | "elements"
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
export type LayoutBlockKind =
  | "hero"
  | "promoStrip"
  | "grid"
  | "image"
  | "panel"
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
};

export type BuilderLayoutBlock = {
  id?: string;
  kind?: LayoutBlockKind;
  eyebrow?: string;
  title?: string;
  body?: string;
  buttonLabel?: string;
  buttonUrl?: string;
  imageUrl?: string;
  imageAlt?: string;
  elementBackgroundMode?: "default" | "transparent" | "custom";
  elementBackground?: string;
  elementPadding?: "none" | "small" | "medium" | "large";
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
    | "luxury";
  gridLimit?: number;
  source?: "all" | "featured" | "category";
  categoryId?: string;
  layoutVariant?: "grid" | "carousel";
  badges?: BuilderSection["badges"];
  slides?: BuilderSection["slides"];
  carouselSettings?: BuilderSection["carouselSettings"];
  iconName?: "sparkles" | "heart" | "truck" | "shield";
  items?: string[];
  dateLabel?: string;
  gridSource?: "static" | "products";
  gridRows?: number;
  gridGap?: "none" | "small" | "medium" | "large" | "max";
  gridMargin?: "none" | "small" | "medium" | "large";
  cardPadding?: "none" | "small" | "medium" | "large" | "max";
  imagePadding?: "none" | "small" | "medium" | "large" | "max";
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
  }[];
  galleryShowThumbnails?: boolean;
  galleryThumbnailPosition?: "bottom" | "left";
  galleryImageFit?: "contain" | "cover";
  galleryHeight?: number;
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
  background: string;
  backgroundMode?: SectionBackgroundMode;
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
    | "luxury";
  gridGap?: "none" | "small" | "medium" | "large" | "max";
  cardPadding?: "none" | "small" | "medium" | "large" | "max";
  imagePadding?: "none" | "small" | "medium" | "large" | "max";
  addToCartStyle?: "blue" | "dark" | "light" | "inherit";
  addToCartSize?: "compact" | "medium" | "large" | "full";
  addToCartPosition?: "below" | "under-price" | "under-wishlist";
  addToCartVisibility?: "hover" | "always";
  addToCartDisplay?: "button" | "icon";
  source?: "all" | "featured" | "category";
  categoryId?: string;
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
    eyebrow?: string;
    title?: string;
    body?: string;
    buttonLabel?: string;
    buttonUrl?: string;
    blocks?: BuilderLayoutBlock[];
  }[];
  badges?: {
    id?: string;
    label?: string;
    title?: string;
    body?: string;
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
  }[];
  carouselSettings?: {
    variant?: string;
    loop?: boolean;
    autoplay?: boolean;
    autoplayDelayMs?: number;
    align?: "center" | "start";
    dragFree?: boolean;
    cardsPerView?: number;
    showArrows?: boolean;
    showDots?: boolean;
    pauseOnHover?: boolean;
  };
  visible: boolean;
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
  description?: string;
  sourcePage?: BuilderLayoutKey;
  design?: BuilderDesign;
  sections: BuilderSection[];
  updatedAt: string;
};
