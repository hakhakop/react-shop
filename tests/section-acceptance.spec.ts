import { expect, test, type Page } from "@playwright/test";
import fixture from "./fixtures/section-acceptance.json";

const email = "header-parity-20260722@example.test";
const password = "HeaderParity!2026";
const builderUrl = "/app/websites/header-parity-site/builder?page=home";
const previewUrl = "/app/websites/header-parity-site/preview?page=home";

async function signIn(page: Page) {
  await page.goto("/login");
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/app(?:\?|$)/);
}

test("Phase 2 Section acceptance fixture has Builder/frontend parity", async ({ page, context }) => {
  await signIn(page);
  const originalResponse = await page.request.get("/api/builder-layouts?key=home&websiteId=header-parity-site");
  const originalPayload = await originalResponse.json();
  const original = originalPayload.layout;
  const fixtureLayout = { ...original, sections: [fixture] };

  try {
    const install = await page.request.post("/api/builder-layouts?websiteId=header-parity-site", {
      data: { key: "home", design: original.design, sections: fixtureLayout.sections },
    });
    expect(install.ok()).toBeTruthy();

    await page.goto(builderUrl);
    await page.setViewportSize({ width: 1280, height: 900 });
    const builderSection = page.locator(".builder-preview-section").first();
    await expect(builderSection).toBeVisible();
    await expect(builderSection).toHaveAttribute("data-builder-html-element", "section");
    await expect(builderSection).toHaveAttribute("data-section-title-breakpoint", "small");
    await expect(builderSection).toHaveClass(/shop-builder-section--title-left-top/);
    await expect(builderSection).toHaveClass(/shop-builder-section--title-rotate-left/);
    await expect(builderSection.locator(".shop-builder-title")).toContainText("Section acceptance title");
    const builderTitleStyle = await builderSection.locator("[data-builder-section-title]").evaluate((node) => {
      const heading = node.parentElement;
      const computed = getComputedStyle(heading ?? node);
      return { writingMode: computed.writingMode, alignSelf: computed.alignSelf, transform: computed.transform };
    });
    expect(builderTitleStyle.writingMode).toBe("vertical-rl");
    expect(builderTitleStyle.alignSelf).toBe("flex-start");
    expect(builderTitleStyle.transform).not.toBe("none");

    const frontend = await context.newPage();
    await frontend.setViewportSize({ width: 1280, height: 900 });
    await frontend.goto(previewUrl);
    const storefrontSection = frontend.locator(".shop-builder-section").first();
    await expect(storefrontSection).toBeVisible();
    await expect(storefrontSection).toHaveJSProperty("tagName", "SECTION");
    await expect(storefrontSection).toHaveAttribute("data-builder-html-element", "section");
    await expect(storefrontSection).toHaveAttribute("data-section-title-breakpoint", "small");
    await expect(storefrontSection).toHaveClass(/shop-builder-section--title-left-top/);
    await expect(storefrontSection).toHaveClass(/shop-builder-section--title-rotate-left/);
    await expect(storefrontSection.locator(".shop-builder-title")).toContainText("Section acceptance title");
    const frontendTitleStyle = await storefrontSection.locator("[data-builder-section-title]").evaluate((node) => {
      const heading = node.parentElement;
      const computed = getComputedStyle(heading ?? node);
      return { writingMode: computed.writingMode, alignSelf: computed.alignSelf, transform: computed.transform };
    });
    expect(frontendTitleStyle).toEqual(builderTitleStyle);

    await page.setViewportSize({ width: 500, height: 900 });
    await frontend.setViewportSize({ width: 500, height: 900 });
    await page.reload();
    await frontend.reload();
    const builderSmallStyle = await page.locator(".builder-preview-section [data-builder-section-title]").evaluate((node) => getComputedStyle(node.parentElement ?? node).writingMode);
    const frontendSmallStyle = await frontend.locator(".shop-builder-section [data-builder-section-title]").evaluate((node) => getComputedStyle(node.parentElement ?? node).writingMode);
    expect(builderSmallStyle).toBe("horizontal-tb");
    expect(frontendSmallStyle).toBe(builderSmallStyle);

    const alternate = { ...fixture, sectionTitlePosition: "right-center", sectionTitleRotation: "right" };
    const alternateSave = await page.request.post("/api/builder-layouts?websiteId=header-parity-site", {
      data: { key: "home", design: original.design, sections: [alternate] },
    });
    expect(alternateSave.ok()).toBeTruthy();
    await page.setViewportSize({ width: 1280, height: 900 });
    await frontend.setViewportSize({ width: 1280, height: 900 });
    await page.evaluate(() => {
      Object.keys(localStorage)
        .filter((key) => key.startsWith("react-shop-visual-builder"))
        .forEach((key) => localStorage.removeItem(key));
    });
    await page.reload();
    await frontend.reload();
    await expect(page.locator(".builder-preview-section").first()).toHaveClass(/shop-builder-section--title-right-center/);
    await expect(page.locator(".builder-preview-section").first()).toHaveClass(/shop-builder-section--title-rotate-right/);
    await expect(frontend.locator(".shop-builder-section").first()).toHaveClass(/shop-builder-section--title-right-center/);
    await expect(frontend.locator(".shop-builder-section").first()).toHaveClass(/shop-builder-section--title-rotate-right/);
  } finally {
    const restore = await page.request.post("/api/builder-layouts?websiteId=header-parity-site", {
      data: { key: "home", design: original.design, sections: original.sections },
    });
    expect(restore.ok()).toBeTruthy();
  }
});
