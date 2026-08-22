"use client";

import {
  Box, ChevronDown, ChevronRight, ChevronUp, Columns3, Copy, FileText,
  GripVertical, Image as ImageIcon, Layers3, LayoutGrid, List,
  MousePointerClick, Pencil, Plus, Rows3, Settings2, Sliders, Sparkles, Square, Trash2, Type,
} from "lucide-react";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { BuilderLayoutBlock, BuilderLayoutKey, BuilderSection, LayoutBlockKind } from "@/components/dashboard/builderTypes";
import { layoutBlockLabels, sectionLabels } from "@/components/dashboard/builderRegistry";
import { getBuilderLayoutRows, getBuilderRowLayoutPreset, type BuilderLayoutRow } from "@/components/dashboard/builderLayoutPresets";
import { layoutColumnHasContent } from "@/lib/builderNestedLayout";
import { normalizeBuilderSectionLayout } from "@/lib/builderSectionLayout";
import type { BuilderInteractionTarget } from "@/components/dashboard/builderInteraction";

export type BuilderHoverTarget = BuilderInteractionTarget;

export type BuilderWireframeActions = {
  addSection?: (
    targetSectionId: string | null,
    placement: "above" | "below",
  ) => void;
  addRow?: (sectionId: string, rowIndex: number, presetKey: string) => void;
  openElements?: () => void;
  selectSection: (sectionId: string) => void;
  selectRow: (sectionId: string, rowIndex: number) => void;
  selectColumn: (sectionId: string, columnKey: string) => void;
  selectBlock: (sectionId: string, columnKey: string, blockKey: string) => void;
  hover?: (target: BuilderHoverTarget | null) => void;
  renameSection?: (sectionId: string, name: string) => void;
  renameComplete?: () => void;
  moveSection?: (sectionId: string, direction: -1 | 1) => void;
  duplicateSection?: (sectionId: string) => void;
  deleteSection?: (sectionId: string) => void;
  moveRow?: (sectionId: string, rowIndex: number, direction: -1 | 1) => void;
  duplicateRow?: (sectionId: string, rowIndex: number) => void;
  deleteRow?: (sectionId: string, rowIndex: number) => void;
  moveBlock?: (payload: { sectionId: string; columnKey: string; blockKey: string; direction: -1 | 1 }) => void;
  duplicateBlock?: (payload: { sectionId: string; columnKey: string; blockKey: string }) => void;
  deleteBlock?: (payload: { sectionId: string; columnKey: string; blockKey: string }) => void;
};

type Props = {
  page: BuilderLayoutKey;
  pageLabel: string;
  documentKindLabel?: string;
  documentBadgeLabel?: string;
  structureLabel?: string;
  structureAriaLabel?: string;
  sections: BuilderSection[];
  selectedSectionId: string;
  selectedLayoutRowIndex: number | null;
  selectedLayoutColumnKey: string | null;
  selectedLayoutBlockKey: string | null;
  hoveredTarget?: BuilderHoverTarget | null;
  actions: BuilderWireframeActions;
  renameSectionId?: string | null;
};

function getWireframeRows(section: BuilderSection): BuilderLayoutRow[] {
  const normalized = normalizeBuilderSectionLayout(section);
  if (normalized.source === "canonical") {
    return normalized.rows.map((row) => ({
      id: row.id,
      layoutKey: row.layout,
      startIndex: 0,
      items: row.columns.map((column) => ({
        id: column.id,
        rowId: row.id,
        rowLayout: row.layout,
        blocks: column.elements,
      })),
    }));
  }
  return getBuilderLayoutRows(section, section.layoutItems ?? []);
}

function structureKey(target: BuilderHoverTarget | null | undefined) {
  if (!target) return null;
  if (target.type === "section") return `section:${target.sectionId}`;
  if (target.type === "row") return `row:${target.sectionId}:${target.rowIndex}`;
  if (target.type === "column") return `column:${target.sectionId}:${target.columnKey}`;
  return `block:${target.sectionId}:${target.columnKey}:${target.blockKey}`;
}

function selectedKey(sectionId: string, rowIndex: number | null, columnKey: string | null, blockKey: string | null) {
  if (blockKey) return `block:${sectionId}:${columnKey}:${blockKey}`;
  if (columnKey) return `column:${sectionId}:${columnKey}`;
  if (rowIndex !== null) return `row:${sectionId}:${rowIndex}`;
  return sectionId ? `section:${sectionId}` : null;
}

