"use client";

import DOMPurify from "dompurify";
import type { CSSProperties, ReactNode } from "react";
import { useEffect, useRef, useState } from "react";

const svgCache = new Map<string, Promise<string>>();

const colorablePaint = (value: string | null) => {
  const normalized = value?.trim().toLowerCase();
  return Boolean(normalized && normalized !== "none" && normalized !== "transparent" && !normalized.startsWith("url("));
};

export function sanitizeStylableSvg(
  source: string,
  fit: "contain" | "cover" | "fill" = "contain",
  svgClassName = "",
) {
  const clean = DOMPurify.sanitize(source, {
    USE_PROFILES: { svg: true, svgFilters: true },
    FORBID_TAGS: ["script", "style", "foreignObject", "iframe", "object", "embed", "animate", "set"],
    FORBID_ATTR: ["style", "onload", "onclick", "onerror"],
  });
  const document = new DOMParser().parseFromString(clean, "image/svg+xml");
  const svg = document.documentElement;
  if (svg.tagName.toLowerCase() !== "svg" || document.querySelector("parsererror")) {
    throw new Error("Invalid SVG document");
  }

  svg.querySelectorAll("*").forEach((element) => {
    for (const name of ["href", "xlink:href"]) {
      const reference = element.getAttribute(name);
      if (reference && !/^#[a-z0-9_.:-]+$/i.test(reference)) element.removeAttribute(name);
    }
    // Paint inside definitions/masks is structural (for example white mask
    // strokes) and must not inherit the presentation color.
    if (element.closest("defs, mask, clipPath, linearGradient, radialGradient, pattern, marker")) return;
    if (colorablePaint(element.getAttribute("fill"))) element.setAttribute("fill", "currentColor");
    if (colorablePaint(element.getAttribute("stroke"))) element.setAttribute("stroke", "currentColor");
  });
  if (colorablePaint(svg.getAttribute("fill"))) svg.setAttribute("fill", "currentColor");
  if (colorablePaint(svg.getAttribute("stroke"))) svg.setAttribute("stroke", "currentColor");
  svg.setAttribute("width", "100%");
  // `contain` is the natural, non-framing SVG presentation. Leaving a
  // percentage height here makes a width-only SVG depend on whatever wrapper
  // stylesheet happens to be present (Builder vs storefront). Preserve the
  // SVG's intrinsic viewBox ratio instead. Framed cover/fill media retains a
  // deliberate full-height SVG.
  if (fit === "contain") {
    svg.removeAttribute("height");
    svg.style.setProperty("height", "auto", "important");
  } else {
    svg.setAttribute("height", "100%");
  }
  svg.setAttribute("focusable", "false");
  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute("preserveAspectRatio", fit === "fill" ? "none" : fit === "cover" ? "xMidYMid slice" : "xMidYMid meet");
  svg.setAttribute("class", [svg.getAttribute("class"), svgClassName, "uk-svg"].filter(Boolean).join(" "));
  return new XMLSerializer().serializeToString(svg);
}

const requestUrl = (src: string) => {
  const resolved = new URL(src, window.location.href);
  return resolved.origin === window.location.origin
    ? resolved.href
    : `/api/builder-svg?url=${encodeURIComponent(resolved.href)}`;
};

const intrinsicSvgAspectRatio = (markup: string | null, fit: "contain" | "cover" | "fill") => {
  if (!markup || fit !== "contain") return undefined;
  const match = markup.match(/\bviewBox=["']\s*[-+]?\d+(?:\.\d+)?\s+[-+]?\d+(?:\.\d+)?\s+([-+]?\d+(?:\.\d+)?)\s+([-+]?\d+(?:\.\d+)?)["']/i);
  const width = Number(match?.[1]);
  const height = Number(match?.[2]);
  return width > 0 && height > 0 ? `${width} / ${height}` : undefined;
};

const loadSvg = (src: string, fit: "contain" | "cover" | "fill", svgClassName: string) => {
  const key = `${src}|${fit}|${svgClassName}`;
  const existing = svgCache.get(key);
  if (existing) return existing;
  const promise = fetch(requestUrl(src), { credentials: "same-origin" })
    .then(async (response) => {
      if (!response.ok) throw new Error(`SVG request failed (${response.status})`);
      return sanitizeStylableSvg(await response.text(), fit, svgClassName);
    });
  svgCache.set(key, promise);
  promise.catch(() => svgCache.delete(key));
  return promise;
};

type Props = {
  src: string;
  alt?: string;
  className?: string;
  color?: string;
  fit?: "contain" | "cover" | "fill";
  loading?: "lazy" | "eager";
  style?: CSSProperties;
  fallback: ReactNode;
};

/** Canonical sanitized inline-SVG renderer shared by Image and composed media elements. */
export default function UikitStylableSvg({
  src,
  alt,
  className,
  color,
  fit = "contain",
  loading = "lazy",
  style,
  fallback,
}: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const requestKey = `${src}|${fit}|${className ?? ""}`;
  const [result, setResult] = useState<{ key: string; markup?: string; failed?: boolean }>({ key: "" });
  const markup = result.key === requestKey ? result.markup ?? null : null;
  const failed = result.key === requestKey && result.failed === true;
  const naturalAspectRatio = intrinsicSvgAspectRatio(markup, fit);

  useEffect(() => {
    let cancelled = false;
    let observer: IntersectionObserver | undefined;
    const start = () => {
      void loadSvg(src, fit, className ?? "").then(
        (value) => { if (!cancelled) setResult({ key: requestKey, markup: value }); },
        () => { if (!cancelled) setResult({ key: requestKey, failed: true }); },
      );
    };
    if (loading === "eager" || typeof IntersectionObserver === "undefined") {
      start();
    } else if (ref.current) {
      observer = new IntersectionObserver((entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer?.disconnect();
        start();
      }, { rootMargin: "240px" });
      observer.observe(ref.current);
    }
    return () => { cancelled = true; observer?.disconnect(); };
  }, [className, fit, loading, requestKey, src]);

  if (failed) return fallback;

  return (
    <span
      ref={ref}
      className="shop-builder-stylable-svg-host"
      role="img"
      aria-label={alt || undefined}
      data-svg-state={markup ? "ready" : "loading"}
      style={{
        display: "inline-block",
        ...(naturalAspectRatio && style?.height === undefined ? { aspectRatio: naturalAspectRatio } : {}),
        ...(color ? { color } : {}),
        ...style,
      }}
      dangerouslySetInnerHTML={markup ? { __html: markup } : undefined}
    />
  );
}
