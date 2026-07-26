import { isSaaSAdmin, type PublicSaaSUser } from "@/lib/authRoles";
import { getRuntimeDataDir } from "@/lib/runtimeDataDir";
import { type CmsConnection } from "@/lib/cmsConnection";
import type { StarterWebsiteId } from "@/lib/starterWebsites";

export type WebsiteStatus = "creating" | "active" | "maintenance" | "suspended";
export type WebsiteType = "business" | "e-commerce";
export type WebsiteContentLanguage = "hy" | "en" | "ru";
export const websiteContentLanguages: WebsiteContentLanguage[] = ["hy", "en", "ru"];

export type WebsitePlan = {
  packageId: string;
  packageName: string;
  packageType: string;
  priceText: string;
  activatedAt: string;
};

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
  creationRequestId?: string;
  websiteCategory?: string;
  companyName?: string;
  personName?: string;
  logoUrl?: string;
  contactPhone?: string;
  contactEmail?: string;
  socialLinks?: string;
  plan?: WebsitePlan;
  lastPublishedAt?: string;
  cmsConnection?: CmsConnection;
  createdAt: string;
  updatedAt: string;
};

type StoredWebsite = Omit<SaaSWebsite, "status"> & {
  type?: WebsiteType;
  status: WebsiteStatus | "draft";
  ecommerceSettings?: Record<string, unknown>;
};

const WEBSITES_FILE = async () => {
  const path = await import("node:path");
  return path.join(getRuntimeDataDir(), "websites.json");
};
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

