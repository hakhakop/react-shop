import { expect, test, type FrameLocator, type Page } from "@playwright/test";
import source from "./fixtures/yootheme-compatibility/sources/devstack-layout.json";

const importFile = {
  name: "devstack-layout.json",
  mimeType: "application/json",
  buffer: Buffer.from(JSON.stringify(source)),
};

async function expectDevStackNav(page: Page | FrameLocator) {
  const nav = page.locator(".shop-builder-nav");
  await expect(nav).toBeVisible();
  await expect(nav.locator(".uk-nav-subtitle")).toHaveCount(7);
  await expect(nav.locator("img")).toHaveCount(7);
  await expect(nav.getByRole("link", { name: /Deployment/ })).toHaveAttribute(
    "href",
    "/feature-1",
  );
  await expect(nav.getByRole("link", { name: /Integrations/ })).toHaveAttribute(
    "href",
    "/feature-7",
  );
  const grid = nav.locator(":scope > .uk-grid[uk-grid]");
  await expect(grid).toHaveCount(1);
  await expect(grid.locator(":scope > div")).toHaveCount(2);
  await expect(
    nav.locator(":scope > .uk-grid[uk-grid] .el-link > .uk-grid.uk-grid-small[uk-grid]"),
  ).toHaveCount(7);
}

async function expectDevStackPhoneGrid(page: Page | FrameLocator) {
  const grid = page.locator(".shop-builder-nav > .uk-grid[uk-grid]");
  await expect(grid).toBeVisible();
  await expect(grid).toHaveClass(/uk-child-width-expand/);
  const columns = grid.locator(":scope > div");
  await expect(columns).toHaveCount(2);
  await expect.poll(async () => columns.evaluateAll((nodes) => {
    const [first, second] = nodes.map((node) => node.getBoundingClientRect());
    return {
      display: getComputedStyle(nodes[0].parentElement!).display,
      sameRow: Math.abs(first.y - second.y) < 1,
      ordered: second.x > first.x,
    };
  })).toEqual({ display: "flex", sameRow: true, ordered: true });
}

test("DevStack Nav imports, publishes, and survives a fresh Builder and storefront load", async ({
  browser,
  context,
  page,
}) => {
  const registration = await page.request.post("/api/auth/register", {
    data: {
      email: "import@example.test",
      name: "Import Acceptance",
      password: "ImportAcceptance!2026",
    },
  });
  expect(registration.ok()).toBeTruthy();

  await page.goto("/dashboard?page=home");
  await page.getByRole("button", { name: "Element Library", exact: true }).click();
  const library = page.getByRole("dialog", { name: "Library" });
  await expect(library).toBeVisible();
  await library
    .locator("label")
    .filter({ hasText: "Import YOOtheme JSON to Library" })
    .locator('input[type="file"]')
    .setInputFiles(importFile);
  await library.getByLabel("Library item name").fill("DevStack layout");
  await library.getByRole("button", { name: "Import to Library", exact: true }).click();
  const savedTemplate = library
    .locator(".builder-template-row")
    .filter({ hasText: "DevStack layout" });
  await expect(savedTemplate).toBeVisible();
  await savedTemplate.getByRole("button", { name: "Select", exact: true }).click();
  await library.getByRole("button", { name: "Replace Layout", exact: true }).click();

  await page.getByRole("button", { name: "Publish", exact: true }).click();
  await expect(page.getByText("Published successfully", { exact: true })).toBeVisible();

  const savedResponse = await page.request.get("/api/builder-layouts?key=home");
  expect(savedResponse.ok()).toBeTruthy();
  const saved = await savedResponse.json();
  const savedNav = saved.layout.sections[0].rows[0].columns[1].elements[0];
  expect(savedNav).toMatchObject({
    kind: "nav",
    navColumns: 2,
    navGridColumnGap: "large",
    navGridRowGap: "large",
    imageWidth: "50",
  });
  expect(savedNav.navItems).toHaveLength(1);
  expect(savedNav.navItems[0].dynamicContext).toBeTruthy();

  // A new context proves the Builder cannot recover this document from the
  // imported browser draft. It must read the document just written to disk.
  const freshBuilderContext = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
  });
  await freshBuilderContext.addCookies(await context.cookies());
  const freshBuilder = await freshBuilderContext.newPage();
  await freshBuilder.goto("/dashboard?page=home");
  await expect(freshBuilder.getByRole("heading", { name: "Home", exact: true })).toBeVisible();
  const builderFrame = freshBuilder.frameLocator(
    'iframe[title="Canonical tenant Builder canvas"]',
  );
  await expectDevStackNav(builderFrame);
  const phonePreview = freshBuilder.getByRole("button", { name: "Phone preview", exact: true });
  await phonePreview.click();
  await expect(phonePreview).toHaveAttribute("aria-pressed", "true");
  await expectDevStackPhoneGrid(builderFrame);

  const storefrontContext = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
  });
  const storefront = await storefrontContext.newPage();
  await storefront.goto("/");
  await expectDevStackNav(storefront);
  await storefront.setViewportSize({ width: 390, height: 900 });
  await expectDevStackPhoneGrid(storefront);
  expect(await storefront.evaluate(() =>
    document.documentElement.scrollWidth <= document.documentElement.clientWidth,
  )).toBe(true);

  await storefrontContext.close();
  await freshBuilderContext.close();
});
