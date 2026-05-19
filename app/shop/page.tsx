import { Suspense } from "react";
import { getProducts } from "@/lib/products";
import CategoryWithFilters from "@/components/CategoryWithFilters";
import Breadcrumbs from "@/components/Breadcrumbs";
import RecentlyViewedStrip from "@/components/RecentlyViewedStrip";
import StorefrontBuilderRenderer from "@/components/builder/StorefrontBuilderRenderer";
import { getPublishedBuilderLayout } from "@/lib/builderLayouts";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Shop – All Products",
  description:
    "Browse all products in our store. Filter by category, attributes and price to quickly find what you need.",
};

async function ShopProductsSection() {
  const products = await getProducts();
  return <CategoryWithFilters products={products} />;
}

function ShopProductsSkeleton() {
  return (
    <div className="mt-4">
      <div className="product-grid">
        {Array.from({ length: 12 }).map((_, idx) => (
          <div key={idx} className="product-card">
            <div className="product-image animate-pulse rounded-lg bg-slate-800/40" />
            <div className="mt-2 space-y-2">
              <div className="h-4 w-3/4 animate-pulse rounded bg-slate-800/60" />
              <div className="h-4 w-1/3 animate-pulse rounded bg-slate-800/60" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DefaultShopPage() {
  return (
    <main className="page">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Shop" },
        ]}
      />

      <h1 className="page-title">Shop</h1>
      <p className="page-subtitle">
        Explore all products in one place. Use filters on the left to narrow
        down by category, attributes and price.
      </p>
      <div className="mt-2 mb-3 flex justify-end">
  
</div>
      {/* Recently Viewed Strip */}
      <RecentlyViewedStrip />

      <Suspense fallback={<ShopProductsSkeleton />}>
        <ShopProductsSection />
      </Suspense>
    </main>
  );
}

export default async function ShopPage() {
  const layout = await getPublishedBuilderLayout("shop");

  if (layout?.sections?.some((section) => section.visible)) {
    return <StorefrontBuilderRenderer layout={layout} page="shop" />;
  }

  return <DefaultShopPage />;
}
