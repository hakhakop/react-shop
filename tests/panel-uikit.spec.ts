import { expect, test, type Page } from "@playwright/test";
import { waitForSeededBuilderLayout } from "./builderFixture";

const email = "header-parity-20260722@example.test";
const password = "HeaderParity!2026";
const builderUrl = "/app/websites/header-parity-site/builder?page=home";
const previewUrl = "/app/websites/header-parity-site/preview?page=home";

function luminance(color: string) {
  const values = color.match(/\d+/g)?.slice(0, 3).map(Number) ?? [0, 0, 0];
  return values
    .map((value) => value / 255)
    .map((value) => (value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4))
    .reduce((sum, value, index) => sum + value * [0.2126, 0.7152, 0.0722][index], 0);
}

function contrast(background: string, foreground: string) {
  const a = luminance(background);
  const b = luminance(foreground);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

async function publish(page: Page) {
  await Promise.all([
    page.waitForResponse((response) => response.request().method() === "POST" && response.url().includes("/api/builder-layouts")),
    page.getByRole("button", { name: "Publish", exact: true }).click(),
  ]);
  await expect(page.locator(".builder-publish-celebration").getByText("Published successfully", { exact: true })).toBeVisible();
}

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 2400, height: 1200 });
  await page.goto("/login");
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/app(?:\?|$)/);
});

test("Panel uses semantic UIkit card variants in builder and frontend", async ({ page, context }) => {
  await page.goto(builderUrl);
  await waitForSeededBuilderLayout(page);
  await page.locator(".builder-sidebar-nav-tile", { hasText: "Blocks" }).first().click();
  await page.locator(".builder-element-library-search input").fill("panel");
  const panelCard = page.locator(".builder-element-library-card").filter({ has: page.locator("strong", { hasText: "Panel" }).filter({ hasText: /^Panel$/ }) }).first();
  await expect(panelCard).toBeVisible();
  await panelCard.click();

  const selectedBlock = page.locator(".builder-preview-layout-block.is-selected-block");
  const panel = selectedBlock.locator(".shop-builder-column-block--panel");
  await expect(panel).toBeVisible();
  await expect(panel).toHaveClass(/uk-card/);
  await expect(panel.locator(".uk-card-body")).toBeVisible();
  const blockId = await panel.getAttribute("data-builder-block-id");
  if (!blockId) throw new Error("Panel block id missing");

  // The shared fixture can place the newly inserted block beyond the narrow preview viewport; invoke the real toolbar handler without changing product assertions.
  await selectedBlock.locator(".builder-preview-block-tools").getByRole("button", { name: "Edit element" }).dispatchEvent("click");
  const inspector = page.locator(".builder-floating-inspector");
  await expect(inspector).toBeVisible();
  const variant = inspector.getByRole("radiogroup", { name: "Panel variant" });
  const hover = inspector.getByRole("switch", { name: "Hover card" });
  await expect(variant.locator("button").filter({ hasText: "Default" })).toHaveClass(/is-selected/);
  await expect(inspector.getByText("Card Presets", { exact: true })).toHaveCount(0);
  await expect(inspector.getByText("Premium", { exact: true })).toHaveCount(0);
  await expect(inspector.getByText("Outline", { exact: true })).toHaveCount(0);

  await variant.locator("button").filter({ hasText: "Primary" }).click();
  await expect(panel).toHaveClass(/uk-card-primary/);
  const primaryColors = await panel.evaluate((element) => { const style = getComputedStyle(element); return { background: style.backgroundColor, color: style.color }; });
  await variant.locator("button").filter({ hasText: "Secondary" }).click();
  await expect(panel).toHaveClass(/uk-card-secondary/);
  await page.mouse.move(0, 0);
  await expect.poll(async () => panel.evaluate((element) => {
    const style = getComputedStyle(element);
    const probe = document.createElement("span");
    probe.style.color = style.getPropertyValue("--uk-card-secondary-background").trim();
    document.body.appendChild(probe);
    const expected = getComputedStyle(probe).color;
    probe.remove();
    return style.backgroundColor === expected;
  })).toBe(true);
  const secondaryColors = await panel.evaluate((element) => { const style = getComputedStyle(element); return { background: style.backgroundColor, color: style.color }; });
  expect(contrast(secondaryColors.background, secondaryColors.color)).toBeGreaterThan(3);
  await hover.locator("..").click();
  await expect(panel).toHaveClass(/uk-card-hover/);

  const stored = await page.evaluate((id) => {
    const matches: Record<string, unknown>[] = [];
    const walk = (value: unknown) => {
      if (!value || typeof value !== "object") return;
      if (Array.isArray(value)) return value.forEach(walk);
      const record = value as Record<string, unknown>;
      if (record.kind === "panel" && record.id === id) matches.push(record);
      Object.values(record).forEach(walk);
    };
    Object.values(localStorage).forEach((value) => { try { walk(JSON.parse(value)); } catch {} });
    return matches[0] ?? null;
  }, blockId);
  expect(stored).toMatchObject({ kind: "panel", panelVariant: "secondary", panelHover: true });
  expect(stored).not.toHaveProperty("panelStyle");
  expect(stored).not.toHaveProperty("cardPreset");

  await publish(page);
  const frontend = await context.newPage();
  await frontend.goto(previewUrl);
  const frontendPanel = frontend.locator(`.shop-builder-column-block--panel[data-builder-block-id="${blockId}"]`);
  await expect(frontendPanel).toBeVisible();
  await expect(frontendPanel).toHaveClass(/uk-card-secondary/);
  await expect(frontendPanel).toHaveClass(/uk-card-hover/);
  const frontendColors = await frontendPanel.evaluate((element) => { const style = getComputedStyle(element); return { background: style.backgroundColor, color: style.color }; });
  expect(frontendColors.background).toBe(secondaryColors.background);
  expect(contrast(frontendColors.background, frontendColors.color)).toBeGreaterThan(3);
});
