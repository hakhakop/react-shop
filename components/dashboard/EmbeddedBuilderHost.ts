import type { BuilderLayoutBlock } from "./builderTypes";

export type EmbeddedBuilderImportDestination = {
  type: "menu-dropdown";
  menuId: string;
  itemId: string;
};

/** The owner supplies persistence; the dashboard supplies its existing UI hosts. */
export type EmbeddedBuilderHost = {
  inspectorTarget: HTMLElement | null;
  showInspector: () => void;
  releaseInspector: () => void;
  openElements: (insert: (kind: NonNullable<BuilderLayoutBlock["kind"]>) => void) => void;
  openLibrary: (destination: EmbeddedBuilderImportDestination) => void;
};
