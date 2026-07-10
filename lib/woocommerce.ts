import type { NextRequest } from "next/server";
import {
  getWebsiteByDomainHost,
  normalizeWebsiteDomain,
  type SaaSWebsite,
  type WebsiteEcommerceSettings,
} from "@/lib/websites";

export type WooCommerceConnection = {
  wordpressBaseUrl: string | null;
  wordpressAdminUrl: string | null;
  wooCommerceAdminUrl: string | null;
  apiUrl: string | null;
  consumerKey: string | null;
  consumerSecret: string | null;
  source: "website" | "env" | "none";
};

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}

function normalizeUrl(value: string | null | undefined) {
  const text = value?.trim();
  if (!text) return null;
  return trimTrailingSlash(/^https?:\/\//i.test(text) ? text : `https://${text}`);
}

function getEnvWordPressBaseUrl() {
  const explicit =
    process.env.WORDPRESS_SITE_URL || process.env.NEXT_PUBLIC_WORDPRESS_SITE_URL;

  if (explicit) return normalizeUrl(explicit);

  const apiUrl = normalizeUrl(process.env.WC_API_URL);
  if (!apiUrl) return null;

  try {
    const url = new URL(apiUrl);
    url.pathname = url.pathname.replace(/\/wp-json\/wc\/v\d+\/?$/, "");
    url.search = "";
    url.hash = "";
    return normalizeUrl(url.toString());
  } catch {
    return null;
  }
}

function getRestApiUrlFromBase(baseUrl: string | null) {
  return baseUrl ? `${baseUrl}/wp-json/wc/v3` : null;
}

function getWebsiteConnection(
  settings: WebsiteEcommerceSettings | undefined,
): WooCommerceConnection | null {
  if (!settings?.wordpressCmsUrl) return null;

  const wordpressBaseUrl = normalizeUrl(settings.wordpressCmsUrl);
  const apiUrl =
    normalizeUrl(settings.wooCommerceRestApiUrl) ||
    getRestApiUrlFromBase(wordpressBaseUrl);

  return {
    wordpressBaseUrl,
    wordpressAdminUrl:
      normalizeUrl(settings.wordpressAdminUrl) ||
      (wordpressBaseUrl ? `${wordpressBaseUrl}/wp-admin` : null),
    wooCommerceAdminUrl:
      normalizeUrl(settings.wooCommerceAdminUrl) ||
      (wordpressBaseUrl
        ? `${wordpressBaseUrl}/wp-admin/admin.php?page=wc-admin`
        : null),
    apiUrl,
    consumerKey: settings.wooCommerceConsumerKey || null,
    consumerSecret: settings.wooCommerceConsumerSecret || null,
    source: "website",
  };
}

export function getEnvWooCommerceConnection(): WooCommerceConnection {
  const wordpressBaseUrl = getEnvWordPressBaseUrl();
  const apiUrl = normalizeUrl(process.env.WC_API_URL) || getRestApiUrlFromBase(wordpressBaseUrl);

  return {
    wordpressBaseUrl,
    wordpressAdminUrl: wordpressBaseUrl ? `${wordpressBaseUrl}/wp-admin` : null,
    wooCommerceAdminUrl: wordpressBaseUrl
      ? `${wordpressBaseUrl}/wp-admin/admin.php?page=wc-admin`
      : null,
    apiUrl,
    consumerKey: process.env.WC_CONSUMER_KEY || null,
    consumerSecret: process.env.WC_CONSUMER_SECRET || null,
    source: apiUrl ? "env" : "none",
  };
}

export function getWooCommerceConnection(
  website?: SaaSWebsite | null,
): WooCommerceConnection {
  if (website?.type === "e-commerce") {
    const websiteConnection = getWebsiteConnection(website.ecommerceSettings);
    if (
      websiteConnection?.apiUrl &&
      websiteConnection.consumerKey &&
      websiteConnection.consumerSecret
    ) {
      return websiteConnection;
    }
  }

  return getEnvWooCommerceConnection();
}

export function hasUsableWooCommerceConnection(connection: WooCommerceConnection) {
  return Boolean(
    connection.apiUrl && connection.consumerKey && connection.consumerSecret,
  );
}

export function getWooAccountUrl(
  connection: WooCommerceConnection,
  path = "",
) {
  if (!connection.wordpressBaseUrl) return null;
  const cleanPath = path.replace(/^\/+/, "");
  return `${connection.wordpressBaseUrl}/my-account/${cleanPath}`;
}

export async function getWooCommerceConnectionForRequest(
  request: NextRequest,
) {
  const host =
    request.headers.get("x-forwarded-host") ||
    request.headers.get("host") ||
    "";
  const website = await getWebsiteByDomainHost(normalizeWebsiteDomain(host));
  return getWooCommerceConnection(website);
}

export async function wooCommerceFetch<T>(
  connection: WooCommerceConnection,
  path: string,
  init?: RequestInit,
) {
  if (!hasUsableWooCommerceConnection(connection)) {
    throw new Error("WooCommerce API settings are missing.");
  }

  const cleanPath = path.replace(/^\/+/, "");
  const auth = Buffer.from(
    `${connection.consumerKey!}:${connection.consumerSecret!}`,
  ).toString("base64");
  const response = await fetch(`${connection.apiUrl}/${cleanPath}`, {
    ...init,
    headers: {
      Accept: "application/json",
      ...(init?.headers ?? {}),
      Authorization: `Basic ${auth}`,
    },
  });

  const contentType = response.headers.get("content-type") ?? "";
  const isJson = contentType.toLowerCase().includes("application/json");
  const payload = isJson
    ? ((await response.json()) as T & { message?: string })
    : null;

  if (!response.ok) {
    throw new Error(
      payload?.message || `WooCommerce returned ${response.status}.`,
    );
  }

  if (!payload) {
    throw new Error("WooCommerce returned a non-JSON response.");
  }

  return payload;
}
