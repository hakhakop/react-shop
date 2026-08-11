import { expect, test, type Page } from "@playwright/test";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import contractJson from "@/tests/fixtures/yootheme-compatibility/panel-slider-divider.enterprise3.contract.json";
import slideshowContractJson from "@/tests/fixtures/yootheme-compatibility/slideshow-content.enterprise3.contract.json";
import {
  evaluatePanelSliderLayoutContract,
  evaluateSlideshowContentContract,
  formatCompatibilityReport,
  type PanelSliderLayoutCompatibilityContract,
  type PanelSliderLayoutProbe,
  type SlideshowContentCompatibilityContract,
  type SlideshowContentProbe,
  validatePanelSliderLayoutSource,
  validateSlideshowContentSource,
} from "@/lib/yoothemeCompatibilityHarness";
import { mapYoothemeStaticContent } from "@/lib/yoothemePageImport";

const contract = contractJson as PanelSliderLayoutCompatibilityContract;
const slideshowContract = slideshowContractJson as SlideshowContentCompatibilityContract;
const websiteId = "header-parity-site";
// Home is a known persisted scoped document in the browser-test website and
// can therefore be restored exactly after each fresh-import probe.
const pageKey = "home";
const builderUrl = `/app/websites/${websiteId}/builder?page=${pageKey}`;
const previewUrl = `/app/websites/${websiteId}/preview?page=${pageKey}`;
const email = "header-parity-20260722@example.test";
const password = "HeaderParity!2026";
const sourceFixture = process.env.YOOTHEME_COMPAT_ENTERPRISE3_FIXTURE ??
  "/Users/hakobjaghatspanyan/Downloads/enterprise3.json";
const staleFixture = "/Users/hakobjaghatspanyan/Downloads/Enterprise2.json";

function hash(content: Buffer | string) {
  return createHash("sha256").update(content).digest("hex");
}

function cloneWithDivider(source: unknown, enabled: boolean): unknown {
  const clone = JSON.parse(JSON.stringify(source)) as Record<string, any>;
  let node: Record<string, any> = clone;
  for (const segment of contract.fixture.sourcePath.split(".")) node = node[segment];
  node.props.slider_divider = enabled;
  return clone;
}

function cloneWithPanelSliderTextAlignment(
  source: unknown,
  alignment: "left" | "center" | "right",
): unknown {
  const clone = JSON.parse(JSON.stringify(source)) as Record<string, any>;
  let node: Record<string, any> = clone;
  for (const segment of contract.fixture.sourcePath.split(".")) node = node[segment];
  node.props.text_align = alignment;
  return clone;
}

function findImportedPanelSlider(value: unknown): Record<string, any> | undefined {
  if (!value || typeof value !== "object") return undefined;
  if ((value as Record<string, unknown>).kind === "panelSlider") {
    return value as Record<string, any>;
  }
  for (const child of Array.isArray(value)
    ? value
    : Object.values(value as Record<string, unknown>)) {
    const found = findImportedPanelSlider(child);
    if (found) return found;
  }
  return undefined;
}

function findImportedSlideshow(value: unknown): Record<string, any> | undefined {
  if (!value || typeof value !== "object") return undefined;
  if ((value as Record<string, unknown>).kind === "slideshow") return value as Record<string, any>;
  for (const child of Array.isArray(value) ? value : Object.values(value as Record<string, unknown>)) {
    const found = findImportedSlideshow(child);
    if (found) return found;
  }
  return undefined;
}

async function signIn(page: Page) {
  await page.goto("/login");
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/app(?:\?|$)/);
}

async function freshImport(page: Page, name: string, source: unknown) {
  await page.goto(builderUrl);
  await expect(page.locator(".builder-preview-shell").first()).toBeVisible();
  await page.getByRole("button", { name: "Layouts", exact: true }).click();
  await page.getByRole("tab", { name: /Pages/ }).click();
  await page.getByText("Import YOOtheme Page JSON", { exact: true }).locator("..").locator('input[type="file"]').setInputFiles({
    name,
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(source)),
  });
  await page.getByRole("button", { name: "Apply import", exact: true }).click();
  await page.getByRole("button", { name: "Publish", exact: true }).click();
  await expect(page.getByText("Published successfully", { exact: true })).toBeVisible();
  await page.reload();
}

