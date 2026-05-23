"use client";

import {
  ArrowDown,
  ArrowUp,
  Copy,
  GalleryHorizontal,
  Layers3,
  PanelRightClose,
  Plus,
  Save,
  Settings2,
  Trash2,
} from "lucide-react";
import type { ChangeEvent, Dispatch, SetStateAction } from "react";
import type {
  BuilderLayoutBlock,
  BuilderSection,
  EmbedMode,
  InspectorTab,
  LayoutBlockKind,
  SectionKind,
  SlideImagePadding,
  SectionBackgroundMode,
  SectionColorScheme,
  SectionContentMode,
  SectionSpacing,
  WordPressMediaItem,
} from "@/components/dashboard/builderTypes";

// Inspector handlers mirror the lifted builder callbacks during this JSX-only extraction.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type LooseHandler = (...args: any[]) => void;
type BackgroundPreset = { label: string; value: string; scheme?: string };

type DashboardInspectorProps = {
  builderJson: string;
  copied: boolean;
  elementBackgroundPresets: BackgroundPreset[];
  getLayoutItemBlocks: (item: NonNullable<BuilderSection["layoutItems"]>[number]) => BuilderLayoutBlock[];
  inspectorOpen: boolean;
  inspectorTab: InspectorTab;
  layoutBlockLabels: Record<LayoutBlockKind, string>;
  openLayoutItemId: string | null;
  openSlideId: string | null;
  sectionBackgroundPresets: readonly BackgroundPreset[];
  sectionColorModeLabel: (section: BuilderSection) => string;
  sectionLabels: Record<SectionKind, string>;
  sectionSettingsOpen: boolean;
  sectionStructureOpen: boolean;
  selectedLayoutBlock: BuilderLayoutBlock | null;
  selectedLayoutBlockKey: string | null;
  selectedSection: BuilderSection | undefined;
  uploadingNestedSlide: string | null;
  uploadingSlide: number | null;
  addSelectedLayoutBlockBadge: LooseHandler;
  addSelectedLayoutBlockGridItem: LooseHandler;
  addSelectedLayoutBlockSlide: LooseHandler;
  addSelectedLayoutItem: LooseHandler;
  addSelectedSlide: LooseHandler;
  copyJson: LooseHandler;
  deleteSelected: LooseHandler;
  deleteSelectedLayoutBlock: LooseHandler;
  deleteSelectedLayoutBlockBadge: LooseHandler;
  deleteSelectedLayoutBlockGridItem: LooseHandler;
  deleteSelectedLayoutBlockSlide: LooseHandler;
  deleteSelectedLayoutItem: LooseHandler;
  deleteSelectedSlide: LooseHandler;
  duplicateSelected: LooseHandler;
  moveSelected: LooseHandler;
  openWordPressMediaPicker: (options: { title: string; currentUrl?: string; onSelect: (media: WordPressMediaItem) => void }) => void;
  setInspectorOpen: Dispatch<SetStateAction<boolean>>;
  setInspectorTab: Dispatch<SetStateAction<InspectorTab>>;
  setOpenSlideId: Dispatch<SetStateAction<string | null>>;
  setSectionSettingsOpen: Dispatch<SetStateAction<boolean>>;
  setSectionStructureOpen: Dispatch<SetStateAction<boolean>>;
  setSelectedLayoutBlockKey: Dispatch<SetStateAction<string | null>>;
  updateSelected: (patch: Partial<BuilderSection>) => void;
  updateSelectedBadge: LooseHandler;
  updateSelectedLayoutBlock: LooseHandler;
  updateSelectedLayoutBlockBadge: LooseHandler;
  updateSelectedLayoutBlockGridItem: LooseHandler;
  updateSelectedLayoutBlockSlide: LooseHandler;
  updateSelectedSlide: LooseHandler;
  uploadSelectedLayoutBlockSlideImage: LooseHandler;
  uploadSelectedSlideImage: LooseHandler;
};

function BuilderImageUrlControl({
  value,
  placeholder = "https://... or /uploads/image.jpg",
  onChange,
  onChoose,
}: {
  value: string;
  placeholder?: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onChoose: () => void;
}) {
  return (
    <div className="builder-media-url-row">
      <input value={value} placeholder={placeholder} onChange={onChange} />
      <button type="button" onClick={onChoose}>
        <GalleryHorizontal size={14} />
        Library
      </button>
    </div>
  );
}

