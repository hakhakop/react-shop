import { getBuilderRowLayoutPreset } from "@/components/dashboard/builderLayoutPresets";
import type { BuilderLayout } from "@/lib/builderLayouts";
import type { HeaderBuilderComposition, HeaderBuilderElement, HeaderRowComposition } from "@/lib/headerBuilderDocument";
import { resolveHeaderElementAlignment } from "@/lib/headerElementAlignment";

const headerActionFromKind = (kind?: string) => {
  if (kind === "headerSearch") return "search";
  if (kind === "headerWishlist") return "wishlist";
  if (kind === "headerCart") return "cart";
  if (kind === "headerAccount") return "account";
  if (kind === "headerTheme") return "theme";
  return undefined;
};

const headerButtonHoverEffect = (
  value?: string,
): HeaderBuilderElement["buttonHoverEffect"] =>
  value === "none" || value === "lift" || value === "grow" || value === "inherit"
    ? value
    : undefined;

/** Pure, client-safe Header document resolver shared by Builder and storefront. */
export function resolveHeaderBuilderComposition(
  layout: Pick<BuilderLayout, "sections"> | null | undefined,
): HeaderBuilderComposition {
  const blocks = layout?.sections.flatMap((section) =>
    (section.layoutItems ?? []).flatMap((item) => item.blocks ?? []),
  ) ?? [];
  const blockRowIds = new Map<object, string>();
  const blockColumnMeta = new Map<
    object,
    { id?: string; flex?: number; index: number; count: number }
  >();
  layout?.sections.forEach((layoutSection) => {
    layoutSection.layoutItems?.forEach((item, itemIndex) => {
      const rowId = item.rowId ?? item.id ?? `header-row-${itemIndex}`;
      const rowItems = layoutSection.layoutItems?.filter(
        (candidate) => (candidate.rowId ?? candidate.id) === rowId,
      ) ?? [item];
      const preset = getBuilderRowLayoutPreset(item.rowLayout);
      const columnIndex = rowItems.indexOf(item);
      item.blocks?.forEach((block) => {
        blockRowIds.set(block, rowId);
        blockColumnMeta.set(block, {
          id: item.id,
          flex: preset?.ratios[columnIndex] ?? 1,
          index: columnIndex,
          count: rowItems.length,
        });
      });
    });
  });
  const section = layout?.sections[0];
  const row = section?.layoutItems?.[0];
  const sharedElementFields = (block: (typeof blocks)[number]) => ({
    rowId: blockRowIds.get(block),
    columnId: blockColumnMeta.get(block)?.id,
    columnFlex: blockColumnMeta.get(block)?.flex,
    elementAlign: resolveHeaderElementAlignment(
      block,
      blockColumnMeta.get(block)?.index,
      blockColumnMeta.get(block)?.count,
    ),
    visualStyle: block.visualStyle,
    typography: (block.kind === "menu" && !block.headerNavigationOverrides?.typography) ||
      ((block.kind === "button" || block.id === "header-button") && !block.headerButtonOverrides?.typography)
      ? undefined
      : block.typography,
  });
  const elements = blocks.flatMap((block, blockIndex): HeaderBuilderElement[] => {
    if (block.id === "header-logo" || block.kind === "image") return [{
      id: block.id ?? `header-logo-${blockIndex}`,
      type: "logo",
      imageUrl: block.imageUrl,
      imageAlt: block.imageAlt,
      imageMaxWidth: block.imageMaxWidth,
      imageWidth: block.imageWidth,
      imageHeight: block.imageHeight,
      imageFit: block.imageFit,
      imageRatio: block.imageRatio,
      imageShape: block.imageShape,
      imageBorder: block.imageBorder,
      imageShadow: block.imageShadow,
      imageBoxShadow: block.imageBoxShadow,
      imageSvgInline: block.imageSvgInline,
      imageSvgColor: block.imageSvgColor,
      imagePosition: block.imagePosition,
      imageLoading: block.imageLoading,
      imageAlignment: resolveHeaderElementAlignment(
        block,
        blockColumnMeta.get(block)?.index,
        blockColumnMeta.get(block)?.count,
      ),
      headerBrandMode: block.headerBrandMode,
      headerBrandText: block.headerBrandText,
      ...sharedElementFields(block),
    }];
    if (block.id === "header-navigation" || block.kind === "menu") {
      const overrides = block.headerNavigationOverrides;
      return [{
      id: block.id ?? `header-navigation-${blockIndex}`,
      type: "navigation",
      menuItemGap: overrides?.gap ? block.menuItemGap : undefined,
      menuHoverColor: overrides?.hoverColor ? block.menuHoverColor : undefined,
      menuActiveColor: overrides?.activeColor ? block.menuActiveColor : undefined,
      menuActiveIndicator: overrides?.indicator ? block.menuActiveIndicator : undefined,
      headerNavigationOverrides: overrides,
      ...sharedElementFields(block),
      }];
    }
    if (block.id === "header-button" || block.kind === "button") return [{
      ...(() => {
        const overrides = block.headerButtonOverrides;
        return {
          buttonStyle: overrides?.variant ? block.buttonStyle : undefined,
          size: overrides?.size ? block.size : undefined,
          fullWidthButton: overrides?.width ? block.fullWidthButton : undefined,
          buttonBg: overrides?.background ? block.buttonBg : undefined,
          buttonTextColor: overrides?.text ? block.buttonTextColor : undefined,
          buttonBorderRadius: overrides?.radius ? block.buttonBorderRadius : undefined,
          buttonBorderWidth: overrides?.border ? block.buttonBorderWidth : undefined,
          buttonBorderColor: overrides?.border ? block.buttonBorderColor : undefined,
          buttonPaddingY: overrides?.padding ? block.buttonPaddingY : undefined,
          buttonPaddingX: overrides?.padding ? block.buttonPaddingX : undefined,
          buttonHoverBg: overrides?.hoverBackground ? block.buttonHoverBg : undefined,
          buttonHoverTextColor: overrides?.hoverText ? block.buttonHoverTextColor : undefined,
          buttonHoverBorderColor: overrides?.hoverBorder ? block.buttonHoverBorderColor : undefined,
          buttonHoverEffect: overrides?.hoverEffect ? headerButtonHoverEffect(block.buttonHoverEffect) : undefined,
          buttonHoverTransform: overrides?.hoverEffect ? block.buttonHoverTransform : undefined,
          buttonHoverBoxShadow: overrides?.hoverEffect ? block.buttonHoverBoxShadow : undefined,
          buttonTarget: block.buttonTarget,
          buttonGap: block.buttonGap,
          headerButtonOverrides: overrides,
        };
      })(),
      id: block.id ?? `header-button-${blockIndex}`,
      type: "button",
      label: block.buttonLabel,
      url: block.buttonUrl,
      ...sharedElementFields(block),
    }];
    if (block.id === "header-spacer" || block.kind === "embed") return [{
      id: block.id ?? `header-spacer-${blockIndex}`,
      type: "spacer",
      ...sharedElementFields(block),
    }];
    const utilityAction = block.headerUtilityAction ?? headerActionFromKind(block.kind);
    if (block.id?.startsWith("header-utility-") || block.kind === "headerUtility" || utilityAction) return [{
      id: block.id ?? `header-utility-${blockIndex}`,
      type: "utility",
      utilityAction,
      utilityVariant: block.headerUtilityVariant,
      ...sharedElementFields(block),
    }];
    if (block.id === "header-categories" || block.kind === "headerCategories") return [{
      id: block.id ?? `header-categories-${blockIndex}`,
      type: "categories",
      categoriesLabel: block.headerCategoriesLabel,
      categoriesShowLabel: block.headerCategoriesShowLabel,
      categoriesDisplay: block.headerCategoriesDisplay,
      categoriesIcon: block.headerCategoriesIcon,
      categoriesIconPosition: block.headerCategoriesIconPosition,
      categoriesDropdownAlign: block.headerCategoriesDropdownAlign,
      categoriesShowAll: block.headerCategoriesShowAll,
      categoriesShowCounts: block.headerCategoriesShowCounts,
      categoriesShowHierarchy: block.headerCategoriesShowHierarchy,
      buttonBg: block.buttonBg,
      buttonTextColor: block.buttonTextColor,
      buttonBorderRadius: block.buttonBorderRadius,
      buttonBorderWidth: block.buttonBorderWidth,
      buttonBorderColor: block.buttonBorderColor,
      buttonPaddingY: block.buttonPaddingY,
      buttonPaddingX: block.buttonPaddingX,
      buttonHoverBg: block.buttonHoverBg,
      buttonHoverTextColor: block.buttonHoverTextColor,
      buttonHoverBorderColor: block.buttonHoverBorderColor,
      buttonHoverEffect: headerButtonHoverEffect(block.buttonHoverEffect),
      buttonHoverTransform: block.buttonHoverTransform,
      buttonHoverBoxShadow: block.buttonHoverBoxShadow,
      ...sharedElementFields(block),
    }];
    if (block.id === "header-language" || block.kind === "headerLanguage") return [{
      id: block.id ?? `header-language-${blockIndex}`,
      type: "language",
      languageDisplay: block.headerLanguageDisplay,
      buttonBg: block.buttonBg,
      buttonTextColor: block.buttonTextColor,
      buttonBorderRadius: block.buttonBorderRadius,
      buttonBorderWidth: block.buttonBorderWidth,
      buttonBorderColor: block.buttonBorderColor,
      buttonPaddingY: block.buttonPaddingY,
      buttonPaddingX: block.buttonPaddingX,
      buttonHoverBg: block.buttonHoverBg,
      buttonHoverTextColor: block.buttonHoverTextColor,
      buttonHoverBorderColor: block.buttonHoverBorderColor,
      buttonHoverEffect: headerButtonHoverEffect(block.buttonHoverEffect),
      buttonHoverTransform: block.buttonHoverTransform,
      buttonHoverBoxShadow: block.buttonHoverBoxShadow,
      ...sharedElementFields(block),
    }];
    return [];
  });
  const rowsList: HeaderRowComposition[] = [];
  const seenRows = new Set<string>();
  (layout?.sections[0]?.layoutItems ?? []).forEach((item, index) => {
    const rowId = item.rowId ?? item.id ?? `header-row-${index}`;
    if (!seenRows.has(rowId)) {
      seenRows.add(rowId);
      rowsList.push({
        rowId,
        headerGap: item.headerGap,
        headerJustify: item.headerJustify,
        headerAlign: item.headerAlign,
        rowBackground: item.rowBackground,
        rowColorScheme: item.rowColorScheme,
        rowTopSpacing: item.rowTopSpacing,
        rowBottomSpacing: item.rowBottomSpacing,
        rowTopMargin: item.rowTopMargin,
        rowBottomMargin: item.rowBottomMargin,
        rowBorderRadius: item.rowBorderRadius,
        rowVisualStyle: item.rowVisualStyle,
      });
    }
  });

  return {
    elements,
    columns: (layout?.sections[0]?.layoutItems ?? []).map((item, index, items) => {
      const rowId = item.rowId ?? item.id ?? `header-row-${index}`;
      const rowItems = items.filter((candidate) => (candidate.rowId ?? candidate.id) === rowId);
      const preset = getBuilderRowLayoutPreset(item.rowLayout);
      return {
        id: item.id ?? `${rowId}-column-${index + 1}`,
        rowId,
        flex: preset?.ratios[rowItems.indexOf(item)] ?? 1,
      };
    }),
    documentBackground: section?.background,
    documentVisualStyle: section?.visualStyle,
    documentVisible: section?.headerVisible,
    documentTransparent: section?.headerTransparent,
    documentOverlay: section?.headerOverlay,
    documentHeight: section?.headerHeight,
    documentCustomHeight: section?.headerCustomHeight,
    documentLayout: section?.headerLayout,
    documentBehavior: section?.headerBehavior,
    documentWidthMode: section?.headerWidthMode,
    documentBackgroundMode: section?.headerBackgroundMode,
    documentTextMode: section?.headerTextMode,
    documentZIndex: section?.headerZIndex,
    documentTopToolbarVisible: section?.headerTopToolbarVisible,
    documentTopToolbarText: section?.headerTopToolbarText,
    documentTopToolbarPhone: section?.headerTopToolbarPhone,
    documentTopToolbarMeta: section?.headerTopToolbarMeta,
    documentTopSpacing: section?.topSpacing,
    documentBottomSpacing: section?.bottomSpacing,
    documentTopMargin: section?.topMargin,
    documentBottomMargin: section?.bottomMargin,
    rows: rowsList,
    rowVisualStyle: row?.rowVisualStyle,
    rowGap: row?.headerGap,
    rowJustify: row?.headerJustify,
    rowAlign: row?.headerAlign,
  };
}
