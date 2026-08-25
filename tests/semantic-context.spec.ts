import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import path from "node:path";
import { getUikitSemanticContextVars } from "@/lib/uikitSemanticContext";
import { getUikitButtonLocalOverride } from "@/lib/uikitTokens";
import { getUikitGlobalsCssVars } from "@/lib/uikitGlobals";
import { resolveYoothemeLess } from "@/lib/yoothemeLessImporter";

test("inverse semantic context supplies one UIkit role set without mutating light defaults", () => {
  const inverse = getUikitSemanticContextVars("dark");
  const light = getUikitSemanticContextVars("light");

  expect(inverse).toMatchObject({
    "--uikit-text-lead-color": "var(--uk-global-inverse-color, #fff)",
    "--uikit-text-meta-color": "var(--uk-global-inverse-color, #fff)",
    "--uikit-accordion-title-color": "var(--uk-global-inverse-color, #fff)",
    "--uikit-accordion-content-color": "var(--uk-global-inverse-color, #fff)",
    "--uk-button-default-background": "var(--uk-button-inverse-default-background, var(--uk-global-inverse-color, #fff))",
    "--uk-button-default-text": "var(--uk-button-inverse-default-text, var(--uk-global-text-color, #111827))",
    "--uk-button-default-border": "var(--uk-button-inverse-default-border, var(--uk-global-inverse-color, #fff))",
    "--uk-button-default-shadow": "var(--uk-button-inverse-default-shadow, none)",
    "--uk-button-secondary-background": "var(--uk-button-inverse-secondary-background, transparent)",
    "--uk-button-secondary-text": "var(--uk-button-inverse-secondary-text, var(--uk-global-inverse-color, #fff))",
    "--uk-button-secondary-hover-gradient": "none",
    "--uk-button-secondary-active-gradient": "none",
    "--uk-button-text-color": "var(--uk-global-inverse-color, #fff)",
    "--uk-button-link-color": "var(--uk-global-inverse-color, #fff)",
  });
  expect(inverse["--uikit-accordion-divider-color"]).toContain("color-mix");
  expect(inverse["--uk-button-primary-background"]).toBeUndefined();
  expect(light["--uk-button-default-text"]).toBeUndefined();
  expect(light["--uikit-text-lead-color"]).toContain("--uk-global-emphasis-color");
});

test("Text and Accordion consume context roles instead of fixed light-surface colors", () => {
  const css = readFileSync(path.resolve("app/styles/shop-builder.css"), "utf8");
  const dashboardCss = readFileSync(path.resolve("app/styles/dashboard.css"), "utf8");

  expect(css).toContain(".uk-text-lead { font-size: 1.25rem !important; line-height: 1.5 !important; font-weight: 400 !important; color: var(--uikit-text-local-color, var(--uikit-text-lead-color");
  expect(css).toContain(".uk-text-meta { font-size: 0.875rem !important; color: var(--uikit-text-local-color, var(--uikit-text-meta-color");
  expect(css).toContain("color: var(--uikit-accordion-title-color");
  expect(css).toContain("var(--uikit-accordion-divider-color");
  expect(css).not.toContain(".uk-text-lead { font-size: 1.25rem !important; line-height: 1.5 !important; font-weight: 400 !important; color: #334155 !important;");
  expect(dashboardCss).toContain(".uk-text-emphasis {\n  --uikit-text-local-color: var(--uikit-text-emphasis-color, var(--context-emphasis");
  expect(dashboardCss).not.toContain(".uk-text-emphasis { color: #1e293b !important; }");
});

test("explicit Button color overrides remain local to the authored action", () => {
  const override = getUikitButtonLocalOverride({
    buttonBg: "#123456",
    buttonTextColor: "#ffffff",
    buttonBorderColor: "#abcdef",
  });

  expect(override.className).toContain("shop-builder-uikit-button--local-background");
  expect(override.className).toContain("shop-builder-uikit-button--local-text");
  expect(override.className).toContain("shop-builder-uikit-button--local-border");
  expect(override.style).toMatchObject({
    "--uikit-button-local-background": "#123456",
    "--uikit-button-local-text": "#ffffff",
    "--uikit-button-local-border": "#abcdef",
  });
  expect(getUikitButtonLocalOverride({}).style).toBeUndefined();
});

test("imported inverse Button LESS tokens reach the shared runtime token owner", () => {
  const imported = resolveYoothemeLess([{
    name: "inverse-button-runtime.less",
    precedence: 1,
    content: `
      @inverse-button-default-box-shadow: 0 5px 15px rgba(0,0,0,0.2);
      @inverse-button-default-background: transparent;
      @inverse-button-default-color: #ffffff;
      @inverse-button-default-border: #ffffff;
      @inverse-button-primary-box-shadow: 0 5px 15px rgba(0,0,0,0.2);
      @inverse-button-secondary-background: transparent;
      @inverse-button-secondary-color: #ffffff;
      @inverse-button-secondary-hover-background: #ffffff;
      @inverse-button-secondary-active-background: rgba(255,255,255,0.8);
      @inverse-button-secondary-border: #ffffff;
    `,
  }]);
  const globals = getUikitGlobalsCssVars(imported.shellSettings);

  expect(globals).toMatchObject({
    "--uk-button-inverse-default-shadow": "0 5px 15px rgba(0, 0, 0, 0.2)",
    "--uk-button-inverse-default-background": "transparent",
    "--uk-button-inverse-default-text": "#ffffff",
    "--uk-button-inverse-default-border": "#ffffff",
    "--uk-button-inverse-primary-shadow": "0 5px 15px rgba(0, 0, 0, 0.2)",
    "--uk-button-inverse-secondary-background": "transparent",
    "--uk-button-inverse-secondary-text": "#ffffff",
    "--uk-button-inverse-secondary-hover-background": "#ffffff",
    "--uk-button-inverse-secondary-active-background": "rgba(255, 255, 255, 0.8)",
    "--uk-button-inverse-secondary-border": "#ffffff",
  });
});

