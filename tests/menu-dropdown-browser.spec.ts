import { expect, test } from "@playwright/test";
import { defaultBuilderShellSettings, normalizeBuilderShellSettings } from "@/lib/builderShell";
import newIn from "./fixtures/yootheme-compatibility/sources/new-in-menu-dropdown.json";

test("manual elements update immediately and use external Inspector and library hosts", async ({ page }) => {
  const previewRequests: unknown[] = [];
  await page.route("**/api/builder-layouts/preview", async route => {
    const { layout } = route.request().postDataJSON();
    previewRequests.push(layout);
    await route.fulfill({ json: { renderLayout: layout } });
  });
  await page.goto("/dashboard-menu-dropdown-proof");
  const tree = page.getByRole("tree", { name: "Women dropdown structure" });
  await tree.locator(".builder-structure-element-card").click();
  const inspector = page.getByRole("complementary", { name: "Hosted Inspector" });
  await expect(inspector.locator("[data-sublayout-detail]")).toBeVisible();
  await inspector.getByRole("textbox").first().fill("Live dropdown title");
  await expect(page.getByTestId("saved-heading")).toHaveText("Live dropdown title");
  await expect(tree).toBeVisible();
  await tree.getByRole("button", { name: "Add element", exact: true }).click();
  await expect(page.getByRole("dialog", { name: "Element library" })).toBeVisible();
  await page.getByRole("dialog", { name: "Element library" }).getByRole("textbox").fill("Divider");
  await page.locator(".builder-element-library-card").filter({ hasText: "Divider" }).click();
  await expect(tree).toContainText("Divider");
  await page.getByRole("button", { name: "Back to menu", exact: true }).click();
  await page.getByRole("button", { name: "Open dropdown builder" }).click();
  await expect(tree).toContainText("Divider");
  await page.locator(".site-header-nav > .site-header-nav-item > a").hover();
  await expect(page.getByRole("region", { name: "Women dropdown" })).toContainText("Live dropdown title");
  expect(JSON.stringify(previewRequests)).toContain("Live dropdown title");
});