function isDescendant(key: string, target: string | null) {
  return Boolean(target && target.startsWith(`${key}:`));
}

function blockTitle(block: BuilderLayoutBlock, index: number, full = false) {
  const label = layoutBlockLabels[(block.kind ?? "text") as LayoutBlockKind] ?? block.kind ?? "Element";
  let name = block.title || block.headingText || block.buttonLabel || block.embedUrl || block.fluentFormId || null;
  if (name) {
    if (typeof name !== "string") {
      try { name = JSON.stringify(name); } catch { name = String(name); }
    }
    name = name.replace(/<[^>]*>/g, "");
    if (!full && name.length > 40) name = `${name.substring(0, 40)}...`;
  }
  return name ? `${label}: ${name}` : `${label} ${index + 1}`;
}

function blockIcon(kind: string) {
  const props = { size: 13, className: "builder-wireframe-icon" };
  if (kind === "text" || kind === "heading") return <Type {...props} />;
  if (kind === "image" || kind === "productGallery") return <ImageIcon {...props} />;
  if (kind === "button" || kind === "productAddToCart") return <MousePointerClick {...props} />;
  if (["grid", "badgeGrid", "products"].includes(kind)) return <LayoutGrid {...props} />;
  if (["slider", "panelSlider", "slideshow", "overlaySlider"].includes(kind)) return <Sliders {...props} />;
  if (["hero", "productHero", "scrollPinnedDemo"].includes(kind)) return <Sparkles {...props} />;
  if (kind === "list") return <List {...props} />;
  return <Box {...props} />;
}

function hasDynamicContent(value: any) {
  if (!value) return false;
  return Boolean(
    value.dynamicContext ||
      (value.dynamicBindings && Object.keys(value.dynamicBindings).length > 0),
  );
}

function blockHasDynamicContent(block: BuilderLayoutBlock) {
  return (
    hasDynamicContent(block) ||
    block.gridItems?.some(hasDynamicContent) === true ||
    block.slides?.some(hasDynamicContent) === true ||
    block.listItems?.some(hasDynamicContent) === true ||
    block.buttons?.some(hasDynamicContent) === true ||
    block.badges?.some(hasDynamicContent) === true
  );
}

const WireframeBlock = memo(function WireframeBlock({ sectionId, columnKey, block, index, count, selected, hovered, actions }: {
  sectionId: string; columnKey: string; block: BuilderLayoutBlock; index: number; count: number;
  selected: boolean; hovered: boolean; actions: BuilderWireframeActions;
}) {
  const blockKey = block.id ?? `${columnKey}-block-${index}`;
  return <div className={`builder-wireframe-item builder-wireframe-item--block${selected ? " is-selected" : ""}${hovered ? " is-hovered" : ""}`}
    data-structure-key={`block:${sectionId}:${columnKey}:${blockKey}`}
    onMouseEnter={() => actions.hover?.({ type: "block", sectionId, columnKey, blockKey })}
    onMouseLeave={() => actions.hover?.(null)}
    onClick={() => actions.selectBlock(sectionId, columnKey, blockKey)} role="treeitem" tabIndex={0} aria-selected={selected}>
    <GripVertical size={11} className="builder-wireframe-grip" />{blockIcon(block.kind ?? "text")}
    <span className="builder-wireframe-label-wrap" title={blockTitle(block, index, true)}><strong>{layoutBlockLabels[(block.kind ?? "text") as LayoutBlockKind] ?? block.kind ?? "Element"}</strong></span>
    <span className="builder-wireframe-meta"><span className="builder-wireframe-badge builder-wireframe-badge--element">ELM</span>{blockHasDynamicContent(block) ? <span className="builder-wireframe-badge builder-wireframe-badge--dynamic" title="Dynamic content" aria-label="Dynamic content"><Sparkles size={12} /></span> : null}<div className="builder-wireframe-actions">
      <button type="button" className="builder-wireframe-action-btn builder-wireframe-action-btn--settings" onClick={(e) => { e.stopPropagation(); actions.selectBlock(sectionId, columnKey, blockKey); }} title="Open element settings"><Pencil size={10} /></button>
      {actions.moveBlock && <button type="button" className="builder-wireframe-action-btn" onClick={(e) => { e.stopPropagation(); actions.moveBlock?.({ sectionId, columnKey, blockKey, direction: -1 }); }} disabled={index === 0} title="Move element up"><ChevronUp size={11} /></button>}
      {actions.moveBlock && <button type="button" className="builder-wireframe-action-btn" onClick={(e) => { e.stopPropagation(); actions.moveBlock?.({ sectionId, columnKey, blockKey, direction: 1 }); }} disabled={index === count - 1} title="Move element down"><ChevronDown size={11} /></button>}
      {actions.duplicateBlock && <button type="button" className="builder-wireframe-action-btn" onClick={(e) => { e.stopPropagation(); actions.duplicateBlock?.({ sectionId, columnKey, blockKey }); }} title="Duplicate element"><Copy size={10} /></button>}
      {actions.deleteBlock && <button type="button" className="builder-wireframe-action-btn builder-wireframe-action-btn--danger" onClick={(e) => { e.stopPropagation(); actions.deleteBlock?.({ sectionId, columnKey, blockKey }); }} title="Delete element"><Trash2 size={10} /></button>}
    </div></span>
  </div>;
});

