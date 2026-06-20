"use client";

import React from "react";
import { useInspector } from "../../context/InspectorContext";
import {
  builderRowLayoutPresets,
  getBuilderRowLayoutPreset,
  getBuilderRowLayoutSummary,
} from "@/components/dashboard/builderLayoutPresets";

export default function RowLayoutPanel() {
  const {
    selectedLayoutRow,
    applySelectedRowLayoutPreset,
  } = useInspector();

  if (!selectedLayoutRow) return null;

  const selectedRowLayoutPreset = getBuilderRowLayoutPreset(
    selectedLayoutRow.layoutKey ?? null,
  );
  const selectedRowLayoutSummary = getBuilderRowLayoutSummary(
    selectedLayoutRow.layoutKey ?? null,
    selectedLayoutRow.items.length ?? null,
  );

  return (
    <div className="builder-inspector-stack">
      <div className="builder-inspector-section">
        <label className="builder-field">
          <span>Current Layout</span>
          <input value={selectedRowLayoutSummary} readOnly />
          <small>
            {selectedRowLayoutPreset ? "Chosen row preset" : "Custom or legacy row"}
          </small>
        </label>

        <div className="builder-layout-picker-grid is-inline" style={{ marginTop: "10px" }}>
          {builderRowLayoutPresets.map((preset) => {
            const isActive = selectedRowLayoutPreset?.key === preset.key;
            return (
              <button
                key={preset.key}
                type="button"
                className={`builder-layout-picker-card ${isActive ? "is-active" : ""}`}
                onClick={() => applySelectedRowLayoutPreset?.(preset.key)}
              >
                <span className="builder-layout-picker-card-copy">
                  <strong>{preset.label}</strong>
                  <small>{preset.description}</small>
                </span>
                <span className="builder-layout-picker-preview" aria-hidden="true">
                  {preset.ratios.map((ratio, index) => (
                    <i key={`${preset.key}-${index}`} style={{ flex: ratio }} />
                  ))}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Row Columns */}
      <div className="builder-inspector-section" style={{ borderTop: "1px solid var(--builder-ui-border)", paddingTop: "14px", marginTop: "14px" }}>
        <div className="builder-field-header" style={{ marginBottom: "10px" }}>
          <strong>Row Columns</strong>
          <small>
            {selectedLayoutRow.items.length} column{selectedLayoutRow.items.length === 1 ? "" : "s"}
          </small>
        </div>
        <div className="builder-compact-column-list">
          {selectedLayoutRow.items.map((item: any, index: number) => (
            <div key={item.id ?? `row-column-${index}`} className="builder-compact-column-row">
              <div>
                <strong>Column {index + 1}</strong>
                <span>{(item.blocks ?? []).length} elements</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
