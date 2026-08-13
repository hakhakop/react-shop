"use client";

import { useEffect, type RefObject } from "react";

type UikitGridInstance = {
  $destroy?: (remove?: boolean) => void;
  $emit?: (event: string) => void;
};

type UikitGridApi = {
  grid: (element: HTMLElement, options?: Record<string, unknown>) => UikitGridInstance;
};

/**
 * Shared client bridge for UIkit Grid behavior that CSS classes alone cannot
 * provide (currently masonry packing).  Components retain ownership of their
 * semantic options; this hook only owns UIkit's imperative lifecycle.
 */
export function useUikitGridRuntime(
  rootRef: RefObject<HTMLElement | null>,
  options?: { masonry?: "pack" | "next" | false; enabled?: boolean; revision?: unknown },
) {
  const enabled = options?.enabled === true;
  const masonry = options?.masonry || false;

  useEffect(() => {
    if (!enabled || !masonry || !rootRef.current) return;

    let cancelled = false;
    let instance: UikitGridInstance | undefined;

    void import("uikit").then((module) => {
      if (cancelled || !rootRef.current) return;
      const UIkit = (module.default ?? module) as unknown as UikitGridApi;
      instance = UIkit.grid(rootRef.current, { masonry });
      // UIkit measures after construction. Trigger an update once React has
      // committed the item tree so Builder and storefront share its geometry.
      instance.$emit?.("update");
    });

    return () => {
      cancelled = true;
      instance?.$destroy?.();
    };
  }, [enabled, masonry, options?.revision, rootRef]);
}
