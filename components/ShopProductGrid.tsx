"use client";

import { useState } from "react";
import Link from "next/link";
import WishlistToggle from "./WishlistToggle";
import AddToCartButton from "./AddToCartButton";
import type { ProductNode } from "../lib/products";

type Props = {
  products: ProductNode[];
};

function toNumberPrice(price: string | null | undefined): number | null {
  if (!price) return null;
  const n = parseFloat(price);
  if (Number.isNaN(n)) return null;
  return n;
}

export function ShopProductGrid({ products }: Props) {
  const [visibleCount, setVisibleCount] = useState(12);

  const visibleProducts = products.slice(0, visibleCount);
  const hasMore = visibleCount < products.length;

  return (
    <>
      <div className="product-grid">
        {visibleProducts.map((p) => {
          const priceNumber = toNumberPrice(p.price);
          const imageUrl = p.image?.sourceUrl || null;
          const attributeNodes = p.attributes?.nodes ?? [];

          const formattedPrice =
            priceNumber !== null
              ? priceNumber.toLocaleString("en-US", {
                  maximumFractionDigits: 0,
                })
              : "";

          return (
            <div key={p.id} className="product-card">
              <div className="product-card-top-right">
                <WishlistToggle
                  id={p.id}
                  slug={p.slug}
                  name={p.name}
                  imageUrl={imageUrl ?? undefined}
                />
              </div>

              <Link href={`/product/${p.slug}`} className="product-card-link">
                <div className="product-image">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={p.image?.altText || p.name}
                    />
                  ) : (
                    <div className="product-image-placeholder">No image</div>
                  )}
                </div>

                <h2 className="product-title product-title-2lines">
                  {p.name}
                </h2>

                {priceNumber !== null && (
                  <div className="product-price">{formattedPrice} ֏</div>
                )}

                {attributeNodes.length > 0 && (
                  <div className="product-meta product-meta-attributes">
                    {attributeNodes.slice(0, 2).map((attr) => (
                      <span key={attr.name} className="product-attr-pill">
                        {attr.options?.join(", ") || attr.name}
                      </span>
                    ))}
                  </div>
                )}
              </Link>

              <div className="product-add-to-cart">
                <AddToCartButton
                  id={p.id}
                  slug={p.slug}
                  name={p.name}
                  priceNumber={priceNumber}
                  imageUrl={imageUrl}
                />
              </div>
            </div>
          );
        })}
      </div>

      {hasMore && (
        <div className="mt-6 flex justify-center">
          <button
            type="button"
            className="load-more-button"
            onClick={() => setVisibleCount((prev) => prev + 12)}
          >
            Load more
          </button>
        </div>
      )}
    </>
  );
}