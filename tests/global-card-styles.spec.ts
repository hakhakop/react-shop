import { expect, test } from "@playwright/test";

const builderUrl = "/app/websites/header-parity-site/builder?page=home";
const previewUrl = "/app/websites/header-parity-site/preview?page=home";
const email = "header-parity-20260722@example.test";
const password = "HeaderParity!2026";

test("Global Card styles expose the semantic DevStack domain and stay in parity", async ({ page, context }) => {
  await page.goto("/login");
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/app(?:\?|$)/);
  await page.goto(builderUrl);
  await expect(page.locator(".builder-preview-shell").first()).toBeVisible();
  await page.getByRole("button", { name: "Website", exact: true }).click();
  await page.getByRole("button", { name: "Global Style Editor", exact: true }).click();
  await page.locator(".builder-design-nav-item").filter({ hasText: "Card" }).click();

  const editor = page.getByTestId("global-editor-card");
  await expect(editor).toBeVisible();
  for (const label of [
    "Border width", "Border radius", "Transition duration", "Small", "Default", "Large",
    "Default background", "Default text", "Default title", "Primary background", "Secondary background",
    "Default hover background", "Primary hover background", "Secondary hover background",
    "Image to body spacing", "Title spacing", "Meta spacing", "Header spacing", "Footer spacing",
    "Default shadow", "Primary shadow", "Secondary shadow", "Card preview matrix",
  ]) await expect(editor.getByText(label, { exact: true }).first()).toBeVisible();

  await editor.getByLabel("Default background", { exact: true }).fill("#123456");
  await editor.getByLabel("Border radius value", { exact: true }).fill("18");
  await expect.poll(() => page.locator(".builder-dashboard").evaluate((root) => {
    const style = getComputedStyle(root);
    return {
      background: style.getPropertyValue("--uk-card-default-background").trim(),
      radius: style.getPropertyValue("--uk-card-border-radius").trim(),
    };
  })).toEqual({ background: "#123456", radius: "18px" });

  const panel = page.locator(".shop-builder-column-block--panel").first();
  await expect(panel).toBeVisible();
  const builderStyle = await panel.evaluate((element) => {
    const style = getComputedStyle(element);
    return { background: style.backgroundColor, radius: style.borderRadius };
  });
  expect(builderStyle.background).not.toBe("rgba(0, 0, 0, 0)");
  expect(builderStyle.radius).toBe("18px");

  const stored = await page.evaluate(() => Object.values(localStorage).some((value) => value.includes("uk-card-default-background") || value.includes("uk-card")));
  expect(stored).toBe(false);

  await page.getByRole("button", { name: "Publish Settings", exact: true }).click();
  await expect(page.getByText("Website settings published", { exact: true })).toBeVisible();
  const frontend = await context.newPage();
  await frontend.goto(previewUrl);
  const frontendPanel = frontend.locator(".shop-builder-column-block--panel").first();
  await expect(frontendPanel).toBeVisible();
  const frontendStyle = await frontendPanel.evaluate((element) => {
    const style = getComputedStyle(element);
    return { background: style.backgroundColor, radius: style.borderRadius };
  });
  expect(frontendStyle).toEqual(builderStyle);
});
