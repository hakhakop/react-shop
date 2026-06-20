"use client";

import React, { useState } from "react";
import { useInspector } from "../../context/InspectorContext";
import { Layers3, Plus, Trash2, X } from "lucide-react";
import {
  builderRowLayoutPresets,
  getBuilderRowLayoutPreset,
  getBuilderRowLayoutSummary,
} from "@/components/dashboard/builderLayoutPresets";
import { InspectorGroupSummary } from "./InspectorSharedControls";
import type {
  SectionBackgroundMode,
  SectionContentMode,
  SectionHeight,
  SectionContentVerticalAlign,
} from "@/components/dashboard/builderTypes";

export default function SectionLayoutPanel() {
  const {
    selectedSection,
    updateSelected,
    sectionLabels,
    getLayoutItemBlocks,
    selectedLayoutColumnKey,
    deleteSelectedLayoutItem,
    addSelectedLayoutItem,
    applyLayoutPreset,
    selectedSectionIsFirstVisible,
  } = useInspector();

  const [isLayoutPickerOpen, setLayoutPickerOpen] = useState(false);
  const [sectionStructureOpen, setSectionStructureOpen] = useState(true);

  if (!selectedSection) return null;

  const isLayoutContainer =
    selectedSection.kind === "contentLayout" ||
    selectedSection.kind === "scrollPinnedDemo";

  const currentRowLayoutPreset = getBuilderRowLayoutPreset(
    selectedSection.layout ?? null,
  );
  const currentRowLayoutSummary = getBuilderRowLayoutSummary(
    selectedSection.layout ?? null,
    selectedSection.layoutColumns ?? null,
  );

  return (
    <div className="builder-inspector-stack">
      {/* Widths & Heights */}
      <div className="builder-inspector-section">
        <label className="builder-field">
          <span>Background Width</span>
          <select
            value={selectedSection.backgroundMode ?? "full"}
            onChange={(event) =>
              updateSelected({
                backgroundMode: event.target.value as SectionBackgroundMode,
              })
            }
          >
            <option value="full">Full width</option>
            <option value="boxed">Boxed</option>
          </select>
        </label>

        <label className="builder-field">
          <span>Content Width</span>
          <select
            value={selectedSection.contentMode ?? "boxed"}
            onChange={(event) =>
              updateSelected({
                contentMode: event.target.value as SectionContentMode,
              })
            }
          >
            <option value="full">Full</option>
            <option value="boxed">Boxed</option>
            <option value="narrow">Narrow</option>
          </select>
        </label>

        <div className="builder-two-column">
          <label className="builder-field">
            <span>Section Height</span>
            <select
              value={selectedSection.sectionHeight ?? "auto"}
              onChange={(event) =>
                updateSelected({
                  sectionHeight: event.target.value as SectionHeight,
                })
              }
            >
              <option value="auto">Auto</option>
              <option value="viewport">Viewport (100svh)</option>
              <option value="viewport-80">Viewport -20% (80svh)</option>
            </select>
          </label>

          <label className="builder-field">
            <span>Vertical Alignment</span>
            <select
              value={selectedSection.contentVerticalAlign ?? "top"}
              onChange={(event) =>
                updateSelected({
                  contentVerticalAlign: event.target.value as SectionContentVerticalAlign,
                })
              }
            >
              <option value="top">Top</option>
              <option value="center">Center</option>
              <option value="bottom">Bottom</option>
            </select>
            <small>Applies when the section has extra height.</small>
          </label>
        </div>

        <label className="builder-check">
          <input
            type="checkbox"
            checked={selectedSection.pullUnderHeader ?? false}
            disabled={!selectedSectionIsFirstVisible}
            onChange={(event) =>
              updateSelected({
                pullUnderHeader: event.target.checked,
              })
            }
          />
          <span>Pull underneath header</span>
          <small>
            {selectedSectionIsFirstVisible
              ? "Start this section behind a transparent header."
              : "Available when this is the first visible section."}
          </small>
        </label>
      </div>

      {/* Grid structure (for contentLayout / scrollPinnedDemo) */}
      {isLayoutContainer && (
        <div className="builder-inspector-section" style={{ borderTop: "1px solid var(--builder-ui-border)", paddingTop: "14px", marginTop: "14px" }}>
          <div className="builder-field-header" style={{ marginBottom: "10px" }}>
            <strong>Section Layout Grid</strong>
            <small>{sectionLabels[selectedSection.kind]}</small>
          </div>

          <label className="builder-field">
            <span>Current Row Layout</span>
            <input value={currentRowLayoutSummary} readOnly />
            <small>
              {currentRowLayoutPreset ? "Chosen preset" : "Custom or manual column count"}
            </small>
          </label>

          <label className="builder-field">
            <span>Layout Columns</span>
            <select
              value={selectedSection.layoutColumns ?? 2}
              onChange={(event) =>
                updateSelected({
                  layoutColumns: Number(event.target.value),
                  layout: undefined,
                })
              }
            >
              <option value={1}>Full width</option>
              <option value={2}>2 columns</option>
              <option value={3}>3 columns</option>
              <option value={4}>4 columns</option>
              <option value={5}>5 columns</option>
              <option value={6}>6 columns</option>
            </select>
          </label>

          <button
            type="button"
            className="builder-inline-add builder-full-button"
            onClick={() => setLayoutPickerOpen(true)}
            style={{ marginBottom: "12px" }}
          >
            <Layers3 size={15} />
            Choose row layout preset
          </button>

          <details
            className="builder-collapse builder-structure-summary"
            open={sectionStructureOpen}
            onToggle={(event) =>
              setSectionStructureOpen(
                (event.currentTarget as HTMLDetailsElement).open,
              )
            }
          >
            <summary>
              <span>Columns</span>
              <small>{selectedSection.layoutItems?.length ?? 0}</small>
            </summary>
            <div className="builder-structure-note">
              Select an element in the canvas to edit it. This area only manages the section grid itself.
            </div>
            <button
              type="button"
              className="builder-inline-add"
              onClick={addSelectedLayoutItem}
              style={{ marginTop: "8px" }}
            >
              <Plus size={15} />
              Add column
            </button>
            <div className="builder-compact-column-list">
              {(selectedSection.layoutItems ?? []).map((item, index) => {
                const itemKey = item.id ?? `layout-item-${index}`;
                const blocks = getLayoutItemBlocks(item);
                return (
                  <div
                    key={itemKey}
                    className={`builder-compact-column-row ${
                      selectedLayoutColumnKey === itemKey ? "is-selected" : ""
                    }`}
                  >
                    <div>
                      <strong>Column {index + 1}</strong>
                      <span>{blocks.length} elements</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => deleteSelectedLayoutItem(index)}
                      title="Delete column"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                );
              })}
            </div>
          </details>
        </div>
      )}

      {/* Row Layout picker modal inline overlay */}
      {isLayoutPickerOpen && isLayoutContainer && (
        <div
          className="builder-layout-modal"
          role="dialog"
          aria-modal="true"
          onClick={() => setLayoutPickerOpen(false)}
          style={{ zIndex: 1000 }}
        >
          <div
            className="builder-layout-dialog"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="builder-layout-header">
              <div>
                <strong>Choose row layout</strong>
                <span>Pick a preset. Existing blocks stay in place if columns are reduced.</span>
              </div>
              <button
                type="button"
                className="builder-layout-close"
                onClick={() => setLayoutPickerOpen(false)}
                aria-label="Close"
              >
                <X size={15} />
              </button>
            </div>

            <div className="builder-layout-picker-grid">
              {builderRowLayoutPresets.map((preset) => {
                const isActive = currentRowLayoutPreset?.key === preset.key;
                return (
                  <button
                    key={preset.key}
                    type="button"
                    className={`builder-layout-picker-card ${isActive ? "is-active" : ""}`}
                    onClick={() => {
                      applyLayoutPreset(selectedSection.id, preset.key);
                      setLayoutPickerOpen(false);
                    }}
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
        </div>
      )}
    </div>
  );
}
