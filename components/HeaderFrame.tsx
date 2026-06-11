"use client";

import * as React from "react";

type HeaderFrameProps = {
  accentColor: string;
  children: React.ReactNode;
  /** "sticky" keeps current behavior. "none" disables sticky + scroll-reactive background. */
  mode?: "sticky" | "none";
  /** Extra classes appended to the header element. */
  className?: string;
  backgroundMode?: "default" | "glass" | "accent" | "none";
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
  backgroundMode = "default",
}: HeaderFrameProps) {
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
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
  }, []);

  let bgClass = "";
  let borderClass = "";
  let textClass = "";

  if (backgroundMode === "none") {
    bgClass = scrolled ? "bg-[var(--header-bg)]" : "bg-transparent";
    borderClass = scrolled ? "border-[var(--header-border)]" : "border-transparent";
  } else if (backgroundMode === "glass") {
    bgClass = scrolled
      ? "bg-white/90 dark:bg-slate-950/90 shadow-md"
      : "bg-white/60 dark:bg-slate-950/60 shadow-sm";
    borderClass = "border-[var(--header-border)]";
  } else if (backgroundMode === "accent") {
    bgClass = "bg-gradient-to-r from-[var(--accent)] to-[var(--accent-strong)] shadow-md";
    borderClass = "border-transparent";
    textClass = "text-white [&_.site-header-nav-link]:text-white/80 [&_.site-header-nav-link.is-active]:text-white [&_.site-header-brand]:text-white [&_.site-header-brand_span]:!text-white [&_.site-header-top]:text-white/70";
  } else {
    // default
    bgClass = "bg-[var(--header-bg,rgba(255,255,255,0.92))]";
    borderClass = scrolled ? "border-[var(--header-border,rgba(209,213,219,0.72))]" : "border-transparent";
  }

  const baseSticky = `site-header sticky top-0 z-40 backdrop-blur-xl transition-all duration-300 ${textClass}`;
  const stateSticky = `${bgClass} border-b ${borderClass}`;

  const baseNone = "site-header";

  const base = mode === "sticky" ? baseSticky : baseNone;
  const state = mode === "sticky" ? stateSticky : "";

  return (
    <header
      className={`${base} ${state} ${className}`}
      style={mode === "sticky" ? { borderBottomColor: scrolled ? accentColor : "transparent" } : undefined}
      data-scrolled={scrolled ? "true" : "false"}
    >
      {children}
    </header>
  );
}