function columnOwns(item: NonNullable<BuilderSection["layoutItems"]>[number], key: string | null) {
  if (!key) return false;
  return item.id === key || Boolean(item.nestedLayout?.rows.some((row) => row.columns.some((column) => column.id === key)));
}

function sameColumn(a: Readonly<{ item: NonNullable<BuilderSection["layoutItems"]>[number]; index: number; flatIndex: number; ratio: number; totalRatio: number; selectedColumnKey: string | null; selectedBlockKey: string | null; hoveredColumnKey: string | null; hoveredBlockKey: string | null; actions: BuilderWireframeActions }>, b: Readonly<{ item: NonNullable<BuilderSection["layoutItems"]>[number]; index: number; flatIndex: number; ratio: number; totalRatio: number; selectedColumnKey: string | null; selectedBlockKey: string | null; hoveredColumnKey: string | null; hoveredBlockKey: string | null; actions: BuilderWireframeActions }>) {
  const selected = (props: typeof a) => columnOwns(props.item, props.selectedColumnKey) ? `${props.selectedColumnKey}:${props.selectedBlockKey ?? ""}` : "";
  const hovered = (props: typeof a) => columnOwns(props.item, props.hoveredColumnKey) ? `${props.hoveredColumnKey}:${props.hoveredBlockKey ?? ""}` : "";
  return a.item === b.item && a.index === b.index && a.flatIndex === b.flatIndex && a.ratio === b.ratio && a.totalRatio === b.totalRatio && a.actions === b.actions && selected(a) === selected(b) && hovered(a) === hovered(b);
}

const WireframeColumn = memo(function WireframeColumn({ sectionId, item, index, flatIndex, ratio, totalRatio, selectedColumnKey, selectedBlockKey, hoveredColumnKey, hoveredBlockKey, actions }: {
  sectionId: string; item: NonNullable<BuilderSection["layoutItems"]>[number]; index: number; flatIndex: number; ratio: number; totalRatio: number;
  selectedColumnKey: string | null; selectedBlockKey: string | null; hoveredColumnKey: string | null; hoveredBlockKey: string | null; actions: BuilderWireframeActions;
}) {
  const columnKey = item.id ?? `layout-item-${flatIndex}`;
  const selected = selectedColumnKey === columnKey && !selectedBlockKey;
  const hovered = hoveredColumnKey === columnKey && !hoveredBlockKey;
  const blocks = item.blocks ?? [];
  const pct = totalRatio ? Math.round((ratio / totalRatio) * 100) : 100;
  const nested = item.nestedLayout;
  return <div className={`builder-wireframe-column${selected ? " is-selected" : ""}`} style={{ flex: `${ratio} ${ratio} 0%`, minWidth: 0 }}>
    <button type="button" className={`builder-wireframe-item builder-wireframe-item--column${selected ? " is-selected" : ""}${hovered ? " is-hovered" : ""}`}
      data-structure-key={`column:${sectionId}:${columnKey}`} onMouseEnter={() => actions.hover?.({ type: "column", sectionId, columnKey })} onMouseLeave={() => actions.hover?.(null)} onClick={() => actions.selectColumn(sectionId, columnKey)} role="treeitem" aria-selected={selected}>
      <GripVertical size={11} className="builder-wireframe-grip" /><Columns3 size={13} className="builder-wireframe-icon builder-wireframe-icon--column" />
      <span className="builder-wireframe-label-wrap" title={`${item.title || item.eyebrow || `Column ${index + 1}`} (Column ${index + 1})`}><strong>{item.title || `Col ${index + 1}`}</strong></span>
      <span className="builder-wireframe-meta"><span className="builder-wireframe-badge builder-wireframe-badge--column-pct">{pct}%</span><em className="builder-wireframe-count">{nested ? nested.rows.reduce((n, row) => n + row.columns.reduce((sum, column) => sum + column.blocks.length, 0), 0) : blocks.length}</em></span>
    </button>
    {nested ? <div className="builder-wireframe-children builder-wireframe-children--blocks builder-wireframe-nested-layout">{nested.rows.map((row, rowIndex) => <div key={row.id} className="builder-wireframe-nested-row"><span className="builder-wireframe-nested-row-label">Nested row {rowIndex + 1}</span>{row.columns.map((column, columnIndex) => <WireframeColumn key={column.id} sectionId={sectionId} item={column as NonNullable<BuilderSection["layoutItems"]>[number]} index={columnIndex} flatIndex={columnIndex} ratio={1} totalRatio={row.columns.length} selectedColumnKey={selectedColumnKey} selectedBlockKey={selectedBlockKey} hoveredColumnKey={hoveredColumnKey} hoveredBlockKey={hoveredBlockKey} actions={actions} />)}</div>)}</div> :
      <div className="builder-wireframe-children builder-wireframe-children--blocks">{blocks.length === 0 ? <button type="button" className="builder-wireframe-item builder-wireframe-item--empty-compact" onClick={() => { actions.selectColumn(sectionId, columnKey); actions.openElements?.(); }} title="Add an element to this column."><Plus size={11} /><span className="builder-wireframe-empty-label">Add element</span></button> : blocks.map((block, blockIndex) => <WireframeBlock key={block.id ?? `${columnKey}-block-${blockIndex}`} sectionId={sectionId} columnKey={columnKey} block={block} index={blockIndex} count={blocks.length} selected={selectedColumnKey === columnKey && selectedBlockKey === (block.id ?? `${columnKey}-block-${blockIndex}`)} hovered={hoveredBlockKey === `${columnKey}:${block.id ?? `${columnKey}-block-${blockIndex}`}`} actions={actions} />)}</div>}
  </div>;
}, sameColumn);

