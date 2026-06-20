"use client";

import React from "react";
import { useInspector } from "../../context/InspectorContext";
import StyleTabPanel from "../../style/StyleTabPanel";
import { InspectorGroupSummary } from "./InspectorSharedControls";
import type { SectionColorScheme } from "@/components/dashboard/builderTypes";

export default function SectionStylingPanel() {
  const {
    selectedSection,
    updateSelected,
    sectionBackgroundPresets,
    sectionColorModeLabel,
    openWordPressMediaPicker,
  } = useInspector();

  if (!selectedSection) return null;

  const styleTarget = {
    visualStyle: selectedSection.visualStyle,
    typography: selectedSection.typography,
  };

  const updateStyleTarget = (patch: any) => {
    updateSelected(patch);
  };

  const pickStyleBackgroundImage = () => {
    const currentUrl = selectedSection.visualStyle?.background?.imageUrl;
    openWordPressMediaPicker({
      title: "Background image",
      currentUrl,
      onSelect: (media) => {
        const nextBackground = {
          ...(selectedSection.visualStyle?.background ?? {}),
          type: "image" as const,
          imageUrl: media.sourceUrl,
        };
        updateStyleTarget({
          visualStyle: {
            ...(selectedSection.visualStyle ?? {}),
            background: nextBackground,
          },
        });
      },
    });
  };

  return (
    <div className="builder-inspector-stack">
      {/* Background Presets */}
      <div className="builder-inspector-section">
        <div className="builder-field-header" style={{ marginBottom: "10px" }}>
          <strong>Section Background</strong>
          <small>{selectedSection.backgroundMode ?? "full"}</small>
        </div>

        <label className="builder-field">
          <span>Background Preset</span>
          <div className="builder-background-presets">
            {sectionBackgroundPresets.map((preset) => (
              <button
                key={preset.value}
                type="button"
                className={
                  selectedSection.background?.toLowerCase() === preset.value.toLowerCase()
                    ? "is-active"
                    : ""
                }
                onClick={() =>
                  updateSelected({
                    background: preset.value,
                    colorScheme: "inherit",
                  })
                }
                title={preset.label}
              >
                <span style={{ background: preset.value }} />
                {preset.label}
              </button>
            ))}
          </div>
          
          <div className="builder-color-row" style={{ marginTop: "12px" }}>
            <input
              type="color"
              value={selectedSection.background || "#ffffff"}
              onChange={(event) =>
                updateSelected({
                  background: event.target.value,
                  colorScheme: "inherit",
                })
              }
            />
            <input
              value={selectedSection.background || ""}
              onChange={(event) =>
                updateSelected({
                  background: event.target.value,
                  colorScheme: "inherit",
                })
              }
              placeholder="#ffffff"
            />
          </div>
        </label>
      </div>

      {/* Canvas Effects */}
      <div className="builder-inspector-section" style={{ borderTop: "1px solid var(--builder-ui-border)", paddingTop: "14px", marginTop: "14px" }}>
        <div className="builder-field-header" style={{ marginBottom: "10px" }}>
          <strong>Background Effect</strong>
          <small>{selectedSection.backgroundEffect ?? "none"}</small>
        </div>

        <label className="builder-field">
          <span>Effect Type</span>
          <select
            value={selectedSection.backgroundEffect ?? "none"}
            onChange={(event) =>
              updateSelected({
                backgroundEffect: event.target.value,
              })
            }
          >
            <option value="none">No animated effect</option>
            <option value="antigravity">Antigravity Particle & Grid Canvas</option>
            <option value="antigravity2">Antigravity 2 (Floating Pill Sphere)</option>
            <option value="aurora">Aurora Mesh Gradient Glow</option>
            <option value="constellation">Interactive Starfield Constellations</option>
            <option value="waves">Animated Sine Wave Ripples</option>
            <option value="flowfield">Vector Flow Field Particles</option>
            <option value="webgl_waves">WebGL 3D Wave Terrain</option>
            <option value="webgl_flowfield">WebGL Particle Flow Storm</option>
            <option value="webgl_cybergrid">WebGL Cyber Grid (Tron)</option>
            <option value="webgl_fluid">WebGL Interactive Fluid</option>
          </select>
        </label>

        {selectedSection.backgroundEffect && selectedSection.backgroundEffect !== "none" && (
          <div
            className="builder-effect-settings-subpanel"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              padding: "10px 0",
            }}
          >
            <label className="builder-field">
              <span>Animation Speed</span>
              <div className="builder-range-row" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <input
                  type="range"
                  min="0.1"
                  max="5.0"
                  step="0.1"
                  style={{ flex: 1 }}
                  value={selectedSection.antigravitySpeed ?? 1.0}
                  onChange={(event) =>
                    updateSelected({
                      antigravitySpeed: Number(event.target.value),
                    })
                  }
                />
                <span style={{ minWidth: "40px", textAlign: "right" }}>
                  {(selectedSection.antigravitySpeed ?? 1.0).toFixed(1)}x
                </span>
              </div>
            </label>

            {(selectedSection.backgroundEffect === "antigravity" ||
              selectedSection.backgroundEffect === "antigravity2" ||
              selectedSection.backgroundEffect === "constellation" ||
              selectedSection.backgroundEffect === "flowfield" ||
              selectedSection.backgroundEffect === "webgl_flowfield") && (
              <label className="builder-field">
                <span>Particle Count</span>
                <div className="builder-range-row" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <input
                    type="range"
                    min="0"
                    max="300"
                    step="5"
                    style={{ flex: 1 }}
                    value={selectedSection.antigravityParticleCount ?? 40}
                    onChange={(event) =>
                      updateSelected({
                        antigravityParticleCount: Number(event.target.value),
                      })
                    }
                  />
                  <span style={{ minWidth: "40px", textAlign: "right" }}>
                    {selectedSection.antigravityParticleCount ?? 40}
                  </span>
                </div>
              </label>
            )}

            <label className="builder-field">
              <span>Glow Intensity</span>
              <div className="builder-range-row" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <input
                  type="range"
                  min="0.0"
                  max="2.0"
                  step="0.1"
                  style={{ flex: 1 }}
                  value={selectedSection.antigravityGlowIntensity ?? 0.4}
                  onChange={(event) =>
                    updateSelected({
                      antigravityGlowIntensity: Number(event.target.value),
                    })
                  }
                />
                <span style={{ minWidth: "40px", textAlign: "right" }}>
                  {(selectedSection.antigravityGlowIntensity ?? 0.4).toFixed(1)}
                </span>
              </div>
            </label>

            {selectedSection.backgroundEffect === "antigravity" && (
              <label className="builder-field">
                <span>Grid Movement Speed</span>
                <div className="builder-range-row" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <input
                    type="range"
                    min="0.0"
                    max="5.0"
                    step="0.1"
                    style={{ flex: 1 }}
                    value={selectedSection.antigravityGridMoveSpeed ?? 1.0}
                    onChange={(event) =>
                      updateSelected({
                        antigravityGridMoveSpeed: Number(event.target.value),
                      })
                    }
                  />
                  <span style={{ minWidth: "40px", textAlign: "right" }}>
                    {(selectedSection.antigravityGridMoveSpeed ?? 1.0).toFixed(1)}x
                  </span>
                </div>
              </label>
            )}

            <label className="builder-field">
              <span>Canvas Effect Color</span>
              <div className="builder-color-row" style={{ display: "flex", gap: "8px" }}>
                <input
                  type="color"
                  value={selectedSection.antigravityColor ?? "#6366f1"}
                  onChange={(event) =>
                    updateSelected({
                      antigravityColor: event.target.value,
                    })
                  }
                />
                <input
                  style={{ flex: 1 }}
                  value={selectedSection.antigravityColor ?? "#6366f1"}
                  onChange={(event) =>
                    updateSelected({
                      antigravityColor: event.target.value,
                    })
                  }
                />
              </div>
            </label>

            {selectedSection.backgroundEffect === "antigravity" && (
              <>
                <label className="builder-field">
                  <span>Grid Density</span>
                  <select
                    value={selectedSection.antigravityGridDensity ?? "normal"}
                    onChange={(event) =>
                      updateSelected({
                        antigravityGridDensity: event.target.value as any,
                      })
                    }
                  >
                    <option value="sparse">Sparse</option>
                    <option value="normal">Normal</option>
                    <option value="compact">Compact</option>
                  </select>
                </label>

                <label className="builder-field">
                  <span>Visual Mode</span>
                  <select
                    value={selectedSection.antigravityVisualMode ?? "full"}
                    onChange={(event) =>
                      updateSelected({
                        antigravityVisualMode: event.target.value as any,
                      })
                    }
                  >
                    <option value="full">Full layout overlays</option>
                    <option value="transparent-grid">Transparent grid lines</option>
                    <option value="no-grid">Rising particles only (No grid)</option>
                    <option value="lines-only">Mesh network lines only (No particles)</option>
                  </select>
                </label>
              </>
            )}

            {(selectedSection.backgroundEffect === "antigravity" ||
              selectedSection.backgroundEffect === "antigravity2" ||
              selectedSection.backgroundEffect === "constellation" ||
              selectedSection.backgroundEffect === "flowfield" ||
              selectedSection.backgroundEffect === "webgl_waves" ||
              selectedSection.backgroundEffect === "webgl_flowfield" ||
              selectedSection.backgroundEffect === "webgl_cybergrid" ||
              selectedSection.backgroundEffect === "webgl_fluid") && (
              <label className="builder-check" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <input
                  type="checkbox"
                  checked={selectedSection.antigravityInteractive !== false}
                  onChange={(event) =>
                    updateSelected({
                      antigravityInteractive: event.target.checked,
                    })
                  }
                />
                <span>Mouse pointer interaction</span>
              </label>
            )}

            {selectedSection.backgroundEffect === "antigravity" && (
              <>
                <label className="builder-check" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <input
                    type="checkbox"
                    checked={selectedSection.antigravityShowGrid !== false}
                    onChange={(event) =>
                      updateSelected({
                        antigravityShowGrid: event.target.checked,
                      })
                    }
                  />
                  <span>Show grid overlay</span>
                </label>

                <label className="builder-check" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <input
                    type="checkbox"
                    checked={selectedSection.antigravityShowParticles !== false}
                    onChange={(event) =>
                      updateSelected({
                        antigravityShowParticles: event.target.checked,
                      })
                    }
                  />
                  <span>Show floating particles</span>
                </label>
              </>
            )}
          </div>
        )}
      </div>

      {/* Color Mode / Contrast */}
      <div className="builder-inspector-section" style={{ borderTop: "1px solid var(--builder-ui-border)", paddingTop: "14px", marginTop: "14px" }}>
        <label className="builder-field">
          <span>Section Color Mode</span>
          <select
            value={selectedSection.colorScheme ?? "inherit"}
            onChange={(event) =>
              updateSelected({
                colorScheme: event.target.value as SectionColorScheme,
              })
            }
          >
            <option value="inherit">Auto by background</option>
            <option value="light">Dark text for light background</option>
            <option value="dark">Light text for dark background</option>
          </select>
        </label>

        <div className="builder-contrast-note" style={{ marginTop: "10px" }}>
          <strong>{sectionColorModeLabel(selectedSection)}</strong>
          <span>
            Auto keeps text readable against this section background. Use Light or Dark only when you want to force the look.
          </span>
        </div>
      </div>

      {/* Standard Style Tab Panel (Borders, Shadow, etc.) */}
      <div className="builder-inspector-section" style={{ borderTop: "1px solid var(--builder-ui-border)", paddingTop: "14px", marginTop: "14px" }}>
        <StyleTabPanel
          target={styleTarget}
          showSpacing={false}
          showLayout={false}
          showAdvanced={false}
          showTypography={false}
          onChange={updateStyleTarget}
          onPickBackgroundImage={pickStyleBackgroundImage}
        />
      </div>
    </div>
  );
}
