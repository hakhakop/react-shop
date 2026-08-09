import { elementAdvancedScope, resolveElementAdvanced, scopeElementCss, type ElementAdvancedBlock } from "@/lib/elementAdvanced";

export function ElementAdvancedStyle({ block }: { block: ElementAdvancedBlock }) {
  const css = scopeElementCss(resolveElementAdvanced(block).customCss, elementAdvancedScope(block));
  return css ? <style>{css}</style> : null;
}
