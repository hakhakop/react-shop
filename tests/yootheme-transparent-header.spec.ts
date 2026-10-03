import { expect, test } from "@playwright/test";
import { mapYoothemeStaticContent } from "@/lib/yoothemePageImport";
import { normalizeYoothemeSection, normalizeYoothemeTypography } from "@/lib/yoothemeImportContract";

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

test("imports YOOtheme section padding presets from independent top and bottom fields", () => {
  expect(normalizeYoothemeSection({ padding_top: "large", padding_bottom: "large" })).toMatchObject({
    sectionPadding: "large",
  });
  expect(normalizeYoothemeSection({ padding_top: "none", padding_bottom: "none" })).toMatchObject({
    sectionPadding: "none",
  });
  expect(normalizeYoothemeSection({ padding_top: "large", padding_bottom: "none" })).toMatchObject({
    sectionPaddingTop: "large",
    sectionPaddingBottom: "none",
  });
});

test("promotes portable YOOtheme root CSS typography into canonical local settings", () => {
  expect(normalizeYoothemeTypography({
    css: ".el-element { text-transform: none; font-size: 30px; }",
  })).toMatchObject({
    typography: { fontSize: "30px", textTransform: "none" },
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

test("Makai homepage renders imported section spacing and semantic font tokens", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1100 });
  await page.goto("/makai");

  const sections = page.locator("main.shop-builder-main[data-builder-page-root] .shop-builder-section");
  await expect(sections).toHaveCount(6);
  for (let index = 0; index < 5; index += 1) {
    await expect(sections.nth(index)).toHaveClass(/uk-section-large/);
    await expect(sections.nth(index)).toHaveCSS("padding-top", "140px");
    await expect(sections.nth(index)).toHaveCSS("padding-bottom", "140px");
  }
  await expect(sections.nth(5)).toHaveClass(/uk-padding-remove-vertical/);
  await expect(sections.nth(5)).toHaveCSS("padding-top", "0px");
  await expect(sections.nth(5)).toHaveCSS("padding-bottom", "0px");

  const heroHeading = page.locator("main.shop-builder-main .shop-builder-title", { hasText: "Surf School on the Atlantic" }).first();
  await expect(heroHeading).toHaveCSS("font-family", /Playfair Display/);
  const tertiaryHeading = page.locator("main.shop-builder-main .shop-builder-title.webpages-typography-role-tertiary").first();
  await expect(tertiaryHeading).toHaveCSS("font-family", /Homemade Apple/);
  await expect(tertiaryHeading).toHaveCSS("font-size", "30px");

  await expect(page.locator(".site-header .header-builder-element--social a")).toHaveCount(3);
  const logoSvg = page.locator(".site-header-logo-primary svg");
  await expect(logoSvg).toBeVisible();
  await expect(logoSvg).toHaveCSS("color", "rgba(255, 255, 255, 0.95)");
  const verticalDivider = page.locator("main.shop-builder-main .uk-divider-vertical").first();
  await expect(verticalDivider).toBeVisible();
  await expect(verticalDivider).toHaveCSS("height", "100px");
  await expect(page.locator("main.shop-builder-main .shop-builder-title", { hasText: "Hang Loose Ltd." }).locator("a")).toHaveCSS("color", "rgb(13, 23, 36)");
});
