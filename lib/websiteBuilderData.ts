import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { getRuntimeDataDir, getSeedDataDir } from "@/lib/runtimeDataDir";
import {
  createStarterWebsiteData,
  type StarterWebsiteId,
} from "@/lib/starterWebsites";

const SEED_DATA_DIR = getSeedDataDir();

const BUILDER_FILES = [
  "builder-layouts.json",
  "builder-pages.json",
  "builder-shell.json",
] as const;
const BUILDER_TEMPLATES_FILE = "builder-templates.json";

type BuilderFileName = (typeof BUILDER_FILES)[number];
type RuntimeBuilderFileName = BuilderFileName | typeof BUILDER_TEMPLATES_FILE;
type BuilderFileState = "missing" | "empty" | "non-empty" | "invalid";
let rootBuilderDataEnsurePromise: Promise<void> | null = null;

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

function getSeedBuilderFilePath(fileName: BuilderFileName) {
  return path.join(SEED_DATA_DIR, fileName);
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

function getBackupTimestamp() {
  return new Date().toISOString().replace(/[:.]/g, "-");
}

async function getBuilderFileState(
  filePath: string,
  fileName: BuilderFileName,
): Promise<BuilderFileState> {
  try {
    const raw = await readFile(filePath, "utf8");
    if (!raw.trim()) return "empty";

    const parsed = JSON.parse(raw);
    if (fileName === "builder-pages.json") {
      return Array.isArray(parsed) && parsed.length > 0 ? "non-empty" : "empty";
    }

    return parsed && typeof parsed === "object" && Object.keys(parsed).length > 0
      ? "non-empty"
      : "empty";
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return "missing";
    return "invalid";
  }
}

async function isUsableSeedFile(filePath: string, fileName: BuilderFileName) {
  const state = await getBuilderFileState(filePath, fileName);
  if (fileName === "builder-pages.json") {
    return state === "non-empty" || state === "empty";
  }
  return state === "non-empty";
}

async function getRootBuilderSeedSource(
  target: string,
  fileName: BuilderFileName,
) {
  const candidates = [
    getSeedBuilderFilePath(fileName),
    path.join(SEED_DATA_DIR, `${fileName} backup.json`),
  ];

  for (const candidate of candidates) {
    if (path.resolve(candidate) === path.resolve(target)) continue;
    if (await isUsableSeedFile(candidate, fileName)) return candidate;
  }

  return null;
}

export async function backupRootBuilderFileBeforeWrite(fileName: BuilderFileName) {
  const target = getRuntimeBuilderFilePath(fileName);
  const state = await getBuilderFileState(target, fileName);
  if (state === "missing") return;

  const backupPath = `${target}.bak-${getBackupTimestamp()}`;
  await copyFile(target, backupPath);
  console.info("[webpages-data] backup root builder file", {
    fileName,
    source: target,
    backupPath,
    state,
  });
}

async function seedRootBuilderFile(fileName: BuilderFileName) {
  const target = getRuntimeBuilderFilePath(fileName);
  const state = await getBuilderFileState(target, fileName);
  if (state === "non-empty") return;

  const source = await getRootBuilderSeedSource(target, fileName);
  if (!source) {
    console.warn("[webpages-data] no root builder seed source found", {
      fileName,
      target,
      state,
      seedDir: SEED_DATA_DIR,
    });
    return;
  }

  await mkdir(path.dirname(target), { recursive: true });
  if (state !== "missing") {
    await backupRootBuilderFileBeforeWrite(fileName);
  }
  await copyFile(source, target);
  console.info("[webpages-data] seed root builder file", {
    fileName,
    source,
    target,
    previousState: state,
  });
}

export async function ensureRootBuilderData() {
  rootBuilderDataEnsurePromise ??= Promise.all(
    BUILDER_FILES.map((fileName) => seedRootBuilderFile(fileName)),
  ).then(() => undefined);

  await rootBuilderDataEnsurePromise;
  rootBuilderDataEnsurePromise = null;
}

async function seedBuilderFile(websiteId: string, fileName: BuilderFileName) {
  const target = getWebsiteBuilderFilePath(websiteId, fileName);
  if (await fileExists(target)) return;

  const source = getSeedBuilderFilePath(fileName);
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

export async function initializeWebsiteBuilderData(input: {
  websiteId: string;
  websiteName: string;
  starterId?: StarterWebsiteId;
}) {
  const dir = getWebsiteBuilderDir(input.websiteId);
  await mkdir(dir, { recursive: true });

  const targets = BUILDER_FILES.map((fileName) =>
    getWebsiteBuilderFilePath(input.websiteId, fileName),
  );
  const existing = await Promise.all(targets.map(fileExists));
  if (existing.some(Boolean)) {
    throw new Error("Website Builder data already exists and was not replaced.");
  }

  const starter = createStarterWebsiteData({
    starterId: input.starterId,
    websiteName: input.websiteName,
  });
  const files: Record<BuilderFileName, unknown> = {
    "builder-layouts.json": starter.layouts,
    "builder-pages.json": starter.pages,
    "builder-shell.json": starter.shell,
  };

  await Promise.all(
    BUILDER_FILES.map((fileName) =>
      writeFile(
        getWebsiteBuilderFilePath(input.websiteId, fileName),
        `${JSON.stringify(files[fileName], null, 2)}\n`,
        "utf8",
      ),
    ),
  );
}
