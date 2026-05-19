export function getWordPressBaseUrl() {
  const explicit =
    process.env.WORDPRESS_SITE_URL || process.env.NEXT_PUBLIC_WORDPRESS_SITE_URL;

  if (explicit) return explicit.replace(/\/$/, "");

  const apiUrl = process.env.WC_API_URL;
  if (!apiUrl) return null;

  try {
    const url = new URL(apiUrl);
    url.pathname = url.pathname.replace(/\/wp-json\/wc\/v\d+\/?$/, "");
    url.search = "";
    url.hash = "";
    return url.toString().replace(/\/$/, "");
  } catch {
    return null;
  }
}

export function getWooAccountUrl(path = "") {
  const baseUrl = getWordPressBaseUrl();
  if (!baseUrl) return null;

  const cleanPath = path.replace(/^\/+/, "");
  return `${baseUrl}/my-account/${cleanPath}`;
}
