import { expect, test, type Page } from "@playwright/test";

const email = "header-parity-20260722@example.test";
const password = "HeaderParity!2026";
const builderUrl = "/app/websites/header-parity-site/builder?page=header";
const previewUrl = "/app/websites/header-parity-site/preview";
const testPort = new URL(
  process.env.PLAYWRIGHT_BASE_URL ??
    process.env.HEADER_TEST_BASE_URL ??
    "http://localhost:3000",
).port || "80";
const tenantDomainBaseUrl = `http://granit.webpages.am:${testPort}`;

type HeaderMetrics = {
  background: string;
  behavior: string | null;
  color: string;
  height: number;
  radius: string;
  scrolled: string | undefined;
  top: number;
};

async function headerMetrics(page: Page, builder = false): Promise<HeaderMetrics> {
  return page.locator(builder ? ".builder-preview-header-slot .site-header" : ".site-header").evaluate((header) => {
    const rect = header.getBoundingClientRect();
    const style = getComputedStyle(header);
    return {
      background: style.backgroundColor,
      behavior: header.getAttribute("data-header-behavior"),
      color: style.color,
      height: rect.height,
      radius: style.borderRadius,
      scrolled: (header as HTMLElement).dataset.scrolled,
      top: rect.top,
    };
  });
}

async function setBehavior(page: Page, behavior: string) {
  await page.locator(".builder-header-document-tools button").click();
  const inspector = page.locator(".builder-floating-inspector");
  await inspector.locator("select").filter({ has: page.locator('option[value="pill-on-scroll"]') }).selectOption(behavior);
  await expect(page.locator(".builder-preview-header-slot .site-header")).toHaveAttribute("data-header-behavior", behavior);
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

test.beforeEach(async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/app(?:\?|$)/);
});

test("canonical Header geometry, colors, and behavior remain equal after publish", async ({ page, context }) => {
  await page.goto(builderUrl);
  await expect(page.locator(".builder-preview-header-slot .site-header")).toBeVisible();
  await page.waitForTimeout(400);

  await setBehavior(page, "sticky");
  await publish(page);

  const frontend = await context.newPage();
  await frontend.goto(previewUrl);
  await expect(frontend.locator(".site-header")).toBeVisible();
  await frontend.waitForTimeout(400);

  const builderTop = await headerMetrics(page, true);
  const frontendTop = await headerMetrics(frontend);
  expect(Math.abs(builderTop.height - frontendTop.height)).toBeLessThanOrEqual(2);
  expect(builderTop.background).toBe(frontendTop.background);
  expect(builderTop.color).toBe(frontendTop.color);
  expect(builderTop.behavior).toBe("sticky");
  expect(frontendTop.behavior).toBe("sticky");

  await page.locator(".builder-preview-shell").evaluate((shell) => {
    shell.setAttribute("data-theme", "dark");
    shell.classList.add("builder-preview-scheme-dark");
  });
  await frontend.evaluate(() => {
    document.documentElement.setAttribute("data-theme", "dark");
    document.documentElement.classList.add("dark");
  });
  await page.waitForTimeout(250);
  await frontend.waitForTimeout(250);
  expect((await headerMetrics(page, true)).color).toBe(
    (await headerMetrics(frontend)).color,
  );
  await page.locator(".builder-preview-shell").evaluate((shell) => {
    shell.setAttribute("data-theme", "light");
    shell.classList.remove("builder-preview-scheme-dark");
  });
  await frontend.evaluate(() => {
    document.documentElement.setAttribute("data-theme", "light");
    document.documentElement.classList.remove("dark");
  });

  await frontend.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Mobile", exact: true }).click();
  await expect.poll(async () => page.locator(".builder-preview-shell").evaluate((shell) => shell.classList.contains("builder-preview-mobile"))).toBe(true);
  await page.waitForTimeout(450);
  expect(await frontend.locator(".site-header").evaluate((header) => {
    const rect = header.getBoundingClientRect();
    return rect.left >= -1 && rect.right <= document.documentElement.clientWidth + 1;
  })).toBe(true);
  expect(await page.locator(".builder-preview-header-slot").evaluate((slot) => {
    const header = slot.querySelector(".site-header");
    if (!header) return false;
    const slotRect = slot.getBoundingClientRect();
    const headerRect = header.getBoundingClientRect();
    return headerRect.left >= slotRect.left - 1 && headerRect.right <= slotRect.right + 1;
  })).toBe(true);
  await frontend.setViewportSize({ width: 1440, height: 1000 });
  await page.getByRole("button", { name: "Desktop", exact: true }).click();

  await frontend.evaluate(() => window.scrollTo(0, 600));
  await expect.poll(async () => (await headerMetrics(frontend)).scrolled).toBe("true");
  expect(Math.abs((await headerMetrics(frontend)).top)).toBeLessThanOrEqual(2);

  await setBehavior(page, "sticky-on-scroll-up");
  await publish(page);
  await frontend.reload();
  await frontend.mouse.wheel(0, -10_000);
  await expect.poll(() => frontend.evaluate(() => window.scrollY)).toBeLessThanOrEqual(1);
  await frontend.evaluate(() => { if (document.scrollingElement) document.scrollingElement.scrollTop = 650; });
  await expect(frontend.locator(".site-header")).toHaveClass(/site-header--scroll-hidden/);
  await frontend.waitForTimeout(350);
  await frontend.evaluate(() => { if (document.scrollingElement) document.scrollingElement.scrollTop = 350; });
  await expect.poll(() => frontend.evaluate(() => window.scrollY)).toBeLessThanOrEqual(400);
  await expect(frontend.locator(".site-header")).not.toHaveClass(/site-header--scroll-hidden/);
  await expect.poll(async () => Math.abs((await headerMetrics(frontend)).top)).toBeLessThanOrEqual(2);

  await setBehavior(page, "static");
  await page.evaluate(() => window.scrollTo(0, 600));
  expect((await headerMetrics(page, true)).top).toBeLessThan(0);

  await page.evaluate(() => window.scrollTo(0, 0));
  await setBehavior(page, "pill-on-scroll");
  await page.waitForTimeout(400);
  expect(Number.parseFloat((await headerMetrics(page, true)).radius)).toBeLessThan(1);
  await page.evaluate(() => window.scrollTo(0, 600));
  await expect.poll(async () => (await headerMetrics(page, true)).scrolled).toBe("true");
  expect(Number.parseFloat((await headerMetrics(page, true)).radius)).toBeGreaterThan(100);

  const status = page.locator(".builder-context-preview-status--header-boundary");
  await expect(status).toHaveCSS("position", "relative");
  await expect(page.locator(".builder-header-page-context .builder-preview-canvas")).toHaveCSS("opacity", "0.58");
});

