import { expect, test } from "@playwright/test";

test("imported To Top: responsive layout, real inspector, keyboard and floating opt-in", async ({ page }, testInfo) => {
  await page.goto("/dashboard-back-to-top-proof");
  // Make screenshot auto-scrolling immediate; the control still explicitly requests smooth scrolling.
  await page.addStyleTag({ content: "html { scroll-behavior: auto !important; }" });
  const inline = page.locator('[data-back-to-top="inline"]');
  await expect(inline).toBeVisible();
  await expect(inline).toHaveAttribute("title", "Return to beginning");
  await expect(page.locator('[data-back-to-top="floating"]')).toHaveCount(0);
  await expect(page.getByRole("slider", { name: "Left", exact: true })).toBeDisabled();
  await page.getByRole("combobox", { name: "Position", exact: true }).selectOption("relative");
  await expect(page.getByRole("slider", { name: "Left", exact: true })).toBeEnabled();
  await page.getByRole("combobox", { name: "Position", exact: true }).selectOption("static");
  const geometry = () => page.locator(".shop-builder-totop .el-title").evaluate(el => {
    const t = el.getBoundingClientRect();
    const b = el.closest(".shop-builder-totop")!.querySelector("a")!.getBoundingClientRect();
    return { titleBefore: t.right <= b.left, titleBelow: t.top >= b.bottom, titleLeft: t.left, buttonRight: b.right, titleWidth: t.width, buttonWidth: b.width };
  });
  await page.setViewportSize({ width: 1280, height: 800 });
  await expect.poll(async () => (await geometry()).titleBefore).toBe(true);
  expect((await geometry()).titleLeft).toBeGreaterThanOrEqual(0);
  expect((await geometry()).buttonRight).toBeLessThanOrEqual(1280);
  await page.getByTestId("element-shell").screenshot({ path: testInfo.outputPath("desktop.png") });
  await page.setViewportSize({ width: 600, height: 800 });
  await expect.poll(async () => (await geometry()).titleBelow).toBe(true);
  await page.getByTestId("element-shell").screenshot({ path: testInfo.outputPath("mobile.png") });
  await inline.scrollIntoViewIfNeeded();
  expect(await page.evaluate(() => scrollY)).toBeGreaterThan(400);
  await inline.focus();
  await page.keyboard.press("Space");
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
  await page.getByRole("switch", { name: "Floating Button", exact: true }).check();
  await page.evaluate(() => window.scrollTo(0, 900));
  const floating = page.locator('[data-back-to-top="floating"]');
  await expect(floating).toBeVisible();
  expect(await inline.count()).toBe(1);
  await floating.click();
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
  await expect(floating).toHaveCount(0);
  await page.getByRole("switch", { name: "Floating Button", exact: true }).uncheck();
  await page.evaluate(() => window.scrollTo(0, 900));
  await expect(floating).toHaveCount(0);
});

test("preview iframe scrolls independently from the builder document", async ({ page, baseURL }) => {
  // A same-origin host reproduces Builder embedding without third-party storage restrictions.
  await page.route("**/back-to-top-frame-host", route => route.fulfill({ contentType: "text/html", body: `<iframe title="Preview" src="${baseURL}/dashboard-back-to-top-proof" style="width:100%;height:700px"></iframe><div style="height:3000px"></div>` }));
  await page.goto("/back-to-top-frame-host");
  const preview = page.frameLocator('iframe[title="Preview"]');
  const inline = preview.locator('[data-back-to-top="inline"]');
  await expect(inline).toBeVisible();
  await page.evaluate(() => window.scrollTo(0, 150));
  await inline.evaluate(el => el.ownerDocument.defaultView!.scrollTo(0, 1500));
  await inline.evaluate(el => (el as HTMLElement).click());
  await expect.poll(() => inline.evaluate(el => el.ownerDocument.defaultView!.scrollY)).toBe(0);
  expect(await page.evaluate(() => window.scrollY)).toBe(150);
});
