"use client";

import React, { useState, useEffect } from "react";
import { ChevronLeft, LibraryBig, Pencil, Plus, Save, Trash2, X } from "lucide-react";
import type {
  BuilderLayoutKey,
  BuilderSavedTemplate,
  BuilderState,
  BuilderTargetType,
  BuilderTemplate,
} from "./builderTypes";
import { createDragGhost } from "./builderDragGhost";

type TemplateLibraryTab = "page" | "section" | "row" | "element";

const BUILDER_TEMPLATE_DND_TYPE = "application/x-builder-template";
const BUILDER_TEMPLATE_DND_TYPES: Record<Exclude<TemplateLibraryTab, "page">, string> = {
  section: "application/x-builder-template-section",
  row: "application/x-builder-template-row",
  element: "application/x-builder-template-element",
};

const templateLibraryTabs: { value: TemplateLibraryTab; label: string }[] = [
  { value: "page", label: "Pages" },
  { value: "section", label: "Sections" },
  { value: "row", label: "Rows" },
  { value: "element", label: "Elements" },
];

type TemplatesPanelProps = {
  builderState: BuilderState;
  savedTemplates: BuilderSavedTemplate[];
  renameTemplateRequest?: {
    id: string;
    templateType: NonNullable<BuilderSavedTemplate["templateType"]>;
  } | null;
  templateDescriptions: Record<BuilderTemplate, string>;
  templateLabels: Record<BuilderTemplate, string>;
  templateStatus: string;
  selectedSectionTitle?: string | null;
  selectedElementLabel?: string | null;
  onSwitchBuilderTarget: (nextKey: BuilderLayoutKey) => void;
  onDeleteSavedTemplate: (id: string) => void;
  onSaveCurrentPageAsTemplate: (title?: string) => void | Promise<unknown>;
  onSaveSelectedSectionAsTemplate?: (title?: string) => void | Promise<unknown>;
  onSaveSelectedElementAsTemplate?: (title?: string) => void | Promise<unknown>;
  onApplySavedTemplate?: (template: BuilderSavedTemplate) => void;
  onRenameSavedTemplate?: (template: BuilderSavedTemplate, title: string) => void;
};

