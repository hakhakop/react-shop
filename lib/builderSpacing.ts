export type BuilderSpacingToken =
  | "inherit"
  | "none"
  | "xs"
  | "sm"
  | "md"
  | "lg"
  | "xl"
  | "2xl"
  | "3xl";

export type LegacyBuilderSpacingToken = "small" | "medium" | "large";

export type BuilderSpacingInput =
  | BuilderSpacingToken
  | LegacyBuilderSpacingToken
  | string
  | undefined
  | null;

export type BuilderSpacingSource = "Local" | "Global" | "Default";
export type ResolvedBuilderSpacing = {
  rawValue?: string;
  inheritedValue?: string;
  defaultToken?: Exclude<BuilderSpacingToken, "inherit">;
  token?: Exclude<BuilderSpacingToken, "inherit">;
  px: number;
  css: string;
  label: string;
  shortLabel: string;
  optionLabel: string;
  source: BuilderSpacingSource;
  sourceLabel: BuilderSpacingSource;
  isExplicitZero: boolean;
};

export type BuilderSpacingContext =
  | "sectionPadding"
  | "sectionMargin"
  | "rowGap"
  | "rowPadding"
  | "rowMargin"
  | "columnGap"
  | "columnPadding"
  | "elementPadding"
  | "elementMargin";

export const BUILDER_SPACING_SCALE: Record<
  Exclude<BuilderSpacingToken, "inherit">,
  number
> = {
  none: 0,
  xs: 8,
  sm: 16,
  md: 32,
  lg: 64,
  xl: 96,
  "2xl": 128,
  "3xl": 192,
};

const DEFAULT_SPACING_BY_CONTEXT: Record<
  BuilderSpacingContext,
  Exclude<BuilderSpacingToken, "inherit">
> = {
  sectionPadding: "2xl",
  sectionMargin: "none",
  rowGap: "lg",
  rowPadding: "md",
  rowMargin: "none",
  columnGap: "lg",
  columnPadding: "md",
  elementPadding: "sm",
  elementMargin: "md",
};

const LEGACY_SPACING_BY_CONTEXT: Record<
  BuilderSpacingContext,
  Record<LegacyBuilderSpacingToken, Exclude<BuilderSpacingToken, "inherit">>
> = {
  sectionPadding: { small: "lg", medium: "2xl", large: "3xl" },
  sectionMargin: { small: "md", medium: "xl", large: "2xl" },
  rowGap: { small: "md", medium: "lg", large: "xl" },
  rowPadding: { small: "sm", medium: "md", large: "lg" },
  rowMargin: { small: "sm", medium: "md", large: "xl" },
  columnGap: { small: "md", medium: "lg", large: "xl" },
  columnPadding: { small: "sm", medium: "md", large: "lg" },
  elementPadding: { small: "sm", medium: "md", large: "lg" },
  elementMargin: { small: "sm", medium: "md", large: "lg" },
};

export const TOKEN_LABELS: Record<Exclude<BuilderSpacingToken, "inherit">, string> = {
  none: "None",
  xs: "XS",
  sm: "Small",
  md: "Medium",
  lg: "Large",
  xl: "XL",
  "2xl": "2XL",
  "3xl": "3XL",
};

function toRawSpacingValue(token: BuilderSpacingInput) {
  if (token === undefined || token === null) return undefined;
  const value = String(token).trim();
  return value.length > 0 ? value : undefined;
}

function isExplicitZeroValue(token: BuilderSpacingInput) {
  const value = toRawSpacingValue(token)?.toLowerCase();
  return value === "none" || value === "0" || value === "0px";
}

function parsePixelValue(value: string) {
  if (value.trim() === "0") return 0;
  const match = value.trim().match(/^(-?\d+(?:\.\d+)?)px$/i);
  return match ? Number(match[1]) : null;
}

function normalizeSpacingToken(
  token: BuilderSpacingInput,
  context: BuilderSpacingContext,
): BuilderSpacingToken | undefined {
  if (!token) return undefined;
  const value = String(token).trim().toLowerCase();
  if (!value) return undefined;
  if (value === "inherit") return "inherit";
  if (value === "0" || value === "0px") return "none";
  if (value in BUILDER_SPACING_SCALE) return value as BuilderSpacingToken;
  if (value === "small" || value === "medium" || value === "large") {
    return LEGACY_SPACING_BY_CONTEXT[context][value];
  }
  return undefined;
}

