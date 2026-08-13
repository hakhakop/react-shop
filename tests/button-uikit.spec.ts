import { expect, test } from "@playwright/test";
import { waitForSeededBuilderLayout } from "./builderFixture";

const builderUrl = "/app/websites/header-parity-site/builder?page=home";
const email = "header-parity-20260722@example.test";
const password = "HeaderParity!2026";
const previewUrl = "/app/websites/header-parity-site/preview?page=home";

test.beforeEach(async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/app(?:\?|$)/);
});

test("button inspector exposes semantic UIkit variant and size controls", async ({ page }) => {
  await page.goto(builderUrl);
  await waitForSeededBuilderLayout(page);
  await page.locator(".builder-sidebar-nav-tile", { hasText: "Blocks" }).first().click();
  await page.locator(".builder-element-library-search input").fill("button");
  const buttonCard = page.locator(".builder-element-library-card").filter({ has: page.getByText("Button", { exact: true }) }).first();
  await buttonCard.click();
  const selectedBlock = page.locator(".builder-preview-layout-block.is-selected-block");
  const button = selectedBlock.locator(".shop-builder-column-block--button .uk-button").first();
  await expect(button).toBeVisible();
  await selectedBlock.locator(".builder-preview-block-tools").getByRole("button", { name: "Edit element" }).dispatchEvent("click");
  const inspector = page.locator(".builder-floating-inspector");
  await expect(inspector).toBeVisible();
  const variant = inspector.getByRole("radiogroup", { name: "Button variant" });
  const size = inspector.getByRole("radiogroup", { name: "Button size" });
  await expect(variant).toBeVisible();
  await expect(size).toBeVisible();
  // This is a native Button fixture. Its historical native Inspector vocabulary
  // intentionally remains separate from the complete imported-YOOtheme set.
  const variants = ["default", "primary", "secondary", "text"] as const;
  const expectedVariantClasses: Record<(typeof variants)[number], string | null> = {
    default: "uk-button-default",
    primary: "uk-button-primary",
    secondary: "uk-button-secondary",
    text: "uk-button-text",
  };
  const variantLabels: Record<(typeof variants)[number], string> = {
    default: "Default",
    primary: "Primary",
    secondary: "Secondary",
    text: "Text",
  };
  const variantStyles: Record<string, { background: string; color: string }> = {};
  for (const value of variants) {
    await variant.getByRole("button", { name: variantLabels[value], exact: true }).click();
    const expectedClass = expectedVariantClasses[value];
    await expect(button).toHaveClass(new RegExp(`\\b${expectedClass}\\b`));
    variantStyles[value] = await button.evaluate((element) => {
      const style = getComputedStyle(element);
      return { background: style.backgroundColor, color: style.color };
    });
  }
  expect(new Set(Object.values(variantStyles).map((style) => `${style.background}|${style.color}`)).size).toBeGreaterThan(1);
  const sizes = ["small", "default", "large"] as const;
  const heights: Record<string, number> = {};
  for (const value of sizes) {
    await size.locator("button").filter({ hasText: value.replace(/\b\w/g, (letter) => letter.toUpperCase()) }).click();
    if (value !== "default") await expect(button).toHaveClass(new RegExp(`uk-button-${value}`));
    heights[value] = await button.evaluate((element) => element.getBoundingClientRect().height);
  }
  expect(heights.small).not.toBe(heights.large);
  await variant.getByRole("button", { name: "Secondary", exact: true }).click();
  await size.locator("button").filter({ hasText: "Large" }).click();
  await expect(button).toHaveClass(/uk-button-secondary/);
  await expect(button).toHaveClass(/uk-button-large/);

  // Shared token consumption must beat normal-state declarations and UIkit's
  // active class, not only the browser's transient :active pseudo-state.
  await variant.getByRole("button", { name: "Default", exact: true }).click();
  await button.evaluate((element) => {
    element.style.setProperty("--uk-button-default-hover-background", "rgb(17, 34, 51)");
    element.style.setProperty("--uk-button-default-active-background", "rgb(68, 85, 102)");
  });
  await button.hover();
  await expect.poll(() => button.evaluate((element) => getComputedStyle(element).backgroundColor)).toBe("rgb(17, 34, 51)");
  await button.evaluate((element) => element.classList.add("uk-active"));
  await page.mouse.move(0, 0);
  await expect.poll(() => button.evaluate((element) => getComputedStyle(element).backgroundColor)).toBe("rgb(68, 85, 102)");
  await button.evaluate((element) => element.classList.remove("uk-active"));
  await variant.getByRole("button", { name: "Secondary", exact: true }).click();
  await button.evaluate((element) => element.style.setProperty("--uk-button-secondary-hover-background", "rgb(19, 52, 86)"));
  await button.hover();
  await expect.poll(() => button.evaluate((element) => getComputedStyle(element).backgroundColor)).toBe("rgb(19, 52, 86)");
  await page.mouse.move(0, 0);
  await page.mouse.move(0, 0);
  const finalBuilderStyle = await button.evaluate((element) => { const style = getComputedStyle(element); return { background: style.backgroundColor, color: style.color, height: style.height }; });
  await expect(inspector.locator("label.builder-field", { hasText: "Outline" })).toHaveCount(0);

  const frontend = await page.context().newPage();
  const buttonLabel = (await button.textContent())?.trim() || "Button";
  await page.getByRole("button", { name: "Publish", exact: true }).click();
  await expect(page.locator(".builder-publish-celebration").getByText("Published successfully", { exact: true })).toBeVisible();
  await frontend.goto(previewUrl);
  const frontendButton = frontend.locator(".shop-builder-column-block--button .uk-button").filter({ hasText: buttonLabel }).first();
  await expect(frontendButton).toHaveClass(/uk-button-secondary/);
  await expect(frontendButton).toHaveClass(/uk-button-large/);
  const frontendStyle = await frontendButton.evaluate((element) => { const style = getComputedStyle(element); return { background: style.backgroundColor, color: style.color, height: style.height }; });
  expect(frontendStyle.background).toBe(finalBuilderStyle.background);
  expect(frontendStyle.color).toBe(finalBuilderStyle.color);
  expect(frontendStyle.height).toBe(finalBuilderStyle.height);
});
