import { expect, test, type Page } from "@playwright/test";
import { mapYoothemeStaticContent } from "@/lib/yoothemePageImport";

const email = "header-parity-20260722@example.test";
const password = "HeaderParity!2026";
const websiteId = "header-parity-site";
const builderUrl = `/app/websites/${websiteId}/builder?page=home`;
const previewUrl = `/app/websites/${websiteId}/preview?page=home`;

const fixture = {
  type: "layout",
  children: [{ type: "section", name: "Button acceptance", children: [{ type: "row", children: [{ type: "column", children: [
    { type: "button", props: { button_size: "large", fullwidth: true, text_align: "center" }, children: [
      { type: "button_item", props: { content: "Primary action", link: "/primary", button_style: "primary" } },
      { type: "button_item", props: { content: "Text action", link: "/text", button_style: "text", link_target: "blank" } },
    ] },
    { type: "panel", props: { title: "Panel action", content: "Panel body", link: "/panel", link_text: "Panel link", link_style: "secondary", link_target: "blank", link_size: "large", link_fullwidth: true, link_margin: "medium" } },
    { type: "grid", props: { link_text: "Grid link", link_style: "default", link_target: "blank", link_size: "small", link_fullwidth: true, link_margin: "large" }, children: [
      { type: "grid_item", props: { title: "Grid action", link: "/grid" } },
    ] },
  ] }] }] }],
};

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

async function actionState(page: Page, builder: boolean) {
  const blockSelector = builder
    ? '[data-builder-block-key^="yootheme-"]'
    : '[data-builder-block-id^="yootheme-"]';
  const attribute = builder ? "data-builder-block-key" : "data-builder-block-id";
  return page.locator(blockSelector).evaluateAll((nodes, dataAttribute) =>
    (nodes as HTMLElement[])
      .filter((block) => !block.parentElement?.closest(`[${dataAttribute}]`))
      .flatMap((block) =>
      Array.from(block.querySelectorAll<HTMLElement>(".uk-button")).map((button) => {
        const style = getComputedStyle(button);
        return {
          block: block.getAttribute(dataAttribute),
          text: button.textContent?.trim(),
          uikitClasses: Array.from(button.classList)
            .filter((className) => className.startsWith("uk-button") || className === "uk-width-1-1")
            .sort()
            .join(" "),
          marginClasses: Array.from(
            button.closest(".shop-builder-grid-button")?.classList ?? button.classList,
          )
            .filter((className) => className.startsWith("uk-margin"))
            .sort()
            .join(" "),
          height: button.getBoundingClientRect().height,
          fontFamily: style.fontFamily,
          fontSize: style.fontSize,
          fontWeight: style.fontWeight,
          lineHeight: style.lineHeight,
          textTransform: style.textTransform,
          paddingLeft: style.paddingLeft,
          paddingRight: style.paddingRight,
          borderRadius: style.borderRadius,
          boxShadow: style.boxShadow,
        };
      }),
    ),
    attribute,
  );
}

