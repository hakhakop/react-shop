"use client";

import type { Dispatch, ReactNode, SetStateAction } from "react";
import type { MenuItem } from "@/lib/navigation";
import type { MenuPresentationSettings } from "@/components/dashboard/DashboardBuilder";

type MenuPresentationPanelProps = {
  filteredMenuIcons: readonly { name: string; label: string; keywords: string }[];
  getMenuIconLabel: (icon: string | null) => string;
  menuIconPickerOpen: boolean;
  menuIconSearch: string;
  menuTree: MenuItem[];
  normalizeMenuPresentation: (value?: Partial<MenuPresentationSettings> | null) => MenuPresentationSettings;
  renderUIKitIcon: (icon: string | null, size?: number) => ReactNode;
  resolveUIKitIconName: (icon: string | null) => string | null;
  selectedMenuItem: MenuItem | null;
  selectedMenuItemId: string | null;
  shellSettings: { menuPresentation?: Record<string, MenuPresentationSettings> };
  updateMenuPresentation: (itemId: string, patch: Partial<MenuPresentationSettings>) => void;
  onSetMenuIconPickerOpen: Dispatch<SetStateAction<boolean>>;
  onSetMenuIconSearch: Dispatch<SetStateAction<string>>;
  onSetSelectedMenuItemId: Dispatch<SetStateAction<string | null>>;
};

