"use client";

import { ArrowDown, ArrowUp, Copy, Edit3, Plus, Power, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { BuilderEditorContext, BuilderTemplateCreationContext } from "@/lib/builderEditorContext";
import { initialTemplatePageType, templateEditorSearchParams } from "@/lib/templateCreationContext";

type TemplateCondition =
  | { subject: "content-type"; operator: "include" | "exclude"; contentType: string }
  | { subject: "content-identity"; operator: "include" | "exclude"; identity: { provider: string; contentType: string; contentId: string } }
  | { subject: "taxonomy-term"; operator: "include" | "exclude"; taxonomy: string; termId: string; children?: "exclude" | "include" | "only" }
  | { subject: "request-taxonomy-term"; operator: "include" | "exclude"; taxonomy: string; termId: string }
  | { subject: "page-number"; operator: "include"; page: "first" | "except-first" }
  | { subject: "language"; operator: "include" | "exclude"; language: string };
type RoutingTemplate = {
  id: string;
  name: string;
  enabled: boolean;
  order: number;
  pageType: string;
  view: "singular" | "archive";
  conditions: TemplateCondition[];
  layoutId: string;
};
type TemplatePageType = {
  id: string;
  label: string;
  group: string;
  view: "singular" | "archive";
  provider: string;
  contentType: string;
  sourceKind: "content" | "taxonomy" | "system";
  taxonomy?: string;
  filters: Array<"content-identity" | "taxonomy-term" | "request-taxonomy-term" | "page-number" | "language">;
};

type Props = {
  websiteId?: string;
  creationContext?: BuilderTemplateCreationContext;
  editorContext?: BuilderEditorContext | null;
  onTemplatesChanged?: () => void | Promise<void>;
};

function assignmentSummary(template: RoutingTemplate, pageLabel?: string) {
  const includeType = template.conditions.find((condition) =>
    condition.subject === "content-type" && condition.operator === "include",
  );
  const filters = template.conditions.filter((condition) => condition.subject !== "content-type");
  const base = includeType?.subject === "content-type"
    ? ({ product: "All Products", post: "All Posts", "product-category": "All Product Categories", "post-category": "All Post Categories/Archives" }[includeType.contentType] ?? pageLabel ?? "Dynamic content")
    : pageLabel ?? "Dynamic content";
  if (!filters.length) return base;
  return `${base} · ${filters.length} assignment filter${filters.length === 1 ? "" : "s"}`;
}

function displayName(template: RoutingTemplate) {
  if (template.id === "routing:legacy-product-single" && template.name === "Product Single") return "Default Product";
  if (template.id === "routing:legacy-post-single" && template.name === "Single Post") return "Default Post";
  return template.name;
}

export default function RoutingTemplatesPanel({ websiteId, creationContext, editorContext, onTemplatesChanged }: Props) {
  const [templates, setTemplates] = useState<RoutingTemplate[]>([]);
  const [pageTypes, setPageTypes] = useState<TemplatePageType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [pageType, setPageType] = useState("");
  const [starter, setStarter] = useState<"minimal" | "blank">("minimal");
  const [editing, setEditing] = useState<RoutingTemplate | null>(null);
  const [editName, setEditName] = useState("");
  const [editPageType, setEditPageType] = useState("");
  const [editEnabled, setEditEnabled] = useState(true);
  const [includeIds, setIncludeIds] = useState("");
  const [excludeIds, setExcludeIds] = useState("");
  const [termIds, setTermIds] = useState("");
  const [requestTermIds, setRequestTermIds] = useState("");
  const [childMode, setChildMode] = useState<"exclude" | "include" | "only">("exclude");
  const [pageNumber, setPageNumber] = useState<"all" | "first" | "except-first">("all");
  const [language, setLanguage] = useState("");
  const activeTemplateId = editorContext?.ownership.activeTemplate?.templateId ?? "";
  const previewedTemplateId = editorContext?.document.kind === "routing-template"
    ? editorContext.ownership.assignedTemplate?.templateId ?? ""
    : "";

  const apiUrl = useMemo(() => {
    const params = websiteId ? `?websiteId=${encodeURIComponent(websiteId)}` : "";
    return `/api/routing-templates${params}`;
  }, [websiteId]);
  const selectedPageType = pageType || initialTemplatePageType(
    pageTypes.map((item) => item.id),
    creationContext,
  ) || "";

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(apiUrl, { cache: "no-store" });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Unable to load Templates.");
      setTemplates(payload.templates ?? []);
      setPageTypes(payload.pageTypes ?? []);
      setError(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to load Templates.");
    } finally {
      setLoading(false);
    }
  }, [apiUrl]);

  useEffect(() => { void load(); }, [load]);

  async function mutate(body: Record<string, unknown>) {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || "Template update failed.");
    await load();
    await onTemplatesChanged?.();
    return payload;
  }

  async function createTemplate() {
    if (!name.trim()) return;
    setCreating(false);
    try {
      const payload = await mutate({
        action: "create",
        name: name.trim(),
        pageType: selectedPageType,
        enabled: true,
        starter,
      });
      setName("");
      const template = payload.template as RoutingTemplate | undefined;
      if (template) editLayout(template);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to create template."); }
  }

  function editLayout(
    template: RoutingTemplate,
    previewOverride?: BuilderTemplateCreationContext["previewIdentity"] | null,
  ) {
    const previewIdentity = previewOverride === null
      ? undefined
      : previewOverride ?? (
          creationContext?.pageType === template.pageType
            ? creationContext.previewIdentity
            : undefined
        );
    const params = templateEditorSearchParams({
      layoutId: template.layoutId,
      templateId: template.id,
      ...(websiteId ? { websiteId } : {}),
      ...(previewIdentity ? { previewIdentity } : {}),
    });
    // Switching the Builder's document owner must rematerialize the canonical
    // editor context. A search-param-only client transition preserves this
    // mounted Builder's previous document state.
    window.location.assign(`${window.location.pathname}?${params.toString()}`);
  }

  function startCreating() {
    if (!creating) setPageType("");
    setCreating((value) => !value);
  }

  async function deleteTemplate(template: RoutingTemplate) {
    if (!window.confirm(`Delete “${displayName(template)}”?`)) return;
    try {
      const response = await fetch(`${apiUrl}${apiUrl.includes("?") ? "&" : "?"}id=${encodeURIComponent(template.id)}`, { method: "DELETE" });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Unable to delete template.");
      await load();
      await onTemplatesChanged?.();
      if (payload.layoutDeleted === false) setError("Template deleted; its shared layout was preserved.");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to delete template."); }
  }

  function editSettings(template: RoutingTemplate) {
    const definition = pageTypes.find((item) => item.id === template.pageType);
    const identities = template.conditions.filter((item): item is Extract<TemplateCondition, { subject: "content-identity" }> => item.subject === "content-identity");
    const terms = template.conditions.filter((item): item is Extract<TemplateCondition, { subject: "taxonomy-term" }> => item.subject === "taxonomy-term");
    const requestTerms = template.conditions.filter((item): item is Extract<TemplateCondition, { subject: "request-taxonomy-term" }> => item.subject === "request-taxonomy-term");
    setEditing(template); setEditName(displayName(template)); setEditPageType(template.pageType); setEditEnabled(template.enabled);
    setIncludeIds(identities.filter((item) => item.operator === "include").map((item) => item.identity.contentId).join(", "));
    setExcludeIds(identities.filter((item) => item.operator === "exclude").map((item) => item.identity.contentId).join(", "));
    setTermIds(terms.filter((item) => item.operator === "include").map((item) => item.termId).join(", "));
    setRequestTermIds(requestTerms.filter((item) => item.operator === "include").map((item) => item.termId).join(", "));
    setChildMode(terms[0]?.children ?? "exclude");
    setPageNumber((template.conditions.find((item) => item.subject === "page-number") as Extract<TemplateCondition, { subject: "page-number" }> | undefined)?.page ?? "all");
    setLanguage((template.conditions.find((item) => item.subject === "language" && item.operator === "include") as Extract<TemplateCondition, { subject: "language" }> | undefined)?.language ?? "");
    if (!definition) setError("This template Page type is no longer registered by the connected providers.");
  }

  const ids = (value: string) => Array.from(new Set(value.split(",").map((item) => item.trim()).filter(Boolean)));

  async function saveSettings() {
    if (!editing) return;
    const definition = pageTypes.find((item) => item.id === editPageType);
    if (!definition) return setError("Choose a registered Page type.");
    const conditions: TemplateCondition[] = [{ subject: "content-type", operator: "include", contentType: definition.contentType }];
    ids(includeIds).forEach((contentId) => conditions.push({ subject: "content-identity", operator: "include", identity: { provider: definition.provider, contentType: definition.contentType, contentId } }));
    ids(excludeIds).forEach((contentId) => conditions.push({ subject: "content-identity", operator: "exclude", identity: { provider: definition.provider, contentType: definition.contentType, contentId } }));
    if (definition.taxonomy) {
      ids(termIds).forEach((termId) => conditions.push({ subject: "taxonomy-term", operator: "include", taxonomy: definition.taxonomy!, termId, children: childMode }));
      ids(requestTermIds).forEach((termId) => conditions.push({ subject: "request-taxonomy-term", operator: "include", taxonomy: definition.taxonomy!, termId }));
    }
    if (pageNumber !== "all") conditions.push({ subject: "page-number", operator: "include", page: pageNumber });
    if (language.trim()) conditions.push({ subject: "language", operator: "include", language: language.trim() });
    try {
      const payload = await mutate({ action: "update", id: editing.id, name: editName.trim(), enabled: editEnabled, pageType: editPageType, conditions });
      setEditing(null);
      // Assignment edits can invalidate the old concrete preview. Re-open the
      // edited document through its registered Page type so the server chooses
      // a satisfying context and recomputes the active storefront Template.
      if (editing.id === previewedTemplateId && payload.template) {
        editLayout(payload.template as RoutingTemplate, null);
      }
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to update template assignment."); }
  }

  async function move(template: RoutingTemplate, direction: -1 | 1) {
    const peers = templates.filter((item) => item.pageType === template.pageType);
    const peerIndex = peers.findIndex((item) => item.id === template.id);
    const nextPeer = peers[peerIndex + direction];
    if (!nextPeer) return;
    const index = templates.findIndex((item) => item.id === template.id);
    const nextIndex = templates.findIndex((item) => item.id === nextPeer.id);
    const ids = templates.map((item) => item.id);
    [ids[index], ids[nextIndex]] = [ids[nextIndex]!, ids[index]!];
    try { await mutate({ action: "reorder", ids }); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to reorder templates."); }
  }

  async function duplicate(template: RoutingTemplate) {
    try { await mutate({ action: "duplicate", id: template.id }); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to duplicate template."); }
  }

  async function toggle(template: RoutingTemplate) {
    try { await mutate({ action: "set-enabled", id: template.id, enabled: !template.enabled }); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to change template state."); }
  }

  const groups = pageTypes.filter((definition) => templates.some((template) => template.pageType === definition.id));

  return (
    <div className="builder-sidebar-panel routing-templates-panel">
      <div className="builder-card builder-pages-card">
        <div className="builder-card-title">
          <div><strong>Templates</strong><span>Routing assignments and layouts</span></div>
          <button type="button" className="builder-primary-button" onClick={startCreating}><Plus size={14} /> New</button>
        </div>
        {creating && (
          <div className="routing-template-create-form" role="form" aria-label="Create template">
            <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Template name" aria-label="Name" autoFocus />
            <select value={selectedPageType} onChange={(event) => setPageType(event.target.value)} aria-label="Page">
              {pageTypes.map((definition) => <option key={definition.id} value={definition.id}>{definition.label}</option>)}
            </select>
            <select value={starter} onChange={(event) => setStarter(event.target.value as "minimal" | "blank")} aria-label="Starting Layout">
              <option value="minimal">Starter</option><option value="blank">Blank</option>
            </select>
            <small>{pageTypes.find((definition) => definition.id === selectedPageType)?.label ?? "Registered Page type"}</small>
            {creationContext?.pageType === selectedPageType && creationContext.previewLabel ? <small>Preview: {creationContext.previewLabel}</small> : null}
            <div><button type="button" className="builder-primary-button" disabled={!selectedPageType} onClick={() => void createTemplate()}>Create {starter === "minimal" ? "starter" : "blank"}</button><button type="button" className="builder-secondary-button" onClick={() => setCreating(false)}>Cancel</button></div>
          </div>
        )}
      </div>
      {error && <div className="builder-template-note" role="alert">{error}</div>}
      {!loading && editorContext && !activeTemplateId && (
        <div className="builder-template-note" role="status">
          Active for current canvas: {editorContext.ownership.resolved?.source === "individual"
            ? "Individual Layout"
            : editorContext.ownership.resolved?.source === "not-found"
              ? "No matching layout"
              : "Page fallback"}
        </div>
      )}
      {editing && (() => {
        const definition = pageTypes.find((item) => item.id === editPageType);
        return <div className="builder-card builder-pages-card" role="dialog" aria-label="Edit template settings">
          <div className="builder-card-title"><div><strong>Edit Template</strong><span>Name, status, Page and assignment filters</span></div></div>
          <label className="builder-field"><span>Name</span><input aria-label="Template Name" value={editName} onChange={(event) => setEditName(event.target.value)} /></label>
          <label className="builder-field"><span>Status</span><select aria-label="Template Status" value={editEnabled ? "enabled" : "disabled"} onChange={(event) => setEditEnabled(event.target.value === "enabled")}><option value="enabled">Enabled</option><option value="disabled">Disabled</option></select></label>
          <label className="builder-field"><span>Page</span><select aria-label="Template Page" value={editPageType} onChange={(event) => setEditPageType(event.target.value)}>{pageTypes.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label>
          {definition?.filters.includes("content-identity") && <><label className="builder-field"><span>Only content IDs</span><input aria-label="Include Content IDs" value={includeIds} onChange={(event) => setIncludeIds(event.target.value)} placeholder="1416, 1420" /></label><label className="builder-field"><span>Exclude content IDs</span><input aria-label="Exclude Content IDs" value={excludeIds} onChange={(event) => setExcludeIds(event.target.value)} /></label></>}
          {definition?.filters.includes("taxonomy-term") && <><label className="builder-field"><span>Limit by {definition.taxonomy} term IDs</span><input aria-label="Primary Term IDs" value={termIds} onChange={(event) => setTermIds(event.target.value)} /></label><label className="builder-field"><span>Child terms</span><select aria-label="Child Terms" value={childMode} onChange={(event) => setChildMode(event.target.value as typeof childMode)}><option value="exclude">Exclude child terms</option><option value="include">Include child terms</option><option value="only">Only include child terms</option></select></label></>}
          {definition?.filters.includes("request-taxonomy-term") && <label className="builder-field"><span>Limit by request term IDs</span><input aria-label="Request Term IDs" value={requestTermIds} onChange={(event) => setRequestTermIds(event.target.value)} /></label>}
          {definition?.filters.includes("page-number") && <label className="builder-field"><span>Page number</span><select aria-label="Page Number" value={pageNumber} onChange={(event) => setPageNumber(event.target.value as typeof pageNumber)}><option value="all">All pages</option><option value="first">First page</option><option value="except-first">All except first page</option></select></label>}
          {definition?.filters.includes("language") && <label className="builder-field"><span>Language</span><input aria-label="Assignment Language" value={language} onChange={(event) => setLanguage(event.target.value)} placeholder="All languages" /></label>}
          <div style={{display:"flex",gap:8}}><button className="builder-primary-button" type="button" onClick={() => void saveSettings()}>Save</button><button className="builder-secondary-button" type="button" onClick={() => setEditing(null)}>Cancel</button></div>
        </div>;
      })()}
      {loading ? <div className="builder-empty-state">Loading templates…</div> : groups.map((group) => {
        const items = templates.filter((template) => template.pageType === group.id);
        return <section key={group.id} className="routing-template-group" aria-labelledby={`routing-${group.id.replaceAll(":", "-")}-title`}>
          <div className="routing-template-group-heading"><strong id={`routing-${group.id.replaceAll(":", "-")}-title`}>{group.label}</strong><span>{items.length}</span></div>
          {items.map((template) => {
            const peerIndex = items.findIndex((item) => item.id === template.id);
            const isActive = activeTemplateId === template.id;
            const isPreviewed = previewedTemplateId === template.id;
            return <article key={template.id} data-active-template={isActive || undefined} className={`routing-template-row${template.enabled ? "" : " is-disabled"}${isActive ? " is-active" : ""}`}>
              <div className="routing-template-order" aria-label={`Precedence ${peerIndex + 1}`}>{peerIndex + 1}</div>
              <button type="button" className="routing-template-row-main" aria-label={`Open ${displayName(template)} template`} onClick={() => editLayout(template)}><strong>{isActive && <span aria-label="Active template">● </span>}{displayName(template)}</strong><span>{assignmentSummary(template, group.label)} · {template.enabled ? "Enabled" : "Disabled"}{isPreviewed && !isActive ? " · Previewing" : ""}</span></button>
              <div className="routing-template-row-actions">
                <button type="button" onClick={() => void move(template, -1)} disabled={peerIndex === 0} aria-label="Move up" title="Move up"><ArrowUp size={14} /></button>
                <button type="button" onClick={() => void move(template, 1)} disabled={peerIndex === items.length - 1} aria-label="Move down" title="Move down"><ArrowDown size={14} /></button>
                <button type="button" onClick={() => void toggle(template)} aria-label={template.enabled ? "Disable" : "Enable"} title={template.enabled ? "Disable" : "Enable"}><Power size={14} /></button>
                <button type="button" onClick={() => editLayout(template)} aria-label="Edit Template" title="Edit Template"><Edit3 size={14} /><span className="sr-only">Edit Template</span></button>
                <button type="button" onClick={() => editSettings(template)} aria-label="Edit Settings"><span className="sr-only">Edit Settings</span>Settings</button>
                <button type="button" onClick={() => void duplicate(template)} aria-label="Duplicate" title="Duplicate"><Copy size={14} /></button>
                <button type="button" onClick={() => void deleteTemplate(template)} aria-label="Delete" title="Delete"><Trash2 size={14} /></button>
              </div>
            </article>;
          })}
        </section>;
      })}
    </div>
  );
}
