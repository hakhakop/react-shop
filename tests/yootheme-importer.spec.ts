import { expect, test } from "@playwright/test";

const builderUrl = "/app/websites/header-parity-site/builder?page=home";
const previewUrl = "/app/websites/header-parity-site/preview?page=home";
const email = "header-parity-20260722@example.test";
const password = "HeaderParity!2026";
const zipPath = "/Users/hakobjaghatspanyan/Downloads/DevStack.zip";
const themePath = "/Users/hakobjaghatspanyan/Downloads/theme.less";
const stylePath = "/Users/hakobjaghatspanyan/Downloads/style.less";

test("imports DevStack Light Blue as semantic globals with builder/frontend parity", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/app(?:\?|$)/);

  await page.goto(builderUrl);
  await expect(page.locator(".builder-preview-shell").first()).toBeVisible();
  await page.getByRole("button", { name: "Website", exact: true }).click();
  await page.getByRole("button", { name: "Import LESS", exact: true }).click();

  const importer = page.getByTestId("yootheme-import-panel");
  await expect(importer).toBeVisible();
  await importer.locator('input[type="file"]').setInputFiles([zipPath, themePath, stylePath]);
  await expect(importer).toContainText("DevStack Light Blue");
  await expect(importer).toContainText("90 mapped");
  await expect(importer).toContainText("precedence conflicts");
  await expect(importer).toContainText("unsupported/report-only");
  await expect(importer).toContainText("@global-color");
  await expect(importer).toContainText("#2D3847");

  await importer.getByRole("button", { name: "Apply DevStack Light Blue", exact: true }).click();
  await expect.poll(() => page.locator(".builder-dashboard").evaluate((root) => {
    const styles = getComputedStyle(root);
    return {
      primary: styles.getPropertyValue("--uk-global-primary-color").trim(),
      font: styles.getPropertyValue("--uk-global-font-family").trim(),
      card: styles.getPropertyValue("--uk-card-default-background").trim(),
      button: styles.getPropertyValue("--uk-button-primary-background").trim(),
    };
  })).toEqual({ primary: "#1991EE", font: "Manrope", card: "#EDF1FA", button: "#1991EE" });

  await expect(page.getByText("Website preview updated", { exact: true })).toBeVisible();
  const publishResponse = page.waitForResponse((response) => response.url().includes("/api/builder-shell") && response.request().method() === "POST");
  await page.getByRole("button", { name: "Publish Settings", exact: true }).click();
  await expect((await publishResponse).ok()).toBeTruthy();
  await expect(page.getByText("Website settings published", { exact: true })).toBeVisible();

  await page.goto(previewUrl);
  await expect.poll(() => page.evaluate(() => ({
    primary: getComputedStyle(document.documentElement).getPropertyValue("--uk-global-primary-color").trim(),
    font: getComputedStyle(document.documentElement).getPropertyValue("--uk-global-font-family").trim(),
    card: getComputedStyle(document.documentElement).getPropertyValue("--uk-card-default-background").trim(),
    button: getComputedStyle(document.documentElement).getPropertyValue("--uk-button-primary-background").trim(),
  }))).toEqual({ primary: "#1991EE", font: "Manrope", card: "#EDF1FA", button: "#1991EE" });
});
