import { headers } from "next/headers";
import { getWebsiteByDomainHost } from "@/lib/websites";

export async function getCurrentWebsiteFromHeaders() {
  return getWebsiteByDomainHost((await headers()).get("host"));
}
