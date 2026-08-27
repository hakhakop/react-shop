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

  expect(shell).toContain('window.matchMedia(`(max-width: ${mobileBreakpoint})`)');
  expect(shell).toContain('row.headerVariant === activeHeaderVariant');
  expect(shell).toContain('documentSettings.mobileBehavior ?? "static"');
  expect(frame).toContain('data-header-active-variant={activeVariant}');
  expect(css).toContain('.site-header[data-header-active-variant="mobile"] .header-builder-columns');
  expect(css).toContain('.site-header-nav-container.is-canonical-mobile');
});
