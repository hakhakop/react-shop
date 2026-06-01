"use client";

import { useEffect } from "react";

const ANIMATED_ITEM_SELECTOR = [
  ".shop-builder-content-layout-heading",
  ".shop-builder-content-layout-card",
  ".shop-builder-element-shell",
  ".shop-builder-grid-card",
  ".shop-builder-badge-card",
  ".shop-builder-column-badges article",
  ".shop-builder-column-block",
  ".product-card",
  ".category-card",
].join(", ");

export default function BuilderScrollAnimations() {
  useEffect(() => {
    const animatedNodes = Array.from(
      document.querySelectorAll<HTMLElement>("[data-builder-animate]"),
    );
    const scrollProgressNodes = animatedNodes.filter((node) => {
      const preset = node.dataset.builderAnimate;
      return (
        preset === "progress-line" ||
        preset === "scroll-progress-horizontal" ||
        preset === "scroll-progress-vertical"
      );
    });
    const pinnedProgressNodes = animatedNodes.filter(
      (node) => node.dataset.builderPause === "true",
    );

    if (!animatedNodes.length) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    animatedNodes.forEach((node) => {
      node
        .querySelectorAll<HTMLElement>(ANIMATED_ITEM_SELECTOR)
        .forEach((item, index) => {
          item.style.setProperty("--builder-animate-index", String(index));
        });
    });

    const updateSteps = (node: HTMLElement, progress: number) => {
      const steps = Array.from(
        node.querySelectorAll<HTMLElement>(
          ".shop-builder-content-layout-card, .shop-builder-grid-card, .shop-builder-badge-card, .shop-builder-column-badges article",
        ),
      );
      const maxIndex = Math.max(steps.length - 1, 1);
      const offsetPercent = Number(node.dataset.builderStepOffset);
      const offset = Number.isFinite(offsetPercent)
        ? Math.max(-30, Math.min(30, offsetPercent)) / 100
        : 0.08;

      steps.forEach((step, index) => {
        const threshold = index / maxIndex;
        step.classList.toggle(
          "is-builder-scroll-step-active",
          progress >= threshold - offset,
        );
      });
    };

    const setNodeProgress = (node: HTMLElement, progress: number) => {
      const clamped = Math.min(1, Math.max(0, progress));
      const inverse = 1 - clamped;

      node.style.setProperty("--builder-scroll-progress", clamped.toFixed(4));
      node.style.setProperty("--builder-pinned-progress", clamped.toFixed(4));
      node.style.setProperty("--builder-pinned-inverse", inverse.toFixed(4));
      node.style.setProperty(
        "--builder-pinned-scale",
        (1 - inverse * 0.035).toFixed(4),
      );
      node.classList.toggle("is-builder-animated-in", clamped >= 0.98);
      updateSteps(node, clamped);
    };

    const updatePinnedProgress = () => {
      const viewportHeight = window.innerHeight || 1;

      pinnedProgressNodes.forEach((node) => {
        const rect = node.getBoundingClientRect();
        const distance = Math.max(1, rect.height - viewportHeight);
        const progress = Math.min(1, Math.max(0, -rect.top / distance));
        const isActive = rect.top <= 0 && rect.bottom >= viewportHeight;

        node.classList.toggle("is-builder-pinned-active", isActive);
        setNodeProgress(node, progress);
      });
    };

    const updateScrollProgress = () => {
      const viewportHeight = window.innerHeight || 1;

      scrollProgressNodes.forEach((node) => {
        if (node.dataset.builderPause === "true") return;

        const rect = node.getBoundingClientRect();
        const start = viewportHeight * 0.78;
        const distance = rect.height + viewportHeight * 0.36;
        const progress = Math.min(
          1,
          Math.max(0, (start - rect.top) / distance),
        );
        setNodeProgress(node, progress);
      });
    };

    if (reduceMotion) {
      animatedNodes.forEach((node) =>
        node.classList.add("is-builder-animated-in"),
      );
      scrollProgressNodes.forEach((node) => {
        setNodeProgress(node, 1);
      });
      pinnedProgressNodes.forEach((node) => {
        setNodeProgress(node, 1);
      });
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const node = entry.target as HTMLElement;
          const playOnce = node.dataset.builderAnimateOnce !== "false";

          if (!entry.isIntersecting) {
            if (!playOnce) {
              node.classList.remove("is-builder-animated-in");
            }
            return;
          }

          if (node.dataset.builderPause === "true") {
            updatePinnedProgress();
            return;
          }

          if (node.dataset.builderAnimate === "progress-line") {
            return;
          }

          node.classList.add("is-builder-animated-in");

          if (playOnce) {
            observer.unobserve(node);
          }
        });
      },
      {
        rootMargin: "0px 0px -12% 0px",
        threshold: 0.16,
      },
    );

    animatedNodes.forEach((node) => observer.observe(node));
    let rafId = 0;
    const requestProgressUpdate = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        updatePinnedProgress();
        updateScrollProgress();
      });
    };

    updatePinnedProgress();
    updateScrollProgress();
    window.addEventListener("scroll", requestProgressUpdate, { passive: true });
    window.addEventListener("resize", requestProgressUpdate);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", requestProgressUpdate);
      window.removeEventListener("resize", requestProgressUpdate);
    };
  }, []);

  return null;
}
