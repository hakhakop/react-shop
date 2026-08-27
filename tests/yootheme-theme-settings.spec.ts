import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import {
  applyBuilderThemeSettings,
  createYoothemeThemeSettings,
  normalizeBuilderThemeSettings,
} from "@/lib/builderThemeSettings";
import { defaultBuilderShellSettings } from "@/lib/builderShell";
import { getUikitGlobalsCssVars } from "@/lib/uikitGlobals";

test("maps a full YOOtheme export into one page and Header theme document", () => {
  const source = JSON.parse(
    readFileSync("tests/fixtures/yootheme-jack-theme-settings.json", "utf8"),
  );
  const settings = createYoothemeThemeSettings(source);

  expect(settings.active).toBe(true);
  expect(settings.themeId).toBe("jack-baker");
  expect(settings.page).toMatchObject({
    layout: "full",
    alignment: "center",
    containerWidth: "1500px",
    marginTop: "70px",
    marginBottom: "70px",
  });
  expect(settings.header.document).toMatchObject({
    headerLayout: "simple",
    headerWidthMode: "full",
    headerBehavior: "sticky-on-scroll-up",
    headerMobileBreakpoint: "1200px",
    headerDropdownAlign: "left",
    headerDropdownAlignToNavbar: false,
    headerDropbarEnabled: true,
    headerSearchPosition: "hide",
    headerSearchLayout: "input-dropdown",
    headerDialogLayout: "offcanvas-top",
    headerDialogTogglePosition: "header:end",
  });
  expect(settings.resolved.shellSettings).toMatchObject({
    fontFamilyBody: "Poppins",
    navbarNavItemHeight: "100px",
    navbarNavItemTextTransform: "uppercase",
  });
  expect(settings.resolved.shellSettings).not.toHaveProperty("headerBehavior");
  expect(settings.resolved.shellSettings).not.toHaveProperty("headerSearchPosition");
  expect(settings.resolved.shellSettings).not.toHaveProperty("headerDialogLayout");

  const columns = settings.header.document.layoutItems ?? [];
  expect(columns).toHaveLength(3);
  expect(columns[0]?.blocks).toEqual([
    expect.objectContaining({
      id: "header-logo",
      kind: "image",
      imageUrl: "wp-content/uploads/yootheme/logo.svg",
      imageMobileUrl: "wp-content/uploads/yootheme/logo-mobile.svg",
      imageSvgInline: true,
      headerBrandText: "Jack Baker",
    }),
  ]);
  expect(columns[1]?.blocks).toEqual([
    expect.objectContaining({
      id: "header-navigation",
      kind: "menu",
      menuSource: "main",
    }),
  ]);
  expect(columns[2]?.blocks).toEqual([]);
  expect(columns.flatMap((column) => column.blocks ?? []).map((block) => block.kind)).not.toContain("headerSearch");
  expect(columns.flatMap((column) => column.blocks ?? []).map((block) => block.kind)).not.toContain("headerCart");

  expect(settings.sourceConfig.dialog).toMatchObject({ layout: "offcanvas-top", toggle: "header:end" });
  expect(settings.sourceConfig.mobileHeader).toMatchObject({ layout: "horizontal-right" });
  expect(settings.sourceConfig.mobileNavbar).toMatchObject({ sticky: 0 });
  expect(settings.sourceConfig.mobileDialog).toMatchObject({ layout: "modal-center", toggle: "header-mobile:end" });
  expect(settings.sourceConfig.mobileBreakpoint).toBe("l");
  expect(settings.sourceConfig.logo).toMatchObject({ text: "Jack Baker" });
  expect(settings.sourceConfig.menuPositions).toHaveProperty("navbar.menu", 2);
  expect(settings.sourceConfig.menuItems).toHaveProperty("30.dropdown.columns", 1);
  expect(settings.capabilities.page).toContain("site.layout");
  expect(settings.capabilities.header).toContain("header.layout");
  expect(normalizeBuilderThemeSettings(JSON.parse(JSON.stringify(settings)))).toMatchObject({
    active: true,
    provider: "yootheme",
    themeId: "jack-baker",
  });
});

test("provider runtime projection cannot override a normal canonical Header edit", () => {
  const source = JSON.parse(
    readFileSync("tests/fixtures/yootheme-jack-theme-settings.json", "utf8"),
  );
  const settings = createYoothemeThemeSettings(source);
  const staleProvider = {
    ...settings,
    resolved: {
      ...settings.resolved,
      shellSettings: {
        ...settings.resolved.shellSettings,
        headerBehavior: "sticky-on-scroll-up" as const,
        headerLayout: "wordpress" as const,
        headerSearchPosition: "left",
      },
    },
  };
  const canonicalShell = {
    ...defaultBuilderShellSettings,
    headerBehavior: "static" as const,
    headerLayout: "simple" as const,
    headerSearchPosition: "hide",
  };

  expect(applyBuilderThemeSettings(canonicalShell, staleProvider)).toMatchObject({
    headerBehavior: "static",
    headerLayout: "simple",
    headerSearchPosition: "hide",
    fontFamilyBody: "Poppins",
  });
});

test("renders Jack Baker's imported Navbar line as a semantic strike-through", () => {
  const source = JSON.parse(
    readFileSync("tests/fixtures/yootheme-jack-theme-settings.json", "utf8"),
  );
  const settings = createYoothemeThemeSettings(source);
  const variables = getUikitGlobalsCssVars(settings.resolved.shellSettings);

  expect(variables).toMatchObject({
    "--uk-navbar-nav-item-line-mode": "true",
    "--uk-navbar-nav-item-line-slide-mode": "left",
    "--uk-navbar-nav-item-line-height": "1px",
    "--uk-navbar-nav-item-line-margin-horizontal": "-4px",
    "--uk-navbar-nav-item-line-margin-vertical": "50%",
    "--uk-navbar-nav-item-line-hover-background": "currentColor",
    "--uk-navbar-nav-item-line-hover-opacity": "1",
    "--uk-navbar-nav-item-line-active-background": "currentColor",
  });

  const headerCss = readFileSync("app/styles/header.css", "utf8");
  expect(headerCss).toContain("bottom: var(--uk-navbar-nav-item-line-margin-vertical, -1px)");
  expect(headerCss).toContain("right: calc(100% - var(--uk-navbar-nav-item-line-margin-horizontal, 0px))");
  expect(headerCss).toContain("background: var(--uk-navbar-nav-item-line-hover-background, currentColor)");
});
