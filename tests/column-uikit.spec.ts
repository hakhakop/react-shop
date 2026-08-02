import { expect, test } from "@playwright/test";

const email = "header-parity-20260722@example.test";
const password = "HeaderParity!2026";
const builderUrl = "/app/websites/header-parity-site/builder?page=home";
const previewUrl = "/app/websites/header-parity-site/preview?page=home";

test.beforeEach(async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/app(?:\?|$)/);
});

test("Column exposes semantic UIkit alignment and flex controls", async ({ page, context }) => {
  await page.goto(builderUrl);
  await expect(page.locator(".builder-preview-shell").first()).toBeVisible();

  const column = page.locator('.builder-preview-content-row [data-builder-object-type="column"]').first();
  await expect(column).toBeVisible();
  await column.evaluate((element) => {
    element.dispatchEvent(new MouseEvent("dblclick", { bubbles: true }));
  });

  const inspector = page.locator(".builder-floating-inspector");
  await expect(inspector).toBeVisible();
  const horizontal = inspector.locator("label.builder-field", { hasText: "Horizontal alignment" }).locator("select");
  const vertical = inspector.locator("label.builder-field", { hasText: "Vertical alignment" }).locator("select");
  const flex = inspector.locator("label.builder-field", { hasText: "Flex behavior" }).locator("select");
  const responsive = inspector.locator("label.builder-field", { hasText: "Responsive width" }).locator("select");
  await expect(horizontal.locator("option")).toHaveText(["left", "center", "right"]);
  await expect(vertical.locator("option")).toHaveText(["top", "center", "bottom"]);
  await expect(flex.locator("option")).toHaveText(["none", "expand"]);
  await expect(responsive.locator("option")).toHaveText(["inherit", "stack"]);
  await expect(inspector.getByText("Border Radius", { exact: true })).toHaveCount(0);
  await expect(inspector.getByText("Nested Rows", { exact: true })).toHaveCount(0);
  await expect(inspector.getByText("Typography", { exact: true })).toHaveCount(0);

  await horizontal.selectOption("center");
  await vertical.selectOption("bottom");
  await flex.selectOption("expand");
  await responsive.selectOption("stack");
  await expect(column).toHaveClass(/uk-flex-center/);
  await expect(column).toHaveClass(/uk-flex-bottom/);
  await expect(column).toHaveClass(/uk-flex-1/);
  await expect(column).toHaveClass(/uk-width-1-1@s/);

  const columnId = await column.getAttribute("data-builder-column-key");
  if (!columnId) throw new Error("Column id missing");
  const stored = await page.evaluate((id) => {
    const walk = (value: unknown): Record<string, unknown> | null => {
      if (!value || typeof value !== "object") return null;
      if (Array.isArray(value)) {
        for (const item of value) { const match = walk(item); if (match) return match; }
        return null;
      }
      const record = value as Record<string, unknown>;
      if (record.id === id && ("columnHorizontalAlign" in record || "columnFlex" in record)) return record;
      for (const child of Object.values(record)) { const match = walk(child); if (match) return match; }
      return null;
    };
    for (const value of Object.values(localStorage)) {
      try { const match = walk(JSON.parse(value)); if (match) return match; } catch {}
    }
    return null;
  }, columnId);
  expect(stored).toMatchObject({
    id: columnId,
    columnHorizontalAlign: "center",
    columnVerticalAlign: "bottom",
    columnFlex: "expand",
    columnResponsiveWidth: "stack",
  });
  expect(JSON.stringify(stored)).not.toMatch(/uk-/);

  await Promise.all([
    page.waitForResponse((response) => response.request().method() === "POST" && response.url().includes("/api/builder-layouts")),
    page.getByRole("button", { name: "Publish", exact: true }).click(),
  ]);
  await expect(page.locator(".builder-publish-celebration").getByText("Published successfully", { exact: true })).toBeVisible();

  const frontend = await context.newPage();
  await frontend.goto(previewUrl);
  const frontendColumn = frontend.locator(`[data-builder-object-type="column"][data-builder-column-key="${columnId}"]`).first();
  await expect(frontendColumn).toBeVisible();
  await expect(frontendColumn).toHaveClass(/uk-flex-center/);
  await expect(frontendColumn).toHaveClass(/uk-flex-bottom/);
  await expect(frontendColumn).toHaveClass(/uk-flex-1/);
  await expect(frontendColumn).toHaveClass(/uk-width-1-1@s/);
});
