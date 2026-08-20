"use client";

import { useEffect } from "react";
import {
  normalizeBuilderParallax,
  type BuilderAnimationLike,
} from "@/lib/builderAnimation";
import type { BuilderParallaxSettings, BuilderParallaxStop } from "@/components/dashboard/builderTypes";

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

/** Match UIkit's scrollParent(element, true) selection for parallax. */
const parallaxScrollParent = (element: HTMLElement): HTMLElement => {
  let parent = element.parentElement;
  while (parent && parent !== document.body) {
    const style = getComputedStyle(parent);
    const overflow = `${style.overflow} ${style.overflowY}`;
    if (/(?:^| )(?:auto|scroll)(?: |$)/.test(overflow) && parent.scrollHeight > parent.clientHeight) {
      return parent;
    }
    parent = parent.parentElement;
  }
  return document.scrollingElement ?? document.documentElement;
};

const layoutOffsetTop = (element: HTMLElement): number => {
  let current: HTMLElement | null = element;
  let top = 0;
  while (current) {
    top += current.offsetTop;
    const parent = current.offsetParent as HTMLElement | null;
    if (!parent) break;
    top += Number.parseFloat(getComputedStyle(parent).borderTopWidth) || 0;
    if (getComputedStyle(parent).position === "fixed") {
      top += window.scrollY;
      break;
    }
    current = parent;
  }
  return top;
};

const breakpointPixels = (breakpoint: string): number => {
  const rootValue = getComputedStyle(document.documentElement)
    .getPropertyValue(`--uk-breakpoint-${breakpoint}`).trim();
  const parsed = Number.parseFloat(rootValue);
  if (Number.isFinite(parsed)) return parsed;
  return ({ s: 640, m: 960, l: 1200, xl: 1600 } as Record<string, number>)[breakpoint] ?? 0;
};

const resolveParallaxTarget = (node: HTMLElement, selector?: string): HTMLElement => {
  if (!selector) return node;
  if (selector === "!.uk-section") {
    return node.closest(".shop-builder-section, .builder-preview-section, [data-builder-section-id]") as HTMLElement ?? node;
  }
  if (selector === "![class*='uk-section-'] ~ [class*='uk-section-']") {
    const section = node.closest(".shop-builder-section, .builder-preview-section") as HTMLElement | null;
    return section?.nextElementSibling as HTMLElement ?? node;
  }
  if (selector.startsWith("!")) {
    const candidate = selector.slice(1).trim();
    const closest = node.closest(candidate);
    if (closest instanceof HTMLElement) return closest;
  }
  try {
    return document.querySelector<HTMLElement>(selector) ?? node;
  } catch {
    return node;
  }
};

const resolveParallaxOffset = (value: string | undefined, target: HTMLElement, viewportHeight: number, viewportWidth: number) => {
  if (!value) return 0;
  return value.replace(/\s+/g, "").replace(/-/g, "+-").split("+").reduce((sum, term) => {
    if (!term) return sum;
    const match = term.match(/^(-?\d+(?:\.\d+)?)(px|vh|vw|%)?$/);
    if (!match) return sum;
    const amount = Number(match[1]);
    const unit = match[2] ?? "px";
    return sum + (unit === "vh" ? amount * viewportHeight / 100 : unit === "vw" ? amount * viewportWidth / 100 : unit === "%" ? amount * target.offsetHeight / 100 : amount);
  }, 0);
};

const stopParts = (stop: BuilderParallaxStop) => {
  const match = stop.value.trim().match(/^(-?\d+(?:\.\d+)?)(.*)$/);
  return match ? { value: Number(match[1]), unit: match[2] || "" } : undefined;
};

