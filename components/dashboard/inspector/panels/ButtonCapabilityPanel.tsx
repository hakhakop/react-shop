"use client";

import type { InspectorTab, BuilderLayoutBlock } from "@/components/dashboard/builderTypes";
import type { BuilderShellSettings } from "@/lib/builderShell";
import {
  InspectorDivision,
  InspectorAlignmentControl,
  InspectorFieldRow,
  InspectorSelect,
  InspectorSwitch,
  InspectorTextField,
  InspectorTextarea,
} from "@/components/dashboard/inspector/InspectorControls";
import { ActionSettingsGroup } from "@/components/dashboard/inspector/panels/SharedSettingGroups";
import RepeatableItemShell from "@/components/dashboard/inspector/RepeatableItemShell";
import { UIKIT_BUTTON_CAPABILITY } from "@/lib/uikitCapabilities";
import { BUILDER_LINK_TARGET_OPTIONS } from "@/lib/websiteBuilderLinks";

type Props = {
  block: BuilderLayoutBlock;
  tab: InspectorTab;
  shellSettings: BuilderShellSettings;
  update: (patch: Partial<BuilderLayoutBlock>) => void;
};

type ButtonItem = NonNullable<BuilderLayoutBlock["buttons"]>[number];

const buttonStyleLabels: Record<string, string> = {
  default: "Default",
  primary: "Primary",
  secondary: "Secondary",
  danger: "Danger",
  text: "Text",
  link: "Link",
  "link-muted": "Link Muted",
  "link-text": "Link Text",
};

const buttonStyleOptions = UIKIT_BUTTON_CAPABILITY.properties.variant.values.map((value) => ({
  value,
  label: buttonStyleLabels[value] ?? value,
}));

const nativeButtonStyleOptions = buttonStyleOptions.filter(({ value }) =>
  value === "default" || value === "primary" || value === "secondary" || value === "text",
);

function isImportedYoothemeButton(block: BuilderLayoutBlock) {
  return block.spacingContract === "yootheme" || block.id?.startsWith("yootheme-");
}

function ButtonItemsEditor({ block, update }: Pick<Props, "block" | "update">) {
  const items = (block.buttons ?? []) as ButtonItem[];
  const itemStyleOptions = isImportedYoothemeButton(block) ? buttonStyleOptions : nativeButtonStyleOptions;
  const updateItems = (next: ButtonItem[]) => update({ buttons: next } as Partial<BuilderLayoutBlock>);
  const updateItem = (index: number, patch: Partial<ButtonItem>) =>
    updateItems(items.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item));
  const reorder = (sourceIndex: number, targetIndex: number) => {
    if (sourceIndex < 0 || targetIndex < 0 || sourceIndex === targetIndex) return;
    const next = [...items];
    const [moved] = next.splice(sourceIndex, 1);
    next.splice(targetIndex, 0, moved);
    updateItems(next);
  };
  const copy = (index: number) => {
    const source = items[index];
    if (!source) return;
    const id = `${block.id ?? "button"}-item-${Date.now().toString(36)}`;
    const next = [...items];
    next.splice(index + 1, 0, { ...source, id, label: source.label ? `${source.label} Copy` : "Button" });
    updateItems(next);
    return id;
  };

  return (
    <InspectorDivision title="ITEMS">
      <RepeatableItemShell
        items={items}
        getItemKey={(item, index) => item.id ?? `${block.id ?? "button"}-item-${index}`}
        itemLabel="Item"
        itemDataAttribute="data-button-item-id"
        addLabel="Add Item"
        getItemSummary={(item) => item.label || "Untitled item"}
        onAdd={() => {
          const id = `${block.id ?? "button"}-item-${Date.now().toString(36)}`;
          updateItems([...items, { id, label: "Button", url: "#", target: "_self", style: "default" }]);
          return id;
        }}
        onCopy={copy}
        onDelete={(index) => updateItems(items.filter((_, itemIndex) => itemIndex !== index))}
        onReorder={reorder}
        renderItem={(item, index) => <>
          <InspectorFieldRow label="Label">
            <InspectorTextField value={item.label ?? ""} onChange={(label) => updateItem(index, { label })} ariaLabel={`Button item ${index + 1} label`} />
          </InspectorFieldRow>
          <InspectorFieldRow label="Link URL">
            <InspectorTextField value={item.url ?? ""} onChange={(url) => updateItem(index, { url: url || undefined })} ariaLabel={`Button item ${index + 1} URL`} />
          </InspectorFieldRow>
          <InspectorFieldRow label="Link target">
            <InspectorSelect value={item.target ?? "_self"} options={BUILDER_LINK_TARGET_OPTIONS} onChange={(target) => updateItem(index, { target })} ariaLabel={`Button item ${index + 1} target`} />
          </InspectorFieldRow>
          <InspectorFieldRow label="Style">
            <InspectorSelect
              value={item.style ?? "primary"}
              options={itemStyleOptions}
              onChange={(style) => updateItem(index, { style })}
              ariaLabel={`Button item ${index + 1} style`}
            />
          </InspectorFieldRow>
        </>}
      />
    </InspectorDivision>
  );
}

