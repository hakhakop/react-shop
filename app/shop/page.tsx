import StorefrontBuilderRenderer from "@/components/builder/StorefrontBuilderRenderer";
import DefaultShopSurface from "@/components/website/DefaultShopSurface";
import { renderDomainWebsiteFrontend } from "@/components/website/DomainWebsiteFrontend";
import { getPublishedBuilderLayout } from "@/lib/builderLayouts";
import { getBuilderShellSettings } from "@/lib/builderShell";
import { getCurrentWebsiteFromHeaders } from "@/lib/currentWebsite";
import { materializeBuilderDynamicContent } from "@/lib/builderDynamicContentMaterializer.server";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Shop – All Products",
  description:
    "Browse all products in our store. Filter by category, attributes and price to quickly find what you need.",
};

export default async function ShopPage() {
  const website = await getCurrentWebsiteFromHeaders();
  const domainWebsitePage = await renderDomainWebsiteFrontend({
    requestedPage: "shop",
    fallbackContent: <DefaultShopSurface website={website} />,
  });

  if (domainWebsitePage) return domainWebsitePage;

  const [layout, shellSettings] = await Promise.all([
    getPublishedBuilderLayout("shop"),
    getBuilderShellSettings(),
  ]);

  const materialization = layout
    ? await materializeBuilderDynamicContent(layout, { website })
    : null;
  const renderLayout = materialization?.renderLayout ?? layout;

  if (renderLayout?.sections?.some((section) => section.visible)) {
    return (
      <StorefrontBuilderRenderer
        layout={renderLayout}
        page="shop"
        shellSettings={shellSettings}
      />
    );
  }

  return <DefaultShopSurface website={website} />;
}
