"use client";

import { useEffect } from "react";
import type { BuilderInteractionTarget } from "@/components/dashboard/builderInteraction";

export const BUILDER_IFRAME_SELECTION_SOURCE = "webpages-builder-iframe-selection";

type SelectionMessage = {
  source: typeof BUILDER_IFRAME_SELECTION_SOURCE;
  type: "ready" | "context" | "select" | "focus" | "rect" | "scroll-start" | "navigate" | "exit-shell" | "insert" | "move";
  target?: BuilderInteractionTarget;
  sourceTarget?: BuilderInteractionTarget;
  placement?: "above" | "below";
  scrollIntoView?: boolean;
  rect?: { x: number; y: number; width: number; height: number } | null;
  href?: string;
  linkLabel?: string;
  shell?: "header" | "footer" | null;
  insertionIndex?: number;
};

type SelectionRect = { x: number; y: number; width: number; height: number };

/**
 * UIkit rows legitimately use a negative inline grid margin to cancel the
 * first column gutter. That layout geometry must not make the editor's
 * selection wireframe escape the visible iframe canvas.
 */
export function visibleBuilderSelectionRect(
  rect: SelectionRect,
  target: BuilderInteractionTarget | null,
  viewportWidth: number,
): SelectionRect {
  if (target?.type !== "row" || viewportWidth <= 0) return rect;
  const left = Math.max(0, rect.x);
  const right = Math.min(viewportWidth, rect.x + rect.width);
  return {
    ...rect,
    x: left,
    width: Math.max(0, right - left),
  };
}

function targetFromClick(event: MouseEvent | DragEvent): BuilderInteractionTarget | null {
  const element = event.target instanceof Element ? event.target : null;
  const row = element?.closest<HTMLElement>('[data-builder-object-type="row"]');
  if (row) {
    const rect = row.getBoundingClientRect();
    // Responsive/header duplicate trees can retain an identity wrapper with
    // zero geometry. It must not look like a row whose right/bottom gutter is
    // at coordinate 0, otherwise every click in that tree becomes Row 1.
    const hasGeometry = rect.width > 0 && rect.height > 0;
    const inRowGutter = hasGeometry && (
      event.clientX - rect.left <= 12 || rect.right - event.clientX <= 12 ||
      event.clientY - rect.top <= 12 || rect.bottom - event.clientY <= 12
    );
    const sectionId = row.dataset.builderSectionId;
    const rowIndex = Number(row.dataset.builderRowIndex);
    if (inRowGutter && sectionId && Number.isInteger(rowIndex)) {
      return { type: "row", sectionId, rowIndex };
    }
  }
  const owner = element?.closest<HTMLElement>("[data-builder-object-type]");
  if (!owner && element?.closest(".site-header")) {
    return { type: "section", sectionId: "header-document" };
  }
  if (!owner && element?.closest('footer[data-builder-page-root="true"]')) {
    return { type: "section", sectionId: "footer-document" };
  }
  if (!owner) return null;
  const type = owner.dataset.builderObjectType;
  const sectionId = owner.dataset.builderSectionId;
  if (!sectionId) return null;
  if (type === "section") return { type, sectionId };
  if (type === "row") {
    const rowIndex = Number(owner.dataset.builderRowIndex);
    return Number.isInteger(rowIndex) ? { type, sectionId, rowIndex } : null;
  }
  const columnKey = owner.dataset.builderColumnKey;
  if (!columnKey) return null;
  if (type === "column") return { type, sectionId, columnKey };
  const blockKey = owner.dataset.builderBlockKey;
  return type === "block" && blockKey
    ? { type, sectionId, columnKey, blockKey }
    : null;
}