test("Header-wide visual controls persist and render identically", async ({ page, context }) => {
  await page.goto(builderUrl);
  await page.locator(".builder-header-document-tools button").click();
  const inspector = page.locator(".builder-floating-inspector");
  await inspector.locator("select").filter({ has: page.locator('option[value="accent"]') }).selectOption("accent");
  await inspector.locator("select").filter({ has: page.locator('option[value="light"]') }).selectOption("light");
  await inspector.locator("select").filter({ has: page.locator('option[value="full"]') }).selectOption("full");
  await inspector.locator("select").filter({ has: page.locator('option[value="compact"]') }).selectOption("compact");
  await inspector.getByTestId("header-transparent-checkbox").check();
  await inspector.getByTestId("header-overlay-checkbox").check();
  await publish(page);

  const frontend = await context.newPage();
  await frontend.goto(previewUrl);
  await expect(frontend.locator(".site-header")).toHaveClass(/site-header--background-none/);
  await expect(frontend.locator(".site-header")).toHaveClass(/site-header--builder-width-full/);
  await expect(frontend.locator(".site-header")).toHaveClass(/site-header--no-background/);
  await expect(frontend.locator(".site-header")).toHaveClass(/site-header--builder-overlay/);
  await expect(frontend.locator(".site-header")).toHaveAttribute("data-header-text-mode", "light");
  await expect(frontend.locator("main[data-builder-page-root]")).toHaveAttribute("data-overlap-header", "true");
  const lockedStatus = page.locator(
    ".builder-context-preview-status-sticky-wrapper",
  );
  await expect(lockedStatus).toHaveCSS("position", "absolute");
  await page.waitForTimeout(500);
  const lockedGeometry = await page.evaluate(() => {
    const header = document.querySelector<HTMLElement>(
      ".builder-preview-header-slot .site-header",
    );
    const status = document.querySelector<HTMLElement>(
      ".builder-context-preview-status-sticky-wrapper",
    );
    const viewport = header?.closest<HTMLElement>(
      ".builder-preview-viewport-container",
    );
    if (!header || !status) return null;
    return {
      headerBottom: header.getBoundingClientRect().bottom,
      statusTop: status.getBoundingClientRect().top,
      statusPosition: getComputedStyle(status).position,
      renderedHeight: viewport
        ? getComputedStyle(viewport).getPropertyValue(
            "--builder-preview-rendered-header-height",
          )
        : "",
    };
  });
  expect(lockedGeometry).not.toBeNull();
  expect(
    lockedGeometry!.statusTop,
    JSON.stringify(lockedGeometry),
  ).toBeGreaterThanOrEqual(lockedGeometry!.headerBottom + 8);
  await expect(
    page.locator(".builder-header-page-context .builder-preview-canvas"),
  ).toHaveCSS("opacity", "0.58");
  await page.waitForTimeout(400);
  await frontend.waitForTimeout(400);
  expect(Math.abs((await headerMetrics(page, true)).height - (await headerMetrics(frontend)).height)).toBeLessThanOrEqual(2);

  await page.reload();
  await page.locator(".builder-header-document-tools button").click();
  const reloadedInspector = page.locator(".builder-floating-inspector");
  await expect(reloadedInspector.locator("select").filter({ has: page.locator('option[value="accent"]') })).toHaveValue("accent");
  await expect(reloadedInspector.locator("select").filter({ has: page.locator('option[value="light"]') })).toHaveValue("light");
  await expect(reloadedInspector.locator("select").filter({ has: page.locator('option[value="full"]') })).toHaveValue("full");
  await expect(reloadedInspector.locator("select").filter({ has: page.locator('option[value="compact"]') })).toHaveValue("compact");
  await expect(reloadedInspector.getByTestId("header-transparent-checkbox")).toBeChecked();
  await expect(reloadedInspector.getByTestId("header-overlay-checkbox")).toBeChecked();

  await reloadedInspector.getByTestId("header-transparent-checkbox").uncheck();
  await reloadedInspector.getByTestId("header-overlay-checkbox").uncheck();
  await publish(page);
});

