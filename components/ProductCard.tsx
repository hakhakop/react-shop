"use client";

import { useState, useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import Image from "next/image";
import WishlistToggle from "./WishlistToggle";
import { SiteIcon } from "@/components/ui/SiteIcon";
import { motion, AnimatePresence } from "framer-motion";

const MotionDiv = motion.div;

export type WPImage = {
  sourceUrl?: string | null;
  altText?: string | null;
};

export type BasicProduct = {
  id: string;
  slug: string;
  name: string;
  image?: WPImage | null;
  price?: string | null;
};

function QuickViewPortal({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || typeof document === "undefined") return null;

  return createPortal(children, document.body);
}

export default function ProductCard({
  product,
  preset, // currently just passed through if needed later
}: {
  product: BasicProduct;
  preset?: string;
}) {
  const priceNumber = product.price ? parseFloat(product.price) : null;
  const imageUrl = product.image?.sourceUrl || undefined;

  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  return (
    <MotionDiv
      className="product-card"
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
    >
      <div className="product-card-inner">
        {/* Top-right icons (wishlist + quick view) */}
        <div className="product-card-top-right">
          <WishlistToggle
            id={product.id}
            slug={product.slug}
            name={product.name}
            imageUrl={imageUrl}
          />

          <button
            type="button"
            className="icon-ghost product-quick-view-icon"
            aria-label="Quick view"
            onClick={() => setIsQuickViewOpen(true)}
          >
            <SiteIcon name="search" className="quick-view-icon-svg" />
          </button>
        </div>

        {/* Main clickable area */}
        <Link
          href={`/product/${product.slug}`}
          className="product-card-link"
          aria-label={product.name}
        >
          <div className="product-image-wrapper">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={product.image?.altText || product.name}
                width={400}
                height={400}
                className="product-image"
                style={{
                  objectFit:
                    "var(--product-image-object-fit, cover)" as React.CSSProperties["objectFit"],
                }}
              />
            ) : (
              <div className="product-image-placeholder">No image</div>
            )}
          </div>

          <h3 className="product-title product-title-2lines">
            {product.name}
          </h3>

          {priceNumber !== null && !Number.isNaN(priceNumber) && (
            <div className="product-price">
              {(() => {
                const rounded = Math.round(priceNumber);
                const withSpaces = rounded
                  .toString()
                  .replace(/\B(?=(\d{3})+(?!\d))/g, " ");
                return `${withSpaces} ֏`;
              })()}
            </div>
          )}
        </Link>
      </div>

      {/* Quick View modal in a portal (overlays whole page) */}
      <QuickViewPortal>
        <AnimatePresence>
          {isQuickViewOpen && (
            <motion.div
              className="quick-view-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              onClick={() => setIsQuickViewOpen(false)}
            >
              <motion.div
                className="quick-view-modal"
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                onClick={(event) => event.stopPropagation()}
              >
                <button
                  type="button"
                  className="quick-view-close"
                  onClick={() => setIsQuickViewOpen(false)}
                >
                  ×
                </button>

                <div className="quick-view-content">
                  <div className="quick-view-image">
                    {imageUrl ? (
                      <Image
                        src={imageUrl}
                        alt={product.image?.altText || product.name}
                        width={400}
                        height={300}
                        style={{
                          objectFit:
                            "var(--product-image-object-fit, contain)" as React.CSSProperties["objectFit"],
                        }}
                      />
                    ) : (
                      <div className="product-image-placeholder">No image</div>
                    )}
                  </div>

                  <div className="quick-view-details">
                    <h2 className="quick-view-title">{product.name}</h2>

                    {priceNumber !== null && !Number.isNaN(priceNumber) && (
                      <div className="quick-view-price">
                        {(() => {
                          const rounded = Math.round(priceNumber);
                          const withSpaces = rounded
                            .toString()
                            .replace(/\B(?=(\d{3})+(?!\d))/g, " ");
                          return `${withSpaces} ֏`;
                        })()}
                      </div>
                    )}

                    <div className="quick-view-actions">
                      <Link
                        href={`/product/${product.slug}`}
                        className="quick-view-full-link"
                        onClick={() => setIsQuickViewOpen(false)}
                      >
                        View full product
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </QuickViewPortal>
    </MotionDiv>
  );
}