import type { BuilderCustomPage, BuilderLayoutKey } from "@/lib/builderLayouts";

export type ScopedPreviewPage = Pick<BuilderCustomPage, "key" | "slug">;

export type ScopedWebsiteLinkContext = {
  websiteId: string;
  pages?: ScopedPreviewPage[];
};

function isExternalOrSpecialHref(href: string) {
  return /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(href);
}

function isLocalPreviewHost(host: string) {
  if (!host) return false;
  if (host === "cms.webpages.am") return true;
  if (host === "localhost" || host.startsWith("localhost:")) return true;
  if (host === "127.0.0.1" || host.startsWith("127.0.0.1:")) return true;
  if (host.endsWith(".local")) return true;
  return false;
}

function normalizeHrefPath(href: string) {
  try {
    const url = new URL(href, "https://webpages.local");
    return {
      path: url.pathname.replace(/\/+$/, "") || "/",
      hash: url.hash,
    };
  } catch {
    const [pathWithQuery, hash = ""] = href.split("#");
    const [path = "/"] = pathWithQuery.split("?");
    return {
      path: path.replace(/\/+$/, "") || "/",
      hash: hash ? `#${hash}` : "",
    };
  }
}

export function getScopedWebsiteIdFromPath(pathname: string | null | undefined) {
  const match = pathname?.match(/^\/app\/websites\/([^/]+)\/(?:builder|preview)(?:\/|$)/);
  return match?.[1] ?? null;
}

function isSaaSRoute(path: string) {
  return (
    path === "/app" ||
    path.startsWith("/app/") ||
    path === "/admin" ||
    path.startsWith("/admin/") ||
    path === "/login" ||
    path === "/register" ||
    path === "/account"
  );
}

export function getBuilderPageKeyForHref(
  href: string | null | undefined,
  pages: ScopedPreviewPage[] = [],
): BuilderLayoutKey | null {
  if (!href) return null;

  const trimmed = href.trim();
  if (!trimmed || trimmed === "#" || trimmed.startsWith("#")) return null;

  if (isExternalOrSpecialHref(trimmed)) {
    try {
      const parsed = new URL(trimmed);
      const currentHost =
        typeof window !== "undefined" ? window.location.host : null;
      if (currentHost) {
        if (parsed.host !== currentHost && !isLocalPreviewHost(parsed.host)) {
          return null;
        }
      } else if (!isLocalPreviewHost(parsed.host)) {
        return null;
      }
    } catch {
      return null;
    }
  }

  const { path } = normalizeHrefPath(trimmed);
  if (isSaaSRoute(path)) return null;

  if (path === "/") return "home";
  if (path === "/shop") return "shop";
  if (path === "/client") return "client";
  if (path === "/cart") return "page:cart";
  if (path === "/checkout") return "page:checkout";
  if (path === "/my-account") return "page:my-account";
  if (path === "/search") return "search-results";
  if (path === "/categories") return "product-category";
  if (path.startsWith("/category/")) return "product-category-specific";
  if (path === "/product" || path.startsWith("/product/")) {
    return "product-single";
  }
  const slug = path.replace(/^\/+|\/+$/g, "");
  const matchingPage = pages.find(
    (page) =>
      page.slug === slug ||
      page.key === `page:${slug}` ||
      page.key === slug,
  );
  if (matchingPage) return matchingPage.key;
  if (/^\/[a-z0-9]+(?:-[a-z0-9]+)*$/.test(path)) {
    return `page:${slug}`;
  }

  return null;
}

export function getPreviewActivePathForPageKey(pageKey: BuilderLayoutKey) {
  if (pageKey === "home") return "/";
  if (pageKey === "shop") return "/shop";
  if (pageKey === "client") return "/client";
  if (pageKey === "product-single") return "/product";
  if (
    pageKey === "product-category" ||
    pageKey === "product-category-specific"
  ) {
    return "/categories";
  }
  if (pageKey === "search-results") return "/search";
  if (pageKey.startsWith("page:")) return `/${pageKey.slice(5)}`;
  return "/";
}

export function resolveScopedPreviewHref(
  href: string | null | undefined,
  context: ScopedWebsiteLinkContext | string,
) {
  return resolveScopedWebsiteHref(href, context, "preview");
}

export function resolveScopedBuilderHref(
  href: string | null | undefined,
  context: ScopedWebsiteLinkContext | string,
) {
  return resolveScopedWebsiteHref(href, context, "builder");
}

function resolveScopedWebsiteHref(
  href: string | null | undefined,
  context: ScopedWebsiteLinkContext | string,
  mode: "builder" | "preview",
) {
  const websiteId = typeof context === "string" ? context : context.websiteId;
  const pages = typeof context === "string" ? [] : context.pages ?? [];
  if (!href) return "#";

  const trimmed = href.trim();
  if (!trimmed || trimmed === "#" || trimmed.startsWith("#")) return href;

  const pageKey = getBuilderPageKeyForHref(trimmed, pages);
  if (!pageKey) return href;

  const { hash } = normalizeHrefPath(trimmed);
  const previewPage =
    pageKey.startsWith("page:") ? pageKey.slice("page:".length) : pageKey;
  const params = new URLSearchParams({ page: previewPage });
  return `/app/websites/${encodeURIComponent(
    websiteId,
  )}/${mode}?${params.toString()}${hash}`;
}
