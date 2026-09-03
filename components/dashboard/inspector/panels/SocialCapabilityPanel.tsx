"use client";

import type { BuilderLayoutBlock, BuilderSocialItem, InspectorTab, WordPressMediaItem } from "@/components/dashboard/builderTypes";
import type { BuilderShellSettings } from "@/lib/builderShell";
import type { DynamicFieldBinding } from "@/lib/dynamicContent";
import { BUILDER_LINK_TARGET_OPTIONS } from "@/lib/websiteBuilderLinks";
import { Plus } from "lucide-react";
import {
  InspectorDivision,
  InspectorFieldRow,
  InspectorSelect,
  InspectorSwitch,
  InspectorTextField,
} from "@/components/dashboard/inspector/InspectorControls";
import IconPicker from "@/components/dashboard/inspector/IconPicker";
import RepeatableItemShell from "@/components/dashboard/inspector/RepeatableItemShell";
import ElementAdvancedPanel from "@/components/dashboard/inspector/panels/ElementAdvancedPanel";
import { BuilderImageUrlControl } from "@/components/dashboard/inspector/panels/InspectorSharedControls";

type Props = {
  block: BuilderLayoutBlock;
  tab: InspectorTab;
  shellSettings: BuilderShellSettings;
  update: (patch: Partial<BuilderLayoutBlock>) => void;
  openWordPressMediaPicker: (options: { title: string; currentUrl?: string; onSelect: (media: WordPressMediaItem) => void }) => void;
};

const gapOptions = ["small", "medium", "default", "large", "none"].map((value) => ({ value, label: value[0].toUpperCase() + value.slice(1) }));
const breakpointOptions = [
  { value: "always", label: "Always" },
  { value: "small", label: "Small (Phone Landscape)" },
  { value: "medium", label: "Medium (Tablet Landscape)" },
  { value: "large", label: "Large (Desktop)" },
  { value: "xlarge", label: "X-Large (Large Screens)" },
];

