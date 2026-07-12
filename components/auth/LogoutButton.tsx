"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useTranslation } from "@/components/i18n/LanguageProvider";

export default function LogoutButton() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { t } = useTranslation();

  async function handleLogout() {
    setIsSubmitting(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      className="saas-auth-secondary-button"
      disabled={isSubmitting}
      onClick={handleLogout}
      type="button"
    >
      {isSubmitting ? t("auth.loggingOut") : t("auth.logout")}
    </button>
  );
}
