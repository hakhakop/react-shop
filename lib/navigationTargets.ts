import type { BuilderShellSettings } from "@/lib/builderShell";
import type { BuilderLayoutKey } from "@/lib/builderLayouts";

export const SYSTEM_NAVIGATION_PAGE_KEYS = [
  "home",
  "shop",
  "cart",
  "checkout",
  "my-account",
] as const;

export type SystemNavigationPageKey = typeof SYSTEM_NAVIGATION_PAGE_KEYS[number];

export type NavigationTargetLike = {
  kind: string;
  pageKey?: string;
  postType?: string;
  taxonomy?: string;
  slug?: string;
  sourceDatabaseId?: number;
  uri?: string;
  url?: string;
};

export type SystemRouteAlias = {
  path: string;
  pageKey: SystemNavigationPageKey;
  target?: NavigationTargetLike;
};

export type CommerceRouteAlias = {
  path: string;
  pageKey: "product-category" | "product-single";
  target: NavigationTargetLike & { slug: string };
};

export type NavigationRouteAlias = SystemRouteAlias | CommerceRouteAlias;

function normalizeInternalPath(value: string) {
  try {
    const parsed = new URL(value, "https://webpages.local");
    return parsed.pathname.replace(/\/{2,}/g, "/").replace(/\/+$/, "") || "/";
  } catch {
    return value.split(/[?#]/)[0]!.replace(/\/{2,}/g, "/").replace(/\/+$/, "") || "/";
  }
}

export function isSystemNavigationPageKey(value: unknown): value is SystemNavigationPageKey {
  return typeof value === "string" && SYSTEM_NAVIGATION_PAGE_KEYS.includes(value as SystemNavigationPageKey);
}

/** Canonical target-to-public-href projection. Source domains are never used. */
export function getNavigationTargetHref(target: NavigationTargetLike) {
  if (target.kind === "anchor") return target.url ?? "#";
  if (target.kind === "custom") return target.url ?? target.uri ?? "#";
  return target.uri ?? target.url ?? "#";
}

/** Build a runtime alias registry from the canonical WebPages menu documents. */
export function getSystemRouteAliases(
  settings: Pick<BuilderShellSettings, "menuItems" | "namedMenus">,
): SystemRouteAlias[] {
  const items = [
    ...(settings.menuItems ?? []),
    ...(settings.namedMenus ?? []).flatMap((menu) => menu.items),
  ];
  const aliases = new Map<string, SystemNavigationPageKey>();
  for (const item of items) {
    const target = item.navigationTarget;
    if (target?.kind !== "system" || !isSystemNavigationPageKey(target.pageKey)) continue;
    const href = getNavigationTargetHref(target);
    if (!href.startsWith("/") || href.startsWith("//")) continue;
    const path = normalizeInternalPath(href);
    if (!aliases.has(path)) aliases.set(path, target.pageKey);
  }
  return Array.from(aliases, ([path, pageKey]) => ({ path, pageKey }));
}

/** Build all typed storefront aliases from the canonical WebPages menu owner. */
export function getNavigationRouteAliases(
  settings: Pick<BuilderShellSettings, "menuItems" | "namedMenus">,
): NavigationRouteAlias[] {
  const items = [
    ...(settings.menuItems ?? []),
    ...(settings.namedMenus ?? []).flatMap((menu) => menu.items),
  ];
  const aliases = new Map<string, NavigationRouteAlias>();
  for (const item of items) {
    const target = item.navigationTarget;
    if (!target) continue;
    const href = getNavigationTargetHref(target);
    if (!href.startsWith("/") || href.startsWith("//")) continue;
    const path = normalizeInternalPath(href);
    let alias: NavigationRouteAlias | null = null;
    if (target.kind === "system" && isSystemNavigationPageKey(target.pageKey)) {
      alias = { path, pageKey: target.pageKey, target };
    } else if (target.kind === "term" && target.taxonomy === "product_cat" && target.slug) {
      alias = { path, pageKey: "product-category", target: { ...target, slug: target.slug } };
    } else if (target.kind === "product" && target.slug) {
      alias = { path, pageKey: "product-single", target: { ...target, slug: target.slug } };
    }
    if (alias && !aliases.has(path)) aliases.set(path, alias);
  }
  return Array.from(aliases.values());
}

export function resolveNavigationRouteAlias(
  requestedPath: string | null | undefined,
  aliases: readonly NavigationRouteAlias[],
): NavigationRouteAlias | null {
  const raw = requestedPath?.trim();
  if (!raw) return null;
  const path = normalizeInternalPath(raw.startsWith("/") ? raw : `/${raw}`);
  return aliases.find((alias) => alias.path === path) ?? null;
}

/** Canonical commerce routes remain hard-reloadable even when reached outside a menu. */
export function resolveCommerceRouteCandidate(
  requestedPath: string | null | undefined,
): CommerceRouteAlias | null {
  const raw = requestedPath?.trim();
  if (!raw) return null;
  const path = normalizeInternalPath(raw.startsWith("/") ? raw : `/${raw}`);
  const product = path.match(/^\/product\/([^/]+)$/i);
  if (product?.[1]) {
    const slug = decodeURIComponent(product[1]);
    return { path, pageKey: "product-single", target: { kind: "product", postType: "product", slug, uri: path } };
  }
  const category = path.match(/^\/product-category\/(?:.+\/)?([^/]+)$/i);
  if (category?.[1]) {
    const slug = decodeURIComponent(category[1]);
    return { path, pageKey: "product-category", target: { kind: "term", taxonomy: "product_cat", slug, uri: path } };
  }
  return null;
}

export function resolveSystemRouteAlias(
  requestedPath: string | null | undefined,
  aliases: readonly NavigationRouteAlias[],
): BuilderLayoutKey | null {
  const resolved = resolveNavigationRouteAlias(requestedPath, aliases);
  if (!resolved || resolved.pageKey === "product-category" || resolved.pageKey === "product-single") return null;
  const pageKey = resolved.pageKey;
  if (!pageKey) return null;
  if (pageKey === "cart" || pageKey === "checkout" || pageKey === "my-account") {
    return `page:${pageKey}`;
  }
  return pageKey;
}
