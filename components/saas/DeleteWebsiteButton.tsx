"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type DeleteWebsiteButtonProps = {
  websiteId: string;
  websiteName: string;
};

export default function DeleteWebsiteButton({
  websiteId,
  websiteName,
}: DeleteWebsiteButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    if (isDeleting) return;

    const confirmed = window.confirm(
      `Delete "${websiteName}"? This removes it from your websites list and cannot be undone.`,
    );
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      const response = await fetch(
        `/api/websites/${encodeURIComponent(websiteId)}`,
        {
          method: "DELETE",
        },
      );
      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(payload?.error ?? "Website could not be deleted.");
      }
      router.refresh();
    } catch (error) {
      window.alert(
        error instanceof Error ? error.message : "Website could not be deleted.",
      );
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <button
      className="saas-website-delete-button"
      disabled={isDeleting}
      onClick={handleDelete}
      type="button"
    >
      {isDeleting ? "Deleting..." : "Delete"}
    </button>
  );
}
