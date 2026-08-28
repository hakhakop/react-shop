import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { resolveHeaderDocumentSettings } from "../lib/headerDocumentSettings.ts";
import { migrateLegacyHeaderDocument } from "../lib/headerDocumentMigration.ts";

const legacyShell = {
  headerVisible: true,
  headerTransparent: true,
  headerOverlay: true,
  headerHeight: "compact",
  headerCustomHeight: 64,
};

const persistedComposition = (overrides = {}) => ({
  documentVisible: false,
  documentTransparent: false,
  documentOverlay: false,
  documentHeight: "custom",
  documentCustomHeight: 92,
  ...overrides,
});

test("valid false values survive composition instead of falling back to shell true", () => {
  const resolved = resolveHeaderDocumentSettings(
    persistedComposition(),
    legacyShell,
  );
  assert.equal(resolved.visible, false);
  assert.equal(resolved.transparent, false);
  assert.equal(resolved.overlay, false);
});

test("height presets and custom height survive document serialization", () => {
  const preset = JSON.parse(JSON.stringify(
    persistedComposition({ documentHeight: "spacious" }),
  ));
  assert.equal(
    resolveHeaderDocumentSettings(preset, legacyShell).height,
    "spacious",
  );

  const custom = JSON.parse(JSON.stringify(persistedComposition()));
  const resolved = resolveHeaderDocumentSettings(custom, legacyShell);
  assert.equal(resolved.height, "custom");
  assert.equal(resolved.customHeight, 92);
});

test("transparency, pull-under, and height remain independent across sequential edits", () => {
  let document = persistedComposition({
    documentVisible: true,
    documentTransparent: false,
    documentOverlay: false,
    documentHeight: "comfortable",
    documentCustomHeight: 72,
  });
  document = { ...document, documentTransparent: true };
  document = { ...document, documentOverlay: true };
  document = { ...document, documentHeight: "custom", documentCustomHeight: 118 };
  document = { ...document, documentTransparent: false };

  assert.deepEqual(resolveHeaderDocumentSettings(document, legacyShell), {
    visible: true,
    transparent: false,
    overlay: true,
    height: "custom",
    customHeight: 118,
    layout: "wordpress",
    behavior: "sticky",
    widthMode: "boxed",
    backgroundMode: "default",
    textMode: "auto",
    breakpoint: undefined,
    mobileBreakpoint: undefined,
    stickyShowOnUp: true,
    stickyAnimation: "slide-top",
    dropdownAlign: undefined,
    dropdownAlignToNavbar: false,
    dropbarEnabled: false,
    parentIconEnabled: false,
    clickModeEnabled: false,
    dialogTogglePosition: undefined,
    dialogLayout: undefined,
    dialogCenter: false,
    dialogPushAfter: undefined,
    searchPosition: undefined,
    searchLayout: undefined,
    socialPosition: undefined,
    mobileLogoUrl: undefined,
    inverseLogoUrl: undefined,
    mobileComposition: undefined,
    zIndex: 40,
    topToolbarVisible: true,
    topToolbarText: "",
    topToolbarPhone: "",
    topToolbarMeta: "",
  });
});

test("late shell hydration cannot overwrite authoritative document values", () => {
  const document = persistedComposition();
  const before = resolveHeaderDocumentSettings(document, legacyShell);
  const after = resolveHeaderDocumentSettings(document, {
    ...legacyShell,
    headerVisible: true,
    headerTransparent: true,
    headerOverlay: true,
    headerHeight: "showcase",
    headerCustomHeight: 240,
  });
  assert.deepEqual(after, before);
});

test("legacy Header documents still use shell values only when document fields are absent", () => {
  assert.deepEqual(resolveHeaderDocumentSettings({}, legacyShell), {
    visible: true,
    transparent: true,
    overlay: true,
    height: "compact",
    customHeight: 64,
    layout: "wordpress",
    behavior: "sticky",
    widthMode: "boxed",
    backgroundMode: "default",
    textMode: "auto",
    breakpoint: undefined,
    mobileBreakpoint: undefined,
    stickyShowOnUp: true,
    stickyAnimation: "slide-top",
    dropdownAlign: undefined,
    dropdownAlignToNavbar: false,
    dropbarEnabled: false,
    parentIconEnabled: false,
    clickModeEnabled: false,
    dialogTogglePosition: undefined,
    dialogLayout: undefined,
    dialogCenter: false,
    dialogPushAfter: undefined,
    searchPosition: undefined,
    searchLayout: undefined,
    socialPosition: undefined,
    mobileLogoUrl: undefined,
    inverseLogoUrl: undefined,
    mobileComposition: undefined,
    zIndex: 40,
    topToolbarVisible: true,
    topToolbarText: "",
    topToolbarPhone: "",
    topToolbarMeta: "",
  });
});

