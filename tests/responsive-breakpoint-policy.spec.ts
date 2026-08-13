import { expect, test } from "@playwright/test";
import {
  renderResponsiveBreakpointPolicyCss,
  resolveResponsiveBreakpointPolicy,
  resolveResponsiveBreakpointTier,
} from "@/lib/responsiveBreakpointPolicy";

test("responsive policy resolves the canonical defaults and emits scoped page CSS", () => {
  const policy = resolveResponsiveBreakpointPolicy();
  expect(policy).toMatchObject({ small: 640, medium: 960, large: 1200, xlarge: 1600 });
  expect(renderResponsiveBreakpointPolicyCss(policy)).toContain('[data-builder-page-root][data-responsive-breakpoint-policy="s640-m960-l1200-xl1600"]');
  expect(renderResponsiveBreakpointPolicyCss(policy)).toContain("@media (min-width:640px)");
  expect(renderResponsiveBreakpointPolicyCss(policy)).toContain("@media (min-width:1600px)");
});

test("responsive policy has one JS/CSS resolution path for a valid custom shell policy", () => {
  const policy = resolveResponsiveBreakpointPolicy({
    breakpointSmall: "700px",
    breakpointMedium: "1000px",
    breakpointLarge: "1280px",
    breakpointXLarge: "1700px",
  });
  expect(policy).toMatchObject({ small: 700, medium: 1000, large: 1280, xlarge: 1700 });
  expect(renderResponsiveBreakpointPolicyCss(policy)).toContain("@media (min-width:1000px)");
  const css = renderResponsiveBreakpointPolicyCss(policy);
  expect(css).toContain(".builder-general-textalign-center-from-medium");
  expect(css).toContain(".shop-builder-section[data-section-title-breakpoint=\"large\"]");
  expect(css).toContain(".builder-text-columns-1-2-from-large");
  expect(css).toContain(".shop-builder-slidenav-from-xlarge");
  expect(css).toContain(".shop-builder-grid");
});

test("invalid persisted policy falls back as one complete default policy", () => {
  expect(resolveResponsiveBreakpointPolicy({ breakpointSmall: "1000px", breakpointMedium: "960px" }))
    .toMatchObject({ small: 640, medium: 960, large: 1200, xlarge: 1600 });
});

test("semantic tiers change exactly at every default and imported-policy boundary", () => {
  for (const policy of [
    resolveResponsiveBreakpointPolicy(),
    resolveResponsiveBreakpointPolicy({
      breakpointSmall: "700px", breakpointMedium: "1000px", breakpointLarge: "1280px", breakpointXLarge: "1680px",
    }),
  ]) {
    const boundaries = [
      [policy.small, "base", "small"],
      [policy.medium, "small", "medium"],
      [policy.large, "medium", "large"],
      [policy.xlarge, "large", "xlarge"],
    ] as const;
    for (const [threshold, before, at] of boundaries) {
      expect(resolveResponsiveBreakpointTier(threshold - 1, policy)).toBe(before);
      expect(resolveResponsiveBreakpointTier(threshold, policy)).toBe(at);
      expect(resolveResponsiveBreakpointTier(threshold + 1, policy)).toBe(at);
    }
  }
});