function sameRow(a: Readonly<{ row: BuilderLayoutRow; index: number; selected: boolean; hovered: boolean; selectedColumnKey: string | null; selectedBlockKey: string | null; hoveredColumnKey: string | null; hoveredBlockKey: string | null; collapsed: boolean; onToggle: (key: string) => void; actions: BuilderWireframeActions }>, b: Readonly<{ row: BuilderLayoutRow; index: number; selected: boolean; hovered: boolean; selectedColumnKey: string | null; selectedBlockKey: string | null; hoveredColumnKey: string | null; hoveredBlockKey: string | null; collapsed: boolean; onToggle: (key: string) => void; actions: BuilderWireframeActions }>) {
  return a.index === b.index && a.collapsed === b.collapsed && a.selected === b.selected && a.hovered === b.hovered && a.selectedColumnKey === b.selectedColumnKey && a.selectedBlockKey === b.selectedBlockKey && a.hoveredColumnKey === b.hoveredColumnKey && a.hoveredBlockKey === b.hoveredBlockKey && a.onToggle === b.onToggle && a.actions === b.actions && a.row.id === b.row.id && a.row.layoutKey === b.row.layoutKey && a.row.startIndex === b.row.startIndex && a.row.items.length === b.row.items.length && a.row.items.every((item, index) => item === b.row.items[index]);
}

