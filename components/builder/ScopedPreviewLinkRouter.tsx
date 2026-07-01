"use client";

import { useEffect } from "react";
import {
  resolveScopedPreviewHref,
  type ScopedPreviewPage,
} from "@/lib/scopedPreviewLinks";

type ScopedPreviewLinkRouterProps = {
  websiteId: string;
  pages?: ScopedPreviewPage[];
};

export default function ScopedPreviewLinkRouter({
  websiteId,
  pages,
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

    hideRootHeader();

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
      const anchor = target?.closest<HTMLAnchorElement>("a[href]");
      if (!anchor || anchor.target === "_blank" || anchor.hasAttribute("download")) {
        return;
      }

      const href = anchor.getAttribute("href");
      const resolvedHref = resolveScopedPreviewHref(href, { websiteId, pages });
      if (!href || resolvedHref === href) return;

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
  }, [pages, websiteId]);

  return (
    <style>{`
      .site-header[data-scoped-preview-hidden="true"] {
        display: none !important;
      }
    `}</style>
  );
}
