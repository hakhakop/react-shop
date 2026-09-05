import { expect, test } from "@playwright/test";
import { mapYoothemeStaticContent } from "@/lib/yoothemePageImport";
import { materializeBuilderDynamicContent } from "@/lib/builderDynamicContentMaterializer.server";
import type { BuilderLayout } from "@/lib/builderLayouts";
import { scrollBackToTop } from "@/components/builder/UikitBackToTop";
import { transformBackToTop } from "@/lib/backToTopTransform";
import { createYoothemePageImportReport } from "@/lib/yoothemeImportReport";

export const backToTopSource = (props: Record<string, unknown> = {}, source?: unknown) => ({ type: "layout", children: [{ type: "section", children: [{ type: "row", children: [{ type: "column", children: [{ type: "totop", props, ...(source ? { source } : {}) }] }] }] }] });
const imported = (props: Record<string, unknown> = {}) => mapYoothemeStaticContent(backToTopSource(props));
const element = (result: ReturnType<typeof imported>) => result.sections[0].rows![0].columns[0].elements[0];

test("imports original totop defaults without inventing content or a floating button", () => {
  const result = imported();
  expect(result.warnings).toEqual([]);
  expect(element(result)).toMatchObject({ kind: "backToTop", backToTop: { title: "", linkTitle: "", columnGap: "small", rowGap: "small", breakpoint: "", floatingButton: false }, visualStyle: { layout: { marginMode: "default" } } });
});

test("preserves title, tooltip, responsive gaps, General and Advanced source semantics", () => {
  const result = imported({ title: "Back to Top", link_title: "Return to beginning", title_style: "meta", title_grid_column_gap: "collapse", title_grid_row_gap: "", title_grid_breakpoint: "m", text_align: "right", margin: "large", maxwidth: "small", maxwidth_breakpoint: "m", position: "relative", position_top: -20, position_z_index: 2, visibility: "hidden-s", name: "Footer return", id: "return-top", status: "disabled", class: "custom-totop", attributes: 'data-test="totop"', css: ".el-title { color: red; }", animation: "slide-top-small" });
  expect(result.warnings).toEqual([]);
  expect(element(result)).toMatchObject({ backToTopLinkTitle: "Return to beginning", backToTop: { title: "Back to Top", titleStyle: "meta", columnGap: "collapse", rowGap: "", breakpoint: "m", htmlId: "return-top", disabled: true }, visualStyle: { customClass: "custom-totop", customAttributes: 'data-test="totop"', customCss: ".el-title { color: red; }", layout: { textAlign: "right", marginMode: "large", maxWidth: "small", maxWidthBreakpoint: "medium", position: "relative", top: "-20px", zIndex: 2, visibilityMode: "hidden-s" } }, animation: { preset: "slide-top-small" } });
  expect(JSON.parse(JSON.stringify(element(result)))).toEqual(element(result));
});

test("all source title style, gap and breakpoint options survive import", () => {
  for (const title_style of ["", "small", "meta"]) for (const gap of ["small", "medium", "", "large", "collapse"]) for (const breakpoint of ["", "s", "m", "l", "xl"]) {
    const result = imported({ title: "Top", title_style, title_grid_column_gap: gap, title_grid_row_gap: gap, title_grid_breakpoint: breakpoint });
    expect(element(result).backToTop).toMatchObject({ titleStyle: title_style, columnGap: gap, rowGap: gap, breakpoint });
    expect(result.warnings).toEqual([]);
  }
});

test("dynamic Link Title resolves through import and does not mutate the saved template", async () => {
  const result = mapYoothemeStaticContent(backToTopSource({ link_title: "Fallback" }, { query: { name: "profiles.customProfiles", arguments: { limit: 1 } }, props: { link_title: { name: "field.tooltip" } } }));
  expect(element(result).dynamicBindings).toMatchObject({ backToTopLinkTitle: { path: "acf.tooltip", valueType: "string" } });
  const layout: BuilderLayout = { version: 1, key: "home", page: "home", updatedAt: "2026-09-05T00:00:00Z", sections: result.sections };
  const saved = JSON.stringify(layout);
  const resolved = await materializeBuilderDynamicContent(layout, { resolveContexts: async () => [{ id: "one", fields: { "acf.tooltip": { type: "string", value: "Dynamic tooltip" } } }] });
  expect(resolved.renderLayout.sections[0].rows![0].columns[0].elements[0].backToTopLinkTitle).toBe("Dynamic tooltip");
  expect(JSON.stringify(layout)).toBe(saved);
});

test("scroll action belongs to the control's document and respects reduced motion", () => {
  for (const reduced of [false, true]) {
    const calls: unknown[] = [];
    const control = { ownerDocument: { defaultView: { matchMedia: () => ({ matches: reduced }), scrollTo: (options: unknown) => calls.push(options) } } } as unknown as HTMLElement;
    scrollBackToTop(control);
    expect(calls).toEqual([{ top: 0, behavior: reduced ? "instant" : "smooth" }]);
  }
});

test("None animation remains explicit and Transform removes To Top-only settings", () => {
  const block = element(imported({ title: "Return", animation: "none" }));
  expect(block.animation).toEqual({ preset: "none" });
  const transformed = { ...block, ...transformBackToTop(block, "heading") };
  expect(transformed).toMatchObject({ id: block.id, kind: "heading", headingText: "Return", animation: { preset: "none" } });
  expect(transformed.backToTop).toBeUndefined();
  expect(transformed.backToTopLinkTitle).toBeUndefined();
});

test("the import report recognizes mapped To Top fields instead of reporting unsupported", () => {
  const report = createYoothemePageImportReport(backToTopSource({ title: "Back", link_title: "Return", title_style: "small", title_grid_column_gap: "small", title_grid_row_gap: "large", title_grid_breakpoint: "m", text_align: "right" }));
  expect(report.byStatus.UNHANDLED).toEqual([]);
});

test("Advanced dynamic fields use their declared destinations", async () => {
  const result = mapYoothemeStaticContent(backToTopSource({}, { query: { name: "profiles.customProfiles", arguments: { limit: 1 } }, props: { id: { name: "field.identifier" }, class: { name: "field.classes" }, attributes: { name: "field.attributes" } } }));
  expect(result.warnings).toEqual([]);
  const layout: BuilderLayout = { version: 1, key: "home", page: "home", updatedAt: "2026-09-05T00:00:00Z", sections: result.sections };
  const resolved = await materializeBuilderDynamicContent(layout, { resolveContexts: async () => [{ id: "one", fields: { "acf.identifier": { type: "string", value: "footer-return" }, "acf.classes": { type: "string", value: "uk-light" }, "acf.attributes": { type: "string", value: 'data-purpose="return"' } } }] });
  expect(resolved.renderLayout.sections[0].rows![0].columns[0].elements[0]).toMatchObject({ backToTopHtmlId: "footer-return", backToTopClasses: "uk-light", backToTopAttributes: 'data-purpose="return"' });
});
