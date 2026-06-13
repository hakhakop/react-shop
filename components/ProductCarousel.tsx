"use client";

import useEmblaCarousel from "embla-carousel-react";
import { useCallback } from "react";
import type { ProductNode } from "../lib/products"; // adjust import if needed
import ProductCard from "./ProductCard";
import type { ProductImageFit, ProductImageRatio } from "@/lib/productCardImage";

type ProductCarouselProps = {
  products: ProductNode[];
  preset: string;
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
  typography?: any;
};

export default function ProductCarousel({
  products,
  preset,
  cardStyle,
  cardTheme = "default",
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
}: ProductCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "start",
  });

  const scrollPrev = useCallback(() => {
    if (!emblaApi) return;
    emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (!emblaApi) return;
    emblaApi.scrollNext();
  }, [emblaApi]);

  if (!products || products.length === 0) {
    return null;
  }

  const normalizedCardStyle =
    cardStyle === "soft" || cardStyle === "lined" || cardStyle === "none"
      ? cardStyle
      : "flat";

  const normalizedCardPreset =
    preset === "graph" ||
    preset === "gallery" ||
    preset === "editorial" ||
    preset === "compact" ||
    preset === "minimal" ||
    preset === "luxury" ||
    preset === "princity" ||
    preset === "princity-flat" ||
    preset === "princity-line" ||
    preset === "secondary" ||
    preset === "dark" ||
    preset === "light" ||
    preset === "clean-shadow" ||
    preset === "flat-dark" ||
    preset === "flat-white" ||
    preset === "antigravity"
      ? preset
      : "standard";

  let normalizedCardTheme =
    cardTheme === "princity" ||
    cardTheme === "princity-flat" ||
    cardTheme === "princity-line" ||
    cardTheme === "secondary" ||
    cardTheme === "dark" ||
    cardTheme === "light" ||
    cardTheme === "clean-shadow" ||
    cardTheme === "flat-dark" ||
    cardTheme === "flat-white" ||
    cardTheme === "antigravity"
      ? cardTheme
      : "default";

  if (normalizedCardTheme === "default") {
    if (
      normalizedCardPreset === "princity" ||
      normalizedCardPreset === "princity-flat" ||
      normalizedCardPreset === "princity-line" ||
      normalizedCardPreset === "secondary" ||
      normalizedCardPreset === "dark" ||
      normalizedCardPreset === "light" ||
      normalizedCardPreset === "clean-shadow" ||
      normalizedCardPreset === "flat-dark" ||
      normalizedCardPreset === "flat-white" ||
      normalizedCardPreset === "antigravity" ||
      normalizedCardPreset === "luxury"
    ) {
      normalizedCardTheme = normalizedCardPreset;
    }
  }

  const normalizedCartStyle =
    addToCartStyle === "dark" ||
    addToCartStyle === "light" ||
    addToCartStyle === "inherit"
      ? addToCartStyle
      : "blue";

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

  const normalizedCartVisibility =
    addToCartVisibility === "always" ? "always" : "hover";

  const normalizedCartDisplay = addToCartDisplay === "icon" ? "icon" : "button";

  const spaceToCss = (val: string | null | undefined, fallback: string) => {
    const key = (val || fallback).toString().toLowerCase();
    switch (key) {
      case "frameless":
      case "none":
        return "0px";
      case "small":
        return "clamp(6px, 0.7vw, 10px)";
      case "large":
        return "clamp(28px, 3vw, 46px)";
      case "max":
        return "clamp(44px, 5vw, 76px)";
      case "medium":
      default:
        return "clamp(16px, 1.8vw, 26px)";
    }
  };

  const productStyleVars = {
    "--product-image-padding": spaceToCss(imagePadding, "large"),
  } as React.CSSProperties;

  return (
    <div
      data-card-theme={normalizedCardTheme}
      className={`product-carousel shop-card-style--${normalizedCardStyle} shop-card-preset--${normalizedCardPreset} ${
        normalizedCardTheme && normalizedCardTheme !== "default"
          ? `shop-card-preset--${normalizedCardTheme}`
          : ""
      } shop-cart-button--${normalizedCartStyle} shop-cart-size--${normalizedCartSize} shop-cart-position--${normalizedCartPosition} shop-cart-visibility--${normalizedCartVisibility} shop-cart-display--${normalizedCartDisplay} shop-image-padding--${
        imagePadding === "frameless" || imagePadding === "none"
          ? "none"
          : imagePadding || "large"
      } shop-image-frame--${gridImageFrame === "soft" ? "soft" : "none"}`}
      style={productStyleVars}
    >
      <div className="product-carousel__viewport" ref={emblaRef}>
        <div className="product-carousel__container">
          {products.map((p) => (
            <div className="product-carousel__slide" key={p.id}>
              <ProductCard
                product={p}
                preset={preset}
                cardStyle={cardStyle}
                cardTheme={cardTheme}
                gridImageFrame={gridImageFrame}
                imagePadding={imagePadding}
                imageFit={imageFit}
                imageRatio={imageRatio}
                borderRadius={borderRadius}
                addToCartStyle={addToCartStyle}
                addToCartSize={addToCartSize}
                addToCartDisplay={addToCartDisplay}
                addToCartVisibility={addToCartVisibility}
                addToCartPosition={addToCartPosition}
                typography={typography}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="product-carousel__controls">
        <button
          type="button"
          className="product-carousel__button product-carousel__button--prev"
          onClick={scrollPrev}
        >
          ‹
        </button>
        <button
          type="button"
          className="product-carousel__button product-carousel__button--next"
          onClick={scrollNext}
        >
          ›
        </button>
      </div>
    </div>
  );
}
