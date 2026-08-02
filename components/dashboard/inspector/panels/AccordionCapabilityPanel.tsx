"use client";

import type { BuilderLayoutBlock, InspectorTab } from "@/components/dashboard/builderTypes";
import { UIKIT_ACCORDION_CAPABILITY } from "@/lib/uikitCapabilities";
import { InspectorFieldRow, InspectorPillGroup, InspectorSelect, InspectorSwitch, InspectorTextField, InspectorTextarea } from "@/components/dashboard/inspector/InspectorControls";

type Props = {
  block: BuilderLayoutBlock;
  tab: InspectorTab;
  update: (patch: Partial<BuilderLayoutBlock>) => void;
};

export default function AccordionCapabilityPanel({ block, tab, update }: Props) {
  const items = block.accordionItems ?? [];
  const labels = <T extends string>(values: readonly T[]) => values.map((value) => ({ value, label: value.replace(/-/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase()) }));
  const updateItems = (next: typeof items) => update({ accordionItems: next });
  const updateItem = (index: number, patch: Partial<(typeof items)[number]>) =>
    updateItems(items.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item));
  const moveItem = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    const [item] = next.splice(index, 1);
    next.splice(target, 0, item);
    updateItems(next);
  };

  if (tab === "content") {
    return (
      <div className="builder-inspector-stack" data-uikit-capability="accordion-content">
        <div className="builder-element-inspector-note"><strong>Accordion items</strong><span>WebPages owns titles, content, ordering, and JSON persistence.</span></div>
        {items.map((item, index) => (
          <details className="builder-collapse" open key={item.id}>
            <summary><span>Item {index + 1}</span><small>{item.title || "Untitled"}</small></summary>
            <div className="builder-two-column">
              <InspectorFieldRow label="Title"><InspectorTextField value={item.title} onChange={(value) => updateItem(index, { title: value })} ariaLabel={`Accordion item ${index + 1} title`} /></InspectorFieldRow>
              <div className="builder-field"><span>Order</span><div className="builder-two-column"><button type="button" className="builder-secondary-button" disabled={index === 0} onClick={() => moveItem(index, -1)}>Up</button><button type="button" className="builder-secondary-button" disabled={index === items.length - 1} onClick={() => moveItem(index, 1)}>Down</button></div></div>
            </div>
            <InspectorFieldRow label="Content"><InspectorTextarea value={item.content} onChange={(value) => updateItem(index, { content: value })} ariaLabel={`Accordion item ${index + 1} content`} /></InspectorFieldRow>
            <button type="button" className="builder-secondary-button" onClick={() => { const next = items.filter((_, itemIndex) => itemIndex !== index); update({ accordionItems: next, accordionOpenItems: (block.accordionOpenItems ?? []).filter((openIndex) => openIndex !== index).map((openIndex) => openIndex > index ? openIndex - 1 : openIndex) }); }}>Remove item</button>
          </details>
        ))}
        <button type="button" className="builder-inline-add" onClick={() => updateItems([...items, { id: `${block.id ?? "accordion"}-item-${Date.now().toString(36)}`, title: "New item", content: "Add accordion content." }])}>Add item</button>
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
    return <div className="builder-inspector-stack" data-uikit-capability="accordion-style">
      <div className="builder-element-inspector-note"><strong>Accordion presentation</strong><span>Semantic presentation values map to UIkit structure and scoped presentation rules.</span></div>
      <InspectorFieldRow label="Indicator"><InspectorPillGroup value={(block.accordionIndicator ?? "none") as BuilderLayoutBlock["accordionIndicator"]} options={labels(properties.indicator.values)} onChange={(value) => update({ accordionIndicator: value })} ariaLabel="Accordion indicator" /></InspectorFieldRow>
      <InspectorFieldRow label="Indicator position"><InspectorPillGroup value={(block.accordionIndicatorPosition ?? "end") as BuilderLayoutBlock["accordionIndicatorPosition"]} options={labels(properties.indicatorPosition.values)} onChange={(value) => update({ accordionIndicatorPosition: value })} ariaLabel="Indicator position" /></InspectorFieldRow>
      <InspectorFieldRow label="Row treatment"><InspectorPillGroup value={(block.accordionRowStyle ?? "plain") as BuilderLayoutBlock["accordionRowStyle"]} options={labels(properties.rowStyle.values)} onChange={(value) => update({ accordionRowStyle: value })} ariaLabel="Accordion row treatment" /></InspectorFieldRow>
      <InspectorFieldRow label="Vertical spacing"><InspectorPillGroup value={(block.accordionSpacing ?? "default") as BuilderLayoutBlock["accordionSpacing"]} options={labels(properties.spacing.values)} onChange={(value) => update({ accordionSpacing: value })} ariaLabel="Accordion vertical spacing" /></InspectorFieldRow>
      <InspectorFieldRow label="Title weight"><InspectorSelect value={(block.accordionTitleEmphasis ?? "default") as BuilderLayoutBlock["accordionTitleEmphasis"]} options={labels(properties.titleEmphasis.values)} onChange={(value) => update({ accordionTitleEmphasis: value })} ariaLabel="Accordion title weight" /></InspectorFieldRow>
      <InspectorFieldRow label="Open-item treatment"><InspectorSelect value={(block.accordionOpenEmphasis ?? "none") as BuilderLayoutBlock["accordionOpenEmphasis"]} options={labels(properties.openEmphasis.values)} onChange={(value) => update({ accordionOpenEmphasis: value })} ariaLabel="Open-item treatment" /></InspectorFieldRow>
    </div>;
  }

  return <div className="builder-inspector-stack" data-uikit-capability="accordion-advanced"><div className="builder-element-inspector-note"><strong>Accordion advanced settings</strong><span>Visibility and custom class behavior remain shared document controls.</span></div></div>;
}
