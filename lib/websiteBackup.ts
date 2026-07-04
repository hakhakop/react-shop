import { mkdir, readFile, readdir, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import type { SaaSWebsite } from "@/lib/websites";
import {
  getBuilderLayoutStorePath,
  getBuilderPagesPath,
  getBuilderShellPath,
  getWebsiteBuilderDir,
} from "@/lib/websiteBuilderData";

type WebsiteBackupPayload = {
  exportVersion: number;
  exportedAt: string;
  website: Record<string, unknown>;
  files: {
    "builder-layouts.json": Record<string, unknown>;
    "builder-pages.json": unknown[];
    "builder-shell.json": Record<string, unknown>;
  };
};

export type WebsiteBackupListItem = {
  id: string;
  filename: string;
  createdAt: string;
  exportVersion: number;
  sizeBytes: number;
};

const MAX_STORED_BACKUPS = 5;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function getRestoreTimestamp() {
  return new Date().toISOString().replace(/[:.]/g, "-");
}

function getBackupTimestamp(date = new Date()) {
  return date.toISOString().replace(/[:.]/g, "-");
}

function safeFilenamePart(value: string) {
  return (
    value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, "-")
      .replace(/^-+|-+$/g, "") || "website"
  );
}

function assertValidWebsiteBackup(value: unknown): WebsiteBackupPayload {
  if (!isPlainObject(value)) {
    throw new Error("Backup file must contain a JSON object.");
  }

  if (value.exportVersion !== 1) {
    throw new Error("Unsupported backup export version.");
  }

  if (typeof value.exportedAt !== "string" || !value.exportedAt) {
    throw new Error("Backup is missing exportedAt.");
  }

  if (!isPlainObject(value.website)) {
    throw new Error("Backup is missing website metadata.");
  }

  if (!isPlainObject(value.files)) {
    throw new Error("Backup is missing builder files.");
  }

  const files = value.files;
  if (!isPlainObject(files["builder-layouts.json"])) {
    throw new Error("Backup is missing builder-layouts.json.");
  }

  if (!Array.isArray(files["builder-pages.json"])) {
    throw new Error("Backup is missing builder-pages.json.");
  }

  if (!isPlainObject(files["builder-shell.json"])) {
    throw new Error("Backup is missing builder-shell.json.");
  }

  return value as WebsiteBackupPayload;
}

async function readJsonFile(filePath: string, fallback: unknown) {
  try {
    return JSON.parse(await readFile(filePath, "utf8"));
  } catch {
    return fallback;
  }
}

