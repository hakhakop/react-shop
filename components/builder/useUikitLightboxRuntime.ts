"use client";

import { useEffect, type RefObject } from "react";

type UikitLightboxInstance = {
  $destroy?: (remove?: boolean) => void;
  $emit?: (event: string) => void;
};

type UikitLightboxApi = {
  lightbox: (element: HTMLElement, options?: Record<string, unknown>) => UikitLightboxInstance;
  use?: (plugin: unknown) => void;
};

let iconsRegistered = false;

/**
 * Shared client bridge for UIkit Lightbox. Components keep ownership of their
 * media/link semantics; this hook owns only UIkit's imperative lifecycle.
 */
export function useUikitLightboxRuntime(
  rootRef: RefObject<HTMLElement | null>,
  options?: { enabled?: boolean; toggle?: string; revision?: unknown },
) {
  const enabled = options?.enabled === true;
  const toggle = options?.toggle ?? "a[data-type]";

  useEffect(() => {
    if (!enabled || !rootRef.current) return;

    let cancelled = false;
    let instance: UikitLightboxInstance | undefined;

    void Promise.all([import("uikit"), import("uikit/dist/js/uikit-icons")]).then(([module, iconsModule]) => {
      if (cancelled || !rootRef.current) return;

      const UIkit = (module.default ?? module) as unknown as UikitLightboxApi;
      if (!iconsRegistered) {
        UIkit.use?.(iconsModule.default ?? iconsModule);
        iconsRegistered = true;
      }

      instance = UIkit.lightbox(rootRef.current, { toggle });
      // React has committed the trigger collection; let UIkit discover it on
      // the same lifecycle path in Builder and storefront.
      instance.$emit?.("update");
    });

    return () => {
      cancelled = true;
      instance?.$destroy?.();
    };
  }, [enabled, options?.revision, rootRef, toggle]);
}
