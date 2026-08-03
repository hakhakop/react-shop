import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  backupRootBuilderFileBeforeWrite,
  ensureRootBuilderData,
  getBuilderLayoutStorePath,
  getBuilderPagesPath,
  getBuilderTemplatesPath,
} from "@/lib/websiteBuilderData";

export type BuilderCustomPageKey = `page:${string}`;
export type BuilderPage = "home" | "shop" | "client" | BuilderCustomPageKey;
export type BuilderTemplate =
  | "product-single"
  | "product-category"
  | "product-category-specific"
  | "search-results";
export type BuilderDocumentKey = "header" | "footer";
export type BuilderLayoutKey = BuilderPage | BuilderTemplate | BuilderDocumentKey;
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

export type BuilderListItem = {
  id: string;
  text: string;
  url?: string;
  target?: "_self" | "_blank";
  iconName?: string;
  iconSize?: number;
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
  id?: string;
  kind?: string;
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
  secondaryButtonLabel?: string;
  secondaryButtonUrl?: string;
  secondaryButtonTarget?: string;
  secondaryButtonStyle?: string;
  secondaryButtonSize?: "small" | "default" | "large";
  buttonsLayout?: "inline" | "stacked";
  buttonGap?: string;
  buttons?: {
    id?: string;
    label?: string;
    url?: string;
    target?: string;
    style?: string;
    size?: "small" | "default" | "large";
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
  imageUrl?: string;
  imageAlt?: string;
  imageAlignment?: "left" | "center" | "right";
  imageMaxWidth?: number;
  imageBorderRadius?: number;
  imageFit?: "contain" | "cover" | "fill";
  imageRatio?: "auto" | "natural" | "square" | "4:3" | "3:2" | "4:5" | "3:4" | "16:9" | "portrait";
  imageShape?: "none" | "rounded" | "circle";
  imageShadow?: "none" | "small" | "medium" | "large" | "xlarge";
  imageWidth?: "auto" | "full" | "small" | "medium" | "large" | "xlarge";
  imageLoading?: "lazy" | "eager";
  imageLinkUrl?: string;
  imageLinkTarget?: "_self" | "_blank";
  borderRadius?: number;
  imageCaption?: string;
  elementBackgroundMode?: string;
  elementBackground?: string;
  elementPadding?: string;
  elementAlign?: string;
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
    imagePadding?: string;
    buttonLabel?: string;
    buttonUrl?: string;
    items?: string[];
    listIcon?: string;
    listIconColorScheme?: string;
    listIconSize?: number;
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
    showArrows?: boolean;
    showDots?: boolean;
    pauseOnHover?: boolean;
    arrowStyle?: string;
    arrowPosition?: string;
    paginationStyle?: string;
    paginationPosition?: string;
    kenBurns?: boolean;
    speed?: number;
    slideMode?: string;
    overlayGradient?: string;
    overlayPosition?: string;
    overlayColor?: string;
    overlayTextColor?: string;
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
  headingLevel?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
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
  headingAlign?: "left" | "center" | "right";
  textVariant?: "default" | "lead" | "meta" | "small" | "large" | "muted";
  textAlign?: "left" | "center" | "right";
  dateLabel?: string;
  tableHeadings?: string[];
  tableRows?: string[][];
  tableStyle?: string;
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
  gridItemRenderer?: "plain" | "card";
  gridCardVariant?: "default" | "primary" | "secondary" | "blank";
  gridCardSize?: "small" | "default" | "large";
  gridCardHover?: boolean;
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
    buttonStyle?: "primary" | "secondary" | "outline" | "ghost" | "link";
    buttonTarget?: "_self" | "_blank";
    buttonAlign?: "left" | "center" | "right";
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
    typography?: Record<string, unknown>;
    items?: string[];
    iconName?: string;
    iconSize?: number;
    listIcon?: "check" | "circleCheck" | "arrowRight" | "star" | "heart" | "sparkles" | "shield";
    listIconColorScheme?: "default" | "gradient-cycle";
    listIconSize?: number;
  }[];
  galleryShowThumbnails?: boolean;
  galleryThumbnailPosition?: string;
  galleryImageFit?: string;
  galleryHeight?: number;
  typography?: Record<string, unknown>;
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
  };
};

