"use client";

import React, { useState, ReactNode } from "react";
import { Plus, Trash2, ArrowUp, ArrowDown } from "lucide-react";

export type CollectionEditorProps<T> = {
  items: T[];
  itemTitle: (item: T, index: number) => string;
  itemSubtitle?: (item: T, index: number) => string;
  onAdd: () => void;
  onDelete: (index: number) => void;
  onMove?: (index: number, direction: 1 | -1) => void;
  renderItemContent: (item: T, index: number) => ReactNode;
  renderItemSettings?: (item: T, index: number) => ReactNode;
  addButtonLabel?: string;
  emptyMessage?: string;
};

export default function CollectionEditor<T>({
  items,
  itemTitle,
  itemSubtitle,
  onAdd,
  onDelete,
  onMove,
  renderItemContent,
  renderItemSettings,
  addButtonLabel = "Add item",
  emptyMessage = "No items yet.",
}: CollectionEditorProps<T>) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<"content" | "settings">("content");

  return (
    <div className="builder-inspector-collection">
      <button
        type="button"
        className="builder-inline-add builder-full-button"
        onClick={() => {
          onAdd();
          setOpenIndex(items.length);
          setActiveSubTab("content");
        }}
        style={{ marginBottom: "12px" }}
      >
        <Plus size={15} /> {addButtonLabel}
      </button>

      {items.length === 0 ? (
        <div className="builder-empty-state">
          <small>{emptyMessage}</small>
        </div>
      ) : (
        <div className="builder-repeatable-tabs">
          {items.map((item, index) => {
            const isOpen = openIndex === index;
            const hasSettings = !!renderItemSettings;

            return (
              <div key={index} className={`builder-nested-card${isOpen ? " is-open" : ""}`}>
                <div className="builder-nested-card-header">
                  <button
                    type="button"
                    className="builder-slide-toggle"
                    onClick={() => {
                      if (isOpen) {
                        setOpenIndex(null);
                      } else {
                        setOpenIndex(index);
                        setActiveSubTab("content");
                      }
                    }}
                  >
                    <span>{itemTitle(item, index)}</span>
                    {itemSubtitle && <small>{itemSubtitle(item, index)}</small>}
                  </button>
                  {onMove && (
                    <>
                      <button
                        type="button"
                        onClick={() => onMove(index, -1)}
                        disabled={index === 0}
                        title="Move up"
                      >
                        <ArrowUp size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => onMove(index, 1)}
                        disabled={index === items.length - 1}
                        title="Move down"
                      >
                        <ArrowDown size={14} />
                      </button>
                    </>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      onDelete(index);
                      if (isOpen) setOpenIndex(null);
                    }}
                    title="Delete item"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                {isOpen && (
                  <div className="builder-nested-card-content">
                    {hasSettings ? (
                      <div className="builder-inspector-subtabs-container">
                        <div className="builder-inspector-subtabs-nav" style={{ display: 'flex', gap: '8px', marginBottom: '16px', borderBottom: '1px solid var(--builder-ui-border)' }}>
                          <button
                            type="button"
                            onClick={() => setActiveSubTab("content")}
                            style={{ padding: '6px 12px', background: 'none', border: 'none', borderBottom: activeSubTab === "content" ? '2px solid var(--builder-ui-accent)' : '2px solid transparent', color: activeSubTab === "content" ? 'var(--builder-ui-text)' : 'var(--builder-ui-muted)', cursor: 'pointer', fontSize: '12px', fontWeight: activeSubTab === "content" ? 'bold' : 'normal' }}
                          >
                            Content
                          </button>
                          <button
                            type="button"
                            onClick={() => setActiveSubTab("settings")}
                            style={{ padding: '6px 12px', background: 'none', border: 'none', borderBottom: activeSubTab === "settings" ? '2px solid var(--builder-ui-accent)' : '2px solid transparent', color: activeSubTab === "settings" ? 'var(--builder-ui-text)' : 'var(--builder-ui-muted)', cursor: 'pointer', fontSize: '12px', fontWeight: activeSubTab === "settings" ? 'bold' : 'normal' }}
                          >
                            Settings
                          </button>
                        </div>
                        <div className="builder-subtab-pane">
                          {activeSubTab === "content" ? renderItemContent(item, index) : renderItemSettings(item, index)}
                        </div>
                      </div>
                    ) : (
                      renderItemContent(item, index)
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
