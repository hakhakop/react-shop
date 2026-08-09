import DOMPurify, { type Config } from "dompurify";

const HAS_HTML = /<[a-z][\s\S]*>/i;

export function isRichText(value: string): boolean {
  return HAS_HTML.test(value);
}

type DomPurifyInstance = { sanitize: (html: string, config?: Config) => string };

/**
 * Server-safe, deliberately small fallback for the shared rich-text contract.
 * DOMPurify's package entry is a factory during SSR (there is no browser
 * `window` to bind it to), so invoking it there is unsafe and throws. Rather
 * than letting individual renderers special-case SSR, the canonical HTML
 * boundary fails closed: it retains only the inline markup WebPages rich text
 * relies on and never preserves attributes other than a validated link URL.
 */
function sanitizeServerHtml(html: string): string {
  const escaped = (value: string) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;").replace(/'/g, "&#39;");
  const safeHref = (raw: string) => {
    const href = raw.trim();
    return /^(?:https?:|mailto:|tel:|\/|#)/i.test(href) ? href : undefined;
  };
  return html.split(/(<[^>]*>)/g).map((part) => {
    if (!part.startsWith("<")) return escaped(part);
    const match = part.match(/^<\s*(\/?)\s*([a-z0-9]+)([^>]*)>$/i);
    if (!match) return "";
    const [, closing, rawTag, attrs] = match;
    const tag = rawTag.toLowerCase();
    if (!["br", "strong", "b", "em", "i", "u", "span", "a"].includes(tag)) return "";
    if (closing) return tag === "br" ? "" : `</${tag}>`;
    if (tag === "br") return "<br>";
    if (tag !== "a") return `<${tag}>`;
    const hrefMatch = attrs.match(/\bhref\s*=\s*([\"'])(.*?)\1/i) ?? attrs.match(/\bhref\s*=\s*([^\s>]+)/i);
    const href = hrefMatch ? safeHref(hrefMatch[2] ?? hrefMatch[1]) : undefined;
    return href ? `<a href="${escaped(href)}" rel="noopener noreferrer">` : "<a>";
  }).join("");
}

export function sanitizeHtml(html: string, config?: Config): string {
  const purifier = DOMPurify as unknown as DomPurifyInstance;
  const normalized = sanitizeServerHtml(html);
  return typeof purifier?.sanitize === "function"
    ? purifier.sanitize(normalized, config)
    : normalized;
}