const WireframeRow = memo(function WireframeRow({ sectionId, row, index, collapsed, selected, hovered, selectedColumnKey, selectedBlockKey, hoveredColumnKey, hoveredBlockKey, onToggle, actions }: {
  sectionId: string; row: BuilderLayoutRow; index: number; collapsed: boolean; selected: boolean; hovered: boolean;
  selectedColumnKey: string | null; selectedBlockKey: string | null; hoveredColumnKey: string | null; hoveredBlockKey: string | null; onToggle: (key: string) => void; actions: BuilderWireframeActions;
}) {
  const rowKey = `${sectionId}:${index}`; const preset = getBuilderRowLayoutPreset(row.layoutKey); const totalRatio = preset.ratios.reduce((a, b) => a + b, 0);
  const empty = row.items.every((item) => !layoutColumnHasContent(item as NonNullable<BuilderSection["layoutItems"]>[number]));
  return <div className={`builder-wireframe-row${selected ? " is-selected" : ""}`}>
    <div className="builder-wireframe-rowline"><button type="button" className={`builder-wireframe-toggle${collapsed ? "" : " is-expanded"}`} onClick={() => onToggle(rowKey)} aria-label={collapsed ? "Expand row" : "Collapse row"}><ChevronRight size={13} /></button>
      <div className={`builder-wireframe-item builder-wireframe-item--row${selected ? " is-selected" : ""}${hovered ? " is-hovered" : ""}`} data-structure-key={`row:${sectionId}:${index}`} onMouseEnter={() => actions.hover?.({ type: "row", sectionId, rowIndex: index })} onMouseLeave={() => actions.hover?.(null)} onClick={() => actions.selectRow(sectionId, index)} role="treeitem" tabIndex={0} aria-selected={selected}>
        <GripVertical size={11} className="builder-wireframe-grip" /><Rows3 size={13} className="builder-wireframe-icon builder-wireframe-icon--row" /><span className="builder-wireframe-label-wrap"><div className="builder-wireframe-row-label-row"><strong>Row {index + 1}</strong><div className="builder-wireframe-row-preview" aria-hidden="true">{preset.ratios.map((ratio, i) => <div key={i} style={{ flexGrow: ratio }} className="builder-wireframe-row-preview-col" />)}</div></div><small>{preset.label || `${row.items.length} columns`}</small></span>
        <span className="builder-wireframe-meta"><span className="builder-wireframe-badge builder-wireframe-badge--row">ROW</span><div className="builder-wireframe-actions"><button type="button" className="builder-wireframe-action-btn builder-wireframe-action-btn--settings" onClick={(e) => { e.stopPropagation(); actions.selectRow(sectionId, index); }} title="Open row settings"><Pencil size={10} /></button>{actions.moveRow && <button type="button" className="builder-wireframe-action-btn" onClick={(e) => { e.stopPropagation(); actions.moveRow?.(sectionId, index, -1); }} disabled={index === 0} title="Move row up"><ChevronUp size={11} /></button>}{actions.moveRow && <button type="button" className="builder-wireframe-action-btn" onClick={(e) => { e.stopPropagation(); actions.moveRow?.(sectionId, index, 1); }} title="Move row down"><ChevronDown size={11} /></button>}{actions.duplicateRow && <button type="button" className="builder-wireframe-action-btn" onClick={(e) => { e.stopPropagation(); actions.duplicateRow?.(sectionId, index); }} title="Duplicate row"><Copy size={10} /></button>}{actions.deleteRow && <button type="button" className="builder-wireframe-action-btn builder-wireframe-action-btn--danger" onClick={(e) => { e.stopPropagation(); if (empty) actions.deleteRow?.(sectionId, index); }} disabled={!empty} title={empty ? "Delete empty row" : "Remove elements before deleting this row"}><Trash2 size={10} /></button>}</div></span>
      </div></div>
    {!collapsed && <div className="builder-wireframe-children builder-wireframe-children--columns">{row.items.map((item, columnIndex) => <WireframeColumn key={item.id ?? `layout-item-${row.startIndex + columnIndex}`} sectionId={sectionId} item={item as NonNullable<BuilderSection["layoutItems"]>[number]} index={columnIndex} flatIndex={row.startIndex + columnIndex} ratio={preset.ratios[columnIndex] ?? 1} totalRatio={totalRatio} selectedColumnKey={selectedColumnKey} selectedBlockKey={selectedBlockKey} hoveredColumnKey={hoveredColumnKey} hoveredBlockKey={hoveredBlockKey} actions={actions} />)}</div>}
  </div>;
}, sameRow);

function targetRowIndex(section: BuilderSection, target: BuilderInteractionTarget | null | undefined) {
  if (!target || target.sectionId !== section.id) return null;
  if (target.type === "row") return target.rowIndex;
  if (target.type === "section") return null;
  return getWireframeRows(section).findIndex((row) => row.items.some((item) => {
    const column = item as NonNullable<BuilderSection["layoutItems"]>[number];
    return column.id === target.columnKey || Boolean(
      column.nestedLayout?.rows.some((nested) =>
        nested.columns.some((nestedColumn) => nestedColumn.id === target.columnKey),
      ),
    );
  }));
}

