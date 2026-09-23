import { mkdir, readFile, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { getRuntimeDataDir } from "@/lib/runtimeDataDir";
import { isStarterWebsiteId } from "@/lib/starterWebsites";

export type GlobalStarterPreview = {
  tone: "sage" | "violet" | "clay" | "blank";
  rows: number[];
};

export type GlobalStarterRecord = {
  id: string;
  sourceWebsiteId: string;
  title: string;
  description: string;
  category: string;
  previewImageUrl?: string;
  hoverImageUrl?: string;
  hoverVideoUrl?: string;
  sortOrder: number;
  enabled: boolean;
  preview: GlobalStarterPreview;
  createdAt: string;
  updatedAt: string;
};

export type GlobalStarterCatalogItem = {
  id: string;
  name: string;
  description: string;
  category: string;
  previewImageUrl?: string;
  hoverImageUrl?: string;
  hoverVideoUrl?: string;
  preview: GlobalStarterPreview;
};

const GLOBAL_STARTERS_FILE = () =>
  path.join(getRuntimeDataDir(), "global-starters.json");
const GLOBAL_STARTER_ID_PATTERN = /^global-[a-z0-9-]+$/;
const DEFAULT_PREVIEW: GlobalStarterPreview = {
  tone: "sage",
  rows: [86, 58, 74, 62],
};

function isPreview(value: unknown): value is GlobalStarterPreview {
  if (!value || typeof value !== "object") return false;
  const preview = value as Partial<GlobalStarterPreview>;
  return (
    (preview.tone === "sage" ||
      preview.tone === "violet" ||
      preview.tone === "clay" ||
      preview.tone === "blank") &&
    Array.isArray(preview.rows) &&
    preview.rows.length > 0 &&
    preview.rows.every((row) => typeof row === "number" && row > 0 && row <= 100)
  );
}

function isGlobalStarterRecord(value: unknown): value is GlobalStarterRecord {
  if (!value || typeof value !== "object") return false;
  const record = value as Partial<GlobalStarterRecord>;
  return (
    typeof record.id === "string" &&
    isGlobalStarterId(record.id) &&
    typeof record.sourceWebsiteId === "string" &&
    typeof record.title === "string" &&
    typeof record.description === "string" &&
    typeof record.category === "string" &&
    (record.previewImageUrl === undefined || typeof record.previewImageUrl === "string") &&
    (record.hoverImageUrl === undefined || typeof record.hoverImageUrl === "string") &&
    (record.hoverVideoUrl === undefined || typeof record.hoverVideoUrl === "string") &&
    typeof record.sortOrder === "number" &&
    typeof record.enabled === "boolean" &&
    isPreview(record.preview) &&
    typeof record.createdAt === "string" &&
    typeof record.updatedAt === "string"
  );
}

export function isGlobalStarterId(value: unknown): value is string {
  return typeof value === "string" && GLOBAL_STARTER_ID_PATTERN.test(value);
}

export async function readGlobalStarters(): Promise<GlobalStarterRecord[]> {
  try {
    const raw = await readFile(await GLOBAL_STARTERS_FILE(), "utf8");
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter(isGlobalStarterRecord) : [];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
}

async function writeGlobalStarters(records: GlobalStarterRecord[]) {
  const filePath = await GLOBAL_STARTERS_FILE();
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(records, null, 2)}\n`, "utf8");
}

export function isStarterSelectionId(value: unknown): value is string {
  if (typeof value !== "string") return false;
  return isStarterWebsiteId(value) || isGlobalStarterId(value);
}

export async function getGlobalStarter(
  id: string,
  options: { includeDisabled?: boolean } = {},
) {
  const record = (await readGlobalStarters()).find((item) => item.id === id) ?? null;
  if (!record || (!options.includeDisabled && !record.enabled)) return null;
  return record;
}

export async function hasEnabledGlobalStarterSource(sourceWebsiteId: string) {
  return (await readGlobalStarters()).some(
    (item) => item.sourceWebsiteId === sourceWebsiteId && item.enabled,
  );
}

export async function resolveEnabledGlobalStarter(id: string) {
  const record = await getGlobalStarter(id);
  if (!record) return null;

  const { getWebsiteById } = await import("@/lib/websites");
  const sourceWebsite = await getWebsiteById(record.sourceWebsiteId);
  if (!sourceWebsite) return null;

  return { record, sourceWebsite };
}

export async function listPublicGlobalStarters(): Promise<GlobalStarterCatalogItem[]> {
  const records = (await readGlobalStarters())
    .filter((item) => item.enabled)
    .sort((left, right) => left.sortOrder - right.sortOrder || left.title.localeCompare(right.title));
  const { getWebsiteById } = await import("@/lib/websites");

  const resolved = await Promise.all(
    records.map(async (record) => {
      const sourceWebsite = await getWebsiteById(record.sourceWebsiteId);
      if (!sourceWebsite) return null;
      return {
        id: record.id,
        name: record.title || sourceWebsite.name,
        description: record.description || sourceWebsite.description,
        category: record.category,
        ...(record.previewImageUrl ? { previewImageUrl: record.previewImageUrl } : {}),
        ...(record.hoverImageUrl ? { hoverImageUrl: record.hoverImageUrl } : {}),
        ...(record.hoverVideoUrl ? { hoverVideoUrl: record.hoverVideoUrl } : {}),
        preview: record.preview,
      } satisfies GlobalStarterCatalogItem;
    }),
  );

  return resolved.filter((item): item is GlobalStarterCatalogItem => item !== null);
}

export async function createGlobalStarter(input: {
  sourceWebsiteId: string;
  title?: unknown;
  description?: unknown;
  category?: unknown;
  previewImageUrl?: unknown;
  hoverImageUrl?: unknown;
  hoverVideoUrl?: unknown;
  sortOrder?: unknown;
}) {
  const { getWebsiteById } = await import("@/lib/websites");
  const sourceWebsite = await getWebsiteById(input.sourceWebsiteId);
  if (!sourceWebsite) return { error: "Source website not found." };

  const records = await readGlobalStarters();
  if (records.some((item) => item.sourceWebsiteId === sourceWebsite.id)) {
    return { error: "This website already has a Global Starter designation." };
  }

  const now = new Date().toISOString();
  const record: GlobalStarterRecord = {
    id: `global-${randomUUID()}`,
    sourceWebsiteId: sourceWebsite.id,
    title: normalizeCatalogText(input.title, sourceWebsite.name, 120),
    description: normalizeCatalogText(input.description, sourceWebsite.description, 240),
    category: normalizeCatalogText(input.category, "WebPages", 80),
    previewImageUrl: normalizeOptionalUrl(input.previewImageUrl),
    hoverImageUrl: normalizeOptionalUrl(input.hoverImageUrl),
    hoverVideoUrl: normalizeOptionalUrl(input.hoverVideoUrl),
    sortOrder: normalizeSortOrder(input.sortOrder),
    enabled: true,
    preview: { ...DEFAULT_PREVIEW, rows: [...DEFAULT_PREVIEW.rows] },
    createdAt: now,
    updatedAt: now,
  };
  await writeGlobalStarters([...records, record]);
  return { record };
}

export async function updateGlobalStarter(input: {
  id: string;
  title?: unknown;
  description?: unknown;
  category?: unknown;
  previewImageUrl?: unknown;
  hoverImageUrl?: unknown;
  hoverVideoUrl?: unknown;
  sortOrder?: unknown;
  enabled?: unknown;
}) {
  const records = await readGlobalStarters();
  const current = records.find((item) => item.id === input.id);
  if (!current) return { error: "Global Starter not found." };

  const updated: GlobalStarterRecord = {
    ...current,
    title: normalizeCatalogText(input.title, current.title, 120),
    description: normalizeCatalogText(input.description, current.description, 240),
    category: normalizeCatalogText(input.category, current.category, 80),
    previewImageUrl: normalizeOptionalUrl(input.previewImageUrl, current.previewImageUrl),
    hoverImageUrl: normalizeOptionalUrl(input.hoverImageUrl, current.hoverImageUrl),
    hoverVideoUrl: normalizeOptionalUrl(input.hoverVideoUrl, current.hoverVideoUrl),
    sortOrder: normalizeSortOrder(input.sortOrder, current.sortOrder),
    enabled: typeof input.enabled === "boolean" ? input.enabled : current.enabled,
    updatedAt: new Date().toISOString(),
  };
  await writeGlobalStarters(records.map((item) => (item.id === updated.id ? updated : item)));
  return { record: updated };
}

export async function removeGlobalStarter(id: string) {
  const records = await readGlobalStarters();
  const current = records.find((item) => item.id === id);
  if (!current) return { error: "Global Starter not found." };
  await writeGlobalStarters(records.filter((item) => item.id !== id));
  return { record: current };
}

function normalizeCatalogText(value: unknown, fallback: string, maxLength: number) {
  const normalized = typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "";
  return (normalized || fallback).slice(0, maxLength);
}

function normalizeOptionalUrl(value: unknown, fallback?: string) {
  if (value === undefined) return fallback;
  const normalized = typeof value === "string" ? value.trim() : "";
  return normalized ? normalized.slice(0, 2048) : undefined;
}

function normalizeSortOrder(value: unknown, fallback = 0) {
  if (typeof value !== "number" && typeof value !== "string") return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.max(0, Math.min(9999, Math.round(parsed))) : fallback;
}
