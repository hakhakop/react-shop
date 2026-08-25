import type { BuilderShellSettings } from "@/lib/builderShell";
import type { HeaderBuilderComposition } from "@/lib/headerBuilderDocument";

export type ResolvedHeaderDocumentSettings = {
  visible: boolean;
  transparent: boolean;
  overlay: boolean;
  height: string | undefined;
  customHeight: number | undefined;
  layout: BuilderShellSettings["headerLayout"];
  behavior: BuilderShellSettings["headerBehavior"];
  widthMode: BuilderShellSettings["headerWidthMode"];
  backgroundMode: BuilderShellSettings["headerBackgroundMode"];
  textMode: BuilderShellSettings["headerTextMode"];
  breakpoint: string | undefined;
  mobileBreakpoint: string | undefined;
  stickyShowOnUp: boolean;
  stickyAnimation: string | undefined;
  dropdownAlign: "left" | "right" | "center" | undefined;
  dropdownAlignToNavbar: boolean;
  dropbarEnabled: boolean;
  parentIconEnabled: boolean;
  clickModeEnabled: boolean;
  dialogTogglePosition: string | undefined;
  dialogLayout: string | undefined;
  dialogCenter: boolean;
  dialogPushAfter: number | undefined;
  searchPosition: string | undefined;
  searchLayout: string | undefined;
  socialPosition: string | undefined;
  mobileLogoUrl: string | null | undefined;
  inverseLogoUrl: string | null | undefined;
  mobileComposition: "separate" | "responsive" | undefined;
  zIndex: number;
  topToolbarVisible: boolean;
  topToolbarText: string;
  topToolbarPhone: string;
  topToolbarMeta: string;
};

type HeaderSettingsFallback = Partial<Pick<
  BuilderShellSettings,
  | "headerVisible"
  | "headerTransparent"
  | "headerOverlay"
  | "headerHeight"
  | "headerCustomHeight"
  | "headerLayout"
  | "headerBehavior"
  | "headerWidthMode"
  | "headerBackgroundMode"
  | "headerTextMode"
  | "headerBreakpoint"
  | "headerMobileBreakpoint"
  | "headerStickyShowOnUp"
  | "headerStickyAnimation"
  | "headerDropdownAlign"
  | "headerDropdownAlignToNavbar"
  | "headerDropbarEnabled"
  | "headerParentIconEnabled"
  | "headerClickModeEnabled"
  | "headerDialogTogglePosition"
  | "headerDialogLayout"
  | "headerDialogCenter"
  | "headerDialogPushAfter"
  | "headerSearchPosition"
  | "headerSearchLayout"
  | "headerSocialPosition"
  | "headerMobileLogoUrl"
  | "headerInverseLogoUrl"
  | "headerMobileComposition"
  | "headerZIndex"
  | "topToolbarVisible"
  | "topToolbarText"
  | "topToolbarPhone"
  | "topToolbarMeta"
>>;

/**
 * Resolves persisted Header-document settings without ever writing derived
 * values back to the document. Shell settings are compatibility fallbacks for
 * Header documents created before these fields became document-owned.
 */
