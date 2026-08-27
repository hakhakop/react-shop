import type { CSSProperties } from "react";

import {
  resolveBuilderSpacing,
  resolveBuilderSpacingCssValue,
} from "@/lib/builderSpacing";
import { visualStyleToCss } from "@/lib/builderVisualStyle";

export type BuilderRowStyleInput = {
  advanced?: { css?: string };
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
  // YOOtheme rows may carry authored layout CSS (for example the Feature
  // Gallery row's `height: 60vh; min-height: 700px; margin-bottom: 10vh`).
  // Preserve these structural declarations in the shared row path so
  // Builder and storefront reserve the same parallax field.
  const authoredCss = row?.advanced?.css ?? "";
  const authoredProperty = (property: string) =>
    new RegExp(`(?:^|[;{])\\s*${property}\\s*:`, "i").test(authoredCss);
  const authoredHeight = authoredCss.match(/(?:^|[;{])\s*height\s*:\s*([^;}]*)/i)?.[1]?.trim();
  const authoredMinHeight = authoredCss.match(/(?:^|[;{])\s*min-height\s*:\s*([^;}]*)/i)?.[1]?.trim();
  const authoredBottomMargin = authoredCss.match(/(?:^|[;{])\s*margin-bottom\s*:\s*([^;}]*)/i)?.[1]?.trim();
  const minHeight = rowHeight?.mode === "pixels" && rowHeight.value
    ? rowHeight.value
    : rowHeight?.mode === "viewport"
      ? rowHeight.offset
        ? `calc(80vh - ${rowHeight.offset})`
        : "80vh"
      : undefined;

  return {
    background: row?.rowBackground || undefined,
    ...(authoredProperty("padding-top")
      ? {}
      : {
          paddingTop: hasSurface
            ? inheritedSpacing(
                row?.rowTopSpacing,
                "rowPadding",
                global.rowPaddingTop,
              )
            : "0px",
        }),
    ...(authoredProperty("padding-bottom")
      ? {}
      : {
          paddingBottom: hasSurface
            ? inheritedSpacing(
                row?.rowBottomSpacing,
                "rowPadding",
                global.rowPaddingBottom,
              )
            : "0px",
        }),
    // Global row margins are intentionally not inherited. Row siblings use
    // rowGap; an explicit local margin replaces that boundary's gap.
    ...(authoredProperty("margin-top") ? {} : { marginTop: topMargin }),
    ...(authoredProperty("margin-bottom")
      ? {}
      : {
          marginBottom:
            authoredBottomMargin ||
            explicitSpacing(row?.rowBottomMargin, "rowMargin", row?.spacingContract),
        }),
    ...(authoredHeight ? { height: authoredHeight } : {}),
    ...(authoredMinHeight ? { minHeight: authoredMinHeight } : minHeight ? { minHeight } : {}),
    // The Builder projects UIkit's flex row as CSS grid. Authored fixed-height
    // rows must use a zero-minimum track so grid min-content cannot expand the
    // row beyond the imported height while positioned/parallax children remain
    // free to paint outside it, as they do in UIkit.
    ...(authoredHeight ? { gridTemplateRows: "minmax(0, 1fr)" } : {}),
    ...(authoredHeight && authoredMinHeight
      ? ({
          "--builder-authored-row-height": authoredHeight,
          "--builder-authored-row-min-height": authoredMinHeight,
        } as CSSProperties)
      : {}),
    ...(row?.maxWidth && row.maxWidth !== "inherit"
      ? {
          maxWidth:
            row.maxWidth === "small" ? "var(--uk-container-small-max-width, 900px)"
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
  const hasExplicitMargin = (value: string | undefined) =>
    Boolean(value && value !== "inherit" && value !== "none" && value !== "default");
  const ownsBoundaryWithMargin =
    hasExplicitMargin(row?.rowTopMargin) ||
    hasExplicitMargin(previousRow?.rowBottomMargin);
  if (ownsBoundaryWithMargin) {
    return resolveBuilderSpacing("none", "rowGap");
  }
  // UIkit's row modifiers use the imported gutter values, not the generic
  // Builder spacing scale (32/64/96px). Keep the inter-row boundary in the
  // same contract as the rendered uk-grid-row-* modifier.
  const rawValue = row?.rowGap && row.rowGap !== "inherit"
    ? row.rowGap
    : globalRowGap;
  // YOOtheme's unmodified adjacent grids use the active medium UIkit gutter
  // at their boundary. The generic Builder fallback is intentionally smaller
  // for native layouts, so imported rows need to stay on their own contract.
  if (
    row?.spacingContract === "yootheme" &&
    (!row.rowGap || row.rowGap === "inherit") &&
    rawValue === globalRowGap
  ) {
    return resolveBuilderSpacingCssValue(
      "var(--uk-grid-gutter-medium, 40px)",
      "rowGap",
      "Local",
      "yootheme",
    );
  }
  const value = rawValue?.trim().toLowerCase();
  if (value === "small") {
    return resolveBuilderSpacingCssValue("15px", "rowGap", "Local", value);
  }
  if (value === "medium") {
    return resolveBuilderSpacingCssValue("30px", "rowGap", "Local", value);
  }
  if (value === "large") {
    return resolveBuilderSpacingCssValue(
      "var(--builder-yootheme-row-gap-large, 40px)",
      "rowGap",
      "Local",
      value,
    );
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
