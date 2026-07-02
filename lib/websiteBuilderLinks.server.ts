import {
  readBuilderCustomPages,
  readBuilderLayoutStore,
} from "@/lib/builderLayouts";
import {
  getDefaultWebsiteBuilderPageKey,
  scopedPreviewHref,
  scopedBuilderHref,
  type WebsiteBuilderPages,
} from "@/lib/websiteBuilderLinks";

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

export async function getDefaultWebsiteBuilderHref(websiteId: string) {
  return scopedBuilderHref(websiteId, await getDefaultWebsitePageKey(websiteId));
}

export async function getDefaultWebsiteBuilderLinks(websiteId: string) {
  const pageKey = await getDefaultWebsitePageKey(websiteId);

  return {
    builderHref: scopedBuilderHref(websiteId, pageKey),
    previewHref: scopedPreviewHref(websiteId, pageKey),
  };
}
