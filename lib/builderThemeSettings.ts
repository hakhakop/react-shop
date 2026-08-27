import type { BuilderSection } from "@/components/dashboard/builderTypes";
import type { BuilderShellSettings } from "@/lib/builderShell";
import { normalizeYoothemeHeaderDocument } from "@/lib/yoothemeImportContract";
import { resolveYoothemeLess, type YoothemeLessSource } from "@/lib/yoothemeLessImporter";

/**
 * A tenant-owned provider document for theme semantics.
 *
 * This is deliberately separate from BuilderShellSettings. The latter is the
 * WebPages runtime shape; this document keeps the YOOtheme source contract,
 * the theme adapter result, and the capability audit together.
 */
export type BuilderThemeSettings = {
  schemaVersion: 1;
  provider: "yootheme";
  active: boolean;
  themeId: string | null;
  displayName: string;
  sourceConfig: {
    style?: string;
    site?: Record<string, unknown>;
    header?: Record<string, unknown>;
    navbar?: Record<string, unknown>;
    mobile?: Record<string, unknown>;
    dialog?: Record<string, unknown>;
    mobileHeader?: Record<string, unknown>;
    mobileNavbar?: Record<string, unknown>;
    mobileDialog?: Record<string, unknown>;
    mobileBreakpoint?: string;
    logo?: Record<string, unknown>;
    menuPositions?: Record<string, unknown>;
    menuItems?: Record<string, unknown>;
    menu?: Record<string, unknown>;
    less?: Record<string, unknown>;
    customLess?: string;
  };
  page: {
    layout: "full" | "boxed";
    alignment: "left" | "center" | "right";
    containerWidth?: string;
    marginTop?: string;
    marginBottom?: string;
    background?: string;
    colorMode?: "light" | "dark";
  };
  header: {
    source: Record<string, unknown>;
    document: Partial<BuilderSection>;
    breakpoint?: string;
    mobileLayout?: string;
    dialogLayout?: string;
    dialogToggle?: string;
  };
  resolved: {
    shellSettings: Partial<BuilderShellSettings>;
    headerDocument: Partial<BuilderSection>;
  };
  capabilities: {
    global: string[];
    page: string[];
    header: string[];
  };
  unsupported: string[];
  updatedAt?: string;
};

export const defaultBuilderThemeSettings: BuilderThemeSettings = {
  schemaVersion: 1,
  provider: "yootheme",
  active: false,
  themeId: null,
  displayName: "No theme imported",
  sourceConfig: {},
  page: {
    layout: "full",
    alignment: "center",
  },
  header: {
    source: {},
    document: {},
  },
  resolved: {
    shellSettings: {},
    headerDocument: {},
  },
  capabilities: {
    global: [],
    page: [],
    header: [],
  },
  unsupported: [],
};

type RecordValue = Record<string, unknown>;

function record(value: unknown): RecordValue {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as RecordValue
    : {};
}

