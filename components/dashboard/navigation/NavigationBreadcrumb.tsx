"use client";

import React from "react";
import { ChevronRight, Home } from "lucide-react";
import { useSidebarNavigation } from "./SidebarNavigationContext";

export function NavigationBreadcrumb() {
  const { stack, goTo, clear } = useSidebarNavigation();

  if (stack.length === 0) return null;

  return (
    <nav className="builder-navigation-breadcrumbs" aria-label="Breadcrumbs">
      <button
        type="button"
        className="builder-breadcrumb-home-btn"
        onClick={clear}
        title="Back to menu home"
      >
        <Home size={12} />
      </button>

      {stack.map((item, index) => {
        const isLast = index === stack.length - 1;

        return (
          <React.Fragment key={item.id}>
            <ChevronRight size={10} className="builder-breadcrumb-separator" />
            {isLast ? (
              <span className="builder-breadcrumb-active" aria-current="page">
                {item.label}
              </span>
            ) : (
              <button
                type="button"
                className="builder-breadcrumb-btn"
                onClick={() => goTo(item.id)}
              >
                {item.label}
              </button>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
