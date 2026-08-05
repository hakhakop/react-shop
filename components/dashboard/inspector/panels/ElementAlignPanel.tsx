"use client";

import React from "react";
import { useInspector } from "../../context/InspectorContext";
import { InspectorChoiceGroup } from "./InspectorSharedControls";
import { InspectorFieldRow } from "../InspectorControls";
import type { BuilderLayoutBlock } from "@/components/dashboard/builderTypes";

export default function ElementAlignPanel() {
  const { selectedLayoutBlock, updateSelectedLayoutBlockByKey } = useInspector();

  if (!selectedLayoutBlock) return null;

  const block = selectedLayoutBlock;

  return (
    <div className="builder-inspector-stack">
      {block.kind !== "products" && block.kind !== "image" && (
        <div className="builder-inspector-section">
          <InspectorFieldRow
            label="Content Align"
            isOverridden={block.elementAlign !== undefined}
            inheritedValueText="Left"
            onReset={() => updateSelectedLayoutBlockByKey({ elementAlign: undefined })}
          >
            <InspectorChoiceGroup
              value={block.elementAlign ?? "left"}
              options={[
                { label: "Left", value: "left" },
                { label: "Center", value: "center" },
                { label: "Right", value: "right" },
              ]}
              onChange={(value) =>
                updateSelectedLayoutBlockByKey({
                  elementAlign: value as BuilderLayoutBlock["elementAlign"],
                })
              }
            />
          </InspectorFieldRow>

          {(block.kind === "button" || block.kind === "hero") && (
            <div className="builder-two-column">
              <InspectorFieldRow
                label="Buttons orientation"
                isOverridden={block.buttonsLayout !== undefined}
                inheritedValueText="Inline"
                onReset={() => updateSelectedLayoutBlockByKey({ buttonsLayout: undefined })}
              >
                <InspectorChoiceGroup
                  value={block.buttonsLayout ?? "inline"}
                  options={[
                    { label: "Inline", value: "inline" },
                    { label: "Stacked", value: "stacked" },
                  ]}
                  onChange={(value) =>
                    updateSelectedLayoutBlockByKey({ buttonsLayout: value as any })
                  }
                />
              </InspectorFieldRow>
              <InspectorFieldRow
                label="Button Gap"
                isOverridden={block.buttonGap !== undefined}
                inheritedValueText="Default"
                onReset={() => updateSelectedLayoutBlockByKey({ buttonGap: undefined })}
              >
                <InspectorChoiceGroup
                  value={block.buttonGap ?? "0.75rem"}
                  options={[
                    { label: "Touching", value: "0.25rem" },
                    { label: "Tight", value: "0.5rem" },
                    { label: "Default", value: "0.75rem" },
                    { label: "Comfort", value: "1.5rem" },
                    { label: "Spacious", value: "3rem" },
                    { label: "Wide", value: "5rem" },
                    { label: "Separated", value: "8rem" },
                  ]}
                  onChange={(value) =>
                    updateSelectedLayoutBlockByKey({
                      buttonGap: value,
                    })
                  }
                />
              </InspectorFieldRow>
            </div>
          )}
        </div>
      )}

      {block.kind === "products" && (
        <div className="builder-inspector-section">
          <InspectorFieldRow
            label="Content Align"
            isOverridden={block.elementAlign !== undefined}
            inheritedValueText="Left"
            onReset={() => updateSelectedLayoutBlockByKey({ elementAlign: undefined })}
          >
            <InspectorChoiceGroup
              value={block.elementAlign ?? "left"}
              options={[
                { label: "Left", value: "left" },
                { label: "Center", value: "center" },
                { label: "Right", value: "right" },
              ]}
              onChange={(value) =>
                updateSelectedLayoutBlockByKey({
                  elementAlign: value as BuilderLayoutBlock["elementAlign"],
                })
              }
            />
          </InspectorFieldRow>
        </div>
      )}
    </div>
  );
}

