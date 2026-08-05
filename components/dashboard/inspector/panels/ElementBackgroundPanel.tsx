// @ts-nocheck
"use client";

import React from "react";
import { useInspector } from "../../context/InspectorContext";
import { InspectorChoiceGroup } from "./InspectorSharedControls";
import { InspectorFieldRow } from "../InspectorControls";
import type { BuilderLayoutBlock } from "@/components/dashboard/builderTypes";

export default function ElementBackgroundPanel() {
  const {
    selectedLayoutBlock,
    updateSelectedLayoutBlockByKey,
    elementBackgroundPresets,
  } = useInspector();

  if (!selectedLayoutBlock) return null;

  const block = selectedLayoutBlock;

  const showBackgroundControls =
    block.kind === "products" || block.kind === "grid" || block.kind === "panel";

  if (!showBackgroundControls) return null;

  return (
    <div className="builder-inspector-stack">
      <div className="builder-inspector-section">
        <InspectorFieldRow
          label="Background Mode"
          isOverridden={block.elementBackgroundMode !== undefined}
          inheritedValueText="Preset"
          onReset={() =>
            updateSelectedLayoutBlockByKey({
              elementBackgroundMode: undefined,
              elementBackground: undefined,
            })
          }
        >
          <InspectorChoiceGroup
            value={block.elementBackgroundMode ?? "default"}
            options={[
              { label: "Preset", value: "default" },
              { label: "Transparent", value: "transparent" },
              { label: "Custom", value: "custom" },
            ]}
            onChange={(value) =>
              updateSelectedLayoutBlockByKey({
                elementBackgroundMode: value as BuilderLayoutBlock["elementBackgroundMode"],
              })
            }
          />
        </InspectorFieldRow>
        {block.elementBackgroundMode === "custom" && (
          <InspectorFieldRow
            label="Background Color"
            isOverridden={block.elementBackground !== undefined}
            inheritedValueText="Default"
            onReset={() => updateSelectedLayoutBlockByKey({ elementBackground: undefined })}
          >
            <div className="builder-background-presets">
              {elementBackgroundPresets.map((preset) => (
                <button
                  key={preset.value}
                  type="button"
                  className={
                    block.elementBackground?.toLowerCase() === preset.value.toLowerCase()
                      ? "is-active"
                      : ""
                  }
                  onClick={() =>
                    updateSelectedLayoutBlockByKey({
                      elementBackground: preset.value,
                    })
                  }
                >
                  <span style={{ background: preset.value }} />
                  {preset.label}
                </button>
              ))}
            </div>
            <div className="builder-color-row" style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
              <input
                type="color"
                value={block.elementBackground ?? "#ffffff"}
                onChange={(event) =>
                  updateSelectedLayoutBlockByKey({
                    elementBackground: event.target.value,
                  })
                }
              />
              <input
                value={block.elementBackground ?? "#ffffff"}
                onChange={(event) =>
                  updateSelectedLayoutBlockByKey({
                    elementBackground: event.target.value,
                  })
                }
              />
            </div>
          </InspectorFieldRow>
        )}
      </div>
    </div>
  );
}

