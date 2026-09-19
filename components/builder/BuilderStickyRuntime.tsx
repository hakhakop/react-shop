"use client";

import { useEffect } from "react";
import { isBuilderIframePreview } from "@/lib/builderIframePreview";

type UikitStickyInstance = {
  $destroy?: (removeElement?: boolean) => void;
  $emit?: (event: string) => void;
};
type UikitRuntime = {
  sticky: (element: HTMLElement, options?: Record<string, unknown>) => UikitStickyInstance;
};

/** Mount UIkit's canonical Sticky implementation for imported sections. */
export default function BuilderStickyRuntime() {
  useEffect(() => {
    // Sticky sections are published-site behavior. In the editor iframe they
    // compete with selection geometry and can move the canvas while scrolling.
    if (isBuilderIframePreview()) return;
    let disposed = false;
    let uikit: UikitRuntime | null = null;
    const instances = new Map<HTMLElement, UikitStickyInstance>();
    const sync = () => {
      if (disposed || !uikit) return;
      const targets = Array.from(document.querySelectorAll<HTMLElement>("[data-uk-sticky]"));
      for (const [section, instance] of instances) {
        if (!targets.includes(section)) {
          instance.$destroy?.(false);
          instances.delete(section);
        }
      }
      for (const target of targets) {
        if (instances.has(target)) continue;
        const declaration = target.dataset.ukSticky ?? "";
        const readOption = (name: string) => declaration.match(new RegExp(`${name}\\s*:\\s*([^;]+)`))?.[1]?.trim();
        const showOnUp = /show-on-up\s*:\s*true/.test(declaration);
        const clsActive = declaration.match(/cls-active\s*:\s*([^;]+)/)?.[1]?.trim();
        const position = readOption("position");
        const overflowFlip = readOption("overflow-flip") === "true";
        const start = readOption("start");
        const end = readOption("end");
        const offset = readOption("offset");
        const offsetEnd = readOption("offset-end");
        const media = readOption("media");
        const instance = uikit.sticky(target, {
          ...(position ? { position } : {}),
          ...(overflowFlip ? { overflowFlip } : {}),
          ...(start ? { start } : {}),
          ...(end ? { end } : {}),
          ...(offset ? { offset } : {}),
          ...(offsetEnd ? { offsetEnd } : {}),
          ...(media ? { media } : {}),
          ...(clsActive ? { clsActive } : {}),
          showOnUp,
        });
        instances.set(target, instance);
        // UIkit measures sticky boundaries after construction. Request one
        // public lifecycle update after the imported section is mounted so
        // Builder does not enter the first scroll with stale geometry.
        instance.$emit?.("update");
      }
    };
    void import("uikit").then((module) => {
      if (disposed) return;
      uikit = (module.default ?? module) as unknown as UikitRuntime;
      sync();
    });
    const observer = new MutationObserver(sync);
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["data-uk-sticky"] });
    return () => {
      disposed = true;
      observer.disconnect();
      for (const instance of instances.values()) instance.$destroy?.(false);
      instances.clear();
    };
  }, []);
  return null;
}