export default function SocialCapabilityPanel({ block, tab, update, openWordPressMediaPicker }: Props) {
  const items = block.socialItems ?? [];
  const updateItems = (socialItems: BuilderSocialItem[]) => update({ socialItems });

  if (tab === "advanced") return <ElementAdvancedPanel block={block} update={update} />;

  if (tab === "content") {
    return (
      <div className="builder-inspector-stack" data-uikit-capability="social-content">
        <InspectorDivision title="ITEMS">
          <RepeatableItemShell
            items={items}
            itemLabel="Social item"
            getItemKey={(item) => item.id}
            getItemSummary={(item) => item.link || "Untitled social link"}
            onCopy={(index) => {
              const next = [...items];
              next.splice(index + 1, 0, { ...items[index], id: `social-${Date.now()}` });
              updateItems(next);
            }}
            onDelete={(index) => updateItems(items.filter((_, itemIndex) => itemIndex !== index))}
            onReorder={(sourceIndex, targetIndex) => {
              const next = [...items];
              const [moved] = next.splice(sourceIndex, 1);
              next.splice(targetIndex, 0, moved);
              updateItems(next);
            }}
            renderItem={(item, index) => {
              const updateItem = (patch: Partial<BuilderSocialItem>) => {
                const next = [...items];
                next[index] = { ...item, ...patch };
                updateItems(next);
              };
              const dynamicBinding = (destination: "link" | "linkAriaLabel" | "iconName" | "imageUrl") => ({
                destination,
                descriptor: item.dynamicContext,
                bindings: item.dynamicBindings,
                onChange: (key: string, binding: DynamicFieldBinding | undefined) => {
                  const bindings = { ...(item.dynamicBindings ?? {}) };
                  if (binding) bindings[key as keyof typeof bindings] = binding;
                  else delete bindings[key as keyof typeof bindings];
                  updateItem({ dynamicBindings: Object.keys(bindings).length ? bindings : undefined });
                },
              });
              return (
                <div className="builder-inspector-stack">
                  <InspectorFieldRow label="Link" dynamicBinding={dynamicBinding("link")}>
                    <InspectorTextField value={item.link} onChange={(link) => updateItem({ link })} placeholder="https://…, mailto:…, or tel:…" ariaLabel="Social link" />
                  </InspectorFieldRow>
                  <InspectorFieldRow label="Link ARIA Label" dynamicBinding={dynamicBinding("linkAriaLabel")}>
                    <InspectorTextField value={item.linkAriaLabel ?? ""} onChange={(linkAriaLabel) => updateItem({ linkAriaLabel })} ariaLabel="Social link ARIA label" />
                  </InspectorFieldRow>
                  <InspectorFieldRow label="Icon" dynamicBinding={dynamicBinding("iconName")} help="Optional. Otherwise the brand is inferred from the link.">
                    <IconPicker value={item.iconName} onChange={(iconName) => updateItem({ iconName })} onClear={() => updateItem({ iconName: undefined })} ariaLabel="Alternative social icon" />
                  </InspectorFieldRow>
                  <InspectorFieldRow label="Image" dynamicBinding={dynamicBinding("imageUrl")} help="Optional SVG or image override.">
                    <BuilderImageUrlControl
                      value={item.imageUrl ?? ""}
                      onChange={(event) => updateItem({ imageUrl: event.target.value })}
                      onChoose={() => openWordPressMediaPicker({
                        title: "Social Image",
                        currentUrl: item.imageUrl,
                        onSelect: (media) => updateItem({ imageUrl: media.sourceUrl }),
                      })}
                    />
                  </InspectorFieldRow>
                </div>
              );
            }}
          />
          <button type="button" className="builder-inline-add" onClick={() => updateItems([...items, { id: `social-${Date.now()}`, link: "" }])}>
            <Plus size={16} /> Add item
          </button>
        </InspectorDivision>
      </div>
    );
  }

  return (
    <div className="builder-inspector-stack" data-uikit-capability="social-settings">
      <InspectorDivision title="SOCIAL ICONS">
        <InspectorFieldRow label="Style"><InspectorSelect value={block.socialStyle ?? "icon"} onChange={(socialStyle) => update({ socialStyle: socialStyle as BuilderLayoutBlock["socialStyle"] })} options={[
          { value: "icon", label: "Icon Link" }, { value: "button", label: "Icon Button" }, { value: "link", label: "Link" },
          { value: "muted", label: "Link Muted" }, { value: "text", label: "Link Text" }, { value: "reset", label: "Link Reset" },
          { value: "iconnav", label: "Iconnav" }, { value: "thumbnav", label: "Thumbnav" },
        ]} /></InspectorFieldRow>
        <InspectorFieldRow label="Grid"><InspectorSelect value={block.socialGrid ?? "horizontal"} onChange={(socialGrid) => update({ socialGrid: socialGrid as BuilderLayoutBlock["socialGrid"] })} options={[{ value: "horizontal", label: "Horizontal" }, { value: "vertical", label: "Vertical" }]} /></InspectorFieldRow>
        <InspectorFieldRow label="Grid Breakpoint"><InspectorSelect value={block.socialGridBreakpoint ?? "always"} onChange={(socialGridBreakpoint) => update({ socialGridBreakpoint: socialGridBreakpoint as BuilderLayoutBlock["socialGridBreakpoint"] })} options={breakpointOptions} disabled={block.socialGrid !== "vertical"} /></InspectorFieldRow>
        <InspectorFieldRow label="Column Gap"><InspectorSelect value={block.socialColumnGap ?? "small"} onChange={(socialColumnGap) => update({ socialColumnGap: socialColumnGap as BuilderLayoutBlock["socialColumnGap"] })} options={gapOptions} /></InspectorFieldRow>
        <InspectorFieldRow label="Row Gap"><InspectorSelect value={block.socialRowGap ?? "small"} onChange={(socialRowGap) => update({ socialRowGap: socialRowGap as BuilderLayoutBlock["socialRowGap"] })} options={gapOptions} /></InspectorFieldRow>
      </InspectorDivision>
      <InspectorDivision title="IMAGE">
        <InspectorFieldRow label="Icon Width"><InspectorTextField type="number" value={String(block.socialIconWidth ?? "")} onChange={(value) => update({ socialIconWidth: value ? Number(value) : undefined })} placeholder="auto" /></InspectorFieldRow>
        <InspectorFieldRow label="Width/Height"><div className="inspector-range-value-row"><InspectorTextField type="number" value={String(block.socialImageWidth ?? "")} onChange={(value) => update({ socialImageWidth: value ? Number(value) : undefined })} placeholder="auto" /><InspectorTextField type="number" value={String(block.socialImageHeight ?? "")} onChange={(value) => update({ socialImageHeight: value ? Number(value) : undefined })} placeholder="auto" /></div></InspectorFieldRow>
        <InspectorFieldRow label="Loading"><InspectorSwitch checked={block.socialImageLoading === "eager"} onChange={(eager) => update({ socialImageLoading: eager ? "eager" : "lazy" })} label="Load image eagerly" /></InspectorFieldRow>
        <InspectorFieldRow label="Inline SVG"><InspectorSwitch checked={block.socialImageSvgInline !== false} onChange={(socialImageSvgInline) => update({ socialImageSvgInline })} label="Make SVG stylable with CSS" /></InspectorFieldRow>
      </InspectorDivision>
      <InspectorDivision title="LINK">
        <InspectorFieldRow label="Link Target"><InspectorSelect value={block.socialLinkTarget ?? "_self"} onChange={(socialLinkTarget) => update({ socialLinkTarget: socialLinkTarget as "_self" | "_blank" })} options={BUILDER_LINK_TARGET_OPTIONS} /></InspectorFieldRow>
        <InspectorFieldRow label="ARIA Label"><InspectorTextField value={block.socialLinkAriaLabel ?? ""} onChange={(socialLinkAriaLabel) => update({ socialLinkAriaLabel })} /></InspectorFieldRow>
      </InspectorDivision>
    </div>
  );
}
