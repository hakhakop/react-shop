import type { BuilderDesign } from "@/components/dashboard/builderTypes";
import type { BuilderShellSettings } from "@/lib/builderShell";

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
  sources: string[];
};

type Declaration = {
  source: YoothemeLessSource;
  variable: string;
  rawValue: string;
  order: number;
};

const SUPPORTED_FUNCTIONS = new Set(["darken", "lighten", "fade", "mix"]);
const OPAQUE_CSS_FUNCTIONS = new Set(["rgb", "rgba", "hsl", "hsla", "url", "linear-gradient", "radial-gradient", "conic-gradient", "min", "max", "clamp", "color-mix"]);
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
  "global-primary-font-weight": { destination: "shellSettings.headingFontWeight", domain: "Typography" },
  "global-2xlarge-font-size": { destination: "shellSettings.headingXLargeFontSize", domain: "Typography" },
  "global-xlarge-font-size": { destination: "shellSettings.headingLargeFontSize", domain: "Typography" },
  "global-large-font-size": { destination: "shellSettings.headingMediumFontSize", domain: "Typography" },
  "global-small-font-size": { destination: "shellSettings.smallTextFontSize", domain: "Typography" },
  "global-color": { destination: "shellSettings.textColor", domain: "Colors" },
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
  "global-control-height": { destination: "shellSettings.buttonHeight", domain: "Buttons" },
  "global-control-large-height": { destination: "shellSettings.controlHeightLarge", domain: "Buttons" },
  "container-small-max-width": { destination: "shellSettings.containerSmall", domain: "Containers and page" },
  "container-max-width": { destination: "shellSettings.containerDefault", domain: "Containers and page" },
  "container-large-max-width": { destination: "shellSettings.containerLarge", domain: "Containers and page" },
  "container-xlarge-max-width": { destination: "shellSettings.containerXLarge", domain: "Containers and page" },
  "theme-page-container-width": { destination: "shellSettings.pageContainerMaxWidth", domain: "Containers and page" },
  "card-default-background": { destination: "shellSettings.cardBackground", domain: "Surfaces" },
  "card-primary-background": { destination: "shellSettings.cardPrimaryBackground", domain: "Surfaces" },
  "card-secondary-background": { destination: "shellSettings.cardSecondaryBackground", domain: "Surfaces" },
  "card-hover-background": { destination: "shellSettings.cardDefaultHoverBackground", domain: "Cards" },
  "card-border-radius": { destination: "shellSettings.cardBorderRadius", domain: "Surfaces" },
  "card-default-border": { destination: "shellSettings.cardDefaultBorder", domain: "Cards" },
  "card-primary-border": { destination: "shellSettings.cardPrimaryBorder", domain: "Cards" },
  "card-secondary-border": { destination: "shellSettings.cardSecondaryBorder", domain: "Cards" },
  "card-border-width": { destination: "shellSettings.cardBorderWidth", domain: "Cards" },
  "card-transition-duration": { destination: "shellSettings.cardTransitionDuration", domain: "Cards" },
  "card-default-box-shadow": { destination: "shellSettings.cardShadow", domain: "Surfaces" },
  "card-default-hover-box-shadow": { destination: "shellSettings.cardShadowHover", domain: "Surfaces" },
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
  "button-primary-hover-box-shadow": { destination: "shellSettings.buttonHoverShadow", domain: "Buttons" },
  "button-primary-hover-gradient": { destination: "shellSettings.buttonHoverGradient", domain: "Buttons" },
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
};

function setNested(target: Record<string, unknown>, path: string, value: string) {
  const [, key] = path.split(".");
  target[key] = value;
}

export function resolveYoothemeLess(sources: YoothemeLessSource[], presetId: YoothemeDevstackPresetId = "devstack-light-blue"): YoothemeSemanticPreset {
  const presetDefinition = YOOTHEME_DEVSTACK_PRESETS.find((preset) => preset.id === presetId) ?? YOOTHEME_DEVSTACK_PRESETS[2];
  const ordered = [...sources].sort((a, b) => a.precedence - b.precedence);
  const { latest, all } = getLatestDeclarations(ordered);
  const rawValues = new Map([...latest.entries()].map(([name, declaration]) => [name, declaration.rawValue]));
  const shellSettings: Record<string, unknown> = {};
  const rows: YoothemeImportRow[] = [];
  const unsupported: YoothemeImportRow[] = [];
  const conflicts: YoothemeImportRow[] = [];

  for (const [variable, declaration] of latest.entries()) {
    const mapping = destinationMap[variable];
    if (!mapping) continue;
    const resolved = resolveExpression(declaration.rawValue, rawValues);
    const previous = all.get(variable) ?? [];
    const row: YoothemeImportRow = {
      source: declaration.source.name,
      variable: `@${variable}`,
      rawValue: declaration.rawValue,
      resolvedValue: resolved.value,
      destination: mapping.destination,
      status: previous.length > 1 ? "conflict" : resolved.value ? "mapped" : "unsupported",
      note: previous.length > 1 ? `Resolved by precedence; ${previous.length - 1} earlier assignment(s) overridden.` : undefined,
    };
    if (!resolved.value) {
      row.note = resolved.reason;
      unsupported.push(row);
    } else {
      setNested(shellSettings, mapping.destination, resolved.value);
      rows.push(row);
      if (previous.length > 1) conflicts.push(row);
    }
  }

  const reportOnlyPatterns = [
    { domain: "Forms", pattern: /^(form|inverse-form)-/ },
    { domain: "Lists", pattern: /^list-/ },
    { domain: "Tables", pattern: /^table-/ },
    { domain: "Accordion", pattern: /^accordion-/ },
    { domain: "Navigation", pattern: /^navbar-/ },
  ];
  for (const [variable, declaration] of latest.entries()) {
    const domain = reportOnlyPatterns.find((entry) => entry.pattern.test(variable))?.domain;
    if (!domain || destinationMap[variable]) continue;
    const resolved = resolveExpression(declaration.rawValue, rawValues);
    unsupported.push({ source: declaration.source.name, variable: `@${variable}`, rawValue: declaration.rawValue, resolvedValue: resolved.value, status: "unsupported", note: `${domain} variable extracted for report only; no current WebPages Global Styles field owns it.` });
  }

  const design: Partial<BuilderDesign> = {};
  return {
    id: presetDefinition.id,
    name: presetDefinition.name,
    description: `Imported semantic Global Styles from the ${presetDefinition.name} YOOtheme LESS layers.`,
    shellSettings: shellSettings as Partial<BuilderShellSettings>,
    design,
    rows,
    unsupported,
    conflicts,
    sources: ordered.map((source) => source.name),
  };
}

export function getYoothemeImportSourceOrder(presetId: YoothemeDevstackPresetId = "devstack-light-blue") {
  const presetDefinition = YOOTHEME_DEVSTACK_PRESETS.find((preset) => preset.id === presetId) ?? YOOTHEME_DEVSTACK_PRESETS[2];
  return ["master-devstack/_import.less", presetDefinition.styleFile, "theme.less", "style.less"] as const;
}
