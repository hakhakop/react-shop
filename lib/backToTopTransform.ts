import type { BuilderLayoutBlock, LayoutBlockKind } from "@/components/dashboard/builderTypes";
import { createLayoutBlock } from "@/components/dashboard/builderDefaults";

/** A replacement patch: retain shared settings and compatible content, remove To Top-only state. */
export function transformBackToTop(block: BuilderLayoutBlock, kind: LayoutBlockKind): Partial<BuilderLayoutBlock> {
  const replacement = createLayoutBlock(kind);
  const title = block.backToTop?.title ?? "";
  const content = kind === "heading" ? { headingText: title }
    : kind === "text" ? { body: title }
      : Object.prototype.hasOwnProperty.call(replacement, "title") ? { title } : {};
  return {
    ...Object.fromEntries(Object.keys(block).map(key => [key, undefined])),
    ...replacement,
    ...content,
    id: block.id,
    visualStyle: block.visualStyle,
    animation: block.animation,
    spacingContract: block.spacingContract,
    elementPadding: block.elementPadding,
  };
}
