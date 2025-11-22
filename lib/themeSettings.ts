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

  return enriched;
}
