"use client";

import React from "react";
import { useInspector } from "../../context/InspectorContext";
import { InspectorChoiceGroup } from "./InspectorSharedControls";
import type { BuilderLayoutBlock, BuilderPanelStyle } from "@/components/dashboard/builderTypes";

const panelStyleOptions: { label: string; value: BuilderPanelStyle }[] = [
  { label: "Default", value: "default" },
  { label: "Princity", value: "princity" },
  { label: "Princity Flat", value: "princity-flat" },
  { label: "Princity Line", value: "princity-line" },
  { label: "Secondary", value: "secondary" },
  { label: "Dark", value: "dark" },
  { label: "Light", value: "light" },
  { label: "Clean with shadow", value: "clean-shadow" },
  { label: "Flat dark", value: "flat-dark" },
  { label: "Flat white", value: "flat-white" },
  { label: "Antigravity", value: "antigravity" },
];

export default function CardDesignPanel() {
  const { selectedLayoutBlock, updateSelectedLayoutBlockByKey } = useInspector();

  if (!selectedLayoutBlock) return null;

  const block = selectedLayoutBlock;

  const isCardStyleBlock = (kind?: string) =>
    kind === "grid" ||
    kind === "panel" ||
    kind === "products" ||
    kind === "badgeGrid" ||
    kind === "list" ||
    kind === "productPurchasePanel" ||
    kind === "productSpecsPanel";

  const showElementAppearance =
    block.kind !== "products" &&
    block.kind !== "image" &&
    block.kind !== "hero" &&
    block.kind !== "button" &&
    !isCardStyleBlock(block.kind);

  return (
    <div className="builder-inspector-stack">
      {block.kind === "products" && (
        <details className="builder-collapse" open>
          <summary>
            <span>Card Design</span>
            <small>
              {block.cardPreset ?? "standard"} · {block.cardStyle ?? "flat"}
            </small>
          </summary>
          <div className="builder-inspector-section">
            <label className="builder-field">
              <span>Card Preset</span>
              <select
                value={block.cardPreset ?? "standard"}
                onChange={(event) =>
                  updateSelectedLayoutBlockByKey({
                    cardPreset: event.target.value as BuilderLayoutBlock["cardPreset"],
                  })
                }
              >
                <option value="standard">Standard</option>
                <option value="princity">Princity</option>
                <option value="princity-flat">Princity Flat</option>
                <option value="princity-line">Princity Line</option>
                <option value="graph">Graph Clean</option>
                <option value="gallery">Gallery</option>
                <option value="editorial">Editorial</option>
                <option value="compact">Compact</option>
                <option value="minimal">Minimal</option>
                <option value="luxury">Luxury</option>
              </select>
            </label>
            <div className="builder-two-column">
              <label className="builder-field">
                <span>Card Style</span>
                <InspectorChoiceGroup
                  value={block.cardStyle ?? "flat"}
                  options={[
                    { label: "Flat", value: "flat" },
                    { label: "Soft", value: "soft" },
                    { label: "Lined", value: "lined" },
                    { label: "None", value: "none" },
                  ]}
                  onChange={(value) =>
                    updateSelectedLayoutBlockByKey({
                      cardStyle: value as BuilderLayoutBlock["cardStyle"],
                    })
                  }
                />
              </label>
              <label className="builder-field">
                <span>Image Frame</span>
                <InspectorChoiceGroup
                  value={block.gridImageFrame ?? "none"}
                  options={[
                    { label: "None", value: "none" },
                    { label: "Soft", value: "soft" },
                  ]}
                  onChange={(value) =>
                    updateSelectedLayoutBlockByKey({
                      gridImageFrame: value as BuilderLayoutBlock["gridImageFrame"],
                    })
                  }
                />
              </label>
            </div>
            <label className="builder-field">
              <span>Card Theme</span>
              <select
                value={block.panelStyle ?? "default"}
                onChange={(event) =>
                  updateSelectedLayoutBlockByKey({
                    panelStyle: event.target.value as BuilderPanelStyle,
                  })
                }
              >
                {panelStyleOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="builder-field">
              <span>Border Radius</span>
              <select
                value={
                  block.borderRadius === undefined
                    ? "inherit"
                    : [0, 4, 8, 12, 16, 24].includes(block.borderRadius)
                      ? String(block.borderRadius)
                      : "custom"
                }
                onChange={(event) => {
                  const val = event.target.value;
                  if (val === "inherit") {
                    updateSelectedLayoutBlockByKey({ borderRadius: undefined });
                  } else if (val === "custom") {
                    updateSelectedLayoutBlockByKey({ borderRadius: 10 });
                  } else {
                    updateSelectedLayoutBlockByKey({ borderRadius: Number(val) });
                  }
                }}
              >
                <option value="inherit">Inherit (global settings)</option>
                <option value="0">Flat (0px)</option>
                <option value="4">Small (4px)</option>
                <option value="8">Medium (8px)</option>
                <option value="12">Rounded (12px)</option>
                <option value="16">Large (16px)</option>
                <option value="24">Extra Large (24px)</option>
                <option value="custom">Custom...</option>
              </select>
            </label>
            {block.borderRadius !== undefined && ![0, 4, 8, 12, 16, 24].includes(block.borderRadius) && (
              <label className="builder-field">
                <span>Custom Radius (px)</span>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={block.borderRadius}
                  onChange={(event) => {
                    const val = event.target.value === "" ? 0 : Number(event.target.value);
                    updateSelectedLayoutBlockByKey({ borderRadius: val });
                  }}
                />
              </label>
            )}
          </div>
        </details>
      )}

      {showElementAppearance && (
        <details className="builder-collapse" open>
          <summary>
            <span>Element appearance</span>
            <small>{block.panelStyle ?? "default"}</small>
          </summary>
          <div className="builder-inspector-section">
            <label className="builder-field">
              <span>Card Style</span>
              <select
                value={block.panelStyle ?? "default"}
                onChange={(event) =>
                  updateSelectedLayoutBlockByKey({
                    panelStyle: event.target.value as BuilderPanelStyle,
                  })
                }
              >
                {panelStyleOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </details>
      )}
    </div>
  );
}
