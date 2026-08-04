export type BuilderPageSummary = {
  key: string;
  slug?: string;
};

export type WebsiteBuilderPages = {
  pages: BuilderPageSummary[];
  publishedKeys: string[];
};

/** Canonical target choices shared by every builder-owned link inspector. */
export const BUILDER_LINK_TARGET_OPTIONS = [
  { value: "_self", label: "Same tab" },
  { value: "_blank", label: "New tab" },
] as const;

/** Canonical target and security attributes shared by builder renderers. */
export function builderLinkTargetProps(target: string | null | undefined) {
  return target === "_blank"
    ? { target: "_blank" as const, rel: "noreferrer" as const }
    : {};
}

const builderPageKeys = new Set([
  "home",
  "shop",
  "client",
  "product-single",
  "product-category",
  "product-category-specific",
  "search-results",
]);

export function isCustomBuilderPageKey(value: string) {
  return /^page:[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
}

export function scopedBuilderHref(websiteId: string, pageKey: string) {
  const params = new URLSearchParams({ page: pageKey });
  return `/app/websites/${websiteId}/builder?${params.toString()}`;
}

export function scopedPreviewHref(websiteId: string, pageKey: string) {
  const params = new URLSearchParams({ page: pageKey });
  return `/app/websites/${websiteId}/preview?${params.toString()}`;
}

export function resolveBuilderPageParam(
  pageParam: string | null,
  builderPages: WebsiteBuilderPages | null,
) {
  if (!pageParam) return "home";
  if (builderPageKeys.has(pageParam) || isCustomBuilderPageKey(pageParam)) {
    return pageParam;
  }
  if (["cart", "checkout", "my-account"].includes(pageParam)) {
    return `page:${pageParam}`;
  }

  const customPage = builderPages?.pages.find(
    (page) =>
      page.slug === pageParam ||
      page.key === pageParam ||
      page.key === `page:${pageParam}`,
  );
  if (customPage) return customPage.key;

  const publishedCustomKey = builderPages?.publishedKeys.find(
    (key) => key === `page:${pageParam}` || key === pageParam,
  );
  return publishedCustomKey ?? pageParam;
}

export function getDefaultWebsiteBuilderPageKey(
  builderPages: WebsiteBuilderPages | null,
) {
  if (!builderPages) return "home";
  if (builderPages.publishedKeys.includes("home")) return "home";

  return builderPages.publishedKeys[0] ?? builderPages.pages[0]?.key ?? "home";
}
