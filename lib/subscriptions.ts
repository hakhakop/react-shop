import { mkdir, readFile, writeFile } from "node:fs/promises";
import crypto from "node:crypto";
import path from "node:path";
import { getRuntimeDataDir } from "@/lib/runtimeDataDir";

export type SubscriptionPackage = {
  id: string;
  name: string;
  description: string;
  priceText: string;
  type: string;
  features: string[];
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type SubscriptionPackageInput = {
  name?: unknown;
  description?: unknown;
  priceText?: unknown;
  type?: unknown;
  featuresText?: unknown;
  displayOrder?: unknown;
  isActive?: unknown;
};

const PACKAGES_FILE = () => path.join(getRuntimeDataDir(), "subscription-packages.json");

const defaultPackages: SubscriptionPackage[] = [
  {
    id: "business-website",
    name: "Business Website",
    description: "A polished company website for services, teams, and lead generation.",
    priceText: "$299 setup / $49 mo",
    type: "Business Website",
    features: ["Responsive website", "Core business pages", "Contact forms", "Manual setup within 24 hours"],
    displayOrder: 10,
    isActive: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "website-blog",
    name: "Website + Blog",
    description: "A complete website with a content-ready blog structure.",
    priceText: "$399 setup / $79 mo",
    type: "Website + Blog",
    features: ["Everything in Business Website", "Blog-ready pages", "Category structure", "Editorial layout setup"],
    displayOrder: 20,
    isActive: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "e-commerce",
    name: "E-Commerce",
    description: "A storefront request package for shops that need product selling pages.",
    priceText: "$599 setup / $129 mo",
    type: "E-Commerce",
    features: ["Storefront design", "Product/catalog structure", "Shopping experience planning", "Manual WooCommerce preparation"],
    displayOrder: 30,
    isActive: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
];

function isSubscriptionPackage(value: unknown): value is SubscriptionPackage {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<SubscriptionPackage>;
  return (
    typeof item.id === "string" &&
    typeof item.name === "string" &&
    typeof item.description === "string" &&
    typeof item.priceText === "string" &&
    typeof item.type === "string" &&
    Array.isArray(item.features) &&
    item.features.every((feature) => typeof feature === "string") &&
    typeof item.displayOrder === "number" &&
    typeof item.isActive === "boolean" &&
    typeof item.createdAt === "string" &&
    typeof item.updatedAt === "string"
  );
}

function normalizeText(value: unknown, maxLength: number) {
  return typeof value === "string"
    ? value.trim().replace(/\s+/g, " ").slice(0, maxLength)
    : "";
}

function normalizeLongText(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function parseFeatures(value: unknown) {
  const raw = typeof value === "string" ? value : "";
  return raw
    .split(/\r?\n|,/)
    .map((feature) => feature.trim())
    .filter(Boolean)
    .slice(0, 16)
    .map((feature) => feature.slice(0, 120));
}

function parseDisplayOrder(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.trunc(parsed) : 100;
}

function sortPackages(packages: SubscriptionPackage[]) {
  return [...packages].sort((left, right) => {
    if (left.displayOrder !== right.displayOrder) {
      return left.displayOrder - right.displayOrder;
    }
    return left.name.localeCompare(right.name);
  });
}

function validatePackageInput(input: SubscriptionPackageInput) {
  const name = normalizeText(input.name, 80);
  const description = normalizeLongText(input.description, 240);
  const priceText = normalizeText(input.priceText, 80);
  const type = normalizeText(input.type, 80);
  const features = parseFeatures(input.featuresText);
  const displayOrder = parseDisplayOrder(input.displayOrder);
  const isActive = input.isActive === "on" || input.isActive === true;

  if (!name) return { error: "Package name is required." };
  if (!description) return { error: "Package description is required." };
  if (!priceText) return { error: "Price/period text is required." };
  if (!type) return { error: "Package type is required." };
  if (features.length === 0) return { error: "Add at least one package feature." };

  return { name, description, priceText, type, features, displayOrder, isActive };
}

export async function readSubscriptionPackages() {
  try {
    const raw = await readFile(PACKAGES_FILE(), "utf8");
    const parsed = JSON.parse(raw) as unknown;
    if (Array.isArray(parsed)) {
      return sortPackages(parsed.filter(isSubscriptionPackage));
    }
  } catch {
    return sortPackages(defaultPackages);
  }

  return sortPackages(defaultPackages);
}

async function writeSubscriptionPackages(packages: SubscriptionPackage[]) {
  const packagesFile = PACKAGES_FILE();
  await mkdir(path.dirname(packagesFile), { recursive: true });
  await writeFile(packagesFile, `${JSON.stringify(sortPackages(packages), null, 2)}\n`, "utf8");
}

export async function readActiveSubscriptionPackages() {
  const packages = await readSubscriptionPackages();
  return packages.filter((item) => item.isActive);
}

export async function findSubscriptionPackageById(id: string) {
  const packages = await readSubscriptionPackages();
  return packages.find((item) => item.id === id) ?? null;
}

export async function createSubscriptionPackage(input: SubscriptionPackageInput) {
  const parsed = validatePackageInput(input);
  if ("error" in parsed) return parsed;

  const now = new Date().toISOString();
  const packages = await readSubscriptionPackages();
  const item: SubscriptionPackage = {
    id: crypto.randomUUID(),
    ...parsed,
    createdAt: now,
    updatedAt: now,
  };

  await writeSubscriptionPackages([...packages, item]);
  return { package: item };
}

export async function updateSubscriptionPackage(
  id: string,
  input: SubscriptionPackageInput,
) {
  const parsed = validatePackageInput(input);
  if ("error" in parsed) return parsed;

  const packages = await readSubscriptionPackages();
  const existing = packages.find((item) => item.id === id);
  if (!existing) return { error: "Package not found." };

  const updated: SubscriptionPackage = {
    ...existing,
    ...parsed,
    updatedAt: new Date().toISOString(),
  };

  await writeSubscriptionPackages(
    packages.map((item) => (item.id === id ? updated : item)),
  );
  return { package: updated };
}

export async function deleteSubscriptionPackage(id: string) {
  const packages = await readSubscriptionPackages();
  await writeSubscriptionPackages(packages.filter((item) => item.id !== id));
}

export function packageFeaturesText(item: Pick<SubscriptionPackage, "features">) {
  return item.features.join("\n");
}
