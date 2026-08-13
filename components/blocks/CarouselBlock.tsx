"use client";

import React, { useEffect, useState } from "react";
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
  getUikitMarginClass,
  getUikitSvgColor,
  getUikitSvgColorClass,
  getUikitPanelMediaStyle,
  getUikitTextClass,
  resolveUikitImageSemantics,
} from "@/lib/uikitTokens";
import { typographyRoleClass, type SemanticTypographyRole } from "@/lib/builderTypography";
import { builderLinkTargetProps } from "@/lib/websiteBuilderLinks";
import { resolvePanelSliderRuntime } from "@/lib/panelSliderRuntime";
import { resolveResponsiveBreakpointPolicy, type ResponsiveBreakpointPolicy } from "@/lib/responsiveBreakpointPolicy";
import { WebPagesIcon } from "@/components/builder/WebPagesIcon";
import UikitStylableSvg from "@/components/builder/UikitStylableSvg";
import { useBuilderCarouselGeometryCoordinator } from "@/components/builder/BuilderCarouselGeometryCoordinator";
import { sanitizeHtml } from "@/lib/safeHtml";
import { resolveCarouselContentAlignment } from "@/lib/carouselPresentation";

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
  /** Dedicated YOOtheme Thumbnav media; falls back to imageUrl when absent. */
  thumbnailUrl?: string | null;
  thumbnailPosition?: string | null;
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
  /** Per-slide YOOtheme text context and semantic item element. */
  textColor?: "none" | "light" | "dark" | string | null;
  itemElement?: "div" | "article" | "section" | "li" | string | null;
  navigationLabel?: string | null;
  buttonAriaLabel?: string | null;
  imageLoading?: "lazy" | "eager" | string | null;
  imageWidth?: string | null;
  imageHeight?: string | number | null;
  imageBorder?: string | null;
  imageBoxShadow?: string | null;
  imageSvgInline?: boolean | null;
  imageSvgColor?: string | null;
  iconName?: string | null;
  iconSize?: number | null;
  showAction?: boolean | null;
  fullWidthButton?: boolean | null;
  linkMarginTop?: string | null;
  buttonStyle?: string | null;
  buttonSize?: string | null;
};

export type CarouselSettings = {
  variant?: string | string[];
  slideMode?: "auto" | "image-only" | "hero" | "card" | string | null;
  /** Canonical public element adapter; the renderer remains shared. */
  presentation?: "slideshow" | "overlay-slider" | "panel-slider";
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
  /** Responsive visible-item contract imported from YOOtheme Slider widths. */
  cardsPerViewPhone?: number | null;
  cardsPerViewSmall?: number | null;
  cardsPerViewMedium?: number | null;
  cardsPerViewLarge?: number | null;
  cardsPerViewXLarge?: number | null;
  centered?: boolean | "true" | "false" | 1 | 0 | null;
  divider?: boolean | "true" | "false" | 1 | 0 | null;
  showArrows?: boolean | "true" | "false" | 1 | 0 | null;
  showDots?: boolean | "true" | "false" | 1 | 0 | null;
  pauseOnHover?: boolean | "true" | "false" | 1 | 0 | null;
  arrowStyle?: "chevron" | "glass-circle" | "solid-dark" | "minimal-light" | "outer" | "hidden" | string | null;
  arrowPosition?: "overlay" | "outer" | "bottom" | "bottom-right" | "bottom-left" | "top-right" | "top-left" | string | null;
  slidenavBreakpoint?: "small" | "medium" | "large" | "xlarge" | string | null;
  paginationStyle?: "simple-dots" | "minimal-dots" | "expanding-pills" | "fraction" | "progress" | "thumbs" | "hidden" | string | null;
  paginationPosition?: "bottom" | "top" | "overlay" | string | null;
  navigationType?: "none" | "dotnav" | "thumbnav" | string | null;
  navigationMargin?: "none" | "small" | "medium" | "large" | string | null;
  navigationBreakpoint?: "small" | "medium" | "large" | "xlarge" | "always" | string | null;
  navigationBelow?: boolean | "true" | "false" | 1 | 0 | null;
  navigationHoverOnly?: boolean | "true" | "false" | 1 | 0 | null;
  navigationVertical?: boolean | "true" | "false" | 1 | 0 | null;
  thumbnavWidth?: number | string | null;
  thumbnavHeight?: number | string | null;
  thumbnavNoWrap?: boolean | "true" | "false" | 1 | 0 | null;
  thumbnavInlineSvg?: boolean | "true" | "false" | 1 | 0 | null;
  thumbnavSvgColor?: string | null;
  slidenavHoverOnly?: boolean | "true" | "false" | 1 | 0 | null;
  slidenavLarger?: boolean | "true" | "false" | 1 | 0 | null;
  slidenavMargin?: "none" | "small" | "medium" | "large" | string | null;
  slidenavOutsideBreakpoint?: "small" | "medium" | "large" | "xlarge" | string | null;
  aspectRatio?: "auto" | "16:9" | "4:3" | "1:1" | "21:9" | "full" | string | null;
  overlayGradient?: "none" | "subtle" | "dark-glass" | "vibrant" | string | null;
  overlayPosition?: "bottom-left" | "bottom-center" | "bottom-right" | "center" | "top-left" | "top-right" | string | null;
  overlayColor?: "dark" | "light" | "glass-dark" | "glass-light" | "brand" | string | null;
  overlayTextColor?: "auto" | "light" | "dark" | "brand" | string | null;
  overlayMode?: "cover" | "caption";
  overlayDisplay?: "always" | "hover" | "active";
  overlayPadding?: string | null;
  /** UIkit Overlay/Tile surface, independent from media fit and content position. */
  overlayStyle?: "none" | "default" | "primary" | "tile-default" | "tile-muted" | "tile-primary" | "tile-secondary" | string | null;
  /** Visibility belongs to the YOOtheme carousel element, not individual slides. */
  showTitle?: boolean | "true" | "false" | 1 | 0 | null;
  showImage?: boolean | "true" | "false" | 1 | 0 | null;
  showMeta?: boolean | "true" | "false" | 1 | 0 | null;
  showContent?: boolean | "true" | "false" | 1 | 0 | null;
  showLink?: boolean | "true" | "false" | 1 | 0 | null;
  fullWidthButton?: boolean | null;
  linkMarginTop?: string | null;
  /** YOOtheme Thumbnav can deliberately show a numbered thumbnail instead of slide media. */
  showNavigationThumbnail?: boolean | "true" | "false" | 1 | 0 | null;
  overlayLink?: boolean;
  itemWidthMode?: "fixed" | "auto";
  slideshowHeight?: "auto" | "viewport" | "section";
  slideshowViewportHeight?: number | string | null;
  slideshowHeightExpand?: boolean | "true" | "false" | 1 | 0 | null;
  slideshowMinHeight?: number | string | null;
  slideshowMaxHeight?: number | string | null;
  slideshowRatio?: string | null;
  kenBurns?: boolean | "true" | "false" | 1 | 0 | null;
  headingLevel?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | string | null;
  headingSize?: string | null;
  titleTypographyRole?: string | null;
  metaTypographyRole?: string | null;
  metaPosition?: "above-title" | "below-title" | "below-content" | string | null;
  metaHtmlElement?: "div" | "p" | "span" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | string | null;
  metaStyle?: string | null;
  contentTypographyRole?: string | null;
  contentStyle?: string | null;
  /** Shared element content alignment, inherited by Panel Slider items. */
  contentAlign?: "left" | "center" | "right" | string | null;
  headingAlign?: "left" | "center" | "right" | string | null;
  buttonStyle?: string | null;
  buttonSize?: string | null;
  buttonLabel?: string | null;
  linkTarget?: string | null;
  elementLinkUrl?: string | null;
  elementLinkTarget?: string | null;
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
  /** The one rendered-page policy, supplied by Builder/storefront adapters. */
  breakpointPolicy?: ResponsiveBreakpointPolicy;
};

