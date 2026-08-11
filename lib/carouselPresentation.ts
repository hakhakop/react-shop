import type { BuilderShellSettings } from "@/lib/builderShell";
import { resolveAppearanceValue } from "@/lib/globalStyleTokens";

type RecordValue = Record<string, any>;

export type CarouselContentAlignment = "left" | "center" | "right";

/** Shared content-alignment value normalizer. Media alignment is unrelated. */
export function resolveCarouselContentAlignment(value: unknown): CarouselContentAlignment {
  if (value === "left" || value === "center" || value === "right") return value;
  return "left";
}

const resolveString = (local: unknown, global: unknown, fallback: string) =>
  resolveAppearanceValue({
    local: typeof local === "string" && !["", "inherit", "default"].includes(local.trim().toLowerCase()) ? local : undefined,
    global: typeof global === "string" ? global : undefined,
    componentDefault: fallback,
  }).value;

/** Shared Global Slider/Image → CarouselBlock presentation boundary. */
export function resolveCarouselPresentation(
  carouselSettings: RecordValue | null | undefined,
  slides: RecordValue[] | null | undefined,
  shellSettings: Partial<BuilderShellSettings> | null | undefined,
) {
  const settings = carouselSettings ?? {};
  const shell = shellSettings ?? {};
  const presentation = settings.presentation;
  const semanticVariant =
    presentation === "slideshow"
      ? "slideshow"
      : presentation === "overlay-slider"
        ? "overlay"
        : presentation === "panel-slider"
          ? "panel"
          : settings.variant;
  return {
    settings: {
      ...settings,
      // Public elements choose semantics; CarouselBlock remains the sole
      // rendering primitive. Old generic sliders retain their saved mode.
      variant: semanticVariant,
      slideMode:
        presentation === "overlay-slider"
          ? "overlay"
          : presentation === "panel-slider"
            ? "panel"
            : presentation === "slideshow"
              // Slideshow reuses the shared full-bleed slide markup, but
              // must not acquire the generic Hero presentation class.
              ? "hero"
              : settings.slideMode,
      aspectRatio:
        presentation === "slideshow" && settings.slideshowRatio
          ? settings.slideshowRatio
          : settings.aspectRatio,
      arrowStyle: resolveString(settings.arrowStyle, shell.sliderArrowStyle, "chevron"),
      arrowPosition: resolveString(settings.arrowPosition, shell.sliderArrowPosition, "overlay"),
      paginationStyle: resolveString(settings.paginationStyle, shell.sliderDotnavStyle, "minimal-dots"),
      paginationPosition: resolveString(settings.paginationPosition, shell.sliderDotnavPosition, "bottom"),
    },
    slides: (slides ?? []).map((slide) => ({
      ...slide,
      imageRatio: resolveString(slide.imageRatio, shell.imageDefaultRatio, "natural"),
      imageFit: resolveString(slide.imageFit, shell.imageDefaultFit, "natural"),
      imageShape: resolveString(slide.imageShape, shell.imageDefaultBorder, "none"),
      imageShadow: resolveString(slide.imageShadow, shell.imageDefaultShadow, "none"),
      // Panel Slider's structural `image_align` is not equivalent to the
      // shared Image left/center/right control and remains deferred. In the
      // meantime it must not inherit a generic image alignment which produces
      // UIkit float margins the source element never asked for.
      imageAlignment:
        presentation === "panel-slider"
          ? (typeof slide.imageAlignment === "string" && slide.imageAlignment.trim() ? slide.imageAlignment : undefined)
          : resolveString(slide.imageAlignment, shell.imageDefaultAlignment, "center"),
      imageLoading: resolveString(slide.imageLoading, shell.imageDefaultLoading, "lazy"),
    })),
  };
}
