"use client";

import React from "react";
import type { BuilderLayoutBlock, InspectorTab } from "@/components/dashboard/builderTypes";
import type { BuilderShellSettings } from "@/lib/builderShell";
import {
  InspectorFieldRow,
  InspectorSection,
  InspectorSelect,
  InspectorSwitch,
  InspectorTextField,
  InspectorTextarea,
} from "@/components/dashboard/inspector/InspectorControls";
import RepeatableItemShell from "@/components/dashboard/inspector/RepeatableItemShell";

type Props = {
  block: BuilderLayoutBlock;
  tab: InspectorTab;
  shellSettings: BuilderShellSettings;
  update: (patch: Partial<BuilderLayoutBlock>) => void;
};

const opts = (arr: readonly string[]) =>
  arr.map((v) => ({
    value: v,
    label: v.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
  }));

export default function GridCapabilityPanel({ block, tab, shellSettings, update }: Props) {
  const raw = block as any;
  const items = block.gridItems ?? [];

  if (tab === "content") {
    return (
      <div className="builder-inspector-stack" data-uikit-capability="grid-content">
        <InspectorSection title="ITEMS">
          <RepeatableItemShell
            items={items}
            getItemKey={(item, index) => item.id || `item-${index}`}
            itemLabel="Item"
            itemDataAttribute="data-grid-item-id"
            getItemSummary={(item) => item.title || "Untitled Item"}
            onAdd={() => {
              const newItem = { id: `item-${Date.now()}`, title: `Item ${items.length + 1}`, text: "New Grid Item Description" };
              update({ gridItems: [...items, newItem] });
              return newItem.id;
            }}
            onCopy={(index) => {
              const source = items[index];
              if (!source) return;
              const copy = { ...source, id: `item-${Date.now()}`, title: `${source.title} (Copy)` };
              const next = [...items];
              next.splice(index + 1, 0, copy);
              update({ gridItems: next });
            }}
            onDelete={(index) => {
              update({ gridItems: items.filter((_, i) => i !== index) });
            }}
            onReorder={(source, target) => {
              const next = [...items];
              const [moved] = next.splice(source, 1);
              next.splice(target, 0, moved);
              update({ gridItems: next });
            }}
            renderItem={(item, index) => (
              <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "6px" }}>
                <InspectorFieldRow label="Title">
                  <InspectorTextField
                    value={item.title || ""}
                    onChange={(val) => {
                      const next = [...items];
                      next[index] = { ...next[index], title: val };
                      update({ gridItems: next });
                    }}
                  />
                </InspectorFieldRow>
                <InspectorFieldRow label="Meta">
                  <InspectorTextField
                    value={item.meta || ""}
                    onChange={(val) => {
                      const next = [...items];
                      next[index] = { ...next[index], meta: val };
                      update({ gridItems: next });
                    }}
                  />
                </InspectorFieldRow>
                <InspectorFieldRow label="Content">
                  <InspectorTextarea
                    value={item.text || ""}
                    onChange={(val) => {
                      const next = [...items];
                      next[index] = { ...next[index], text: val };
                      update({ gridItems: next });
                    }}
                  />
                </InspectorFieldRow>
                <InspectorFieldRow label="Image URL">
                  <InspectorTextField
                    value={item.imageUrl || ""}
                    onChange={(val) => {
                      const next = [...items];
                      next[index] = { ...next[index], imageUrl: val };
                      update({ gridItems: next });
                    }}
                  />
                </InspectorFieldRow>
                <InspectorFieldRow label="Link URL">
                  <InspectorTextField
                    value={item.buttonUrl || ""}
                    onChange={(val) => {
                      const next = [...items];
                      next[index] = { ...next[index], buttonUrl: val };
                      update({ gridItems: next });
                    }}
                  />
                </InspectorFieldRow>
              </div>
            )}
          />
        </InspectorSection>

        <InspectorSection title="DISPLAY">
          <InspectorFieldRow label="Show the title">
            <InspectorSwitch checked={raw.showTitle !== false} onChange={(checked) => update({ showTitle: checked } as any)} />
          </InspectorFieldRow>
          <InspectorFieldRow label="Show the meta text">
            <InspectorSwitch checked={raw.showMeta !== false} onChange={(checked) => update({ showMeta: checked } as any)} />
          </InspectorFieldRow>
          <InspectorFieldRow label="Show the content">
            <InspectorSwitch checked={raw.showContent !== false} onChange={(checked) => update({ showContent: checked } as any)} />
          </InspectorFieldRow>
          <InspectorFieldRow label="Show the image">
            <InspectorSwitch checked={raw.showImage !== false} onChange={(checked) => update({ showImage: checked } as any)} />
          </InspectorFieldRow>
          <InspectorFieldRow label="Show the video">
            <InspectorSwitch checked={raw.showVideo ?? false} onChange={(checked) => update({ showVideo: checked } as any)} />
          </InspectorFieldRow>
          <InspectorFieldRow label="Show the link">
            <InspectorSwitch checked={raw.showLink !== false} onChange={(checked) => update({ showLink: checked } as any)} />
          </InspectorFieldRow>
          <InspectorFieldRow label="Show hover image">
            <InspectorSwitch checked={raw.showHoverImage ?? false} onChange={(checked) => update({ showHoverImage: checked } as any)} />
          </InspectorFieldRow>
          <InspectorFieldRow label="Show hover video">
            <InspectorSwitch checked={raw.showHoverVideo ?? false} onChange={(checked) => update({ showHoverVideo: checked } as any)} />
          </InspectorFieldRow>
        </InspectorSection>
      </div>
    );
  }

  if (tab === "style") {
    return (
      <div className="builder-inspector-stack" data-uikit-capability="grid-settings">
        {/* 1. GRID SECTION */}
        <InspectorSection title="GRID">
          <InspectorFieldRow label="Masonry">
            <InspectorSelect value={raw.gridMasonry ?? "none"} options={opts(["none", "2-columns", "3-columns", "4-columns", "pack"])} onChange={(v) => update({ gridMasonry: v } as any)} />
          </InspectorFieldRow>
          <InspectorFieldRow label="Column Gap">
            <InspectorSelect value={raw.columnGap ?? "default"} options={opts(["none", "small", "medium", "default", "large", "xlarge"])} onChange={(v) => update({ columnGap: v } as any)} />
          </InspectorFieldRow>
          <InspectorFieldRow label="Row Gap">
            <InspectorSelect value={raw.rowGap ?? "default"} options={opts(["none", "small", "medium", "default", "large", "xlarge"])} onChange={(v) => update({ rowGap: v } as any)} />
          </InspectorFieldRow>
          <InspectorFieldRow label="Divider">
            <InspectorSwitch checked={raw.showDividers ?? false} onChange={(c) => update({ showDividers: c } as any)} label="Show dividers" />
          </InspectorFieldRow>
          <InspectorFieldRow label="Alignment">
            <InspectorSwitch checked={raw.centerColumns ?? false} onChange={(c) => update({ centerColumns: c } as any)} label="Center columns" />
          </InspectorFieldRow>
        </InspectorSection>

        {/* 2. COLUMNS SECTION */}
        <InspectorSection title="COLUMNS">
          <InspectorFieldRow label="Phone Portrait">
            <InspectorSelect value={raw.columnsPhonePortrait ?? "auto"} options={opts(["auto", "1-column", "2-columns"])} onChange={(v) => update({ columnsPhonePortrait: v } as any)} />
          </InspectorFieldRow>
          <InspectorFieldRow label="Phone Landscape">
            <InspectorSelect value={raw.columnsPhoneLandscape ?? "inherit"} options={opts(["inherit", "1-column", "2-columns", "3-columns"])} onChange={(v) => update({ columnsPhoneLandscape: v } as any)} />
          </InspectorFieldRow>
          <InspectorFieldRow label="Tablet Landscape">
            <InspectorSelect value={raw.columnsTabletLandscape ?? "inherit"} options={opts(["inherit", "2-columns", "3-columns", "4-columns"])} onChange={(v) => update({ columnsTabletLandscape: v } as any)} />
          </InspectorFieldRow>
          <InspectorFieldRow label="Desktop">
            <InspectorSelect value={raw.columnsDesktop ?? "inherit"} options={opts(["inherit", "3-columns", "4-columns", "5-columns", "6-columns"])} onChange={(v) => update({ columnsDesktop: v } as any)} />
          </InspectorFieldRow>
          <InspectorFieldRow label="Large Screens">
            <InspectorSelect value={raw.columnsLargeScreens ?? "inherit"} options={opts(["inherit", "4-columns", "5-columns", "6-columns"])} onChange={(v) => update({ columnsLargeScreens: v } as any)} />
          </InspectorFieldRow>
        </InspectorSection>

        {/* 3. FILTER SECTION */}
        <InspectorSection title="FILTER">
          <InspectorFieldRow label="Filter">
            <InspectorSwitch checked={raw.enableFilter ?? false} onChange={(c) => update({ enableFilter: c } as any)} label="Enable filter navigation" />
          </InspectorFieldRow>
          {raw.enableFilter && (
            <>
              <InspectorFieldRow label="Animation">
                <InspectorSelect value={raw.filterAnimation ?? "slide"} options={opts(["slide", "fade", "delayed-rise"])} onChange={(v) => update({ filterAnimation: v } as any)} />
              </InspectorFieldRow>
              <InspectorFieldRow label="Style">
                <InspectorSelect value={raw.filterStyle ?? "tabs"} options={opts(["tabs", "subnav", "pill"])} onChange={(v) => update({ filterStyle: v } as any)} />
              </InspectorFieldRow>
            </>
          )}
        </InspectorSection>

        {/* 4. LIGHTBOX SECTION */}
        <InspectorSection title="LIGHTBOX">
          <InspectorFieldRow label="Lightbox">
            <InspectorSwitch checked={raw.enableLightbox ?? false} onChange={(c) => update({ enableLightbox: c } as any)} label="Enable lightbox gallery" />
          </InspectorFieldRow>
          {raw.enableLightbox && (
            <>
              <InspectorFieldRow label="Animation">
                <InspectorSelect value={raw.lightboxAnimation ?? "slide"} options={opts(["slide", "fade", "scale"])} onChange={(v) => update({ lightboxAnimation: v } as any)} />
              </InspectorFieldRow>
              <InspectorFieldRow label="Navigation">
                <InspectorSelect value={raw.lightboxNav ?? "slidenav"} options={opts(["slidenav", "thumbnav", "dotnav"])} onChange={(v) => update({ lightboxNav: v } as any)} />
              </InspectorFieldRow>
            </>
          )}
        </InspectorSection>

        {/* 5. PANEL SECTION */}
        <InspectorSection title="PANEL">
          <InspectorFieldRow label="Style">
            <InspectorSelect value={raw.panelStyle ?? raw.gridCardVariant ?? "none"} options={opts(["none", "card-default", "card-primary", "card-secondary", "tile-default", "tile-primary", "tile-secondary"])} onChange={(v) => update({ panelStyle: v, gridCardVariant: v } as any)} />
          </InspectorFieldRow>
          <InspectorFieldRow label="Link">
            <InspectorSwitch checked={raw.linkPanel ?? false} onChange={(c) => update({ linkPanel: c } as any)} label="Link panel" />
          </InspectorFieldRow>

          <InspectorFieldRow label="Padding">
            <InspectorSelect value={raw.panelPadding ?? "none"} options={opts(["none", "small", "default", "large"])} onChange={(v) => update({ panelPadding: v } as any)} />
          </InspectorFieldRow>
          <InspectorFieldRow label="Max Width">
            <InspectorSelect value={raw.panelMaxWidth ?? "none"} options={opts(["none", "small", "medium", "large", "xlarge"])} onChange={(v) => update({ panelMaxWidth: v } as any)} />
          </InspectorFieldRow>
        </InspectorSection>

        {/* 6. TITLE SECTION */}
        <InspectorSection title="TITLE">
          <InspectorFieldRow label="Style">
            <InspectorSelect value={raw.titleStyle ?? "none"} options={opts(["none", "heading-primary", "heading-hero", "h1", "h2", "h3", "h4", "h5", "h6"])} onChange={(v) => update({ titleStyle: v } as any)} />
          </InspectorFieldRow>
          <InspectorFieldRow label="Link">
            <InspectorSwitch checked={raw.linkTitle ?? false} onChange={(c) => update({ linkTitle: c } as any)} label="Link title" />
          </InspectorFieldRow>
          <InspectorFieldRow label="Decoration">
            <InspectorSelect value={raw.titleDecoration ?? "none"} options={opts(["none", "divider", "bullet", "line"])} onChange={(v) => update({ titleDecoration: v } as any)} />
          </InspectorFieldRow>
          <InspectorFieldRow label="HTML Element">
            <InspectorSelect value={block.headingLevel ?? "h3"} options={opts(["h1", "h2", "h3", "h4", "h5", "h6", "div"])} onChange={(v) => update({ headingLevel: v as any })} />
          </InspectorFieldRow>
          <InspectorFieldRow label="Alignment">
            <InspectorSelect value={raw.titleAlignment ?? "top"} options={opts(["top", "bottom", "left", "right"])} onChange={(v) => update({ titleAlignment: v } as any)} />
          </InspectorFieldRow>
          <InspectorFieldRow label="Margin Top">
            <InspectorSelect value={raw.titleMarginTop ?? "default"} options={opts(["default", "small", "medium", "large", "none"])} onChange={(v) => update({ titleMarginTop: v } as any)} />
          </InspectorFieldRow>
        </InspectorSection>

        {/* 7. META SECTION */}
        <InspectorSection title="META">
          <InspectorFieldRow label="Style">
            <InspectorSelect value={raw.metaStyle ?? "text-meta"} options={opts(["text-meta", "text-muted", "text-primary", "text-secondary"])} onChange={(v) => update({ metaStyle: v } as any)} />
          </InspectorFieldRow>
          <InspectorFieldRow label="Alignment">
            <InspectorSelect value={raw.metaAlignment ?? "below-title"} options={opts(["below-title", "above-title", "below-content"])} onChange={(v) => update({ metaAlignment: v } as any)} />
          </InspectorFieldRow>
          <InspectorFieldRow label="Margin Top">
            <InspectorSelect value={raw.metaMarginTop ?? "default"} options={opts(["default", "small", "medium", "large", "none"])} onChange={(v) => update({ metaMarginTop: v } as any)} />
          </InspectorFieldRow>
        </InspectorSection>

        {/* 8. CONTENT SECTION */}
        <InspectorSection title="CONTENT">
          <InspectorFieldRow label="Style">
            <InspectorSelect value={raw.contentStyle ?? "none"} options={opts(["none", "text-lead", "text-meta", "text-small", "text-large", "text-muted"])} onChange={(v) => update({ contentStyle: v } as any)} />
          </InspectorFieldRow>
          <InspectorFieldRow label="Margin Top">
            <InspectorSelect value={raw.contentMarginTop ?? "default"} options={opts(["default", "small", "medium", "large", "none"])} onChange={(v) => update({ contentMarginTop: v } as any)} />
          </InspectorFieldRow>
        </InspectorSection>

        {/* 9. IMAGE SECTION */}
        <InspectorSection title="IMAGE">
          <InspectorFieldRow label="Loading">
            <InspectorSwitch checked={raw.imageLoading ?? false} onChange={(c) => update({ imageLoading: c } as any)} label="Load image eagerly" />
          </InspectorFieldRow>
          <InspectorFieldRow label="Border">
            <InspectorSelect value={raw.imageBorder ?? "none"} options={opts(["none", "rounded", "circle"])} onChange={(v) => update({ imageBorder: v } as any)} />
          </InspectorFieldRow>
          <InspectorFieldRow label="Box Shadow">
            <InspectorSelect value={raw.imageBoxShadow ?? "none"} options={opts(["none", "small", "medium", "large", "xlarge"])} onChange={(v) => update({ imageBoxShadow: v } as any)} />
          </InspectorFieldRow>
          <InspectorFieldRow label="Link">
            <InspectorSwitch checked={raw.linkImage ?? false} onChange={(c) => update({ linkImage: c } as any)} label="Link image" />
          </InspectorFieldRow>
          <InspectorFieldRow label="Hover Transition">
            <InspectorSelect value={raw.imageHoverTransition ?? "none"} options={opts(["none", "scale-up", "scale-down"])} onChange={(v) => update({ imageHoverTransition: v } as any)} />
          </InspectorFieldRow>
          <InspectorFieldRow label="Align Image">
            <InspectorSwitch checked={raw.alignImageWithoutPadding ?? (block.gridImagePadding === "frameless")} onChange={(c) => update({ alignImageWithoutPadding: c, gridImagePadding: c ? "frameless" : "none" } as any)} label="Align image without padding" />
          </InspectorFieldRow>
          <InspectorFieldRow label="Alignment">
            <InspectorSelect value={raw.imageAlignment ?? "top"} options={opts(["top", "bottom", "left", "right"])} onChange={(v) => update({ imageAlignment: v } as any)} />
          </InspectorFieldRow>
          <InspectorFieldRow label="Margin Top">
            <InspectorSelect value={raw.imageMarginTop ?? "default"} options={opts(["default", "small", "medium", "large", "none"])} onChange={(v) => update({ imageMarginTop: v } as any)} />
          </InspectorFieldRow>
        </InspectorSection>

        {/* 10. LINK SECTION */}
        <InspectorSection title="LINK">
          <InspectorFieldRow label="Target">
            <InspectorSwitch checked={raw.linkTarget === "_blank"} onChange={(c) => update({ linkTarget: c ? "_blank" : "_self" } as any)} label="Open in a new window" />
          </InspectorFieldRow>
          <InspectorFieldRow label="Text">
            <InspectorTextField value={raw.linkText ?? "Read more"} onChange={(v) => update({ linkText: v } as any)} />
          </InspectorFieldRow>
          <InspectorFieldRow label="Style">
            <InspectorSelect value={raw.linkStyle ?? "button-default"} options={opts(["button-default", "button-primary", "button-secondary", "button-danger", "link-muted", "link-text"])} onChange={(v) => update({ linkStyle: v } as any)} />
          </InspectorFieldRow>
          <InspectorFieldRow label="Button Size">
            <InspectorSelect value={raw.linkButtonSize ?? "default"} options={opts(["default", "small", "large"])} onChange={(v) => update({ linkButtonSize: v } as any)} />
          </InspectorFieldRow>
          <InspectorFieldRow label="Full Width">
            <InspectorSwitch checked={raw.linkFullWidth ?? false} onChange={(c) => update({ linkFullWidth: c } as any)} label="Full width button" />
          </InspectorFieldRow>
          <InspectorFieldRow label="Margin Top">
            <InspectorSelect value={raw.linkMarginTop ?? "default"} options={opts(["default", "small", "medium", "large", "none"])} onChange={(v) => update({ linkMarginTop: v } as any)} />
          </InspectorFieldRow>
        </InspectorSection>

        {/* 11. GENERAL SECTION */}
        <InspectorSection title="GENERAL">
          <InspectorFieldRow label="Position">
            <InspectorSelect value={raw.position ?? "static"} options={opts(["static", "relative", "absolute", "fixed"])} onChange={(v) => update({ position: v } as any)} />
          </InspectorFieldRow>
          <InspectorFieldRow label="Margin">
            <InspectorSelect value={raw.margin ?? "default"} options={opts(["default", "small", "medium", "large", "xlarge", "none"])} onChange={(v) => update({ margin: v } as any)} />
          </InspectorFieldRow>
          <InspectorFieldRow label="Max Width">
            <InspectorSelect value={raw.maxWidth ?? "none"} options={opts(["none", "small", "medium", "large", "xlarge", "2xlarge"])} onChange={(v) => update({ maxWidth: v } as any)} />
          </InspectorFieldRow>
          <InspectorFieldRow label="Text Alignment">
            <InspectorSelect value={raw.textAlignment ?? "left"} options={opts(["left", "center", "right", "justify"])} onChange={(v) => update({ textAlignment: v } as any)} />
          </InspectorFieldRow>
          <InspectorFieldRow label="Animation">
            <InspectorSelect value={raw.animation ?? "inherit"} options={opts(["inherit", "none", "fade", "scale-up", "scale-down", "slide-top", "slide-bottom", "slide-left", "slide-right"])} onChange={(v) => update({ animation: v } as any)} />
          </InspectorFieldRow>
          <InspectorFieldRow label="Visibility">
            <InspectorSelect value={raw.visibility ?? "always"} options={opts(["always", "visible-s", "visible-m", "visible-l", "hidden-s", "hidden-m", "hidden-l"])} onChange={(v) => update({ visibility: v } as any)} />
          </InspectorFieldRow>
        </InspectorSection>
      </div>
    );
  }

  return null;
}
