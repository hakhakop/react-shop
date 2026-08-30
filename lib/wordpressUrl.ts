import { getCmsConnection } from "@/lib/cmsConnection";
import { normalizeWebsiteDomain, type SaaSWebsite } from "@/lib/websites";
import { websiteStorefrontOrigin } from "@/lib/websiteBuilderLinks";

export function getWordPressBaseUrl(website?: SaaSWebsite | null) {
  const cms = getCmsConnection(website);
  return cms.siteUrl || null;
}

/**
 * Imported WordPress uploads belong to the active tenant even before a
 * separate CMS connection is configured. An explicit CMS origin always wins;
 * otherwise use the tenant's canonical storefront identity.
 */
export function getWordPressMediaOrigin(website?: SaaSWebsite | null) {
  const cmsOrigin = getWordPressBaseUrl(website);
  if (cmsOrigin || !website) return cmsOrigin;

  const rootDomain = normalizeWebsiteDomain(
    process.env.NEXT_PUBLIC_ROOT_DOMAIN ||
      process.env.WEBPAGES_ROOT_DOMAIN ||
      "webpages.am",
  );
  const tenantDomain =
    normalizeWebsiteDomain(website.primaryDomain) ||
    normalizeWebsiteDomain(`${website.slug}.${rootDomain}`);

  return websiteStorefrontOrigin(tenantDomain);
}

export function getFluentFormsBaseUrl(website?: SaaSWebsite | null) {
  const explicit = process.env.FLUENT_FORMS_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, "");

  return getWordPressBaseUrl(website);
}

export function getWooAccountUrl(path = "", website?: SaaSWebsite | null) {
  const baseUrl = getWordPressBaseUrl(website);
  if (!baseUrl) return null;

  const cleanPath = path.replace(/^\/+/, "");
  return `${baseUrl}/my-account/${cleanPath}`;
}
