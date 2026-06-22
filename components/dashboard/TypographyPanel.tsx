"use client";

import { typographyProps, type TypographySettings } from "@/lib/builderTypography";
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Sliders,
} from "lucide-react";
import React, { useState } from "react";

type Props = {
  value?: TypographySettings;
  onChange: (v: TypographySettings) => void;
  onOpenGlobalTypographySettings?: () => void;
};

const SHADOW_PRESETS = [
  { label: "None", value: "none", css: "none" },
  { label: "Soft", value: "soft", css: "0 1px 2px rgba(0,0,0,0.4)" },
  { label: "Hard", value: "hard", css: "0 2px 4px rgba(0,0,0,0.5)" },
  { label: "Float", value: "float", css: "0 4px 8px rgba(0,0,0,0.6)" },
  { label: "Glow", value: "glow", css: "0 0 6px rgba(99,102,241,0.6)" },
];

const FONT_SIZE_PRESETS = [
  { label: "XS", value: "12px" },
  { label: "S", value: "14px" },
  { label: "M", value: "16px" },
  { label: "L", value: "18px" },
  { label: "XL", value: "24px" },
  { label: "2XL", value: "32px" },
  { label: "3XL", value: "48px" },
];

const LINE_HEIGHT_PRESETS = ["1", "1.2", "1.4", "1.6", "1.8", "2", "2.4"];

const LETTER_SPACING_PRESETS = ["-2", "-1", "0", "0.5", "1", "1.5", "2"];

const WEIGHTS = ["300", "400", "500", "600", "700", "800"];

