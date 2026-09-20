import {
  mutateBuilderLayoutStore,
  readBuilderLayoutStore,
  type BuilderLayout,
  type BuilderLayoutBlock,
  type BuilderDataScope,
} from "@/lib/builderLayouts";
import { getOrCreateBuilderDocumentLayout } from "@/lib/builderDocument";
import type { BuilderShellSettings } from "@/lib/builderShell";
import type { BuilderVisualStyle } from "@/lib/builderVisualStyle";
import type {
  TypographySettings,
  TypographyGroup,
} from "@/lib/builderTypography";
import type {
  BuilderRow,
  BuilderSection,
} from "@/components/dashboard/builderTypes";
import { migrateLegacyHeaderDocument } from "@/lib/headerDocumentMigration";
import { normalizeBuilderSectionLayout } from "@/lib/builderSectionLayout";
import {
  headerBuilderDocumentSectionId,
  type HeaderBuilderDocumentKey,
} from "@/lib/headerBuilderDocumentKeys";
export { migrateLegacyHeaderDocument } from "@/lib/headerDocumentMigration";

const headerActionKind = (action: string) => {
  if (action === "wishlist") return "headerWishlist";
  if (action === "cart") return "headerCart";
  if (action === "account") return "headerAccount";
  if (action === "theme") return "headerTheme";
  return "headerSearch";
};