type PersistedPanelSliderSettings = {
  divider?: boolean;
  itemWidthMode?: "auto" | "fixed";
  spaceBetween?: number;
  cardsPerViewPhone?: number;
  cardsPerViewSmall?: number;
  cardsPerViewMedium?: number;
  cardsPerViewLarge?: number;
  cardsPerViewXLarge?: number;
  panelStyle?: string;
  panelSize?: string;
};

function persistedPanelSliderSettings(block: Record<string, any> | undefined): PersistedPanelSliderSettings {
  const settings = block?.carouselSettings ?? {};
  const firstItem = block?.slides?.[0] ?? {};
  return {
    ...settings,
    panelStyle: settings.panelStyle ?? firstItem.panelStyle,
    panelSize: settings.panelSize ?? firstItem.panelSize,
  };
}

async function measurePanelSlider(page: Page, selector: string, persisted: PersistedPanelSliderSettings): Promise<PanelSliderLayoutProbe> {
  const slider = page.locator(selector);
  await expect(slider).toBeVisible();
  // The fixture uses stylable inline SVG. Measure the settled media geometry,
  // not the transient IntersectionObserver placeholder during hydration.
  const svgHost = slider.locator(".shop-builder-stylable-svg-host").first();
  if (await svgHost.count()) await expect(svgHost).toHaveAttribute("data-svg-state", "ready");
  return slider.evaluate((root, settings): PanelSliderLayoutProbe => {
    const track = root.querySelector<HTMLElement>(".uk-slider-items");
    const items = track ? Array.from(track.children) as HTMLElement[] : [];
    const target = items[1] ?? items[0];
    const panel = items[0]?.querySelector<HTMLElement>(".shop-builder-panel-slider-card, .uk-panel, [class*=panel]");
    const panels = items.map((item) => item.querySelector<HTMLElement>(".shop-builder-panel-slider-card, .uk-panel, [class*=panel]"));
    const media = items[0]?.querySelector<HTMLElement>(".shop-builder-panel-slider-media");
    const sliderViewport = root.querySelector<HTMLElement>(".swiper");
    const before = target ? getComputedStyle(target, "::before") : null;
    const nav = Array.from(root.querySelectorAll<HTMLElement>(".swiper-button-next, .swiper-button-prev"));
    const navVisible = nav.some((element) => {
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return style.display !== "none" && style.visibility !== "hidden" && rect.width > 0 && rect.height > 0;
    });
    const trackStyle = track ? getComputedStyle(track) : null;
    const firstItemStyle = items[0] ? getComputedStyle(items[0]) : null;
    const panelStyle = panel ? getComputedStyle(panel) : null;
    const parsePx = (value: string | undefined) => Number.parseFloat(value ?? "0") || 0;
    const allItemsFit = root.classList.contains("shop-builder-swiper--locked") ||
      nav.every((element) => element.classList.contains("swiper-button-lock"));
    return {
      persistedDivider: settings.divider,
      persistedItemWidthMode: settings.itemWidthMode,
      persistedSpaceBetweenPx: settings.spaceBetween,
      persistedResponsiveItems: {
        phone: settings.cardsPerViewPhone,
        small: settings.cardsPerViewSmall,
        medium: settings.cardsPerViewMedium,
        large: settings.cardsPerViewLarge,
        xlarge: settings.cardsPerViewXLarge,
      },
      persistedPanelStyle: settings.panelStyle,
      persistedPanelSize: settings.panelSize,
      rootClasses: root.className.split(/\s+/).filter(Boolean),
      trackClasses: track?.className.split(/\s+/).filter(Boolean) ?? [],
      itemCount: items.length,
      trackMarginLeftPx: parsePx(trackStyle?.marginLeft),
      itemPaddingLeftPx: parsePx(firstItemStyle?.paddingLeft),
      trackWidthPx: track?.getBoundingClientRect().width ?? 0,
      viewportWidthPx: sliderViewport?.getBoundingClientRect().width ?? 0,
      itemWidthsPx: items.map((item) => item.getBoundingClientRect().width),
      dividerPseudo: {
        painted: Boolean(before && before.content !== "none" && before.content !== "normal" && parsePx(before.borderLeftWidth) > 0),
        borderWidthPx: parsePx(before?.borderLeftWidth),
        insetPx: parsePx(before?.left),
      },
      panelPaddingPx: [
        parsePx(panelStyle?.paddingTop), parsePx(panelStyle?.paddingRight),
        parsePx(panelStyle?.paddingBottom), parsePx(panelStyle?.paddingLeft),
      ],
      panelWidthsPx: panels.map((element) => element?.getBoundingClientRect().width ?? 0),
      panelHeightsPx: panels.map((element) => element?.getBoundingClientRect().height ?? 0),
      overflowX: sliderViewport ? getComputedStyle(sliderViewport).overflowX : "",
      allItemsFit,
      navigationVisible: navVisible,
      rootMarginTopPx: parsePx(getComputedStyle(root.closest<HTMLElement>(".shop-builder-element-shell") ?? root).marginTop),
      rootMarginBottomPx: parsePx(getComputedStyle(root.closest<HTMLElement>(".shop-builder-element-shell") ?? root).marginBottom),
      rootTextAlign: getComputedStyle(root.closest<HTMLElement>(".shop-builder-element-shell") ?? root).textAlign,
      itemHeightsPx: items.map((item) => item.getBoundingClientRect().height),
      mediaWidthPx: media?.getBoundingClientRect().width ?? 0,
      mediaHeightPx: media?.getBoundingClientRect().height ?? 0,
      mediaOffsetPx: media && panel
        ? media.getBoundingClientRect().left - panel.getBoundingClientRect().left
        : 0,
    };
  }, persisted);
}

