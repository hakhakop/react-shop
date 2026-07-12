"use client";

import { useTranslation } from "@/components/i18n/LanguageProvider";

export default function LanguageSwitcher() {
  const { locale, setLocale, t } = useTranslation();
  return (
    <label className="saas-language-switcher">
      <span className="sr-only">{t("language.label")}</span>
      <select
        aria-label={t("language.label")}
        onChange={(event) => setLocale(event.target.value === "hy" ? "hy" : "en")}
        value={locale}
      >
        <option value="en">English</option>
        <option value="hy">Հայերեն</option>
      </select>
    </label>
  );
}
