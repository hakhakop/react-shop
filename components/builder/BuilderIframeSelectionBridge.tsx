"use client";

import { useEffect } from "react";
import type { BuilderInteractionTarget } from "@/components/dashboard/builderInteraction";

export const BUILDER_IFRAME_SELECTION_SOURCE = "webpages-builder-iframe-selection";

type SelectionMessage = {
  source: typeof BUILDER_IFRAME_SELECTION_SOURCE;
  type: "select" | "focus" | "rect" | "scroll-start" | "navigate" | "exit-shell";
  target?: BuilderInteractionTarget;
  scrollIntoView?: boolean;
  rect?: { x: number; y: number; width: number; height: number } | null;
  href?: string;
  shell?: "header" | "footer";
};

function targetFromClick(event: MouseEvent): BuilderInteractionTarget | null {
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

function targetSelector(target: BuilderInteractionTarget) {
  if (target.type === "section" && target.sectionId === "header-document") return ".site-header";
  if (target.type === "section" && target.sectionId === "footer-document") return 'footer[data-builder-page-root="true"]';
  const sectionId = CSS.escape(target.sectionId);
  if (target.type === "section") {
    return `[data-builder-object-type="section"][data-builder-section-id="${sectionId}"]`;
  }
  if (target.type === "row") {
    return `[data-builder-object-type="row"][data-builder-section-id="${sectionId}"][data-builder-row-index="${target.rowIndex}"]`;
  }
  const columnKey = CSS.escape(target.columnKey);
  if (target.type === "column") {
    return `[data-builder-object-type="column"][data-builder-section-id="${sectionId}"][data-builder-column-key="${columnKey}"]`;
  }
  return `[data-builder-object-type="block"][data-builder-section-id="${sectionId}"][data-builder-column-key="${columnKey}"][data-builder-block-key="${CSS.escape(target.blockKey)}"]`;
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
    const builderContext = new URLSearchParams(window.location.search).get("builderContext");
    const editingShell = builderContext === "header" || builderContext === "footer";
    let frame = 0;
    let scrollSettleTimer = 0;
    let scrolling = false;
    let selectedResizeObserver: ResizeObserver | null = null;
    const reportRect = () => {
      frame = 0;
      const element = selectedTarget
        ? document.querySelector<HTMLElement>(targetSelector(selectedTarget))
        : null;
      const rect = element?.getBoundingClientRect();
      const message: SelectionMessage = {
        source: BUILDER_IFRAME_SELECTION_SOURCE,
        type: "rect",
        target: selectedTarget ?? undefined,
        rect: rect ? { x: rect.x, y: rect.y, width: rect.width, height: rect.height } : null,
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
      const element = document.querySelector<HTMLElement>(targetSelector(selectedTarget));
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
    const selectTarget = (target: BuilderInteractionTarget) => {
      selectedTarget = target;
      observeSelectedElement();
      window.parent.postMessage({
        source: BUILDER_IFRAME_SELECTION_SOURCE,
        type: "select",
        target,
        shell: target.sectionId === "header-document"
          ? "header"
          : target.sectionId === "footer-document"
            ? "footer"
            : undefined,
      } satisfies SelectionMessage, window.location.origin);
      if (diagnostics !== "minimal") scheduleRect();
    };
    const handleClick = (event: MouseEvent) => {
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
          selectTarget(target);
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
      const headerInteractive = element?.closest(
        "button, input, select, textarea, form, [role='button']",
      );
      // A shell edit is a temporary document context. Clicking the rendered
      // page below it must return to the page document, even though the page
      // itself is otherwise non-editable while the shell owns the canvas.
      if (!header && (diagnostics === "settled" || diagnostics === "full")) {
        window.parent.postMessage({
          source: BUILDER_IFRAME_SELECTION_SOURCE,
          type: "exit-shell",
        } satisfies SelectionMessage, window.location.origin);
      }
      if (header && !headerInteractive) {
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
        const headerTarget = {
          type: "section",
          sectionId: "header-document",
        } satisfies BuilderInteractionTarget;
        selectTarget(headerTarget);
        return;
      }
      const target = targetFromClick(event);
      const navigationEnabled = diagnostics === "settled" || diagnostics === "full";
      if (anchor && navigationEnabled && targetsMatch(selectedTarget, target)) {
        const explicitlyOpened = anchor.target === "_blank" || event.metaKey || event.ctrlKey || event.shiftKey;
        const href = anchor.getAttribute("href") ?? "";
        const external = /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(href) &&
          !href.startsWith(window.location.origin);
        if (external && explicitlyOpened) return;
        event.preventDefault();
        if (external || !href || href === "#" || href.startsWith("mailto:") || href.startsWith("tel:")) return;
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
      selectTarget(target);
    };
    const handleMessage = (event: MessageEvent<SelectionMessage>) => {
      if (event.origin !== window.location.origin || event.source !== window.parent) return;
      if (event.data?.source !== BUILDER_IFRAME_SELECTION_SOURCE || event.data.type !== "focus" || !event.data.target) return;
      selectedTarget = event.data.target;
      observeSelectedElement();
      const element = document.querySelector<HTMLElement>(targetSelector(event.data.target));
      if (event.data.scrollIntoView && element) {
        element.scrollIntoView({ block: "nearest", inline: "nearest" });
      }
      if (diagnostics !== "minimal") scheduleRect();
    };
    document.addEventListener("click", handleClick, true);
    window.addEventListener("message", handleMessage);
    if (diagnostics !== "minimal") {
      window.addEventListener("scroll", diagnostics === "settled" ? handleSettledScroll : scheduleRect, { passive: true });
      window.addEventListener("resize", scheduleRect);
    }
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.clearTimeout(scrollSettleTimer);
      selectedResizeObserver?.disconnect();
      document.removeEventListener("click", handleClick, true);
      window.removeEventListener("message", handleMessage);
      if (diagnostics !== "minimal") {
        window.removeEventListener("scroll", diagnostics === "settled" ? handleSettledScroll : scheduleRect);
        window.removeEventListener("resize", scheduleRect);
      }
    };
  }, [diagnostics]);

  return null;
}
