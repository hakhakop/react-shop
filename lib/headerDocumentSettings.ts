import type { BuilderShellSettings } from "@/lib/builderShell";
import type { HeaderBuilderComposition } from "@/lib/headerBuilderDocument";

export type ResolvedHeaderDocumentSettings = {
  visible: boolean;
  transparent: boolean;
  overlay: boolean;
  height: string | undefined;
  customHeight: number | undefined;
};

type HeaderSettingsFallback = Partial<Pick<
  BuilderShellSettings,
  | "headerVisible"
  | "headerTransparent"
  | "headerOverlay"
  | "headerHeight"
  | "headerCustomHeight"
>>;

/**
 * Resolves persisted Header-document settings without ever writing derived
 * values back to the document. Shell settings are compatibility fallbacks for
 * Header documents created before these fields became document-owned.
 */
export function resolveHeaderDocumentSettings(
  composition: Pick<
    HeaderBuilderComposition,
    | "documentVisible"
    | "documentTransparent"
    | "documentOverlay"
    | "documentHeight"
    | "documentCustomHeight"
  >,
  fallback: HeaderSettingsFallback,
): ResolvedHeaderDocumentSettings {
  return {
    visible: composition.documentVisible ?? fallback.headerVisible ?? true,
    transparent:
      composition.documentTransparent ?? fallback.headerTransparent ?? false,
    overlay: composition.documentOverlay ?? fallback.headerOverlay ?? false,
    height: composition.documentHeight ?? fallback.headerHeight,
    customHeight:
      composition.documentCustomHeight ?? fallback.headerCustomHeight,
  };
}
