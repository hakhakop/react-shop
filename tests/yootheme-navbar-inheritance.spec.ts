import { expect, test } from "@playwright/test";
import { resolveYoothemeLess } from "@/lib/yoothemeLessImporter";

test("standalone theme overrides inherit the shared YOOtheme navbar semantics", () => {
  const imported = resolveYoothemeLess([{
    name: "master-makai/_import.less",
    precedence: 1,
    content: `
      @global-font-size: 14px;
      @global-emphasis-color: #0d1724;
      @global-border: rgba(0, 0, 0, 0.1);
      @global-border-width: 1px;
      @global-font-family: Montserrat;
      @global-secondary-font-family: Montserrat;
      @global-secondary-font-style: inherit;
      @global-secondary-font-weight: 700;
      @global-secondary-letter-spacing: inherit;
      @global-secondary-text-transform: uppercase;
      @navbar-nav-item-padding-horizontal: 25px;
      @navbar-nav-item-font-weight: 400;
      @navbar-color-mode: dark;
      @navbar-border-mode: full;
      @navbar-border-vertical-mode: all;
      @navbar-border-width: @global-border-width;
      @navbar-border: fade(@global-border, 10%);
      @global-inverse-color: #fff;
      @inverse-navbar-nav-item-color: fade(@global-inverse-color, 60%);
      @inverse-navbar-nav-item-hover-color: fade(@global-inverse-color, 90%);
      @inverse-navbar-nav-item-onclick-color: fade(@global-inverse-color, 50%);
      @inverse-navbar-nav-item-active-color: @global-inverse-color;
    `,
  }]);

  expect(imported.shellSettings.navbarNavItemHeight).toBe("80px");
  expect(imported.shellSettings.navbarNavItemFontSize).toBe("14px");
  expect(imported.shellSettings.navbarNavItemFontFamily).toBe("Montserrat");
  expect(imported.shellSettings.navbarNavItemFontWeight).toBe("400");
  expect(imported.shellSettings.navbarNavItemTextTransform).toBe("uppercase");
  expect(imported.shellSettings.navbarNavItemPaddingHorizontal).toBe("25px");
  expect(imported.shellSettings.navbarModeBorderVertical).toBe("all");
  expect(imported.shellSettings.navbarMode).toBe("full");
  expect(imported.shellSettings.navbarColorMode).toBe("dark");
  expect(imported.shellSettings.navbarBorderSemantics).toBe("yootheme");
  expect(imported.shellSettings.navbarBorder).toBe("rgba(0, 0, 0, 0.1)");
  expect(imported.shellSettings.navbarDropdownWidth).toBe("200px");
  expect(imported.shellSettings.navbarDropdownNavTextTransform).toBe("uppercase");
  expect(imported.shellSettings.inverseNavbarNavItemColor).toBe("rgba(255, 255, 255, 0.6)");
  expect(imported.shellSettings.inverseNavbarNavItemHoverColor).toBe("rgba(255, 255, 255, 0.9)");
  expect(imported.shellSettings.inverseNavbarNavItemOnclickColor).toBe("rgba(255, 255, 255, 0.5)");
  expect(imported.shellSettings.inverseNavbarNavItemActiveColor).toBe("#fff");
});

test("legacy YOOtheme border-always imports as an edge-to-edge bottom border", () => {
  const imported = resolveYoothemeLess([{
    name: "master-circle/_import.less",
    precedence: 1,
    content: `
      @navbar-mode: border-always;
      @navbar-color-mode: light;
      @navbar-mode-border-vertical: all;
      @navbar-border-width: 1px;
      @navbar-border: rgba(255, 255, 255, 0.08);
    `,
  }]);

  expect(imported.shellSettings.navbarMode).toBe("bottom-full-width");
  expect(imported.shellSettings.navbarColorMode).toBe("light");
  expect(imported.shellSettings.navbarModeBorderVertical).toBe("all");
  expect(imported.shellSettings.navbarBorder).toBe("rgba(255, 255, 255, 0.08)");
  expect(imported.shellSettings.navbarBorderSemantics).toBe("yootheme");
});

test("YOOtheme imports inherit UIkit's default dark navbar color mode", () => {
  const imported = resolveYoothemeLess([{
    name: "master-makai/_import.less",
    precedence: 1,
    content: "@navbar-border-mode: full; @navbar-border: rgba(0, 0, 0, 0.1);",
  }]);

  expect(imported.shellSettings.navbarColorMode).toBe("dark");
});
