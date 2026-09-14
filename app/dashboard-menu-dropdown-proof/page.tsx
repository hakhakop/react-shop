import { notFound } from "next/navigation";
import { defaultBuilderShellSettings } from "@/lib/builderShell";
import { LanguageProvider } from "@/components/i18n/LanguageProvider";
import messages from "@/data/i18n/en.json";
import Proof from "./proof";
export default function Page() {
  if (process.env.NODE_ENV !== "development") notFound();
  return <LanguageProvider initialLocale="en" initialMessages={messages}><Proof shellSettings={defaultBuilderShellSettings} /></LanguageProvider>;
}
