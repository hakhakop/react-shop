import type {
  BuilderColumn,
  BuilderLayoutBlock,
  BuilderRow,
  BuilderSection,
  BuilderState,
} from "@/components/dashboard/builderTypes";
import type { BuilderThemeSettings } from "@/lib/builderThemeSettings";

export type YoothemeHeaderImportMode = "settings-only" | "replace-from-recipe";

export type YoothemeHeaderRecipe = {
  schemaVersion: 1;
  provider: "yootheme";
  desktopLayout: string;
  mobileLayout?: string;
  settings: Partial<BuilderSection>;
  rows: BuilderRow[];
  report: {
    mode: "recipe";
    createdRows: number;
    createdElements: string[];
    omitted: string[];
  };
};

const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};

const text = (value: unknown) => typeof value === "string" && value.trim()
  ? value.trim()
  : undefined;

function utility(
  id: string,
  kind: BuilderLayoutBlock["kind"],
  action: NonNullable<BuilderLayoutBlock["headerUtilityAction"]>,
): BuilderLayoutBlock {
  return { id, kind, headerUtilityAction: action, elementAlign: "right" };
}

function positioned(
  position: unknown,
  start: BuilderLayoutBlock[],
  end: BuilderLayoutBlock[],
  block: BuilderLayoutBlock | null,
) {
  if (!block) return;
  const normalized = text(position)?.toLowerCase();
  if (!normalized || normalized === "hide") return;
  (normalized.endsWith("start") ? start : end).push(block);
}

function column(id: string, headerSlot: BuilderColumn["headerSlot"], elements: BuilderLayoutBlock[]): BuilderColumn {
  return { id, headerSlot, elements };
}

/**
 * Compile the provider Header description into ordinary Builder rows, columns,
 * and elements. The semantic slots are metadata on those same columns; they do
 * not create a parallel Header builder.
 */