export default function TemplatesPanel({
  builderState,
  savedTemplates,
  renameTemplateRequest,
  templateDescriptions,
  templateLabels,
  templateStatus,
  selectedSectionTitle,
  selectedElementLabel,
  onSwitchBuilderTarget,
  onDeleteSavedTemplate,
  onSaveCurrentPageAsTemplate,
  onSaveSelectedSectionAsTemplate = () => undefined,
  onSaveSelectedElementAsTemplate = () => undefined,
  onApplySavedTemplate = () => undefined,
  onRenameSavedTemplate = () => undefined,
}: TemplatesPanelProps) {
  const [templateDraftTitle, setTemplateDraftTitle] = useState("");
  const [templateLibraryTab, setTemplateLibraryTab] = useState<TemplateLibraryTab>("section");
  const [renamingTemplateId, setRenamingTemplateId] = useState<string | null>(null);
  const [renamingTemplateTitle, setRenamingTemplateTitle] = useState("");

  useEffect(() => {
    if (!renameTemplateRequest) return;
    const template = savedTemplates.find((item) => item.id === renameTemplateRequest.id);
    if (!template) return;
    setTemplateLibraryTab(renameTemplateRequest.templateType);
    setRenamingTemplateId(template.id);
    setRenamingTemplateTitle(template.title);
  }, [renameTemplateRequest, savedTemplates]);

  const templateTitleValue = templateDraftTitle.trim();
  const saveTemplateAndClear = (kind: "page" | "section" | "element") => {
    const nextTitle =
      templateTitleValue ||
      (kind === "page"
        ? builderState.page
        : kind === "section"
          ? selectedSectionTitle || "Saved Section"
          : selectedElementLabel || "Saved Element");

    if (kind === "page") onSaveCurrentPageAsTemplate(nextTitle);
    if (kind === "section") onSaveSelectedSectionAsTemplate(nextTitle);
    if (kind === "element") onSaveSelectedElementAsTemplate(nextTitle);

    setTemplateDraftTitle("");
  };

  const filteredTemplates = savedTemplates.filter(
    (template) => (template.templateType ?? "page") === templateLibraryTab,
  );
  const selectedTemplateTabLabel =
    templateLibraryTabs.find((tab) => tab.value === templateLibraryTab)?.label ?? "Templates";

  return (
    <div className="builder-sidebar-panel">
      <div className="builder-sidebar-panel-header">
        <div>
          <strong>Templates</strong>
          <span>Save and reuse pages, sections, and elements</span>
        </div>
        <small>{savedTemplates.length}</small>
      </div>

      <div className="builder-card builder-pages-card" style={{ marginBottom: "14px" }}>
        <div className="builder-card-title">
          <strong>Global Layout Target</strong>
        </div>
        <div className="builder-target-toggle" aria-label="Builder target type">
          {(["page", "template"] as BuilderTargetType[]).map((targetType) => (
            <button
              key={targetType}
              type="button"
              className={(builderState.targetType ?? "page") === targetType ? "is-active" : ""}
              onClick={() => onSwitchBuilderTarget(targetType === "page" ? "shop" : "product-single")}
            >
              {targetType === "page" ? "Custom Pages" : "Global Templates"}
            </button>
          ))}
        </div>
        {(builderState.targetType ?? "page") === "template" && (
          <label className="builder-field" style={{ marginTop: "12px" }}>
            <span>Editing Template</span>
            <select
              value={builderState.page}
              onChange={(event) => onSwitchBuilderTarget(event.target.value as BuilderLayoutKey)}
            >
              {Object.entries(templateLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        )}
        {(builderState.targetType ?? "page") === "template" && builderState.template && (
          <div className="builder-template-note" style={{ marginTop: "8px" }}>
            <strong>{templateLabels[builderState.template]}</strong>
            <span>{templateDescriptions[builderState.template]}</span>
          </div>
        )}
      </div>

      <div className="builder-card builder-pages-card">
        <div className="builder-card-title">
          <strong>Save Reusable Template</strong>
          <span>{builderState.page}</span>
        </div>
        <label className="builder-field">
          <span>Template name</span>
          <input
            type="text"
            value={templateDraftTitle}
            onChange={(event) => setTemplateDraftTitle(event.target.value)}
            placeholder="Optional custom name"
          />
        </label>
        <div className="builder-template-save-list">
          <button type="button" className="builder-template-save-card" onClick={() => saveTemplateAndClear("page")}>
            <Save size={16} />
            <span>
              <strong>Save Current Page</strong>
              <small>Reusable full-page layout</small>
            </span>
          </button>
          <button
            type="button"
            className="builder-template-save-card"
            onClick={() => saveTemplateAndClear("section")}
            disabled={!selectedSectionTitle}
            title={selectedSectionTitle ? `Save selected section: ${selectedSectionTitle}` : "Click a section in the preview first"}
          >
            <Save size={16} />
            <span>
              <strong>Save Selected Section</strong>
              <small>{selectedSectionTitle ? selectedSectionTitle : "Click a section first"}</small>
            </span>
          </button>
          <button
            type="button"
            className="builder-template-save-card"
            onClick={() => saveTemplateAndClear("element")}
            disabled={!selectedElementLabel}
            title={selectedElementLabel ? `Save selected element: ${selectedElementLabel}` : "Click an element in the preview first"}
          >
            <Save size={16} />
            <span>
              <strong>Save Selected Element</strong>
              <small>{selectedElementLabel ? selectedElementLabel : "Click an element first"}</small>
            </span>
          </button>
        </div>
        <small>{templateStatus}</small>
      </div>

      <div className="builder-template-tabs" role="tablist" aria-label="Template types">
        {templateLibraryTabs.map((tab) => {
          const tabCount = savedTemplates.filter((template) => (template.templateType ?? "page") === tab.value).length;
          return (
            <button
              key={tab.value}
              type="button"
              role="tab"
              aria-selected={templateLibraryTab === tab.value}
              className={templateLibraryTab === tab.value ? "is-active" : ""}
              onClick={() => {
                setTemplateLibraryTab(tab.value);
                setRenamingTemplateId(null);
              }}
            >
              <span>{tab.label}</span>
              <small>{tabCount}</small>
            </button>
          );
        })}
      </div>

      {filteredTemplates.length > 0 ? (
        <div className="builder-pages-list builder-template-list">
          {filteredTemplates.map((template) => {
            const templateType = template.templateType ?? "page";
            const canDragTemplate = templateType !== "page";
            const templateDragMimeType = canDragTemplate ? BUILDER_TEMPLATE_DND_TYPES[templateType as Exclude<TemplateLibraryTab, "page">] : null;
            return (
              <div
                key={template.id}
                className="builder-page-row builder-template-row"
                draggable={canDragTemplate && renamingTemplateId !== template.id}
                onDragStart={(event) => {
                  if (!canDragTemplate || renamingTemplateId === template.id) {
                    event.preventDefault();
                    return;
                  }
                  event.dataTransfer.setData(BUILDER_TEMPLATE_DND_TYPE, template.id);
                  if (templateDragMimeType) {
                    event.dataTransfer.setData(templateDragMimeType, template.id);
                  }
                  event.dataTransfer.effectAllowed = "copy";
                  createDragGhost(event, template.title || "Template");
                }}
              >
                {renamingTemplateId === template.id ? (
                  <>
                    <input
                      className="builder-template-rename-input"
                      value={renamingTemplateTitle}
                      onChange={(event) => setRenamingTemplateTitle(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          onRenameSavedTemplate(template, renamingTemplateTitle);
                          setRenamingTemplateId(null);
                        }
                        if (event.key === "Escape") {
                          setRenamingTemplateId(null);
                        }
                      }}
                      autoFocus
                    />
                    <button
                      type="button"
                      className="builder-icon-button"
                      onClick={() => {
                        onRenameSavedTemplate(template, renamingTemplateTitle);
                        setRenamingTemplateId(null);
                      }}
                      aria-label={`Save new name for ${template.title}`}
                    >
                      <Save size={14} />
                    </button>
                    <button
                      type="button"
                      className="builder-icon-button"
                      onClick={() => setRenamingTemplateId(null)}
                      aria-label="Cancel rename"
                    >
                      <X size={14} />
                    </button>
                  </>
                ) : (
                  <>
                    <button type="button" onClick={() => onApplySavedTemplate(template)}>
                      <strong>{template.title}</strong>
                      <span className="builder-template-meta">
                        {templateType.toUpperCase()} · {template.sourcePage ?? "template"} · {new Date(template.updatedAt).toLocaleDateString()}
                      </span>
                    </button>
                    <div className="builder-template-actions" aria-label={`${template.title} template actions`}>
                      <button type="button" className="builder-template-use-button" onClick={() => onApplySavedTemplate(template)}>
                        <Plus size={14} />
                        Use
                      </button>
                      <button
                        type="button"
                        className="builder-icon-button"
                        onClick={() => {
                          setRenamingTemplateId(template.id);
                          setRenamingTemplateTitle(template.title);
                        }}
                        aria-label={`Rename ${template.title}`}
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        type="button"
                        className="builder-icon-button"
                        onClick={() => onDeleteSavedTemplate(template.id)}
                        aria-label={`Delete ${template.title}`}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="builder-template-note">
          <LibraryBig size={16} />
          <span>
            {savedTemplates.length > 0
              ? `No ${selectedTemplateTabLabel.toLowerCase()} templates saved yet.`
              : "Saved templates will appear here after you save from a page, section, row, or element toolbar."}
          </span>
        </div>
      )}
    </div>
  );
}
