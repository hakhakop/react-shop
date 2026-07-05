import StorefrontBuilderRenderer from "@/components/builder/StorefrontBuilderRenderer";
import CheckoutPageClient from "@/components/CheckoutPageClient";
import { renderDomainWebsiteFrontend } from "@/components/website/DomainWebsiteFrontend";
import { getPublishedBuilderLayout } from "@/lib/builderLayouts";

export default async function CheckoutPage() {
  const pageContent = <CheckoutPageClient asSlot />;
  const fallbackContent = <CheckoutPageClient />;
  const domainWebsitePage = await renderDomainWebsiteFrontend({
    requestedPage: "checkout",
    rendererProps: {
      pageContent,
    },
    fallbackContent,
  });

  if (domainWebsitePage) return domainWebsitePage;

  const layout = await getPublishedBuilderLayout("page:checkout");

  if (layout) {
    return (
      <StorefrontBuilderRenderer
        layout={layout}
        page="page:checkout"
        pageLabel="Checkout"
        pageContent={pageContent}
      />
    );
  }

  return fallbackContent;
}
