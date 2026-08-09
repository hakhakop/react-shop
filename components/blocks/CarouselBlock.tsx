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
import { ImageIcon, Upload } from "lucide-react";
import {
  getUikitButtonClass,
  getUikitCardClass,
  getUikitHeadingClass,
  getUikitImageClass,
  getUikitImageStyle,
  getUikitImageWrapperClass,
  getUikitPanelMediaStyle,
  getUikitTextClass,
  resolveUikitImageSemantics,
} from "@/lib/uikitTokens";
import { typographyRoleClass, type SemanticTypographyRole } from "@/lib/builderTypography";
import { builderLinkTargetProps } from "@/lib/websiteBuilderLinks";
import { WebPagesIcon } from "@/components/builder/WebPagesIcon";

// Swiper core & module styles
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
  imageUrl?: string | null;
  imageAlt?: string | null;
  title?: string | null;
  meta?: string | null;
  subtitle?: string | null;
  text?: string | null;
  buttonLabel?: string | null;
  buttonUrl?: string | null;
  buttonTarget?: string | null;
  badge?: string | null;
  price?: string | null;
  rating?: number | string | null;
  imagePadding?: "frameless" | "small" | "medium" | "max" | string | null;
  panelStyle?: string | null;
  panelSize?: string | null;
  panelHover?: boolean | null;
  linkPanel?: boolean | null;
  headingLevel?: string | null;
  headingSize?: string | null;
  titleTypographyRole?: string | null;
  headingAlign?: string | null;
  titleDecoration?: string | null;
  titleColor?: string | null;
  metaTypographyRole?: string | null;
  metaAlign?: string | null;
  metaHtmlElement?: string | null;
  metaStyle?: string | null;
  metaColor?: string | null;
  gridMetaAlign?: string | null;
  contentTypographyRole?: string | null;
  contentAlign?: string | null;
  contentStyle?: string | null;
  imageFit?: string | null;
  imageRatio?: string | null;
  imageShape?: string | null;
  imageShadow?: string | null;
  imageAlignment?: string | null;
  imagePosition?: string | null;
  imageLoading?: "lazy" | "eager" | string | null;
  imageWidth?: string | null;
  imageHeight?: string | number | null;
  imageBorder?: string | null;
  imageBoxShadow?: string | null;
  iconName?: string | null;
  iconSize?: number | null;
  showAction?: boolean | null;
  fullWidthButton?: boolean | null;
  buttonStyle?: string | null;
  buttonSize?: string | null;
};

export type CarouselSettings = {
  variant?: string | string[];
  slideMode?: "auto" | "image-only" | "hero" | "card" | string | null;
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
  arrowStyle?: "chevron" | "glass-circle" | "solid-dark" | "minimal-light" | "outer" | "hidden" | string | null;
  arrowPosition?: "overlay" | "outer" | "bottom" | "bottom-right" | "bottom-left" | "top-right" | "top-left" | string | null;
  paginationStyle?: "simple-dots" | "minimal-dots" | "expanding-pills" | "fraction" | "progress" | "thumbs" | "hidden" | string | null;
  paginationPosition?: "bottom" | "top" | "overlay" | string | null;
  aspectRatio?: "auto" | "16:9" | "4:3" | "1:1" | "21:9" | "full" | string | null;
  overlayGradient?: "none" | "subtle" | "dark-glass" | "vibrant" | string | null;
  overlayPosition?: "bottom-left" | "bottom-center" | "bottom-right" | "center" | "top-left" | "top-right" | string | null;
  overlayColor?: "dark" | "light" | "glass-dark" | "glass-light" | "brand" | string | null;
  overlayTextColor?: "auto" | "light" | "dark" | "brand" | string | null;
  kenBurns?: boolean | "true" | "false" | 1 | 0 | null;
  headingLevel?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | string | null;
  headingSize?: string | null;
  titleTypographyRole?: string | null;
  metaTypographyRole?: string | null;
  metaStyle?: string | null;
  contentTypographyRole?: string | null;
  contentStyle?: string | null;
  buttonStyle?: string | null;
  buttonSize?: string | null;
  linkTarget?: string | null;
  panelStyle?: string | null;
  panelSize?: string | null;
  panelHover?: boolean | null;
  linkPanel?: boolean | null;
  imageWidth?: string | null;
  imageHeight?: string | number | null;
  imageRatio?: string | null;
  imageFit?: string | null;
  imageShape?: string | null;
  imageShadow?: string | null;
  imageLoading?: string | null;
  imageAlignment?: string | null;
  imageBoxDecoration?: string | null;
  alignImageWithoutPadding?: boolean | null;
};

