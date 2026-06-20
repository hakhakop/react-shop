"use client";

import React, { ReactNode } from "react";
import { ChevronLeft } from "lucide-react";
import { useSidebarNavigation } from "./SidebarNavigationContext";

interface NavigationPanelProps {
  title: string;
  description?: string;
  badge?: string | number;
  children: ReactNode;
  footerSlot?: ReactNode;
}

export function NavigationPanel({
  title,
  description,
  badge,
  children,
  footerSlot,
}: NavigationPanelProps) {
  const { pop } = useSidebarNavigation();

  return (
    <div className="builder-navigation-panel">
      <div className="builder-sidebar-nested-header builder-navigation-panel-header">
        <button
          type="button"
          className="builder-icon-button builder-navigation-panel-back-btn"
          onClick={pop}
          aria-label="Go back"
          title="Go back"
        >
          <ChevronLeft size={16} />
        </button>
        <div className="builder-navigation-panel-header-text">
          <strong>{title}</strong>
          {description && <span>{description}</span>}
        </div>
        {badge !== undefined && badge !== null && (
          <small className="builder-navigation-panel-badge">{badge}</small>
        )}
      </div>

      <div className="builder-navigation-panel-content">
        {children}
      </div>

      {footerSlot && (
        <div className="builder-navigation-panel-footer">
          {footerSlot}
        </div>
      )}
    </div>
  );
}
