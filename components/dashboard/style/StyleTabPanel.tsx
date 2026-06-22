"use client";

import React, { useState, useEffect } from "react";
import {
  Sliders,
  Ruler,
  Image as ImageIcon,
  Type,
  Info,
  AlignLeft,
  ToggleLeft,
  Grid,
  Maximize,
  Code,
  Sparkles,
  Layers,
  Square,
  CornerUpRight,
} from "lucide-react";
import TypographyPanel from "@/components/dashboard/TypographyPanel";
import BackgroundControl from "@/components/dashboard/style/BackgroundControl";
import BorderEffectsControl from "@/components/dashboard/style/BorderEffectsControl";
import SpacingControl from "@/components/dashboard/style/SpacingControl";
import {
  BUILDER_CARD_PRESETS,
  BUILDER_HOVER_PRESETS,
} from "@/lib/builderCardStyles";
import type {
  BuilderCardPartStyle,
  BuilderVisualStyle,
} from "@/lib/builderVisualStyle";
import type {
  TypographyGroup,
  TypographySettings,
} from "@/lib/builderTypography";
import type { BuilderPanelStyle } from "../builderTypes";

type StyleTarget = {
  visualStyle?: BuilderVisualStyle;
  typography?: TypographySettings | TypographyGroup;
  cardPreset?: string;
  cardStyle?: string;
  gridImageFrame?: string;
  panelStyle?: string;
  borderRadius?: number;
  elementBackgroundMode?: string;
  elementBackground?: string;
  imageFit?: string;
  imageRatio?: string;
  imagePadding?: string;
  addToCartStyle?: string;
  addToCartSize?: string;
  addToCartDisplay?: string;
  addToCartVisibility?: string;
  addToCartPosition?: string;
};

type Props = {
  target: StyleTarget;
  inheritedSpacing?: {
    padding?: BuilderVisualStyle["padding"];
    margin?: BuilderVisualStyle["margin"];
  };
  showSpacing?: boolean;
  showBackground?: boolean;
  showAppearance?: boolean;
  showLayout?: boolean;
  showAdvanced?: boolean;
  showTypography?: boolean;
  showCardParts?: boolean;
  isProductsBlock?: boolean;
  elementBackgroundPresets?: { label: string; value: string; scheme?: string }[];
  spacingControlIds?: {
    padding?: string;
    margin?: string;
  };
  onChange: (patch: Partial<StyleTarget>) => void;
  onPickBackgroundImage?: () => void;
  onOpenGlobalTypographySettings?: () => void;
};

const panelStyleOptions = [
  { label: "Default", value: "default" },
  { label: "Princity", value: "princity" },
  { label: "Princity Flat", value: "princity-flat" },
  { label: "Princity Line", value: "princity-line" },
  { label: "Secondary", value: "secondary" },
  { label: "Dark", value: "dark" },
  { label: "Light", value: "light" },
  { label: "Clean with shadow", value: "clean-shadow" },
  { label: "Flat dark", value: "flat-dark" },
  { label: "Flat white", value: "flat-white" },
  { label: "Antigravity", value: "antigravity" },
];

