import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { normalizeYoothemeSection } from "@/lib/yoothemeImportContract";
import { getUikitGlobalsCssVars } from "@/lib/uikitGlobals";
import { getUikitContainerClass } from "@/lib/uikitTokens";

test("preserves YOOtheme no-container sections separately from expanded containers", () => {
  expect(normalizeYoothemeSection({ width: "" })).toMatchObject({
    contentMode: "none",
    maxWidth: "none",
  });
  expect(normalizeYoothemeSection({ width: "none" })).toMatchObject({
    contentMode: "none",
    maxWidth: "none",
  });
  expect(normalizeYoothemeSection({ width: "expand" })).toMatchObject({
    contentMode: "expand",
    maxWidth: "expand",
  });
  expect(getUikitContainerClass("none")).toBe("");
  expect(getUikitContainerClass("expand")).toBe("uk-container uk-container-expand");
});

test("canonical Slideshow does not inherit the generic carousel card radius", async () => {
  const styles = await readFile(
    path.join(process.cwd(), "app/styles/shop-builder.css"),
    "utf8",
  );
  expect(styles).toContain(
    ".shop-builder-swiper.shop-builder-swiper--slideshow {\n  border-radius: 0;",
  );
  expect(styles).toContain(
    ".shop-builder-swiper.shop-builder-swiper--slideshow .swiper-slide,",
  );
  expect(styles).toContain(
    ".shop-builder-swiper.shop-builder-swiper--slideshow .shop-builder-hero-slide-card,",
  );
});

test("provider page frames use YOOtheme breakpoints and allow asymmetric sides", async () => {
  expect(getUikitGlobalsCssVars({
    themePageBorderWidth: "30px",
    themePageBorderWidthLarge: "50px",
    themePageBorderTopWidth: "0",
  })).toMatchObject({
    "--uk-theme-page-border-width": "30px",
    "--uk-theme-page-border-width-large": "50px",
    "--uk-theme-page-border-top-width": "0",
  });

  const source = await readFile(
    path.join(process.cwd(), "components/website/WebsiteFrontend.tsx"),
    "utf8",
  );
  expect(source).toContain("@media (min-width: 960px)");
  expect(source).toContain("@media (min-width: 1200px)");
  expect(source).toContain(
    "border-top-width: var(--uk-theme-page-border-top-width,",
  );
});
