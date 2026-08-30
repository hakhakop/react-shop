import { expect, test } from "@playwright/test";

test("Woolberry Shop aliases render the editable dynamic Shop document", async ({ page }) => {
  await page.goto("/woolberry/new-in/");
  await expect(page.getByRole("heading", { name: "Shop" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Black Oversized Blouse" }).first()).toBeVisible();
  await expect(page.getByText("of 100 products", { exact: false }).first()).toBeVisible();
  await expect(page.getByText("Explore all products in one place", { exact: false })).toHaveCount(0);

  await page.reload();
  await expect(page.getByRole("link", { name: "Black Oversized Blouse" }).first()).toBeVisible();

  await page.goto("/woolberry/shop");
  await expect(page.getByRole("link", { name: "Black Oversized Blouse" }).first()).toBeVisible();
  await expect(page.getByText("of 100 products", { exact: false }).first()).toBeVisible();
});

test("one shared Product Category document receives distinct typed contexts", async ({ page }) => {
  await page.goto("/woolberry/product-category/women/clothing/");
  await expect(page.getByRole("heading", { name: "Product Category" })).toBeVisible();
  await expect(page.getByText("of 55 products", { exact: false }).first()).toBeVisible();
  await expect(page.getByRole("link", { name: "Black Oversized Blouse" }).first()).toBeVisible();

  await page.reload();
  await expect(page.getByText("of 55 products", { exact: false }).first()).toBeVisible();

  await page.goto("/woolberry/product-category/women/accessories/");
  await expect(page.getByRole("heading", { name: "Product Category" })).toBeVisible();
  await expect(page.getByText("of 27 products", { exact: false }).first()).toBeVisible();
  await expect(page.getByRole("link", { name: "Essential Leather Handbag" }).first()).toBeVisible();
});

test("canonical Product Single routing resolves live WooCommerce identity on hard reload", async ({ page }) => {
  await page.goto("/woolberry/product/black-oversized-blouse/");
  await expect(page.getByRole("heading", { name: "Black Oversized Blouse" })).toBeVisible();
  await expect(page.getByText("Product Details", { exact: true })).toBeVisible();

  await page.reload();
  await expect(page.getByRole("heading", { name: "Black Oversized Blouse" })).toBeVisible();
  await expect(page.getByText("Product Details", { exact: true })).toBeVisible();
});