export default function DashboardInspector(props: DashboardInspectorProps) {
  const {
    builderJson, copied, elementBackgroundPresets, getLayoutItemBlocks,
    inspectorOpen, inspectorTab, layoutBlockLabels, openLayoutItemId, openSlideId,
    sectionBackgroundPresets, sectionColorModeLabel, sectionLabels,
    sectionSettingsOpen, sectionStructureOpen, selectedLayoutBlock,
    selectedLayoutBlockKey, selectedSection, uploadingNestedSlide, uploadingSlide,
    addSelectedLayoutBlockBadge, addSelectedLayoutBlockGridItem,
    addSelectedLayoutBlockSlide, addSelectedLayoutItem, addSelectedSlide, copyJson,
    deleteSelected, deleteSelectedLayoutBlock, deleteSelectedLayoutBlockBadge,
    deleteSelectedLayoutBlockGridItem, deleteSelectedLayoutBlockSlide,
    deleteSelectedLayoutItem, deleteSelectedSlide, duplicateSelected, moveSelected,
    openWordPressMediaPicker, setInspectorOpen, setInspectorTab, setOpenSlideId,
    setSectionSettingsOpen, setSectionStructureOpen, setSelectedLayoutBlockKey,
    updateSelected, updateSelectedBadge, updateSelectedLayoutBlock,
    updateSelectedLayoutBlockBadge, updateSelectedLayoutBlockGridItem,
    updateSelectedLayoutBlockSlide, updateSelectedSlide,
    uploadSelectedLayoutBlockSlideImage, uploadSelectedSlideImage,
  } = props;
  const inspectorTabs: [InspectorTab, string][] = [
    ["section", "Section"],
    ["element", "Element"],
    ["advanced", "Advanced"],
  ];

  return (
    <aside
      className={`builder-inspector builder-panel ${inspectorOpen ? "is-open" : ""}`}
    >
      <div className="builder-inspector-header">
        <Settings2 size={18} />
        <span>
          {selectedLayoutBlock ? "Element Settings" : "Section Settings"}
        </span>
        <button
          type="button"
          className="builder-inspector-close"
          onClick={() => setInspectorOpen(false)}
          aria-label="Close inspector"
        >
          <PanelRightClose size={16} />
        </button>
      </div>
      {selectedSection ? (
        <>
          <div className="builder-inspector-context">
            <strong>{selectedLayoutBlock ? "Element" : "Section"}</strong>
            <span>
              {selectedLayoutBlock
                ? layoutBlockLabels[selectedLayoutBlock.kind ?? "text"]
                : sectionLabels[selectedSection.kind]}
            </span>
            {selectedLayoutBlock && (
              <button
                type="button"
                onClick={() => {
                  setSelectedLayoutBlockKey(null);
                  setInspectorTab("section");
                }}
              >
                Back to section
              </button>
            )}
          </div>
          <div className="builder-inspector-tabs" aria-label="Inspector tabs">
            {inspectorTabs.map(([tab, label]) => (
              <button
                key={tab}
                type="button"
                className={inspectorTab === tab ? "is-active" : ""}
                onClick={() => setInspectorTab(tab)}
              >
                {label}
              </button>
            ))}
          </div>

          {!selectedLayoutBlock && (
            <div className="builder-actions-row">
              <button
                type="button"
                onClick={() => moveSelected(-1)}
                title="Move up"
              >
                <ArrowUp size={15} />
              </button>
              <button
                type="button"
                onClick={() => moveSelected(1)}
                title="Move down"
              >
                <ArrowDown size={15} />
              </button>
              <button
                type="button"
                onClick={duplicateSelected}
                title="Duplicate"
              >
                <Copy size={15} />
              </button>
              <button type="button" onClick={deleteSelected} title="Delete">
                <Trash2 size={15} />
              </button>
            </div>
          )}

          {inspectorTab === "element" &&
            !selectedLayoutBlock &&
            selectedSection.kind !== "contentLayout" && (
            <div className="builder-empty-state builder-inspector-empty-tab">
              <Layers3 size={22} />
              <p>Select an element in the canvas to edit its controls here.</p>
            </div>
          )}

          {inspectorTab === "section" && selectedLayoutBlock && (
            <div className="builder-empty-state builder-inspector-empty-tab">
              <Layers3 size={22} />
              <p>
                You are editing an element. Use the Element tab, or go back to
                the section.
              </p>
            </div>
          )}

          {((!selectedLayoutBlock && inspectorTab !== "element") ||
            (selectedSection.kind === "contentLayout" &&
              inspectorTab === "element")) && (
            <details
              className={`builder-collapse builder-section-settings-toggle ${
                selectedLayoutBlock ? "is-element-focus" : ""
              }`}
              open={selectedLayoutBlock ? true : sectionSettingsOpen}
              onToggle={(event) =>
                !selectedLayoutBlock &&
                setSectionSettingsOpen(
                  (event.currentTarget as HTMLDetailsElement).open,
                )
              }
            >
              <summary>
                <span>
                  {selectedLayoutBlock
                    ? "Element Settings"
                    : "Section Settings"}
                </span>
                <small>
                  {selectedLayoutBlock || sectionSettingsOpen
                    ? "open"
                    : "closed"}
                </small>
              </summary>
              {inspectorTab === "section" &&
                !selectedLayoutBlock &&
                selectedSection.kind !== "contentLayout" && (
                  <>
                    <details className="builder-collapse" open>
                      <summary>
                        <span>Basic Content</span>
                        <small>{sectionLabels[selectedSection.kind]}</small>
                      </summary>

                      <label className="builder-field">
                        <span>Section Title</span>
                        <input
                          value={selectedSection.title}
                          onChange={(event) =>
                            updateSelected({ title: event.target.value })
                          }
                        />
                      </label>

                      <label className="builder-field">
                        <span>Eyebrow</span>
                        <input
                          value={selectedSection.eyebrow ?? ""}
                          onChange={(event) =>
                            updateSelected({ eyebrow: event.target.value })
                          }
                        />
                      </label>
                    </details>
                  </>
                )}

              {inspectorTab === "section" && !selectedLayoutBlock && (
                <>
                  <details className="builder-collapse" open>
                    <summary>
                      <span>Background</span>
                      <small>
                        {selectedSection.backgroundMode ?? "full"}
                      </small>
                    </summary>

                    <label className="builder-field">
                      <span>Background</span>
                      <div className="builder-background-presets">
                        {sectionBackgroundPresets.map((preset) => (
                          <button
                            key={preset.value}
                            type="button"
                            className={
                              selectedSection.background?.toLowerCase() ===
                              preset.value
                                ? "is-active"
                                : ""
                            }
                            onClick={() =>
                              updateSelected({
                                background: preset.value,
                                colorScheme: "inherit",
                              })
                            }
                            title={preset.label}
                          >
                            <span style={{ background: preset.value }} />
                            {preset.label}
                          </button>
                        ))}
                      </div>
                      <div className="builder-color-row">
                        <input
                          type="color"
                          value={selectedSection.background}
                          onChange={(event) =>
                            updateSelected({
                              background: event.target.value,
                              colorScheme: "inherit",
                            })
                          }
                        />
                        <input
                          value={selectedSection.background}
                          onChange={(event) =>
                            updateSelected({
                              background: event.target.value,
                              colorScheme: "inherit",
                            })
                          }
                        />
                      </div>
                    </label>
                  </details>

                  <details className="builder-collapse" open>
                    <summary>
                      <span>Layout Widths</span>
                      <small>{selectedSection.contentMode ?? "boxed"}</small>
                    </summary>

                    <label className="builder-field">
                      <span>Background Width</span>
                      <select
                        value={selectedSection.backgroundMode ?? "full"}
                        onChange={(event) =>
                          updateSelected({
                            backgroundMode: event.target
                              .value as SectionBackgroundMode,
                          })
                        }
                      >
                        <option value="full">Full width</option>
                        <option value="boxed">Boxed</option>
                      </select>
                    </label>

                    <label className="builder-field">
                      <span>Content Width</span>
                      <select
                        value={selectedSection.contentMode ?? "boxed"}
                        onChange={(event) =>
                          updateSelected({
                            contentMode: event.target
                              .value as SectionContentMode,
                          })
                        }
                      >
                        <option value="full">Full</option>
                        <option value="boxed">Boxed</option>
                        <option value="narrow">Narrow</option>
                      </select>
                    </label>
                  </details>

                  <details className="builder-collapse" open>
                    <summary>
                      <span>Color & Spacing</span>
                      <small>{sectionColorModeLabel(selectedSection)}</small>
                    </summary>

                    <label className="builder-field">
                      <span>Section Color Mode</span>
                      <select
                        value={selectedSection.colorScheme ?? "inherit"}
                        onChange={(event) =>
                          updateSelected({
                            colorScheme: event.target
                              .value as SectionColorScheme,
                          })
                        }
                      >
                        <option value="inherit">Auto by background</option>
                        <option value="light">
                          Dark text for light background
                        </option>
                        <option value="dark">
                          Light text for dark background
                        </option>
                      </select>
                    </label>

                    <div className="builder-contrast-note">
                      <strong>
                        {sectionColorModeLabel(selectedSection)}
                      </strong>
                      <span>
                        Auto keeps text readable against this section
                        background. Use Light or Dark only when you want to
                        force the look.
                      </span>
                    </div>

                    <div className="builder-two-column">
                      <label className="builder-field">
                        <span>Top Padding</span>
                        <select
                          value={selectedSection.topSpacing ?? "inherit"}
                          onChange={(event) =>
                            updateSelected({
                              topSpacing: event.target
                                .value as SectionSpacing,
                            })
                          }
                        >
                          <option value="inherit">Use global</option>
                          <option value="none">None</option>
                          <option value="small">Small</option>
                          <option value="medium">Medium</option>
                          <option value="large">Large</option>
                        </select>
                      </label>

                      <label className="builder-field">
                        <span>Bottom Padding</span>
                        <select
                          value={selectedSection.bottomSpacing ?? "inherit"}
                          onChange={(event) =>
                            updateSelected({
                              bottomSpacing: event.target
                                .value as SectionSpacing,
                            })
                          }
                        >
                          <option value="inherit">Use global</option>
                          <option value="none">None</option>
                          <option value="small">Small</option>
                          <option value="medium">Medium</option>
                          <option value="large">Large</option>
                        </select>
                      </label>
                    </div>

                    <div className="builder-two-column">
                      <label className="builder-field">
                        <span>Top Margin</span>
                        <select
                          value={selectedSection.topMargin ?? "inherit"}
                          onChange={(event) =>
                            updateSelected({
                              topMargin: event.target.value as SectionSpacing,
                            })
                          }
                        >
                          <option value="inherit">Use global</option>
                          <option value="none">None</option>
                          <option value="small">Small</option>
                          <option value="medium">Medium</option>
                          <option value="large">Large</option>
                        </select>
                      </label>

                      <label className="builder-field">
                        <span>Bottom Margin</span>
                        <select
                          value={selectedSection.bottomMargin ?? "inherit"}
                          onChange={(event) =>
                            updateSelected({
                              bottomMargin: event.target
                                .value as SectionSpacing,
                            })
                          }
                        >
                          <option value="inherit">Use global</option>
                          <option value="none">None</option>
                          <option value="small">Small</option>
                          <option value="medium">Medium</option>
                          <option value="large">Large</option>
                        </select>
                      </label>
                    </div>
                  </details>
                </>
              )}

              {((inspectorTab === "section" &&
                !selectedLayoutBlock &&
                selectedSection.kind !== "hero" &&
                selectedSection.kind !== "promo") ||
                ((inspectorTab as string) === "element" &&
                  selectedSection.kind === "contentLayout" &&
                  selectedLayoutBlock)) && (
                  <details className="builder-collapse" open>
                    <summary>
                      <span>
                        {selectedLayoutBlock
                          ? "Element Content"
                          : "Section Type Options"}
                      </span>
                      <small>
                        {sectionLabels[selectedSection.kind]}
                      </small>
                    </summary>





                    {inspectorTab === "section" &&
                      !selectedLayoutBlock &&
                      selectedSection.kind === "contentLayout" && (
                        <>
                          <label className="builder-field">
                            <span>Layout Columns</span>
                            <select
                              value={selectedSection.layoutColumns ?? 2}
                              onChange={(event) =>
                                updateSelected({
                                  layoutColumns: Number(event.target.value),
                                })
                              }
                            >
                              <option value={1}>Full width</option>
                              <option value={2}>2 columns</option>
                              <option value={3}>3 columns</option>
                              <option value={4}>4 columns</option>
                              <option value={5}>5 columns</option>
                              <option value={6}>6 columns</option>
                            </select>
                          </label>

                          <details
                            className="builder-collapse builder-structure-summary"
                            open={sectionStructureOpen}
                            onToggle={(event) =>
                              setSectionStructureOpen(
                                (event.currentTarget as HTMLDetailsElement)
                                  .open,
                              )
                            }
                          >
                            <summary>
                              <span>Columns</span>
                              <small>
                                {selectedSection.layoutItems?.length ?? 0}
                              </small>
                            </summary>
                            <div className="builder-structure-note">
                              Select an element in the canvas to edit it. This
                              area only manages the section grid itself.
                            </div>
                            <button
                              type="button"
                              className="builder-inline-add"
                              onClick={addSelectedLayoutItem}
                            >
                              <Plus size={15} />
                              Add column
                            </button>
                            <div className="builder-compact-column-list">
                              {(selectedSection.layoutItems ?? []).map(
                                (item, index) => {
                                  const itemKey =
                                    item.id ?? `layout-item-${index}`;
                                  const blocks = getLayoutItemBlocks(item);
                                  return (
                                    <div
                                      key={itemKey}
                                      className="builder-compact-column-row"
                                    >
                                      <div>
                                        <strong>Column {index + 1}</strong>
                                        <span>{blocks.length} elements</span>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          deleteSelectedLayoutItem(index)
                                        }
                                        title="Delete column"
                                      >
                                        <Trash2 size={14} />
                                      </button>
                                    </div>
                                  );
                                },
                              )}
                            </div>
                          </details>
                        </>
                      )}

                    {(inspectorTab as string) === "element" &&
                      selectedSection.kind === "contentLayout" && (
                      <>
                            <div className="builder-element-inspector-note">
                          <strong>Element Settings</strong>
                          <span>
                            Manage column elements here. Select an element in
                            the canvas to focus its controls.
                          </span>
                        </div>

                        {(selectedSection.layoutItems ?? []).map(
                          (item, index) => {
                            if (
                              selectedLayoutBlock &&
                              !(item.blocks ?? []).some(
                                (block) =>
                                  block.id === selectedLayoutBlockKey,
                              )
                            ) {
                              return null;
                            }
                            const itemKey = item.id ?? `layout-item-${index}`;
                            const isOpen =
                              Boolean(selectedLayoutBlock) ||
                              openLayoutItemId === itemKey;
                            const blocks = getLayoutItemBlocks(item);

                            return (
                              <div
                                key={itemKey}
                                className={`builder-nested-card ${isOpen ? "is-open" : ""} ${
                                  selectedLayoutBlock
                                    ? "is-element-focus-card"
                                    : ""
                                }`}
                              >
                                {isOpen && (
                                  <div className="builder-nested-card-body">
                                    {blocks.length === 0 && (
                                      <div className="builder-mini-empty">
                                        Select this column in the preview,
                                        then drag an element from the Element
                                        Library.
                                      </div>
                                    )}

                                    {blocks.map((block, blockIndex) => {
                                      const blockKey =
                                        block.id ??
                                        `${itemKey}-block-${blockIndex}`;
                                      const isSelectedBlock =
                                        selectedLayoutBlockKey === blockKey;

                                      return (
                                        <div
                                          key={blockKey}
                                          className={`builder-layout-block-card ${
                                            isSelectedBlock
                                              ? "is-selected"
                                              : ""
                                          } ${selectedLayoutBlock ? "is-element-focus-block" : ""}`}
                                        >
                                          <div className="builder-layout-block-header">
                                            <span>
                                              {layoutBlockLabels[
                                                block.kind ?? "text"
                                              ] ?? "Block"}
                                            </span>
                                            <button
                                              type="button"
                                              onClick={() =>
                                                deleteSelectedLayoutBlock(
                                                  index,
                                                  blockIndex,
                                                )
                                              }
                                              title="Delete block"
                                            >
                                              <Trash2 size={13} />
                                            </button>
                                          </div>

                                          <details className="builder-collapse">
                                            <summary>
                                              <span>Element Surface</span>
                                              <small>
                                                {block.elementBackgroundMode ??
                                                  "default"}
                                              </small>
                                            </summary>
                                            <label className="builder-field">
                                              <span>Background Mode</span>
                                              <select
                                                value={
                                                  block.elementBackgroundMode ??
                                                  "default"
                                                }
                                                onChange={(event) =>
                                                  updateSelectedLayoutBlock(
                                                    index,
                                                    blockIndex,
                                                    {
                                                      elementBackgroundMode:
                                                        event.target
                                                          .value as BuilderLayoutBlock["elementBackgroundMode"],
                                                    },
                                                  )
                                                }
                                              >
                                                <option value="default">
                                                  Use element default
                                                </option>
                                                <option value="transparent">
                                                  Transparent
                                                </option>
                                                <option value="custom">
                                                  Custom color
                                                </option>
                                              </select>
                                            </label>
                                            {block.elementBackgroundMode ===
                                              "custom" && (
                                              <label className="builder-field">
                                                <span>Background</span>
                                                <div className="builder-background-presets">
                                                  {elementBackgroundPresets.map(
                                                    (preset) => (
                                                      <button
                                                        key={preset.value}
                                                        type="button"
                                                        className={
                                                          block.elementBackground?.toLowerCase() ===
                                                          preset.value
                                                            ? "is-active"
                                                            : ""
                                                        }
                                                        onClick={() =>
                                                          updateSelectedLayoutBlock(
                                                            index,
                                                            blockIndex,
                                                            {
                                                              elementBackground:
                                                                preset.value,
                                                            },
                                                          )
                                                        }
                                                      >
                                                        <span
                                                          style={{
                                                            background:
                                                              preset.value,
                                                          }}
                                                        />
                                                        {preset.label}
                                                      </button>
                                                    ),
                                                  )}
                                                </div>
                                                <div className="builder-color-row">
                                                  <input
                                                    type="color"
                                                    value={
                                                      block.elementBackground ??
                                                      "#ffffff"
                                                    }
                                                    onChange={(event) =>
                                                      updateSelectedLayoutBlock(
                                                        index,
                                                        blockIndex,
                                                        {
                                                          elementBackground:
                                                            event.target
                                                              .value,
                                                        },
                                                      )
                                                    }
                                                  />
                                                  <input
                                                    value={
                                                      block.elementBackground ??
                                                      "#ffffff"
                                                    }
                                                    onChange={(event) =>
                                                      updateSelectedLayoutBlock(
                                                        index,
                                                        blockIndex,
                                                        {
                                                          elementBackground:
                                                            event.target
                                                              .value,
                                                        },
                                                      )
                                                    }
                                                  />
                                                </div>
                                              </label>
                                            )}
                                            <label className="builder-field">
                                              <span>Element Padding</span>
                                              <select
                                                value={
                                                  block.elementPadding ??
                                                  "none"
                                                }
                                                onChange={(event) =>
                                                  updateSelectedLayoutBlock(
                                                    index,
                                                    blockIndex,
                                                    {
                                                      elementPadding: event
                                                        .target
                                                        .value as BuilderLayoutBlock["elementPadding"],
                                                    },
                                                  )
                                                }
                                              >
                                                <option value="none">
                                                  None
                                                </option>
                                                <option value="small">
                                                  Small
                                                </option>
                                                <option value="medium">
                                                  Medium
                                                </option>
                                                <option value="large">
                                                  Large
                                                </option>
                                              </select>
                                            </label>
                                            <label className="builder-field">
                                              <span>Content Align</span>
                                              <select
                                                value={
                                                  block.elementAlign ?? "left"
                                                }
                                                onChange={(event) =>
                                                  updateSelectedLayoutBlock(
                                                    index,
                                                    blockIndex,
                                                    {
                                                      elementAlign: event
                                                        .target
                                                        .value as BuilderLayoutBlock["elementAlign"],
                                                    },
                                                  )
                                                }
                                              >
                                                <option value="left">
                                                  Left
                                                </option>
                                                <option value="center">
                                                  Center
                                                </option>
                                                <option value="right">
                                                  Right
                                                </option>
                                              </select>
                                            </label>
                                          </details>

                                          {block.kind === "embed" ? (
                                            <>
                                              <label className="builder-field">
                                                <span>Block Title</span>
                                                <input
                                                  value={block.title ?? ""}
                                                  onChange={(event) =>
                                                    updateSelectedLayoutBlock(
                                                      index,
                                                      blockIndex,
                                                      {
                                                        title:
                                                          event.target.value,
                                                      },
                                                    )
                                                  }
                                                />
                                              </label>
                                              <label className="builder-field">
                                                <span>Embed Mode</span>
                                                <select
                                                  value={
                                                    block.embedMode ?? "code"
                                                  }
                                                  onChange={(event) =>
                                                    updateSelectedLayoutBlock(
                                                      index,
                                                      blockIndex,
                                                      {
                                                        embedMode: event
                                                          .target
                                                          .value as EmbedMode,
                                                      },
                                                    )
                                                  }
                                                >
                                                  <option value="code">
                                                    Custom HTML / Script
                                                  </option>
                                                  <option value="iframe">
                                                    Iframe URL
                                                  </option>
                                                </select>
                                              </label>
                                              {block.embedMode ===
                                              "iframe" ? (
                                                <label className="builder-field">
                                                  <span>Iframe URL</span>
                                                  <input
                                                    value={
                                                      block.embedUrl ?? ""
                                                    }
                                                    placeholder="https://..."
                                                    onChange={(event) =>
                                                      updateSelectedLayoutBlock(
                                                        index,
                                                        blockIndex,
                                                        {
                                                          embedUrl:
                                                            event.target
                                                              .value,
                                                        },
                                                      )
                                                    }
                                                  />
                                                </label>
                                              ) : (
                                                <label className="builder-field">
                                                  <span>HTML / Script</span>
                                                  <textarea
                                                    rows={5}
                                                    value={
                                                      block.embedCode ?? ""
                                                    }
                                                    onChange={(event) =>
                                                      updateSelectedLayoutBlock(
                                                        index,
                                                        blockIndex,
                                                        {
                                                          embedCode:
                                                            event.target
                                                              .value,
                                                        },
                                                      )
                                                    }
                                                  />
                                                </label>
                                              )}
                                              <label className="builder-field">
                                                <span>Height</span>
                                                <input
                                                  type="number"
                                                  min={120}
                                                  max={900}
                                                  value={
                                                    block.embedHeight ?? 260
                                                  }
                                                  onChange={(event) =>
                                                    updateSelectedLayoutBlock(
                                                      index,
                                                      blockIndex,
                                                      {
                                                        embedHeight: Number(
                                                          event.target.value,
                                                        ),
                                                      },
                                                    )
                                                  }
                                                />
                                              </label>
                                            </>
                                          ) : block.kind === "fluentForm" ? (
                                            <>
                                              <label className="builder-field">
                                                <span>Block Title</span>
                                                <input
                                                  value={block.title ?? ""}
                                                  onChange={(event) =>
                                                    updateSelectedLayoutBlock(
                                                      index,
                                                      blockIndex,
                                                      {
                                                        title:
                                                          event.target.value,
                                                      },
                                                    )
                                                  }
                                                />
                                              </label>
                                              <label className="builder-field">
                                                <span>Fluent Form ID</span>
                                                <input
                                                  inputMode="numeric"
                                                  value={
                                                    block.fluentFormId ?? ""
                                                  }
                                                  placeholder="Example: 3"
                                                  onChange={(event) =>
                                                    updateSelectedLayoutBlock(
                                                      index,
                                                      blockIndex,
                                                      {
                                                        fluentFormId:
                                                          event.target.value,
                                                      },
                                                    )
                                                  }
                                                />
                                              </label>
                                              <div className="builder-dynamic-field-note">
                                                <strong>
                                                  WordPress renderer required
                                                </strong>
                                                <span>
                                                  Add the React Shop Fluent
                                                  Forms snippet in WordPress,
                                                  then this element can show
                                                  the real Fluent Form.
                                                </span>
                                              </div>
                                            </>
                                          ) : block.kind === "grid" ? (
                                            <>
                                              <label className="builder-field">
                                                <span>Content Source</span>
                                                <select
                                                  value={
                                                    block.gridSource ??
                                                    "static"
                                                  }
                                                  onChange={(event) =>
                                                    updateSelectedLayoutBlock(
                                                      index,
                                                      blockIndex,
                                                      {
                                                        gridSource: event
                                                          .target
                                                          .value as BuilderLayoutBlock["gridSource"],
                                                      },
                                                    )
                                                  }
                                                >
                                                  <option value="static">
                                                    Static items
                                                  </option>
                                                  <option value="products">
                                                    WooCommerce products
                                                  </option>
                                                </select>
                                              </label>
                                              <div className="builder-two-column">
                                                <label className="builder-field">
                                                  <span>Columns</span>
                                                  <input
                                                    type="number"
                                                    min={1}
                                                    max={6}
                                                    value={block.columns ?? 3}
                                                    onChange={(event) =>
                                                      updateSelectedLayoutBlock(
                                                        index,
                                                        blockIndex,
                                                        {
                                                          columns: Number(
                                                            event.target
                                                              .value,
                                                          ),
                                                        },
                                                      )
                                                    }
                                                  />
                                                </label>
                                                <label className="builder-field">
                                                  <span>Rows</span>
                                                  <input
                                                    type="number"
                                                    min={1}
                                                    max={6}
                                                    value={
                                                      block.gridRows ?? 1
                                                    }
                                                    onChange={(event) =>
                                                      updateSelectedLayoutBlock(
                                                        index,
                                                        blockIndex,
                                                        {
                                                          gridRows: Number(
                                                            event.target
                                                              .value,
                                                          ),
                                                        },
                                                      )
                                                    }
                                                  />
                                                </label>
                                              </div>
                                              <div className="builder-two-column">
                                                <label className="builder-field">
                                                  <span>Grid Gap</span>
                                                  <select
                                                    value={
                                                      block.gridGap ??
                                                      "medium"
                                                    }
                                                    onChange={(event) =>
                                                      updateSelectedLayoutBlock(
                                                        index,
                                                        blockIndex,
                                                        {
                                                          gridGap: event
                                                            .target
                                                            .value as BuilderLayoutBlock["gridGap"],
                                                        },
                                                      )
                                                    }
                                                  >
                                                    <option value="small">
                                                      Small
                                                    </option>
                                                    <option value="medium">
                                                      Medium
                                                    </option>
                                                    <option value="large">
                                                      Large
                                                    </option>
                                                  </select>
                                                </label>
                                                <label className="builder-field">
                                                  <span>Outer Margin</span>
                                                  <select
                                                    value={
                                                      block.gridMargin ??
                                                      "none"
                                                    }
                                                    onChange={(event) =>
                                                      updateSelectedLayoutBlock(
                                                        index,
                                                        blockIndex,
                                                        {
                                                          gridMargin: event
                                                            .target
                                                            .value as BuilderLayoutBlock["gridMargin"],
                                                        },
                                                      )
                                                    }
                                                  >
                                                    <option value="none">
                                                      None
                                                    </option>
                                                    <option value="small">
                                                      Small
                                                    </option>
                                                    <option value="medium">
                                                      Medium
                                                    </option>
                                                    <option value="large">
                                                      Large
                                                    </option>
                                                  </select>
                                                </label>
                                              </div>
                                              <div className="builder-two-column">
                                                <label className="builder-field">
                                                  <span>Image Padding</span>
                                                  <select
                                                    value={
                                                      block.gridImagePadding ??
                                                      "frameless"
                                                    }
                                                    onChange={(event) =>
                                                      updateSelectedLayoutBlock(
                                                        index,
                                                        blockIndex,
                                                        {
                                                          gridImagePadding:
                                                            event.target
                                                              .value as BuilderLayoutBlock["gridImagePadding"],
                                                        },
                                                      )
                                                    }
                                                  >
                                                    <option value="frameless">
                                                      Frameless
                                                    </option>
                                                    <option value="small">
                                                      Small
                                                    </option>
                                                    <option value="medium">
                                                      Medium
                                                    </option>
                                                    <option value="max">
                                                      Max
                                                    </option>
                                                  </select>
                                                </label>
                                                <label className="builder-field">
                                                  <span>Content Padding</span>
                                                  <select
                                                    value={
                                                      block.gridContentPadding ??
                                                      "medium"
                                                    }
                                                    onChange={(event) =>
                                                      updateSelectedLayoutBlock(
                                                        index,
                                                        blockIndex,
                                                        {
                                                          gridContentPadding:
                                                            event.target
                                                              .value as BuilderLayoutBlock["gridContentPadding"],
                                                        },
                                                      )
                                                    }
                                                  >
                                                    <option value="none">
                                                      None
                                                    </option>
                                                    <option value="small">
                                                      Small
                                                    </option>
                                                    <option value="medium">
                                                      Medium
                                                    </option>
                                                    <option value="large">
                                                      Large
                                                    </option>
                                                  </select>
                                                </label>
                                              </div>
                                              <label className="builder-field">
                                                <span>Image Frame</span>
                                                <select
                                                  value={
                                                    block.gridImageFrame ??
                                                    "none"
                                                  }
                                                  onChange={(event) =>
                                                    updateSelectedLayoutBlock(
                                                      index,
                                                      blockIndex,
                                                      {
                                                        gridImageFrame: event
                                                          .target
                                                          .value as BuilderLayoutBlock["gridImageFrame"],
                                                      },
                                                    )
                                                  }
                                                >
                                                  <option value="none">
                                                    No frame
                                                  </option>
                                                  <option value="soft">
                                                    Soft surface
                                                  </option>
                                                </select>
                                              </label>
                                              <details
                                                className="builder-collapse"
                                                open
                                              >
                                                <summary>
                                                  <span>Fields</span>
                                                  <small>visibility</small>
                                                </summary>
                                                <div className="builder-grid-toggle-list">
                                                  {[
                                                    [
                                                      "gridShowImage",
                                                      "Image",
                                                    ],
                                                    [
                                                      "gridShowEyebrow",
                                                      "Eyebrow",
                                                    ],
                                                    ["gridShowMeta", "Meta"],
                                                    ["gridShowText", "Text"],
                                                    [
                                                      "gridShowButton",
                                                      "Button",
                                                    ],
                                                  ].map(([field, label]) => (
                                                    <label key={field}>
                                                      <input
                                                        type="checkbox"
                                                        checked={
                                                          block[
                                                            field as keyof BuilderLayoutBlock
                                                          ] !== false
                                                        }
                                                        onChange={(event) =>
                                                          updateSelectedLayoutBlock(
                                                            index,
                                                            blockIndex,
                                                            {
                                                              [field]:
                                                                event.target
                                                                  .checked,
                                                            },
                                                          )
                                                        }
                                                      />
                                                      <span>{label}</span>
                                                    </label>
                                                  ))}
                                                </div>
                                              </details>
                                              {block.gridSource !==
                                                "products" && (
                                                <details
                                                  className="builder-collapse"
                                                  open
                                                >
                                                  <summary>
                                                    <span>Static Items</span>
                                                    <small>
                                                      {block.gridItems
                                                        ?.length ?? 0}
                                                    </small>
                                                  </summary>
                                                  <button
                                                    type="button"
                                                    className="builder-inline-add"
                                                    onClick={() =>
                                                      addSelectedLayoutBlockGridItem(
                                                        index,
                                                        blockIndex,
                                                      )
                                                    }
                                                  >
                                                    <Plus size={15} />
                                                    Add item
                                                  </button>
                                                  {(
                                                    block.gridItems ?? []
                                                  ).map(
                                                    (
                                                      gridItem,
                                                      gridItemIndex,
                                                    ) => (
                                                      <div
                                                        key={
                                                          gridItem.id ??
                                                          `${blockKey}-grid-${gridItemIndex}`
                                                        }
                                                        className="builder-nested-card is-open"
                                                      >
                                                        <div className="builder-nested-card-header">
                                                          <span>
                                                            Item{" "}
                                                            {gridItemIndex +
                                                              1}
                                                          </span>
                                                          <button
                                                            type="button"
                                                            onClick={() =>
                                                              deleteSelectedLayoutBlockGridItem(
                                                                index,
                                                                blockIndex,
                                                                gridItemIndex,
                                                              )
                                                            }
                                                            title="Delete grid item"
                                                          >
                                                            <Trash2
                                                              size={14}
                                                            />
                                                          </button>
                                                        </div>
                                                        <div className="builder-nested-card-body">
                                                          <label className="builder-field">
                                                            <span>
                                                              Image URL
                                                            </span>
                                                            <BuilderImageUrlControl
                                                              value={
                                                                gridItem.imageUrl ??
                                                                ""
                                                              }
                                                              onChange={(
                                                                event,
                                                              ) =>
                                                                updateSelectedLayoutBlockGridItem(
                                                                  index,
                                                                  blockIndex,
                                                                  gridItemIndex,
                                                                  {
                                                                    imageUrl:
                                                                      event
                                                                        .target
                                                                        .value,
                                                                  },
                                                                )
                                                              }
                                                              onChoose={() =>
                                                                openWordPressMediaPicker(
                                                                  {
                                                                    title: `Item ${gridItemIndex + 1} Image`,
                                                                    currentUrl:
                                                                      gridItem.imageUrl,
                                                                    onSelect:
                                                                      (
                                                                        media,
                                                                      ) =>
                                                                        updateSelectedLayoutBlockGridItem(
                                                                          index,
                                                                          blockIndex,
                                                                          gridItemIndex,
                                                                          {
                                                                            imageUrl:
                                                                              media.sourceUrl,
                                                                            imageAlt:
                                                                              gridItem.imageAlt ||
                                                                              media.altText ||
                                                                              media.title,
                                                                          },
                                                                        ),
                                                                  },
                                                                )
                                                              }
                                                            />
                                                          </label>
                                                          <label className="builder-field">
                                                            <span>
                                                              Eyebrow
                                                            </span>
                                                            <input
                                                              value={
                                                                gridItem.eyebrow ??
                                                                ""
                                                              }
                                                              onChange={(
                                                                event,
                                                              ) =>
                                                                updateSelectedLayoutBlockGridItem(
                                                                  index,
                                                                  blockIndex,
                                                                  gridItemIndex,
                                                                  {
                                                                    eyebrow:
                                                                      event
                                                                        .target
                                                                        .value,
                                                                  },
                                                                )
                                                              }
                                                            />
                                                          </label>
                                                          <label className="builder-field">
                                                            <span>Title</span>
                                                            <input
                                                              value={
                                                                gridItem.title ??
                                                                ""
                                                              }
                                                              onChange={(
                                                                event,
                                                              ) =>
                                                                updateSelectedLayoutBlockGridItem(
                                                                  index,
                                                                  blockIndex,
                                                                  gridItemIndex,
                                                                  {
                                                                    title:
                                                                      event
                                                                        .target
                                                                        .value,
                                                                  },
                                                                )
                                                              }
                                                            />
                                                          </label>
                                                          <label className="builder-field">
                                                            <span>Meta</span>
                                                            <input
                                                              value={
                                                                gridItem.meta ??
                                                                ""
                                                              }
                                                              onChange={(
                                                                event,
                                                              ) =>
                                                                updateSelectedLayoutBlockGridItem(
                                                                  index,
                                                                  blockIndex,
                                                                  gridItemIndex,
                                                                  {
                                                                    meta: event
                                                                      .target
                                                                      .value,
                                                                  },
                                                                )
                                                              }
                                                            />
                                                          </label>
                                                          <label className="builder-field">
                                                            <span>Text</span>
                                                            <textarea
                                                              rows={3}
                                                              value={
                                                                gridItem.text ??
                                                                ""
                                                              }
                                                              onChange={(
                                                                event,
                                                              ) =>
                                                                updateSelectedLayoutBlockGridItem(
                                                                  index,
                                                                  blockIndex,
                                                                  gridItemIndex,
                                                                  {
                                                                    text: event
                                                                      .target
                                                                      .value,
                                                                  },
                                                                )
                                                              }
                                                            />
                                                          </label>
                                                          <div className="builder-two-column">
                                                            <label className="builder-field">
                                                              <span>
                                                                Button Label
                                                              </span>
                                                              <input
                                                                value={
                                                                  gridItem.buttonLabel ??
                                                                  ""
                                                                }
                                                                onChange={(
                                                                  event,
                                                                ) =>
                                                                  updateSelectedLayoutBlockGridItem(
                                                                    index,
                                                                    blockIndex,
                                                                    gridItemIndex,
                                                                    {
                                                                      buttonLabel:
                                                                        event
                                                                          .target
                                                                          .value,
                                                                    },
                                                                  )
                                                                }
                                                              />
                                                            </label>
                                                            <label className="builder-field">
                                                              <span>
                                                                Button Link
                                                              </span>
                                                              <input
                                                                value={
                                                                  gridItem.buttonUrl ??
                                                                  ""
                                                                }
                                                                onChange={(
                                                                  event,
                                                                ) =>
                                                                  updateSelectedLayoutBlockGridItem(
                                                                    index,
                                                                    blockIndex,
                                                                    gridItemIndex,
                                                                    {
                                                                      buttonUrl:
                                                                        event
                                                                          .target
                                                                          .value,
                                                                    },
                                                                  )
                                                                }
                                                              />
                                                            </label>
                                                          </div>
                                                        </div>
                                                      </div>
                                                    ),
                                                  )}
                                                </details>
                                              )}
                                            </>
                                          ) : block.kind === "products" ? (
                                            <>
                                              <label className="builder-field">
                                                <span>Block Title</span>
                                                <input
                                                  value={block.title ?? ""}
                                                  onChange={(event) =>
                                                    updateSelectedLayoutBlock(
                                                      index,
                                                      blockIndex,
                                                      {
                                                        title:
                                                          event.target.value,
                                                      },
                                                    )
                                                  }
                                                />
                                              </label>
                                              <div className="builder-two-column">
                                                <label className="builder-field">
                                                  <span>Columns</span>
                                                  <input
                                                    type="number"
                                                    min={1}
                                                    max={4}
                                                    value={block.columns ?? 2}
                                                    onChange={(event) =>
                                                      updateSelectedLayoutBlock(
                                                        index,
                                                        blockIndex,
                                                        {
                                                          columns: Number(
                                                            event.target
                                                              .value,
                                                          ),
                                                        },
                                                      )
                                                    }
                                                  />
                                                </label>
                                                <label className="builder-field">
                                                  <span>Limit</span>
                                                  <input
                                                    type="number"
                                                    min={2}
                                                    max={12}
                                                    value={
                                                      block.gridLimit ?? 4
                                                    }
                                                    onChange={(event) =>
                                                      updateSelectedLayoutBlock(
                                                        index,
                                                        blockIndex,
                                                        {
                                                          gridLimit: Number(
                                                            event.target
                                                              .value,
                                                          ),
                                                        },
                                                      )
                                                    }
                                                  />
                                                </label>
                                              </div>
                                              <div className="builder-two-column">
                                                <label className="builder-field">
                                                  <span>Source</span>
                                                  <select
                                                    value={
                                                      block.source ?? "all"
                                                    }
                                                    onChange={(event) =>
                                                      updateSelectedLayoutBlock(
                                                        index,
                                                        blockIndex,
                                                        {
                                                          source: event.target
                                                            .value as BuilderLayoutBlock["source"],
                                                        },
                                                      )
                                                    }
                                                  >
                                                    <option value="all">
                                                      All products
                                                    </option>
                                                    <option value="featured">
                                                      Featured
                                                    </option>
                                                    <option value="category">
                                                      Category
                                                    </option>
                                                  </select>
                                                </label>
                                                <label className="builder-field">
                                                  <span>Layout Variant</span>
                                                  <select
                                                    value={
                                                      block.layoutVariant ??
                                                      "grid"
                                                    }
                                                    onChange={(event) =>
                                                      updateSelectedLayoutBlock(
                                                        index,
                                                        blockIndex,
                                                        {
                                                          layoutVariant: event
                                                            .target
                                                            .value as BuilderLayoutBlock["layoutVariant"],
                                                        },
                                                      )
                                                    }
                                                  >
                                                    <option value="grid">
                                                      Grid
                                                    </option>
                                                    <option value="carousel">
                                                      Carousel
                                                    </option>
                                                  </select>
                                                </label>
                                              </div>
                                              {block.source ===
                                                "category" && (
                                                <label className="builder-field">
                                                  <span>
                                                    Category Slug / ID
                                                  </span>
                                                  <input
                                                    value={
                                                      block.categoryId ?? ""
                                                    }
                                                    onChange={(event) =>
                                                      updateSelectedLayoutBlock(
                                                        index,
                                                        blockIndex,
                                                        {
                                                          categoryId:
                                                            event.target
                                                              .value,
                                                        },
                                                      )
                                                    }
                                                  />
                                                </label>
                                              )}
                                              <label className="builder-field">
                                                <span>Filter Position</span>
                                                <select
                                                  value={
                                                    block.filterPosition ??
                                                    "left"
                                                  }
                                                  onChange={(event) =>
                                                    updateSelectedLayoutBlock(
                                                      index,
                                                      blockIndex,
                                                      {
                                                        filterPosition: event
                                                          .target
                                                          .value as BuilderLayoutBlock["filterPosition"],
                                                      },
                                                    )
                                                  }
                                                >
                                                  <option value="left">
                                                    Left sidebar
                                                  </option>
                                                  <option value="top">
                                                    Top pills
                                                  </option>
                                                  <option value="drawer">
                                                    Drawer
                                                  </option>
                                                  <option value="hidden">
                                                    Hidden
                                                  </option>
                                                </select>
                                              </label>
                                              <label className="builder-field">
                                                <span>Card Style</span>
                                                <select
                                                  value={
                                                    block.cardStyle ?? "flat"
                                                  }
                                                  onChange={(event) =>
                                                    updateSelectedLayoutBlock(
                                                      index,
                                                      blockIndex,
                                                      {
                                                        cardStyle: event
                                                          .target
                                                          .value as BuilderLayoutBlock["cardStyle"],
                                                      },
                                                    )
                                                  }
                                                >
                                                  <option value="flat">
                                                    Flat
                                                  </option>
                                                  <option value="soft">
                                                    Soft
                                                  </option>
                                                  <option value="lined">
                                                    Lined
                                                  </option>
                                                  <option value="none">
                                                    No background
                                                  </option>
                                                </select>
                                              </label>
                                              <label className="builder-field">
                                                <span>Card Preset</span>
                                                <select
                                                  value={
                                                    block.cardPreset ??
                                                    "standard"
                                                  }
                                                  onChange={(event) =>
                                                    updateSelectedLayoutBlock(
                                                      index,
                                                      blockIndex,
                                                      {
                                                        cardPreset: event
                                                          .target
                                                          .value as BuilderLayoutBlock["cardPreset"],
                                                      },
                                                    )
                                                  }
                                                >
                                                  <option value="standard">
                                                    Standard
                                                  </option>
                                                  <option value="graph">
                                                    Graph Clean
                                                  </option>
                                                  <option value="gallery">
                                                    Gallery
                                                  </option>
                                                  <option value="editorial">
                                                    Editorial
                                                  </option>
                                                  <option value="compact">
                                                    Compact
                                                  </option>
                                                  <option value="minimal">
                                                    Minimal
                                                  </option>
                                                  <option value="luxury">
                                                    Luxury
                                                  </option>
                                                </select>
                                              </label>
                                              <details
                                                className="builder-collapse"
                                                open
                                              >
                                                <summary>
                                                  Product Grid Spacing
                                                </summary>
                                                <div className="builder-two-column">
                                                  <label className="builder-field">
                                                    <span>Grid Gap</span>
                                                    <select
                                                      value={
                                                        block.gridGap ??
                                                        "medium"
                                                      }
                                                      onChange={(event) =>
                                                        updateSelectedLayoutBlock(
                                                          index,
                                                          blockIndex,
                                                          {
                                                            gridGap: event
                                                              .target
                                                              .value as BuilderLayoutBlock["gridGap"],
                                                          },
                                                        )
                                                      }
                                                    >
                                                      <option value="none">
                                                        None
                                                      </option>
                                                      <option value="small">
                                                        Small
                                                      </option>
                                                      <option value="medium">
                                                        Medium
                                                      </option>
                                                      <option value="large">
                                                        Large
                                                      </option>
                                                      <option value="max">
                                                        Max
                                                      </option>
                                                    </select>
                                                  </label>
                                                  <label className="builder-field">
                                                    <span>Outer Margin</span>
                                                    <select
                                                      value={
                                                        block.gridMargin ??
                                                        "none"
                                                      }
                                                      onChange={(event) =>
                                                        updateSelectedLayoutBlock(
                                                          index,
                                                          blockIndex,
                                                          {
                                                            gridMargin: event
                                                              .target
                                                              .value as BuilderLayoutBlock["gridMargin"],
                                                          },
                                                        )
                                                      }
                                                    >
                                                      <option value="none">
                                                        None
                                                      </option>
                                                      <option value="small">
                                                        Small
                                                      </option>
                                                      <option value="medium">
                                                        Medium
                                                      </option>
                                                      <option value="large">
                                                        Large
                                                      </option>
                                                    </select>
                                                  </label>
                                                </div>
                                                <div className="builder-two-column">
                                                  <label className="builder-field">
                                                    <span>Card Padding</span>
                                                    <select
                                                      value={
                                                        block.cardPadding ??
                                                        "medium"
                                                      }
                                                      onChange={(event) =>
                                                        updateSelectedLayoutBlock(
                                                          index,
                                                          blockIndex,
                                                          {
                                                            cardPadding: event
                                                              .target
                                                              .value as BuilderLayoutBlock["cardPadding"],
                                                          },
                                                        )
                                                      }
                                                    >
                                                      <option value="none">
                                                        None
                                                      </option>
                                                      <option value="small">
                                                        Small
                                                      </option>
                                                      <option value="medium">
                                                        Medium
                                                      </option>
                                                      <option value="large">
                                                        Large
                                                      </option>
                                                      <option value="max">
                                                        Max
                                                      </option>
                                                    </select>
                                                  </label>
                                                  <label className="builder-field">
                                                    <span>Image Padding</span>
                                                    <select
                                                      value={
                                                        block.imagePadding ??
                                                        "large"
                                                      }
                                                      onChange={(event) =>
                                                        updateSelectedLayoutBlock(
                                                          index,
                                                          blockIndex,
                                                          {
                                                            imagePadding:
                                                              event.target
                                                                .value as BuilderLayoutBlock["imagePadding"],
                                                          },
                                                        )
                                                      }
                                                    >
                                                      <option value="none">
                                                        Frameless
                                                      </option>
                                                      <option value="small">
                                                        Small
                                                      </option>
                                                      <option value="medium">
                                                        Medium
                                                      </option>
                                                      <option value="large">
                                                        Large
                                                      </option>
                                                      <option value="max">
                                                        Max
                                                      </option>
                                                    </select>
                                                  </label>
                                                </div>
                                                <label className="builder-field">
                                                  <span>Image Frame</span>
                                                  <select
                                                    value={
                                                      block.gridImageFrame ??
                                                      "none"
                                                    }
                                                    onChange={(event) =>
                                                      updateSelectedLayoutBlock(
                                                        index,
                                                        blockIndex,
                                                        {
                                                          gridImageFrame:
                                                            event.target
                                                              .value as BuilderLayoutBlock["gridImageFrame"],
                                                        },
                                                      )
                                                    }
                                                  >
                                                    <option value="none">
                                                      None / clean
                                                    </option>
                                                    <option value="soft">
                                                      Soft frame
                                                    </option>
                                                  </select>
                                                </label>
                                                <details
                                                  className="builder-collapse"
                                                  open
                                                >
                                                  <summary>
                                                    Add To Cart Button
                                                  </summary>
                                                  <div className="builder-two-column">
                                                    <label className="builder-field">
                                                      <span>Color</span>
                                                      <select
                                                        value={
                                                          block.addToCartStyle ??
                                                          "blue"
                                                        }
                                                        onChange={(event) =>
                                                          updateSelectedLayoutBlock(
                                                            index,
                                                            blockIndex,
                                                            {
                                                              addToCartStyle:
                                                                event.target
                                                                  .value as BuilderLayoutBlock["addToCartStyle"],
                                                            },
                                                          )
                                                        }
                                                      >
                                                        <option value="blue">
                                                          Publish blue
                                                        </option>
                                                        <option value="dark">
                                                          Dark
                                                        </option>
                                                        <option value="light">
                                                          Light
                                                        </option>
                                                        <option value="inherit">
                                                          Theme button
                                                        </option>
                                                      </select>
                                                    </label>
                                                    <label className="builder-field">
                                                      <span>Size</span>
                                                      <select
                                                        value={
                                                          block.addToCartSize ??
                                                          "medium"
                                                        }
                                                        onChange={(event) =>
                                                          updateSelectedLayoutBlock(
                                                            index,
                                                            blockIndex,
                                                            {
                                                              addToCartSize:
                                                                event.target
                                                                  .value as BuilderLayoutBlock["addToCartSize"],
                                                            },
                                                          )
                                                        }
                                                      >
                                                        <option value="compact">
                                                          Compact
                                                        </option>
                                                        <option value="medium">
                                                          Medium
                                                        </option>
                                                        <option value="large">
                                                          Large
                                                        </option>
                                                        <option value="full">
                                                          Full width
                                                        </option>
                                                      </select>
                                                    </label>
                                                  </div>
                                                  <div className="builder-two-column">
                                                    <label className="builder-field">
                                                      <span>Display</span>
                                                      <select
                                                        value={
                                                          block.addToCartDisplay ??
                                                          "button"
                                                        }
                                                        onChange={(event) =>
                                                          updateSelectedLayoutBlock(
                                                            index,
                                                            blockIndex,
                                                            {
                                                              addToCartDisplay:
                                                                event.target
                                                                  .value as BuilderLayoutBlock["addToCartDisplay"],
                                                            },
                                                          )
                                                        }
                                                      >
                                                        <option value="button">
                                                          Text button
                                                        </option>
                                                        <option value="icon">
                                                          Cart icon
                                                        </option>
                                                      </select>
                                                    </label>
                                                    <label className="builder-field">
                                                      <span>Visibility</span>
                                                      <select
                                                        value={
                                                          block.addToCartVisibility ??
                                                          "hover"
                                                        }
                                                        onChange={(event) =>
                                                          updateSelectedLayoutBlock(
                                                            index,
                                                            blockIndex,
                                                            {
                                                              addToCartVisibility:
                                                                event.target
                                                                  .value as BuilderLayoutBlock["addToCartVisibility"],
                                                            },
                                                          )
                                                        }
                                                      >
                                                        <option value="hover">
                                                          On hover
                                                        </option>
                                                        <option value="always">
                                                          Always visible
                                                        </option>
                                                      </select>
                                                    </label>
                                                  </div>
                                                  <div className="builder-two-column">
                                                    <label className="builder-field">
                                                      <span>Position</span>
                                                      <select
                                                        value={
                                                          block.addToCartPosition ??
                                                          "below"
                                                        }
                                                        onChange={(event) =>
                                                          updateSelectedLayoutBlock(
                                                            index,
                                                            blockIndex,
                                                            {
                                                              addToCartPosition:
                                                                event.target
                                                                  .value as BuilderLayoutBlock["addToCartPosition"],
                                                            },
                                                          )
                                                        }
                                                      >
                                                        <option value="below">
                                                          Below details
                                                        </option>
                                                        <option value="under-price">
                                                          Under price
                                                        </option>
                                                        <option value="under-wishlist">
                                                          Under wishlist
                                                        </option>
                                                      </select>
                                                    </label>
                                                    <div className="builder-field">
                                                      <span>Best with</span>
                                                      <small>
                                                        Icon works nicely
                                                        under wishlist
                                                      </small>
                                                    </div>
                                                  </div>
                                                </details>
                                              </details>
                                            </>
                                          ) : block.kind ===
                                            "productGallery" ? (
                                            <>
                                              <div className="builder-dynamic-field-note">
                                                <strong>
                                                  Dynamic Product Gallery
                                                </strong>
                                                <span>
                                                  Uses images from the current
                                                  WooCommerce product.
                                                </span>
                                              </div>
                                              <label className="builder-field">
                                                <span>Show Thumbnails</span>
                                                <select
                                                  value={
                                                    block.galleryShowThumbnails ===
                                                    false
                                                      ? "no"
                                                      : "yes"
                                                  }
                                                  onChange={(event) =>
                                                    updateSelectedLayoutBlock(
                                                      index,
                                                      blockIndex,
                                                      {
                                                        galleryShowThumbnails:
                                                          event.target
                                                            .value === "yes",
                                                      },
                                                    )
                                                  }
                                                >
                                                  <option value="yes">
                                                    Yes
                                                  </option>
                                                  <option value="no">
                                                    No
                                                  </option>
                                                </select>
                                              </label>
                                              <label className="builder-field">
                                                <span>
                                                  Thumbnail Position
                                                </span>
                                                <select
                                                  value={
                                                    block.galleryThumbnailPosition ??
                                                    "bottom"
                                                  }
                                                  onChange={(event) =>
                                                    updateSelectedLayoutBlock(
                                                      index,
                                                      blockIndex,
                                                      {
                                                        galleryThumbnailPosition:
                                                          event.target
                                                            .value as BuilderLayoutBlock["galleryThumbnailPosition"],
                                                      },
                                                    )
                                                  }
                                                >
                                                  <option value="bottom">
                                                    Bottom
                                                  </option>
                                                  <option value="left">
                                                    Left
                                                  </option>
                                                </select>
                                              </label>
                                              <label className="builder-field">
                                                <span>Image Fit</span>
                                                <select
                                                  value={
                                                    block.galleryImageFit ??
                                                    "contain"
                                                  }
                                                  onChange={(event) =>
                                                    updateSelectedLayoutBlock(
                                                      index,
                                                      blockIndex,
                                                      {
                                                        galleryImageFit: event
                                                          .target
                                                          .value as BuilderLayoutBlock["galleryImageFit"],
                                                      },
                                                    )
                                                  }
                                                >
                                                  <option value="contain">
                                                    Contain
                                                  </option>
                                                  <option value="cover">
                                                    Cover
                                                  </option>
                                                </select>
                                              </label>
                                              <label className="builder-field">
                                                <span>Gallery Height</span>
                                                <input
                                                  type="number"
                                                  min={220}
                                                  max={900}
                                                  value={
                                                    block.galleryHeight ?? 420
                                                  }
                                                  onChange={(event) =>
                                                    updateSelectedLayoutBlock(
                                                      index,
                                                      blockIndex,
                                                      {
                                                        galleryHeight: Number(
                                                          event.target.value,
                                                        ),
                                                      },
                                                    )
                                                  }
                                                />
                                              </label>
                                            </>
                                          ) : block.kind ===
                                              "categoryFilters" ||
                                            block.kind === "breadcrumbs" ? (
                                            <>
                                              <div className="builder-dynamic-field-note">
                                                <strong>
                                                  Dynamic Store Element
                                                </strong>
                                                <span>
                                                  This element renders live
                                                  storefront data in the
                                                  published page.
                                                </span>
                                              </div>
                                              <label className="builder-field">
                                                <span>Editor Label</span>
                                                <input
                                                  value={block.title ?? ""}
                                                  onChange={(event) =>
                                                    updateSelectedLayoutBlock(
                                                      index,
                                                      blockIndex,
                                                      {
                                                        title:
                                                          event.target.value,
                                                      },
                                                    )
                                                  }
                                                />
                                              </label>
                                              <label className="builder-field">
                                                <span>Editor Note</span>
                                                <textarea
                                                  rows={2}
                                                  value={block.body ?? ""}
                                                  onChange={(event) =>
                                                    updateSelectedLayoutBlock(
                                                      index,
                                                      blockIndex,
                                                      {
                                                        body: event.target
                                                          .value,
                                                      },
                                                    )
                                                  }
                                                />
                                              </label>
                                            </>
                                          ) : block.kind?.startsWith(
                                              "product",
                                            ) ? (
                                            <>
                                              <div className="builder-dynamic-field-note">
                                                <strong>
                                                  Dynamic Product Field
                                                </strong>
                                                <span>
                                                  This element reads from the
                                                  current WooCommerce product
                                                  on the live product page.
                                                </span>
                                              </div>
                                              <label className="builder-field">
                                                <span>Editor Label</span>
                                                <input
                                                  value={block.title ?? ""}
                                                  onChange={(event) =>
                                                    updateSelectedLayoutBlock(
                                                      index,
                                                      blockIndex,
                                                      {
                                                        title:
                                                          event.target.value,
                                                      },
                                                    )
                                                  }
                                                />
                                              </label>
                                              <label className="builder-field">
                                                <span>Editor Note</span>
                                                <textarea
                                                  rows={2}
                                                  value={block.body ?? ""}
                                                  onChange={(event) =>
                                                    updateSelectedLayoutBlock(
                                                      index,
                                                      blockIndex,
                                                      {
                                                        body: event.target
                                                          .value,
                                                      },
                                                    )
                                                  }
                                                />
                                              </label>
                                            </>
                                          ) : block.kind === "slider" ? (
                                            <>
                                              <label className="builder-field">
                                                <span>Block Title</span>
                                                <input
                                                  value={block.title ?? ""}
                                                  onChange={(event) =>
                                                    updateSelectedLayoutBlock(
                                                      index,
                                                      blockIndex,
                                                      {
                                                        title:
                                                          event.target.value,
                                                      },
                                                    )
                                                  }
                                                />
                                              </label>
                                              <label className="builder-field">
                                                <span>Body</span>
                                                <textarea
                                                  rows={3}
                                                  value={block.body ?? ""}
                                                  onChange={(event) =>
                                                    updateSelectedLayoutBlock(
                                                      index,
                                                      blockIndex,
                                                      {
                                                        body: event.target
                                                          .value,
                                                      },
                                                    )
                                                  }
                                                />
                                              </label>
                                              <div className="builder-two-column">
                                                <label className="builder-field">
                                                  <span>Cards Per View</span>
                                                  <input
                                                    type="number"
                                                    min={1}
                                                    max={3}
                                                    value={
                                                      block.carouselSettings
                                                        ?.cardsPerView ?? 1
                                                    }
                                                    onChange={(event) =>
                                                      updateSelectedLayoutBlock(
                                                        index,
                                                        blockIndex,
                                                        {
                                                          carouselSettings: {
                                                            ...(block.carouselSettings ??
                                                              {}),
                                                            cardsPerView:
                                                              Number(
                                                                event.target
                                                                  .value,
                                                              ),
                                                          },
                                                        },
                                                      )
                                                    }
                                                  />
                                                </label>
                                                <label className="builder-field">
                                                  <span>Autoplay Delay</span>
                                                  <input
                                                    type="number"
                                                    min={2000}
                                                    max={30000}
                                                    step={500}
                                                    value={
                                                      block.carouselSettings
                                                        ?.autoplayDelayMs ??
                                                      5000
                                                    }
                                                    onChange={(event) =>
                                                      updateSelectedLayoutBlock(
                                                        index,
                                                        blockIndex,
                                                        {
                                                          carouselSettings: {
                                                            ...(block.carouselSettings ??
                                                              {}),
                                                            autoplayDelayMs:
                                                              Number(
                                                                event.target
                                                                  .value,
                                                              ),
                                                          },
                                                        },
                                                      )
                                                    }
                                                  />
                                                </label>
                                              </div>
                                              <div className="builder-slider-options">
                                                {[
                                                  ["autoplay", "Autoplay"],
                                                  ["showArrows", "Arrows"],
                                                  ["showDots", "Dots"],
                                                  ["dragFree", "Drag free"],
                                                  [
                                                    "pauseOnHover",
                                                    "Pause hover",
                                                  ],
                                                ].map(([key, label]) => (
                                                  <label
                                                    key={key}
                                                    className="builder-check"
                                                  >
                                                    <input
                                                      type="checkbox"
                                                      checked={Boolean(
                                                        block
                                                          .carouselSettings?.[
                                                          key as keyof NonNullable<
                                                            BuilderLayoutBlock["carouselSettings"]
                                                          >
                                                        ] ??
                                                        (key === "dragFree" ||
                                                        key === "autoplay"
                                                          ? false
                                                          : true),
                                                      )}
                                                      onChange={(event) =>
                                                        updateSelectedLayoutBlock(
                                                          index,
                                                          blockIndex,
                                                          {
                                                            carouselSettings:
                                                              {
                                                                ...(block.carouselSettings ??
                                                                  {}),
                                                                [key]:
                                                                  event.target
                                                                    .checked,
                                                              },
                                                          },
                                                        )
                                                      }
                                                    />
                                                    <span>{label}</span>
                                                  </label>
                                                ))}
                                              </div>
                                              <div className="builder-section-heading">
                                                <span>Slider Slides</span>
                                                <span>
                                                  {block.slides?.length ?? 0}
                                                </span>
                                              </div>
                                              <button
                                                type="button"
                                                className="builder-inline-add"
                                                onClick={() =>
                                                  addSelectedLayoutBlockSlide(
                                                    index,
                                                    blockIndex,
                                                  )
                                                }
                                              >
                                                <Plus size={15} />
                                                Add slide
                                              </button>
                                              {(block.slides ?? []).map(
                                                (slide, slideIndex) => {
                                                  const slideKey =
                                                    slide.id ??
                                                    `${blockKey}-nested-slide-${slideIndex}`;
                                                  const isSlideOpen =
                                                    openSlideId === slideKey;

                                                  return (
                                                    <div
                                                      key={slideKey}
                                                      className={`builder-nested-card ${
                                                        isSlideOpen
                                                          ? "is-open"
                                                          : ""
                                                      }`}
                                                    >
                                                      <div className="builder-nested-card-header">
                                                        <button
                                                          type="button"
                                                          className="builder-slide-toggle"
                                                          onClick={() =>
                                                            setOpenSlideId(
                                                              isSlideOpen
                                                                ? null
                                                                : slideKey,
                                                            )
                                                          }
                                                        >
                                                          <span>
                                                            Slide{" "}
                                                            {slideIndex + 1}
                                                          </span>
                                                          <small>
                                                            {slide.title ||
                                                              "Untitled slide"}
                                                          </small>
                                                        </button>
                                                        <button
                                                          type="button"
                                                          onClick={() =>
                                                            deleteSelectedLayoutBlockSlide(
                                                              index,
                                                              blockIndex,
                                                              slideIndex,
                                                            )
                                                          }
                                                          title="Delete slide"
                                                        >
                                                          <Trash2 size={14} />
                                                        </button>
                                                      </div>
                                                      {isSlideOpen && (
                                                        <div className="builder-nested-card-body">
                                                          <label className="builder-field">
                                                            <span>
                                                              Slide Badge
                                                            </span>
                                                            <input
                                                              value={
                                                                slide.badge ??
                                                                ""
                                                              }
                                                              onChange={(
                                                                event,
                                                              ) =>
                                                                updateSelectedLayoutBlockSlide(
                                                                  index,
                                                                  blockIndex,
                                                                  slideIndex,
                                                                  {
                                                                    badge:
                                                                      event
                                                                        .target
                                                                        .value,
                                                                  },
                                                                )
                                                              }
                                                            />
                                                          </label>
                                                          <label className="builder-field">
                                                            <span>
                                                              Slide Title
                                                            </span>
                                                            <input
                                                              value={
                                                                slide.title ??
                                                                ""
                                                              }
                                                              onChange={(
                                                                event,
                                                              ) =>
                                                                updateSelectedLayoutBlockSlide(
                                                                  index,
                                                                  blockIndex,
                                                                  slideIndex,
                                                                  {
                                                                    title:
                                                                      event
                                                                        .target
                                                                        .value,
                                                                  },
                                                                )
                                                              }
                                                            />
                                                          </label>
                                                          <label className="builder-field">
                                                            <span>
                                                              Slide Text
                                                            </span>
                                                            <textarea
                                                              rows={3}
                                                              value={
                                                                slide.text ??
                                                                ""
                                                              }
                                                              onChange={(
                                                                event,
                                                              ) =>
                                                                updateSelectedLayoutBlockSlide(
                                                                  index,
                                                                  blockIndex,
                                                                  slideIndex,
                                                                  {
                                                                    text: event
                                                                      .target
                                                                      .value,
                                                                  },
                                                                )
                                                              }
                                                            />
                                                          </label>
                                                          <label className="builder-field">
                                                            <span>
                                                              Image URL
                                                            </span>
                                                            <BuilderImageUrlControl
                                                              value={
                                                                slide.imageUrl ??
                                                                ""
                                                              }
                                                              placeholder="https://... or /uploads/image.jpg"
                                                              onChange={(
                                                                event,
                                                              ) =>
                                                                updateSelectedLayoutBlockSlide(
                                                                  index,
                                                                  blockIndex,
                                                                  slideIndex,
                                                                  {
                                                                    imageUrl:
                                                                      event
                                                                        .target
                                                                        .value,
                                                                  },
                                                                )
                                                              }
                                                              onChoose={() =>
                                                                openWordPressMediaPicker(
                                                                  {
                                                                    title: `Slide ${slideIndex + 1} Image`,
                                                                    currentUrl:
                                                                      slide.imageUrl,
                                                                    onSelect:
                                                                      (
                                                                        media,
                                                                      ) =>
                                                                        updateSelectedLayoutBlockSlide(
                                                                          index,
                                                                          blockIndex,
                                                                          slideIndex,
                                                                          {
                                                                            imageUrl:
                                                                              media.sourceUrl,
                                                                            imageAlt:
                                                                              slide.imageAlt ||
                                                                              media.altText ||
                                                                              media.title,
                                                                          },
                                                                        ),
                                                                  },
                                                                )
                                                              }
                                                            />
                                                          </label>
                                                          <label className="builder-upload-field">
                                                            <span>
                                                              Upload Image
                                                            </span>
                                                            <input
                                                              type="file"
                                                              accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
                                                              onChange={(
                                                                event,
                                                              ) => {
                                                                void uploadSelectedLayoutBlockSlideImage(
                                                                  index,
                                                                  blockIndex,
                                                                  slideIndex,
                                                                  event.target
                                                                    .files?.[0] ??
                                                                    null,
                                                                );
                                                                event.target.value =
                                                                  "";
                                                              }}
                                                            />
                                                            <small>
                                                              {uploadingNestedSlide ===
                                                              `${index}-${blockIndex}-${slideIndex}`
                                                                ? "Uploading..."
                                                                : "Saved to /uploads/builder"}
                                                            </small>
                                                          </label>
                                                          <label className="builder-field">
                                                            <span>
                                                              Image Alt Text
                                                            </span>
                                                            <input
                                                              value={
                                                                slide.imageAlt ??
                                                                ""
                                                              }
                                                              onChange={(
                                                                event,
                                                              ) =>
                                                                updateSelectedLayoutBlockSlide(
                                                                  index,
                                                                  blockIndex,
                                                                  slideIndex,
                                                                  {
                                                                    imageAlt:
                                                                      event
                                                                        .target
                                                                        .value,
                                                                  },
                                                                )
                                                              }
                                                            />
                                                          </label>
                                                          <label className="builder-field">
                                                            <span>
                                                              Image To Panel
                                                              Padding
                                                            </span>
                                                            <select
                                                              value={
                                                                slide.imagePadding ??
                                                                "medium"
                                                              }
                                                              onChange={(
                                                                event,
                                                              ) =>
                                                                updateSelectedLayoutBlockSlide(
                                                                  index,
                                                                  blockIndex,
                                                                  slideIndex,
                                                                  {
                                                                    imagePadding:
                                                                      event
                                                                        .target
                                                                        .value as SlideImagePadding,
                                                                  },
                                                                )
                                                              }
                                                            >
                                                              <option value="frameless">
                                                                Frameless
                                                              </option>
                                                              <option value="small">
                                                                Small
                                                              </option>
                                                              <option value="medium">
                                                                Medium
                                                              </option>
                                                              <option value="max">
                                                                Max
                                                              </option>
                                                            </select>
                                                          </label>
                                                          <label className="builder-field">
                                                            <span>
                                                              Button Label
                                                            </span>
                                                            <input
                                                              value={
                                                                slide.buttonLabel ??
                                                                ""
                                                              }
                                                              onChange={(
                                                                event,
                                                              ) =>
                                                                updateSelectedLayoutBlockSlide(
                                                                  index,
                                                                  blockIndex,
                                                                  slideIndex,
                                                                  {
                                                                    buttonLabel:
                                                                      event
                                                                        .target
                                                                        .value,
                                                                  },
                                                                )
                                                              }
                                                            />
                                                          </label>
                                                          <label className="builder-field">
                                                            <span>
                                                              Button URL
                                                            </span>
                                                            <input
                                                              value={
                                                                slide.buttonUrl ??
                                                                ""
                                                              }
                                                              onChange={(
                                                                event,
                                                              ) =>
                                                                updateSelectedLayoutBlockSlide(
                                                                  index,
                                                                  blockIndex,
                                                                  slideIndex,
                                                                  {
                                                                    buttonUrl:
                                                                      event
                                                                        .target
                                                                        .value,
                                                                  },
                                                                )
                                                              }
                                                            />
                                                          </label>
                                                        </div>
                                                      )}
                                                    </div>
                                                  );
                                                },
                                              )}
                                            </>
                                          ) : block.kind === "icon" ? (
                                            <>
                                              <label className="builder-field">
                                                <span>Icon</span>
                                                <select
                                                  value={
                                                    block.iconName ??
                                                    "sparkles"
                                                  }
                                                  onChange={(event) =>
                                                    updateSelectedLayoutBlock(
                                                      index,
                                                      blockIndex,
                                                      {
                                                        iconName: event.target
                                                          .value as BuilderLayoutBlock["iconName"],
                                                      },
                                                    )
                                                  }
                                                >
                                                  <option value="sparkles">
                                                    Sparkles
                                                  </option>
                                                  <option value="heart">
                                                    Heart
                                                  </option>
                                                  <option value="truck">
                                                    Truck
                                                  </option>
                                                  <option value="shield">
                                                    Shield
                                                  </option>
                                                </select>
                                              </label>
                                              <label className="builder-field">
                                                <span>Title</span>
                                                <input
                                                  value={block.title ?? ""}
                                                  onChange={(event) =>
                                                    updateSelectedLayoutBlock(
                                                      index,
                                                      blockIndex,
                                                      {
                                                        title:
                                                          event.target.value,
                                                      },
                                                    )
                                                  }
                                                />
                                              </label>
                                              <label className="builder-field">
                                                <span>Text</span>
                                                <textarea
                                                  rows={3}
                                                  value={block.body ?? ""}
                                                  onChange={(event) =>
                                                    updateSelectedLayoutBlock(
                                                      index,
                                                      blockIndex,
                                                      {
                                                        body: event.target
                                                          .value,
                                                      },
                                                    )
                                                  }
                                                />
                                              </label>
                                            </>
                                          ) : block.kind === "list" ? (
                                            <>
                                              <label className="builder-field">
                                                <span>Title</span>
                                                <input
                                                  value={block.title ?? ""}
                                                  onChange={(event) =>
                                                    updateSelectedLayoutBlock(
                                                      index,
                                                      blockIndex,
                                                      {
                                                        title:
                                                          event.target.value,
                                                      },
                                                    )
                                                  }
                                                />
                                              </label>
                                              <label className="builder-field">
                                                <span>Items</span>
                                                <textarea
                                                  rows={5}
                                                  value={(
                                                    block.items ?? []
                                                  ).join("\n")}
                                                  onChange={(event) =>
                                                    updateSelectedLayoutBlock(
                                                      index,
                                                      blockIndex,
                                                      {
                                                        items:
                                                          event.target.value
                                                            .split("\n")
                                                            .map((item) =>
                                                              item.trim(),
                                                            )
                                                            .filter(Boolean),
                                                      },
                                                    )
                                                  }
                                                />
                                              </label>
                                            </>
                                          ) : block.kind === "datePicker" ? (
                                            <>
                                              <label className="builder-field">
                                                <span>Title</span>
                                                <input
                                                  value={block.title ?? ""}
                                                  onChange={(event) =>
                                                    updateSelectedLayoutBlock(
                                                      index,
                                                      blockIndex,
                                                      {
                                                        title:
                                                          event.target.value,
                                                      },
                                                    )
                                                  }
                                                />
                                              </label>
                                              <label className="builder-field">
                                                <span>Field Label</span>
                                                <input
                                                  value={
                                                    block.dateLabel ?? ""
                                                  }
                                                  onChange={(event) =>
                                                    updateSelectedLayoutBlock(
                                                      index,
                                                      blockIndex,
                                                      {
                                                        dateLabel:
                                                          event.target.value,
                                                      },
                                                    )
                                                  }
                                                />
                                              </label>
                                              <label className="builder-field">
                                                <span>Help Text</span>
                                                <textarea
                                                  rows={3}
                                                  value={block.body ?? ""}
                                                  onChange={(event) =>
                                                    updateSelectedLayoutBlock(
                                                      index,
                                                      blockIndex,
                                                      {
                                                        body: event.target
                                                          .value,
                                                      },
                                                    )
                                                  }
                                                />
                                              </label>
                                            </>
                                          ) : block.kind === "badgeGrid" ? (
                                            <>
                                              <label className="builder-field">
                                                <span>Block Title</span>
                                                <input
                                                  value={block.title ?? ""}
                                                  onChange={(event) =>
                                                    updateSelectedLayoutBlock(
                                                      index,
                                                      blockIndex,
                                                      {
                                                        title:
                                                          event.target.value,
                                                      },
                                                    )
                                                  }
                                                />
                                              </label>
                                              <label className="builder-field">
                                                <span>Body</span>
                                                <textarea
                                                  rows={3}
                                                  value={block.body ?? ""}
                                                  onChange={(event) =>
                                                    updateSelectedLayoutBlock(
                                                      index,
                                                      blockIndex,
                                                      {
                                                        body: event.target
                                                          .value,
                                                      },
                                                    )
                                                  }
                                                />
                                              </label>
                                              {block.kind === "badgeGrid" && (
                                                <label className="builder-field">
                                                  <span>Badge Columns</span>
                                                  <input
                                                    type="number"
                                                    min={1}
                                                    max={3}
                                                    value={block.columns ?? 2}
                                                    onChange={(event) =>
                                                      updateSelectedLayoutBlock(
                                                        index,
                                                        blockIndex,
                                                        {
                                                          columns: Number(
                                                            event.target
                                                              .value,
                                                          ),
                                                        },
                                                      )
                                                    }
                                                  />
                                                </label>
                                              )}
                                              <div className="builder-section-heading">
                                                <span>Badges</span>
                                                <span>
                                                  {block.badges?.length ?? 0}
                                                </span>
                                              </div>
                                              <button
                                                type="button"
                                                className="builder-inline-add"
                                                onClick={() =>
                                                  addSelectedLayoutBlockBadge(
                                                    index,
                                                    blockIndex,
                                                  )
                                                }
                                              >
                                                <Plus size={15} />
                                                Add badge
                                              </button>
                                              {(block.badges ?? []).map(
                                                (badge, badgeIndex) => (
                                                  <div
                                                    key={
                                                      badge.id ??
                                                      `${blockKey}-badge-${badgeIndex}`
                                                    }
                                                    className="builder-nested-card is-open"
                                                  >
                                                    <div className="builder-nested-card-header">
                                                      <span>
                                                        Badge {badgeIndex + 1}
                                                      </span>
                                                      <button
                                                        type="button"
                                                        onClick={() =>
                                                          deleteSelectedLayoutBlockBadge(
                                                            index,
                                                            blockIndex,
                                                            badgeIndex,
                                                          )
                                                        }
                                                        title="Delete badge"
                                                      >
                                                        <Trash2 size={14} />
                                                      </button>
                                                    </div>
                                                    <div className="builder-nested-card-body">
                                                      <label className="builder-field">
                                                        <span>Label</span>
                                                        <input
                                                          value={
                                                            badge.label ?? ""
                                                          }
                                                          onChange={(event) =>
                                                            updateSelectedLayoutBlockBadge(
                                                              index,
                                                              blockIndex,
                                                              badgeIndex,
                                                              {
                                                                label:
                                                                  event.target
                                                                    .value,
                                                              },
                                                            )
                                                          }
                                                        />
                                                      </label>
                                                      <label className="builder-field">
                                                        <span>Title</span>
                                                        <input
                                                          value={
                                                            badge.title ?? ""
                                                          }
                                                          onChange={(event) =>
                                                            updateSelectedLayoutBlockBadge(
                                                              index,
                                                              blockIndex,
                                                              badgeIndex,
                                                              {
                                                                title:
                                                                  event.target
                                                                    .value,
                                                              },
                                                            )
                                                          }
                                                        />
                                                      </label>
                                                      <label className="builder-field">
                                                        <span>Text</span>
                                                        <textarea
                                                          rows={3}
                                                          value={
                                                            badge.body ?? ""
                                                          }
                                                          onChange={(event) =>
                                                            updateSelectedLayoutBlockBadge(
                                                              index,
                                                              blockIndex,
                                                              badgeIndex,
                                                              {
                                                                body: event
                                                                  .target
                                                                  .value,
                                                              },
                                                            )
                                                          }
                                                        />
                                                      </label>
                                                    </div>
                                                  </div>
                                                ),
                                              )}
                                            </>
                                          ) : block.kind === "panel" ? (
                                            <>
                                              <label className="builder-field">
                                                <span>Image URL</span>
                                                <BuilderImageUrlControl
                                                  value={block.imageUrl ?? ""}
                                                  onChange={(event) =>
                                                    updateSelectedLayoutBlock(
                                                      index,
                                                      blockIndex,
                                                      {
                                                        imageUrl:
                                                          event.target.value,
                                                      },
                                                    )
                                                  }
                                                  onChoose={() =>
                                                    openWordPressMediaPicker({
                                                      title: "Panel Image",
                                                      currentUrl:
                                                        block.imageUrl,
                                                      onSelect: (media) =>
                                                        updateSelectedLayoutBlock(
                                                          index,
                                                          blockIndex,
                                                          {
                                                            imageUrl:
                                                              media.sourceUrl,
                                                            imageAlt:
                                                              block.imageAlt ||
                                                              media.altText ||
                                                              media.title,
                                                          },
                                                        ),
                                                    })
                                                  }
                                                />
                                              </label>
                                              <label className="builder-field">
                                                <span>Image Alt</span>
                                                <input
                                                  value={block.imageAlt ?? ""}
                                                  onChange={(event) =>
                                                    updateSelectedLayoutBlock(
                                                      index,
                                                      blockIndex,
                                                      {
                                                        imageAlt:
                                                          event.target.value,
                                                      },
                                                    )
                                                  }
                                                />
                                              </label>
                                              <label className="builder-field">
                                                <span>Eyebrow</span>
                                                <input
                                                  value={block.eyebrow ?? ""}
                                                  onChange={(event) =>
                                                    updateSelectedLayoutBlock(
                                                      index,
                                                      blockIndex,
                                                      {
                                                        eyebrow:
                                                          event.target.value,
                                                      },
                                                    )
                                                  }
                                                />
                                              </label>
                                              <label className="builder-field">
                                                <span>Title</span>
                                                <input
                                                  value={block.title ?? ""}
                                                  onChange={(event) =>
                                                    updateSelectedLayoutBlock(
                                                      index,
                                                      blockIndex,
                                                      {
                                                        title:
                                                          event.target.value,
                                                      },
                                                    )
                                                  }
                                                />
                                              </label>
                                              <label className="builder-field">
                                                <span>Body</span>
                                                <textarea
                                                  rows={4}
                                                  value={block.body ?? ""}
                                                  onChange={(event) =>
                                                    updateSelectedLayoutBlock(
                                                      index,
                                                      blockIndex,
                                                      {
                                                        body: event.target
                                                          .value,
                                                      },
                                                    )
                                                  }
                                                />
                                              </label>
                                              <label className="builder-field">
                                                <span>Button Label</span>
                                                <input
                                                  value={
                                                    block.buttonLabel ?? ""
                                                  }
                                                  onChange={(event) =>
                                                    updateSelectedLayoutBlock(
                                                      index,
                                                      blockIndex,
                                                      {
                                                        buttonLabel:
                                                          event.target.value,
                                                      },
                                                    )
                                                  }
                                                />
                                              </label>
                                              <label className="builder-field">
                                                <span>Button URL</span>
                                                <input
                                                  value={
                                                    block.buttonUrl ?? ""
                                                  }
                                                  onChange={(event) =>
                                                    updateSelectedLayoutBlock(
                                                      index,
                                                      blockIndex,
                                                      {
                                                        buttonUrl:
                                                          event.target.value,
                                                      },
                                                    )
                                                  }
                                                />
                                              </label>
                                            </>
                                          ) : block.kind === "image" ? (
                                            <>
                                              <label className="builder-field">
                                                <span>Image URL</span>
                                                <BuilderImageUrlControl
                                                  value={block.imageUrl ?? ""}
                                                  onChange={(event) =>
                                                    updateSelectedLayoutBlock(
                                                      index,
                                                      blockIndex,
                                                      {
                                                        imageUrl:
                                                          event.target.value,
                                                      },
                                                    )
                                                  }
                                                  onChoose={() =>
                                                    openWordPressMediaPicker({
                                                      title: "Image Block",
                                                      currentUrl:
                                                        block.imageUrl,
                                                      onSelect: (media) =>
                                                        updateSelectedLayoutBlock(
                                                          index,
                                                          blockIndex,
                                                          {
                                                            imageUrl:
                                                              media.sourceUrl,
                                                            imageAlt:
                                                              block.imageAlt ||
                                                              media.altText ||
                                                              media.title,
                                                          },
                                                        ),
                                                    })
                                                  }
                                                />
                                              </label>
                                              <label className="builder-field">
                                                <span>Image Alt</span>
                                                <input
                                                  value={block.imageAlt ?? ""}
                                                  onChange={(event) =>
                                                    updateSelectedLayoutBlock(
                                                      index,
                                                      blockIndex,
                                                      {
                                                        imageAlt:
                                                          event.target.value,
                                                      },
                                                    )
                                                  }
                                                />
                                              </label>
                                            </>
                                          ) : (
                                            <>
                                              <label className="builder-field">
                                                <span>Eyebrow</span>
                                                <input
                                                  value={block.eyebrow ?? ""}
                                                  onChange={(event) =>
                                                    updateSelectedLayoutBlock(
                                                      index,
                                                      blockIndex,
                                                      {
                                                        eyebrow:
                                                          event.target.value,
                                                      },
                                                    )
                                                  }
                                                />
                                              </label>
                                              <label className="builder-field">
                                                <span>Title</span>
                                                <input
                                                  value={block.title ?? ""}
                                                  onChange={(event) =>
                                                    updateSelectedLayoutBlock(
                                                      index,
                                                      blockIndex,
                                                      {
                                                        title:
                                                          event.target.value,
                                                      },
                                                    )
                                                  }
                                                />
                                              </label>
                                              <label className="builder-field">
                                                <span>Body</span>
                                                <textarea
                                                  rows={4}
                                                  value={block.body ?? ""}
                                                  onChange={(event) =>
                                                    updateSelectedLayoutBlock(
                                                      index,
                                                      blockIndex,
                                                      {
                                                        body: event.target
                                                          .value,
                                                      },
                                                    )
                                                  }
                                                />
                                              </label>
                                              <label className="builder-field">
                                                <span>Button Label</span>
                                                <input
                                                  value={
                                                    block.buttonLabel ?? ""
                                                  }
                                                  onChange={(event) =>
                                                    updateSelectedLayoutBlock(
                                                      index,
                                                      blockIndex,
                                                      {
                                                        buttonLabel:
                                                          event.target.value,
                                                      },
                                                    )
                                                  }
                                                />
                                              </label>
                                              <label className="builder-field">
                                                <span>Button URL</span>
                                                <input
                                                  value={
                                                    block.buttonUrl ?? ""
                                                  }
                                                  onChange={(event) =>
                                                    updateSelectedLayoutBlock(
                                                      index,
                                                      blockIndex,
                                                      {
                                                        buttonUrl:
                                                          event.target.value,
                                                      },
                                                    )
                                                  }
                                                />
                                              </label>
                                            </>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            );
                          },
                        )}
                      </>
                    )}




                    {!selectedLayoutBlock &&
                      selectedSection.kind === "productArchive" && (
                        <>
                          <div className="builder-two-column">
                            <label className="builder-field">
                              <span>Source</span>
                              <select
                                value={selectedSection.source ?? "all"}
                                onChange={(event) =>
                                  updateSelected({
                                    source: event.target
                                      .value as BuilderSection["source"],
                                  })
                                }
                              >
                                <option value="all">All products</option>
                                <option value="featured">Featured</option>
                                <option value="category">Category</option>
                              </select>
                            </label>

                            <label className="builder-field">
                              <span>Layout Variant</span>
                              <select
                                value={
                                  selectedSection.layoutVariant ?? "grid"
                                }
                                onChange={(event) =>
                                  updateSelected({
                                    layoutVariant: event.target
                                      .value as BuilderSection["layoutVariant"],
                                  })
                                }
                              >
                                <option value="grid">Grid</option>
                                <option value="carousel">Carousel</option>
                              </select>
                            </label>
                          </div>

                          {selectedSection.source === "category" && (
                            <label className="builder-field">
                              <span>Category Slug / ID</span>
                              <input
                                value={selectedSection.categoryId ?? ""}
                                onChange={(event) =>
                                  updateSelected({
                                    categoryId: event.target.value,
                                  })
                                }
                              />
                            </label>
                          )}

                          <label className="builder-field">
                            <span>Columns</span>
                            <input
                              type="number"
                              min={2}
                              max={6}
                              value={selectedSection.columns ?? 4}
                              onChange={(event) =>
                                updateSelected({
                                  columns: Number(event.target.value),
                                })
                              }
                            />
                          </label>

                          <label className="builder-field">
                            <span>Grid Limit / Page Size</span>
                            <input
                              type="number"
                              min={4}
                              max={48}
                              value={selectedSection.gridLimit ?? 12}
                              onChange={(event) =>
                                updateSelected({
                                  gridLimit: Number(event.target.value),
                                })
                              }
                            />
                          </label>

                          <label className="builder-field">
                            <span>Filter Position</span>
                            <select
                              value={selectedSection.filterPosition ?? "left"}
                              onChange={(event) =>
                                updateSelected({
                                  filterPosition: event.target
                                    .value as BuilderSection["filterPosition"],
                                })
                              }
                            >
                              <option value="left">Left sidebar</option>
                              <option value="top">Top pills</option>
                              <option value="drawer">Drawer</option>
                              <option value="hidden">Hidden</option>
                            </select>
                          </label>

                          <label className="builder-field">
                            <span>Card Style</span>
                            <select
                              value={selectedSection.cardStyle ?? "flat"}
                              onChange={(event) =>
                                updateSelected({
                                  cardStyle: event.target
                                    .value as BuilderSection["cardStyle"],
                                })
                              }
                            >
                              <option value="flat">Flat</option>
                              <option value="soft">Soft</option>
                              <option value="lined">Lined</option>
                              <option value="none">No background</option>
                            </select>
                          </label>

                          <label className="builder-field">
                            <span>Card Preset</span>
                            <select
                              value={selectedSection.cardPreset ?? "standard"}
                              onChange={(event) =>
                                updateSelected({
                                  cardPreset: event.target
                                    .value as BuilderSection["cardPreset"],
                                })
                              }
                            >
                              <option value="standard">Standard</option>
                              <option value="graph">Graph Clean</option>
                              <option value="gallery">Gallery</option>
                              <option value="editorial">Editorial</option>
                              <option value="compact">Compact</option>
                              <option value="minimal">Minimal</option>
                              <option value="luxury">Luxury</option>
                            </select>
                          </label>

                          <div className="builder-two-column">
                            <label className="builder-field">
                              <span>Grid Gap</span>
                              <select
                                value={selectedSection.gridGap ?? "large"}
                                onChange={(event) =>
                                  updateSelected({
                                    gridGap: event.target
                                      .value as BuilderSection["gridGap"],
                                  })
                                }
                              >
                                <option value="none">None</option>
                                <option value="small">Small</option>
                                <option value="medium">Medium</option>
                                <option value="large">Large</option>
                                <option value="max">Max</option>
                              </select>
                            </label>

                            <label className="builder-field">
                              <span>Card Padding</span>
                              <select
                                value={
                                  selectedSection.cardPadding ?? "medium"
                                }
                                onChange={(event) =>
                                  updateSelected({
                                    cardPadding: event.target
                                      .value as BuilderSection["cardPadding"],
                                  })
                                }
                              >
                                <option value="none">None</option>
                                <option value="small">Small</option>
                                <option value="medium">Medium</option>
                                <option value="large">Large</option>
                                <option value="max">Max</option>
                              </select>
                            </label>
                          </div>

                          <label className="builder-field">
                            <span>Image Padding</span>
                            <select
                              value={selectedSection.imagePadding ?? "large"}
                              onChange={(event) =>
                                updateSelected({
                                  imagePadding: event.target
                                    .value as BuilderSection["imagePadding"],
                                })
                              }
                            >
                              <option value="none">Frameless</option>
                              <option value="small">Small</option>
                              <option value="medium">Medium</option>
                              <option value="large">Large</option>
                              <option value="max">Max</option>
                            </select>
                          </label>

                          <details className="builder-collapse" open>
                            <summary>
                              <span>Add To Cart Button</span>
                              <small>
                                {selectedSection.addToCartStyle ?? "blue"}
                              </small>
                            </summary>
                            <div className="builder-two-column">
                              <label className="builder-field">
                                <span>Color</span>
                                <select
                                  value={
                                    selectedSection.addToCartStyle ?? "blue"
                                  }
                                  onChange={(event) =>
                                    updateSelected({
                                      addToCartStyle: event.target
                                        .value as BuilderSection["addToCartStyle"],
                                    })
                                  }
                                >
                                  <option value="blue">Publish blue</option>
                                  <option value="dark">Dark</option>
                                  <option value="light">Light</option>
                                  <option value="inherit">
                                    Theme button
                                  </option>
                                </select>
                              </label>
                              <label className="builder-field">
                                <span>Size</span>
                                <select
                                  value={
                                    selectedSection.addToCartSize ?? "medium"
                                  }
                                  onChange={(event) =>
                                    updateSelected({
                                      addToCartSize: event.target
                                        .value as BuilderSection["addToCartSize"],
                                    })
                                  }
                                >
                                  <option value="compact">Compact</option>
                                  <option value="medium">Medium</option>
                                  <option value="large">Large</option>
                                  <option value="full">Full width</option>
                                </select>
                              </label>
                            </div>
                            <div className="builder-two-column">
                              <label className="builder-field">
                                <span>Display</span>
                                <select
                                  value={
                                    selectedSection.addToCartDisplay ??
                                    "button"
                                  }
                                  onChange={(event) =>
                                    updateSelected({
                                      addToCartDisplay: event.target
                                        .value as BuilderSection["addToCartDisplay"],
                                    })
                                  }
                                >
                                  <option value="button">Text button</option>
                                  <option value="icon">Cart icon</option>
                                </select>
                              </label>
                              <label className="builder-field">
                                <span>Visibility</span>
                                <select
                                  value={
                                    selectedSection.addToCartVisibility ??
                                    "hover"
                                  }
                                  onChange={(event) =>
                                    updateSelected({
                                      addToCartVisibility: event.target
                                        .value as BuilderSection["addToCartVisibility"],
                                    })
                                  }
                                >
                                  <option value="hover">On hover</option>
                                  <option value="always">
                                    Always visible
                                  </option>
                                </select>
                              </label>
                            </div>
                            <div className="builder-two-column">
                              <label className="builder-field">
                                <span>Position</span>
                                <select
                                  value={
                                    selectedSection.addToCartPosition ??
                                    "below"
                                  }
                                  onChange={(event) =>
                                    updateSelected({
                                      addToCartPosition: event.target
                                        .value as BuilderSection["addToCartPosition"],
                                    })
                                  }
                                >
                                  <option value="below">Below details</option>
                                  <option value="under-price">
                                    Under price
                                  </option>
                                  <option value="under-wishlist">
                                    Under wishlist
                                  </option>
                                </select>
                              </label>
                              <div className="builder-field">
                                <span>Best with</span>
                                <small>
                                  Icon works nicely under wishlist
                                </small>
                              </div>
                            </div>
                          </details>
                        </>
                      )}

                    {selectedSection.kind === "badgeGrid" && (
                      <>
                        <label className="builder-field">
                          <span>Columns</span>
                          <input
                            type="number"
                            min={2}
                            max={4}
                            value={selectedSection.columns ?? 3}
                            onChange={(event) =>
                              updateSelected({
                                columns: Number(event.target.value),
                              })
                            }
                          />
                        </label>

                        <div className="builder-section-heading">
                          <span>Badges</span>
                          <span>{selectedSection.badges?.length ?? 0}</span>
                        </div>

                        {(selectedSection.badges ?? []).map(
                          (badge, index) => (
                            <div
                              key={badge.id ?? index}
                              className="builder-nested-card"
                            >
                              <label className="builder-field">
                                <span>Badge Label</span>
                                <input
                                  value={badge.label ?? ""}
                                  onChange={(event) =>
                                    updateSelectedBadge(index, {
                                      label: event.target.value,
                                    })
                                  }
                                />
                              </label>
                              <label className="builder-field">
                                <span>Badge Title</span>
                                <input
                                  value={badge.title ?? ""}
                                  onChange={(event) =>
                                    updateSelectedBadge(index, {
                                      title: event.target.value,
                                    })
                                  }
                                />
                              </label>
                              <label className="builder-field">
                                <span>Badge Body</span>
                                <textarea
                                  rows={3}
                                  value={badge.body ?? ""}
                                  onChange={(event) =>
                                    updateSelectedBadge(index, {
                                      body: event.target.value,
                                    })
                                  }
                                />
                              </label>
                            </div>
                          ),
                        )}
                      </>
                    )}

                    {selectedSection.kind === "embed" && (
                      <>
                        <label className="builder-field">
                          <span>Embed Mode</span>
                          <select
                            value={selectedSection.embedMode ?? "iframe"}
                            onChange={(event) =>
                              updateSelected({
                                embedMode: event.target.value as EmbedMode,
                              })
                            }
                          >
                            <option value="iframe">Iframe URL</option>
                            <option value="code">Custom HTML / Script</option>
                          </select>
                        </label>

                        {selectedSection.embedMode !== "code" && (
                          <label className="builder-field">
                            <span>Iframe URL</span>
                            <input
                              value={selectedSection.embedUrl ?? ""}
                              placeholder="https://..."
                              onChange={(event) =>
                                updateSelected({
                                  embedUrl: event.target.value,
                                })
                              }
                            />
                          </label>
                        )}

                        {selectedSection.embedMode === "code" && (
                          <label className="builder-field">
                            <span>Embed Code</span>
                            <textarea
                              rows={7}
                              value={selectedSection.embedCode ?? ""}
                              placeholder="<div>...</div> or trusted widget script"
                              onChange={(event) =>
                                updateSelected({
                                  embedCode: event.target.value,
                                })
                              }
                            />
                          </label>
                        )}

                        <label className="builder-field">
                          <span>Embed Height</span>
                          <input
                            type="number"
                            min={120}
                            max={1200}
                            value={selectedSection.embedHeight ?? 420}
                            onChange={(event) =>
                              updateSelected({
                                embedHeight: Number(event.target.value),
                              })
                            }
                          />
                        </label>
                      </>
                    )}

                    {selectedSection.kind === "slider" && (
                      <>
                        <label className="builder-field">
                          <span>Slider Variant</span>
                          <select
                            value={
                              selectedSection.carouselSettings?.variant ??
                              "hero"
                            }
                            onChange={(event) =>
                              updateSelected({
                                carouselSettings: {
                                  ...(selectedSection.carouselSettings ?? {}),
                                  variant: event.target.value,
                                },
                              })
                            }
                          >
                            <option value="hero">Hero</option>
                            <option value="basic">Basic</option>
                            <option value="overlay">Overlay</option>
                          </select>
                        </label>

                        <label className="builder-field">
                          <span>Cards Per View</span>
                          <input
                            type="number"
                            min={1}
                            max={4}
                            value={
                              selectedSection.carouselSettings
                                ?.cardsPerView ?? 1
                            }
                            onChange={(event) =>
                              updateSelected({
                                carouselSettings: {
                                  ...(selectedSection.carouselSettings ?? {}),
                                  cardsPerView: Number(event.target.value),
                                },
                              })
                            }
                          />
                        </label>

                        <label className="builder-field">
                          <span>Autoplay Delay (ms)</span>
                          <input
                            type="number"
                            min={2000}
                            max={30000}
                            step={500}
                            value={
                              selectedSection.carouselSettings
                                ?.autoplayDelayMs ?? 5000
                            }
                            onChange={(event) =>
                              updateSelected({
                                carouselSettings: {
                                  ...(selectedSection.carouselSettings ?? {}),
                                  autoplayDelayMs: Number(event.target.value),
                                },
                              })
                            }
                          />
                        </label>

                        <label className="builder-field">
                          <span>Align</span>
                          <select
                            value={
                              selectedSection.carouselSettings?.align ??
                              "center"
                            }
                            onChange={(event) =>
                              updateSelected({
                                carouselSettings: {
                                  ...(selectedSection.carouselSettings ?? {}),
                                  align: event.target.value as NonNullable<
                                    BuilderSection["carouselSettings"]
                                  >["align"],
                                },
                              })
                            }
                          >
                            <option value="center">Center</option>
                            <option value="start">Start</option>
                          </select>
                        </label>

                        <div className="builder-slider-options">
                          {[
                            ["autoplay", "Autoplay"],
                            ["showArrows", "Arrows"],
                            ["showDots", "Dots"],
                            ["dragFree", "Drag free"],
                            ["pauseOnHover", "Pause hover"],
                          ].map(([key, label]) => (
                            <label key={key} className="builder-check">
                              <input
                                type="checkbox"
                                checked={Boolean(
                                  selectedSection.carouselSettings?.[
                                    key as keyof NonNullable<
                                      BuilderSection["carouselSettings"]
                                    >
                                  ] ?? (key === "dragFree" ? false : true),
                                )}
                                onChange={(event) =>
                                  updateSelected({
                                    carouselSettings: {
                                      ...(selectedSection.carouselSettings ??
                                        {}),
                                      [key]: event.target.checked,
                                    },
                                  })
                                }
                              />
                              <span>{label}</span>
                            </label>
                          ))}
                        </div>

                        <div className="builder-section-heading">
                          <span>Slides</span>
                          <span>{selectedSection.slides?.length ?? 0}</span>
                        </div>

                        <button
                          type="button"
                          className="builder-inline-add"
                          onClick={addSelectedSlide}
                        >
                          <Plus size={15} />
                          Add slide
                        </button>

                        {(selectedSection.slides ?? []).map(
                          (slide, index) => {
                            const slideKey = slide.id ?? `slide-${index}`;
                            const isOpen = openSlideId === slideKey;

                            return (
                              <div
                                key={slideKey}
                                className={`builder-nested-card ${isOpen ? "is-open" : ""}`}
                              >
                                <div className="builder-nested-card-header">
                                  <button
                                    type="button"
                                    className="builder-slide-toggle"
                                    onClick={() =>
                                      setOpenSlideId(isOpen ? null : slideKey)
                                    }
                                  >
                                    <span>Slide {index + 1}</span>
                                    <small>
                                      {slide.title || "Untitled slide"}
                                    </small>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => deleteSelectedSlide(index)}
                                    title="Delete slide"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>

                                {isOpen && (
                                  <div className="builder-nested-card-body">
                                    <label className="builder-field">
                                      <span>Slide Badge</span>
                                      <input
                                        value={slide.badge ?? ""}
                                        onChange={(event) =>
                                          updateSelectedSlide(index, {
                                            badge: event.target.value,
                                          })
                                        }
                                      />
                                    </label>
                                    <label className="builder-field">
                                      <span>Slide Title</span>
                                      <input
                                        value={slide.title ?? ""}
                                        onChange={(event) =>
                                          updateSelectedSlide(index, {
                                            title: event.target.value,
                                          })
                                        }
                                      />
                                    </label>
                                    <label className="builder-field">
                                      <span>Slide Text</span>
                                      <textarea
                                        rows={3}
                                        value={slide.text ?? ""}
                                        onChange={(event) =>
                                          updateSelectedSlide(index, {
                                            text: event.target.value,
                                          })
                                        }
                                      />
                                    </label>
                                    <label className="builder-field">
                                      <span>Image URL</span>
                                      <BuilderImageUrlControl
                                        value={slide.imageUrl ?? ""}
                                        placeholder="https://... or /uploads/image.jpg"
                                        onChange={(event) =>
                                          updateSelectedSlide(index, {
                                            imageUrl: event.target.value,
                                          })
                                        }
                                        onChoose={() =>
                                          openWordPressMediaPicker({
                                            title: `Slide ${index + 1} Image`,
                                            currentUrl: slide.imageUrl,
                                            onSelect: (media) =>
                                              updateSelectedSlide(index, {
                                                imageUrl: media.sourceUrl,
                                                imageAlt:
                                                  slide.imageAlt ||
                                                  media.altText ||
                                                  media.title,
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
                                          void uploadSelectedSlideImage(
                                            index,
                                            event.target.files?.[0] ?? null,
                                          );
                                          event.target.value = "";
                                        }}
                                      />
                                      <small>
                                        {uploadingSlide === index
                                          ? "Uploading..."
                                          : "Saved to /uploads/builder"}
                                      </small>
                                    </label>
                                    <label className="builder-field">
                                      <span>Image Alt Text</span>
                                      <input
                                        value={slide.imageAlt ?? ""}
                                        onChange={(event) =>
                                          updateSelectedSlide(index, {
                                            imageAlt: event.target.value,
                                          })
                                        }
                                      />
                                    </label>
                                    <label className="builder-field">
                                      <span>Image To Panel Padding</span>
                                      <select
                                        value={slide.imagePadding ?? "medium"}
                                        onChange={(event) =>
                                          updateSelectedSlide(index, {
                                            imagePadding: event.target
                                              .value as SlideImagePadding,
                                          })
                                        }
                                      >
                                        <option value="frameless">
                                          Frameless
                                        </option>
                                        <option value="small">Small</option>
                                        <option value="medium">Medium</option>
                                        <option value="max">Max</option>
                                      </select>
                                    </label>
                                    <label className="builder-field">
                                      <span>Button Label</span>
                                      <input
                                        value={slide.buttonLabel ?? ""}
                                        onChange={(event) =>
                                          updateSelectedSlide(index, {
                                            buttonLabel: event.target.value,
                                          })
                                        }
                                      />
                                    </label>
                                    <label className="builder-field">
                                      <span>Button URL</span>
                                      <input
                                        value={slide.buttonUrl ?? ""}
                                        onChange={(event) =>
                                          updateSelectedSlide(index, {
                                            buttonUrl: event.target.value,
                                          })
                                        }
                                      />
                                    </label>
                                  </div>
                                )}
                              </div>
                            );
                          },
                    )}
                      </>
                    )}
                  </details>
                )}
            </details>
          )}
          {inspectorTab === "advanced" && (
            <>
              <details className="builder-collapse" open>
                <summary>
                  <span>Publishing State</span>
                  <small>
                    {selectedSection.visible ? "visible" : "hidden"}
                  </small>
                </summary>

                <label className="builder-check">
                  <input
                    type="checkbox"
                    checked={selectedSection.visible}
                    onChange={(event) =>
                      updateSelected({ visible: event.target.checked })
                    }
                  />
                  <span>Visible on page</span>
                </label>
              </details>

              <details className="builder-collapse">
                <summary>
                  <span>Current JSON</span>
                  <small>advanced</small>
                </summary>
                <div className="builder-json-card">
                  <span>Current JSON</span>
                  <pre>{builderJson}</pre>
                </div>
                <button
                  type="button"
                  className="builder-secondary-button builder-full-button"
                  onClick={copyJson}
                >
                  <Save size={16} />
                  {copied ? "Copied JSON" : "Export JSON"}
                </button>
              </details>
            </>
          )}
        </>
      ) : (
        <div className="builder-empty-state">
          <Layers3 size={22} />
          <p>Add a section to start designing.</p>
        </div>
      )}
    </aside>
  );
}
