"use client";

import React, { useState, useMemo } from "react";
import {
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  GripVertical,
  Plus,
  Save,
  Trash2,
  FolderTree,
  Link,
  ChevronRight as ArrowRight
} from "lucide-react";
import type { ReactMenuItem } from "@/lib/builderShell";
import type { BuilderCustomPage } from "@/components/dashboard/builderTypes";

type ReactMenuEditorPanelProps = {
  menuItems: ReactMenuItem[];
  onChangeMenuItems: (newItems: ReactMenuItem[]) => void;
  onSaveMenuItems?: (newItems: ReactMenuItem[]) => void | Promise<void>;
  customPages: BuilderCustomPage[];
};

interface TreeItem {
  id: string;
  label: string;
  url: string;
  parentId: string | null;
  children: TreeItem[];
}

interface FlattenedNode {
  id: string;
  label: string;
  url: string;
  parentId: string | null;
  depth: number;
  hasPreviousSibling: boolean;
  hasNextSibling: boolean;
}

function buildMenuTree(items: ReactMenuItem[]): TreeItem[] {
  const itemMap: Record<string, TreeItem> = {};
  const rootItems: TreeItem[] = [];

  // Create tree items
  items.forEach((item) => {
    itemMap[item.id] = {
      id: item.id,
      label: item.label,
      url: item.url,
      parentId: item.parentId || null,
      children: [],
    };
  });

  // Connect parents and children
  items.forEach((item) => {
    const treeItem = itemMap[item.id];
    if (item.parentId && itemMap[item.parentId]) {
      itemMap[item.parentId].children.push(treeItem);
    } else {
      rootItems.push(treeItem);
    }
  });

  return rootItems;
}

function flattenMenuTree(tree: TreeItem[]): ReactMenuItem[] {
  const result: ReactMenuItem[] = [];

  function traverse(nodes: TreeItem[]) {
    nodes.forEach((node) => {
      result.push({
        id: node.id,
        label: node.label,
        url: node.url,
        parentId: node.parentId,
      });
      if (node.children && node.children.length > 0) {
        traverse(node.children);
      }
    });
  }

  traverse(tree);
  return result;
}

function getFlattenedNodes(tree: TreeItem[], depth = 0): FlattenedNode[] {
  const result: FlattenedNode[] = [];
  tree.forEach((node, index) => {
    result.push({
      id: node.id,
      label: node.label,
      url: node.url,
      parentId: node.parentId,
      depth,
      hasPreviousSibling: index > 0,
      hasNextSibling: index < tree.length - 1,
    });
    if (node.children && node.children.length > 0) {
      result.push(...getFlattenedNodes(node.children, depth + 1));
    }
  });
  return result;
}

