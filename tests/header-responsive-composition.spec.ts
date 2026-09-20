import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { headerVariantForViewport, normalizeHeaderMobileBreakpoint } from "@/lib/headerResponsive";

test("YOOtheme breakpoint vocabulary controls the canonical Header variant", () => {
  expect(normalizeHeaderMobileBreakpoint("l")).toBe("1200px");
  expect(headerVariantForViewport(1201, "l", true)).toBe("desktop");
  expect(headerVariantForViewport(1200, "l", true)).toBe("mobile");
  expect(headerVariantForViewport(768, "1200px", true)).toBe("mobile");
  expect(headerVariantForViewport(390, "1200px", false)).toBe("desktop");
});

test("canonical responsive Header uses one renderer and leaves legacy Headers on their fallback path", () => {
  const shell = readFileSync("components/HeaderShellView.tsx", "utf8");
  const frame = readFileSync("components/HeaderFrame.tsx", "utf8");
  const css = readFileSync("app/styles/header.css", "utf8");
  const structure = readFileSync("components/dashboard/BuilderWireframePanel.tsx", "utf8");

  expect(shell).toContain('window.matchMedia(`(max-width: ${mobileBreakpoint})`)');
  expect(shell).toContain('if (previewHeaderVariant)');
  expect(shell).toContain('row.headerVariant === activeHeaderVariant');
  expect(shell).toContain('documentSettings.mobileBehavior ?? "static"');
  expect(frame).toContain('data-header-active-variant={activeVariant}');
  expect(css).toContain('.site-header--mobile-layout-horizontal-center .header-builder-columns');
  expect(css).toContain('.site-header-nav-container.is-canonical-mobile');
  expect(structure).toContain('"Desktop header"');
  expect(structure).toContain('"Mobile header"');
});

test("a separate Mobile Header keeps the selected Builder Row distribution", () => {
  const css = readFileSync("app/styles/header.css", "utf8");

  expect(css).toContain('.header-builder-columns {\n  display: flex;');
  expect(css).not.toContain(
    '.site-header[data-header-active-variant="mobile"] .header-builder-columns {\n  display: grid;',
  );
  expect(css).not.toContain(
    '.site-header[data-header-active-variant="mobile"] .header-builder-columns {\n  grid-template-columns: minmax(0, 1fr) auto;',
  );
});

test("the Mobile Menu Builder navigation stays visible inside its open drawer", () => {
  const css = readFileSync("app/styles/header.css", "utf8");
  const nav = readFileSync("components/HeaderNav.tsx", "utf8");

  expect(nav).toContain('site-header-nav site-header-nav--mobile-dialog');
  expect(css).toContain('.site-header-nav-container > .site-header-nav,');
  expect(css).not.toContain('  .site-header-nav,\n  .site-header-categories,');
  expect(css).toMatch(
    /\.site-header-nav-container\.is-canonical-mobile \{\n  \/\* The mobile drawer[\s\S]*?position: static;/,
  );
  expect(css).toMatch(
    /\.mobile-drawer-nav-items > \.site-header-nav--mobile-dialog \{[\s\S]*?flex-direction: column !important;[\s\S]*?width: 100% !important;/,
  );
  expect(css).toMatch(
    /\.site-header-nav--mobile-dialog > \.site-header-nav-item \{[\s\S]*?width: 100% !important;/,
  );
  expect(css).toMatch(
    /\.site-header-mobile-drawer-wrapper \{[\s\S]*?top: 100% !important;[\s\S]*?right: 0 !important;[\s\S]*?left: 0 !important;[\s\S]*?width: 100% !important;/,
  );
});
