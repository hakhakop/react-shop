import { expect, test } from "@playwright/test";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const email = "header-parity-20260722@example.test";
const password = "HeaderParity!2026";
const builderUrl = "/app/websites/header-parity-site/builder?page=home";
const previewUrl = "/app/websites/header-parity-site/preview?page=home";
const websiteId = "eb65bd05-1299-4071-b432-f3c04e9eda2e";
const websitesPath = path.resolve("data/websites.json");
const layoutsPath = path.resolve("data/websites", websiteId, "builder-layouts.json");
const originalWebsites = readFileSync(websitesPath, "utf8");
const originalLayouts = readFileSync(layoutsPath, "utf8");

test.beforeAll(() => {
  const websites = JSON.parse(originalWebsites) as Array<Record<string, unknown>>;
  const website = websites.find((entry) => entry.id === websiteId);
  if (website) website.enabledLanguages = ["hy", "en", "ru"];
  writeFileSync(websitesPath, JSON.stringify(websites, null, 2));

  const layouts = JSON.parse(originalLayouts) as Record<string, any>;
  const listBlock = layouts.home.sections
    .flatMap((section: any) => section.layoutItems ?? [])
    .flatMap((item: any) => item.blocks ?? [])
    .find((block: any) => block.kind === "list");
  if (listBlock) {
    const firstItem = listBlock.listItems?.[0] ?? { id: `${listBlock.id}-item-1`, text: "List item" };
    listBlock.listItems = listBlock.listItems ?? [firstItem];
    listBlock.contentTranslations = {
      ...(listBlock.contentTranslations ?? {}),
      en: { listItems: [{ ...firstItem, text: "English localized list item" }] },
    };
  }
  writeFileSync(layoutsPath, JSON.stringify(layouts, null, 2));
});

test.afterAll(() => {
  writeFileSync(websitesPath, originalWebsites);
  writeFileSync(layoutsPath, originalLayouts);
});

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 2400, height: 1200 });
  await page.goto("/login");
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/app(?:\?|$)/);
});

test("List uses semantic UIkit presentation, item links, and frontend parity", async ({ page, context }) => {
  await page.goto(builderUrl);
  await page.locator(".builder-sidebar-nav-tile", { hasText: "Blocks" }).first().click();
  await page.locator(".builder-element-library-search input").fill("list");
  const card = page.locator(".builder-element-library-card").filter({ has: page.locator("strong", { hasText: /^List$/ }) }).first();
  await expect(card).toBeVisible();
  await card.click();

  const selected = page.locator(".builder-preview-layout-block.is-selected-block");
  const list = selected.locator(".builder-preview-goodie-list");
  await expect(list.locator("ul.uk-list")).toBeVisible();
  const blockId = await selected.getAttribute("data-builder-block-key");
  if (!blockId) throw new Error("List block id missing");
  await selected.locator(".builder-preview-block-tools").getByRole("button", { name: "Edit element" }).dispatchEvent("click");

  const inspector = page.locator(".builder-floating-inspector");
  await inspector.getByRole("button", { name: "Content", exact: true }).click();
  const content = inspector.locator('[data-uikit-capability="list-content"]');
  await expect(content.getByText("Icon type", { exact: true })).toHaveCount(0);
  const firstText = content.locator('[data-list-item-id]').first().locator("input").first();
  await firstText.fill("Localized list item");
  await content.getByRole("button", { name: "Add item", exact: true }).click();
  await content.locator('[data-list-item-id]').nth(1).getByRole("button", { name: "Move up", exact: true }).click();
  await content.locator('[data-list-item-id]').first().getByText("Link URL", { exact: true }).locator(".. ").locator("input").fill("/details");

  await inspector.getByRole("button", { name: "Styling", exact: true }).click();
  const style = inspector.locator('[data-uikit-capability="list-style"]');
  await style.locator("label.builder-field", { hasText: "Presentation" }).locator("select").selectOption("divider");
  await style.locator("label.builder-field", { hasText: "Marker" }).locator("select").selectOption("disc");
  await style.locator("label.builder-field", { hasText: "Spacing" }).locator("select").selectOption("large");
  await expect(list.locator("ul.uk-list")).toHaveClass(/uk-list-divider/);
  await expect(list.locator("ul.uk-list")).toHaveClass(/uk-list-large/);
  await expect(list.locator("ul.uk-list")).toHaveClass(/uk-list-disc/);
  await expect(list.locator("li").first()).toHaveCSS("list-style-type", "disc");
  await expect.poll(async () => list.locator("li").nth(1).evaluate((element) => getComputedStyle(element).borderTopWidth)).not.toBe("0px");

  const stored = await page.evaluate((id) => {
    const walk = (value: unknown): Record<string, unknown> | null => {
      if (!value || typeof value !== "object") return null;
      if (Array.isArray(value)) { for (const entry of value) { const found = walk(entry); if (found) return found; } return null; }
      const record = value as Record<string, unknown>;
      if (record.kind === "list" && record.id === id) return record;
      for (const entry of Object.values(record)) { const found = walk(entry); if (found) return found; }
      return null;
    };
    for (const value of Object.values(localStorage)) { try { const found = walk(JSON.parse(value)); if (found) return found; } catch {} }
    return null;
  }, blockId);
  expect(stored).toMatchObject({ kind: "list", listPresentation: "divider", listMarker: "disc", listSpacing: "large" });
  expect(JSON.stringify(stored)).not.toMatch(/uk-/);
  expect(stored?.listItems).toEqual(expect.arrayContaining([expect.objectContaining({ text: "Localized list item" }), expect.objectContaining({ url: "/details" })]));

  await Promise.all([
    page.waitForResponse((response) => response.request().method() === "POST" && response.url().includes("/api/builder-layouts")),
    page.getByRole("button", { name: "Publish", exact: true }).click(),
  ]);
  await expect(page.locator(".builder-publish-celebration").getByText("Published successfully", { exact: true })).toBeVisible();
  const frontend = await context.newPage();
  await frontend.goto(previewUrl);
  const frontendList = frontend.locator(".shop-builder-column-block--list").filter({ hasText: "Localized list item" }).last();
  await expect(frontendList.locator("ul.uk-list")).toHaveClass(/uk-list-divider/);
  await expect(frontendList.locator("ul.uk-list")).toHaveClass(/uk-list-large/);
  await expect(frontendList.locator("ul.uk-list")).toHaveClass(/uk-list-disc/);
  await expect(frontendList.getByText("Localized list item", { exact: true })).toBeVisible();
  await expect(frontendList.locator("a[href=\"/details\"]")).toBeVisible();

  await page.getByTestId("builder-language-selector").selectOption("en");
  await expect(page.getByText("English localized list item", { exact: true })).toBeVisible();
});
