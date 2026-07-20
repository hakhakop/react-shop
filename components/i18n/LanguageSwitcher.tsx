"use client";

import { useTranslation } from "@/components/i18n/LanguageProvider";
import { isLocale, localeLabels } from "@/lib/i18n";

export default function LanguageSwitcher() {
  const { locale, setLocale, t } = useTranslation();
  return (
    <label className="saas-language-switcher">
      <span className="sr-only">{t("language.label")}</span>
      <select
        aria-label={t("language.label")}
        onChange={(event) => {
          const nextLocale = event.target.value;
          if (isLocale(nextLocale)) setLocale(nextLocale);
        }}
        value={locale}
      >
        <option value="en">{localeLabels.en}</option>
        <option value="hy">{localeLabels.hy}</option>
        <option value="ru">{localeLabels.ru}</option>
      </select>
    </label>
  );
}