export default function MenuPresentationPanel({
  filteredMenuIcons,
  getMenuIconLabel,
  menuIconPickerOpen,
  menuIconSearch,
  menuTree,
  normalizeMenuPresentation,
  renderUIKitIcon,
  resolveUIKitIconName,
  selectedMenuItem,
  selectedMenuItemId,
  shellSettings,
  updateMenuPresentation,
  onSetMenuIconPickerOpen,
  onSetMenuIconSearch,
  onSetSelectedMenuItemId,
}: MenuPresentationPanelProps) {
  const renderMenuTreeRows = (items: MenuItem[], depth = 0): ReactNode =>
    items.map((item) => {
      const current = normalizeMenuPresentation(
        shellSettings.menuPresentation?.[item.id],
      );
      const children = item.children ?? [];
      const hasChildren = children.length > 0;
      const isSelected = selectedMenuItemId === item.id;
      const summaryParts = [
        current.showHeading ? "heading on" : "heading off",
        current.icon ? `icon: ${current.icon}` : "no icon",
        current.badgeText ? `badge: ${current.badgeText}` : "no badge",
        current.submenuLayout,
        current.submenuLayout === "list"
          ? null
          : `${current.submenuColumns} cols`,
      ].filter(Boolean);

      return (
        <div
          key={item.id}
          className={`builder-menu-row${isSelected ? " is-active" : ""}`}
          style={{ marginLeft: depth * 14 }}
        >
          <button
            type="button"
            className="builder-menu-row-button"
            onClick={() => onSetSelectedMenuItemId(item.id)}
          >
            <span className="builder-menu-row-title">
              <strong>{item.label}</strong>
              <small>{item.path ?? item.url}</small>
            </span>
            <span className="builder-menu-row-meta">
              {summaryParts.join(" · ")}
            </span>
          </button>
          {hasChildren && (
            <div className="builder-menu-row-children">
              {renderMenuTreeRows(children, depth + 1)}
            </div>
          )}
        </div>
      );
    });

  const renderMenuPresentationEditor = (item: MenuItem) => {
    const current = normalizeMenuPresentation(
      shellSettings.menuPresentation?.[item.id],
    );
    const children = item.children ?? [];
    const currentIconLabel = getMenuIconLabel(current.icon);

    return (
      <div className="builder-menu-editor">
        <div className="builder-card-title">
          <strong>{item.label}</strong>
          <span>{item.path ?? item.url}</span>
        </div>
        <div className="builder-menu-editor-note">
          <strong>{children.length} child items</strong>
          <span>Presentation settings are saved per WordPress menu item ID.</span>
        </div>
        <div className="builder-two-column">
          <label className="builder-check">
            <input
              type="checkbox"
              checked={current.showHeading}
              onChange={(event) =>
                updateMenuPresentation(item.id, {
                  showHeading: event.target.checked,
                })
              }
            />
            <span>Show heading</span>
          </label>
          <label className="builder-field">
            <span>Optional badge</span>
            <input
              value={current.badgeText ?? ""}
              onChange={(event) =>
                updateMenuPresentation(item.id, { badgeText: event.target.value })
              }
              placeholder="New"
            />
          </label>
        </div>
        <div className="builder-two-column">
          <div className="builder-field">
            <span>Icon</span>
            <div className="builder-menu-icon-picker">
              <button
                type="button"
                className="builder-menu-icon-picker-trigger"
                onClick={() => onSetMenuIconPickerOpen((value) => !value)}
                aria-expanded={menuIconPickerOpen}
              >
                <span className="builder-menu-icon-preview">
                  {renderUIKitIcon(current.icon, 15)}
                </span>
                <span className="builder-menu-icon-picker-trigger-label">
                  {currentIconLabel}
                </span>
                <span className="builder-menu-icon-picker-trigger-meta">
                  {current.icon ?? "none"}
                </span>
              </button>
              {menuIconPickerOpen && (
                <div className="builder-menu-icon-picker-panel">
                  <input
                    className="builder-menu-icon-picker-search"
                    value={menuIconSearch}
                    onChange={(event) => onSetMenuIconSearch(event.target.value)}
                    placeholder="Search UIkit icons"
                    autoFocus
                  />
                  <div className="builder-menu-icon-picker-grid">
                    <button
                      type="button"
                      className={`builder-menu-icon-option${
                        current.icon === null ? " is-selected" : ""
                      }`}
                      onClick={() => {
                        updateMenuPresentation(item.id, { icon: null });
                        onSetMenuIconSearch("");
                        onSetMenuIconPickerOpen(false);
                      }}
                    >
                      <span className="builder-menu-icon-preview builder-menu-icon-preview--empty" />
                      <span>None</span>
                      <small>clear icon</small>
                    </button>
                    {filteredMenuIcons.map((option) => (
                      <button
                        key={option.name}
                        type="button"
                        className={`builder-menu-icon-option${
                          current.icon === option.name ||
                          resolveUIKitIconName(current.icon) === option.name
                            ? " is-selected"
                            : ""
                        }`}
                        onClick={() => {
                          updateMenuPresentation(item.id, { icon: option.name });
                          onSetMenuIconSearch("");
                          onSetMenuIconPickerOpen(false);
                        }}
                      >
                        <span className="builder-menu-icon-preview">
                          {renderUIKitIcon(option.name, 15)}
                        </span>
                        <span>{option.label}</span>
                        <small>{option.name}</small>
                      </button>
                    ))}
                  </div>
                  {filteredMenuIcons.length === 0 && (
                    <div className="builder-empty-state builder-menu-icon-empty">
                      No UIkit icons match “{menuIconSearch.trim()}”.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          <label className="builder-field">
            <span>Submenu layout</span>
            <select
              value={current.submenuLayout}
              onChange={(event) =>
                updateMenuPresentation(item.id, {
                  submenuLayout: event.target.value as MenuPresentationSettings["submenuLayout"],
                })
              }
            >
              <option value="list">List</option>
              <option value="grid">Grid</option>
              <option value="mega">Mega</option>
            </select>
          </label>
        </div>
        <label className="builder-field">
          <span>Grid columns</span>
          <input
            type="number"
            min={1}
            max={6}
            value={current.submenuColumns}
            onChange={(event) =>
              updateMenuPresentation(item.id, {
                submenuColumns: Number(event.target.value),
              })
            }
          />
        </label>
      </div>
    );
  };

  return (
    <div className="builder-sidebar-panel">
      <div className="builder-sidebar-panel-header">
        <div>
          <strong>WordPress Menu Presentation</strong>
          <span>Presentation only, keyed by WordPress menu item ID</span>
        </div>
        <small>{menuTree.length} items</small>
      </div>
      <div className="builder-shell-note">
        <strong>WordPress remains the source of truth</strong>
        <span>
          These controls only change how the existing WordPress menu items are
          displayed in React.
        </span>
      </div>
      {menuTree.length > 0 ? (
        <div className="builder-menu-tree">
          {renderMenuTreeRows(menuTree)}
          {selectedMenuItem && renderMenuPresentationEditor(selectedMenuItem)}
        </div>
      ) : (
        <div className="builder-empty-state">
          No WordPress menu items were returned.
        </div>
      )}
    </div>
  );
}
