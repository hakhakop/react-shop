import { resolveUikitIconName, type UikitIconName } from "@/lib/uikitIconRegistry";

const HOST_ICON_RULES: Array<[RegExp, UikitIconName]> = [
  [/(^|\.)facebook\.com$/i, "facebook"],
  [/(^|\.)instagram\.com$/i, "instagram"],
  [/(^|\.)github\.com$/i, "github"],
  [/(^|\.)x\.com$|(^|\.)twitter\.com$/i, "twitter"],
  [/(^|\.)google\.[a-z.]+$/i, "google"],
  [/(^|\.)discord\.(com|gg)$/i, "discord"],
  [/(^|\.)youtube\.com$|(^|\.)youtu\.be$/i, "youtube"],
  [/(^|\.)linkedin\.com$/i, "linkedin"],
  [/(^|\.)pinterest\.[a-z.]+$/i, "pinterest"],
  [/(^|\.)tiktok\.com$/i, "tiktok"],
  [/(^|\.)whatsapp\.com$|(^|\.)wa\.me$/i, "whatsapp"],
];

export function inferSocialIcon(link: string, override?: string): UikitIconName {
  const explicit = resolveUikitIconName(override);
  if (explicit) return explicit;
  const value = link.trim();
  if (/^mailto:/i.test(value)) return "mail";
  if (/^tel:/i.test(value)) return "phone";
  try {
    const host = new URL(value, "https://example.invalid").hostname;
    return HOST_ICON_RULES.find(([pattern]) => pattern.test(host))?.[1] ?? "world";
  } catch {
    return "world";
  }
}

export function socialLinkLabel(link: string, authored?: string) {
  if (authored?.trim()) return authored.trim();
  const icon = inferSocialIcon(link);
  if (icon === "mail") return "Email";
  if (icon === "phone") return "Phone";
  if (icon === "world") return "Website";
  return icon === "twitter" ? "X" : `${icon[0].toUpperCase()}${icon.slice(1)}`;
}
