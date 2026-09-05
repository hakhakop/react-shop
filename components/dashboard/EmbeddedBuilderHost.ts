import type { BuilderLayoutBlock } from "./builderTypes";
import type { MenuDropdownContent } from "@/lib/menuDropdownLayout";

/** The owner supplies persistence; the dashboard supplies its existing UI hosts. */
export type EmbeddedBuilderHost = {
  inspectorTarget: HTMLElement | null;
  showInspector: () => void;
  releaseInspector: () => void;
  openElements: (insert: (kind: NonNullable<BuilderLayoutBlock["kind"]>) => void) => void;
  importJson: (file: File, apply: (content: MenuDropdownContent) => void) => void;
};
