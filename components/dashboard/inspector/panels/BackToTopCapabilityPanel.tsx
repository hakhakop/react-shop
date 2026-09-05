"use client";

import type { InspectorPanelContext } from "@/components/dashboard/inspector/inspectorRouting";
import type { LayoutBlockKind } from "@/components/dashboard/builderTypes";
import { baseLayoutBlockKinds, layoutBlockLabels } from "@/components/dashboard/builderRegistry";
import { transformBackToTop } from "@/lib/backToTopTransform";
import DynamicContentInspectorGroup from "@/components/dashboard/inspector/panels/DynamicContentInspectorGroup";
import { InspectorDivision, InspectorFieldRow, InspectorTextField, InspectorTextarea, InspectorSelect, InspectorSwitch, inspectorDynamicBinding } from "@/components/dashboard/inspector/InspectorControls";

const gaps = [{ value: "small", label: "Small" }, { value: "medium", label: "Medium" }, { value: "", label: "Default" }, { value: "large", label: "Large" }, { value: "collapse", label: "None" }];
export default function BackToTopCapabilityPanel({ block, tab, update, previewCategoryTree }: InspectorPanelContext) {
  const settings = block.backToTop ?? {};
  const patch = (next: Partial<NonNullable<typeof block.backToTop>>) => update({ backToTop: { ...settings, ...next } });
  if (tab === "advanced") return (
    <div className="builder-inspector-stack">
      <InspectorFieldRow label="Name"><InspectorTextField ariaLabel="Name" value={settings.name ?? ""} onChange={(name) => update({ title: name, backToTop: { ...settings, name } })} /></InspectorFieldRow>
      <InspectorFieldRow label="Status"><InspectorSwitch label="Disable element" checked={settings.disabled ?? false} onChange={(disabled) => patch({ disabled })} /></InspectorFieldRow>
      <DynamicContentInspectorGroup item={block} update={update} categoryTree={previewCategoryTree} />
      <InspectorFieldRow label="ID" dynamicBinding={inspectorDynamicBinding(block, update, "backToTopHtmlId")}><InspectorTextField ariaLabel="ID" value={block.backToTopHtmlId ?? settings.htmlId ?? ""} onChange={backToTopHtmlId => update({ backToTopHtmlId })} /></InspectorFieldRow>
      <InspectorFieldRow label="Classes" dynamicBinding={inspectorDynamicBinding(block, update, "backToTopClasses")}><InspectorTextField ariaLabel="Classes" value={block.backToTopClasses ?? block.visualStyle?.customClass ?? ""} onChange={backToTopClasses => update({ backToTopClasses })} /></InspectorFieldRow>
      <InspectorFieldRow label="Attributes" dynamicBinding={inspectorDynamicBinding(block, update, "backToTopAttributes")} help="One attribute per line, using name=value. Executable attributes are not allowed."><InspectorTextarea ariaLabel="Attributes" value={block.backToTopAttributes ?? block.visualStyle?.customAttributes ?? ""} onChange={backToTopAttributes => update({ backToTopAttributes })} /></InspectorFieldRow>
      <InspectorFieldRow label="CSS" help="Scoped to this element. Use .el-element and .el-title."><InspectorTextarea ariaLabel="CSS" value={block.visualStyle?.customCss ?? ""} onChange={customCss => update({ visualStyle: { ...block.visualStyle, customCss } })} /></InspectorFieldRow>
      <InspectorFieldRow label="Transform" help="Replace this element while keeping compatible content and shared settings. Unused settings are removed; Undo restores the original."><InspectorSelect ariaLabel="Select Element" value="" options={[{ value: "", label: "Select Element" }, ...baseLayoutBlockKinds.filter(kind => kind !== "backToTop").map(kind => ({ value: kind, label: layoutBlockLabels[kind] }))]} onChange={kind => { if (kind) update(transformBackToTop(block, kind as LayoutBlockKind)); }} /></InspectorFieldRow>
    </div>
  );
  if (tab === "content") return (
    <div className="builder-inspector-stack">
      <InspectorFieldRow label="Title"><InspectorTextField value={settings.title ?? ""} onChange={(title) => patch({ title })} ariaLabel="Title" /></InspectorFieldRow>
      <InspectorFieldRow label="Link Title" dynamicBinding={inspectorDynamicBinding(block, update, "backToTopLinkTitle")} help="Optional title attribute of the link, shown on hover."><InspectorTextField value={block.backToTopLinkTitle ?? settings.linkTitle ?? ""} onChange={(backToTopLinkTitle) => update({ backToTopLinkTitle })} ariaLabel="Link Title" /></InspectorFieldRow>
    </div>
  );
  return (
    <div className="builder-inspector-stack">
      <InspectorDivision title="TITLE">
        <InspectorFieldRow label="Style"><InspectorSelect ariaLabel="Title Style" disabled={!settings.title} value={settings.titleStyle ?? ""} options={[{ value: "", label: "None" }, { value: "small", label: "Small" }, { value: "meta", label: "Meta" }]} onChange={(value) => patch({ titleStyle: value as typeof settings.titleStyle })} /></InspectorFieldRow>
        <InspectorFieldRow label="Grid Column Gap"><InspectorSelect ariaLabel="Grid Column Gap" disabled={!settings.title} value={settings.columnGap ?? "small"} options={gaps} onChange={(value) => patch({ columnGap: value as typeof settings.columnGap })} /></InspectorFieldRow>
        <InspectorFieldRow label="Grid Row Gap"><InspectorSelect ariaLabel="Grid Row Gap" disabled={!settings.title} value={settings.rowGap ?? "small"} options={gaps} onChange={(value) => patch({ rowGap: value as typeof settings.rowGap })} /></InspectorFieldRow>
        <InspectorFieldRow label="Grid Breakpoint"><InspectorSelect ariaLabel="Grid Breakpoint" disabled={!settings.title} value={settings.breakpoint ?? ""} options={[{ value: "", label: "Always" }, { value: "s", label: "Small (Phone Landscape)" }, { value: "m", label: "Medium (Tablet Landscape)" }, { value: "l", label: "Large (Desktop)" }, { value: "xl", label: "X-Large (Large Screens)" }]} onChange={(value) => patch({ breakpoint: value as typeof settings.breakpoint })} /></InspectorFieldRow>
      </InspectorDivision>
      <InspectorDivision title="DISPLAY">
        <InspectorFieldRow label="Floating Button" help="Also show a fixed button after scrolling 400px."><InspectorSwitch label="Floating Button" checked={settings.floatingButton ?? false} onChange={(floatingButton) => patch({ floatingButton })} /></InspectorFieldRow>
      </InspectorDivision>
    </div>
  );
}
