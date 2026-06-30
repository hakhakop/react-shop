import { mkdir, readFile, writeFile } from "node:fs/promises";
import crypto from "node:crypto";
import path from "node:path";
import { isSaaSAdmin, type PublicSaaSUser } from "@/lib/auth";
import { ensureWebsiteBuilderData } from "@/lib/websiteBuilderData";

export type WebsiteStatus = "creating" | "active" | "suspended";

export type SaaSWebsite = {
  id: string;
  ownerId: string;
  name: string;
  slug: string;
  domain: string | null;
  status: WebsiteStatus;
  createdAt: string;
  updatedAt: string;
};

type StoredWebsite = Omit<SaaSWebsite, "status"> & {
  status: WebsiteStatus | "draft";
};

const DATA_DIR = path.join(process.cwd(), "data");
const WEBSITES_FILE = path.join(DATA_DIR, "websites.json");
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function normalizeName(name: unknown) {
  return typeof name === "string" ? name.trim().replace(/\s+/g, " ") : "";
}

function normalizeSlug(slug: unknown) {
  return typeof slug === "string" ? slug.trim().toLowerCase() : "";
}

function isStoredWebsite(value: unknown): value is StoredWebsite {
  if (!value || typeof value !== "object") return false;
  const website = value as Partial<StoredWebsite>;
  const status = (value as { status?: unknown }).status;
  return (
    typeof website.id === "string" &&
    typeof website.ownerId === "string" &&
    typeof website.name === "string" &&
    typeof website.slug === "string" &&
    (typeof website.domain === "string" || website.domain === null) &&
    (status === "creating" ||
      status === "draft" ||
      status === "active" ||
      status === "suspended") &&
    typeof website.createdAt === "string" &&
    typeof website.updatedAt === "string"
  );
}

export function validateWebsiteInput(input: {
  name?: unknown;
  slug?: unknown;
}) {
  const name = normalizeName(input.name);
  const slug = normalizeSlug(input.slug);

  if (!name || name.length > 100) {
    return { error: "Website name is required and must be 100 characters or fewer." };
  }

  if (!SLUG_PATTERN.test(slug) || slug.length < 3 || slug.length > 60) {
    return {
      error:
        "Slug must be 3-60 characters using lowercase letters, numbers, and hyphens.",
    };
  }

  return { name, slug };
}

export async function readWebsites(): Promise<SaaSWebsite[]> {
  try {
    const raw = await readFile(WEBSITES_FILE, "utf8");
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isStoredWebsite).map((website) => ({
      ...website,
      status: website.status === "draft" ? "creating" : website.status,
      domain: website.domain || null,
    }));
  } catch {
    return [];
  }
}

async function writeWebsites(websites: SaaSWebsite[]) {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(
    WEBSITES_FILE,
    `${JSON.stringify(websites, null, 2)}\n`,
    "utf8",
  );
}

export async function getWebsitesForOwner(ownerId: string) {
  const websites = await readWebsites();
  return websites.filter((website) => website.ownerId === ownerId);
}

export async function getWebsiteById(id: string) {
  const websites = await readWebsites();
  return websites.find((website) => website.id === id) ?? null;
}

export function canAccessWebsiteBuilder(
  user: PublicSaaSUser | null | undefined,
  website: SaaSWebsite | null | undefined,
) {
  if (!user || !website) return false;
  return website.ownerId === user.id || isSaaSAdmin(user);
}

export async function createWebsite(input: {
  ownerId: string;
  name: string;
  slug: string;
}) {
  const websites = await readWebsites();
  const slug = normalizeSlug(input.slug);

  if (websites.some((website) => website.slug === slug)) {
    return { error: "This slug is already used by another website." };
  }

  const now = new Date().toISOString();
  const website: SaaSWebsite = {
    id: crypto.randomUUID(),
    ownerId: input.ownerId,
    name: normalizeName(input.name),
    slug,
    domain: null,
    status: "creating",
    createdAt: now,
    updatedAt: now,
  };

  await writeWebsites([...websites, website]);
  await ensureWebsiteBuilderData(website.id);
  return { website };
}

export function getWebsiteCountsByOwner(websites: SaaSWebsite[]) {
  const counts = new Map<string, number>();
  for (const website of websites) {
    counts.set(website.ownerId, (counts.get(website.ownerId) ?? 0) + 1);
  }
  return counts;
}
