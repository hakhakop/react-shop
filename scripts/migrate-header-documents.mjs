import { cp, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { migrateLegacyHeaderDocument } from "../lib/headerDocumentMigration.ts";

const dataRoot = path.resolve(process.env.WEBPAGES_DATA_DIR || "data");
const fallbackShell = {
  headerVisible: true,
  headerTransparent: false,
  headerOverlay: false,
  headerLayout: "wordpress",
  headerBehavior: "sticky",
  headerWidthMode: "boxed",
  headerBackgroundMode: "default",
  headerTextMode: "auto",
  headerZIndex: 40,
  topToolbarVisible: true,
  topToolbarText: "",
  topToolbarPhone: "",
  topToolbarMeta: "",
  headerBrandMode: "logo",
  headerBrandText: "WebPages",
  headerLogoUrl: null,
  headerLogoAlt: "Site logo",
  headerLogoMaxWidth: 160,
  headerButtonLabel: "Start",
  headerButtonUrl: "/client",
  headerIconVariant: "muted",
  headerIconOrder: ["wishlist", "cart", "account", "theme", "search"],
  headerActiveIndicator: "underline",
};

async function readJson(file, fallback = null) {
  try {
    return JSON.parse(await readFile(file, "utf8"));
  } catch {
    return fallback;
  }
}

async function migrateDirectory(directory) {
  const layoutsFile = path.join(directory, "builder-layouts.json");
  const store = await readJson(layoutsFile);
  const header = store?.header;
  if (!header || header.sections?.[0]?.headerArchitectureVersion === 2) return false;
  const shell = {
    ...fallbackShell,
    ...await readJson(path.join(directory, "builder-shell.json"), {}),
  };
  store.header = migrateLegacyHeaderDocument(header, shell);
  const backup = `${layoutsFile}.bak-header-v1`;
  await cp(layoutsFile, backup, { force: false }).catch(() => {});
  await writeFile(layoutsFile, `${JSON.stringify(store, null, 2)}\n`, "utf8");
  return true;
}

let migrated = 0;
if (await migrateDirectory(dataRoot)) migrated += 1;
const websitesRoot = path.join(dataRoot, "websites");
for (const entry of await readdir(websitesRoot, { withFileTypes: true }).catch(() => [])) {
  if (entry.isDirectory() && await migrateDirectory(path.join(websitesRoot, entry.name))) {
    migrated += 1;
  }
}

console.log(`Migrated ${migrated} Header document store(s) to architecture version 2.`);
