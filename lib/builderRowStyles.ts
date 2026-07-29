import type { CSSProperties } from "react";

import { resolveBuilderSpacing } from "@/lib/builderSpacing";
import { visualStyleToCss } from "@/lib/builderVisualStyle";

export type BuilderRowStyleInput = {
  rowBackground?: string;
  rowTopSpacing?: string;
  rowBottomSpacing?: string;
  rowTopMargin?: string;
  rowBottomMargin?: string;
  rowBorderRadius?: number;
  rowVisualStyle?: Parameters<typeof visualStyleToCss>[0];
  rowGap?: string;
  headerJustify?: "start" | "center" | "space-between" | "end";
  headerAlign?: "start" | "center" | "end" | "stretch";
};

export type BuilderRowGlobalSpacing = {
  rowPaddingTop?: string;
  rowPaddingBottom?: string;
  rowMarginTop?: string;
  rowMarginBottom?: string;
  rowGap?: string;
};

function inheritedSpacing(
  value: string | undefined,
  context: "rowPadding" | "rowMargin",
  inherited: string | undefined,
) {
  if (
    (!value || value === "inherit") &&
    inherited?.trim().startsWith("var(")
  ) {
    return inherited;
  }
  return resolveBuilderSpacing(value ?? "inherit", context, inherited).css;
}

function explicitSpacing(
  value: string | undefined,
  context: "rowPadding" | "rowMargin",
) {
  if (!value || value === "inherit") return "0px";
  return resolveBuilderSpacing(value, context).css;
}

export function resolveBuilderRowStyle(
  row: BuilderRowStyleInput | undefined,
  global: BuilderRowGlobalSpacing = {},
): CSSProperties {
  const hasSurface = Boolean(
    row?.rowBackground || row?.rowVisualStyle?.background,
  );
  return {
    background: row?.rowBackground || undefined,
    paddingTop: hasSurface
      ? inheritedSpacing(
          row?.rowTopSpacing,
          "rowPadding",
          global.rowPaddingTop,
        )
      : "0px",
    paddingBottom: hasSurface
      ? inheritedSpacing(
          row?.rowBottomSpacing,
          "rowPadding",
          global.rowPaddingBottom,
        )
      : "0px",
    // Global row margins are intentionally not inherited. Row siblings use
    // rowGap; an explicit local margin replaces that boundary's gap.
    marginTop: explicitSpacing(row?.rowTopMargin, "rowMargin"),
    marginBottom: explicitSpacing(row?.rowBottomMargin, "rowMargin"),
    borderRadius:
      row?.rowBorderRadius !== undefined &&
      Boolean(row.rowBackground || row.rowVisualStyle?.background)
        ? `${row.rowBorderRadius}px`
        : undefined,
    ...visualStyleToCss(row?.rowVisualStyle),
  };
}

export function resolveBuilderRowGap(
  row: BuilderRowStyleInput | undefined,
  globalRowGap: string | undefined,
  previousRow?: BuilderRowStyleInput,
) {
  const ownsBoundaryWithMargin =
    (row?.rowTopMargin && row.rowTopMargin !== "inherit") ||
    (previousRow?.rowBottomMargin &&
      previousRow.rowBottomMargin !== "inherit");
  if (ownsBoundaryWithMargin) {
    return resolveBuilderSpacing("none", "rowGap");
  }
  return resolveBuilderSpacing(
    row?.rowGap ?? "inherit",
    "rowGap",
    globalRowGap,
  );
}

export function resolveBuilderRowAlignment(
  row: BuilderRowStyleInput | undefined,
): Pick<CSSProperties, "justifyContent" | "alignItems"> {
  const justifyMap = {
    start: "flex-start",
    center: "center",
    "space-between": "space-between",
    end: "flex-end",
  } as const;
  const alignMap = {
    start: "flex-start",
    center: "center",
    end: "flex-end",
    stretch: "stretch",
  } as const;
  return {
    justifyContent: row?.headerJustify
      ? justifyMap[row.headerJustify]
      : undefined,
    alignItems: row?.headerAlign ? alignMap[row.headerAlign] : undefined,
  };
}
