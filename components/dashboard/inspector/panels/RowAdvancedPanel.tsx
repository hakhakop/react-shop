"use client";

import React from "react";
import { useInspector } from "../../context/InspectorContext";
import AnimationControl from "../../style/AnimationControl";
import StyleTabPanel from "../../style/StyleTabPanel";
import type { BuilderVisualStyle } from "@/components/dashboard/builderTypes";

export default function RowAdvancedPanel() {
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
      {/* Row Animation */}
      <div className="builder-inspector-section">
        <div className="builder-field-header" style={{ marginBottom: "10px" }}>
          <strong>Row Animation</strong>
          <small>Configure this row's entrance animation</small>
        </div>
        <AnimationControl
          value={selectedRowItem?.rowAnimation}
          onChange={(rowAnimation) => onUpdateRowStyle?.({ rowAnimation })}
        />
      </div>

      {/* Row Advanced Visual Styles */}
      <div className="builder-inspector-section" style={{ borderTop: "1px solid var(--builder-ui-border)", paddingTop: "14px", marginTop: "14px" }}>
        <StyleTabPanel
          target={{ visualStyle: selectedRowItem?.rowVisualStyle }}
          showSpacing={false}
          showBackground={false}
          showAppearance={false}
          showLayout={false}
          showTypography={false}
          onChange={(patch) => updateRowVisualStyle(patch.visualStyle ?? {})}
        />
      </div>
    </div>
  );
}
