"use client";

import type { InspectorTab, BuilderLayoutBlock, WordPressMediaItem } from "@/components/dashboard/builderTypes";
import { BUILDER_LINK_TARGET_OPTIONS } from "@/lib/websiteBuilderLinks";
import { BuilderImageUrlControl } from "./InspectorSharedControls";
import {
  InspectorDivision,
  InspectorFieldRow,
  InspectorTextField,
  InspectorTextarea,
  InspectorSelect,
  InspectorSwitch,
  inspectorDynamicBinding,
} from "@/components/dashboard/inspector/InspectorControls";
import { ImageSettingsGroup, TitleSettingsGroup, MetaSettingsGroup, ContentSettingsGroup } from "@/components/dashboard/inspector/panels/SharedSettingGroups";
import type { BuilderShellSettings } from "@/lib/builderShell";
import { UIKIT_YOOTHEME_SVG_COLOR_OPTIONS } from "@/lib/uikitTokens";

type Props = {
  block: BuilderLayoutBlock;
  tab: InspectorTab;
  shellSettings: BuilderShellSettings;
  update: (patch: Partial<BuilderLayoutBlock>) => void;
  openWordPressMediaPicker: (options: { title: string; currentUrl?: string; onSelect: (media: WordPressMediaItem) => void }) => void;
};

