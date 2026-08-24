import { expect, test } from "@playwright/test";
import { getStorefrontHrefFromScopedPreviewHref } from "@/lib/scopedPreviewLinks";

test("normalizes same-tenant canonical preview navigation without losing target identity", () => {
  expect(getStorefrontHrefFromScopedPreviewHref(
    "/app/websites/circle/preview?page=home",
    "circle",
  )).toBe("/");
  expect(getStorefrontHrefFromScopedPreviewHref(
    "/app/websites/circle/preview?page=about",
    "circle",
  )).toBe("/about");
  expect(getStorefrontHrefFromScopedPreviewHref(
    "/app/websites/circle/preview?page=product-single&product=canvas-shoe",
    "circle",
  )).toBe("/product/canvas-shoe");
});

test("does not reinterpret another tenant's preview URL", () => {
  const href = "/app/websites/another/preview?page=home";
  expect(getStorefrontHrefFromScopedPreviewHref(href, "circle")).toBe(href);
});
