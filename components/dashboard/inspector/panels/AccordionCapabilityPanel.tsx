"use client";

import { useRef } from "react";
import type { BuilderLayoutBlock, InspectorTab } from "@/components/dashboard/builderTypes";
import { UIKIT_ACCORDION_CAPABILITY } from "@/lib/uikitCapabilities";
import { InspectorFieldRow, InspectorPillGroup, InspectorSelect, InspectorSwitch, InspectorTextField, InspectorTextarea } from "@/components/dashboard/inspector/InspectorControls";
import RepeatableItemShell from "@/components/dashboard/inspector/RepeatableItemShell";

type Props = {
  block: BuilderLayoutBlock;
  tab: InspectorTab;
  update: (patch: Partial<BuilderLayoutBlock>) => void;
};

type AccordionItem = NonNullable<BuilderLayoutBlock["accordionItems"]>[number];

function remapOpenIndexes(openIndexes: number[], sourceIndex: number, targetIndex: number) {
  return [...new Set(openIndexes.map((openIndex) => {
    if (openIndex === sourceIndex) return targetIndex;
    if (sourceIndex < targetIndex && openIndex > sourceIndex && openIndex <= targetIndex) return openIndex - 1;
    if (sourceIndex > targetIndex && openIndex >= targetIndex && openIndex < sourceIndex) return openIndex + 1;
    return openIndex;
  }))].sort((a, b) => a - b);
}