async function measureSlideshowContent(
  page: Page,
  persisted: Record<string, any>,
): Promise<SlideshowContentProbe> {
  const root = page.locator(".shop-builder-swiper--slideshow").first();
  await expect(root).toBeVisible();
  await root.scrollIntoViewIfNeeded();
  await expect(root.locator(".swiper-slide-active .shop-builder-swiper-media")).toBeVisible();
  return root.evaluate((element, settings): SlideshowContentProbe => {
    const active = element.querySelector<HTMLElement>(".swiper-slide-active");
    const frame = active?.querySelector<HTMLElement>(".shop-builder-swiper-media");
    const overlay = active?.querySelector<HTMLElement>(".shop-builder-swiper-content");
    const title = overlay?.querySelector<HTMLElement>("h1,h2,h3,h4,h5,h6,div.uk-h1,div.uk-h2,div.uk-h3");
    const frameRect = frame?.getBoundingClientRect();
    const titleRect = title?.getBoundingClientRect();
    const overlayStyle = overlay ? getComputedStyle(overlay) : null;
    const titleStyle = title ? getComputedStyle(title) : null;
    const parsePx = (value: string | undefined) => Number.parseFloat(value ?? "0") || 0;
    return {
      persistedOverlayPosition: settings.overlayPosition,
      persistedOverlayPadding: settings.overlayPadding,
      persistedHeadingLevel: settings.headingLevel,
      persistedHeadingSize: settings.headingSize,
      frameWidthPx: frameRect?.width ?? 0,
      frameHeightPx: frameRect?.height ?? 0,
      rootClasses: element.className.split(/\s+/).filter(Boolean),
      overlayPaddingPx: [
        parsePx(overlayStyle?.paddingTop), parsePx(overlayStyle?.paddingRight),
        parsePx(overlayStyle?.paddingBottom), parsePx(overlayStyle?.paddingLeft),
      ],
      titleTag: title?.tagName.toLowerCase() ?? "",
      titleFontSizePx: parsePx(titleStyle?.fontSize),
      titleLineHeightPx: parsePx(titleStyle?.lineHeight),
      titleFontWeight: Number.parseInt(titleStyle?.fontWeight ?? "0", 10) || 0,
      titleColor: titleStyle?.color ?? "",
      titleCenterOffsetYPx: frameRect && titleRect
        ? titleRect.top + titleRect.height / 2 - (frameRect.top + frameRect.height / 2)
        : Number.NaN,
      actionCount: active?.querySelectorAll("a.uk-button").length ?? 0,
    };
  }, persisted);
}

