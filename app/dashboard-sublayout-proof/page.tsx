import { notFound } from "next/navigation";
import { mapYoothemeStaticContent } from "@/lib/yoothemePageImport";
import { defaultBuilderShellSettings } from "@/lib/builderShell";
import source from "@/tests/fixtures/yootheme-compatibility/sources/sublayout.json";
import SublayoutProof from "./proof";
import { LanguageProvider } from "@/components/i18n/LanguageProvider";
import messages from "@/data/i18n/en.json";
export default function Page() {
  if (process.env.NODE_ENV !== "development") notFound();
  return <LanguageProvider initialLocale="en" initialMessages={messages}><SublayoutProof initial={mapYoothemeStaticContent(source).sections[0].rows![0].columns[0].elements[0]} shellSettings={defaultBuilderShellSettings} /></LanguageProvider>;
}
