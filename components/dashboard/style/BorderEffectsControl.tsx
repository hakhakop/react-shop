"use client";

import React, { useState } from "react";
import { Sliders } from "lucide-react";
import type {
  BuilderBorderStyle,
  BuilderEffectsStyle,
  BuilderVisibilityStyle,
} from "@/lib/builderVisualStyle";

const SHADOW_PRESETS = [
  { label: "None", value: "" },
  { label: "Soft", value: "0 8px 24px rgba(0,0,0,0.08)" },
  { label: "Medium", value: "0 16px 40px rgba(0,0,0,0.12)" },
  { label: "Strong", value: "0 24px 60px rgba(0,0,0,0.18)" },
];

const BORDER_WIDTH_PRESETS = [
  { label: "None", value: "0px" },
  { label: "1px", value: "1px" },
  { label: "2px", value: "2px" },
  { label: "4px", value: "4px" },
  { label: "8px", value: "8px" },
];

const BORDER_RADIUS_PRESETS = [
  { label: "None", value: "0px" },
  { label: "S", value: "4px" },
  { label: "M", value: "8px" },
  { label: "L", value: "12px" },
  { label: "XL", value: "20px" },
  { label: "Full", value: "9999px" },
];

function StyleChipGroup<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: readonly { label: string; value: T }[];
  onChange: (value: T) => void;
}) {
  return (
    <div className="builder-style-chips-row">
      {options.map((option) => {
        const isSelected = option.value === value;
        return (
          <button
            key={option.value || option.label}
            type="button"
            className={`builder-style-chip${isSelected ? " is-active" : ""}`}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

type Props = {
  border?: BuilderBorderStyle;
  effects?: BuilderEffectsStyle;
  visibility?: BuilderVisibilityStyle;
  customClass?: string;
  onBorderChange?: (value: BuilderBorderStyle) => void;
  onEffectsChange?: (value: BuilderEffectsStyle) => void;
  onVisibilityChange?: (value: BuilderVisibilityStyle) => void;
  onCustomClassChange?: (value: string) => void;
  showBorder?: boolean;
  showEffects?: boolean;
  showLayout?: boolean;
  showVisibility?: boolean;
  showCustomClass?: boolean;
  showRadiusOnly?: boolean;
  showBorderOnly?: boolean;
  showShadowOnly?: boolean;
  showOpacityOnly?: boolean;
};

export default function BorderEffectsControl({
  border,
  effects,
  visibility,
  customClass,
  onBorderChange,
  onEffectsChange,
  onVisibilityChange,
  onCustomClassChange,
  showBorder = true,
  showEffects = true,
  showLayout = true,
  showVisibility = true,
  showCustomClass = true,
  showRadiusOnly = false,
  showBorderOnly = false,
  showShadowOnly = false,
  showOpacityOnly = false,
}: Props) {
  const b = border ?? {};
  const e = effects ?? {};
  const vis = visibility ?? { desktop: true, tablet: true, mobile: true };

  const [customFields, setCustomFields] = useState<Record<string, boolean>>({
    width: false,
    radius: false,
    boxShadow: false,
  });

  const matchBorderWidthPreset = (w?: string) => {
    if (!w) return "";
    const trimmed = w.trim().toLowerCase();
    const matched = BORDER_WIDTH_PRESETS.find((p) => p.value === trimmed);
    return matched ? matched.value : "custom";
  };

  const matchBorderRadiusPreset = (r?: string) => {
    if (!r) return "";
    const trimmed = r.trim().toLowerCase();
    const matched = BORDER_RADIUS_PRESETS.find((p) => p.value === trimmed);
    return matched ? matched.value : "custom";
  };

  const matchBoxShadowPreset = (s?: string) => {
    if (!s) return "";
    const matched = SHADOW_PRESETS.find((p) => p.value === s);
    return matched ? matched.value : "custom";
  };

  const activeWidthPreset = matchBorderWidthPreset(b.width);
  const activeRadiusPreset = matchBorderRadiusPreset(b.radius);
  const activeShadowPreset = matchBoxShadowPreset(e.boxShadow);

  const showCustomWidth = customFields.width || activeWidthPreset === "custom";
  const showCustomRadius = customFields.radius || activeRadiusPreset === "custom";
  const showCustomShadow = customFields.boxShadow || activeShadowPreset === "custom";

  if (showBorderOnly) {
    return (
      <div className="builder-style-border-effects">
        <div className="builder-style-subsection" style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <strong>Border</strong>
          
          {/* Border Width */}
          <div className="builder-typography-field">
            <span className="builder-style-side-label-wrapper">Width</span>
            <div className="builder-style-chips-row">
              {BORDER_WIDTH_PRESETS.map((preset) => {
                const isSelected = !showCustomWidth && activeWidthPreset === preset.value;
                return (
                  <button
                    key={preset.value}
                    type="button"
                    className={`builder-style-chip${isSelected ? " is-active" : ""}`}
                    onClick={() => {
                      setCustomFields((prev) => ({ ...prev, width: false }));
                      onBorderChange?.({ ...b, width: preset.value });
                    }}
                  >
                    {preset.label}
                  </button>
                );
              })}
              <button
                type="button"
                className={`builder-style-chip builder-style-chip--custom${showCustomWidth ? " is-active" : ""}`}
                onClick={() => {
                  setCustomFields((prev) => ({ ...prev, width: true }));
                  if (!b.width) {
                    onBorderChange?.({ ...b, width: "1px" });
                  }
                }}
              >
                <Sliders size={11} style={{ marginRight: "4px" }} />
                Custom
              </button>
              {showCustomWidth && (
                <div className="builder-style-custom-input-wrapper" style={{ width: "60px" }}>
                  <input
                    type="text"
                    value={b.width || ""}
                    onChange={(event) =>
                      onBorderChange?.({ ...b, width: event.target.value })
                    }
                    placeholder="1px"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Border Style */}
          <div className="builder-typography-field">
            <span className="builder-style-side-label-wrapper">Style</span>
            <StyleChipGroup
              value={b.style ?? "solid"}
              options={[
                { label: "None", value: "none" },
                { label: "Solid", value: "solid" },
                { label: "Dashed", value: "dashed" },
                { label: "Dotted", value: "dotted" },
              ]}
              onChange={(value) =>
                onBorderChange?.({
                  ...b,
                  style: value as BuilderBorderStyle["style"],
                })
              }
            />
          </div>

          {/* Border Color */}
          <div className="builder-typography-field">
            <span className="builder-style-side-label-wrapper">Color</span>
            <div className="builder-style-color-presets-row" style={{ display: "flex", flexWrap: "wrap", gap: "6px", alignItems: "center", width: "100%" }}>
              {["transparent", "#ffffff", "#cccccc", "#888888", "#333333", "var(--builder-ui-accent)"].map((colorHex) => {
                const isSelected = b.color === colorHex;
                return (
                  <button
                    key={colorHex}
                    type="button"
                    className={`builder-style-color-swatch${isSelected ? " is-active" : ""}`}
                    style={{
                      width: "22px",
                      height: "22px",
                      borderRadius: "50%",
                      border: isSelected ? "2px solid #ffffff" : "1px solid var(--builder-ui-border)",
                      boxShadow: isSelected ? "0 0 0 1px var(--builder-ui-accent)" : "none",
                      backgroundColor: colorHex === "transparent" ? "transparent" : (colorHex.startsWith("var") ? "var(--builder-ui-accent)" : colorHex),
                      backgroundImage: colorHex === "transparent" ? "linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)" : "none",
                      backgroundSize: colorHex === "transparent" ? "6px 6px" : "auto",
                      backgroundPosition: colorHex === "transparent" ? "0 0, 0 3px, 3px -3px, -3px 0px" : "auto",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                    onClick={() => onBorderChange?.({ ...b, color: colorHex })}
                    title={colorHex}
                  />
                );
              })}
              <label
                className="builder-style-color-picker-label"
                style={{
                  position: "relative",
                  width: "22px",
                  height: "22px",
                  borderRadius: "50%",
                  border: "1px solid var(--builder-ui-border)",
                  cursor: "pointer",
                  overflow: "hidden",
                  background: "conic-gradient(red, yellow, green, cyan, blue, magenta, red)",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <input
                  type="color"
                  value={b.color?.startsWith("#") ? b.color : "#ffffff"}
                  onChange={(eVal) => onBorderChange?.({ ...b, color: eVal.target.value })}
                  style={{
                    position: "absolute",
                    inset: "0",
                    opacity: "0",
                    width: "100%",
                    height: "100%",
                    cursor: "pointer",
                  }}
                />
              </label>
              <input
                type="text"
                className="builder-style-color-text-input"
                value={b.color || ""}
                onChange={(eVal) => onBorderChange?.({ ...b, color: eVal.target.value })}
                placeholder="#ffffff"
                style={{
                  height: "28px",
                  padding: "0 8px",
                  borderRadius: "var(--builder-ui-radius-sm)",
                  border: "1px solid var(--builder-ui-border)",
                  background: "var(--builder-ui-panel-solid)",
                  color: "var(--builder-ui-text)",
                  font: "inherit",
                  fontSize: "11px",
                  width: "70px",
                  boxSizing: "border-box",
                }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (showRadiusOnly) {
    return (
      <div className="builder-style-border-effects">
        <div className="builder-style-subsection" style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {/* Border Radius */}
          <div className="builder-typography-field">
            <span className="builder-style-side-label-wrapper">Radius</span>
            <div className="builder-style-chips-row">
              {BORDER_RADIUS_PRESETS.map((preset) => {
                const isSelected = !showCustomRadius && activeRadiusPreset === preset.value;
                return (
                  <button
                    key={preset.value}
                    type="button"
                    className={`builder-style-chip${isSelected ? " is-active" : ""}`}
                    onClick={() => {
                      setCustomFields((prev) => ({ ...prev, radius: false }));
                      onBorderChange?.({ ...b, radius: preset.value });
                    }}
                  >
                    {preset.label}
                  </button>
                );
              })}
              <button
                type="button"
                className={`builder-style-chip builder-style-chip--custom${showCustomRadius ? " is-active" : ""}`}
                onClick={() => {
                  setCustomFields((prev) => ({ ...prev, radius: true }));
                  if (!b.radius) {
                    onBorderChange?.({ ...b, radius: "8px" });
                  }
                }}
              >
                <Sliders size={11} style={{ marginRight: "4px" }} />
                Custom
              </button>
              {showCustomRadius && (
                <div className="builder-style-custom-input-wrapper" style={{ width: "65px" }}>
                  <input
                    type="text"
                    value={b.radius || ""}
                    onChange={(event) =>
                      onBorderChange?.({ ...b, radius: event.target.value })
                    }
                    placeholder="8px"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (showOpacityOnly) {
    return (
      <div className="builder-style-border-effects">
        <div className="builder-style-subsection" style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {/* Opacity */}
          <label className="builder-typography-field">
            <span className="builder-style-side-label-wrapper">Opacity ({e.opacity ?? 100}%)</span>
            <input
              type="range"
              min={0}
              max={100}
              value={e.opacity ?? 100}
              onChange={(event) =>
                onEffectsChange?.({ ...e, opacity: Number(event.target.value) })
              }
              style={{ width: "100%", height: "4px", background: "var(--builder-ui-border)", borderRadius: "2px", outline: "none" }}
            />
          </label>
        </div>
      </div>
    );
  }

  if (showShadowOnly) {
    return (
      <div className="builder-style-border-effects">
        <div className="builder-style-subsection" style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {/* Box Shadow */}
          <div className="builder-typography-field">
            <span className="builder-style-side-label-wrapper">Box Shadow</span>
            <div className="builder-style-chips-row">
              {SHADOW_PRESETS.map((preset) => {
                const isSelected = !showCustomShadow && activeShadowPreset === preset.value;
                return (
                  <button
                    key={preset.value || "none"}
                    type="button"
                    className={`builder-style-chip${isSelected ? " is-active" : ""}`}
                    onClick={() => {
                      setCustomFields((prev) => ({ ...prev, boxShadow: false }));
                      onEffectsChange?.({ ...e, boxShadow: preset.value });
                    }}
                  >
                    {preset.label}
                  </button>
                );
              })}
              <button
                type="button"
                className={`builder-style-chip builder-style-chip--custom${showCustomShadow ? " is-active" : ""}`}
                onClick={() => {
                  setCustomFields((prev) => ({ ...prev, boxShadow: true }));
                  if (!e.boxShadow) {
                    onEffectsChange?.({ ...e, boxShadow: "0 8px 24px rgba(0,0,0,0.08)" });
                  }
                }}
              >
                <Sliders size={11} style={{ marginRight: "4px" }} />
                Custom
              </button>
              {showCustomShadow && (
                <div className="builder-style-custom-input-wrapper" style={{ width: "140px" }}>
                  <input
                    type="text"
                    value={e.boxShadow || ""}
                    onChange={(event) =>
                      onEffectsChange?.({ ...e, boxShadow: event.target.value })
                    }
                    placeholder="Custom shadow"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="builder-style-border-effects">
      {showBorder && (
        <div className="builder-style-subsection" style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <strong>Border</strong>
          
          {/* Border Width */}
          <div className="builder-typography-field">
            <span className="builder-style-side-label-wrapper">Width</span>
            <div className="builder-style-chips-row">
              {BORDER_WIDTH_PRESETS.map((preset) => {
                const isSelected = !showCustomWidth && activeWidthPreset === preset.value;
                return (
                  <button
                    key={preset.value}
                    type="button"
                    className={`builder-style-chip${isSelected ? " is-active" : ""}`}
                    onClick={() => {
                      setCustomFields((prev) => ({ ...prev, width: false }));
                      onBorderChange?.({ ...b, width: preset.value });
                    }}
                  >
                    {preset.label}
                  </button>
                );
              })}
              <button
                type="button"
                className={`builder-style-chip builder-style-chip--custom${showCustomWidth ? " is-active" : ""}`}
                onClick={() => {
                  setCustomFields((prev) => ({ ...prev, width: true }));
                  if (!b.width) {
                    onBorderChange?.({ ...b, width: "1px" });
                  }
                }}
              >
                <Sliders size={11} style={{ marginRight: "4px" }} />
                Custom
              </button>
              {showCustomWidth && (
                <div className="builder-style-custom-input-wrapper" style={{ width: "60px" }}>
                  <input
                    type="text"
                    value={b.width || ""}
                    onChange={(event) =>
                      onBorderChange?.({ ...b, width: event.target.value })
                    }
                    placeholder="1px"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Border Style */}
          <div className="builder-typography-field">
            <span className="builder-style-side-label-wrapper">Style</span>
            <StyleChipGroup
              value={b.style ?? "solid"}
              options={[
                { label: "None", value: "none" },
                { label: "Solid", value: "solid" },
                { label: "Dashed", value: "dashed" },
                { label: "Dotted", value: "dotted" },
              ]}
              onChange={(value) =>
                onBorderChange?.({
                  ...b,
                  style: value as BuilderBorderStyle["style"],
                })
              }
            />
          </div>

          {/* Border Color */}
          <div className="builder-typography-field">
            <span className="builder-style-side-label-wrapper">Color</span>
            <div className="builder-style-color-presets-row" style={{ display: "flex", flexWrap: "wrap", gap: "6px", alignItems: "center", width: "100%" }}>
              {["transparent", "#ffffff", "#cccccc", "#888888", "#333333", "var(--builder-ui-accent)"].map((colorHex) => {
                const isSelected = b.color === colorHex;
                return (
                  <button
                    key={colorHex}
                    type="button"
                    className={`builder-style-color-swatch${isSelected ? " is-active" : ""}`}
                    style={{
                      width: "22px",
                      height: "22px",
                      borderRadius: "50%",
                      border: isSelected ? "2px solid #ffffff" : "1px solid var(--builder-ui-border)",
                      boxShadow: isSelected ? "0 0 0 1px var(--builder-ui-accent)" : "none",
                      backgroundColor: colorHex === "transparent" ? "transparent" : (colorHex.startsWith("var") ? "var(--builder-ui-accent)" : colorHex),
                      backgroundImage: colorHex === "transparent" ? "linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)" : "none",
                      backgroundSize: colorHex === "transparent" ? "6px 6px" : "auto",
                      backgroundPosition: colorHex === "transparent" ? "0 0, 0 3px, 3px -3px, -3px 0px" : "auto",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                    onClick={() => onBorderChange?.({ ...b, color: colorHex })}
                    title={colorHex}
                  />
                );
              })}
              <label
                className="builder-style-color-picker-label"
                style={{
                  position: "relative",
                  width: "22px",
                  height: "22px",
                  borderRadius: "50%",
                  border: "1px solid var(--builder-ui-border)",
                  cursor: "pointer",
                  overflow: "hidden",
                  background: "conic-gradient(red, yellow, green, cyan, blue, magenta, red)",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <input
                  type="color"
                  value={b.color?.startsWith("#") ? b.color : "#ffffff"}
                  onChange={(eVal) => onBorderChange?.({ ...b, color: eVal.target.value })}
                  style={{
                    position: "absolute",
                    inset: "0",
                    opacity: "0",
                    width: "100%",
                    height: "100%",
                    cursor: "pointer",
                  }}
                />
              </label>
              <input
                type="text"
                className="builder-style-color-text-input"
                value={b.color || ""}
                onChange={(eVal) => onBorderChange?.({ ...b, color: eVal.target.value })}
                placeholder="#ffffff"
                style={{
                  height: "28px",
                  padding: "0 8px",
                  borderRadius: "var(--builder-ui-radius-sm)",
                  border: "1px solid var(--builder-ui-border)",
                  background: "var(--builder-ui-panel-solid)",
                  color: "var(--builder-ui-text)",
                  font: "inherit",
                  fontSize: "11px",
                  width: "70px",
                  boxSizing: "border-box",
                }}
              />
            </div>
          </div>

          {/* Border Radius */}
          <div className="builder-typography-field">
            <span className="builder-style-side-label-wrapper">Radius</span>
            <div className="builder-style-chips-row">
              {BORDER_RADIUS_PRESETS.map((preset) => {
                const isSelected = !showCustomRadius && activeRadiusPreset === preset.value;
                return (
                  <button
                    key={preset.value}
                    type="button"
                    className={`builder-style-chip${isSelected ? " is-active" : ""}`}
                    onClick={() => {
                      setCustomFields((prev) => ({ ...prev, radius: false }));
                      onBorderChange?.({ ...b, radius: preset.value });
                    }}
                  >
                    {preset.label}
                  </button>
                );
              })}
              <button
                type="button"
                className={`builder-style-chip builder-style-chip--custom${showCustomRadius ? " is-active" : ""}`}
                onClick={() => {
                  setCustomFields((prev) => ({ ...prev, radius: true }));
                  if (!b.radius) {
                    onBorderChange?.({ ...b, radius: "8px" });
                  }
                }}
              >
                <Sliders size={11} style={{ marginRight: "4px" }} />
                Custom
              </button>
              {showCustomRadius && (
                <div className="builder-style-custom-input-wrapper" style={{ width: "65px" }}>
                  <input
                    type="text"
                    value={b.radius || ""}
                    onChange={(event) =>
                      onBorderChange?.({ ...b, radius: event.target.value })
                    }
                    placeholder="8px"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showEffects && (
        <div className="builder-style-subsection" style={{ display: "flex", flexDirection: "column", gap: "14px", marginTop: "14px" }}>
          <strong>Effects</strong>
          
          {/* Opacity */}
          <label className="builder-typography-field">
            <span className="builder-style-side-label-wrapper">Opacity ({e.opacity ?? 100}%)</span>
            <input
              type="range"
              min={0}
              max={100}
              value={e.opacity ?? 100}
              onChange={(event) =>
                onEffectsChange?.({ ...e, opacity: Number(event.target.value) })
              }
              style={{ width: "100%", height: "4px", background: "var(--builder-ui-border)", borderRadius: "2px", outline: "none" }}
            />
          </label>

          {/* Box Shadow */}
          <div className="builder-typography-field">
            <span className="builder-style-side-label-wrapper">Box Shadow</span>
            <div className="builder-style-chips-row">
              {SHADOW_PRESETS.map((preset) => {
                const isSelected = !showCustomShadow && activeShadowPreset === preset.value;
                return (
                  <button
                    key={preset.value || "none"}
                    type="button"
                    className={`builder-style-chip${isSelected ? " is-active" : ""}`}
                    onClick={() => {
                      setCustomFields((prev) => ({ ...prev, boxShadow: false }));
                      onEffectsChange?.({ ...e, boxShadow: preset.value });
                    }}
                  >
                    {preset.label}
                  </button>
                );
              })}
              <button
                type="button"
                className={`builder-style-chip builder-style-chip--custom${showCustomShadow ? " is-active" : ""}`}
                onClick={() => {
                  setCustomFields((prev) => ({ ...prev, boxShadow: true }));
                  if (!e.boxShadow) {
                    onEffectsChange?.({ ...e, boxShadow: "0 8px 24px rgba(0,0,0,0.08)" });
                  }
                }}
              >
                <Sliders size={11} style={{ marginRight: "4px" }} />
                Custom
              </button>
              {showCustomShadow && (
                <div className="builder-style-custom-input-wrapper" style={{ width: "140px" }}>
                  <input
                    type="text"
                    value={e.boxShadow || ""}
                    onChange={(event) =>
                      onEffectsChange?.({ ...e, boxShadow: event.target.value })
                    }
                    placeholder="Custom shadow"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showLayout && (
        <div className="builder-style-subsection" style={{ display: "flex", flexDirection: "column", gap: "14px", marginTop: "14px" }}>
          <strong>Dimensions & Overflow</strong>
          <div className="builder-style-two-col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <label className="builder-typography-field">
              <span className="builder-style-side-label-wrapper">Max width</span>
              <input
                className="builder-style-color-text-input"
                value={e.maxWidth ?? ""}
                placeholder="1200px"
                onChange={(event) =>
                  onEffectsChange?.({ ...e, maxWidth: event.target.value })
                }
                style={{ width: "100%" }}
              />
            </label>
            <label className="builder-typography-field">
              <span className="builder-style-side-label-wrapper">Min height</span>
              <input
                className="builder-style-color-text-input"
                value={e.minHeight ?? ""}
                placeholder="320px"
                onChange={(event) =>
                  onEffectsChange?.({ ...e, minHeight: event.target.value })
                }
                style={{ width: "100%" }}
              />
            </label>
          </div>
          <div className="builder-typography-field">
            <span className="builder-style-side-label-wrapper">Overflow</span>
            <StyleChipGroup
              value={e.overflow ?? "visible"}
              options={[
                { label: "Visible", value: "visible" },
                { label: "Hidden", value: "hidden" },
                { label: "Auto", value: "auto" },
                { label: "Scroll", value: "scroll" },
              ]}
              onChange={(value) =>
                onEffectsChange?.({
                  ...e,
                  overflow: value as BuilderEffectsStyle["overflow"],
                })
              }
            />
          </div>
        </div>
      )}

      {showVisibility && (
        <div className="builder-style-subsection" style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "14px" }}>
          <strong>Visibility</strong>
          <div className="builder-style-visibility-row" style={{ display: "flex", gap: "14px", alignItems: "center" }}>
            {(["desktop", "tablet", "mobile"] as const).map((device) => (
              <label key={device} className="builder-check" style={{ display: "inline-flex", alignItems: "center", gap: "6px", cursor: "pointer", fontSize: "12px", textTransform: "capitalize", color: "var(--builder-ui-text)" }}>
                <input
                  type="checkbox"
                  checked={vis[device] !== false}
                  onChange={(event) =>
                    onVisibilityChange?.({
                      ...vis,
                      [device]: event.target.checked,
                    })
                  }
                  style={{ width: "14px", height: "14px", borderRadius: "3px", border: "1px solid var(--builder-ui-border)", cursor: "pointer" }}
                />
                <span>{device}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {showCustomClass && (
        <label className="builder-typography-field" style={{ marginTop: "14px", display: "flex", flexDirection: "column", gap: "6px" }}>
          <span className="builder-style-side-label-wrapper">CSS class</span>
          <input
            className="builder-style-color-text-input"
            value={customClass ?? ""}
            placeholder="my-custom-class"
            onChange={(event) => onCustomClassChange?.(event.target.value)}
            style={{ width: "100%" }}
          />
        </label>
      )}
    </div>
  );
}
