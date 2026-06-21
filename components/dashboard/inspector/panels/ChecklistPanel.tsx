// @ts-nocheck
"use client";

import React from "react";
import { useInspector } from "../../context/InspectorContext";
import { Plus, Trash2 } from "lucide-react";

export default function ChecklistPanel() {
  const {
    selectedLayoutBlock,
    updateSelectedLayoutBlockByKey,
    getSelectedBlockIndices,
    updateSelectedLayoutBlock,
  } = useInspector();

  if (!selectedLayoutBlock) return null;

  const block = selectedLayoutBlock;
  const indices = getSelectedBlockIndices();
  if (!indices) return null;

  const { itemIndex, blockIndex } = indices;
  const items = block.items ?? [];

  const handleUpdate = (patch: any) => {
    updateSelectedLayoutBlock(itemIndex, blockIndex, patch);
  };

  return (
    <div className="builder-inspector-stack">
      <div className="builder-inspector-section">
        <div className="builder-field-header" style={{ marginBottom: "10px" }}>
          <strong>Checklist Settings</strong>
          <small>{items.length} item{items.length !== 1 ? "s" : ""}</small>
        </div>

        <label className="builder-field">
          <span>Icon type</span>
          <select
            value={block.listIcon ?? "check"}
            onChange={(event) =>
              handleUpdate({ listIcon: event.target.value as any })
            }
          >
            <option value="check">Check</option>
            <option value="circleCheck">Circle Check</option>
            <option value="arrowRight">Arrow Right</option>
            <option value="star">Star</option>
            <option value="heart">Heart</option>
            <option value="sparkles">Sparkles</option>
            <option value="shield">Shield</option>
          </select>
        </label>

        <label className="builder-field">
          <span>Icon Color Scheme</span>
          <select
            value={block.listIconColorScheme ?? "default"}
            onChange={(event) =>
              handleUpdate({ listIconColorScheme: event.target.value as any })
            }
          >
            <option value="default">Default (theme color)</option>
            <option value="gradient-cycle">Gradient Cycle (sky → indigo → purple)</option>
          </select>
        </label>

        <label className="builder-field">
          <span>Icon Size (px)</span>
          <input
            type="number"
            min={8}
            max={64}
            value={block.listIconSize ?? 16}
            onChange={(event) =>
              handleUpdate({ listIconSize: Number(event.target.value) })
            }
          />
        </label>
      </div>

      {/* Checklist Items list */}
      <div className="builder-inspector-section" style={{ borderTop: "1px solid var(--builder-ui-border)", paddingTop: "14px", marginTop: "14px" }}>
        <div className="builder-field-header" style={{ marginBottom: "10px" }}>
          <strong>Checklist Items</strong>
        </div>

        {items.map((item, itemIdx) => (
          <label key={itemIdx} className="builder-field">
            <span>Item {itemIdx + 1}</span>
            <div style={{ display: "flex", gap: "4px" }}>
              <input
                value={item}
                onChange={(event) => {
                  const newItems = [...items];
                  newItems[itemIdx] = event.target.value;
                  handleUpdate({ items: newItems });
                }}
              />
              <button
                type="button"
                className="builder-inline-delete"
                onClick={() => {
                  const newItems = items.filter((_, i) => i !== itemIdx);
                  handleUpdate({ items: newItems });
                }}
                style={{ padding: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                <Trash2 size={14} />
              </button>
            </div>
          </label>
        ))}

        <button
          type="button"
          className="builder-inline-add builder-full-button"
          onClick={() => {
            const newItems = [...items, `Item ${items.length + 1}`];
            handleUpdate({ items: newItems });
          }}
          style={{ marginTop: "10px" }}
        >
          <Plus size={15} /> Add checklist item
        </button>
      </div>
    </div>
  );
}
