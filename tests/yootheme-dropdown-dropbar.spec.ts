import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { resolveYoothemeLess } from "@/lib/yoothemeLessImporter";
import { getUikitGlobalsCssVars } from "@/lib/uikitGlobals";

const fallback = `
@global-secondary-background: #111111;
@dropdown-padding: 12px;
@dropdown-background: #222222;
@dropbar-background: #333333;
`;

const imported = `
@global-secondary-background: #18181b;
@global-inverse-color: #ffffff;
@global-muted-color: #929292;
@global-border: #e5e7eb;
@global-font-family: Poppins;
@dropdown-padding: 30px;
@dropdown-background: lighten(@global-secondary-background, 2%);
@dropdown-color: @global-inverse-color;
@dropdown-color-mode: light;
@dropdown-dropbar-margin: 0;
@dropdown-dropbar-padding-top: ~'calc(@{dropdown-padding} - 6px)';
@dropdown-dropbar-large-padding-top: ~'calc(@{dropdown-large-padding} - 6px)';
@dropdown-nav-item-hover-color: @global-inverse-color;
@dropdown-nav-subtitle-font-size: 12px;
@dropdown-nav-header-color: @global-muted-color;
@dropdown-nav-divider-border: fade(@global-border, 15%);
@dropdown-nav-sublist-item-hover-color: @global-inverse-color;
@dropdown-nav-item-padding-vertical: 0;
@dropdown-nav-font-size: 14px;
@dropdown-nav-subtitle-color: @global-muted-color;
@dropdown-nav-subtitle-font-family: @global-font-family;
@dropdown-nav-subtitle-font-weight: normal;
@dropdown-nav-subtitle-text-transform: none;
@dropbar-padding-top: 30px;
@dropbar-background: lighten(@global-secondary-background, 2%);
@dropbar-color: @inverse-global-color;
@dropbar-color-mode: light;
@search-placeholder-color: fade(@global-muted-color, 50%);
@search-icon-color: @global-inverse-color;
@search-navbar-background: transparent;
@search-toggle-color: @global-inverse-color;
@search-toggle-hover-color: @global-muted-color;
@search-navbar-border-width: 1px;
@search-navbar-border: @global-border;
@search-navbar-focus-border: @global-inverse-color;
@offcanvas-bar-padding-vertical: 40px;
@offcanvas-bar-padding-horizontal: 40px;
@offcanvas-bar-background: @global-secondary-background;
@offcanvas-bar-color-mode: dark;
@offcanvas-overlay-background: fade(@global-secondary-background, 90%);
@logo-font-size: 20px;
@logo-text-transform: uppercase;
`;

test("maps canonical Dropdown and Dropbar tokens and honors source precedence", () => {
  const result = resolveYoothemeLess([
    { name: "built-in-jack.less", content: fallback, precedence: 1 },
    { name: "uploaded/_import.less", content: imported, precedence: 2 },
  ]);
  expect(result.shellSettings).toMatchObject({
    dropdownPadding: "30px",
    dropdownColor: "#ffffff",
    dropdownColorMode: "light",
    dropdownDropbarPaddingTop: "24px",
    dropdownDropbarLargePaddingTop: "34px",
    dropdownNavItemHoverColor: "#ffffff",
    dropdownNavFontSize: "14px",
    dropdownNavSubtitleFontFamily: "Poppins",
    dropbarPaddingTop: "30px",
    dropbarColor: "var(--uk-inverse-global-color)",
    dropbarColorMode: "light",
    searchIconColor: "#ffffff",
    searchNavbarBorderWidth: "1px",
    offcanvasBarPaddingVertical: "40px",
    offcanvasBarBackground: "#18181b",
    offcanvasBarColorMode: "dark",
    logoFontSize: "20px",
    logoTextTransform: "uppercase",
  });
  expect(result.shellSettings.dropdownBackground).not.toBe("#222222");
  expect(result.shellSettings.dropbarBackground).not.toBe("#333333");

  expect(getUikitGlobalsCssVars(result.shellSettings)).toMatchObject({
    "--uk-dropdown-padding": "30px",
    "--uk-dropdown-color": "#ffffff",
    "--uk-dropdown-nav-font-size": "14px",
    "--uk-dropbar-padding-top": "30px",
    "--uk-dropbar-color": "var(--uk-inverse-global-color)",
    "--uk-search-icon-color": "#ffffff",
    "--uk-search-navbar-border-width": "1px",
    "--uk-offcanvas-bar-padding-vertical": "40px",
    "--uk-offcanvas-bar-background": "#18181b",
    "--uk-logo-font-size": "20px",
  });
});

test("shared Header CSS consumes canonical alignment, boundary, click and dropbar tokens", () => {
  const css = readFileSync("app/styles/header.css", "utf8");
  expect(css).toContain(".site-header--dropdown-boundary-navbar .site-header-main-inner");
  expect(css).toContain(".site-header--dropdown-dropbar");
  expect(css).toContain(".site-header--dropdown-hover .site-header-nav-item:hover");
  expect(css).toContain("var(--uk-dropbar-background");
  expect(css).toContain("var(--uk-navbar-dropdown-nav-item-hover-color");
});