const WireframeSection = memo(function WireframeSection({ section, index, total, collapsed, selected, hovered, hasSelectedDescendant, hasHoveredDescendant, selectedTarget, hoveredTarget, editing, renameDraft, onRenameDraft, onStartRename, onFinishRename, onToggle, actions, header }: {
  section: BuilderSection; index: number; total: number; collapsed: boolean; selected: boolean; hovered: boolean; hasSelectedDescendant: boolean; hasHoveredDescendant: boolean; selectedTarget: BuilderInteractionTarget | null; hoveredTarget: BuilderInteractionTarget | null;
  editing: boolean; renameDraft: string; onRenameDraft: (value: string) => void; onStartRename: (section: BuilderSection) => void; onFinishRename: (sectionId: string, commit: boolean) => void; onToggle: (sectionId: string) => void; actions: BuilderWireframeActions; header: boolean;
}) {
  const rows = useMemo(() => getWireframeRows(section), [section]);
  const [collapsedRows, setCollapsedRows] = useState<Set<string>>(() => new Set());
  const selectedRow = targetRowIndex(section, selectedTarget); const hoveredRow = targetRowIndex(section, hoveredTarget);
  useEffect(() => { if (selectedRow === null) return; const key = `${section.id}:${selectedRow}`; setCollapsedRows((current) => current.has(key) ? new Set([...current].filter((entry) => entry !== key)) : current); }, [section.id, selectedRow]);
  useEffect(() => { if (hoveredRow === null) return; const key = `${section.id}:${hoveredRow}`; setCollapsedRows((current) => current.has(key) ? new Set([...current].filter((entry) => entry !== key)) : current); }, [section.id, hoveredRow]);
  const toggleRow = useCallback((key: string) => setCollapsedRows((current) => { const next = new Set(current); next.has(key) ? next.delete(key) : next.add(key); return next; }), []);
  return <div className={`builder-wireframe-section${selected ? " is-selected" : ""}`} data-structure-has-selected-descendant={hasSelectedDescendant || undefined} data-structure-has-hovered-descendant={hasHoveredDescendant || undefined}>
    <div className="builder-wireframe-rowline"><button type="button" className={`builder-wireframe-toggle${collapsed ? "" : " is-expanded"}`} onClick={() => onToggle(section.id)} aria-label={collapsed ? "Expand section" : "Collapse section"}><ChevronRight size={13} /></button>
      <div className={`builder-wireframe-item builder-wireframe-item--section${selected ? " is-selected" : ""}${hovered ? " is-hovered" : ""}`} data-structure-key={`section:${section.id}`} onMouseEnter={() => actions.hover?.({ type: "section", sectionId: section.id })} onMouseLeave={() => actions.hover?.(null)} onClick={() => actions.selectSection(section.id)} onDoubleClick={(e) => { e.stopPropagation(); onStartRename(section); }} role="treeitem" tabIndex={0} aria-selected={selected}>
        {!header && <GripVertical size={11} className="builder-wireframe-grip" />}<Layers3 size={13} className="builder-wireframe-icon builder-wireframe-icon--section" />
        {editing ? <input className="builder-wireframe-rename-input" value={renameDraft} onChange={(e) => onRenameDraft(e.target.value)} onBlur={() => onFinishRename(section.id, true)} onKeyDown={(e) => { if (e.key === "Enter") onFinishRename(section.id, true); if (e.key === "Escape") onFinishRename(section.id, false); }} aria-label="Section name" /> : <span className="builder-wireframe-label-wrap"><strong>{section.name || section.title || sectionLabels[section.kind] || `Section ${index + 1}`}</strong><small>{header ? "Header" : "Section"}</small></span>}
        {!section.visible && <em className="builder-wireframe-hidden-tag">Hidden</em>}<span className="builder-wireframe-meta"><span className="builder-wireframe-badge builder-wireframe-badge--section">{header ? "HDR" : "SEC"}</span>{!header && <div className="builder-wireframe-actions"><button type="button" className="builder-wireframe-action-btn builder-wireframe-action-btn--settings" onClick={(e) => { e.stopPropagation(); actions.selectSection(section.id); }} title="Open section settings"><Settings2 size={10} /></button>{actions.renameSection && <button type="button" className="builder-wireframe-action-btn" onClick={(e) => { e.stopPropagation(); onStartRename(section); }} title="Rename section"><Type size={10} /></button>}{actions.moveSection && <button type="button" className="builder-wireframe-action-btn" onClick={(e) => { e.stopPropagation(); actions.moveSection?.(section.id, -1); }} disabled={index === 0} title="Move section up"><ChevronUp size={11} /></button>}{actions.moveSection && <button type="button" className="builder-wireframe-action-btn" onClick={(e) => { e.stopPropagation(); actions.moveSection?.(section.id, 1); }} disabled={index === total - 1} title="Move section down"><ChevronDown size={11} /></button>}{actions.duplicateSection && <button type="button" className="builder-wireframe-action-btn" onClick={(e) => { e.stopPropagation(); actions.duplicateSection?.(section.id); }} title="Duplicate section"><Copy size={10} /></button>}{actions.deleteSection && <button type="button" className="builder-wireframe-action-btn builder-wireframe-action-btn--danger" onClick={(e) => { e.stopPropagation(); actions.deleteSection?.(section.id); }} title="Delete section"><Trash2 size={10} /></button>}</div>}</span>
      </div></div>
    {!collapsed && <div className="builder-wireframe-children">{rows.length === 0 ? <div className="builder-wireframe-empty-row-actions"><button type="button" className="builder-wireframe-item builder-wireframe-item--empty" onClick={() => actions.selectSection(section.id)}><Square size={12} className="builder-wireframe-icon" /><span className="builder-wireframe-label-wrap"><strong>No rows</strong><small>Section settings</small></span></button>{actions.addRow ? <button type="button" className="builder-wireframe-add-section is-empty" onClick={() => actions.addRow?.(section.id, 0, "1-col")}><Plus size={13} /> Add first row</button> : null}</div> : rows.map((row, rowIndex) => {
      const rowSelectedTarget = selectedRow === rowIndex ? selectedTarget : null; const rowHoveredTarget = hoveredRow === rowIndex ? hoveredTarget : null;
      return <WireframeRow key={row.id} sectionId={section.id} row={row} index={rowIndex} collapsed={collapsedRows.has(`${section.id}:${rowIndex}`)} selected={selectedTarget?.type === "row" && selectedRow === rowIndex} hovered={hoveredTarget?.type === "row" && hoveredRow === rowIndex} selectedColumnKey={rowSelectedTarget?.type === "column" || rowSelectedTarget?.type === "block" ? rowSelectedTarget.columnKey : null} selectedBlockKey={rowSelectedTarget?.type === "block" ? rowSelectedTarget.blockKey : null} hoveredColumnKey={rowHoveredTarget?.type === "column" || rowHoveredTarget?.type === "block" ? rowHoveredTarget.columnKey : null} hoveredBlockKey={rowHoveredTarget?.type === "block" ? `${rowHoveredTarget.columnKey}:${rowHoveredTarget.blockKey}` : null} onToggle={toggleRow} actions={actions} />;
    })}</div>}
  </div>;
});

