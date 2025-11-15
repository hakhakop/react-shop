// wc-store/app/categories/page.tsx

import CategoryTreeNav from "../../components/CategoryTreeNav";

export const metadata = {
  title: "Shop by category",
};

export default async function CategoriesPage() {
  return (
    <main className="page">
      <h1 className="page-title">Shop by category</h1>
      <p className="page-subtitle">
        Browse your WooCommerce hierarchy as it is defined in WordPress.
      </p>

      <div style={{ marginTop: "16px", maxWidth: 480 }}>
        <CategoryTreeNav />
      </div>
    </main>
  );
}