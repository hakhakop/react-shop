"use client";

import { useRouter } from "next/navigation";
import { type CSSProperties } from "react";

const languageLabels: Record<string, string> = {
  hy: "Հայերեն",
  en: "English",
  ru: "Русский",
};

type WebsiteLanguageSwitcherProps = {
  activeLanguage: string;
  enabledLanguages: string[];
  preferenceKey: string;
  previewOnly?: boolean;
  display?: "native" | "code";
  /** Direct state callback – when provided, the switcher calls this
   *  instead of triggering router.refresh / reload.
   *  Used inside the Visual Builder to wire into the same
   *  setContentLanguage that the sidebar selector uses. */
  onLanguageChange?: (language: string) => void;
  triggerStyle?: CSSProperties;
};

export default function WebsiteLanguageSwitcher({
  activeLanguage,
  enabledLanguages,
  preferenceKey,
  previewOnly = false,
  display = "native",
  onLanguageChange,
  triggerStyle,
}: WebsiteLanguageSwitcherProps) {
  const router = useRouter();

  const isBuilder = Boolean(onLanguageChange);
  const languagesToRender =
    enabledLanguages.length <= 1 && (previewOnly || isBuilder)
      ? [...new Set([...enabledLanguages, "hy", "en", "ru"])]
      : enabledLanguages;

  if (languagesToRender.length <= 1 && !isBuilder) return null;

  return (
    <label
      className="website-language-switcher"
      aria-label="Website language"
      style={triggerStyle}
    >
      <span aria-hidden="true">文</span>
      <select
        aria-label="Website language"
        value={activeLanguage}
        disabled={previewOnly && !onLanguageChange}
        onChange={(event) => {
          const language = event.target.value;
          if (!previewOnly) {
            document.cookie = `${preferenceKey}=${encodeURIComponent(language)}; path=/; max-age=31536000; samesite=lax`;
          }

          if (onLanguageChange) {
            // Builder path – update shared React state directly
            onLanguageChange(language);
          } else {
            // Live frontend path – refresh server components
            router.refresh();
          }
        }}
      >
        {languagesToRender.map((language) => (
          <option key={language} value={language}>
            {display === "code" ? language.toUpperCase() : (languageLabels[language] ?? language.toUpperCase())}
          </option>
        ))}
      </select>
    </label>
  );
}
