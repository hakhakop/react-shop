import path from "node:path";

const REPO_DATA_DIR = path.join(process.cwd(), "data");
const DEV_FIXTURE_DATA_DIR = path.join(REPO_DATA_DIR, "fixtures", "dev");
const DEFAULT_RUNTIME_DATA_DIR = path.join(REPO_DATA_DIR, "runtime");
let loggedRuntimeDataDir = false;

function resolveDataDir(value: string | undefined) {
  const trimmed = value?.trim();
  if (!trimmed) return REPO_DATA_DIR;
  return path.isAbsolute(trimmed)
    ? trimmed
    : path.resolve(process.cwd(), trimmed);
}

export function getRepoDataDir() {
  return REPO_DATA_DIR;
}

export function getSeedDataDir() {
  return DEV_FIXTURE_DATA_DIR;
}

export function getRuntimeDataDir() {
  const configuredDir = process.env.WEBPAGES_DATA_DIR?.trim();
  const dir = configuredDir
    ? resolveDataDir(configuredDir)
    : DEFAULT_RUNTIME_DATA_DIR;

  if (!loggedRuntimeDataDir) {
    console.info("[webpages-data] directories", {
      runtimeDir: dir,
      source: configuredDir
        ? "WEBPAGES_DATA_DIR"
        : "local runtime default",
      seedDir: DEV_FIXTURE_DATA_DIR,
    });
    loggedRuntimeDataDir = true;
  }

  return dir;
}
