import { headers } from "next/headers";
import StorefrontBuilderRenderer from "@/components/builder/StorefrontBuilderRenderer";
import WebsiteFrontend from "@/components/website/WebsiteFrontend";
import { getPublishedBuilderLayout } from "@/lib/builderLayouts";
import { getWebsiteByDomainHost } from "@/lib/websites";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const domainWebsite = await getWebsiteByDomainHost(
    (await headers()).get("host"),
  );

  if (domainWebsite) {
    return (
      <WebsiteFrontend
        website={domainWebsite}
        requestedPage="home"
        mode="domain"
      />
    );
  }

  const layout = await getPublishedBuilderLayout("home");

  if (layout?.sections?.some((section) => section.visible)) {
    return <StorefrontBuilderRenderer layout={layout} page="home" />;
  }

  return null;
}
