"use client";

import React, { useState } from "react";
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
  Thumbs,
} from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { EmblaCarousel } from "../ui/EmblaCarousel";

// Swiper CSS imports (if needed by Swiper React components)
import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/effect-cards";
import "swiper/css/effect-creative";
import "swiper/css/effect-fade";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/thumbs";
import "swiper/css/free-mode";

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
  price?: string | null;
  rating?: number | string | null;
  imagePadding?: "frameless" | "small" | "medium" | "max" | string | null;
};

export type CarouselSettings = {
  variant?: string | string[]; // ACF or Builder variant
  loop?: boolean;
  autoplay?: boolean;
  autoplayDelayMs?: number | string;
  speed?: number | string;
  align?: ("center" | "start") | string | string[];
  dragFree?: boolean;
  effect?: "slide" | "fade" | "coverflow" | "cards" | "creative" | string | null;
  spaceBetween?: number | string | null;
  coverflowRotate?: number | string | null;
  coverflowDepth?: number | string | null;
  coverflowStretch?: number | string | null;
  cardsRotate?: boolean | "true" | "false" | 1 | 0 | null;
  cardsShadows?: boolean | "true" | "false" | 1 | 0 | null;
  creativePreset?: "soft-stack" | "deep" | "scale" | "3d-flip" | string | null;
  fadeCrossFade?: boolean | "true" | "false" | 1 | 0 | null;
  freeModeMomentum?: boolean | "true" | "false" | 1 | 0 | null;
  cardsPerView?: number | null;
  showArrows?: boolean | "true" | "false" | 1 | 0 | null;
  showDots?: boolean | "true" | "false" | 1 | 0 | null;
  pauseOnHover?: boolean | "true" | "false" | 1 | 0 | null;
  arrowStyle?: "glass" | "dark" | "light" | "outer" | "hidden" | string | null;
  paginationStyle?: "bullets" | "expanding-bullets" | "progress" | "fraction" | "thumbs" | "hidden" | string | null;
  aspectRatio?: "auto" | "16:9" | "4:3" | "1:1" | "21:9" | "full" | string | null;
  overlayGradient?: "none" | "subtle" | "dark-glass" | "vibrant" | string | null;
  kenBurns?: boolean | "true" | "false" | 1 | 0 | null;
};

type CarouselBlockProps = {
  block?: any;
  slides: CarouselSlide[];
  settings?: CarouselSettings;
  className?: string;
};

