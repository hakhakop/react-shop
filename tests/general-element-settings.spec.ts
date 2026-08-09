import { expect, test, type Page } from "@playwright/test";
import { mapYoothemeStaticContent } from "@/lib/yoothemePageImport";
import sourceFixture from "./fixtures/general-element-acceptance.json";

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

async function clearBuilderDocumentCache(page: Page) {
  await page.evaluate(() => {
    for (let index = window.localStorage.length - 1; index >= 0; index -= 1) {
      const key = window.localStorage.key(index);
      if (
        key?.startsWith("react-shop-visual-builder-v1") ||
        key?.startsWith("react-shop-visual-builder-drafts-v2")
      ) {
        window.localStorage.removeItem(key);
      }
    }
  });
}

test("Phase 3 imported General settings resolve identically in Builder and frontend", async ({ page, context }) => {
  await signIn(page);
  const originalPayload = await (await page.request.get("/api/builder-layouts?key=home&websiteId=header-parity-site")).json();
  const original = originalPayload.layout;
  const mapped = mapYoothemeStaticContent(sourceFixture);
  expect(mapped.warnings.filter((warning) => warning.includes("General acceptance"))).toHaveLength(0);
  expect(mapped.sections[0]?.layoutItems?.[0]?.blocks).toHaveLength(4);

  try {
    const install = await page.request.post("/api/builder-layouts?websiteId=header-parity-site", {
      data: { key: "home", design: original.design, sections: mapped.sections },
    });
    expect(install.ok()).toBeTruthy();
    await page.setViewportSize({ width: 1280, height: 900 });
    await clearBuilderDocumentCache(page);
    await page.goto(builderUrl);
    const builderBlocks = page.locator(".builder-preview-layout-block");
    await expect(builderBlocks).toHaveCount(4);
    const builderMeasurements = await builderBlocks.evaluateAll((nodes) => nodes.map((node) => {
      const style = getComputedStyle(node as HTMLElement);
      return {
        position: style.position,
        left: style.left,
        top: style.top,
        zIndex: style.zIndex,
        marginTop: style.marginTop,
        marginBottom: style.marginBottom,
        maxWidth: style.maxWidth,
        textAlign: style.textAlign,
        animation: node.getAttribute("data-builder-animate"),
        responsiveClasses: [
          "uk-visible@s",
          "builder-general-maxwidth-small-from-small",
          "builder-general-blockalign-center-from-small",
          "builder-general-textalign-right-from-small",
        ].every((className) => node.classList.contains(className)),
      };
    }));
    for (const measurement of builderMeasurements) {
      expect(measurement.position).toBe("relative");
      expect(measurement.left).toBe("12px");
      expect(measurement.top).toBe("8px");
      expect(measurement.zIndex).toBe("10");
      expect(parseFloat(measurement.marginTop)).toBeGreaterThan(0);
      expect(measurement.marginBottom).toBe("0px");
      expect(parseFloat(measurement.maxWidth)).toBeGreaterThan(0);
      expect(measurement.textAlign).toBe("right");
      expect(measurement.animation).toBe("fade");
      expect(measurement.responsiveClasses).toBe(true);
    }

    const frontend = await context.newPage();
    await frontend.setViewportSize({ width: 1280, height: 900 });
    await frontend.goto(previewUrl);
    const storefrontBlocks = frontend.locator('.shop-builder-section .shop-builder-element-shell[data-builder-block-id^="yootheme-"]');
    await expect(storefrontBlocks).toHaveCount(4);
    const frontendMeasurements = await storefrontBlocks.evaluateAll((nodes) => nodes.map((node) => {
      const style = getComputedStyle(node as HTMLElement);
      return {
        position: style.position,
        left: style.left,
        top: style.top,
        zIndex: style.zIndex,
        marginTop: style.marginTop,
        marginBottom: style.marginBottom,
        maxWidth: style.maxWidth,
        textAlign: style.textAlign,
        animation: node.getAttribute("data-builder-animate"),
        responsiveClasses: [
          "uk-visible@s",
          "builder-general-maxwidth-small-from-small",
          "builder-general-blockalign-center-from-small",
          "builder-general-textalign-right-from-small",
        ].every((className) => node.classList.contains(className)),
      };
    }));
    expect(frontendMeasurements).toEqual(builderMeasurements);

    // Regression guard: General positioning is owned by the outer element
    // shell exactly once. The image's internal media wrapper must remain in
    // normal flow, visible, and sized in both renderers.
    const absoluteSections = JSON.parse(JSON.stringify(mapped.sections));
    const absoluteImage = absoluteSections[0].layoutItems[0].blocks[1];
    absoluteImage.visualStyle.layout.position = "absolute";
    absoluteImage.visualStyle.layout.left = "24px";
    const absoluteInstall = await page.request.post("/api/builder-layouts?websiteId=header-parity-site", {
      data: { key: "home", design: original.design, sections: absoluteSections },
    });
    expect(absoluteInstall.ok()).toBeTruthy();
    const absolutePayload = await (
      await page.request.get(
        "/api/builder-layouts?key=home&websiteId=header-parity-site",
      )
    ).json();
    expect(
      absolutePayload.layout.sections[0].layoutItems[0].blocks[1].visualStyle
        .layout.position,
    ).toBe("absolute");

    await clearBuilderDocumentCache(page);
    await page.goto(`${builderUrl}&acceptance=absolute`);
    const builderImageShell = page.locator('[data-builder-block-key="yootheme-image-0-0-0-1"]');
    await expect(builderImageShell).toHaveCount(1);
    const builderImageState = await builderImageShell.evaluate((shell) => {
      const image = shell.querySelector<HTMLElement>(".shop-builder-column-block--image");
      const media = shell.querySelector<HTMLElement>(".shop-builder-image-media");
      if (!image || !media) throw new Error("Positioned image structure missing");
      const shellStyle = getComputedStyle(shell);
      const imageStyle = getComputedStyle(image);
      const rect = media.getBoundingClientRect();
      return {
        shellPosition: shellStyle.position,
        shellLeft: shellStyle.left,
        imagePosition: imageStyle.position,
        imageLeft: imageStyle.left,
        visible: rect.width > 0 && rect.height > 0 && rect.right > 0 && rect.left < innerWidth && rect.bottom > 0 && rect.top < innerHeight,
      };
    });
    expect(builderImageState).toEqual({
      shellPosition: "absolute",
      shellLeft: "24px",
      imagePosition: "static",
      imageLeft: "auto",
      visible: true,
    });

    const absoluteFrontend = await context.newPage();
    await absoluteFrontend.setViewportSize({ width: 1280, height: 900 });
    await absoluteFrontend.goto(previewUrl);
    const frontendImageShell = absoluteFrontend.locator('[data-builder-block-id="yootheme-image-0-0-0-1"]');
    await expect(frontendImageShell).toHaveCount(1);
    const frontendImageState = await frontendImageShell.evaluate((shell) => {
      const image = shell.querySelector<HTMLElement>(".shop-builder-column-block--image");
      const media = shell.querySelector<HTMLElement>(".shop-builder-image-media");
      if (!image || !media) throw new Error("Positioned image structure missing");
      const shellStyle = getComputedStyle(shell);
      const imageStyle = getComputedStyle(image);
      const rect = media.getBoundingClientRect();
      return {
        shellPosition: shellStyle.position,
        shellLeft: shellStyle.left,
        imagePosition: imageStyle.position,
        imageLeft: imageStyle.left,
        visible: rect.width > 0 && rect.height > 0 && rect.right > 0 && rect.left < innerWidth && rect.bottom > 0 && rect.top < innerHeight,
      };
    });
    expect(frontendImageState).toEqual(builderImageState);
  } finally {
    const restore = await page.request.post("/api/builder-layouts?websiteId=header-parity-site", {
      data: { key: "home", design: original.design, sections: original.sections },
    });
    expect(restore.ok()).toBeTruthy();
  }
});
