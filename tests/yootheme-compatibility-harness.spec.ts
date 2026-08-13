import { expect, test, type Page } from "@playwright/test";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import contractJson from "@/tests/fixtures/yootheme-compatibility/panel-slider-divider.enterprise3.contract.json";
import slideshowContractJson from "@/tests/fixtures/yootheme-compatibility/slideshow-content.enterprise3.contract.json";
import slideshowThumbnailEnterprise4Json from "@/tests/fixtures/yootheme-compatibility/slideshow-thumbnail.enterprise4.source.json";
import slideshowThumbnailEnterprise4ContractJson from "@/tests/fixtures/yootheme-compatibility/slideshow-thumbnail.enterprise4.contract.json";
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
const slideshowThumbnailEnterprise4 = slideshowThumbnailEnterprise4Json as {
  fixture: { originalSha256: string };
  source: unknown;
};
const slideshowThumbnailEnterprise4Contract = slideshowThumbnailEnterprise4ContractJson as {
  fixture: { sha256: string };
  expected: {
    itemCount: number;
    navigationType: string;
    showNavigationThumbnail: boolean;
    navigationPosition: string;
    navigationBreakpoint: string;
    thumbnavWidth: number;
    thumbnavHeight: number;
    slidenavBreakpoint: string;
    firstItem: { imageUrl: string; thumbnailUrl: string };
  };
};
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
const enterprise5Fixture = "/Users/hakobjaghatspanyan/Downloads/Enterprise 5.json";

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

async function measureYoothemeGlobalBridge(page: Page, selector: string) {
  return page.locator(`${selector}:visible`).first().evaluate((root) => {
    const styles = getComputedStyle(root);
    return {
      page: styles.getPropertyValue("--builder-page-bg").trim(),
      globalDefault: styles.getPropertyValue("--webpages-background-default").trim(),
      surface: styles.getPropertyValue("--builder-surface").trim(),
      globalMuted: styles.getPropertyValue("--webpages-background-muted").trim(),
      card: styles.getPropertyValue("--builder-card-bg").trim(),
      globalCard: styles.getPropertyValue("--uk-card-default-background").trim(),
      previewText: styles.getPropertyValue("--builder-preview-text").trim(),
      globalText: styles.getPropertyValue("--uk-global-text-color").trim(),
      previewButtonBackground: styles.getPropertyValue("--builder-preview-button-bg").trim(),
      globalButtonBackground: styles.getPropertyValue("--uk-button-primary-background").trim(),
      previewButtonText: styles.getPropertyValue("--builder-preview-button-text").trim(),
      globalButtonText: styles.getPropertyValue("--uk-button-primary-text").trim(),
    };
  });
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
  await expect(root.locator(".uk-slidenav")).toHaveCount(2);
  await expect(root.locator(".swiper-pagination.uk-dotnav")).toBeVisible();
  return root.evaluate((element, settings): SlideshowContentProbe => {
    const active = element.querySelector<HTMLElement>(".swiper-slide-active");
    const frame = active?.querySelector<HTMLElement>(".shop-builder-swiper-media");
    const overlay = active?.querySelector<HTMLElement>(".shop-builder-swiper-content");
    const title = overlay?.querySelector<HTMLElement>("h1,h2,h3,h4,h5,h6,div.uk-h1,div.uk-h2,div.uk-h3");
    const previous = element.querySelector<HTMLElement>(".swiper-button-prev");
    const next = element.querySelector<HTMLElement>(".swiper-button-next");
    const dotnav = element.querySelector<HTMLElement>(".swiper-pagination");
    const dotItems = Array.from(dotnav?.querySelectorAll<HTMLElement>(":scope > li > .swiper-pagination-bullet") ?? []);
    const frameRect = frame?.getBoundingClientRect();
    const titleRect = title?.getBoundingClientRect();
    const previousRect = previous?.getBoundingClientRect();
    const nextRect = next?.getBoundingClientRect();
    const dotnavRect = dotnav?.getBoundingClientRect();
    const firstDotRect = dotItems[0]?.getBoundingClientRect();
    const secondDotRect = dotItems[1]?.getBoundingClientRect();
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
      slidenavUsesUikit: Boolean(
        previous?.classList.contains("uk-slidenav") && previous.classList.contains("uk-slidenav-previous") &&
        next?.classList.contains("uk-slidenav") && next.classList.contains("uk-slidenav-next")
      ),
      slidenavWidthPx: previousRect?.width ?? 0,
      slidenavHeightPx: previousRect?.height ?? 0,
      slidenavInsetPx: frameRect && previousRect && nextRect
        ? ((previousRect.left - frameRect.left) + (frameRect.right - nextRect.right)) / 2
        : Number.NaN,
      dotnavUsesUikit: Boolean(dotnav?.classList.contains("uk-dotnav") && dotItems.length),
      dotnavItemCount: dotItems.length,
      dotnavItemWidthPx: firstDotRect?.width ?? 0,
      dotnavItemHeightPx: firstDotRect?.height ?? 0,
      dotnavSpacingPx: firstDotRect && secondDotRect ? secondDotRect.left - firstDotRect.right : Number.NaN,
      dotnavBottomInsetPx: frameRect && dotnavRect ? frameRect.bottom - dotnavRect.bottom : Number.NaN,
    };
  }, persisted);
}

