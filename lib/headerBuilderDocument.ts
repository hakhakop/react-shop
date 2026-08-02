import {
  readBuilderLayoutStore,
  writeBuilderLayoutStore,
  type BuilderLayout,
  type BuilderDataScope,
} from "@/lib/builderLayouts";
import { getOrCreateBuilderDocumentLayout } from "@/lib/builderDocument";
import type { BuilderShellSettings } from "@/lib/builderShell";
import type { BuilderVisualStyle } from "@/lib/builderVisualStyle";
import type { TypographySettings, TypographyGroup } from "@/lib/builderTypography";
import { migrateLegacyHeaderDocument } from "@/lib/headerDocumentMigration";
export { migrateLegacyHeaderDocument } from "@/lib/headerDocumentMigration";

const headerActionKind = (action: string) => {
  if (action === "wishlist") return "headerWishlist";
  if (action === "cart") return "headerCart";
  if (action === "account") return "headerAccount";
  if (action === "theme") return "headerTheme";
  return "headerSearch";
};

export type HeaderBuilderElementType = "logo" | "navigation" | "button" | "spacer" | "utility" | "categories" | "language";

export type HeaderBuilderElement = {
  id: string;
  type: HeaderBuilderElementType;
  rowId?: string;
  columnId?: string;
  columnFlex?: number;
  label?: string;
  url?: string;
  loggedOutLabel?: string;
  loggedInLabel?: string;
  loggedOutUrl?: string;
  loggedInUrl?: string;
  previewState?: "auto" | "logged-out" | "logged-in";
  imageUrl?: string;
  imageAlt?: string;
  imageMaxWidth?: number;
  imageAlignment?: "left" | "center" | "right";
  elementAlign?: string;
  visualStyle?: BuilderVisualStyle;
  typography?: TypographySettings | TypographyGroup;
  menuItemGap?: string;
  menuHoverColor?: string;
  menuActiveColor?: string;
  menuActiveIndicator?: "princity" | "underline" | "none";
  headerBrandMode?: "logo" | "brand" | "both";
  headerBrandText?: string;
  buttonStyle?: string;
  buttonBg?: string;
  buttonTextColor?: string;
  buttonBorderRadius?: string;
  buttonBorderWidth?: string;
  buttonBorderColor?: string;
  buttonPaddingY?: string;
  buttonPaddingX?: string;
  buttonHoverBg?: string;
  buttonHoverTextColor?: string;
  buttonHoverBorderColor?: string;
  buttonHoverEffect?: "none" | "lift" | "grow" | "inherit";
  buttonHoverTransform?: string;
  buttonHoverBoxShadow?: string;
  utilityAction?: string;
  utilityVariant?: string;
  categoriesLabel?: string;
  categoriesShowLabel?: boolean;
  categoriesDisplay?: "icon" | "icon-label" | "label";
  categoriesIcon?: "menu" | "grid";
  categoriesIconPosition?: "left" | "right";
  categoriesDropdownAlign?: "left" | "right";
  categoriesShowAll?: boolean;
  categoriesShowCounts?: boolean;
  categoriesShowHierarchy?: boolean;
  languageDisplay?: "native" | "code";
};

export type HeaderRowComposition = {
  rowId: string;
  headerGap?: string;
  headerJustify?: "start" | "center" | "space-between" | "end";
  headerAlign?: "start" | "center" | "end" | "stretch";
  rowBackground?: string;
  rowColorScheme?: string;
  rowTopSpacing?: string;
  rowBottomSpacing?: string;
  rowTopMargin?: string;
  rowBottomMargin?: string;
  rowBorderRadius?: number;
  rowVisualStyle?: BuilderVisualStyle;
};

export type HeaderBuilderComposition = {
  elements: HeaderBuilderElement[];
  columns?: { id: string; rowId: string; flex: number }[];
  documentBackground?: string;
  documentVisualStyle?: BuilderVisualStyle;
  documentVisible?: boolean;
  documentTransparent?: boolean;
  documentOverlay?: boolean;
  documentHeight?: string;
  documentCustomHeight?: number;
  documentLayout?: BuilderShellSettings["headerLayout"];
  documentBehavior?: BuilderShellSettings["headerBehavior"];
  documentWidthMode?: BuilderShellSettings["headerWidthMode"];
  documentBackgroundMode?: BuilderShellSettings["headerBackgroundMode"];
  documentTextMode?: BuilderShellSettings["headerTextMode"];
  documentZIndex?: number;
  documentTopToolbarVisible?: boolean;
  documentTopToolbarText?: string;
  documentTopToolbarPhone?: string;
  documentTopToolbarMeta?: string;
  documentTopSpacing?: string;
  documentBottomSpacing?: string;
  documentTopMargin?: string;
  documentBottomMargin?: string;
  rows?: HeaderRowComposition[];
  rowVisualStyle?: BuilderVisualStyle;
  rowGap?: string;
  rowJustify?: "start" | "center" | "space-between" | "end";
  rowAlign?: "start" | "center" | "end" | "stretch";
};

