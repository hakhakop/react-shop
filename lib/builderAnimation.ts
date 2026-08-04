import type { CSSProperties } from "react";

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
