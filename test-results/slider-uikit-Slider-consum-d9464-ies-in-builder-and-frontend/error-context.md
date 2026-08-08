# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: slider-uikit.spec.ts >> Slider consumes shared title, meta, content, and link capabilities in builder and frontend
- Location: tests/slider-uikit.spec.ts:24:5

# Error details

```
Test timeout of 60000ms exceeded.
```

```
Error: locator.click: Test timeout of 60000ms exceeded.
Call log:
  - waiting for locator('.builder-element-library-card').filter({ hasText: 'Slider' }).first()

```

# Test source

```ts
  1  | import { expect, test } from "@playwright/test";
  2  | import { readFileSync, writeFileSync } from "node:fs";
  3  | import { resolve } from "node:path";
  4  | import { waitForSeededBuilderLayout } from "./builderFixture";
  5  | 
  6  | const email = "header-parity-20260722@example.test";
  7  | const password = "HeaderParity!2026";
  8  | const builderUrl = "/app/websites/header-parity-site/builder?page=home";
  9  | const previewUrl = "/app/websites/header-parity-site/preview?page=home";
  10 | const layoutsPath = resolve(process.cwd(), "data/websites/eb65bd05-1299-4071-b432-f3c04e9eda2e/builder-layouts.json");
  11 | const originalLayouts = readFileSync(layoutsPath, "utf8");
  12 | 
  13 | test.afterAll(() => writeFileSync(layoutsPath, originalLayouts));
  14 | 
  15 | test.beforeEach(async ({ page }) => {
  16 |   await page.setViewportSize({ width: 2400, height: 1400 });
  17 |   await page.goto("/login");
  18 |   await page.getByLabel("Email", { exact: true }).fill(email);
  19 |   await page.getByLabel("Password", { exact: true }).fill(password);
  20 |   await page.getByRole("button", { name: "Sign in", exact: true }).click();
  21 |   await expect(page).toHaveURL(/\/app(?:\?|$)/);
  22 | });
  23 | 
  24 | test("Slider consumes shared title, meta, content, and link capabilities in builder and frontend", async ({ page, context }) => {
  25 |   await page.goto(builderUrl);
  26 |   await waitForSeededBuilderLayout(page);
  27 |   await page.locator(".builder-sidebar-nav-tile", { hasText: "Blocks" }).first().click();
  28 |   await page.locator(".builder-element-library-search input").fill("slider");
> 29 |   await page.locator(".builder-element-library-card", { hasText: "Slider" }).first().click();
     |                                                                                      ^ Error: locator.click: Test timeout of 60000ms exceeded.
  30 | 
  31 |   const selected = page.locator(".builder-preview-layout-block.is-selected-block").last();
  32 |   const slider = selected.locator(".shop-builder-column-block--slider");
  33 |   await expect(slider).toBeVisible();
  34 |   await selected.locator(".builder-preview-block-tools").getByRole("button", { name: "Edit element" }).dispatchEvent("click");
  35 | 
  36 |   const inspector = page.locator(".builder-floating-inspector");
  37 |   await inspector.getByRole("button", { name: "Settings", exact: true }).click();
  38 |   const settings = inspector.locator('[data-uikit-capability="slider-settings"]');
  39 |   const division = (title: string) =>
  40 |     settings.locator(".builder-inspector-division").filter({
  41 |       has: settings.locator(".builder-inspector-division-title", { hasText: new RegExp(`^${title}$`) }),
  42 |     });
  43 |   const divisionField = (title: string, label: string) =>
  44 |     division(title).locator(".inspector-field-row").filter({
  45 |       has: division(title).locator(".inspector-field-row-label", { hasText: new RegExp(`^${label}$`) }),
  46 |     });
  47 | 
  48 |   await division("TITLE").getByLabel("Title style").selectOption("large");
  49 |   await divisionField("META", "Style").locator("select").selectOption("heading-small");
  50 |   await division("CONTENT").getByLabel("Content style").selectOption("text-lead");
  51 |   await division("LINK").getByRole("radio", { name: "Secondary" }).click();
  52 |   await division("LINK").getByRole("radio", { name: "Large" }).click();
  53 | 
  54 |   await expect(slider.locator(".uk-heading-large").first()).toBeVisible();
  55 |   await expect(slider.locator(".uk-heading-small").first()).toBeVisible();
  56 |   await expect(slider.locator(".uk-text-lead").first()).toBeVisible();
  57 |   await expect(slider.locator(".uk-button-secondary.uk-button-large").first()).toBeVisible();
  58 | 
  59 |   await page.getByRole("button", { name: "Publish", exact: true }).click();
  60 |   await expect(page.locator(".builder-publish-celebration").getByText("Published successfully", { exact: true })).toBeVisible();
  61 | 
  62 |   const frontend = await context.newPage();
  63 |   await frontend.goto(previewUrl);
  64 |   const frontendSlider = frontend.locator(".shop-builder-column-block--slider").last();
  65 |   await expect(frontendSlider.locator(".uk-heading-large").first()).toBeVisible();
  66 |   await expect(frontendSlider.locator(".uk-heading-small").first()).toBeVisible();
  67 |   await expect(frontendSlider.locator(".uk-text-lead").first()).toBeVisible();
  68 |   await expect(frontendSlider.locator(".uk-button-secondary.uk-button-large").first()).toBeVisible();
  69 |   await frontend.close();
  70 | 
  71 |   const saved = JSON.parse(readFileSync(layoutsPath, "utf8"));
  72 |   const sliderBlocks: Array<Record<string, unknown>> = [];
  73 |   const walk = (value: unknown) => {
  74 |     if (Array.isArray(value)) value.forEach(walk);
  75 |     else if (value && typeof value === "object") {
  76 |       const record = value as Record<string, unknown>;
  77 |       if (record.kind === "slider") sliderBlocks.push(record);
  78 |       Object.values(record).forEach(walk);
  79 |     }
  80 |   };
  81 |   walk(saved);
  82 |   expect(sliderBlocks).not.toHaveLength(0);
  83 |   expect(sliderBlocks.at(-1)).toMatchObject({
  84 |     headingSize: "large",
  85 |     metaStyle: "heading-small",
  86 |     contentStyle: "text-lead",
  87 |     buttonStyle: "secondary",
  88 |     size: "large",
  89 |   });
  90 | });
  91 | 
```