export default function ButtonCapabilityPanel({ block, tab, shellSettings, update }: Props) {
  // CONTENT TAB
  if (tab === "content") {
    const hasCanonicalItems = Array.isArray(block.buttons);
    return (
      <div className="builder-inspector-stack" data-uikit-capability="button-content">
        {hasCanonicalItems ? <ButtonItemsEditor block={block} update={update} /> : <ActionSettingsGroup block={block} update={update} title="BUTTON" showPresentation={false} />}
      </div>
    );
  }

  // ADVANCED TAB
  if (tab === "advanced") {
    return (
      <div className="builder-inspector-stack" data-uikit-capability="button-advanced">
        <InspectorDivision title="ADVANCED">
          <InspectorFieldRow label="ID">
            <InspectorTextField
              value={(block as any).customId ?? block.id ?? ""}
              onChange={(v) => update({ customId: v, id: v } as any)}
              placeholder="e.g. cta-button"
              ariaLabel="Custom ID"
            />
          </InspectorFieldRow>
          <InspectorFieldRow label="Class">
            <InspectorTextField
              value={(block as any).customClass ?? ""}
              onChange={(v) => update({ customClass: v } as any)}
              placeholder="e.g. my-custom-button"
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
  const importedCollectionButton = isImportedYoothemeButton(block) && Array.isArray(block.buttons);

  return (
    <div className="builder-inspector-stack" data-uikit-capability="button-style">
      {importedCollectionButton ? (
        <InspectorDivision title="BUTTON">
          <InspectorFieldRow
            label="Button size"
            isOverridden={(block as any).size !== undefined}
            inheritedValueText="Default"
            onReset={() => update({ size: undefined } as Partial<BuilderLayoutBlock>)}
          >
            <InspectorSelect
              value={String((block as any).size ?? "default")}
              options={[
                { value: "small", label: "Small" },
                { value: "default", label: "Default" },
                { value: "large", label: "Large" },
              ]}
              onChange={(size) => update({ size } as Partial<BuilderLayoutBlock>)}
              ariaLabel="Button size"
            />
          </InspectorFieldRow>
          <InspectorFieldRow
            label="Full width"
            isOverridden={(block as any).fullWidthButton !== undefined}
            inheritedValueText="Off"
            onReset={() => update({ fullWidthButton: undefined } as Partial<BuilderLayoutBlock>)}
          >
            <InspectorSwitch
              checked={Boolean((block as any).fullWidthButton)}
              onChange={(fullWidthButton) => update({ fullWidthButton } as Partial<BuilderLayoutBlock>)}
              label="Full width"
            />
          </InspectorFieldRow>
        </InspectorDivision>
      ) : (
        <ActionSettingsGroup
          block={block}
          update={update}
          title="BUTTON"
          keys={{ style: "buttonStyle", size: "size" }}
          showFullWidth
        />
      )}
      <InspectorDivision title="LAYOUT">
        <InspectorFieldRow label="Alignment">
          <InspectorAlignmentControl
            value={(block as any).buttonAlign ?? block.textAlign ?? "left"}
            onChange={(value) => update({ buttonAlign: value, textAlign: value } as any)}
            ariaLabel="Button alignment"
          />
        </InspectorFieldRow>
      </InspectorDivision>
    </div>
  );
}
