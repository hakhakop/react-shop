"use client";

import { ArrowDown, ArrowUp, Copy, Edit3, Plus, Power, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

type TemplateCondition =
  | { subject: "content-type"; operator: "include" | "exclude"; contentType: string }
  | { subject: "content-identity"; operator: "include" | "exclude"; identity: { provider: string; contentType: string; contentId: string } }
  | { subject: "taxonomy-term"; operator: "include" | "exclude"; taxonomy: string; termId: string };
type RoutingTemplate = {
  id: string;
  name: string;
  enabled: boolean;
  order: number;
  view: "singular" | "archive";
  conditions: TemplateCondition[];
  layoutId: string;
};

type Props = { websiteId?: string };

function assignmentSummary(template: RoutingTemplate) {
  const includeType = template.conditions.find((condition) =>
    condition.subject === "content-type" && condition.operator === "include",
  );
  const exclusions = template.conditions.filter((condition) => condition.operator === "exclude");
  const base = includeType?.subject === "content-type"
    ? ({ product: "All Products", post: "All Posts", "product-category": "All Product Categories", "post-category": "All Post Categories/Archives" }[includeType.contentType] ?? "Dynamic content")
    : "Singular content";
  if (!exclusions.length) return base;
  return `${base} · Excluding ${exclusions.length} rule${exclusions.length === 1 ? "" : "s"}`;
}

function displayName(template: RoutingTemplate) {
  if (template.id === "routing:legacy-product-single" && template.name === "Product Single") return "Default Product";
  if (template.id === "routing:legacy-post-single" && template.name === "Single Post") return "Default Post";
  return template.name;
}

export default function RoutingTemplatesPanel({ websiteId }: Props) {
  const [templates, setTemplates] = useState<RoutingTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [contentType, setContentType] = useState<"product" | "post" | "product-category" | "post-category">("product");
  const [starter, setStarter] = useState<"minimal" | "blank">("minimal");

  const apiUrl = useMemo(() => {
    const params = websiteId ? `?websiteId=${encodeURIComponent(websiteId)}` : "";
    return `/api/routing-templates${params}`;
  }, [websiteId]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(apiUrl, { cache: "no-store" });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Unable to load Templates.");
      setTemplates(payload.templates ?? []);
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
    return payload;
  }

  async function createTemplate() {
    if (!name.trim()) return;
    setCreating(false);
    try {
      await mutate({
        action: "create",
        name: name.trim(),
        contentType,
        conditions: [{ subject: "content-type", operator: "include", contentType }],
        enabled: true,
        starter,
      });
      setName("");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to create template."); }
  }

  async function editLayout(template: RoutingTemplate) {
    const params = new URLSearchParams({ document: template.layoutId, routingTemplate: template.id });
    if (websiteId) params.set("websiteId", websiteId);
    window.location.assign(`${window.location.pathname}?${params.toString()}`);
  }

  async function deleteTemplate(template: RoutingTemplate) {
    if (!window.confirm(`Delete “${displayName(template)}”?`)) return;
    try {
      const response = await fetch(`${apiUrl}${apiUrl.includes("?") ? "&" : "?"}id=${encodeURIComponent(template.id)}`, { method: "DELETE" });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Unable to delete template.");
      await load();
      if (payload.layoutDeleted === false) setError("Template deleted; its shared layout was preserved.");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to delete template."); }
  }

  async function renameTemplate(template: RoutingTemplate) {
    const nextName = window.prompt("Template name", displayName(template))?.trim();
    if (!nextName || nextName === template.name) return;
    try { await mutate({ action: "update", id: template.id, name: nextName }); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to rename template."); }
  }

  async function move(template: RoutingTemplate, direction: -1 | 1) {
    const index = templates.findIndex((item) => item.id === template.id);
    const nextIndex = index + direction;
    if (index < 0 || nextIndex < 0 || nextIndex >= templates.length) return;
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

  const groups = [
    { type: "product", title: "Single Product", empty: "No product templates yet." },
    { type: "product-category", title: "Product Category", empty: "No product-category templates yet." },
    { type: "post", title: "Single Post", empty: "No post templates yet." },
    { type: "post-category", title: "Post Category / Archive", empty: "No post-category templates yet." },
  ];

  return (
    <div className="builder-sidebar-panel routing-templates-panel">
      <div className="builder-card builder-pages-card">
        <div className="builder-card-title">
          <div><strong>Templates</strong><span>Routing assignments and layouts</span></div>
          <button type="button" className="builder-primary-button" onClick={() => setCreating((value) => !value)}><Plus size={14} /> New</button>
        </div>
        {creating && (
          <div className="routing-template-create-form" role="form" aria-label="Create template">
            <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Template name" aria-label="Name" autoFocus />
            <select value={contentType} onChange={(event) => setContentType(event.target.value as typeof contentType)} aria-label="Type">
              <option value="product">Single Product</option><option value="product-category">Product Category</option><option value="post">Single Post</option><option value="post-category">Post Category/Archive</option>
            </select>
            <select value={starter} onChange={(event) => setStarter(event.target.value as "minimal" | "blank")} aria-label="Starting Layout">
              <option value="minimal">Starter</option><option value="blank">Blank</option>
            </select>
            <small>{{ product: "All Products", post: "All Posts", "product-category": "All Product Categories", "post-category": "All Post Categories/Archives" }[contentType]}</small>
            <div><button type="button" className="builder-primary-button" onClick={() => void createTemplate()}>Create {starter === "minimal" ? "starter" : "blank"}</button><button type="button" className="builder-secondary-button" onClick={() => setCreating(false)}>Cancel</button></div>
          </div>
        )}
      </div>
      {error && <div className="builder-template-note" role="alert">{error}</div>}
      {loading ? <div className="builder-empty-state">Loading templates…</div> : groups.map((group) => {
        const items = templates.filter((template) => template.conditions.some((condition) => condition.subject === "content-type" && condition.contentType === group.type));
        return <section key={group.type} className="routing-template-group" aria-labelledby={`routing-${group.type}-title`}>
          <div className="routing-template-group-heading"><strong id={`routing-${group.type}-title`}>{group.title}</strong><span>{items.length}</span></div>
          {items.length === 0 ? <p className="builder-empty-state">{group.empty}</p> : items.map((template) => {
            const index = templates.findIndex((item) => item.id === template.id);
            return <article key={template.id} className={`routing-template-row${template.enabled ? "" : " is-disabled"}`}>
              <div className="routing-template-order" aria-label={`Precedence ${template.order / 10 + 1}`}>{template.order / 10 + 1}</div>
              <div className="routing-template-row-main"><strong>{displayName(template)}</strong><span>{assignmentSummary(template)} · {template.enabled ? "Enabled" : "Disabled"}</span></div>
              <div className="routing-template-row-actions">
                <button type="button" onClick={() => void move(template, -1)} disabled={index === 0} aria-label="Move up" title="Move up"><ArrowUp size={14} /></button>
                <button type="button" onClick={() => void move(template, 1)} disabled={index === templates.length - 1} aria-label="Move down" title="Move down"><ArrowDown size={14} /></button>
                <button type="button" onClick={() => void toggle(template)} aria-label={template.enabled ? "Disable" : "Enable"} title={template.enabled ? "Disable" : "Enable"}><Power size={14} /></button>
                <button type="button" onClick={() => void editLayout(template)} aria-label="Edit Layout"> <Edit3 size={14} /></button>
                <button type="button" onClick={() => void renameTemplate(template)} aria-label="Rename"><span className="sr-only">Rename</span>Rename</button>
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
