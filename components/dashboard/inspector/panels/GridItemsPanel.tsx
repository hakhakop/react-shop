// @ts-nocheck
"use client";

import React, { useState } from "react";
import { useInspector } from "../../context/InspectorContext";
import { Plus, Trash2 } from "lucide-react";
import RichTextEditor from "../../RichTextEditor";
import { BuilderImageUrlControl, InspectorGroupSummary, InspectorChoiceGroup } from "./InspectorSharedControls";

export default function GridItemsPanel() {
  const {
    selectedLayoutBlock,
    updateSelectedLayoutBlockByKey,
    getSelectedBlockIndices,
    updateSelectedLayoutBlock,
    addSelectedLayoutBlockGridItem,
    deleteSelectedLayoutBlockGridItem,
    updateSelectedLayoutBlockGridItem,
    addSelectedLayoutBlockBadge,
    deleteSelectedLayoutBlockBadge,
    updateSelectedLayoutBlockBadge,
    openWordPressMediaPicker,
    selectedLayoutBlockKey,
  } = useInspector();

  const [openNestedCardId, setOpenNestedCardId] = useState<string | null>(null);

  if (!selectedLayoutBlock) return null;

  const block = selectedLayoutBlock;
  const indices = getSelectedBlockIndices();
  if (!indices) return null;

  const { itemIndex, blockIndex } = indices;

  const handleUpdate = (patch: any) => {
    updateSelectedLayoutBlock(itemIndex, blockIndex, patch);
  };

  // --- 1. BadgeGrid Block ---
  if (block.kind === "badgeGrid") {
    const badges = block.badges ?? [];
    return (
      <div className="builder-inspector-stack">
        <div className="builder-inspector-section">
          <label className="builder-field">
            <span>Block Title</span>
            <input
              value={block.title ?? ""}
              onChange={(event) => handleUpdate({ title: event.target.value })}
              placeholder="Badge grid title..."
            />
          </label>
          <label className="builder-field">
            <span>Body</span>
            <RichTextEditor
              value={block.body ?? ""}
              onChange={(value) => handleUpdate({ body: value })}
            />
          </label>
        </div>

        <div className="builder-inspector-section" style={{ borderTop: "1px solid var(--builder-ui-border)", paddingTop: "14px", marginTop: "14px" }}>
          <div className="builder-field-header" style={{ marginBottom: "10px" }}>
            <strong>Badges List</strong>
            <small>{badges.length} badge{badges.length === 1 ? "" : "s"}</small>
          </div>
          
          <button
            type="button"
            className="builder-inline-add builder-full-button"
            onClick={() => addSelectedLayoutBlockBadge(itemIndex, blockIndex)}
            style={{ marginBottom: "12px" }}
          >
            <Plus size={15} /> Add badge
          </button>

          <div className="builder-repeatable-tabs">
            {badges.map((badge, badgeIndex) => {
              const badgeKey = badge.id ?? `${selectedLayoutBlockKey}-badge-${badgeIndex}`;
              const isBadgeOpen = openNestedCardId === badgeKey || (!openNestedCardId && badgeIndex === 0);
              
              return (
                <div key={badgeKey} className={`builder-nested-card${isBadgeOpen ? " is-open" : ""}`}>
                  <div className="builder-nested-card-header">
                    <button
                      type="button"
                      className="builder-slide-toggle"
                      onClick={() => setOpenNestedCardId(isBadgeOpen ? null : badgeKey)}
                    >
                      <span>Badge {badgeIndex + 1}</span>
                      <small>{badge.title || badge.label || "Untitled badge"}</small>
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteSelectedLayoutBlockBadge(itemIndex, blockIndex, badgeIndex)}
                      title="Delete badge"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  {isBadgeOpen && (
                    <div className="builder-nested-card-body">
                      <label className="builder-field">
                        <span>Label</span>
                        <input
                          value={badge.label ?? ""}
                          onChange={(event) =>
                            updateSelectedLayoutBlockBadge(itemIndex, blockIndex, badgeIndex, { label: event.target.value })
                          }
                        />
                      </label>
                      <label className="builder-field">
                        <span>Title</span>
                        <input
                          value={badge.title ?? ""}
                          onChange={(event) =>
                            updateSelectedLayoutBlockBadge(itemIndex, blockIndex, badgeIndex, { title: event.target.value })
                          }
                        />
                      </label>
                      <label className="builder-field">
                        <span>Text</span>
                        <RichTextEditor
                          value={badge.body ?? ""}
                          onChange={(value) =>
                            updateSelectedLayoutBlockBadge(itemIndex, blockIndex, badgeIndex, { body: value })
                          }
                        />
                      </label>

                      {/* Nested Checklist inside Badge */}
                      <details className="builder-collapse" style={{ marginTop: "12px", borderTop: "1px solid var(--builder-ui-border)", paddingTop: "10px" }}>
                        <summary>
                          <InspectorGroupSummary
                            title="Checklist"
                            description="Add checklist items to this badge."
                            meta={`${(badge.items ?? []).length} item${(badge.items ?? []).length !== 1 ? "s" : ""}`}
                          />
                        </summary>
                        <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "10px" }}>
                          <label className="builder-field">
                            <span>Icon type</span>
                            <select
                              value={badge.listIcon ?? "check"}
                              onChange={(event) =>
                                updateSelectedLayoutBlockBadge(itemIndex, blockIndex, badgeIndex, {
                                  listIcon: event.target.value as any,
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
                              value={badge.listIconColorScheme ?? "default"}
                              onChange={(event) =>
                                updateSelectedLayoutBlockBadge(itemIndex, blockIndex, badgeIndex, {
                                  listIconColorScheme: event.target.value as any,
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
                              value={badge.listIconSize ?? 16}
                              onChange={(event) =>
                                updateSelectedLayoutBlockBadge(itemIndex, blockIndex, badgeIndex, {
                                  listIconSize: Number(event.target.value),
                                })
                              }
                            />
                          </label>

                          <div className="builder-section-heading" style={{ fontSize: "11px", fontWeight: "bold" }}>
                            <span>Checklist Items ({(badge.items ?? []).length})</span>
                          </div>

                          {(badge.items ?? []).map((item, itemIdx) => (
                            <label key={itemIdx} className="builder-field">
                              <span>Item {itemIdx + 1}</span>
                              <div style={{ display: "flex", gap: 4 }}>
                                <input
                                  value={item}
                                  onChange={(event) => {
                                    const nextItems = [...(badge.items ?? [])];
                                    nextItems[itemIdx] = event.target.value;
                                    updateSelectedLayoutBlockBadge(itemIndex, blockIndex, badgeIndex, { items: nextItems });
                                  }}
                                />
                                <button
                                  type="button"
                                  className="builder-inline-delete"
                                  onClick={() => {
                                    const nextItems = (badge.items ?? []).filter((_, i) => i !== itemIdx);
                                    updateSelectedLayoutBlockBadge(itemIndex, blockIndex, badgeIndex, { items: nextItems });
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
                              const nextItems = [...(badge.items ?? []), `Item ${(badge.items ?? []).length + 1}`];
                              updateSelectedLayoutBlockBadge(itemIndex, blockIndex, badgeIndex, { items: nextItems });
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

  // --- 2. Panel Block ---
  if (block.kind === "panel") {
    return (
      <div className="builder-inspector-stack">
        <div className="builder-inspector-section">
          <label className="builder-field">
            <span>Image URL</span>
            <BuilderImageUrlControl
              value={block.imageUrl ?? ""}
              onChange={(event) => handleUpdate({ imageUrl: event.target.value })}
              onChoose={() =>
                openWordPressMediaPicker({
                  title: "Panel Image",
                  currentUrl: block.imageUrl,
                  onSelect: (media) =>
                    handleUpdate({
                      imageUrl: media.sourceUrl,
                      imageAlt: block.imageAlt || media.altText || media.title,
                    }),
                })
              }
            />
          </label>
          <label className="builder-field">
            <span>Image Alt</span>
            <input
              value={block.imageAlt ?? ""}
              onChange={(event) => handleUpdate({ imageAlt: event.target.value })}
              placeholder="Alternative image text..."
            />
          </label>
          <label className="builder-field">
            <span>Eyebrow</span>
            <input
              value={block.eyebrow ?? ""}
              onChange={(event) => handleUpdate({ eyebrow: event.target.value })}
              placeholder="Eyebrow text..."
            />
          </label>
          <label className="builder-field">
            <span>Title</span>
            <input
              value={block.title ?? ""}
              onChange={(event) => handleUpdate({ title: event.target.value })}
              placeholder="Panel title..."
            />
          </label>
          <label className="builder-field">
            <span>Body</span>
            <RichTextEditor
              value={block.body ?? ""}
              onChange={(value) => handleUpdate({ body: value })}
            />
          </label>
          
          <div className="builder-two-column">
            <label className="builder-field">
              <span>Button Label</span>
              <input
                value={block.buttonLabel ?? ""}
                onChange={(event) => handleUpdate({ buttonLabel: event.target.value })}
                placeholder="Button text..."
              />
            </label>
            <label className="builder-field">
              <span>Button URL</span>
              <input
                value={block.buttonUrl ?? ""}
                onChange={(event) => handleUpdate({ buttonUrl: event.target.value })}
                placeholder="Button link..."
              />
            </label>
          </div>
        </div>

        {/* Panel Checklist */}
        <div className="builder-inspector-section" style={{ borderTop: "1px solid var(--builder-ui-border)", paddingTop: "14px", marginTop: "14px" }}>
          <details className="builder-collapse">
            <summary>
              <InspectorGroupSummary
                title="Checklist"
                description="Add checklist items to this panel block."
                meta={`${(block.items ?? []).length} item${(block.items ?? []).length !== 1 ? "s" : ""}`}
              />
            </summary>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "10px" }}>
              <label className="builder-field">
                <span>Icon type</span>
                <select
                  value={block.listIcon ?? "check"}
                  onChange={(event) => handleUpdate({ listIcon: event.target.value as any })}
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
                  value={block.listIconColorScheme ?? "default"}
                  onChange={(event) => handleUpdate({ listIconColorScheme: event.target.value as any })}
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
                  value={block.listIconSize ?? 16}
                  onChange={(event) => handleUpdate({ listIconSize: Number(event.target.value) })}
                />
              </label>

              <div className="builder-section-heading" style={{ fontSize: "11px", fontWeight: "bold" }}>
                <span>Checklist Items ({(block.items ?? []).length})</span>
              </div>

              {(block.items ?? []).map((item, itemIdx) => (
                <label key={itemIdx} className="builder-field">
                  <span>Item {itemIdx + 1}</span>
                  <div style={{ display: "flex", gap: 4 }}>
                    <input
                      value={item}
                      onChange={(event) => {
                        const nextItems = [...(block.items ?? [])];
                        nextItems[itemIdx] = event.target.value;
                        handleUpdate({ items: nextItems });
                      }}
                    />
                    <button
                      type="button"
                      className="builder-inline-delete"
                      onClick={() => {
                        const nextItems = (block.items ?? []).filter((_, i) => i !== itemIdx);
                        handleUpdate({ items: nextItems });
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
                  const nextItems = [...(block.items ?? []), `Item ${(block.items ?? []).length + 1}`];
                  handleUpdate({ items: nextItems });
                }}
              >
                <Plus size={15} /> Add item
              </button>
            </div>
          </details>
        </div>
      </div>
    );
  }

  // --- 3. Grid Block ---
  const gridItems = block.gridItems ?? [];
  return (
    <div className="builder-inspector-stack">
      {/* Grid Settings */}
      <div className="builder-inspector-section">
        <label className="builder-field">
          <span>Content Source</span>
          <select
            value={block.gridSource ?? "static"}
            onChange={(event) => handleUpdate({ gridSource: event.target.value as any })}
          >
            <option value="static">Static items</option>
            <option value="products">WooCommerce products</option>
          </select>
        </label>
        
        <label className="builder-field">
          <span>Image Frame</span>
          <select
            value={block.gridImageFrame ?? "none"}
            onChange={(event) => handleUpdate({ gridImageFrame: event.target.value as any })}
          >
            <option value="none">No frame</option>
            <option value="soft">Soft surface</option>
          </select>
        </label>
      </div>

      {/* Fields visibility toggles */}
      <div className="builder-inspector-section" style={{ borderTop: "1px solid var(--builder-ui-border)", paddingTop: "14px", marginTop: "14px" }}>
        <details className="builder-collapse" open>
          <summary>
            <span>Fields Visibility</span>
          </summary>
          <div className="builder-grid-toggle-list" style={{ marginTop: "10px" }}>
            {[
              ["gridShowImage", "Image"],
              ["gridShowEyebrow", "Eyebrow"],
              ["gridShowMeta", "Meta"],
              ["gridShowText", "Text"],
              ["gridShowButton", "Button"],
            ].map(([field, label]) => (
              <label key={field} style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                <input
                  type="checkbox"
                  checked={block[field as keyof typeof block] !== false}
                  onChange={(event) =>
                    handleUpdate({ [field]: event.target.checked })
                  }
                />
                <span>{label}</span>
              </label>
            ))}
          </div>
        </details>
      </div>

      {/* Static Items Grid list */}
      {block.gridSource !== "products" && (
        <div className="builder-inspector-section" style={{ borderTop: "1px solid var(--builder-ui-border)", paddingTop: "14px", marginTop: "14px" }}>
          <div className="builder-field-header" style={{ marginBottom: "10px" }}>
            <strong>Static Items List</strong>
            <small>{gridItems.length} item{gridItems.length === 1 ? "" : "s"}</small>
          </div>

          <button
            type="button"
            className="builder-inline-add builder-full-button"
            onClick={() => addSelectedLayoutBlockGridItem(itemIndex, blockIndex)}
            style={{ marginBottom: "12px" }}
          >
            <Plus size={15} /> Add grid item
          </button>

          <div className="builder-repeatable-tabs">
            {gridItems.map((gridItem, gridItemIndex) => {
              const gridCardKey = `grid-${itemIndex}-${blockIndex}-${gridItemIndex}`;
              const isGridCardOpen = openNestedCardId === gridCardKey || (!openNestedCardId && gridItemIndex === 0);

              return (
                <div
                  key={gridItem.id ?? `${selectedLayoutBlockKey}-grid-${gridItemIndex}`}
                  className={`builder-nested-card${isGridCardOpen ? " is-open" : ""}`}
                >
                  <div className="builder-nested-card-header">
                    <button
                      type="button"
                      className="builder-slide-toggle"
                      onClick={() => setOpenNestedCardId(isGridCardOpen ? null : gridCardKey)}
                    >
                      <span>Item {gridItemIndex + 1}</span>
                      <small>{gridItem.title || "Untitled item"}</small>
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteSelectedLayoutBlockGridItem(itemIndex, blockIndex, gridItemIndex)}
                      title="Delete grid item"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  {isGridCardOpen && (
                    <div className="builder-nested-card-body">
                      <label className="builder-field">
                        <span>Image URL</span>
                        <BuilderImageUrlControl
                          value={gridItem.imageUrl ?? ""}
                          onChange={(e) =>
                            updateSelectedLayoutBlockGridItem(itemIndex, blockIndex, gridItemIndex, { imageUrl: e.target.value })
                          }
                          onChoose={() =>
                            openWordPressMediaPicker({
                              title: `Item ${gridItemIndex + 1} Image`,
                              currentUrl: gridItem.imageUrl,
                              onSelect: (media) =>
                                updateSelectedLayoutBlockGridItem(itemIndex, blockIndex, gridItemIndex, {
                                  imageUrl: media.sourceUrl,
                                  imageAlt: gridItem.imageAlt || media.altText || media.title,
                                }),
                            })
                          }
                        />
                      </label>
                      
                      <label className="builder-field">
                        <span>Eyebrow</span>
                        <input
                          value={gridItem.eyebrow ?? ""}
                          onChange={(e) =>
                            updateSelectedLayoutBlockGridItem(itemIndex, blockIndex, gridItemIndex, { eyebrow: e.target.value })
                          }
                        />
                      </label>

                      <label className="builder-field">
                        <span>Title</span>
                        <input
                          value={gridItem.title ?? ""}
                          onChange={(e) =>
                            updateSelectedLayoutBlockGridItem(itemIndex, blockIndex, gridItemIndex, { title: e.target.value })
                          }
                        />
                      </label>

                      <label className="builder-field">
                        <span>Meta</span>
                        <input
                          value={gridItem.meta ?? ""}
                          onChange={(e) =>
                            updateSelectedLayoutBlockGridItem(itemIndex, blockIndex, gridItemIndex, { meta: e.target.value })
                          }
                        />
                      </label>

                      <label className="builder-field">
                        <span>Text</span>
                        <RichTextEditor
                          value={gridItem.text ?? ""}
                          onChange={(value) =>
                            updateSelectedLayoutBlockGridItem(itemIndex, blockIndex, gridItemIndex, { text: value })
                          }
                        />
                      </label>

                      <div className="builder-two-column">
                        <label className="builder-field">
                          <span>Button Label</span>
                          <input
                            value={gridItem.buttonLabel ?? ""}
                            onChange={(e) =>
                              updateSelectedLayoutBlockGridItem(itemIndex, blockIndex, gridItemIndex, { buttonLabel: e.target.value })
                            }
                          />
                        </label>
                        <label className="builder-field">
                          <span>Button Link</span>
                          <input
                            value={gridItem.buttonUrl ?? ""}
                            onChange={(e) =>
                              updateSelectedLayoutBlockGridItem(itemIndex, blockIndex, gridItemIndex, { buttonUrl: e.target.value })
                            }
                          />
                        </label>
                      </div>

                      <div className="builder-two-column">
                        <label className="builder-field">
                          <span>Button Style</span>
                          <InspectorChoiceGroup
                            value={gridItem.buttonStyle ?? "primary"}
                            options={[
                              { label: "Primary", value: "primary" },
                              { label: "Secondary", value: "secondary" },
                              { label: "Outline", value: "outline" },
                              { label: "Ghost", value: "ghost" },
                              { label: "Link", value: "link" },
                            ]}
                            onChange={(val) =>
                              updateSelectedLayoutBlockGridItem(itemIndex, blockIndex, gridItemIndex, { buttonStyle: val as any })
                            }
                          />
                        </label>
                        <label className="builder-field">
                          <span>Button Alignment</span>
                          <InspectorChoiceGroup
                            value={gridItem.buttonAlign ?? "left"}
                            options={[
                              { label: "Left", value: "left" },
                              { label: "Center", value: "center" },
                              { label: "Right", value: "right" },
                            ]}
                            onChange={(val) =>
                              updateSelectedLayoutBlockGridItem(itemIndex, blockIndex, gridItemIndex, { buttonAlign: val as any })
                            }
                          />
                        </label>
                      </div>

                      {/* Nested Checklist inside Grid Item */}
                      <details className="builder-collapse" style={{ marginTop: "12px", borderTop: "1px solid var(--builder-ui-border)", paddingTop: "10px" }}>
                        <summary>
                          <InspectorGroupSummary
                            title="Checklist"
                            description="Add checklist items to this item."
                            meta={`${(gridItem.items ?? []).length} items`}
                          />
                        </summary>
                        <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "10px" }}>
                          <label className="builder-field">
                            <span>Icon type</span>
                            <select
                              value={gridItem.listIcon ?? "check"}
                              onChange={(e) =>
                                updateSelectedLayoutBlockGridItem(itemIndex, blockIndex, gridItemIndex, {
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
                              value={gridItem.listIconColorScheme ?? "default"}
                              onChange={(e) =>
                                updateSelectedLayoutBlockGridItem(itemIndex, blockIndex, gridItemIndex, {
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
                              value={gridItem.listIconSize ?? 16}
                              onChange={(e) =>
                                updateSelectedLayoutBlockGridItem(itemIndex, blockIndex, gridItemIndex, {
                                  listIconSize: Number(e.target.value),
                                })
                              }
                            />
                          </label>

                          <div className="builder-section-heading" style={{ fontSize: "11px", fontWeight: "bold" }}>
                            <span>Checklist Items ({(gridItem.items ?? []).length})</span>
                          </div>

                          {(gridItem.items ?? []).map((item, itemIdx) => (
                            <label key={itemIdx} className="builder-field">
                              <span>Item {itemIdx + 1}</span>
                              <div style={{ display: "flex", gap: 4 }}>
                                <input
                                  value={item}
                                  onChange={(event) => {
                                    const nextItems = [...(gridItem.items ?? [])];
                                    nextItems[itemIdx] = event.target.value;
                                    updateSelectedLayoutBlockGridItem(itemIndex, blockIndex, gridItemIndex, { items: nextItems });
                                  }}
                                />
                                <button
                                  type="button"
                                  className="builder-inline-delete"
                                  onClick={() => {
                                    const nextItems = (gridItem.items ?? []).filter((_, i) => i !== itemIdx);
                                    updateSelectedLayoutBlockGridItem(itemIndex, blockIndex, gridItemIndex, { items: nextItems });
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
                              const nextItems = [...(gridItem.items ?? []), `Item ${(gridItem.items ?? []).length + 1}`];
                              updateSelectedLayoutBlockGridItem(itemIndex, blockIndex, gridItemIndex, { items: nextItems });
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
      )}
    </div>
  );
}
