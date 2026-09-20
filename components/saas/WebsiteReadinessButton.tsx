"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function WebsiteReadinessButton({
  websiteId,
  status,
}: {
  websiteId: string;
  status: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  if (status !== "preparing" && status !== "ready") return null;

  async function updateReadiness() {
    setBusy(true);
    try {
      const response = await fetch(`/api/admin/websites/${encodeURIComponent(websiteId)}/readiness`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status: status === "preparing" ? "ready" : "preparing" }),
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(payload.error ?? "Website readiness could not be updated.");
      router.refresh();
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Website readiness could not be updated.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <button type="button" disabled={busy} onClick={() => void updateReadiness()}>
      {busy ? "Saving…" : status === "preparing" ? "Mark Ready" : "Revert to Preparing"}
    </button>
  );
}
