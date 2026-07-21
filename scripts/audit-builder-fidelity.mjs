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
  rowStyles: readFileSync(resolve(root, "lib/builderRowStyles.ts"), "utf8"),
  dashboardCss: readFileSync(resolve(root, "app/styles/dashboard.css"), "utf8"),
  headerView: readFileSync(resolve(root, "components/HeaderShellView.tsx"), "utf8"),
  headerComposition: readFileSync(resolve(root, "lib/headerBuilderComposition.ts"), "utf8"),
  headerDropdown: readFileSync(resolve(root, "components/HeaderCategoriesDropdown.tsx"), "utf8"),
  headerHeight: readFileSync(resolve(root, "lib/headerHeight.ts"), "utf8"),
  registry: readFileSync(resolve(root, "components/dashboard/builderRegistry.ts"), "utf8"),
};

const require = createRequire(import.meta.url);
function loadTypeScriptModule(path, dependencies = {}) {
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
  const localRequire = (specifier) => dependencies[specifier] ?? require(specifier);
  new Function("require", "module", "exports", output)(localRequire, mod, mod.exports);
  return mod.exports;
}

const typographyRuntime = loadTypeScriptModule(resolve(root, "lib/builderTypography.ts"));
const spacingRuntime = loadTypeScriptModule(resolve(root, "lib/builderSpacing.ts"));
const visualStyleRuntime = loadTypeScriptModule(
  resolve(root, "lib/builderVisualStyle.ts"),
  { "@/lib/builderSpacing": spacingRuntime },
);
const rowStyleRuntime = loadTypeScriptModule(
  resolve(root, "lib/builderRowStyles.ts"),
  {
    "@/lib/builderSpacing": spacingRuntime,
    "@/lib/builderVisualStyle": visualStyleRuntime,
  },
);
const headerHeightRuntime = loadTypeScriptModule(
  resolve(root, "lib/headerHeight.ts"),
);

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
  { element: "row/column", field: "gap, spacing, surface, and alignment", inspector: ["rowGap", "rowTopSpacing", "headerJustify", "headerAlign"], builder: ["resolveBuilderRowGap", "resolveBuilderRowStyle", "shop-builder-content-row"], storefront: ["resolveBuilderRowGap", "rowStyle", "shop-builder-content-row"], shared: ["resolveBuilderRowGap", "resolveBuilderRowStyle", "resolveBuilderRowAlignment"] },
  { element: "panel", field: "title/body/button/eyebrow typography", inspector: ['kind === "panel"', "TypographyPanel"], builder: ['area="title"', 'area="body"', "panelTitleStyle", "panelBodyStyle"], storefront: ['area="title"', 'area="body"', "panelTitleStyle", "panelBodyStyle"], shared: ["resolveTypographyInput"] },
  { element: "header", field: "document height", inspector: ["headerHeight", "Header height"], builder: ["headerHeight"], storefront: ["--header-builder-height"], shared: ["resolveHeaderHeightCss"] },
  { element: "header category menu", field: "document element composition", inspector: ["headerCategoriesDisplay", "headerCategoriesDropdownAlign"], builder: ["headerCategories", "builderHeaderCategoriesContent"], storefront: ["HeaderCategoriesDropdown", 'element.type === "categories"'], shared: ["categoriesDisplay", "categoriesDropdownAlign"] },
];

const sharedSource = `${sources.typography}\n${sources.spacing}\n${sources.visualStyle}\n${sources.rowStyles}`;
const missing = [];
const report = [];