function targetSelector(
  target: BuilderInteractionTarget,
  editingShell: "header" | "footer" | null,
) {
  if (target.type === "section" && target.sectionId === "header-document") return ".site-header";
  if (target.type === "section" && target.sectionId === "footer-document") return 'footer[data-builder-page-root="true"]';
  const sectionId = CSS.escape(target.sectionId);
  const documentScope = editingShell === "footer"
    ? 'footer[data-builder-page-root="true"]'
    : editingShell === "header"
      ? ".site-header"
      : 'main[data-builder-page-root="true"]';
  let selector: string;
  if (target.type === "section") {
    selector = `[data-builder-object-type="section"][data-builder-section-id="${sectionId}"]`;
    return `${documentScope} ${selector}`;
  }
  if (target.type === "row") {
    selector = `[data-builder-object-type="row"][data-builder-section-id="${sectionId}"][data-builder-row-index="${target.rowIndex}"]`;
    return `${documentScope} ${selector}`;
  }
  const columnKey = CSS.escape(target.columnKey);
  if (target.type === "column") {
    selector = `[data-builder-object-type="column"][data-builder-section-id="${sectionId}"][data-builder-column-key="${columnKey}"]`;
    return `${documentScope} ${selector}`;
  }
  selector = `[data-builder-object-type="block"][data-builder-section-id="${sectionId}"][data-builder-column-key="${columnKey}"][data-builder-block-key="${CSS.escape(target.blockKey)}"]`;
  return `${documentScope} ${selector}`;
}

function targetsMatch(
  left: BuilderInteractionTarget | null,
  right: BuilderInteractionTarget | null,
) {
  if (!left || !right || left.type !== right.type || left.sectionId !== right.sectionId) return false;
  if (left.type === "section" && right.type === "section") return true;
  if (left.type === "row" && right.type === "row") return left.rowIndex === right.rowIndex;
  if (left.type === "column" && right.type === "column") return left.columnKey === right.columnKey;
  return left.type === "block" && right.type === "block" &&
    left.columnKey === right.columnKey && left.blockKey === right.blockKey;
}

