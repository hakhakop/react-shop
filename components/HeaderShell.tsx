import React from "react";
import Link from "next/link";
import Image from "next/image";

import {
  getThemeSettings,
  extractHeaderSettings,
  type HeaderSettings,
} from "../lib/themeSettings";
import { type MenuItem } from "../lib/navigation";
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
  type ReactMenuItem,
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
  // Load theme settings and custom pages in parallel
  const [settingsRaw, builderPages, shellSettingsRaw, homeLayout] =
    await Promise.all([
      getThemeSettings().catch(() => ({})),
      readBuilderCustomPages(),
      getBuilderShellSettings(),
      getPublishedBuilderLayout("home").catch(() => null),
    ]);

  const settings = (settingsRaw || {}) as Record<string, unknown>;
  const shellSettings = (shellSettingsRaw || {}) as Partial<BuilderShellSettings>;

  const headerSettings: HeaderSettings = settings.headerSettings
    ? (settings.headerSettings as HeaderSettings)
    : extractHeaderSettings(settings);

  // Colors: prioritize React shellSettings over ACF options
  const primaryColor = asString(shellSettings.primaryColor) || asString(settings.primary_color) || "#111827";
  const accentColor = asString(shellSettings.accentColor) || asString(settings.accent_color) || "#ec4899";

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
    case "hero":
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
    case "two-row":
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
  const effectiveHeaderTextMode =
    shellSettings.headerTextMode || "auto";
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

  // Helper to build hierarchy from flat ReactMenuItems
  const buildReactMenuTree = (items: ReactMenuItem[]): MenuItem[] => {
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
  };

  // Prioritize React shellSettings.menuItems first, with static defaults if empty
  const reactMenuItems = shellSettings.menuItems;
  const hasReactMenuItems = Array.isArray(reactMenuItems) && reactMenuItems.length > 0;

  const itemsToRender = hasReactMenuItems
    ? buildReactMenuTree(reactMenuItems)
    : [
        { id: "home", label: "Home", url: "/", path: "/" },
        { id: "shop", label: "Shop", url: "/shop", path: "/shop" },
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
  const renderTopToolbar = () => {
    if (
      !topToolbarVisible ||
      (!effectiveTopBarText && !effectiveSupportPhone && !effectiveToolbarMeta)
    ) {
      return null;
    }

    return (
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
    );
  };
  const renderPrincityTopToolbar = () => {
    if (
      !topToolbarVisible ||
      (!effectiveTopBarText && !effectiveSupportPhone && !effectiveToolbarMeta)
    ) {
      return null;
    }

    return (
      <div className="site-header-princity-meta-row">
        <span>{effectiveTopBarText || "Modern commerce by Webpages"}</span>
        <span>{[effectiveSupportPhone, effectiveToolbarMeta].filter(Boolean).join("   ")}</span>
      </div>
    );
  };

   return (
    <HeaderFrame
      accentColor={accentColor}
      mode={layout === "pill" || layout === "princity" ? "none" : "sticky"}
      className={headerClassName}
      backgroundMode={effectiveHeaderBackgroundMode as any}
      textMode={effectiveHeaderTextMode}
    >
      {/* LAYOUT 2: TWO-ROW (ACF = centered) */}
      {layout === "two-row" && (
        <>
          {renderTopToolbar()}

          <div className="site-header-main site-header-main--two-row">
            {/* Row 1: Brand & Logo + Actions */}
            <div className="site-header-main-inner site-header-row-top">
              {renderLogoAndBrand()}
              <div className="site-header-main-right">
                {renderHeaderActions()}
              </div>
            </div>

            {/* Row 2: Navigation Menu */}
            <div className="site-header-row-bottom">
              <div className="site-header-row-bottom-inner">
                <HeaderNav
                  items={itemsToRender}
                  presentationById={menuPresentation}
                  categories={<CategoryMegaMenu />}
                  serviceHomepageMode={serviceHomepageMode}
                />
                {renderCategoriesMega()}
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

            {/* Redesigned Pill layout has no top toolbar to maintain clean aesthetics */}

            {/* Main bar: normal at top, becomes floating pill when scrolled */}
            <div className="site-header-main site-header-pill-main">
              <div className="site-header-main-inner site-header-pill-inner">
                {renderLogoAndBrand()}

                <div className="site-header-main-center">
                  <HeaderNav
                    items={itemsToRender}
                    presentationById={menuPresentation}
                    categories={<CategoryMegaMenu />}
                    serviceHomepageMode={serviceHomepageMode}
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
            {renderPrincityTopToolbar()}

            <div className="site-header-princity">
              <div className="site-header-princity-inner">
                <div className="site-header-princity-left">
                  {renderLogoAndBrand()}
                </div>

                <div className="site-header-princity-center">
                  <HeaderNav
                    items={itemsToRender}
                    presentationById={menuPresentation}
                    categories={<CategoryMegaMenu />}
                    serviceHomepageMode={serviceHomepageMode}
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
                categories={<CategoryMegaMenu />}
                serviceHomepageMode={serviceHomepageMode}
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
                categories={<CategoryMegaMenu />}
                serviceHomepageMode={serviceHomepageMode}
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
