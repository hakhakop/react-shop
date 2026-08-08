"use client";

import React from "react";
import type { BuilderLayoutBlock } from "@/components/dashboard/builderTypes";
import type { BuilderShellSettings } from "@/lib/builderShell";
import { resolveAppearanceValue } from "@/lib/globalStyleTokens";
import CarouselBlock, { type CarouselSlide } from "@/components/blocks/CarouselBlock";
import BuilderLineBreakText from "@/components/builder/BuilderLineBreakText";
import { Typog } from "@/components/builder/BuilderRenderHelpers";

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
  const resolveString = (
    local: unknown,
    global: string | undefined,
    componentDefault: string,
  ) =>
    resolveAppearanceValue({
      local: typeof local === "string" ? local : undefined,
      global,
      componentDefault,
    }).value;
  const resolvedCarouselSettings = {
    ...rawCarouselSettings,
    arrowStyle: resolveString(
      rawCarouselSettings.arrowStyle,
      panelMode ? undefined : shellSettings?.sliderArrowStyle,
      "chevron",
    ),
    arrowPosition: resolveString(
      rawCarouselSettings.arrowPosition,
      panelMode ? undefined : shellSettings?.sliderArrowPosition,
      "overlay",
    ),
    paginationStyle: resolveString(
      rawCarouselSettings.paginationStyle,
      panelMode ? undefined : shellSettings?.sliderDotnavStyle,
      "minimal-dots",
    ),
    paginationPosition: resolveString(
      rawCarouselSettings.paginationPosition,
      panelMode ? undefined : shellSettings?.sliderDotnavPosition,
      "bottom",
    ),
  };

  const panelShared = panelMode
    ? {
        panelStyle: rawCarouselSettings.panelStyle ?? "default",
        panelSize: rawCarouselSettings.panelSize ?? "default",
        panelHover: rawCarouselSettings.panelHover ?? false,
        linkPanel: rawCarouselSettings.linkPanel ?? false,
        imageWidth: rawCarouselSettings.imageWidth,
        imageHeight: rawCarouselSettings.imageHeight,
        imageRatio: rawCarouselSettings.imageRatio ?? "natural",
        imageFit: rawCarouselSettings.imageFit ?? "cover",
        imageShape: rawCarouselSettings.imageShape ?? "none",
        imageShadow: rawCarouselSettings.imageShadow ?? "none",
        imageLoading: rawCarouselSettings.imageLoading ?? "lazy",
        imageAlignment: rawCarouselSettings.imageAlignment ?? "center",
        imageBoxDecoration: rawCarouselSettings.imageBoxDecoration,
        alignImageWithoutPadding: rawCarouselSettings.alignImageWithoutPadding ?? false,
      }
    : null;

  const sourceSlides: CarouselSlide[] = rawBlock.slides?.length
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
        imageWidth: slide.imageWidth ?? panelShared?.imageWidth,
        imageHeight: slide.imageHeight ?? panelShared?.imageHeight,
        imageRatio: panelMode
          ? slide.imageRatio ?? panelShared?.imageRatio
          : resolveString(slide.imageRatio, shellSettings?.imageDefaultRatio, "natural"),
        imageFit: panelMode
          ? slide.imageFit ?? panelShared?.imageFit
          : resolveString(slide.imageFit, shellSettings?.imageDefaultFit, "cover"),
        imageShape: panelMode
          ? slide.imageShape ?? panelShared?.imageShape
          : resolveString(
              typeof slide.imageShape === "string"
                ? slide.imageShape
                : ["rounded", "circle", "pill"].includes(slide.imageBorder)
                  ? slide.imageBorder
                  : undefined,
              shellSettings?.imageDefaultBorder,
              "none",
            ),
        imageShadow: panelMode
          ? slide.imageShadow ?? panelShared?.imageShadow
          : resolveString(slide.imageShadow, shellSettings?.imageDefaultShadow, "none"),
        imageAlignment: panelMode
          ? slide.imageAlignment ?? panelShared?.imageAlignment
          : resolveString(slide.imageAlignment, shellSettings?.imageDefaultAlignment, "center"),
        imageLoading: panelMode
          ? slide.imageLoading ?? panelShared?.imageLoading
          : resolveString(slide.imageLoading, shellSettings?.imageDefaultLoading, "lazy"),
        imageBoxDecoration: slide.imageBoxDecoration ?? panelShared?.imageBoxDecoration,
        alignImageWithoutPadding: slide.alignImageWithoutPadding ?? panelShared?.alignImageWithoutPadding,
        buttonLabel: slide.buttonLabel || "",
        buttonUrl: slide.buttonUrl || "#",
        buttonTarget: slide.buttonTarget || "_self",
      }));

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
        slides={slides}
        settings={
          panelMode
            ? {
                ...resolvedCarouselSettings,
                headingLevel: rawBlock.headingLevel,
                headingSize: rawBlock.headingSize,
                titleTypographyRole: rawBlock.titleTypographyRole,
                metaTypographyRole: rawBlock.metaTypographyRole,
                metaStyle: rawBlock.metaStyle,
                contentTypographyRole: rawBlock.contentTypographyRole,
                contentStyle: rawBlock.contentStyle,
                buttonStyle: rawBlock.buttonStyle,
                buttonSize: rawBlock.size,
                linkTarget: rawBlock.linkTarget,
                cardsPerView: rawCarouselSettings.cardsPerView ?? 3,
                variant: "panel",
                effect: rawCarouselSettings.effect ?? "slide",
                slideMode: "panel",
              }
            : resolvedCarouselSettings
        }
      />
    </div>
  );
}
