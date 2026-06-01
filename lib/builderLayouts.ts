import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export type BuilderCustomPageKey = `page:${string}`;
export type BuilderPage = "home" | "shop" | "client" | BuilderCustomPageKey;
export type BuilderTemplate =
  | "product-single"
  | "product-category"
  | "product-category-specific"
  | "search-results";
export type BuilderLayoutKey = BuilderPage | BuilderTemplate;
export type BuilderPanelStyle =
  | "default"
  | "secondary"
  | "dark"
  | "light"
  | "clean-shadow"
  | "flat-dark"
  | "flat-white";

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
};

export type BuilderLayoutBlock = {
  id?: string;
  kind?: string;
  eyebrow?: string;
  title?: string;
  body?: string;
  buttonLabel?: string;
  buttonUrl?: string;
  buttonTarget?: string;
  buttonStyle?: string;
  secondaryButtonLabel?: string;
  secondaryButtonUrl?: string;
  secondaryButtonTarget?: string;
  secondaryButtonStyle?: string;
  buttonsLayout?: "inline" | "stacked";
  buttons?: {
    id?: string;
    label?: string;
    url?: string;
    target?: string;
    style?: string;
  }[];
  imageUrl?: string;
  imageAlt?: string;
  imageAlignment?: "left" | "center" | "right";
  imageMaxWidth?: number;
  imageBorderRadius?: number;
  imageCaption?: string;
  elementBackgroundMode?: string;
  elementBackground?: string;
  elementPadding?: string;
  elementAlign?: string;
  panelStyle?: BuilderPanelStyle;
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
  };
  iconName?: string;
  items?: string[];
  listIcon?: string;
  headingText?: string;
  headingLevel?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  headingAlign?: "left" | "center" | "right";
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
    typography?: Record<string, unknown>;
  }[];
  galleryShowThumbnails?: boolean;
  galleryThumbnailPosition?: string;
  galleryImageFit?: string;
  galleryHeight?: number;
  typography?: Record<string, unknown>;
  visualStyle?: Record<string, unknown>;
  animation?: Record<string, unknown>;
};

export type BuilderSection = {
  id: string;
  kind: string;
  title: string;
  eyebrow?: string;
  body?: string;
  background: string;
  backgroundMode?: string;
  contentMode?: string;
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
    imagePadding?: string;
    buttonLabel?: string;
    buttonUrl?: string;
    typography?: Record<string, unknown>;
  }[];
  carouselSettings?: {
    variant?: string;
    loop?: boolean;
    autoplay?: boolean;
    autoplayDelayMs?: number;
    align?: string;
    dragFree?: boolean;
    cardsPerView?: number;
    showArrows?: boolean;
    showDots?: boolean;
    pauseOnHover?: boolean;
  };
  visible: boolean;
  typography?: Record<string, unknown>;
  visualStyle?: Record<string, unknown>;
  animation?: Record<string, unknown>;
};

export type BuilderLayout = {
  version: 1;
  key?: BuilderLayoutKey;
  page: BuilderLayoutKey;
  targetType?: "page" | "template";
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
  description?: string;
  sourcePage?: BuilderLayoutKey;
  design?: BuilderDesign;
  sections: BuilderSection[];
  updatedAt: string;
};

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "builder-layouts.json");
const PAGES_FILE = path.join(DATA_DIR, "builder-pages.json");
const TEMPLATES_FILE = path.join(DATA_DIR, "builder-templates.json");
const pages = new Set(["home", "shop", "client"]);
const templates = new Set([
  "product-single",
  "product-category",
  "product-category-specific",
  "search-results",
]);
const layoutKeys = new Set([...pages, ...templates]);

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

export function getBuilderTargetType(key: BuilderLayoutKey) {
  return templates.has(key) ? "template" : "page";
}

export function isBuilderTemplate(
  key: BuilderLayoutKey,
): key is BuilderTemplate {
  return templates.has(key);
}

export async function readBuilderLayoutStore(): Promise<BuilderLayoutStore> {
  try {
    const raw = await readFile(DATA_FILE, "utf8");
    const parsed = JSON.parse(raw) as BuilderLayoutStore;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export async function getPublishedBuilderLayout(
  page: BuilderLayoutKey,
): Promise<BuilderLayout | null> {
  const store = await readBuilderLayoutStore();
  return store[page] ?? null;
}

export async function writeBuilderLayoutStore(store: BuilderLayoutStore) {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(DATA_FILE, `${JSON.stringify(store, null, 2)}\n`, "utf8");
}

export async function readBuilderCustomPages(): Promise<BuilderCustomPage[]> {
  try {
    const raw = await readFile(PAGES_FILE, "utf8");
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
) {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(
    PAGES_FILE,
    `${JSON.stringify(pagesToWrite, null, 2)}\n`,
    "utf8",
  );
}

export async function readBuilderSavedTemplates(): Promise<
  BuilderSavedTemplate[]
> {
  try {
    const raw = await readFile(TEMPLATES_FILE, "utf8");
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
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(
    TEMPLATES_FILE,
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
