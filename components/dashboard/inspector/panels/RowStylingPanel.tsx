"use client";

import React from "react";
import { useInspector } from "../../context/InspectorContext";
import StyleTabPanel from "../../style/StyleTabPanel";
import type { SectionColorScheme, BuilderVisualStyle } from "@/components/dashboard/builderTypes";

export default function RowStylingPanel() {
  const {
    selectedLayoutRow,
    onUpdateRowStyle,
  } = useInspector();

  if (!selectedLayoutRow) return null;

  const selectedRowItem = selectedLayoutRow.items[0];

  const updateRowVisualStyle = (patch: Partial<BuilderVisualStyle>) => {
    onUpdateRowStyle?.({
      rowVisualStyle: {
        ...((selectedRowItem?.rowVisualStyle as BuilderVisualStyle | undefined) ?? {}),
        ...patch,
      },
    });
  };

  return (
    <div className="builder-inspector-stack">
      {/* Row Surface Background */}
      <div className="builder-inspector-section">
        <div className="builder-field-header" style={{ marginBottom: "10px" }}>
          <strong>Row Surface</strong>
          <small>{selectedRowItem?.rowColorScheme ?? "inherit"}</small>
        </div>

        <label className="builder-field">
          <span>Background</span>
          <div className="builder-color-row">
            <input
              type="color"
              value={
                selectedRowItem?.rowBackground?.startsWith("#")
                  ? selectedRowItem.rowBackground
                  : "#ffffff"
              }
              onChange={(event) =>
                onUpdateRowStyle?.({ rowBackground: event.target.value })
              }
            />
            <input
              value={selectedRowItem?.rowBackground ?? ""}
              placeholder="Transparent or CSS color"
              onChange={(event) =>
                onUpdateRowStyle?.({ rowBackground: event.target.value })
              }
            />
          </div>
        </label>

        <div className="builder-two-column">
          <label className="builder-field">
            <span>Color Mode</span>
            <select
              value={selectedRowItem?.rowColorScheme ?? "inherit"}
              onChange={(event) =>
                onUpdateRowStyle?.({
                  rowColorScheme: event.target.value as SectionColorScheme,
                })
              }
            >
              <option value="inherit">Auto by background</option>
              <option value="light">Dark text</option>
              <option value="dark">Light text</option>
            </select>
          </label>

          <label className="builder-field">
            <span>Border Radius</span>
            <input
              type="number"
              min={0}
              max={100}
              value={selectedRowItem?.rowBorderRadius ?? 0}
              onChange={(event) =>
                onUpdateRowStyle?.({
                  rowBorderRadius: Number(event.target.value),
                })
              }
            />
          </label>
        </div>
      </div>

      {/* Row Border / Effects Visual Styles */}
      <div className="builder-inspector-section" style={{ borderTop: "1px solid var(--builder-ui-border)", paddingTop: "14px", marginTop: "14px" }}>
        <StyleTabPanel
          target={{ visualStyle: selectedRowItem?.rowVisualStyle }}
          showSpacing={false}
          showBackground={false}
          showAppearance={false}
          showLayout={false}
          showAdvanced={false}
          showTypography={false}
          onChange={(patch) => updateRowVisualStyle(patch.visualStyle ?? {})}
        />
      </div>
    </div>
  );
}
