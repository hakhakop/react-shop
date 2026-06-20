"use client";

import React from "react";
import { useInspector } from "../../context/InspectorContext";
import RichTextEditor from "../../RichTextEditor";
import { InspectorGroupSummary } from "./InspectorSharedControls";

const GRADIENT_PRESETS: Record<string, [string, string, string]> = {
  "indigo-purple": ["#a5b4fc", "#6366f1", "#a855f7"],
  "cyan-blue": ["#22d3ee", "#06b6d4", "#2563eb"],
  "emerald-teal": ["#34d399", "#10b981", "#0d9488"],
  "sunset-orange": ["#fb923c", "#f97316", "#ec4899"],
  "indigo-purple-cyan": ["#60a5fa", "#818cf8", "#c084fc"],
  "sunset-pink": ["#fb923c", "#ec4899", "#a855f7"],
  "gold-amber": ["#facc15", "#f59e0b", "#f97316"],
};

const getCustomGradientPatch = (
  block: any,
  presetField: "textGradientPreset" | "typewriterGradientPreset",
  change: Record<string, any>
) => {
  const currentPreset = block[presetField] || "none";
  const patch: Record<string, any> = { ...change };
  
  if (currentPreset !== "none" && currentPreset !== "custom") {
    const colors = GRADIENT_PRESETS[currentPreset] || ["#ffffff", "#60a5fa", "#c084fc"];
    
    patch[presetField] = "custom";
    if (change.textGradientCustomStart === undefined) {
      patch.textGradientCustomStart = block.textGradientCustomStart ?? colors[0];
    }
    if (change.textGradientCustomMiddle === undefined) {
      patch.textGradientCustomMiddle = block.textGradientCustomMiddle ?? colors[1];
    }
    if (change.textGradientCustomEnd === undefined) {
      patch.textGradientCustomEnd = block.textGradientCustomEnd ?? colors[2];
    }
    if (change.textGradientCustomStartOffset === undefined) {
      patch.textGradientCustomStartOffset = block.textGradientCustomStartOffset ?? 0;
    }
    if (change.textGradientCustomMiddleOffset === undefined) {
      patch.textGradientCustomMiddleOffset = block.textGradientCustomMiddleOffset ?? 50;
    }
    if (change.textGradientCustomEndOffset === undefined) {
      patch.textGradientCustomEndOffset = block.textGradientCustomEndOffset ?? 100;
    }
    if (change.textGradientCustomAngle === undefined) {
      patch.textGradientCustomAngle = block.textGradientCustomAngle ?? 135;
    }
  }
  
  return patch;
};

