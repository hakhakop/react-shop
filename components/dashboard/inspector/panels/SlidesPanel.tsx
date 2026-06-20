"use client";

import React, { useState } from "react";
import { useInspector } from "../../context/InspectorContext";
import { Plus, Trash2 } from "lucide-react";
import RichTextEditor from "../../RichTextEditor";
import { BuilderImageUrlControl, InspectorGroupSummary } from "./InspectorSharedControls";
import type { SlideImagePadding } from "@/components/dashboard/builderTypes";

export default function SlidesPanel() {
  const {
    selectedLayoutBlock,
    updateSelectedLayoutBlockByKey,
    getSelectedBlockIndices,
    addSelectedLayoutBlockSlide,
    deleteSelectedLayoutBlockSlide,
    updateSelectedLayoutBlockSlide,
    uploadSelectedLayoutBlockSlideImage,
    uploadingNestedSlide,
    openWordPressMediaPicker,
    selectedLayoutBlockKey,
    openSlideId,
    setOpenSlideId,
  } = useInspector();

  if (!selectedLayoutBlock) return null;

  const block = selectedLayoutBlock;
  const indices = getSelectedBlockIndices();
  if (!indices) return null;

  const { itemIndex, blockIndex } = indices;
  const slides = block.slides ?? [];

  return (
    <div className="builder-inspector-stack">
      {/* Block Title */}
      <div className="builder-inspector-section">
        <label className="builder-field">
          <span>Block Title</span>
          <input
            value={block.title ?? ""}
            onChange={(event) => updateSelectedLayoutBlockByKey({ title: event.target.value })}
            placeholder="Slider block label..."
          />
        </label>
      </div>

      {/* Repeated Slides */}
      <div className="builder-inspector-section" style={{ borderTop: "1px solid var(--builder-ui-border)", paddingTop: "14px", marginTop: "14px" }}>
        <div className="builder-field-header" style={{ marginBottom: "10px" }}>
          <strong>{block.kind === "slider" ? "Slider Slides" : "Story Slides"}</strong>
          <small>{slides.length} slide{slides.length === 1 ? "" : "s"}</small>
        </div>

        <button
          type="button"
          className="builder-inline-add builder-full-button"
          onClick={() => addSelectedLayoutBlockSlide(itemIndex, blockIndex)}
          style={{ marginBottom: "12px" }}
        >
          <Plus size={15} />
          Add slide
        </button>

        <div className="builder-repeatable-tabs">
          {slides.map((slide, slideIndex) => {
            const slideKey = slide.id ?? `${selectedLayoutBlockKey}-nested-slide-${slideIndex}`;
            const isSlideOpen = openSlideId === slideKey || (!openSlideId && slideIndex === 0);

            return (
              <div key={slideKey} className={`builder-nested-card${isSlideOpen ? " is-open" : ""}`}>
                <div className="builder-nested-card-header">
                  <button
                    type="button"
                    className="builder-slide-toggle"
                    onClick={() => setOpenSlideId(isSlideOpen ? null : slideKey)}
                  >
                    <span>Slide {slideIndex + 1}</span>
                    <small>{slide.title || "Untitled slide"}</small>
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteSelectedLayoutBlockSlide(itemIndex, blockIndex, slideIndex)}
                    title="Delete slide"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                {isSlideOpen && (
                  <div className="builder-nested-card-body">
                    <label className="builder-field">
                      <span>Slide Badge</span>
                      <input
                        value={slide.badge ?? ""}
                        onChange={(e) =>
                          updateSelectedLayoutBlockSlide(itemIndex, blockIndex, slideIndex, { badge: e.target.value })
                        }
                      />
                    </label>
                    
                    <label className="builder-field">
                      <span>Slide Title</span>
                      <input
                        value={slide.title ?? ""}
                        onChange={(e) =>
                          updateSelectedLayoutBlockSlide(itemIndex, blockIndex, slideIndex, { title: e.target.value })
                        }
                      />
                    </label>

                    <label className="builder-field">
                      <span>Slide Text</span>
                      <RichTextEditor
                        value={slide.text ?? ""}
                        onChange={(val) =>
                          updateSelectedLayoutBlockSlide(itemIndex, blockIndex, slideIndex, { text: val })
                        }
                      />
                    </label>

                    <label className="builder-field">
                      <span>Image URL</span>
                      <BuilderImageUrlControl
                        value={slide.imageUrl ?? ""}
                        onChange={(e) =>
                          updateSelectedLayoutBlockSlide(itemIndex, blockIndex, slideIndex, { imageUrl: e.target.value })
                        }
                        onChoose={() =>
                          openWordPressMediaPicker({
                            title: `Slide ${slideIndex + 1} Image`,
                            currentUrl: slide.imageUrl,
                            onSelect: (media) =>
                              updateSelectedLayoutBlockSlide(itemIndex, blockIndex, slideIndex, {
                                imageUrl: media.sourceUrl,
                                imageAlt: slide.imageAlt || media.altText || media.title,
                              }),
                          })
                        }
                      />
                    </label>

                    <label className="builder-upload-field">
                      <span>Upload Image</span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
                        onChange={(event) => {
                          void uploadSelectedLayoutBlockSlideImage(
                            itemIndex,
                            blockIndex,
                            slideIndex,
                            event.target.files?.[0] ?? null
                          );
                          event.target.value = "";
                        }}
                      />
                      <small>
                        {uploadingNestedSlide === `${itemIndex}-${blockIndex}-${slideIndex}`
                          ? "Uploading..."
                          : "Saved to /uploads/builder"}
                      </small>
                    </label>

                    <label className="builder-field">
                      <span>Image Alt Text</span>
                      <input
                        value={slide.imageAlt ?? ""}
                        onChange={(e) =>
                          updateSelectedLayoutBlockSlide(itemIndex, blockIndex, slideIndex, {
                            imageAlt: e.target.value,
                          })
                        }
                      />
                    </label>

                    <label className="builder-field">
                      <span>Image To Panel Padding</span>
                      <select
                        value={slide.imagePadding ?? "medium"}
                        onChange={(e) =>
                          updateSelectedLayoutBlockSlide(itemIndex, blockIndex, slideIndex, {
                            imagePadding: e.target.value as SlideImagePadding,
                          })
                        }
                      >
                        <option value="frameless">Frameless</option>
                        <option value="small">Small</option>
                        <option value="medium">Medium</option>
                        <option value="max">Max</option>
                      </select>
                    </label>

                    <label className="builder-field">
                      <span>Button Label</span>
                      <input
                        value={slide.buttonLabel ?? ""}
                        onChange={(e) =>
                          updateSelectedLayoutBlockSlide(itemIndex, blockIndex, slideIndex, {
                            buttonLabel: e.target.value,
                          })
                        }
                      />
                    </label>

                    <label className="builder-field">
                      <span>Button URL</span>
                      <input
                        value={slide.buttonUrl ?? ""}
                        onChange={(e) =>
                          updateSelectedLayoutBlockSlide(itemIndex, blockIndex, slideIndex, {
                            buttonUrl: e.target.value,
                          })
                        }
                      />
                    </label>

                    {/* Checklist details sub-collapse inside Slide */}
                    <details className="builder-collapse" style={{ marginTop: "12px", borderTop: "1px solid var(--builder-ui-border)", paddingTop: "10px" }}>
                      <summary>
                        <InspectorGroupSummary
                          title="Checklist"
                          description="Add checklist items to this slide."
                          meta={`${(slide.items ?? []).length} item${(slide.items ?? []).length !== 1 ? "s" : ""}`}
                        />
                      </summary>
                      
                      <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "10px" }}>
                        <label className="builder-field">
                          <span>Icon type</span>
                          <select
                            value={slide.listIcon ?? "check"}
                            onChange={(e) =>
                              updateSelectedLayoutBlockSlide(itemIndex, blockIndex, slideIndex, {
                                listIcon: e.target.value as any,
                              })
                            }
                          >
                            <option value="check">Check</option>
                            <option value="circleCheck">Circle Check</option>
                            <option value="arrowRight">Arrow Right</option>
                            <option value="star">Star</option>
                            <option value="heart">Heart</option>
                            <option value="sparkles">Sparkles</option>
                            <option value="shield">Shield</option>
                          </select>
                        </label>
                        
                        <label className="builder-field">
                          <span>Icon Color Scheme</span>
                          <select
                            value={slide.listIconColorScheme ?? "default"}
                            onChange={(e) =>
                              updateSelectedLayoutBlockSlide(itemIndex, blockIndex, slideIndex, {
                                listIconColorScheme: e.target.value as any,
                              })
                            }
                          >
                            <option value="default">Default (theme color)</option>
                            <option value="gradient-cycle">Gradient Cycle (sky → indigo → purple)</option>
                          </select>
                        </label>

                        <label className="builder-field">
                          <span>Icon Size (px)</span>
                          <input
                            type="number"
                            min={8}
                            max={64}
                            value={slide.listIconSize ?? 16}
                            onChange={(e) =>
                              updateSelectedLayoutBlockSlide(itemIndex, blockIndex, slideIndex, {
                                listIconSize: Number(e.target.value),
                              })
                            }
                          />
                        </label>

                        <div className="builder-section-heading" style={{ fontSize: "11px", fontWeight: "bold" }}>
                          <span>Checklist Items ({(slide.items ?? []).length})</span>
                        </div>

                        {(slide.items ?? []).map((item, itemIdx) => (
                          <label key={itemIdx} className="builder-field">
                            <span>Item {itemIdx + 1}</span>
                            <div style={{ display: "flex", gap: 4 }}>
                              <input
                                value={item}
                                onChange={(event) => {
                                  const items = [...(slide.items ?? [])];
                                  items[itemIdx] = event.target.value;
                                  updateSelectedLayoutBlockSlide(itemIndex, blockIndex, slideIndex, { items });
                                }}
                              />
                              <button
                                type="button"
                                className="builder-inline-delete"
                                onClick={() => {
                                  const items = (slide.items ?? []).filter((_, i) => i !== itemIdx);
                                  updateSelectedLayoutBlockSlide(itemIndex, blockIndex, slideIndex, { items });
                                }}
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </label>
                        ))}

                        <button
                          type="button"
                          className="builder-inline-add"
                          onClick={() => {
                            const items = [...(slide.items ?? []), `Item ${(slide.items ?? []).length + 1}`];
                            updateSelectedLayoutBlockSlide(itemIndex, blockIndex, slideIndex, { items });
                          }}
                        >
                          <Plus size={15} /> Add item
                        </button>
                      </div>
                    </details>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