export type HeaderBuilderElementType =
  | "logo"
  | "navigation"
  | "button"
  | "spacer"
  | "utility"
  | "social"
  | "categories"
  | "language";

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
  imageInverseUrl?: string | null;
  imageMobileUrl?: string | null;
  imageAlt?: string;
  imageMaxWidth?: number;
  imageWidth?: string;
  imageHeight?: string | number;
  imageFit?: "contain" | "cover" | "fill" | string;
  imageRatio?: string;
  imageShape?: string;
  imageBorder?: string;
  imageShadow?: string;
  imageBoxShadow?: string;
  imageSvgInline?: boolean;
  imageSvgColor?: string;
  imagePosition?: string;
  imageLoading?: "lazy" | "eager";
  imageAlignment?: "left" | "center" | "right";
  elementAlign?: string;
  visualStyle?: BuilderVisualStyle;
  typography?: TypographySettings | TypographyGroup;
  menuItemGap?: string;
  menuSource?: string;
  menuHoverColor?: string;
  menuActiveColor?: string;
  menuActiveIndicator?: "princity" | "underline" | "none";
  menuHoverVariant?: "none" | "line" | "glow" | "line-glow";
  menuHoverLine?: "none" | "top" | "bottom" | "left" | "right";
  menuDropdownIndicator?: "none" | "chevron";
  menuDividerMode?: "none" | "partial" | "all";
  menuColumns?: number;
  menuMegaWidth?: string;
  menuDropbar?: boolean;
  menuClickMode?: boolean;
  menuShowParentIcon?: boolean;
  headerNavigationOverrides?: {
    gap?: boolean;
    hoverColor?: boolean;
    activeColor?: boolean;
    indicator?: boolean;
    hoverVariant?: boolean;
    hoverLine?: boolean;
    dropdownIndicator?: boolean;
    divider?: boolean;
    typography?: boolean;
  };
  headerBrandMode?: "logo" | "brand" | "both";
  headerBrandText?: string;
  buttonStyle?: string;
  size?: string;
  fullWidthButton?: boolean;
  buttonTarget?: string;
  buttonGap?: string;
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
  headerButtonOverrides?: {
    variant?: boolean;
    size?: boolean;
    width?: boolean;
    background?: boolean;
    text?: boolean;
    border?: boolean;
    radius?: boolean;
    padding?: boolean;
    typography?: boolean;
    hoverBackground?: boolean;
    hoverText?: boolean;
    hoverBorder?: boolean;
    hoverEffect?: boolean;
  };
  utilityAction?: string;
  utilityVariant?: string;
  socialItems?: Array<{ link: string }>;
  socialStyle?: boolean;
  socialGap?: string;
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
  role?: "toolbar";
  headerVariant?: "desktop" | "mobile" | "mobile-dialog";
  maxWidth?: BuilderRow["maxWidth"];
  removeHorizontalPadding?: boolean;
  horizontalDistribution?: BuilderRow["horizontalDistribution"];
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
  /** Persistent document identity, used by Builder interaction targets. */
  documentKey?: HeaderBuilderDocumentKey;
  documentSectionId?: string;
  documentVariant?: "desktop" | "mobile" | "dialog";
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
  documentBreakpoint?: string;
  documentMobileBreakpoint?: string;
  documentMobileLayout?: BuilderSection["headerMobileLayout"];
  documentMobileBehavior?: BuilderSection["headerMobileBehavior"];
  documentMobileSearchPosition?: string;
  documentMobileSearchLayout?: string;
  documentMobileSearchDropdownStretch?: string;
  documentMobileSearchDropdownLarge?: boolean;
  documentMobileSearchIconPosition?: "" | "left" | "right";
  documentMobileSearchExpand?: boolean;
  documentMobileSearchPreventSubmit?: boolean;
  documentMobileSearchDropbarAnimation?: string;
  documentMobileSearchDropbarRemoveHorizontalPadding?: boolean;
  documentMobileSocialPosition?: string;
  documentMobileSocialStyle?: boolean;
  documentMobileSocialGap?: string;
  documentMobileSocialItems?: Array<{ link: string }>;
  documentMobileLogoPaddingRemove?: boolean;
  documentMobileDialogTogglePosition?: string;
  documentMobileDialogLayout?: string;
  documentMobileDialogClose?: boolean;
  documentMobileDialogMenuStyle?: string;
  documentMobileDialogCenter?: boolean;
  documentMobileDialogPushAfter?: number;
  documentMobileOffcanvasMode?: string;
  documentMobileOffcanvasFlip?: boolean;
  documentMobileOffcanvasOverlay?: boolean;
  documentMobileDialogDropbarAnimation?: string;
  documentStickyShowOnUp?: boolean;
  documentStickyAnimation?: string;
  documentDropdownAlign?: "left" | "right" | "center";
  documentDropdownAlignToNavbar?: boolean;
  documentDropbarEnabled?: boolean;
  documentParentIconEnabled?: boolean;
  documentClickModeEnabled?: boolean;
  documentDialogTogglePosition?: string;
  documentDialogLayout?: string;
  documentDialogClose?: boolean;
  documentDialogMenuStyle?: string;
  documentDialogCenter?: boolean;
  documentDialogPushAfter?: number;
  documentOffcanvasMode?: string;
  documentOffcanvasFlip?: boolean;
  documentOffcanvasOverlay?: boolean;
  documentDialogDropbarAnimation?: string;
  documentSearchPosition?: string;
  documentSearchLayout?: string;
  documentSearchDropdownStretch?: string;
  documentSearchDropdownLarge?: boolean;
  documentSearchIconPosition?: "" | "left" | "right";
  documentSearchExpand?: boolean;
  documentSearchPreventSubmit?: boolean;
  documentSearchDropbarAnimation?: string;
  documentSearchDropbarRemoveHorizontalPadding?: boolean;
  documentSocialPosition?: string;
  documentSocialStyle?: boolean;
  documentSocialGap?: string;
  documentSocialItems?: Array<{ link: string }>;
  documentLogoPaddingRemove?: boolean;
  documentMobileLogoUrl?: string | null;
  documentInverseLogoUrl?: string | null;
  documentMobileComposition?: "separate" | "responsive";
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
      ? [
          {
            id: "header-button",
            kind: "button" as const,
            buttonLabel: settings.headerButtonLabel || "Start",
            buttonUrl: settings.headerButtonUrl || "/client",
          },
        ]
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
  const blocks: NonNullable<BuilderLayout["sections"]>[number]["layoutItems"] =
    [
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
    sections: [
      {
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
      },
    ],
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
    create: () =>
      createLegacyEquivalentHeaderLayout(settings, showLegacyButton),
  });
  const migrated = migrateLegacyHeaderDocument(layout, settings);
  if (layout.sections[0]?.headerArchitectureVersion !== 2) {
    return mutateBuilderLayoutStore((store) => {
      const current = store.header ?? layout;
      if (current.sections[0]?.headerArchitectureVersion === 2) return current;
      const latestMigration = migrateLegacyHeaderDocument(current, settings);
      store.header = latestMigration;
      return latestMigration;
    }, scope);
  }
  return migrated;
}

