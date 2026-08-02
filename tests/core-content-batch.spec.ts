import { expect, test } from "@playwright/test";

const email = "header-parity-20260722@example.test";
const password = "HeaderParity!2026";
const builderUrl = "/app/websites/header-parity-site/builder?page=home";

const cases = [
  ["hero", "Hero"],
  ["grid", "Grid"],
  ["icon", "Icon"],
  ["badgeGrid", "Badges"],
  ["table", "Table"],
  ["divider", "Divider"],
  ["alert", "Alert"],
  ["breadcrumbs", "Breadcrumbs"],
  ["datePicker", "Date Picker"],
] as const;

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 2400, height: 1400 });
  await page.goto("/login");
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/app(?:\?|$)/);
});

test("core content batch uses dedicated capability routing for all nine elements", async ({ page }) => {
  await page.goto(builderUrl);
  await page.locator(".builder-sidebar-nav-tile", { hasText: "Blocks" }).first().click();
  for (const [kind, label] of cases) {
    await page.locator(".builder-element-library-search input").fill(label);
    const card = page.locator(".builder-element-library-card").filter({ has: page.locator("strong", { hasText: new RegExp(`^${label}$`) }) }).first();
    await expect(card, `${kind} library card`).toBeVisible();
    await card.click();
    const selected = page.locator(".builder-preview-layout-block.is-selected-block").last();
    await expect(selected).toBeVisible();
    await selected.locator(".builder-preview-block-tools").getByRole("button", { name: "Edit element" }).dispatchEvent("click");
    const inspector = page.locator(".builder-floating-inspector");
    await expect(inspector.locator(`[data-uikit-capability="${kind}-content"]`), `${kind} content panel`).toBeVisible();
    await expect(inspector.getByRole("button", { name: "Content", exact: true })).toBeVisible();
    await expect(inspector.getByRole("button", { name: "Styling", exact: true })).toBeVisible();
    await expect(inspector.getByRole("button", { name: "Behavior", exact: true })).toBeVisible();
    await expect(inspector.getByRole("button", { name: "Advanced", exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Close inspector", exact: true }).click().catch(() => undefined);
  }
});
