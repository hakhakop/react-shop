import { getCmsConnection } from "@/lib/cmsConnection";
import type { SaaSWebsite } from "@/lib/websites";

export function getWordPressBaseUrl(website?: SaaSWebsite | null) {
  const cms = getCmsConnection(website);
  return cms.siteUrl || null;
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
