import { mkdir, readFile, writeFile } from "node:fs/promises";
import crypto from "node:crypto";
import path from "node:path";
import { isSaaSAdmin, type PublicSaaSUser } from "@/lib/auth";
import { getRuntimeDataDir } from "@/lib/runtimeDataDir";
import { ensureWebsiteBuilderData } from "@/lib/websiteBuilderData";

export type WebsiteStatus = "creating" | "active" | "maintenance" | "suspended";

export type SaaSWebsite = {
  id: string;
  ownerId: string;
  name: string;
  slug: string;
  domain: string | null;
  primaryDomain: string | null;
  domains: string[];
  description: string;
  timeZone: string;
  language: string;
  status: WebsiteStatus;
  createdAt: string;
  updatedAt: string;
};

type StoredWebsite = Omit<SaaSWebsite, "status"> & {
  status: WebsiteStatus | "draft";
};

const WEBSITES_FILE = () => path.join(getRuntimeDataDir(), "websites.json");
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const DOMAIN_LABEL_PATTERN = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;

function normalizeName(name: unknown) {
  return typeof name === "string" ? name.trim().replace(/\s+/g, " ") : "";
}

function normalizeSlug(slug: unknown) {
  return typeof slug === "string" ? slug.trim().toLowerCase() : "";
}

