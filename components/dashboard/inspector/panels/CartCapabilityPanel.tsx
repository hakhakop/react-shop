"use client";

import type { BuilderLayoutBlock, InspectorTab } from "@/components/dashboard/builderTypes";
import type { BuilderShellSettings } from "@/lib/builderShell";
import { InspectorDivision, InspectorFieldRow } from "@/components/dashboard/inspector/InspectorControls";

type Props = {
  block: BuilderLayoutBlock;
  tab: InspectorTab;
  shellSettings: BuilderShellSettings;
  update: (patch: Partial<BuilderLayoutBlock>) => void;
};

export default function CartCapabilityPanel({ block, tab, update }: Props) {
  if (tab === "advanced") {
    return null;
  }

  return (
    <div className="builder-inspector-stack" data-uikit-capability="cart-content">
      <InspectorDivision title="CART PRESENTATION">
        <InspectorFieldRow label="Presentation">
          <select
            value={block.cartPresentation ?? "inline"}
            onChange={(event) =>
              update({ cartPresentation: event.target.value as BuilderLayoutBlock["cartPresentation"] })
            }
          >
            <option value="inline">Inline</option>
            <option value="floating">Floating</option>
          </select>
        </InspectorFieldRow>
        {(block.cartPresentation ?? "inline") === "floating" && (
          <InspectorFieldRow label="Floating position">
            <select
              value={block.cartFloatingPosition ?? "bottom-right"}
              onChange={(event) =>
                update({ cartFloatingPosition: event.target.value as BuilderLayoutBlock["cartFloatingPosition"] })
              }
            >
              <option value="bottom-right">Bottom Right</option>
              <option value="bottom-left">Bottom Left</option>
            </select>
          </InspectorFieldRow>
        )}
      </InspectorDivision>
    </div>
  );
}
