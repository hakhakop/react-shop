"use client";

import { useRef, useState } from "react";
import type { BuilderLayoutBlock, InspectorTab } from "@/components/dashboard/builderTypes";
import type { BuilderShellSettings } from "@/lib/builderShell";
import { UIKIT_ACCORDION_CAPABILITY } from "@/lib/uikitCapabilities";
import { InspectorFieldRow, InspectorPillGroup, InspectorSection, InspectorSelect, InspectorSwitch, InspectorTextField, InspectorTextarea, InspectorSemanticPositionControl } from "@/components/dashboard/inspector/InspectorControls";
import RepeatableItemShell from "@/components/dashboard/inspector/RepeatableItemShell";

type Props = {
  block: BuilderLayoutBlock;
  tab: InspectorTab;
  shellSettings: BuilderShellSettings;
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

export default function AccordionCapabilityPanel({ block, tab, shellSettings, update }: Props) {
  const items = block.accordionItems ?? [];
  const [activeItemTabs, setActiveItemTabs] = useState<Record<string, "content" | "settings">>({});
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
    const openItems = block.accordionOpenItems ?? [];
    const initialOpen = openItems.length === 0 ? "none" : openItems.length === 1 && openItems[0] === 0 ? "first" : "custom";
    return (
      <div className="builder-inspector-stack" data-uikit-capability="accordion-content">
        <InspectorSection title="Items" description={`${items.length} items`}>
          <RepeatableItemShell
            items={items}
            getItemKey={(item) => item.id}
            itemLabel="Item"
            itemDataAttribute="data-accordion-item-id"
            addPosition="before"
            getItemSummary={(item) => item.title || "Untitled item"}
            onAdd={() => {
              const id = `${block.id ?? "accordion"}-item-${Date.now().toString(36)}`;
              updateItems([...items, { id, title: "New item", content: "Add accordion content." }]);
              return id;
            }}
            onCopy={copyItem}
            onDelete={removeItem}
            onReorder={reorderItems}
            renderItem={(item, index) => {
              const activeTab = item.id ? (activeItemTabs[item.id] ?? "content") : "content";
              return (
                <>
                  <InspectorFieldRow>
                    <InspectorPillGroup
                      value={activeTab}
                      options={[
                        { value: "content", label: "Content" },
                        { value: "settings", label: "Settings" },
                      ]}
                      onChange={(value) => {
                        if (item.id) {
                          setActiveItemTabs((prev) => ({
                            ...prev,
                            [item.id]: value as "content" | "settings",
                          }));
                        }
                      }}
                      ariaLabel={`Accordion item ${index + 1} tab`}
                    />
                  </InspectorFieldRow>

                  {activeTab === "content" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "12px" }}>
                      <InspectorFieldRow label="Title">
                        <InspectorTextField
                          value={item.title}
                          onChange={(value) => updateItem(index, { title: value })}
                          ariaLabel={`Accordion item ${index + 1} title`}
                        />
                      </InspectorFieldRow>
                      <InspectorFieldRow label="Content">
                        <InspectorTextarea
                          value={item.content}
                          onChange={(value) => updateItem(index, { content: value })}
                          ariaLabel={`Accordion item ${index + 1} content`}
                        />
                      </InspectorFieldRow>
                    </div>
                  )}

                  {activeTab === "settings" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "12px" }}>
                      <InspectorFieldRow label="Item ID">
                        <InspectorTextField
                          value={item.id}
                          onChange={(value) => updateItem(index, { id: value })}
                          ariaLabel={`Accordion item ${index + 1} ID`}
                        />
                      </InspectorFieldRow>
                    </div>
                  )}
                </>
              );
            }}
          />
        </InspectorSection>

        <InspectorSection title="Behavior" description="Configure accordion interaction behavior.">
          <InspectorFieldRow label="Allow multiple open">
            <InspectorSwitch
              checked={block.accordionMultiple !== false}
              onChange={(checked) => update({ accordionMultiple: checked })}
              label="Allow multiple open"
            />
          </InspectorFieldRow>
          <InspectorFieldRow label="Collapsible">
            <InspectorSwitch
              checked={block.accordionCollapsible !== false}
              onChange={(checked) => update({ accordionCollapsible: checked })}
              label="Collapsible"
            />
          </InspectorFieldRow>
          <InspectorFieldRow label="Initially open">
            <InspectorSelect
              value={initialOpen}
              options={labels(UIKIT_ACCORDION_CAPABILITY.properties.initialOpen.values)}
              onChange={(value) =>
                update({
                  accordionOpenItems:
                    value === "none"
                      ? []
                      : value === "first"
                      ? [0]
                      : openItems.length > 0
                      ? openItems
                      : [0],
                })
              }
              ariaLabel="Initially open"
            />
          </InspectorFieldRow>
          {initialOpen === "custom" && (
            <div className="builder-field">
              <span>Open items</span>
              {items.map((item, index) => (
                <label className="builder-check" key={item.id}>
                  <input
                    type="checkbox"
                    checked={openItems.includes(index)}
                    onChange={(event) => {
                      const next = event.target.checked
                        ? [...new Set([...openItems, index])]
                        : openItems.filter((openIndex) => openIndex !== index);
                      update({
                        accordionOpenItems:
                          block.accordionMultiple === false
                            ? next.length
                              ? [next[next.length - 1]]
                              : []
                            : next,
                      });
                    }}
                  />
                  <span>
                    {index + 1}. {item.title}
                  </span>
                </label>
              ))}
            </div>
          )}
        </InspectorSection>
      </div>
    );
  }

  if (tab === "behavior") {
    const openItems = block.accordionOpenItems ?? [];
    const initialOpen = openItems.length === 0 ? "none" : openItems.length === 1 && openItems[0] === 0 ? "first" : "custom";
    return (
      <div className="builder-inspector-stack" data-uikit-capability="accordion-behavior">
        <InspectorSection title="Behavior">
          <InspectorFieldRow label="Allow multiple open"><InspectorSwitch checked={block.accordionMultiple !== false} onChange={(checked) => update({ accordionMultiple: checked })} label="Allow multiple open" /></InspectorFieldRow>
          <InspectorFieldRow label="Collapsible"><InspectorSwitch checked={block.accordionCollapsible !== false} onChange={(checked) => update({ accordionCollapsible: checked })} label="Collapsible" /></InspectorFieldRow>
          <InspectorFieldRow label="Initially open"><InspectorSelect value={initialOpen} options={labels(UIKIT_ACCORDION_CAPABILITY.properties.initialOpen.values)} onChange={(value) => update({ accordionOpenItems: value === "none" ? [] : value === "first" ? [0] : openItems.length > 0 ? openItems : [0] })} ariaLabel="Initially open" /></InspectorFieldRow>
          {initialOpen === "custom" && <div className="builder-field"><span>Open items</span>{items.map((item, index) => <label className="builder-check" key={item.id}><input type="checkbox" checked={openItems.includes(index)} onChange={(event) => { const next = event.target.checked ? [...new Set([...openItems, index])] : openItems.filter((openIndex) => openIndex !== index); update({ accordionOpenItems: block.accordionMultiple === false ? (next.length ? [next[next.length - 1]] : []) : next }); }} /><span>{index + 1}. {item.title}</span></label>)}</div>}
        </InspectorSection>
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
      <InspectorFieldRow label="Indicator position"><InspectorSemanticPositionControl value={block.accordionIndicatorPosition ?? "end"} onChange={(value) => update({ accordionIndicatorPosition: value as BuilderLayoutBlock["accordionIndicatorPosition"] })} ariaLabel="Accordion indicator position" /></InspectorFieldRow>
      <InspectorFieldRow label="Title emphasis"><InspectorSelect value={block.accordionTitleEmphasis === "bold" ? "emphasis" : block.accordionTitleEmphasis ?? "inherit"} options={options(properties.titleEmphasis.values)} onChange={(value) => update({ accordionTitleEmphasis: value as BuilderLayoutBlock["accordionTitleEmphasis"] })} ariaLabel="Accordion title emphasis" /></InspectorFieldRow>
      <InspectorFieldRow label="Item spacing"><InspectorPillGroup value={block.accordionItemSpacing ?? "inherit"} options={options(properties.itemSpacing.values)} onChange={(value) => update({ accordionItemSpacing: value as BuilderLayoutBlock["accordionItemSpacing"] })} ariaLabel="Accordion item spacing" /></InspectorFieldRow>
      <InspectorFieldRow label="Content spacing"><InspectorPillGroup value={block.accordionContentSpacing ?? "inherit"} options={options(properties.contentSpacing.values)} onChange={(value) => update({ accordionContentSpacing: value as BuilderLayoutBlock["accordionContentSpacing"] })} ariaLabel="Accordion content spacing" /></InspectorFieldRow>
      <InspectorFieldRow label="Show dividers"><InspectorSwitch checked={block.accordionDivider !== false} onChange={(checked) => update({ accordionDivider: checked })} label="Show dividers" /></InspectorFieldRow>
      <InspectorFieldRow label="Title style"><InspectorSelect value={block.accordionTitleStyle ?? "inherit"} options={options(properties.titleStyle.values)} onChange={(value) => update({ accordionTitleStyle: value as BuilderLayoutBlock["accordionTitleStyle"] })} ariaLabel="Accordion title style" /></InspectorFieldRow>
      <InspectorFieldRow label="Content style"><InspectorSelect value={block.accordionContentStyle ?? "inherit"} options={options(properties.contentStyle.values)} onChange={(value) => update({ accordionContentStyle: value as BuilderLayoutBlock["accordionContentStyle"] })} ariaLabel="Accordion content style" /></InspectorFieldRow>
    </div>;
  }

  return null;
}
