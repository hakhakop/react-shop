import { notFound } from "next/navigation";
import { mapYoothemeStaticContent } from "@/lib/yoothemePageImport";
import source from "@/tests/fixtures/yootheme-compatibility/sources/back-to-top.json";
import BackToTopProof from "./proof";
import { defaultBuilderShellSettings } from "@/lib/builderShell";

/** Development-only acceptance screen, using the chrome-free dashboard shell. */
export default function BackToTopProofPage() {
  if (process.env.NODE_ENV !== "development") notFound();
  const mapped = mapYoothemeStaticContent(source);
  return <BackToTopProof initial={mapped.sections[0].rows![0].columns[0].elements[0]} shellSettings={defaultBuilderShellSettings} />;
}
