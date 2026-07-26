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

export function getCmsConnection(
  website?: { cmsConnection?: Partial<CmsConnection> | null } | null,
): CmsConnection {
  const envConnection = getEnvCmsConnection();

  if (!website || !website.cmsConnection) {
    return envConnection;
  }

  const conn = website.cmsConnection;
  const siteUrl = normalizeUrl(conn.siteUrl) || envConnection.siteUrl;
  const adminUrl =
    normalizeUrl(conn.adminUrl) ||
    (siteUrl ? `${siteUrl}/wp-admin` : envConnection.adminUrl);
  const graphqlUrl =
    normalizeUrl(conn.graphqlUrl) ||
    (siteUrl ? `${siteUrl}/graphql` : envConnection.graphqlUrl);
  const wooCommerceApiUrl =
    normalizeUrl(conn.wooCommerceApiUrl) ||
    (siteUrl ? `${siteUrl}/wp-json/wc/v3` : envConnection.wooCommerceApiUrl);

  return {
    provider: conn.provider || envConnection.provider,
    siteUrl,
    adminUrl,
    graphqlUrl,
    wooCommerceApiUrl,
    wooCommerceConsumerKey:
      conn.wooCommerceConsumerKey || envConnection.wooCommerceConsumerKey,
    wooCommerceConsumerSecret:
      conn.wooCommerceConsumerSecret || envConnection.wooCommerceConsumerSecret,
    wordpressUsername:
      conn.wordpressUsername || envConnection.wordpressUsername,
    wordpressApplicationPassword:
      conn.wordpressApplicationPassword || envConnection.wordpressApplicationPassword,
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
