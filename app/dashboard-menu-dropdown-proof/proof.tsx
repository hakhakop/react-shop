"use client";
import { useCallback, useRef, useState } from "react";
import ElementLibrary from "@/components/dashboard/ElementLibrary";
import { getLayoutBlockKindsForState } from "@/components/dashboard/builderRegistry";
import { ElementLibraryIcon } from "@/components/dashboard/elementIconRegistry";
import type { EmbeddedBuilderHost } from "@/components/dashboard/EmbeddedBuilderHost";
import { mapYoothemeStaticContent } from "@/lib/yoothemePageImport";
import { normalizeMenuDropdown, menuDropdownRenderLayout } from "@/lib/menuDropdownLayout";
import type { BuilderShellSettings, ReactMenuItem } from "@/lib/builderShell";
import MenuDropdownContent from "@/components/MenuDropdownContent";
import HeaderNav from "@/components/HeaderNav";
import MenuDropdownBuilder from "@/components/dashboard/MenuDropdownBuilder";
import "uikit/dist/css/uikit.css";

export default function Proof({ shellSettings }: { shellSettings: BuilderShellSettings }) {
  const [item, setItem] = useState<ReactMenuItem>({ id: "women", label: "Women", url: "/women", dropdownContent: { id: "women-layout", kind: "sublayout", sublayout: { rows: [{ id: "row", layout: "1-col", columns: [{ id: "column", elements: [{ id: "heading", kind: "heading", headingText: "Original dropdown", title: "Original dropdown" }] }] }] } } });
  const [open, setOpen] = useState(true);
  const [initialDropdown] = useState(() => ({ signature: JSON.stringify(item.dropdownContent), sections: menuDropdownRenderLayout([item.dropdownContent!]).sections }));
  const [target, setTarget] = useState<HTMLElement | null>(null);
  const [inspect, setInspect] = useState(false);
  const [library, setLibrary] = useState(false);
  const insert = useRef<Parameters<EmbeddedBuilderHost["openElements"]>[0] | null>(null);
  const release = useCallback(() => { setInspect(false); setLibrary(false); }, []);
  const host: EmbeddedBuilderHost = { inspectorTarget: target, showInspector: () => setInspect(true), releaseInspector: release, openElements: callback => { insert.current = callback; setLibrary(true); }, importJson: async (file, apply) => { const mapping = mapYoothemeStaticContent(JSON.parse(await file.text())); const content = normalizeMenuDropdown(mapping.sections[0]?.rows?.[0]?.columns[0]?.elements[0]); if (content && !mapping.warnings.length && !mapping.reportWarnings.length) apply(content); } };
  return <main style={{ padding: 20 }}>
    <header className="site-header site-header--dropdown-hover"><HeaderNav items={[item]} dropdownContentById={{ women: <MenuDropdownContent content={item.dropdownContent!} initialSignature={initialDropdown.signature} initialSections={initialDropdown.sections} draft shellSettings={shellSettings} /> }} /></header>
    <output data-testid="saved-heading">{item.dropdownContent?.sublayout.rows[0]?.columns[0]?.elements[0]?.headingText}</output>
    <aside className="builder-dashboard builder-inspector" style={{ display: "block", position: "relative", width: "100%", maxWidth: 480, marginTop: 40 }}>
      {open ? <MenuDropdownBuilder host={host} item={item} shellSettings={shellSettings} openWordPressMediaPicker={() => {}} onClose={() => setOpen(false)} onApply={dropdownContent => setItem(current => ({ ...current, dropdownContent }))} /> : <button type="button" onClick={() => setOpen(true)}>Open dropdown builder</button>}
    </aside>
    {inspect && <aside className="builder-dashboard builder-inspector is-open" aria-label="Hosted Inspector" ref={setTarget} />}
    {library && <div role="dialog" aria-label="Element library" className="builder-dashboard"><ElementLibrary availableLayoutBlockKinds={getLayoutBlockKindsForState()} onRenderLayoutBlockIcon={kind => <ElementLibraryIcon kind={kind} />} onAddElement={kind => { insert.current?.(kind); setLibrary(false); }} /></div>}
  </main>;
}