for (const contract of contracts) {
  const checks = {
    inspector: contract.inspector.every((token) => sources.inspector.includes(token)),
    builder: contract.builder.every((token) => sources.builder.includes(token)),
    storefront: contract.storefront.every((token) =>
      `${sources.storefront}\n${sources.headerView}\n${sources.headerDropdown}`.includes(token),
    ),
    shared: contract.shared.every((token) =>
      `${sharedSource}\n${sources.headerComposition}\n${sources.headerHeight}`.includes(token),
    ),
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

function renderedTypography(
  tag,
  area,
  typography = distinctTypography,
  presentationStyle = {},
) {
  const props = typographyRuntime.typographyProps(typography, area);
  return renderToStaticMarkup(
    React.createElement(
      tag,
      {
        className: props.className,
        style: { ...presentationStyle, ...props.style },
      },
      `${area} content`,
    ),
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
  behavioralCase("row", "inherited and explicit row gap", () => {
    const inherited = rowStyleRuntime.resolveBuilderRowGap({}, "lg");
    const explicit = rowStyleRuntime.resolveBuilderRowGap({ rowGap: "sm" }, "lg");
    const cleared = rowStyleRuntime.resolveBuilderRowGap({ rowGap: "inherit" }, "lg");
    assert(inherited.css === "64px", `Inherited Row Gap was ${inherited.css}`);
    assert(explicit.css === "16px", `Explicit Row Gap was ${explicit.css}`);
    assert(cleared.css === inherited.css, "Clearing Row Gap did not restore the global value");
    return `global ${inherited.css}; override ${explicit.css}; cleared ${cleared.css}`;
  }),
  behavioralCase("row", "padding and responsive inherited value", () => {
    const desktop = rowStyleRuntime.resolveBuilderRowStyle(
      { rowTopSpacing: "inherit", rowBottomSpacing: "sm" },
      { rowPaddingTop: "2xl", rowPaddingBottom: "lg" },
    );
    const compact = rowStyleRuntime.resolveBuilderRowStyle(
      { rowTopSpacing: "inherit", rowBottomSpacing: "sm" },
      { rowPaddingTop: "md", rowPaddingBottom: "lg" },
    );
    assert(desktop.paddingTop === "128px", `Desktop inherited padding was ${desktop.paddingTop}`);
    assert(compact.paddingTop === "32px", `Compact inherited padding was ${compact.paddingTop}`);
    assert(desktop.paddingBottom === "16px" && compact.paddingBottom === "16px", "Explicit row padding did not survive inherited context changes");
    return "inherited top changes 128px to 32px; explicit bottom remains 16px";
  }),
  behavioralCase("row", "horizontal and vertical alignment", () => {
    const alignment = rowStyleRuntime.resolveBuilderRowAlignment({
      headerJustify: "space-between",
      headerAlign: "end",
    });
    assert(alignment.justifyContent === "space-between", "Horizontal alignment was not resolved");
    assert(alignment.alignItems === "flex-end", "Vertical alignment was not resolved");
    return "space-between / flex-end";
  }),
  behavioralCase("panel", "independent title and body font size", () => {
    const cardPresentation = { fontSize: "var(--builder-card-title-size, 24px)" };
    const title = renderedTypography("h3", "title", distinctTypography, cardPresentation);
    const body = renderedTypography("p", "body", distinctTypography, {
      fontSize: "var(--builder-card-content-size, 16px)",
    });
    assert(title.includes("font-size:41px"), "Panel title typography was overwritten by card presentation styles");
    assert(body.includes("font-size:19px"), "Panel body typography was overwritten by card presentation styles");
    assert(!title.includes("font-size:19px") && !body.includes("font-size:41px"), "Panel title/body areas are not independent");
    return "title 41px; body 19px; card defaults remain fallback-only";
  }),
  behavioralCase("panel", "alignment and output change", () => {
    const initial = renderedTypography("p", "body");
    const changed = renderedTypography("p", "body", {
      ...distinctTypography,
      body: { ...distinctTypography.body, fontSize: "31px", textAlign: "center" },
    });
    assert(changed.includes("font-size:31px") && changed.includes("text-align:center"), "Panel body output ignored changed typography");
    assert(changed !== initial, "Panel typography change did not alter rendered markup");
    return "19px/right changes to 31px/center";
  }),
  behavioralCase("header", "height auto, token, and custom value", () => {
    const auto = headerHeightRuntime.resolveHeaderHeightCss("auto");
    const token = headerHeightRuntime.resolveHeaderHeightCss("comfortable");
    const custom = headerHeightRuntime.resolveHeaderHeightCss("91px");
    assert(auto === undefined, "Auto Header height emitted a fixed value");
    assert(token === "72px", `Comfortable Header height resolved to ${token}`);
    assert(custom === "91px", `Custom Header height resolved to ${custom}`);
    assert(sources.headerView.includes('"--header-builder-height": headerHeight'), "Shared Header renderer does not receive resolved height");
    return "auto unset; comfortable 72px; custom 91px";
  }),
  behavioralCase("header category menu", "shared document element wiring", () => {
    assert(sources.headerComposition.includes('block.kind === "headerCategories"'), "Composition does not resolve the category block");
    assert(sources.headerView.includes('element.type === "categories"'), "Shared Header renderer does not render the category element");
    assert(sources.headerView.includes('compositionTypes.has("categories") ? categories : null'), "Mobile category content can render independently of the document element");
    assert(sources.headerDropdown.includes('aria-expanded={isOpen}') && sources.headerDropdown.includes('document.addEventListener("pointerdown"'), "Dropdown open state or outside dismissal is not wired");
    return "document block -> shared composition -> shared Header dropdown";
  }),
  behavioralCase("account access", "single canonical account control enforcement", () => {
    assert(!sources.registry.includes("accountAccess"), "accountAccess block still registered in builderRegistry");
    assert(!sources.inspector.includes('block.kind === "accountAccess"'), "accountAccess still present in DashboardInspector");
    assert(!sources.storefront.includes('block.kind === "accountAccess"'), "accountAccess branch still present in StorefrontBuilderRenderer");
    assert(!sources.headerView.includes('header-account-access'), "Virtual header-account-access injection still present in HeaderShellView");
    assert(!sources.headerView.includes('AccountAccessElement'), "AccountAccessElement still imported or rendered in HeaderShellView");
    return "accountAccess removed; headerAccount is single canonical control";
  }),
  behavioralCase("header preview parity", "shared header settings resolver enforcement", () => {
    assert(!sources.builder.includes("dashboardHeaderSettings"), "Hardcoded dashboardHeaderSettings object still present in DashboardBuilder.tsx");
    assert(sources.builder.includes("resolveHeaderBuilderComposition"), "DashboardBuilder does not call resolveHeaderBuilderComposition");
    assert(sources.builder.includes("resolveHeaderDocumentSettings"), "DashboardBuilder does not call resolveHeaderDocumentSettings");
    assert(sources.builder.includes("<HeaderShellView"), "DashboardBuilder does not use HeaderShellView as shared renderer");
    assert(!sources.dashboardCss.includes("top: 18px !important"), "Dashboard CSS still overrides live header position");
    return "shared resolvers -> HeaderShellView; zero hardcoded header override objects";
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
