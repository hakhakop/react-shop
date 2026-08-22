"use client";

import { useEffect } from "react";
import {
  resolveScopedBuilderHref,
  resolveScopedPreviewHref,
  resolveTenantPathHref,
  type ScopedPreviewPage,
} from "@/lib/scopedPreviewLinks";

type ScopedPreviewLinkRouterProps = {
  websiteId?: string;
  pages?: ScopedPreviewPage[];
  /** The same router is used by the standalone preview and the Builder shell. */
  mode?: "preview" | "builder" | "tenant-path";
  /** Limit interception to a rendered preview boundary when mounted in Builder. */
  scopeSelector?: string;
  /** Optional owner hook for a destination that can be rendered in-place. */
  onNavigate?: (href: string, resolvedHref: string) => boolean | void;
};

export default function ScopedPreviewLinkRouter({
  websiteId,
  pages,
  mode = "preview",
  scopeSelector,
  onNavigate,
}: ScopedPreviewLinkRouterProps) {
  useEffect(() => {
    const hiddenHeaders = new Set<HTMLElement>();

    const hideRootHeader = () => {
      const previewRoot = document.querySelector("[data-scoped-preview-root]");
      document.querySelectorAll<HTMLElement>(".site-header").forEach((header) => {
        if (previewRoot?.contains(header)) return;
        header.dataset.scopedPreviewHidden = "true";
        hiddenHeaders.add(header);
      });
    };

    if (mode === "preview") hideRootHeader();

    const onClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const target = event.target as Element | null;
      if (scopeSelector && !target?.closest(scopeSelector)) return;
      const anchor = target?.closest<HTMLAnchorElement>("a[href]");
      if (!anchor || anchor.target === "_blank" || anchor.hasAttribute("download")) {
        return;
      }

      const href = anchor.getAttribute("href");
      if (!href) return;
      const resolvedHref = websiteId
        ? mode === "builder"
          ? resolveScopedBuilderHref(href, { websiteId, pages })
          : mode === "tenant-path"
            ? resolveTenantPathHref(href, { websiteId, pages })
            : resolveScopedPreviewHref(href, { websiteId, pages })
        : href;
      const navigationHandled = onNavigate?.(href, resolvedHref) === true;
      if (navigationHandled) {
        event.preventDefault();
        return;
      }
      if (resolvedHref === href) return;

      event.preventDefault();
      window.location.assign(resolvedHref);
    };

    document.addEventListener("click", onClick, true);

    return () => {
      document.removeEventListener("click", onClick, true);
      hiddenHeaders.forEach((header) => {
        delete header.dataset.scopedPreviewHidden;
      });
    };
  }, [mode, onNavigate, pages, scopeSelector, websiteId]);

  return (
    <style>{`
      .site-header[data-scoped-preview-hidden="true"] {
        display: none !important;
      }
    `}</style>
  );
}
