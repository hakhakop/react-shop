import type { BuilderShellSettings } from "@/lib/builderShell";
import { getWebFontStylesheetHref } from "@/lib/webFonts";

/** Shared builder/frontend web-font loader driven only by Global Styles. */
export default function WebPagesFontLoader({ settings }: { settings?: Partial<BuilderShellSettings> }) {
  const href = getWebFontStylesheetHref(settings);
  return href ? <link rel="stylesheet" href={href} /> : null;
}
