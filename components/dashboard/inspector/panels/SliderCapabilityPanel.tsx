"use client";

import React, { useRef } from "react";
import { Plus, ImagePlus } from "lucide-react";
import type { BuilderLayoutBlock, InspectorTab } from "@/components/dashboard/builderTypes";
import type { BuilderShellSettings } from "@/lib/builderShell";
import RepeatableItemShell from "@/components/dashboard/inspector/RepeatableItemShell";
import {
  InspectorDivision,
  InspectorFieldRow,
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
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const updateCarousel = (patch: any) => {
    update({
      carouselSettings: {
        ...carouselSettings,
        ...patch,
      },
    } as any);
  };

  const handleAddMediaFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const newSlides: any[] = [];
    Array.from(files).forEach((file, index) => {
      const url = URL.createObjectURL(file);
      newSlides.push({
        id: String(Date.now() + index),
        imageUrl: url,
        title: file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "),
        subtitle: "",
        text: "",
        buttonLabel: "",
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
      <div className="builder-inspector-stack" data-uikit-capability="slider-content">
        <InspectorDivision title="HEADING & INTRO">
          <InspectorFieldRow label="Block Title">
            <InspectorTextField
              value={rawBlock.title ?? ""}
              onChange={(value: string) => update({ title: value })}
              placeholder="Slider title..."
            />
          </InspectorFieldRow>

          <InspectorFieldRow label="Block Subtitle / Body">
            <InspectorTextarea
              value={rawBlock.body ?? ""}
              onChange={(value: string) => update({ body: value })}
              placeholder="Slider intro text..."
            />
          </InspectorFieldRow>
        </InspectorDivision>

        <InspectorDivision title="SLIDES">
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
                      title: `Slide ${slides.length + 1}`,
                      subtitle: "Subtitle",
                      text: "Slide description copy...",
                      buttonLabel: "Learn More",
                      buttonUrl: "#",
                      imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80",
                    },
                  ],
                } as any)
              }
            >
              <Plus size={14} />
              <span>ADD SLIDE</span>
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
                    title: "Select Slide Media (Select Multiple)",
                    multiple: true,
                    onSelect: (media: any) => {
                      update({
                        slides: [
                          ...slides,
                          {
                            id: String(Date.now()),
                            imageUrl: media.sourceUrl,
                            title: media.title || media.altText || "Slide Image",
                            subtitle: "",
                            text: "",
                          },
                        ],
                      } as any);
                    },
                    onSelectMany: (mediaItems: any[]) => {
                      const newSlides = mediaItems.map((media, idx) => ({
                        id: String(Date.now() + idx),
                        imageUrl: media.sourceUrl,
                        title: media.title || media.altText || `Slide ${slides.length + idx + 1}`,
                        subtitle: "",
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
            getItemSummary={(slide: any, index: number) => slide.title || `Slide ${index + 1}`}
            itemLabel="Slide"
            addLabel="Add slide"
            onAdd={() =>
              update({
                slides: [
                  ...slides,
                  {
                    id: String(Date.now()),
                    title: `Slide ${slides.length + 1}`,
                    subtitle: "Subtitle",
                    text: "Slide description copy...",
                    buttonLabel: "Learn More",
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

              return (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <InspectorFieldRow label="Title">
                    <InspectorTextField
                      value={slide.title ?? ""}
                      onChange={(value: string) => updateSlide({ title: value })}
                      placeholder="Slide title..."
                    />
                  </InspectorFieldRow>

                  <InspectorFieldRow label="Subtitle / Badge">
                    <InspectorTextField
                      value={slide.subtitle ?? ""}
                      onChange={(value: string) => updateSlide({ subtitle: value })}
                      placeholder="Subtitle..."
                    />
                  </InspectorFieldRow>

                  <InspectorFieldRow label="Description Copy">
                    <InspectorTextarea
                      value={slide.text ?? ""}
                      onChange={(value: string) => updateSlide({ text: value })}
                      placeholder="Slide copy..."
                    />
                  </InspectorFieldRow>

                  <InspectorFieldRow label="Image URL">
                    <div style={{ display: "flex", gap: "6px" }}>
                      <InspectorTextField
                        value={slide.imageUrl ?? ""}
                        onChange={(value: string) => updateSlide({ imageUrl: value })}
                        placeholder="https://..."
                      />
                      {openWordPressMediaPicker && (
                        <button
                          type="button"
                          className="builder-btn builder-btn-secondary"
                          style={{ padding: "0 8px", fontSize: "11px", whiteSpace: "nowrap" }}
                          onClick={() =>
                            openWordPressMediaPicker({
                              title: "Select Slide Image",
                              currentUrl: slide.imageUrl,
                              onSelect: (media: any) => updateSlide({ imageUrl: media.sourceUrl }),
                            })
                          }
                        >
                          Pick
                        </button>
                      )}
                    </div>
                  </InspectorFieldRow>

                  <InspectorFieldRow label="Button Label">
                    <InspectorTextField
                      value={slide.buttonLabel ?? ""}
                      onChange={(value: string) => updateSlide({ buttonLabel: value })}
                      placeholder="Button text..."
                    />
                  </InspectorFieldRow>

                  <InspectorFieldRow label="Button Link URL">
                    <InspectorTextField
                      value={slide.buttonUrl ?? ""}
                      onChange={(value: string) => updateSlide({ buttonUrl: value })}
                      placeholder="/"
                    />
                  </InspectorFieldRow>
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
      <div className="builder-inspector-stack" data-uikit-capability="slider-settings">
        <InspectorDivision title="SLIDER & CAROUSEL">
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

          <InspectorFieldRow label="Autoplay">
            <InspectorSwitch
              checked={carouselSettings.autoplay !== false}
              onChange={(checked: boolean) => updateCarousel({ autoplay: checked })}
              label="Autoplay slides"
            />
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
              checked={carouselSettings.showNavigation !== false}
              onChange={(checked: boolean) => updateCarousel({ showNavigation: checked })}
              label="Show prev/next arrows"
            />
          </InspectorFieldRow>

          <InspectorFieldRow label="Pagination Dots">
            <InspectorSwitch
              checked={carouselSettings.showPagination !== false}
              onChange={(checked: boolean) => updateCarousel({ showPagination: checked })}
              label="Show pagination dots"
            />
          </InspectorFieldRow>
        </InspectorDivision>
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
