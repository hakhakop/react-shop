"use client";

import { useRef, useState } from "react";
import type {
  BuilderLayoutBlock,
  InspectorTab,
  WordPressMediaItem,
} from "@/components/dashboard/builderTypes";
import type { BuilderShellSettings } from "@/lib/builderShell";
import { UIKIT_BUTTON_CAPABILITY } from "@/lib/uikitCapabilities";
import { BUILDER_LINK_TARGET_OPTIONS } from "@/lib/websiteBuilderLinks";
import IconPicker from "@/components/dashboard/inspector/IconPicker";
import RepeatableItemShell from "@/components/dashboard/inspector/RepeatableItemShell";
import { BuilderImageUrlControl } from "@/components/dashboard/inspector/panels/InspectorSharedControls";
import { ImageSettingsGroup } from "@/components/dashboard/inspector/panels/SharedSettingGroups";
import {
  InspectorFieldRow,
  InspectorPillGroup,
  InspectorSection,
  InspectorSelect,
  InspectorSwitch,
  InspectorTextField,
  InspectorTextarea,
  InspectorDivision,
  InspectorAlignmentControl,
  InspectorSegmentedControl,
} from "@/components/dashboard/inspector/InspectorControls";

type Props = {
  block: BuilderLayoutBlock;
  tab: InspectorTab;
  shellSettings: BuilderShellSettings;
  update: (patch: any) => void;
  openWordPressMediaPicker?: (options: {
    title: string;
    currentUrl?: string;
    onSelect: (media: WordPressMediaItem) => void;
  }) => void;
};

const opts = <T extends string>(values: readonly T[]) =>
  values.map((value) => ({
    value,
    label: value.replace(/[-_]/g, " ").replace(/\b\w/g, (m) => m.toUpperCase()),
  }));

const breakpointOptions = [
  { value: "always", label: "Always" },
  { value: "s", label: "Small (Phone Landscape)" },
  { value: "m", label: "Medium (Tablet Landscape)" },
  { value: "l", label: "Large (Desktop)" },
  { value: "xl", label: "X-Large (Large Screens)" },
];

const gapOptions = [
  { value: "default", label: "Default" },
  { value: "small", label: "Small" },
  { value: "medium", label: "Medium" },
  { value: "large", label: "Large" },
  { value: "collapse", label: "Collapse" },
];

const colorOptions = [
  { value: "none", label: "None" },
  { value: "muted", label: "Muted" },
  { value: "emphasis", label: "Emphasis" },
  { value: "primary", label: "Primary" },
  { value: "secondary", label: "Secondary" },
  { value: "success", label: "Success" },
  { value: "warning", label: "Warning" },
  { value: "danger", label: "Danger" },
];

const fontFamilyOptions = [
  { value: "none", label: "None" },
  { value: "default", label: "Default" },
  { value: "primary", label: "Primary" },
  { value: "secondary", label: "Secondary" },
  { value: "tertiary", label: "Tertiary" },
];

type GridItem = NonNullable<BuilderLayoutBlock["gridItems"]>[number];

