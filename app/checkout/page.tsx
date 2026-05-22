import StorefrontBuilderRenderer from "@/components/builder/StorefrontBuilderRenderer";
import CheckoutPageClient from "@/components/CheckoutPageClient";
import { getPublishedBuilderLayout } from "@/lib/builderLayouts";

export default async function CheckoutPage() {
  const layout = await getPublishedBuilderLayout("page:checkout");

  if (layout) {
    return (
      <StorefrontBuilderRenderer
        layout={layout}
        page="page:checkout"
        pageLabel="Checkout"
        pageContent={<CheckoutPageClient asSlot />}
      />
    );
  }

  return <CheckoutPageClient />;
}
