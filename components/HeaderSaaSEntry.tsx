"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type AuthMeResponse = {
  user?: {
    name?: string;
  } | null;
};

export default function HeaderSaaSEntry() {
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function checkSession() {
      try {
        const response = await fetch("/api/auth/me", { cache: "no-store" });
        if (!response.ok) return;
        const data = (await response.json()) as AuthMeResponse;
        if (!cancelled && data.user) {
          setUserName(data.user.name ?? "Dashboard");
        }
      } catch {
        if (!cancelled) {
          setUserName(null);
        }
      }
    }

    checkSession();

    return () => {
      cancelled = true;
    };
  }, []);

  if (userName) {
    return (
      <Link href="/app" className="site-header-action-pill site-header-saas-cta">
        Dashboard
      </Link>
    );
  }

  return (
    <Link href="/login" className="site-header-action-pill site-header-saas-cta">
      Login
    </Link>
  );
}