function resolveImageLoading(
  value: CarouselSlide["imageLoading"] | undefined,
  fallback: "lazy" | "eager",
): "lazy" | "eager" {
  return value === "eager" || value === "lazy" ? value : fallback;
}

type CarouselBlockProps = {
  block?: any;
  slides: CarouselSlide[];
  settings?: CarouselSettings;
  className?: string;
  onUploadSlideImage?: (slideIndex: number, currentUrl?: string) => void;
};

function isPlaceholderSvgUrl(url?: string | null): boolean {
  if (!url || !url.trim()) return true;
  return url.includes("builder-image-placeholder.svg");
}

function toCssDimension(value?: string | number | null): string | undefined {
  if (value === undefined || value === null || value === "" || value === "auto") return undefined;
  return typeof value === "number" ? `${value}px` : value;
}

function getUikitTextColorClass(value?: string | null): string {
  if (!value || value === "none" || value === "default" || value === "inherit") return "";
  return value.startsWith("uk-text-") ? value : `uk-text-${value}`;
}

export default function CarouselBlock({
  slides,
  settings,
  className,
  onUploadSlideImage,
}: CarouselBlockProps) {
  const [mainSwiper, setMainSwiper] = useState<any>(null);
  const [thumbsSwiper, setThumbsSwiper] = useState<any>(null);

  if (!slides || slides.length === 0) {
    return (
      <div className="p-8 text-center text-sm opacity-60 bg-neutral-100 rounded-2xl border border-neutral-200">
        [CarouselBlock] No slides configured.
      </div>
    );
  }

  const normalizedVariant = Array.isArray(settings?.variant)
    ? settings.variant[0] ?? "hero"
    : settings?.variant ?? "hero";

  const swiperVariant =
    normalizedVariant === "swiper-showcase" ? "showcase" : normalizedVariant;

  const rawCardsPerView = settings?.cardsPerView ?? 1;
  const cardsPerView = Math.min(Math.max(Number(rawCardsPerView) || 1, 1), 6);

  const rawDelay = Number(settings?.autoplayDelayMs ?? 5000);
  const autoplayDelayMs = Math.min(Math.max(rawDelay || 5000, 1000), 30000);

  const transitionSpeedMs =
    swiperVariant === "marquee"
      ? Math.max(Number(settings?.speed ?? 5000) || 5000, 1500)
      : Math.min(Math.max(Number(settings?.speed ?? 600) || 600, 150), 3000);

  const rawSpaceBetween = Number(
    settings?.spaceBetween ?? (swiperVariant === "hero" ? 0 : 20)
  );
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
    if (swiperVariant === "coverflow" || swiperVariant === "showcase") return "coverflow";
    if (swiperVariant === "cards") return "cards";
    if (swiperVariant === "creative") return "creative";
    if (swiperVariant === "fade" || settings?.effect === "fade") return "fade";
    return "slide";
  })();

  const is3DEffect = ["cards", "creative", "coverflow"].includes(swiperEffect);
  const isHeroOrFadeMode = swiperVariant === "hero" || swiperVariant === "fade";
  const isMarquee = swiperVariant === "marquee";
  const isFreeMode = swiperVariant === "free-mode";

  const swiperSlidesPerView =
    is3DEffect || isHeroOrFadeMode
      ? 1
      : isMarquee
      ? "auto"
      : isFreeMode || swiperVariant === "multi-card"
      ? cardsPerView
      : cardsPerView;

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

  const arrowStyle = settings?.arrowStyle ?? "chevron";
  const arrowPosition = settings?.arrowPosition ?? "overlay";
  const paginationStyle = settings?.paginationStyle ?? "minimal-dots";
  const paginationPosition = settings?.paginationPosition ?? "bottom";
  const overlayGradient = settings?.overlayGradient ?? "none";
  const overlayPosition = settings?.overlayPosition ?? "bottom-left";
  const overlayColor = settings?.overlayColor ?? "dark";
  const overlayTextColor = settings?.overlayTextColor ?? "auto";
  const isKenBurns = booleanSetting(settings?.kenBurns, false);
  // arrowStyle="hidden" or showArrows===false both suppress arrows
  const showArrows =
    arrowStyle !== "hidden" && booleanSetting(settings?.showArrows, true);
  // paginationStyle="hidden" or showDots===false both suppress dots
  const showDots =
    paginationStyle !== "hidden" && booleanSetting(settings?.showDots, true);

  const explicitSlideMode = settings?.slideMode ?? "auto";
  const headingLevel = settings?.headingLevel ?? undefined;
  const headingSize = settings?.headingSize ?? undefined;
  const titleRole = settings?.titleTypographyRole as SemanticTypographyRole | undefined;
  const metaRole = settings?.metaTypographyRole as SemanticTypographyRole | undefined;
  const contentRole = settings?.contentTypographyRole as SemanticTypographyRole | undefined;
  const SlideTitle = (headingLevel ?? "h3") as React.ElementType;
  const titleClass = getUikitHeadingClass(headingLevel ?? "h3", headingSize);
  const metaClass = getUikitTextClass(settings?.metaStyle ?? undefined);
  const contentClass = getUikitTextClass(settings?.contentStyle ?? undefined);
  const buttonClass = getUikitButtonClass(settings?.buttonStyle ?? undefined, settings?.buttonSize ?? undefined);

  // Unique React key — includes every Swiper structural prop so it remounts cleanly
  // when variant, nav visibility, pagination type, or effects change
  const swiperKey = [
    swiperVariant,
    swiperEffect,
    slides.length,
    cardsPerView,
    explicitSlideMode,
    arrowPosition,
    overlayPosition,
    overlayColor,
    overlayTextColor,
    settings?.creativePreset ?? "default",
    showArrows ? `nav-${arrowPosition}` : "no-nav",
    showDots ? `${paginationStyle}-${paginationPosition}` : "no-pag",
  ].join("-");

  const aspectRatioClass = settings?.aspectRatio && settings.aspectRatio !== "auto"
    ? `shop-builder-aspect--${settings.aspectRatio.replace(":", "-")}`
    : "";

  return (
    <div
      className={[
        "shop-builder-swiper",
        `shop-builder-swiper--${swiperVariant}`,
        `shop-builder-arrow--${arrowStyle}`,
        showArrows ? `shop-builder-arrow-pos--${arrowPosition}` : "",
        `shop-builder-pag--${paginationStyle}`,
        `shop-builder-pag-pos--${paginationPosition}`,
        aspectRatioClass,
        is3DEffect ? "shop-builder-swiper--3d" : "",
        className ?? "",
      ].filter(Boolean).join(" ")}
    >
      <Swiper
        key={swiperKey}
        onSwiper={setMainSwiper}
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
        observer={true}
        observeParents={true}
        slidesPerView={swiperSlidesPerView}
        spaceBetween={spaceBetween}
        effect={swiperEffect}
        speed={transitionSpeedMs}
        centeredSlides={swiperVariant === "coverflow" || swiperVariant === "showcase" || isMarquee}
        thumbs={
          swiperVariant === "thumbs" && thumbsSwiper && !thumbsSwiper.destroyed
            ? { swiper: thumbsSwiper }
            : undefined
        }
        freeMode={
          isFreeMode
            ? {
                enabled: true,
                momentum: booleanSetting(settings?.freeModeMomentum, true),
                sticky: false,
              }
            : isMarquee
            ? {
                enabled: true,
                momentum: false,
              }
            : false
        }
        coverflowEffect={{
          rotate: numberSetting(settings?.coverflowRotate, 28, -90, 90),
          depth: numberSetting(settings?.coverflowDepth, 140, 0, 500),
          stretch: numberSetting(settings?.coverflowStretch, 0, -120, 120),
          modifier: 1,
          slideShadows: false,
        }}
        cardsEffect={{
          rotate: booleanSetting(settings?.cardsRotate, true),
          slideShadows: false,
        }}
        creativeEffect={creativeEffect}
        fadeEffect={{ crossFade: booleanSetting(settings?.fadeCrossFade, true) }}
        loop={!is3DEffect && slides.length > 1 && (settings?.loop ?? true)}
        rewind={is3DEffect && slides.length > 1}
        autoplay={
          (isMarquee || booleanSetting(settings?.autoplay, false)) && slides.length > 1
            ? {
                delay: isMarquee ? 0 : autoplayDelayMs,
                disableOnInteraction: false,
                pauseOnMouseEnter: isMarquee ? false : booleanSetting(settings?.pauseOnHover, true),
              }
            : false
        }
        navigation={showArrows}
        pagination={
          showDots
            ? {
                clickable: true,
                type:
                  paginationStyle === "progress"
                    ? "progressbar"
                    : paginationStyle === "fraction"
                    ? "fraction"
                    : "bullets",
                dynamicBullets: paginationStyle === "expanding-pills",
              }
            : false
        }
        breakpoints={
          !is3DEffect && !isHeroOrFadeMode && !isMarquee
            ? {
                320: {
                  slidesPerView: 1,
                  spaceBetween: 12,
                },
                640: {
                  slidesPerView: Math.min(cardsPerView, 2),
                  spaceBetween: Math.min(spaceBetween, 16),
                },
                1024: {
                  slidesPerView: cardsPerView,
                  spaceBetween,
                },
              }
            : undefined
        }
        className="w-full"
      >
        {slides.map((slide, idx) => {
          const hasRealImage = Boolean(slide.imageUrl && slide.imageUrl.trim());
          const hasTextContent = Boolean(
            slide.title?.trim() || slide.subtitle?.trim() || slide.text?.trim() || slide.buttonLabel?.trim()
          );

          // Decide effective slide mode
          const effectiveMode =
            explicitSlideMode === "panel"
              ? "panel"
              : explicitSlideMode === "image-only"
              ? "image-only"
              : explicitSlideMode === "hero"
              ? "hero"
              : explicitSlideMode === "overlay"
              ? "overlay"
              : explicitSlideMode === "glass-card"
              ? "glass-card"
              : explicitSlideMode === "card"
              ? "card"
              : !hasTextContent
              ? "image-only"
              : isHeroOrFadeMode
              ? "hero"
              : "card";

          if (effectiveMode === "panel") {
            const panelClass = getUikitCardClass(slide.panelStyle ?? "default", {
              hover: slide.panelHover ? "hover" : "none",
              padding: slide.panelSize ?? "default",
            });
            const itemImage = resolveUikitImageSemantics({
              imageFit: slide.imageFit ?? undefined,
              imageRatio: slide.imageRatio ?? undefined,
              imageShape: slide.imageShape ?? undefined,
              imageShadow: slide.imageShadow ?? undefined,
              imageAlignment: slide.imageAlignment ?? undefined,
              imagePosition: slide.imagePosition ?? undefined,
              imageWidth: slide.imageWidth ?? undefined,
              imageBorder: slide.imageBorder ?? undefined,
              imageBoxShadow: slide.imageBoxShadow ?? undefined,
            });
            const itemImageStyle = getUikitImageStyle(itemImage);
            const itemMediaStyle = getUikitPanelMediaStyle({
              ratio: itemImage.ratio,
              fit: itemImage.fit === "cover" || itemImage.fit === "contain" || itemImage.fit === "fill"
                ? itemImage.fit
                : "natural",
              alignment:
                itemImage.alignment === "left" || itemImage.alignment === "center" || itemImage.alignment === "right"
                  ? itemImage.alignment
                  : undefined,
              position: itemImage.position,
            });
            const ItemTitle = (slide.headingLevel ?? headingLevel ?? "h3") as React.ElementType;
            const itemTitleClass = getUikitHeadingClass(
              slide.headingLevel ?? headingLevel ?? "h3",
              slide.headingSize ?? headingSize,
            );
            const itemTitleRole = (slide.titleTypographyRole ?? titleRole) as SemanticTypographyRole | undefined;
            const itemMetaRole = (slide.metaTypographyRole ?? metaRole) as SemanticTypographyRole | undefined;
            const itemContentRole = (slide.contentTypographyRole ?? contentRole) as SemanticTypographyRole | undefined;
            const itemMetaClass = getUikitTextClass(slide.metaStyle ?? settings?.metaStyle ?? undefined);
            const itemContentClass = getUikitTextClass(slide.contentStyle ?? settings?.contentStyle ?? undefined);
            const itemButtonClass = getUikitButtonClass(
              slide.buttonStyle ?? settings?.buttonStyle ?? undefined,
              slide.buttonSize ?? settings?.buttonSize ?? undefined,
            );
            const itemMeta = slide.meta ?? slide.subtitle;
            const metaPosition = slide.gridMetaAlign ?? "below-title";
            const textAlign = slide.contentAlign ?? slide.headingAlign ?? "left";
            const titleColorClass = getUikitTextColorClass(slide.titleColor);
            const metaColorClass = getUikitTextColorClass(slide.metaColor);
            const titleDecorationClass =
              slide.titleDecoration && slide.titleDecoration !== "none"
                ? `uk-heading-${slide.titleDecoration}`
                : "";
            const panelLinkProps = builderLinkTargetProps(slide.buttonTarget || settings?.linkTarget);
            const panelLinkUrl = slide.buttonUrl || "#";
            const hasAction = slide.showAction !== false && Boolean(slide.buttonLabel);
            const mediaStyle: React.CSSProperties = {
              aspectRatio: itemMediaStyle.aspectRatio ?? itemImageStyle.aspectRatio,
              height: toCssDimension(slide.imageHeight),
              maxWidth: itemImageStyle.maxWidth,
              width: itemImageStyle.width ?? "100%",
            };
            const MetaElement = (slide.metaHtmlElement ?? "div") as React.ElementType;

            const renderMeta = () =>
              itemMeta ? (
                <MetaElement
                  className={`${itemMetaClass} ${typographyRoleClass(itemMetaRole)} ${metaColorClass}`.trim()}
                >
                  {itemMeta}
                </MetaElement>
              ) : null;

            const renderTitle = () =>
              slide.title ? (
                <ItemTitle
                  className={`${itemTitleClass} ${typographyRoleClass(itemTitleRole)} ${titleColorClass} ${titleDecorationClass}`.trim()}
                >
                  {slide.linkPanel ? (
                    <a href={panelLinkUrl} {...panelLinkProps}>{slide.title}</a>
                  ) : (
                    slide.title
                  )}
                </ItemTitle>
              ) : null;

            return (
              <SwiperSlide key={slide.id || idx}>
                <article className={`shop-builder-panel-slider-card ${panelClass}`.trim()}>
                  {hasRealImage ? (
                    <div
                      className={`shop-builder-panel-slider-media ${getUikitImageWrapperClass(itemImage)}`.trim()}
                      style={mediaStyle}
                    >
                      {slide.linkPanel ? (
                        <a href={panelLinkUrl} {...panelLinkProps} className="shop-builder-panel-slider-media-link">
                          <img
                            src={slide.imageUrl!}
                            alt={slide.imageAlt ?? slide.title ?? ""}
                            className={getUikitImageClass(itemImage)}
                            style={{
                              position: itemImageStyle.position,
                              inset: itemImageStyle.inset,
                              width: "100%",
                              height: "100%",
                              objectFit: itemImageStyle.objectFit,
                              objectPosition: itemMediaStyle.backgroundPosition,
                            }}
                            loading={resolveImageLoading(slide.imageLoading, idx === 0 ? "eager" : "lazy")}
                          />
                        </a>
                      ) : (
                        <img
                          src={slide.imageUrl!}
                          alt={slide.imageAlt ?? slide.title ?? ""}
                          className={getUikitImageClass(itemImage)}
                          style={{
                            position: itemImageStyle.position,
                            inset: itemImageStyle.inset,
                            width: "100%",
                            height: "100%",
                            objectFit: itemImageStyle.objectFit,
                            objectPosition: itemMediaStyle.backgroundPosition,
                          }}
                          loading={resolveImageLoading(slide.imageLoading, idx === 0 ? "eager" : "lazy")}
                        />
                      )}
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="shop-builder-panel-slider-placeholder"
                      onClick={() => onUploadSlideImage?.(idx, slide.imageUrl ?? undefined)}
                    >
                      <ImageIcon className="w-8 h-8" />
                      <span>{onUploadSlideImage ? "Select image" : "No image"}</span>
                    </button>
                  )}

                  <div
                    className="uk-card-body shop-builder-panel-slider-body"
                    style={{ textAlign: textAlign as React.CSSProperties["textAlign"] }}
                  >
                    {slide.iconName && (
                      <WebPagesIcon
                        name={slide.iconName}
                        size={slide.iconSize ?? 24}
                        className="shop-builder-panel-slider-icon"
                      />
                    )}
                    {metaPosition === "above-title" && renderMeta()}
                    {renderTitle()}
                    {metaPosition !== "above-title" && metaPosition !== "below-content" && renderMeta()}
                    {slide.text && (
                      <div className={`${itemContentClass} ${typographyRoleClass(itemContentRole)}`.trim()}>
                        {slide.text}
                      </div>
                    )}
                    {metaPosition === "below-content" && renderMeta()}
                    {hasAction && (
                      <a
                        href={panelLinkUrl}
                        className={`${itemButtonClass} shop-builder-panel-slider-action ${slide.fullWidthButton ? "uk-width-1-1" : ""}`.trim()}
                        {...panelLinkProps}
                      >
                        {slide.buttonLabel}
                      </a>
                    )}
                  </div>
                </article>
              </SwiperSlide>
            );
          }

          if (effectiveMode === "image-only") {
            // MODE 1: Pure Image Showcase (Swiper Official Demo Style)
            return (
              <SwiperSlide key={slide.id || idx}>
                <article className="shop-builder-image-slide-card group">
                  {hasRealImage ? (
                    <div
                      className={`relative w-full h-full ${settings?.aspectRatio ? "" : "min-h-[240px] md:min-h-[320px]"} overflow-hidden rounded-2xl cursor-pointer`}
                      onClick={() => onUploadSlideImage?.(idx, slide.imageUrl ?? undefined)}
                    >
                      <Image
                        src={slide.imageUrl!}
                        alt={slide.imageAlt ?? slide.title ?? ""}
                        fill
                        className={`object-cover transition-transform duration-700 group-hover:scale-105 ${isKenBurns ? "is-ken-burns" : ""}`}
                        sizes="(min-width: 1180px) 100vw, 100vw"
                        priority={idx === 0}
                      />
                      {onUploadSlideImage && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onUploadSlideImage(idx, slide.imageUrl ?? undefined);
                          }}
                          className="absolute top-3 right-3 z-20 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-md text-white text-xs font-semibold hover:bg-slate-900 transition shadow-md cursor-pointer"
                        >
                          <Upload size={13} />
                          <span>Change Image</span>
                        </button>
                      )}
                      {overlayGradient !== "none" && (
                        <div className={`shop-builder-media-overlay shop-builder-media-overlay--${overlayGradient}`} />
                      )}
                      {(slide.title || slide.badge) && (
                        <div className="absolute bottom-4 left-4 z-10 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-semibold">
                          {slide.badge && <span className="opacity-75">{slide.badge}</span>}
                          {slide.title && (
                            <SlideTitle className={`${titleClass} ${typographyRoleClass(titleRole)}`.trim()}>
                              {slide.title}
                            </SlideTitle>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div
                      className="shop-builder-image-slide-placeholder min-h-[380px] md:min-h-[480px] rounded-2xl flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-slate-900 via-slate-850 to-slate-950 border border-slate-800/80 cursor-pointer hover:border-indigo-500/50 transition-all duration-300 group shadow-lg"
                      onClick={() => onUploadSlideImage?.(idx, slide.imageUrl ?? undefined)}
                    >
                      <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 flex items-center justify-center text-white/70 group-hover:scale-110 group-hover:bg-white/20 group-hover:text-white transition-all">
                        <ImageIcon className="w-6 h-6" />
                      </div>
                      <span className="text-xs font-semibold tracking-wider text-slate-300 group-hover:text-white transition-colors uppercase">
                        + Select Slide Image
                      </span>
                    </div>
                  )}
                </article>
              </SwiperSlide>
            );
          }

          if (effectiveMode === "overlay" || effectiveMode === "glass-card") {
            // Determine position class
            const posClass =
              overlayPosition === "bottom-center"
                ? "absolute bottom-4 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:max-w-md items-center text-center"
                : overlayPosition === "bottom-right"
                ? "absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md items-end text-right"
                : overlayPosition === "center"
                ? "absolute top-1/2 -translate-y-1/2 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:max-w-md items-center text-center"
                : overlayPosition === "top-left"
                ? "absolute top-4 left-4 right-4 md:right-auto md:max-w-md items-start text-left"
                : overlayPosition === "top-right"
                ? "absolute top-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md items-end text-right"
                : "absolute bottom-4 left-4 right-4 md:right-auto md:max-w-md items-start text-left";

            // Determine backdrop style
            const isLightBg = overlayColor === "light" || overlayColor === "glass-light";
            const backdropClass =
              effectiveMode === "glass-card"
                ? isLightBg
                  ? "bg-white/85 backdrop-blur-xl border border-slate-200/80 shadow-2xl p-5 md:p-6 rounded-2xl"
                  : overlayColor === "brand"
                  ? "bg-indigo-950/80 backdrop-blur-xl border border-indigo-400/30 shadow-2xl p-5 md:p-6 rounded-2xl"
                  : "bg-slate-900/75 backdrop-blur-xl border border-white/20 shadow-2xl p-5 md:p-6 rounded-2xl"
                : isLightBg
                ? "bg-gradient-to-t from-white/95 via-white/75 to-transparent p-6 md:p-8"
                : overlayColor === "brand"
                ? "bg-gradient-to-t from-indigo-950/95 via-indigo-900/50 to-transparent p-6 md:p-8"
                : "bg-gradient-to-t from-black/90 via-black/40 to-transparent p-6 md:p-8";

            // Color-aware text classes
            const effectiveTextColor =
              overlayTextColor === "auto" || !overlayTextColor
                ? isLightBg
                  ? "dark"
                  : "light"
                : overlayTextColor;

            const textColors =
              effectiveTextColor === "dark"
                ? {
                    title: "text-slate-900 font-bold",
                    text: "text-slate-600 font-medium opacity-90",
                    badge: "bg-slate-100 text-slate-800 border border-slate-200 font-semibold px-3 py-1 rounded-full text-xs",
                    price: "text-emerald-600 font-bold",
                    btn: "bg-slate-900 text-white hover:bg-slate-800 shadow-md px-4 py-2 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 transition",
                  }
                : effectiveTextColor === "brand"
                ? {
                    title: "text-indigo-900 dark:text-indigo-200 font-bold",
                    text: "text-indigo-700 dark:text-indigo-300 font-medium opacity-90",
                    badge: "bg-indigo-100 text-indigo-800 border border-indigo-200 font-semibold px-3 py-1 rounded-full text-xs",
                    price: "text-emerald-500 font-bold",
                    btn: "bg-indigo-600 text-white hover:bg-indigo-700 shadow-md px-4 py-2 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 transition",
                  }
                : {
                    title: "text-white font-bold",
                    text: "text-white/85 font-medium opacity-90",
                    badge: "bg-white/15 backdrop-blur-md text-white border border-white/20 font-semibold px-3 py-1 rounded-full text-xs",
                    price: "text-emerald-400 font-bold",
                    btn: "bg-white text-slate-900 hover:bg-slate-100 shadow-lg px-4 py-2 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 transition",
                  };

            return (
              <SwiperSlide key={slide.id || idx}>
                <article className={`shop-builder-overlay-slide-card group relative w-full ${settings?.aspectRatio ? "" : "min-h-[240px] md:min-h-[320px]"} overflow-hidden rounded-2xl`}>
                  {hasRealImage ? (
                    <>
                      <Image
                        src={slide.imageUrl!}
                        alt={slide.imageAlt ?? slide.title ?? ""}
                        fill
                        className={`object-cover transition-transform duration-700 group-hover:scale-105 ${isKenBurns ? "is-ken-burns" : ""}`}
                        sizes="(min-width: 1180px) 50vw, 100vw"
                        priority={idx === 0}
                      />
                      {onUploadSlideImage && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onUploadSlideImage(idx, slide.imageUrl ?? undefined);
                          }}
                          className="absolute top-3 right-3 z-20 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-md text-white text-xs font-semibold hover:bg-slate-900 transition shadow-md cursor-pointer"
                        >
                          <Upload size={13} />
                          <span>Change Image</span>
                        </button>
                      )}
                      <div className={`shop-builder-media-overlay shop-builder-media-overlay--${overlayGradient !== "none" ? overlayGradient : "subtle"}`} />
                    </>
                  ) : (
                    <div
                      className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-850 to-slate-950 border border-slate-800/80 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-indigo-500/50 transition-all duration-300 group"
                      onClick={() => onUploadSlideImage?.(idx, slide.imageUrl ?? undefined)}
                    >
                      <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 flex items-center justify-center text-white/70 group-hover:scale-110 group-hover:bg-white/20 group-hover:text-white transition-all">
                        <ImageIcon className="w-6 h-6" />
                      </div>
                      <span className="text-xs font-semibold tracking-wider text-slate-300 group-hover:text-white transition-colors uppercase">+ Select Slide Image</span>
                    </div>
                  )}

                  {/* Dynamic Color-Aware & Positioned Text Overlay */}
                  <div className={`z-10 flex flex-col gap-2.5 ${posClass} ${backdropClass}`}>
                    {slide.badge && (
                      <span className={textColors.badge}>
                        {slide.badge}
                      </span>
                    )}
                    {slide.title && (
                      <SlideTitle className={`${titleClass} ${typographyRoleClass(titleRole)} ${textColors.title}`.trim()}>
                        {slide.title}
                      </SlideTitle>
                    )}
                    {slide.subtitle && (
                      <div className={`${metaClass} ${typographyRoleClass(metaRole)} ${textColors.text}`.trim()}>
                        {slide.subtitle}
                      </div>
                    )}
                    {slide.text && (
                      <div className={`${contentClass} ${typographyRoleClass(contentRole)} text-xs md:text-sm line-clamp-3 ${textColors.text}`.trim()}>
                        {slide.text}
                      </div>
                    )}
                    {slide.price && (
                      <div className={`text-lg ${textColors.price}`}>
                        {slide.price}
                      </div>
                    )}
                    {slide.buttonLabel && slide.buttonUrl && (
                      <a
                        href={slide.buttonUrl}
                        className={buttonClass}
                        {...builderLinkTargetProps(slide.buttonTarget || settings?.linkTarget)}
                      >
                        <span>{slide.buttonLabel}</span>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                      </a>
                    )}
                  </div>
                </article>
              </SwiperSlide>
            );
          }

          if (effectiveMode === "hero") {
            // MODE 2: Full-bleed Hero Banner Slide (Clean Text Overlay over Image)
            return (
              <SwiperSlide key={slide.id || idx}>
                <article className="shop-builder-hero-slide-card">
                  {hasRealImage ? (
                    <div className="shop-builder-swiper-media">
                      <Image
                        src={slide.imageUrl!}
                        alt={slide.imageAlt ?? slide.title ?? ""}
                        fill
                        className={`object-cover ${isKenBurns ? "is-ken-burns" : ""}`}
                        sizes="(min-width: 1180px) 100vw, 100vw"
                        priority={idx === 0}
                      />
                      {overlayGradient !== "none" && (
                        <div className={`shop-builder-media-overlay shop-builder-media-overlay--${overlayGradient}`} />
                      )}
                    </div>
                  ) : (
                    <div
                      className="shop-builder-swiper-media shop-builder-swiper-media--hero-placeholder group cursor-pointer"
                      onClick={() => onUploadSlideImage?.(idx, slide.imageUrl ?? undefined)}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950" />
                      {onUploadSlideImage && (
                        <button
                          type="button"
                          className="absolute top-4 right-4 z-20 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-semibold hover:bg-white/30 transition shadow-sm"
                        >
                          <Upload size={13} />
                          <span>Choose Background</span>
                        </button>
                      )}
                    </div>
                  )}

                  {/* Clean Text Overlay (No Giant Dark Slate Box) */}
                  <div className="shop-builder-swiper-content">
                    {slide.badge && (
                      <span className="shop-builder-swiper-badge">
                        {slide.badge}
                      </span>
                    )}

                    {slide.title && (
                      <SlideTitle className={`${titleClass} ${typographyRoleClass(titleRole)} shop-builder-swiper-title`.trim()}>
                        {slide.title}
                      </SlideTitle>
                    )}

                    {slide.subtitle && (
                      <div className={`${metaClass} ${typographyRoleClass(metaRole)} shop-builder-swiper-text`.trim()}>
                        {slide.subtitle}
                      </div>
                    )}

                    {slide.text && (
                      <div className={`${contentClass} ${typographyRoleClass(contentRole)} shop-builder-swiper-text`.trim()}>
                        {slide.text}
                      </div>
                    )}

                    {slide.price && (
                      <div className="shop-builder-swiper-price">{slide.price}</div>
                    )}

                    {slide.buttonLabel && slide.buttonUrl && (
                      <a
                        href={slide.buttonUrl}
                        className={buttonClass}
                        {...builderLinkTargetProps(slide.buttonTarget || settings?.linkTarget)}
                      >
                        <span>{slide.buttonLabel}</span>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                      </a>
                    )}
                  </div>
                </article>
              </SwiperSlide>
            );
          }

          // MODE 3: Standard Card / Showcase Slide
          return (
            <SwiperSlide key={slide.id || idx}>
              <article className="shop-builder-standard-slide-card">
                {/* Media Container (Top) */}
                <div
                  className="shop-builder-slide-media-container"
                  onClick={() => onUploadSlideImage?.(idx, slide.imageUrl ?? undefined)}
                >
                  {hasRealImage ? (
                    <Image
                      src={slide.imageUrl!}
                      alt={slide.imageAlt ?? slide.title ?? ""}
                      fill
                      className="object-cover"
                      sizes="(min-width: 1180px) 33vw, (min-width: 860px) 50vw, 100vw"
                    />
                  ) : (
                    <div className="shop-builder-slide-media-placeholder group">
                      <ImageIcon className="w-8 h-8 text-slate-400 group-hover:scale-110 transition-transform" />
                      <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                        + Add Slide Image
                      </span>
                    </div>
                  )}
                </div>

                {/* Content Container (Bottom) */}
                <div className="shop-builder-slide-content">
                  {slide.badge && (
                    <span className="shop-builder-slide-badge">{slide.badge}</span>
                  )}
                  {slide.title && (
                    <SlideTitle className={`${titleClass} ${typographyRoleClass(titleRole)} shop-builder-slide-title`.trim()}>
                      {slide.title}
                    </SlideTitle>
                  )}
                  {slide.subtitle && (
                    <div className={`${metaClass} ${typographyRoleClass(metaRole)} shop-builder-slide-text`.trim()}>
                      {slide.subtitle}
                    </div>
                  )}
                  {slide.text && (
                    <div className={`${contentClass} ${typographyRoleClass(contentRole)} shop-builder-slide-text`.trim()}>
                      {slide.text}
                    </div>
                  )}
                  {slide.price && (
                    <div className="shop-builder-slide-price">{slide.price}</div>
                  )}
                  {slide.buttonLabel && slide.buttonUrl && (
                    <a
                      href={slide.buttonUrl}
                      className={buttonClass}
                      {...builderLinkTargetProps(slide.buttonTarget || settings?.linkTarget)}
                    >
                      <span>{slide.buttonLabel}</span>
                    </a>
                  )}
                </div>
              </article>
            </SwiperSlide>
          );
        })}
      </Swiper>

      {/* Interactive Filmstrip Thumbs Bar */}
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
                <div
                  className="shop-builder-thumb-item cursor-pointer"
                  onClick={() => {
                    if (mainSwiper && !mainSwiper.destroyed) {
                      mainSwiper.slideTo(idx);
                    }
                    if (thumbsSwiper && !thumbsSwiper.destroyed) {
                      thumbsSwiper.slideTo(idx);
                    }
                  }}
                >
                  {!isPlaceholderSvgUrl(slide.imageUrl) ? (
                    <Image
                      src={slide.imageUrl!}
                      alt={slide.imageAlt || ""}
                      fill
                      className="object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-200 dark:bg-slate-800 rounded-lg flex items-center justify-center text-xs font-semibold text-slate-500">
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
