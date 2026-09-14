import { expect, test } from "@playwright/test";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { waitForSeededBuilderLayout } from "./builderFixture";

const email = "header-parity-20260722@example.test";
const password = "HeaderParity!2026";
const builderUrl = "/app/websites/header-parity-site/builder?page=home";
const previewUrl = "/app/websites/header-parity-site/preview?page=home";
const layoutsPath = resolve(process.cwd(), "data/websites/eb65bd05-1299-4071-b432-f3c04e9eda2e/builder-layouts.json");
const originalLayouts = readFileSync(layoutsPath, "utf8");

test.afterAll(() => writeFileSync(layoutsPath, originalLayouts));

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 2400, height: 1400 });
  await page.goto("/login");
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/app(?:\?|$)/);
});

test("Image uses semantic UIkit presentation in builder and frontend", async ({ page, context }) => {
  await page.goto(builderUrl);
  await waitForSeededBuilderLayout(page);
  await page.locator(".builder-sidebar-nav-tile", { hasText: "Blocks" }).first().click();
  await page.locator(".builder-element-library-search input").fill("image");
  await page.locator(".builder-element-library-card", { hasText: "Image" }).first().click();

  const selected = page.locator(".builder-preview-layout-block.is-selected-block").last();
  const imageBlock = selected.locator(".shop-builder-column-block--image");
  await expect(imageBlock).toBeVisible();
  await selected.locator(".builder-preview-block-tools").getByRole("button", { name: "Edit element" }).dispatchEvent("click");
  const inspector = page.locator(".builder-floating-inspector");
  await expect(inspector).toBeVisible();

  const field = (label: string) => inspector.locator(".inspector-field-row").filter({ hasText: label });
  const source = field("Image source").locator("input");
  await source.fill("/builder-image-placeholder.svg");
  const alt = field("Alt text").locator("input");
  await alt.fill("Semantic image proof");

  await inspector.getByRole("button", { name: "Settings", exact: true }).click();
  const select = (label: string) => field(label).locator("select");
  const fit = field("Fit").getByRole("radiogroup", { name: "Image fit" });
  const ratio = select("Aspect ratio");
  const shape = field("Shape").getByRole("radiogroup", { name: "Image shape" });
  const shadow = select("Shadow");
  const alignment = field("Alignment").getByRole("radiogroup", { name: "Image alignment" });
  const width = inspector.getByLabel("Image width");

  await ratio.selectOption("natural");
  await expect(imageBlock.locator("img")).toHaveClass(/uk-img/);
  await expect(imageBlock.locator(".shop-builder-image-media.uk-cover-container")).toHaveCount(0);
  await ratio.selectOption("square");
  await expect(imageBlock.locator(".shop-builder-image-media.uk-cover-container")).toBeVisible();
  await fit.getByRole("radio", { name: "Contain" }).click();
  await expect(imageBlock.locator("img")).toHaveCSS("object-fit", "contain");
  await fit.getByRole("radio", { name: "Cover" }).click();
  await expect(imageBlock.locator("img")).toHaveAttribute("data-uk-cover", "");
  await ratio.selectOption("16:9");
  const ratioValue = await imageBlock.locator(".shop-builder-image-media").evaluate((element) => getComputedStyle(element).aspectRatio);
  expect(ratioValue).toBe("16 / 9");

  await shape.getByRole("radio", { name: "Rounded" }).click();
  await expect(imageBlock.locator(".uk-border-rounded").first()).toBeVisible();
  await shape.getByRole("radio", { name: "Circle" }).click();
  await expect(imageBlock.locator(".uk-border-circle").first()).toBeVisible();
  await shape.getByRole("radio", { name: "Pill" }).click();
  await expect(imageBlock.locator(".uk-border-pill").first()).toBeVisible();
  for (const value of ["small", "medium", "large", "xlarge", "bottom"]) {
    await shadow.selectOption(value);
    await expect(imageBlock.locator(`.uk-box-shadow-${value}`).first()).toBeVisible();
  }
  await shadow.selectOption("xlarge");
  await alignment.getByRole("radio", { name: "Right" }).click();
  await expect(imageBlock.locator(".uk-align-right").first()).toBeVisible();
  await width.selectOption("full");
  await expect.poll(() => imageBlock.locator("figure").evaluate((element) => (element as HTMLElement).style.width)).toBe("100%");

  await expect(select("Loading")).toHaveValue("lazy");

  const builderImage = imageBlock.locator("img");
  const builderStyle = await builderImage.evaluate((element) => {
    const style = getComputedStyle(element);
    const rect = element.getBoundingClientRect();
    const parent = element.closest("figure")?.getBoundingClientRect();
    return { fit: style.objectFit, widthRatio: parent ? rect.width / parent.width : 0, shadow: style.boxShadow };
  });

  await page.getByRole("button", { name: "Publish", exact: true }).click();
  await expect(page.locator(".builder-publish-celebration").getByText("Published successfully", { exact: true })).toBeVisible();

  const frontend = await context.newPage();
  await frontend.goto(previewUrl);
  const frontendImage = frontend.locator('.shop-builder-column-block--image img[alt="Semantic image proof"]');
  await expect(frontendImage).toHaveAttribute("alt", "Semantic image proof");
  await expect(frontendImage).toHaveClass(/uk-img/);
  await expect(frontendImage).toHaveClass(/uk-border-pill/);
  await expect(frontendImage).toHaveClass(/uk-box-shadow-xlarge/);
  const frontendStyle = await frontendImage.evaluate((element) => {
    const style = getComputedStyle(element);
    const rect = element.getBoundingClientRect();
    const parent = element.closest("figure")?.getBoundingClientRect();
    return { fit: style.objectFit, widthRatio: parent ? rect.width / parent.width : 0, shadow: style.boxShadow };
  });
  expect(frontendStyle.fit).toBe(builderStyle.fit);
  expect(frontendStyle.shadow).toBe(builderStyle.shadow);
  expect(frontendStyle.widthRatio).toBeCloseTo(builderStyle.widthRatio, 2);

  const saved = JSON.parse(readFileSync(layoutsPath, "utf8"));
  const imageBlocks: Array<Record<string, unknown>> = [];
  const walk = (value: unknown) => {
    if (Array.isArray(value)) value.forEach(walk);
    else if (value && typeof value === "object") {
      const record = value as Record<string, unknown>;
      if (record.kind === "image" && record.imageAlt === "Semantic image proof") imageBlocks.push(record);
      Object.values(record).forEach(walk);
    }
  };
  walk(saved);
  expect(imageBlocks).toHaveLength(1);
  expect(imageBlocks[0]).toMatchObject({ imageFit: "cover", imageRatio: "16:9", imageShape: "pill", imageShadow: "xlarge", imageAlignment: "right", imageWidth: "full", imageLoading: "lazy" });
  expect(JSON.stringify(imageBlocks[0])).not.toMatch(/uk-/);
  await frontend.close();
});
