"use client";

import React, { ReactNode, useEffect } from "react";
import useEmblaCarousel from "embla-carousel-react";

type EmblaOptions = Parameters<typeof useEmblaCarousel>[0];

type EmblaCarouselProps = {
  options?: EmblaOptions;
  autoplay?: boolean;
  autoplayDelayMs?: number;
  className?: string;
  children: ReactNode;
};

export const EmblaCarousel: React.FC<EmblaCarouselProps> = ({
  options,
  autoplay = false,
  autoplayDelayMs = 5000,
  className,
  children,
}) => {
  const [emblaRef, emblaApi] = useEmblaCarousel(options);

  useEffect(() => {
    if (!emblaApi || !autoplay) return;

    let raf: number;
    let lastTime = performance.now();

    const loop = (time: number) => {
      const delta = time - lastTime;
      if (delta >= autoplayDelayMs) {
        emblaApi.scrollNext();
        lastTime = time;
      }
      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
    };
  }, [emblaApi, autoplay, autoplayDelayMs]);

  return (
    <div className={className}>
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">{children}</div>
      </div>
    </div>
  );
};