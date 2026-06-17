"use client";

import { useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import Image from "next/image";
import WishlistToggle from "./WishlistToggle";
import AddToCartButton from "./AddToCartButton";
import { SiteIcon } from "@/components/ui/SiteIcon";
import { motion, AnimatePresence } from "framer-motion";
import type {
  TypographyGroup,
  TypographySettings,
} from "@/lib/builderTypography";
import {
  getProductImageStyleVars,
  type ProductImageFit,
  type ProductImageRatio,
} from "@/lib/productCardImage";

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
  attributes?: {
    nodes?: {
      name?: string | null;
      label?: string | null;
      options?: string[] | null;
    }[] | null;
  } | null;
};

function formatPrice(price: string | null | undefined) {
  if (!price) return null;
  const priceNumber = parseFloat(price);
  if (Number.isNaN(priceNumber)) return null;

  const rounded = Math.round(priceNumber);
  const withSpaces = rounded
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, " ");

  return `${withSpaces} ֏`;
}

function getProductAttributes(product: BasicProduct) {
  return (product.attributes?.nodes ?? [])
    .map((attr) => {
      const label = (attr.label || attr.name || "").trim();
      const values = (attr.options ?? [])
        .map((value) => value.trim())
        .filter(Boolean);

      return { label, values };
    })
    .filter((attr) => attr.label && attr.values.length > 0)
    .slice(0, 2);
}

function QuickViewPortal({ children }: { children: ReactNode }) {
  if (typeof document === "undefined") return null;

  return createPortal(children, document.body);
}

