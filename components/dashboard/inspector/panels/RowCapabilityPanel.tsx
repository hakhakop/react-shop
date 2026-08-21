"use client";

import { useState } from "react";
import type {
  BuilderLayoutAdvancedSettings,
  BuilderLayoutHtmlElement,
  BuilderRow,
  InspectorTab,
} from "@/components/dashboard/builderTypes";
import { builderRowLayoutPresets } from "@/components/dashboard/builderLayoutPresets";
import {
  InspectorFieldRow,
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

function RowCheck({ checked, onChange, label, disabled = false }: { checked: boolean; onChange: (checked: boolean) => void; label: string; disabled?: boolean }) {
  return <InspectorSwitch checked={checked} disabled={disabled} onChange={onChange} label={label} />;
}

export default function RowCapabilityPanel({
  row,
  tab,
  update,
  applyLayoutPreset,
  onEditColumn,
}: Props) {
  const [layoutPickerOpen, setLayoutPickerOpen] = useState(false);
  const currentLayout = builderRowLayoutPresets.find((preset) => preset.key === row.layout);
  const updateAdvanced = (patch: Partial<BuilderLayoutAdvancedSettings>) =>
    update({ advanced: { ...(row.advanced ?? {}), ...patch } });

  if (tab === "settings" || tab === "layout") {
    return (
      <div className="builder-inspector-stack" data-canonical-owner="BuilderRow">
        <div className="builder-field-header"><strong>Layout</strong></div>
        <button type="button" className="builder-row-layout-launcher" onClick={() => setLayoutPickerOpen(true)} aria-haspopup="dialog" aria-label="Edit Layout">
          <span className="builder-row-layout-launcher-preview" aria-hidden="true">{(currentLayout?.ratios ?? [1]).map((ratio, index) => <i key={index} style={{ flex: ratio }} />)}</span>
          <span><strong>{currentLayout?.label ?? row.layout}</strong><small>Edit Layout</small></span>
        </button>
        <p>Customize the column widths of the selected layout and set the column order. Changing the layout will reset all customizations.</p>
        {layoutPickerOpen ? <div className="builder-layout-modal" role="dialog" aria-modal="true" aria-label="Select a grid layout" onClick={() => setLayoutPickerOpen(false)}>
          <div className="builder-layout-dialog" onClick={(event) => event.stopPropagation()}>
            <div className="builder-layout-header"><div><strong>Select a grid layout</strong><span>Choose the column structure for this Row.</span></div><button type="button" className="builder-layout-close" onClick={() => setLayoutPickerOpen(false)} aria-label="Close layout picker">×</button></div>
            <div className="builder-layout-picker-body"><div className="builder-layout-picker-grid">{builderRowLayoutPresets.map((preset) => <button key={preset.key} type="button" className={`builder-layout-picker-card${preset.key === row.layout ? " is-active" : ""}`} onClick={() => { applyLayoutPreset(preset.key); setLayoutPickerOpen(false); }}><span className="builder-row-layout-launcher-preview" aria-hidden="true">{preset.ratios.map((ratio, index) => <i key={index} style={{ flex: ratio }} />)}</span><span className="builder-layout-picker-card-copy"><strong>{preset.label}</strong></span></button>)}</div></div>
          </div>
        </div> : null}

        <section className="builder-inspector-section">
          <h3>Columns</h3>
          <p>Define a background style or an image of a column and set the vertical alignment for its content.</p>
          {row.columns.map((column, index) => (
            <button type="button" className="builder-secondary-button builder-full-button" key={column.id} onClick={() => onEditColumn(column.id)}>
              Edit Column {index + 1}
            </button>
          ))}
        </section>

        <InspectorFieldRow label="Column Gap">
          <InspectorSelect value={row.columnGap ?? "default"} options={gapOptions} onChange={(columnGap) => update({ columnGap })} ariaLabel="Row Column Gap" />
        </InspectorFieldRow>
        <InspectorFieldRow label="Row Gap">
          <InspectorSelect value={row.rowGap ?? "default"} options={gapOptions} onChange={(rowGap) => update({ rowGap })} ariaLabel="Row Gap" />
        </InspectorFieldRow>
        <InspectorFieldRow label="Divider" description="Show a divider between grid columns.">
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
        <InspectorFieldRow label="Max Width" description="Set the maximum content width. Note: The section may already have a maximum width, which you cannot exceed.">
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
        <InspectorFieldRow label="Expand One Side" description="Expand the width of one side to the left or right while the other side keeps within the constraints of the max width.">
          <InspectorSelect
            value={row.expandOneSide ?? "none"}
            disabled={!row.maxWidth || row.maxWidth === "none"}
            options={[{ value: "none", label: "None" }, { value: "left", label: "Left" }, { value: "right", label: "Right" }]}
            onChange={(expandOneSide) => update({ expandOneSide })}
            ariaLabel="Row one-sided expansion"
          />
        </InspectorFieldRow>

        <InspectorFieldRow label="Column Height" description="Set a fixed height for all columns. They will keep their height when stacking. Optionally, subtract the header height to fill the first visible viewport.">
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
        <div className="builder-field-header"><strong>Margin</strong></div>
        <InspectorFieldRow label="Margin">
          <InspectorSelect
            value={marginToken(row.topMargin)}
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
        <InspectorFieldRow label="HTML Element">
          <InspectorSelect value={row.htmlElement ?? "div"} options={["div", "address", "article", "aside", "footer", "header", "hgroup", "nav", "section"].map((value) => ({ value, label: value }))} onChange={(htmlElement) => update({ htmlElement: htmlElement as BuilderLayoutHtmlElement })} ariaLabel="Row HTML Element" />
        </InspectorFieldRow>
        <div className="builder-inspector-section">
          <h3>Column Parallax</h3>
          <InspectorFieldRow label="Justify Columns at the Bottom"><RowCheck checked={row.columnParallax?.justifyAtBottom === true} onChange={(justifyAtBottom) => update({ columnParallax: { ...(row.columnParallax ?? {}), justifyAtBottom } })} label="Justify columns at bottom" /></InspectorFieldRow>
          <div className="builder-two-column">
            <InspectorFieldRow label="Start"><InspectorTextField value={row.columnParallax?.start ?? ""} onChange={(start) => update({ columnParallax: { ...(row.columnParallax ?? {}), start: start || undefined } })} ariaLabel="Column parallax start" /></InspectorFieldRow>
            <InspectorFieldRow label="End"><InspectorTextField value={row.columnParallax?.end ?? ""} onChange={(end) => update({ columnParallax: { ...(row.columnParallax ?? {}), end: end || undefined } })} ariaLabel="Column parallax end" /></InspectorFieldRow>
          </div>
        </div>
      </div>
    );
  }

  if (tab === "advanced") {
    return (
      <div className="builder-inspector-stack" data-canonical-owner="BuilderRow">
        <DynamicContentInspectorGroup item={row} update={update} />
        <InspectorFieldRow label="ID"><InspectorTextField value={row.advanced?.htmlId ?? ""} onChange={(htmlId) => updateAdvanced({ htmlId: htmlId || undefined })} ariaLabel="Row Advanced ID" /></InspectorFieldRow>
        <InspectorFieldRow label="Class"><InspectorTextField value={row.advanced?.className ?? ""} onChange={(className) => updateAdvanced({ className: className || undefined })} ariaLabel="Row Advanced Class" /></InspectorFieldRow>
        <InspectorFieldRow label="Attributes"><InspectorTextarea value={advancedAttributesValue(row.advanced?.attributes)} onChange={(attributes) => updateAdvanced({ attributes: attributes || undefined })} ariaLabel="Row Advanced Attributes" /></InspectorFieldRow>
        <InspectorFieldRow label="CSS"><InspectorTextarea value={row.advanced?.css ?? ""} onChange={(css) => updateAdvanced({ css: css || undefined })} ariaLabel="Row Advanced CSS" /></InspectorFieldRow>
      </div>
    );
  }

  return (
    <div className="builder-inspector-stack" data-canonical-owner="BuilderRow" />
  );
}
