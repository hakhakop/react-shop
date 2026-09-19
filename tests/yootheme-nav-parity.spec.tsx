import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, test } from "@playwright/test";
import fixture from "./fixtures/yootheme-compatibility/sources/devstack-nav.json";
import { mapYoothemeStaticContent } from "@/lib/yoothemePageImport";
import { readFileSync } from "node:fs";
import ts from "typescript";
// Playwright transforms JSX into component-test descriptors; compile this
// renderer with React's JSX runtime for an actual server-rendered markup check.
const rendererModule = { exports: {} as typeof import("@/components/builder/UikitNav") };
new Function("require", "module", "exports", ts.transpileModule(
  readFileSync("components/builder/UikitNav.tsx", "utf8"),
  { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } },
).outputText)(require, rendererModule, rendererModule.exports);
const { NavMarkup, splitNavColumns } = rendererModule.exports;
import { projectWordPressMenuContexts } from "@/lib/wordpressMenuContentProvider.server";
import { materializeBuilderDynamicContent } from "@/lib/builderDynamicContentMaterializer.server";
import type { BuilderLayout } from "@/lib/builderLayouts";

const wrap = (nav: unknown) => ({ type: "layout", children: [{ type: "section", children: [{ type: "row", children: [{ type: "column", children: [nav] }] }] }] });

test("DevStack Nav retains layout settings, dynamic media, and reference column order", async () => {
  const mapped = mapYoothemeStaticContent(wrap(fixture.nav));
  expect(mapped.warnings).toEqual([]);
  const nav = mapped.sections[0].rows![0].columns[0].elements[0];
  expect(nav).toMatchObject({ navStyle: "secondary", navColumns: 2, navGridColumnGap: "large", navGridRowGap: "large", imageWidth: "50", navImageMargin: true });
  const labels = ["Deployment", "CI/CD", "Security", "Features", "Automation", "Infrastructure", "Integrations"];
  const menus = [{ databaseId: 9, menuItems: { nodes: labels.map((label, index) => ({ databaseId: index + 41, parentDatabaseId: 40, label, url: `/${label}` })) } }];
  const layout: BuilderLayout = { version: 1, page: "home", updatedAt: "", sections: mapped.sections };
  const original = JSON.stringify(layout);
  const resolved = await materializeBuilderDynamicContent(layout, {
    resolveContexts: async input => projectWordPressMenuContexts(menus, input, fixture.menuItems),
  });
  const result = resolved.renderLayout.sections[0].rows![0].columns[0].elements[0];
  expect(result.navItems).toHaveLength(7);
  expect(result.navItems![0]).toMatchObject({ label: "Deployment", meta: fixture.menuItems["41"].subtitle });
  expect(result.navItems![0].imageUrl).toContain("icon-deployment.svg");
  expect(splitNavColumns(result.navItems!, 2).map(group => group.map(item => item.label))).toEqual([labels.slice(0, 4), labels.slice(4)]);
  const html = renderToStaticMarkup(React.createElement(NavMarkup, { block: result }));
  expect(html.match(/<ul /g)).toHaveLength(2);
  expect(html).toContain('uk-grid uk-child-width-expand uk-grid-large');
  expect(html).toContain('width="50"');
  expect(html.match(/class="uk-grid uk-grid-small uk-child-width-expand uk-flex-nowrap"/g)).toHaveLength(7);
  expect(html).not.toContain('class="uk-width-expand"');
  expect(html.match(/class="uk-nav-subtitle"/g)).toHaveLength(7);
  expect(html).not.toContain("uk-text-meta");
  expect(JSON.stringify(layout)).toBe(original);
});

test("Nav imports responsive grids, semantic wrapper, item markup and active state", () => {
  const mapped = mapYoothemeStaticContent(wrap({ type: "nav", props: {
    nav_style: "navbar-dropdown-nav", nav_divider: true, html_element: "nav", grid: "3", grid_breakpoint: "m", grid_column_gap: "collapse", grid_row_gap: "small", grid_divider: true, show_image: false, show_meta: false,
  }, children: [
    { type: "nav_item", props: { content: "<strong>Home &amp; More</strong>", link: "/", active: true, link_target: true, link_scroll: true, image: "/image.svg", meta: "hidden subtitle" } },
    { type: "nav_item", props: { content: "Heading", type: "heading" } },
    { type: "nav_item", props: { type: "divider" } },
  ] }));
  expect(mapped.warnings).toEqual([]);
  const nav = mapped.sections[0].rows![0].columns[0].elements[0];
  const html = renderToStaticMarkup(React.createElement(NavMarkup, { block: nav }));
  expect(nav.navItems?.[0]).toMatchObject({ target: "_blank" });
  expect(nav.navItems?.[1]).toMatchObject({ type: "header" });
  for (const value of ['<nav class="shop-builder-nav">', 'uk-child-width-expand@m', 'uk-grid-column-collapse', 'uk-grid-row-small', 'uk-navbar-dropdown-nav', 'aria-current="page"', 'target="_blank"', 'uk-scroll=""', '<strong>Home &amp; More</strong>', 'uk-nav-header', 'role="separator"']) expect(html).toContain(value);
  expect(html).not.toContain('uk-grid-divider');
  expect(html).not.toContain('<img');
  expect(html).not.toContain('hidden subtitle');
});
