"use client";

import React, { useRef, useState } from "react";
import { Plus, ImagePlus } from "lucide-react";
import type { BuilderLayoutBlock, InspectorTab } from "@/components/dashboard/builderTypes";
import type { DynamicFieldBinding } from "@/lib/dynamicContent";
import type { DynamicBindingDestination } from "@/lib/dynamicContentCapabilities";
import type { BuilderShellSettings } from "@/lib/builderShell";
import { sanitizeHtml } from "@/lib/safeHtml";
import IconPicker from "@/components/dashboard/inspector/IconPicker";
import RepeatableItemShell from "@/components/dashboard/inspector/RepeatableItemShell";
import RichTextEditor from "@/components/dashboard/RichTextEditor";
import ElementAdvancedPanel from "@/components/dashboard/inspector/panels/ElementAdvancedPanel";
import {
  ActionSettingsGroup,
  CardSettingsGroup,
  ContentSettingsGroup,
  ImageSettingsGroup,
  LinkSettingsGroup,
  MetaSettingsGroup,
  TitleSettingsGroup,
} from "@/components/dashboard/inspector/panels/SharedSettingGroups";
import { BuilderImageUrlControl } from "@/components/dashboard/inspector/panels/InspectorSharedControls";
import DynamicContentInspectorGroup from "@/components/dashboard/inspector/panels/DynamicContentInspectorGroup";
import {
  InspectorDivision,
  InspectorFieldRow,
  InspectorPillGroup,
  InspectorSelect,
  InspectorSwitch,
  InspectorTextField,
  InspectorTextarea,
} from "@/components/dashboard/inspector/InspectorControls";

type Props = {
  block: BuilderLayoutBlock;
  tab: InspectorTab;
  shellSettings: BuilderShellSettings;
  update: (patch: Partial<BuilderLayoutBlock>) => void;
  openWordPressMediaPicker?: (options: {
    title: string;
    currentUrl?: string;
    multiple?: boolean;
    onSelect: (media: any) => void;
    onSelectMany?: (media: any[]) => void;
  }) => void;
};

// Older Panel Slider documents stored the component defaults on every initial
// item. New items inherit them from carouselSettings. Keep those legacy copies
// from masking a later shared-setting change, while leaving real item overrides
// untouched.
const LEGACY_PANEL_SLIDER_ITEM_DEFAULTS: Record<string, unknown> = {
  panelStyle: "default",
  panelSize: "default",
  panelHover: false,
  linkPanel: false,
  imageRatio: "16:9",
  imageFit: "cover",
  imageShape: "none",
  imageShadow: "none",
  imageLoading: "lazy",
  imageAlignment: "center",
  alignImageWithoutPadding: false,
};

