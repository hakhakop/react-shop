import type { BuilderShellSettings } from "@/lib/builderShell";
import type { HeaderBuilderComposition } from "@/lib/headerBuilderDocument";

export type ResolvedHeaderDocumentSettings = {
  visible: boolean;
  transparent: boolean;
  overlay: boolean;
  height: string | undefined;
  customHeight: number | undefined;
  layout: BuilderShellSettings["headerLayout"];
  behavior: BuilderShellSettings["headerBehavior"];
  widthMode: BuilderShellSettings["headerWidthMode"];
  backgroundMode: BuilderShellSettings["headerBackgroundMode"];
  textMode: BuilderShellSettings["headerTextMode"];
  zIndex: number;
  topToolbarVisible: boolean;
  topToolbarText: string;
  topToolbarPhone: string;
  topToolbarMeta: string;
};

type HeaderSettingsFallback = Partial<Pick<
  BuilderShellSettings,
  | "headerVisible"
  | "headerTransparent"
  | "headerOverlay"
  | "headerHeight"
  | "headerCustomHeight"
  | "headerLayout"
  | "headerBehavior"
  | "headerWidthMode"
  | "headerBackgroundMode"
  | "headerTextMode"
  | "headerZIndex"
  | "topToolbarVisible"
  | "topToolbarText"
  | "topToolbarPhone"
  | "topToolbarMeta"
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
    | "documentLayout"
    | "documentBehavior"
    | "documentWidthMode"
    | "documentBackgroundMode"
    | "documentTextMode"
    | "documentZIndex"
    | "documentTopToolbarVisible"
    | "documentTopToolbarText"
    | "documentTopToolbarPhone"
    | "documentTopToolbarMeta"
  >,
  fallback: HeaderSettingsFallback,
): ResolvedHeaderDocumentSettings {
  return {
    visible: composition.documentVisible ?? (fallback.headerVisible ?? true),
    transparent: composition.documentTransparent ?? (fallback.headerTransparent ?? false),
    overlay: composition.documentOverlay ?? (fallback.headerOverlay ?? false),
    height: composition.documentHeight ?? fallback.headerHeight,
    customHeight:
      composition.documentCustomHeight ?? fallback.headerCustomHeight,
    layout: composition.documentLayout ?? fallback.headerLayout ?? "wordpress",
    behavior: composition.documentBehavior ?? fallback.headerBehavior ?? "sticky",
    widthMode: composition.documentWidthMode ?? fallback.headerWidthMode ?? "boxed",
    backgroundMode: composition.documentBackgroundMode ?? fallback.headerBackgroundMode ?? "default",
    textMode: composition.documentTextMode ?? fallback.headerTextMode ?? "auto",
    zIndex: composition.documentZIndex ?? fallback.headerZIndex ?? 40,
    topToolbarVisible: composition.documentTopToolbarVisible ?? fallback.topToolbarVisible ?? true,
    topToolbarText: composition.documentTopToolbarText ?? fallback.topToolbarText ?? "",
    topToolbarPhone: composition.documentTopToolbarPhone ?? fallback.topToolbarPhone ?? "",
    topToolbarMeta: composition.documentTopToolbarMeta ?? fallback.topToolbarMeta ?? "",
  };
}
