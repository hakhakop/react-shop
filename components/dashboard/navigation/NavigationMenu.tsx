"use client";

import React from "react";
import { ChevronRight } from "lucide-react";

export interface NavigationMenuItemType {
  id: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  badge?: string | number;
  onClick: () => void;
}

interface NavigationMenuProps {
  items: NavigationMenuItemType[];
}

export function NavigationMenu({ items }: NavigationMenuProps) {
  return (
    <div className="builder-navigation-menu" role="menu">
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={item.onClick}
          className="builder-navigation-menu-item"
          role="menuitem"
        >
          {item.icon && <span className="builder-navigation-menu-item-icon">{item.icon}</span>}
          <span className="builder-navigation-menu-item-text">
            <strong>{item.label}</strong>
            {item.description && <small>{item.description}</small>}
          </span>
          <span className="builder-navigation-menu-item-meta">
            {item.badge !== undefined && item.badge !== null && (
              <em className="builder-navigation-menu-item-badge">{item.badge}</em>
            )}
            <ChevronRight size={14} className="builder-navigation-menu-item-arrow" />
          </span>
        </button>
      ))}
    </div>
  );
}
