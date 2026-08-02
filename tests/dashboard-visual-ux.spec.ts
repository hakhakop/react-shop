import { expect, test } from "@playwright/test";

const builderUrl = "/app/websites/header-parity-site/builder?page=home";
const email = "header-parity-20260722@example.test";
const password = "HeaderParity!2026";

test.beforeEach(async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/app(?:\?|$)/);
});

test("element library uses canonical icons, categories, search, and responsive grid", async ({ page }) => {
  await page.goto(builderUrl);
  await expect(page.locator(".builder-preview-shell").first()).toBeVisible();
  await page.locator(".builder-sidebar-nav-tile", { hasText: "Blocks" }).first().click();

  const library = page.locator(".builder-element-library");
  await expect(library).toBeVisible();
  const groupTitles = await library.locator(".builder-element-library-group-title").allTextContents();
  for (const label of ["Basic", "Multiple Items", "Commerce", "Forms", "System", "Advanced"]) expect(groupTitles.join(" ")).toContain(label);
  await expect(library.locator(".builder-element-library-group-title small")).toHaveCount(7);
  expect(await library.locator(".builder-element-library-card-icon svg").evaluateAll((icons) => new Set(icons.map((icon) => icon.innerHTML)).size)).toBeGreaterThan(6);
  await library.locator(".builder-element-library-group").filter({ hasText: /^Basic/ }).locator("summary").click();
  const firstTile = library.locator(".builder-element-library-card:visible").first();
  const favoriteBounds = await firstTile.evaluate((card) => {
    const badge = card.querySelector(".builder-element-favorite");
    if (!badge) return null;
    const cardRect = card.getBoundingClientRect();
    const badgeRect = badge.getBoundingClientRect();
    return { inside: badgeRect.left >= cardRect.left && badgeRect.top >= cardRect.top && badgeRect.right <= cardRect.right && badgeRect.bottom <= cardRect.bottom };
  });
  expect(favoriteBounds?.inside).toBe(true);

  await page.locator(".builder-element-library-search input").fill("button");
  expect(await library.locator(".builder-element-library-card-info strong").count()).toBeGreaterThan(0);
  await expect(library.locator(".builder-element-library-card-info strong").first()).toHaveText("Button");
  await page.screenshot({ path: "test-results/dashboard-element-library.png", fullPage: true });

  await page.setViewportSize({ width: 420, height: 900 });
  await page.locator(".builder-element-library-search input").fill("");
  const basicGroup = library.locator(".builder-element-library-group").filter({ hasText: /^Basic/ });
  if ((await basicGroup.getAttribute("open")) === null) await basicGroup.locator("summary").click();
  await expect(library.locator(".builder-element-library-group-content").first()).toBeVisible();
  await expect(library.locator(".builder-element-library-card:visible").first()).toBeVisible();
  await page.screenshot({ path: "test-results/dashboard-element-library-narrow.png", fullPage: true });
});

test("Global Styles root and detail screens are searchable and scannable", async ({ page }) => {
  await page.goto(builderUrl);
  await expect(page.locator(".builder-preview-shell").first()).toBeVisible();
  await page.getByRole("button", { name: "Website", exact: true }).click();
  await page.getByRole("button", { name: "Global Style Editor", exact: true }).click();

  const root = page.getByTestId("global-design-root");
  await expect(root).toBeVisible();
  await expect(root.getByRole("heading", { name: /^General/ })).toBeVisible();
  await expect(root.getByRole("heading", { name: /^Components/ })).toBeVisible();
  await expect(root.getByLabel("Search styles and components")).toBeVisible();
  await expect(root.getByText("Not yet supported").first()).toBeVisible();
  await root.locator(".builder-design-nav-item").filter({ hasText: /^Button/ }).click();

  const editor = page.getByTestId("global-editor-button");
  await expect(editor).toBeVisible();
  await expect(editor.locator(".builder-design-back")).toBeVisible();
  await expect(editor.getByRole("button", { name: "Save" })).toBeVisible();
  await expect(editor.getByRole("button", { name: "Cancel" })).toBeVisible();
  await expect(editor.locator(".builder-design-editor-header")).toHaveCSS("position", "sticky");
  await expect(editor.locator(".builder-design-in-page-index")).toBeVisible();
  await expect(editor.getByRole("heading", { name: "Small size", exact: true })).toBeVisible();
  await page.screenshot({ path: "test-results/dashboard-global-button-editor.png", fullPage: true });

  await page.getByRole("button", { name: /Switch to (dark|light) mode/ }).click();
  await expect(editor).toBeVisible();
  await page.screenshot({ path: "test-results/dashboard-global-button-editor-dark.png", fullPage: true });
});

test("Button inspector keeps the shared Content, Style, and Advanced rhythm", async ({ page }) => {
  await page.goto(builderUrl);
  await expect(page.locator(".builder-preview-shell").first()).toBeVisible();
  await page.locator(".builder-sidebar-nav-tile", { hasText: "Blocks" }).first().click();
  await page.locator(".builder-element-library-search input").fill("button");
  await page.locator(".builder-element-library-card").filter({ has: page.getByText("Button", { exact: true }) }).first().click();

  const selectedBlock = page.locator(".builder-preview-layout-block.is-selected-block");
  await expect(selectedBlock).toBeVisible();
  await selectedBlock.locator(".builder-preview-block-tools").getByRole("button", { name: "Edit element" }).click();
  const inspector = page.locator(".builder-floating-inspector");
  await expect(inspector).toBeVisible();
  const tabs = inspector.locator(".builder-inspector-tabs button");
  await expect(tabs).toHaveText(["Content", "Styling", "Advanced"]);
  await expect(inspector.locator(".builder-field").first()).toHaveCSS("font-size", "11px");
  await page.screenshot({ path: "test-results/dashboard-button-inspector.png", fullPage: true });
});
