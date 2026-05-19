"use client";

import { useEffect } from "react";

export default function HeaderPillController() {
  useEffect(() => {
    const el = document.getElementById("site-header-pill");
    if (!el) return;

    const threshold = 56;
    let ticking = false;

    const getScrollY = () =>
      Math.round(
        window.scrollY ||
          window.pageYOffset ||
          document.documentElement.scrollTop ||
          document.body.scrollTop ||
          0
      );

    const update = () => {
      ticking = false;
      const isScrolled = getScrollY() > threshold;
      el.dataset.scrolled = isScrolled ? "true" : "false";
      el.dataset.pillInit = "true";
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return null;
}
