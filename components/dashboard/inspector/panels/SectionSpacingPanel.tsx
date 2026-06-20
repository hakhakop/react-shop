"use client";

import React from "react";
import { useInspector } from "../../context/InspectorContext";
import { SpacingControl } from "./InspectorSharedControls";

export default function SectionSpacingPanel() {
  const {
    selectedSection,
    updateSelected,
    shellSettings,
    onOpenGlobalSpacingSettings,
  } = useInspector();

  if (!selectedSection) return null;

  return (
    <div className="builder-inspector-stack">
      <div className="builder-inspector-section">
        <div className="builder-two-column">
          <SpacingControl
            id="spacing-section-topSpacing"
            label="Top Padding"
            value={selectedSection.topSpacing}
            context="sectionPadding"
            inheritedValue={shellSettings.sectionPaddingTop}
            onChange={(val) => updateSelected({ topSpacing: val })}
          />
          <SpacingControl
            id="spacing-section-bottomSpacing"
            label="Bottom Padding"
            value={selectedSection.bottomSpacing}
            context="sectionPadding"
            inheritedValue={shellSettings.sectionPaddingBottom}
            onChange={(val) => updateSelected({ bottomSpacing: val })}
          />
        </div>

        <div className="builder-two-column">
          <SpacingControl
            id="spacing-section-topMargin"
            label="Top Margin"
            value={selectedSection.topMargin}
            context="sectionMargin"
            inheritedValue={shellSettings.sectionMarginTop}
            onChange={(val) => updateSelected({ topMargin: val })}
          />
          <SpacingControl
            id="spacing-section-bottomMargin"
            label="Bottom Margin"
            value={selectedSection.bottomMargin}
            context="sectionMargin"
            inheritedValue={shellSettings.sectionMarginBottom}
            onChange={(val) => updateSelected({ bottomMargin: val })}
          />
        </div>

        {onOpenGlobalSpacingSettings && (
          <button
            type="button"
            className="builder-secondary-button builder-full-button"
            onClick={() => onOpenGlobalSpacingSettings("section")}
            style={{ marginTop: "14px" }}
          >
            Edit global spacing defaults
          </button>
        )}
      </div>
    </div>
  );
}
