"use client";

import React from "react";
import { useInspector } from "../../context/InspectorContext";
import AnimationControl from "../../style/AnimationControl";
import StyleTabPanel from "../../style/StyleTabPanel";
import { Save } from "lucide-react";

export default function SectionAdvancedPanel() {
  const {
    selectedSection,
    updateSelected,
    builderJson,
    copied,
    copyJson,
  } = useInspector();

  if (!selectedSection) return null;

  const animation = selectedSection.animation ?? {};

  const updateAnimationTarget = (next: any) => {
    updateSelected({ animation: next });
  };

  const styleTarget = {
    visualStyle: selectedSection.visualStyle,
    typography: selectedSection.typography,
  };

  const updateStyleTarget = (patch: any) => {
    updateSelected(patch);
  };

  return (
    <div className="builder-inspector-stack">
      {/* Scroll Animation */}
      <div className="builder-inspector-section">
        <div className="builder-field-header" style={{ marginBottom: "10px" }}>
          <strong>Scroll Animation</strong>
          <small>Entrance animation on scroll</small>
        </div>
        <AnimationControl
          value={animation}
          onChange={(next) => {
            if (next.preset === "none") {
              next.delayMs = undefined;
              next.pauseUntilComplete = undefined;
            }
            updateAnimationTarget(next);
          }}
          allowPause
          allowScrub
        />
      </div>

      {/* Pinned Demo Scroll Behavior */}
      {selectedSection.kind === "scrollPinnedDemo" && (
        <div className="builder-inspector-section" style={{ borderTop: "1px solid var(--builder-ui-border)", paddingTop: "14px", marginTop: "14px" }}>
          <div className="builder-field-header" style={{ marginBottom: "10px" }}>
            <strong>Scroll Behavior</strong>
            <small>Scroll speed, pin duration, and animation style</small>
          </div>
          
          <label className="builder-field">
            <span>Animation Variant</span>
            <select
              value={selectedSection.carouselSettings?.variant ?? "perfect"}
              onChange={(event) =>
                updateSelected({
                  carouselSettings: {
                    ...(selectedSection.carouselSettings ?? {}),
                    variant: event.target.value,
                  },
                })
              }
            >
              <option value="perfect">Perfect (Stack)</option>
              <option value="fade">Fade</option>
              <option value="slide">Slide</option>
            </select>
          </label>

          <label className="builder-field">
            <span>Scrub Speed</span>
            <div className="builder-range-row" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <input
                type="range"
                min="0.1"
                max="5.0"
                step="0.1"
                style={{ flex: 1 }}
                value={selectedSection.carouselSettings?.scrubSpeed ?? 1.2}
                onChange={(event) =>
                  updateSelected({
                    carouselSettings: {
                      ...(selectedSection.carouselSettings ?? {}),
                      scrubSpeed: Number(event.target.value),
                    },
                  })
                }
              />
              <span style={{ minWidth: "40px", textAlign: "right" }}>
                {(selectedSection.carouselSettings?.scrubSpeed ?? 1.2).toFixed(1)}x
              </span>
            </div>
          </label>

          <label className="builder-field">
            <span>Pin Height Factor</span>
            <div className="builder-range-row" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <input
                type="range"
                min="20"
                max="500"
                step="10"
                style={{ flex: 1 }}
                value={selectedSection.carouselSettings?.pinHeightFactor ?? 100}
                onChange={(event) =>
                  updateSelected({
                    carouselSettings: {
                      ...(selectedSection.carouselSettings ?? {}),
                      pinHeightFactor: Number(event.target.value),
                    },
                  })
                }
              />
              <span style={{ minWidth: "40px", textAlign: "right" }}>
                {selectedSection.carouselSettings?.pinHeightFactor ?? 100}%
              </span>
            </div>
          </label>

          <label className="builder-check" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <input
              type="checkbox"
              checked={selectedSection.carouselSettings?.showNavigation ?? true}
              onChange={(event) =>
                updateSelected({
                  carouselSettings: {
                    ...(selectedSection.carouselSettings ?? {}),
                    showNavigation: event.target.checked,
                  },
                })
              }
            />
            <span>Show Navigation</span>
          </label>
        </div>
      )}

      {/* Advanced Visual Styles (CSS targets, etc.) */}
      <div className="builder-inspector-section" style={{ borderTop: "1px solid var(--builder-ui-border)", paddingTop: "14px", marginTop: "14px" }}>
        <StyleTabPanel
          target={styleTarget}
          showSpacing={false}
          showBackground={false}
          showAppearance={false}
          showLayout={false}
          showTypography={false}
          onChange={updateStyleTarget}
        />
      </div>

      {/* Publishing State */}
      <div className="builder-inspector-section" style={{ borderTop: "1px solid var(--builder-ui-border)", paddingTop: "14px", marginTop: "14px" }}>
        <div className="builder-field-header" style={{ marginBottom: "10px" }}>
          <strong>Publishing State</strong>
        </div>
        <label className="builder-check" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <input
            type="checkbox"
            checked={selectedSection.visible}
            onChange={(event) =>
              updateSelected({ visible: event.target.checked })
            }
          />
          <span>Visible on page</span>
        </label>
      </div>

      {/* Export JSON */}
      <div className="builder-inspector-section" style={{ borderTop: "1px solid var(--builder-ui-border)", paddingTop: "14px", marginTop: "14px" }}>
        <div className="builder-field-header" style={{ marginBottom: "10px" }}>
          <strong>Current JSON</strong>
          <small>Inspect or export current page block data</small>
        </div>
        <div className="builder-json-card" style={{ marginBottom: "10px" }}>
          <pre style={{ maxHeight: "150px", overflow: "auto", fontSize: "10px" }}>
            {builderJson}
          </pre>
        </div>
        <button
          type="button"
          className="builder-secondary-button builder-full-button"
          onClick={copyJson}
        >
          <Save size={16} />
          {copied ? "Copied JSON" : "Export JSON"}
        </button>
      </div>
    </div>
  );
}
