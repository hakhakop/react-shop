"use client";

import {
  Box,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Columns3,
  Copy,
  FileText,
  GripVertical,
  Layers3,
  Rows3,
  Square,
  Trash2,
  Type,
  Image as ImageIcon,
  MousePointerClick,
  LayoutGrid,
  Sliders,
  Code,
  FileSpreadsheet,
  List,
  Sparkles,
  Plus,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type {
  BuilderLayoutBlock,
  BuilderLayoutKey,
  BuilderSection,
  LayoutBlockKind,
} from "@/components/dashboard/builderTypes";
import {
  layoutBlockLabels,
  sectionLabels,
} from "@/components/dashboard/builderRegistry";
import {
  getBuilderLayoutRows,
  getBuilderRowLayoutPreset,
} from "@/components/dashboard/builderLayoutPresets";

type BuilderWireframePanelProps = {
  page: BuilderLayoutKey;
  pageLabel: string;
  sections: BuilderSection[];
  selectedSectionId: string;
  selectedLayoutRowIndex: number | null;
  selectedLayoutColumnKey: string | null;
  selectedLayoutBlockKey: string | null;
  onSelectSection: (sectionId: string) => void;
  onSelectRow: (sectionId: string, rowIndex: number) => void;
  onSelectColumn: (sectionId: string, columnKey: string) => void;
  onSelectBlock: (
    sectionId: string,
    columnKey: string,
    blockKey: string,
  ) => void;
  // Optional action callbacks from DashboardBuilder
  onMoveSection?: (sectionId: string, direction: -1 | 1) => void;
  onDuplicateSection?: (sectionId: string) => void;
  onDeleteSection?: (sectionId: string) => void;
  onMoveRow?: (sectionId: string, rowIndex: number, direction: -1 | 1) => void;
  onDuplicateRow?: (sectionId: string, rowIndex: number) => void;
  onDeleteRow?: (sectionId: string, rowIndex: number) => void;
  onMoveBlock?: (payload: {
    sectionId: string;
    columnKey: string;
    blockKey: string;
    direction: -1 | 1;
  }) => void;
  onDuplicateBlock?: (payload: {
    sectionId: string;
    columnKey: string;
    blockKey: string;
  }) => void;
  onDeleteBlock?: (payload: {
    sectionId: string;
    columnKey: string;
    blockKey: string;
  }) => void;
};

function blockTitle(block: BuilderLayoutBlock, index: number) {
  const label =
    layoutBlockLabels[(block.kind ?? "text") as LayoutBlockKind] ??
    block.kind ??
    "Element";
  let name =
    block.title ||
    block.headingText ||
    block.buttonLabel ||
    block.embedUrl ||
    block.fluentFormId ||
    null;

  if (name) {
    if (typeof name !== "string") {
      try {
        name = JSON.stringify(name);
      } catch {
        name = String(name);
      }
    }
    name = name.replace(/<[^>]*>/g, "");
    if (name.length > 40) {
      name = name.substring(0, 40) + "...";
    }
  }

  return name ? `${label}: ${name}` : `${label} ${index + 1}`;
}

function blockTitleFull(block: BuilderLayoutBlock, index: number) {
  const label =
    layoutBlockLabels[(block.kind ?? "text") as LayoutBlockKind] ??
    block.kind ??
    "Element";
  let name =
    block.title ||
    block.headingText ||
    block.buttonLabel ||
    block.embedUrl ||
    block.fluentFormId ||
    null;

  if (name) {
    if (typeof name !== "string") {
      try {
        name = JSON.stringify(name);
      } catch {
        name = String(name);
      }
    }
    name = name.replace(/<[^>]*>/g, "");
  }

  return name ? `${label}: ${name}` : `${label} ${index + 1}`;
}

function columnTitle(
  item: NonNullable<BuilderSection["layoutItems"]>[number],
  index: number,
) {
  return item.title || item.eyebrow || `Column ${index + 1}`;
}

function rowSummary(
  row: ReturnType<typeof getBuilderLayoutRows>[number],
  rowIndex: number,
) {
  const preset = getBuilderRowLayoutPreset(row.layoutKey ?? null);
  if (preset?.label) return preset.label;
  return `${row.items.length} col${row.items.length === 1 ? "" : "s"}`;
}

function getBlockIcon(kind: string) {
  switch (kind) {
    case "text":
    case "heading":
      return <Type size={13} className="builder-wireframe-icon builder-wireframe-icon--text" />;
    case "image":
    case "productGallery":
      return <ImageIcon size={13} className="builder-wireframe-icon builder-wireframe-icon--image" />;
    case "button":
    case "productAddToCart":
      return <MousePointerClick size={13} className="builder-wireframe-icon builder-wireframe-icon--button" />;
    case "grid":
    case "badgeGrid":
    case "products":
      return <LayoutGrid size={13} className="builder-wireframe-icon builder-wireframe-icon--grid" />;
    case "slider":
      return <Sliders size={13} className="builder-wireframe-icon builder-wireframe-icon--slider" />;
    case "embed":
      return <Code size={13} className="builder-wireframe-icon builder-wireframe-icon--embed" />;
    case "table":
      return <FileSpreadsheet size={13} className="builder-wireframe-icon builder-wireframe-icon--table" />;
    case "list":
      return <List size={13} className="builder-wireframe-icon builder-wireframe-icon--list" />;
    case "scrollPinnedDemo":
    case "hero":
    case "productHero":
      return <Sparkles size={13} className="builder-wireframe-icon builder-wireframe-icon--hero" />;
    default:
      return <Box size={13} className="builder-wireframe-icon builder-wireframe-icon--default" />;
  }
}

export default function BuilderWireframePanel({
  page,
  pageLabel,
  sections,
  selectedSectionId,
  selectedLayoutRowIndex,
  selectedLayoutColumnKey,
  selectedLayoutBlockKey,
  onSelectSection,
  onSelectRow,
  onSelectColumn,
  onSelectBlock,
  onMoveSection,
  onDuplicateSection,
  onDeleteSection,
  onMoveRow,
  onDuplicateRow,
  onDeleteRow,
  onMoveBlock,
  onDuplicateBlock,
  onDeleteBlock,
}: BuilderWireframePanelProps) {
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(
    () => new Set(),
  );
  const [collapsedRows, setCollapsedRows] = useState<Set<string>>(
    () => new Set(),
  );

  const sectionIds = useMemo(
    () => sections.map((section) => section.id).join("|"),
    [sections],
  );

  useEffect(() => {
    setCollapsedSections((current) => {
      const valid = new Set(sections.map((section) => section.id));
      const next = new Set(
        [...current].filter((sectionId) => valid.has(sectionId)),
      );
      next.delete(selectedSectionId);
      return next;
    });
  }, [sectionIds, selectedSectionId, sections]);

  useEffect(() => {
    if (!selectedSectionId || selectedLayoutRowIndex === null) return;
    setCollapsedRows((current) => {
      const next = new Set(current);
      next.delete(`${selectedSectionId}:${selectedLayoutRowIndex}`);
      return next;
    });
  }, [selectedLayoutRowIndex, selectedSectionId]);

  const toggleSection = (sectionId: string) => {
    setCollapsedSections((current) => {
      const next = new Set(current);
      if (next.has(sectionId)) next.delete(sectionId);
      else next.add(sectionId);
      return next;
    });
  };

  const toggleRow = (rowKey: string) => {
    setCollapsedRows((current) => {
      const next = new Set(current);
      if (next.has(rowKey)) next.delete(rowKey);
      else next.add(rowKey);
      return next;
    });
  };

  return (
    <div className="builder-sidebar-panel builder-wireframe-panel">
      <div className="builder-sidebar-panel-header">
        <div>
          <strong>Page Structure</strong>
          <span>Navigate and manage your page.</span>
        </div>
        <small>{sections.length}</small>
      </div>

      <div className="builder-wireframe-tree" role="tree" aria-label="Page structure">
        <div className="builder-wireframe-page">
          <FileText size={14} className="builder-wireframe-icon builder-wireframe-icon--page" />
          <div className="builder-wireframe-label-wrap">
            <strong>{pageLabel}</strong>
            <span>{page}</span>
          </div>
          <span className="builder-wireframe-meta">
            <span className="builder-wireframe-badge builder-wireframe-badge--page">PAGE</span>
          </span>
        </div>

        {sections.length === 0 ? (
          <div className="builder-wireframe-empty">
            <Layers3 size={16} />
            <strong>No sections</strong>
            <span>Add a section to start building this page.</span>
          </div>
        ) : (
          sections.map((section, sectionIndex) => {
            const sectionCollapsed = collapsedSections.has(section.id);
            const sectionSelected =
              selectedSectionId === section.id &&
              selectedLayoutRowIndex === null &&
              selectedLayoutColumnKey === null &&
              selectedLayoutBlockKey === null;
            const rows = getBuilderLayoutRows(section, section.layoutItems ?? []);

            return (
              <div className={`builder-wireframe-section${sectionSelected ? " is-selected" : ""}`} key={section.id}>
                <div className="builder-wireframe-rowline">
                  <button
                    type="button"
                    className={`builder-wireframe-toggle${sectionCollapsed ? "" : " is-expanded"}`}
                    onClick={() => toggleSection(section.id)}
                    aria-label={sectionCollapsed ? "Expand section" : "Collapse section"}
                  >
                    <ChevronRight size={13} />
                  </button>
                  <button
                    type="button"
                    className={`builder-wireframe-item builder-wireframe-item--section${
                      sectionSelected ? " is-selected" : ""
                    }`}
                    onClick={() => onSelectSection(section.id)}
                    role="treeitem"
                    aria-selected={sectionSelected}
                  >
                    <GripVertical size={11} className="builder-wireframe-grip" />
                    <Layers3 size={13} className="builder-wireframe-icon builder-wireframe-icon--section" />
                    <span
                      className="builder-wireframe-label-wrap"
                      title={
                        section.title ||
                        sectionLabels[section.kind] ||
                        `Section ${sectionIndex + 1}`
                      }
                    >
                      <strong>
                        {section.title ||
                          sectionLabels[section.kind] ||
                          `Section ${sectionIndex + 1}`}
                      </strong>
                      <small>Section</small>
                    </span>
                    {!section.visible ? <em className="builder-wireframe-hidden-tag">Hidden</em> : null}
                    
                    <span className="builder-wireframe-meta">
                      <span className="builder-wireframe-badge builder-wireframe-badge--section">SEC</span>
                      <div className="builder-wireframe-actions">
                        {onMoveSection && (
                          <button
                            type="button"
                            className="builder-wireframe-action-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              onMoveSection(section.id, -1);
                            }}
                            disabled={sectionIndex === 0}
                            title="Move section up"
                          >
                            <ChevronUp size={11} />
                          </button>
                        )}
                        {onMoveSection && (
                          <button
                            type="button"
                            className="builder-wireframe-action-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              onMoveSection(section.id, 1);
                            }}
                            disabled={sectionIndex === sections.length - 1}
                            title="Move section down"
                          >
                            <ChevronDown size={11} />
                          </button>
                        )}
                        {onDuplicateSection && (
                          <button
                            type="button"
                            className="builder-wireframe-action-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDuplicateSection(section.id);
                            }}
                            title="Duplicate section"
                          >
                            <Copy size={10} />
                          </button>
                        )}
                        {onDeleteSection && (
                          <button
                            type="button"
                            className="builder-wireframe-action-btn builder-wireframe-action-btn--danger"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteSection(section.id);
                            }}
                            title="Delete section"
                          >
                            <Trash2 size={10} />
                          </button>
                        )}
                      </div>
                    </span>
                  </button>
                </div>

                {!sectionCollapsed && (
                  <div className="builder-wireframe-children">
                    {rows.length === 0 ? (
                      <button
                        type="button"
                        className="builder-wireframe-item builder-wireframe-item--empty"
                        onClick={() => onSelectSection(section.id)}
                      >
                        <Square size={12} className="builder-wireframe-icon" />
                        <span className="builder-wireframe-label-wrap">
                          <strong>No rows</strong>
                          <small>Section settings</small>
                        </span>
                      </button>
                    ) : (
                      rows.map((row, rowIndex) => {
                        const rowKey = `${section.id}:${rowIndex}`;
                        const rowCollapsed = collapsedRows.has(rowKey);
                        const rowSelected =
                          selectedSectionId === section.id &&
                          selectedLayoutRowIndex === rowIndex &&
                          selectedLayoutColumnKey === null &&
                          selectedLayoutBlockKey === null;

                        // Check if row is empty (safe delete condition)
                        const isEmptyRow = row.items.every(
                          (item) => (item.blocks ?? []).length === 0,
                        );

                        const preset = getBuilderRowLayoutPreset(row.layoutKey ?? null);
                        const totalRatio = preset ? preset.ratios.reduce((a, b) => a + b, 0) : row.items.length;

                        return (
                          <div className={`builder-wireframe-row${rowSelected ? " is-selected" : ""}`} key={row.id}>
                            <div className="builder-wireframe-rowline">
                              <button
                                type="button"
                                className={`builder-wireframe-toggle${rowCollapsed ? "" : " is-expanded"}`}
                                onClick={() => toggleRow(rowKey)}
                                aria-label={rowCollapsed ? "Expand row" : "Collapse row"}
                              >
                                <ChevronRight size={13} />
                              </button>
                              <button
                                type="button"
                                className={`builder-wireframe-item builder-wireframe-item--row${
                                  rowSelected ? " is-selected" : ""
                                }`}
                                onClick={() => onSelectRow(section.id, rowIndex)}
                                role="treeitem"
                                aria-selected={rowSelected}
                              >
                                <GripVertical size={11} className="builder-wireframe-grip" />
                                <Rows3 size={13} className="builder-wireframe-icon builder-wireframe-icon--row" />
                                <span
                                  className="builder-wireframe-label-wrap"
                                  title={`Row ${rowIndex + 1} (${rowSummary(row, rowIndex)})`}
                                >
                                  <div className="builder-wireframe-row-label-row">
                                    <strong>Row {rowIndex + 1}</strong>
                                    <div className="builder-wireframe-row-preview" aria-hidden="true">
                                      {preset ? preset.ratios.map((r, idx) => (
                                        <div key={idx} style={{ flexGrow: r }} className="builder-wireframe-row-preview-col" />
                                      )) : (
                                        <div style={{ flexGrow: 1 }} className="builder-wireframe-row-preview-col" />
                                      )}
                                    </div>
                                  </div>
                                  <small>{rowSummary(row, rowIndex)}</small>
                                </span>

                                <span className="builder-wireframe-meta">
                                  <span className="builder-wireframe-badge builder-wireframe-badge--row">ROW</span>
                                  <div className="builder-wireframe-actions">
                                    {onMoveRow && (
                                      <button
                                        type="button"
                                        className="builder-wireframe-action-btn"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          onMoveRow(section.id, rowIndex, -1);
                                        }}
                                        disabled={rowIndex === 0}
                                        title="Move row up"
                                      >
                                        <ChevronUp size={11} />
                                      </button>
                                    )}
                                    {onMoveRow && (
                                      <button
                                        type="button"
                                        className="builder-wireframe-action-btn"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          onMoveRow(section.id, rowIndex, 1);
                                        }}
                                        disabled={rowIndex === rows.length - 1}
                                        title="Move row down"
                                      >
                                        <ChevronDown size={11} />
                                      </button>
                                    )}
                                    {onDuplicateRow && (
                                      <button
                                        type="button"
                                        className="builder-wireframe-action-btn"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          onDuplicateRow(section.id, rowIndex);
                                        }}
                                        title="Duplicate row"
                                      >
                                        <Copy size={10} />
                                      </button>
                                    )}
                                    {onDeleteRow && isEmptyRow && (
                                      <button
                                        type="button"
                                        className="builder-wireframe-action-btn builder-wireframe-action-btn--danger"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          onDeleteRow(section.id, rowIndex);
                                        }}
                                        title="Delete empty row"
                                      >
                                        <Trash2 size={10} />
                                      </button>
                                    )}
                                  </div>
                                </span>
                              </button>
                            </div>

                            {!rowCollapsed && (
                              <div className="builder-wireframe-children builder-wireframe-children--columns">
                                {row.items.map((item, columnIndex) => {
                                  const flatIndex = row.startIndex + columnIndex;
                                  const columnKey =
                                    item.id ?? `layout-item-${flatIndex}`;
                                  const columnSelected =
                                    selectedSectionId === section.id &&
                                    selectedLayoutColumnKey === columnKey &&
                                    selectedLayoutBlockKey === null &&
                                    selectedLayoutRowIndex === null;
                                  const blocks = item.blocks ?? [];

                                  const ratio = preset?.ratios?.[columnIndex] ?? 1;
                                  const widthPercent = totalRatio > 0 ? Math.round((ratio / totalRatio) * 100) : 100;

                                  return (
                                    <div
                                      className={`builder-wireframe-column${columnSelected ? " is-selected" : ""}`}
                                      key={columnKey}
                                      style={{ flex: `${ratio} ${ratio} 0%`, minWidth: 0 }}
                                    >
                                      <button
                                        type="button"
                                        className={`builder-wireframe-item builder-wireframe-item--column${
                                          columnSelected ? " is-selected" : ""
                                        }`}
                                        onClick={() =>
                                          onSelectColumn(section.id, columnKey)
                                        }
                                        role="treeitem"
                                        aria-selected={columnSelected}
                                      >
                                        <GripVertical size={11} className="builder-wireframe-grip" />
                                        <Columns3 size={13} className="builder-wireframe-icon builder-wireframe-icon--column" />
                                        <span
                                          className="builder-wireframe-label-wrap"
                                          title={`${columnTitle(item, columnIndex)} (Column ${columnIndex + 1})`}
                                        >
                                          <strong>{item.title || `Col ${columnIndex + 1}`}</strong>
                                        </span>

                                        <span className="builder-wireframe-meta">
                                          <span className="builder-wireframe-badge builder-wireframe-badge--column-pct">{widthPercent}%</span>
                                          <em className="builder-wireframe-count">{blocks.length}</em>
                                        </span>
                                      </button>

                                      <div className="builder-wireframe-children builder-wireframe-children--blocks">
                                        {blocks.length === 0 ? (
                                          <button
                                            type="button"
                                            className="builder-wireframe-item builder-wireframe-item--empty-compact"
                                            onClick={() =>
                                              onSelectColumn(section.id, columnKey)
                                            }
                                            title="Empty column. Click to select."
                                          >
                                            <span className="builder-wireframe-empty-label">Empty</span>
                                          </button>
                                        ) : (
                                          blocks.map((block, blockIndex) => {
                                            const blockKey =
                                              block.id ??
                                              `${columnKey}-block-${blockIndex}`;
                                            const blockSelected =
                                              selectedSectionId === section.id &&
                                              selectedLayoutColumnKey === columnKey &&
                                              selectedLayoutBlockKey === blockKey;

                                            return (
                                              <button
                                                type="button"
                                                key={blockKey}
                                                className={`builder-wireframe-item builder-wireframe-item--block${
                                                  blockSelected ? " is-selected" : ""
                                                }`}
                                                onClick={() =>
                                                  onSelectBlock(
                                                    section.id,
                                                    columnKey,
                                                    blockKey,
                                                  )
                                                }
                                                role="treeitem"
                                                aria-selected={blockSelected}
                                              >
                                                <GripVertical size={11} className="builder-wireframe-grip" />
                                                {getBlockIcon(block.kind ?? "text")}
                                                <span
                                                  className="builder-wireframe-label-wrap"
                                                  title={blockTitleFull(block, blockIndex)}
                                                >
                                                  <strong>
                                                    {layoutBlockLabels[(block.kind ?? "text") as LayoutBlockKind] ?? block.kind ?? "Element"}
                                                  </strong>
                                                </span>

                                                <span className="builder-wireframe-meta">
                                                  <span className="builder-wireframe-badge builder-wireframe-badge--element">ELM</span>
                                                  <div className="builder-wireframe-actions">
                                                    {onMoveBlock && (
                                                      <button
                                                        type="button"
                                                        className="builder-wireframe-action-btn"
                                                        onClick={(e) => {
                                                          e.stopPropagation();
                                                          onMoveBlock({
                                                            sectionId: section.id,
                                                            columnKey,
                                                            blockKey,
                                                            direction: -1,
                                                          });
                                                        }}
                                                        disabled={blockIndex === 0}
                                                        title="Move element up (within column)"
                                                      >
                                                        <ChevronUp size={11} />
                                                      </button>
                                                    )}
                                                    {onMoveBlock && (
                                                      <button
                                                        type="button"
                                                        className="builder-wireframe-action-btn"
                                                        onClick={(e) => {
                                                          e.stopPropagation();
                                                          onMoveBlock({
                                                            sectionId: section.id,
                                                            columnKey,
                                                            blockKey,
                                                            direction: 1,
                                                          });
                                                        }}
                                                        disabled={blockIndex === blocks.length - 1}
                                                        title="Move element down (within column)"
                                                      >
                                                        <ChevronDown size={11} />
                                                      </button>
                                                    )}
                                                    {onDuplicateBlock && (
                                                      <button
                                                        type="button"
                                                        className="builder-wireframe-action-btn"
                                                        onClick={(e) => {
                                                          e.stopPropagation();
                                                          onDuplicateBlock({
                                                            sectionId: section.id,
                                                            columnKey,
                                                            blockKey,
                                                          });
                                                        }}
                                                        title="Duplicate element"
                                                      >
                                                        <Copy size={10} />
                                                      </button>
                                                    )}
                                                    {onDeleteBlock && (
                                                      <button
                                                        type="button"
                                                        className="builder-wireframe-action-btn builder-wireframe-action-btn--danger"
                                                        onClick={(e) => {
                                                          e.stopPropagation();
                                                          onDeleteBlock({
                                                            sectionId: section.id,
                                                            columnKey,
                                                            blockKey,
                                                          });
                                                        }}
                                                        title="Delete element"
                                                      >
                                                        <Trash2 size={10} />
                                                      </button>
                                                    )}
                                                  </div>
                                                </span>
                                              </button>
                                            );
                                          })
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
        {sections.length > 0 && (
          <div className="builder-wireframe-add-section-wrapper">
            <button
              type="button"
              className="builder-wireframe-add-section-btn"
              onClick={() => {
                if (sections.length > 0) {
                  onSelectSection(sections[sections.length - 1].id);
                }
              }}
            >
              <Plus size={13} />
              <span>Add Section</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
