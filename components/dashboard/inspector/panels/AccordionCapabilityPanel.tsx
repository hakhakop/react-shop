"use client";

import { useRef, useState } from "react";
import type { BuilderLayoutBlock, InspectorTab } from "@/components/dashboard/builderTypes";
import type { BuilderShellSettings } from "@/lib/builderShell";
import { UIKIT_ACCORDION_CAPABILITY } from "@/lib/uikitCapabilities";
import {
  InspectorDivision,
  InspectorFieldRow,
  InspectorPillGroup,
  InspectorSelect,
  InspectorSwitch,
  InspectorTextField,
  InspectorTextarea,
} from "@/components/dashboard/inspector/InspectorControls";
import RepeatableItemShell from "@/components/dashboard/inspector/RepeatableItemShell";
import RichTextEditor from "@/components/dashboard/RichTextEditor";
import ElementAdvancedPanel from "@/components/dashboard/inspector/panels/ElementAdvancedPanel";
import {
  ActionSettingsGroup,
  CONTENT_STYLE_OPTIONS,
  ContentSettingsGroup,
  ImageSettingsGroup,
  TitleSettingsGroup,
} from "@/components/dashboard/inspector/panels/SharedSettingGroups";

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
                        <RichTextEditor
                          value={item.content}
                          onChange={(value) => updateItem(index, { content: value })}
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
    return <ElementAdvancedPanel block={block} update={update} />;
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
              { value: "striped", label: "Striped" },
              { value: "minimal", label: "Minimal" },
            ]}
            onChange={(v) => update({ accordionStyle: v as any })}
            ariaLabel="Accordion Style"
          />
        </InspectorFieldRow>
        <InspectorFieldRow label="Title emphasis">
          <InspectorSelect
            value={block.accordionTitleEmphasis ?? "inherit"}
            options={labels(UIKIT_ACCORDION_CAPABILITY.properties.titleEmphasis.values)}
            onChange={(value) => update({ accordionTitleEmphasis: value as any })}
            ariaLabel="Accordion title emphasis"
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
        <InspectorFieldRow label="Content spacing">
          <InspectorSelect
            value={block.accordionContentSpacing ?? "inherit"}
            options={labels(UIKIT_ACCORDION_CAPABILITY.properties.contentSpacing.values)}
            onChange={(value) => update({ accordionContentSpacing: value as any })}
            ariaLabel="Accordion content spacing"
          />
        </InspectorFieldRow>
        <InspectorFieldRow label="Dividers">
          <InspectorSwitch
            checked={block.accordionDivider !== false}
            onChange={(checked) => update({ accordionDivider: checked })}
            label="Show dividers"
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

      <TitleSettingsGroup
        block={block}
        update={update}
        showColor
        defaultSize="inherit"
        defaultLevel="h3"
        keys={{ role: "titleTypographyRole", size: "accordionTitleStyle", align: "accordionTitleAlign", level: "accordionTitleLevel", color: "accordionTitleColor" }}
      />

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

      <ContentSettingsGroup
        block={block}
        update={update}
        showRole={false}
        showAlignment={false}
        showStyle
        defaultStyle="inherit"
        styleOptions={[
          { value: "inherit", label: "Inherit" },
          ...CONTENT_STYLE_OPTIONS,
        ]}
        keys={{ role: "contentTypographyRole", align: "accordionContentAlign", style: "accordionContentStyle" }}
      />
      <InspectorDivision title="ACCORDION CONTENT">
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

      <ImageSettingsGroup block={block} update={update} />
      <InspectorDivision title="MEDIA LAYOUT">
        <InspectorFieldRow label="Placement">
          <InspectorSelect
            value={(block as any).accordionMediaPlacement ?? "top"}
            options={[
              { value: "top", label: "Top" },
              { value: "bottom", label: "Bottom" },
              { value: "left", label: "Left" },
              { value: "right", label: "Right" },
            ]}
            onChange={(v) => update({ accordionMediaPlacement: v } as any)}
            ariaLabel="Media placement"
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

      <ActionSettingsGroup
        block={block}
        update={update}
        title="ACTION"
        showVisibilityToggle
        keys={{ visible: "accordionShowLink", label: "accordionLinkText", url: "accordionLinkUrl", target: "accordionLinkTarget", style: "accordionButtonStyle", size: "accordionButtonSize" }}
      />
    </div>
  );
}
