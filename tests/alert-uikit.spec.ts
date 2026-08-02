import { expect, test, type Page } from "@playwright/test";

const email = "header-parity-20260722@example.test";
const password = "HeaderParity!2026";
const builderUrl = "/app/websites/header-parity-site/builder?page=home";
const previewUrl = "/app/websites/header-parity-site/preview?page=home";

function luminance(cssColor: string) {
  const match = cssColor.match(/(\d+)[,\s]+(\d+)[,\s]+(\d+)/);
  if (!match) return 0;
  const rgb = [match[1], match[2], match[3]]
    .map(Number)
    .map((channel) => channel / 255)
    .map((channel) =>
      channel <= 0.03928 ? channel / 12.92 : Math.pow((channel + 0.055) / 1.055, 2.4),
    );
  return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
}

function contrastRatio(a: string, b: string) {
  const l1 = luminance(a);
  const l2 = luminance(b);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

async function computedColors(page: Page, locator: string) {
  return page.locator(locator).first().evaluate((el) => {
    const style = getComputedStyle(el);
    return {
      background: style.backgroundColor,
      color: style.color,
    };
  });
}

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

test("Alert renders in builder canvas and frontend via canonical UIkit classes", async ({ page, context }) => {
  await page.goto(builderUrl);
  await expect(page.locator(".builder-preview-shell").first()).toBeVisible();

  await page.locator(".builder-sidebar-nav-tile", { hasText: "Blocks" }).first().click();
  await page.locator(".builder-element-library-search input").fill("alert");
  const alertCard = page.locator(".builder-element-library-card", { hasText: "Alert" });
  await expect(alertCard).toBeVisible();
  await alertCard.click();

  const canvasAlert = page.locator(
    ".builder-preview-layout-block.is-selected-block .shop-builder-column-block--alert",
  );
  await expect(canvasAlert).toBeVisible();
  await expect(canvasAlert.locator(".uk-alert")).toHaveClass(/uk-alert uk-alert-primary/);

  const darkColors = await computedColors(page, ".builder-preview-layout-block.is-selected-block .uk-alert");
  expect(darkColors.background).not.toBe(darkColors.color);
  expect(contrastRatio(darkColors.background, darkColors.color)).toBeGreaterThan(3);

  await page
    .locator(".builder-preview-layout-block.is-selected-block .builder-preview-block-tools")
    .getByRole("button", { name: "Edit element" })
    .click();
  const inspector = page.locator(".builder-floating-inspector");
  await expect(inspector).toBeVisible();
  const variantSelect = inspector
    .locator("select")
    .filter({ has: page.locator('option[value="danger"]') });
  await variantSelect.selectOption("danger");
  await expect(canvasAlert.locator(".uk-alert")).toHaveClass(/uk-alert-danger/);

  await publish(page);

  const frontend = await context.newPage();
  await frontend.goto(previewUrl);
  const frontendAlert = frontend.locator(".shop-builder-column-block--alert").first();
  await expect(frontendAlert).toBeVisible();
  await expect(frontendAlert.locator(".uk-alert")).toHaveClass(/uk-alert-danger/);

  const lightColors = await computedColors(frontend, ".shop-builder-column-block--alert .uk-alert");
  expect(lightColors.background).not.toBe(lightColors.color);
  expect(contrastRatio(lightColors.background, lightColors.color)).toBeGreaterThan(3);
  expect(lightColors.background).not.toBe(darkColors.background);
});
