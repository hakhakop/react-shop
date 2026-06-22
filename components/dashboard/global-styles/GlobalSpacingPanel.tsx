"use client";

import React, { useEffect } from "react";
import { useGlobalStyles } from "../context/GlobalStylesContext";
import {
  resolveBuilderSpacing,
  BUILDER_SPACING_SCALE,
  TOKEN_LABELS,
  type BuilderSpacingContext,
  getDefaultSpacingToken,
} from "@/lib/builderSpacing";
import { Sliders } from "lucide-react";

interface GlobalSpacingControlProps {
  label: string;
  value: string | undefined;
  context: BuilderSpacingContext;
  onChange: (newValue: any) => void;
}

function GlobalSpacingControl({
  label,
  value,
  context,
  onChange,
}: GlobalSpacingControlProps) {
  const presets = ["none", "xs", "sm", "md", "lg", "xl", "2xl", "3xl"] as const;

  const isPresetToken = (val: string) => {
    return (
      val === "none" ||
      val === "xs" ||
      val === "sm" ||
      val === "md" ||
      val === "lg" ||
      val === "xl" ||
      val === "2xl" ||
      val === "3xl" ||
      val === "small" ||
      val === "medium" ||
      val === "large"
    );
  };

  const isPreset = !value || isPresetToken(value);
  const isCustom = !isPreset;

  const numericMatch = value ? value.trim().match(/^(\d+)px$/i) : null;
  const customNumericValue = numericMatch ? numericMatch[1] : "";

  const handleCustomNumericChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const num = event.target.value.replace(/\D/g, "");
    onChange(num ? `${num}px` : "0px");
  };

  const defaultVal = getDefaultSpacingToken(context);
  let selectValue: string = defaultVal;
  if (isCustom) {
    selectValue = "custom";
  } else if (value) {
    if (value === "small") selectValue = "sm";
    else if (value === "medium") selectValue = "md";
    else if (value === "large") selectValue = "lg";
    else selectValue = value;
  } else {
    selectValue = defaultVal;
  }

  const handleChipClick = (presetValue: string) => {
    if (presetValue === "custom") {
      const currentPx = resolveBuilderSpacing(value ?? defaultVal, context).px;
      onChange(`${currentPx > 0 ? currentPx : 32}px`);
    } else {
      onChange(presetValue);
    }
  };

  return (
    <div className="builder-field spacing-control-wrapper">
      <span className="builder-style-side-label-wrapper">{label}</span>
      <div className="spacing-control-row">
        <div className="builder-style-chips-row">
          {presets.map((preset) => {
            const isSelected = selectValue === preset;
            const px = BUILDER_SPACING_SCALE[preset];
            const labelName = TOKEN_LABELS[preset];
            const displayLabel = `${labelName === "None" ? "None" : labelName} ${px}px`;
            return (
              <button
                key={preset}
                type="button"
                className={`builder-style-chip${isSelected ? " is-active" : ""}`}
                onClick={() => handleChipClick(preset)}
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
        <div className="builder-two-column">
          <GlobalSpacingControl label="Default Top Padding" value={shellSettings.sectionPaddingTop} context="sectionPadding" onChange={(val) => updateShellSettings({ sectionPaddingTop: val })} />
          <GlobalSpacingControl label="Default Bottom Padding" value={shellSettings.sectionPaddingBottom} context="sectionPadding" onChange={(val) => updateShellSettings({ sectionPaddingBottom: val })} />
        </div>
        <div className="builder-two-column">
          <GlobalSpacingControl label="Default Top Margin" value={shellSettings.sectionMarginTop} context="sectionMargin" onChange={(val) => updateShellSettings({ sectionMarginTop: val })} />
          <GlobalSpacingControl label="Default Bottom Margin" value={shellSettings.sectionMarginBottom} context="sectionMargin" onChange={(val) => updateShellSettings({ sectionMarginBottom: val })} />
        </div>
      </section>

      <section id="global-spacing-row" className="builder-global-spacing-group" tabIndex={-1}>
        <div className="builder-card-title">
          <strong>Row Spacing</strong>
          <span>default padding, margin + gap</span>
        </div>
        <div className="builder-two-column">
          <GlobalSpacingControl label="Row Padding Top" value={shellSettings.rowPaddingTop} context="rowPadding" onChange={(val) => updateShellSettings({ rowPaddingTop: val })} />
          <GlobalSpacingControl label="Row Padding Bottom" value={shellSettings.rowPaddingBottom} context="rowPadding" onChange={(val) => updateShellSettings({ rowPaddingBottom: val })} />
        </div>
        <div className="builder-two-column">
          <GlobalSpacingControl label="Row Margin Top" value={shellSettings.rowMarginTop} context="rowMargin" onChange={(val) => updateShellSettings({ rowMarginTop: val })} />
          <GlobalSpacingControl label="Row Margin Bottom" value={shellSettings.rowMarginBottom} context="rowMargin" onChange={(val) => updateShellSettings({ rowMarginBottom: val })} />
        </div>
        <GlobalSpacingControl label="Gap Between Rows" value={shellSettings.rowGap} context="rowGap" onChange={(val) => updateShellSettings({ rowGap: val })} />
      </section>

      <section id="global-spacing-element" className="builder-global-spacing-group" tabIndex={-1}>
        <div className="builder-card-title">
          <strong>Element Spacing</strong>
          <span>default padding + margin on every side</span>
        </div>
        <div className="builder-two-column">
          <GlobalSpacingControl label="Padding Top" value={shellSettings.elementPaddingTop} context="elementPadding" onChange={(val) => updateShellSettings({ elementPaddingTop: val })} />
          <GlobalSpacingControl label="Padding Right" value={shellSettings.elementPaddingRight} context="elementPadding" onChange={(val) => updateShellSettings({ elementPaddingRight: val })} />
          <GlobalSpacingControl label="Padding Bottom" value={shellSettings.elementPaddingBottom} context="elementPadding" onChange={(val) => updateShellSettings({ elementPaddingBottom: val })} />
          <GlobalSpacingControl label="Padding Left" value={shellSettings.elementPaddingLeft} context="elementPadding" onChange={(val) => updateShellSettings({ elementPaddingLeft: val })} />
        </div>
        <div className="builder-two-column">
          <GlobalSpacingControl label="Margin Top" value={shellSettings.elementMarginTop} context="elementMargin" onChange={(val) => updateShellSettings({ elementMarginTop: val })} />
          <GlobalSpacingControl label="Margin Right" value={shellSettings.elementMarginRight} context="elementMargin" onChange={(val) => updateShellSettings({ elementMarginRight: val })} />
          <GlobalSpacingControl label="Margin Bottom" value={shellSettings.elementMarginBottom} context="elementMargin" onChange={(val) => updateShellSettings({ elementMarginBottom: val })} />
          <GlobalSpacingControl label="Margin Left" value={shellSettings.elementMarginLeft} context="elementMargin" onChange={(val) => updateShellSettings({ elementMarginLeft: val })} />
        </div>
      </section>
    </div>
  );
}
