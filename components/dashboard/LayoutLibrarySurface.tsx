"use client";

import { Download, LibraryBig, Pencil, Plus, Save, Trash2, Upload } from "lucide-react";
import { useState } from "react";
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
  onOpenDocument?: (type: "header" | "footer") => void;
  onSaveCurrent?: (title?: string) => void | Promise<unknown>;
  saveLabel?: string;
  onApply: (template: BuilderSavedTemplate) => void;
  onExport?: (template: BuilderSavedTemplate) => void;
  onImport?: (file: File, templateType: LayoutLibraryType) => void | Promise<unknown>;
  onImportYootheme?: (file: File, targetType: LayoutLibraryType) => void | Promise<unknown>;
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
  onOpenDocument,
  onSaveCurrent,
  saveLabel,
  onApply,
  onExport,
  onImport,
  onImportYootheme,
  onDelete,
  onRename,
  managementFooter,
}: LayoutLibrarySurfaceProps) {
  const [importInputKey, setImportInputKey] = useState(0);
  const [renamingTemplateId, setRenamingTemplateId] = useState<string | null>(null);
  const [renameDraft, setRenameDraft] = useState("");
  const [saveTitle, setSaveTitle] = useState("");
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
        <div className="builder-template-save-card builder-library-context-save">
          <Save size={15} />
          <span>
            <strong>{saveLabel ?? `Save Current ${selectedTabLabel.slice(0, -1)} to Library`}</strong>
            <small>Give it a name, then save this composition as a reusable {selectedTabLabel.slice(0, -1).toLowerCase()} layout.</small>
            <input
              className="builder-library-save-title"
              aria-label={`Name ${selectedTabLabel.slice(0, -1).toLowerCase()} template`}
              value={saveTitle}
              onChange={(event) => setSaveTitle(event.target.value)}
              placeholder={libraryType === "footer" ? "e.g. Jack Footer" : "Optional custom name"}
            />
            <button
              type="button"
              className="builder-secondary-button"
              onClick={() => {
                void onSaveCurrent(saveTitle.trim() || undefined);
                setSaveTitle("");
              }}
            >
              Save to Library
            </button>
          </span>
        </div>
      ) : null}

      {mode === "management" && onOpenDocument && (libraryType === "header" || libraryType === "footer") ? (
        <button
          type="button"
          className="builder-template-save-card builder-library-context-save"
          onClick={() => onOpenDocument(libraryType)}
        >
          <Pencil size={15} />
          <span>
            <strong>Edit {libraryType === "footer" ? "Footer" : "Header"} Document</strong>
            <small>
              Open the document for import, editing, and publishing. Imported content becomes the document; save it from the document&apos;s Library tab to create a reusable listed template.
            </small>
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
                  {renamingTemplateId === template.id ? (
                    <input
                      className="builder-template-inline-rename"
                      aria-label={`New name for ${template.title}`}
                      value={renameDraft}
                      onChange={(event) => setRenameDraft(event.target.value)}
                      onClick={(event) => event.stopPropagation()}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          if (renameDraft.trim()) onRename?.(template, renameDraft.trim());
                          setRenamingTemplateId(null);
                        }
                        if (event.key === "Escape") setRenamingTemplateId(null);
                      }}
                      autoFocus
                    />
                  ) : <strong>{template.title}</strong>}
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
                      setRenamingTemplateId(template.id);
                      setRenameDraft(template.title);
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
      {onImport ? (
        <label className="builder-template-import-control">
          <Upload size={14} />
          <span>Upload {selectedTabLabel.slice(0, -1)} JSON</span>
          <input
            key={`${libraryType}-${importInputKey}`}
            type="file"
            accept=".json,application/json"
            onChange={async (event) => {
              const file = event.currentTarget.files?.[0];
              if (!file) return;
              await onImport(file, libraryType);
              setImportInputKey((key) => key + 1);
            }}
          />
        </label>
      ) : null}
      {onImportYootheme && (libraryType === "header" || libraryType === "footer") ? (
        <label className="builder-template-import-control">
          <Upload size={14} />
          <span>Import YOOtheme JSON → {libraryType === "footer" ? "Footer document" : "Header document"}</span>
          <input
            key={`yootheme-${libraryType}-${importInputKey}`}
            type="file"
            accept=".json,application/json"
            onChange={async (event) => {
              const file = event.currentTarget.files?.[0];
              if (!file) return;
              await onImportYootheme(file, libraryType);
              setImportInputKey((key) => key + 1);
            }}
          />
        </label>
      ) : null}
      {managementFooter}
    </div>
  );
}
