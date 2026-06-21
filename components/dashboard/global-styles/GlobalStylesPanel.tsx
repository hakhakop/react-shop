"use client";

import React, { useEffect } from "react";
import { useSidebarNavigation } from "../navigation/SidebarNavigationContext";
import { NavigationMenu } from "../navigation/NavigationMenu";
import { NavigationBreadcrumb } from "../navigation/NavigationBreadcrumb";
import { GlobalStylesProvider, type GlobalStylesContextType } from "../context/GlobalStylesContext";

import SiteDesignPanel from "./SiteDesignPanel";
import GlobalSpacingPanel from "./GlobalSpacingPanel";
import GlobalCardsPanel from "./GlobalCardsPanel";
import GlobalButtonsPanel from "./GlobalButtonsPanel";
import GlobalTypographyPanel from "./GlobalTypographyPanel";
import GlobalHeaderPanel from "./GlobalHeaderPanel";
import { Palette, Ruler, ShoppingBag, ToggleLeft, Type, LayoutGrid } from "lucide-react";

type GlobalStylesPanelProps = GlobalStylesContextType;

export default function GlobalStylesPanel(props: GlobalStylesPanelProps) {
  const { stack, push, setRoot, clear } = useSidebarNavigation();

  // Keep navigation stack synced with global styles activation
  useEffect(() => {
    setRoot(
      { id: "global-styles-root", label: "Global Styles" },
      "globalStyles"
    );
  }, []);

  // Drill down to spacing settings when global spacing focus is requested
  useEffect(() => {
    if (props.globalSpacingFocus) {
      push({ id: "global-spacing", label: "Spacing Defaults" });
    }
  }, [props.globalSpacingFocus]);

  const renderActivePanel = () => {
    const activeItem = stack[stack.length - 1];
    if (!activeItem) return null;

    switch (activeItem.id) {
      case "global-site-design":
        return <SiteDesignPanel />;
      case "global-spacing":
        return <GlobalSpacingPanel />;
      case "global-cards":
        return <GlobalCardsPanel />;
      case "global-buttons":
        return <GlobalButtonsPanel />;
      case "global-typography":
        return <GlobalTypographyPanel />;
      case "global-header":
        return <GlobalHeaderPanel />;
      default:
        return null;
    }
  };

  const renderRootMenu = () => {
    return (
      <NavigationMenu
        items={[
          {
            id: "global-site-design",
            label: "Site Design",
            description: "Color scheme, page background, radius & presets",
            icon: <Palette size={16} />,
            onClick: () => push({ id: "global-site-design", label: "Site Design" }),
          },
          {
            id: "global-spacing",
            label: "Spacing & Defaults",
            description: "Default padding and margins for sections, rows, and elements",
            icon: <Ruler size={16} />,
            onClick: () => push({ id: "global-spacing", label: "Spacing Defaults" }),
          },
          {
            id: "global-cards",
            label: "Product Cards",
            description: "Styling, spacing, and aspect ratios of product lists",
            icon: <ShoppingBag size={16} />,
            onClick: () => push({ id: "global-cards", label: "Product Cards" }),
          },
          {
            id: "global-buttons",
            label: "Button Presets",
            description: "Global button borders, hover actions & fine-tuning",
            icon: <ToggleLeft size={16} />,
            onClick: () => push({ id: "global-buttons", label: "Button Presets" }),
          },
          {
            id: "global-typography",
            label: "Typography",
            description: "Global font styles, weights, and line heights for headings",
            icon: <Type size={16} />,
            onClick: () => push({ id: "global-typography", label: "Typography" }),
          },
          {
            id: "global-header",
            label: "Header Settings",
            description: "Header layout, brand modes, logo, active indicator & icons",
            icon: <LayoutGrid size={16} />,
            onClick: () => push({ id: "global-header", label: "Header Settings" }),
          },
        ]}
      />
    );
  };

  return (
    <GlobalStylesProvider value={props}>
      <div className="builder-sidebar-panel builder-sidebar-global-styles">
        <div className="builder-navigation-container">
          <NavigationBreadcrumb />
          <div className="builder-inspector-body" style={{ padding: "0" }}>
            {stack.length > 1 && stack[0]?.id === "global-styles-root"
              ? renderActivePanel()
              : renderRootMenu()}
          </div>
        </div>
      </div>
    </GlobalStylesProvider>
  );
}
