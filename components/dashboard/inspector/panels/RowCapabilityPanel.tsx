"use client";

import type {
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
  InspectorPillGroup,
  InspectorSelect,
  InspectorTextarea,
  InspectorTextField,
} from "@/components/dashboard/inspector/InspectorControls";

type Props = {
  row: BuilderRow;
  tab: InspectorTab;
  update: (patch: Partial<BuilderRow>) => void;
  applyLayoutPreset: (key: string) => void;
};

const spacingOptions = [
  { value: "inherit", label: "Inherit" },
  { value: "none", label: "None" },
  { value: "small", label: "Small" },
  { value: "default", label: "Default" },
  { value: "medium", label: "Medium" },
  { value: "large", label: "Large" },
  { value: "xlarge", label: "X-Large" },
] as const;

const breakpointFields = [
  ["default", "Default"],
  ["small", "Small"],
  ["medium", "Medium"],
  ["large", "Large"],
  ["xlarge", "X-Large"],
] as const;

function advancedAttributesValue(
  attributes: BuilderLayoutAdvancedSettings["attributes"],
) {
  if (!attributes) return "";
  return typeof attributes === "string"
    ? attributes
    : Object.entries(attributes).map(([name, value]) => `${name}=${value}`).join("\n");
}

function RowCheck({ checked, onChange, label }: { checked: boolean; onChange: (checked: boolean) => void; label: string }) {
  return (
    <label className="builder-section-quiet-check">
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      <span className="builder-section-quiet-checkmark" aria-hidden="true" />
      <span>{label}</span>
    </label>
  );
}

