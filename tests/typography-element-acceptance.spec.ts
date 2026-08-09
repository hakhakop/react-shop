import { expect, test, type Page } from "@playwright/test";
import { mapYoothemeStaticContent } from "@/lib/yoothemePageImport";
import fixture from "./fixtures/typography-acceptance.json";

const email = "header-parity-20260722@example.test";
const password = "HeaderParity!2026";
const websiteId = "header-parity-site";
const builderUrl = `/app/websites/${websiteId}/builder?page=home`;
const previewUrl = `/app/websites/${websiteId}/preview?page=home`;

async function clearBuilderCache(page: Page) {
  await page.evaluate(() => {
    Object.keys(localStorage)
      .filter((key) => key.startsWith("react-shop-visual-builder"))
      .forEach((key) => localStorage.removeItem(key));
  });
}

test("Phase 4 Heading and Text imports use canonical typography in Builder and storefront", async ({ page, context }) => {
  await page.goto("/login");
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/app(?:\?|$)/);

  const layoutResponse = await page.request.get(`/api/builder-layouts?key=home&websiteId=${websiteId}`);
  if (!layoutResponse.ok()) throw new Error(`Layout fixture request failed: ${layoutResponse.status()} ${await layoutResponse.text()}`);
  const originalLayout = (await layoutResponse.json()).layout;
  expect(originalLayout).toBeTruthy();
  const shellResponse = await page.request.get(`/api/builder-shell?websiteId=${websiteId}`);
  expect(shellResponse.ok()).toBeTruthy();
  const originalShell = (await shellResponse.json()).settings;
  expect(originalShell).toBeTruthy();
  const mapped = mapYoothemeStaticContent(fixture);
  const fixtureDesign = { ...originalLayout.design, headingFontFamily: undefined };
  const [heading, text] = mapped.sections[0]?.layoutItems?.[0]?.blocks ?? [];
  if (!heading || !text) throw new Error("Typography fixture did not map both canonical blocks");
  expect(heading).toMatchObject({ headingSize: "3xlarge", headingTypographyRole: "primary", headingLevel: "div" });
  expect(text).toMatchObject({ textVariant: "lead", textColor: "primary", textDropcap: true, textColumns: "1-2", textColumnBreakpoint: "small", textHtmlElement: "aside" });

  try {
    expect((await page.request.post(`/api/builder-shell?websiteId=${websiteId}`, {
      data: { ...originalShell, fontFamilyHeading: "Manrope", fontFamilyPrimary: "Playfair Display" },
    })).ok()).toBeTruthy();
    expect((await page.request.post(`/api/builder-layouts?websiteId=${websiteId}`, {
      data: { key: "home", design: fixtureDesign, sections: mapped.sections },
    })).ok()).toBeTruthy();

    await page.setViewportSize({ width: 1280, height: 900 });
    await clearBuilderCache(page);
    await page.goto(builderUrl);
    const builderHeading = page.locator('[data-builder-block-key="yootheme-heading-0-0-0-0"] .shop-builder-title');
    const builderTextBlock = page.locator('[data-builder-block-key="yootheme-text-0-0-0-1"] .shop-builder-column-block--text');
    const builderText = page.locator('[data-builder-block-key="yootheme-text-0-0-0-1"] .shop-builder-text-content');
    await expect(builderHeading).toHaveJSProperty("tagName", "DIV");
    await expect(builderHeading).toHaveClass(/uk-heading-3xlarge/);
    await expect(builderHeading).toHaveClass(/webpages-typography-role-primary/);
    await expect(builderText).toHaveJSProperty("tagName", "ASIDE");
    await expect(builderTextBlock).toHaveClass(/uk-text-lead/);
    await expect(builderTextBlock).toHaveClass(/uk-text-primary/);
    await expect(builderText).toHaveClass(/uk-dropcap/);
    await expect(builderText).toHaveClass(/uk-column-1-2@s/);
    await expect(builderText).toHaveClass(/uk-column-divider/);
    const builderState = await page.locator('[data-builder-block-key="yootheme-heading-0-0-0-0"]').evaluate((shell) => {
      const heading = shell.querySelector<HTMLElement>(".shop-builder-title");
      const text = document.querySelector<HTMLElement>('[data-builder-block-key="yootheme-text-0-0-0-1"] .shop-builder-text-content');
      if (!heading || !text) throw new Error("Typography fixture structure missing");
      return { headingFont: getComputedStyle(heading).fontFamily, headingSize: getComputedStyle(heading).fontSize, textColumns: getComputedStyle(text).columnCount };
    });
    expect(builderState.headingFont).toContain("Playfair Display");
    expect(Number(builderState.headingSize.replace("px", ""))).toBeGreaterThan(60);
    expect(builderState.textColumns).toBe("2");

    const storefront = await context.newPage();
    await storefront.setViewportSize({ width: 1280, height: 900 });
    await storefront.goto(previewUrl);
    const storefrontHeading = storefront.locator('[data-builder-block-id="yootheme-heading-0-0-0-0"] .shop-builder-title');
    const storefrontText = storefront.locator('[data-builder-block-id="yootheme-text-0-0-0-1"] .shop-builder-text-content');
    await expect(storefrontHeading).toHaveJSProperty("tagName", "DIV");
    await expect(storefrontText).toHaveJSProperty("tagName", "ASIDE");
    const storefrontState = await storefront.locator('[data-builder-block-id="yootheme-heading-0-0-0-0"]').evaluate((shell) => {
      const heading = shell.querySelector<HTMLElement>(".shop-builder-title");
      const text = document.querySelector<HTMLElement>('[data-builder-block-id="yootheme-text-0-0-0-1"] .shop-builder-text-content');
      if (!heading || !text) throw new Error("Typography fixture structure missing");
      return { headingFont: getComputedStyle(heading).fontFamily, headingSize: getComputedStyle(heading).fontSize, textColumns: getComputedStyle(text).columnCount };
    });
    expect(storefrontState).toEqual(builderState);

    // Resetting the element's semantic Font Family must return to the Heading
    // global, rather than retaining the prior Primary override.
    const inheritedSections = JSON.parse(JSON.stringify(mapped.sections));
    delete inheritedSections[0].layoutItems[0].blocks[0].headingTypographyRole;
    expect((await page.request.post(`/api/builder-layouts?websiteId=${websiteId}`, {
      data: { key: "home", design: fixtureDesign, sections: inheritedSections },
    })).ok()).toBeTruthy();
    await clearBuilderCache(page);
    await page.goto(`${builderUrl}&typography=inherit`);
    const inheritedBuilderFont = await page.locator('[data-builder-block-key="yootheme-heading-0-0-0-0"] .shop-builder-title').evaluate((node) => getComputedStyle(node).fontFamily);
    await storefront.goto(`${previewUrl}&typography=inherit`);
    const inheritedStorefrontFont = await storefront.locator('[data-builder-block-id="yootheme-heading-0-0-0-0"] .shop-builder-title').evaluate((node) => getComputedStyle(node).fontFamily);
    expect(inheritedBuilderFont).toContain("Manrope");
    expect(inheritedStorefrontFont).toBe(inheritedBuilderFont);
  } finally {
    await page.request.post(`/api/builder-shell?websiteId=${websiteId}`, { data: originalShell });
    await page.request.post(`/api/builder-layouts?websiteId=${websiteId}`, {
      data: { key: "home", design: originalLayout.design, sections: originalLayout.sections },
    });
  }
});
