"use client";

import useEmblaCarousel from "embla-carousel-react";
import { useCallback } from "react";
import type { ProductNode } from "../lib/products"; // adjust import if needed
import ProductCard from "./ProductCard";

type ProductCarouselProps = {
  products: ProductNode[];
  preset: string;
  typography?: any;
};

export default function ProductCarousel({
  products,
  preset,
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

  return (
    <div className="product-carousel">
      <div className="product-carousel__viewport" ref={emblaRef}>
        <div className="product-carousel__container">
          {products.map((p) => (
            <div className="product-carousel__slide" key={p.id}>
              <ProductCard product={p} preset={preset} typography={typography} />
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