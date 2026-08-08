import DOMPurify, { type Config } from "dompurify";

const HAS_HTML = /<[a-z][\s\S]*>/i;

export function isRichText(value: string): boolean {
  return HAS_HTML.test(value);
}

export function sanitizeHtml(html: string, config?: Config): string {
  return DOMPurify.sanitize(html, config);
}
