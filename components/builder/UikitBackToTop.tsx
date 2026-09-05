"use client";

import { useEffect, useRef, useState, type MouseEvent, type KeyboardEvent } from "react";
import { createPortal } from "react-dom";
import type { BuilderLayoutBlock } from "@/components/dashboard/builderTypes";
import { useUikitGridRuntime } from "./useUikitGridRuntime";
import { builderGeneralVisibilityClassName } from "@/lib/builderVisualStyle";

export type BackToTopBlock = Pick<BuilderLayoutBlock, "backToTop" | "backToTopLinkTitle" | "backToTopHtmlId" | "visualStyle">;

/** Uses the control's own document, including the Builder preview iframe. */
export function scrollBackToTop(element: HTMLElement) {
  const win = element.ownerDocument.defaultView;
  if (!win) return;
  win.scrollTo({ top: 0, behavior: win.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
}

export default function UikitBackToTop({ block }: { block: BackToTopBlock }) {
  const settings = block.backToTop ?? {};
  const host = useRef<HTMLDivElement>(null);
  const grid = useRef<HTMLDivElement>(null);
  useUikitGridRuntime(grid, { enabled: Boolean(settings.title) && !settings.disabled, revision: `${settings.title}:${settings.breakpoint}:${settings.columnGap}:${settings.rowGap}` });
  const [floatingRoot, setFloatingRoot] = useState<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);
  const disabled = settings.disabled;

  useEffect(() => {
    const element = host.current;
    const win = element?.ownerDocument.defaultView;
    if (!settings.floatingButton || disabled || !element || !win) return;
    setFloatingRoot(element.ownerDocument.body);
    const update = () => setVisible(win.scrollY > 400);
    update();
    win.addEventListener("scroll", update, { passive: true });
    return () => win.removeEventListener("scroll", update);
  }, [settings.floatingButton, disabled]);

  const activate = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    scrollBackToTop(event.currentTarget);
  };
  const onKeyDown = (event: KeyboardEvent<HTMLAnchorElement>) => {
    if (event.key !== " ") return;
    event.preventDefault();
    scrollBackToTop(event.currentTarget);
  };
  const control = (floating = false) => (
    <a href="#" role="button" aria-label="Back to top" title={(block.backToTopLinkTitle ?? settings.linkTitle) || undefined}
      className={`uk-icon uk-totop${floating ? ` shop-builder-totop-floating ${builderGeneralVisibilityClassName(block.visualStyle?.layout?.visibilityMode)}` : ""}`}
      onClick={activate} onKeyDown={onKeyDown} data-back-to-top={floating ? "floating" : "inline"}>
      <svg width="18" height="9" viewBox="0 0 18 9" aria-hidden="true" focusable="false">
        <polyline fill="none" stroke="currentColor" strokeWidth="1.4" points="1 8 9 1 17 8" />
      </svg>
    </a>
  );
  if (disabled) return null;
  const suffix = settings.breakpoint ? `@${settings.breakpoint}` : "";
  const columnGap = settings.columnGap ?? "small";
  const rowGap = settings.rowGap ?? "small";
  return (
    <div ref={host} id={(block.backToTopHtmlId ?? settings.htmlId) || undefined} className="shop-builder-totop">
      {settings.title ? (
        <div ref={grid} className={`uk-grid uk-flex-inline uk-flex-middle uk-child-width-expand${suffix}${columnGap ? ` uk-grid-column-${columnGap}` : ""}${rowGap ? ` uk-grid-row-${rowGap}` : ""}`}>
          <div>{control()}</div>
          <div className={`uk-flex-first${suffix} uk-width-auto${suffix}`}>
            <div className={`el-title${settings.titleStyle ? ` uk-text-${settings.titleStyle}` : ""}`}>{settings.title}</div>
          </div>
        </div>
      ) : control()}
      {settings.floatingButton && visible && floatingRoot && createPortal(control(true), floatingRoot)}
    </div>
  );
}
