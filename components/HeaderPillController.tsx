"use client";

import { useEffect } from "react";

export default function HeaderPillController() {
  useEffect(() => {
    if (document.querySelector(".builder-dashboard")) return;

    const el = document.getElementById("site-header-pill");
    if (!el) return;

    const threshold = 56;
    let ticking = false;

    const getScrollY = () => {
      const previewShell = document.querySelector<HTMLElement>(
        ".builder-preview-shell",
      );
      const previewShellOverflow = previewShell
        ? window.getComputedStyle(previewShell).overflowY
        : "";
      const shellCanScroll =
        previewShell &&
        previewShell.scrollHeight > previewShell.clientHeight + 1 &&
        (previewShellOverflow === "auto" || previewShellOverflow === "scroll");
      if (previewShell?.contains(el) && shellCanScroll) {
        return Math.round(previewShell.scrollTop || 0);
      }
      return Math.round(
        window.scrollY ||
          window.pageYOffset ||
          document.documentElement.scrollTop ||
          document.body.scrollTop ||
          0,
      );
    };

    const update = () => {
      ticking = false;
      const isScrolled = getScrollY() > threshold;
      el.dataset.scrolled = isScrolled ? "true" : "false";
      el.dataset.pillInit = "true";
      el.closest<HTMLElement>(".site-header")?.setAttribute(
        "data-scrolled",
        isScrolled ? "true" : "false",
      );
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    const previewShell = document.querySelector<HTMLElement>(
      ".builder-preview-shell",
    );
    previewShell?.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      previewShell?.removeEventListener("scroll", onScroll);
    };
  }, []);

  return null;
}
