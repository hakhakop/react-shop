"use client";

import {
  ArrowDown,
  ArrowUp,
  Copy,
  GalleryHorizontal,
  Layers3,
  PanelRightClose,
  Plus,
  Ruler,
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
  getBuilderLayoutRows,
  getBuilderRowLayoutPreset,
  getBuilderRowLayoutSummary,
} from "@/components/dashboard/builderLayoutPresets";
import TypographyPanel from "@/components/dashboard/TypographyPanel";
import StyleTabPanel from "@/components/dashboard/style/StyleTabPanel";
import AnimationControl from "@/components/dashboard/style/AnimationControl";
import {
  legacySpacingToSides,
  type BuilderVisualStyle,
} from "@/lib/builderVisualStyle";
import {
  getSpacingOptionLabel,
  type BuilderSpacingContext,
  BUILDER_SPACING_SCALE,
  TOKEN_LABELS,
  resolveBuilderSpacing,
} from "@/lib/builderSpacing";
import type { CategoryTreeItem } from "@/lib/categories";
import type { TypographyArea } from "@/lib/builderTypography";
import type { BuilderShellSettings } from "@/lib/builderShell";

const getSupportedTypographyAreas = (kind: string): readonly TypographyArea[] => {
  if (kind === "heading") return ["title"] as const;
  if (kind === "text") return ["body"] as const;
  if (kind === "button") return ["button"] as const;
  if (kind === "datePicker") return ["title", "body"] as const;
  if (kind === "list") return ["body"] as const;
  if (kind === "table") return ["body"] as const;
  if (
    kind === "image" ||
    kind === "icon" ||
    kind === "fluentForm" ||
    kind === "embed" ||
    kind === "breadcrumbs"
  ) {
    return [] as const;
  }
  return ["title", "body", "button", "eyebrow"] as const;
};

// Inspector handlers mirror the lifted builder callbacks during this JSX-only extraction.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type LooseHandler = (...args: any[]) => void;

const GRADIENT_PRESETS: Record<string, [string, string, string]> = {
  "indigo-purple": ["#a5b4fc", "#6366f1", "#a855f7"],
  "cyan-blue": ["#22d3ee", "#06b6d4", "#2563eb"],
  "emerald-teal": ["#34d399", "#10b981", "#0d9488"],
  "sunset-orange": ["#fb923c", "#f97316", "#ec4899"],
  "indigo-purple-cyan": ["#60a5fa", "#818cf8", "#c084fc"],
  "sunset-pink": ["#fb923c", "#ec4899", "#a855f7"],
  "gold-amber": ["#facc15", "#f59e0b", "#f97316"],
};

function SpacingControl({
  id,
  label,
  value,
  context,
  inheritedValue,
  allowInherit = true,
  onChange,
}: {
  id: string;
  label: string;
  value: string | undefined;
  context: BuilderSpacingContext;
  inheritedValue?: string;
  allowInherit?: boolean;
  onChange: (newValue: any) => void;
}) {
  const presets = ["none", "xs", "sm", "md", "lg", "xl", "2xl", "3xl"] as const;
  
  const isPresetToken = (val: string) => {
    return (
      val === "none" ||
      val === "xs" ||
      val === "sm" ||
      val === "md" ||
      val === "lg" ||
      val === "xl" ||
      val === "2xl" ||
      val === "3xl" ||
      val === "small" ||
      val === "medium" ||
      val === "large"
    );
  };

  const isPreset = !value || value === "inherit" || isPresetToken(value);
  const isCustom = !isPreset;

  const numericMatch = value ? value.trim().match(/^(\d+)px$/i) : null;
  const customNumericValue = numericMatch ? numericMatch[1] : "";

  const handleSelectChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const val = event.target.value;
    if (val === "custom") {
      const currentPx = resolveBuilderSpacing(
        value ?? (allowInherit ? "inherit" : "sm"),
        context,
        inheritedValue,
      ).px;
      onChange(`${currentPx > 0 ? currentPx : 16}px`);
    } else {
      onChange(val);
    }
  };

  const handleCustomNumericChange = (event: ChangeEvent<HTMLInputElement>) => {
    const num = event.target.value.replace(/\D/g, "");
    onChange(num ? `${num}px` : "0px");
  };

  let selectValue = "inherit";
  if (isCustom) {
    selectValue = "custom";
  } else if (value) {
    if (value === "small") selectValue = "sm";
    else if (value === "medium") selectValue = "md";
    else if (value === "large") selectValue = "lg";
    else selectValue = value;
  } else {
    selectValue = allowInherit ? "inherit" : "sm";
  }

  return (
    <label className="builder-field spacing-control-wrapper" style={{ display: "block", marginBottom: "12px" }}>
      <span style={{ display: "block", marginBottom: "4px", fontSize: "12px", fontWeight: 500, color: "var(--text-muted)" }}>{label}</span>
      <div className="spacing-control-row" style={{ display: "flex", gap: "8px", alignItems: "center", width: "100%" }}>
        <select
          id={id}
          value={selectValue}
          onChange={handleSelectChange}
          style={{
            flex: 1,
            height: "36px",
            padding: "0 10px",
            borderRadius: "var(--builder-ui-radius-sm)",
            border: "1px solid var(--builder-ui-border)",
            background: "var(--builder-ui-panel-solid)",
            color: "var(--builder-ui-text)",
            font: "inherit",
          }}
        >
          {allowInherit && (
            <option value="inherit">
              Global ({resolveBuilderSpacing(undefined, context, inheritedValue).label})
            </option>
          )}
          {presets.map((preset) => {
            const px = BUILDER_SPACING_SCALE[preset];
            const labelName = TOKEN_LABELS[preset];
            return (
              <option key={preset} value={preset}>
                {labelName} ({px}px)
              </option>
            );
          })}
          <option value="custom">Custom...</option>
        </select>
        
        {isCustom && (
          <div className="custom-spacing-input-wrapper" style={{ display: "flex", alignItems: "center", gap: "4px", width: "85px", flexShrink: 0 }}>
            <input
              type="text"
              pattern="[0-9]*"
              inputMode="numeric"
              value={customNumericValue}
              onChange={handleCustomNumericChange}
              style={{
                width: "100%",
                height: "36px",
                padding: "0 10px",
                border: "1px solid var(--builder-ui-border)",
                background: "var(--builder-ui-panel-solid)",
                color: "var(--builder-ui-text)",
                borderRadius: "var(--builder-ui-radius-sm)",
                textAlign: "right",
                font: "inherit",
              }}
              placeholder="0"
            />
            <span style={{ fontSize: "12px", color: "var(--text-muted)", opacity: 0.8 }}>px</span>
          </div>
        )}
      </div>
    </label>
  );
}

const getCustomGradientPatch = (
  block: any,
  presetField: "textGradientPreset" | "typewriterGradientPreset",
  change: Record<string, any>
) => {
  const currentPreset = block[presetField] || "none";
  const patch: Record<string, any> = { ...change };
  
  if (currentPreset !== "none" && currentPreset !== "custom") {
    const colors = GRADIENT_PRESETS[currentPreset] || ["#ffffff", "#60a5fa", "#c084fc"];
    
    patch[presetField] = "custom";
    if (change.textGradientCustomStart === undefined) {
      patch.textGradientCustomStart = block.textGradientCustomStart ?? colors[0];
    }
    if (change.textGradientCustomMiddle === undefined) {
      patch.textGradientCustomMiddle = block.textGradientCustomMiddle ?? colors[1];
    }
    if (change.textGradientCustomEnd === undefined) {
      patch.textGradientCustomEnd = block.textGradientCustomEnd ?? colors[2];
    }
    if (change.textGradientCustomStartOffset === undefined) {
      patch.textGradientCustomStartOffset = block.textGradientCustomStartOffset ?? 0;
    }
    if (change.textGradientCustomMiddleOffset === undefined) {
      patch.textGradientCustomMiddleOffset = block.textGradientCustomMiddleOffset ?? 50;
    }
    if (change.textGradientCustomEndOffset === undefined) {
      patch.textGradientCustomEndOffset = block.textGradientCustomEndOffset ?? 100;
    }
    if (change.textGradientCustomAngle === undefined) {
      patch.textGradientCustomAngle = block.textGradientCustomAngle ?? 135;
    }
  }
  
  return patch;
};

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
  { label: "Antigravity", value: "antigravity" },
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
  spacingFocusRequest?: {
    id: number;
    scope: string;
    field?: string;
  } | null;
  spacingOverlayEnabled?: boolean;
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
  selectedLayoutRowIndex: number | null;
  selectedLayoutBlock: BuilderLayoutBlock | null;
  selectedLayoutBlockKey: string | null;
  selectedSection: BuilderSection | undefined;
  shellSettings: BuilderShellSettings;
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
  duplicateSelectedRow?: LooseHandler;
  applyLayoutPreset: (sectionId: string, presetKey: string) => void;
  applySelectedRowLayoutPreset?: (presetKey: string) => void;
  deleteSelectedRow?: LooseHandler;
  moveSelected: LooseHandler;
  openWordPressMediaPicker: (options: { title: string; currentUrl?: string; onSelect: (media: WordPressMediaItem) => void }) => void;
  onOpenGlobalSpacingSettings?: (scope: "section" | "row" | "element") => void;
  setInspectorOpen: Dispatch<SetStateAction<boolean>>;
  setInspectorTab: Dispatch<SetStateAction<InspectorTab>>;
  setSpacingOverlayEnabled?: Dispatch<SetStateAction<boolean>>;
  setOpenSlideId: Dispatch<SetStateAction<string | null>>;
  setSectionSettingsOpen: Dispatch<SetStateAction<boolean>>;
  setSectionStructureOpen: Dispatch<SetStateAction<boolean>>;
  setSelectedLayoutBlockKey: Dispatch<SetStateAction<string | null>>;
  setSelectedLayoutRowIndex?: Dispatch<SetStateAction<number | null>>;
  onUpdateRowLayout?: LooseHandler;
  onUpdateRowStyle?: LooseHandler;
  onAddRow?: LooseHandler;
  onDeleteRow?: LooseHandler;
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
  hasSections?: boolean;
};