const interpolateStops = (stops: BuilderParallaxStop[] | undefined, progress: number, property: string, node: HTMLElement, viewportHeight: number, viewportWidth: number): string | undefined => {
  if (!stops?.length) return undefined;
  const parsed = stops.map((stop) => ({ stop, parts: stopParts(stop) })).filter((item): item is { stop: BuilderParallaxStop; parts: { value: number; unit: string } } => Boolean(item.parts));
  if (!parsed.length) return undefined;
  const positions = parsed.map((item) => item.stop.position === undefined ? null : item.stop.position / 100);
  if (positions.length === 1) positions[0] = 0;
  else {
    if (positions[0] === null) positions[0] = 0;
    if (positions[positions.length - 1] === null) positions[positions.length - 1] = 1;
    let runStart = 0;
    while (runStart < positions.length) {
      if (positions[runStart] !== null) {
        runStart += 1;
        continue;
      }
      const before = runStart - 1;
      let runEnd = runStart;
      while (runEnd < positions.length && positions[runEnd] === null) runEnd += 1;
      const from = positions[before] ?? 0;
      const to = positions[runEnd] ?? 1;
      for (let index = runStart; index < runEnd; index += 1) {
        positions[index] = from + (to - from) * (index - before) / (runEnd - before);
      }
      runStart = runEnd;
    }
  }
  const positioned = parsed.map((item, index) => ({ ...item, position: positions[index] ?? 0 }));
  const rightIndex = positioned.findIndex((item, index) => index > 0 && progress <= item.position);
  const right = positioned[rightIndex < 0 ? positioned.length - 1 : rightIndex];
  const left = positioned[Math.max(0, positioned.indexOf(right) - 1)];
  const span = right.position - left.position || 1;
  const local = Math.min(1, Math.max(0, (progress - left.position) / span));
  let leftValue = left.parts.value;
  let rightValue = right.parts.value;
  const unit = left.parts.unit || right.parts.unit;
  if (property === "scale" && unit) {
    const dimension = node.offsetWidth || 1;
    const toScale = (value: number, authoredUnit: string) => authoredUnit === "%" ? value / 100 : authoredUnit === "vw" ? value * viewportWidth / 100 / dimension : authoredUnit === "vh" ? value * viewportHeight / 100 / dimension : value;
    leftValue = toScale(leftValue, left.parts.unit);
    rightValue = toScale(rightValue, right.parts.unit);
  }
  const value = leftValue + (rightValue - leftValue) * local;
  const outputUnit = property === "scale" || property === "opacity" || property === "rotate"
    ? ""
    : unit;
  return `${Number(value.toFixed(unit === "px" ? 4 : 6))}${outputUnit}`;
};

const parseParallaxNode = (node: HTMLElement) => {
  try {
    const parsed = node.dataset.builderParallax ? JSON.parse(node.dataset.builderParallax) : undefined;
    const normalized = parsed && typeof parsed === "object"
      ? normalizeBuilderParallax({ parallax: parsed })
      : undefined;
    if (normalized) return normalized;
  } catch {
    // Fall through to the legacy attributes below.
  }
  const values = (node.dataset.builderParallaxY ?? "").split(",").map((value) => Number(value.trim()));
  const easing = Number(node.dataset.builderParallaxEasing);
  return normalizeBuilderParallax({
    parallaxY: values.length === 2 && values.every((value) => Number.isFinite(value)) ? [values[0], values[1]] : undefined,
    parallaxEasing: Number.isFinite(easing) ? easing : undefined,
  } as BuilderAnimationLike);
};

