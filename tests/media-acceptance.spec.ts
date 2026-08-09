import { expect, test, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import { mapYoothemeStaticContent } from "@/lib/yoothemePageImport";
import fixture from "./fixtures/media-acceptance.json";

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

test("Phase 5 imports canonical natural media dimensions and focal positions in Builder and storefront", async ({ page, context }) => {
  await page.goto("/login");
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/app(?:\?|$)/);

  const layoutResponse = await page.request.get(`/api/builder-layouts?key=home&websiteId=${websiteId}`);
  if (!layoutResponse.ok()) throw new Error(`Layout fixture request failed: ${layoutResponse.status()}`);
  const originalLayout = (await layoutResponse.json()).layout;
  const mapped = mapYoothemeStaticContent(fixture);
  expect(mapped.warnings).toEqual([]);

  const blocks = mapped.sections[0]?.layoutItems?.flatMap((item) => item.blocks) ?? [];
  const [image, intrinsicImage, grid, panel, slider] = blocks;
  expect(image).toMatchObject({ kind: "image", imageWidth: "360", imageHeight: "180", imagePosition: "bottom-right", imageLoading: "eager" });
  expect(intrinsicImage).toMatchObject({ kind: "image", imageWidth: "750", imageLoading: "eager" });
  expect("imageHeight" in (intrinsicImage ?? {})).toBe(false);
  expect("imageRatio" in (intrinsicImage ?? {})).toBe(false);
  expect(grid).toMatchObject({ kind: "grid", imageWidth: "320", imageHeight: "160", imagePosition: "top-left", imageLoading: "eager" });
  expect(panel).toMatchObject({ kind: "panel", imageWidth: "300", imageHeight: "150", imagePosition: "bottom-left", imageLoading: "eager" });
  expect(slider).toMatchObject({ kind: "panelSlider" });
  expect((slider as any)?.slides?.[0]).toMatchObject({ imageWidth: "280", imageHeight: "140", imagePosition: "top-right", imageLoading: "eager" });

  try {
    expect((await page.request.post(`/api/builder-layouts?websiteId=${websiteId}`, {
      data: { key: "home", design: originalLayout.design, sections: mapped.sections },
    })).ok()).toBeTruthy();

    await page.setViewportSize({ width: 1280, height: 900 });
    await clearBuilderCache(page);
    await page.goto(builderUrl);
    const standalone = page.locator('[data-builder-block-key="yootheme-image-0-0-0-0"]');
    const intrinsic = page.locator('[data-builder-block-key="yootheme-image-0-0-0-1"]');
    const gridBlock = page.locator('[data-builder-block-key="yootheme-grid-0-0-0-2"]');
    const panelBlock = page.locator('[data-builder-block-key="yootheme-panel-0-0-0-3"]');
    const sliderBlock = page.locator('[data-builder-block-key="yootheme-panel-slider-0-0-0-4"]');
    await expect(standalone.locator("img")).toHaveAttribute("loading", "eager");
    await expect(intrinsic.locator("img")).toHaveAttribute("loading", "eager");
    await expect.poll(async () => intrinsic.locator("img").evaluate((element: HTMLImageElement) => element.naturalWidth)).toBeGreaterThan(0);
    await expect(gridBlock.locator("img").first()).toHaveAttribute("loading", "eager");
    await expect(panelBlock.locator(".shop-builder-panel-media")).toBeVisible();
    await expect(sliderBlock.locator("img").first()).toBeVisible();

    const builderState = await page.locator("body").evaluate(() => {
      const block = (key: string) => document.querySelector<HTMLElement>(`[data-builder-block-key="${key}"]`);
      const image = block("yootheme-image-0-0-0-0")?.querySelector<HTMLElement>("img");
      const figure = image?.closest<HTMLElement>("figure");
      const intrinsic = block("yootheme-image-0-0-0-1")?.querySelector<HTMLImageElement>("img");
      const intrinsicFigure = intrinsic?.closest<HTMLElement>("figure");
      const grid = block("yootheme-grid-0-0-0-2")?.querySelector<HTMLElement>(".shop-builder-grid-image img");
      const panel = block("yootheme-panel-0-0-0-3")?.querySelector<HTMLElement>(".shop-builder-panel-media");
      const slider = block("yootheme-panel-slider-0-0-0-4")?.querySelector<HTMLElement>(".shop-builder-panel-slider-media");
      if (!image || !figure || !intrinsic || !intrinsicFigure || !grid || !panel || !slider) throw new Error("Phase 5 fixture media structure missing");
      return {
        standalone: { width: figure.style.width, height: figure.style.height, position: getComputedStyle(image).objectPosition, fit: getComputedStyle(image).objectFit },
        intrinsic: { width: intrinsicFigure.getBoundingClientRect().width, height: intrinsicFigure.getBoundingClientRect().height, naturalWidth: intrinsic.naturalWidth, naturalHeight: intrinsic.naturalHeight, widthAttribute: intrinsic.getAttribute("width"), heightAttribute: intrinsic.getAttribute("height") },
        grid: { width: grid.style.width, height: grid.style.height, position: getComputedStyle(grid).objectPosition, fit: getComputedStyle(grid).objectFit },
        panel: { width: panel.style.width, height: panel.style.height, position: getComputedStyle(panel).backgroundPosition, size: getComputedStyle(panel).backgroundSize },
        slider: { width: slider.style.width, height: slider.style.height, computedHeight: getComputedStyle(slider).height, position: getComputedStyle(slider.querySelector("img")!).objectPosition, fit: getComputedStyle(slider.querySelector("img")!).objectFit },
      };
    });
    expect(builderState.standalone).toMatchObject({ width: "360px", height: "180px", position: "100% 100%" });
    // Width-only media has no authored frame. It must be driven by this
    // portrait asset (1200×1600), rather than Next Image's former 1200×800
    // fallback. A 3:2 synthetic frame would yield 750×500 instead of 750×1000.
    expect(builderState.intrinsic).toMatchObject({ width: 750, height: 1000, naturalWidth: 1200, naturalHeight: 1600, widthAttribute: null, heightAttribute: null });
    expect(builderState.grid).toMatchObject({ width: "320px", height: "160px", position: "0% 0%" });
    expect(builderState.panel).toMatchObject({ width: "300px", height: "150px", position: "0% 100%" });
    expect(builderState.slider).toMatchObject({ width: "280px", position: "100% 0%" });
    expect(parseFloat(builderState.slider.computedHeight)).toBeGreaterThan(0);
    expect(builderState.standalone.fit).not.toBe("cover");
    expect(builderState.grid.fit).not.toBe("cover");
    expect(builderState.panel.size).not.toBe("cover");
    expect(builderState.slider.fit).not.toBe("cover");

    const storefront = await context.newPage();
    await storefront.setViewportSize({ width: 1280, height: 900 });
    await storefront.goto(previewUrl);
    const storefrontState = await storefront.locator("body").evaluate(() => {
      const image = document.querySelector<HTMLElement>('img[alt="Standalone canonical media"]');
      const figure = image?.closest<HTMLElement>("figure");
      const intrinsic = document.querySelector<HTMLImageElement>('img[alt="Width-only intrinsic media"]');
      const intrinsicFigure = intrinsic?.closest<HTMLElement>("figure");
      const grid = document.querySelector<HTMLElement>('.shop-builder-grid-image img[alt="Grid canonical media"]');
      const panel = Array.from(document.querySelectorAll<HTMLElement>(".shop-builder-column-block--panel"))
        .find((element) => element.textContent?.includes("Panel canonical media"))
        ?.querySelector<HTMLElement>(".shop-builder-panel-media");
      const sliderImage = document.querySelector<HTMLElement>('img[alt="Slider canonical media"]');
      const slider = sliderImage?.closest<HTMLElement>(".shop-builder-panel-slider-media");
      if (!image || !figure || !intrinsic || !intrinsicFigure || !grid || !panel || !slider) throw new Error("Phase 5 storefront media structure missing");
      return {
        standalone: { width: figure.style.width, height: figure.style.height, position: getComputedStyle(image).objectPosition, fit: getComputedStyle(image).objectFit },
        intrinsic: { width: intrinsicFigure.getBoundingClientRect().width, height: intrinsicFigure.getBoundingClientRect().height, naturalWidth: intrinsic.naturalWidth, naturalHeight: intrinsic.naturalHeight, widthAttribute: intrinsic.getAttribute("width"), heightAttribute: intrinsic.getAttribute("height") },
        grid: { width: grid.style.width, height: grid.style.height, position: getComputedStyle(grid).objectPosition, fit: getComputedStyle(grid).objectFit },
        panel: { width: panel.style.width, height: panel.style.height, position: getComputedStyle(panel).backgroundPosition, size: getComputedStyle(panel).backgroundSize },
        slider: { width: slider.style.width, height: slider.style.height, computedHeight: getComputedStyle(slider).height, position: getComputedStyle(slider.querySelector("img")!).objectPosition, fit: getComputedStyle(slider.querySelector("img")!).objectFit },
      };
    });
    expect(storefrontState).toEqual(builderState);
    await storefront.close();
  } finally {
    await page.request.post(`/api/builder-layouts?websiteId=${websiteId}`, {
      data: { key: "home", design: originalLayout.design, sections: originalLayout.sections },
    });
  }
});

