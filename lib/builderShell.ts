import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

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

export type BuilderMenuPresentation = {
  showHeading: boolean;
  icon: string | null;
  submenuLayout: "list" | "grid" | "mega";
  submenuColumns: number;
  badgeText: string | null;
};

export type BuilderMenuPresentationMap = Record<string, BuilderMenuPresentation>;

export type BuilderShellSettings = {
  headerVisible: boolean;
  topToolbarVisible: boolean;
  topToolbarText: string;
  topToolbarPhone: string;
  topToolbarMeta: string;
  headerBackgroundMode: BuilderHeaderBackgroundMode;
  headerLayout: BuilderHeaderLayout;
  headerBrandMode: BuilderHeaderBrandMode;
  headerBrandText: string;
  headerLogoUrl: string | null;
  headerLogoAlt: string;
  headerLogoMaxWidth: number;
  headerIconVariant: BuilderHeaderIconVariant;
  headerIconOrder: BuilderHeaderIconId[];
  headerActiveIndicator: BuilderHeaderActiveIndicator;
  sectionPaddingTop: BuilderSectionSpacing;
  sectionPaddingBottom: BuilderSectionSpacing;
  sectionMarginTop: BuilderSectionSpacing;
  sectionMarginBottom: BuilderSectionSpacing;
  menuPresentation: BuilderMenuPresentationMap;
  storefrontPreset: string;
  primaryColor: string;
  accentColor: string;
  updatedAt?: string;
};

export type BuilderSectionSpacing = string;

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "builder-shell.json");

export const defaultBuilderShellSettings: BuilderShellSettings = {
  headerVisible: true,
  topToolbarVisible: true,
  topToolbarText: "Fast support & setup by Webpages",
  topToolbarPhone: "+374 xx xx xx",
  topToolbarMeta: "AMD ֏",
  headerBackgroundMode: "default",
  headerLayout: "wordpress",
  headerBrandMode: "logo",
  headerBrandText: "WebPages",
  headerLogoUrl: null,
  headerLogoAlt: "Site logo",
  headerLogoMaxWidth: 160,
  headerIconVariant: "muted",
  headerIconOrder: ["wishlist", "cart", "account", "theme", "search"],
  headerActiveIndicator: "underline",
  sectionPaddingTop: "medium",
  sectionPaddingBottom: "medium",
  sectionMarginTop: "none",
  sectionMarginBottom: "none",
  menuPresentation: {},
  storefrontPreset: "princity",
  primaryColor: "#111111",
  accentColor: "#111111",
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
    headerIconVariant: normalizeHeaderIconVariant(value?.headerIconVariant),
    headerIconOrder: normalizeHeaderIconOrder(value?.headerIconOrder),
    headerActiveIndicator: normalizeHeaderActiveIndicator(
      value?.headerActiveIndicator,
    ),
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
    menuPresentation: normalizeMenuPresentationMap(value?.menuPresentation),
    storefrontPreset: preset,
    primaryColor: typeof value?.primaryColor === "string" && value.primaryColor.trim().length > 0
      ? value.primaryColor.trim()
      : defaultBuilderShellSettings.primaryColor,
    accentColor: typeof value?.accentColor === "string" && value.accentColor.trim().length > 0
      ? value.accentColor.trim()
      : defaultBuilderShellSettings.accentColor,
  };
}

export async function getBuilderShellSettings(): Promise<BuilderShellSettings> {
  try {
    const raw = await readFile(DATA_FILE, "utf8");
    return normalizeBuilderShellSettings(JSON.parse(raw));
  } catch {
    return defaultBuilderShellSettings;
  }
}

export async function writeBuilderShellSettings(settings: BuilderShellSettings) {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(
    DATA_FILE,
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
