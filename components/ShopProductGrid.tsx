"use client";

import { useState } from "react";
import Link from "next/link";
import WishlistToggle from "./WishlistToggle";
import type { ProductNode } from "../lib/products";

type Props = {
  products: ProductNode[];
};

function toNumberPrice(price: string | null | undefined): number {
  if (!price) return 0;
  const n = parseFloat(price);
  return Number.isNaN(n) ? 0 : n;
}

export function ShopProductGrid({ products }: Props) {
  const [visibleCount, setVisibleCount] = useState(6);

  const visibleProducts = products.slice(0, visibleCount);
  const hasMore = visibleCount < products.length;

  return (
    <>
      <div className="product-grid">
        {visibleProducts.map((p) => {
          const priceNumber = toNumberPrice(p.price);
          const imageUrl = p.image?.sourceUrl || undefined;

          const formattedPrice =
            priceNumber > 0 && !Number.isNaN(priceNumber)
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
                  imageUrl={imageUrl}
                />
              </div>

              <Link
                href={`/product/${p.slug}`}
                className="product-card-link"
              >
                <div className="product-image">
                  {p.image?.sourceUrl ? (
                    <img
                      src={p.image.sourceUrl}
                      alt={p.image.altText || p.name}
                    />
                  ) : (
                    <div className="product-image-placeholder">
                      No image
                    </div>
                  )}
                </div>

                <h2 className="product-title product-title-2lines">
                  {p.name}
                </h2>

                {priceNumber > 0 && !Number.isNaN(priceNumber) && (
                  <div className="product-price">
                    {formattedPrice} ֏
                  </div>
                )}
              </Link>
            </div>
          );
        })}
      </div>

      {hasMore && (
        <div className="mt-6 flex justify-center">
          <button
            type="button"
            className="load-more-button"
            onClick={() => setVisibleCount((prev) => prev + 6)}
          >
            Load more
          </button>
        </div>
      )}
    </>
  );
}