export type HeaderBuilderDocuments = {
  desktop: BuilderLayout;
  /**
   * The mobile workspace is one persisted document. Its first root is the
   * mobile bar and its second root is the mobile-menu dialog.
   */
  mobile: BuilderLayout | null;
  /**
   * Compatibility projection for callers which still ask for the old drawer
   * document key. It is derived from `mobile` when the embedded dialog exists.
   */
  dialog: BuilderLayout | null;
};

export type HeaderMobileDocumentSections = {
  header: BuilderSection | null;
  dialog: BuilderSection | null;
};

function headerSection(layout: BuilderLayout | null | undefined) {
  return layout?.sections[0];
}

function isMobileDialogSection(section: BuilderSection) {
  return (
    section.id === headerBuilderDocumentSectionId("header-mobile-dialog") ||
    section.headerDocumentVariant === "dialog"
  );
}

function isMobileHeaderSection(section: BuilderSection) {
  return (
    section.id === headerBuilderDocumentSectionId("header-mobile") ||
    section.headerDocumentVariant === "mobile"
  );
}

/**
 * Resolve the two roots of the unified Mobile Header workspace. A legacy
 * one-root mobile layout continues to resolve as the bar until it is migrated.
 */
export function getHeaderMobileDocumentSections(
  layout: Pick<BuilderLayout, "sections"> | null | undefined,
): HeaderMobileDocumentSections {
  const sections = layout?.sections ?? [];
  const dialog = sections.find(isMobileDialogSection) ?? null;
  const header =
    sections.find(isMobileHeaderSection) ??
    sections.find((section) => section !== dialog) ??
    null;
  return { header, dialog };
}

export function getHeaderMobileDialogSection(
  layout: Pick<BuilderLayout, "sections"> | null | undefined,
) {
  return getHeaderMobileDocumentSections(layout).dialog;
}

/**
 * Reconcile obsolete `layoutItems` into canonical rows once. Rows remain the
 * rendering and editing authority; matching canonical blocks always win.
 */
export function reconcileHeaderSectionRows(
  section: BuilderSection,
): BuilderSection {
  const cloned = structuredClone(section);
  if (!cloned.rows?.length) {
    return {
      ...cloned,
      rows: structuredClone(normalizeBuilderSectionLayout(cloned).rows),
      layoutItems: undefined,
    };
  }

  const legacyByColumnId = new Map(
    (cloned.layoutItems ?? [])
      .filter((item) => Boolean(item.id))
      .map((item) => [item.id!, item]),
  );
  const canonicalColumnIds = new Set<string>();
  const rows = cloned.rows.map((row) => ({
    ...row,
    columns: row.columns.map((column) => {
      canonicalColumnIds.add(column.id);
      const legacy = legacyByColumnId.get(column.id);
      if (!legacy?.blocks?.length) return column;
      const canonicalBlockIds = new Set(
        column.elements.map((block) => block.id).filter(Boolean),
      );
      const recovered = legacy.blocks.filter(
        (block) => Boolean(block.id) && !canonicalBlockIds.has(block.id),
      );
      return recovered.length
        ? {
            ...column,
            elements: [...column.elements, ...structuredClone(recovered)],
          }
        : column;
    }),
  }));

  // A few early drafts have an additional legacy column with no canonical
  // counterpart. Preserve it in its own canonical row rather than dropping
  // authored content when we remove the obsolete parallel structure.
  for (const item of cloned.layoutItems ?? []) {
    if (!item.id || canonicalColumnIds.has(item.id)) continue;
    const column = {
      id: item.id,
      elements: structuredClone(item.blocks ?? []),
    };
    const rowIndex = rows.findIndex((row) => row.id === item.rowId);
    if (rowIndex >= 0) {
      rows[rowIndex] = {
        ...rows[rowIndex]!,
        columns: [...rows[rowIndex]!.columns, column],
      };
      continue;
    }
    rows.push({
      id: item.rowId ?? `${cloned.id}-recovered-row-${rows.length + 1}`,
      layout: item.rowLayout ?? cloned.layout ?? "whole",
      columns: [column],
    });
  }

  return { ...cloned, rows, layoutItems: undefined };
}

