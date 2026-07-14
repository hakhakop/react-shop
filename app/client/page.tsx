import StorefrontBuilderRenderer from "@/components/builder/StorefrontBuilderRenderer";
import { getPublishedBuilderLayout } from "@/lib/builderLayouts";
import { getBuilderShellSettings } from "@/lib/builderShell";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Client Page",
  description: "A client-specific storefront page powered by the visual builder.",
};

export default async function ClientPage() {
  const [layout, shellSettings] = await Promise.all([
    getPublishedBuilderLayout("client"),
    getBuilderShellSettings(),
  ]);

  if (layout?.sections?.some((section) => section.visible)) {
    return (
      <StorefrontBuilderRenderer
        layout={layout}
        page="client"
        headerOverlay={shellSettings.headerOverlay === true}
      />
    );
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
