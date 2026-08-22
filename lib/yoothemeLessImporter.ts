import type { BuilderDesign } from "@/components/dashboard/builderTypes";
import type { BuilderShellSettings } from "@/lib/builderShell";
import { resolveYoothemeLessCapability } from "@/lib/yoothemeImportContract";
import { createYoothemeLessImportReport, type YoothemeImportReport } from "@/lib/yoothemeImportReport";

export type YoothemeLessSource = {
  name: string;
  content: string;
  precedence: number;
};

export type YoothemeImportStatus = "mapped" | "unsupported" | "conflict";

export type YoothemeImportRow = {
  source: string;
  variable: string;
  rawValue: string;
  resolvedValue?: string;
  destination?: string;
  status: YoothemeImportStatus;
  note?: string;
};

export type YoothemeDevstackPresetId =
  | "devstack-dark-purple"
  | "devstack-dark-red"
  | "devstack-light-blue"
  | "devstack-light-green"
  | "devstack-light-orange";

export type YoothemeDevstackPresetDefinition = {
  id: YoothemeDevstackPresetId;
  name: string;
  description: string;
  styleFile: string;
};

export const YOOTHEME_DEVSTACK_PRESETS: readonly YoothemeDevstackPresetDefinition[] = [
  { id: "devstack-dark-purple", name: "DevStack Dark Purple", description: "DevStack dark purple semantic style preset.", styleFile: "master-devstack/styles/dark-purple.less" },
  { id: "devstack-dark-red", name: "DevStack Dark Red", description: "DevStack dark red semantic style preset.", styleFile: "master-devstack/styles/dark-red.less" },
  { id: "devstack-light-blue", name: "DevStack Light Blue", description: "DevStack light blue semantic style preset.", styleFile: "master-devstack/styles/light-blue.less" },
  { id: "devstack-light-green", name: "DevStack Light Green", description: "DevStack light green semantic style preset.", styleFile: "master-devstack/styles/light-green.less" },
  { id: "devstack-light-orange", name: "DevStack Light Orange", description: "DevStack light orange semantic style preset.", styleFile: "master-devstack/styles/light-orange.less" },
];

export type YoothemeSemanticPreset = {
  id: YoothemeDevstackPresetId;
  name: string;
  description: string;
  shellSettings: Partial<BuilderShellSettings>;
  design: Partial<BuilderDesign>;
  rows: YoothemeImportRow[];
  unsupported: YoothemeImportRow[];
  conflicts: YoothemeImportRow[];
  /** Registry-backed report; rows remain for the existing Global Styles UI. */
  report: YoothemeImportReport;
  sources: string[];
};

/**
 * A YOOtheme LESS theme often relies on UIkit inheritance rather than
 * declaring every Button token. Keep that absence explicit: otherwise an
 * old WebPages component default can be mistaken for a source-authored
 * YOOtheme value after the new Global Style patch is merged.
 */
function resolveButtonTokenInheritance(
  declarations: Map<string, Declaration>,
): Record<string, "authored" | "inherit"> {
  const destinations = new Set<string>();
  const authored = new Set<string>();

  for (const [source, mapping] of Object.entries(destinationMap)) {
    if (!mapping.destination.startsWith("shellSettings.button")) continue;
    const destination = mapping.destination.replace("shellSettings.", "");
    destinations.add(destination);
    if (declarations.has(source)) authored.add(destination);
  }

  return Object.fromEntries(
    [...destinations].map((destination) => [
      destination,
      authored.has(destination) ? "authored" : "inherit",
    ]),
  );
}

type Declaration = {
  source: YoothemeLessSource;
  variable: string;
  rawValue: string;
  order: number;
};

const SUPPORTED_FUNCTIONS = new Set(["darken", "lighten", "fade", "mix"]);
const OPAQUE_CSS_FUNCTIONS = new Set(["rgb", "rgba", "hsl", "hsla", "url", "blur", "linear-gradient", "radial-gradient", "conic-gradient", "min", "max", "clamp", "color-mix"]);
const HEX_COLOR = /^#([0-9a-f]{3,8})$/i;

function stripComments(input: string) {
  let output = "";
  let quote = "";
  for (let index = 0; index < input.length; index += 1) {
    const char = input[index];
    const next = input[index + 1];
    if (quote) {
      output += char;
      if (char === "\\") output += next ?? "";
      else if (char === quote) quote = "";
      if (char === "\\") index += 1;
      continue;
    }
    if (char === "\"" || char === "'") {
      quote = char;
      output += char;
      continue;
    }
    if (char === "/" && next === "*") {
      index += 2;
      while (index < input.length && !(input[index] === "*" && input[index + 1] === "/")) index += 1;
      index += 1;
      output += " ";
      continue;
    }
    if (char === "/" && next === "/") {
      index += 2;
      while (index < input.length && input[index] !== "\n") index += 1;
      output += "\n";
      continue;
    }
    output += char;
  }
  return output;
}

function splitTopLevel(input: string, delimiter = ",") {
  const parts: string[] = [];
  let start = 0;
  let depth = 0;
  let quote = "";
  for (let index = 0; index < input.length; index += 1) {
    const char = input[index];
    if (quote) {
      if (char === "\\") index += 1;
      else if (char === quote) quote = "";
      continue;
    }
    if (char === "\"" || char === "'") {
      quote = char;
      continue;
    }
    if (char === "(") depth += 1;
    else if (char === ")") depth = Math.max(0, depth - 1);
    else if (char === delimiter && depth === 0) {
      parts.push(input.slice(start, index).trim());
      start = index + 1;
    }
  }
  parts.push(input.slice(start).trim());
  return parts.filter(Boolean);
}

function parseDeclarations(source: YoothemeLessSource): Declaration[] {
  const input = stripComments(source.content);
  const declarations: Declaration[] = [];
  let order = 0;
  for (let index = 0; index < input.length; index += 1) {
    if (input[index] !== "@" || !/[A-Za-z_-]/.test(input[index + 1] ?? "")) continue;
    const match = input.slice(index).match(/^@([A-Za-z0-9_-]+)\s*:/);
    if (!match) continue;
    const variable = match[1];
    const valueStart = index + match[0].length;
    let depth = 0;
    let quote = "";
    let end = valueStart;
    for (; end < input.length; end += 1) {
      const char = input[end];
      if (quote) {
        if (char === "\\") end += 1;
        else if (char === quote) quote = "";
        continue;
      }
      if (char === "\"" || char === "'") quote = char;
      else if (char === "(") depth += 1;
      else if (char === ")") depth = Math.max(0, depth - 1);
      else if (char === ";" && depth === 0) break;
    }
    const rawValue = input.slice(valueStart, end).trim();
    if (rawValue) declarations.push({ source, variable, rawValue, order: order++ });
    index = end;
  }
  return declarations;
}

function parseColor(value: string): [number, number, number, number] | null {
  const trimmed = value.trim();
  const hex = trimmed.match(HEX_COLOR);
  if (hex) {
    const raw = hex[1];
    const full = raw.length <= 4 ? raw.split("").map((char) => char + char).join("") : raw;
    const rgb = full.length >= 6 ? full.slice(0, 6) : "";
    if (!rgb) return null;
    const alpha = full.length >= 8 ? parseInt(full.slice(6, 8), 16) / 255 : 1;
    return [parseInt(rgb.slice(0, 2), 16), parseInt(rgb.slice(2, 4), 16), parseInt(rgb.slice(4, 6), 16), alpha];
  }
  const rgba = trimmed.match(/^rgba?\(([^)]+)\)$/i);
  if (rgba) {
    const values = rgba[1].split(",").map((part) => part.trim());
    if (values.length < 3) return null;
    return [Number.parseFloat(values[0]), Number.parseFloat(values[1]), Number.parseFloat(values[2]), values[3] ? Number.parseFloat(values[3]) : 1];
  }
  return null;
}

function formatColor(color: [number, number, number, number]) {
  const [r, g, b, alpha] = color.map((value, index) => index === 3 ? value : Math.round(Math.max(0, Math.min(255, value)))) as [number, number, number, number];
  if (alpha >= 0.999) return `#${[r, g, b].map((value) => value.toString(16).padStart(2, "0")).join("")}`;
  return `rgba(${r}, ${g}, ${b}, ${Math.round(alpha * 1000) / 1000})`;
}

