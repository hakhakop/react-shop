"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useTranslation } from "@/components/i18n/LanguageProvider";

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
  const { t } = useTranslation();

  async function handleDelete() {
    if (isDeleting) return;

    const confirmed = window.confirm(
      t("websites.deleteConfirm", { name: websiteName }),
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
        throw new Error(payload?.error ?? t("websites.deleteFailed"));
      }
      router.refresh();
    } catch (error) {
      window.alert(
        error instanceof Error ? error.message : t("websites.deleteFailed"),
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
      {isDeleting ? t("websites.deleting") : t("common.delete")}
    </button>
  );
}
