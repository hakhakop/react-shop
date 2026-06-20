"use client";

import React, { useEffect, useState, useMemo } from "react";
import { GripVertical, Plus, Trash2 } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";
import type {
  BuilderCustomPage,
  BuilderLayoutKey,
  BuilderState,
} from "./builderTypes";

const corePages = [
  { key: "home", title: "Home", slug: "" },
  { key: "shop", title: "Shop", slug: "shop" },
  { key: "client", title: "Client Page", slug: "client" },
  { key: "page:cart", title: "Cart", slug: "cart" },
  { key: "page:checkout", title: "Checkout", slug: "checkout" },
  { key: "page:my-account", title: "My Account", slug: "my-account" },
] as const;

type PagesPanelProps = {
  builderState: BuilderState;
  customPages: BuilderCustomPage[];
  publishedKeys: string[];
  newPageTitle: string;
  pageStatus: string;
  onSwitchBuilderTarget: (nextKey: BuilderLayoutKey) => void;
  onSetNewPageTitle: Dispatch<SetStateAction<string>>;
  onCreateBuilderPage: () => void;
  onDeleteBuilderPage: (key: BuilderCustomPage["key"]) => void;
  onReorderCustomPages?: (newPages: BuilderCustomPage[]) => void;
};

export default function PagesPanel({
  builderState,
  customPages,
  publishedKeys,
  newPageTitle,
  pageStatus,
  onSwitchBuilderTarget,
  onSetNewPageTitle,
  onCreateBuilderPage,
  onDeleteBuilderPage,
  onReorderCustomPages,
}: PagesPanelProps) {
  const [corePagesOrder, setCorePagesOrder] = useState<string[]>([]);
  const [draggingCorePageKey, setDraggingCorePageKey] = useState<string | null>(null);
  const [dragOverCorePageKey, setDragOverCorePageKey] = useState<string | null>(null);

  const [draggingCustomPageKey, setDraggingCustomPageKey] = useState<string | null>(null);
  const [dragOverCustomPageKey, setDragOverCustomPageKey] = useState<string | null>(null);

  useEffect(() => {
    const defaultKeys = corePages.map((p) => p.key);
    try {
      const stored = window.localStorage.getItem("react-shop-builder-core-pages-order");
      if (stored) {
        const parsed = JSON.parse(stored) as string[];
        const existingStored = parsed.filter((k) => defaultKeys.includes(k as any));
        const missing = defaultKeys.filter((k) => !existingStored.includes(k));
        setCorePagesOrder([...existingStored, ...missing]);
      } else {
        setCorePagesOrder(defaultKeys as string[]);
      }
    } catch {
      setCorePagesOrder(defaultKeys as string[]);
    }
  }, []);

  const orderedCorePages = useMemo(() => {
    if (corePagesOrder.length === 0) return [...corePages];
    const orderMap = new Map(corePagesOrder.map((key, index) => [key, index]));
    return [...corePages].sort((a, b) => {
      const indexA = orderMap.get(a.key) ?? 999;
      const indexB = orderMap.get(b.key) ?? 999;
      return indexA - indexB;
    });
  }, [corePagesOrder]);

  return (
    <div className="builder-sidebar-panel">
      <div className="builder-sidebar-panel-header">
        <div>
          <strong>Builder Pages</strong>
          <span>Manage React-owned storefront pages</span>
        </div>
        <small>{corePages.length + customPages.length}</small>
      </div>

      {/* Core Storefront Pages */}
      <div className="builder-card builder-pages-card" style={{ marginBottom: "14px" }}>
        <div className="builder-card-title">
          <strong>Core Storefront Pages</strong>
          <span>{corePages.length}</span>
        </div>
        <div className="builder-pages-list">
          {orderedCorePages.map((page) => {
            const isActive = builderState.page === page.key;
            const isPublished = publishedKeys.includes(page.key);
            const isDragging = draggingCorePageKey === page.key;
            const isDragOver = dragOverCorePageKey === page.key;
            return (
              <div
                key={page.key}
                className={`builder-page-row${isActive ? " is-active" : ""}${
                  isDragging ? " is-dragging" : ""
                }${isDragOver ? " is-drag-over" : ""}`}
                draggable
                onDragStart={(event) => {
                  setDraggingCorePageKey(page.key);
                  event.dataTransfer.setData("application/x-builder-core-page-key", page.key);
                  event.dataTransfer.effectAllowed = "move";
                }}
                onDragOver={(event) => {
                  if (draggingCorePageKey && draggingCorePageKey !== page.key) {
                    event.preventDefault();
                    setDragOverCorePageKey(page.key);
                  }
                }}
                onDragLeave={() => {
                  if (dragOverCorePageKey === page.key) {
                    setDragOverCorePageKey(null);
                  }
                }}
                onDrop={(event) => {
                  event.preventDefault();
                  const draggedKey = event.dataTransfer.getData("application/x-builder-core-page-key");
                  if (draggedKey && draggedKey !== page.key) {
                    setCorePagesOrder((current) => {
                      const next = [...current];
                      const draggedIndex = next.indexOf(draggedKey);
                      const targetIndex = next.indexOf(page.key);
                      if (draggedIndex !== -1 && targetIndex !== -1) {
                        next.splice(draggedIndex, 1);
                        next.splice(targetIndex, 0, draggedKey);
                        window.localStorage.setItem("react-shop-builder-core-pages-order", JSON.stringify(next));
                      }
                      return next;
                    });
                  }
                  setDraggingCorePageKey(null);
                  setDragOverCorePageKey(null);
                }}
                onDragEnd={() => {
                  setDraggingCorePageKey(null);
                  setDragOverCorePageKey(null);
                }}
              >
                <GripVertical size={13} className="builder-group-drag-handle" style={{ marginRight: "2px", flexShrink: 0 }} />
                <button type="button" className="builder-page-title-button" onClick={() => onSwitchBuilderTarget(page.key)}>
                  <strong>{page.title}</strong>
                  <span>{page.slug ? `/${page.slug}` : "/"}</span>
                </button>
                <span
                  className={`builder-page-status ${isPublished ? "is-published" : "is-draft"}`}
                  style={{
                    fontSize: "10px",
                    padding: "2px 6px",
                    borderRadius: "4px",
                    backgroundColor: isActive
                      ? "rgba(255, 255, 255, 0.25)"
                      : "rgba(164, 190, 123, 0.15)",
                    color: isActive
                      ? "#ffffff"
                      : (isPublished ? "#91ad68" : "var(--builder-ui-muted)"),
                    border: `1px solid ${isActive
                      ? "rgba(255, 255, 255, 0.4)"
                      : "rgba(164, 190, 123, 0.3)"}`,
                    textTransform: "uppercase",
                    fontWeight: "bold",
                    letterSpacing: "0.05em",
                    marginLeft: "auto",
                    marginRight: "4px",
                  }}
                >
                  {isPublished ? "Published" : "Draft"}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Custom Pages */}
      <div className="builder-card builder-pages-card">
        <div className="builder-card-title">
          <strong>Custom Pages</strong>
          <span>{customPages.length}</span>
        </div>
        <div className="builder-page-create">
          <input
            type="text"
            value={newPageTitle}
            onChange={(event) => onSetNewPageTitle(event.target.value)}
            placeholder="New page title"
          />
          <button
            type="button"
            className="builder-icon-button"
            onClick={onCreateBuilderPage}
            aria-label="Create custom page"
          >
            <Plus size={15} />
          </button>
        </div>
        {customPages.length > 0 ? (
          <div className="builder-pages-list" style={{ marginTop: "10px" }}>
            {customPages.map((page) => {
              const isActive = builderState.page === page.key;
              const isPublished = publishedKeys.includes(page.key);
              const isDragging = draggingCustomPageKey === page.key;
              const isDragOver = dragOverCustomPageKey === page.key;
              return (
                <div
                  key={page.key}
                  className={`builder-page-row${isActive ? " is-active" : ""}${
                    isDragging ? " is-dragging" : ""
                  }${isDragOver ? " is-drag-over" : ""}`}
                  draggable
                  onDragStart={(event) => {
                    setDraggingCustomPageKey(page.key);
                    event.dataTransfer.setData("application/x-builder-custom-page-key", page.key);
                    event.dataTransfer.effectAllowed = "move";
                  }}
                  onDragOver={(event) => {
                    if (draggingCustomPageKey && draggingCustomPageKey !== page.key) {
                      event.preventDefault();
                      setDragOverCustomPageKey(page.key);
                    }
                  }}
                  onDragLeave={() => {
                    if (dragOverCustomPageKey === page.key) {
                      setDragOverCustomPageKey(null);
                    }
                  }}
                  onDrop={(event) => {
                    event.preventDefault();
                    const draggedKey = event.dataTransfer.getData("application/x-builder-custom-page-key");
                    if (draggedKey && draggedKey !== page.key) {
                      const next = [...customPages];
                      const draggedIndex = next.findIndex((p) => p.key === draggedKey);
                      const targetIndex = next.findIndex((p) => p.key === page.key);
                      if (draggedIndex !== -1 && targetIndex !== -1) {
                        const draggedPage = next[draggedIndex];
                        next.splice(draggedIndex, 1);
                        next.splice(targetIndex, 0, draggedPage);
                        onReorderCustomPages?.(next);
                      }
                    }
                    setDraggingCustomPageKey(null);
                    setDragOverCustomPageKey(null);
                  }}
                  onDragEnd={() => {
                    setDraggingCustomPageKey(null);
                    setDragOverCustomPageKey(null);
                  }}
                >
                  <GripVertical size={13} className="builder-group-drag-handle" style={{ marginRight: "2px", flexShrink: 0 }} />
                  <button type="button" className="builder-page-title-button" onClick={() => onSwitchBuilderTarget(page.key)}>
                    <strong>{page.title}</strong>
                    <span>/{page.slug}</span>
                  </button>
                  <span
                    className={`builder-page-status ${isPublished ? "is-published" : "is-draft"}`}
                    style={{
                      fontSize: "10px",
                      padding: "2px 6px",
                      borderRadius: "4px",
                      backgroundColor: isActive
                        ? "rgba(255, 255, 255, 0.25)"
                        : "rgba(164, 190, 123, 0.15)",
                      color: isActive
                        ? "#ffffff"
                        : (isPublished ? "#91ad68" : "var(--builder-ui-muted)"),
                      border: `1px solid ${isActive
                        ? "rgba(255, 255, 255, 0.4)"
                        : "rgba(164, 190, 123, 0.3)"}`,
                      textTransform: "uppercase",
                      fontWeight: "bold",
                      letterSpacing: "0.05em",
                      marginLeft: "auto",
                      marginRight: "4px",
                    }}
                  >
                    {isPublished ? "Published" : "Draft"}
                  </span>
                  <button
                    type="button"
                    className="builder-icon-button"
                    onClick={() => onDeleteBuilderPage(page.key)}
                    aria-label={`Delete ${page.title}`}
                    style={{ flexShrink: 0 }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ padding: "12px 4px", fontSize: "12px", color: "var(--builder-ui-muted)", textAlign: "center" }}>
            No custom pages created yet.
          </div>
        )}
        <small style={{ display: "block", marginTop: "10px" }}>{pageStatus}</small>
      </div>
    </div>
  );
}
