"use client";

import React from "react";
import type { BuilderLayoutBlock } from "@/components/dashboard/builderTypes";
import type { BuilderShellSettings } from "@/lib/builderShell";
import { resolveCarouselContentAlignment, resolveCarouselPresentation } from "@/lib/carouselPresentation";
import CarouselBlock, { type CarouselSlide } from "@/components/blocks/CarouselBlock";
import BuilderLineBreakText from "@/components/builder/BuilderLineBreakText";
import { Typog } from "@/components/builder/BuilderRenderHelpers";
import { resolveResponsiveBreakpointPolicy } from "@/lib/responsiveBreakpointPolicy";

type Props = {
  block: any;
  isCanvas?: boolean;
  panelMode?: boolean;
  shellSettings?: Partial<BuilderShellSettings>;
};

const DEFAULT_SLIDES: CarouselSlide[] = [
  {
    id: "slide-1",
    title: "Thoughtful Digital Craft",
    subtitle: "Strategy & Design",
    text: "Building clean, high-converting digital foundations designed for modern web apps.",
    buttonLabel: "Explore Work",
    buttonUrl: "/",
    imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "slide-2",
    title: "High Performance Web Apps",
    subtitle: "Engineering & Speed",
    text: "Single-sourced components with zero redundant code and maximum responsiveness.",
    buttonLabel: "View Capabilities",
    buttonUrl: "/",
    imageUrl: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=1200&q=80",
  },
];

