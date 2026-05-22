import StorefrontBuilderRenderer from "@/components/builder/StorefrontBuilderRenderer";
import CartPageClient from "@/components/CartPageClient";
import { getPublishedBuilderLayout } from "@/lib/builderLayouts";

export default async function CartPage() {
  const layout = await getPublishedBuilderLayout("page:cart");

  if (layout) {
    return (
      <StorefrontBuilderRenderer
        layout={layout}
        page="page:cart"
        pageLabel="Cart"
        pageContent={<CartPageClient asSlot />}
      />
    );
  }

  return <CartPageClient />;
}
