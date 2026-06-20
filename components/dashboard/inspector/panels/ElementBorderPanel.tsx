"use client";

import React from "react";
import { useInspector } from "../../context/InspectorContext";

export default function ElementBorderPanel() {
  const { selectedLayoutBlock, updateSelectedLayoutBlockByKey } = useInspector();

  if (!selectedLayoutBlock || selectedLayoutBlock.kind === "products") return null;

  const block = selectedLayoutBlock;

  return (
    <div className="builder-inspector-stack">
      <details className="builder-collapse" open>
        <summary>
          <span>Corners</span>
          <small>
            {block.borderRadius === undefined ? "inherit" : `${block.borderRadius}px`}
          </small>
        </summary>
        <div className="builder-inspector-section">
          <label className="builder-field">
            <span>Card Border Radius</span>
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
    </div>
  );
}
