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
  const [animationRuntimeVersion, setAnimationRuntimeVersion] = useState(0);

  useEffect(() => {
    let firstFrame = 0;
    let secondFrame = 0;
    let cancelled = false;
    const hasAnimationNodes = (node: Node) =>
      node instanceof Element && Boolean(
        node.matches("[data-builder-parallax], [data-builder-parallax-y], [data-builder-animate]") ||
        node.querySelector("[data-builder-parallax], [data-builder-parallax-y], [data-builder-animate]"),
      );

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

    // The document runtime is intentionally mounted once, while page changes
    // replace the rendered builder subtree beneath it. Remount the animation
    // owner when imported animation nodes are replaced so parallax never keeps
    // stale geometry or stale scroll-parent bindings from the previous page.
    const contentObserver = new MutationObserver((records) => {
      if (records.some((record) =>
        Array.from(record.addedNodes).some(hasAnimationNodes) ||
        Array.from(record.removedNodes).some(hasAnimationNodes),
      )) {
        setAnimationRuntimeVersion((version) => version + 1);
      }
    });
    contentObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      cancelled = true;
      contentObserver.disconnect();
      if (firstFrame) window.cancelAnimationFrame(firstFrame);
      if (secondFrame) window.cancelAnimationFrame(secondFrame);
    };
  }, []);

  return (
    <>
      {children}
      {ready ? (
        <>
          <BuilderScrollAnimations key={animationRuntimeVersion} />
          <BuilderStickyRuntime />
        </>
      ) : null}
    </>
  );
}
