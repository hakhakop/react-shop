"use client";

import { Check, ExternalLink, LoaderCircle, Search, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

type Family = "product" | "post";
type Identity = { provider: "woocommerce" | "wordpress"; contentType: Family; contentId: string };
type Item = { identity: Identity; title: string; slug: string; thumbnail?: string; publicationState: string };
type Status = {
  identity: Identity;
  contentAvailability: string;
  individualLayout: null | { layoutId: string };
  assignedTemplate: null | { templateId: string; name: string; layoutId: string };
  effective: { source: string; layoutId?: string };
  fallback: { source: string; layoutId?: string };
};

type Props = { websiteId?: string };

function labelSource(source: string) {
  if (source === "individual") return "Individual Layout";
  if (source === "routing-template") return "Assigned Template";
  if (source === "not-found") return "Native fallback";
  return source;
}

function encodeIdentity(identity: Identity) {
  const bytes = new TextEncoder().encode(JSON.stringify(identity));
  let binary = "";
  bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  return `v1.${btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")}`;
}

function cloneAuthoredSections(sections: unknown) {
  const source = structuredClone(sections ?? []) as Array<Record<string, any>>;
  return source.map((section) => {
    const rowIds = new Map<string, string>();
    const layoutItems = Array.isArray(section.layoutItems) ? section.layoutItems.map((item: Record<string, any>) => {
      const nextRowId = typeof item.rowId === "string"
        ? (rowIds.get(item.rowId) ?? (() => { const value = `layout-row-${crypto.randomUUID()}`; rowIds.set(item.rowId, value); return value; })())
        : item.rowId;
      return {
        ...item,
        id: `layout-item-${crypto.randomUUID()}`,
        rowId: nextRowId,
        blocks: Array.isArray(item.blocks) ? item.blocks.map((block: Record<string, any>) => ({ ...block, id: `${block.kind ?? "block"}-${crypto.randomUUID()}` })) : item.blocks,
      };
    }) : section.layoutItems;
    return { ...section, id: `section-${crypto.randomUUID()}`, layoutItems };
  });
}

export default function ContentPanel({ websiteId }: Props) {
  const [family, setFamily] = useState<Family>("product");
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<Item[]>([]);
  const [selected, setSelected] = useState<Item | null>(null);
  const [status, setStatus] = useState<Status | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusLoading, setStatusLoading] = useState(false);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const api = useCallback((path: string, params: Record<string, string> = {}) => {
    const search = new URLSearchParams(params);
    if (websiteId) search.set("websiteId", websiteId);
    return `${path}?${search.toString()}`;
  }, [websiteId]);

  const loadItems = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const response = await fetch(api("/api/content-discovery", {
        family, limit: "24", ...(query.trim() ? { query: query.trim() } : {}),
      }), { cache: "no-store" });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Content is unavailable.");
      const discovered = (payload.items ?? []) as Item[];
      let assigned: Array<Identity & { layoutId: string }> = [];
      try {
        const assignmentResponse = await fetch(api("/api/individual-layouts", { view: "assignments" }), { cache: "no-store" });
        const assignmentPayload = await assignmentResponse.json();
        if (assignmentResponse.ok) assigned = (assignmentPayload.assignments ?? []).filter((assignment: Identity & { layoutId: string }) => assignment.contentType === family);
      } catch { /* discovery remains useful even if orphan enumeration is unavailable */ }
      const known = new Set(discovered.map((item) => item.identity.contentId));
      const orphaned = assigned.filter((assignment: Identity & { layoutId: string }) => !known.has(assignment.contentId)).map((assignment: Identity & { layoutId: string }) => ({ identity: assignment, title: `Unavailable ${family === "product" ? "Product" : "Post"}`, slug: "", publicationState: "missing" }));
      setItems([...discovered, ...orphaned]);
    } catch (cause) {
      setItems([]); setError(cause instanceof Error ? cause.message : "Content is unavailable.");
    } finally { setLoading(false); }
  }, [api, family, query]);

  useEffect(() => {
    const timer = window.setTimeout(() => { void loadItems(); }, query ? 250 : 0);
    return () => window.clearTimeout(timer);
  }, [loadItems, query]);

  const loadStatus = useCallback(async (item: Item) => {
    setSelected(item); setStatusLoading(true); setStatus(null); setNotice(null);
    try {
      const response = await fetch(api("/api/individual-layouts", item.identity), { cache: "no-store" });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Unable to load layout status.");
      setStatus(payload.status);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to load layout status."); }
    finally { setStatusLoading(false); }
  }, [api]);

  const navigateBuilder = useCallback((params: Record<string, string>) => {
    const next = new URLSearchParams(window.location.search);
    ["page", "template", "context", "routingTemplate", "individual"].forEach((key) => next.delete(key));
    Object.entries(params).forEach(([key, value]) => next.set(key, value));
    window.location.assign(`${window.location.pathname}?${next.toString()}`);
  }, []);

  const createIndividual = useCallback(async (fromAssigned: boolean) => {
    if (!selected || !status) return;
    setWorking(true); setError(null);
    try {
      let layout: Record<string, unknown> = {};
      if (fromAssigned && status.assignedTemplate) {
        const response = await fetch(api("/api/builder-template-context", {
          document: status.assignedTemplate.layoutId,
          routingTemplate: status.assignedTemplate.templateId,
        }), { cache: "no-store" });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error || "Assigned Template is unavailable.");
        layout = { sections: cloneAuthoredSections(payload.layout.sections), design: structuredClone(payload.layout.design) };
      }
      const response = await fetch(api("/api/individual-layouts"), {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identity: selected.identity, layout }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Unable to create Individual Layout.");
      navigateBuilder({ document: payload.document.documentId, individual: encodeIdentity(selected.identity) });
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to create Individual Layout."); setWorking(false); }
  }, [api, navigateBuilder, selected, status]);

  const removeIndividual = useCallback(async () => {
    if (!selected || !status?.individualLayout) return;
    const fallback = status.assignedTemplate?.name || "native fallback";
    if (!window.confirm(`Removing this Individual Layout will make this ${family === "product" ? "Product" : "Post"} use: ${fallback}. Continue?`)) return;
    setWorking(true); setError(null);
    try {
      const response = await fetch(api("/api/individual-layouts", selected.identity), { method: "DELETE" });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Unable to remove Individual Layout.");
      if (payload.cleanup?.outcome === "preserved") setNotice("Individual Layout removed; the shared document was preserved because it is still referenced.");
      else setNotice("Individual Layout removed.");
      await loadStatus(selected);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to remove Individual Layout."); }
    finally { setWorking(false); }
  }, [api, family, loadStatus, selected, status]);

  const listTitle = useMemo(() => family === "product" ? "Products" : "Posts", [family]);
  return (
    <div className="builder-sidebar-panel" data-testid="content-panel">
      <div className="builder-sidebar-panel-header"><div><strong>Content</strong><span>Manage Products and Posts</span></div><small>{items.length}</small></div>
      <div className="builder-card builder-pages-card">
        <div className="builder-target-toggle" role="tablist" aria-label="Content family">
          {(["product", "post"] as Family[]).map((value) => <button key={value} type="button" role="tab" aria-selected={family === value} className={family === value ? "is-active" : ""} onClick={() => { setFamily(value); setSelected(null); setStatus(null); }}>{value === "product" ? "Products" : "Posts"}</button>)}
        </div>
        <label className="builder-field" style={{ marginTop: 12 }}><span>Search {listTitle}</span><div style={{ position: "relative" }}><Search size={15} style={{ position: "absolute", left: 9, top: 10, opacity: .55 }} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`Search ${listTitle.toLowerCase()}`} style={{ paddingLeft: 30 }} /></div></label>
      </div>
      {error && <div className="builder-template-note" role="alert">{error}</div>}
      {notice && <div className="builder-template-note"><Check size={14} /> {notice}</div>}
      <div className="builder-card builder-pages-card">
        {loading ? <div className="builder-empty-state"><LoaderCircle className="spin" size={18} /> Loading {listTitle.toLowerCase()}…</div> : items.length === 0 ? <div className="builder-empty-state">{error ? "Content is unavailable." : `No ${listTitle.toLowerCase()} found.`}</div> : <div className="builder-pages-list">{items.map((item) => <button key={`${item.identity.provider}:${item.identity.contentId}`} type="button" className={`builder-page-row${selected?.identity.contentId === item.identity.contentId ? " is-active" : ""}`} onClick={() => void loadStatus(item)} style={{ width: "100%", textAlign: "left" }}><span style={{ display: "flex", gap: 10, alignItems: "center" }}>{item.thumbnail ? <img src={item.thumbnail} alt="" width={36} height={36} style={{ objectFit: "cover", borderRadius: 4 }} /> : <span style={{ width: 36, height: 36, borderRadius: 4, background: "rgba(255,255,255,.08)" }} />}<span><strong>{item.title}</strong><small>/{item.slug} · {item.publicationState}</small></span></span></button>)}</div>}
      </div>
      {selected && <div className="builder-card builder-pages-card"><div className="builder-card-title"><strong>{selected.title}</strong><span>{selected.slug ? `/${selected.slug}` : "Content unavailable"}</span></div>{statusLoading ? <div className="builder-empty-state"><LoaderCircle className="spin" size={18} /> Loading status…</div> : status && <><div className="builder-template-note"><strong>Individual Layout</strong><span>{status.individualLayout ? "Active" : "None"}</span></div><div className="builder-template-note"><strong>Assigned Template</strong><span>{status.assignedTemplate?.name || "None"}</span></div><div className="builder-template-note"><strong>Effective Layout</strong><span>{labelSource(status.effective.source)}</span></div><div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}>{status.individualLayout ? <><button type="button" className="builder-primary-button" disabled={working || status.contentAvailability === "missing"} onClick={() => navigateBuilder({ document: status.individualLayout!.layoutId, individual: encodeIdentity(selected.identity) })}><ExternalLink size={14} /> Edit Individual Layout</button><button type="button" className="builder-secondary-button" disabled={working} onClick={() => void removeIndividual()}><Trash2 size={14} /> Remove Individual Layout</button></> : <><button type="button" className="builder-primary-button" disabled={working || !status.assignedTemplate} onClick={() => void createIndividual(true)}>Create from Assigned Template</button><button type="button" className="builder-secondary-button" disabled={working} onClick={() => void createIndividual(false)}>Start Blank</button></>}{status.assignedTemplate && <button type="button" className="builder-secondary-button" disabled={working} onClick={() => navigateBuilder({ document: status.assignedTemplate!.layoutId, routingTemplate: status.assignedTemplate!.templateId, previewProvider: selected.identity.provider, previewContentType: selected.identity.contentType, previewContentId: selected.identity.contentId })}>Edit Assigned Template</button>}{!status.assignedTemplate && !status.individualLayout && <small>No assigned Routing Template exists. Start Blank is the available option.</small>}{status.contentAvailability === "missing" && <small>Content unavailable. Removal remains available; editing is disabled until the entity is available.</small>}</div></>}</div>}
    </div>
  );
}
