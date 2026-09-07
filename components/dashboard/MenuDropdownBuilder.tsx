"use client";
import { useEffect, useState } from "react";
import { ArrowLeft, LibraryBig } from "lucide-react";
import type { BuilderShellSettings, ReactMenuItem } from "@/lib/builderShell";
import type { InspectorPanelContext } from "./inspector/inspectorRouting";
import type { EmbeddedBuilderHost } from "./EmbeddedBuilderHost";
import SublayoutCapabilityPanel from "./inspector/panels/SublayoutCapabilityPanel";
import { emptyMenuDropdown, type MenuDropdownContent } from "@/lib/menuDropdownLayout";
import type { CategoryTreeItem } from "@/lib/categories";
import "./menuDropdownBuilder.css";

export default function MenuDropdownBuilder({ item, menuId, shellSettings, previewCategoryTree, openWordPressMediaPicker, onApply, onClose, host }: {
  item: ReactMenuItem;
  menuId: string;
  shellSettings: BuilderShellSettings;
  previewCategoryTree?: CategoryTreeItem[];
  openWordPressMediaPicker: InspectorPanelContext["openWordPressMediaPicker"];
  onApply: (content: MenuDropdownContent) => void;
  onClose: () => void;
  host: EmbeddedBuilderHost;
}) {
  const [empty] = useState(emptyMenuDropdown);
  const content = item.dropdownContent ?? empty;
  const release = host.releaseInspector;
  useEffect(() => () => release(), [release]);
  return <div className="builder-menu-dropdown-editor" data-menu-dropdown-editor>
    <button type="button" className="builder-column-layout-back" onClick={onClose}><ArrowLeft size={18} />Back to menu</button>
    <h3>{item.label} · Dropdown Builder</h3>
    <p className="builder-menu-dropdown-help">Changes autosave to this menu item. Elements open in the normal Library; settings open in the Inspector.</p>
    <button type="button" className="builder-template-import-control" onClick={() =>
      host.openLibrary({ type: "menu-dropdown", menuId, itemId: item.id })
    }>
      <LibraryBig size={14} />
      <span>Open Layout Library</span>
    </button>
    <SublayoutCapabilityPanel key={content.id} host={host} layoutLabel={`${item.label} dropdown`} block={content} tab="content" shellSettings={shellSettings} previewCategoryTree={previewCategoryTree} openWordPressMediaPicker={openWordPressMediaPicker} update={patch => onApply({ ...content, ...patch } as MenuDropdownContent)} />
  </div>;
}
