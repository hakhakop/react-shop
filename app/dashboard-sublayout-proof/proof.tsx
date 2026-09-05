"use client";
import { useState } from "react";
import type { BuilderLayoutBlock, InspectorTab } from "@/components/dashboard/builderTypes";
import type { BuilderShellSettings } from "@/lib/builderShell";
import ElementCapabilityComposer from "@/components/dashboard/inspector/ElementCapabilityComposer";
import { getInspectorElementCapabilityDeclaration } from "@/components/dashboard/inspector/inspectorRouting";
import { ContentLayoutBlock } from "@/components/builder/StorefrontBuilderRenderer";
import "uikit/dist/css/uikit.css";

export default function SublayoutProof({ initial, shellSettings }: { initial: BuilderLayoutBlock; shellSettings: BuilderShellSettings }) {
  const [block, setBlock] = useState(initial);
  const [tab, setTab] = useState<InspectorTab>("content");
  return <main style={{ padding: 20 }}>
    <div data-testid="preview"><ContentLayoutBlock block={block} breadcrumbItems={[]} shellSettings={shellSettings} /></div>
    <aside className="builder-dashboard builder-inspector" style={{ display: "block", position: "relative", width: "100%", maxWidth: 480, minHeight: 0, marginTop: 40 }} aria-label="Sublayout Inspector">
      <nav aria-label="Element tabs">{(["content", "settings", "advanced"] as const).map(value => <button key={value} type="button" onClick={() => setTab(value)}>{value}</button>)}</nav>
      <ElementCapabilityComposer block={block} tab={tab} update={patch => setBlock(value => ({ ...value, ...patch }))} shellSettings={shellSettings} declaration={getInspectorElementCapabilityDeclaration("sublayout")!} openWordPressMediaPicker={() => {}} />
    </aside>
  </main>;
}
