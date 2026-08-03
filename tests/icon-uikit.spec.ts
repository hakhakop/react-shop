import { expect, test, type Page } from "@playwright/test";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { waitForSeededBuilderLayout } from "./builderFixture";

const email = "header-parity-20260722@example.test";
const password = "HeaderParity!2026";
const builderUrl = "/app/websites/header-parity-site/builder?page=home";
const previewUrl = "/app/websites/header-parity-site/preview?page=home";
const websiteId = "eb65bd05-1299-4071-b432-f3c04e9eda2e";
const layoutsPath = path.resolve("data/websites", websiteId, "builder-layouts.json");
const originalLayouts = readFileSync(layoutsPath, "utf8");

async function signIn(page: Page) {
  await page.goto("/login");
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/app(?:\?|$)/);
}

async function addBlock(page: Page, label: string) {
  await page.locator(".builder-sidebar-nav-tile", { hasText: "Blocks" }).first().click();
  await page.locator(".builder-element-library-search input").fill(label);
  const card = page.locator(".builder-element-library-card").filter({ has: page.getByText(label, { exact: true }) }).first();
  await expect(card).toBeVisible();
  await card.click();
  const selected = page.locator(".builder-preview-layout-block.is-selected-block").last();
  await expect(selected).toBeVisible();
  await selected.locator(".builder-preview-block-tools").getByRole("button", { name: "Edit element" }).click();
  return {
    selected,
    inspector: page.locator(".builder-floating-inspector"),
  };
}

async function publish(page: Page) {
  await Promise.all([
    page.waitForResponse((response) => response.request().method() === "POST" && response.url().includes("/api/builder-layouts")),
    page.getByRole("button", { name: "Publish", exact: true }).click(),
  ]);
  await expect(page.locator(".builder-publish-celebration").getByText("Published successfully", { exact: true })).toBeVisible();
}

async function findStoredBlock(page: Page, id: string) {
  return page.evaluate((blockId) => {
    const walk = (value: unknown): Record<string, unknown> | null => {
      if (!value || typeof value !== "object") return null;
      if (Array.isArray(value)) {
        for (const entry of value) {
          const found = walk(entry);
          if (found) return found;
        }
        return null;
      }
      const record = value as Record<string, unknown>;
      if (record.id === blockId) return record;
      for (const entry of Object.values(record)) {
        const found = walk(entry);
        if (found) return found;
      }
      return null;
    };

    for (let index = 0; index < localStorage.length; index += 1) {
      const value = localStorage.getItem(localStorage.key(index) ?? "");
      if (!value) continue;
      try {
        const found = walk(JSON.parse(value));
        if (found) return found;
      } catch {
        // Ignore unrelated local-storage entries.
      }
    }
    return null;
  }, id);
}

test.afterEach(() => writeFileSync(layoutsPath, originalLayouts));
test.afterAll(() => writeFileSync(layoutsPath, originalLayouts));

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1800, height: 1200 });
  await signIn(page);
});