function copyMobileHeaderBlocks(source: BuilderSection) {
  return structuredClone(source.layoutItems ?? []).map((item) => ({
    ...item,
    rowId:
      item.rowId?.replace("header-main", "header-mobile") ??
      "header-mobile-row",
    blocks: (item.blocks ?? []).map((block) => {
      if (block.id === "header-logo" || block.kind === "image") {
        return {
          ...block,
          id: block.id === "header-logo" ? "header-mobile-logo" : block.id,
          imageUrl:
            (block as BuilderLayoutBlock).imageMobileUrl ?? block.imageUrl,
        };
      }
      if (block.id === "header-navigation" || block.kind === "menu") {
        return {
          ...block,
          id:
            block.id === "header-navigation"
              ? "header-mobile-navigation"
              : block.id,
          title: "Mobile navigation",
        };
      }
      return block;
    }),
  }));
}

function copyMobileHeaderRows(
  source: BuilderSection,
): BuilderRow[] | undefined {
  if (!source.rows?.length) return undefined;
  // In the combined legacy document, unmarked rows are shared by desktop and
  // mobile. Preserve those alongside explicit mobile rows; otherwise a
  // toolbar/logo row silently disappears during the one-time split.
  const sourceRows = source.rows.filter(
    (row) => !row.headerVariant || row.headerVariant === "mobile",
  );
  return structuredClone(sourceRows).map((row) => ({
    ...row,
    id: row.id.replace("header-main", "header-mobile"),
    // The mobile document owns its rows outright. Do not retain the desktop
    // variant marker from a prior combined Header document.
    headerVariant: undefined,
    columns: row.columns.map((column) => ({
      ...column,
      id: column.id?.replace("header-main", "header-mobile"),
      elements: column.elements.map((block) => {
        if (block.id === "header-logo" || block.kind === "image") {
          return {
            ...block,
            id: block.id === "header-logo" ? "header-mobile-logo" : block.id,
            imageUrl:
              (block as BuilderLayoutBlock).imageMobileUrl ?? block.imageUrl,
          };
        }
        if (block.id === "header-navigation" || block.kind === "menu") {
          return {
            ...block,
            id:
              block.id === "header-navigation"
                ? "header-mobile-navigation"
                : block.id,
            title: "Mobile navigation",
          };
        }
        return block;
      }),
    })),
  }));
}

function normalizeMobileHeaderSection(section: BuilderSection): BuilderSection {
  const reconciled = reconcileHeaderSectionRows(section);
  return {
    ...reconciled,
    id: headerBuilderDocumentSectionId("header-mobile"),
    title: reconciled.title || "Mobile Header",
    headerDocumentVariant: "mobile",
    headerArchitectureVersion: 2,
    headerMobileComposition: "separate",
    rows: reconciled.rows?.map((row) => ({ ...row, headerVariant: undefined })),
  };
}