function percentage(value: string) {
  const parsed = Number.parseFloat(value.trim());
  return value.includes("%") ? parsed / 100 : parsed / 100;
}

function evaluateFunction(name: string, args: string[]) {
  const colors = args.map(parseColor);
  if (name === "fade") {
    if (!colors[0] || !args[1]) return null;
    return formatColor([colors[0][0], colors[0][1], colors[0][2], Math.max(0, Math.min(1, percentage(args[1]))) * colors[0][3]]);
  }
  if (name === "darken" || name === "lighten") {
    if (!colors[0] || !args[1]) return null;
    const amount = Math.max(0, Math.min(1, percentage(args[1])));
    const factor = name === "darken" ? 1 - amount : 1 + amount;
    return formatColor([colors[0][0] * factor, colors[0][1] * factor, colors[0][2] * factor, colors[0][3]]);
  }
  if (name === "mix") {
    if (!colors[0] || !colors[1]) return null;
    const weight = args[2] ? Math.max(0, Math.min(1, percentage(args[2]))) : 0.5;
    return formatColor([
      colors[0][0] * weight + colors[1][0] * (1 - weight),
      colors[0][1] * weight + colors[1][1] * (1 - weight),
      colors[0][2] * weight + colors[1][2] * (1 - weight),
      colors[0][3] * weight + colors[1][3] * (1 - weight),
    ]);
  }
  return null;
}

