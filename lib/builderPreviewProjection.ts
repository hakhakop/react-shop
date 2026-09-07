import type {
  BuilderRow,
  BuilderSection,
} from "@/components/dashboard/builderTypes";

/**
 * Row properties owned by the authored inspector rather than Dynamic Content.
 *
 * A materialized preview may contain repeated rows and resolved child content,
 * but these values must always follow the current draft immediately. Keeping
 * the list explicit prevents authored Dynamic Content bindings from replacing
 * their resolved render-only values.
 */
const ROW_AUTHORED_PRESENTATION_KEYS = [
  "role",
  "headerVariant",
  "layout",
  "spacingContract",
  "customLayout",
  "columnGap",
  "rowGap",
  "divider",
  "horizontalDistribution",
  "maxWidth",
  "removeHorizontalPadding",
  "expandOneSide",
  "height",
  "topMargin",
  "bottomMargin",
  "htmlElement",
  "columnParallax",
  "advanced",
  "headerGap",
  "headerJustify",
  "headerAlign",
  "rowBackground",
  "rowColorScheme",
  "rowTopSpacing",
  "rowBottomSpacing",
  "rowTopMargin",
  "rowBottomMargin",
  "rowBorderRadius",
  "rowVisualStyle",
  "rowAnimation",
] as const satisfies ReadonlyArray<keyof BuilderRow>;

function authoredNodeForProjection<Node extends { id: string }>(
  authored: Node[],
  projectedId: string,
) {
  return authored.find((node) => node.id === projectedId) ??
    authored.find((node) => projectedId.startsWith(`${node.id}--dynamic-`));
}

function rebaseRows(authoredRows: BuilderRow[], projectedRows: BuilderRow[]) {
  return projectedRows.map((projectedRow) => {
    const authoredRow = authoredNodeForProjection(authoredRows, projectedRow.id);
    if (!authoredRow) return projectedRow;
    const rebased = { ...projectedRow };
    for (const key of ROW_AUTHORED_PRESENTATION_KEYS) {
      // Assigning undefined is intentional: selecting None may normalize to an
      // omitted value and still needs to clear an older projected max width.
      (rebased as Record<string, unknown>)[key] = authoredRow[key];
    }
    return rebased;
  });
}

/**
 * Overlay live Row-inspector presentation state onto a server-materialized
 * preview without replacing its repeated rows or resolved child content.
 */
export function rebaseMaterializedRowPresentation(
  authoredSections: BuilderSection[],
  projectedSections: BuilderSection[],
): BuilderSection[] {
  return projectedSections.map((projectedSection) => {
    const authoredSection = authoredNodeForProjection(authoredSections, projectedSection.id);
    if (!authoredSection || !projectedSection.rows || !authoredSection.rows) {
      return projectedSection;
    }
    return {
      ...projectedSection,
      rows: rebaseRows(authoredSection.rows, projectedSection.rows),
    } as BuilderSection;
  });
}
