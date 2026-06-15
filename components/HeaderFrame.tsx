"use client";

import * as React from "react";

import {
  resolveEffectiveHeaderTextMode,
  type EffectiveHeaderBackgroundContext,
  type EffectiveHeaderTextMode,
} from "@/lib/headerBackgroundContext";

type HeaderFrameProps = {
  accentColor: string;
  children: React.ReactNode;
  /** "sticky" keeps current behavior. "none" disables sticky + scroll-reactive background. */
  mode?: "sticky" | "none";
  /** Extra classes appended to the header element. */
  className?: string;
  backgroundMode?: "default" | "glass" | "accent" | "none";
  textMode?: "auto" | "light" | "dark";
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
  textMode = "auto",
}: HeaderFrameProps) {
  const headerRef = React.useRef<HTMLElement>(null);
  const [scrolled, setScrolled] = React.useState(false);
  const [autoTextState, setAutoTextState] = React.useState<{
    context: EffectiveHeaderBackgroundContext;
    textMode: EffectiveHeaderTextMode;
  } | null>(null);
  const [overlapHeader, setOverlapHeader] = React.useState(false);

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

  React.useEffect(() => {
    const updateOverlapState = () => {
      const header = headerRef.current;
      const previewShell = header?.closest<HTMLElement>(".builder-preview-shell");
      const searchRoot: ParentNode = previewShell ?? document;
      const pageRoot = searchRoot.querySelector<HTMLElement>(
        "[data-builder-page-root]",
      );
      setOverlapHeader(pageRoot?.dataset.overlapHeader === "true");
    };

    updateOverlapState();
    const observer = new MutationObserver(updateOverlapState);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["data-overlap-header"],
    });
    return () => observer.disconnect();
  }, []);

  React.useEffect(() => {
    if (textMode !== "auto") {
      setAutoTextState(null);
      return;
    }

    const themeTextMode = (): EffectiveHeaderTextMode => {
      const isDark =
        document.documentElement.classList.contains("dark") ||
        document.documentElement.getAttribute("data-theme") === "dark" ||
        document.body.classList.contains("dark");
      return isDark ? "light" : "dark";
    };

    const textModeFromClasses = (
      element: HTMLElement | null,
      darkClass: string,
      lightClass: string,
    ): EffectiveHeaderTextMode | null => {
      if (element?.classList.contains(darkClass)) return "light";
      if (element?.classList.contains(lightClass)) return "dark";
      return null;
    };

    const textModeFromBackground = (
      element: HTMLElement | null,
    ): EffectiveHeaderTextMode | null => {
      if (!element) return null;
      const color = window.getComputedStyle(element).backgroundColor;
      const match = color.match(
        /^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:\s*[,/]\s*([\d.]+))?\s*\)$/,
      );
      if (!match) return null;

      const alpha = match[4] === undefined ? 1 : Number(match[4]);
      if (!Number.isFinite(alpha) || alpha < 0.15) return null;

      const red = Number(match[1]);
      const green = Number(match[2]);
      const blue = Number(match[3]);
      const luminance = (0.2126 * red + 0.7152 * green + 0.0722 * blue) / 255;
      return luminance < 0.48 ? "light" : "dark";
    };

    const updateAutoScheme = () => {
      const header = headerRef.current;
      const previewShell = header?.closest<HTMLElement>(".builder-preview-shell");
      const searchRoot: ParentNode = previewShell ?? document;
      const pageRoot = searchRoot.querySelector<HTMLElement>(
        "[data-builder-page-root]",
      );
      const firstSection = pageRoot?.querySelector<HTMLElement>(
        ".shop-builder-section",
      ) ?? null;
      const fallbackTextMode = themeTextMode();
      const pageTextMode =
        textModeFromBackground(pageRoot) ??
        textModeFromBackground(previewShell ?? null) ??
        textModeFromBackground(document.body) ??
        textModeFromBackground(document.documentElement) ??
        textModeFromClasses(
          pageRoot,
          "shop-builder-main--scheme-dark",
          "shop-builder-main--scheme-light",
        ) ??
        fallbackTextMode;
      const sectionTextMode =
        textModeFromClasses(
          firstSection,
          "shop-builder-section--scheme-dark",
          "shop-builder-section--scheme-light",
        ) ??
        textModeFromClasses(
          firstSection,
          "builder-preview-section--scheme-dark",
          "builder-preview-section--scheme-light",
        ) ??
        textModeFromBackground(firstSection) ??
        pageTextMode;
      const headerSurface =
        header?.querySelector<HTMLElement>(".site-header-pill-inner") ??
        header?.querySelector<HTMLElement>(".site-header-princity") ??
        header?.querySelector<HTMLElement>(".site-header-main") ??
        header;
      const headerTextMode =
        backgroundMode === "accent"
          ? "light"
          : textModeFromBackground(headerSurface) ?? fallbackTextMode;
      const firstSectionTouchesPageTop = Boolean(
        pageRoot &&
          firstSection &&
          firstSection.getBoundingClientRect().top -
            pageRoot.getBoundingClientRect().top <=
            1,
      );
      const firstSectionOverlapEnabled =
        pageRoot?.dataset.overlapHeader === "true";

      const nextState = resolveEffectiveHeaderTextMode({
        configuredTextMode: textMode,
        backgroundMode,
        firstSectionOverlapEnabled,
        firstSectionTouchesPageTop,
        headerTextMode,
        pageTextMode,
        sectionTextMode,
      });
      setAutoTextState((current) =>
        current?.context === nextState.context &&
        current.textMode === nextState.textMode
          ? current
          : nextState,
      );
    };

    updateAutoScheme();

    let frameId = 0;
    const scheduleUpdate = () => {
      window.cancelAnimationFrame(frameId);
      frameId = window.requestAnimationFrame(updateAutoScheme);
    };
    const observer = new MutationObserver(scheduleUpdate);

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: [
        "class",
        "data-overlap-header",
        "data-theme",
        "style",
      ],
    });

    window.addEventListener("resize", scheduleUpdate, { passive: true });

    return () => {
      window.cancelAnimationFrame(frameId);
      observer.disconnect();
      window.removeEventListener("resize", scheduleUpdate);
    };
  }, [backgroundMode, textMode]);

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

  const resolvedTextMode =
    textMode === "auto" ? (autoTextState?.textMode ?? "auto") : textMode;

  return (
    <header
      ref={headerRef}
      className={`${base} ${state} ${className}`}
      style={mode === "sticky" ? { borderBottomColor: scrolled ? accentColor : "transparent" } : undefined}
      data-scrolled={scrolled ? "true" : "false"}
      data-overlap-header={overlapHeader ? "true" : "false"}
      data-header-text-mode={resolvedTextMode}
      data-header-background-context={
        textMode === "auto" ? autoTextState?.context : undefined
      }
    >
      {children}
    </header>
  );
}
