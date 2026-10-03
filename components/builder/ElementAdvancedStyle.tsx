import { elementAdvancedScope, normalizeElementCompatibilityCss, resolveElementAdvanced, scopeElementCss, type ElementAdvancedBlock } from "@/lib/elementAdvanced";

export function ElementAdvancedStyle({ block }: { block: ElementAdvancedBlock }) {
  const source = resolveElementAdvanced(block).customCss;
  const compatibilityCss = normalizeElementCompatibilityCss(source, block);
  // YOOtheme applies `.el-element` Advanced CSS to the actual headline node.
  // WebPages has a stable block wrapper around that node, so project the
  // imported root selector onto the rendered title while retaining the
  // wrapper as its isolation boundary.
  const css = scopeElementCss(
    compatibilityCss,
    elementAdvancedScope(block),
    block.kind === "heading" ? ".shop-builder-title" : undefined,
  );
  return css ? <style>{css}</style> : null;
}
