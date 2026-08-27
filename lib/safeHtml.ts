import DOMPurify, { type Config } from "dompurify";

const HAS_HTML = /<[a-z][\s\S]*>/i;

export function isRichText(value: string): boolean {
  return HAS_HTML.test(value);
}

type DomPurifyInstance = { sanitize: (html: string, config?: Config) => string };

const RICH_TEXT_TAGS = new Set([
  "br", "p", "strong", "b", "em", "i", "u", "s", "span", "a", "ul", "ol", "li",
  "div", "blockquote", "h2", "h3", "h4", "img",
]);

const safeUrl = (raw: string) => {
  const value = raw.trim();
  return /^(?!(?:javascript|vbscript|data):)(?:https?:|mailto:|tel:|\/|#|\.\/|\.\.\/|[^:\s]+\/)/i.test(value)
    ? value
    : undefined;
};

const attribute = (attrs: string, name: string) =>
  attrs.match(new RegExp(`\\b${name}\\s*=\\s*([\"'])(.*?)\\1`, "i")) ??
  attrs.match(new RegExp(`\\b${name}\\s*=\\s*([^\\s>]+)`, "i"));

const safeClass = (attrs: string) => {
  const match = attribute(attrs, "class");
  const value = match?.[2] ?? match?.[1];
  // Preserve UIkit's responsive utility classes (for example
  // `uk-visible@m`) in imported rich labels. Validate each token rather than
  // rejecting the whole class attribute because of the breakpoint marker.
  const classes = value && value.length <= 250
    ? value.split(/\s+/).filter((token) => /^[a-z0-9_-]+(?:@[smlx])?$/i.test(token))
    : [];
  // YOOtheme's rich Grid content uses the `uk-grid` attribute as the
  // UIkit activation hook. The fail-closed sanitizer intentionally drops
  // unknown attributes, so retain its CSS/layout contract as a safe class.
  if ((/\buk-grid(?:\s*=|\b)/i.test(attrs) || classes.some((token) => /^uk-grid-(?:small|medium|large|collapse)$/.test(token))) && !classes.includes("uk-grid")) classes.push("uk-grid");
  return classes.length ? ` class="${classes.join(" ")}"` : "";
};

const safeResponsiveBreakClass = (attrs: string) => {
  const match = attribute(attrs, "class");
  const value = match?.[2] ?? match?.[1];
  if (!value) return "";
  const classes = value
    .split(/\s+/)
    .filter((token) => /^uk-(?:hidden|visible)@[smlx]$/i.test(token));
  return classes.length ? ` class="${classes.join(" ")}"` : "";
};

/**
 * Server-safe, deliberately small fallback for the shared rich-text contract.
 * DOMPurify's package entry is a factory during SSR (there is no browser
 * `window` to bind it to), so invoking it there is unsafe and throws. Rather
 * than letting individual renderers special-case SSR, the canonical HTML
 * boundary fails closed: it retains only the inline markup WebPages rich text
 * relies on and never preserves attributes other than a validated link URL.
 */
function sanitizeServerHtml(html: string): string {
  // Imported rich HTML is sanitized both at the import boundary and again at
  // rendering. Decode the five safe entities before re-escaping so this
  // canonical, fail-closed sanitizer remains idempotent instead of turning
  // `&amp;` into `&amp;amp;` on every render/save cycle.
  const decodeSafeEntities = (value: string) => value.replace(/&(amp|lt|gt|quot|#39);/gi, (entity) => ({
    "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": "\"", "&#39;": "'",
  }[entity.toLowerCase()] ?? entity));
  const escaped = (value: string) => decodeSafeEntities(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;").replace(/'/g, "&#39;");
  const withoutExecutableBlocks = html.replace(/<(script|style|iframe|object|embed)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, "");
  return withoutExecutableBlocks.split(/(<[^>]*>)/g).map((part) => {
    if (!part.startsWith("<")) return escaped(part);
    const match = part.match(/^<\s*(\/?)\s*([a-z0-9]+)([^>]*)>$/i);
    if (!match) return "";
    const [, closing, rawTag, attrs] = match;
    const tag = rawTag.toLowerCase();
    if (!RICH_TEXT_TAGS.has(tag)) return "";
    if (closing) return tag === "br" ? "" : `</${tag}>`;
    if (tag === "br") return `<br${safeResponsiveBreakClass(attrs)}>`;
    if (tag === "a") {
      const hrefMatch = attribute(attrs, "href");
      const href = hrefMatch ? safeUrl(hrefMatch[2] ?? hrefMatch[1]) : undefined;
      return href ? `<a href="${escaped(href)}"${safeClass(attrs)} rel="noopener noreferrer">` : `<a${safeClass(attrs)}>`;
    }
    if (tag === "img") {
      const srcMatch = attribute(attrs, "src");
      const src = srcMatch ? safeUrl(srcMatch[2] ?? srcMatch[1]) : undefined;
      if (!src) return "";
      const altMatch = attribute(attrs, "alt");
      const alt = altMatch ? ` alt="${escaped(altMatch[2] ?? altMatch[1])}"` : "";
      const size = ["width", "height"].map((name) => {
        const value = attribute(attrs, name)?.[2] ?? attribute(attrs, name)?.[1];
        return value && /^\d{1,5}$/.test(value) ? ` ${name}="${value}"` : "";
      }).join("");
      const loading = /\bloading\s*=\s*["']?eager/i.test(attrs) ? " loading=\"eager\"" : " loading=\"lazy\"";
      const svg = /\buk-svg\b/i.test(attrs) ? " uk-svg" : "";
      return `<img src="${escaped(src)}"${alt}${size}${safeClass(attrs)}${svg}${loading}>`;
    }
    return `<${tag}${safeClass(attrs)}>`;
  }).join("");
}

export function sanitizeHtml(html: string, config?: Config): string {
  const purifier = DOMPurify as unknown as DomPurifyInstance;
  const normalized = sanitizeServerHtml(html);
  return typeof purifier?.sanitize === "function"
    ? purifier.sanitize(normalized, config)
    : normalized;
}
