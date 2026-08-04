"use client";

import type {
  BuilderSpacingPreset,
  BuilderSpacingSides,
} from "@/lib/builderVisualStyle";
import {
  BUILDER_SPACING_SCALE,
  resolveBuilderSpacing,
  type BuilderSpacingContext,
} from "@/lib/builderSpacing";
import { Sliders } from "lucide-react";

const PRESETS: { label: string; value: BuilderSpacingPreset }[] = [
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

const LEGACY_PRESETS: { label: string; value: BuilderSpacingPreset }[] = [];

function presetPx(value: BuilderSpacingPreset) {
  return value === "inherit" ? null : BUILDER_SPACING_SCALE[value];
}

const SIDES = ["top", "right", "bottom", "left"] as const;
type SpacingSide = (typeof SIDES)[number];

function normalizedPreset(value?: string) {
  if (value === "small") return "sm";
  if (value === "medium") return "md";
  if (value === "large") return "lg";
  return value;
}

function isPresetValue(value?: string) {
  const normalized = normalizedPreset(value);
  return [...PRESETS, ...LEGACY_PRESETS].some(
    (preset) => preset.value === normalized,
  );
}

type Props = {
  id?: string;
  label: string;
  value?: BuilderSpacingSides;
  inheritedValue?: BuilderSpacingSides;
  context?: BuilderSpacingContext;
  sides?: readonly SpacingSide[];
  onChange: (value: BuilderSpacingSides) => void;
};

export default function SpacingControl({
  id,
  label,
  value,
  inheritedValue,
  context = "elementPadding",
  sides,
  onChange,
}: Props) {
  const activeSides = sides?.length ? sides : SIDES;
  const v = value ?? { linked: true };
  const linked = v.linked !== false;
  const linkedValue = v[activeSides[0]] ?? "inherit";
  const globalSides = inheritedValue
    ? activeSides
        .map((side) => {
          const raw = inheritedValue[side] ?? inheritedValue.top;
          return `${side.charAt(0).toUpperCase()} ${resolveBuilderSpacing(undefined, context, raw).label}`;
        })
        .join(" · ")
    : null;

  function patch(patch: Partial<BuilderSpacingSides>) {
    onChange({ ...v, ...patch });
  }

  function setSide(
    side: SpacingSide,
    next: string,
  ) {
    if (linked && activeSides.length > 1) {
      patch(Object.fromEntries(activeSides.map((activeSide) => [activeSide, next])) as Partial<BuilderSpacingSides>);
      return;
    }
    patch({ [side]: next });
  }

  function inheritedSideValue(side: SpacingSide) {
    return inheritedValue?.[side] ?? inheritedValue?.top;
  }

  function selectValue(side: SpacingSide) {
    const raw = linked ? linkedValue : v[side];
    const normalized = normalizedPreset(raw ?? "inherit");
    return isPresetValue(normalized) ? normalized : "custom";
  }

  function chooseValue(side: SpacingSide, next: string) {
    if (next !== "custom") {
      setSide(side, next);
      return;
    }

    const current = linked ? linkedValue : v[side];
    if (current && !isPresetValue(current)) return;
    const resolved = resolveBuilderSpacing(
      current ?? "inherit",
      context,
      inheritedSideValue(side),
    );
    setSide(side, `${resolved.px}px`);
  }

  function renderSideControl(side: SpacingSide, sideLabel: string) {
    const raw = linked ? linkedValue : v[side];
    const selectedValue = selectValue(side);

    return (
      <div key={side} className="builder-style-side-control-chips-wrapper">
        <span className="builder-style-side-label">{sideLabel}</span>
        <div className="builder-style-chips-row">
          {PRESETS.map((preset) => {
            const isSelected = selectedValue === preset.value;
            const px = presetPx(preset.value);
            const displayLabel =
              preset.value === "inherit"
                ? "Global"
                : `${preset.label} ${px !== null ? `${px}px` : ""}`;
            return (
              <button
                key={preset.value}
                type="button"
                className={`builder-style-chip${isSelected ? " is-active" : ""}`}
                onClick={() => chooseValue(side, preset.value)}
                title={preset.value === "inherit" ? `Inherit global: ${resolveBuilderSpacing(undefined, context, inheritedSideValue(side)).label}` : undefined}
              >
                {displayLabel}
              </button>
            );
          })}
          <button
            type="button"
            className={`builder-style-chip builder-style-chip--custom${selectedValue === "custom" ? " is-active" : ""}`}
            onClick={() => chooseValue(side, "custom")}
          >
            <Sliders size={11} style={{ marginRight: "4px" }} />
            Custom
          </button>
          {selectedValue === "custom" && (
            <div className="builder-style-custom-input-wrapper">
              <input
                value={raw ?? ""}
                aria-label={`${label} ${sideLabel} custom value`}
                placeholder="24px"
                onChange={(event) => setSide(side, event.target.value)}
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div id={id} className="builder-style-spacing" tabIndex={id ? -1 : undefined}>
      <div className="builder-style-spacing-header">
        <strong>{label}</strong>
        {activeSides.length > 1 && <label className="builder-check builder-style-link-toggle">
          <input
            type="checkbox"
            checked={linked}
            onChange={(event) => {
              const nextLinked = event.target.checked;
              const firstSide = activeSides[0];
              const firstValue = v[firstSide] ?? "inherit";
              patch({
                linked: nextLinked,
                ...Object.fromEntries(
                  activeSides.map((side) => [
                    side,
                    nextLinked ? firstValue : (v[side] ?? firstValue),
                  ]),
                ),
              });
            }}
          />
          <span>Link sides</span>
        </label>}
      </div>
      {globalSides ? (
        <small className="builder-style-spacing-source">
          Global: {globalSides}
        </small>
      ) : null}
      <div className="builder-style-side-controls">
        {linked && activeSides.length > 1
          ? renderSideControl("top", "All sides")
          : activeSides.map((side) => renderSideControl(side, side))}
      </div>
    </div>
  );
}
