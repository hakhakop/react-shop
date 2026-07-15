"use client";

import type { CSSProperties, ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";

import HeaderActions from "./HeaderActions";
import HeaderCategoriesDropdown from "./HeaderCategoriesDropdown";
import HeaderFrame from "./HeaderFrame";
import HeaderNav from "./HeaderNav";
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
import { resolveHeaderBehavior } from "@/lib/headerBehavior";

function asString(value: unknown, fallback: string | null = null): string | null {
  if (typeof value === "string" && value.trim() !== "") return value.trim();
  return fallback;
}

function normalizeLayout(
  value: string | undefined | null,
): "simple" | "two-row" | "hero" | "pill" | "princity" {
  switch ((value || "centered").toLowerCase()) {
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
  layoutOverride?: BuilderHeaderLayout;
  shellSettings: Partial<BuilderShellSettings>;
  settings?: Record<string, unknown>;
  headerSettings: HeaderSettings;
  serviceHomepageMode?: boolean;
  homeHref?: string;
  clientHref?: string;
  scopedPreviewWebsiteId?: string;
  scopedPreviewPage?: BuilderLayoutKey;
  scopedPreviewPages?: Pick<BuilderCustomPage, "key" | "slug">[];
  scopedLinkMode?: "builder" | "preview";
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
  activeContentLanguage?: string;
  enabledContentLanguages?: string[];
  languagePreferenceKey?: string;
  languageSwitcherPreviewOnly?: boolean;
  onContentLanguageChange?: (language: string) => void;
  publicAnchorId?: string;
};

export default function HeaderShellView({
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
  headerComposition,
  renderBuilderElement,
  renderBuilderColumn,
  renderBuilderRow,
  activeContentLanguage = "hy",
  enabledContentLanguages = ["hy"],
  languagePreferenceKey = "website_content_language",
  languageSwitcherPreviewOnly = false,
  onContentLanguageChange,
  publicAnchorId,
}: HeaderShellViewProps) {
  const documentLogo = headerComposition.elements.find((item) => item.type === "logo");
  const documentNavigation = headerComposition.elements.find((item) => item.type === "navigation");
  const primaryColor =
    asString(shellSettings.primaryColor) ||
    asString(settings.primary_color) ||
    "#111827";
  const accentColor =
    asString(shellSettings.accentColor) ||
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
  const layoutValue =
    layoutOverride && layoutOverride !== "wordpress"
      ? layoutOverride
      : asString(settings.layout, "centered");
  const layout = normalizeLayout(layoutValue);
  const headerBehavior = resolveHeaderBehavior(shellSettings);
  const topToolbarVisible = shellSettings.topToolbarVisible !== false;
  const effectiveTopBarText =
    typeof shellSettings.topToolbarText === "string"
      ? shellSettings.topToolbarText
      : topBarText;
  const effectiveSupportPhone =
    typeof shellSettings.topToolbarPhone === "string"
      ? shellSettings.topToolbarPhone
      : supportPhone;
  const effectiveToolbarMeta =
    typeof shellSettings.topToolbarMeta === "string"
      ? shellSettings.topToolbarMeta
      : currencyLabel;
  const hasTopToolbarContent = Boolean(
    effectiveTopBarText?.trim() ||
    effectiveSupportPhone?.trim() ||
    effectiveToolbarMeta?.trim(),
  );
  const showTopToolbar = topToolbarVisible && hasTopToolbarContent;
  const effectiveHeaderBackgroundMode =
    shellSettings.headerBackgroundMode || "default";
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
  const headerMustBeTransparent =
    shellSettings.headerOverlay === true || shellSettings.headerTransparent === true;
  const effectiveHeaderTextMode = shellSettings.headerTextMode || "auto";
  const effectiveLogoUrl = documentLogo?.imageUrl || shellSettings.headerLogoUrl || logoUrl;
  const effectiveBrandText =
    documentLogo?.headerBrandText || shellSettings.headerBrandText ||
    (brandName ? brandName : serviceHomepageMode ? "WebPages" : null);
  const effectiveLogoAlt =
    documentLogo?.imageAlt || shellSettings.headerLogoAlt || effectiveBrandText || "Store logo";
  const effectiveBrandMode =
    documentLogo?.headerBrandMode || shellSettings.headerBrandMode || (serviceHomepageMode ? "brand" : "logo");
  const effectiveLogoMaxWidth =
    documentLogo?.imageMaxWidth || shellSettings.headerLogoMaxWidth || headerSettings.logoMaxWidth;
  const effectiveIconVariant =
    shellSettings.headerIconVariant || headerSettings.iconVariant;
  const effectiveActiveIndicator =
    documentNavigation?.menuActiveIndicator || shellSettings.headerActiveIndicator ||
    (layout === "princity" ? "princity" : "underline");
  const headerClassName = [
    layout === "pill" || layout === "princity" ? "site-header--pill" : "",
    serviceHomepageMode ? "site-header--service" : "",
    showTopToolbar ? "" : "site-header--toolbar-hidden",
    headerMustBeTransparent || effectiveHeaderBackgroundMode === "none"
      ? "site-header--no-background"
      : "",
    `site-header--background-${headerMustBeTransparent ? "none" : effectiveHeaderBackgroundMode}`,
    `site-header--indicator-${effectiveActiveIndicator}`,
    shellSettings.headerOverlay ? "site-header--builder-overlay" : "",
    hasDocumentBackground
      ? "site-header--document-background"
      : "",
    `site-header--builder-width-${shellSettings.headerWidthMode ?? "boxed"}`,
  ]
    .filter(Boolean)
    .join(" ");
  const compositionTypes = new Set(headerComposition.elements.map((item) => item.type));
  const showLogoElement = compositionTypes.has("logo");
  const showNavigationElement = compositionTypes.has("navigation");
  const showButtonElement = compositionTypes.has("button");
  const showLogo = showLogoElement &&
    Boolean(effectiveLogoUrl) &&
    (effectiveBrandMode === "logo" || effectiveBrandMode === "both");
  const showBrand =
    Boolean(effectiveBrandText) &&
    (effectiveBrandMode === "brand" ||
      effectiveBrandMode === "both" ||
      !showLogo);
  const reactMenuItems = shellSettings.menuItems;
  const menuItems =
    Array.isArray(reactMenuItems) && reactMenuItems.length > 0
      ? buildReactMenuTree(reactMenuItems)
      : [
          { id: "home", label: "Home", url: "/", path: "/" },
          { id: "shop", label: "Shop", url: "/shop", path: "/shop" },
        ];
  const publicItemsToRender = filterSaaSItems(menuItems);
  const menuPresentation =
    (shellSettings.menuPresentation as BuilderMenuPresentationMap | undefined) ??
    {};
  const categories = categoriesContent ?? null;
  const renderCategoriesMega = (element?: HeaderBuilderElement) =>
    categories ? (
      <HeaderCategoriesDropdown
        label={element?.categoriesLabel || "Categories"}
        showLabel={element?.categoriesShowLabel !== false}
      >
        {categories}
      </HeaderCategoriesDropdown>
    ) : null;
  const nav = showNavigationElement ? (
    <HeaderNav
      items={publicItemsToRender}
      presentationById={menuPresentation}
      categories={categories}
      serviceHomepageMode={serviceHomepageMode}
      scopedPreviewWebsiteId={scopedPreviewWebsiteId}
      activePageKey={scopedPreviewPage}
      scopedPreviewPages={scopedPreviewPages}
      scopedLinkMode={scopedLinkMode}
    />
  ) : null;
  const renderLogoAndBrand = (element?: HeaderBuilderElement) => {
    const elementLogoUrl = element?.imageUrl || effectiveLogoUrl;
    const elementLogoAlt = element?.imageAlt || effectiveLogoAlt;
    const elementLogoMaxWidth = element?.imageMaxWidth || effectiveLogoMaxWidth;
    return (
    <div className="site-header-logo-wrap">
      {showLogo && elementLogoUrl && (
        <Link href={homeHref} className="site-header-logo-img-wrap">
          <Image
            src={elementLogoUrl}
            alt={elementLogoAlt}
            width={elementLogoMaxWidth}
            height={elementLogoMaxWidth}
            style={{ objectFit: "contain", maxWidth: elementLogoMaxWidth }}
          />
        </Link>
      )}

      {showBrand && effectiveBrandText && (
        <Link href={homeHref} className="site-header-brand">
          <span style={{ color: primaryColor }}>{effectiveBrandText}</span>
        </Link>
      )}
    </div>
    );
  };
  const renderHeaderButton = (buttonElement?: HeaderBuilderElement) => showButtonElement ? (
    <Link
      href={buttonElement?.url || clientHref}
      className="site-header-action-pill site-header-service-cta"
      style={{
        ...(buttonElement?.buttonBg ? { background: buttonElement.buttonBg } : {}),
        ...(buttonElement?.buttonTextColor ? { color: buttonElement.buttonTextColor } : {}),
        ...(buttonElement?.buttonBorderRadius ? { borderRadius: buttonElement.buttonBorderRadius } : {}),
        ...(buttonElement?.buttonBorderWidth ? { borderWidth: buttonElement.buttonBorderWidth, borderStyle: "solid" } : {}),
        ...(buttonElement?.buttonBorderColor ? { borderColor: buttonElement.buttonBorderColor } : {}),
        ...(buttonElement?.buttonPaddingY ? { paddingTop: buttonElement.buttonPaddingY, paddingBottom: buttonElement.buttonPaddingY } : {}),
        ...(buttonElement?.buttonPaddingX ? { paddingLeft: buttonElement.buttonPaddingX, paddingRight: buttonElement.buttonPaddingX } : {}),
        ...(buttonElement?.buttonFontWeight ? { fontWeight: buttonElement.buttonFontWeight } : {}),
        ...(buttonElement?.buttonLetterSpacing ? { letterSpacing: buttonElement.buttonLetterSpacing } : {}),
        ...typographyProps(buttonElement?.typography, "button").style,
      }}
    >
      {buttonElement?.label || "Start"}
    </Link>
  ) : null;
  const allDocumentElements = headerComposition.elements;
  const primaryRowId = headerComposition.columns?.[0]?.rowId ?? allDocumentElements[0]?.rowId;
  const orderedElements = primaryRowId
    ? allDocumentElements.filter((element) => element.rowId === primaryRowId)
    : allDocumentElements;
  const additionalRows = primaryRowId
    ? Array.from(new Set([
        ...(headerComposition.columns ?? []).map((column) => column.rowId),
        ...allDocumentElements.map((element) => element.rowId),
      ].filter((rowId): rowId is string => Boolean(rowId) && rowId !== primaryRowId))).map((rowId) => ({
        rowId,
        elements: allDocumentElements.filter((element) => element.rowId === rowId),
        columns: (headerComposition.columns ?? []).filter((column) => column.rowId === rowId),
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

    return {
      ...visualStyles,
      ...(bg ? { background: bg } : {}),
      ...((localColor || bg) ? { "--header-row-local-background-color": localColor || bg } : {}),
      ...((visualBackgroundImage || localGradient) ? { "--header-row-local-background-image": visualBackgroundImage || localGradient } : {}),
      ...(rowComp.headerGap ? { "--header-builder-row-gap": rowComp.headerGap } : {}),
      ...(rowComp.headerJustify ? { "--header-builder-row-justify": rowComp.headerJustify } : {}),
      ...(rowComp.headerAlign ? { "--header-builder-row-align": rowComp.headerAlign } : {}),
      ...(rowComp.rowTopSpacing ? { paddingTop: rowComp.rowTopSpacing } : {}),
      ...(rowComp.rowBottomSpacing ? { paddingBottom: rowComp.rowBottomSpacing } : {}),
      ...(rowComp.rowTopMargin ? { marginTop: rowComp.rowTopMargin } : {}),
      ...(rowComp.rowBottomMargin ? { marginBottom: rowComp.rowBottomMargin } : {}),
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
    return cls;
  };

  const renderCompositionElement = (
    element: HeaderBuilderElement,
    flexItemStyle?: CSSProperties,
  ) => {
    let content: ReactNode = null;
    if (element.type === "logo") content = renderLogoAndBrand(element);
    if (element.type === "navigation") content = nav;
    if (element.type === "button") content = renderHeaderButton(element);
    if (element.type === "spacer") content = <span className="header-builder-spacer-content" aria-hidden="true" />;
    if (element.type === "utility" && element.utilityAction) {
      content = (
        <HeaderActions
          icons={[element.utilityAction as BuilderHeaderIconId]}
          iconVariant={(element.utilityVariant as BuilderHeaderIconVariant | undefined) ?? effectiveIconVariant}
        />
      );
    }
    if (element.type === "categories") content = renderCategoriesMega(element);
    if (element.type === "language") content = (
      <WebsiteLanguageSwitcher
        activeLanguage={activeContentLanguage}
        enabledLanguages={enabledContentLanguages}
        preferenceKey={languagePreferenceKey}
        previewOnly={languageSwitcherPreviewOnly}
        display={element.languageDisplay}
        onLanguageChange={onContentLanguageChange}
      />
    );
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
            "--header-builder-menu-gap": element.menuItemGap,
            "--header-builder-menu-hover": element.menuHoverColor,
            "--header-builder-menu-active": element.menuActiveColor,
            ...typographyProps(element.typography).style,
          } as CSSProperties)
        : {}),
      ...(element.type === "button"
        ? ({
            "--header-builder-button-hover-bg": element.buttonHoverBg,
            "--header-builder-button-hover-text": element.buttonHoverTextColor,
          } as CSSProperties)
        : {}),
    };
    const styledContent = (
      <div className={`header-builder-element header-builder-element--${element.type} ${visualStyleClassName(element.visualStyle)}`} style={elementStyle}>
        {content}
      </div>
    );
    return renderBuilderElement
      ? renderBuilderElement(element, styledContent, flexItemStyle)
      : styledContent;
  };
  const primaryColumns = headerComposition.columns?.filter((column) => column.rowId === primaryRowId)
    ?? Array.from(new Set(orderedElements.map((element) => element.columnId).filter(Boolean))).map((id) => ({ id: id!, rowId: primaryRowId ?? "header-main-row", flex: 1 }));
  const usesColumnLayout = primaryColumns.length > 1 || Boolean(renderBuilderColumn && primaryColumns.length);
  const renderColumn = (column: { id: string; flex: number }) => {
    const columnElements = orderedElements.filter((element) => element.columnId === column.id);
    const content = (
      <div className={`header-builder-column${columnElements.length === 0 ? " is-empty" : ""}`} style={{ flex: column.flex }}>
        {columnElements.map((element) => {
          const alignment = element.type === "logo" ? element.imageAlignment : element.elementAlign;
          const wrapperStyle: CSSProperties = alignment
            ? {
                ...(alignment === "center" ? { marginLeft: "auto", marginRight: "auto" } : {}),
                ...(alignment === "right" ? { marginLeft: "auto" } : {}),
                ...(alignment === "left" ? { marginRight: "auto" } : {}),
              }
            : {};
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
  const topToolbar = showTopToolbar ? (
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
  const princityTopToolbar = showTopToolbar ? (
      <div className="site-header-princity-meta-row">
        <span>{effectiveTopBarText || "Modern commerce by Webpages"}</span>
        <span>
          {[effectiveSupportPhone, effectiveToolbarMeta]
            .filter(Boolean)
            .join("   ")}
        </span>
      </div>
    ) : null;

  return (
    <HeaderFrame
      id={publicAnchorId}
      accentColor={accentColor}
      behavior={headerBehavior}
      className={headerClassName}
      backgroundMode={headerMustBeTransparent ? "none" : effectiveHeaderBackgroundMode}
      textMode={effectiveHeaderTextMode}
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
        zIndex: shellSettings.headerZIndex ?? 40,
      } as CSSProperties}
    >
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
      {additionalRows.map((row) => {
        const rowContent = <div className={`site-header-builder-extra-row${renderBuilderColumn ? " is-builder-wireframe" : ""} ${getRowClass(row.rowId)}`} style={getRowStyles(row.rowId)}>
          {renderBuilderColumn ? <span className="builder-header-row-wireframe-label">Header row</span> : null}
          {(row.columns.length > 0 ? row.columns : [{ id: row.rowId, rowId: row.rowId, flex: 1 }]).map((column) => {
            const columnElements = row.elements.filter((element) => element.columnId === column.id);
            const content = (
              <div className={`header-builder-column${columnElements.length === 0 ? " is-empty" : ""}`} style={{ flex: column.flex }}>
                {columnElements.map((element) => renderBuilderElement
                  ? <div key={element.id} style={{ display: "contents" }}>{renderCompositionElement(element, {})}</div>
                  : <div key={element.id}>{renderCompositionElement(element)}</div>)}
              </div>
            );
            if (!renderBuilderColumn && columnElements.length === 0) return null;
            return <div key={column.id} style={{ display: "contents" }}>{renderBuilderColumn ? renderBuilderColumn(column.id, content) : content}</div>;
          })}
        </div>;
        return <div key={row.rowId} style={{ display: "contents" }}>{renderBuilderRow ? renderBuilderRow(row.rowId, rowContent) : rowContent}</div>;
      })}
    </HeaderFrame>
  );
}