function createMobileHeaderSection(
  desktop: BuilderLayout,
  settings: BuilderShellSettings,
): BuilderSection {
  const source =
    headerSection(desktop) ??
    createLegacyEquivalentHeaderLayout(settings, false).sections[0]!;
  const mobileRows = copyMobileHeaderRows(source);
  return normalizeMobileHeaderSection({
    ...structuredClone(source),
    id: headerBuilderDocumentSectionId("header-mobile"),
    title: "Mobile Header",
    headerDocumentVariant: "mobile",
    headerArchitectureVersion: 2,
    headerBehavior:
      source.headerMobileBehavior ??
      source.headerBehavior ??
      settings.headerBehavior,
    headerBreakpoint: source.headerMobileBreakpoint ?? source.headerBreakpoint,
    headerSearchPosition:
      source.headerMobileSearchPosition ?? source.headerSearchPosition,
    headerSearchLayout:
      source.headerMobileSearchLayout ?? source.headerSearchLayout,
    headerSearchDropdownStretch:
      source.headerMobileSearchDropdownStretch ??
      source.headerSearchDropdownStretch,
    headerSearchDropdownLarge:
      source.headerMobileSearchDropdownLarge ??
      source.headerSearchDropdownLarge,
    headerSearchIconPosition:
      source.headerMobileSearchIconPosition ?? source.headerSearchIconPosition,
    headerSearchExpand:
      source.headerMobileSearchExpand ?? source.headerSearchExpand,
    headerSearchPreventSubmit:
      source.headerMobileSearchPreventSubmit ??
      source.headerSearchPreventSubmit,
    headerSearchDropbarAnimation:
      source.headerMobileSearchDropbarAnimation ??
      source.headerSearchDropbarAnimation,
    headerSearchDropbarRemoveHorizontalPadding:
      source.headerMobileSearchDropbarRemoveHorizontalPadding ??
      source.headerSearchDropbarRemoveHorizontalPadding,
    headerSocialPosition:
      source.headerMobileSocialPosition ?? source.headerSocialPosition,
    headerSocialStyle:
      source.headerMobileSocialStyle ?? source.headerSocialStyle,
    headerSocialGap: source.headerMobileSocialGap ?? source.headerSocialGap,
    headerSocialItems:
      source.headerMobileSocialItems ?? source.headerSocialItems,
    headerLogoPaddingRemove:
      source.headerMobileLogoPaddingRemove ?? source.headerLogoPaddingRemove,
    headerDialogTogglePosition:
      source.headerMobileDialogTogglePosition ??
      source.headerDialogTogglePosition,
    headerDialogLayout:
      source.headerMobileDialogLayout ?? source.headerDialogLayout,
    headerDialogClose:
      source.headerMobileDialogClose ?? source.headerDialogClose,
    headerDialogMenuStyle:
      source.headerMobileDialogMenuStyle ?? source.headerDialogMenuStyle,
    headerDialogCenter:
      source.headerMobileDialogCenter ?? source.headerDialogCenter,
    headerDialogPushAfter:
      source.headerMobileDialogPushAfter ?? source.headerDialogPushAfter,
    headerOffcanvasMode:
      source.headerMobileOffcanvasMode ?? source.headerOffcanvasMode,
    headerOffcanvasFlip:
      source.headerMobileOffcanvasFlip ?? source.headerOffcanvasFlip,
    headerOffcanvasOverlay:
      source.headerMobileOffcanvasOverlay ?? source.headerOffcanvasOverlay,
    headerDialogDropbarAnimation:
      source.headerMobileDialogDropbarAnimation ??
      source.headerDialogDropbarAnimation,
    headerMobileComposition: "separate",
    ...(mobileRows
      ? { rows: mobileRows, layoutItems: undefined }
      : { rows: undefined, layoutItems: copyMobileHeaderBlocks(source) }),
  });
}

function findPrimaryMenuSource(
  section: BuilderSection | undefined,
): string | undefined {
  if (!section) return undefined;
  for (const row of section.rows ?? []) {
    for (const column of row.columns) {
      for (const block of column.elements) {
        if (
          (block.id === "header-mobile-navigation" ||
            block.id === "header-navigation" ||
            block.kind === "menu") &&
          block.menuSource
        ) {
          return block.menuSource;
        }
      }
    }
  }
  for (const item of section.layoutItems ?? []) {
    for (const block of item.blocks ?? []) {
      if (
        (block.id === "header-mobile-navigation" ||
          block.id === "header-navigation" ||
          block.kind === "menu") &&
        block.menuSource
      ) {
        return block.menuSource;
      }
    }
  }
  return undefined;
}

function normalizeMobileDialogSection(section: BuilderSection): BuilderSection {
  const reconciled = reconcileHeaderSectionRows(section);
  return {
    ...reconciled,
    id: headerBuilderDocumentSectionId("header-mobile-dialog"),
    title: reconciled.title || "Mobile Menu Dialog",
    headerDocumentVariant: "dialog",
    headerArchitectureVersion: 2,
    rows: reconciled.rows?.map((row) => ({ ...row, headerVariant: undefined })),
  };
}

