import { expect, test, type Page } from "@playwright/test";

const surfaces = [
  { name: "storefront", url: "/jack" },
];

async function expectDesktopHeader(page: Page) {
  const header = page.locator("header.site-header").first();
  await expect(header).toHaveAttribute("data-header-active-variant", "desktop");
  await expect(header).toHaveAttribute("data-header-mobile-breakpoint", "1200px");
  await expect(header).toHaveAttribute("data-header-behavior", "sticky-on-scroll-up");
  await expect(header.locator('[data-header-element-id="header-logo"]')).toBeVisible();
  await expect(header.locator('[data-header-element-id="header-navigation"]')).toBeVisible();
  await expect(header.locator('[data-header-element-id="header-mobile-logo"]')).toHaveCount(0);
  await expect(header.locator(".site-header-nav-container.is-canonical-mobile")).toHaveCount(0);
}

async function expectMobileHeader(page: Page) {
  const header = page.locator("header.site-header").first();
  await expect(header).toHaveAttribute("data-header-active-variant", "mobile");
  await expect(header).toHaveAttribute("data-header-mobile-breakpoint", "1200px");
  await expect(header).toHaveAttribute("data-header-behavior", "static");
  await expect(header.locator('[data-header-element-id="header-mobile-logo"]')).toBeVisible();
  await expect(header.locator('[data-header-element-id="header-mobile-navigation"]')).toBeVisible();
  await expect(header.locator('[data-header-element-id="header-logo"]')).toHaveCount(0);
  await expect(header.locator(".site-header-nav-container.is-canonical-mobile .site-header-mobile-menu-toggle")).toBeVisible();
}

for (const surface of surfaces) {
  test(`${surface.name} switches the same canonical Header at the imported breakpoint`, async ({ page }) => {
    await page.setViewportSize({ width: 1201, height: 900 });
    await page.goto(surface.url);
    await expectDesktopHeader(page);

    await page.setViewportSize({ width: 1200, height: 900 });
    await expectMobileHeader(page);
    const mobileToggle = page.locator("header.site-header .site-header-nav-container.is-canonical-mobile .site-header-mobile-menu-toggle");
    await mobileToggle.click();
    await expect(page.locator("header.site-header .site-header-mobile-drawer-wrapper")).toHaveClass(/is-open/);
    await expect(page.locator("header.site-header .mobile-drawer-nav-items")).toContainText(/Home/i);
    const closeButton = page.getByRole("button", { name: "Close menu" });
    await expect(closeButton).toBeVisible();
    await closeButton.click();
    await expect(page.locator("header.site-header .site-header-mobile-drawer-wrapper")).not.toHaveClass(/is-open/);

    await page.getByRole("button", { name: "Open search" }).click();
    await expect(page.getByPlaceholder("Search products, categories, brands...")).toBeVisible();
    await page.getByRole("button", { name: "Esc" }).click();
    await expect(page.getByPlaceholder("Search products, categories, brands...")).toHaveCount(0);

    await page.reload();
    await expectMobileHeader(page);

    await page.setViewportSize({ width: 1280, height: 900 });
    await expectDesktopHeader(page);
  });
}
