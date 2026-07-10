import StorefrontBuilderRenderer from "@/components/builder/StorefrontBuilderRenderer";
import MyAccountPageContent from "@/components/MyAccountPageContent";
import { renderDomainWebsiteFrontend } from "@/components/website/DomainWebsiteFrontend";
import { getPublishedBuilderLayout } from "@/lib/builderLayouts";
import { getCurrentWebsiteFromHeaders } from "@/lib/currentWebsite";
import { getWooCommerceConnection } from "@/lib/woocommerce";

export default async function MyAccountPage() {
  const website = await getCurrentWebsiteFromHeaders();
  const connection = getWooCommerceConnection(website);
  const content = <MyAccountPageContent connection={connection} />;
  const domainWebsitePage = await renderDomainWebsiteFrontend({
    requestedPage: "my-account",
    rendererProps: {
      pageContent: content,
    },
    fallbackContent: <main className="page account-bridge-page">{content}</main>,
  });

  if (domainWebsitePage) return domainWebsitePage;

  const layout = await getPublishedBuilderLayout("page:my-account");

  if (layout) {
    return (
      <StorefrontBuilderRenderer
        layout={layout}
        page="page:my-account"
        pageLabel="My account"
        pageContent={content}
      />
    );
  }

  return <main className="page account-bridge-page">{content}</main>;
}
