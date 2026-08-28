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
  /** Show tenant-owned and shared Library sources as separate views. */
  siteLibraryEnabled?: boolean;
  templateStatus?: string;
  onLibraryTypeChange?: (type: LayoutLibraryType) => void;
  onOpenDocument?: (type: "header" | "footer") => void;
  onSaveCurrent?: (title?: string) => void | Promise<unknown>;
  saveLabel?: string;
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
  siteLibraryEnabled = false,
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
  availableLibraryTypes,
  libraryGroups,
  contextualActions = [],
  contextualActionsForTemplate,
  onContextualAction,
  managementFooter,
}: LayoutLibrarySurfaceProps) {
  const [libraryScope, setLibraryScope] = useState<"site" | "shared">(
    siteLibraryEnabled ? "site" : "shared",
  );
  const [importInputKey, setImportInputKey] = useState(0);
  const [renamingTemplateId, setRenamingTemplateId] = useState<string | null>(null);
  const [renameDraft, setRenameDraft] = useState("");
  const [saveTitle, setSaveTitle] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [pendingImport, setPendingImport] = useState<{
    file: File;
    source: "webpages" | "yootheme";
  } | null>(null);
  const [pendingImportTitle, setPendingImportTitle] = useState("");
  const scopedTemplates = savedTemplates.filter(
    (template) => (template.libraryScope ?? "shared") === libraryScope,
  );
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
  const filteredTemplates = scopedTemplates.filter(
    (template) => activeLibraryTypes.includes(template.templateType ?? "page"),
  );
  const selectedTemplate = filteredTemplates.find(
    (template) => template.id === selectedTemplateId,
  ) ?? null;
  const selectedTabLabel = activeLibraryTab?.label ??
    templateLibraryTabs.find((tab) => tab.value === libraryType)?.label ?? "Layouts";
  const resolvedContextualActions = contextualActionsForTemplate
    ? contextualActionsForTemplate(selectedTemplate)
    : contextualActions;

  const stageImport = (file: File, source: "webpages" | "yootheme") => {
    const fileName = file.name.replace(/\.[^.]+$/, "").trim();
    const typeLabel = selectedTabLabel.slice(0, -1);
    setPendingImport({ file, source });
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
      {siteLibraryEnabled ? (
        <div className="builder-library-scope-tabs" role="tablist" aria-label="Library source">
          {(["site", "shared"] as const).map((scope) => (
            <button
              key={scope}
              type="button"
              role="tab"
              aria-selected={libraryScope === scope}
              className={libraryScope === scope ? "is-active" : ""}
              onClick={() => {
                setLibraryScope(scope);
                setSelectedTemplateId(null);
                clearPendingImport();
              }}
            >
              <span>{scope === "site" ? "This Site" : "Shared"}</span>
              <small>{savedTemplates.filter((template) => (template.libraryScope ?? "shared") === scope).length}</small>
            </button>
          ))}
        </div>
      ) : null}
      {mode === "management" || onLibraryTypeChange ? (
        <div className="builder-template-tabs" role="tablist" aria-label="Library types">
          {visibleLibraryTabs.map((tab) => {
            const tabCount = scopedTemplates.filter(
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

      {mode === "contextual" && onSaveCurrent && (libraryScope === "site" || !siteLibraryEnabled) ? (
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
            const templateIsShared = template.libraryScope === "shared";
            const templateIsReadOnlyShared = siteLibraryEnabled && templateIsShared;
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
                <button
                  type="button"
                  aria-pressed={onContextualAction ? selectedTemplateId === template.id : undefined}
                  onClick={() => {
                    if (onContextualAction) {
                      setSelectedTemplateId(template.id);
                      return;
                    }
                    onApply(template);
                  }}
                >
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
                    {templateIsShared ? "SHARED · " : ""}{(activeLibraryTypes.length > 1
                      ? selectedTabLabel.replace(/s$/, "")
                      : templateType
                    ).toUpperCase()} · {template.sourcePage ?? "template"} · {new Date(template.updatedAt).toLocaleDateString()}
                  </span>
                </button>
                <button
                  type="button"
                  className="builder-template-use-button"
                  onClick={() => {
                    if (onContextualAction) {
                      setSelectedTemplateId(template.id);
                      return;
                    }
                    onApply(template);
                  }}
                >
                  <Plus size={14} />
                  {onContextualAction ? "Select" : "Use"}
                </button>
                {onExport ? (
                  <button type="button" className="builder-icon-button" onClick={() => onExport(template)} aria-label={`Export ${template.title}`}>
                    <Download size={14} />
                  </button>
                ) : null}
                {onRename && !templateIsReadOnlyShared ? (
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
                {onDelete && !templateIsReadOnlyShared ? (
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
            {scopedTemplates.length > 0
              ? `No ${selectedTabLabel.toLowerCase()} saved in ${libraryScope === "site" ? "This Site" : "Shared"}.`
              : libraryScope === "site"
                ? "This site has no saved layouts yet. Save or import one from the current Builder."
                : "No shared layouts are available."}
          </span>
        </div>
      )}

      {onContextualAction ? (
        <div className="builder-library-context-actions" aria-label="Library insertion actions">
          <span>
            {selectedTemplate
              ? resolvedContextualActions.some((action) => action.label === "Replace Layout")
                ? `Insert “${selectedTemplate.title}” near the current selection, or replace the entire layout.`
                : `Insert “${selectedTemplate.title}” into the current structure.`
              : "Select a Library composition to choose how it is inserted."}
          </span>
          <div>
            {resolvedContextualActions.map((action) => (
              <button
                key={action.value}
                type="button"
                className={action.value === "replace" ? "builder-secondary-button" : "builder-primary-button"}
                disabled={!selectedTemplate}
                onClick={() => {
                  if (selectedTemplate) onContextualAction(selectedTemplate, action.value);
                }}
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {templateStatus ? <small className="builder-library-status">{templateStatus}</small> : null}
      {pendingImport && (libraryScope === "site" || !siteLibraryEnabled) ? (
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
                  imported = await onImportYootheme?.(pendingImport.file, libraryType, title);
                } else {
                  imported = await onImport?.(
                    pendingImport.file,
                    libraryType,
                    title,
                    activeLibraryTypes,
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
      {onImport && (libraryScope === "site" || !siteLibraryEnabled) ? (
        <label className="builder-template-import-control">
          <Upload size={14} />
          <span>Import {selectedTabLabel.slice(0, -1)} JSON to Library</span>
          <input
            key={`${libraryType}-${importInputKey}`}
            type="file"
            accept=".json,application/json"
            onChange={async (event) => {
              const file = event.currentTarget.files?.[0];
              if (!file) return;
              stageImport(file, "webpages");
            }}
          />
        </label>
      ) : null}
      {onImportYootheme && (libraryScope === "site" || !siteLibraryEnabled) && (
        mode === "contextual"
          ? activeLibraryTypes.some((type) => type !== "element")
          : libraryType === "header" || libraryType === "footer"
      ) ? (
        <label className="builder-template-import-control">
          <Upload size={14} />
          <span>Import YOOtheme JSON to Library</span>
          <input
            key={`yootheme-${libraryType}-${importInputKey}`}
            type="file"
            accept=".json,application/json"
            onChange={async (event) => {
              const file = event.currentTarget.files?.[0];
              if (!file) return;
              stageImport(file, "yootheme");
            }}
          />
        </label>
      ) : null}
      {managementFooter}
    </div>
  );
}
