import en from "@/data/i18n/en.json";

export const supportedLocales = ["en", "hy", "ru"] as const;
export type Locale = (typeof supportedLocales)[number];
export type TranslationKey = keyof typeof en;
export type Messages = Record<string, string>;

export const localeCookieName = "saas_locale";
const localeSet = new Set<string>(supportedLocales);

export const localeLabels: Record<Locale, string> = {
  en: "English",
  hy: "Հայերեն",
  ru: "Русский",
};

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && localeSet.has(value);
}

export function normalizeLocale(value: unknown): Locale {
  if (typeof value !== "string") return "en";
  const requested = value
    .toLowerCase()
    .split(",")
    .map((entry) => entry.trim().split(";")[0]?.split("-")[0]);
  return requested.find(isLocale) ?? "en";
}

export function translate(
  messages: Messages,
  key: TranslationKey,
  values?: Record<string, string | number>,
) {
  const template = messages[key] ?? en[key] ?? "";
  return Object.entries(values ?? {}).reduce(
    (text, [name, value]) => text.replaceAll(`{${name}}`, String(value)),
    template,
  );
}

function isPlainStringRecord(value: unknown): value is Messages {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    Object.values(value).every((entry) => typeof entry === "string")
  );
}

export function validateMessages(value: unknown) {
  if (!isPlainStringRecord(value)) {
    return { ok: false as const, error: "Translation data must be a JSON object with string values." };
  }

  const invalidKey = Object.keys(value).find(
    (key) => !/^[a-z][A-Za-z0-9]*(?:\.[a-z][A-Za-z0-9]*)+$/.test(key),
  );
  if (invalidKey) {
    return { ok: false as const, error: `Invalid translation key: ${invalidKey}` };
  }

  return { ok: true as const, messages: value };
}