test("legacy shell settings seed a Header document once and never overwrite version 2", () => {
  const layout = {
    version: 1,
    key: "header",
    page: "header",
    sections: [{
      id: "header-document",
      kind: "contentLayout",
      title: "Header",
      background: "transparent",
      headerTransparent: false,
      layoutItems: [],
    }],
  };
  const migrated = migrateLegacyHeaderDocument(layout, {
    ...legacyShell,
    headerLayout: "hero",
    headerBehavior: "sticky-on-scroll-up",
    headerWidthMode: "full",
    headerBackgroundMode: "glass",
    headerTextMode: "light",
    headerZIndex: 72,
    topToolbarVisible: false,
    topToolbarText: "Legacy",
    topToolbarPhone: "",
    topToolbarMeta: "",
    headerBrandMode: "brand",
    headerBrandText: "Test",
    headerLogoUrl: null,
    headerLogoAlt: "Test",
    headerLogoMaxWidth: 160,
    headerButtonLabel: "Start",
    headerButtonUrl: "/",
    headerIconVariant: "muted",
    headerIconOrder: ["search"],
    headerActiveIndicator: "underline",
  });
  assert.equal(migrated.sections[0].headerArchitectureVersion, 2);
  assert.equal(migrated.sections[0].headerLayout, "hero");
  assert.equal(migrated.sections[0].headerTransparent, false);

  const unchanged = migrateLegacyHeaderDocument(migrated, {
    ...legacyShell,
    headerLayout: "pill",
    headerBehavior: "static",
    headerWidthMode: "boxed",
  });
  assert.equal(unchanged.sections[0].headerLayout, "hero");
  assert.equal(unchanged.sections[0].headerTransparent, false);
});