export default function ImageCapabilityPanel({ block, tab, shellSettings, update, openWordPressMediaPicker }: Props) {
  const image = block;
  const isHeaderLogo = image.id === "header-logo" || image.headerBrandMode !== undefined;
  const isOverlay = image.kind === "overlay";
  // CONTENT TAB
  if (tab === "content") {
    return (
      <div className="builder-inspector-stack" data-uikit-capability="image-content">
        {isHeaderLogo && (
          <InspectorDivision title="HEADER LOGO">
            <InspectorFieldRow label="Presentation">
              <InspectorSelect
                value={image.headerBrandMode ?? (image.imageUrl ? "logo" : "brand")}
                options={[
                  { value: "logo", label: "Logo only" },
                  { value: "brand", label: "Text brand" },
                  { value: "both", label: "Logo + text" },
                ]}
                onChange={(value) => update({ headerBrandMode: value as BuilderLayoutBlock["headerBrandMode"] })}
                ariaLabel="Header logo presentation"
              />
            </InspectorFieldRow>
            <InspectorFieldRow label="Brand text">
              <InspectorTextField
                value={image.headerBrandText ?? ""}
                onChange={(value) => update({ headerBrandText: value })}
                placeholder="WebPages"
                ariaLabel="Header brand text"
              />
            </InspectorFieldRow>
          </InspectorDivision>
        )}
        <InspectorDivision title="IMAGE">
          <InspectorFieldRow label="Image source" dynamicBinding={inspectorDynamicBinding(block, update, "imageUrl")}>
            <BuilderImageUrlControl
              value={image.imageUrl ?? ""}
              onChange={(event) => update({ imageUrl: event.target.value })}
              onChoose={() =>
                openWordPressMediaPicker({
                  title: "Image Block",
                  currentUrl: image.imageUrl ?? undefined,
                  onSelect: (media) =>
                    update({
                      imageUrl: media.sourceUrl,
                      imageAlt: image.imageAlt || media.altText || media.title || "",
                    }),
                })
              }
            />
          </InspectorFieldRow>
          {isOverlay && (
            <InspectorFieldRow label="Video">
              <BuilderImageUrlControl
                value={image.videoUrl ?? ""}
                placeholder="https://... or /uploads/video.mp4"
                chooseLabel="Library"
                onChange={(event) => update({ videoUrl: event.target.value })}
                onChoose={() => openWordPressMediaPicker({ title: "Overlay Video", currentUrl: image.videoUrl, onSelect: (media) => update({ videoUrl: media.sourceUrl }) })}
              />
            </InspectorFieldRow>
          )}
          <InspectorFieldRow label="Alt text" dynamicBinding={inspectorDynamicBinding(block, update, "imageAlt")}>
            <InspectorTextField
              value={image.imageAlt ?? ""}
              onChange={(value) => update({ imageAlt: value })}
              ariaLabel="Image Alt Text"
            />
          </InspectorFieldRow>
          {isOverlay && (
            <>
            <InspectorFieldRow label="Title" dynamicBinding={inspectorDynamicBinding(block, update, "title")}>
              <InspectorTextField value={image.title ?? ""} onChange={(value) => update({ title: value })} ariaLabel="Overlay title" />
            </InspectorFieldRow>
            <InspectorFieldRow label="Meta" dynamicBinding={inspectorDynamicBinding(block, update, "meta")}>
              <InspectorTextField value={image.meta ?? ""} onChange={(value) => update({ meta: value })} ariaLabel="Overlay meta" />
            </InspectorFieldRow>
            <InspectorFieldRow label="Content" dynamicBinding={inspectorDynamicBinding(block, update, "body")}>
              <InspectorTextarea value={image.body ?? ""} onChange={(value) => update({ body: value })} ariaLabel="Overlay content" />
            </InspectorFieldRow>
            <InspectorFieldRow label="Hover Image">
              <BuilderImageUrlControl
                value={image.hoverImageUrl ?? ""}
                onChange={(event) => update({ hoverImageUrl: event.target.value })}
                onChoose={() =>
                  openWordPressMediaPicker({
                    title: "Overlay Hover Image",
                    currentUrl: image.hoverImageUrl ?? undefined,
                    onSelect: (media) => update({ hoverImageUrl: media.sourceUrl }),
                  })
                }
              />
            </InspectorFieldRow>
            </>
          )}
          <InspectorFieldRow label="Width / Height">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", width: "100%" }}>
              <InspectorTextField
                value={String(isOverlay ? image.imageIntrinsicWidth ?? String(image.imageWidth ?? "").replace(/px$/i, "") : image.imageWidth ?? (isHeaderLogo ? image.imageMaxWidth ?? "" : ""))}
                placeholder="Width"
                onChange={(value) => update(isOverlay ? { imageIntrinsicWidth: value ? Number(value) : undefined, imageWidth: value ? `${value}px` : undefined } : { imageWidth: value || undefined })}
                ariaLabel="Image width"
              />
              <InspectorTextField
                value={String(isOverlay ? image.imageIntrinsicHeight ?? String(image.imageHeight ?? "").replace(/px$/i, "") : image.imageHeight ?? "")}
                placeholder="Height"
                onChange={(value) => update(isOverlay ? { imageIntrinsicHeight: value ? Number(value) : undefined, imageHeight: undefined } : { imageHeight: value || undefined })}
                ariaLabel="Image height"
              />
            </div>
          </InspectorFieldRow>
          <InspectorFieldRow label="Caption">
            <InspectorTextField
              value={image.imageCaption ?? ""}
              onChange={(value) => update({ imageCaption: value })}
              placeholder="Optional caption"
              ariaLabel="Image Caption"
            />
          </InspectorFieldRow>
        </InspectorDivision>

        <InspectorDivision title="LINK">
          <InspectorFieldRow label="Link URL">
            <InspectorTextField
              value={image.imageLinkUrl ?? ""}
              onChange={(value) => update({ imageLinkUrl: value })}
              placeholder="Optional link"
              ariaLabel="Image Link URL"
            />
          </InspectorFieldRow>
          <InspectorFieldRow label="Link Target">
            <InspectorSelect
              value={(image.imageLinkTarget ?? "_self") as "_self" | "_blank"}
              options={BUILDER_LINK_TARGET_OPTIONS}
              onChange={(value) => update({ imageLinkTarget: value })}
              ariaLabel="Image link target"
            />
          </InspectorFieldRow>
          {isOverlay && (
            <>
              <InspectorFieldRow label="Link Text"><InspectorTextField value={image.linkText ?? ""} onChange={(value) => update({ linkText: value })} ariaLabel="Overlay link text" /></InspectorFieldRow>
              <InspectorFieldRow label="Link ARIA Label"><InspectorTextField value={image.linkAriaLabel ?? ""} onChange={(value) => update({ linkAriaLabel: value })} ariaLabel="Overlay link ARIA label" /></InspectorFieldRow>
            </>
          )}
        </InspectorDivision>
      </div>
    );
  }

  // ADVANCED TAB
  if (tab === "advanced") {
    return (
      <div className="builder-inspector-stack" data-uikit-capability="image-advanced">
        <InspectorDivision title="ADVANCED">
          <InspectorFieldRow label="ID">
            <InspectorTextField
              value={(block as any).customId ?? block.id ?? ""}
              onChange={(v) => update({ customId: v, id: v } as any)}
              placeholder="e.g. hero-image"
              ariaLabel="Custom ID"
            />
          </InspectorFieldRow>
          <InspectorFieldRow label="Class">
            <InspectorTextField
              value={(block as any).customClass ?? ""}
              onChange={(v) => update({ customClass: v } as any)}
              placeholder="e.g. my-custom-image"
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
    <div className="builder-inspector-stack" data-uikit-capability="image-style">
      <ImageSettingsGroup
        block={block}
        update={update}
        showDimensions={false}
        showFrameControls={false}
        showAlignment={false}
        loadingCheckbox
        showInverse
        showSvgAnimate
        showHeightControls
        showTextColor
        showHoverShadow
        disableHoverShadow={!image.imageLinkUrl}
        hoverShadowOptions={[
          { value: "none", label: "None" },
          { value: "small", label: "Small" },
          { value: "medium", label: "Medium" },
          { value: "large", label: "Large" },
          { value: "xlarge", label: "X-Large" },
        ]}
        showSvgControls
        showSvgColorWhenInlineDisabled
        svgColorLabel="SVG Color"
        svgColorOptions={UIKIT_YOOTHEME_SVG_COLOR_OPTIONS}
      />
      {isOverlay && (
        <InspectorDivision title="OVERLAY BEHAVIOR">
          <InspectorFieldRow label="HTML Element">
            <InspectorSelect value={image.htmlElement ?? "div"} onChange={(value) => update({ htmlElement: value })} options={["div", "address", "article", "aside", "footer", "header", "hgroup", "nav", "section"].map((value) => ({ value, label: value }))} ariaLabel="Overlay HTML element" />
          </InspectorFieldRow>
          <InspectorFieldRow label="Height">
            <InspectorSwitch checked={image.containerHeightExpand === true} onChange={(checked) => update({ containerHeightExpand: checked })} label="Fill the available column space" />
          </InspectorFieldRow>
          <InspectorFieldRow label="Min Height">
            <InspectorTextField value={String(image.imageMinHeight ?? "").replace(/px$/i, "")} onChange={(value) => update({ imageMinHeight: value ? `${value}px` : undefined })} placeholder="auto" ariaLabel="Overlay minimum height" />
          </InspectorFieldRow>
          <InspectorFieldRow label="Style">
            <InspectorSelect value={image.overlayStyle ?? "overlay-primary"} onChange={(value) => update({ overlayStyle: value })} options={[{ value: "none", label: "None" }, { value: "overlay-default", label: "Overlay Default" }, { value: "overlay-primary", label: "Overlay Primary" }]} ariaLabel="Overlay style" />
          </InspectorFieldRow>
          <InspectorFieldRow label="Display">
            <InspectorSelect value={image.overlayMode ?? "cover"} onChange={(value) => update({ overlayMode: value })} options={[{ value: "cover", label: "Cover" }, { value: "caption", label: "Caption" }]} ariaLabel="Overlay display mode" />
          </InspectorFieldRow>
          <InspectorFieldRow label="Position">
            <InspectorSelect value={image.overlayPosition ?? "center"} onChange={(value) => update({ overlayPosition: value })} options={["top-left", "top-center", "top-right", "center-left", "center", "center-right", "bottom-left", "bottom-center", "bottom-right"].map((value) => ({ value, label: value.replaceAll("-", " ").replace(/\b\w/g, (letter) => letter.toUpperCase()) }))} ariaLabel="Overlay position" />
          </InspectorFieldRow>
          <InspectorFieldRow label="Padding">
            <InspectorSelect value={image.overlayPadding ?? "default"} onChange={(value) => update({ overlayPadding: value })} options={[{ value: "none", label: "None" }, { value: "small", label: "Small" }, { value: "default", label: "Default" }, { value: "large", label: "Large" }]} ariaLabel="Overlay padding" />
          </InspectorFieldRow>
          <InspectorFieldRow label="Transition">
            <InspectorSelect value={image.overlayTransition ?? "fade"} onChange={(value) => update({ overlayTransition: value })} options={["fade", "scale-up", "scale-down", "slide-top", "slide-bottom", "slide-left", "slide-right"].map((value) => ({ value, label: value.replaceAll("-", " ").replace(/\b\w/g, (letter) => letter.toUpperCase()) }))} ariaLabel="Overlay transition" />
          </InspectorFieldRow>
          <InspectorFieldRow label="Show content on hover">
            <InspectorSwitch checked={image.overlayHover === true} onChange={(checked) => update({ overlayHover: checked })} label="Show content on hover" />
          </InspectorFieldRow>
          <InspectorFieldRow label="Animate background only">
            <InspectorSwitch checked={image.overlayAnimateBackground === true} onChange={(checked) => update({ overlayAnimateBackground: checked })} label="Animate background only" />
          </InspectorFieldRow>
          <InspectorFieldRow label="Link overlay">
            <InspectorSwitch checked={image.linkOverlay === true} onChange={(checked) => update({ linkOverlay: checked })} label="Make the whole overlay clickable" />
          </InspectorFieldRow>
          <InspectorFieldRow label="Margin">
            <InspectorSelect value={image.overlayMargin ?? "none"} onChange={(value) => update({ overlayMargin: value })} options={[{ value: "none", label: "None" }, { value: "small", label: "Small" }, { value: "medium", label: "Medium" }, { value: "large", label: "Large" }]} ariaLabel="Overlay margin" />
          </InspectorFieldRow>
          <InspectorFieldRow label="Expand content">
            <InspectorSwitch checked={image.overlayExpandContent === true} onChange={(checked) => update({ overlayExpandContent: checked })} label="Expand content" />
          </InspectorFieldRow>
          <InspectorFieldRow label="Max Width">
            <InspectorSelect value={image.overlayMaxWidth ?? "none"} onChange={(value) => update({ overlayMaxWidth: value === "none" ? undefined : value })} options={["none", "small", "medium", "large", "xlarge", "2xlarge"].map((value) => ({ value, label: value === "none" ? "None" : value.replace("xlarge", "X-Large").replace("2X-Large", "2X-Large") }))} ariaLabel="Overlay maximum width" />
          </InspectorFieldRow>
          <InspectorFieldRow label="Text Color">
            <InspectorSelect value={image.overlayTextColor ?? "none"} onChange={(value) => update({ overlayTextColor: value })} options={[{ value: "none", label: "None" }, { value: "light", label: "Light" }, { value: "dark", label: "Dark" }]} ariaLabel="Overlay text color" />
          </InspectorFieldRow>
          <InspectorFieldRow label="Inverse text color on hover">
            <InspectorSwitch checked={image.overlayTextColorHover === true} onChange={(checked) => update({ overlayTextColorHover: checked })} label="Inverse the text color on hover" />
          </InspectorFieldRow>
          <InspectorFieldRow label="Blend with image">
            <InspectorSwitch checked={image.overlayBlendImage === true} onChange={(checked) => update({ overlayBlendImage: checked })} label="Blend with image" />
          </InspectorFieldRow>
          <InspectorFieldRow label="Image Transition">
            <InspectorSelect value={image.imageTransition ?? "none"} onChange={(value) => update({ imageTransition: value === "none" ? undefined : value })} options={[{ value: "none", label: "None (Fade if hover image)" }, { value: "scale-up", label: "Scale Up" }, { value: "scale-down", label: "Scale Down" }]} ariaLabel="Hover image transition" />
          </InspectorFieldRow>
          <InspectorFieldRow label="Hover Focal Point">
            <InspectorSelect value={image.imageHoverFocalPoint ?? "center"} onChange={(value) => update({ imageHoverFocalPoint: value === "center" ? undefined : value })} options={["top-left", "top-center", "top-right", "center-left", "center", "center-right", "bottom-left", "bottom-center", "bottom-right"].map((value) => ({ value, label: value.replaceAll("-", " ").replace(/\b\w/g, (letter) => letter.toUpperCase()) }))} ariaLabel="Hover image focal point" />
          </InspectorFieldRow>
        </InspectorDivision>
      )}
      {isOverlay && (
        <>
          <TitleSettingsGroup block={image} update={update} showDecoration showColor showMargin keys={{ role: "titleTypographyRole", size: "titleStyle", align: "elementAlign", level: "titleElement", decoration: "titleDecoration", color: "titleColor", margin: "titleMarginTop" }} defaultSize="inherit" defaultLevel="div" />
          <InspectorDivision title="TITLE BEHAVIOR">
            <InspectorFieldRow label="Link title"><InspectorSwitch checked={image.titleLink === true} onChange={(checked) => update({ titleLink: checked })} label="Link title" /></InspectorFieldRow>
            <InspectorFieldRow label="Hover Style"><InspectorSelect value={image.titleHoverStyle ?? "reset"} onChange={(value) => update({ titleHoverStyle: value })} options={[{ value: "reset", label: "None" }, { value: "heading-link", label: "Heading Link" }, { value: "default-link", label: "Default Link" }]} ariaLabel="Overlay title hover style" /></InspectorFieldRow>
            <InspectorFieldRow label="Transition"><InspectorSelect value={image.titleTransition ?? "none"} onChange={(value) => update({ titleTransition: value === "none" ? undefined : value })} options={["none", "fade", "scale-up", "scale-down", "slide-top-small", "slide-bottom-small", "slide-left-small", "slide-right-small", "slide-top-medium", "slide-bottom-medium", "slide-left-medium", "slide-right-medium", "slide-top", "slide-bottom", "slide-left", "slide-right"].map((value) => ({ value, label: value.replaceAll("-", " ").replace(/\b\w/g, (letter) => letter.toUpperCase()) }))} ariaLabel="Overlay title transition" /></InspectorFieldRow>
          </InspectorDivision>
          <MetaSettingsGroup block={image} update={update} showColor showStyle showHtmlElement showMargin keys={{ role: "metaTypographyRole", align: "elementAlign", level: "metaElement", style: "metaStyle", color: "metaColor", margin: "metaMarginTop" }} />
          <InspectorDivision title="META BEHAVIOR">
            <InspectorFieldRow label="Alignment"><InspectorSelect value={image.metaAlignment ?? "below-title"} onChange={(value) => update({ metaAlignment: value })} options={[{ value: "above-title", label: "Above Title" }, { value: "below-title", label: "Below Title" }, { value: "below-content", label: "Below Content" }]} ariaLabel="Overlay meta alignment" /></InspectorFieldRow>
            <InspectorFieldRow label="Transition"><InspectorSelect value={image.metaTransition ?? "none"} onChange={(value) => update({ metaTransition: value === "none" ? undefined : value })} options={["none", "fade", "scale-up", "scale-down", "slide-top-small", "slide-bottom-small", "slide-left-small", "slide-right-small", "slide-top-medium", "slide-bottom-medium", "slide-left-medium", "slide-right-medium", "slide-top", "slide-bottom", "slide-left", "slide-right"].map((value) => ({ value, label: value.replaceAll("-", " ").replace(/\b\w/g, (letter) => letter.toUpperCase()) }))} ariaLabel="Overlay meta transition" /></InspectorFieldRow>
          </InspectorDivision>
          <ContentSettingsGroup block={image} update={update} showStyle keys={{ role: "contentTypographyRole", align: "elementAlign" }} />
          <InspectorDivision title="CONTENT AND LINK BEHAVIOR">
            <InspectorFieldRow label="Content Transition"><InspectorSelect value={image.contentTransition ?? "none"} onChange={(value) => update({ contentTransition: value === "none" ? undefined : value })} options={["none", "fade", "scale-up", "scale-down", "slide-top-small", "slide-bottom-small", "slide-left-small", "slide-right-small"].map((value) => ({ value, label: value.replaceAll("-", " ").replace(/\b\w/g, (letter) => letter.toUpperCase()) }))} ariaLabel="Overlay content transition" /></InspectorFieldRow>
            <InspectorFieldRow label="Link Style"><InspectorSelect value={image.linkStyle ?? "default"} onChange={(value) => update({ linkStyle: value })} options={[{ value: "default", label: "Button Default" }, { value: "primary", label: "Button Primary" }, { value: "secondary", label: "Button Secondary" }, { value: "danger", label: "Button Danger" }, { value: "text", label: "Button Text" }, { value: "link", label: "Link" }, { value: "link-muted", label: "Link Muted" }, { value: "link-text", label: "Link Text" }]} ariaLabel="Overlay link style" /></InspectorFieldRow>
            <InspectorFieldRow label="Link Size"><InspectorSelect value={image.linkSize ?? "default"} onChange={(value) => update({ linkSize: value })} options={[{ value: "small", label: "Small" }, { value: "default", label: "Default" }, { value: "large", label: "Large" }]} ariaLabel="Overlay link size" /></InspectorFieldRow>
            <InspectorFieldRow label="Full width button"><InspectorSwitch checked={image.linkFullWidth === true} onChange={(checked) => update({ linkFullWidth: checked })} label="Full width button" /></InspectorFieldRow>
            <InspectorFieldRow label="Link Transition"><InspectorSelect value={image.linkTransition ?? "none"} onChange={(value) => update({ linkTransition: value === "none" ? undefined : value })} options={["none", "fade", "scale-up", "scale-down", "slide-top-small", "slide-bottom-small", "slide-left-small", "slide-right-small"].map((value) => ({ value, label: value.replaceAll("-", " ").replace(/\b\w/g, (letter) => letter.toUpperCase()) }))} ariaLabel="Overlay link transition" /></InspectorFieldRow>
          </InspectorDivision>
        </>
      )}
    </div>
  );
}
