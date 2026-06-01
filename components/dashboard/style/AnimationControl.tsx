"use client";

import type { BuilderAnimationSettings, BuilderAnimationPreset } from "@/components/dashboard/builderTypes";

const PRESETS: { label: string; value: BuilderAnimationPreset; description: string }[] = [
  { label: "None", value: "none", description: "No animation" },
  { label: "Fade Up", value: "fade-up", description: "Slide up + fade in" },
  { label: "Fade Down", value: "fade-down", description: "Slide down + fade in" },
  { label: "Fade In", value: "fade-in", description: "Pure opacity fade" },
  { label: "Slide Left", value: "slide-left", description: "Enter from left" },
  { label: "Slide Right", value: "slide-right", description: "Enter from right" },
  { label: "Scale Up", value: "scale-up", description: "Subtle zoom + fade" },
  { label: "Zoom In", value: "zoom-in", description: "Dramatic zoom entrance" },
  { label: "Flip Up", value: "flip-up", description: "3D X rotation" },
  { label: "Blur In", value: "blur-in", description: "Blur to clear, elegant" },
  { label: "Stagger", value: "stagger", description: "Children animate in sequence" },
  { label: "Progress Line", value: "progress-line", description: "Connecting line + dot trail across items" },
  { label: "Princity Gradient", value: "princity-gradient", description: "Brand gradient text with snap motion" },
];

const DURATIONS = [
  { label: "Fast (0.4s)", value: 0.4 },
  { label: "Normal (0.7s)", value: 0.7 },
  { label: "Slow (1.2s)", value: 1.2 },
];

const DELAYS = [
  { label: "None", value: 0 },
  { label: "100ms", value: 100 },
  { label: "200ms", value: 200 },
  { label: "300ms", value: 300 },
  { label: "500ms", value: 500 },
];

const EASINGS = [
  { label: "Ease Out", value: "ease-out" as const },
  { label: "Ease In Out", value: "ease-in-out" as const },
  { label: "Spring", value: "spring" as const },
];

const TRIGGER_OFFSETS = [
  { label: "Early", value: 5 },
  { label: "Normal", value: 15 },
  { label: "Late", value: 30 },
];

type Props = {
  value?: BuilderAnimationSettings;
  onChange: (value: BuilderAnimationSettings) => void;
  allowPause?: boolean;
  allowScrub?: boolean;
};

export default function AnimationControl({
  value,
  onChange,
  allowPause = false,
  allowScrub = false,
}: Props) {
  const v: BuilderAnimationSettings = value ?? { preset: "none" };
  const preset = v.preset ?? "none";
  const isProgressPreset =
    preset === "progress-line" ||
    preset === "scroll-progress-horizontal" ||
    preset === "scroll-progress-vertical";

  function patch(patch: Partial<BuilderAnimationSettings>) {
    const next = { ...v, ...patch };

    if (next.preset === "none" || patch.preset === "none") {
      next.delayMs = undefined;
      next.pauseUntilComplete = undefined;
    }

    onChange(next);
  }

  const showOptions = preset !== "none";

  return (
    <div className="builder-style-animation">
      <label className="builder-field">
        <span>Preset</span>
        <select
          value={preset}
          onChange={(event) => patch({ preset: event.target.value as BuilderAnimationPreset })}
        >
          {PRESETS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {showOptions && (
          <small>{PRESETS.find((p) => p.value === preset)?.description}</small>
        )}
      </label>

      {showOptions && (
        <>
          {preset === "progress-line" && (
            <label className="builder-field">
              <span>Direction</span>
              <select
                value={v.progressDirection ?? "horizontal"}
                onChange={(event) =>
                  patch({ progressDirection: event.target.value as "horizontal" | "vertical" })
                }
              >
                <option value="horizontal">Horizontal</option>
                <option value="vertical">Vertical</option>
              </select>
            </label>
          )}

          <div className="builder-control-grid builder-control-grid--compact">
            <label className="builder-field">
              <span>Duration</span>
              <select
                value={v.durationMs ?? 0.7}
                onChange={(event) => patch({ durationMs: Number(event.target.value) })}
              >
                {DURATIONS.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="builder-field">
              <span>Delay</span>
              <select
                value={v.delayMs ?? 0}
                onChange={(event) => patch({ delayMs: Number(event.target.value) })}
              >
                {DELAYS.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="builder-control-grid builder-control-grid--compact">
            <label className="builder-field">
              <span>Easing</span>
              <select
                value={v.easing ?? "ease-out"}
                onChange={(event) =>
                  patch({ easing: event.target.value as BuilderAnimationSettings["easing"] })
                }
              >
                {EASINGS.map((e) => (
                  <option key={e.value} value={e.value}>
                    {e.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="builder-field">
              <span>Trigger</span>
              <select
                value={v.triggerOffset ?? 15}
                onChange={(event) => patch({ triggerOffset: Number(event.target.value) })}
              >
                {TRIGGER_OFFSETS.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="builder-check">
            <input
              type="checkbox"
              checked={v.once ?? true}
              onChange={(event) => patch({ once: event.target.checked })}
            />
            <span>Play once</span>
          </label>

          {allowPause && (
            <>
              <label className="builder-check">
                <input
                  type="checkbox"
                  checked={v.pauseUntilComplete === true}
                  onChange={(event) => patch({ pauseUntilComplete: event.target.checked })}
                />
                <span>Pin section and scrub animation with scroll</span>
                <small>
                  The section becomes sticky and scrolling drives the animation progress.
                </small>
              </label>

              {v.pauseUntilComplete && isProgressPreset && allowScrub && (
                <label className="builder-field">
                  <span>Scrub distance</span>
                  <input
                    type="number"
                    min={60}
                    max={260}
                    step={10}
                    value={v.scrubDistanceVh ?? 120}
                    onChange={(event) =>
                      patch({ scrubDistanceVh: Math.max(60, Math.min(260, Number(event.target.value) || 120)) })
                    }
                  />
                  <small>Viewport height. Higher = slower.</small>
                </label>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