export function resolveHeaderDocumentSettings(
  composition: Pick<
    HeaderBuilderComposition,
    | "documentVisible"
    | "documentTransparent"
    | "documentOverlay"
    | "documentHeight"
    | "documentCustomHeight"
    | "documentLayout"
    | "documentBehavior"
    | "documentWidthMode"
    | "documentBackgroundMode"
    | "documentTextMode"
    | "documentBreakpoint"
    | "documentMobileBreakpoint"
    | "documentStickyShowOnUp"
    | "documentStickyAnimation"
    | "documentDropdownAlign"
    | "documentDropdownAlignToNavbar"
    | "documentDropbarEnabled"
    | "documentParentIconEnabled"
    | "documentClickModeEnabled"
    | "documentDialogTogglePosition"
    | "documentDialogLayout"
    | "documentDialogCenter"
    | "documentDialogPushAfter"
    | "documentSearchPosition"
    | "documentSearchLayout"
    | "documentSocialPosition"
    | "documentMobileLogoUrl"
    | "documentInverseLogoUrl"
    | "documentMobileComposition"
    | "documentZIndex"
    | "documentTopToolbarVisible"
    | "documentTopToolbarText"
    | "documentTopToolbarPhone"
    | "documentTopToolbarMeta"
  >,
  fallback: HeaderSettingsFallback,
): ResolvedHeaderDocumentSettings {
  return {
    visible: composition.documentVisible ?? (fallback.headerVisible ?? true),
    transparent: composition.documentTransparent ?? (fallback.headerTransparent ?? false),
    overlay: composition.documentOverlay ?? (fallback.headerOverlay ?? false),
    height: composition.documentHeight ?? fallback.headerHeight,
    customHeight:
      composition.documentCustomHeight ?? fallback.headerCustomHeight,
    layout: composition.documentLayout ?? fallback.headerLayout ?? "wordpress",
    behavior: composition.documentBehavior ?? fallback.headerBehavior ?? "sticky",
    widthMode: composition.documentWidthMode ?? fallback.headerWidthMode ?? "boxed",
    backgroundMode: composition.documentBackgroundMode ?? fallback.headerBackgroundMode ?? "default",
    textMode: composition.documentTextMode ?? fallback.headerTextMode ?? "auto",
    breakpoint: composition.documentBreakpoint ?? fallback.headerBreakpoint,
    mobileBreakpoint: composition.documentMobileBreakpoint ?? fallback.headerMobileBreakpoint,
    // YOOtheme's live Circle header uses show-on-up with a slide-top
    // transition. Keep this as the compatibility default for legacy Header
    // documents; an explicit document value still wins.
    stickyShowOnUp: composition.documentStickyShowOnUp ?? fallback.headerStickyShowOnUp ?? true,
    stickyAnimation: composition.documentStickyAnimation ?? fallback.headerStickyAnimation ?? "slide-top",
    dropdownAlign: composition.documentDropdownAlign ?? fallback.headerDropdownAlign,
    dropdownAlignToNavbar: composition.documentDropdownAlignToNavbar ?? fallback.headerDropdownAlignToNavbar ?? false,
    dropbarEnabled: composition.documentDropbarEnabled ?? fallback.headerDropbarEnabled ?? false,
    parentIconEnabled: composition.documentParentIconEnabled ?? fallback.headerParentIconEnabled ?? false,
    clickModeEnabled: composition.documentClickModeEnabled ?? fallback.headerClickModeEnabled ?? false,
    dialogTogglePosition: composition.documentDialogTogglePosition ?? fallback.headerDialogTogglePosition,
    dialogLayout: composition.documentDialogLayout ?? fallback.headerDialogLayout,
    dialogCenter: composition.documentDialogCenter ?? fallback.headerDialogCenter ?? false,
    dialogPushAfter: composition.documentDialogPushAfter ?? fallback.headerDialogPushAfter,
    searchPosition: composition.documentSearchPosition ?? fallback.headerSearchPosition,
    searchLayout: composition.documentSearchLayout ?? fallback.headerSearchLayout,
    socialPosition: composition.documentSocialPosition ?? fallback.headerSocialPosition,
    mobileLogoUrl: composition.documentMobileLogoUrl ?? fallback.headerMobileLogoUrl,
    inverseLogoUrl: composition.documentInverseLogoUrl ?? fallback.headerInverseLogoUrl,
    mobileComposition: composition.documentMobileComposition ?? fallback.headerMobileComposition,
    zIndex: composition.documentZIndex ?? fallback.headerZIndex ?? 40,
    topToolbarVisible: composition.documentTopToolbarVisible ?? fallback.topToolbarVisible ?? true,
    topToolbarText: composition.documentTopToolbarText ?? fallback.topToolbarText ?? "",
    topToolbarPhone: composition.documentTopToolbarPhone ?? fallback.topToolbarPhone ?? "",
    topToolbarMeta: composition.documentTopToolbarMeta ?? fallback.topToolbarMeta ?? "",
  };
}
