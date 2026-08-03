import { expect, test } from "@playwright/test";
import { waitForSeededBuilderLayout } from "./builderFixture";

const email = "header-parity-20260722@example.test";
const password = "HeaderParity!2026";
const builderUrl = "/app/websites/header-parity-site/builder?page=home";
const previewUrl = "/app/websites/header-parity-site/preview?page=home";
const image = "https://example.com/panel-card.jpg";

async function login(page: import("@playwright/test").Page) {
  await page.goto("/login");
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/app(?:\?|$)/);
}

async function geometry(panel: import("@playwright/test").Locator) {
  return panel.evaluate((element) => {
    const media = element.querySelector<HTMLElement>(".shop-builder-panel-media");
    const body = element.querySelector<HTMLElement>(".uk-card-body");
    if (!media || !body) throw new Error("Panel media or body missing");
    const outer = element.getBoundingClientRect();
    const mediaRect = media.getBoundingClientRect();
    const bodyRect = body.getBoundingClientRect();
    const style = getComputedStyle(element);
    const contentWidth = outer.width - parseFloat(style.borderLeftWidth) - parseFloat(style.borderRightWidth);
    return { outerWidth: contentWidth, mediaWidth: mediaRect.width, bodyWidth: bodyRect.width, mediaRadius: getComputedStyle(media).borderTopLeftRadius, overflow: style.overflow };
  });
}

test("Panel media stays inside the UIkit Card boundary in builder and frontend", async ({ page, context }) => {
  await login(page);
  await page.goto(builderUrl);
  await waitForSeededBuilderLayout(page);
  await page.locator(".builder-sidebar-nav-tile", { hasText: "Blocks" }).first().click();
  await page.locator(".builder-element-library-search input").fill("panel");
  const panelCard = page.locator(".builder-element-library-card").filter({ hasText: "Panel" }).first();
  await expect(panelCard).toBeVisible();
  await panelCard.click();

  const selected = page.locator(".builder-preview-layout-block.is-selected-block");
  const panel = selected.locator(".shop-builder-column-block--panel");
  await expect(panel).toBeVisible();
  await selected.locator(".builder-preview-block-tools").getByRole("button", { name: "Edit element" }).dispatchEvent("click");
  const inspector = page.locator(".builder-floating-inspector");
  await expect(inspector).toBeVisible();
  const content = inspector.getByRole("button", { name: "Content", exact: true });
  if (await content.count()) await content.click();

  const placeholderGeometry = await geometry(panel);
  expect(Math.abs(placeholderGeometry.outerWidth - placeholderGeometry.mediaWidth)).toBeLessThanOrEqual(1);
  expect(placeholderGeometry.overflow).toBe("hidden");
  expect(placeholderGeometry.mediaRadius).not.toBe("0px");
  const style = inspector.getByRole("button", { name: "Style", exact: true });
  const styling = inspector.getByRole("button", { name: "Styling", exact: true });
  if (await styling.count()) await styling.click();
  await inspector.getByRole("radiogroup", { name: "Panel size" }).locator("button").filter({ hasText: "Large" }).click();
  const largeGeometry = await geometry(panel);
  expect(Math.abs(largeGeometry.outerWidth - largeGeometry.mediaWidth)).toBeLessThanOrEqual(1);

  const seeded = await page.evaluate(async (source) => {
    const response = await fetch("/api/builder-layouts?key=home&websiteId=header-parity-site");
    const layout = await response.json();
    let changed = false;
    const walk = (value: unknown): void => {
      if (!value || typeof value !== "object" || changed) return;
      if (Array.isArray(value)) { value.forEach(walk); return; }
      const record = value as Record<string, unknown>;
      if (record.kind === "panel" && !changed) { record.imageUrl = source; changed = true; return; }
      Object.values(record).forEach(walk);
    };
    walk(layout.layout.sections);
    if (!changed) return null;
    await fetch("/api/builder-layouts?websiteId=header-parity-site", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ key: "home", design: layout.layout.design, sections: layout.layout.sections }) });
    let id = "";
    const find = (value: unknown): void => { if (!value || typeof value !== "object" || id) return; if (Array.isArray(value)) { value.forEach(find); return; } const record = value as Record<string, unknown>; if (record.kind === "panel") { id = String(record.id ?? ""); return; } Object.values(record).forEach(find); };
    find(layout.layout.sections);
    return id;
  }, image);
  expect(seeded).toBeTruthy();
  await page.evaluate(() => Object.keys(localStorage).filter((key) => ["react-shop-visual-builder-drafts-v2", "react-shop-visual-builder-v1", "react-shop-visual-builder-pages-v1"].some((prefix) => key.startsWith(prefix))).forEach((key) => localStorage.removeItem(key)));
  await page.reload();
  await waitForSeededBuilderLayout(page);
  const realPanel = page.locator(`[data-builder-block-key="${seeded}"] .shop-builder-column-block--panel`);
  await expect.poll(() => realPanel.locator(".shop-builder-panel-media").evaluate((element) => getComputedStyle(element).backgroundImage)).toContain("example.com");
  const realImageGeometry = await geometry(realPanel);
  expect(Math.abs(realImageGeometry.outerWidth - realImageGeometry.mediaWidth)).toBeLessThanOrEqual(1);
  expect(Math.abs(realImageGeometry.outerWidth - realImageGeometry.bodyWidth)).toBeLessThanOrEqual(1);

  await page.getByRole("button", { name: "Publish", exact: true }).click();
  await expect(page.locator(".builder-publish-celebration").getByText("Published successfully", { exact: true })).toBeVisible();
  const frontend = await context.newPage();
  await frontend.goto(previewUrl);
  const frontendPanel = frontend.locator(".shop-builder-column-block--panel").first();
  await expect(frontendPanel).toBeVisible();
  const frontendGeometry = await geometry(frontendPanel);
  expect(Math.abs(frontendGeometry.outerWidth - frontendGeometry.mediaWidth)).toBeLessThanOrEqual(1);
  expect(Math.abs(frontendGeometry.outerWidth - frontendGeometry.bodyWidth)).toBeLessThanOrEqual(1);
  expect(frontendGeometry.mediaRadius).toBe(realImageGeometry.mediaRadius);
});
