import { getProducts } from "@/lib/products";
import CategoryWithFilters from "@/components/CategoryWithFilters";
import Breadcrumbs from "@/components/Breadcrumbs";

export const metadata = {
  title: "Shop – All Products",
  description:
    "Browse all products in our store. Filter by category, attributes and price to quickly find what you need.",
};

export default async function ShopPage() {
  const products = await getProducts();

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

      <CategoryWithFilters products={products} />
    </main>
  );
}