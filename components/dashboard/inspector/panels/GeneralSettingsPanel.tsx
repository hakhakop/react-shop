"use client";

import type { BuilderLayoutBlock, InspectorTab } from "@/components/dashboard/builderTypes";
import type { BuilderShellSettings } from "@/lib/builderShell";
import type { BuilderVisualStyle } from "@/lib/builderVisualStyle";
import {
  InspectorFieldRow,
  InspectorSelect,
  InspectorTextField,
  InspectorDivision,
} from "@/components/dashboard/inspector/InspectorControls";
import { ChevronRight } from "lucide-react";

type Props = {
  block: BuilderLayoutBlock;
  shellSettings: BuilderShellSettings;
  tab: InspectorTab;
  update: (patch: Partial<BuilderLayoutBlock>) => void;
  showAnimation?: boolean;
};

export default function GeneralSettingsPanel({ block, shellSettings, tab, update, showAnimation = false }: Props) {
  if (tab !== "style") return null;

  const visual = (block.visualStyle as BuilderVisualStyle | undefined) ?? {};
  const layout = visual.layout ?? {};

  const updateVisual = (patch: Partial<BuilderVisualStyle>) => {
    update({ visualStyle: { ...visual, ...patch } });
  };

  const updateLayout = (patch: Partial<NonNullable<BuilderVisualStyle["layout"]>>) => {
    updateVisual({ layout: { ...layout, ...patch } });
  };

  const breakpointOptions = [
    { value: "always", label: "Always" },
    { value: "small", label: "Small (Phone Landscape)" },
    { value: "medium", label: "Medium (Tablet Landscape)" },
    { value: "large", label: "Large (Desktop)" },
    { value: "xlarge", label: "X-Large (Large Screens)" },
  ];

  const alignmentOptions = [
    { value: "none", label: "None" },
    { value: "left", label: "Left" },
    { value: "center", label: "Center" },
    { value: "right", label: "Right" },
  ];

  const textAlignmentOptions = [
    { value: "none", label: "None" },
    { value: "left", label: "Left" },
    { value: "center", label: "Center" },
    { value: "right", label: "Right" },
    { value: "justify", label: "Justify" },
  ];

  return (
    <section className="builder-general-settings-panel" data-uikit-capability="general-settings">
      <InspectorDivision title="GENERAL">
        <div className="builder-style-section-content" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          
          {/* Position */}
          <InspectorFieldRow label="Position">
            <InspectorSelect
              value={layout.position ?? "relative"}
              options={[
                { value: "relative", label: "Relative" },
                { value: "absolute", label: "Absolute" },
                { value: "fixed", label: "Fixed" },
                { value: "sticky", label: "Sticky" },
                { value: "static", label: "Static" },
              ]}
              onChange={(position) => updateLayout({ position: position as any })}
              ariaLabel="Position"
            />
          </InspectorFieldRow>

          {/* Offsets: Left, Right, Top, Bottom */}
          {(["left", "right", "top", "bottom"] as const).map((side) => (
            <InspectorFieldRow key={side} label={side.charAt(0).toUpperCase() + side.slice(1)}>
              <div style={{ display: "flex", gap: "8px", alignItems: "center", width: "100%" }}>
                <input
                  type="range"
                  min="-100"
                  max="200"
                  value={parseInt(layout[side] ?? "0", 10) || 0}
                  onChange={(e) => updateLayout({ [side]: `${e.target.value}px` })}
                  style={{ flex: 1 }}
                />
                <input
                  className="inspector-control"
                  type="text"
                  value={layout[side] ?? ""}
                  placeholder=""
                  onChange={(e) => updateLayout({ [side]: e.target.value })}
                  style={{ width: "60px", textAlign: "center" }}
                />
              </div>
            </InspectorFieldRow>
          ))}

          {/* Z Index */}
          <InspectorFieldRow label="Z Index">
            <InspectorSelect
              value={String(layout.zIndex ?? "3")}
              options={[
                { value: "auto", label: "Auto" },
                { value: "0", label: "0" },
                { value: "1", label: "1" },
                { value: "2", label: "2" },
                { value: "3", label: "3" },
                { value: "10", label: "10" },
                { value: "100", label: "100" },
              ]}
              onChange={(value) => updateLayout({ zIndex: value === "auto" ? undefined : Number(value) })}
              ariaLabel="Z Index"
            />
          </InspectorFieldRow>

          {/* Blend */}
          <InspectorFieldRow>
            <label className="builder-inspector-checkbox-row">
              <input
                type="checkbox"
                checked={Boolean((layout as any).blendWithPage)}
                onChange={(e) => updateLayout({ blendWithPage: e.target.checked } as any)}
              />
              <span>Blend with page content</span>
            </label>
          </InspectorFieldRow>

          {/* Margin */}
          <InspectorFieldRow label="Margin">
            <InspectorSelect
              value={(layout as any).marginMode ?? (block as any).margin ?? "keep-existing"}
              options={[
                { value: "keep-existing", label: "Keep existing" },
                { value: "none", label: "None" },
                { value: "small", label: "Small" },
                { value: "medium", label: "Medium" },
                { value: "large", label: "Large" },
                { value: "xlarge", label: "X-Large" },
              ]}
              onChange={(value) => {
                updateLayout({ marginMode: value } as any);
                update({ margin: value === "keep-existing" ? undefined : value, marginMode: value } as any);
              }}
              ariaLabel="Margin"
            />
          </InspectorFieldRow>

          <InspectorFieldRow>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label className="builder-inspector-checkbox-row">
                <input
                  type="checkbox"
                  checked={Boolean((layout as any).removeTopMargin ?? (block as any).removeTopMargin)}
                  onChange={(e) => {
                    updateLayout({ removeTopMargin: e.target.checked } as any);
                    update({ removeTopMargin: e.target.checked } as any);
                  }}
                />
                <span>Remove top margin</span>
              </label>
              <label className="builder-inspector-checkbox-row">
                <input
                  type="checkbox"
                  checked={Boolean((layout as any).removeBottomMargin ?? (block as any).removeBottomMargin)}
                  onChange={(e) => {
                    updateLayout({ removeBottomMargin: e.target.checked } as any);
                    update({ removeBottomMargin: e.target.checked } as any);
                  }}
                />
                <span>Remove bottom margin</span>
              </label>
            </div>
          </InspectorFieldRow>

          {/* Max Width */}
          <InspectorFieldRow label="Max Width">
            <InspectorSelect
              value={(() => {
                const val = (block as any).maxWidth || visual.effects?.maxWidth || (layout as any).maxWidth;
                return !val || val === "none" ? "none" : val;
              })()}
              options={[
                { value: "none", label: "None" },
                { value: "small", label: "Small" },
                { value: "medium", label: "Medium" },
                { value: "large", label: "Large" },
                { value: "xlarge", label: "X-Large" },
                { value: "2xlarge", label: "2X-Large" },
              ]}
              onChange={(maxWidth) => {
                const val = maxWidth === "none" ? undefined : maxWidth;
                update({
                  maxWidth: val,
                  visualStyle: {
                    ...visual,
                    effects: { ...(visual.effects ?? {}), maxWidth: val },
                  },
                } as any);
                updateLayout({ maxWidth: val } as any);
              }}
              ariaLabel="Max Width"
            />
          </InspectorFieldRow>

          <InspectorFieldRow label="Max Width Breakpoint">
            <InspectorSelect
              value={(layout as any).maxWidthBreakpoint ?? (block as any).maxWidthBreakpoint ?? "always"}
              options={breakpointOptions}
              onChange={(value) => {
                const val = value === "always" ? undefined : value;
                updateLayout({ maxWidthBreakpoint: val } as any);
                update({ maxWidthBreakpoint: val } as any);
              }}
              ariaLabel="Max Width Breakpoint"
            />
          </InspectorFieldRow>

          {/* Block Alignment */}
          <InspectorFieldRow label="Block Alignment">
            <InspectorSelect
              value={block.elementAlign ?? (block as any).blockAlign ?? "center"}
              options={alignmentOptions}
              onChange={(value) => {
                const alignVal = value === "none" ? undefined : (value as "left" | "center" | "right");
                update({ elementAlign: alignVal, blockAlign: alignVal } as any);
                updateLayout({ blockAlign: alignVal } as any);
              }}
              ariaLabel="Block Alignment"
            />
          </InspectorFieldRow>

          <InspectorFieldRow label="Block Alignment Breakpoint">
            <InspectorSelect
              value={(layout as any).blockAlignBreakpoint ?? "always"}
              options={breakpointOptions}
              onChange={(value) => updateLayout({ blockAlignBreakpoint: value } as any)}
              ariaLabel="Block Alignment Breakpoint"
            />
          </InspectorFieldRow>

          <InspectorFieldRow label="Block Alignment Fallback">
            <InspectorSelect
              value={(layout as any).blockAlignFallback ?? "left"}
              options={alignmentOptions}
              onChange={(value) => updateLayout({ blockAlignFallback: value } as any)}
              ariaLabel="Block Alignment Fallback"
            />
          </InspectorFieldRow>

          {/* Text Alignment */}
          <InspectorFieldRow label="Text Alignment">
            <InspectorSelect
              value={layout.textAlign ?? (block as any).headingAlign ?? "center"}
              options={textAlignmentOptions}
              onChange={(textAlign) => {
                updateLayout({ textAlign: textAlign as any });
                update({ headingAlign: textAlign, textAlign } as any);
              }}
              ariaLabel="Text Alignment"
            />
          </InspectorFieldRow>

          <InspectorFieldRow label="Text Alignment Breakpoint">
            <InspectorSelect
              value={(layout as any).textAlignBreakpoint ?? "always"}
              options={breakpointOptions}
              onChange={(value) => updateLayout({ textAlignBreakpoint: value } as any)}
              ariaLabel="Text Alignment Breakpoint"
            />
          </InspectorFieldRow>

          <InspectorFieldRow label="Text Alignment Fallback">
            <InspectorSelect
              value={(layout as any).textAlignFallback ?? "none"}
              options={textAlignmentOptions}
              onChange={(value) => updateLayout({ textAlignFallback: value } as any)}
              ariaLabel="Text Alignment Fallback"
            />
          </InspectorFieldRow>

          {/* Animation */}
          <InspectorFieldRow label="Animation">
            <InspectorSelect
              value={typeof block.animation === "string" ? block.animation : (block.animation?.preset ?? "inherit")}
              options={[
                { value: "inherit", label: "Inherit" },
                { value: "none", label: "None" },
                { value: "fade", label: "Fade" },
                { value: "scale-up", label: "Scale Up" },
                { value: "scale-down", label: "Scale Down" },
                { value: "slide-top", label: "Slide Top" },
                { value: "slide-bottom", label: "Slide Bottom" },
                { value: "slide-left", label: "Slide Left" },
                { value: "slide-right", label: "Slide Right" },
              ]}
              onChange={(value) => update({ animation: { preset: value as any } })}
              ariaLabel="Animation"
            />
          </InspectorFieldRow>

          {/* Edit Parallax button */}
          <InspectorFieldRow>
            <button
              type="button"
              className="builder-button-full"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "8px 12px",
                width: "100%",
                background: "var(--builder-ui-surface-strong, #e5e7eb)",
                border: "1px solid var(--builder-ui-border, #d1d5db)",
                borderRadius: "4px",
                fontWeight: 600,
                fontSize: "11px",
                color: "var(--builder-ui-text, #374151)",
                cursor: "pointer",
                letterSpacing: "0.05em",
                textTransform: "uppercase",
              }}
              onClick={() => alert("Parallax settings modal")}
            >
              <span>Edit Parallax</span>
              <ChevronRight size={14} />
            </button>
          </InspectorFieldRow>

          {/* Visibility */}
          <InspectorFieldRow label="Visibility">
            <InspectorSelect
              value={(layout as any).visibilityMode ?? (block as any).visibility ?? "always"}
              options={[
                { value: "always", label: "Always" },
                { value: "visible-s", label: "Visible Small" },
                { value: "visible-m", label: "Visible Medium" },
                { value: "visible-l", label: "Visible Large" },
                { value: "hidden-s", label: "Hidden Small" },
                { value: "hidden-m", label: "Hidden Medium" },
                { value: "hidden-l", label: "Hidden Large" },
              ]}
              onChange={(value) => {
                updateLayout({ visibilityMode: value } as any);
                update({ visibility: value, visibilityMode: value } as any);
              }}
              ariaLabel="Visibility"
            />
          </InspectorFieldRow>

        </div>
      </InspectorDivision>
    </section>
  );
}