test("Icon picker selects, clears, persists, and matches frontend rendering", async ({ page, context }) => {
  await page.goto(builderUrl);
  await waitForSeededBuilderLayout(page);
  const { selected, inspector } = await addBlock(page, "Icon");
  await expect(inspector.locator('[data-icon-picker]')).toBeVisible();
  await expect(inspector.locator('[data-icon-option]')).toHaveCount(162);
  await page.setViewportSize({ width: 480, height: 1000 });
  await expect(inspector.locator(".webpages-icon-picker__grid")).toHaveCSS("overflow-y", "auto");
  const narrowPickerColumnCount = await inspector
    .locator(".webpages-icon-picker__grid")
    .evaluate((element) => getComputedStyle(element).gridTemplateColumns.split(" ").filter(Boolean).length);
  expect(narrowPickerColumnCount).toBeGreaterThanOrEqual(2);
  await page.setViewportSize({ width: 1800, height: 1200 });

  const blockId = await selected.getAttribute("data-builder-block-key");
  if (!blockId) throw new Error("Icon block id missing");
  await inspector.getByLabel("Element title", { exact: true }).fill("Icon parity content");
  await inspector.getByLabel("Element body", { exact: true }).fill("Shared UIkit icon output");

  const picker = inspector.locator("[data-icon-picker]");
  await picker.getByPlaceholder("Search icons", { exact: true }).fill("heart");
  await expect(picker.locator('[data-icon-option="heart"]')).toHaveCount(1);
  await expect(picker.locator(".webpages-icon-picker__search")).toHaveCSS("grid-column", "1 / -1");
  await expect(picker.locator(".webpages-icon-picker__grid")).toHaveCSS("max-height", "520px");
  await picker.locator('[data-icon-option="heart"]').click();
  await inspector.getByLabel("Icon size", { exact: true }).selectOption("40");
  const builderIcon = selected.locator('[data-webpages-icon="heart"]');
  await expect(builderIcon.locator("svg")).toHaveAttribute("width", "40");
  await expect(builderIcon.locator("svg")).toHaveAttribute("height", "40");

  await picker.getByRole("button", { name: "Remove Heart icon", exact: true }).click();
  await expect(selected.locator("[data-webpages-icon]")).toHaveCount(0);

  await picker.getByPlaceholder("Search icons", { exact: true }).fill("star");
  await picker.locator('[data-icon-option="star"]').click();
  await expect(selected.locator('[data-webpages-icon="star"] svg')).toBeVisible();
  await expect.poll(() => findStoredBlock(page, blockId)).toMatchObject({ kind: "icon", iconName: "star", iconSize: 40 });

  await publish(page);
  const frontend = await context.newPage();
  await frontend.goto(previewUrl);
  const frontendIcon = frontend.locator(".shop-builder-column-block--icon").filter({ hasText: "Icon parity content" }).last();
  await expect(frontendIcon).toBeVisible();
  await expect(frontendIcon.locator('[data-webpages-icon="star"] svg')).toHaveAttribute("width", "40", { timeout: 15000 });
  await expect(frontendIcon.locator('[data-webpages-icon="star"] svg')).toHaveAttribute("height", "40", { timeout: 15000 });
  await frontend.reload();
  await expect(frontend.locator(".shop-builder-column-block--icon").filter({ hasText: "Icon parity content" }).last().locator('[data-webpages-icon="star"]')).toBeVisible();
});

test("List item icons use the shared picker and preserve frontend parity", async ({ page, context }) => {
  await page.goto(builderUrl);
  await waitForSeededBuilderLayout(page);
  const { selected, inspector } = await addBlock(page, "List");
  const listItems = inspector.locator("[data-list-item-id]");
  const listItemCount = await listItems.count();
  expect(listItemCount).toBeGreaterThan(1);
  await expect(listItems.nth(0).locator(".builder-nested-card-body")).toBeVisible();
  await expect(listItems.nth(1).locator(".builder-nested-card-body")).toHaveCount(0);
  await listItems.nth(1).getByRole("button", { name: "Edit list item 2", exact: true }).click();
  await expect(listItems.nth(0).locator(".builder-nested-card-body")).toHaveCount(0);
  await expect(listItems.nth(1).locator(".builder-nested-card-body")).toBeVisible();
  await listItems.nth(1).getByRole("button", { name: "Edit list item 2", exact: true }).click();
  await expect(listItems.nth(0).locator(".builder-nested-card-body")).toHaveCount(0);
  await expect(listItems.nth(1).locator(".builder-nested-card-body")).toHaveCount(0);
  await listItems.nth(0).getByRole("button", { name: "Edit list item 1", exact: true }).click();
  const item = listItems.nth(0);
  const picker = item.locator("[data-icon-picker]");
  await expect(picker).toBeVisible();
  await picker.getByPlaceholder("Search icons", { exact: true }).fill("heart");
  await picker.locator('[data-icon-option="heart"]').click();
  await item.getByLabel("List item 1 icon size", { exact: true }).selectOption("20");
  await item.locator("input").first().fill("List icon parity content");
  const builderIcon = selected.locator('.builder-preview-goodie-list [data-webpages-icon="heart"]');
  await expect(builderIcon.locator("svg")).toHaveAttribute("width", "20");

  await picker.getByRole("button", { name: "Remove Heart icon", exact: true }).click();
  await expect(selected.locator('.builder-preview-goodie-list [data-webpages-icon="heart"]')).toHaveCount(0);
  await picker.getByPlaceholder("Search icons", { exact: true }).fill("arrow right");
  await picker.locator('[data-icon-option="arrow-right"]').click();
  await expect(selected.locator('.builder-preview-goodie-list [data-webpages-icon="arrow-right"]')).toBeVisible();
  const builderListItem = selected.locator(".builder-preview-goodie-list .webpages-list-item").first();
  await expect(builderListItem).toHaveCSS("display", "flex");
  await expect(builderListItem.locator('[data-webpages-icon="arrow-right"]')).toHaveCSS("color", await builderListItem.evaluate((element) => getComputedStyle(element).color));

  const blockId = await selected.getAttribute("data-builder-block-key");
  if (!blockId) throw new Error("List block id missing");
  await expect.poll(() => findStoredBlock(page, blockId)).toMatchObject({ kind: "list", listItems: expect.arrayContaining([expect.objectContaining({ iconName: "arrow-right", iconSize: 20 })]) });
  await publish(page);

  const frontend = await context.newPage();
  await frontend.goto(previewUrl);
  const frontendList = frontend.locator(".shop-builder-column-block--list").filter({ hasText: "List icon parity content" }).last();
  await expect(frontendList.locator('[data-webpages-icon="arrow-right"] svg')).toHaveAttribute("width", "20", { timeout: 15000 });
  const frontendListItem = frontendList.locator(".webpages-list-item").filter({ has: frontend.locator('[data-webpages-icon="arrow-right"]') }).first();
  await expect(frontendListItem).toHaveCSS("display", "flex");
  await expect(frontendListItem).toHaveCSS("align-items", "center");
  await expect(frontendListItem.locator('[data-webpages-icon="arrow-right"]')).toHaveCSS("color", await frontendListItem.evaluate((element) => getComputedStyle(element).color));
  await frontend.reload();
  await expect(frontend.locator(".shop-builder-column-block--list").filter({ hasText: "List icon parity content" }).last().locator('[data-webpages-icon="arrow-right"]')).toBeVisible();
});

