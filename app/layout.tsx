// app/layout.tsx

import type { Metadata } from "next";
import "./globals.css";

import Link from "next/link";
import {
  getProductCategories,
  ProductCategory,
} from "../lib/navigation";
import { getCategoryTree } from "../lib/categories";
import { getThemeSettings } from "../lib/themeSettings";
import { CartProvider } from "../components/CartProvider";
import { ToastProvider } from "../components/ToastProvider";
import { ThemeProvider } from "../components/ThemeProvider";
import { WishlistProvider } from "../components/WishlistProvider";
import HeaderShell from "../components/HeaderShell";
import CategoryBar from "../components/CategoryBar";

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
  // Load navigation categories and theme settings in parallel
  const [[flatCategories, categoryTree], themeSettingsRaw] =
    await Promise.all([
      Promise.all([getProductCategories(), getCategoryTree()]),
      getThemeSettings(),
    ]);

  // Map category slug -> product count for quick lookup
  const countsBySlug = new Map<string, number>();
  flatCategories.forEach((cat: ProductCategory) => {
    countsBySlug.set(cat.slug, cat.count);
  });

  // Convert Map to plain object so it can be passed to a client component
  const countsBySlugObj: Record<string, number> = {};
  countsBySlug.forEach((value, key) => {
    countsBySlugObj[key] = value;
  });

  // All ACF options from WordPress (via webpagesThemeSettingsRaw)
  const settings = (themeSettingsRaw || {}) as Record<string, any>;

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

  // Product card look
  const productCardRadius = getCssValue(
    settings.product_card_radius,
    "10px"
  );
  const productCardBg = getCssValue(
    settings.product_card_background,
    "#ffffff"
  );
  const productCardShadow = getCssValue(
    settings.product_card_shadow,
    "0 0 0 rgba(15, 23, 42, 0)"
  );
  const productCardShadowHover = getCssValue(
    settings.product_card_shadow_hover,
    "0 18px 40px rgba(15, 23, 42, 0.14)"
  );

  // Product card sizing
  const productCardMinHeight = toCssSize(
    settings.product_card_height,
    "0"
  );
  const productCardMaxWidth = toCssSize(
    settings.product_card_width,
    "100%"
  );

  // Product image sizing
  const productImageWidth = toCssSize(
    settings.product_image_width,
    "100%"
  );
  const productImageHeight = toCssSize(
    settings.product_image_height,
    "260px"
  );
  const productImageMaxWidth = toCssSize(
    settings.product_image_max_width,
    "100%"
  );
  const productImageMaxHeight = toCssSize(
    settings.product_image_max_height,
    "100%"
  );
  const productImageAspectRatio = normalizeAspectRatio(
    settings.product_image_aspect_ratio,
    "auto"
  );

  const productImageNoPadding =
    settings.product_image_no_padding === true ||
    settings.product_image_no_padding === 1 ||
    settings.product_image_no_padding === "1" ||
    settings.disable_image_padding === true ||
    settings.disable_image_padding === 1 ||
    settings.disable_image_padding === "1";

  // Prefer ACF select (contain / cover / fill / etc),
  // fall back to the old tick logic if empty.
  const productImageObjectFit = normalizeObjectFit(
    settings.product_image_fit ??
      settings.product_image_object_fit ??
      settings.image_fit_mode ??
      settings.product_image_mode,
    productImageNoPadding ? "cover" : "contain"
  );

  return (
    <html lang="en">
      <body className="body-root">
        {/* Theme-driven CSS variables for product cards and images */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
:root {
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
}
            `.trim(),
          }}
        />

        <ThemeProvider>
          <ToastProvider>
            <CartProvider>
              <WishlistProvider>
                {/* Header controlled by Theme Settings */}
                <HeaderShell />

                {/* Category bar under the header */}
                {categoryTree.length > 0 && (
                  <CategoryBar
                    categoryTree={categoryTree}
                    countsBySlug={countsBySlugObj}
                  />
                )}

                {/* Main content */}
                <main className="site-main">{children}</main>

                {/* Footer */}
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
              </WishlistProvider>
            </CartProvider>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}