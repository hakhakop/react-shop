"use client";

import React, { useRef } from "react";
import type { BuilderLayoutBlock, InspectorTab, WordPressMediaItem } from "@/components/dashboard/builderTypes";
import type { BuilderShellSettings } from "@/lib/builderShell";
import RepeatableItemShell from "@/components/dashboard/inspector/RepeatableItemShell";
import {
  InspectorDivision,
  InspectorFieldRow,
  InspectorSelect,
  InspectorSwitch,
  InspectorTextField,
  InspectorTextarea,
  InspectorAlignmentControl,
  InspectorPillGroup,
  InspectorSegmentedControl,
} from "@/components/dashboard/inspector/InspectorControls";
import {
  ImageSettingsGroup,
  TitleSettingsGroup,
  MetaSettingsGroup,
  ContentSettingsGroup,
  LinkSettingsGroup,
} from "@/components/dashboard/inspector/panels/SharedSettingGroups";
import { BuilderImageUrlControl } from "@/components/dashboard/inspector/panels/InspectorSharedControls";
import { Plus, ImagePlus } from "lucide-react";
import RichTextEditor from "@/components/dashboard/RichTextEditor";
import ElementAdvancedPanel from "@/components/dashboard/inspector/panels/ElementAdvancedPanel";
import UikitGridStructureSettingsGroup from "@/components/dashboard/inspector/panels/UikitGridStructureSettingsGroup";
import { BUILDER_LINK_TARGET_OPTIONS } from "@/lib/websiteBuilderLinks";

type Props = {
  block: BuilderLayoutBlock;
  tab: InspectorTab;
  shellSettings: BuilderShellSettings;
  update: (patch: Partial<BuilderLayoutBlock>) => void;
  openWordPressMediaPicker?: (options: {
    title: string;
    currentUrl?: string;
    multiple?: boolean;
    onSelect: (media: WordPressMediaItem) => void;
    onSelectMany?: (media: WordPressMediaItem[]) => void;
  }) => void;
};

