"use client";

import React, { useState } from "react";
import { useInspector } from "../../context/InspectorContext";
import { Plus, Trash2 } from "lucide-react";

export default function ButtonsPanel() {
  const {
    selectedLayoutBlock,
    addSelectedLayoutBlockButton,
    deleteSelectedLayoutBlockButton,
    updateSelectedLayoutBlockButton,
    getSelectedBlockIndices,
    selectedLayoutBlockKey,
  } = useInspector();

  const [openNestedCardId, setOpenNestedCardId] = useState<string | null>(null);

  if (!selectedLayoutBlock) return null;

  const indices = getSelectedBlockIndices();
  if (!indices) return null;

  const { itemIndex, blockIndex } = indices;
  const buttons = selectedLayoutBlock.buttons ?? [];

  return (
    <div className="builder-inspector-stack">
      <div className="builder-inspector-section">
        <div className="builder-field-header" style={{ marginBottom: "10px" }}>
          <strong>Buttons List</strong>
          <small>{buttons.length} button{buttons.length === 1 ? "" : "s"}</small>
        </div>

        <button
          type="button"
          className="builder-inline-add builder-full-button"
          onClick={() => addSelectedLayoutBlockButton(itemIndex, blockIndex)}
          style={{ marginBottom: "12px" }}
        >
          <Plus size={15} />
          Add button
        </button>

        <div className="builder-repeatable-tabs">
          {buttons.map((btn, btnIndex) => {
            const btnKey = btn.id ?? `${selectedLayoutBlockKey}-button-${btnIndex}`;
            const isButtonOpen = openNestedCardId === btnKey || (!openNestedCardId && btnIndex === 0);
            
            return (
              <div key={btnKey} className={`builder-nested-card${isButtonOpen ? " is-open" : ""}`}>
                <div className="builder-nested-card-header">
                  <button
                    type="button"
                    className="builder-slide-toggle"
                    onClick={() => setOpenNestedCardId(isButtonOpen ? null : btnKey)}
                  >
                    <span>Button {btnIndex + 1}</span>
                    <small>{btn.label || "Untitled button"}</small>
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteSelectedLayoutBlockButton(itemIndex, blockIndex, btnIndex)}
                    title="Delete button"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                {isButtonOpen && (
                  <div className="builder-nested-card-body">
                    <label className="builder-field">
                      <span>Label</span>
                      <input
                        value={btn.label ?? ""}
                        onChange={(e) =>
                          updateSelectedLayoutBlockButton(itemIndex, blockIndex, btnIndex, { label: e.target.value })
                        }
                      />
                    </label>
                    <label className="builder-field">
                      <span>URL</span>
                      <input
                        value={btn.url ?? ""}
                        onChange={(e) =>
                          updateSelectedLayoutBlockButton(itemIndex, blockIndex, btnIndex, { url: e.target.value })
                        }
                      />
                    </label>
                    <label className="builder-field">
                      <span>Target</span>
                      <select
                        value={btn.target ?? "_self"}
                        onChange={(e) =>
                          updateSelectedLayoutBlockButton(itemIndex, blockIndex, btnIndex, {
                            target: e.target.value as any,
                          })
                        }
                      >
                        <option value="_self">Same tab</option>
                        <option value="_blank">New tab</option>
                      </select>
                    </label>
                    <label className="builder-field">
                      <span>Style</span>
                      <select
                        value={btn.style ?? "primary"}
                        onChange={(e) =>
                          updateSelectedLayoutBlockButton(itemIndex, blockIndex, btnIndex, {
                            style: e.target.value as any,
                          })
                        }
                      >
                        <option value="primary">Solid Primary</option>
                        <option value="secondary">Secondary</option>
                        <option value="outline">Outline</option>
                        <option value="ghost">Ghost</option>
                        <option value="light">Light</option>
                      </select>
                    </label>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
