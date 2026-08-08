import { expect, test, type Page } from "@playwright/test";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const email = "header-parity-20260722@example.test";
const password = "HeaderParity!2026";
const builderUrl = "/app/websites/header-parity-site/builder?page=home";
const previewUrl = "/app/websites/header-parity-site/preview?page=home";
const fixtureId = "accordion-direct-fixture";
const layoutsPath = path.resolve("data/builder-layouts.json");
const originalLayouts = readFileSync(layoutsPath, "utf8");
const websiteLayoutsPath = path.resolve("data/websites/eb65bd05-1299-4071-b432-f3c04e9eda2e/builder-layouts.json");
const originalWebsiteLayouts = readFileSync(websiteLayoutsPath, "utf8");

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

test.beforeAll(() => {
  const layouts = JSON.parse(originalLayouts) as any;
  const section = layouts.home.sections.find((entry: any) => entry.kind === "contentLayout");
  const findBlockList = (value: any): any[] | null => {
    if (!value || typeof value !== "object") return null;
    if (Array.isArray(value.blocks) && value.blocks.length > 0) return value.blocks;
    if (Array.isArray(value)) {
      for (const entry of value) {
        const found = findBlockList(entry);
        if (found) return found;
      }
      return null;
    }
    for (const [key, child] of Object.entries(value)) {
      if (key === "blocks") continue;
      const found = findBlockList(child);
      if (found) return found;
    }
    return null;
  };
  const blocks = findBlockList(section);
  if (!blocks) throw new Error("No visible content column found for Accordion fixture");
  blocks.push({ id: fixtureId, kind: "accordion", accordionItems: [{ id: `${fixtureId}-1`, title: "Delivery timeline", content: "Most projects begin within two weeks." }, { id: `${fixtureId}-2`, title: "How does it work?", content: "We guide the next step clearly." }, { id: `${fixtureId}-3`, title: "Can I ask a question?", content: "Contact the team for help." }], accordionMultiple: false, accordionCollapsible: true, accordionOpenItems: [0] });
  writeFileSync(layoutsPath, JSON.stringify(layouts, null, 2));
});

test.afterAll(() => {
  writeFileSync(layoutsPath, originalLayouts);
  writeFileSync(websiteLayoutsPath, originalWebsiteLayouts);
});

