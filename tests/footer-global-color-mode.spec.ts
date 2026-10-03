import { expect, test } from "@playwright/test";

test("Makai footer links use the imported YOOtheme dark-mode foreground palette", async ({ page }) => {
  await page.goto("/makai");

  const footer = page.locator("footer.site-footer-builder");
  await expect(footer).toBeVisible();
  await expect(footer).toHaveAttribute("data-section-default-color-mode", "dark");

  const defaultSection = footer.locator(".shop-builder-section.uk-section-default").first();
  const firstTextLink = defaultSection.locator("a.uk-link-text").first();
  await expect.poll(() => defaultSection.evaluate((element) => getComputedStyle(element).backgroundColor)).toBe("rgb(255, 255, 255)");
  await expect.poll(() => defaultSection.evaluate((element) => getComputedStyle(element).color)).toBe("rgb(113, 113, 113)");
  await expect(firstTextLink).toHaveCSS("color", "rgb(113, 113, 113)");
});
