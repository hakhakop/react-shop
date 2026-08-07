"use client";

import { useRef, useState } from "react";
import type { BuilderLayoutBlock, InspectorTab } from "@/components/dashboard/builderTypes";
import type { BuilderShellSettings } from "@/lib/builderShell";
import { UIKIT_ACCORDION_CAPABILITY } from "@/lib/uikitCapabilities";
import {
  InspectorDivision,
  InspectorFieldRow,
  InspectorPillGroup,
  InspectorSection,
  InspectorSelect,
  InspectorSwitch,
  InspectorTextField,
  InspectorTextarea,
  InspectorSemanticPositionControl,
} from "@/components/dashboard/inspector/InspectorControls";
import RepeatableItemShell from "@/components/dashboard/inspector/RepeatableItemShell";

type Props = {
  block: BuilderLayoutBlock;
  tab: InspectorTab;
  shellSettings: BuilderShellSettings;
  update: (patch: Partial<BuilderLayoutBlock>) => void;
};

type AccordionItem = NonNullable<BuilderLayoutBlock["accordionItems"]>[number] & {
  imageUrl?: string;
  imageAlt?: string;
  buttonUrl?: string;
  buttonLabel?: string;
  buttonTarget?: string;
  customId?: string;
  customClass?: string;
};

function remapOpenIndexes(openIndexes: number[], sourceIndex: number, targetIndex: number) {
  return [
    ...new Set(
      openIndexes.map((openIndex) => {
        if (openIndex === sourceIndex) return targetIndex;
        if (sourceIndex < targetIndex && openIndex > sourceIndex && openIndex <= targetIndex) return openIndex - 1;
        if (sourceIndex > targetIndex && openIndex >= targetIndex && openIndex < sourceIndex) return openIndex + 1;
        return openIndex;
      })
    ),
  ].sort((a, b) => a - b);
}