export default function TextFieldsPanel() {
  const { selectedLayoutBlock, updateSelectedLayoutBlockByKey } = useInspector();

  if (!selectedLayoutBlock) return null;

  const block = selectedLayoutBlock;

  // Heading Block
  if (block.kind === "heading") {
    const currentPreset = block.textGradientPreset || "none";
    const defaultColors = currentPreset !== "custom" ? (GRADIENT_PRESETS[currentPreset] ?? ["#ffffff", "#60a5fa", "#c084fc"]) : ["#ffffff", "#60a5fa", "#c084fc"];
    const startColor = block.textGradientCustomStart ?? defaultColors[0];
    const middleColor = block.textGradientCustomMiddle ?? defaultColors[1];
    const endColor = block.textGradientCustomEnd ?? defaultColors[2];
    const startOffset = block.textGradientCustomStartOffset ?? 0;
    const middleOffset = block.textGradientCustomMiddleOffset ?? 50;
    const endOffset = block.textGradientCustomEndOffset ?? 100;
    const angle = block.textGradientCustomAngle ?? 135;

    return (
      <div className="builder-inspector-stack">
        <div className="builder-inspector-section">
          <label className="builder-field">
            <span>Heading Text</span>
            <input
              value={block.headingText ?? ""}
              onChange={(event) =>
                updateSelectedLayoutBlockByKey({ headingText: event.target.value })
              }
            />
          </label>

          <label className="builder-field">
            <span>Level</span>
            <select
              value={block.headingLevel ?? "h2"}
              onChange={(event) => {
                const newLevel = event.target.value as "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
                const currentTyp = block.typography ?? {};
                let updatedTyp = { ...currentTyp };
                if ((updatedTyp as any).title) {
                  updatedTyp = {
                    ...updatedTyp,
                    title: {
                      ...((updatedTyp as any).title ?? {}),
                      fontSize: "",
                      fontWeight: "",
                      lineHeight: "",
                    }
                  };
                } else {
                  updatedTyp = {
                    ...updatedTyp,
                    fontSize: "",
                    fontWeight: "",
                    lineHeight: "",
                  };
                }
                updateSelectedLayoutBlockByKey({
                  headingLevel: newLevel,
                  typography: updatedTyp,
                });
              }}
            >
              <option value="h1">H1</option>
              <option value="h2">H2</option>
              <option value="h3">H3</option>
              <option value="h4">H4</option>
              <option value="h5">H5</option>
              <option value="h6">H6</option>
            </select>
          </label>
        </div>

        {/* Heading Gradient */}
        <div className="builder-inspector-section" style={{ borderTop: "1px solid var(--builder-ui-border)", paddingTop: "14px", marginTop: "14px" }}>
          <label className="builder-field">
            <span>Heading Gradient Preset</span>
            <select
              value={block.textGradientPreset ?? "none"}
              onChange={(event) =>
                updateSelectedLayoutBlockByKey({ textGradientPreset: event.target.value as any })
              }
            >
              <option value="none">None (Solid color)</option>
              <option value="indigo-purple">Indigo Purple</option>
              <option value="cyan-blue">Cyan Blue</option>
              <option value="emerald-teal">Emerald Teal</option>
              <option value="sunset-orange">Sunset Orange</option>
              <option value="indigo-purple-cyan">Indigo Purple Cyan</option>
              <option value="sunset-pink">Sunset Pink</option>
              <option value="gold-amber">Gold Amber</option>
              <option value="custom">Custom Gradient</option>
            </select>
          </label>

          {block.textGradientPreset && block.textGradientPreset !== "none" && (
            <div
              className="builder-effect-settings-subpanel"
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                padding: "8px 0",
                borderLeft: "3px solid #6366f1",
                paddingLeft: "8px",
                marginBottom: "12px",
              }}
            >
              <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
                <label className="builder-field" style={{ flex: 1 }}>
                  <span>Start Color</span>
                  <input
                    type="color"
                    value={startColor}
                    onChange={(e) => {
                      const patch = getCustomGradientPatch(block, "textGradientPreset", { textGradientCustomStart: e.target.value });
                      updateSelectedLayoutBlockByKey(patch);
                    }}
                  />
                </label>
                <label className="builder-field" style={{ flex: 1 }}>
                  <span>Middle Color</span>
                  <input
                    type="color"
                    value={middleColor}
                    onChange={(e) => {
                      const patch = getCustomGradientPatch(block, "textGradientPreset", { textGradientCustomMiddle: e.target.value });
                      updateSelectedLayoutBlockByKey(patch);
                    }}
                  />
                </label>
                <label className="builder-field" style={{ flex: 1 }}>
                  <span>End Color</span>
                  <input
                    type="color"
                    value={endColor}
                    onChange={(e) => {
                      const patch = getCustomGradientPatch(block, "textGradientPreset", { textGradientCustomEnd: e.target.value });
                      updateSelectedLayoutBlockByKey(patch);
                    }}
                  />
                </label>
              </div>

              <label className="builder-field">
                <span>Start Color Weight (Offset)</span>
                <div className="builder-range-row" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    style={{ flex: 1 }}
                    value={startOffset}
                    onChange={(e) => {
                      const patch = getCustomGradientPatch(block, "textGradientPreset", { textGradientCustomStartOffset: Number(e.target.value) });
                      updateSelectedLayoutBlockByKey(patch);
                    }}
                  />
                  <span style={{ minWidth: "40px", textAlign: "right" }}>{startOffset}%</span>
                </div>
              </label>

              <label className="builder-field">
                <span>Middle Color Weight (Offset)</span>
                <div className="builder-range-row" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    style={{ flex: 1 }}
                    value={middleOffset}
                    onChange={(e) => {
                      const patch = getCustomGradientPatch(block, "textGradientPreset", { textGradientCustomMiddleOffset: Number(e.target.value) });
                      updateSelectedLayoutBlockByKey(patch);
                    }}
                  />
                  <span style={{ minWidth: "40px", textAlign: "right" }}>{middleOffset}%</span>
                </div>
              </label>

              <label className="builder-field">
                <span>End Color Weight (Offset)</span>
                <div className="builder-range-row" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    style={{ flex: 1 }}
                    value={endOffset}
                    onChange={(e) => {
                      const patch = getCustomGradientPatch(block, "textGradientPreset", { textGradientCustomEndOffset: Number(e.target.value) });
                      updateSelectedLayoutBlockByKey(patch);
                    }}
                  />
                  <span style={{ minWidth: "40px", textAlign: "right" }}>{endOffset}%</span>
                </div>
              </label>

              <label className="builder-field">
                <span>Angle (degrees)</span>
                <div className="builder-range-row" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    step="5"
                    style={{ flex: 1 }}
                    value={angle}
                    onChange={(e) => {
                      const patch = getCustomGradientPatch(block, "textGradientPreset", { textGradientCustomAngle: Number(e.target.value) });
                      updateSelectedLayoutBlockByKey(patch);
                    }}
                  />
                  <span style={{ minWidth: "40px", textAlign: "right" }}>{angle}°</span>
                </div>
              </label>
            </div>
          )}
        </div>

        {/* Typewriter Text Animation */}
        <div className="builder-inspector-section" style={{ borderTop: "1px solid var(--builder-ui-border)", paddingTop: "14px", marginTop: "14px" }}>
          <details className="builder-collapse" open>
            <summary>
              <InspectorGroupSummary
                title="Typewriter Text Animation"
                description="Configure typewriter dynamic cycles on title/body text."
                meta={block.typewriterEnabled ? "enabled" : "disabled"}
              />
            </summary>
            
            <label className="builder-check" style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px", marginTop: "10px" }}>
              <input
                type="checkbox"
                checked={block.typewriterEnabled ?? false}
                onChange={(event) =>
                  updateSelectedLayoutBlockByKey({ typewriterEnabled: event.target.checked })
                }
              />
              <span>Enable Typewriter Animation</span>
            </label>

            {block.typewriterEnabled && (
              <div className="builder-effect-settings-subpanel" style={{ display: "flex", flexDirection: "column", gap: "12px", padding: "10px 0" }}>
                <div className="builder-contrast-note" style={{ fontSize: "12px", padding: "8px", background: "rgba(0,0,0,0.03)", borderRadius: "4px", borderLeft: "3px solid #6366f1" }}>
                  <strong>Bracket format instruction:</strong> Use square brackets with pipe separators to cycle multiple phrases. Example: <code>Build the future with [dynamic animations|interactive particles|typewriter effects|premium aesthetics]</code>
                </div>

                <label className="builder-check" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <input
                    type="checkbox"
                    checked={block.typewriterLoop !== false}
                    onChange={(event) =>
                      updateSelectedLayoutBlockByKey({ typewriterLoop: event.target.checked })
                    }
                  />
                  <span>Loop typing animation</span>
                </label>

                <label className="builder-field">
                  <span>Typing Speed (ms)</span>
                  <div className="builder-range-row" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <input
                      type="range"
                      min="30"
                      max="250"
                      step="5"
                      style={{ flex: 1 }}
                      value={block.typewriterSpeed ?? 80}
                      onChange={(event) =>
                        updateSelectedLayoutBlockByKey({ typewriterSpeed: Number(event.target.value) })
                      }
                    />
                    <span style={{ minWidth: "40px", textAlign: "right" }}>{block.typewriterSpeed ?? 80}ms</span>
                  </div>
                </label>

                <label className="builder-field">
                  <span>Erase Speed (ms)</span>
                  <div className="builder-range-row" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <input
                      type="range"
                      min="10"
                      max="150"
                      step="5"
                      style={{ flex: 1 }}
                      value={block.typewriterEraseSpeed ?? 40}
                      onChange={(event) =>
                        updateSelectedLayoutBlockByKey({ typewriterEraseSpeed: Number(event.target.value) })
                      }
                    />
                    <span style={{ minWidth: "40px", textAlign: "right" }}>{block.typewriterEraseSpeed ?? 40}ms</span>
                  </div>
                </label>

                <label className="builder-field">
                  <span>Pause Delay (ms)</span>
                  <div className="builder-range-row" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <input
                      type="range"
                      min="500"
                      max="5000"
                      step="100"
                      style={{ flex: 1 }}
                      value={block.typewriterDelay ?? 2000}
                      onChange={(event) =>
                        updateSelectedLayoutBlockByKey({ typewriterDelay: Number(event.target.value) })
                      }
                    />
                    <span style={{ minWidth: "50px", textAlign: "right" }}>{block.typewriterDelay ?? 2000}ms</span>
                  </div>
                </label>

                <label className="builder-check" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <input
                    type="checkbox"
                    checked={block.typewriterUseGradient !== false}
                    onChange={(event) =>
                      updateSelectedLayoutBlockByKey({ typewriterUseGradient: event.target.checked })
                    }
                  />
                  <span>Use title gradient for typewriter text</span>
                </label>
              </div>
            )}
          </details>
        </div>
      </div>
    );
  }

  // Text Block
  if (block.kind === "text") {
    return (
      <div className="builder-inspector-stack">
        <div className="builder-inspector-section">
          <label className="builder-field">
            <span>Body Content</span>
            <RichTextEditor
              value={block.body ?? ""}
              onChange={(value) =>
                updateSelectedLayoutBlockByKey({ body: value })
              }
            />
          </label>
        </div>
      </div>
    );
  }

  // Fluent Form Block
  if (block.kind === "fluentForm") {
    return (
      <div className="builder-inspector-stack">
        <div className="builder-inspector-section">
          <label className="builder-field">
            <span>Block Title</span>
            <input
              value={block.title ?? ""}
              onChange={(event) =>
                updateSelectedLayoutBlockByKey({ title: event.target.value })
              }
            />
          </label>
          <label className="builder-field">
            <span>Fluent Form ID</span>
            <input
              inputMode="numeric"
              value={block.fluentFormId ?? ""}
              placeholder="Example: 3"
              onChange={(event) =>
                updateSelectedLayoutBlockByKey({ fluentFormId: event.target.value })
              }
            />
          </label>
          <div className="builder-dynamic-field-note" style={{ marginTop: "12px" }}>
            <strong>WordPress renderer required</strong>
            <span>
              Add the React Shop Fluent Forms snippet in WordPress, then this element can show the real Fluent Form.
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Breadcrumbs, WC product fields, Category filters, or other dynamic elements
  const isDynamicStoreElement =
    block.kind === "categoryFilters" || block.kind === "breadcrumbs";
  const isDynamicProductField = block.kind?.startsWith("product");

  if (isDynamicStoreElement || isDynamicProductField) {
    return (
      <div className="builder-inspector-stack">
        <div className="builder-inspector-section">
          <div className="builder-dynamic-field-note" style={{ marginBottom: "12px" }}>
            <strong>
              {isDynamicStoreElement ? "Dynamic Store Element" : "Dynamic Product Field"}
            </strong>
            <span>
              {isDynamicStoreElement
                ? "This element renders live storefront data in the published page."
                : "This element reads from the current WooCommerce product on the live product page."}
            </span>
          </div>
          
          <label className="builder-field">
            <span>Editor Label</span>
            <input
              value={block.title ?? ""}
              onChange={(event) =>
                updateSelectedLayoutBlockByKey({ title: event.target.value })
              }
            />
          </label>
          
          <label className="builder-field">
            <span>Editor Note</span>
            <textarea
              rows={2}
              value={block.body ?? ""}
              onChange={(event) =>
                updateSelectedLayoutBlockByKey({ body: event.target.value })
              }
            />
          </label>
        </div>
      </div>
    );
  }

  return (
    <div className="builder-empty-state">
      <p>No text fields to edit for this block type.</p>
    </div>
  );
}
