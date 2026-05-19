import React from "react";
import Link from "next/link";
import Image from "next/image";

import {
  getThemeSettings,
  extractHeaderSettings,
  type HeaderSettings,
} from "../lib/themeSettings";
import { getMainMenuItems, type MenuItem } from "../lib/navigation";
import HeaderActions from "./HeaderActions";
import HeaderCategoriesDropdown from "./HeaderCategoriesDropdown";
import CategoryMegaMenu from "./CategoryMegaMenu";
import HeaderNav from "./HeaderNav";
import HeaderFrame from "./HeaderFrame";
import HeaderPillController from "./HeaderPillController";
import type { BuilderHeaderLayout } from "../lib/builderShell";
import { readBuilderCustomPages } from "../lib/builderLayouts";
function asString(value: unknown, fallback: string | null = null): string | null {
  if (typeof value === "string" && value.trim() !== "") return value.trim();
  return fallback;
}

type HeaderShellProps = {
  layoutOverride?: BuilderHeaderLayout;
};

export default async function HeaderShell({ layoutOverride }: HeaderShellProps) {
  // Load theme settings and main menu in parallel
  const [settingsRaw, menuItemsRaw, builderPages] = await Promise.all([
    getThemeSettings(),
    getMainMenuItems(),
    readBuilderCustomPages(),
  ]);

  const settings = (settingsRaw || {}) as Record<string, any>;

  const headerSettings: HeaderSettings = settings.headerSettings
    ? (settings.headerSettings as HeaderSettings)
    : extractHeaderSettings(settings);

  const headerIconOrder = headerSettings.iconOrder;
  const headerIconVariant = headerSettings.iconVariant;
  const headerLogoMaxWidth = headerSettings.logoMaxWidth;

  // Colors
  const primaryColor = asString(settings.primary_color, "#111827") || "#111827";
  const accentColor = asString(settings.accent_color, "#ec4899") || "#ec4899";

  // Logo resolution: accept URL string or ACF image object
  const logoField =
    settings.logo || settings.site_logo || settings.store_logo;

  let logoUrl: string | null = null;
  if (typeof logoField === "string") {
    logoUrl = logoField;
  } else if (logoField && typeof logoField === "object") {
    logoUrl =
      (logoField.url as string) ||
      (logoField.source_url as string) ||
      (logoField.sourceUrl as string) ||
      (logoField.full_url as string) ||
      null;
  }

  // Brand name (optional)
  const brandName =
    asString(
      settings.brand_name ||
        settings.site_title ||
        settings.store_name ||
        settings.blogname,
      null
    );

  // Top bar content (optional)
  const topBarText = asString(
    settings.top_bar_text,
    "Fast support & setup by Webpages"
  );
  const supportPhone = asString(settings.support_phone, "+374 xx xx xx");
  const currencyLabel = asString(settings.currency_label, "AMD ֏");

  // Header layout from ACF `layout` field: simple / centered / split
  const layoutValue =
    layoutOverride && layoutOverride !== "wordpress"
      ? layoutOverride
      : (asString(settings.layout, "centered") || "centered").toLowerCase();

  let layout: "simple" | "two-row" | "hero" | "pill" | "princity";
  switch (layoutValue) {
    case "simple":
      layout = "simple";
      break;
    case "split":
      layout = "hero";
      break;
    case "pill":
      layout = "pill";
      break;
    case "princity":
    case "princity-clean":
    case "princity_clean":
    case "princity-flat":
    case "princity_flat":
      layout = "princity";
      break;
    case "centered":
    default:
      layout = "two-row";
      break;
  }

  // Menu items (from WPGraphQL) with fallback
  const menuItems = (Array.isArray(menuItemsRaw)
    ? (menuItemsRaw as MenuItem[])
    : []) as MenuItem[];

  const builderPageItems: MenuItem[] = builderPages.map((page) => ({
    id: page.key,
    label: page.title,
    url: `/${page.slug}`,
    path: `/${page.slug}`,
  }));

  const itemsToRender =
    menuItems.length > 0
      ? [...menuItems, ...builderPageItems]
      : [
          { id: "home", label: "Home", url: "/", path: "/" },
          { id: "shop", label: "Shop", url: "/", path: "/" },
          ...builderPageItems,
        ];

  const renderCategoriesMega = () => (
    <HeaderCategoriesDropdown>
      <CategoryMegaMenu />
    </HeaderCategoriesDropdown>
  );

  const renderLogoAndBrand = () => (
    <div className="site-header-logo-wrap">
      {logoUrl && (
        <Link href="/" className="site-header-logo-img-wrap">
          <Image
            src={logoUrl}
            alt={brandName || "Store logo"}
            width={headerLogoMaxWidth}
            height={headerLogoMaxWidth}
            style={{ objectFit: "contain" }}
          />
        </Link>
      )}

      {brandName && (
        <Link href="/" className="site-header-brand">
          <span style={{ color: primaryColor }}>{brandName}</span>
        </Link>
      )}
    </div>
  );

   return (
    <HeaderFrame
      accentColor={accentColor}
      mode={layout === "pill" || layout === "princity" ? "none" : "sticky"}
      className={layout === "pill" || layout === "princity" ? "site-header--pill" : ""}
    >
      {/* LAYOUT 2: TWO-ROW (ACF = centered) */}
      {layout === "two-row" && (
        <>
          {(topBarText || supportPhone || currencyLabel) && (
            <div className="site-header-top">
              <div className="site-header-top-inner">
                <div className="site-header-top-left">
                  {topBarText && <span>{topBarText}</span>}
                </div>
                <div className="site-header-top-right">
                  {supportPhone && <span>Call: {supportPhone}</span>}
                  {currencyLabel && <span>{currencyLabel}</span>}
                </div>
              </div>
            </div>
          )}

          <div className="site-header-main">
            <div className="site-header-main-inner">
              {renderLogoAndBrand()}

              <div className="site-header-main-center">
                <HeaderNav items={itemsToRender} />
                {renderCategoriesMega()}
              </div>

              <div className="site-header-main-right">
                <HeaderActions
                  icons={headerIconOrder}
                  iconVariant={headerIconVariant}
                />
              </div>
            </div>
          </div>
        </>
      )}

      {/* LAYOUT 4: PILL ON SCROLL (ACF = pill / princity) */}
      {layout === "pill" && (
        <>
          <HeaderPillController />
          <div
            id="site-header-pill"
            data-scrolled="false"
            className="w-full"
            suppressHydrationWarning
          >

            {/* Top bar row only while at top */}
            {(topBarText || supportPhone || currencyLabel) && (
              <div className="site-header-top">
                <div className="site-header-top-inner">
                  <div className="site-header-top-left">
                    {topBarText && <span>{topBarText}</span>}
                  </div>
                  <div className="site-header-top-right">
                    {supportPhone && <span>Call: {supportPhone}</span>}
                    {currencyLabel && <span>{currencyLabel}</span>}
                  </div>
                </div>
              </div>
            )}

            {/* Main bar: normal at top, becomes floating pill when scrolled */}
            <div className="site-header-main site-header-pill-main">
              <div className="site-header-main-inner site-header-pill-inner">
                {renderLogoAndBrand()}

                <div className="site-header-main-center">
                  <HeaderNav items={itemsToRender} />
                  {renderCategoriesMega()}
                </div>

                <div className="site-header-main-right">
                  <HeaderActions
                    icons={headerIconOrder}
                    iconVariant={headerIconVariant}
                  />
                </div>
              </div>
            </div>

            {/* Spacer only when pill is floating, so content doesn't jump under it */}
            <div className="site-header-pill-spacer" />
          </div>
        </>
      )}

      {/* LAYOUT 5: PRINCITY-INSPIRED FLAT COMMERCE HEADER */}
      {layout === "princity" && (
        <>
          <HeaderPillController />
          <div
            id="site-header-pill"
            data-scrolled="false"
            className="site-header-princity-shell"
            suppressHydrationWarning
          >
            <div className="site-header-princity-meta-row">
              <span>{topBarText || "Modern commerce by Webpages"}</span>
              <span>
                {[supportPhone, currencyLabel].filter(Boolean).join("   ")}
              </span>
            </div>

            <div className="site-header-princity">
              <div className="site-header-princity-inner">
                <div className="site-header-princity-left">
                  {renderLogoAndBrand()}
                </div>

                <div className="site-header-princity-center">
                  <HeaderNav items={itemsToRender} />
                  {renderCategoriesMega()}
                </div>

                <div className="site-header-princity-right">
                  <HeaderActions
                    icons={headerIconOrder}
                    iconVariant={headerIconVariant}
                  />
                </div>
              </div>
            </div>

            <div className="site-header-pill-spacer site-header-princity-spacer" />
          </div>
        </>
      )}

      {/* LAYOUT 1: SIMPLE (ACF = simple) */}
      {layout === "simple" && (
        <div className="site-header-main">
          <div className="site-header-main-inner">
            {renderLogoAndBrand()}

            <div className="site-header-main-center">
              <HeaderNav items={itemsToRender} />
              {renderCategoriesMega()}
            </div>

            <div className="site-header-main-right">
              <HeaderActions
                icons={headerIconOrder}
                iconVariant={headerIconVariant}
              />
            </div>
          </div>
        </div>
      )}

      {/* LAYOUT 3: HERO (ACF = split) */}
      {layout === "hero" && (
        <div className="site-header-hero">
          <div className="site-header-hero-inner">
            {logoUrl && (
              <div className="site-header-hero-logo">
                <Image
                  src={logoUrl}
                  alt={brandName || "Store logo"}
                  width={headerLogoMaxWidth}
                  height={headerLogoMaxWidth}
                  style={{ objectFit: "contain" }}
                />
              </div>
            )}

            <Link href="/" className="site-header-hero-title">
              <span style={{ color: primaryColor }}>
                {brandName || "Webpages Store"}
              </span>
            </Link>

            <p className="site-header-hero-subtitle">
              Curated tech &amp; setup by Webpages.
            </p>

            <div className="site-header-hero-menu">
              <HeaderNav items={itemsToRender} />
              {renderCategoriesMega()}
            </div>

            <div className="site-header-hero-actions">
              <HeaderActions
                icons={headerIconOrder}
                iconVariant={headerIconVariant}
              />
            </div>
          </div>
        </div>
      )}
    </HeaderFrame>
  );
}
