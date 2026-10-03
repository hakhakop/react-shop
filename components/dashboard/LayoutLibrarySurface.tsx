"use client";

import { Download, LibraryBig, Pencil, Plus, Save, Search, Trash2, Upload } from "lucide-react";
import { useState } from "react";
import type { ReactNode } from "react";
import type { BuilderSavedTemplate } from "@/components/dashboard/builderTypes";
import {
  resolveBuilderLibraryImportFormat,
  type BuilderLibraryImportFormat,
  type LayoutLibraryType,
} from "@/lib/layoutLibrary";
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

export type LayoutLibraryInsertionAction = "before" | "after" | "replace";

export type LayoutLibraryContextAction = {
  value: LayoutLibraryInsertionAction;
  label: string;
};

export type LayoutLibraryGroup = {
  value: LayoutLibraryType;
  label: string;
  types: LayoutLibraryType[];
};

export type LayoutLibrarySurfaceProps = {
  mode: "management" | "contextual";
  libraryType: LayoutLibraryType;
  savedTemplates: BuilderSavedTemplate[];
  templateStatus?: string;
  onLibraryTypeChange?: (type: LayoutLibraryType) => void;
  onOpenDocument?: (type: "header" | "footer") => void;
  onSaveCurrent?: (title?: string) => void | Promise<unknown>;
  onApply: (template: BuilderSavedTemplate) => void;
  onExport?: (template: BuilderSavedTemplate) => void;
  onImport?: (
    file: File,
    templateType: LayoutLibraryType,
    title: string,
    acceptedTypes?: LayoutLibraryType[],
  ) => void | boolean | Promise<unknown>;
  onImportYootheme?: (file: File, targetType: LayoutLibraryType, title: string) => void | Promise<unknown>;
  onDelete?: (id: string) => void;
  onRename?: (template: BuilderSavedTemplate, title: string) => void;
  availableLibraryTypes?: LayoutLibraryType[];
  libraryGroups?: LayoutLibraryGroup[];
  contextualActions?: LayoutLibraryContextAction[];
  contextualActionsForTemplate?: (
    template: BuilderSavedTemplate | null,
  ) => LayoutLibraryContextAction[];
  onContextualAction?: (
    template: BuilderSavedTemplate,
    action: LayoutLibraryInsertionAction,
  ) => void;
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
  onApply,
  onExport,
  onImport,
  onImportYootheme,
  onDelete,
  onRename,
  availableLibraryTypes,
  libraryGroups,
  contextualActions = [],
  contextualActionsForTemplate,
  onContextualAction,
  managementFooter,
}: LayoutLibrarySurfaceProps) {
  const [importInputKey, setImportInputKey] = useState(0);
  const [renamingTemplateId, setRenamingTemplateId] = useState<string | null>(null);
  const [renameDraft, setRenameDraft] = useState("");
  const [saveTitle, setSaveTitle] = useState("");
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [selectedInsertionAction, setSelectedInsertionAction] = useState<LayoutLibraryInsertionAction>("replace");
  const [pendingImport, setPendingImport] = useState<{
    file: File;
    source: "webpages" | "yootheme";
    targetType: LayoutLibraryType;
    acceptedTypes: LayoutLibraryType[];
  } | null>(null);
  const [pendingImportTitle, setPendingImportTitle] = useState("");
  const libraryTemplates = savedTemplates;
  const visibleLibraryTabs: LayoutLibraryGroup[] = libraryGroups ?? (
    availableLibraryTypes
      ? templateLibraryTabs
          .filter((tab) => availableLibraryTypes.includes(tab.value))
          .map((tab) => ({ ...tab, types: [tab.value] }))
      : templateLibraryTabs.map((tab) => ({ ...tab, types: [tab.value] }))
  );
  const activeLibraryTab = visibleLibraryTabs.find(
    (tab) => tab.value === libraryType,
  );
  const activeLibraryTypes = activeLibraryTab?.types ?? [libraryType];
  const filteredTemplates = libraryTemplates.filter((template) =>
    activeLibraryTypes.includes(template.templateType ?? "page") &&
    (!searchQuery.trim() || template.title.toLocaleLowerCase().includes(searchQuery.trim().toLocaleLowerCase())),
  );
  const selectedTemplate = filteredTemplates.find(
    (template) => template.id === selectedTemplateId,
  ) ?? null;
  const selectedTabLabel = activeLibraryTab?.label ??
    templateLibraryTabs.find((tab) => tab.value === libraryType)?.label ?? "Layouts";
  const resolvedContextualActions = contextualActionsForTemplate
    ? contextualActionsForTemplate(selectedTemplate)
    : contextualActions;
  const activeInsertionAction = resolvedContextualActions.find(
    (action) => action.value === selectedInsertionAction,
  ) ?? resolvedContextualActions[0] ?? null;

  const layoutImportGroup = visibleLibraryTabs.find((tab) => tab.types.some((type) => type !== "element"));
  const layoutImportType = layoutImportGroup?.types.includes("page")
    ? "page"
    : layoutImportGroup?.types.find((type) => type !== "element");
  const stageImport = async (
    file: File,
    fallbackType: LayoutLibraryType,
    fallbackAcceptedTypes: LayoutLibraryType[],
  ) => {
    let importFormat: BuilderLibraryImportFormat = { source: "webpages" };
    try {
      importFormat = resolveBuilderLibraryImportFormat(JSON.parse(await file.text()) as unknown);
    } catch {
      // Keep the selected destination so its importer can report invalid JSON.
      importFormat = { source: "webpages", templateType: undefined };
    }
    const { source, templateType: importedType } = importFormat;
    const targetType = importedType ?? fallbackType;
    const acceptedTypes = importedType && !fallbackAcceptedTypes.includes(importedType)
      ? [importedType]
      : fallbackAcceptedTypes;
    const destinationTab = visibleLibraryTabs.find((tab) => tab.types.includes(targetType));
    if (destinationTab) onLibraryTypeChange?.(destinationTab.value);
    const fileName = file.name.replace(/\.[^.]+$/, "").trim();
    const typeLabel = templateLibraryTabs.find((tab) => tab.value === targetType)?.label.slice(0, -1) ?? "Layout";
    setPendingImport({ file, source, targetType, acceptedTypes });
    setPendingImportTitle(
      source === "yootheme"
        ? `${fileName || "YOOtheme"} ${typeLabel}`
        : fileName || `Imported ${typeLabel}`,
    );
  };

  const clearPendingImport = () => {
    setPendingImport(null);
    setPendingImportTitle("");
    setImportInputKey((key) => key + 1);
  };

  return (
    <div className={`builder-library-surface is-${mode}`}>
      {mode === "management" || onLibraryTypeChange ? (
        <div className="builder-template-tabs" role="tablist" aria-label="Library types">
          {visibleLibraryTabs.map((tab) => {
            const tabCount = libraryTemplates.filter(
              (template) => tab.types.includes(template.templateType ?? "page"),
            ).length;
            return (
              <button
                key={tab.value}
                type="button"
                role="tab"
                aria-selected={libraryType === tab.value}
                className={libraryType === tab.value ? "is-active" : ""}
                onClick={() => {
                  setSelectedTemplateId(null);
                  onLibraryTypeChange?.(tab.value);
                }}
              >
                <span>{tab.label}</span>
                <small>{tabCount}</small>
              </button>
            );
          })}
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

      {(onImport || onImportYootheme) ? (
        <div className="builder-library-toolbar">
          <div className="builder-library-count-search">
            <strong>{filteredTemplates.length} {selectedTabLabel}</strong>
            <label className="builder-library-search">
              <Search size={16} aria-hidden="true" />
              <input
                aria-label={`Search ${selectedTabLabel.toLowerCase()}`}
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder={`Search ${selectedTabLabel.toLowerCase()}`}
              />
            </label>
          </div>
          <div className="builder-library-toolbar-actions">
            {onSaveCurrent ? (
              <button
                type="button"
                className="builder-library-toolbar-button is-secondary"
                onClick={() => setSaveDialogOpen(true)}
              >
                <Save size={14} />
                Save Layout
              </button>
            ) : null}
            <label className="builder-library-upload-action">
              <Upload size={14} />
              <span>Upload Layout</span>
              <input
                key={`unified-upload-${importInputKey}`}
                type="file"
                accept=".json,application/json"
                onChange={(event) => {
                  const file = event.currentTarget.files?.[0];
                  if (!file) return;
                  const fallbackType = libraryType === "element" ? layoutImportType ?? libraryType : libraryType;
                  const fallbackTypes = libraryType === "element"
                    ? layoutImportGroup?.types ?? activeLibraryTypes
                    : activeLibraryTypes;
                  void stageImport(file, fallbackType, fallbackTypes);
                }}
              />
            </label>
          </div>
        </div>
      ) : null}

      {saveDialogOpen && onSaveCurrent ? (
        <div className="builder-library-save-layout-card">
          <label>
            <span>Layout name</span>
            <input
              autoFocus
              value={saveTitle}
              onChange={(event) => setSaveTitle(event.target.value)}
              placeholder="Optional custom name"
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  void onSaveCurrent(saveTitle.trim() || undefined);
                  setSaveDialogOpen(false);
                  setSaveTitle("");
                }
                if (event.key === "Escape") setSaveDialogOpen(false);
              }}
            />
          </label>
          <button type="button" className="builder-library-toolbar-button is-secondary" onClick={() => setSaveDialogOpen(false)}>
            Cancel
          </button>
          <button
            type="button"
            className="builder-library-toolbar-button is-primary"
            onClick={() => {
              void onSaveCurrent(saveTitle.trim() || undefined);
              setSaveDialogOpen(false);
              setSaveTitle("");
            }}
          >
            Save Layout
          </button>
        </div>
      ) : null}

      {filteredTemplates.length > 0 ? (
        <div className="builder-template-table">
          <div className="builder-template-table-header" aria-hidden="true">
            <span>Name</span>
            <span>Source page</span>
            <span>Type</span>
            <span>Last modified</span>
            <span />
          </div>
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
                className={`builder-page-row builder-template-row${
                  selectedTemplateId === template.id ? " is-selected" : ""
                }`}
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
                <div className="builder-template-name">
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
                  ) : (
                    <button
                      type="button"
                      className="builder-template-title"
                      aria-pressed={onContextualAction ? selectedTemplateId === template.id : undefined}
                      onClick={() => {
                        if (onContextualAction) setSelectedTemplateId(template.id);
                        else onApply(template);
                      }}
                    >
                      <strong>{template.title}</strong>
                    </button>
                  )}
                </div>
                <span className="builder-template-current-layout">{template.sourcePage ?? "—"}</span>
                <span className="builder-template-type">{templateType === "row" ? "Rows" : templateType === "element" ? "Elements" : "Layout"}</span>
                <time className="builder-template-updated" dateTime={template.updatedAt}>{new Date(template.updatedAt).toLocaleString()}</time>
                <div className="builder-template-row-actions">
                  {mode === "management" ? (
                    <button type="button" className="builder-template-use-button" onClick={() => onApply(template)} aria-label={`Use ${template.title}`}>
                      <Plus size={14} />
                    </button>
                  ) : null}
                  {onExport ? (
                    <button type="button" className="builder-icon-button" onClick={() => onExport(template)} aria-label={`Export ${template.title}`} title="Export">
                      <Download size={14} />
                    </button>
                  ) : null}
                  {onRename ? (
                    <button type="button" className="builder-icon-button" onClick={() => { setRenamingTemplateId(template.id); setRenameDraft(template.title); }} aria-label={`Rename ${template.title}`} title="Rename">
                      <Pencil size={14} />
                    </button>
                  ) : null}
                  {onDelete ? (
                    <button type="button" className="builder-icon-button" onClick={() => onDelete(template.id)} aria-label={`Delete ${template.title}`} title="Delete">
                      <Trash2 size={14} />
                    </button>
                  ) : null}
                </div>
              </div>
            );
          })}
          </div>
        </div>
      ) : (
        <div className="builder-template-note">
          <LibraryBig size={16} />
          <span>
            {libraryTemplates.length > 0
              ? `No ${selectedTabLabel.toLowerCase()} match your search.`
              : `No ${selectedTabLabel.toLowerCase()} saved yet. Save or upload one to My Layouts.`}
          </span>
        </div>
      )}

      {onContextualAction ? (
        <div className="builder-library-context-actions" aria-label="Library insertion actions">
          <span>
            {selectedTemplate
              ? `Selected: ${selectedTemplate.title}`
              : "Choose an insertion action for the selected layout."}
          </span>
          <select
            aria-label="Insert layout"
            value={activeInsertionAction?.value ?? ""}
            disabled={!selectedTemplate || resolvedContextualActions.length === 0}
            onChange={(event) => setSelectedInsertionAction(event.target.value as LayoutLibraryInsertionAction)}
          >
            {resolvedContextualActions.map((action) => (
              <option key={action.value} value={action.value}>{action.label}</option>
            ))}
          </select>
          <button
            type="button"
            className="builder-primary-button"
            disabled={!selectedTemplate || !activeInsertionAction}
            onClick={() => {
              if (selectedTemplate && activeInsertionAction) {
                onContextualAction(selectedTemplate, activeInsertionAction.value);
              }
            }}
          >
            Apply
          </button>
        </div>
      ) : null}

      {templateStatus ? <small className="builder-library-status">{templateStatus}</small> : null}
      {pendingImport ? (
        <div className="builder-library-import-name-card">
          <div>
            <strong>Name Library item</strong>
            <span>{pendingImport.file.name}</span>
          </div>
          <label className="builder-field">
            <span>Library item name</span>
            <input
              value={pendingImportTitle}
              onChange={(event) => setPendingImportTitle(event.target.value)}
              placeholder="Enter a name"
              autoFocus
            />
          </label>
          <div className="builder-layout-actions">
            <button type="button" className="builder-secondary-button" onClick={clearPendingImport}>
              Cancel
            </button>
            <button
              type="button"
              className="builder-primary-button"
              disabled={!pendingImportTitle.trim()}
              onClick={async () => {
                const title = pendingImportTitle.trim();
                if (!title) return;
                let imported: unknown;
                if (pendingImport.source === "yootheme") {
                  imported = await onImportYootheme?.(pendingImport.file, pendingImport.targetType, title);
                } else {
                  imported = await onImport?.(
                    pendingImport.file,
                    pendingImport.targetType,
                    title,
                    pendingImport.acceptedTypes,
                  );
                }
                if (imported !== false) clearPendingImport();
              }}
            >
              Import to Library
            </button>
          </div>
        </div>
      ) : null}
      {managementFooter}
    </div>
  );
}
