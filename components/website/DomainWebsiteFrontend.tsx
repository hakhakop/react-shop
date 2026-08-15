import { headers } from "next/headers";
import WebsiteFrontend from "@/components/website/WebsiteFrontend";
import type { StorefrontBuilderRendererProps } from "@/components/builder/StorefrontBuilderRenderer";
import { getWebsiteByDomainHost } from "@/lib/websites";
import type { ReactNode } from "react";
import type { BuilderLayout } from "@/lib/builderLayouts";
import type { DynamicItemContext } from "@/lib/dynamicContent";

type DomainWebsiteFrontendOptions = {
  requestedPage: string;
  pageLabel?: string;
  rendererProps?: Omit<
    StorefrontBuilderRendererProps,
    "layout" | "page" | "pageLabel" | "website"
  >;
  fallbackContent?: ReactNode;
  layoutOverride?: BuilderLayout;
  dynamicItemContextOverride?: DynamicItemContext;
};

export async function renderDomainWebsiteFrontend({
  requestedPage,
  pageLabel,
  rendererProps,
  fallbackContent,
  layoutOverride,
  dynamicItemContextOverride,
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
      layoutOverride={layoutOverride}
      dynamicItemContextOverride={dynamicItemContextOverride}
    />
  );
}
