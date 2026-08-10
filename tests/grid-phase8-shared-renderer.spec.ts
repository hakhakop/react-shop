import { expect, test, type Page } from "@playwright/test";
import { mapYoothemeStaticContent } from "@/lib/yoothemePageImport";

const email = "header-parity-20260722@example.test";
const password = "HeaderParity!2026";
const websiteId = "header-parity-site";
const builderUrl = `/app/websites/${websiteId}/builder?page=home`;
const previewUrl = `/app/websites/${websiteId}/preview?page=home`;

const fixture = {
  type: "layout",
  children: [{
    type: "section",
    name: "Grid shared-renderer acceptance",
    children: [{
      type: "row",
      children: [{
        type: "column",
        children: [{
          type: "grid",
          props: {
            grid_default: "1",
            grid_small: "2",
            grid_medium: "3",
            grid_column_gap: "large",
            grid_row_gap: "small",
            grid_divider: true,
            grid_column_align: true,
            filter: true,
            filter_style: "subnav-pill",
            panel_style: "card-default",
            panel_padding: "large",
            image_align: "top",
            image_grid_width: "1-2",
            link_style: "secondary",
            link_text: "Open item",
            link_target: "blank",
            link_size: "large",
            link_fullwidth: true,
            link_margin: "medium",
            show_image: true,
            show_meta: true,
            show_content: true,
            show_link: true,
            show_title: true,
          },
          children: [
            { type: "grid_item", props: { title: "Platform <em>Pro</em>", meta: "Product", tags: "Product, Featured", content: "<p>Platform <strong>content</strong></p><script>window.bad = true</script>", image: "wp-content/uploads/yootheme/icon-deployment.svg", link: "/platform", panel_style: "card-primary" } },
            { type: "grid_item", props: { title: "Automation", meta: "Workflow", tags: "Workflow", content: "Automation content", image: "wp-content/uploads/yootheme/icon-automation.svg", link: "/automation" } },
            { type: "grid_item", props: { title: "Security", meta: "Product", tags: "Product", content: "Security content", image: "wp-content/uploads/yootheme/icon-security.svg", link: "/security" } },
          ],
        }],
      }],
    }],
  }],
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

async function gridPresentation(page: Page, builder: boolean) {
  const grid = page.locator(".shop-builder-grid").first();
  return grid.evaluate((element, isBuilder) => {
    const style = getComputedStyle(element);
    const cards = Array.from(element.querySelectorAll<HTMLElement>(".shop-builder-grid-card"));
    return {
      classes: Array.from(element.classList).sort(),
      columnGap: style.columnGap,
      rowGap: style.rowGap,
      columns: style.gridTemplateColumns.split(" ").length,
      cardClasses: cards.map((card) => Array.from(card.classList).filter((name) => name.startsWith("uk-card")).sort()),
      titles: cards.map((card) => card.querySelector("h1,h2,h3,h4,h5,h6")?.textContent?.trim()),
      titleHtml: cards.map((card) => card.querySelector(".shop-builder-title")?.innerHTML),
      contentHtml: cards.map((card) => card.querySelector(".shop-builder-grid-content")?.innerHTML),
      imageLinks: cards.map((card) => card.querySelector<HTMLAnchorElement>(".shop-builder-grid-image a")?.getAttribute("href")),
      chrome: isBuilder
        ? {
            edit: element.querySelectorAll('[aria-label^="Edit grid item"]').length,
            duplicate: element.querySelectorAll('[aria-label^="Duplicate grid item"]').length,
            remove: element.querySelectorAll('[aria-label^="Delete grid item"]').length,
            draggable: cards.filter((card) => card.getAttribute("draggable") === "true").length,
          }
        : null,
    };
  }, builder);
}

test("YOOtheme Card Hover maps to the canonical Grid hover state", () => {
  const cardHoverFixture = structuredClone(fixture);
  const props = cardHoverFixture.children[0].children[0].children[0].children[0].props;
  props.panel_style = "card-hover";
  const mapped = mapYoothemeStaticContent(cardHoverFixture);
  const grid = mapped.sections[0]?.layoutItems?.[0]?.blocks?.[0] as Record<string, unknown>;

  expect(grid).toMatchObject({ gridCardVariant: "default", gridCardHover: true });
  expect(grid.gridItems).not.toEqual(expect.arrayContaining([
    expect.objectContaining({ cardHover: true }),
  ]));
});

test("Grid item content normalizes rich HTML, tags, and explicit Card style", () => {
  const mapped = mapYoothemeStaticContent(fixture);
  const grid = mapped.sections[0]?.layoutItems?.[0]?.blocks?.[0] as Record<string, any>;
  const [platform, automation] = grid.gridItems;
  expect(platform).toMatchObject({
    tags: ["Product", "Featured"],
    cardVariant: "primary",
    text: "<p>Platform <strong>content</strong></p>",
  });
  expect(platform.title).toBe("Platform <em>Pro</em>");
  expect(automation.cardVariant).toBeUndefined();
});

test("Phase 8 Grid uses one presentation renderer with Builder-only item chrome", async ({ page, context }) => {
  await signIn(page);
  const originalPayload = await (await page.request.get(`/api/builder-layouts?key=home&websiteId=${websiteId}`)).json();
  const original = originalPayload.layout;
  const mapped = mapYoothemeStaticContent(fixture);
  const grid = mapped.sections[0]?.layoutItems?.[0]?.blocks?.[0] as Record<string, unknown>;

  expect(mapped.warnings).toEqual([]);
  expect(grid).toMatchObject({
    kind: "grid",
    gridGap: "large",
    gridRowGap: "small",
    showDividers: true,
    centerRows: true,
    columnsPhonePortrait: "1",
    columnsPhoneLandscape: "2",
    columnsTabletLandscape: "3",
    gridCardVariant: "default",
    gridCardSize: "large",
    enableFilter: true,
    filterStyle: "pill",
  });

  // Filter and lightbox are existing canonical Grid controls. The fixture turns
  // them on here to exercise the shared runtime without inventing source-only state.
  grid.enableFilter = true;
  grid.filterStyle = "pill";
  grid.enableLightbox = true;
  grid.gridCardHover = true;

  try {
    expect((await page.request.post(`/api/builder-layouts?websiteId=${websiteId}`, {
      data: { key: "home", design: original.design, sections: mapped.sections },
    })).ok()).toBeTruthy();

    await page.setViewportSize({ width: 1280, height: 900 });
    await clearBuilderCache(page);
    await page.goto(builderUrl);

    const builderGrid = page.locator(".shop-builder-grid").first();
    await expect(builderGrid).toHaveCount(1);
    await expect(page.getByRole("button", { name: "Product", exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Product", exact: true }).click();
    await expect(builderGrid.locator("..")).toHaveAttribute("data-grid-active-filter", "Product");
    await expect(builderGrid.locator("..")).toHaveAttribute("data-grid-visible-item-count", "2");
    await expect(builderGrid.locator(".shop-builder-grid-card")).toHaveCount(2);
    await page.getByRole("button", { name: "Featured", exact: true }).click();
    await expect(builderGrid.locator("..")).toHaveAttribute("data-grid-active-filter", "Featured");
    await expect(builderGrid.locator(".shop-builder-grid-card")).toHaveCount(1);
    await page.getByRole("button", { name: "Product", exact: true }).click();

    const builderBeforeCopy = await gridPresentation(page, true);
    expect(builderBeforeCopy).toMatchObject({
      columnGap: "40px",
      rowGap: "15px",
      columns: 3,
      chrome: { edit: 2, duplicate: 2, remove: 2, draggable: 2 },
    });
    expect(builderBeforeCopy.classes).toEqual(expect.arrayContaining(["uk-grid-divider", "shop-builder-grid--gap-large"]));
    expect(builderBeforeCopy.cardClasses).toEqual(expect.arrayContaining([
      expect.arrayContaining(["uk-card", "uk-card-primary", "uk-card-hover"]),
    ]));
    expect(builderBeforeCopy.titleHtml?.[0]).toContain("<em>Pro</em>");
    expect(builderBeforeCopy.contentHtml?.[0]).toContain("<strong>content</strong>");
    expect(builderBeforeCopy.contentHtml?.[0]).not.toContain("script");

    await builderGrid.getByRole("button", { name: "Duplicate grid item 1", exact: true }).click();
    await expect(builderGrid.locator(".shop-builder-grid-card")).toHaveCount(3);
    await builderGrid.getByRole("button", { name: "Delete grid item 1", exact: true }).click();
    await expect(builderGrid.locator(".shop-builder-grid-card")).toHaveCount(2);
    const cardsAfterCrud = builderGrid.locator(".shop-builder-grid-card");
    const dragOrderBefore = await cardsAfterCrud.evaluateAll((cards) =>
      cards.map((card) => card.querySelector("h1,h2,h3,h4,h5,h6")?.textContent?.trim()),
    );
    await cardsAfterCrud.first().dragTo(cardsAfterCrud.nth(1));
    await expect.poll(() => cardsAfterCrud.evaluateAll((cards) =>
      cards.map((card) => card.querySelector("h1,h2,h3,h4,h5,h6")?.textContent?.trim()),
    )).toEqual([...dragOrderBefore].reverse());

    await page.getByRole("button", { name: "Publish", exact: true }).click();
    await expect(page.getByText("Published successfully", { exact: true })).toBeVisible();
    await page.reload();
    await expect(page.locator(".shop-builder-grid").first()).toBeVisible();
    await page.getByRole("button", { name: "Product", exact: true }).click();
    await expect(page.locator(".shop-builder-grid").first().locator(".shop-builder-grid-card")).toHaveCount(2);

    const storefront = await context.newPage();
    await storefront.setViewportSize({ width: 1280, height: 900 });
    await storefront.goto(previewUrl);
    const storefrontGrid = storefront.locator(".shop-builder-grid").first();
    await expect(storefrontGrid).toHaveCount(1);
    await storefront.getByRole("button", { name: "Product", exact: true }).click();
    await expect(storefrontGrid.locator(".shop-builder-grid-card")).toHaveCount(2);

    const frontend = await gridPresentation(storefront, false);
    const builder = await gridPresentation(page, true);
    expect({ ...builder, chrome: null }).toEqual(frontend);
    expect(frontend.titleHtml?.join(" ")).toContain("<em>Pro</em>");
    expect(frontend.contentHtml?.join(" ")).toContain("<strong>content</strong>");
    expect(frontend.contentHtml?.join(" ")).not.toContain("script");
    expect(await storefront.locator(".shop-builder-grid-wrapper").first().getAttribute("data-uk-lightbox")).toBe("animation: slide");
    await storefront.locator(".shop-builder-grid-image a[data-caption]").first().click();
    await expect(storefront.locator(".uk-lightbox.uk-open")).toHaveCount(1);
    await storefront.close();
  } finally {
    expect((await page.request.post(`/api/builder-layouts?websiteId=${websiteId}`, {
      data: { key: "home", design: original.design, sections: original.sections },
    })).ok()).toBeTruthy();
  }
});

test("Grid keeps YOOtheme Auto, None, disabled hover, and missing item links semantic", async ({ page, context }) => {
  await signIn(page);
  const originalPayload = await (await page.request.get(`/api/builder-layouts?key=home&websiteId=${websiteId}`)).json();
  const original = originalPayload.layout;
  const autoFixture = structuredClone(fixture);
  const props = autoFixture.children[0].children[0].children[0].children[0].props;
  props.grid_default = "auto";
  props.grid_medium = "4";
  delete (props as Record<string, unknown>).panel_style;
  delete (props as Record<string, unknown>).panel_padding;
  delete (autoFixture.children[0].children[0].children[0].children[0].children[0].props as Record<string, unknown>).panel_style;
  delete (autoFixture.children[0].children[0].children[0].children[0].children[2].props as Record<string, unknown>).link;
  const mapped = mapYoothemeStaticContent(autoFixture);
  const grid = mapped.sections[0]?.layoutItems?.[0]?.blocks?.[0] as Record<string, unknown>;

  expect(grid).toMatchObject({
    columnsPhonePortrait: "auto",
    columnsTabletLandscape: "4",
    gridCardVariant: "blank",
    gridCardSize: "none",
    gridCardHover: false,
  });

  try {
    expect((await page.request.post(`/api/builder-layouts?websiteId=${websiteId}`, {
      data: { key: "home", design: original.design, sections: mapped.sections },
    })).ok()).toBeTruthy();

    await page.setViewportSize({ width: 1280, height: 900 });
    await clearBuilderCache(page);
    await page.goto(builderUrl);
    const builderGrid = page.locator(".shop-builder-grid").first();
    await expect(builderGrid).toHaveCount(1);
    // At Desktop, `grid_medium: 4` owns the layout. The same block must switch
    // back to YOOtheme Auto semantics at the Phone Portrait tier.
    await expect(builderGrid).toHaveCSS("display", "grid");
    await expect(builderGrid.locator(".shop-builder-grid-card")).toHaveCount(3);
    await expect(builderGrid.locator(".uk-card")).toHaveCount(0);
    await expect(builderGrid.locator(".uk-card-hover")).toHaveCount(0);
    await expect(builderGrid.locator(".shop-builder-grid-card--hover-disabled")).toHaveCount(3);
    await expect(builderGrid.locator(".shop-builder-grid-action")).toHaveCount(2);
    await expect(builderGrid.locator('.shop-builder-grid-action[href="#"]')).toHaveCount(0);

    await page.setViewportSize({ width: 500, height: 900 });
    await expect(builderGrid).toHaveCSS("display", "flex");

    const storefront = await context.newPage();
    await storefront.setViewportSize({ width: 500, height: 900 });
    await storefront.goto(previewUrl);
    const storefrontGrid = storefront.locator(".shop-builder-grid").first();
    await expect(storefrontGrid).toHaveCSS("display", "flex");
    await expect(storefrontGrid.locator(".uk-card")).toHaveCount(0);
    await expect(storefrontGrid.locator(".uk-card-hover")).toHaveCount(0);
    await expect(storefrontGrid.locator(".shop-builder-grid-action")).toHaveCount(2);
    await expect(storefrontGrid.locator('.shop-builder-grid-action[href="#"]')).toHaveCount(0);
    await storefront.close();
  } finally {
    expect((await page.request.post(`/api/builder-layouts?websiteId=${websiteId}`, {
      data: { key: "home", design: original.design, sections: original.sections },
    })).ok()).toBeTruthy();
  }
});
