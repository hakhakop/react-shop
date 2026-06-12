// wc-store/lib/themeSettings.ts sss

import { graphqlFetch } from "./graphql";

const THEME_SETTINGS_QUERY = `
  query WebpagesThemeSettings {
    webpagesThemeSettingsRaw
  }
`;

type ThemeSettingsResponse = {
  webpagesThemeSettingsRaw: string | null;
};

export type HeaderIconId = "wishlist" | "cart" | "account" | "theme" | "search";

export type HeaderSettings = {
  menuLocation: string;
  logoMaxWidth: number;
  iconVariant: "muted" | "solid" | "ghost" | "icon";
  iconOrder: HeaderIconId[];
};

export function extractHeaderSettings(settings: Record<string, any>): HeaderSettings {
  // menu location
  const rawMenu = settings.header_menu_location;
  const menuLocation =
    typeof rawMenu === "string" && rawMenu.trim().length > 0
      ? rawMenu
      : "primary";

  // logo max width
  const rawLogoWidth = settings.header_logo_max_width;
  const logoMaxWidthNumber = Number(rawLogoWidth);
  const logoMaxWidth = Number.isFinite(logoMaxWidthNumber)
    ? logoMaxWidthNumber
    : 160;

  // icon variant
  const allowedVariants = ["muted", "solid", "ghost", "icon"] as const;

  // 1) Try to read from a top-level field (if you ever add it directly)
  let rawVariant: unknown = settings.header_icon_variant;

  // 2) If not present, try the first row of header_icon_order repeater
  if (!rawVariant && Array.isArray(settings.header_icon_order)) {
    const firstRow = settings.header_icon_order[0];
    if (
      firstRow &&
      typeof firstRow.header_icon_variant === "string" &&
      firstRow.header_icon_variant.trim().length > 0
    ) {
      rawVariant = firstRow.header_icon_variant;
    }
  }

  const iconVariant = allowedVariants.includes(rawVariant as any)
    ? (rawVariant as HeaderSettings["iconVariant"])
    : "muted";

  // icon order: can be a flat array of strings OR an array of objects with { icon }
  const rawOrder = settings.header_icon_order;
  let iconOrder: HeaderIconId[] = [];

  if (Array.isArray(rawOrder)) {
    iconOrder = rawOrder
      .map((item: any) => {
        if (typeof item === "string") return item;
        if (item && typeof item.icon === "string") return item.icon;
        return null;
      })
      .filter((val: any): val is HeaderIconId => {
        return (
          val === "wishlist" ||
          val === "cart" ||
          val === "account" ||
          val === "theme" ||
          val === "search"
        );
      });
  }

  if (iconOrder.length === 0) {
    iconOrder = ["wishlist", "cart", "account", "theme"];
  }

  return {
    menuLocation,
    logoMaxWidth,
    iconVariant,
    iconOrder,
  };
}