function resolveExpression(raw: string, values: Map<string, string>, trail: string[] = []): { value?: string; reason?: string } {
  let value = raw.trim();
  const references = [...value.matchAll(/@([A-Za-z0-9_-]+)/g)].map((match) => match[1]);
  for (const reference of references) {
    if (trail.includes(reference)) return { reason: `Circular variable reference: ${[...trail, reference].join(" → ")}` };
    const referenced = values.get(reference);
    if (referenced === undefined) return { reason: `Unresolved variable @${reference}` };
    const resolved = resolveExpression(referenced, values, [...trail, reference]);
    if (!resolved.value) return resolved;
    value = value.replace(new RegExp(`@${reference}\\b`, "g"), resolved.value);
  }

  // UIkit theme layers use this compact form for dropdown offsets. Resolve
  // only same-unit subtraction; other arithmetic remains intentionally
  // unsupported rather than being guessed into a canonical style value.
  const dimensionSubtraction = /^-?\(\s*(-?(?:\d+\.?\d*|\.\d+))(px|rem|em|%|vh|vw)\s*-\s*(-?(?:\d+\.?\d*|\.\d+))\2\s*\)$/.exec(value);
  if (dimensionSubtraction) {
    const sign = value.trim().startsWith("-") ? -1 : 1;
    value = `${sign * (Number(dimensionSubtraction[1]) - Number(dimensionSubtraction[3]))}${dimensionSubtraction[2]}`;
  }

  let changed = true;
  while (changed) {
    changed = false;
    for (let index = 0; index < value.length; index += 1) {
      const match = value.slice(index).match(/^([a-z-]+)\(/i);
      if (!match) continue;
      const name = match[1].toLowerCase();
      let depth = 1;
      let end = index + match[0].length;
      for (; end < value.length; end += 1) {
        if (value[end] === "(") depth += 1;
        else if (value[end] === ")") {
          depth -= 1;
          if (depth === 0) break;
        }
      }
      if (depth !== 0) return { reason: `Unbalanced function expression: ${value.slice(index)}` };
      if (!SUPPORTED_FUNCTIONS.has(name)) {
        if (OPAQUE_CSS_FUNCTIONS.has(name)) {
          // CSS functions such as linear-gradient() are retained as CSS, but
          // their arguments can still contain YOOtheme LESS color functions.
          // Resolve those nested expressions before persisting the CSS value.
          const args = splitTopLevel(value.slice(index + match[0].length, end));
          const resolvedArgs = args.map((arg) => resolveExpression(arg, values, trail));
          if (resolvedArgs.some((arg) => !arg.value)) return { reason: resolvedArgs.find((arg) => !arg.value)?.reason };
          const resolvedCssFunction = `${name}(${resolvedArgs.map((arg) => arg.value).join(", ")})`;
          if (resolvedCssFunction !== value.slice(index, end + 1)) {
            value = `${value.slice(0, index)}${resolvedCssFunction}${value.slice(end + 1)}`;
            changed = true;
            break;
          }
          index = end;
          continue;
        }
        return { reason: `Unsupported LESS function ${name}()` };
      }
      const args = splitTopLevel(value.slice(index + match[0].length, end));
      const evaluatedArgs = args.map((arg) => resolveExpression(arg, values, trail));
      if (evaluatedArgs.some((arg) => !arg.value)) return { reason: evaluatedArgs.find((arg) => !arg.value)?.reason };
      const evaluated = evaluateFunction(name, evaluatedArgs.map((arg) => arg.value!));
      if (!evaluated) return { reason: `Could not evaluate ${name}(${args.join(", ")})` };
      value = `${value.slice(0, index)}${evaluated}${value.slice(end + 1)}`;
      changed = true;
      break;
    }
  }
  if (value.includes("@") || /~|calc\(|var\(|when\s*\(|\+\s*\d|\d\s*\+/.test(value)) return { reason: `Unsupported expression: ${raw}` };
  return { value: value.replace(/^['"]|['"]$/g, "").trim() };
}

function getLatestDeclarations(sources: YoothemeLessSource[]) {
  const declarations = sources.flatMap(parseDeclarations).sort((a, b) => a.source.precedence - b.source.precedence || a.order - b.order);
  const latest = new Map<string, Declaration>();
  const all = new Map<string, Declaration[]>();
  for (const declaration of declarations) {
    latest.set(declaration.variable, declaration);
    all.set(declaration.variable, [...(all.get(declaration.variable) ?? []), declaration]);
  }
  return { latest, all };
}

const destinationMap: Record<string, { destination: string; domain: string }> = {
  "global-font-family": { destination: "shellSettings.fontFamilyBody", domain: "Typography" },
  "global-font-size": { destination: "shellSettings.baseFontSize", domain: "Typography" },
  "global-line-height": { destination: "shellSettings.baseLineHeight", domain: "Typography" },
  "global-small-font-size": { destination: "shellSettings.fontSizeSmall", domain: "Typography" },
  "global-medium-font-size": { destination: "shellSettings.fontSizeMedium", domain: "Typography" },
  "global-large-font-size": { destination: "shellSettings.fontSizeLarge", domain: "Typography" },
  "global-xlarge-font-size": { destination: "shellSettings.fontSizeXLarge", domain: "Typography" },
  "global-2xlarge-font-size": { destination: "shellSettings.fontSize2XLarge", domain: "Typography" },
  "global-primary-font-family": { destination: "shellSettings.fontFamilyPrimary", domain: "Typography" },
  "global-primary-font-style": { destination: "shellSettings.fontStylePrimary", domain: "Typography" },
  "global-primary-font-weight": { destination: "shellSettings.fontWeightPrimary", domain: "Typography" },
  "global-primary-letter-spacing": { destination: "shellSettings.letterSpacingPrimary", domain: "Typography" },
  "global-primary-text-transform": { destination: "shellSettings.textTransformPrimary", domain: "Typography" },
  "global-secondary-font-family": { destination: "shellSettings.fontFamilySecondary", domain: "Typography" },
  "global-secondary-font-style": { destination: "shellSettings.fontStyleSecondary", domain: "Typography" },
  "global-secondary-font-weight": { destination: "shellSettings.fontWeightSecondary", domain: "Typography" },
  "global-secondary-letter-spacing": { destination: "shellSettings.letterSpacingSecondary", domain: "Typography" },
  "global-secondary-text-transform": { destination: "shellSettings.textTransformSecondary", domain: "Typography" },
  "global-tertiary-font-family": { destination: "shellSettings.fontFamilyTertiary", domain: "Typography" },
  "global-tertiary-font-style": { destination: "shellSettings.fontStyleTertiary", domain: "Typography" },
  "global-tertiary-font-weight": { destination: "shellSettings.fontWeightTertiary", domain: "Typography" },
  "global-tertiary-letter-spacing": { destination: "shellSettings.letterSpacingTertiary", domain: "Typography" },
  "global-tertiary-text-transform": { destination: "shellSettings.textTransformTertiary", domain: "Typography" },
  "global-color": { destination: "shellSettings.textColor", domain: "Colors" },
  "global-inverse-color": { destination: "shellSettings.inverseColor", domain: "Colors" },
  "global-emphasis-color": { destination: "shellSettings.emphasisColor", domain: "Colors" },
  "global-muted-color": { destination: "shellSettings.mutedTextColor", domain: "Colors" },
  "global-link-color": { destination: "shellSettings.linkColor", domain: "Colors" },
  "global-link-hover-color": { destination: "shellSettings.linkHoverColor", domain: "Colors" },
  "global-background": { destination: "shellSettings.backgroundDefault", domain: "Background" },
  "global-muted-background": { destination: "shellSettings.backgroundMuted", domain: "Background" },
  "global-primary-background": { destination: "shellSettings.backgroundPrimary", domain: "Background" },
  "global-secondary-background": { destination: "shellSettings.backgroundSecondary", domain: "Background" },
  "global-success-background": { destination: "shellSettings.successColor", domain: "Colors" },
  "global-warning-background": { destination: "shellSettings.warningColor", domain: "Colors" },
  "global-danger-background": { destination: "shellSettings.dangerColor", domain: "Colors" },
  "global-border-width": { destination: "shellSettings.borderWidth", domain: "Surfaces" },
  "global-border": { destination: "shellSettings.borderColor", domain: "Surfaces" },
  "global-border-radius": { destination: "shellSettings.borderRadius", domain: "Surfaces" },
  "global-small-box-shadow": { destination: "shellSettings.shadowSmall", domain: "Surfaces" },
  "global-medium-box-shadow": { destination: "shellSettings.shadowMedium", domain: "Surfaces" },
  "global-large-box-shadow": { destination: "shellSettings.shadowLarge", domain: "Surfaces" },
  "global-xlarge-box-shadow": { destination: "shellSettings.shadowXLarge", domain: "Surfaces" },
  "global-small-margin": { destination: "shellSettings.marginSmall", domain: "Spacing" },
  "global-margin": { destination: "shellSettings.marginDefault", domain: "Spacing" },
  "global-medium-margin": { destination: "shellSettings.marginMedium", domain: "Spacing" },
  "global-large-margin": { destination: "shellSettings.marginLarge", domain: "Spacing" },
  "global-xlarge-margin": { destination: "shellSettings.marginXLarge", domain: "Spacing" },
  "global-small-gutter": { destination: "shellSettings.gridGutterSmall", domain: "Spacing" },
  "global-gutter": { destination: "shellSettings.gridGutterDefault", domain: "Spacing" },
  "global-medium-gutter": { destination: "shellSettings.gridGutterMedium", domain: "Spacing" },
  "global-large-gutter": { destination: "shellSettings.gridGutterLarge", domain: "Spacing" },
  "global-control-small-height": { destination: "shellSettings.controlHeightSmall", domain: "Buttons" },
  "global-control-height": { destination: "shellSettings.controlHeightDefault", domain: "Controls" },
  "global-control-large-height": { destination: "shellSettings.controlHeightLarge", domain: "Buttons" },
  "global-z-index": { destination: "shellSettings.globalZIndex", domain: "Layout" },
  "breakpoint-small": { destination: "shellSettings.breakpointSmall", domain: "Layout" },
  "breakpoint-medium": { destination: "shellSettings.breakpointMedium", domain: "Layout" },
  "breakpoint-large": { destination: "shellSettings.breakpointLarge", domain: "Layout" },
  "breakpoint-xlarge": { destination: "shellSettings.breakpointXLarge", domain: "Layout" },
  "section-xsmall-padding-vertical": { destination: "shellSettings.sectionPaddingXSmall", domain: "Sections" },
  "section-small-padding-vertical": { destination: "shellSettings.sectionPaddingSmall", domain: "Sections" },
  "section-padding-vertical": { destination: "shellSettings.sectionPaddingDefault", domain: "Sections" },
  "section-large-padding-vertical": { destination: "shellSettings.sectionPaddingLarge", domain: "Sections" },
  "section-xlarge-padding-vertical": { destination: "shellSettings.sectionPaddingXLarge", domain: "Sections" },
  "container-small-max-width": { destination: "shellSettings.containerSmall", domain: "Containers and page" },
  "container-xsmall-max-width": { destination: "shellSettings.containerXSmall", domain: "Containers and page" },
  "container-max-width": { destination: "shellSettings.containerDefault", domain: "Containers and page" },
  "container-large-max-width": { destination: "shellSettings.containerLarge", domain: "Containers and page" },
  "container-xlarge-max-width": { destination: "shellSettings.containerXLarge", domain: "Containers and page" },
  "container-padding-horizontal": { destination: "shellSettings.containerPaddingHorizontal", domain: "Containers and page" },
  "container-padding-horizontal-s": { destination: "shellSettings.containerPaddingHorizontalSmall", domain: "Containers and page" },
  "container-padding-horizontal-m": { destination: "shellSettings.containerPaddingHorizontalMedium", domain: "Containers and page" },
  "theme-page-container-width": { destination: "shellSettings.pageContainerMaxWidth", domain: "Containers and page" },
  "card-default-background": { destination: "shellSettings.cardBackground", domain: "Surfaces" },
  "card-primary-background": { destination: "shellSettings.cardPrimaryBackground", domain: "Surfaces" },
  "card-secondary-background": { destination: "shellSettings.cardSecondaryBackground", domain: "Surfaces" },
  // DevStack expresses the visual Primary/Secondary card surfaces through
  // internal gradient tokens rather than UIkit's plain card-* backgrounds.
  // Both names normalize into the same visible Card Background owners.
  "internal-card-primary-gradient": { destination: "shellSettings.cardPrimaryBackground", domain: "Cards" },
  "internal-card-secondary-gradient": { destination: "shellSettings.cardSecondaryBackground", domain: "Cards" },
  "card-hover-background": { destination: "shellSettings.cardDefaultHoverBackground", domain: "Cards" },
  "card-border-radius": { destination: "shellSettings.cardBorderRadius", domain: "Surfaces" },
  "card-default-border": { destination: "shellSettings.cardDefaultBorder", domain: "Cards" },
  "card-primary-border": { destination: "shellSettings.cardPrimaryBorder", domain: "Cards" },
  "card-secondary-border": { destination: "shellSettings.cardSecondaryBorder", domain: "Cards" },
  "card-border-width": { destination: "shellSettings.cardBorderWidth", domain: "Cards" },
  "card-transition-duration": { destination: "shellSettings.cardTransitionDuration", domain: "Cards" },
  "card-default-box-shadow": { destination: "shellSettings.cardShadow", domain: "Surfaces" },
  "card-default-hover-box-shadow": { destination: "shellSettings.cardShadowHover", domain: "Surfaces" },
  "alert-background": { destination: "shellSettings.alertBackground", domain: "Alert" },
  "alert-color": { destination: "shellSettings.alertColor", domain: "Alert" },
  "alert-border-radius": { destination: "shellSettings.alertBorderRadius", domain: "Alert" },
  "alert-primary-background": { destination: "shellSettings.alertPrimaryBackground", domain: "Alert" },
  "alert-primary-color": { destination: "shellSettings.alertPrimaryColor", domain: "Alert" },
  "alert-success-background": { destination: "shellSettings.alertSuccessBackground", domain: "Alert" },
  "alert-success-color": { destination: "shellSettings.alertSuccessColor", domain: "Alert" },
  "alert-warning-background": { destination: "shellSettings.alertWarningBackground", domain: "Alert" },
  "alert-warning-color": { destination: "shellSettings.alertWarningColor", domain: "Alert" },
  "alert-danger-background": { destination: "shellSettings.alertDangerBackground", domain: "Alert" },
  "alert-danger-color": { destination: "shellSettings.alertDangerColor", domain: "Alert" },
  "button-primary-background": { destination: "shellSettings.buttonPrimaryBackground", domain: "Buttons" },
  "button-primary-color": { destination: "shellSettings.buttonPrimaryText", domain: "Buttons" },
  "button-primary-text": { destination: "shellSettings.buttonPrimaryText", domain: "Buttons" },
  "button-default-background": { destination: "shellSettings.buttonDefaultBackground", domain: "Buttons" },
  "button-default-color": { destination: "shellSettings.buttonDefaultText", domain: "Buttons" },
  "button-secondary-background": { destination: "shellSettings.buttonSecondaryBackground", domain: "Buttons" },
  "button-text-color": { destination: "shellSettings.buttonTextColorSemantic", domain: "Buttons" },
  "button-border-width": { destination: "shellSettings.buttonBorderWidth", domain: "Buttons" },
  "button-border-radius": { destination: "shellSettings.buttonRadius", domain: "Buttons" },
  "button-primary-hover-background": { destination: "shellSettings.buttonHoverBg", domain: "Buttons" },
  "button-primary-hover-color": { destination: "shellSettings.buttonPrimaryHoverText", domain: "Buttons" },
  "button-primary-hover-box-shadow": { destination: "shellSettings.buttonPrimaryHoverShadow", domain: "Buttons" },
  "button-primary-hover-gradient": { destination: "shellSettings.buttonPrimaryHoverGradient", domain: "Buttons" },
  "button-font-size": { destination: "shellSettings.buttonFontSize", domain: "Buttons" },
  "button-large-font-size": { destination: "shellSettings.buttonLargeFontSize", domain: "Buttons" },
  "button-font-family": { destination: "shellSettings.buttonFontFamily", domain: "Buttons" },
  "button-font-style": { destination: "shellSettings.buttonFontStyle", domain: "Buttons" },
  "button-font-weight": { destination: "shellSettings.buttonFontWeight", domain: "Buttons" },
  "button-line-height": { destination: "shellSettings.buttonLineHeight", domain: "Buttons" },
  "button-text-transform": { destination: "shellSettings.buttonTextTransform", domain: "Buttons" },
  "button-border-mode": { destination: "shellSettings.buttonBorderMode", domain: "Buttons" },
  "button-background-size": { destination: "shellSettings.buttonBackgroundSize", domain: "Buttons" },
  "button-background-position-x": { destination: "shellSettings.buttonBackgroundPosition", domain: "Buttons" },
  "button-hover-background-position-x": { destination: "shellSettings.buttonHoverBackgroundPosition", domain: "Buttons" },
  "button-small-font-size": { destination: "shellSettings.buttonSmallFontSize", domain: "Buttons" },
  "button-small-line-height": { destination: "shellSettings.buttonSmallLineHeight", domain: "Buttons" },
  "button-small-padding-horizontal": { destination: "shellSettings.buttonSmallPaddingX", domain: "Buttons" },
  "button-small-border-radius": { destination: "shellSettings.buttonSmallRadius", domain: "Buttons" },
  "button-large-line-height": { destination: "shellSettings.buttonLargeLineHeight", domain: "Buttons" },
  "button-large-padding-horizontal": { destination: "shellSettings.buttonLargePaddingX", domain: "Buttons" },
  "button-large-border-radius": { destination: "shellSettings.buttonLargeRadius", domain: "Buttons" },
  "button-default-hover-background": { destination: "shellSettings.buttonDefaultHoverBackground", domain: "Buttons" },
  "button-default-hover-color": { destination: "shellSettings.buttonDefaultHoverText", domain: "Buttons" },
  "button-secondary-hover-background": { destination: "shellSettings.buttonSecondaryHoverBackground", domain: "Buttons" },
  "button-secondary-color": { destination: "shellSettings.buttonSecondaryText", domain: "Buttons" },
  "button-secondary-hover-color": { destination: "shellSettings.buttonSecondaryHoverText", domain: "Buttons" },
  "button-default-active-background": { destination: "shellSettings.buttonDefaultActiveBackground", domain: "Buttons" },
  "button-default-active-color": { destination: "shellSettings.buttonDefaultActiveText", domain: "Buttons" },
  "button-default-border": { destination: "shellSettings.buttonDefaultBorder", domain: "Buttons" },
  "button-default-hover-border": { destination: "shellSettings.buttonDefaultHoverBorder", domain: "Buttons" },
  "button-default-active-border": { destination: "shellSettings.buttonDefaultActiveBorder", domain: "Buttons" },
  "button-default-active-box-shadow": { destination: "shellSettings.buttonDefaultActiveShadow", domain: "Buttons" },
  "button-primary-hover-border": { destination: "shellSettings.buttonPrimaryHoverBorder", domain: "Buttons" },
  "button-primary-active-background": { destination: "shellSettings.buttonPrimaryActiveBackground", domain: "Buttons" },
  "button-primary-active-color": { destination: "shellSettings.buttonPrimaryActiveText", domain: "Buttons" },
  "button-primary-active-border": { destination: "shellSettings.buttonPrimaryActiveBorder", domain: "Buttons" },
  "button-primary-active-box-shadow": { destination: "shellSettings.buttonPrimaryActiveShadow", domain: "Buttons" },
  "button-secondary-border": { destination: "shellSettings.buttonSecondaryBorder", domain: "Buttons" },
  "button-secondary-hover-border": { destination: "shellSettings.buttonSecondaryHoverBorder", domain: "Buttons" },
  "button-secondary-active-background": { destination: "shellSettings.buttonSecondaryActiveBackground", domain: "Buttons" },
  "button-secondary-active-color": { destination: "shellSettings.buttonSecondaryActiveText", domain: "Buttons" },
  "button-secondary-active-border": { destination: "shellSettings.buttonSecondaryActiveBorder", domain: "Buttons" },
  "button-secondary-active-box-shadow": { destination: "shellSettings.buttonSecondaryActiveShadow", domain: "Buttons" },
  // UIkit/YOOtheme keeps inverse Button values in the same global Button
  // domain. Preserve them as semantic tokens rather than folding them into
  // normal Button styles, which would corrupt light-surface rendering.
  "inverse-button-default-background": { destination: "shellSettings.buttonInverseDefaultBackground", domain: "Buttons" },
  "inverse-button-default-color": { destination: "shellSettings.buttonInverseDefaultText", domain: "Buttons" },
  "inverse-button-default-hover-background": { destination: "shellSettings.buttonInverseDefaultHoverBackground", domain: "Buttons" },
  "inverse-button-default-hover-color": { destination: "shellSettings.buttonInverseDefaultHoverText", domain: "Buttons" },
  "inverse-button-default-active-background": { destination: "shellSettings.buttonInverseDefaultActiveBackground", domain: "Buttons" },
  "inverse-button-default-active-color": { destination: "shellSettings.buttonInverseDefaultActiveText", domain: "Buttons" },
  "inverse-button-default-border": { destination: "shellSettings.buttonInverseDefaultBorder", domain: "Buttons" },
  "inverse-button-default-hover-border": { destination: "shellSettings.buttonInverseDefaultHoverBorder", domain: "Buttons" },
  "inverse-button-default-active-border": { destination: "shellSettings.buttonInverseDefaultActiveBorder", domain: "Buttons" },
  "inverse-button-default-box-shadow": { destination: "shellSettings.buttonInverseDefaultShadow", domain: "Buttons" },
  "inverse-button-primary-box-shadow": { destination: "shellSettings.buttonInversePrimaryShadow", domain: "Buttons" },
  "inverse-button-secondary-background": { destination: "shellSettings.buttonInverseSecondaryBackground", domain: "Buttons" },
  "inverse-button-secondary-color": { destination: "shellSettings.buttonInverseSecondaryText", domain: "Buttons" },
  "inverse-button-secondary-hover-background": { destination: "shellSettings.buttonInverseSecondaryHoverBackground", domain: "Buttons" },
  "inverse-button-secondary-active-background": { destination: "shellSettings.buttonInverseSecondaryActiveBackground", domain: "Buttons" },
  "inverse-button-secondary-border": { destination: "shellSettings.buttonInverseSecondaryBorder", domain: "Buttons" },
  "inverse-button-secondary-hover-color": { destination: "shellSettings.buttonInverseSecondaryHoverText", domain: "Buttons" },
  "inverse-button-secondary-active-color": { destination: "shellSettings.buttonInverseSecondaryActiveText", domain: "Buttons" },
  "button-danger-background": { destination: "shellSettings.buttonDangerBackground", domain: "Buttons" },
  "button-danger-color": { destination: "shellSettings.buttonDangerText", domain: "Buttons" },
  "button-danger-border": { destination: "shellSettings.buttonDangerBorder", domain: "Buttons" },
  "button-danger-hover-background": { destination: "shellSettings.buttonDangerHoverBackground", domain: "Buttons" },
  "button-danger-hover-color": { destination: "shellSettings.buttonDangerHoverText", domain: "Buttons" },
  "button-danger-hover-border": { destination: "shellSettings.buttonDangerHoverBorder", domain: "Buttons" },
  "button-danger-hover-box-shadow": { destination: "shellSettings.buttonDangerHoverShadow", domain: "Buttons" },
  "button-danger-active-background": { destination: "shellSettings.buttonDangerActiveBackground", domain: "Buttons" },
  "button-danger-active-color": { destination: "shellSettings.buttonDangerActiveText", domain: "Buttons" },
  "button-danger-active-border": { destination: "shellSettings.buttonDangerActiveBorder", domain: "Buttons" },
  "button-danger-active-box-shadow": { destination: "shellSettings.buttonDangerActiveShadow", domain: "Buttons" },
  "button-disabled-background": { destination: "shellSettings.buttonDisabledBackground", domain: "Buttons" },
  "button-disabled-color": { destination: "shellSettings.buttonDisabledText", domain: "Buttons" },
  "button-disabled-border": { destination: "shellSettings.buttonDisabledBorder", domain: "Buttons" },
  "button-text-background": { destination: "shellSettings.buttonTextBackground", domain: "Buttons" },
  "button-text-border": { destination: "shellSettings.buttonTextBorder", domain: "Buttons" },
  "button-text-hover-border": { destination: "shellSettings.buttonTextHoverBorder", domain: "Buttons" },
  "button-text-active-color": { destination: "shellSettings.buttonTextActiveColor", domain: "Buttons" },
  "button-link-color": { destination: "shellSettings.buttonLinkColor", domain: "Buttons" },
  "button-link-hover-color": { destination: "shellSettings.buttonLinkHoverColor", domain: "Buttons" },
  "button-backdrop-filter": { destination: "shellSettings.buttonBackdropFilter", domain: "Buttons" },
  "button-text-hover-color": { destination: "shellSettings.buttonTextHoverColor", domain: "Buttons" },
  "button-transition-duration": { destination: "shellSettings.buttonTransitionDuration", domain: "Buttons" },
  "internal-button-primary-gradient": { destination: "shellSettings.buttonPrimaryGradient", domain: "Buttons" },
  "internal-button-primary-hover-gradient": { destination: "shellSettings.buttonPrimaryHoverGradient", domain: "Buttons" },
  "internal-button-primary-active-gradient": { destination: "shellSettings.buttonPrimaryActiveGradient", domain: "Buttons" },
  "internal-button-secondary-hover-gradient": { destination: "shellSettings.buttonSecondaryHoverGradient", domain: "Buttons" },
  "internal-button-secondary-active-gradient": { destination: "shellSettings.buttonSecondaryActiveGradient", domain: "Buttons" },
  "internal-button-default-mode": { destination: "shellSettings.buttonDefaultMode", domain: "Buttons" },
  "internal-button-default-glow-gradient": { destination: "shellSettings.buttonDefaultGlowGradient", domain: "Buttons" },
  "internal-button-default-glow-filter": { destination: "shellSettings.buttonDefaultGlowFilter", domain: "Buttons" },
  "internal-button-default-hover-glow-filter": { destination: "shellSettings.buttonDefaultHoverGlowFilter", domain: "Buttons" },
  "internal-button-primary-mode": { destination: "shellSettings.buttonPrimaryMode", domain: "Buttons" },
  "internal-button-primary-glow-gradient": { destination: "shellSettings.buttonPrimaryGlowGradient", domain: "Buttons" },
  "internal-button-primary-glow-filter": { destination: "shellSettings.buttonPrimaryGlowFilter", domain: "Buttons" },
  "internal-button-primary-hover-glow-filter": { destination: "shellSettings.buttonPrimaryHoverGlowFilter", domain: "Buttons" },
  "internal-button-secondary-mode": { destination: "shellSettings.buttonSecondaryMode", domain: "Buttons" },
  "internal-button-secondary-glow-gradient": { destination: "shellSettings.buttonSecondaryGlowGradient", domain: "Buttons" },
  "internal-button-secondary-glow-filter": { destination: "shellSettings.buttonSecondaryGlowFilter", domain: "Buttons" },
  "internal-button-secondary-hover-glow-filter": { destination: "shellSettings.buttonSecondaryHoverGlowFilter", domain: "Buttons" },
  "theme-box-decoration-border-radius": { destination: "shellSettings.themeBoxDecorationBorderRadius", domain: "Images" },
  "theme-box-decoration-default-gradient": { destination: "shellSettings.themeBoxDecorationDefaultGradient", domain: "Images" },
  "theme-box-decoration-primary-glow-filter": { destination: "shellSettings.themeBoxDecorationPrimaryGlowFilter", domain: "Images" },
  "theme-box-decoration-primary-glow-gradient": { destination: "shellSettings.themeBoxDecorationPrimaryGlowGradient", domain: "Images" },
  "theme-box-decoration-primary-background": { destination: "shellSettings.themeBoxDecorationPrimaryBackground", domain: "Images" },
  "theme-box-decoration-primary-border": { destination: "shellSettings.themeBoxDecorationPrimaryBorder", domain: "Images" },
  "theme-box-decoration-secondary-glow-filter": { destination: "shellSettings.themeBoxDecorationSecondaryGlowFilter", domain: "Images" },
  "theme-box-decoration-secondary-background": { destination: "shellSettings.themeBoxDecorationSecondaryBackground", domain: "Images" },
  "theme-box-decoration-secondary-border": { destination: "shellSettings.themeBoxDecorationSecondaryBorder", domain: "Images" },
  "internal-section-default-gradient": { destination: "shellSettings.backgroundDefaultGradient", domain: "Sections" },
  "internal-section-primary-gradient": { destination: "shellSettings.backgroundPrimaryGradient", domain: "Sections" },
  "button-default-box-shadow": { destination: "shellSettings.buttonDefaultShadow", domain: "Buttons" },
  "button-default-hover-box-shadow": { destination: "shellSettings.buttonDefaultHoverShadow", domain: "Buttons" },
  "button-primary-box-shadow": { destination: "shellSettings.buttonPrimaryShadow", domain: "Buttons" },
  "button-secondary-box-shadow": { destination: "shellSettings.buttonSecondaryShadow", domain: "Buttons" },
  "button-secondary-hover-box-shadow": { destination: "shellSettings.buttonSecondaryHoverShadow", domain: "Buttons" },
  "card-default-hover-background": { destination: "shellSettings.cardDefaultHoverBackground", domain: "Cards" },
  "card-primary-hover-background": { destination: "shellSettings.cardPrimaryHoverBackground", domain: "Cards" },
  "card-secondary-hover-background": { destination: "shellSettings.cardSecondaryHoverBackground", domain: "Cards" },
  "card-default-hover-border": { destination: "shellSettings.cardDefaultHoverBorder", domain: "Cards" },
  "card-primary-hover-border": { destination: "shellSettings.cardPrimaryHoverBorder", domain: "Cards" },
  "card-secondary-hover-border": { destination: "shellSettings.cardSecondaryHoverBorder", domain: "Cards" },
  "card-hover-box-shadow": { destination: "shellSettings.cardHoverShadow", domain: "Cards" },
  "card-primary-box-shadow": { destination: "shellSettings.cardPrimaryShadow", domain: "Cards" },
  "card-primary-hover-box-shadow": { destination: "shellSettings.cardPrimaryHoverShadow", domain: "Cards" },
  "card-secondary-box-shadow": { destination: "shellSettings.cardSecondaryShadow", domain: "Cards" },
  "card-secondary-hover-box-shadow": { destination: "shellSettings.cardSecondaryHoverShadow", domain: "Cards" },
  "card-body-padding-small": { destination: "shellSettings.cardPaddingSmall", domain: "Cards" },
  "card-body-padding": { destination: "shellSettings.cardPaddingDefault", domain: "Cards" },
  "card-body-padding-large": { destination: "shellSettings.cardPaddingLarge", domain: "Cards" },
  "heading-small-font-size-m": { destination: "shellSettings.headingSmallFontSizeResponsive", domain: "Heading" },
  "heading-medium-font-size-l": { destination: "shellSettings.headingMediumFontSizeResponsive", domain: "Heading" },
  "heading-medium-line-height": { destination: "shellSettings.headingMediumLineHeight", domain: "Heading" },
  "heading-small-font-weight": { destination: "shellSettings.headingSmallFontWeight", domain: "Heading" },
  "heading-medium-font-weight": { destination: "shellSettings.headingMediumFontWeight", domain: "Heading" },
  "base-selection-background": { destination: "shellSettings.selectionBackground", domain: "Base and Background" },
  "base-selection-color": { destination: "shellSettings.selectionColor", domain: "Base and Background" },
  "base-ins-background": { destination: "shellSettings.baseInsBackground", domain: "Base and Background" },
  "base-ins-color": { destination: "shellSettings.baseInsColor", domain: "Base and Background" },
  "base-mark-background": { destination: "shellSettings.baseMarkBackground", domain: "Base and Background" },
  "base-mark-color": { destination: "shellSettings.baseMarkColor", domain: "Base and Background" },
  "accordion-title-font-size": { destination: "shellSettings.accordionTitleFontSize", domain: "Accordion" },
  "accordion-title-hover-color": { destination: "shellSettings.accordionTitleHoverColor", domain: "Accordion" },
  "accordion-content-margin-top": { destination: "shellSettings.accordionContentMarginTop", domain: "Accordion" },
  "accordion-title-padding-vertical": { destination: "shellSettings.accordionTitlePaddingVertical", domain: "Accordion" },
  "accordion-icon-color": { destination: "shellSettings.accordionIconColor", domain: "Accordion" },
  "accordion-title-font-weight": { destination: "shellSettings.accordionTitleFontWeight", domain: "Accordion" },
  "accordion-title-letter-spacing": { destination: "shellSettings.accordionTitleLetterSpacing", domain: "Accordion" },
  "accordion-item-border-width": { destination: "shellSettings.accordionItemBorderWidth", domain: "Accordion" },
  "accordion-item-border": { destination: "shellSettings.accordionItemBorder", domain: "Accordion" },
  "accordion-item-box-shadow": { destination: "shellSettings.accordionItemBoxShadow", domain: "Accordion" },
  "nav-divider-margin-vertical": { destination: "shellSettings.navDividerMarginVertical", domain: "Nav" },
  "nav-default-font-size": { destination: "shellSettings.navDefaultFontSize", domain: "Nav" },
  "nav-default-item-color": { destination: "shellSettings.navDefaultItemColor", domain: "Nav" },
  "nav-default-item-hover-color": { destination: "shellSettings.navDefaultItemHoverColor", domain: "Nav" },
  "nav-default-item-active-color": { destination: "shellSettings.navDefaultItemActiveColor", domain: "Nav" },
  "nav-default-subtitle-font-size": { destination: "shellSettings.navDefaultSubtitleFontSize", domain: "Nav" },
  "nav-default-subtitle-color": { destination: "shellSettings.navDefaultSubtitleColor", domain: "Nav" },
  "nav-default-subtitle-font-weight": { destination: "shellSettings.navDefaultSubtitleFontWeight", domain: "Nav" },
  "nav-default-header-color": { destination: "shellSettings.navDefaultHeaderColor", domain: "Nav" },
  "nav-default-sublist-item-hover-color": { destination: "shellSettings.navDefaultSublistItemHoverColor", domain: "Nav" },
  "nav-default-sublist-item-active-color": { destination: "shellSettings.navDefaultSublistItemActiveColor", domain: "Nav" },
  "nav-default-divider-box-shadow": { destination: "shellSettings.navDefaultDividerBoxShadow", domain: "Nav" },
  "nav-primary-item-color": { destination: "shellSettings.navPrimaryItemColor", domain: "Nav" },
  "nav-primary-item-hover-color": { destination: "shellSettings.navPrimaryItemHoverColor", domain: "Nav" },
  "nav-primary-item-active-color": { destination: "shellSettings.navPrimaryItemActiveColor", domain: "Nav" },
  "nav-primary-subtitle-font-size": { destination: "shellSettings.navPrimarySubtitleFontSize", domain: "Nav" },
  "nav-primary-subtitle-color": { destination: "shellSettings.navPrimarySubtitleColor", domain: "Nav" },
  "nav-primary-subtitle-font-weight": { destination: "shellSettings.navPrimarySubtitleFontWeight", domain: "Nav" },
  "nav-primary-header-color": { destination: "shellSettings.navPrimaryHeaderColor", domain: "Nav" },
  "nav-primary-sublist-item-hover-color": { destination: "shellSettings.navPrimarySublistItemHoverColor", domain: "Nav" },
  "nav-primary-sublist-item-active-color": { destination: "shellSettings.navPrimarySublistItemActiveColor", domain: "Nav" },
  "nav-primary-divider-box-shadow": { destination: "shellSettings.navPrimaryDividerBoxShadow", domain: "Nav" },
  "nav-secondary-line-height": { destination: "shellSettings.navSecondaryLineHeight", domain: "Nav" },
  "nav-secondary-item-hover-color": { destination: "shellSettings.navSecondaryItemHoverColor", domain: "Nav" },
  "nav-secondary-item-active-color": { destination: "shellSettings.navSecondaryItemActiveColor", domain: "Nav" },
  "nav-secondary-subtitle-active-color": { destination: "shellSettings.navSecondarySubtitleActiveColor", domain: "Nav" },
  "nav-secondary-sublist-font-size": { destination: "shellSettings.navSecondarySublistFontSize", domain: "Nav" },
  "nav-secondary-sublist-item-hover-color": { destination: "shellSettings.navSecondarySublistItemHoverColor", domain: "Nav" },
  "nav-secondary-sublist-item-active-color": { destination: "shellSettings.navSecondarySublistItemActiveColor", domain: "Nav" },
  "nav-secondary-subtitle-font-weight": { destination: "shellSettings.navSecondarySubtitleFontWeight", domain: "Nav" },
  "nav-medium-line-height": { destination: "shellSettings.navMediumLineHeight", domain: "Nav" },
  "nav-medium-font-size-l": { destination: "shellSettings.navMediumFontSizeResponsive", domain: "Nav" },
  "nav-dividers-margin-top": { destination: "shellSettings.navDividersMarginTop", domain: "Nav" },
  "nav-secondary-margin-top": { destination: "shellSettings.navSecondaryMarginTop", domain: "Nav" },
  "nav-secondary-item-padding-vertical": { destination: "shellSettings.navSecondaryItemPaddingVertical", domain: "Nav" },
  "nav-secondary-item-padding-horizontal": { destination: "shellSettings.navSecondaryItemPaddingHorizontal", domain: "Nav" },
  "nav-secondary-item-hover-background": { destination: "shellSettings.navSecondaryItemHoverBackground", domain: "Nav" },
  "nav-secondary-item-active-background": { destination: "shellSettings.navSecondaryItemActiveBackground", domain: "Nav" },
  "nav-secondary-item-border-radius": { destination: "shellSettings.navSecondaryItemBorderRadius", domain: "Nav" },
  "nav-dividers-box-shadow": { destination: "shellSettings.navDividersBoxShadow", domain: "Nav" },
  "inverse-nav-secondary-subtitle-hover-color": { destination: "shellSettings.inverseNavSecondarySubtitleHoverColor", domain: "Nav" },
  "inverse-nav-background-item-hover-background": { destination: "shellSettings.inverseNavBackgroundItemHoverBackground", domain: "Nav" },
  "inverse-nav-background-item-active-background": { destination: "shellSettings.inverseNavBackgroundItemActiveBackground", domain: "Nav" },
  "inverse-nav-secondary-item-hover-background": { destination: "shellSettings.inverseNavSecondaryItemHoverBackground", domain: "Nav" },
  "inverse-nav-secondary-item-active-background": { destination: "shellSettings.inverseNavSecondaryItemActiveBackground", domain: "Nav" },
  "navbar-background": { destination: "shellSettings.navbarBackground", domain: "Navbar" },
  "navbar-gap": { destination: "shellSettings.navbarGap", domain: "Navbar" },
  "navbar-gap-m": { destination: "shellSettings.navbarGapMedium", domain: "Navbar" },
  "navbar-nav-gap": { destination: "shellSettings.navbarNavGap", domain: "Navbar" },
  "navbar-nav-gap-m": { destination: "shellSettings.navbarNavGapMedium", domain: "Navbar" },
  "navbar-nav-item-height": { destination: "shellSettings.navbarNavItemHeight", domain: "Navbar" },
  "navbar-nav-item-padding-horizontal": { destination: "shellSettings.navbarNavItemPaddingHorizontal", domain: "Navbar" },
  "navbar-nav-item-padding-horizontal-m": { destination: "shellSettings.navbarNavItemPaddingHorizontalMedium", domain: "Navbar" },
  "navbar-nav-item-color": { destination: "shellSettings.navbarNavItemColor", domain: "Navbar" },
  "navbar-nav-item-font-size": { destination: "shellSettings.navbarNavItemFontSize", domain: "Navbar" },
  "navbar-nav-item-hover-color": { destination: "shellSettings.navbarNavItemHoverColor", domain: "Navbar" },
  "navbar-nav-item-onclick-color": { destination: "shellSettings.navbarNavItemOnclickColor", domain: "Navbar" },
  "navbar-nav-item-active-color": { destination: "shellSettings.navbarNavItemActiveColor", domain: "Navbar" },
  "navbar-nav-item-text-transform": { destination: "shellSettings.navbarNavItemTextTransform", domain: "Navbar" },
  "navbar-primary-nav-item-font-size": { destination: "shellSettings.navbarPrimaryNavItemFontSize", domain: "Navbar" },
  "navbar-toggle-color": { destination: "shellSettings.navbarToggleColor", domain: "Navbar" },
  "navbar-toggle-hover-color": { destination: "shellSettings.navbarToggleHoverColor", domain: "Navbar" },
  "navbar-subtitle-font-size": { destination: "shellSettings.navbarSubtitleFontSize", domain: "Navbar" },
  "navbar-subtitle-color": { destination: "shellSettings.navbarSubtitleColor", domain: "Navbar" },
  "navbar-item-padding-horizontal": { destination: "shellSettings.navbarItemPaddingHorizontal", domain: "Navbar" },
  "navbar-item-padding-horizontal-m": { destination: "shellSettings.navbarItemPaddingHorizontalMedium", domain: "Navbar" },
  "navbar-backdrop-filter": { destination: "shellSettings.navbarBackdropFilter", domain: "Navbar" },
  "navbar-mode": { destination: "shellSettings.navbarMode", domain: "Navbar" },
  "navbar-border-width": { destination: "shellSettings.navbarBorderWidth", domain: "Navbar" },
  "navbar-border": { destination: "shellSettings.navbarBorder", domain: "Navbar" },
  "navbar-nav-item-line-mode": { destination: "shellSettings.navbarNavItemLineMode", domain: "Navbar" },
  "navbar-nav-item-line-position-mode": { destination: "shellSettings.navbarNavItemLinePositionMode", domain: "Navbar" },
  "navbar-nav-item-line-slide-mode": { destination: "shellSettings.navbarNavItemLineSlideMode", domain: "Navbar" },
  "navbar-nav-item-line-height": { destination: "shellSettings.navbarNavItemLineHeight", domain: "Navbar" },
  "navbar-nav-item-line-transition-duration": { destination: "shellSettings.navbarNavItemLineTransitionDuration", domain: "Navbar" },
  "navbar-nav-item-line-hover-height": { destination: "shellSettings.navbarNavItemLineHoverHeight", domain: "Navbar" },
  "navbar-nav-item-line-onclick-height": { destination: "shellSettings.navbarNavItemLineOnclickHeight", domain: "Navbar" },
  "navbar-nav-item-line-active-height": { destination: "shellSettings.navbarNavItemLineActiveHeight", domain: "Navbar" },
  "navbar-nav-item-line-opacity": { destination: "shellSettings.navbarNavItemLineOpacity", domain: "Navbar" },
  "internal-navbar-nav-item-line-gradient": { destination: "shellSettings.navbarNavItemLineGradient", domain: "Navbar" },
  "navbar-dropdown-margin": { destination: "shellSettings.navbarDropdownMargin", domain: "Navbar" },
  "navbar-dropdown-shift-margin": { destination: "shellSettings.navbarDropdownShiftMargin", domain: "Navbar" },
  "navbar-dropdown-width": { destination: "shellSettings.navbarDropdownWidth", domain: "Navbar" },
  "navbar-dropdown-padding": { destination: "shellSettings.navbarDropdownPadding", domain: "Navbar" },
  "navbar-dropdown-background": { destination: "shellSettings.navbarDropdownBackground", domain: "Navbar" },
  "navbar-dropdown-large-shift-margin": { destination: "shellSettings.navbarDropdownLargeShiftMargin", domain: "Navbar" },
  "navbar-dropdown-dropbar-shift-margin": { destination: "shellSettings.navbarDropdownDropbarShiftMargin", domain: "Navbar" },
  "navbar-dropdown-dropbar-padding-top": { destination: "shellSettings.navbarDropdownDropbarPaddingTop", domain: "Navbar" },
  "navbar-dropdown-dropbar-large-shift-margin": { destination: "shellSettings.navbarDropdownDropbarLargeShiftMargin", domain: "Navbar" },
  "navbar-dropdown-nav-item-color": { destination: "shellSettings.navbarDropdownNavItemColor", domain: "Navbar" },
  "navbar-dropdown-nav-item-hover-color": { destination: "shellSettings.navbarDropdownNavItemHoverColor", domain: "Navbar" },
  "navbar-dropdown-nav-item-active-color": { destination: "shellSettings.navbarDropdownNavItemActiveColor", domain: "Navbar" },
  "navbar-dropdown-nav-subtitle-font-size": { destination: "shellSettings.navbarDropdownNavSubtitleFontSize", domain: "Navbar" },
  "navbar-dropdown-nav-subtitle-color": { destination: "shellSettings.navbarDropdownNavSubtitleColor", domain: "Navbar" },
  "navbar-dropdown-nav-sublist-item-hover-color": { destination: "shellSettings.navbarDropdownNavSublistItemHoverColor", domain: "Navbar" },
  "navbar-dropdown-nav-sublist-item-active-color": { destination: "shellSettings.navbarDropdownNavSublistItemActiveColor", domain: "Navbar" },
  "navbar-dropdown-nav-item-padding-vertical": { destination: "shellSettings.navbarDropdownNavItemPaddingVertical", domain: "Navbar" },
  "navbar-dropdown-nav-font-size": { destination: "shellSettings.navbarDropdownNavFontSize", domain: "Navbar" },
  "navbar-dropdown-border-radius": { destination: "shellSettings.navbarDropdownBorderRadius", domain: "Navbar" },
  "navbar-dropdown-box-shadow": { destination: "shellSettings.navbarDropdownBoxShadow", domain: "Navbar" },
  "navbar-dropdown-shift-margin-m": { destination: "shellSettings.navbarDropdownShiftMarginMedium", domain: "Navbar" },
  "navbar-dropdown-dropbar-shift-margin-m": { destination: "shellSettings.navbarDropdownDropbarShiftMarginMedium", domain: "Navbar" },
  "navbar-dropdown-dropbar-large-shift-margin-m": { destination: "shellSettings.navbarDropdownDropbarLargeShiftMarginMedium", domain: "Navbar" },
  "inverse-navbar-nav-item-hover-color": { destination: "shellSettings.inverseNavbarNavItemHoverColor", domain: "Navbar" },
};

function setNested(target: Record<string, unknown>, path: string, value: string) {
  const [, key] = path.split(".");
  target[key] = value;
}

function controlTextLineHeight(height: unknown, borderWidth: unknown, fallback: string) {
  const heightMatch = typeof height === "string" && /^(-?(?:\d+\.?\d*|\.\d+))px$/.exec(height.trim());
  const borderMatch = typeof borderWidth === "string" && /^(-?(?:\d+\.?\d*|\.\d+))px$/.exec(borderWidth.trim());
  if (!heightMatch || !borderMatch) return fallback;
  return `${Math.max(0, Number(heightMatch[1]) - Number(borderMatch[1]) * 2)}px`;
}

export function resolveYoothemeLess(sources: YoothemeLessSource[], presetId: YoothemeDevstackPresetId = "devstack-light-blue"): YoothemeSemanticPreset {
  const presetDefinition = YOOTHEME_DEVSTACK_PRESETS.find((preset) => preset.id === presetId) ?? YOOTHEME_DEVSTACK_PRESETS[2];
  const ordered = [...sources].sort((a, b) => a.precedence - b.precedence);
  const { latest, all } = getLatestDeclarations(ordered);
  const rawValues = new Map([...latest.entries()].map(([name, declaration]) => [name, declaration.rawValue]));
  // These are UIkit's semantic button defaults, not WebPages defaults. They
  // must be written on every YOOtheme style import so an earlier WebPages
  // global (for example uppercase labels) cannot remain active merely because
  // the LESS layer relies on UIkit's default rather than redeclaring it.
  const shellSettings: Record<string, unknown> = {
    buttonTextTransform: "none",
  };
  const rows: YoothemeImportRow[] = [];
  const unsupported: YoothemeImportRow[] = [];
  const conflicts: YoothemeImportRow[] = [];

  for (const [variable, declaration] of latest.entries()) {
    const legacyMapping = destinationMap[variable];
    const capability = resolveYoothemeLessCapability(variable, legacyMapping?.destination, legacyMapping?.domain);
    const mapping = capability && legacyMapping ? { ...legacyMapping, destination: capability.owner } : legacyMapping;
    if (!mapping) continue;
    const resolved = resolveExpression(declaration.rawValue, rawValues);
    const previous = all.get(variable) ?? [];
    if (!capability) continue;
    if (capability.status === "unsupported") {
      unsupported.push({
        source: declaration.source.name,
        variable: `@${variable}`,
        rawValue: declaration.rawValue,
        resolvedValue: resolved.value,
        destination: mapping.destination,
        status: "unsupported",
        note: `INTENTIONALLY UNSUPPORTED for Compatibility Fixture #1 — ${capability.ui} exposes the value, but runtime breakpoint reconfiguration has no shared renderer.`,
      });
      continue;
    }
    const row: YoothemeImportRow = {
      source: declaration.source.name,
      variable: `@${variable}`,
      rawValue: declaration.rawValue,
      resolvedValue: resolved.value,
      destination: mapping.destination,
      status: previous.length > 1 ? "conflict" : resolved.value && capability.status === "mapped-rendered" ? "mapped" : "unsupported",
      note: previous.length > 1
        ? `Resolved by precedence; ${previous.length - 1} earlier assignment(s) overridden.`
        : `${capability.status === "mapped-rendered" ? "Mapped and rendered" : "INTENTIONALLY UNSUPPORTED for Compatibility Fixture #1 — runtime behavior is not yet configurable"} · ${capability.ui}`,
    };
    if (!resolved.value) {
      row.note = resolved.reason;
      unsupported.push(row);
    } else {
      setNested(shellSettings, mapping.destination, resolved.value);
      // `buttonHeight` is a legacy component alias. Keep it synchronized on
      // import while `controlHeightDefault` remains the canonical global owner.
      if (variable === "global-control-height") shellSettings.buttonHeight = resolved.value;
      rows.push(row);
      if (previous.length > 1) conflicts.push(row);
    }
  }

  // UIkit's default Alert color inherits @global-color. Preserve that source
  // inheritance in the canonical Alert owner when the theme does not provide
  // an explicit @alert-color declaration; native WebPages Alert fallbacks
  // therefore remain independent of an imported theme palette.
  if (!latest.has("alert-color") && typeof shellSettings.textColor === "string") {
    shellSettings.alertColor = shellSettings.textColor;
  }

  // UIkit's button radius inherits the global surface radius unless the
  // theme explicitly overrides it. Do not let WebPages' historical pill
  // default (999px) survive a Woolberry-style import that only declares
  // @global-border-radius.
  if (!latest.has("button-border-radius") && typeof shellSettings.borderRadius === "string") {
    shellSettings.buttonRadius = shellSettings.borderRadius;
    if (!latest.has("button-small-border-radius")) shellSettings.buttonSmallRadius = shellSettings.borderRadius;
    if (!latest.has("button-large-border-radius")) shellSettings.buttonLargeRadius = shellSettings.borderRadius;
  }

  // Persist authored-versus-inherited provenance for the complete shared
  // Button vocabulary. A missing LESS declaration means “inherit the UIkit
  // semantic token”, not “reuse whichever WebPages Button default happened
  // to be saved before this import”.
  shellSettings.buttonTokenInheritance = resolveButtonTokenInheritance(latest);

  // UIkit derives button text line-height from the control height and border.
  // Persist that semantic default on every YOOtheme import when the source has
  // not expressly overridden it, so historical WebPages component defaults
  // cannot win over the imported global control contract.
  const buttonBorderWidth = shellSettings.buttonBorderWidth ?? "2px";
  if (!latest.has("button-line-height")) {
    shellSettings.buttonLineHeight = controlTextLineHeight(
      shellSettings.controlHeightDefault ?? shellSettings.buttonHeight ?? "48px",
      buttonBorderWidth,
      "44px",
    );
  }
  if (!latest.has("button-large-line-height")) {
    shellSettings.buttonLargeLineHeight = controlTextLineHeight(
      shellSettings.controlHeightLarge ?? "56px",
      buttonBorderWidth,
      "52px",
    );
  }
  if (!latest.has("button-large-padding-horizontal")) {
    shellSettings.buttonLargePaddingX = shellSettings.gridGutterMedium
      ?? shellSettings.gridGutterDefault
      ?? "40px";
  }

  const reportOnlyPatterns = [
    { domain: "Forms", pattern: /^(form|inverse-form)-/ },
    { domain: "Lists", pattern: /^list-/ },
    { domain: "Tables", pattern: /^table-/ },
    { domain: "Accordion", pattern: /^accordion-/ },
    { domain: "Nav", pattern: /^(?:inverse-)?nav-/ },
    { domain: "Navbar", pattern: /^(?:inverse-)?navbar-/ },
  ];
  for (const [variable, declaration] of latest.entries()) {
    const domain = reportOnlyPatterns.find((entry) => entry.pattern.test(variable))?.domain;
    if (!domain || destinationMap[variable]) continue;
    const resolved = resolveExpression(declaration.rawValue, rawValues);
    unsupported.push({ source: declaration.source.name, variable: `@${variable}`, rawValue: declaration.rawValue, resolvedValue: resolved.value, status: "unsupported", note: `${domain} variable extracted for report only; no current WebPages Global Styles field owns it.` });
  }

  const design: Partial<BuilderDesign> = {};
  const report = createYoothemeLessImportReport([...rows, ...unsupported]);
  return {
    id: presetDefinition.id,
    name: presetDefinition.name,
    description: `Imported semantic Global Styles from the ${presetDefinition.name} YOOtheme LESS layers.`,
    shellSettings: shellSettings as Partial<BuilderShellSettings>,
    design,
    rows,
    unsupported,
    conflicts,
    report,
    sources: ordered.map((source) => source.name),
  };
}

export function getYoothemeImportSourceOrder(presetId: YoothemeDevstackPresetId = "devstack-light-blue") {
  const presetDefinition = YOOTHEME_DEVSTACK_PRESETS.find((preset) => preset.id === presetId) ?? YOOTHEME_DEVSTACK_PRESETS[2];
  return ["master-devstack/_import.less", presetDefinition.styleFile, "theme.less", "style.less"] as const;
}
