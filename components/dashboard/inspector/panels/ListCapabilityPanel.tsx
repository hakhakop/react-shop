"use client";

import { useRef } from "react";
import type { BuilderLayoutBlock, BuilderListItem, InspectorTab } from "@/components/dashboard/builderTypes";
import type { BuilderShellSettings } from "@/lib/builderShell";
import { UIKIT_LIST_CAPABILITY } from "@/lib/uikitCapabilities";
import { BUILDER_LINK_TARGET_OPTIONS } from "@/lib/websiteBuilderLinks";
import { InspectorFieldRow, InspectorPillGroup, InspectorSelect, InspectorTextField, InspectorAlignmentControl } from "@/components/dashboard/inspector/InspectorControls";
import IconPicker from "@/components/dashboard/inspector/IconPicker";
import RepeatableItemShell from "@/components/dashboard/inspector/RepeatableItemShell";
import { GeneralSettingsGroup } from "@/components/dashboard/inspector/panels/SharedSettingGroups";

type Props = {
  block: BuilderLayoutBlock;
  tab: InspectorTab;
  shellSettings: BuilderShellSettings;
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

export default function ListCapabilityPanel({ block, tab, shellSettings, update }: Props) {
  const items = canonicalItems(block);
  const updateItems = (next: BuilderListItem[]) => update({ listItems: next });
  const copySequenceRef = useRef(0);

  const reorderItems = (sourceIndex: number, targetIndex: number) => {
    if (sourceIndex < 0 || targetIndex < 0 || sourceIndex === targetIndex || sourceIndex >= items.length || targetIndex >= items.length) return;
    const next = [...items];
    const [moved] = next.splice(sourceIndex, 1);
    next.splice(targetIndex, 0, moved);
    updateItems(next);
  };

  const removeItem = (index: number) => updateItems(items.filter((_, itemIndex) => itemIndex !== index));

  const copyItem = (index: number) => {
    const source = items[index];
    if (!source) return;
    let id = "";
    do {
      copySequenceRef.current += 1;
      id = `${block.id ?? "list"}-item-copy-${copySequenceRef.current}`;
    } while (items.some((item) => item.id === id));
    const copy = { ...source, id, text: source.text ? `${source.text} Copy` : "Copy of item" };
    const next = [...items];
    next.splice(index + 1, 0, copy);
    updateItems(next);
    return id;
  };

  if (tab === "content") {
    return (
      <div className="builder-inspector-stack" data-uikit-capability="list-content">
        <section className="builder-inspector-section">
          <h3>Content</h3>
          <InspectorFieldRow label="Title"><InspectorTextField value={block.title ?? ""} onChange={(value) => update({ title: value })} ariaLabel="List title" /></InspectorFieldRow>
          <RepeatableItemShell
            items={items}
            getItemKey={(item) => item.id}
            itemLabel="Item"
            itemDataAttribute="data-list-item-id"
            getItemSummary={(item) => item.text || "Untitled item"}
            onAdd={() => {
              const id = `${block.id ?? "list"}-item-${Date.now().toString(36)}`;
              updateItems([...items, { id, text: `Item ${items.length + 1}` }]);
              return id;
            }}
            onCopy={copyItem}
            onDelete={removeItem}
            onReorder={reorderItems}
            renderItem={(item, index) => <>
              <InspectorFieldRow label="Text"><InspectorTextField value={item.text} onChange={(value) => updateItems(items.map((entry, itemIndex) => itemIndex === index ? { ...entry, text: value } : entry))} ariaLabel={`List item ${index + 1} text`} /></InspectorFieldRow>
              <InspectorFieldRow label="Link URL"><InspectorTextField value={item.url ?? ""} onChange={(value) => updateItems(items.map((entry, itemIndex) => itemIndex === index ? { ...entry, url: value || undefined } : entry))} ariaLabel={`List item ${index + 1} URL`} /></InspectorFieldRow>
              <InspectorFieldRow label="Link target"><InspectorSelect value={item.target ?? "_self"} options={BUILDER_LINK_TARGET_OPTIONS} onChange={(value) => updateItems(items.map((entry, itemIndex) => itemIndex === index ? { ...entry, target: value } : entry))} ariaLabel={`List item ${index + 1} target`} /></InspectorFieldRow>
              <InspectorFieldRow label="Icon">
                <IconPicker
                  value={item.iconName}
                  onChange={(value) => updateItems(items.map((entry, itemIndex) => itemIndex === index ? { ...entry, iconName: value } : entry))}
                  onClear={() => updateItems(items.map((entry, itemIndex) => itemIndex === index ? { ...entry, iconName: undefined } : entry))}
                  ariaLabel={`List item ${index + 1} icon`}
                />
              </InspectorFieldRow>
              <InspectorFieldRow label="Icon size"><InspectorSelect value={String(item.iconSize ?? block.listIconSize ?? 16)} options={[12, 14, 16, 20, 24, 28].map((value) => ({ value: String(value), label: `${value}px` }))} onChange={(value) => updateItems(items.map((entry, itemIndex) => itemIndex === index ? { ...entry, iconSize: Number(value) } : entry))} ariaLabel={`List item ${index + 1} icon size`} /></InspectorFieldRow>
            </>}
          />
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
          <InspectorFieldRow label="Alignment"><InspectorAlignmentControl value={block.listAlign ?? "left"} onChange={(value) => update({ listAlign: value })} ariaLabel="List alignment" /></InspectorFieldRow>
          <InspectorFieldRow label="Spacing"><InspectorPillGroup value={block.listSpacing ?? "default"} options={properties.spacing.values.map((value) => ({ value, label: labels[value] }))} onChange={(value) => update({ listSpacing: value })} ariaLabel="List spacing" /></InspectorFieldRow>
        </section>
        <GeneralSettingsGroup block={block} update={update} />
      </div>
    );
  }

  if (tab === "behavior") {
    return <div className="builder-inspector-stack" data-uikit-capability="list-behavior"><p className="builder-inspector-help">Links use the target selected on each list item. List presentation and markers remain UIkit-owned.</p></div>;
  }

  if (tab === "advanced") return null;

  return null;
}
