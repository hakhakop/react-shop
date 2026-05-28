"use client";

import React from "react";
import Image from "next/image";
import {
  Autoplay,
  EffectCards,
  EffectCoverflow,
  EffectCreative,
  EffectFade,
  FreeMode,
  Navigation,
  Pagination,
} from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { EmblaCarousel } from "../ui/EmblaCarousel";
import type { CarouselLayoutBlock } from "../../lib/pageBuilder";

export type CarouselSlide = {
  id: string;
  imageUrl?: string;
  imageAlt?: string | null;
  title?: string | null;
  subtitle?: string | null;
  text?: string | null;
  buttonLabel?: string | null;
  buttonUrl?: string | null;
  badge?: string | null;
  imagePadding?: "frameless" | "small" | "medium" | "max" | string | null;
};

export type CarouselSettings = {
  variant?: string | string[]; // ACF may give an array
  loop?: boolean;
  autoplay?: boolean;
  autoplayDelayMs?: number | string;
  align?: ("center" | "start") | string | string[];
  dragFree?: boolean;
  effect?: "slide" | "fade" | string | null;
  spaceBetween?: number | string | null;
  coverflowRotate?: number | string | null;
  coverflowDepth?: number | string | null;
  coverflowStretch?: number | string | null;
  cardsRotate?: boolean | "true" | "false" | 1 | 0 | null;
  cardsShadows?: boolean | "true" | "false" | 1 | 0 | null;
  creativePreset?: "soft-stack" | "deep" | "scale" | string | null;
  fadeCrossFade?: boolean | "true" | "false" | 1 | 0 | null;
  freeModeMomentum?: boolean | "true" | "false" | 1 | 0 | null;
  /** Optional: how many cards should be visible in one viewport on desktop */
  cardsPerView?: number | null;
  showArrows?: boolean | "true" | "false" | 1 | 0 | null;
  showDots?: boolean | "true" | "false" | 1 | 0 | null;
  pauseOnHover?: boolean | "true" | "false" | 1 | 0 | null;
};

type CarouselBlockProps = {
  block?: CarouselLayoutBlock;
  slides: CarouselSlide[];
  settings?: CarouselSettings;
  className?: string;
};

