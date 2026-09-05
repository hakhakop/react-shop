"use client";

import { useState } from "react";
import { ArrowLeft, Plus } from "lucide-react";
import { WireframeRow, type BuilderWireframeActions } from "@/components/dashboard/BuilderWireframePanel";
import ElementLibrary from "@/components/dashboard/ElementLibrary";
import { ElementLibraryIcon } from "@/components/dashboard/elementIconRegistry";
import { baseLayoutBlockKinds } from "@/components/dashboard/builderRegistry";
import { createLayoutBlock } from "@/components/dashboard/builderDefaults";
import type { BuilderRow, BuilderLayoutBlock, InspectorTab } from "@/components/dashboard/builderTypes";
import { applySublayoutPreset, createSublayoutRow, duplicateSublayoutNode } from "@/lib/builderSublayout";
import { getInspectorElementCapabilityDeclaration } from "../inspectorRouting";

export type SublayoutSelection = { row: string; column?: string; element?: string };
type Props = {
  layoutLabel?: string;
  openElementLibrary?: (insert: (kind: NonNullable<BuilderLayoutBlock["kind"]>) => void) => void;
  ownerId: string;
  rows: BuilderRow[];
  updateRows: (rows: BuilderRow[]) => void;
  open: (selection: SublayoutSelection, tab: InspectorTab) => void;
  closeDetails: () => void;
};

/** Same Structure row/column/cards and element library as the page builder.
 * This adapter only scopes actions to the Sublayout's canonical rows.
 */
export default function SublayoutStructure({ ownerId, rows, updateRows, open, closeDetails, layoutLabel = "Sublayout", openElementLibrary }: Props) {
  const [insertion, setInsertion] = useState<{ columnKey: string; insertionIndex?: number } | null>(null);
  const [collapsedColumns, setCollapsedColumns] = useState<Set<string>>(() => new Set());
  const sectionId = `sublayout:${ownerId}`;
  const findRow = (columnKey: string) => rows.find(row => row.columns.some(column => column.id === columnKey));
  const updateElements = (columnKey: string, transform: (elements: BuilderLayoutBlock[]) => BuilderLayoutBlock[]) => updateRows(rows.map(row => ({ ...row, columns: row.columns.map(column => column.id === columnKey ? { ...column, elements: transform(column.elements) } : column) })));
  const actions: BuilderWireframeActions = {
    selectSection: () => {},
    selectRow: (_, index) => { if (rows[index]) open({ row: rows[index].id }, "settings"); },
    selectColumn: (_, columnKey) => { const row = findRow(columnKey); if (row) open({ row: row.id, column: columnKey }, "settings"); },
    selectBlock: (_, columnKey, blockKey) => { const row = findRow(columnKey); if (row) open({ row: row.id, column: columnKey, element: blockKey }, "content"); },
    openElements: target => {
      // Structure selects the target column before opening its library. Keep
      // that preselection from replacing the library with Column settings.
      closeDetails();
      if (openElementLibrary) {
        openElementLibrary(kind => {
          const row = findRow(target.columnKey);
          if (!row) return;
          const element = createLayoutBlock(kind);
          updateElements(target.columnKey, elements => {
            const at = target.insertionIndex ?? elements.length;
            return [...elements.slice(0, at), element, ...elements.slice(at)];
          });
          open({ row: row.id, column: target.columnKey, element: element.id }, "content");
        });
        return;
      }
      setInsertion(target);
    },
    addRow: (_, index, placement, preset) => {
      const at = index + (placement === "after" ? 1 : 0);
      updateRows([...rows.slice(0, at), applySublayoutPreset(createSublayoutRow(), preset), ...rows.slice(at)]);
    },
    duplicateRow: (_, index) => { if (rows[index]) updateRows([...rows.slice(0, index + 1), duplicateSublayoutNode(rows[index]), ...rows.slice(index + 1)]); },
    deleteRow: (_, index) => { if (rows[index]?.columns.every(column => column.elements.length === 0)) updateRows(rows.filter((_, i) => i !== index)); },
    moveRow: (_, index, direction) => {
      const nextIndex = index + direction;
      if (nextIndex < 0 || nextIndex >= rows.length) return;
      const next = [...rows]; [next[index], next[nextIndex]] = [next[nextIndex], next[index]]; updateRows(next);
    },
    duplicateBlock: ({ columnKey, blockKey }) => updateElements(columnKey, elements => elements.flatMap(element => element.id === blockKey ? [element, duplicateSublayoutNode(element)] : [element])),
    deleteBlock: ({ columnKey, blockKey }) => updateElements(columnKey, elements => elements.filter(element => element.id !== blockKey)),
    moveBlock: ({ columnKey, blockKey, direction }) => updateElements(columnKey, elements => {
      const index = elements.findIndex(element => element.id === blockKey);
      const target = index + direction;
      if (index < 0 || target < 0 || target >= elements.length) return elements;
      const next = [...elements]; [next[index], next[target]] = [next[target], next[index]]; return next;
    }),
  };

  if (insertion && findRow(insertion.columnKey)) return <div className="builder-sublayout-library">
    <button type="button" className="builder-column-layout-back" onClick={() => setInsertion(null)}><ArrowLeft size={18} />Back to {layoutLabel}</button>
    <ElementLibrary availableLayoutBlockKinds={baseLayoutBlockKinds.filter(kind => Boolean(getInspectorElementCapabilityDeclaration(kind)))} onRenderLayoutBlockIcon={kind => <ElementLibraryIcon kind={kind} />} onAddElement={kind => {
      const row = findRow(insertion.columnKey)!;
      const element = createLayoutBlock(kind);
      updateElements(insertion.columnKey, elements => {
        const at = insertion.insertionIndex ?? elements.length;
        return [...elements.slice(0, at), element, ...elements.slice(at)];
      });
      setInsertion(null);
      open({ row: row.id, column: insertion.columnKey, element: element.id }, "content");
    }} />
  </div>;

  return <div className="builder-sublayout-structure builder-structure-panel builder-wireframe-panel" data-sublayout-editor>
    <div className="builder-structure-tree builder-wireframe-tree" role="tree" aria-label={`${layoutLabel} structure`}>
      {rows.map((row, index) => <div key={row.id} className="builder-structure-row-slot">
        <WireframeRow sectionId={sectionId} row={{ id: row.id, layoutKey: row.layout, startIndex: 0, items: row.columns.map(column => ({ id: column.id, rowId: row.id, rowLayout: row.layout, responsiveWidths: column.responsiveWidths, blocks: column.elements })) }} index={index} collapsed={false} selected={false} hovered={false} selectedColumnKey={null} selectedBlockKey={null} hoveredColumnKey={null} hoveredBlockKey={null} collapsedColumns={collapsedColumns} onToggleRow={() => {}} onToggleColumn={key => setCollapsedColumns(current => { const next = new Set(current); if (next.has(key)) next.delete(key); else next.add(key); return next; })} actions={actions} />
        <div className="builder-structure-insert-row-slot"><button type="button" className="builder-structure-insert-row-btn" aria-label={`Add row after Row ${index + 1}`} onClick={() => actions.addRow?.(sectionId, index, "after", "1-col")}><Plus size={9} /><span className="builder-structure-insert-label">Add Row</span></button></div>
      </div>)}
      {rows.length === 0 && <div className="builder-structure-empty"><p>Add a row to start this layout.</p><button type="button" className="builder-structure-add-btn" onClick={() => updateRows([createSublayoutRow()])}><Plus size={13} />Add first row</button></div>}
    </div>
  </div>;
}
