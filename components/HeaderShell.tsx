import Link from "next/link";
import Image from "next/image";

import { getThemeSettings } from "../lib/themeSettings";
import { getMainMenuItems, MenuItem } from "../lib/navigation";
import HeaderActions from "./HeaderActions";
import CategoryMegaMenu from "./CategoryMegaMenu";

function asString(value: unknown, fallback: string | null = null): string | null {
  if (typeof value === "string" && value.trim() !== "") return value;
  return fallback;
}

export default async function HeaderShell() {
  // Theme settings + WP "Main" menu
  const [settingsRaw, menuItemsRaw] = await Promise.all([
    getThemeSettings(),
    getMainMenuItems(),
  ]);

  // settingsRaw is the parsed JSON from webpagesThemeSettingsRaw
  const settings = settingsRaw as Record<string, any>;

  // Colors
  const primaryColor =
    asString(settings.primary_color, "#111827") || "#111827";
  const accentColor =
    asString(settings.accent_color, "#ec4899") || "#ec4899";

  // Logo
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

  // ----- HEADER LAYOUT: uses ACF field "layout" -----
  // Field values: simple / centered / split
  const layoutValue = (asString(settings.layout, "centered") || "centered").toLowerCase();

  console.log("Theme settings layout field:", layoutValue);

  let layout: "simple" | "two-row" | "hero";

  switch (layoutValue) {
    case "simple":
      layout = "simple";
      break;
    case "split":
      // treat "split" as hero-style header for now
      layout = "hero";
      break;
    case "centered":
    default:
      layout = "two-row";
      break;
  }

  // ----- MENU -----

  const menuItems: MenuItem[] =
    (Array.isArray(menuItemsRaw) ? menuItemsRaw : []) || [];

  const itemsToRender =
    menuItems.length > 0
      ? menuItems
      : [
          { id: "home", label: "Home", url: "/", path: "/" },
          { id: "shop", label: "Shop", url: "/", path: "/" },
        ];

  const renderMenu = () => (
    <nav className="site-header-nav">
      {itemsToRender.map((item) => {
        const href = item.path || item.url || "#";
        return (
          <Link
            key={item.id}
            href={href}
            className="site-header-nav-link"
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
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
          {/* Top bar */}
          <div className="site-header-top">
            <div className="site-header-top-inner">
              <div className="site-header-top-left">
                Fast support &amp; setup by Webpages
              </div>
              <div className="site-header-top-right">
                <span>Call: +374 xx xx xx</span>
                <span>AMD ֏</span>
              </div>
            </div>
          </div>

          {/* Main bar */}
          <div className="site-header-main">
            <div className="site-header-main-inner">
              <div className="site-header-logo-wrap">
                {logoUrl && (
                  <Link href="/" className="site-header-logo-img-wrap">
                    <Image
                      src={logoUrl}
                      alt="Store logo"
                      width={40}
                      height={40}
                      style={{ objectFit: "contain" }}
                    />
                  </Link>
                )}
                <Link href="/" className="site-header-brand">
                  <span style={{ color: primaryColor }}>Webpages</span>
                </Link>
              </div>

              <div className="site-header-main-center">
                {renderMenu()}
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
                    alt="Store logo"
                    width={40}
                    height={40}
                    style={{ objectFit: "contain" }}
                  />
                </Link>
              )}
              <Link href="/" className="site-header-brand">
                <span style={{ color: primaryColor }}>Webpages</span>
              </Link>
            </div>

            <div className="site-header-main-center">
              {renderMenu()}
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
                  alt="Store logo"
                  width={56}
                  height={56}
                  style={{ objectFit: "contain" }}
                />
              </div>
            )}
            <Link href="/" className="site-header-hero-title">
              <span style={{ color: primaryColor }}>Webpages Store</span>
            </Link>
            <p className="site-header-hero-subtitle">
              Curated tech &amp; setup by Webpages.
            </p>

            <div className="site-header-hero-menu">
              {renderMenu()}
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