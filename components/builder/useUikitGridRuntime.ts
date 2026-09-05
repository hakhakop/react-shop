"use client";

import { useEffect, type RefObject } from "react";
import { waitForBuilderDocumentRuntime } from "@/components/builder/builderDocumentRuntimeReady";

type UikitGridInstance = {
  $destroy?: (remove?: boolean) => void;
  $emit?: (event: string) => void;
};

type UikitGridApi = {
  grid: (element: HTMLElement, options?: Record<string, unknown>) => UikitGridInstance;
};

type UikitGridRuntimeOptions = {
  masonry?: "pack" | "next" | false;
  parallax?: number;
  parallaxJustify?: boolean;
  parallaxStart?: string;
  parallaxEnd?: string;
  enabled?: boolean;
  revision?: unknown;
};

/**
 * Shared client bridge for UIkit Grid behavior that CSS classes alone cannot
 * provide. Components retain ownership of their semantic options; this hook
 * only owns UIkit's imperative lifecycle for masonry and parallax.
 */
export function useUikitGridRuntime(
  rootRef: RefObject<HTMLElement | null>,
  options?: UikitGridRuntimeOptions,
) {
  const enabled = options?.enabled === true;
  const masonry = options?.masonry || false;
  const parallax = options?.parallax;

  useEffect(() => {
    if (!enabled || !rootRef.current) return;

    let cancelled = false;
    let instance: UikitGridInstance | undefined;

    void waitForBuilderDocumentRuntime(rootRef.current).then(() => import("uikit")).then((module) => {
      if (cancelled || !rootRef.current) return;
      const UIkit = (module.default ?? module) as unknown as UikitGridApi;
      instance = UIkit.grid(rootRef.current, {
        ...(masonry ? { masonry } : {}),
        ...(parallax !== undefined ? { parallax } : {}),
        ...(options?.parallaxJustify ? { parallaxJustify: true } : {}),
        ...(options?.parallaxStart ? { parallaxStart: options.parallaxStart } : {}),
        ...(options?.parallaxEnd ? { parallaxEnd: options.parallaxEnd } : {}),
      });
      // UIkit measures after construction. Trigger an update once React has
      // committed the item tree so Builder and storefront share its geometry.
      instance.$emit?.("update");
    });

    return () => {
      cancelled = true;
      instance?.$destroy?.();
    };
  }, [enabled, masonry, parallax, options?.parallaxJustify, options?.parallaxStart, options?.parallaxEnd, options?.revision, rootRef]);
}
