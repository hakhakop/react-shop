import { scopeLayoutCss } from "@/lib/elementAdvanced";

export function LayoutAdvancedStyle({ css, scope }: { css?: string; scope: string }) {
  const scoped = scopeLayoutCss(css, scope);
  return scoped ? <style>{scoped}</style> : null;
}
