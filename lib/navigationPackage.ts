import type {
  BuilderMenuPresentation,
  BuilderMenuPresentationMap,
  ReactMenuItem,
} from "@/lib/builderShell";
import { getNavigationTargetHref } from "@/lib/navigationTargets";

export const PORTABLE_NAVIGATION_FORMAT = "webpages.navigation" as const;
export const PORTABLE_NAVIGATION_VERSION = 1 as const;

export type PortableNavigationTargetKind =
  | "webpages-page"
  | "system"
  | "page"
  | "post"
  | "product"
  | "term"
  | "archive"
  | "anchor"
  | "custom";

export type PortableNavigationTarget = {
  kind: PortableNavigationTargetKind;
  postType?: "page" | "post" | "product" | string;
  taxonomy?: "category" | "product_cat" | string;
  pageKey?: string;
  slug?: string;
  sourceDatabaseId?: number;
  uri?: string;
  url?: string;
};

export type PortableNavigationItem = {
  key: string;
  /** Diagnostic/current-site identity only; portableKey remains authoritative. */
  sourceMenuItemDatabaseId?: number;
  parentKey: string | null;
  order: number;
  label: string;
  target: PortableNavigationTarget;
  linkTarget: "_self" | "_blank";
  presentation?: BuilderMenuPresentation;
  metadata?: Pick<
    ReactMenuItem,
    "iconName" | "iconUrl" | "subtitle" | "mobileUrl" | "visibility"
  >;
};

export type PortableNavigationPackage = {
  format: typeof PORTABLE_NAVIGATION_FORMAT;
  version: typeof PORTABLE_NAVIGATION_VERSION;
  exportedAt: string;
  menu: {
    name: string;
    intendedLocation: string | null;
    sourceDatabaseId?: number;
    items: PortableNavigationItem[];
  };
};

export type NavigationResolution = {
  key: string;
  status: "resolved" | "unresolved" | "portable";
  target: PortableNavigationTarget;
  destinationDatabaseId?: number;
  message?: string;
};

export type NavigationInstallPreview = {
  package: PortableNavigationPackage;
  resolutions: NavigationResolution[];
  resolvedCount: number;
  unresolvedCount: number;
  portableCount: number;
};

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

function optionalString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function optionalNumber(value: unknown) {
  const number = Number(value);
  return Number.isInteger(number) && number > 0 ? number : undefined;
}

function normalizePath(value: string): string {
  if (!value) return "/";
  const leading = value.startsWith("/") ? value : `/${value}`;
  return leading.replace(/\/{2,}/g, "/");
}

/** Remove only the connected WordPress origin. Other absolute URLs are external. */
export function makeNavigationUrlPortable(
  value: string | null | undefined,
  sourceOrigin?: string | null,
): string {
  const raw = value?.trim() ?? "";
  if (!raw || raw.startsWith("#")) return raw || "#";
  try {
    const parsed = new URL(raw);
    const source = sourceOrigin ? new URL(sourceOrigin) : null;
    if (source && parsed.origin.toLowerCase() === source.origin.toLowerCase()) {
      return `${normalizePath(parsed.pathname)}${parsed.search}${parsed.hash}`;
    }
    return parsed.toString();
  } catch {
    return normalizePath(raw);
  }
}

function stableHash(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
}

function targetIdentity(target: PortableNavigationTarget) {
  return [
    target.kind,
    target.postType ?? "",
    target.taxonomy ?? "",
    target.pageKey ?? "",
    target.slug ?? "",
    target.uri ?? "",
    target.url ?? "",
  ].join("|");
}

function classifyLocalTarget(url: string): PortableNavigationTarget {
  if (url.startsWith("#")) return { kind: "anchor", url };
  if (/^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(url)) return { kind: "custom", url };
  return { kind: "custom", uri: url || "/" };
}

