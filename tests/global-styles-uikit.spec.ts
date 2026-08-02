import { expect, test } from "@playwright/test";

const builderUrl = "/app/websites/header-parity-site/builder?page=home";
const previewUrl = "/app/websites/header-parity-site/preview?page=home";
const email = "header-parity-20260722@example.test";
const password = "HeaderParity!2026";
const zipPath = "/Users/hakobjaghatspanyan/Downloads/DevStack.zip";
const themePath = "/Users/hakobjaghatspanyan/Downloads/theme.less";
const stylePath = "/Users/hakobjaghatspanyan/Downloads/style.less";

test("semantic Global Styles editor exposes imported values and rolls back cleanly", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/app(?:\?|$)/);
  await page.goto(builderUrl);
  await expect(page.locator(".builder-preview-shell").first()).toBeVisible();
  const previousPrimary = await page.locator(".builder-dashboard").evaluate((root) => getComputedStyle(root).getPropertyValue("--uk-global-primary-color").trim());
  await page.getByRole("button", { name: "Website", exact: true }).click();

  await page.getByRole("button", { name: "Import LESS", exact: true }).click();
  const importer = page.getByTestId("yootheme-import-panel");
  await importer.locator('input[type="file"]').setInputFiles([zipPath, themePath, stylePath]);
  await expect(importer.getByRole("button", { name: "Apply DevStack Light Blue", exact: true })).toBeVisible();
  await importer.getByRole("button", { name: "Apply DevStack Light Blue", exact: true }).click();
  await expect(page.getByText("Website preview updated", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Global Style Editor", exact: true }).click();
  await page.getByRole("button", { name: /Global Typography, colors/ }).click();
  const editor = page.getByTestId("global-editor-global");
  await expect(editor).toBeVisible();
  await expect(editor.getByLabel("Primary background", { exact: true })).toHaveValue("#1991EE");
  await expect(editor.getByRole("combobox", { name: "Base font family" })).toHaveValue("Manrope");
  await expect(editor.getByLabel("Page background", { exact: true })).toHaveValue("#EDF1FA");
  await expect(editor.getByLabel("Primary background", { exact: true })).toHaveValue("#1991EE");
  await expect(editor.getByText("Not yet supported").first()).toBeVisible();

  await editor.getByRole("button", { name: "← Back", exact: true }).click();
  for (const [label, screen, marker] of [["Button", "button", "Primary background"], ["Card", "card", "Default background"], ["Heading", "heading", "Font family"], ["Accordion", "accordion", "Font size"]] as const) {
    await page.locator(".builder-design-nav-item").filter({ hasText: label }).click();
    await expect(page.getByTestId(`global-editor-${screen}`)).toBeVisible();
    await expect(page.getByTestId(`global-editor-${screen}`)).toContainText(marker);
    await page.getByTestId(`global-editor-${screen}`).getByRole("button", { name: "← Back", exact: true }).click();
  }
  await page.getByRole("button", { name: /Global Typography, colors/ }).click();
  const editorAgain = page.getByTestId("global-editor-global");

  await editorAgain.getByLabel("Primary background", { exact: true }).fill("#123456");
  await editorAgain.getByRole("combobox", { name: "Base font family" }).selectOption("Inter");
  await editorAgain.getByRole("spinbutton", { name: "Small margin value" }).fill("11");
  await editorAgain.getByRole("spinbutton", { name: "Page max width value" }).fill("1234");
  await editorAgain.getByRole("spinbutton", { name: "Radius value" }).first().fill("7");
  await editorAgain.getByRole("spinbutton", { name: "Default height value" }).fill("50");
  await expect.poll(() => page.locator(".builder-dashboard").evaluate((root) => {
    const styles = getComputedStyle(root);
    return {
      primary: styles.getPropertyValue("--uk-global-primary-color").trim(),
      font: styles.getPropertyValue("--uk-global-font-family").trim(),
      margin: styles.getPropertyValue("--uk-global-margin-small").trim(),
      page: styles.getPropertyValue("--uk-page-container-max-width").trim(),
      radius: styles.getPropertyValue("--uk-global-border-radius").trim(),
      button: styles.getPropertyValue("--uk-button-height").trim(),
    };
  })).toEqual({ primary: "#123456", font: "Inter", margin: "11px", page: "1234px", radius: "7px", button: "50px" });
  await expect(page.getByText("Website preview updated", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Publish Settings", exact: true }).click();
  await expect(page.getByText("Website settings published", { exact: true })).toBeVisible();
  await page.goto(previewUrl);
  await expect.poll(() => page.evaluate(() => {
    const styles = getComputedStyle(document.documentElement);
    return {
      primary: styles.getPropertyValue("--uk-global-primary-color").trim(),
      font: styles.getPropertyValue("--uk-global-font-family").trim(),
      margin: styles.getPropertyValue("--uk-global-margin-small").trim(),
      page: styles.getPropertyValue("--uk-page-container-max-width").trim(),
      radius: styles.getPropertyValue("--uk-global-border-radius").trim(),
      button: styles.getPropertyValue("--uk-button-height").trim(),
    };
  })).toEqual({ primary: "#123456", font: "Inter", margin: "11px", page: "1234px", radius: "7px", button: "50px" });

  await page.goto(builderUrl);
  await page.getByRole("button", { name: "Website", exact: true }).click();
  await page.getByRole("button", { name: "Import LESS", exact: true }).click();
  await expect(page.getByTestId("yootheme-import-panel").getByRole("button", { name: "Restore previous WebPages globals", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Restore previous WebPages globals", exact: true }).click();
  await expect.poll(() => page.locator(".builder-dashboard").evaluate((root) => getComputedStyle(root).getPropertyValue("--uk-global-primary-color").trim())).toBe(previousPrimary);

  await page.getByRole("button", { name: "Global Style Editor", exact: true }).click();
  await page.getByRole("button", { name: /Global Typography, colors/ }).click();
  await expect(editor.getByLabel("Primary background", { exact: true })).toHaveValue(previousPrimary);
  await page.goto(previewUrl);
  await expect.poll(() => page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--uk-global-primary-color").trim())).toBe(previousPrimary);
});
