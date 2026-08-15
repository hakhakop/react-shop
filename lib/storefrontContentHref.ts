/**
 * Canonical owner for tenant-neutral internal storefront paths.
 * Source/CMS permalinks are metadata and must not be inspected or rewritten.
 */
export type StorefrontContentReference = {
  contentType: string;
  slug: string;
};

export function getStorefrontContentHref(
  reference: StorefrontContentReference,
): string | null {
  const slug = reference.slug.trim();
  if (!slug) return null;
  if (reference.contentType === "product") {
    return `/product/${encodeURIComponent(slug)}`;
  }
  if (reference.contentType === "post") {
    return `/${encodeURIComponent(slug)}`;
  }
  return null;
}
