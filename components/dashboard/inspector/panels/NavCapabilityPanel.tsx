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
  if (tab === "content") return <><InspectorDivision title="Items">
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
          <InspectorFieldRow label="Subtitle" dynamicBinding={binding("meta")}><InspectorTextField value={item.meta ?? ""} onChange={meta => patch({ meta })} /></InspectorFieldRow>
          <InspectorFieldRow label="Image" dynamicBinding={binding("imageUrl")}><InspectorTextField value={item.imageUrl ?? ""} onChange={imageUrl => patch({ imageUrl })} /></InspectorFieldRow>
          <InspectorFieldRow label="Image alt"><InspectorTextField value={item.imageAlt ?? ""} onChange={imageAlt => patch({ imageAlt })} /></InspectorFieldRow>
          <InspectorFieldRow label="Icon"><InspectorTextField value={item.icon ?? ""} onChange={icon => patch({ icon })} /></InspectorFieldRow>
          <InspectorFieldRow label="Smooth scroll"><InspectorSwitch checked={item.scroll === true} onChange={scroll => patch({ scroll })} /></InspectorFieldRow>
          <DynamicContentInspectorGroup item={item} update={patch} categoryTree={previewCategoryTree} />
        </div>;
      }} />
  </InspectorDivision><InspectorDivision title="Display">
    <InspectorFieldRow label="Show subtitle"><InspectorSwitch checked={block.navShowMeta !== false} onChange={navShowMeta => update({ navShowMeta })} /></InspectorFieldRow>
    <InspectorFieldRow label="Show image"><InspectorSwitch checked={block.navShowImage !== false} onChange={navShowImage => update({ navShowImage })} /></InspectorFieldRow>
  </InspectorDivision></>;
  return <InspectorDivision title="Nav">
    <InspectorFieldRow label="Style"><InspectorSelect value={block.navStyle ?? "default"} options={["default", "primary", "secondary", "navbar"].map(value => ({ value, label: value === "navbar" ? "Navbar Dropdown" : value }))} onChange={value => update({ navStyle: value as typeof block.navStyle })} /></InspectorFieldRow>
    <InspectorFieldRow label="Show dividers"><InspectorSwitch checked={block.navDivider === true} onChange={navDivider => update({ navDivider })} /></InspectorFieldRow>
    <InspectorFieldRow label="Primary size"><InspectorSelect value={block.navSize ?? ""} options={[{ value: "", label: "Default" }, ...["medium", "large", "xlarge"].map(value => ({ value, label: value }))]} onChange={value => update({ navSize: (value || undefined) as typeof block.navSize })} /></InspectorFieldRow>
    <InspectorFieldRow label="HTML element"><InspectorSelect value={block.navHtmlElement ?? "div"} options={["div", "nav"].map(value => ({ value, label: value }))} onChange={value => update({ navHtmlElement: value as "div" | "nav" })} /></InspectorFieldRow>
    <InspectorFieldRow label="Columns"><InspectorSelect value={String(block.navColumns ?? 1)} options={[1, 2, 3, 4, 5, 6].map(value => ({ value: String(value), label: String(value) }))} onChange={value => update({ navColumns: Number(value) })} /></InspectorFieldRow>
    <InspectorFieldRow label="Column dividers"><InspectorSwitch checked={block.navGridDivider === true} onChange={navGridDivider => update({ navGridDivider })} /></InspectorFieldRow>
    <InspectorFieldRow label="Columns breakpoint"><InspectorSelect value={block.navGridBreakpoint ?? ""} options={[{ value: "", label: "Always" }, ...["s", "m", "l", "xl"].map(value => ({ value, label: value }))]} onChange={value => update({ navGridBreakpoint: (value || undefined) as typeof block.navGridBreakpoint })} /></InspectorFieldRow>
    {(["navGridColumnGap", "navGridRowGap"] as const).map(key => <InspectorFieldRow key={key} label={key === "navGridColumnGap" ? "Column gap" : "Row gap"}><InspectorSelect value={block[key] ?? ""} options={[{ value: "", label: "Default" }, ...["small", "medium", "large", "collapse"].map(value => ({ value, label: value === "collapse" ? "None" : value }))]} onChange={value => update({ [key]: value || undefined })} /></InspectorFieldRow>)}
    {(["imageWidth", "imageHeight"] as const).map(key => <InspectorFieldRow key={key} label={key === "imageWidth" ? "Image width" : "Image height"}><InspectorTextField value={String(block[key] ?? "")} onChange={value => update({ [key]: value || undefined })} /></InspectorFieldRow>)}
    <InspectorFieldRow label="Load image eagerly"><InspectorSwitch checked={block.imageLoading === "eager"} onChange={value => update({ imageLoading: value ? "eager" : "lazy" })} /></InspectorFieldRow>
    <InspectorFieldRow label="Image margin"><InspectorSwitch checked={block.navImageMargin !== false} onChange={navImageMargin => update({ navImageMargin })} /></InspectorFieldRow>
    <InspectorFieldRow label="Image border"><InspectorSelect value={block.imageBorder ?? ""} options={[{ value: "", label: "None" }, ...["rounded", "circle", "pill"].map(value => ({ value, label: value }))]} onChange={imageBorder => update({ imageBorder })} /></InspectorFieldRow>
    <InspectorFieldRow label="Inline SVG"><InspectorSwitch checked={block.imageSvgInline === true} onChange={imageSvgInline => update({ imageSvgInline })} /></InspectorFieldRow>
    <InspectorFieldRow label="SVG color"><InspectorSelect value={block.imageSvgColor ?? ""} options={[{ value: "", label: "None" }, ...["muted", "emphasis", "primary", "secondary", "success", "warning", "danger"].map(value => ({ value, label: value }))]} onChange={imageSvgColor => update({ imageSvgColor })} /></InspectorFieldRow>
    <InspectorFieldRow label="Icon width"><InspectorTextField value={String(block.iconSize ?? "")} onChange={value => update({ iconSize: Number(value) || undefined })} /></InspectorFieldRow>
    <InspectorFieldRow label="Center image vertically"><InspectorSwitch checked={block.navImageVerticalAlign === true} onChange={navImageVerticalAlign => update({ navImageVerticalAlign })} /></InspectorFieldRow>
  </InspectorDivision>;
}
