import { readFile, writeFile } from "node:fs/promises";
import { ensureRootBuilderData, backupRootBuilderFileBeforeWrite, getBuilderShellPath } from "@/lib/websiteBuilderData";
import type { CmsConnection } from "@/lib/cmsConnection";

export async function savePersistedRootCmsConnection(
  cmsConnection: CmsConnection,
) {
  await ensureRootBuilderData();
  const filePath = getBuilderShellPath();
  let current: Record<string, unknown> = {};
  try {
    current = JSON.parse(await readFile(filePath, "utf8")) as Record<string, unknown>;
  } catch {
    current = {};
  }
  await backupRootBuilderFileBeforeWrite("builder-shell.json");
  current.cmsConnection = cmsConnection;
  await writeFile(filePath, `${JSON.stringify(current, null, 2)}\n`, "utf8");
}
