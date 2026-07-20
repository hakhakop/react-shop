import { cookies, headers } from "next/headers";
import { LanguageProvider } from "@/components/i18n/LanguageProvider";
import {
  localeCookieName,
  normalizeLocale,
  type Locale,
} from "@/lib/i18n";
import { loadMessages } from "@/lib/i18n.server";

export default async function SaaSI18nProvider({
  children,
  userLocale,
  persistForUser = false,
}: {
  children: React.ReactNode;
  userLocale?: Locale;
  persistForUser?: boolean;
}) {
  const [cookieStore, headerStore] = await Promise.all([cookies(), headers()]);
  const locale = userLocale ?? normalizeLocale(
    cookieStore.get(localeCookieName)?.value ?? headerStore.get("accept-language"),
  );
  const messages = await loadMessages(locale);

  return (
    <LanguageProvider
      initialLocale={locale}
      initialMessages={messages}
      persistForUser={persistForUser}
    >
      {children}
    </LanguageProvider>
  );
}
