import StorefrontBuilderRenderer from "@/components/builder/StorefrontBuilderRenderer";
import CheckoutPageClient from "@/components/CheckoutPageClient";
import { renderDomainWebsiteFrontend } from "@/components/website/DomainWebsiteFrontend";
import { getPublishedBuilderLayout } from "@/lib/builderLayouts";
import { getCurrentWebsiteFromHeaders } from "@/lib/currentWebsite";
import { getWooCommerceConnection } from "@/lib/woocommerce";

export default async function CheckoutPage() {
  const website = await getCurrentWebsiteFromHeaders();
  const connection = getWooCommerceConnection(website);
  const pageContent = (
    <CheckoutPageClient
      asSlot
      wordpressBaseUrl={connection.wordpressBaseUrl}
    />
  );
  const fallbackContent = (
    <CheckoutPageClient wordpressBaseUrl={connection.wordpressBaseUrl} />
  );
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