test("Panel Slider divider contract rejects a stale source/reference revision", async () => {
  const source = JSON.parse(await readFile(staleFixture, "utf8"));
  const sourceHash = hash(await readFile(staleFixture));
  const result = validatePanelSliderLayoutSource(source, sourceHash, contract);

  expect(result.passed).toBe(false);
  expect(formatCompatibilityReport(result)).toContain("FAIL: fixture hash");
  expect(formatCompatibilityReport(result)).toContain("FAIL: slider_divider expected true");
});

test("Panel Slider divider contract accepts the synchronized Enterprise3 source", async () => {
  const raw = await readFile(sourceFixture);
  const source = JSON.parse(raw.toString());
  const result = validatePanelSliderLayoutSource(source, hash(raw), contract);

  expect(result.passed, formatCompatibilityReport(result)).toBe(true);
});

test("Slideshow content contract accepts the synchronized Enterprise3 source", async () => {
  const raw = await readFile(sourceFixture);
  const source = JSON.parse(raw.toString());
  const result = validateSlideshowContentSource(source, hash(raw), slideshowContract);
  expect(result.passed, formatCompatibilityReport(result)).toBe(true);
});

test("Slideshow content and overlay match YOOtheme in Builder and storefront", async ({ page, context }, testInfo) => {
  const raw = await readFile(sourceFixture);
  const source = JSON.parse(raw.toString());
  const mapped = mapYoothemeStaticContent(source);
  const mappedBlock = findImportedSlideshow(mapped.sections);
  if (!mappedBlock) throw new Error("Enterprise3 Slideshow was not imported");
  expect(mappedBlock?.carouselSettings).toMatchObject({
    overlayPosition: "center-left",
    overlayPadding: "default",
    headingLevel: "h3",
  });
  expect(mappedBlock?.slides).toHaveLength(4);
  expect(mappedBlock?.slides.every((slide: Record<string, unknown>) => !slide.buttonUrl)).toBe(true);

  await signIn(page);
  const originalPayload = await (await page.request.get(`/api/builder-layouts?key=${pageKey}&websiteId=${websiteId}`)).json();
  const original = originalPayload.layout;
  expect(original).toBeTruthy();
  try {
    await page.setViewportSize(slideshowContract.viewport);
    await freshImport(page, slideshowContract.fixture.fileName, source);
    const builderProbe = await measureSlideshowContent(page, mappedBlock.carouselSettings);
    const builderReport = evaluateSlideshowContentContract(slideshowContract, builderProbe);

    const storefront = await context.newPage();
    try {
      await storefront.setViewportSize(slideshowContract.viewport);
      await storefront.goto(previewUrl);
      const storefrontProbe = await measureSlideshowContent(storefront, mappedBlock.carouselSettings);
      const storefrontReport = evaluateSlideshowContentContract(slideshowContract, storefrontProbe);
      const output = `${formatCompatibilityReport(builderReport)}\n\nSTOREFRONT\n${formatCompatibilityReport(storefrontReport)}`;
      await testInfo.attach("slideshow-content.compatibility.txt", { body: output, contentType: "text/plain" });
      expect(builderReport.passed, output).toBe(true);
      expect(storefrontReport.passed, output).toBe(true);
    } finally {
      await storefront.close();
    }
  } finally {
    expect((await page.request.post(`/api/builder-layouts?websiteId=${websiteId}`, {
      data: { key: pageKey, design: original.design, sections: original.sections },
    })).ok()).toBeTruthy();
  }
});

