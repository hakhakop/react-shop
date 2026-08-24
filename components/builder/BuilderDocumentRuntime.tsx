"use client";

import { useEffect, useState, type ReactNode } from "react";
import BuilderScrollAnimations from "@/components/builder/BuilderScrollAnimations";
import BuilderStickyRuntime from "@/components/builder/BuilderStickyRuntime";
import { BUILDER_DOCUMENT_RUNTIME_READY_EVENT } from "@/components/builder/builderDocumentRuntimeReady";

/**
 * Own the document-global animation runtimes once, after the canonical
 * document has finished loading and React has had post-hydration frames to
 * reconcile every streamed shell boundary. The runtimes themselves remain
 * unchanged and continue to discover page and Footer targets document-wide.
 */
export default function BuilderDocumentRuntime({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let firstFrame = 0;
    let secondFrame = 0;
    let cancelled = false;

    // The canonical preview is already hydrated before this client effect
    // runs. Two post-layout frames let streamed Header/content/Footer nodes
    // settle without imposing a fixed one-second dead period after refresh.
    firstFrame = window.requestAnimationFrame(() => {
      secondFrame = window.requestAnimationFrame(() => {
        if (cancelled) return;
        const root = document.querySelector<HTMLElement>('[data-builder-runtime-deferred="true"]');
        if (root) root.dataset.builderRuntimeReady = "true";
        document.dispatchEvent(new Event(BUILDER_DOCUMENT_RUNTIME_READY_EVENT));
        setReady(true);
      });
    });

    return () => {
      cancelled = true;
      if (firstFrame) window.cancelAnimationFrame(firstFrame);
      if (secondFrame) window.cancelAnimationFrame(secondFrame);
    };
  }, []);

  return (
    <>
      {children}
      {ready ? (
        <>
          <BuilderScrollAnimations />
          <BuilderStickyRuntime />
        </>
      ) : null}
    </>
  );
}