export default function GridCapabilityPanel({
  block,
  tab,
  shellSettings,
  update,
  openWordPressMediaPicker,
}: Props) {
  const items = block.gridItems ?? [];
  const [activeItemTabs, setActiveItemTabs] = useState<Record<string, "content" | "settings">>({});
  const copySequenceRef = useRef(0);
  const updateItems = (next: GridItem[]) => update({ gridItems: next });
  
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

  const removeItem = (index: number) =>
    updateItems(items.filter((_, itemIndex) => itemIndex !== index));

  const copyItem = (index: number) => {
    const source = items[index];
    if (!source) return;
    let id = "";
    do {
      copySequenceRef.current += 1;
      id = `grid-item-copy-${copySequenceRef.current}`;
    } while (items.some((item) => item.id === id));
    const copy = {
      ...source,
      id,
      title: source.title ? `${source.title} Copy` : "Copy of item",
    };
    const next = [...items];
    next.splice(index + 1, 0, copy);
    updateItems(next);
    return id;
  };

  if (tab === "content") {
    return (
      <div className="builder-inspector-stack" data-uikit-capability="grid-content">
        {/* ITEMS SECTION */}
        <InspectorDivision title="ITEMS">
          <RepeatableItemShell
            items={items}
            getItemKey={(item, index) => item.id ?? index}
            itemLabel="Item"
            itemDataAttribute="data-grid-item-id"
            addPosition="before"
            getItemSummary={(item) => item.title || "Untitled item"}
            onAdd={() => {
              const id = `grid-item-${Date.now().toString(36)}`;
              updateItems([
                ...items,
                {
                  id,
                  title: `Item ${items.length + 1}`,
                  text: "Grid item content.",
                  buttonLabel: "Read more",
                  buttonUrl: "/",
                },
              ]);
              return id;
            }}
            onCopy={copyItem}
            onDelete={removeItem}
            onReorder={reorderItems}
            renderItem={(item, index) => {
              const activeTab = item.id ? (activeItemTabs[item.id] ?? "content") : "content";
              return (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "8px" }}>
                  <InspectorPillGroup
                    value={activeTab}
                    options={opts(["content", "settings"] as const)}
                    onChange={(value) => {
                      if (item.id) {
                        setActiveItemTabs((prev) => ({
                          ...prev,
                          [item.id as string]: value as "content" | "settings",
                        }));
                      }
                    }}
                    ariaLabel={`Grid item ${index + 1} tab`}
                  />

                  {activeTab === "content" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "8px" }}>
                      <InspectorFieldRow label="Title">
                        <InspectorTextField
                          value={item.title ?? ""}
                          onChange={(value) =>
                            updateItems(
                              items.map((entry, i) => (i === index ? { ...entry, title: value } : entry))
                            )
                          }
                          ariaLabel={`Item ${index + 1} title`}
                        />
                      </InspectorFieldRow>
                      <InspectorFieldRow label="Meta">
                        <InspectorTextField
                          value={item.meta ?? ""}
                          onChange={(value) =>
                            updateItems(
                              items.map((entry, i) => (i === index ? { ...entry, meta: value } : entry))
                            )
                          }
                          ariaLabel={`Item ${index + 1} meta`}
                        />
                      </InspectorFieldRow>
                      <InspectorFieldRow label="Content">
                        <InspectorTextarea
                          value={item.text ?? ""}
                          onChange={(value) =>
                            updateItems(
                              items.map((entry, i) => (i === index ? { ...entry, text: value } : entry))
                            )
                          }
                          ariaLabel={`Item ${index + 1} content`}
                        />
                      </InspectorFieldRow>
                      <InspectorFieldRow label="Image">
                        <BuilderImageUrlControl
                          value={item.imageUrl ?? ""}
                          onChange={(e) =>
                            updateItems(
                              items.map((entry, i) => (i === index ? { ...entry, imageUrl: e.target.value } : entry))
                            )
                          }
                          onChoose={() =>
                            openWordPressMediaPicker?.({
                              title: `Item ${index + 1} Image`,
                              currentUrl: item.imageUrl,
                              onSelect: (m) =>
                                updateItems(
                                  items.map((entry, i) =>
                                    i === index ? { ...entry, imageUrl: m.sourceUrl, imageAlt: m.altText || m.title || "" } : entry
                                  )
                                ),
                            })
                          }
                        />
                      </InspectorFieldRow>
                      <InspectorFieldRow label="Link">
                        <InspectorTextField
                          value={item.buttonUrl ?? ""}
                          onChange={(value) =>
                            updateItems(
                              items.map((entry, i) => (i === index ? { ...entry, buttonUrl: value } : entry))
                            )
                          }
                          ariaLabel={`Item ${index + 1} link`}
                          placeholder="http://"
                        />
                      </InspectorFieldRow>
                    </div>
                  )}

                  {activeTab === "settings" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "8px" }}>
                      <InspectorFieldRow label="Link Target">
                        <InspectorSelect
                          value={item.buttonTarget ?? "_self"}
                          options={BUILDER_LINK_TARGET_OPTIONS}
                          onChange={(value) =>
                            updateItems(
                              items.map((entry, i) => (i === index ? { ...entry, buttonTarget: value } : entry))
                            )
                          }
                          ariaLabel={`Item ${index + 1} target`}
                        />
                      </InspectorFieldRow>
                      <InspectorFieldRow label="Link Text">
                        <InspectorTextField
                          value={item.buttonLabel ?? ""}
                          onChange={(value) =>
                            updateItems(
                              items.map((entry, i) => (i === index ? { ...entry, buttonLabel: value } : entry))
                            )
                          }
                          ariaLabel={`Item ${index + 1} link text`}
                        />
                      </InspectorFieldRow>
                    </div>
                  )}
                </div>
              );
            }}
          />
        </InspectorDivision>

        {/* DISPLAY SECTION */}
        <InspectorDivision title="DISPLAY">
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <label className="builder-inspector-checkbox-row">
              <input
                type="checkbox"
                checked={(block as any).gridShowTitle !== false}
                onChange={(e) => update({ gridShowTitle: e.target.checked })}
              />
              <span>Show the title</span>
            </label>
            <label className="builder-inspector-checkbox-row">
              <input
                type="checkbox"
                checked={block.gridShowMeta !== false}
                onChange={(e) => update({ gridShowMeta: e.target.checked })}
              />
              <span>Show the meta text</span>
            </label>
            <label className="builder-inspector-checkbox-row">
              <input
                type="checkbox"
                checked={block.gridShowText !== false}
                onChange={(e) => update({ gridShowText: e.target.checked })}
              />
              <span>Show the content</span>
            </label>
            <label className="builder-inspector-checkbox-row">
              <input
                type="checkbox"
                checked={block.gridShowImage !== false}
                onChange={(e) => update({ gridShowImage: e.target.checked })}
              />
              <span>Show the image</span>
            </label>
            <label className="builder-inspector-checkbox-row">
              <input
                type="checkbox"
                checked={Boolean((block as any).gridShowVideo)}
                onChange={(e) => update({ gridShowVideo: e.target.checked } as any)}
              />
              <span>Show the video</span>
            </label>
            <label className="builder-inspector-checkbox-row">
              <input
                type="checkbox"
                checked={block.gridShowButton !== false}
                onChange={(e) => update({ gridShowButton: e.target.checked })}
              />
              <span>Show the link</span>
            </label>
            <label className="builder-inspector-checkbox-row">
              <input
                type="checkbox"
                checked={Boolean((block as any).gridShowHoverImage)}
                onChange={(e) => update({ gridShowHoverImage: e.target.checked } as any)}
              />
              <span>Show the hover image</span>
            </label>
            <label className="builder-inspector-checkbox-row">
              <input
                type="checkbox"
                checked={Boolean((block as any).gridShowHoverVideo)}
                onChange={(e) => update({ gridShowHoverVideo: e.target.checked } as any)}
              />
              <span>Show the hover video</span>
            </label>
            <small style={{ color: "var(--builder-ui-muted)", fontSize: "11px", marginTop: "4px" }}>
              Show or hide content fields without the need to delete the content itself.
            </small>
          </div>
        </InspectorDivision>
      </div>
    );
  }

  if (tab === "style") {
    return (
      <div className="builder-inspector-stack" data-uikit-capability="grid-settings">
        {/* GRID SECTION */}
        <InspectorDivision title="GRID">
          <InspectorFieldRow
            label="Masonry"
            isOverridden={(block as any).masonry !== undefined && (block as any).masonry !== "none"}
            inheritedValueText="None"
            onReset={() => update({ masonry: undefined } as any)}
          >
            <InspectorSelect
              value={(block as any).masonry ?? "none"}
              options={[
                { value: "none", label: "None" },
                { value: "pack", label: "Pack" },
                { value: "next", label: "Next" },
              ]}
              onChange={(value) => update({ masonry: value } as any)}
              ariaLabel="Masonry"
            />
          </InspectorFieldRow>

          <InspectorFieldRow
            label="Parallax"
            isOverridden={(block as any).parallax !== undefined && (block as any).parallax !== 0}
            inheritedValueText="0"
            onReset={() => update({ parallax: undefined } as any)}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px", width: "100%" }}>
              <input
                type="range"
                min={-200}
                max={200}
                value={Number((block as any).parallax ?? 0)}
                onChange={(e) => update({ parallax: Number(e.target.value) } as any)}
                style={{ flex: 1 }}
              />
              <input
                type="number"
                value={Number((block as any).parallax ?? 0)}
                onChange={(e) => update({ parallax: Number(e.target.value) } as any)}
                style={{ width: "50px", padding: "4px", fontSize: "11px", borderRadius: "4px", border: "1px solid var(--builder-ui-border)" }}
              />
            </div>
          </InspectorFieldRow>

          <InspectorFieldRow
            label="Justify columns"
            isOverridden={Boolean((block as any).justifyColumns)}
            inheritedValueText="Off"
            onReset={() => update({ justifyColumns: false } as any)}
          >
            <label className="builder-inspector-checkbox-row">
              <input
                type="checkbox"
                checked={Boolean((block as any).justifyColumns)}
                onChange={(e) => update({ justifyColumns: e.target.checked } as any)}
              />
              <span>Justify columns at the bottom</span>
            </label>
          </InspectorFieldRow>

          <InspectorFieldRow
            label="Column Gap"
            isOverridden={block.gridGap !== undefined && block.gridGap !== "large"}
            inheritedValueText="Large"
            onReset={() => update({ gridGap: undefined })}
          >
            <InspectorSelect
              value={block.gridGap ?? "large"}
              options={gapOptions}
              onChange={(value) => update({ gridGap: value })}
              ariaLabel="Column Gap"
            />
          </InspectorFieldRow>

          <InspectorFieldRow
            label="Row Gap"
            isOverridden={block.gridRowGap !== undefined && (block.gridRowGap as any) !== "default"}
            inheritedValueText="Default"
            onReset={() => update({ gridRowGap: undefined })}
          >
            <InspectorSelect
              value={block.gridRowGap ?? "default"}
              options={gapOptions}
              onChange={(value) => update({ gridRowGap: value })}
              ariaLabel="Row Gap"
            />
          </InspectorFieldRow>

          <InspectorFieldRow
            label="Divider"
            isOverridden={Boolean((block as any).showDividers)}
            inheritedValueText="Off"
            onReset={() => update({ showDividers: false } as any)}
          >
            <label className="builder-inspector-checkbox-row">
              <input
                type="checkbox"
                checked={Boolean((block as any).showDividers)}
                onChange={(e) => update({ showDividers: e.target.checked } as any)}
              />
              <span>Show dividers</span>
            </label>
          </InspectorFieldRow>

          <InspectorFieldRow
            label="Alignment"
            isOverridden={Boolean((block as any).centerColumns) || Boolean((block as any).centerRows)}
            inheritedValueText="Off"
            onReset={() => update({ centerColumns: false, centerRows: false } as any)}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label className="builder-inspector-checkbox-row">
                <input
                  type="checkbox"
                  checked={Boolean((block as any).centerColumns)}
                  onChange={(e) => update({ centerColumns: e.target.checked } as any)}
                />
                <span>Center columns</span>
              </label>
              <label className="builder-inspector-checkbox-row">
                <input
                  type="checkbox"
                  checked={Boolean((block as any).centerRows)}
                  onChange={(e) => update({ centerRows: e.target.checked } as any)}
                />
                <span>Center rows</span>
              </label>
            </div>
          </InspectorFieldRow>
        </InspectorDivision>

        {/* COLUMNS SECTION */}
        <InspectorDivision title="COLUMNS">
          <InspectorFieldRow
            label="Phone Portrait"
            isOverridden={(block as any).columnsPhonePortrait !== undefined && (block as any).columnsPhonePortrait !== "auto"}
            inheritedValueText="Auto"
            onReset={() => update({ columnsPhonePortrait: undefined } as any)}
          >
            <InspectorSelect
              value={String((block as any).columnsPhonePortrait ?? "auto")}
              options={[
                { value: "auto", label: "Auto" },
                { value: "1", label: "1 Column" },
                { value: "2", label: "2 Columns" },
              ]}
              onChange={(v) => update({ columnsPhonePortrait: v } as any)}
              ariaLabel="Phone Portrait Columns"
            />
          </InspectorFieldRow>
          <InspectorFieldRow
            label="Phone Landscape"
            isOverridden={(block as any).columnsPhoneLandscape !== undefined && (block as any).columnsPhoneLandscape !== "inherit"}
            inheritedValueText="Inherit"
            onReset={() => update({ columnsPhoneLandscape: undefined } as any)}
          >
            <InspectorSelect
              value={String((block as any).columnsPhoneLandscape ?? "inherit")}
              options={[
                { value: "inherit", label: "Inherit" },
                { value: "auto", label: "Auto" },
                { value: "1", label: "1 Column" },
                { value: "2", label: "2 Columns" },
                { value: "3", label: "3 Columns" },
              ]}
              onChange={(v) => update({ columnsPhoneLandscape: v } as any)}
              ariaLabel="Phone Landscape Columns"
            />
          </InspectorFieldRow>
          <InspectorFieldRow
            label="Tablet Landscape"
            isOverridden={block.columns !== undefined}
            inheritedValueText="Inherit"
            onReset={() => update({ columns: undefined })}
          >
            <InspectorSelect
              value={String(block.columns ?? "inherit")}
              options={[
                { value: "inherit", label: "Inherit" },
                { value: "auto", label: "Auto" },
                { value: "1", label: "1 Column" },
                { value: "2", label: "2 Columns" },
                { value: "3", label: "3 Columns" },
                { value: "4", label: "4 Columns" },
                { value: "5", label: "5 Columns" },
                { value: "6", label: "6 Columns" },
              ]}
              onChange={(v) => update({ columns: v === "inherit" ? undefined : Number(v) })}
              ariaLabel="Tablet Landscape Columns"
            />
          </InspectorFieldRow>
          <InspectorFieldRow
            label="Desktop"
            isOverridden={(block as any).columnsDesktop !== undefined && (block as any).columnsDesktop !== "inherit"}
            inheritedValueText="Inherit"
            onReset={() => update({ columnsDesktop: undefined } as any)}
          >
            <InspectorSelect
              value={String((block as any).columnsDesktop ?? "inherit")}
              options={[
                { value: "inherit", label: "Inherit" },
                { value: "auto", label: "Auto" },
                { value: "1", label: "1 Column" },
                { value: "2", label: "2 Columns" },
                { value: "3", label: "3 Columns" },
                { value: "4", label: "4 Columns" },
                { value: "5", label: "5 Columns" },
                { value: "6", label: "6 Columns" },
              ]}
              onChange={(v) => update({ columnsDesktop: v } as any)}
              ariaLabel="Desktop Columns"
            />
          </InspectorFieldRow>
          <InspectorFieldRow
            label="Large Screens"
            isOverridden={(block as any).columnsLargeScreens !== undefined && (block as any).columnsLargeScreens !== "inherit"}
            inheritedValueText="Inherit"
            onReset={() => update({ columnsLargeScreens: undefined } as any)}
          >
            <InspectorSelect
              value={String((block as any).columnsLargeScreens ?? "inherit")}
              options={[
                { value: "inherit", label: "Inherit" },
                { value: "auto", label: "Auto" },
                { value: "1", label: "1 Column" },
                { value: "2", label: "2 Columns" },
                { value: "3", label: "3 Columns" },
                { value: "4", label: "4 Columns" },
                { value: "5", label: "5 Columns" },
                { value: "6", label: "6 Columns" },
              ]}
              onChange={(v) => update({ columnsLargeScreens: v } as any)}
              ariaLabel="Large Screens Columns"
            />
          </InspectorFieldRow>
        </InspectorDivision>

        {/* FILTER SECTION */}
        <InspectorDivision title="FILTER">
          <InspectorFieldRow
            label="Filter"
            isOverridden={Boolean((block as any).enableFilterNav)}
            inheritedValueText="Off"
            onReset={() => update({ enableFilterNav: false } as any)}
          >
            <label className="builder-inspector-checkbox-row">
              <input
                type="checkbox"
                checked={Boolean((block as any).enableFilterNav)}
                onChange={(e) => update({ enableFilterNav: e.target.checked } as any)}
              />
              <span>Enable filter navigation</span>
            </label>
          </InspectorFieldRow>
          <InspectorFieldRow
            label="Animation"
            isOverridden={(block as any).filterAnimation !== undefined && (block as any).filterAnimation !== "slide"}
            inheritedValueText="Slide"
            onReset={() => update({ filterAnimation: undefined } as any)}
          >
            <InspectorSelect
              value={(block as any).filterAnimation ?? "slide"}
              options={[
                { value: "slide", label: "Slide" },
                { value: "fade", label: "Fade" },
                { value: "none", label: "None" },
              ]}
              onChange={(v) => update({ filterAnimation: v } as any)}
              ariaLabel="Filter Animation"
            />
          </InspectorFieldRow>
          <InspectorFieldRow
            label="Style"
            isOverridden={(block as any).filterStyle !== undefined && (block as any).filterStyle !== "tabs"}
            inheritedValueText="Tabs"
            onReset={() => update({ filterStyle: undefined } as any)}
          >
            <InspectorSelect
              value={(block as any).filterStyle ?? "tabs"}
              options={[
                { value: "tabs", label: "Tabs" },
                { value: "subnav", label: "Subnav" },
                { value: "pills", label: "Pills" },
              ]}
              onChange={(v) => update({ filterStyle: v } as any)}
              ariaLabel="Filter Style"
            />
          </InspectorFieldRow>
        </InspectorDivision>

        {/* PANEL SECTION */}
        <InspectorDivision title="PANEL">
          <InspectorFieldRow
            label="Style"
            isOverridden={block.panelVariant !== undefined && (block.panelVariant as any) !== "none"}
            inheritedValueText="None"
            onReset={() => update({ panelVariant: undefined, panelStyle: undefined })}
          >
            <InspectorSelect
              value={block.panelVariant ?? (block as any).panelStyle ?? "none"}
              options={[
                { value: "none", label: "None" },
                { value: "card-default", label: "Card Default" },
                { value: "card-primary", label: "Card Primary" },
                { value: "card-secondary", label: "Card Secondary" },
                { value: "card-hover", label: "Card Hover" },
                { value: "tile-default", label: "Tile Default" },
                { value: "tile-primary", label: "Tile Primary" },
                { value: "tile-secondary", label: "Tile Secondary" },
              ]}
              onChange={(v) => update({ panelVariant: v, panelStyle: v })}
              ariaLabel="Panel Style"
            />
          </InspectorFieldRow>
          <InspectorFieldRow
            label="Link"
            isOverridden={Boolean((block as any).linkPanel) || Boolean((block as any).addHoverStyle)}
            inheritedValueText="Off"
            onReset={() => update({ linkPanel: false, addHoverStyle: false } as any)}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label className="builder-inspector-checkbox-row">
                <input
                  type="checkbox"
                  checked={Boolean((block as any).linkPanel)}
                  onChange={(e) => update({ linkPanel: e.target.checked } as any)}
                />
                <span>Link panel</span>
              </label>
              <label className="builder-inspector-checkbox-row">
                <input
                  type="checkbox"
                  checked={Boolean((block as any).addHoverStyle)}
                  onChange={(e) => update({ addHoverStyle: e.target.checked } as any)}
                />
                <span>Add hover style</span>
              </label>
            </div>
          </InspectorFieldRow>
          <InspectorFieldRow
            label="Padding"
            isOverridden={block.panelSize !== undefined && (block.panelSize as any) !== "none"}
            inheritedValueText="None"
            onReset={() => update({ panelSize: undefined, panelPadding: undefined } as any)}
          >
            <InspectorSelect
              value={block.panelSize ?? (block as any).panelPadding ?? "none"}
              options={[
                { value: "none", label: "None" },
                { value: "small", label: "Small" },
                { value: "default", label: "Default" },
                { value: "large", label: "Large" },
              ]}
              onChange={(v) => update({ panelSize: v, panelPadding: v } as any)}
              ariaLabel="Panel Padding"
            />
          </InspectorFieldRow>
          <InspectorFieldRow
            label="Image"
            isOverridden={Boolean((block as any).alignImageWithoutPadding)}
            inheritedValueText="Off"
            onReset={() => update({ alignImageWithoutPadding: false } as any)}
          >
            <label className="builder-inspector-checkbox-row">
              <input
                type="checkbox"
                checked={Boolean((block as any).alignImageWithoutPadding)}
                onChange={(e) => update({ alignImageWithoutPadding: e.target.checked } as any)}
              />
              <span>Align image without padding</span>
            </label>
          </InspectorFieldRow>
          <InspectorFieldRow
            label="Max Width"
            isOverridden={(block as any).panelMaxWidth !== undefined && (block as any).panelMaxWidth !== "none"}
            inheritedValueText="None"
            onReset={() => update({ panelMaxWidth: undefined } as any)}
          >
            <InspectorSelect
              value={(block as any).panelMaxWidth ?? "none"}
              options={[
                { value: "none", label: "None" },
                { value: "small", label: "Small" },
                { value: "medium", label: "Medium" },
                { value: "large", label: "Large" },
                { value: "xlarge", label: "X-Large" },
                { value: "2xlarge", label: "2X-Large" },
              ]}
              onChange={(v) => update({ panelMaxWidth: v } as any)}
              ariaLabel="Panel Max Width"
            />
          </InspectorFieldRow>
        </InspectorDivision>

        {/* TITLE SECTION */}
        <InspectorDivision title="TITLE">
          <InspectorFieldRow
            label="Style"
            isOverridden={(block as any).gridTitleSize !== undefined && (block as any).gridTitleSize !== "none"}
            inheritedValueText="None"
            onReset={() => update({ gridTitleSize: undefined })}
          >
            <InspectorSelect
              value={(block as any).gridTitleSize ?? "none"}
              options={[
                { value: "none", label: "None" },
                { value: "h1", label: "Heading 1" },
                { value: "h2", label: "Heading 2" },
                { value: "h3", label: "Heading 3" },
                { value: "h4", label: "Heading 4" },
                { value: "small", label: "Heading Small" },
                { value: "medium", label: "Heading Medium" },
                { value: "large", label: "Heading Large" },
              ]}
              onChange={(v) => update({ gridTitleSize: v })}
              ariaLabel="Title Style"
            />
          </InspectorFieldRow>
          <InspectorFieldRow
            label="Decoration"
            isOverridden={(block as any).titleDecoration !== undefined && (block as any).titleDecoration !== "none"}
            inheritedValueText="None"
            onReset={() => update({ titleDecoration: undefined } as any)}
          >
            <InspectorSelect
              value={(block as any).titleDecoration ?? "none"}
              options={[
                { value: "none", label: "None" },
                { value: "divider", label: "Divider" },
                { value: "bullet", label: "Bullet" },
                { value: "line", label: "Line" },
              ]}
              onChange={(v) => update({ titleDecoration: v } as any)}
              ariaLabel="Title Decoration"
            />
          </InspectorFieldRow>
          <InspectorFieldRow
            label="Font Family"
            isOverridden={block.titleTypographyRole !== undefined && (block.titleTypographyRole as any) !== "none"}
            inheritedValueText="None"
            onReset={() => update({ titleTypographyRole: undefined })}
          >
            <InspectorSelect
              value={block.titleTypographyRole ?? "none"}
              options={fontFamilyOptions}
              onChange={(v) => update({ titleTypographyRole: v as any })}
              ariaLabel="Title Font Family"
            />
          </InspectorFieldRow>
          <InspectorFieldRow
            label="Color"
            isOverridden={(block as any).titleColor !== undefined && (block as any).titleColor !== "none"}
            inheritedValueText="None"
            onReset={() => update({ titleColor: undefined } as any)}
          >
            <InspectorSelect
              value={(block as any).titleColor ?? "none"}
              options={colorOptions}
              onChange={(v) => update({ titleColor: v } as any)}
              ariaLabel="Title Color"
            />
          </InspectorFieldRow>
          <InspectorFieldRow
            label="HTML Element"
            isOverridden={(block as any).gridTitleLevel !== undefined && (block as any).gridTitleLevel !== "h3"}
            inheritedValueText="h3"
            onReset={() => update({ gridTitleLevel: undefined })}
          >
            <InspectorSelect
              value={(block as any).gridTitleLevel ?? "h3"}
              options={[
                { value: "h1", label: "h1" },
                { value: "h2", label: "h2" },
                { value: "h3", label: "h3" },
                { value: "h4", label: "h4" },
                { value: "h5", label: "h5" },
                { value: "h6", label: "h6" },
                { value: "div", label: "div" },
              ]}
              onChange={(v) => update({ gridTitleLevel: v })}
              ariaLabel="Title HTML Element"
            />
          </InspectorFieldRow>
        </InspectorDivision>

        {/* META SECTION */}
        <InspectorDivision title="META">
          <InspectorFieldRow
            label="Style"
            isOverridden={(block as any).metaStyle !== undefined && (block as any).metaStyle !== "text-meta"}
            inheritedValueText="Text Meta"
            onReset={() => update({ metaStyle: undefined } as any)}
          >
            <InspectorSelect
              value={(block as any).metaStyle ?? "text-meta"}
              options={[
                { value: "text-meta", label: "Text Meta" },
                { value: "text-lead", label: "Text Lead" },
                { value: "heading-small", label: "Heading Small" },
              ]}
              onChange={(v) => update({ metaStyle: v } as any)}
              ariaLabel="Meta Style"
            />
          </InspectorFieldRow>
          <InspectorFieldRow
            label="Color"
            isOverridden={(block as any).metaColor !== undefined && (block as any).metaColor !== "none"}
            inheritedValueText="None"
            onReset={() => update({ metaColor: undefined } as any)}
          >
            <InspectorSelect
              value={(block as any).metaColor ?? "none"}
              options={colorOptions}
              onChange={(v) => update({ metaColor: v } as any)}
              ariaLabel="Meta Color"
            />
          </InspectorFieldRow>
          <InspectorFieldRow
            label="Position"
            isOverridden={(block as any).gridMetaAlign !== undefined && (block as any).gridMetaAlign !== "below"}
            inheritedValueText="Below Title"
            onReset={() => update({ gridMetaAlign: undefined } as any)}
          >
            <InspectorSelect
              value={(block as any).gridMetaAlign ?? "below"}
              options={[
                { value: "below", label: "Below Title" },
                { value: "above", label: "Above Title" },
                { value: "content", label: "Below Content" },
              ]}
              onChange={(v) => update({ gridMetaAlign: v as any })}
              ariaLabel="Meta Position"
            />
          </InspectorFieldRow>
          <InspectorFieldRow
            label="HTML Element"
            isOverridden={(block as any).gridMetaHtmlElement !== undefined && (block as any).gridMetaHtmlElement !== "div"}
            inheritedValueText="div"
            onReset={() => update({ gridMetaHtmlElement: undefined })}
          >
            <InspectorSelect
              value={(block as any).gridMetaHtmlElement ?? "div"}
              options={[
                { value: "div", label: "div" },
                { value: "span", label: "span" },
                { value: "p", label: "p" },
              ]}
              onChange={(v) => update({ gridMetaHtmlElement: v })}
              ariaLabel="Meta HTML Element"
            />
          </InspectorFieldRow>
        </InspectorDivision>

        {/* CONTENT SECTION */}
        <InspectorDivision title="CONTENT">
          <InspectorFieldRow
            label="Style"
            isOverridden={(block as any).contentStyle !== undefined && (block as any).contentStyle !== "none"}
            inheritedValueText="None"
            onReset={() => update({ contentStyle: undefined } as any)}
          >
            <InspectorSelect
              value={(block as any).contentStyle ?? "none"}
              options={[
                { value: "none", label: "None" },
                { value: "text-lead", label: "Text Lead" },
                { value: "text-meta", label: "Text Meta" },
                { value: "text-small", label: "Text Small" },
                { value: "text-large", label: "Text Large" },
              ]}
              onChange={(v) => update({ contentStyle: v } as any)}
              ariaLabel="Content Style"
            />
          </InspectorFieldRow>
          <InspectorFieldRow
            label="Columns"
            isOverridden={(block as any).contentColumns !== undefined && (block as any).contentColumns !== "none"}
            inheritedValueText="None"
            onReset={() => update({ contentColumns: undefined } as any)}
          >
            <InspectorSelect
              value={String((block as any).contentColumns ?? "none")}
              options={[
                { value: "none", label: "None" },
                { value: "1-2", label: "1-2 Columns" },
                { value: "1-3", label: "1-3 Columns" },
                { value: "1-4", label: "1-4 Columns" },
              ]}
              onChange={(v) => update({ contentColumns: v } as any)}
              ariaLabel="Content Columns"
            />
          </InspectorFieldRow>
        </InspectorDivision>

        {/* IMAGE SECTION */}
        <ImageSettingsGroup block={block} update={update} />

        {/* LINK SECTION */}
        <InspectorDivision title="LINK">
          <InspectorFieldRow
            label="Target"
            isOverridden={(block as any).buttonTarget === "_blank"}
            inheritedValueText="Same window"
            onReset={() => update({ buttonTarget: "_self" })}
          >
            <label className="builder-inspector-checkbox-row">
              <input
                type="checkbox"
                checked={(block as any).buttonTarget === "_blank"}
                onChange={(e) => update({ buttonTarget: e.target.checked ? "_blank" : "_self" })}
              />
              <span>Open in a new window</span>
            </label>
          </InspectorFieldRow>
          <InspectorFieldRow
            label="Text"
            isOverridden={block.buttonLabel !== undefined && block.buttonLabel !== "Read more"}
            inheritedValueText="Read more"
            onReset={() => update({ buttonLabel: undefined })}
          >
            <InspectorTextField
              value={block.buttonLabel ?? "Read more"}
              onChange={(v) => update({ buttonLabel: v })}
              ariaLabel="Link Text"
            />
          </InspectorFieldRow>
          <InspectorFieldRow
            label="Style"
            isOverridden={block.buttonStyle !== undefined && block.buttonStyle !== "primary"}
            inheritedValueText="Primary"
            onReset={() => update({ buttonStyle: undefined })}
          >
            <InspectorSelect
              value={block.buttonStyle ?? "primary"}
              options={[
                { value: "default", label: "Button Default" },
                { value: "primary", label: "Button Primary" },
                { value: "secondary", label: "Button Secondary" },
                { value: "danger", label: "Button Danger" },
                { value: "link", label: "Link" },
                { value: "text", label: "Link Text" },
              ]}
              onChange={(v) => update({ buttonStyle: v })}
              ariaLabel="Link Style"
            />
          </InspectorFieldRow>
          <InspectorFieldRow
            label="Button Size"
            isOverridden={block.size !== undefined && block.size !== "default"}
            inheritedValueText="Default"
            onReset={() => update({ size: undefined })}
          >
            <InspectorSelect
              value={block.size ?? "default"}
              options={[
                { value: "default", label: "Default" },
                { value: "small", label: "Small" },
                { value: "large", label: "Large" },
              ]}
              onChange={(v) => update({ size: v })}
              ariaLabel="Button Size"
            />
          </InspectorFieldRow>
          <InspectorFieldRow
            label="Full width"
            isOverridden={Boolean((block as any).fullWidthButton)}
            inheritedValueText="Off"
            onReset={() => update({ fullWidthButton: false } as any)}
          >
            <label className="builder-inspector-checkbox-row">
              <input
                type="checkbox"
                checked={Boolean((block as any).fullWidthButton)}
                onChange={(e) => update({ fullWidthButton: e.target.checked } as any)}
              />
              <span>Full width button</span>
            </label>
          </InspectorFieldRow>
        </InspectorDivision>
      </div>
    );
  }

  // ADVANCED TAB
  return (
    <div className="builder-inspector-stack" data-uikit-capability="grid-advanced">
      <InspectorDivision title="GENERAL">
        <InspectorFieldRow label="ID">
          <InspectorTextField
            value={(block as any).anchorId ?? ""}
            onChange={(v) => update({ anchorId: v } as any)}
            placeholder="element-id"
            ariaLabel="Element ID"
          />
        </InspectorFieldRow>
        <InspectorFieldRow label="Class">
          <InspectorTextField
            value={(block as any).cssClass ?? ""}
            onChange={(v) => update({ cssClass: v } as any)}
            placeholder="custom-class"
            ariaLabel="Element Class"
          />
        </InspectorFieldRow>
        <InspectorFieldRow label="Attributes">
          <InspectorTextarea
            value={(block as any).cssAttributes ?? ""}
            onChange={(v) => update({ cssAttributes: v } as any)}
            placeholder='data-custom="value"'
            ariaLabel="Element Attributes"
          />
        </InspectorFieldRow>
        <InspectorFieldRow label="CSS">
          <InspectorTextarea
            value={(block as any).customCss ?? ""}
            onChange={(v) => update({ customCss: v } as any)}
            placeholder="el { color: red; }"
            ariaLabel="Custom CSS"
          />
        </InspectorFieldRow>
      </InspectorDivision>
    </div>
  );
}
