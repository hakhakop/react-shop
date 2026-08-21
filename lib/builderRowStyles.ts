import type { CSSProperties } from "react";

import { resolveBuilderSpacing } from "@/lib/builderSpacing";
import { visualStyleToCss } from "@/lib/builderVisualStyle";

export type BuilderRowStyleInput = {
  spacingContract?: "yootheme";
  rowHeight?: {
    mode?: "none" | "pixels" | "viewport";
    value?: string;
    offset?: string;
    subtractHeightAbove?: boolean;
  };
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
  // YOOtheme's margin scale is independent from the generic WebPages scale:
  // medium is 40px and large is 70px in the imported global token set.
  if (spacingContract === "yootheme" && context === "rowMargin") {
    const token = value.trim().toLowerCase();
    if (token === "medium") return "40px";
    if (token === "large") return "70px";
    // YOOtheme's xlarge row margin is a global token (140px), which is not
    // part of the generic builder spacing scale. Keep it token-backed so
    // imported layouts follow the site's global style override.
    if (token === "xlarge" || token === "xl") {
      return "var(--uk-global-margin-xlarge, 140px)";
    }
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

  const rowHeight = row?.rowHeight;
  const minHeight = rowHeight?.mode === "pixels" && rowHeight.value
    ? rowHeight.value
    : rowHeight?.mode === "viewport"
      ? rowHeight.offset
        ? `calc(80vh - ${rowHeight.offset})`
        : "80vh"
      : undefined;

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
    ...(minHeight ? { minHeight } : {}),
    ...(row?.maxWidth && row.maxWidth !== "inherit"
      ? {
          maxWidth:
            row.maxWidth === "small" ? "960px"
            : row.maxWidth === "xsmall" || row.maxWidth === "xs" ? "750px"
            : row.maxWidth === "default" || row.maxWidth === "medium" ? "1200px"
            : row.maxWidth === "large" || row.maxWidth === "xlarge" ? "1600px"
            : row.maxWidth === "expand" || row.maxWidth === "full" || row.maxWidth === "none" ? "100%"
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
