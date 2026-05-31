"use client";

import {
  ChevronLeft,
  ExternalLink,
  LibraryBig,
  MonitorSmartphone,
  Plus,
  Save,
  Trash2,
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
  PreviewDevice,
  SidebarTab,
} from "@/components/dashboard/builderTypes";
import ElementLibrary from "@/components/dashboard/ElementLibrary";
import MenuPresentationPanel from "@/components/dashboard/MenuPresentationPanel";

type DashboardSidebarProps = {
  availableLayoutBlockKinds: LayoutBlockKind[];
  builderState: BuilderState;
  customPages: BuilderCustomPage[];
  device: PreviewDevice;
  filteredMenuIcons: readonly { name: string; label: string; keywords: string }[];
  getMenuIconLabel: (icon: string | null) => string;
  menuIconPickerOpen: boolean;
  menuIconSearch: string;
  menuTree: MenuItem[];
  newPageTitle: string;
  globalStylesSlot: ReactNode;
  inspectorSlot: ReactNode;
  normalizeMenuPresentation: (value?: Partial<MenuPresentationSettings> | null) => MenuPresentationSettings;
  pageStatus: string;
  publishStatus: string;
  renderUIKitIcon: (icon: string | null, size?: number) => ReactNode;
  resolveUIKitIconName: (icon: string | null) => string | null;
  selectedMenuItem: MenuItem | null;
  selectedMenuItemId: string | null;
  selectedLayoutBlockKey: string | null;
  shellSettings: { menuPresentation?: Record<string, MenuPresentationSettings> };
  sidebarTab: SidebarTab;
  savedTemplates: BuilderSavedTemplate[];
  templateDescriptions: Record<BuilderTemplate, string>;
  templateLabels: Record<BuilderTemplate, string>;
  templateStatus: string;
  updateMenuPresentation: (itemId: string, patch: Partial<MenuPresentationSettings>) => void;
  topActionsSlot?: ReactNode;
  onAddElementFromLibrary: (kind: LayoutBlockKind) => void;
  onCreateBuilderPage: () => void;
  onDeleteBuilderPage: (key: BuilderCustomPage["key"]) => void;
  onDeleteSavedTemplate: (id: string) => void;
  onOpenCurrentPage: () => void;
  onRenderLayoutBlockIcon: (kind: LayoutBlockKind) => ReactNode;
  onSaveCurrentPageAsTemplate: () => void;
  onSetDevice: Dispatch<SetStateAction<PreviewDevice>>;
  onSetMenuIconPickerOpen: Dispatch<SetStateAction<boolean>>;
  onSetMenuIconSearch: Dispatch<SetStateAction<string>>;
  onSetNewPageTitle: Dispatch<SetStateAction<string>>;
  onSetSelectedMenuItemId: Dispatch<SetStateAction<string | null>>;
  onSetSidebarTab: Dispatch<SetStateAction<SidebarTab>>;
  onStartSidebarResize: (clientX: number) => void;
  onSwitchBuilderTarget: (nextKey: BuilderLayoutKey) => void;
  openElementsPanelKey: number;
};