test("Phase 6 Button/Link actions share canonical import, inspector, and renderer semantics", async ({ page, context }) => {
  await signIn(page);
  const originalPayload = await (await page.request.get(`/api/builder-layouts?key=home&websiteId=${websiteId}`)).json();
  const original = originalPayload.layout;
  const mapped = mapYoothemeStaticContent(fixture);
  const blocks = mapped.sections[0]?.layoutItems?.[0]?.blocks ?? [];
  const [button, panel, grid] = blocks;

  expect(mapped.warnings).toEqual([]);
  expect(button).toMatchObject({ kind: "button", size: "large", fullWidthButton: true });
  expect(button.buttons).toHaveLength(2);
  expect(panel).toMatchObject({ panelActionStyle: "secondary", panelActionSize: "large", fullWidthButton: true, linkMarginTop: "medium", buttonTarget: "_blank" });
  expect(grid).toMatchObject({ buttonStyle: "default", size: "small", fullWidthButton: true, linkMarginTop: "large", buttonTarget: "_blank" });

  try {
    expect((await page.request.post(`/api/builder-layouts?websiteId=${websiteId}`, {
      data: { key: "home", design: original.design, sections: mapped.sections },
    })).ok()).toBeTruthy();

    const persisted = await (await page.request.get(`/api/builder-layouts?key=home&websiteId=${websiteId}`)).json();
    expect(persisted.layout.sections[0].layoutItems[0].blocks[0].buttons).toHaveLength(2);

    await page.setViewportSize({ width: 1280, height: 900 });
    await clearBuilderCache(page);
    await page.goto(builderUrl);

    const buttonBlock = page.locator('[data-builder-block-key="yootheme-button-0-0-0-0"]');
    await expect(buttonBlock).toHaveCount(1);
    await buttonBlock.click();
    await page.getByRole("button", { name: "Edit element" }).click();
    await page.getByRole("button", { name: "Content", exact: true }).click();
    await expect(page.locator('[data-button-item-id]')).toHaveCount(2);
    await page.getByRole("button", { name: /Edit item 1/ }).click();
    await expect(page.getByLabel("Button item 1 label")).toHaveValue("Primary action");
    await page.getByLabel("Button item 1 label").fill("Primary action updated");
    await page.getByRole("button", { name: /Edit item 2/ }).click();
    await expect(page.getByLabel("Button item 2 target")).toHaveValue("_blank");
    await page.getByRole("button", { name: "Publish", exact: true }).click();
    await page.waitForTimeout(300);
    await page.reload();
    await buttonBlock.click();
    await page.getByRole("button", { name: "Edit element" }).click();
    await page.getByRole("button", { name: "Content", exact: true }).click();
    await page.getByRole("button", { name: /Edit item 1/ }).click();
    await expect(page.getByLabel("Button item 1 label")).toHaveValue("Primary action updated");

    const builderState = await actionState(page, true);
    const frontend = await context.newPage();
    await frontend.setViewportSize({ width: 1280, height: 900 });
    await frontend.goto(previewUrl);
    const storefrontState = await actionState(frontend, false);

    expect(builderState).toEqual(storefrontState);
    expect(builderState).toEqual(expect.arrayContaining([
      expect.objectContaining({ text: "Primary action updated", uikitClasses: expect.stringMatching(/(?=.*uk-button-primary)(?=.*uk-button-large)/) }),
      expect.objectContaining({ text: "Text action", uikitClasses: expect.stringMatching(/(?=.*uk-button-text)(?=.*uk-button-large)/) }),
      expect.objectContaining({ text: "Panel link", uikitClasses: expect.stringMatching(/(?=.*uk-button-secondary)(?=.*uk-button-large)(?=.*uk-width-1-1)/), marginClasses: "uk-margin" }),
      expect.objectContaining({ text: "Grid link", uikitClasses: expect.stringMatching(/(?=.*uk-button-default)(?=.*uk-button-small)(?=.*uk-width-1-1)/), marginClasses: "uk-margin-large" }),
    ]));

    const large = builderState.find((action) => action.text === "Primary action updated");
    expect(large).toMatchObject({ height: 56, fontSize: "16px", lineHeight: "52px", paddingLeft: "40px", paddingRight: "40px", textTransform: "uppercase" });
    await expect(frontend.locator('a[href="/text"]')).toHaveAttribute("target", "_blank");
    await expect(frontend.locator('a[href="/text"]')).toHaveAttribute("rel", "noreferrer");
    await expect(frontend.locator('a[href="/panel"]')).toHaveAttribute("target", "_blank");
    await expect(frontend.locator('a[href="/grid"]')).toHaveAttribute("target", "_blank");
    await frontend.close();
  } finally {
    expect((await page.request.post(`/api/builder-layouts?websiteId=${websiteId}`, {
      data: { key: "home", design: original.design, sections: original.sections },
    })).ok()).toBeTruthy();
  }
});
