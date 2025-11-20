import React from "react";
import Link from "next/link";
import Image from "next/image";

import { getThemeSettings } from "../lib/themeSettings";
import { getMainMenuItems, MenuItem } from "../lib/navigation";
import HeaderActions from "./HeaderActions";
import CategoryMegaMenu from "./CategoryMegaMenu";
import HeaderNav from "./HeaderNav";

function asString(value: unknown, fallback: string | null = null): string | null {
  if (typeof value === "string" && value.trim() !== "") return value.trim();
  return fallback;
}

export default async function HeaderShell() {
  // Theme settings + WP "Main" menu
  const [settingsRaw, menuItemsRaw] = await Promise.all([
    getThemeSettings(),
    getMainMenuItems(),
  ]);

  const settings = settingsRaw as Record<string, any>;

  // ----- COLORS -----
  const primaryColor =
    asString(settings.primary_color, "#111827") || "#111827";
  const accentColor =
    asString(settings.accent_color, "#ec4899") || "#ec4899";

  // ----- LOGO -----
  const logoField =
    settings.logo ||
    settings.site_logo ||
    settings.store_logo;

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

  // ----- BRAND NAME (OPTIONAL) -----
  // Try to read a name from ACF / general settings.
  // If nothing is present, we simply skip the text completely.
  const brandName =
    asString(
      settings.brand_name ||
        settings.site_title ||
        settings.store_name ||
        settings.blogname,
      null
    );

  // ----- TOP BAR CONTENT (OPTIONAL) -----
  const topBarText = asString(
    settings.top_bar_text,
    "Fast support & setup by Webpages"
  );

  const supportPhone = asString(
    settings.support_phone,
    "+374 xx xx xx"
  );

  const currencyLabel = asString(settings.currency_label, "AMD ֏");

  // ----- HEADER LAYOUT: ACF field "layout" -----
  // Field values: simple / centered / split
  const layoutValue = (asString(settings.layout, "centered") || "centered").toLowerCase();

  let layout: "simple" | "two-row" | "hero";

  switch (layoutValue) {
    case "simple":
      layout = "simple";
      break;
    case "split":
      layout = "hero";
      break;
    case "centered":
    default:
      layout = "two-row";
      break;
  }

  // ----- MENU -----
  const menuItems = (Array.isArray(menuItemsRaw)
    ? (menuItemsRaw as MenuItem[])
    : []) as MenuItem[];

  const itemsToRender =
    menuItems.length > 0
      ? menuItems
      : [
          { id: "home", label: "Home", url: "/", path: "/" },
          { id: "shop", label: "Shop", url: "/", path: "/" },
        ];

  const renderCategoriesMega = () => (
    <div className="site-header-categories">
      <button
        type="button"
        className="site-header-nav-link site-header-categories-toggle"
      >
        <span>Categories</span>
      </button>
      <div className="site-header-categories-panel">
        <CategoryMegaMenu />
      </div>
    </div>
  );

  // ----- RENDER -----
  return (
    <header
      className="site-header"
      style={{
        borderBottomColor: accentColor,
      }}
    >
      {/* LAYOUT 2: TWO-ROW (ACF = centered) */}
      {layout === "two-row" && (
        <>
          {/* Top bar – now driven by settings, can be "turned off"
              by emptying text in WP later if you want */}
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

          {/* Main bar */}
          <div className="site-header-main">
            <div className="site-header-main-inner">
              <div className="site-header-logo-wrap">
                {logoUrl && (
                  <Link href="/" className="site-header-logo-img-wrap">
                    <Image
                      src={logoUrl}
                      alt={brandName || "Store logo"}
                      width={40}
                      height={40}
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

              <div className="site-header-main-center">
                <HeaderNav items={itemsToRender} />
                {renderCategoriesMega()}
              </div>

              <div className="site-header-main-right">
                <HeaderActions />
              </div>
            </div>
          </div>
        </>
      )}

      {/* LAYOUT 1: SIMPLE (ACF = simple) */}
      {layout === "simple" && (
        <div className="site-header-main">
          <div className="site-header-main-inner">
            <div className="site-header-logo-wrap">
              {logoUrl && (
                <Link href="/" className="site-header-logo-img-wrap">
                  <Image
                    src={logoUrl}
                    alt={brandName || "Store logo"}
                    width={40}
                    height={40}
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

            <div className="site-header-main-center">
              <HeaderNav items={itemsToRender} />
              {renderCategoriesMega()}
            </div>

            <div className="site-header-main-right">
              <HeaderActions />
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
                  width={56}
                  height={56}
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
              <HeaderActions />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}