"use client";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Upload } from "lucide-react";
import type { BuilderShellSettings, ReactMenuItem } from "@/lib/builderShell";
import type { InspectorPanelContext } from "./inspector/inspectorRouting";
import type { EmbeddedBuilderHost } from "./EmbeddedBuilderHost";
import SublayoutCapabilityPanel from "./inspector/panels/SublayoutCapabilityPanel";
import { emptyMenuDropdown, type MenuDropdownContent } from "@/lib/menuDropdownLayout";
import "./menuDropdownBuilder.css";

export default function MenuDropdownBuilder({ item, shellSettings, openWordPressMediaPicker, onApply, onClose, host }: {
  item: ReactMenuItem;
  shellSettings: BuilderShellSettings;
  openWordPressMediaPicker: InspectorPanelContext["openWordPressMediaPicker"];
  onApply: (content: MenuDropdownContent) => void;
  onClose: () => void;
  host: EmbeddedBuilderHost;
}) {
  const [empty] = useState(emptyMenuDropdown);
  const [revision, setRevision] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const content = item.dropdownContent ?? empty;
  const release = host.releaseInspector;
  useEffect(() => () => release(), [release]);
  return <div className="builder-menu-dropdown-editor" data-menu-dropdown-editor>
    <button type="button" className="builder-column-layout-back" onClick={onClose}><ArrowLeft size={18} />Back to menu</button>
    <h3>{item.label} · Dropdown Builder</h3>
    <p className="builder-menu-dropdown-help">Changes autosave to this menu item. Elements open in the normal Library; settings open in the Inspector.</p>
    <div className="builder-menu-dropdown-actions"><button type="button" onClick={() => input.current?.click()}><Upload size={16} />Import JSON</button></div>
    <input ref={input} type="file" accept="application/json,.json" hidden aria-label="Dropdown JSON" onChange={event => {
      const file = event.target.files?.[0]; event.target.value = "";
      if (file) host.importJson(file, next => { onApply(next); setRevision(value => value + 1); host.releaseInspector(); });
    }} />
    <SublayoutCapabilityPanel key={revision} host={host} layoutLabel={`${item.label} dropdown`} block={content} tab="content" shellSettings={shellSettings} openWordPressMediaPicker={openWordPressMediaPicker} update={patch => onApply({ ...content, ...patch } as MenuDropdownContent)} />
  </div>;
}
