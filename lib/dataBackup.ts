import { copyFile, mkdir, readdir, rm, rename, stat } from "node:fs/promises";
import path from "node:path";
import { getRuntimeDataDir } from "@/lib/runtimeDataDir";

const MAX_RETENTION = 20;

function getBackupTimestamp(date = new Date()) {
  return date.toISOString().replace(/[:.]/g, "-");
}

export function getBackupsBaseDir() {
  return path.join(getRuntimeDataDir(), "backups");
}

export function getCategoryBackupsDir(category: string) {
  return path.join(getBackupsBaseDir(), category);
}

export async function pruneCategoryBackups(
  category: string,
  maxRetention = MAX_RETENTION,
) {
  const backupDir = getCategoryBackupsDir(category);
  let filenames: string[] = [];

  try {
    filenames = await readdir(backupDir);
  } catch {
    return;
  }

  const filesWithTime = await Promise.all(
    filenames.map(async (filename) => {
      const fullPath = path.join(backupDir, filename);
      try {
        const fileStat = await stat(fullPath);
        return { filename, fullPath, mtime: fileStat.mtime.getTime() };
      } catch {
        return null;
      }
    }),
  );

  const validFiles = filesWithTime
    .filter((item): item is { filename: string; fullPath: string; mtime: number } =>
      Boolean(item),
    )
    .sort((left, right) => right.mtime - left.mtime);

  const filesToRemove = validFiles.slice(maxRetention);
  await Promise.all(
    filesToRemove.map((file) => rm(file.fullPath, { force: true })),
  );
}

export async function backupDataFile(
  filePath: string,
  category: string,
  maxRetention = MAX_RETENTION,
) {
  try {
    const fileStat = await stat(filePath);
    if (!fileStat.isFile()) return;
  } catch {
    return; // File does not exist, nothing to back up
  }

  const basename = path.basename(filePath);
  const backupDir = getCategoryBackupsDir(category);
  const backupPath = path.join(backupDir, `${basename}.bak-${getBackupTimestamp()}`);

  await mkdir(backupDir, { recursive: true });
  await copyFile(filePath, backupPath);
  await pruneCategoryBackups(category, maxRetention);

  console.info(`[data-backup] Backed up ${basename} to backups/${category}/`);
}

export async function cleanupLegacyRootBackups() {
  const rootDataDir = getRuntimeDataDir();
  let entries: string[] = [];

  try {
    entries = await readdir(rootDataDir);
  } catch {
    return;
  }

  for (const entry of entries) {
    // Look for legacy backup files like builder-layouts.json.bak-*, builder-shell.json.bak-*, builder-layouts.json backup.json
    if (!entry.includes(".bak-") && !entry.includes("backup")) {
      continue;
    }

    const fullPath = path.join(rootDataDir, entry);
    try {
      const entryStat = await stat(fullPath);
      if (!entryStat.isFile()) continue;
    } catch {
      continue;
    }

    let category = "";
    if (entry.startsWith("builder-layouts")) {
      category = "builder-layouts";
    } else if (entry.startsWith("builder-shell")) {
      category = "builder-shell";
    } else if (entry.startsWith("websites")) {
      category = "websites";
    } else {
      category = "misc";
    }

    const targetDir = getCategoryBackupsDir(category);
    await mkdir(targetDir, { recursive: true });
    const targetPath = path.join(targetDir, entry);

    try {
      await rename(fullPath, targetPath);
      console.info(`[data-backup] Moved legacy backup ${entry} -> backups/${category}/`);
    } catch {
      // Fallback copy & delete if rename fails across devices
      try {
        await copyFile(fullPath, targetPath);
        await rm(fullPath, { force: true });
      } catch (err) {
        console.warn(`[data-backup] Failed to move legacy backup ${entry}:`, err);
      }
    }
  }

  // Enforce retention limit on all category backup folders
  await Promise.all([
    pruneCategoryBackups("builder-layouts"),
    pruneCategoryBackups("builder-shell"),
    pruneCategoryBackups("websites"),
    pruneCategoryBackups("misc"),
  ]);
}
