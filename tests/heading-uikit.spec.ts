import { expect, test, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const email = "header-parity-20260722@example.test";
const password = "HeaderParity!2026";
const builderUrl = "/app/websites/header-parity-site/builder?page=home";
const previewUrl = "/app/websites/header-parity-site/preview?page=home";
const layoutsPath = resolve(
  process.cwd(),
  "data/websites/eb65bd05-1299-4071-b432-f3c04e9eda2e/builder-layouts.json",
);

async function publish(page: Page) {
  await Promise.all([
    page.waitForResponse(
      (response) =>
        response.request().method() === "POST" &&
        response.url().includes("/api/builder-layouts"),
    ),
    page.getByRole("button", { name: "Publish", exact: true }).click(),
  ]);
  await expect(page.locator(".builder-publish-celebration").getByText("Published successfully", { exact: true })).toBeVisible();
}

test.beforeEach(async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/app(?:\?|$)/);
});

test("Heading UIkit visual presets (small, medium, xlarge) visibly change computed font-size on canvas and frontend", async ({ page, context }) => {
  await page.goto(builderUrl);
  await expect(page.locator(".builder-preview-shell").first()).toBeVisible();

  await page.locator(".builder-sidebar-nav-tile", { hasText: "Blocks" }).first().click();
  await page.locator(".builder-element-library-search input").fill("heading");
  const headingCard = page.locator(".builder-element-library-card", { hasText: "Heading" });
  await expect(headingCard).toBeVisible();
  await headingCard.click();

  const canvasHeadingContainer = page.locator(
    ".builder-preview-layout-block.is-selected-block .shop-builder-column-block--heading",
  );
  await expect(canvasHeadingContainer).toBeVisible();
  const canvasHeading = canvasHeadingContainer.locator("h2, h3").first();

 await page
   .locator(".builder-preview-layout-block.is-selected-block .builder-preview-block-tools")
   .getByRole("button", { name: "Edit element" })
    .dispatchEvent("click");
  const inspector = page.locator(".builder-floating-inspector");
  await expect(inspector).toBeVisible();
  // Set unique text to target this exact block
  const uniqueText = "UIkit Preset Font Size Test 2026";
  const headingTextInput = inspector.locator("label.builder-field", { hasText: "Heading Text" }).locator("input, textarea");
  if (await headingTextInput.isVisible()) {
    await headingTextInput.fill(uniqueText);
  }
  const levelSelect = inspector.getByRole("combobox", { name: "Heading semantic level" });
  await levelSelect.selectOption("h3");
  await expect(canvasHeadingContainer.locator("h3")).toBeVisible();

  await inspector.getByRole("button", { name: "Styling", exact: true }).click();

  const presetSelect = inspector.getByRole("combobox", { name: "Heading visual preset" });

  // 1. Test "small" preset
  await presetSelect.selectOption("small");
  await expect(canvasHeading).toHaveClass(/uk-heading-small/);
  const sizeSmallCanvas = await canvasHeading.evaluate((el) => getComputedStyle(el).fontSize);

  // 2. Test "medium" preset
  await presetSelect.selectOption("medium");
  await expect(canvasHeading).toHaveClass(/uk-heading-medium/);
  const sizeMediumCanvas = await canvasHeading.evaluate((el) => getComputedStyle(el).fontSize);

  // 3. Test "xlarge" preset
  await presetSelect.selectOption("xlarge");
  await expect(canvasHeading).toHaveClass(/uk-heading-xlarge/);
  const sizeXlargeCanvas = await canvasHeading.evaluate((el) => getComputedStyle(el).fontSize);

  // Assert font-size ordering: small < medium < xlarge
  const valSmall = parseFloat(sizeSmallCanvas);
  const valMedium = parseFloat(sizeMediumCanvas);
  const valXlarge = parseFloat(sizeXlargeCanvas);

  expect(valSmall).toBeLessThan(valMedium);
  expect(valMedium).toBeLessThan(valXlarge);

  await inspector.getByRole("button", { name: "Typography", exact: true }).click();
  const weightSelect = inspector.locator(".builder-field", { hasText: "Font weight" }).locator("select");
  await weightSelect.selectOption("800");
  await expect(canvasHeading).toHaveCSS("font-weight", "800");
  await expect(inspector.getByText("Font Size", { exact: true })).toHaveCount(0);
  await expect(inspector.getByText("Clamp", { exact: true })).toHaveCount(0);
  await inspector.getByRole("button", { name: "Styling", exact: true }).click();
  await inspector.locator(".builder-field", { hasText: "Gradient preset" }).locator("select").selectOption("indigo-purple");
  await expect(canvasHeading).toHaveClass(/text-gradient--indigo-purple/);
  const gradientBackground = await canvasHeading.evaluate((el) => getComputedStyle(el).backgroundImage);
  expect(gradientBackground).not.toBe("none");

  // 4. Publish and verify on frontend
  await publish(page);

  const frontend = await context.newPage();
  await frontend.goto(previewUrl);
  const frontendHeading = frontend.locator(".shop-builder-column-block--heading h3, .shop-builder-column-block--heading h2", {
    hasText: uniqueText,
  }).last();
  await expect(frontendHeading).toBeVisible();
  await expect(frontendHeading).toHaveClass(/uk-heading-xlarge/);
  await expect(frontendHeading).toHaveClass(/text-gradient--indigo-purple/);
  await expect(frontendHeading).toHaveCSS("font-weight", "800");

  const sizeXlargeFrontend = await frontendHeading.evaluate((el) => getComputedStyle(el).fontSize);
  expect(parseFloat(sizeXlargeFrontend)).toBeCloseTo(valXlarge, 0);

  // Verify persisted JSON shape
  const saved = JSON.parse(readFileSync(layoutsPath, "utf8"));
  const headingBlocks: Array<Record<string, unknown>> = [];
  const walk = (value: unknown) => {
    if (Array.isArray(value)) {
      value.forEach(walk);
    } else if (value && typeof value === "object") {
      const record = value as Record<string, unknown>;
      if (record.kind === "heading") headingBlocks.push(record);
      Object.values(record).forEach(walk);
    }
  };
  walk(saved);
  const headingBlock = headingBlocks.reverse().find(
    (block) => block.headingText === uniqueText,
  );
  expect(headingBlock).toBeTruthy();
  if (!headingBlock) throw new Error("published heading block not found");
  expect(headingBlock.headingSize).toBe("xlarge");
  expect(headingBlock.headingLevel).toBe("h3");
});
