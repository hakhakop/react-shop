import {
  readBuilderCustomPages,
  readBuilderLayoutStore,
} from "@/lib/builderLayouts";
import { getWebsiteRouteSegment, type SaaSWebsite } from "@/lib/websites";
import {
  getDefaultWebsiteBuilderPageKey,
  scopedPreviewHref,
  scopedBuilderHref,
  type WebsiteBuilderPages,
} from "@/lib/websiteBuilderLinks";

type WebsiteLinkTarget = string | Pick<SaaSWebsite, "id" | "slug">;

function resolveWebsiteLinkTarget(target: WebsiteLinkTarget) {
  if (typeof target === "string") {
    return { websiteId: target, routeSegment: target };
  }

  return {
    websiteId: target.id,
    routeSegment: getWebsiteRouteSegment(target),
  };
}

async function getDefaultWebsitePageKey(websiteId: string) {
  const scope = { websiteId };
  const [store, pages] = await Promise.all([
    readBuilderLayoutStore(scope),
    readBuilderCustomPages(scope),
  ]);
  const builderPages: WebsiteBuilderPages = {
    pages,
    publishedKeys: Object.keys(store),
  };

  return getDefaultWebsiteBuilderPageKey(builderPages);
}

export async function getDefaultWebsiteBuilderHref(target: WebsiteLinkTarget) {
  const { websiteId, routeSegment } = resolveWebsiteLinkTarget(target);
  return scopedBuilderHref(routeSegment, await getDefaultWebsitePageKey(websiteId));
}

export async function getDefaultWebsiteBuilderLinks(target: WebsiteLinkTarget) {
  const { websiteId, routeSegment } = resolveWebsiteLinkTarget(target);
  const pageKey = await getDefaultWebsitePageKey(websiteId);

  return {
    builderHref: scopedBuilderHref(routeSegment, pageKey),
    previewHref: scopedPreviewHref(routeSegment, pageKey),
  };
}
