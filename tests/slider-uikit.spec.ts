import { expect, test } from "@playwright/test";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { waitForSeededBuilderLayout } from "./builderFixture";

const email = "header-parity-20260722@example.test";
const password = "HeaderParity!2026";
const builderUrl = "/app/websites/header-parity-site/builder?page=home";
const previewUrl = "/app/websites/header-parity-site/preview?page=home";
const layoutsPath = resolve(process.cwd(), "data/websites/eb65bd05-1299-4071-b432-f3c04e9eda2e/builder-layouts.json");
const originalLayouts = readFileSync(layoutsPath, "utf8");

test.afterAll(() => writeFileSync(layoutsPath, originalLayouts));

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 2400, height: 1400 });
  await page.goto("/login");
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/app(?:\?|$)/);
});

test("Slider consumes shared title, meta, content, and link capabilities in builder and frontend", async ({ page, context }) => {
  await page.goto(builderUrl);
  await waitForSeededBuilderLayout(page);
  await page.locator(".builder-sidebar-nav-tile", { hasText: "Blocks" }).first().click();
  await page.locator(".builder-element-library-search input").fill("slider");
  await page.locator(".builder-element-library-card", { hasText: "Slider" }).first().click();

  const selected = page.locator(".builder-preview-layout-block.is-selected-block").last();
  const slider = selected.locator(".shop-builder-column-block--slider");
  await expect(slider).toBeVisible();
  await selected.locator(".builder-preview-block-tools").getByRole("button", { name: "Edit element" }).dispatchEvent("click");

  const inspector = page.locator(".builder-floating-inspector");
  await inspector.getByRole("button", { name: "Settings", exact: true }).click();
  const settings = inspector.locator('[data-uikit-capability="slider-settings"]');
  const division = (title: string) =>
    settings.locator(".builder-inspector-division").filter({
      has: settings.locator(".builder-inspector-division-title", { hasText: new RegExp(`^${title}$`) }),
    });
  const divisionField = (title: string, label: string) =>
    division(title).locator(".inspector-field-row").filter({
      has: division(title).locator(".inspector-field-row-label", { hasText: new RegExp(`^${label}$`) }),
    });

  await division("TITLE").getByLabel("Title style").selectOption("large");
  await divisionField("META", "Style").locator("select").selectOption("heading-small");
  await division("CONTENT").getByLabel("Content style").selectOption("text-lead");
  await division("LINK").getByRole("radio", { name: "Secondary" }).click();
  await division("LINK").getByRole("radio", { name: "Large" }).click();

  await expect(slider.locator(".uk-heading-large").first()).toBeVisible();
  await expect(slider.locator(".uk-heading-small").first()).toBeVisible();
  await expect(slider.locator(".uk-text-lead").first()).toBeVisible();
  await expect(slider.locator(".uk-button-secondary.uk-button-large").first()).toBeVisible();

  await page.getByRole("button", { name: "Publish", exact: true }).click();
  await expect(page.locator(".builder-publish-celebration").getByText("Published successfully", { exact: true })).toBeVisible();

  const frontend = await context.newPage();
  await frontend.goto(previewUrl);
  const frontendSlider = frontend.locator(".shop-builder-column-block--slider").last();
  await expect(frontendSlider.locator(".uk-heading-large").first()).toBeVisible();
  await expect(frontendSlider.locator(".uk-heading-small").first()).toBeVisible();
  await expect(frontendSlider.locator(".uk-text-lead").first()).toBeVisible();
  await expect(frontendSlider.locator(".uk-button-secondary.uk-button-large").first()).toBeVisible();
  await frontend.close();

  const saved = JSON.parse(readFileSync(layoutsPath, "utf8"));
  const sliderBlocks: Array<Record<string, unknown>> = [];
  const walk = (value: unknown) => {
    if (Array.isArray(value)) value.forEach(walk);
    else if (value && typeof value === "object") {
      const record = value as Record<string, unknown>;
      if (record.kind === "slider") sliderBlocks.push(record);
      Object.values(record).forEach(walk);
    }
  };
  walk(saved);
  expect(sliderBlocks).not.toHaveLength(0);
  expect(sliderBlocks.at(-1)).toMatchObject({
    headingSize: "large",
    metaStyle: "heading-small",
    contentStyle: "text-lead",
    buttonStyle: "secondary",
    size: "large",
  });
});
