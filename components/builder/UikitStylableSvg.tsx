"use client";

import DOMPurify from "dompurify";
import type { CSSProperties, ReactNode } from "react";
import { useEffect, useRef, useState } from "react";

const svgCache = new Map<string, Promise<string>>();

const colorablePaint = (value: string | null) => {
  const normalized = value?.trim().toLowerCase();
  return Boolean(normalized && normalized !== "none" && normalized !== "transparent" && !normalized.startsWith("url("));
};

/** Preserve YOOtheme asset-authored shadows without allowing arbitrary embedded SVG CSS. */
export function extractSafeSvgDropShadow(source: string) {
  const value = source.match(/\bfilter\s*:\s*([^;}{]+)\s*;/i)?.[1]?.trim();
  if (!value) return undefined;
  const dropShadow = String.raw`drop-shadow\(\s*-?[\d.]+(?:px)?\s+-?[\d.]+(?:px)?\s+(?:-?[\d.]+(?:px)?\s+)?(?:#[\da-f]{3,8}|rgba?\(\s*[\d.%]+\s*,\s*[\d.%]+\s*,\s*[\d.%]+(?:\s*,\s*[\d.%]+)?\s*\))\s*\)`;
  return new RegExp(`^${dropShadow}(?:\\s+${dropShadow})*$`, "i").test(value) ? value : undefined;
}

/** Keep YOOtheme's parallax pivot without restoring arbitrary inline CSS. */
export function extractSafeSvgTransformOrigin(styleSource: string | null) {
  const value = styleSource
    ?.match(/(?:^|;)\s*transform-origin\s*:\s*([^;]+)/i)?.[1]
    ?.trim();
  if (!value) return undefined;
  const component = String.raw`(?:left|center|right|top|bottom|0|-?(?:\d+(?:\.\d+)?|\.\d+)(?:%|px|em|rem))`;
  return new RegExp(`^${component}(?:\\s+${component}){0,2}$`, "i").test(value)
    ? value
    : undefined;
}

/** Preserve the small, presentation-only surface contract used by YOOtheme
 * inline SVG assets without re-enabling arbitrary embedded SVG CSS. */
