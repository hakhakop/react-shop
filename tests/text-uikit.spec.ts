import { expect, test, type Page } from "@playwright/test";

const email = "header-parity-20260722@example.test";
const password = "HeaderParity!2026";
const builderUrl = "/app/websites/header-parity-site/builder?page=home";
const previewUrl = "/app/websites/header-parity-site/preview?page=home";

async function publish(page: Page) {
  await Promise.all([
    page.waitForResponse((response) => response.request().method() === "POST" && response.url().includes("/api/builder-layouts")),
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

test("Text uses semantic UIkit variants in builder and frontend", async ({ page, context }) => {
  await page.goto(builderUrl);
  await expect(page.locator(".builder-preview-shell").first()).toBeVisible();
  await page.locator(".builder-sidebar-nav-tile", { hasText: "Blocks" }).first().click();
  await page.locator(".builder-element-library-search input").fill("text");
  const card = page.locator(".builder-element-library-card").filter({ hasText: /^Text/ }).first();
  await expect(card).toBeVisible();
  await card.click();

  const selected = page.locator(".builder-preview-layout-block.is-selected-block");
  const text = selected.locator(".shop-builder-column-block--text");
  await expect(text).toBeVisible();
  const blockId = await selected.getAttribute("data-builder-block-key");
  if (!blockId) throw new Error("Text block id missing");

  await selected.locator(".builder-preview-block-tools").getByRole("button", { name: "Edit element" }).click();
  const inspector = page.locator(".builder-floating-inspector");
  await expect(inspector).toBeVisible();
  await expect(inspector.locator(".builder-inspector-tabs").getByRole("button", { name: "Layout", exact: true })).toHaveCount(0);
  await expect(inspector.locator(".builder-inspector-tabs").getByRole("button", { name: "Spacing", exact: true })).toHaveCount(0);

  await inspector.getByRole("button", { name: "Content", exact: true }).click();
  await inspector.locator(".richtext-content .ProseMirror").fill("Text parity content");

  await inspector.getByRole("button", { name: "Styling", exact: true }).click();
  const variant = inspector.locator('[data-uikit-capability="text-style"] label.builder-field', { hasText: "Variant" }).locator("select");
  const variants = ["default", "lead", "meta", "small", "large", "muted"];
  let defaultFontSize = "";
  for (const value of variants) {
    await variant.selectOption(value);
    await expect(text).toHaveAttribute("data-uikit-text-variant", value);
    const computedFontSize = await text.evaluate((node) => getComputedStyle(node).fontSize);
    if (value === "default") defaultFontSize = computedFontSize;
    if (value === "lead" || value === "large") expect(computedFontSize).not.toBe(defaultFontSize);
    if (value === "default") await expect(text).not.toHaveClass(/uk-text-lead|uk-text-meta|uk-text-small|uk-text-large|uk-text-muted/);
    else await expect(text).toHaveClass(new RegExp(`uk-text-${value}`));
  }

  await inspector.locator('[data-uikit-capability="text-style"] label.builder-field', { hasText: "Alignment" }).locator("select").selectOption("center");
  await expect(text).toHaveAttribute("data-uikit-text-align", "center");
  await expect(text).toHaveClass(/uk-text-center/);

  await inspector.getByRole("button", { name: "Typography", exact: true }).click();
  await expect(inspector.getByText("Font family", { exact: true })).toBeVisible();
  await expect(inspector.getByText("Font size", { exact: true })).toHaveCount(0);
  await inspector.locator('[data-uikit-capability="text-typography"] label.builder-field', { hasText: "Font weight" }).locator("select").selectOption("700");
  await expect(text).toHaveCSS("font-weight", "700");

  const stored = await page.evaluate((id) => {
    const walk = (value: unknown): Record<string, unknown> | null => {
      if (!value || typeof value !== "object") return null;
      if (Array.isArray(value)) { for (const item of value) { const found = walk(item); if (found) return found; } return null; }
      const record = value as Record<string, unknown>;
      if (record.kind === "text" && record.id === id) return record;
      for (const child of Object.values(record)) { const found = walk(child); if (found) return found; }
      return null;
    };
    for (const value of Object.values(localStorage)) { try { const found = walk(JSON.parse(value)); if (found) return found; } catch {} }
    return null;
  }, blockId);
  expect(stored).toMatchObject({ kind: "text", textVariant: "muted", textAlign: "center" });
  expect(JSON.stringify(stored)).not.toMatch(/uk-/);

  await publish(page);
  const frontend = await context.newPage();
  await frontend.goto(previewUrl);
  const frontendText = frontend.locator(".shop-builder-column-block--text", { hasText: "Text parity content" }).last();
  await expect(frontendText).toBeVisible();
  await expect(frontendText).toHaveAttribute("data-uikit-text-variant", "muted");
  await expect(frontendText).toHaveAttribute("data-uikit-text-align", "center");
  await expect(frontendText).toHaveClass(/uk-text-muted/);
});