function normalizeWebsitePlan(value: unknown): WebsitePlan | undefined {
  if (!value || typeof value !== "object") return undefined;
  const plan = value as Partial<WebsitePlan>;
  if (
    typeof plan.packageId !== "string" ||
    typeof plan.packageName !== "string" ||
    typeof plan.packageType !== "string" ||
    typeof plan.priceText !== "string" ||
    typeof plan.activatedAt !== "string"
  ) {
    return undefined;
  }
  return {
    packageId: plan.packageId,
    packageName: plan.packageName,
    packageType: plan.packageType,
    priceText: plan.priceText,
    activatedAt: plan.activatedAt,
  };
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

function normalizeCmsConnection(
  cmsVal: unknown,
  ecomVal?: unknown,
): CmsConnection | undefined {
  const cms = (cmsVal && typeof cmsVal === "object" ? cmsVal : {}) as Partial<CmsConnection>;
  const ecom = (ecomVal && typeof ecomVal === "object" ? ecomVal : {}) as Record<string, unknown>;

  const siteUrl = normalizeUrl(cms.siteUrl || ecom.wordpressCmsUrl);
  const graphqlUrl = normalizeUrl(cms.graphqlUrl || ecom.wordpressGraphqlUrl);
  const adminUrl = normalizeUrl(cms.adminUrl || ecom.wordpressAdminUrl);
  const wooCommerceApiUrl = normalizeUrl(
    cms.wooCommerceApiUrl || ecom.wooCommerceRestApiUrl,
  );
  const wooCommerceConsumerKey =
    cms.wooCommerceConsumerKey ?? (typeof ecom.wooCommerceConsumerKey === "string" ? ecom.wooCommerceConsumerKey : "");
  const wooCommerceConsumerSecret =
    cms.wooCommerceConsumerSecret ?? (typeof ecom.wooCommerceConsumerSecret === "string" ? ecom.wooCommerceConsumerSecret : "");
  const wordpressUsername =
    cms.wordpressUsername ?? (typeof ecom.wordpressAdminUser === "string" ? ecom.wordpressAdminUser : "");
  const wordpressApplicationPassword = cms.wordpressApplicationPassword ?? "";
  const storeStatusNotes =
    cms.storeStatusNotes ?? (typeof ecom.storeStatusNotes === "string" ? ecom.storeStatusNotes : "");
  const technicalNotes =
    cms.technicalNotes ?? (typeof ecom.technicalNotes === "string" ? ecom.technicalNotes : "");
  const updatedAt = cms.updatedAt || (typeof ecom.updatedAt === "string" ? ecom.updatedAt : "");

  if (!siteUrl && !wordpressUsername && !wooCommerceConsumerKey) {
    return undefined;
  }

  return {
    provider: cms.provider || "wordpress",
    siteUrl,
    adminUrl,
    graphqlUrl,
    wooCommerceApiUrl,
    wooCommerceConsumerKey,
    wooCommerceConsumerSecret,
    wordpressUsername,
    wordpressApplicationPassword,
    storeStatusNotes,
    technicalNotes,
    updatedAt,
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

export function validateWebsiteCmsConnectionInput(input: {
  provider?: unknown;
  siteUrl?: unknown;
  graphqlUrl?: unknown;
  adminUrl?: unknown;
  wooCommerceApiUrl?: unknown;
  wooCommerceConsumerKey?: unknown;
  wooCommerceConsumerSecret?: unknown;
  wordpressUsername?: unknown;
  wordpressApplicationPassword?: unknown;
  storeStatusNotes?: unknown;
  technicalNotes?: unknown;
}) {
  const siteUrl = normalizeUrl(input.siteUrl);
  const graphqlUrl = normalizeUrl(input.graphqlUrl);
  const adminUrl = normalizeUrl(input.adminUrl);
  const wooCommerceApiUrl = normalizeUrl(input.wooCommerceApiUrl);
  const wordpressUsername = normalizeOption(input.wordpressUsername, "");
  const wordpressApplicationPassword = normalizeLongText(
    input.wordpressApplicationPassword,
    240,
  );
  const wooCommerceConsumerKey = normalizeLongText(
    input.wooCommerceConsumerKey,
    240,
  );
  const wooCommerceConsumerSecret = normalizeLongText(
    input.wooCommerceConsumerSecret,
    240,
  );
  const storeStatusNotes = normalizeLongText(input.storeStatusNotes, 1000);
  const technicalNotes = normalizeLongText(input.technicalNotes, 1200);

  if (!siteUrl) {
    return { error: "WordPress CMS Site URL is required." };
  }

  if (!wordpressUsername) {
    return { error: "WordPress username/email is required." };
  }

  return {
    provider: normalizeOption(input.provider, "wordpress"),
    siteUrl,
    adminUrl,
    graphqlUrl,
    wooCommerceApiUrl,
    wooCommerceConsumerKey,
    wooCommerceConsumerSecret,
    wordpressUsername,
    wordpressApplicationPassword,
    storeStatusNotes,
    technicalNotes,
    updatedAt: new Date().toISOString(),
  };
}

export async function readWebsites(): Promise<SaaSWebsite[]> {
  try {
    const { readFile } = await import("node:fs/promises");
    const raw = await readFile(await WEBSITES_FILE(), "utf8");
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
        plan: normalizeWebsitePlan(website.plan),
        lastPublishedAt:
          typeof website.lastPublishedAt === "string"
            ? website.lastPublishedAt
            : undefined,
        cmsConnection: normalizeCmsConnection(
          website.cmsConnection,
          website.ecommerceSettings,
        ),
      };
    });
  } catch {
    return [];
  }
}