export default function AccordionCapabilityPanel({ block, tab, update }: Props) {
  const items = block.accordionItems ?? [];
  const labels = <T extends string>(values: readonly T[]) => values.map((value) => ({ value, label: value.replace(/-/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase()) }));
  const copySequenceRef = useRef(0);

  const updateItems = (next: AccordionItem[]) => update({ accordionItems: next });
  const updateItem = (index: number, patch: Partial<AccordionItem>) => updateItems(items.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item));

  const reorderItems = (sourceIndex: number, targetIndex: number) => {
    if (sourceIndex < 0 || targetIndex < 0 || sourceIndex === targetIndex) return;
    const next = [...items];
    const [moved] = next.splice(sourceIndex, 1);
    next.splice(targetIndex, 0, moved);
    update({
      accordionItems: next,
      ...(block.accordionOpenItems
        ? { accordionOpenItems: remapOpenIndexes(block.accordionOpenItems, sourceIndex, targetIndex) }
        : {}),
    });
  };

  const removeItem = (index: number) => {
    const next = items.filter((_, itemIndex) => itemIndex !== index);
    const nextOpenItems = (block.accordionOpenItems ?? [])
      .filter((openIndex) => openIndex !== index)
      .map((openIndex) => openIndex > index ? openIndex - 1 : openIndex);
    update({ accordionItems: next, accordionOpenItems: nextOpenItems });
  };

  const copyItem = (index: number) => {
    const source = items[index];
    if (!source) return;
    let id = "";
    do {
      copySequenceRef.current += 1;
      id = `${block.id ?? "accordion"}-item-copy-${copySequenceRef.current}`;
    } while (items.some((item) => item.id === id));
    const copy = {
      ...source,
      id,
      title: source.title ? `${source.title} Copy` : "Copy of item",
    };
    const next = [...items];
    next.splice(index + 1, 0, copy);
    const nextOpenItems = (block.accordionOpenItems ?? []).map((openIndex) => openIndex > index ? openIndex + 1 : openIndex);
    update({ accordionItems: next, accordionOpenItems: nextOpenItems });
    return id;
  };

  if (tab === "content") {
    return (
      <div className="builder-inspector-stack" data-uikit-capability="accordion-content">
        <div className="builder-element-inspector-note"><strong>Accordion items</strong><span>WebPages owns titles, content, ordering, and JSON persistence.</span></div>
        <RepeatableItemShell
          items={items}
          getItemKey={(item) => item.id}
          itemLabel="Item"
          itemDataAttribute="data-accordion-item-id"
          orderLabel="Order"
          getItemSummary={(item) => item.title || "Untitled item"}
          onAdd={() => {
            const id = `${block.id ?? "accordion"}-item-${Date.now().toString(36)}`;
            updateItems([...items, { id, title: "New item", content: "Add accordion content." }]);
            return id;
          }}
          onCopy={copyItem}
          onDelete={removeItem}
          onReorder={reorderItems}
          renderItem={(item, index) => <>
            <InspectorFieldRow label="Title"><InspectorTextField value={item.title} onChange={(value) => updateItem(index, { title: value })} ariaLabel={`Accordion item ${index + 1} title`} /></InspectorFieldRow>
            <InspectorFieldRow label="Content"><InspectorTextarea value={item.content} onChange={(value) => updateItem(index, { content: value })} ariaLabel={`Accordion item ${index + 1} content`} /></InspectorFieldRow>
          </>}
        />
      </div>
    );
  }

  if (tab === "behavior") {
    const openItems = block.accordionOpenItems ?? [];
    const initialOpen = openItems.length === 0 ? "none" : openItems.length === 1 && openItems[0] === 0 ? "first" : "custom";
    return (
      <div className="builder-inspector-stack" data-uikit-capability="accordion-behavior">
        <div className="builder-element-inspector-note"><strong>UIkit Accordion behavior</strong><span>UIkit owns disclosure interaction, animation, focus, and keyboard behavior.</span></div>
        <InspectorFieldRow label="Allow multiple open"><InspectorSwitch checked={block.accordionMultiple !== false} onChange={(checked) => update({ accordionMultiple: checked })} label="Allow multiple open" /></InspectorFieldRow>
        <InspectorFieldRow label="Collapsible"><InspectorSwitch checked={block.accordionCollapsible !== false} onChange={(checked) => update({ accordionCollapsible: checked })} label="Collapsible" /></InspectorFieldRow>
        <InspectorFieldRow label="Initially open"><InspectorSelect value={initialOpen} options={labels(UIKIT_ACCORDION_CAPABILITY.properties.initialOpen.values)} onChange={(value) => update({ accordionOpenItems: value === "none" ? [] : value === "first" ? [0] : openItems.length > 0 ? openItems : [0] })} ariaLabel="Initially open" /></InspectorFieldRow>
        {initialOpen === "custom" && <div className="builder-field"><span>Open items</span>{items.map((item, index) => <label className="builder-check" key={item.id}><input type="checkbox" checked={openItems.includes(index)} onChange={(event) => { const next = event.target.checked ? [...new Set([...openItems, index])] : openItems.filter((openIndex) => openIndex !== index); update({ accordionOpenItems: block.accordionMultiple === false ? (next.length ? [next[next.length - 1]] : []) : next }); }} /><span>{index + 1}. {item.title}</span></label>)}</div>}
      </div>
    );
  }

  if (tab === "style") {
    const properties = UIKIT_ACCORDION_CAPABILITY.properties;
    const options = <T extends string>(values: readonly T[]) => labels(values);
    return <div className="builder-inspector-stack" data-uikit-capability="accordion-style">
      <div className="builder-element-inspector-note"><strong>Accordion appearance</strong><span>Semantic overrides resolve Global Style → Accordion defaults → this Accordion.</span></div>
      <InspectorFieldRow label="Style"><InspectorPillGroup value={block.accordionStyle ?? (block.accordionRowStyle === "divided" ? "divided" : "default")} options={options(properties.style.values)} onChange={(value) => update({ accordionStyle: value as BuilderLayoutBlock["accordionStyle"] })} ariaLabel="Accordion style" /></InspectorFieldRow>
      <InspectorFieldRow label="Indicator"><InspectorPillGroup value={block.accordionIndicator ?? "default"} options={options(properties.indicator.values)} onChange={(value) => update({ accordionIndicator: value as BuilderLayoutBlock["accordionIndicator"] })} ariaLabel="Accordion indicator" /></InspectorFieldRow>
      <InspectorFieldRow label="Indicator position"><InspectorPillGroup value={block.accordionIndicatorPosition ?? "end"} options={options(properties.indicatorPosition.values)} onChange={(value) => update({ accordionIndicatorPosition: value as BuilderLayoutBlock["accordionIndicatorPosition"] })} ariaLabel="Accordion indicator position" /></InspectorFieldRow>
      <InspectorFieldRow label="Title emphasis"><InspectorSelect value={block.accordionTitleEmphasis === "bold" ? "emphasis" : block.accordionTitleEmphasis ?? "inherit"} options={options(properties.titleEmphasis.values)} onChange={(value) => update({ accordionTitleEmphasis: value as BuilderLayoutBlock["accordionTitleEmphasis"] })} ariaLabel="Accordion title emphasis" /></InspectorFieldRow>
      <InspectorFieldRow label="Item spacing"><InspectorPillGroup value={block.accordionItemSpacing ?? "inherit"} options={options(properties.itemSpacing.values)} onChange={(value) => update({ accordionItemSpacing: value as BuilderLayoutBlock["accordionItemSpacing"] })} ariaLabel="Accordion item spacing" /></InspectorFieldRow>
      <InspectorFieldRow label="Content spacing"><InspectorPillGroup value={block.accordionContentSpacing ?? "inherit"} options={options(properties.contentSpacing.values)} onChange={(value) => update({ accordionContentSpacing: value as BuilderLayoutBlock["accordionContentSpacing"] })} ariaLabel="Accordion content spacing" /></InspectorFieldRow>
      <InspectorFieldRow label="Show dividers"><InspectorSwitch checked={block.accordionDivider !== false} onChange={(checked) => update({ accordionDivider: checked })} label="Show dividers" /></InspectorFieldRow>
      <InspectorFieldRow label="Title style"><InspectorSelect value={block.accordionTitleStyle ?? "inherit"} options={options(properties.titleStyle.values)} onChange={(value) => update({ accordionTitleStyle: value as BuilderLayoutBlock["accordionTitleStyle"] })} ariaLabel="Accordion title style" /></InspectorFieldRow>
      <InspectorFieldRow label="Content style"><InspectorSelect value={block.accordionContentStyle ?? "inherit"} options={options(properties.contentStyle.values)} onChange={(value) => update({ accordionContentStyle: value as BuilderLayoutBlock["accordionContentStyle"] })} ariaLabel="Accordion content style" /></InspectorFieldRow>
    </div>;
  }

  return <div className="builder-inspector-stack" data-uikit-capability="accordion-advanced"><div className="builder-element-inspector-note"><strong>Accordion advanced settings</strong><span>Visibility and custom class behavior remain in shared Advanced controls.</span></div></div>;
}
