"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Locale, Messages, TranslationKey } from "@/lib/i18n";
import { translate } from "@/lib/i18n";

type LanguageContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey, values?: Record<string, string | number>) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({
  children,
  initialLocale,
  initialMessages,
  persistForUser = false,
}: {
  children: React.ReactNode;
  initialLocale: Locale;
  initialMessages: Messages;
  persistForUser?: boolean;
}) {
  const router = useRouter();
  const [locale, setCurrentLocale] = useState(initialLocale);
  const [messages, setMessages] = useState(initialMessages);

  const setLocale = useCallback(async (nextLocale: Locale) => {
    if (nextLocale === locale) return;
    const response = await fetch(`/api/i18n/${nextLocale}`, { cache: "no-store" });
    if (!response.ok) return;
    const data = (await response.json()) as { messages?: Messages };
    const nextMessages = data.messages;
    if (!nextMessages) return;
    setCurrentLocale(nextLocale);
    setMessages(nextMessages);
    document.documentElement.lang = nextLocale;
    document.cookie = `saas_locale=${nextLocale}; path=/; max-age=31536000; samesite=lax`;
    if (persistForUser) {
      await fetch("/api/account/language", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale: nextLocale }),
      });
    }
    router.refresh();
  }, [locale, persistForUser, router]);

  const value = useMemo(() => ({
    locale,
    setLocale,
    t: (key: TranslationKey, values?: Record<string, string | number>) =>
      translate(messages, key, values),
  }), [locale, messages, setLocale]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useTranslation must be used inside LanguageProvider");
  return context;
}

export function useOptionalTranslation() {
  return useContext(LanguageContext);
}

export function T({ k, values }: { k: TranslationKey; values?: Record<string, string | number> }) {
  return useTranslation().t(k, values);
}
