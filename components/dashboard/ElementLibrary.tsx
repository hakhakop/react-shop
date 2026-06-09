"use client";

import { ChevronDown, Search, Star } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import type { LayoutBlockKind } from "@/components/dashboard/builderTypes";
import {
  layoutBlockDescriptions,
  layoutBlockGroups,
  layoutBlockLabels,
} from "@/components/dashboard/builderRegistry";

const FAVORITES_KEY = "react-shop-builder-favorite-blocks";
const RECENT_KEY = "react-shop-builder-recent-blocks";
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

export default function ElementLibrary({
  availableLayoutBlockKinds,
  onAddElement,
  onRenderLayoutBlockIcon,
}: ElementLibraryProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [favoriteKinds, setFavoriteKinds] = useState<LayoutBlockKind[]>([]);
  const [recentKinds, setRecentKinds] = useState<LayoutBlockKind[]>([]);
  const [openGroupIds, setOpenGroupIds] = useState<Set<string>>(
    () => new Set(),
  );
  const normalizedQuery = searchQuery.trim().toLowerCase();

  useEffect(() => {
    setFavoriteKinds(readStoredKinds(FAVORITES_KEY));
    setRecentKinds(readStoredKinds(RECENT_KEY));
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

  const quickKinds = useMemo(() => {
    const merged = [...favoriteKinds, ...recentKinds];
    return merged.filter(
      (kind, index) =>
        availableLayoutBlockKinds.includes(kind) &&
        merged.indexOf(kind) === index &&
        (!normalizedQuery ||
          layoutBlockLabels[kind].toLowerCase().includes(normalizedQuery) ||
          kind.toLowerCase().includes(normalizedQuery)),
    );
  }, [availableLayoutBlockKinds, favoriteKinds, normalizedQuery, recentKinds]);

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
    <button
      key={blockKind}
      type="button"
      draggable
      onClick={() => addElement(blockKind)}
      onDragStart={(event) => {
        rememberRecent(blockKind);
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
      <span
        role="button"
        tabIndex={0}
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
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            event.stopPropagation();
            toggleFavorite(blockKind);
          }
        }}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <Star size={14} />
      </span>
    </button>
  );

  return (
    <div className="builder-sidebar-panel">
      <label className="builder-element-library-search">
        <Search size={15} />
        <input
          type="search"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder={`Search ${availableLayoutBlockKinds.length} elements`}
        />
      </label>
      <div className="builder-element-library" aria-label="Element library">
        {quickKinds.length > 0 && !normalizedQuery && (
          <details className="builder-collapse builder-element-library-group" open>
            <summary className="builder-element-library-group-title">
              <span>
                <ChevronDown size={14} />
                Favorites & recent
              </span>
              <small>{quickKinds.length}</small>
            </summary>
            <div className="builder-element-library-group-content">
              {quickKinds.map((blockKind) => renderKindButton(blockKind))}
            </div>
          </details>
        )}

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
                {group.kinds.map((blockKind) => renderKindButton(blockKind))}
              </div>
            </details>
          );
        })}
      </div>
    </div>
  );
}
