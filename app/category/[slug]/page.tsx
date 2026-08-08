import Link from "next/link";
import { getCategoryTree } from "@/lib/categories";
import {
  getCategoryProductsBySlug,
  ProductNode,
} from "../../../lib/products";
import Breadcrumbs from "../../../components/Breadcrumbs";
import CategoryWithFilters from "../../../components/CategoryWithFilters";
import StorefrontBuilderRenderer from "@/components/builder/StorefrontBuilderRenderer";
import { renderDomainWebsiteFrontend } from "@/components/website/DomainWebsiteFrontend";
import { getPublishedBuilderLayout } from "@/lib/builderLayouts";
import { getBuilderShellSettings } from "@/lib/builderShell";
import { getCurrentWebsiteFromHeaders } from "@/lib/currentWebsite";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const website = await getCurrentWebsiteFromHeaders();

  const category = await getCategoryProductsBySlug(slug, { website });

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
  const categoryTree = await getCategoryTree({ website }).catch(() => []);
  const fallbackContent = (
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
        <CategoryWithFilters
          products={products}
          categoryTree={categoryTree}
          activeCategorySlug={slug}
        />
      )}
    </main>
  );
  const domainWebsiteDefaultPage = await renderDomainWebsiteFrontend({
    requestedPage: "product-category",
    pageLabel: category.name,
    rendererProps: {
      breadcrumbItems: [
        { label: "Home", href: "/" },
        { label: "Shop", href: "/shop" },
        { label: category.name },
      ],
      products,
      categoryTree,
      activeCategorySlug: slug,
    },
    fallbackContent,
  });

  if (domainWebsiteDefaultPage) return domainWebsiteDefaultPage;

  const [specificTemplateLayout, defaultTemplateLayout, shellSettings] = await Promise.all([
    getPublishedBuilderLayout("product-category-specific"),
    getPublishedBuilderLayout("product-category"),
    getBuilderShellSettings(),
  ]);
  const specificTemplateMatches = specificTemplateLayout?.sections.some(
    (section) => section.source === "category" && section.categoryId === slug
  );
  const templateLayout = specificTemplateMatches
    ? specificTemplateLayout
    : defaultTemplateLayout;

  if (templateLayout) {
    return (
      <StorefrontBuilderRenderer
        layout={templateLayout}
        page={templateLayout.page}
        pageLabel={category.name}
        breadcrumbItems={[
          { label: "Home", href: "/" },
          { label: "Shop", href: "/shop" },
          { label: category.name },
        ]}
        products={products}
        categoryTree={categoryTree}
        activeCategorySlug={slug}
        shellSettings={shellSettings}
      />
    );
  }

  return fallbackContent;
}
