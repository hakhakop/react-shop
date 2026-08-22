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
  textAlign?: string;
  headingAlign?: string;
  textAlignment?: string;
  gridItemAlign?: string;
  buttonAlign?: string;
  panelTextAlign?: string;
  elementPadding?: string;
  elementMargin?: string;
  gridMargin?: string;
  spacingContract?: "yootheme";
  id?: string;
};

export type GeneralTextAlignment = "left" | "center" | "right" | "justify";

/** Resolve universal General alignment; layout is canonical and aliases are read fallbacks. */
export function resolveGeneralTextAlignment(block: GeneralElementShellBlock): GeneralTextAlignment | undefined {
  const candidates = [
    block.visualStyle?.layout?.textAlign,
    block.textAlign,
    block.headingAlign,
    block.textAlignment,
    block.gridItemAlign,
    block.buttonAlign,
    block.panelTextAlign,
  ];
  return candidates.find((value): value is GeneralTextAlignment =>
    value === "left" || value === "center" || value === "right" || value === "justify",
  );
}

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
    // Preserve the authored UIkit utility in both directions. YOOtheme's
    // margin utilities are part of the element's flow geometry; reducing
    // them to top-only changes row height and shifts following sections.
    return `uk-margin-${margin}`;
  }
  return getUikitMarginClass(margin);
}

function getYoothemeWidthClass(
  maxWidth?: string,
  breakpoint?: string,
) {
  const width = maxWidth?.trim().toLowerCase();
  if (!width || !["small", "medium", "large", "xlarge", "2xlarge"].includes(width)) {
    return "";
  }

  // The static UIkit utility is exact for an unqualified source value. A
  // qualified value instead uses the rendered-page policy so a site can
  // change its canonical breakpoint thresholds without inheriting UIkit's
  // bundled numeric media queries.
  if (!breakpoint) return `uk-width-${width}`;
  return `builder-yootheme-width-${width}-from-${breakpoint}`;
}

export function getGeneralElementShellClassName(block: GeneralElementShellBlock) {
  if (!usesYoothemeSpacingContract(block)) return "";
  const layout = block.visualStyle?.layout;
  const isPositioned = layout?.position === "absolute" || layout?.position === "fixed";
  return [
    "yootheme-imported-spacing",
    getYoothemeWidthClass(layout?.maxWidth, layout?.maxWidthBreakpoint),
    // Flow margins do not participate in YOOtheme's positioned-element
    // origin. Applying `uk-margin` here adds 20px to authored offsets such as
    // `top: -388px` and makes the Builder image visibly lower than YOOtheme.
    isPositioned ? "" : getYoothemeMarginClass(layout?.marginMode),
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
  const {
    marginMode,
    removeTopMargin,
    removeBottomMargin,
    // Imported YOOtheme max widths belong to UIkit's width utility contract,
    // not WebPages' container-width General resolver. Removing both copies
    // here also makes previously imported documents read correctly.
    maxWidth,
    ...layout
  } = visual.layout;
  const { maxWidth: legacyEffectMaxWidth, ...effects } = visual.effects ?? {};
  return {
    ...visual,
    layout,
    ...(Object.keys(effects).length ? { effects } : {}),
  };
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
  const sourceVerticalMarginOnly = usesYoothemeSpacingContract(block)
    && Boolean(visual?.margin)
    && !visual?.margin?.left
    && !visual?.margin?.right;

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

  // Imported YOOtheme margins are always owned by the UIkit class emitted
  // above (`uk-margin*` / `uk-margin-remove`). Do not reintroduce an inline
  // zero margin here: inline styles would defeat both that UIkit class and a
  // source-authored Advanced CSS rule such as `.el-element { margin-left: … }`.
  if (!usesYoothemeSpacingContract(block) && !hasBuilderVisualSpacing(visual?.margin)) {
    if (localMargin === "none" || localMargin === "0" || localMargin === "0px") {
      style.margin = 0;
    } else if (!localMargin || localMargin === "inherit") {
      style.margin = 0;
    }
  }

  const textAlign = resolveGeneralTextAlignment(block);
  return {
    ...style,
    ...visualStyleToCss(visual),
    // YOOtheme's General `margin` is a vertical UIkit margin. Older imported
    // visual margin objects contain only `top`; do not let absent horizontal
    // sides inherit WebPages' global element margins and narrow the source
    // Grid/card geometry.
    ...(sourceVerticalMarginOnly ? { marginLeft: 0, marginRight: 0 } : {}),
    ...(textAlign ? { textAlign } : {}),
  };
}
