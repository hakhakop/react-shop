import { expect, test, type Page } from "@playwright/test";
import { waitForSeededBuilderLayout } from "./builderFixture";

const email = "header-parity-20260722@example.test";
const password = "HeaderParity!2026";
const builderUrl = "/app/websites/header-parity-site/builder?page=home";

async function signIn(page: Page) {
  await page.goto("/login");
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/app(?:\?|$)/);
}

async function addBlock(page: any, label: string) {
  await page.locator(".builder-sidebar-nav-tile", { hasText: "Blocks" }).first().click();
  await page.locator(".builder-element-library-search input").fill(label);
  const card = page.locator(".builder-element-library-card").filter({ has: page.getByText(label, { exact: true }) }).first();
  await expect(card).toBeVisible();
  await card.click();
  const selected = page.locator(".builder-preview-layout-block.is-selected-block").last();
  await expect(selected).toBeVisible();
  await selected.locator(".builder-preview-block-tools").getByRole("button", { name: "Edit element" }).dispatchEvent("click");
  return page.locator(".builder-floating-inspector");
}

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 2400, height: 1400 });
  await signIn(page);
});

test("Hero exposes semantic content/actions and keeps builder/frontend parity", async ({ page }) => {
  await page.goto(builderUrl);
  await waitForSeededBuilderLayout(page);
  const inspector = await addBlock(page, "Hero");
  await expect(inspector.locator('[data-uikit-capability="hero-content"]')).toBeVisible();
  await inspector.getByLabel("Hero eyebrow").fill("Proof eyebrow");
  await inspector.getByLabel("Hero heading").fill("Proof heading");
  await inspector.getByLabel("Hero body").fill("Proof body");
  await inspector.getByLabel("Primary action label").fill("Primary proof");
  await inspector.getByLabel("Primary action URL").fill("/primary-proof");
  await inspector.getByLabel("Secondary action label").fill("Secondary proof");
  await inspector.getByLabel("Secondary action URL").fill("/secondary-proof");
  await inspector.getByRole("button", { name: "Styling", exact: true }).click();
  await inspector.getByRole("radiogroup", { name: "Primary action variant" }).getByRole("radio", { name: "Secondary" }).click();
  await inspector.getByRole("radiogroup", { name: "Primary action size" }).getByRole("radio", { name: "Large" }).click();
  await inspector.getByLabel("Hero heading element").selectOption("h1");
  await inspector.getByLabel("Hero heading style").selectOption("large");
  await expect(page.locator(".shop-builder-column-block--hero h1").filter({ hasText: "Proof heading" }).last()).toBeVisible();
  await expect(page.locator(".shop-builder-column-block--hero").last().getByText("Primary proof", { exact: true })).toBeVisible();
  await expect(page.locator(".shop-builder-column-block--hero").last().getByText("Secondary proof", { exact: true })).toBeVisible();
  const builderPrimary = page.locator(".shop-builder-column-block--hero").last().locator(".uk-button").first();
  await expect(builderPrimary).toHaveClass(/uk-button-secondary/);
  await expect(builderPrimary).toHaveClass(/uk-button-large/);
  await page.getByRole("button", { name: "Publish", exact: true }).click();
  await expect(page.locator(".builder-publish-celebration").getByText("Published successfully", { exact: true })).toBeVisible();
  const frontend = await page.context().newPage();
  await frontend.goto("/app/websites/header-parity-site/preview?page=home");
  await expect(frontend.locator(".shop-builder-column-block--hero h1").filter({ hasText: "Proof heading" }).last()).toBeVisible();
  await expect(frontend.locator(".shop-builder-column-block--hero").last().getByText("Primary proof", { exact: true })).toBeVisible();
  await expect(frontend.locator(".shop-builder-column-block--hero").last().getByText("Secondary proof", { exact: true })).toBeVisible();
  await expect(frontend.locator(".shop-builder-column-block--hero").last().locator(".uk-button").first()).toHaveClass(/uk-button-secondary/);
  await expect(frontend.locator(".shop-builder-column-block--hero").last().locator(".uk-button").first()).toHaveClass(/uk-button-large/);
});

