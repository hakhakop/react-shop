import StorefrontBuilderRenderer from "@/components/builder/StorefrontBuilderRenderer";
import CartPageClient from "@/components/CartPageClient";
import { renderDomainWebsiteFrontend } from "@/components/website/DomainWebsiteFrontend";
import { getPublishedBuilderLayout } from "@/lib/builderLayouts";

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

  const layout = await getPublishedBuilderLayout("page:cart");

  if (layout) {
    return (
      <StorefrontBuilderRenderer
        layout={layout}
        page="page:cart"
        pageLabel="Cart"
        pageContent={pageContent}
      />
    );
  }

  return fallbackContent;
}
