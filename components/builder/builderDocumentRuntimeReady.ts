export const BUILDER_DOCUMENT_RUNTIME_READY_EVENT = "builder:document-runtime-ready";

/** Delay UIkit auto-boot only inside the canonical deferred runtime boundary. */
export function waitForBuilderDocumentRuntime(element: Element) {
  const root = element.closest<HTMLElement>('[data-builder-runtime-deferred="true"]');
  if (!root || root.dataset.builderRuntimeReady === "true") return Promise.resolve();

  return new Promise<void>((resolve) => {
    document.addEventListener(BUILDER_DOCUMENT_RUNTIME_READY_EVENT, () => resolve(), { once: true });
  });
}