function isPlaceholderSvgUrl(url?: string | null): boolean {
  if (!url || !url.trim()) return true;
  return url.includes("builder-image-placeholder.svg");
}

function toCssDimension(value?: string | number | null): string | undefined {
  if (value === undefined || value === null || value === "" || value === "auto") return undefined;
  return typeof value === "number" ? `${value}px` : value;
}

function toCssObjectPosition(value?: string | null): string | undefined {
  return value && /^(?:top|center|bottom)-(?:left|center|right)$/.test(value)
    ? value.replace("-", " ")
    : undefined;
}

/** Accept YOOtheme's authoring form (for example `1600:900`) without
 * allowing arbitrary persisted CSS into the carousel frame. */
function toCssAspectRatio(value?: string | null): string | undefined {
  const match = value?.trim().match(/^(\d+(?:\.\d+)?)\s*[:/]\s*(\d+(?:\.\d+)?)$/);
  if (!match || Number(match[1]) <= 0 || Number(match[2]) <= 0) return undefined;
  return `${match[1]} / ${match[2]}`;
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
  breakpointPolicy: suppliedBreakpointPolicy,
}: CarouselBlockProps) {
  const breakpointPolicy = suppliedBreakpointPolicy ?? resolveResponsiveBreakpointPolicy();
  const builderGeometryCoordinator =
    useBuilderCarouselGeometryCoordinator();
  const [panelSliderLocked, setPanelSliderLocked] = useState(false);
  const [mainSwiper, setMainSwiper] = useState<any>(null);
  const [thumbsSwiper, setThumbsSwiper] = useState<any>(null);
  const [activeSlideshowIndex, setActiveSlideshowIndex] = useState(0);
  const [activeOverlayIndex, setActiveOverlayIndex] = useState(0);

  useEffect(() => {
    if (!builderGeometryCoordinator || !mainSwiper) return;
    return builderGeometryCoordinator.register(mainSwiper);
  }, [builderGeometryCoordinator, mainSwiper]);

  useEffect(() => {
    if (!builderGeometryCoordinator || !thumbsSwiper) return;
    return builderGeometryCoordinator.register(thumbsSwiper);
  }, [builderGeometryCoordinator, thumbsSwiper]);

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
  const isPanelSlider = settings?.presentation === "panel-slider";
  const isSlideshow = settings?.presentation === "slideshow";
  // YOOtheme General → Text Alignment is emitted on the Panel Slider element
  // itself. Its panel-item flex group inherits that context for both text and
  // inline media; it is not an Image-alignment setting.
  const panelContentAlignment = isPanelSlider
    ? resolveCarouselContentAlignment(settings?.contentAlign)
    : null;
  const overlayContentAlignment = settings?.presentation === "overlay-slider"
    ? resolveCarouselContentAlignment(settings?.contentAlign)
    : null;

  const rawCardsPerView =
    settings?.presentation === "overlay-slider" && settings?.cardsPerView === undefined
      ? settings.cardsPerViewMedium ?? 1
      : settings?.cardsPerView ?? 1;
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

  // UIkit responsive widths inherit forward when a breakpoint is omitted.
  // Preserve that source cascade exactly; do not synthesize intermediate
  // visible-item counts from the generic carousel default.
  const phoneCardsPerView = numberSetting(settings?.cardsPerViewPhone, cardsPerView, 1, 6);
  const smallCardsPerView = numberSetting(settings?.cardsPerViewSmall, phoneCardsPerView, 1, 6);
  const mediumCardsPerView = numberSetting(settings?.cardsPerViewMedium, smallCardsPerView, 1, 6);
  const largeCardsPerView = numberSetting(settings?.cardsPerViewLarge, mediumCardsPerView, 1, 6);
  const xlargeCardsPerView = numberSetting(settings?.cardsPerViewXLarge, largeCardsPerView, 1, 6);
  const responsiveCardsPerView = {
    phone: phoneCardsPerView,
    small: smallCardsPerView,
    medium: mediumCardsPerView,
    large: largeCardsPerView,
    xlarge: xlargeCardsPerView,
  };
  const panelSliderRuntime = settings?.presentation === "panel-slider"
    ? resolvePanelSliderRuntime(settings, breakpointPolicy)
    : null;

  const booleanSetting = (
    value: boolean | "true" | "false" | 1 | 0 | null | undefined,
    fallback: boolean
  ) => {
    if (value === undefined || value === null) return fallback;
    if (typeof value === "boolean") return value;
    if (typeof value === "number") return value === 1;
    return value === "true";
  };

  const hasPanelSliderDivider = isPanelSlider && booleanSetting(settings?.divider, false);
  // Panel Slider uses UIkit's grid track for its visible gutters/dividers.
  // Swiper must only own movement: passing the persisted gap here adds a
  // second margin between slides and changes both intrinsic item geometry and
  // navigation locking. Keep the canonical token intact for the UIkit track.
  const swiperSpaceBetween = isPanelSlider ? 0 : spaceBetween;
  const panelSliderIsEffectivelyLocked = (swiper: any) => {
    if (!isPanelSlider || !swiper?.wrapperEl) return Boolean(swiper?.isLocked);
    const trackStyle = window.getComputedStyle(swiper.wrapperEl);
    const leadingGridGutter = Math.max(0, -Number.parseFloat(trackStyle.marginLeft || "0"));
    const itemSpan = Array.from(swiper.slides ?? []) as HTMLElement[];
    const totalItemSpan = itemSpan.reduce(
      (total: number, slide: HTMLElement) => total + slide.getBoundingClientRect().width,
      0,
    );
    // UIkit's `uk-grid` track intentionally extends left by its leading
    // gutter. A Panel Slider is locked when all item boxes fit that logical
    // grid span, rather than only Swiper's clipped viewport width.
    return totalItemSpan <= swiper.width + leadingGridGutter + 0.5;
  };
  const applySlideshowNavigationPresentation = (swiper: any) => {
    if (!isSlideshow) return;
    const previous = swiper?.navigation?.prevEl as HTMLElement | undefined;
    const next = swiper?.navigation?.nextEl as HTMLElement | undefined;
    previous?.classList.add("uk-slidenav", "uk-slidenav-previous");
    next?.classList.add("uk-slidenav", "uk-slidenav-next");
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
      : panelSliderRuntime
      ? panelSliderRuntime.slidesPerView
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
  const slideshowNavigationType = isSlideshow
    ? (settings?.navigationType === "dotnav" || settings?.navigationType === "thumbnav" ||
        (settings?.navigationType === undefined && booleanSetting(settings?.showDots, true))
        ? (settings?.navigationType === "thumbnav" ? "thumbnav" : "dotnav")
        : "none")
    : null;
  const overlayNavigationType = settings?.presentation === "overlay-slider"
    ? (settings?.navigationType === "dotnav" ||
      (settings?.navigationType === undefined && booleanSetting(settings?.showDots, false))
        ? "dotnav"
        : "none")
    : null;
  const slideshowNavigationMargin = settings?.navigationMargin ?? "medium";
  const slideshowNavigationBreakpoint = settings?.navigationBreakpoint ?? "always";
  const slideshowNavigationBelow = booleanSetting(settings?.navigationBelow, false);
  const slideshowNavigationHoverOnly = booleanSetting(settings?.navigationHoverOnly, false);
  const slideshowNavigationVertical = booleanSetting(settings?.navigationVertical, false);
  const slideshowSlidenavHoverOnly = booleanSetting(settings?.slidenavHoverOnly, false);
  const slideshowSlidenavLarger = booleanSetting(settings?.slidenavLarger, false);
  const slideshowSlidenavMargin = settings?.slidenavMargin ?? "medium";
  const slideshowThumbnavWidth = Math.max(1, numberSetting(settings?.thumbnavWidth, 100, 1, 480));
  const slideshowThumbnavHeight = Math.max(1, numberSetting(settings?.thumbnavHeight, 75, 1, 360));
  const slideshowThumbnavNoWrap = booleanSetting(settings?.thumbnavNoWrap, false);
  const slideshowShowNavigationThumbnail = booleanSetting(settings?.showNavigationThumbnail, true);
  const overlayGradient = settings?.overlayGradient ?? "none";
  const overlayPosition = settings?.overlayPosition ?? "bottom-left";
  const overlayColor = settings?.overlayColor ?? "dark";
  const overlayTextColor = settings?.overlayTextColor ?? "auto";
  const overlayMode = settings?.overlayMode ?? "cover";
  const overlayDisplay = settings?.overlayDisplay ?? "always";
  const overlayPadding = settings?.overlayPadding ?? "default";
  const overlayStyle = settings?.overlayStyle ?? "none";
  const slideshowHeight = settings?.slideshowHeight ?? "auto";
  const slideshowViewportHeight = numberSetting(settings?.slideshowViewportHeight, 100, 0, 100);
  const slideshowAspectRatio = toCssAspectRatio(settings?.slideshowRatio ?? settings?.aspectRatio) ?? "16 / 9";
  const isKenBurns = booleanSetting(settings?.kenBurns, false);
  const showTitle = booleanSetting(settings?.showTitle, true);
  const showImage = booleanSetting(settings?.showImage, true);
  const showMeta = booleanSetting(settings?.showMeta, true);
  const showContent = booleanSetting(settings?.showContent, true);
  const showLink = booleanSetting(settings?.showLink, true);
  const slideshowElementLinkUrl = isSlideshow && settings?.elementLinkUrl?.trim()
    ? settings.elementLinkUrl.trim()
    : undefined;
  const slideshowElementLinkTarget = settings?.elementLinkTarget;
  // arrowStyle="hidden" or showArrows===false both suppress arrows
  const showArrows =
    arrowStyle !== "hidden" && booleanSetting(settings?.showArrows, true);
  // paginationStyle="hidden" or showDots===false both suppress dots
  const showDots = isSlideshow
    ? slideshowNavigationType === "dotnav"
    : overlayNavigationType !== null
      ? overlayNavigationType === "dotnav"
      : paginationStyle !== "hidden" && booleanSetting(settings?.showDots, true);
  const showThumbnav = isSlideshow && slideshowNavigationType === "thumbnav";

  const explicitSlideMode = settings?.slideMode ?? "auto";
  const headingLevel = settings?.headingLevel ?? undefined;
  const headingSize = settings?.headingSize ?? undefined;
  const titleRole = settings?.titleTypographyRole as SemanticTypographyRole | undefined;
  const metaRole = settings?.metaTypographyRole as SemanticTypographyRole | undefined;
  const contentRole = settings?.contentTypographyRole as SemanticTypographyRole | undefined;
  const SlideTitle = (headingLevel ?? "h3") as React.ElementType;
  const renderSlideTitle = (title: string, className: string) => (
    <SlideTitle
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitizeHtml(title) }}
    />
  );
  const SlideMeta = (settings?.metaHtmlElement ?? "div") as React.ElementType;
  const slideshowMetaPosition = settings?.metaPosition ?? "below-title";
  const titleClass = getUikitHeadingClass(headingLevel ?? "h3", headingSize);
  const metaClass = getUikitTextClass(settings?.metaStyle ?? undefined);
  const contentClass = getUikitTextClass(settings?.contentStyle ?? undefined);

  // Unique React key — includes every Swiper structural prop so it remounts cleanly
  // when variant, nav visibility, pagination type, or effects change
  const swiperKey = [
    swiperVariant,
    swiperEffect,
    slides.length,
    cardsPerView,
    panelSliderRuntime?.mode ?? "generic-width",
    responsiveCardsPerView.phone,
    responsiveCardsPerView.small,
    responsiveCardsPerView.medium,
    responsiveCardsPerView.large,
    responsiveCardsPerView.xlarge,
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
        isPanelSlider ? "el-element" : "",
        panelContentAlignment ? `uk-text-${panelContentAlignment}` : "",
        isPanelSlider && panelSliderLocked ? "shop-builder-swiper--locked" : "",
        isPanelSlider ? `shop-builder-panel-slidenav-margin--${settings?.slidenavMargin ?? "medium"}` : "",
        `shop-builder-arrow--${arrowStyle}`,
        settings?.slidenavBreakpoint ? `shop-builder-slidenav-from-${settings.slidenavBreakpoint}` : "",
        showArrows ? `shop-builder-arrow-pos--${arrowPosition}` : "",
        `shop-builder-pag--${paginationStyle}`,
        `shop-builder-pag-pos--${paginationPosition}`,
        // Generic carousels reserve flow space for Swiper's pagination. A
        // YOOtheme Slideshow owns a separate UIkit-style navigation frame;
        // reserving that legacy space moves its overlay dots below the media.
        showDots && !isSlideshow && settings?.presentation !== "overlay-slider" ? "shop-builder-swiper--has-pagination" : "",
        isSlideshow ? `shop-builder-slideshow-nav--${slideshowNavigationType}` : "",
        isSlideshow ? `shop-builder-slideshow-nav-pos--${paginationPosition}` : "",
        isSlideshow ? `shop-builder-slideshow-nav-margin--${slideshowNavigationMargin}` : "",
        isSlideshow && slideshowNavigationBreakpoint !== "always"
          ? `shop-builder-slideshow-nav-from-${slideshowNavigationBreakpoint}`
          : "",
        isSlideshow && slideshowNavigationBelow ? "shop-builder-slideshow-nav-below" : "",
        isSlideshow && slideshowNavigationHoverOnly ? "shop-builder-slideshow-nav-hover" : "",
        isSlideshow && slideshowNavigationVertical ? "shop-builder-slideshow-nav-vertical" : "",
        isSlideshow && slideshowThumbnavNoWrap ? "shop-builder-slideshow-thumbnav-nowrap" : "",
        isSlideshow && slideshowSlidenavHoverOnly ? "shop-builder-slideshow-slidenav-hover" : "",
        isSlideshow && slideshowSlidenavLarger ? "shop-builder-slideshow-slidenav-large" : "",
        isSlideshow ? `shop-builder-slideshow-slidenav-margin--${slideshowSlidenavMargin}` : "",
        isSlideshow ? `shop-builder-slideshow-overlay--${overlayPosition}` : "",
        isSlideshow ? `shop-builder-slideshow-padding--${overlayPadding}` : "",
        isSlideshow && (overlayTextColor === "light" || overlayTextColor === "dark")
          ? `shop-builder-slideshow-text--${overlayTextColor}`
          : "",
        isSlideshow && overlayTextColor === "light" ? "uk-light" : "",
        isSlideshow && slideshowHeight === "viewport"
          ? `shop-builder-slideshow-height--${slideshowHeight}`
          : "",
        settings?.presentation === "overlay-slider" ? `shop-builder-overlay-mode--${overlayMode}` : "",
        settings?.presentation === "overlay-slider" ? `shop-builder-overlay-display--${overlayDisplay}` : "",
        settings?.presentation === "overlay-slider" ? `shop-builder-overlay-padding--${overlayPadding}` : "",
        settings?.presentation === "overlay-slider" ? `shop-builder-overlay-style--${overlayStyle}` : "",
        settings?.presentation === "overlay-slider" ? `shop-builder-overlay-nav--${overlayNavigationType}` : "",
        settings?.presentation === "overlay-slider" ? `shop-builder-overlay-nav-pos--${paginationPosition}` : "",
        settings?.presentation === "overlay-slider" && settings?.navigationBelow === true ? "shop-builder-overlay-nav-below" : "",
        settings?.presentation === "overlay-slider" ? `shop-builder-overlay-nav-margin--${settings?.navigationMargin ?? "medium"}` : "",
        settings?.presentation === "overlay-slider" && settings?.navigationBreakpoint && settings.navigationBreakpoint !== "always"
          ? `shop-builder-overlay-nav-from-${settings.navigationBreakpoint}`
          : "",
        aspectRatioClass,
        is3DEffect ? "shop-builder-swiper--3d" : "",
        className ?? "",
      ].filter(Boolean).join(" ")}
      style={{
        ...(settings?.presentation === "slideshow" && toCssDimension(settings.slideshowMinHeight)
          ? { "--shop-builder-slideshow-min-height": toCssDimension(settings.slideshowMinHeight) }
          : {}),
        ...(isSlideshow ? {
          "--shop-builder-slideshow-aspect-ratio": slideshowAspectRatio,
          "--shop-builder-slideshow-viewport-height": `${slideshowViewportHeight}vh`,
          ...(toCssDimension(settings?.slideshowMaxHeight)
            ? { "--shop-builder-slideshow-max-height": toCssDimension(settings?.slideshowMaxHeight) }
            : {}),
        } : {}),
      } as React.CSSProperties}
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
        observer={builderGeometryCoordinator ? false : true}
        observeParents={builderGeometryCoordinator ? false : true}
        resizeObserver={builderGeometryCoordinator ? false : undefined}
        updateOnWindowResize={builderGeometryCoordinator ? false : undefined}
        breakpointsBase="container"
        slidesPerView={swiperSlidesPerView}
        spaceBetween={swiperSpaceBetween}
        effect={swiperEffect}
        speed={transitionSpeedMs}
        centeredSlides={booleanSetting(settings?.centered, swiperVariant === "coverflow" || swiperVariant === "showcase" || isMarquee)}
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
        // UIkit does not show slidenav when a Panel Slider has no overflow.
        // Swiper supplies the same runtime lock signal, shared by Builder and
        // storefront, rather than a Builder-only item-count approximation.
        watchOverflow
        onAfterInit={(swiper) => {
          if (isPanelSlider) setPanelSliderLocked(panelSliderIsEffectivelyLocked(swiper));
          applySlideshowNavigationPresentation(swiper);
        }}
        onSlideChange={(swiper) => {
          if (isSlideshow) setActiveSlideshowIndex(swiper.realIndex);
          if (overlayNavigationType === "dotnav") setActiveOverlayIndex(swiper.realIndex);
        }}
        onLock={(swiper) => {
          if (isPanelSlider) setPanelSliderLocked(panelSliderIsEffectivelyLocked(swiper));
        }}
        onUnlock={(swiper) => {
          if (isPanelSlider) setPanelSliderLocked(panelSliderIsEffectivelyLocked(swiper));
        }}
        onResize={(swiper) => {
          if (isPanelSlider) setPanelSliderLocked(panelSliderIsEffectivelyLocked(swiper));
        }}
        pagination={
          showDots && !isSlideshow && settings?.presentation !== "overlay-slider"
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
          panelSliderRuntime
            ? panelSliderRuntime.breakpoints
              ? {
                  0: { ...panelSliderRuntime.breakpoints[0], spaceBetween: swiperSpaceBetween },
                  [breakpointPolicy.small]: { ...panelSliderRuntime.breakpoints[breakpointPolicy.small], spaceBetween: swiperSpaceBetween },
                  [breakpointPolicy.medium]: { ...panelSliderRuntime.breakpoints[breakpointPolicy.medium], spaceBetween: swiperSpaceBetween },
                  [breakpointPolicy.large]: { ...panelSliderRuntime.breakpoints[breakpointPolicy.large], spaceBetween: swiperSpaceBetween },
                  [breakpointPolicy.xlarge]: { ...panelSliderRuntime.breakpoints[breakpointPolicy.xlarge], spaceBetween: swiperSpaceBetween },
                }
              : undefined
            : !is3DEffect && !isHeroOrFadeMode && !isMarquee
              ? {
                0: {
                  slidesPerView: responsiveCardsPerView.phone,
                  spaceBetween: 12,
                },
                [breakpointPolicy.small]: {
                  slidesPerView: responsiveCardsPerView.small,
                  spaceBetween: Math.min(spaceBetween, 16),
                },
                [breakpointPolicy.medium]: {
                  slidesPerView: responsiveCardsPerView.medium,
                  spaceBetween,
                },
                [breakpointPolicy.large]: { slidesPerView: responsiveCardsPerView.large, spaceBetween },
                [breakpointPolicy.xlarge]: { slidesPerView: responsiveCardsPerView.xlarge, spaceBetween },
              }
              : undefined
        }
        className="w-full"
        wrapperClass={
          isPanelSlider
            ? ["swiper-wrapper", "uk-slider-items", "uk-grid", hasPanelSliderDivider ? "uk-grid-divider" : ""].filter(Boolean).join(" ")
            : "swiper-wrapper"
        }
      >
        {slides.map((slide, idx) => {
          const slideshowElementLink = slideshowElementLinkUrl ? (
            <a
              className="shop-builder-slideshow-element-link"
              href={slideshowElementLinkUrl}
              aria-label={`Open slideshow${slide.title ? `: ${slide.title}` : ""}`}
              {...builderLinkTargetProps(slideshowElementLinkTarget)}
            />
          ) : null;
          const hasRealImage = showImage && Boolean(slide.imageUrl && slide.imageUrl.trim());
          const slideButtonLabel = slide.buttonLabel ?? settings?.buttonLabel;
          const hasTextContent = Boolean(
            (showTitle && slide.title?.trim()) || (showMeta && (slide.meta ?? slide.subtitle)?.trim()) ||
            (showContent && slide.text?.trim()) || (showLink && slideButtonLabel?.trim())
          );
          const itemMeta = slide.meta ?? slide.subtitle;
          const SlideshowItemElement = isSlideshow && ["div", "article", "section", "li"].includes(slide.itemElement ?? "")
            ? slide.itemElement as React.ElementType
            : "article";
          const slideshowItemTextContext = isSlideshow && (slide.textColor === "light" || slide.textColor === "dark")
            ? `uk-${slide.textColor}`
            : "";
          // Every public carousel presentation consumes the same canonical
          // action contract. Panel Slider has its own panel-specific adapter
          // below; Slideshow and Overlay/standard cards resolve their local
          // values before the element-level defaults.
          const slideButtonClass = getUikitButtonClass(
            slide.buttonStyle ?? settings?.buttonStyle ?? undefined,
            slide.buttonSize ?? settings?.buttonSize ?? undefined,
          );
          const slideButtonFullWidth = slide.fullWidthButton ?? settings?.fullWidthButton;
          const slideButtonMarginClass = getUikitMarginClass(
            slide.linkMarginTop ?? settings?.linkMarginTop,
            "top",
          );
          const renderSlideshowMeta = () =>
            showMeta && itemMeta ? (
              <SlideMeta className={`${metaClass} ${typographyRoleClass(metaRole)} shop-builder-swiper-text`.trim()}>
                {itemMeta}
              </SlideMeta>
            ) : null;

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
            const panelClass = getUikitCardClass(
              slide.panelStyle ?? settings?.panelStyle ?? (settings?.presentation === "panel-slider" ? "blank" : "default"),
              {
              hover: (slide.panelHover ?? settings?.panelHover) ? "hover" : "none",
              padding: slide.panelSize ?? settings?.panelSize ?? "none",
              },
            );
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
            const isStylableSvg = slide.imageSvgInline === true && /\.svg(?:[?#].*)?$/i.test(slide.imageUrl ?? "");
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
            const itemButtonFullWidth = slide.fullWidthButton ?? settings?.fullWidthButton;
            const itemButtonMarginClass = getUikitMarginClass(
              slide.linkMarginTop ?? settings?.linkMarginTop,
              "top",
            );
            const itemMeta = slide.meta ?? slide.subtitle;
            const metaPosition = slide.gridMetaAlign ?? settings?.metaPosition ?? "below-title";
            const textAlign = isPanelSlider
              ? panelContentAlignment!
              : resolveCarouselContentAlignment(slide.contentAlign ?? slide.headingAlign ?? settings?.contentAlign);
            const titleColorClass = getUikitTextColorClass(slide.titleColor);
            const metaColorClass = getUikitTextColorClass(slide.metaColor);
            const titleDecorationClass =
              slide.titleDecoration && slide.titleDecoration !== "none"
                ? `uk-heading-${slide.titleDecoration}`
                : "";
            const panelLinkProps = builderLinkTargetProps(slide.buttonTarget || settings?.linkTarget);
            const panelLinkUrl = slide.buttonUrl || "#";
            const hasPanelLink = (slide.linkPanel ?? settings?.linkPanel) === true && Boolean(slide.buttonUrl);
            const itemButtonLabel = slide.buttonLabel ?? settings?.buttonLabel;
            const hasAction = slide.showAction !== false && Boolean(itemButtonLabel && slide.buttonUrl);
            const mediaStyle: React.CSSProperties = {
              aspectRatio: itemMediaStyle.aspectRatio ?? itemImageStyle.aspectRatio,
              // UIkit's width-only inline icon presentation uses the same
              // square composition box as its declared icon width. This is
              // distinct from framed raster media, which continues to use an
              // authored height/ratio or its natural dimensions.
              height: toCssDimension(slide.imageHeight) ??
                (isStylableSvg && itemImageStyle.width ? itemImageStyle.width : undefined),
              maxWidth: itemImageStyle.maxWidth,
              width: itemImageStyle.width ?? "100%",
            };
            const MetaElement = (slide.metaHtmlElement ?? "div") as React.ElementType;
            const imageLoading = resolveImageLoading(slide.imageLoading, idx === 0 ? "eager" : "lazy");
            const fallbackPanelImage = (
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
                loading={imageLoading}
              />
            );
            const panelImage = isStylableSvg ? (
              <UikitStylableSvg
                src={slide.imageUrl!}
                alt={slide.imageAlt ?? slide.title ?? undefined}
                className={`${getUikitImageClass(itemImage)} ${getUikitSvgColorClass(slide.imageSvgColor)} el-image`.trim()}
                color={getUikitSvgColorClass(slide.imageSvgColor) ? undefined : getUikitSvgColor(slide.imageSvgColor)}
                fit={itemImage.fit === "cover" || itemImage.fit === "fill" ? itemImage.fit : "contain"}
                loading={imageLoading}
                fallback={fallbackPanelImage}
                style={{
                  position: itemImageStyle.position,
                  inset: itemImageStyle.inset,
                  width: "100%",
                }}
              />
            ) : fallbackPanelImage;

            const renderMeta = () =>
              showMeta && itemMeta ? (
                <MetaElement
                  className={`${itemMetaClass} ${typographyRoleClass(itemMetaRole)} ${metaColorClass}`.trim()}
                >
                  {itemMeta}
                </MetaElement>
              ) : null;

            const renderTitle = () =>
              showTitle && slide.title ? (
                <ItemTitle
                  className={`shop-builder-panel-slider-title ${hasRealImage ? "uk-margin-top uk-margin-remove-bottom" : ""} ${itemTitleClass} ${typographyRoleClass(itemTitleRole)} ${titleColorClass} ${titleDecorationClass}`.trim()}
                >
                  {slide.title}
                </ItemTitle>
              ) : null;

            return (
              <SwiperSlide
                key={slide.id || idx}
                className={[
                  panelSliderRuntime?.mode === "auto" ? "shop-builder-panel-slider-auto-item" : "",
                  // UIkit's grid divider deliberately omits the first column.
                  // Swiper owns the carousel movement, so retain that canonical
                  // grid marker on the initial item rather than recreating a
                  // divider with a presentation-specific pseudo-element.
                  hasPanelSliderDivider && idx === 0 ? "uk-first-column" : "",
                ].filter(Boolean).join(" ") || undefined}
              >
                <article className={`el-item shop-builder-panel-slider-card ${hasPanelLink ? "shop-builder-panel--linked" : ""} ${panelClass}`.trim()}>
                  {hasPanelLink && (
                    <a
                      className="shop-builder-panel-link-overlay"
                      href={panelLinkUrl}
                      {...panelLinkProps}
                      aria-label={slide.title || slide.buttonLabel || "Open panel"}
                    />
                  )}
                  {hasRealImage ? (
                    <div
                      className={`shop-builder-panel-slider-media ${getUikitImageWrapperClass(itemImage)}`.trim()}
                      style={mediaStyle}
                    >
                      {panelImage}
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
                    data-panel-slider-content-align={textAlign}
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
                    {showContent && slide.text && (
                      <div
                        className={`${itemContentClass} ${typographyRoleClass(itemContentRole)}`.trim()}
                        dangerouslySetInnerHTML={{ __html: sanitizeHtml(slide.text) }}
                      />
                    )}
                    {metaPosition === "below-content" && renderMeta()}
                    {showLink && hasAction && (
                      <a
                        href={panelLinkUrl}
                        className={`${itemButtonClass} shop-builder-panel-slider-action ${slide.fullWidthButton ? "uk-width-1-1" : ""}`.trim()}
                        {...panelLinkProps}
                      >
                        {itemButtonLabel}
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
                      {((showTitle && slide.title) || slide.badge) && (
                        <div className="absolute bottom-4 left-4 z-10 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-semibold">
                          {slide.badge && <span className="opacity-75">{slide.badge}</span>}
                          {showTitle && slide.title && renderSlideTitle(slide.title, `${titleClass} ${typographyRoleClass(titleRole)}`.trim())}
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
                  {slideshowElementLink}
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
                : overlayPosition === "center-left"
                ? "absolute top-1/2 -translate-y-1/2 left-4 right-4 md:right-auto md:max-w-md items-start text-left"
                : overlayPosition === "center-right"
                ? "absolute top-1/2 -translate-y-1/2 left-4 right-4 md:left-auto md:max-w-md items-end text-right"
                : overlayPosition === "top-left"
                ? "absolute top-4 left-4 right-4 md:right-auto md:max-w-md items-start text-left"
                : overlayPosition === "top-right"
                ? "absolute top-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md items-end text-right"
                : "absolute bottom-4 left-4 right-4 md:right-auto md:max-w-md items-start text-left";

            // Determine backdrop style
            const isLightBg = overlayColor === "light" || overlayColor === "glass-light";
            const backdropClass =
              overlayStyle === "none"
                ? "bg-transparent p-0"
                : effectiveMode === "glass-card"
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
                <article className={`shop-builder-overlay-slide-card group relative w-full ${settings?.aspectRatio ? "" : "shop-builder-overlay-slide-card--natural"} overflow-hidden rounded-2xl`}>
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
                      {overlayStyle !== "none" && (
                        <div className={`shop-builder-media-overlay shop-builder-media-overlay--${overlayGradient !== "none" ? overlayGradient : "subtle"}`} />
                      )}
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
                  <div
                    className={`shop-builder-overlay-slide-content z-10 flex flex-col gap-2.5 ${posClass} ${backdropClass}`}
                    data-overlay-content-align={overlayContentAlignment ?? undefined}
                    style={overlayContentAlignment ? { textAlign: overlayContentAlignment } : undefined}
                  >
                    {slide.badge && (
                      <span className={textColors.badge}>
                        {slide.badge}
                      </span>
                    )}
                    {slideshowMetaPosition === "above-title" && renderSlideshowMeta()}

                    {showTitle && slide.title && renderSlideTitle(slide.title, `${titleClass} ${typographyRoleClass(titleRole)} ${textColors.title}`.trim())}
                    {slideshowMetaPosition !== "above-title" && slideshowMetaPosition !== "below-content" && renderSlideshowMeta()}
                    {showContent && slide.text && (
                      <div
                        className={`${contentClass} ${typographyRoleClass(contentRole)} text-xs md:text-sm line-clamp-3 ${textColors.text}`.trim()}
                        dangerouslySetInnerHTML={{ __html: sanitizeHtml(slide.text) }}
                      />
                    )}
                    {slideshowMetaPosition === "below-content" && renderSlideshowMeta()}
                    {slide.price && (
                      <div className={`text-lg ${textColors.price}`}>
                        {slide.price}
                      </div>
                    )}
                    {showLink && slideButtonLabel && slide.buttonUrl && (
                      <a
                        href={slide.buttonUrl}
                        className={`${slideButtonClass} ${slideButtonMarginClass} ${slideButtonFullWidth ? "uk-width-1-1" : ""}`.trim()}
                        {...builderLinkTargetProps(slide.buttonTarget || settings?.linkTarget)}
                      >
                        <span>{slideButtonLabel}</span>
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
                <SlideshowItemElement className={`shop-builder-hero-slide-card ${slideshowItemTextContext}`.trim()}>
                  {hasRealImage ? (
                    <div className="shop-builder-swiper-media">
                      <Image
                        src={slide.imageUrl!}
                        alt={slide.imageAlt ?? slide.title ?? ""}
                        fill
                        className={`object-cover ${isKenBurns ? "is-ken-burns" : ""}`}
                        style={{ objectPosition: toCssObjectPosition(slide.imagePosition) }}
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

                    {showTitle && slide.title && renderSlideTitle(slide.title, `${titleClass} ${typographyRoleClass(titleRole)} ${isSlideshow ? "uk-margin-remove" : "shop-builder-swiper-title"}`.trim())}

                    {slideshowMetaPosition !== "above-title" && slideshowMetaPosition !== "below-content" && renderSlideshowMeta()}

                    {showContent && slide.text && (
                      <div
                        className={`${contentClass} ${typographyRoleClass(contentRole)} shop-builder-swiper-text`.trim()}
                        dangerouslySetInnerHTML={{ __html: sanitizeHtml(slide.text) }}
                      />
                    )}
                    {slideshowMetaPosition === "below-content" && renderSlideshowMeta()}

                    {slide.price && (
                      <div className="shop-builder-swiper-price">{slide.price}</div>
                    )}

                    {showLink && slide.showAction !== false && slideButtonLabel && slide.buttonUrl && (
                      <a
                        href={slide.buttonUrl}
                        className={`${slideButtonClass} ${slideButtonMarginClass} ${slideButtonFullWidth ? "uk-width-1-1" : ""}`.trim()}
                        aria-label={slide.buttonAriaLabel || undefined}
                        {...builderLinkTargetProps(slide.buttonTarget || settings?.linkTarget)}
                      >
                        <span>{slideButtonLabel}</span>
                      </a>
                    )}
                  </div>
                  {slideshowElementLink}
                </SlideshowItemElement>
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
                  {slideshowMetaPosition === "above-title" && renderSlideshowMeta()}
                  {showTitle && slide.title && renderSlideTitle(slide.title, `${titleClass} ${typographyRoleClass(titleRole)} shop-builder-slide-title`.trim())}
                  {slideshowMetaPosition !== "above-title" && slideshowMetaPosition !== "below-content" && renderSlideshowMeta()}
                  {showContent && slide.text && (
                    <div
                      className={`${contentClass} ${typographyRoleClass(contentRole)} shop-builder-slide-text`.trim()}
                      dangerouslySetInnerHTML={{ __html: sanitizeHtml(slide.text) }}
                    />
                  )}
                  {slideshowMetaPosition === "below-content" && renderSlideshowMeta()}
                  {slide.price && (
                    <div className="shop-builder-slide-price">{slide.price}</div>
                  )}
                  {showLink && slide.buttonLabel && slide.buttonUrl && (
                    <a
                      href={slide.buttonUrl}
                      className={`${slideButtonClass} ${slideButtonMarginClass} ${slideButtonFullWidth ? "uk-width-1-1" : ""}`.trim()}
                      {...builderLinkTargetProps(slide.buttonTarget || settings?.linkTarget)}
                    >
                      <span>{slide.buttonLabel}</span>
                    </a>
                  )}
                </div>
                {slideshowElementLink}
              </article>
            </SwiperSlide>
          );
        })}
      </Swiper>

      {isSlideshow && (showDots || showThumbnav) && (
        <div
          className="shop-builder-slideshow-navigation-frame"
          data-slideshow-navigation-placement={slideshowNavigationBelow ? "below" : "overlay"}
          style={slideshowNavigationBelow
            ? { position: "relative", inset: "auto", height: "auto", pointerEvents: "auto" }
            : { position: "absolute", inset: 0, zIndex: 10, pointerEvents: "none" }}
        >
          <ul
            className={showThumbnav ? "swiper-pagination uk-thumbnav uk-flex-center" : "swiper-pagination uk-dotnav uk-flex-center"}
            style={showThumbnav ? {
              "--shop-builder-thumbnav-width": `${slideshowThumbnavWidth}px`,
              "--shop-builder-thumbnav-height": `${slideshowThumbnavHeight}px`,
            } as React.CSSProperties : undefined}
          >
            {slides.map((slide, index) => (
              <li
                key={slide.id || index}
                className={activeSlideshowIndex === index ? "uk-active" : undefined}
              >
                {showThumbnav ? (
                  <button
                    type="button"
                    className="shop-builder-slideshow-thumbnav-item"
                    aria-label={slide.navigationLabel || slide.title || `Go to slide ${index + 1}`}
                    aria-current={activeSlideshowIndex === index ? "true" : undefined}
                    onClick={() => mainSwiper?.slideToLoop(index)}
                  >
                    {slideshowShowNavigationThumbnail && (slide.thumbnailUrl || slide.imageUrl) && !isPlaceholderSvgUrl(slide.thumbnailUrl || slide.imageUrl) ? (
                      <Image
                        src={(slide.thumbnailUrl || slide.imageUrl)!}
                        alt={slide.imageAlt ?? slide.title ?? ""}
                        fill
                        className="object-cover"
                        sizes="100px"
                        style={{ objectPosition: toCssObjectPosition(slide.thumbnailPosition) }}
                      />
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </button>
                ) : (
                  <button
                    type="button"
                    className={`swiper-pagination-bullet ${activeSlideshowIndex === index ? "swiper-pagination-bullet-active" : ""}`.trim()}
                    aria-label={slide.navigationLabel || slide.title || `Go to slide ${index + 1}`}
                    aria-current={activeSlideshowIndex === index ? "true" : undefined}
                    onClick={() => mainSwiper?.slideToLoop(index)}
                  />
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {settings?.presentation === "overlay-slider" && overlayNavigationType === "dotnav" && (
        <div className="shop-builder-overlay-navigation-frame" data-overlay-navigation-placement={settings?.navigationBelow ? "below" : "overlay"}>
          <ul className="shop-builder-overlay-dotnav uk-dotnav uk-flex-center">
            {slides.map((slide, index) => (
              <li key={slide.id || index} className={activeOverlayIndex === index ? "uk-active" : undefined}>
                <button
                  type="button"
                  className={`swiper-pagination-bullet ${activeOverlayIndex === index ? "swiper-pagination-bullet-active" : ""}`.trim()}
                  aria-label={slide.navigationLabel || slide.title || `Go to slide ${index + 1}`}
                  aria-current={activeOverlayIndex === index ? "true" : undefined}
                  onClick={() => mainSwiper?.slideToLoop(index)}
                />
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Interactive Filmstrip Thumbs Bar */}
      {swiperVariant === "thumbs" && slides.length > 1 && (
        <div className="shop-builder-thumbs-wrapper mt-4">
          <Swiper
            onSwiper={setThumbsSwiper}
            observer={builderGeometryCoordinator ? false : undefined}
            observeParents={builderGeometryCoordinator ? false : undefined}
            resizeObserver={builderGeometryCoordinator ? false : undefined}
            updateOnWindowResize={builderGeometryCoordinator ? false : undefined}
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
