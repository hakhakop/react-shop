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
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  "2xl": 48,
  "3xl": 72,
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

const TOKEN_LABELS: Record<Exclude<BuilderSpacingToken, "inherit">, string> = {
  none: "0",
  xs: "XS",
  sm: "S",
  md: "M",
  lg: "L",
  xl: "XL",
  "2xl": "2XL",
  "3xl": "3XL",
};

function normalizeSpacingToken(
  token: BuilderSpacingInput,
  context: BuilderSpacingContext,
): BuilderSpacingToken | undefined {
  if (!token) return undefined;
  const value = String(token).trim().toLowerCase();
  if (!value) return undefined;
  if (value === "inherit") return "inherit";
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
) {
  const normalized = normalizeSpacingToken(token, context);
  const inherited = normalizeSpacingToken(inheritedToken, context);
  const resolvedToken =
    normalized && normalized !== "inherit"
      ? normalized
      : inherited && inherited !== "inherit"
        ? inherited
        : getDefaultSpacingToken(context);
  const px = BUILDER_SPACING_SCALE[resolvedToken];

  return {
    token: resolvedToken,
    px,
    css: `${px}px`,
    label: `${px}px`,
    shortLabel: px === 0 ? "0" : `${px}`,
    optionLabel: resolvedToken === "none" ? "0" : `${TOKEN_LABELS[resolvedToken]} ${px}`,
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