test("imported Nav and Navbar LESS tokens remain global UIkit variables", () => {
  const imported = resolveYoothemeLess([{
    name: "circle-nav-navbar.less",
    precedence: 1,
    content: `
      @nav-large-font-size: 3.4rem;
      @nav-large-font-size-l: 6rem;
      @nav-header-font-size: 13px;
      @navbar-padding-top: 4px;
      @navbar-padding-bottom: 6px;
      @navbar-parent-icon-margin-left: .25em;
      @navbar-dropdown-nav-item-padding-horizontal: 15px;
      @navbar-dropdown-dropbar-large-padding-top: 40px;
    `,
  }]);

  expect(imported.shellSettings).toMatchObject({
    navLargeFontSize: "3.4rem",
    navLargeFontSizeL: "6rem",
    navHeaderFontSize: "13px",
    navbarPaddingTop: "4px",
    navbarPaddingBottom: "6px",
    navbarParentIconMarginLeft: ".25em",
    navbarDropdownNavItemPaddingHorizontal: "15px",
    navbarDropdownDropbarLargePaddingTop: "40px",
  });

  expect(getUikitGlobalsCssVars(imported.shellSettings)).toMatchObject({
    "--uk-nav-large-font-size": "3.4rem",
    "--uk-nav-large-font-size-l": "6rem",
    "--uk-nav-header-font-size": "13px",
    "--uk-navbar-padding-top": "4px",
    "--uk-navbar-padding-bottom": "6px",
    "--uk-navbar-parent-icon-margin-left": ".25em",
    "--uk-navbar-dropdown-nav-item-padding-horizontal": "15px",
    "--uk-navbar-dropdown-dropbar-large-padding-top": "40px",
  });
});

test("YOOtheme Button token absence inherits imported global semantics instead of WebPages defaults", () => {
  const imported = resolveYoothemeLess([{
    name: "button-inheritance.less",
    precedence: 1,
    content: `
      @global-primary-background: #6F40F1;
      @global-background: #F7F8FC;
      @global-color: #555371;
      @global-link-color: #6F40F1;
      @global-inverse-color: #ffffff;
      @button-default-background: @global-background;
      @button-secondary-background: transparent;
      @button-secondary-color: @global-primary-background;
      @button-secondary-hover-background: @global-primary-background;
      @button-secondary-border: @global-primary-background;
      @button-text-color: @global-primary-background;
    `,
  }]);
  const globals = getUikitGlobalsCssVars(imported.shellSettings);

  expect(imported.shellSettings.buttonTokenInheritance).toMatchObject({
    buttonPrimaryBackground: "inherit",
    buttonDefaultText: "inherit",
    buttonLinkColor: "inherit",
    buttonSecondaryBackground: "authored",
  });
  expect(globals).toMatchObject({
    "--uk-button-primary-background": "#6F40F1",
    "--uk-button-primary-text": "#ffffff",
    "--uk-button-default-background": "#F7F8FC",
    "--uk-button-default-text": "#555371",
    "--uk-button-link-color": "#6F40F1",
    "--uk-button-secondary-background": "transparent",
    "--uk-button-secondary-text": "#6F40F1",
  });
});

test("legacy DevStack imports do not retain generic WebPages Button defaults", () => {
  const globals = getUikitGlobalsCssVars({
    globalStylePresetName: "DevStack default",
    backgroundPrimary: "#6F40F1",
    backgroundDefault: "#F7F8FC",
    textColor: "#555371",
    linkColor: "#6F40F1",
    inverseColor: "#ffffff",
    // These are the old persisted WebPages defaults which preceded
    // `buttonTokenInheritance`; they must not override imported globals.
    buttonPrimaryBackground: "#111111",
    buttonPrimaryText: "#ffffff",
    buttonDefaultText: "#111111",
  });

  expect(globals).toMatchObject({
    "--uk-button-primary-background": "#6F40F1",
    "--uk-button-default-text": "#555371",
    "--uk-button-link-color": "#6F40F1",
  });
});

test("button size variants inherit the active theme radius when not explicitly authored", () => {
  const globals = getUikitGlobalsCssVars({
    buttonRadius: "500px",
    borderRadius: "2px",
  });

  expect(globals["--uk-button-border-radius"]).toBe("500px");
  expect(globals["--uk-button-small-radius"]).toBe("500px");
  expect(globals["--uk-button-large-radius"]).toBe("500px");
});
