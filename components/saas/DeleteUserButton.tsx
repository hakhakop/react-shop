"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type DeleteUserButtonProps = {
  userId: string;
  userName: string;
  redirectAfterDelete?: boolean;
  disabled?: boolean;
  disabledReason?: string;
};

export default function DeleteUserButton({
  userId,
  userName,
  redirectAfterDelete = false,
  disabled = false,
  disabledReason,
}: DeleteUserButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    if (disabled || isDeleting) return;
    if (!window.confirm(`Delete ${userName}? This action cannot be undone.`)) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/admin/users/${encodeURIComponent(userId)}`, {
        method: "DELETE",
      });
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      if (!response.ok) throw new Error(payload?.error ?? "Unable to delete user.");

      if (redirectAfterDelete) {
        router.push("/admin/users");
      } else {
        router.refresh();
      }
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Unable to delete user.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <button
      type="button"
      className="saas-website-delete-button"
      disabled={disabled || isDeleting}
      onClick={handleDelete}
      title={disabledReason}
    >
      {isDeleting ? "Deleting…" : "Delete User"}
    </button>
  );
}
