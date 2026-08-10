"use client";

import React, { useRef, useState } from "react";
import { Plus, ImagePlus } from "lucide-react";
import type { BuilderLayoutBlock, InspectorTab } from "@/components/dashboard/builderTypes";
import type { BuilderShellSettings } from "@/lib/builderShell";
import IconPicker from "@/components/dashboard/inspector/IconPicker";
import RepeatableItemShell from "@/components/dashboard/inspector/RepeatableItemShell";
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
  const [activeItemTabs, setActiveItemTabs] = useState<Record<string, "content" | "settings">>({});

  const updateCarousel = (patch: any) => {
    const nextCarouselSettings = {
      ...carouselSettings,
      ...patch,
    };

    if (!isPanelSlider || slides.length === 0) {
      update({ carouselSettings: nextCarouselSettings } as any);
      return;
    }

    const sharedKeys = Object.keys(LEGACY_PANEL_SLIDER_ITEM_DEFAULTS).filter((key) =>
      Object.prototype.hasOwnProperty.call(patch, key),
    );

    if (sharedKeys.length === 0) {
      update({ carouselSettings: nextCarouselSettings } as any);
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
      return nextSlide;
    });

    update({
      carouselSettings: nextCarouselSettings,
      slides: migratedSlides,
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
        <InspectorDivision title="HEADING & INTRO">
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
        </InspectorDivision>

        {!isPanelSlider && (
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

        <InspectorDivision title={isPanelSlider ? "PANEL SLIDES" : "SLIDES"}>
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

              const itemKey = String(slide.id ?? index);
              const activeTab = activeItemTabs[itemKey] ?? "content";
              const updateItemTab = (value: string) =>
                setActiveItemTabs((current) => ({
                  ...current,
                  [itemKey]: value as "content" | "settings",
                }));

              return (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <InspectorPillGroup
                    value={activeTab}
                    options={[
                      { value: "content", label: "Content" },
                      { value: "settings", label: "Settings" },
                    ]}
                    onChange={updateItemTab}
                    ariaLabel={`${itemLabel} ${index + 1} tab`}
                  />

                  {activeTab === "content" ? (
                    <>
                      <InspectorFieldRow label="Title">
                        <InspectorTextField
                          value={slide.title ?? ""}
                          onChange={(value: string) => updateSlide({ title: value })}
                          placeholder={`${itemLabel} title...`}
                          ariaLabel={`${itemLabel} ${index + 1} title`}
                        />
                      </InspectorFieldRow>

                      <InspectorFieldRow label="Meta">
                        <InspectorTextField
                          value={slide.meta ?? slide.subtitle ?? ""}
                          onChange={(value: string) => updateSlide({ meta: value })}
                          placeholder="Meta text..."
                          ariaLabel={`${itemLabel} ${index + 1} meta`}
                        />
                      </InspectorFieldRow>

                      <InspectorFieldRow label="Content">
                        <InspectorTextarea
                          value={slide.text ?? ""}
                          onChange={(value: string) => updateSlide({ text: value })}
                          placeholder={`${itemLabel} content...`}
                          ariaLabel={`${itemLabel} ${index + 1} content`}
                        />
                      </InspectorFieldRow>

                      <InspectorFieldRow label="Image">
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
                      </InspectorFieldRow>

                      <InspectorFieldRow label="Icon">
                        <IconPicker
                          value={slide.iconName}
                          onChange={(iconName) => updateSlide({ iconName })}
                          onClear={() => updateSlide({ iconName: undefined })}
                          ariaLabel={`${itemLabel} ${index + 1} icon`}
                        />
                      </InspectorFieldRow>

                      <InspectorFieldRow label="Link URL">
                        <InspectorTextField
                          value={slide.buttonUrl ?? ""}
                          onChange={(value: string) => updateSlide({ buttonUrl: value })}
                          placeholder="https://..."
                          ariaLabel={`${itemLabel} ${index + 1} link URL`}
                        />
                      </InspectorFieldRow>
                    </>
                  ) : (
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
                  )}
                </div>
              );
            }}
          />
        </InspectorDivision>

      </div>
    );
  }

  // --------------------------------------------------------------------------
  // TAB 2: SETTINGS
  // --------------------------------------------------------------------------
  if (tab === "style") {
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
          ) : (
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
          )}

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

          <InspectorFieldRow label="Loop Continuously">
            <InspectorSwitch
              checked={carouselSettings.loop !== false}
              onChange={(checked: boolean) => updateCarousel({ loop: checked })}
              label="Loop"
            />
          </InspectorFieldRow>

          <InspectorFieldRow label="Navigation Arrows">
            <InspectorSwitch
              checked={carouselSettings.showArrows ?? (carouselSettings.showNavigation !== false)}
              onChange={(checked: boolean) => updateCarousel({ showArrows: checked })}
              label="Show prev/next arrows"
            />
          </InspectorFieldRow>

          <InspectorFieldRow label="Pagination Dots">
            <InspectorSwitch
              checked={carouselSettings.showDots ?? (carouselSettings.showPagination !== false)}
              onChange={(checked: boolean) => updateCarousel({ showDots: checked })}
              label="Show pagination dots"
            />
          </InspectorFieldRow>
        </InspectorDivision>

        {isSlideshow && (
          <InspectorDivision title="HEIGHT">
            <InspectorFieldRow label="Height">
              <InspectorSelect
                value={carouselSettings.slideshowHeight === "viewport" ? "viewport" : "auto"}
                onChange={(value: string) => updateCarousel({ slideshowHeight: value })}
                options={[{ value: "auto", label: "Auto" }, { value: "viewport", label: "Viewport" }]}
              />
            </InspectorFieldRow>
            <InspectorFieldRow label="Ratio">
              <InspectorTextField value={carouselSettings.slideshowRatio ?? carouselSettings.aspectRatio ?? ""} onChange={(value: string) => updateCarousel({ slideshowRatio: value || undefined, aspectRatio: value || undefined })} placeholder="16:9" />
            </InspectorFieldRow>
          </InspectorDivision>
        )}

        {isSlideshow && (
          <InspectorDivision title="TRANSITION">
            <InspectorFieldRow label="Transition">
              <InspectorSelect
                value={carouselSettings.effect ?? "slide"}
                onChange={(value: string) => updateCarousel({ effect: value })}
                options={[{ value: "slide", label: "Slide" }, { value: "fade", label: "Fade" }]}
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

        <TitleSettingsGroup block={block} update={update} />
        <MetaSettingsGroup block={block} update={update} showStyle />
        <ContentSettingsGroup block={block} update={update} showStyle />
        {!isPanelSlider && <LinkSettingsGroup block={block} update={update} />}
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // TAB 3: ADVANCED
  // --------------------------------------------------------------------------
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
