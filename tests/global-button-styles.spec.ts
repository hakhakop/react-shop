import { expect, test } from "@playwright/test";

const builderUrl = "/app/websites/header-parity-site/builder?page=home";
const previewUrl = "/app/websites/header-parity-site/preview?page=home";
const email = "header-parity-20260722@example.test";
const password = "HeaderParity!2026";

test("Button Global Styles expose semantic DevStack coverage and stay in parity", async ({ page, context }) => {
  await page.goto("/login");
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/app(?:\?|$)/);
  await page.goto(builderUrl);
  await expect(page.locator(".builder-preview-shell").first()).toBeVisible();
  await page.getByRole("button", { name: "Website", exact: true }).click();
  await page.getByRole("button", { name: "Global Style Editor", exact: true }).click();
  await page.locator(".builder-design-nav-item").filter({ hasText: "Button" }).click();

  const editor = page.getByTestId("global-editor-button");
  await expect(editor).toBeVisible();
  for (const label of ["Default background", "Primary background", "Secondary background", "Danger background", "Disabled background", "Text color", "Link color", "Primary", "Primary hover", "Default active"]) {
    await expect(editor.getByText(label, { exact: true }).first()).toBeVisible();
  }
  await expect(editor.getByText("Button preview matrix", { exact: true })).toBeVisible();
  await expect(editor.locator('[data-button-variant="default"][data-button-size="small"]')).toHaveClass(/uk-button-default/);
  await expect(editor.locator('[data-button-variant="primary"][data-button-size="large"]')).toHaveClass(/uk-button-primary/);
  await expect(editor.locator('[data-button-variant="text"][data-button-size="default"]')).toHaveClass(/uk-button-text/);

  await editor.getByLabel("Secondary background", { exact: true }).fill("#123456");
  await editor.getByRole("spinbutton", { name: "Large font size value", exact: true }).fill("23");
  await expect.poll(() => page.locator(".builder-dashboard").evaluate((root) => ({
    background: getComputedStyle(root).getPropertyValue("--uk-button-secondary-background").trim(),
    fontSize: getComputedStyle(root).getPropertyValue("--uk-button-large-font-size").trim(),
  }))).toEqual({ background: "#123456", fontSize: "23px" });

  const builderButton = page.locator(".shop-builder-column-block--button .uk-button-secondary").first();
  await expect(builderButton).toBeVisible();
  const buttonLabel = (await builderButton.textContent())?.trim() || "Button";
  const builderStyle = await builderButton.evaluate((element) => { const style = getComputedStyle(element); return { background: style.backgroundColor, fontSize: style.fontSize }; });
  expect(builderStyle.background).not.toBe("rgba(0, 0, 0, 0)");
  expect(builderStyle.fontSize).toBe("23px");

  await page.getByRole("button", { name: "Publish Settings", exact: true }).click();
  await expect(page.getByText("Website settings published", { exact: true })).toBeVisible();
  const frontend = await context.newPage();
  await frontend.goto(previewUrl);
  const frontendButton = frontend.locator(".shop-builder-column-block--button .uk-button-secondary").first();
  await expect(frontendButton).toBeVisible();
  const frontendStyle = await frontendButton.evaluate((element) => { const style = getComputedStyle(element); return { background: style.backgroundColor, fontSize: style.fontSize }; });
  expect(frontendStyle).toEqual(builderStyle);
});
