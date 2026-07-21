"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SiteIcon } from "@/components/ui/SiteIcon";

type AuthUser = {
  id?: string;
  name?: string;
  email?: string;
} | null;

export default function HeaderAccountButton() {
  const [authState, setAuthState] = useState<{
    status: "checking" | "logged-in" | "logged-out";
    user: AuthUser;
  }>({
    status: "checking",
    user: null,
  });

  useEffect(() => {
    let cancelled = false;

    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" });
        if (!res.ok) {
          if (!cancelled) setAuthState({ status: "logged-out", user: null });
          return;
        }
        const data = (await res.json()) as { user?: AuthUser };
        if (!cancelled) {
          if (data.user) {
            setAuthState({ status: "logged-in", user: data.user });
          } else {
            setAuthState({ status: "logged-out", user: null });
          }
        }
      } catch {
        if (!cancelled) setAuthState({ status: "logged-out", user: null });
      }
    }

    checkAuth();

    return () => {
      cancelled = true;
    };
  }, []);

  const isLoggedIn = authState.status === "logged-in";
  const href = isLoggedIn ? "/app" : "/login";
  const label = isLoggedIn ? (authState.user?.name || "Dashboard") : "Account";
  const statusLabel =
    authState.status === "checking"
      ? "Checking account"
      : isLoggedIn
        ? "Signed in"
        : "Signed out";

  return (
    <Link
      href={href}
      className={`header-account-pill header-account-pill--${authState.status}`}
      aria-label={isLoggedIn ? `Dashboard, signed in as ${authState.user?.name ?? "user"}` : "Log in to account"}
    >
      <span className="header-account-icon">
        <SiteIcon name="user" className="h-4 w-4" />
      </span>
      <span className="header-account-copy">
        <strong>{label}</strong>
        <small>{statusLabel}</small>
      </span>
      <span className="header-account-state" aria-hidden="true" />
    </Link>
  );
}
