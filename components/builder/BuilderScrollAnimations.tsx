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
  return (document.scrollingElement as HTMLElement | null) ?? document.documentElement;
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
  // UIkit's `!.tm-grid-expand>*` target means the owning expanded grid item,
  // not the animated image itself. The shared renderer uses a semantic
  // content-layout card/interaction column in place of UIkit's grid item.
  // Keep this distinct from `!.tm-grid-expand`: YOOtheme resolves the latter
  // to the whole expanded row, which is the interpolation boundary for the
  // Hero image parallax. Collapsing both forms to the column makes the
  // animation finish early and causes a jump when the sticky row releases.
  if (selector.includes(".tm-grid-expand>*")) {
    return node.closest(
      ".shop-builder-content-layout-card, .builder-interaction-column, .uk-grid-item-match",
    ) as HTMLElement ?? node;
  }
  if (selector.includes(".tm-grid-expand")) {
    return node.closest(
      ".shop-builder-content-row, .builder-preview-row, [data-builder-object-type=\"row\"]",
    ) as HTMLElement ?? node;
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

const resolveParallaxOffset = (value: string | undefined, target: HTMLElement, viewportHeight: number, viewportWidth: number, targetHeight = target.offsetHeight) => {
  if (!value) return 0;
  return value.replace(/\s+/g, "").replace(/-/g, "+-").split("+").reduce((sum, term) => {
    if (!term) return sum;
    const match = term.match(/^(-?\d+(?:\.\d+)?)(px|vh|vw|%)?$/);
    if (!match) return sum;
    const amount = Number(match[1]);
    const unit = match[2] ?? "px";
    return sum + (unit === "vh" ? amount * viewportHeight / 100 : unit === "vw" ? amount * viewportWidth / 100 : unit === "%" ? amount * targetHeight / 100 : amount);
  }, 0);
};

const stopParts = (stop: BuilderParallaxStop) => {
  const match = stop.value.trim().match(/^(-?\d+(?:\.\d+)?)(.*)$/);
  return match ? { value: Number(match[1]), unit: match[2] || "" } : undefined;
};

const interpolateStops = (stops: BuilderParallaxStop[] | undefined, progress: number, property: string, node: HTMLElement, viewportHeight: number, viewportWidth: number, nodeWidth = node.offsetWidth || 1): string | undefined => {
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
    const dimension = nodeWidth;
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

type Props = {
  /** Enables dashboard-only pause/resume around editor layout churn. */
  dashboardMode?: boolean;
};

type ParallaxRuntime = {
  parallax: BuilderParallaxSettings;
  scrollElement: HTMLElement;
  target: HTMLElement;
  geometry?: ParallaxGeometry;
  applied: AppliedParallaxStyle;
  originalWillChange: string;
};

type AppliedParallaxStyle = {
  transform?: string;
  opacity?: string;
  filter?: string;
  willChange?: string;
};

type ParallaxGeometry = {
  viewportHeight: number;
  viewportWidth: number;
  scrollViewportHeight: number;
  maxScroll: number;
  targetTop: number;
  targetHeight: number;
  nodeWidth: number;
  nodeTop: number;
  nodeHeight: number;
};

export default function BuilderScrollAnimations({ dashboardMode = false }: Props) {
  useEffect(() => {
    // The dashboard renders a footer through StorefrontBuilderRenderer as
    // well. Its storefront animation component is document-wide, so without
    // this guard it would compete with the dashboard runtime and re-promote
    // every Builder parallax node after the dashboard releases it.
    if (!dashboardMode && document.querySelector(".builder-dashboard")) return;
    const layerPromotionMode = dashboardMode || Boolean(document.querySelector(".builder-dashboard"));
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

    const parallaxRuntime = new Map<HTMLElement, ParallaxRuntime>();
    const parallaxScrollTargets = new Set<HTMLElement>();
    const breakpointCache = new Map<string, number>();
    let dashboardPaused = false;
    let documentHidden = document.hidden;
    let dashboardResumeTimer: number | null = null;
    const activeLayoutTransitions = new Set<EventTarget | string>();
    let requestProgressUpdate: (() => void) | null = null;
    const dashboardRoot = dashboardMode
      ? document.querySelector<HTMLElement>(".builder-dashboard")
      : null;
    const dashboardPreview = dashboardMode
      ? document.querySelector<HTMLElement>(".builder-preview-page")
      : null;
    const clearDashboardResumeTimer = () => {
      if (dashboardResumeTimer === null) return;
      window.clearTimeout(dashboardResumeTimer);
      dashboardResumeTimer = null;
    };
    const scheduleDashboardResume = () => {
      if (!dashboardMode) return;
      clearDashboardResumeTimer();
      // The intended CSS transition is 220ms. This bounded fallback covers
      // canceled/ skipped transitions where transitionend never arrives and
      // prevents a stale pause from freezing the Builder until reload.
      dashboardResumeTimer = window.setTimeout(() => {
        dashboardResumeTimer = null;
        // A missing transitionend leaves the target in this set forever;
        // after the intended transition window, treat it as canceled.
        activeLayoutTransitions.clear();
        dashboardPaused = false;
        invalidateLayout(false);
      }, 360);
    };
    const invalidateLayout = (pauseDashboard = false) => {
      parallaxRuntime.forEach((runtime) => {
        runtime.geometry = undefined;
      });
      breakpointCache.clear();
      if (pauseDashboard) {
        dashboardPaused = true;
        scheduleDashboardResume();
      }
      requestProgressUpdate?.();
    };
    const geometryResizeObserver = typeof ResizeObserver !== "undefined"
      ? new ResizeObserver(() => invalidateLayout(false))
      : null;
    if (geometryResizeObserver && document.body) {
      geometryResizeObserver.observe(document.body);
    }
    const invalidateDashboardLayout = () => invalidateLayout(false);
    const dashboardResizeObserver = dashboardPreview
      ? new ResizeObserver(invalidateDashboardLayout)
      : null;
    if (dashboardResizeObserver && dashboardPreview) {
      dashboardResizeObserver.observe(dashboardPreview);
    }
    const dashboardMutationObserver = dashboardRoot
      ? new MutationObserver((records) => {
          const layoutClassNames = new Set([
            "is-sidebar-collapsed",
            "is-inspector-docked",
            "is-inspector-floating",
            "is-inspector-closed",
            "is-inspector-collapsed",
            "is-sidebar-resizing",
          ]);
          if (records.some((record) => {
            const target = record.target as HTMLElement;
            if (target === dashboardRoot) {
              const oldClasses = new Set((record.oldValue ?? "").split(/\s+/));
              const newClasses = new Set(target.className.split(/\s+/));
              return Array.from(layoutClassNames).some(
                (name) => oldClasses.has(name) !== newClasses.has(name),
              );
            }
            return Boolean(target.closest?.(".builder-sidebar, .builder-floating-inspector"));
          })) {
            // Class/layout churn starts the pause before the first transition
            // frame. The transition boundary below is the only place that
            // resumes the runtime.
            invalidateLayout(true);
          }
        })
      : null;
    dashboardMutationObserver?.observe(dashboardRoot as HTMLElement, {
      attributes: true,
      attributeFilter: ["class"],
      attributeOldValue: true,
      subtree: true,
    });

    const isLayoutTransition = (event: TransitionEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target || !dashboardRoot) return false;
      const property = event.propertyName;
      if (target === dashboardRoot) {
        return property === "grid-template-columns" || property === "width";
      }
      return Boolean(
        target.closest?.(".builder-floating-inspector") &&
          (property === "width" || property === "grid-template-columns"),
      );
    };
    const handleTransitionStart = (event: Event) => {
      if (!isLayoutTransition(event as TransitionEvent)) return;
      if (!event.target) return;
      activeLayoutTransitions.add(event.target);
      invalidateLayout(true);
    };
    const handleTransitionEnd = (event: Event) => {
      if (!isLayoutTransition(event as TransitionEvent)) return;
      if (event.target) activeLayoutTransitions.delete(event.target);
      if (activeLayoutTransitions.size > 0) return;
      clearDashboardResumeTimer();
      dashboardPaused = false;
      invalidateLayout(false);
    };
    const handleTransitionCancel = (event: Event) => {
      if (!isLayoutTransition(event as TransitionEvent)) return;
      if (event.target) activeLayoutTransitions.delete(event.target);
      if (activeLayoutTransitions.size > 0) return;
      clearDashboardResumeTimer();
      dashboardPaused = false;
      invalidateLayout(false);
    };
    const handleExternalTransitionStart = () => {
      activeLayoutTransitions.add("inspector-resize");
      invalidateLayout(true);
    };
    const handleExternalTransitionEnd = () => {
      activeLayoutTransitions.delete("inspector-resize");
      if (activeLayoutTransitions.size > 0) return;
      clearDashboardResumeTimer();
      dashboardPaused = false;
      invalidateLayout(false);
    };
    dashboardRoot?.addEventListener("transitionstart", handleTransitionStart, true);
    dashboardRoot?.addEventListener("transitionend", handleTransitionEnd, true);
    dashboardRoot?.addEventListener("transitioncancel", handleTransitionCancel, true);
    window.addEventListener("builder:layout-transition-start", handleExternalTransitionStart);
    window.addEventListener("builder:layout-transition-end", handleExternalTransitionEnd);

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
      if (dashboardPaused || documentHidden) return;
      const viewportHeight = window.innerHeight || 1;
      const viewportWidth = window.innerWidth || 1;
      const writes: Array<{ node: HTMLElement; transform?: string; opacity?: string; filter?: string; origin?: string; zIndex?: string; willChange?: string; clear?: boolean }> = [];
      parallaxNodes.forEach((node) => {
        let runtime = parallaxRuntime.get(node);
        if (!runtime) {
          const parallax = parseParallaxNode(node);
          if (!parallax) return;
          const applied: AppliedParallaxStyle = {};
          runtime = {
            parallax,
            scrollElement: parallaxScrollParent(node),
            target: resolveParallaxTarget(node, parallax.target),
            applied,
            originalWillChange: node.style.willChange,
          };
          geometryResizeObserver?.observe(runtime.target);
          geometryResizeObserver?.observe(node);
          parallaxRuntime.set(node, runtime);
          // UIkit listens to the element returned by scrollParent(), not only
          // the window. Imported pages can place parallax inside an overflow
          // surface, so subscribe to each resolved parent once while keeping
          // the existing RAF coalescing path for low-cost scroll handling.
          if (runtime.scrollElement !== document.scrollingElement && runtime.scrollElement !== document.documentElement) {
            if (!parallaxScrollTargets.has(runtime.scrollElement)) {
              parallaxScrollTargets.add(runtime.scrollElement);
              if (requestProgressUpdate) {
                runtime.scrollElement.addEventListener("scroll", requestProgressUpdate, { passive: true });
              }
            }
          }
        }
        const { parallax, scrollElement, target } = runtime;
        if (!parallax) return;
        const breakpoint = parallax.breakpoint
          ? (breakpointCache.get(parallax.breakpoint) ?? breakpointPixels(parallax.breakpoint))
          : 0;
        if (parallax.breakpoint) breakpointCache.set(parallax.breakpoint, breakpoint);
        if (parallax.breakpoint && viewportWidth < breakpoint) {
          writes.push({ node, clear: true });
          return;
        }

        const scrollTop = scrollElement.scrollTop;
        const isDocumentScroll = scrollElement === document.scrollingElement || scrollElement === document.documentElement;
        let geometry = runtime.geometry;
        if (!geometry || geometry.viewportHeight !== viewportHeight || geometry.viewportWidth !== viewportWidth) {
          const scrollViewportHeight = isDocumentScroll
            ? viewportHeight
            : scrollElement.getBoundingClientRect().height;
          const targetHeight = target.offsetHeight;
          // offsetTop chains are not document coordinates when the Builder
          // content surface introduces positioned/ transformed wrappers. Use
          // the canonical rect-to-scroll-origin measurement so imported
          // `target: !.tm-grid-expand>*` intervals match UIkit exactly.
          const targetRect = target.getBoundingClientRect();
          const scrollRect = isDocumentScroll
            ? undefined
            : scrollElement.getBoundingClientRect();
          const nodeRect = node.getBoundingClientRect();
          geometry = {
            viewportHeight,
            viewportWidth,
            scrollViewportHeight,
            maxScroll: Math.max(0, scrollElement.scrollHeight - scrollViewportHeight),
            targetTop: isDocumentScroll
              ? targetRect.top + window.scrollY
              : targetRect.top - (scrollRect?.top ?? 0) + scrollElement.scrollTop,
            targetHeight,
            nodeWidth: node.offsetWidth || 1,
            nodeTop: isDocumentScroll
              ? nodeRect.top + window.scrollY
              : nodeRect.top - (scrollRect?.top ?? 0) + scrollElement.scrollTop,
            nodeHeight: nodeRect.height,
          };
          runtime.geometry = geometry;
        }
        const { scrollViewportHeight, maxScroll, targetTop, targetHeight, nodeWidth } = geometry;
        if (layerPromotionMode) {
          const nearMargin = scrollViewportHeight * 1.5;
          const viewportTop = isDocumentScroll ? window.scrollY : scrollElement.scrollTop;
          const viewportBottom = viewportTop + scrollViewportHeight;
          const nodeOutsideNearRange = geometry.nodeTop + geometry.nodeHeight < viewportTop - nearMargin
            || geometry.nodeTop > viewportBottom + nearMargin;
          if (nodeOutsideNearRange) {
            const applied = runtime.applied;
            if (applied.willChange !== undefined) {
              if (runtime.originalWillChange) node.style.willChange = runtime.originalWillChange;
              else node.style.removeProperty("will-change");
              applied.willChange = undefined;
            }
            return;
          }
        }
        const startOffset = resolveParallaxOffset(parallax.start, target, viewportHeight, viewportWidth, targetHeight);
        const endOffset = resolveParallaxOffset(parallax.end, target, viewportHeight, viewportWidth, targetHeight);
        const start = Math.max(0, targetTop - scrollViewportHeight + startOffset);
        // UIkit's default parallax interval runs from the target entering at
        // the viewport bottom until the target's bottom reaches the viewport
        // top. Keep the target height in the endpoint exactly as UIkit does.
        const end = Math.min(maxScroll, targetTop + targetHeight - endOffset);
        const progress = start < end
          ? Math.min(1, Math.max(0, (scrollTop - start) / (end - start)))
          : 1;
        const easing = typeof parallax.easing === "number" ? parallax.easing : 0;
        const eased = Number.isFinite(easing)
          ? easing >= 0
            ? Math.pow(progress, easing + 1)
            : 1 - Math.pow(1 - progress, 1 - easing)
          : progress;
        const x = interpolateStops(parallax.x, eased, "x", node, viewportHeight, viewportWidth, nodeWidth);
        const y = interpolateStops(parallax.y, eased, "y", node, viewportHeight, viewportWidth, nodeWidth);
        const scale = interpolateStops(parallax.scale, eased, "scale", node, viewportHeight, viewportWidth, nodeWidth);
        const rotate = interpolateStops(parallax.rotate, eased, "rotate", node, viewportHeight, viewportWidth, nodeWidth);
        const opacity = interpolateStops(parallax.opacity, eased, "opacity", node, viewportHeight, viewportWidth, nodeWidth);
        const blur = interpolateStops(parallax.blur, eased, "blur", node, viewportHeight, viewportWidth, nodeWidth);
        const transform = [
          x !== undefined ? `translateX(${x}${x.endsWith("%") || x.endsWith("vw") || x.endsWith("vh") || x.endsWith("px") ? "" : "px"})` : "",
          y !== undefined ? `translateY(${y}${y.endsWith("%") || y.endsWith("vw") || y.endsWith("vh") || y.endsWith("px") ? "" : "px"})` : "",
          rotate !== undefined ? `rotate(${rotate}deg)` : "",
          scale !== undefined ? `scale(${scale})` : "",
        ].filter(Boolean).join(" ");
        const willChange = layerPromotionMode && parallax.opacity?.length
          ? "transform, opacity"
          : "transform";
        writes.push({
          node,
          transform,
          ...(opacity !== undefined ? { opacity } : {}),
          ...(blur !== undefined ? { filter: `blur(${blur}${blur.endsWith("px") ? "" : "px"})` } : {}),
          ...(parallax.transformOrigin ? { origin: parallax.transformOrigin.replaceAll("-", " ") } : {}),
          ...(parallax.zIndex ? { zIndex: "1" } : {}),
          willChange,
        });
      });
      writes.forEach(({ node, clear, transform, opacity, filter, origin, zIndex, willChange }) => {
        const applied = parallaxRuntime.get(node)?.applied;
        if (!applied) return;
        if (clear) {
          if (applied.transform !== undefined) {
            node.style.removeProperty("transform");
            applied.transform = undefined;
          }
          if (applied.opacity !== undefined) {
            node.style.removeProperty("opacity");
            applied.opacity = undefined;
          }
          if (applied.filter !== undefined) {
            node.style.removeProperty("filter");
            applied.filter = undefined;
          }
          return;
        }
        const nextTransform = transform ?? "";
        if (applied.transform !== nextTransform) {
          node.style.transform = nextTransform;
          applied.transform = nextTransform;
        }
        if (opacity !== undefined && applied.opacity !== opacity) {
          node.style.opacity = opacity;
          applied.opacity = opacity;
        }
        if (filter !== undefined && applied.filter !== filter) {
          node.style.filter = filter;
          applied.filter = filter;
        }
        if (willChange !== undefined && applied.willChange !== willChange) {
          if (node.style.willChange !== willChange) node.style.willChange = willChange;
          applied.willChange = willChange;
        }
        if (origin !== undefined) node.style.transformOrigin = origin;
        if (zIndex !== undefined) node.style.zIndex = zIndex;
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
    requestProgressUpdate = () => {
      if (documentHidden) return;
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        updatePinnedProgress();
        updateScrollProgress();
        updateParallax();
      });
    };

    const handleResize = () => {
      invalidateLayout(false);
    };
    const handleVisibilityChange = () => {
      documentHidden = document.hidden;
      if (!documentHidden) requestProgressUpdate?.();
    };
    const handleImageLoad = (event: Event) => {
      if (event.target instanceof HTMLImageElement) invalidateLayout(false);
    };

    updatePinnedProgress();
    updateScrollProgress();
    updateParallax();
    window.addEventListener("scroll", requestProgressUpdate, { passive: true });
    window.addEventListener("resize", handleResize);
    window.addEventListener("load", handleImageLoad, true);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      observer.disconnect();
      dashboardResizeObserver?.disconnect();
      geometryResizeObserver?.disconnect();
      dashboardMutationObserver?.disconnect();
      dashboardRoot?.removeEventListener("transitionstart", handleTransitionStart, true);
      dashboardRoot?.removeEventListener("transitionend", handleTransitionEnd, true);
      dashboardRoot?.removeEventListener("transitioncancel", handleTransitionCancel, true);
      window.removeEventListener("builder:layout-transition-start", handleExternalTransitionStart);
      window.removeEventListener("builder:layout-transition-end", handleExternalTransitionEnd);
      cancelAnimationFrame(rafId);
      clearDashboardResumeTimer();
      parallaxNodes.forEach((node) => {
        node.style.removeProperty("transform");
        const runtime = parallaxRuntime.get(node);
        if (dashboardMode && runtime?.originalWillChange) node.style.willChange = runtime.originalWillChange;
        else node.style.removeProperty("will-change");
      });
      parallaxScrollTargets.forEach((scrollTarget) => {
        if (requestProgressUpdate) {
          scrollTarget.removeEventListener("scroll", requestProgressUpdate);
        }
      });
      window.removeEventListener("scroll", requestProgressUpdate);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("load", handleImageLoad, true);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return null;
}