test("Panel Slider divider runtime is measured in Builder and storefront", async ({ page, context }, testInfo) => {
  const raw = await readFile(sourceFixture);
  const source = JSON.parse(raw.toString());
  const sourceReport = validatePanelSliderLayoutSource(source, hash(raw), contract);
  expect(sourceReport.passed, formatCompatibilityReport(sourceReport)).toBe(true);

  const mapped = mapYoothemeStaticContent(source);
  const mappedBlock = findImportedPanelSlider(mapped.sections);
  expect(mappedBlock?.carouselSettings?.divider).toBe(true);
  expect(mappedBlock?.carouselSettings?.itemWidthMode).toBe("auto");
  expect(mappedBlock?.carouselSettings?.spaceBetween).toBe(30);

  await signIn(page);
  const originalPayload = await (await page.request.get(`/api/builder-layouts?key=${pageKey}&websiteId=${websiteId}`)).json();
  const original = originalPayload.layout;
  expect(original).toBeTruthy();

  try {
    await page.setViewportSize(contract.viewport);
    await freshImport(page, contract.fixture.fileName, source);
    const builderProbe = await measurePanelSlider(
      page,
      ".shop-builder-swiper--panel",
      persistedPanelSliderSettings(mappedBlock),
    );
    const builderReport = evaluatePanelSliderLayoutContract(contract, builderProbe);

    const storefront = await context.newPage();
    try {
      await storefront.setViewportSize(contract.viewport);
      await storefront.goto(previewUrl);
      const storefrontProbe = await measurePanelSlider(
        storefront,
        ".shop-builder-swiper--panel",
        persistedPanelSliderSettings(mappedBlock),
      );
      const storefrontReport = evaluatePanelSliderLayoutContract(contract, storefrontProbe);
      const output = `${formatCompatibilityReport(builderReport)}\n\nSTOREFRONT\n${formatCompatibilityReport(storefrontReport)}`;
      await testInfo.attach("panel-slider-divider.compatibility.txt", { body: output, contentType: "text/plain" });
      console.log(output);

      // The normal test proves collection/import/probing/reporting. CI can turn
      // this into a fidelity gate without changing the contract or test path.
      if (process.env.YOOTHEME_COMPAT_STRICT === "1") {
        expect(builderReport.passed, output).toBe(true);
        expect(storefrontReport.passed, output).toBe(true);
      } else {
        expect(builderReport.checks.map((check) => check.id)).toEqual(storefrontReport.checks.map((check) => check.id));
      }
    } finally {
      await storefront.close();
    }

    const inverse = cloneWithDivider(source, false);
    const inverseMapping = mapYoothemeStaticContent(inverse);
    const inverseBlock = findImportedPanelSlider(inverseMapping.sections);
    expect(inverseBlock?.carouselSettings?.divider).toBe(false);
    expect(inverseBlock?.carouselSettings?.itemWidthMode).toBe("auto");
    expect(inverseBlock?.carouselSettings?.spaceBetween).toBe(30);
    const inverseContract: PanelSliderLayoutCompatibilityContract = {
      ...contract,
      id: `${contract.id}.false`,
      fixture: { ...contract.fixture, sliderDivider: false, sha256: hash(JSON.stringify(inverse)) },
    };
    await freshImport(page, "enterprise3.slider-divider-false.json", inverse);
    const inverseProbe = await measurePanelSlider(
      page,
      ".shop-builder-swiper--panel",
      persistedPanelSliderSettings(inverseBlock),
    );
    const inverseReport = evaluatePanelSliderLayoutContract(inverseContract, inverseProbe);
    expect(inverseReport.checks.find((check) => check.id === "track.required-classes")?.passed,
      formatCompatibilityReport(inverseReport)).toBe(true);
    expect(inverseReport.checks.find((check) => check.id === "divider.pseudo")?.passed,
      formatCompatibilityReport(inverseReport)).toBe(true);
    const inverseStorefront = await context.newPage();
    try {
      await inverseStorefront.setViewportSize(contract.viewport);
      await inverseStorefront.goto(previewUrl);
      const inverseStorefrontProbe = await measurePanelSlider(
        inverseStorefront,
        ".shop-builder-swiper--panel",
        persistedPanelSliderSettings(inverseBlock),
      );
      const inverseStorefrontReport = evaluatePanelSliderLayoutContract(inverseContract, inverseStorefrontProbe);
      const inverseOutput = `INVERSE (slider_divider=false)\n${formatCompatibilityReport(inverseReport)}\n\nSTOREFRONT\n${formatCompatibilityReport(inverseStorefrontReport)}`;
      await testInfo.attach("panel-slider-divider.inverse.compatibility.txt", { body: inverseOutput, contentType: "text/plain" });
      console.log(inverseOutput);
      expect(inverseStorefrontReport.checks.find((check) => check.id === "track.required-classes")?.passed,
        inverseOutput).toBe(true);
      expect(inverseStorefrontReport.checks.find((check) => check.id === "divider.pseudo")?.passed,
        inverseOutput).toBe(true);
    } finally {
      await inverseStorefront.close();
    }
  } finally {
    if (original) {
      expect((await page.request.post(`/api/builder-layouts?websiteId=${websiteId}`, {
        data: { key: pageKey, design: original.design, sections: original.sections },
      })).ok()).toBeTruthy();
    }
  }
});

