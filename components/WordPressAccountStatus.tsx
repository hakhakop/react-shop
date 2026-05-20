"use client";

import { useCallback, useEffect, useState } from "react";
import { RefreshCw, ShieldCheck, UserRound } from "lucide-react";

type AccountState =
  | { status: "checking" }
  | { status: "logged-in"; name: string; email?: string }
  | { status: "logged-out" }
  | { status: "unreadable"; message: string };

type Props = {
  wordpressBaseUrl: string | null;
  accountUrl: string | null;
};

export default function WordPressAccountStatus({
  wordpressBaseUrl,
  accountUrl,
}: Props) {
  const [accountState, setAccountState] = useState<AccountState>({
    status: "checking",
  });

  const checkSession = useCallback(async () => {
    if (!wordpressBaseUrl) {
      setAccountState({
        status: "unreadable",
        message: "WordPress URL is not configured yet.",
      });
      return;
    }

    setAccountState({ status: "checking" });

    try {
      const sessionUrl = `${wordpressBaseUrl}/wp-json/react-shop/v1/session`;
      const response = await fetch(sessionUrl, {
        credentials: "include",
        headers: { Accept: "application/json" },
        cache: "no-store",
      });

      if (response.status === 401 || response.status === 403) {
        setAccountState({ status: "logged-out" });
        return;
      }

      if (!response.ok) {
        throw new Error(`WordPress returned ${response.status}.`);
      }

      const result = await response.json();

      if (result?.status === "logged-out") {
        setAccountState({ status: "logged-out" });
        return;
      }

      if (result?.status === "unreadable") {
        setAccountState({
          status: "unreadable",
          message:
            result.message ||
            "React cannot read the WordPress browser session yet.",
        });
        return;
      }

      const user = result?.user;
      setAccountState({
        status: "logged-in",
        name: user?.name || user?.slug || "WordPress user",
        email: user?.email,
      });
    } catch {
      setAccountState({
        status: "unreadable",
        message:
          "React cannot read the WordPress session yet. Add the React Shop session snippet in WordPress and allow this React domain.",
      });
    }
  }, [wordpressBaseUrl]);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const title =
    accountState.status === "logged-in"
      ? `Signed in as ${accountState.name}`
      : accountState.status === "logged-out"
        ? "Not signed in to WordPress"
        : accountState.status === "checking"
          ? "Checking WordPress session"
          : "WordPress session not readable yet";

  return (
    <section className={`account-status-card account-status-card--${accountState.status}`}>
      <div className="account-status-icon">
        {accountState.status === "logged-in" ? (
          <ShieldCheck size={22} />
        ) : (
          <UserRound size={22} />
        )}
      </div>

      <div className="account-status-copy">
        <span>Session status</span>
        <strong>{title}</strong>
        {accountState.status === "logged-in" && accountState.email && (
          <p>{accountState.email}</p>
        )}
        {accountState.status === "logged-out" && (
          <p>
            Log in through WooCommerce and then check again. WordPress remains
            the account source of truth.
          </p>
        )}
        {accountState.status === "unreadable" && <p>{accountState.message}</p>}
        {accountState.status === "checking" && (
          <p>Looking for a valid WooCommerce customer session.</p>
        )}
      </div>

      <div className="account-status-actions">
        <button type="button" className="btn btn-ghost" onClick={checkSession}>
          <RefreshCw size={14} />
          Check again
        </button>
        {accountUrl && (
          <a className="btn btn-primary" href={accountUrl}>
            Open login
          </a>
        )}
      </div>
    </section>
  );
}
