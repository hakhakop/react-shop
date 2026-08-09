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

function prefixSelector(selector: string, scopeSelector: string) {
  const trimmed = selector.trim();
  if (!trimmed) return "";
  if (trimmed === ":scope") return scopeSelector;
  if (trimmed.startsWith(":scope")) return `${scopeSelector}${trimmed.slice(6)}`;
  return `${scopeSelector} ${trimmed}`;
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
  css = css.replace(/(^|})\s*([^@{}][^{}]*)\{/g, (_whole, boundary, selectors) => {
    const scoped = String(selectors).split(",").map((selector) => prefixSelector(selector, scopeSelector)).filter(Boolean).join(", ");
    return `${boundary}${scoped}{`;
  });
  return css.replace(/___BUILDER_KEYFRAME_(\d+)___/g, (_whole, index) => retainedKeyframes[Number(index)] ?? "");
}
