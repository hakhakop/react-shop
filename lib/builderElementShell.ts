import type { CSSProperties } from "react";
import {
  hasBuilderVisualSpacing,
  type BuilderVisualStyle,
  visualStyleToCss,
} from "@/lib/builderVisualStyle";
import { resolveBuilderSpacing } from "@/lib/builderSpacing";
import { getUikitMarginClass } from "@/lib/uikitTokens";

type GeneralElementShellBlock = {
  visualStyle?: BuilderVisualStyle;
  elementPadding?: string;
  elementMargin?: string;
  gridMargin?: string;
  spacingContract?: "yootheme";
  id?: string;
};

function usesYoothemeSpacingContract(block: GeneralElementShellBlock) {
  // `yootheme-*` is the established persisted import identity. Keep it as a
  // read-compatible fallback for documents imported before the explicit
  // provenance marker was added.
  return block.spacingContract === "yootheme" || block.id?.startsWith("yootheme-");
}

/**
 * The YOOtheme margin vocabulary is not the WebPages spacing scale: notably
 * `medium` is UIkit's 40px margin, not WebPages' generic `md` token. Keeping
 * this mapping on the shared General shell preserves the imported semantic
 * and prevents component renderers from applying the same margin a second
 * time.
 */
function getYoothemeMarginClass(value?: string) {
  const margin = value?.trim().toLowerCase();
  if (!margin) return "";
  if (margin === "remove-vertical" || margin === "none") return "uk-margin-remove";
  if (margin === "default") return "uk-margin";
  if (["small", "medium", "large", "xlarge"].includes(margin)) {
    return `uk-margin-${margin}`;
  }
  return getUikitMarginClass(margin);
}

export function getGeneralElementShellClassName(block: GeneralElementShellBlock) {
  if (!usesYoothemeSpacingContract(block)) return "";
  const layout = block.visualStyle?.layout;
  return [
    "yootheme-imported-spacing",
    getYoothemeMarginClass(layout?.marginMode),
    layout?.removeTopMargin ? "uk-margin-remove-top" : "",
    layout?.removeBottomMargin ? "uk-margin-remove-bottom" : "",
  ].filter(Boolean).join(" ");
}

function shellVisualStyle(block: GeneralElementShellBlock) {
  const visual = block.visualStyle;
  if (!visual || !usesYoothemeSpacingContract(block) || !visual.layout) return visual;

  // Margin is emitted by getGeneralElementShellClassName() so UIkit's own
  // sibling-aware margin rules remain authoritative. Do not also emit an
  // inline margin on the same shell.
  const { marginMode, removeTopMargin, removeBottomMargin, ...layout } = visual.layout;
  return { ...visual, layout };
}

/**
 * The canonical General/Advanced style owned by an element's outer shell.
 * Both the Builder and storefront apply this before rendering the element
 * itself, so General positioning always has the same containing-block path.
 */
export function getGeneralElementShellStyle(
  block: GeneralElementShellBlock,
): CSSProperties {
  const visual = shellVisualStyle(block) as BuilderVisualStyle | undefined;
  const style: CSSProperties = {};
  const localPadding = block.elementPadding?.trim().toLowerCase();
  const localMargin = (block.elementMargin ?? block.gridMargin)?.trim().toLowerCase();

  if (!hasBuilderVisualSpacing(visual?.padding)) {
    if (usesYoothemeSpacingContract(block)) {
      // UIkit/YOOtheme has no inherited universal element wrapper padding.
      // Source spacing is represented by the semantic margin class attached
      // to this same shell below.
      style.padding = "0px";
    } else if (localPadding === "none" || localPadding === "0" || localPadding === "0px") {
      // A local None is a semantic value, not an absent value. It must win
      // over the Global Element Padding token.
      style.padding = "0px";
    } else if (block.elementPadding && localPadding !== "inherit") {
      style.padding = resolveBuilderSpacing(
        block.elementPadding,
        "elementPadding",
      ).css;
    } else {
      style.paddingTop = "var(--builder-global-element-padding-top, 0px)";
      style.paddingRight = "var(--builder-global-element-padding-right, 0px)";
      style.paddingBottom = "var(--builder-global-element-padding-bottom, 0px)";
      style.paddingLeft = "var(--builder-global-element-padding-left, 0px)";
    }
  }

  if (
    !hasBuilderVisualSpacing(visual?.margin) &&
    (localMargin === "none" || localMargin === "0" || localMargin === "0px")
  ) {
    style.margin = 0;
  } else if (
    !hasBuilderVisualSpacing(visual?.margin) &&
    (!localMargin || localMargin === "inherit")
  ) {
    style.margin = 0;
  }

  return { ...style, ...visualStyleToCss(visual) };
}
