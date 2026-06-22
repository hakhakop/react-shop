"use client";

import React from "react";
import { useInspector } from "../../context/InspectorContext";
import {
  BUILDER_BUTTON_PRESETS,
  buttonColorInputValue,
  builderButtonPresetFields,
  clearBuilderButtonOverrides,
  getBuilderButtonPresetKey,
  hasLocalButtonStyles,
} from "@/lib/builderButtons";

export default function ButtonStyleOverridesPanel() {
  const {
    selectedLayoutBlock,
    updateSelectedLayoutBlockByKey,
    getSelectedBlockIndices,
    updateSelectedLayoutBlock,
  } = useInspector();

  if (!selectedLayoutBlock) return null;

  const block = selectedLayoutBlock;
  const indices = getSelectedBlockIndices();
  if (!indices) return null;

  const { itemIndex, blockIndex } = indices;

  const activePreset = hasLocalButtonStyles(block)
    ? getBuilderButtonPresetKey(block)
    : "inherit";

  const handleUpdate = (patch: any) => {
    updateSelectedLayoutBlock(itemIndex, blockIndex, patch);
  };

  return (
    <div className="builder-inspector-stack">
      {/* Preset Selector */}
      <div className="builder-inspector-section">
        <div className="builder-field-header" style={{ marginBottom: "10px" }}>
          <strong>Button Style Override</strong>
          <small>{hasLocalButtonStyles(block) ? "Local style active" : "Inherits global button"}</small>
        </div>

        <div className="builder-header-presets-grid">
          <button
            type="button"
            className={`builder-preset-btn${!hasLocalButtonStyles(block) ? " is-active" : ""}`}
            onClick={() => handleUpdate(clearBuilderButtonOverrides())}
          >
            <span>Inherit Global</span>
            <small>Use Global Styles Button tab</small>
          </button>
          {BUILDER_BUTTON_PRESETS.map((preset) => (
            <button
              key={preset.key}
              type="button"
              className={`builder-preset-btn${activePreset === preset.key ? " is-active" : ""}`}
              onClick={() => handleUpdate(builderButtonPresetFields(preset.key))}
            >
              <span>{preset.label}</span>
              <small>{preset.description}</small>
            </button>
          ))}
        </div>
      </div>

      {/* Spacing & Sizing overrides */}
      <div className="builder-inspector-section" style={{ borderTop: "1px solid var(--builder-ui-border)", paddingTop: "14px", marginTop: "14px" }}>
        <div className="builder-field-header" style={{ marginBottom: "10px" }}>
          <strong>Button Group & Spacing</strong>
        </div>

        <label className="builder-field">
          <span>Button Gap</span>
          <select
            value={block.buttonGap ?? "0.75rem"}
            onChange={(event) =>
              handleUpdate({
                buttonGap: event.target.value === "0.75rem" ? undefined : event.target.value,
              })
            }
          >
            <option value="0.25rem">Touching</option>
            <option value="0.5rem">Tight</option>
            <option value="0.75rem">Default</option>
            <option value="1.5rem">Comfortable</option>
            <option value="3rem">Spacious</option>
            <option value="5rem">Wide</option>
            <option value="8rem">Separated</option>
          </select>
        </label>

        <div className="builder-two-column">
          <label className="builder-field">
            <span>Padding Y (vertical)</span>
            <input
              type="text"
              value={block.buttonPaddingY || ""}
              onChange={(event) =>
                handleUpdate({
                  buttonPaddingY: event.target.value || undefined,
                })
              }
              placeholder="e.g. 11px (or inherit)"
            />
          </label>

          <label className="builder-field">
            <span>Padding X (horizontal)</span>
            <input
              type="text"
              value={block.buttonPaddingX || ""}
              onChange={(event) =>
                handleUpdate({
                  buttonPaddingX: event.target.value || undefined,
                })
              }
              placeholder="e.g. 18px (or inherit)"
            />
          </label>
        </div>
      </div>

      {/* Custom Colors & Borders */}
      <div className="builder-inspector-section" style={{ borderTop: "1px solid var(--builder-ui-border)", paddingTop: "14px", marginTop: "14px" }}>
        <div className="builder-field-header" style={{ marginBottom: "10px" }}>
          <strong>Custom Colors & Borders</strong>
        </div>

        <div className="builder-two-column">
          <label className="builder-field">
            <span>Background</span>
            <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
              <input
                type="color"
                value={buttonColorInputValue(block.buttonBg, "#111111")}
                onChange={(event) =>
                  handleUpdate({
                    buttonBg: event.target.value,
                  })
                }
                disabled={!block.buttonBg}
              />
              <label className="builder-check" style={{ margin: 0 }}>
                <input
                  type="checkbox"
                  checked={!!block.buttonBg}
                  onChange={(event) =>
                    handleUpdate({
                      buttonBg: event.target.checked ? "#111111" : undefined,
                    })
                  }
                />
                <span style={{ fontSize: "11px" }}>Custom</span>
              </label>
            </div>
          </label>

          <label className="builder-field">
            <span>Text Color</span>
            <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
              <input
                type="color"
                value={buttonColorInputValue(block.buttonTextColor, "#ffffff")}
                onChange={(event) =>
                  handleUpdate({
                    buttonTextColor: event.target.value,
                  })
                }
                disabled={!block.buttonTextColor}
              />
              <label className="builder-check" style={{ margin: 0 }}>
                <input
                  type="checkbox"
                  checked={!!block.buttonTextColor}
                  onChange={(event) =>
                    handleUpdate({
                      buttonTextColor: event.target.checked ? "#ffffff" : undefined,
                    })
                  }
                />
                <span style={{ fontSize: "11px" }}>Custom</span>
              </label>
            </div>
          </label>
        </div>

        <div className="builder-two-column">
          <label className="builder-field">
            <span>Border Radius</span>
            <select
              value={
                block.buttonBorderRadius === undefined
                  ? "inherit"
                  : ["0px", "4px", "8px", "12px", "16px", "999px"].includes(block.buttonBorderRadius)
                    ? block.buttonBorderRadius
                    : "custom"
              }
              onChange={(event) => {
                const val = event.target.value;
                if (val === "inherit") {
                  handleUpdate({ buttonBorderRadius: undefined });
                } else if (val === "custom") {
                  handleUpdate({ buttonBorderRadius: "10px" });
                } else {
                  handleUpdate({ buttonBorderRadius: val });
                }
              }}
            >
              <option value="inherit">Inherit global</option>
              <option value="0px">Flat (0px)</option>
              <option value="4px">Small (4px)</option>
              <option value="8px">Medium (8px)</option>
              <option value="12px">Rounded (12px)</option>
              <option value="16px">Large (16px)</option>
              <option value="999px">Pill (999px)</option>
              <option value="custom">Custom...</option>
            </select>
          </label>

          <label className="builder-field">
            <span>Border Width</span>
            <select
              value={
                block.buttonBorderWidth === undefined
                  ? "inherit"
                  : ["0px", "1px", "2px", "3px", "4px"].includes(block.buttonBorderWidth)
                    ? block.buttonBorderWidth
                    : "custom"
              }
              onChange={(event) => {
                const val = event.target.value;
                if (val === "inherit") {
                  handleUpdate({ buttonBorderWidth: undefined });
                } else if (val === "custom") {
                  handleUpdate({ buttonBorderWidth: "1.5px" });
                } else {
                  handleUpdate({ buttonBorderWidth: val });
                }
              }}
            >
              <option value="inherit">Inherit global</option>
              <option value="0px">None (0px)</option>
              <option value="1px">Thin (1px)</option>
              <option value="2px">Medium (2px)</option>
              <option value="3px">Thick (3px)</option>
              <option value="custom">Custom...</option>
            </select>
          </label>
        </div>

        {block.buttonBorderRadius !== undefined && !["0px", "4px", "8px", "12px", "16px", "999px"].includes(block.buttonBorderRadius) && (
          <label className="builder-field">
            <span>Custom Border Radius (px/rem)</span>
            <input
              type="text"
              value={block.buttonBorderRadius}
              onChange={(event) =>
                handleUpdate({
                  buttonBorderRadius: event.target.value,
                })
              }
            />
          </label>
        )}

        {block.buttonBorderWidth !== undefined && !["0px", "1px", "2px", "3px", "4px"].includes(block.buttonBorderWidth) && (
          <label className="builder-field">
            <span>Custom Border Width (px/rem)</span>
            <input
              type="text"
              value={block.buttonBorderWidth}
              onChange={(event) =>
                handleUpdate({
                  buttonBorderWidth: event.target.value,
                })
              }
            />
          </label>
        )}

        <label className="builder-field">
          <span>Border Color</span>
          <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
            <input
              type="color"
              value={buttonColorInputValue(block.buttonBorderColor, "#111111")}
              onChange={(event) =>
                handleUpdate({
                  buttonBorderColor: event.target.value,
                })
              }
              disabled={!block.buttonBorderColor}
            />
            <label className="builder-check" style={{ margin: 0 }}>
              <input
                type="checkbox"
                checked={!!block.buttonBorderColor}
                onChange={(event) =>
                  handleUpdate({
                    buttonBorderColor: event.target.checked ? "#111111" : undefined,
                  })
                }
              />
              <span style={{ fontSize: "11px" }}>Custom</span>
            </label>
          </div>
        </label>
      </div>

      {/* Font typography overrides */}
      <div className="builder-inspector-section" style={{ borderTop: "1px solid var(--builder-ui-border)", paddingTop: "14px", marginTop: "14px" }}>
        <div className="builder-field-header" style={{ marginBottom: "10px" }}>
          <strong>Font styling overrides</strong>
        </div>

        <div className="builder-two-column">
          <label className="builder-field">
            <span>Font Weight</span>
            <select
              value={block.buttonFontWeight || "inherit"}
              onChange={(event) =>
                handleUpdate({
                  buttonFontWeight: event.target.value === "inherit" ? undefined : event.target.value,
                })
              }
            >
              <option value="inherit">Inherit global</option>
              <option value="400">Normal (400)</option>
              <option value="500">Medium (500)</option>
              <option value="600">Semibold (600)</option>
              <option value="700">Bold (700)</option>
              <option value="720">Heavy (720)</option>
              <option value="800">Extra Bold (800)</option>
            </select>
          </label>

          <label className="builder-field">
            <span>Letter Spacing</span>
            <select
              value={block.buttonLetterSpacing || "inherit"}
              onChange={(event) =>
                handleUpdate({
                  buttonLetterSpacing: event.target.value === "inherit" ? undefined : event.target.value,
                })
              }
            >
              <option value="inherit">Inherit global</option>
              <option value="0px">None (0px)</option>
              <option value="0.02em">Tight (0.02em)</option>
              <option value="0.05em">Medium (0.05em)</option>
              <option value="0.1em">Wide (0.1em)</option>
            </select>
          </label>
        </div>
      </div>

      {/* Hover overrides */}
      <div className="builder-inspector-section" style={{ borderTop: "1px solid var(--builder-ui-border)", paddingTop: "14px", marginTop: "14px" }}>
        <div className="builder-field-header" style={{ marginBottom: "10px" }}>
          <strong>Hover Overrides</strong>
        </div>

        <div className="builder-two-column">
          <label className="builder-field">
            <span>Hover Background</span>
            <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
              <input
                type="color"
                value={buttonColorInputValue(block.buttonHoverBg, "#111111")}
                onChange={(event) =>
                  handleUpdate({
                    buttonHoverBg: event.target.value,
                  })
                }
                disabled={!block.buttonHoverBg}
              />
              <label className="builder-check" style={{ margin: 0 }}>
                <input
                  type="checkbox"
                  checked={!!block.buttonHoverBg}
                  onChange={(event) =>
                    handleUpdate({
                      buttonHoverBg: event.target.checked ? "#111111" : undefined,
                    })
                  }
                />
                <span style={{ fontSize: "11px" }}>Custom</span>
              </label>
            </div>
          </label>

          <label className="builder-field">
            <span>Hover Text</span>
            <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
              <input
                type="color"
                value={buttonColorInputValue(block.buttonHoverTextColor, "#ffffff")}
                onChange={(event) =>
                  handleUpdate({
                    buttonHoverTextColor: event.target.value,
                  })
                }
                disabled={!block.buttonHoverTextColor}
              />
              <label className="builder-check" style={{ margin: 0 }}>
                <input
                  type="checkbox"
                  checked={!!block.buttonHoverTextColor}
                  onChange={(event) =>
                    handleUpdate({
                      buttonHoverTextColor: event.target.checked ? "#ffffff" : undefined,
                    })
                  }
                />
                <span style={{ fontSize: "11px" }}>Custom</span>
              </label>
            </div>
          </label>
        </div>

        <div className="builder-two-column">
          <label className="builder-field">
            <span>Hover Border</span>
            <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
              <input
                type="color"
                value={buttonColorInputValue(block.buttonHoverBorderColor, "#111111")}
                onChange={(event) =>
                  handleUpdate({
                    buttonHoverBorderColor: event.target.value,
                  })
                }
                disabled={!block.buttonHoverBorderColor}
              />
              <label className="builder-check" style={{ margin: 0 }}>
                <input
                  type="checkbox"
                  checked={!!block.buttonHoverBorderColor}
                  onChange={(event) =>
                    handleUpdate({
                      buttonHoverBorderColor: event.target.checked ? "#111111" : undefined,
                    })
                  }
                />
                <span style={{ fontSize: "11px" }}>Custom</span>
              </label>
            </div>
          </label>

          <label className="builder-field">
            <span>Hover Action</span>
            <select
              value={block.buttonHoverEffect || "inherit"}
              onChange={(event) =>
                handleUpdate({
                  buttonHoverEffect: event.target.value as any,
                })
              }
            >
              <option value="inherit">Inherit global</option>
              <option value="none">None (Stay static)</option>
              <option value="lift">Lift Up</option>
              <option value="grow">Grow</option>
            </select>
          </label>
        </div>
      </div>
    </div>
  );
}
