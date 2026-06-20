"use client";

import React, { createContext, useContext, useReducer, ReactNode, useEffect } from "react";
import type { SidebarTab } from "@/components/dashboard/builderTypes";

export interface NavigationItem {
  id: string;
  label: string;
  description?: string;
}

interface NavigationState {
  stack: NavigationItem[];
  currentTab: SidebarTab | null;
}

type NavigationAction =
  | { type: "PUSH"; item: NavigationItem }
  | { type: "POP" }
  | { type: "GO_TO"; id: string }
  | { type: "CLEAR" }
  | { type: "SET_ROOT"; item: NavigationItem; tab: SidebarTab }
  | { type: "SYNC_TAB"; tab: SidebarTab };

const initialState: NavigationState = {
  stack: [],
  currentTab: null,
};

function navigationReducer(state: NavigationState, action: NavigationAction): NavigationState {
  switch (action.type) {
    case "PUSH": {
      // Don't push duplicate IDs sequentially
      if (state.stack.length > 0 && state.stack[state.stack.length - 1].id === action.item.id) {
        return state;
      }
      return {
        ...state,
        stack: [...state.stack, action.item],
      };
    }
    case "POP": {
      if (state.stack.length === 0) return state;
      const nextStack = state.stack.slice(0, -1);
      return {
        ...state,
        stack: nextStack,
        currentTab: nextStack.length === 0 ? null : state.currentTab,
      };
    }
    case "GO_TO": {
      const idx = state.stack.findIndex((item) => item.id === action.id);
      if (idx === -1) return state;
      const nextStack = state.stack.slice(0, idx + 1);
      return {
        ...state,
        stack: nextStack,
        currentTab: nextStack.length === 0 ? null : state.currentTab,
      };
    }
    case "CLEAR": {
      return {
        ...state,
        stack: [],
        currentTab: null,
      };
    }
    case "SET_ROOT": {
      return {
        ...state,
        stack: [action.item],
        currentTab: action.tab,
      };
    }
    case "SYNC_TAB": {
      // Sync tab changes from external state (e.g. initial load or parent update)
      if (state.currentTab === action.tab) return state;
      
      const tabLabelMap: Record<SidebarTab, string> = {
        elements: "Elements",
        inspector: "Inspector",
        globalStyles: "Global Styles",
        menu: "Menu",
        pages: "Pages",
        templates: "Templates",
        settings: "Settings",
      };

      return {
        ...state,
        stack: [{ id: action.tab, label: tabLabelMap[action.tab] || action.tab }],
        currentTab: action.tab,
      };
    }
    default:
      return state;
  }
}

export interface NavigationContextType {
  stack: NavigationItem[];
  currentTab: SidebarTab | null;
  push: (item: NavigationItem) => void;
  pop: () => void;
  goTo: (id: string) => void;
  clear: () => void;
  setRoot: (item: NavigationItem, tab: SidebarTab) => void;
}

const SidebarNavigationContext = createContext<NavigationContextType | undefined>(undefined);

export function SidebarNavigationProvider({
  children,
  externalTab,
  onExternalTabChange,
}: {
  children: ReactNode;
  externalTab?: SidebarTab;
  onExternalTabChange?: (tab: SidebarTab) => void;
}) {
  const [state, dispatch] = useReducer(navigationReducer, initialState);

  // Sync with external sidebar tab if changes occur externally
  useEffect(() => {
    if (externalTab) {
      // If external tab is set, sync it to the navigation state
      dispatch({ type: "SYNC_TAB", tab: externalTab });
    }
  }, [externalTab]);

  const push = (item: NavigationItem) => dispatch({ type: "PUSH", item });
  const pop = () => {
    dispatch({ type: "POP" });
  };
  const goTo = (id: string) => dispatch({ type: "GO_TO", id });
  const clear = () => {
    dispatch({ type: "CLEAR" });
  };
  const setRoot = (item: NavigationItem, tab: SidebarTab) => {
    dispatch({ type: "SET_ROOT", item, tab });
    if (onExternalTabChange) {
      onExternalTabChange(tab);
    }
  };

  // Propagate tab changes back to external state when popping to empty
  useEffect(() => {
    if (state.stack.length === 0 && externalTab && externalTab !== "settings" && onExternalTabChange) {
      // Go back to the 'settings' or home tab if the stack becomes empty
      onExternalTabChange("settings");
    }
  }, [state.stack.length, externalTab, onExternalTabChange]);

  return (
    <SidebarNavigationContext.Provider
      value={{
        stack: state.stack,
        currentTab: state.currentTab,
        push,
        pop,
        goTo,
        clear,
        setRoot,
      }}
    >
      {children}
    </SidebarNavigationContext.Provider>
  );
}

export function useSidebarNavigation() {
  const context = useContext(SidebarNavigationContext);
  if (!context) {
    throw new Error("useSidebarNavigation must be used within a SidebarNavigationProvider");
  }
  return context;
}
