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
  const website = await getWebsiteByDomainHost(normalizeWebsiteDomain(host));
  return getCmsConnection(website);
}
