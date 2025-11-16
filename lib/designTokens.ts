// wc-store/lib/designTokens.ts
export type ThemeSettingsRaw = {
  primary_color?: string | null;
  accent_color?: string | null;
  layout?: string | null;
  card_radius?: string | number | null;
  header_background?: string | null;
  page_background?: string | null;
};

export type DesignTokens = {
  layout: string;
  vars: { [key: string]: string };
};

export function buildDesignTokens(
  raw: ThemeSettingsRaw | null | undefined
): DesignTokens {
  const primary = raw?.primary_color || "#ec4899";
  const accent = raw?.accent_color || "#db2777";
  const layout = raw?.layout || "centered";
  const cardRadius = raw?.card_radius ?? 12;
  const headerBg = raw?.header_background || "#ffffff";
  const pageBg = raw?.page_background || "#f3f4f6";

  return {
    layout,
    vars: {
      "--color-primary": primary,
      "--color-accent": accent,
      "--radius-card": `${cardRadius}px`,
      "--header-bg": headerBg,
      "--page-bg": pageBg,
    },
  };
}