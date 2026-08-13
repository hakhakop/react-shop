import { expect, test } from "@playwright/test";

const builderUrl = "/app/websites/header-parity-site/builder?page=home";
const previewUrl = "/app/websites/header-parity-site/preview?page=home";
const email = "header-parity-20260722@example.test";
const password = "HeaderParity!2026";

test("Global Styles owns editable, ordered YOOtheme breakpoint tiers", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/app(?:\?|$)/);
  await page.goto(builderUrl);
  await expect(page.locator(".builder-preview-shell").first()).toBeVisible();

  await page.getByRole("button", { name: "Website", exact: true }).click();
  await page.getByRole("button", { name: "IMPORT YOOTHEME LESS", exact: true }).click();
  await page.locator("textarea").fill(`
    @global-primary-background: #1991EE;
    @breakpoint-small: 640px;
    @breakpoint-medium: 960px;
    @breakpoint-large: 1200px;
    @breakpoint-xlarge: 1600px;
  `);
  await page.getByRole("button", { name: "Import Style Tokens", exact: true }).click();

  await page.getByRole("button", { name: /Global Typography, colors/ }).click();
  const editor = page.getByTestId("global-editor-global");
  await expect(editor).toBeVisible();
  await expect(editor.getByLabel("Small breakpoint value", { exact: true })).toHaveValue("640");
  await expect(editor.getByLabel("Medium breakpoint value", { exact: true })).toHaveValue("960");
  await expect(editor.getByLabel("Large breakpoint value", { exact: true })).toHaveValue("1200");
  await expect(editor.getByLabel("XLarge breakpoint value", { exact: true })).toHaveValue("1600");
  const pageRoot = page.locator('[data-builder-page-root]:not(footer)');
  await expect(pageRoot).toHaveAttribute("data-responsive-breakpoint-policy", "s640-m960-l1200-xl1600");

  await editor.getByLabel("Small breakpoint value", { exact: true }).fill("700");
  await expect.poll(() => page.locator(".builder-dashboard").evaluate((root) => getComputedStyle(root).getPropertyValue("--uk-breakpoint-small").trim())).toBe("700px");
  await expect(pageRoot).toHaveAttribute("data-responsive-breakpoint-policy", "s700-m960-l1200-xl1600");
  await expect.poll(() => page.locator("style[data-responsive-breakpoint-policy]").evaluate((style) => style.textContent)).toContain("@media (min-width:700px)");

  await editor.getByLabel("Medium breakpoint value", { exact: true }).fill("650");
  await expect(editor.getByRole("alert")).toContainText("Small < Medium < Large < X-Large");
  await editor.getByLabel("Medium breakpoint value", { exact: true }).blur();
  await expect(editor.getByLabel("Medium breakpoint value", { exact: true })).toHaveValue("960");

  await page.getByRole("button", { name: "Publish Settings", exact: true }).click();
  await expect(page.getByText("Website settings published", { exact: true })).toBeVisible();
  await page.goto(previewUrl);
  await expect.poll(() => page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--uk-breakpoint-small").trim())).toBe("700px");
  await expect(page.locator('[data-builder-page-root]:not(footer)')).toHaveAttribute("data-responsive-breakpoint-policy", "s700-m960-l1200-xl1600");
  await expect.poll(() => page.locator("style[data-responsive-breakpoint-policy]").evaluate((style) => style.textContent)).toContain("@media (min-width:700px)");
});
