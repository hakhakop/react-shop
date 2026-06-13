import type { Metadata } from "next";
import "./globals.css";
// Force HMR reload for category layout alignment styling modifications

import { getThemeSettings, presetMap } from "../lib/themeSettings";
import { CartProvider } from "../components/CartProvider";
import { ToastProvider } from "../components/ToastProvider";
import { ThemeProvider } from "../components/ThemeProvider";
import { WishlistProvider } from "../components/WishlistProvider";
import MiniCart from "../components/MiniCart";
import HeaderShell from "../components/HeaderShell";
import SearchProvider from "../components/SearchProvider";
import RecentlyViewedProvider from "../components/RecentlyViewedProvider";
import FloatingCartSummary from "../components/FloatingCartSummary";
import ScrollToTopButton from "../components/ScrollToTopButton";
import FrontendAdminBar from "../components/FrontendAdminBar";
import { getBuilderShellSettings } from "../lib/builderShell";
import {
  resolveBuilderSpacing,
  type BuilderSpacingContext,
} from "../lib/builderSpacing";

export const metadata: Metadata = {
  title: "Webpages Store",
  description:
    "Headless WooCommerce store powered by WordPress + GraphQL + Next.js",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [themeSettingsRaw, shellSettings] = await Promise.all([
    getThemeSettings(),
    getBuilderShellSettings(),
  ]);

  // All ACF options from WordPress (via webpagesThemeSettingsRaw)
  const settings = (themeSettingsRaw || {}) as Record<string, any>;

  // Prioritize React shellSettings for storefrontPreset, falling back to ACF settings
  const storefrontPreset = String(shellSettings.storefrontPreset || settings.storefrontPreset || "minimal");

  // Get active design tokens for this preset
  const chosenTokens = presetMap[storefrontPreset] || presetMap["minimal"];

  // Prioritize brand colors from React shellSettings, falling back to ACF options
  const primaryColor = shellSettings.primaryColor || settings.primary_color || null;
  const accentColor = shellSettings.accentColor || settings.accent_color || null;

  // Enrich chosen preset tokens with active brand colors
  const designTokens = {
    ...chosenTokens,
    ...(primaryColor
      ? {
          "--color-primary": primaryColor,
          "--primary-strong": primaryColor,
        }
      : {}),
    ...(accentColor
      ? {
          "--color-accent": accentColor,
          "--accent": accentColor,
          "--accent-strong": accentColor,
          "--price-border": accentColor,
          "--price-color": accentColor,
        }
      : {}),
  } as Record<string, string>;

  const designTokensCss = Object.entries(designTokens)
    .map(([key, value]) => `${key}: ${value};`)
    .join("\n  ");

  const getCssValue = (value: unknown, fallback: string): string => {
    if (value === undefined || value === null) return fallback;
    const raw = String(value).trim();
    return raw || fallback;
  };

  const toCssSize = (value: unknown, fallback: string): string => {
    if (value === undefined || value === null) return fallback;
    const raw = String(value).trim();
    if (!raw) return fallback;
    // If it's a pure number, treat as px, otherwise trust the unit the user typed
    return /^\d+(\.\d+)?$/.test(raw) ? `${raw}px` : raw;
  };

  const normalizeAspectRatio = (
    value: unknown,
    fallback: string
  ): string => {
    if (value === undefined || value === null) return fallback;
    const raw = String(value).trim();
    if (!raw) return fallback;

    // Accept formats like "4/3", "16:9", "3-2"
    const match = raw.match(/^(\d+)\s*[/:-]\s*(\d+)$/);
    if (match) {
      return `${match[1]} / ${match[2]}`;
    }

    // Otherwise trust what user typed (e.g. "auto", "1 / 1")
    return raw;
  };

  const normalizeObjectFit = (
    value: unknown,
    fallback: string
  ): string => {
    if (value === undefined || value === null) return fallback;
    const raw = String(value).trim();
    if (!raw) return fallback;

    const lower = raw.toLowerCase();
    // Only allow valid CSS object-fit values
    if (
      lower === "contain" ||
      lower === "cover" ||
      lower === "fill" ||
      lower === "none" ||
      lower === "scale-down"
    ) {
      return lower;
    }

    return fallback;
  };

  const hasSettingValue = (value: unknown): boolean => {
    return value !== undefined && value !== null && String(value).trim() !== "";
  };

  const optionalCssVar = (name: string, value: unknown): string => {
    return hasSettingValue(value) ? `  ${name}: ${String(value).trim()};` : "";
  };

  // Product card look
  const productCardRadius = toCssSize(
    shellSettings.productCardRadius || settings.product_card_radius,
    designTokens["--radius-lg"] ?? "10px"
  );

  const sectionSpacingToCss = (
    value: string | undefined,
    context: BuilderSpacingContext,
  ) => resolveBuilderSpacing(value, context).css;
  const productCardBg = getCssValue(
    shellSettings.productCardBg || settings.product_card_background,
    designTokens["--product-card-bg"] ?? "#ffffff"
  );
  const productCardShadow = getCssValue(
    shellSettings.productCardShadow || settings.product_card_shadow,
    designTokens["--shadow-sm"] ?? "0 0 0 rgba(15, 23, 42, 0)"
  );
  const productCardShadowHover = getCssValue(
    shellSettings.productCardShadowHover || settings.product_card_shadow_hover,
    designTokens["--shadow-lg"] ?? "0 18px 40px rgba(15, 23, 42, 0.14)"
  );

  // Product card sizing
  const productCardMinHeight = toCssSize(
    shellSettings.productCardMinHeight || settings.product_card_height,
    "0px"
  );
  const productCardMaxWidth = toCssSize(
    shellSettings.productCardMaxWidth || settings.product_card_width,
    "100%"
  );

  // Product image sizing
  const productImageWidth = toCssSize(
    shellSettings.productImageWidth || settings.product_image_width,
    "100%"
  );
  const productImageHeight = toCssSize(
    shellSettings.productImageHeight || settings.product_image_height,
    "260px"
  );
  const productImageMaxWidth = toCssSize(
    shellSettings.productImageMaxWidth || settings.product_image_max_width,
    "100%"
  );
  const productImageMaxHeight = toCssSize(
    shellSettings.productImageMaxHeight || settings.product_image_max_height,
    "100%"
  );
  const productImageAspectRatio = normalizeAspectRatio(
    shellSettings.productImageAspectRatio || settings.product_image_aspect_ratio,
    "auto"
  );

  const productImageNoPadding =
    shellSettings.productImageNoPadding === true ||
    (shellSettings.productImageNoPadding === undefined && (
      settings.product_image_no_padding === true ||
      settings.product_image_no_padding === 1 ||
      settings.product_image_no_padding === "1" ||
      settings.disable_image_padding === true ||
      settings.disable_image_padding === 1 ||
      settings.disable_image_padding === "1"
    ));

  const productImagePadding = toCssSize(
    shellSettings.productImagePadding || (productImageNoPadding ? "0px" : null),
    "clamp(22px, 2.4vw, 36px)"
  );

  const productImageObjectFit = normalizeObjectFit(
    shellSettings.productImageObjectFit ||
      settings.product_image_fit ||
      settings.product_image_object_fit ||
      settings.image_fit_mode ||
      settings.product_image_mode,
    productImageNoPadding ? "cover" : "contain"
  );

  const explicitWordPressProductVars = [
    optionalCssVar("--wp-product-card-bg", settings.product_card_background),
    optionalCssVar("--wp-product-card-shadow", settings.product_card_shadow),
    optionalCssVar(
      "--wp-product-card-shadow-hover",
      settings.product_card_shadow_hover
    ),
  ]
    .filter(Boolean)
    .join("\n");

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`body-root ${productImageNoPadding ? "shop-image-padding--none" : ""}`}
        data-storefront-preset={storefrontPreset}
        suppressHydrationWarning
      >
        {/* Theme-driven CSS variables for product cards and images */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
:root {
  ${designTokensCss}

  --product-card-radius: ${productCardRadius};
  --product-card-bg: ${productCardBg};
  --product-card-shadow: ${productCardShadow};
  --product-card-shadow-hover: ${productCardShadowHover};

  --product-card-min-height: ${productCardMinHeight};
  --product-card-max-width: ${productCardMaxWidth};

  --product-image-width: ${productImageWidth};
  --product-image-height: ${productImageHeight};
  --product-image-max-width: ${productImageMaxWidth};
  --product-image-max-height: ${productImageMaxHeight};
  --product-image-object-fit: ${productImageObjectFit};
  --product-image-aspect-ratio: ${productImageAspectRatio};
  --product-image-padding: ${productImagePadding};
  --builder-global-section-padding-top: ${sectionSpacingToCss(shellSettings.sectionPaddingTop, "sectionPadding")};
  --builder-global-section-padding-bottom: ${sectionSpacingToCss(shellSettings.sectionPaddingBottom, "sectionPadding")};
  --builder-global-section-margin-top: ${sectionSpacingToCss(shellSettings.sectionMarginTop, "sectionMargin")};
  --builder-global-section-margin-bottom: ${sectionSpacingToCss(shellSettings.sectionMarginBottom, "sectionMargin")};
  --builder-global-row-padding-top: ${sectionSpacingToCss(shellSettings.rowPaddingTop, "rowPadding")};
  --builder-global-row-padding-bottom: ${sectionSpacingToCss(shellSettings.rowPaddingBottom, "rowPadding")};
  --builder-global-row-margin-top: ${sectionSpacingToCss(shellSettings.rowMarginTop, "rowMargin")};
  --builder-global-row-margin-bottom: ${sectionSpacingToCss(shellSettings.rowMarginBottom, "rowMargin")};
  --builder-global-row-gap: ${sectionSpacingToCss(shellSettings.rowGap, "rowGap")};
  --builder-global-element-padding-top: ${sectionSpacingToCss(shellSettings.elementPaddingTop, "elementPadding")};
  --builder-global-element-padding-right: ${sectionSpacingToCss(shellSettings.elementPaddingRight, "elementPadding")};
  --builder-global-element-padding-bottom: ${sectionSpacingToCss(shellSettings.elementPaddingBottom, "elementPadding")};
  --builder-global-element-padding-left: ${sectionSpacingToCss(shellSettings.elementPaddingLeft, "elementPadding")};
  --builder-global-element-margin-top: ${sectionSpacingToCss(shellSettings.elementMarginTop, "elementMargin")};
  --builder-global-element-margin-right: ${sectionSpacingToCss(shellSettings.elementMarginRight, "elementMargin")};
  --builder-global-element-margin-bottom: ${sectionSpacingToCss(shellSettings.elementMarginBottom, "elementMargin")};
  --builder-global-element-margin-left: ${sectionSpacingToCss(shellSettings.elementMarginLeft, "elementMargin")};
${explicitWordPressProductVars}
}
            `.trim(),
          }}
        />

        <ThemeProvider>
          <ToastProvider>
            <CartProvider>
              <WishlistProvider>
                <SearchProvider>
                   <RecentlyViewedProvider>
                  {shellSettings.headerVisible && (
                    <HeaderShell layoutOverride={shellSettings.headerLayout} />
                  )}

                  <main className="site-main">{children}</main>

                  {/* Scroll to top + Floating cart bubble */}
                    <FrontendAdminBar />
                    <ScrollToTopButton />
                  {/* Floating cart bubble */}
                    <FloatingCartSummary />
                  <MiniCart />

                  <footer className="site-footer">
                    <div className="site-footer-inner">
                      <span>
                        © 2025 Webpages · Headless WooCommerce demo
                      </span>
                      <span>
                        Powered by{" "}
                          <span className="site-footer-strong">
                            WordPress · WooCommerce · WPGraphQL · Next.js
                          </span>
                      </span>
                    </div>
                  </footer>
                  </RecentlyViewedProvider>
                </SearchProvider>
              </WishlistProvider>
            </CartProvider>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