function createMobileDialogSection(
  desktop: BuilderLayout,
  mobileSection: BuilderSection,
  settings: BuilderShellSettings,
): BuilderSection {
  const desktopSource = headerSection(desktop);
  const source =
    desktopSource ??
    mobileSection ??
    createLegacyEquivalentHeaderLayout(settings, false).sections[0]!;
  const dialogRows = desktopSource?.rows?.filter(
    (row) => row.headerVariant === "mobile-dialog",
  );
  const menuSource =
    findPrimaryMenuSource(desktopSource) ??
    findPrimaryMenuSource(mobileSection) ??
    findPrimaryMenuSource(source) ??
    "main";
  return normalizeMobileDialogSection({
    id: headerBuilderDocumentSectionId("header-mobile-dialog"),
    kind: "contentLayout",
    title: "Mobile Menu Dialog",
    headerDocumentVariant: "dialog",
    headerArchitectureVersion: 2,
    headerVisible: true,
    headerBehavior: "static",
    headerWidthMode: "full",
    headerBackgroundMode: "default",
    headerTextMode: "auto",
    headerZIndex:
      mobileSection.headerZIndex ??
      source.headerZIndex ??
      settings.headerZIndex,
    // Dialog presentation belongs to this root. For a legacy combined Header,
    // seed it from its former mobile-dialog settings exactly once.
    headerDialogLayout:
      desktopSource?.headerMobileDialogLayout ??
      mobileSection.headerDialogLayout ??
      source.headerDialogLayout,
    headerDialogClose:
      desktopSource?.headerMobileDialogClose ??
      mobileSection.headerDialogClose ??
      source.headerDialogClose,
    headerDialogMenuStyle:
      desktopSource?.headerMobileDialogMenuStyle ??
      mobileSection.headerDialogMenuStyle ??
      source.headerDialogMenuStyle,
    headerDialogCenter:
      desktopSource?.headerMobileDialogCenter ??
      mobileSection.headerDialogCenter ??
      source.headerDialogCenter,
    headerDialogPushAfter:
      desktopSource?.headerMobileDialogPushAfter ??
      mobileSection.headerDialogPushAfter ??
      source.headerDialogPushAfter,
    headerOffcanvasMode:
      desktopSource?.headerMobileOffcanvasMode ??
      mobileSection.headerOffcanvasMode ??
      source.headerOffcanvasMode,
    headerOffcanvasFlip:
      desktopSource?.headerMobileOffcanvasFlip ??
      mobileSection.headerOffcanvasFlip ??
      source.headerOffcanvasFlip,
    headerOffcanvasOverlay:
      desktopSource?.headerMobileOffcanvasOverlay ??
      mobileSection.headerOffcanvasOverlay ??
      source.headerOffcanvasOverlay,
    headerDialogDropbarAnimation:
      desktopSource?.headerMobileDialogDropbarAnimation ??
      mobileSection.headerDialogDropbarAnimation ??
      source.headerDialogDropbarAnimation,
    background: source.background ?? "transparent",
    backgroundMode: "full",
    contentMode: "boxed",
    colorScheme: "inherit",
    layout: "header-row",
    layoutColumns: 1,
    ...(dialogRows?.length
      ? {
          rows: structuredClone(dialogRows).map((row) => ({
            ...row,
            headerVariant: undefined,
          })),
          layoutItems: undefined,
        }
      : {
          rows: [
            {
              id: "header-mobile-dialog-row",
              layout: "whole",
              columns: [
                {
                  id: "header-mobile-dialog-content",
                  elements: [
                    {
                      id: "header-mobile-dialog-navigation",
                      kind: "menu",
                      title: "Mobile menu",
                      menuSource,
                    },
                  ],
                },
              ],
            },
          ],
          layoutItems: undefined,
        }),
    visible: true,
  });
}

function createMobileHeaderBuilderLayout(
  desktop: BuilderLayout,
  settings: BuilderShellSettings,
): BuilderLayout {
  const mobileSection = createMobileHeaderSection(desktop, settings);
  const dialogSection = createMobileDialogSection(
    desktop,
    mobileSection,
    settings,
  );
  return {
    version: 1,
    key: "header-mobile",
    page: "header-mobile",
    targetType: "header",
    displayName: "Mobile Header",
    design: structuredClone(desktop.design ?? {}),
    sections: [mobileSection, dialogSection],
    updatedAt: new Date().toISOString(),
  };
}

function legacyDialogSection(layout: BuilderLayout | null | undefined) {
  if (!layout) return null;
  return getHeaderMobileDialogSection(layout) ?? layout.sections[0] ?? null;
}

