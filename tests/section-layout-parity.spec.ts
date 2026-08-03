import { expect, test } from "@playwright/test";

const email = "header-parity-20260722@example.test";
const password = "HeaderParity!2026";
const builderUrl = "/app/websites/header-parity-site/builder?page=home";
const previewUrl = "/app/websites/header-parity-site/preview?page=home";
const rootBuilderUrl = "/dashboard?page=page%3Anew-clean-page";
const rootPreviewUrl = "/new-clean-page";

async function relativeLeft(page: import("@playwright/test").Page, child: string, parent: string) {
  return page.locator(child).evaluate(
    (element, parentSelector) => {
      const parentElement = document.querySelector(parentSelector as string);
      if (!parentElement) throw new Error(`Missing parent: ${parentSelector}`);
      return element.getBoundingClientRect().left - parentElement.getBoundingClientRect().left;
    },
    parent,
  );
}

async function centerOffset(page: import("@playwright/test").Page, child: string, parent: string) {
  return page.locator(child).evaluate(
    (element, parentSelector) => {
      const parentElement = document.querySelector(parentSelector as string);
      if (!parentElement) throw new Error(`Missing parent: ${parentSelector}`);
      const childRect = element.getBoundingClientRect();
      const parentRect = parentElement.getBoundingClientRect();
      return Math.abs(
        childRect.left + childRect.width / 2 - (parentRect.left + parentRect.width / 2),
      );
    },
    parent,
  );
}

test.beforeEach(async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/app(?:\?|$)/);
});

test("layout sections keep the canonical container track without editor row surfaces", async ({
  page,
  context,
}) => {
  await page.goto(builderUrl);
  const builderSection = page.locator(
    '.builder-preview-section[data-builder-section-id="hero"]',
  );
  const builderContent = builderSection.locator(
    ":scope > .shop-builder-section-content",
  );
  const builderRow = builderSection.locator(
    ":scope > .shop-builder-section-content > .builder-preview-content-layout-grid > .builder-main-row-frame > .builder-preview-content-row",
  );

  await expect(builderSection).toBeVisible();
  await expect(builderContent).toHaveClass(/uk-container/);
  await expect(builderRow).toBeVisible();
  await expect
    .poll(() => builderRow.evaluate((element) => getComputedStyle(element).backgroundColor))
    .toMatch(/rgba\(0, 0, 0, 0\)|transparent/);

  const frontend = await context.newPage();
  await frontend.goto(previewUrl);
  const frontendSection = frontend.locator(
    '.shop-builder-section[data-builder-section-id="hero"]',
  );
  const frontendContent = frontendSection.locator(
    ":scope > .shop-builder-section-content",
  );
  const frontendRow = frontendSection.locator(
    ":scope > .shop-builder-section-content > .shop-builder-content-layout-rows-wrapper > div > .shop-builder-content-row",
  );

  await expect(frontendSection).toBeVisible();
  await expect(frontendContent).toHaveClass(/uk-container/);
  await expect(frontendRow).toBeVisible();

  const [builderInset, frontendInset] = await Promise.all([
    relativeLeft(
      page,
      '.builder-preview-section[data-builder-section-id="hero"] > .shop-builder-section-content > .builder-preview-content-layout-grid > .builder-main-row-frame > .builder-preview-content-row',
      '.builder-preview-section[data-builder-section-id="hero"]',
    ),
    relativeLeft(
      frontend,
      '.shop-builder-section[data-builder-section-id="hero"] > .shop-builder-section-content > .shop-builder-content-layout-rows-wrapper > div > .shop-builder-content-row',
      '.shop-builder-section[data-builder-section-id="hero"]',
    ),
  ]);
  expect(Math.abs(builderInset - frontendInset)).toBeLessThan(8);
});

test("default Alert and Hero content share one horizontal section track", async ({
  page,
  context,
}) => {
  await page.goto(rootBuilderUrl);

  const builderSection = page.locator(
    ".builder-preview-section:has(.builder-preview-layout-block.is-alert):has(.builder-preview-layout-block.is-hero)",
  ).first();
  const builderHeroShell = builderSection.locator(
    ".builder-preview-layout-block.is-hero",
  ).first();
  const builderAlert = builderSection.locator(
    ".builder-preview-layout-block.is-alert .uk-alert",
  ).first();
  const builderHero = builderHeroShell.locator(
    ".shop-builder-column-block--hero",
  );

  await expect.poll(() => builderAlert.count(), { timeout: 15_000 }).toBe(1);
  await expect.poll(() => builderHero.count(), { timeout: 15_000 }).toBe(1);
  await expect(builderAlert).toBeVisible();
  await expect(builderHero).toBeVisible();
  await expect(builderHeroShell).toHaveClass(/is-padding-sm/);
  await expect
    .poll(async () => {
      const [alertLeft, heroLeft] = await Promise.all([
        builderAlert.evaluate((element) => element.getBoundingClientRect().left),
        builderHero.evaluate((element) => element.getBoundingClientRect().left),
      ]);
      return Math.abs(alertLeft - heroLeft);
    })
    .toBeLessThan(2);

  const frontend = await context.newPage();
  await frontend.goto(rootPreviewUrl);
  const frontendSection = frontend.locator(
    ".shop-builder-section:has(.shop-builder-column-block--alert):has(.shop-builder-column-block--hero)",
  ).first();
  const frontendHeroShell = frontendSection.locator(
    ".shop-builder-element-shell:has(.shop-builder-column-block--hero)",
  ).first();
  const frontendAlert = frontendSection.locator(
    ".shop-builder-column-block--alert .uk-alert",
  ).first();
  const frontendHero = frontendHeroShell.locator(
    ".shop-builder-column-block--hero",
  );
  const frontendRow = frontendSection.locator(".shop-builder-content-row");

  await expect.poll(() => frontendAlert.count(), { timeout: 15_000 }).toBe(1);
  await expect.poll(() => frontendHero.count(), { timeout: 15_000 }).toBe(1);
  await expect(frontendAlert).toBeVisible();
  await expect(frontendHero).toBeVisible();
  await expect(frontendRow).toBeVisible();
  await expect(frontendHeroShell).toHaveClass(/is-padding-sm/);
  await expect
    .poll(async () => {
      const [alertLeft, heroLeft] = await Promise.all([
        frontendAlert.evaluate((element) => element.getBoundingClientRect().left),
        frontendHero.evaluate((element) => element.getBoundingClientRect().left),
      ]);
      return Math.abs(alertLeft - heroLeft);
    })
    .toBeLessThan(2);

  await expect
    .poll(() =>
      centerOffset(
        frontend,
        ".shop-builder-section:has(.shop-builder-column-block--alert):has(.shop-builder-column-block--hero) .shop-builder-content-row",
        ".shop-builder-section:has(.shop-builder-column-block--alert):has(.shop-builder-column-block--hero)",
      ),
    )
    .toBeLessThan(2);
});