export function createPortableNavigationPackage(input: {
  name: string;
  intendedLocation?: string | null;
  sourceDatabaseId?: number;
  sourceOrigin?: string | null;
  items: ReactMenuItem[];
  presentation?: BuilderMenuPresentationMap;
  targetsByItemId?: Record<string, PortableNavigationTarget>;
  exportedAt?: string;
}): PortableNavigationPackage {
  const keyById = new Map<string, string>();
  const collisionCounts = new Map<string, number>();
  const prepared = input.items.map((item) => {
    const portableUrl = makeNavigationUrlPortable(item.url, input.sourceOrigin);
    const target = {
      ...(input.targetsByItemId?.[item.id] ?? classifyLocalTarget(portableUrl)),
    };
    if (target.url) target.url = makeNavigationUrlPortable(target.url, input.sourceOrigin);
    if (target.uri) target.uri = makeNavigationUrlPortable(target.uri, input.sourceOrigin);
    const semanticIdentity = `${targetIdentity(target)}|${item.label.trim()}`;
    const occurrence = collisionCounts.get(semanticIdentity) ?? 0;
    collisionCounts.set(semanticIdentity, occurrence + 1);
    const authoredKey = optionalString((item as ReactMenuItem & { portableKey?: string }).portableKey);
    const key = authoredKey ?? `nav-${stableHash(`${semanticIdentity}|${occurrence}`)}`;
    keyById.set(item.id, key);
    return { item, key, target };
  });

  const items = prepared.map(({ item, key, target }, order) => {
    const parentKey = item.parentId ? keyById.get(item.parentId) ?? null : null;
    const metadata: PortableNavigationItem["metadata"] = {
      ...(item.iconName ? { iconName: item.iconName } : {}),
      ...(item.iconUrl ? { iconUrl: item.iconUrl } : {}),
      ...(item.subtitle ? { subtitle: item.subtitle } : {}),
      ...(item.mobileUrl
        ? { mobileUrl: makeNavigationUrlPortable(item.mobileUrl, input.sourceOrigin) }
        : {}),
      ...(item.visibility && item.visibility !== "all" ? { visibility: item.visibility } : {}),
    };

    return {
      key,
      ...(/^wp-(\d+)$/.test(item.id)
        ? { sourceMenuItemDatabaseId: Number(item.id.slice(3)) }
        : {}),
      parentKey,
      order,
      label: item.label,
      target,
      linkTarget: item.target === "_blank" ? "_blank" : "_self",
      ...(input.presentation?.[item.id] ? { presentation: input.presentation[item.id] } : {}),
      ...(Object.keys(metadata).length ? { metadata } : {}),
    } satisfies PortableNavigationItem;
  });

  return {
    format: PORTABLE_NAVIGATION_FORMAT,
    version: PORTABLE_NAVIGATION_VERSION,
    exportedAt: input.exportedAt ?? new Date().toISOString(),
    menu: {
      name: input.name.trim() || "Navigation",
      intendedLocation: input.intendedLocation?.trim() || null,
      ...(input.sourceDatabaseId ? { sourceDatabaseId: input.sourceDatabaseId } : {}),
      items,
    },
  };
}

function parseTarget(value: unknown): PortableNavigationTarget {
  const raw = record(value);
  const kind = raw.kind;
  if (!["webpages-page", "system", "page", "post", "product", "term", "archive", "anchor", "custom"].includes(String(kind))) {
    throw new Error(`Unsupported navigation target kind: ${String(kind || "missing")}.`);
  }
  const target: PortableNavigationTarget = { kind: kind as PortableNavigationTargetKind };
  const postType = optionalString(raw.postType);
  const taxonomy = optionalString(raw.taxonomy);
  const pageKey = optionalString(raw.pageKey);
  const slug = optionalString(raw.slug);
  const uri = optionalString(raw.uri);
  const url = optionalString(raw.url);
  const sourceDatabaseId = optionalNumber(raw.sourceDatabaseId);
  if (postType) target.postType = postType;
  if (taxonomy) target.taxonomy = taxonomy;
  if (pageKey) target.pageKey = pageKey;
  if (slug) target.slug = slug;
  if (uri) target.uri = makeNavigationUrlPortable(uri);
  if (url) target.url = makeNavigationUrlPortable(url);
  if (sourceDatabaseId) target.sourceDatabaseId = sourceDatabaseId;
  if (
    ["page", "post", "product", "term"].includes(target.kind) &&
    !target.slug &&
    !target.sourceDatabaseId
  ) {
    throw new Error(`${target.kind} navigation targets require a slug or source database ID.`);
  }
  if (target.kind === "term" && !target.taxonomy) {
    throw new Error("Term navigation targets require a taxonomy.");
  }
  return target;
}