export function getDefaultSpacingToken(
  context: BuilderSpacingContext,
): Exclude<BuilderSpacingToken, "inherit"> {
  return DEFAULT_SPACING_BY_CONTEXT[context];
}

export function resolveBuilderSpacing(
  token: BuilderSpacingInput,
  context: BuilderSpacingContext,
  inheritedToken?: BuilderSpacingInput,
): ResolvedBuilderSpacing {
  const rawValue = toRawSpacingValue(token);
  const inheritedValue = toRawSpacingValue(inheritedToken);

  // 1. Check if local is custom pixel value (e.g. "25px")
  if (rawValue && rawValue !== "inherit") {
    const parsed = parsePixelValue(rawValue);
    if (parsed !== null) {
      return resolveBuilderSpacingCssValue(rawValue, context, "Local", rawValue);
    }
  }

  // 2. Check if local is inherit/undefined and inherited is custom pixel value
  if ((!rawValue || rawValue === "inherit") && inheritedValue) {
    const parsed = parsePixelValue(inheritedValue);
    if (parsed !== null) {
      return resolveBuilderSpacingCssValue(inheritedValue, context, "Global", inheritedValue);
    }
  }

  const normalized = normalizeSpacingToken(token, context);
  const inherited = normalizeSpacingToken(inheritedToken, context);
  const defaultToken = getDefaultSpacingToken(context);
  const source: BuilderSpacingSource =
    normalized && normalized !== "inherit"
      ? "Local"
      : inherited && inherited !== "inherit"
        ? "Global"
        : "Default";
  const resolvedToken =
    normalized && normalized !== "inherit"
      ? normalized
      : inherited && inherited !== "inherit"
        ? inherited
        : defaultToken;
  const px = BUILDER_SPACING_SCALE[resolvedToken];

  return {
    rawValue,
    inheritedValue,
    defaultToken,
    token: resolvedToken,
    px,
    css: `${px}px`,
    label: `${px}px`,
    shortLabel: px === 0 ? "0" : `${px}`,
    optionLabel: `${TOKEN_LABELS[resolvedToken]} (${px}px)`,
    source,
    sourceLabel: source,
    isExplicitZero: source === "Local" && isExplicitZeroValue(token),
  };
}

export function resolveBuilderSpacingCssValue(
  value: string | number,
  context: BuilderSpacingContext,
  source: BuilderSpacingSource = "Local",
  rawValue?: BuilderSpacingInput,
): ResolvedBuilderSpacing {
  const css =
    typeof value === "number"
      ? `${value}px`
      : value.trim() === "0"
        ? "0px"
        : value.trim();
  const parsedPx = parsePixelValue(css);
  const px = parsedPx ?? 0;
  const label = parsedPx !== null ? `${px}px` : css;

  return {
    rawValue: toRawSpacingValue(rawValue) ?? css,
    defaultToken: getDefaultSpacingToken(context),
    px,
    css,
    label,
    shortLabel: parsedPx !== null ? `${px}` : css,
    optionLabel: label,
    source,
    sourceLabel: source,
    isExplicitZero:
      source === "Local" && (isExplicitZeroValue(rawValue) || px === 0),
  };
}

export function getSpacingLabel(
  token: BuilderSpacingInput,
  context: BuilderSpacingContext,
  inheritedToken?: BuilderSpacingInput,
) {
  return resolveBuilderSpacing(token, context, inheritedToken).label;
}

export function getSpacingOptionLabel(
  token: BuilderSpacingInput,
  context: BuilderSpacingContext,
  inheritedToken?: BuilderSpacingInput,
) {
  return resolveBuilderSpacing(token, context, inheritedToken).optionLabel;
}

export function shouldShowSpacingLabel(
  token: BuilderSpacingInput,
  context: BuilderSpacingContext,
  inheritedToken?: BuilderSpacingInput,
  showZero = false,
) {
  return showZero || resolveBuilderSpacing(token, context, inheritedToken).px > 0;
}
