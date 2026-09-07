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
  expect(getStorefrontHrefFromScopedPreviewHref(
    "/app/websites/circle/preview?page=product-category&category=kids",
    "circle",
  )).toBe("/product-category/kids");
  expect(getStorefrontHrefFromScopedPreviewHref(
    "/app/websites/circle/preview?page=product-category-specific&category=babies-0-24-months",
    "circle",
  )).toBe("/product-category/babies-0-24-months");
});

test("does not reinterpret another tenant's preview URL", () => {
  const href = "/app/websites/another/preview?page=home";
  expect(getStorefrontHrefFromScopedPreviewHref(href, "circle")).toBe(href);
});

test("normalizes legacy WooCommerce category queries as storefront routes", () => {
  expect(getStorefrontHrefFromScopedPreviewHref(
    "/app/websites/woolberry/preview?product_cat=women",
    "woolberry",
  )).toBe("/?product_cat=women");
  expect(getStorefrontHrefFromScopedPreviewHref(
    "?product_cat=men",
    "woolberry",
  )).toBe("/?product_cat=men");
});
