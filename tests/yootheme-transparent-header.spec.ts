import { expect, test } from "@playwright/test";
import { mapYoothemeStaticContent } from "@/lib/yoothemePageImport";
import { normalizeYoothemeSection } from "@/lib/yoothemeImportContract";

const sourceProps = {
  header_transparent: true,
  header_transparent_noplaceholder: true,
  header_transparent_text_color: "light",
};

test("maps standard YOOtheme transparent Header section semantics", () => {
  const imported = mapYoothemeStaticContent({
    type: "layout",
    children: [{ type: "section", props: sourceProps, children: [] }],
  });

  expect(imported.sections[0]).toMatchObject({
    headerTransparent: true,
    pullUnderHeader: true,
    headerTextColor: "light",
  });
  expect(normalizeYoothemeSection(sourceProps)).toMatchObject({
    headerTransparent: true,
    pullUnderHeader: true,
    headerTextColor: "light",
  });
});

test("storefront renders transparent pull-under Header with the imported text mode", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/jack");

  const root = page.locator("[data-builder-page-root]").first();
  await expect(root).toHaveAttribute("data-section-header-transparent", "true");
  await expect(root).toHaveAttribute("data-section-pull-under-header", "true");
  await expect(root).toHaveAttribute("data-section-header-text-color", "light");

  const header = page.locator(".site-header").first();
  await expect(header).toHaveAttribute("data-overlap-header", "true");
  await expect(header).toHaveAttribute("data-section-header-transparent", "true");
  await expect(header).toHaveAttribute("data-header-text-mode", "light");
  await expect(header).toHaveCSS("position", "absolute");
  await expect(header).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");

  const firstSection = page.locator(".shop-builder-section").first();
  const geometry = await page.evaluate(() => {
    const headerElement = document.querySelector<HTMLElement>(".site-header");
    const sectionElement = document.querySelector<HTMLElement>(".shop-builder-section");
    return {
      headerTop: headerElement?.getBoundingClientRect().top,
      sectionTop: sectionElement?.getBoundingClientRect().top,
    };
  });
  // Jack's theme has an intentional page-frame inset. Pull-under means both
  // surfaces share the same framed top edge, not necessarily viewport y=0.
  expect(geometry.headerTop).toBe(geometry.sectionTop);
  await expect(firstSection).toBeVisible();
});