async function writeJsonFile(filePath: string, value: unknown) {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function getWebsiteBackupsDir(websiteId: string) {
  return path.join(getWebsiteBuilderDir(websiteId), "backups");
}

function assertSafeBackupId(backupId: string) {
  if (
    !backupId ||
    backupId.includes("/") ||
    backupId.includes("\\") ||
    !backupId.endsWith(".json")
  ) {
    throw new Error("Invalid backup file.");
  }
}

function getWebsiteBackupPath(websiteId: string, backupId: string) {
  assertSafeBackupId(backupId);
  return path.join(getWebsiteBackupsDir(websiteId), backupId);
}

async function getBackupMetadata(filePath: string, filename: string) {
  try {
    const [raw, fileStat] = await Promise.all([
      readFile(filePath, "utf8"),
      stat(filePath),
    ]);
    const parsed = assertValidWebsiteBackup(JSON.parse(raw));

    return {
      id: filename,
      filename,
      createdAt: parsed.exportedAt || fileStat.mtime.toISOString(),
      exportVersion: parsed.exportVersion,
      sizeBytes: fileStat.size,
    };
  } catch {
    return null;
  }
}

export async function createWebsiteBackupPayload(website: SaaSWebsite) {
  return {
    exportVersion: 1,
    exportedAt: new Date().toISOString(),
    website,
    files: {
      "builder-layouts.json": await readJsonFile(
        getBuilderLayoutStorePath(website.id),
        {},
      ),
      "builder-pages.json": await readJsonFile(getBuilderPagesPath(website.id), []),
      "builder-shell.json": await readJsonFile(getBuilderShellPath(website.id), {}),
    },
  };
}

export function getWebsiteBackupDownloadFilename(
  website: Pick<SaaSWebsite, "slug">,
  date = new Date(),
) {
  return `webpages-backup-${safeFilenamePart(website.slug)}-${date.toISOString().slice(0, 10)}.json`;
}

async function readWebsiteBackupList(websiteId: string) {
  const backupsDir = getWebsiteBackupsDir(websiteId);
  let filenames: string[] = [];

  try {
    filenames = (await readdir(backupsDir)).filter((fileName) =>
      fileName.endsWith(".json"),
    );
  } catch {
    return [];
  }

  const backups = await Promise.all(
    filenames.map((filename) =>
      getBackupMetadata(path.join(backupsDir, filename), filename),
    ),
  );

  return backups
    .filter((backup): backup is WebsiteBackupListItem => Boolean(backup))
    .sort(
      (left, right) =>
        new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
    );
}

export async function listWebsiteBackups(websiteId: string) {
  return (await readWebsiteBackupList(websiteId)).slice(0, MAX_STORED_BACKUPS);
}

async function pruneWebsiteBackups(websiteId: string) {
  const backupsDir = getWebsiteBackupsDir(websiteId);
  const backups = await readWebsiteBackupList(websiteId);
  const backupsToRemove = backups.slice(MAX_STORED_BACKUPS);

  await Promise.all(
    backupsToRemove.map((backup) =>
      rm(path.join(backupsDir, backup.filename), { force: true }),
    ),
  );
}

export async function createStoredWebsiteBackup(website: SaaSWebsite) {
  const backupsDir = getWebsiteBackupsDir(website.id);
  const exportedAt = new Date();
  const payload = await createWebsiteBackupPayload(website);
  const filename = `webpages-backup-${safeFilenamePart(website.slug)}-${getBackupTimestamp(exportedAt)}.json`;
  const filePath = path.join(backupsDir, filename);

  await mkdir(backupsDir, { recursive: true });
  await writeJsonFile(filePath, {
    ...payload,
    exportedAt: exportedAt.toISOString(),
  });
  await pruneWebsiteBackups(website.id);

  return {
    id: filename,
    filename,
    createdAt: exportedAt.toISOString(),
    exportVersion: 1,
    sizeBytes: (await stat(filePath)).size,
  };
}

export async function readStoredWebsiteBackup(input: {
  websiteId: string;
  backupId: string;
}) {
  const filePath = getWebsiteBackupPath(input.websiteId, input.backupId);
  return assertValidWebsiteBackup(JSON.parse(await readFile(filePath, "utf8")));
}

export async function restoreStoredWebsiteBackup(input: {
  website: SaaSWebsite;
  backupId: string;
}) {
  return restoreWebsiteBackup({
    website: input.website,
    backup: await readStoredWebsiteBackup({
      websiteId: input.website.id,
      backupId: input.backupId,
    }),
  });
}

export async function restoreWebsiteBackup(input: {
  website: SaaSWebsite;
  backup: unknown;
}) {
  const backup = assertValidWebsiteBackup(input.backup);
  const websiteId = input.website.id;
  const builderDir = getWebsiteBuilderDir(websiteId);
  const safetyBackupPath = path.join(
    builderDir,
    `restore-safety-backup-${getRestoreTimestamp()}.json`,
  );

  const currentBackup = {
    exportVersion: 1,
    exportedAt: new Date().toISOString(),
    safetyBackupForRestore: true,
    website: input.website,
    files: {
      "builder-layouts.json": await readJsonFile(
        getBuilderLayoutStorePath(websiteId),
        {},
      ),
      "builder-pages.json": await readJsonFile(getBuilderPagesPath(websiteId), []),
      "builder-shell.json": await readJsonFile(getBuilderShellPath(websiteId), {}),
    },
  };

  await writeJsonFile(safetyBackupPath, currentBackup);
  await writeJsonFile(
    getBuilderLayoutStorePath(websiteId),
    backup.files["builder-layouts.json"],
  );
  await writeJsonFile(getBuilderPagesPath(websiteId), backup.files["builder-pages.json"]);
  await writeJsonFile(getBuilderShellPath(websiteId), backup.files["builder-shell.json"]);

  return { safetyBackupPath };
}
