"use client";

import Link from "next/link";
import { SiteIcon } from "@/components/ui/SiteIcon";
import { useWordPressSession } from "./useWordPressSession";

const wordpressBaseUrl = process.env.NEXT_PUBLIC_WORDPRESS_SITE_URL ?? null;

export default function HeaderAccountButton() {
  const { session } = useWordPressSession(wordpressBaseUrl);
  const isLoggedIn = session.status === "logged-in";
  const label = isLoggedIn ? session.name : "Account";
  const statusLabel =
    session.status === "checking"
      ? "Checking account"
      : isLoggedIn
        ? "Signed in"
        : "Signed out";

  return (
    <Link
      href="/my-account"
      className={`header-account-pill header-account-pill--${session.status}`}
      aria-label={isLoggedIn ? `My account, signed in as ${session.name}` : "My account"}
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
