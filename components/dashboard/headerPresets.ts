import type { BuilderSection } from "./builderTypes";
import { resolveHeaderElementAlignment } from "@/lib/headerElementAlignment";

export type HeaderPreset = {
  key: string;
  name: string;
  description: string;
  headerLayout: "simple" | "two-row" | "hero" | "pill" | "princity" | "wordpress";
  headerTransparent: boolean;
  headerOverlay: boolean;
  headerWidthMode: "boxed" | "full";
  sections: BuilderSection[];
};

const allHeaderPresets: HeaderPreset[] = [
  {
    key: "minimal",
    name: "Minimal",
    description: "Clean single-row layout with logo, main navigation, and essential actions.",
    headerLayout: "simple",
    headerTransparent: false,
    headerOverlay: false,
    headerWidthMode: "boxed",
    sections: [
      {
        id: "header-document",
        kind: "contentLayout",
        title: "Header",
        headerUtilityMigrationVersion: 3,
        background: "transparent",
        backgroundMode: "full",
        contentMode: "boxed",
        colorScheme: "inherit",
        layout: "header-row",
        layoutColumns: 3,
        layoutItems: [
          {
            id: "header-main-left",
            rowId: "header-main-row",
            rowLayout: "quarters-1-2-1",
            blocks: [
              {
                id: "header-logo",
                kind: "image",
                headerBrandMode: "logo",
                headerBrandText: "WebPages",
                imageMaxWidth: 140,
              },
            ],
          },
          {
            id: "header-main-center",
            rowId: "header-main-row",
            rowLayout: "quarters-1-2-1",
            blocks: [
              {
                id: "header-navigation",
                kind: "menu",
                title: "Navigation",
                menuSource: "main",
                menuActiveIndicator: "underline",
              },
            ],
          },
          {
            id: "header-main-right",
            rowId: "header-main-row",
            rowLayout: "quarters-1-2-1",
            blocks: [
              {
                id: "header-utility-search",
                kind: "headerSearch",
                headerUtilityAction: "search",
                headerUtilityVariant: "muted",
              },
              {
                id: "header-utility-cart",
                kind: "headerCart",
                headerUtilityAction: "cart",
                headerUtilityVariant: "muted",
              },
            ],
          },
        ],
        visible: true,
      },
    ],
  },
  {
    key: "business",
    name: "Business",
    description: "Professional header with a top support bar and a prominent Call-to-Action button in the main row.",
    headerLayout: "two-row",
    headerTransparent: false,
    headerOverlay: false,
    headerWidthMode: "boxed",
    sections: [
      {
        id: "header-document",
        kind: "contentLayout",
        title: "Header",
        headerUtilityMigrationVersion: 3,
        background: "transparent",
        backgroundMode: "full",
        contentMode: "boxed",
        colorScheme: "inherit",
        layout: "header-row",
        layoutColumns: 3,
        layoutItems: [
          {
            id: "header-top-left",
            rowId: "header-top-row",
            rowLayout: "halves",
            blocks: [
              {
                id: "header-language",
                kind: "headerLanguage",
                headerLanguageDisplay: "native",
              },
            ],
          },
          {
            id: "header-top-right",
            rowId: "header-top-row",
            rowLayout: "halves",
            blocks: [
              {
                id: "header-utility-account",
                kind: "headerAccount",
                headerUtilityAction: "account",
                headerUtilityVariant: "muted",
              },
              {
                id: "header-utility-search",
                kind: "headerSearch",
                headerUtilityAction: "search",
                headerUtilityVariant: "muted",
              },
            ],
          },
          {
            id: "header-main-left",
            rowId: "header-main-row",
            rowLayout: "quarters-1-2-1",
            blocks: [
              {
                id: "header-logo",
                kind: "image",
                headerBrandMode: "logo",
                headerBrandText: "WebPages",
                imageMaxWidth: 140,
              },
            ],
          },
          {
            id: "header-main-center",
            rowId: "header-main-row",
            rowLayout: "quarters-1-2-1",
            blocks: [
              {
                id: "header-navigation",
                kind: "menu",
                title: "Navigation",
                menuSource: "main",
                menuActiveIndicator: "underline",
              },
            ],
          },
          {
            id: "header-main-right",
            rowId: "header-main-row",
            rowLayout: "quarters-1-2-1",
            blocks: [
              {
                id: "header-button",
                kind: "button",
                buttonLabel: "Contact Us",
                buttonUrl: "/contact",
                buttonBorderRadius: "8px",
                buttonPaddingY: "8px",
                buttonPaddingX: "16px",
              },
              {
                id: "header-utility-cart",
                kind: "headerCart",
                headerUtilityAction: "cart",
                headerUtilityVariant: "muted",
              },
            ],
          },
        ],
        visible: true,
      },
    ],
  },
  {
    key: "centered-logo",
    name: "Centered Logo",
    description: "Symmetric design with the logo centered, flanked by navigation and support actions.",
    headerLayout: "simple",
    headerTransparent: false,
    headerOverlay: false,
    headerWidthMode: "boxed",
    sections: [
      {
        id: "header-document",
        kind: "contentLayout",
        title: "Header",
        headerUtilityMigrationVersion: 3,
        background: "transparent",
        backgroundMode: "full",
        contentMode: "boxed",
        colorScheme: "inherit",
        layout: "header-row",
        layoutColumns: 3,
        layoutItems: [
          {
            id: "header-main-left",
            rowId: "header-main-row",
            rowLayout: "quarters-1-2-1",
            blocks: [
              {
                id: "header-navigation",
                kind: "menu",
                title: "Navigation",
                menuSource: "main",
                menuActiveIndicator: "underline",
              },
            ],
          },
          {
            id: "header-main-center",
            rowId: "header-main-row",
            rowLayout: "quarters-1-2-1",
            blocks: [
              {
                id: "header-logo",
                kind: "image",
                headerBrandMode: "logo",
                headerBrandText: "WebPages",
                imageMaxWidth: 140,
                imageAlignment: "center",
              },
            ],
          },
          {
            id: "header-main-right",
            rowId: "header-main-row",
            rowLayout: "quarters-1-2-1",
            blocks: [
              {
                id: "header-utility-account",
                kind: "headerAccount",
                headerUtilityAction: "account",
                headerUtilityVariant: "muted",
              },
              {
                id: "header-utility-wishlist",
                kind: "headerWishlist",
                headerUtilityAction: "wishlist",
                headerUtilityVariant: "muted",
              },
              {
                id: "header-utility-cart",
                kind: "headerCart",
                headerUtilityAction: "cart",
                headerUtilityVariant: "muted",
              },
            ],
          },
        ],
        visible: true,
      },
    ],
  },
  {
    key: "ecommerce",
    name: "E-Commerce",
    description: "Conversion-focused layout with a categories catalog dropdown, prominent search, and shopping utilities.",
    headerLayout: "two-row",
    headerTransparent: false,
    headerOverlay: false,
    headerWidthMode: "boxed",
    sections: [
      {
        id: "header-document",
        kind: "contentLayout",
        title: "Header",
        headerUtilityMigrationVersion: 3,
        background: "transparent",
        backgroundMode: "full",
        contentMode: "boxed",
        colorScheme: "inherit",
        layout: "header-row",
        layoutColumns: 3,
        layoutItems: [
          {
            id: "header-top-left",
            rowId: "header-top-row",
            rowLayout: "halves",
            blocks: [
              {
                id: "header-logo",
                kind: "image",
                headerBrandMode: "logo",
                headerBrandText: "WebPages",
                imageMaxWidth: 140,
              },
            ],
          },
          {
            id: "header-top-right",
            rowId: "header-top-row",
            rowLayout: "halves",
            blocks: [
              {
                id: "header-utility-search",
                kind: "headerSearch",
                headerUtilityAction: "search",
                headerUtilityVariant: "muted",
              },
              {
                id: "header-utility-wishlist",
                kind: "headerWishlist",
                headerUtilityAction: "wishlist",
                headerUtilityVariant: "muted",
              },
              {
                id: "header-utility-account",
                kind: "headerAccount",
                headerUtilityAction: "account",
                headerUtilityVariant: "muted",
              },
              {
                id: "header-utility-cart",
                kind: "headerCart",
                headerUtilityAction: "cart",
                headerUtilityVariant: "muted",
              },
            ],
          },
          {
            id: "header-main-left",
            rowId: "header-main-row",
            rowLayout: "quarters-1-2-1",
            blocks: [
              {
                id: "header-categories",
                kind: "headerCategories",
                headerCategoriesLabel: "Browse Categories",
                headerCategoriesShowLabel: true,
              },
            ],
          },
          {
            id: "header-main-center",
            rowId: "header-main-row",
            rowLayout: "quarters-1-2-1",
            blocks: [
              {
                id: "header-navigation",
                kind: "menu",
                title: "Navigation",
                menuSource: "main",
                menuActiveIndicator: "underline",
              },
            ],
          },
          {
            id: "header-main-right",
            rowId: "header-main-row",
            rowLayout: "quarters-1-2-1",
            blocks: [
              {
                id: "header-language",
                kind: "headerLanguage",
                headerLanguageDisplay: "native",
              },
            ],
          },
        ],
        visible: true,
      },
    ],
  },
  {
    key: "transparent",
    name: "Transparent",
    description: "Modern overlaid layout designed for transparent integration over full-bleed hero sections.",
    headerLayout: "simple",
    headerTransparent: true,
    headerOverlay: true,
    headerWidthMode: "full",
    sections: [
      {
        id: "header-document",
        kind: "contentLayout",
        title: "Header",
        headerUtilityMigrationVersion: 3,
        background: "transparent",
        backgroundMode: "full",
        contentMode: "boxed",
        colorScheme: "inherit",
        layout: "header-row",
        layoutColumns: 3,
        layoutItems: [
          {
            id: "header-main-left",
            rowId: "header-main-row",
            rowLayout: "quarters-1-2-1",
            blocks: [
              {
                id: "header-logo",
                kind: "image",
                headerBrandMode: "logo",
                headerBrandText: "WebPages",
                imageMaxWidth: 140,
              },
            ],
          },
          {
            id: "header-main-center",
            rowId: "header-main-row",
            rowLayout: "quarters-1-2-1",
            blocks: [
              {
                id: "header-navigation",
                kind: "menu",
                title: "Navigation",
                menuSource: "main",
                menuActiveIndicator: "underline",
                menuHoverColor: "#ec4899",
                menuActiveColor: "#ec4899",
              },
            ],
          },
          {
            id: "header-main-right",
            rowId: "header-main-row",
            rowLayout: "quarters-1-2-1",
            blocks: [
              {
                id: "header-utility-search",
                kind: "headerSearch",
                headerUtilityAction: "search",
                headerUtilityVariant: "ghost",
              },
              {
                id: "header-utility-account",
                kind: "headerAccount",
                headerUtilityAction: "account",
                headerUtilityVariant: "ghost",
              },
              {
                id: "header-utility-cart",
                kind: "headerCart",
                headerUtilityAction: "cart",
                headerUtilityVariant: "ghost",
              },
            ],
          },
        ],
        visible: true,
      },
    ],
  },
  {
    key: "compact",
    name: "Compact",
    description: "Space-saving compact header layout with low-profile padding and simple controls.",
    headerLayout: "princity",
    headerTransparent: false,
    headerOverlay: false,
    headerWidthMode: "boxed",
    sections: [
      {
        id: "header-document",
        kind: "contentLayout",
        title: "Header",
        headerUtilityMigrationVersion: 3,
        background: "transparent",
        backgroundMode: "full",
        contentMode: "boxed",
        colorScheme: "inherit",
        layout: "header-row",
        layoutColumns: 3,
        layoutItems: [
          {
            id: "header-main-left",
            rowId: "header-main-row",
            rowLayout: "quarters-1-2-1",
            blocks: [
              {
                id: "header-logo",
                kind: "image",
                headerBrandMode: "logo",
                headerBrandText: "WebPages",
                imageMaxWidth: 120,
              },
            ],
          },
          {
            id: "header-main-center",
            rowId: "header-main-row",
            rowLayout: "quarters-1-2-1",
            blocks: [
              {
                id: "header-navigation",
                kind: "menu",
                title: "Navigation",
                menuSource: "main",
                menuActiveIndicator: "underline",
              },
            ],
          },
          {
            id: "header-main-right",
            rowId: "header-main-row",
            rowLayout: "quarters-1-2-1",
            blocks: [
              {
                id: "header-utility-search",
                kind: "headerSearch",
                headerUtilityAction: "search",
                headerUtilityVariant: "muted",
              },
              {
                id: "header-utility-cart",
                kind: "headerCart",
                headerUtilityAction: "cart",
                headerUtilityVariant: "muted",
              },
            ],
          },
        ],
        visible: true,
      },
    ],
  },
  {
    key: "pill",
    name: "Pill",
    description: "Floating navigation island centered on screen.",
    headerLayout: "pill",
    headerTransparent: false,
    headerOverlay: false,
    headerWidthMode: "boxed",
    sections: [
      {
        id: "header-document",
        kind: "contentLayout",
        title: "Header",
        headerUtilityMigrationVersion: 3,
        background: "transparent",
        backgroundMode: "full",
        contentMode: "boxed",
        colorScheme: "inherit",
        layout: "header-row",
        layoutColumns: 3,
        layoutItems: [
          {
            id: "header-main-left",
            rowId: "header-main-row",
            rowLayout: "quarters-1-2-1",
            blocks: [
              {
                id: "header-logo",
                kind: "image",
                headerBrandMode: "logo",
                headerBrandText: "WebPages",
                imageMaxWidth: 140,
              },
            ],
          },
          {
            id: "header-main-center",
            rowId: "header-main-row",
            rowLayout: "quarters-1-2-1",
            blocks: [
              {
                id: "header-navigation",
                kind: "menu",
                title: "Navigation",
                menuSource: "main",
                menuActiveIndicator: "underline",
              },
            ],
          },
          {
            id: "header-main-right",
            rowId: "header-main-row",
            rowLayout: "quarters-1-2-1",
            blocks: [
              {
                id: "header-utility-search",
                kind: "headerSearch",
                headerUtilityAction: "search",
                headerUtilityVariant: "muted",
              },
              {
                id: "header-utility-cart",
                kind: "headerCart",
                headerUtilityAction: "cart",
                headerUtilityVariant: "muted",
              },
            ],
          },
        ],
        visible: true,
      },
    ],
  },
  {
    key: "princity",
    name: "Princity",
    description: "Princity scroll-reactive layout with left logo and custom indicator.",
    headerLayout: "princity",
    headerTransparent: false,
    headerOverlay: false,
    headerWidthMode: "boxed",
    sections: [
      {
        id: "header-document",
        kind: "contentLayout",
        title: "Header",
        headerUtilityMigrationVersion: 3,
        background: "transparent",
        backgroundMode: "full",
        contentMode: "boxed",
        colorScheme: "inherit",
        layout: "header-row",
        layoutColumns: 3,
        layoutItems: [
          {
            id: "header-main-left",
            rowId: "header-main-row",
            rowLayout: "quarters-1-2-1",
            blocks: [
              {
                id: "header-logo",
                kind: "image",
                headerBrandMode: "logo",
                headerBrandText: "WebPages",
                imageMaxWidth: 140,
              },
            ],
          },
          {
            id: "header-main-center",
            rowId: "header-main-row",
            rowLayout: "quarters-1-2-1",
            blocks: [
              {
                id: "header-navigation",
                kind: "menu",
                title: "Navigation",
                menuSource: "main",
                menuActiveIndicator: "princity",
              },
            ],
          },
          {
            id: "header-main-right",
            rowId: "header-main-row",
            rowLayout: "quarters-1-2-1",
            blocks: [
              {
                id: "header-utility-search",
                kind: "headerSearch",
                headerUtilityAction: "search",
                headerUtilityVariant: "muted",
              },
              {
                id: "header-utility-cart",
                kind: "headerCart",
                headerUtilityAction: "cart",
                headerUtilityVariant: "muted",
              },
            ],
          },
        ],
        visible: true,
      },
    ],
  },
  {
    key: "two-row",
    name: "Two-Row Layout",
    description: "Standard layout with separate rows for top announcements and main brand info.",
    headerLayout: "two-row",
    headerTransparent: false,
    headerOverlay: false,
    headerWidthMode: "boxed",
    sections: [
      {
        id: "header-document",
        kind: "contentLayout",
        title: "Header",
        headerUtilityMigrationVersion: 3,
        background: "transparent",
        backgroundMode: "full",
        contentMode: "boxed",
        colorScheme: "inherit",
        layout: "header-row",
        layoutColumns: 3,
        layoutItems: [
          {
            id: "header-top-left",
            rowId: "header-top-row",
            rowLayout: "halves",
            blocks: [],
          },
          {
            id: "header-top-right",
            rowId: "header-top-row",
            rowLayout: "halves",
            blocks: [],
          },
          {
            id: "header-main-left",
            rowId: "header-main-row",
            rowLayout: "quarters-1-2-1",
            blocks: [
              {
                id: "header-logo",
                kind: "image",
                headerBrandMode: "logo",
                headerBrandText: "WebPages",
                imageMaxWidth: 140,
              },
            ],
          },
          {
            id: "header-main-center",
            rowId: "header-main-row",
            rowLayout: "quarters-1-2-1",
            blocks: [
              {
                id: "header-navigation",
                kind: "menu",
                title: "Navigation",
                menuSource: "main",
                menuActiveIndicator: "underline",
              },
            ],
          },
          {
            id: "header-main-right",
            rowId: "header-main-row",
            rowLayout: "quarters-1-2-1",
            blocks: [
              {
                id: "header-utility-search",
                kind: "headerSearch",
                headerUtilityAction: "search",
                headerUtilityVariant: "muted",
              },
              {
                id: "header-utility-cart",
                kind: "headerCart",
                headerUtilityAction: "cart",
                headerUtilityVariant: "muted",
              },
            ],
          },
        ],
        visible: true,
      },
    ],
  },
  {
    key: "simple",
    name: "Simple Row",
    description: "A clean single row layout.",
    headerLayout: "simple",
    headerTransparent: false,
    headerOverlay: false,
    headerWidthMode: "boxed",
    sections: [
      {
        id: "header-document",
        kind: "contentLayout",
        title: "Header",
        headerUtilityMigrationVersion: 3,
        background: "transparent",
        backgroundMode: "full",
        contentMode: "boxed",
        colorScheme: "inherit",
        layout: "header-row",
        layoutColumns: 3,
        layoutItems: [
          {
            id: "header-main-left",
            rowId: "header-main-row",
            rowLayout: "quarters-1-2-1",
            blocks: [
              {
                id: "header-logo",
                kind: "image",
                headerBrandMode: "logo",
                headerBrandText: "WebPages",
                imageMaxWidth: 140,
              },
            ],
          },
          {
            id: "header-main-center",
            rowId: "header-main-row",
            rowLayout: "quarters-1-2-1",
            blocks: [
              {
                id: "header-navigation",
                kind: "menu",
                title: "Navigation",
                menuSource: "main",
                menuActiveIndicator: "underline",
              },
            ],
          },
          {
            id: "header-main-right",
            rowId: "header-main-row",
            rowLayout: "quarters-1-2-1",
            blocks: [
              {
                id: "header-utility-search",
                kind: "headerSearch",
                headerUtilityAction: "search",
                headerUtilityVariant: "muted",
              },
              {
                id: "header-utility-cart",
                kind: "headerCart",
                headerUtilityAction: "cart",
                headerUtilityVariant: "muted",
              },
            ],
          },
        ],
        visible: true,
      },
    ],
  },
  {
    key: "hero",
    name: "Hero Header",
    description: "Overlay transparent header for landing pages.",
    headerLayout: "hero",
    headerTransparent: true,
    headerOverlay: true,
    headerWidthMode: "full",
    sections: [
      {
        id: "header-document",
        kind: "contentLayout",
        title: "Header",
        headerUtilityMigrationVersion: 3,
        background: "transparent",
        backgroundMode: "full",
        contentMode: "boxed",
        colorScheme: "inherit",
        layout: "header-row",
        layoutColumns: 3,
        layoutItems: [
          {
            id: "header-main-left",
            rowId: "header-main-row",
            rowLayout: "quarters-1-2-1",
            blocks: [
              {
                id: "header-logo",
                kind: "image",
                headerBrandMode: "logo",
                headerBrandText: "WebPages",
                imageMaxWidth: 140,
              },
            ],
          },
          {
            id: "header-main-center",
            rowId: "header-main-row",
            rowLayout: "quarters-1-2-1",
            blocks: [
              {
                id: "header-navigation",
                kind: "menu",
                title: "Navigation",
                menuSource: "main",
                menuActiveIndicator: "underline",
              },
            ],
          },
          {
            id: "header-main-right",
            rowId: "header-main-row",
            rowLayout: "quarters-1-2-1",
            blocks: [
              {
                id: "header-utility-search",
                kind: "headerSearch",
                headerUtilityAction: "search",
                headerUtilityVariant: "ghost",
              },
              {
                id: "header-utility-cart",
                kind: "headerCart",
                headerUtilityAction: "cart",
                headerUtilityVariant: "ghost",
              },
            ],
          },
        ],
        visible: true,
      },
    ],
  },
  {
    key: "wordpress",
    name: "WordPress Standard",
    description: "Classic WordPress style layout.",
    headerLayout: "wordpress",
    headerTransparent: false,
    headerOverlay: false,
    headerWidthMode: "boxed",
    sections: [
      {
        id: "header-document",
        kind: "contentLayout",
        title: "Header",
        headerUtilityMigrationVersion: 3,
        background: "transparent",
        backgroundMode: "full",
        contentMode: "boxed",
        colorScheme: "inherit",
        layout: "header-row",
        layoutColumns: 3,
        layoutItems: [
          {
            id: "header-main-left",
            rowId: "header-main-row",
            rowLayout: "quarters-1-2-1",
            blocks: [
              {
                id: "header-logo",
                kind: "image",
                headerBrandMode: "logo",
                headerBrandText: "WebPages",
                imageMaxWidth: 140,
              },
            ],
          },
          {
            id: "header-main-center",
            rowId: "header-main-row",
            rowLayout: "quarters-1-2-1",
            blocks: [
              {
                id: "header-navigation",
                kind: "menu",
                title: "Navigation",
                menuSource: "main",
                menuActiveIndicator: "underline",
              },
            ],
          },
          {
            id: "header-main-right",
            rowId: "header-main-row",
            rowLayout: "quarters-1-2-1",
            blocks: [
              {
                id: "header-utility-search",
                kind: "headerSearch",
                headerUtilityAction: "search",
                headerUtilityVariant: "muted",
              },
              {
                id: "header-utility-cart",
                kind: "headerCart",
                headerUtilityAction: "cart",
                headerUtilityVariant: "muted",
              },
            ],
          },
        ],
        visible: true,
      },
    ],
  },
];

