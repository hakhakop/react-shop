import { expect, test, type Locator, type Page } from "@playwright/test";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const email = "header-parity-20260722@example.test";
const password = "HeaderParity!2026";
const builderUrl = "/app/websites/header-parity-site/builder?page=header";
const previewUrl = "/app/websites/header-parity-site/preview?page=home";
const layoutsPath = resolve(
  process.cwd(),
  "data/websites/eb65bd05-1299-4071-b432-f3c04e9eda2e/builder-layouts.json",
);
const websitesPath = resolve(process.cwd(), "data/websites.json");
const websiteId = "eb65bd05-1299-4071-b432-f3c04e9eda2e";
const ORIGINAL_WEBSITE_LANGUAGES = ["hy"];

const ORIGINAL_HEADER_ITEMS = [
  {
    id: "header-main-left",
    rowId: "header-main-row",
    rowLayout: "quarters-1-2-1",
    blocks: [
      {
        id: "header-logo",
        kind: "image",
        headerBrandMode: "both",
        headerBrandText: "WebPages",
        imageMaxWidth: 140,
        imageAlignment: "left",
      },
    ],
  },
  {
    id: "header-main-center",
    rowId: "header-main-row",
    rowLayout: "quarters-1-2-1",
    blocks: [
      {
        id: "header-navigation",
        kind: "menu",
        title: "Navigation",
        menuSource: "main",
        menuActiveIndicator: "underline",
        elementAlign: "center",
      },
    ],
  },
  {
    id: "header-main-right",
    rowId: "header-main-row",
    rowLayout: "quarters-1-2-1",
    blocks: [
      {
        id: "header-utility-search",
        kind: "headerSearch",
        headerUtilityAction: "search",
        headerUtilityVariant: "ghost",
        elementAlign: "right",
      },
      {
        id: "header-utility-cart",
        kind: "headerCart",
        headerUtilityAction: "cart",
        headerUtilityVariant: "ghost",
        elementAlign: "right",
      },
    ],
  },
];

function restoreHeaderFixture() {
  const data = JSON.parse(readFileSync(layoutsPath, "utf8"));
  const header = data["header"];
  if (!header) return;
  const doc = (header.sections ?? []).find(
    (section: { id?: string }) => section.id === "header-document",
  );
  if (!doc) return;
  doc.layoutItems = ORIGINAL_HEADER_ITEMS;
  writeFileSync(layoutsPath, JSON.stringify(data, null, 2));
}

function setWebsiteLanguages(languages: string[]) {
  const websites = JSON.parse(readFileSync(websitesPath, "utf8")) as Array<{
    id?: string;
    enabledLanguages?: string[];
  }>;
  const website = websites.find((entry) => entry.id === websiteId);
  if (!website) return;
  website.enabledLanguages = languages;
  writeFileSync(websitesPath, JSON.stringify(websites, null, 2));
}

async function computedFontSize(page: Page, selector: string) {
  return page
    .locator(selector)
    .first()
    .evaluate((el) => getComputedStyle(el).fontSize);
}

async function selectHeaderElement(page: Page, elementClass: string) {
  const element = page
    .locator(`.builder-header-live-element.${elementClass}`)
    .first();
  await element.hover();
  await element
    .locator(".builder-preview-block-tools")
    .getByRole("button", { name: "Edit element" })
    .click();
  const inspector = page.locator(".builder-floating-inspector");
  await expect(inspector).toBeVisible();
  return inspector;
}

async function openTypographyTab(inspector: Locator) {
  await inspector
    .locator(".builder-inspector-tabs button", { hasText: "Typography" })
    .click();
}

async function setFontSizeChip(
  inspector: Locator,
  areaLabel: string,
  chipLabel: string,
) {
  const areaPanel = inspector.locator(".builder-typography-area-panel", {
    hasText: areaLabel,
  });
  const fontSizeField = areaPanel
    .locator(".builder-typography-field")
    .filter({ hasText: "Font Size" });
  await fontSizeField
    .getByRole("button", { name: chipLabel, exact: true })
    .click();
}

