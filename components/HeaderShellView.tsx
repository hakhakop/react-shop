"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import Link from "next/link";

import HeaderActions from "./HeaderActions";
import HeaderCategoriesDropdown from "./HeaderCategoriesDropdown";
import HeaderFrame from "./HeaderFrame";
import HeaderNav from "./HeaderNav";
import MenuDropdownContent from "./MenuDropdownContent";
import type { BuilderLayout } from "@/lib/builderLayouts";
import HeaderSearchControl from "./HeaderSearchControl";
import HeaderSocialLinks from "./HeaderSocialLinks";
import type { MenuItem } from "../lib/navigation";
import type { HeaderSettings } from "../lib/themeSettings";
import type {
  BuilderCustomPage,
  BuilderLayoutKey,
} from "../lib/builderLayouts";
import type {
  BuilderHeaderIconId,
  BuilderHeaderIconVariant,
  BuilderHeaderLayout,
  BuilderMenuPresentationMap,
  BuilderShellSettings,
  ReactMenuItem,
} from "../lib/builderShell";
import type { HeaderBuilderComposition, HeaderBuilderElement } from "@/lib/headerBuilderDocument";
import { visualStyleClassName, visualStyleToCss } from "@/lib/builderVisualStyle";
import { typographyProps } from "@/lib/builderTypography";
import WebsiteLanguageSwitcher from "@/components/website/WebsiteLanguageSwitcher";
import UikitButton from "@/components/builder/UikitButton";
import UikitImage from "@/components/builder/UikitImage";
import { resolveHeaderHeightCss } from "@/lib/headerHeight";
import { resolveBuilderSpacing } from "@/lib/builderSpacing";
import { resolveHeaderDocumentSettings } from "@/lib/headerDocumentSettings";
import { resolveHeaderBuilderComposition } from "@/lib/headerBuilderComposition";
import { resolveHeaderMenuSourceItems } from "@/lib/headerMenuSources";
import { getNavigationRouteAliases } from "@/lib/navigationTargets";
import {
  BUILDER_IFRAME_DRAFT_MESSAGE,
  BUILDER_IFRAME_DRAFT_SOURCE,
} from "@/components/builder/BuilderIframeDraftBridge";
import type { BuilderState } from "@/components/dashboard/builderTypes";
import { normalizeHeaderMobileBreakpoint } from "@/lib/headerResponsive";

function asString(value: unknown, fallback: string | null = null): string | null {
  if (typeof value === "string" && value.trim() !== "") return value.trim();
  return fallback;
}

function normalizeLayout(
  value: string | undefined | null,
): "simple" | "two-row" | "hero" | "pill" | "princity" {
  switch ((value || "centered").toLowerCase()) {
    // YOOtheme's horizontal-justify preset is stored as WebPages' canonical
    // `wordpress` Header document layout. It is a single-row composition.
    case "wordpress":
      return "simple";
    case "simple":
      return "simple";
    case "hero":
    case "split":
      return "hero";
    case "pill":
      return "pill";
    case "princity":
    case "princity-clean":
    case "princity_clean":
    case "princity-flat":
    case "princity_flat":
      return "princity";
    case "two-row":
    case "centered":
    default:
      return "two-row";
  }
}

function normalizeLegacyHeaderSpacing(value: string | undefined) {
  if (value === "small") return "sm";
  if (value === "medium") return "md";
  if (value === "large") return "lg";
  return value;
}

function buildReactMenuTree(items: ReactMenuItem[] = []): MenuItem[] {
  const byId = new Map<string, MenuItem>();
  const roots: MenuItem[] = [];

  for (const item of items) {
    byId.set(item.id, {
      id: item.id,
      label: item.label,
      url: item.url,
      path: item.url,
      parentId: item.parentId || null,
      iconName: item.iconName || null,
      iconUrl: item.iconUrl || null,
      subtitle: item.subtitle || null,
      mobileUrl: item.mobileUrl || null,
      target: item.target,
      visibility: item.visibility,
      children: [],
    });
  }

  for (const item of byId.values()) {
    const parentId = item.parentId ?? null;
    if (parentId && byId.has(parentId)) {
      byId.get(parentId)!.children!.push(item);
    } else {
      roots.push(item);
    }
  }

  return roots;
}

function filterSaaSItems(items: MenuItem[]): MenuItem[] {
  return items
    .map((item) => ({
      ...item,
      children: item.children ? filterSaaSItems(item.children) : [],
    }))
    .filter((item) => {
      const href = (item.path || item.url || "").toLowerCase();
      const label = item.label.toLowerCase();
      return (
        !href.startsWith("/dashboard") &&
        !href.startsWith("/app") &&
        label !== "builder" &&
        label !== "dashboard"
      );
    });
}

type HeaderShellViewProps = {
  dropdownProjections?: Record<string, { signature: string; sections: BuilderLayout["sections"]; warnings?: string[] }>;
  layoutOverride?: BuilderHeaderLayout;
  shellSettings: Partial<BuilderShellSettings>;
  settings?: Record<string, unknown>;
  headerSettings: HeaderSettings;
  serviceHomepageMode?: boolean;
  homeHref?: string;
  clientHref?: string;
  scopedPreviewWebsiteId?: string;
  scopedPreviewPage?: BuilderLayoutKey;
  scopedPreviewPages?: Pick<BuilderCustomPage, "key" | "slug" | "systemRole">[];
  scopedLinkMode?: "builder" | "preview" | "tenant-path";
  hideSaaSEntry?: boolean;
  categoriesContent?: ReactNode;
  headerComposition: HeaderBuilderComposition;
  renderBuilderElement?: (
    element: HeaderBuilderElement,
    content: ReactNode,
    flexItemStyle?: CSSProperties,
  ) => ReactNode;
  renderBuilderColumn?: (columnId: string, content: ReactNode) => ReactNode;
  renderBuilderRow?: (rowId: string, content: ReactNode) => ReactNode;
  builderInteractionIdentity?: boolean;
  builderPreviewMode?: boolean;
  builderDraftPreview?: boolean;
  activeContentLanguage?: string;
  enabledContentLanguages?: string[];
  languagePreferenceKey?: string;
  languageSwitcherPreviewOnly?: boolean;
  onContentLanguageChange?: (language: string) => void;
  publicAnchorId?: string;
  scrollState?: {
    scrolled: boolean;
    hidden: boolean;
  };
};