export default function BuilderScrollAnimations() {
  useEffect(() => {
    const animatedNodes = Array.from(
      document.querySelectorAll<HTMLElement>("[data-builder-animate]"),
    );
    const parallaxNodes = Array.from(
      document.querySelectorAll<HTMLElement>("[data-builder-parallax], [data-builder-parallax-y]"),
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

    if (!animatedNodes.length && !parallaxNodes.length) return;

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
        const distance = Math.max(1, rect.height + viewportHeight);
        const progress = Math.min(1, Math.max(0, (viewportHeight - rect.top) / distance));
        const isActive = rect.top < viewportHeight && rect.bottom > 0;

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

    const updateParallax = () => {
      const viewportHeight = window.innerHeight || 1;
      const viewportWidth = window.innerWidth || 1;
      parallaxNodes.forEach((node) => {
        const parallax = parseParallaxNode(node);
        if (!parallax) return;
        if (parallax.breakpoint && viewportWidth < breakpointPixels(parallax.breakpoint)) {
          node.style.removeProperty("transform");
          node.style.removeProperty("opacity");
          node.style.removeProperty("filter");
          return;
        }

        const scrollElement = parallaxScrollParent(node);
        const scrollTop = scrollElement.scrollTop;
        const isDocumentScroll = scrollElement === document.scrollingElement || scrollElement === document.documentElement;
        const scrollViewportHeight = isDocumentScroll
          ? viewportHeight
          : scrollElement.getBoundingClientRect().height;
        const target = resolveParallaxTarget(node, parallax.target);
        const maxScroll = Math.max(0, scrollElement.scrollHeight - scrollViewportHeight);
        const scrollViewportTop = isDocumentScroll
          ? 0
          : scrollElement.getBoundingClientRect().top;
        const targetTop = layoutOffsetTop(target) - (isDocumentScroll ? 0 : layoutOffsetTop(scrollElement));
        const startOffset = resolveParallaxOffset(parallax.start, target, viewportHeight, viewportWidth);
        const endOffset = resolveParallaxOffset(parallax.end, target, viewportHeight, viewportWidth);
        const start = Math.max(0, targetTop - scrollViewportHeight + startOffset);
        // UIkit's default parallax interval runs from the target entering at
        // the viewport bottom until the target's bottom reaches the viewport
        // top. Keep the target height in the endpoint exactly as UIkit does.
        const end = Math.min(maxScroll, targetTop + target.offsetHeight - endOffset);
        const progress = start < end
          ? Math.min(1, Math.max(0, (scrollTop - start) / (end - start)))
          : 1;
        const easing = typeof parallax.easing === "number" ? parallax.easing : 0;
        const eased = Number.isFinite(easing)
          ? easing >= 0
            ? Math.pow(progress, easing + 1)
            : 1 - Math.pow(1 - progress, 1 - easing)
          : progress;
        const x = interpolateStops(parallax.x, eased, "x", node, viewportHeight, viewportWidth);
        const y = interpolateStops(parallax.y, eased, "y", node, viewportHeight, viewportWidth);
        const scale = interpolateStops(parallax.scale, eased, "scale", node, viewportHeight, viewportWidth);
        const rotate = interpolateStops(parallax.rotate, eased, "rotate", node, viewportHeight, viewportWidth);
        const opacity = interpolateStops(parallax.opacity, eased, "opacity", node, viewportHeight, viewportWidth);
        const blur = interpolateStops(parallax.blur, eased, "blur", node, viewportHeight, viewportWidth);
        const transform = [
          x !== undefined ? `translateX(${x}${x.endsWith("%") || x.endsWith("vw") || x.endsWith("vh") || x.endsWith("px") ? "" : "px"})` : "",
          y !== undefined ? `translateY(${y}${y.endsWith("%") || y.endsWith("vw") || y.endsWith("vh") || y.endsWith("px") ? "" : "px"})` : "",
          rotate !== undefined ? `rotate(${rotate}deg)` : "",
          scale !== undefined ? `scale(${scale})` : "",
        ].filter(Boolean).join(" ");
        node.style.willChange = "transform";
        node.style.transform = transform;
        if (opacity !== undefined) node.style.opacity = opacity;
        if (blur !== undefined) node.style.filter = `blur(${blur}${blur.endsWith("px") ? "" : "px"})`;
        if (parallax.transformOrigin) node.style.transformOrigin = parallax.transformOrigin.replaceAll("-", " ");
        if (parallax.zIndex) node.style.zIndex = "1";
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
      parallaxNodes.forEach((node) => {
        node.style.removeProperty("transform");
        node.style.removeProperty("opacity");
        node.style.removeProperty("filter");
      });
      return;
    }

    const isTriggered = (entry: IntersectionObserverEntry) => {
      const node = entry.target as HTMLElement;
      if (entry.isIntersecting) return true;

      const rawOffset = node.dataset.builderTriggerOffset;
      const offset = rawOffset ? Number(rawOffset) : NaN;
      if (!Number.isFinite(offset)) return false;

      const vh = window.innerHeight;
      const triggerBottom = vh * (1 - offset / 100);
      return entry.boundingClientRect.top <= triggerBottom;
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const node = entry.target as HTMLElement;
          const playOnce = node.dataset.builderAnimateOnce !== "false";

          if (!isTriggered(entry)) {
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
        rootMargin: "0px 0px 0px 0px",
        threshold: 0,
      },
    );

    animatedNodes.forEach((node) => observer.observe(node));
    let rafId = 0;
    const requestProgressUpdate = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        updatePinnedProgress();
        updateScrollProgress();
        updateParallax();
      });
    };

    updatePinnedProgress();
    updateScrollProgress();
    updateParallax();
    window.addEventListener("scroll", requestProgressUpdate, { passive: true });
    window.addEventListener("resize", requestProgressUpdate);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(rafId);
      parallaxNodes.forEach((node) => {
        node.style.removeProperty("transform");
        node.style.removeProperty("will-change");
      });
      window.removeEventListener("scroll", requestProgressUpdate);
      window.removeEventListener("resize", requestProgressUpdate);
    };
  }, []);

  return null;
}