export default function GalleryCapabilityPanel({
  block,
  tab,
  shellSettings,
  update,
  openWordPressMediaPicker,
}: Props) {
  const rawBlock = (block ?? {}) as any;
  const isImportedYoothemeGallery = rawBlock.spacingContract === "yootheme";
  const items: any[] = rawBlock.galleryItems ?? rawBlock.items ?? [];
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const columnOptions = [
    { value: "inherit", label: "Inherit" },
    { value: "1", label: "1 Column" }, { value: "2", label: "2 Columns" },
    { value: "3", label: "3 Columns" }, { value: "4", label: "4 Columns" },
    { value: "5", label: "5 Columns" }, { value: "6", label: "6 Columns" },
  ];

  const handleAddMediaFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const newItems: any[] = [];
    Array.from(files).forEach((file, index) => {
      const url = URL.createObjectURL(file);
      newItems.push({
        id: String(Date.now() + index),
        imageUrl: url,
        title: file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "),
        meta: "Gallery Image",
        content: "",
      });
    });
    update({ galleryItems: [...items, ...newItems] } as any);
  };

  // --------------------------------------------------------------------------
  // TAB 1: CONTENT
  // --------------------------------------------------------------------------
  if (tab === "content") {
    return (
      <div className="builder-inspector-stack" data-uikit-capability="gallery-content">
        <InspectorDivision title="ITEMS">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "12px" }}>
            <button
              type="button"
              className="builder-btn builder-btn-secondary"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                padding: "8px 12px",
                background: "var(--builder-surface-subtle, #f5f5f7)",
                border: "1px solid var(--builder-border-color, #e0e0e0)",
                borderRadius: "6px",
                fontWeight: 600,
                fontSize: "12px",
                color: "var(--builder-text-primary, #111)",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
              onClick={() =>
                update({
                  galleryItems: [
                    ...items,
                    {
                      id: String(Date.now()),
                      imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
                      title: `Gallery Item ${items.length + 1}`,
                      meta: "Category",
                      content: "Item description",
                    },
                  ],
                } as any)
              }
            >
              <Plus size={14} />
              <span>ADD ITEM</span>
            </button>

            <button
              type="button"
              className="builder-btn builder-btn-primary"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                padding: "8px 12px",
                background: "#1e87f0",
                color: "#ffffff",
                border: "none",
                borderRadius: "6px",
                fontWeight: 600,
                fontSize: "12px",
                cursor: "pointer",
                boxShadow: "0 2px 6px rgba(30,135,240,0.3)",
                transition: "all 0.15s ease",
              }}
              onClick={() => {
                if (openWordPressMediaPicker) {
                  openWordPressMediaPicker({
                    title: "Select Gallery Media (Select Multiple)",
                    multiple: true,
                    onSelect: (media) => {
                      update({
                        galleryItems: [
                          ...items,
                          {
                            id: String(Date.now()),
                            imageUrl: media.sourceUrl,
                            title: media.title || media.altText || "Media Item",
                            meta: "Uploaded",
                            content: "",
                          },
                        ],
                      } as any);
                    },
                    onSelectMany: (mediaItems: any[]) => {
                      const newItems = mediaItems.map((media: any, idx: number) => ({
                        id: String(Date.now() + idx),
                        imageUrl: media.sourceUrl,
                        title: media.title || media.altText || `Media Item ${idx + 1}`,
                        meta: "Gallery Image",
                        content: "",
                      }));
                      update({ galleryItems: [...items, ...newItems] } as any);
                    },
                  });
                } else if (fileInputRef.current) {
                  fileInputRef.current.click();
                }
              }}
            >
              <ImagePlus size={14} />
              <span>ADD MEDIA</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              style={{ display: "none" }}
              onChange={(e) => handleAddMediaFiles(e.target.files)}
            />
          </div>

          <RepeatableItemShell
            items={items}
            getItemKey={(item: any, index: number) => item.id || `gallery-item-${index}`}
            getItemSummary={(item: any, index: number) => item.title || `Gallery Item ${index + 1}`}
            itemLabel="Gallery Item"
            addLabel="Add gallery item"
            onAdd={() =>
              update({
                galleryItems: [
                  ...items,
                  {
                    id: String(Date.now()),
                    imageUrl: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=800&q=80",
                    title: `Item ${items.length + 1}`,
                  },
                ],
              } as any)
            }
            onCopy={(index: number) => {
              const target = items[index];
              if (!target) return;
              const copied = { ...target, id: String(Date.now()) };
              const updated = [...items];
              updated.splice(index + 1, 0, copied);
              update({ galleryItems: updated } as any);
            }}
            onDelete={(index: number) => {
              const updated = items.filter((_: any, i: number) => i !== index);
              update({ galleryItems: updated } as any);
            }}
            onReorder={(sourceIndex: number, targetIndex: number) => {
              const updated = [...items];
              const [moved] = updated.splice(sourceIndex, 1);
              updated.splice(targetIndex, 0, moved);
              update({ galleryItems: updated } as any);
            }}
            renderItem={(item: any, index: number) => {
              const updateItem = (patch: any) => {
                const updated = [...items];
                updated[index] = { ...updated[index], ...patch };
                update({ galleryItems: updated } as any);
              };
              return (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <InspectorFieldRow label="Image source">
                    <BuilderImageUrlControl
                      value={item.imageUrl ?? ""}
                      onChange={(e) => updateItem({ imageUrl: e.target.value })}
                      onChoose={() =>
                        openWordPressMediaPicker?.({
                          title: "Gallery item image",
                          currentUrl: item.imageUrl,
                          onSelect: (media) =>
                            updateItem({
                              imageUrl: media.sourceUrl,
                              title: item.title || media.title || media.altText || "",
                            }),
                        })
                      }
                    />
                  </InspectorFieldRow>
                  <InspectorFieldRow label="Image alt"><InspectorTextField value={item.imageAlt ?? ""} onChange={(imageAlt) => updateItem({ imageAlt })} placeholder="Image description" /></InspectorFieldRow>
                  <InspectorFieldRow label="Title">
                    <InspectorTextField
                      value={item.title ?? ""}
                      onChange={(title) => updateItem({ title })}
                      placeholder="Item Title"
                    />
                  </InspectorFieldRow>
                  <InspectorFieldRow label="Meta">
                    <InspectorTextField
                      value={item.meta ?? ""}
                      onChange={(meta) => updateItem({ meta })}
                      placeholder="Item Meta"
                    />
                  </InspectorFieldRow>
                  <InspectorFieldRow label="Content">
                    <RichTextEditor
                      value={item.content ?? ""}
                      onChange={(content) => updateItem({ content })}
                      placeholder="Item description"
                    />
                  </InspectorFieldRow>
                  <InspectorFieldRow label="Link URL">
                    <InspectorTextField
                      value={item.linkUrl ?? ""}
                      onChange={(linkUrl) => updateItem({ linkUrl })}
                      placeholder="https://"
                    />
                  </InspectorFieldRow>
                  <InspectorFieldRow label="Link text"><InspectorTextField value={item.linkLabel ?? ""} onChange={(linkLabel) => updateItem({ linkLabel })} placeholder="Read more" /></InspectorFieldRow>
                  <InspectorFieldRow label="Link target"><InspectorSelect value={item.linkTarget ?? "_self"} options={BUILDER_LINK_TARGET_OPTIONS} onChange={(linkTarget) => updateItem({ linkTarget })} /></InspectorFieldRow>
                  <InspectorFieldRow label="ARIA label"><InspectorTextField value={item.linkAriaLabel ?? ""} onChange={(linkAriaLabel) => updateItem({ linkAriaLabel })} /></InspectorFieldRow>
                </div>
              );
            }}
          />
        </InspectorDivision>

        <InspectorDivision title="DISPLAY">
          <InspectorFieldRow label="Show the title">
            <InspectorSwitch
              checked={rawBlock.gridShowTitle !== false}
              onChange={(checked) => update({ gridShowTitle: checked } as any)}
              label="Show the title"
            />
          </InspectorFieldRow>
          <InspectorFieldRow label="Show the meta text">
            <InspectorSwitch
              checked={rawBlock.gridShowMeta !== false}
              onChange={(checked) => update({ gridShowMeta: checked } as any)}
              label="Show the meta text"
            />
          </InspectorFieldRow>
          <InspectorFieldRow label="Show the content">
            <InspectorSwitch
              checked={rawBlock.gridShowText !== false}
              onChange={(checked) => update({ gridShowText: checked } as any)}
              label="Show the content"
            />
          </InspectorFieldRow>
          <InspectorFieldRow label="Show the link">
            <InspectorSwitch
              checked={rawBlock.gridShowButton !== false}
              onChange={(checked) => update({ gridShowButton: checked } as any)}
              label="Show the link"
            />
          </InspectorFieldRow>
          <InspectorFieldRow label="Show the hover image">
            <InspectorSwitch
              checked={Boolean(rawBlock.gridShowHoverImage)}
              onChange={(checked) => update({ gridShowHoverImage: checked } as any)}
              label="Show the hover image"
            />
          </InspectorFieldRow>
          <InspectorFieldRow label="Show the hover video">
            <InspectorSwitch
              checked={Boolean(rawBlock.gridShowHoverVideo)}
              onChange={(checked) => update({ gridShowHoverVideo: checked } as any)}
              label="Show the hover video"
            />
          </InspectorFieldRow>
          <small style={{ color: "var(--builder-ui-muted)", fontSize: "11px", display: "block", marginTop: "6px" }}>
            Show or hide content fields without the need to delete the content itself.
          </small>
        </InspectorDivision>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // TAB 2: SETTINGS (STYLE)
  // --------------------------------------------------------------------------
  if (tab === "style") {
    return (
      <div className="builder-inspector-stack" data-uikit-capability="gallery-style">
        {/* GALLERY SECTION */}
        <InspectorDivision title="GALLERY">
          <UikitGridStructureSettingsGroup block={rawBlock} update={update as any} keys={{ masonry: "masonry", parallax: "parallax", parallaxJustify: "parallaxJustify", parallaxStart: "parallaxStart", parallaxEnd: "parallaxEnd" }} />

          <InspectorFieldRow
            label="Column Gap"
            isOverridden={rawBlock.gridGap !== undefined && rawBlock.gridGap !== "medium"}
            inheritedValueText="Medium"
            onReset={() => update({ gridGap: undefined } as any)}
          >
            <InspectorSelect
              value={rawBlock.gridGap ?? "medium"}
              options={[
                { value: "none", label: "None" },
                { value: "small", label: "Small" },
                { value: "medium", label: "Medium" },
                { value: "large", label: "Large" },
              ]}
              onChange={(gridGap) => update({ gridGap } as any)}
            />
          </InspectorFieldRow>

          <InspectorFieldRow
            label="Row Gap"
            isOverridden={rawBlock.gridRowGap !== undefined && rawBlock.gridRowGap !== "medium"}
            inheritedValueText="Medium"
            onReset={() => update({ gridRowGap: undefined } as any)}
          >
            <InspectorSelect
              value={rawBlock.gridRowGap ?? "medium"}
              options={[
                { value: "none", label: "None" },
                { value: "small", label: "Small" },
                { value: "medium", label: "Medium" },
                { value: "large", label: "Large" },
              ]}
              onChange={(gridRowGap) => update({ gridRowGap } as any)}
            />
          </InspectorFieldRow>

          <InspectorFieldRow
            label="Divider"
            isOverridden={Boolean(rawBlock.showDividers)}
            inheritedValueText="Off"
            onReset={() => update({ showDividers: false } as any)}
          >
            <InspectorSwitch
              checked={Boolean(rawBlock.showDividers)}
              onChange={(checked) => update({ showDividers: checked } as any)}
              label="Show dividers"
            />
          </InspectorFieldRow>
        </InspectorDivision>

        {/* COLUMNS SECTION */}
        <InspectorDivision title="COLUMNS">
          <InspectorFieldRow label="Phone Portrait">
            <InspectorSelect value={String(rawBlock.columnsPhonePortrait ?? "1")} options={columnOptions.filter((option) => option.value !== "inherit")} onChange={(value) => update({ columnsPhonePortrait: value } as any)} />
          </InspectorFieldRow>
          <InspectorFieldRow label="Phone Landscape">
            <InspectorSelect value={String(rawBlock.columnsPhoneLandscape ?? "inherit")} options={columnOptions} onChange={(value) => update({ columnsPhoneLandscape: value === "inherit" ? undefined : value } as any)} />
          </InspectorFieldRow>
          <InspectorFieldRow
            label="Tablet Landscape"
            isOverridden={rawBlock.columnsTabletLandscape !== undefined}
            inheritedValueText="3 Columns"
            onReset={() => update({ columnsTabletLandscape: undefined } as any)}
          >
            <InspectorSelect
              value={String(rawBlock.columnsTabletLandscape ?? "inherit")}
              options={columnOptions}
              onChange={(value) => update({ columnsTabletLandscape: value === "inherit" ? undefined : value } as any)}
            />
          </InspectorFieldRow>
          <InspectorFieldRow label="Desktop">
            <InspectorSelect value={String(rawBlock.columnsDesktop ?? "inherit")} options={columnOptions} onChange={(value) => update({ columnsDesktop: value === "inherit" ? undefined : value } as any)} />
          </InspectorFieldRow>
          <InspectorFieldRow label="Large Screens">
            <InspectorSelect value={String(rawBlock.columnsLargeScreens ?? "inherit")} options={columnOptions} onChange={(value) => update({ columnsLargeScreens: value === "inherit" ? undefined : value } as any)} />
          </InspectorFieldRow>
          <InspectorFieldRow label="Column alignment">
            <InspectorSwitch checked={rawBlock.centerColumns === true} onChange={(centerColumns) => update({ centerColumns } as any)} label="Center columns" />
          </InspectorFieldRow>
        </InspectorDivision>

        {/* LIGHTBOX SECTION */}
        <InspectorDivision title="LIGHTBOX">
          <InspectorFieldRow
            label="Lightbox"
            isOverridden={rawBlock.enableLightbox !== undefined && rawBlock.enableLightbox !== true}
            inheritedValueText="Enabled"
            onReset={() => update({ enableLightbox: true } as any)}
          >
            <InspectorSwitch
              checked={rawBlock.enableLightbox !== false}
              onChange={(checked) => update({ enableLightbox: checked } as any)}
              label="Enable lightbox gallery"
            />
          </InspectorFieldRow>
        </InspectorDivision>

        {isImportedYoothemeGallery && (
          <InspectorDivision title="ITEM">
            <InspectorFieldRow
              label="Link"
              isOverridden={rawBlock.overlayLink !== undefined}
              inheritedValueText="Off"
              onReset={() => update({ overlayLink: undefined } as any)}
            >
              <InspectorSwitch
                checked={rawBlock.overlayLink === true}
                onChange={(overlayLink) => update({ overlayLink } as any)}
                label="Link overlay"
              />
            </InspectorFieldRow>
          </InspectorDivision>
        )}

        {/* OVERLAY SECTION */}
        <InspectorDivision title="OVERLAY">
          <InspectorFieldRow
            label="Mode"
            isOverridden={rawBlock.overlayMode !== undefined && rawBlock.overlayMode !== "cover"}
            inheritedValueText="Cover"
            onReset={() => update({ overlayMode: undefined } as any)}
          >
            <InspectorSelect
              value={rawBlock.overlayMode ?? "cover"}
              options={[
                { value: "cover", label: "Cover" },
                { value: "caption", label: "Caption" },
              ]}
              onChange={(overlayMode) => update({ overlayMode } as any)}
            />
          </InspectorFieldRow>
          <InspectorFieldRow
            label="Style"
            isOverridden={rawBlock.overlayStyle !== undefined && rawBlock.overlayStyle !== "overlay-primary"}
            inheritedValueText="Overlay Primary"
            onReset={() => update({ overlayStyle: undefined } as any)}
          >
            <InspectorSelect
              value={rawBlock.overlayStyle ?? "overlay-primary"}
              options={[
                { value: "none", label: "None" },
                { value: "overlay-default", label: "Overlay Default" },
                { value: "overlay-primary", label: "Overlay Primary" },
                { value: "tile-default", label: "Tile Default" },
                { value: "tile-muted", label: "Tile Muted" },
                { value: "tile-primary", label: "Tile Primary" },
                { value: "tile-secondary", label: "Tile Secondary" },
              ]}
              onChange={(overlayStyle) => update({ overlayStyle } as any)}
            />
          </InspectorFieldRow>
          <InspectorFieldRow label="Position">
            <InspectorSelect value={rawBlock.overlayPosition ?? "center"} options={[
              { value: "top-left", label: "Top Left" }, { value: "top", label: "Top Center" }, { value: "top-right", label: "Top Right" },
              { value: "left", label: "Center Left" }, { value: "center", label: "Center" }, { value: "right", label: "Center Right" },
              { value: "bottom-left", label: "Bottom Left" }, { value: "bottom", label: "Bottom Center" }, { value: "bottom-right", label: "Bottom Right" },
            ]} onChange={(overlayPosition) => update({ overlayPosition } as any)} />
          </InspectorFieldRow>
          <InspectorFieldRow label="Padding">
            <InspectorSelect value={rawBlock.overlayPadding ?? "default"} options={[{ value: "none", label: "None" }, { value: "small", label: "Small" }, { value: "default", label: "Default" }, { value: "large", label: "Large" }]} onChange={(overlayPadding) => update({ overlayPadding } as any)} />
          </InspectorFieldRow>
          <InspectorFieldRow label="Margin">
            <InspectorSelect value={rawBlock.overlayMargin ?? "none"} options={[{ value: "none", label: "None" }, { value: "small", label: "Small" }, { value: "default", label: "Default" }, { value: "large", label: "Large" }]} onChange={(overlayMargin) => update({ overlayMargin } as any)} />
          </InspectorFieldRow>
          <InspectorFieldRow label="Display">
            <InspectorSwitch checked={rawBlock.overlayHover === true} onChange={(overlayHover) => update({ overlayHover } as any)} label="Show on hover" />
          </InspectorFieldRow>
          <InspectorFieldRow label="Transition">
            <InspectorSelect value={rawBlock.overlayTransition ?? "fade"} options={[{ value: "fade", label: "Fade" }, { value: "scale-up", label: "Scale Up" }, { value: "scale-down", label: "Scale Down" }, { value: "slide-top", label: "Slide Top" }, { value: "slide-bottom", label: "Slide Bottom" }, { value: "slide-left", label: "Slide Left" }, { value: "slide-right", label: "Slide Right" }]} onChange={(overlayTransition) => update({ overlayTransition } as any)} />
          </InspectorFieldRow>
          <InspectorFieldRow label="Text color">
            <InspectorSelect value={rawBlock.overlayTextColor ?? "none"} options={[{ value: "none", label: "None" }, { value: "light", label: "Light" }, { value: "dark", label: "Dark" }]} onChange={(overlayTextColor) => update({ overlayTextColor } as any)} />
          </InspectorFieldRow>
        </InspectorDivision>

        {/* SHARED IMAGE SETTINGS GROUP */}
        <ImageSettingsGroup
          block={block}
          update={update}
          // YOOtheme Gallery's Image group is media-generation semantics, not
          // the generic WebPages frame/focal/alignment surface.
          showFrameControls={!isImportedYoothemeGallery}
          showFocalPoint={!isImportedYoothemeGallery}
          showAlignment={!isImportedYoothemeGallery}
          showDecoration={!isImportedYoothemeGallery}
        />

        {/* SHARED TITLE SETTINGS GROUP */}
        <TitleSettingsGroup block={block} update={update} />

        {/* SHARED META SETTINGS GROUP */}
        <MetaSettingsGroup block={block} update={update} showStyle />

        {/* SHARED CONTENT SETTINGS GROUP */}
        <ContentSettingsGroup block={block} update={update} showStyle />

        {/* SHARED LINK SETTINGS GROUP */}
        <LinkSettingsGroup block={block} update={update} />
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // TAB 3: ADVANCED
  // --------------------------------------------------------------------------
  if (tab === "advanced") {
    return <ElementAdvancedPanel block={block} update={update} />;
  }

  return null;
}