export default function SliderCapabilityPanel({
  block,
  tab,
  shellSettings,
  update,
  openWordPressMediaPicker,
}: Props) {
  const rawBlock = (block ?? {}) as any;
  const slides: any[] = rawBlock.slides ?? [];
  const carouselSettings = rawBlock.carouselSettings ?? {};
  const isPanelSlider = rawBlock.kind === "panelSlider";
  const isOverlaySlider = rawBlock.kind === "overlaySlider";
  const isSlideshow = rawBlock.kind === "slideshow";
  const elementLabel = isPanelSlider ? "Panel Slider" : isOverlaySlider ? "Overlay Slider" : isSlideshow ? "Slideshow" : "Carousel";
  const itemLabel = isPanelSlider ? "Panel" : "Slide";
  const focalPointOptions = [
    { value: "top-left", label: "Top Left" }, { value: "top-center", label: "Top Center" }, { value: "top-right", label: "Top Right" },
    { value: "center-left", label: "Center Left" }, { value: "center", label: "Center Center" }, { value: "center-right", label: "Center Right" },
    { value: "bottom-left", label: "Bottom Left" }, { value: "bottom-center", label: "Bottom Center" }, { value: "bottom-right", label: "Bottom Right" },
  ];
  const panelSliderItemDefaults = isPanelSlider
    ? {
        imagePadding: "frameless",
        imageFit: "cover",
        imageRatio: "16:9",
        panelStyle: "default",
        panelSize: "default",
        headingLevel: "h3",
        meta: "Meta",
        metaStyle: "muted",
        showAction: true,
        buttonStyle: "primary",
        buttonSize: "default",
      }
    : {};
  const inheritedArrowStyle = isPanelSlider ? "chevron" : (shellSettings.sliderArrowStyle ?? "chevron");
  const inheritedArrowPosition = isPanelSlider ? "overlay" : (shellSettings.sliderArrowPosition ?? "overlay");
  const inheritedDotnavStyle = isPanelSlider ? "minimal-dots" : (shellSettings.sliderDotnavStyle ?? "minimal-dots");
  const inheritedDotnavPosition = isPanelSlider ? "bottom" : (shellSettings.sliderDotnavPosition ?? "bottom");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [activeItemTabs, setActiveItemTabs] = useState<Record<string, "content" | "settings" | "advanced">>({});

  const updateCarousel = (patch: any) => {
    const nextCarouselSettings = {
      ...carouselSettings,
      ...patch,
    };

    // `contentAlign` was a short-lived Panel Slider duplicate of General
    // alignment. Migrate it on the next normal Panel Slider edit, then retain
    // only the canonical block-level owner.
    const legacyPanelContentAlignment = isPanelSlider &&
      (carouselSettings.contentAlign === "left" || carouselSettings.contentAlign === "center" || carouselSettings.contentAlign === "right")
      ? carouselSettings.contentAlign
      : undefined;
    if (isPanelSlider) delete nextCarouselSettings.contentAlign;
    const panelAlignmentMigration = legacyPanelContentAlignment && rawBlock.textAlign === undefined
      ? { textAlign: legacyPanelContentAlignment }
      : {};

    if (!isPanelSlider || slides.length === 0) {
      update({ carouselSettings: nextCarouselSettings, ...panelAlignmentMigration } as any);
      return;
    }

    const sharedKeys = Object.keys(LEGACY_PANEL_SLIDER_ITEM_DEFAULTS).filter((key) =>
      Object.prototype.hasOwnProperty.call(patch, key),
    );
    const sharedDimensionKeys = ["imageWidth", "imageHeight"].filter((key) =>
      Object.prototype.hasOwnProperty.call(patch, key),
    );

    if (sharedKeys.length === 0 && sharedDimensionKeys.length === 0) {
      update({ carouselSettings: nextCarouselSettings, ...panelAlignmentMigration } as any);
      return;
    }

    const migratedSlides = slides.map((slide) => {
      const nextSlide = { ...slide };
      sharedKeys.forEach((key) => {
        const previousEffectiveValue = carouselSettings[key] ??
          LEGACY_PANEL_SLIDER_ITEM_DEFAULTS[key];
        if (nextSlide[key] === previousEffectiveValue || nextSlide[key] === LEGACY_PANEL_SLIDER_ITEM_DEFAULTS[key]) {
          delete nextSlide[key];
        }
      });
      // Historic imports copied element-level dimensions into every slide.
      // Remove only a value that exactly matched the previous shared value so
      // an intentionally different per-item size remains an override.
      sharedDimensionKeys.forEach((key) => {
        if (nextSlide[key] === carouselSettings[key]) {
          delete nextSlide[key];
        }
      });
      return nextSlide;
    });

    update({
      carouselSettings: nextCarouselSettings,
      slides: migratedSlides,
      ...panelAlignmentMigration,
    } as any);
  };
  const sharedSettingsBlock = { ...carouselSettings } as BuilderLayoutBlock;

  const handleAddMediaFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const newSlides: any[] = [];
    Array.from(files).forEach((file, index) => {
      const url = URL.createObjectURL(file);
      newSlides.push({
        id: String(Date.now() + index),
        ...panelSliderItemDefaults,
        imageUrl: url,
        title: file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "),
        ...(isPanelSlider ? { showAction: true, buttonLabel: "Learn more" } : { subtitle: "" }),
        text: "",
        buttonUrl: "#",
      });
    });
    update({ slides: [...slides, ...newSlides] } as any);
  };

  // --------------------------------------------------------------------------
  // TAB 1: CONTENT
  // --------------------------------------------------------------------------
  if (tab === "content") {
    return (
      <div className="builder-inspector-stack" data-uikit-capability={isPanelSlider ? "panel-slider-content" : isOverlaySlider ? "overlay-slider-content" : "slideshow-content"}>
        {!isPanelSlider && !isSlideshow && !isOverlaySlider && <InspectorDivision title="HEADING & INTRO">
          <InspectorFieldRow label="Block Title">
            <InspectorTextField
              value={rawBlock.title ?? ""}
              onChange={(value: string) => update({ title: value })}
              placeholder={`${elementLabel} title...`}
            />
          </InspectorFieldRow>

          <InspectorFieldRow label="Block Subtitle / Body">
            <InspectorTextarea
              value={rawBlock.body ?? ""}
              onChange={(value: string) => update({ body: value })}
              placeholder={`${elementLabel} intro text...`}
            />
          </InspectorFieldRow>
        </InspectorDivision>}

        {!isPanelSlider && !isSlideshow && !isOverlaySlider && (
          <InspectorDivision title="DISPLAY">
            <InspectorFieldRow label="Title">
              <InspectorSwitch checked={carouselSettings.showTitle !== false} onChange={(checked: boolean) => updateCarousel({ showTitle: checked })} label="Show the title" />
            </InspectorFieldRow>
            <InspectorFieldRow label="Meta">
              <InspectorSwitch checked={carouselSettings.showMeta !== false} onChange={(checked: boolean) => updateCarousel({ showMeta: checked })} label="Show the meta text" />
            </InspectorFieldRow>
            <InspectorFieldRow label="Content">
              <InspectorSwitch checked={carouselSettings.showContent !== false} onChange={(checked: boolean) => updateCarousel({ showContent: checked })} label="Show the content" />
            </InspectorFieldRow>
            <InspectorFieldRow label="Link">
              <InspectorSwitch checked={carouselSettings.showLink !== false} onChange={(checked: boolean) => updateCarousel({ showLink: checked })} label="Show the link" />
            </InspectorFieldRow>
          </InspectorDivision>
        )}

        <InspectorDivision title={isPanelSlider ? "PANEL SLIDES" : isSlideshow ? "ITEMS" : "SLIDES"}>
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
              }}
              onClick={() =>
                update({
                  slides: [
                    ...slides,
                    {
                      id: String(Date.now()),
                      ...panelSliderItemDefaults,
                      title: `${itemLabel} ${slides.length + 1}`,
                      ...(isPanelSlider
                        ? { text: "Panel item content.", showAction: true, buttonLabel: "Learn more" }
                        : { subtitle: "Subtitle", text: "Slide description copy...", buttonLabel: "Learn More" }),
                      buttonUrl: "#",
                      imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80",
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
              }}
              onClick={() => {
                if (openWordPressMediaPicker) {
                  openWordPressMediaPicker({
                    title: `Select ${elementLabel} Media (Select Multiple)`,
                    multiple: true,
                    onSelect: (media: any) => {
                      update({
                        slides: [
                          ...slides,
                          {
                            id: String(Date.now()),
                            ...panelSliderItemDefaults,
                            imageUrl: media.sourceUrl,
                            title: media.title || media.altText || `${itemLabel} image`,
                            ...(isPanelSlider ? { showAction: true, buttonLabel: "Learn more" } : { subtitle: "" }),
                            text: "",
                          },
                        ],
                      } as any);
                    },
                    onSelectMany: (mediaItems: any[]) => {
                      const newSlides = mediaItems.map((media, idx) => ({
                        id: String(Date.now() + idx),
                        ...panelSliderItemDefaults,
                        imageUrl: media.sourceUrl,
                        title: media.title || media.altText || `${itemLabel} ${slides.length + idx + 1}`,
                        ...(isPanelSlider ? { showAction: true, buttonLabel: "Learn more" } : { subtitle: "" }),
                        text: "",
                      }));
                      update({ slides: [...slides, ...newSlides] } as any);
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
            items={slides}
            getItemKey={(slide: any, index: number) => slide.id || `slide-${index}`}
            getItemSummary={(slide: any, index: number) => slide.title || `${itemLabel} ${index + 1}`}
            itemLabel={itemLabel}
            addLabel={`Add ${itemLabel.toLowerCase()}`}
            onAdd={() =>
              update({
                slides: [
                  ...slides,
                  {
                    id: String(Date.now()),
                    ...panelSliderItemDefaults,
                    title: `${itemLabel} ${slides.length + 1}`,
                    ...(isPanelSlider
                      ? { text: "Panel item content.", showAction: true, buttonLabel: "Learn more" }
                      : { subtitle: "Subtitle", text: "Slide description copy...", buttonLabel: "Learn More" }),
                    buttonUrl: "#",
                  },
                ],
              } as any)
            }
            onCopy={(index: number) => {
              const target = slides[index];
              if (!target) return;
              const copied = { ...target, id: String(Date.now()) };
              const updated = [...slides];
              updated.splice(index + 1, 0, copied);
              update({ slides: updated } as any);
            }}
            onDelete={(index: number) => {
              const updated = slides.filter((_: any, i: number) => i !== index);
              update({ slides: updated } as any);
            }}
            onReorder={(sourceIndex: number, targetIndex: number) => {
              const updated = [...slides];
              const [moved] = updated.splice(sourceIndex, 1);
              updated.splice(targetIndex, 0, moved);
              update({ slides: updated } as any);
            }}
            renderItem={(slide: any, index: number) => {
              const updateSlide = (patch: any) => {
                const updated = [...slides];
                updated[index] = { ...updated[index], ...patch };
                update({ slides: updated } as any);
              };
              const updateDynamicBinding = (
                destination: string,
                binding: DynamicFieldBinding | undefined,
              ) => {
                const nextBindings = { ...(slide.dynamicBindings ?? {}) };
                if (binding) nextBindings[destination] = binding;
                else delete nextBindings[destination];
                updateSlide({
                  dynamicBindings: Object.keys(nextBindings).length > 0 ? nextBindings : undefined,
                });
              };
              const dynamicBinding = (destination: DynamicBindingDestination) => ({
                destination,
                descriptor: slide.dynamicContext,
                bindings: slide.dynamicBindings,
                onChange: updateDynamicBinding,
              });

              const itemKey = String(slide.id ?? index);
              const activeTab = activeItemTabs[itemKey] ?? "content";
              const updateItemTab = (value: string) =>
                setActiveItemTabs((current) => ({
                  ...current,
                  [itemKey]: value as "content" | "settings" | "advanced",
                }));

              return (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <InspectorPillGroup
                    value={activeTab}
                    options={[
                      { value: "content", label: "Content" },
                      { value: "settings", label: "Settings" },
                      { value: "advanced", label: "Advanced" },
                    ]}
                    onChange={updateItemTab}
                    ariaLabel={`${itemLabel} ${index + 1} tab`}
                  />

                  {activeTab === "content" ? (
                    <>
                      {isSlideshow && <>
                        <InspectorFieldRow label="Image" dynamicBinding={dynamicBinding("imageUrl")}>
                          <BuilderImageUrlControl
                            value={slide.imageUrl ?? ""}
                            onChange={(event) => updateSlide({ imageUrl: event.target.value })}
                            onChoose={() => openWordPressMediaPicker?.({
                              title: `${itemLabel} ${index + 1} image`, currentUrl: slide.imageUrl,
                              onSelect: (media: any) => updateSlide({ imageUrl: media.sourceUrl, imageAlt: media.altText || media.title || "" }),
                            })}
                          />
                        </InspectorFieldRow>
                        <InspectorFieldRow label="Image Alt" dynamicBinding={dynamicBinding("imageAlt")}>
                          <InspectorTextField value={slide.imageAlt ?? ""} onChange={(value: string) => updateSlide({ imageAlt: value })} />
                        </InspectorFieldRow>
                      </>}
                      <InspectorFieldRow label="Title" dynamicBinding={dynamicBinding("title")}>
                        <>
                          <InspectorTextarea
                            value={slide.title ?? ""}
                            onChange={(value: string) => updateSlide({ title: sanitizeHtml(value) })}
                            placeholder={`${itemLabel} title (inline HTML such as <br> is supported)...`}
                            ariaLabel={`${itemLabel} ${index + 1} title`}
                          />
                        </>
                      </InspectorFieldRow>

                      <InspectorFieldRow label="Meta" dynamicBinding={dynamicBinding("meta")}>
                        <>
                          <InspectorTextField
                            value={slide.meta ?? slide.subtitle ?? ""}
                            onChange={(value: string) => updateSlide({ meta: value })}
                            placeholder="Meta text..."
                            ariaLabel={`${itemLabel} ${index + 1} meta`}
                          />
                        </>
                      </InspectorFieldRow>

                      <InspectorFieldRow label="Content" dynamicBinding={dynamicBinding("text")}>
                        <>
                          <RichTextEditor
                            value={slide.text ?? ""}
                            onChange={(value) => updateSlide({ text: value })}
                            placeholder={`${itemLabel} content...`}
                            minHeight="120px"
                          />
                        </>
                      </InspectorFieldRow>

                      {!isSlideshow && <InspectorFieldRow label="Image" dynamicBinding={dynamicBinding("imageUrl")}>
                        <>
                          <BuilderImageUrlControl
                            value={slide.imageUrl ?? ""}
                            onChange={(event) => updateSlide({ imageUrl: event.target.value })}
                            onChoose={() =>
                              openWordPressMediaPicker?.({
                                title: `${itemLabel} ${index + 1} image`,
                                currentUrl: slide.imageUrl,
                                onSelect: (media: any) =>
                                  updateSlide({
                                    imageUrl: media.sourceUrl,
                                    imageAlt: media.altText || media.title || "",
                                  }),
                              })
                            }
                          />
                        </>
                      </InspectorFieldRow>}

                      {!isSlideshow && <InspectorFieldRow label="Image Alt" dynamicBinding={dynamicBinding("imageAlt")}>
                        <>
                          <InspectorTextField
                            value={slide.imageAlt ?? ""}
                            onChange={(value: string) => updateSlide({ imageAlt: value })}
                            ariaLabel={`${itemLabel} ${index + 1} image alt`}
                          />
                        </>
                      </InspectorFieldRow>}

                      {!isPanelSlider && !isSlideshow && !isOverlaySlider && <InspectorFieldRow label="Icon">
                        <IconPicker
                          value={slide.iconName}
                          onChange={(iconName) => updateSlide({ iconName })}
                          onClear={() => updateSlide({ iconName: undefined })}
                          ariaLabel={`${itemLabel} ${index + 1} icon`}
                        />
                      </InspectorFieldRow>}

                      {isPanelSlider ? <>
                        <ActionSettingsGroup
                          block={slide as BuilderLayoutBlock}
                          update={updateSlide}
                          title="LINK"
                          terminology="link"
                          showPresentation={false}
                          showVisibilityToggle
                          keys={{
                            visible: "showAction",
                            label: "buttonLabel",
                            url: "buttonUrl",
                            target: "buttonTarget",
                            style: "buttonStyle",
                            size: "buttonSize",
                          }}
                          dynamicContext={slide.dynamicContext}
                          dynamicBindings={slide.dynamicBindings}
                          onDynamicBindingChange={isPanelSlider ? updateDynamicBinding : undefined}
                        />
                      </> : <>
                        <InspectorFieldRow label="Link" dynamicBinding={dynamicBinding("buttonUrl")}>
                          <InspectorTextField
                            value={slide.buttonUrl ?? ""}
                            onChange={(value: string) => updateSlide({ buttonUrl: value })}
                            placeholder="https://..."
                            ariaLabel={`${itemLabel} ${index + 1} link URL`}
                          />
                        </InspectorFieldRow>
                        {isSlideshow && <>
                          <InspectorFieldRow label="Navigation Label">
                            <InspectorTextField value={slide.navigationLabel ?? ""} onChange={(value: string) => updateSlide({ navigationLabel: value || undefined })} />
                          </InspectorFieldRow>
                          <InspectorFieldRow label="Navigation Thumbnail">
                            <BuilderImageUrlControl
                              value={slide.thumbnailUrl ?? ""}
                              onChange={(event) => updateSlide({ thumbnailUrl: event.target.value || undefined })}
                              onChoose={() => openWordPressMediaPicker?.({
                                title: `${itemLabel} ${index + 1} navigation thumbnail`, currentUrl: slide.thumbnailUrl,
                                onSelect: (media: any) => updateSlide({ thumbnailUrl: media.sourceUrl }),
                              })}
                            />
                          </InspectorFieldRow>
                        </>}
                      </>}
                    </>
                  ) : activeTab === "advanced" ? (
                    <DynamicContentInspectorGroup
                      item={slide}
                      update={updateSlide}
                    />
                  ) : isSlideshow ? (
                    <>
                      <InspectorDivision title="ITEM">
                        <InspectorFieldRow label="Text Color">
                          <InspectorSelect value={slide.textColor ?? "none"} onChange={(value: string) => updateSlide({ textColor: value === "none" ? undefined : value })} options={[{ value: "none", label: "None" }, { value: "light", label: "Light" }, { value: "dark", label: "Dark" }]} />
                        </InspectorFieldRow>
                        <InspectorFieldRow label="HTML Element">
                          <InspectorSelect value={slide.itemElement ?? "div"} onChange={(value: string) => updateSlide({ itemElement: value })} options={[{ value: "div", label: "div" }, { value: "article", label: "article" }, { value: "section", label: "section" }, { value: "li", label: "li" }]} />
                        </InspectorFieldRow>
                      </InspectorDivision>
                      <InspectorDivision title="IMAGE">
                        <InspectorFieldRow label="Focal Point">
                          <InspectorSelect value={slide.imagePosition ?? "center"} onChange={(value: string) => updateSlide({ imagePosition: value })} options={focalPointOptions} />
                        </InspectorFieldRow>
                      </InspectorDivision>
                      {slide.thumbnailUrl && <InspectorDivision title="THUMBNAIL">
                        <InspectorFieldRow label="Focal Point">
                          <InspectorSelect value={slide.thumbnailPosition ?? "center"} onChange={(value: string) => updateSlide({ thumbnailPosition: value })} options={focalPointOptions} />
                        </InspectorFieldRow>
                      </InspectorDivision>}
                    </>
                  ) : isOverlaySlider ? (
                    <>
                      <InspectorDivision title="ITEM">
                        <InspectorFieldRow label="Text Color">
                          <InspectorSelect value={slide.textColor ?? "none"} onChange={(value: string) => updateSlide({ textColor: value === "none" ? undefined : value })} options={[{ value: "none", label: "None" }, { value: "light", label: "Light" }, { value: "dark", label: "Dark" }]} />
                        </InspectorFieldRow>
                        <InspectorFieldRow label="HTML Element">
                          <InspectorSelect value={slide.itemElement ?? "div"} onChange={(value: string) => updateSlide({ itemElement: value })} options={[{ value: "div", label: "div" }, { value: "article", label: "article" }, { value: "section", label: "section" }, { value: "li", label: "li" }]} />
                        </InspectorFieldRow>
                      </InspectorDivision>
                      <ImageSettingsGroup
                        block={slide as BuilderLayoutBlock}
                        update={updateSlide}
                        showDimensions={false}
                        showFrameControls={false}
                        showAlignment={false}
                        showFocalPoint
                        showShadow={false}
                        showDecoration={false}
                      />
                    </>
                  ) : !isPanelSlider ? (
                    <>
                      <CardSettingsGroup
                        block={slide as BuilderLayoutBlock}
                        update={updateSlide}
                        title="PANEL"
                        showLink
                        keys={{ variant: "panelStyle", size: "panelSize", hover: "panelHover", link: "linkPanel" }}
                      />
                      <TitleSettingsGroup
                        block={slide as BuilderLayoutBlock}
                        update={updateSlide}
                        showDecoration
                        showColor
                        defaultSize="none"
                      />
                      <MetaSettingsGroup
                        block={slide as BuilderLayoutBlock}
                        update={updateSlide}
                        showStyle
                        showColor
                        showPosition
                      />
                      <ContentSettingsGroup
                        block={slide as BuilderLayoutBlock}
                        update={updateSlide}
                        showStyle
                      />
                      <ImageSettingsGroup block={slide as BuilderLayoutBlock} update={updateSlide} showFrameless />
                      <ActionSettingsGroup
                        block={slide as BuilderLayoutBlock}
                        update={updateSlide}
                        title="LINK"
                        showVisibilityToggle
                        showFullWidth
                        keys={{
                          visible: "showAction",
                          label: "buttonLabel",
                          url: "buttonUrl",
                          target: "buttonTarget",
                          style: "buttonStyle",
                          size: "buttonSize",
                          width: "fullWidthButton",
                        }}
                      />
                    </>
                  ) : (
                    <InspectorDivision title="ITEM">
                      <InspectorFieldRow label="Text Color">
                        <InspectorSelect
                          value={slide.textColor ?? "none"}
                          onChange={(value: string) => updateSlide({ textColor: value === "none" ? undefined : value })}
                          options={[
                            { value: "none", label: "None" },
                            { value: "light", label: "Light" },
                            { value: "dark", label: "Dark" },
                          ]}
                        />
                      </InspectorFieldRow>
                      <InspectorFieldRow label="HTML Element">
                        <InspectorSelect
                          value={slide.itemElement ?? "div"}
                          onChange={(value: string) => updateSlide({ itemElement: value })}
                          options={[
                            { value: "div", label: "div" },
                            { value: "article", label: "article" },
                            { value: "section", label: "section" },
                            { value: "li", label: "li" },
                          ]}
                        />
                      </InspectorFieldRow>
                    </InspectorDivision>
                  )}
                </div>
              );
            }}
          />
        </InspectorDivision>

        {isSlideshow && (
          <>
            <InspectorDivision title="DISPLAY">
              <InspectorFieldRow label="Title">
                <InspectorSwitch checked={carouselSettings.showTitle !== false} onChange={(checked: boolean) => updateCarousel({ showTitle: checked })} label="Show the title" />
              </InspectorFieldRow>
              <InspectorFieldRow label="Meta">
                <InspectorSwitch checked={carouselSettings.showMeta !== false} onChange={(checked: boolean) => updateCarousel({ showMeta: checked })} label="Show the meta text" />
              </InspectorFieldRow>
              <InspectorFieldRow label="Content">
                <InspectorSwitch checked={carouselSettings.showContent !== false} onChange={(checked: boolean) => updateCarousel({ showContent: checked })} label="Show the content" />
              </InspectorFieldRow>
              <InspectorFieldRow label="Link">
                <InspectorSwitch checked={carouselSettings.showLink !== false} onChange={(checked: boolean) => updateCarousel({ showLink: checked })} label="Show the link" />
              </InspectorFieldRow>
              <InspectorFieldRow label="Navigation thumbnail">
                <InspectorSwitch
                  checked={carouselSettings.showNavigationThumbnail !== false}
                  onChange={(checked: boolean) => updateCarousel({ showNavigationThumbnail: checked })}
                  label="Show the navigation thumbnail instead of the image"
                />
              </InspectorFieldRow>
            </InspectorDivision>

            <InspectorDivision title="LINK">
              <InspectorFieldRow label="Link">
                <InspectorTextField
                  value={carouselSettings.elementLinkUrl ?? ""}
                  onChange={(value: string) => updateCarousel({ elementLinkUrl: value || undefined })}
                  placeholder="https://..."
                />
              </InspectorFieldRow>
              <InspectorFieldRow label="Target">
                <InspectorSelect
                  value={carouselSettings.elementLinkTarget ?? "_self"}
                  onChange={(value: string) => updateCarousel({ elementLinkTarget: value })}
                  options={[{ value: "_self", label: "Same window" }, { value: "_blank", label: "New window" }]}
                />
              </InspectorFieldRow>
            </InspectorDivision>
          </>
        )}

      </div>
    );
  }

  // --------------------------------------------------------------------------
  // TAB 2: SETTINGS
  // --------------------------------------------------------------------------
  if (tab === "style") {
    if (isPanelSlider) {
      const itemWidth = (key: string, label: string, fallback?: number) => (
        <InspectorFieldRow label={label} key={key}>
          <InspectorSelect
            value={String((carouselSettings as any)[key] ?? fallback ?? "")}
            onChange={(value: string) => updateCarousel({ [key]: value === "" ? undefined : Number(value) })}
            options={[
              { value: "", label: "Inherit" },
              ...[1, 2, 3, 4, 5, 6].map((value) => ({
                value: String(value),
                label: value === 1 ? "Full width" : `${value} columns`,
              })),
            ]}
          />
        </InspectorFieldRow>
      );

      return (
        <div className="builder-inspector-stack" data-uikit-capability="panel-slider-settings">
          <InspectorDivision title="SLIDER">
            <InspectorFieldRow label="Item Width Mode">
              <InspectorPillGroup
                value={carouselSettings.itemWidthMode ?? "auto"}
                options={[{ value: "auto", label: "Auto" }, { value: "fixed", label: "Fixed" }]}
                onChange={(value: string) => updateCarousel({ itemWidthMode: value })}
                ariaLabel="Item Width Mode"
              />
            </InspectorFieldRow>
            <InspectorFieldRow label="Gap">
              <InspectorSelect value={String(carouselSettings.spaceBetween ?? 30)} onChange={(value: string) => updateCarousel({ spaceBetween: Number(value) })} options={[{ value: "0", label: "None" }, { value: "15", label: "Small" }, { value: "30", label: "Default" }, { value: "40", label: "Large" }]} />
            </InspectorFieldRow>
            <InspectorFieldRow label="Divider">
              <InspectorSwitch checked={carouselSettings.divider === true} onChange={(checked: boolean) => updateCarousel({ divider: checked })} label="Show dividers" />
            </InspectorFieldRow>
            <InspectorFieldRow label="Center slides"><InspectorSwitch checked={carouselSettings.centered === true} onChange={(checked: boolean) => updateCarousel({ centered: checked })} label="Center" /></InspectorFieldRow>
            <InspectorFieldRow label="Finite"><InspectorSwitch checked={carouselSettings.loop === false} onChange={(checked: boolean) => updateCarousel({ loop: !checked })} label="Stop at the last item" /></InspectorFieldRow>
            <InspectorFieldRow label="Autoplay"><InspectorSwitch checked={carouselSettings.autoplay === true} onChange={(checked: boolean) => updateCarousel({ autoplay: checked })} label="Enable autoplay" /></InspectorFieldRow>
            <InspectorFieldRow label="Pause on hover"><InspectorSwitch checked={carouselSettings.pauseOnHover !== false} onChange={(checked: boolean) => updateCarousel({ pauseOnHover: checked })} label="Pause autoplay on hover" /></InspectorFieldRow>
          </InspectorDivision>

          <InspectorDivision title="ITEM WIDTH">
            {itemWidth("cardsPerViewPhone", "Phone Portrait", 1)}
            {itemWidth("cardsPerViewSmall", "Phone Landscape")}
            {itemWidth("cardsPerViewMedium", "Medium (Tablet Landscape)", 3)}
            {itemWidth("cardsPerViewLarge", "Large (Desktop)")}
            {itemWidth("cardsPerViewXLarge", "X-Large (Large Screens)")}
          </InspectorDivision>

          <InspectorDivision title="NAVIGATION">
            <InspectorFieldRow label="Navigation"><InspectorSelect value={carouselSettings.navigationType ?? (carouselSettings.showDots ? "dotnav" : "none")} onChange={(value: string) => updateCarousel({ navigationType: value, showDots: value === "dotnav" })} options={[{ value: "none", label: "None" }, { value: "dotnav", label: "Dotnav" }]} /></InspectorFieldRow>
            <InspectorFieldRow label="Position"><InspectorSelect value={carouselSettings.paginationPosition ?? "bottom"} onChange={(value: string) => updateCarousel({ paginationPosition: value })} options={[{ value: "bottom", label: "Bottom" }, { value: "top", label: "Top" }]} /></InspectorFieldRow>
          </InspectorDivision>

          <InspectorDivision title="SLIDENAV">
            <InspectorFieldRow label="Position"><InspectorSelect value={carouselSettings.showArrows === false ? "none" : (carouselSettings.arrowPosition === "outer" ? "outside" : "default")} onChange={(value: string) => updateCarousel(value === "none" ? { showArrows: false } : { showArrows: true, arrowPosition: value === "outside" ? "outer" : "overlay" })} options={[{ value: "none", label: "None" }, { value: "default", label: "Default" }, { value: "outside", label: "Outside" }]} /></InspectorFieldRow>
            <InspectorFieldRow label="Margin"><InspectorSelect value={carouselSettings.slidenavMargin ?? "medium"} onChange={(value: string) => updateCarousel({ slidenavMargin: value })} options={[{ value: "none", label: "None" }, { value: "small", label: "Small" }, { value: "medium", label: "Medium" }, { value: "large", label: "Large" }]} /></InspectorFieldRow>
            <InspectorFieldRow label="Breakpoint"><InspectorSelect value={carouselSettings.slidenavBreakpoint ?? ""} onChange={(value: string) => updateCarousel({ slidenavBreakpoint: value || undefined })} options={[{ value: "", label: "Always" }, { value: "small", label: "Small" }, { value: "medium", label: "Medium" }, { value: "large", label: "Large" }, { value: "xlarge", label: "X-Large" }]} /></InspectorFieldRow>
          </InspectorDivision>

          <InspectorDivision title="ITEM">
            <InspectorFieldRow label="Title"><InspectorSwitch checked={carouselSettings.showTitle !== false} onChange={(checked: boolean) => updateCarousel({ showTitle: checked })} label="Show title" /></InspectorFieldRow>
            <InspectorFieldRow label="Meta"><InspectorSwitch checked={carouselSettings.showMeta !== false} onChange={(checked: boolean) => updateCarousel({ showMeta: checked })} label="Show meta" /></InspectorFieldRow>
            <InspectorFieldRow label="Content"><InspectorSwitch checked={carouselSettings.showContent !== false} onChange={(checked: boolean) => updateCarousel({ showContent: checked })} label="Show content" /></InspectorFieldRow>
            <InspectorFieldRow label="Link"><InspectorSwitch checked={carouselSettings.showLink !== false} onChange={(checked: boolean) => updateCarousel({ showLink: checked })} label="Show link" /></InspectorFieldRow>
          </InspectorDivision>

          <CardSettingsGroup
            block={sharedSettingsBlock}
            update={updateCarousel}
            title="PANEL"
            showLink
            surfaceOptions={[
              { value: "blank", label: "None" },
              { value: "default", label: "Default" },
              { value: "primary", label: "Primary" },
              { value: "secondary", label: "Secondary" },
            ]}
            defaultSize="none"
            keys={{ variant: "panelStyle", size: "panelSize", hover: "panelHover", link: "linkPanel" }}
          />

          <ActionSettingsGroup
            block={sharedSettingsBlock}
            update={updateCarousel}
            title="LINK"
            terminology="link"
            targetFirst
            targetControl="new-window-switch"
            showUrl={false}
            showAriaLabel
            showFullWidth
            showMargin
            keys={{ label: "buttonLabel", target: "linkTarget", aria: "linkAriaLabel", style: "buttonStyle", size: "buttonSize", width: "fullWidthButton", margin: "linkMarginTop" }}
          />

          <TitleSettingsGroup
            block={sharedSettingsBlock}
            update={updateCarousel}
            showFontRole={false}
            defaultSize="inherit"
            defaultLevel="h3"
          />

          <MetaSettingsGroup
            block={sharedSettingsBlock}
            update={updateCarousel}
            showAlignment={false}
            showStyle
            showPosition
            showHtmlElement
            keys={{
              role: "metaTypographyRole",
              align: "metaAlign",
              level: "metaHtmlElement",
              style: "metaStyle",
              color: "metaColor",
              position: "metaPosition",
            }}
          />

          <ImageSettingsGroup
            block={sharedSettingsBlock}
            update={updateCarousel}
            showFrameControls={false}
            // Panel Slider's YOOtheme Image Alignment is structural (`top` /
            // `left`), not the shared Image horizontal alignment. Its shared
            // media-grid runtime is deferred, so do not expose a misleading
            // left/center/right substitute in this composition.
            showAlignment={false}
            showSvgControls
            showFocalPoint={false}
            showShadow={false}
            showDecoration={false}
            svgColorLabel="SVG Color"
          />
        </div>
      );
    }

    // Overlay Slider is a distinct YOOtheme public element.  It shares the
    // carousel runtime, but it must not inherit the generic carousel/Card
    // inspector surface (or per-item Card settings) merely because those
    // primitives exist elsewhere in WebPages.
    if (isOverlaySlider) {
      const itemWidth = (key: string, label: string, fallback?: number) => (
        <InspectorFieldRow label={label} key={key}>
          <InspectorSelect
            value={String((carouselSettings as any)[key] ?? fallback ?? "")}
            onChange={(value: string) => updateCarousel({ [key]: value === "" ? undefined : Number(value) })}
            options={[
              { value: "", label: "Inherit" },
              ...[1, 2, 3, 4, 5, 6].map((value) => ({
                value: String(value),
                label: value === 1 ? "Full width" : `${value} columns`,
              })),
            ]}
          />
        </InspectorFieldRow>
      );
      return (
        <div className="builder-inspector-stack" data-uikit-capability="overlay-slider-settings">
          <InspectorDivision title="SLIDER">
            <InspectorFieldRow label="Item Width">
              <InspectorPillGroup
                value={carouselSettings.itemWidthMode ?? "auto"}
                options={[{ value: "auto", label: "Auto" }, { value: "fixed", label: "Fixed" }]}
                onChange={(value: string) => updateCarousel({ itemWidthMode: value })}
                ariaLabel="Overlay Slider item width mode"
              />
            </InspectorFieldRow>
            <InspectorFieldRow label="Gap">
              <InspectorSelect value={String(carouselSettings.spaceBetween ?? 30)} onChange={(value: string) => updateCarousel({ spaceBetween: Number(value) })} options={[{ value: "0", label: "None" }, { value: "15", label: "Small" }, { value: "30", label: "Default" }, { value: "40", label: "Large" }]} />
            </InspectorFieldRow>
            <InspectorFieldRow label="Divider"><InspectorSwitch checked={carouselSettings.divider === true} onChange={(checked: boolean) => updateCarousel({ divider: checked })} label="Show dividers" /></InspectorFieldRow>
            <InspectorFieldRow label="Center"><InspectorSwitch checked={carouselSettings.centered === true} onChange={(checked: boolean) => updateCarousel({ centered: checked })} label="Center slides" /></InspectorFieldRow>
            <InspectorFieldRow label="Finite"><InspectorSwitch checked={carouselSettings.loop === false} onChange={(checked: boolean) => updateCarousel({ loop: !checked })} label="Stop at the last item" /></InspectorFieldRow>
          </InspectorDivision>

          <InspectorDivision title="ITEM WIDTH">
            {itemWidth("cardsPerViewPhone", "Phone Portrait", 1)}
            {itemWidth("cardsPerViewSmall", "Phone Landscape")}
            {itemWidth("cardsPerViewMedium", "Tablet Landscape")}
            {itemWidth("cardsPerViewLarge", "Desktop")}
            {itemWidth("cardsPerViewXLarge", "Large Screens")}
          </InspectorDivision>

          <InspectorDivision title="ANIMATION">
            <InspectorFieldRow label="Autoplay"><InspectorSwitch checked={carouselSettings.autoplay === true} onChange={(checked: boolean) => updateCarousel({ autoplay: checked })} label="Enable autoplay" /></InspectorFieldRow>
            <InspectorFieldRow label="Pause autoplay on hover"><InspectorSwitch checked={carouselSettings.pauseOnHover !== false} onChange={(checked: boolean) => updateCarousel({ pauseOnHover: checked })} label="Pause autoplay on hover" /></InspectorFieldRow>
            <InspectorFieldRow label="Autoplay interval"><InspectorSelect value={String(carouselSettings.autoplayDelayMs ?? 5000)} onChange={(value: string) => updateCarousel({ autoplayDelayMs: Number(value) })} options={[5, 7, 10, 15].map((seconds) => ({ value: String(seconds * 1000), label: `${seconds} seconds` }))} /></InspectorFieldRow>
          </InspectorDivision>

          <InspectorDivision title="NAVIGATION">
            <InspectorFieldRow label="Navigation"><InspectorSelect value={carouselSettings.navigationType ?? (carouselSettings.showDots ? "dotnav" : "none")} onChange={(value: string) => updateCarousel({ navigationType: value, showDots: value === "dotnav" })} options={[{ value: "none", label: "None" }, { value: "dotnav", label: "Dotnav" }]} /></InspectorFieldRow>
            <InspectorFieldRow label="Position"><InspectorSelect value={carouselSettings.paginationPosition ?? "bottom-center"} onChange={(value: string) => updateCarousel({ paginationPosition: value })} options={[{ value: "top-left", label: "Top Left" }, { value: "top-right", label: "Top Right" }, { value: "center-left", label: "Center Left" }, { value: "center-right", label: "Center Right" }, { value: "bottom-left", label: "Bottom Left" }, { value: "bottom-center", label: "Bottom Center" }, { value: "bottom-right", label: "Bottom Right" }]} /></InspectorFieldRow>
            <InspectorFieldRow label="Show below slider"><InspectorSwitch checked={carouselSettings.navigationBelow === true} onChange={(checked: boolean) => updateCarousel({ navigationBelow: checked })} label="Show below slider" /></InspectorFieldRow>
            <InspectorFieldRow label="Margin"><InspectorSelect value={carouselSettings.navigationMargin ?? "default"} onChange={(value: string) => updateCarousel({ navigationMargin: value })} options={[{ value: "none", label: "None" }, { value: "small", label: "Small" }, { value: "default", label: "Default" }, { value: "medium", label: "Medium" }, { value: "large", label: "Large" }]} /></InspectorFieldRow>
            <InspectorFieldRow label="Breakpoint"><InspectorSelect value={carouselSettings.navigationBreakpoint ?? "always"} onChange={(value: string) => updateCarousel({ navigationBreakpoint: value })} options={[{ value: "always", label: "Always" }, { value: "small", label: "Small" }, { value: "medium", label: "Medium" }, { value: "large", label: "Large" }, { value: "xlarge", label: "X-Large" }]} /></InspectorFieldRow>
          </InspectorDivision>

          <InspectorDivision title="SLIDENAV">
            <InspectorFieldRow label="Position"><InspectorSelect value={carouselSettings.arrowPosition ?? "overlay"} onChange={(value: string) => updateCarousel({ arrowPosition: value, showArrows: value !== "none" })} options={[{ value: "none", label: "None" }, { value: "overlay", label: "Default" }, { value: "outside", label: "Outside" }, { value: "top-left", label: "Top Left" }, { value: "top-right", label: "Top Right" }, { value: "center-left", label: "Center Left" }, { value: "center-right", label: "Center Right" }, { value: "bottom-left", label: "Bottom Left" }, { value: "bottom-center", label: "Bottom Center" }, { value: "bottom-right", label: "Bottom Right" }]} /></InspectorFieldRow>
            <InspectorFieldRow label="Margin"><InspectorSelect value={carouselSettings.slidenavMargin ?? "medium"} onChange={(value: string) => updateCarousel({ slidenavMargin: value })} options={[{ value: "none", label: "None" }, { value: "small", label: "Small" }, { value: "medium", label: "Medium" }, { value: "large", label: "Large" }]} /></InspectorFieldRow>
            <InspectorFieldRow label="Breakpoint"><InspectorSelect value={carouselSettings.slidenavBreakpoint ?? "always"} onChange={(value: string) => updateCarousel({ slidenavBreakpoint: value })} options={[{ value: "always", label: "Always" }, { value: "small", label: "Small" }, { value: "medium", label: "Medium" }, { value: "large", label: "Large" }, { value: "xlarge", label: "X-Large" }]} /></InspectorFieldRow>
          </InspectorDivision>

          <InspectorDivision title="ITEM">
            <InspectorFieldRow label="Title"><InspectorSwitch checked={carouselSettings.showTitle !== false} onChange={(checked: boolean) => updateCarousel({ showTitle: checked })} label="Show title" /></InspectorFieldRow>
            <InspectorFieldRow label="Meta"><InspectorSwitch checked={carouselSettings.showMeta !== false} onChange={(checked: boolean) => updateCarousel({ showMeta: checked })} label="Show meta" /></InspectorFieldRow>
            <InspectorFieldRow label="Content"><InspectorSwitch checked={carouselSettings.showContent !== false} onChange={(checked: boolean) => updateCarousel({ showContent: checked })} label="Show content" /></InspectorFieldRow>
            <InspectorFieldRow label="Link"><InspectorSwitch checked={carouselSettings.showLink !== false} onChange={(checked: boolean) => updateCarousel({ showLink: checked })} label="Show link" /></InspectorFieldRow>
          </InspectorDivision>

          <InspectorDivision title="OVERLAY">
            <InspectorFieldRow label="Mode"><InspectorSelect value={carouselSettings.overlayMode ?? "cover"} onChange={(value: string) => updateCarousel({ overlayMode: value })} options={[{ value: "cover", label: "Cover" }, { value: "caption", label: "Caption" }]} /></InspectorFieldRow>
            <InspectorFieldRow label="Display"><InspectorSelect value={carouselSettings.overlayDisplay ?? "always"} onChange={(value: string) => updateCarousel({ overlayDisplay: value })} options={[{ value: "always", label: "Always" }, { value: "hover", label: "Hover" }, { value: "active", label: "Active" }]} /></InspectorFieldRow>
            <InspectorFieldRow label="Position"><InspectorSelect value={carouselSettings.overlayPosition ?? "center"} onChange={(value: string) => updateCarousel({ overlayPosition: value })} options={[{ value: "top-left", label: "Top Left" }, { value: "top-right", label: "Top Right" }, { value: "center-left", label: "Center Left" }, { value: "center", label: "Center Center" }, { value: "center-right", label: "Center Right" }, { value: "bottom-left", label: "Bottom Left" }, { value: "bottom-center", label: "Bottom Center" }, { value: "bottom-right", label: "Bottom Right" }]} /></InspectorFieldRow>
            <InspectorFieldRow label="Padding"><InspectorSelect value={carouselSettings.overlayPadding ?? "default"} onChange={(value: string) => updateCarousel({ overlayPadding: value })} options={[{ value: "none", label: "None" }, { value: "small", label: "Small" }, { value: "default", label: "Default" }, { value: "large", label: "Large" }]} /></InspectorFieldRow>
            <InspectorFieldRow label="Style"><InspectorSelect value={carouselSettings.overlayStyle ?? "none"} onChange={(value: string) => updateCarousel({ overlayStyle: value })} options={[{ value: "none", label: "None" }, { value: "default", label: "Overlay Default" }, { value: "primary", label: "Overlay Primary" }, { value: "tile-default", label: "Tile Default" }, { value: "tile-muted", label: "Tile Muted" }, { value: "tile-primary", label: "Tile Primary" }, { value: "tile-secondary", label: "Tile Secondary" }]} /></InspectorFieldRow>
          </InspectorDivision>

          <ImageSettingsGroup
            block={sharedSettingsBlock}
            update={updateCarousel}
            showDimensions
            showFrameControls={false}
            showAlignment={false}
            showFocalPoint={false}
            showShadow={false}
            showDecoration={false}
            showTransition
            showBorder={false}
          />
          <TitleSettingsGroup block={sharedSettingsBlock} update={updateCarousel} showFontRole={false} defaultSize="inherit" defaultLevel="h3" />
          <MetaSettingsGroup block={sharedSettingsBlock} update={updateCarousel} showAlignment={false} showStyle showPosition showHtmlElement keys={{ role: "metaTypographyRole", align: "metaAlign", level: "metaHtmlElement", style: "metaStyle", color: "metaColor", position: "metaPosition" }} />
          <ContentSettingsGroup block={sharedSettingsBlock} update={updateCarousel} showStyle />
          <ActionSettingsGroup block={sharedSettingsBlock} update={updateCarousel} title="LINK" terminology="link" targetFirst targetControl="new-window-switch" showFullWidth showMargin showAriaLabel keys={{ label: "buttonLabel", url: "elementLinkUrl", target: "linkTarget", aria: "linkAriaLabel", style: "buttonStyle", size: "buttonSize", width: "fullWidthButton", margin: "linkMarginTop" }} />
        </div>
      );
    }
    return (
      <div className="builder-inspector-stack" data-uikit-capability={isPanelSlider ? "panel-slider-settings" : isOverlaySlider ? "overlay-slider-settings" : "slideshow-settings"}>
        <InspectorDivision title={isPanelSlider ? "SLIDE BEHAVIOR" : isOverlaySlider ? "SLIDER" : "SLIDESHOW"}>
          {isPanelSlider ? (
            <>
              <InspectorFieldRow label="Cards at desktop">
                <InspectorSelect
                  value={String(carouselSettings.cardsPerView ?? 3)}
                  onChange={(value: string) => updateCarousel({ cardsPerView: Number(value) })}
                  options={[
                    { value: "1", label: "1 card" },
                    { value: "2", label: "2 cards" },
                    { value: "3", label: "3 cards" },
                    { value: "4", label: "4 cards" },
                  ]}
                />
              </InspectorFieldRow>

              <InspectorFieldRow label="Slide effect">
                <InspectorSelect
                  value={carouselSettings.effect ?? "slide"}
                  onChange={(value: string) => updateCarousel({ effect: value })}
                  options={[
                    { value: "slide", label: "Slide" },
                    { value: "fade", label: "Fade" },
                  ]}
                />
              </InspectorFieldRow>

              <InspectorFieldRow label="Gap">
                <InspectorSelect
                  value={String(carouselSettings.spaceBetween ?? 24)}
                  onChange={(value: string) => updateCarousel({ spaceBetween: Number(value) })}
                  options={[
                    { value: "12", label: "Small" },
                    { value: "24", label: "Default" },
                    { value: "32", label: "Large" },
                  ]}
                />
              </InspectorFieldRow>

              {([
                ["cardsPerViewPhone", "Phone Portrait", "1"],
                ["cardsPerViewSmall", "Phone Landscape", "2"],
                ["cardsPerViewMedium", "Tablet Landscape", "3"],
                ["cardsPerViewLarge", "Desktop", "3"],
              ] as const).map(([key, label, fallback]) => (
                <InspectorFieldRow key={key} label={label}>
                  <InspectorSelect
                    value={String((carouselSettings as any)[key] ?? fallback)}
                    onChange={(value: string) => updateCarousel({ [key]: Number(value) })}
                    options={[1, 2, 3, 4, 5, 6].map((value) => ({ value: String(value), label: `${value} column${value === 1 ? "" : "s"}` }))}
                  />
                </InspectorFieldRow>
              ))}

              <InspectorFieldRow label="Divider">
                <InspectorSwitch checked={(carouselSettings as any).divider === true} onChange={(checked: boolean) => updateCarousel({ divider: checked })} label="Show dividers" />
              </InspectorFieldRow>

              <InspectorFieldRow label="Center">
                <InspectorSwitch checked={(carouselSettings as any).centered === true} onChange={(checked: boolean) => updateCarousel({ centered: checked })} label="Center the active slide" />
              </InspectorFieldRow>
            </>
          ) : isOverlaySlider ? (
            <>
              <InspectorFieldRow label="Column gap">
                <InspectorSelect
                  value={String(carouselSettings.spaceBetween ?? 30)}
                  onChange={(value: string) => updateCarousel({ spaceBetween: Number(value) })}
                  options={[{ value: "0", label: "None" }, { value: "15", label: "Small" }, { value: "30", label: "Default" }, { value: "40", label: "Large" }]}
                />
              </InspectorFieldRow>
              <InspectorFieldRow label="Divider">
                <InspectorSwitch checked={carouselSettings.divider === true} onChange={(checked: boolean) => updateCarousel({ divider: checked })} label="Show dividers" />
              </InspectorFieldRow>
              <InspectorFieldRow label="Center">
                <InspectorSwitch checked={carouselSettings.centered === true} onChange={(checked: boolean) => updateCarousel({ centered: checked })} label="Center the active slide" />
              </InspectorFieldRow>
              {([
                ["cardsPerViewPhone", "Phone Portrait", "1"],
                ["cardsPerViewSmall", "Phone Landscape", ""],
                ["cardsPerViewMedium", "Tablet Landscape", "3"],
                ["cardsPerViewLarge", "Desktop", ""],
              ] as const).map(([key, label, fallback]) => (
                <InspectorFieldRow key={key} label={label}>
                  <InspectorSelect
                    value={String((carouselSettings as any)[key] ?? fallback)}
                    onChange={(value: string) => updateCarousel({ [key]: value === "" ? undefined : Number(value) })}
                    options={[{ value: "", label: "Inherit" }, ...[1, 2, 3, 4, 5, 6].map((value) => ({ value: String(value), label: `${value} column${value === 1 ? "" : "s"}` }))]}
                  />
                </InspectorFieldRow>
              ))}
            </>
          ) : !isSlideshow ? (
            <InspectorFieldRow label="Variant / Layout">
            <InspectorSelect
              value={carouselSettings.variant ?? "default"}
              onChange={(value: string) => updateCarousel({ variant: value })}
              options={[
                { value: "default", label: "Default" },
                { value: "hero", label: "Hero Banner" },
                { value: "cards", label: "Card Grid" },
                { value: "antigravity", label: "Terminal / Antigravity" },
              ]}
            />
            </InspectorFieldRow>
          ) : null}

          {isSlideshow && (
            <>
              <InspectorFieldRow label="Height">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2">
                  <InspectorSelect
                    value={carouselSettings.slideshowHeight === "viewport" ? "viewport" : "auto"}
                    onChange={(value: string) => updateCarousel({ slideshowHeight: value })}
                    options={[{ value: "auto", label: "Auto" }, { value: "viewport", label: "Viewport" }]}
                  />
                  <InspectorTextField
                    value={carouselSettings.slideshowViewportHeight == null ? "100" : String(carouselSettings.slideshowViewportHeight)}
                    onChange={(value: string) => updateCarousel({ slideshowViewportHeight: Math.min(100, Math.max(0, Number(value) || 0)) })}
                    placeholder="100"
                    disabled={carouselSettings.slideshowHeight !== "viewport"}
                  />
                </div>
              </InspectorFieldRow>
              {carouselSettings.slideshowHeight !== "viewport" && <>
                <InspectorFieldRow label="Ratio">
                  <InspectorTextField value={carouselSettings.slideshowRatio ?? carouselSettings.aspectRatio ?? ""} onChange={(value: string) => updateCarousel({ slideshowRatio: value || undefined, aspectRatio: value || undefined })} placeholder="16:9" />
                </InspectorFieldRow>
              </>}
              <InspectorFieldRow label="Min Height">
                <InspectorTextField value={carouselSettings.slideshowMinHeight == null ? "" : String(carouselSettings.slideshowMinHeight)} onChange={(value: string) => updateCarousel({ slideshowMinHeight: value === "" ? undefined : Number(value) || undefined })} placeholder="300" />
              </InspectorFieldRow>
              {carouselSettings.slideshowHeight !== "viewport" && (
                <InspectorFieldRow label="Max Height">
                  <InspectorTextField value={carouselSettings.slideshowMaxHeight == null ? "" : String(carouselSettings.slideshowMaxHeight)} onChange={(value: string) => updateCarousel({ slideshowMaxHeight: value === "" ? undefined : Number(value) || undefined })} placeholder="1600" />
                </InspectorFieldRow>
              )}
              <InspectorFieldRow label="Text Color">
                <InspectorSelect
                  value={carouselSettings.overlayTextColor ?? "none"}
                  onChange={(value: string) => updateCarousel({ overlayTextColor: value === "none" ? undefined : value })}
                  options={[{ value: "none", label: "None" }, { value: "light", label: "Light" }, { value: "dark", label: "Dark" }]}
                />
              </InspectorFieldRow>
            </>
          )}

          {!isSlideshow && (
            <>
              <InspectorFieldRow label="Autoplay">
                <InspectorSwitch
                  checked={carouselSettings.autoplay !== false}
                  onChange={(checked: boolean) => updateCarousel({ autoplay: checked })}
                  label="Autoplay slides"
                />
              </InspectorFieldRow>

              <InspectorFieldRow label="Autoplay interval">
                <InspectorSelect
                  value={String(carouselSettings.autoplayDelayMs ?? 5000)}
                  onChange={(value: string) => updateCarousel({ autoplayDelayMs: Number(value) })}
                  options={[5, 7, 10, 15].map((seconds) => ({ value: String(seconds * 1000), label: `${seconds} seconds` }))}
                />
              </InspectorFieldRow>

              <InspectorFieldRow label="Pause autoplay on hover">
                <InspectorSwitch checked={carouselSettings.pauseOnHover !== false} onChange={(checked: boolean) => updateCarousel({ pauseOnHover: checked })} label="Pause on hover" />
              </InspectorFieldRow>
            </>
          )}

          {!isSlideshow && (
            <InspectorFieldRow label="Loop Continuously">
              <InspectorSwitch
                checked={carouselSettings.loop !== false}
                onChange={(checked: boolean) => updateCarousel({ loop: checked })}
                label="Loop"
              />
            </InspectorFieldRow>
          )}

          {!isSlideshow && (
            <InspectorFieldRow label="Navigation Arrows">
              <InspectorSwitch
                checked={carouselSettings.showArrows ?? (carouselSettings.showNavigation !== false)}
                onChange={(checked: boolean) => updateCarousel({ showArrows: checked })}
                label="Show prev/next arrows"
              />
            </InspectorFieldRow>
          )}

          {!isSlideshow && (
            <InspectorFieldRow label="Pagination Dots">
              <InspectorSwitch
                checked={carouselSettings.showDots ?? (carouselSettings.showPagination !== false)}
                onChange={(checked: boolean) => updateCarousel({ showDots: checked })}
                label="Show pagination dots"
              />
            </InspectorFieldRow>
          )}
        </InspectorDivision>

        {isSlideshow && (
          <InspectorDivision title="ANIMATION">
            <InspectorFieldRow label="Transition">
              <InspectorSelect
                value={carouselSettings.effect ?? "slide"}
                onChange={(value: string) => updateCarousel({ effect: value })}
                options={[{ value: "slide", label: "Slide" }, { value: "fade", label: "Fade" }]}
              />
            </InspectorFieldRow>
            <InspectorFieldRow label="Autoplay">
              <InspectorSwitch
                checked={carouselSettings.autoplay === true}
                onChange={(checked: boolean) => updateCarousel({ autoplay: checked })}
                label="Enable autoplay"
              />
            </InspectorFieldRow>
            <InspectorFieldRow label="Pause autoplay on hover">
              <InspectorSwitch checked={carouselSettings.pauseOnHover !== false} onChange={(checked: boolean) => updateCarousel({ pauseOnHover: checked })} label="Pause autoplay on hover" />
            </InspectorFieldRow>
            <InspectorFieldRow label="Autoplay Interval">
              <InspectorSelect
                value={String(carouselSettings.autoplayDelayMs ?? 7000)}
                onChange={(value: string) => updateCarousel({ autoplayDelayMs: Number(value) })}
                options={[5, 7, 10, 15].map((seconds) => ({ value: String(seconds * 1000), label: `${seconds} seconds` }))}
              />
            </InspectorFieldRow>
          </InspectorDivision>
        )}

        {isOverlaySlider && (
          <InspectorDivision title="OVERLAY">
            <InspectorFieldRow label="Mode">
              <InspectorSelect
                value={carouselSettings.overlayMode ?? "cover"}
                onChange={(value: string) => updateCarousel({ overlayMode: value })}
                options={[{ value: "cover", label: "Cover" }, { value: "caption", label: "Caption" }]}
              />
            </InspectorFieldRow>
            <InspectorFieldRow label="Display">
              <InspectorSelect
                value={carouselSettings.overlayDisplay ?? "always"}
                onChange={(value: string) => updateCarousel({ overlayDisplay: value })}
                options={[{ value: "always", label: "Always" }, { value: "hover", label: "Hover" }, { value: "active", label: "Active" }]}
              />
            </InspectorFieldRow>
            <InspectorFieldRow label="Position">
              <InspectorSelect
                value={carouselSettings.overlayPosition ?? "center"}
                onChange={(value: string) => updateCarousel({ overlayPosition: value })}
                options={[
                  { value: "top-left", label: "Top left" }, { value: "top-right", label: "Top right" },
                  { value: "bottom-left", label: "Bottom left" }, { value: "bottom-center", label: "Bottom center" },
                  { value: "bottom-right", label: "Bottom right" }, { value: "center", label: "Center" },
                ]}
              />
            </InspectorFieldRow>
            <InspectorFieldRow label="Padding">
              <InspectorSelect
                value={carouselSettings.overlayPadding ?? "default"}
                onChange={(value: string) => updateCarousel({ overlayPadding: value })}
                options={[{ value: "default", label: "Default" }, { value: "small", label: "Small" }, { value: "large", label: "Large" }, { value: "none", label: "None" }]}
              />
            </InspectorFieldRow>
          </InspectorDivision>
        )}

        {isSlideshow && (
          <InspectorDivision title="NAVIGATION">
            <InspectorFieldRow label="Navigation">
              <InspectorSelect
                value={carouselSettings.navigationType ?? (carouselSettings.showDots === false ? "none" : "dotnav")}
                onChange={(value: string) => updateCarousel({
                  navigationType: value,
                  showDots: value === "dotnav",
                })}
                options={[
                  { value: "none", label: "None" },
                  { value: "dotnav", label: "Dotnav" },
                  { value: "thumbnav", label: "Thumbnav" },
                ]}
              />
            </InspectorFieldRow>
            <InspectorFieldRow label="Show below slideshow">
              <InspectorSwitch
                checked={carouselSettings.navigationBelow === true}
                onChange={(checked: boolean) => updateCarousel({ navigationBelow: checked })}
                label="Show below slideshow"
              />
            </InspectorFieldRow>
            <InspectorFieldRow label="Show on hover only">
              <InspectorSwitch
                checked={carouselSettings.navigationHoverOnly === true}
                onChange={(checked: boolean) => updateCarousel({ navigationHoverOnly: checked })}
                label="Show on hover only"
              />
            </InspectorFieldRow>
            <InspectorFieldRow label="Vertical navigation">
              <InspectorSwitch
                checked={carouselSettings.navigationVertical === true}
                onChange={(checked: boolean) => updateCarousel({ navigationVertical: checked })}
                label="Vertical navigation"
              />
            </InspectorFieldRow>
            <InspectorFieldRow label="Position">
              <InspectorSelect
                value={carouselSettings.paginationPosition ?? "bottom-center"}
                onChange={(value: string) => updateCarousel({ paginationPosition: value })}
                options={[
                  { value: "top-left", label: "Top Left" },
                  { value: "top-right", label: "Top Right" },
                  { value: "center-left", label: "Center Left" },
                  { value: "center-right", label: "Center Right" },
                  { value: "bottom-left", label: "Bottom Left" },
                  { value: "bottom-center", label: "Bottom Center" },
                  { value: "bottom-right", label: "Bottom Right" },
                ]}
              />
            </InspectorFieldRow>
            <InspectorFieldRow label="Margin">
              <InspectorSelect
                value={carouselSettings.navigationMargin ?? "medium"}
                onChange={(value: string) => updateCarousel({ navigationMargin: value })}
                options={[
                  { value: "none", label: "None" },
                  { value: "small", label: "Small" },
                  { value: "medium", label: "Medium" },
                  { value: "large", label: "Large" },
                ]}
              />
            </InspectorFieldRow>
            <InspectorFieldRow label="Breakpoint">
              <InspectorSelect
                value={carouselSettings.navigationBreakpoint ?? "always"}
                onChange={(value: string) => updateCarousel({ navigationBreakpoint: value })}
                options={[
                  { value: "always", label: "Always" },
                  { value: "small", label: "Small (Phone Landscape)" },
                  { value: "medium", label: "Medium (Tablet Landscape)" },
                  { value: "large", label: "Large (Desktop)" },
                  { value: "xlarge", label: "X-Large (Large Screens)" },
                ]}
              />
            </InspectorFieldRow>
            {carouselSettings.navigationType === "thumbnav" && carouselSettings.showNavigationThumbnail !== false && (
              <>
                <InspectorFieldRow label="Thumbnail Width/Height">
                  <div className="grid grid-cols-2 gap-2">
                    <InspectorTextField value={carouselSettings.thumbnavWidth == null ? "100" : String(carouselSettings.thumbnavWidth)} onChange={(value: string) => updateCarousel({ thumbnavWidth: Number(value) || 100 })} />
                    <InspectorTextField value={carouselSettings.thumbnavHeight == null ? "75" : String(carouselSettings.thumbnavHeight)} onChange={(value: string) => updateCarousel({ thumbnavHeight: Number(value) || 75 })} />
                  </div>
                </InspectorFieldRow>
                <InspectorFieldRow label="Thumbnail Wrap">
                  <InspectorSwitch checked={carouselSettings.thumbnavNoWrap === true} onChange={(checked: boolean) => updateCarousel({ thumbnavNoWrap: checked })} label="Don't wrap into multiple lines" />
                </InspectorFieldRow>
              </>
            )}
          </InspectorDivision>
        )}

        {isSlideshow && (
          <InspectorDivision title="SLIDENAV">
            <InspectorFieldRow label="Position">
              <InspectorSelect
                value={carouselSettings.showArrows === false ? "none" : (carouselSettings.arrowPosition === "overlay" || !carouselSettings.arrowPosition ? "default" : (carouselSettings.arrowPosition === "outer" ? "outside" : carouselSettings.arrowPosition))}
                onChange={(value: string) => updateCarousel(
                  value === "none"
                    ? { showArrows: false }
                    : { showArrows: true, arrowPosition: value === "default" ? "overlay" : (value === "outside" ? "outer" : value) },
                )}
                options={[
                  { value: "none", label: "None" },
                  { value: "default", label: "Default" },
                  { value: "outside", label: "Outside" },
                  { value: "top-left", label: "Top Left" },
                  { value: "top-right", label: "Top Right" },
                  { value: "center-left", label: "Center Left" },
                  { value: "center-right", label: "Center Right" },
                  { value: "bottom-left", label: "Bottom Left" },
                  { value: "bottom-center", label: "Bottom Center" },
                  { value: "bottom-right", label: "Bottom Right" },
                ]}
              />
            </InspectorFieldRow>
            <InspectorFieldRow label="Show on hover only">
              <InspectorSwitch
                checked={carouselSettings.slidenavHoverOnly === true}
                onChange={(checked: boolean) => updateCarousel({ slidenavHoverOnly: checked })}
                label="Show on hover only"
              />
            </InspectorFieldRow>
            <InspectorFieldRow label="Larger style">
              <InspectorSwitch
                checked={carouselSettings.slidenavLarger === true}
                onChange={(checked: boolean) => updateCarousel({ slidenavLarger: checked })}
                label="Larger style"
              />
            </InspectorFieldRow>
            <InspectorFieldRow label="Margin">
              <InspectorSelect
                value={carouselSettings.slidenavMargin ?? "medium"}
                onChange={(value: string) => updateCarousel({ slidenavMargin: value })}
                options={[
                  { value: "none", label: "None" },
                  { value: "small", label: "Small" },
                  { value: "medium", label: "Medium" },
                  { value: "large", label: "Large" },
                ]}
              />
            </InspectorFieldRow>
            <InspectorFieldRow label="Breakpoint">
              <InspectorSelect
                value={carouselSettings.slidenavBreakpoint ?? "always"}
                onChange={(value: string) => updateCarousel({ slidenavBreakpoint: value === "always" ? undefined : value })}
                options={[
                  { value: "always", label: "Always" },
                  { value: "small", label: "Small (Phone Landscape)" },
                  { value: "medium", label: "Medium (Tablet Landscape)" },
                  { value: "large", label: "Large (Desktop)" },
                  { value: "xlarge", label: "X-Large (Large Screens)" },
                ]}
              />
            </InspectorFieldRow>
          </InspectorDivision>
        )}

        {isSlideshow && (
          <InspectorDivision title="OVERLAY">
            <InspectorFieldRow label="Position">
              <InspectorSelect
                value={carouselSettings.overlayPosition ?? "center"}
                onChange={(value: string) => updateCarousel({ overlayPosition: value })}
                options={[
                  { value: "top-left", label: "Top Left" },
                  { value: "top-right", label: "Top Right" },
                  { value: "center-left", label: "Center Left" },
                  { value: "center", label: "Center" },
                  { value: "center-right", label: "Center Right" },
                  { value: "bottom-left", label: "Bottom Left" },
                  { value: "bottom-center", label: "Bottom Center" },
                  { value: "bottom-right", label: "Bottom Right" },
                ]}
              />
            </InspectorFieldRow>
            <InspectorFieldRow label="Padding">
              <InspectorSelect
                value={carouselSettings.overlayPadding ?? "default"}
                onChange={(value: string) => updateCarousel({ overlayPadding: value })}
                options={[
                  { value: "none", label: "None" },
                  { value: "small", label: "Small" },
                  { value: "default", label: "Default" },
                  { value: "large", label: "Large" },
                ]}
              />
            </InspectorFieldRow>
          </InspectorDivision>
        )}

        {isSlideshow && (
          <ActionSettingsGroup
            block={sharedSettingsBlock}
            update={updateCarousel}
            title="LINK"
            terminology="link"
            showUrl={false}
            showFullWidth
            showMargin
            targetFirst
            targetControl="new-window-switch"
            presentationControl="select"
            keys={{ label: "buttonLabel", target: "linkTarget", style: "buttonStyle", size: "buttonSize", width: "fullWidthButton", margin: "linkMarginTop" }}
          />
        )}

        {!isSlideshow && (
        <InspectorDivision title="NAVIGATION PRESENTATION">
          <InspectorFieldRow
            label="Arrow style"
            isOverridden={carouselSettings.arrowStyle !== undefined}
            inheritedValueText={inheritedArrowStyle}
            onReset={() => updateCarousel({ arrowStyle: undefined })}
          >
            <InspectorSelect
              value={carouselSettings.arrowStyle ?? inheritedArrowStyle}
              onChange={(value: string) => updateCarousel({ arrowStyle: value })}
              options={[
                { value: "chevron", label: "Chevron" },
                { value: "glass-circle", label: "Glass circle" },
                { value: "solid-dark", label: "Solid dark" },
                { value: "minimal-light", label: "Minimal light" },
                { value: "outer", label: "Outside" },
                { value: "hidden", label: "Hidden" },
              ]}
            />
          </InspectorFieldRow>

          <InspectorFieldRow
            label="Arrow position"
            isOverridden={carouselSettings.arrowPosition !== undefined}
            inheritedValueText={inheritedArrowPosition}
            onReset={() => updateCarousel({ arrowPosition: undefined })}
          >
            <InspectorSelect
              value={carouselSettings.arrowPosition ?? inheritedArrowPosition}
              onChange={(value: string) => updateCarousel({ arrowPosition: value })}
              options={[
                { value: "overlay", label: "Overlay" },
                { value: "outer", label: "Outside" },
                { value: "bottom", label: "Bottom" },
                { value: "bottom-right", label: "Bottom right" },
                { value: "bottom-left", label: "Bottom left" },
                { value: "top-right", label: "Top right" },
                { value: "top-left", label: "Top left" },
              ]}
            />
          </InspectorFieldRow>

          <InspectorFieldRow
            label="Dot navigation style"
            isOverridden={carouselSettings.paginationStyle !== undefined}
            inheritedValueText={inheritedDotnavStyle}
            onReset={() => updateCarousel({ paginationStyle: undefined })}
          >
            <InspectorSelect
              value={carouselSettings.paginationStyle ?? inheritedDotnavStyle}
              onChange={(value: string) => updateCarousel({ paginationStyle: value })}
              options={[
                { value: "simple-dots", label: "Simple dots" },
                { value: "minimal-dots", label: "Minimal dots" },
                { value: "expanding-pills", label: "Expanding pills" },
                { value: "fraction", label: "Fraction" },
                { value: "progress", label: "Progress" },
                { value: "hidden", label: "Hidden" },
              ]}
            />
          </InspectorFieldRow>

          <InspectorFieldRow
            label="Dot navigation position"
            isOverridden={carouselSettings.paginationPosition !== undefined}
            inheritedValueText={inheritedDotnavPosition}
            onReset={() => updateCarousel({ paginationPosition: undefined })}
          >
            <InspectorSelect
              value={carouselSettings.paginationPosition ?? inheritedDotnavPosition}
              onChange={(value: string) => updateCarousel({ paginationPosition: value })}
              options={[
                { value: "bottom", label: "Bottom" },
                { value: "top", label: "Top" },
                { value: "overlay", label: "Overlay" },
              ]}
            />
          </InspectorFieldRow>
        </InspectorDivision>
        )}

        {isPanelSlider && (
          <>
            <CardSettingsGroup
              block={sharedSettingsBlock}
              update={updateCarousel}
              title="PANEL"
              showLink
              keys={{ variant: "panelStyle", size: "panelSize", hover: "panelHover", link: "linkPanel" }}
            />
            <ImageSettingsGroup block={sharedSettingsBlock} update={updateCarousel} showFrameless />
          </>
        )}

        {isSlideshow ? (
          <>
            <TitleSettingsGroup block={sharedSettingsBlock} update={updateCarousel} />
            <MetaSettingsGroup block={sharedSettingsBlock} update={updateCarousel} showStyle />
            <ContentSettingsGroup
              block={sharedSettingsBlock}
              update={updateCarousel}
              title="CONTENT STYLE"
              showStyle
            />
          </>
        ) : (
          <>
            <TitleSettingsGroup block={block} update={update} />
            <MetaSettingsGroup block={block} update={update} showStyle />
            <ContentSettingsGroup block={block} update={update} showStyle />
            {!isPanelSlider && <LinkSettingsGroup block={block} update={update} />}
          </>
        )}
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // TAB 3: ADVANCED
  // --------------------------------------------------------------------------
  if (isSlideshow) {
    return <ElementAdvancedPanel block={block} update={update} />;
  }

  return (
    <div className="builder-inspector-stack" data-uikit-capability="slider-advanced">
      <InspectorDivision title="GENERAL">
        <InspectorFieldRow label="Custom HTML ID">
          <InspectorTextField
            value={rawBlock.customId ?? ""}
            onChange={(value: string) => update({ customId: value } as any)}
            placeholder="my-slider-id"
          />
        </InspectorFieldRow>

        <InspectorFieldRow label="Custom CSS Class">
          <InspectorTextField
            value={rawBlock.customClass ?? ""}
            onChange={(value: string) => update({ customClass: value } as any)}
            placeholder="my-custom-class"
          />
        </InspectorFieldRow>
      </InspectorDivision>
    </div>
  );
}
