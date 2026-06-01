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
  X,
} from "lucide-react";
import RichTextEditor from "./RichTextEditor";
import {
  useEffect,
  useState,
  type ChangeEvent,
  type Dispatch,
  type SetStateAction,
} from "react";
import type {
  BuilderLayoutBlock,
  BuilderAnimationPreset,
  BuilderSection,
  EmbedMode,
  InspectorTab,
  LayoutBlockKind,
  BuilderPanelStyle,
  SectionKind,
  SlideImagePadding,
  SectionBackgroundMode,
  SectionColorScheme,
  SectionContentMode,
  SectionSpacing,
  WordPressMediaItem,
} from "@/components/dashboard/builderTypes";
import {
  builderRowLayoutPresets,
  getBuilderRowLayoutPreset,
  getBuilderRowLayoutSummary,
} from "@/components/dashboard/builderLayoutPresets";
import TypographyPanel from "@/components/dashboard/TypographyPanel";
import StyleTabPanel from "@/components/dashboard/style/StyleTabPanel";
import AnimationControl from "@/components/dashboard/style/AnimationControl";
import type { BuilderVisualStyle } from "@/lib/builderVisualStyle";
import type { CategoryTreeItem } from "@/lib/categories";

// Inspector handlers mirror the lifted builder callbacks during this JSX-only extraction.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type LooseHandler = (...args: any[]) => void;
type BackgroundPreset = { label: string; value: string; scheme?: string };
const panelStyleOptions: { label: string; value: BuilderPanelStyle }[] = [
  { label: "Default", value: "default" },
  { label: "Princity", value: "princity" },
  { label: "Princity Flat", value: "princity-flat" },
  { label: "Princity Line", value: "princity-line" },
  { label: "Secondary", value: "secondary" },
  { label: "Dark", value: "dark" },
  { label: "Light", value: "light" },
  { label: "Clean with shadow", value: "clean-shadow" },
  { label: "Flat dark", value: "flat-dark" },
  { label: "Flat white", value: "flat-white" },
];

// Kept for backward compat — the AnimationControl component
// handles the new presets. This array is still used for old preset
// descriptions in some inspector panels.
const animationPresetOptions: {
  label: string;
  value: BuilderAnimationPreset;
  description: string;
}[] = [
  { label: "None", value: "none", description: "No animation." },
  { label: "Fade Up", value: "fade-up", description: "Slide up + fade in." },
  { label: "Fade Down", value: "fade-down", description: "Slide down + fade in." },
  { label: "Fade In", value: "fade-in", description: "Pure opacity fade." },
  { label: "Slide Left", value: "slide-left", description: "Enter from left." },
  { label: "Slide Right", value: "slide-right", description: "Enter from right." },
  { label: "Scale Up", value: "scale-up", description: "Subtle zoom + fade." },
  { label: "Zoom In", value: "zoom-in", description: "Dramatic zoom entrance." },
  { label: "Flip Up", value: "flip-up", description: "3D X rotation." },
  { label: "Blur In", value: "blur-in", description: "Blur to clear, elegant." },
  { label: "Stagger", value: "stagger", description: "Gentle group entrance." },
  { label: "Soft scale", value: "scale-soft", description: "Legacy: small zoom-in." },
  { label: "Blur reveal", value: "blur-reveal", description: "Legacy: blur entrance." },
  { label: "Stagger up", value: "stagger-up", description: "Legacy: sequential reveal." },
  { label: "Step sequence", value: "step-sequence", description: "Legacy: slow stagger." },
  { label: "Progress line", value: "progress-line", description: "Legacy: animated line." },
  { label: "Scroll progress horizontal", value: "scroll-progress-horizontal", description: "Legacy: horizontal fill." },
  { label: "Scroll progress vertical", value: "scroll-progress-vertical", description: "Legacy: vertical fill." },
];

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
  previewCategoryTree: CategoryTreeItem[];
  sectionBackgroundPresets: readonly BackgroundPreset[];
  sectionColorModeLabel: (section: BuilderSection) => string;
  sectionLabels: Record<SectionKind, string>;
  sectionSettingsOpen: boolean;
  sectionStructureOpen: boolean;
  selectedLayoutColumnKey: string | null;
  selectedLayoutBlock: BuilderLayoutBlock | null;
  selectedLayoutBlockKey: string | null;
  selectedSection: BuilderSection | undefined;
  uploadingNestedSlide: string | null;
  uploadingSlide: number | null;
  addSelectedLayoutBlockBadge: LooseHandler;
  addSelectedLayoutBlockButton: LooseHandler;
  addSelectedLayoutBlockGridItem: LooseHandler;
  addSelectedLayoutBlockSlide: LooseHandler;
  addSelectedLayoutItem: LooseHandler;
  addSelectedSlide: LooseHandler;
  copyJson: LooseHandler;
  deleteSelected: LooseHandler;
  deleteSelectedLayoutBlock: LooseHandler;
  deleteSelectedLayoutBlockButton: LooseHandler;
  deleteSelectedLayoutBlockBadge: LooseHandler;
  deleteSelectedLayoutBlockGridItem: LooseHandler;
  deleteSelectedLayoutBlockSlide: LooseHandler;
  deleteSelectedLayoutItem: LooseHandler;
  deleteSelectedSlide: LooseHandler;
  duplicateSelected: LooseHandler;
  applyLayoutPreset: (sectionId: string, presetKey: string) => void;
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
  updateSelectedLayoutBlockButton: LooseHandler;
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

function InspectorGroupSummary({
  title,
  description,
  meta,
}: {
  title: string;
  description?: string;
  meta?: string;
}) {
  return (
    <>
      <span className="builder-group-summary-copy">
        <strong>{title}</strong>
        {description ? <em>{description}</em> : null}
      </span>
      {meta ? <small>{meta}</small> : null}
    </>
  );
}

function flattenCategoryTree(
  categoryTree: CategoryTreeItem[],
  depth = 0,
): { label: string; slug: string }[] {
  return categoryTree.flatMap((category) => [
    { label: `${"— ".repeat(depth)}${category.name}`, slug: category.slug },
    ...flattenCategoryTree(category.children, depth + 1),
  ]);
}

