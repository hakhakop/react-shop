import type { CSSProperties } from "react";
import type {
  BuilderParallaxSettings,
  BuilderParallaxStop,
  BuilderParallaxTransformOrigin,
} from "@/components/dashboard/builderTypes";

export type BuilderAnimationLike = {
  preset?: string;
  delayMs?: number;
  durationMs?: number;
  easing?: "ease-out" | "ease-in-out" | "spring";
  triggerOffset?: number;
  playOnce?: boolean;
  progressSmoothingMs?: number;
  scrubDistanceVh?: number;
  stepOffset?: number;
  once?: boolean;
  pauseUntilComplete?: boolean;
  progressDirection?: "horizontal" | "vertical";
  parallax?: BuilderParallaxSettings;
  parallaxY?: [number, number];
  parallaxEasing?: number;
};

export type BuilderAnimationStyle = CSSProperties &
  Record<`--${string}`, string | undefined>;

export type BuilderAnimationAttributes = {
  data: Record<string, string | undefined>;
  style?: BuilderAnimationStyle;
};

const STYLE_ONLY_PRESETS = new Set(["princity-gradient"]);

function sourceOf(
  animation?: BuilderAnimationLike | Record<string, unknown>,
) {
  return animation as BuilderAnimationLike | undefined;
}

const PARALLAX_ORIGINS = new Set<BuilderParallaxTransformOrigin>([
  "top-left", "top-center", "top-right",
  "center-left", "center-center", "center-right",
  "bottom-left", "bottom-center", "bottom-right",
]);

const normalizeStops = (value: unknown): BuilderParallaxStop[] | undefined => {
  if (!Array.isArray(value)) return undefined;
  const stops = value.flatMap((stop): BuilderParallaxStop[] => {
    if (typeof stop === "string" && stop.trim()) return [{ value: stop.trim() }];
    if (!stop || typeof stop !== "object") return [];
    const candidate = stop as { value?: unknown; position?: unknown };
    if (typeof candidate.value !== "string" || !candidate.value.trim()) return [];
    const position = typeof candidate.position === "number" && Number.isFinite(candidate.position)
      ? Math.max(0, Math.min(100, candidate.position))
      : undefined;
    return [{ value: candidate.value.trim(), ...(position === undefined ? {} : { position }) }];
  });
  return stops.length ? stops : undefined;
};

/** Normalize universal parallax while retaining legacy import aliases. */
export function normalizeBuilderParallax(
  animation?: BuilderAnimationLike | Record<string, unknown>,
): BuilderParallaxSettings | undefined {
  const source = sourceOf(animation) as (BuilderAnimationLike & Record<string, unknown>) | undefined;
  if (!source) return undefined;
  const authored = source.parallax && typeof source.parallax === "object"
    ? source.parallax
    : undefined;
  const legacyY = Array.isArray(source.parallaxY) && source.parallaxY.length === 2
    && source.parallaxY.every((value) => typeof value === "number" && Number.isFinite(value))
    ? source.parallaxY.map((value) => ({ value: String(value) }))
    : undefined;
  const normalized: BuilderParallaxSettings = {
    ...(normalizeStops(authored?.x) ? { x: normalizeStops(authored?.x) } : {}),
    ...(normalizeStops(authored?.y) ? { y: normalizeStops(authored?.y) } : authored === undefined && legacyY ? { y: legacyY } : {}),
    ...(normalizeStops(authored?.scale) ? { scale: normalizeStops(authored?.scale) } : {}),
    ...(normalizeStops(authored?.rotate) ? { rotate: normalizeStops(authored?.rotate) } : {}),
    ...(normalizeStops(authored?.opacity) ? { opacity: normalizeStops(authored?.opacity) } : {}),
    ...(normalizeStops(authored?.blur) ? { blur: normalizeStops(authored?.blur) } : {}),
    ...(typeof authored?.transformOrigin === "string" && PARALLAX_ORIGINS.has(authored.transformOrigin as BuilderParallaxTransformOrigin)
      ? { transformOrigin: authored.transformOrigin as BuilderParallaxTransformOrigin } : {}),
    ...(typeof authored?.easing === "number" && Number.isFinite(authored.easing)
      ? { easing: authored.easing } : authored === undefined && typeof source.parallaxEasing === "number" && Number.isFinite(source.parallaxEasing)
        ? { easing: source.parallaxEasing } : {}),
    ...(typeof authored?.target === "string" ? { target: authored.target } : {}),
    ...(typeof authored?.start === "string" ? { start: authored.start } : {}),
    ...(typeof authored?.end === "string" ? { end: authored.end } : {}),
    ...(typeof authored?.zIndex === "boolean" ? { zIndex: authored.zIndex } : {}),
    ...(typeof authored?.breakpoint === "string" ? { breakpoint: authored.breakpoint as BuilderParallaxSettings["breakpoint"] } : {}),
  };
  return Object.keys(normalized).length ? normalized : undefined;
}

