"use client";

import { useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type HomeGsapAnimationsProps = {
  rootSelector?: string;
};

export default function HomeGsapAnimations({
  rootSelector = "[data-gsap-home]",
}: HomeGsapAnimationsProps) {
  useLayoutEffect(() => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const root = document.querySelector<HTMLElement>(rootSelector);

    if (!root || reduceMotion) return;

    const context = gsap.context(() => {
      const sections = gsap.utils.toArray<HTMLElement>(
        root.querySelectorAll("[data-gsap-section]"),
      );
      const hero =
        root.querySelector<HTMLElement>("[data-gsap-section='hero']") ??
        sections[0];

      if (hero) {
        const heroItems = hero.querySelectorAll(
          [
            "[data-gsap-hero-item]",
            ".shop-builder-eyebrow",
            ".shop-builder-title",
            ".shop-builder-body",
            ".shop-builder-cta",
            ".shop-builder-hero-media",
          ].join(", "),
        );

        gsap.fromTo(
          heroItems,
          { autoAlpha: 0, y: 28 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.9,
            delay: 0.08,
            ease: "power3.out",
            stagger: 0.1,
            clearProps: "transform,opacity,visibility",
          },
        );
      }

      sections
        .filter((section) => section !== hero)
        .forEach((section) => {
          const content =
            section.querySelector<HTMLElement>(".shop-builder-section-content") ??
            section;
          const isAlreadyNearViewport =
            section.getBoundingClientRect().top < window.innerHeight * 0.92;

          const revealVars = {
            autoAlpha: 1,
            y: 0,
            duration: 0.82,
            ease: "power3.out",
            clearProps: "transform,opacity,visibility",
          };

          if (isAlreadyNearViewport) {
            gsap.fromTo(content, { autoAlpha: 0, y: 32 }, revealVars);
            return;
          }

          gsap.fromTo(content, { autoAlpha: 0, y: 32 }, {
            ...revealVars,
            scrollTrigger: {
              trigger: section,
              start: "top 86%",
              once: true,
            },
          });
        });

      sections.forEach((section) => {
        const revealItems = section.querySelectorAll<HTMLElement>(
          [
            ".shop-builder-content-layout-heading",
            ".shop-builder-slider-heading",
            ".shop-builder-embed-heading",
            ".shop-builder-content-layout-card",
            ".shop-builder-grid-card",
            ".product-card",
            ".category-card",
            ".shop-builder-badge-card",
            ".shop-builder-column-badges article",
            ".shop-builder-column-block--products",
            ".shop-builder-column-block--grid",
            ".shop-builder-column-block--panel",
            ".shop-builder-column-block--image",
            ".shop-builder-column-block--badges",
            ".shop-builder-column-block--promo-strip",
          ].join(", "),
        );

        if (revealItems.length === 0) return;

        gsap.fromTo(
          revealItems,
          { autoAlpha: 0, y: 22 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.68,
            ease: "power3.out",
            stagger: 0.06,
            scrollTrigger: {
              trigger: section,
              start: "top 84%",
              once: true,
            },
            clearProps: "transform,opacity,visibility",
          },
        );
      });

      gsap.utils.toArray<HTMLElement>("[data-gsap-float]").forEach((item) => {
        gsap.to(item, {
          y: -10,
          duration: 3.8,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
        });
      });

      ScrollTrigger.refresh();
    }, root);

    return () => {
      context.revert();
    };
  }, [rootSelector]);

  return null;
}
