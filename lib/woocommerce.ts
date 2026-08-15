import type { NextRequest } from "next/server";
import { getCmsConnection, type CmsConnection } from "@/lib/cmsConnection";
import { getCmsConnectionForRequest } from "@/lib/cmsConnectionServer";
import type { SaaSWebsite } from "@/lib/websites";

export type WooCommerceConnection = {
  wordpressBaseUrl: string | null;
  wordpressAdminUrl: string | null;
  wooCommerceAdminUrl: string | null;
  apiUrl: string | null;
  consumerKey: string | null;
  consumerSecret: string | null;
  source: "website" | "env" | "none";
};

export function getWooCommerceConnection(
  website?: SaaSWebsite | null,
): WooCommerceConnection {
  const cms = getCmsConnection(website);
  return {
    wordpressBaseUrl: cms.siteUrl || null,
    wordpressAdminUrl: cms.adminUrl || null,
    wooCommerceAdminUrl: cms.adminUrl || null,
    apiUrl: cms.wooCommerceApiUrl || null,
    consumerKey: cms.wooCommerceConsumerKey || null,
    consumerSecret: cms.wooCommerceConsumerSecret || null,
    source: website?.cmsConnection ? "website" : cms.wooCommerceApiUrl ? "env" : "none",
  };
}

export function getEnvWooCommerceConnection(): WooCommerceConnection {
  return getWooCommerceConnection(null);
}

export function hasUsableWooCommerceConnection(connection: WooCommerceConnection) {
  return Boolean(
    connection.apiUrl && connection.consumerKey && connection.consumerSecret,
  );
}

export class WooCommerceRequestError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
  }
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
): Promise<WooCommerceConnection> {
  const cms = await getCmsConnectionForRequest(request);
  return {
    wordpressBaseUrl: cms.siteUrl || null,
    wordpressAdminUrl: cms.adminUrl || null,
    wooCommerceAdminUrl: cms.adminUrl || null,
    apiUrl: cms.wooCommerceApiUrl || null,
    consumerKey: cms.wooCommerceConsumerKey || null,
    consumerSecret: cms.wooCommerceConsumerSecret || null,
    source: cms.wooCommerceApiUrl ? "website" : "none",
  };
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
    throw new WooCommerceRequestError(
      payload?.message || `WooCommerce returned ${response.status}.`,
      response.status,
    );
  }

  if (!payload) {
    throw new Error("WooCommerce returned a non-JSON response.");
  }

  return payload;
}
