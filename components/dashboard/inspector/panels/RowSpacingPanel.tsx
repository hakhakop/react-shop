"use client";

import React from "react";
import { useInspector } from "../../context/InspectorContext";
import { SpacingControl } from "./InspectorSharedControls";
import { resolveBuilderSpacing } from "@/lib/builderSpacing";

export default function RowSpacingPanel() {
  const {
    selectedLayoutRow,
    onUpdateRowStyle,
    shellSettings,
    onOpenGlobalSpacingSettings,
  } = useInspector();

  if (!selectedLayoutRow) return null;

  const selectedRowItem = selectedLayoutRow.items[0];

  return (
    <div className="builder-inspector-stack">
      <div className="builder-inspector-section">
        <div className="builder-two-column">
          <SpacingControl
            id="spacing-row-rowTopSpacing"
            label="Top Padding"
            value={selectedRowItem?.rowTopSpacing}
            context="rowPadding"
            inheritedValue={shellSettings.rowPaddingTop}
            onChange={(val) => onUpdateRowStyle?.({ rowTopSpacing: val })}
          />
          <SpacingControl
            id="spacing-row-rowBottomSpacing"
            label="Bottom Padding"
            value={selectedRowItem?.rowBottomSpacing}
            context="rowPadding"
            inheritedValue={shellSettings.rowPaddingBottom}
            onChange={(val) => onUpdateRowStyle?.({ rowBottomSpacing: val })}
          />
        </div>

        <div className="builder-two-column">
          <SpacingControl
            id="spacing-row-rowTopMargin"
            label="Top Margin"
            value={selectedRowItem?.rowTopMargin}
            context="rowMargin"
            inheritedValue={shellSettings.rowMarginTop}
            onChange={(val) => onUpdateRowStyle?.({ rowTopMargin: val })}
          />
          <SpacingControl
            id="spacing-row-rowBottomMargin"
            label="Bottom Margin"
            value={selectedRowItem?.rowBottomMargin}
            context="rowMargin"
            inheritedValue={shellSettings.rowMarginBottom}
            onChange={(val) => onUpdateRowStyle?.({ rowBottomMargin: val })}
          />
        </div>

        <div className="builder-shell-note" style={{ marginTop: "12px", fontSize: "11px", color: "var(--builder-ui-muted)" }}>
          <strong>Row Gap</strong>:{" "}
          <span>
            {resolveBuilderSpacing(undefined, "rowGap", shellSettings.rowGap).label} · Global
          </span>
        </div>

        {onOpenGlobalSpacingSettings && (
          <button
            type="button"
            className="builder-secondary-button builder-full-button"
            onClick={() => onOpenGlobalSpacingSettings("row")}
            style={{ marginTop: "14px" }}
          >
            Edit global row spacing
          </button>
        )}
      </div>
    </div>
  );
}
