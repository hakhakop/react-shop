import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export type BuilderHeaderLayout =
  | "wordpress"
  | "simple"
  | "two-row"
  | "hero"
  | "pill"
  | "princity";

export type BuilderShellSettings = {
  headerVisible: boolean;
  headerLayout: BuilderHeaderLayout;
  sectionPaddingTop: BuilderSectionSpacing;
  sectionPaddingBottom: BuilderSectionSpacing;
  sectionMarginTop: BuilderSectionSpacing;
  sectionMarginBottom: BuilderSectionSpacing;
  updatedAt?: string;
};

export type BuilderSectionSpacing = "none" | "small" | "medium" | "large";

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "builder-shell.json");

export const defaultBuilderShellSettings: BuilderShellSettings = {
  headerVisible: true,
  headerLayout: "wordpress",
  sectionPaddingTop: "medium",
  sectionPaddingBottom: "medium",
  sectionMarginTop: "none",
  sectionMarginBottom: "none",
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

function normalizeSectionSpacing(value: unknown, fallback: BuilderSectionSpacing) {
  return value === "none" ||
    value === "small" ||
    value === "medium" ||
    value === "large"
    ? value
    : fallback;
}

export function normalizeBuilderShellSettings(
  value: Partial<BuilderShellSettings> | null | undefined
): BuilderShellSettings {
  return {
    ...defaultBuilderShellSettings,
    ...(value ?? {}),
    headerVisible:
      typeof value?.headerVisible === "boolean"
        ? value.headerVisible
        : defaultBuilderShellSettings.headerVisible,
    headerLayout: normalizeHeaderLayout(value?.headerLayout),
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
