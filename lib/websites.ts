import { mkdir, readFile, writeFile } from "node:fs/promises";
import crypto from "node:crypto";
import path from "node:path";
import { isSaaSAdmin, type PublicSaaSUser } from "@/lib/auth";
import { getRuntimeDataDir } from "@/lib/runtimeDataDir";
import {
  initializeWebsiteBuilderData,
} from "@/lib/websiteBuilderData";
import type { StarterWebsiteId } from "@/lib/starterWebsites";

export type WebsiteStatus = "creating" | "active" | "maintenance" | "suspended";
export type WebsiteType = "business" | "e-commerce";
export type WebsiteContentLanguage = "hy" | "en" | "ru";
export const websiteContentLanguages: WebsiteContentLanguage[] = ["hy", "en", "ru"];

export type SaaSWebsite = {
  id: string;
  ownerId: string;
  name: string;
  slug: string;
  type: WebsiteType;
  domain: string | null;
  primaryDomain: string | null;
  domains: string[];
  description: string;
  timeZone: string;
  language: string;
  primaryLanguage: WebsiteContentLanguage;
  enabledLanguages: WebsiteContentLanguage[];
  status: WebsiteStatus;
  ecommerceSettings?: WebsiteEcommerceSettings;
  createdAt: string;
  updatedAt: string;
};

type StoredWebsite = Omit<SaaSWebsite, "status"> & {
  type?: WebsiteType;
  status: WebsiteStatus | "draft";
};

export type WebsiteEcommerceSettings = {
  wordpressCmsUrl: string;
  wordpressGraphqlUrl: string;
  wordpressAdminUrl: string;
  wooCommerceAdminUrl: string;
  wooCommerceRestApiUrl: string;
  wordpressAdminUser: string;
  storeStatusNotes: string;
  wooCommerceConsumerKey: string;
  wooCommerceConsumerSecret: string;
  technicalNotes: string;
  updatedAt: string;
};

const WEBSITES_FILE = () => path.join(getRuntimeDataDir(), "websites.json");
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const DOMAIN_LABEL_PATTERN = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;
export const ROOT_WEBSITE_ID = "root";
export const ROOT_WEBSITE_SLUG = "root-website";

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

