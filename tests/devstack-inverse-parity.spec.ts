import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { normalizeBuilderShellSettings } from "@/lib/builderShell";
import { getUikitGlobalsCssVars } from "@/lib/uikitGlobals";
import { resolveYoothemeLess } from "@/lib/yoothemeLessImporter";

const source = readFileSync(
  resolve(process.cwd(), "tests/fixtures/yootheme-compatibility/sources/devstack-import.less"),
  "utf8",
);

test("DevStack inverse LESS tokens project to canonical UIkit variables", () => {
  const imported = resolveYoothemeLess([
    { name: "master-devstack/_import.less", content: source, precedence: 1 },
  ]);
  const vars = getUikitGlobalsCssVars(normalizeBuilderShellSettings(imported.shellSettings));

  expect(vars["--uk-inverse-global-color"]).toBe("color-mix(in srgb, #FFF 70%, transparent)");
  expect(vars["--uk-inverse-global-emphasis-color"]).toBe("#FFF");
  expect(vars["--uk-inverse-global-muted-color"]).toBe("rgba(255, 255, 255, 0.6)");
  expect(vars["--uk-inverse-global-border"]).toBe("rgba(255, 255, 255, 0.1)");
  expect(vars["--uk-inverse-global-inverse-color"]).toBe("#0D0A46");
  expect(imported.shellSettings.navbarDropdownIndicator).toBe("chevron");
  expect(imported.shellSettings.navbarNavItemLineMode).toBe("true");
  expect(imported.shellSettings.navbarNavItemLinePositionMode).toBe("top");
  expect(imported.shellSettings.navbarNavItemLineSlideMode).toBe("center");
  expect(normalizeBuilderShellSettings({
    globalStylePresetName: "DevStack Light Blue",
  }).navbarDropdownIndicator).toBe("chevron");
});

test("shared Header honors imported navbar hover lines and parent chevrons", () => {
  const css = readFileSync(resolve(process.cwd(), "app/styles/header.css"), "utf8");
  const nav = readFileSync(resolve(process.cwd(), "components/HeaderNav.tsx"), "utf8");
  const shell = readFileSync(resolve(process.cwd(), "components/HeaderShellView.tsx"), "utf8");

  expect(css).not.toContain("The shared navbar has no hover underline");
  expect(css).toContain("site-header--navbar-line-position-top");
  expect(css).toContain("site-header-nav-parent-icon");
  expect(css).toContain("rotateX(180deg)");
  expect(nav).toContain('name="chevron-down"');
  expect(shell).toContain("headerNavigationOverrides?.hoverLine");
  expect(shell).toContain("headerNavigationOverrides?.dropdownIndicator");
  expect(shell).toContain("headerNavigationOverrides?.hoverVariant");
  expect(shell).toContain("headerNavigationOverrides?.divider");
  expect(shell).toContain("BUILDER_IFRAME_DRAFT_SOURCE");
  expect(css).toContain("site-header--nav-hover-glow");
  expect(css).toContain("site-header--navbar-border-vertical-all");
});

test("YOOtheme sections do not overwrite canonical inverse Button tokens", () => {
  const css = readFileSync(resolve(process.cwd(), "app/styles/shop-builder.css"), "utf8");
  const frame = readFileSync(resolve(process.cwd(), "components/HeaderFrame.tsx"), "utf8");

  expect(css).not.toContain("--uk-button-inverse-default-text: currentColor");
  expect(css).not.toContain("--uk-button-inverse-default-shadow: none");
  expect(css).not.toMatch(/shop-builder-section--yootheme \.uk-button-default[^}]+color:\s*inherit/);
  expect(css).toContain("--context-text: var(--uk-inverse-global-color");
  expect(css).toContain("--context-muted: var(--uk-inverse-global-muted-color");
  expect(css).toContain(".shop-builder-main .uk-light");
  expect(css).toContain("--uk-button-default-render-background: var(--uk-button-default-background");
  expect(frame).toMatch(/textModeFromBackground\(headerSurface\) \?\?[\s\S]*textModeFromBackground\(header\)/);
});
