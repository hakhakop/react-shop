import { cp, mkdir, readFile, readdir, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const fixtureDir = path.join(repoRoot, "data", "fixtures", "dev");
const defaultRuntimeDir = path.join(repoRoot, "data", "runtime");
const args = new Set(process.argv.slice(2));
const knownArgs = new Set(["--check", "--reset", "--allow-external", "--help"]);

function printUsage() {
  console.log(`Usage:
  node scripts/seed-dev.mjs              Copy the Git-tracked dev fixtures into runtime storage
  node scripts/seed-dev.mjs --reset      Replace local runtime storage with the fixtures
  node scripts/seed-dev.mjs --check      Validate fixture structure and credential safety

The default runtime directory is data/runtime. Set WEBPAGES_DATA_DIR to use another
development directory; add --allow-external explicitly before writing outside it.`);
}

if ([...args].some((arg) => !knownArgs.has(arg))) {
  printUsage();
  process.exitCode = 1;
  throw new Error("Unknown seed-dev option.");
}

if (args.has("--help")) {
  printUsage();
  process.exit(0);
}

function resolveRuntimeDir() {
  const configured = process.env.WEBPAGES_DATA_DIR?.trim();
  return configured ? path.resolve(repoRoot, configured) : defaultRuntimeDir;
}

function isInside(child, parent) {
  const relative = path.relative(parent, child);
  return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
}

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, "utf8"));
}

function collectCredentialViolations(value, location = "$", violations = []) {
  if (Array.isArray(value)) {
    value.forEach((item, index) => collectCredentialViolations(item, `${location}[${index}]`, violations));
    return violations;
  }
  if (!value || typeof value !== "object") return violations;

  for (const [key, child] of Object.entries(value)) {
    const isCredentialField = /^(?:password|passwordHash|wordpressApplicationPassword|wooCommerceConsumerKey|wooCommerceConsumerSecret|apiKey|authToken|accessToken|refreshToken)$/i.test(key);
    if (isCredentialField && key !== "passwordHash" && typeof child === "string" && child.trim()) {
      violations.push(`${location}.${key}`);
    }
    collectCredentialViolations(child, `${location}.${key}`, violations);
  }
  return violations;
}

async function validateFixtures() {
  const requiredFiles = [
    "users.json",
    "websites.json",
    "builder-layouts.json",
    "builder-pages.json",
    "builder-routing.json",
    "builder-shell.json",
    "builder-templates.json",
    "subscription-packages.json",
    "i18n/en.json",
    "i18n/hy.json",
    "i18n/ru.json",
  ];

  for (const relativePath of requiredFiles) {
    const absolutePath = path.join(fixtureDir, relativePath);
    try {
      await readFile(absolutePath, "utf8");
    } catch {
      throw new Error(`Missing development fixture: ${relativePath}`);
    }
  }

  const users = await readJson(path.join(fixtureDir, "users.json"));
  if (!Array.isArray(users) || users.length === 0) {
    throw new Error("Development users fixture must be a non-empty array.");
  }
  const userIds = new Set();
  const userEmails = new Set();
  for (const user of users) {
    if (!user || typeof user !== "object") throw new Error("Invalid development user entry.");
    if (userIds.has(user.id) || userEmails.has(user.email)) throw new Error("Development user IDs and emails must be unique.");
    userIds.add(user.id);
    userEmails.add(user.email);
    if (!String(user.email).endsWith("@example.test")) {
      throw new Error(`Development user email must use @example.test: ${user.email}`);
    }
    if (!/^\$2[aby]\$\d{2}\$/.test(String(user.passwordHash))) {
      throw new Error(`Development user ${user.email} must contain a bcrypt password hash.`);
    }
  }

  const websites = await readJson(path.join(fixtureDir, "websites.json"));
  if (!Array.isArray(websites) || websites.length === 0) {
    throw new Error("Development websites fixture must be a non-empty array.");
  }
  const websiteIds = new Set();
  for (const website of websites) {
    if (!website || typeof website !== "object") throw new Error("Invalid development website entry.");
    if (websiteIds.has(website.id)) throw new Error(`Duplicate development website ID: ${website.id}`);
    websiteIds.add(website.id);
    if (!userIds.has(website.ownerId)) throw new Error(`Website ${website.id} references a missing fixture owner.`);
    if (website.cmsConnection) throw new Error(`Website ${website.id} contains a CMS connection; keep CMS credentials outside Git.`);
    if (website.domain && !String(website.domain).endsWith(".example.test")) {
      throw new Error(`Development website domain must use .example.test: ${website.domain}`);
    }
  }

  const jsonFiles = [];
  async function collectJsonFiles(dir) {
    for (const entry of await readdir(dir, { withFileTypes: true })) {
      const absolutePath = path.join(dir, entry.name);
      if (entry.isDirectory()) await collectJsonFiles(absolutePath);
      else if (entry.isFile() && entry.name.endsWith(".json")) jsonFiles.push(absolutePath);
    }
  }
  await collectJsonFiles(fixtureDir);

  const violations = [];
  for (const filePath of jsonFiles) {
    const raw = await readFile(filePath, "utf8");
    if (/webpages\.am|yahoo\.com|gmail\.com|prada\.com|notebookmall\.am|circle\.am/i.test(raw)) {
      violations.push(`${path.relative(fixtureDir, filePath)} contains a live domain or personal email`);
    }
    collectCredentialViolations(JSON.parse(raw), path.relative(fixtureDir, filePath));
  }

  if (violations.length > 0) {
    throw new Error(`Development fixture safety check failed:\n${violations.join("\n")}`);
  }

  return { userCount: users.length, websiteCount: websites.length, jsonFileCount: jsonFiles.length };
}

const summary = await validateFixtures();
if (args.has("--check")) {
  console.log("Development fixtures are valid and contain only test-safe credentials.", summary);
  process.exit(0);
}

const runtimeDir = resolveRuntimeDir();
if (!isInside(runtimeDir, defaultRuntimeDir) && !args.has("--allow-external")) {
  throw new Error(
    `Refusing to write outside ${defaultRuntimeDir}. Use a local runtime path or pass --allow-external explicitly.`,
  );
}

let existingEntries = [];
try {
  existingEntries = await readdir(runtimeDir);
} catch (error) {
  if (error?.code !== "ENOENT") throw error;
}

if (existingEntries.length > 0 && !args.has("--reset")) {
  throw new Error(
    `Runtime directory is not empty: ${runtimeDir}. Use --reset to replace it with the development fixtures.`,
  );
}

if (args.has("--reset")) {
  await rm(runtimeDir, { recursive: true, force: true });
}
await mkdir(runtimeDir, { recursive: true });

for (const entry of await readdir(fixtureDir, { withFileTypes: true })) {
  await cp(path.join(fixtureDir, entry.name), path.join(runtimeDir, entry.name), {
    recursive: true,
    force: true,
  });
}

console.log(`${args.has("--reset") ? "Reset" : "Seeded"} development runtime data at ${runtimeDir}.`, summary);