export default function BuilderIframeSelectionBridge({
  diagnostics = "minimal",
}: {
  diagnostics?: "minimal" | "settled" | "rect" | "toolbar" | "full";
}) {
  useEffect(() => {
    let selectedTarget: BuilderInteractionTarget | null = null;
    let selectedLinkHref: string | null = null;
    const builderContext = new URLSearchParams(window.location.search).get("builderContext");
    let editingShell: "header" | "footer" | null =
      builderContext === "header" || builderContext === "footer"
        ? builderContext
        : null;
    let frame = 0;
    let scrollSettleTimer = 0;
    let scrolling = false;
    let selectedResizeObserver: ResizeObserver | null = null;
    const draggableElements = new Set<HTMLElement>();
    let draggableObserver: MutationObserver | null = null;
    const enableDraggableElement = (element: HTMLElement) => {
      element.draggable = true;
      draggableElements.add(element);
    };
    const enableDraggableWithin = (root: ParentNode) => {
      if (root instanceof HTMLElement && root.matches('[data-builder-object-type="block"]')) {
        enableDraggableElement(root);
      }
      root.querySelectorAll<HTMLElement>('[data-builder-object-type="block"]')
        .forEach(enableDraggableElement);
    };
    const refreshDraggableTarget = () => {
      // Drag must be discoverable in the live canvas. Requiring a successful
      // preliminary selection made header blocks impossible to move whenever
      // an authored interactive child (such as Search) intercepted that click.
      // Every Builder block is a valid source; the drop target determines its
      // new position, so enable native dragging for the full authored surface.
      enableDraggableWithin(document);
    };
    const reportRect = () => {
      frame = 0;
      const element = selectedTarget
        ? document.querySelector<HTMLElement>(targetSelector(selectedTarget, editingShell))
        : null;
      const rect = element?.getBoundingClientRect();
      const visibleRect = rect
        ? visibleBuilderSelectionRect(
            { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
            selectedTarget,
            document.documentElement.clientWidth || window.innerWidth,
          )
        : null;
      const message: SelectionMessage = {
        source: BUILDER_IFRAME_SELECTION_SOURCE,
        type: "rect",
        target: selectedTarget ?? undefined,
        rect: visibleRect,
      };
      window.parent.postMessage(message, window.location.origin);
    };
    const scheduleRect = () => {
      if (!frame) frame = window.requestAnimationFrame(reportRect);
    };
    const observeSelectedElement = () => {
      selectedResizeObserver?.disconnect();
      selectedResizeObserver = null;
      if (diagnostics !== "settled" || !selectedTarget) return;
      const element = document.querySelector<HTMLElement>(targetSelector(selectedTarget, editingShell));
      if (!element) return;
      selectedResizeObserver = new ResizeObserver(() => {
        if (!scrolling) scheduleRect();
      });
      try {
        selectedResizeObserver.observe(element);
      } catch {
        // A page/shell transition can remove the selected node between the
        // query above and observer registration. Treat it as a stale target;
        // the next selection or focus message will establish a fresh one.
        selectedResizeObserver.disconnect();
        selectedResizeObserver = null;
      }
    };
    const handleSettledScroll = () => {
      if (!scrolling) {
        scrolling = true;
        window.parent.postMessage({
          source: BUILDER_IFRAME_SELECTION_SOURCE,
          type: "scroll-start",
          target: selectedTarget ?? undefined,
        } satisfies SelectionMessage, window.location.origin);
      }
      window.clearTimeout(scrollSettleTimer);
      scrollSettleTimer = window.setTimeout(() => {
        scrolling = false;
        reportRect();
      }, 140);
    };
    const selectTarget = (
      target: BuilderInteractionTarget,
      link?: { href: string; label?: string | null } | null,
    ) => {
      selectedTarget = target;
      selectedLinkHref = link?.href || null;
      observeSelectedElement();
      window.parent.postMessage({
        source: BUILDER_IFRAME_SELECTION_SOURCE,
        type: "select",
        target,
        ...(link?.href ? { href: link.href } : {}),
        ...(link?.label ? { linkLabel: link.label } : {}),
        shell: target.sectionId === "header-document"
          ? "header"
          : target.sectionId === "footer-document"
            ? "footer"
            : undefined,
      } satisfies SelectionMessage, window.location.origin);
      if (diagnostics !== "minimal") scheduleRect();
    };
    const handleClick = (event: MouseEvent) => {
      const insertionControl = event.target instanceof Element
        ? event.target.closest<HTMLElement>("[data-builder-insertion-index]")
        : null;
      if (insertionControl) {
        const sectionId = insertionControl.dataset.builderSectionId;
        const columnKey = insertionControl.dataset.builderColumnKey;
        const insertionIndex = Number(insertionControl.dataset.builderInsertionIndex);
        if (sectionId && columnKey && Number.isInteger(insertionIndex)) {
          event.preventDefault();
          event.stopPropagation();
          window.parent.postMessage({
            source: BUILDER_IFRAME_SELECTION_SOURCE,
            type: "insert",
            target: { type: "column", sectionId, columnKey },
            insertionIndex,
          } satisfies SelectionMessage, window.location.origin);
        }
        return;
      }
      const anchor = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>("a[href]") : null;
      // Header navigation links belong to the scoped preview router. They
      // synchronize the Builder document on the first click. Hash-only links
      // remain ordinary in-page preview navigation.
      if (anchor?.closest(".site-header")) {
        if (editingShell) {
          const explicitlyOpened = anchor.target === "_blank" || event.metaKey || event.ctrlKey || event.shiftKey;
          if (explicitlyOpened) return;
          event.preventDefault();
          event.stopPropagation();
          const target = targetFromClick(event) ?? {
            type: "section",
            sectionId: "header-document",
          } satisfies BuilderInteractionTarget;
          selectTarget(target, {
            href: anchor.getAttribute("href") ?? "",
            label: anchor.getAttribute("aria-label") ?? anchor.getAttribute("title") ?? anchor.textContent?.trim(),
          });
          return;
        }
        const href = anchor.getAttribute("href") ?? "";
        const isExternal = /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(href) &&
          !href.startsWith(window.location.origin);
        const isPageNavigation = Boolean(
          href &&
          href !== "#" &&
          !href.startsWith("#") &&
          !href.startsWith("mailto:") &&
          !href.startsWith("tel:") &&
          !isExternal &&
          !href.includes("#"),
        );
        if ((diagnostics === "settled" || diagnostics === "full") && isPageNavigation) {
          event.preventDefault();
          window.parent.postMessage({
            source: BUILDER_IFRAME_SELECTION_SOURCE,
            type: "navigate",
            href,
          } satisfies SelectionMessage, window.location.origin);
        }
        return;
      }
      const element = event.target instanceof Element ? event.target : null;
      const header = element?.closest(".site-header");
      const footer = element?.closest('footer[data-builder-page-root="true"]');
      const explicitlyOpened = Boolean(
        anchor && (anchor.target === "_blank" || event.metaKey || event.ctrlKey || event.shiftKey),
      );
      if (explicitlyOpened) return;
      const headerInteractive = element?.closest(
        "button, input, select, textarea, form, [role='button']",
      );
      // A shell edit is a temporary document context. Clicking the rendered
      // page below it must return to the page document, even though the page
      // itself is otherwise non-editable while the shell owns the canvas.
      if (!header && !footer && (diagnostics === "settled" || diagnostics === "full")) {
        window.parent.postMessage({
          source: BUILDER_IFRAME_SELECTION_SOURCE,
          type: "exit-shell",
        } satisfies SelectionMessage, window.location.origin);
      }
      if ((header || footer) && !headerInteractive) {
        // While editing a shell, Header content follows the same Builder
        // selection contract as page content: resolve the authored block
        // before falling back to the document section. Without this branch,
        // ordinary clicks on logo/text/image content were always promoted to
        // the Header document toolbar.
        if (editingShell) {
          const target = targetFromClick(event);
          if (target) {
            selectTarget(target);
            return;
          }
        }
        const shellTarget = {
          type: "section",
          sectionId: footer ? "footer-document" : "header-document",
        } satisfies BuilderInteractionTarget;
        selectTarget(shellTarget);
        return;
      }
      const target = targetFromClick(event);
      const navigationEnabled = diagnostics === "settled" || diagnostics === "full";
      if (anchor && target && navigationEnabled && targetsMatch(selectedTarget, target)) {
        const href = anchor.getAttribute("href") ?? "";
        const external = /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(href) &&
          !href.startsWith(window.location.origin);
        // Preserve the browser's familiar open-link gesture inside the
        // Builder. A normal click remains selection-first; Cmd/Ctrl/Shift
        // click follows the real link without changing the authored element.
        event.preventDefault();
        if (external || !href || href === "#" || href.startsWith("mailto:") || href.startsWith("tel:")) return;
        if (selectedLinkHref !== href) {
          selectTarget(target, {
            href,
            label: anchor.getAttribute("aria-label") ?? anchor.getAttribute("title") ?? anchor.textContent?.trim(),
          });
          return;
        }
        const navigation: SelectionMessage = {
          source: BUILDER_IFRAME_SELECTION_SOURCE,
          type: "navigate",
          href,
        };
        window.parent.postMessage(navigation, window.location.origin);
        return;
      }
      if (!target) return;
      if (event.target instanceof Element && event.target.closest("a[href], button, input, select, textarea, form")) {
        event.preventDefault();
      }
      selectTarget(target, anchor ? {
        href: anchor.getAttribute("href") ?? "",
        label: anchor.getAttribute("aria-label") ?? anchor.getAttribute("title") ?? anchor.textContent?.trim(),
      } : null);
    };
    const handleMessage = (event: MessageEvent<SelectionMessage>) => {
      if (event.origin !== window.location.origin || event.source !== window.parent) return;
      if (event.data?.source !== BUILDER_IFRAME_SELECTION_SOURCE) return;
      if (event.data.type === "context") {
        editingShell = event.data.shell === "header" || event.data.shell === "footer"
          ? event.data.shell
          : null;
        return;
      }
      if (event.data.type !== "focus" || !event.data.target) return;
      selectedTarget = event.data.target;
      selectedLinkHref = null;
      observeSelectedElement();
      const element = document.querySelector<HTMLElement>(targetSelector(event.data.target, editingShell));
      if (event.data.scrollIntoView && element) {
        element.scrollIntoView({ block: "nearest", inline: "nearest" });
      }
      if (diagnostics !== "minimal") scheduleRect();
    };
    const clearDropTarget = () => {
      document.querySelectorAll<HTMLElement>(
        ".builder-iframe-drag-over-above, .builder-iframe-drag-over-below, .builder-iframe-drag-over-column",
      ).forEach((element) => element.classList.remove(
        "builder-iframe-drag-over-above",
        "builder-iframe-drag-over-below",
        "builder-iframe-drag-over-column",
      ));
    };
    const handleDragStart = (event: DragEvent) => {
      const sourceTarget = targetFromClick(event);
      if (!sourceTarget || sourceTarget.type !== "block" || !event.dataTransfer) return;
      event.dataTransfer.setData("application/x-webpages-builder-block", JSON.stringify(sourceTarget));
      event.dataTransfer.effectAllowed = "move";
    };
    const handleDragOver = (event: DragEvent) => {
      if (!event.dataTransfer?.types.includes("application/x-webpages-builder-block")) return;
      const target = targetFromClick(event);
      if (!target || (target.type !== "block" && target.type !== "column")) return;
      event.preventDefault();
      event.dataTransfer.dropEffect = "move";
      clearDropTarget();
      const owner = event.target instanceof Element
        ? event.target.closest<HTMLElement>(`[data-builder-object-type="${target.type}"]`)
        : null;
      if (!owner) return;
      if (target.type === "column") {
        owner.classList.add("builder-iframe-drag-over-column");
      } else {
        const rect = owner.getBoundingClientRect();
        owner.classList.add(event.clientY < rect.top + rect.height / 2 ? "builder-iframe-drag-over-above" : "builder-iframe-drag-over-below");
      }
    };
    const handleDrop = (event: DragEvent) => {
      const rawSource = event.dataTransfer?.getData("application/x-webpages-builder-block");
      const target = targetFromClick(event);
      clearDropTarget();
      if (!rawSource || !target || (target.type !== "block" && target.type !== "column")) return;
      try {
        const sourceTarget = JSON.parse(rawSource) as BuilderInteractionTarget;
        if (sourceTarget.type !== "block" || (target.type === "block" && sourceTarget.blockKey === target.blockKey && sourceTarget.columnKey === target.columnKey && sourceTarget.sectionId === target.sectionId)) return;
        event.preventDefault();
        const owner = event.target instanceof Element
          ? event.target.closest<HTMLElement>(`[data-builder-object-type="${target.type}"]`)
          : null;
        const rect = owner?.getBoundingClientRect();
        const placement = target.type === "block" && rect && event.clientY >= rect.top + rect.height / 2 ? "below" : "above";
        window.parent.postMessage({
          source: BUILDER_IFRAME_SELECTION_SOURCE,
          type: "move",
          sourceTarget,
          target,
          placement,
        } satisfies SelectionMessage, window.location.origin);
      } catch {
        // Ignore malformed external drag data.
      }
    };
    document.addEventListener("click", handleClick, true);
    document.addEventListener("dragstart", handleDragStart, true);
    document.addEventListener("dragover", handleDragOver, true);
    document.addEventListener("drop", handleDrop, true);
    document.addEventListener("dragend", clearDropTarget, true);
    window.addEventListener("message", handleMessage);
    refreshDraggableTarget();
    // Dynamic projections can replace or append blocks after the bridge is
    // ready. Register only those added nodes instead of rescanning every block
    // whenever selection changes.
    draggableObserver = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        mutation.addedNodes.forEach((node) => {
          if (node instanceof HTMLElement) enableDraggableWithin(node);
        });
      }
    });
    draggableObserver.observe(document.documentElement, { childList: true, subtree: true });
    window.parent.postMessage({
      source: BUILDER_IFRAME_SELECTION_SOURCE,
      type: "ready",
    } satisfies SelectionMessage, window.location.origin);
    if (diagnostics !== "minimal") {
      window.addEventListener("scroll", diagnostics === "settled" ? handleSettledScroll : scheduleRect, { passive: true });
      window.addEventListener("resize", scheduleRect);
    }
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.clearTimeout(scrollSettleTimer);
      selectedResizeObserver?.disconnect();
      draggableObserver?.disconnect();
      document.removeEventListener("click", handleClick, true);
      document.removeEventListener("dragstart", handleDragStart, true);
      document.removeEventListener("dragover", handleDragOver, true);
      document.removeEventListener("drop", handleDrop, true);
      document.removeEventListener("dragend", clearDropTarget, true);
      draggableElements.forEach((element) => { element.draggable = false; });
      draggableElements.clear();
      window.removeEventListener("message", handleMessage);
      if (diagnostics !== "minimal") {
        window.removeEventListener("scroll", diagnostics === "settled" ? handleSettledScroll : scheduleRect);
        window.removeEventListener("resize", scheduleRect);
      }
    };
  }, [diagnostics]);

  return <style>{`
    .builder-iframe-drag-over-above, .builder-iframe-drag-over-below { position: relative; }
    .builder-iframe-drag-over-above::before, .builder-iframe-drag-over-below::before {
      content: ""; position: absolute; z-index: 2147483647; left: 0; right: 0;
      height: 3px; background: #8b5cf6; box-shadow: 0 0 7px rgba(139,92,246,.8); pointer-events: none;
    }
    .builder-iframe-drag-over-above::before { top: -2px; }
    .builder-iframe-drag-over-below::before { bottom: -2px; }
    .builder-iframe-drag-over-column { outline: 2px solid rgba(139,92,246,.8); outline-offset: -2px; }
  `}</style>;
}
