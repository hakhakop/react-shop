import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { normalizeBuilderShellSettings } from "@/lib/builderShell";
import { getUikitGlobalsCssVars } from "@/lib/uikitGlobals";

const devStackPrimaryShadow = "-5px -5px 20px rgba(255,255,255,.9), 5px 5px 20px rgba(20,116,190,.3)";
const devStackPrimaryHoverShadow = "-2px -2px 10px rgba(255,255,255,.8), 2px 2px 5px rgba(20,116,190,.3)";

test("tenant Card tokens do not leak between Circle and DevStack", () => {
  const circle = normalizeBuilderShellSettings({
    globalStylePresetName: "Circle-Default-2",
    cardShadow: "none",
  });
  const devStack = normalizeBuilderShellSettings({
    globalStylePresetName: "DevStack Light Blue",
    cardPrimaryShadow: devStackPrimaryShadow,
    cardPrimaryHoverShadow: devStackPrimaryHoverShadow,
  });

  const circleVars = getUikitGlobalsCssVars(circle);
  const devStackVars = getUikitGlobalsCssVars(devStack);

  expect(circleVars["--uk-card-primary-shadow"]).toBe("none");
  expect(circleVars["--uk-card-primary-hover-shadow"]).toBe("none");
  expect(circleVars["--uk-card-secondary-shadow"]).toBe("none");
  expect(circleVars["--uk-card-secondary-hover-shadow"]).toBe("none");
  expect(devStackVars["--uk-card-primary-shadow"]).toBe(devStackPrimaryShadow);
  expect(devStackVars["--uk-card-primary-hover-shadow"]).toBe(devStackPrimaryHoverShadow);

  // Switching resolution order must not mutate either tenant's token set.
  expect(getUikitGlobalsCssVars(circle)["--uk-card-primary-shadow"]).toBe("none");
  expect(getUikitGlobalsCssVars(devStack)["--uk-card-primary-shadow"]).toBe(devStackPrimaryShadow);
});

test("Grid Card CSS uses canonical variant shadow variables without DevStack fallbacks", () => {
  const css = readFileSync(resolve(process.cwd(), "app/styles/shop-builder.css"), "utf8");

  expect(css).toContain("box-shadow: var(--uk-card-primary-shadow, none) !important;");
  expect(css).toContain("box-shadow: var(--uk-card-primary-hover-shadow, none) !important;");
  expect(css).toContain("box-shadow: var(--uk-card-secondary-shadow, none) !important;");
  expect(css).toContain("box-shadow: var(--uk-card-secondary-hover-shadow, none) !important;");
  expect(css).toContain("box-shadow: var(--uk-card-default-hover-shadow, var(--uk-card-hover-shadow, none)) !important;");
  expect(css).not.toContain("var(--uk-card-default-hover-box-shadow,");
  expect(css).not.toContain("var(--uk-card-primary-box-shadow,");
  expect(css).not.toContain("var(--uk-card-primary-hover-box-shadow,");
  expect(css).not.toContain("var(--uk-card-secondary-box-shadow,");
  expect(css).not.toContain("var(--uk-card-secondary-hover-box-shadow,");
});
