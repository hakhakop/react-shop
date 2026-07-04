import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { getRuntimeDataDir, getSeedDataDir } from "@/lib/runtimeDataDir";

const SEED_DATA_DIR = getSeedDataDir();

const BUILDER_FILES = [
  "builder-layouts.json",
  "builder-pages.json",
  "builder-shell.json",
] as const;
const BUILDER_TEMPLATES_FILE = "builder-templates.json";

type BuilderFileName = (typeof BUILDER_FILES)[number];
type RuntimeBuilderFileName = BuilderFileName | typeof BUILDER_TEMPLATES_FILE;

function assertSafeWebsiteId(websiteId: string) {
  if (!/^[a-zA-Z0-9_-]+$/.test(websiteId)) {
    throw new Error("Invalid website id.");
  }
}

export function getWebsiteBuilderDir(websiteId: string) {
  assertSafeWebsiteId(websiteId);
  return path.join(getRuntimeDataDir(), "websites", websiteId);
}

export function getWebsiteBuilderFilePath(
  websiteId: string,
  fileName: BuilderFileName,
) {
  return path.join(getWebsiteBuilderDir(websiteId), fileName);
}

function getRuntimeBuilderFilePath(fileName: RuntimeBuilderFileName) {
  return path.join(getRuntimeDataDir(), fileName);
}

export function getBuilderLayoutStorePath(websiteId?: string) {
  return websiteId
    ? getWebsiteBuilderFilePath(websiteId, "builder-layouts.json")
    : getRuntimeBuilderFilePath("builder-layouts.json");
}

export function getBuilderPagesPath(websiteId?: string) {
  return websiteId
    ? getWebsiteBuilderFilePath(websiteId, "builder-pages.json")
    : getRuntimeBuilderFilePath("builder-pages.json");
}

export function getBuilderShellPath(websiteId?: string) {
  return websiteId
    ? getWebsiteBuilderFilePath(websiteId, "builder-shell.json")
    : getRuntimeBuilderFilePath("builder-shell.json");
}

export function getBuilderTemplatesPath() {
  return getRuntimeBuilderFilePath(BUILDER_TEMPLATES_FILE);
}

async function fileExists(filePath: string) {
  try {
    await readFile(filePath, "utf8");
    return true;
  } catch {
    return false;
  }
}

async function seedBuilderFile(websiteId: string, fileName: BuilderFileName) {
  const target = getWebsiteBuilderFilePath(websiteId, fileName);
  if (await fileExists(target)) return;

  const source = path.join(SEED_DATA_DIR, fileName);
  console.info("[webpages-data] seed website builder file", {
    websiteId,
    fileName,
    source,
    target,
  });
  try {
    await copyFile(source, target);
  } catch {
    await writeFile(
      target,
      fileName === "builder-pages.json" ? "[]\n" : "{}\n",
      "utf8",
    );
  }
}

export async function ensureWebsiteBuilderData(websiteId: string) {
  const dir = getWebsiteBuilderDir(websiteId);
  await mkdir(dir, { recursive: true });
  await Promise.all(
    BUILDER_FILES.map((fileName) => seedBuilderFile(websiteId, fileName)),
  );
}