test("Builder Preview and frontend use the shared Header document resolver", () => {
  const builder = readFileSync(
    new URL("../components/dashboard/DashboardBuilder.tsx", import.meta.url),
    "utf8",
  );
  const headerView = readFileSync(
    new URL("../components/HeaderShellView.tsx", import.meta.url),
    "utf8",
  );
  const frontend = readFileSync(
    new URL("../components/website/WebsiteFrontend.tsx", import.meta.url),
    "utf8",
  );
  const composition = readFileSync(
    new URL("../lib/headerBuilderComposition.ts", import.meta.url),
    "utf8",
  );
  const inspector = readFileSync(
    new URL("../components/dashboard/DashboardInspector.tsx", import.meta.url),
    "utf8",
  );
  const frame = readFileSync(
    new URL("../components/HeaderFrame.tsx", import.meta.url),
    "utf8",
  );
  const headerShell = readFileSync(
    new URL("../components/HeaderShell.tsx", import.meta.url),
    "utf8",
  );
  const rootLayout = readFileSync(
    new URL("../app/layout.tsx", import.meta.url),
    "utf8",
  );
  const dashboardPage = readFileSync(
    new URL("../app/dashboard/page.tsx", import.meta.url),
    "utf8",
  );
  const selectionBridge = readFileSync(
    new URL("../components/builder/BuilderIframeSelectionBridge.tsx", import.meta.url),
    "utf8",
  );
  const dashboardBuilder = readFileSync(
    new URL("../components/dashboard/DashboardBuilder.tsx", import.meta.url),
    "utf8",
  );
  const headerCss = readFileSync(
    new URL("../app/styles/header.css", import.meta.url),
    "utf8",
  );
  const dashboardCss = readFileSync(
    new URL("../app/styles/dashboard.css", import.meta.url),
    "utf8",
  );
  assert.match(builder, /resolveHeaderDocumentSettings\(currentHeaderComposition/);
  assert.match(headerView, /resolveHeaderDocumentSettings\(/);
  assert.match(headerView, /builderPreviewMode\?: boolean/);
  assert.match(frame, /builderPreviewMode = false/);
  assert.match(frame, /data-builder-object-type=\{builderPreviewMode \? "section"/);
  assert.match(frame, /data-builder-section-id=\{builderPreviewMode \? "header-document"/);
  assert.match(selectionBridge, /builderContext/);
  assert.match(selectionBridge, /event\.stopPropagation\(\)/);
  assert.match(dashboardBuilder, /params\.set\("builderContext", builderState\.page\)/);
  assert.doesNotMatch(dashboardBuilder, /useState<InspectorMode>\(\s*readInspectorModePreference/);
  assert.match(dashboardBuilder, /setInspectorMode\(readInspectorModePreference\(\)\)/);
  assert.match(dashboardBuilder, /setSidebarCollapsed\(\s*loadSidebarCollapsedPreference/);
  assert.match(
    headerCss,
    /\.site-header-mobile-drawer-backdrop,\s*\.site-header-mobile-drawer-wrapper\s*\{\s*pointer-events:\s*none;\s*visibility:\s*hidden;/s,
  );
  assert.doesNotMatch(frame, /querySelector\("\.builder-dashboard"\)/);
  assert.doesNotMatch(frame, /URLSearchParams\(window\.location\.search\)/);
  assert.match(frontend, /getPublishedHeaderDocumentSettings\(/);
  assert.doesNotMatch(headerShell, /getThemeSettings\(/);
  assert.match(headerShell, /canonical Builder shell\/document/);
  assert.match(rootLayout, /styleWebsite \|\| isDashboardWorkspaceRequest/);
  assert.match(dashboardPage, /initialPage === "header" \|\| initialPage === "footer"/);
  assert.doesNotMatch(builder, /syncHeaderBlockPatch/);
  assert.doesNotMatch(builder, /syncHeaderDocumentToShell/);
  assert.match(
    builder,
    /onClickCapture=\{\(event\) => \{[\s\S]{0,900}selectLayoutBlock\("header-document", columnId, element\.id, true\)/,
  );
  assert.match(
    builder,
    /onMouseDown=\{\(event\) => \{[\s\S]{0,700}selectLayoutBlock\("header-document", columnId, element\.id, true\)/,
  );
  assert.match(
    selectionBridge,
    /if \(header && !headerInteractive\) \{[\s\S]{0,500}if \(editingShell\) \{[\s\S]{0,300}targetFromClick\(event\)/,
  );
  assert.match(
    builder,
    /if \(shell && builderState\.page !== shell\) \{[\s\S]{0,220}pendingIframeShellTargetRef\.current/,
  );
  assert.match(
    selectionBridge,
    /const hasGeometry = rect\.width > 0 && rect\.height > 0;[\s\S]{0,180}const inRowGutter = hasGeometry/,
  );
  assert.match(composition, /documentTransparent: section\?\.headerTransparent/);
  assert.match(composition, /documentOverlay: section\?\.headerOverlay/);
  assert.match(inspector, /onHeaderDocumentChange=\{updateSelected\}/);
  assert.doesNotMatch(inspector, /onHeaderDocumentChange[\s\S]{0,180}updateShellSettings/);
  assert.doesNotMatch(frame, /overlapHeader \? "site-header--no-background"/);
  assert.doesNotMatch(
    headerCss,
    /\.site-header--builder-overlay:not\(\[data-scrolled="true"\]\)[^{]*\{[^}]*background:\s*transparent/s,
  );
  assert.match(
    headerCss,
    /\.site-header\[data-header-behavior="sticky"\]\[data-scrolled="true"\][^{]*\{[^}]*padding-top:\s*0\s*!important;[^}]*padding-bottom:\s*0\s*!important;/s,
  );
  assert.match(
    dashboardCss,
    /:has\(\.site-header--builder-overlay\)\s+\.builder-preview-header-slot\s*\{[^}]*height:\s*0\s*!important/s,
  );
  assert.doesNotMatch(
    dashboardCss,
    /\.builder-header-document-preview\s+\.site-header\.site-header--builder-overlay\s*\{[^}]*position:\s*relative\s*!important/s,
  );
  assert.match(
    dashboardCss,
    /\.builder-header-document-preview\.is-header-overlay\.is-selected\s+\.site-header::before\s*\{[^}]*top:\s*var\(--header-document-padding-top[^}]*bottom:\s*var\(--header-document-padding-bottom[^}]*border:\s*2px solid/s,
  );
  assert.doesNotMatch(
    dashboardCss,
    /:has\(\.site-header--no-background[^}]*\.builder-header-document-preview(?:\.is-selected|:hover)?\s*\{[^}]*outline:/s,
  );
  assert.doesNotMatch(
    builder,
    /header\.offsetTop \+ header\.offsetHeight - pageContext\.offsetTop \+ 8/,
  );
  assert.match(builder, /builder-context-preview-status-sticky-wrapper/);
  assert.match(
    dashboardCss,
    /\.builder-context-preview-status-sticky-wrapper[\s\S]{0,500}position:\s*relative\s*!important/,
  );
  assert.match(headerView, /overlapHeader=\{documentSettings\.overlay\}/);
});
