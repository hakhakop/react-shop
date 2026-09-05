import { expect, test } from "@playwright/test";

test("nested columns respond to viewport widths without section padding", async ({ page }) => {
  await page.goto("/dashboard-sublayout-proof");
  const shop = page.getByRole("heading", { name: "Shop", exact: true });
  const help = page.getByRole("heading", { name: "Help", exact: true });
  await expect(shop).toBeVisible();
  await page.setViewportSize({ width: 1200, height: 1000 });
  await expect.poll(async () => Math.abs((await shop.boundingBox())!.y - (await help.boundingBox())!.y)).toBeLessThan(2);
  await page.setViewportSize({ width: 390, height: 900 });
  await expect.poll(async () => (await help.boundingBox())!.y - (await shop.boundingBox())!.y).toBeGreaterThan(20);
  expect(await page.getByTestId("preview").evaluate(e => e.scrollWidth <= e.clientWidth)).toBe(true);
  expect(await page.locator(".shop-builder-sublayout .shop-builder-section").count()).toBe(0);
});

test("nested shared Inspectors edit children and add rows; Sublayout settings omit unrelated fields", async ({ page }) => {
  await page.goto("/dashboard-sublayout-proof");
  const inspector = page.getByRole("complementary", { name: "Sublayout Inspector" });
  await inspector.locator('.builder-structure-element-card').filter({ hasText: "Shop" }).click();
  await expect(inspector.locator("[data-sublayout-detail]")).toBeVisible();
  const content = inspector.getByRole("textbox").first();
  await content.fill("Updated Shop");
  await expect(page.getByTestId("preview").getByRole("heading", { name: "Updated Shop", exact: true })).toBeVisible();
  await inspector.getByRole("button", { name: "Back to Sublayout", exact: true }).click();
  await inspector.getByRole("button", { name: "Add row after Row 2", exact: true }).click();
  await expect(inspector.locator(".builder-structure-row-card")).toHaveCount(3);
  await inspector.getByRole("navigation", { name: "Element tabs" }).getByRole("button", { name: "settings", exact: true }).click();
  await expect(inspector.getByLabel("HTML Element", { exact: true })).toHaveValue("nav");
  await expect(inspector.getByLabel("Max Width", { exact: true })).toHaveCount(0);
  await inspector.getByLabel("HTML Element", { exact: true }).selectOption("aside");
  await expect(page.locator("aside#nested-links")).toBeVisible();
});

test("shared Structure menus and element library act only on the nested layout", async ({ page }) => {
  await page.goto("/dashboard-sublayout-proof");
  const inspector = page.getByRole("complementary", { name: "Sublayout Inspector" });
  const tree = inspector.getByRole("tree", { name: "Sublayout structure" });
  const shop = tree.locator(".builder-structure-element-card").filter({ hasText: "Shop" });
  await shop.hover();
  await shop.getByRole("button", { name: "Element actions" }).click();
  await page.getByTitle("Duplicate element", { exact: true }).click();
  await expect(tree.locator(".builder-structure-element-card").filter({ hasText: "Shop" })).toHaveCount(2);
  await expect(page.getByTestId("preview").getByRole("heading", { name: "Shop", exact: true })).toHaveCount(2);
  await tree.getByRole("button", { name: "Add element", exact: true }).first().click();
  await expect(inspector.locator(".builder-element-library-search input")).toBeVisible();
  await inspector.locator(".builder-element-library-search input").fill("Divider");
  await inspector.locator(".builder-element-library-card").filter({ hasText: "Divider" }).click();
  await expect(inspector.locator("[data-sublayout-detail]")).toBeVisible();
  await inspector.getByRole("button", { name: "Back to Sublayout", exact: true }).click();
  await expect(tree.locator(".builder-structure-element-card").filter({ hasText: "Divider" })).toHaveCount(1);
  await tree.locator(".builder-structure-row-header").first().click();
  await expect(inspector.locator("[data-canonical-owner='BuilderRow']")).toBeVisible();
  await inspector.getByRole("button", { name: "Back to Sublayout", exact: true }).click();
  await page.setViewportSize({ width: 390, height: 900 });
  expect(await tree.evaluate(e => e.scrollWidth <= e.clientWidth)).toBe(true);
});
