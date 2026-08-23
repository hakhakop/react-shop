"use client";

import type { BuilderColumn, BuilderLayoutAdvancedSettings, BuilderLayoutHtmlElement, InspectorTab, WordPressMediaItem } from "@/components/dashboard/builderTypes";
import { InspectorFieldRow, InspectorPillGroup, InspectorSelect, InspectorSwitch, InspectorTextarea, InspectorTextField } from "@/components/dashboard/inspector/InspectorControls";
import { BuilderImageUrlControl } from "@/components/dashboard/inspector/panels/InspectorSharedControls";
import DynamicContentInspectorGroup from "@/components/dashboard/inspector/panels/DynamicContentInspectorGroup";

type Props = { column: BuilderColumn; tab: InspectorTab; update: (patch: Partial<BuilderColumn>) => void; openWordPressMediaPicker?: (options: { title: string; currentUrl?: string; onSelect: (media: WordPressMediaItem) => void }) => void };

function attributesValue(attributes: BuilderLayoutAdvancedSettings["attributes"]) {
  if (!attributes) return "";
  return typeof attributes === "string" ? attributes : Object.entries(attributes).map(([name, value]) => `${name}=${value}`).join("\n");
}

export default function ColumnCapabilityPanel({ column, tab, update, openWordPressMediaPicker }: Props) {
  const updateBackground = (patch: Partial<NonNullable<BuilderColumn["background"]>>) => update({ background: { ...(column.background ?? {}), ...patch } });
  const updateSticky = (patch: Partial<NonNullable<BuilderColumn["sticky"]>>) => update({ sticky: { ...(column.sticky ?? {}), ...patch } });
  const updateAdvanced = (patch: Partial<BuilderLayoutAdvancedSettings>) => update({ advanced: { ...(column.advanced ?? {}), ...patch } });
  const stickyMode = column.sticky?.mode ?? (column.sticky?.topOffset || column.sticky?.bottomOffset ? "column-within-row" : "none");
  const stickyEnabled = stickyMode !== "none";

  if (tab === "content") return <div className="builder-inspector-stack" data-canonical-owner="BuilderColumn">
    <InspectorFieldRow label="Image"><BuilderImageUrlControl value={column.background?.imageUrl ?? ""} placeholder="http://" chooseLabel="Select Image" onChange={(event) => updateBackground({ imageUrl: event.target.value || undefined })} onChoose={() => openWordPressMediaPicker?.({ title: "Column Image", currentUrl: column.background?.imageUrl, onSelect: (media) => updateBackground({ imageUrl: media.sourceUrl }) })} /></InspectorFieldRow>
    <InspectorFieldRow label="Video"><BuilderImageUrlControl value={column.background?.videoUrl ?? ""} placeholder="http://" chooseLabel="Select Video" onChange={(event) => updateBackground({ videoUrl: event.target.value || undefined })} onChoose={() => openWordPressMediaPicker?.({ title: "Column Video", currentUrl: column.background?.videoUrl, onSelect: (media) => updateBackground({ videoUrl: media.sourceUrl }) })} /></InspectorFieldRow>
  </div>;

  if (tab === "settings") return <div className="builder-inspector-stack" data-canonical-owner="BuilderColumn">
    <InspectorFieldRow label="Vertical Alignment"><InspectorPillGroup value={column.verticalAlign ?? "top"} options={[{ value: "top", label: "Top" }, { value: "middle", label: "Middle" }, { value: "bottom", label: "Bottom" }]} onChange={(verticalAlign) => update({ verticalAlign })} ariaLabel="Column Vertical Alignment" /></InspectorFieldRow>
    <InspectorFieldRow label="Style"><InspectorSelect value={column.style ?? "none"} options={[{ value: "none", label: "None" }, { value: "default", label: "Card Default" }, { value: "primary", label: "Card Primary" }, { value: "secondary", label: "Card Secondary" }, { value: "card-hover", label: "Card Hover" }, { value: "tile-default", label: "Tile Default" }, { value: "tile-muted", label: "Tile Muted" }, { value: "tile-primary", label: "Tile Primary" }, { value: "tile-secondary", label: "Tile Secondary" }]} onChange={(style) => update({ style: style === "none" ? undefined : style })} ariaLabel="Column style" /></InspectorFieldRow>
    <InspectorFieldRow label="Preserve Text Color"><InspectorSwitch checked={column.preserveColor === true} onChange={(preserveColor) => update({ preserveColor })} label="Preserve text color" /></InspectorFieldRow>
    <InspectorFieldRow label="Text Color"><InspectorSelect value={column.textColor ?? "none"} options={[{ value: "none", label: "None" }, { value: "light", label: "Light" }, { value: "dark", label: "Dark" }]} onChange={(textColor) => update({ textColor })} ariaLabel="Column Text Color" /></InspectorFieldRow>
    <InspectorFieldRow label="HTML Element"><InspectorSelect value={column.htmlElement ?? "div"} options={["div", "address", "article", "aside", "footer", "header", "hgroup", "nav", "section"].map((value) => ({ value, label: value }))} onChange={(htmlElement) => update({ htmlElement: htmlElement as BuilderLayoutHtmlElement })} ariaLabel="Column HTML Element" /></InspectorFieldRow>
    <InspectorFieldRow label="Position Sticky"><InspectorSelect value={stickyMode} options={[{ value: "none", label: "None" }, { value: "elements-within-column", label: "Elements within Column" }, { value: "column-within-row", label: "Column within Row" }, { value: "column-within-section", label: "Column within Section" }, { value: "always", label: "Always" }]} onChange={(mode) => updateSticky({ mode })} ariaLabel="Column Sticky Mode" /></InspectorFieldRow>
    <InspectorFieldRow label="Blend with page content"><InspectorSwitch checked={column.sticky?.blend === true} disabled={!stickyEnabled} onChange={(blend) => updateSticky({ blend })} label="Blend with page content" /></InspectorFieldRow>
    <div className="builder-two-column"><InspectorFieldRow label="Top Offset"><InspectorTextField value={column.sticky?.topOffset ?? ""} disabled={!stickyEnabled} placeholder="0" onChange={(topOffset) => updateSticky({ topOffset: topOffset || undefined })} ariaLabel="Column sticky top offset" /></InspectorFieldRow><InspectorFieldRow label="Bottom Offset"><InspectorTextField value={column.sticky?.bottomOffset ?? ""} disabled={!stickyEnabled} placeholder="0" onChange={(bottomOffset) => updateSticky({ bottomOffset: bottomOffset || undefined })} ariaLabel="Column sticky bottom offset" /></InspectorFieldRow></div>
    <InspectorFieldRow label="Position Sticky Breakpoint"><InspectorSelect value={column.sticky?.breakpoint ?? ""} disabled={!stickyEnabled} options={[{ value: "", label: "Always" }, { value: "s", label: "Small (Phone Landscape)" }, { value: "m", label: "Medium (Tablet Landscape)" }, { value: "l", label: "Large (Desktop)" }, { value: "xl", label: "X-Large (Large Screens)" }]} onChange={(breakpoint) => updateSticky({ breakpoint })} ariaLabel="Column sticky breakpoint" /></InspectorFieldRow>
    <InspectorFieldRow label="Empty Dynamic Content"><InspectorSwitch checked={column.keepEmpty === true} onChange={(keepEmpty) => update({ keepEmpty })} label="Don't collapse column" /></InspectorFieldRow>
  </div>;

  if (tab === "advanced") return <div className="builder-inspector-stack" data-canonical-owner="BuilderColumn">
    <DynamicContentInspectorGroup item={column} update={update} />
    <InspectorFieldRow label="ID"><InspectorTextField value={column.advanced?.htmlId ?? ""} onChange={(htmlId) => updateAdvanced({ htmlId: htmlId || undefined })} ariaLabel="Column Advanced ID" /></InspectorFieldRow>
    <InspectorFieldRow label="Class"><InspectorTextField value={column.advanced?.className ?? ""} onChange={(className) => updateAdvanced({ className: className || undefined })} ariaLabel="Column Advanced Class" /></InspectorFieldRow>
    <InspectorFieldRow label="Attributes"><InspectorTextarea value={attributesValue(column.advanced?.attributes)} onChange={(attributes) => updateAdvanced({ attributes: attributes || undefined })} ariaLabel="Column Advanced Attributes" /></InspectorFieldRow>
    <InspectorFieldRow label="CSS"><InspectorTextarea value={column.advanced?.css ?? ""} onChange={(css) => updateAdvanced({ css: css || undefined })} ariaLabel="Column Advanced CSS" /></InspectorFieldRow>
  </div>;

  return null;
}