test("every Header preset renders through the shared Builder pipeline", async ({ page, context }) => {
  test.setTimeout(180_000);
  await page.goto(builderUrl);
  await page.locator(".builder-header-document-tools button").click();
  const cards = page.locator(".builder-header-preset-card");
  await expect(cards).toHaveCount(8);
  const frontend = await context.newPage();

  for (let index = 0; index < 8; index += 1) {
    if (!(await cards.first().isVisible().catch(() => false))) {
      await page.locator(".builder-header-document-tools button").click();
      await expect(cards).toHaveCount(8);
    }
    const presetLabel = (await cards.nth(index).innerText()).split("\n")[0];
    await cards.nth(index).click();
    await page.getByRole("button", { name: "Apply Preset", exact: true }).click();
    const header = page.locator(".builder-preview-header-slot .site-header");
    await expect(header).toBeVisible();
    expect(await header.evaluate((element) => element.getBoundingClientRect().height)).toBeGreaterThan(0);
    await expect(header.locator(".site-header-brand, .site-header-logo-img-wrap").first()).toBeVisible();
    await expect(header.locator(".header-builder-column.is-empty")).toHaveCount(0);
    expect(await header.locator(".header-builder-column").evaluateAll((columns) =>
      columns.every((column) => {
        const elements = Array.from(column.querySelectorAll<HTMLElement>(":scope > .builder-header-live-element"));
        return elements.slice(1).every((element, elementIndex) => {
          const previous = elements[elementIndex].getBoundingClientRect();
          const current = element.getBoundingClientRect();
          return Math.max(0, current.left - previous.right) <= 64;
        });
      }),
    )).toBe(true);
    await publish(page);
    await frontend.goto(previewUrl);
    await expect(frontend.locator(".site-header")).toBeVisible();
    await expect(
      frontend.locator(".site-header-brand, .site-header-logo-img-wrap").first(),
    ).toBeVisible();
    await page.waitForTimeout(250);
    await frontend.waitForTimeout(250);
    const builderPresetMetrics = await headerMetrics(page, true);
    const frontendPresetMetrics = await headerMetrics(frontend);
    const builderStructure = await header.evaluate((element) =>
      Array.from(element.querySelectorAll<HTMLElement>(
        ":scope > *, :scope > * > *",
      )).map((child) => ({
        className: child.className,
        display: getComputedStyle(child).display,
        height: child.getBoundingClientRect().height,
        position: getComputedStyle(child).position,
      })),
    );
    expect(
      Math.abs(
        builderPresetMetrics.height - frontendPresetMetrics.height,
      ),
      `${presetLabel}: ${JSON.stringify({ builderPresetMetrics, frontendPresetMetrics, builderStructure })}`,
    ).toBeLessThanOrEqual(2);
  }

  await expect(frontend.locator(".site-header")).toHaveAttribute(
    "data-header-behavior",
    await page.locator(".builder-preview-header-slot .site-header").getAttribute("data-header-behavior") ?? "sticky",
  );
});