export default function CarouselBlock({
  slides,
  settings,
  className,
}: CarouselBlockProps) {
  const [thumbsSwiper, setThumbsSwiper] = useState<any>(null);

  if (!slides || slides.length === 0) {
    return (
      <div className="p-8 text-center text-sm opacity-60 bg-neutral-100 rounded-2xl border border-neutral-200">
        [CarouselBlock] No slides configured. Add slides in the Inspector.
      </div>
    );
  }

  // Normalize variant: ACF/GraphQL may give us ["hero"] instead of "hero"
  const normalizedVariant =
    Array.isArray(settings?.variant)
      ? settings.variant[0] ?? "hero"
      : settings?.variant ?? "hero";

  const swiperVariant =
    normalizedVariant === "swiper-showcase" ? "showcase" : normalizedVariant;

  const normalizedAlign = (() => {
    const raw = Array.isArray(settings?.align)
      ? settings?.align?.[0]
      : (settings?.align as any);
    if (raw === "start" || raw === "center") return raw;
    return "center";
  })();

  const rawCardsPerView = settings?.cardsPerView ?? 1;
  const cardsPerView = Math.min(Math.max(Number(rawCardsPerView) || 1, 1), 6);

  const rawDelay = Number(settings?.autoplayDelayMs ?? 5000);
  const autoplayDelayMs = Math.min(Math.max(rawDelay || 5000, 1500), 30000);

  const transitionSpeedMs = Math.min(
    Math.max(Number(settings?.speed ?? 600) || 600, 200),
    3000
  );

  const rawSpaceBetween = Number(settings?.spaceBetween ?? (swiperVariant === "hero" ? 0 : 24));
  const spaceBetween = Math.min(Math.max(rawSpaceBetween, 0), 80);

  const numberSetting = (
    value: number | string | null | undefined,
    fallback: number,
    min: number,
    max: number
  ) => Math.min(Math.max(Number(value ?? fallback) || fallback, min), max);

  const booleanSetting = (
    value: boolean | "true" | "false" | 1 | 0 | null | undefined,
    fallback: boolean
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
  const swiperSlidesPerView = singleSlideEffect ? 1 : (swiperVariant === "hero" ? 1 : cardsPerView);

  const usesSwiper = [
    "hero",
    "showcase",
    "coverflow",
    "cards",
    "creative",
    "fade",
    "free-mode",
    "split",
    "thumbs",
    "multi-card",
    "marquee",
  ].includes(swiperVariant);

  const creativeEffect = (() => {
    switch (settings?.creativePreset) {
      case "deep":
        return {
          prev: { translate: ["-120%", 0, -500], rotate: [0, 0, -16], opacity: 0.3 },
          next: { translate: ["120%", 0, -500], rotate: [0, 0, 16], opacity: 0.3 },
        };
      case "scale":
        return {
          prev: { translate: ["-75%", 0, -250], scale: 0.75, opacity: 0.4 },
          next: { translate: ["75%", 0, -250], scale: 0.75, opacity: 0.4 },
        };
      case "3d-flip":
        return {
          prev: { translate: ["-100%", 0, 0], rotate: [0, 100, 0], opacity: 0.2 },
          next: { translate: ["100%", 0, 0], rotate: [0, -100, 0], opacity: 0.2 },
        };
      case "soft-stack":
      default:
        return {
          prev: { translate: ["-20%", 0, -160], scale: 0.88, opacity: 0.6 },
          next: { translate: ["20%", 0, -160], scale: 0.88, opacity: 0.6 },
        };
    }
  })();

  const arrowStyle = settings?.arrowStyle ?? "glass";
  const paginationStyle = settings?.paginationStyle ?? (swiperVariant === "hero" ? "expanding-bullets" : "bullets");
  const overlayGradient = settings?.overlayGradient ?? (swiperVariant === "hero" ? "dark-glass" : "none");
  const isKenBurns = booleanSetting(settings?.kenBurns, swiperVariant === "hero");
  const showArrows = settings?.showArrows !== false && arrowStyle !== "hidden";
  const showDots = settings?.showDots !== false && paginationStyle !== "hidden";
  const isMarquee = swiperVariant === "marquee";

  const getAspectRatioClass = () => {
    switch (settings?.aspectRatio) {
      case "16:9":
        return "aspect-[16/9]";
      case "4:3":
        return "aspect-[4/3]";
      case "1:1":
        return "aspect-square";
      case "21:9":
        return "aspect-[21/9]";
      case "full":
        return "min-h-[500px] md:min-h-[640px]";
      case "auto":
      default:
        return swiperVariant === "hero" ? "min-h-[420px] md:min-h-[520px]" : "auto";
    }
  };

  if (usesSwiper) {
    return (
      <div
        className={`shop-builder-swiper shop-builder-swiper--${swiperVariant} shop-builder-arrow--${arrowStyle} shop-builder-pag--${paginationStyle} ${className ?? ""}`.trim()}
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
            Thumbs,
          ]}
          slidesPerView={isMarquee ? "auto" : swiperSlidesPerView}
          spaceBetween={spaceBetween}
          effect={swiperEffect}
          speed={transitionSpeedMs}
          centeredSlides={swiperVariant === "coverflow" || isMarquee}
          thumbs={swiperVariant === "thumbs" && thumbsSwiper ? { swiper: thumbsSwiper } : undefined}
          freeMode={
            swiperVariant === "free-mode" || isMarquee
              ? {
                  enabled: true,
                  momentum: booleanSetting(settings?.freeModeMomentum, true),
                }
              : false
          }
          coverflowEffect={{
            rotate: numberSetting(settings?.coverflowRotate, 30, -90, 90),
            depth: numberSetting(settings?.coverflowDepth, 160, 0, 500),
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
          loop={slides.length > 1 && (settings?.loop ?? true)}
          autoplay={
            (isMarquee || booleanSetting(settings?.autoplay, true)) && slides.length > 1
              ? {
                  delay: isMarquee ? 0 : autoplayDelayMs,
                  disableOnInteraction: false,
                  pauseOnMouseEnter: booleanSetting(settings?.pauseOnHover, true),
                }
              : false
          }
          navigation={showArrows}
          pagination={
            showDots
              ? {
                  clickable: true,
                  type: paginationStyle === "progress" ? "progressbar" : paginationStyle === "fraction" ? "fraction" : "bullets",
                  dynamicBullets: paginationStyle === "expanding-bullets",
                }
              : false
          }
          breakpoints={
            !singleSlideEffect && swiperVariant !== "hero"
              ? {
                  640: {
                    slidesPerView: Math.min(cardsPerView, 2),
                    spaceBetween,
                  },
                  860: {
                    slidesPerView: Math.min(cardsPerView, 3),
                    spaceBetween,
                  },
                  1180: {
                    slidesPerView: cardsPerView,
                    spaceBetween,
                  },
                }
              : undefined
          }
          className={`w-full ${getAspectRatioClass()}`}
        >
          {slides.map((slide, idx) => (
            <SwiperSlide key={slide.id || idx}>
              <article
                className={`shop-builder-swiper-slide-card shop-builder-swiper-slide--${swiperVariant} ${
                  overlayGradient !== "none" ? `shop-builder-overlay--${overlayGradient}` : ""
                }`}
              >
                {slide.imageUrl ? (
                  <div className={`shop-builder-swiper-media ${isKenBurns ? "is-ken-burns" : ""}`}>
                    <Image
                      src={slide.imageUrl}
                      alt={slide.imageAlt ?? slide.title ?? ""}
                      fill
                      className="object-cover"
                      sizes="(min-width: 1180px) 50vw, 100vw"
                      priority={idx === 0}
                    />
                    {overlayGradient !== "none" && (
                      <div className={`shop-builder-media-overlay shop-builder-media-overlay--${overlayGradient}`} />
                    )}
                  </div>
                ) : (
                  <div className="shop-builder-swiper-media shop-builder-swiper-media--placeholder">
                    <svg viewBox="0 0 800 520" preserveAspectRatio="none" fill="none" className="w-full h-full">
                      <rect width="800" height="520" fill="#EEF1F6"/>
                      <circle cx="760" cy="40" r="230" fill="#FFFFFF" fillOpacity="0.5"/>
                      <rect x="24" y="24" width="752" height="472" rx="18" fill="none" stroke="#CBD5E1" strokeWidth="2" strokeDasharray="6 6"/>
                    </svg>
                  </div>
                )}

                {/* Content Overlay */}
                {(slide.badge || slide.title || slide.subtitle || slide.text || slide.buttonLabel || slide.price) && (
                  <div className="shop-builder-swiper-content">
                    {slide.badge && (
                      <span className="shop-builder-swiper-badge">
                        {slide.badge}
                      </span>
                    )}

                    {slide.title && (
                      <h3 className="shop-builder-swiper-title">
                        {slide.title}
                      </h3>
                    )}

                    {(slide.subtitle || slide.text) && (
                      <p className="shop-builder-swiper-text">
                        {slide.subtitle || slide.text}
                      </p>
                    )}

                    {slide.price && (
                      <div className="shop-builder-swiper-price">{slide.price}</div>
                    )}

                    {slide.buttonLabel && slide.buttonUrl && (
                      <a
                        href={slide.buttonUrl}
                        className="shop-builder-swiper-btn"
                      >
                        <span>{slide.buttonLabel}</span>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                      </a>
                    )}
                  </div>
                )}
              </article>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Thumbnail Filmstrip Bar for "thumbs" preset */}
        {swiperVariant === "thumbs" && slides.length > 1 && (
          <div className="shop-builder-thumbs-wrapper mt-4">
            <Swiper
              onSwiper={setThumbsSwiper}
              spaceBetween={12}
              slidesPerView={Math.min(slides.length, 6)}
              freeMode={true}
              watchSlidesProgress={true}
              modules={[FreeMode, Navigation, Thumbs]}
              className="shop-builder-thumbs-swiper"
            >
              {slides.map((slide, idx) => (
                <SwiperSlide key={`thumb-${slide.id || idx}`}>
                  <div className="shop-builder-thumb-item">
                    {slide.imageUrl ? (
                      <Image
                        src={slide.imageUrl}
                        alt={slide.imageAlt || ""}
                        fill
                        className="object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-full h-full bg-neutral-200 rounded-lg flex items-center justify-center text-xs text-neutral-500">
                        #{idx + 1}
                      </div>
                    )}
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        )}
      </div>
    );
  }

  // Fallback to Embla
  const options = {
    loop: slides.length > cardsPerView && (settings?.loop ?? true),
    align: normalizedAlign,
    dragFree: settings?.dragFree ?? false,
  };

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

  return (
    <div className={`relative w-full ${className ?? ""}`.trim()}>
      <EmblaCarousel
        options={options}
        autoplay={booleanSetting(settings?.autoplay, true)}
        autoplayDelayMs={autoplayDelayMs}
        pauseOnHover={booleanSetting(settings?.pauseOnHover, true)}
        showArrows={settings?.showArrows !== false}
        showDots={settings?.showDots !== false}
        className="w-full"
      >
        {slides.map((slide) => (
          <div
            key={slide.id}
            className={`min-w-0 ${itemWidthClasses} px-2 md:px-4`}
          >
            <div className="relative w-full overflow-hidden rounded-2xl bg-neutral-900 text-neutral-50 flex flex-col min-h-[320px] justify-end p-6 md:p-10">
              {slide.imageUrl && (
                <>
                  <Image
                    src={slide.imageUrl}
                    alt={slide.imageAlt ?? ""}
                    fill
                    className="object-cover opacity-70"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                </>
              )}
              <div className="relative z-10 flex flex-col gap-3">
                {slide.badge && (
                  <span className="inline-flex items-center rounded-full bg-white/20 backdrop-blur-md px-3 py-1 text-xs font-semibold text-white w-fit">
                    {slide.badge}
                  </span>
                )}
                {slide.title && (
                  <h2 className="text-xl md:text-3xl font-bold tracking-tight text-white">
                    {slide.title}
                  </h2>
                )}
                {(slide.subtitle || slide.text) && (
                  <p className="text-sm md:text-base text-neutral-200 max-w-xl">
                    {slide.subtitle || slide.text}
                  </p>
                )}
                {slide.buttonLabel && slide.buttonUrl && (
                  <div className="mt-2">
                    <a
                      href={slide.buttonUrl}
                      className="inline-flex items-center justify-center rounded-lg bg-white text-neutral-900 px-5 py-2.5 text-sm font-semibold shadow-md hover:bg-neutral-100 transition"
                    >
                      {slide.buttonLabel}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </EmblaCarousel>
    </div>
  );
}
