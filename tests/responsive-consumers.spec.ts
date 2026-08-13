import { expect, test } from "@playwright/test";

const builderUrl = "/app/websites/header-parity-site/builder?page=home";
const previewUrl = "/app/websites/header-parity-site/preview?page=home";
const email = "header-parity-20260722@example.test";
const password = "HeaderParity!2026";

async function setPolicy(page: import("@playwright/test").Page, small: number, useDefaults = false) {
  const policy = useDefaults
    ? { medium: 960, large: 1200, xlarge: 1600 }
    : { medium: 1000, large: 1280, xlarge: 1680 };
  await page.getByRole("button", { name: "Website", exact: true }).click();
  await page.getByRole("button", { name: "IMPORT YOOTHEME LESS", exact: true }).click();
  await page.locator("textarea").fill(`
    @breakpoint-small: ${small}px;
    @breakpoint-medium: ${policy.medium}px;
    @breakpoint-large: ${policy.large}px;
    @breakpoint-xlarge: ${policy.xlarge}px;
  `);
  await page.getByRole("button", { name: "Import Style Tokens", exact: true }).click();
  await page.getByRole("button", { name: /Global Typography, colors/ }).click();
  await page.getByRole("button", { name: "Publish Settings", exact: true }).click();
}

async function installResponsiveProbes(page: import("@playwright/test").Page) {
  await page.locator('[data-builder-page-root]:not(footer)').evaluate((root) => {
    root.querySelector("#responsive-consumer-probes")?.remove();
    const probes = document.createElement("div");
    probes.id = "responsive-consumer-probes";
    probes.innerHTML = `
      <div class="builder-general-textalign-center-from-small" data-probe="general">General</div>
      <section class="shop-builder-section shop-builder-section--title-rotate-left" data-section-title-breakpoint="small"><h2 class="shop-builder-section-heading" data-probe="title">Title</h2></section>
      <div class="shop-builder-grid" data-probe="grid" style="--shop-builder-grid-template:repeat(1,minmax(0,1fr));--shop-builder-grid-template-phone-landscape:repeat(2,minmax(0,1fr))"><span>A</span><span>B</span></div>
      <div class="builder-text-columns-1-2-from-small" data-probe="text">One two three four</div>
      <div class="shop-builder-slidenav-from-small" data-probe="navigation"><button class="swiper-button-prev">Prev</button></div>
    `;
    root.append(probes);
  });
}

async function probe(page: import("@playwright/test").Page) {
  return page.locator('[data-builder-page-root]:not(footer)').evaluate((root) => {
    const style = (selector: string, property: string) => {
      const element = root.querySelector(selector);
      return element ? getComputedStyle(element).getPropertyValue(property).trim() : null;
    };
    const grid = style('[data-probe="grid"]', "grid-template-columns");
    return {
      policy: root.getAttribute("data-responsive-breakpoint-policy"),
      general: style('[data-probe="general"]', "text-align"),
      title: style('[data-probe="title"]', "writing-mode"),
      gridColumnCount: grid ? grid.split(" ").filter(Boolean).length : null,
      textColumns: style('[data-probe="text"]', "column-count"),
      navigation: style('[data-probe="navigation"] .swiper-button-prev', "display"),
    };
  });
}

test("rendered responsive consumers share the custom Global Styles policy in Builder and storefront", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/app(?:\?|$)/);
  await page.goto(builderUrl);
  await expect(page.locator(".builder-preview-shell").first()).toBeVisible();
  await setPolicy(page, 700);

  // Preview width remains pixel-based, while its semantic tier follows the
  // imported Global Styles policy rather than dashboard breakpoints.
  await page.locator(".builder-device-toggle button").nth(2).click();
  await expect(page.locator('[data-builder-page-root]:not(footer)')).toHaveAttribute("data-responsive-preview-tier", "base");
  await page.locator(".builder-device-toggle button").nth(1).click();
  await expect(page.locator('[data-builder-page-root]:not(footer)')).toHaveAttribute("data-responsive-preview-tier", "small");
  await page.locator(".builder-device-toggle button").first().click();

  await page.setViewportSize({ width: 680, height: 900 });
  await installResponsiveProbes(page);
  await expect.poll(() => probe(page)).toMatchObject({
    policy: "s700-m1000-l1280-xl1680", general: "start", title: "horizontal-tb", gridColumnCount: 1, textColumns: "auto", navigation: "none",
  });
  await page.setViewportSize({ width: 720, height: 900 });
  await expect.poll(() => probe(page)).toMatchObject({
    policy: "s700-m1000-l1280-xl1680", general: "center", title: "vertical-rl", gridColumnCount: 2, textColumns: "2", navigation: "flex",
  });

  await page.goto(previewUrl);
  await expect(page.locator('[data-builder-page-root]:not(footer)')).toBeVisible();
  // Storefront hydration replaces its initial root once; install the probe
  // after that render so the assertion observes the real settled surface.
  await page.waitForTimeout(300);
  await installResponsiveProbes(page);
  await expect.poll(() => probe(page)).toMatchObject({
    policy: "s700-m1000-l1280-xl1680", general: "center", title: "vertical-rl", gridColumnCount: 2, textColumns: "2", navigation: "flex",
  });

  // The policy is reversible through the same Global Styles/import owner;
  // this keeps the shared fixture document at its canonical UIkit defaults.
  await page.goto(builderUrl);
  await expect(page.locator(".builder-preview-shell").first()).toBeVisible();
  await setPolicy(page, 640, true);
  await expect(page.locator('[data-builder-page-root]:not(footer)')).toHaveAttribute(
    "data-responsive-breakpoint-policy",
    "s640-m960-l1200-xl1600",
  );
  // The actual Builder canvas is 620px wide at this application viewport;
  // therefore it returns to the default policy's base tier, rather than
  // relying on the browser window width as a proxy for preview width.
  await page.setViewportSize({ width: 640, height: 900 });
  await expect(page.locator('[data-builder-page-root]:not(footer)')).toHaveAttribute(
    "data-responsive-preview-tier",
    "base",
  );
  await installResponsiveProbes(page);
  await expect.poll(() => probe(page)).toMatchObject({
    policy: "s640-m960-l1200-xl1600", general: "start", title: "horizontal-tb", gridColumnCount: 1, textColumns: "auto", navigation: "none",
  });
});
