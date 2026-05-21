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
  imageUrl?: string;
  imageAlt?: string;
  elementBackgroundMode?: string;
  elementBackground?: string;
  elementPadding?: string;
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
    cardsPerView?: number;
    showArrows?: boolean;
    showDots?: boolean;
    pauseOnHover?: boolean;
  };
  iconName?: string;
  items?: string[];
  dateLabel?: string;
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
  }[];
  galleryShowThumbnails?: boolean;
  galleryThumbnailPosition?: string;
  galleryImageFit?: string;
  galleryHeight?: number;
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

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "builder-layouts.json");
const PAGES_FILE = path.join(DATA_DIR, "builder-pages.json");
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
