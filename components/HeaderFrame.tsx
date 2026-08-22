"use client";

import * as React from "react";

import {
  resolveEffectiveHeaderTextMode,
  type EffectiveHeaderBackgroundContext,
  type EffectiveHeaderTextMode,
} from "@/lib/headerBackgroundContext";
import type { HeaderBehavior } from "@/lib/headerBehavior";

type HeaderFrameProps = {
  accentColor: string;
  children: React.ReactNode;
  behavior: HeaderBehavior;
  /** Extra classes appended to the header element. */
  className?: string;
  backgroundMode?: "default" | "glass" | "accent" | "none";
  textMode?: "auto" | "light" | "dark";
  style?: React.CSSProperties;
  id?: string;
  overlapHeader?: boolean;
  scrollState?: {
    scrolled: boolean;
    hidden: boolean;
  };
};

/**
 * Glassy, scroll-reactive header wrapper.
 * - Uses sticky + backdrop blur
 * - Fades background + shadow when user scrolls
 */
export default function HeaderFrame({
  accentColor,
  children,
  behavior,
  className = "",
  backgroundMode = "default",
  textMode = "auto",
  style,
  id,
  overlapHeader = false,
  scrollState,
}: HeaderFrameProps) {
  const headerRef = React.useRef<HTMLElement>(null);
  const [scrolled, setScrolled] = React.useState(false);
  const [hiddenByScroll, setHiddenByScroll] = React.useState(false);
  const [builderSurface, setBuilderSurface] = React.useState(false);
  const builderContextDetected =
    builderSurface ||
    (typeof document !== "undefined" &&
      Boolean(document.querySelector(".builder-dashboard")));
  const previousScrollYRef = React.useRef(0);
  const [autoTextState, setAutoTextState] = React.useState<{
    context: EffectiveHeaderBackgroundContext;
    textMode: EffectiveHeaderTextMode;
  } | null>(null);
  const [sectionHeaderState, setSectionHeaderState] = React.useState({
    transparent: false,
    pullUnder: false,
  });
  const scheduleUpdateRef = React.useRef<() => void>(() => {});

  React.useEffect(() => {
    setBuilderSurface(Boolean(document.querySelector(".builder-dashboard")));
  }, []);

  React.useEffect(() => {
    const updateSectionHeaderState = () => {
      const pageRoot = document.querySelector<HTMLElement>(
        "[data-builder-page-root], [data-builder-page]",
      );
      const nextState = {
        transparent: pageRoot?.dataset.sectionHeaderTransparent === "true",
        pullUnder: pageRoot?.dataset.sectionPullUnderHeader === "true",
      };
      setSectionHeaderState((current) =>
        current.transparent === nextState.transparent && current.pullUnder === nextState.pullUnder
          ? current
          : nextState,
      );
    };

    updateSectionHeaderState();
    const observer = new MutationObserver(updateSectionHeaderState);
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["data-section-header-transparent", "data-section-pull-under-header"],
    });
    return () => observer.disconnect();
  }, []);

  React.useLayoutEffect(() => {
    const header = headerRef.current;
    const previewViewport = header?.closest<HTMLElement>(
      ".builder-preview-viewport-container",
    );
    if (!header) return;

    const publishRenderedHeight = () => {
      const headerRect = header.getBoundingClientRect();
      if (previewViewport) {
        const viewportRect = previewViewport.getBoundingClientRect();
        previewViewport.style.setProperty(
          "--builder-preview-rendered-header-height",
          `${Math.max(headerRect.height, headerRect.bottom - viewportRect.top)}px`,
        );
      }
    };
    publishRenderedHeight();
    const observer = new ResizeObserver(publishRenderedHeight);
    observer.observe(header);
    return () => {
      observer.disconnect();
      previewViewport?.style.removeProperty("--builder-preview-rendered-header-height");
    };
  }, [children, behavior]);

  React.useEffect(() => {
    if (scrollState || builderContextDetected) return;
    const getScrollY = () => {
      const previewShell = headerRef.current?.closest<HTMLElement>(".builder-preview-shell");
      if (previewShell) {
        const previewStyle = window.getComputedStyle(previewShell);
        const previewOwnsScroll =
          previewShell.scrollHeight > previewShell.clientHeight + 1 &&
          (previewStyle.overflowY === "auto" || previewStyle.overflowY === "scroll");
        if (previewOwnsScroll) return previewShell.scrollTop;
      }
      return window.scrollY;
    };

    const onScroll = () => {
      const nextScrollY = getScrollY();
      const threshold = behavior === "pill-on-scroll" ? 56 : 24;
      setScrolled(behavior === "static" ? false : nextScrollY > threshold);
      if (behavior === "sticky-on-scroll-up") {
        const delta = nextScrollY - previousScrollYRef.current;
        setHiddenByScroll((current) => {
          if (nextScrollY <= 24) return false;
          if (delta > 2) return true;
          if (delta < -2) return false;
          return current;
        });
      } else {
        setHiddenByScroll(false);
      }
      previousScrollYRef.current = nextScrollY;
      scheduleUpdateRef.current();
    };

    onScroll(); // run once on mount
    
    // Use capture: true so that we catch scroll events from any nested scrollable container,
    // including the builder preview shell.
    window.addEventListener("scroll", onScroll, { capture: true, passive: true });
    return () => window.removeEventListener("scroll", onScroll, { capture: true });
  }, [behavior, builderContextDetected, scrollState]);

  React.useEffect(() => {
    const pill = headerRef.current?.querySelector<HTMLElement>("#site-header-pill");
    if (pill) {
      pill.dataset.scrolled = behavior === "pill-on-scroll" && scrolled ? "true" : "false";
    }
  }, [behavior, scrolled]);

  React.useEffect(() => {
    if (textMode !== "auto") {
      setAutoTextState(null);
      return;
    }

    const themeTextMode = (): EffectiveHeaderTextMode => {
      const header = headerRef.current;
      const previewShell = header?.closest<HTMLElement>(".builder-preview-shell");
      if (previewShell) {
        const isDark =
          previewShell.getAttribute("data-theme") === "dark" ||
          previewShell.classList.contains("dark") ||
          previewShell.classList.contains("builder-preview-scheme-dark");
        return isDark ? "light" : "dark";
      }
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
      // A Builder preview is its own storefront theme boundary. Page content and
      // the dashboard document must not override the scheme selected on the shell.
      const pageTextMode =
        textModeFromBackground(pageRoot) ??
        textModeFromClasses(
          pageRoot,
          "shop-builder-main--scheme-dark",
          "shop-builder-main--scheme-light",
        ) ??
        (previewShell ? null : textModeFromBackground(document.body)) ??
        (previewShell ? null : textModeFromBackground(document.documentElement)) ??
        fallbackTextMode;
      // Pull-under Headers resolve against the first section just like the
      // storefront. The preview shell remains the page-level theme boundary,
      // but it must not replace an explicit section scheme/background.
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
        header?.querySelector<HTMLElement>(".site-header-princity-inner") ??
        header?.querySelector<HTMLElement>(".site-header-main-inner") ??
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
        scrolled,
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
    scheduleUpdateRef.current = scheduleUpdate;

    const observer = new MutationObserver((mutations) => {
      const header = headerRef.current;
      const affectsThemeSource = mutations.some((mutation) => {
        const target = mutation.target;
        if (!(target instanceof HTMLElement) || !header?.contains(target)) {
          return true;
        }

        // Header controls are never background-context sources. Only changes to
        // the Header or its structural painted surfaces can affect text mode.
        return (
          target === header ||
          target.matches(
            ".site-header-main, .site-header-main-inner, .site-header-pill-inner, .site-header-princity, .site-header-princity-inner, .site-header-builder-extra-row",
          )
        );
      });
      if (affectsThemeSource) scheduleUpdate();
    });
    observer.observe(document.documentElement, {
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
  }, [backgroundMode, textMode, scrolled, overlapHeader]);

  const effectiveScrolled = scrollState?.scrolled ?? (builderContextDetected ? false : scrolled);
  const effectiveHidden = scrollState?.hidden ?? (builderContextDetected ? false : hiddenByScroll);
  const hideBuilderServiceHeader =
    builderContextDetected && className.split(/\s+/).includes("site-header--service");
  let bgClass = "";
  let borderClass = "";
  let textClass = "";

  if (backgroundMode === "none") {
    bgClass = effectiveScrolled ? "bg-[var(--header-bg)]" : "bg-transparent";
    borderClass = effectiveScrolled ? "border-[var(--header-border)]" : "border-transparent";
  } else if (backgroundMode === "glass") {
    bgClass = effectiveScrolled
      ? "bg-white/90 dark:bg-slate-950/90 shadow-md"
      : "bg-white/60 dark:bg-slate-950/60 shadow-sm";
    borderClass = "border-[var(--header-border)]";
  } else if (backgroundMode === "accent") {
    bgClass = "bg-gradient-to-r from-[var(--accent)] to-[var(--accent-strong)] shadow-md";
    borderClass = "border-transparent";
    textClass = "text-white [&_.site-header-nav-link]:text-white/80 [&_.site-header-nav-link.is-active]:text-white [&_.site-header-brand]:text-white [&_.site-header-brand_span]:!text-white [&_.site-header-top]:text-white/70";
  } else {
    // default background supports both light and dark mode colors through the CSS variable fallback
    bgClass = "bg-[var(--header-bg,rgba(255,255,255,0.92))]";
    borderClass = effectiveScrolled ? "border-[var(--header-border,rgba(209,213,219,0.72))]" : "border-transparent";
  }

  const baseSticky = `site-header sticky top-0 z-40 backdrop-blur-xl transition-all duration-300 ${textClass}`;
  const stateSticky = `${bgClass} border-b ${borderClass}`;

  const baseNone = "site-header";

  const isSticky = behavior !== "static";
  const base = isSticky ? baseSticky : baseNone;
  const state = isSticky ? stateSticky : "";

  const resolvedTextMode =
    textMode === "auto" ? (autoTextState?.textMode ?? "auto") : textMode;
  const sectionTransparent = sectionHeaderState.transparent;
  const effectiveOverlapHeader = overlapHeader || sectionHeaderState.pullUnder;
  return (
      <header
        id={id}
        ref={headerRef}
        className={`${base} ${state} ${className} ${sectionTransparent ? "site-header--section-transparent" : ""} ${effectiveHidden ? "site-header--scroll-hidden" : ""}`}
        style={{
          ...(hideBuilderServiceHeader ? { display: "none" } : {}),
          ...(isSticky ? { borderBottomColor: effectiveScrolled ? accentColor : "transparent" } : {}),
          ...style,
        }}
        data-header-behavior={behavior}
        data-scrolled={scrolled ? "true" : "false"}
        data-overlap-header={effectiveOverlapHeader ? "true" : "false"}
        data-section-header-transparent={sectionTransparent ? "true" : "false"}
        data-header-text-mode={resolvedTextMode}
        data-header-background-context={
          textMode === "auto" ? autoTextState?.context : undefined
        }
      >
        {children}
      </header>
  );
}
