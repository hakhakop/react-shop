"use client";

import type { BuilderSection, InspectorTab } from "@/components/dashboard/builderTypes";
import { UIKIT_COLUMN_CAPABILITY } from "@/lib/uikitCapabilities";

type Column = NonNullable<BuilderSection["layoutItems"]>[number];

type Props = {
  column: Column;
  tab: InspectorTab;
  update: (patch: Partial<Column>) => void;
};

export default function ColumnCapabilityPanel({ column, tab, update }: Props) {
  if (tab === "layout") {
    return (
      <div className="builder-inspector-stack" data-uikit-capability="column-layout">
        <div className="builder-element-inspector-note">
          <strong>UIkit Column</strong>
          <span>Column alignment and flex behavior are semantic values mapped through the shared UIkit adapter. Row presets remain the owner of column widths.</span>
        </div>
        <div className="builder-two-column">
          <label className="builder-field">
            <span>Horizontal alignment</span>
            <select value={column.columnHorizontalAlign ?? "left"} onChange={(event) => update({ columnHorizontalAlign: event.target.value as Column["columnHorizontalAlign"] })}>
              {UIKIT_COLUMN_CAPABILITY.properties.horizontalAlignment.values.map((value) => <option key={value} value={value}>{value}</option>)}
            </select>
          </label>
          <label className="builder-field">
            <span>Vertical alignment</span>
            <select value={column.columnVerticalAlign ?? "top"} onChange={(event) => update({ columnVerticalAlign: event.target.value as Column["columnVerticalAlign"] })}>
              {UIKIT_COLUMN_CAPABILITY.properties.verticalAlignment.values.map((value) => <option key={value} value={value}>{value}</option>)}
            </select>
          </label>
        </div>
        <label className="builder-field">
          <span>Flex behavior</span>
          <select value={column.columnFlex ?? "none"} onChange={(event) => update({ columnFlex: event.target.value as Column["columnFlex"] })}>
            {UIKIT_COLUMN_CAPABILITY.properties.flexBehavior.values.map((value) => <option key={value} value={value}>{value}</option>)}
          </select>
        </label>
        <label className="builder-field">
          <span>Responsive width</span>
          <select value={column.columnResponsiveWidth ?? "inherit"} onChange={(event) => update({ columnResponsiveWidth: event.target.value as Column["columnResponsiveWidth"] })}>
            {UIKIT_COLUMN_CAPABILITY.properties.responsiveWidth.values.map((value) => <option key={value} value={value}>{value}</option>)}
          </select>
          <small>Row layout presets remain the source of desktop width ratios.</small>
        </label>
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