export default function TypographyPanel({
  value,
  onChange,
  onOpenGlobalTypographySettings,
}: Props) {
  const v = value || {};

  const [customFontFamilyActive, setCustomFontFamilyActive] = useState(
    v.fontFamily ? !["Inter", "Outfit", "Playfair Display", "system-ui", "monospace"].includes(v.fontFamily) : false
  );

  const [customFields, setCustomFields] = useState<Record<string, boolean>>({
    fontSize: false,
    lineHeight: false,
    letterSpacing: false,
    textShadow: false,
  });

  function set<K extends keyof TypographySettings>(
    key: K,
    val: TypographySettings[K],
  ) {
    onChange({ ...v, [key]: val });
  }

  const matchSizePreset = (currentSize?: string) => {
    if (!currentSize) return "";
    const trimmed = currentSize.trim().toLowerCase();
    const matched = FONT_SIZE_PRESETS.find(
      (preset) => preset.value === trimmed || (trimmed.endsWith("rem") && parseFloat(trimmed) * 16 === parseFloat(preset.value))
    );
    return matched ? matched.value : "custom";
  };

  const matchLineHeightPreset = (currentLH?: string) => {
    if (!currentLH) return "";
    const trimmed = currentLH.trim().toLowerCase();
    if (LINE_HEIGHT_PRESETS.includes(trimmed)) return trimmed;
    return "custom";
  };

  const matchLetterSpacingPreset = (currentLS?: string) => {
    if (!currentLS) return "";
    const trimmed = currentLS.trim().toLowerCase().replace("px", "");
    if (LETTER_SPACING_PRESETS.includes(trimmed)) return trimmed;
    return "custom";
  };

  const matchShadowPreset = (currentShadow?: string) => {
    if (!currentShadow || currentShadow === "none") return "none";
    const matched = SHADOW_PRESETS.find((s) => s.css === currentShadow);
    return matched ? matched.css : "custom";
  };

  const handleFontFamilyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === "custom") {
      setCustomFontFamilyActive(true);
      set("fontFamily", "Inter");
    } else {
      setCustomFontFamilyActive(false);
      set("fontFamily", val);
    }
  };

  const handleCustomSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    set("fontSize", e.target.value);
  };

  const handleCustomLHChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    set("lineHeight", e.target.value);
  };

  const handleCustomLSChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    set("letterSpacing", e.target.value);
  };

  const handleCustomShadowChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    set("textShadow", e.target.value);
  };

  const activeSizePreset = matchSizePreset(v.fontSize);
  const activeLHPreset = matchLineHeightPreset(v.lineHeight);
  const activeLSPreset = matchLetterSpacingPreset(v.letterSpacing);
  const activeShadowPreset = matchShadowPreset(v.textShadow);

  const showCustomSize = customFields.fontSize || activeSizePreset === "custom";
  const showCustomLH = customFields.lineHeight || activeLHPreset === "custom";
  const showCustomLS = customFields.letterSpacing || activeLSPreset === "custom";
  const showCustomShadow = customFields.textShadow || activeShadowPreset === "custom";

  return (
    <div className="builder-style-typography-new">
      <div className="builder-typography-field is-fullwidth">
        <span className="builder-style-side-label-wrapper">Variant</span>
        <div className="builder-style-chips-row">
          {(["heading", "subheading", "body", "button"] as const).map((variant) => {
            const isSelected = (v.variant || "body") === variant;
            return (
              <button
                key={variant}
                type="button"
                className={`builder-style-chip${isSelected ? " is-active" : ""}`}
                onClick={() => set("variant", variant)}
                style={{ textTransform: "capitalize" }}
              >
                {variant}
              </button>
            );
          })}
        </div>
      </div>

      <div className="builder-typography-two-col-grid">
        {/* Font Family */}
        <div className="builder-typography-field">
          <span className="builder-style-side-label-wrapper">Font Family</span>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px", width: "100%" }}>
            <select
              value={customFontFamilyActive ? "custom" : v.fontFamily || "Inter"}
              onChange={handleFontFamilyChange}
              style={{
                width: "100%",
                height: "32px",
                padding: "0 8px",
                borderRadius: "var(--builder-ui-radius-sm)",
                border: "1px solid var(--builder-ui-border)",
                background: "var(--builder-ui-panel-solid)",
                color: "var(--builder-ui-text)",
                font: "inherit",
                fontSize: "12px",
              }}
            >
              <option value="Inter">Inter</option>
              <option value="Outfit">Outfit</option>
              <option value="Playfair Display">Playfair Display</option>
              <option value="system-ui">System UI</option>
              <option value="monospace">Monospace</option>
              <option value="custom">Custom...</option>
            </select>
            {customFontFamilyActive && (
              <input
                type="text"
                value={v.fontFamily || ""}
                onChange={(e) => set("fontFamily", e.target.value)}
                placeholder="Inter, system-ui"
                style={{
                  width: "100%",
                  height: "28px",
                  padding: "0 8px",
                  borderRadius: "var(--builder-ui-radius-sm)",
                  border: "1px solid var(--builder-ui-border)",
                  background: "var(--builder-ui-panel-solid)",
                  color: "var(--builder-ui-text)",
                  fontSize: "11px",
                }}
              />
            )}
          </div>
        </div>

        {/* Font Weight */}
        <div className="builder-typography-field">
          <span className="builder-style-side-label-wrapper">Font Weight</span>
          <div className="builder-style-chips-row">
            {WEIGHTS.map((w) => {
              const isSelected = String(v.fontWeight ?? "400") === w;
              return (
                <button
                  key={w}
                  type="button"
                  className={`builder-style-chip${isSelected ? " is-active" : ""}`}
                  onClick={() => set("fontWeight", w)}
                >
                  {w}
                </button>
              );
            })}
          </div>
        </div>

        {/* Font Size */}
        <div className="builder-typography-field">
          <span className="builder-style-side-label-wrapper">Font Size</span>
          <div className="builder-style-chips-row">
            {FONT_SIZE_PRESETS.map((preset) => {
              const isSelected = !showCustomSize && activeSizePreset === preset.value;
              return (
                <button
                  key={preset.value}
                  type="button"
                  className={`builder-style-chip${isSelected ? " is-active" : ""}`}
                  onClick={() => {
                    setCustomFields((prev) => ({ ...prev, fontSize: false }));
                    set("fontSize", preset.value);
                  }}
                >
                  {preset.label}
                </button>
              );
            })}
            <button
              type="button"
              className={`builder-style-chip builder-style-chip--custom${showCustomSize ? " is-active" : ""}`}
              onClick={() => {
                setCustomFields((prev) => ({ ...prev, fontSize: true }));
                if (!v.fontSize) {
                  set("fontSize", "16px");
                }
              }}
            >
              <Sliders size={11} style={{ marginRight: "4px" }} />
              Custom
            </button>
            {showCustomSize && (
              <div className="builder-style-custom-input-wrapper" style={{ width: "80px" }}>
                <input
                  type="text"
                  value={v.fontSize || ""}
                  onChange={handleCustomSizeChange}
                  placeholder="16px"
                />
              </div>
            )}
          </div>
        </div>

        {/* Line Height */}
        <div className="builder-typography-field">
          <span className="builder-style-side-label-wrapper">Line Height</span>
          <div className="builder-style-chips-row">
            {LINE_HEIGHT_PRESETS.map((lh) => {
              const isSelected = !showCustomLH && activeLHPreset === lh;
              return (
                <button
                  key={lh}
                  type="button"
                  className={`builder-style-chip${isSelected ? " is-active" : ""}`}
                  onClick={() => {
                    setCustomFields((prev) => ({ ...prev, lineHeight: false }));
                    set("lineHeight", lh);
                  }}
                >
                  {lh}
                </button>
              );
            })}
            <button
              type="button"
              className={`builder-style-chip builder-style-chip--custom${showCustomLH ? " is-active" : ""}`}
              onClick={() => {
                setCustomFields((prev) => ({ ...prev, lineHeight: true }));
                if (!v.lineHeight) {
                  set("lineHeight", "1.4");
                }
              }}
            >
              <Sliders size={11} style={{ marginRight: "4px" }} />
              Custom
            </button>
            {showCustomLH && (
              <div className="builder-style-custom-input-wrapper" style={{ width: "60px" }}>
                <input
                  type="text"
                  value={v.lineHeight || ""}
                  onChange={handleCustomLHChange}
                  placeholder="1.4"
                />
              </div>
            )}
          </div>
        </div>

        {/* Letter Spacing */}
        <div className="builder-typography-field">
          <span className="builder-style-side-label-wrapper">Letter Spacing</span>
          <div className="builder-style-chips-row">
            {LETTER_SPACING_PRESETS.map((ls) => {
              const isSelected = !showCustomLS && activeLSPreset === ls;
              return (
                <button
                  key={ls}
                  type="button"
                  className={`builder-style-chip${isSelected ? " is-active" : ""}`}
                  onClick={() => {
                    setCustomFields((prev) => ({ ...prev, letterSpacing: false }));
                    set("letterSpacing", ls === "0" ? "0px" : `${ls}px`);
                  }}
                >
                  {ls}
                </button>
              );
            })}
            <button
              type="button"
              className={`builder-style-chip builder-style-chip--custom${showCustomLS ? " is-active" : ""}`}
              onClick={() => {
                setCustomFields((prev) => ({ ...prev, letterSpacing: true }));
                if (!v.letterSpacing) {
                  set("letterSpacing", "0px");
                }
              }}
            >
              <Sliders size={11} style={{ marginRight: "4px" }} />
              Custom
            </button>
            {showCustomLS && (
              <div className="builder-style-custom-input-wrapper" style={{ width: "70px" }}>
                <input
                  type="text"
                  value={v.letterSpacing || ""}
                  onChange={handleCustomLSChange}
                  placeholder="0px"
                />
              </div>
            )}
          </div>
        </div>

        {/* Text Transform */}
        <div className="builder-typography-field">
          <span className="builder-style-side-label-wrapper">Text Transform</span>
          <div className="builder-style-chips-row">
            {[
              { label: "TT", value: "uppercase", title: "Uppercase" },
              { label: "Tt", value: "capitalize", title: "Capitalize" },
              { label: "tt", value: "lowercase", title: "Lowercase" },
              { label: "None", value: "none", title: "None" },
            ].map((preset) => {
              const isSelected = (v.textTransform || "none") === preset.value;
              return (
                <button
                  key={preset.value}
                  type="button"
                  className={`builder-style-chip${isSelected ? " is-active" : ""}`}
                  onClick={() => set("textTransform", preset.value as any)}
                  title={preset.title}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Text Alignment */}
        <div className="builder-typography-field">
          <span className="builder-style-side-label-wrapper">Text Alignment</span>
          <div className="builder-style-chips-row">
            {[
              { value: "left", icon: <AlignLeft size={13} />, title: "Align Left" },
              { value: "center", icon: <AlignCenter size={13} />, title: "Align Center" },
              { value: "right", icon: <AlignRight size={13} />, title: "Align Right" },
              { value: "justify", icon: <AlignJustify size={13} />, title: "Align Justify" },
            ].map((preset) => {
              const isSelected = (v.textAlign || "left") === preset.value;
              return (
                <button
                  key={preset.value}
                  type="button"
                  className={`builder-style-chip${isSelected ? " is-active" : ""}`}
                  onClick={() => set("textAlign", preset.value as any)}
                  title={preset.title}
                  style={{ width: "28px", height: "28px", padding: "0" }}
                >
                  {preset.icon}
                </button>
              );
            })}
          </div>
        </div>

        {/* Text Decoration */}
        <div className="builder-typography-field">
          <span className="builder-style-side-label-wrapper">Text Decoration</span>
          <div className="builder-style-chips-row">
            {[
              { label: "None", value: "none" },
              { label: "Underline", value: "underline" },
              { label: "Overline", value: "overline" },
              { label: "Line Through", value: "line-through" },
            ].map((preset) => {
              const isSelected = (v.textDecoration || "none") === preset.value;
              return (
                <button
                  key={preset.value}
                  type="button"
                  className={`builder-style-chip${isSelected ? " is-active" : ""}`}
                  onClick={() => set("textDecoration", preset.value as any)}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Text Color */}
        <div className="builder-typography-field">
          <span className="builder-style-side-label-wrapper">Text Color</span>
          <div className="builder-style-color-presets-row" style={{ display: "flex", flexWrap: "wrap", gap: "6px", alignItems: "center", width: "100%" }}>
            {["#ffffff", "#cccccc", "#888888", "#333333", "var(--builder-ui-accent)"].map((colorHex) => {
              const isSelected = v.color === colorHex;
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
                    backgroundColor: colorHex.startsWith("var") ? "var(--builder-ui-accent)" : colorHex,
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                  onClick={() => set("color", colorHex)}
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
                value={v.color?.startsWith("#") ? v.color : "#ffffff"}
                onChange={(e) => set("color", e.target.value)}
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
              value={v.color || ""}
              onChange={(e) => set("color", e.target.value)}
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

        {/* Text Shadow */}
        <div className="builder-typography-field">
          <span className="builder-style-side-label-wrapper">Text Shadow</span>
          <div className="builder-style-chips-row">
            {SHADOW_PRESETS.map((shadow) => {
              const isSelected = !showCustomShadow && activeShadowPreset === shadow.css;
              return (
                <button
                  key={shadow.value}
                  type="button"
                  className={`builder-style-chip${isSelected ? " is-active" : ""}`}
                  onClick={() => {
                    setCustomFields((prev) => ({ ...prev, textShadow: false }));
                    set("textShadow", shadow.css);
                  }}
                  style={{ minWidth: "30px", height: "28px" }}
                  title={shadow.label}
                >
                  {shadow.value === "none" ? (
                    "None"
                  ) : (
                    <span
                      style={{
                        fontWeight: "800",
                        fontSize: "12px",
                        textShadow: shadow.css,
                        color: isSelected ? "#ffffff" : "var(--builder-ui-text)",
                      }}
                    >
                      T
                    </span>
                  )}
                </button>
              );
            })}
            <button
              type="button"
              className={`builder-style-chip builder-style-chip--custom${showCustomShadow ? " is-active" : ""}`}
              onClick={() => {
                setCustomFields((prev) => ({ ...prev, textShadow: true }));
                if (!v.textShadow) {
                  set("textShadow", "1px 1px 2px rgba(0,0,0,0.5)");
                }
              }}
            >
              <Sliders size={11} style={{ marginRight: "4px" }} />
              Custom
            </button>
            {showCustomShadow && (
              <div className="builder-style-custom-input-wrapper" style={{ width: "120px" }}>
                <input
                  type="text"
                  value={v.textShadow || ""}
                  onChange={handleCustomShadowChange}
                  placeholder="1px 1px 2px rgba(0,0,0,0.5)"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Font Preview Card */}
      <div className="builder-style-typography-preview-card" style={{ marginTop: "14px" }}>
        <span className="builder-preview-label" style={{ display: "block", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", color: "var(--builder-ui-muted)", letterSpacing: "0.05em", marginBottom: "6px" }}>
          Font Preview
        </span>
        <div
          className="builder-preview-box"
          style={{
            padding: "12px 14px",
            borderRadius: "var(--builder-ui-radius-sm)",
            border: "1px solid var(--builder-ui-border)",
            background: "var(--builder-ui-surface)",
            display: "grid",
            gap: "8px",
          }}
        >
          <p
            style={{
              margin: "0",
              fontFamily: v.fontFamily || "inherit",
              fontWeight: v.fontWeight || "normal",
              fontSize: v.fontSize || "inherit",
              lineHeight: v.lineHeight || "inherit",
              letterSpacing: v.letterSpacing || "inherit",
              color: v.color || "inherit",
              textAlign: v.textAlign || "left",
              textTransform: v.textTransform || "none",
              textDecoration: v.textDecoration || "none",
              textShadow: v.textShadow || "none",
            }}
          >
            The quick brown fox jumps over the lazy dog
          </p>
          <span
            className="builder-preview-details"
            style={{
              fontSize: "10.5px",
              color: "var(--builder-ui-soft-muted)",
              fontFamily: "var(--font-mono, monospace)",
            }}
          >
            {v.fontFamily || "Default font"} · {v.fontWeight || "400"} · {v.fontSize || "16px"} · {v.lineHeight || "1.4"}
          </span>
        </div>
      </div>

      {/* Edit Global Typography Action */}
      {onOpenGlobalTypographySettings && (
        <button
          type="button"
          className="builder-secondary-button builder-full-button"
          onClick={onOpenGlobalTypographySettings}
          style={{
            marginTop: "14px",
            width: "100%",
            height: "36px",
            borderRadius: "var(--builder-ui-radius-sm)",
            border: "1px solid var(--builder-ui-border)",
            background: "var(--builder-ui-panel-solid)",
            color: "var(--builder-ui-text)",
            fontWeight: "600",
            fontSize: "12px",
            cursor: "pointer",
            transition: "all 0.15s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--builder-ui-surface)";
            e.currentTarget.style.borderColor = "var(--builder-ui-border-strong)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "var(--builder-ui-panel-solid)";
            e.currentTarget.style.borderColor = "var(--builder-ui-border)";
          }}
        >
          Edit global element typography
        </button>
      )}
    </div>
  );
}
