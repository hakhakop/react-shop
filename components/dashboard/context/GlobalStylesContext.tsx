"use client";

import {
  createContext,
  useContext,
  type ReactNode,
} from "react";

type WordPressMediaSelection = {
  sourceUrl?: string;
  altText?: string | null;
  title?: string | null;
  [key: string]: unknown;
};

type WordPressMediaPickerOptions = {
  title?: string;
  currentUrl?: string;
  onSelect?: (media: WordPressMediaSelection) => void;
  [key: string]: unknown;
};

export type GlobalStylesContextType = {
  design: any;
  shellSettings: any;
  globalSpacingFocus?: any;
  updateDesign: (patch: any) => void;
  updateShellSettings: (patch: any) => void;
  applyDesignPreset: (preset: any) => void;
  applyHeaderPreset: (preset: any) => void;
  updateHeaderIcon: (id: any, patch: any) => void;
  openWordPressMediaPicker: (options: WordPressMediaPickerOptions) => void;
  [key: string]: any;
};

const GlobalStylesContext = createContext<GlobalStylesContextType | null>(null);

export function GlobalStylesProvider({
  value,
  children,
}: {
  value: GlobalStylesContextType;
  children: ReactNode;
}) {
  return (
    <GlobalStylesContext.Provider value={value}>
      {children}
    </GlobalStylesContext.Provider>
  );
}

export function useGlobalStyles() {
  const context = useContext(GlobalStylesContext);
  if (!context) {
    throw new Error("useGlobalStyles must be used inside GlobalStylesProvider");
  }
  return context;
}
