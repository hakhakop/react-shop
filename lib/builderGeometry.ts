import {
  BUILDER_SPACING_SCALE,
  type BuilderSpacingContext,
  type BuilderSpacingToken,
} from "@/lib/builderSpacing";

type ConcreteSpacingToken = Exclude<BuilderSpacingToken, "inherit">;

/**
 * Shared structural design language. These are semantic defaults rather than
 * component styles: factories, preview chrome, and storefront renderers all
 * consume the same vocabulary.
 */
export const BUILDER_STRUCTURAL_DESIGN = {
  section: {
    widthPreset: "boxed",
    padding: "lg",
    margin: "none",
  },
  row: {
    gap: "md",
    padding: "none",
    margin: "none",
    editorMinHeight: 72,
  },
  column: {
    gap: "md",
    padding: "none",
    editorMinHeight: 64,
  },
  element: {
    stackGap: "sm",
    padding: "xs",
    margin: "none",
  },
  card: {
    gap: "sm",
    padding: "sm",
    radius: 12,
    placeholderMediaRatio: "4 / 3",
  },
  panel: {
    gap: "sm",
    padding: "md",
    radius: 12,
  },
  placeholder: {
    borderOpacity: 0.12,
    surfaceOpacity: 0.025,
    labelOpacity: 0.58,
  },
} as const;

/**
 * Canonical geometry ownership for both builder preview and storefront.
 * Layout containers own composition; content owns its intrinsic size.
 */
export const BUILDER_GEOMETRY = {
  sectionPadding: BUILDER_STRUCTURAL_DESIGN.section.padding,
  rowGap: BUILDER_STRUCTURAL_DESIGN.row.gap,
  rowPadding: BUILDER_STRUCTURAL_DESIGN.row.padding,
  rowMargin: BUILDER_STRUCTURAL_DESIGN.row.margin,
  columnGap: BUILDER_STRUCTURAL_DESIGN.column.gap,
  columnPadding: BUILDER_STRUCTURAL_DESIGN.column.padding,
  elementGap: BUILDER_STRUCTURAL_DESIGN.element.stackGap,
  elementPadding: BUILDER_STRUCTURAL_DESIGN.element.padding,
  elementMargin: BUILDER_STRUCTURAL_DESIGN.element.margin,
  editorRowInteractionGutter: 10,
  editorEmptyTargetMinHeight: BUILDER_STRUCTURAL_DESIGN.column.editorMinHeight,
  editorInsertionHitSize: 32,
} as const satisfies Record<
  | "sectionPadding"
  | "rowGap"
  | "rowPadding"
  | "rowMargin"
  | "columnGap"
  | "columnPadding"
  | "elementGap"
  | "elementPadding"
  | "elementMargin",
  ConcreteSpacingToken
> & {
  editorRowInteractionGutter: number;
  editorEmptyTargetMinHeight: number;
  editorInsertionHitSize: number;
};

export const BUILDER_GEOMETRY_DEFAULT_BY_CONTEXT: Record<
  BuilderSpacingContext,
  ConcreteSpacingToken
> = {
  sectionPadding: BUILDER_GEOMETRY.sectionPadding,
  sectionMargin: "none",
  rowGap: BUILDER_GEOMETRY.rowGap,
  rowPadding: BUILDER_GEOMETRY.rowPadding,
  rowMargin: BUILDER_GEOMETRY.rowMargin,
  columnGap: BUILDER_GEOMETRY.columnGap,
  columnPadding: BUILDER_GEOMETRY.columnPadding,
  elementPadding: BUILDER_GEOMETRY.elementPadding,
  elementMargin: BUILDER_GEOMETRY.elementMargin,
};

export function builderGeometryCssVariables(options?: {
  includeEditorAffordances?: boolean;
}): Record<string, string> {
  const sharedVariables = {
    "--builder-element-stack-gap": `${BUILDER_SPACING_SCALE[BUILDER_GEOMETRY.elementGap]}px`,
    "--builder-structure-card-gap": `${BUILDER_SPACING_SCALE[BUILDER_STRUCTURAL_DESIGN.card.gap]}px`,
    "--builder-structure-card-padding": `${BUILDER_SPACING_SCALE[BUILDER_STRUCTURAL_DESIGN.card.padding]}px`,
    "--builder-structure-card-radius": `${BUILDER_STRUCTURAL_DESIGN.card.radius}px`,
    "--builder-structure-card-placeholder-ratio":
      BUILDER_STRUCTURAL_DESIGN.card.placeholderMediaRatio,
    "--builder-structure-panel-gap": `${BUILDER_SPACING_SCALE[BUILDER_STRUCTURAL_DESIGN.panel.gap]}px`,
    "--builder-structure-panel-padding": `${BUILDER_SPACING_SCALE[BUILDER_STRUCTURAL_DESIGN.panel.padding]}px`,
    "--builder-structure-panel-radius": `${BUILDER_STRUCTURAL_DESIGN.panel.radius}px`,
  };

  if (!options?.includeEditorAffordances) return sharedVariables;

  return {
    ...sharedVariables,
    "--builder-editor-row-interaction-gutter": `${BUILDER_GEOMETRY.editorRowInteractionGutter}px`,
    "--builder-editor-empty-target-min-height": `${BUILDER_GEOMETRY.editorEmptyTargetMinHeight}px`,
    "--builder-editor-insertion-hit-size": `${BUILDER_GEOMETRY.editorInsertionHitSize}px`,
    "--builder-structure-empty-row-min-height": `${BUILDER_STRUCTURAL_DESIGN.row.editorMinHeight}px`,
    "--builder-structure-empty-column-min-height": `${BUILDER_STRUCTURAL_DESIGN.column.editorMinHeight}px`,
    "--builder-structure-placeholder-border-opacity": String(
      BUILDER_STRUCTURAL_DESIGN.placeholder.borderOpacity,
    ),
    "--builder-structure-placeholder-surface-opacity": String(
      BUILDER_STRUCTURAL_DESIGN.placeholder.surfaceOpacity,
    ),
    "--builder-structure-placeholder-label-opacity": String(
      BUILDER_STRUCTURAL_DESIGN.placeholder.labelOpacity,
    ),
  };
}
