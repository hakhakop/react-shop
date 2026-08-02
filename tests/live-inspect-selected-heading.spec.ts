import { expect, test } from "@playwright/test";

const email = "header-parity-20260722@example.test";
const password = "HeaderParity!2026";
const builderUrl = "/app/websites/header-parity-site/builder?page=home";

test("Live inspect selected existing element on builder page", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/app(?:\?|$)/);

  await page.goto(builderUrl);
  await expect(page.locator(".builder-preview-shell").first()).toBeVisible();

  // Find the block with class shop-builder-column-block--heading
  const headingBlock = page.locator(".shop-builder-column-block--heading").first();
  const exists = await headingBlock.count();

  console.log("Heading blocks count on builder page:", exists);

  if (exists > 0) {
    await headingBlock.click();
    const toolsEdit = page
      .locator(".builder-preview-layout-block.is-selected-block .builder-preview-block-tools")
      .getByRole("button", { name: "Edit element" });
    if (await toolsEdit.isVisible()) {
      await toolsEdit.click();
    }
  }

  const inspectorInfo = await page.evaluate(() => {
    const selectedBlock = document.querySelector(".builder-preview-layout-block.is-selected-block");
    const inspector = document.querySelector(".builder-floating-inspector");
    const labels = Array.from(inspector?.querySelectorAll("label, span, button") || []).map(
      (el) => el.textContent?.trim(),
    );
    const headingEl = selectedBlock?.querySelector("h1, h2, h3, h4, h5, h6") || document.querySelector(".shop-builder-column-block--heading h1, .shop-builder-column-block--heading h2, .shop-builder-column-block--heading h3");

    const matchedRules: Array<{ selector: string; fontSize: string }> = [];
    if (headingEl) {
      for (const sheet of Array.from(document.styleSheets)) {
        try {
          for (const rule of Array.from(sheet.cssRules || [])) {
            if (rule instanceof CSSStyleRule && headingEl.matches(rule.selectorText)) {
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
    }

    return {
      selectedBlockClass: selectedBlock?.className || "none",
      selectedBlockKind: selectedBlock?.getAttribute("data-kind") || selectedBlock?.getAttribute("data-block-kind") || "unknown",
      headingTag: headingEl?.tagName.toLowerCase() || "none",
      headingClass: headingEl?.className || "none",
      headingText: headingEl?.textContent?.trim().substring(0, 50) || "",
      headingComputedFontSize: headingEl ? getComputedStyle(headingEl).fontSize : "none",
      matchedRules,
      inspectorLabels: labels.filter(Boolean).slice(0, 30),
    };
  });

  console.log("\n=======================================================");
  console.log("INSPECTOR & SELECTED ELEMENT REPORT:");
  console.log(JSON.stringify(inspectorInfo, null, 2));
  console.log("=======================================================\n");
});
