# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: yootheme-import-spacing-contract.spec.ts >> YOOtheme General max width uses UIkit width utilities, not container tiers
- Location: tests/yootheme-import-spacing-contract.spec.ts:82:5

# Error details

```
TypeError: Cannot read properties of undefined (reading 'spacingContract')
```

# Test source

```ts
  1   | import type { CSSProperties } from "react";
  2   | import {
  3   |   hasBuilderVisualSpacing,
  4   |   type BuilderVisualStyle,
  5   |   visualStyleToCss,
  6   | } from "@/lib/builderVisualStyle";
  7   | import { resolveBuilderSpacing } from "@/lib/builderSpacing";
  8   | import { getUikitMarginClass } from "@/lib/uikitTokens";
  9   | 
  10  | type GeneralElementShellBlock = {
  11  |   visualStyle?: BuilderVisualStyle;
  12  |   textAlign?: string;
  13  |   headingAlign?: string;
  14  |   textAlignment?: string;
  15  |   gridItemAlign?: string;
  16  |   buttonAlign?: string;
  17  |   panelTextAlign?: string;
  18  |   elementPadding?: string;
  19  |   elementMargin?: string;
  20  |   gridMargin?: string;
  21  |   spacingContract?: "yootheme";
  22  |   id?: string;
  23  | };
  24  | 
  25  | export type GeneralTextAlignment = "left" | "center" | "right" | "justify";
  26  | 
  27  | /** Resolve universal General alignment; layout is canonical and aliases are read fallbacks. */
  28  | export function resolveGeneralTextAlignment(block: GeneralElementShellBlock): GeneralTextAlignment | undefined {
  29  |   const candidates = [
  30  |     block.visualStyle?.layout?.textAlign,
  31  |     block.textAlign,
  32  |     block.headingAlign,
  33  |     block.textAlignment,
  34  |     block.gridItemAlign,
  35  |     block.buttonAlign,
  36  |     block.panelTextAlign,
  37  |   ];
  38  |   return candidates.find((value): value is GeneralTextAlignment =>
  39  |     value === "left" || value === "center" || value === "right" || value === "justify",
  40  |   );
  41  | }
  42  | 
  43  | function usesYoothemeSpacingContract(block: GeneralElementShellBlock) {
  44  |   // `yootheme-*` is the established persisted import identity. Keep it as a
  45  |   // read-compatible fallback for documents imported before the explicit
  46  |   // provenance marker was added.
> 47  |   return block.spacingContract === "yootheme" || block.id?.startsWith("yootheme-");
      |                ^ TypeError: Cannot read properties of undefined (reading 'spacingContract')
  48  | }
  49  | 
  50  | /**
  51  |  * The YOOtheme margin vocabulary is not the WebPages spacing scale: notably
  52  |  * `medium` is UIkit's 40px margin, not WebPages' generic `md` token. Keeping
  53  |  * this mapping on the shared General shell preserves the imported semantic
  54  |  * and prevents component renderers from applying the same margin a second
  55  |  * time.
  56  |  */
  57  | function getYoothemeMarginClass(value?: string) {
  58  |   const margin = value?.trim().toLowerCase();
  59  |   if (!margin) return "";
  60  |   if (margin === "remove-vertical" || margin === "none") return "uk-margin-remove";
  61  |   if (margin === "default") return "uk-margin";
  62  |   if (["small", "medium", "large", "xlarge"].includes(margin)) {
  63  |     // Imported YOOtheme spacing is a grid-item boundary. Keep the
  64  |     // preceding gap via the top utility; a trailing bottom margin on the
  65  |     // final imported block would incorrectly enlarge the WebPages column.
  66  |     return `uk-margin-${margin}-top`;
  67  |   }
  68  |   return getUikitMarginClass(margin);
  69  | }
  70  | 
  71  | function getYoothemeWidthClass(
  72  |   maxWidth?: string,
  73  |   breakpoint?: string,
  74  | ) {
  75  |   const width = maxWidth?.trim().toLowerCase();
  76  |   if (!width || !["small", "medium", "large", "xlarge", "2xlarge"].includes(width)) {
  77  |     return "";
  78  |   }
  79  | 
  80  |   // The static UIkit utility is exact for an unqualified source value. A
  81  |   // qualified value instead uses the rendered-page policy so a site can
  82  |   // change its canonical breakpoint thresholds without inheriting UIkit's
  83  |   // bundled numeric media queries.
  84  |   if (!breakpoint) return `uk-width-${width}`;
  85  |   return `builder-yootheme-width-${width}-from-${breakpoint}`;
  86  | }
  87  | 
  88  | export function getGeneralElementShellClassName(block: GeneralElementShellBlock) {
  89  |   if (!usesYoothemeSpacingContract(block)) return "";
  90  |   const layout = block.visualStyle?.layout;
  91  |   return [
  92  |     "yootheme-imported-spacing",
  93  |     getYoothemeWidthClass(layout?.maxWidth, layout?.maxWidthBreakpoint),
  94  |     getYoothemeMarginClass(layout?.marginMode),
  95  |     layout?.removeTopMargin ? "uk-margin-remove-top" : "",
  96  |     layout?.removeBottomMargin ? "uk-margin-remove-bottom" : "",
  97  |   ].filter(Boolean).join(" ");
  98  | }
  99  | 
  100 | function shellVisualStyle(block: GeneralElementShellBlock) {
  101 |   const visual = block.visualStyle;
  102 |   if (!visual || !usesYoothemeSpacingContract(block) || !visual.layout) return visual;
  103 | 
  104 |   // Margin is emitted by getGeneralElementShellClassName() so UIkit's own
  105 |   // sibling-aware margin rules remain authoritative. Do not also emit an
  106 |   // inline margin on the same shell.
  107 |   const {
  108 |     marginMode,
  109 |     removeTopMargin,
  110 |     removeBottomMargin,
  111 |     // Imported YOOtheme max widths belong to UIkit's width utility contract,
  112 |     // not WebPages' container-width General resolver. Removing both copies
  113 |     // here also makes previously imported documents read correctly.
  114 |     maxWidth,
  115 |     ...layout
  116 |   } = visual.layout;
  117 |   const { maxWidth: legacyEffectMaxWidth, ...effects } = visual.effects ?? {};
  118 |   return {
  119 |     ...visual,
  120 |     layout,
  121 |     ...(Object.keys(effects).length ? { effects } : {}),
  122 |   };
  123 | }
  124 | 
  125 | /**
  126 |  * The canonical General/Advanced style owned by an element's outer shell.
  127 |  * Both the Builder and storefront apply this before rendering the element
  128 |  * itself, so General positioning always has the same containing-block path.
  129 |  */
  130 | export function getGeneralElementShellStyle(
  131 |   block: GeneralElementShellBlock,
  132 | ): CSSProperties {
  133 |   const visual = shellVisualStyle(block) as BuilderVisualStyle | undefined;
  134 |   const style: CSSProperties = {};
  135 |   const localPadding = block.elementPadding?.trim().toLowerCase();
  136 |   const localMargin = (block.elementMargin ?? block.gridMargin)?.trim().toLowerCase();
  137 | 
  138 |   if (!hasBuilderVisualSpacing(visual?.padding)) {
  139 |     if (usesYoothemeSpacingContract(block)) {
  140 |       // UIkit/YOOtheme has no inherited universal element wrapper padding.
  141 |       // Source spacing is represented by the semantic margin class attached
  142 |       // to this same shell below.
  143 |       style.padding = "0px";
  144 |     } else if (localPadding === "none" || localPadding === "0" || localPadding === "0px") {
  145 |       // A local None is a semantic value, not an absent value. It must win
  146 |       // over the Global Element Padding token.
  147 |       style.padding = "0px";
```