"use client";

import { useEffect } from "react";

export default function HeaderPillController() {
  useEffect(() => {
    const pills = Array.from(
      document.querySelectorAll<HTMLElement>("#site-header-pill"),
    );
    if (pills.length === 0) return;

    const threshold = 56;
    let ticking = false;

    const getScrollY = (el: HTMLElement) => {
      const previewShell = el.closest<HTMLElement>(".builder-preview-shell");
      const previewShellOverflow = previewShell
        ? window.getComputedStyle(previewShell).overflowY
        : "";
      const shellCanScroll =
        previewShell &&
        previewShell.scrollHeight > previewShell.clientHeight + 1 &&
        (previewShellOverflow === "auto" || previewShellOverflow === "scroll");
      if (shellCanScroll) {
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
      pills.forEach((el) => {
        const isScrolled = getScrollY(el) > threshold;
        el.dataset.scrolled = isScrolled ? "true" : "false";
        el.dataset.pillInit = "true";
        el.closest<HTMLElement>(".site-header")?.setAttribute(
          "data-scrolled",
          isScrolled ? "true" : "false",
        );
      });
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    const previewShells = Array.from(
      new Set(
        pills
          .map((el) => el.closest<HTMLElement>(".builder-preview-shell"))
          .filter((el): el is HTMLElement => Boolean(el)),
      ),
    );
    previewShells.forEach((previewShell) => {
      previewShell.addEventListener("scroll", onScroll, { passive: true });
    });

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      previewShells.forEach((previewShell) => {
        previewShell.removeEventListener("scroll", onScroll);
      });
    };
  }, []);

  return null;
}
