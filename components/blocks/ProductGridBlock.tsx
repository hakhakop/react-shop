// components/blocks/ProductGridBlock.tsx

import { ProductGridLayoutBlock } from "../../lib/pageBuilder";
import ProductCard from "../ProductCard";
import { getProductsForGrid } from "../../lib/products";
import ProductCarousel from "../ProductCarousel"; // make sure this file exists

export default async function ProductGridBlock({
  block,
}: {
  block: ProductGridLayoutBlock;
}) {
  // 1) LIMIT
  const limit =
    typeof block.gridLimit === "number" && !Number.isNaN(block.gridLimit)
      ? block.gridLimit
      : 8;

  // 2) CATEGORY (we use slug, because categoryIn expects slugs)
  const categorySlug: string | null =
    block.category?.node?.slug ??
    block.category?.nodes?.[0]?.slug ??
    null;

  // 3) SOURCE (featured | category | all) — ACF gives array, e.g. ["category"]
  const rawSourceValue = Array.isArray(block.source)
    ? block.source[0]
    : block.source;

  const rawSource = (rawSourceValue || "").toString().trim().toLowerCase();

  let source: "featured" | "category" | "all";

  if (
    rawSource === "all" ||
    rawSource === "all_products" ||
    rawSource === "allproducts"
  ) {
    source = "all";
  } else if (
    rawSource === "category" ||
    rawSource === "by_category" ||
    rawSource === "category_products"
  ) {
    source = categorySlug ? "category" : "all";
  } else if (
    rawSource === "featured" ||
    rawSource === "featured_products" ||
    rawSource === "featuredproducts"
  ) {
    source = "featured";
  } else if (categorySlug) {
    // Fallback: if category is chosen but source is weird/empty
    source = "category";
  } else {
    // Final fallback
    source = "featured";
  }

  // 4) FETCH PRODUCTS
  const allProducts = await getProductsForGrid({
    limit,
    source,
    categoryId: categorySlug ?? undefined,
  });

  // 5) CARD PRESET (ACF array)
  const preset = Array.isArray(block.cardPreset)
    ? block.cardPreset[0] || "minimal"
    : block.cardPreset || "minimal";

  // 6) LAYOUT VARIANT (grid | carousel) — ACF gives array, e.g. ["Carousel"]
  const layoutVariantRaw = Array.isArray(block.layoutVariant)
    ? block.layoutVariant[0]
    : block.layoutVariant;

  const layoutVariant = (layoutVariantRaw || "grid")
    .toString()
    .trim()
    .toLowerCase();

  // DEBUG (optional): uncomment to see what the block gives you
  // console.log("ProductGridBlock layoutVariant:", layoutVariant, "raw:", block.layoutVariant);
console.log("BLOCK layoutVariant:", block.layoutVariant);
console.log("Computed layoutVariant:", layoutVariant);
  return (
    <section className="pb-product-grid">
      <h2 className="pb-grid-title">Product Grid ({preset})</h2>

      {layoutVariant === "carousel" ? (
        <ProductCarousel products={allProducts} preset={preset} />
      ) : (
        <div className="product-grid">
          {allProducts.map((p) => (
            <ProductCard key={p.id} product={p} preset={preset} />
          ))}
        </div>
      )}
    </section>
  );
}