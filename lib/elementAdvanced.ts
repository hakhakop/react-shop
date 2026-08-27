import type { BuilderVisualStyle } from "@/lib/builderVisualStyle";

type SafeAttributeValue = string | true;

const ATTRIBUTE_NAME = /^[A-Za-z_:][A-Za-z0-9:._-]*$/;
const BLOCKED_ATTRIBUTE_NAMES = new Set([
  "class",
  "classname",
  "id",
  "style",
  "srcdoc",
  "action",
  "formaction",
]);

export type ElementAdvancedValues = {
  customClass?: string;
  customAttributes?: string;
  customCss?: string;
};

/** Minimal shared contract so Builder and storefront use the same owner. */
export type ElementAdvancedBlock = {
  id?: string;
  customId?: string;
  customClass?: string;
  customAttributes?: string;
  customCss?: string;
  visualStyle?: BuilderVisualStyle;
};

/** Reads the canonical Advanced owner with historic top-level compatibility. */
export function resolveElementAdvanced(block: ElementAdvancedBlock): ElementAdvancedValues {
  const visual = block.visualStyle;
  return {
    customClass: visual?.customClass ?? block.customClass,
    customAttributes: visual?.customAttributes ?? block.customAttributes,
    customCss: visual?.customCss ?? block.customCss,
  };
}

export function elementAdvancedScope(block: Pick<ElementAdvancedBlock, "id" | "customId">) {
  const source = block.customId || block.id || "element";
  return `builder-element-${source.replace(/[^A-Za-z0-9_-]/g, "-")}`;
}

/**
 * Layout Advanced styles must be unique across documents rendered together.
 * YOOtheme commonly reuses section/row ids in page and footer documents, so
 * the document key is part of the CSS scope as well as the layout identity.
 */
export function layoutAdvancedScope(
  kind: "row" | "column",
  page: string,
  sectionId: string,
  layoutId: string,
) {
  return [kind, page, sectionId, layoutId]
    .map((value) => value.replace(/[^A-Za-z0-9_-]/g, "-"))
    .join("-");
}

/** Parses `name=value` lines without allowing executable DOM attributes. */
export function parseSafeElementAttributes(source?: string): Record<string, SafeAttributeValue> {
  if (!source) return {};
  const attributes: Record<string, SafeAttributeValue> = {};
  for (const line of source.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const match = trimmed.match(/^([^=\s]+)(?:\s*=\s*(.*))?$/);
    if (!match) continue;
    const name = match[1];
    const normalized = name.toLowerCase();
    if (!ATTRIBUTE_NAME.test(name) || normalized.startsWith("on") || BLOCKED_ATTRIBUTE_NAMES.has(normalized)) continue;
    let value = (match[2] ?? "").trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
    if (/^(javascript|vbscript):/i.test(value)) continue;
    attributes[name] = match[2] === undefined ? true : value;
  }
  return attributes;
}

function splitSelectorList(source: string) {
  const selectors: string[] = [];
  let start = 0;
  let parenDepth = 0;
  let bracketDepth = 0;
  let quote: string | null = null;

  for (let index = 0; index < source.length; index += 1) {
    const character = source[index];
    if (quote) {
      if (character === "\\") index += 1;
      else if (character === quote) quote = null;
      continue;
    }
    if (character === '"' || character === "'") {
      quote = character;
      continue;
    }
    if (character === "(") parenDepth += 1;
    else if (character === ")") parenDepth = Math.max(0, parenDepth - 1);
    else if (character === "[") bracketDepth += 1;
    else if (character === "]") bracketDepth = Math.max(0, bracketDepth - 1);
    else if (character === "," && parenDepth === 0 && bracketDepth === 0) {
      selectors.push(source.slice(start, index));
      start = index + 1;
    }
  }
  selectors.push(source.slice(start));
  return selectors;
}

function prefixSelector(selector: string, scopeSelector: string) {
  const trimmed = selector.trim();
  if (!trimmed) return "";
  if (trimmed === ":scope") return scopeSelector;
  if (trimmed.startsWith(":scope")) return `${scopeSelector}${trimmed.slice(6)}`;
  // YOOtheme's Advanced CSS defines `.el-element` as the selected element's
  // root. WebPages puts its stable data scope on that root, so this is a
  // replacement rather than a descendant selector.
  const yoothemeRootSelector = trimmed.replace(
    /(^|[\s>+~])\.el-element\b/g,
    (_match, prefix: string) => `${prefix}${scopeSelector}`,
  );
  if (yoothemeRootSelector !== trimmed) return yoothemeRootSelector;
  return `${scopeSelector} ${trimmed}`;
}

