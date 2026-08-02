import { expect, test, type Page } from "@playwright/test";

const email = "header-parity-20260722@example.test";
const password = "HeaderParity!2026";
const builderUrl = "/app/websites/header-parity-site/builder?page=home";
const previewUrl = "/app/websites/header-parity-site/preview?page=home";

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

test("Divider renders in builder canvas and frontend via canonical UIkit classes", async ({ page, context }) => {
  await page.goto(builderUrl);
  await expect(page.locator(".builder-preview-shell").first()).toBeVisible();

  await page.locator(".builder-sidebar-nav-tile", { hasText: "Blocks" }).first().click();
  await page.locator(".builder-element-library-search input").fill("divider");
  const dividerCard = page.locator(".builder-element-library-card", { hasText: "Divider" });
  await expect(dividerCard).toBeVisible();
  await dividerCard.click();

  const canvasDivider = page.locator(
    ".builder-preview-layout-block.is-selected-block .shop-builder-column-block--divider",
  );
  await expect(canvasDivider).toBeVisible();
  await expect(canvasDivider.locator("hr")).toHaveClass(/uk-hr/);

  await page
    .locator(".builder-preview-layout-block.is-selected-block .builder-preview-block-tools")
    .getByRole("button", { name: "Edit element" })
    .click();
  const inspector = page.locator(".builder-floating-inspector");
  await expect(inspector).toBeVisible();
  const styleSelect = inspector
    .locator("select")
    .filter({ has: page.locator('option[value="icon"]') });
  await styleSelect.selectOption("icon");
  await expect(canvasDivider.locator("hr")).toHaveClass(/uk-divider-icon/);

  await publish(page);

  const frontend = await context.newPage();
  await frontend.goto(previewUrl);
  const frontendDivider = frontend.locator(".shop-builder-column-block--divider").first();
  await expect(frontendDivider).toBeVisible();
  await expect(frontendDivider.locator("hr")).toHaveClass(/uk-divider-icon/);
});