export function createYoothemeHeaderRecipe(theme: BuilderThemeSettings): YoothemeHeaderRecipe {
  const source = theme.sourceConfig;
  const header = record(source.header);
  const mobile = record(source.mobile);
  const mobileHeader = Object.keys(record(source.mobileHeader)).length
    ? record(source.mobileHeader)
    : record(mobile.header);
  const menuPositions = record(source.menuPositions);
  const navbarPosition = record(menuPositions.navbar);
  const logo = record(source.logo);
  const settings = { ...theme.resolved.headerDocument };
  const createdElements: string[] = [];
  const omitted: string[] = [];

  const logoImage = text(logo.image);
  const logoText = text(logo.text);
  const logoBlock: BuilderLayoutBlock | null = logoImage || logoText ? {
    id: "header-logo",
    kind: "image",
    ...(logoImage ? { imageUrl: logoImage } : {}),
    ...(text(logo.image_inverse) ? { imageInverseUrl: text(logo.image_inverse) } : {}),
    ...(text(logo.image_mobile) ? { imageMobileUrl: text(logo.image_mobile) } : {}),
    imageAlt: logoText || "Site logo",
    headerBrandMode: logoImage ? "logo" : "brand",
    ...(logoText ? { headerBrandText: logoText } : {}),
    elementAlign: "left",
  } : null;
  if (logoBlock) createdElements.push("logo"); else omitted.push("logo: no source logo");

  const hasNavigation = navbarPosition.menu !== undefined && navbarPosition.menu !== null && navbarPosition.menu !== "";
  const navigationBlock: BuilderLayoutBlock | null = hasNavigation ? {
    id: "header-navigation",
    kind: "menu",
    title: "Navigation",
    menuSource: "main",
    elementAlign: "center",
    ...(settings.headerDropbarEnabled !== undefined ? { menuDropbar: settings.headerDropbarEnabled } : {}),
    ...(settings.headerClickModeEnabled !== undefined ? { menuClickMode: settings.headerClickModeEnabled } : {}),
  } : null;
  if (navigationBlock) createdElements.push("navigation"); else omitted.push("navigation: no navbar menu position");
  for (const [position, rawPosition] of Object.entries(menuPositions)) {
    if (position === "navbar") continue;
    const menuId = record(rawPosition).menu;
    if (menuId !== undefined && menuId !== null && menuId !== "") {
      omitted.push(`${position} menu ${String(menuId)}: link the imported WordPress menu resource in WebPages`);
    }
  }

  const desktopStart: BuilderLayoutBlock[] = [];
  const desktopEnd: BuilderLayoutBlock[] = [];
  positioned(settings.headerSearchPosition, desktopStart, desktopEnd,
    settings.headerSearchPosition && settings.headerSearchPosition !== "hide"
      ? utility("header-search", "headerSearch", "search") : null);
  if (settings.headerDialogTogglePosition && settings.headerDialogTogglePosition !== "hide") {
    omitted.push("desktop dialog toggle: represented by Navigation behavior, not a duplicate utility element");
  }
  if (desktopStart.length || desktopEnd.length) createdElements.push("desktop utilities");

  const desktopLayout = text(header.layout)?.toLowerCase() || "horizontal-left";
  const desktopColumns = desktopLayout === "horizontal-right"
    ? [
        column("header-start", "header-start", desktopStart),
        column("header-navigation-slot", "navigation", navigationBlock ? [navigationBlock] : []),
        column("header-logo-slot", "logo", [...desktopEnd, ...(logoBlock ? [logoBlock] : [])]),
      ]
    : desktopLayout === "horizontal-center"
      ? [
          column("header-start", "header-start", desktopStart),
          column("header-logo-slot", "logo", logoBlock ? [logoBlock] : []),
          column("header-navigation-slot", "navigation", [...(navigationBlock ? [navigationBlock] : []), ...desktopEnd]),
        ]
      : [
          column("header-logo-slot", "logo", [...desktopStart, ...(logoBlock ? [logoBlock] : [])]),
          column("header-navigation-slot", "navigation", navigationBlock ? [navigationBlock] : []),
          column("header-end", "header-end", desktopEnd),
        ];

  const rows: BuilderRow[] = [{
    id: "header-main-row",
    headerVariant: "desktop",
    layout: "quarters-1-2-1",
    horizontalDistribution: "justify",
    columns: desktopColumns,
  }];

  const mobileLayout = text(mobileHeader.layout)?.toLowerCase();
  if (mobileLayout) {
    const mobileStart: BuilderLayoutBlock[] = [];
    const mobileEnd: BuilderLayoutBlock[] = [];
    const mobileLogo: BuilderLayoutBlock | null = logoBlock ? {
      ...logoBlock,
      id: "header-mobile-logo",
      imageUrl: text(logo.image_mobile) || logoImage,
    } : null;
    positioned(settings.headerMobileSearchPosition, mobileStart, mobileEnd,
      settings.headerMobileSearchPosition && settings.headerMobileSearchPosition !== "hide"
        ? utility("header-mobile-search", "headerSearch", "search") : null);
    if (settings.headerMobileDialogTogglePosition && settings.headerMobileDialogTogglePosition !== "hide") {
      omitted.push("mobile dialog toggle: supplied by the mobile Navigation element");
    }
    const mobileNavigation = navigationBlock ? {
      ...navigationBlock,
      id: "header-mobile-navigation",
      title: "Mobile navigation",
    } : null;
    rows.push({
      id: "header-mobile-row",
      headerVariant: "mobile",
      layout: "quarters-1-2-1",
      horizontalDistribution: "justify",
      columns: [
        column("header-mobile-start", "mobile-start", mobileStart),
        column("header-mobile-logo-slot", "mobile-logo", mobileLogo ? [mobileLogo] : []),
        column("header-mobile-end", "mobile-end", [
          ...(mobileNavigation ? [mobileNavigation] : []),
          ...mobileEnd,
        ]),
      ],
    });
    createdElements.push("mobile composition");
  }

  return {
    schemaVersion: 1,
    provider: "yootheme",
    desktopLayout,
    mobileLayout,
    settings,
    rows,
    report: { mode: "recipe", createdRows: rows.length, createdElements, omitted },
  };
}

const STRUCTURAL_KEYS = new Set<keyof BuilderSection>([
  "rows", "layoutItems", "layout", "layoutColumns", "headerPresetKey",
]);

export function applyYoothemeHeaderImport(
  current: BuilderState,
  theme: BuilderThemeSettings,
  mode: YoothemeHeaderImportMode,
): BuilderState {
  const currentSection = current.sections[0];
  if (!currentSection) return current;
  const recipe = createYoothemeHeaderRecipe(theme);
  const settings = Object.fromEntries(
    Object.entries(recipe.settings).filter(([key]) => !STRUCTURAL_KEYS.has(key as keyof BuilderSection)),
  ) as Partial<BuilderSection>;
  const nextSection: BuilderSection = mode === "replace-from-recipe"
    ? {
        ...currentSection,
        ...settings,
        headerArchitectureVersion: 2,
        headerPresetKey: undefined,
        layout: "header-row",
        layoutItems: undefined,
        rows: recipe.rows,
      }
    : {
        ...currentSection,
        ...settings,
        headerArchitectureVersion: 2,
        // Settings-only is deliberately non-structural.
        rows: currentSection.rows,
        layoutItems: currentSection.layoutItems,
        layout: currentSection.layout,
        layoutColumns: currentSection.layoutColumns,
        headerPresetKey: currentSection.headerPresetKey,
      };
  return {
    ...current,
    page: "header",
    targetType: "header",
    sections: [nextSection, ...current.sections.slice(1)],
  };
}