export default function RowCapabilityPanel({
  row,
  tab,
  update,
  applyLayoutPreset,
}: Props) {
  const updateColumn = (
    columnIndex: number,
    patch: {
      responsiveWidths?: BuilderResponsiveColumnWidths;
      order?: BuilderResponsiveColumnOrder;
    },
  ) => update({
    columns: row.columns.map((column, index) =>
      index === columnIndex ? { ...column, ...patch } : column,
    ),
  });
  const updateAdvanced = (patch: Partial<BuilderLayoutAdvancedSettings>) =>
    update({ advanced: { ...(row.advanced ?? {}), ...patch } });

  if (tab === "layout") {
    return (
      <div className="builder-inspector-stack" data-canonical-owner="BuilderRow">
        <InspectorFieldRow label="Edit Layout">
          <InspectorSelect
            value={row.layout}
            options={builderRowLayoutPresets.map((preset) => ({ value: preset.key, label: preset.label }))}
            onChange={applyLayoutPreset}
            ariaLabel="Edit Row layout"
          />
        </InspectorFieldRow>

        <div className="builder-inspector-section" data-row-responsive-layout>
          <div className="builder-field-header">
            <strong>Responsive Columns</strong>
            <small>Width and order remain Column fields within this Row layout editor.</small>
          </div>
          {row.columns.map((column, columnIndex) => (
            <details className="builder-collapse" key={column.id}>
              <summary>Column {columnIndex + 1}</summary>
              {breakpointFields.map(([breakpoint, label]) => (
                <div className="builder-two-column" key={`${column.id}-${breakpoint}`}>
                  <InspectorFieldRow label={`${label} width`}>
                    <InspectorTextField
                      value={column.responsiveWidths?.[breakpoint] ?? ""}
                      placeholder="Preset"
                      ariaLabel={`Column ${columnIndex + 1} ${label} width`}
                      onChange={(value) => updateColumn(columnIndex, {
                        responsiveWidths: {
                          ...(column.responsiveWidths ?? {}),
                          [breakpoint]: value || undefined,
                        },
                      })}
                    />
                  </InspectorFieldRow>
                  <InspectorFieldRow label={`${label} order`}>
                    <InspectorSelect
                      value={String(column.order?.[breakpoint] ?? "")}
                      options={[
                        { value: "", label: "Default" },
                        { value: "first", label: "First" },
                        { value: "last", label: "Last" },
                      ]}
                      ariaLabel={`Column ${columnIndex + 1} ${label} order`}
                      onChange={(value) => updateColumn(columnIndex, {
                        order: {
                          ...(column.order ?? {}),
                          [breakpoint]: value === "first" || value === "last" ? value : undefined,
                        },
                      })}
                    />
                  </InspectorFieldRow>
                </div>
              ))}
            </details>
          ))}
        </div>

        <InspectorFieldRow label="Column Gap">
          <InspectorSelect value={row.columnGap ?? "inherit"} options={spacingOptions} onChange={(columnGap) => update({ columnGap })} ariaLabel="Row Column Gap" />
        </InspectorFieldRow>
        <InspectorFieldRow label="Row Gap">
          <InspectorSelect value={row.rowGap ?? "inherit"} options={spacingOptions} onChange={(rowGap) => update({ rowGap })} ariaLabel="Row Gap" />
        </InspectorFieldRow>
        <InspectorFieldRow label="Column Divider" description="Canonical storage exists; visual projection is deferred.">
          <RowCheck checked={row.divider === true} onChange={(divider) => update({ divider })} label="Show column divider" />
        </InspectorFieldRow>
        <InspectorFieldRow label="Horizontal Distribution">
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
        <InspectorFieldRow label="Max Width" description="Canonical storage exists; row container projection is deferred.">
          <InspectorSelect
            value={row.maxWidth ?? "none"}
            options={["none", "xsmall", "small", "default", "medium", "large", "xlarge", "expand"].map((value) => ({ value, label: value.replace(/^./, (letter) => letter.toUpperCase()) }))}
            onChange={(maxWidth) => update({ maxWidth })}
            ariaLabel="Row Max Width"
          />
        </InspectorFieldRow>
        <InspectorFieldRow label="Remove Horizontal Padding" description="Canonical storage exists; row container projection is deferred.">
          <RowCheck checked={row.removeHorizontalPadding === true} onChange={(removeHorizontalPadding) => update({ removeHorizontalPadding })} label="Remove left and right padding" />
        </InspectorFieldRow>
        <InspectorFieldRow label="One-sided Expansion" description="Canonical storage exists; row container projection is deferred.">
          <InspectorSelect
            value={row.expandOneSide ?? "none"}
            options={[{ value: "none", label: "None" }, { value: "left", label: "Left" }, { value: "right", label: "Right" }]}
            onChange={(expandOneSide) => update({ expandOneSide })}
            ariaLabel="Row one-sided expansion"
          />
        </InspectorFieldRow>

        <InspectorFieldRow label="Height" description="Canonical storage exists; height projection is deferred.">
          <InspectorSelect
            value={row.height?.mode ?? "none"}
            options={[{ value: "none", label: "Auto" }, { value: "pixels", label: "Pixels" }, { value: "viewport", label: "Viewport" }]}
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
        <InspectorFieldRow label="Subtract Height Above" description="Canonical storage exists; height projection is deferred.">
          <RowCheck checked={row.height?.subtractHeightAbove === true} onChange={(subtractHeightAbove) => update({ height: { ...(row.height ?? {}), subtractHeightAbove } })} label="Subtract preceding layout height" />
        </InspectorFieldRow>
      </div>
    );
  }

  if (tab === "spacing") {
    return (
      <div className="builder-inspector-stack" data-canonical-owner="BuilderRow">
        <InspectorFieldRow label="Top Margin">
          <InspectorTextField value={row.topMargin ?? ""} placeholder="inherit, medium, 40px" onChange={(topMargin) => update({ topMargin: topMargin || undefined })} ariaLabel="Row Top Margin" />
        </InspectorFieldRow>
        <InspectorFieldRow label="Bottom Margin">
          <InspectorTextField value={row.bottomMargin ?? ""} placeholder="inherit, medium, 40px" onChange={(bottomMargin) => update({ bottomMargin: bottomMargin || undefined })} ariaLabel="Row Bottom Margin" />
        </InspectorFieldRow>
      </div>
    );
  }

  if (tab === "advanced") {
    return (
      <div className="builder-inspector-stack" data-canonical-owner="BuilderRow">
        <InspectorFieldRow label="HTML Element" description="Canonical storage exists; semantic tag projection is deferred.">
          <InspectorSelect
            value={row.htmlElement ?? "div"}
            options={["div", "address", "article", "aside", "footer", "header", "hgroup", "main", "nav", "section"].map((value) => ({ value, label: value }))}
            onChange={(htmlElement) => update({ htmlElement: htmlElement as BuilderLayoutHtmlElement })}
            ariaLabel="Row HTML Element"
          />
        </InspectorFieldRow>

        <div className="builder-inspector-section">
          <div className="builder-field-header"><strong>Column Parallax</strong></div>
          <InspectorFieldRow label="Enable"><RowCheck checked={row.columnParallax?.enabled === true} onChange={(enabled) => update({ columnParallax: { ...(row.columnParallax ?? {}), enabled } })} label="Enable column parallax" /></InspectorFieldRow>
          <InspectorFieldRow label="Justify at Bottom"><RowCheck checked={row.columnParallax?.justifyAtBottom === true} onChange={(justifyAtBottom) => update({ columnParallax: { ...(row.columnParallax ?? {}), justifyAtBottom } })} label="Justify columns at bottom" /></InspectorFieldRow>
          <div className="builder-two-column">
            <InspectorFieldRow label="Start"><InspectorTextField value={row.columnParallax?.start ?? ""} onChange={(start) => update({ columnParallax: { ...(row.columnParallax ?? {}), start: start || undefined } })} ariaLabel="Column parallax start" /></InspectorFieldRow>
            <InspectorFieldRow label="End"><InspectorTextField value={row.columnParallax?.end ?? ""} onChange={(end) => update({ columnParallax: { ...(row.columnParallax ?? {}), end: end || undefined } })} ariaLabel="Column parallax end" /></InspectorFieldRow>
          </div>
        </div>

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