export default function CarouselBlock({
  slides,
  settings,
  className,
}: CarouselBlockProps) {
  if (!slides || slides.length === 0) {
    return (
      <div className="text-sm opacity-60">
        [CarouselBlock] No slides configured.
      </div>
    );
  }
  // Normalize variant: ACF/GraphQL may give us ["basic"] instead of "basic"
  const normalizedVariant =
    Array.isArray(settings?.variant)
      ? settings.variant[0] ?? "basic"
      : settings?.variant ?? "basic";
  const swiperVariant =
    normalizedVariant === "swiper-showcase" ? "showcase" : normalizedVariant;

  const normalizedAlign = (() => {
    const raw = Array.isArray(settings?.align)
      ? settings?.align?.[0]
      : (settings?.align as any);

    if (raw === "start" || raw === "center") return raw;
    return "center";
  })();

  // Normalize cards-per-view, defaulting to 1 and clamping to [1, 4]
  const rawCardsPerView = settings?.cardsPerView ?? 1;
  const cardsPerView = Math.min(Math.max(Number(rawCardsPerView) || 1, 1), 4);

  // Decide item width classes based on desired cardsPerView (desktop)
  const itemWidthClasses = (() => {
    switch (cardsPerView) {
      case 2:
        return "flex-[0_0_100%] md:flex-[0_0_50%]";
      case 3:
        return "flex-[0_0_100%] md:flex-[0_0_33.3333%]";
      case 4:
        return "flex-[0_0_100%] md:flex-[0_0_25%]";
      case 1:
      default:
        return "flex-[0_0_100%] md:flex-[0_0_100%]";
    }
  })();

  const options = {
    // Only loop if we actually have more than one viewport worth of slides
    loop: slides.length > cardsPerView && (settings?.loop ?? true),
    align: normalizedAlign,
    dragFree: settings?.dragFree ?? false,
  };

  // Only autoplay if there is more than one viewport worth of slides
  const autoplay = slides.length > cardsPerView && (settings?.autoplay ?? true);

  // Clamp autoplay delay so it never becomes "crazy fast"
  const rawDelay = Number(settings?.autoplayDelayMs ?? 5000);
  const autoplayDelayMs = Math.min(Math.max(rawDelay || 5000, 2000), 30000);
  const rawSpaceBetween = Number(settings?.spaceBetween ?? 24);
  const spaceBetween = Math.min(Math.max(rawSpaceBetween || 24, 0), 80);
  const numberSetting = (
    value: number | string | null | undefined,
    fallback: number,
    min: number,
    max: number,
  ) => Math.min(Math.max(Number(value ?? fallback) || fallback, min), max);
  const booleanSetting = (
    value: boolean | "true" | "false" | 1 | 0 | null | undefined,
    fallback: boolean,
  ) => {
    if (value === undefined || value === null) return fallback;
    if (typeof value === "boolean") return value;
    if (typeof value === "number") return value === 1;
    return value === "true";
  };
  const swiperEffect = (() => {
    if (swiperVariant === "coverflow") return "coverflow";
    if (swiperVariant === "cards") return "cards";
    if (swiperVariant === "creative") return "creative";
    if (swiperVariant === "fade" || settings?.effect === "fade") return "fade";
    return "slide";
  })();
  const singleSlideEffect = ["cards", "creative", "fade"].includes(swiperEffect);
  const swiperSlidesPerView = singleSlideEffect ? 1 : cardsPerView;
  const usesSwiper = [
    "hero",
    "showcase",
    "coverflow",
    "cards",
    "creative",
    "fade",
    "free-mode",
  ].includes(swiperVariant);
  const creativeEffect = (() => {
    switch (settings?.creativePreset) {
      case "deep":
        return {
          prev: { translate: ["-120%", 0, -520], rotate: [0, 0, -18], opacity: 0.35 },
          next: { translate: ["120%", 0, -520], rotate: [0, 0, 18], opacity: 0.35 },
        };
      case "scale":
        return {
          prev: { translate: ["-72%", 0, -260], scale: 0.78, opacity: 0.45 },
          next: { translate: ["72%", 0, -260], scale: 0.78, opacity: 0.45 },
        };
      case "soft-stack":
      default:
        return {
          prev: { translate: ["-18%", 0, -180], scale: 0.88, opacity: 0.55 },
          next: { translate: ["18%", 0, -180], scale: 0.88, opacity: 0.55 },
        };
    }
  })();

  if (usesSwiper) {
    return (
      <div
        className={`shop-builder-swiper shop-builder-swiper--${swiperVariant} ${className ?? ""}`.trim()}
      >
        <Swiper
          modules={[
            Autoplay,
            EffectCards,
            EffectCoverflow,
            EffectCreative,
            EffectFade,
            FreeMode,
            Navigation,
            Pagination,
          ]}
          slidesPerView={1}
          spaceBetween={spaceBetween}
          effect={swiperEffect}
          centeredSlides={swiperVariant === "coverflow"}
          freeMode={
            swiperVariant === "free-mode"
              ? {
                  enabled: true,
                  momentum: booleanSetting(settings?.freeModeMomentum, true),
                }
              : false
          }
          coverflowEffect={{
            rotate: numberSetting(settings?.coverflowRotate, 34, -90, 90),
            depth: numberSetting(settings?.coverflowDepth, 140, 0, 500),
            stretch: numberSetting(settings?.coverflowStretch, 0, -120, 120),
            modifier: 1,
            slideShadows: true,
          }}
          cardsEffect={{
            rotate: booleanSetting(settings?.cardsRotate, true),
            slideShadows: booleanSetting(settings?.cardsShadows, true),
          }}
          creativeEffect={creativeEffect}
          fadeEffect={{ crossFade: booleanSetting(settings?.fadeCrossFade, true) }}
          loop={slides.length > swiperSlidesPerView && (settings?.loop ?? true)}
          autoplay={
            autoplay
              ? {
                  delay: autoplayDelayMs,
                  disableOnInteraction: false,
                  pauseOnMouseEnter: settings?.pauseOnHover !== false,
                }
              : false
          }
          navigation={settings?.showArrows !== false}
          pagination={
            settings?.showDots === false ? false : { clickable: true }
          }
          breakpoints={{
            860: {
              slidesPerView:
                swiperVariant === "coverflow"
                  ? Math.min(cardsPerView || 1, 3)
                  : Math.min(swiperSlidesPerView || 1, 3),
              spaceBetween,
            },
            1180: {
              slidesPerView:
                swiperVariant === "coverflow"
                  ? Math.min(cardsPerView || 1, 4)
                  : Math.min(swiperSlidesPerView || 1, 4),
              spaceBetween,
            },
          }}
        >
          {slides.map((slide) => (
            <SwiperSlide key={slide.id}>
              <article className="shop-builder-swiper-card">
                {slide.imageUrl ? (
                  <div className="shop-builder-swiper-media">
                    <Image
                      src={slide.imageUrl}
                      alt={slide.imageAlt ?? ""}
                      fill
                      className="object-cover"
                      sizes="(min-width: 1180px) 33vw, (min-width: 860px) 50vw, 100vw"
                    />
                  </div>
                ) : (
                  <div className="shop-builder-swiper-media shop-builder-swiper-media--empty" />
                )}
                <div className="shop-builder-swiper-copy">
                  {slide.badge && <span>{slide.badge}</span>}
                  {slide.title && <h3>{slide.title}</h3>}
                  {(slide.subtitle || slide.text) && (
                    <p>{slide.subtitle || slide.text}</p>
                  )}
                  {slide.buttonLabel && slide.buttonUrl && (
                    <a href={slide.buttonUrl}>{slide.buttonLabel}</a>
                  )}
                </div>
              </article>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    );
  }

  return (
    <div className={`relative w-full ${className ?? ""}`.trim()}>
      <EmblaCarousel
        options={options}
        autoplay={autoplay}
        autoplayDelayMs={autoplayDelayMs}
        pauseOnHover={settings?.pauseOnHover}
        showArrows={settings?.showArrows}
        showDots={settings?.showDots}
        className="w-full"
      >
        {slides.map((slide) => {
          const imagePanelPadding = (() => {
            switch (slide.imagePadding) {
              case "frameless":
                return {
                  panel: "p-0",
                  media: "rounded-none",
                };
              case "small":
                return {
                  panel: "p-3 pb-0",
                  media: "rounded-xl",
                };
              case "max":
                return {
                  panel: "p-8 md:p-14 pb-0 md:pb-0",
                  media: "rounded-lg",
                };
              case "medium":
              default:
                return {
                  panel: "p-6 pb-0",
                  media: "rounded-xl",
                };
            }
          })();

          const content = (
            <>
              {slide.badge && (
                <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs font-medium">
                  {slide.badge}
                </span>
              )}

              {slide.title && (
                <h2 className="text-xl md:text-3xl font-semibold">
                  {slide.title}
                </h2>
              )}

              {(slide.subtitle || slide.text) && (
                <p className="text-sm md:text-base text-neutral-200">
                  {slide.subtitle || slide.text}
                </p>
              )}

              {slide.buttonLabel && slide.buttonUrl && (
                <div className="mt-2">
                  <a
                    href={slide.buttonUrl}
                    className="inline-flex items-center justify-center rounded-full bg-white text-neutral-900 px-4 py-2 text-sm font-medium shadow-sm hover:bg-neutral-100 transition"
                  >
                    {slide.buttonLabel}
                  </a>
                </div>
              )}
            </>
          );

          const baseCardClasses =
            "relative w-full overflow-hidden rounded-2xl bg-neutral-900 text-neutral-50 flex flex-col";

          const variantClasses = (() => {
            switch (normalizedVariant) {
              case "hero":
                return {
                  card: "items-stretch text-center justify-center min-h-[260px] md:min-h-[360px]",
                  content: "p-8 md:p-14 items-center",
                };
              case "overlay":
                return {
                  card: "justify-end min-h-[260px] md:min-h-[360px]",
                  content: "p-6 md:p-10",
                };
              default:
                // "basic" and anything unknown
                return {
                  card: "",
                  content: "p-6 md:p-10",
                };
            }
          })();

          return (
            <div
              key={slide.id}
              className={`min-w-0 ${itemWidthClasses} px-2 md:px-4`}
            >
              <div className={`${baseCardClasses} ${variantClasses.card}`}>
                {normalizedVariant === "overlay" && slide.imageUrl ? (
                  <>
                    <Image
                      src={slide.imageUrl}
                      alt={slide.imageAlt ?? ""}
                      fill
                      className="object-cover opacity-70"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent" />
                    <div
                      className={`relative z-10 flex flex-col gap-4 md:gap-6 ${variantClasses.content}`}
                    >
                      {content}
                    </div>
                  </>
                ) : (
                  <>
                    {slide.imageUrl && (
                      <div className={`w-full ${imagePanelPadding.panel}`}>
                        <div
                          className={`relative w-full h-48 md:h-72 overflow-hidden ${imagePanelPadding.media}`}
                        >
                          <Image
                            src={slide.imageUrl}
                            alt={slide.imageAlt ?? ""}
                            fill
                            className="object-cover"
                          />
                        </div>
                      </div>
                    )}
                    <div
                      className={`flex flex-col gap-4 md:gap-6 ${variantClasses.content}`}
                    >
                      {content}
                    </div>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </EmblaCarousel>
    </div>
  );
}