export default function ProductCard({
  product,
  preset,
  cardStyle,
  cardTheme,
  gridImageFrame,
  imagePadding,
  imageFit,
  imageRatio,
  borderRadius,
  addToCartStyle,
  addToCartSize,
  addToCartDisplay,
  addToCartVisibility,
  addToCartPosition,
  typography,
}: {
  product: BasicProduct;
  preset?: string;
  cardStyle?: string | null;
  cardTheme?: string | null;
  gridImageFrame?: string | null;
  imagePadding?: string | null;
  imageFit?: ProductImageFit | null;
  imageRatio?: ProductImageRatio | null;
  borderRadius?: number | null;
  addToCartStyle?: string | null;
  addToCartSize?: string | null;
  addToCartDisplay?: string | null;
  addToCartVisibility?: string | null;
  addToCartPosition?: string | null;
  typography?: TypographySettings | TypographyGroup;
}) {

  function typographyStyle(typ: any) {
    if (!typ) return { className: undefined, style: undefined };
    const classes: string[] = [];
    const style: React.CSSProperties = {};
    const isClassLike = (v?: string) => typeof v === "string" && /^[a-z-]+[0-9a-z-]*$/.test(v);
    if (typ.fontSize) {
      if (isClassLike(typ.fontSize) && typ.fontSize.startsWith("text-")) classes.push(typ.fontSize);
      else style.fontSize = typ.fontSize;
    }
    if (typ.fontWeight) {
      if (isClassLike(String(typ.fontWeight)) && String(typ.fontWeight).startsWith("font-")) classes.push(String(typ.fontWeight));
      else style.fontWeight = typ.fontWeight;
    }
    if (typ.lineHeight) {
      if (isClassLike(typ.lineHeight) && typ.lineHeight.startsWith("leading-")) classes.push(typ.lineHeight);
      else style.lineHeight = typ.lineHeight;
    }
    if (typ.letterSpacing) {
      if (isClassLike(typ.letterSpacing) && typ.letterSpacing.startsWith("tracking-")) classes.push(typ.letterSpacing);
      else style.letterSpacing = typ.letterSpacing;
    }
    if (typ.color) {
      if (isClassLike(typ.color) && typ.color.startsWith("text-")) classes.push(typ.color);
      else style.color = typ.color;
    }
    if (typ.textAlign) {
      const map: Record<string, string> = { left: "text-left", center: "text-center", right: "text-right", justify: "text-justify" };
      classes.push(map[typ.textAlign] ?? "");
    }
    if (typ.textTransform) {
      if (isClassLike(typ.textTransform)) classes.push(typ.textTransform);
      else style.textTransform = typ.textTransform;
    }
    if (typ.textDecoration) {
      if (isClassLike(typ.textDecoration)) classes.push(typ.textDecoration);
      else style.textDecoration = typ.textDecoration;
    }
    if (typ.fontFamily) {
      if (isClassLike(typ.fontFamily) && typ.fontFamily.startsWith("font-")) classes.push(typ.fontFamily);
      else style.fontFamily = typ.fontFamily;
    }
    return { className: classes.filter(Boolean).join(" ") || undefined, style: Object.keys(style).length ? style : undefined };
  }
  const titleTypography = typographyStyle((typography as any)?.title ?? typography);
  const imageUrl = product.image?.sourceUrl || undefined;
  const priceNumber = product.price ? parseFloat(product.price) : null;
  const formattedPrice = formatPrice(product.price);
  const attributes = getProductAttributes(product);

  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  const normalizedCardPreset = preset ?? "standard";
  const normalizedCardTheme = cardTheme ?? "default";

  const normalizedCartStyle =
    addToCartStyle === "blue" ||
    addToCartStyle === "dark" ||
    addToCartStyle === "light" ||
    addToCartStyle === "inherit"
      ? addToCartStyle
      : "inherit";

  const normalizedCartSize =
    addToCartSize === "compact" ||
    addToCartSize === "large" ||
    addToCartSize === "full"
      ? addToCartSize
      : "medium";

  const normalizedCartPosition =
    addToCartPosition === "under-price" ||
    addToCartPosition === "under-wishlist"
      ? addToCartPosition
      : "below";

  const normalizedCartDisplay = addToCartDisplay === "icon" ? "icon" : "button";

  const sizeStyle: React.CSSProperties =
    normalizedCartDisplay === "icon"
      ? {
          width: 42,
          minWidth: 42,
          height: 42,
          minHeight: 42,
          padding: 0,
          fontSize: 0,
        }
      : normalizedCartSize === "compact"
        ? { minWidth: 96, minHeight: 32, padding: "0 14px", fontSize: 11 }
        : normalizedCartSize === "large"
          ? { minWidth: 168, minHeight: 48, padding: "0 28px", fontSize: 13 }
          : normalizedCartSize === "full"
            ? { width: "100%", minHeight: 54, padding: "0 24px", fontSize: 13 }
            : { minWidth: 128, minHeight: 38, padding: "0 20px", fontSize: 12 };

  const colorStyle: React.CSSProperties =
    normalizedCartStyle === "dark"
      ? { background: "#111111", borderColor: "#111111", color: "#ffffff" }
      : normalizedCartStyle === "light"
        ? {
            background: "#ffffff",
            borderColor: "rgba(17, 17, 17, 0.14)",
            color: "#111111",
            boxShadow: "inset 0 0 0 1px rgba(17, 17, 17, 0.08)",
          }
        : normalizedCartStyle === "inherit"
          ? {
              background: "var(--button-bg, var(--builder-active-button-bg, var(--text-main, #111111)))",
              borderColor: "var(--button-border-color, var(--button-bg, var(--builder-active-button-bg, var(--text-main, #111111))))",
              color: "var(--button-text-color, var(--builder-active-button-text, #ffffff))",
            }
          : { background: "#0d7cff", borderColor: "#0d7cff", color: "#ffffff" };

  const cartButtonStyle = {
    ...sizeStyle,
    ...colorStyle,
    borderRadius:
      normalizedCartStyle === "inherit" ? "var(--button-radius, 999px)" : 999,
    fontWeight:
      normalizedCartStyle === "inherit" ? "var(--button-font-weight, 800)" : 800,
    letterSpacing:
      normalizedCartStyle === "inherit" ? "var(--button-letter-spacing, 0.06em)" : "0.06em",
    boxShadow: colorStyle.boxShadow ?? "none",
  };

  const cardStyleVars = {
    ...getProductImageStyleVars(imageFit, imageRatio),
    ...(borderRadius !== undefined && borderRadius !== null
      ? {
          "--builder-card-radius": `${borderRadius}px`,
          "--product-card-radius": `${borderRadius}px`,
        }
      : {}),
  } as React.CSSProperties;

  const cartAction = (
    <div className="product-card-actions-row">
      <AddToCartButton
        id={product.id}
        slug={product.slug}
        name={product.name}
        priceNumber={priceNumber}
        imageUrl={imageUrl}
        style={cartButtonStyle}
        display={normalizedCartDisplay}
      />
    </div>
  );

  return (
    <MotionDiv
      className="product-card shop-archive-card"
      data-card-preset={normalizedCardPreset}
      data-card-theme={normalizedCardTheme}
      style={cardStyleVars}
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

          {normalizedCartPosition === "under-wishlist" && cartAction}

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
          <div className="product-image">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={product.image?.altText || product.name}
                width={400}
                height={400}
                className="product-image-img"
                style={{
                  objectFit:
                    "var(--product-image-object-fit, cover)" as React.CSSProperties["objectFit"],
                }}
              />
            ) : (
              <div className="product-image-placeholder">No image</div>
            )}
          </div>

          <div className="product-card-info">
            <h3 className={['product-title product-title-2lines', titleTypography.className].filter(Boolean).join(' ')} style={titleTypography.style}>
              {product.name}
            </h3>

            {formattedPrice && (
              <div className="product-price">{formattedPrice}</div>
            )}

            {normalizedCartPosition === "under-price" && cartAction}
          </div>

          {attributes.length > 0 && (
            <div className="product-attributes-row">
              {attributes.map((attr) => (
                <div key={attr.label} className="product-attribute-badge">
                  <span className="product-attribute-label">{attr.label}</span>
                  <span className="product-attribute-values">
                    {attr.values.join(", ")}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Link>

        {normalizedCartPosition === "below" && cartAction}
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

                    {formattedPrice && (
                      <div className="quick-view-price">{formattedPrice}</div>
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
