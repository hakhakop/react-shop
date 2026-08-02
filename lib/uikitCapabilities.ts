/** Canonical UIkit capability contract used by the inspector and renderers. */
export type InspectorElementKind =
  | "section" | "row" | "column" | "heading" | "button" | "text"
  | "card" | "panel" | "divider" | "alert" | "accordion";

export const UIKIT_CAPABILITIES = {
  section: { variants: ["default", "muted", "primary", "secondary"], sizes: [], spacing: ["none", "small", "medium", "large"], alignment: ["left", "center", "right"], responsive: ["stack", "matchHeight"], typography: [], appearance: ["background", "container", "radius"], behavior: [] },
  row: { variants: [], sizes: [], spacing: ["none", "small", "medium", "large"], alignment: ["top", "center", "bottom", "between", "around"], responsive: ["matchHeight"], typography: [], appearance: ["gutter"], behavior: [] },
  column: { variants: [], sizes: ["full", "half", "third", "quarter"], spacing: [], alignment: ["left", "center", "right"], responsive: ["stack"], typography: [], appearance: [], behavior: [] },
  heading: { variants: [], sizes: ["small", "medium", "large", "xlarge", "h1", "h2", "h3", "h4", "h5", "h6"], spacing: [], alignment: ["left", "center", "right"], responsive: [], typography: ["fontFamily", "color", "textAlign"], appearance: [], behavior: [] },
  text: { variants: ["default", "lead", "meta", "small", "large", "muted"], sizes: [], spacing: [], alignment: ["left", "center", "right"], responsive: [], typography: ["fontFamily", "fontWeight", "lineHeight", "letterSpacing", "textTransform", "textDecoration", "color"], appearance: [], behavior: [] },
  button: { variants: ["default", "primary", "secondary", "text"], sizes: ["small", "default", "large"], spacing: [], alignment: [], responsive: [], typography: [], appearance: [], behavior: ["url", "target"] },
  card: { variants: ["default", "primary", "secondary", "blank"], sizes: ["small", "default", "large"], spacing: [], alignment: [], responsive: [], typography: [], appearance: [], behavior: ["hover"] },
  panel: { variants: ["default", "primary", "secondary", "blank"], sizes: ["small", "default", "large"], spacing: [], alignment: [], responsive: [], typography: [], appearance: ["media"], behavior: ["hover"] },
  divider: { variants: ["default", "small", "icon", "vertical"], sizes: [], spacing: [], alignment: [], responsive: [], typography: [], appearance: [], behavior: [] },
  alert: { variants: ["primary", "success", "warning", "danger"], sizes: [], spacing: [], alignment: [], responsive: [], typography: [], appearance: [], behavior: [] },
  accordion: { variants: [], sizes: [], spacing: [], alignment: [], responsive: [], typography: [], appearance: [], behavior: ["multiple", "collapsible", "initialOpen"] },
} as const satisfies Record<InspectorElementKind, Record<string, readonly string[]>>;

export const UIKIT_ACCORDION_CAPABILITY = {
  properties: {
    multiple: { values: ["enabled", "disabled"] as const, owner: "uikit" },
    collapsible: { values: ["enabled", "disabled"] as const, owner: "uikit" },
   initialOpen: { values: ["none", "first", "custom"] as const, owner: "uikit" },
    indicator: { values: ["none", "chevron", "plus-minus"] as const, owner: "uikit" },
    indicatorPosition: { values: ["start", "end"] as const, owner: "uikit" },
    rowStyle: { values: ["plain", "divided", "striped"] as const, owner: "webpages" },
    spacing: { values: ["compact", "default", "large"] as const, owner: "webpages" },
    titleEmphasis: { values: ["default", "bold"] as const, owner: "webpages" },
    openEmphasis: { values: ["none", "muted", "primary"] as const, owner: "webpages" },
    style: { values: ["default"] as const, owner: "uikit" },
    animation: { values: ["enabled"] as const, owner: "uikit" },
  },
} as const;

export const UIKIT_ROW_CAPABILITY = {
  properties: {
    layout: { values: ["1-col", "2-col-equal", "3-col-equal", "4-col-equal", "5-col-equal", "6-col-equal", "thirds-2-1", "thirds-1-2", "quarters-3-1", "quarters-1-3", "quarters-2-1-1", "quarters-1-1-2", "quarters-1-2-1", "auto-expand"] as const, owner: "uikit" },
    gutter: { values: ["none", "small", "medium", "large"] as const, owner: "uikit" },
    alignment: { values: ["top", "center", "bottom"] as const, owner: "uikit" },
    justification: { values: ["start", "center", "between", "around"] as const, owner: "uikit" },
    matchHeight: { values: ["enabled", "disabled"] as const, owner: "uikit" },
    spacing: { values: ["none", "small", "medium", "large"] as const, owner: "uikit" },
  },
} as const;

