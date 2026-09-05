"use client";

import React, { useRef, useState, useMemo } from "react";
import MenuDropdownBuilder from "./MenuDropdownBuilder";
import type { InspectorPanelContext } from "./inspector/inspectorRouting";
import {
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  GripVertical,
  Plus,
  Trash2,
  FolderTree,
  Link,
  Download,
  RefreshCw,
  Upload,
} from "lucide-react";
import type {
  BuilderMenuPresentation,
  BuilderMenuPresentationMap,
  BuilderNamedMenu,
  ReactMenuItem,
} from "@/lib/builderShell";
import type { BuilderCustomPage } from "@/components/dashboard/builderTypes";
import {
  createPortableNavigationPackage,
  materializePortableNavigation,
  parsePortableNavigationPackage,
  portableTargetHref,
  previewPortableNavigationPackage,
  type NavigationInstallPreview,
  type PortableNavigationPackage,
} from "@/lib/navigationPackage";

type ReactMenuEditorPanelProps = {
  embeddedBuilderHost: import("./EmbeddedBuilderHost").EmbeddedBuilderHost;
  shellSettings: InspectorPanelContext["shellSettings"];
  openWordPressMediaPicker: InspectorPanelContext["openWordPressMediaPicker"];
  menuItems: ReactMenuItem[];
  onChangeMenuItems: (newItems: ReactMenuItem[]) => void;
  namedMenus: BuilderNamedMenu[];
  onChangeNamedMenus: (newMenus: BuilderNamedMenu[]) => void;
  menuPresentation: BuilderMenuPresentationMap;
  onUpdateNavigation: (patch: {
    menuItems?: ReactMenuItem[];
    namedMenus?: BuilderNamedMenu[];
    menuPresentation?: BuilderMenuPresentationMap;
  }) => void;
  customPages: BuilderCustomPage[];
  websiteId?: string;
  wordpressOrigin?: string | null;
  wordpressSiteUrl?: string | null;
};

type TreeItem = ReactMenuItem & {
  children: TreeItem[];
};

interface FlattenedNode {
  id: string;
  label: string;
  url: string;
  parentId: string | null;
  depth: number;
  hasPreviousSibling: boolean;
  hasNextSibling: boolean;
}

const defaultMenuPresentation: BuilderMenuPresentation = {
  showHeading: false,
  icon: null,
  submenuLayout: "list",
  submenuColumns: 3,
  submenuWidth: null,
  mobileAccordion: true,
  badgeText: null,
};

