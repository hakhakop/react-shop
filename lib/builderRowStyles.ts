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

export function resolveBuilderRowStyle(
  row: BuilderRowStyleInput | undefined,
  global: BuilderRowGlobalSpacing = {},
): CSSProperties {
  return {
    background: row?.rowBackground || undefined,
    paddingTop: inheritedSpacing(
      row?.rowTopSpacing,
      "rowPadding",
      global.rowPaddingTop,
    ),
    paddingBottom: inheritedSpacing(
      row?.rowBottomSpacing,
      "rowPadding",
      global.rowPaddingBottom,
    ),
    marginTop: inheritedSpacing(
      row?.rowTopMargin,
      "rowMargin",
      global.rowMarginTop,
    ),
    marginBottom: inheritedSpacing(
      row?.rowBottomMargin,
      "rowMargin",
      global.rowMarginBottom,
    ),
    borderRadius:
      row?.rowBorderRadius !== undefined
        ? `${row.rowBorderRadius}px`
        : undefined,
    ...visualStyleToCss(row?.rowVisualStyle),
  };
}

export function resolveBuilderRowGap(
  row: BuilderRowStyleInput | undefined,
  globalRowGap: string | undefined,
) {
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
