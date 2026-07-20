import type { BuilderShellSettings } from "@/lib/builderShell";
import {
  getPublishedBuilderLayout,
  type BuilderDataScope,
} from "@/lib/builderLayouts";
import { resolveHeaderBuilderComposition } from "@/lib/headerBuilderComposition";
import {
  resolveHeaderDocumentSettings,
  type ResolvedHeaderDocumentSettings,
} from "@/lib/headerDocumentSettings";

/** Loads the same published Header document used by HeaderShell. */
export async function getPublishedHeaderDocumentSettings(
  shellSettings: BuilderShellSettings,
  scope: BuilderDataScope = {},
): Promise<ResolvedHeaderDocumentSettings> {
  const layout = await getPublishedBuilderLayout("header", scope).catch(
    () => null,
  );
  return resolveHeaderDocumentSettings(
    resolveHeaderBuilderComposition(layout),
    shellSettings,
  );
}
