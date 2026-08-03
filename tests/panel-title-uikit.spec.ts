import { expect, test } from "@playwright/test";
import { waitForSeededBuilderLayout } from "./builderFixture";

const email = "header-parity-20260722@example.test";
const password = "HeaderParity!2026";
const builderUrl = "/app/websites/header-parity-site/builder?page=home";
const previewUrl = "/app/websites/header-parity-site/preview?page=home";

test("Panel title element and UIkit visual style stay independent", async ({ page, context }) => {
  await page.setViewportSize({ width: 2400, height: 1200 });
  await page.goto("/login");
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/app(?:\?|$)/);
  await page.goto(builderUrl);
  await waitForSeededBuilderLayout(page);
  await page.locator(".builder-sidebar-nav-tile", { hasText: "Blocks" }).first().click();
  await page.locator(".builder-element-library-search input").fill("panel");
  const panelCard = page.locator(".builder-element-library-card").filter({ has: page.locator("strong", { hasText: /^Panel$/ }) }).first();
  await expect(panelCard).toBeVisible();
  await panelCard.click();

  const selectedBlock = page.locator(".builder-preview-layout-block.is-selected-block");
  const panel = selectedBlock.locator(".shop-builder-column-block--panel");
  await expect(panel).toBeVisible();
  const blockId = await selectedBlock.getAttribute("data-builder-block-key");
  if (!blockId) throw new Error("Panel block id missing");
  await selectedBlock.locator(".builder-preview-block-tools").getByRole("button", { name: "Edit element" }).dispatchEvent("click");
  const inspector = page.locator(".builder-floating-inspector");
  await inspector.getByRole("button", { name: "Layout", exact: true }).click();
  const layout = inspector.locator('[data-uikit-capability="panel-layout"]');
  await layout.getByLabel("Title element", { exact: true }).selectOption("h2");
  const title = panel.locator("h2").first();

  const measurements: Record<string, { fontSize: number; lineHeight: number; className: string; tag: string }> = {};
  for (const style of ["h3", "h4", "h5"] as const) {
    await layout.getByLabel("Title visual style", { exact: true }).selectOption(style);
    const measurement = await title.evaluate((element) => {
      const computed = getComputedStyle(element);
      return { fontSize: parseFloat(computed.fontSize), lineHeight: parseFloat(computed.lineHeight), className: element.className, tag: element.tagName.toLowerCase() };
    });
    measurements[style] = measurement;
    await expect(title).toHaveClass(new RegExp(`uk-${style}`));
    expect(measurement.tag).toBe("h2");
  }
  expect(measurements.h3.fontSize).toBeGreaterThan(measurements.h4.fontSize);
  expect(measurements.h4.fontSize).toBeGreaterThan(measurements.h5.fontSize);

  const stored = await page.evaluate((id) => {
    const matches: Record<string, unknown>[] = [];
    const walk = (value: unknown) => {
      if (!value || typeof value !== "object") return;
      if (Array.isArray(value)) return value.forEach(walk);
      const record = value as Record<string, unknown>;
      if (record.kind === "panel" && record.id === id) matches.push(record);
      Object.values(record).forEach(walk);
    };
    Object.values(localStorage).forEach((value) => { try { walk(JSON.parse(value)); } catch {} });
    return matches[0] ?? null;
  }, blockId);
  expect(stored).toMatchObject({ panelTitleElement: "h2", panelTitleStyle: "h5" });

  await Promise.all([
    page.waitForResponse((response) => response.request().method() === "POST" && response.url().includes("/api/builder-layouts")),
    page.getByRole("button", { name: "Publish", exact: true }).click(),
  ]);
  await expect(page.locator(".builder-publish-celebration").getByText("Published successfully", { exact: true })).toBeVisible();
  const frontend = await context.newPage();
  await frontend.goto(previewUrl);
  const frontendTitle = frontend.locator(".shop-builder-column-block--panel h2.uk-h5").first();
  await expect(frontendTitle).toBeVisible();
  const frontendMeasurement = await frontendTitle.evaluate((element) => {
    const computed = getComputedStyle(element);
    return { fontSize: parseFloat(computed.fontSize), lineHeight: parseFloat(computed.lineHeight), className: element.className, tag: element.tagName.toLowerCase() };
  });
  expect(frontendMeasurement.tag).toBe("h2");
  expect(frontendMeasurement.fontSize).toBe(measurements.h5.fontSize);
  expect(frontendMeasurement.lineHeight).toBe(measurements.h5.lineHeight);
});