function InspectorChoiceGroup<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: readonly { label: string; value: T }[] | { label: string; value: T }[];
  onChange: (value: T) => void;
}) {
  return (
    <div className="builder-style-chips-row">
      {options.map((option) => {
        const isSelected = option.value === value;
        return (
          <button
            key={option.value}
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

let globalLastSelectedStyleSubTab: string | null = null;

const getTabIcon = (id: string) => {
  const size = 13;
  switch (id) {
    case "spacing":
      return <Ruler size={size} />;
    case "background":
      return <ImageIcon size={size} />;
    case "appearance":
      return <Sliders size={size} />;
    case "border":
      return <Square size={size} />;
    case "borderRadius":
      return <CornerUpRight size={size} />;
    case "effects":
      return <Sparkles size={size} />;
    case "shadows":
      return <Layers size={size} />;
    case "imageStyle":
      return <ImageIcon size={size} />;
    case "titleStyle":
      return <Type size={size} />;
    case "metaStyle":
      return <Info size={size} />;
    case "contentStyle":
      return <AlignLeft size={size} />;
    case "buttonStyle":
      return <ToggleLeft size={size} />;
    case "cardSpacing":
      return <Grid size={size} />;
    case "layout":
      return <Maximize size={size} />;
    case "advanced":
      return <Code size={size} />;
    case "typography":
      return <Type size={size} />;
    default:
      return <Sliders size={size} />;
  }
};

export default function StyleTabPanel({
  target,
  inheritedSpacing,
  showSpacing = true,
  showBackground = true,
  showAppearance = true,
  showLayout = true,
  showAdvanced = true,
  showTypography = true,
  showCardParts = false,
  isProductsBlock = false,
  elementBackgroundPresets = [],
  spacingControlIds,
  onChange,
  onPickBackgroundImage,
  onOpenGlobalTypographySettings,
}: Props) {
  const style = target.visualStyle ?? {};

  function patchStyle(patch: Partial<BuilderVisualStyle>) {
    onChange({ visualStyle: { ...style, ...patch } });
  }

  function patchCard(patch: Partial<BuilderCardPartStyle>) {
    patchStyle({ card: { ...(style.card ?? {}), ...patch } });
  }

  // Derive sub-tabs dynamically based on show-flags
  const tabs: { id: string; label: string }[] = [];
  if (showSpacing) {
    tabs.push({ id: "spacing", label: "Spacing" });
  }
  if (showBackground) {
    tabs.push({ id: "background", label: "Background" });
  }
  if (showAppearance) {
    if (showCardParts) {
      tabs.push({ id: "appearance", label: isProductsBlock ? "Card" : "Card Preset" });
      tabs.push({ id: "imageStyle", label: isProductsBlock ? "Image" : "Image Style" });
      tabs.push({ id: "titleStyle", label: "Title" });
      tabs.push({ id: "metaStyle", label: "Meta" });
      tabs.push({ id: "contentStyle", label: "Content" });
      tabs.push({ id: "buttonStyle", label: isProductsBlock ? "Button" : "Button Style" });
    } else {
      tabs.push({ id: "appearance", label: "Appearance" });
      tabs.push({ id: "border", label: "Border" });
      tabs.push({ id: "borderRadius", label: "Border Radius" });
      tabs.push({ id: "effects", label: "Effects" });
      tabs.push({ id: "shadows", label: "Shadows" });
    }
  }
  if (showLayout) {
    tabs.push({ id: "layout", label: "Dimensions" });
  }
  if (showAdvanced) {
    tabs.push({ id: "advanced", label: "Visibility & CSS" });
  }
  if (showTypography) {
    tabs.push({ id: "typography", label: "Typography" });
  }

  const [activeTabId, setActiveTabId] = useState(() => {
    const availableIds = tabs.map((t) => t.id);
    if (globalLastSelectedStyleSubTab && availableIds.includes(globalLastSelectedStyleSubTab)) {
      return globalLastSelectedStyleSubTab;
    }
    if (availableIds.includes("appearance")) {
      return "appearance";
    }
    return availableIds[0] || "";
  });

  // Sync activeTabId if props/tabs list changes
  useEffect(() => {
    const availableIds = tabs.map((t) => t.id);
    if (!availableIds.includes(activeTabId)) {
      if (globalLastSelectedStyleSubTab && availableIds.includes(globalLastSelectedStyleSubTab)) {
        setActiveTabId(globalLastSelectedStyleSubTab);
      } else if (availableIds.includes("appearance")) {
        setActiveTabId("appearance");
      } else {
        setActiveTabId(availableIds[0] || "");
      }
    }
  }, [tabs, activeTabId]);

  // Sync global cache when active tab updates
  useEffect(() => {
    if (activeTabId) {
      globalLastSelectedStyleSubTab = activeTabId;
    }
  }, [activeTabId]);

  const activeTab = tabs.find((t) => t.id === activeTabId);

  return (
    <div className="builder-style-tab-panel-container">
      {/* Horizontal Sub-tabs Navigation */}
      {tabs.length > 1 && (
        <div className="builder-styling-sub-tabs" aria-label="Styling sub-sections">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={activeTabId === tab.id ? "is-active" : ""}
              onClick={() => setActiveTabId(tab.id)}
            >
              {getTabIcon(tab.id)}
              <span style={{ marginLeft: "4px" }}>{tab.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Active Tab Panel Content Area */}
      <div className="builder-style-tab-content-area">
        {activeTab && (
          <div className="builder-style-tab-content-header">
            <h3>{activeTab.label}</h3>
          </div>
        )}

        {/* Spacing Controls */}
        {activeTabId === "spacing" && showSpacing && (
          <div className="builder-style-section-content" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <SpacingControl
              id={spacingControlIds?.padding}
              label="Padding"
              value={style.padding}
              inheritedValue={inheritedSpacing?.padding}
              context="elementPadding"
              onChange={(padding) => patchStyle({ padding })}
            />
            <SpacingControl
              id={spacingControlIds?.margin}
              label="Margin"
              value={style.margin}
              inheritedValue={inheritedSpacing?.margin}
              context="elementMargin"
              onChange={(margin) => patchStyle({ margin })}
            />
          </div>
        )}

        {/* Background Controls */}
        {activeTabId === "background" && showBackground && (
          <div className="builder-style-section-content">
            <BackgroundControl
              value={style.background}
              onChange={(background) => patchStyle({ background })}
              onPickImage={onPickBackgroundImage}
            />
          </div>
        )}

        {/* Appearance Controls */}
        {activeTabId === "appearance" && showAppearance && (
          <div className="builder-style-section-content">
            {showCardParts ? (
              <>
                {isProductsBlock ? (
                  <div className="builder-card-style-controls" style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                    <div className="builder-field">
                      <span>Card Preset</span>
                      <InspectorChoiceGroup
                        value={target.cardPreset ?? "standard"}
                        options={[
                          { label: "Standard", value: "standard" },
                          { label: "Compact", value: "compact" },
                          { label: "Minimal", value: "minimal" },
                          { label: "Gallery", value: "gallery" },
                          { label: "Editorial", value: "editorial" },
                          { label: "Graph", value: "graph" },
                          { label: "Princity", value: "princity" },
                        ]}
                        onChange={(val) => onChange({ cardPreset: val })}
                      />
                    </div>
                    <div className="builder-style-two-col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                      <div className="builder-field">
                        <span>Card Style</span>
                        <InspectorChoiceGroup
                          value={target.cardStyle ?? "flat"}
                          options={[
                            { label: "Flat", value: "flat" },
                            { label: "Soft", value: "soft" },
                            { label: "Lined", value: "lined" },
                            { label: "None", value: "none" },
                          ]}
                          onChange={(val) => onChange({ cardStyle: val })}
                        />
                      </div>
                      <div className="builder-field">
                        <span>Image Frame</span>
                        <InspectorChoiceGroup
                          value={target.gridImageFrame ?? "none"}
                          options={[
                            { label: "None", value: "none" },
                            { label: "Soft", value: "soft" },
                          ]}
                          onChange={(val) => onChange({ gridImageFrame: val })}
                        />
                      </div>
                    </div>
                    <div className="builder-field">
                      <span>Card Theme</span>
                      <InspectorChoiceGroup
                        value={target.panelStyle ?? "default"}
                        options={[
                          { label: "Default", value: "default" },
                          { label: "Princity", value: "princity" },
                          { label: "Dark", value: "dark" },
                          { label: "Light", value: "light" },
                          { label: "Shadow", value: "clean-shadow" },
                          { label: "Flat Dark", value: "flat-dark" },
                          { label: "Flat White", value: "flat-white" },
                          { label: "Antigravity", value: "antigravity" },
                          { label: "Luxury", value: "luxury" },
                        ]}
                        onChange={(val) => onChange({ panelStyle: val })}
                      />
                    </div>
                    <div className="builder-field">
                      <span>Border Radius</span>
                      <InspectorChoiceGroup
                        value={
                          target.borderRadius === undefined
                            ? "inherit"
                            : [0, 4, 8, 12, 16, 24].includes(target.borderRadius)
                              ? String(target.borderRadius)
                              : "custom"
                        }
                        options={[
                          { label: "Inherit", value: "inherit" },
                          { label: "0px", value: "0" },
                          { label: "4px", value: "4" },
                          { label: "8px", value: "8" },
                          { label: "12px", value: "12" },
                          { label: "16px", value: "16" },
                          { label: "24px", value: "24" },
                          { label: "Custom", value: "custom" },
                        ]}
                        onChange={(val) => {
                          if (val === "inherit") {
                            onChange({ borderRadius: undefined });
                          } else if (val === "custom") {
                            onChange({ borderRadius: 10 });
                          } else {
                            onChange({ borderRadius: Number(val) });
                          }
                        }}
                      />
                    </div>
                    {target.borderRadius !== undefined && ![0, 4, 8, 12, 16, 24].includes(target.borderRadius) && (
                      <label className="builder-field">
                        <span>Custom Radius (px)</span>
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={target.borderRadius}
                          onChange={(event) => {
                            const val = event.target.value === "" ? 0 : Number(event.target.value);
                            onChange({ borderRadius: val });
                          }}
                        />
                      </label>
                    )}
                    <div className="builder-field">
                      <span>Background Mode</span>
                      <InspectorChoiceGroup
                        value={target.elementBackgroundMode ?? "default"}
                        options={[
                          { label: "Default", value: "default" },
                          { label: "Transparent", value: "transparent" },
                          { label: "Custom color", value: "custom" },
                        ]}
                        onChange={(val) => onChange({ elementBackgroundMode: val })}
                      />
                    </div>
                    {target.elementBackgroundMode === "custom" && (
                      <label className="builder-field">
                        <span>Background Color</span>
                        <div className="builder-background-presets">
                          {elementBackgroundPresets.map(
                            (preset: any) => (
                              <button
                                key={preset.value}
                                type="button"
                                className={
                                  target.elementBackground?.toLowerCase() ===
                                  preset.value
                                    ? "is-active"
                                    : ""
                                }
                                onClick={() =>
                                  onChange({ elementBackground: preset.value })
                                }
                              >
                                <span
                                  style={{
                                    background:
                                      preset.value,
                                  }}
                                />
                                {preset.label}
                              </button>
                            ),
                          )}
                        </div>
                        <div className="builder-color-row">
                          <input
                            type="color"
                            value={
                              target.elementBackground ??
                              "#ffffff"
                            }
                            onChange={(event) =>
                              onChange({ elementBackground: event.target.value })
                            }
                          />
                          <input
                            value={
                              target.elementBackground ??
                              "#ffffff"
                            }
                            onChange={(event) =>
                              onChange({ elementBackground: event.target.value })
                            }
                          />
                        </div>
                      </label>
                    )}
                  </div>
                ) : (
                  <div className="builder-card-style-controls" style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                    <div className="builder-style-subsection">
                      <strong>Card Preset</strong>
                      <div className="builder-card-preset-grid">
                        {BUILDER_CARD_PRESETS.map((preset) => (
                          <button
                            key={preset.value}
                            type="button"
                            className={
                              style.card?.preset === preset.value
                                ? "is-active"
                                : ""
                            }
                            onClick={() => patchCard({ preset: preset.value })}
                          >
                            <span aria-hidden="true" className={`is-${preset.value}`} />
                            <strong>{preset.label}</strong>
                            <small>{preset.description}</small>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="builder-style-subsection">
                      <strong>Hover / Press State</strong>
                      <div className="builder-style-chips-row">
                        {BUILDER_HOVER_PRESETS.map((preset) => (
                          <button
                            key={preset.value}
                            type="button"
                            className={`builder-style-chip${
                              style.card?.hoverPreset === preset.value
                                ? " is-active"
                                : ""
                            }`}
                            title={preset.description}
                            onClick={() => patchCard({ hoverPreset: preset.value })}
                          >
                            {preset.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <details className="builder-style-mini-advanced">
                      <summary>Advanced surface</summary>
                      <BorderEffectsControl
                        border={style.border}
                        effects={style.effects}
                        onBorderChange={(border) => patchStyle({ border })}
                        onEffectsChange={(effects) => patchStyle({ effects })}
                        showLayout={false}
                        showVisibility={false}
                        showCustomClass={false}
                      />
                    </details>
                  </div>
                )}

                {/* Card Spacing controls nested directly inside the Card tab */}
                <div className="builder-style-subsection-divider" style={{ borderTop: "1px solid var(--builder-ui-border)", margin: "16px 0 12px 0" }} />
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div className="builder-style-two-col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                    <div className="builder-style-subsection">
                      <strong>Card Padding</strong>
                      <div className="builder-style-chips-row">
                        {[
                          ["", "Inherit"],
                          ["0px", "None"],
                          ["12px", "Compact"],
                          ["20px", "Default"],
                          ["32px", "Comfort"],
                          ["48px", "Editorial"],
                        ].map(([value, label]) => (
                          <button
                            key={value || "inherit"}
                            type="button"
                            className={`builder-style-chip${(style.card?.cardPadding ?? "") === value ? " is-active" : ""}`}
                            onClick={() => patchCard({ cardPadding: value || undefined })}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="builder-style-subsection">
                      <strong>Content Gap</strong>
                      <div className="builder-style-chips-row">
                        {[
                          ["", "Inherit"],
                          ["0px", "None"],
                          ["6px", "Tight"],
                          ["12px", "Default"],
                          ["20px", "Comfort"],
                          ["32px", "Airy"],
                        ].map(([value, label]) => (
                          <button
                            key={value || "inherit"}
                            type="button"
                            className={`builder-style-chip${(style.card?.cardGap ?? "") === value ? " is-active" : ""}`}
                            onClick={() => patchCard({ cardGap: value || undefined })}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="builder-style-two-col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                    <label className="builder-typography-field">
                      <span className="builder-style-side-label-wrapper">Custom Padding</span>
                      <input
                        className="builder-style-color-text-input"
                        value={style.card?.cardPadding ?? ""}
                        placeholder="32px"
                        onChange={(event) => patchCard({ cardPadding: event.target.value })}
                        style={{ width: "100%" }}
                      />
                    </label>
                    <label className="builder-typography-field">
                      <span className="builder-style-side-label-wrapper">Custom Gap</span>
                      <input
                        className="builder-style-color-text-input"
                        value={style.card?.cardGap ?? ""}
                        placeholder="20px"
                        onChange={(event) => patchCard({ cardGap: event.target.value })}
                        style={{ width: "100%" }}
                      />
                    </label>
                  </div>
                </div>
              </>
            ) : (
              <BorderEffectsControl
                border={style.border}
                effects={style.effects}
                onBorderChange={(border) => patchStyle({ border })}
                onEffectsChange={(effects) => patchStyle({ effects })}
                showLayout={false}
                showVisibility={false}
                showCustomClass={false}
              />
            )}
          </div>
        )}

        {/* Border Controls */}
        {activeTabId === "border" && showAppearance && (
          <div className="builder-style-section-content">
            <BorderEffectsControl
              border={style.border}
              onBorderChange={(border) => patchStyle({ border })}
              showBorderOnly={true}
            />
          </div>
        )}

        {/* Border Radius Controls */}
        {activeTabId === "borderRadius" && showAppearance && (
          <div className="builder-style-section-content">
            <BorderEffectsControl
              border={style.border}
              onBorderChange={(border) => patchStyle({ border })}
              showRadiusOnly={true}
            />
          </div>
        )}

        {/* Effects Controls */}
        {activeTabId === "effects" && showAppearance && (
          <div className="builder-style-section-content">
            <BorderEffectsControl
              effects={style.effects}
              onEffectsChange={(effects) => patchStyle({ effects })}
              showOpacityOnly={true}
            />
          </div>
        )}

        {/* Shadows Controls */}
        {activeTabId === "shadows" && showAppearance && (
          <div className="builder-style-section-content">
            <BorderEffectsControl
              effects={style.effects}
              onEffectsChange={(effects) => patchStyle({ effects })}
              showShadowOnly={true}
            />
          </div>
        )}

        {/* showCardParts: Image Style */}
        {activeTabId === "imageStyle" && showCardParts && (
          <div className="builder-style-section-content" style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {isProductsBlock ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div className="builder-field">
                  <span>Image Fit</span>
                  <InspectorChoiceGroup
                    value={target.imageFit ?? "preset"}
                    options={[
                      { label: "Preset default", value: "preset" },
                      { label: "Contain", value: "contain" },
                      { label: "Cover", value: "cover" },
                      { label: "Fill / stretch", value: "fill" },
                    ]}
                    onChange={(val) =>
                      onChange({
                        imageFit: val === "preset" ? undefined : val,
                      })
                    }
                  />
                </div>
                <div className="builder-field">
                  <span>Image Ratio</span>
                  <InspectorChoiceGroup
                    value={target.imageRatio ?? "auto"}
                    options={[
                      { label: "Auto / preset", value: "auto" },
                      { label: "Square (1:1)", value: "square" },
                      { label: "Portrait (4:5)", value: "4:5" },
                      { label: "Portrait (3:4)", value: "3:4" },
                    ]}
                    onChange={(val) => onChange({ imageRatio: val })}
                  />
                </div>
                <div className="builder-field">
                  <span>Image Padding</span>
                  <InspectorChoiceGroup
                    value={target.imagePadding ?? "large"}
                    options={[
                      { label: "Frameless", value: "none" },
                      { label: "Inset 12", value: "small" },
                      { label: "Padded 24", value: "medium" },
                      { label: "Roomy 40", value: "large" },
                      { label: "Hero 64", value: "max" },
                    ]}
                    onChange={(val) => onChange({ imagePadding: val })}
                  />
                </div>
                <div className="builder-field">
                  <span>Image Frame</span>
                  <InspectorChoiceGroup
                    value={target.gridImageFrame ?? "none"}
                    options={[
                      { label: "None", value: "none" },
                      { label: "Soft", value: "soft" },
                    ]}
                    onChange={(val) => onChange({ gridImageFrame: val })}
                  />
                </div>
              </div>
            ) : (
              <>
                <div className="builder-style-subsection">
                  <strong>Image Ratio</strong>
                  <div className="builder-style-chips-row">
                    {[
                      ["auto", "Auto"],
                      ["square", "1:1"],
                      ["4:5", "4:5"],
                      ["3:4", "3:4"],
                      ["16:9", "16:9"],
                    ].map(([value, label]) => (
                      <button
                        key={value}
                        type="button"
                        className={`builder-style-chip${
                          (style.card?.imageRatio ?? "auto") === value
                            ? " is-active"
                            : ""
                        }`}
                        onClick={() =>
                          patchCard({
                            imageRatio: value as BuilderCardPartStyle["imageRatio"],
                          })
                        }
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="builder-style-subsection">
                  <strong>Image Fit</strong>
                  <div className="builder-card-fit-row" style={{ display: "flex", gap: "8px" }}>
                    {[
                      ["cover", "Cover", "Crop to fill"],
                      ["contain", "Contain", "Show full image"],
                      ["fill", "Fill", "Stretch to frame"],
                    ].map(([value, label, description]) => (
                      <button
                        key={value}
                        type="button"
                        className={
                          (style.card?.imageFit ?? "cover") === value
                            ? "is-active"
                            : ""
                        }
                        onClick={() =>
                          patchCard({
                            imageFit: value as BuilderCardPartStyle["imageFit"],
                          })
                        }
                        style={{
                          flex: "1",
                          padding: "8px",
                          borderRadius: "var(--builder-ui-radius-sm)",
                          border: "1px solid var(--builder-ui-border)",
                          background: "var(--builder-ui-surface)",
                          color: "var(--builder-ui-text)",
                          cursor: "pointer",
                        }}
                        title={description}
                      >
                        <strong>{label}</strong>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* showCardParts: Title Style */}
        {activeTabId === "titleStyle" && showCardParts && (
          <div className="builder-style-section-content" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div className="builder-style-subsection">
              <strong>Size</strong>
              <div className="builder-style-chips-row">
                {[
                  ["", "Inherit"],
                  ["1.1rem", "Meta"],
                  ["1.25rem", "Title"],
                  ["1.45rem", "H3"],
                  ["1.8rem", "H2"],
                ].map(([value, label]) => (
                  <button
                    key={value || "inherit"}
                    type="button"
                    className={`builder-style-chip${(style.card?.titleSize ?? "") === value ? " is-active" : ""}`}
                    onClick={() => patchCard({ titleSize: value || undefined })}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="builder-style-two-col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
              <label className="builder-typography-field">
                <span className="builder-style-side-label-wrapper">Color</span>
                <input
                  className="builder-style-color-text-input"
                  value={style.card?.titleColor ?? ""}
                  placeholder="currentColor"
                  onChange={(event) => patchCard({ titleColor: event.target.value })}
                  style={{ width: "100%" }}
                />
              </label>
              <label className="builder-typography-field">
                <span className="builder-style-side-label-wrapper">Margin</span>
                <input
                  className="builder-style-color-text-input"
                  value={style.card?.titleMargin ?? ""}
                  placeholder="0 0 8px"
                  onChange={(event) => patchCard({ titleMargin: event.target.value })}
                  style={{ width: "100%" }}
                />
              </label>
            </div>
          </div>
        )}

        {/* showCardParts: Meta Style */}
        {activeTabId === "metaStyle" && showCardParts && (
          <div className="builder-style-section-content" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div className="builder-style-two-col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
              <div className="builder-style-subsection">
                <strong>Size</strong>
                <div className="builder-style-chips-row">
                  {[
                    ["", "Inherit"],
                    ["0.7rem", "Tiny"],
                    ["0.85rem", "Meta"],
                    ["1rem", "Body"],
                  ].map(([value, label]) => (
                    <button
                      key={value || "inherit"}
                      type="button"
                      className={`builder-style-chip${(style.card?.metaSize ?? "") === value ? " is-active" : ""}`}
                      onClick={() => patchCard({ metaSize: value || undefined })}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="builder-style-subsection">
                <strong>Transform</strong>
                <div className="builder-style-chips-row">
                  {[
                    ["none", "Normal"],
                    ["uppercase", "Uppercase"],
                  ].map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      className={`builder-style-chip${(style.card?.metaTransform ?? "none") === value ? " is-active" : ""}`}
                      onClick={() =>
                        patchCard({
                          metaTransform: value as BuilderCardPartStyle["metaTransform"],
                        })
                      }
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="builder-style-two-col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
              <label className="builder-typography-field">
                <span className="builder-style-side-label-wrapper">Color</span>
                <input
                  className="builder-style-color-text-input"
                  value={style.card?.metaColor ?? ""}
                  placeholder="var(--builder-active-muted)"
                  onChange={(event) => patchCard({ metaColor: event.target.value })}
                  style={{ width: "100%" }}
                />
              </label>
              <label className="builder-typography-field">
                <span className="builder-style-side-label-wrapper">Spacing</span>
                <input
                  className="builder-style-color-text-input"
                  value={style.card?.metaSpacing ?? ""}
                  placeholder="8px"
                  onChange={(event) => patchCard({ metaSpacing: event.target.value })}
                  style={{ width: "100%" }}
                />
              </label>
            </div>
          </div>
        )}

        {/* showCardParts: Content Style */}
        {activeTabId === "contentStyle" && showCardParts && (
          <div className="builder-style-section-content" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div className="builder-style-two-col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
              <div className="builder-style-subsection">
                <strong>Size</strong>
                <div className="builder-style-chips-row">
                  {[
                    ["", "Inherit"],
                    ["0.9rem", "Compact"],
                    ["1rem", "Body"],
                    ["1.18rem", "Lead"],
                  ].map(([value, label]) => (
                    <button
                      key={value || "inherit"}
                      type="button"
                      className={`builder-style-chip${(style.card?.contentSize ?? "") === value ? " is-active" : ""}`}
                      onClick={() => patchCard({ contentSize: value || undefined })}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="builder-style-subsection">
                <strong>Line Height</strong>
                <div className="builder-style-chips-row">
                  {[
                    ["", "Inherit"],
                    ["1.35", "Tight"],
                    ["1.55", "Normal"],
                    ["1.75", "Airy"],
                  ].map(([value, label]) => (
                    <button
                      key={value || "inherit"}
                      type="button"
                      className={`builder-style-chip${(style.card?.contentLineHeight ?? "") === value ? " is-active" : ""}`}
                      onClick={() =>
                        patchCard({ contentLineHeight: value || undefined })
                      }
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="builder-style-two-col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
              <label className="builder-typography-field">
                <span className="builder-style-side-label-wrapper">Color</span>
                <input
                  className="builder-style-color-text-input"
                  value={style.card?.contentColor ?? ""}
                  placeholder="var(--builder-active-muted)"
                  onChange={(event) => patchCard({ contentColor: event.target.value })}
                  style={{ width: "100%" }}
                />
              </label>
              <label className="builder-typography-field">
                <span className="builder-style-side-label-wrapper">Max Width</span>
                <input
                  className="builder-style-color-text-input"
                  value={style.card?.contentMaxWidth ?? ""}
                  placeholder="42ch"
                  onChange={(event) =>
                    patchCard({ contentMaxWidth: event.target.value })
                  }
                  style={{ width: "100%" }}
                />
              </label>
            </div>
          </div>
        )}

        {/* showCardParts: Button / Link Style */}
        {activeTabId === "buttonStyle" && showCardParts && (
          <div className="builder-style-section-content" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {isProductsBlock ? (
              <>
                <label className="builder-field">
                  <span>Button Color</span>
                  <InspectorChoiceGroup
                    value={target.addToCartStyle ?? "inherit"}
                    options={[
                      { label: "Theme", value: "inherit" },
                      { label: "Blue", value: "blue" },
                      { label: "Dark", value: "dark" },
                      { label: "Light", value: "light" },
                    ]}
                    onChange={(value) =>
                      onChange({ addToCartStyle: value })
                    }
                  />
                </label>
                <label className="builder-field">
                  <span>Button Size</span>
                  <InspectorChoiceGroup
                    value={target.addToCartSize ?? "medium"}
                    options={[
                      { label: "Compact", value: "compact" },
                      { label: "Medium", value: "medium" },
                      { label: "Large", value: "large" },
                      { label: "Full", value: "full" },
                    ]}
                    onChange={(value) =>
                      onChange({ addToCartSize: value })
                    }
                  />
                </label>
                <label className="builder-field">
                  <span>Button Display</span>
                  <InspectorChoiceGroup
                    value={target.addToCartDisplay ?? "button"}
                    options={[
                      { label: "Text", value: "button" },
                      { label: "Icon", value: "icon" },
                    ]}
                    onChange={(value) =>
                      onChange({ addToCartDisplay: value })
                    }
                  />
                </label>
                <label className="builder-field">
                  <span>Button Visibility</span>
                  <InspectorChoiceGroup
                    value={target.addToCartVisibility ?? "hover"}
                    options={[
                      { label: "Hover", value: "hover" },
                      { label: "Always", value: "always" },
                    ]}
                    onChange={(value) =>
                      onChange({ addToCartVisibility: value })
                    }
                  />
                </label>
                <label className="builder-field">
                  <span>Button Position</span>
                  <InspectorChoiceGroup
                    value={target.addToCartPosition ?? "below"}
                    options={[
                      { label: "Below", value: "below" },
                      { label: "Under price", value: "under-price" },
                      { label: "Under wishlist", value: "under-wishlist" },
                    ]}
                    onChange={(value) =>
                      onChange({ addToCartPosition: value })
                    }
                  />
                </label>
              </>
            ) : (
              <>
                <div className="builder-style-subsection">
                  <strong>Alignment</strong>
                  <div className="builder-style-chips-row">
                    {[
                      ["", "Inherit"],
                      ["left", "Left"],
                      ["center", "Center"],
                      ["right", "Right"],
                    ].map(([value, label]) => (
                      <button
                        key={value || "inherit"}
                        type="button"
                        className={`builder-style-chip${(style.card?.buttonAlign ?? "") === value ? " is-active" : ""}`}
                        onClick={() =>
                          patchCard({
                            buttonAlign:
                              value === ""
                                ? undefined
                                : (value as BuilderCardPartStyle["buttonAlign"]),
                          })
                        }
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
                <label className="builder-typography-field">
                  <span className="builder-style-side-label-wrapper">Margin</span>
                  <input
                    className="builder-style-color-text-input"
                    value={style.card?.buttonMargin ?? ""}
                    placeholder="16px 0 0"
                    onChange={(event) => patchCard({ buttonMargin: event.target.value })}
                    style={{ width: "100%" }}
                  />
                </label>
              </>
            )}
          </div>
        )}



        {/* Dimensions Controls */}
        {activeTabId === "layout" && showLayout && (
          <div className="builder-style-section-content">
            <BorderEffectsControl
              effects={style.effects}
              onEffectsChange={(effects) => patchStyle({ ...style, effects })}
              showBorder={false}
              showEffects={false}
              showVisibility={false}
              showCustomClass={false}
            />
          </div>
        )}

        {/* Visibility & CSS Controls */}
        {activeTabId === "advanced" && showAdvanced && (
          <div className="builder-style-section-content">
            <BorderEffectsControl
              visibility={style.visibility}
              customClass={style.customClass}
              onVisibilityChange={(visibility) => patchStyle({ ...style, visibility })}
              onCustomClassChange={(customClass) => patchStyle({ ...style, customClass })}
              showBorder={false}
              showEffects={false}
              showLayout={false}
            />
          </div>
        )}

        {/* Typography Controls */}
        {activeTabId === "typography" && showTypography && (
          <div className="builder-style-section-content">
            <TypographyPanel
              value={
                typeof target.typography === "object" &&
                target.typography &&
                !("variant" in target.typography) &&
                ("title" in target.typography ||
                  "body" in target.typography)
                  ? (target.typography as TypographyGroup).title
                  : (target.typography as TypographySettings | undefined)
              }
              onChange={(typography) => onChange({ typography })}
              onOpenGlobalTypographySettings={onOpenGlobalTypographySettings}
            />
          </div>
        )}
      </div>
    </div>
  );
}
