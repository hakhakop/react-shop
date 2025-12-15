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

    const onScroll = () => {
      // tweak the value (24) if you want stronger/weaker sensitivity
      setScrolled(window.scrollY > 24);
    };

    onScroll(); // run once on mount
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
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
    >
      {children}
    </header>
  );
}