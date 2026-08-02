"use client";

import type { BuilderSection, InspectorTab } from "@/components/dashboard/builderTypes";
import { builderRowLayoutPresets } from "@/components/dashboard/builderLayoutPresets";
import { UIKIT_ROW_CAPABILITY } from "@/lib/uikitCapabilities";
import { normalizeLayoutToUikitPreset } from "@/lib/uikitLayoutEngine";

type RowItem = NonNullable<BuilderSection["layoutItems"]>[number];

type Props = {
  row: RowItem;
  layoutKey?: string | null;
  layoutSummary: string;
  tab: InspectorTab;
  update: (patch: Partial<RowItem>) => void;
  applyLayoutPreset: (key: string) => void;
};

const spacingOptions = UIKIT_ROW_CAPABILITY.properties.spacing.values;

export default function RowCapabilityPanel({
  row,
  layoutKey,
  layoutSummary,
  tab,
  update,
  applyLayoutPreset,
}: Props) {
  const normalizedLayoutKey = normalizeLayoutToUikitPreset(layoutKey ?? undefined);
  const selectedGutter = UIKIT_ROW_CAPABILITY.properties.gutter.values.includes(
    row.rowGap as (typeof UIKIT_ROW_CAPABILITY.properties.gutter.values)[number],
  )
    ? row.rowGap
    : "medium";

  if (tab === "layout") {
    return (
      <div className="builder-inspector-stack" data-uikit-capability="row-layout">
        <div className="builder-element-inspector-note">
          <strong>UIkit Row</strong>
          <span>Layout, gutter, alignment, and equal-height behavior are stored semantically and mapped by the shared UIkit grid adapter.</span>
        </div>
        <label className="builder-field">
          <span>Layout preset</span>
          <select value={normalizedLayoutKey} onChange={(event) => applyLayoutPreset(event.target.value)}>
            {builderRowLayoutPresets.map((preset) => (
              <option key={preset.key} value={preset.key}>{preset.label} ({preset.description})</option>
            ))}
          </select>
          <small>{layoutSummary}</small>
        </label>
        <label className="builder-field">
          <span>Gutter</span>
          <select value={selectedGutter} onChange={(event) => update({ rowGap: event.target.value as RowItem["rowGap"] })}>
            {UIKIT_ROW_CAPABILITY.properties.gutter.values.map((value) => <option key={value} value={value}>{value}</option>)}
          </select>
        </label>
        <div className="builder-two-column">
          <label className="builder-field">
            <span>Alignment</span>
            <select value={row.rowAlignment ?? "top"} onChange={(event) => update({ rowAlignment: event.target.value as RowItem["rowAlignment"] })}>
              {UIKIT_ROW_CAPABILITY.properties.alignment.values.map((value) => <option key={value} value={value}>{value}</option>)}
            </select>
          </label>
          <label className="builder-field">
            <span>Justification</span>
            <select value={row.rowJustify ?? "start"} onChange={(event) => update({ rowJustify: event.target.value as RowItem["rowJustify"] })}>
              {UIKIT_ROW_CAPABILITY.properties.justification.values.map((value) => <option key={value} value={value}>{value}</option>)}
            </select>
          </label>
        </div>
        <label className="builder-field">
          <span>Match column heights</span>
          <select value={row.rowMatchHeight === false ? "disabled" : "enabled"} onChange={(event) => update({ rowMatchHeight: event.target.value === "enabled" })}>
            {UIKIT_ROW_CAPABILITY.properties.matchHeight.values.map((value) => <option key={value} value={value}>{value}</option>)}
          </select>
        </label>
      </div>
    );
  }

  if (tab === "spacing") {
    return (
      <div className="builder-inspector-stack" data-uikit-capability="row-spacing">
        <div className="builder-element-inspector-note">
          <strong>UIkit Row spacing</strong>
          <span>Only semantic padding presets remain; row margins, arbitrary surfaces, and duplicate visual-style controls are not row capabilities.</span>
        </div>
        <div className="builder-two-column">
          {(["rowTopSpacing", "rowBottomSpacing"] as const).map((field) => (
            <label className="builder-field" key={field}>
              <span>{field === "rowTopSpacing" ? "Top padding" : "Bottom padding"}</span>
              <select value={row[field] ?? "inherit"} onChange={(event) => update({ [field]: event.target.value } as Partial<RowItem>)}>
                <option value="inherit">inherit</option>
                {spacingOptions.map((value) => <option key={value} value={value}>{value}</option>)}
              </select>
            </label>
          ))}
        </div>
      </div>
    );
  }

  if (tab === "advanced") {
    return (
      <div className="builder-inspector-stack" data-uikit-capability="row-advanced">
        <div className="builder-element-inspector-note">
          <strong>Row advanced settings</strong>
          <span>There are no additional retained UIkit row behavior controls. Visibility and custom class behavior remain available only through shared document-level mechanisms.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="builder-inspector-stack" data-uikit-capability="row-style">
      <div className="builder-element-inspector-note">
        <strong>UIkit Row appearance</strong>
        <span>Gutter and alignment are owned by the Layout tab. Legacy row backgrounds, radius, arbitrary borders, shadows, and visual-style presets are not retained.</span>
      </div>
    </div>
  );
}
