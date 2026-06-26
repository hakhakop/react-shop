"use client";

import {
  ChevronLeft,
  ExternalLink,
  GripVertical,
  LibraryBig,
  Pencil,
  Plus,
  Save,
  Trash2,
  X,
  Layers3,
  Boxes,
  LayoutTemplate,
  Sliders,
  FileText,
  History,
  Settings,
  Menu,
} from "lucide-react";
import {
  useEffect,
  useState,
  useMemo,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import type { MenuItem } from "@/lib/navigation";
import type {
  BuilderCustomPage,
  BuilderLayoutKey,
  BuilderSavedTemplate,
  BuilderState,
  BuilderTargetType,
  BuilderTemplate,
  LayoutBlockKind,
  MenuPresentationSettings,
  SidebarTab,
  BuilderShellSettings,
} from "@/components/dashboard/builderTypes";
import ElementLibrary from "@/components/dashboard/ElementLibrary";
import ReactMenuEditorPanel from "@/components/dashboard/ReactMenuEditorPanel";

type TemplateLibraryTab = "page" | "section" | "row" | "element";

const BUILDER_TEMPLATE_DND_TYPE = "application/x-builder-template";
const BUILDER_TEMPLATE_DND_TYPES: Record<Exclude<TemplateLibraryTab, "page">, string> = {
  section: "application/x-builder-template-section",
  row: "application/x-builder-template-row",
  element: "application/x-builder-template-element",
};

const templateLibraryTabs: { value: TemplateLibraryTab; label: string }[] = [
  { value: "page", label: "Pages" },
  { value: "section", label: "Sections" },
  { value: "row", label: "Rows" },
  { value: "element", label: "Elements" },
];

const corePages = [
  { key: "home", title: "Home", slug: "" },
  { key: "shop", title: "Shop", slug: "shop" },
  { key: "client", title: "Client Page", slug: "client" },
  { key: "page:cart", title: "Cart", slug: "cart" },
  { key: "page:checkout", title: "Checkout", slug: "checkout" },
  { key: "page:my-account", title: "My Account", slug: "my-account" },
] as const;

type DashboardSidebarProps = {
  availableLayoutBlockKinds: LayoutBlockKind[];
  builderState: BuilderState;
  customPages: BuilderCustomPage[];
  publishedKeys: string[];
  newPageTitle: string;
  builderSlot: ReactNode;
  globalStylesSlot: ReactNode;
  inspectorSlot: ReactNode;
  inspectorOpen?: boolean;
  inspectorOpenKey?: number;
  pageStatus: string;
  selectedSectionTitle?: string | null;
  selectedElementLabel?: string | null;
  shellSettings: BuilderShellSettings;
  sidebarTab: SidebarTab;
  savedTemplates: BuilderSavedTemplate[];
  renameTemplateRequest?: {
    id: string;
    templateType: NonNullable<BuilderSavedTemplate["templateType"]>;
  } | null;
  templateDescriptions: Record<BuilderTemplate, string>;
  templateLabels: Record<BuilderTemplate, string>;
  templateStatus: string;
  onUpdateShellSettings: (patch: Partial<BuilderShellSettings>) => void;
  topActionsSlot?: ReactNode;
  onAddElementFromLibrary: (kind: LayoutBlockKind) => void;
  onCreateBuilderPage: () => void;
  onDeleteBuilderPage: (key: BuilderCustomPage["key"]) => void;
  onDeleteSavedTemplate: (id: string) => void;
  onRenderLayoutBlockIcon: (kind: LayoutBlockKind) => ReactNode;
  onSaveCurrentPageAsTemplate: (title?: string) => void | Promise<unknown>;
  onSaveSelectedSectionAsTemplate?: (title?: string) => void | Promise<unknown>;
  onSaveSelectedElementAsTemplate?: (title?: string) => void | Promise<unknown>;
  onApplySavedTemplate?: (template: BuilderSavedTemplate) => void;
  onRenameSavedTemplate?: (template: BuilderSavedTemplate, title: string) => void;
  onSetNewPageTitle: Dispatch<SetStateAction<string>>;
  onSetSidebarTab: Dispatch<SetStateAction<SidebarTab>>;
  onOpenInspector?: () => void;
  onStartSidebarResize: (clientX: number) => void;
  onSwitchBuilderTarget: (nextKey: BuilderLayoutKey) => void;
  onReorderCustomPages?: (newPages: BuilderCustomPage[]) => void;
  openElementsPanelKey: number;
  sidebarCollapsed?: boolean;
  onSetSidebarCollapsed?: (collapsed: boolean) => void;
};

export default function DashboardSidebar({
  availableLayoutBlockKinds,
  builderState,
  customPages,
  publishedKeys,
  newPageTitle,
  builderSlot,
  globalStylesSlot,
  inspectorSlot,
  inspectorOpen = true,
  inspectorOpenKey = 0,
  pageStatus,
  selectedSectionTitle,
  selectedElementLabel,
  shellSettings,
  sidebarTab,
  savedTemplates,
  renameTemplateRequest,
  templateDescriptions,
  templateLabels,
  templateStatus,
  topActionsSlot,
  onAddElementFromLibrary,
  onCreateBuilderPage,
  onDeleteBuilderPage,
  onDeleteSavedTemplate,
  onRenderLayoutBlockIcon,
  onSaveCurrentPageAsTemplate,
  onSaveSelectedSectionAsTemplate = () => undefined,
  onSaveSelectedElementAsTemplate = () => undefined,
  onApplySavedTemplate = () => undefined,
  onRenameSavedTemplate = () => undefined,
  onSetNewPageTitle,
  onSetSidebarTab,
  onOpenInspector = () => undefined,
  onStartSidebarResize,
  onSwitchBuilderTarget,
  openElementsPanelKey,
  onUpdateShellSettings,
  onReorderCustomPages,
  sidebarCollapsed = true,
  onSetSidebarCollapsed,
}: DashboardSidebarProps) {
  const [nestedOpen, setNestedOpen] = useState(false);
  const [templateDraftTitle, setTemplateDraftTitle] = useState("");
  const [templateLibraryTab, setTemplateLibraryTab] =
    useState<TemplateLibraryTab>("section");
  const [renamingTemplateId, setRenamingTemplateId] = useState<string | null>(null);
  const [renamingTemplateTitle, setRenamingTemplateTitle] = useState("");

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

  useEffect(() => {
    if (inspectorOpenKey === 0 || sidebarTab !== "inspector" || !inspectorOpen) {
      return;
    }
    const frame = window.requestAnimationFrame(() => setNestedOpen(true));
    return () => window.cancelAnimationFrame(frame);
  }, [inspectorOpenKey, inspectorOpen, sidebarTab]);

  useEffect(() => {
    if (openElementsPanelKey === 0) return;
    onSetSidebarTab("elements");
    const frame = window.requestAnimationFrame(() => setNestedOpen(true));
    return () => window.cancelAnimationFrame(frame);
  }, [openElementsPanelKey]);

  useEffect(() => {
    if (!renameTemplateRequest) return;
    const template = savedTemplates.find(
      (item) => item.id === renameTemplateRequest.id,
    );
    if (!template) return;
    setNestedOpen(true);
    setTemplateLibraryTab(renameTemplateRequest.templateType);
    setRenamingTemplateId(template.id);
    setRenamingTemplateTitle(template.title);
  }, [renameTemplateRequest, savedTemplates]);

  const sidebarPanels: {
    tab: SidebarTab;
    label: string;
    description: string;
    count?: number;
  }[] = [
    {
      tab: "builder",
      label: "Builder",
      description: "Navigate the page wireframe tree.",
      count: builderState.sections.length,
    },
    {
      tab: "elements",
      label: "Elements",
      description: "Add blocks to the selected layout column.",
      count: availableLayoutBlockKinds.length,
    },
    {
      tab: "inspector",
      label: "Inspector",
      description: "Edit the selected section, column, or element.",
    },
    {
      tab: "globalStyles",
      label: "Global Styles",
      description: "Site design, typography, header, and spacing.",
    },
    {
      tab: "menu",
      label: "Menu",
      description: "Manage React menu items.",
      count: shellSettings.menuItems?.length ?? 0,
    },
    {
      tab: "pages",
      label: "Pages",
      description: "Create and switch editable builder pages.",
      count: corePages.length + customPages.length,
    },
    {
      tab: "templates",
      label: "Templates",
      description: "Save reusable page starting points.",
      count: savedTemplates.length,
    },

  ];

  const activePanel =
    sidebarPanels.find((panel) => panel.tab === sidebarTab) ?? sidebarPanels[0];

  const openPanel = (tab: SidebarTab) => {
    if (tab === "inspector") onOpenInspector();
    onSetSidebarTab(tab);
    setNestedOpen(true);
  };
  const templateTitleValue = templateDraftTitle.trim();
  const saveTemplateAndClear = (kind: "page" | "section" | "element") => {
    const nextTitle =
      templateTitleValue ||
      (kind === "page"
        ? builderState.page
        : kind === "section"
          ? selectedSectionTitle || "Saved Section"
          : selectedElementLabel || "Saved Element");

    if (kind === "page") onSaveCurrentPageAsTemplate(nextTitle);
    if (kind === "section") onSaveSelectedSectionAsTemplate(nextTitle);
    if (kind === "element") onSaveSelectedElementAsTemplate(nextTitle);

    setTemplateDraftTitle("");
  };
  const filteredTemplates = savedTemplates.filter(
    (template) => (template.templateType ?? "page") === templateLibraryTab,
  );
  const selectedTemplateTabLabel =
    templateLibraryTabs.find((tab) => tab.value === templateLibraryTab)?.label ??
    "Templates";

  const leftNavTabs = [
    { tab: "builder" as SidebarTab, label: "Structure", icon: <Layers3 size={18} /> },
    { tab: "elements" as SidebarTab, label: "Blocks", icon: <Boxes size={18} /> },
    { tab: "templates" as SidebarTab, label: "Layouts", icon: <LayoutTemplate size={18} /> },
    { tab: "globalStyles" as SidebarTab, label: "Global", icon: <Sliders size={18} /> },
    { tab: "pages" as SidebarTab, label: "Pages", icon: <FileText size={18} /> },
    { tab: "history" as SidebarTab, label: "History", icon: <History size={18} /> },
    { tab: "inspector" as SidebarTab, label: "Inspector", icon: <Settings size={18} /> },
    { tab: "menu" as SidebarTab, label: "Menu", icon: <Menu size={18} /> },
  ];

  return (
    <aside className="builder-sidebar builder-panel">
      {/* Persistent narrow left nav */}
      <div className="builder-sidebar-left-nav">
        <div className="builder-sidebar-logo">
          BUILDER
        </div>
        <div className="builder-sidebar-nav-tiles">
          {leftNavTabs.map((item) => {
            const isActive = sidebarTab === item.tab && !sidebarCollapsed;
            return (
              <button
                key={item.tab}
                type="button"
                className={`builder-sidebar-nav-tile${isActive ? " is-active" : ""}`}
                onClick={() => {
                  if (sidebarCollapsed) {
                    if (item.tab === "inspector") onOpenInspector();
                    onSetSidebarTab(item.tab);
                    onSetSidebarCollapsed?.(false);
                  } else if (sidebarTab === item.tab) {
                    onSetSidebarCollapsed?.(true);
                  } else {
                    if (item.tab === "inspector") onOpenInspector();
                    onSetSidebarTab(item.tab);
                  }
                }}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
        <button
          type="button"
          className={`builder-sidebar-rail-toggle${
            sidebarCollapsed ? " is-collapsed" : ""
          }`}
          onClick={() => onSetSidebarCollapsed?.(!sidebarCollapsed)}
          title={sidebarCollapsed ? "Open panel" : "Collapse panel"}
          aria-label={sidebarCollapsed ? "Open panel" : "Collapse panel"}
        >
          <ChevronLeft size={18} />
          <span>{sidebarCollapsed ? "Open" : "Close"}</span>
        </button>
      </div>

      {/* Right content panel container */}
      <div className="builder-sidebar-panel-container">
        {topActionsSlot ? (
          <div className="builder-sidebar-top-actions">{topActionsSlot}</div>
        ) : null}

        <div className="builder-sidebar-content">
          {sidebarTab === "elements" && (
            <ElementLibrary
              availableLayoutBlockKinds={availableLayoutBlockKinds}
              onAddElement={onAddElementFromLibrary}
              onRenderLayoutBlockIcon={onRenderLayoutBlockIcon}
            />
          )}

          {sidebarTab === "builder" && builderSlot}

          {sidebarTab === "menu" && (
            <ReactMenuEditorPanel
              menuItems={shellSettings.menuItems ?? []}
              onChangeMenuItems={(newItems) => onUpdateShellSettings({ menuItems: newItems })}
              customPages={customPages}
            />
          )}

          {sidebarTab === "inspector" && (
            inspectorOpen ? (
              inspectorSlot
            ) : (
              <div className="builder-sidebar-panel builder-inspector-reopen">
                <div className="builder-sidebar-panel-header">
                  <div>
                    <strong>Inspector</strong>
                    <span>Section, row, and element controls are closed.</span>
                  </div>
                </div>
                <button
                  type="button"
                  className="builder-secondary-button builder-full-button"
                  onClick={onOpenInspector}
                >
                  Open Inspector
                </button>
              </div>
            )
          )}

          {sidebarTab === "globalStyles" && globalStylesSlot}

          {sidebarTab === "pages" && (
            <div className="builder-sidebar-panel">
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
          )}

          {sidebarTab === "history" && (
            <div className="builder-sidebar-panel">
              <div className="builder-card">
                <div className="builder-card-title">
                  <strong>History</strong>
                </div>
                <div style={{ padding: "12px 4px", fontSize: "12px", color: "var(--builder-ui-muted)" }}>
                  Version history and restore points will appear here.
                </div>
              </div>
            </div>
          )}

          {sidebarTab === "templates" && (
            <div className="builder-sidebar-panel">
              <div className="builder-card builder-pages-card" style={{ marginBottom: '14px' }}>
                <div className="builder-card-title"><strong>Global Layout Target</strong></div>
                <div className="builder-target-toggle" aria-label="Builder target type">
                  {(["page", "template"] as BuilderTargetType[]).map((targetType) => (
                    <button key={targetType} type="button" className={(builderState.targetType ?? "page") === targetType ? "is-active" : ""} onClick={() => onSwitchBuilderTarget(targetType === "page" ? "shop" : "product-single")}>
                      {targetType === "page" ? "Custom Pages" : "Global Templates"}
                    </button>
                  ))}
                </div>
                {(builderState.targetType ?? "page") === "template" && (
                  <label className="builder-field" style={{ marginTop: '12px' }}>
                    <span>Editing Template</span>
                    <select value={builderState.page} onChange={(event) => onSwitchBuilderTarget(event.target.value as BuilderLayoutKey)}>
                      {Object.entries(templateLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                    </select>
                  </label>
                )}
                {(builderState.targetType ?? "page") === "template" && builderState.template && (
                  <div className="builder-template-note" style={{ marginTop: '8px' }}>
                    <strong>{templateLabels[builderState.template]}</strong>
                    <span>{templateDescriptions[builderState.template]}</span>
                  </div>
                )}
              </div>

              <div className="builder-card builder-pages-card">
                <div className="builder-card-title"><strong>Save Reusable Template</strong><span>{builderState.page}</span></div>
                <label className="builder-field">
                  <span>Template name</span>
                  <input
                    type="text"
                    value={templateDraftTitle}
                    onChange={(event) => setTemplateDraftTitle(event.target.value)}
                    placeholder="Optional custom name"
                  />
                </label>
                <div className="builder-template-save-list">
                  <button type="button" className="builder-template-save-card" onClick={() => saveTemplateAndClear("page")}>
                    <Save size={16} />
                    <span>
                      <strong>Save Current Page</strong>
                      <small>Reusable full-page layout</small>
                    </span>
                  </button>
                  <button
                    type="button"
                    className="builder-template-save-card"
                    onClick={() => saveTemplateAndClear("section")}
                    disabled={!selectedSectionTitle}
                    title={selectedSectionTitle ? `Save selected section: ${selectedSectionTitle}` : "Click a section in the preview first"}
                  >
                    <Save size={16} />
                    <span>
                      <strong>Save Selected Section</strong>
                      <small>{selectedSectionTitle ? selectedSectionTitle : "Click a section first"}</small>
                    </span>
                  </button>
                  <button
                    type="button"
                    className="builder-template-save-card"
                    onClick={() => saveTemplateAndClear("element")}
                    disabled={!selectedElementLabel}
                    title={selectedElementLabel ? `Save selected element: ${selectedElementLabel}` : "Click an element in the preview first"}
                  >
                    <Save size={16} />
                    <span>
                      <strong>Save Selected Element</strong>
                      <small>{selectedElementLabel ? selectedElementLabel : "Click an element first"}</small>
                    </span>
                  </button>
                </div>
                <small>{templateStatus}</small>
              </div>
              <div className="builder-template-tabs" role="tablist" aria-label="Template types">
                {templateLibraryTabs.map((tab) => {
                  const tabCount = savedTemplates.filter(
                    (template) => (template.templateType ?? "page") === tab.value,
                  ).length;
                  return (
                    <button
                      key={tab.value}
                      type="button"
                      role="tab"
                      aria-selected={templateLibraryTab === tab.value}
                      className={templateLibraryTab === tab.value ? "is-active" : ""}
                      onClick={() => {
                        setTemplateLibraryTab(tab.value);
                        setRenamingTemplateId(null);
                      }}
                    >
                      <span>{tab.label}</span>
                      <small>{tabCount}</small>
                    </button>
                  );
                })}
              </div>
              {filteredTemplates.length > 0 ? (
                <div className="builder-pages-list builder-template-list">
                  {filteredTemplates.map((template) => {
                    const templateType = template.templateType ?? "page";
                    const canDragTemplate = templateType !== "page";
                    const templateDragMimeType = canDragTemplate
                      ? BUILDER_TEMPLATE_DND_TYPES[
                          templateType as Exclude<TemplateLibraryTab, "page">
                        ]
                      : null;
                    return (
                    <div
                      key={template.id}
                      className="builder-page-row builder-template-row"
                      draggable={canDragTemplate && renamingTemplateId !== template.id}
                      onDragStart={(event) => {
                        if (!canDragTemplate || renamingTemplateId === template.id) {
                          event.preventDefault();
                          return;
                        }
                        event.dataTransfer.setData(
                          BUILDER_TEMPLATE_DND_TYPE,
                          template.id,
                        );
                        if (templateDragMimeType) {
                          event.dataTransfer.setData(templateDragMimeType, template.id);
                        }
                        event.dataTransfer.effectAllowed = "copy";
                      }}
                    >
                      {renamingTemplateId === template.id ? (
                        <>
                          <input
                            className="builder-template-rename-input"
                            value={renamingTemplateTitle}
                            onChange={(event) => setRenamingTemplateTitle(event.target.value)}
                            onKeyDown={(event) => {
                              if (event.key === "Enter") {
                                onRenameSavedTemplate(template, renamingTemplateTitle);
                                setRenamingTemplateId(null);
                              }
                              if (event.key === "Escape") {
                                setRenamingTemplateId(null);
                              }
                            }}
                            autoFocus
                          />
                          <button
                            type="button"
                            className="builder-icon-button"
                            onClick={() => {
                              onRenameSavedTemplate(template, renamingTemplateTitle);
                              setRenamingTemplateId(null);
                            }}
                            aria-label={`Save new name for ${template.title}`}
                          >
                            <Save size={14} />
                          </button>
                          <button
                            type="button"
                            className="builder-icon-button"
                            onClick={() => setRenamingTemplateId(null)}
                            aria-label="Cancel rename"
                          >
                            <X size={14} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button type="button" onClick={() => onApplySavedTemplate(template)}>
                            <strong>{template.title}</strong>
                            <span>
                              {templateType.toUpperCase()} · {template.sourcePage ?? "template"} · {new Date(template.updatedAt).toLocaleDateString()}
                            </span>
                          </button>
                          <button type="button" className="builder-template-use-button" onClick={() => onApplySavedTemplate(template)}>
                            <Plus size={14} />
                            Use
                          </button>
                          <button
                            type="button"
                            className="builder-icon-button"
                            onClick={() => {
                              setRenamingTemplateId(template.id);
                              setRenamingTemplateTitle(template.title);
                            }}
                            aria-label={`Rename ${template.title}`}
                          >
                            <Pencil size={14} />
                          </button>
                          <button type="button" className="builder-icon-button" onClick={() => onDeleteSavedTemplate(template.id)} aria-label={`Delete ${template.title}`}><Trash2 size={14} /></button>
                        </>
                      )}
                    </div>
                    );
                  })}
                </div>
              ) : (
                <div className="builder-template-note">
                  <LibraryBig size={16} />
                  <span>
                    {savedTemplates.length > 0
                      ? `No ${selectedTemplateTabLabel.toLowerCase()} templates saved yet.`
                      : "Saved templates will appear here after you save from a page, section, row, or element toolbar."}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <button
        type="button"
        className="builder-sidebar-resize-handle"
        onMouseDown={(event) => {
          event.preventDefault();
          onStartSidebarResize(event.clientX);
        }}
        aria-label="Resize dashboard panel"
        title="Resize panel"
      />
    </aside>
  );
}
