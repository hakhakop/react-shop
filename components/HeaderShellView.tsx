"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";

import HeaderActions from "./HeaderActions";
import HeaderCategoriesDropdown from "./HeaderCategoriesDropdown";
import HeaderFrame from "./HeaderFrame";
import HeaderNav from "./HeaderNav";
import HeaderPillController from "./HeaderPillController";
import HeaderSaaSEntry from "./HeaderSaaSEntry";
import type { MenuItem } from "../lib/navigation";
import type { HeaderSettings } from "../lib/themeSettings";
import type {
  BuilderCustomPage,
  BuilderLayoutKey,
} from "../lib/builderLayouts";
import type {
  BuilderHeaderLayout,
  BuilderMenuPresentationMap,
  BuilderShellSettings,
  ReactMenuItem,
} from "../lib/builderShell";

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
  categoriesContent?: ReactNode;
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
  categoriesContent,
}: HeaderShellViewProps) {
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
  const effectiveHeaderBackgroundMode =
    shellSettings.headerBackgroundMode || "default";
  const effectiveHeaderTextMode = shellSettings.headerTextMode || "auto";
  const effectiveLogoUrl = shellSettings.headerLogoUrl || logoUrl;
  const effectiveBrandText =
    shellSettings.headerBrandText ||
    (brandName ? brandName : serviceHomepageMode ? "WebPages" : null);
  const effectiveLogoAlt =
    shellSettings.headerLogoAlt || effectiveBrandText || "Store logo";
  const effectiveBrandMode =
    shellSettings.headerBrandMode || (serviceHomepageMode ? "brand" : "logo");
  const effectiveLogoMaxWidth =
    shellSettings.headerLogoMaxWidth || headerSettings.logoMaxWidth;
  const effectiveIconOrder =
    shellSettings.headerIconOrder && shellSettings.headerIconOrder.length > 0
      ? shellSettings.headerIconOrder
      : headerSettings.iconOrder;
  const effectiveIconVariant =
    shellSettings.headerIconVariant || headerSettings.iconVariant;
  const effectiveActiveIndicator =
    shellSettings.headerActiveIndicator ||
    (layout === "princity" ? "princity" : "underline");
  const headerClassName = [
    layout === "pill" || layout === "princity" ? "site-header--pill" : "",
    serviceHomepageMode ? "site-header--service" : "",
    topToolbarVisible ? "" : "site-header--toolbar-hidden",
    effectiveHeaderBackgroundMode === "none"
      ? "site-header--no-background"
      : "",
    `site-header--background-${effectiveHeaderBackgroundMode}`,
    `site-header--indicator-${effectiveActiveIndicator}`,
  ]
    .filter(Boolean)
    .join(" ");
  const showLogo =
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
  const renderCategoriesMega = () =>
    categories ? (
      <HeaderCategoriesDropdown>{categories}</HeaderCategoriesDropdown>
    ) : null;
  const nav = (
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
  );
  const logoAndBrand = (
    <div className="site-header-logo-wrap">
      {showLogo && effectiveLogoUrl && (
        <Link href={homeHref} className="site-header-logo-img-wrap">
          <Image
            src={effectiveLogoUrl}
            alt={effectiveLogoAlt}
            width={effectiveLogoMaxWidth}
            height={effectiveLogoMaxWidth}
            style={{ objectFit: "contain" }}
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
  const actions = (
    <>
      {serviceHomepageMode && (
        <Link
          href={clientHref}
          className="site-header-action-pill site-header-service-cta"
        >
          Start
        </Link>
      )}
      <HeaderSaaSEntry />
      <HeaderActions
        icons={effectiveIconOrder}
        iconVariant={effectiveIconVariant}
      />
    </>
  );
  const topToolbar =
    topToolbarVisible &&
    (effectiveTopBarText || effectiveSupportPhone || effectiveToolbarMeta) ? (
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
  const princityTopToolbar =
    topToolbarVisible &&
    (effectiveTopBarText || effectiveSupportPhone || effectiveToolbarMeta) ? (
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
      accentColor={accentColor}
      mode={layout === "pill" || layout === "princity" ? "none" : "sticky"}
      className={headerClassName}
      backgroundMode={effectiveHeaderBackgroundMode}
      textMode={effectiveHeaderTextMode}
    >
      {layout === "two-row" && (
        <>
          {topToolbar}
          <div className="site-header-main site-header-main--two-row">
            <div className="site-header-main-inner site-header-row-top">
              {logoAndBrand}
              <div className="site-header-main-right">{actions}</div>
            </div>
            <div className="site-header-row-bottom">
              <div className="site-header-row-bottom-inner">
                {nav}
                {renderCategoriesMega()}
              </div>
            </div>
          </div>
        </>
      )}

      {layout === "pill" && (
        <>
          <HeaderPillController />
          <div
            id="site-header-pill"
            data-scrolled="false"
            className="w-full"
            suppressHydrationWarning
          >
            <div className="site-header-main site-header-pill-main">
              <div className="site-header-main-inner site-header-pill-inner">
                {logoAndBrand}
                <div className="site-header-main-center">
                  {nav}
                  {renderCategoriesMega()}
                </div>
                <div className="site-header-main-right">{actions}</div>
              </div>
            </div>
            <div className="site-header-pill-spacer" />
          </div>
        </>
      )}

      {layout === "princity" && (
        <>
          <HeaderPillController />
          <div
            id="site-header-pill"
            data-scrolled="false"
            className="site-header-princity-shell"
            suppressHydrationWarning
          >
            {princityTopToolbar}
            <div className="site-header-princity">
              <div className="site-header-princity-inner">
                <div className="site-header-princity-left">
                  {logoAndBrand}
                </div>
                <div className="site-header-princity-center">
                  {nav}
                  {renderCategoriesMega()}
                </div>
                <div className="site-header-princity-right">{actions}</div>
              </div>
            </div>
            <div className="site-header-pill-spacer site-header-princity-spacer" />
          </div>
        </>
      )}

      {layout === "simple" && (
        <div className="site-header-main">
          <div className="site-header-main-inner">
            {logoAndBrand}
            <div className="site-header-main-center">
              {nav}
              {renderCategoriesMega()}
            </div>
            <div className="site-header-main-right">{actions}</div>
          </div>
        </div>
      )}

      {layout === "hero" && (
        <div className="site-header-hero">
          <div className="site-header-hero-inner">
            {showLogo && effectiveLogoUrl && (
              <div className="site-header-hero-logo">
                <Image
                  src={effectiveLogoUrl}
                  alt={effectiveLogoAlt}
                  width={effectiveLogoMaxWidth}
                  height={effectiveLogoMaxWidth}
                  style={{ objectFit: "contain" }}
                />
              </div>
            )}
            {effectiveBrandText && (
              <Link href={homeHref} className="site-header-hero-title">
                <span style={{ color: primaryColor }}>
                  {effectiveBrandText}
                </span>
              </Link>
            )}
            <p className="site-header-hero-subtitle">
              Curated tech &amp; setup by Webpages.
            </p>
            <div className="site-header-hero-menu">
              {nav}
              {renderCategoriesMega()}
            </div>
            <div className="site-header-hero-actions">{actions}</div>
          </div>
        </div>
      )}
    </HeaderFrame>
  );
}