export default function DashboardInspector(props: DashboardInspectorProps) {
  const [isLayoutPickerOpen, setLayoutPickerOpen] = useState(false);
  const [categoryHideSearch, setCategoryHideSearch] = useState("");
  const [openNestedCardId, setOpenNestedCardId] = useState<string | null>(null);
  const [activeTypographyAreaState, setActiveTypographyAreaState] = useState<{
    area: "title" | "body" | "button" | "eyebrow";
    blockKey: string | null;
  }>({
    area: "title",
    blockKey: null,
  });
  const {
    builderJson, copied, elementBackgroundPresets, getLayoutItemBlocks,
    inspectorOpen, inspectorTab, layoutBlockLabels, openLayoutItemId, openSlideId,
    addSelectedLayoutBlockButton, deleteSelectedLayoutBlockButton, updateSelectedLayoutBlockButton,
    previewCategoryTree,
    sectionBackgroundPresets, sectionColorModeLabel, sectionLabels,
    sectionSettingsOpen, sectionStructureOpen, selectedLayoutBlock,
    selectedLayoutBlockKey, selectedLayoutColumnKey, selectedSection, uploadingNestedSlide, uploadingSlide,
    addSelectedLayoutBlockBadge, addSelectedLayoutBlockGridItem,
    addSelectedLayoutBlockSlide, addSelectedLayoutItem, addSelectedSlide, copyJson,
    deleteSelected, deleteSelectedLayoutBlock, deleteSelectedLayoutBlockBadge,
    deleteSelectedLayoutBlockGridItem, deleteSelectedLayoutBlockSlide,
    deleteSelectedLayoutItem, deleteSelectedSlide, duplicateSelected, applyLayoutPreset, moveSelected,
    openWordPressMediaPicker, setInspectorOpen, setInspectorTab, setOpenSlideId,
    setSectionSettingsOpen, setSectionStructureOpen, setSelectedLayoutBlockKey,
    updateSelected, updateSelectedBadge, updateSelectedLayoutBlock,
    updateSelectedLayoutBlockBadge, updateSelectedLayoutBlockGridItem,
    updateSelectedLayoutBlockSlide, updateSelectedSlide,
    uploadSelectedLayoutBlockSlideImage, uploadSelectedSlideImage,
  } = props;
  const inspectorTabs: [InspectorTab, string][] = selectedLayoutBlock
    ? [
        ["content", "Content"],
        ["settings", "Settings"],
        ["typography", "Typography"],
        ["advanced", "Advanced"],
      ]
    : [
        ["section", "Section"],
        ["style", "Style"],
        ["advanced", "Advanced"],
      ];
  const categoryFilterOptions = flattenCategoryTree(previewCategoryTree);
  const filteredCategoryFilterOptions = categoryFilterOptions.filter(
    (category) => {
      const query = categoryHideSearch.trim().toLowerCase();
      if (!query) return true;
      return (
        category.label.toLowerCase().includes(query) ||
        category.slug.toLowerCase().includes(query)
      );
    },
  );
  const renderCategoryVisibilityControl = ({
    hiddenSlugs,
    onChange,
    description = "Hide categories only for this element.",
  }: {
    hiddenSlugs?: string[];
    onChange: (hiddenSlugs: string[]) => void;
    description?: string;
  }) => (
    <div className="builder-category-visibility-card">
      <div className="builder-category-visibility-head">
        <div>
          <strong>Category Visibility</strong>
          <span>{description}</span>
        </div>
        <small>
          {(hiddenSlugs ?? []).length > 0
            ? `${(hiddenSlugs ?? []).length} hidden`
            : "All visible"}
        </small>
      </div>
      {categoryFilterOptions.length > 0 ? (
        <>
          <input
            className="builder-category-search"
            type="search"
            value={categoryHideSearch}
            onChange={(event) => setCategoryHideSearch(event.target.value)}
            placeholder="Search categories..."
          />
          <div className="builder-category-hide-list">
            {filteredCategoryFilterOptions.map((category) => {
              const currentHiddenSlugs = hiddenSlugs ?? [];
              const isHidden = currentHiddenSlugs.includes(category.slug);

              return (
                <label
                  key={category.slug}
                  className={`builder-category-hide-option ${
                    isHidden ? "is-hidden" : ""
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isHidden}
                    onChange={(event) => {
                      const nextHidden = event.target.checked
                        ? [...currentHiddenSlugs, category.slug]
                        : currentHiddenSlugs.filter(
                            (slug) => slug !== category.slug,
                          );
                      onChange([...new Set(nextHidden)]);
                    }}
                  />
                  <span className="builder-category-hide-copy">
                    <strong>{category.label}</strong>
                    <em>{category.slug}</em>
                  </span>
                  <span className="builder-category-hide-status">
                    {isHidden ? "Hidden" : "Visible"}
                  </span>
                </label>
              );
            })}
            {filteredCategoryFilterOptions.length === 0 && (
              <div className="builder-category-hide-empty">
                No matching categories.
              </div>
            )}
          </div>
          {(hiddenSlugs ?? []).length > 0 && (
            <button
              type="button"
              className="builder-category-clear-hidden"
              onClick={() => onChange([])}
            >
              Show all categories
            </button>
          )}
        </>
      ) : (
        <small>Categories will appear here when dashboard preview data loads.</small>
      )}
    </div>
  );

  useEffect(() => {
    if (!selectedLayoutBlock) return;
    if (inspectorTab === "section" || inspectorTab === "style") {
      setInspectorTab(inspectorTab === "style" ? "settings" : "content");
    }
  }, [inspectorTab, selectedLayoutBlock, setInspectorTab]);

  useEffect(() => {
    if (selectedLayoutBlock) return;
    if (inspectorTab === "content" || inspectorTab === "settings") {
      setInspectorTab("section");
    }
  }, [inspectorTab, selectedLayoutBlock, setInspectorTab]);

  const activeTypographyArea =
    activeTypographyAreaState.blockKey === selectedLayoutBlockKey
      ? activeTypographyAreaState.area
      : "title";
  const styleTarget = selectedLayoutBlock
    ? {
        visualStyle: selectedLayoutBlock.visualStyle,
        typography: selectedLayoutBlock.typography,
      }
    : {
        visualStyle: selectedSection?.visualStyle,
        typography: selectedSection?.typography,
      };

  function updateStyleTarget(
    patch: Partial<{
      visualStyle?: BuilderVisualStyle;
      typography?: BuilderLayoutBlock["typography"];
    }>,
  ) {
    if (selectedLayoutBlock) {
      updateSelectedLayoutBlock(patch);
      return;
    }
    updateSelected(patch);
  }

  function updateAnimationTarget(
    patch: Partial<NonNullable<BuilderSection["animation"]>>,
  ) {
    const currentAnimation = selectedLayoutBlock
      ? (selectedLayoutBlock.animation ?? {})
      : (selectedSection?.animation ?? {});
    const nextAnimation = { ...currentAnimation, ...patch };

    if (nextAnimation.preset === "none") {
      nextAnimation.delayMs = undefined;
    }

    if (selectedLayoutBlock) {
      updateSelectedLayoutBlock({ animation: nextAnimation });
      return;
    }

    updateSelected({ animation: nextAnimation });
  }

  function renderAnimationControls(
    target: BuilderSection | BuilderLayoutBlock | null | undefined,
    options: { allowPause?: boolean } = {},
  ) {
    const animation = target?.animation ?? {};

    return (
      <details className="builder-collapse" open>
        <summary>
          <InspectorGroupSummary
            title="Scroll Animation"
            description="Beautiful entrance animation on scroll."
            meta={animation.preset && animation.preset !== "none" ? animation.preset.replace(/-/g, " ") : "None"}
          />
        </summary>
        <AnimationControl
          value={animation}
          onChange={(next) => {
            if (next.preset === "none") {
              next.delayMs = undefined;
              next.pauseUntilComplete = undefined;
            }
            updateAnimationTarget(next);
          }}
          allowPause={options.allowPause}
          allowScrub
        />
      </details>
    );
  }

  function pickStyleBackgroundImage() {
    const currentUrl = styleTarget.visualStyle?.background?.imageUrl;
    openWordPressMediaPicker({
      title: "Background image",
      currentUrl,
      onSelect: (media) => {
        const nextBackground = {
          ...(styleTarget.visualStyle?.background ?? {}),
          type: "image" as const,
          imageUrl: media.sourceUrl,
        };
        updateStyleTarget({
          visualStyle: {
            ...(styleTarget.visualStyle ?? {}),
            background: nextBackground,
          },
        });
      },
    });
  }
  const selectedColumnIndex =
    selectedSection?.kind === "contentLayout"
      ? (selectedSection.layoutItems ?? []).findIndex(
          (item, index) =>
            (item.id ?? `layout-item-${index}`) === selectedLayoutColumnKey,
        )
      : -1;
  const selectedColumnLabel =
    selectedColumnIndex >= 0 ? `Column ${selectedColumnIndex + 1}` : "None";
  const selectedElementLabel = selectedLayoutBlock
    ? layoutBlockLabels[selectedLayoutBlock.kind ?? "text"] ?? "Element"
    : "None";
  const activeTrailLevel = selectedLayoutBlock
    ? "element"
    : selectedColumnIndex >= 0
      ? "column"
      : "section";
  const isElementContentTab = inspectorTab === "content";
  const isElementSettingsTab = inspectorTab === "settings";
  const isElementTypographyTab = inspectorTab === "typography";
  const showLegacySectionContentControls: boolean = false;
  const currentRowLayoutPreset = getBuilderRowLayoutPreset(
    selectedSection?.kind === "contentLayout" ? selectedSection.layout : null,
  );
  const currentRowLayoutSummary = getBuilderRowLayoutSummary(
    selectedSection?.kind === "contentLayout" ? selectedSection.layout : null,
    selectedSection?.layoutColumns ?? null,
  );

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
          <div className="builder-inspector-selection-trail" aria-label="Selection trail">
            <span className={activeTrailLevel === "section" ? "is-active" : ""}>
              Section: {sectionLabels[selectedSection.kind]}
            </span>
            <i aria-hidden="true">→</i>
            <span className={activeTrailLevel === "column" ? "is-active" : ""}>
              Column: {selectedColumnLabel}
            </span>
            <i aria-hidden="true">→</i>
            <span className={activeTrailLevel === "element" ? "is-active" : ""}>
              Element: {selectedElementLabel}
            </span>
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

          {((!selectedLayoutBlock && inspectorTab === "section") ||
            (selectedLayoutBlock &&
              selectedSection.kind === "contentLayout" &&
              (isElementContentTab ||
                isElementSettingsTab ||
                isElementTypographyTab))) && (
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
                    ? isElementContentTab
                      ? "Content"
                      : isElementSettingsTab
                        ? "Settings"
                        : isElementTypographyTab
                          ? "Typography"
                          : "Element"
                    : "Section Settings"}
                </span>
                <small>
                  {selectedLayoutBlock || sectionSettingsOpen
                    ? "open"
                    : "closed"}
                </small>
              </summary>
              {inspectorTab === "section" && !selectedLayoutBlock && (
                <>
                  <details
                    className="builder-collapse"
                    open={Boolean(
                      selectedLayoutBlock &&
                        (isElementContentTab ||
                          isElementSettingsTab ||
                          isElementTypographyTab),
                    )}
                  >
                    <summary>
                      <InspectorGroupSummary
                        title="Background"
                        description="Set section background color and quick presets."
                        meta={selectedSection.backgroundMode ?? "full"}
                      />
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
                      <InspectorGroupSummary
                        title="Layout Widths"
                        description="Control section width and inner content width."
                        meta={selectedSection.contentMode ?? "boxed"}
                      />
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

                  {renderAnimationControls(selectedSection, {
                    allowPause: true,
                  })}

                  <details className="builder-collapse">
                    <summary>
                      <InspectorGroupSummary
                        title="Color & Spacing"
                        description="Manage readable text mode, padding, and margins."
                        meta={sectionColorModeLabel(selectedSection)}
                      />
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
                (selectedSection.kind === "contentLayout" ||
                  showLegacySectionContentControls)) ||
                ((isElementContentTab ||
                  isElementSettingsTab ||
                  isElementTypographyTab) &&
                  selectedSection.kind === "contentLayout" &&
                  selectedLayoutBlock)) && (
                  <details
                    className={`builder-collapse ${
                      selectedLayoutBlock
                        ? "builder-element-direct-collapse"
                        : ""
                    }`}
                    open={Boolean(selectedLayoutBlock)}
                  >
                    <summary>
                      <InspectorGroupSummary
                        title={
                          selectedLayoutBlock
                            ? isElementContentTab
                              ? "Element Content"
                              : isElementSettingsTab
                                ? "Element Settings"
                                : "Element Typography"
                            : "Section Type Options"
                        }
                        description={
                          selectedLayoutBlock
                            ? isElementContentTab
                              ? "Edit the selected element without leaving this section."
                              : isElementSettingsTab
                                ? "Tune appearance, spacing, and background for this element."
                                : "Tune title, body, and button typography for this element."
                            : "Controls specific to the selected section type."
                        }
                        meta={sectionLabels[selectedSection.kind]}
                      />
                    </summary>





                    {inspectorTab === "section" &&
                      !selectedLayoutBlock &&
                      selectedSection.kind === "contentLayout" && (
                        <>
                          <label className="builder-field">
                            <span>Current Row Layout</span>
                            <input
                              value={currentRowLayoutSummary}
                              readOnly
                            />
                            <small>
                              {currentRowLayoutPreset
                                ? "Chosen preset"
                                : "Custom or manual column count"}
                            </small>
                          </label>

                          <label className="builder-field">
                            <span>Layout Columns</span>
                            <select
                              value={selectedSection.layoutColumns ?? 2}
                              onChange={(event) =>
                                updateSelected({
                                  layoutColumns: Number(event.target.value),
                                  layout: undefined,
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

                          <button
                            type="button"
                            className="builder-inline-add"
                            onClick={() => setLayoutPickerOpen(true)}
                          >
                            <Layers3 size={15} />
                            Choose row layout
                          </button>

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
                                      className={`builder-compact-column-row ${
                                        selectedLayoutColumnKey === itemKey
                                          ? "is-selected"
                                          : ""
                                      }`}
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

                    {(isElementContentTab ||
                      isElementSettingsTab ||
                      isElementTypographyTab) &&
                      selectedLayoutBlock &&
                      selectedSection.kind === "contentLayout" && (
                      <>
                        {isElementSettingsTab ? (
                          <>
                            <div className="builder-element-inspector-note">
                              <strong>Element settings</strong>
                              <span>
                                Card style, spacing, colors, and appearance for{" "}
                                {layoutBlockLabels[selectedLayoutBlock.kind ?? "text"]}.
                              </span>
                            </div>
                            <StyleTabPanel
                              target={styleTarget}
                              showTypography={false}
                              onChange={updateStyleTarget}
                              onPickBackgroundImage={pickStyleBackgroundImage}
                            />
                          </>
                        ) : isElementTypographyTab ? (
                          <div className="builder-element-inspector-note">
                            <strong>Typography</strong>
                            <span>
                              Edit title, body, and button typography for{" "}
                              {layoutBlockLabels[selectedLayoutBlock.kind ?? "text"]}.
                            </span>
                          </div>
                        ) : null}

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
                                  selectedLayoutColumnKey === itemKey
                                    ? "is-selected-column-card"
                                    : ""
                                } ${
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

                                          {isSelectedBlock &&
                                            isElementTypographyTab && (
                                            <div className="builder-element-typography-panel">
                                              <div className="builder-style-preset-row builder-typography-area-tabs">
                                                {(
                                                  [
                                                    ["title", "Title"],
                                                    ["body", "Body"],
                                                    ["button", "Button"],
                                                    ["eyebrow", "Eyebrow"],
                                                  ] as const
                                                ).map(([area, label]) => (
                                                  <button
                                                    key={area}
                                                    type="button"
                                                    className={
                                                      activeTypographyArea === area
                                                        ? "is-active"
                                                        : ""
                                                    }
                                                    onClick={() =>
                                                      setActiveTypographyAreaState({
                                                        area,
                                                        blockKey:
                                                          selectedLayoutBlockKey,
                                                      })
                                                    }
                                                  >
                                                    {label}
                                                  </button>
                                                ))}
                                              </div>
                                              <div className="builder-typography-area-panel">
                                                <span className="builder-typography-area-label">
                                                  {activeTypographyArea === "title"
                                                    ? "Title typography"
                                                    : activeTypographyArea === "body"
                                                      ? "Body typography"
                                                      : activeTypographyArea ===
                                                          "button"
                                                        ? "Button typography"
                                                        : "Eyebrow typography"}
                                                </span>
                                                <TypographyPanel
                                                  value={
                                                    activeTypographyArea === "title"
                                                      ? (block.typography as any)
                                                          ?.title ??
                                                        (typeof block.typography ===
                                                          "object" &&
                                                        !(block.typography as any)
                                                          .title
                                                          ? (block.typography as any)
                                                          : undefined)
                                                      : activeTypographyArea ===
                                                          "body"
                                                        ? (block.typography as any)
                                                            ?.body
                                                        : activeTypographyArea ===
                                                            "button"
                                                          ? (block.typography as any)
                                                              ?.button
                                                          : (block.typography as any)
                                                              ?.eyebrow
                                                  }
                                                  onChange={(t) =>
                                                    updateSelectedLayoutBlock(
                                                      index,
                                                      blockIndex,
                                                      {
                                                        typography: {
                                                          ...((block.typography as any) ??
                                                            {}),
                                                          [activeTypographyArea]:
                                                            t,
                                                        },
                                                      },
                                                    )
                                                  }
                                                />
                                              </div>
                                            </div>
                                          )}

                                          {isSelectedBlock &&
                                            isElementSettingsTab && (
                                          <details className="builder-collapse">
                                            <summary>
                                              <span>Element appearance</span>
                                              <small>
                                                {block.panelStyle ??
                                                  "default"}
                                              </small>
                                            </summary>
                                            <label className="builder-field">
                                              <span>Card Style</span>
                                              <select
                                                value={
                                                  block.panelStyle ?? "default"
                                                }
                                                onChange={(event) =>
                                                  updateSelectedLayoutBlock(
                                                    index,
                                                    blockIndex,
                                                    {
                                                      panelStyle: event.target
                                                        .value as BuilderPanelStyle,
                                                    },
                                                  )
                                                }
                                              >
                                                {panelStyleOptions.map(
                                                  (option) => (
                                                    <option
                                                      key={option.value}
                                                      value={option.value}
                                                    >
                                                      {option.label}
                                                    </option>
                                                  ),
                                                )}
                                              </select>
                                            </label>
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
                                          )}

                                          {isSelectedBlock &&
                                            isElementContentTab && (
                                            <>
                                          {block.kind === "button" ? (
                                            <>
                                              <div className="builder-section-heading">
                                                <span>Layout</span>
                                              </div>
                                              <label className="builder-field">
                                                <span>Buttons orientation</span>
                                                <select
                                                  value={block.buttonsLayout ?? "inline"}
                                                  onChange={(e) => updateSelectedLayoutBlock(index, blockIndex, { buttonsLayout: e.target.value as any })}
                                                >
                                                  <option value="inline">Inline (Side by side)</option>
                                                  <option value="stacked">Stacked (Vertical)</option>
                                                </select>
                                              </label>

                                              <div className="builder-section-heading">
                                                <span>Buttons</span>
                                                <span>{block.buttons?.length ?? 0}</span>
                                              </div>
                                              <button
                                                type="button"
                                                className="builder-inline-add"
                                                onClick={() => addSelectedLayoutBlockButton(index, blockIndex)}
                                              >
                                                <Plus size={15} />
                                                Add button
                                              </button>
                                              <div className="builder-repeatable-tabs">
                                              {(block.buttons ?? []).map((btn, btnIndex) => {
                                                const btnKey = btn.id ?? `${blockKey}-button-${btnIndex}`;
                                                const isButtonOpen = openNestedCardId === btnKey || (!openNestedCardId && btnIndex === 0);
                                                return (
                                                <div key={btnKey} className={`builder-nested-card${isButtonOpen ? " is-open" : ""}`}>
                                                  <div className="builder-nested-card-header">
                                                    <button
                                                      type="button"
                                                      className="builder-slide-toggle"
                                                      onClick={() => setOpenNestedCardId(isButtonOpen ? null : btnKey)}
                                                    >
                                                      <span>Button {btnIndex + 1}</span>
                                                      <small>{btn.label || "Untitled button"}</small>
                                                    </button>
                                                    <button
                                                      type="button"
                                                      onClick={() => deleteSelectedLayoutBlockButton(index, blockIndex, btnIndex)}
                                                      title="Delete button"
                                                    >
                                                      <Trash2 size={14} />
                                                    </button>
                                                  </div>
                                                  {isButtonOpen && (
                                                  <div className="builder-nested-card-body">
                                                    <label className="builder-field">
                                                      <span>Label</span>
                                                      <input
                                                        value={btn.label ?? ""}
                                                        onChange={(e) => updateSelectedLayoutBlockButton(index, blockIndex, btnIndex, { label: e.target.value })}
                                                      />
                                                    </label>
                                                    <label className="builder-field">
                                                      <span>URL</span>
                                                      <input
                                                        value={btn.url ?? ""}
                                                        onChange={(e) => updateSelectedLayoutBlockButton(index, blockIndex, btnIndex, { url: e.target.value })}
                                                      />
                                                    </label>
                                                    <label className="builder-field">
                                                      <span>Target</span>
                                                      <select
                                                        value={btn.target ?? "_self"}
                                                        onChange={(e) => updateSelectedLayoutBlockButton(index, blockIndex, btnIndex, { target: e.target.value as any })}
                                                      >
                                                        <option value="_self">Same tab</option>
                                                        <option value="_blank">New tab</option>
                                                      </select>
                                                    </label>
                                                    <label className="builder-field">
                                                      <span>Style</span>
                                                      <select
                                                        value={btn.style ?? "primary"}
                                                        onChange={(e) => updateSelectedLayoutBlockButton(index, blockIndex, btnIndex, { style: e.target.value as any })}
                                                      >
                                                        <option value="primary">Solid Primary</option>
                                                        <option value="secondary">Secondary</option>
                                                        <option value="outline">Outline</option>
                                                        <option value="ghost">Ghost</option>
                                                        <option value="light">Light</option>
                                                      </select>
                                                    </label>
                                                  </div>
                                                  )}
                                                </div>
                                                );
                                              })}
                                              </div>
                                            </>
                                          ) : block.kind === "embed" ? (
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
                                                  <div className="builder-repeatable-tabs">
                                                  {(
                                                    block.gridItems ?? []
                                                  ).map(
                                                    (
                                                      gridItem,
                                                      gridItemIndex,
                                                    ) => {
                                                      const gridCardKey = `grid-${index}-${blockIndex}-${gridItemIndex}`;
                                                      const isGridCardOpen = openNestedCardId === gridCardKey || (!openNestedCardId && gridItemIndex === 0);
                                                      return (
                                                      <div
                                                        key={
                                                          gridItem.id ??
                                                          `${blockKey}-grid-${gridItemIndex}`
                                                        }
                                                        className={`builder-nested-card${isGridCardOpen ? " is-open" : ""}`}
                                                      >
                                                        <div className="builder-nested-card-header">
                                                          <button
                                                            type="button"
                                                            className="builder-slide-toggle"
                                                            onClick={() => setOpenNestedCardId(isGridCardOpen ? null : gridCardKey)}
                                                          >
                                                            <span>
                                                              Item{" "}
                                                              {gridItemIndex + 1}
                                                            </span>
                                                            <small>{gridItem.title || "Untitled item"}</small>
                                                          </button>
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
                                                        {isGridCardOpen && (
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
                                                            <RichTextEditor
                                                              value={gridItem.text ?? ""}
                                                              onChange={(value) =>
                                                                updateSelectedLayoutBlockGridItem(
                                                                  index,
                                                                  blockIndex,
                                                                  gridItemIndex,
                                                                  { text: value },
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
                                                        )}
                                                      </div>
                                                      );
                                                    },
                                                  )}
                                                  </div>
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
                                              {renderCategoryVisibilityControl({
                                                hiddenSlugs:
                                                  block.hiddenCategorySlugs,
                                                description:
                                                  "Hide categories from this product archive filter UI.",
                                                onChange: (hiddenSlugs) =>
                                                  updateSelectedLayoutBlock(
                                                    index,
                                                    blockIndex,
                                                    {
                                                      hiddenCategorySlugs:
                                                        hiddenSlugs,
                                                    },
                                                  ),
                                              })}
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
                                                  <option value="princity">
                                                    Princity
                                                  </option>
                                                  <option value="princity-flat">
                                                    Princity Flat
                                                  </option>
                                                  <option value="princity-line">
                                                    Princity Line
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
                                              {block.kind ===
                                                "categoryFilters" &&
                                                renderCategoryVisibilityControl({
                                                  hiddenSlugs:
                                                    block.hiddenCategorySlugs,
                                                  onChange: (hiddenSlugs) =>
                                                    updateSelectedLayoutBlock(
                                                      index,
                                                      blockIndex,
                                                      {
                                                        hiddenCategorySlugs:
                                                          hiddenSlugs,
                                                      },
                                                    ),
                                                })}
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
                                                <RichTextEditor
                                                  value={block.body ?? ""}
                                                  onChange={(value) =>
                                                    updateSelectedLayoutBlock(
                                                      index,
                                                      blockIndex,
                                                      { body: value },
                                                    )
                                                  }
                                                />
                                              </label>
                                              <label className="builder-field">
                                                <span>Swiper Variant</span>
                                                <select
                                                  value={
                                                    block.carouselSettings
                                                      ?.variant ===
                                                    "swiper-showcase"
                                                      ? "showcase"
                                                      : block.carouselSettings
                                                          ?.variant ??
                                                        "showcase"
                                                  }
                                                  onChange={(event) =>
                                                    updateSelectedLayoutBlock(
                                                      index,
                                                      blockIndex,
                                                      {
                                                        carouselSettings: {
                                                          ...(block.carouselSettings ??
                                                            {}),
                                                          variant:
                                                            event.target.value,
                                                        },
                                                      },
                                                    )
                                                  }
                                                >
                                                  <option value="basic">
                                                    Basic
                                                  </option>
                                                  <option value="hero">
                                                    Hero
                                                  </option>
                                                  <option value="showcase">
                                                    Showcase
                                                  </option>
                                                  <option value="coverflow">
                                                    Coverflow
                                                  </option>
                                                  <option value="cards">
                                                    Cards
                                                  </option>
                                                  <option value="creative">
                                                    Creative
                                                  </option>
                                                  <option value="fade">
                                                    Fade
                                                  </option>
                                                  <option value="free-mode">
                                                    Free mode
                                                  </option>
                                                </select>
                                              </label>
                                              <div className="builder-two-column">
                                                <label className="builder-field">
                                                  <span>Cards Per View</span>
                                                  <input
                                                    type="number"
                                                    min={1}
                                                    max={4}
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
                                                  <span>Spacing</span>
                                                  <input
                                                    type="number"
                                                    min={0}
                                                    max={80}
                                                    step={2}
                                                    value={
                                                      block.carouselSettings
                                                        ?.spaceBetween ?? 24
                                                    }
                                                    onChange={(event) =>
                                                      updateSelectedLayoutBlock(
                                                        index,
                                                        blockIndex,
                                                        {
                                                          carouselSettings: {
                                                            ...(block.carouselSettings ??
                                                              {}),
                                                            spaceBetween:
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
                                              <div className="builder-two-column">
                                                <label className="builder-field">
                                                  <span>Effect</span>
                                                  <select
                                                    value={
                                                      block.carouselSettings
                                                        ?.effect ?? "slide"
                                                    }
                                                    onChange={(event) =>
                                                      updateSelectedLayoutBlock(
                                                        index,
                                                        blockIndex,
                                                        {
                                                          carouselSettings: {
                                                            ...(block.carouselSettings ??
                                                              {}),
                                                            effect:
                                                              event.target
                                                                .value as NonNullable<
                                                                BuilderLayoutBlock["carouselSettings"]
                                                              >["effect"],
                                                          },
                                                        },
                                                      )
                                                    }
                                                  >
                                                    <option value="slide">
                                                      Slide
                                                    </option>
                                                    <option value="fade">
                                                      Fade
                                                    </option>
                                                  </select>
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
                                                  ["loop", "Loop"],
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
                                              {((block.carouselSettings
                                                ?.variant ===
                                              "swiper-showcase"
                                                ? "showcase"
                                                : block.carouselSettings
                                                    ?.variant) ===
                                                "coverflow" && (
                                                <div className="builder-two-column">
                                                  <label className="builder-field">
                                                    <span>Coverflow Rotate</span>
                                                    <input
                                                      type="number"
                                                      min={-90}
                                                      max={90}
                                                      value={
                                                        block.carouselSettings
                                                          ?.coverflowRotate ??
                                                        34
                                                      }
                                                      onChange={(event) =>
                                                        updateSelectedLayoutBlock(
                                                          index,
                                                          blockIndex,
                                                          {
                                                            carouselSettings: {
                                                              ...(block.carouselSettings ??
                                                                {}),
                                                              coverflowRotate:
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
                                                    <span>Coverflow Depth</span>
                                                    <input
                                                      type="number"
                                                      min={0}
                                                      max={500}
                                                      step={10}
                                                      value={
                                                        block.carouselSettings
                                                          ?.coverflowDepth ??
                                                        140
                                                      }
                                                      onChange={(event) =>
                                                        updateSelectedLayoutBlock(
                                                          index,
                                                          blockIndex,
                                                          {
                                                            carouselSettings: {
                                                              ...(block.carouselSettings ??
                                                                {}),
                                                              coverflowDepth:
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
                                                    <span>Coverflow Stretch</span>
                                                    <input
                                                      type="number"
                                                      min={-120}
                                                      max={120}
                                                      step={5}
                                                      value={
                                                        block.carouselSettings
                                                          ?.coverflowStretch ??
                                                        0
                                                      }
                                                      onChange={(event) =>
                                                        updateSelectedLayoutBlock(
                                                          index,
                                                          blockIndex,
                                                          {
                                                            carouselSettings: {
                                                              ...(block.carouselSettings ??
                                                                {}),
                                                              coverflowStretch:
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
                                              ))}
                                              {(block.carouselSettings
                                                ?.variant === "cards" && (
                                                <div className="builder-slider-options">
                                                  {[
                                                    ["cardsRotate", "Rotate"],
                                                    [
                                                      "cardsShadows",
                                                      "Shadows",
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
                                                          ] ?? true,
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
                                                                    event
                                                                      .target
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
                                              ))}
                                              {block.carouselSettings
                                                ?.variant === "creative" && (
                                                <label className="builder-field">
                                                  <span>Creative Preset</span>
                                                  <select
                                                    value={
                                                      block.carouselSettings
                                                        ?.creativePreset ??
                                                      "soft-stack"
                                                    }
                                                    onChange={(event) =>
                                                      updateSelectedLayoutBlock(
                                                        index,
                                                        blockIndex,
                                                        {
                                                          carouselSettings: {
                                                            ...(block.carouselSettings ??
                                                              {}),
                                                            creativePreset:
                                                              event.target
                                                                .value as NonNullable<
                                                                BuilderLayoutBlock["carouselSettings"]
                                                              >["creativePreset"],
                                                          },
                                                        },
                                                      )
                                                    }
                                                  >
                                                    <option value="soft-stack">
                                                      Soft stack
                                                    </option>
                                                    <option value="deep">
                                                      Deep perspective
                                                    </option>
                                                    <option value="scale">
                                                      Scale
                                                    </option>
                                                  </select>
                                                </label>
                                              )}
                                              {block.carouselSettings
                                                ?.variant === "fade" && (
                                                <label className="builder-check">
                                                  <input
                                                    type="checkbox"
                                                    checked={
                                                      block.carouselSettings
                                                        ?.fadeCrossFade ?? true
                                                    }
                                                    onChange={(event) =>
                                                      updateSelectedLayoutBlock(
                                                        index,
                                                        blockIndex,
                                                        {
                                                          carouselSettings: {
                                                            ...(block.carouselSettings ??
                                                              {}),
                                                            fadeCrossFade:
                                                              event.target
                                                                .checked,
                                                          },
                                                        },
                                                      )
                                                    }
                                                  />
                                                  <span>Crossfade</span>
                                                </label>
                                              )}
                                              {block.carouselSettings
                                                ?.variant ===
                                                "free-mode" && (
                                                <label className="builder-check">
                                                  <input
                                                    type="checkbox"
                                                    checked={
                                                      block.carouselSettings
                                                        ?.freeModeMomentum ??
                                                      true
                                                    }
                                                    onChange={(event) =>
                                                      updateSelectedLayoutBlock(
                                                        index,
                                                        blockIndex,
                                                        {
                                                          carouselSettings: {
                                                            ...(block.carouselSettings ??
                                                              {}),
                                                            freeModeMomentum:
                                                              event.target
                                                                .checked,
                                                          },
                                                        },
                                                      )
                                                    }
                                                  />
                                                  <span>Momentum scroll</span>
                                                </label>
                                              )}
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
                                              <div className="builder-repeatable-tabs">
                                              {(block.slides ?? []).map(
                                                (slide, slideIndex) => {
                                                  const slideKey =
                                                    slide.id ??
                                                    `${blockKey}-nested-slide-${slideIndex}`;
                                                  const isSlideOpen =
                                                    openSlideId === slideKey ||
                                                    (!openSlideId &&
                                                      slideIndex === 0);

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
                                                            <RichTextEditor
                                                              value={slide.text ?? ""}
                                                              onChange={(value) =>
                                                                updateSelectedLayoutBlockSlide(
                                                                  index,
                                                                  blockIndex,
                                                                  slideIndex,
                                                                  { text: value },
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
                                              </div>
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
                                                <RichTextEditor
                                                  value={block.body ?? ""}
                                                  onChange={(value) =>
                                                    updateSelectedLayoutBlock(
                                                      index,
                                                      blockIndex,
                                                      { body: value },
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
                                                <span>Icon type</span>
                                                <select
                                                  value={block.listIcon ?? "check"}
                                                  onChange={(event) =>
                                                    updateSelectedLayoutBlock(
                                                      index,
                                                      blockIndex,
                                                      { listIcon: event.target.value as any },
                                                    )
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
                                              <div className="builder-section-heading">
                                                <span>List Items ({block.items?.length ?? 0})</span>
                                              </div>
                                              {(block.items ?? []).map((item, itemIdx) => (
                                                <label key={itemIdx} className="builder-field">
                                                  <span>Item {itemIdx + 1}</span>
                                                  <div style={{ display: "flex", gap: 4 }}>
                                                    <input
                                                      value={item}
                                                      onChange={(event) => {
                                                        const items = [...(block.items ?? [])];
                                                        items[itemIdx] = event.target.value;
                                                        updateSelectedLayoutBlock(index, blockIndex, { items });
                                                      }}
                                                    />
                                                    <button
                                                      type="button"
                                                      className="builder-inline-delete"
                                                      onClick={() => {
                                                        const items = (block.items ?? []).filter((_, i) => i !== itemIdx);
                                                        updateSelectedLayoutBlock(index, blockIndex, { items });
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
                                                  const items = [...(block.items ?? []), `Item ${(block.items ?? []).length + 1}`];
                                                  updateSelectedLayoutBlock(index, blockIndex, { items });
                                                }}
                                              >
                                                <Plus size={15} /> Add item
                                              </button>
                                              </>
                                            ) : block.kind === "heading" ? (
                                              <>
                                                <label className="builder-field">
                                                  <span>Heading Text</span>
                                                  <input
                                                    value={block.headingText ?? ""}
                                                    onChange={(event) =>
                                                      updateSelectedLayoutBlock(
                                                        index,
                                                        blockIndex,
                                                        { headingText: event.target.value },
                                                      )
                                                    }
                                                  />
                                                </label>
                                                <label className="builder-field">
                                                  <span>Level</span>
                                                  <select
                                                    value={block.headingLevel ?? "h2"}
                                                    onChange={(event) =>
                                                      updateSelectedLayoutBlock(
                                                        index,
                                                        blockIndex,
                                                        { headingLevel: event.target.value as "h1" | "h2" | "h3" | "h4" | "h5" | "h6" },
                                                      )
                                                    }
                                                  >
                                                    <option value="h1">H1</option>
                                                    <option value="h2">H2</option>
                                                    <option value="h3">H3</option>
                                                    <option value="h4">H4</option>
                                                    <option value="h5">H5</option>
                                                    <option value="h6">H6</option>
                                                  </select>
                                                </label>
                                                <label className="builder-field">
                                                  <span>Alignment</span>
                                                  <select
                                                    value={block.headingAlign ?? "left"}
                                                    onChange={(event) =>
                                                      updateSelectedLayoutBlock(
                                                        index,
                                                        blockIndex,
                                                        { headingAlign: event.target.value as "left" | "center" | "right" },
                                                      )
                                                    }
                                                  >
                                                    <option value="left">Left</option>
                                                    <option value="center">Center</option>
                                                    <option value="right">Right</option>
                                                  </select>
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
                                                <RichTextEditor
                                                  value={block.body ?? ""}
                                                  onChange={(value) =>
                                                    updateSelectedLayoutBlock(
                                                      index,
                                                      blockIndex,
                                                      { body: value },
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
                                              <div className="builder-repeatable-tabs">
                                              {(block.badges ?? []).map(
                                                (badge, badgeIndex) => {
                                                  const badgeKey =
                                                    badge.id ??
                                                    `${blockKey}-badge-${badgeIndex}`;
                                                  const isBadgeOpen =
                                                    openNestedCardId === badgeKey ||
                                                    (!openNestedCardId &&
                                                      badgeIndex === 0);
                                                  return (
                                                  <div
                                                    key={badgeKey}
                                                    className={`builder-nested-card${isBadgeOpen ? " is-open" : ""}`}
                                                  >
                                                    <div className="builder-nested-card-header">
                                                      <button
                                                        type="button"
                                                        className="builder-slide-toggle"
                                                        onClick={() =>
                                                          setOpenNestedCardId(
                                                            isBadgeOpen
                                                              ? null
                                                              : badgeKey,
                                                          )
                                                        }
                                                      >
                                                        <span>
                                                          Badge {badgeIndex + 1}
                                                        </span>
                                                        <small>
                                                          {badge.title ||
                                                            badge.label ||
                                                            "Untitled badge"}
                                                        </small>
                                                      </button>
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
                                                    {isBadgeOpen && (
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
                                                        <RichTextEditor
                                                          value={badge.body ?? ""}
                                                          onChange={(value) =>
                                                            updateSelectedLayoutBlockBadge(
                                                              index,
                                                              blockIndex,
                                                              badgeIndex,
                                                              { body: value },
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
                                              </div>
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
                                                <RichTextEditor
                                                  value={block.body ?? ""}
                                                  onChange={(value) =>
                                                    updateSelectedLayoutBlock(
                                                      index,
                                                      blockIndex,
                                                      { body: value },
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
                                              <label className="builder-field">
                                                <span>Alignment</span>
                                                <select
                                                  value={block.imageAlignment ?? "center"}
                                                  onChange={(event) =>
                                                    updateSelectedLayoutBlock(
                                                      index,
                                                      blockIndex,
                                                      { imageAlignment: event.target.value as "left" | "center" | "right" },
                                                    )
                                                  }
                                                >
                                                  <option value="left">Left</option>
                                                  <option value="center">Center</option>
                                                  <option value="right">Right</option>
                                                </select>
                                              </label>
                                              <label className="builder-field">
                                                <span>Max Width (px)</span>
                                                <input
                                                  type="number"
                                                  min={100}
                                                  max={2000}
                                                  value={block.imageMaxWidth ?? 1200}
                                                  onChange={(event) =>
                                                    updateSelectedLayoutBlock(
                                                      index,
                                                      blockIndex,
                                                      { imageMaxWidth: Number(event.target.value) || undefined },
                                                    )
                                                  }
                                                />
                                              </label>
                                              <label className="builder-field">
                                                <span>Border Radius (px)</span>
                                                <input
                                                  type="number"
                                                  min={0}
                                                  max={100}
                                                  value={block.imageBorderRadius ?? 0}
                                                  onChange={(event) =>
                                                    updateSelectedLayoutBlock(
                                                      index,
                                                      blockIndex,
                                                      { imageBorderRadius: Number(event.target.value) || undefined },
                                                    )
                                                  }
                                                />
                                              </label>
                                              <label className="builder-field">
                                                <span>Caption</span>
                                                <input
                                                  value={block.imageCaption ?? ""}
                                                  onChange={(event) =>
                                                    updateSelectedLayoutBlock(
                                                      index,
                                                      blockIndex,
                                                      { imageCaption: event.target.value },
                                                    )
                                                  }
                                                />
                                              </label>
                                            </>
                                          ) : block.kind === "table" ? (
                                            <>
                                              <div className="builder-section-heading">
                                                <span>Layout</span>
                                              </div>
                                              <label className="builder-field">
                                                <span>Table style</span>
                                                <select
                                                  value={block.tableStyle ?? "striped"}
                                                  onChange={(event) =>
                                                    updateSelectedLayoutBlock(
                                                      index,
                                                      blockIndex,
                                                      { tableStyle: event.target.value as "striped" | "bordered" | "plain" },
                                                    )
                                                  }
                                                >
                                                  <option value="striped">Striped rows</option>
                                                  <option value="bordered">Bordered</option>
                                                  <option value="plain">Plain</option>
                                                </select>
                                              </label>
                                              <div style={{ display: "flex", gap: 8 }}>
                                                <label className="builder-field" style={{ flex: 1 }}>
                                                  <span>Columns</span>
                                                  <input
                                                    type="number"
                                                    min={1}
                                                    max={10}
                                                    value={(block.tableHeadings ?? []).length || 1}
                                                    onChange={(event) => {
                                                      const newCount = Math.max(1, Number(event.target.value) || 1);
                                                      const headings = [...(block.tableHeadings ?? [])];
                                                      const rows = (block.tableRows ?? []).map((r) => [...r]);
                                                      while (headings.length < newCount) headings.push(`Column ${headings.length + 1}`);
                                                      while (headings.length > newCount) headings.pop();
                                                      for (let r = 0; r < rows.length; r++) {
                                                        while (rows[r].length < newCount) rows[r].push(`Cell ${String.fromCharCode(65 + rows[r].length)}`);
                                                        while (rows[r].length > newCount) rows[r].pop();
                                                      }
                                                      updateSelectedLayoutBlock(index, blockIndex, { tableHeadings: headings, tableRows: rows });
                                                    }}
                                                  />
                                                </label>
                                                <label className="builder-field" style={{ flex: 1 }}>
                                                  <span>Rows</span>
                                                  <input
                                                    type="number"
                                                    min={0}
                                                    max={20}
                                                    value={block.tableRows?.length ?? 0}
                                                    onChange={(event) => {
                                                      const newCount = Math.max(0, Number(event.target.value) || 0);
                                                      const colCount = (block.tableHeadings ?? []).length || 3;
                                                      const rows = (block.tableRows ?? []).map((r) => [...r]);
                                                      while (rows.length < newCount) rows.push(Array.from({ length: colCount }, (_, i) => `Cell ${String.fromCharCode(65 + i)}`));
                                                      while (rows.length > newCount) rows.pop();
                                                      updateSelectedLayoutBlock(index, blockIndex, { tableRows: rows });
                                                    }}
                                                  />
                                                </label>
                                              </div>
                                              {(block.tableHeadings ?? []).length > 0 && (
                                                <>
                                                  <div className="builder-section-heading">
                                                    <span>Headings</span>
                                                  </div>
                                                  {(block.tableHeadings ?? []).map((heading, hIdx) => (
                                                    <label key={hIdx} className="builder-field">
                                                      <span>Col {hIdx + 1}</span>
                                                      <input
                                                        value={heading}
                                                        onChange={(event) => {
                                                          const headings = [...(block.tableHeadings ?? [])];
                                                          headings[hIdx] = event.target.value;
                                                          updateSelectedLayoutBlock(index, blockIndex, { tableHeadings: headings });
                                                        }}
                                                      />
                                                    </label>
                                                  ))}
                                                </>
                                              )}
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
                                                <RichTextEditor
                                                  value={block.body ?? ""}
                                                  onChange={(value) =>
                                                    updateSelectedLayoutBlock(
                                                      index,
                                                      blockIndex,
                                                      { body: value },
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

                                              <div className="builder-section-heading">Buttons Layout</div>
                                              <label className="builder-field">
                                                <span>Buttons orientation</span>
                                                <select
                                                  value={block.buttonsLayout ?? "inline"}
                                                  onChange={(e) => updateSelectedLayoutBlock(index, blockIndex, { buttonsLayout: e.target.value as any })}
                                                >
                                                  <option value="inline">Inline (Side by side)</option>
                                                  <option value="stacked">Stacked (Vertical)</option>
                                                </select>
                                              </label>
                                              <div className="builder-section-heading">Buttons</div>
                                              <button
                                                type="button"
                                                className="builder-inline-add"
                                                onClick={() => addSelectedLayoutBlockButton(index, blockIndex)}
                                              >
                                                <Plus size={15} />
                                                Add button
                                              </button>
                                              <div className="builder-repeatable-tabs">
                                              {(block.buttons ?? []).map((btn, btnIndex) => {
                                                const btnKey = btn.id ?? `${blockKey}-button-${btnIndex}`;
                                                const isButtonOpen = openNestedCardId === btnKey || (!openNestedCardId && btnIndex === 0);
                                                return (
                                                <div key={btnKey} className={`builder-nested-card${isButtonOpen ? " is-open" : ""}`}>
                                                  <div className="builder-nested-card-header">
                                                    <button
                                                      type="button"
                                                      className="builder-slide-toggle"
                                                      onClick={() => setOpenNestedCardId(isButtonOpen ? null : btnKey)}
                                                    >
                                                      <span>Button {btnIndex + 1}</span>
                                                      <small>{btn.label || "Untitled button"}</small>
                                                    </button>
                                                    <button
                                                      type="button"
                                                      onClick={() => deleteSelectedLayoutBlockButton(index, blockIndex, btnIndex)}
                                                      title="Delete button"
                                                    >
                                                      <Trash2 size={14} />
                                                    </button>
                                                  </div>
                                                  {isButtonOpen && (
                                                  <div className="builder-nested-card-body">
                                                    <label className="builder-field">
                                                      <span>Label</span>
                                                      <input
                                                        value={btn.label ?? ""}
                                                        onChange={(e) => updateSelectedLayoutBlockButton(index, blockIndex, btnIndex, { label: e.target.value })}
                                                      />
                                                    </label>
                                                    <label className="builder-field">
                                                      <span>URL</span>
                                                      <input
                                                        value={btn.url ?? ""}
                                                        onChange={(e) => updateSelectedLayoutBlockButton(index, blockIndex, btnIndex, { url: e.target.value })}
                                                      />
                                                    </label>
                                                  </div>
                                                  )}
                                                </div>
                                                );
                                              })}
                                              </div>
                                            </>
                                          )}
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




                    {showLegacySectionContentControls &&
                      !selectedLayoutBlock &&
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

                          {renderCategoryVisibilityControl({
                            hiddenSlugs: selectedSection.hiddenCategorySlugs,
                            description:
                              "Hide categories from this product archive filter UI.",
                            onChange: (hiddenSlugs) =>
                              updateSelected({
                                hiddenCategorySlugs: hiddenSlugs,
                              }),
                          })}

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
                              <option value="princity">Princity</option>
                              <option value="princity-flat">Princity Flat</option>
                              <option value="princity-line">Princity Line</option>
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

                    {showLegacySectionContentControls &&
                      selectedSection.kind === "badgeGrid" && (
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

                        <div className="builder-repeatable-tabs">
                        {(selectedSection.badges ?? []).map(
                          (badge, index) => {
                            const badgeKey = badge.id ?? `section-badge-${index}`;
                            const isBadgeOpen =
                              openNestedCardId === badgeKey ||
                              (!openNestedCardId && index === 0);
                            return (
                            <div
                              key={badgeKey}
                              className={`builder-nested-card${isBadgeOpen ? " is-open" : ""}`}
                            >
                              <div className="builder-nested-card-header">
                                <button
                                  type="button"
                                  className="builder-slide-toggle"
                                  onClick={() =>
                                    setOpenNestedCardId(
                                      isBadgeOpen ? null : badgeKey,
                                    )
                                  }
                                >
                                  <span>Badge {index + 1}</span>
                                  <small>
                                    {badge.title ||
                                      badge.label ||
                                      "Untitled badge"}
                                  </small>
                                </button>
                              </div>
                              {isBadgeOpen && (
                              <div className="builder-nested-card-body">
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
                                <RichTextEditor
                                  value={badge.body ?? ""}
                                  onChange={(value) =>
                                    updateSelectedBadge(index, {
                                      body: value,
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
                        </div>
                      </>
                    )}

                    {showLegacySectionContentControls &&
                      selectedSection.kind === "embed" && (
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

                    {showLegacySectionContentControls &&
                      selectedSection.kind === "slider" && (
                      <>
                        <details className="builder-collapse" open>
                          <summary>
                            <InspectorGroupSummary
                              title="Slider Heading"
                              description="Optional title and description shown above the carousel."
                              meta={
                                selectedSection.title?.trim() ||
                                selectedSection.body?.trim()
                                  ? "visible"
                                  : "hidden"
                              }
                            />
                          </summary>

                          <label className="builder-field">
                            <span>Title</span>
                            <input
                              value={selectedSection.title ?? ""}
                              placeholder="Leave blank to hide"
                              onChange={(event) =>
                                updateSelected({ title: event.target.value })
                              }
                            />
                          </label>

                          <label className="builder-field">
                            <span>Description</span>
                            <RichTextEditor
                              value={selectedSection.body ?? ""}
                              placeholder="Leave blank to hide"
                              onChange={(value) =>
                                updateSelected({ body: value })
                              }
                            />
                          </label>

                          <button
                            type="button"
                            className="builder-inline-add"
                            onClick={() =>
                              updateSelected({ title: "", body: "" })
                            }
                          >
                            <X size={15} />
                            Hide heading
                          </button>
                        </details>

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

                        <div className="builder-repeatable-tabs">
                        {(selectedSection.slides ?? []).map(
                          (slide, index) => {
                            const slideKey = slide.id ?? `slide-${index}`;
                            const isOpen =
                              openSlideId === slideKey ||
                              (!openSlideId && index === 0);

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
                        </div>
                      </>
                    )}
                  </details>
                )}
            </details>
          )}
          {inspectorTab === "style" && !selectedLayoutBlock && selectedSection && (
            <StyleTabPanel
              target={styleTarget}
              showTypography={false}
              onChange={updateStyleTarget}
              onPickBackgroundImage={pickStyleBackgroundImage}
            />
          )}

          {inspectorTab === "advanced" && (
            <>
              {!selectedLayoutBlock ? (
                <>
                  <details className="builder-collapse" open>
                    <summary>
                      <InspectorGroupSummary
                        title="Publishing State"
                        description="Toggle whether this section is rendered on the page."
                        meta={selectedSection.visible ? "visible" : "hidden"}
                      />
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

                  <details
                    className="builder-collapse"
                    open={Boolean(selectedLayoutBlock)}
                  >
                    <summary>
                      <InspectorGroupSummary
                        title="Current JSON"
                        description="Inspect or export the current builder payload."
                        meta="advanced"
                      />
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
              ) : (
                <>
                  <details className="builder-collapse" open>
                    <summary>
                      <InspectorGroupSummary
                        title="Selected element"
                        description="Metadata for the focused block."
                        meta={
                          layoutBlockLabels[selectedLayoutBlock?.kind ?? "text"]
                        }
                      />
                    </summary>
                    <div className="builder-contrast-note">
                      <strong>
                        {layoutBlockLabels[selectedLayoutBlock?.kind ?? "text"]}
                      </strong>
                      <span>
                        Use the delete control on the element card in the
                        canvas, or remove it from the column list in the
                        section tab.
                      </span>
                    </div>
                  </details>

                  {renderAnimationControls(selectedLayoutBlock, {
                    allowPause: true,
                  })}

                  <details className="builder-collapse">
                    <summary>
                      <InspectorGroupSummary
                        title="Page JSON"
                        description="Full builder payload for this page."
                        meta="advanced"
                      />
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
          )}
        </>
      ) : (
        <div className="builder-empty-state">
          <Layers3 size={22} />
          <p>Add a section to start designing.</p>
        </div>
      )}

      {isLayoutPickerOpen && selectedSection?.kind === "contentLayout" ? (
        <div
          className="builder-layout-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="builder-layout-picker-title"
          onClick={() => setLayoutPickerOpen(false)}
        >
          <div
            className="builder-layout-dialog"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="builder-layout-header">
              <div>
                <strong id="builder-layout-picker-title">
                  Choose row layout
                </strong>
                <span>
                  Pick a preset. Existing blocks stay in place if columns are
                  reduced.
                </span>
              </div>
              <button
                type="button"
                className="builder-layout-close"
                onClick={() => setLayoutPickerOpen(false)}
                aria-label="Close row layout picker"
              >
                <X size={15} />
              </button>
            </div>

            <div className="builder-layout-picker-grid">
              {builderRowLayoutPresets.map((preset) => {
                const isActive = currentRowLayoutPreset?.key === preset.key;
                return (
                  <button
                    key={preset.key}
                    type="button"
                    className={`builder-layout-picker-card ${
                      isActive ? "is-active" : ""
                    }`}
                    onClick={() => {
                      applyLayoutPreset(selectedSection.id, preset.key);
                      setLayoutPickerOpen(false);
                    }}
                  >
                    <span className="builder-layout-picker-card-copy">
                      <strong>{preset.label}</strong>
                      <small>{preset.description}</small>
                    </span>
                    <span
                      className="builder-layout-picker-preview"
                      aria-hidden="true"
                    >
                      {preset.ratios.map((ratio, index) => (
                        <i
                          key={`${preset.key}-${index}`}
                          style={{ flex: ratio }}
                        />
                      ))}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}
    </aside>
  );
}
