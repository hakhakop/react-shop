import { expect, test, type Page } from "@playwright/test";
import { mapYoothemeStaticContent } from "@/lib/yoothemePageImport";
import { resolvePanelPresentation } from "@/lib/panelPresentation";

const email = "header-parity-20260722@example.test";
const password = "HeaderParity!2026";
const websiteId = "header-parity-site";
const builderUrl = `/app/websites/${websiteId}/builder?page=home`;
const previewUrl = `/app/websites/${websiteId}/preview?page=home`;

const fixture = {
  type: "layout",
  children: [{ type: "section", name: "Panel acceptance", children: [{ type: "row", children: [{ type: "column", children: [
    { type: "panel", props: {
      title: "Panel title", meta: "Panel meta", content: "Panel content", image: "https://placehold.co/900x500/png",
      link: "/panel-target", link_text: "Open panel", link_target: "blank", link_style: "secondary", link_size: "large",
      panel_style: "card-primary", panel_link: true, panel_link_hover: true, panel_padding: "large",
      panel_image_no_padding: false, height_expand: true, panel_expand: "content", image_align: "top", meta_align: "below-content",
    } },
  ] }] }] }],
};

test("Phase 7 Panel variants normalize into the shared card presentation", () => {
  const styles = [
    ["card-default", ["uk-card", "uk-card-default"]],
    ["card-primary", ["uk-card", "uk-card-primary"]],
    ["card-secondary", ["uk-card", "uk-card-secondary"]],
    ["card-hover", ["uk-card", "uk-card-default", "uk-card-hover"]],
    ["tile-muted", ["uk-tile", "uk-tile-muted"]],
  ] as const;

  for (const [panel_style, classes] of styles) {
    const mapped = mapYoothemeStaticContent({
      type: "layout",
      children: [{ type: "section", children: [{ type: "row", children: [{ type: "column", children: [{ type: "panel", props: { panel_style } }] }] }] }],
    });
    const panel = mapped.sections[0]?.layoutItems?.[0]?.blocks?.[0];
    expect(mapped.warnings).toEqual([]);
    expect(resolvePanelPresentation(panel as Record<string, unknown>).className.split(" ")).toEqual(expect.arrayContaining([...classes]));
  }
});

async function signIn(page: Page) {
  await page.goto("/login");
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/app(?:\?|$)/);
}

async function clearBuilderCache(page: Page) {
  await page.evaluate(() => {
    Object.keys(localStorage)
      .filter((key) => key.startsWith("react-shop-visual-builder"))
      .forEach((key) => localStorage.removeItem(key));
  });
}

async function panelState(page: Page, builder: boolean) {
  const selector = builder
    ? '[data-builder-block-key="yootheme-panel-0-0-0-0"] .shop-builder-column-block--panel'
    : '[data-builder-block-id="yootheme-panel-0-0-0-0"].shop-builder-column-block--panel';
  return page.locator(selector).evaluate((panel) => {
    const media = panel.querySelector<HTMLElement>(".shop-builder-panel-media");
    const body = panel.querySelector<HTMLElement>(".uk-card-body");
    const meta = body?.querySelector<HTMLElement>(":scope > .shop-builder-panel-meta");
    const content = body?.querySelector<HTMLElement>(":scope > p");
    return {
      classes: Array.from(panel.classList).filter((name) => name.startsWith("uk-") || name.startsWith("shop-builder-panel--")).sort(),
      mediaMarginTop: media ? getComputedStyle(media).marginTop : "",
      bodyPadding: body ? getComputedStyle(body).paddingTop : "",
      bodyDisplay: body ? getComputedStyle(body).display : "",
      metaAfterContent: Boolean(meta && content && Boolean(content.compareDocumentPosition(meta) & Node.DOCUMENT_POSITION_FOLLOWING)),
      overlayHref: panel.querySelector<HTMLAnchorElement>(".shop-builder-panel-link-overlay")?.getAttribute("href") ?? null,
      overlayTarget: panel.querySelector<HTMLAnchorElement>(".shop-builder-panel-link-overlay")?.getAttribute("target") ?? null,
      actionCount: panel.querySelectorAll(".shop-builder-panel-action").length,
    };
  });
}

test("Phase 7 Panel/Card imports canonical presentation and matches Builder/storefront", async ({ page, context }) => {
  await signIn(page);
  const originalPayload = await (await page.request.get(`/api/builder-layouts?key=home&websiteId=${websiteId}`)).json();
  const original = originalPayload.layout;
  const mapped = mapYoothemeStaticContent(fixture);
  const panel = mapped.sections[0]?.layoutItems?.[0]?.blocks?.[0];

  expect(mapped.warnings).toEqual([]);
  expect(panel).toMatchObject({
    kind: "panel", panelVariant: "primary", panelSize: "large", linkPanel: true,
    panelHover: true, panelImageNoPadding: false, panelHeightExpand: true,
    panelExpand: "content", panelMetaPosition: "below-content",
  });

  try {
    expect((await page.request.post(`/api/builder-layouts?websiteId=${websiteId}`, {
      data: { key: "home", design: original.design, sections: mapped.sections },
    })).ok()).toBeTruthy();

    await clearBuilderCache(page);
    await page.goto(builderUrl);
    const block = page.locator('[data-builder-block-key="yootheme-panel-0-0-0-0"]');
    await expect(block).toHaveCount(1);
    await block.click();
    await page.getByRole("button", { name: "Edit element" }).click();
    await page.getByRole("button", { name: "Settings", exact: true }).click();
    const inspector = page.locator('[data-uikit-capability="panel-settings"]');
    await expect(inspector).toHaveCount(1);
    await expect(inspector.getByText("PANEL", { exact: true }).first()).toBeVisible();
    await expect(inspector.getByLabel("Panel style", { exact: true }).first()).toHaveValue("primary");
    await expect(inspector.getByLabel("Panel expand content", { exact: true }).first()).toHaveValue("content");
    await expect(inspector.getByRole("option", { name: "Card Hover", exact: true })).toHaveCount(0);
    await expect(inspector.getByText("IMAGE LAYOUT", { exact: true })).toHaveCount(0);
    await expect(inspector.getByLabel("Panel media alignment", { exact: true }).getByRole("radio", { name: "Top", exact: true })).toBeChecked();
    await expect(inspector.getByLabel("Panel media grid width", { exact: true })).toHaveValue("large");
    await expect(inspector.getByText("Show action", { exact: true })).toHaveCount(0);

    const builder = await panelState(page, true);
    expect(builder).toMatchObject({ mediaMarginTop: "40px", bodyPadding: "40px", bodyDisplay: "flex", metaAfterContent: true, overlayHref: "/panel-target", overlayTarget: "_blank", actionCount: 0 });
    expect(builder.classes).toEqual(expect.arrayContaining(["uk-card", "uk-card-primary", "uk-card-hover", "uk-card-large", "shop-builder-panel--media-padded", "shop-builder-panel--height-expand", "shop-builder-panel--expand-content", "shop-builder-panel--linked"]));

    const storefront = await context.newPage();
    await storefront.goto(previewUrl);
    const frontend = await panelState(storefront, false);
    expect(frontend).toEqual(builder);
    await storefront.close();
  } finally {
    expect((await page.request.post(`/api/builder-layouts?websiteId=${websiteId}`, {
      data: { key: "home", design: original.design, sections: original.sections },
    })).ok()).toBeTruthy();
  }
});
