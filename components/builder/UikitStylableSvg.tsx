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
  preserveIntrinsicSize = false,
) {
  const clean = DOMPurify.sanitize(source, {
    USE_PROFILES: { svg: true, svgFilters: true },
    FORBID_TAGS: ["script", "style", "foreignObject", "iframe", "object", "embed", "animate", "set"],
    FORBID_ATTR: ["style", "onload", "onclick", "onerror"],
  });
  const document = new DOMParser().parseFromString(clean, "image/svg+xml");
  const svg = document.documentElement as unknown as SVGSVGElement;
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
  const intrinsicDimensions = resolveIntrinsicSvgDimensions(svg);
  if (preserveIntrinsicSize && fit === "contain") {
    // YOOtheme's ViewHelper/SvgHelper fills a missing SVG width or height
    // from its intrinsic root dimensions (or viewBox) before rendering. Keep
    // that source geometry for a no-width inline SVG instead of converting it
    // into a full-width media frame.
    if (intrinsicDimensions.width) svg.setAttribute("width", intrinsicDimensions.width);
    else svg.removeAttribute("width");
    if (intrinsicDimensions.height) svg.setAttribute("height", intrinsicDimensions.height);
    else svg.removeAttribute("height");
  } else {
    svg.setAttribute("width", "100%");
  }
  // `contain` is the natural, non-framing SVG presentation. Leaving a
  // percentage height here makes a width-only SVG depend on whatever wrapper
  // stylesheet happens to be present (Builder vs storefront). Preserve the
  // SVG's intrinsic viewBox ratio instead. Framed cover/fill media retains a
  // deliberate full-height SVG.
  if (fit === "contain" && !preserveIntrinsicSize) {
    svg.removeAttribute("height");
    svg.style.setProperty("height", "auto", "important");
  } else if (fit !== "contain") {
    svg.setAttribute("height", "100%");
  }
  svg.setAttribute("focusable", "false");
  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute("preserveAspectRatio", fit === "fill" ? "none" : fit === "cover" ? "xMidYMid slice" : "xMidYMid meet");
  svg.setAttribute("class", [svg.getAttribute("class"), svgClassName, "uk-svg"].filter(Boolean).join(" "));
  return new XMLSerializer().serializeToString(svg);
}

function numericSvgDimension(value: string | null) {
  const match = value?.trim().match(/^([0-9]+(?:\.[0-9]+)?)(?:px)?$/i);
  const number = Number(match?.[1]);
  return Number.isFinite(number) && number > 0 ? number : undefined;
}

/** Mirrors YOOtheme SvgHelper's numeric root/viewBox dimension fallback. */
function resolveIntrinsicSvgDimensions(svg: SVGSVGElement) {
  let width = numericSvgDimension(svg.getAttribute("width"));
  let height = numericSvgDimension(svg.getAttribute("height"));
  const viewBox = svg.getAttribute("viewBox")
    ?.trim()
    .split(/[\s,]+/)
    .map(Number);
  const viewBoxWidth = viewBox && viewBox.length === 4 && Number.isFinite(viewBox[2]) && viewBox[2] > 0
    ? viewBox[2]
    : undefined;
  const viewBoxHeight = viewBox && viewBox.length === 4 && Number.isFinite(viewBox[3]) && viewBox[3] > 0
    ? viewBox[3]
    : undefined;

  if (!width && height && viewBoxWidth && viewBoxHeight) width = Math.round(viewBoxWidth * (height / viewBoxHeight));
  if (!height && width && viewBoxWidth && viewBoxHeight) height = Math.round(viewBoxHeight * (width / viewBoxWidth));
  if (!width && viewBoxWidth) width = Math.round(viewBoxWidth);
  if (!height && viewBoxHeight) height = Math.round(viewBoxHeight);

  return {
    width: width ? String(width) : undefined,
    height: height ? String(height) : undefined,
  };
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

const loadSvg = (
  src: string,
  fit: "contain" | "cover" | "fill",
  svgClassName: string,
  preserveIntrinsicSize: boolean,
) => {
  const key = `${src}|${fit}|${svgClassName}|${preserveIntrinsicSize ? "intrinsic" : "frame"}`;
  const existing = svgCache.get(key);
  if (existing) return existing;
  const promise = fetch(requestUrl(src), { credentials: "same-origin" })
    .then(async (response) => {
      if (!response.ok) throw new Error(`SVG request failed (${response.status})`);
      return sanitizeStylableSvg(await response.text(), fit, svgClassName, preserveIntrinsicSize);
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
  /** Keep a no-width YOOtheme SVG at its source/viewBox dimensions. */
  preserveIntrinsicSize?: boolean;
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
  preserveIntrinsicSize = false,
  style,
  fallback,
}: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const requestKey = `${src}|${fit}|${className ?? ""}|${preserveIntrinsicSize ? "intrinsic" : "frame"}`;
  const [result, setResult] = useState<{ key: string; markup?: string; failed?: boolean }>({ key: "" });
  const markup = result.key === requestKey ? result.markup ?? null : null;
  const failed = result.key === requestKey && result.failed === true;
  const naturalAspectRatio = intrinsicSvgAspectRatio(markup, fit);

  useEffect(() => {
    let cancelled = false;
    let observer: IntersectionObserver | undefined;
    const start = () => {
      void loadSvg(src, fit, className ?? "", preserveIntrinsicSize).then(
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
  }, [className, fit, loading, preserveIntrinsicSize, requestKey, src]);

  if (failed) return fallback;

  return (
    <span
      ref={ref}
      className={`shop-builder-stylable-svg-host${preserveIntrinsicSize ? " shop-builder-stylable-svg-host--intrinsic" : ""}`}
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
