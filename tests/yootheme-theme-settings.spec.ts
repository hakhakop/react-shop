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
    headerMobileLayout: "horizontal-right",
    headerMobileBehavior: "static",
    headerMobileSearchPosition: "right",
    headerMobileSearchLayout: "input-dropdown",
    headerMobileSearchDropdownStretch: "navbar",
    headerMobileSearchDropdownLarge: true,
    headerMobileSearchIconPosition: "left",
    headerMobileSocialItems: [
      { link: "https://500px.com/" },
      { link: "https://www.instagram.com/" },
      { link: "https://www.facebook.com/yootheme" },
    ],
    headerMobileComposition: "separate",
    headerMobileDialogLayout: "modal-center",
    headerMobileDialogTogglePosition: "mobile-end",
    headerMobileDialogClose: true,
    headerMobileDialogMenuStyle: "default",
    headerMobileOffcanvasMode: "push",
    headerMobileOffcanvasFlip: false,
    headerMobileOffcanvasOverlay: true,
    headerMobileDialogDropbarAnimation: "reveal-top",
    headerDropdownAlign: "left",
    headerDropdownAlignToNavbar: false,
    headerDropbarEnabled: true,
    headerSearchPosition: "hide",
    headerSearchLayout: "input-dropdown",
    headerSearchDropdownStretch: "navbar",
    headerSearchDropdownLarge: true,
    headerSearchIconPosition: "left",
    headerSocialGap: "small",
    headerSocialStyle: false,
    headerLogoPaddingRemove: false,
    headerDialogLayout: "offcanvas-top",
    headerDialogTogglePosition: "header-end",
    headerDialogMenuStyle: "default",
    headerOffcanvasMode: "slide",
    headerOffcanvasFlip: true,
    headerOffcanvasOverlay: true,
  });
  expect(settings.resolved.shellSettings).toMatchObject({
    fontFamilyBody: "Poppins",
    navbarNavItemHeight: "100px",
    navbarNavItemTextTransform: "uppercase",
  });
  expect(settings.resolved.shellSettings).not.toHaveProperty("headerBehavior");
  expect(settings.resolved.shellSettings).not.toHaveProperty("headerSearchPosition");
  expect(settings.resolved.shellSettings).not.toHaveProperty("headerDialogLayout");

  // Theme Settings are not a Header builder export. They must change the
  // existing Header document's settings without replacing its authored rows.
  expect(settings.header.document).not.toHaveProperty("rows");

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

test("normalizes standard YOOtheme Header position vocabulary", () => {
  const source = JSON.parse(
    readFileSync("tests/fixtures/yootheme-jack-theme-settings.json", "utf8"),
  );
  source.header.search = "navbar:end";
  source.dialog.toggle = "header:start";
  source.mobile.search = "header-mobile:start";
  const settings = createYoothemeThemeSettings(source);

  expect(settings.header.document).toMatchObject({
    headerSearchPosition: "navbar-end",
    headerDialogTogglePosition: "header-start",
    headerMobileSearchPosition: "mobile-start",
  });
  expect(settings.header.document).not.toHaveProperty("rows");
  expect(settings.sourceConfig.dialog).toMatchObject({ toggle: "header:start" });
});

test("preserves YOOtheme Search expansion and dropbar semantics on the Header document", () => {
  const source = JSON.parse(
    readFileSync("tests/fixtures/yootheme-jack-theme-settings.json", "utf8"),
  );
  source.header.search_expand = true;
  source.header.search_prevent_submit = true;
  source.header.search_dropbar = { animation: "reveal-top", padding_remove_horizontal: true };
  source.mobile.header.search_expand = false;
  source.mobile.header.search_prevent_submit = true;
  source.mobile.header.search_dropbar = { animation: "slide-left", padding_remove_horizontal: true };

  expect(createYoothemeThemeSettings(source).header.document).toMatchObject({
    headerSearchExpand: true,
    headerSearchPreventSubmit: true,
    headerSearchDropbarAnimation: "reveal-top",
    headerSearchDropbarRemoveHorizontalPadding: true,
    headerMobileSearchExpand: false,
    headerMobileSearchPreventSubmit: true,
    headerMobileSearchDropbarAnimation: "slide-left",
    headerMobileSearchDropbarRemoveHorizontalPadding: true,
  });
});

test("applies a YOOtheme root-menu dropdown only to its stable WordPress menu item", () => {
  const source = JSON.parse(
    readFileSync("tests/fixtures/yootheme-jack-theme-settings.json", "utf8"),
  );
  source.menu.items = {
    1418: {
      dropdown: {
        stretch: "navbar-container",
        size: true,
        padding_remove_horizontal: false,
        padding_remove_vertical: true,
      },
    },
  };
  const settings = createYoothemeThemeSettings(source);
  const result = applyBuilderThemeSettings(
    {
      ...defaultBuilderShellSettings,
      menuItems: [
        { id: "wp-1418", label: "Women", url: "/women" },
        { id: "wp-999", label: "Men", url: "/men" },
      ],
    },
    settings,
  );

  expect(result.menuPresentation["wp-1418"]).toMatchObject({
    submenuStretch: "navbar-container",
    submenuLarge: true,
    submenuRemoveHorizontalPadding: false,
    submenuRemoveVerticalPadding: true,
  });
  expect(result.menuPresentation["wp-999"]).toBeUndefined();
});

test("maps standard mobile Header alignment without using a preset", () => {
  const source = JSON.parse(
    readFileSync("tests/fixtures/yootheme-jack-theme-settings.json", "utf8"),
  );
  source.mobile.header.layout = "horizontal-center";
  expect(createYoothemeThemeSettings(source).header.document).toMatchObject({
    headerMobileLayout: "horizontal-center",
  });

  source.mobile.header.layout = "horizontal-left";
  expect(createYoothemeThemeSettings(source).header.document).toMatchObject({
    headerMobileLayout: "horizontal-left",
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

test("keeps Header row layout on the shared inspector path", () => {
  const inspector = readFileSync("components/dashboard/DashboardInspector.tsx", "utf8");

  expect(inspector).not.toContain('The current Header Builder composition.');
  expect(inspector).not.toContain("builder-header-active-row-layout");
  expect(inspector).not.toContain("Choose Header row layout");
  expect(inspector).toContain('title="Header row behavior"');
  expect(inspector).toContain("<div className=\"builder-layout-picker-grid is-inline\">");
  expect(inspector).toContain("builderRowLayoutPresets.map((preset) =>");
  expect(inspector).toContain("const isCanonicalRowSelection = Boolean(\n    selectedInspectorRow,\n  );");
  expect(inspector).not.toContain("selectedInspectorRow &&\n      !isHeaderDocumentSection");
});

test("exposes YOOtheme Navbar Nav Item controls and preserves the height token bridge", () => {
  const panel = readFileSync(
    "components/dashboard/global-styles/CanonicalGlobalStylesPanel.tsx",
    "utf8",
  );
  const headerCss = readFileSync("app/styles/header.css", "utf8");
  const variables = getUikitGlobalsCssVars({ navbarNavItemHeight: "80px" });

  expect(panel).toContain('navbar: ["Surface", "Nav Item"');
  expect(panel).toContain('<Length label="Item height" value={draft.navbarNavItemHeight}');
  expect(variables["--uk-navbar-nav-item-height"]).toBe("80px");
  expect(headerCss).toContain("height: var(--header-builder-height);");
  expect(headerCss).toContain("--uk-navbar-nav-item-height");
});
