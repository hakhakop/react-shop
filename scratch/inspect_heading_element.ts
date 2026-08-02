import { chromium } from "@playwright/test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const email = "header-parity-20260722@example.test";
const password = "HeaderParity!2026";
const builderUrl = "http://localhost:3000/app/websites/header-parity-site/builder?page=home";

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto("http://localhost:3000/login");
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await page.waitForURL(/\/app(?:\?|$)/);

  await page.goto(builderUrl);
  await page.waitForSelector(".builder-preview-shell");

  const info = await page.evaluate(() => {
    const selectedBlockEl = document.querySelector(".builder-preview-layout-block.is-selected-block") || document.querySelector(".shop-builder-column-block--heading") || document.querySelector("h2, h3");
    
    // Inspect all layout blocks in the builder
    const blocks = Array.from(document.querySelectorAll(".builder-preview-layout-block"));
    const blockSummaries = blocks.map((blockEl) => {
      const isSelected = blockEl.classList.contains("is-selected-block");
      const headings = Array.from(blockEl.querySelectorAll("h1, h2, h3, h4, h5, h6"));
      return {
        isSelected,
        dataKind: blockEl.getAttribute("data-kind") || blockEl.getAttribute("data-block-kind"),
        blockClasses: blockEl.className,
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
                      cssText: rule.cssText,
                    });
                  }
                }
              }
            } catch (e) {}
          }
          return {
            tag: h.tagName.toLowerCase(),
            text: h.textContent?.substring(0, 40),
            className: h.className,
            computedFontSize: style.fontSize,
            matchedRules,
          };
        }),
      };
    });

    return { blockSummaries };
  });

  console.log(JSON.stringify(info, null, 2));
  await browser.close();
}

main().catch(console.error);
