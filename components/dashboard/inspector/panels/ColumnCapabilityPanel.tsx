"use client";

import type { BuilderSection, InspectorTab } from "@/components/dashboard/builderTypes";
import { UIKIT_COLUMN_CAPABILITY } from "@/lib/uikitCapabilities";
import { InspectorFieldRow, InspectorPillGroup, InspectorSelect } from "@/components/dashboard/inspector/InspectorControls";

type Column = NonNullable<BuilderSection["layoutItems"]>[number];

type Props = {
  column: Column;
  tab: InspectorTab;
  update: (patch: Partial<Column>) => void;
};

export default function ColumnCapabilityPanel({ column, tab, update }: Props) {
  const labels = <T extends string>(values: readonly T[]) => values.map((value) => ({ value, label: value.replace(/-/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase()) }));
  if (tab === "layout") {
    return (
      <div className="builder-inspector-stack" data-uikit-capability="column-layout">
        <div className="builder-element-inspector-note">
          <strong>UIkit Column</strong>
          <span>Column alignment and flex behavior are semantic values mapped through the shared UIkit adapter. Row presets remain the owner of column widths.</span>
        </div>
        <InspectorFieldRow label="Horizontal alignment"><InspectorPillGroup value={(column.columnHorizontalAlign ?? "left") as Column["columnHorizontalAlign"]} options={labels(UIKIT_COLUMN_CAPABILITY.properties.horizontalAlignment.values)} onChange={(value) => update({ columnHorizontalAlign: value })} ariaLabel="Horizontal alignment" /></InspectorFieldRow>
        <InspectorFieldRow label="Vertical alignment"><InspectorPillGroup value={(column.columnVerticalAlign ?? "top") as Column["columnVerticalAlign"]} options={labels(UIKIT_COLUMN_CAPABILITY.properties.verticalAlignment.values)} onChange={(value) => update({ columnVerticalAlign: value })} ariaLabel="Vertical alignment" /></InspectorFieldRow>
        <InspectorFieldRow label="Flex behavior"><InspectorSelect value={(column.columnFlex ?? "none") as Column["columnFlex"]} options={labels(UIKIT_COLUMN_CAPABILITY.properties.flexBehavior.values)} onChange={(value) => update({ columnFlex: value })} ariaLabel="Flex behavior" /></InspectorFieldRow>
        <InspectorFieldRow label="Responsive width" help="Row presets remain the source of desktop width ratios."><InspectorSelect value={(column.columnResponsiveWidth ?? "inherit") as Column["columnResponsiveWidth"]} options={labels(UIKIT_COLUMN_CAPABILITY.properties.responsiveWidth.values)} onChange={(value) => update({ columnResponsiveWidth: value })} ariaLabel="Responsive width" /></InspectorFieldRow>
      </div>
    );
  }

  if (tab === "advanced") {
    return (
      <div className="builder-inspector-stack" data-uikit-capability="column-advanced">
        <div className="builder-element-inspector-note">
          <strong>Column advanced settings</strong>
          <span>Containment, drop behavior, and column structure remain builder-owned. Nested rows, animation, typography, surfaces, and custom width math are not Column capabilities.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="builder-inspector-stack" data-uikit-capability="column-style">
      <div className="builder-element-inspector-note">
        <strong>UIkit Column appearance</strong>
        <span>Columns have no independent background, card, border, radius, shadow, padding, margin, or typography ownership.</span>
      </div>
    </div>
  );
}
