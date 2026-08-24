import type { CSSProperties, ReactNode } from "react";
import type { BuilderLayoutBlock } from "@/lib/builderLayouts";

type Props = {
  blocks: BuilderLayoutBlock[];
  children: ReactNode;
};

function positioningLayout(block: BuilderLayoutBlock) {
  return block.visualStyle as
    | { layout?: { position?: string; left?: string; right?: string; textAlign?: string } }
    | undefined;
}

function hasPositionedSiblings(blocks: BuilderLayoutBlock[]) {
  return blocks.some(
    (block) => positioningLayout(block)?.layout?.position === "absolute",
  );
}

/**
 * YOOtheme gives a centered, unanchored absolute element a full column-width
 * wrapper (`uk-width-1-1`). The media remains sized by its own canonical
 * media box; this only restores the shared General positioning surface.
 */
export function getContentPositioningGroupChildStyle(
  block: BuilderLayoutBlock,
  siblings: BuilderLayoutBlock[],
): CSSProperties {
  const layout = positioningLayout(block)?.layout;
  if (!hasPositionedSiblings(siblings) || layout?.textAlign !== "center") return {};

  // A centered normal-flow image shares the same full positioning panel as
  // YOOtheme's `uk-width-1-1` image item. Without this width, its intrinsic
  // media width shrink-wraps the shell and the image is centered in a narrow
  // 495px box instead of the full expanded row.
  if (block.kind === "image" && layout.position !== "absolute") return { width: "100%" };

  if (
    layout.position !== "absolute" ||
    layout.left ||
    layout.right
  ) return {};

  return { width: "100%" };
}

/**
 * YOOtheme columns establish a local positioning panel only when their
 * normal-flow content has absolutely positioned siblings. This preserves the
 * flow height of the regular content while giving those siblings one shared
 * containing block in the Builder and storefront.
 */
export function ContentPositioningGroup({ blocks, children }: Props) {
  const hasAbsoluteSibling = hasPositionedSiblings(blocks);

  if (!hasAbsoluteSibling) return <>{children}</>;

  return (
    <div
      className="shop-builder-content-positioning-group"
      data-builder-positioning-group="column-content"
      style={
        {
          // The column content owns the containing block. Keeping the group
          // itself unpositioned matches YOOtheme's absolute-element origin at
          // the outer column/panel top while the group still owns flow height.
          position: "static",
          width: "100%",
          // The group mirrors YOOtheme's column panel. Its flow height must
          // come from the authored children themselves, not WebPages' legacy
          // implicit element-padding defaults. Explicit element padding is an
          // inline shell value and still wins over these scoped fallbacks.
          "--builder-global-element-padding-top": "0px",
          "--builder-global-element-padding-right": "0px",
          "--builder-global-element-padding-bottom": "0px",
          "--builder-global-element-padding-left": "0px",
        } as CSSProperties
      }
    >
      {children}
    </div>
  );
}
