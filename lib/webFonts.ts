import type { BuilderShellSettings } from "@/lib/builderShell";

const SYSTEM_FONT_VALUES = new Set(["", "inherit", "system-ui", "default system font", "consolas/monaco", "georgia", "helvetica/arial", "lucida", "times new roman", "trebuchet", "verdana"]);
const PICKER_WEB_FONTS = ["42dot Sans", "ABeeZee", "Outfit", "Roboto", "Open Sans", "Montserrat", "Poppins", "Lato", "Manrope", "Inter", "Playfair Display"];

/** One canonical font registration path for Global Typography and YOOtheme imports. */
export function getWebFontStylesheetHref(settings?: Partial<BuilderShellSettings>): string | undefined {
  const families = [settings?.fontFamilyBody, settings?.fontFamilyHeading, settings?.fontFamilyPrimary, settings?.fontFamilySecondary, settings?.fontFamilyTertiary, settings?.buttonFontFamily]
    .filter((value): value is string => typeof value === "string" && value.trim().length > 0)
    .map((value) => value.trim())
    .filter((value) => !SYSTEM_FONT_VALUES.has(value.toLowerCase()) && !value.includes(",") && !/[()]/.test(value));
  // The same registered set is always available to element overrides. This is
  // still one Global Typography loader, not a Heading-specific loader.
  const unique = [...new Set([...PICKER_WEB_FONTS, ...families])];
  if (!unique.length) return undefined;
  return `https://fonts.googleapis.com/css2?${unique.map((family) => `family=${encodeURIComponent(family).replace(/%20/g, "+")}:wght@400;500;600;700;800`).join("&")}&display=swap`;
}

export function fontFamilyStack(family: string | undefined, fallback: string): string {
  if (!family || SYSTEM_FONT_VALUES.has(family.trim().toLowerCase())) return fallback;
  return family.includes(",") ? family : `"${family}", ${fallback}`;
}