function buildMenuTree(items: ReactMenuItem[]): TreeItem[] {
  const itemMap: Record<string, TreeItem> = {};
  const rootItems: TreeItem[] = [];

  // Create tree items
  items.forEach((item) => {
    itemMap[item.id] = {
      ...item,
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
      const { children, ...item } = node;
      result.push({
        ...item,
        parentId: node.parentId || null,
      });
      if (children.length > 0) {
        traverse(children);
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
      parentId: node.parentId ?? null,
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
  menuItems: mainMenuItems,
  onChangeMenuItems: onChangeMainMenuItems,
  namedMenus,
  onChangeNamedMenus,
  menuPresentation,
  onUpdateNavigation,
  customPages,
  websiteId,
  wordpressOrigin,
  wordpressSiteUrl,
  shellSettings,
  embeddedBuilderHost,
  openWordPressMediaPicker,
}: ReactMenuEditorPanelProps) {
  const [builderItemId, setBuilderItemId] = useState<string | null>(null);
  const [selectedMenuSource, setSelectedMenuSource] = useState("main");
  const [newMenuName, setNewMenuName] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draggingMenuId, setDraggingMenuId] = useState<string | null>(null);
  const [dragOverMenuId, setDragOverMenuId] = useState<string | null>(null);
  const [portablePreview, setPortablePreview] = useState<NavigationInstallPreview | null>(null);
  const [previewSource, setPreviewSource] = useState<"wordpress" | "upload" | null>(null);
  const [navigationStatus, setNavigationStatus] = useState("");
  const [navigationBusy, setNavigationBusy] = useState(false);
  const [mappingSlugs, setMappingSlugs] = useState<Record<string, string>>({});
  const uploadRef = useRef<HTMLInputElement>(null);

  const selectedNamedMenu = namedMenus.find((menu) => menu.id === selectedMenuSource) ?? null;
  const menuItems = selectedNamedMenu?.items ?? mainMenuItems;
  const activeMenuName = selectedNamedMenu?.name ?? "Main Navigation";
  const onChangeMenuItems = (newItems: ReactMenuItem[]) => {
    if (!selectedNamedMenu) {
      onChangeMainMenuItems(newItems);
      return;
    }
    onChangeNamedMenus(namedMenus.map((menu) =>
      menu.id === selectedNamedMenu.id ? { ...menu, items: newItems } : menu,
    ));
  };

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
    { label: "Home", url: "/", target: { kind: "system" as const, pageKey: "home", uri: "/" } },
    { label: "Shop", url: "/shop", target: { kind: "system" as const, pageKey: "shop", uri: "/shop" } },
    { label: "Cart", url: "/cart", target: { kind: "system" as const, pageKey: "cart", uri: "/cart" } },
    { label: "Checkout", url: "/checkout", target: { kind: "system" as const, pageKey: "checkout", uri: "/checkout" } },
    { label: "My Account", url: "/my-account", target: { kind: "system" as const, pageKey: "my-account", uri: "/my-account" } },
  ], []);

  const builderPageRoutes = useMemo(() => {
    return customPages.map((page) => ({
      label: page.title,
      url: page.slug.startsWith("/") ? page.slug : `/${page.slug}`,
      target: {
        kind: "webpages-page" as const,
        pageKey: page.key,
        slug: page.slug.replace(/^\/+/, ""),
        uri: page.slug.startsWith("/") ? page.slug : `/${page.slug}`,
      },
    }));
  }, [customPages]);

  const allDestinations = useMemo(() => {
    return [...coreRoutes, ...builderPageRoutes];
  }, [coreRoutes, builderPageRoutes]);

  const navigationApiUrl = websiteId
    ? `/api/wordpress-navigation?websiteId=${encodeURIComponent(websiteId)}`
    : "/api/wordpress-navigation";

  const currentPackage = () => createPortableNavigationPackage({
    name: activeMenuName,
    intendedLocation: selectedNamedMenu ? null : "PRIMARY",
    sourceOrigin: wordpressOrigin,
    items: menuItems,
    presentation: menuPresentation,
    targetsByItemId: Object.fromEntries(menuItems.map((item) => {
      const authoredTarget = item.navigationTarget;
      const destinationTarget = allDestinations.find((destination) => destination.url === item.url)?.target;
      return [item.id, authoredTarget ?? destinationTarget];
    }).filter((entry): entry is [string, NonNullable<ReactMenuItem["navigationTarget"]>] => Boolean(entry[1]))),
  });

  const downloadPackage = () => {
    const packageValue = currentPackage();
    const blob = new Blob([JSON.stringify(packageValue, null, 2)], { type: "application/json" });
    const href = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = href;
    anchor.download = `webpages-${activeMenuName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "navigation"}.v1.json`;
    anchor.click();
    URL.revokeObjectURL(href);
    setNavigationStatus(`Exported ${packageValue.menu.items.length} navigation items.`);
  };

  const previewPackage = async (
    packageValue: PortableNavigationPackage,
    source: "wordpress" | "upload",
    resolveWordPressTargets = Boolean(wordpressSiteUrl),
  ) => {
    const localPreview = previewPortableNavigationPackage(packageValue, Boolean(wordpressSiteUrl));
    setPortablePreview(localPreview);
    setPreviewSource(source);
    setNavigationStatus("Preview ready. No WebPages menu has been changed.");

    const hasWordPressTargets = packageValue.menu.items.some((item) =>
      ["page", "post", "product", "term"].includes(item.target.kind),
    );
    if (!resolveWordPressTargets || !wordpressSiteUrl || !hasWordPressTargets) return;

    setNavigationBusy(true);
    setNavigationStatus("Preview ready; resolving optional WordPress targets…");
    try {
      const response = await fetch(navigationApiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ package: packageValue }),
      });
      const payload = await response.json() as { preview?: NavigationInstallPreview; error?: string };
      if (!response.ok || !payload.preview) throw new Error(payload.error || "WordPress target resolution failed.");
      setPortablePreview(payload.preview);
      setNavigationStatus("Preview ready. WordPress targets were resolved where available.");
    } catch (error) {
      setNavigationStatus(
        `${error instanceof Error ? error.message : "WordPress target resolution failed."} The package can still be installed as a WebPages menu.`,
      );
    } finally {
      setNavigationBusy(false);
    }
  };

  const refreshFromWordPress = async () => {
    setNavigationBusy(true);
    setNavigationStatus("Reading menus from the connected WordPress site…");
    try {
      const response = await fetch(navigationApiUrl);
      const payload = await response.json() as { packages?: PortableNavigationPackage[]; error?: string };
      if (!response.ok) throw new Error(payload.error || "WordPress menu retrieval failed.");
      const packageValue = payload.packages?.find((item) =>
        ["PRIMARY", "NAVBAR"].includes(item.menu.intendedLocation ?? ""),
      ) ?? payload.packages?.[0];
      if (!packageValue) throw new Error("The connected WordPress site did not return any menus.");
      await previewPackage(parsePortableNavigationPackage(packageValue), "wordpress", true);
    } catch (error) {
      setPortablePreview(null);
      setNavigationStatus(error instanceof Error ? error.message : "WordPress menu retrieval failed.");
      setNavigationBusy(false);
    }
  };

  const uploadPackage = async (file: File) => {
    try {
      const packageValue = parsePortableNavigationPackage(JSON.parse(await file.text()));
      await previewPackage(packageValue, "upload");
    } catch (error) {
      setPortablePreview(null);
      setNavigationStatus(error instanceof Error ? error.message : "Navigation package is invalid.");
    } finally {
      if (uploadRef.current) uploadRef.current.value = "";
    }
  };

  const resolveExplicitMapping = async (key: string) => {
    if (!portablePreview) return;
    const slug = mappingSlugs[key]?.trim();
    if (!slug) {
      setNavigationStatus("Enter the slug of an existing destination target.");
      return;
    }
    const mappedPackage = parsePortableNavigationPackage({
      ...portablePreview.package,
      menu: {
        ...portablePreview.package.menu,
        items: portablePreview.package.menu.items.map((item) =>
          item.key === key ? { ...item, target: { ...item.target, slug } } : item,
        ),
      },
    });
    await previewPackage(mappedPackage, previewSource ?? "upload", true);
  };

  const destinationMenuId = (name: string) => {
    const base = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "navigation";
    const used = new Set(namedMenus.map((menu) => menu.id));
    let id = base;
    let suffix = 2;
    while (id === "main" || used.has(id)) id = `${base}-${suffix++}`;
    return id;
  };

  const destinationMenuName = (name: string) => {
    const used = new Set(["Main Navigation", ...namedMenus.map((menu) => menu.name)]);
    if (!used.has(name)) return name;
    const base = `${name} (Imported)`;
    let candidate = base;
    let suffix = 2;
    while (used.has(candidate)) candidate = `${base} ${suffix++}`;
    return candidate;
  };

  const materializeForWebPages = (packageValue: PortableNavigationPackage, menuId: string) => {
    const destinationIds = Object.fromEntries(packageValue.menu.items.map((item) => [
      item.key,
      `${menuId}-${item.key}`,
    ]));
    return materializePortableNavigation(packageValue, destinationIds);
  };

  const installAsNamedMenu = () => {
    if (!portablePreview) return;
    const menuName = destinationMenuName(portablePreview.package.menu.name);
    const menuId = destinationMenuId(menuName);
    const next = materializeForWebPages(portablePreview.package, menuId);
    const nextNamedMenus = [...namedMenus, {
      id: menuId,
      name: menuName,
      items: next.items,
    }];
    onUpdateNavigation({
      namedMenus: nextNamedMenus,
      menuPresentation: { ...menuPresentation, ...next.presentation },
    });
    setSelectedMenuSource(menuId);
    setPortablePreview(null);
    setPreviewSource(null);
    setNavigationStatus(
      `Installed “${menuName}” as a WebPages named menu${portablePreview.unresolvedCount ? ` with ${portablePreview.unresolvedCount} unresolved WordPress target(s) retained` : ""}.`,
    );
  };

  const replaceSelectedMenu = async () => {
    if (!portablePreview) return;
    if (!window.confirm(`Replace “${activeMenuName}” with “${portablePreview.package.menu.name}”?`)) return;
    if (previewSource === "wordpress") {
      const response = await fetch(navigationApiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ package: portablePreview.package, installAssignedPages: true }),
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({})) as { error?: string };
        setNavigationStatus(payload.error || "Assigned WordPress Pages could not be materialized.");
        return;
      }
    }
    const menuId = selectedNamedMenu?.id ?? "main";
    const next = materializeForWebPages(portablePreview.package, menuId);
    const activeIds = new Set(menuItems.map((item) => item.id));
    const nextPresentation = Object.fromEntries(
      Object.entries(menuPresentation).filter(([id]) => !activeIds.has(id)),
    );
    const claimedCurrentIds = new Set<string>();
    for (const portableItem of portablePreview.package.menu.items) {
      const nextItem = next.items.find((item) => item.portableKey === portableItem.key);
      if (!nextItem || nextPresentation[nextItem.id]) continue;
      const current = menuItems.find((item) =>
        !claimedCurrentIds.has(item.id) && (
          item.portableKey === portableItem.key ||
          (item.label === portableItem.label && item.url === portableTargetHref(portableItem.target))
        ),
      );
      if (current) {
        claimedCurrentIds.add(current.id);
        if (menuPresentation[current.id]) nextPresentation[nextItem.id] = menuPresentation[current.id];
      }
    }
    const mergedPresentation = { ...nextPresentation, ...next.presentation };
    if (selectedNamedMenu) {
      onUpdateNavigation({
        namedMenus: namedMenus.map((menu) =>
          menu.id === selectedNamedMenu.id
            ? { ...menu, name: portablePreview.package.menu.name, items: next.items }
            : menu,
        ),
        menuPresentation: mergedPresentation,
      });
    } else {
      onUpdateNavigation({ menuItems: next.items, menuPresentation: mergedPresentation });
    }
    setPortablePreview(null);
    setPreviewSource(null);
    setNavigationStatus(
      `${previewSource === "wordpress" ? "Imported WordPress snapshot into" : "Installed package in"} “${activeMenuName}”.`,
    );
  };

  const createNamedMenu = () => {
    const name = newMenuName.trim();
    if (!name) return;
    const id = destinationMenuId(name);
    onChangeNamedMenus([...namedMenus, { id, name, items: [] }]);
    setSelectedMenuSource(id);
    setNewMenuName("");
    setSelectedId(null);
  };

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

  const handleUpdatePresentation = (
    itemId: string,
    patch: Partial<BuilderMenuPresentation>,
  ) => {
    onUpdateNavigation({
      menuPresentation: {
        ...menuPresentation,
        [itemId]: {
          ...defaultMenuPresentation,
          ...menuPresentation[itemId],
          ...patch,
        },
      },
    });
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
      handleUpdateItem(selectedItem.id, { url: "", navigationTarget: undefined });
      return;
    }

    const matched = allDestinations.find((dest) => dest.url === urlVal);
    if (matched) {
      const isGeneric =
        !selectedItem.label ||
        selectedItem.label.trim() === "" ||
        selectedItem.label === "New Item" ||
        selectedItem.label === "New Menu Item";

      const patch: Partial<ReactMenuItem> = {
        url: matched.url,
        navigationTarget: matched.target,
      };
      if (isGeneric) {
        patch.label = matched.label;
      }
      handleUpdateItem(selectedItem.id, patch);
    }
  };

  const builderItem = menuItems.find(item => item.id === builderItemId && !item.parentId);
  if (builderItem) return <MenuDropdownBuilder key={`${selectedMenuSource}:${builderItem.id}`} host={embeddedBuilderHost} item={builderItem} shellSettings={shellSettings} openWordPressMediaPicker={openWordPressMediaPicker} onClose={() => setBuilderItemId(null)} onApply={dropdownContent => handleUpdateItem(builderItem.id, { dropdownContent })} />;
  return (
    <div className="builder-sidebar-panel" style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
      <div className="builder-card" style={{ display: "grid", gap: "8px", padding: "10px" }}>
        <label className="builder-field">
          <span>WebPages menu</span>
          <select
            aria-label="WebPages menu"
            value={selectedNamedMenu?.id ?? "main"}
            onChange={(event) => {
              setSelectedMenuSource(event.target.value);
              setSelectedId(null);
              setPortablePreview(null);
            }}
          >
            <option value="main">Main Navigation</option>
            {namedMenus.map((menu) => <option key={menu.id} value={menu.id}>{menu.name}</option>)}
          </select>
        </label>
        <div style={{ display: "flex", gap: "6px" }}>
          <input
            type="text"
            aria-label="New named menu name"
            value={newMenuName}
            onChange={(event) => setNewMenuName(event.target.value)}
            onKeyDown={(event) => {
              event.stopPropagation();
              if (event.key === "Enter") createNamedMenu();
            }}
            placeholder="New named menu"
            style={{ minWidth: 0, flex: 1 }}
          />
          <button type="button" className="builder-secondary-button" disabled={!newMenuName.trim()} onClick={createNamedMenu}>
            <Plus size={12} /> Create
          </button>
        </div>
      </div>
      <div className="builder-card" style={{ display: "grid", gap: "8px", padding: "10px" }}>
        <strong style={{ fontSize: "11px" }}>Portable WebPages navigation</strong>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
          <button
            type="button"
            className="builder-secondary-button"
            disabled={navigationBusy || !wordpressSiteUrl}
            title={!wordpressSiteUrl ? "Connect WordPress to import a WordPress menu." : undefined}
            onClick={refreshFromWordPress}
          >
            <RefreshCw size={12} /> Import from WordPress
          </button>
          <button type="button" className="builder-secondary-button" onClick={downloadPackage}>
            <Download size={12} /> Export package
          </button>
          <button type="button" className="builder-secondary-button" onClick={() => uploadRef.current?.click()}>
            <Upload size={12} /> Install package
          </button>
          <input
            ref={uploadRef}
            type="file"
            accept="application/json,.json"
            hidden
            onChange={(event) => event.target.files?.[0] && void uploadPackage(event.target.files[0])}
          />
        </div>
        {navigationStatus ? <p role="status" style={{ margin: 0, fontSize: "10px", color: "var(--builder-ui-muted)" }}>{navigationStatus}</p> : null}
        {portablePreview ? (
          <div style={{ display: "grid", gap: "6px", padding: "8px", border: "1px solid var(--builder-ui-border)", borderRadius: "5px" }}>
            <strong style={{ fontSize: "11px" }}>{portablePreview.package.menu.name}</strong>
            <span style={{ fontSize: "10px" }}>
              {portablePreview.package.menu.intendedLocation ?? "Unassigned location"} · {portablePreview.package.menu.items.length} items · {portablePreview.portableCount} portable · {portablePreview.resolvedCount} WordPress-resolved · {portablePreview.unresolvedCount} unresolved
            </span>
            {portablePreview.resolutions.filter((item) => item.status === "unresolved").map((item) => (
              <div key={item.key} style={{ display: "grid", gap: "4px" }}>
                <span style={{ fontSize: "10px", color: "#b45309" }}>{item.message}</span>
                {wordpressSiteUrl ? <div style={{ display: "flex", gap: "4px" }}>
                  <input
                    type="text"
                    aria-label={`Map ${item.target.taxonomy ?? item.target.postType ?? item.target.kind} target`}
                    value={mappingSlugs[item.key] ?? ""}
                    onChange={(event) => setMappingSlugs((current) => ({ ...current, [item.key]: event.target.value }))}
                    placeholder="Existing target slug"
                    style={{ minWidth: 0, flex: 1, fontSize: "10px" }}
                  />
                  <button type="button" className="builder-secondary-button" disabled={navigationBusy} onClick={() => void resolveExplicitMapping(item.key)}>
                    Map
                  </button>
                </div> : null}
              </div>
            ))}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              <button
                type="button"
                className="builder-secondary-button"
                onClick={installAsNamedMenu}
              >
                Install as new WebPages menu
              </button>
              <button type="button" className="builder-secondary-button" onClick={replaceSelectedMenu}>
                Replace selected menu…
              </button>
            </div>
            <p style={{ margin: 0, fontSize: "10px", color: "var(--builder-ui-muted)" }}>
              Installation writes only to the canonical WebPages menu system. WordPress targets that cannot be resolved retain their portable URI and structured descriptor.
            </p>
          </div>
        ) : null}
      </div>
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
                  {node.depth === 0 && <button type="button" className="builder-btn" aria-label={`Open ${node.label} dropdown builder`} onClick={() => setBuilderItemId(node.id)}>Builder</button>}
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
                        onChange={(e) => handleUpdateItem(node.id, { url: e.target.value, navigationTarget: undefined })}
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

                    <fieldset style={{ display: "grid", gap: "8px", border: "1px solid var(--builder-ui-border)", borderRadius: "5px", padding: "8px" }}>
                      <legend style={{ padding: "0 4px", fontSize: "10px", color: "var(--builder-ui-muted)" }}>Menu Presentation</legend>
                      <label className="builder-field">
                        <span>Badge text</span>
                        <input
                          type="text"
                          value={menuPresentation[node.id]?.badgeText ?? ""}
                          onChange={(event) => handleUpdatePresentation(node.id, { badgeText: event.target.value.trim() || null })}
                          onKeyDown={(event) => event.stopPropagation()}
                          placeholder="Optional badge"
                        />
                      </label>
                      <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px" }}>
                        <input
                          type="checkbox"
                          checked={menuPresentation[node.id]?.mobileAccordion !== false}
                          onChange={(event) => handleUpdatePresentation(node.id, { mobileAccordion: event.target.checked })}
                        />
                        Mobile accordion
                      </label>
                    </fieldset>
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
            Click &quot;Add Item&quot; to start building your menu.
          </p>
        </div>
      )}
    </div>
  );
}