export default function UikitSlider({ block, panelMode = false, shellSettings }: Props) {
  const rawBlock = (block ?? {}) as any;
  const rawCarouselSettings = rawBlock.carouselSettings ?? {};
  const breakpointPolicy = resolveResponsiveBreakpointPolicy(shellSettings);
  // Do not let the retired Panel Slider-specific persisted field reach the
  // shared carousel runtime. General is its single canonical owner.
  const { contentAlign: _retiredPanelContentAlign, ...panelCarouselSettings } = rawCarouselSettings;
  // YOOtheme owns Panel Slider text alignment in General. It is deliberately
  // not a carousel/item setting and does not share any path with image media
  // placement.
  const panelContentAlignment = resolveCarouselContentAlignment(rawBlock.textAlign);

  const panelShared = panelMode
    ? {
        // Panel Slider has no implicit Card surface. An authored Panel/Card
        // style remains explicit; otherwise its items are plain UIkit panels.
        panelStyle: rawCarouselSettings.panelStyle ?? "blank",
        panelSize: rawCarouselSettings.panelSize ?? "none",
        panelHover: rawCarouselSettings.panelHover ?? false,
        linkPanel: rawCarouselSettings.linkPanel ?? false,
        imageWidth: rawCarouselSettings.imageWidth,
        imageHeight: rawCarouselSettings.imageHeight,
        imageRatio: rawCarouselSettings.imageRatio ?? "natural",
        imageFit: rawCarouselSettings.imageFit ?? "natural",
        imageShape: rawCarouselSettings.imageShape ?? "none",
        imageShadow: rawCarouselSettings.imageShadow ?? "none",
        imageLoading: rawCarouselSettings.imageLoading ?? "lazy",
        // Structural Panel Slider image placement is deliberately deferred
        // until it has a truthful canonical owner. Do not fabricate generic
        // `uk-align-center` margins when the source has no supported local
        // image-alignment value.
        imageAlignment: rawCarouselSettings.imageAlignment,
        imageSvgInline: rawCarouselSettings.imageSvgInline,
        imageSvgColor: rawCarouselSettings.imageSvgColor,
        contentAlign: panelContentAlignment,
        headingAlign: panelContentAlignment,
        gridMetaAlign: rawCarouselSettings.metaPosition,
        metaHtmlElement: rawCarouselSettings.metaHtmlElement,
        metaStyle: rawCarouselSettings.metaStyle,
        titleMarginTop: rawCarouselSettings.titleMarginTop,
        contentStyle: rawCarouselSettings.contentStyle,
        contentMarginTop: rawCarouselSettings.contentMarginTop,
        headingLevel: rawCarouselSettings.headingLevel,
        headingSize: rawCarouselSettings.headingSize,
        // Older imports lost an explicitly empty YOOtheme `link_style` and
        // therefore have no persisted buttonStyle. Their element-level link
        // label is still present; retain the plain-link presentation until
        // the document is re-imported, while fresh imports persist it as
        // `link` in the canonical field.
        buttonStyle: rawCarouselSettings.buttonStyle ??
          (rawCarouselSettings.buttonLabel ? "link" : undefined),
        buttonSize: rawCarouselSettings.buttonSize,
        linkTarget: rawCarouselSettings.linkTarget,
        imageBoxDecoration: rawCarouselSettings.imageBoxDecoration,
        alignImageWithoutPadding: rawCarouselSettings.alignImageWithoutPadding ?? false,
        panelImageNoPadding: rawCarouselSettings.panelImageNoPadding,
        panelHeightExpand: rawCarouselSettings.panelHeightExpand,
        panelExpand: rawCarouselSettings.panelExpand,
        panelMatch: rawCarouselSettings.panelMatch,
      }
    : null;
  const sharedImageSettings = !panelMode && (rawBlock.kind === "overlaySlider" || rawBlock.kind === "slideshow")
    ? {
        imageWidth: rawCarouselSettings.imageWidth,
        imageHeight: rawCarouselSettings.imageHeight,
        imageLoading: rawCarouselSettings.imageLoading,
        imageHoverTransition: rawCarouselSettings.imageHoverTransition,
      }
    : null;

  // An explicit empty collection is meaningful after a static YOOtheme import:
  // it must remain empty rather than being replaced by local demonstration
  // slides in Builder only. Keep the fallback solely for legacy blocks that
  // never stored a slide collection at all.
  const sourceSlides: CarouselSlide[] = Array.isArray(rawBlock.slides)
    ? rawBlock.slides
    : DEFAULT_SLIDES;
  const slides: CarouselSlide[] = sourceSlides.map((slide: any, index: number) => ({
        ...slide,
        id: slide.id ?? `${rawBlock.id || "slider"}-slide-${index}`,
        title: slide.title || `Slide ${index + 1}`,
        // `subtitle` is retained for old Carousel documents. Panel Slider owns the
        // canonical `meta` field, and both renderer paths resolve it the same way.
        meta: slide.meta ?? slide.subtitle ?? "",
        subtitle: slide.meta ?? slide.subtitle ?? "",
        text: slide.text || "",
        badge: slide.badge || "",
        imageUrl: slide.imageUrl || slide.image || DEFAULT_SLIDES[index % 2].imageUrl,
        imageAlt: slide.imageAlt || slide.title || "Slide Image",
        imagePadding: slide.imagePadding,
        panelStyle: slide.panelStyle ?? panelShared?.panelStyle,
        panelSize: slide.panelSize ?? panelShared?.panelSize,
        panelHover: slide.panelHover ?? panelShared?.panelHover,
        linkPanel: slide.linkPanel ?? panelShared?.linkPanel,
        imageWidth: slide.imageWidth ?? panelShared?.imageWidth ?? sharedImageSettings?.imageWidth,
        imageHeight: slide.imageHeight ?? panelShared?.imageHeight ?? sharedImageSettings?.imageHeight,
        imageRatio: panelMode ? slide.imageRatio ?? panelShared?.imageRatio : slide.imageRatio,
        imageFit: panelMode ? slide.imageFit ?? panelShared?.imageFit : slide.imageFit,
        imageShape: panelMode ? slide.imageShape ?? panelShared?.imageShape : slide.imageShape,
        imageShadow: panelMode ? slide.imageShadow ?? panelShared?.imageShadow : slide.imageShadow,
        imageAlignment: panelMode ? slide.imageAlignment ?? panelShared?.imageAlignment : slide.imageAlignment,
        imageLoading: slide.imageLoading ?? panelShared?.imageLoading ?? sharedImageSettings?.imageLoading,
        imageHoverTransition: slide.imageHoverTransition ?? sharedImageSettings?.imageHoverTransition,
        imageSvgInline: panelMode ? slide.imageSvgInline ?? panelShared?.imageSvgInline : slide.imageSvgInline,
        imageSvgColor: panelMode ? slide.imageSvgColor ?? panelShared?.imageSvgColor : slide.imageSvgColor,
        imageBoxDecoration: slide.imageBoxDecoration ?? panelShared?.imageBoxDecoration,
        alignImageWithoutPadding: slide.alignImageWithoutPadding ?? panelShared?.alignImageWithoutPadding,
        panelImageNoPadding: slide.panelImageNoPadding ?? panelShared?.panelImageNoPadding,
        panelHeightExpand: slide.panelHeightExpand ?? panelShared?.panelHeightExpand,
        panelExpand: slide.panelExpand ?? panelShared?.panelExpand,
        panelMatch: slide.panelMatch ?? panelShared?.panelMatch,
        contentAlign: panelMode ? panelShared?.contentAlign : slide.contentAlign,
        headingAlign: panelMode ? panelShared?.headingAlign : slide.headingAlign,
        gridMetaAlign: slide.gridMetaAlign ?? panelShared?.gridMetaAlign,
        metaHtmlElement: slide.metaHtmlElement ?? panelShared?.metaHtmlElement,
        metaStyle: slide.metaStyle ?? panelShared?.metaStyle,
        titleMarginTop: slide.titleMarginTop ?? panelShared?.titleMarginTop,
        contentStyle: slide.contentStyle ?? panelShared?.contentStyle,
        contentMarginTop: slide.contentMarginTop ?? panelShared?.contentMarginTop,
        headingLevel: slide.headingLevel ?? panelShared?.headingLevel,
        headingSize: slide.headingSize ?? panelShared?.headingSize,
        buttonLabel: slide.buttonLabel ?? "",
        // A missing source URL is an absent action, not a placeholder link.
        // Native demonstration slides already carry explicit URLs.
        buttonUrl: slide.buttonUrl ?? undefined,
        buttonTarget: slide.buttonTarget ?? panelShared?.linkTarget ?? "_self",
        buttonStyle: slide.buttonStyle ?? panelShared?.buttonStyle,
        buttonSize: slide.buttonSize ?? panelShared?.buttonSize,
      }));

  const carousel = resolveCarouselPresentation(
    panelMode ? panelCarouselSettings : rawCarouselSettings,
    slides,
    shellSettings,
  ) as { settings: any; slides: CarouselSlide[] };
  const marginClass = rawBlock.margin && rawBlock.margin !== "none" ? `uk-margin-${rawBlock.margin}` : "";
  const animationClass = rawBlock.animation && rawBlock.animation !== "none" ? `uk-animation-${rawBlock.animation}` : "";
  const visibilityClass = rawBlock.visibility && rawBlock.visibility !== "always" ? `uk-${rawBlock.visibility}` : "";

  return (
    <div
      id={rawBlock.customId || rawBlock.id}
      className={`shop-builder-column-block shop-builder-column-block--${panelMode ? "panel-slider" : "slider"} ${marginClass} ${animationClass} ${visibilityClass} ${rawBlock.customClass ?? ""}`.trim()}
    >
      {rawBlock.title && (
        <Typog as="h3" typography={rawBlock.typography}>
          <BuilderLineBreakText text={rawBlock.title} />
        </Typog>
      )}
      {rawBlock.body && (
        <Typog as="p" typography={rawBlock.typography}>
          {rawBlock.body}
        </Typog>
      )}
      <CarouselBlock
        block={{
          __typename: "PageBuilderLayoutPageBuilderCarouselLayoutLayout",
          fieldGroupName: "ReactBuilderColumnSlider",
        }}
        slides={carousel.slides}
        breakpointPolicy={breakpointPolicy}
        settings={
          panelMode
            ? {
                ...carousel.settings,
                // Canonical Panel Slider settings own imported element
                // presentation. Historic top-level values are fallback-only;
                // an undefined legacy field must never erase a valid import.
                headingLevel: carousel.settings.headingLevel ?? rawBlock.headingLevel,
                headingSize: carousel.settings.headingSize ?? rawBlock.headingSize,
                titleTypographyRole: carousel.settings.titleTypographyRole ?? rawBlock.titleTypographyRole,
                metaTypographyRole: carousel.settings.metaTypographyRole ?? rawBlock.metaTypographyRole,
                metaStyle: carousel.settings.metaStyle ?? rawBlock.metaStyle,
                contentTypographyRole: carousel.settings.contentTypographyRole ?? rawBlock.contentTypographyRole,
                contentStyle: carousel.settings.contentStyle ?? rawBlock.contentStyle,
                contentMarginTop: carousel.settings.contentMarginTop ?? rawBlock.contentMarginTop,
                titleMarginTop: carousel.settings.titleMarginTop ?? rawBlock.titleMarginTop,
                // Runtime input only: this is derived directly from General,
                // never persisted inside carouselSettings.
                contentAlign: panelContentAlignment,
                buttonStyle: carousel.settings.buttonStyle ?? rawBlock.buttonStyle,
                buttonSize: carousel.settings.buttonSize ?? rawBlock.size,
                linkTarget: carousel.settings.linkTarget ?? rawBlock.linkTarget,
                cardsPerView: rawCarouselSettings.cardsPerView,
                variant: "panel",
                effect: rawCarouselSettings.effect ?? "slide",
                slideMode: "panel",
              }
            : carousel.settings
        }
      />
    </div>
  );
}
