"use client";

import React from "react";
import { useGlobalStyles } from "../context/GlobalStylesContext";
import { InspectorChoiceGroup } from "../inspector/panels/InspectorSharedControls";
import type { BuilderColorScheme, BuilderDesign } from "../builderTypes";

export default function SiteDesignPanel() {
  const { design, updateDesign, applyDesignPreset, shellSettings, updateShellSettings } = useGlobalStyles();

  return (
    <div className="builder-global-styles-group">
      <div className="builder-card-title">
        <strong>Design Preset</strong>
        <span>website presets</span>
      </div>

      <div className="builder-preset-cards-grid">
        {[
          { id: "princity", label: "Princity", description: "Clean modern design", colors: ["#ffffff", "#111111", "#6366f1"] },
          { id: "editorial", label: "Editorial", description: "Elegant classic serif", colors: ["#fafaf9", "#292524", "#e0f2fe"] },
          { id: "contrast", label: "Contrast", description: "Stark bold borders", colors: ["#000000", "#ffffff", "#ffffff"] }
        ].map((p) => {
          const isActive = (design.preset ?? "princity") === p.id;
          return (
            <button
              key={p.id}
              type="button"
              className={`builder-preset-card${isActive ? " is-active" : ""}`}
              onClick={() => applyDesignPreset(p.id as any)}
            >
              <div className="builder-preset-card-preview">
                {p.colors.map((c, i) => (
                  <span key={i} style={{ backgroundColor: c }} />
                ))}
              </div>
              <strong>{p.label}</strong>
              <small>{p.description}</small>
            </button>
          );
        })}
      </div>

      <label className="builder-field" style={{ marginTop: "14px" }}>
        <span>Website Color Mode</span>
        <InspectorChoiceGroup
          value={design.colorScheme ?? "auto"}
          options={[
            { label: "Auto", value: "auto" },
            { label: "Light", value: "light" },
            { label: "Dark", value: "dark" },
          ]}
          onChange={(value) =>
            updateDesign({
              colorScheme: value as BuilderColorScheme,
              preset: undefined,
            })
          }
        />
      </label>

      <div className="builder-card-title" style={{ marginTop: "16px" }}>
        <strong>Website Colors</strong>
        <span>page base palette</span>
      </div>

      <div className="builder-design-grid">
        {[
          ["pageBackground", "Page"],
          ["textColor", "Text"],
          ["mutedTextColor", "Muted"],
          ["accentColor", "Accent"],
          ["surfaceColor", "Surface"],
          ["buttonBackground", "Button"],
        ].map(([key, label]) => {
          const colorVal = (design[key as keyof BuilderDesign] as string) ?? "#ffffff";
          return (
            <label key={key} className="builder-swatch-field">
              <span>{label}</span>
              <div className="builder-swatch-color-preview-wrapper">
                <span
                  className="builder-swatch-color-preview"
                  style={{ backgroundColor: colorVal }}
                />
                <span className="builder-swatch-color-value">
                  {colorVal}
                </span>
                <input
                  type="color"
                  value={colorVal}
                  onChange={(event) =>
                    updateDesign({
                      [key]: event.target.value,
                      preset: undefined,
                    } as Partial<BuilderDesign>)
                  }
                />
              </div>
            </label>
          );
        })}
      </div>

      <div className="builder-two-column" style={{ marginTop: "10px" }}>
        <label className="builder-field">
          <span>Radius</span>
          <InspectorChoiceGroup
            value={design.radius ?? "8px"}
            options={[
              { label: "Flat", value: "0px" },
              { label: "Small", value: "4px" },
              { label: "Medium", value: "8px" },
              { label: "Large", value: "16px" },
              { label: "Pill", value: "999px" },
            ]}
            onChange={(value) =>
              updateDesign({
                radius: value,
                preset: undefined,
              })
            }
          />
        </label>

        <label className="builder-field">
          <span>Gutter</span>
          <InspectorChoiceGroup
            value={design.sectionGutter ?? "48px"}
            options={[
              { label: "Tight", value: "28px" },
              { label: "Medium", value: "48px" },
              { label: "Wide", value: "72px" },
            ]}
            onChange={(value) =>
              updateDesign({
                sectionGutter: value,
                preset: undefined,
              })
            }
          />
        </label>
      </div>

      <div className="builder-card-title" style={{ marginTop: "20px" }}>
        <strong>Storefront Presets</strong>
        <span>global style presets</span>
      </div>

      <div className="builder-storefront-presets-grid">
        {[
          { id: "minimal", label: "Minimal", desc: "Dark gray, rounded buttons", colors: ["#1f2937", "#f3f4f6"] },
          { id: "soft", label: "Soft", desc: "Sage tones, medium rounded", colors: ["#6b7280", "#ecfdf5"] },
          { id: "elevated", label: "Elevated", desc: "Slate tones, card shadows", colors: ["#4b5563", "#f9fafb"] },
          { id: "boutique", label: "Boutique", desc: "Red accents, square buttons", colors: ["#ef4444", "#ffffff"] },
          { id: "princity", label: "Princity", desc: "Pure white, bold borders", colors: ["#111111", "#ffffff"] }
        ].map((p) => {
          const isActive = shellSettings.storefrontPreset === p.id;
          return (
            <button
              key={p.id}
              type="button"
              className={`builder-storefront-preset-card${isActive ? " is-active" : ""}`}
              onClick={() => updateShellSettings({ storefrontPreset: p.id })}
            >
              <div className="builder-storefront-preset-card-head">
                <strong>{p.label}</strong>
                <div className="builder-storefront-preset-colors">
                  {p.colors.map((c, idx) => (
                    <span key={idx} style={{ backgroundColor: c }} />
                  ))}
                </div>
              </div>
              <small>{p.desc}</small>
            </button>
          );
        })}
      </div>

      <div className="builder-card-title" style={{ marginTop: "16px" }}>
        <strong>Storefront Colors</strong>
        <span>theme overrides</span>
      </div>

      <div className="builder-design-grid">
        {[
          ["primaryColor", "Primary", shellSettings.primaryColor || "#111111", (val: string) => updateShellSettings({ primaryColor: val })],
          ["accentColor", "Accent", shellSettings.accentColor || "#111111", (val: string) => updateShellSettings({ accentColor: val })]
        ].map(([key, label, value, onChange]) => {
          const colorVal = value as string;
          return (
            <label key={key as string} className="builder-swatch-field">
              <span>{label as string}</span>
              <div className="builder-swatch-color-preview-wrapper">
                <span
                  className="builder-swatch-color-preview"
                  style={{ backgroundColor: colorVal }}
                />
                <span className="builder-swatch-color-value">
                  {colorVal}
                </span>
                <input
                  type="color"
                  value={colorVal}
                  onChange={(event) => (onChange as Function)(event.target.value)}
                />
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
}
