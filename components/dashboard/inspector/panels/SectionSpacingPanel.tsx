"use client";

import React from "react";
import { useInspector } from "../../context/InspectorContext";
import {
  resolveBuilderSpacing,
  BUILDER_SPACING_SCALE,
  getDefaultSpacingToken,
  type BuilderSpacingContext,
} from "@/lib/builderSpacing";
import { Sliders } from "lucide-react";

interface SectionSpacingControlProps {
  label: string;
  sides: string[];
  values: Record<string, string | undefined>;
  inheritedValues: Record<string, string | undefined>;
  context: BuilderSpacingContext;
  onChange: (newValues: Record<string, string | undefined>) => void;
}

function SectionSpacingControl({
  label,
  sides,
  values,
  inheritedValues,
  context,
  onChange,
}: SectionSpacingControlProps) {
  const presets: { label: string; value: string }[] = [
    { label: "Global", value: "inherit" },
    { label: "None", value: "none" },
    { label: "XS", value: "xs" },
    { label: "S", value: "sm" },
    { label: "M", value: "md" },
    { label: "L", value: "lg" },
    { label: "XL", value: "xl" },
    { label: "2XL", value: "2xl" },
    { label: "3XL", value: "3xl" },
  ];

  const isAllSidesEqual = () => {
    if (sides.length <= 1) return true;
    const firstVal = values[sides[0]];
    return sides.every((side) => values[side] === firstVal);
  };

  const [linked, setLinked] = React.useState(() => isAllSidesEqual());

  const valuesString = JSON.stringify(values);
  React.useEffect(() => {
    setLinked(isAllSidesEqual());
  }, [valuesString]);

  const setSideValue = (side: string, next: string) => {
    if (linked && sides.length > 1) {
      const updated: Record<string, string> = {};
      sides.forEach((s) => {
        updated[s] = next;
      });
      onChange(updated);
    } else {
      onChange({ [side]: next });
    }
  };

  const renderSideControl = (side: string, sideLabel: string) => {
    const val = values[side];
    const inherited = inheritedValues[side];

    const isPresetToken = (v?: string) => {
      if (!v) return true;
      if (v === "inherit") return true;
      return presets.some((p) => p.value === v || (v === "small" && p.value === "sm") || (v === "medium" && p.value === "md") || (v === "large" && p.value === "lg"));
    };

    const isPreset = isPresetToken(val);
    const isCustom = !isPreset;

    const numericMatch = val ? val.trim().match(/^(\d+)px$/i) : null;
    const customNumericValue = numericMatch ? numericMatch[1] : "";

    const handleCustomNumericChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const num = event.target.value.replace(/\D/g, "");
      setSideValue(side, num ? `${num}px` : "0px");
    };

    let selectValue = "inherit";
    if (isCustom) {
      selectValue = "custom";
    } else if (val) {
      if (val === "small") selectValue = "sm";
      else if (val === "medium") selectValue = "md";
      else if (val === "large") selectValue = "lg";
      else selectValue = val;
    } else {
      selectValue = "inherit";
    }

    const handleChipClick = (presetValue: string) => {
      if (presetValue === "custom") {
        const currentPx = resolveBuilderSpacing(val ?? "inherit", context, inherited).px;
        setSideValue(side, `${currentPx > 0 ? currentPx : 32}px`);
      } else {
        setSideValue(side, presetValue);
      }
    };

    return (
      <div key={side} className="builder-style-side-control-chips-wrapper">
        <span className="builder-style-side-label">{sideLabel}</span>
        <div className="builder-style-chips-row">
          {presets.map((preset) => {
            const isSelected = selectValue === preset.value;
            const px = preset.value === "inherit" ? null : BUILDER_SPACING_SCALE[preset.value as keyof typeof BUILDER_SPACING_SCALE];
            const displayLabel = preset.value === "inherit" ? "Global" : `${preset.label} ${px}px`;
            return (
              <button
                key={preset.value}
                type="button"
                className={`builder-style-chip${isSelected ? " is-active" : ""}`}
                onClick={() => handleChipClick(preset.value)}
                title={preset.value === "inherit" ? `Inherit global: ${resolveBuilderSpacing(undefined, context, inherited).label}` : undefined}
              >
                {displayLabel}
              </button>
            );
          })}
          <button
            type="button"
            className={`builder-style-chip builder-style-chip--custom${selectValue === "custom" ? " is-active" : ""}`}
            onClick={() => handleChipClick("custom")}
          >
            <Sliders size={11} style={{ marginRight: "4px" }} />
            Custom
          </button>
          {isCustom && (
            <div className="custom-spacing-input-wrapper">
              <input
                type="text"
                pattern="[0-9]*"
                inputMode="numeric"
                value={customNumericValue}
                onChange={handleCustomNumericChange}
                placeholder="0"
              />
              <span className="custom-spacing-unit">px</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  const showLinkCheckbox = sides.length > 1;

  const getGlobalLabel = () => {
    return sides
      .map((side) => {
        const sideChar = side.charAt(0).toUpperCase();
        const raw = inheritedValues[side];
        const resolved = resolveBuilderSpacing(undefined, context, raw).label;
        return `${sideChar} ${resolved}`;
      })
      .join(" · ");
  };

  return (
    <div className="builder-style-spacing">
      <div className="builder-style-spacing-header">
        <strong>{label}</strong>
        {showLinkCheckbox && (
          <label className="builder-check builder-style-link-toggle">
            <input
              type="checkbox"
              checked={linked}
              onChange={(event) => {
                const nextLinked = event.target.checked;
                setLinked(nextLinked);
                if (nextLinked) {
                  const firstVal = values[sides[0]] ?? "inherit";
                  const updated: Record<string, string> = {};
                  sides.forEach((s) => {
                    updated[s] = firstVal;
                  });
                  onChange(updated);
                }
              }}
            />
            <span>Link sides</span>
          </label>
        )}
      </div>
      <small className="builder-style-spacing-source">
        Global: {getGlobalLabel()}
      </small>
      <div className="builder-style-side-controls">
        {linked && sides.length > 1
          ? renderSideControl(sides[0], "ALL SIDES")
          : sides.map((side) => renderSideControl(side, side.toUpperCase()))}
      </div>
    </div>
  );
}

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
        <SectionSpacingControl
          label="Padding"
          sides={["top", "bottom"]}
          values={{
            top: selectedSection.topSpacing,
            bottom: selectedSection.bottomSpacing,
          }}
          inheritedValues={{
            top: shellSettings.sectionPaddingTop,
            bottom: shellSettings.sectionPaddingBottom,
          }}
          context="sectionPadding"
          onChange={(newVals) => {
            updateSelected({
              topSpacing: newVals.top !== undefined ? newVals.top : selectedSection.topSpacing,
              bottomSpacing: newVals.bottom !== undefined ? newVals.bottom : selectedSection.bottomSpacing,
            });
          }}
        />

        <SectionSpacingControl
          label="Margin"
          sides={["top", "bottom"]}
          values={{
            top: selectedSection.topMargin,
            bottom: selectedSection.bottomMargin,
          }}
          inheritedValues={{
            top: shellSettings.sectionMarginTop,
            bottom: shellSettings.sectionMarginBottom,
          }}
          context="sectionMargin"
          onChange={(newVals) => {
            updateSelected({
              topMargin: newVals.top !== undefined ? newVals.top : selectedSection.topMargin,
              bottomMargin: newVals.bottom !== undefined ? newVals.bottom : selectedSection.bottomMargin,
            });
          }}
        />

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