export default function HeaderShellView({
  dropdownProjections,
  layoutOverride,
  shellSettings,
  settings = {},
  headerSettings,
  serviceHomepageMode = false,
  homeHref = "/",
  clientHref = "/client",
  scopedPreviewWebsiteId,
  scopedPreviewPage,
  scopedPreviewPages,
  scopedLinkMode,
  hideSaaSEntry = false,
  categoriesContent,
  headerComposition: initialHeaderComposition,
  renderBuilderElement: renderBuilderElementProp,
  renderBuilderColumn: renderBuilderColumnProp,
  renderBuilderRow: renderBuilderRowProp,
  builderInteractionIdentity = false,
  builderPreviewMode = false,
  builderDraftPreview = false,
  activeContentLanguage = "hy",
  enabledContentLanguages = ["hy"],
  languagePreferenceKey = "website_content_language",
  languageSwitcherPreviewOnly = false,
  onContentLanguageChange,
  publicAnchorId,
  scrollState,
}: HeaderShellViewProps) {
  const [liveHeaderComposition, setLiveHeaderComposition] = useState<HeaderBuilderComposition | null>(null);
  const [liveShellSettings, setLiveShellSettings] = useState<Partial<BuilderShellSettings> | null>(null);
  const liveHeaderRevisionRef = useRef(0);
  const liveShellRevisionRef = useRef(0);
  useEffect(() => {
    liveHeaderRevisionRef.current = 0;
    liveShellRevisionRef.current = 0;
    setLiveHeaderComposition(null);
    setLiveShellSettings(null);
    if (!builderDraftPreview) return;

    const handleDraftMessage = (event: MessageEvent) => {
      if (
        event.origin !== window.location.origin ||
        event.source !== window.parent ||
        event.data?.source !== BUILDER_IFRAME_DRAFT_SOURCE ||
        event.data?.type !== BUILDER_IFRAME_DRAFT_MESSAGE
      ) return;
      const revision = Number(event.data.revision);
      const nextShellSettings = event.data.shellSettings as Partial<BuilderShellSettings> | undefined;
      if (
        Number.isFinite(revision) &&
        revision > liveShellRevisionRef.current &&
        nextShellSettings &&
        typeof nextShellSettings === "object"
      ) {
        liveShellRevisionRef.current = revision;
        setLiveShellSettings(nextShellSettings);
      }
      if (event.data.documentKey !== "header") return;
      const state = event.data.state as BuilderState | undefined;
      if (!Number.isFinite(revision) || revision <= liveHeaderRevisionRef.current) return;
      if (!state || state.page !== "header" || !Array.isArray(state.sections)) return;

      // Header draft messages can race a page/shell URL transition. Only
      // replace the rendered Header with a structurally complete composition;
      // otherwise retain the server-hydrated document instead of blanking it.
      try {
        const candidate = resolveHeaderBuilderComposition({ sections: state.sections });
        if (!candidate.elements.length || !candidate.columns?.length) return;
        liveHeaderRevisionRef.current = revision;
        setLiveHeaderComposition(candidate);
      } catch {
        // Keep the canonical server composition on malformed/stale drafts.
      }
    };
    window.addEventListener("message", handleDraftMessage);
    return () => window.removeEventListener("message", handleDraftMessage);
  }, [builderDraftPreview]);
  const effectiveShellSettings = liveShellSettings ?? shellSettings;
  const headerComposition = liveHeaderComposition ?? initialHeaderComposition;
  const canonicalRows = headerComposition.rows ?? [];
  const hasCanonicalMobileRows = canonicalRows.some((row) => row.headerVariant === "mobile");
  const mobileBreakpoint = normalizeHeaderMobileBreakpoint(
    headerComposition.documentMobileBreakpoint ?? effectiveShellSettings.headerMobileBreakpoint,
  );
  const [activeHeaderVariant, setActiveHeaderVariant] = useState<"desktop" | "mobile">("desktop");
  useEffect(() => {
    if (!hasCanonicalMobileRows) {
      setActiveHeaderVariant("desktop");
      return;
    }
    const query = window.matchMedia(`(max-width: ${mobileBreakpoint})`);
    const update = () => setActiveHeaderVariant(query.matches ? "mobile" : "desktop");
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, [hasCanonicalMobileRows, mobileBreakpoint]);
  const activeRowIds = new Set(
    canonicalRows
      .filter((row) => !row.headerVariant || row.headerVariant === activeHeaderVariant)
      .map((row) => row.rowId),
  );
  const activeDocumentElements = headerComposition.elements.filter(
    (element) => !element.rowId || activeRowIds.has(element.rowId),
  );
  const renderBuilderElement = renderBuilderElementProp ?? (builderInteractionIdentity
    ? (element: HeaderBuilderElement, content: ReactNode, flexItemStyle?: CSSProperties) => (
        <div style={flexItemStyle} data-builder-object-type="block" data-builder-section-id="header-document"
          data-builder-column-key={element.columnId ?? "header-main-row"} data-builder-block-key={element.id}>{content}</div>
      )
    : undefined);
  const renderBuilderColumn = renderBuilderColumnProp ?? (builderInteractionIdentity
    ? (columnId: string, content: ReactNode) => (
        <div data-builder-object-type="column" data-builder-section-id="header-document"
          data-builder-column-key={columnId} style={{ display: "contents" }}>{content}</div>
      )
    : undefined);
  const renderBuilderRow = renderBuilderRowProp ?? (builderInteractionIdentity
    ? (rowId: string, content: ReactNode) => {
        const rowIndex = (headerComposition.rows ?? []).findIndex((row) => row.rowId === rowId);
        return <div data-builder-object-type="row" data-builder-section-id="header-document"
          data-builder-row-index={Math.max(0, rowIndex)} style={{ display: "contents" }}>{content}</div>;
      }
    : undefined);
  const documentLogo = activeDocumentElements.find((item) => item.type === "logo");
  const documentNavigation = activeDocumentElements.find((item) => item.type === "navigation");
  const primaryColor =
    asString(effectiveShellSettings.primaryColor) ||
    asString(settings.primary_color) ||
    "#111827";
  const accentColor =
    asString(effectiveShellSettings.accentColor) ||
    asString(settings.accent_color) ||
    "#ec4899";
  const logoField = settings.logo || settings.site_logo || settings.store_logo;

  let logoUrl: string | null = null;
  if (typeof logoField === "string") {
    logoUrl = logoField;
  } else if (logoField && typeof logoField === "object") {
    const logoObject = logoField as Record<string, unknown>;
    logoUrl =
      (logoObject.url as string) ||
      (logoObject.source_url as string) ||
      (logoObject.sourceUrl as string) ||
      (logoObject.full_url as string) ||
      null;
  }

  const brandName = asString(
    settings.brand_name ||
      settings.site_title ||
      settings.store_name ||
      settings.blogname,
    null,
  );
  const topBarText = asString(
    settings.top_bar_text,
    "Fast support & setup by Webpages",
  );
  const supportPhone = asString(settings.support_phone, "+374 xx xx xx");
  const currencyLabel = asString(settings.currency_label, "AMD ֏");
  const documentSettings = resolveHeaderDocumentSettings(
    headerComposition,
    effectiveShellSettings,
  );
  // `wordpress` is the canonical persisted name for YOOtheme's
  // horizontal-justify preset. Do not fall back to the legacy theme setting,
  // otherwise an imported Header document silently loses its layout.
  const layoutValue = documentSettings.layout === "wordpress"
    ? "wordpress"
    : documentSettings.layout ?? layoutOverride ?? asString(settings.layout, "centered");
  const layout = activeHeaderVariant === "mobile" && hasCanonicalMobileRows
    ? "simple"
    : normalizeLayout(layoutValue);
  // The Header document behavior is already the canonical variant selected by
  // the document. Do not reinterpret an explicit `sticky` value using the
  // legacy compatibility flag: that changes the live runtime variant while
  // leaving the persisted mapping looking correct.
  const effectiveHeaderBehavior = activeHeaderVariant === "mobile" && hasCanonicalMobileRows
    ? documentSettings.mobileBehavior ?? "static"
    : documentSettings.behavior;
  const headerHeight = resolveHeaderHeightCss(
    documentSettings.height,
    documentSettings.customHeight,
  );
  const documentPaddingTop = resolveBuilderSpacing(
    normalizeLegacyHeaderSpacing(headerComposition.documentTopSpacing) ?? "none",
    "sectionPadding",
    "none",
  ).css;
  const documentPaddingBottom = resolveBuilderSpacing(
    normalizeLegacyHeaderSpacing(headerComposition.documentBottomSpacing) ?? "none",
    "sectionPadding",
    "none",
  ).css;
  const documentMarginTop = resolveBuilderSpacing(
    normalizeLegacyHeaderSpacing(headerComposition.documentTopMargin) ?? "none",
    "sectionMargin",
    "none",
  ).css;
  const documentMarginBottom = resolveBuilderSpacing(
    normalizeLegacyHeaderSpacing(headerComposition.documentBottomMargin) ?? "none",
    "sectionMargin",
    "none",
  ).css;
  const topToolbarVisible = documentSettings.topToolbarVisible;
  const effectiveTopBarText =
    typeof documentSettings.topToolbarText === "string"
      ? documentSettings.topToolbarText
      : topBarText;
  const effectiveSupportPhone =
    typeof documentSettings.topToolbarPhone === "string"
      ? documentSettings.topToolbarPhone
      : supportPhone;
  const effectiveToolbarMeta =
    typeof documentSettings.topToolbarMeta === "string"
      ? documentSettings.topToolbarMeta
      : currencyLabel;
  const hasTopToolbarContent = Boolean(
    effectiveTopBarText?.trim() ||
    effectiveSupportPhone?.trim() ||
    effectiveToolbarMeta?.trim(),
  );
  const showTopToolbar = topToolbarVisible && hasTopToolbarContent;
  const hasCanonicalToolbarRow = Boolean(
    headerComposition.rows?.some((row) => row.role === "toolbar"),
  );
  const showLegacyTopToolbar = showTopToolbar && !hasCanonicalToolbarRow;
  const effectiveHeaderBackgroundMode =
    documentSettings.backgroundMode;
  const documentHeaderBackground =
    headerComposition.documentBackground &&
    headerComposition.documentBackground !== "transparent"
      ? headerComposition.documentBackground
      : undefined;
  const documentVisualCss = visualStyleToCss(headerComposition.documentVisualStyle);
  const documentVisualBackground = documentVisualCss.background as string | undefined;
  const documentVisualBackgroundImage = documentVisualCss.backgroundImage as string | undefined;
  const documentVisualGradient = documentVisualBackground?.includes("gradient(")
    ? documentVisualBackground
    : undefined;
  const documentVisualColor = documentVisualGradient ? undefined : documentVisualBackground;
  const hasDocumentBackground = Boolean(
    documentHeaderBackground || documentVisualBackground || documentVisualBackgroundImage,
  );
  const headerMustBeTransparent = documentSettings.transparent;
  const effectiveHeaderTextMode = documentSettings.textMode;
  const effectiveLogoUrl = documentLogo?.imageUrl || effectiveShellSettings.headerLogoUrl || logoUrl;
  const effectiveBrandText =
    documentLogo?.headerBrandText || effectiveShellSettings.headerBrandText ||
    (brandName ? brandName : serviceHomepageMode ? "WebPages" : null);
  const effectiveLogoAlt =
    documentLogo?.imageAlt || effectiveShellSettings.headerLogoAlt || effectiveBrandText || "Store logo";
  const effectiveBrandMode =
    documentLogo?.headerBrandMode || effectiveShellSettings.headerBrandMode || (serviceHomepageMode ? "brand" : "logo");
  const effectiveLogoMaxWidth =
    documentLogo?.imageMaxWidth || effectiveShellSettings.headerLogoMaxWidth || headerSettings.logoMaxWidth;
  const effectiveInverseLogoUrl =
    documentLogo?.imageInverseUrl || documentSettings.inverseLogoUrl || null;
  const effectiveIconVariant =
    effectiveShellSettings.headerIconVariant || headerSettings.iconVariant;
  const effectiveActiveIndicator =
    documentNavigation?.menuActiveIndicator ||
    (layout === "princity" ? "princity" : "underline");
  const navigationHoverLine = documentNavigation?.headerNavigationOverrides?.hoverLine
    ? documentNavigation.menuHoverLine
    : undefined;
  const navigationHoverVariant = documentNavigation?.headerNavigationOverrides?.hoverVariant
    ? documentNavigation.menuHoverVariant ?? "none"
    : "inherit";
  const navbarLineMode = navigationHoverVariant !== "inherit"
    ? navigationHoverVariant === "line" || navigationHoverVariant === "line-glow"
      ? "enabled"
      : "disabled"
    : navigationHoverLine
      ? navigationHoverLine === "none" ? "disabled" : "enabled"
      : effectiveShellSettings.navbarNavItemLineMode === "true" ? "enabled" : "disabled";
  const navbarLinePosition = ["top", "bottom", "left", "right"].includes(
    navigationHoverLine && navigationHoverLine !== "none"
      ? navigationHoverLine
      : effectiveShellSettings.navbarNavItemLinePositionMode ?? "",
  )
    ? navigationHoverLine && navigationHoverLine !== "none"
      ? navigationHoverLine
      : effectiveShellSettings.navbarNavItemLinePositionMode
    : "bottom";
  const navbarLineSlide = ["fixed", "center", "left", "right"].includes(
    effectiveShellSettings.navbarNavItemLineSlideMode ?? "",
  )
    ? effectiveShellSettings.navbarNavItemLineSlideMode
    : "center";
  const navigationDividerMode = documentNavigation?.headerNavigationOverrides?.divider
    ? documentNavigation.menuDividerMode
    : undefined;
  const navbarVerticalBorder = ["partial", "all"].includes(
    navigationDividerMode ?? effectiveShellSettings.navbarModeBorderVertical ?? "",
  )
    ? navigationDividerMode ?? effectiveShellSettings.navbarModeBorderVertical
    : "none";
  const dropdownIndicator = documentNavigation?.headerNavigationOverrides?.dropdownIndicator
    ? documentNavigation.menuDropdownIndicator ?? "none"
    : effectiveShellSettings.navbarDropdownIndicator === "chevron" ? "chevron" : "none";
  const parentIconEnabled = documentNavigation?.menuShowParentIcon ??
    (documentSettings.parentIconEnabled || dropdownIndicator === "chevron");
  const clickModeEnabled = documentNavigation?.menuClickMode ?? documentSettings.clickModeEnabled;
  const headerClassName = [
    layout === "pill" || layout === "princity" ? "site-header--pill" : "",
    serviceHomepageMode ? "site-header--service" : "",
    showLegacyTopToolbar || hasCanonicalToolbarRow ? "" : "site-header--toolbar-hidden",
    headerMustBeTransparent || effectiveHeaderBackgroundMode === "none"
      ? "site-header--no-background"
      : "",
    `site-header--background-${headerMustBeTransparent ? "none" : effectiveHeaderBackgroundMode}`,
    `site-header--indicator-${effectiveActiveIndicator}`,
    `site-header--navbar-line-mode-${navbarLineMode}`,
    `site-header--navbar-line-position-${navbarLinePosition}`,
    `site-header--navbar-line-slide-${navbarLineSlide}`,
    `site-header--nav-hover-${navigationHoverVariant}`,
    `site-header--navbar-border-vertical-${navbarVerticalBorder}`,
    builderDraftPreview ? "site-header--builder-preview" : "",
    documentSettings.overlay ? "site-header--builder-overlay" : "",
    documentSettings.dropbarEnabled ? "site-header--dropdown-dropbar" : "",
    documentSettings.dropdownAlignToNavbar || documentSettings.dropbarEnabled
      ? "site-header--dropdown-boundary-navbar"
      : "",
    clickModeEnabled ? "site-header--dropdown-click" : "site-header--dropdown-hover",
    documentSettings.dropdownAlign
      ? `site-header--dropdown-align-${documentSettings.dropdownAlign}`
      : "",
    hasDocumentBackground
      ? "site-header--document-background"
      : "",
    `site-header--builder-width-${documentSettings.widthMode}`,
    hasCanonicalMobileRows ? `site-header--canonical-${activeHeaderVariant}` : "",
    activeHeaderVariant === "mobile" && documentSettings.mobileLayout
      ? `site-header--mobile-layout-${documentSettings.mobileLayout}`
      : "",
    activeHeaderVariant === "mobile" ? (documentSettings.mobileLogoPaddingRemove ? "site-header--logo-padding-remove" : "") : (documentSettings.logoPaddingRemove ? "site-header--logo-padding-remove" : ""),
  ]
    .filter(Boolean)
    .join(" ");
  const allDocumentElements = activeDocumentElements;
  const compositionTypes = new Set(allDocumentElements.map((item) => item.type));
  const showLogoElement = compositionTypes.has("logo");
  const showButtonElement = compositionTypes.has("button");
  const showLogo = showLogoElement &&
    Boolean(effectiveLogoUrl) &&
    (effectiveBrandMode === "logo" || effectiveBrandMode === "both");
  const showBrand =
    Boolean(effectiveBrandText) &&
    (effectiveBrandMode === "brand" ||
      effectiveBrandMode === "both" ||
      !showLogo);
  const defaultMenuItems =
    Array.isArray(effectiveShellSettings.menuItems) && effectiveShellSettings.menuItems.length > 0
      ? buildReactMenuTree(effectiveShellSettings.menuItems)
      : [
          { id: "home", label: "Home", url: "/", path: "/" },
          { id: "shop", label: "Shop", url: "/shop", path: "/shop" },
        ];
  const menuPresentation =
    (effectiveShellSettings.menuPresentation as BuilderMenuPresentationMap | undefined) ??
    {};
  const categories = categoriesContent ?? null;
  const renderCategoriesMega = (element?: HeaderBuilderElement) =>
    categories ? (
      <HeaderCategoriesDropdown
        label={element?.categoriesLabel || "Categories"}
        showLabel={element?.categoriesShowLabel !== false}
        display={element?.categoriesDisplay}
        icon={element?.categoriesIcon}
        iconPosition={element?.categoriesIconPosition}
        dropdownAlign={element?.categoriesDropdownAlign}
        isBuilder={Boolean(renderBuilderElement)}
        triggerStyle={{
          ...typographyProps(element?.typography, "button").style,
          ...(element?.buttonBg ? { background: element.buttonBg } : {}),
          ...(element?.buttonTextColor ? { color: element.buttonTextColor } : {}),
          ...(element?.buttonBorderRadius ? { borderRadius: element.buttonBorderRadius } : {}),
          ...(element?.buttonBorderWidth ? { borderWidth: element.buttonBorderWidth, borderStyle: "solid" } : {}),
          ...(element?.buttonBorderColor ? { borderColor: element.buttonBorderColor } : {}),
          ...(element?.buttonPaddingY ? { paddingTop: element.buttonPaddingY, paddingBottom: element.buttonPaddingY } : {}),
          ...(element?.buttonPaddingX ? { paddingLeft: element.buttonPaddingX, paddingRight: element.buttonPaddingX } : {}),
        }}
      >
        {categories}
      </HeaderCategoriesDropdown>
    ) : null;
  const renderNavigation = (element: HeaderBuilderElement) => {
    const source = element.menuSource?.trim();
    const sourceItems = resolveHeaderMenuSourceItems(effectiveShellSettings, source);
    const hasNamedSource = Boolean(
      source &&
      source !== "main" &&
      effectiveShellSettings.namedMenus?.some((menu) => menu.id === source),
    );
    const menuItems = hasNamedSource
      ? buildReactMenuTree(sourceItems)
      : defaultMenuItems;

    return (
      <HeaderNav
        dropdownContentById={Object.fromEntries(sourceItems.filter(item => !item.parentId && item.dropdownContent?.sublayout.rows.length && !item.dropdownContent.sublayout.disabled).map(item => [item.id,
          <MenuDropdownContent key={item.id} content={item.dropdownContent!}
            initialSections={dropdownProjections?.[item.dropdownContent!.id]?.sections}
            initialSignature={dropdownProjections?.[item.dropdownContent!.id]?.signature}
            initialWarnings={dropdownProjections?.[item.dropdownContent!.id]?.warnings}
            draft={builderDraftPreview} websiteId={scopedPreviewWebsiteId} page={scopedPreviewPage} shellSettings={effectiveShellSettings}
            linkProjection={scopedPreviewWebsiteId ? { mode: scopedLinkMode ?? "preview", context: { websiteId: scopedPreviewWebsiteId, pages: scopedPreviewPages, systemRouteAliases: getNavigationRouteAliases(effectiveShellSettings as BuilderShellSettings) } } : undefined} />]))}
        items={filterSaaSItems(menuItems)}
        presentationById={menuPresentation}
        categories={
          (!source || source === "main") && compositionTypes.has("categories")
            ? categories
            : null
        }
        serviceHomepageMode={serviceHomepageMode}
        scopedPreviewWebsiteId={scopedPreviewWebsiteId}
        activePageKey={scopedPreviewPage}
        scopedPreviewPages={scopedPreviewPages}
        systemRouteAliases={getNavigationRouteAliases(effectiveShellSettings as BuilderShellSettings)}
        scopedLinkMode={scopedLinkMode}
        activeContentLanguage={activeContentLanguage}
        dropdownIndicator={dropdownIndicator}
        parentIconEnabled={parentIconEnabled}
        clickModeEnabled={clickModeEnabled}
        canonicalMobile={activeHeaderVariant === "mobile" && hasCanonicalMobileRows}
        dialogLayout={activeHeaderVariant === "mobile" ? documentSettings.mobileDialogLayout : documentSettings.dialogLayout}
        dialogMenuStyle={activeHeaderVariant === "mobile" ? documentSettings.mobileDialogMenuStyle : documentSettings.dialogMenuStyle}
        dialogCenter={activeHeaderVariant === "mobile" ? documentSettings.mobileDialogCenter : documentSettings.dialogCenter}
        dialogPushAfter={activeHeaderVariant === "mobile" ? documentSettings.mobileDialogPushAfter : documentSettings.dialogPushAfter}
        dialogClose={activeHeaderVariant === "mobile" ? documentSettings.mobileDialogClose : true}
        offcanvasMode={activeHeaderVariant === "mobile" ? documentSettings.mobileOffcanvasMode : documentSettings.offcanvasMode}
        offcanvasFlip={activeHeaderVariant === "mobile" ? documentSettings.mobileOffcanvasFlip : documentSettings.offcanvasFlip}
        offcanvasOverlay={activeHeaderVariant === "mobile" ? documentSettings.mobileOffcanvasOverlay : documentSettings.offcanvasOverlay}
        dropbarAnimation={activeHeaderVariant === "mobile" ? documentSettings.mobileDialogDropbarAnimation : documentSettings.dialogDropbarAnimation}
        style={typographyProps(element.typography, "body").style}
      />
    );
  };
  const renderLogoAndBrand = (element?: HeaderBuilderElement) => {
    const elementLogoUrl = element?.imageUrl || effectiveLogoUrl;
    const elementLogoAlt = element?.imageAlt || effectiveLogoAlt;
    const elementLogoMaxWidth = element?.imageSvgInline === true && element.imageMaxWidth == null
      ? undefined
      : element?.imageMaxWidth || effectiveLogoMaxWidth;
    const effectiveMobileLogoUrl =
      element?.imageMobileUrl || documentSettings.mobileLogoUrl || null;
    const elementBrandMode = element?.headerBrandMode || effectiveBrandMode;
    const elementBrandText = element?.headerBrandText || effectiveBrandText;
    const elementImageAlignment = element?.imageAlignment || "left";

    const elementShowLogo = Boolean(elementLogoUrl) && (elementBrandMode === "logo" || elementBrandMode === "both");
    const elementShowBrand = Boolean(elementBrandText) && (elementBrandMode === "brand" || elementBrandMode === "both" || !elementShowLogo);

    const alignStyle: CSSProperties = {
      display: "flex",
      alignItems: "center",
      gap: "12px",
      justifyContent: elementImageAlignment === "center" ? "center" : elementImageAlignment === "right" ? "flex-end" : "flex-start",
    };

    return (
      <div className="site-header-logo-wrap" style={alignStyle}>
        {elementShowLogo && elementLogoUrl && (
          <Link href={homeHref} className="site-header-logo-img-wrap">
            <span className="site-header-logo-primary">
              <UikitImage
                block={{
                id: element?.id ?? "header-logo",
                kind: "image",
                imageUrl: elementLogoUrl,
                imageAlt: elementLogoAlt,
                imageWidth: element?.imageWidth,
                imageMaxWidth: elementLogoMaxWidth,
                imageHeight: element?.imageHeight,
                imageFit: element?.imageFit ?? "contain",
                imageRatio: element?.imageRatio,
                imageAlignment: elementImageAlignment,
                imageShape: element?.imageShape,
                imageBorder: element?.imageBorder,
                imageShadow: element?.imageShadow,
                imageBoxShadow: element?.imageBoxShadow,
                imageSvgInline: element?.imageSvgInline,
                imageSvgColor: element?.imageSvgColor,
                imagePosition: element?.imagePosition,
                // Header logos are above the fold. Eager loading also avoids
                // an intrinsic-size inline SVG waiting on an observer target
                // that has no box until the SVG itself is available.
                imageLoading: element?.imageLoading ?? "eager",
                }}
              />
            </span>
            {effectiveInverseLogoUrl && (
              <img
                src={effectiveInverseLogoUrl}
                alt={elementLogoAlt}
                className="site-header-logo-inverse"
                loading="eager"
              />
            )}
            {effectiveMobileLogoUrl && (
              <img
                src={effectiveMobileLogoUrl}
                alt={elementLogoAlt}
                className="site-header-logo-mobile"
                loading="eager"
              />
            )}
          </Link>
        )}

        {elementShowBrand && elementBrandText && (
          <Link href={homeHref} className="site-header-brand">
            <span style={typographyProps(element?.typography, "title").style}>
              {elementBrandText}
            </span>
          </Link>
        )}
      </div>
    );
  };
  const renderHeaderButton = (buttonElement?: HeaderBuilderElement) => showButtonElement ? (
    <UikitButton
      scopeClassName="shop-builder-main"
      block={{
        id: buttonElement?.id ?? "header-button",
        kind: "button",
        headerButtonMode: true,
        buttonLabel: buttonElement?.label || "Start",
        buttonUrl: buttonElement?.url || clientHref,
        buttonStyle: buttonElement?.buttonStyle || "primary",
        size: buttonElement?.size,
        fullWidthButton: buttonElement?.fullWidthButton,
        buttonTarget: buttonElement?.buttonTarget,
        buttonGap: buttonElement?.buttonGap,
        buttonBg: buttonElement?.buttonBg,
        buttonTextColor: buttonElement?.buttonTextColor,
        buttonBorderWidth: buttonElement?.buttonBorderWidth,
        buttonBorderColor: buttonElement?.buttonBorderColor,
        buttonBorderRadius: buttonElement?.buttonBorderRadius,
        buttonPaddingY: buttonElement?.buttonPaddingY,
        buttonPaddingX: buttonElement?.buttonPaddingX,
        buttonHoverBg: buttonElement?.buttonHoverBg,
        buttonHoverTextColor: buttonElement?.buttonHoverTextColor,
        buttonHoverBorderColor: buttonElement?.buttonHoverBorderColor,
        buttonHoverEffect: buttonElement?.buttonHoverEffect,
        buttonHoverTransform: buttonElement?.buttonHoverTransform,
        buttonHoverBoxShadow: buttonElement?.buttonHoverBoxShadow,
        typography: buttonElement?.typography,
      }}
    />
  ) : null;
  const toolbarRowIds = new Set(
    canonicalRows
      .filter((row) => activeRowIds.has(row.rowId) && row.role === "toolbar")
      .map((row) => row.rowId),
  );
  const activeColumns = (headerComposition.columns ?? []).filter((column) => activeRowIds.has(column.rowId));
  const primaryRowId = activeColumns.find(
    (column) => !toolbarRowIds.has(column.rowId),
  )?.rowId ?? allDocumentElements.find(
    (element) => !element.rowId || !toolbarRowIds.has(element.rowId),
  )?.rowId;
  const orderedElements = primaryRowId
    ? allDocumentElements.filter((element) => element.rowId === primaryRowId)
    : allDocumentElements;
  const additionalRows = primaryRowId
    ? Array.from(new Set([
        ...activeColumns.map((column) => column.rowId),
        ...allDocumentElements.map((element) => element.rowId),
      ].filter((rowId): rowId is string => Boolean(rowId) && rowId !== primaryRowId))).map((rowId) => ({
        rowId,
        elements: allDocumentElements.filter((element) => element.rowId === rowId),
        columns: activeColumns.filter((column) => column.rowId === rowId),
      }))
    : [];

  const getRowStyles = (rowId: string | undefined): CSSProperties => {
    if (!rowId) return {};
    const rowComp = headerComposition.rows?.find((r) => r.rowId === rowId);
    if (!rowComp) return {};

    const visualStyles = visualStyleToCss(rowComp.rowVisualStyle);
    const bg = rowComp.rowBackground && rowComp.rowBackground !== "transparent" ? rowComp.rowBackground : undefined;
    const localBackground = visualStyles.background as string | undefined;
    const visualBackgroundImage = visualStyles.backgroundImage as string | undefined;
    const localGradient = localBackground?.includes("gradient(") ? localBackground : undefined;
    const localColor = localGradient ? undefined : localBackground;
    const resolvedTopPadding = rowComp.rowTopSpacing !== undefined
      ? resolveBuilderSpacing(rowComp.rowTopSpacing, "rowPadding", effectiveShellSettings.rowPaddingTop).css
      : visualStyles.paddingTop === undefined
        ? (headerHeight ? "0px" : resolveBuilderSpacing(
            normalizeLegacyHeaderSpacing(effectiveShellSettings.rowPaddingTop) ?? "none",
            "rowPadding",
          ).css)
        : undefined;
    const resolvedBottomPadding = rowComp.rowBottomSpacing !== undefined
      ? resolveBuilderSpacing(rowComp.rowBottomSpacing, "rowPadding", effectiveShellSettings.rowPaddingBottom).css
      : visualStyles.paddingBottom === undefined
        ? (headerHeight ? "0px" : resolveBuilderSpacing(
            normalizeLegacyHeaderSpacing(effectiveShellSettings.rowPaddingBottom) ?? "none",
            "rowPadding",
          ).css)
        : undefined;
    const resolvedTopMargin = rowComp.rowTopMargin !== undefined
      ? resolveBuilderSpacing(rowComp.rowTopMargin, "rowMargin", effectiveShellSettings.rowMarginTop).css
      : visualStyles.marginTop === undefined
        ? resolveBuilderSpacing("none", "rowMargin").css
        : undefined;
    const resolvedBottomMargin = rowComp.rowBottomMargin !== undefined
      ? resolveBuilderSpacing(rowComp.rowBottomMargin, "rowMargin", effectiveShellSettings.rowMarginBottom).css
      : visualStyles.marginBottom === undefined
        ? resolveBuilderSpacing("none", "rowMargin").css
        : undefined;

    return {
      ...visualStyles,
      ...(bg ? { background: bg } : {}),
      ...((localColor || bg) ? { "--header-row-local-background-color": localColor || bg } : {}),
      ...((visualBackgroundImage || localGradient) ? { "--header-row-local-background-image": visualBackgroundImage || localGradient } : {}),
      ...(rowComp.headerGap ? { "--header-builder-row-gap": rowComp.headerGap } : {}),
      ...(rowComp.headerJustify ? { "--header-builder-row-justify": rowComp.headerJustify } : {}),
      ...(rowComp.headerAlign ? { "--header-builder-row-align": rowComp.headerAlign } : {}),
      ...(rowComp.horizontalDistribution ? {
        "--header-builder-row-justify": rowComp.horizontalDistribution === "justify"
          ? "space-between"
          : rowComp.horizontalDistribution === "left"
            ? "flex-start"
            : "center",
      } : {}),
      ...(rowComp.maxWidth && rowComp.maxWidth !== "inherit" ? {
        width: "100%",
        maxWidth: rowComp.maxWidth === "small"
          ? "var(--uk-container-small-max-width, 900px)"
          : rowComp.maxWidth === "default" || rowComp.maxWidth === "medium"
            ? "var(--uk-container-default-max-width, 1200px)"
            : rowComp.maxWidth === "large"
              ? "var(--uk-container-large-max-width, 1400px)"
              : rowComp.maxWidth === "xlarge"
                ? "var(--uk-container-xlarge-max-width, 1600px)"
                : "100%",
        marginInline: "auto",
      } : {}),
      ...(rowComp.removeHorizontalPadding ? { paddingInline: 0 } : {}),
      ...(resolvedTopPadding !== undefined ? { paddingTop: resolvedTopPadding } : {}),
      ...(resolvedBottomPadding !== undefined ? { paddingBottom: resolvedBottomPadding } : {}),
      ...(resolvedTopMargin !== undefined ? { marginTop: resolvedTopMargin } : {}),
      ...(resolvedBottomMargin !== undefined ? { marginBottom: resolvedBottomMargin } : {}),
      ...(rowComp.rowBorderRadius !== undefined ? { borderRadius: `${rowComp.rowBorderRadius}px` } : {}),
    } as CSSProperties;
  };

  const getRowClass = (rowId: string | undefined): string => {
    if (!rowId) return "";
    const rowComp = headerComposition.rows?.find((r) => r.rowId === rowId);
    if (!rowComp) return "";

    let cls = "";
    const rowVisualCss = visualStyleToCss(rowComp.rowVisualStyle);
    if (
      (rowComp.rowBackground && rowComp.rowBackground !== "transparent") ||
      rowVisualCss.background ||
      rowVisualCss.backgroundImage
    ) {
      cls += " site-header-builder-row--local-background";
    }
    if (rowComp.rowColorScheme === "dark") {
      cls += " theme-dark bg-slate-900 text-white";
    } else if (rowComp.rowColorScheme === "light") {
      cls += " theme-light bg-white text-slate-900";
    }
    if (rowComp.role === "toolbar") cls += " site-header-builder-extra-row--toolbar";
    return cls;
  };

  const renderCompositionElement = (
    element: HeaderBuilderElement,
    flexItemStyle?: CSSProperties,
  ) => {
    const localHoverEffect = element.buttonHoverEffect === "inherit"
      ? undefined
      : element.buttonHoverEffect;
    const localHoverTransform = element.buttonHoverTransform ?? (
      localHoverEffect === "lift"
        ? "translateY(-2px)"
        : localHoverEffect === "grow"
          ? "scale(1.04)"
          : localHoverEffect === "none"
            ? "none"
            : undefined
    );
    const localHoverShadow = element.buttonHoverBoxShadow ?? (
      localHoverEffect === "lift"
        ? "0 16px 34px rgba(17, 17, 17, 0.16)"
        : localHoverEffect
          ? "none"
          : undefined
    );
    let content: ReactNode = null;
    if (element.type === "logo") content = renderLogoAndBrand(element);
    if (element.type === "navigation") content = renderNavigation(element);
    if (element.type === "button") content = renderHeaderButton(element);
    if (element.type === "spacer") content = <span className="header-builder-spacer-content" aria-hidden="true" />;
    if (element.type === "utility" && element.utilityAction) {
      content = element.utilityAction === "search" ? (
        <HeaderSearchControl
          layout={activeHeaderVariant === "mobile" ? documentSettings.mobileSearchLayout : documentSettings.searchLayout}
          stretch={activeHeaderVariant === "mobile" ? documentSettings.mobileSearchDropdownStretch : documentSettings.searchDropdownStretch}
          large={activeHeaderVariant === "mobile" ? documentSettings.mobileSearchDropdownLarge : documentSettings.searchDropdownLarge}
          iconPosition={activeHeaderVariant === "mobile" ? documentSettings.mobileSearchIconPosition : documentSettings.searchIconPosition}
        />
      ) : (
        <HeaderActions
          icons={[element.utilityAction as BuilderHeaderIconId]}
          iconVariant={(element.utilityVariant as BuilderHeaderIconVariant | undefined) ?? effectiveIconVariant}
        />
      );
    }
    if (element.type === "social") {
      content = <HeaderSocialLinks items={element.socialItems ?? []} buttonStyle={element.socialStyle} gap={element.socialGap} />;
    }
    if (element.type === "categories") content = renderCategoriesMega(element);
    if (element.type === "language") {
      const triggerStyle: CSSProperties = {
        ...(element.buttonBg ? { background: element.buttonBg } : {}),
        ...(element.buttonTextColor ? { color: element.buttonTextColor } : {}),
        ...(element.buttonBorderRadius ? { borderRadius: element.buttonBorderRadius } : {}),
        ...(element.buttonBorderWidth ? { borderWidth: element.buttonBorderWidth, borderStyle: "solid" } : {}),
        ...(element.buttonBorderColor ? { borderColor: element.buttonBorderColor } : {}),
        ...(element.buttonPaddingY ? { paddingTop: element.buttonPaddingY, paddingBottom: element.buttonPaddingY } : {}),
        ...(element.buttonPaddingX ? { paddingLeft: element.buttonPaddingX, paddingRight: element.buttonPaddingX } : {}),
        ...typographyProps(element.typography, "button").style,
      };
      content = (
        <WebsiteLanguageSwitcher
          activeLanguage={activeContentLanguage}
          enabledLanguages={enabledContentLanguages}
          preferenceKey={languagePreferenceKey}
          previewOnly={languageSwitcherPreviewOnly}
          display={element.languageDisplay}
          onLanguageChange={onContentLanguageChange}
          triggerStyle={triggerStyle}
        />
      );
    }
    const alignment = element.type === "logo" ? element.imageAlignment : element.elementAlign;
    const elementStyle: CSSProperties = {
      ...visualStyleToCss(element.visualStyle),
      ...(alignment
        ? {
            display: "flex",
            alignItems: "center",
            justifyContent:
              alignment === "center"
                ? "center"
                : alignment === "right"
                ? "flex-end"
                : "flex-start",
            textAlign: alignment as CSSProperties["textAlign"],
          }
        : {}),
      ...(element.type === "navigation"
        ? ({
            ...(element.menuItemGap
              ? { "--header-builder-menu-gap": element.menuItemGap }
              : {}),
            ...(element.menuHoverColor ? { "--header-builder-menu-hover": element.menuHoverColor } : {}),
            ...(element.menuActiveColor ? { "--header-builder-menu-active": element.menuActiveColor } : {}),
          } as CSSProperties)
        : {}),
      ...(element.type === "button" || element.type === "categories" || element.type === "language"
        ? ({
            "--header-builder-button-hover-bg": element.type === "button" ? undefined : element.buttonHoverBg,
            "--header-builder-button-hover-text": element.buttonHoverTextColor,
            "--header-builder-button-hover-border": element.buttonHoverBorderColor,
            "--header-builder-button-hover-background": element.type === "button" ? element.buttonHoverBg : undefined,
            "--header-builder-button-hover-transform": localHoverTransform,
            "--header-builder-button-hover-shadow": localHoverShadow,
            "--header-builder-button-background": element.type === "button" ? element.buttonBg : undefined,
            "--header-builder-button-text": element.type === "button" ? element.buttonTextColor : undefined,
            "--header-builder-button-radius": element.type === "button" ? element.buttonBorderRadius : undefined,
            "--header-builder-button-border-width": element.type === "button" ? element.buttonBorderWidth : undefined,
            "--header-builder-button-border-color": element.type === "button" ? element.buttonBorderColor : undefined,
            "--header-builder-button-padding-y": element.type === "button" ? element.buttonPaddingY : undefined,
            "--header-builder-button-padding-x": element.type === "button" ? element.buttonPaddingX : undefined,
          } as CSSProperties)
        : {}),
      ...(element.type === "categories" || element.type === "language"
        ? typographyProps(element.typography, "button").style
        : {}),
    };
    const styledContent = (
      <div
        className={`header-builder-element header-builder-element--${element.type} ${visualStyleClassName(element.visualStyle)}`}
        data-header-element-id={element.id}
        style={elementStyle}
      >
        {content}
      </div>
    );
    return renderBuilderElement
      ? renderBuilderElement(element, styledContent, flexItemStyle)
      : styledContent;
  };
  const primaryColumns = activeColumns.filter((column) => column.rowId === primaryRowId)
    ?? Array.from(new Set(orderedElements.map((element) => element.columnId).filter(Boolean))).map((id) => ({ id: id!, rowId: primaryRowId ?? "header-main-row", flex: 1 }));
  const usesColumnLayout = primaryColumns.length > 1 || Boolean(renderBuilderColumn && primaryColumns.length);
  const renderColumn = (column: { id: string; flex: number }) => {
    const columnElements = orderedElements.filter((element) => element.columnId === column.id);
    const columnAlignment = columnElements[0]
      ? columnElements[0].type === "logo"
        ? columnElements[0].imageAlignment
        : columnElements[0].elementAlign
      : "left";
    const content = (
      <div
        className={`header-builder-column${columnElements.length === 0 ? " is-empty" : ""}`}
        data-header-column-align={columnAlignment}
        style={{
          flex: column.flex,
          justifyContent:
            columnAlignment === "center"
              ? "center"
              : columnAlignment === "right"
                ? "flex-end"
                : "flex-start",
        }}
      >
        {columnElements.map((element, elementIndex) => {
          const alignment = element.type === "logo" ? element.imageAlignment : element.elementAlign;
          const isFirst = elementIndex === 0;
          const isLast = elementIndex === columnElements.length - 1;
          const wrapperStyle: CSSProperties =
            columnElements.length === 1
              ? {
                  ...(alignment === "center"
                    ? { marginLeft: "auto", marginRight: "auto" }
                    : {}),
                  ...(alignment === "right" ? { marginLeft: "auto" } : {}),
                  ...(alignment === "left" ? { marginRight: "auto" } : {}),
                }
              : {
                  // Auto margins bound the group instead of being repeated on
                  // every action, which previously created giant empty gaps.
                  ...(alignment === "right" && isFirst
                    ? { marginLeft: "auto" }
                    : {}),
                  ...(alignment === "left" && isLast
                    ? { marginRight: "auto" }
                    : {}),
                  ...(alignment === "center" && isFirst
                    ? { marginLeft: "auto" }
                    : {}),
                  ...(alignment === "center" && isLast
                    ? { marginRight: "auto" }
                    : {}),
                };
          if (renderBuilderElement) {
            return <div key={element.id} style={{ display: "contents" }}>{renderCompositionElement(element, wrapperStyle)}</div>;
          }
          return <div key={element.id} style={wrapperStyle}>{renderCompositionElement(element)}</div>;
        })}
      </div>
    );
    return renderBuilderColumn ? renderBuilderColumn(column.id, content) : content;
  };
  const columnLayoutComposition = usesColumnLayout ? (
    <div className="header-builder-columns">
      {primaryColumns.map((column) => <div key={column.id} style={{ display: "contents" }}>{renderColumn(column)}</div>)}
    </div>
  ) : null;
  const leftComposition = usesColumnLayout
    ? renderColumn(primaryColumns[0]!)
    : orderedElements[0] ? renderCompositionElement(orderedElements[0]) : null;
  const centerComposition = usesColumnLayout && primaryColumns.length >= 3
    ? renderColumn(primaryColumns[1]!)
    : !usesColumnLayout && orderedElements[1] ? renderCompositionElement(orderedElements[1]) : null;
  const rightComposition = usesColumnLayout
    ? primaryColumns.slice(primaryColumns.length >= 3 ? 2 : 1).map((column) => <div key={column.id}>{renderColumn(column)}</div>)
    : orderedElements.slice(2).map((element) => <div key={element.id}>{renderCompositionElement(element)}</div>);
  const wrapPrimaryRow = (content: ReactNode) => {
    const sharedRow = (
      <div className="site-header-builder-primary-row">{content}</div>
    );
    return primaryRowId && renderBuilderRow
      ? renderBuilderRow(primaryRowId, sharedRow)
      : sharedRow;
  };
  const topToolbar = showLegacyTopToolbar ? (
      <div className="site-header-top">
        <div className="site-header-top-inner">
          <div className="site-header-top-left">
            {effectiveTopBarText && <span>{effectiveTopBarText}</span>}
          </div>
          <div className="site-header-top-right">
            {effectiveSupportPhone && <span>Call: {effectiveSupportPhone}</span>}
            {effectiveToolbarMeta && <span>{effectiveToolbarMeta}</span>}
          </div>
        </div>
      </div>
    ) : null;
  const princityTopToolbar = showLegacyTopToolbar ? (
      <div className="site-header-princity-meta-row">
        <span>{effectiveTopBarText || "Modern commerce by Webpages"}</span>
        <span>
          {[effectiveSupportPhone, effectiveToolbarMeta]
            .filter(Boolean)
            .join("   ")}
        </span>
      </div>
    ) : null;
  const canonicalToolbarRows = additionalRows.filter((row) => toolbarRowIds.has(row.rowId));
  const standardAdditionalRows = additionalRows.filter((row) => !toolbarRowIds.has(row.rowId));
  const renderAdditionalHeaderRow = (row: (typeof additionalRows)[number]) => {
    if (!renderBuilderColumn && row.elements.length === 0) return null;
    const isToolbar = toolbarRowIds.has(row.rowId);
    const rowSettings = headerComposition.rows?.find((candidate) => candidate.rowId === row.rowId);
    const rowDistribution = rowSettings?.horizontalDistribution;
    const rowContent = (
      <div
        className={`site-header-builder-extra-row${isToolbar ? " site-header-builder-extra-row--toolbar" : ""}${renderBuilderColumn ? " is-builder-wireframe" : ""} ${getRowClass(row.rowId)}`}
        style={getRowStyles(row.rowId)}
        data-header-row-role={isToolbar ? "toolbar" : undefined}
      >
        {renderBuilderColumn ? (
          <span className="builder-header-row-wireframe-label">
            {isToolbar ? "Toolbar row" : "Header row"}
          </span>
        ) : null}
        {(row.columns.length > 0 ? row.columns : [{ id: row.rowId, rowId: row.rowId, flex: 1 }]).map((column) => {
          const columnElements = row.elements.filter((element) => element.columnId === column.id);
          const content = (
            <div
              className={`header-builder-column${columnElements.length === 0 ? " is-empty" : ""}`}
              style={{
                flex: rowDistribution === "center" ? "0 1 auto" : column.flex,
                justifyContent: rowDistribution === "center"
                  ? "center"
                  : rowDistribution === "left"
                    ? "flex-start"
                    : undefined,
              }}
            >
              {columnElements.map((element) => renderBuilderElement
                ? <div key={element.id} style={{ display: "contents" }}>{renderCompositionElement(element, {})}</div>
                : <div key={element.id}>{renderCompositionElement(element)}</div>)}
            </div>
          );
          if (!renderBuilderColumn && columnElements.length === 0) return null;
          return <div key={column.id} style={{ display: "contents" }}>{renderBuilderColumn ? renderBuilderColumn(column.id, content) : content}</div>;
        })}
      </div>
    );
    return <div key={row.rowId} style={{ display: "contents" }}>{renderBuilderRow ? renderBuilderRow(row.rowId, rowContent) : rowContent}</div>;
  };

  return (
    <HeaderFrame
      id={publicAnchorId}
      accentColor={accentColor}
      behavior={effectiveHeaderBehavior}
      stickyAnimation={documentSettings.stickyAnimation}
      className={headerClassName}
      backgroundMode={headerMustBeTransparent ? "none" : effectiveHeaderBackgroundMode}
      textMode={effectiveHeaderTextMode}
      overlapHeader={documentSettings.overlay}
      builderPreviewMode={builderPreviewMode}
      scrollState={scrollState}
      activeVariant={hasCanonicalMobileRows ? activeHeaderVariant : undefined}
      mobileBreakpoint={hasCanonicalMobileRows ? mobileBreakpoint : undefined}
      style={{
        ...documentVisualCss,
        ...visualStyleToCss(headerComposition.rowVisualStyle),
        ...(hasDocumentBackground
          ? {
              "--header-bg": documentVisualColor || documentHeaderBackground,
              "--surface-main": documentVisualColor || documentHeaderBackground,
              "--header-document-background-color": documentVisualColor || documentHeaderBackground,
              "--header-document-background-image": documentVisualBackgroundImage || documentVisualGradient,
            }
          : {}),
        "--header-builder-row-gap": headerComposition.rowGap,
        "--header-builder-row-justify": headerComposition.rowJustify,
        "--header-builder-row-align": headerComposition.rowAlign,
        // Auto Header height is owned by the active UIkit Navbar token. Keep
        // the document value semantic instead of resolving a Circle-specific
        // pixel value into the Header document.
        "--header-builder-height": headerHeight ?? "var(--uk-navbar-nav-item-height, auto)",
        "--header-document-padding-top": documentPaddingTop,
        "--header-document-padding-bottom": documentPaddingBottom,
        ...(effectiveHeaderBackgroundMode === "default" &&
        !headerMustBeTransparent &&
        !hasDocumentBackground
          ? { backdropFilter: "var(--uk-navbar-backdrop-filter)" }
          : {}),
        paddingTop: documentPaddingTop,
        paddingBottom: documentPaddingBottom,
        marginTop: documentMarginTop,
        marginBottom: documentMarginBottom,
        zIndex: documentSettings.zIndex,
      } as CSSProperties}
    >
      {canonicalToolbarRows.map(renderAdditionalHeaderRow)}
      {layout === "two-row" && (
        <>
          {topToolbar}
          <div className="site-header-main site-header-main--two-row">
            <div className={`site-header-main-inner site-header-row-top ${getRowClass(primaryRowId)}`} style={getRowStyles(primaryRowId)}>
              {wrapPrimaryRow(<>
                {columnLayoutComposition ?? leftComposition}
                {!usesColumnLayout && <div className="site-header-main-center">{centerComposition}</div>}
                {!usesColumnLayout && <div className="site-header-main-right">{rightComposition}</div>}
              </>)}
            </div>
          </div>
        </>
      )}

      {layout === "pill" && (
        <>
          <div
            id="site-header-pill"
            data-scrolled="false"
            className="w-full"
            suppressHydrationWarning
          >
            <div className="site-header-main site-header-pill-main">
              <div className={`site-header-main-inner site-header-pill-inner ${getRowClass(primaryRowId)}`} style={getRowStyles(primaryRowId)}>
                {wrapPrimaryRow(<>
                  {columnLayoutComposition ?? leftComposition}
                  {!usesColumnLayout && <div className="site-header-main-center">{centerComposition}</div>}
                  {!usesColumnLayout && <div className="site-header-main-right">{rightComposition}</div>}
                </>)}
              </div>
            </div>
            <div className="site-header-pill-spacer" />
          </div>
        </>
      )}

      {layout === "princity" && (
        <>
          <div
            id="site-header-pill"
            data-scrolled="false"
            className="site-header-princity-shell"
            suppressHydrationWarning
          >
            {princityTopToolbar}
            <div className="site-header-princity">
              <div className={`site-header-princity-inner ${getRowClass(primaryRowId)}`} style={getRowStyles(primaryRowId)}>
                {wrapPrimaryRow(columnLayoutComposition ?? <>
                  <div className="site-header-princity-left">{leftComposition}</div>
                  <div className="site-header-princity-center">{centerComposition}</div>
                  <div className="site-header-princity-right">{rightComposition}</div>
                </>)}
              </div>
            </div>
            <div className="site-header-pill-spacer site-header-princity-spacer" />
          </div>
        </>
      )}

      {layout === "simple" && (
        <div className="site-header-main">
          <div className={`site-header-main-inner ${getRowClass(primaryRowId)}`} style={getRowStyles(primaryRowId)}>
            {wrapPrimaryRow(<>
              {columnLayoutComposition ?? leftComposition}
              {!usesColumnLayout && <div className="site-header-main-center">{centerComposition}</div>}
              {!usesColumnLayout && <div className="site-header-main-right">{rightComposition}</div>}
            </>)}
          </div>
        </div>
      )}

      {layout === "hero" && (
        <div className="site-header-hero">
          <div className={`site-header-hero-inner ${getRowClass(primaryRowId)}`} style={getRowStyles(primaryRowId)}>
            {wrapPrimaryRow(<>
              {columnLayoutComposition ?? leftComposition}
              {!usesColumnLayout && <div className="site-header-hero-menu">{centerComposition}</div>}
              {!usesColumnLayout && <div className="site-header-hero-actions">{rightComposition}</div>}
            </>)}
          </div>
        </div>
      )}
      {standardAdditionalRows.map(renderAdditionalHeaderRow)}
    </HeaderFrame>
  );
}
