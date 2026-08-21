import { expect, test } from "@playwright/test";
import { resolveYoothemeLess } from "@/lib/yoothemeLessImporter";
import {
  createYoothemePageImportReport,
  formatYoothemeImportWarnings,
  groupYoothemeImportReportEntries,
} from "@/lib/yoothemeImportReport";
import { mapYoothemeStaticContent } from "@/lib/yoothemePageImport";
import enterprise8 from "@/tests/fixtures/yootheme-compatibility/sources/enterprise8.json";

const pageFixture = {
  type: "layout",
  children: [{ type: "section", children: [{ type: "row", children: [{ type: "column", children: [
    { type: "panel-slider", props: { slider_divider: true, image_align: "left", link_image: true, unregistered_source_field: "present" } },
    { type: "panel-slider", props: { slider_divider: true } },
  ] }] }] }],
};

test("Phase 12 page reports are registry-backed, grouped, and leave legacy import mapping unchanged", () => {
  const mapped = mapYoothemeStaticContent(pageFixture);
  const report = mapped.report;

  const supported = report.entries.find((entry) => entry.capabilityKey === "panel-slider.slider_divider");
  expect(supported).toMatchObject({
    status: "SUPPORTED",
    occurrenceCount: 2,
    canonicalOwner: "carouselSettings.divider",
    persistedDestination: "BuilderLayoutBlock.carouselSettings.divider",
    inspectorLocation: "Panel Slider › Settings › Slider",
    runtimeConsumer: "UikitSlider → CarouselBlock",
  });
  expect(report.entries.find((entry) => entry.capabilityKey === "panel-slider.image_align")).toMatchObject({ status: "DEFERRED" });
  expect(report.entries.find((entry) => entry.capabilityKey === "panel-slider.link_image")).toMatchObject({ status: "INTENTIONALLY_UNSUPPORTED" });
  expect(report.entries.find((entry) => entry.capabilityKey === "panel-slider.unregistered_source_field")).toMatchObject({ status: "UNHANDLED" });
  expect(report.byStatus.SUPPORTED).toContainEqual(expect.objectContaining({ capabilityKey: "panel-slider.slider_divider" }));
  expect(report.byCapabilityFamily["Panel Slider layout"]).toContainEqual(expect.objectContaining({ capabilityKey: "panel-slider.slider_divider" }));

  const firstBlock =
    mapped.sections[0]?.rows?.[0]?.columns?.[0]?.elements?.[0] ??
    mapped.sections[0]?.layoutItems?.[0]?.blocks?.[0];
  expect(firstBlock).toMatchObject({ kind: "panelSlider", carouselSettings: { divider: true } });
  const warnings = formatYoothemeImportWarnings(report).join("\n");
  expect(warnings).toContain("DEFERRED: panel-slider.image_align");
  expect(warnings).toContain("INTENTIONALLY_UNSUPPORTED: panel-slider.link_image");
  expect(warnings).toContain("UNHANDLED: panel-slider.unregistered_source_field");
  expect(warnings).not.toContain("slider_divider");
});

test("Phase 12 LESS reporting uses the same registry vocabulary and exposes blocked resolution", () => {
  const mapped = resolveYoothemeLess([{ name: "style.less", precedence: 1, content: "@breakpoint-small: 700px; @global-primary-background: #7141F1; @form-input-background: #fff;" }]);
  expect(mapped.report.entries.find((entry) => entry.capabilityKey === "global-styles.breakpoint-small")).toMatchObject({
    status: "SUPPORTED",
    canonicalOwner: "shellSettings.breakpointSmall",
    inspectorLocation: "Global Styles › Global › Breakpoints › Small",
  });
  expect(mapped.report.entries.find((entry) => entry.capabilityKey === "global-styles.form-input-background")).toMatchObject({ status: "UNHANDLED" });

  const blocked = resolveYoothemeLess([{ name: "style.less", precedence: 1, content: "@breakpoint-small: @missing;" }]);
  expect(blocked.report.entries.find((entry) => entry.capabilityKey === "global-styles.breakpoint-small")).toMatchObject({ status: "BLOCKED" });
});

test("LESS imports inherit Woolberry's global radius for buttons", () => {
  const mapped = resolveYoothemeLess([{
    name: "master-woolberry/_import.less",
    precedence: 1,
    content: "@global-border-radius: 2px; @global-primary-background: #DE3155;",
  }]);
  expect(mapped.shellSettings).toMatchObject({
    borderRadius: "2px",
    buttonRadius: "2px",
    buttonSmallRadius: "2px",
    buttonLargeRadius: "2px",
  });
});

test("Phase 12 report grouping never combines different capability semantics", () => {
  const report = createYoothemePageImportReport(pageFixture);
  const regrouped = groupYoothemeImportReportEntries([...report.entries, ...report.entries]);
  expect(regrouped.entries.find((entry) => entry.capabilityKey === "panel-slider.slider_divider")?.occurrenceCount).toBe(4);
  expect(regrouped.entries.find((entry) => entry.capabilityKey === "panel-slider.image_align")?.occurrenceCount).toBe(2);
});

test("Enterprise8 has a registry-backed disposition for every encountered source field", () => {
  const report = createYoothemePageImportReport(enterprise8);
  expect(Object.fromEntries(Object.entries(report.byStatus).map(([status, entries]) => [status, entries.length]))).toEqual({
    SUPPORTED: 356,
    DEFERRED: 75,
    INTENTIONALLY_UNSUPPORTED: 3,
    UNHANDLED: 0,
    BLOCKED: 0,
  });
  expect(report.byStatus.UNHANDLED).toEqual([]);
  expect(report.entries.find((entry) => entry.capabilityKey === "panel.title_hover_style")).toMatchObject({ status: "DEFERRED" });
  expect(report.entries.find((entry) => entry.capabilityKey === "button_item.dialog_layout")).toMatchObject({ status: "INTENTIONALLY_UNSUPPORTED" });
  expect(report.entries.find((entry) => entry.capabilityKey === "image.animation.parallax")).toMatchObject({
    status: "SUPPORTED",
  });
});