test("Accordion uses semantic items and UIkit behavior in builder and frontend", async ({ page, context }) => {
  await page.evaluate(async (id) => {
    const response = await fetch("/api/builder-layouts?key=home&websiteId=header-parity-site");
    const layout = await response.json();
    const section = layout.layout.sections.find((entry: any) => entry.kind === "contentLayout");
    const findBlockList = (value: any): any[] | null => {
      if (!value || typeof value !== "object") return null;
      if (Array.isArray(value.blocks) && value.blocks.length > 0) return value.blocks;
      if (Array.isArray(value)) {
        for (const entry of value) {
          const found = findBlockList(entry);
          if (found) return found;
        }
        return null;
      }
      for (const [key, child] of Object.entries(value)) {
        if (key === "blocks") continue;
        const found = findBlockList(child);
        if (found) return found;
      }
      return null;
    };
    const blocks = findBlockList(section);
    if (!blocks) throw new Error("No API visible content column found for Accordion fixture");
    blocks.push({ id, kind: "accordion", accordionItems: [{ id: `${id}-1`, title: "Delivery timeline", content: "Most projects begin within two weeks." }, { id: `${id}-2`, title: "How does it work?", content: "We guide the next step clearly." }, { id: `${id}-3`, title: "Can I ask a question?", content: "Contact the team for help." }], accordionMultiple: false, accordionCollapsible: true, accordionOpenItems: [0] });
    const saved = await fetch("/api/builder-layouts?websiteId=header-parity-site", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ key: "home", design: layout.layout.design, sections: layout.layout.sections }) });
    if (!saved.ok) throw new Error(`Accordion fixture save failed: ${saved.status}`);
  }, fixtureId);
  await page.evaluate(() => Object.keys(localStorage).filter((key) => ["react-shop-visual-builder-drafts-v2", "react-shop-visual-builder-v1", "react-shop-visual-builder-pages-v1"].some((prefix) => key.startsWith(prefix))).forEach((key) => localStorage.removeItem(key)));
  await page.goto(builderUrl);
  await expect(page.locator(".builder-preview-shell").first()).toBeVisible();
  const accordion = page.locator(".shop-builder-column-block--accordion").filter({ hasText: "Delivery timeline" }).last();
  await expect.poll(() => accordion.count(), { timeout: 30_000 }).toBeGreaterThan(0);
  await expect(accordion).toBeVisible();
  const selected = page.locator(`[data-builder-block-key="${fixtureId}"]`).last();
  await selected.dispatchEvent("mousedown");
  await selected.dispatchEvent("click");
  await expect(selected).toHaveClass(/is-selected-block/);
  const selectedAccordion = selected.locator(".shop-builder-column-block--accordion");
  await expect(selectedAccordion).toBeVisible();
  await expect(selectedAccordion.locator(".uk-accordion-title")).toHaveCount(3);
  await expect(selected).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
  const accordionTitleSize = await selectedAccordion.locator(".uk-accordion-title").first().evaluate((node) => getComputedStyle(node).fontSize);
  expect(accordionTitleSize).toMatch(/\d+px/);
  const blockId = await selected.getAttribute("data-builder-block-key");
  if (!blockId) throw new Error("Accordion block id missing");

  await selected.locator(".builder-preview-block-tools").getByRole("button", { name: "Edit element" }).click();
  const inspector = page.locator(".builder-floating-inspector");
  await expect(inspector).toBeVisible();
  const contentPanel = inspector.locator('[data-uikit-capability="accordion-content"]');
  const itemCards = contentPanel.locator("[data-accordion-item-id]");
  await expect(itemCards).toHaveCount(3);
  await expect(itemCards.nth(0).locator(".builder-nested-card-body")).toHaveCount(0);
  await expect(itemCards.nth(1).locator(".builder-nested-card-body")).toHaveCount(0);
  await itemCards.nth(1).getByRole("button", { name: "Edit item 2", exact: true }).click();
  await expect(itemCards.nth(0).locator(".builder-nested-card-body")).toHaveCount(0);
  await expect(itemCards.nth(1).locator(".builder-nested-card-body")).toBeVisible();
  await itemCards.nth(1).getByRole("button", { name: "Edit item 2", exact: true }).click();
  await expect(itemCards.nth(0).locator(".builder-nested-card-body")).toHaveCount(0);
  await expect(itemCards.nth(1).locator(".builder-nested-card-body")).toHaveCount(0);
  await itemCards.nth(0).getByRole("button", { name: "Edit item 1", exact: true }).click();
  await itemCards.nth(0).getByRole("button", { name: "Copy item 1", exact: true }).click();
  await expect(contentPanel.locator("[data-accordion-item-id]")).toHaveCount(4);
  await expect(contentPanel.locator("[data-accordion-item-id]").nth(1).locator(".builder-slide-toggle small")).toHaveText("Delivery timeline Copy");
  await contentPanel.locator("[data-accordion-item-id]").nth(1).getByRole("button", { name: "Delete item 2", exact: true }).click();
  await expect(contentPanel.locator("[data-accordion-item-id]")).toHaveCount(3);
  const secondItemSummary = await itemCards.nth(1).locator(".builder-slide-toggle small").innerText();
  await itemCards.nth(1).locator(".builder-nested-card-drag-handle").dragTo(itemCards.nth(0).locator(".builder-nested-card-header"));
  await expect(itemCards.nth(0).locator(".builder-slide-toggle small")).toHaveText(secondItemSummary);
  await expect(itemCards.nth(1).locator(".builder-slide-toggle small")).toHaveText("Delivery timeline");
  await itemCards.nth(0).locator(".builder-nested-card-drag-handle").dragTo(itemCards.nth(1).locator(".builder-nested-card-header"));
  await expect(itemCards.nth(0).locator(".builder-slide-toggle small")).toHaveText("Delivery timeline");
  if (await itemCards.nth(0).locator(".builder-nested-card-body").count() === 0) {
    await itemCards.nth(0).getByRole("button", { name: "Edit item 1", exact: true }).click();
  }
  await inspector.getByRole("button", { name: "Content", exact: true }).click();
  const firstTitle = inspector.getByLabel("Accordion item 1 title", { exact: true });
  await firstTitle.fill("What is the delivery timeline?");
  await inspector.getByLabel("Accordion item 1 content", { exact: true }).fill("Most projects begin within two weeks.");
  await inspector.getByRole("button", { name: "Settings", exact: true }).click();
  const stylePanel = inspector.locator('[data-uikit-capability="accordion-settings"]');
  const allowMultiple = stylePanel
    .locator("label.builder-inspector-checkbox-row")
    .filter({ hasText: "Allow multiple open items" })
    .locator("input");
  if (!(await allowMultiple.isChecked())) {
    await allowMultiple.locator("xpath=..").click({ force: true });
    await expect(allowMultiple).toBeChecked();
  }
  await inspector.getByLabel("Initially open", { exact: true }).selectOption("first");
  await stylePanel.getByLabel("Accordion Style", { exact: true }).selectOption("striped");
  await stylePanel.getByLabel("Indicator Style", { exact: true }).selectOption("plus-minus");
  await stylePanel.getByLabel("Indicator Position", { exact: true }).selectOption("start");
  await stylePanel.getByLabel("Accordion title emphasis", { exact: true }).selectOption("emphasis");
  await stylePanel.getByLabel("Item Margin", { exact: true }).selectOption("large");
  await stylePanel.getByLabel("Accordion content spacing", { exact: true }).selectOption("small");
  const showDividers = stylePanel.getByLabel("Show dividers", { exact: true });
  if (await showDividers.isChecked()) {
    await showDividers.locator("xpath=..").click({ force: true });
    await expect(showDividers).not.toBeChecked();
  }
  await stylePanel.getByLabel("Title style", { exact: true }).selectOption("h4");
  await stylePanel.getByLabel("Content style", { exact: true }).selectOption("text-lead");
  await expect(selectedAccordion.locator("ul")).toHaveClass(/uk-list-striped/);
  await expect(selectedAccordion.locator("ul")).toHaveClass(/shop-builder-accordion--style-striped/);
  await expect(selectedAccordion.locator("ul")).toHaveClass(/shop-builder-accordion--indicator-plus-minus/);
  await expect(selectedAccordion.locator("ul")).toHaveClass(/shop-builder-accordion--indicator-start/);
  await expect(selectedAccordion.locator("ul")).toHaveClass(/shop-builder-accordion--items-large/);
  await expect(selectedAccordion.locator("li").nth(1)).toHaveCSS("margin-top", "40px");
  const builderContentSpacing = await selectedAccordion.locator("li").first().locator(".uk-accordion-content").evaluate((node) => {
    const computed = getComputedStyle(node);
    return { marginTop: computed.marginTop, token: computed.getPropertyValue("--uk-global-margin-small").trim() };
  });
  expect(builderContentSpacing.marginTop).toBe(builderContentSpacing.token || "15px");
  await expect(selectedAccordion.locator(".uk-accordion-indicator, .shop-builder-accordion-indicator")).toHaveCount(6);
  await expect(selectedAccordion.locator(".uk-accordion-title").first()).toHaveCSS("display", "flex");
  await expect(selectedAccordion.locator(".uk-accordion-title").first()).toHaveCSS("text-align", "left");
  const titles = selectedAccordion.locator(".uk-accordion-title");
  await expect(selectedAccordion.locator("li").nth(0)).toHaveClass(/uk-open/);
  await titles.nth(0).click();
  await expect(titles.nth(0)).toHaveClass(/uk-accordion-title/);
  await expect(selectedAccordion.locator("li").nth(0)).not.toHaveClass(/uk-open/);
  await titles.nth(1).click();
  await expect(selectedAccordion.locator("li").nth(1)).toHaveClass(/uk-open/);
  await titles.nth(0).click();
  await expect(selectedAccordion.locator("li").nth(0)).toHaveClass(/uk-open/);
  await expect(selectedAccordion.locator("li").nth(1)).toHaveClass(/uk-open/);

  const stored = await page.evaluate((id) => {
    const walk = (value: unknown): Record<string, unknown> | null => {
      if (!value || typeof value !== "object") return null;
      if (Array.isArray(value)) { for (const item of value) { const found = walk(item); if (found) return found; } return null; }
      const record = value as Record<string, unknown>;
      if (record.kind === "accordion" && record.id === id) return record;
      for (const child of Object.values(record)) { const found = walk(child); if (found) return found; }
      return null;
    };
    for (const value of Object.values(localStorage)) { try { const found = walk(JSON.parse(value)); if (found) return found; } catch {} }
    return null;
  }, blockId);
  expect(stored).toMatchObject({ kind: "accordion", accordionMultiple: true, accordionCollapsible: true, accordionOpenItems: [0], accordionStyle: "striped", accordionIndicator: "plus-minus", accordionIndicatorPosition: "start", accordionTitleEmphasis: "emphasis", accordionItemSpacing: "large", accordionContentSpacing: "small", accordionDivider: false, accordionTitleStyle: "h4", accordionContentStyle: "text-lead" });
  expect((stored?.accordionItems as Array<Record<string, unknown>>)[0]).toMatchObject({ title: "What is the delivery timeline?", content: "Most projects begin within two weeks." });
  expect(JSON.stringify(stored)).not.toMatch(/uk-/);

  await publish(page);
  const frontend = await context.newPage();
  await frontend.goto(previewUrl);
  const frontendAccordion = frontend.locator(".shop-builder-column-block--accordion").last();
  await expect(frontendAccordion).toBeVisible();
  await expect(frontendAccordion.locator(".uk-accordion-title").first()).toContainText("What is the delivery timeline?");
  await expect(frontendAccordion.locator(".uk-accordion-content").first().locator(".uk-text-lead")).toBeVisible();
  await expect(frontendAccordion.locator("ul")).toHaveClass(/uk-list-striped/);
  const builderStripedBackground = await selectedAccordion.locator("li").first().evaluate((node) => getComputedStyle(node).backgroundColor);
  const frontendStripedBackground = await frontendAccordion.locator("li").first().evaluate((node) => getComputedStyle(node).backgroundColor);
  expect(frontendStripedBackground).toBe(builderStripedBackground);
  await expect(frontendAccordion.locator("li").nth(1)).toHaveCSS("margin-top", "40px");
  const frontendContentSpacing = await frontendAccordion.locator("li").first().locator(".uk-accordion-content").evaluate((node) => getComputedStyle(node).marginTop);
  expect(frontendContentSpacing).toBe(builderContentSpacing.marginTop);
  await expect.poll(() => frontendAccordion.locator(".uk-accordion-title").first().evaluate((node) => getComputedStyle(node).fontSize), { timeout: 10_000 }).toBe(accordionTitleSize);
  await expect.poll(() => frontendAccordion.locator("li").nth(0).getAttribute("class"), { timeout: 10_000 }).toContain("uk-open");
  await frontendAccordion.locator(".uk-accordion-title").nth(0).click();
  await expect(frontendAccordion.locator("li").nth(0)).not.toHaveClass(/uk-open/);
  await frontendAccordion.locator(".uk-accordion-title").nth(1).click();
  await frontendAccordion.locator(".uk-accordion-title").nth(0).click();
  await expect(frontendAccordion.locator("li").nth(1)).toHaveClass(/uk-open/);
  await expect(frontendAccordion.locator("li").nth(0)).toHaveClass(/uk-open/);
  await expect(frontendAccordion.locator("li").nth(1)).toHaveClass(/uk-open/);
});