test("real dashboard dropdown edits autosave and import uses the shared Section Library", async ({ page }) => {
  const saved: Record<string, unknown>[] = [];
  let templates: Record<string, unknown>[] = [];
  let serverSettings = normalizeBuilderShellSettings({ ...defaultBuilderShellSettings, namedMenus: [{ id: "main-menu", name: "Main Menu", items: [{ id: "women", label: "Women", url: "/women" }] }] });
  // Exercise the production UI and persistence payload, without writing tenant data.
  await page.route("**/api/**", async route => {
    if (["GET", "HEAD"].includes(route.request().method())) {
      if (route.request().url().includes("/api/builder-shell")) return route.fulfill({ json: { settings: serverSettings } });
      if (route.request().url().includes("/api/builder-templates")) return route.fulfill({ json: { templates } });
      return route.fulfill({ json: {} });
    }
    const body = route.request().postDataJSON();
    if (route.request().url().includes("builder-shell")) { saved.push(body); serverSettings = normalizeBuilderShellSettings(body); return route.fulfill({ json: { settings: serverSettings } }); }
    if (route.request().url().includes("builder-templates")) {
      const template = { ...body, id: `template-${templates.length + 1}`, updatedAt: new Date().toISOString(), libraryScope: "site" };
      templates = [template, ...templates];
      return route.fulfill({ json: { template, templates } });
    }
    if (route.request().url().includes("builder-layouts")) expect(JSON.stringify(body)).not.toContain("Dropdown pipeline test");
    return route.fulfill({ json: { success: true, settings: body, layout: body } });
  });
  await page.goto("/dashboard-menu-dropdown-proof/full?page=header");
  await page.getByRole("button", { name: "Menu", exact: true }).click();
  await page.getByLabel("WebPages menu").selectOption("main-menu");
  await page.getByRole("button", { name: "Open Women dropdown builder" }).click();
  const editor = page.locator("[data-menu-dropdown-editor]");
  await editor.getByRole("button", { name: "Add first row" }).click();
  await expect.poll(() => JSON.stringify(saved)).toContain('"columns"');
  await editor.getByRole("button", { name: "Add element", exact: true }).click();
  const library = page.locator(".builder-element-library-modal");
  await expect(library).toBeVisible();
  await library.getByRole("textbox").fill("Heading");
  await library.locator(".builder-element-library-card").filter({ hasText: "Heading" }).click();
  const inspector = page.locator(".builder-floating-inspector");
  await expect(inspector.locator("[data-sublayout-detail]")).toBeVisible();
  await inspector.getByRole("button", { name: "Close inspector", exact: true }).click();
  await expect(inspector).toBeHidden();
  await page.getByRole("button", { name: "Open Inspector", exact: true }).click();
  await expect(inspector.locator("[data-sublayout-detail]")).toBeVisible();
  await inspector.getByRole("textbox").first().fill("Dropdown pipeline test");
  await expect.poll(() => JSON.stringify(saved)).toContain("Dropdown pipeline test");
  const fragment = { type: "fragment", children: [{ type: "row", children: [{ type: "column", children: [{ type: "headline", props: { content: "Imported pipeline title" } }] }] }] };
  await editor.getByRole("button", { name: "Open Layout Library" }).click();
  let layoutLibrary = page.getByRole("dialog", { name: "Library" });
  await layoutLibrary.locator("label").filter({ hasText: "Import YOOtheme JSON to Library" }).locator("input").setInputFiles({ name: "dropdown.json", mimeType: "application/json", buffer: Buffer.from(JSON.stringify(fragment)) });
  await layoutLibrary.getByLabel("Library item name").fill("Imported pipeline dropdown");
  await layoutLibrary.getByRole("button", { name: "Import to Library" }).click();
  await expect(layoutLibrary).toContainText("Imported pipeline dropdown");
  await layoutLibrary.getByRole("button", { name: "Select" }).first().click();
  await layoutLibrary.getByRole("button", { name: "Apply to Dropdown" }).click();
  await expect.poll(() => JSON.stringify(saved)).toContain("Imported pipeline title");
  await page.reload();
  await page.getByRole("button", { name: "Menu", exact: true }).click();
  await page.getByLabel("WebPages menu").selectOption("main-menu");
  await page.getByRole("button", { name: "Open Women dropdown builder" }).click();
  await expect(page.getByRole("tree", { name: "Women dropdown structure" })).toContainText("Imported pipeline title");
  await editor.getByRole("button", { name: "Open Layout Library" }).click();
  layoutLibrary = page.getByRole("dialog", { name: "Library" });
  await layoutLibrary.locator("label").filter({ hasText: "Import YOOtheme JSON to Library" }).locator("input").setInputFiles({ name: "new-in.json", mimeType: "application/json", buffer: Buffer.from(JSON.stringify(newIn)) });
  await layoutLibrary.getByLabel("Library item name").fill("New In dropdown");
  await layoutLibrary.getByRole("button", { name: "Import to Library" }).click();
  await expect(layoutLibrary).toContainText("New In dropdown");
  await layoutLibrary.locator(".builder-template-row").filter({ hasText: "New In dropdown" }).getByRole("button", { name: "Select" }).click();
  await layoutLibrary.getByRole("button", { name: "Apply to Dropdown" }).click();
  await expect.poll(() => JSON.stringify(serverSettings)).toContain('"hoverVideoUrl"');
  await expect.poll(() => JSON.stringify(serverSettings)).toContain('"kind":"textAffix"');
  expect(JSON.stringify(serverSettings)).toContain('"source":"product-category"');
  expect(JSON.stringify(serverSettings)).toContain('"parentId":0');
  expect(JSON.stringify(serverSettings)).toContain('"order":"menuOrder"');
  expect(JSON.stringify(serverSettings)).toContain('"path":"acf.products_intro_image.url"');
  expect(JSON.stringify(serverSettings)).toContain('"path":"acf.products_hover_video.url"');
});
