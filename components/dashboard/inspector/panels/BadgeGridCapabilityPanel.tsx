"use client";

import React from "react";
import type { BuilderLayoutBlock, InspectorTab, WordPressMediaItem } from "@/components/dashboard/builderTypes";
import type { BuilderShellSettings } from "@/lib/builderShell";
import RepeatableItemShell from "@/components/dashboard/inspector/RepeatableItemShell";
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
  openWordPressMediaPicker?: (options: {
    title: string;
    currentUrl?: string;
    onSelect: (media: WordPressMediaItem) => void;
  }) => void;
};

export default function BadgeGridCapabilityPanel({ block, tab, update }: Props) {
  const rawBlock = (block ?? {}) as any;
  const badges: any[] = rawBlock.badges ?? [];

  if (tab === "content") {
    return (
      <div className="builder-inspector-stack" data-uikit-capability="badgegrid-content">
        <InspectorDivision title="BADGES">
          <RepeatableItemShell
            items={badges}
            getItemKey={(item: any, index: number) => item.id || `badge-${index}`}
            getItemSummary={(item: any, index: number) => item.title || item.label || `Badge ${index + 1}`}
            itemLabel="Badge"
            addLabel="Add badge"
            onAdd={() => {
              const newBadge = {
                id: String(Date.now()),
                label: `${badges.length + 1}`.padStart(2, "0"),
                title: "New Badge",
                body: "Badge description",
                style: "primary",
              };
              update({ badges: [...badges, newBadge] } as any);
            }}
            onCopy={(index: number) => {
              const target = badges[index];
              if (!target) return;
              const copied = { ...target, id: String(Date.now()) };
              const updated = [...badges];
              updated.splice(index + 1, 0, copied);
              update({ badges: updated } as any);
            }}
            onDelete={(index: number) => {
              const updated = badges.filter((_: any, i: number) => i !== index);
              update({ badges: updated } as any);
            }}
            onReorder={(sourceIndex: number, targetIndex: number) => {
              const updated = [...badges];
              const [moved] = updated.splice(sourceIndex, 1);
              updated.splice(targetIndex, 0, moved);
              update({ badges: updated } as any);
            }}
            renderItem={(item: any, index: number) => {
              const updateItem = (patch: any) => {
                const updated = [...badges];
                updated[index] = { ...updated[index], ...patch };
                update({ badges: updated } as any);
              };
              return (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <InspectorFieldRow label="Label">
                    <InspectorTextField
                      value={item.label ?? ""}
                      onChange={(label) => updateItem({ label })}
                      placeholder="01"
                    />
                  </InspectorFieldRow>
                  <InspectorFieldRow label="Badge Style">
                    <InspectorSelect
                      value={item.style ?? "primary"}
                      options={[
                        { value: "default", label: "Default" },
                        { value: "primary", label: "Primary" },
                        { value: "secondary", label: "Secondary" },
                        { value: "success", label: "Success" },
                        { value: "warning", label: "Warning" },
                        { value: "danger", label: "Danger" },
                      ]}
                      onChange={(style) => updateItem({ style })}
                    />
                  </InspectorFieldRow>
                  <InspectorFieldRow label="Title">
                    <InspectorTextField
                      value={item.title ?? ""}
                      onChange={(title) => updateItem({ title })}
                      placeholder="Badge Title"
                    />
                  </InspectorFieldRow>
                  <InspectorFieldRow label="Body">
                    <InspectorTextarea
                      value={item.body ?? ""}
                      onChange={(body) => updateItem({ body })}
                      placeholder="Badge description"
                    />
                  </InspectorFieldRow>
                </div>
              );
            }}
          />
        </InspectorDivision>

        <InspectorDivision title="OVERALL CONTENT">
          <InspectorFieldRow label="Block Title">
            <InspectorTextField
              value={rawBlock.title ?? ""}
              onChange={(title) => update({ title } as any)}
              placeholder="Optional section title"
            />
          </InspectorFieldRow>
          <InspectorFieldRow label="Block Body">
            <InspectorTextarea
              value={rawBlock.body ?? ""}
              onChange={(body) => update({ body } as any)}
              placeholder="Optional section body"
            />
          </InspectorFieldRow>
        </InspectorDivision>
      </div>
    );
  }

  if (tab === "style") {
    return (
      <div className="builder-inspector-stack" data-uikit-capability="badgegrid-style">
        <InspectorDivision title="LAYOUT">
          <InspectorFieldRow
            label="Columns"
            isOverridden={rawBlock.columns !== undefined && rawBlock.columns !== 2}
            inheritedValueText="2"
            onReset={() => update({ columns: undefined } as any)}
          >
            <InspectorSelect
              value={String(rawBlock.columns ?? 2)}
              options={[
                { value: "1", label: "1 Column" },
                { value: "2", label: "2 Columns" },
                { value: "3", label: "3 Columns" },
                { value: "4", label: "4 Columns" },
              ]}
              onChange={(v) => update({ columns: Number(v) } as any)}
            />
          </InspectorFieldRow>
        </InspectorDivision>
      </div>
    );
  }

  if (tab === "advanced") {
    return (
      <div className="builder-inspector-stack" data-uikit-capability="badgegrid-advanced">
        <InspectorDivision title="ADVANCED">
          <InspectorFieldRow label="Custom ID">
            <InspectorTextField
              value={rawBlock.customId ?? ""}
              onChange={(customId) => update({ customId } as any)}
              placeholder="e.g. badge-grid-1"
            />
          </InspectorFieldRow>
          <InspectorFieldRow label="Custom Class">
            <InspectorTextField
              value={rawBlock.customClass ?? ""}
              onChange={(customClass) => update({ customClass } as any)}
              placeholder="e.g. my-badge-grid"
            />
          </InspectorFieldRow>
        </InspectorDivision>
      </div>
    );
  }

  return null;
}