function findOpeningBrace(source: string, start: number) {
  let parenDepth = 0;
  let bracketDepth = 0;
  let quote: string | null = null;
  for (let index = start; index < source.length; index += 1) {
    const character = source[index];
    if (quote) {
      if (character === "\\") index += 1;
      else if (character === quote) quote = null;
      continue;
    }
    if (character === '"' || character === "'") {
      quote = character;
      continue;
    }
    if (character === "(") parenDepth += 1;
    else if (character === ")") parenDepth = Math.max(0, parenDepth - 1);
    else if (character === "[") bracketDepth += 1;
    else if (character === "]") bracketDepth = Math.max(0, bracketDepth - 1);
    else if (character === "{" && parenDepth === 0 && bracketDepth === 0) return index;
  }
  return -1;
}

function findClosingBrace(source: string, openingBrace: number) {
  let depth = 1;
  let quote: string | null = null;
  for (let index = openingBrace + 1; index < source.length; index += 1) {
    const character = source[index];
    if (quote) {
      if (character === "\\") index += 1;
      else if (character === quote) quote = null;
      continue;
    }
    if (character === '"' || character === "'") {
      quote = character;
      continue;
    }
    if (character === "{") depth += 1;
    else if (character === "}" && --depth === 0) return index;
  }
  return -1;
}

const NESTED_SELECTOR_AT_RULE = /^@(media|supports|container|layer|document|scope)\b/i;

function scopeCssRules(source: string, scopeSelector: string): string {
  let result = "";
  let cursor = 0;
  while (cursor < source.length) {
    const openingBrace = findOpeningBrace(source, cursor);
    if (openingBrace < 0) return `${result}${source.slice(cursor)}`;
    const closingBrace = findClosingBrace(source, openingBrace);
    if (closingBrace < 0) return `${result}${source.slice(cursor)}`;

    const header = source.slice(cursor, openingBrace);
    const body = source.slice(openingBrace + 1, closingBrace);
    const trimmedHeader = header.trim();
    if (trimmedHeader.startsWith("@")) {
      result += `${header}{${NESTED_SELECTOR_AT_RULE.test(trimmedHeader) ? scopeCssRules(body, scopeSelector) : body}}`;
    } else {
      const leadingWhitespace = header.match(/^\s*/)?.[0] ?? "";
      const selectors = splitSelectorList(header.slice(leadingWhitespace.length))
        .map((selector) => prefixSelector(selector, scopeSelector))
        .filter(Boolean)
        .join(", ");
      result += `${leadingWhitespace}${selectors}{${body}}`;
    }
    cursor = closingBrace + 1;
  }
  return result;
}

/** Scopes selectors per element and makes keyframes unique to that element. */
export function scopeElementCss(source: string | undefined, scope: string) {
  if (!source?.trim()) return "";
  const scopeSelector = `[data-builder-element-scope="${scope}"]`;
  let css = source.replace(/@(?:import|namespace)[^;]+;/gi, "");
  const keyframes = new Map<string, string>();
  const retainedKeyframes: string[] = [];
  css = css.replace(/@(-webkit-)?keyframes\s+([A-Za-z_-][\w-]*)\s*\{(?:[^{}]|\{[^{}]*\})*\}/gi, (whole, vendor = "", name) => {
    const scopedName = `${scope}-${name}`;
    keyframes.set(name, scopedName);
    const marker = `___BUILDER_KEYFRAME_${retainedKeyframes.length}___`;
    retainedKeyframes.push(whole.replace(new RegExp(`@${vendor}keyframes\\s+${name}`, "i"), `@${vendor}keyframes ${scopedName}`));
    return marker;
  });
  for (const [name, scopedName] of keyframes) {
    css = css.replace(new RegExp(`(animation(?:-name)?\\s*:[^;{}]*?)\\b${name}\\b`, "g"), `$1${scopedName}`);
  }
  css = scopeCssRules(css, scopeSelector);
  return css.replace(/___BUILDER_KEYFRAME_(\d+)___/g, (_whole, index) => retainedKeyframes[Number(index)] ?? "");
}

/** Scopes YOOtheme Row/Column Advanced CSS to a canonical layout root. */
export function scopeLayoutCss(source: string | undefined, scope: string) {
  if (!source?.trim()) return "";
  return scopeElementCss(
    source.replace(/\.(?:el-row|el-column)\b/g, ".el-element"),
    scope,
  );
}
