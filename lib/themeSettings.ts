// wc-store/lib/themeSettings.ts

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

/**
 * Fetch theme settings from WordPress.
 * webpagesThemeSettingsRaw is a JSON-encoded string of all ACF option fields.
 */
export async function getThemeSettings(): Promise<Record<string, any>> {
  const data = await graphqlFetch<ThemeSettingsResponse>(THEME_SETTINGS_QUERY);

  if (!data.webpagesThemeSettingsRaw) {
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

  const preset = parsed.theme_preset || "minimal";

  const presetMap: Record<string, Record<string, string>> = {
    minimal: {
      "--radius-sm": "4px",
      "--radius-md": "6px",
      "--radius-lg": "10px",
      "--shadow-sm": "0 1px 2px rgba(0,0,0,0.04)",
      "--shadow-md": "0 4px 10px rgba(0,0,0,0.06)",
      "--shadow-lg": "0 12px 28px rgba(0,0,0,0.12)",
    },
    soft: {
      "--radius-sm": "6px",
      "--radius-md": "10px",
      "--radius-lg": "16px",
      "--shadow-sm": "0 2px 4px rgba(0,0,0,0.05)",
      "--shadow-md": "0 6px 14px rgba(0,0,0,0.09)",
      "--shadow-lg": "0 18px 34px rgba(0,0,0,0.16)",
    },
    elevated: {
      "--radius-sm": "8px",
      "--radius-md": "14px",
      "--radius-lg": "22px",
      "--shadow-sm": "0 3px 6px rgba(0,0,0,0.06)",
      "--shadow-md": "0 10px 20px rgba(0,0,0,0.12)",
      "--shadow-lg": "0 24px 48px rgba(0,0,0,0.22)",
    },
  };

  const chosenTokens = presetMap[preset] || presetMap["minimal"];

  enriched.designTokens = {
    preset,
    ...chosenTokens,
  };
console.log("THEME SETTINGS >>>", enriched);
  return enriched;
}
