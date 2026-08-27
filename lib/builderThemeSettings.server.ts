import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  defaultBuilderThemeSettings,
  normalizeBuilderThemeSettings,
  type BuilderThemeSettings,
} from "@/lib/builderThemeSettings";
import { getBuilderThemeSettingsPath } from "@/lib/websiteBuilderData";

type BuilderThemeSettingsScope = { websiteId?: string };

export async function getBuilderThemeSettings(
  scope: BuilderThemeSettingsScope = {},
): Promise<BuilderThemeSettings> {
  try {
    const filePath = getBuilderThemeSettingsPath(scope.websiteId);
    const raw = await readFile(filePath, "utf8");
    return normalizeBuilderThemeSettings(JSON.parse(raw));
  } catch {
    return defaultBuilderThemeSettings;
  }
}

export async function writeBuilderThemeSettings(
  settings: BuilderThemeSettings,
  scope: BuilderThemeSettingsScope = {},
) {
  const filePath = getBuilderThemeSettingsPath(scope.websiteId);
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(
    filePath,
    `${JSON.stringify({ ...normalizeBuilderThemeSettings(settings), updatedAt: new Date().toISOString() }, null, 2)}\n`,
    "utf8",
  );
}