export default function BuilderWireframePanel({ page, pageLabel, documentKindLabel = "Page", documentBadgeLabel = "Page", structureLabel, structureAriaLabel = "Page structure", sections, selectedSectionId, selectedLayoutRowIndex, selectedLayoutColumnKey, selectedLayoutBlockKey, hoveredTarget = null, actions, renameSectionId = null }: Props) {
  const treeRef = useRef<HTMLDivElement>(null); const renameDraftRef = useRef(""); const [collapsedSections, setCollapsedSections] = useState<Set<string>>(() => new Set()); const [editingSectionId, setEditingSectionId] = useState<string | null>(null); const [renameDraft, setRenameDraft] = useState("");
  const selected = useMemo(() => selectedKey(selectedSectionId, selectedLayoutRowIndex, selectedLayoutColumnKey, selectedLayoutBlockKey), [selectedSectionId, selectedLayoutRowIndex, selectedLayoutColumnKey, selectedLayoutBlockKey]);
  const hovered = useMemo(() => structureKey(hoveredTarget), [hoveredTarget]); const header = page === "header";
  useEffect(() => { setCollapsedSections((current) => { const valid = new Set(sections.map((section) => section.id)); const next = new Set([...current].filter((id) => valid.has(id))); if (selectedSectionId) next.delete(selectedSectionId); return next.size === current.size && [...next].every((id) => current.has(id)) ? current : next; }); }, [sections, selectedSectionId]);
  useEffect(() => { if (!renameSectionId) return; const section = sections.find((item) => item.id === renameSectionId); if (!section) return; setEditingSectionId(section.id); renameDraftRef.current = section.name ?? ""; setRenameDraft(section.name ?? ""); }, [renameSectionId, sections]);
  // Hovering the canvas should highlight the matching tree item without
  // hijacking the user's scroll position. Only an explicit selection should
  // bring the corresponding structure node into view.
  useEffect(() => { const node = selected ? treeRef.current?.querySelector<HTMLElement>(`[data-structure-key="${CSS.escape(selected)}"]`) : null; node?.scrollIntoView({ block: "nearest", inline: "nearest" }); }, [selected]);
  const setRenameValue = useCallback((value: string) => { renameDraftRef.current = value; setRenameDraft(value); }, []);
  const finishRename = useCallback((sectionId: string, commit: boolean) => { if (commit && renameDraftRef.current.trim()) actions.renameSection?.(sectionId, renameDraftRef.current.trim()); setEditingSectionId(null); renameDraftRef.current = ""; setRenameDraft(""); actions.renameComplete?.(); }, [actions]);
  const beginRename = useCallback((section: BuilderSection) => { setEditingSectionId(section.id); renameDraftRef.current = section.name ?? ""; setRenameDraft(section.name ?? ""); }, []);
  const toggle = useCallback((id: string) => setCollapsedSections((current) => { const next = new Set(current); next.has(id) ? next.delete(id) : next.add(id); return next; }), []);
  const headerRows = header ? sections.reduce((count, section) => count + getWireframeRows(section).length, 0) : 0;
  return (
    <div className="builder-sidebar-panel builder-wireframe-panel">
      <div className="builder-wireframe-header-consolidated">
        <div className="builder-wireframe-header-row">
          <div className="builder-wireframe-header-title-wrap">
            <FileText size={13} className="builder-wireframe-icon builder-wireframe-icon--page" />
            <strong>{pageLabel}</strong>
          </div>
          <span className="builder-wireframe-badge builder-wireframe-badge--page">{documentBadgeLabel}</span>
        </div>
        <div className="builder-wireframe-header-row builder-wireframe-header-row--sub">
          <span>{structureLabel ?? (header ? "Header structure" : `${documentKindLabel} structure`)}</span>
          <small>{header ? `${headerRows} ${headerRows === 1 ? "row" : "rows"}` : `${sections.length} ${sections.length === 1 ? "section" : "sections"}`}</small>
        </div>
      </div>
      <div ref={treeRef} className="builder-wireframe-tree" role="tree" aria-label={structureAriaLabel}>
        {sections.length === 0 ? (
          <div className="builder-wireframe-empty">
            <Layers3 size={16} />
            <strong>No sections</strong>
            <span>Add a section to start building this page.</span>
            {actions.addSection ? (
              <button
                type="button"
                className="builder-wireframe-add-section is-empty"
                onClick={() => actions.addSection?.(null, "below")}
              >
                <Plus size={13} />
                Add first section
              </button>
            ) : null}
          </div>
        ) : sections.map((section, index) => {
          const sectionSelectedKey = `section:${section.id}`;
          const sectionHoveredKey = sectionSelectedKey;
          const selectedTarget = selectedSectionId === section.id
            ? selectedLayoutBlockKey
              ? { type: "block" as const, sectionId: selectedSectionId, columnKey: selectedLayoutColumnKey!, blockKey: selectedLayoutBlockKey }
              : selectedLayoutColumnKey
                ? { type: "column" as const, sectionId: selectedSectionId, columnKey: selectedLayoutColumnKey }
                : selectedLayoutRowIndex !== null
                  ? { type: "row" as const, sectionId: selectedSectionId, rowIndex: selectedLayoutRowIndex }
                  : { type: "section" as const, sectionId: selectedSectionId }
            : null;
          return (
            <div key={section.id} className="builder-wireframe-section-slot">
              <WireframeSection
                section={section}
              index={index}
              total={sections.length}
              collapsed={collapsedSections.has(section.id)}
              selected={selected === sectionSelectedKey}
              hovered={hovered === sectionHoveredKey}
              hasSelectedDescendant={isDescendant(sectionSelectedKey, selected)}
              hasHoveredDescendant={isDescendant(sectionHoveredKey, hovered)}
              selectedTarget={selectedTarget}
              hoveredTarget={hoveredTarget?.sectionId === section.id ? hoveredTarget : null}
              editing={editingSectionId === section.id}
              renameDraft={editingSectionId === section.id ? renameDraft : ""}
              onRenameDraft={setRenameValue}
              onStartRename={beginRename}
              onFinishRename={finishRename}
              onToggle={toggle}
              actions={actions}
              header={header}
              />
              {!header && actions.addSection ? (
                <button
                  type="button"
                  className="builder-wireframe-insert-section"
                  onClick={() => actions.addSection?.(section.id, "below")}
                  aria-label={`Add section after ${section.name || section.title || `Section ${index + 1}`}`}
                  title="Add section here"
                >
                  <Plus size={12} />
                </button>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
