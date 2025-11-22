// components/blocks/ProductGridBlock.tsx

import { ProductGridLayoutBlock } from "../../lib/pageBuilder";
import ProductCard from "../ProductCard";
import { getProductsForGrid } from "../../lib/products";

export default async function ProductGridBlock({
  block,
}: {
  block: ProductGridLayoutBlock;
}) {
  const limit =
    typeof block.gridLimit === "number" && !Number.isNaN(block.gridLimit)
      ? block.gridLimit
      : 8; // default if not set

  const source =
    (block.source as "featured" | "category" | "all" | undefined) ||
    "featured";

  const categoryId = block.category?.node?.databaseId;

  const allProducts = await getProductsForGrid({
    limit,
    source,
    categoryId,
  });

  const preset = block.cardPreset?.[0] || "minimal";

  return (
    <section className="pb-product-grid">
      <h2 className="pb-grid-title">Product Grid ({preset})</h2>

      <div className="product-grid">
        {allProducts.map((p) => (
          <ProductCard key={p.id} product={p} preset={preset} />
        ))}
      </div>
    </section>
  );
}