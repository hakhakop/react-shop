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
import {
  getBuilderShellSettings,
  type BuilderHeaderLayout,
  type BuilderMenuPresentationMap,
  type BuilderShellSettings,
} from "../lib/builderShell";
import {
  getPublishedBuilderLayout,
  readBuilderCustomPages,
} from "../lib/builderLayouts";
function asString(value: unknown, fallback: string | null = null): string | null {
  if (typeof value === "string" && value.trim() !== "") return value.trim();
  return fallback;
}

type HeaderShellProps = {
  layoutOverride?: BuilderHeaderLayout;
};

export default async function HeaderShell({ layoutOverride }: HeaderShellProps) {
  // Load theme settings and main menu in parallel
  const [settingsRaw, menuItemsRaw, builderPages, shellSettingsRaw, homeLayout] =
    await Promise.all([
      getThemeSettings().catch(() => ({})),
      getMainMenuItems(),
      readBuilderCustomPages(),
      getBuilderShellSettings(),
      getPublishedBuilderLayout("home").catch(() => null),
    ]);

  const settings = (settingsRaw || {}) as Record<string, unknown>;

  const headerSettings: HeaderSettings = settings.headerSettings
    ? (settings.headerSettings as HeaderSettings)
    : extractHeaderSettings(settings);

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
    const logoObject = logoField as Record<string, unknown>;
    logoUrl =
      (logoObject.url as string) ||
      (logoObject.source_url as string) ||
      (logoObject.sourceUrl as string) ||
      (logoObject.full_url as string) ||
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

  const serviceHomepageMode = Boolean(
    homeLayout?.sections?.some((section) =>
      section.title?.includes("Beautiful React Websites") ||
      section.layoutItems?.some((item) =>
        item.blocks?.some((block) =>
          block.title?.includes("Beautiful React Websites"),
        ),
      ),
    ),
  );
  const shellSettings = (shellSettingsRaw || {}) as Partial<BuilderShellSettings>;
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
  const showLogo =
    Boolean(effectiveLogoUrl) &&
    (effectiveBrandMode === "logo" || effectiveBrandMode === "both");
  const showBrand =
    Boolean(effectiveBrandText) &&
    (effectiveBrandMode === "brand" ||
      effectiveBrandMode === "both" ||
      !showLogo);

  // Menu items (from WPGraphQL) with fallback
  const menuItems = (Array.isArray(menuItemsRaw)
    ? (menuItemsRaw as MenuItem[])
    : []) as MenuItem[];

  const demoPageKeys = new Set([
    "page:demos",
    "page:furniture-store",
    "page:fashion-store",
  ]);
  const demoChildOrder = ["page:furniture-store", "page:fashion-store"];
  const demoChildren = demoChildOrder
    .map((key) => builderPages.find((page) => page.key === key))
    .filter(Boolean)
    .map((page) => ({
      id: page!.key,
      label: page!.title,
      url: `/${page!.slug}`,
      path: `/${page!.slug}`,
    }));
  const demosPage = builderPages.find((page) => page.key === "page:demos");
  const builderPageItems: MenuItem[] = builderPages
    .filter((page) => !demoPageKeys.has(page.key))
    .map((page) => ({
      id: page.key,
      label: page.title,
      url: `/${page.slug}`,
      path: `/${page.slug}`,
    }));

  if (demoChildren.length > 0) {
    builderPageItems.push({
      id: demosPage?.key ?? "builder-demos",
      label: demosPage?.title ?? "Demos",
      url: demosPage ? `/${demosPage.slug}` : "#",
      path: demosPage ? `/${demosPage.slug}` : "#",
      children: demoChildren,
    });
  }

  const serviceMenuItems: MenuItem[] = [
    { id: "service-home", label: "Home", url: "/", path: "/" },
    {
      id: "service-problem",
      label: "Problems",
      url: "/#webpages-problem",
      path: "/#webpages-problem",
    },
    {
      id: "service-solution",
      label: "Solution",
      url: "/#webpages-solution",
      path: "/#webpages-solution",
    },
    {
      id: "service-workflow",
      label: "Workflow",
      url: "/#webpages-workflow",
      path: "/#webpages-workflow",
    },
    {
      id: "service-pricing",
      label: "Pricing",
      url: "/#webpages-pricing",
      path: "/#webpages-pricing",
    },
    {
      id: "service-demos",
      label: "Demos",
      url: "/demos",
      path: "/demos",
      children: [
        {
          id: "service-demo-furniture",
          label: "Furniture Store",
          url: "/furniture-store",
          path: "/furniture-store",
        },
        {
          id: "service-demo-fashion",
          label: "Fashion Store",
          url: "/fashion-store",
          path: "/fashion-store",
        },
      ],
    },
  ];

  const itemsToRender = serviceHomepageMode
    ? serviceMenuItems
    : menuItems.length > 0
      ? [...menuItems, ...builderPageItems]
      : [
          { id: "home", label: "Home", url: "/", path: "/" },
          { id: "shop", label: "Shop", url: "/", path: "/" },
          ...builderPageItems,
        ];

  const menuPresentation = (
    (shellSettingsRaw || {}) as { menuPresentation?: BuilderMenuPresentationMap }
  ).menuPresentation ?? {};

  const renderCategoriesMega = () => (
    <HeaderCategoriesDropdown>
      <CategoryMegaMenu />
    </HeaderCategoriesDropdown>
  );

  const renderLogoAndBrand = () => (
    <div className="site-header-logo-wrap">
      {showLogo && effectiveLogoUrl && (
        <Link href="/" className="site-header-logo-img-wrap">
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
        <Link href="/" className="site-header-brand">
          <span style={{ color: primaryColor }}>{effectiveBrandText}</span>
        </Link>
      )}
    </div>
  );

  const renderHeaderActions = () => (
    <>
      {serviceHomepageMode && (
        <Link href="/client" className="site-header-action-pill site-header-service-cta">
          Start
        </Link>
      )}
      <HeaderActions
        icons={effectiveIconOrder}
        iconVariant={effectiveIconVariant}
      />
    </>
  );

   return (
    <HeaderFrame
      accentColor={accentColor}
      mode={layout === "pill" || layout === "princity" ? "none" : "sticky"}
      className={`${layout === "pill" || layout === "princity" ? "site-header--pill" : ""}${
        serviceHomepageMode ? " site-header--service" : ""
      } site-header--indicator-${effectiveActiveIndicator}`.trim()}
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
                <HeaderNav
                  items={itemsToRender}
                  presentationById={menuPresentation}
                />
                {renderCategoriesMega()}
              </div>

              <div className="site-header-main-right">
                {renderHeaderActions()}
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
                  <HeaderNav
                    items={itemsToRender}
                    presentationById={menuPresentation}
                  />
                  {renderCategoriesMega()}
                </div>

                <div className="site-header-main-right">
                  {renderHeaderActions()}
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
              <span>
                {serviceHomepageMode
                  ? "Beautiful React websites with WordPress CMS and hosting included"
                  : topBarText || "Modern commerce by Webpages"}
              </span>
              <span>
                {serviceHomepageMode
                  ? "Plans coming soon"
                  : [supportPhone, currencyLabel].filter(Boolean).join("   ")}
              </span>
            </div>

            <div className="site-header-princity">
              <div className="site-header-princity-inner">
                <div className="site-header-princity-left">
                  {renderLogoAndBrand()}
                </div>

                <div className="site-header-princity-center">
                  <HeaderNav
                    items={itemsToRender}
                    presentationById={menuPresentation}
                  />
                  {renderCategoriesMega()}
                </div>

                <div className="site-header-princity-right">
                  {renderHeaderActions()}
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
              <HeaderNav
                items={itemsToRender}
                presentationById={menuPresentation}
              />
              {renderCategoriesMega()}
            </div>

            <div className="site-header-main-right">
              {renderHeaderActions()}
            </div>
          </div>
        </div>
      )}

      {/* LAYOUT 3: HERO (ACF = split) */}
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
              <Link href="/" className="site-header-hero-title">
                <span style={{ color: primaryColor }}>
                  {effectiveBrandText}
                </span>
              </Link>
            )}

            <p className="site-header-hero-subtitle">
              Curated tech &amp; setup by Webpages.
            </p>

            <div className="site-header-hero-menu">
              <HeaderNav
                items={itemsToRender}
                presentationById={menuPresentation}
              />
              {renderCategoriesMega()}
            </div>

            <div className="site-header-hero-actions">
              {renderHeaderActions()}
            </div>
          </div>
        </div>
      )}
    </HeaderFrame>
  );
}
