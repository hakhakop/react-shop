"use client";

import { useState } from "react";
import type { InspectorPanelContext } from "../inspectorRouting";
import type { BuilderLayoutStyle } from "@/lib/builderVisualStyle";
import { InspectorDivision, InspectorFieldRow, InspectorSelect, InspectorSwitch, InspectorRange, InspectorTextField } from "../InspectorControls";
import ParallaxEditor from "./ParallaxEditor";

const breakpoints = [
  { value: "", label: "Always" }, { value: "small", label: "Small (Phone Landscape)" },
  { value: "medium", label: "Medium (Tablet Landscape)" }, { value: "large", label: "Large (Desktop)" },
  { value: "xlarge", label: "X-Large (Large Screens)" },
];
const alignments = ["left", "center", "right"].map(value => ({ value, label: value[0].toUpperCase() + value.slice(1) }));
const textAlignments = [{ value: "", label: "None" }, ...alignments];
const animations = ["inherit", "none", "parallax", "fade", "scale-up", "scale-down", ...["small", "medium", ""].flatMap(size => ["top", "bottom", "left", "right"].map(side => `slide-${side}${size ? `-${size}` : ""}`))].map(value => ({ value, label: value.split("-").map(word => word[0].toUpperCase() + word.slice(1)).join(" ") + (/^slide-(top|bottom|left|right)$/.test(value) ? " 100%" : "") }));

/** Source-compatible General contract, using the existing canonical visual-style owner. */
export default function YoothemeGeneralSettingsPanel({ block, update, includeAlignmentAndWidth = true }: Pick<InspectorPanelContext, "block" | "update"> & { includeAlignmentAndWidth?: boolean }) {
  const [parallaxOpen, setParallaxOpen] = useState(false);
  const visual = block.visualStyle ?? {};
  const layout = visual.layout ?? {};
  const positioned = Boolean(layout.position && layout.position !== "static");
  const absolute = layout.position === "absolute";
  const hasWidth = Boolean(layout.maxWidth);
  const patch = (next: Partial<BuilderLayoutStyle>) => update({ visualStyle: { ...visual, layout: { ...layout, ...next } } });
  const select = (label: string, key: keyof BuilderLayoutStyle, options: { value: string; label: string }[], fallback = "", disabled = false) => {
    if (!includeAlignmentAndWidth && /^(Max Width|Block Alignment|Text Alignment)/.test(label)) return null;
    const raw = String(layout[key] ?? fallback);
    const value = key === "visibilityMode" && ["s", "m", "l", "xl"].includes(raw) ? `visible-${raw}` : raw;
    return <InspectorFieldRow label={label}><InspectorSelect ariaLabel={label} disabled={disabled} value={value} options={options} onChange={value => patch({ [key]: value || undefined })} /></InspectorFieldRow>;
  };
  const animation = typeof block.animation === "object" && block.animation ? block.animation : {};
  const preset = typeof block.animation === "string" ? block.animation : animation.preset ?? "inherit";
  return <InspectorDivision title="GENERAL">
    {select("Position", "position", ["static", "relative", "absolute"].map(value => ({ value, label: value[0].toUpperCase() + value.slice(1) })), "static")}
    {(["left", "right", "top", "bottom"] as const).map((side, index) => {
      const opposite = (["right", "left", "bottom", "top"] as const)[index];
      const disabled = !positioned || Boolean(parseFloat(layout[opposite] ?? "0"));
      const label = side[0].toUpperCase() + side.slice(1);
      return <InspectorFieldRow key={side} label={label}><div className="inspector-range-value-row">
        <InspectorRange min={-600} max={600} step={10} disabled={disabled} value={parseFloat(layout[side] ?? "0") || 0} ariaLabel={label} onChange={value => patch({ [side]: `${value}px` })} />
        <InspectorTextField disabled={disabled} type="number" ariaLabel={`${label} value`} value={layout[side]?.replace(/px$/, "") ?? ""} onChange={value => patch({ [side]: value ? `${value}px` : undefined })} />
      </div></InspectorFieldRow>;
    })}
    <InspectorFieldRow label="Z Index"><InspectorSelect ariaLabel="Z Index" disabled={!positioned} value={String(layout.zIndex ?? "")} options={[0, 1, 2, 3].map(value => ({ value: String(value), label: String(value) })).concat({ value: "", label: "None" })} onChange={value => patch({ zIndex: value === "" ? undefined : Number(value) })} /></InspectorFieldRow>
    <InspectorFieldRow label="Blend"><InspectorSwitch label="Blend with page content" checked={layout.blendWithPage ?? false} onChange={blendWithPage => patch({ blendWithPage })} /></InspectorFieldRow>
    {select("Margin", "marginMode", [{ value: "keep-existing", label: "Keep existing" }, { value: "small", label: "Small" }, { value: "default", label: "Default" }, { value: "medium", label: "Medium" }, { value: "large", label: "Large" }, { value: "xlarge", label: "X-Large" }, { value: "none", label: "None" }], "keep-existing", absolute)}
    <InspectorFieldRow><InspectorSwitch label="Remove top margin" disabled={absolute || layout.marginMode === "none"} checked={layout.removeTopMargin ?? false} onChange={removeTopMargin => patch({ removeTopMargin })} /></InspectorFieldRow>
    <InspectorFieldRow><InspectorSwitch label="Remove bottom margin" disabled={absolute || layout.marginMode === "none"} checked={layout.removeBottomMargin ?? false} onChange={removeBottomMargin => patch({ removeBottomMargin })} /></InspectorFieldRow>
    {select("Max Width", "maxWidth", [{ value: "", label: "None" }, ...["small", "medium", "large", "xlarge", "2xlarge"].map((value, i) => ({ value, label: ["Small", "Medium", "Large", "X-Large", "2X-Large"][i] }))])}
    {select("Max Width Breakpoint", "maxWidthBreakpoint", breakpoints, "", !hasWidth)}
    {select("Block Alignment", "blockAlign", alignments, "left", !hasWidth || absolute)}
    {select("Block Alignment Breakpoint", "blockAlignBreakpoint", breakpoints, "", !hasWidth || absolute)}
    {select("Block Alignment Fallback", "blockAlignFallback", alignments, "left", !hasWidth || absolute || !layout.blockAlignBreakpoint)}
    {select("Text Alignment", "textAlign", textAlignments)}
    {select("Text Alignment Breakpoint", "textAlignBreakpoint", breakpoints, "", !layout.textAlign)}
    {select("Text Alignment Fallback", "textAlignFallback", textAlignments, "", !layout.textAlign || !layout.textAlignBreakpoint)}
    <InspectorFieldRow label="Animation"><InspectorSelect ariaLabel="Animation" value={preset} options={animations} onChange={value => update({ animation: { ...animation, preset: value as typeof animation.preset } })} /></InspectorFieldRow>
    <InspectorFieldRow><button type="button" className="inspector-control" disabled={preset !== "parallax"} onClick={() => setParallaxOpen(!parallaxOpen)}>Edit Parallax</button></InspectorFieldRow>
    {preset === "parallax" && parallaxOpen && <ParallaxEditor value={animation.parallax} onChange={parallax => update({ animation: { ...animation, parallax } })} />}
    {select("Visibility", "visibilityMode", [{ value: "", label: "Always" }, ...["visible", "hidden"].flatMap(mode => ["s", "m", "l", "xl"].map((size, i) => ({ value: `${mode}-${size}`, label: `${mode === "visible" ? "Visible" : "Hidden"} ${breakpoints[i + 1].label}` })))])}
  </InspectorDivision>;
}