const visiblePresetKeys = new Set([
  "minimal",
  "business",
  "centered-logo",
  "ecommerce",
  "transparent",
  "pill",
  "princity",
  "hero",
]);

function completeHeaderPreset(preset: HeaderPreset): HeaderPreset {
  return {
    ...preset,
    sections: preset.sections.map((section) => ({
      ...section,
      layoutItems: (section.layoutItems ?? []).map((item, itemIndex, items) => {
        const rowId = item.rowId ?? item.id ?? `header-row-${itemIndex}`;
        const rowItems = items.filter(
          (candidate, candidateIndex) =>
            (candidate.rowId ?? candidate.id ?? `header-row-${candidateIndex}`) === rowId,
        );
        const columnIndex = rowItems.indexOf(item);
        return {
          ...item,
          blocks: (item.blocks ?? []).map((block) => {
            const alignment = resolveHeaderElementAlignment(
              block,
              columnIndex,
              rowItems.length,
            );
            if (block.kind === "image" || block.id === "header-logo") {
              return {
                ...block,
                headerBrandMode:
                  block.headerBrandMode === "logo" && !block.imageUrl
                    ? "brand"
                    : block.headerBrandMode ?? "brand",
                headerBrandText: block.headerBrandText?.trim() || "WebPages",
                imageAlignment: alignment,
              };
            }
            return { ...block, elementAlign: alignment };
          }),
        };
      }),
    })),
  };
}

/** Product-ready presets shown for new applications. Legacy preset keys remain
 * readable from existing Header documents but are not offered as new designs. */
export const headerPresets: HeaderPreset[] = allHeaderPresets
  .filter((preset) => visiblePresetKeys.has(preset.key))
  .map(completeHeaderPreset);

export const hiddenLegacyHeaderPresetKeys = allHeaderPresets
  .filter((preset) => !visiblePresetKeys.has(preset.key))
  .map((preset) => preset.key);
