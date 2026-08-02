"use client";

import type { BuilderLayoutBlock, BuilderListItem, InspectorTab } from "@/components/dashboard/builderTypes";
import { UIKIT_LIST_CAPABILITY } from "@/lib/uikitCapabilities";
import { InspectorFieldRow, InspectorPillGroup, InspectorSelect, InspectorTextField } from "@/components/dashboard/inspector/InspectorControls";

type Props = {
  block: BuilderLayoutBlock;
  tab: InspectorTab;
  update: (patch: Partial<BuilderLayoutBlock>) => void;
};

const labels: Record<string, string> = {
  default: "Default",
  bullet: "Bullet",
  divider: "Divider",
  striped: "Striped",
  large: "Large",
  none: "None",
  disc: "Disc",
  circle: "Circle",
  square: "Square",
  compact: "Compact",
  left: "Left",
  center: "Center",
  right: "Right",
};

function canonicalItems(block: BuilderLayoutBlock): BuilderListItem[] {
  return block.listItems?.length
    ? block.listItems
    : (block.items ?? []).map((text, index) => ({ id: `${block.id ?? "list"}-item-${index + 1}`, text }));
}

export default function ListCapabilityPanel({ block, tab, update }: Props) {
  const items = canonicalItems(block);
  const updateItems = (next: BuilderListItem[]) => update({ listItems: next });

  if (tab === "content") {
    return (
      <div className="builder-inspector-stack" data-uikit-capability="list-content">
        <section className="builder-inspector-section">
          <h3>Content</h3>
          <InspectorFieldRow label="Title"><InspectorTextField value={block.title ?? ""} onChange={(value) => update({ title: value })} ariaLabel="List title" /></InspectorFieldRow>
          {items.map((item, index) => (
            <div className="builder-inspector-section" key={item.id} data-list-item-id={item.id}>
              <h4>Item {index + 1}</h4>
              <InspectorFieldRow label="Text"><InspectorTextField value={item.text} onChange={(value) => updateItems(items.map((entry, itemIndex) => itemIndex === index ? { ...entry, text: value } : entry))} ariaLabel={`List item ${index + 1} text`} /></InspectorFieldRow>
              <InspectorFieldRow label="Link URL"><InspectorTextField value={item.url ?? ""} onChange={(value) => updateItems(items.map((entry, itemIndex) => itemIndex === index ? { ...entry, url: value || undefined } : entry))} ariaLabel={`List item ${index + 1} URL`} /></InspectorFieldRow>
              <InspectorFieldRow label="Link target"><InspectorSelect value={item.target ?? "_self"} options={[{ value: "_self", label: "Same tab" }, { value: "_blank", label: "New tab" }]} onChange={(value) => updateItems(items.map((entry, itemIndex) => itemIndex === index ? { ...entry, target: value } : entry))} ariaLabel={`List item ${index + 1} target`} /></InspectorFieldRow>
              <div className="builder-two-column">
                <button type="button" className="builder-secondary-button" disabled={index === 0} onClick={() => { const next = [...items]; [next[index - 1], next[index]] = [next[index], next[index - 1]]; updateItems(next); }}>Move up</button>
                <button type="button" className="builder-secondary-button" disabled={index === items.length - 1} onClick={() => { const next = [...items]; [next[index], next[index + 1]] = [next[index + 1], next[index]]; updateItems(next); }}>Move down</button>
              </div>
              <button type="button" className="builder-inline-delete" onClick={() => updateItems(items.filter((_, itemIndex) => itemIndex !== index))}>Remove item</button>
            </div>
          ))}
          <button type="button" className="builder-inline-add" onClick={() => updateItems([...items, { id: `${block.id ?? "list"}-item-${Date.now().toString(36)}`, text: `Item ${items.length + 1}` }])}>Add item</button>
        </section>
      </div>
    );
  }

  if (tab === "style") {
    const properties = UIKIT_LIST_CAPABILITY.properties;
    return (
      <div className="builder-inspector-stack" data-uikit-capability="list-style">
        <section className="builder-inspector-section">
          <h3>Style</h3>
          <InspectorFieldRow label="Presentation"><InspectorSelect value={block.listPresentation ?? "default"} options={properties.presentation.values.map((value) => ({ value, label: labels[value] }))} onChange={(value) => update({ listPresentation: value })} ariaLabel="List presentation" /></InspectorFieldRow>
          <InspectorFieldRow label="Marker"><InspectorPillGroup value={block.listMarker ?? "none"} options={properties.marker.values.map((value) => ({ value, label: labels[value] }))} onChange={(value) => update({ listMarker: value })} ariaLabel="List marker" /></InspectorFieldRow>
          <InspectorFieldRow label="Alignment"><InspectorPillGroup value={block.listAlign ?? "left"} options={properties.alignment.values.map((value) => ({ value, label: labels[value] }))} onChange={(value) => update({ listAlign: value })} ariaLabel="List alignment" /></InspectorFieldRow>
          <InspectorFieldRow label="Spacing"><InspectorPillGroup value={block.listSpacing ?? "default"} options={properties.spacing.values.map((value) => ({ value, label: labels[value] }))} onChange={(value) => update({ listSpacing: value })} ariaLabel="List spacing" /></InspectorFieldRow>
        </section>
      </div>
    );
  }

  if (tab === "behavior") {
    return <div className="builder-inspector-stack" data-uikit-capability="list-behavior"><p className="builder-inspector-help">Links use the target selected on each list item. List presentation and markers remain UIkit-owned.</p></div>;
  }

  if (tab === "advanced") {
    return <div className="builder-inspector-stack" data-uikit-capability="list-advanced"><p className="builder-inspector-help">Visibility, animation, and custom class behavior remain in shared Advanced controls.</p></div>;
  }

  return null;
}
