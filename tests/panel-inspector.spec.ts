import { expect, test } from "@playwright/test";

const email = "header-parity-20260722@example.test";
const password = "HeaderParity!2026";
const builderUrl = "/app/websites/header-parity-site/builder?page=home";
const previewUrl = "/app/websites/header-parity-site/preview?page=home";

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 2400, height: 1200 });
  await page.goto("/login");
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/app(?:\?|$)/);
});

test("Panel inspector exposes semantic instance controls and keeps builder/frontend parity", async ({ page, context }) => {
  await page.goto(builderUrl);
  await page.locator(".builder-sidebar-nav-tile", { hasText: "Blocks" }).first().click();
  await page.locator(".builder-element-library-search input").fill("panel");
  const panelCard = page.locator(".builder-element-library-card").filter({ has: page.locator("strong", { hasText: /^Panel$/ }) }).first();
  await expect(panelCard).toBeVisible();
  await panelCard.click();

  const selectedBlock = page.locator(".builder-preview-layout-block.is-selected-block");
  await expect(selectedBlock.locator(".shop-builder-column-block--panel")).toBeVisible();
  const blockId = await selectedBlock.getAttribute("data-builder-block-key");
  if (!blockId) throw new Error("Panel block id missing");
  await selectedBlock.locator(".builder-preview-block-tools").getByRole("button", { name: "Edit element" }).dispatchEvent("click");

  const inspector = page.locator(".builder-floating-inspector");
  await inspector.getByRole("button", { name: "Content", exact: true }).click();
  await expect(inspector.locator('[data-uikit-capability="panel-content"]')).toBeVisible();
  await expect(inspector.getByText("Styling", { exact: true })).toBeVisible();
  await expect(inspector.getByText("Card Presets", { exact: true })).toHaveCount(0);
  await expect(inspector.getByText("Clear legacy Panel fields", { exact: true })).toHaveCount(0);

  await inspector.getByRole("button", { name: "Layout", exact: true }).click();
  const layout = inspector.locator('[data-uikit-capability="panel-layout"]');
  await expect(layout.locator('[data-uikit-capability="panel-media"]')).toBeVisible();
  await layout.locator("label.builder-field", { hasText: "Placement" }).locator("select").selectOption("left");
  await layout.locator("label.builder-field", { hasText: "Aspect ratio" }).locator("select").selectOption("square");
  await layout.locator("label.builder-field", { hasText: "Fit" }).locator("select").selectOption("contain");
  await layout.locator("label.builder-field", { hasText: "Side media width" }).locator("select").selectOption("large");
  await layout.locator("label.builder-field", { hasText: "Text alignment" }).locator("select").selectOption("center");
  await layout.locator("label.builder-field", { hasText: "Title element" }).locator("select").selectOption("h2");
  await layout.locator("label.builder-field", { hasText: "Content width" }).locator("select").selectOption("medium");

  const panel = selectedBlock.locator(".shop-builder-column-block--panel");
  await expect(panel).toHaveClass(/shop-builder-panel--media-left/);
  await expect(panel).toHaveClass(/shop-builder-panel--media-width-large/);
  await expect(panel.locator(".uk-card-media-left")).toBeVisible();
  await expect(panel.locator("h2")).toBeVisible();

  await inspector.getByRole("button", { name: "Styling", exact: true }).click();
  await inspector.locator("label.builder-field", { hasText: "Variant" }).locator("select").selectOption("secondary");
  await inspector.locator("label.builder-field", { hasText: "Size" }).locator("select").selectOption("large");
  const hover = inspector.getByText("Hover card", { exact: true }).locator("..").locator("input");
  await hover.check();

  const stored = await page.evaluate((id) => {
    const found: Record<string, unknown>[] = [];
    const walk = (value: unknown) => {
      if (!value || typeof value !== "object") return;
      if (Array.isArray(value)) return value.forEach(walk);
      const record = value as Record<string, unknown>;
      if (record.kind === "panel" && record.id === id) found.push(record);
      Object.values(record).forEach(walk);
    };
    Object.values(localStorage).forEach((value) => { try { walk(JSON.parse(value)); } catch {} });
    return found[0] ?? null;
  }, blockId);
  expect(stored).toMatchObject({ panelMediaPlacement: "left", imageRatio: "square", panelMediaFit: "contain", panelMediaWidth: "large", panelTextAlign: "center", panelTitleElement: "h2", panelVariant: "secondary", panelSize: "large", panelHover: true });
  expect(JSON.stringify(stored)).not.toMatch(/uk-/);

  await Promise.all([
    page.waitForResponse((response) => response.request().method() === "POST" && response.url().includes("/api/builder-layouts")),
    page.getByRole("button", { name: "Publish", exact: true }).click(),
  ]);
  await expect(page.locator(".builder-publish-celebration").getByText("Published successfully", { exact: true })).toBeVisible();
  const frontend = await context.newPage();
  await frontend.goto(previewUrl);
  const frontendPanel = frontend.locator(".shop-builder-column-block--panel").filter({ has: frontend.locator("h2") }).first();
  await expect(frontendPanel).toHaveClass(/shop-builder-panel--media-left/);
  await expect(frontendPanel).toHaveClass(/shop-builder-panel--media-width-large/);
  await expect(frontendPanel).toHaveClass(/uk-card-secondary/);
  await expect(frontendPanel).toHaveClass(/uk-card-hover/);
  await expect(frontendPanel.locator(".uk-card-media-left")).toBeVisible();
  await expect(frontendPanel.locator("h2")).toBeVisible();
});
