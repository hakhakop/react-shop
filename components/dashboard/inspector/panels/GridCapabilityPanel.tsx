"use client";

import { useRef, useState } from "react";
import type {
  BuilderLayoutBlock,
  InspectorTab,
  WordPressMediaItem,
} from "@/components/dashboard/builderTypes";
import type { DynamicFieldBinding } from "@/lib/dynamicContent";
import type { DynamicBindingDestination } from "@/lib/dynamicContentCapabilities";
import type { BuilderShellSettings } from "@/lib/builderShell";
import { BUILDER_LINK_TARGET_OPTIONS } from "@/lib/websiteBuilderLinks";
import IconPicker from "@/components/dashboard/inspector/IconPicker";
import RichTextEditor from "@/components/dashboard/RichTextEditor";
import RepeatableItemShell from "@/components/dashboard/inspector/RepeatableItemShell";
import { BuilderImageUrlControl } from "@/components/dashboard/inspector/panels/InspectorSharedControls";
import {
  ActionSettingsGroup,
  CardSettingsGroup,
  MetaSettingsGroup,
  TitleSettingsGroup,
  CONTENT_STYLE_OPTIONS,
} from "@/components/dashboard/inspector/panels/SharedSettingGroups";
import {
  InspectorFieldRow,
  InspectorPillGroup,
  InspectorSection,
  InspectorSelect,
  InspectorSwitch,
  InspectorTextField,
  InspectorTextarea,
  InspectorDivision,
} from "@/components/dashboard/inspector/InspectorControls";
import { sanitizeHtml } from "@/lib/safeHtml";
import { UIKIT_YOOTHEME_SVG_COLOR_OPTIONS } from "@/lib/uikitTokens";
import DynamicContentInspectorGroup from "@/components/dashboard/inspector/panels/DynamicContentInspectorGroup";
import UikitGridStructureSettingsGroup from "@/components/dashboard/inspector/panels/UikitGridStructureSettingsGroup";

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
  { value: "small", label: "Small" },
  { value: "medium", label: "Medium" },
  { value: "default", label: "Default" },
  { value: "large", label: "Large" },
  { value: "none", label: "None" },
];

type GridItem = NonNullable<BuilderLayoutBlock["gridItems"]>[number];

/**
 * Grid's parent Image settings. This is intentionally one canonical Image
 * division in Grid Settings, matching YOOtheme's control order. Grid-only
 * layout fields live here because they describe the image track, not the
 * repeatable item content or a separate invented composition panel.
 */
