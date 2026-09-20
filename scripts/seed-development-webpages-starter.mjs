import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const FIXTURE_ROOT = path.join(ROOT, "fixtures", "development", "webpages-global-starter");
const REPO_DATA_DIR = path.join(ROOT, "data");
const DEFAULT_DATA_DIR = path.join(ROOT, ".dev-data");

function parseArgs(argv) {
  const options = {
    check: false,
    force: false,
    dataDir: process.env.WEBPAGES_DATA_DIR || DEFAULT_DATA_DIR,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--check") {
      options.check = true;
      continue;
    }
    if (argument === "--force") {
      options.force = true;
      continue;
    }
    if (argument === "--data-dir") {
      const value = argv[index + 1];
      if (!value) throw new Error("--data-dir requires a path.");
      options.dataDir = value;
      index += 1;
      continue;
    }
    throw new Error(`Unknown option: ${argument}`);
  }

  return options;
}

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, "utf8"));
}

async function readJsonOr(filePath, fallback) {
  try {
    return await readJson(filePath);
  } catch (error) {
    if (error?.code === "ENOENT") return fallback;
    throw error;
  }
}

async function writeJson(filePath, value) {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function sameJson(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

async function assertFixtureIsSafe(manifest, website, globalStarter) {
  if (manifest.schemaVersion !== 1) {
    throw new Error(`Unsupported fixture schema: ${manifest.schemaVersion}`);
  }
  if (website.id !== globalStarter.sourceWebsiteId) {
    throw new Error("Fixture website ID and Global Starter sourceWebsiteId differ.");
  }
  if (website.cmsConnection) {
    throw new Error("Development fixture must not contain a CMS connection.");
  }

  const sensitivePatterns = [
    /wooCommerceConsumer(?:Key|Secret)/i,
    /wordpress(?:Username|ApplicationPassword)/i,
    /passwordHash/i,
    /(?:^|[^a-z])(cs|ck)_[a-z0-9]+/i,
  ];
  const metadata = `${JSON.stringify(website)}\n${JSON.stringify(globalStarter)}`;
  if (sensitivePatterns.some((pattern) => pattern.test(metadata))) {
    throw new Error("Development fixture metadata contains a credential-like field.");
  }
}

async function syncArrayRecord(filePath, record, label, force, check) {
  const current = await readJsonOr(filePath, []);
  if (!Array.isArray(current)) throw new Error(`${label} must contain a JSON array.`);

  const index = current.findIndex((item) => item?.id === record.id);
  if (index === -1) {
    if (check) throw new Error(`${label} is missing fixture record ${record.id}.`);
    await writeJson(filePath, [...current, record]);
    return "added";
  }

  if (sameJson(current[index], record)) return "present";
  if (!force) {
    throw new Error(
      `${label} contains a conflicting ${record.id}; use --force only for an isolated development runtime.`,
    );
  }
  if (check) throw new Error(`${label} contains a non-fixture version of ${record.id}.`);
  const next = [...current];
  next[index] = record;
  await writeJson(filePath, next);
  return "updated";
}

async function syncBuilderBundle({ fixtureRoot, dataDir, websiteId, files, force, check }) {
  const destinationDir = path.join(dataDir, "websites", websiteId);
  const results = [];

  for (const fileName of files) {
    const sourcePath = path.join(fixtureRoot, "builder", fileName);
    const destinationPath = path.join(destinationDir, fileName);
    const expected = await readFile(sourcePath);

    try {
      const current = await readFile(destinationPath);
      if (current.equals(expected)) {
        results.push(`${fileName}:present`);
        continue;
      }
      if (!force) {
        throw new Error(
          `Builder file ${destinationPath} differs; use --force only for an isolated development runtime.`,
        );
      }
      if (check) throw new Error(`Builder file ${destinationPath} differs from the fixture.`);
      await writeFile(destinationPath, expected);
      results.push(`${fileName}:updated`);
    } catch (error) {
      if (error?.code !== "ENOENT") throw error;
      if (check) throw new Error(`Builder file ${destinationPath} is missing.`);
      await mkdir(destinationDir, { recursive: true });
      await copyFile(sourcePath, destinationPath);
      results.push(`${fileName}:added`);
    }
  }

  return results;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const dataDir = path.resolve(options.dataDir);
  if (dataDir === path.resolve(REPO_DATA_DIR)) {
    throw new Error(
      "Refusing to seed the repository data directory. Use an isolated WEBPAGES_DATA_DIR such as .dev-data.",
    );
  }

  const manifest = await readJson(path.join(FIXTURE_ROOT, "manifest.json"));
  const website = await readJson(path.join(FIXTURE_ROOT, manifest.website));
  const globalStarter = await readJson(path.join(FIXTURE_ROOT, manifest.globalStarter));
  await assertFixtureIsSafe(manifest, website, globalStarter);

  const websiteResult = await syncArrayRecord(
    path.join(dataDir, "websites.json"),
    website,
    "websites.json",
    options.force,
    options.check,
  );
  const starterResult = await syncArrayRecord(
    path.join(dataDir, "global-starters.json"),
    globalStarter,
    "global-starters.json",
    options.force,
    options.check,
  );
  const bundleResults = await syncBuilderBundle({
    fixtureRoot: FIXTURE_ROOT,
    dataDir,
    websiteId: website.id,
    files: manifest.builderFiles,
    force: options.force,
    check: options.check,
  });

  console.log(JSON.stringify({
    dataDir,
    mode: options.check ? "check" : "seed",
    website: websiteResult,
    globalStarter: starterResult,
    builderBundle: bundleResults,
  }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
