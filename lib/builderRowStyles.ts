import type { CSSProperties } from "react";

import { resolveBuilderSpacing } from "@/lib/builderSpacing";
import { visualStyleToCss } from "@/lib/builderVisualStyle";

export type BuilderRowStyleInput = {
  spacingContract?: "yootheme";
  rowBackground?: string;
  rowTopSpacing?: string;
  rowBottomSpacing?: string;
  rowTopMargin?: string;
  rowBottomMargin?: string;
  rowBorderRadius?: number;
  rowVisualStyle?: Parameters<typeof visualStyleToCss>[0];
  rowGap?: string;
  maxWidth?: string;
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
  spacingContract?: "yootheme",
) {
  if (!value || value === "inherit") return "0px";
  // YOOtheme's `large` row margin is @global-large-margin (70px),
  // distinct from the generic WebPages xl token (96px).
  if (spacingContract === "yootheme" && context === "rowMargin" && value.trim().toLowerCase() === "large") {
    return "70px";
  }
  return resolveBuilderSpacing(value, context).css;
}

export type BuilderRowStyleOptions = {
  global?: BuilderRowGlobalSpacing;
  isFirstRow?: boolean;
};

export function resolveBuilderRowStyle(
  row: BuilderRowStyleInput | undefined,
  globalOrOptions: BuilderRowGlobalSpacing | BuilderRowStyleOptions = {},
): CSSProperties {
  const options: BuilderRowStyleOptions =
    "global" in globalOrOptions || "isFirstRow" in globalOrOptions
      ? (globalOrOptions as BuilderRowStyleOptions)
      : { global: globalOrOptions as BuilderRowGlobalSpacing };
  const global = options.global ?? {};
  const isFirstRow = options.isFirstRow ?? false;
  const hasSurface = Boolean(
    row?.rowBackground || row?.rowVisualStyle?.background,
  );
  const topMargin = isFirstRow && row?.spacingContract === "yootheme"
    ? "0px"
    : explicitSpacing(row?.rowTopMargin, "rowMargin", row?.spacingContract);

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
    marginTop: topMargin,
    marginBottom: explicitSpacing(row?.rowBottomMargin, "rowMargin", row?.spacingContract),
    ...(row?.maxWidth && row.maxWidth !== "default" && row.maxWidth !== "inherit"
      ? {
          maxWidth:
            row.maxWidth === "small" ? "960px"
            : row.maxWidth === "xsmall" ? "750px"
            : row.maxWidth === "medium" ? "1200px"
            : row.maxWidth === "large" ? "1600px"
            : undefined,
          width: "100%",
          marginInline: "auto",
          justifySelf: "center",
        }
      : {}),
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
