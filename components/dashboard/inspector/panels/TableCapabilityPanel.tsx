"use client";

import type { InspectorTab, BuilderLayoutBlock } from "@/components/dashboard/builderTypes";
import type { BuilderShellSettings } from "@/lib/builderShell";
import {
  InspectorDivision,
  InspectorFieldRow,
  InspectorSelect,
  InspectorTextField,
  InspectorTextarea,
} from "@/components/dashboard/inspector/InspectorControls";

type Props = {
  block: BuilderLayoutBlock;
  tab: InspectorTab;
  shellSettings: BuilderShellSettings;
  update: (patch: Partial<BuilderLayoutBlock>) => void;
};

export default function TableCapabilityPanel({ block, tab, shellSettings, update }: Props) {
  const rawBlock = block as any;

  // CONTENT TAB
  if (tab === "content") {
    const headingsStr = (rawBlock.tableHeadings ?? []).join(", ");
    const rowsStr = (rawBlock.tableRows ?? []).map((row: string[]) => row.join(", ")).join("\n");

    return (
      <div className="builder-inspector-stack" data-uikit-capability="table-content">
        <InspectorDivision title="HEADINGS">
          <InspectorFieldRow label="Headings (CSV)">
            <InspectorTextField
              value={headingsStr}
              onChange={(v) => update({ tableHeadings: v.split(",").map((s) => s.trim()) } as any)}
              placeholder="Header 1, Header 2, Header 3"
              ariaLabel="Table Headings"
            />
          </InspectorFieldRow>
        </InspectorDivision>

        <InspectorDivision title="ROWS">
          <InspectorFieldRow label="Rows (CSV per line)">
            <InspectorTextarea
              value={rowsStr}
              onChange={(v) =>
                update({
                  tableRows: v
                    .split("\n")
                    .map((line) => line.split(",").map((s) => s.trim())),
                } as any)
              }
              placeholder="Item 1, Desc 1, $10&#10;Item 2, Desc 2, $20"
              ariaLabel="Table Rows"
            />
          </InspectorFieldRow>
        </InspectorDivision>
      </div>
    );
  }

  // ADVANCED TAB
  if (tab === "advanced") {
    return (
      <div className="builder-inspector-stack" data-uikit-capability="table-advanced">
        <InspectorDivision title="ADVANCED">
          <InspectorFieldRow label="ID">
            <InspectorTextField
              value={rawBlock.customId ?? block.id ?? ""}
              onChange={(v) => update({ customId: v, id: v } as any)}
              placeholder="e.g. data-table"
              ariaLabel="Custom ID"
            />
          </InspectorFieldRow>
          <InspectorFieldRow label="Class">
            <InspectorTextField
              value={rawBlock.customClass ?? ""}
              onChange={(v) => update({ customClass: v } as any)}
              placeholder="e.g. my-custom-table"
              ariaLabel="Custom Class"
            />
          </InspectorFieldRow>
          <InspectorFieldRow label="Attributes">
            <InspectorTextField
              value={rawBlock.customAttributes ?? ""}
              onChange={(v) => update({ customAttributes: v } as any)}
              placeholder='data-custom="value"'
              ariaLabel="Custom Attributes"
            />
          </InspectorFieldRow>
          <InspectorFieldRow label="Custom CSS">
            <InspectorTextarea
              value={rawBlock.customCss ?? ""}
              onChange={(v) => update({ customCss: v } as any)}
              placeholder="/* CSS rules */"
              ariaLabel="Custom CSS"
            />
          </InspectorFieldRow>
        </InspectorDivision>
      </div>
    );
  }

  // SETTINGS TAB (Default)
  return (
    <div className="builder-inspector-stack" data-uikit-capability="table-style">
      <InspectorDivision title="TABLE">
        <InspectorFieldRow label="Style">
          <InspectorSelect
            value={rawBlock.tableStyle ?? "striped"}
            options={[
              { value: "default", label: "Default" },
              { value: "divider", label: "Divider" },
              { value: "striped", label: "Striped" },
            ]}
            onChange={(v) => update({ tableStyle: v } as any)}
            ariaLabel="Table style"
          />
        </InspectorFieldRow>
        <InspectorFieldRow label="Size">
          <InspectorSelect
            value={rawBlock.size ?? "default"}
            options={[
              { value: "default", label: "Default" },
              { value: "small", label: "Small" },
              { value: "large", label: "Large" },
            ]}
            onChange={(v) => update({ size: v } as any)}
            ariaLabel="Table size"
          />
        </InspectorFieldRow>
        <InspectorFieldRow label="Hover effect">
          <label className="builder-inspector-checkbox-row">
            <input
              type="checkbox"
              checked={Boolean(rawBlock.tableHover)}
              onChange={(e) => update({ tableHover: e.target.checked } as any)}
            />
            <span>Enable row hover highlight</span>
          </label>
        </InspectorFieldRow>
      </InspectorDivision>
    </div>
  );
}
