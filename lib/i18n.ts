import en from "@/locales/en.json";

export const supportedLocales = ["en", "hy"] as const;
export type Locale = (typeof supportedLocales)[number];
export type TranslationKey = keyof typeof en;
export type Messages = Record<string, string>;

export const localeCookieName = "saas_locale";

export function normalizeLocale(value: unknown): Locale {
  if (typeof value !== "string") return "en";
  const requested = value
    .toLowerCase()
    .split(",")
    .map((entry) => entry.trim().split(";")[0]?.split("-")[0]);
  return requested.find((locale) => locale === "en" || locale === "hy") === "hy"
    ? "hy"
    : "en";
}

export function translate(
  messages: Messages,
  key: TranslationKey,
  values?: Record<string, string | number>,
) {
  const template = messages[key] ?? en[key];
  return Object.entries(values ?? {}).reduce(
    (text, [name, value]) => text.replaceAll(`{${name}}`, String(value)),
    template,
  );
}

export async function loadMessages(locale: Locale): Promise<Messages> {
  if (locale === "hy") return (await import("@/locales/hy.json")).default;
  return en;
}
