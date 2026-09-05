"use client";
import "./sublayout.css";

import { useState } from "react";
import { createPortal } from "react-dom";
import type { EmbeddedBuilderHost } from "../../EmbeddedBuilderHost";
import { ArrowLeft } from "lucide-react";
import type { BuilderRow, BuilderLayoutBlock, InspectorTab } from "@/components/dashboard/builderTypes";
import { layoutBlockLabels } from "@/components/dashboard/builderRegistry";
import { applySublayoutPreset } from "@/lib/builderSublayout";
import SublayoutStructure, { type SublayoutSelection } from "./SublayoutStructure";
import { getInspectorElementCapabilityDeclaration, type InspectorPanelContext } from "../inspectorRouting";
import ElementCapabilityComposer from "../ElementCapabilityComposer";
import RowCapabilityPanel from "./RowCapabilityPanel";
import ColumnCapabilityPanel from "./ColumnCapabilityPanel";
import DynamicContentInspectorGroup from "./DynamicContentInspectorGroup";
import { InspectorDivision, InspectorFieldRow, InspectorSelect, InspectorSwitch, InspectorTextField, InspectorTextarea, inspectorDynamicBinding } from "../InspectorControls";
const elementLabel = (element: BuilderLayoutBlock) => element.title || (element.kind ? layoutBlockLabels[element.kind] : "Element");

export default function SublayoutCapabilityPanel(context: InspectorPanelContext & { layoutLabel?: string; host?: EmbeddedBuilderHost }) {
  const layoutLabel = context.layoutLabel ?? "Sublayout";
  const { block, tab, update } = context;
  const settings = block.sublayout ?? { rows: [] };
  const [selection, setSelection] = useState<SublayoutSelection | null>(null);
  const [detailTab, setDetailTab] = useState<InspectorTab>("content");
  const patch = (next: Partial<typeof settings>) => update({ sublayout: { ...settings, ...next } });
  const rows = settings.rows;
  const patchRow = (id: string, next: Partial<BuilderRow>) => patch({ rows: rows.map(row => row.id === id ? { ...row, ...next } : row) });
  const open = (next: NonNullable<typeof selection>, nextTab: InspectorTab) => { setSelection(next); setDetailTab(nextTab); context.host?.showInspector(); };
  const structure = <SublayoutStructure layoutLabel={layoutLabel} ownerId={block.id ?? "sublayout"} rows={rows} updateRows={rows => patch({ rows })} open={open} closeDetails={() => setSelection(null)} openElementLibrary={context.host?.openElements} />;
  if (tab === "advanced") return <div className="builder-inspector-stack">
    <InspectorFieldRow label="Name"><InspectorTextField ariaLabel="Name" value={block.title ?? ""} onChange={title => update({ title })} /></InspectorFieldRow>
    <InspectorFieldRow label="Status"><InspectorSwitch label="Disable element" checked={settings.disabled ?? false} onChange={disabled => patch({ disabled })} /></InspectorFieldRow>
    <DynamicContentInspectorGroup item={block} update={update} categoryTree={context.previewCategoryTree} />
    <InspectorFieldRow label="ID" dynamicBinding={inspectorDynamicBinding(block, update, "sublayoutHtmlId")}><InspectorTextField ariaLabel="ID" value={block.sublayoutHtmlId ?? ""} onChange={sublayoutHtmlId => update({ sublayoutHtmlId })} /></InspectorFieldRow>
    <InspectorFieldRow label="Classes" dynamicBinding={inspectorDynamicBinding(block, update, "sublayoutClasses")}><InspectorTextField ariaLabel="Classes" value={block.sublayoutClasses ?? ""} onChange={sublayoutClasses => update({ sublayoutClasses })} /></InspectorFieldRow>
    <InspectorFieldRow label="Attributes" dynamicBinding={inspectorDynamicBinding(block, update, "sublayoutAttributes")}><InspectorTextarea ariaLabel="Attributes" value={block.sublayoutAttributes ?? ""} onChange={sublayoutAttributes => update({ sublayoutAttributes })} /></InspectorFieldRow>
    <InspectorFieldRow label="CSS" help="Use .el-element to target this Sublayout."><InspectorTextarea ariaLabel="CSS" value={block.visualStyle?.customCss ?? ""} onChange={customCss => update({ visualStyle: { ...block.visualStyle, customCss } })} /></InspectorFieldRow>
  </div>;
  if (tab !== "content") return <InspectorDivision title="SUBLAYOUT"><InspectorFieldRow label="HTML Element"><InspectorSelect ariaLabel="HTML Element" value={settings.htmlElement ?? "div"} options={["div", "address", "article", "aside", "footer", "header", "hgroup", "nav", "section"].map(value => ({ value, label: value }))} onChange={value => patch({ htmlElement: value as typeof settings.htmlElement })} /></InspectorFieldRow></InspectorDivision>;

  const row = rows.find(row => row.id === selection?.row);
  const column = row?.columns.find(column => column.id === selection?.column);
  const element = column?.elements.find(element => element.id === selection?.element);
  if (row && selection) {
    const patchColumn = (next: Partial<NonNullable<typeof column>>) => patchRow(row.id, { columns: row.columns.map(item => item.id === column?.id ? { ...item, ...next } : item) });
    const patchElement = (next: Partial<BuilderLayoutBlock>) => patchColumn({ elements: column!.elements.map(item => item.id === element?.id ? { ...item, ...next } : item) });
    const declaration = element ? getInspectorElementCapabilityDeclaration(element.kind) : undefined;
    const detail = <div className="builder-inspector-stack" data-sublayout-detail>
      <button type="button" className="builder-column-layout-back" onClick={() => setSelection(null)}><ArrowLeft size={18} />Back to {layoutLabel}</button>
      <h3>{element ? elementLabel(element) : column ? "Column" : "Row"}</h3>
      <div className="builder-inspector-tabs" aria-label="Nested Inspector tabs">{(element ? ["content", "settings", "advanced"] : ["settings", "advanced"]).map(value => <button type="button" key={value} className={detailTab === value ? "is-active" : ""} aria-pressed={detailTab === value} onClick={() => setDetailTab(value as InspectorTab)}>{value[0].toUpperCase() + value.slice(1)}</button>)}</div>
      {element && declaration ? <ElementCapabilityComposer {...context} block={element} tab={detailTab} update={patchElement} declaration={declaration} /> : column ? <ColumnCapabilityPanel column={column} tab={detailTab} update={patchColumn} openWordPressMediaPicker={context.openWordPressMediaPicker} /> : <RowCapabilityPanel row={row} tab={detailTab} update={next => patchRow(row.id, next)} applyLayoutPreset={key => patchRow(row.id, applySublayoutPreset(row, key))} onEditColumn={id => open({ row: row.id, column: id }, "settings")} />}
    </div>;
    return context.host ? <>{structure}{context.host.inspectorTarget && createPortal(detail, context.host.inspectorTarget)}</> : detail;
  }
  return structure;
}
