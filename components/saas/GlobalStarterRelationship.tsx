"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type GlobalStarterSummary = {
  id: string;
  title: string;
  category: string;
  enabled: boolean;
};

export default function GlobalStarterRelationship({
  websiteId,
  websiteName,
  starter,
}: {
  websiteId: string;
  websiteName: string;
  starter: GlobalStarterSummary | null;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function designate() {
    setBusy(true);
    setMessage("");

    try {
      const response = await fetch("/api/admin/global-starters", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ sourceWebsiteId: websiteId, title: websiteName }),
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(payload.error ?? "Global Starter designation failed.");
      }
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Global Starter designation failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="saas-admin-global-starter-relationship">
      <div className="saas-admin-global-starter-relationship-copy">
        <span className="saas-admin-global-starter-label">Global Starter</span>
        {starter ? (
          <span>
            {starter.title || websiteName} · {starter.category || "Uncategorized"}
          </span>
        ) : (
          <span>Make this website available in the public starter catalog.</span>
        )}
      </div>
      {starter ? (
        <div className="saas-row-actions">
          <span className={`saas-admin-global-starter-summary-status ${starter.enabled ? "is-enabled" : "is-disabled"}`}>
            {starter.enabled ? "Enabled" : "Disabled"}
          </span>
          <Link href={`/admin/global-starters?starterId=${encodeURIComponent(starter.id)}`}>
            Manage Starter
          </Link>
        </div>
      ) : (
        <div className="saas-row-actions">
          <button type="button" onClick={() => void designate()} disabled={busy}>
            {busy ? "Designating…" : "Designate as Global Starter"}
          </button>
        </div>
      )}
      {message && <small className="saas-admin-global-starter-relationship-message" role="status">{message}</small>}
    </div>
  );
}