function migrateMobileHeaderBuilderLayout(
  current: BuilderLayout | undefined,
  desktop: BuilderLayout,
  legacyDialog: BuilderLayout | undefined,
  settings: BuilderShellSettings,
): BuilderLayout {
  if (!current) return createMobileHeaderBuilderLayout(desktop, settings);

  const roots = getHeaderMobileDocumentSections(current);
  const mobileSection = roots.header
    ? normalizeMobileHeaderSection(roots.header)
    : createMobileHeaderSection(desktop, settings);
  const dialogSource = roots.dialog ?? legacyDialogSection(legacyDialog);
  const dialogSection = dialogSource
    ? normalizeMobileDialogSection(dialogSource)
    : createMobileDialogSection(desktop, mobileSection, settings);
  const extras = current.sections
    .filter((section) => section !== roots.header && section !== roots.dialog)
    .map((section) => structuredClone(section));

  return {
    ...structuredClone(current),
    key: "header-mobile",
    page: "header-mobile",
    targetType: "header",
    displayName: current.displayName ?? "Mobile Header",
    design: structuredClone(current.design ?? desktop.design ?? {}),
    // Keep the bar and dialog roots first. Existing non-header roots are
    // preserved after them for forward-compatible authored content.
    sections: [mobileSection, dialogSection, ...extras],
  };
}

/**
 * Project the embedded drawer root through the historical standalone key for
 * read compatibility. The returned layout is not a second persistence owner.
 */
export function createMobileDialogCompatibilityLayout(
  mobile: BuilderLayout | null | undefined,
): BuilderLayout | null {
  const dialog = getHeaderMobileDialogSection(mobile);
  if (!mobile || !dialog) return null;
  return {
    version: mobile.version,
    key: "header-mobile-dialog",
    page: "header-mobile-dialog",
    targetType: "header",
    displayName: "Mobile Menu Dialog",
    design: structuredClone(mobile.design ?? {}),
    sections: [structuredClone(dialog)],
    updatedAt: mobile.updatedAt,
  };
}

/**
 * Read Header documents without creating migration state. An older standalone
 * drawer remains available until an explicit Mobile Header Builder action.
 */
export async function getHeaderBuilderDocuments(
  settings: BuilderShellSettings,
  scope: BuilderDataScope,
  showLegacyButton: boolean,
): Promise<HeaderBuilderDocuments> {
  const desktop = await getOrCreateHeaderBuilderLayout(
    settings,
    scope,
    showLegacyButton,
  );
  const store = await readBuilderLayoutStore(scope);
  const mobile = store["header-mobile"] ?? null;
  return {
    desktop,
    mobile,
    dialog:
      createMobileDialogCompatibilityLayout(mobile) ??
      store["header-mobile-dialog"] ??
      null,
  };
}

/**
 * Materialize the unified mobile workspace after an explicit Builder/import
 * action. The old standalone drawer is read as a migration source only and is
 * deliberately left in the store for compatibility with older clients.
 */
export async function ensureHeaderBuilderDocuments(
  settings: BuilderShellSettings,
  scope: BuilderDataScope,
  showLegacyButton: boolean,
): Promise<HeaderBuilderDocuments> {
  const desktop = await getOrCreateHeaderBuilderLayout(
    settings,
    scope,
    showLegacyButton,
  );
  return mutateBuilderLayoutStore((store) => {
    const currentDesktop = store.header ?? desktop;
    const mobile = migrateMobileHeaderBuilderLayout(
      store["header-mobile"],
      currentDesktop,
      store["header-mobile-dialog"],
      settings,
    );
    store["header-mobile"] = mobile;
    return {
      desktop: currentDesktop,
      mobile,
      dialog: createMobileDialogCompatibilityLayout(mobile),
    };
  }, scope);
}

export function isHeaderBuilderLayoutKey(
  key: string,
): key is HeaderBuilderDocumentKey {
  return (
    key === "header" ||
    key === "header-mobile" ||
    key === "header-mobile-dialog"
  );
}

/** @deprecated Use migrateLegacyHeaderDocument. Kept for external compatibility only. */
export const syncHeaderDocumentWithShellSettings = migrateLegacyHeaderDocument;
