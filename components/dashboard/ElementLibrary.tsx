"use client";

import { ChevronDown, Search } from "lucide-react";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import type { LayoutBlockKind } from "@/components/dashboard/builderTypes";
import {
  layoutBlockDescriptions,
  layoutBlockGroups,
  layoutBlockLabels,
} from "@/components/dashboard/builderRegistry";

type ElementLibraryProps = {
  availableLayoutBlockKinds: LayoutBlockKind[];
  onAddElement: (kind: LayoutBlockKind) => void;
  onRenderLayoutBlockIcon: (kind: LayoutBlockKind) => ReactNode;
};

export default function ElementLibrary({
  availableLayoutBlockKinds,
  onAddElement,
  onRenderLayoutBlockIcon,
}: ElementLibraryProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [openGroupIds, setOpenGroupIds] = useState<Set<string>>(
    () => new Set(layoutBlockGroups.slice(0, 2).map((group) => group.id)),
  );
  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filteredGroups = useMemo(
    () =>
      layoutBlockGroups
        .map((group) => {
          const kinds = group.kinds.filter((kind) => {
            if (!availableLayoutBlockKinds.includes(kind)) return false;
            if (!normalizedQuery) return true;

            const label = layoutBlockLabels[kind].toLowerCase();
            const description = layoutBlockDescriptions[kind].toLowerCase();
            return (
              kind.toLowerCase().includes(normalizedQuery) ||
              label.includes(normalizedQuery) ||
              description.includes(normalizedQuery) ||
              group.label.toLowerCase().includes(normalizedQuery)
            );
          });

          return { ...group, kinds };
        })
        .filter((group) => group.kinds.length > 0),
    [availableLayoutBlockKinds, normalizedQuery],
  );

  const toggleGroup = (groupId: string) => {
    setOpenGroupIds((current) => {
      const next = new Set(current);
      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }
      return next;
    });
  };

  const visibleElementCount = filteredGroups.reduce(
    (count, group) => count + group.kinds.length,
    0,
  );

  return (
    <div className="builder-sidebar-panel">
      <div className="builder-sidebar-panel-header">
        <div>
          <strong>Element Library</strong>
          <span>Drag or click to add blocks</span>
        </div>
        <small>
          {visibleElementCount}/{availableLayoutBlockKinds.length}
        </small>
      </div>
      <label className="builder-element-library-search">
        <Search size={15} />
        <input
          type="search"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Search elements"
        />
      </label>
      <div className="builder-element-library" aria-label="Element library">
        {filteredGroups.length === 0 && (
          <div className="builder-empty-state builder-element-library-empty">
            <Search size={22} />
            <p>No elements match this search.</p>
          </div>
        )}

        {filteredGroups.map((group) => {
          return (
            <details
              key={group.id}
              className="builder-collapse builder-element-library-group"
              open={normalizedQuery.length > 0 || openGroupIds.has(group.id)}
            >
              <summary
                className="builder-element-library-group-title"
                onClick={(event) => {
                  event.preventDefault();
                  toggleGroup(group.id);
                }}
              >
                <span>
                  <ChevronDown size={14} />
                  {group.label}
                </span>
                <small>{group.kinds.length}</small>
              </summary>
              <div className="builder-element-library-group-content">
                {group.kinds.map((blockKind) => (
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
            </details>
          );
        })}
      </div>
    </div>
  );
}
