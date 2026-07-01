import path from "node:path";

const REPO_DATA_DIR = path.join(process.cwd(), "data");
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

export function getRuntimeDataDir() {
  const dir = resolveDataDir(process.env.WEBPAGES_DATA_DIR);

  if (!loggedRuntimeDataDir) {
    console.info("[webpages-data] runtime data directory", {
      dir,
      source: process.env.WEBPAGES_DATA_DIR
        ? "WEBPAGES_DATA_DIR"
        : "repo data fallback",
      seedDir: REPO_DATA_DIR,
    });
    loggedRuntimeDataDir = true;
  }

  return dir;
}
