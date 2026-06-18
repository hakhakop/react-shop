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

const PRESETS: { label: string; value: BuilderSpacingPreset }[] = [
  { label: "Global", value: "inherit" },
  { label: "None", value: "none" },
  { label: "Tight", value: "sm" },
  { label: "Default", value: "md" },
  { label: "Comfort", value: "lg" },
  { label: "Roomy", value: "xl" },
  { label: "Spacious", value: "2xl" },
  { label: "Hero", value: "3xl" },
];

const LEGACY_PRESETS: { label: string; value: BuilderSpacingPreset }[] = [
  { label: "Tiny", value: "xs" },
];

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
  onChange: (value: BuilderSpacingSides) => void;
};

export default function SpacingControl({
  id,
  label,
  value,
  inheritedValue,
  context = "elementPadding",
  onChange,
}: Props) {
  const v = value ?? { linked: true };
  const linked = v.linked !== false;
  const globalSides = inheritedValue
    ? SIDES
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
    if (linked) {
      patch({ top: next, right: next, bottom: next, left: next });
      return;
    }
    patch({ [side]: next });
  }

  function inheritedSideValue(side: SpacingSide) {
    return inheritedValue?.[side] ?? inheritedValue?.top;
  }

  function selectValue(side: SpacingSide) {
    const raw = linked ? v.top : v[side];
    const normalized = normalizedPreset(raw ?? "inherit");
    return isPresetValue(normalized) ? normalized : "custom";
  }

  function chooseValue(side: SpacingSide, next: string) {
    if (next !== "custom") {
      setSide(side, next);
      return;
    }

    const current = linked ? v.top : v[side];
    if (current && !isPresetValue(current)) return;
    const resolved = resolveBuilderSpacing(
      current ?? "inherit",
      context,
      inheritedSideValue(side),
    );
    setSide(side, `${resolved.px}px`);
  }

  function renderSideControl(side: SpacingSide, sideLabel: string) {
    const raw = linked ? v.top : v[side];
    const selectedValue = selectValue(side);
    const legacyPreset = LEGACY_PRESETS.find(
      (preset) => preset.value === selectedValue,
    );

    return (
      <div key={side} className="builder-style-side-control">
        <span>{sideLabel}</span>
        <select
          value={selectedValue}
          aria-label={`${label} ${sideLabel} preset`}
          onChange={(event) => chooseValue(side, event.target.value)}
        >
          {PRESETS.map((preset) => (
            <option key={preset.value} value={preset.value}>
              {preset.value === "inherit"
                ? `Global (${resolveBuilderSpacing(undefined, context, inheritedSideValue(side)).label})`
                : `${preset.label} · ${presetPx(preset.value)}px`}
            </option>
          ))}
          {legacyPreset ? (
            <option value={legacyPreset.value}>
              {legacyPreset.label} · {presetPx(legacyPreset.value)}px
            </option>
          ) : null}
          <option value="custom">Custom</option>
        </select>
        {selectedValue === "custom" ? (
          <input
            value={raw ?? ""}
            aria-label={`${label} ${sideLabel} custom value`}
            placeholder="24px"
            onChange={(event) => setSide(side, event.target.value)}
          />
        ) : null}
      </div>
    );
  }

  return (
    <div id={id} className="builder-style-spacing" tabIndex={id ? -1 : undefined}>
      <div className="builder-style-spacing-header">
        <strong>{label}</strong>
        <label className="builder-check builder-style-link-toggle">
          <input
            type="checkbox"
            checked={linked}
            onChange={(event) => {
              const nextLinked = event.target.checked;
              const top = v.top ?? "inherit";
              patch({
                linked: nextLinked,
                right: nextLinked ? top : (v.right ?? top),
                bottom: nextLinked ? top : (v.bottom ?? top),
                left: nextLinked ? top : (v.left ?? top),
              });
            }}
          />
          <span>Link sides</span>
        </label>
      </div>
      {globalSides ? (
        <small className="builder-style-spacing-source">
          Global: {globalSides}
        </small>
      ) : null}
      <div className="builder-style-side-controls">
        {linked
          ? renderSideControl("top", "All sides")
          : SIDES.map((side) => renderSideControl(side, side))}
      </div>
    </div>
  );
}
