import type {
  BuilderHeaderBackgroundMode,
  BuilderHeaderTextMode,
} from "@/lib/builderShell";

export type EffectiveHeaderBackgroundContext = "header" | "page" | "section";
export type EffectiveHeaderTextMode = "light" | "dark";

type ResolveHeaderBackgroundContextInput = {
  backgroundMode: BuilderHeaderBackgroundMode;
  firstSectionOverlapEnabled: boolean;
  firstSectionTouchesPageTop: boolean;
};

type ResolveHeaderTextModeInput = ResolveHeaderBackgroundContextInput & {
  configuredTextMode: BuilderHeaderTextMode;
  headerTextMode: EffectiveHeaderTextMode;
  pageTextMode: EffectiveHeaderTextMode;
  sectionTextMode: EffectiveHeaderTextMode;
};

export function resolveHeaderBackgroundContext({
  backgroundMode,
  firstSectionOverlapEnabled,
  firstSectionTouchesPageTop,
}: ResolveHeaderBackgroundContextInput): EffectiveHeaderBackgroundContext {
  if (backgroundMode !== "none") return "header";
  if (!firstSectionOverlapEnabled) return "page";
  if (!firstSectionTouchesPageTop) return "page";
  return "section";
}

export function resolveEffectiveHeaderTextMode({
  configuredTextMode,
  headerTextMode,
  pageTextMode,
  sectionTextMode,
  ...contextInput
}: ResolveHeaderTextModeInput): {
  context: EffectiveHeaderBackgroundContext;
  textMode: EffectiveHeaderTextMode;
} {
  const context = resolveHeaderBackgroundContext(contextInput);

  if (configuredTextMode !== "auto") {
    return { context, textMode: configuredTextMode };
  }

  return {
    context,
    textMode:
      context === "section"
        ? sectionTextMode
        : context === "page"
          ? pageTextMode
          : headerTextMode,
  };
}