function extractSafeSvgSurfaceStyle(source: string) {
  const styleBlock = source.match(/<style[^>]*>([\s\S]*?)<\/style>/i)?.[1] ?? "";
  if (!styleBlock) return undefined;
  const read = (property: string, pattern: RegExp) => {
    const value = styleBlock.match(pattern)?.[1]?.trim();
    return value && !/[{};]/.test(value) ? value : undefined;
  };
  const backgroundColor = read("background-color", /background-color\s*:\s*([^;}{]+)/i);
  const backdropFilter = read("backdrop-filter", /(?:-webkit-)?backdrop-filter\s*:\s*([^;}{]+)/i);
  const borderRadius = read("border-radius", /border-radius\s*:\s*([^;}{]+)/i);
  const safeBlur = backdropFilter && /^blur\(\s*\d+(?:\.\d+)?(?:px|rem|em|%)\s*\)$/i.test(backdropFilter)
    ? backdropFilter
    : undefined;
  const safeRadius = borderRadius && /^\d+(?:\.\d+)?(?:px|rem|em|%)$/i.test(borderRadius)
    ? borderRadius
    : undefined;
  const safeBackground = backgroundColor && /^(?:transparent|#[\da-f]{3,8}|rgba?\([^)]*\))$/i.test(backgroundColor)
    ? backgroundColor
    : undefined;
  if (!safeBlur && !safeRadius && !safeBackground) return undefined;
  return {
    backgroundColor: safeBackground,
    backdropFilter: safeBlur,
    WebkitBackdropFilter: safeBlur,
    borderRadius: safeRadius,
  };
}

function isSafeEmbeddedImageReference(value: string) {
  // Some YOOtheme decorative SVGs contain their artwork as an embedded,
  // base64-encoded raster/SVG image. Keep those self-contained layers, but do
  // not allow arbitrary external, javascript, or non-image references.
  return /^data:image\/(?:png|jpe?g|gif|webp|svg\+xml);base64,[a-z0-9+/=]+$/i.test(value);
}

export function sanitizeStylableSvg(
  source: string,
  fit: "contain" | "cover" | "fill" = "contain",
  svgClassName = "",
  preserveIntrinsicSize = false,
) {
  const safeDropShadow = extractSafeSvgDropShadow(source);
  const safeSurfaceStyle = extractSafeSvgSurfaceStyle(source);
  const clean = DOMPurify.sanitize(source, {
    USE_PROFILES: { svg: true, svgFilters: true },
    FORBID_TAGS: ["script", "style", "foreignObject", "iframe", "object", "embed", "animate", "set"],
    // Inline styles are read from the detached sanitized document below and
    // then removed wholesale. Only the validated parallax transform origin is
    // restored, so no source-authored CSS reaches the rendered page.
    FORBID_ATTR: ["onload", "onclick", "onerror"],
  });
  const document = new DOMParser().parseFromString(clean, "image/svg+xml");
  const svg = document.documentElement as unknown as SVGSVGElement;
  if (svg.tagName.toLowerCase() !== "svg" || document.querySelector("parsererror")) {
    throw new Error("Invalid SVG document");
  }

  svg.querySelectorAll("[style]").forEach((element) => {
    const transformOrigin = element.hasAttribute("data-uk-parallax")
      ? extractSafeSvgTransformOrigin(element.getAttribute("style"))
      : undefined;
    element.removeAttribute("style");
    if (transformOrigin) (element as SVGElement).style.setProperty("transform-origin", transformOrigin);
  });

  svg.querySelectorAll("*").forEach((element) => {
    for (const name of ["href", "xlink:href"]) {
      const reference = element.getAttribute(name);
      if (reference && !/^#[a-z0-9_.:-]+$/i.test(reference) && !isSafeEmbeddedImageReference(reference)) {
        element.removeAttribute(name);
      }
    }
    // Paint inside definitions/masks is structural (for example white mask
    // strokes) and must not inherit the presentation color. UIkit's `uk-svg`
    // contract likewise keeps authored paint on `.uk-preserve` artwork (and
    // its descendants) while the remaining shapes inherit the SVG Color.
    if (element.closest("defs, mask, clipPath, linearGradient, radialGradient, pattern, marker, .uk-preserve")) return;
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
  if (safeDropShadow) svg.style.setProperty("filter", safeDropShadow);
  if (safeSurfaceStyle?.backgroundColor) svg.style.setProperty("background-color", safeSurfaceStyle.backgroundColor);
  if (safeSurfaceStyle?.backdropFilter) {
    svg.style.setProperty("backdrop-filter", safeSurfaceStyle.backdropFilter);
    svg.style.setProperty("-webkit-backdrop-filter", safeSurfaceStyle.backdropFilter);
  }
  if (safeSurfaceStyle?.borderRadius) svg.style.setProperty("border-radius", safeSurfaceStyle.borderRadius);
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
  const [result, setResult] = useState<{ key: string; markup?: string; failed?: boolean; error?: string }>({ key: "" });
  const markup = result.key === requestKey ? result.markup ?? null : null;
  const failed = result.key === requestKey && result.failed === true;
  const naturalAspectRatio = intrinsicSvgAspectRatio(markup, fit);

  useEffect(() => {
    let cancelled = false;
    let observer: IntersectionObserver | undefined;
    const start = () => {
      void loadSvg(src, fit, className ?? "", preserveIntrinsicSize).then(
        (value) => { if (!cancelled) setResult({ key: requestKey, markup: value }); },
        (error) => {
          if (!cancelled) {
            setResult({
              key: requestKey,
              failed: true,
              error: error instanceof Error ? error.message : "SVG rendering failed",
            });
          }
        },
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

  if (failed) {
    return (
      <span
        data-svg-state="failed"
        data-svg-error={result.error}
        style={{ display: "contents" }}
      >
        {fallback}
      </span>
    );
  }

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
