"use client";

import { Download, LibraryBig, Pencil, Plus, Save, Trash2 } from "lucide-react";
import type { ReactNode } from "react";
import type { BuilderSavedTemplate } from "@/components/dashboard/builderTypes";
import type { LayoutLibraryType } from "@/lib/layoutLibrary";
import { createDragGhost } from "@/components/dashboard/builderDragGhost";

const BUILDER_TEMPLATE_DND_TYPE = "application/x-builder-template";
const BUILDER_TEMPLATE_DND_TYPES: Record<Exclude<LayoutLibraryType, "page" | "header" | "footer">, string> = {
  section: "application/x-builder-template-section",
  row: "application/x-builder-template-row",
  element: "application/x-builder-template-element",
};

const templateLibraryTabs: { value: LayoutLibraryType; label: string }[] = [
  { value: "page", label: "Pages" },
  { value: "header", label: "Headers" },
  { value: "footer", label: "Footers" },
  { value: "section", label: "Sections" },
  { value: "row", label: "Rows" },
  { value: "element", label: "Elements" },
];

export type LayoutLibrarySurfaceProps = {
  mode: "management" | "contextual";
  libraryType: LayoutLibraryType;
  savedTemplates: BuilderSavedTemplate[];
  templateStatus?: string;
  onLibraryTypeChange?: (type: LayoutLibraryType) => void;
  onSaveCurrent?: () => void | Promise<unknown>;
  saveLabel?: string;
  onApply: (template: BuilderSavedTemplate) => void;
  onExport?: (template: BuilderSavedTemplate) => void;
  onDelete?: (id: string) => void;
  onRename?: (template: BuilderSavedTemplate, title: string) => void;
  managementFooter?: ReactNode;
};

export default function LayoutLibrarySurface({
  mode,
  libraryType,
  savedTemplates,
  templateStatus,
  onLibraryTypeChange,
  onSaveCurrent,
  saveLabel,
  onApply,
  onExport,
  onDelete,
  onRename,
  managementFooter,
}: LayoutLibrarySurfaceProps) {
  const filteredTemplates = savedTemplates.filter(
    (template) => (template.templateType ?? "page") === libraryType,
  );
  const selectedTabLabel =
    templateLibraryTabs.find((tab) => tab.value === libraryType)?.label ?? "Layouts";

  return (
    <div className={`builder-library-surface is-${mode}`}>
      {mode === "management" ? (
        <div className="builder-template-tabs" role="tablist" aria-label="Library types">
          {templateLibraryTabs.map((tab) => {
            const tabCount = savedTemplates.filter(
              (template) => (template.templateType ?? "page") === tab.value,
            ).length;
            return (
              <button
                key={tab.value}
                type="button"
                role="tab"
                aria-selected={libraryType === tab.value}
                className={libraryType === tab.value ? "is-active" : ""}
                onClick={() => onLibraryTypeChange?.(tab.value)}
              >
                <span>{tab.label}</span>
                <small>{tabCount}</small>
              </button>
            );
          })}
        </div>
      ) : null}

      {mode === "contextual" && onSaveCurrent ? (
        <button
          type="button"
          className="builder-template-save-card builder-library-context-save"
          onClick={() => void onSaveCurrent()}
        >
          <Save size={15} />
          <span>
            <strong>{saveLabel ?? `Save Current ${selectedTabLabel.slice(0, -1)} to Library`}</strong>
            <small>Save this composition as a reusable {selectedTabLabel.slice(0, -1).toLowerCase()} layout.</small>
          </span>
        </button>
      ) : null}

      {filteredTemplates.length > 0 ? (
        <div className="builder-pages-list builder-template-list">
          {filteredTemplates.map((template) => {
            const templateType = template.templateType ?? "page";
            const canDragTemplate = mode === "management" &&
              templateType !== "page" && templateType !== "header" && templateType !== "footer";
            const templateDragMimeType = canDragTemplate
              ? BUILDER_TEMPLATE_DND_TYPES[
                  templateType as Exclude<LayoutLibraryType, "page" | "header" | "footer">
                ]
              : null;
            return (
              <div
                key={template.id}
                className="builder-page-row builder-template-row"
                draggable={canDragTemplate}
                onDragStart={(event) => {
                  if (!canDragTemplate) {
                    event.preventDefault();
                    return;
                  }
                  event.dataTransfer.setData(BUILDER_TEMPLATE_DND_TYPE, template.id);
                  if (templateDragMimeType) {
                    event.dataTransfer.setData(templateDragMimeType, template.id);
                  }
                  event.dataTransfer.effectAllowed = "copy";
                  createDragGhost(event, template.title || "Layout");
                }}
              >
                <button type="button" onClick={() => onApply(template)}>
                  <strong>{template.title}</strong>
                  <span>
                    {templateType.toUpperCase()} · {template.sourcePage ?? "template"} · {new Date(template.updatedAt).toLocaleDateString()}
                  </span>
                </button>
                <button type="button" className="builder-template-use-button" onClick={() => onApply(template)}>
                  <Plus size={14} />
                  Use
                </button>
                {mode === "management" && onExport ? (
                  <button type="button" className="builder-icon-button" onClick={() => onExport(template)} aria-label={`Export ${template.title}`}>
                    <Download size={14} />
                  </button>
                ) : null}
                {mode === "management" && onRename ? (
                  <button
                    type="button"
                    className="builder-icon-button"
                    onClick={() => {
                      const nextTitle = window.prompt("Rename layout", template.title);
                      if (nextTitle) onRename(template, nextTitle);
                    }}
                    aria-label={`Rename ${template.title}`}
                  >
                    <Pencil size={14} />
                  </button>
                ) : null}
                {mode === "management" && onDelete ? (
                  <button type="button" className="builder-icon-button" onClick={() => onDelete(template.id)} aria-label={`Delete ${template.title}`}>
                    <Trash2 size={14} />
                  </button>
                ) : null}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="builder-template-note">
          <LibraryBig size={16} />
          <span>
            {savedTemplates.length > 0
              ? `No ${selectedTabLabel.toLowerCase()} saved yet.`
              : "Saved layouts will appear here after you save from the Builder."}
          </span>
        </div>
      )}

      {templateStatus ? <small className="builder-library-status">{templateStatus}</small> : null}
      {managementFooter}
    </div>
  );
}
