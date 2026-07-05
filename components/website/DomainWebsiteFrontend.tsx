import { headers } from "next/headers";
import WebsiteFrontend from "@/components/website/WebsiteFrontend";
import type { StorefrontBuilderRendererProps } from "@/components/builder/StorefrontBuilderRenderer";
import { getWebsiteByDomainHost } from "@/lib/websites";
import type { ReactNode } from "react";

type DomainWebsiteFrontendOptions = {
  requestedPage: string;
  pageLabel?: string;
  rendererProps?: Omit<
    StorefrontBuilderRendererProps,
    "layout" | "page" | "pageLabel"
  >;
  fallbackContent?: ReactNode;
};

export async function renderDomainWebsiteFrontend({
  requestedPage,
  pageLabel,
  rendererProps,
  fallbackContent,
}: DomainWebsiteFrontendOptions) {
  const website = await getWebsiteByDomainHost((await headers()).get("host"));

  if (!website) return null;

  return (
    <WebsiteFrontend
      website={website}
      requestedPage={requestedPage}
      mode="domain"
      pageLabelOverride={pageLabel}
      rendererProps={rendererProps}
      fallbackContent={fallbackContent}
    />
  );
}