test("Grid item icons use the shared picker and preserve frontend parity", async ({ page, context }) => {
  await page.goto(builderUrl);
  await waitForSeededBuilderLayout(page);
  const { selected, inspector } = await addBlock(page, "Grid");
  const gridItems = inspector.locator("[data-grid-item-id]");
  const gridItemCount = await gridItems.count();
  expect(gridItemCount).toBeGreaterThan(1);
  const secondGridTitle = await gridItems.nth(1).locator(".builder-slide-toggle small").innerText();
  await gridItems.nth(1).locator(".builder-nested-card-drag-handle").dragTo(gridItems.nth(0).locator(".builder-nested-card-header"));
  await expect(gridItems.nth(0).locator(".builder-slide-toggle small")).toHaveText(secondGridTitle);
  await expect(gridItems.nth(0).locator(".builder-nested-card-body")).toBeVisible();
  await expect(gridItems.nth(1).locator(".builder-nested-card-body")).toHaveCount(0);
  await gridItems.nth(0).getByRole("button", { name: "Edit grid item 1", exact: true }).click();
  await expect(gridItems.nth(0).locator(".builder-nested-card-body")).toHaveCount(0);
  await expect(gridItems.nth(1).locator(".builder-nested-card-body")).toHaveCount(0);
  await gridItems.nth(0).getByRole("button", { name: "Edit grid item 1", exact: true }).click();
  const item = gridItems.nth(0);
  const picker = item.locator("[data-icon-picker]");
  await expect(picker).toBeVisible();
  await picker.getByPlaceholder("Search icons", { exact: true }).fill("heart");
  await picker.locator('[data-icon-option="heart"]').click();
  await item.getByLabel("Grid item 1 icon size", { exact: true }).selectOption("28");
  const builderIcon = selected.locator(".shop-builder-grid-card").first().locator('[data-webpages-icon="heart"]');
  await expect(builderIcon.locator("svg")).toHaveAttribute("width", "28");

  const blockId = await selected.getAttribute("data-builder-block-key");
  if (!blockId) throw new Error("Grid block id missing");
  await expect.poll(() => findStoredBlock(page, blockId)).toMatchObject({ kind: "grid", gridItems: expect.arrayContaining([expect.objectContaining({ iconName: "heart", iconSize: 28 })]) });
  await publish(page);

  const frontend = await context.newPage();
  await frontend.goto(previewUrl);
  const frontendGrid = frontend.locator(".shop-builder-column-block--grid").filter({ has: frontend.locator('[data-webpages-icon="heart"]') }).last();
  await expect(frontendGrid.locator('.shop-builder-grid-card [data-webpages-icon="heart"] svg').first()).toHaveAttribute("width", "28", { timeout: 15000 });
  await frontend.reload();
  await expect(frontend.locator(".shop-builder-column-block--grid").filter({ has: frontend.locator('[data-webpages-icon="heart"]') }).last().locator('[data-webpages-icon="heart"]')).toBeVisible();
});