function GridImageSettingsGroup({ block, update }: Pick<Props, "block" | "update">) {
  const values = block as any;
  const select = (key: string, fallback: string, options: ReadonlyArray<{ value: string; label: string }>, label: string) => (
    <InspectorSelect
      value={String(values[key] ?? fallback)}
      options={options}
      onChange={(value) => update({ [key]: value })}
      ariaLabel={label}
    />
  );
  const shapeOptions = [{ value: "none", label: "None" }, { value: "rounded", label: "Rounded" }, { value: "circle", label: "Circle" }, { value: "pill", label: "Pill" }];
  const shadowOptions = [{ value: "none", label: "None" }, { value: "small", label: "Small" }, { value: "medium", label: "Medium" }, { value: "large", label: "Large" }, { value: "xlarge", label: "X-Large" }];
  const widthOptions = [{ value: "auto", label: "Auto" }, { value: "1-1", label: "Expand" }, { value: "4-5", label: "80%" }, { value: "3-4", label: "75%" }, { value: "2-3", label: "66%" }, { value: "3-5", label: "60%" }, { value: "1-2", label: "50%" }, { value: "2-5", label: "40%" }, { value: "1-3", label: "33%" }, { value: "1-4", label: "25%" }, { value: "1-5", label: "20%" }, { value: "small", label: "Small" }, { value: "medium", label: "Medium" }, { value: "large", label: "Large" }, { value: "xlarge", label: "X-Large" }, { value: "2xlarge", label: "2X-Large" }];
  const placementOptions = [{ value: "top", label: "Top" }, { value: "bottom", label: "Bottom" }, { value: "left", label: "Left" }, { value: "right", label: "Right" }, { value: "between", label: "Between" }];
  const colorOptions = [{ value: "none", label: "None" }, { value: "muted", label: "Muted" }, { value: "emphasis", label: "Emphasis" }, { value: "primary", label: "Primary" }, { value: "secondary", label: "Secondary" }, { value: "success", label: "Success" }, { value: "warning", label: "Warning" }, { value: "danger", label: "Danger" }];
  return <InspectorDivision title="IMAGE">
    <div className="builder-two-column" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
      <InspectorFieldRow label="Width" isOverridden={values.imageWidth !== undefined} inheritedValueText="auto" onReset={() => update({ imageWidth: undefined })}><InspectorTextField value={String(values.imageWidth ?? "")} placeholder="auto" onChange={(value) => update({ imageWidth: value.trim() || undefined })} /></InspectorFieldRow>
      <InspectorFieldRow label="Height" isOverridden={values.imageHeight !== undefined} inheritedValueText="auto" onReset={() => update({ imageHeight: undefined })}><InspectorTextField value={String(values.imageHeight ?? "")} placeholder="auto" onChange={(value) => update({ imageHeight: value.trim() || undefined })} /></InspectorFieldRow>
    </div>
    <InspectorFieldRow label="Loading" isOverridden={values.imageLoading !== undefined} inheritedValueText="Lazy" onReset={() => update({ imageLoading: undefined })}>{select("imageLoading", "lazy", [{ value: "lazy", label: "Lazy (Default)" }, { value: "eager", label: "Eager (Immediate)" }], "Image loading")}</InspectorFieldRow>
    <InspectorFieldRow label="Border" isOverridden={values.imageShape !== undefined} inheritedValueText="None" onReset={() => update({ imageShape: undefined })}>{select("imageShape", "none", shapeOptions, "Image border")}</InspectorFieldRow>
    <InspectorFieldRow label="Box Shadow" isOverridden={values.imageShadow !== undefined} inheritedValueText="None" onReset={() => update({ imageShadow: undefined })}>{select("imageShadow", "none", shadowOptions, "Image box shadow")}</InspectorFieldRow>
    <InspectorFieldRow label="Box Decoration" isOverridden={values.imageBoxDecoration !== undefined} inheritedValueText="None" onReset={() => update({ imageBoxDecoration: undefined })}>{select("imageBoxDecoration", "none", [{ value: "none", label: "None" }, { value: "default", label: "Default" }, { value: "primary", label: "Primary" }, { value: "secondary", label: "Secondary" }, { value: "shadow", label: "Floating Shadow" }, { value: "mask", label: "Mask" }], "Image box decoration")}</InspectorFieldRow>
    <InspectorFieldRow label="Inverse style" isOverridden={values.imageInverse !== undefined} inheritedValueText="Off" onReset={() => update({ imageInverse: undefined })}><InspectorSwitch checked={values.imageInverse === true} onChange={(checked) => update({ imageInverse: checked || undefined })} label="Inverse style" /></InspectorFieldRow>
    <InspectorFieldRow label="Link" isOverridden={values.linkImage !== undefined} inheritedValueText="Off" onReset={() => update({ linkImage: undefined })}><InspectorSwitch checked={Boolean(values.linkImage)} onChange={(checked) => update({ linkImage: checked })} label="Link image" /></InspectorFieldRow>
    <InspectorFieldRow label="Hover Transition" isOverridden={values.imageHoverTransition !== undefined} inheritedValueText="None" onReset={() => update({ imageHoverTransition: undefined })}>{select("imageHoverTransition", "none", [{ value: "none", label: "None" }, { value: "scale-up", label: "Scale Up" }, { value: "scale-down", label: "Scale Down" }], "Image hover transition")}</InspectorFieldRow>
    <InspectorFieldRow label="Border" isOverridden={values.imageHoverBorder !== undefined} inheritedValueText="Off" onReset={() => update({ imageHoverBorder: undefined })}><InspectorSwitch checked={values.imageHoverBorder === true} onChange={(checked) => update({ imageHoverBorder: checked || undefined })} label="Border" /></InspectorFieldRow>
    <InspectorFieldRow label="Hover Box Shadow" isOverridden={values.imageHoverBoxShadow !== undefined} inheritedValueText="None" onReset={() => update({ imageHoverBoxShadow: undefined })}>{select("imageHoverBoxShadow", "none", shadowOptions, "Image hover box shadow")}</InspectorFieldRow>
    <InspectorFieldRow label="Icon Width" isOverridden={values.imageIconWidth !== undefined} inheritedValueText="auto" onReset={() => update({ imageIconWidth: undefined })}><InspectorTextField value={String(values.imageIconWidth ?? "")} placeholder="auto" onChange={(value) => update({ imageIconWidth: value.trim() || undefined })} /></InspectorFieldRow>
    <InspectorFieldRow label="Icon Color" isOverridden={values.imageIconColor !== undefined} inheritedValueText="None" onReset={() => update({ imageIconColor: undefined })}>{select("imageIconColor", "none", colorOptions, "Image icon color")}</InspectorFieldRow>
    <InspectorFieldRow label="Alignment" isOverridden={values.gridMediaPlacement !== undefined} inheritedValueText="Top" onReset={() => update({ gridMediaPlacement: undefined })}>{select("gridMediaPlacement", "top", placementOptions, "Image alignment")}</InspectorFieldRow>
    <InspectorFieldRow label="Grid Width" isOverridden={values.gridMediaWidth !== undefined} inheritedValueText="50%" onReset={() => update({ gridMediaWidth: undefined })}>{select("gridMediaWidth", "1-2", widthOptions, "Image grid width")}</InspectorFieldRow>
    <InspectorFieldRow label="Grid Column Gap" isOverridden={values.gridMediaColumnGap !== undefined} inheritedValueText="Default" onReset={() => update({ gridMediaColumnGap: undefined })}>{select("gridMediaColumnGap", "default", gapOptions, "Image grid column gap")}</InspectorFieldRow>
    <InspectorFieldRow label="Grid Row Gap" isOverridden={values.gridMediaRowGap !== undefined} inheritedValueText="Default" onReset={() => update({ gridMediaRowGap: undefined })}>{select("gridMediaRowGap", "default", gapOptions, "Image grid row gap")}</InspectorFieldRow>
    <InspectorFieldRow label="Grid Breakpoint" isOverridden={values.gridMediaBreakpoint !== undefined} inheritedValueText="Medium (Tablet Landscape)" onReset={() => update({ gridMediaBreakpoint: undefined })}>{select("gridMediaBreakpoint", "m", breakpointOptions, "Image grid breakpoint")}</InspectorFieldRow>
    <InspectorFieldRow label="Vertical Alignment" isOverridden={values.gridMediaVerticalAlign !== undefined} inheritedValueText="Off" onReset={() => update({ gridMediaVerticalAlign: undefined })}><InspectorSwitch checked={values.gridMediaVerticalAlign === true} onChange={(checked) => update({ gridMediaVerticalAlign: checked || undefined })} label="Center" /></InspectorFieldRow>
    <InspectorFieldRow label="Margin Top" isOverridden={values.imageMarginTop !== undefined} inheritedValueText="Default" onReset={() => update({ imageMarginTop: undefined })}>{select("imageMarginTop", "default", [{ value: "small", label: "Small" }, { value: "default", label: "Default" }, { value: "medium", label: "Medium" }, { value: "large", label: "Large" }, { value: "xlarge", label: "X-Large" }, { value: "none", label: "None" }], "Image margin top")}</InspectorFieldRow>
    <InspectorFieldRow label="Inline SVG" isOverridden={values.imageSvgInline !== undefined} inheritedValueText="Off" onReset={() => update({ imageSvgInline: undefined })}><InspectorSwitch checked={values.imageSvgInline === true} onChange={(checked) => update({ imageSvgInline: checked || undefined })} label="Make SVG stylable with CSS" /></InspectorFieldRow>
    <InspectorFieldRow label="Animate strokes" isOverridden={values.imageSvgAnimate !== undefined} inheritedValueText="Off" onReset={() => update({ imageSvgAnimate: undefined })}><InspectorSwitch checked={values.imageSvgAnimate === true} onChange={(checked) => update({ imageSvgAnimate: checked || undefined })} label="Animate strokes" /></InspectorFieldRow>
    <InspectorFieldRow label="SVG Color" isOverridden={values.imageSvgColor !== undefined} inheritedValueText="None" onReset={() => update({ imageSvgColor: undefined })}>
      <InspectorSelect value={String(values.imageSvgColor ?? "none")} options={UIKIT_YOOTHEME_SVG_COLOR_OPTIONS} disabled={values.imageSvgInline !== true} onChange={(value) => update({ imageSvgColor: value === "none" ? undefined : value })} ariaLabel="SVG color" />
    </InspectorFieldRow>
    <InspectorFieldRow label="Text Color" isOverridden={values.imageTextColor !== undefined} inheritedValueText="None" onReset={() => update({ imageTextColor: undefined })}>{select("imageTextColor", "none", colorOptions, "Image text color")}</InspectorFieldRow>
  </InspectorDivision>;
}

