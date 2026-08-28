import { elementAdvancedScope, normalizeElementCompatibilityCss, resolveElementAdvanced, scopeElementCss, type ElementAdvancedBlock } from "@/lib/elementAdvanced";

export function ElementAdvancedStyle({ block }: { block: ElementAdvancedBlock }) {
  const source = resolveElementAdvanced(block).customCss;
  const compatibilityCss = normalizeElementCompatibilityCss(source, block);
  const css = scopeElementCss(compatibilityCss, elementAdvancedScope(block));
  return css ? <style>{css}</style> : null;
}