export const UIKIT_COLUMN_CAPABILITY = {
  properties: {
    horizontalAlignment: { values: ["left", "center", "right"] as const, owner: "uikit" },
    verticalAlignment: { values: ["top", "center", "bottom"] as const, owner: "uikit" },
    flexBehavior: { values: ["none", "expand"] as const, owner: "uikit" },
    responsiveWidth: { values: ["inherit", "stack"] as const, owner: "uikit" },
  },
} as const;

export const UIKIT_HEADING_CAPABILITY = {
  properties: {
    level: { values: ["h1", "h2", "h3", "h4", "h5", "h6"] as const, owner: "webpages" },
    visualPreset: { values: ["h1", "h2", "h3", "h4", "h5", "h6", "article-title", "small", "medium", "large", "xlarge"] as const, owner: "uikit" },
    alignment: { values: ["left", "center", "right"] as const, owner: "uikit" },
    typography: { values: ["fontFamily", "fontWeight", "lineHeight", "letterSpacing", "textTransform", "textDecoration", "textShadow", "color"] as const, owner: "webpages" },
    gradient: { values: ["none", "indigo-purple", "cyan-blue", "emerald-teal", "sunset-orange", "indigo-purple-cyan", "sunset-pink", "gold-amber", "custom"] as const, owner: "webpages" },
    typewriter: { values: ["enabled", "disabled"] as const, owner: "webpages" },
  },
} as const;

export const UIKIT_TEXT_CAPABILITY = {
  properties: {
    variant: { values: ["default", "lead", "meta", "small", "large", "muted"] as const, owner: "uikit" },
    alignment: { values: ["left", "center", "right"] as const, owner: "uikit" },
    typography: { values: ["fontFamily", "fontWeight", "lineHeight", "letterSpacing", "textTransform", "textDecoration", "color"] as const, owner: "webpages" },
  },
} as const;

export const UIKIT_BUTTON_CAPABILITY = {
  properties: {
    variant: { values: ["primary", "secondary", "default", "text"] as const, owner: "uikit" },
    size: { values: ["small", "default", "large"] as const, owner: "uikit" },
    width: { values: ["auto", "full"] as const, owner: "uikit", supported: false },
    alignment: { values: ["left", "center", "right"] as const, owner: "uikit", supported: false },
    iconPosition: { values: ["left", "right"] as const, owner: "webpages", supported: false },
    disabled: { values: ["enabled", "disabled"] as const, owner: "webpages", supported: false },
    loading: { values: ["idle", "loading"] as const, owner: "webpages", supported: false },
    typography: { values: [] as const, owner: "uikit", supported: false },
    spacing: { values: [] as const, owner: "uikit", supported: false },
    action: { values: ["label", "url", "target"] as const, owner: "webpages" },
  },
} as const;

/** Semantic Global Style ownership for the imported UIkit/YOOtheme Button domain. */
export const UIKIT_BUTTON_GLOBAL_CAPABILITY = {
  shared: ["fontFamily", "fontStyle", "fontWeight", "fontSize", "lineHeight", "letterSpacing", "textTransform", "borderMode", "borderRadius", "borderWidth", "transitionDuration", "paddingX", "backgroundSize", "backgroundPosition", "hoverBackgroundPosition", "backdropFilter"],
  sizes: ["smallFontSize", "smallLineHeight", "smallPaddingX", "smallRadius", "largeFontSize", "largeLineHeight", "largePaddingX", "largeRadius"],
  variants: ["default", "primary", "secondary", "danger", "disabled", "text", "link"],
  states: ["background", "text", "border", "shadow", "hoverBackground", "hoverText", "hoverBorder", "hoverShadow", "activeBackground", "activeText", "activeBorder", "activeShadow"],
  unsupported: ["textMode", "textIconMode", "textArrowImage", "inverseVariants"],
} as const;

export function getUikitCapabilities(kind?: string) {
  return UIKIT_CAPABILITIES[(kind as InspectorElementKind) ?? "section"] ?? UIKIT_CAPABILITIES.section;
}
