"use client";

import { useState } from "react";
import { ArrowLeft, Columns3, ChevronRight } from "lucide-react";
import type {
  BuilderColumn,
  BuilderLayoutAdvancedSettings,
  BuilderLayoutHtmlElement,
  BuilderResponsiveColumnOrder,
  BuilderResponsiveColumnWidths,
  BuilderRow,
  InspectorTab,
} from "@/components/dashboard/builderTypes";
import { builderRowLayoutPresets } from "@/components/dashboard/builderLayoutPresets";
import {
  InspectorFieldRow,
  InspectorDivision,
  InspectorPillGroup,
  InspectorSelect,
  InspectorSwitch,
  InspectorTextarea,
  InspectorTextField,
} from "@/components/dashboard/inspector/InspectorControls";
import DynamicContentInspectorGroup from "@/components/dashboard/inspector/panels/DynamicContentInspectorGroup";

type Props = {
  row: BuilderRow;
  tab: InspectorTab;
  update: (patch: Partial<BuilderRow>) => void;
  applyLayoutPreset: (key: string) => void;
  onEditColumn: (columnId: string) => void;
};

const gapOptions = [
  { value: "small", label: "Small" },
  { value: "medium", label: "Medium" },
  { value: "default", label: "Default" },
  { value: "large", label: "Large" },
  { value: "none", label: "None" },
] as const;

const marginOptions = [
  { value: "inherit", label: "Keep existing" },
  { value: "small", label: "Small" },
  { value: "default", label: "Default" },
  { value: "medium", label: "Medium" },
  { value: "large", label: "Large" },
  { value: "xlarge", label: "X-Large" },
  { value: "none", label: "None" },
] as const;

const maxWidthOptions = [
  { value: "default", label: "Default" },
  { value: "xsmall", label: "X-Small" },
  { value: "small", label: "Small" },
  { value: "large", label: "Large" },
  { value: "xlarge", label: "X-Large" },
  { value: "expand", label: "Expand" },
  { value: "none", label: "None" },
] as const;

const responsiveColumnWidthOptions = [
  { value: "", label: "-" },
  { value: "1/1", label: "1/1" },
  { value: "1/2", label: "1/2" },
  { value: "1/3", label: "1/3" },
  { value: "2/3", label: "2/3" },
  { value: "1/4", label: "1/4" },
  { value: "3/4", label: "3/4" },
  { value: "1/5", label: "1/5" },
  { value: "2/5", label: "2/5" },
  { value: "3/5", label: "3/5" },
  { value: "4/5", label: "4/5" },
  { value: "1/6", label: "1/6" },
  { value: "5/6", label: "5/6" },
  { value: "auto", label: "Auto" },
  { value: "expand", label: "Expand" },
] as const;

const responsiveWidthFields = [
  ["default", "Phone Portrait"],
  ["small", "Phone Landscape"],
  ["medium", "Tablet Landscape"],
  ["large", "Desktop"],
  ["xlarge", "Large Screen"],
] as const;

const orderFirstOptions = [
  { value: "", label: "None" },
  { value: "default", label: "Phone Portrait" },
  { value: "small", label: "Phone Landscape" },
  { value: "medium", label: "Tablet Landscape" },
  { value: "large", label: "Desktop" },
  { value: "xlarge", label: "Large Screen" },
] as const;

function marginToken(value: BuilderRow["topMargin"]) {
  if (!value || value === "0px") return "inherit";
  const legacyPxTokens: Record<string, string> = {
    "10px": "small",
    "20px": "default",
    "40px": "medium",
    "70px": "large",
    "140px": "xlarge",
  };
  return legacyPxTokens[value] ?? value;
}

function advancedAttributesValue(
  attributes: BuilderLayoutAdvancedSettings["attributes"],
) {
  if (!attributes) return "";
  return typeof attributes === "string"
    ? attributes
    : Object.entries(attributes).map(([name, value]) => `${name}=${value}`).join("\n");
}

