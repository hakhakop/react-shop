"use client";

import type { BuilderLayoutBlock, InspectorTab } from "@/components/dashboard/builderTypes";
import { UIKIT_ACCORDION_CAPABILITY } from "@/lib/uikitCapabilities";

type Props = {
  block: BuilderLayoutBlock;
  tab: InspectorTab;
  update: (patch: Partial<BuilderLayoutBlock>) => void;
};

export default function AccordionCapabilityPanel({ block, tab, update }: Props) {
  const items = block.accordionItems ?? [];
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
              <label className="builder-field"><span>Title</span><input value={item.title} onChange={(event) => updateItem(index, { title: event.target.value })} /></label>
              <div className="builder-field"><span>Order</span><div className="builder-two-column"><button type="button" className="builder-secondary-button" disabled={index === 0} onClick={() => moveItem(index, -1)}>Up</button><button type="button" className="builder-secondary-button" disabled={index === items.length - 1} onClick={() => moveItem(index, 1)}>Down</button></div></div>
            </div>
            <label className="builder-field"><span>Content</span><textarea value={item.content} onChange={(event) => updateItem(index, { content: event.target.value })} /></label>
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
        <label className="builder-field"><span>Allow multiple open</span><select value={block.accordionMultiple === false ? "disabled" : "enabled"} onChange={(event) => update({ accordionMultiple: event.target.value === "enabled" })}>{UIKIT_ACCORDION_CAPABILITY.properties.multiple.values.map((value) => <option key={value} value={value}>{value}</option>)}</select></label>
        <label className="builder-field"><span>Collapsible</span><select value={block.accordionCollapsible === false ? "disabled" : "enabled"} onChange={(event) => update({ accordionCollapsible: event.target.value === "enabled" })}>{UIKIT_ACCORDION_CAPABILITY.properties.collapsible.values.map((value) => <option key={value} value={value}>{value}</option>)}</select></label>
        <label className="builder-field"><span>Initially open</span><select value={initialOpen} onChange={(event) => update({ accordionOpenItems: event.target.value === "none" ? [] : event.target.value === "first" ? [0] : openItems.length > 0 ? openItems : [0] })}>{UIKIT_ACCORDION_CAPABILITY.properties.initialOpen.values.map((value) => <option key={value} value={value}>{value}</option>)}</select></label>
        {initialOpen === "custom" && <div className="builder-field"><span>Open items</span>{items.map((item, index) => <label className="builder-check" key={item.id}><input type="checkbox" checked={openItems.includes(index)} onChange={(event) => { const next = event.target.checked ? [...new Set([...openItems, index])] : openItems.filter((openIndex) => openIndex !== index); update({ accordionOpenItems: block.accordionMultiple === false ? (next.length ? [next[next.length - 1]] : []) : next }); }} /><span>{index + 1}. {item.title}</span></label>)}</div>}
      </div>
    );
  }

 if (tab === "style") {
    const properties = UIKIT_ACCORDION_CAPABILITY.properties;
    return <div className="builder-inspector-stack" data-uikit-capability="accordion-style">
      <div className="builder-element-inspector-note"><strong>Accordion presentation</strong><span>Semantic presentation values map to UIkit structure and scoped presentation rules.</span></div>
      <label className="builder-field"><span>Indicator</span><select value={block.accordionIndicator ?? "none"} onChange={(event) => update({ accordionIndicator: event.target.value as BuilderLayoutBlock["accordionIndicator"] })}>{properties.indicator.values.map((value) => <option key={value} value={value}>{value}</option>)}</select></label>
      <label className="builder-field"><span>Indicator position</span><select value={block.accordionIndicatorPosition ?? "end"} onChange={(event) => update({ accordionIndicatorPosition: event.target.value as BuilderLayoutBlock["accordionIndicatorPosition"] })}>{properties.indicatorPosition.values.map((value) => <option key={value} value={value}>{value}</option>)}</select></label>
      <label className="builder-field"><span>Row treatment</span><select value={block.accordionRowStyle ?? "plain"} onChange={(event) => update({ accordionRowStyle: event.target.value as BuilderLayoutBlock["accordionRowStyle"] })}>{properties.rowStyle.values.map((value) => <option key={value} value={value}>{value}</option>)}</select></label>
      <label className="builder-field"><span>Vertical spacing</span><select value={block.accordionSpacing ?? "default"} onChange={(event) => update({ accordionSpacing: event.target.value as BuilderLayoutBlock["accordionSpacing"] })}>{properties.spacing.values.map((value) => <option key={value} value={value}>{value}</option>)}</select></label>
      <label className="builder-field"><span>Title weight</span><select value={block.accordionTitleEmphasis ?? "default"} onChange={(event) => update({ accordionTitleEmphasis: event.target.value as BuilderLayoutBlock["accordionTitleEmphasis"] })}>{properties.titleEmphasis.values.map((value) => <option key={value} value={value}>{value}</option>)}</select></label>
      <label className="builder-field"><span>Open-item treatment</span><select value={block.accordionOpenEmphasis ?? "none"} onChange={(event) => update({ accordionOpenEmphasis: event.target.value as BuilderLayoutBlock["accordionOpenEmphasis"] })}>{properties.openEmphasis.values.map((value) => <option key={value} value={value}>{value}</option>)}</select></label>
    </div>;
  }

  return <div className="builder-inspector-stack" data-uikit-capability="accordion-advanced"><div className="builder-element-inspector-note"><strong>Accordion advanced settings</strong><span>Visibility and custom class behavior remain shared document controls.</span></div></div>;
}