/**
 * YOOtheme Grid's shared Content composition controls. These values belong to
 * the Grid's authored visual-style layout contract; keeping them here avoids
 * exposing the same controls again in the generic General panel.
 */
function GridContentSettingsGroup({ block, update }: Pick<Props, "block" | "update">) {
  const visual = ((block as any).visualStyle ?? {}) as any;
  const layout = visual.layout ?? {};
  const setLayout = (patch: Record<string, unknown>) =>
    update({ visualStyle: { ...visual, layout: { ...layout, ...patch } } });
  const breakpointOptions = [
    { value: "always", label: "Always" },
    { value: "small", label: "Small (Phone Landscape)" },
    { value: "medium", label: "Medium (Tablet Landscape)" },
    { value: "large", label: "Large (Desktop)" },
    { value: "xlarge", label: "X-Large (Large Screens)" },
  ];
  const alignOptions = [
    { value: "none", label: "None" },
    { value: "left", label: "Left" },
    { value: "center", label: "Center" },
    { value: "right", label: "Right" },
  ];
  const textAlignOptions = [...alignOptions, { value: "justify", label: "Justify" }];
  const select = (value: unknown, fallback: string, options: ReadonlyArray<{ value: string; label: string }>, onChange: (value: string) => void, label: string) => (
    <InspectorSelect value={String(value ?? fallback)} options={options} onChange={onChange} ariaLabel={label} />
  );
  return <InspectorDivision title="CONTENT">
    {false && <>
    <InspectorFieldRow label="Max Width" isOverridden={layout.maxWidth !== undefined} inheritedValueText="None" onReset={() => setLayout({ maxWidth: undefined })}>
      {select(layout.maxWidth, "none", [{ value: "none", label: "None" }, { value: "small", label: "Small" }, { value: "medium", label: "Medium" }, { value: "large", label: "Large" }, { value: "xlarge", label: "X-Large" }, { value: "2xlarge", label: "2X-Large" }], (value) => setLayout({ maxWidth: value === "none" ? undefined : value }), "Grid content max width")}
    </InspectorFieldRow>
    <InspectorFieldRow label="Max Width Breakpoint" isOverridden={layout.maxWidthBreakpoint !== undefined} inheritedValueText="Always" onReset={() => setLayout({ maxWidthBreakpoint: undefined })}>
      {select(layout.maxWidthBreakpoint, "always", breakpointOptions, (value) => setLayout({ maxWidthBreakpoint: value === "always" ? undefined : value }), "Grid content max width breakpoint")}
    </InspectorFieldRow>
    <InspectorFieldRow label="Block Alignment" isOverridden={layout.blockAlign !== undefined} inheritedValueText="None" onReset={() => setLayout({ blockAlign: undefined })}>
      {select(layout.blockAlign, "none", alignOptions, (value) => setLayout({ blockAlign: value === "none" ? undefined : value }), "Grid block alignment")}
    </InspectorFieldRow>
    <InspectorFieldRow label="Block Alignment Breakpoint" isOverridden={layout.blockAlignBreakpoint !== undefined} inheritedValueText="Always" onReset={() => setLayout({ blockAlignBreakpoint: undefined })}>
      {select(layout.blockAlignBreakpoint, "always", breakpointOptions, (value) => setLayout({ blockAlignBreakpoint: value === "always" ? undefined : value }), "Grid block alignment breakpoint")}
    </InspectorFieldRow>
    <InspectorFieldRow label="Block Alignment Fallback" isOverridden={layout.blockAlignFallback !== undefined} inheritedValueText="Left" onReset={() => setLayout({ blockAlignFallback: undefined })}>
      {select(layout.blockAlignFallback, "left", alignOptions, (value) => setLayout({ blockAlignFallback: value }), "Grid block alignment fallback")}
    </InspectorFieldRow>
    <InspectorFieldRow label="Text Alignment" isOverridden={layout.textAlign !== undefined} inheritedValueText="None" onReset={() => setLayout({ textAlign: undefined })}>
      {select(layout.textAlign, "none", textAlignOptions, (value) => setLayout({ textAlign: value === "none" ? undefined : value }), "Grid text alignment")}
    </InspectorFieldRow>
    <InspectorFieldRow label="Text Alignment Breakpoint" isOverridden={layout.textAlignBreakpoint !== undefined} inheritedValueText="Always" onReset={() => setLayout({ textAlignBreakpoint: undefined })}>
      {select(layout.textAlignBreakpoint, "always", breakpointOptions, (value) => setLayout({ textAlignBreakpoint: value === "always" ? undefined : value }), "Grid text alignment breakpoint")}
    </InspectorFieldRow>
    <InspectorFieldRow label="Text Alignment Fallback" isOverridden={layout.textAlignFallback !== undefined} inheritedValueText="None" onReset={() => setLayout({ textAlignFallback: undefined })}>
      {select(layout.textAlignFallback, "none", textAlignOptions, (value) => setLayout({ textAlignFallback: value === "none" ? undefined : value }), "Grid text alignment fallback")}
    </InspectorFieldRow>
    </>}
    <InspectorFieldRow label="Style" isOverridden={(block as any).contentStyle !== undefined} inheritedValueText="None" onReset={() => update({ contentStyle: undefined })}>
      <InspectorSelect value={String((block as any).contentStyle ?? "none")} options={CONTENT_STYLE_OPTIONS} onChange={(value) => update({ contentStyle: value === "none" ? undefined : value })} ariaLabel="Content style" />
    </InspectorFieldRow>
    <InspectorFieldRow label="Alignment" isOverridden={(block as any).gridContentAlign !== undefined} inheritedValueText="Left" onReset={() => update({ gridContentAlign: undefined })}><InspectorSwitch checked={(block as any).gridContentAlign === true} onChange={(checked) => update({ gridContentAlign: checked || undefined })} label="Force left alignment" /></InspectorFieldRow>
    <InspectorFieldRow label="Drop Cap" isOverridden={(block as any).gridContentDropcap === true} inheritedValueText="Off" onReset={() => update({ gridContentDropcap: undefined })}><InspectorSwitch checked={(block as any).gridContentDropcap === true} onChange={(checked) => update({ gridContentDropcap: checked || undefined })} label="Enable drop cap" /></InspectorFieldRow>
    <InspectorFieldRow label="Columns" isOverridden={(block as any).gridContentColumn !== undefined} inheritedValueText="None" onReset={() => update({ gridContentColumn: undefined })}>{select((block as any).gridContentColumn, "none", [{ value: "none", label: "None" }, { value: "1-2", label: "Halves" }, { value: "1-3", label: "Thirds" }, { value: "1-4", label: "Quarters" }, { value: "1-5", label: "Fifths" }, { value: "1-6", label: "Sixths" }], (value) => update({ gridContentColumn: value }), "Grid content columns")}</InspectorFieldRow>
    <InspectorFieldRow label="Show Dividers" isOverridden={(block as any).gridContentColumnDivider === true} inheritedValueText="Off" onReset={() => update({ gridContentColumnDivider: undefined })}><InspectorSwitch checked={(block as any).gridContentColumnDivider === true} onChange={(checked) => update({ gridContentColumnDivider: checked || undefined })} label="Show dividers" /></InspectorFieldRow>
    <InspectorFieldRow label="Columns Breakpoint" isOverridden={(block as any).gridContentColumnBreakpoint !== undefined} inheritedValueText="Always" onReset={() => update({ gridContentColumnBreakpoint: undefined })}>{select((block as any).gridContentColumnBreakpoint, "always", breakpointOptions, (value) => update({ gridContentColumnBreakpoint: value }), "Grid content columns breakpoint")}</InspectorFieldRow>
    <InspectorFieldRow label="Margin Top" isOverridden={(block as any).contentMarginTop !== undefined} inheritedValueText="Small" onReset={() => update({ contentMarginTop: undefined })}>
      {select((block as any).contentMarginTop, "small", [{ value: "small", label: "Small" }, { value: "default", label: "Default" }, { value: "medium", label: "Medium" }, { value: "large", label: "Large" }, { value: "xlarge", label: "X-Large" }, { value: "none", label: "None" }], (value) => update({ contentMarginTop: value }), "Grid content margin top")}
    </InspectorFieldRow>
  </InspectorDivision>;
}

