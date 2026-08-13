export type PanelSliderWidthSettings = {
  itemWidthMode?: "auto" | "fixed" | null;
  cardsPerView?: number | null;
  cardsPerViewPhone?: number | null;
  cardsPerViewSmall?: number | null;
  cardsPerViewMedium?: number | null;
  cardsPerViewLarge?: number | null;
  cardsPerViewXLarge?: number | null;
};

const count = (value: number | null | undefined, inherited: number) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) && numeric >= 1
    ? Math.min(Math.round(numeric), 6)
    : inherited;
};

/**
 * Resolve persisted YOOtheme Panel Slider widths at the runtime boundary.
 * Auto is content-sized, matching UIkit. Fixed consumes the responsive
 * fractions and carries omitted breakpoint values forward.
 */
export function resolvePanelSliderRuntime(
  settings: PanelSliderWidthSettings,
  breakpointPolicy: ResponsiveBreakpointPolicy = resolveResponsiveBreakpointPolicy(),
) {
  const base = count(settings.cardsPerViewPhone, count(settings.cardsPerView, 1));
  const small = count(settings.cardsPerViewSmall, base);
  const medium = count(settings.cardsPerViewMedium, small);
  const large = count(settings.cardsPerViewLarge, medium);
  const xlarge = count(settings.cardsPerViewXLarge, large);
  const mode = settings.itemWidthMode === "fixed" ? "fixed" : "auto";

  return {
    mode,
    slidesPerView: mode === "auto" ? "auto" as const : base,
    counts: { base, small, medium, large, xlarge },
    breakpoints: mode === "auto" ? undefined : {
      0: { slidesPerView: base },
      [breakpointPolicy.small]: { slidesPerView: small },
      [breakpointPolicy.medium]: { slidesPerView: medium },
      [breakpointPolicy.large]: { slidesPerView: large },
      [breakpointPolicy.xlarge]: { slidesPerView: xlarge },
    },
  };
}
import {
  resolveResponsiveBreakpointPolicy,
  type ResponsiveBreakpointPolicy,
} from "@/lib/responsiveBreakpointPolicy";
