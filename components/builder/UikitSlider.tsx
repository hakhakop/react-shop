"use client";

import React from "react";
import type { BuilderLayoutBlock } from "@/components/dashboard/builderTypes";
import CarouselBlock, { type CarouselSlide } from "@/components/blocks/CarouselBlock";
import BuilderLineBreakText from "@/components/builder/BuilderLineBreakText";
import { Typog } from "@/components/builder/BuilderRenderHelpers";

type Props = {
  block: any;
  isCanvas?: boolean;
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

export default function UikitSlider({ block }: Props) {
  const rawBlock = (block ?? {}) as any;

  const slides: CarouselSlide[] = rawBlock.slides?.length
    ? rawBlock.slides.map((slide: any, index: number) => ({
        id: slide.id ?? `${rawBlock.id || "slider"}-slide-${index}`,
        title: slide.title || `Slide ${index + 1}`,
        subtitle: slide.subtitle || "",
        text: slide.text || "",
        badge: slide.badge || "",
        imageUrl: slide.imageUrl || slide.image || DEFAULT_SLIDES[index % 2].imageUrl,
        imageAlt: slide.imageAlt || slide.title || "Slide Image",
        imagePadding: slide.imagePadding,
        buttonLabel: slide.buttonLabel || "",
        buttonUrl: slide.buttonUrl || "#",
      }))
    : DEFAULT_SLIDES;

  const marginClass = rawBlock.margin && rawBlock.margin !== "none" ? `uk-margin-${rawBlock.margin}` : "";
  const animationClass = rawBlock.animation && rawBlock.animation !== "none" ? `uk-animation-${rawBlock.animation}` : "";
  const visibilityClass = rawBlock.visibility && rawBlock.visibility !== "always" ? `uk-${rawBlock.visibility}` : "";

  return (
    <div
      id={rawBlock.customId || rawBlock.id}
      className={`shop-builder-column-block shop-builder-column-block--slider ${marginClass} ${animationClass} ${visibilityClass} ${rawBlock.customClass ?? ""}`.trim()}
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
        settings={rawBlock.carouselSettings}
      />
    </div>
  );
}
