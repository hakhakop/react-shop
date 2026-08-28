export type CmsConnection = {
  provider: string;
  siteUrl: string;
  adminUrl: string;
  graphqlUrl: string;
  wooCommerceApiUrl: string;
  wooCommerceConsumerKey: string;
  wooCommerceConsumerSecret: string;
  wordpressUsername: string;
  wordpressApplicationPassword: string;
  storeStatusNotes: string;
  technicalNotes: string;
  updatedAt: string;
};

/** A tenant-scoped connection must never silently become the global connection. */
export function getUnconfiguredCmsConnection(): CmsConnection {
  return {
    provider: "wordpress",
    siteUrl: "",
    adminUrl: "",
    graphqlUrl: "",
    wooCommerceApiUrl: "",
    wooCommerceConsumerKey: "",
    wooCommerceConsumerSecret: "",
    wordpressUsername: "",
    wordpressApplicationPassword: "",
    storeStatusNotes: "",
    technicalNotes: "",
    updatedAt: "",
  };
}

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}

export function normalizeUrl(value: string | null | undefined): string {
  const text = value?.trim();
  if (!text) return "";
  return trimTrailingSlash(/^https?:\/\//i.test(text) ? text : `https://${text}`);
}

function getEnvSiteUrl(): string {
  const explicit =
    process.env.WORDPRESS_SITE_URL || process.env.NEXT_PUBLIC_WORDPRESS_SITE_URL;

  if (explicit) return normalizeUrl(explicit);

  const apiUrl = normalizeUrl(process.env.WC_API_URL);
  if (!apiUrl) return "";

  try {
    const url = new URL(apiUrl);
    url.pathname = url.pathname.replace(/\/wp-json\/wc\/v\d+\/?$/, "");
    url.search = "";
    url.hash = "";
    return normalizeUrl(url.toString());
  } catch {
    return "";
  }
}

function getRootBuilderShellPath(path: typeof import("node:path")) {
  const configuredDir = process.env.WEBPAGES_DATA_DIR?.trim();
  const dataDir = configuredDir
    ? path.resolve(process.cwd(), configuredDir)
    : path.join(process.cwd(), "data");
  return path.join(dataDir, "builder-shell.json");
}

export function getEnvCmsConnection(): CmsConnection {
  const siteUrl = getEnvSiteUrl();
  const graphqlUrl = normalizeUrl(
    process.env.WORDPRESS_GRAPHQL_URL ||
      process.env.NEXT_PUBLIC_WORDPRESS_GRAPHQL_URL ||
      process.env.NEXT_PUBLIC_WPGRAPHQL_ENDPOINT ||
      (siteUrl ? `${siteUrl}/graphql` : ""),
  );
  const wooCommerceApiUrl = normalizeUrl(
    process.env.WC_API_URL || (siteUrl ? `${siteUrl}/wp-json/wc/v3` : ""),
  );
  const adminUrl = normalizeUrl(siteUrl ? `${siteUrl}/wp-admin` : "");
  const wooCommerceAdminUrl = normalizeUrl(
    siteUrl ? `${siteUrl}/wp-admin/admin.php?page=wc-admin` : "",
  );

  return {
    provider: "wordpress",
    siteUrl,
    adminUrl: adminUrl || wooCommerceAdminUrl,
    graphqlUrl,
    wooCommerceApiUrl,
    wooCommerceConsumerKey: process.env.WC_CONSUMER_KEY || "",
    wooCommerceConsumerSecret: process.env.WC_CONSUMER_SECRET || "",
    wordpressUsername:
      process.env.WORDPRESS_MEDIA_USERNAME ||
      process.env.WORDPRESS_USERNAME ||
      process.env.WP_USERNAME ||
      "",
    wordpressApplicationPassword:
      process.env.WORDPRESS_MEDIA_PASSWORD ||
      process.env.WORDPRESS_APPLICATION_PASSWORD ||
      process.env.WORDPRESS_PASSWORD ||
      process.env.WP_APPLICATION_PASSWORD ||
      "",
    storeStatusNotes: "",
    technicalNotes: "",
    updatedAt: "",
  };
}

function readPersistedRootCmsConnection(): Partial<CmsConnection> | null {
  try {
    if (typeof window !== "undefined") return null;
    const fs = process.getBuiltinModule?.("fs") as typeof import("node:fs") | undefined;
    const path = process.getBuiltinModule?.("path") as typeof import("node:path") | undefined;
    if (!fs || !path) return null;
    const raw = JSON.parse(fs.readFileSync(getRootBuilderShellPath(path), "utf8")) as {
      cmsConnection?: unknown;
    };
    return raw.cmsConnection && typeof raw.cmsConnection === "object"
      ? (raw.cmsConnection as Partial<CmsConnection>)
      : null;
  } catch {
    return null;
  }
}

export function getCmsConnection(
  website?: { cmsConnection?: Partial<CmsConnection> | null } | null,
): CmsConnection {
  if (website === undefined) {
    return {
      ...getEnvCmsConnection(),
      ...(readPersistedRootCmsConnection() ?? {}),
    };
  }
  if (website === null || !website.cmsConnection) {
    return getUnconfiguredCmsConnection();
  }

  const conn = website.cmsConnection;
  const siteUrl = normalizeUrl(conn.siteUrl);
  const adminUrl =
    normalizeUrl(conn.adminUrl) ||
    (siteUrl ? `${siteUrl}/wp-admin` : "");
  const graphqlUrl =
    normalizeUrl(conn.graphqlUrl) ||
    (siteUrl ? `${siteUrl}/graphql` : "");
  const wooCommerceApiUrl =
    normalizeUrl(conn.wooCommerceApiUrl) ||
    (siteUrl ? `${siteUrl}/wp-json/wc/v3` : "");

  return {
    provider: conn.provider?.trim() || "wordpress",
    siteUrl,
    adminUrl,
    graphqlUrl,
    wooCommerceApiUrl,
    wooCommerceConsumerKey: conn.wooCommerceConsumerKey?.trim() || "",
    wooCommerceConsumerSecret: conn.wooCommerceConsumerSecret?.trim() || "",
    wordpressUsername: conn.wordpressUsername?.trim() || "",
    wordpressApplicationPassword:
      conn.wordpressApplicationPassword?.trim() || "",
    storeStatusNotes: conn.storeStatusNotes || "",
    technicalNotes: conn.technicalNotes || "",
    updatedAt: conn.updatedAt || "",
  };
}

export function hasUsableWooCommerce(connection: CmsConnection): boolean {
  return Boolean(
    connection.wooCommerceApiUrl &&
      connection.wooCommerceConsumerKey &&
      connection.wooCommerceConsumerSecret,
  );
}

export function hasUsableMediaAuth(connection: CmsConnection): boolean {
  return Boolean(
    connection.wordpressUsername && connection.wordpressApplicationPassword,
  );
}

export function getWordPressMediaAuthHeaders(
  connection: CmsConnection,
): Record<string, string> | null {
  if (!connection.wordpressUsername || !connection.wordpressApplicationPassword) {
    return null;
  }
  const credentials = `${connection.wordpressUsername}:${connection.wordpressApplicationPassword}`;
  return {
    Authorization: `Basic ${Buffer.from(credentials).toString("base64")}`,
  };
}

/** Shared WordPress HTTP authentication contract. Kept as an alias for media
 * callers while schema/content providers use the provider-neutral name. */
export const getWordPressAuthHeaders = getWordPressMediaAuthHeaders;
