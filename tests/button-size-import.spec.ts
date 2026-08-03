import { expect, test } from "@playwright/test";
import { waitForSeededBuilderLayout } from "./builderFixture";

const builderUrl = "/app/websites/header-parity-site/builder?page=home";
const previewUrl = "/app/websites/header-parity-site/preview?page=home";
const email = "header-parity-20260722@example.test";
const password = "HeaderParity!2026";
const zipPath = "/Users/hakobjaghatspanyan/Downloads/DevStack.zip";
const themePath = "/Users/hakobjaghatspanyan/Downloads/theme.less";
const stylePath = "/Users/hakobjaghatspanyan/Downloads/style.less";

test("imported DevStack Button sizes preserve small/default/large ordering and parity", async ({ page, context }) => {
  await page.goto("/login");
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/app(?:\?|$)/);

  await page.goto(builderUrl);
  await waitForSeededBuilderLayout(page);
  await page.getByRole("button", { name: "Website", exact: true }).click();
  await page.getByRole("button", { name: "Import LESS", exact: true }).click();
  const importer = page.getByTestId("yootheme-import-panel");
  await importer.locator('input[type="file"]').setInputFiles([zipPath, themePath, stylePath]);
  await expect(importer).toContainText("DevStack Light Blue");
  await importer.getByRole("button", { name: "Apply DevStack Light Blue", exact: true }).click();
  await expect(page.getByText("Website preview updated", { exact: true })).toBeVisible();
  await waitForSeededBuilderLayout(page);

  await page.getByRole("button", { name: "Blocks", exact: true }).click();
  await page.locator(".builder-element-library-search input").fill("button");
  const buttonCard = page.locator(".builder-element-library-card").filter({ has: page.getByText("Button", { exact: true }) }).first();
  await buttonCard.click();

  const selectedBlock = page.locator(".builder-preview-layout-block.is-selected-block");
  const button = selectedBlock.locator(".shop-builder-column-block--button .uk-button").first();
  await expect(button).toBeVisible();
  await selectedBlock.locator(".builder-preview-block-tools").getByRole("button", { name: "Edit element" }).click();
  const inspector = page.locator(".builder-floating-inspector");
  const size = inspector.getByRole("radiogroup", { name: "Button size" });
  await expect(size).toBeVisible();

  const readMetrics = (locator: typeof button) => locator.evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      height: style.height,
      heightPx: Number.parseFloat(style.height),
      fontSize: style.fontSize,
      paddingLeft: style.paddingLeft,
      paddingRight: style.paddingRight,
      paddingX: Number.parseFloat(style.paddingLeft) + Number.parseFloat(style.paddingRight),
    };
  });

  const metrics: Record<string, Awaited<ReturnType<typeof readMetrics>>> = {};
  for (const value of ["small", "default", "large"] as const) {
    await size.getByRole("radio", { name: value.replace(/\b\w/g, (letter) => letter.toUpperCase()) }).click();
    await expect(button).toHaveClass(value === "default" ? /uk-button/ : new RegExp(`uk-button-${value}`));
    metrics[value] = await readMetrics(button);
  }

  expect(metrics.small.heightPx).toBeLessThan(metrics.default.heightPx);
  expect(metrics.default.heightPx).toBeLessThan(metrics.large.heightPx);
  expect(metrics.small.paddingX).toBeLessThan(metrics.default.paddingX);
  expect(metrics.default.paddingX).toBeLessThan(metrics.large.paddingX);
  expect(metrics.small.fontSize).toBe("14px");
  expect(metrics.default.fontSize).toBe("15px");
  expect(metrics.large.fontSize).toBe("16px");
  expect(metrics.small.paddingLeft).toBe("20px");
  expect(metrics.default.paddingLeft).toBe("30px");
  expect(metrics.large.paddingLeft).toBe("40px");

  const publish = page.waitForResponse((response) => response.url().includes("/api/builder-shell") && response.request().method() === "POST");
  await page.getByRole("button", { name: "Publish", exact: true }).click();
  await expect((await publish).ok()).toBeTruthy();
  await expect(page.locator(".builder-publish-celebration").getByText("Published successfully", { exact: true })).toBeVisible();

  const frontend = await context.newPage();
  await frontend.goto(previewUrl);
  const frontendButton = frontend.locator(".shop-builder-column-block--button .uk-button").filter({ hasText: (await button.textContent())?.trim() || "Button" }).first();
  await expect(frontendButton).toHaveClass(/uk-button-large/);
  const frontendMetrics = await readMetrics(frontendButton);
  expect(frontendMetrics).toEqual(metrics.large);
});
