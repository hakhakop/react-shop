"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type GlobalStarterRecord = {
  id: string;
  sourceWebsiteId: string;
  title: string;
  description: string;
  category: string;
  sortOrder: number;
  enabled: boolean;
};

export default function GlobalStarterManager({
  websiteId,
  websiteName,
  starter,
}: {
  websiteId: string;
  websiteName: string;
  starter: GlobalStarterRecord | null;
}) {
  const router = useRouter();
  const [title, setTitle] = useState(starter?.title ?? websiteName);
  const [description, setDescription] = useState(starter?.description ?? "");
  const [category, setCategory] = useState(starter?.category ?? "WebPages");
  const [sortOrder, setSortOrder] = useState(String(starter?.sortOrder ?? 0));
  const [enabled, setEnabled] = useState(starter?.enabled ?? true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function request(url: string, init?: RequestInit) {
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch(url, {
        ...init,
        headers: { "content-type": "application/json", ...(init?.headers ?? {}) },
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(payload.error ?? "Global Starter update failed.");
      router.refresh();
      setMessage("Saved.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Global Starter update failed.");
    } finally {
      setBusy(false);
    }
  }

  if (!starter) {
    return (
      <div className="saas-admin-global-starter">
        <div className="saas-row-actions">
          <button
            type="button"
            disabled={busy}
            onClick={() => request("/api/admin/global-starters", {
              method: "POST",
              body: JSON.stringify({ sourceWebsiteId: websiteId, title: websiteName }),
            })}
          >
            {busy ? "Designating…" : "Designate as Global Starter"}
          </button>
        </div>
        {message && <small>{message}</small>}
      </div>
    );
  }

  return (
    <div className="saas-admin-global-starter">
      <span className="saas-admin-global-starter-label">Global Starter</span>
      <form onSubmit={(event) => {
        event.preventDefault();
        void request("/api/admin/global-starters", {
          method: "PUT",
          body: JSON.stringify({ id: starter.id, title, description, category, sortOrder: Number(sortOrder), enabled }),
        });
      }}>
        <label className="saas-auth-field"><span>Public title</span><input value={title} onChange={(event) => setTitle(event.target.value)} maxLength={120} /></label>
        <label className="saas-auth-field"><span>Description</span><textarea value={description} onChange={(event) => setDescription(event.target.value)} maxLength={240} rows={2} /></label>
        <label className="saas-auth-field"><span>Category</span><input value={category} onChange={(event) => setCategory(event.target.value)} maxLength={80} /></label>
        <label className="saas-auth-field"><span>Order</span><input type="number" min={0} max={9999} value={sortOrder} onChange={(event) => setSortOrder(event.target.value)} /></label>
        <label className="saas-admin-global-starter-toggle"><input type="checkbox" checked={enabled} onChange={(event) => setEnabled(event.target.checked)} /> Publicly enabled</label>
        <div className="saas-row-actions">
          <button type="submit" disabled={busy}>{busy ? "Saving…" : "Save"}</button>
          <button type="button" disabled={busy} onClick={() => {
            if (window.confirm("Remove this Global Starter designation? The source website will remain unchanged.")) {
              void request(`/api/admin/global-starters?id=${encodeURIComponent(starter.id)}`, { method: "DELETE" });
            }
          }}>Remove designation</button>
        </div>
      </form>
      {message && <small>{message}</small>}
    </div>
  );
}
