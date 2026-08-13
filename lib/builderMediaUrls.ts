/**
 * Canonical runtime URL normalization for imported CMS media.
 *
 * YOOtheme exports commonly keep WordPress uploads root-relative.  A
 * WebPages storefront lives on a different origin, so those paths need the
 * configured CMS origin at the document boundary.  Only the WordPress upload
 * namespace is rewritten: WebPages-relative assets and already absolute URLs
 * remain untouched.
 */
const WORDPRESS_UPLOAD_PATH = /^(?:\/)?wp-content\/uploads(?:\/|$)/i;

const MEDIA_URL_KEYS = new Set([
  "imageUrl",
  "thumbnailUrl",
  "image",
  "imageSrc",
  "hoverImageUrl",
  "videoUrl",
  "hoverVideoUrl",
  "posterUrl",
  "backgroundImageUrl",
]);

// Rich text is already sanitized before this boundary runs. These are only
// media-bearing attributes, so ordinary links and unrelated WebPages-relative
// paths cannot be rewritten accidentally.
const RICH_HTML_KEYS = new Set(["text", "body", "content", "title"]);
const WORDPRESS_MEDIA_ATTRIBUTE = /\b(src|poster)\s*=\s*(["'])([^"']+)\2/gi;

function normalizedOrigin(origin?: string | null) {
  const value = origin?.trim();
  return value ? value.replace(/\/+$/, "") : "";
}

export function resolveWordPressMediaUrl(
  value: string | null | undefined,
  wordpressOrigin?: string | null,
) {
  if (typeof value !== "string" || !WORDPRESS_UPLOAD_PATH.test(value)) return value;
  const origin = normalizedOrigin(wordpressOrigin);
  return origin ? `${origin}/${value.replace(/^\/+/, "")}` : value;
}

export function resolveWordPressMediaHtml(
  html: string | null | undefined,
  wordpressOrigin?: string | null,
) {
  if (typeof html !== "string" || !normalizedOrigin(wordpressOrigin)) return html;
  return html.replace(WORDPRESS_MEDIA_ATTRIBUTE, (match, attribute, quote, value) => {
    const resolved = resolveWordPressMediaUrl(value, wordpressOrigin);
    return resolved === value ? match : `${attribute}=${quote}${resolved}${quote}`;
  });
}

/**
 * Resolve supported media fields throughout a Builder document once, before
 * any component renderer sees them. The function is intentionally data-only
 * so Builder and storefront use the exact same URL contract.
 */
export function resolveBuilderMediaUrls<T>(value: T, wordpressOrigin?: string | null): T {
  if (!normalizedOrigin(wordpressOrigin)) return value;
  if (Array.isArray(value)) {
    return value.map((item) => resolveBuilderMediaUrls(item, wordpressOrigin)) as T;
  }
  if (!value || typeof value !== "object") return value;

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([key, child]) => [
      key,
      MEDIA_URL_KEYS.has(key) && typeof child === "string"
        ? resolveWordPressMediaUrl(child, wordpressOrigin)
        : RICH_HTML_KEYS.has(key) && typeof child === "string"
          ? resolveWordPressMediaHtml(child, wordpressOrigin)
        : resolveBuilderMediaUrls(child, wordpressOrigin),
    ]),
  ) as T;
}
