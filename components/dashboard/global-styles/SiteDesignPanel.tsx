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
        <strong>Site Design</strong>
        <span>{design.preset ?? "custom"}</span>
      </div>

      <label className="builder-field">
        <span>Design Preset</span>
        <InspectorChoiceGroup
          value={design.preset ?? "princity"}
          options={[
            { label: "Princity", value: "princity" },
            { label: "Editorial", value: "editorial" },
            { label: "Contrast", value: "contrast" },
          ]}
          onChange={(value) =>
            applyDesignPreset(value as NonNullable<BuilderDesign["preset"]>)
          }
        />
      </label>

      <label className="builder-field">
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

      <div className="builder-design-grid">
        {[
          ["pageBackground", "Page"],
          ["textColor", "Text"],
          ["mutedTextColor", "Muted"],
          ["accentColor", "Accent"],
          ["surfaceColor", "Surface"],
          ["buttonBackground", "Button"],
        ].map(([key, label]) => (
          <label key={key} className="builder-swatch-field">
            <span>{label}</span>
            <input
              type="color"
              value={
                (design[key as keyof BuilderDesign] as string) ??
                "#ffffff"
              }
              onChange={(event) =>
                updateDesign({
                  [key]: event.target.value,
                  preset: undefined,
                } as Partial<BuilderDesign>)
              }
            />
          </label>
        ))}
      </div>

      <div className="builder-two-column">
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

      <div className="builder-card-title">
        <strong>Storefront Styling</strong>
        <span>global styling + colors</span>
      </div>

      <label className="builder-field">
        <span>Storefront Style Preset</span>
        <select
          value={shellSettings.storefrontPreset}
          onChange={(event) =>
            updateShellSettings({
              storefrontPreset: event.target.value,
            })
          }
        >
          <option value="minimal">Minimal (Dark gray, round buttons)</option>
          <option value="soft">Soft (Sage tones, medium round buttons)</option>
          <option value="elevated">Elevated (Slate tones, large card shadows)</option>
          <option value="boutique">Boutique (Red accents, square buttons)</option>
          <option value="princity">Princity (Pure white, bold borders)</option>
        </select>
      </label>

      <div className="builder-design-grid">
        <label className="builder-swatch-field">
          <span>Primary Color</span>
          <input
            type="color"
            value={shellSettings.primaryColor || "#111111"}
            onChange={(event) =>
              updateShellSettings({
                primaryColor: event.target.value,
              })
            }
          />
        </label>

        <label className="builder-swatch-field">
          <span>Accent Color</span>
          <input
            type="color"
            value={shellSettings.accentColor || "#111111"}
            onChange={(event) =>
              updateShellSettings({
                accentColor: event.target.value,
              })
            }
          />
        </label>
      </div>
    </div>
  );
}