export type BuilderSection = {
  headerArchitectureVersion?: 2;
  headerPresetKey?: string;
  headerUtilityMigrationVersion?: 1 | 2 | 3;
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
  id: string;
  name?: string;
  anchorId?: string;
  kind: string;
  title: string;
  eyebrow?: string;
  body?: string;
  items?: string[];
  listIcon?: string;
  listIconColorScheme?: string;
  listIconSize?: number;
  background: string;
  backgroundMode?: string;
  backgroundEffect?: string;
  antigravitySpeed?: number;
  antigravityParticleCount?: number;
  antigravityColor?: string;
  antigravityGridDensity?: string;
  antigravityInteractive?: boolean;
  antigravityShowGrid?: boolean;
  antigravityShowParticles?: boolean;
  antigravityGridMoveSpeed?: number;
  antigravityGlowIntensity?: number;
  antigravityVisualMode?: string;
  antigravityInteractionScope?: string;
  contentMode?: string;
  sectionVariant?: "default" | "muted" | "primary" | "secondary";
  sectionHeight?: "auto" | "viewport" | "viewport-80";
  contentVerticalAlign?: "top" | "center" | "bottom";
  pullUnderHeader?: boolean;
  colorScheme?: string;
  layout?: string;
  topSpacing?: string;
  bottomSpacing?: string;
  topMargin?: string;
  bottomMargin?: string;
  buttonLabel?: string;
  buttonUrl?: string;
  buttonTarget?: string;
  columns?: number;
  filterPosition?: string;
  cardStyle?: string;
  cardPreset?: string;
  gridGap?: string;
  cardPadding?: string;
  imagePadding?: string;
  imageFit?: "contain" | "cover" | "fill";
  imageRatio?: "auto" | "square" | "4:5" | "3:4" | "16:9";
  borderRadius?: number;
  addToCartStyle?: string;
  addToCartSize?: string;
  addToCartPosition?: string;
  addToCartVisibility?: string;
  addToCartDisplay?: string;
  source?: string;
  categoryId?: string;
  hiddenCategorySlugs?: string[];
  gridLimit?: number;
  layoutVariant?: string;
  promoVariant?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  embedMode?: string;
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
      gap?: string;
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
    rowBackgroundMode?: string;
    rowBackgroundEffect?: string;
    rowAntigravitySpeed?: number;
    rowAntigravityParticleCount?: number;
    rowAntigravityColor?: string;
    rowAntigravityGridDensity?: string;
    rowAntigravityInteractive?: boolean;
    rowAntigravityShowGrid?: boolean;
    rowAntigravityShowParticles?: boolean;
    rowAntigravityGridMoveSpeed?: number;
    rowAntigravityGlowIntensity?: number;
    rowAntigravityVisualMode?: string;
    rowAntigravityInteractionScope?: string;
    rowColorScheme?: string;
    rowTopSpacing?: string;
    rowBottomSpacing?: string;
    rowTopMargin?: string;
    rowBottomMargin?: string;
    rowGap?: string;
    rowAlignment?: "top" | "center" | "bottom";
    rowJustify?: "start" | "center" | "between" | "around";
    rowMatchHeight?: boolean;
    columnHorizontalAlign?: "left" | "center" | "right";
    columnVerticalAlign?: "top" | "center" | "bottom";
    columnFlex?: "none" | "expand";
    columnResponsiveWidth?: "inherit" | "stack";
    rowBorderRadius?: number;
    rowVisualStyle?: Record<string, unknown>;
    headerGap?: string;
    headerJustify?: "start" | "center" | "space-between" | "end";
    headerAlign?: "start" | "center" | "end" | "stretch";
    rowAnimation?: Record<string, unknown>;
  }[];
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
    imagePadding?: string;
    buttonLabel?: string;
    buttonUrl?: string;
    typography?: Record<string, unknown>;
    items?: string[];
    listIcon?: string;
    listIconColorScheme?: string;
    listIconSize?: number;
  }[];
  carouselSettings?: {
    variant?: string;
    slideMode?: string;
    loop?: boolean;
    autoplay?: boolean;
    autoplayDelayMs?: number;
    speed?: number;
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
    showArrows?: boolean;
    showDots?: boolean;
    pauseOnHover?: boolean;
    arrowStyle?: string;
    arrowPosition?: string;
    paginationStyle?: string;
    paginationPosition?: string;
    kenBurns?: boolean;
    overlayGradient?: string;
    overlayPosition?: string;
    overlayColor?: string;
    overlayTextColor?: string;
    aspectRatio?: string;
  };
  visible: boolean;
  typography?: Record<string, unknown>;
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
  pagination?: {
    enabled: boolean;
    perPage: number;
    mode: "loadMore" | "pageNumbers" | "infinite";
    infiniteScroll?: boolean;
    style?: "standard" | "solid" | "minimal" | "rounded";
  };
};

export type BuilderLayout = {
  version: 1;
  key?: BuilderLayoutKey;
  page: BuilderLayoutKey;
  targetType?: "page" | "template" | BuilderDocumentKey;
  template?: BuilderTemplate;
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
  templateType?: "page" | "section" | "row" | "element";
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
  await writeFile(filePath, `${JSON.stringify(store, null, 2)}\n`, "utf8");
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

export async function readBuilderSavedTemplates(): Promise<
  BuilderSavedTemplate[]
> {
  try {
    const raw = await readFile(getBuilderTemplatesPath(), "utf8");
    const parsed = JSON.parse(raw) as BuilderSavedTemplate[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isValidBuilderSavedTemplate);
  } catch {
    return [];
  }
}

export async function writeBuilderSavedTemplates(
  templatesToWrite: BuilderSavedTemplate[],
) {
  const filePath = getBuilderTemplatesPath();
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