test("Grid supports item CRUD, layout controls, and shared card semantics", async ({ page }) => {
  await page.goto(builderUrl);
  await waitForSeededBuilderLayout(page);
  const inspector = await addBlock(page, "Grid");
  await expect(inspector.locator('[data-uikit-capability="grid-content"]')).toBeVisible();
  const before = await inspector.locator("[data-grid-item-id]").count();
  await inspector.getByRole("button", { name: /Add item/ }).click();
  await expect(inspector.locator("[data-grid-item-id]")).toHaveCount(before + 1);
  await inspector.locator("[data-grid-item-id]").first().getByRole("button", { name: "Copy grid item 1", exact: true }).click();
  await expect(inspector.locator("[data-grid-item-id]")).toHaveCount(before + 2);
  await inspector.locator("[data-grid-item-id]").nth(1).getByRole("button", { name: "Delete grid item 2", exact: true }).click();
  await expect(inspector.locator("[data-grid-item-id]")).toHaveCount(before + 1);
  await inspector.locator("[data-grid-item-id]").first().getByRole("button", { name: "Delete grid item 1", exact: true }).click();
  await expect(inspector.locator("[data-grid-item-id]")).toHaveCount(before);
  await inspector.getByRole("button", { name: /Add item/ }).click();
  await expect(inspector.locator("[data-grid-item-id]")).toHaveCount(before + 1);
  await inspector.getByRole("button", { name: "Styling", exact: true }).click();
  await inspector.getByLabel("Grid columns").selectOption("2");
  await inspector.getByLabel("Grid gutter").getByRole("radio").filter({ hasText: "Small" }).click();
  await inspector.getByLabel("Grid item renderer").getByRole("radio").filter({ hasText: "Card" }).click();
  await inspector.getByRole("radiogroup", { name: "Grid button variant" }).getByRole("radio", { name: "Secondary" }).click();
  await inspector.getByRole("radiogroup", { name: "Grid button size" }).getByRole("radio", { name: "Large" }).click();
  const builderGrid = page.locator(".builder-preview-layout-block.is-selected-block .shop-builder-column-block--grid");
  await expect(builderGrid.locator(".uk-card").first()).toBeVisible();
  const builderGridActions = builderGrid.locator(".shop-builder-grid-action");
  await expect(builderGridActions.first()).toHaveClass(/uk-button-secondary/);
  await expect(builderGridActions.first()).toHaveClass(/uk-button-large/);

  await inspector.getByRole("button", { name: "Content", exact: true }).click();
  await inspector.getByRole("radiogroup", { name: "Grid source" }).getByRole("radio", { name: "Products" }).click();
  await expect.poll(() => builderGrid.locator(".shop-builder-grid-action").count()).toBeGreaterThan(0);
  await inspector.getByRole("button", { name: "Styling", exact: true }).click();
  const builderProductAction = builderGrid.locator(".shop-builder-grid-action").first();
  const readButtonMetrics = (button: typeof builderProductAction) => button.evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      height: Number.parseFloat(style.height),
      fontSize: Number.parseFloat(style.fontSize),
      paddingX: Number.parseFloat(style.paddingLeft) + Number.parseFloat(style.paddingRight),
    };
  });
  const sizes = {} as Record<"small" | "default" | "large", Awaited<ReturnType<typeof readButtonMetrics>>>;
  for (const value of ["small", "default", "large"] as const) {
    await inspector.getByRole("radiogroup", { name: "Grid button size" }).getByRole("radio", { name: value.replace(/\b\w/g, (letter) => letter.toUpperCase()) }).click();
    sizes[value] = await readButtonMetrics(builderProductAction);
  }
  await expect(builderProductAction).toHaveClass(/uk-button-secondary/);
  await expect(builderProductAction).toHaveClass(/uk-button-large/);
  expect(sizes.small.height).toBeLessThan(sizes.default.height);
  expect(sizes.default.height).toBeLessThan(sizes.large.height);
  expect(sizes.small.paddingX).toBeLessThan(sizes.default.paddingX);
  expect(sizes.default.paddingX).toBeLessThan(sizes.large.paddingX);
  await page.getByRole("button", { name: "Publish", exact: true }).click();
  await expect(page.locator(".builder-publish-celebration").getByText("Published successfully", { exact: true })).toBeVisible();
  const frontend = await page.context().newPage();
  await frontend.goto("/app/websites/header-parity-site/preview?page=home");
  const frontendGrid = frontend.locator(".shop-builder-column-block--grid").filter({
    has: frontend.locator(".shop-builder-grid-action.uk-button-secondary.uk-button-large"),
  }).first();
  await expect(frontendGrid.locator(".uk-card").first()).toBeVisible();
  const frontendProductAction = frontendGrid.locator(".shop-builder-grid-action").first();
  await expect(frontendProductAction).toHaveClass(/uk-button-secondary/);
  await expect(frontendProductAction).toHaveClass(/uk-button-large/);
  expect(await readButtonMetrics(frontendProductAction)).toEqual(sizes.large);
});
