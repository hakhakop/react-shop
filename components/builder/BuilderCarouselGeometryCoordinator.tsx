"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from "react";
import type { Swiper as SwiperInstance } from "swiper";

type BuilderCarouselGeometryContextValue = {
  register: (swiper: SwiperInstance) => () => void;
};

const BuilderCarouselGeometryContext =
  createContext<BuilderCarouselGeometryContextValue | null>(null);

const GEOMETRY_SETTLE_DELAY_MS = 80;
const CONTINUOUS_GEOMETRY_UPDATE_INTERVAL_MS = 160;
const WIDTH_CHANGE_EPSILON_PX = 0.5;

export function useBuilderCarouselGeometryCoordinator() {
  return useContext(BuilderCarouselGeometryContext);
}

export function BuilderCarouselGeometryCoordinator({
  children,
  continuousUpdates = false,
}: {
  children: ReactNode;
  continuousUpdates?: boolean;
}) {
  const instancesByElementRef = useRef(new Map<Element, SwiperInstance>());
  const lastWidthByElementRef = useRef(new Map<Element, number>());
  const dirtyInstancesRef = useRef(new Set<SwiperInstance>());
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const settleTimerRef = useRef<number | null>(null);
  const continuousTimerRef = useRef<number | null>(null);
  const flushFrameRef = useRef<number | null>(null);
  const continuousUpdatesRef = useRef(continuousUpdates);
  continuousUpdatesRef.current = continuousUpdates;

  const flushDirtyInstances = useCallback((settled: boolean) => {
    if (settled) {
      if (continuousTimerRef.current !== null) {
        window.clearTimeout(continuousTimerRef.current);
        continuousTimerRef.current = null;
      }
      settleTimerRef.current = null;
    } else {
      continuousTimerRef.current = null;
    }

    if (dirtyInstancesRef.current.size === 0) return;
    if (flushFrameRef.current !== null) return;

    flushFrameRef.current = window.requestAnimationFrame(() => {
      flushFrameRef.current = null;
      const instances = Array.from(dirtyInstancesRef.current);
      dirtyInstancesRef.current.clear();
      const measureStart = performance.now();
      let updatedInstanceCount = 0;

      for (const swiper of instances) {
        const element = swiper.el;
        if (
          swiper.destroyed ||
          !(element instanceof Element) ||
          !element.isConnected
        ) {
          continue;
        }
        swiper.update();
        updatedInstanceCount += 1;
        if (process.env.NODE_ENV !== "production") {
          const previousCount = Number(
            element.getAttribute("data-builder-geometry-update-count") ?? 0,
          );
          element.setAttribute(
            "data-builder-geometry-update-count",
            String(previousCount + 1),
          );
        }
      }

      if (process.env.NODE_ENV !== "production") {
        performance.measure("builder-carousel-geometry-update-batch", {
          start: measureStart,
          end: performance.now(),
          detail: { updatedInstanceCount },
        });
      }
    });
  }, []);

  const scheduleGeometryUpdate = useCallback(() => {
    if (settleTimerRef.current !== null) {
      window.clearTimeout(settleTimerRef.current);
    }
    settleTimerRef.current = window.setTimeout(
      () => flushDirtyInstances(true),
      GEOMETRY_SETTLE_DELAY_MS,
    );

    // Long-running device/sidebar resizes still receive bounded live updates,
    // but every carousel shares this one timer instead of scheduling its own.
    if (
      continuousUpdatesRef.current &&
      continuousTimerRef.current === null
    ) {
      continuousTimerRef.current = window.setTimeout(
        () => flushDirtyInstances(false),
        CONTINUOUS_GEOMETRY_UPDATE_INTERVAL_MS,
      );
    }
  }, [flushDirtyInstances]);

  useEffect(() => {
    if (continuousUpdates || continuousTimerRef.current === null) return;
    window.clearTimeout(continuousTimerRef.current);
    continuousTimerRef.current = null;
  }, [continuousUpdates]);

  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const swiper = instancesByElementRef.current.get(entry.target);
        if (!swiper) continue;

        const nextWidth = entry.contentRect.width;
        const previousWidth = lastWidthByElementRef.current.get(entry.target);
        lastWidthByElementRef.current.set(entry.target, nextWidth);
        if (
          previousWidth !== undefined &&
          Math.abs(nextWidth - previousWidth) <= WIDTH_CHANGE_EPSILON_PX
        ) {
          continue;
        }
        dirtyInstancesRef.current.add(swiper);
      }

      if (dirtyInstancesRef.current.size > 0) scheduleGeometryUpdate();
    });
    resizeObserverRef.current = observer;
    for (const element of instancesByElementRef.current.keys()) {
      observer.observe(element);
    }

    return () => {
      observer.disconnect();
      resizeObserverRef.current = null;
      if (settleTimerRef.current !== null) {
        window.clearTimeout(settleTimerRef.current);
      }
      if (continuousTimerRef.current !== null) {
        window.clearTimeout(continuousTimerRef.current);
      }
      if (flushFrameRef.current !== null) {
        window.cancelAnimationFrame(flushFrameRef.current);
      }
      settleTimerRef.current = null;
      continuousTimerRef.current = null;
      flushFrameRef.current = null;
      dirtyInstancesRef.current.clear();
      instancesByElementRef.current.clear();
      lastWidthByElementRef.current.clear();
    };
  }, [scheduleGeometryUpdate]);

  const register = useCallback((swiper: SwiperInstance) => {
    const element = swiper.el;
    if (!(element instanceof Element)) return () => undefined;

    instancesByElementRef.current.set(element, swiper);
    lastWidthByElementRef.current.set(
      element,
      element.getBoundingClientRect().width,
    );
    resizeObserverRef.current?.observe(element);
    if (process.env.NODE_ENV !== "production") {
      element.setAttribute("data-builder-geometry-coordinated", "true");
      element.setAttribute("data-builder-geometry-update-count", "0");
    }

    return () => {
      if (instancesByElementRef.current.get(element) !== swiper) return;
      resizeObserverRef.current?.unobserve(element);
      instancesByElementRef.current.delete(element);
      lastWidthByElementRef.current.delete(element);
      dirtyInstancesRef.current.delete(swiper);
      if (process.env.NODE_ENV !== "production") {
        element.removeAttribute("data-builder-geometry-coordinated");
        element.removeAttribute("data-builder-geometry-update-count");
      }
    };
  }, []);

  const value = useMemo(() => ({ register }), [register]);

  return (
    <BuilderCarouselGeometryContext.Provider value={value}>
      {children}
    </BuilderCarouselGeometryContext.Provider>
  );
}
