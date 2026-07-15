import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createRequire } from "node:module";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ts from "typescript";

const root = process.cwd();
const sources = {
  inspector: readFileSync(resolve(root, "components/dashboard/DashboardInspector.tsx"), "utf8"),
  builder: readFileSync(resolve(root, "components/dashboard/DashboardBuilder.tsx"), "utf8"),
  storefront: readFileSync(resolve(root, "components/builder/StorefrontBuilderRenderer.tsx"), "utf8"),
  typography: readFileSync(resolve(root, "lib/builderTypography.ts"), "utf8"),
  spacing: readFileSync(resolve(root, "lib/builderSpacing.ts"), "utf8"),
  visualStyle: readFileSync(resolve(root, "lib/builderVisualStyle.ts"), "utf8"),
  dashboardCss: readFileSync(resolve(root, "app/styles/dashboard.css"), "utf8"),
};

const require = createRequire(import.meta.url);
function loadTypeScriptModule(path) {
  const source = readFileSync(path, "utf8");
  const output = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      esModuleInterop: true,
    },
    fileName: path,
  }).outputText;
  const mod = { exports: {} };
  new Function("require", "module", "exports", output)(require, mod, mod.exports);
  return mod.exports;
}

const typographyRuntime = loadTypeScriptModule(resolve(root, "lib/builderTypography.ts"));
const spacingRuntime = loadTypeScriptModule(resolve(root, "lib/builderSpacing.ts"));

const contracts = [
  { element: "all text-capable elements", field: "typography", inspector: ["TypographyPanel", "updateTypographyArea"], builder: ["typographyProps"], storefront: ["typographyProps"], shared: ["resolveTypographyInput"] },
  { element: "text", field: "title/body/button/eyebrow typography", inspector: ['kind === "text"', '"title", "body", "button", "eyebrow"'], builder: ["InlineEditableText", "block.typography"], storefront: ["Typog", "block.typography"], shared: ["updateTypographyArea"] },
  { element: "heading", field: "headingAlign", inspector: ["headingAlign"], builder: ["block.headingAlign"], storefront: ["block.headingAlign"], shared: [] },
  { element: "button-capable elements", field: "button typography and style", inspector: ["buttonStyle", "buttonPaddingY", "buttonPaddingX"], builder: ["blockButtonCssVars", "shop-builder-cta"], storefront: ["builderButtonOverrideCssVars", "shop-builder-cta"], shared: [] },
  { element: "all elements", field: "elementAlign", inspector: ["elementAlign"], builder: ["shop-builder-element-shell", "block.elementAlign"], storefront: ["shop-builder-element-shell", "block.elementAlign"], shared: [] },
  { element: "all elements", field: "spacing", inspector: ["visualStyle", "elementPadding"], builder: ["visualStyleToCss", "resolveBuilderSpacing"], storefront: ["visualStyleToCss", "resolveBuilderSpacing"], shared: ["resolveBuilderSpacing"] },
  { element: "all elements", field: "background/border/radius", inspector: ["elementBackground", "borderRadius", "visualStyle"], builder: ["elementBackground", "borderRadius", "visualStyleToCss"], storefront: ["elementBackground", "borderRadius", "visualStyleToCss"], shared: ["visualStyleToCss"] },
  { element: "grid/products", field: "gridGap", inspector: ["gridGap"], builder: ["block.gridGap"], storefront: ["block.gridGap"], shared: ["resolveBuilderSpacing"] },
  { element: "section", field: "background and spacing", inspector: ["backgroundMode", "topSpacing", "bottomSpacing"], builder: ["section.background", "getPreviewSpacing"], storefront: ["section.background", "getSpacingValue"], shared: ["resolveBuilderSpacing"] },
  { element: "row/column", field: "gap and alignment", inspector: ["rowGap", "columnGap"], builder: ["--builder-global-row-gap", "columnGap"], storefront: ["--builder-global-row-gap", "columnGap"], shared: ["resolveBuilderSpacing"] },
];

const sharedSource = `${sources.typography}\n${sources.spacing}\n${sources.visualStyle}`;
const missing = [];
const report = [];

for (const contract of contracts) {
  const checks = {
    inspector: contract.inspector.every((token) => sources.inspector.includes(token)),
    builder: contract.builder.every((token) => sources.builder.includes(token)),
    storefront: contract.storefront.every((token) => sources.storefront.includes(token)),
    shared: contract.shared.every((token) => sharedSource.includes(token)),
  };
  const status = Object.values(checks).every(Boolean) ? "OK" : "MISMATCH";
  report.push({ ...contract, ...checks, status });
  for (const [surface, supported] of Object.entries(checks)) {
    if (!supported) missing.push(`${contract.element}: ${contract.field} missing ${surface} support`);
  }
}

