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
  mobileLayout: HeaderBuilderComposition["documentMobileLayout"];
  mobileBehavior: HeaderBuilderComposition["documentMobileBehavior"];
  mobileSearchPosition: string | undefined;
  mobileSearchLayout: string | undefined;
  mobileSearchDropdownStretch: string | undefined;
  mobileSearchDropdownLarge: boolean;
  mobileSearchIconPosition: "" | "left" | "right" | undefined;
  mobileSocialPosition: string | undefined;
  mobileSocialStyle: boolean;
  mobileSocialGap: string | undefined;
  mobileSocialItems: Array<{ link: string }>;
  mobileLogoPaddingRemove: boolean;
  mobileDialogTogglePosition: string | undefined;
  mobileDialogLayout: string | undefined;
  mobileDialogClose: boolean;
  mobileDialogMenuStyle: string | undefined;
  mobileDialogCenter: boolean;
  mobileDialogPushAfter: number | undefined;
  mobileOffcanvasMode: string | undefined;
  mobileOffcanvasFlip: boolean;
  mobileOffcanvasOverlay: boolean;
  mobileDialogDropbarAnimation: string | undefined;
  stickyShowOnUp: boolean;
  stickyAnimation: string | undefined;
  dropdownAlign: "left" | "right" | "center" | undefined;
  dropdownAlignToNavbar: boolean;
  dropbarEnabled: boolean;
  parentIconEnabled: boolean;
  clickModeEnabled: boolean;
  dialogTogglePosition: string | undefined;
  dialogLayout: string | undefined;
  dialogMenuStyle: string | undefined;
  dialogCenter: boolean;
  dialogPushAfter: number | undefined;
  offcanvasMode: string | undefined;
  offcanvasFlip: boolean;
  offcanvasOverlay: boolean;
  dialogDropbarAnimation: string | undefined;
  searchPosition: string | undefined;
  searchLayout: string | undefined;
  searchDropdownStretch: string | undefined;
  searchDropdownLarge: boolean;
  searchIconPosition: "" | "left" | "right" | undefined;
  socialPosition: string | undefined;
  socialStyle: boolean;
  socialGap: string | undefined;
  socialItems: Array<{ link: string }>;
  logoPaddingRemove: boolean;
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
  | "headerDialogMenuStyle"
  | "headerDialogCenter"
  | "headerDialogPushAfter"
  | "headerOffcanvasMode"
  | "headerOffcanvasFlip"
  | "headerOffcanvasOverlay"
  | "headerDialogDropbarAnimation"
  | "headerSearchPosition"
  | "headerSearchLayout"
  | "headerSearchDropdownStretch"
  | "headerSearchDropdownLarge"
  | "headerSearchIconPosition"
  | "headerSocialPosition"
  | "headerSocialStyle"
  | "headerSocialGap"
  | "headerSocialItems"
  | "headerLogoPaddingRemove"
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
    | "documentMobileLayout"
    | "documentMobileBehavior"
    | "documentMobileSearchPosition"
    | "documentMobileSearchLayout"
    | "documentMobileSearchDropdownStretch"
    | "documentMobileSearchDropdownLarge"
    | "documentMobileSearchIconPosition"
    | "documentMobileSocialPosition"
    | "documentMobileSocialStyle"
    | "documentMobileSocialGap"
    | "documentMobileSocialItems"
    | "documentMobileLogoPaddingRemove"
    | "documentMobileDialogTogglePosition"
    | "documentMobileDialogLayout"
    | "documentMobileDialogClose"
    | "documentMobileDialogMenuStyle"
    | "documentMobileDialogCenter"
    | "documentMobileDialogPushAfter"
    | "documentMobileOffcanvasMode"
    | "documentMobileOffcanvasFlip"
    | "documentMobileOffcanvasOverlay"
    | "documentMobileDialogDropbarAnimation"
    | "documentStickyShowOnUp"
    | "documentStickyAnimation"
    | "documentDropdownAlign"
    | "documentDropdownAlignToNavbar"
    | "documentDropbarEnabled"
    | "documentParentIconEnabled"
    | "documentClickModeEnabled"
    | "documentDialogTogglePosition"
    | "documentDialogLayout"
    | "documentDialogMenuStyle"
    | "documentDialogCenter"
    | "documentDialogPushAfter"
    | "documentOffcanvasMode"
    | "documentOffcanvasFlip"
    | "documentOffcanvasOverlay"
    | "documentDialogDropbarAnimation"
    | "documentSearchPosition"
    | "documentSearchLayout"
    | "documentSearchDropdownStretch"
    | "documentSearchDropdownLarge"
    | "documentSearchIconPosition"
    | "documentSocialPosition"
    | "documentSocialStyle"
    | "documentSocialGap"
    | "documentSocialItems"
    | "documentLogoPaddingRemove"
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
    mobileLayout: composition.documentMobileLayout,
    mobileBehavior: composition.documentMobileBehavior,
    mobileSearchPosition: composition.documentMobileSearchPosition,
    mobileSearchLayout: composition.documentMobileSearchLayout,
    mobileSearchDropdownStretch: composition.documentMobileSearchDropdownStretch,
    mobileSearchDropdownLarge: composition.documentMobileSearchDropdownLarge ?? false,
    mobileSearchIconPosition: composition.documentMobileSearchIconPosition,
    mobileSocialPosition: composition.documentMobileSocialPosition,
    mobileSocialStyle: composition.documentMobileSocialStyle ?? false,
    mobileSocialGap: composition.documentMobileSocialGap,
    mobileSocialItems: composition.documentMobileSocialItems ?? [],
    mobileLogoPaddingRemove: composition.documentMobileLogoPaddingRemove ?? false,
    mobileDialogTogglePosition: composition.documentMobileDialogTogglePosition,
    mobileDialogLayout: composition.documentMobileDialogLayout,
    mobileDialogClose: composition.documentMobileDialogClose ?? true,
    mobileDialogMenuStyle: composition.documentMobileDialogMenuStyle,
    mobileDialogCenter: composition.documentMobileDialogCenter ?? false,
    mobileDialogPushAfter: composition.documentMobileDialogPushAfter,
    mobileOffcanvasMode: composition.documentMobileOffcanvasMode,
    mobileOffcanvasFlip: composition.documentMobileOffcanvasFlip ?? false,
    mobileOffcanvasOverlay: composition.documentMobileOffcanvasOverlay ?? false,
    mobileDialogDropbarAnimation: composition.documentMobileDialogDropbarAnimation,
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
    dialogMenuStyle: composition.documentDialogMenuStyle ?? fallback.headerDialogMenuStyle,
    dialogCenter: composition.documentDialogCenter ?? fallback.headerDialogCenter ?? false,
    dialogPushAfter: composition.documentDialogPushAfter ?? fallback.headerDialogPushAfter,
    offcanvasMode: composition.documentOffcanvasMode ?? fallback.headerOffcanvasMode,
    offcanvasFlip: composition.documentOffcanvasFlip ?? fallback.headerOffcanvasFlip ?? false,
    offcanvasOverlay: composition.documentOffcanvasOverlay ?? fallback.headerOffcanvasOverlay ?? false,
    dialogDropbarAnimation: composition.documentDialogDropbarAnimation ?? fallback.headerDialogDropbarAnimation,
    searchPosition: composition.documentSearchPosition ?? fallback.headerSearchPosition,
    searchLayout: composition.documentSearchLayout ?? fallback.headerSearchLayout,
    searchDropdownStretch: composition.documentSearchDropdownStretch ?? fallback.headerSearchDropdownStretch,
    searchDropdownLarge: composition.documentSearchDropdownLarge ?? fallback.headerSearchDropdownLarge ?? false,
    searchIconPosition: composition.documentSearchIconPosition ?? fallback.headerSearchIconPosition,
    socialPosition: composition.documentSocialPosition ?? fallback.headerSocialPosition,
    socialStyle: composition.documentSocialStyle ?? fallback.headerSocialStyle ?? false,
    socialGap: composition.documentSocialGap ?? fallback.headerSocialGap,
    socialItems: composition.documentSocialItems ?? fallback.headerSocialItems ?? [],
    logoPaddingRemove: composition.documentLogoPaddingRemove ?? fallback.headerLogoPaddingRemove ?? false,
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