function text(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function cloneRecord(value: unknown): RecordValue | undefined {
  const source = record(value);
  return Object.keys(source).length ? structuredClone(source) : undefined;
}

function sourceLessObject(value: unknown): Record<string, unknown> {
  const source = record(value);
  return Object.fromEntries(
    Object.entries(source).filter(([, item]) =>
      typeof item === "string" || typeof item === "number" || typeof item === "boolean",
    ),
  );
}

function lessFromObject(value: Record<string, unknown>): string {
  return Object.entries(value)
    .map(([key, item]) => `@${key.replace(/^@/, "")}: ${String(item)};`)
    .join("\n");
}

function mediaBreakpoint(value: unknown): string | undefined {
  const key = text(value)?.toLowerCase();
  return key === "s" ? "640px" : key === "m" ? "960px" : key === "l" ? "1200px" : key === "xl" ? "1600px" : text(value);
}

function boxedAlignment(value: unknown): "left" | "center" | "right" {
  return value === 0 || value === "0" || value === "left"
    ? "left"
    : value === 2 || value === "2" || value === "right"
      ? "right"
      : "center";
}

/**
 * Jack Baker's defaults are part of its installed theme adapter. The JSON
 * export contains `style: "jack-baker"`, but intentionally does not inline the
 * compiled LESS defaults. Keeping this adapter here makes the JSON export
 * sufficient while preserving the source/config distinction.
 */
const JACK_BAKER_LESS = `
@global-font-family: Poppins;
@global-font-size: 16px;
@global-line-height: 1.5;
@global-2xlarge-font-size: 46px;
@global-xlarge-font-size: 40px;
@global-large-font-size: 28px;
@global-medium-font-size: 22px;
@global-small-font-size: 13px;
@global-primary-font-family: Poppins;
@global-primary-font-weight: normal;
@global-primary-text-transform: inherit;
@global-primary-letter-spacing: inherit;
@global-primary-font-style: inherit;
@global-secondary-font-family: inherit;
@global-secondary-font-weight: inherit;
@global-secondary-text-transform: inherit;
@global-secondary-letter-spacing: inherit;
@global-secondary-font-style: inherit;
@global-color: #181818;
@global-emphasis-color: #000;
@global-muted-color: #949494;
@global-link-color: #ef463e;
@global-link-hover-color: #181818;
@global-inverse-color: #fff;
@global-background: #fff;
@global-muted-background: #f3f3f3;
@global-primary-background: #ef463e;
@global-secondary-background: #181818;
@global-success-background: #00b572;
@global-warning-background: #faa05a;
@global-danger-background: #CE241B;
@global-border: #e4e4e4;
@global-border-width: 1px;
@global-border-radius: 0;
@global-small-box-shadow: 0 2px 8px rgba(0,0,0,0.08);
@global-medium-box-shadow: 0 5px 15px rgba(0,0,0,0.08);
@global-large-box-shadow: 0 15px 55px rgba(0,0,0,0.08);
@global-xlarge-box-shadow: 0 28px 50px rgba(0,0,0,0.16);
@global-margin: 20px;
@global-small-margin: 10px;
@global-medium-margin: 40px;
@global-large-margin: 70px;
@global-xlarge-margin: 140px;
@global-gutter: 40px;
@global-small-gutter: 15px;
@global-medium-gutter: 40px;
@global-large-gutter: 70px;
@global-control-height: 40px;
@global-control-small-height: 30px;
@global-control-large-height: 55px;
@global-z-index: 1000;
@heading-small-font-size-m: 50px;
@heading-large-font-size-l: 86px;
@heading-xlarge-font-size-l: 130px;
@heading-2xlarge-font-size-l: 168px;
@heading-medium-line-height: 1.2;
@heading-xlarge-font-weight: 600;
@heading-2xlarge-font-weight: 600;
@heading-3xlarge-font-weight: 600;
@navbar-background: @global-background;
@navbar-nav-item-height: 100px;
@navbar-nav-item-color: @global-color;
@navbar-nav-item-font-size: 14px;
@navbar-toggle-color: @global-color;
@navbar-toggle-hover-color: @global-muted-color;
@navbar-subtitle-font-size: 12px;
@navbar-dropdown-width: 250px;
@navbar-dropdown-padding: 30px;
@navbar-dropdown-background: lighten(@global-secondary-background, 2%);
@navbar-dropdown-color: @global-muted-color;
@navbar-dropdown-color-mode: light;
@navbar-dropdown-grid-gutter-horizontal: 30px;
@navbar-nav-item-padding-horizontal-m: 0;
@navbar-nav-item-transition-duration: 0.2s;
@navbar-nav-item-line-mode: true;
@navbar-nav-item-line-slide-mode: left;
@navbar-nav-item-line-margin-vertical: 50%;
@navbar-nav-item-line-margin-horizontal: -4px;
@navbar-nav-item-line-transition-duration: 0.3s;
@navbar-nav-item-text-transform: uppercase;
@navbar-subtitle-color: @global-muted-color;
@navbar-subtitle-font-family: @global-font-family;
@navbar-subtitle-font-weight: 400;
@navbar-primary-nav-item-font-size: @global-medium-font-size;
@navbar-dropdown-nav-font-size: 14px;
@navbar-dropdown-nav-subtitle-color: @global-muted-color;
@navbar-dropdown-nav-subtitle-font-family: @global-font-family;
@navbar-dropdown-nav-subtitle-font-weight: 400;
@theme-page-border-width: 14px;
@theme-page-border: @global-background;
@theme-page-container-width: 1500px;
@theme-page-container-margin-top: @global-large-margin;
@theme-page-container-margin-bottom: @theme-page-container-margin-top;
@theme-page-container-background: darken(@global-muted-background, 3%);
@theme-page-container-color-mode: dark;
@theme-headerbar-color-mode: light;
@theme-headerbar-top-padding-top: 20px;
@theme-headerbar-top-padding-bottom: 20px;
@theme-headerbar-top-background: @navbar-background;
@theme-headerbar-top-border-width: 0;
@theme-headerbar-top-border: transparent;
@theme-headerbar-bottom-padding-top: 20px;
@theme-headerbar-bottom-padding-bottom: 20px;
@theme-headerbar-bottom-background: @navbar-background;
@theme-headerbar-bottom-border-width: 0;
@theme-headerbar-bottom-border: transparent;
@theme-headerbar-stacked-margin-top: 20px;
@theme-headerbar-font-size: @global-small-font-size;
@section-title-color: @global-color;
@section-title-text-transform: uppercase;
@section-title-letter-spacing: 3px;
`;

const BUILT_IN_THEME_LESS: Record<string, string> = {
  "jack-baker": JACK_BAKER_LESS,
};

function sourceConfig(root: RecordValue) {
  const mobile = record(root.mobile);
  const menu = record(root.menu);
  return {
    style: text(root.style),
    site: cloneRecord(root.site),
    header: cloneRecord(root.header),
    navbar: cloneRecord(root.navbar),
    mobile: cloneRecord(root.mobile),
    dialog: cloneRecord(root.dialog),
    mobileHeader: cloneRecord(mobile.header),
    mobileNavbar: cloneRecord(mobile.navbar),
    mobileDialog: cloneRecord(mobile.dialog),
    mobileBreakpoint: text(mobile.breakpoint),
    logo: cloneRecord(root.logo),
    menuPositions: cloneRecord(menu.positions),
    menuItems: cloneRecord(menu.items),
    menu: cloneRecord(menu),
    less: cloneRecord(root.less),
    customLess: text(root.custom_less),
  };
}

export function normalizeBuilderThemeSettings(value: unknown): BuilderThemeSettings {
  const raw = record(value);
  const page = record(raw.page);
  const header = record(raw.header);
  const resolved = record(raw.resolved);
  const capabilities = record(raw.capabilities);
  const layout = page.layout === "boxed" ? "boxed" : "full";
  const alignment = page.alignment === "left" || page.alignment === "right" ? page.alignment : "center";
  return {
    ...defaultBuilderThemeSettings,
    schemaVersion: 1,
    provider: "yootheme",
    active: raw.active === true,
    themeId: text(raw.themeId) ?? null,
    displayName: text(raw.displayName) ?? "No theme imported",
    sourceConfig: {
      style: text(record(raw.sourceConfig).style),
      site: cloneRecord(record(raw.sourceConfig).site),
      header: cloneRecord(record(raw.sourceConfig).header),
      navbar: cloneRecord(record(raw.sourceConfig).navbar),
      mobile: cloneRecord(record(raw.sourceConfig).mobile),
      dialog: cloneRecord(record(raw.sourceConfig).dialog),
      mobileHeader: cloneRecord(record(raw.sourceConfig).mobileHeader),
      mobileNavbar: cloneRecord(record(raw.sourceConfig).mobileNavbar),
      mobileDialog: cloneRecord(record(raw.sourceConfig).mobileDialog),
      mobileBreakpoint: text(record(raw.sourceConfig).mobileBreakpoint),
      logo: cloneRecord(record(raw.sourceConfig).logo),
      menuPositions: cloneRecord(record(raw.sourceConfig).menuPositions),
      menuItems: cloneRecord(record(raw.sourceConfig).menuItems),
      menu: cloneRecord(record(raw.sourceConfig).menu),
      less: cloneRecord(record(raw.sourceConfig).less),
      customLess: text(record(raw.sourceConfig).customLess),
    },
    page: {
      layout,
      alignment,
      containerWidth: text(page.containerWidth),
      marginTop: text(page.marginTop),
      marginBottom: text(page.marginBottom),
      background: text(page.background),
      colorMode: page.colorMode === "dark" ? "dark" : page.colorMode === "light" ? "light" : undefined,
    },
    header: {
      source: cloneRecord(header.source) ?? {},
      document: cloneRecord(header.document) as Partial<BuilderSection> ?? {},
      breakpoint: text(header.breakpoint),
      mobileLayout: text(header.mobileLayout),
      dialogLayout: text(header.dialogLayout),
      dialogToggle: text(header.dialogToggle),
    },
    resolved: {
      shellSettings: cloneRecord(resolved.shellSettings) as Partial<BuilderShellSettings> ?? {},
      headerDocument: cloneRecord(resolved.headerDocument) as Partial<BuilderSection> ?? {},
    },
    capabilities: {
      global: Array.isArray(capabilities.global) ? capabilities.global.filter((item): item is string => typeof item === "string") : [],
      page: Array.isArray(capabilities.page) ? capabilities.page.filter((item): item is string => typeof item === "string") : [],
      header: Array.isArray(capabilities.header) ? capabilities.header.filter((item): item is string => typeof item === "string") : [],
    },
    unsupported: Array.isArray(raw.unsupported) ? raw.unsupported.filter((item): item is string => typeof item === "string") : [],
    updatedAt: text(raw.updatedAt),
  };
}

/** Convert a full YOOtheme site export into the canonical provider document. */
export function createYoothemeThemeSettings(source: unknown): BuilderThemeSettings {
  const root = record(source);
  const style = text(root.style) ?? "custom-yootheme";
  const site = record(root.site);
  const boxed = record(site.boxed);
  const header = record(root.header);
  const mobile = record(root.mobile);
  const dialog = record(root.dialog);
  const mobileHeader = record(mobile.header);
  const mobileNavbar = record(mobile.navbar);
  const mobileDialog = record(mobile.dialog);
  const menu = record(root.menu);
  const rawLess = sourceLessObject(root.less);
  const customLess = text(root.custom_less) ?? "";
  const sources: YoothemeLessSource[] = [];
  const builtIn = BUILT_IN_THEME_LESS[style];
  if (builtIn) sources.push({ name: `theme-adapter/${style}.less`, content: builtIn, precedence: 1 });
  if (Object.keys(rawLess).length) sources.push({ name: "yootheme-export.less", content: lessFromObject(rawLess), precedence: 2 });
  if (customLess) sources.push({ name: "yootheme-custom.less", content: customLess, precedence: 3 });

  const resolvedLess: Pick<ReturnType<typeof resolveYoothemeLess>, "shellSettings" | "unsupported" | "rows"> = sources.length
    ? resolveYoothemeLess(sources)
    : {
        shellSettings: {},
        unsupported: [],
        rows: [],
      };
  const headerDocument = normalizeYoothemeHeaderDocument(root);
  const shellSettings: Partial<BuilderShellSettings> = {
    ...resolvedLess.shellSettings,
    themePageLayout: site.layout === "boxed" ? "boxed" : "full",
    themePageContainerAlignment: boxedAlignment(boxed.alignment),
  };
  const page = {
    layout: site.layout === "boxed" ? "boxed" as const : "full" as const,
    alignment: boxedAlignment(boxed.alignment),
    containerWidth: text(resolvedLess.shellSettings.pageContainerMaxWidth),
    marginTop: text(resolvedLess.shellSettings.themePageContainerMarginTop),
    marginBottom: text(resolvedLess.shellSettings.themePageContainerMarginBottom),
    background: text(resolvedLess.shellSettings.themePageContainerBackground),
    colorMode: resolvedLess.shellSettings.themePageContainerColorMode === "dark" ? "dark" as const : "light" as const,
  };
  const globalCapabilities = Object.keys(resolvedLess.shellSettings).sort();
  const pageCapabilities = [
    "site.layout",
    "site.boxed.alignment",
    ...Object.keys(page).filter((key) => page[key as keyof typeof page] !== undefined).map((key) => `theme.${key}`),
  ];
  const headerCapabilities = [
    ...(record(root.site).toolbar_width !== undefined ? ["site.toolbar_width"] : []),
    ...(record(root.site).toolbar_center !== undefined ? ["site.toolbar_center"] : []),
    ...Object.keys(header).map((key) => `header.${key}`),
    ...Object.keys(record(root.navbar)).map((key) => `navbar.${key}`),
    ...Object.keys(mobile).map((key) => `mobile.${key}`),
    ...Object.keys(dialog).map((key) => `dialog.${key}`),
    ...Object.keys(headerDocument).map((key) => `headerDocument.${key}`),
  ];

  return normalizeBuilderThemeSettings({
    schemaVersion: 1,
    provider: "yootheme",
    active: true,
    themeId: style,
    displayName: style === "jack-baker" ? "Jack Baker" : style,
    sourceConfig: sourceConfig(root),
    page,
    header: {
      source: {
        header,
        navbar: record(root.navbar),
        mobile,
        dialog,
        mobileHeader,
        mobileNavbar,
        mobileDialog,
        mobileBreakpoint: mobile.breakpoint,
        logo: record(root.logo),
        menuPositions: record(menu.positions),
        menuItems: record(menu.items),
      },
      document: headerDocument,
      breakpoint: mediaBreakpoint(mobile.breakpoint),
      mobileLayout: text(mobileHeader.layout),
      dialogLayout: text(dialog.layout),
      dialogToggle: text(dialog.toggle),
    },
    resolved: {
      shellSettings,
      headerDocument,
    },
    capabilities: {
      global: globalCapabilities,
      page: pageCapabilities,
      header: headerCapabilities,
    },
    unsupported: resolvedLess.unsupported.map((row) => `@${row.variable.replace(/^@/, "")}`),
    updatedAt: new Date().toISOString(),
  });
}

export function applyBuilderThemeSettings(
  shellSettings: BuilderShellSettings,
  themeSettings: BuilderThemeSettings | null | undefined,
): BuilderShellSettings {
  if (!themeSettings?.active || themeSettings.provider !== "yootheme") return shellSettings;
  const providerGlobalStyles = { ...themeSettings.resolved.shellSettings } as Record<string, unknown>;
  // Header structure and behaviour are materialized into the canonical Header
  // document at import time. Never reintroduce those values as a runtime shell
  // authority; the provider projection remains provenance plus Global Styles.
  [
    "headerLayout", "headerWidthMode", "headerBehavior", "headerTransparent",
    "headerOverlay", "headerHeight", "headerCustomHeight", "headerZIndex",
    "headerBackgroundMode", "headerTextMode", "headerBreakpoint",
    "headerMobileBreakpoint", "headerStickyShowOnUp", "headerStickyAnimation",
    "headerDropdownAlign", "headerDropdownAlignToNavbar", "headerDropbarEnabled",
    "headerParentIconEnabled", "headerClickModeEnabled", "headerDialogTogglePosition",
    "headerDialogLayout", "headerDialogMenuStyle", "headerDialogCenter", "headerDialogPushAfter",
    "headerOffcanvasMode", "headerOffcanvasFlip", "headerOffcanvasOverlay", "headerDialogDropbarAnimation",
    "headerSearchPosition", "headerSearchLayout", "headerSearchDropdownStretch", "headerSearchDropdownLarge", "headerSearchIconPosition",
    "headerSocialPosition", "headerSocialStyle", "headerSocialGap", "headerSocialItems", "headerLogoPaddingRemove",
    "headerMobileSearchLayout", "headerMobileSearchDropdownStretch", "headerMobileSearchDropdownLarge", "headerMobileSearchIconPosition",
    "headerMobileSocialPosition", "headerMobileSocialStyle", "headerMobileSocialGap", "headerMobileSocialItems", "headerMobileLogoPaddingRemove",
    "headerMobileDialogClose", "headerMobileDialogMenuStyle", "headerMobileDialogDropbarAnimation",
    "headerMobileLayout", "headerMobileBehavior", "headerMobileSearchPosition", "headerMobileDialogTogglePosition", "headerMobileDialogLayout",
    "headerMobileDialogCenter", "headerMobileDialogPushAfter", "headerMobileOffcanvasMode", "headerMobileOffcanvasFlip", "headerMobileOffcanvasOverlay",
    "headerMobileLogoUrl", "headerInverseLogoUrl", "headerMobileComposition",
  ].forEach((key) => delete providerGlobalStyles[key]);
  return {
    ...shellSettings,
    ...providerGlobalStyles,
  };
}