export function normalizeWebsiteDomain(domain: unknown) {
  if (typeof domain !== "string") return "";
  let normalized = domain.trim().toLowerCase();
  if (!normalized) return "";

  normalized = normalized.replace(/^[a-z][a-z0-9+.-]*:\/\//, "");
  normalized = normalized.replace(/^[^@/]+@/, "");
  normalized = normalized.split(/[/?#]/)[0] ?? "";
  normalized = normalized.replace(/\.$/, "");

  if (normalized.startsWith("[") && normalized.includes("]")) {
    return normalized;
  }

  const colonIndex = normalized.lastIndexOf(":");
  if (colonIndex > -1 && normalized.indexOf(":") === colonIndex) {
    normalized = normalized.slice(0, colonIndex);
  }

  return normalized;
}

function uniqueDomains(domains: unknown[]) {
  return Array.from(
    new Set(
      domains
        .map(normalizeWebsiteDomain)
        .filter((domain) => domain.length > 0),
    ),
  );
}

function getWebsiteDomains(
  website: Partial<StoredWebsite> | Partial<SaaSWebsite>,
) {
  return uniqueDomains([
    website.primaryDomain,
    website.domain,
    ...(Array.isArray(website.domains) ? website.domains : []),
  ]);
}

function isValidWebsiteDomain(domain: string) {
  if (!domain || domain.length > 253 || domain.includes(" ")) return false;
  if (domain === "localhost") return false;
  if (/^\d+\.\d+\.\d+\.\d+$/.test(domain)) return true;

  const labels = domain.split(".");
  return (
    labels.length >= 2 &&
    labels.every((label) => DOMAIN_LABEL_PATTERN.test(label))
  );
}

function getPrimaryDomain(domains: string[], currentPrimary: string | null) {
  const normalizedPrimary = normalizeWebsiteDomain(currentPrimary);
  return normalizedPrimary && domains.includes(normalizedPrimary)
    ? normalizedPrimary
    : domains[0] ?? null;
}

function hasDomainDuplicate(
  websites: SaaSWebsite[],
  websiteId: string,
  domain: string,
) {
  return websites.some(
    (item) => item.id !== websiteId && getWebsiteDomains(item).includes(domain),
  );
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
    (typeof website.domain === "string" ||
      typeof website.domain === "undefined" ||
      website.domain === null) &&
    (status === "creating" ||
      status === "draft" ||
      status === "active" ||
      status === "maintenance" ||
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

function normalizeDescription(description: unknown) {
  return typeof description === "string"
    ? description.trim().replace(/\s+/g, " ").slice(0, 240)
    : "";
}

function normalizeOption(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim()
    ? value.trim().slice(0, 80)
    : fallback;
}

function normalizeWebsiteStatus(value: unknown): WebsiteStatus | null {
  return value === "active" || value === "maintenance" || value === "suspended"
    ? value
    : null;
}

export function validateWebsiteSettingsInput(input: {
  name?: unknown;
  slug?: unknown;
  description?: unknown;
  timeZone?: unknown;
  language?: unknown;
  status?: unknown;
}) {
  const base = validateWebsiteInput(input);
  if ("error" in base) {
    return { error: base.error ?? "Invalid website settings." };
  }
  const { name, slug } = base;

  const status = normalizeWebsiteStatus(input.status);
  if (!status) {
    return { error: "Choose a valid website status." };
  }

  return {
    name,
    slug,
    description: normalizeDescription(input.description),
    timeZone: normalizeOption(input.timeZone, "Asia/Yerevan"),
    language: normalizeOption(input.language, "hy"),
    status,
  };
}

export async function readWebsites(): Promise<SaaSWebsite[]> {
  try {
    const raw = await readFile(WEBSITES_FILE(), "utf8");
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isStoredWebsite).map((website) => {
      const domains = getWebsiteDomains(website);
      const primaryDomain =
        normalizeWebsiteDomain(website.primaryDomain) || domains[0] || null;

      return {
        ...website,
        status: website.status === "draft" ? "creating" : website.status,
        domain: primaryDomain,
        primaryDomain,
        domains,
        description:
          typeof website.description === "string" ? website.description : "",
        timeZone:
          typeof website.timeZone === "string" ? website.timeZone : "Asia/Yerevan",
        language: typeof website.language === "string" ? website.language : "hy",
      };
    });
  } catch {
    return [];
  }
}

async function writeWebsites(websites: SaaSWebsite[]) {
  const websitesFile = WEBSITES_FILE();
  await mkdir(path.dirname(websitesFile), { recursive: true });
  await writeFile(
    websitesFile,
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

export async function getWebsiteByIdOrSlug(value: string) {
  const websites = await readWebsites();
  return (
    websites.find((website) => website.id === value) ??
    websites.find((website) => website.slug === normalizeSlug(value)) ??
    null
  );
}

export async function getWebsiteByDomainHost(host: string | null | undefined) {
  const domain = normalizeWebsiteDomain(host ?? "");
  if (!domain) return null;

  const websites = await readWebsites();
  return (
    websites.find((website) =>
      getWebsiteDomains(website).includes(domain),
    ) ?? null
  );
}

export function getWebsiteRouteSegment(website: Pick<SaaSWebsite, "id" | "slug">) {
  return website.slug || website.id;
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
    primaryDomain: null,
    domains: [],
    description: "",
    timeZone: "Asia/Yerevan",
    language: "hy",
    status: "creating",
    createdAt: now,
    updatedAt: now,
  };

  await writeWebsites([...websites, website]);
  await ensureWebsiteBuilderData(website.id);
  return { website };
}

export async function updateWebsiteSettings(input: {
  websiteId: string;
  name: string;
  slug: string;
  description: string;
  timeZone: string;
  language: string;
  status: WebsiteStatus;
}) {
  const websites = await readWebsites();
  const website = websites.find((item) => item.id === input.websiteId);

  if (!website) {
    return { error: "Website not found." };
  }

  const slug = normalizeSlug(input.slug);
  if (
    websites.some(
      (item) => item.id !== website.id && normalizeSlug(item.slug) === slug,
    )
  ) {
    return { error: "This slug is already used by another website." };
  }

  const updatedWebsite: SaaSWebsite = {
    ...website,
    name: normalizeName(input.name),
    slug,
    description: normalizeDescription(input.description),
    timeZone: normalizeOption(input.timeZone, "Asia/Yerevan"),
    language: normalizeOption(input.language, "hy"),
    status: input.status,
    updatedAt: new Date().toISOString(),
  };

  await writeWebsites(
    websites.map((item) => (item.id === website.id ? updatedWebsite : item)),
  );

  return { website: updatedWebsite };
}

export async function addWebsiteDomain(input: {
  websiteId: string;
  domain: string;
}) {
  const domain = normalizeWebsiteDomain(input.domain);
  if (!isValidWebsiteDomain(domain)) {
    return { error: "Enter a valid domain, without protocol or path." };
  }

  const websites = await readWebsites();
  const website = websites.find((item) => item.id === input.websiteId);
  if (!website) {
    return { error: "Website not found." };
  }

  if (hasDomainDuplicate(websites, website.id, domain)) {
    return { error: "This domain is already connected to another website." };
  }

  const domains = uniqueDomains([...website.domains, domain]);
  const primaryDomain = website.primaryDomain || domain;
  const updatedWebsite: SaaSWebsite = {
    ...website,
    domain: primaryDomain,
    primaryDomain,
    domains,
    updatedAt: new Date().toISOString(),
  };

  await writeWebsites(
    websites.map((item) => (item.id === website.id ? updatedWebsite : item)),
  );

  return { website: updatedWebsite };
}

export async function setWebsitePrimaryDomain(input: {
  websiteId: string;
  domain: string;
}) {
  const domain = normalizeWebsiteDomain(input.domain);
  const websites = await readWebsites();
  const website = websites.find((item) => item.id === input.websiteId);
  if (!website) {
    return { error: "Website not found." };
  }

  if (!website.domains.includes(domain)) {
    return { error: "Choose an existing domain for this website." };
  }

  const updatedWebsite: SaaSWebsite = {
    ...website,
    domain,
    primaryDomain: domain,
    updatedAt: new Date().toISOString(),
  };

  await writeWebsites(
    websites.map((item) => (item.id === website.id ? updatedWebsite : item)),
  );

  return { website: updatedWebsite };
}

export async function removeWebsiteDomain(input: {
  websiteId: string;
  domain: string;
}) {
  const domain = normalizeWebsiteDomain(input.domain);
  const websites = await readWebsites();
  const website = websites.find((item) => item.id === input.websiteId);
  if (!website) {
    return { error: "Website not found." };
  }

  if (!website.domains.includes(domain)) {
    return { error: "Domain not found." };
  }

  const domains = website.domains.filter((item) => item !== domain);
  const primaryDomain = getPrimaryDomain(
    domains,
    website.primaryDomain === domain ? null : website.primaryDomain,
  );
  const updatedWebsite: SaaSWebsite = {
    ...website,
    domain: primaryDomain,
    primaryDomain,
    domains,
    updatedAt: new Date().toISOString(),
  };

  await writeWebsites(
    websites.map((item) => (item.id === website.id ? updatedWebsite : item)),
  );

  return { website: updatedWebsite };
}

export async function updateWebsiteDomain(input: {
  websiteId: string;
  currentDomain: string;
  nextDomain: string;
}) {
  const currentDomain = normalizeWebsiteDomain(input.currentDomain);
  const nextDomain = normalizeWebsiteDomain(input.nextDomain);
  if (!isValidWebsiteDomain(nextDomain)) {
    return { error: "Enter a valid domain, without protocol or path." };
  }

  const websites = await readWebsites();
  const website = websites.find((item) => item.id === input.websiteId);
  if (!website) {
    return { error: "Website not found." };
  }

  if (!website.domains.includes(currentDomain)) {
    return { error: "Domain not found." };
  }

  if (
    nextDomain !== currentDomain &&
    (website.domains.includes(nextDomain) ||
      hasDomainDuplicate(websites, website.id, nextDomain))
  ) {
    return { error: "This domain is already connected to another website." };
  }

  const domains = uniqueDomains(
    website.domains.map((domain) =>
      domain === currentDomain ? nextDomain : domain,
    ),
  );
  const primaryDomain = getPrimaryDomain(
    domains,
    website.primaryDomain === currentDomain ? nextDomain : website.primaryDomain,
  );
  const updatedWebsite: SaaSWebsite = {
    ...website,
    domain: primaryDomain,
    primaryDomain,
    domains,
    updatedAt: new Date().toISOString(),
  };

  await writeWebsites(
    websites.map((item) => (item.id === website.id ? updatedWebsite : item)),
  );

  return { website: updatedWebsite };
}

export function getWebsiteCountsByOwner(websites: SaaSWebsite[]) {
  const counts = new Map<string, number>();
  for (const website of websites) {
    counts.set(website.ownerId, (counts.get(website.ownerId) ?? 0) + 1);
  }
  return counts;
}
