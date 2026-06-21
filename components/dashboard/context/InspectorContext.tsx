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

export type InspectorContextType = {
  selectedSection: any;
  selectedLayoutBlock: any;
  selectedLayoutRow: any;
  selectedLayoutColumnKey: any;
  selectedSectionIsFirstVisible?: boolean;
  previewCategoryTree: any[];
  sectionLabels: Record<string, string>;
  updateSelected: (patch: any) => void;
  updateSelectedLayoutBlockByKey: (patch: any) => void;
  updateSelectedRow: (patch: any) => void;
  updateSelectedColumn: (patch: any) => void;
  openWordPressMediaPicker: (options: WordPressMediaPickerOptions) => void;
  [key: string]: any;
};

const InspectorContext = createContext<InspectorContextType | null>(null);

export function InspectorProvider({
  value,
  children,
}: {
  value: InspectorContextType;
  children: ReactNode;
}) {
  return (
    <InspectorContext.Provider value={value}>
      {children}
    </InspectorContext.Provider>
  );
}

export function useInspector() {
  const context = useContext(InspectorContext);
  if (!context) {
    throw new Error("useInspector must be used inside InspectorProvider");
  }
  return context;
}