export function parsePortableNavigationPackage(value: unknown): PortableNavigationPackage {
  const raw = record(value);
  if (raw.format !== PORTABLE_NAVIGATION_FORMAT || raw.version !== PORTABLE_NAVIGATION_VERSION) {
    throw new Error("This is not a supported WebPages navigation package (expected version 1). ");
  }
  const menu = record(raw.menu);
  const name = optionalString(menu.name);
  if (!name || !Array.isArray(menu.items)) throw new Error("Navigation package menu is invalid.");
  const keys = new Set<string>();
  const items = menu.items.map((value, index) => {
    const item = record(value);
    const key = optionalString(item.key);
    const label = optionalString(item.label);
    if (!key || !label || keys.has(key)) throw new Error(`Navigation item ${index + 1} has an invalid or duplicate key.`);
    keys.add(key);
    const parentKey = item.parentKey === null ? null : optionalString(item.parentKey) ?? null;
    const presentation = item.presentation && typeof item.presentation === "object"
      ? item.presentation as BuilderMenuPresentation
      : undefined;
    const metadataRaw = record(item.metadata);
    return {
      key,
      ...(optionalNumber(item.sourceMenuItemDatabaseId)
        ? { sourceMenuItemDatabaseId: optionalNumber(item.sourceMenuItemDatabaseId) }
        : {}),
      parentKey,
      order: Number.isInteger(item.order) ? Number(item.order) : index,
      label,
      target: parseTarget(item.target),
      linkTarget: item.linkTarget === "_blank" ? "_blank" : "_self",
      ...(presentation ? { presentation } : {}),
      ...(Object.keys(metadataRaw).length ? { metadata: metadataRaw as PortableNavigationItem["metadata"] } : {}),
    } satisfies PortableNavigationItem;
  });
  for (const item of items) {
    if (item.parentKey && !keys.has(item.parentKey)) throw new Error(`Navigation item ${item.key} references a missing parent.`);
  }
  const parentByKey = new Map(items.map((item) => [item.key, item.parentKey]));
  for (const item of items) {
    const ancestors = new Set([item.key]);
    let parentKey = item.parentKey;
    while (parentKey) {
      if (ancestors.has(parentKey)) throw new Error(`Navigation item ${item.key} has a circular parent relationship.`);
      ancestors.add(parentKey);
      parentKey = parentByKey.get(parentKey) ?? null;
    }
  }
  return {
    format: PORTABLE_NAVIGATION_FORMAT,
    version: PORTABLE_NAVIGATION_VERSION,
    exportedAt: optionalString(raw.exportedAt) ?? new Date(0).toISOString(),
    menu: {
      name,
      intendedLocation: optionalString(menu.intendedLocation) ?? null,
      ...(optionalNumber(menu.sourceDatabaseId) ? { sourceDatabaseId: optionalNumber(menu.sourceDatabaseId) } : {}),
      items: items.sort((a, b) => a.order - b.order),
    },
  };
}

export function portableTargetHref(target: PortableNavigationTarget) {
  return getNavigationTargetHref(target);
}

export function materializePortableNavigation(
  packageValue: PortableNavigationPackage,
  destinationIds: Record<string, string | number> = {},
) {
  const idByKey = new Map<string, string>();
  for (const item of packageValue.menu.items) {
    idByKey.set(item.key, String(destinationIds[item.key] ?? `portable-${item.key}`));
  }
  const presentation: BuilderMenuPresentationMap = {};
  const items: ReactMenuItem[] = packageValue.menu.items.map((item) => {
    const id = idByKey.get(item.key)!;
    if (item.presentation) presentation[id] = item.presentation;
    return {
      id,
      label: item.label,
      url: portableTargetHref(item.target),
      parentId: item.parentKey ? idByKey.get(item.parentKey) ?? null : null,
      target: item.linkTarget,
      ...(item.metadata ?? {}),
      portableKey: item.key,
      navigationTarget: item.target,
    } as ReactMenuItem;
  });
  return { items, presentation };
}

export function summarizeNavigationPreview(
  packageValue: PortableNavigationPackage,
  resolutions: NavigationResolution[],
): NavigationInstallPreview {
  return {
    package: packageValue,
    resolutions,
    resolvedCount: resolutions.filter((item) => item.status === "resolved").length,
    unresolvedCount: resolutions.filter((item) => item.status === "unresolved").length,
    portableCount: resolutions.filter((item) => item.status === "portable").length,
  };
}

export function previewPortableNavigationPackage(
  packageValue: PortableNavigationPackage,
  wordpressAvailable = false,
): NavigationInstallPreview {
  const wordpressKinds = new Set<PortableNavigationTargetKind>(["page", "post", "product", "term"]);
  return summarizeNavigationPreview(packageValue, packageValue.menu.items.map((item) => {
    if (!wordpressKinds.has(item.target.kind)) {
      return { key: item.key, status: "portable", target: item.target };
    }
    return {
      key: item.key,
      status: "unresolved",
      target: item.target,
      message: wordpressAvailable
        ? `WordPress target ${item.target.taxonomy ?? item.target.postType ?? item.target.kind} “${item.target.slug}” has not been resolved yet.`
        : `WordPress target ${item.target.taxonomy ?? item.target.postType ?? item.target.kind} “${item.target.slug}” is unavailable without a WordPress connection. Its portable URI will be retained.`,
    };
  }));
}