export default function ReactMenuEditorPanel({
  menuItems,
  onChangeMenuItems,
  onSaveMenuItems,
  customPages,
}: ReactMenuEditorPanelProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draggingMenuId, setDraggingMenuId] = useState<string | null>(null);
  const [dragOverMenuId, setDragOverMenuId] = useState<string | null>(null);

  const treeItems = useMemo(() => buildMenuTree(menuItems), [menuItems]);
  const flattenedNodes = useMemo(() => getFlattenedNodes(treeItems), [treeItems]);

  const isDescendant = (parentCandidateId: string, childCandidateId: string): boolean => {
    let parentId = menuItems.find((x) => x.id === childCandidateId)?.parentId || null;
    while (parentId) {
      if (parentId === parentCandidateId) return true;
      parentId = menuItems.find((x) => x.id === parentId)?.parentId || null;
    }
    return false;
  };

  const handleDropReorder = (draggedId: string, targetId: string) => {
    if (draggedId === targetId) return;
    if (isDescendant(draggedId, targetId)) return;

    const tree = buildMenuTree(menuItems);
    
    // 1. Find and remove the dragged item from the tree
    let draggedNode: TreeItem | null = null;
    
    function removeNode(list: TreeItem[]): boolean {
      const idx = list.findIndex((x) => x.id === draggedId);
      if (idx !== -1) {
        draggedNode = list[idx];
        list.splice(idx, 1);
        return true;
      }
      for (const node of list) {
        if (node.children && removeNode(node.children)) {
          return true;
        }
      }
      return false;
    }
    
    removeNode(tree);
    if (!draggedNode) return;

    // 2. Find the target node in the tree and insert the dragged node as its sibling
    let inserted = false;
    
    function insertAsSibling(list: TreeItem[]): boolean {
      const idx = list.findIndex((x) => x.id === targetId);
      if (idx !== -1) {
        const targetNode = list[idx];
        draggedNode!.parentId = targetNode.parentId;
        list.splice(idx, 0, draggedNode!);
        inserted = true;
        return true;
      }
      for (const node of list) {
        if (node.children && insertAsSibling(node.children)) {
          return true;
        }
      }
      return false;
    }
    
    insertAsSibling(tree);
    
    if (inserted) {
      onChangeMenuItems(flattenMenuTree(tree));
    }
  };

  const coreRoutes = useMemo(() => [
    { label: "Home", url: "/" },
    { label: "Shop", url: "/shop" },
    { label: "Cart", url: "/cart" },
    { label: "Checkout", url: "/checkout" },
    { label: "My Account", url: "/my-account" },
  ], []);

  const builderPageRoutes = useMemo(() => {
    return customPages.map((page) => ({
      label: page.title,
      url: page.slug.startsWith("/") ? page.slug : `/${page.slug}`,
    }));
  }, [customPages]);

  const allDestinations = useMemo(() => {
    return [...coreRoutes, ...builderPageRoutes];
  }, [coreRoutes, builderPageRoutes]);

  const handleMove = (itemId: string, direction: "up" | "down") => {
    const tree = buildMenuTree(menuItems);
    let swapped = false;

    function processList(list: TreeItem[]): boolean {
      const index = list.findIndex((x) => x.id === itemId);
      if (index !== -1) {
        if (direction === "up" && index > 0) {
          const temp = list[index];
          list[index] = list[index - 1];
          list[index - 1] = temp;
          swapped = true;
          return true;
        } else if (direction === "down" && index < list.length - 1) {
          const temp = list[index];
          list[index] = list[index + 1];
          list[index + 1] = temp;
          swapped = true;
          return true;
        }
        return false;
      }
      for (const node of list) {
        if (node.children && node.children.length > 0) {
          if (processList(node.children)) return true;
        }
      }
      return false;
    }

    processList(tree);
    if (swapped) {
      onChangeMenuItems(flattenMenuTree(tree));
    }
  };

  const handleIndent = (itemId: string) => {
    const tree = buildMenuTree(menuItems);
    let updated = false;

    function processList(list: TreeItem[]): boolean {
      const index = list.findIndex((x) => x.id === itemId);
      if (index !== -1) {
        if (index > 0) {
          const newParent = list[index - 1];
          const node = list[index];
          node.parentId = newParent.id;
          list.splice(index, 1);
          newParent.children.push(node);
          updated = true;
          return true;
        }
        return false;
      }
      for (const node of list) {
        if (node.children && node.children.length > 0) {
          if (processList(node.children)) return true;
        }
      }
      return false;
    }

    processList(tree);
    if (updated) {
      onChangeMenuItems(flattenMenuTree(tree));
    }
  };

  const handleOutdent = (itemId: string) => {
    const tree = buildMenuTree(menuItems);
    let updated = false;

    function findAndOutdent(
      list: TreeItem[],
      parentNode: TreeItem | null,
      grandparentId: string | null,
      treeRoot: TreeItem[]
    ): boolean {
      const index = list.findIndex((x) => x.id === itemId);
      if (index !== -1) {
        if (parentNode) {
          const node = list[index];
          node.parentId = grandparentId;
          list.splice(index, 1);

          if (grandparentId) {
            const findNode = (nodes: TreeItem[]): TreeItem | null => {
              for (const n of nodes) {
                if (n.id === grandparentId) return n;
                if (n.children) {
                  const f = findNode(n.children);
                  if (f) return f;
                }
              }
              return null;
            };
            const gp = findNode(treeRoot);
            if (gp) {
              const parentIndex = gp.children.findIndex((x) => x.id === parentNode.id);
              if (parentIndex !== -1) {
                gp.children.splice(parentIndex + 1, 0, node);
              } else {
                gp.children.push(node);
              }
            }
          } else {
            const parentIndex = treeRoot.findIndex((x) => x.id === parentNode.id);
            if (parentIndex !== -1) {
              treeRoot.splice(parentIndex + 1, 0, node);
            } else {
              treeRoot.push(node);
            }
          }
          updated = true;
          return true;
        }
        return false;
      }

      for (const node of list) {
        if (node.children && node.children.length > 0) {
          if (findAndOutdent(node.children, node, parentNode ? parentNode.id : null, treeRoot)) {
            return true;
          }
        }
      }
      return false;
    }

    findAndOutdent(tree, null, null, tree);
    if (updated) {
      onChangeMenuItems(flattenMenuTree(tree));
    }
  };

  const handleDelete = (itemId: string) => {
    const deletedItem = menuItems.find((x) => x.id === itemId);
    const parentIdOfDeleted = deletedItem ? (deletedItem.parentId || null) : null;
    
    // Remove the item and promote its children to its parent's level
    const nextItems = menuItems
      .filter((item) => item.id !== itemId)
      .map((item) =>
        item.parentId === itemId ? { ...item, parentId: parentIdOfDeleted } : item
      );

    onChangeMenuItems(nextItems);
    if (selectedId === itemId) {
      setSelectedId(null);
    }
  };

  const handleAdd = () => {
    const newId = `menu_${Math.random().toString(36).substring(2, 11)}`;
    const newItem: ReactMenuItem = {
      id: newId,
      label: "New Menu Item",
      url: "/",
      parentId: null,
    };
    onChangeMenuItems([...menuItems, newItem]);
    setSelectedId(newId);
  };

  const handleUpdateItem = (itemId: string, patch: Partial<ReactMenuItem>) => {
    const nextItems = menuItems.map((item) =>
      item.id === itemId ? { ...item, ...patch } : item
    );
    onChangeMenuItems(nextItems);
  };

  // Prevent circular relationships by filtering out descendants and the item itself
  const validParents = useMemo(() => {
    if (!selectedId) return [];

    const descendants = new Set<string>();
    const getParentId = (id: string): string | null => {
      const found = menuItems.find((x) => x.id === id);
      return found ? (found.parentId || null) : null;
    };

    menuItems.forEach((item) => {
      let currentParent = item.parentId;
      while (currentParent) {
        if (currentParent === selectedId) {
          descendants.add(item.id);
          break;
        }
        currentParent = getParentId(currentParent);
      }
    });

    return menuItems.filter((item) => item.id !== selectedId && !descendants.has(item.id));
  }, [menuItems, selectedId]);

  const selectedItem = useMemo(() => {
    return menuItems.find((item) => item.id === selectedId) || null;
  }, [menuItems, selectedId]);

  const currentDestinationValue = useMemo(() => {
    if (!selectedItem) return "";
    const matched = allDestinations.find((dest) => dest.url === selectedItem.url);
    return matched ? matched.url : "custom";
  }, [selectedItem, allDestinations]);

  const handleDestinationChange = (urlVal: string) => {
    if (!selectedItem) return;
    if (urlVal === "custom") {
      handleUpdateItem(selectedItem.id, { url: "" });
      return;
    }

    const matched = allDestinations.find((dest) => dest.url === urlVal);
    if (matched) {
      const isGeneric =
        !selectedItem.label ||
        selectedItem.label.trim() === "" ||
        selectedItem.label === "New Item" ||
        selectedItem.label === "New Menu Item";

      const patch: Partial<ReactMenuItem> = { url: matched.url };
      if (isGeneric) {
        patch.label = matched.label;
      }
      handleUpdateItem(selectedItem.id, patch);
    }
  };

  return (
    <div className="builder-sidebar-panel" style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h4 style={{ margin: 0, fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--builder-ui-muted)" }}>
          Navigation Structure
        </h4>
        <button
          type="button"
          onClick={handleAdd}
          className="builder-secondary-button"
          style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "6px 12px", minHeight: "30px", fontSize: "11px" }}
        >
          <Plus size={13} />
          Add Item
        </button>
        {onSaveMenuItems && (
          <button
            type="button"
            onClick={() => void onSaveMenuItems(menuItems)}
            className="builder-primary-button"
            style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "6px 12px", minHeight: "30px", fontSize: "11px" }}
          >
            <Save size={13} />
            Save Menu
          </button>
        )}
      </div>

      {flattenedNodes.length > 0 ? (
        <div className="builder-menu-tree" style={{ display: "grid", gap: "8px" }}>
          {flattenedNodes.map((node) => {
            const isSelected = selectedId === node.id;
            const isDragging = draggingMenuId === node.id;
            const isDragOver = dragOverMenuId === node.id;
            return (
              <div
                key={node.id}
                className={`builder-menu-row ${isDragging ? "is-dragging" : ""} ${
                  isDragOver ? "is-drag-over" : ""
                }`}
                draggable
                onDragStart={(event) => {
                  setDraggingMenuId(node.id);
                  event.dataTransfer.setData("application/x-builder-menu-item", node.id);
                  event.dataTransfer.effectAllowed = "move";
                }}
                onDragOver={(event) => {
                  if (draggingMenuId && draggingMenuId !== node.id && !isDescendant(draggingMenuId, node.id)) {
                    event.preventDefault();
                    setDragOverMenuId(node.id);
                  }
                }}
                onDragLeave={() => {
                  if (dragOverMenuId === node.id) {
                    setDragOverMenuId(null);
                  }
                }}
                onDrop={(event) => {
                  event.preventDefault();
                  const draggedId = event.dataTransfer.getData("application/x-builder-menu-item");
                  if (draggedId && draggedId !== node.id) {
                    handleDropReorder(draggedId, node.id);
                  }
                  setDraggingMenuId(null);
                  setDragOverMenuId(null);
                }}
                onDragEnd={() => {
                  setDraggingMenuId(null);
                  setDragOverMenuId(null);
                }}
                style={{
                  marginLeft: `${node.depth * 16}px`,
                  display: "grid",
                  gap: "6px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    width: "100%",
                  }}
                >
                  <GripVertical
                    size={14}
                    className="builder-group-drag-handle"
                    style={{
                      cursor: "grab",
                      flexShrink: 0,
                    }}
                  />
                  <button
                    type="button"
                    className={`builder-menu-row-button ${isSelected ? "is-active" : ""}`}
                    onClick={() => setSelectedId(isSelected ? null : node.id)}
                    style={{
                      flex: 1,
                      padding: "8px 10px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-start",
                      border: isSelected
                        ? "1px solid var(--builder-ui-border-strong)"
                        : "1px solid var(--builder-ui-border)",
                      backgroundColor: isSelected
                        ? "var(--builder-ui-panel-solid)"
                        : "var(--builder-ui-surface)",
                      textAlign: "left",
                    }}
                  >
                    <span className="builder-menu-row-title" style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                      <strong style={{ fontSize: "12px", fontWeight: 700, color: "var(--builder-ui-text)" }}>
                        {node.label}
                      </strong>
                      <span style={{ fontSize: "10px", color: "var(--builder-ui-muted)", display: "inline-flex", alignItems: "center", gap: "3px" }}>
                        <Link size={10} />
                        {node.url}
                      </span>
                    </span>
                  </button>

                  <div style={{ display: "flex", gap: "3px", flexShrink: 0 }}>
                    <button
                      type="button"
                      className="builder-icon-button"
                      disabled={!node.hasPreviousSibling}
                      onClick={() => handleMove(node.id, "up")}
                      style={{
                        padding: "6px",
                        opacity: node.hasPreviousSibling ? 1 : 0.3,
                        cursor: node.hasPreviousSibling ? "pointer" : "not-allowed",
                        backgroundColor: "var(--builder-ui-panel-solid)",
                        border: "1px solid var(--builder-ui-border)",
                        borderRadius: "4px",
                      }}
                      title="Move Up"
                    >
                      <ArrowUp size={12} />
                    </button>
                    <button
                      type="button"
                      className="builder-icon-button"
                      disabled={!node.hasNextSibling}
                      onClick={() => handleMove(node.id, "down")}
                      style={{
                        padding: "6px",
                        opacity: node.hasNextSibling ? 1 : 0.3,
                        cursor: node.hasNextSibling ? "pointer" : "not-allowed",
                        backgroundColor: "var(--builder-ui-panel-solid)",
                        border: "1px solid var(--builder-ui-border)",
                        borderRadius: "4px",
                      }}
                      title="Move Down"
                    >
                      <ArrowDown size={12} />
                    </button>
                    <button
                      type="button"
                      className="builder-icon-button"
                      disabled={!node.hasPreviousSibling}
                      onClick={() => handleIndent(node.id)}
                      style={{
                        padding: "6px",
                        opacity: node.hasPreviousSibling ? 1 : 0.3,
                        cursor: node.hasPreviousSibling ? "pointer" : "not-allowed",
                        backgroundColor: "var(--builder-ui-panel-solid)",
                        border: "1px solid var(--builder-ui-border)",
                        borderRadius: "4px",
                      }}
                      title="Make Child (Indent)"
                    >
                      <ChevronRight size={12} />
                    </button>
                    <button
                      type="button"
                      className="builder-icon-button"
                      disabled={node.depth === 0}
                      onClick={() => handleOutdent(node.id)}
                      style={{
                        padding: "6px",
                        opacity: node.depth > 0 ? 1 : 0.3,
                        cursor: node.depth > 0 ? "pointer" : "not-allowed",
                        backgroundColor: "var(--builder-ui-panel-solid)",
                        border: "1px solid var(--builder-ui-border)",
                        borderRadius: "4px",
                      }}
                      title="Promote (Outdent)"
                    >
                      <ChevronLeft size={12} />
                    </button>
                    <button
                      type="button"
                      className="builder-icon-button"
                      onClick={() => handleDelete(node.id)}
                      style={{
                        padding: "6px",
                        color: "#ef4444",
                        backgroundColor: "var(--builder-ui-panel-solid)",
                        border: "1px solid var(--builder-ui-border)",
                        borderRadius: "4px",
                        cursor: "pointer",
                      }}
                      title="Delete Item"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>

                {isSelected && selectedItem && (
                  <div
                    className="builder-menu-editor"
                    style={{
                      padding: "12px",
                      borderRadius: "6px",
                      border: "1px solid var(--builder-ui-border)",
                      backgroundColor: "var(--builder-ui-panel-solid)",
                      display: "grid",
                      gap: "10px",
                      marginTop: "2px",
                    }}
                  >
                    <h5 style={{ margin: 0, fontSize: "11px", textTransform: "uppercase", color: "var(--builder-ui-text)" }}>
                      Edit Menu Item
                    </h5>
                    
                    <label className="builder-field">
                      <span>Label</span>
                      <input
                        type="text"
                        value={selectedItem.label}
                        onChange={(e) => handleUpdateItem(node.id, { label: e.target.value })}
                        onKeyDown={(event) => event.stopPropagation()}
                        placeholder="e.g. Shop"
                        style={{ width: "100%", padding: "6px 8px", fontSize: "12px" }}
                      />
                    </label>

                    <label className="builder-field">
                      <span>Link Destination</span>
                      <select
                        value={currentDestinationValue}
                        onChange={(e) => handleDestinationChange(e.target.value)}
                        style={{ width: "100%", padding: "6px 8px", fontSize: "12px" }}
                      >
                        <option value="custom">[Custom / External Link]</option>
                        <optgroup label="Core Storefront Pages">
                          {coreRoutes.map((route) => (
                            <option key={route.url} value={route.url}>
                              {route.label} ({route.url})
                            </option>
                          ))}
                        </optgroup>
                        {builderPageRoutes.length > 0 && (
                          <optgroup label="React Builder Pages">
                            {builderPageRoutes.map((route) => (
                              <option key={route.url} value={route.url}>
                                {route.label} ({route.url})
                              </option>
                            ))}
                          </optgroup>
                        )}
                      </select>
                    </label>

                    <label className="builder-field">
                      <span>URL / Path</span>
                      <input
                        type="text"
                        value={selectedItem.url}
                        onChange={(e) => handleUpdateItem(node.id, { url: e.target.value })}
                        onKeyDown={(event) => event.stopPropagation()}
                        placeholder="e.g. /shop"
                        style={{ width: "100%", padding: "6px 8px", fontSize: "12px" }}
                      />
                    </label>

                    <label className="builder-field">
                      <span>Parent Item</span>
                      <select
                        value={selectedItem.parentId || ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          handleUpdateItem(node.id, { parentId: val === "" ? null : val });
                        }}
                        style={{ width: "100%", padding: "6px 8px", fontSize: "12px" }}
                      >
                        <option value="">[None - Top Level]</option>
                        {validParents.map((parent) => (
                          <option key={parent.id} value={parent.id}>
                            {parent.label} ({parent.url})
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div
          className="builder-empty-state"
          style={{
            padding: "24px 12px",
            border: "1px dashed var(--builder-ui-border)",
            borderRadius: "6px",
            textAlign: "center",
            color: "var(--builder-ui-muted)",
          }}
        >
          <FolderTree size={20} style={{ marginBottom: "8px", opacity: 0.6 }} />
          <p style={{ margin: 0, fontSize: "12px" }}>No React menu items found.</p>
          <p style={{ margin: "4px 0 0 0", fontSize: "11px", opacity: 0.8 }}>
            Click "Add Item" to start building your menu.
          </p>
        </div>
      )}
    </div>
  );
}