function normalizeLongText(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function normalizeUrl(value: unknown) {
  const text = typeof value === "string" ? value.trim().slice(0, 240) : "";
  if (!text) return "";
  return /^https?:\/\//i.test(text) ? text : `https://${text}`;
}

function isWebsiteEcommerceSettings(
  value: unknown,
): value is Partial<WebsiteEcommerceSettings> {
  if (!value || typeof value !== "object") return false;
  const settings = value as Partial<WebsiteEcommerceSettings>;
  return (
    typeof settings.wordpressCmsUrl === "string" &&
    typeof settings.wordpressAdminUser === "string" &&
    typeof settings.storeStatusNotes === "string" &&
    typeof settings.wooCommerceConsumerKey === "string" &&
    typeof settings.wooCommerceConsumerSecret === "string" &&
    typeof settings.technicalNotes === "string" &&
    typeof settings.updatedAt === "string"
  );
}

function normalizeWebsiteEcommerceSettings(
  value: unknown,
): WebsiteEcommerceSettings | undefined {
  if (!isWebsiteEcommerceSettings(value)) return undefined;

  return {
    wordpressCmsUrl: value.wordpressCmsUrl ?? "",
    wordpressGraphqlUrl: value.wordpressGraphqlUrl ?? "",
    wordpressAdminUrl: value.wordpressAdminUrl ?? "",
    wooCommerceAdminUrl: value.wooCommerceAdminUrl ?? "",
    wooCommerceRestApiUrl: value.wooCommerceRestApiUrl ?? "",
    wordpressAdminUser: value.wordpressAdminUser ?? "",
    storeStatusNotes: value.storeStatusNotes ?? "",
    wooCommerceConsumerKey: value.wooCommerceConsumerKey ?? "",
    wooCommerceConsumerSecret: value.wooCommerceConsumerSecret ?? "",
    technicalNotes: value.technicalNotes ?? "",
    updatedAt: value.updatedAt ?? "",
  };
}

function normalizeWebsiteStatus(value: unknown): WebsiteStatus | null {
  return value === "active" || value === "maintenance" || value === "suspended"
    ? value
    : null;
}

export function normalizeWebsiteType(value: unknown): WebsiteType {
  return value === "e-commerce" ? "e-commerce" : "business";
}

export function normalizeWebsiteContentLanguage(value: unknown): WebsiteContentLanguage {
  return value === "en" || value === "ru" ? value : "hy";
}

function normalizeEnabledLanguages(value: unknown, primary: WebsiteContentLanguage) {
  const requested = Array.isArray(value) ? value : [];
  return Array.from(new Set([primary, ...requested.map(normalizeWebsiteContentLanguage)]));
}

export function validateWebsiteSettingsInput(input: {
  name?: unknown;
  slug?: unknown;
  type?: unknown;
  description?: unknown;
  timeZone?: unknown;
  language?: unknown;
  primaryLanguage?: unknown;
  enabledLanguages?: unknown;
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
    type: normalizeWebsiteType(input.type),
    description: normalizeDescription(input.description),
    timeZone: normalizeOption(input.timeZone, "Asia/Yerevan"),
    language: normalizeWebsiteContentLanguage(input.primaryLanguage ?? input.language),
    primaryLanguage: normalizeWebsiteContentLanguage(input.primaryLanguage ?? input.language),
    enabledLanguages: normalizeEnabledLanguages(
      input.enabledLanguages,
      normalizeWebsiteContentLanguage(input.primaryLanguage ?? input.language),
    ),
    status,
  };
}

export function validateWebsiteEcommerceSettingsInput(input: {
  wordpressCmsUrl?: unknown;
  wordpressGraphqlUrl?: unknown;
  wordpressAdminUrl?: unknown;
  wooCommerceAdminUrl?: unknown;
  wooCommerceRestApiUrl?: unknown;
  wordpressAdminUser?: unknown;
  storeStatusNotes?: unknown;
  wooCommerceConsumerKey?: unknown;
  wooCommerceConsumerSecret?: unknown;
  technicalNotes?: unknown;
}) {
  const wordpressCmsUrl = normalizeUrl(input.wordpressCmsUrl);
  const wordpressGraphqlUrl = normalizeUrl(input.wordpressGraphqlUrl);
  const wordpressAdminUrl = normalizeUrl(input.wordpressAdminUrl);
  const wooCommerceAdminUrl = normalizeUrl(input.wooCommerceAdminUrl);
  const wooCommerceRestApiUrl = normalizeUrl(input.wooCommerceRestApiUrl);
  const wordpressAdminUser = normalizeOption(input.wordpressAdminUser, "");
  const storeStatusNotes = normalizeLongText(input.storeStatusNotes, 1000);
  const wooCommerceConsumerKey = normalizeLongText(
    input.wooCommerceConsumerKey,
    240,
  );
  const wooCommerceConsumerSecret = normalizeLongText(
    input.wooCommerceConsumerSecret,
    240,
  );
  const technicalNotes = normalizeLongText(input.technicalNotes, 1200);

  if (!wordpressCmsUrl) {
    return { error: "WordPress CMS URL is required." };
  }

  if (!wordpressAdminUser) {
    return { error: "WordPress admin username/email is required." };
  }

  return {
    wordpressCmsUrl,
    wordpressGraphqlUrl,
    wordpressAdminUrl,
    wooCommerceAdminUrl,
    wooCommerceRestApiUrl,
    wordpressAdminUser,
    storeStatusNotes,
    wooCommerceConsumerKey,
    wooCommerceConsumerSecret,
    technicalNotes,
    updatedAt: new Date().toISOString(),
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
        type: normalizeWebsiteType(website.type),
        status: website.status === "draft" ? "creating" : website.status,
        domain: primaryDomain,
        primaryDomain,
        domains,
        description:
          typeof website.description === "string" ? website.description : "",
        timeZone:
          typeof website.timeZone === "string" ? website.timeZone : "Asia/Yerevan",
        language: normalizeWebsiteContentLanguage(website.primaryLanguage ?? website.language),
        primaryLanguage: normalizeWebsiteContentLanguage(website.primaryLanguage ?? website.language),
        enabledLanguages: normalizeEnabledLanguages(
          website.enabledLanguages,
          normalizeWebsiteContentLanguage(website.primaryLanguage ?? website.language),
        ),
        ecommerceSettings: normalizeWebsiteEcommerceSettings(
          website.ecommerceSettings,
        ),
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

export function isRootWebsiteIdentifier(value: string | null | undefined) {
  const normalized = normalizeSlug(value);
  return normalized === ROOT_WEBSITE_ID || normalized === ROOT_WEBSITE_SLUG;
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
  type?: WebsiteType;
  starterId?: StarterWebsiteId;
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
    type: normalizeWebsiteType(input.type),
    domain: null,
    primaryDomain: null,
    domains: [],
    description: "",
    timeZone: "Asia/Yerevan",
    language: "hy",
    primaryLanguage: "hy",
    enabledLanguages: ["hy"],
    status: "creating",
    createdAt: now,
    updatedAt: now,
  };

  await writeWebsites([...websites, website]);
  await initializeWebsiteBuilderData({
    websiteId: website.id,
    websiteName: website.name,
    starterId: input.starterId,
  });
  return { website };
}

export async function updateWebsiteSettings(input: {
  websiteId: string;
  name: string;
  slug: string;
  type?: WebsiteType;
  description: string;
  timeZone: string;
  language: string;
  primaryLanguage?: WebsiteContentLanguage;
  enabledLanguages?: WebsiteContentLanguage[];
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
    type: normalizeWebsiteType(input.type ?? website.type),
    description: normalizeDescription(input.description),
    timeZone: normalizeOption(input.timeZone, "Asia/Yerevan"),
    language: normalizeWebsiteContentLanguage(input.primaryLanguage ?? input.language),
    primaryLanguage: normalizeWebsiteContentLanguage(input.primaryLanguage ?? input.language),
    enabledLanguages: normalizeEnabledLanguages(
      input.enabledLanguages,
      normalizeWebsiteContentLanguage(input.primaryLanguage ?? input.language),
    ),
    status: input.status,
    updatedAt: new Date().toISOString(),
  };

  await writeWebsites(
    websites.map((item) => (item.id === website.id ? updatedWebsite : item)),
  );

  return { website: updatedWebsite };
}

export async function updateWebsiteEcommerceSettings(input: {
  websiteId: string;
  ecommerceSettings: WebsiteEcommerceSettings;
}) {
  const websites = await readWebsites();
  const website = websites.find((item) => item.id === input.websiteId);

  if (!website) {
    return { error: "Website not found." };
  }

  const updatedWebsite: SaaSWebsite = {
    ...website,
    ecommerceSettings: input.ecommerceSettings,
    updatedAt: new Date().toISOString(),
  };

  await writeWebsites(
    websites.map((item) => (item.id === website.id ? updatedWebsite : item)),
  );

  return { website: updatedWebsite };
}

export async function deleteWebsite(input: { websiteId: string }) {
  if (isRootWebsiteIdentifier(input.websiteId)) {
    return { error: "The Root Website cannot be deleted." };
  }

  const websites = await readWebsites();
  const website =
    websites.find((item) => item.id === input.websiteId) ??
    websites.find((item) => item.slug === normalizeSlug(input.websiteId));

  if (!website) {
    return { error: "Website not found." };
  }

  await writeWebsites(websites.filter((item) => item.id !== website.id));
  return { website };
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
