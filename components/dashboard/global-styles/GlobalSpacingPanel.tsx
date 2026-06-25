"use client";

import React, { useEffect } from "react";
import { useGlobalStyles } from "../context/GlobalStylesContext";
import {
  resolveBuilderSpacing,
  BUILDER_SPACING_SCALE,
  type BuilderSpacingContext,
  getDefaultSpacingToken,
} from "@/lib/builderSpacing";
import { Sliders } from "lucide-react";

interface GlobalSpacingControlProps {
  label: string;
  sides: string[];
  values: Record<string, string | undefined>;
  context: BuilderSpacingContext;
  onChange: (newValues: Record<string, string | undefined>) => void;
}

function GlobalSpacingControl({
  label,
  sides,
  values,
  context,
  onChange,
}: GlobalSpacingControlProps) {
  const presets: { label: string; value: string }[] = [
    { label: "None", value: "none" },
    { label: "XS", value: "xs" },
    { label: "S", value: "sm" },
    { label: "M", value: "md" },
    { label: "L", value: "lg" },
    { label: "XL", value: "xl" },
    { label: "2XL", value: "2xl" },
    { label: "3XL", value: "3xl" },
  ];

  // Check if all sides have the same value (defaulting to true if empty or single side)
  const isAllSidesEqual = () => {
    if (sides.length <= 1) return true;
    const firstVal = values[sides[0]];
    return sides.every((side) => values[side] === firstVal);
  };

  const [linked, setLinked] = React.useState(() => isAllSidesEqual());

  // Keep link state in sync if external values change
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
    
    // Check if the current value is a preset
    const isPresetToken = (v?: string) => {
      if (!v) return true; // default fallback is treated as preset
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

    const defaultVal = getDefaultSpacingToken(context);
    let selectValue: string = defaultVal;
    if (isCustom) {
      selectValue = "custom";
    } else if (val) {
      if (val === "small") selectValue = "sm";
      else if (val === "medium") selectValue = "md";
      else if (val === "large") selectValue = "lg";
      else selectValue = val;
    } else {
      selectValue = defaultVal;
    }

    const handleChipClick = (presetValue: string) => {
      if (presetValue === "custom") {
        const currentPx = resolveBuilderSpacing(val ?? defaultVal, context).px;
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
            const px = BUILDER_SPACING_SCALE[preset.value as keyof typeof BUILDER_SPACING_SCALE];
            const displayLabel = `${preset.label} ${px}px`;
            return (
              <button
                key={preset.value}
                type="button"
                className={`builder-style-chip${isSelected ? " is-active" : ""}`}
                onClick={() => handleChipClick(preset.value)}
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
                  const firstVal = values[sides[0]] ?? getDefaultSpacingToken(context);
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
      <div className="builder-style-side-controls">
        {linked && sides.length > 1
          ? renderSideControl(sides[0], "ALL SIDES")
          : sides.map((side) => renderSideControl(side, side.toUpperCase()))}
      </div>
    </div>
  );
}

export default function GlobalSpacingPanel() {
  const {
    shellSettings,
    updateShellSettings,
    shellStatus,
    globalSpacingFocus,
    clearGlobalSpacingFocus,
  } = useGlobalStyles();

  useEffect(() => {
    if (!globalSpacingFocus) return;
    const timer = window.setTimeout(() => {
      const el = document.getElementById(`global-spacing-${globalSpacingFocus}`);
      if (el) {
        el.focus();
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        clearGlobalSpacingFocus?.();
      }
    }, 150);
    return () => window.clearTimeout(timer);
  }, [globalSpacingFocus, clearGlobalSpacingFocus]);

  return (
    <div className="builder-global-styles-group builder-global-spacing-tab">
      <div className="builder-shell-note">
        <strong>{shellStatus}</strong>
        <span>
          Sections, rows, and elements inherit these defaults until spacing
          is overridden locally.
        </span>
      </div>

      <section id="global-spacing-section" className="builder-global-spacing-group" tabIndex={-1}>
        <div className="builder-card-title">
          <strong>Section Spacing</strong>
          <span>default padding + margin</span>
        </div>
        <GlobalSpacingControl
          label="Padding"
          sides={["top", "bottom"]}
          values={{
            top: shellSettings.sectionPaddingTop,
            bottom: shellSettings.sectionPaddingBottom,
          }}
          context="sectionPadding"
          onChange={(newVals) => {
            updateShellSettings({
              sectionPaddingTop: newVals.top !== undefined ? newVals.top : shellSettings.sectionPaddingTop,
              sectionPaddingBottom: newVals.bottom !== undefined ? newVals.bottom : shellSettings.sectionPaddingBottom,
            });
          }}
        />
        <GlobalSpacingControl
          label="Margin"
          sides={["top", "bottom"]}
          values={{
            top: shellSettings.sectionMarginTop,
            bottom: shellSettings.sectionMarginBottom,
          }}
          context="sectionMargin"
          onChange={(newVals) => {
            updateShellSettings({
              sectionMarginTop: newVals.top !== undefined ? newVals.top : shellSettings.sectionMarginTop,
              sectionMarginBottom: newVals.bottom !== undefined ? newVals.bottom : shellSettings.sectionMarginBottom,
            });
          }}
        />
      </section>

      <section id="global-spacing-row" className="builder-global-spacing-group" tabIndex={-1}>
        <div className="builder-card-title">
          <strong>Row Spacing</strong>
          <span>default padding, margin + gap</span>
        </div>
        <GlobalSpacingControl
          label="Padding"
          sides={["top", "bottom"]}
          values={{
            top: shellSettings.rowPaddingTop,
            bottom: shellSettings.rowPaddingBottom,
          }}
          context="rowPadding"
          onChange={(newVals) => {
            updateShellSettings({
              rowPaddingTop: newVals.top !== undefined ? newVals.top : shellSettings.rowPaddingTop,
              rowPaddingBottom: newVals.bottom !== undefined ? newVals.bottom : shellSettings.rowPaddingBottom,
            });
          }}
        />
        <GlobalSpacingControl
          label="Margin"
          sides={["top", "bottom"]}
          values={{
            top: shellSettings.rowMarginTop,
            bottom: shellSettings.rowMarginBottom,
          }}
          context="rowMargin"
          onChange={(newVals) => {
            updateShellSettings({
              rowMarginTop: newVals.top !== undefined ? newVals.top : shellSettings.rowMarginTop,
              rowMarginBottom: newVals.bottom !== undefined ? newVals.bottom : shellSettings.rowMarginBottom,
            });
          }}
        />
        <GlobalSpacingControl
          label="Gap Between Rows"
          sides={["gap"]}
          values={{
            gap: shellSettings.rowGap,
          }}
          context="rowGap"
          onChange={(newVals) => {
            updateShellSettings({
              rowGap: newVals.gap,
            });
          }}
        />
      </section>

      <section id="global-spacing-element" className="builder-global-spacing-group" tabIndex={-1}>
        <div className="builder-card-title">
          <strong>Element Spacing</strong>
          <span>default padding + margin on every side</span>
        </div>
        <GlobalSpacingControl
          label="Padding"
          sides={["top", "right", "bottom", "left"]}
          values={{
            top: shellSettings.elementPaddingTop,
            right: shellSettings.elementPaddingRight,
            bottom: shellSettings.elementPaddingBottom,
            left: shellSettings.elementPaddingLeft,
          }}
          context="elementPadding"
          onChange={(newVals) => {
            updateShellSettings({
              elementPaddingTop: newVals.top !== undefined ? newVals.top : shellSettings.elementPaddingTop,
              elementPaddingRight: newVals.right !== undefined ? newVals.right : shellSettings.elementPaddingRight,
              elementPaddingBottom: newVals.bottom !== undefined ? newVals.bottom : shellSettings.elementPaddingBottom,
              elementPaddingLeft: newVals.left !== undefined ? newVals.left : shellSettings.elementPaddingLeft,
            });
          }}
        />
        <GlobalSpacingControl
          label="Margin"
          sides={["top", "right", "bottom", "left"]}
          values={{
            top: shellSettings.elementMarginTop,
            right: shellSettings.elementMarginRight,
            bottom: shellSettings.elementMarginBottom,
            left: shellSettings.elementMarginLeft,
          }}
          context="elementMargin"
          onChange={(newVals) => {
            updateShellSettings({
              elementMarginTop: newVals.top !== undefined ? newVals.top : shellSettings.elementMarginTop,
              elementMarginRight: newVals.right !== undefined ? newVals.right : shellSettings.elementMarginRight,
              elementMarginBottom: newVals.bottom !== undefined ? newVals.bottom : shellSettings.elementMarginBottom,
              elementMarginLeft: newVals.left !== undefined ? newVals.left : shellSettings.elementMarginLeft,
            });
          }}
        />
      </section>
    </div>
  );
}
