"use client";

import * as React from "react";

type HeaderFrameProps = {
  accentColor: string;
  children: React.ReactNode;
  /** "sticky" keeps current behavior. "none" disables sticky + scroll-reactive background. */
  mode?: "sticky" | "none";
  /** Extra classes appended to the header element. */
  className?: string;
};

/**
 * Glassy, scroll-reactive header wrapper.
 * - Uses sticky + backdrop blur
 * - Fades background + shadow when user scrolls
 */
export default function HeaderFrame({
  accentColor,
  children,
  mode = "sticky",
  className = "",
}: HeaderFrameProps) {
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    if (mode !== "sticky") return;

    const getScrollY = () => {
      const previewShell = document.querySelector(".builder-preview-shell");
      if (previewShell) {
        return previewShell.scrollTop;
      }
      return window.scrollY;
    };

    const onScroll = () => {
      // tweak the value (24) if you want stronger/weaker sensitivity
      setScrolled(getScrollY() > 24);
    };

    onScroll(); // run once on mount
    
    // Use capture: true so that we catch scroll events from any nested scrollable container,
    // including the builder preview shell.
    window.addEventListener("scroll", onScroll, { capture: true, passive: true });
    return () => window.removeEventListener("scroll", onScroll, { capture: true });
  }, [mode]);

  const baseSticky =
    "site-header sticky top-0 z-40 backdrop-blur-xl transition-all duration-300";
  const stateSticky = scrolled
    ? // when scrolled
      "bg-slate-950/85 shadow-[0_22px_45px_rgba(15,23,42,0.55)] border-b border-slate-800/80"
    : // at top
      "bg-slate-950/35 border-b border-transparent";

  const baseNone = "site-header";

  const base = mode === "sticky" ? baseSticky : baseNone;
  const state = mode === "sticky" ? stateSticky : "";

  return (
    <header
      className={`${base} ${state} ${className}`}
      style={mode === "sticky" ? { borderBottomColor: accentColor } : undefined}
      data-scrolled={mode === "sticky" ? (scrolled ? "true" : "false") : undefined}
    >
      {children}
    </header>
  );
}