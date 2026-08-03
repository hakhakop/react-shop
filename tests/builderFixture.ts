import { expect, type Page } from "@playwright/test";

export async function waitForSeededBuilderLayout(page: Page) {
  await expect(page.locator(".builder-preview-shell").first()).toBeVisible();
  await expect
    .poll(() => page.locator(".builder-preview-layout-block").count())
    .toBeGreaterThan(0);

  // Library insertion targets the currently selected layout section/column.
  // Select a real seeded block first so the fixture exercises the same add
  // path as an editor user and the newly added block becomes selected.
  const seededBlock = page.locator(".builder-preview-layout-block").first();
  const selectedBlock = page.locator(".builder-preview-layout-block.is-selected-block");
  await expect
    .poll(async () => {
      if (await selectedBlock.count()) return 1;
      await seededBlock.click({ position: { x: 10, y: 10 } });
      await page.waitForTimeout(100);
      return await selectedBlock.count();
    })
    .toBeGreaterThan(0);
}