async function writeWebsites(websites: SaaSWebsite[]) {
  const { mkdir, writeFile } = await import("node:fs/promises");
  const path = await import("node:path");
  const websitesFile = await WEBSITES_FILE();
  const { backupDataFile } = await import("@/lib/dataBackup");
  await backupDataFile(websitesFile, "websites");
  const cleanWebsites = websites.map((w) => {
    const copy = { ...w };
    delete (copy as { ecommerceSettings?: unknown }).ecommerceSettings;
    return copy;
  });
  await mkdir(path.dirname(websitesFile), { recursive: true });
  await writeFile(
    websitesFile,
    `${JSON.stringify(cleanWebsites, null, 2)}\n`,
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
  websiteCategory?: string;
  companyName?: string;
  personName?: string;
  description?: string;
  logoUrl?: string;
  contactPhone?: string;
  contactEmail?: string;
  socialLinks?: string;
  creationRequestId?: string;
}) {
  const websites = await readWebsites();
  const slug = normalizeSlug(input.slug);
  const creationRequestId = normalizeLongText(input.creationRequestId, 80);

  if (creationRequestId) {
    const existingRequest = websites.find(
      (website) =>
        website.ownerId === input.ownerId &&
        website.creationRequestId === creationRequestId,
    );
    if (existingRequest) return { website: existingRequest, reused: true };
  }

  if (websites.some((website) => website.slug === slug)) {
    return { error: "This slug is already used by another website." };
  }

  const now = new Date().toISOString();
  const websiteId =
    typeof globalThis.crypto?.randomUUID === "function"
      ? globalThis.crypto.randomUUID()
      : Math.random().toString(36).slice(2);
  const website: SaaSWebsite = {
    id: websiteId,
    ownerId: input.ownerId,
    name: normalizeName(input.name),
    slug,
    type: normalizeWebsiteType(input.type),
    domain: null,
    primaryDomain: null,
    domains: [],
    description: normalizeDescription(input.description),
    websiteCategory: normalizeOption(input.websiteCategory, "Business"),
    companyName: normalizeOption(input.companyName, ""),
    personName: normalizeOption(input.personName, ""),
    logoUrl: normalizeLongText(input.logoUrl, 240),
    contactPhone: normalizeOption(input.contactPhone, ""),
    contactEmail: normalizeOption(input.contactEmail, ""),
    socialLinks: normalizeLongText(input.socialLinks, 600),
    timeZone: "Asia/Yerevan",
    language: "hy",
    primaryLanguage: "hy",
    enabledLanguages: ["hy"],
    status: "creating",
    creationRequestId: creationRequestId || undefined,
    createdAt: now,
    updatedAt: now,
  };

  try {
    const { initializeWebsiteBuilderData } = await import(
      "@/lib/websiteBuilderData"
    );
    await initializeWebsiteBuilderData({
      websiteId: website.id,
      websiteName: website.name,
      starterId: input.starterId,
    });
    await writeWebsites([...websites, website]);
  } catch (error) {
    const { getWebsiteBuilderDir } = await import("@/lib/websiteBuilderData");
    const { rm } = await import("node:fs/promises");
    await rm(getWebsiteBuilderDir(website.id), { recursive: true, force: true }).catch(
      () => undefined,
    );
    const message = error instanceof Error ? error.message : "Unknown generation error.";
    return { error: `Website generation failed: ${message}` };
  }
  return { website };
}

export async function activateWebsite(input: {
  websiteId: string;
  plan?: Omit<WebsitePlan, "activatedAt">;
}) {
  const websites = await readWebsites();
  const website = websites.find((item) => item.id === input.websiteId);
  if (!website) return { error: "Website not found." };

  const now = new Date().toISOString();
  const updatedWebsite: SaaSWebsite = {
    ...website,
    status: "active",
    plan: input.plan
      ? { ...input.plan, activatedAt: now }
      : website.plan,
    lastPublishedAt: website.lastPublishedAt ?? now,
    updatedAt: now,
  };
  await writeWebsites(
    websites.map((item) => (item.id === website.id ? updatedWebsite : item)),
  );
  return { website: updatedWebsite };
}

export async function recordWebsitePublication(input: { websiteId: string }) {
  const websites = await readWebsites();
  const website = websites.find((item) => item.id === input.websiteId);
  if (!website) return { error: "Website not found." };

  const now = new Date().toISOString();
  const updatedWebsite: SaaSWebsite = {
    ...website,
    lastPublishedAt: now,
    updatedAt: now,
  };
  await writeWebsites(
    websites.map((item) => (item.id === website.id ? updatedWebsite : item)),
  );
  return { website: updatedWebsite };
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

export async function updateWebsiteCmsConnection(input: {
  websiteId: string;
  cmsConnection: CmsConnection;
}) {
  const websites = await readWebsites();
  const website = websites.find((item) => item.id === input.websiteId);

  if (!website) {
    return { error: "Website not found." };
  }

  const updatedWebsite: SaaSWebsite = {
    ...website,
    cmsConnection: input.cmsConnection,
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