export function builderAnimationPreset(
  animation?: BuilderAnimationLike | Record<string, unknown>,
) {
  const preset = sourceOf(animation)?.preset;
  return typeof preset === "string" && preset !== "none" ? preset : null;
}

export function isBuilderStyleOnlyPreset(preset?: string | null) {
  return preset ? STYLE_ONLY_PRESETS.has(preset) : false;
}

export function builderAnimationClassName(
  animation?: BuilderAnimationLike | Record<string, unknown>,
) {
  const preset = builderAnimationPreset(animation);
  return preset ? `shop-builder-animate--${preset}` : "";
}

export function builderAnimationDataAttributes(
  animation?: BuilderAnimationLike | Record<string, unknown>,
): BuilderAnimationAttributes {
  const preset = builderAnimationPreset(animation);
  const source = sourceOf(animation);

  if (preset === "parallax") {
    const parallax = normalizeBuilderParallax(source);
    const parallaxY = parallax?.y?.length === 2
      ? parallax.y.map((stop) => stop.value).join(",")
      : undefined;
    const easing = typeof parallax?.easing === "number" && Number.isFinite(parallax.easing)
      ? String(parallax.easing)
      : undefined;
    return {
      data: {
        "data-builder-parallax": parallax ? JSON.stringify(parallax) : undefined,
        "data-builder-parallax-y": parallaxY,
        "data-builder-parallax-easing": easing,
      },
    };
  }

  if (!preset || isBuilderStyleOnlyPreset(preset)) {
    return { data: {} };
  }

  const delay =
    typeof source?.delayMs === "number" && Number.isFinite(source.delayMs)
      ? `${Math.max(0, source.delayMs)}ms`
      : undefined;
  const progressSmoothing =
    typeof source?.progressSmoothingMs === "number" &&
    Number.isFinite(source.progressSmoothingMs)
      ? `${Math.max(0, source.progressSmoothingMs)}ms`
      : undefined;
  const scrubDistance =
    typeof source?.scrubDistanceVh === "number" &&
    Number.isFinite(source.scrubDistanceVh)
      ? `${Math.max(40, source.scrubDistanceVh)}vh`
      : undefined;
  const stepOffset =
    typeof source?.stepOffset === "number" && Number.isFinite(source.stepOffset)
      ? String(source.stepOffset)
      : undefined;
  const duration =
    typeof source?.durationMs === "number" && Number.isFinite(source.durationMs)
      ? `${Math.max(200, source.durationMs * 1000)}ms`
      : undefined;
  const easing =
    source?.easing === "ease-in-out"
      ? "cubic-bezier(0.65, 0, 0.35, 1)"
      : source?.easing === "spring"
        ? "cubic-bezier(0.34, 1.56, 0.64, 1)"
        : undefined;
  const style: BuilderAnimationStyle = {
    ...(delay ? { "--builder-animate-delay": delay } : {}),
    ...(duration ? { "--builder-animate-duration": duration } : {}),
    ...(easing ? { "--builder-animate-easing": easing } : {}),
    ...(progressSmoothing
      ? { "--builder-progress-smoothing": progressSmoothing }
      : {}),
    ...(scrubDistance ? { "--builder-pin-distance": scrubDistance } : {}),
  };

  const playOnce =
    typeof source?.once !== "undefined"
      ? source.once
      : typeof source?.playOnce !== "undefined"
        ? source.playOnce
        : true;
  const triggerOffset =
    typeof source?.triggerOffset === "number" &&
    Number.isFinite(source.triggerOffset)
      ? String(source.triggerOffset)
      : undefined;

  return {
    data: {
      "data-builder-animate": preset,
      "data-builder-animate-once": playOnce === false ? "false" : "true",
      "data-builder-pause": source?.pauseUntilComplete ? "true" : undefined,
      "data-builder-step-offset": stepOffset,
      "data-builder-trigger-offset": triggerOffset,
      "data-builder-progress-direction":
        source?.progressDirection === "vertical" ? "vertical" : undefined,
    },
    style: Object.keys(style).length ? style : undefined,
  };
}
