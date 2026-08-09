"use client";

import type { BuilderLayoutBlock } from "@/components/dashboard/builderTypes";
import type { BuilderVisualStyle } from "@/lib/builderVisualStyle";
import { resolveElementAdvanced } from "@/lib/elementAdvanced";
import { InspectorDivision, InspectorFieldRow, InspectorTextField, InspectorTextarea } from "@/components/dashboard/inspector/InspectorControls";

type Props = { block: BuilderLayoutBlock; update: (patch: Partial<BuilderLayoutBlock>) => void };

/** Shared YOOtheme-compatible element Advanced surface. */
export default function ElementAdvancedPanel({ block, update }: Props) {
  const advanced = resolveElementAdvanced(block);
  const visual = (block.visualStyle as BuilderVisualStyle | undefined) ?? {};
  const patch = (next: Partial<typeof advanced>) => update({ visualStyle: { ...visual, ...next } });
  return (
    <div className="builder-inspector-stack" data-uikit-capability="element-advanced">
      <InspectorFieldRow label="Class">
        <InspectorTextField value={advanced.customClass ?? ""} onChange={(customClass) => patch({ customClass })} placeholder="uk-disabled" ariaLabel="Custom class names" />
      </InspectorFieldRow>
      <p className="builder-inspector-helper-text">Define one or more class names for the element. Separate multiple classes with spaces.</p>
      <InspectorDivision title="ATTRIBUTES">
        <InspectorFieldRow>
          <InspectorTextarea value={advanced.customAttributes ?? ""} onChange={(customAttributes) => patch({ customAttributes })} placeholder={'data-label="example"\naria-label="Example"'} ariaLabel="Custom attributes" />
        </InspectorFieldRow>
        <p className="builder-inspector-helper-text">One attribute per line, using name=value. Event handlers and executable attributes are ignored.</p>
      </InspectorDivision>
      <InspectorDivision title="CSS">
        <InspectorFieldRow>
          <InspectorTextarea value={advanced.customCss ?? ""} onChange={(customCss) => patch({ customCss })} placeholder={".el-image {\n  border-radius: 50%;\n}"} ariaLabel="Scoped custom CSS" />
        </InspectorFieldRow>
        <p className="builder-inspector-helper-text">CSS is scoped to this element. Use .el-image for an Image element; keyframes are isolated per element.</p>
      </InspectorDivision>
    </div>
  );
}
