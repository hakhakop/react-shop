import { expect, test } from "@playwright/test";
import { waitForSeededBuilderLayout } from "./builderFixture";

const email = "header-parity-20260722@example.test";
const password = "HeaderParity!2026";
const builderUrl = "/app/websites/header-parity-site/builder?page=home";

test.beforeEach(async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/app(?:\?|$)/);
});

test("row layout toolbar changes only the current row", async ({ page }) => {
  await page.goto(builderUrl);
  await expect(page.locator(".builder-preview-shell").first()).toBeVisible();
  await waitForSeededBuilderLayout(page);

  const fixture = await page.evaluate(async () => {
    const response = await fetch(
      "/api/builder-layouts?key=home&websiteId=header-parity-site",
    );
    const layout = await response.json();
    const section = layout.layout.sections.find(
      (entry: any) =>
        entry.kind === "contentLayout" &&
        Array.isArray(entry.layoutItems) &&
        entry.layoutItems.length > 0,
    );
    if (!section) throw new Error("No content layout section available for row fixture");

    const originalSections = JSON.parse(JSON.stringify(layout.layout.sections));
    const fixtureRowId = "row-toolbar-regression-row";
    section.layoutItems = [
      {
        id: `${fixtureRowId}-column-1`,
        rowId: fixtureRowId,
        rowLayout: "1-col",
        blocks: [],
      },
      ...section.layoutItems,
    ];
    section.layoutRows = (section.layoutRows ?? 1) + 1;

    const saved = await fetch("/api/builder-layouts?websiteId=header-parity-site", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        key: "home",
        design: layout.layout.design,
        sections: layout.layout.sections,
      }),
    });
    if (!saved.ok) throw new Error(`Row fixture save failed: ${saved.status}`);
    return {
      sectionId: section.id as string,
      design: layout.layout.design,
      originalSections,
    };
  });

  const clearBuilderDrafts = () =>
    page.evaluate(() =>
      Object.keys(localStorage)
        .filter((key) =>
          [
            "react-shop-visual-builder-drafts-v2",
            "react-shop-visual-builder-v1",
            "react-shop-visual-builder-pages-v1",
          ].some((prefix) => key.startsWith(prefix)),
        )
        .forEach((key) => localStorage.removeItem(key)),
    );

  try {
    await clearBuilderDrafts();
    await page.reload();
    await waitForSeededBuilderLayout(page);

    const section = page.locator(
      `.builder-preview-section[data-builder-section-id="${fixture.sectionId}"]`,
    );
    await expect(section).toBeVisible();
  const rows = section.locator(
    ":scope > .shop-builder-section-content > .builder-preview-content-layout-grid > .builder-main-row-frame",
  );
    await expect(rows).toHaveCount(2);

    const targetRow = rows.first();
    const siblingRow = rows.nth(1);
    const siblingColumnCount = await siblingRow.locator(
      '[data-builder-object-type="column"]',
    ).count();

    await targetRow.dispatchEvent("click");
    const toolbar = targetRow.locator(
      ".builder-context-toolbar.builder-preview-row-toolbar",
    );
    await expect(toolbar).toBeVisible();
    await toolbar
      .getByRole("button", { name: "Change layout composition", exact: true })
      .click();

    const dialog = page.getByRole("dialog", { name: "Choose layout" });
    await expect(dialog).toBeVisible();
    await dialog
      .getByRole("button")
      .filter({ hasText: "Halves" })
      .click();

    await expect(dialog).toBeHidden();
    await expect(targetRow.locator('[data-builder-object-type="column"]')).toHaveCount(2);
    await expect(siblingRow.locator('[data-builder-object-type="column"]')).toHaveCount(
      siblingColumnCount,
    );
  } finally {
    await page.evaluate(async ({ design, originalSections }) => {
      await fetch("/api/builder-layouts?websiteId=header-parity-site", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "home", design, sections: originalSections }),
      });
    }, fixture);
    await clearBuilderDrafts();
  }
});
