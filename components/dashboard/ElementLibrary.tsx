"use client";

import { ChevronDown, GripVertical, Search, Star, X } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import type { LayoutBlockKind } from "@/components/dashboard/builderTypes";
import {
  layoutBlockDescriptions,
  layoutBlockGroups,
  layoutBlockLabels,
} from "@/components/dashboard/builderRegistry";
import { createDragGhost } from "@/components/dashboard/builderDragGhost";

const FAVORITES_KEY = "react-shop-builder-favorite-blocks";
const RECENT_KEY = "react-shop-builder-recent-blocks";
const GROUPS_ORDER_KEY = "react-shop-builder-element-groups-order";
const MAX_RECENT = 8;

type ElementLibraryProps = {
  availableLayoutBlockKinds: LayoutBlockKind[];
  onAddElement: (kind: LayoutBlockKind) => void;
  onRenderLayoutBlockIcon: (kind: LayoutBlockKind) => ReactNode;
};

function readStoredKinds(key: string): LayoutBlockKind[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as LayoutBlockKind[]) : [];
  } catch {
    return [];
  }
}

function writeStoredKinds(key: string, kinds: LayoutBlockKind[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(kinds));
}

const escapeRegExp = (text: string) => {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

const HighlightedText = ({ text, query }: { text: string; query: string }) => {
  if (!query.trim()) return <>{text}</>;
  const escaped = escapeRegExp(query.trim());
  const regex = new RegExp(`(${escaped})`, "gi");
  const parts = text.split(regex);
  return (
    <>
      {parts.map((part, index) =>
        part.toLowerCase() === query.trim().toLowerCase() ? (
          <mark key={index} className="builder-search-highlight">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  );
};

export default function ElementLibrary({
  availableLayoutBlockKinds,
  onAddElement,
  onRenderLayoutBlockIcon,
}: ElementLibraryProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [favoriteKinds, setFavoriteKinds] = useState<LayoutBlockKind[]>([]);
  const [recentKinds, setRecentKinds] = useState<LayoutBlockKind[]>([]);
  const [groupIdsOrder, setGroupIdsOrder] = useState<string[]>([]);
  const [draggingGroupId, setDraggingGroupId] = useState<string | null>(null);
  const [dragOverGroupId, setDragOverGroupId] = useState<string | null>(null);
  const [openGroupIds, setOpenGroupIds] = useState<Set<string>>(
    () => new Set(),
  );
  const normalizedQuery = searchQuery.trim().toLowerCase();

  useEffect(() => {
    setFavoriteKinds(readStoredKinds(FAVORITES_KEY));
    setRecentKinds(readStoredKinds(RECENT_KEY));

    const storedOrder = readStoredKinds(GROUPS_ORDER_KEY) as unknown as string[];
    const defaultIds = layoutBlockGroups.map((g) => g.id);
    if (storedOrder && storedOrder.length > 0) {
      const existingStored = storedOrder.filter((id) => defaultIds.includes(id));
      const missing = defaultIds.filter((id) => !existingStored.includes(id));
      setGroupIdsOrder([...existingStored, ...missing]);
    } else {
      setGroupIdsOrder(defaultIds);
    }
  }, []);

  const rememberRecent = (kind: LayoutBlockKind) => {
    setRecentKinds((current) => {
      const next = [kind, ...current.filter((entry) => entry !== kind)].slice(
        0,
        MAX_RECENT,
      );
      writeStoredKinds(RECENT_KEY, next);
      return next;
    });
  };

  const toggleFavorite = (kind: LayoutBlockKind) => {
    setFavoriteKinds((current) => {
      const next = current.includes(kind)
        ? current.filter((entry) => entry !== kind)
        : [...current, kind];
      writeStoredKinds(FAVORITES_KEY, next);
      return next;
    });
  };

  const addElement = (kind: LayoutBlockKind) => {
    rememberRecent(kind);
    onAddElement(kind);
  };

  const filteredGroups = useMemo(
    () =>
      layoutBlockGroups
        .map((group) => {
          const kinds = group.kinds
            .filter((kind) => {
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
            })
            .sort((a, b) => {
              const labelA = layoutBlockLabels[a] || "";
              const labelB = layoutBlockLabels[b] || "";
              return labelA.localeCompare(labelB);
            });

          return { ...group, kinds };
        })
        .filter((group) => group.kinds.length > 0),
    [availableLayoutBlockKinds, normalizedQuery],
  );

  const orderedGroups = useMemo(() => {
    if (groupIdsOrder.length === 0) return filteredGroups;
    const orderMap = new Map(groupIdsOrder.map((id, index) => [id, index]));
    return [...filteredGroups].sort((a, b) => {
      const indexA = orderMap.get(a.id) ?? 999;
      const indexB = orderMap.get(b.id) ?? 999;
      return indexA - indexB;
    });
  }, [filteredGroups, groupIdsOrder]);

  const favoriteKindsList = useMemo(() => {
    return favoriteKinds.filter(
      (kind) =>
        availableLayoutBlockKinds.includes(kind) &&
        (!normalizedQuery ||
          layoutBlockLabels[kind].toLowerCase().includes(normalizedQuery) ||
          kind.toLowerCase().includes(normalizedQuery)),
    );
  }, [availableLayoutBlockKinds, favoriteKinds, normalizedQuery]);

  const recentKindsList = useMemo(() => {
    return recentKinds.filter(
      (kind) =>
        availableLayoutBlockKinds.includes(kind) &&
        !favoriteKinds.includes(kind) &&
        (!normalizedQuery ||
          layoutBlockLabels[kind].toLowerCase().includes(normalizedQuery) ||
          kind.toLowerCase().includes(normalizedQuery)),
    );
  }, [availableLayoutBlockKinds, recentKinds, favoriteKinds, normalizedQuery]);

  const totalResultsCount = useMemo(() => {
    return filteredGroups.reduce((acc, g) => acc + g.kinds.length, 0);
  }, [filteredGroups]);

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

  const renderKindButton = (blockKind: LayoutBlockKind) => (
    <div
      key={blockKind}
      className="builder-element-library-card"
      draggable
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
        createDragGhost(event, layoutBlockLabels[blockKind] || blockKind);
      }}
      onDragEnd={() => rememberRecent(blockKind)}
      onClick={() => addElement(blockKind)}
    >
      <button
        type="button"
        className={`builder-element-favorite ${
          favoriteKinds.includes(blockKind) ? "is-active" : ""
        }`}
        aria-label={
          favoriteKinds.includes(blockKind)
            ? "Remove from favorites"
            : "Add to favorites"
        }
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          toggleFavorite(blockKind);
        }}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <Star size={12} fill={favoriteKinds.includes(blockKind) ? "currentColor" : "none"} />
      </button>

      <div className="builder-element-library-card-icon">
        {onRenderLayoutBlockIcon(blockKind)}
      </div>

      <div className="builder-element-library-card-info">
        <strong>
          <HighlightedText text={layoutBlockLabels[blockKind]} query={searchQuery} />
        </strong>
        {layoutBlockDescriptions[blockKind] && (
          <small>
            <HighlightedText text={layoutBlockDescriptions[blockKind]} query={searchQuery} />
          </small>
        )}
      </div>

      <div className="builder-element-library-card-hover-action">
        <span>+ Add Block</span>
      </div>
    </div>
  );

  return (
    <div className="builder-sidebar-panel">
      <div className="builder-element-library-search-wrapper">
        <label className="builder-element-library-search">
          <Search size={15} />
          <input
            type="text"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder={`Search ${availableLayoutBlockKinds.length} elements...`}
          />
          {searchQuery && (
            <button
              type="button"
              className="builder-search-clear"
              onClick={() => setSearchQuery("")}
              aria-label="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </label>
        {searchQuery && (
          <div className="builder-search-results-info">
            Found {totalResultsCount} matching elements
          </div>
        )}
      </div>

      <div className="builder-element-library" aria-label="Element library">
        {(!normalizedQuery || favoriteKindsList.length > 0) && (
          <details className="builder-collapse builder-element-library-group" open>
            <summary className="builder-element-library-group-title">
              <span>
                <ChevronDown size={14} />
                Favorites
              </span>
              <small>{favoriteKindsList.length}</small>
            </summary>
            <div className="builder-element-library-group-content">
              {favoriteKindsList.length > 0 ? (
                favoriteKindsList.map((blockKind) => renderKindButton(blockKind))
              ) : (
                <div className="builder-favorites-empty-state">
                  <Star size={20} className="builder-empty-star-icon" />
                  <strong>No Favorites Yet</strong>
                  <span>Click the star on any element to pin it here.</span>
                </div>
              )}
            </div>
          </details>
        )}

        {recentKindsList.length > 0 && !normalizedQuery && (
          <details className="builder-collapse builder-element-library-group" open>
            <summary className="builder-element-library-group-title">
              <span>
                <ChevronDown size={14} />
                Recently Used
              </span>
              <small>{recentKindsList.length}</small>
            </summary>
            <div className="builder-element-library-group-content">
              {recentKindsList.map((blockKind) => renderKindButton(blockKind))}
            </div>
          </details>
        )}

        {filteredGroups.length === 0 && (
          <div className="builder-empty-state builder-element-library-empty">
            <Search size={22} />
            <strong>No matching elements</strong>
            <span>Try another search term.</span>
          </div>
        )}

        {orderedGroups.map((group) => {
          const isDragging = draggingGroupId === group.id;
          const isDragOver = dragOverGroupId === group.id;
          const isOpen = normalizedQuery.length > 0 || openGroupIds.has(group.id);
          return (
            <details
              key={group.id}
              className={`builder-collapse builder-element-library-group ${
                isDragging ? "is-dragging" : ""
              } ${isDragOver ? "is-drag-over" : ""}`}
              open={isOpen}
            >
              <summary
                className="builder-element-library-group-title"
                draggable
                onDragStart={(event) => {
                  setDraggingGroupId(group.id);
                  event.dataTransfer.setData("application/x-builder-group", group.id);
                  event.dataTransfer.effectAllowed = "move";
                }}
                onDragOver={(event) => {
                  if (draggingGroupId && draggingGroupId !== group.id) {
                    event.preventDefault();
                    setDragOverGroupId(group.id);
                  }
                }}
                onDragLeave={() => {
                  if (dragOverGroupId === group.id) {
                    setDragOverGroupId(null);
                  }
                }}
                onDrop={(event) => {
                  event.preventDefault();
                  const draggedId = event.dataTransfer.getData("application/x-builder-group");
                  if (draggedId && draggedId !== group.id) {
                    setGroupIdsOrder((current) => {
                      const next = [...current];
                      const draggedIndex = next.indexOf(draggedId);
                      const targetIndex = next.indexOf(group.id);
                      if (draggedIndex !== -1 && targetIndex !== -1) {
                        next.splice(draggedIndex, 1);
                        next.splice(targetIndex, 0, draggedId);
                        writeStoredKinds(GROUPS_ORDER_KEY, next as any);
                      }
                      return next;
                    });
                  }
                  setDraggingGroupId(null);
                  setDragOverGroupId(null);
                }}
                onDragEnd={() => {
                  setDraggingGroupId(null);
                  setDragOverGroupId(null);
                }}
                onClick={(event) => {
                  event.preventDefault();
                  toggleGroup(group.id);
                }}
              >
                <span>
                  <GripVertical size={13} className="builder-group-drag-handle" style={{ marginRight: "2px" }} />
                  <ChevronDown size={14} />
                  {group.label}
                </span>
                <small>{group.kinds.length}</small>
              </summary>
              <div className="builder-element-library-group-content">
                {group.kinds.map((blockKind) => renderKindButton(blockKind))}
              </div>
            </details>
          );
        })}
      </div>
    </div>
  );
}
