"use client";

import { useMemo, type CSSProperties, type ReactNode } from "react";
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
import UikitButton from "@/components/builder/UikitButton";
import UikitImage from "@/components/builder/UikitImage";
import { resolveHeaderHeightCss } from "@/lib/headerHeight";
import { resolveBuilderSpacing } from "@/lib/builderSpacing";
import { resolveHeaderDocumentSettings } from "@/lib/headerDocumentSettings";

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
  scrollState?: {
    scrolled: boolean;
    hidden: boolean;
  };
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
  scrollState,
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
  const documentSettings = resolveHeaderDocumentSettings(
    headerComposition,
    shellSettings,
  );
  // `wordpress` is the canonical persisted name for YOOtheme's
  // horizontal-justify preset. Do not fall back to the legacy theme setting,
  // otherwise an imported Header document silently loses its layout.
  const layoutValue = documentSettings.layout === "wordpress"
    ? "wordpress"
    : documentSettings.layout ?? layoutOverride ?? asString(settings.layout, "centered");
  const layout = normalizeLayout(layoutValue);
  const headerBehavior = documentSettings.behavior;
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
    documentNavigation?.menuActiveIndicator ||
    (layout === "princity" ? "princity" : "underline");
  const navbarLineMode = shellSettings.navbarNavItemLineMode === "true" ? "enabled" : "disabled";
  const navbarLinePosition = ["top", "bottom", "left", "right"].includes(
    shellSettings.navbarNavItemLinePositionMode ?? "",
  )
    ? shellSettings.navbarNavItemLinePositionMode
    : "bottom";
  const navbarLineSlide = ["center", "left", "right"].includes(
    shellSettings.navbarNavItemLineSlideMode ?? "",
  )
    ? shellSettings.navbarNavItemLineSlideMode
    : "center";
  const navbarVerticalBorder = ["partial", "all"].includes(
    shellSettings.navbarModeBorderVertical ?? "",
  )
    ? shellSettings.navbarModeBorderVertical
    : "none";
  const headerClassName = [
    layout === "pill" || layout === "princity" ? "site-header--pill" : "",
    serviceHomepageMode ? "site-header--service" : "",
    showTopToolbar ? "" : "site-header--toolbar-hidden",
    headerMustBeTransparent || effectiveHeaderBackgroundMode === "none"
      ? "site-header--no-background"
      : "",
    `site-header--background-${headerMustBeTransparent ? "none" : effectiveHeaderBackgroundMode}`,
    `site-header--indicator-${effectiveActiveIndicator}`,
    `site-header--navbar-line-mode-${navbarLineMode}`,
    `site-header--navbar-line-position-${navbarLinePosition}`,
    `site-header--navbar-line-slide-${navbarLineSlide}`,
    `site-header--navbar-border-vertical-${navbarVerticalBorder}`,
    documentSettings.overlay ? "site-header--builder-overlay" : "",
    hasDocumentBackground
      ? "site-header--document-background"
      : "",
    `site-header--builder-width-${documentSettings.widthMode}`,
  ]
    .filter(Boolean)
    .join(" ");
  const allDocumentElements = useMemo(() => {
    return headerComposition.elements;
  }, [headerComposition.elements]);
  const compositionTypes = new Set(allDocumentElements.map((item) => item.type));
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
  const nav = showNavigationElement ? (
    <HeaderNav
      items={publicItemsToRender}
      presentationById={menuPresentation}
      categories={compositionTypes.has("categories") ? categories : null}
      serviceHomepageMode={serviceHomepageMode}
      scopedPreviewWebsiteId={scopedPreviewWebsiteId}
      activePageKey={scopedPreviewPage}
      scopedPreviewPages={scopedPreviewPages}
      scopedLinkMode={scopedLinkMode}
      activeContentLanguage={activeContentLanguage}
      style={typographyProps(
        allDocumentElements.find((candidate) => candidate.type === "navigation")
          ?.typography,
        "body",
      ).style}
    />
  ) : null;
  const renderLogoAndBrand = (element?: HeaderBuilderElement) => {
    const elementLogoUrl = element?.imageUrl || effectiveLogoUrl;
    const elementLogoAlt = element?.imageAlt || effectiveLogoAlt;
    const elementLogoMaxWidth = element?.imageMaxWidth || effectiveLogoMaxWidth;
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
                imageLoading: element?.imageLoading,
              }}
            />
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
    const resolvedTopPadding = rowComp.rowTopSpacing !== undefined
      ? resolveBuilderSpacing(rowComp.rowTopSpacing, "rowPadding", shellSettings.rowPaddingTop).css
      : visualStyles.paddingTop === undefined
        ? (headerHeight ? "0px" : resolveBuilderSpacing(
            normalizeLegacyHeaderSpacing(shellSettings.rowPaddingTop) ?? "none",
            "rowPadding",
          ).css)
        : undefined;
    const resolvedBottomPadding = rowComp.rowBottomSpacing !== undefined
      ? resolveBuilderSpacing(rowComp.rowBottomSpacing, "rowPadding", shellSettings.rowPaddingBottom).css
      : visualStyles.paddingBottom === undefined
        ? (headerHeight ? "0px" : resolveBuilderSpacing(
            normalizeLegacyHeaderSpacing(shellSettings.rowPaddingBottom) ?? "none",
            "rowPadding",
          ).css)
        : undefined;
    const resolvedTopMargin = rowComp.rowTopMargin !== undefined
      ? resolveBuilderSpacing(rowComp.rowTopMargin, "rowMargin", shellSettings.rowMarginTop).css
      : visualStyles.marginTop === undefined
        ? resolveBuilderSpacing("none", "rowMargin").css
        : undefined;
    const resolvedBottomMargin = rowComp.rowBottomMargin !== undefined
      ? resolveBuilderSpacing(rowComp.rowBottomMargin, "rowMargin", shellSettings.rowMarginBottom).css
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
      overlapHeader={documentSettings.overlay}
      scrollState={scrollState}
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
        "--header-builder-height": headerHeight,
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