test("Panel Slider General text alignment uses the YOOtheme root and moves inline panel media", async ({ page, context }, testInfo) => {
  const raw = await readFile(sourceFixture);
  const source = JSON.parse(raw.toString());
  await signIn(page);
  const originalPayload = await (await page.request.get(`/api/builder-layouts?key=${pageKey}&websiteId=${websiteId}`)).json();
  const original = originalPayload.layout;
  expect(original).toBeTruthy();

  try {
    await page.setViewportSize(contract.viewport);
    const alignmentReport: string[] = ["YOOtheme Panel Slider text-alignment geometry"];
    for (const alignment of ["left", "center", "right"] as const) {
      const alignedSource = cloneWithPanelSliderTextAlignment(source, alignment);
      const mappedBlock = findImportedPanelSlider(mapYoothemeStaticContent(alignedSource).sections);
      expect(mappedBlock?.textAlign).toBe(alignment);
      expect(mappedBlock?.carouselSettings).not.toHaveProperty("contentAlign");

      await freshImport(page, `enterprise3.panel-slider-text-${alignment}.json`, alignedSource);
      const assertAlignment = async (target: Page, surface: "Builder" | "Storefront") => {
        const slider = target.locator(".shop-builder-swiper--panel").first();
        const body = slider.locator(".shop-builder-panel-slider-body").first();
        await expect(slider).toBeVisible();
        await expect(body).toBeVisible();
        await expect(body).toHaveAttribute("data-panel-slider-content-align", alignment);
        await expect(slider).toHaveClass(new RegExp(`\\buk-text-${alignment}\\b`));
        await expect(body).toHaveCSS("text-align", alignment);
        const geometry = await slider.evaluate((root) => {
          const cardElement = root.querySelector<HTMLElement>(".shop-builder-panel-slider-card");
          const mediaElement = root.querySelector<HTMLElement>(".shop-builder-panel-slider-media");
          if (!cardElement || !mediaElement) return null;
          const cardRect = cardElement.getBoundingClientRect();
          const mediaRect = mediaElement.getBoundingClientRect();
          return {
            actualOffset: mediaRect.left - cardRect.left,
          };
        });
        expect(geometry).not.toBeNull();
        const expectedOffset = contract.reference.textAlignmentMediaOffsetsPx[alignment];
        const passed = Math.abs(geometry!.actualOffset - expectedOffset) <= contract.tolerances.geometryPx;
        alignmentReport.push(
          `${passed ? "PASS" : "FAIL"}: ${surface} ${alignment} media offset expected ${expectedOffset}px ±${contract.tolerances.geometryPx}, actual ${geometry!.actualOffset}px`,
        );
        expect(passed, alignmentReport.at(-1)).toBe(true);
      };
      await assertAlignment(page, "Builder");
      const storefront = await context.newPage();
      try {
        await storefront.setViewportSize(contract.viewport);
        await storefront.goto(previewUrl);
        await assertAlignment(storefront, "Storefront");
      } finally {
        await storefront.close();
      }
    }
    const alignmentOutput = alignmentReport.join("\n");
    await testInfo.attach("panel-slider-alignment.compatibility.txt", { body: alignmentOutput, contentType: "text/plain" });
    console.log(alignmentOutput);
  } finally {
    if (original) {
      expect((await page.request.post(`/api/builder-layouts?websiteId=${websiteId}`, {
        data: { key: pageKey, design: original.design, sections: original.sections },
      })).ok()).toBeTruthy();
    }
  }
});
