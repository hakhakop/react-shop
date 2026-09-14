import { expect, test } from "@playwright/test";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const email = "header-parity-20260722@example.test";
const password = "HeaderParity!2026";
const websiteId = "eb65bd05-1299-4071-b432-f3c04e9eda2e";
const dataRoot = path.resolve("data/websites", websiteId);
const websitesPath = path.resolve("data/websites.json");
const layoutsPath = path.join(dataRoot, "builder-layouts.json");
const originalWebsites = readFileSync(websitesPath, "utf8");
const originalLayouts = readFileSync(layoutsPath, "utf8");

test.beforeAll(() => {
  const websites = JSON.parse(originalWebsites) as Array<Record<string, unknown>>;
  const website = websites.find((entry) => entry.id === websiteId);
  if (website) website.enabledLanguages = ["hy", "en", "ru"];
  writeFileSync(websitesPath, JSON.stringify(websites, null, 2));

  const layouts = JSON.parse(originalLayouts) as Record<string, any>;
  const home = layouts.home;
  const textBlock = home.sections
    .flatMap((section: any) => section.layoutItems ?? [])
    .flatMap((item: any) => item.blocks ?? [])
    .find((block: any) => block.kind === "text");
  if (textBlock) {
    textBlock.contentTranslations = {
      en: { title: "English preview title", body: "<p>English preview body</p>" },
      ru: { title: "Русский заголовок", body: "<p>Русский текст</p>" },
    };
  }
  const headerSection = layouts.header.sections.find((section: any) => section.id === "header-document");
  const rightColumn = headerSection?.layoutItems?.find((item: any) => item.id === "header-main-right");
  if (rightColumn && !rightColumn.blocks.some((block: any) => block.kind === "headerLanguage")) {
    rightColumn.blocks.push({ id: "header-language", kind: "headerLanguage", headerLanguageDisplay: "native" });
  }
  writeFileSync(layoutsPath, JSON.stringify(layouts, null, 2));
});

test.afterAll(() => {
  writeFileSync(websitesPath, originalWebsites);
  writeFileSync(layoutsPath, originalLayouts);
});

test("builder toolbar and Header language switcher share the translated preview locale", async ({ page, context }) => {
  await page.goto("/login");
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/app(?:\?|$)/);
  await page.goto("/app/websites/header-parity-site/builder?page=home");

  const toolbar = page.getByTestId("builder-language-selector");
  const headers = page.locator('.website-language-switcher select[aria-label="Website language"]');
  const header = headers.first();
  const translatedBody = page.getByText("English preview body", { exact: true });
  const russianBody = page.getByText("Русский текст", { exact: true });

  await expect(toolbar).toHaveValue("hy");
  await expect.poll(async () => headers.evaluateAll((items) => items.map((item) => (item as HTMLSelectElement).value))).toEqual(["hy", "hy"]);

  await toolbar.selectOption("en");
  await expect(toolbar).toHaveValue("en");
  await expect.poll(async () => headers.evaluateAll((items) => items.map((item) => (item as HTMLSelectElement).value))).toEqual(["en", "en"]);
  await expect(translatedBody).toBeVisible();
  await expect(page.getByText("Русский текст", { exact: true })).toHaveCount(0);

  await header.selectOption("ru");
  await expect(toolbar).toHaveValue("ru");
  await expect.poll(async () => headers.evaluateAll((items) => items.map((item) => (item as HTMLSelectElement).value))).toEqual(["ru", "ru"]);
  await expect(russianBody).toBeVisible();
  await expect(translatedBody).toHaveCount(0);

  await header.selectOption("en");
  await expect(toolbar).toHaveValue("en");
  await expect.poll(async () => headers.evaluateAll((items) => items.map((item) => (item as HTMLSelectElement).value))).toEqual(["en", "en"]);
  await expect(translatedBody).toBeVisible();

  await context.addCookies([{
    name: `website_content_language_${websiteId}`,
    value: "en",
    url: new URL(page.url()).origin,
  }]);
  const frontend = await context.newPage();
  await frontend.goto("/app/websites/header-parity-site/preview?page=home");
  await expect(frontend.getByText("English preview body", { exact: true })).toBeVisible();
  await frontend.close();
});
