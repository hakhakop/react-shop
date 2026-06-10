"use client";

import {
  ChevronLeft,
  ExternalLink,
  LibraryBig,
  Pencil,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";
import {
  useEffect,
  useState,
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
} from "@/components/dashboard/builderTypes";
import ElementLibrary from "@/components/dashboard/ElementLibrary";
import MenuPresentationPanel from "@/components/dashboard/MenuPresentationPanel";

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

type DashboardSidebarProps = {
  availableLayoutBlockKinds: LayoutBlockKind[];
  builderState: BuilderState;
  customPages: BuilderCustomPage[];
  filteredMenuIcons: readonly { name: string; label: string; keywords: string }[];
  getMenuIconLabel: (icon: string | null) => string;
  menuIconPickerOpen: boolean;
  menuIconSearch: string;
  menuTree: MenuItem[];
  newPageTitle: string;
  globalStylesSlot: ReactNode;
  inspectorSlot: ReactNode;
  inspectorOpen?: boolean;
  inspectorOpenKey?: number;
  normalizeMenuPresentation: (value?: Partial<MenuPresentationSettings> | null) => MenuPresentationSettings;
  pageStatus: string;
  renderUIKitIcon: (icon: string | null, size?: number) => ReactNode;
  resolveUIKitIconName: (icon: string | null) => string | null;
  selectedMenuItem: MenuItem | null;
  selectedMenuItemId: string | null;
  selectedSectionTitle?: string | null;
  selectedElementLabel?: string | null;
  shellSettings: { menuPresentation?: Record<string, MenuPresentationSettings> };
  sidebarTab: SidebarTab;
  savedTemplates: BuilderSavedTemplate[];
  renameTemplateRequest?: {
    id: string;
    templateType: NonNullable<BuilderSavedTemplate["templateType"]>;
  } | null;
  templateDescriptions: Record<BuilderTemplate, string>;
  templateLabels: Record<BuilderTemplate, string>;
  templateStatus: string;
  updateMenuPresentation: (itemId: string, patch: Partial<MenuPresentationSettings>) => void;
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
  onSetMenuIconPickerOpen: Dispatch<SetStateAction<boolean>>;
  onSetMenuIconSearch: Dispatch<SetStateAction<string>>;
  onSetNewPageTitle: Dispatch<SetStateAction<string>>;
  onSetSelectedMenuItemId: Dispatch<SetStateAction<string | null>>;
  onSetSidebarTab: Dispatch<SetStateAction<SidebarTab>>;
  onOpenInspector?: () => void;
  onStartSidebarResize: (clientX: number) => void;
  onSwitchBuilderTarget: (nextKey: BuilderLayoutKey) => void;
  openElementsPanelKey: number;
};

export default function DashboardSidebar({
  availableLayoutBlockKinds,
  builderState,
  customPages,
  filteredMenuIcons,
  getMenuIconLabel,
  menuIconPickerOpen,
  menuIconSearch,
  menuTree,
  newPageTitle,
  globalStylesSlot,
  inspectorSlot,
  inspectorOpen = true,
  inspectorOpenKey = 0,
  normalizeMenuPresentation,
  pageStatus,
  renderUIKitIcon,
  resolveUIKitIconName,
  selectedMenuItem,
  selectedMenuItemId,
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
  updateMenuPresentation,
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
  onSetMenuIconPickerOpen,
  onSetMenuIconSearch,
  onSetNewPageTitle,
  onSetSelectedMenuItemId,
  onSetSidebarTab,
  onOpenInspector = () => undefined,
  onStartSidebarResize,
  onSwitchBuilderTarget,
  openElementsPanelKey,
}: DashboardSidebarProps) {
  const [nestedOpen, setNestedOpen] = useState(false);
  const [templateDraftTitle, setTemplateDraftTitle] = useState("");
  const [templateLibraryTab, setTemplateLibraryTab] =
    useState<TemplateLibraryTab>("section");
  const [renamingTemplateId, setRenamingTemplateId] = useState<string | null>(null);
  const [renamingTemplateTitle, setRenamingTemplateTitle] = useState("");

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
      description: "Tune WordPress menu presentation.",
      count: menuTree.length,
    },
    {
      tab: "pages",
      label: "Pages",
      description: "Create and switch editable builder pages.",
      count: customPages.length,
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

  return (
    <aside className="builder-sidebar builder-panel">
      {topActionsSlot ? (
        <div className="builder-sidebar-top-actions">{topActionsSlot}</div>
      ) : null}

      {!nestedOpen ? (
        <div className="builder-sidebar-home" aria-label="Builder menu">
          {sidebarPanels.map((panel) => (
            <button
              key={panel.tab}
              type="button"
              className={sidebarTab === panel.tab ? "is-active" : ""}
              onClick={() => openPanel(panel.tab)}
            >
              <span>
                <strong>{panel.label}</strong>
                <small>{panel.description}</small>
              </span>
              {typeof panel.count === "number" ? <em>{panel.count}</em> : null}
            </button>
          ))}
        </div>
      ) : (
        <div className="builder-sidebar-nested-header">
          <button
            type="button"
            className="builder-icon-button"
            onClick={() => setNestedOpen(false)}
            aria-label="Back to builder menu"
            title="Back to builder menu"
          >
            <ChevronLeft size={16} />
          </button>
          <div>
            <strong>{activePanel.label}</strong>
            <span>{activePanel.description}</span>
          </div>
          {typeof activePanel.count === "number" ? (
            <small>{activePanel.count}</small>
          ) : null}
        </div>
      )}

      <div className={`builder-sidebar-content${nestedOpen ? "" : " is-menu-screen"}`}>
        {!nestedOpen && (
          <div className="builder-sidebar-menu-hint">
            <LibraryBig size={16} />
            <span>Choose a panel above. Element settings and inspector controls open one level deeper.</span>
          </div>
        )}

        {nestedOpen && sidebarTab === "elements" && (
          <ElementLibrary
            availableLayoutBlockKinds={availableLayoutBlockKinds}
            onAddElement={onAddElementFromLibrary}
            onRenderLayoutBlockIcon={onRenderLayoutBlockIcon}
          />
        )}

        {nestedOpen && sidebarTab === "menu" && (
          <MenuPresentationPanel
            filteredMenuIcons={filteredMenuIcons}
            getMenuIconLabel={getMenuIconLabel}
            menuIconPickerOpen={menuIconPickerOpen}
            menuIconSearch={menuIconSearch}
            menuTree={menuTree}
            normalizeMenuPresentation={normalizeMenuPresentation}
            renderUIKitIcon={renderUIKitIcon}
            resolveUIKitIconName={resolveUIKitIconName}
            selectedMenuItem={selectedMenuItem}
            selectedMenuItemId={selectedMenuItemId}
            shellSettings={shellSettings}
            updateMenuPresentation={updateMenuPresentation}
            onSetMenuIconPickerOpen={onSetMenuIconPickerOpen}
            onSetMenuIconSearch={onSetMenuIconSearch}
            onSetSelectedMenuItemId={onSetSelectedMenuItemId}
          />
        )}

        {nestedOpen && sidebarTab === "inspector" && (
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

        {nestedOpen && sidebarTab === "globalStyles" && globalStylesSlot}

        {nestedOpen && sidebarTab === "pages" && (
          <div className="builder-sidebar-panel">
            <div className="builder-sidebar-panel-header">
              <div><strong>Builder Pages</strong><span>Create and switch between editable pages</span></div>
              <small>{customPages.length}</small>
            </div>
            <div className="builder-card builder-pages-card">
              <div className="builder-card-title"><strong>Pages</strong><span>{customPages.length}</span></div>
              <div className="builder-page-create">
                <input type="text" value={newPageTitle} onChange={(event) => onSetNewPageTitle(event.target.value)} placeholder="Page title" />
                <button type="button" className="builder-icon-button" onClick={onCreateBuilderPage} aria-label="Create builder page"><Plus size={15} /></button>
              </div>
              {customPages.length > 0 && (
                <div className="builder-pages-list">
                  {customPages.map((page) => (
                    <div key={page.key} className={`builder-page-row${builderState.page === page.key ? " is-active" : ""}`}>
                      <button type="button" onClick={() => onSwitchBuilderTarget(page.key)}><strong>{page.title}</strong><span>/{page.slug}</span></button>
                      <button type="button" className="builder-icon-button" onClick={() => onDeleteBuilderPage(page.key)} aria-label={`Delete ${page.title}`}><Trash2 size={14} /></button>
                    </div>
                  ))}
                </div>
              )}
              <small>{pageStatus}</small>
            </div>
          </div>
        )}

        {nestedOpen && sidebarTab === "templates" && (
          <div className="builder-sidebar-panel">
            <div className="builder-sidebar-panel-header">
              <div><strong>Templates</strong><span>Save and reuse pages, sections, and elements</span></div>
              <small>{savedTemplates.length}</small>
            </div>

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