export const presetMap: Record<string, Record<string, string>> = {
  minimal: {
    "--page-bg": "linear-gradient(180deg, #f8fafc 0%, #eef2f7 100%)",
    "--surface-main": "#ffffff",
    "--surface-muted": "#f3f6fa",
    "--surface-soft": "#f8fafc",
    "--text-main": "#111827",
    "--text-muted": "#667085",
    "--border-soft": "rgba(148, 163, 184, 0.32)",
    "--accent": "#db2777",
    "--accent-strong": "#be185d",
    "--accent-soft": "rgba(219, 39, 119, 0.08)",
    "--accent-contrast": "#ffffff",
    "--header-bg": "rgba(255, 255, 255, 0.92)",
    "--header-border": "rgba(209, 213, 219, 0.72)",
    "--button-radius": "999px",
    "--radius-sm": "4px",
    "--radius-md": "6px",
    "--radius-lg": "10px",
    "--shadow-sm": "0 1px 2px rgba(0,0,0,0.04)",
    "--shadow-md": "0 4px 10px rgba(0,0,0,0.06)",
    "--shadow-lg": "0 12px 28px rgba(0,0,0,0.12)",
    "--product-card-bg": "#ffffff",
    "--product-card-border": "rgba(148, 163, 184, 0.22)",
    "--product-card-padding": "12px",
    "--product-image-bg": "#f8fafc",
    "--price-bg": "rgba(219, 39, 119, 0.08)",
    "--price-border": "rgba(219, 39, 119, 0.22)",
    "--price-color": "#be185d",
  },
  soft: {
    "--page-bg": "linear-gradient(180deg, #f6faf8 0%, #e9f2ef 55%, #eef1f7 100%)",
    "--surface-main": "#ffffff",
    "--surface-muted": "#eaf4f1",
    "--surface-soft": "#f6faf8",
    "--text-main": "#17211f",
    "--text-muted": "#64746f",
    "--border-soft": "rgba(71, 103, 95, 0.22)",
    "--accent": "#0f766e",
    "--accent-strong": "#115e59",
    "--accent-soft": "rgba(15, 118, 110, 0.1)",
    "--accent-contrast": "#ffffff",
    "--header-bg": "rgba(255, 255, 255, 0.9)",
    "--header-border": "rgba(71, 103, 95, 0.2)",
    "--button-radius": "999px",
    "--radius-sm": "6px",
    "--radius-md": "10px",
    "--radius-lg": "16px",
    "--shadow-sm": "0 2px 4px rgba(0,0,0,0.05)",
    "--shadow-md": "0 6px 14px rgba(0,0,0,0.09)",
    "--shadow-lg": "0 18px 34px rgba(0,0,0,0.16)",
    "--product-card-bg": "#ffffff",
    "--product-card-border": "rgba(71, 103, 95, 0.18)",
    "--product-card-padding": "14px",
    "--product-image-bg": "#eaf4f1",
    "--price-bg": "rgba(15, 118, 110, 0.1)",
    "--price-border": "rgba(15, 118, 110, 0.22)",
    "--price-color": "#115e59",
  },
  elevated: {
    "--page-bg": "linear-gradient(180deg, #f6f7fb 0%, #e7ecf5 100%)",
    "--surface-main": "#ffffff",
    "--surface-muted": "#eef2f7",
    "--surface-soft": "#f7f9fc",
    "--text-main": "#101828",
    "--text-muted": "#5f6b7a",
    "--border-soft": "rgba(86, 108, 140, 0.24)",
    "--accent": "#2563eb",
    "--accent-strong": "#1d4ed8",
    "--accent-soft": "rgba(37, 99, 235, 0.1)",
    "--accent-contrast": "#ffffff",
    "--header-bg": "rgba(255, 255, 255, 0.88)",
    "--header-border": "rgba(86, 108, 140, 0.22)",
    "--button-radius": "12px",
    "--radius-sm": "8px",
    "--radius-md": "14px",
    "--radius-lg": "22px",
    "--shadow-sm": "0 3px 6px rgba(0,0,0,0.06)",
    "--shadow-md": "0 10px 20px rgba(0,0,0,0.12)",
    "--shadow-lg": "0 24px 48px rgba(0,0,0,0.22)",
    "--product-card-bg": "#ffffff",
    "--product-card-border": "rgba(86, 108, 140, 0.18)",
    "--product-card-padding": "14px",
    "--product-image-bg": "#eef2f7",
    "--price-bg": "rgba(37, 99, 235, 0.1)",
    "--price-border": "rgba(37, 99, 235, 0.22)",
    "--price-color": "#1d4ed8",
  },
  boutique: {
    "--page-bg": "linear-gradient(180deg, #fbfbfc 0%, #eef0f4 100%)",
    "--surface-main": "#ffffff",
    "--surface-muted": "#eef0f4",
    "--surface-soft": "#fbfbfc",
    "--text-main": "#18181b",
    "--text-muted": "#6b6f76",
    "--border-soft": "rgba(63, 63, 70, 0.2)",
    "--accent": "#7f1d1d",
    "--accent-strong": "#5f1515",
    "--accent-soft": "rgba(127, 29, 29, 0.08)",
    "--accent-contrast": "#ffffff",
    "--header-bg": "rgba(255, 255, 255, 0.9)",
    "--header-border": "rgba(63, 63, 70, 0.18)",
    "--button-radius": "4px",
    "--radius-sm": "2px",
    "--radius-md": "4px",
    "--radius-lg": "8px",
    "--shadow-sm": "0 1px 0 rgba(24, 24, 27, 0.08)",
    "--shadow-md": "0 14px 32px rgba(24, 24, 27, 0.1)",
    "--shadow-lg": "0 28px 70px rgba(24, 24, 27, 0.18)",
    "--product-card-bg": "#ffffff",
    "--product-card-border": "rgba(63, 63, 70, 0.16)",
    "--product-card-padding": "12px",
    "--product-image-bg": "#eef0f4",
    "--price-bg": "rgba(127, 29, 29, 0.08)",
    "--price-border": "rgba(127, 29, 29, 0.2)",
    "--price-color": "#7f1d1d",
  },
  princity: {
    "--page-bg": "#ffffff",
    "--surface-main": "#ffffff",
    "--surface-muted": "#f5f5f3",
    "--surface-soft": "#fafaf8",
    "--text-main": "#111111",
    "--text-muted": "#656565",
    "--border-soft": "rgba(17, 17, 17, 0.12)",
    "--accent": "#111111",
    "--accent-strong": "#000000",
    "--accent-soft": "rgba(17, 17, 17, 0.06)",
    "--accent-contrast": "#ffffff",
    "--header-bg": "rgba(255, 255, 255, 0.96)",
    "--header-border": "rgba(17, 17, 17, 0.12)",
    "--button-radius": "999px",
    "--radius-sm": "10px",
    "--radius-md": "18px",
    "--radius-lg": "28px",
    "--shadow-sm": "none",
    "--shadow-md": "none",
    "--shadow-lg": "none",
    "--product-card-bg": "#ffffff",
    "--product-card-border": "rgba(17, 17, 17, 0.1)",
    "--product-card-padding": "0",
    "--product-image-bg": "#f4f4f1",
    "--price-bg": "#111111",
    "--price-border": "#111111",
    "--price-color": "#ffffff",
  },
};