async function assertFontSize(
  page: Page,
  selector: string,
  expectedPx: string,
) {
  await expect
    .poll(() => computedFontSize(page, selector), { timeout: 10000 })
    .toBe(expectedPx);
}

async function publish(page: Page) {
  await Promise.all([
    page.waitForResponse(
      (response) =>
        response.request().method() === "POST" &&
        response.url().includes("/api/builder-layouts"),
    ),
    page.getByRole("button", { name: "Publish", exact: true }).click(),
  ]);
  await expect(page.getByText("Published successfully", { exact: true })).toBeVisible();
}

async function addElementFromLibrary(page: Page, query: string) {
  await page.locator(".builder-element-library-search input").fill(query);
  const card = page.locator(".builder-element-library-card").first();
  await expect(card).toBeVisible();
  await card.click();
  const inspector = page.locator(".builder-floating-inspector");
  await expect(inspector).toBeVisible();
  return inspector;
}

test.beforeAll(() => {
  setWebsiteLanguages(["hy", "en", "ru"]);
});

test.afterAll(() => {
  setWebsiteLanguages(ORIGINAL_WEBSITE_LANGUAGES);
});

test.beforeEach(async ({ page }) => {
  restoreHeaderFixture();
  await page.goto("/login");
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/app(?:\?|$)/);
});

// The builder preview workspaces shrink when an element is selected (docked
// inspector). Keep the workspace above the header's 640px container breakpoint
// so the desktop nav stays visible while editing.
// The builder preview workspaces shrink when an element is selected (docked
// inspector). Keep the workspace above the header's 640px container breakpoint
// so the desktop nav stays visible while editing.
test.use({ viewport: { width: 1920, height: 1200 } });

test.afterEach(() => {
  restoreHeaderFixture();
});

