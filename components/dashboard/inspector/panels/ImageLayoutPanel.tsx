"use client";

import React from "react";
import { useInspector } from "../../context/InspectorContext";
import { InspectorChoiceGroup, InspectorGroupSummary } from "./InspectorSharedControls";
import type { BuilderLayoutBlock } from "@/components/dashboard/builderTypes";

export default function ImageLayoutPanel() {
  const { selectedLayoutBlock, updateSelectedLayoutBlockByKey } = useInspector();

  if (!selectedLayoutBlock || selectedLayoutBlock.kind !== "image") return null;

  const block = selectedLayoutBlock;

  return (
    <div className="builder-inspector-stack">
      <details className="builder-collapse" open>
        <summary>
          <InspectorGroupSummary
            title="Image Styling"
            description="Control the selected image crop, fit, and corner shape."
            meta={`${block.imageRatio ?? "auto"} · ${block.imageFit ?? "cover"}`}
          />
        </summary>
        <div className="builder-inspector-section">
          <div className="builder-two-column">
            <label className="builder-field">
              <span>Image Ratio</span>
              <InspectorChoiceGroup
                value={block.imageRatio ?? "auto"}
                options={[
                  { label: "Auto", value: "auto" },
                  { label: "1:1", value: "square" },
                  { label: "4:5", value: "4:5" },
                  { label: "3:4", value: "3:4" },
                ]}
                onChange={(value) =>
                  updateSelectedLayoutBlockByKey({
                    imageRatio: value as BuilderLayoutBlock["imageRatio"],
                  })
                }
              />
            </label>
            <label className="builder-field">
              <span>Image Fit</span>
              <InspectorChoiceGroup
                value={block.imageFit ?? "cover"}
                options={[
                  { label: "Cover", value: "cover" },
                  { label: "Contain", value: "contain" },
                  { label: "Fill", value: "fill" },
                ]}
                onChange={(value) =>
                  updateSelectedLayoutBlockByKey({
                    imageFit: value as BuilderLayoutBlock["imageFit"],
                  })
                }
              />
            </label>
          </div>
          <div className="builder-two-column">
            <label className="builder-field">
              <span>Size / Max Width</span>
              <input
                type="number"
                min={100}
                max={2400}
                value={block.imageMaxWidth ?? 1200}
                onChange={(event) =>
                  updateSelectedLayoutBlockByKey({
                    imageMaxWidth: Number(event.target.value) || undefined,
                  })
                }
              />
            </label>
            <label className="builder-field">
              <span>Corner Radius</span>
              <input
                type="number"
                min={0}
                max={100}
                value={block.imageBorderRadius ?? 12}
                onChange={(event) =>
                  updateSelectedLayoutBlockByKey({
                    imageBorderRadius: Number(event.target.value) || undefined,
                  })
                }
              />
            </label>
          </div>
        </div>
      </details>
    </div>
  );
}