function RowCheck({ checked, onChange, label, disabled = false }: { checked: boolean; onChange: (checked: boolean) => void; label?: string; disabled?: boolean }) {
  return <InspectorSwitch checked={checked} disabled={disabled} onChange={onChange} label={label} />;
}

function RowLayoutPreview({
  presetKey,
  ratios,
  className,
}: {
  presetKey: string;
  ratios: number[];
  className: string;
}) {
  const arrowColumns = presetKey === "fixed-left"
    ? [1]
    : presetKey === "fixed-right"
      ? [0]
      : presetKey === "fixed-inner"
        ? [0, 2]
        : presetKey === "fixed-outer"
          ? [1]
          : [];

  return (
    <span className={className} aria-hidden="true">
      {ratios.map((ratio, index) => (
        <i key={index} style={{ flex: ratio }}>
          {arrowColumns.includes(index) ? <span className="builder-layout-preset-arrows">←&nbsp;&nbsp;→</span> : null}
        </i>
      ))}
    </span>
  );
}

function firstOrderBreakpoint(order: BuilderResponsiveColumnOrder | undefined) {
  return (["default", "small", "medium", "large", "xlarge"] as const).find(
    (breakpoint) => order?.[breakpoint] === "first",
  ) ?? "";
}

export default function RowCapabilityPanel({
  row,
  tab,
  update,
  applyLayoutPreset,
  onEditColumn,
}: Props) {
  const [layoutPickerOpen, setLayoutPickerOpen] = useState(false);
  const [columnLayoutOpen, setColumnLayoutOpen] = useState(false);
  const currentLayout = builderRowLayoutPresets.find((preset) => preset.key === row.layout);
  const updateAdvanced = (patch: Partial<BuilderLayoutAdvancedSettings>) =>
    update({ advanced: { ...(row.advanced ?? {}), ...patch } });
  const updateColumn = (columnId: string, patch: Partial<BuilderColumn>) => {
    update({
      columns: row.columns.map((column) =>
        column.id === columnId ? { ...column, ...patch } : column,
      ),
    });
  };
  const updateColumnWidth = (
    column: BuilderColumn,
    breakpoint: keyof BuilderResponsiveColumnWidths,
    value: string,
  ) => {
    const responsiveWidths = { ...(column.responsiveWidths ?? {}) };
    if (value) responsiveWidths[breakpoint] = value;
    else delete responsiveWidths[breakpoint];
    updateColumn(column.id, {
      responsiveWidths: Object.keys(responsiveWidths).length > 0 ? responsiveWidths : undefined,
    });
  };
  const updateColumnFirstOrder = (column: BuilderColumn, breakpoint: string) => {
    const order: BuilderResponsiveColumnOrder = { ...(column.order ?? {}) };
    (["default", "small", "medium", "large", "xlarge"] as const).forEach((key) => {
      if (order[key] === "first") delete order[key];
    });
    if (breakpoint) {
      order[breakpoint as keyof BuilderResponsiveColumnOrder] = "first";
    }
    updateColumn(column.id, { order: Object.keys(order).length > 0 ? order : undefined });
  };

  if (tab === "settings" || tab === "layout") {
    if (columnLayoutOpen) {
      return (
        <div className="builder-column-layout-editor" data-canonical-owner="BuilderRow">
          <button
            type="button"
            className="builder-column-layout-back"
            onClick={() => setColumnLayoutOpen(false)}
          >
            <ArrowLeft size={22} aria-hidden="true" />
            <span>ROW</span>
          </button>
          <h2>COLUMN LAYOUT</h2>
          {row.columns.map((column, index) => (
            <InspectorDivision key={column.id} title={`COLUMN ${index + 1}`}>
              {responsiveWidthFields.map(([breakpoint, label]) => (
                <InspectorFieldRow key={breakpoint} label={label}>
                  <InspectorSelect
                    value={column.responsiveWidths?.[breakpoint] ?? (breakpoint === "default" ? "1/1" : "")}
                    options={responsiveColumnWidthOptions}
                    onChange={(value) => updateColumnWidth(column, breakpoint, value)}
                    ariaLabel={`${label} width for Column ${index + 1}`}
                  />
                </InspectorFieldRow>
              ))}
              <InspectorFieldRow label="Order First">
                <InspectorSelect
                  value={firstOrderBreakpoint(column.order)}
                  options={orderFirstOptions}
                  onChange={(breakpoint) => updateColumnFirstOrder(column, breakpoint)}
                  ariaLabel={`Order first breakpoint for Column ${index + 1}`}
                />
              </InspectorFieldRow>
            </InspectorDivision>
          ))}
        </div>
      );
    }

    return (
      <div className="builder-inspector-stack" data-canonical-owner="BuilderRow">
        <InspectorDivision title="LAYOUT">
        <div className="builder-row-layout-choice">
          <button
            type="button"
            className="builder-row-layout-preview-button"
            onClick={() => setLayoutPickerOpen(true)}
            aria-haspopup="dialog"
            aria-label="Select a grid layout"
          >
            <RowLayoutPreview presetKey={currentLayout?.key ?? row.layout} ratios={currentLayout?.ratios ?? [1]} className="builder-row-layout-choice-preview" />
            <span>{currentLayout?.label ?? "Whole"}</span>
          </button>
          <button
            type="button"
            className="builder-row-layout-launcher"
            onClick={() => setColumnLayoutOpen(true)}
            aria-label="Edit Column Layout"
          >
            <strong>EDIT LAYOUT</strong>
            <ChevronRight size={22} aria-hidden="true" />
          </button>
          <p>Customize the column widths of the selected layout and set the column order. Changing the layout will reset all customizations.</p>
        </div>
        {layoutPickerOpen ? <div className="builder-layout-modal" role="dialog" aria-modal="true" aria-label="Select a grid layout" onClick={() => setLayoutPickerOpen(false)}>
          <div className="builder-layout-dialog" onClick={(event) => event.stopPropagation()}>
            <div className="builder-layout-header"><div><strong>Select a grid layout</strong><span>Choose the column structure for this Row.</span></div><button type="button" className="builder-layout-close" onClick={() => setLayoutPickerOpen(false)} aria-label="Close layout picker">×</button></div>
            <div className="builder-layout-picker-body"><div className="builder-layout-picker-grid">{builderRowLayoutPresets.map((preset) => <button key={preset.key} type="button" className={`builder-layout-picker-card${preset.key === row.layout ? " is-active" : ""}`} onClick={() => { applyLayoutPreset(preset.key); setLayoutPickerOpen(false); }}><RowLayoutPreview presetKey={preset.key} ratios={preset.ratios} className="builder-row-layout-launcher-preview" /><span className="builder-layout-picker-card-copy"><strong>{preset.label}</strong></span></button>)}</div></div>
          </div>
        </div> : null}

        <section className="builder-inspector-section builder-inspector-section--embedded builder-row-columns-section">
          <h3>Columns</h3>
          <div className="builder-inspector-column-list">
            {row.columns.map((column, index) => (
              <button
                type="button"
                className="builder-inspector-column-item"
                key={column.id}
                onClick={() => onEditColumn(column.id)}
              >
                <span className="builder-inspector-column-item-label">
                  <Columns3 size={13} />
                  <span>Column {index + 1}</span>
                  {column.elements && column.elements.length > 0 && (
                    <small className="builder-inspector-column-item-count">
                      {column.elements.length} {column.elements.length === 1 ? "element" : "elements"}
                    </small>
                  )}
                </span>
                <ChevronRight size={13} className="builder-inspector-column-item-arrow" />
              </button>
            ))}
          </div>
        </section>
        </InspectorDivision>

        <InspectorDivision title="GUTTERS & ALIGNMENT" summary={row.columnGap ?? "Default"}>
        <InspectorFieldRow label="Column Gap">
          <InspectorSelect value={row.columnGap ?? "inherit"} options={gapOptions} onChange={(columnGap) => update({ columnGap })} ariaLabel="Row Column Gap" />
        </InspectorFieldRow>
        <InspectorFieldRow label="Row Gap">
          <InspectorSelect value={row.rowGap ?? "inherit"} options={gapOptions} onChange={(rowGap) => update({ rowGap })} ariaLabel="Row Gap" />
        </InspectorFieldRow>
        <InspectorFieldRow label="Divider">
          <RowCheck checked={row.divider === true} onChange={(divider) => update({ divider })} label="Show dividers" />
        </InspectorFieldRow>
        <InspectorFieldRow label="Alignment">
          <InspectorPillGroup
            value={row.horizontalDistribution ?? "justify"}
            options={[
              { value: "justify", label: "Justify" },
              { value: "left", label: "Left" },
              { value: "center", label: "Center" },
            ]}
            onChange={(horizontalDistribution) => update({ horizontalDistribution })}
            ariaLabel="Row horizontal distribution"
          />
        </InspectorFieldRow>
        </InspectorDivision>

        <InspectorDivision title="WIDTH & HEIGHT" summary={row.maxWidth ?? "None"}>
        <InspectorFieldRow label="Max Width">
          <InspectorSelect
            value={row.maxWidth ?? "none"}
            options={maxWidthOptions}
            onChange={(maxWidth) => update({ maxWidth })}
            ariaLabel="Row Max Width"
          />
        </InspectorFieldRow>
        <InspectorFieldRow label="Remove Horizontal Padding">
          <RowCheck disabled={!row.maxWidth || row.maxWidth === "none"} checked={row.removeHorizontalPadding === true} onChange={(removeHorizontalPadding) => update({ removeHorizontalPadding })} label="Remove horizontal padding" />
        </InspectorFieldRow>
        <InspectorFieldRow label="Expand One Side">
          <InspectorSelect
            value={row.expandOneSide ?? "none"}
            disabled={!row.maxWidth || row.maxWidth === "none"}
            options={[{ value: "none", label: "None" }, { value: "left", label: "Left" }, { value: "right", label: "Right" }]}
            onChange={(expandOneSide) => update({ expandOneSide })}
            ariaLabel="Row one-sided expansion"
          />
        </InspectorFieldRow>

        <InspectorFieldRow label="Column Height">
          <InspectorSelect
            value={row.height?.mode ?? "none"}
            options={[{ value: "none", label: "None" }, { value: "pixels", label: "Pixels" }, { value: "viewport", label: "Viewport" }]}
            onChange={(mode) => update({ height: { ...(row.height ?? {}), mode } })}
            ariaLabel="Row height mode"
          />
        </InspectorFieldRow>
        {row.height?.mode !== undefined && row.height.mode !== "none" ? (
          <div className="builder-two-column">
            <InspectorFieldRow label="Height Value"><InspectorTextField value={row.height.value ?? ""} onChange={(value) => update({ height: { ...(row.height ?? {}), value: value || undefined } })} ariaLabel="Row height value" /></InspectorFieldRow>
            <InspectorFieldRow label="Viewport Offset"><InspectorTextField value={row.height.offset ?? ""} onChange={(offset) => update({ height: { ...(row.height ?? {}), offset: offset || undefined } })} ariaLabel="Row height offset" /></InspectorFieldRow>
          </div>
        ) : null}
        <InspectorFieldRow label="Subtract Height Above Row">
          <RowCheck disabled={!row.height?.mode || row.height.mode === "none"} checked={row.height?.subtractHeightAbove === true} onChange={(subtractHeightAbove) => update({ height: { ...(row.height ?? {}), subtractHeightAbove } })} label="Subtract height above row" />
        </InspectorFieldRow>
        </InspectorDivision>

        <InspectorDivision title="SPACING" summary={marginToken(row.topMargin)}>
        <InspectorFieldRow label="Margin">
          <InspectorSelect
            value={row.topMargin ?? "inherit"}
            options={marginOptions}
            onChange={(topMargin) => update({ topMargin: topMargin === "inherit" ? undefined : topMargin })}
            ariaLabel="Row margin"
          />
        </InspectorFieldRow>
        <InspectorFieldRow label="Remove Top Margin">
          <RowCheck checked={row.topMargin === "none"} onChange={(remove) => update({ topMargin: remove ? "none" : undefined })} label="Remove top margin" />
        </InspectorFieldRow>
        <InspectorFieldRow label="Remove Bottom Margin">
          <RowCheck checked={row.bottomMargin === "none"} onChange={(remove) => update({ bottomMargin: remove ? "none" : undefined })} label="Remove bottom margin" />
        </InspectorFieldRow>
        </InspectorDivision>

        <InspectorDivision title="STRUCTURE & MOTION" summary={row.htmlElement ?? "div"} defaultOpen={false}>
        <InspectorFieldRow label="HTML Element">
          <InspectorSelect value={row.htmlElement ?? "div"} options={["div", "address", "article", "aside", "footer", "header", "hgroup", "nav", "section"].map((value) => ({ value, label: value }))} onChange={(htmlElement) => update({ htmlElement: htmlElement as BuilderLayoutHtmlElement })} ariaLabel="Row HTML Element" />
        </InspectorFieldRow>
        <div className="builder-inspector-section builder-inspector-section--embedded">
          <h3>Column Parallax</h3>
          <InspectorFieldRow label="Justify Columns at the Bottom"><RowCheck checked={row.columnParallax?.justifyAtBottom === true} onChange={(justifyAtBottom) => update({ columnParallax: { ...(row.columnParallax ?? {}), justifyAtBottom } })} label="Justify columns at bottom" /></InspectorFieldRow>
          <div className="builder-two-column">
            <InspectorFieldRow label="Start"><InspectorTextField value={row.columnParallax?.start ?? ""} onChange={(start) => update({ columnParallax: { ...(row.columnParallax ?? {}), start: start || undefined } })} ariaLabel="Column parallax start" /></InspectorFieldRow>
            <InspectorFieldRow label="End"><InspectorTextField value={row.columnParallax?.end ?? ""} onChange={(end) => update({ columnParallax: { ...(row.columnParallax ?? {}), end: end || undefined } })} ariaLabel="Column parallax end" /></InspectorFieldRow>
          </div>
        </div>
        </InspectorDivision>
      </div>
    );
  }

  if (tab === "advanced") {
    return (
      <div className="builder-inspector-stack" data-canonical-owner="BuilderRow">
        <DynamicContentInspectorGroup item={row} update={update} />
        <InspectorDivision title="MARKUP">
          <InspectorFieldRow label="ID"><InspectorTextField value={row.advanced?.htmlId ?? ""} onChange={(htmlId) => updateAdvanced({ htmlId: htmlId || undefined })} ariaLabel="Row Advanced ID" /></InspectorFieldRow>
          <InspectorFieldRow label="Class"><InspectorTextField value={row.advanced?.className ?? ""} onChange={(className) => updateAdvanced({ className: className || undefined })} ariaLabel="Row Advanced Class" /></InspectorFieldRow>
        </InspectorDivision>
        <InspectorDivision title="CUSTOM CODE" defaultOpen={false}>
          <InspectorFieldRow label="Attributes"><InspectorTextarea value={advancedAttributesValue(row.advanced?.attributes)} onChange={(attributes) => updateAdvanced({ attributes: attributes || undefined })} ariaLabel="Row Advanced Attributes" /></InspectorFieldRow>
          <InspectorFieldRow label="CSS"><InspectorTextarea value={row.advanced?.css ?? ""} onChange={(css) => updateAdvanced({ css: css || undefined })} ariaLabel="Row Advanced CSS" /></InspectorFieldRow>
        </InspectorDivision>
      </div>
    );
  }

  return (
    <div className="builder-inspector-stack" data-canonical-owner="BuilderRow" />
  );
}
