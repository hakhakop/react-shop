import type { NextRequest } from "next/server";
import { getCmsConnection, type CmsConnection } from "@/lib/cmsConnection";
import { getWebsiteByDomainHost, normalizeWebsiteDomain } from "@/lib/websites";

export async function getCmsConnectionForRequest(
  request: NextRequest,
  scopedWebsite?: { cmsConnection?: Partial<CmsConnection> | null } | null,
): Promise<CmsConnection> {
  if (scopedWebsite) {
    return getCmsConnection(scopedWebsite);
  }

  const host =
    request.headers.get("x-forwarded-host") ||
    request.headers.get("host") ||
    "";
  const normalizedHost = normalizeWebsiteDomain(host);
  const rootHost = normalizeWebsiteDomain(
    process.env.NEXT_PUBLIC_ROOT_DOMAIN ||
      process.env.WEBPAGES_ROOT_DOMAIN ||
      "webpages.am",
  );
  if (normalizedHost && normalizedHost === rootHost) {
    return getCmsConnection(undefined);
  }
  const website = await getWebsiteByDomainHost(normalizedHost);
  return getCmsConnection(website);
}
