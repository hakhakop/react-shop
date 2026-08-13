"use client";

import type { BuilderParallaxSettings, BuilderParallaxStop, BuilderParallaxTransformOrigin } from "@/components/dashboard/builderTypes";
import {
  InspectorDivision,
  InspectorFieldRow,
  InspectorSelect,
  InspectorSwitch,
  InspectorTextField,
} from "@/components/dashboard/inspector/InspectorControls";

export type ParallaxStopsEditorProps = {
  label: string;
  value?: BuilderParallaxStop[];
  onChange: (value: BuilderParallaxStop[] | undefined) => void;
  placeholder?: string;
};

/** A small controlled editor for UIkit's comma-separated, optionally positioned stops. */
export function ParallaxStopsEditor({ label, value, onChange, placeholder = "Value" }: ParallaxStopsEditorProps) {
  const stops = value ?? [];

  const updateStop = (index: number, patch: Partial<BuilderParallaxStop>) => {
    onChange(stops.map((stop, stopIndex) => {
      if (stopIndex !== index) return stop;
      if (patch.position === undefined && Object.prototype.hasOwnProperty.call(patch, "position")) {
        const withoutPosition = { ...stop };
        delete withoutPosition.position;
        return { ...withoutPosition, ...patch };
      }
      return { ...stop, ...patch };
    }));
  };

  const removeStop = (index: number) => {
    const next = stops.filter((_, stopIndex) => stopIndex !== index);
    onChange(next.length ? next : undefined);
  };

  const addStop = () => {
    const last = stops[stops.length - 1];
    onChange([...stops, { value: last?.value ?? "" }]);
  };

  return (
    <InspectorFieldRow label={label}>
      <div style={{ display: "flex", flexDirection: "column", gap: "6px", width: "100%" }}>
        {stops.map((stop, index) => {
          const hasPosition = stop.position !== undefined;
          return (
            <div key={`${label}-${index}`} style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <InspectorTextField
                  value={stop.value}
                  placeholder={placeholder}
                  ariaLabel={`${label} stop ${index + 1}`}
                  onChange={(nextValue) => updateStop(index, { value: nextValue })}
                />
                <button type="button" className="inspector-control" aria-label={`Remove ${label} stop ${index + 1}`} onClick={() => removeStop(index)}>
                  −
                </button>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <InspectorSwitch
                  checked={hasPosition}
                  label="Position %"
                  onChange={(checked) => updateStop(index, checked ? { position: stop.position ?? 0 } : { position: undefined })}
                />
                {hasPosition && (
                  <input
                    className="inspector-control"
                    type="number"
                    min={0}
                    max={100}
                    step={1}
                    aria-label={`${label} stop ${index + 1} position percentage`}
                    value={stop.position ?? 0}
                    onChange={(event) => {
                      const parsed = Number(event.target.value);
                      updateStop(index, { position: Number.isFinite(parsed) ? parsed : 0 });
                    }}
                  />
                )}
              </div>
            </div>
          );
        })}
        <button type="button" className="inspector-control" onClick={addStop}>
          Add stop
        </button>
      </div>
    </InspectorFieldRow>
  );
}

export type ParallaxEditorProps = {
  value?: BuilderParallaxSettings;
  onChange: (value: BuilderParallaxSettings) => void;
};

const transformOriginOptions: readonly { value: BuilderParallaxTransformOrigin; label: string }[] = [
  { value: "top-left", label: "Top left" },
  { value: "top-center", label: "Top center" },
  { value: "top-right", label: "Top right" },
  { value: "center-left", label: "Center left" },
  { value: "center-center", label: "Center" },
  { value: "center-right", label: "Center right" },
  { value: "bottom-left", label: "Bottom left" },
  { value: "bottom-center", label: "Bottom center" },
  { value: "bottom-right", label: "Bottom right" },
];

const breakpointOptions = [
  { value: "", label: "Always" },
  { value: "s", label: "Small and up" },
  { value: "m", label: "Medium and up" },
  { value: "l", label: "Large and up" },
  { value: "xl", label: "X-Large and up" },
] as const;

function updateParallax(
  value: BuilderParallaxSettings | undefined,
  onChange: (next: BuilderParallaxSettings) => void,
  patch: Partial<BuilderParallaxSettings>,
) {
  onChange({ ...(value ?? {}), ...patch });
}

export function ParallaxEditor({ value, onChange }: ParallaxEditorProps) {
  const updateStops = (key: "x" | "y" | "scale" | "rotate" | "opacity" | "blur") => (next: BuilderParallaxStop[] | undefined) => {
    const nextValue = { ...(value ?? {}) };
    if (next === undefined) {
      delete nextValue[key];
    } else {
      nextValue[key] = next;
    }
    onChange(nextValue);
  };

  return (
    <InspectorDivision title="PARALLAX">
      <ParallaxStopsEditor label="Translate X" value={value?.x} onChange={updateStops("x")} placeholder="0" />
      <ParallaxStopsEditor label="Translate Y" value={value?.y} onChange={updateStops("y")} placeholder="0" />
      <ParallaxStopsEditor label="Scale" value={value?.scale} onChange={updateStops("scale")} placeholder="1" />
      <ParallaxStopsEditor label="Rotate" value={value?.rotate} onChange={updateStops("rotate")} placeholder="0" />
      <ParallaxStopsEditor label="Opacity" value={value?.opacity} onChange={updateStops("opacity")} placeholder="1" />
      <ParallaxStopsEditor label="Blur" value={value?.blur} onChange={updateStops("blur")} placeholder="0" />

      <InspectorFieldRow label="Transform Origin">
        <InspectorSelect
          value={value?.transformOrigin ?? "center-center"}
          options={transformOriginOptions}
          ariaLabel="Transform origin"
          onChange={(transformOrigin) => updateParallax(value, onChange, { transformOrigin })}
        />
      </InspectorFieldRow>
      <InspectorFieldRow label="Easing">
        <input
          className="inspector-control"
          type="number"
          min={-2}
          max={2}
          step={0.1}
          aria-label="Parallax easing"
          value={value?.easing ?? 1}
          onChange={(event) => {
            const easing = Number(event.target.value);
            if (Number.isFinite(easing)) updateParallax(value, onChange, { easing });
          }}
        />
      </InspectorFieldRow>
      <InspectorFieldRow label="Target">
        <InspectorTextField value={value?.target ?? ""} ariaLabel="Parallax target" onChange={(target) => updateParallax(value, onChange, { target })} />
      </InspectorFieldRow>
      <InspectorFieldRow label="Start">
        <InspectorTextField value={value?.start ?? ""} placeholder="0" ariaLabel="Parallax start" onChange={(start) => updateParallax(value, onChange, { start })} />
      </InspectorFieldRow>
      <InspectorFieldRow label="End">
        <InspectorTextField value={value?.end ?? ""} placeholder="0" ariaLabel="Parallax end" onChange={(end) => updateParallax(value, onChange, { end })} />
      </InspectorFieldRow>
      <InspectorFieldRow label="Higher stacking order">
        <InspectorSwitch checked={value?.zIndex ?? false} label="Higher stacking order" onChange={(zIndex) => updateParallax(value, onChange, { zIndex })} />
      </InspectorFieldRow>
      <InspectorFieldRow label="Breakpoint">
        <InspectorSelect value={value?.breakpoint ?? ""} options={breakpointOptions} ariaLabel="Parallax breakpoint" onChange={(breakpoint) => updateParallax(value, onChange, { breakpoint })} />
      </InspectorFieldRow>
    </InspectorDivision>
  );
}

export default ParallaxEditor;
