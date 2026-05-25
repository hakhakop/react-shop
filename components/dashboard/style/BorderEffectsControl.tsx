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

type Props = {
  border?: BuilderBorderStyle;
  effects?: BuilderEffectsStyle;
  visibility?: BuilderVisibilityStyle;
  customClass?: string;
  onBorderChange: (value: BuilderBorderStyle) => void;
  onEffectsChange: (value: BuilderEffectsStyle) => void;
  onVisibilityChange: (value: BuilderVisibilityStyle) => void;
  onCustomClassChange: (value: string) => void;
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
}: Props) {
  const b = border ?? {};
  const e = effects ?? {};
  const vis = visibility ?? { desktop: true, tablet: true, mobile: true };

  return (
    <div className="builder-style-border-effects">
      <div className="builder-style-subsection">
        <strong>Border</strong>
        <div className="builder-style-two-col">
          <label>
            <span>Width</span>
            <input
              value={b.width ?? ""}
              placeholder="1px"
              onChange={(event) =>
                onBorderChange({ ...b, width: event.target.value })
              }
            />
          </label>
          <label>
            <span>Style</span>
            <select
              value={b.style ?? "solid"}
              onChange={(event) =>
                onBorderChange({
                  ...b,
                  style: event.target.value as BuilderBorderStyle["style"],
                })
              }
            >
              <option value="none">None</option>
              <option value="solid">Solid</option>
              <option value="dashed">Dashed</option>
              <option value="dotted">Dotted</option>
            </select>
          </label>
        </div>
        <div className="builder-style-two-col">
          <label>
            <span>Color</span>
            <input
              value={b.color ?? ""}
              placeholder="#e5e5e5"
              onChange={(event) =>
                onBorderChange({ ...b, color: event.target.value })
              }
            />
          </label>
          <label>
            <span>Radius</span>
            <input
              value={b.radius ?? ""}
              placeholder="12px"
              onChange={(event) =>
                onBorderChange({ ...b, radius: event.target.value })
              }
            />
          </label>
        </div>
      </div>

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
              onEffectsChange({ ...e, opacity: Number(event.target.value) })
            }
          />
        </label>
        <label>
          <span>Box shadow</span>
          <select
            value={
              SHADOW_PRESETS.find((preset) => preset.value === e.boxShadow)
                ?.value ?? "__custom"
            }
            onChange={(event) => {
              if (event.target.value === "__custom") return;
              onEffectsChange({ ...e, boxShadow: event.target.value });
            }}
          >
            {SHADOW_PRESETS.map((preset) => (
              <option key={preset.label} value={preset.value || "__none"}>
                {preset.label}
              </option>
            ))}
            <option value="__custom">Custom</option>
          </select>
        </label>
        <input
          value={e.boxShadow ?? ""}
          placeholder="Custom box-shadow"
          onChange={(event) =>
            onEffectsChange({ ...e, boxShadow: event.target.value })
          }
        />
        <div className="builder-style-two-col">
          <label>
            <span>Max width</span>
            <input
              value={e.maxWidth ?? ""}
              placeholder="1200px"
              onChange={(event) =>
                onEffectsChange({ ...e, maxWidth: event.target.value })
              }
            />
          </label>
          <label>
            <span>Min height</span>
            <input
              value={e.minHeight ?? ""}
              placeholder="320px"
              onChange={(event) =>
                onEffectsChange({ ...e, minHeight: event.target.value })
              }
            />
          </label>
        </div>
        <label>
          <span>Overflow</span>
          <select
            value={e.overflow ?? "visible"}
            onChange={(event) =>
              onEffectsChange({
                ...e,
                overflow: event.target.value as BuilderEffectsStyle["overflow"],
              })
            }
          >
            <option value="visible">Visible</option>
            <option value="hidden">Hidden</option>
            <option value="auto">Auto</option>
            <option value="scroll">Scroll</option>
          </select>
        </label>
      </div>

      <div className="builder-style-subsection">
        <strong>Visibility</strong>
        <div className="builder-style-visibility-row">
          {(["desktop", "tablet", "mobile"] as const).map((device) => (
            <label key={device} className="builder-check">
              <input
                type="checkbox"
                checked={vis[device] !== false}
                onChange={(event) =>
                  onVisibilityChange({
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

      <label>
        <span>CSS class</span>
        <input
          value={customClass ?? ""}
          placeholder="my-custom-class"
          onChange={(event) => onCustomClassChange(event.target.value)}
        />
      </label>
    </div>
  );
}
