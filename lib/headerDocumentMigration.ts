import type { BuilderLayout } from "./builderLayouts";
import type { BuilderShellSettings } from "./builderShell";

/**
 * One-way compatibility adapter. Legacy shell values seed missing Header fields
 * exactly once; a version 2 document is returned unchanged on later reads.
 */
export function migrateLegacyHeaderDocument(
  layout: BuilderLayout,
  settings: BuilderShellSettings,
): BuilderLayout {
  if (!layout?.sections?.length) return layout;

  const sections = layout.sections.map((section, index) => {
    if (index !== 0 || section.headerArchitectureVersion === 2) return section;
    const layoutItems = (section.layoutItems ?? []).map((item) => ({
      ...item,
      blocks: (item.blocks ?? []).map((block) => {
        if (block.id === "header-logo" || block.kind === "image") return {
          ...block,
          imageUrl: (block.imageUrl ?? settings.headerLogoUrl) || undefined,
          imageAlt: block.imageAlt ?? settings.headerLogoAlt,
          imageMaxWidth: block.imageMaxWidth ?? settings.headerLogoMaxWidth,
          headerBrandMode: block.headerBrandMode ?? settings.headerBrandMode,
          headerBrandText: block.headerBrandText ?? settings.headerBrandText,
        };
        if (block.id === "header-navigation" || block.kind === "menu") return {
          ...block,
          menuActiveIndicator: block.menuActiveIndicator ?? settings.headerActiveIndicator,
        };
        if (block.id === "header-button" || block.id === "starter-header-button" || block.kind === "button") return {
          ...block,
          buttonLabel: block.buttonLabel ?? settings.headerButtonLabel,
          buttonUrl: block.buttonUrl ?? settings.headerButtonUrl,
        };
        return block;
      }),
    }));

    return {
      ...section,
      headerArchitectureVersion: 2 as const,
      headerVisible: section.headerVisible ?? settings.headerVisible,
      headerTransparent: section.headerTransparent ?? settings.headerTransparent,
      headerOverlay: section.headerOverlay ?? settings.headerOverlay,
      headerHeight: section.headerHeight ?? settings.headerHeight,
      headerCustomHeight: section.headerCustomHeight ?? settings.headerCustomHeight,
      headerLayout: section.headerLayout ?? settings.headerLayout,
      headerBehavior: section.headerBehavior ?? settings.headerBehavior,
      headerWidthMode: section.headerWidthMode ?? settings.headerWidthMode,
      headerBackgroundMode: section.headerBackgroundMode ?? settings.headerBackgroundMode,
      headerTextMode: section.headerTextMode ?? settings.headerTextMode,
      headerZIndex: section.headerZIndex ?? settings.headerZIndex,
      headerTopToolbarVisible: section.headerTopToolbarVisible ?? settings.topToolbarVisible,
      headerTopToolbarText: section.headerTopToolbarText ?? settings.topToolbarText,
      headerTopToolbarPhone: section.headerTopToolbarPhone ?? settings.topToolbarPhone,
      headerTopToolbarMeta: section.headerTopToolbarMeta ?? settings.topToolbarMeta,
      layoutItems,
    };
  });
  return { ...layout, sections };
}
