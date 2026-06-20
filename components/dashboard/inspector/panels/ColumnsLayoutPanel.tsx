"use client";

import React from "react";
import { useInspector } from "../../context/InspectorContext";
import { InspectorChoiceGroup } from "./InspectorSharedControls";
import type { BuilderLayoutBlock } from "@/components/dashboard/builderTypes";

export default function ColumnsLayoutPanel() {
  const { selectedLayoutBlock, updateSelectedLayoutBlockByKey } = useInspector();

  if (!selectedLayoutBlock) return null;

  const block = selectedLayoutBlock;

  return (
    <div className="builder-inspector-stack">
      {block.kind === "grid" && (
        <div className="builder-inspector-section">
          <div className="builder-two-column">
            <label className="builder-field">
              <span>Columns</span>
              <input
                type="number"
                min={1}
                max={6}
                value={block.columns ?? 3}
                onChange={(event) =>
                  updateSelectedLayoutBlockByKey({ columns: Number(event.target.value) })
                }
              />
            </label>
            <label className="builder-field">
              <span>Rows</span>
              <input
                type="number"
                min={1}
                max={6}
                value={block.gridRows ?? 1}
                onChange={(event) =>
                  updateSelectedLayoutBlockByKey({ gridRows: Number(event.target.value) })
                }
              />
            </label>
          </div>
        </div>
      )}

      {block.kind === "badgeGrid" && (
        <div className="builder-inspector-section">
          <label className="builder-field">
            <span>Badge Columns</span>
            <input
              type="number"
              min={1}
              max={3}
              value={block.columns ?? 2}
              onChange={(event) =>
                updateSelectedLayoutBlockByKey({ columns: Number(event.target.value) })
              }
            />
          </label>
        </div>
      )}

      {block.kind === "products" && (
        <div className="builder-inspector-section">
          <div className="builder-two-column">
            <label className="builder-field">
              <span>Layout Variant</span>
              <InspectorChoiceGroup
                value={block.layoutVariant ?? "grid"}
                options={[
                  { label: "Grid", value: "grid" },
                  { label: "Carousel", value: "carousel" },
                ]}
                onChange={(value) =>
                  updateSelectedLayoutBlockByKey({
                    layoutVariant: value as BuilderLayoutBlock["layoutVariant"],
                  })
                }
              />
            </label>
            {block.layoutVariant !== "carousel" && (
              <label className="builder-field">
                <span>Columns</span>
                <input
                  type="number"
                  min={1}
                  max={4}
                  value={block.columns ?? 2}
                  onChange={(event) =>
                    updateSelectedLayoutBlockByKey({ columns: Number(event.target.value) })
                  }
                />
              </label>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
