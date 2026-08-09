import type { CSSProperties } from "react";
import {
  hasBuilderVisualSpacing,
  type BuilderVisualStyle,
  visualStyleToCss,
} from "@/lib/builderVisualStyle";
import { resolveBuilderSpacing } from "@/lib/builderSpacing";

type GeneralElementShellBlock = {
  visualStyle?: BuilderVisualStyle;
  elementPadding?: string;
  gridMargin?: string;
};

/**
 * The canonical General/Advanced style owned by an element's outer shell.
 * Both the Builder and storefront apply this before rendering the element
 * itself, so General positioning always has the same containing-block path.
 */
export function getGeneralElementShellStyle(
  block: GeneralElementShellBlock,
): CSSProperties {
  const visual = block.visualStyle as BuilderVisualStyle | undefined;
  const style: CSSProperties = {};

  if (!hasBuilderVisualSpacing(visual?.padding)) {
    if (block.elementPadding && block.elementPadding !== "inherit") {
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
    (!block.gridMargin || block.gridMargin === "inherit")
  ) {
    style.margin = 0;
  }

  return { ...style, ...visualStyleToCss(visual) };
}