test("Header element typography is canonical, per-element, and rendered by the shared header", async ({
  page,
  context,
}) => {
  await page.goto(builderUrl);
  await expect(page.locator(".builder-header-document-preview").first()).toBeVisible();

  await page
    .locator(".builder-sidebar-nav-tile", { hasText: "Blocks" })
    .first()
    .click();

  // 1. Utility element: no typography tab.
  const utilityInspector = await selectHeaderElement(page, "is-utility");
  await expect(
    utilityInspector.locator(".builder-inspector-tabs button", {
      hasText: "Typography",
    }),
  ).toHaveCount(0);

  // 2. Spacer element (embed): no typography tab.
  const spacerInspector = await addElementFromLibrary(page, "embed");
  await expect(
    spacerInspector.locator(".builder-inspector-tabs button", {
      hasText: "Typography",
    }),
  ).toHaveCount(0);

  // 3. Navigation typography (body area only).
  const navInspector = await selectHeaderElement(page, "is-navigation");
  await openTypographyTab(navInspector);
  await expect(
    navInspector.locator(".builder-typography-area-label", {
      hasText: "Body typography",
    }),
  ).toBeVisible();
  await expect(
    navInspector.locator(".builder-typography-area-tabs button"),
  ).toHaveCount(0);
  await setFontSizeChip(navInspector, "Body typography", "L");
  await assertFontSize(page, ".is-navigation .site-header-nav", "18px");

  // 4. Logo brand typography (title area only).
  const logoInspector = await selectHeaderElement(page, "is-logo");
  await openTypographyTab(logoInspector);
  await expect(
    logoInspector.locator(".builder-typography-area-label", {
      hasText: "Title typography",
    }),
  ).toBeVisible();
  await expect(
    logoInspector.locator(".builder-typography-area-tabs button"),
  ).toHaveCount(0);
  await setFontSizeChip(logoInspector, "Title typography", "XL");
  await assertFontSize(page, ".is-logo .site-header-brand span", "24px");

  // 5. CTA button typography (button area only).
  const buttonInspector = await addElementFromLibrary(page, "button");
  await openTypographyTab(buttonInspector);
  await expect(
    buttonInspector.locator(".builder-typography-area-label", {
      hasText: "Button typography",
    }),
  ).toBeVisible();
  await setFontSizeChip(buttonInspector, "Button typography", "M");
  await assertFontSize(page, ".is-button .site-header-button-element", "16px");

  // 6. Categories typography (button area only).
  const categoriesInspector = await addElementFromLibrary(page, "category");
  await openTypographyTab(categoriesInspector);
  await expect(
    categoriesInspector.locator(".builder-typography-area-label", {
      hasText: "Button typography",
    }),
  ).toBeVisible();
  await setFontSizeChip(categoriesInspector, "Button typography", "S");
  await assertFontSize(
    page,
    ".is-categories .site-header-categories-toggle",
    "14px",
  );

  // 7. Language switcher typography (button area only).
  const languageInspector = await addElementFromLibrary(page, "language");
  await openTypographyTab(languageInspector);
  await expect(
    languageInspector.locator(".builder-typography-area-label", {
      hasText: "Button typography",
    }),
  ).toBeVisible();
  await setFontSizeChip(languageInspector, "Button typography", "XS");
  await assertFontSize(
    page,
    ".is-language .website-language-switcher",
    "12px",
  );

  // 8. Publish and verify the same resolved typography on the storefront.
  await publish(page);

  const frontend = await context.newPage();
  await frontend.goto(previewUrl);
  await expect(frontend.locator(".site-header").first()).toBeVisible();
  await assertFontSize(frontend, ".site-header .site-header-nav", "18px");
  await assertFontSize(frontend, ".site-header .site-header-brand span", "24px");
  await assertFontSize(
    frontend,
    ".site-header .site-header-button-element",
    "16px",
  );
  await assertFontSize(
    frontend,
    ".site-header .site-header-categories-toggle",
    "14px",
  );
  await assertFontSize(
    frontend,
    ".site-header .website-language-switcher",
    "12px",
  );

  // 9. Persisted JSON: per-element typography, semantic fields only.
  const saved = JSON.parse(readFileSync(layoutsPath, "utf8"));
  const blocks: Array<Record<string, unknown>> = [];
  const walk = (value: unknown) => {
    if (Array.isArray(value)) {
      value.forEach(walk);
    } else if (value && typeof value === "object") {
      const record = value as Record<string, unknown>;
      if (typeof record.kind === "string") blocks.push(record);
      Object.values(record).forEach(walk);
    }
  };
  walk(saved);
  const findBlock = (id: string) =>
    blocks.find((block) => block.id === id);

  const navBlock = findBlock("header-navigation");
  expect(navBlock).toBeTruthy();
  expect(
    (navBlock!.typography as { body?: { fontSize?: string } })?.body?.fontSize,
  ).toBe("18px");

  const logoBlock = findBlock("header-logo");
  expect(logoBlock).toBeTruthy();
  expect(
    (logoBlock!.typography as { title?: { fontSize?: string } })?.title
      ?.fontSize,
  ).toBe("24px");

  const buttonBlock = findBlock("header-button");
  expect(buttonBlock).toBeTruthy();
  expect(
    (buttonBlock!.typography as { button?: { fontSize?: string } })?.button
      ?.fontSize,
  ).toBe("16px");

  const categoriesBlock = findBlock("header-categories");
  expect(categoriesBlock).toBeTruthy();
  expect(
    (categoriesBlock!.typography as { button?: { fontSize?: string } })?.button
      ?.fontSize,
  ).toBe("14px");

  const languageBlock = findBlock("header-language");
  expect(languageBlock).toBeTruthy();
  expect(
    (languageBlock!.typography as { button?: { fontSize?: string } })?.button
      ?.fontSize,
  ).toBe("12px");

  for (const block of [navBlock, logoBlock, buttonBlock, categoriesBlock, languageBlock]) {
    const typography = (block!.typography ?? {}) as Record<string, unknown>;
    expect(JSON.stringify(typography)).not.toMatch(/"uk-[a-z-]+"/);
  }

  const utilityBlock = findBlock("header-utility-search");
  expect(utilityBlock).toBeTruthy();
  expect(utilityBlock!.typography).toBeUndefined();
});