async function verifySlideshowNavigationWorks(page: Page) {
  const root = page.locator(".shop-builder-swiper--slideshow").first();
  await expect(root.locator('.swiper-slide[data-swiper-slide-index="0"]')).toHaveClass(/swiper-slide-active/);
  await root.locator(".swiper-button-next").click();
  await expect(root.locator('.swiper-slide[data-swiper-slide-index="1"]')).toHaveClass(/swiper-slide-active/);
  await expect(root.locator(".swiper-pagination-bullet").nth(1)).toHaveClass(/swiper-pagination-bullet-active/);
  await root.locator(".swiper-pagination-bullet").nth(0).click();
  await expect(root.locator('.swiper-slide[data-swiper-slide-index="0"]')).toHaveClass(/swiper-slide-active/);
}

async function measureSlideshowResponsiveNavigation(page: Page) {
  const root = page.locator(".shop-builder-swiper--slideshow").first();
  await expect(root).toBeVisible();
  await expect(root.locator(".swiper-slide-active")).toBeVisible();
  return root.evaluate((root) => {
    const dotnav = root.querySelector<HTMLElement>(".swiper-pagination.uk-dotnav");
    const slidenav = root.querySelector<HTMLElement>(".swiper-button-prev.uk-slidenav");
    return {
      viewportWidth: window.innerWidth,
      smallBreakpointMatches: window.matchMedia("(min-width: 640px)").matches,
      dotnavDisplay: dotnav ? getComputedStyle(dotnav).display : "missing",
      slidenavDisplay: slidenav ? getComputedStyle(slidenav).display : "missing",
    };
  });
}