const itemPanelStyleOptions = [
  { value: "inherit", label: "Inherit Grid Style" },
  { value: "blank", label: "None" },
  { value: "default", label: "Card Default" },
  { value: "primary", label: "Card Primary" },
  { value: "secondary", label: "Card Secondary" },
  { value: "card-hover", label: "Card Hover" },
];

const tagsToText = (tags?: string[]) => tags?.join(", ") ?? "";
const parseTags = (value: string) => Array.from(new Set(value.split(",").map((tag) => tag.trim()).filter(Boolean)));

export default function GridCapabilityPanel({
  block,
  tab,
  shellSettings,
  update,
  openWordPressMediaPicker,
}: Props) {
  const items = block.gridItems ?? [];
  const [activeItemTabs, setActiveItemTabs] = useState<Record<string, "content" | "settings" | "advanced">>({});
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
              const updateDynamicBinding = (
                destination: keyof NonNullable<GridItem["dynamicBindings"]>,
                binding: DynamicFieldBinding | undefined,
              ) => {
                updateItems(
                  items.map((entry, i) => {
                    if (i !== index) return entry;
                    const nextBindings = { ...(entry.dynamicBindings ?? {}) };
                    if (binding) nextBindings[destination] = binding;
                    else delete nextBindings[destination];
                    return {
                      ...entry,
                      dynamicBindings: Object.keys(nextBindings).length > 0 ? nextBindings : undefined,
                    };
                  }),
                );
              };
              const dynamicBinding = (destination: DynamicBindingDestination) => ({
                destination,
                descriptor: item.dynamicContext,
                bindings: item.dynamicBindings,
                onChange: (field: string, binding: DynamicFieldBinding | undefined) =>
                  updateDynamicBinding(field as keyof NonNullable<GridItem["dynamicBindings"]>, binding),
              });
              return (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "8px" }}>
                  <InspectorPillGroup
                    value={activeTab}
                    options={opts(["content", "settings", "advanced"] as const)}
                    onChange={(value) => {
                      if (item.id) {
                        setActiveItemTabs((prev) => ({
                          ...prev,
                          [item.id as string]: value as "content" | "settings" | "advanced",
                        }));
                      }
                    }}
                    ariaLabel={`Grid item ${index + 1} tab`}
                  />

                  {activeTab === "content" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "8px" }}>
                      <InspectorFieldRow label="Title" dynamicBinding={dynamicBinding("title")}>
                        <>
                          <InspectorTextarea
                            value={item.title ?? ""}
                            onChange={(value) =>
                              updateItems(
                                items.map((entry, i) => (i === index ? { ...entry, title: sanitizeHtml(value) } : entry))
                              )
                            }
                            ariaLabel={`Item ${index + 1} title`}
                            placeholder="Title (inline HTML such as <br> is supported)"
                          />
                        </>
                      </InspectorFieldRow>
                      <InspectorFieldRow label="Meta" dynamicBinding={dynamicBinding("meta")}>
                        <>
                          <InspectorTextField
                            value={item.meta ?? ""}
                            onChange={(value) =>
                              updateItems(
                                items.map((entry, i) => (i === index ? { ...entry, meta: value } : entry))
                              )
                            }
                            ariaLabel={`Item ${index + 1} meta`}
                          />
                        </>
                      </InspectorFieldRow>
                      <InspectorFieldRow label="Content" dynamicBinding={dynamicBinding("text")}>
                        <>
                          <RichTextEditor
                            value={item.text ?? ""}
                            onChange={(value) =>
                              updateItems(
                                items.map((entry, i) => (i === index ? { ...entry, text: sanitizeHtml(value) } : entry))
                              )
                            }
                            placeholder="Write item content..."
                            minHeight="180px"
                          />
                        </>
                      </InspectorFieldRow>
                      <InspectorFieldRow label="Image" dynamicBinding={dynamicBinding("imageUrl")}>
                        <>
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
                        </>
                      </InspectorFieldRow>
                      <InspectorFieldRow label="Image Alt" dynamicBinding={dynamicBinding("imageAlt")}>
                        <>
                          <InspectorTextField
                            value={item.imageAlt ?? ""}
                            onChange={(value) =>
                              updateItems(
                                items.map((entry, i) => (i === index ? { ...entry, imageAlt: value } : entry))
                              )
                            }
                            ariaLabel={`Item ${index + 1} image alt`}
                          />
                        </>
                      </InspectorFieldRow>
                      <InspectorFieldRow label="Link" dynamicBinding={dynamicBinding("buttonUrl")}>
                        <>
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
                        </>
                      </InspectorFieldRow>
                      <InspectorFieldRow label="Link Text" dynamicBinding={dynamicBinding("buttonLabel")}>
                        <>
                          <InspectorTextField
                            value={item.buttonLabel ?? ""}
                            onChange={(value) =>
                              updateItems(
                                items.map((entry, i) => (i === index ? { ...entry, buttonLabel: value } : entry))
                              )
                            }
                            ariaLabel={`Item ${index + 1} link text`}
                          />
                        </>
                      </InspectorFieldRow>
                      <InspectorFieldRow label="Tags">
                        <InspectorTextField
                          value={tagsToText(item.tags)}
                          onChange={(value) =>
                            updateItems(
                              items.map((entry, i) =>
                                i === index ? { ...entry, tags: parseTags(value) } : entry
                              )
                            )
                          }
                          ariaLabel={`Item ${index + 1} tags`}
                          placeholder="blue, white, black"
                        />
                      </InspectorFieldRow>
                      <p className="builder-inspector-field-help">Enter a comma-separated list of tags for the Grid filter.</p>
                      <InspectorFieldRow label="Panel Style">
                        <InspectorSelect
                          value={item.cardVariant === undefined ? "inherit" : item.cardHover ? "card-hover" : item.cardVariant}
                          options={itemPanelStyleOptions}
                          onChange={(value) =>
                            updateItems(
                              items.map((entry, i) => {
                                if (i !== index) return entry;
                                if (value === "inherit") {
                                  const { cardVariant: _cardVariant, cardHover: _cardHover, renderer: _renderer, ...inherited } = entry;
                                  return inherited;
                                }
                                if (value === "card-hover") {
                                  return { ...entry, renderer: "card", cardVariant: "card-hover", cardHover: true };
                                }
                                return {
                                  ...entry,
                                  renderer: value === "blank" ? "plain" : "card",
                                  cardVariant: value as GridItem["cardVariant"],
                                  cardHover: false,
                                };
                              })
                            )
                          }
                          ariaLabel={`Item ${index + 1} panel style`}
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
                    </div>
                  )}

                  {activeTab === "advanced" && (
                    <DynamicContentInspectorGroup
                      item={item}
                      update={(patch) =>
                        updateItems(
                          items.map((entry, i) => (i === index ? { ...entry, ...patch } : entry)),
                        )
                      }
                    />
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
                checked={block.gridShowButton !== false}
                onChange={(e) => update({ gridShowButton: e.target.checked })}
              />
              <span>Show the link</span>
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
          <UikitGridStructureSettingsGroup block={block as any} update={update} keys={{ masonry: "gridMasonry", parallax: "gridParallax", parallaxJustify: "gridParallaxJustify", parallaxStart: "gridParallaxStart", parallaxEnd: "gridParallaxEnd" }} />

          <InspectorFieldRow
            label="Column Gap"
            isOverridden={block.gridGap !== undefined}
            inheritedValueText="Default"
            onReset={() => update({ gridGap: undefined })}
          >
            <InspectorSelect
              value={block.gridGap ?? "default"}
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

          {(block as any).gridGap !== "none" && (block as any).gridGap !== "collapse" && (
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
          )}

          {!(block as any).gridMasonry && (
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
          )}
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
                { value: "3", label: "3 Columns" },
                { value: "4", label: "4 Columns" },
                { value: "5", label: "5 Columns" },
                { value: "6", label: "6 Columns" },
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
            isOverridden={(block as any).columnsTabletLandscape !== undefined || block.columns !== undefined}
            inheritedValueText="Inherit"
            onReset={() => update({ columnsTabletLandscape: undefined } as any)}
          >
            <InspectorSelect
              value={String((block as any).columnsTabletLandscape ?? block.columns ?? "inherit")}
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
              onChange={(v) => update({ columnsTabletLandscape: v === "inherit" ? undefined : v } as any)}
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
            isOverridden={Boolean((block as any).enableFilter)}
            inheritedValueText="Off"
            onReset={() => update({ enableFilter: false } as any)}
          >
            <label className="builder-inspector-checkbox-row">
              <input
                type="checkbox"
                checked={Boolean((block as any).enableFilter)}
                onChange={(e) => update({ enableFilter: e.target.checked } as any)}
              />
              <span>Enable filter navigation</span>
            </label>
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
                { value: "pill", label: "Pills" },
              ]}
              onChange={(v) => update({ filterStyle: v } as any)}
              ariaLabel="Filter Style"
            />
          </InspectorFieldRow>
        </InspectorDivision>

        <InspectorDivision title="LIGHTBOX">
          <InspectorFieldRow
            label="Lightbox"
            isOverridden={Boolean((block as any).enableLightbox)}
            inheritedValueText="Off"
            onReset={() => update({ enableLightbox: undefined } as any)}
          >
            <InspectorSwitch
              checked={Boolean((block as any).enableLightbox)}
              onChange={(checked) => update({ enableLightbox: checked } as any)}
              label="Enable lightbox gallery"
            />
          </InspectorFieldRow>
        </InspectorDivision>

        <GridImageSettingsGroup block={block} update={update} />

        <CardSettingsGroup
          block={block}
          update={update}
          title="PANEL"
          showLink
          linkFirst
          hoverLabel="Add hover style"
          surfaceOptions={[
            { value: "blank", label: "None" },
            { value: "default", label: "Card Default" },
            { value: "primary", label: "Card Primary" },
            { value: "secondary", label: "Card Secondary" },
            { value: "card-hover", label: "Card Hover" },
            { value: "tile-default", label: "Tile Default" },
            { value: "tile-muted", label: "Tile Muted" },
            { value: "tile-primary", label: "Tile Primary" },
            { value: "tile-secondary", label: "Tile Secondary" },
            { value: "tile-checked", label: "Tile Checked" },
          ]}
          defaultSize="none"
          sizeLabel="Padding"
          showImageNoPadding
          showExpandContent
          showMaxWidth
          imageNoPaddingLabel="Align image without padding"
          sizeOptions={[
            { value: "none", label: "None" },
            { value: "small", label: "Small" },
            { value: "default", label: "Default" },
            { value: "large", label: "Large" },
          ]}
          keys={{ variant: "gridCardVariant", size: "gridCardSize", hover: "panelHover", link: "linkPanel", maxWidth: "gridItemMaxWidth" }}
        />

        <TitleSettingsGroup
          block={block}
          update={update}
          showAlignment={false}
          showDecoration
          showColor
          showLink
          defaultSize="none"
          keys={{ role: "titleTypographyRole", size: "gridTitleSize", align: "textAlignment", level: "gridTitleLevel", decoration: "titleDecoration", color: "titleColor", link: "linkTitle" }}
        />

        <MetaSettingsGroup
          block={block}
          update={update}
          showAlignment={false}
          showRole={block.spacingContract !== "yootheme"}
          showStyle
          showColor
          showPosition
          positionLabel="Alignment"
          showMargin
          styleOptions={[
            { value: "text-meta", label: "Text Meta" },
            { value: "text-lead", label: "Text Lead" },
            { value: "text-small", label: "Text Small" },
            { value: "text-large", label: "Text Large" },
            { value: "3xlarge", label: "Heading 3X-Large" },
            { value: "2xlarge", label: "Heading 2X-Large" },
            { value: "xlarge", label: "Heading X-Large" },
            { value: "large", label: "Heading Large" },
            { value: "medium", label: "Heading Medium" },
            { value: "small", label: "Heading Small" },
            { value: "h1", label: "Heading H1" },
            { value: "h2", label: "Heading H2" },
            { value: "h3", label: "Heading H3" },
            { value: "h4", label: "Heading H4" },
            { value: "h5", label: "Heading H5" },
            { value: "h6", label: "Heading H6" },
          ]}
          htmlElementOptions={["h1", "h2", "h3", "h4", "h5", "h6", "div"]}
          keys={{ role: "metaTypographyRole", align: "textAlignment", level: "gridMetaHtmlElement", style: "metaStyle", color: "metaColor", position: "gridMetaAlign" }}
        />

        <GridContentSettingsGroup block={block} update={update} />

        <ActionSettingsGroup
          block={block}
          update={update}
          title="LINK"
          showFullWidth
          showMargin
          terminology="link"
          keys={{ label: "buttonLabel", url: "buttonUrl", target: "buttonTarget", style: "buttonStyle", size: "size", width: "fullWidthButton", margin: "linkMarginTop" }}
        />
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
