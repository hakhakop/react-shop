import { getProducts } from "@/lib/products";
import CategoryWithFilters from "@/components/CategoryWithFilters";

export const metadata = {
  title: "Shop",
};

export default async function ShopPage() {
  const products = await getProducts(); // same helper as before

  return (
    <main className="page">
      <h1 className="page-title">Shop</h1>
      <p className="page-subtitle">
        All products from your store with filters, sorting and pagination.
      </p>

      <CategoryWithFilters products={products} />
    </main>
  );
}