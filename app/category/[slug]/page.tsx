import Link from "next/link";
import {
  getCategoryProductsBySlug,
  ProductNode,
} from "../../../lib/products";
import Breadcrumbs from "../../../components/Breadcrumbs";
import CategoryWithFilters from "../../../components/CategoryWithFilters";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const category = await getCategoryProductsBySlug(slug);

  if (!category) {
    return (
      <main className="page">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Shop", href: "/shop" },
            { label: "Category not found" },
          ]}
        />
        <h1 className="page-title">Category not found</h1>
        <p style={{ color: "#6b7280" }}>
          We couldn&apos;t find this category. It may be unpublished
          or the URL is wrong.
        </p>
        <p className="product-back-link">
          <Link href="/">← Back to store</Link>
        </p>
      </main>
    );
  }

  const products: ProductNode[] = category.products;

  return (
    <main className="page">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Shop", href: "/shop" },
          { label: category.name },
        ]}
      />

      <h1 className="page-title">{category.name}</h1>
      <p className="page-subtitle">
        {products.length > 0
          ? `${products.length} product${
              products.length === 1 ? "" : "s"
            }`
          : "No products in this category yet."}
      </p>

      {products.length === 0 ? null : (
        <CategoryWithFilters products={products} />
      )}
    </main>
  );
}