export default function DashboardSidebar({
  availableLayoutBlockKinds,
  builderState,
  customPages,
  device,
  filteredMenuIcons,
  getMenuIconLabel,
  menuIconPickerOpen,
  menuIconSearch,
  menuTree,
  newPageTitle,
  globalStylesSlot,
  inspectorSlot,
  normalizeMenuPresentation,
  pageStatus,
  publishStatus,
  renderUIKitIcon,
  resolveUIKitIconName,
  selectedMenuItem,
  selectedMenuItemId,
  selectedLayoutBlockKey,
  shellSettings,
  sidebarTab,
  savedTemplates,
  templateDescriptions,
  templateLabels,
  templateStatus,
  topActionsSlot,
  updateMenuPresentation,
  onAddElementFromLibrary,
  onCreateBuilderPage,
  onDeleteBuilderPage,
  onDeleteSavedTemplate,
  onOpenCurrentPage,
  onRenderLayoutBlockIcon,
  onSaveCurrentPageAsTemplate,
  onSetDevice,
  onSetMenuIconPickerOpen,
  onSetMenuIconSearch,
  onSetNewPageTitle,
  onSetSelectedMenuItemId,
  onSetSidebarTab,
  onStartSidebarResize,
  onSwitchBuilderTarget,
  openElementsPanelKey,
}: DashboardSidebarProps) {
  const [nestedOpen, setNestedOpen] = useState(false);

  useEffect(() => {
    if (sidebarTab !== "inspector") return;
    const frame = window.requestAnimationFrame(() => setNestedOpen(true));
    return () => window.cancelAnimationFrame(frame);
  }, [selectedLayoutBlockKey, sidebarTab]);

  useEffect(() => {
    if (openElementsPanelKey === 0) return;
    onSetSidebarTab("elements");
    const frame = window.requestAnimationFrame(() => setNestedOpen(true));
    return () => window.cancelAnimationFrame(frame);
  }, [openElementsPanelKey]);

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
    {
      tab: "settings",
      label: "Settings",
      description: "Preview, target, and global layout controls.",
    },
  ];

  const activePanel =
    sidebarPanels.find((panel) => panel.tab === sidebarTab) ?? sidebarPanels[0];

  const openPanel = (tab: SidebarTab) => {
    onSetSidebarTab(tab);
    setNestedOpen(true);
  };

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

        {nestedOpen && sidebarTab === "inspector" && inspectorSlot}

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
              <div><strong>Templates</strong><span>Save reusable page starting points</span></div>
              <small>{savedTemplates.length}</small>
            </div>
            <div className="builder-card builder-pages-card">
              <div className="builder-card-title"><strong>Open Page</strong><span>{builderState.page}</span></div>
              <button type="button" className="builder-secondary-button builder-full-button" onClick={onSaveCurrentPageAsTemplate}>
                <Save size={16} />
                Save open page as template
              </button>
              <small>{templateStatus}</small>
            </div>
            {savedTemplates.length > 0 ? (
              <div className="builder-pages-list">
                {savedTemplates.map((template) => (
                  <div key={template.id} className="builder-page-row">
                    <button type="button" disabled>
                      <strong>{template.title}</strong>
                      <span>{template.sourcePage ?? "template"} · {new Date(template.updatedAt).toLocaleDateString()}</span>
                    </button>
                    <button type="button" className="builder-icon-button" onClick={() => onDeleteSavedTemplate(template.id)} aria-label={`Delete ${template.title}`}><Trash2 size={14} /></button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="builder-template-note">
                <LibraryBig size={16} />
                <span>Saved templates will appear here after you save the current builder page.</span>
              </div>
            )}
          </div>
        )}

        {nestedOpen && sidebarTab === "settings" && (
          <div className="builder-sidebar-panel">
            <div className="builder-sidebar-panel-header">
              <div><strong>Settings</strong><span>Layout, preview, and publishing controls</span></div>
              <small>{publishStatus}</small>
            </div>
            <div className="builder-sidebar-controls">
              <button
                type="button"
                className="builder-secondary-button builder-full-button"
                onClick={onOpenCurrentPage}
              >
                <ExternalLink size={16} />
                Open Page
              </button>
              <div className="builder-device-toggle" aria-label="Preview device">
                {(["desktop", "tablet", "mobile"] as PreviewDevice[]).map((item) => (
                  <button key={item} type="button" className={device === item ? "is-active" : ""} onClick={() => onSetDevice(item)} title={`${item} preview`}>
                    <MonitorSmartphone size={16} />
                  </button>
                ))}
              </div>
            </div>
            <div className="builder-target-toggle" aria-label="Builder target type">
              {(["page", "template"] as BuilderTargetType[]).map((targetType) => (
                <button key={targetType} type="button" className={(builderState.targetType ?? "page") === targetType ? "is-active" : ""} onClick={() => onSwitchBuilderTarget(targetType === "page" ? "shop" : "product-single")}>
                  {targetType === "page" ? "Pages" : "Templates"}
                </button>
              ))}
            </div>
            {(builderState.targetType ?? "page") === "template" && (
              <label className="builder-field">
                <span>Editing Template</span>
                <select value={builderState.page} onChange={(event) => onSwitchBuilderTarget(event.target.value as BuilderLayoutKey)}>
                  {Object.entries(templateLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
              </label>
            )}
            {(builderState.targetType ?? "page") === "template" && builderState.template && (
              <div className="builder-template-note">
                <strong>{templateLabels[builderState.template]}</strong>
                <span>{templateDescriptions[builderState.template]}</span>
              </div>
            )}
            <small className="builder-sidebar-status">{publishStatus}</small>
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