export default function AccordionCapabilityPanel({ block, tab, shellSettings, update }: Props) {
  const items = (block.accordionItems ?? []) as AccordionItem[];
  const [activeItemTabs, setActiveItemTabs] = useState<Record<string, "content" | "media" | "link" | "settings">>({});
  const labels = <T extends string>(values: readonly T[]) =>
    values.map((value) => ({
      value,
      label: value.replace(/-/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase()),
    }));
  const copySequenceRef = useRef(0);

  const fontFamilyOptions = [
    { value: "inherit", label: "Inherit" },
    { value: "default", label: "Default" },
    { value: "primary", label: "Primary" },
    { value: "secondary", label: "Secondary" },
    { value: "tertiary", label: "Tertiary" },
  ];

  const colorOptions = [
    { value: "none", label: "None" },
    { value: "muted", label: "Muted" },
    { value: "emphasis", label: "Emphasis" },
    { value: "primary", label: "Primary" },
    { value: "secondary", label: "Secondary" },
  ];

  const updateItems = (next: AccordionItem[]) => update({ accordionItems: next });
  const updateItem = (index: number, patch: Partial<AccordionItem>) =>
    updateItems(items.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)));

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
      .map((openIndex) => (openIndex > index ? openIndex - 1 : openIndex));
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
    const nextOpenItems = (block.accordionOpenItems ?? []).map((openIndex) =>
      openIndex > index ? openIndex + 1 : openIndex
    );
    update({ accordionItems: next, accordionOpenItems: nextOpenItems });
    return id;
  };

  const openItems = block.accordionOpenItems ?? [];
  const initialOpen =
    openItems.length === 0 ? "none" : openItems.length === 1 && openItems[0] === 0 ? "first" : "custom";

  // CONTENT TAB
  if (tab === "content") {
    return (
      <div className="builder-inspector-stack" data-uikit-capability="accordion-content">
        <InspectorDivision title="ITEMS">
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
                        { value: "media", label: "Media" },
                        { value: "link", label: "Link" },
                        { value: "settings", label: "Settings" },
                      ]}
                      onChange={(value) => {
                        if (item.id) {
                          setActiveItemTabs((prev) => ({
                            ...prev,
                            [item.id]: value as any,
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

                  {activeTab === "media" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "12px" }}>
                      <InspectorFieldRow label="Image URL">
                        <InspectorTextField
                          value={item.imageUrl ?? ""}
                          onChange={(value) => updateItem(index, { imageUrl: value })}
                          placeholder="https://..."
                          ariaLabel={`Accordion item ${index + 1} Image URL`}
                        />
                      </InspectorFieldRow>
                      <InspectorFieldRow label="Image Alt">
                        <InspectorTextField
                          value={item.imageAlt ?? ""}
                          onChange={(value) => updateItem(index, { imageAlt: value })}
                          placeholder="Alt description"
                          ariaLabel={`Accordion item ${index + 1} Alt`}
                        />
                      </InspectorFieldRow>
                    </div>
                  )}

                  {activeTab === "link" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "12px" }}>
                      <InspectorFieldRow label="Link URL">
                        <InspectorTextField
                          value={item.buttonUrl ?? ""}
                          onChange={(value) => updateItem(index, { buttonUrl: value })}
                          placeholder="https://..."
                          ariaLabel={`Accordion item ${index + 1} Link URL`}
                        />
                      </InspectorFieldRow>
                      <InspectorFieldRow label="Link Text">
                        <InspectorTextField
                          value={item.buttonLabel ?? ""}
                          onChange={(value) => updateItem(index, { buttonLabel: value })}
                          placeholder="Learn more"
                          ariaLabel={`Accordion item ${index + 1} Link Text`}
                        />
                      </InspectorFieldRow>
                      <InspectorFieldRow label="Target">
                        <label className="builder-inspector-checkbox-row">
                          <input
                            type="checkbox"
                            checked={item.buttonTarget === "_blank"}
                            onChange={(e) => updateItem(index, { buttonTarget: e.target.checked ? "_blank" : "_self" })}
                          />
                          <span>Open in new tab</span>
                        </label>
                      </InspectorFieldRow>
                    </div>
                  )}

                  {activeTab === "settings" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "12px" }}>
                      <InspectorFieldRow label="ID">
                        <InspectorTextField
                          value={item.customId ?? item.id}
                          onChange={(value) => updateItem(index, { customId: value, id: value })}
                          ariaLabel={`Accordion item ${index + 1} ID`}
                        />
                      </InspectorFieldRow>
                      <InspectorFieldRow label="Class">
                        <InspectorTextField
                          value={item.customClass ?? ""}
                          onChange={(value) => updateItem(index, { customClass: value })}
                          ariaLabel={`Accordion item ${index + 1} Class`}
                        />
                      </InspectorFieldRow>
                    </div>
                  )}
                </>
              );
            }}
          />
        </InspectorDivision>

        <InspectorDivision title="DISPLAY">
          <InspectorFieldRow>
            <label className="builder-inspector-checkbox-row">
              <input
                type="checkbox"
                checked={(block as any).accordionShowTitle !== false}
                onChange={(e) => update({ accordionShowTitle: e.target.checked } as any)}
              />
              <span>Show the title</span>
            </label>
          </InspectorFieldRow>
          <InspectorFieldRow>
            <label className="builder-inspector-checkbox-row">
              <input
                type="checkbox"
                checked={(block as any).accordionShowContent !== false}
                onChange={(e) => update({ accordionShowContent: e.target.checked } as any)}
              />
              <span>Show the content</span>
            </label>
          </InspectorFieldRow>
          <InspectorFieldRow>
            <label className="builder-inspector-checkbox-row">
              <input
                type="checkbox"
                checked={(block as any).accordionShowImage !== false}
                onChange={(e) => update({ accordionShowImage: e.target.checked } as any)}
              />
              <span>Show the image</span>
            </label>
          </InspectorFieldRow>
          <InspectorFieldRow>
            <label className="builder-inspector-checkbox-row">
              <input
                type="checkbox"
                checked={(block as any).accordionShowLink !== false}
                onChange={(e) => update({ accordionShowLink: e.target.checked } as any)}
              />
              <span>Show the link</span>
            </label>
          </InspectorFieldRow>
        </InspectorDivision>
      </div>
    );
  }

  // ADVANCED TAB
  if (tab === "advanced") {
    return (
      <div className="builder-inspector-stack" data-uikit-capability="accordion-advanced">
        <InspectorDivision title="ADVANCED">
          <InspectorFieldRow label="ID">
            <InspectorTextField
              value={(block as any).customId ?? block.id ?? ""}
              onChange={(v) => update({ customId: v, id: v } as any)}
              placeholder="e.g. faq-accordion"
              ariaLabel="Custom ID"
            />
          </InspectorFieldRow>
          <InspectorFieldRow label="Class">
            <InspectorTextField
              value={(block as any).customClass ?? ""}
              onChange={(v) => update({ customClass: v } as any)}
              placeholder="e.g. my-custom-accordion"
              ariaLabel="Custom Class"
            />
          </InspectorFieldRow>
          <InspectorFieldRow label="Attributes">
            <InspectorTextField
              value={(block as any).customAttributes ?? ""}
              onChange={(v) => update({ customAttributes: v } as any)}
              placeholder='data-custom="value"'
              ariaLabel="Custom Attributes"
            />
          </InspectorFieldRow>
          <InspectorFieldRow label="Custom CSS">
            <InspectorTextarea
              value={(block as any).customCss ?? ""}
              onChange={(v) => update({ customCss: v } as any)}
              placeholder="/* CSS rules */"
              ariaLabel="Custom CSS"
            />
          </InspectorFieldRow>
        </InspectorDivision>
      </div>
    );
  }

  // SETTINGS TAB (Default)
  return (
    <div className="builder-inspector-stack" data-uikit-capability="accordion-settings">
      {/* ACCORDION SECTION */}
      <InspectorDivision title="ACCORDION">
        <InspectorFieldRow label="Style">
          <InspectorSelect
            value={block.accordionStyle ?? "default"}
            options={[
              { value: "default", label: "Default" },
              { value: "divided", label: "Divided" },
            ]}
            onChange={(v) => update({ accordionStyle: v as any })}
            ariaLabel="Accordion Style"
          />
        </InspectorFieldRow>
        <InspectorFieldRow label="Item Margin">
          <InspectorSelect
            value={block.accordionItemSpacing ?? "default"}
            options={[
              { value: "none", label: "None" },
              { value: "small", label: "Small" },
              { value: "default", label: "Default" },
              { value: "large", label: "Large" },
            ]}
            onChange={(v) => update({ accordionItemSpacing: v as any })}
            ariaLabel="Item Margin"
          />
        </InspectorFieldRow>
        <InspectorFieldRow>
          <label className="builder-inspector-checkbox-row">
            <input
              type="checkbox"
              checked={block.accordionMultiple !== false}
              onChange={(e) => update({ accordionMultiple: e.target.checked })}
            />
            <span>Allow multiple open items</span>
          </label>
        </InspectorFieldRow>
        <InspectorFieldRow>
          <label className="builder-inspector-checkbox-row">
            <input
              type="checkbox"
              checked={block.accordionCollapsible !== false}
              onChange={(e) => update({ accordionCollapsible: e.target.checked })}
            />
            <span>Allow all items to be closed</span>
          </label>
        </InspectorFieldRow>
        <InspectorFieldRow label="Initially open">
          <InspectorSelect
            value={initialOpen}
            options={[
              { value: "none", label: "None" },
              { value: "first", label: "First Item" },
              { value: "custom", label: "Custom" },
            ]}
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
          <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginLeft: "12px" }}>
            {items.map((item, index) => (
              <label className="builder-inspector-checkbox-row" key={item.id}>
                <input
                  type="checkbox"
                  checked={openItems.includes(index)}
                  onChange={(event) => {
                    const next = event.target.checked
                      ? [...new Set([...openItems, index])]
                      : openItems.filter((openIndex) => openIndex !== index);
                    update({
                      accordionOpenItems:
                        block.accordionMultiple === false ? (next.length ? [next[next.length - 1]] : []) : next,
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
      </InspectorDivision>

      {/* TITLE SECTION */}
      <InspectorDivision title="TITLE">
        <InspectorFieldRow label="Style">
          <InspectorSelect
            value={(block as any).accordionTitleSize ?? (block as any).accordionTitleStyle ?? "none"}
            options={[
              { value: "none", label: "None" },
              { value: "h1", label: "Heading 1" },
              { value: "h2", label: "Heading 2" },
              { value: "h3", label: "Heading 3" },
              { value: "h4", label: "Heading 4" },
              { value: "small", label: "Heading Small" },
              { value: "medium", label: "Heading Medium" },
              { value: "large", label: "Heading Large" },
              { value: "xlarge", label: "Heading X-Large" },
              { value: "2xlarge", label: "Heading 2X-Large" },
            ]}
            onChange={(v) => update({ accordionTitleSize: v, accordionTitleStyle: v } as any)}
            ariaLabel="Title Style"
          />
        </InspectorFieldRow>
        <InspectorFieldRow label="Font Family">
          <InspectorSelect
            value={block.titleTypographyRole ?? (block as any).accordionTitleFontFamily ?? "inherit"}
            options={fontFamilyOptions}
            onChange={(v) => update({ titleTypographyRole: v as any, accordionTitleFontFamily: v } as any)}
            ariaLabel="Title Font Family"
          />
        </InspectorFieldRow>
        <InspectorFieldRow label="Color">
          <InspectorSelect
            value={(block as any).accordionTitleColor ?? "none"}
            options={colorOptions}
            onChange={(v) => update({ accordionTitleColor: v } as any)}
            ariaLabel="Title Color"
          />
        </InspectorFieldRow>
        <InspectorFieldRow label="HTML Element">
          <InspectorSelect
            value={(block as any).accordionTitleLevel ?? "h3"}
            options={[
              { value: "h1", label: "h1" },
              { value: "h2", label: "h2" },
              { value: "h3", label: "h3" },
              { value: "h4", label: "h4" },
              { value: "h5", label: "h5" },
              { value: "h6", label: "h6" },
              { value: "div", label: "div" },
            ]}
            onChange={(v) => update({ accordionTitleLevel: v } as any)}
            ariaLabel="Title HTML Element"
          />
        </InspectorFieldRow>
        <InspectorFieldRow label="Align">
          <InspectorSelect
            value={(block as any).accordionTitleAlign ?? "left"}
            options={[
              { value: "left", label: "Left" },
              { value: "center", label: "Center" },
              { value: "right", label: "Right" },
            ]}
            onChange={(v) => update({ accordionTitleAlign: v } as any)}
            ariaLabel="Title Align"
          />
        </InspectorFieldRow>
      </InspectorDivision>

      {/* INDICATOR SECTION */}
      <InspectorDivision title="INDICATOR">
        <InspectorFieldRow label="Style">
          <InspectorSelect
            value={block.accordionIndicator ?? "default"}
            options={[
              { value: "default", label: "Chevron" },
              { value: "plus-minus", label: "Plus / Minus" },
              { value: "none", label: "None" },
            ]}
            onChange={(v) => update({ accordionIndicator: v as any })}
            ariaLabel="Indicator Style"
          />
        </InspectorFieldRow>
        <InspectorFieldRow label="Position">
          <InspectorSelect
            value={block.accordionIndicatorPosition ?? "end"}
            options={[
              { value: "start", label: "Left" },
              { value: "end", label: "Right" },
            ]}
            onChange={(v) => update({ accordionIndicatorPosition: v as any })}
            ariaLabel="Indicator Position"
          />
        </InspectorFieldRow>
      </InspectorDivision>

      {/* CONTENT SECTION */}
      <InspectorDivision title="CONTENT">
        <InspectorFieldRow label="Style">
          <InspectorSelect
            value={block.accordionContentStyle ?? "none"}
            options={[
              { value: "none", label: "None" },
              { value: "text-lead", label: "Text Lead" },
              { value: "text-meta", label: "Text Meta" },
              { value: "text-small", label: "Text Small" },
              { value: "text-large", label: "Text Large" },
            ]}
            onChange={(v) => update({ accordionContentStyle: v as any })}
            ariaLabel="Content Style"
          />
        </InspectorFieldRow>
        <InspectorFieldRow label="Margin Top">
          <InspectorSelect
            value={(block as any).accordionContentMarginTop ?? "default"}
            options={[
              { value: "default", label: "Default" },
              { value: "small", label: "Small" },
              { value: "medium", label: "Medium" },
              { value: "large", label: "Large" },
            ]}
            onChange={(v) => update({ accordionContentMarginTop: v } as any)}
            ariaLabel="Content Margin Top"
          />
        </InspectorFieldRow>
      </InspectorDivision>

      {/* IMAGE / MEDIA SECTION */}
      <InspectorDivision title="IMAGE">
        <InspectorFieldRow label="Width/Height">
          <div style={{ display: "flex", gap: "8px", width: "100%" }}>
            <InspectorTextField
              value={(block as any).imageWidth ?? "auto"}
              onChange={(v) => update({ imageWidth: v } as any)}
              placeholder="auto"
              ariaLabel="Image Width"
            />
            <InspectorTextField
              value={(block as any).imageHeight ?? "auto"}
              onChange={(v) => update({ imageHeight: v } as any)}
              placeholder="auto"
              ariaLabel="Image Height"
            />
          </div>
        </InspectorFieldRow>
        <InspectorFieldRow label="Alignment">
          <InspectorSelect
            value={(block as any).accordionMediaPlacement ?? "top"}
            options={[
              { value: "top", label: "Top" },
              { value: "bottom", label: "Bottom" },
              { value: "left", label: "Left" },
              { value: "right", label: "Right" },
            ]}
            onChange={(v) => update({ accordionMediaPlacement: v } as any)}
            ariaLabel="Media Alignment"
          />
        </InspectorFieldRow>
        <InspectorFieldRow label="Grid Width">
          <InspectorSelect
            value={(block as any).accordionMediaWidth ?? "auto"}
            options={[
              { value: "auto", label: "Auto" },
              { value: "1-2", label: "50%" },
              { value: "1-3", label: "33%" },
              { value: "1-4", label: "25%" },
            ]}
            onChange={(v) => update({ accordionMediaWidth: v } as any)}
            ariaLabel="Media Grid Width"
          />
        </InspectorFieldRow>
        <InspectorFieldRow label="Margin Top">
          <InspectorSelect
            value={(block as any).imageMarginTop ?? "default"}
            options={[
              { value: "default", label: "Default" },
              { value: "small", label: "Small" },
              { value: "medium", label: "Medium" },
              { value: "large", label: "Large" },
            ]}
            onChange={(v) => update({ imageMarginTop: v } as any)}
            ariaLabel="Image Margin Top"
          />
        </InspectorFieldRow>
      </InspectorDivision>

      {/* LINK SECTION */}
      <InspectorDivision title="LINK">
        <InspectorFieldRow label="Target">
          <label className="builder-inspector-checkbox-row">
            <input
              type="checkbox"
              checked={(block as any).accordionLinkTarget === "_blank"}
              onChange={(e) => update({ accordionLinkTarget: e.target.checked ? "_blank" : "_self" } as any)}
            />
            <span>Open in new tab</span>
          </label>
        </InspectorFieldRow>
        <InspectorFieldRow label="Text">
          <InspectorTextField
            value={(block as any).accordionLinkText ?? "Read more"}
            onChange={(v) => update({ accordionLinkText: v } as any)}
            placeholder="Read more"
            ariaLabel="Link Text"
          />
        </InspectorFieldRow>
        <InspectorFieldRow label="Style">
          <InspectorSelect
            value={(block as any).accordionButtonStyle ?? "primary"}
            options={[
              { value: "default", label: "Button Default" },
              { value: "primary", label: "Button Primary" },
              { value: "secondary", label: "Button Secondary" },
              { value: "danger", label: "Button Danger" },
              { value: "link", label: "Link" },
              { value: "text", label: "Text" },
            ]}
            onChange={(v) => update({ accordionButtonStyle: v } as any)}
            ariaLabel="Button Style"
          />
        </InspectorFieldRow>
        <InspectorFieldRow label="Size">
          <InspectorSelect
            value={(block as any).accordionButtonSize ?? "default"}
            options={[
              { value: "default", label: "Default" },
              { value: "small", label: "Small" },
              { value: "large", label: "Large" },
            ]}
            onChange={(v) => update({ accordionButtonSize: v } as any)}
            ariaLabel="Button Size"
          />
        </InspectorFieldRow>
      </InspectorDivision>
    </div>
  );
}
