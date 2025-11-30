"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
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
  const [quickViewProduct, setQuickViewProduct] = useState<ProductNode | null>(null);

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

              <div className="product-card-actions">
                <button
                  type="button"
                  className="product-quick-view-button"
                  onClick={() => setQuickViewProduct(p)}
                >
                  Quick view
                </button>

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

      <AnimatePresence>
        {quickViewProduct && (
          <motion.div
            className="quick-view-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={() => setQuickViewProduct(null)}
          >
            <motion.div
              className="quick-view-modal"
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              onClick={(event) => event.stopPropagation()}
            >
              {(() => {
                const qp = quickViewProduct;
                const qpPriceNumber = toNumberPrice(qp.price);
                const qpImageUrl = qp.image?.sourceUrl || null;
                const qpAttributes = qp.attributes?.nodes ?? [];

                const qpFormattedPrice =
                  qpPriceNumber !== null
                    ? qpPriceNumber.toLocaleString("en-US", {
                        maximumFractionDigits: 0,
                      })
                    : "";

                return (
                  <>
                    <button
                      type="button"
                      className="quick-view-close"
                      onClick={() => setQuickViewProduct(null)}
                    >
                      ×
                    </button>

                    <div className="quick-view-content">
                      <div className="quick-view-image">
                        {qpImageUrl ? (
                          <img
                            src={qpImageUrl}
                            alt={qp.image?.altText || qp.name}
                          />
                        ) : (
                          <div className="product-image-placeholder">
                            No image
                          </div>
                        )}
                      </div>

                      <div className="quick-view-details">
                        <h2 className="quick-view-title">{qp.name}</h2>

                        {qpPriceNumber !== null && (
                          <div className="quick-view-price">
                            {qpFormattedPrice} ֏
                          </div>
                        )}

                        {qpAttributes.length > 0 && (
                          <div className="quick-view-attributes">
                            {qpAttributes.slice(0, 4).map((attr) => (
                              <span
                                key={attr.name}
                                className="product-attr-pill"
                              >
                                {attr.options?.join(", ") || attr.name}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="quick-view-actions">
                          <AddToCartButton
                            id={qp.id}
                            slug={qp.slug}
                            name={qp.name}
                            priceNumber={qpPriceNumber}
                            imageUrl={qpImageUrl}
                          />
                          <Link
                            href={`/product/${qp.slug}`}
                            className="quick-view-full-link"
                            onClick={() => setQuickViewProduct(null)}
                          >
                            View full product
                          </Link>
                        </div>
                      </div>
                    </div>
                  </>
                );
              })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}