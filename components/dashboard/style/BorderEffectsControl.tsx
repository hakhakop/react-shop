"use client";

import type {
  BuilderBorderStyle,
  BuilderEffectsStyle,
  BuilderVisibilityStyle,
} from "@/lib/builderVisualStyle";

const SHADOW_PRESETS = [
  { label: "None", value: "" },
  { label: "Soft", value: "0 8px 24px rgba(0,0,0,0.08)" },
  { label: "Medium", value: "0 16px 40px rgba(0,0,0,0.12)" },
  { label: "Strong", value: "0 24px 60px rgba(0,0,0,0.18)" },
];

function StyleChipGroup<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: readonly { label: string; value: T }[];
  onChange: (value: T) => void;
}) {
  return (
    <div className="builder-style-chip-row">
      {options.map((option) => (
        <button
          key={option.value || option.label}
          type="button"
          className={option.value === value ? "is-active" : ""}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

type Props = {
  border?: BuilderBorderStyle;
  effects?: BuilderEffectsStyle;
  visibility?: BuilderVisibilityStyle;
  customClass?: string;
  onBorderChange?: (value: BuilderBorderStyle) => void;
  onEffectsChange?: (value: BuilderEffectsStyle) => void;
  onVisibilityChange?: (value: BuilderVisibilityStyle) => void;
  onCustomClassChange?: (value: string) => void;
  showBorder?: boolean;
  showEffects?: boolean;
  showLayout?: boolean;
  showVisibility?: boolean;
  showCustomClass?: boolean;
};

export default function BorderEffectsControl({
  border,
  effects,
  visibility,
  customClass,
  onBorderChange,
  onEffectsChange,
  onVisibilityChange,
  onCustomClassChange,
  showBorder = true,
  showEffects = true,
  showLayout = true,
  showVisibility = true,
  showCustomClass = true,
}: Props) {
  const b = border ?? {};
  const e = effects ?? {};
  const vis = visibility ?? { desktop: true, tablet: true, mobile: true };

  return (
    <div className="builder-style-border-effects">
      {showBorder && (
        <div className="builder-style-subsection">
          <strong>Border</strong>
          <div className="builder-style-two-col">
            <label>
              <span>Width</span>
              <input
                value={b.width ?? ""}
                placeholder="1px"
                onChange={(event) =>
                  onBorderChange?.({ ...b, width: event.target.value })
                }
              />
            </label>
            <label>
              <span>Style</span>
              <StyleChipGroup
                value={b.style ?? "solid"}
                options={[
                  { label: "None", value: "none" },
                  { label: "Solid", value: "solid" },
                  { label: "Dashed", value: "dashed" },
                  { label: "Dotted", value: "dotted" },
                ]}
                onChange={(value) =>
                  onBorderChange?.({
                    ...b,
                    style: value as BuilderBorderStyle["style"],
                  })
                }
              />
            </label>
          </div>
          <div className="builder-style-two-col">
            <label>
              <span>Color</span>
              <input
                value={b.color ?? ""}
                placeholder="#e5e5e5"
                onChange={(event) =>
                  onBorderChange?.({ ...b, color: event.target.value })
                }
              />
            </label>
            <label>
              <span>Radius</span>
              <input
                value={b.radius ?? ""}
                placeholder="12px"
                onChange={(event) =>
                  onBorderChange?.({ ...b, radius: event.target.value })
                }
              />
            </label>
          </div>
        </div>
      )}

      {showEffects && (
        <div className="builder-style-subsection">
          <strong>Effects</strong>
          <label>
            <span>Opacity ({e.opacity ?? 100}%)</span>
            <input
              type="range"
              min={0}
              max={100}
              value={e.opacity ?? 100}
              onChange={(event) =>
                onEffectsChange?.({ ...e, opacity: Number(event.target.value) })
              }
            />
          </label>
          <label>
            <span>Box shadow</span>
            <StyleChipGroup
              value={
                SHADOW_PRESETS.find((preset) => preset.value === e.boxShadow)
                  ?.value ?? "__custom"
              }
              options={[
                ...SHADOW_PRESETS,
                { label: "Custom", value: "__custom" },
              ]}
              onChange={(value) => {
                if (value === "__custom") return;
                onEffectsChange?.({ ...e, boxShadow: value });
              }}
            />
          </label>
          <input
            value={e.boxShadow ?? ""}
            placeholder="Custom box-shadow"
            onChange={(event) =>
              onEffectsChange?.({ ...e, boxShadow: event.target.value })
            }
          />
        </div>
      )}

      {showLayout && (
        <div className="builder-style-subsection">
          <strong>Dimensions & Overflow</strong>
          <div className="builder-style-two-col">
            <label>
              <span>Max width</span>
              <input
                value={e.maxWidth ?? ""}
                placeholder="1200px"
                onChange={(event) =>
                  onEffectsChange?.({ ...e, maxWidth: event.target.value })
                }
              />
            </label>
            <label>
              <span>Min height</span>
              <input
                value={e.minHeight ?? ""}
                placeholder="320px"
                onChange={(event) =>
                  onEffectsChange?.({ ...e, minHeight: event.target.value })
                }
              />
            </label>
          </div>
          <label>
            <span>Overflow</span>
            <StyleChipGroup
              value={e.overflow ?? "visible"}
              options={[
                { label: "Visible", value: "visible" },
                { label: "Hidden", value: "hidden" },
                { label: "Auto", value: "auto" },
                { label: "Scroll", value: "scroll" },
              ]}
              onChange={(value) =>
                onEffectsChange?.({
                  ...e,
                  overflow: value as BuilderEffectsStyle["overflow"],
                })
              }
            />
          </label>
        </div>
      )}

      {showVisibility && (
        <div className="builder-style-subsection">
          <strong>Visibility</strong>
          <div className="builder-style-visibility-row">
            {(["desktop", "tablet", "mobile"] as const).map((device) => (
              <label key={device} className="builder-check">
                <input
                  type="checkbox"
                  checked={vis[device] !== false}
                  onChange={(event) =>
                    onVisibilityChange?.({
                      ...vis,
                      [device]: event.target.checked,
                    })
                  }
                />
                <span>{device}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {showCustomClass && (
        <label>
          <span>CSS class</span>
          <input
            value={customClass ?? ""}
            placeholder="my-custom-class"
            onChange={(event) => onCustomClassChange?.(event.target.value)}
          />
        </label>
      )}
    </div>
  );
}
