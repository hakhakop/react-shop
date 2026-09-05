"use client";

import { useState } from "react";
import type { BuilderLayoutBlock } from "@/components/dashboard/builderTypes";
import UikitBackToTop from "@/components/builder/UikitBackToTop";
import BackToTopCapabilityPanel from "@/components/dashboard/inspector/panels/BackToTopCapabilityPanel";
import YoothemeGeneralSettingsPanel from "@/components/dashboard/inspector/panels/YoothemeGeneralSettingsPanel";
import type { BuilderShellSettings } from "@/lib/builderShell";
import { getGeneralElementShellClassName, getGeneralElementShellStyle } from "@/lib/builderElementShell";
import { ElementAdvancedStyle } from "@/components/builder/ElementAdvancedStyle";
import { elementAdvancedScope, parseSafeElementAttributes, resolveElementAdvanced } from "@/lib/elementAdvanced";
import "uikit/dist/css/uikit.css";

export default function BackToTopProof({ initial, shellSettings }: { initial: BuilderLayoutBlock; shellSettings: BuilderShellSettings }) {
  const [block, setBlock] = useState(initial);
  const update = (patch: Partial<BuilderLayoutBlock>) => setBlock(value => ({ ...value, ...patch }));
  const advanced = resolveElementAdvanced(block);
  return <main style={{ padding: 24 }}>
    <aside style={{ maxWidth: 440 }} aria-label="Back To Top Inspector">
      <BackToTopCapabilityPanel block={block} tab="content" update={update} shellSettings={shellSettings} openWordPressMediaPicker={() => {}} />
      <BackToTopCapabilityPanel block={block} tab="style" update={update} shellSettings={shellSettings} openWordPressMediaPicker={() => {}} />
      <YoothemeGeneralSettingsPanel block={block} update={update} />
    </aside>
    <div style={{ height: 1800 }} aria-hidden="true" />
    <div data-testid="element-shell" data-builder-element-scope={elementAdvancedScope(block)} className={`${getGeneralElementShellClassName(block)} ${advanced.customClass ?? ""}`} style={getGeneralElementShellStyle(block)} {...parseSafeElementAttributes(advanced.customAttributes)}>
      <ElementAdvancedStyle block={block} />
      <UikitBackToTop block={block} />
    </div>
  </main>;
}