function isLayoutContainerSection(section: BuilderSection | null | undefined) {
  return (
    section?.kind === "contentLayout" || section?.kind === "scrollPinnedDemo"
  );
}

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
    hasSections = false,
    builderJson, copied, elementBackgroundPresets, getLayoutItemBlocks,
    inspectorOpen, inspectorTab, layoutBlockLabels, openLayoutItemId, openSlideId,
    spacingFocusRequest = null,
    spacingOverlayEnabled = false,
    addSelectedLayoutBlockButton, deleteSelectedLayoutBlockButton, updateSelectedLayoutBlockButton,
    previewCategoryTree,
    sectionBackgroundPresets, sectionColorModeLabel, sectionLabels,
    sectionSettingsOpen, sectionStructureOpen, selectedLayoutBlock,
    selectedLayoutBlockKey, selectedLayoutColumnKey, selectedLayoutRowIndex, selectedSection, shellSettings, uploadingNestedSlide, uploadingSlide,
    addSelectedLayoutBlockBadge, addSelectedLayoutBlockGridItem,
    addSelectedLayoutBlockSlide, addSelectedLayoutItem, addSelectedSlide, copyJson,
    deleteSelected, deleteSelectedLayoutBlock, deleteSelectedLayoutBlockBadge,
    deleteSelectedLayoutBlockGridItem, deleteSelectedLayoutBlockSlide,
    deleteSelectedLayoutItem, deleteSelectedSlide, duplicateSelected,
    duplicateSelectedRow = () => undefined,
    applyLayoutPreset,
    applySelectedRowLayoutPreset = () => undefined,
    deleteSelectedRow = () => undefined,
    onUpdateRowStyle = () => undefined,
    moveSelected,
    openWordPressMediaPicker, onOpenGlobalSpacingSettings, setInspectorOpen, setInspectorTab, setOpenSlideId,
    setSpacingOverlayEnabled = () => undefined,
    setSectionSettingsOpen, setSectionStructureOpen, setSelectedLayoutBlockKey,
    updateSelected, updateSelectedBadge, updateSelectedLayoutBlock,
    updateSelectedLayoutBlockBadge, updateSelectedLayoutBlockGridItem,
    updateSelectedLayoutBlockSlide, updateSelectedSlide,
    uploadSelectedLayoutBlockSlideImage, uploadSelectedSlideImage,
  } = props;
  const layoutContainerSection = isLayoutContainerSection(selectedSection)
    ? selectedSection
    : null;
  const layoutRows = layoutContainerSection
    ? getBuilderLayoutRows(
        layoutContainerSection,
        layoutContainerSection.layoutItems ?? [],
      )
    : [];
  const selectedLayoutRow =
    selectedLayoutRowIndex !== null ? layoutRows[selectedLayoutRowIndex] : null;
  const selectedRowItem = selectedLayoutRow?.items[0];
  const selectedRowLayoutPreset = getBuilderRowLayoutPreset(
    selectedLayoutRow?.layoutKey ?? null,
  );
  const selectedRowLayoutSummary = getBuilderRowLayoutSummary(
    selectedLayoutRow?.layoutKey ?? null,
    selectedLayoutRow?.items.length ?? null,
  );
  const isSelectedRowEmpty =
    selectedLayoutRow?.items.every((item) => (item.blocks ?? []).length === 0) ??
    false;
  const supportedAreas = selectedLayoutBlock
    ? getSupportedTypographyAreas(selectedLayoutBlock.kind ?? "text")
    : [];
  const blockTabs: [InspectorTab, string][] = [
    ["content", "Content"],
    ["layout", "Layout"],
    ["spacing", "Spacing"],
    [
      "style",
      selectedLayoutBlock?.kind === "products" ? "Product Card" : "Styling",
    ],
  ];
  if (supportedAreas.length > 0) {
    blockTabs.push(["typography", "Typography"]);
  }
  blockTabs.push(["advanced", "Advanced"]);

  const inspectorTabs: [InspectorTab, string][] = selectedLayoutBlock
    ? blockTabs
    : selectedLayoutRow
      ? [
          ["layout", "Layout"],
          ["spacing", "Spacing"],
          ["style", "Styling"],
          ["advanced", "Advanced"],
        ]
      : [
          ["layout", "Layout"],
          ["spacing", "Spacing"],
          ["style", "Styling"],
          ["advanced", "Advanced"],
          ["content", "Content (Legacy)"],
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
    if (selectedLayoutBlock) {
      const supported = getSupportedTypographyAreas(selectedLayoutBlock.kind ?? "text");
      if (supported.length === 0 && inspectorTab === "typography") {
        setInspectorTab("content");
      }
      return;
    }
    if (selectedLayoutRow) {
      if (inspectorTab === "content" || inspectorTab === "typography") {
        setInspectorTab("layout");
      }
      return;
    }
    if (inspectorTab === "typography") {
      setInspectorTab("style");
    }
  }, [inspectorTab, selectedLayoutBlock, selectedLayoutRow, setInspectorTab]);

  useEffect(() => {
    if (!spacingFocusRequest?.field) return;

    const targetId = `spacing-${spacingFocusRequest.scope}-${spacingFocusRequest.field}`;
    let attempts = 0;
    let retryTimer: number | undefined;
    let highlightTimer: number | undefined;

    const tryFocus = () => {
      const element = document.getElementById(targetId);
      if (!element) {
        attempts += 1;
        if (attempts < 12) retryTimer = window.setTimeout(tryFocus, 50);
        return;
      }

      element.scrollIntoView({ block: "center", behavior: "smooth" });
      const focusTarget =
        element instanceof HTMLSelectElement ||
        element instanceof HTMLInputElement ||
        element instanceof HTMLButtonElement
          ? element
          : element.querySelector<HTMLElement>(
              "input:not(:disabled), select:not(:disabled), button:not(:disabled)",
            ) ?? element;
      focusTarget.focus({ preventScroll: true });
      element.classList.add("pulse-highlight");
      highlightTimer = window.setTimeout(() => {
        element.classList.remove("pulse-highlight");
      }, 1500);
    };

    // Let selection and tab changes commit before targeting the final control node.
    retryTimer = window.setTimeout(tryFocus, 80);
    return () => {
      if (retryTimer !== undefined) window.clearTimeout(retryTimer);
      if (highlightTimer !== undefined) window.clearTimeout(highlightTimer);
    };
  }, [spacingFocusRequest]);

  const activeTypographyArea =
    activeTypographyAreaState.blockKey === selectedLayoutBlockKey &&
    supportedAreas.includes(activeTypographyAreaState.area)
      ? activeTypographyAreaState.area
      : supportedAreas[0] ?? "title";
  const selectedBlockVisualStyle = selectedLayoutBlock
    ? (selectedLayoutBlock.visualStyle as BuilderVisualStyle | undefined)
    : undefined;
  const styleTarget = selectedLayoutBlock
    ? {
        visualStyle: {
          ...selectedBlockVisualStyle,
          padding:
            selectedBlockVisualStyle?.padding ??
            legacySpacingToSides(selectedLayoutBlock.elementPadding),
          margin:
            selectedBlockVisualStyle?.margin ??
            (selectedLayoutBlock.kind === "grid" ||
            selectedLayoutBlock.kind === "products"
              ? legacySpacingToSides(selectedLayoutBlock.gridMargin)
              : undefined),
        },
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
    if (selectedLayoutBlock && selectedLayoutBlockKey && selectedSection) {
      const layoutItems = selectedSection.layoutItems ?? [];
      for (let ci = 0; ci < layoutItems.length; ci++) {
        const item = layoutItems[ci];
        if (!item) continue;
        const blocks = getLayoutItemBlocks(item);
        for (let bi = 0; bi < blocks.length; bi++) {
          const block = blocks[bi];
          const blockKey = block.id ?? `${item.id ?? `item-${ci}`}-block-${bi}`;
          if (blockKey === selectedLayoutBlockKey) {
            updateSelectedLayoutBlock(ci, bi, patch);
            return;
          }
        }
      }
      return;
    }
    updateSelected(patch);
  }

  function updateRowVisualStyle(patch: Partial<BuilderVisualStyle>) {
    onUpdateRowStyle({
      rowVisualStyle: {
        ...((selectedRowItem?.rowVisualStyle as BuilderVisualStyle | undefined) ?? {}),
        ...patch,
      },
    });
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

    if (selectedLayoutBlock && selectedLayoutBlockKey && selectedSection) {
      const layoutItems = selectedSection.layoutItems ?? [];
      for (let ci = 0; ci < layoutItems.length; ci++) {
        const item = layoutItems[ci];
        if (!item) continue;
        const blocks = getLayoutItemBlocks(item);
        for (let bi = 0; bi < blocks.length; bi++) {
          const block = blocks[bi];
          const blockKey = block.id ?? `${item.id ?? `item-${ci}`}-block-${bi}`;
          if (blockKey === selectedLayoutBlockKey) {
            updateSelectedLayoutBlock(ci, bi, { animation: nextAnimation });
            return;
          }
        }
      }
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

  function renderSectionScrollBehaviorControls() {
    if (selectedSection?.kind !== "scrollPinnedDemo") return null;

    return (
      <details className="builder-collapse" open>
        <summary>
          <InspectorGroupSummary
            title="Scroll Behavior"
            description="Control scroll speed, pin duration, and animation style."
            meta={`${selectedSection.carouselSettings?.scrubSpeed ?? 1.2}x speed`}
          />
        </summary>
        <label className="builder-field">
          <span>Animation Variant</span>
          <select
            value={selectedSection.carouselSettings?.variant ?? "perfect"}
            onChange={(event) =>
              updateSelected({
                carouselSettings: {
                  ...(selectedSection.carouselSettings ?? {}),
                  variant: event.target.value,
                },
              })
            }
          >
            <option value="perfect">Perfect (Stack)</option>
            <option value="fade">Fade</option>
            <option value="slide">Slide</option>
          </select>
        </label>
        <label className="builder-field">
          <span>Scrub Speed</span>
          <div className="builder-range-row">
            <input
              type="range"
              min="0.1"
              max="5.0"
              step="0.1"
              value={selectedSection.carouselSettings?.scrubSpeed ?? 1.2}
              onChange={(event) =>
                updateSelected({
                  carouselSettings: {
                    ...(selectedSection.carouselSettings ?? {}),
                    scrubSpeed: Number(event.target.value),
                  },
                })
              }
            />
            <span>{(selectedSection.carouselSettings?.scrubSpeed ?? 1.2).toFixed(1)}x</span>
          </div>
        </label>
        <label className="builder-field">
          <span>Pin Height Factor</span>
          <div className="builder-range-row">
            <input
              type="range"
              min="20"
              max="500"
              step="10"
              value={selectedSection.carouselSettings?.pinHeightFactor ?? 100}
              onChange={(event) =>
                updateSelected({
                  carouselSettings: {
                    ...(selectedSection.carouselSettings ?? {}),
                    pinHeightFactor: Number(event.target.value),
                  },
                })
              }
            />
            <span>{selectedSection.carouselSettings?.pinHeightFactor ?? 100}%</span>
          </div>
        </label>
        <label className="builder-check">
          <input
            type="checkbox"
            checked={selectedSection.carouselSettings?.showNavigation ?? true}
            onChange={(event) =>
              updateSelected({
                carouselSettings: {
                  ...(selectedSection.carouselSettings ?? {}),
                  showNavigation: event.target.checked,
                },
              })
            }
          />
          <span>Show Navigation</span>
        </label>
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
    layoutContainerSection
      ? (layoutContainerSection.layoutItems ?? []).findIndex(
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
    : selectedLayoutRow
      ? "row"
    : selectedColumnIndex >= 0
      ? "column"
      : "section";
  const isElementContentTab = inspectorTab === "content";
  const isElementLayoutTab = inspectorTab === "layout";
  const isElementSpacingTab = inspectorTab === "spacing";
  const isElementSettingsTab = inspectorTab === "style";
  const isElementTypographyTab = inspectorTab === "typography";
  const isElementAdvancedTab = inspectorTab === "advanced";

  const inspectorTitle = selectedLayoutBlock
    ? isElementContentTab
      ? "Element Content"
      : isElementLayoutTab
        ? "Element Layout"
        : isElementSpacingTab
          ? "Element Spacing"
          : isElementSettingsTab
            ? selectedLayoutBlock.kind === "products"
              ? "Product Card"
              : "Element Styling"
            : isElementTypographyTab
              ? "Element Typography"
              : "Element Advanced"
    : selectedLayoutRow
      ? inspectorTab === "layout"
        ? "Row Layout"
        : inspectorTab === "spacing"
          ? "Row Spacing"
          : inspectorTab === "style"
            ? "Row Styling"
            : "Row Advanced"
      : inspectorTab === "layout"
        ? "Section Layout"
        : inspectorTab === "spacing"
          ? "Section Spacing"
          : inspectorTab === "style"
            ? "Section Styling"
            : inspectorTab === "typography"
              ? "Section Typography"
              : inspectorTab === "advanced"
                ? "Section Advanced"
                : "Section Layout";
  const showLegacySectionContentControls: boolean = true;
  const currentRowLayoutPreset = getBuilderRowLayoutPreset(
    layoutContainerSection?.layout ?? null,
  );
  const currentRowLayoutSummary = getBuilderRowLayoutSummary(
    layoutContainerSection?.layout ?? null,
    layoutContainerSection?.layoutColumns ?? null,
  );

  return (
    <aside
      className={`builder-inspector builder-panel ${inspectorOpen ? "is-open" : ""}`}
    >
      <div className="builder-inspector-header">
        <Settings2 size={18} />
        <span>{inspectorTitle}</span>
        <button
          type="button"
          className={`builder-inspector-spacing-toggle${
            spacingOverlayEnabled ? " is-active" : ""
          }`}
          onClick={() => setSpacingOverlayEnabled((enabled) => !enabled)}
          aria-pressed={spacingOverlayEnabled}
          title="Show spacing guides"
        >
          <Ruler size={14} />
          <span>Spacing</span>
        </button>
        <button
          type="button"
          className="builder-inspector-close"
          onClick={() => setInspectorOpen(false)}
          aria-label="Close inspector"
        >
          <PanelRightClose size={16} />
        </button>
      </div>
      {spacingOverlayEnabled ? (
        <div
          className="builder-inspector-spacing-legend"
          role="status"
          aria-label="Spacing guide legend"
        >
          <strong>Canvas guides</strong>
          <span className="is-padding"><i />Padding</span>
          <span className="is-margin"><i />Margin</span>
          <span className="is-gap"><i />Gap</span>
          <span className="is-local"><i />Local</span>
        </div>
      ) : null}
      {selectedSection ? (
        <>
          <div className="builder-inspector-context">
            <strong>
              {selectedLayoutBlock
                ? "Element"
                : selectedLayoutRow
                  ? "Row Layout"
                  : "Section"}
            </strong>
            <span>
              {selectedLayoutBlock
                ? layoutBlockLabels[selectedLayoutBlock.kind ?? "text"]
                : selectedLayoutRow
                  ? `Row ${(selectedLayoutRowIndex ?? 0) + 1}`
                : sectionLabels[selectedSection.kind]}
            </span>
            {selectedLayoutBlock && (
              <button
                type="button"
                onClick={() => {
                  setSelectedLayoutBlockKey(null);
                  setInspectorTab("layout");
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
            <span className={activeTrailLevel === "row" ? "is-active" : ""}>
              Row: {selectedLayoutRow ? (selectedLayoutRowIndex ?? 0) + 1 : "None"}
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

          {!selectedLayoutBlock && selectedLayoutRow ? (
            <div className="builder-actions-row">
              <button
                type="button"
                onClick={duplicateSelectedRow}
                title="Duplicate row"
              >
                <Copy size={15} />
              </button>
              <button
                type="button"
                onClick={deleteSelectedRow}
                title={
                  isSelectedRowEmpty
                    ? "Delete row"
                    : "Only empty rows can be deleted"
                }
                disabled={!isSelectedRowEmpty}
              >
                <Trash2 size={15} />
              </button>
            </div>
          ) : !selectedLayoutBlock ? (
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
          ) : null}

          {selectedLayoutRow && inspectorTab === "layout" && (
            <div className="builder-inspector-stack">
              <details className="builder-collapse" open>
                <summary>
                  <InspectorGroupSummary
                    title="Row Layout"
                    meta={selectedRowLayoutSummary}
                  />
                </summary>
                <label className="builder-field">
                  <span>Current layout</span>
                  <input value={selectedRowLayoutSummary} readOnly />
                  <small>
                    {selectedRowLayoutPreset
                      ? "Chosen row preset"
                      : "Custom or legacy row"}
                  </small>
                </label>

                <div className="builder-layout-picker-grid is-inline">
                  {builderRowLayoutPresets.map((preset) => {
                    const isActive = selectedRowLayoutPreset?.key === preset.key;
                    return (
                      <button
                        key={preset.key}
                        type="button"
                        className={`builder-layout-picker-card ${
                          isActive ? "is-active" : ""
                        }`}
                        onClick={() => applySelectedRowLayoutPreset(preset.key)}
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
              </details>

              <details className="builder-collapse">
                <summary>
                  <InspectorGroupSummary
                    title="Row Contents"
                    meta={`${selectedLayoutRow.items.length} column${
                      selectedLayoutRow.items.length === 1 ? "" : "s"
                    }`}
                  />
                </summary>
                <div className="builder-compact-column-list">
                  {selectedLayoutRow.items.map((item, index) => (
                    <div
                      key={item.id ?? `row-column-${index}`}
                      className="builder-compact-column-row"
                    >
                      <div>
                        <strong>Column {index + 1}</strong>
                        <span>{(item.blocks ?? []).length} elements</span>
                      </div>
                    </div>
                  ))}
                </div>
              </details>

              <StyleTabPanel
                target={{ visualStyle: selectedRowItem?.rowVisualStyle }}
                showSpacing={false}
                showBackground={false}
                showAppearance={false}
                showAdvanced={false}
                showTypography={false}
                onChange={(patch) =>
                  updateRowVisualStyle(patch.visualStyle ?? {})
                }
              />
            </div>
          )}

          {selectedLayoutRow && inspectorTab === "spacing" && (
            <div className="builder-inspector-stack">
              <details className="builder-collapse" open>
                <summary>
                  <InspectorGroupSummary
                    title="Row Spacing"
                    description="Control padding inside this row and margin outside it."
                    meta="Padding & margin"
                  />
                </summary>
                <div className="builder-two-column">
                  <SpacingControl
                    id="spacing-row-rowTopSpacing"
                    label="Top Padding"
                    value={selectedRowItem?.rowTopSpacing}
                    context="rowPadding"
                    inheritedValue={shellSettings.rowPaddingTop}
                    onChange={(val) => onUpdateRowStyle({ rowTopSpacing: val })}
                  />
                  <SpacingControl
                    id="spacing-row-rowBottomSpacing"
                    label="Bottom Padding"
                    value={selectedRowItem?.rowBottomSpacing}
                    context="rowPadding"
                    inheritedValue={shellSettings.rowPaddingBottom}
                    onChange={(val) => onUpdateRowStyle({ rowBottomSpacing: val })}
                  />
                </div>
                <div className="builder-two-column">
                  <SpacingControl
                    id="spacing-row-rowTopMargin"
                    label="Top Margin"
                    value={selectedRowItem?.rowTopMargin}
                    context="rowMargin"
                    inheritedValue={shellSettings.rowMarginTop}
                    onChange={(val) => onUpdateRowStyle({ rowTopMargin: val })}
                  />
                  <SpacingControl
                    id="spacing-row-rowBottomMargin"
                    label="Bottom Margin"
                    value={selectedRowItem?.rowBottomMargin}
                    context="rowMargin"
                    inheritedValue={shellSettings.rowMarginBottom}
                    onChange={(val) => onUpdateRowStyle({ rowBottomMargin: val })}
                  />
                </div>
                <div className="builder-shell-note">
                  <strong>Row Gap</strong>
                  <span>
                    {resolveBuilderSpacing(undefined, "rowGap", shellSettings.rowGap).label} · Global
                  </span>
                </div>
                {onOpenGlobalSpacingSettings ? (
                  <button
                    type="button"
                    className="builder-secondary-button builder-full-button"
                    onClick={() => onOpenGlobalSpacingSettings("row")}
                  >
                    Edit global row spacing
                  </button>
                ) : null}
              </details>
            </div>
          )}

          {selectedLayoutRow && inspectorTab === "style" && (
            <div className="builder-inspector-stack">
              <details className="builder-collapse" open>
                <summary>
                  <InspectorGroupSummary
                    title="Row Surface"
                    description="Set the row background, color mode, and corner radius."
                    meta={selectedRowItem?.rowColorScheme ?? "inherit"}
                  />
                </summary>
                <label className="builder-field">
                  <span>Background</span>
                  <div className="builder-color-row">
                    <input
                      type="color"
                      value={
                        selectedRowItem?.rowBackground?.startsWith("#")
                          ? selectedRowItem.rowBackground
                          : "#ffffff"
                      }
                      onChange={(event) =>
                        onUpdateRowStyle({ rowBackground: event.target.value })
                      }
                    />
                    <input
                      value={selectedRowItem?.rowBackground ?? ""}
                      placeholder="Transparent or CSS color"
                      onChange={(event) =>
                        onUpdateRowStyle({ rowBackground: event.target.value })
                      }
                    />
                  </div>
                </label>
                <div className="builder-two-column">
                  <label className="builder-field">
                    <span>Color Mode</span>
                    <select
                      value={selectedRowItem?.rowColorScheme ?? "inherit"}
                      onChange={(event) =>
                        onUpdateRowStyle({
                          rowColorScheme: event.target.value as SectionColorScheme,
                        })
                      }
                    >
                      <option value="inherit">Auto by background</option>
                      <option value="light">Dark text</option>
                      <option value="dark">Light text</option>
                    </select>
                  </label>
                  <label className="builder-field">
                    <span>Border Radius</span>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={selectedRowItem?.rowBorderRadius ?? 0}
                      onChange={(event) =>
                        onUpdateRowStyle({
                          rowBorderRadius: Number(event.target.value),
                        })
                      }
                    />
                  </label>
                </div>
              </details>
              <StyleTabPanel
                target={{ visualStyle: selectedRowItem?.rowVisualStyle }}
                showSpacing={false}
                showLayout={false}
                showAdvanced={false}
                showTypography={false}
                onChange={(patch) =>
                  updateRowVisualStyle(patch.visualStyle ?? {})
                }
              />
            </div>
          )}

          {selectedLayoutRow && inspectorTab === "advanced" && (
            <div className="builder-inspector-stack">
              <details className="builder-collapse" open>
                <summary>
                  <InspectorGroupSummary
                    title="Row Animation"
                    description="Configure this row's entrance animation."
                    meta={selectedRowItem?.rowAnimation?.preset ?? "none"}
                  />
                </summary>
                <AnimationControl
                  value={selectedRowItem?.rowAnimation}
                  onChange={(rowAnimation) => onUpdateRowStyle({ rowAnimation })}
                />
              </details>
              <StyleTabPanel
                target={{ visualStyle: selectedRowItem?.rowVisualStyle }}
                showSpacing={false}
                showBackground={false}
                showAppearance={false}
                showLayout={false}
                showTypography={false}
                onChange={(patch) =>
                  updateRowVisualStyle(patch.visualStyle ?? {})
                }
              />
            </div>
          )}

          {((!selectedLayoutBlock && !selectedLayoutRow && inspectorTab === "layout") ||
            (selectedLayoutBlock &&
              isLayoutContainerSection(selectedSection) &&
              (isElementContentTab ||
                isElementLayoutTab ||
                isElementSpacingTab ||
                isElementSettingsTab ||
                isElementTypographyTab ||
                isElementAdvancedTab))) && (
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
                      : isElementLayoutTab
                        ? "Layout"
                        : isElementSpacingTab
                          ? "Spacing"
                          : isElementSettingsTab
                            ? selectedLayoutBlock?.kind === "products"
                              ? "Product Card"
                              : "Styling"
                            : isElementTypographyTab
                              ? "Typography"
                              : "Advanced"
                    : "Section Layout"}
                </span>
                <small>
                  {selectedLayoutBlock || sectionSettingsOpen
                    ? "open"
                    : "closed"}
                </small>
              </summary>
              {inspectorTab === "layout" && !selectedLayoutBlock && !selectedLayoutRow && (
                <>
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

                      <StyleTabPanel
                        target={styleTarget}
                        showSpacing={false}
                        showBackground={false}
                        showAppearance={false}
                        showAdvanced={false}
                        showTypography={false}
                        onChange={updateStyleTarget}
                      />

	                </>
	              )}

              {((inspectorTab === "layout" &&
                !selectedLayoutBlock &&
                !selectedLayoutRow &&
                (isLayoutContainerSection(selectedSection) ||
                  showLegacySectionContentControls)) ||
                ((isElementContentTab ||
                  isElementLayoutTab ||
                  isElementSpacingTab ||
                  isElementSettingsTab ||
                  isElementTypographyTab ||
                  isElementAdvancedTab) &&
                  isLayoutContainerSection(selectedSection) &&
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
                              : isElementLayoutTab
                                ? "Element Layout"
                                : isElementSpacingTab
                                  ? "Element Spacing"
                                  : isElementSettingsTab
                                    ? selectedLayoutBlock?.kind === "products"
                                      ? "Product Card"
                                      : "Element Styling"
                                    : isElementTypographyTab
                                      ? "Element Typography"
                                      : "Element Advanced"
                            : "Section Type Options"
                        }
                        description={
                          selectedLayoutBlock
                            ? isElementContentTab
                              ? "Edit the selected element without leaving this section."
                              : isElementLayoutTab
                                ? "Configure element layout, alignment, and display options."
                                : isElementSpacingTab
                                  ? "Tune element padding and layout spacing."
                                  : isElementSettingsTab
                                    ? selectedLayoutBlock?.kind === "products"
                                      ? "Tune product card design, image treatment, spacing, and cart actions."
                                      : "Tune appearance, spacing, and background for this element."
                                    : isElementTypographyTab
                                      ? "Tune title, body, and button typography for this element."
                                      : "Configure animation entry, developer keys, and CSS targets."
                            : "Controls specific to the selected section type."
                        }
                        meta={sectionLabels[selectedSection.kind]}
                      />
                    </summary>





                    {inspectorTab === "layout" &&
                      !selectedLayoutBlock &&
                      !selectedLayoutRow &&
                      isLayoutContainerSection(selectedSection) && (
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
                      isElementLayoutTab ||
                      isElementSpacingTab ||
                      isElementSettingsTab ||
                      isElementTypographyTab ||
                      isElementAdvancedTab) &&
                      selectedLayoutBlock &&
                      isLayoutContainerSection(selectedSection) && (
                      <>
                        {isElementSettingsTab ? (
                          <>
                            <div className="builder-element-inspector-note">
                              <strong>
                                {selectedLayoutBlock.kind === "products"
                                  ? "Product card design"
                                  : "Element styling"}
                              </strong>
                              <span>
                                {selectedLayoutBlock.kind === "products"
                                  ? "Preset, surface, image treatment, spacing, and cart action appearance."
                                  : `Card style, colors, and appearance for ${
                                      layoutBlockLabels[selectedLayoutBlock.kind ?? "text"]
                                    }.`}
                              </span>
                            </div>
                            {selectedLayoutBlock.kind !== "products" && (
                              <StyleTabPanel
                                target={styleTarget}
                                showSpacing={false}
                                showBackground={false}
                                showLayout={false}
                                showAdvanced={false}
                                showTypography={false}
                                onChange={updateStyleTarget}
                                onPickBackgroundImage={pickStyleBackgroundImage}
                              />
                            )}
                          </>
                        ) : isElementLayoutTab && selectedLayoutBlock.kind !== "products" ? (
                          <StyleTabPanel
                            target={styleTarget}
                            showSpacing={false}
                            showBackground={false}
                            showAppearance={false}
                            showAdvanced={false}
                            showTypography={false}
                            onChange={updateStyleTarget}
                          />
                        ) : isElementSpacingTab ? (
                          <>
                            <StyleTabPanel
                              target={styleTarget}
                              inheritedSpacing={{
                                padding: {
                                  top: shellSettings.elementPaddingTop,
                                  right: shellSettings.elementPaddingRight,
                                  bottom: shellSettings.elementPaddingBottom,
                                  left: shellSettings.elementPaddingLeft,
                                },
                                margin: {
                                  top: shellSettings.elementMarginTop,
                                  right: shellSettings.elementMarginRight,
                                  bottom: shellSettings.elementMarginBottom,
                                  left: shellSettings.elementMarginLeft,
                                },
                              }}
                              spacingControlIds={{
                                padding: "spacing-element-visualPadding",
                                margin: "spacing-element-visualMargin",
                              }}
                              showBackground={false}
                              showAppearance={false}
                              showLayout={false}
                              showAdvanced={false}
                              showTypography={false}
                              onChange={updateStyleTarget}
                            />
                            {onOpenGlobalSpacingSettings ? (
                              <button
                                type="button"
                                className="builder-secondary-button builder-full-button"
                                onClick={() => onOpenGlobalSpacingSettings("element")}
                              >
                                Edit global element spacing
                              </button>
                            ) : null}
                          </>
                        ) : isElementAdvancedTab ? (
                          <StyleTabPanel
                            target={styleTarget}
                            showSpacing={false}
                            showBackground={false}
                            showAppearance={false}
                            showLayout={false}
                            showTypography={false}
                            onChange={updateStyleTarget}
                          />
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
                                              {supportedAreas.length > 1 && (
                                                <div className="builder-style-preset-row builder-typography-area-tabs">
                                                  {supportedAreas.map((area) => (
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
                                                      {{
                                                        title: "Title",
                                                        body: "Body",
                                                        button: "Button",
                                                        eyebrow: "Eyebrow",
                                                      }[area]}
                                                    </button>
                                                  ))}
                                                </div>
                                              )}
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
                                                  value={{
                                                    ...(activeTypographyArea === "title"
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
                                                              ?.eyebrow),
                                                    ...(block.kind === "heading" && activeTypographyArea === "title"
                                                      ? { textAlign: block.headingAlign ?? "left" }
                                                      : {}),
                                                  }}
                                                  onChange={(t) => {
                                                    const { textAlign, ...tRest } = t;
                                                    const patch: any = {
                                                      typography: {
                                                        ...((block.typography as any) ??
                                                          {}),
                                                        [activeTypographyArea]:
                                                          block.kind === "heading" &&
                                                          activeTypographyArea === "title"
                                                            ? tRest
                                                            : t,
                                                      },
                                                    };
                                                    if (
                                                      block.kind === "heading" &&
                                                      activeTypographyArea === "title" &&
                                                      textAlign
                                                    ) {
                                                      patch.headingAlign = textAlign;
                                                    }
                                                    updateSelectedLayoutBlock(
                                                      index,
                                                      blockIndex,
                                                      patch,
                                                    );
                                                  }}
                                                />
                                              </div>
                                            </div>
                                          )}

                                          {isSelectedBlock &&
                                            isElementLayoutTab && (
                                            <>
                                              {block.kind !== "products" && (
                                                <details className="builder-collapse" open>
                                                  <summary>
                                                    <span>Element Layout</span>
                                                    <small>{block.elementAlign ?? "left"}</small>
                                                  </summary>
                                                  <label className="builder-field">
                                                    <span>Content Align</span>
                                                    <select
                                                      value={block.elementAlign ?? "left"}
                                                      onChange={(event) =>
                                                        updateSelectedLayoutBlock(
                                                          index,
                                                          blockIndex,
                                                          {
                                                            elementAlign: event.target
                                                              .value as BuilderLayoutBlock["elementAlign"],
                                                          },
                                                        )
                                                      }
                                                    >
                                                      <option value="left">Left</option>
                                                      <option value="center">Center</option>
                                                      <option value="right">Right</option>
                                                    </select>
                                                  </label>

                                                  {(block.kind === "button" || block.kind === "hero") && (
                                                    <label className="builder-field">
                                                      <span>Buttons orientation</span>
                                                      <select
                                                        value={block.buttonsLayout ?? "inline"}
                                                        onChange={(event) =>
                                                          updateSelectedLayoutBlock(
                                                            index,
                                                            blockIndex,
                                                            { buttonsLayout: event.target.value as any },
                                                          )
                                                        }
                                                      >
                                                        <option value="inline">Inline (Side by side)</option>
                                                        <option value="stacked">Stacked (Vertical)</option>
                                                      </select>
                                                    </label>
                                                  )}

                                                  {block.kind === "embed" && (
                                                    <label className="builder-field">
                                                      <span>Height</span>
                                                      <input
                                                        type="number"
                                                        min={120}
                                                        max={900}
                                                        value={block.embedHeight ?? 260}
                                                        onChange={(event) =>
                                                          updateSelectedLayoutBlock(
                                                            index,
                                                            blockIndex,
                                                            { embedHeight: Number(event.target.value) },
                                                          )
                                                        }
                                                      />
                                                    </label>
                                                  )}

                                                  {block.kind === "grid" && (
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
                                                              { columns: Number(event.target.value) },
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
                                                          value={block.gridRows ?? 1}
                                                          onChange={(event) =>
                                                            updateSelectedLayoutBlock(
                                                              index,
                                                              blockIndex,
                                                              { gridRows: Number(event.target.value) },
                                                            )
                                                          }
                                                        />
                                                      </label>
                                                    </div>
                                                  )}

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
                                                            { columns: Number(event.target.value) },
                                                          )
                                                        }
                                                      />
                                                    </label>
                                                  )}
                                                </details>
                                              )}

                                              {block.kind === "products" && (
                                                <>
                                                  {isElementLayoutTab && (
                                                  <details className="builder-collapse" open>
                                                    <summary>
                                                      <span>Products Layout</span>
                                                      <small>{block.layoutVariant ?? "grid"}</small>
                                                    </summary>

                                                    <div className="builder-two-column">
                                                      <label className="builder-field">
                                                        <span>Layout Variant</span>
                                                        <select
                                                          value={block.layoutVariant ?? "grid"}
                                                          onChange={(event) =>
                                                            updateSelectedLayoutBlock(
                                                              index,
                                                              blockIndex,
                                                              {
                                                                layoutVariant: event.target
                                                                  .value as BuilderLayoutBlock["layoutVariant"],
                                                              },
                                                            )
                                                          }
                                                        >
                                                          <option value="grid">Grid</option>
                                                          <option value="carousel">Carousel</option>
                                                        </select>
                                                      </label>
                                                      {block.layoutVariant !== "carousel" && (
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
                                                                { columns: Number(event.target.value) },
                                                              )
                                                            }
                                                          />
                                                        </label>
                                                      )}
                                                    </div>

                                                    <div className="builder-two-column">
                                                      <label className="builder-field">
                                                        <span>Content Align</span>
                                                        <select
                                                          value={block.elementAlign ?? "left"}
                                                          onChange={(event) =>
                                                            updateSelectedLayoutBlock(
                                                              index,
                                                              blockIndex,
                                                              {
                                                                elementAlign: event.target
                                                                  .value as BuilderLayoutBlock["elementAlign"],
                                                              },
                                                            )
                                                          }
                                                        >
                                                          <option value="left">Left</option>
                                                          <option value="center">Center</option>
                                                          <option value="right">Right</option>
                                                        </select>
                                                      </label>
                                                    </div>

                                                    {block.layoutVariant !== "carousel" && (
                                                    <label className="builder-field">
                                                        <span>Filter Position</span>
                                                        <select
                                                          value={block.filterPosition ?? "left"}
                                                          onChange={(event) =>
                                                            updateSelectedLayoutBlock(
                                                              index,
                                                              blockIndex,
                                                              {
                                                                filterPosition: event.target
                                                                  .value as BuilderLayoutBlock["filterPosition"],
                                                              },
                                                            )
                                                          }
                                                        >
                                                          <option value="left">Left sidebar</option>
                                                          <option value="top">Top pills</option>
                                                          <option value="drawer">Drawer</option>
                                                          <option value="hidden">Hidden</option>
                                                        </select>
                                                      </label>
                                                    )}
                                                  </details>
                                                  )}

                                                </>
                                              )}
                                            </>
                                          )}

                                          {isSelectedBlock &&
                                            isElementSettingsTab && (
                                            <>
                                              {block.kind !== "products" && (
                                                <details className="builder-collapse" open>
                                                  <summary>
                                                    <span>Element appearance</span>
                                                    <small>
                                                      {block.panelStyle ?? "default"}
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
                                                </details>
                                              )}

                                              {block.kind === "hero" && (
                                                <label className="builder-field">
                                                  <span>Hero Variant</span>
                                                  <select
                                                    value={block.carouselSettings?.variant ?? "default"}
                                                    onChange={(event) =>
                                                      updateSelectedLayoutBlock(
                                                        index,
                                                        blockIndex,
                                                        {
                                                          carouselSettings: {
                                                            ...(block.carouselSettings ?? {}),
                                                            variant: event.target.value,
                                                          },
                                                        },
                                                      )
                                                    }
                                                  >
                                                    <option value="default">Default Hero Style</option>
                                                    <option value="antigravity">Antigravity Canvas Background</option>
                                                  </select>
                                                </label>
                                              )}

                                              {block.kind === "products" && (
                                                <>
                                                  <details className="builder-collapse" open>
                                                    <summary>
                                                      <span>Card Design</span>
                                                      <small>
                                                        {block.cardPreset ?? "standard"} · {block.cardStyle ?? "flat"}
                                                      </small>
                                                    </summary>
                                                    <label className="builder-field">
                                                      <span>Card Preset</span>
                                                      <select
                                                        value={block.cardPreset ?? "standard"}
                                                        onChange={(event) =>
                                                          updateSelectedLayoutBlock(
                                                            index,
                                                            blockIndex,
                                                            {
                                                              cardPreset: event.target
                                                                .value as BuilderLayoutBlock["cardPreset"],
                                                            },
                                                          )
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
                                                        <span>Card Style</span>
                                                        <select
                                                          value={block.cardStyle ?? "flat"}
                                                          onChange={(event) =>
                                                            updateSelectedLayoutBlock(
                                                              index,
                                                              blockIndex,
                                                              {
                                                                cardStyle: event.target
                                                                  .value as BuilderLayoutBlock["cardStyle"],
                                                              },
                                                            )
                                                          }
                                                        >
                                                          <option value="flat">Flat</option>
                                                          <option value="soft">Soft</option>
                                                          <option value="lined">Lined</option>
                                                          <option value="none">No background</option>
                                                        </select>
                                                      </label>
                                                      <label className="builder-field">
                                                        <span>Image Frame</span>
                                                        <select
                                                          value={block.gridImageFrame ?? "none"}
                                                          onChange={(event) =>
                                                            updateSelectedLayoutBlock(
                                                              index,
                                                              blockIndex,
                                                              {
                                                                gridImageFrame: event.target
                                                                  .value as BuilderLayoutBlock["gridImageFrame"],
                                                              },
                                                            )
                                                          }
                                                        >
                                                          <option value="none">No frame</option>
                                                          <option value="soft">Soft surface</option>
                                                        </select>
                                                      </label>
                                                    </div>
                                                    <label className="builder-field">
                                                      <span>Card Theme</span>
                                                      <select
                                                        value={block.panelStyle ?? "default"}
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
                                                        {panelStyleOptions.map((option) => (
                                                          <option
                                                            key={option.value}
                                                            value={option.value}
                                                          >
                                                            {option.label}
                                                          </option>
                                                        ))}
                                                      </select>
                                                    </label>
                                                    <label className="builder-field">
                                                      <span>Border Radius</span>
                                                      <select
                                                        value={
                                                          block.borderRadius === undefined
                                                            ? "inherit"
                                                            : [0, 4, 8, 12, 16, 24].includes(block.borderRadius)
                                                              ? String(block.borderRadius)
                                                              : "custom"
                                                        }
                                                        onChange={(event) => {
                                                          const val = event.target.value;
                                                          if (val === "inherit") {
                                                            updateSelectedLayoutBlock(index, blockIndex, { borderRadius: undefined });
                                                          } else if (val === "custom") {
                                                            updateSelectedLayoutBlock(index, blockIndex, { borderRadius: 10 });
                                                          } else {
                                                            updateSelectedLayoutBlock(index, blockIndex, { borderRadius: Number(val) });
                                                          }
                                                        }}
                                                      >
                                                        <option value="inherit">Inherit (global settings)</option>
                                                        <option value="0">Flat (0px)</option>
                                                        <option value="4">Small (4px)</option>
                                                        <option value="8">Medium (8px)</option>
                                                        <option value="12">Rounded (12px)</option>
                                                        <option value="16">Large (16px)</option>
                                                        <option value="24">Extra Large (24px)</option>
                                                        <option value="custom">Custom...</option>
                                                      </select>
                                                    </label>
                                                    {block.borderRadius !== undefined && ![0, 4, 8, 12, 16, 24].includes(block.borderRadius) && (
                                                      <label className="builder-field">
                                                        <span>Custom Radius (px)</span>
                                                        <input
                                                          type="number"
                                                          min={0}
                                                          max={100}
                                                          value={block.borderRadius}
                                                          onChange={(event) => {
                                                            const val = event.target.value === "" ? 0 : Number(event.target.value);
                                                            updateSelectedLayoutBlock(index, blockIndex, { borderRadius: val });
                                                          }}
                                                        />
                                                      </label>
                                                    )}
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
                                                        <option value="default">Use card preset default</option>
                                                        <option value="transparent">Transparent</option>
                                                        <option value="custom">Custom color</option>
                                                      </select>
                                                    </label>
                                                    {block.elementBackgroundMode === "custom" && (
                                                      <label className="builder-field">
                                                        <span>Background Color</span>
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
                                                  </details>

                                                  <details className="builder-collapse" open>
                                                    <summary>
                                                      <span>Card Spacing &amp; Image</span>
                                                      <small>gap, card &amp; image</small>
                                                    </summary>
                                                    <div className="builder-two-column">
                                                      <label className="builder-field">
                                                        <span>Item Gap</span>
                                                        <select
                                                          value={block.gridGap ?? "medium"}
                                                          onChange={(event) =>
                                                            updateSelectedLayoutBlock(
                                                              index,
                                                              blockIndex,
                                                              {
                                                                gridGap: event.target
                                                                  .value as BuilderLayoutBlock["gridGap"],
                                                              },
                                                            )
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
                                                          value={block.cardPadding ?? "medium"}
                                                          onChange={(event) =>
                                                            updateSelectedLayoutBlock(index, blockIndex, {
                                                              cardPadding: event.target.value as BuilderLayoutBlock["cardPadding"],
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
                                                        value={block.imagePadding ?? "large"}
                                                        onChange={(event) =>
                                                          updateSelectedLayoutBlock(index, blockIndex, {
                                                            imagePadding: event.target.value as BuilderLayoutBlock["imagePadding"],
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
                                                    <div className="builder-two-column">
                                                      <label className="builder-field">
                                                        <span>Image Fit</span>
                                                        <select
                                                          value={block.imageFit ?? "preset"}
                                                          onChange={(event) =>
                                                            updateSelectedLayoutBlock(
                                                              index,
                                                              blockIndex,
                                                              {
                                                                imageFit:
                                                                  event.target.value === "preset"
                                                                    ? undefined
                                                                    : (event.target.value as BuilderLayoutBlock["imageFit"]),
                                                              },
                                                            )
                                                          }
                                                        >
                                                          <option value="preset">Preset default</option>
                                                          <option value="contain">Contain</option>
                                                          <option value="cover">Cover</option>
                                                          <option value="fill">Fill / stretch</option>
                                                        </select>
                                                      </label>
                                                      <label className="builder-field">
                                                        <span>Image Ratio</span>
                                                        <select
                                                          value={block.imageRatio ?? "auto"}
                                                          onChange={(event) =>
                                                            updateSelectedLayoutBlock(
                                                              index,
                                                              blockIndex,
                                                              {
                                                                imageRatio: event.target
                                                                  .value as BuilderLayoutBlock["imageRatio"],
                                                              },
                                                            )
                                                          }
                                                        >
                                                          <option value="auto">Auto / preset</option>
                                                          <option value="square">Square (1:1)</option>
                                                          <option value="4:5">Portrait (4:5)</option>
                                                          <option value="3:4">Portrait (3:4)</option>
                                                        </select>
                                                      </label>
                                                    </div>
                                                  </details>

                                                  <details className="builder-collapse" open>
                                                    <summary>
                                                      <span>Add To Cart Button</span>
                                                      <small>
                                                        {block.addToCartStyle ?? "blue"}
                                                      </small>
                                                    </summary>
                                                    <div className="builder-two-column">
                                                      <label className="builder-field">
                                                        <span>Button Color</span>
                                                        <select
                                                          value={block.addToCartStyle ?? "blue"}
                                                          onChange={(event) =>
                                                            updateSelectedLayoutBlock(
                                                              index,
                                                              blockIndex,
                                                              {
                                                                addToCartStyle: event.target
                                                                  .value as BuilderLayoutBlock["addToCartStyle"],
                                                              },
                                                            )
                                                          }
                                                        >
                                                          <option value="blue">Publish blue</option>
                                                          <option value="dark">Dark</option>
                                                          <option value="light">Light</option>
                                                          <option value="inherit">Theme button</option>
                                                        </select>
                                                      </label>
                                                      <label className="builder-field">
                                                        <span>Button Size</span>
                                                        <select
                                                          value={block.addToCartSize ?? "medium"}
                                                          onChange={(event) =>
                                                            updateSelectedLayoutBlock(
                                                              index,
                                                              blockIndex,
                                                              {
                                                                addToCartSize: event.target
                                                                  .value as BuilderLayoutBlock["addToCartSize"],
                                                              },
                                                            )
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
                                                        <span>Button Display</span>
                                                        <select
                                                          value={block.addToCartDisplay ?? "button"}
                                                          onChange={(event) =>
                                                            updateSelectedLayoutBlock(
                                                              index,
                                                              blockIndex,
                                                              {
                                                                addToCartDisplay: event.target
                                                                  .value as BuilderLayoutBlock["addToCartDisplay"],
                                                              },
                                                            )
                                                          }
                                                        >
                                                          <option value="button">Text button</option>
                                                          <option value="icon">Cart icon</option>
                                                        </select>
                                                      </label>
                                                      <label className="builder-field">
                                                        <span>Button Visibility</span>
                                                        <select
                                                          value={block.addToCartVisibility ?? "hover"}
                                                          onChange={(event) =>
                                                            updateSelectedLayoutBlock(
                                                              index,
                                                              blockIndex,
                                                              {
                                                                addToCartVisibility: event.target
                                                                  .value as BuilderLayoutBlock["addToCartVisibility"],
                                                              },
                                                            )
                                                          }
                                                        >
                                                          <option value="hover">On hover</option>
                                                          <option value="always">Always visible</option>
                                                        </select>
                                                      </label>
                                                    </div>
                                                    <label className="builder-field">
                                                      <span>Button Position</span>
                                                      <select
                                                        value={block.addToCartPosition ?? "below"}
                                                        onChange={(event) =>
                                                          updateSelectedLayoutBlock(
                                                            index,
                                                            blockIndex,
                                                            {
                                                              addToCartPosition: event.target
                                                                .value as BuilderLayoutBlock["addToCartPosition"],
                                                            },
                                                          )
                                                        }
                                                      >
                                                        <option value="below">Below details</option>
                                                        <option value="under-price">Under price</option>
                                                        <option value="under-wishlist">Under wishlist</option>
                                                      </select>
                                                    </label>
                                                  </details>
                                                </>
                                              )}
                                            </>
                                          )}

                                          {isSelectedBlock &&
                                            isElementSpacingTab && (
                                            <>
                                              {block.kind === "grid" && (
                                                <details className="builder-collapse" open>
                                                  <summary>
                                                    <span>Internal spacing</span>
                                                    <small>items & cards</small>
                                                  </summary>
                                                  <div className="builder-two-column">
                                                    <label className="builder-field">
                                                      <span>Item Gap</span>
                                                      <select
                                                        value={block.gridGap ?? "medium"}
                                                        onChange={(event) =>
                                                          updateSelectedLayoutBlock(
                                                            index,
                                                            blockIndex,
                                                            {
                                                              gridGap: event.target
                                                                .value as BuilderLayoutBlock["gridGap"],
                                                            },
                                                          )
                                                        }
                                                      >
                                                        <option value="none">None</option>
                                                        <option value="small">Small</option>
                                                        <option value="medium">Medium</option>
                                                        <option value="large">Large</option>
                                                      </select>
                                                    </label>
                                                    <label className="builder-field">
                                                      <span>Content Padding</span>
                                                      <select
                                                        value={block.gridContentPadding ?? "medium"}
                                                        onChange={(event) =>
                                                          updateSelectedLayoutBlock(index, blockIndex, {
                                                            gridContentPadding: event.target.value as BuilderLayoutBlock["gridContentPadding"],
                                                          })
                                                        }
                                                      >
                                                        <option value="none">None</option>
                                                        <option value="small">Small</option>
                                                        <option value="medium">Medium</option>
                                                        <option value="large">Large</option>
                                                      </select>
                                                    </label>
                                                  </div>
                                                  <label className="builder-field">
                                                    <span>Image Padding</span>
                                                    <select
                                                      value={block.gridImagePadding ?? "frameless"}
                                                      onChange={(event) =>
                                                        updateSelectedLayoutBlock(index, blockIndex, {
                                                          gridImagePadding: event.target.value as BuilderLayoutBlock["gridImagePadding"],
                                                        })
                                                      }
                                                    >
                                                      <option value="frameless">Frameless</option>
                                                      <option value="small">Small</option>
                                                      <option value="medium">Medium</option>
                                                      <option value="max">Max</option>
                                                    </select>
                                                  </label>
                                                </details>
                                              )}
                                            </>
                                          )}

                                          {isSelectedBlock &&
                                            isElementSettingsTab &&
                                            block.kind !== "products" && (
                                            <>
                                              <details className="builder-collapse" open>
                                                <summary>
                                                  <span>Border radius</span>
                                                  <small>
                                                    {block.borderRadius === undefined
                                                      ? "inherit"
                                                      : block.borderRadius}
                                                  </small>
                                                </summary>
                                                <label className="builder-field">
                                                  <span>Card Border Radius</span>
                                                  <select
                                                    value={
                                                      block.borderRadius === undefined
                                                        ? "inherit"
                                                        : [0, 4, 8, 12, 16, 24].includes(block.borderRadius)
                                                          ? String(block.borderRadius)
                                                          : "custom"
                                                    }
                                                    onChange={(event) => {
                                                      const val = event.target.value;
                                                      if (val === "inherit") {
                                                        updateSelectedLayoutBlock(index, blockIndex, { borderRadius: undefined });
                                                      } else if (val === "custom") {
                                                        updateSelectedLayoutBlock(index, blockIndex, { borderRadius: 10 });
                                                      } else {
                                                        updateSelectedLayoutBlock(index, blockIndex, { borderRadius: Number(val) });
                                                      }
                                                    }}
                                                  >
                                                    <option value="inherit">Inherit (global settings)</option>
                                                    <option value="0">Flat (0px)</option>
                                                    <option value="4">Small (4px)</option>
                                                    <option value="8">Medium (8px)</option>
                                                    <option value="12">Rounded (12px)</option>
                                                    <option value="16">Large (16px)</option>
                                                    <option value="24">Extra Large (24px)</option>
                                                    <option value="custom">Custom...</option>
                                                  </select>
                                                </label>
                                                {block.borderRadius !== undefined && ![0, 4, 8, 12, 16, 24].includes(block.borderRadius) && (
                                                  <label className="builder-field">
                                                    <span>Custom Radius (px)</span>
                                                    <input
                                                      type="number"
                                                      min={0}
                                                      max={100}
                                                      value={block.borderRadius}
                                                      onChange={(event) => {
                                                        const val = event.target.value === "" ? 0 : Number(event.target.value);
                                                        updateSelectedLayoutBlock(index, blockIndex, { borderRadius: val });
                                                      }}
                                                    />
                                                  </label>
                                                )}
                                              </details>
                                            </>
                                          )}

                                          {isSelectedBlock &&
                                            isElementAdvancedTab && (
                                            <>
                                              {renderAnimationControls(block)}
                                            </>
                                          )}

                                          {isSelectedBlock &&
                                            isElementContentTab && (
                                            <>
                                          {block.kind === "button" ? (
                                            <>
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
                                                                                            <>
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
                                                          <details className="builder-collapse" style={{ order: 2, flex: "0 0 100%" }}>
                                                            <summary>
                                                              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                                                                <strong>Checklist</strong>
                                                                <small>{(gridItem.items ?? []).length} items</small>
                                                              </div>
                                                            </summary>
                                                            <label className="builder-field">
                                                              <span>Icon type</span>
                                                              <select
                                                                value={gridItem.listIcon ?? "check"}
                                                                onChange={(event) =>
                                                                  updateSelectedLayoutBlockGridItem(
                                                                    index,
                                                                    blockIndex,
                                                                    gridItemIndex,
                                                                    { listIcon: event.target.value as any }
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
                                                            <label className="builder-field">
                                                              <span>Icon Color Scheme</span>
                                                              <select
                                                                value={gridItem.listIconColorScheme ?? "default"}
                                                                onChange={(event) =>
                                                                  updateSelectedLayoutBlockGridItem(
                                                                    index,
                                                                    blockIndex,
                                                                    gridItemIndex,
                                                                    { listIconColorScheme: event.target.value as any }
                                                                  )
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
                                                                onChange={(event) =>
                                                                  updateSelectedLayoutBlockGridItem(
                                                                    index,
                                                                    blockIndex,
                                                                    gridItemIndex,
                                                                    { listIconSize: Number(event.target.value) }
                                                                  )
                                                                }
                                                              />
                                                            </label>
                                                            <div className="builder-section-heading">
                                                              <span>Checklist Items ({(gridItem.items ?? []).length})</span>
                                                            </div>
                                                            {(gridItem.items ?? []).map((item, itemIdx) => (
                                                              <label key={itemIdx} className="builder-field">
                                                                <span>Item {itemIdx + 1}</span>
                                                                <div style={{ display: "flex", gap: 4 }}>
                                                                  <input
                                                                    value={item}
                                                                    onChange={(event) => {
                                                                      const items = [...(gridItem.items ?? [])];
                                                                      items[itemIdx] = event.target.value;
                                                                      updateSelectedLayoutBlockGridItem(index, blockIndex, gridItemIndex, { items });
                                                                    }}
                                                                  />
                                                                  <button
                                                                    type="button"
                                                                    className="builder-inline-delete"
                                                                    onClick={() => {
                                                                      const items = (gridItem.items ?? []).filter((_, i) => i !== itemIdx);
                                                                      updateSelectedLayoutBlockGridItem(index, blockIndex, gridItemIndex, { items });
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
                                                                const items = [...(gridItem.items ?? []), `Item ${(gridItem.items ?? []).length + 1}`];
                                                                updateSelectedLayoutBlockGridItem(index, blockIndex, gridItemIndex, { items });
                                                              }}
                                                            >
                                                              <Plus size={15} /> Add item
                                                            </button>
                                                          </details>
                                                                                            </>
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
                                              <details className="builder-collapse" open>
                                                <summary>
                                                  <span>Product Query</span>
                                                  <small>{block.source ?? "all"}</small>
                                                </summary>
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
                                              </details>

                                              <details className="builder-collapse" open>
                                                <summary>
                                                  <span>Pagination</span>
                                                  <small>
                                                    {(block.pagination?.enabled ?? false)
                                                      ? `${block.pagination?.perPage ?? 12}/page`
                                                      : "Off"}
                                                  </small>
                                                </summary>

                                                <label className="builder-check">
                                                  <input
                                                    type="checkbox"
                                                    checked={block.pagination?.enabled ?? false}
                                                    onChange={(event) =>
                                                      updateSelectedLayoutBlock(
                                                        index,
                                                        blockIndex,
                                                        {
                                                          pagination: {
                                                            ...(block.pagination ?? {
                                                              enabled: false,
                                                              perPage: 12,
                                                              mode: "pageNumbers" as const,
                                                              infiniteScroll: false,
                                                              style: "standard" as const,
                                                            }),
                                                            enabled: event.target.checked,
                                                          },
                                                        }
                                                      )
                                                    }
                                                  />
                                                  <span>Pagination Enabled</span>
                                                </label>

                                                {(block.pagination?.enabled ?? false) && (
                                                  <>
                                                    <label className="builder-field">
                                                      <span>Products Per Page</span>
                                                      <input
                                                        type="number"
                                                        min={4}
                                                        max={48}
                                                        step={1}
                                                        value={block.pagination?.perPage ?? 12}
                                                        onChange={(event) =>
                                                          updateSelectedLayoutBlock(
                                                            index,
                                                            blockIndex,
                                                            {
                                                              pagination: {
                                                                ...(block.pagination ?? {
                                                                  enabled: true,
                                                                  perPage: 12,
                                                                  mode: "pageNumbers" as const,
                                                                  infiniteScroll: false,
                                                                  style: "standard" as const,
                                                                }),
                                                                perPage: Number(event.target.value),
                                                              },
                                                            }
                                                          )
                                                        }
                                                      />
                                                    </label>
                                                    <label className="builder-field">
                                                      <span>Pagination Type</span>
                                                      <select
                                                        value={block.pagination?.mode ?? "pageNumbers"}
                                                        onChange={(event) => {
                                                          const typeVal = event.target.value as
                                                            | "pageNumbers"
                                                            | "loadMore"
                                                            | "infinite";
                                                          updateSelectedLayoutBlock(
                                                            index,
                                                            blockIndex,
                                                            {
                                                              pagination: {
                                                                ...(block.pagination ?? {
                                                                  enabled: true,
                                                                  perPage: 12,
                                                                  mode: "pageNumbers" as const,
                                                                  infiniteScroll: false,
                                                                  style: "standard" as const,
                                                                }),
                                                                mode: typeVal,
                                                                infiniteScroll: typeVal === "infinite",
                                                              },
                                                            },
                                                          );
                                                        }}
                                                      >
                                                        <option value="pageNumbers">Page Numbers</option>
                                                        <option value="loadMore">Load More</option>
                                                        <option value="infinite">Infinite Scroll</option>
                                                      </select>
                                                    </label>
                                                    <label className="builder-field">
                                                      <span>Pagination Style</span>
                                                      <select
                                                        value={block.pagination?.style ?? "standard"}
                                                        onChange={(event) =>
                                                          updateSelectedLayoutBlock(
                                                            index,
                                                            blockIndex,
                                                            {
                                                              pagination: {
                                                                ...(block.pagination ?? {
                                                                  enabled: true,
                                                                  perPage: 12,
                                                                  mode: "pageNumbers" as const,
                                                                }),
                                                                style: event.target.value as any,
                                                              },
                                                            },
                                                          )
                                                        }
                                                      >
                                                        <option value="standard">Standard</option>
                                                        <option value="solid">Solid / Filled</option>
                                                        <option value="minimal">Minimal / Borderless</option>
                                                        <option value="rounded">Rounded Circle</option>
                                                      </select>
                                                    </label>
                                                  </>
                                                )}
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
                                          ) : (block.kind === "slider" || block.kind === "scrollPinnedDemo") ? (
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
                                              {block.kind === "scrollPinnedDemo" && (
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
                                              )}
                                              <label className="builder-field">
                                               </label>

                                               <details className="builder-collapse" open>
                                                 <summary>
                                                   <InspectorGroupSummary
                                                     title="Typewriter Text Animation"
                                                     description="Configure typewriter dynamic cycles on title/body text."
                                                     meta={block.typewriterEnabled ? "enabled" : "disabled"}
                                                   />
                                                 </summary>
                                                 <label className="builder-check" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                                                   <input
                                                     type="checkbox"
                                                     checked={block.typewriterEnabled ?? false}
                                                     onChange={(event) =>
                                                       updateSelectedLayoutBlock(
                                                         index,
                                                         blockIndex,
                                                         {
                                                           typewriterEnabled:
                                                             event.target.checked,
                                                         },
                                                       )
                                                     }
                                                   />
                                                   <span>Enable Typewriter Animation</span>
                                                 </label>

                                                 {block.typewriterEnabled && (
                                                   <div className="builder-effect-settings-subpanel" style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '10px 0' }}>
                                                     <div className="builder-contrast-note" style={{ fontSize: '12px', padding: '8px', background: 'rgba(0,0,0,0.03)', borderRadius: '4px', borderLeft: '3px solid #6366f1' }}>
                                                       <strong>Bracket format instruction:</strong> Use square brackets with pipe separators to cycle multiple phrases. Example: <code>Build the future with [dynamic animations|interactive particles|typewriter effects|premium aesthetics]</code>
                                                     </div>

                                                     <label className="builder-check" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                       <input
                                                         type="checkbox"
                                                         checked={block.typewriterLoop !== false}
                                                         onChange={(event) =>
                                                           updateSelectedLayoutBlock(
                                                             index,
                                                             blockIndex,
                                                             {
                                                               typewriterLoop:
                                                                 event.target.checked,
                                                             },
                                                           )
                                                         }
                                                       />
                                                       <span>Loop typing animation</span>
                                                     </label>

                                                     <label className="builder-field">
                                                       <span>Typing Speed (ms)</span>
                                                       <div className="builder-range-row" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                         <input
                                                           type="range"
                                                           min="30"
                                                           max="250"
                                                           step="5"
                                                           style={{ flex: 1 }}
                                                           value={block.typewriterSpeed ?? 80}
                                                           onChange={(event) =>
                                                             updateSelectedLayoutBlock(
                                                               index,
                                                               blockIndex,
                                                               {
                                                                 typewriterSpeed:
                                                                   Number(event.target.value),
                                                               },
                                                             )
                                                           }
                                                         />
                                                         <span style={{ minWidth: '40px', textAlign: 'right' }}>{block.typewriterSpeed ?? 80}ms</span>
                                                       </div>
                                                     </label>

                                                     <label className="builder-field">
                                                       <span>Erase Speed (ms)</span>
                                                       <div className="builder-range-row" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                         <input
                                                           type="range"
                                                           min="10"
                                                           max="150"
                                                           step="5"
                                                           style={{ flex: 1 }}
                                                           value={block.typewriterEraseSpeed ?? 40}
                                                           onChange={(event) =>
                                                             updateSelectedLayoutBlock(
                                                               index,
                                                               blockIndex,
                                                               {
                                                                 typewriterEraseSpeed:
                                                                   Number(event.target.value),
                                                               },
                                                             )
                                                           }
                                                         />
                                                         <span style={{ minWidth: '40px', textAlign: 'right' }}>{block.typewriterEraseSpeed ?? 40}ms</span>
                                                       </div>
                                                     </label>

                                                     <label className="builder-field">
                                                       <span>Pause Delay (ms)</span>
                                                       <div className="builder-range-row" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                         <input
                                                           type="range"
                                                           min="500"
                                                           max="5000"
                                                           step="100"
                                                           style={{ flex: 1 }}
                                                           value={block.typewriterDelay ?? 2000}
                                                           onChange={(event) =>
                                                             updateSelectedLayoutBlock(
                                                               index,
                                                               blockIndex,
                                                               {
                                                                 typewriterDelay:
                                                                   Number(event.target.value),
                                                               },
                                                             )
                                                           }
                                                         />
                                                         <span style={{ minWidth: '50px', textAlign: 'right' }}>{block.typewriterDelay ?? 2000}ms</span>
                                                       </div>
                                                     </label>

                                                     <label className="builder-check" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                       <input
                                                         type="checkbox"
                                                         checked={block.typewriterUseGradient !== false}
                                                         onChange={(event) =>
                                                           updateSelectedLayoutBlock(
                                                             index,
                                                             blockIndex,
                                                             {
                                                               typewriterUseGradient:
                                                                 event.target.checked,
                                                             },
                                                           )
                                                         }
                                                       />
                                                       <span>Use title gradient for typewriter text</span>
                                                     </label>

                                                      {block.typewriterUseGradient !== false && (
                                                        <>
                                                          <label className="builder-field">
                                                            <span>Gradient Preset Theme</span>
                                                            <select
                                                              value={block.typewriterGradientPreset ?? "indigo-purple-cyan"}
                                                              onChange={(event) =>
                                                                updateSelectedLayoutBlock(
                                                                  index,
                                                                  blockIndex,
                                                                  {
                                                                    typewriterGradientPreset:
                                                                      event.target.value,
                                                                  },
                                                                )
                                                              }
                                                            >
                                                              <option value="indigo-purple-cyan">Indigo Purple Cyan</option>
                                                              <option value="emerald-teal">Emerald Teal</option>
                                                              <option value="sunset-pink">Sunset Pink</option>
                                                              <option value="gold-amber">Gold Amber</option>
                                                              <option value="indigo-purple">Indigo Purple</option>
                                                              <option value="cyan-blue">Cyan Blue</option>
                                                              <option value="sunset-orange">Sunset Orange</option>
                                                              <option value="custom">Custom Gradient</option>
                                                            </select>
                                                          </label>
                                                          {block.typewriterGradientPreset !== "none" && (() => {
                                                            const currentPreset = block.typewriterGradientPreset ?? "indigo-purple-cyan";
                                                            const defaultColors = currentPreset !== "custom" ? (GRADIENT_PRESETS[currentPreset] ?? ["#60a5fa", "#818cf8", "#c084fc"]) : ["#ffffff", "#60a5fa", "#c084fc"];
                                                            const startColor = block.textGradientCustomStart ?? defaultColors[0];
                                                            const middleColor = block.textGradientCustomMiddle ?? defaultColors[1];
                                                            const endColor = block.textGradientCustomEnd ?? defaultColors[2];
                                                            const startOffset = block.textGradientCustomStartOffset ?? 0;
                                                            const middleOffset = block.textGradientCustomMiddleOffset ?? 50;
                                                            const endOffset = block.textGradientCustomEndOffset ?? 100;
                                                            const angle = block.textGradientCustomAngle ?? 135;

                                                            return (
                                                              <div className="builder-effect-settings-subpanel" style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '8px 0', borderLeft: '3px solid #6366f1', paddingLeft: '8px', marginTop: '8px', marginBottom: '12px' }}>
                                                                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                                                                  <label className="builder-field" style={{ flex: 1 }}>
                                                                    <span>Start Color</span>
                                                                    <input
                                                                      type="color"
                                                                      value={startColor}
                                                                      onChange={(e) => {
                                                                        const patch = getCustomGradientPatch(block, "typewriterGradientPreset", { textGradientCustomStart: e.target.value });
                                                                        updateSelectedLayoutBlock(index, blockIndex, patch);
                                                                      }}
                                                                    />
                                                                  </label>
                                                                  <label className="builder-field" style={{ flex: 1 }}>
                                                                    <span>Middle Color</span>
                                                                    <input
                                                                      type="color"
                                                                      value={middleColor}
                                                                      onChange={(e) => {
                                                                        const patch = getCustomGradientPatch(block, "typewriterGradientPreset", { textGradientCustomMiddle: e.target.value });
                                                                        updateSelectedLayoutBlock(index, blockIndex, patch);
                                                                      }}
                                                                    />
                                                                  </label>
                                                                  <label className="builder-field" style={{ flex: 1 }}>
                                                                    <span>End Color</span>
                                                                    <input
                                                                      type="color"
                                                                      value={endColor}
                                                                      onChange={(e) => {
                                                                        const patch = getCustomGradientPatch(block, "typewriterGradientPreset", { textGradientCustomEnd: e.target.value });
                                                                        updateSelectedLayoutBlock(index, blockIndex, patch);
                                                                      }}
                                                                    />
                                                                  </label>
                                                                </div>

                                                                <label className="builder-field">
                                                                  <span>Start Color Weight (Offset)</span>
                                                                  <div className="builder-range-row" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                    <input
                                                                      type="range"
                                                                      min="0"
                                                                      max="100"
                                                                      step="1"
                                                                      style={{ flex: 1 }}
                                                                      value={startOffset}
                                                                      onChange={(e) => {
                                                                        const patch = getCustomGradientPatch(block, "typewriterGradientPreset", { textGradientCustomStartOffset: Number(e.target.value) });
                                                                        updateSelectedLayoutBlock(index, blockIndex, patch);
                                                                      }}
                                                                    />
                                                                    <span style={{ minWidth: '40px', textAlign: 'right' }}>{startOffset}%</span>
                                                                  </div>
                                                                </label>

                                                                <label className="builder-field">
                                                                  <span>Middle Color Weight (Offset)</span>
                                                                  <div className="builder-range-row" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                    <input
                                                                      type="range"
                                                                      min="0"
                                                                      max="100"
                                                                      step="1"
                                                                      style={{ flex: 1 }}
                                                                      value={middleOffset}
                                                                      onChange={(e) => {
                                                                        const patch = getCustomGradientPatch(block, "typewriterGradientPreset", { textGradientCustomMiddleOffset: Number(e.target.value) });
                                                                        updateSelectedLayoutBlock(index, blockIndex, patch);
                                                                      }}
                                                                    />
                                                                    <span style={{ minWidth: '40px', textAlign: 'right' }}>{middleOffset}%</span>
                                                                  </div>
                                                                </label>

                                                                <label className="builder-field">
                                                                  <span>End Color Weight (Offset)</span>
                                                                  <div className="builder-range-row" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                    <input
                                                                      type="range"
                                                                      min="0"
                                                                      max="100"
                                                                      step="1"
                                                                      style={{ flex: 1 }}
                                                                      value={endOffset}
                                                                      onChange={(e) => {
                                                                        const patch = getCustomGradientPatch(block, "typewriterGradientPreset", { textGradientCustomEndOffset: Number(e.target.value) });
                                                                        updateSelectedLayoutBlock(index, blockIndex, patch);
                                                                      }}
                                                                    />
                                                                    <span style={{ minWidth: '40px', textAlign: 'right' }}>{endOffset}%</span>
                                                                  </div>
                                                                </label>

                                                                <label className="builder-field">
                                                                  <span>Angle (degrees)</span>
                                                                  <div className="builder-range-row" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                    <input
                                                                      type="range"
                                                                      min="0"
                                                                      max="360"
                                                                      step="5"
                                                                      style={{ flex: 1 }}
                                                                      value={angle}
                                                                      onChange={(e) => {
                                                                        const patch = getCustomGradientPatch(block, "typewriterGradientPreset", { textGradientCustomAngle: Number(e.target.value) });
                                                                        updateSelectedLayoutBlock(index, blockIndex, patch);
                                                                      }}
                                                                    />
                                                                    <span style={{ minWidth: '40px', textAlign: 'right' }}>{angle}°</span>
                                                                  </div>
                                                                </label>
                                                              </div>
                                                            );
                                                          })()}
                                                        </>
                                                      )}
                                                   </div>
                                                 )}
                                               </details>
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
                                              {block.kind === "scrollPinnedDemo" && (
                                                <details className="builder-collapse" open>
                                                  <summary>
                                                    <InspectorGroupSummary
                                                      title="Scroll Behavior"
                                                      description="Control scroll speed, pin duration, and animation style."
                                                      meta={`${(block.carouselSettings as any)?.scrubSpeed ?? 1.2}× speed`}
                                                    />
                                                  </summary>

                                                  <label className="builder-field">
                                                    <span>Animation Variant</span>
                                                    <select
                                                      value={
                                                        (block.carouselSettings as any)?.variant ??
                                                        "perfect"
                                                      }
                                                      onChange={(event) =>
                                                        updateSelectedLayoutBlock(
                                                          index,
                                                          blockIndex,
                                                          {
                                                            carouselSettings: {
                                                              ...(block.carouselSettings ?? {}),
                                                              variant: event.target.value,
                                                            },
                                                          },
                                                        )
                                                      }
                                                    >
                                                      <option value="perfect">Perfect (Stack)</option>
                                                      <option value="fade">Fade</option>
                                                      <option value="slide">Slide</option>
                                                    </select>
                                                  </label>

                                                  <label className="builder-field">
                                                    <span>Scrub Speed</span>
                                                    <div className="builder-range-row" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                      <input
                                                        type="range"
                                                        min="0.1"
                                                        max="5.0"
                                                        step="0.1"
                                                        style={{ flex: 1 }}
                                                        value={(block.carouselSettings as any)?.scrubSpeed ?? 1.2}
                                                        onChange={(event) =>
                                                          updateSelectedLayoutBlock(
                                                            index,
                                                            blockIndex,
                                                            {
                                                              carouselSettings: {
                                                                ...(block.carouselSettings ?? {}),
                                                                scrubSpeed: Number(event.target.value),
                                                              },
                                                            },
                                                          )
                                                        }
                                                      />
                                                      <span style={{ minWidth: '40px', textAlign: 'right' }}>{((block.carouselSettings as any)?.scrubSpeed ?? 1.2).toFixed(1)}×</span>
                                                    </div>
                                                  </label>

                                                  <label className="builder-field">
                                                    <span>Pin Height Factor</span>
                                                    <div className="builder-range-row" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                      <input
                                                        type="range"
                                                        min="20"
                                                        max="500"
                                                        step="10"
                                                        style={{ flex: 1 }}
                                                        value={(block.carouselSettings as any)?.pinHeightFactor ?? 100}
                                                        onChange={(event) =>
                                                          updateSelectedLayoutBlock(
                                                            index,
                                                            blockIndex,
                                                            {
                                                              carouselSettings: {
                                                                ...(block.carouselSettings ?? {}),
                                                                pinHeightFactor: Number(event.target.value),
                                                              },
                                                            },
                                                          )
                                                        }
                                                      />
                                                      <span style={{ minWidth: '40px', textAlign: 'right' }}>{(block.carouselSettings as any)?.pinHeightFactor ?? 100}%</span>
                                                    </div>
                                                  </label>

                                                  <label className="builder-check">
                                                    <input
                                                      type="checkbox"
                                                      checked={(block.carouselSettings as any)?.showNavigation ?? true}
                                                      onChange={(event) =>
                                                        updateSelectedLayoutBlock(
                                                          index,
                                                          blockIndex,
                                                          {
                                                            carouselSettings: {
                                                              ...(block.carouselSettings ?? {}),
                                                              showNavigation: event.target.checked,
                                                            },
                                                          },
                                                        )
                                                      }
                                                    />
                                                    <span>Show Navigation</span>
                                                  </label>
                                                </details>
                                              )}
                                              {block.kind === "scrollPinnedDemo" && (
                                                <details className="builder-collapse">
                                                  <summary>
                                                    <InspectorGroupSummary
                                                      title="Checklist"
                                                      description="Add checklist items to this storytelling block."
                                                      meta={`${(block.items ?? []).length} item${(block.items ?? []).length !== 1 ? "s" : ""}`}
                                                    />
                                                  </summary>
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
                                                  <label className="builder-field">
                                                    <span>Icon Color Scheme</span>
                                                    <select
                                                      value={block.listIconColorScheme ?? "default"}
                                                      onChange={(event) =>
                                                        updateSelectedLayoutBlock(
                                                          index,
                                                          blockIndex,
                                                          { listIconColorScheme: event.target.value as any },
                                                        )
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
                                                      value={block.listIconSize ?? 16}
                                                      onChange={(event) =>
                                                        updateSelectedLayoutBlock(
                                                          index,
                                                          blockIndex,
                                                          { listIconSize: Number(event.target.value) },
                                                        )
                                                      }
                                                    />
                                                  </label>
                                                  <div className="builder-section-heading">
                                                    <span>Checklist Items ({(block.items ?? []).length})</span>
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
                                                </details>
                                              )}
                                              {block.kind === "slider" && (
                                                <>
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
                                            </>)}
                                            <div className="builder-section-heading">
                                              <span>
                                                {block.kind === "slider"
                                                  ? "Slider Slides"
                                                  : "Story Slides"}
                                              </span>
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
                                                                                          <>
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
                                                           <details className="builder-collapse" style={{ order: 2, flex: "0 0 100%" }}>
                                                             <summary>
                                                               <InspectorGroupSummary
                                                                 title="Checklist"
                                                                 description="Add checklist items to this slide."
                                                                 meta={`${(slide.items ?? []).length} item${(slide.items ?? []).length !== 1 ? "s" : ""}`}
                                                               />
                                                             </summary>
                                                             <label className="builder-field">
                                                               <span>Icon type</span>
                                                               <select
                                                                 value={slide.listIcon ?? "check"}
                                                                 onChange={(event) =>
                                                                   updateSelectedLayoutBlockSlide(index, blockIndex, slideIndex, { listIcon: event.target.value as any })
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
                                                                 onChange={(event) =>
                                                                   updateSelectedLayoutBlockSlide(index, blockIndex, slideIndex, { listIconColorScheme: event.target.value as any })
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
                                                                 onChange={(event) =>
                                                                   updateSelectedLayoutBlockSlide(index, blockIndex, slideIndex, { listIconSize: Number(event.target.value) })
                                                                 }
                                                               />
                                                             </label>
                                                             <div className="builder-section-heading">
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
                                                                       updateSelectedLayoutBlockSlide(index, blockIndex, slideIndex, { items });
                                                                     }}
                                                                   />
                                                                   <button
                                                                     type="button"
                                                                     className="builder-inline-delete"
                                                                     onClick={() => {
                                                                       const items = (slide.items ?? []).filter((_, i) => i !== itemIdx);
                                                                       updateSelectedLayoutBlockSlide(index, blockIndex, slideIndex, { items });
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
                                                                 updateSelectedLayoutBlockSlide(index, blockIndex, slideIndex, { items });
                                                               }}
                                                             >
                                                               <Plus size={15} /> Add item
                                                             </button>
                                                           </details>
                                                                                          </>
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
                                                    onChange={(event) => {
                                                      const newLevel = event.target.value as "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
                                                      const currentTyp = block.typography ?? {};
                                                      let updatedTyp = { ...currentTyp };
                                                      if ((updatedTyp as any).title) {
                                                        updatedTyp = {
                                                          ...updatedTyp,
                                                          title: {
                                                            ...((updatedTyp as any).title ?? {}),
                                                            fontSize: "",
                                                            fontWeight: "",
                                                            lineHeight: "",
                                                          }
                                                        };
                                                      } else {
                                                        updatedTyp = {
                                                          ...updatedTyp,
                                                          fontSize: "",
                                                          fontWeight: "",
                                                          lineHeight: "",
                                                        };
                                                      }
                                                      updateSelectedLayoutBlock(
                                                        index,
                                                        blockIndex,
                                                        {
                                                          headingLevel: newLevel,
                                                          typography: updatedTyp,
                                                        },
                                                      );
                                                    }}
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
                                                <span>Heading Gradient Preset</span>
                                                <select
                                                value={block.textGradientPreset ?? "none"}
                                                onChange={(event) =>
                                                updateSelectedLayoutBlock(
                                                index,
                                                blockIndex,
                                                { textGradientPreset: event.target.value as any },
                                                )
                                                }
                                                >
                                                <option value="none">None (Solid color)</option>
                                                <option value="indigo-purple">Indigo Purple</option>
                                                <option value="cyan-blue">Cyan Blue</option>
                                                <option value="emerald-teal">Emerald Teal</option>
                                                <option value="sunset-orange">Sunset Orange</option>
                                                <option value="indigo-purple-cyan">Indigo Purple Cyan</option>
                                                <option value="sunset-pink">Sunset Pink</option>
                                                <option value="gold-amber">Gold Amber</option>
                                                <option value="custom">Custom Gradient</option>
                                                </select>
                                                </label>

                                                {block.textGradientPreset && block.textGradientPreset !== "none" && (() => {
                                                const currentPreset = block.textGradientPreset;
                                                const defaultColors = currentPreset !== "custom" ? (GRADIENT_PRESETS[currentPreset] ?? ["#ffffff", "#60a5fa", "#c084fc"]) : ["#ffffff", "#60a5fa", "#c084fc"];
                                                const startColor = block.textGradientCustomStart ?? defaultColors[0];
                                                const middleColor = block.textGradientCustomMiddle ?? defaultColors[1];
                                                const endColor = block.textGradientCustomEnd ?? defaultColors[2];
                                                const startOffset = block.textGradientCustomStartOffset ?? 0;
                                                const middleOffset = block.textGradientCustomMiddleOffset ?? 50;
                                                const endOffset = block.textGradientCustomEndOffset ?? 100;
                                                const angle = block.textGradientCustomAngle ?? 135;

                                                return (
                                                <div className="builder-effect-settings-subpanel" style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '8px 0', borderLeft: '3px solid #6366f1', paddingLeft: '8px', marginBottom: '12px' }}>
                                                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                                                <label className="builder-field" style={{ flex: 1 }}>
                                                <span>Start Color</span>
                                                <input
                                                type="color"
                                                value={startColor}
                                                onChange={(e) => {
                                                const patch = getCustomGradientPatch(block, "textGradientPreset", { textGradientCustomStart: e.target.value });
                                                updateSelectedLayoutBlock(index, blockIndex, patch);
                                                }}
                                                />
                                                </label>
                                                <label className="builder-field" style={{ flex: 1 }}>
                                                <span>Middle Color</span>
                                                <input
                                                type="color"
                                                value={middleColor}
                                                onChange={(e) => {
                                                const patch = getCustomGradientPatch(block, "textGradientPreset", { textGradientCustomMiddle: e.target.value });
                                                updateSelectedLayoutBlock(index, blockIndex, patch);
                                                }}
                                                />
                                                </label>
                                                <label className="builder-field" style={{ flex: 1 }}>
                                                <span>End Color</span>
                                                <input
                                                type="color"
                                                value={endColor}
                                                onChange={(e) => {
                                                const patch = getCustomGradientPatch(block, "textGradientPreset", { textGradientCustomEnd: e.target.value });
                                                updateSelectedLayoutBlock(index, blockIndex, patch);
                                                }}
                                                />
                                                </label>
                                                </div>

                                                <label className="builder-field">
                                                <span>Start Color Weight (Offset)</span>
                                                <div className="builder-range-row" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <input
                                                type="range"
                                                min="0"
                                                max="100"
                                                step="1"
                                                style={{ flex: 1 }}
                                                value={startOffset}
                                                onChange={(e) => {
                                                const patch = getCustomGradientPatch(block, "textGradientPreset", { textGradientCustomStartOffset: Number(e.target.value) });
                                                updateSelectedLayoutBlock(index, blockIndex, patch);
                                                }}
                                                />
                                                <span style={{ minWidth: '40px', textAlign: 'right' }}>{startOffset}%</span>
                                                </div>
                                                </label>

                                                <label className="builder-field">
                                                <span>Middle Color Weight (Offset)</span>
                                                <div className="builder-range-row" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <input
                                                type="range"
                                                min="0"
                                                max="100"
                                                step="1"
                                                style={{ flex: 1 }}
                                                value={middleOffset}
                                                onChange={(e) => {
                                                const patch = getCustomGradientPatch(block, "textGradientPreset", { textGradientCustomMiddleOffset: Number(e.target.value) });
                                                updateSelectedLayoutBlock(index, blockIndex, patch);
                                                }}
                                                />
                                                <span style={{ minWidth: '40px', textAlign: 'right' }}>{middleOffset}%</span>
                                                </div>
                                                </label>

                                                <label className="builder-field">
                                                <span>End Color Weight (Offset)</span>
                                                <div className="builder-range-row" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <input
                                                type="range"
                                                min="0"
                                                max="100"
                                                step="1"
                                                style={{ flex: 1 }}
                                                value={endOffset}
                                                onChange={(e) => {
                                                const patch = getCustomGradientPatch(block, "textGradientPreset", { textGradientCustomEndOffset: Number(e.target.value) });
                                                updateSelectedLayoutBlock(index, blockIndex, patch);
                                                }}
                                                />
                                                <span style={{ minWidth: '40px', textAlign: 'right' }}>{endOffset}%</span>
                                                </div>
                                                </label>

                                                <label className="builder-field">
                                                <span>Angle (degrees)</span>
                                                <div className="builder-range-row" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <input
                                                type="range"
                                                min="0"
                                                max="360"
                                                step="5"
                                                style={{ flex: 1 }}
                                                value={angle}
                                                onChange={(e) => {
                                                const patch = getCustomGradientPatch(block, "textGradientPreset", { textGradientCustomAngle: Number(e.target.value) });
                                                updateSelectedLayoutBlock(index, blockIndex, patch);
                                                }}
                                                />
                                                <span style={{ minWidth: '40px', textAlign: 'right' }}>{angle}°</span>
                                                </div>
                                                </label>
                                                </div>
                                                );
                                                })()}

                                                <details className="builder-collapse">
                                                <summary>
                                                <InspectorGroupSummary
                                                title="Typewriter Text Animation"
                                                description="Configure typewriter dynamic cycles on title/body text."
                                                meta={block.typewriterEnabled ? "enabled" : "disabled"}
                                                />
                                                </summary>
                                                <label className="builder-check" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                                                <input
                                                type="checkbox"
                                                checked={block.typewriterEnabled ?? false}
                                                onChange={(event) =>
                                                updateSelectedLayoutBlock(
                                                index,
                                                blockIndex,
                                                {
                                                typewriterEnabled:
                                                event.target.checked,
                                                },
                                                )
                                                }
                                                />
                                                <span>Enable Typewriter Animation</span>
                                                </label>

                                                {block.typewriterEnabled && (
                                                <div className="builder-effect-settings-subpanel" style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '10px 0' }}>
                                                <div className="builder-contrast-note" style={{ fontSize: '12px', padding: '8px', background: 'rgba(0,0,0,0.03)', borderRadius: '4px', borderLeft: '3px solid #6366f1' }}>
                                                <strong>Bracket format instruction:</strong> Use square brackets with pipe separators to cycle multiple phrases. Example: <code>Build the future with [dynamic animations|interactive particles|typewriter effects|premium aesthetics]</code>
                                                </div>

                                                <label className="builder-check" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <input
                                                type="checkbox"
                                                checked={block.typewriterLoop !== false}
                                                onChange={(event) =>
                                                updateSelectedLayoutBlock(
                                                index,
                                                blockIndex,
                                                {
                                                typewriterLoop:
                                                event.target.checked,
                                                },
                                                )
                                                }
                                                />
                                                <span>Loop typing animation</span>
                                                </label>

                                                <label className="builder-field">
                                                <span>Typing Speed (ms)</span>
                                                <div className="builder-range-row" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <input
                                                type="range"
                                                min="30"
                                                max="250"
                                                step="5"
                                                style={{ flex: 1 }}
                                                value={block.typewriterSpeed ?? 80}
                                                onChange={(event) =>
                                                updateSelectedLayoutBlock(
                                                index,
                                                blockIndex,
                                                {
                                                typewriterSpeed:
                                                Number(event.target.value),
                                                },
                                                )
                                                }
                                                />
                                                <span style={{ minWidth: '40px', textAlign: 'right' }}>{block.typewriterSpeed ?? 80}ms</span>
                                                </div>
                                                </label>

                                                <label className="builder-field">
                                                <span>Erase Speed (ms)</span>
                                                <div className="builder-range-row" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <input
                                                type="range"
                                                min="10"
                                                max="150"
                                                step="5"
                                                style={{ flex: 1 }}
                                                value={block.typewriterEraseSpeed ?? 40}
                                                onChange={(event) =>
                                                updateSelectedLayoutBlock(
                                                index,
                                                blockIndex,
                                                {
                                                typewriterEraseSpeed:
                                                Number(event.target.value),
                                                },
                                                )
                                                }
                                                />
                                                <span style={{ minWidth: '40px', textAlign: 'right' }}>{block.typewriterEraseSpeed ?? 40}ms</span>
                                                </div>
                                                </label>

                                                <label className="builder-field">
                                                <span>Pause Delay (ms)</span>
                                                <div className="builder-range-row" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <input
                                                type="range"
                                                min="500"
                                                max="5000"
                                                step="100"
                                                style={{ flex: 1 }}
                                                value={block.typewriterDelay ?? 2000}
                                                onChange={(event) =>
                                                updateSelectedLayoutBlock(
                                                index,
                                                blockIndex,
                                                {
                                                typewriterDelay:
                                                Number(event.target.value),
                                                },
                                                )
                                                }
                                                />
                                                <span style={{ minWidth: '50px', textAlign: 'right' }}>{block.typewriterDelay ?? 2000}ms</span>
                                                </div>
                                                </label>

                                                <label className="builder-check" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <input
                                                type="checkbox"
                                                checked={block.typewriterUseGradient !== false}
                                                onChange={(event) =>
                                                updateSelectedLayoutBlock(
                                                index,
                                                blockIndex,
                                                {
                                                typewriterUseGradient:
                                                event.target.checked,
                                                },
                                                )
                                                }
                                                />
                                                <span>Use title gradient for typewriter text</span>
                                                </label>
                                                </div>
                                                )}
                                                </details>
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
                                                                                        <>
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
                                                       <details className="builder-collapse" style={{ order: 2, flex: "0 0 100%" }}>
                                                         <summary>
                                                           <InspectorGroupSummary
                                                             title="Checklist"
                                                             description="Add checklist items to this badge."
                                                             meta={`${(badge.items ?? []).length} item${(badge.items ?? []).length !== 1 ? "s" : ""}`}
                                                           />
                                                         </summary>
                                                         <label className="builder-field">
                                                           <span>Icon type</span>
                                                           <select
                                                             value={badge.listIcon ?? "check"}
                                                             onChange={(event) =>
                                                               updateSelectedLayoutBlockBadge(index, blockIndex, badgeIndex, { listIcon: event.target.value as any })
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
                                                               updateSelectedLayoutBlockBadge(index, blockIndex, badgeIndex, { listIconColorScheme: event.target.value as any })
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
                                                               updateSelectedLayoutBlockBadge(index, blockIndex, badgeIndex, { listIconSize: Number(event.target.value) })
                                                             }
                                                           />
                                                         </label>
                                                         <div className="builder-section-heading">
                                                           <span>Checklist Items ({(badge.items ?? []).length})</span>
                                                         </div>
                                                         {(badge.items ?? []).map((item, itemIdx) => (
                                                           <label key={itemIdx} className="builder-field">
                                                             <span>Item {itemIdx + 1}</span>
                                                             <div style={{ display: "flex", gap: 4 }}>
                                                               <input
                                                                 value={item}
                                                                 onChange={(event) => {
                                                                   const items = [...(badge.items ?? [])];
                                                                   items[itemIdx] = event.target.value;
                                                                   updateSelectedLayoutBlockBadge(index, blockIndex, badgeIndex, { items });
                                                                 }}
                                                               />
                                                               <button
                                                                 type="button"
                                                                 className="builder-inline-delete"
                                                                 onClick={() => {
                                                                   const items = (badge.items ?? []).filter((_, i) => i !== itemIdx);
                                                                   updateSelectedLayoutBlockBadge(index, blockIndex, badgeIndex, { items });
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
                                                             const items = [...(badge.items ?? []), `Item ${(badge.items ?? []).length + 1}`];
                                                             updateSelectedLayoutBlockBadge(index, blockIndex, badgeIndex, { items });
                                                           }}
                                                         >
                                                           <Plus size={15} /> Add item
                                                         </button>
                                                       </details>
                                                                                        </>
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

                                               <details className="builder-collapse">
                                                 <summary>
                                                   <InspectorGroupSummary
                                                     title="Checklist"
                                                     description="Add checklist items to this panel block."
                                                     meta={`${(block.items ?? []).length} item${(block.items ?? []).length !== 1 ? "s" : ""}`}
                                                   />
                                                 </summary>
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
                                                 <label className="builder-field">
                                                   <span>Icon Color Scheme</span>
                                                   <select
                                                     value={block.listIconColorScheme ?? "default"}
                                                     onChange={(event) =>
                                                       updateSelectedLayoutBlock(
                                                         index,
                                                         blockIndex,
                                                         { listIconColorScheme: event.target.value as any },
                                                       )
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
                                                     value={block.listIconSize ?? 16}
                                                     onChange={(event) =>
                                                       updateSelectedLayoutBlock(
                                                         index,
                                                         blockIndex,
                                                         { listIconSize: Number(event.target.value) },
                                                       )
                                                     }
                                                   />
                                                 </label>
                                                 <div className="builder-section-heading">
                                                   <span>Checklist Items ({(block.items ?? []).length})</span>
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
                                               </details>                                            </>
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
                                              <span>Title Gradient Preset</span>
                                              <select
                                              value={block.textGradientPreset ?? "none"}
                                              onChange={(event) =>
                                              updateSelectedLayoutBlock(
                                              index,
                                              blockIndex,
                                              {
                                              textGradientPreset:
                                              event.target.value as any,
                                              },
                                              )
                                              }
                                              >
                                              <option value="none">None (Solid color)</option>
                                              <option value="indigo-purple">Indigo Purple</option>
                                              <option value="cyan-blue">Cyan Blue</option>
                                              <option value="emerald-teal">Emerald Teal</option>
                                              <option value="sunset-orange">Sunset Orange</option>
                                              <option value="indigo-purple-cyan">Indigo Purple Cyan</option>
                                              <option value="sunset-pink">Sunset Pink</option>
                                              <option value="gold-amber">Gold Amber</option>
                                              <option value="custom">Custom Gradient</option>
                                              </select>
                                              </label>

                                              {block.textGradientPreset && block.textGradientPreset !== "none" && (() => {
                                              const currentPreset = block.textGradientPreset;
                                              const defaultColors = currentPreset !== "custom" ? (GRADIENT_PRESETS[currentPreset] ?? ["#ffffff", "#60a5fa", "#c084fc"]) : ["#ffffff", "#60a5fa", "#c084fc"];
                                              const startColor = block.textGradientCustomStart ?? defaultColors[0];
                                              const middleColor = block.textGradientCustomMiddle ?? defaultColors[1];
                                              const endColor = block.textGradientCustomEnd ?? defaultColors[2];
                                              const startOffset = block.textGradientCustomStartOffset ?? 0;
                                              const middleOffset = block.textGradientCustomMiddleOffset ?? 50;
                                              const endOffset = block.textGradientCustomEndOffset ?? 100;
                                              const angle = block.textGradientCustomAngle ?? 135;

                                              return (
                                              <div className="builder-effect-settings-subpanel" style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '8px 0', borderLeft: '3px solid #6366f1', paddingLeft: '8px', marginBottom: '12px' }}>
                                              <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                                              <label className="builder-field" style={{ flex: 1 }}>
                                              <span>Start Color</span>
                                              <input
                                              type="color"
                                              value={startColor}
                                              onChange={(e) => {
                                              const patch = getCustomGradientPatch(block, "textGradientPreset", { textGradientCustomStart: e.target.value });
                                              updateSelectedLayoutBlock(index, blockIndex, patch);
                                              }}
                                              />
                                              </label>
                                              <label className="builder-field" style={{ flex: 1 }}>
                                              <span>Middle Color</span>
                                              <input
                                              type="color"
                                              value={middleColor}
                                              onChange={(e) => {
                                              const patch = getCustomGradientPatch(block, "textGradientPreset", { textGradientCustomMiddle: e.target.value });
                                              updateSelectedLayoutBlock(index, blockIndex, patch);
                                              }}
                                              />
                                              </label>
                                              <label className="builder-field" style={{ flex: 1 }}>
                                              <span>End Color</span>
                                              <input
                                              type="color"
                                              value={endColor}
                                              onChange={(e) => {
                                              const patch = getCustomGradientPatch(block, "textGradientPreset", { textGradientCustomEnd: e.target.value });
                                              updateSelectedLayoutBlock(index, blockIndex, patch);
                                              }}
                                              />
                                              </label>
                                              </div>

                                              <label className="builder-field">
                                              <span>Start Color Weight (Offset)</span>
                                              <div className="builder-range-row" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                              <input
                                              type="range"
                                              min="0"
                                              max="100"
                                              step="1"
                                              style={{ flex: 1 }}
                                              value={startOffset}
                                              onChange={(e) => {
                                              const patch = getCustomGradientPatch(block, "textGradientPreset", { textGradientCustomStartOffset: Number(e.target.value) });
                                              updateSelectedLayoutBlock(index, blockIndex, patch);
                                              }}
                                              />
                                              <span style={{ minWidth: '40px', textAlign: 'right' }}>{startOffset}%</span>
                                              </div>
                                              </label>

                                              <label className="builder-field">
                                              <span>Middle Color Weight (Offset)</span>
                                              <div className="builder-range-row" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                              <input
                                              type="range"
                                              min="0"
                                              max="100"
                                              step="1"
                                              style={{ flex: 1 }}
                                              value={middleOffset}
                                              onChange={(e) => {
                                              const patch = getCustomGradientPatch(block, "textGradientPreset", { textGradientCustomMiddleOffset: Number(e.target.value) });
                                              updateSelectedLayoutBlock(index, blockIndex, patch);
                                              }}
                                              />
                                              <span style={{ minWidth: '40px', textAlign: 'right' }}>{middleOffset}%</span>
                                              </div>
                                              </label>

                                              <label className="builder-field">
                                              <span>End Color Weight (Offset)</span>
                                              <div className="builder-range-row" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                              <input
                                              type="range"
                                              min="0"
                                              max="100"
                                              step="1"
                                              style={{ flex: 1 }}
                                              value={endOffset}
                                              onChange={(e) => {
                                              const patch = getCustomGradientPatch(block, "textGradientPreset", { textGradientCustomEndOffset: Number(e.target.value) });
                                              updateSelectedLayoutBlock(index, blockIndex, patch);
                                              }}
                                              />
                                              <span style={{ minWidth: '40px', textAlign: 'right' }}>{endOffset}%</span>
                                              </div>
                                              </label>

                                              <label className="builder-field">
                                              <span>Angle (degrees)</span>
                                              <div className="builder-range-row" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                              <input
                                              type="range"
                                              min="0"
                                              max="360"
                                              step="5"
                                              style={{ flex: 1 }}
                                              value={angle}
                                              onChange={(e) => {
                                              const patch = getCustomGradientPatch(block, "textGradientPreset", { textGradientCustomAngle: Number(e.target.value) });
                                              updateSelectedLayoutBlock(index, blockIndex, patch);
                                              }}
                                              />
                                              <span style={{ minWidth: '40px', textAlign: 'right' }}>{angle}°</span>
                                              </div>
                                              </label>
                                              </div>
                                              );
                                              })()}

                                              <details className="builder-collapse">
                                              <summary>
                                              <InspectorGroupSummary
                                              title="Typewriter Text Animation"
                                              description="Configure typewriter dynamic cycles on title/body text."
                                              meta={block.typewriterEnabled ? "enabled" : "disabled"}
                                              />
                                              </summary>
                                              <label className="builder-check" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                                              <input
                                              type="checkbox"
                                              checked={block.typewriterEnabled ?? false}
                                              onChange={(event) =>
                                              updateSelectedLayoutBlock(
                                              index,
                                              blockIndex,
                                              {
                                              typewriterEnabled:
                                              event.target.checked,
                                              },
                                              )
                                              }
                                              />
                                              <span>Enable Typewriter Animation</span>
                                              </label>

                                              {block.typewriterEnabled && (
                                              <div className="builder-effect-settings-subpanel" style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '10px 0' }}>
                                              <div className="builder-contrast-note" style={{ fontSize: '12px', padding: '8px', background: 'rgba(0,0,0,0.03)', borderRadius: '4px', borderLeft: '3px solid #6366f1' }}>
                                              <strong>Bracket format instruction:</strong> Use square brackets with pipe separators to cycle multiple phrases. Example: <code>Build the future with [dynamic animations|interactive particles|typewriter effects|premium aesthetics]</code>
                                              </div>

                                              <label className="builder-check" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                              <input
                                              type="checkbox"
                                              checked={block.typewriterLoop !== false}
                                              onChange={(event) =>
                                              updateSelectedLayoutBlock(
                                              index,
                                              blockIndex,
                                              {
                                              typewriterLoop:
                                              event.target.checked,
                                              },
                                              )
                                              }
                                              />
                                              <span>Loop typing animation</span>
                                              </label>

                                              <label className="builder-field">
                                              <span>Typing Speed (ms)</span>
                                              <div className="builder-range-row" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                              <input
                                              type="range"
                                              min="30"
                                              max="250"
                                              step="5"
                                              style={{ flex: 1 }}
                                              value={block.typewriterSpeed ?? 80}
                                              onChange={(event) =>
                                              updateSelectedLayoutBlock(
                                              index,
                                              blockIndex,
                                              {
                                              typewriterSpeed:
                                              Number(event.target.value),
                                              },
                                              )
                                              }
                                              />
                                              <span style={{ minWidth: '40px', textAlign: 'right' }}>{block.typewriterSpeed ?? 80}ms</span>
                                              </div>
                                              </label>

                                              <label className="builder-field">
                                              <span>Erase Speed (ms)</span>
                                              <div className="builder-range-row" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                              <input
                                              type="range"
                                              min="10"
                                              max="150"
                                              step="5"
                                              style={{ flex: 1 }}
                                              value={block.typewriterEraseSpeed ?? 40}
                                              onChange={(event) =>
                                              updateSelectedLayoutBlock(
                                              index,
                                              blockIndex,
                                              {
                                              typewriterEraseSpeed:
                                              Number(event.target.value),
                                              },
                                              )
                                              }
                                              />
                                              <span style={{ minWidth: '40px', textAlign: 'right' }}>{block.typewriterEraseSpeed ?? 40}ms</span>
                                              </div>
                                              </label>

                                              <label className="builder-field">
                                              <span>Pause Delay (ms)</span>
                                              <div className="builder-range-row" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                              <input
                                              type="range"
                                              min="500"
                                              max="5000"
                                              step="100"
                                              style={{ flex: 1 }}
                                              value={block.typewriterDelay ?? 2000}
                                              onChange={(event) =>
                                              updateSelectedLayoutBlock(
                                              index,
                                              blockIndex,
                                              {
                                              typewriterDelay:
                                              Number(event.target.value),
                                              },
                                              )
                                              }
                                              />
                                              <span style={{ minWidth: '50px', textAlign: 'right' }}>{block.typewriterDelay ?? 2000}ms</span>
                                              </div>
                                              </label>

                                              <label className="builder-check" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                              <input
                                              type="checkbox"
                                              checked={block.typewriterUseGradient !== false}
                                              onChange={(event) =>
                                              updateSelectedLayoutBlock(
                                              index,
                                              blockIndex,
                                              {
                                              typewriterUseGradient:
                                              event.target.checked,
                                              },
                                              )
                                              }
                                              />
                                              <span>Use title gradient for typewriter text</span>
                                              </label>
                                              </div>
                                              )}
                                              </details>
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

                                                <details className="builder-collapse">
                                                  <summary>
                                                    <InspectorGroupSummary
                                                      title="Checklist"
                                                      description="Add checklist items to this text block."
                                                      meta={`${(block.items ?? []).length} item${(block.items ?? []).length !== 1 ? "s" : ""}`}
                                                    />
                                                  </summary>
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
                                                  <label className="builder-field">
                                                    <span>Icon Color Scheme</span>
                                                    <select
                                                      value={block.listIconColorScheme ?? "default"}
                                                      onChange={(event) =>
                                                        updateSelectedLayoutBlock(
                                                          index,
                                                          blockIndex,
                                                          { listIconColorScheme: event.target.value as any },
                                                        )
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
                                                      value={block.listIconSize ?? 16}
                                                      onChange={(event) =>
                                                        updateSelectedLayoutBlock(
                                                          index,
                                                          blockIndex,
                                                          { listIconSize: Number(event.target.value) },
                                                        )
                                                      }
                                                    />
                                                  </label>
                                                  <div className="builder-section-heading">
                                                    <span>Checklist Items ({(block.items ?? []).length})</span>
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
                                                </details>
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

                          <label className="builder-field">
                            <span>Card Border Radius</span>
                            <select
                              value={
                                selectedSection.borderRadius === undefined
                                  ? "inherit"
                                  : [0, 4, 8, 12, 16, 24].includes(selectedSection.borderRadius ?? -1)
                                    ? String(selectedSection.borderRadius)
                                    : "custom"
                              }
                              onChange={(event) => {
                                const val = event.target.value;
                                if (val === "inherit") {
                                  updateSelected({ borderRadius: undefined });
                                } else if (val === "custom") {
                                  updateSelected({ borderRadius: 10 });
                                } else {
                                  updateSelected({ borderRadius: Number(val) });
                                }
                              }}
                            >
                              <option value="inherit">Inherit (global settings)</option>
                              <option value="0">Flat (0px)</option>
                              <option value="4">Small (4px)</option>
                              <option value="8">Medium (8px)</option>
                              <option value="12">Rounded (12px)</option>
                              <option value="16">Large (16px)</option>
                              <option value="24">Extra Large (24px)</option>
                              <option value="custom">Custom...</option>
                            </select>
                          </label>
                          {selectedSection.borderRadius !== undefined && ![0, 4, 8, 12, 16, 24].includes(selectedSection.borderRadius) && (
                            <label className="builder-field">
                              <span>Custom Radius (px)</span>
                              <input
                                type="number"
                                min={0}
                                max={100}
                                value={selectedSection.borderRadius}
                                onChange={(event) => {
                                  const val = event.target.value === "" ? 0 : Number(event.target.value);
                                  updateSelected({ borderRadius: val });
                                }}
                              />
                            </label>
                          )}

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

                          <details className="builder-collapse">
                            <summary>
                              <span>Pagination</span>
                              <small>
                                {(selectedSection.pagination?.enabled ?? false)
                                  ? `${selectedSection.pagination?.mode === "loadMore" ? "Load More" : "Page Numbers"} · ${selectedSection.pagination?.perPage ?? 12}/page`
                                  : "Off"}
                              </small>
                            </summary>

                            <label className="builder-check">
                              <input
                                type="checkbox"
                                checked={selectedSection.pagination?.enabled ?? false}
                                onChange={(event) =>
                                  updateSelected({
                                    pagination: {
                                      ...(selectedSection.pagination ?? {
                                        enabled: false,
                                        perPage: 12,
                                        mode: "pageNumbers" as const,
                                        infiniteScroll: false,
                                        style: "standard" as const,
                                      }),
                                      enabled: event.target.checked,
                                    },
                                  })
                                }
                              />
                              <span>Pagination Enabled</span>
                            </label>

                            {(selectedSection.pagination?.enabled ?? false) && (
                              <>
                                <div className="builder-two-column">
                                  <label className="builder-field">
                                    <span>Products Per Page</span>
                                    <input
                                      type="number"
                                      min={4}
                                      max={48}
                                      step={1}
                                      value={selectedSection.pagination?.perPage ?? 12}
                                      onChange={(event) =>
                                        updateSelected({
                                          pagination: {
                                            ...(selectedSection.pagination ?? {
                                              enabled: true,
                                              perPage: 12,
                                              mode: "pageNumbers" as const,
                                              infiniteScroll: false,
                                              style: "standard" as const,
                                            }),
                                            perPage: Number(event.target.value),
                                          },
                                        })
                                      }
                                    />
                                  </label>

                                  <label className="builder-field">
                                    <span>Pagination Type</span>
                                    <select
                                      value={selectedSection.pagination?.mode ?? "pageNumbers"}
                                      onChange={(event) => {
                                        const typeVal = event.target.value as "pageNumbers" | "loadMore" | "infinite";
                                        updateSelected({
                                          pagination: {
                                            ...(selectedSection.pagination ?? {
                                              enabled: true,
                                              perPage: 12,
                                              mode: "pageNumbers" as const,
                                              infiniteScroll: false,
                                              style: "standard" as const,
                                            }),
                                            mode: typeVal,
                                            infiniteScroll: typeVal === "infinite",
                                          },
                                        });
                                      }}
                                    >
                                      <option value="pageNumbers">Page Numbers</option>
                                      <option value="loadMore">Load More</option>
                                      <option value="infinite">Infinite Scroll</option>
                                    </select>
                                  </label>
                                </div>

                                <div className="builder-two-column" style={{ marginTop: "8px" }}>
                                  <label className="builder-field">
                                    <span>Pagination Style</span>
                                    <select
                                      value={selectedSection.pagination?.style ?? "standard"}
                                      onChange={(event) =>
                                        updateSelected({
                                          pagination: {
                                            ...(selectedSection.pagination ?? {
                                              enabled: true,
                                              perPage: 12,
                                              mode: "pageNumbers" as const,
                                              infiniteScroll: false,
                                              style: "standard" as const,
                                            }),
                                            style: event.target.value as "standard" | "solid" | "minimal" | "rounded",
                                          },
                                        })
                                      }
                                    >
                                      <option value="standard">Standard</option>
                                      <option value="solid">Solid / Filled</option>
                                      <option value="minimal">Minimal / Borderless</option>
                                      <option value="rounded">Rounded Circle</option>
                                    </select>
                                  </label>
                                </div>

                                <label className="builder-check" style={{ marginTop: "8px" }}>
                                  <input
                                    type="checkbox"
                                    checked={selectedSection.pagination?.infiniteScroll ?? false}
                                    onChange={(event) =>
                                      updateSelected({
                                        pagination: {
                                          ...(selectedSection.pagination ?? {
                                            enabled: true,
                                            perPage: 12,
                                            mode: "pageNumbers" as const,
                                            infiniteScroll: false,
                                            style: "standard" as const,
                                          }),
                                          infiniteScroll: event.target.checked,
                                        },
                                      })
                                    }
                                  />
                                  <span>Infinite Scroll</span>
                                </label>
                              </>
                            )}

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
                                                                  <>
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
                              <details className="builder-collapse" style={{ order: 2, flex: "0 0 100%" }}>
                                <summary>
                                  <InspectorGroupSummary
                                    title="Checklist"
                                    description="Add checklist items to this badge."
                                    meta={`${(badge.items ?? []).length} item${(badge.items ?? []).length !== 1 ? "s" : ""}`}
                                  />
                                </summary>
                                <label className="builder-field">
                                  <span>Icon type</span>
                                  <select
                                    value={badge.listIcon ?? "check"}
                                    onChange={(event) =>
                                      updateSelectedBadge(index, { listIcon: event.target.value as any })
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
                                      updateSelectedBadge(index, { listIconColorScheme: event.target.value as any })
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
                                      updateSelectedBadge(index, { listIconSize: Number(event.target.value) })
                                    }
                                  />
                                </label>
                                <div className="builder-section-heading">
                                  <span>Checklist Items ({(badge.items ?? []).length})</span>
                                </div>
                                {(badge.items ?? []).map((item, itemIdx) => (
                                  <label key={itemIdx} className="builder-field">
                                    <span>Item {itemIdx + 1}</span>
                                    <div style={{ display: "flex", gap: 4 }}>
                                      <input
                                        value={item}
                                        onChange={(event) => {
                                          const items = [...(badge.items ?? [])];
                                          items[itemIdx] = event.target.value;
                                          updateSelectedBadge(index, { items });
                                        }}
                                      />
                                      <button
                                        type="button"
                                        className="builder-inline-delete"
                                        onClick={() => {
                                          const items = (badge.items ?? []).filter((_, i) => i !== itemIdx);
                                          updateSelectedBadge(index, { items });
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
                                    const items = [...(badge.items ?? []), `Item ${(badge.items ?? []).length + 1}`];
                                    updateSelectedBadge(index, { items });
                                  }}
                                >
                                  <Plus size={15} /> Add item
                                </button>
                              </details>
                                                                  </>
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
                      (selectedSection.kind === "slider" || selectedSection.kind === "scrollPinnedDemo") && (
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

                        {selectedSection.kind === "scrollPinnedDemo" && (
                          <details className="builder-collapse">
                            <summary>
                              <InspectorGroupSummary
                                title="Checklist"
                                description="Add checklist items to this storytelling section."
                                meta={`${(selectedSection.items ?? []).length} item${(selectedSection.items ?? []).length !== 1 ? "s" : ""}`}
                              />
                            </summary>
                            <label className="builder-field">
                              <span>Icon type</span>
                              <select
                                value={selectedSection.listIcon ?? "check"}
                                onChange={(event) =>
                                  updateSelected({ listIcon: event.target.value as any })
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
                                value={selectedSection.listIconColorScheme ?? "default"}
                                onChange={(event) =>
                                  updateSelected({ listIconColorScheme: event.target.value as any })
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
                                value={selectedSection.listIconSize ?? 16}
                                onChange={(event) =>
                                  updateSelected({ listIconSize: Number(event.target.value) })
                                }
                              />
                            </label>
                            <div className="builder-section-heading">
                              <span>Checklist Items ({(selectedSection.items ?? []).length})</span>
                            </div>
                            {(selectedSection.items ?? []).map((item, itemIdx) => (
                              <label key={itemIdx} className="builder-field">
                                <span>Item {itemIdx + 1}</span>
                                <div style={{ display: "flex", gap: 4 }}>
                                  <input
                                    value={item}
                                    onChange={(event) => {
                                      const items = [...(selectedSection.items ?? [])];
                                      items[itemIdx] = event.target.value;
                                      updateSelected({ items });
                                    }}
                                  />
                                  <button
                                    type="button"
                                    className="builder-inline-delete"
                                    onClick={() => {
                                      const items = (selectedSection.items ?? []).filter((_, i) => i !== itemIdx);
                                      updateSelected({ items });
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
                                const items = [...(selectedSection.items ?? []), `Item ${(selectedSection.items ?? []).length + 1}`];
                                updateSelected({ items });
                              }}
                            >
                              <Plus size={15} /> Add item
                            </button>
                          </details>
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
                          </>
                        )}

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
                                                                    <>
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
                                    <details className="builder-collapse" style={{ order: 2, flex: "0 0 100%" }}>
                                      <summary>
                                        <InspectorGroupSummary
                                          title="Checklist"
                                          description="Add checklist items to this slide."
                                          meta={`${(slide.items ?? []).length} item${(slide.items ?? []).length !== 1 ? "s" : ""}`}
                                        />
                                      </summary>
                                      <label className="builder-field">
                                        <span>Icon type</span>
                                        <select
                                          value={slide.listIcon ?? "check"}
                                          onChange={(event) =>
                                            updateSelectedSlide(index, { listIcon: event.target.value as any })
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
                                          onChange={(event) =>
                                            updateSelectedSlide(index, { listIconColorScheme: event.target.value as any })
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
                                          onChange={(event) =>
                                            updateSelectedSlide(index, { listIconSize: Number(event.target.value) })
                                          }
                                        />
                                      </label>
                                      <div className="builder-section-heading">
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
                                                updateSelectedSlide(index, { items });
                                              }}
                                            />
                                            <button
                                              type="button"
                                              className="builder-inline-delete"
                                              onClick={() => {
                                                const items = (slide.items ?? []).filter((_, i) => i !== itemIdx);
                                                updateSelectedSlide(index, { items });
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
                                          updateSelectedSlide(index, { items });
                                        }}
                                      >
                                        <Plus size={15} /> Add item
                                      </button>
                                    </details>
                                                                    </>
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

          {inspectorTab === "spacing" &&
            !selectedLayoutBlock &&
            !selectedLayoutRow &&
            selectedSection && (
            <div className="builder-inspector-stack">
              <details className="builder-collapse" open>
                <summary>
                  <InspectorGroupSummary
                    title="Section Spacing"
                    description="Control the section box model: padding inside, margin outside."
                    meta="Padding & margin"
                  />
                </summary>

                <div className="builder-two-column">
                  <SpacingControl
                    id="spacing-section-topSpacing"
                    label="Top Padding"
                    value={selectedSection.topSpacing}
                    context="sectionPadding"
                    inheritedValue={shellSettings.sectionPaddingTop}
                    onChange={(val) => updateSelected({ topSpacing: val })}
                  />
                  <SpacingControl
                    id="spacing-section-bottomSpacing"
                    label="Bottom Padding"
                    value={selectedSection.bottomSpacing}
                    context="sectionPadding"
                    inheritedValue={shellSettings.sectionPaddingBottom}
                    onChange={(val) => updateSelected({ bottomSpacing: val })}
                  />
                </div>

                <div className="builder-two-column">
                  <SpacingControl
                    id="spacing-section-topMargin"
                    label="Top Margin"
                    value={selectedSection.topMargin}
                    context="sectionMargin"
                    inheritedValue={shellSettings.sectionMarginTop}
                    onChange={(val) => updateSelected({ topMargin: val })}
                  />
                  <SpacingControl
                    id="spacing-section-bottomMargin"
                    label="Bottom Margin"
                    value={selectedSection.bottomMargin}
                    context="sectionMargin"
                    inheritedValue={shellSettings.sectionMarginBottom}
                    onChange={(val) => updateSelected({ bottomMargin: val })}
                  />
                </div>

                {onOpenGlobalSpacingSettings ? (
                  <button
                    type="button"
                    className="builder-secondary-button builder-full-button"
                    onClick={() => onOpenGlobalSpacingSettings("section")}
                  >
                    Edit global spacing defaults
                  </button>
                ) : null}
              </details>
            </div>
          )}

          {inspectorTab === "style" &&
            !selectedLayoutBlock &&
            !selectedLayoutRow &&
            selectedSection && (
            <div className="builder-inspector-stack">
              <details className="builder-collapse" open>
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
                          preset.value.toLowerCase()
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

              <details className="builder-collapse">
                <summary>
                  <InspectorGroupSummary
                    title="Background Effect"
                    description="Vibrant and responsive visual canvas animations."
                    meta={selectedSection.backgroundEffect ?? "none"}
                  />
                </summary>

                 <label className="builder-field">
                  <span>Effect Type</span>
                  <select
                    value={selectedSection.backgroundEffect ?? "none"}
                    onChange={(event) =>
                      updateSelected({
                        backgroundEffect: event.target.value,
                      })
                    }
                  >
                    <option value="none">No animated effect</option>
                    <option value="antigravity">
                      Antigravity Particle & Grid Canvas
                    </option>
                    <option value="antigravity2">
                      Antigravity 2 (Floating Pill Sphere)
                    </option>
                    <option value="aurora">
                      Aurora Mesh Gradient Glow
                    </option>
                    <option value="constellation">
                      Interactive Starfield Constellations
                    </option>
                    <option value="waves">
                      Animated Sine Wave Ripples
                    </option>
                    <option value="flowfield">
                      Vector Flow Field Particles
                    </option>
                    <option value="webgl_waves">
                      WebGL 3D Wave Terrain
                    </option>
                    <option value="webgl_flowfield">
                      WebGL Particle Flow Storm
                    </option>
                    <option value="webgl_cybergrid">
                      WebGL Cyber Grid (Tron)
                    </option>
                    <option value="webgl_fluid">
                      WebGL Interactive Fluid
                    </option>
                  </select>
                </label>

                {selectedSection.backgroundEffect && selectedSection.backgroundEffect !== "none" && (
                  <div
                    className="builder-effect-settings-subpanel"
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "12px",
                      padding: "10px 0",
                    }}
                  >
                    <label className="builder-field">
                      <span>Animation Speed</span>
                      <div
                        className="builder-range-row"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <input
                          type="range"
                          min="0.1"
                          max="5.0"
                          step="0.1"
                          style={{ flex: 1 }}
                          value={selectedSection.antigravitySpeed ?? 1.0}
                          onChange={(event) =>
                            updateSelected({
                              antigravitySpeed: Number(event.target.value),
                            })
                          }
                        />
                        <span style={{ minWidth: "40px", textAlign: "right" }}>
                          {(selectedSection.antigravitySpeed ?? 1.0).toFixed(1)}
                          x
                        </span>
                      </div>
                    </label>

                    {(selectedSection.backgroundEffect === "antigravity" ||
                      selectedSection.backgroundEffect === "antigravity2" ||
                      selectedSection.backgroundEffect === "constellation" ||
                      selectedSection.backgroundEffect === "flowfield" ||
                      selectedSection.backgroundEffect === "webgl_flowfield") && (
                      <label className="builder-field">
                        <span>Particle Count</span>
                        <div
                          className="builder-range-row"
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                          }}
                        >
                          <input
                            type="range"
                            min="0"
                            max="300"
                            step="5"
                            style={{ flex: 1 }}
                            value={selectedSection.antigravityParticleCount ?? 40}
                            onChange={(event) =>
                              updateSelected({
                                antigravityParticleCount: Number(
                                  event.target.value,
                                ),
                              })
                            }
                          />
                          <span style={{ minWidth: "40px", textAlign: "right" }}>
                            {selectedSection.antigravityParticleCount ?? 40}
                          </span>
                        </div>
                      </label>
                    )}

                    <label className="builder-field">
                      <span>Glow Intensity</span>
                      <div
                        className="builder-range-row"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <input
                          type="range"
                          min="0.0"
                          max="2.0"
                          step="0.1"
                          style={{ flex: 1 }}
                          value={selectedSection.antigravityGlowIntensity ?? 0.4}
                          onChange={(event) =>
                            updateSelected({
                              antigravityGlowIntensity: Number(
                                event.target.value,
                              ),
                            })
                          }
                        />
                        <span style={{ minWidth: "40px", textAlign: "right" }}>
                          {(
                            selectedSection.antigravityGlowIntensity ?? 0.4
                          ).toFixed(1)}
                        </span>
                      </div>
                    </label>

                    {selectedSection.backgroundEffect === "antigravity" && (
                      <label className="builder-field">
                        <span>Grid Movement Speed</span>
                        <div
                          className="builder-range-row"
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                          }}
                        >
                          <input
                            type="range"
                            min="0.0"
                            max="5.0"
                            step="0.1"
                            style={{ flex: 1 }}
                            value={selectedSection.antigravityGridMoveSpeed ?? 1.0}
                            onChange={(event) =>
                              updateSelected({
                                antigravityGridMoveSpeed: Number(
                                  event.target.value,
                                ),
                              })
                            }
                          />
                          <span style={{ minWidth: "40px", textAlign: "right" }}>
                            {(
                              selectedSection.antigravityGridMoveSpeed ?? 1.0
                            ).toFixed(1)}
                            x
                          </span>
                        </div>
                      </label>
                    )}

                    <label className="builder-field">
                      <span>Canvas Effect Color</span>
                      <div
                        className="builder-color-row"
                        style={{ display: "flex", gap: "8px" }}
                      >
                        <input
                          type="color"
                          value={selectedSection.antigravityColor ?? "#6366f1"}
                          onChange={(event) =>
                            updateSelected({
                              antigravityColor: event.target.value,
                            })
                          }
                        />
                        <input
                          style={{ flex: 1 }}
                          value={selectedSection.antigravityColor ?? "#6366f1"}
                          onChange={(event) =>
                            updateSelected({
                              antigravityColor: event.target.value,
                            })
                          }
                        />
                      </div>
                    </label>

                    {selectedSection.backgroundEffect === "antigravity" && (
                      <>
                        <label className="builder-field">
                          <span>Grid Density</span>
                          <select
                            value={selectedSection.antigravityGridDensity ?? "normal"}
                            onChange={(event) =>
                              updateSelected({
                                antigravityGridDensity: event.target.value as any,
                              })
                            }
                          >
                            <option value="sparse">Sparse</option>
                            <option value="normal">Normal</option>
                            <option value="compact">Compact</option>
                          </select>
                        </label>

                        <label className="builder-field">
                          <span>Visual Mode</span>
                          <select
                            value={selectedSection.antigravityVisualMode ?? "full"}
                            onChange={(event) =>
                              updateSelected({
                                antigravityVisualMode: event.target.value as any,
                              })
                            }
                          >
                            <option value="full">Full layout overlays</option>
                            <option value="transparent-grid">
                              Transparent grid lines
                            </option>
                            <option value="no-grid">
                              Rising particles only (No grid)
                            </option>
                            <option value="lines-only">
                              Mesh network lines only (No particles)
                            </option>
                          </select>
                        </label>
                      </>
                    )}

                    {(selectedSection.backgroundEffect === "antigravity" ||
                      selectedSection.backgroundEffect === "antigravity2" ||
                      selectedSection.backgroundEffect === "constellation" ||
                      selectedSection.backgroundEffect === "flowfield" ||
                      selectedSection.backgroundEffect === "webgl_waves" ||
                      selectedSection.backgroundEffect === "webgl_flowfield" ||
                      selectedSection.backgroundEffect === "webgl_cybergrid" ||
                      selectedSection.backgroundEffect === "webgl_fluid") && (
                      <label
                        className="builder-check"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={selectedSection.antigravityInteractive !== false}
                          onChange={(event) =>
                            updateSelected({
                              antigravityInteractive: event.target.checked,
                            })
                          }
                        />
                        <span>Mouse pointer interaction</span>
                      </label>
                    )}

                    {selectedSection.backgroundEffect === "antigravity" && (
                      <>
                        <label
                          className="builder-check"
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={selectedSection.antigravityShowGrid !== false}
                            onChange={(event) =>
                              updateSelected({
                                antigravityShowGrid: event.target.checked,
                              })
                            }
                          />
                          <span>Show grid overlay</span>
                        </label>

                        <label
                          className="builder-check"
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={
                              selectedSection.antigravityShowParticles !== false
                            }
                            onChange={(event) =>
                              updateSelected({
                                antigravityShowParticles: event.target.checked,
                              })
                            }
                          />
                          <span>Show floating particles</span>
                        </label>
                      </>
                    )}
                  </div>
                )}
              </details>

              <details className="builder-collapse" open>
                <summary>
                  <InspectorGroupSummary
                    title="Color Mode"
                    description="Manage readable text mode for this section background."
                    meta={sectionColorModeLabel(selectedSection)}
                  />
                </summary>

                <label className="builder-field">
                  <span>Section Color Mode</span>
                  <select
                    value={selectedSection.colorScheme ?? "inherit"}
                    onChange={(event) =>
                      updateSelected({
                        colorScheme: event.target.value as SectionColorScheme,
                      })
                    }
                  >
                    <option value="inherit">Auto by background</option>
                    <option value="light">Dark text for light background</option>
                    <option value="dark">Light text for dark background</option>
                  </select>
                </label>

                <div className="builder-contrast-note">
                  <strong>{sectionColorModeLabel(selectedSection)}</strong>
                  <span>
                    Auto keeps text readable against this section background.
                    Use Light or Dark only when you want to force the look.
                  </span>
                </div>
              </details>

              <StyleTabPanel
                target={styleTarget}
                showSpacing={false}
                showLayout={false}
                showAdvanced={false}
                showTypography={false}
                onChange={updateStyleTarget}
                onPickBackgroundImage={pickStyleBackgroundImage}
              />
            </div>
          )}

          {inspectorTab === "advanced" && !selectedLayoutRow && (
            <>
              {!selectedLayoutBlock ? (
                <>
                  {renderAnimationControls(selectedSection, {
                    allowPause: true,
                  })}

                  {renderSectionScrollBehaviorControls()}

                  <StyleTabPanel
                    target={styleTarget}
                    showSpacing={false}
                    showBackground={false}
                    showAppearance={false}
                    showLayout={false}
                    showTypography={false}
                    onChange={updateStyleTarget}
                  />

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
                </>
              )}
            </>
          )}
        </>
      ) : (
        <div className="builder-empty-state">
          <Layers3 size={22} />
          {hasSections ? (
            <p>Select a section, row, or element in the preview to inspect its properties.</p>
          ) : (
            <p>Add a section to start designing.</p>
          )}
        </div>
      )}

      {isLayoutPickerOpen && layoutContainerSection ? (
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
                      applyLayoutPreset(layoutContainerSection.id, preset.key);
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
