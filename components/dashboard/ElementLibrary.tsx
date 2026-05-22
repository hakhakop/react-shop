"use client";

import type { ReactNode } from "react";
import type { LayoutBlockKind } from "@/components/dashboard/DashboardBuilder";

type ElementLibraryProps = {
  availableLayoutBlockKinds: LayoutBlockKind[];
  layoutBlockDescriptions: Record<LayoutBlockKind, string>;
  layoutBlockGroups: { id: string; label: string; kinds: LayoutBlockKind[] }[];
  layoutBlockLabels: Record<LayoutBlockKind, string>;
  onAddElement: (kind: LayoutBlockKind) => void;
  onRenderLayoutBlockIcon: (kind: LayoutBlockKind) => ReactNode;
};

export default function ElementLibrary({
  availableLayoutBlockKinds,
  layoutBlockDescriptions,
  layoutBlockGroups,
  layoutBlockLabels,
  onAddElement,
  onRenderLayoutBlockIcon,
}: ElementLibraryProps) {
  return (
    <div className="builder-sidebar-panel">
      <div className="builder-sidebar-panel-header">
        <div>
          <strong>Element Library</strong>
          <span>Drag or click to add blocks</span>
        </div>
        <small>{availableLayoutBlockKinds.length} items</small>
      </div>
      <div className="builder-element-library" aria-label="Element library">
        {layoutBlockGroups.map((group) => {
          const groupKinds = group.kinds.filter((kind) =>
            availableLayoutBlockKinds.includes(kind),
          );
          if (!groupKinds.length) return null;

          return (
            <div key={group.id} className="builder-element-library-group">
              <div className="builder-element-library-group-title">
                {group.label}
              </div>
              {groupKinds.map((blockKind) => (
                <button
                  key={blockKind}
                  type="button"
                  draggable
                  onClick={() => onAddElement(blockKind)}
                  onDragStart={(event) => {
                    event.dataTransfer.setData(
                      "application/x-builder-new-block",
                      blockKind,
                    );
                    event.dataTransfer.setData(
                      "text/plain",
                      `builder-new-block:${blockKind}`,
                    );
                    event.dataTransfer.effectAllowed = "copy";
                  }}
                >
                  <span className="builder-element-library-icon">
                    {onRenderLayoutBlockIcon(blockKind)}
                  </span>
                  <span>
                    <strong>{layoutBlockLabels[blockKind]}</strong>
                    <small>{layoutBlockDescriptions[blockKind]}</small>
                  </span>
                </button>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
