import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { getRepoDataDir, getRuntimeDataDir } from "@/lib/runtimeDataDir";

const REPO_DATA_DIR = getRepoDataDir();

const BUILDER_FILES = [
  "builder-layouts.json",
  "builder-pages.json",
  "builder-shell.json",
] as const;

type BuilderFileName = (typeof BUILDER_FILES)[number];

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

export function getBuilderLayoutStorePath(websiteId?: string) {
  return websiteId
    ? getWebsiteBuilderFilePath(websiteId, "builder-layouts.json")
    : path.join(REPO_DATA_DIR, "builder-layouts.json");
}

export function getBuilderPagesPath(websiteId?: string) {
  return websiteId
    ? getWebsiteBuilderFilePath(websiteId, "builder-pages.json")
    : path.join(REPO_DATA_DIR, "builder-pages.json");
}

export function getBuilderShellPath(websiteId?: string) {
  return websiteId
    ? getWebsiteBuilderFilePath(websiteId, "builder-shell.json")
    : path.join(REPO_DATA_DIR, "builder-shell.json");
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

  const source = path.join(REPO_DATA_DIR, fileName);
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
