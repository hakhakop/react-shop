import { Suspense } from "react";
import Breadcrumbs from "@/components/Breadcrumbs";
import CategoryWithFilters from "@/components/CategoryWithFilters";
import RecentlyViewedStrip from "@/components/RecentlyViewedStrip";
import { getCategoryTree } from "@/lib/categories";
import { getShopProducts } from "@/lib/shopProducts.server";
import type { SaaSWebsite } from "@/lib/websites";

async function ShopProductsSection({ website }: { website?: SaaSWebsite | null }) {
  const [products, categoryTree] = await Promise.all([
    getShopProducts(website),
    getCategoryTree({ website }).catch(() => []),
  ]);
  return <CategoryWithFilters products={products} categoryTree={categoryTree} />;
}

function ShopProductsSkeleton() {
  return (
    <div className="mt-4">
      <div className="product-grid">
        {Array.from({ length: 12 }).map((_, index) => (
          <div key={index} className="product-card">
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

/** Canonical independent Shop fallback used when no tenant Shop layout is published. */
export default function DefaultShopSurface({ website }: { website?: SaaSWebsite | null }) {
  return (
    <main className="page">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Shop" }]} />
      <h1 className="page-title">Shop</h1>
      <p className="page-subtitle">
        Explore all products in one place. Use filters on the left to narrow down by category, attributes and price.
      </p>
      <RecentlyViewedStrip />
      <Suspense fallback={<ShopProductsSkeleton />}>
        <ShopProductsSection website={website} />
      </Suspense>
    </main>
  );
}
