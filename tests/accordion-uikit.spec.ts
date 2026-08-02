import { expect, test, type Page } from "@playwright/test";

const email = "header-parity-20260722@example.test";
const password = "HeaderParity!2026";
const builderUrl = "/app/websites/header-parity-site/builder?page=home";
const previewUrl = "/app/websites/header-parity-site/preview?page=home";

async function publish(page: Page) {
  await Promise.all([
    page.waitForResponse((response) => response.request().method() === "POST" && response.url().includes("/api/builder-layouts")),
    page.getByRole("button", { name: "Publish", exact: true }).click(),
  ]);
  await expect(page.locator(".builder-publish-celebration").getByText("Published successfully", { exact: true })).toBeVisible();
}

test.beforeEach(async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/app(?:\?|$)/);
});

test("Accordion uses semantic items and UIkit behavior in builder and frontend", async ({ page, context }) => {
  await page.goto(builderUrl);
  await expect(page.locator(".builder-preview-shell").first()).toBeVisible();
  await page.locator(".builder-sidebar-nav-tile", { hasText: "Blocks" }).first().click();
  await page.locator(".builder-element-library-search input").fill("accordion");
  const card = page.locator(".builder-element-library-card").filter({ hasText: "Accordion" }).first();
  await expect(card).toBeVisible();
  await card.click();

  const selected = page.locator(".builder-preview-layout-block.is-selected-block");
  const accordion = selected.locator(".shop-builder-column-block--accordion");
  await expect(accordion).toBeVisible();
  await expect(accordion.locator(".uk-accordion-title")).toHaveCount(3);
  await expect(selected).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
  const accordionTitleSize = await accordion.locator(".uk-accordion-title").first().evaluate((node) => getComputedStyle(node).fontSize);
  const globalAccordionTitleSize = await selected.evaluate((node) => getComputedStyle(node).getPropertyValue("--uk-accordion-title-font-size").trim());
  expect(accordionTitleSize).toBe(globalAccordionTitleSize || accordionTitleSize);
  const blockId = await selected.getAttribute("data-builder-block-key");
  if (!blockId) throw new Error("Accordion block id missing");

  await selected.locator(".builder-preview-block-tools").getByRole("button", { name: "Edit element" }).click();
  const inspector = page.locator(".builder-floating-inspector");
  await expect(inspector).toBeVisible();
  const firstTitle = inspector.locator("label.builder-field", { hasText: "Title" }).first().locator("input");
  await firstTitle.fill("What is the delivery timeline?");
  await inspector.locator("label.builder-field", { hasText: "Content" }).first().locator("textarea").fill("Most projects begin within two weeks.");
  await inspector.getByRole("button", { name: "Behavior", exact: true }).click();
  await inspector.locator("label.builder-field", { hasText: "Allow multiple open" }).locator("select").selectOption("enabled");
 await inspector.locator("label.builder-field", { hasText: "Initially open" }).locator("select").selectOption("first");
  await inspector.getByRole("button", { name: "Styling", exact: true }).click();
  const styleFields = inspector.locator('[data-uikit-capability="accordion-style"] label.builder-field');
  await styleFields.nth(0).locator("select").selectOption("plus-minus");
  await styleFields.nth(1).locator("select").selectOption("start");
  await styleFields.nth(2).locator("select").selectOption("striped");
  await styleFields.nth(3).locator("select").selectOption("large");
  await styleFields.nth(4).locator("select").selectOption("bold");
  await styleFields.nth(5).locator("select").selectOption("primary");
  await expect(accordion.locator("ul")).toHaveAttribute("data-accordion-indicator", "plus-minus");
  await expect(accordion.locator("ul")).toHaveAttribute("data-accordion-indicator-position", "start");
  await expect(accordion.locator("ul")).toHaveAttribute("data-accordion-row-style", "striped");
  await expect(accordion.locator("ul")).toHaveAttribute("data-accordion-spacing", "large");
  await expect(accordion.locator("ul")).toHaveAttribute("data-accordion-title-emphasis", "bold");
  await expect(accordion.locator("ul")).toHaveAttribute("data-accordion-open-emphasis", "primary");
  await expect(accordion.locator(".uk-accordion-icon")).toHaveCount(3);
  await expect(accordion.locator(".uk-accordion-title").first()).toHaveCSS("display", "flex");
  await expect(accordion.locator(".uk-accordion-title").first()).toHaveCSS("text-align", "left");
  await expect(accordion.locator(".uk-accordion-icon").first()).toHaveCSS("margin-left", "0px");
  await expect(accordion.locator(".uk-accordion-icon").first()).toHaveCSS("margin-right", "12px");
  await expect(accordion.locator("li").nth(0)).toHaveCSS("padding-left", "16px");
  await expect(accordion.locator("li").nth(1)).toHaveCSS("padding-left", "16px");
  await expect(accordion.locator("li").nth(0)).toHaveCSS("padding-right", "16px");
  await expect(accordion.locator("li").nth(1)).toHaveCSS("padding-right", "16px");
  await inspector.getByRole("button", { name: "Behavior", exact: true }).click();

  const titles = accordion.locator(".uk-accordion-title");
  await expect(accordion.locator("li").nth(0)).toHaveClass(/uk-open/);
  await titles.nth(0).click();
  await expect(titles.nth(0)).toHaveClass(/uk-accordion-title/);
  await expect(accordion.locator("li").nth(0)).not.toHaveClass(/uk-open/);
  await titles.nth(1).click();
  await expect(accordion.locator("li").nth(1)).toHaveClass(/uk-open/);
  await titles.nth(0).click();
  await expect(accordion.locator("li").nth(0)).toHaveClass(/uk-open/);
  await expect(accordion.locator("li").nth(1)).toHaveClass(/uk-open/);

  const stored = await page.evaluate((id) => {
    const walk = (value: unknown): Record<string, unknown> | null => {
      if (!value || typeof value !== "object") return null;
      if (Array.isArray(value)) { for (const item of value) { const found = walk(item); if (found) return found; } return null; }
      const record = value as Record<string, unknown>;
      if (record.kind === "accordion" && record.id === id) return record;
      for (const child of Object.values(record)) { const found = walk(child); if (found) return found; }
      return null;
    };
    for (const value of Object.values(localStorage)) { try { const found = walk(JSON.parse(value)); if (found) return found; } catch {} }
    return null;
  }, blockId);
  expect(stored).toMatchObject({ kind: "accordion", accordionMultiple: true, accordionCollapsible: true, accordionOpenItems: [0], accordionIndicator: "plus-minus", accordionIndicatorPosition: "start", accordionRowStyle: "striped", accordionSpacing: "large", accordionTitleEmphasis: "bold", accordionOpenEmphasis: "primary" });
  expect((stored?.accordionItems as Array<Record<string, unknown>>)[0]).toMatchObject({ title: "What is the delivery timeline?", content: "Most projects begin within two weeks." });
  expect(JSON.stringify(stored)).not.toMatch(/uk-/);

  await publish(page);
  const frontend = await context.newPage();
  await frontend.goto(previewUrl);
  const frontendAccordion = frontend.locator(".shop-builder-column-block--accordion").last();
  await expect(frontendAccordion).toBeVisible();
  await expect(frontendAccordion.locator(".uk-accordion-title").first()).toContainText("What is the delivery timeline?");
  const frontendAccordionTitleSize = await frontendAccordion.locator(".uk-accordion-title").first().evaluate((node) => getComputedStyle(node).fontSize);
  expect(frontendAccordionTitleSize).toBe(accordionTitleSize);
  await expect(frontendAccordion.locator("li").nth(0)).toHaveClass(/uk-open/);
  await frontendAccordion.locator(".uk-accordion-title").nth(0).click();
  await expect(frontendAccordion.locator("li").nth(0)).not.toHaveClass(/uk-open/);
  await frontendAccordion.locator(".uk-accordion-title").nth(1).click();
  await frontendAccordion.locator(".uk-accordion-title").nth(0).click();
  await expect(frontendAccordion.locator("li").nth(1)).toHaveClass(/uk-open/);
  await expect(frontendAccordion.locator("li").nth(0)).toHaveClass(/uk-open/);
  await expect(frontendAccordion.locator("li").nth(1)).toHaveClass(/uk-open/);
});
