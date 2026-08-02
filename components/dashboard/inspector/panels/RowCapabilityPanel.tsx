"use client";

import type { BuilderSection, InspectorTab } from "@/components/dashboard/builderTypes";
import { builderRowLayoutPresets } from "@/components/dashboard/builderLayoutPresets";
import { UIKIT_ROW_CAPABILITY } from "@/lib/uikitCapabilities";
import { normalizeLayoutToUikitPreset } from "@/lib/uikitLayoutEngine";
import { InspectorFieldRow, InspectorPillGroup, InspectorSelect, InspectorSwitch } from "@/components/dashboard/inspector/InspectorControls";

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
  const labels = <T extends string>(values: readonly T[]) => values.map((value) => ({ value, label: value.replace(/-/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase()) }));

  if (tab === "layout") {
    return (
      <div className="builder-inspector-stack" data-uikit-capability="row-layout">
        <div className="builder-element-inspector-note">
          <strong>UIkit Row</strong>
          <span>Layout, gutter, alignment, and equal-height behavior are stored semantically and mapped by the shared UIkit grid adapter.</span>
        </div>
        <InspectorFieldRow label="Layout preset" help={layoutSummary}><InspectorSelect value={normalizedLayoutKey} options={builderRowLayoutPresets.map((preset) => ({ value: preset.key, label: preset.label }))} onChange={applyLayoutPreset} ariaLabel="Row layout preset" /></InspectorFieldRow>
        <InspectorFieldRow label="Gutter"><InspectorPillGroup value={selectedGutter} options={labels(UIKIT_ROW_CAPABILITY.properties.gutter.values)} onChange={(value) => update({ rowGap: value })} ariaLabel="Row gutter" /></InspectorFieldRow>
        <InspectorFieldRow label="Alignment"><InspectorPillGroup value={row.rowAlignment ?? "top"} options={labels(UIKIT_ROW_CAPABILITY.properties.alignment.values)} onChange={(value) => update({ rowAlignment: value })} ariaLabel="Row alignment" /></InspectorFieldRow>
        <InspectorFieldRow label="Justification"><InspectorPillGroup value={row.rowJustify ?? "start"} options={labels(UIKIT_ROW_CAPABILITY.properties.justification.values)} onChange={(value) => update({ rowJustify: value })} ariaLabel="Row justification" /></InspectorFieldRow>
        <InspectorFieldRow label="Match column heights"><InspectorSwitch checked={row.rowMatchHeight !== false} onChange={(checked) => update({ rowMatchHeight: checked })} label="Match column heights" /></InspectorFieldRow>
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
            <InspectorFieldRow key={field} label={field === "rowTopSpacing" ? "Top padding" : "Bottom padding"}><InspectorSelect value={row[field] ?? "inherit"} options={[{ value: "inherit", label: "Inherit" }, ...labels(spacingOptions)]} onChange={(value) => update({ [field]: value } as Partial<RowItem>)} ariaLabel={field === "rowTopSpacing" ? "Top padding" : "Bottom padding"} /></InspectorFieldRow>
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
        <span>Gutter, alignment, and justification are owned by Layout. Visual appearance follows the shared row and global design settings.</span>
      </div>
    </div>
  );
}