async function measureSlideshowSlidenav(page: Page) {
  const root = page.locator(".shop-builder-swiper--slideshow").first();
  await expect(root).toBeVisible();
  await expect(root.locator(".swiper-button-prev.uk-slidenav")).toBeVisible();
  return root.evaluate((root) => {
    const previous = root.querySelector<HTMLElement>(".swiper-button-prev.uk-slidenav");
    if (!previous) return null;
    const rect = previous.getBoundingClientRect();
    return {
      width: rect.width,
      height: rect.height,
      iconSize: Number.parseFloat(getComputedStyle(previous, "::after").fontSize),
    };
  });
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

test("Slideshow keeps UIkit Thumbnav and Slidenav positions as canonical static state", async () => {
  const raw = await readFile(sourceFixture);
  const source = JSON.parse(raw.toString());
  let node: Record<string, any> = source;
  for (const segment of slideshowContract.fixture.sourcePath.split(".")) node = node[segment];
  node.props.nav = "thumbnav";
  node.props.thumbnav_width = "100";
  node.props.thumbnav_height = "75";
  node.props.slidenav = "center-left";

  const mapped = mapYoothemeStaticContent(source);
  const slideshow = findImportedSlideshow(mapped.sections);
  expect(slideshow?.carouselSettings).toMatchObject({
    navigationType: "thumbnav",
    thumbnavWidth: 100,
    thumbnavHeight: 75,
    showArrows: true,
    arrowPosition: "center-left",
  });
});

test("Slideshow maps YOOtheme navigation-thumbnail visibility without a parallel media owner", async () => {
  const raw = await readFile(sourceFixture);
  const source = JSON.parse(raw.toString());
  let node: Record<string, any> = source;
  for (const segment of slideshowContract.fixture.sourcePath.split(".")) node = node[segment];
  Object.assign(node.props, {
    nav: "thumbnav",
    show_thumbnail: false,
    thumbnav_nowrap: true,
  });

  const mapped = mapYoothemeStaticContent(source);
  expect(findImportedSlideshow(mapped.sections)?.carouselSettings).toMatchObject({
    navigationType: "thumbnav",
    showNavigationThumbnail: false,
    thumbnavNoWrap: true,
  });
});

test("Slideshow preserves safe inline title markup through the canonical item path", async () => {
  const raw = await readFile(sourceFixture);
  const source = JSON.parse(raw.toString());
  let node: Record<string, any> = source;
  for (const segment of slideshowContract.fixture.sourcePath.split(".")) node = node[segment];
  node.children[0].props.title = "A safe<br>title<script>alert(1)</script>";

  const mapped = mapYoothemeStaticContent(source);
  expect(findImportedSlideshow(mapped.sections)?.slides[0]).toMatchObject({
    title: "A safe<br>title",
  });
});

test("Slideshow maps the real item thumbnail and compact item settings contract", async () => {
  const raw = await readFile(sourceFixture);
  const source = JSON.parse(raw.toString());
  let node: Record<string, any> = source;
  for (const segment of slideshowContract.fixture.sourcePath.split(".")) node = node[segment];
  Object.assign(node.children[0].props, {
    thumbnail: "wp-content/uploads/yootheme/custom-thumb.jpg",
    thumbnail_focal_point: "bottom-right",
    image_focal_point: "top-left",
    text_color: "light",
    item_element: "section",
    label: "Custom navigation label",
    link: "https://example.test/item",
    link_text: "Read item",
    link_aria_label: "Read the first item",
  });

  const mapped = mapYoothemeStaticContent(source);
  expect(findImportedSlideshow(mapped.sections)?.slides[0]).toMatchObject({
    thumbnailUrl: "/wp-content/uploads/yootheme/custom-thumb.jpg",
    thumbnailPosition: "bottom-right",
    imagePosition: "top-left",
    textColor: "light",
    itemElement: "section",
    navigationLabel: "Custom navigation label",
    buttonLabel: "Read item",
    buttonAriaLabel: "Read the first item",
  });
});

test("Enterprise4 static Slideshow keeps a dedicated navigation thumbnail through the canonical model", () => {
  expect(slideshowThumbnailEnterprise4.fixture.originalSha256).toBe(
    slideshowThumbnailEnterprise4Contract.fixture.sha256,
  );

  const mapped = mapYoothemeStaticContent(slideshowThumbnailEnterprise4.source);
  const slideshow = findImportedSlideshow(mapped.sections);
  const expected = slideshowThumbnailEnterprise4Contract.expected;

  expect(slideshow?.slides).toHaveLength(expected.itemCount);
  expect(slideshow?.carouselSettings).toMatchObject({
    navigationType: expected.navigationType,
    showNavigationThumbnail: expected.showNavigationThumbnail,
    paginationPosition: expected.navigationPosition,
    navigationBreakpoint: expected.navigationBreakpoint,
    thumbnavWidth: expected.thumbnavWidth,
    thumbnavHeight: expected.thumbnavHeight,
    slidenavBreakpoint: expected.slidenavBreakpoint,
  });
  expect(slideshow?.slides[0]).toMatchObject(expected.firstItem);
  expect(slideshow?.slides.slice(1).every((slide: Record<string, unknown>) => !slide.thumbnailUrl)).toBe(true);
});

test("Slideshow height and ratio source fields normalize into the shared frame owner", async () => {
  const raw = await readFile(sourceFixture);
  const source = JSON.parse(raw.toString());
  let node: Record<string, any> = source;
  for (const segment of slideshowContract.fixture.sourcePath.split(".")) node = node[segment];
  Object.assign(node.props, {
    slideshow_height: "viewport",
    slideshow_height_viewport: "80",
    slideshow_min_height: "350",
    slideshow_max_height: "900",
    slideshow_ratio: "1600:900",
  });

  const mapped = mapYoothemeStaticContent(source);
  expect(findImportedSlideshow(mapped.sections)?.carouselSettings).toMatchObject({
    slideshowHeight: "viewport",
    slideshowViewportHeight: 80,
    slideshowMinHeight: 350,
    slideshowMaxHeight: 900,
    slideshowRatio: "1600:900",
  });
});

test("Slideshow frame constraints use the same canonical geometry in Builder and storefront", async ({ page, context }) => {
  const raw = await readFile(sourceFixture);
  const source = JSON.parse(raw.toString());
  let node: Record<string, any> = source;
  for (const segment of slideshowContract.fixture.sourcePath.split(".")) node = node[segment];
  Object.assign(node.props, {
    slideshow_height: "",
    slideshow_ratio: "16:9",
    slideshow_min_height: 450,
    slideshow_max_height: 500,
  });

  const mapped = mapYoothemeStaticContent(source);
  const slideshow = findImportedSlideshow(mapped.sections);
  expect(slideshow?.carouselSettings).toMatchObject({
    slideshowHeight: undefined,
    slideshowRatio: "16:9",
    slideshowMinHeight: 450,
    slideshowMaxHeight: 500,
  });

  await signIn(page);
  const originalPayload = await (await page.request.get(`/api/builder-layouts?key=${pageKey}&websiteId=${websiteId}`)).json();
  const original = originalPayload.layout;
  expect(original).toBeTruthy();
  try {
    await page.setViewportSize(slideshowContract.viewport);
    await freshImport(page, "slideshow-frame-constraints.json", source);
    const builderProbe = await measureSlideshowContent(page, slideshow?.carouselSettings ?? {});
    expect(builderProbe.frameHeightPx).toBeCloseTo(500, 0);

    const storefront = await context.newPage();
    try {
      await storefront.setViewportSize(slideshowContract.viewport);
      // A fresh import changes the scoped server document. Use a distinct
      // request URL for the storefront probe so the assertion observes that
      // newly published document rather than a prior RSC response for the
      // same preview URL.
      await storefront.goto(`${previewUrl}&compatibilityProbe=${Date.now()}`);
      const storefrontProbe = await measureSlideshowContent(storefront, slideshow?.carouselSettings ?? {});
      expect(storefrontProbe.frameHeightPx).toBeCloseTo(500, 0);
      expect(storefrontProbe.frameHeightPx).toBeCloseTo(builderProbe.frameHeightPx, 0);
    } finally {
      await storefront.close();
    }
  } finally {
    expect((await page.request.post(`/api/builder-layouts?websiteId=${websiteId}`, {
      data: { key: pageKey, design: original.design, sections: original.sections },
    })).ok()).toBeTruthy();
  }
});

test("Slideshow viewport height owns the shared frame in Builder and storefront", async ({ page, context }) => {
  const raw = await readFile(sourceFixture);
  const source = JSON.parse(raw.toString());
  let node: Record<string, any> = source;
  for (const segment of slideshowContract.fixture.sourcePath.split(".")) node = node[segment];
  Object.assign(node.props, {
    slideshow_height: "viewport",
    slideshow_height_viewport: 80,
    slideshow_min_height: 450,
    slideshow_ratio: "1600:900",
  });

  const mapped = mapYoothemeStaticContent(source);
  const slideshow = findImportedSlideshow(mapped.sections);
  expect(slideshow?.carouselSettings).toMatchObject({
    slideshowHeight: "viewport",
    slideshowViewportHeight: 80,
    slideshowMinHeight: 450,
    slideshowRatio: "1600:900",
  });

  await signIn(page);
  const originalPayload = await (await page.request.get(`/api/builder-layouts?key=${pageKey}&websiteId=${websiteId}`)).json();
  const original = originalPayload.layout;
  expect(original).toBeTruthy();
  try {
    await page.setViewportSize(slideshowContract.viewport);
    await freshImport(page, "slideshow-viewport-height.json", source);
    const expectedHeight = slideshowContract.viewport.height * 0.8;
    const builderProbe = await measureSlideshowContent(page, slideshow?.carouselSettings ?? {});
    expect(builderProbe.frameHeightPx).toBeCloseTo(expectedHeight, 0);

    const storefront = await context.newPage();
    try {
      await storefront.setViewportSize(slideshowContract.viewport);
      await storefront.goto(`${previewUrl}&compatibilityProbe=${Date.now()}`);
      const storefrontProbe = await measureSlideshowContent(storefront, slideshow?.carouselSettings ?? {});
      expect(storefrontProbe.frameHeightPx).toBeCloseTo(expectedHeight, 0);
      expect(storefrontProbe.frameHeightPx).toBeCloseTo(builderProbe.frameHeightPx, 0);
    } finally {
      await storefront.close();
    }
  } finally {
    expect((await page.request.post(`/api/builder-layouts?websiteId=${websiteId}`, {
      data: { key: pageKey, design: original.design, sections: original.sections },
    })).ok()).toBeTruthy();
  }
});

test("Slideshow keeps a whole-element link distinct from slide actions", async () => {
  const raw = await readFile(sourceFixture);
  const source = JSON.parse(raw.toString());
  let node: Record<string, any> = source;
  for (const segment of slideshowContract.fixture.sourcePath.split(".")) node = node[segment];
  node.props.link = "https://example.test/whole-slideshow";
  node.props.link_target = "blank";

  const mapped = mapYoothemeStaticContent(source);
  const slideshow = findImportedSlideshow(mapped.sections);
  expect(slideshow?.carouselSettings).toMatchObject({
    elementLinkUrl: "https://example.test/whole-slideshow",
    elementLinkTarget: "_blank",
  });
  expect(slideshow?.slides.every((slide: Record<string, unknown>) => !slide.buttonUrl)).toBe(true);
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
    navigationType: "dotnav",
    paginationPosition: "bottom-center",
    navigationMargin: "medium",
    navigationBreakpoint: "small",
    navigationBelow: false,
    navigationHoverOnly: false,
    navigationVertical: false,
    slidenavBreakpoint: "small",
    slidenavHoverOnly: false,
    slidenavLarger: false,
    slidenavMargin: "medium",
  });
  expect(mappedBlock?.carouselSettings).not.toHaveProperty("slidenavOutsideBreakpoint");
  expect(mappedBlock?.slides).toHaveLength(4);
  expect(mappedBlock?.slides.every((slide: Record<string, unknown>) => !slide.buttonUrl)).toBe(true);

  await signIn(page);
  const originalPayload = await (await page.request.get(`/api/builder-layouts?key=${pageKey}&websiteId=${websiteId}`)).json();
  const original = originalPayload.layout;
  expect(original).toBeTruthy();
  try {
    await page.setViewportSize(slideshowContract.viewport);
    await freshImport(page, slideshowContract.fixture.fileName, source);
    const persistedImportedPayload = await (
      await page.request.get(`/api/builder-layouts?key=${pageKey}&websiteId=${websiteId}`)
    ).json();
    expect(persistedImportedPayload.layout?.design).toEqual({});
    const builderGlobalBridge = await measureYoothemeGlobalBridge(page, ".builder-preview-page");
    expect(builderGlobalBridge.page).toBe(builderGlobalBridge.globalDefault);
    expect(builderGlobalBridge.surface).toBe(builderGlobalBridge.globalMuted);
    expect(builderGlobalBridge.card).toBe(builderGlobalBridge.globalCard);
    expect(builderGlobalBridge.previewText).toBe(builderGlobalBridge.globalText);
    expect(builderGlobalBridge.previewButtonBackground).toBe(builderGlobalBridge.globalButtonBackground);
    expect(builderGlobalBridge.previewButtonText).toBe(builderGlobalBridge.globalButtonText);
    const builderProbe = await measureSlideshowContent(page, mappedBlock.carouselSettings);
    await verifySlideshowNavigationWorks(page);
    const builderReport = evaluateSlideshowContentContract(slideshowContract, builderProbe);

    const storefront = await context.newPage();
    try {
      await storefront.setViewportSize(slideshowContract.viewport);
      await storefront.goto(`${previewUrl}&compatibilityProbe=${Date.now()}`);
      const storefrontGlobalBridge = await measureYoothemeGlobalBridge(storefront, ".shop-builder-main");
      expect(storefrontGlobalBridge).toEqual(builderGlobalBridge);
      const storefrontProbe = await measureSlideshowContent(storefront, mappedBlock.carouselSettings);
      await verifySlideshowNavigationWorks(storefront);
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

test("Slideshow honors the imported Small navigation and slidenav breakpoints in Builder and storefront", async ({ page, context }) => {
  const raw = await readFile(sourceFixture);
  const source = JSON.parse(raw.toString());
  const mapped = mapYoothemeStaticContent(source);
  const slideshow = findImportedSlideshow(mapped.sections);
  expect(slideshow?.carouselSettings).toMatchObject({
    navigationBreakpoint: "small",
    slidenavBreakpoint: "small",
  });

  await signIn(page);
  const originalPayload = await (await page.request.get(`/api/builder-layouts?key=${pageKey}&websiteId=${websiteId}`)).json();
  const original = originalPayload.layout;
  expect(original).toBeTruthy();
  try {
    await freshImport(page, slideshowContract.fixture.fileName, source);
    for (const [width, expectedDisplay] of [[639, "none"], [640, "flex"], [641, "flex"]] as const) {
      await page.setViewportSize({ width, height: slideshowContract.viewport.height });
      const builder = await measureSlideshowResponsiveNavigation(page);
      expect(builder, `Builder responsive navigation probe at ${width}px: ${JSON.stringify(builder)}`).toMatchObject({
        viewportWidth: width,
        smallBreakpointMatches: width >= 640,
        dotnavDisplay: expectedDisplay,
        slidenavDisplay: expectedDisplay,
      });

      const storefront = await context.newPage();
      try {
        await storefront.setViewportSize({ width, height: slideshowContract.viewport.height });
        await storefront.goto(`${previewUrl}&compatibilityProbe=${Date.now()}`);
        const storefrontProbe = await measureSlideshowResponsiveNavigation(storefront);
        expect(storefrontProbe).toEqual(builder);
      } finally {
        await storefront.close();
      }
    }
  } finally {
    expect((await page.request.post(`/api/builder-layouts?websiteId=${websiteId}`, {
      data: { key: pageKey, design: original.design, sections: original.sections },
    })).ok()).toBeTruthy();
  }
});

test("Slideshow item actions inherit the imported YOOtheme Link style", async ({ page, context }) => {
  const raw = await readFile(enterprise5Fixture);
  const source = JSON.parse(raw.toString());
  const mapped = mapYoothemeStaticContent(source);
  const slideshow = findImportedSlideshow(mapped.sections);
  expect(slideshow?.carouselSettings).toMatchObject({
    buttonStyle: "default",
    buttonLabel: "Read more",
  });
  expect(mapped.warnings.some((warning) => warning.includes("1.0.0.0.link_text:"))).toBe(false);
  expect(mapped.warnings.some((warning) => warning.includes("1.0.0.0.margin:"))).toBe(false);
  expect(slideshow?.slides[0]).toMatchObject({
    buttonLabel: "link to live project ",
    buttonUrl: "https://react.webpages.am",
    meta: "Meta 1",
    text: "Content 1",
    textColor: "light",
  });

  await signIn(page);
  const originalPayload = await (await page.request.get(`/api/builder-layouts?key=${pageKey}&websiteId=${websiteId}`)).json();
  const original = originalPayload.layout;
  expect(original).toBeTruthy();
  try {
    await page.setViewportSize(slideshowContract.viewport);
    await freshImport(page, "Enterprise 5.json", source);
    const builderAction = page.locator(".shop-builder-swiper--slideshow .swiper-slide-active a.uk-button-default");
    await expect(builderAction).toBeVisible();
    await expect(builderAction).toHaveText("link to live project");
    await expect(page.locator(".shop-builder-swiper--slideshow .swiper-slide-active")).toContainText("Meta 1");
    await expect(page.locator(".shop-builder-swiper--slideshow .swiper-slide-active")).toContainText("Content 1");
    await expect(page.locator(".shop-builder-swiper--slideshow .swiper-slide").nth(2).locator("a.uk-button")).toHaveCount(0);

    const storefront = await context.newPage();
    try {
      await storefront.setViewportSize(slideshowContract.viewport);
      // A fresh import changes the scoped server document. Use a distinct
      // request URL so this probe observes that published document rather
      // than a previous RSC response for the same preview URL.
      await storefront.goto(`${previewUrl}&compatibilityProbe=${Date.now()}`);
      const storefrontAction = storefront.locator(".shop-builder-swiper--slideshow .swiper-slide-active a.uk-button-default");
      await expect(storefrontAction).toBeVisible();
      await expect(storefrontAction).toHaveText("link to live project");
      await expect(storefront.locator(".shop-builder-swiper--slideshow .swiper-slide-active")).toContainText("Meta 1");
      await expect(storefront.locator(".shop-builder-swiper--slideshow .swiper-slide-active")).toContainText("Content 1");
      await expect(storefront.locator(".shop-builder-swiper--slideshow .swiper-slide").nth(2).locator("a.uk-button")).toHaveCount(0);
    } finally {
      await storefront.close();
    }
  } finally {
    expect((await page.request.post(`/api/builder-layouts?websiteId=${websiteId}`, {
      data: { key: pageKey, design: original.design, sections: original.sections },
    })).ok()).toBeTruthy();
  }
});

test("Slideshow Larger style enlarges canonical UIkit slidenav in Builder and storefront", async ({ page, context }) => {
  const raw = await readFile(sourceFixture);
  const source = JSON.parse(raw.toString());
  let node: Record<string, any> = source;
  for (const segment of slideshowContract.fixture.sourcePath.split(".")) node = node[segment];
  node.props.slidenav_large = true;
  const mapped = mapYoothemeStaticContent(source);
  expect(findImportedSlideshow(mapped.sections)?.carouselSettings).toMatchObject({ slidenavLarger: true });

  await signIn(page);
  const originalPayload = await (await page.request.get(`/api/builder-layouts?key=${pageKey}&websiteId=${websiteId}`)).json();
  const original = originalPayload.layout;
  expect(original).toBeTruthy();
  try {
    await page.setViewportSize(slideshowContract.viewport);
    await freshImport(page, "slideshow-larger-slidenav.json", source);
    await expect(page.locator(".shop-builder-swiper--slideshow")).toHaveClass(/shop-builder-slideshow-slidenav-large/);
    const builder = await measureSlideshowSlidenav(page);
    expect(builder).toEqual({ width: 60, height: 60, iconSize: 24 });

    const storefront = await context.newPage();
    try {
      await storefront.setViewportSize(slideshowContract.viewport);
      await storefront.goto(`${previewUrl}&compatibilityProbe=${Date.now()}`);
      expect(await measureSlideshowSlidenav(storefront)).toEqual(builder);
    } finally {
      await storefront.close();
    }
  } finally {
    expect((await page.request.post(`/api/builder-layouts?websiteId=${websiteId}`, {
      data: { key: pageKey, design: original.design, sections: original.sections },
    })).ok()).toBeTruthy();
  }
});

test("Enterprise 5 Slideshow supported contract is complete across import, inspector, Builder and storefront", async ({ page, context }) => {
  const raw = await readFile(enterprise5Fixture);
  const source = JSON.parse(raw.toString());
  const mapped = mapYoothemeStaticContent(source);
  const slideshow = findImportedSlideshow(mapped.sections);
  if (!slideshow) throw new Error("Enterprise 5 Slideshow was not imported");

  expect(slideshow.carouselSettings).toMatchObject({
    presentation: "slideshow",
    slideshowMinHeight: 300,
    showTitle: true,
    showMeta: true,
    showContent: true,
    showLink: true,
    buttonStyle: "default",
    buttonLabel: "Read more",
    headingLevel: "h3",
    metaPosition: "below-title",
    metaHtmlElement: "div",
    metaStyle: "meta",
    navigationType: "thumbnav",
    paginationPosition: "bottom-center",
    navigationMargin: "medium",
    navigationBreakpoint: "small",
    thumbnavWidth: 100,
    thumbnavHeight: 75,
    showArrows: true,
    arrowPosition: "overlay",
    slidenavBreakpoint: "small",
    slidenavMargin: "medium",
    overlayPosition: "center-left",
    overlayPadding: "default",
  });
  expect(slideshow.slides).toHaveLength(4);
  expect(slideshow.slides[0]).toMatchObject({
    meta: "Meta 1",
    text: "Content 1",
    textColor: "light",
    buttonLabel: "link to live project ",
    buttonUrl: "https://react.webpages.am",
  });
  expect(slideshow.slides[2]).toMatchObject({ showAction: false });
  expect(mapped.warnings).toEqual(expect.arrayContaining([
    expect.stringContaining("1.0.0.0.nav_align: INTENTIONALLY UNSUPPORTED"),
    expect.stringContaining("1.0.0.0.overlay_animation: INTENTIONALLY UNSUPPORTED"),
    expect.stringContaining("1.0.0.0.slidenav_outside_breakpoint: INTENTIONALLY UNSUPPORTED"),
    expect.stringContaining("1.0.0.0.thumbnav_svg_color: INTENTIONALLY UNSUPPORTED"),
    expect.stringContaining("1.0.0.0.title_hover_style: INTENTIONALLY UNSUPPORTED"),
  ]));
  expect(mapped.warnings.some((warning) => /1\.0\.0\.0\.(?:link_text|margin):/.test(warning))).toBe(false);

  await signIn(page);
  const originalPayload = await (await page.request.get(`/api/builder-layouts?key=${pageKey}&websiteId=${websiteId}`)).json();
  const original = originalPayload.layout;
  expect(original).toBeTruthy();
  try {
    await page.setViewportSize(slideshowContract.viewport);
    await freshImport(page, "Enterprise 5.json", source);

    const inspectSlideshow = async (surface: Page) => {
      const root = surface.locator(".shop-builder-swiper--slideshow").first();
      await expect(root).toBeVisible();
      await expect(root).toHaveClass(/shop-builder-slideshow-nav--thumbnav/);
      await expect(root).toHaveClass(/shop-builder-slideshow-nav-pos--bottom-center/);
      await expect(root).toHaveClass(/shop-builder-slideshow-overlay--center-left/);
      await expect(root.locator(".swiper-slide")).toHaveCount(4);
      await expect(root.locator(".swiper-pagination.uk-thumbnav > li")).toHaveCount(4);
      await expect(root.locator(".shop-builder-slideshow-thumbnav-item img").first()).toHaveAttribute("src", /blog-post-customer-stories-fullstack/);
      await expect(root.locator(".swiper-button-prev.uk-slidenav")).toBeVisible();
      await expect(root.locator(".swiper-button-next.uk-slidenav")).toBeVisible();
      await expect(root.locator(".swiper-slide-active h3")).toBeVisible();
      await expect(root.locator(".swiper-slide-active")).toContainText("Meta 1");
      await expect(root.locator(".swiper-slide-active")).toContainText("Content 1");
      await expect(root.locator(".swiper-slide-active a.uk-button-default")).toHaveText("link to live project");
      await expect(root.locator(".swiper-slide").nth(2).locator("a.uk-button")).toHaveCount(0);
    };

    await inspectSlideshow(page);
    await page.locator(`[data-builder-block-key="${slideshow.id}"]`).dblclick();
    await page.getByRole("button", { name: "Settings", exact: true }).last().click();
    const settings = page.locator('[data-uikit-capability="slideshow-settings"]');
    await expect(settings).toContainText("SLIDESHOW");
    await expect(settings).toContainText("ANIMATION");
    await expect(settings).toContainText("NAVIGATION");
    await expect(settings).toContainText("SLIDENAV");
    await expect(settings).toContainText("OVERLAY");
    await expect(settings).toContainText("LINK");
    await expect(settings).toContainText("TITLE");
    await expect(settings).toContainText("META");
    await expect(settings).toContainText("CONTENT STYLE");
    await page.getByRole("button", { name: "Advanced", exact: true }).last().click();
    await expect(page.locator('[data-uikit-capability="element-advanced"]')).toBeVisible();

    const storefront = await context.newPage();
    try {
      await storefront.setViewportSize(slideshowContract.viewport);
      await storefront.goto(`${previewUrl}&compatibilityProbe=${Date.now()}`);
      await inspectSlideshow(storefront);
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
      await storefront.goto(`${previewUrl}&compatibilityProbe=${Date.now()}`);
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
        await storefront.goto(`${previewUrl}&compatibilityProbe=${Date.now()}`);
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