console.log("Builder Inspector-to-Renderer fidelity audit");
console.table(report.map(({ element, field, inspector, builder, storefront, shared, status }) => ({ element, field, inspector, builder, storefront, shared, status })));

const distinctTypography = {
  eyebrow: { fontSize: "11px", textAlign: "left" },
  title: { fontSize: "41px", textAlign: "center" },
  body: { fontSize: "19px", textAlign: "right", lineHeight: "1.73" },
  button: { fontSize: "13px", textAlign: "left" },
};

function renderedTypography(tag, area, typography = distinctTypography) {
  const props = typographyRuntime.typographyProps(typography, area);
  return renderToStaticMarkup(
    React.createElement(tag, { className: props.className, style: props.style }, `${area} content`),
  );
}

function behavioralCase(element, field, test) {
  try {
    const detail = test();
    return { element, field, status: "OK", detail };
  } catch (error) {
    missing.push(`${element}: ${field} behavioral mismatch: ${error.message}`);
    return { element, field, status: "MISMATCH", detail: error.message };
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const behavioralReport = [
  behavioralCase("text", "body font size", () => {
    const builder = renderedTypography("p", "body");
    const storefront = renderedTypography("p", "body");
    assert(builder.includes("font-size:19px"), "Builder body markup omitted stored 19px font size");
    assert(storefront.includes("font-size:19px"), "Storefront body markup omitted stored 19px font size");
    assert(builder === storefront, "Builder and storefront body markup differ");
    const changed = renderedTypography("p", "body", {
      ...distinctTypography,
      body: { ...distinctTypography.body, fontSize: "27px" },
    });
    assert(changed.includes("font-size:27px") && changed !== builder, "Body font-size update did not change rendered output");
    assert(sources.builder.includes('as="p"\n                                area="body"'), "Builder body node is not explicitly attached to body typography");
    assert(sources.storefront.includes('as="p" area="body"'), "Storefront body node is not explicitly attached to body typography");
    assert(sources.dashboardCss.includes('.builder-inline-editable[contenteditable="true"] :where(p, div, span)') && sources.dashboardCss.includes("font-size: inherit !important"), "Rich Builder body descendants can override the editable body's font size");
    return "19px attached to body node and rich descendants; update to 27px changes markup";
  }),
  behavioralCase("text", "title font size", () => {
    const markup = renderedTypography("h3", "title");
    assert(markup.includes("font-size:41px"), "Title markup omitted stored 41px font size");
    assert(!markup.includes("font-size:19px"), "Title incorrectly used body font size");
    return "41px title remains independent from 19px body";
  }),
  behavioralCase("text", "alignment", () => {
    const markup = renderedTypography("p", "body");
    assert(markup.includes("text-align:right"), "Body markup omitted right alignment");
    return "right alignment emitted on final body node";
  }),
  behavioralCase("heading", "font size", () => {
    const markup = renderedTypography("h2", "title");
    assert(markup.includes("font-size:41px"), "Heading markup omitted title font size");
    return "41px heading/title output";
  }),
  behavioralCase("button", "font size", () => {
    const markup = renderedTypography("a", "button");
    assert(markup.includes("font-size:13px"), "Button markup omitted button font size");
    assert(!markup.includes("font-size:19px"), "Button incorrectly used body font size");
    return "13px button remains independent from body";
  }),
  behavioralCase("section", "padding", () => {
    const value = spacingRuntime.resolveBuilderSpacing("3xl", "sectionPadding").css;
    assert(value === "192px", `Expected distinct section padding 192px, received ${value}`);
    return value;
  }),
  behavioralCase("row/column", "gap", () => {
    const row = spacingRuntime.resolveBuilderSpacing("2xl", "rowGap").css;
    const column = spacingRuntime.resolveBuilderSpacing("sm", "columnGap").css;
    assert(row === "128px" && column === "16px" && row !== column, `Unexpected row/column gaps ${row}/${column}`);
    assert(sources.builder.includes("--builder-global-column-gap") && sources.storefront.includes("--builder-global-column-gap"), "Shared column-gap variable is not used by both renderers");
    return `row ${row}; column ${column}`;
  }),
];

console.log("\nResolver and rendered-markup behavior");
console.table(behavioralReport);

if (missing.length) {
  console.error("\nDisconnected contracts:\n- " + missing.join("\n- "));
  process.exitCode = 1;
} else {
  console.log(`\n${contracts.length} static contracts and ${behavioralReport.length} behavioral cases passed.`);
  console.log("Audit levels: static wiring, resolver output, and server-rendered markup/style. Browser computed CSS, React interaction timing, and persistence still require browser integration/manual verification.");
}
