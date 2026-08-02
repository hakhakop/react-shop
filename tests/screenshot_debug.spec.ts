import { expect, test } from "@playwright/test";

const email = "header-parity-20260722@example.test";
const password = "HeaderParity!2026";
const builderUrl = "/app/websites/header-parity-site/builder?page=home";

test("Debug screenshot and exact computed font size for heading element", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/app(?:\?|$)/);

  await page.goto(builderUrl);
  await expect(page.locator(".builder-preview-shell").first()).toBeVisible();

  // Find the heading block
  const headingBlock = page.locator(".shop-builder-column-block--heading").first();
  await expect(headingBlock).toBeVisible();

  await headingBlock.click();

  const elementDetails = await page.evaluate(() => {
    const headingEl = document.querySelector(".shop-builder-column-block--heading h1, .shop-builder-column-block--heading h2, .shop-builder-column-block--heading h3, .shop-builder-column-block--heading h4, .shop-builder-column-block--heading h5, .shop-builder-column-block--heading h6");
    if (!headingEl) return null;

    const rect = headingEl.getBoundingClientRect();
    const style = getComputedStyle(headingEl);

    const allRules: Array<{ selector: string; fontSize: string; cssText: string }> = [];
    for (const sheet of Array.from(document.styleSheets)) {
      try {
        for (const rule of Array.from(sheet.cssRules || [])) {
          if (rule instanceof CSSStyleRule && headingEl.matches(rule.selectorText)) {
            if (rule.style.fontSize) {
              allRules.push({
                selector: rule.selectorText,
                fontSize: rule.style.fontSize,
                cssText: rule.cssText,
              });
            }
          }
        }
      } catch (e) {}
    }

    return {
      tag: headingEl.tagName.toLowerCase(),
      className: headingEl.className,
      inlineStyle: headingEl.getAttribute("style"),
      rect: { width: rect.width, height: rect.height },
      computedFontSize: style.fontSize,
      computedLineHeight: style.lineHeight,
      allFontSizeRules: allRules,
    };
  });

  console.log("\n=======================================================");
  console.log("EXACT HEADING ELEMENT COMPUTED STYLE & CSS RULES:");
  console.log(JSON.stringify(elementDetails, null, 2));
  console.log("=======================================================\n");

  await page.screenshot({ path: "scratch/debug_heading_screenshot.png", fullPage: true });
});
