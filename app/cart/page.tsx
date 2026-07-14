import StorefrontBuilderRenderer from "@/components/builder/StorefrontBuilderRenderer";
import CartPageClient from "@/components/CartPageClient";
import { renderDomainWebsiteFrontend } from "@/components/website/DomainWebsiteFrontend";
import { getPublishedBuilderLayout } from "@/lib/builderLayouts";
import { getBuilderShellSettings } from "@/lib/builderShell";

export default async function CartPage() {
  const pageContent = <CartPageClient asSlot />;
  const fallbackContent = <CartPageClient />;
  const domainWebsitePage = await renderDomainWebsiteFrontend({
    requestedPage: "cart",
    rendererProps: {
      pageContent,
    },
    fallbackContent,
  });

  if (domainWebsitePage) return domainWebsitePage;

  const [layout, shellSettings] = await Promise.all([
    getPublishedBuilderLayout("page:cart"),
    getBuilderShellSettings(),
  ]);

  if (layout) {
    return (
      <StorefrontBuilderRenderer
        layout={layout}
        page="page:cart"
        pageLabel="Cart"
        pageContent={pageContent}
        headerOverlay={shellSettings.headerOverlay === true}
      />
    );
  }

  return fallbackContent;
}
