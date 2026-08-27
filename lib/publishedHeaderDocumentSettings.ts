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

import { migrateLegacyHeaderDocument } from "@/lib/headerBuilderDocument";
import type { BuilderThemeSettings } from "@/lib/builderThemeSettings";

/** Loads the same published Header document used by HeaderShell. */
export async function getPublishedHeaderDocumentSettings(
  shellSettings: BuilderShellSettings,
  scope: BuilderDataScope = {},
  themeSettings?: BuilderThemeSettings | null,
): Promise<ResolvedHeaderDocumentSettings> {
  const layout = await getPublishedBuilderLayout("header", scope).catch(
    () => null,
  );
  // Theme Settings is an import/provenance input only. Once materialized, the
  // canonical Header document is the sole structural and behavioural owner.
  void themeSettings;
  const syncedLayout = layout
    ? migrateLegacyHeaderDocument(layout, shellSettings)
    : null;
  return resolveHeaderDocumentSettings(
    resolveHeaderBuilderComposition(syncedLayout),
    shellSettings,
  );
}
