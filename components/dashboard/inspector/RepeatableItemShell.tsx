"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Copy, Plus, Trash2 } from "lucide-react";

type ItemKey = string | number;

export type RepeatableItemShellProps<T> = {
  items: T[];
  getItemKey: (item: T, index: number) => ItemKey;
  getItemSummary?: (item: T, index: number) => ReactNode;
  itemLabel: string;
  itemDataAttribute?: string;
  addLabel?: string;
  addPosition?: "before" | "after";
  orderLabel?: string;
  onAdd?: () => ItemKey | void;
  onCopy: (index: number) => ItemKey | void;
  onDelete: (index: number) => void;
  onReorder: (sourceIndex: number, targetIndex: number) => void;
  renderItem: (item: T, index: number) => ReactNode;
};

export default function RepeatableItemShell<T>({
  items,
  getItemKey,
  getItemSummary,
  itemLabel,
  itemDataAttribute,
  addLabel = "Add item",
  addPosition = "after",
  orderLabel,
  onAdd,
  onCopy,
  onDelete,
  onReorder,
  renderItem,
}: RepeatableItemShellProps<T>) {
  const itemKeys = useMemo(
    () => items.map((item, index) => getItemKey(item, index)),
    [getItemKey, items],
  );
  const [openItemKey, setOpenItemKey] = useState<ItemKey | null>(null);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [dropTargetIndex, setDropTargetIndex] = useState<number | null>(null);
  const draggingIndexRef = useRef<number | null>(null);

  useEffect(() => {
    if (openItemKey === null || itemKeys.includes(openItemKey)) return;
    setOpenItemKey(null);
  }, [itemKeys, openItemKey]);

  const clearDragState = () => {
    draggingIndexRef.current = null;
    setDraggingIndex(null);
    setDropTargetIndex(null);
  };

  const reorderFromDrag = (targetIndex: number) => {
    const sourceIndex = draggingIndexRef.current ?? draggingIndex;
    if (sourceIndex !== null && sourceIndex !== targetIndex) {
      onReorder(sourceIndex, targetIndex);
    }
    clearDragState();
  };

  const handleAdd = () => {
    const newItemKey = onAdd?.();
    if (newItemKey !== undefined) setOpenItemKey(newItemKey);
  };

  const handleCopy = (index: number) => {
    const copiedItemKey = onCopy(index);
    if (copiedItemKey !== undefined) setOpenItemKey(copiedItemKey);
  };

  const handleDelete = (index: number) => {
    const deletedItemKey = itemKeys[index];
    onDelete(index);
    if (openItemKey !== deletedItemKey) return;
    setOpenItemKey(itemKeys.filter((_, itemIndex) => itemIndex !== index)[0] ?? null);
  };

  const addButton = onAdd ? (
    <button type="button" className="builder-inline-add" onClick={handleAdd}>
      <Plus size={15} /> {addLabel}
    </button>
  ) : null;

  return (
    <>
      {addPosition === "before" && addButton}
      {items.map((item, index) => {
        const itemKey = itemKeys[index];
        const isOpen = openItemKey === itemKey;
        const isDragOver = dropTargetIndex === index;
        const dataAttribute = itemDataAttribute ?? "data-repeatable-item-id";

        return (
          <div
            className={`builder-nested-card${isOpen ? " is-open" : ""}${isDragOver ? " is-drag-over" : ""}`}
            key={itemKey}
            {...{ [dataAttribute]: itemKey }}
            onPointerEnter={() => {
              const sourceIndex = draggingIndexRef.current ?? draggingIndex;
              if (sourceIndex !== null && sourceIndex !== index) {
                setDropTargetIndex(index);
              }
            }}
            onPointerUp={() => reorderFromDrag(index)}
            onDragOver={(event) => {
              const sourceIndex = draggingIndexRef.current ?? draggingIndex;
              if (sourceIndex === null || sourceIndex === index) return;
              event.preventDefault();
              setDropTargetIndex(index);
            }}
            onDragLeave={() =>
              setDropTargetIndex((current) => (current === index ? null : current))
            }
            onDrop={(event) => {
              event.preventDefault();
              reorderFromDrag(index);
            }}
          >
            <div className="builder-nested-card-header">
              <button
                type="button"
                className="builder-nested-card-drag-handle"
                draggable
                aria-label={`Drag ${itemLabel.toLowerCase()} ${index + 1}`}
                title="Drag to reorder"
                onClick={(event) => event.preventDefault()}
                onPointerDown={(event) => {
                  event.stopPropagation();
                  draggingIndexRef.current = index;
                  setDraggingIndex(index);
                }}
                onDragStart={(event) => {
                  event.stopPropagation();
                  event.dataTransfer.effectAllowed = "move";
                  draggingIndexRef.current = index;
                  setDraggingIndex(index);
                }}
                onDragEnd={clearDragState}
              >
                ⠿
              </button>
              <button
                type="button"
                className="builder-slide-toggle"
                aria-label={`Edit ${itemLabel.toLowerCase()} ${index + 1}`}
                aria-expanded={isOpen}
                onClick={() => setOpenItemKey(isOpen ? null : itemKey)}
              >
                <span>{itemLabel} {index + 1}</span>
                <small>{getItemSummary?.(item, index)}</small>
              </button>
              <button
                type="button"
                aria-label={`Copy ${itemLabel.toLowerCase()} ${index + 1}`}
                title="Copy item"
                onClick={() => handleCopy(index)}
              >
                <Copy size={14} />
              </button>
              <button
                type="button"
                aria-label={`Delete ${itemLabel.toLowerCase()} ${index + 1}`}
                title="Delete item"
                onClick={() => handleDelete(index)}
              >
                <Trash2 size={14} />
              </button>
            </div>
            {isOpen && (
              <div className="builder-nested-card-body">
                {renderItem(item, index)}
                <div className={orderLabel ? "builder-field" : undefined}>
                  {orderLabel && <span>{orderLabel}</span>}
                  <div className="builder-two-column">
                  <button
                    type="button"
                    className="builder-secondary-button"
                    disabled={index === 0}
                    onClick={() => onReorder(index, index - 1)}
                  >
                    Up
                  </button>
                  <button
                    type="button"
                    className="builder-secondary-button"
                    disabled={index === items.length - 1}
                    onClick={() => onReorder(index, index + 1)}
                  >
                    Down
                  </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
      {addPosition === "after" && addButton}
    </>
  );
}