test("DevStack hero media keeps image-sized anchors separate from Phase 3 offsets", () => {
  const devStack = JSON.parse(readFileSync("/Users/hakobjaghatspanyan/Downloads/Home.json", "utf8"));
  const mapped = mapYoothemeStaticContent(devStack);
  const blocks = mapped.sections[0]?.layoutItems?.flatMap((item) => item.blocks) ?? [];
  const byId = new Map(blocks.flatMap((block) => block ? [[block.id, block] as const] : []));

  // These source decorations have position_left/position_right but no
  // text_align. They must anchor the image-sized media to that source edge;
  // Phase 3 continues to own the actual absolute offsets on visualStyle.
  expect(byId.get("yootheme-image-0-0-0-3")).toMatchObject({
    imageWidth: "600",
    imageAlignment: "left",
    visualStyle: { layout: { position: "absolute", left: "-20vw", top: "22vh" } },
  });
  expect(byId.get("yootheme-image-0-0-0-5")).toMatchObject({
    imageWidth: "700",
    imageAlignment: "left",
    visualStyle: { layout: { position: "absolute", left: "39vw", top: "15vh" } },
  });
  expect(byId.get("yootheme-image-0-1-0-0")).toMatchObject({
    imageWidth: "750",
    imageAlignment: "center",
    imageLoading: "eager",
    visualStyle: { layout: { position: "relative", zIndex: 1 } },
  });
});
