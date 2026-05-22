"use client";

import {
  MonitorSmartphone,
  PanelRightClose,
  PanelRightOpen,
  Plus,
  Settings2,
  Sparkles,
  Trash2,
} from "lucide-react";
import type { Dispatch, ReactNode, SetStateAction } from "react";
import type { MenuItem } from "@/lib/navigation";
import type {
  BuilderCustomPage,
  BuilderLayoutKey,
  BuilderState,
  BuilderTargetType,
  BuilderTemplate,
  LayoutBlockKind,
  MenuPresentationSettings,
  PreviewDevice,
  SidebarTab,
} from "@/components/dashboard/DashboardBuilder";
import ElementLibrary from "@/components/dashboard/ElementLibrary";
import MenuPresentationPanel from "@/components/dashboard/MenuPresentationPanel";

type DashboardSidebarProps = {
  availableLayoutBlockKinds: LayoutBlockKind[];
  builderState: BuilderState;
  customPages: BuilderCustomPage[];
  device: PreviewDevice;
  filteredMenuIcons: readonly { name: string; label: string; keywords: string }[];
  getMenuIconLabel: (icon: string | null) => string;
  globalStylesOpen: boolean;
  layoutBlockDescriptions: Record<LayoutBlockKind, string>;
  layoutBlockGroups: { id: string; label: string; kinds: LayoutBlockKind[] }[];
  layoutBlockLabels: Record<LayoutBlockKind, string>;
  menuIconPickerOpen: boolean;
  menuIconSearch: string;
  menuTree: MenuItem[];
  newPageTitle: string;
  normalizeMenuPresentation: (value?: Partial<MenuPresentationSettings> | null) => MenuPresentationSettings;
  pageStatus: string;
  publishStatus: string;
  renderUIKitIcon: (icon: string | null, size?: number) => ReactNode;
  resolveUIKitIconName: (icon: string | null) => string | null;
  selectedMenuItem: MenuItem | null;
  selectedMenuItemId: string | null;
  shellSettings: { menuPresentation?: Record<string, MenuPresentationSettings> };
  sidebarCollapsed: boolean;
  sidebarTab: SidebarTab;
  templateDescriptions: Record<BuilderTemplate, string>;
  templateLabels: Record<BuilderTemplate, string>;
  updateMenuPresentation: (itemId: string, patch: Partial<MenuPresentationSettings>) => void;
  onAddElementFromLibrary: (kind: LayoutBlockKind) => void;
  onCreateBuilderPage: () => void;
  onDeleteBuilderPage: (key: BuilderCustomPage["key"]) => void;
  onRenderLayoutBlockIcon: (kind: LayoutBlockKind) => ReactNode;
  onSetDevice: Dispatch<SetStateAction<PreviewDevice>>;
  onSetGlobalStylesOpen: Dispatch<SetStateAction<boolean>>;
  onSetMenuIconPickerOpen: Dispatch<SetStateAction<boolean>>;
  onSetMenuIconSearch: Dispatch<SetStateAction<string>>;
  onSetNewPageTitle: Dispatch<SetStateAction<string>>;
  onSetSelectedMenuItemId: Dispatch<SetStateAction<string | null>>;
  onSetSidebarCollapsed: Dispatch<SetStateAction<boolean>>;
  onSetSidebarTab: Dispatch<SetStateAction<SidebarTab>>;
  onSwitchBuilderTarget: (nextKey: BuilderLayoutKey) => void;
};

export default function DashboardSidebar({
  availableLayoutBlockKinds,
  builderState,
  customPages,
  device,
  filteredMenuIcons,
  getMenuIconLabel,
  globalStylesOpen,
  layoutBlockDescriptions,
  layoutBlockGroups,
  layoutBlockLabels,
  menuIconPickerOpen,
  menuIconSearch,
  menuTree,
  newPageTitle,
  normalizeMenuPresentation,
  pageStatus,
  publishStatus,
  renderUIKitIcon,
  resolveUIKitIconName,
  selectedMenuItem,
  selectedMenuItemId,
  shellSettings,
  sidebarCollapsed,
  sidebarTab,
  templateDescriptions,
  templateLabels,
  updateMenuPresentation,
  onAddElementFromLibrary,
  onCreateBuilderPage,
  onDeleteBuilderPage,
  onRenderLayoutBlockIcon,
  onSetDevice,
  onSetGlobalStylesOpen,
  onSetMenuIconPickerOpen,
  onSetMenuIconSearch,
  onSetNewPageTitle,
  onSetSelectedMenuItemId,
  onSetSidebarCollapsed,
  onSetSidebarTab,
  onSwitchBuilderTarget,
}: DashboardSidebarProps) {
  const renderSidebarTabButton = (
    tab: SidebarTab,
    label: string,
    count?: number,
  ) => (
    <button
      type="button"
      className={sidebarTab === tab ? "is-active" : ""}
      onClick={() => onSetSidebarTab(tab)}
    >
      {label}
      {typeof count === "number" ? <small>{count}</small> : null}
    </button>
  );

  return (
    <aside className="builder-sidebar builder-panel">
      <div className="builder-sidebar-top">
        <div className="builder-brand">
          <span className="builder-brand-icon"><Sparkles size={18} /></span>
          <span className="builder-brand-copy">
            <strong>Visual Builder</strong>
            <small>React storefront layouts</small>
          </span>
        </div>
        <button
          type="button"
          className="builder-sidebar-collapse-toggle builder-icon-button"
          onClick={() => onSetSidebarCollapsed((value) => !value)}
          aria-label={sidebarCollapsed ? "Open sidebar" : "Collapse sidebar"}
          title={sidebarCollapsed ? "Open sidebar" : "Collapse sidebar"}
        >
          {sidebarCollapsed ? <PanelRightOpen size={16} /> : <PanelRightClose size={16} />}
        </button>
      </div>

      <div className="builder-sidebar-tabs" role="tablist" aria-label="Sidebar panels">
        {renderSidebarTabButton("elements", "Elements", availableLayoutBlockKinds.length)}
        {renderSidebarTabButton("menu", "Menu", menuTree.length)}
        {renderSidebarTabButton("pages", "Pages", customPages.length)}
        {renderSidebarTabButton("settings", "Settings")}
      </div>

      <div className="builder-sidebar-content">
        {sidebarTab === "elements" && (
          <ElementLibrary
            availableLayoutBlockKinds={availableLayoutBlockKinds}
            layoutBlockDescriptions={layoutBlockDescriptions}
            layoutBlockGroups={layoutBlockGroups}
            layoutBlockLabels={layoutBlockLabels}
            onAddElement={onAddElementFromLibrary}
            onRenderLayoutBlockIcon={onRenderLayoutBlockIcon}
          />
        )}

        {sidebarTab === "menu" && (
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

        {sidebarTab === "pages" && (
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

        {sidebarTab === "settings" && (
          <div className="builder-sidebar-panel">
            <div className="builder-sidebar-panel-header">
              <div><strong>Settings</strong><span>Layout, preview, and publishing controls</span></div>
              <small>{publishStatus}</small>
            </div>
            <div className="builder-sidebar-controls">
              <button type="button" className={`builder-secondary-button builder-full-button builder-global-styles-button ${globalStylesOpen ? "is-active" : ""}`} onClick={() => onSetGlobalStylesOpen((value) => !value)}>
                <Settings2 size={16} />
                Global Styles
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
    </aside>
  );
}
