"use client";

import React from "react";
import { useInspector } from "../../context/InspectorContext";
import { InspectorChoiceGroup } from "./InspectorSharedControls";
import type { BuilderLayoutBlock } from "@/components/dashboard/builderTypes";

export default function CardSpacingPanel() {
  const { selectedLayoutBlock, updateSelectedLayoutBlockByKey } = useInspector();

  if (!selectedLayoutBlock) return null;

  const block = selectedLayoutBlock;

  return (
    <div className="builder-inspector-stack">
      {block.kind === "grid" && (
        <details className="builder-collapse" open>
          <summary>
            <span>Internal spacing</span>
            <small>items & cards</small>
          </summary>
          <div className="builder-inspector-section">
            <div className="builder-two-column">
              <label className="builder-field">
                <span>Item Gap</span>
                <InspectorChoiceGroup
                  value={block.gridGap ?? "medium"}
                  options={[
                    { label: "None", value: "none" },
                    { label: "Small", value: "small" },
                    { label: "Medium", value: "medium" },
                    { label: "Large", value: "large" },
                  ]}
                  onChange={(value) =>
                    updateSelectedLayoutBlockByKey({
                      gridGap: value as BuilderLayoutBlock["gridGap"],
                    })
                  }
                />
              </label>
              <label className="builder-field">
                <span>Content Padding</span>
                <InspectorChoiceGroup
                  value={block.gridContentPadding ?? "medium"}
                  options={[
                    { label: "None", value: "none" },
                    { label: "Small", value: "small" },
                    { label: "Medium", value: "medium" },
                    { label: "Large", value: "large" },
                  ]}
                  onChange={(value) =>
                    updateSelectedLayoutBlockByKey({
                      gridContentPadding: value as BuilderLayoutBlock["gridContentPadding"],
                    })
                  }
                />
              </label>
            </div>
            <label className="builder-field">
              <span>Image Padding</span>
              <InspectorChoiceGroup
                value={block.gridImagePadding ?? "frameless"}
                options={[
                  { label: "Frameless", value: "frameless" },
                  { label: "Small", value: "small" },
                  { label: "Medium", value: "medium" },
                  { label: "Max", value: "max" },
                ]}
                onChange={(value) =>
                  updateSelectedLayoutBlockByKey({
                    gridImagePadding: value as BuilderLayoutBlock["gridImagePadding"],
                  })
                }
              />
            </label>
          </div>
        </details>
      )}

      {block.kind === "products" && (
        <details className="builder-collapse" open>
          <summary>
            <span>Product card spacing</span>
            <small>gap, card & image</small>
          </summary>
          <div className="builder-inspector-section">
            <div className="builder-two-column">
              <label className="builder-field">
                <span>Grid Gap</span>
                <InspectorChoiceGroup
                  value={block.gridGap ?? "medium"}
                  options={[
                    { label: "None", value: "none" },
                    { label: "Small", value: "small" },
                    { label: "Medium", value: "medium" },
                    { label: "Large", value: "large" },
                    { label: "Max", value: "max" },
                  ]}
                  onChange={(value) =>
                    updateSelectedLayoutBlockByKey({
                      gridGap: value as BuilderLayoutBlock["gridGap"],
                    })
                  }
                />
              </label>
              <label className="builder-field">
                <span>Card Padding</span>
                <InspectorChoiceGroup
                  value={block.cardPadding ?? "medium"}
                  options={[
                    { label: "None", value: "none" },
                    { label: "Small", value: "small" },
                    { label: "Medium", value: "medium" },
                    { label: "Large", value: "large" },
                    { label: "Max", value: "max" },
                  ]}
                  onChange={(value) =>
                    updateSelectedLayoutBlockByKey({
                      cardPadding: value as BuilderLayoutBlock["cardPadding"],
                    })
                  }
                />
              </label>
            </div>
            <label className="builder-field">
              <span>Image Padding</span>
              <InspectorChoiceGroup
                value={block.imagePadding ?? "large"}
                options={[
                  { label: "Frameless", value: "none" },
                  { label: "Small", value: "small" },
                  { label: "Medium", value: "medium" },
                  { label: "Large", value: "large" },
                  { label: "Max", value: "max" },
                ]}
                onChange={(value) =>
                  updateSelectedLayoutBlockByKey({
                    imagePadding: value as BuilderLayoutBlock["imagePadding"],
                  })
                }
              />
            </label>
            <div className="builder-two-column">
              <label className="builder-field">
                <span>Image Fit</span>
                <InspectorChoiceGroup
                  value={block.imageFit ?? "preset"}
                  options={[
                    { label: "Preset", value: "preset" },
                    { label: "Contain", value: "contain" },
                    { label: "Cover", value: "cover" },
                    { label: "Fill", value: "fill" },
                  ]}
                  onChange={(value) =>
                    updateSelectedLayoutBlockByKey({
                      imageFit: value === "preset" ? undefined : (value as BuilderLayoutBlock["imageFit"]),
                    })
                  }
                />
              </label>
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
            </div>
          </div>
        </details>
      )}
    </div>
  );
}
