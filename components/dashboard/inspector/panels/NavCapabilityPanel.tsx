"use client";
import type { InspectorPanelContext } from "@/components/dashboard/inspector/inspectorRouting";
import type { BuilderNavItem } from "@/components/dashboard/builderTypes";
import { InspectorDivision, InspectorFieldRow, InspectorSelect, InspectorTextField, InspectorSwitch } from "@/components/dashboard/inspector/InspectorControls";
import RepeatableItemShell from "@/components/dashboard/inspector/RepeatableItemShell";
import DynamicContentInspectorGroup from "./DynamicContentInspectorGroup";
import type { DynamicFieldBinding } from "@/lib/dynamicContent";

export default function NavCapabilityPanel({ block, tab, update, previewCategoryTree }: InspectorPanelContext) {
  const items = block.navItems ?? [];
  const setItems = (navItems: BuilderNavItem[]) => update({ navItems });
  if (tab === "content") return <InspectorDivision title="Items">
    <RepeatableItemShell items={items} getItemKey={item => item.id} getItemSummary={item => item.label || (item.dynamicContext ? "Dynamic menu items" : "Untitled link")} itemLabel="Nav item"
      onAdd={() => { const id = crypto.randomUUID(); setItems([...items, { id, label: "Link", url: "#" }]); return id; }}
      onCopy={index => { const copy = { ...structuredClone(items[index]), id: crypto.randomUUID() }; const next = [...items]; next.splice(index + 1, 0, copy); setItems(next); return copy.id; }}
      onDelete={index => setItems(items.filter((_, i) => i !== index))}
      onReorder={(from, to) => { const next = [...items]; const [item] = next.splice(from, 1); next.splice(to, 0, item); setItems(next); }}
      renderItem={(item, index) => {
        const patch = (value: Partial<BuilderNavItem>) => setItems(items.map((current, i) => i === index ? { ...current, ...value } : current));
        const binding = (destination: "label" | "url" | "meta" | "imageUrl" | "type" | "active") => ({ destination, descriptor: item.dynamicContext, bindings: item.dynamicBindings,
          onChange: (key: string, value: DynamicFieldBinding | undefined) => { const next = { ...item.dynamicBindings }; if (value) next[key] = value; else delete next[key]; patch({ dynamicBindings: next }); } });
        return <div className="builder-inspector-stack">
          <InspectorFieldRow label="Content" dynamicBinding={binding("label")}><InspectorTextField value={item.label} onChange={label => patch({ label })} /></InspectorFieldRow>
          <InspectorFieldRow label="Link" dynamicBinding={binding("url")}><InspectorTextField value={item.url ?? ""} onChange={url => patch({ url })} /></InspectorFieldRow>
          <InspectorFieldRow label="Type" dynamicBinding={binding("type")}><InspectorSelect value={item.type ?? "link"} options={[{ value: "link", label: "Link" }, { value: "header", label: "Header" }, { value: "divider", label: "Divider" }]} onChange={value => patch({ type: value as BuilderNavItem["type"] })} /></InspectorFieldRow>
          <InspectorFieldRow label="Active" dynamicBinding={binding("active")}><InspectorSwitch checked={item.active === "true"} onChange={active => patch({ active: active ? "true" : "" })} /></InspectorFieldRow>
          <InspectorFieldRow label="Target"><InspectorSelect value={item.target ?? "_self"} options={[{ value: "_self", label: "Same tab" }, { value: "_blank", label: "New tab" }]} onChange={value => patch({ target: value as BuilderNavItem["target"] })} /></InspectorFieldRow>
          <InspectorFieldRow label="Meta" dynamicBinding={binding("meta")}><InspectorTextField value={item.meta ?? ""} onChange={meta => patch({ meta })} /></InspectorFieldRow>
          <InspectorFieldRow label="Image" dynamicBinding={binding("imageUrl")}><InspectorTextField value={item.imageUrl ?? ""} onChange={imageUrl => patch({ imageUrl })} /></InspectorFieldRow>
          <DynamicContentInspectorGroup item={item} update={patch} categoryTree={previewCategoryTree} />
        </div>;
      }} />
  </InspectorDivision>;
  return <InspectorDivision title="Nav">
    <InspectorFieldRow label="Style"><InspectorSelect value={block.navStyle ?? "default"} options={["default", "primary", "secondary"].map(value => ({ value, label: value }))} onChange={value => update({ navStyle: value as typeof block.navStyle })} /></InspectorFieldRow>
    <InspectorFieldRow label="Columns"><InspectorSelect value={String(block.navColumns ?? 1)} options={[1, 2, 3, 4, 5, 6].map(value => ({ value: String(value), label: String(value) }))} onChange={value => update({ navColumns: Number(value) })} /></InspectorFieldRow>
    <InspectorFieldRow label="Show image"><InspectorSwitch checked={block.navShowImage !== false} onChange={navShowImage => update({ navShowImage })} /></InspectorFieldRow>
    <InspectorFieldRow label="Center image vertically"><InspectorSwitch checked={block.navImageVerticalAlign === true} onChange={navImageVerticalAlign => update({ navImageVerticalAlign })} /></InspectorFieldRow>
    <InspectorFieldRow label="Show meta"><InspectorSwitch checked={block.navShowMeta !== false} onChange={navShowMeta => update({ navShowMeta })} /></InspectorFieldRow>
  </InspectorDivision>;
}