export function createLegacyEquivalentHeaderLayout(
  settings: BuilderShellSettings,
  showLegacyButton: boolean,
): BuilderLayout {
  const leftBlocks = [
    {
      id: "header-logo",
      kind: "image" as const,
      imageUrl: settings.headerLogoUrl ?? undefined,
      imageAlt: settings.headerLogoAlt,
      imageMaxWidth: settings.headerLogoMaxWidth,
      headerBrandMode: settings.headerBrandMode,
      headerBrandText: settings.headerBrandText,
    },
  ];
  const centerBlocks = [
    {
      id: "header-navigation",
      kind: "menu" as const,
      title: "Navigation",
      menuSource: "main",
      menuActiveIndicator: settings.headerActiveIndicator,
    },
  ];
  const rightBlocks = [
    {
      id: "header-categories",
      kind: "headerCategories" as const,
      headerCategoriesLabel: "Categories",
      headerCategoriesShowLabel: true,
      headerCategoriesDisplay: "icon-label" as const,
      headerCategoriesIcon: "menu" as const,
      headerCategoriesIconPosition: "left" as const,
      headerCategoriesDropdownAlign: "left" as const,
      headerCategoriesShowAll: true,
      headerCategoriesShowCounts: true,
      headerCategoriesShowHierarchy: true,
    },
    ...(showLegacyButton
      ? [{
          id: "header-button",
          kind: "button" as const,
          buttonLabel: settings.headerButtonLabel || "Start",
          buttonUrl: settings.headerButtonUrl || "/client",
        }]
      : []),
    {
      id: "header-spacer",
      kind: "embed" as const,
      embedMode: "code" as const,
      embedCode: "",
    },
    ...settings.headerIconOrder.map((action) => ({
      id: `header-utility-${action}`,
      kind: headerActionKind(action),
      headerUtilityAction: action,
      headerUtilityVariant: settings.headerIconVariant,
    })),
    {
      id: "header-language",
      kind: "headerLanguage" as const,
      headerLanguageDisplay: "native" as const,
    },
  ];
  const blocks: NonNullable<BuilderLayout["sections"]>[number]["layoutItems"] = [
    {
      id: "header-main-left",
      rowId: "header-main-row",
      rowLayout: "quarters-1-2-1",
      blocks: leftBlocks,
    },
    {
      id: "header-main-center",
      rowId: "header-main-row",
      rowLayout: "quarters-1-2-1",
      blocks: centerBlocks,
    },
    {
      id: "header-main-right",
      rowId: "header-main-row",
      rowLayout: "quarters-1-2-1",
      blocks: rightBlocks,
    },
  ];

  return {
    version: 1,
    key: "header",
    page: "header",
    targetType: "header",
    design: {},
    sections: [{
      id: "header-document",
      kind: "contentLayout",
      title: "Header",
      headerUtilityMigrationVersion: 3,
      headerVisible: settings.headerVisible,
      headerTransparent: settings.headerTransparent,
      headerOverlay: settings.headerOverlay,
      headerHeight: settings.headerHeight,
      headerCustomHeight: settings.headerCustomHeight,
      headerArchitectureVersion: 2,
      headerLayout: settings.headerLayout,
      headerBehavior: settings.headerBehavior,
      headerWidthMode: settings.headerWidthMode,
      headerBackgroundMode: settings.headerBackgroundMode,
      headerTextMode: settings.headerTextMode,
      headerZIndex: settings.headerZIndex,
      headerTopToolbarVisible: settings.topToolbarVisible,
      headerTopToolbarText: settings.topToolbarText,
      headerTopToolbarPhone: settings.topToolbarPhone,
      headerTopToolbarMeta: settings.topToolbarMeta,
      background: "transparent",
      backgroundMode: "full",
      contentMode: "boxed",
      colorScheme: "inherit",
      layout: "header-row",
      layoutColumns: 3,
      layoutItems: blocks,
      visible: true,
    }],
    updatedAt: new Date().toISOString(),
  };
}

export async function getOrCreateHeaderBuilderLayout(
  settings: BuilderShellSettings,
  scope: BuilderDataScope,
  showLegacyButton: boolean,
) {
  const layout = await getOrCreateBuilderDocumentLayout({
    key: "header",
    scope,
    create: () => createLegacyEquivalentHeaderLayout(settings, showLegacyButton),
  });
  const migrated = migrateLegacyHeaderDocument(layout, settings);
  if (layout.sections[0]?.headerArchitectureVersion !== 2) {
    const store = await readBuilderLayoutStore(scope);
    store.header = migrated;
    await writeBuilderLayoutStore(store, scope);
  }
  return migrated;
}

/** @deprecated Use migrateLegacyHeaderDocument. Kept for external compatibility only. */
export const syncHeaderDocumentWithShellSettings = migrateLegacyHeaderDocument;
