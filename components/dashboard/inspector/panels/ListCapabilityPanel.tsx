"use client";

import { useRef } from "react";
import type { BuilderLayoutBlock, BuilderListItem, InspectorTab } from "@/components/dashboard/builderTypes";
import type { BuilderShellSettings } from "@/lib/builderShell";
import { UIKIT_LIST_CAPABILITY } from "@/lib/uikitCapabilities";
import { BUILDER_LINK_TARGET_OPTIONS } from "@/lib/websiteBuilderLinks";
import {
  InspectorDivision,
  InspectorFieldRow,
  InspectorPillGroup,
  InspectorSelect,
  InspectorTextField,
  InspectorTextarea,
  InspectorAlignmentControl,
} from "@/components/dashboard/inspector/InspectorControls";
import IconPicker from "@/components/dashboard/inspector/IconPicker";
import RepeatableItemShell from "@/components/dashboard/inspector/RepeatableItemShell";
import { ContentSettingsGroup } from "@/components/dashboard/inspector/panels/SharedSettingGroups";
import RichTextEditor from "@/components/dashboard/RichTextEditor";
import ElementAdvancedPanel from "@/components/dashboard/inspector/panels/ElementAdvancedPanel";

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

export default function ListCapabilityPanel({ block, tab, update }: Props) {
  const items = canonicalItems(block);
  const updateItems = (next: BuilderListItem[]) => update({ listItems: next });
  const copySequenceRef = useRef(0);

  const reorderItems = (sourceIndex: number, targetIndex: number) => {
    if (
      sourceIndex < 0 ||
      targetIndex < 0 ||
      sourceIndex === targetIndex ||
      sourceIndex >= items.length ||
      targetIndex >= items.length
    )
      return;
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

  // CONTENT TAB
  if (tab === "content") {
    return (
      <div className="builder-inspector-stack" data-uikit-capability="list-content">
        <InspectorDivision title="ITEMS">
          <InspectorFieldRow label="Title">
            <InspectorTextField
              value={block.title ?? ""}
              onChange={(value) => update({ title: value })}
              ariaLabel="List title"
            />
          </InspectorFieldRow>
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
            renderItem={(item, index) => (
              <>
                <InspectorFieldRow label="Content">
                  <RichTextEditor
                    value={item.text}
                    onChange={(value) =>
                      updateItems(
                        items.map((entry, itemIndex) => (itemIndex === index ? { ...entry, text: value } : entry))
                      )
                    }
                  />
                </InspectorFieldRow>
                <InspectorFieldRow label="Link URL">
                  <InspectorTextField
                    value={item.url ?? ""}
                    onChange={(value) =>
                      updateItems(
                        items.map((entry, itemIndex) =>
                          itemIndex === index ? { ...entry, url: value || undefined } : entry
                        )
                      )
                    }
                    ariaLabel={`List item ${index + 1} URL`}
                  />
                </InspectorFieldRow>
                <InspectorFieldRow label="Link target">
                  <InspectorSelect
                    value={item.target ?? "_self"}
                    options={BUILDER_LINK_TARGET_OPTIONS}
                    onChange={(value) =>
                      updateItems(
                        items.map((entry, itemIndex) => (itemIndex === index ? { ...entry, target: value } : entry))
                      )
                    }
                    ariaLabel={`List item ${index + 1} target`}
                  />
                </InspectorFieldRow>
                <InspectorFieldRow label="Icon">
                  <IconPicker
                    value={item.iconName}
                    onChange={(value) =>
                      updateItems(
                        items.map((entry, itemIndex) => (itemIndex === index ? { ...entry, iconName: value } : entry))
                      )
                    }
                    onClear={() =>
                      updateItems(
                        items.map((entry, itemIndex) =>
                          itemIndex === index ? { ...entry, iconName: undefined } : entry
                        )
                      )
                    }
                    ariaLabel={`List item ${index + 1} icon`}
                  />
                </InspectorFieldRow>
                <InspectorFieldRow label="Icon size">
                  <InspectorSelect
                    value={String(item.iconSize ?? block.listIconSize ?? 16)}
                    options={[12, 14, 16, 20, 24, 28].map((value) => ({ value: String(value), label: `${value}px` }))}
                    onChange={(value) =>
                      updateItems(
                        items.map((entry, itemIndex) =>
                          itemIndex === index ? { ...entry, iconSize: Number(value) } : entry
                        )
                      )
                    }
                    ariaLabel={`List item ${index + 1} icon size`}
                  />
                </InspectorFieldRow>
              </>
            )}
          />
        </InspectorDivision>
      </div>
    );
  }

  // ADVANCED TAB
  if (tab === "advanced") {
    return <ElementAdvancedPanel block={block} update={update} />;
  }

  // SETTINGS TAB (Default)
  const properties = UIKIT_LIST_CAPABILITY.properties;
  return (
    <div className="builder-inspector-stack" data-uikit-capability="list-settings">
      <ContentSettingsGroup
        block={block}
        update={update}
        showAlignment={false}
        showStyle
      />

      <InspectorDivision title="LIST">
        <InspectorFieldRow label="Type"><InspectorSelect value={(block as any).listType ?? "vertical"} options={[{ value: "vertical", label: "Vertical" }, { value: "horizontal", label: "Horizontal" }]} onChange={(value) => update({ listType: value } as any)} ariaLabel="List type" /></InspectorFieldRow>
        <InspectorFieldRow label="Presentation">
          <InspectorSelect
            value={block.listPresentation ?? "default"}
            options={properties.presentation.values.map((value) => ({ value, label: labels[value] }))}
            onChange={(value) => update({ listPresentation: value })}
            ariaLabel="List presentation"
          />
        </InspectorFieldRow>
        <InspectorFieldRow label="Marker">
          <InspectorPillGroup
            value={block.listMarker ?? "none"}
            options={properties.marker.values.map((value) => ({ value, label: labels[value] }))}
            onChange={(value) => update({ listMarker: value })}
            ariaLabel="List marker"
          />
        </InspectorFieldRow>
        <InspectorFieldRow label="Marker Color"><InspectorSelect value={(block as any).listMarkerColor ?? ""} options={[{ value: "", label: "None" }, { value: "muted", label: "Muted" }, { value: "emphasis", label: "Emphasis" }, { value: "primary", label: "Primary" }, { value: "secondary", label: "Secondary" }]} onChange={(value) => update({ listMarkerColor: value || undefined } as any)} ariaLabel="List marker color" /></InspectorFieldRow>
        <InspectorFieldRow label="Alignment">
          <InspectorAlignmentControl
            value={block.listAlign ?? "left"}
            onChange={(value) => update({ listAlign: value })}
            ariaLabel="List alignment"
          />
        </InspectorFieldRow>
        <InspectorFieldRow label="Spacing">
          <InspectorPillGroup
            value={block.listSpacing ?? "default"}
            options={properties.spacing.values.map((value) => ({ value, label: labels[value] }))}
            onChange={(value) => update({ listSpacing: value })}
            ariaLabel="List spacing"
          />
        </InspectorFieldRow>
        {(block as any).listType === "horizontal" ? <InspectorFieldRow label="Separator"><InspectorTextField value={(block as any).listHorizontalSeparator ?? ", "} onChange={(value) => update({ listHorizontalSeparator: value } as any)} ariaLabel="List horizontal separator" /></InspectorFieldRow> : <>
          <InspectorFieldRow label="HTML Element"><InspectorSelect value={(block as any).listElement ?? "ul"} options={[{ value: "ul", label: "ul" }, { value: "ol", label: "ol" }]} onChange={(value) => update({ listElement: value } as any)} ariaLabel="List HTML Element" /></InspectorFieldRow>
          <InspectorFieldRow label="Wrap with nav"><label className="builder-inspector-checkbox-row"><input type="checkbox" checked={(block as any).listWrapNav === true} onChange={(event) => update({ listWrapNav: event.target.checked } as any)} /><span>Wrap with nav element</span></label></InspectorFieldRow>
        </>}
      </InspectorDivision>

      <InspectorDivision title="ICON">
        <InspectorFieldRow label="Show icon"><label className="builder-inspector-checkbox-row"><input type="checkbox" checked={(block as any).listShowImage !== false} onChange={(event) => update({ listShowImage: event.target.checked } as any)} /><span>Show icon</span></label></InspectorFieldRow>
        <InspectorFieldRow label="Default Icon">
          <IconPicker
            value={block.listIcon}
            onChange={(value) => update({ listIcon: value as any })}
            onClear={() => update({ listIcon: undefined })}
            ariaLabel="Default list icon"
          />
        </InspectorFieldRow>
        <InspectorFieldRow label="Icon Size">
          <InspectorSelect
            value={String(block.listIconSize ?? 16)}
            options={[12, 14, 16, 20, 24, 28].map((value) => ({ value: String(value), label: `${value}px` }))}
            onChange={(value) => update({ listIconSize: Number(value) })}
            ariaLabel="List icon size"
          />
        </InspectorFieldRow>
        <InspectorFieldRow label="Color"><InspectorSelect value={(block as any).listIconColor ?? ""} options={[{ value: "", label: "None" }, { value: "muted", label: "Muted" }, { value: "emphasis", label: "Emphasis" }, { value: "primary", label: "Primary" }, { value: "secondary", label: "Secondary" }, { value: "success", label: "Success" }, { value: "warning", label: "Warning" }, { value: "danger", label: "Danger" }]} onChange={(value) => update({ listIconColor: value || undefined } as any)} ariaLabel="List icon color" /></InspectorFieldRow>
      </InspectorDivision>
      <InspectorDivision title="LINK">
        <InspectorFieldRow label="Show link"><label className="builder-inspector-checkbox-row"><input type="checkbox" checked={(block as any).listShowLink !== false} onChange={(event) => update({ listShowLink: event.target.checked } as any)} /><span>Show the link</span></label></InspectorFieldRow>
        <InspectorFieldRow label="Style"><InspectorSelect value={(block as any).listLinkStyle ?? "default"} options={[{ value: "default", label: "None" }, { value: "muted", label: "Muted" }, { value: "text", label: "Text" }, { value: "heading", label: "Heading" }, { value: "reset", label: "Reset" }]} onChange={(value) => update({ listLinkStyle: value } as any)} ariaLabel="List link style" /></InspectorFieldRow>
      </InspectorDivision>
    </div>
  );
}