/**
 * Fetch theme settings from WordPress.
 * webpagesThemeSettingsRaw is a JSON-encoded string of all ACF option fields.
 */
export async function getThemeSettings(): Promise<Record<string, any>> {
  let data: ThemeSettingsResponse | null = null;

  try {
    data = await graphqlFetch<ThemeSettingsResponse>(THEME_SETTINGS_QUERY);
  } catch (e) {
    console.warn(
      "WordPress theme settings are not available. Falling back to React defaults.",
      e
    );
    return {};
  }

  if (!data?.webpagesThemeSettingsRaw) {
    return {};
  }

  let parsed: Record<string, any> = {};

  try {
    parsed = JSON.parse(data.webpagesThemeSettingsRaw) || {};
  } catch (e) {
    console.error("Failed to parse webpagesThemeSettingsRaw:", e);
    return {};
  }

  // --- Design Token Mapping Layer ---
  const enriched: Record<string, any> = { ...parsed };
  enriched.headerSettings = extractHeaderSettings(parsed);

  const rawLayout = String(parsed.layout ?? "").trim().toLowerCase();
  const layoutImpliesPrincity =
    rawLayout === "princity" ||
    rawLayout === "princity-clean" ||
    rawLayout === "princity_clean" ||
    rawLayout === "princity-flat" ||
    rawLayout === "princity_flat";

  const rawPreset =
    parsed.storefront_preset ??
    parsed.theme_preset ??
    (layoutImpliesPrincity ? "princity" : "minimal");
  const preset = String(rawPreset).trim().toLowerCase();

  const chosenTokens = presetMap[preset] || presetMap["minimal"];

  const primaryColor =
    typeof parsed.primary_color === "string" && parsed.primary_color.trim()
      ? parsed.primary_color.trim()
      : null;
  const accentColor =
    typeof parsed.accent_color === "string" && parsed.accent_color.trim()
      ? parsed.accent_color.trim()
      : null;

  enriched.designTokens = {
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
  };
  enriched.storefrontPreset = presetMap[preset] ? preset : "minimal";
  return enriched;
}
