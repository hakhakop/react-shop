import StorefrontBuilderRenderer from "@/components/builder/StorefrontBuilderRenderer";
import { getPublishedBuilderLayout } from "@/lib/builderLayouts";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Client Page",
  description: "A client-specific storefront page powered by the visual builder.",
};

export default async function ClientPage() {
  const layout = await getPublishedBuilderLayout("client");

  if (layout?.sections?.some((section) => section.visible)) {
    return <StorefrontBuilderRenderer layout={layout} page="client" />;
  }

  return (
    <main className="page">
      <h1 className="page-title">Client Page</h1>
      <p className="page-subtitle">
        Publish a Client Page layout from the dashboard to control this page.
      </p>
    </main>
  );
}
