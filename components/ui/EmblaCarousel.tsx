"use client";

import React, { ReactNode, useEffect, useState, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";

type EmblaOptions = Parameters<typeof useEmblaCarousel>[0];

type EmblaCarouselProps = {
  options?: EmblaOptions;
  autoplay?: boolean;
  autoplayDelayMs?: number;
  /** Pause autoplay while the user hovers the carousel (default: true). Accepts boolean-like values from CMS. */
  pauseOnHover?: boolean | "true" | "false" | 1 | 0 | null;
  /** Render previous/next buttons (default: false). Accepts boolean-like values from CMS. */
  showArrows?: boolean | "true" | "false" | 1 | 0 | null;
  /** Render dot navigation (default: false). Accepts boolean-like values from CMS. */
  showDots?: boolean | "true" | "false" | 1 | 0 | null;
  className?: string;
  children: ReactNode;
};

export const EmblaCarousel: React.FC<EmblaCarouselProps> = ({
  options,
  autoplay = false,
  autoplayDelayMs = 5000,
  pauseOnHover = true,
  showArrows = false,
  showDots = false,
  className,
  children,
}) => {
  const [emblaRef, emblaApi] = useEmblaCarousel(options);

  const toBool = (value: unknown, defaultValue: boolean) => {
    if (value === undefined || value === null) return defaultValue;
    if (typeof value === "boolean") return value;
    if (typeof value === "number") return value === 1;
    if (typeof value === "string") {
      const v = value.trim().toLowerCase();
      if (v === "true" || v === "1" || v === "yes" || v === "on") return true;
      if (v === "false" || v === "0" || v === "no" || v === "off") return false;
    }
    return defaultValue;
  };

  const pauseOnHoverEnabled = toBool(pauseOnHover, true);
  const showArrowsEnabled = toBool(showArrows, false);
  const showDotsEnabled = toBool(showDots, false);

  const loopEnabled = Boolean(options && (options as any).loop);

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);
  const [isHovering, setIsHovering] = useState(false);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    setScrollSnaps(emblaApi.scrollSnapList());
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", () => {
      setScrollSnaps(emblaApi.scrollSnapList());
      onSelect();
    });
  }, [emblaApi, onSelect]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const scrollTo = useCallback((index: number) => emblaApi?.scrollTo(index), [emblaApi]);

  useEffect(() => {
    if (!emblaApi || !autoplay) return;
    if (pauseOnHoverEnabled && isHovering) return;

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) return;

    const delay = Math.min(Math.max(autoplayDelayMs, 2000), 30000);

    const id = window.setInterval(() => {
      if (!emblaApi) return;

      // If loop is disabled, stop when we can't move forward
      if (!loopEnabled && !emblaApi.canScrollNext()) {
        return;
      }

      emblaApi.scrollNext();
    }, delay);

    return () => window.clearInterval(id);
  }, [emblaApi, autoplay, autoplayDelayMs, pauseOnHoverEnabled, isHovering, loopEnabled]);

  return (
    <div
      className={className}
      onMouseEnter={pauseOnHoverEnabled ? () => setIsHovering(true) : undefined}
      onMouseLeave={pauseOnHoverEnabled ? () => setIsHovering(false) : undefined}
    >
      <div className="relative">
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex">{children}</div>
        </div>

        {showArrowsEnabled && (
          <>
            <button
              type="button"
              onClick={scrollPrev}
              disabled={!loopEnabled && !!emblaApi && !emblaApi.canScrollPrev()}
              className="absolute z-20 left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 text-white w-9 h-9 flex items-center justify-center hover:bg-black/60 disabled:opacity-30"
              aria-label="Previous"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={scrollNext}
              disabled={!loopEnabled && !!emblaApi && !emblaApi.canScrollNext()}
              className="absolute z-20 right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 text-white w-9 h-9 flex items-center justify-center hover:bg-black/60 disabled:opacity-30"
              aria-label="Next"
            >
              ›
            </button>
          </>
        )}
      </div>

      {showDotsEnabled && scrollSnaps.length > 1 && (
        <div className="relative z-10 mt-3 flex items-center justify-center gap-2">
          {scrollSnaps.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => scrollTo(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={`h-2.5 w-2.5 rounded-full transition ${
                idx === selectedIndex ? "bg-neutral-100" : "bg-neutral-100/40 hover:bg-neutral-100/60"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};
