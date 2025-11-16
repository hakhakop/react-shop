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

  try {
    const parsed = JSON.parse(data.webpagesThemeSettingsRaw);
    if (parsed && typeof parsed === "object") {
      return parsed as Record<string, any>;
    }
  } catch (e) {
    console.error("Failed to parse webpagesThemeSettingsRaw:", e);
  }

  return {};
}
