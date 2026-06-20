"use client";

import React from "react";
import { useInspector } from "../../context/InspectorContext";
import { InspectorChoiceGroup } from "./InspectorSharedControls";
import type { BuilderLayoutBlock } from "@/components/dashboard/builderTypes";

export default function AddToCartStylePanel() {
  const { selectedLayoutBlock, updateSelectedLayoutBlockByKey } = useInspector();

  if (!selectedLayoutBlock || selectedLayoutBlock.kind !== "products") return null;

  const block = selectedLayoutBlock;

  return (
    <div className="builder-inspector-stack">
      <details className="builder-collapse" open>
        <summary>
          <span>Add To Cart Button</span>
          <small>{block.addToCartStyle ?? "inherit"}</small>
        </summary>
        <div className="builder-inspector-section">
          <div className="builder-two-column">
            <label className="builder-field">
              <span>Button Color</span>
              <InspectorChoiceGroup
                value={block.addToCartStyle ?? "inherit"}
                options={[
                  { label: "Theme", value: "inherit" },
                  { label: "Blue", value: "blue" },
                  { label: "Dark", value: "dark" },
                  { label: "Light", value: "light" },
                ]}
                onChange={(value) =>
                  updateSelectedLayoutBlockByKey({
                    addToCartStyle: value as BuilderLayoutBlock["addToCartStyle"],
                  })
                }
              />
            </label>
            <label className="builder-field">
              <span>Button Size</span>
              <InspectorChoiceGroup
                value={block.addToCartSize ?? "medium"}
                options={[
                  { label: "Compact", value: "compact" },
                  { label: "Medium", value: "medium" },
                  { label: "Large", value: "large" },
                  { label: "Full", value: "full" },
                ]}
                onChange={(value) =>
                  updateSelectedLayoutBlockByKey({
                    addToCartSize: value as BuilderLayoutBlock["addToCartSize"],
                  })
                }
              />
            </label>
          </div>
          <div className="builder-two-column">
            <label className="builder-field">
              <span>Button Display</span>
              <InspectorChoiceGroup
                value={block.addToCartDisplay ?? "button"}
                options={[
                  { label: "Text", value: "button" },
                  { label: "Icon", value: "icon" },
                ]}
                onChange={(value) =>
                  updateSelectedLayoutBlockByKey({
                    addToCartDisplay: value as BuilderLayoutBlock["addToCartDisplay"],
                  })
                }
              />
            </label>
            <label className="builder-field">
              <span>Button Visibility</span>
              <InspectorChoiceGroup
                value={block.addToCartVisibility ?? "hover"}
                options={[
                  { label: "Hover", value: "hover" },
                  { label: "Always", value: "always" },
                ]}
                onChange={(value) =>
                  updateSelectedLayoutBlockByKey({
                    addToCartVisibility: value as BuilderLayoutBlock["addToCartVisibility"],
                  })
                }
              />
            </label>
          </div>
          <label className="builder-field">
            <span>Button Position</span>
            <InspectorChoiceGroup
              value={block.addToCartPosition ?? "below"}
              options={[
                { label: "Below", value: "below" },
                { label: "Under price", value: "under-price" },
                { label: "Under wishlist", value: "under-wishlist" },
              ]}
              onChange={(value) =>
                updateSelectedLayoutBlockByKey({
                  addToCartPosition: value as BuilderLayoutBlock["addToCartPosition"],
                })
              }
            />
          </label>
        </div>
      </details>
    </div>
  );
}
