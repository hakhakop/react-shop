import { expect, test } from "@playwright/test";

const email = "header-parity-20260722@example.test";
const password = "HeaderParity!2026";
const builderUrl = "/app/websites/header-parity-site/builder?page=home";

test("inspect existing builder blocks and heading elements", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/app(?:\?|$)/);

  await page.goto(builderUrl);
  await expect(page.locator(".builder-preview-shell").first()).toBeVisible();

  const info = await page.evaluate(() => {
    const blocks = Array.from(document.querySelectorAll(".builder-preview-layout-block"));
    return blocks.map((blockEl, idx) => {
      const isSelected = blockEl.classList.contains("is-selected-block");
      const headings = Array.from(blockEl.querySelectorAll("h1, h2, h3, h4, h5, h6"));
      return {
        idx,
        isSelected,
        className: blockEl.className,
        headings: headings.map((h) => {
          const style = getComputedStyle(h);
          const matchedRules = [];
          for (const sheet of Array.from(document.styleSheets)) {
            try {
              for (const rule of Array.from(sheet.cssRules || [])) {
                if (rule instanceof CSSStyleRule && h.matches(rule.selectorText)) {
                  if (rule.style.fontSize) {
                    matchedRules.push({
                      selector: rule.selectorText,
                      fontSize: rule.style.fontSize,
                    });
                  }
                }
              }
            } catch (e) {}
          }
          return {
            tag: h.tagName.toLowerCase(),
            text: h.textContent?.trim().substring(0, 50),
            className: h.className,
            computedFontSize: style.fontSize,
            matchedRules,
          };
        }),
      };
    });
  });

  console.log("=== EXISTING BUILDER BLOCKS ===");
  console.log(JSON.stringify(info, null, 2));
});
