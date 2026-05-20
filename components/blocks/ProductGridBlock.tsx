import { ProductGridLayoutBlock } from "../../lib/pageBuilder";
import type { CSSProperties } from "react";
import ProductCard from "../ProductCard";
import { getProductsForGrid } from "../../lib/products";
import ProductCarousel from "../ProductCarousel"; // make sure this file exists

function pickFirstString(value: unknown): string | undefined {
  if (Array.isArray(value)) {
    const first = value[0];
    return typeof first === "string" ? first : undefined;
  }

  return typeof value === "string" ? value : undefined;
}

function normalizeColumnsDesktop(value: unknown): number | undefined {
  const parsed =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? parseInt(value, 10)
        : NaN;

  if (!Number.isFinite(parsed)) return undefined;
  return Math.min(Math.max(parsed, 2), 6);
}

function productSpaceToCss(value: unknown, fallback: string) {
  const key = (pickFirstString(value) ?? fallback).toString().toLowerCase();
  switch (key) {
    case "none":
      return "0px";
    case "small":
      return "clamp(8px, 1vw, 12px)";
    case "large":
      return "clamp(22px, 2.4vw, 36px)";
    case "max":
      return "clamp(32px, 4vw, 56px)";
    case "medium":
    default:
      return "clamp(14px, 1.5vw, 22px)";
  }
}

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

  const gridSurface =
    pickFirstString(block.gridSurface) ??
    pickFirstString(block.productGridSurface) ??
    "auto";

  const cardSurface =
    pickFirstString(block.cardSurface) ??
    pickFirstString(block.productCardSurface) ??
    "auto";

  const columnsDesktop = normalizeColumnsDesktop(block.columnsDesktop);
  const productSpacingStyle = {
    "--product-grid-gap": productSpaceToCss(block.gridGap, "medium"),
    "--product-card-padding": productSpaceToCss(block.cardPadding, "medium"),
    "--product-image-padding": productSpaceToCss(block.imagePadding, "large"),
  } as CSSProperties;

  return (
    <div
      className="pb-product-grid"
      style={
        columnsDesktop
          ? ({
              ...productSpacingStyle,
              "--pb-grid-columns-desktop": columnsDesktop,
            } as CSSProperties)
          : productSpacingStyle
      }
      data-layout-variant={layoutVariant}
      data-card-preset={preset}
      data-grid-surface={gridSurface}
      data-card-surface={cardSurface}
    >
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
    </div>
  );
}