test("Business navigation alignment is initialized, controlled, and rendered immediately", async ({ page }) => {
  await page.goto(builderUrl);
  expect(new URL(page.url()).port).toBe(testPort);
  await page.waitForTimeout(1500);
  await page.locator(".builder-header-document-tools button").click();
  await page.locator(".builder-header-preset-card").filter({ hasText: "Business" }).click();
  await page.getByRole("button", { name: "Apply Preset", exact: true }).click();

  const navigation = page.locator(
    '.builder-header-live-element[data-header-element="navigation"]',
  );
  await navigation.click();
  const alignment = page.getByTestId("header-element-alignment");
  await expect(alignment).toHaveValue("center");

  const relativeCenterOffset = () =>
    navigation.evaluate((element) => {
      const column = element.closest(".header-builder-column");
      if (!column) return Number.POSITIVE_INFINITY;
      const elementRect = element.getBoundingClientRect();
      const columnRect = column.getBoundingClientRect();
      return Math.abs(
        elementRect.left + elementRect.width / 2 -
          (columnRect.left + columnRect.width / 2),
      );
    });

  const initialGeometry = await navigation.evaluate((element) => {
    const column = element.closest<HTMLElement>(".header-builder-column")!;
    return {
      columnAlign: column.dataset.headerColumnAlign,
      columnJustify: getComputedStyle(column).justifyContent,
      columnStyle: column.getAttribute("style"),
      elementStyle: element.getAttribute("style"),
    };
  });
  expect(
    await relativeCenterOffset(),
    JSON.stringify(initialGeometry),
  ).toBeLessThanOrEqual(2);
  await alignment.selectOption("left");
  await expect.poll(async () =>
    navigation.evaluate((element) => {
      const column = element.closest(".header-builder-column")!;
      return Math.abs(
        element.getBoundingClientRect().left -
          column.getBoundingClientRect().left,
      );
    }),
  ).toBeLessThanOrEqual(2);
  await alignment.selectOption("center");
  await expect.poll(relativeCenterOffset).toBeLessThanOrEqual(2);
});

test("Root and tenant-domain storefronts honor their resolved behavior", async ({ page, browser }) => {
  await page.setViewportSize({ width: 1440, height: 200 });
  await page.goto("/");
  const root = page.locator(".site-header");
  await expect(root).toBeVisible();
  const rootBehavior = await root.getAttribute("data-header-behavior");
  await page.mouse.wheel(0, 600);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(100);
  if (rootBehavior === "static") {
    expect((await headerMetrics(page)).top).toBeLessThan(0);
  } else {
    await expect.poll(async () => Math.abs((await headerMetrics(page)).top)).toBeLessThanOrEqual(rootBehavior === "pill-on-scroll" ? 20 : 2);
  }

  const domainContext = await browser.newContext({
    baseURL: tenantDomainBaseUrl,
    viewport: { width: 1440, height: 200 },
  });
  const domainPage = await domainContext.newPage();
  await domainPage.goto("/");
  const domainHeader = domainPage.locator(".site-header");
  await expect(domainHeader).toBeVisible();
  const domainBehavior = await domainHeader.getAttribute("data-header-behavior");
  await domainPage.mouse.wheel(0, 600);
  await expect.poll(() => domainPage.evaluate(() => window.scrollY)).toBeGreaterThan(100);
  if (domainBehavior === "static") {
    expect((await headerMetrics(domainPage)).top).toBeLessThan(0);
  } else {
    await expect.poll(async () => Math.abs((await headerMetrics(domainPage)).top)).toBeLessThanOrEqual(domainBehavior === "pill-on-scroll" ? 20 : 2);
  }
  await domainContext.close();
});
