"use client";

import type {
  BuilderSpacingPreset,
  BuilderSpacingSides,
} from "@/lib/builderVisualStyle";

const PRESETS: { label: string; value: BuilderSpacingPreset }[] = [
  { label: "None", value: "none" },
  { label: "XS", value: "xs" },
  { label: "SM", value: "sm" },
  { label: "MD", value: "md" },
  { label: "LG", value: "lg" },
  { label: "XL", value: "xl" },
];

type Props = {
  label: string;
  value?: BuilderSpacingSides;
  onChange: (value: BuilderSpacingSides) => void;
};

export default function SpacingControl({ label, value, onChange }: Props) {
  const v = value ?? { linked: true };
  const linked = v.linked !== false;

  function patch(patch: Partial<BuilderSpacingSides>) {
    onChange({ ...v, ...patch });
  }

  function setSide(
    side: "top" | "right" | "bottom" | "left",
    next: string,
  ) {
    if (linked) {
      patch({ top: next, right: next, bottom: next, left: next });
      return;
    }
    patch({ [side]: next });
  }

  return (
    <div className="builder-style-spacing">
      <div className="builder-style-spacing-header">
        <strong>{label}</strong>
        <label className="builder-check builder-style-link-toggle">
          <input
            type="checkbox"
            checked={linked}
            onChange={(event) =>
              patch({
                linked: event.target.checked,
                right: event.target.checked ? v.top : v.right,
                bottom: event.target.checked ? v.top : v.bottom,
                left: event.target.checked ? v.top : v.left,
              })
            }
          />
          <span>Link sides</span>
        </label>
      </div>
      <div className="builder-style-preset-row">
        {PRESETS.map((preset) => (
          <button
            key={preset.value}
            type="button"
            className={v.top === preset.value ? "is-active" : ""}
            onClick={() =>
              linked
                ? patch({
                    top: preset.value,
                    right: preset.value,
                    bottom: preset.value,
                    left: preset.value,
                  })
                : patch({ top: preset.value })
            }
          >
            {preset.label}
          </button>
        ))}
      </div>
      <div className="builder-style-side-grid">
        {(["top", "right", "bottom", "left"] as const).map((side) => (
          <label key={side}>
            <span>{side}</span>
            <input
              value={v[side] ?? ""}
              placeholder="md or 24px"
              onChange={(event) => setSide(side, event.target.value)}
              disabled={linked && side !== "top"}
            />
          </label>
        ))}
      </div>
    </div>
  );
}
