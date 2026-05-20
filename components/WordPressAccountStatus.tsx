"use client";

import { RefreshCw, ShieldCheck, UserRound } from "lucide-react";
import { useWordPressSession } from "./useWordPressSession";

type Props = {
  wordpressBaseUrl: string | null;
  accountUrl: string | null;
};

export default function WordPressAccountStatus({
  wordpressBaseUrl,
  accountUrl,
}: Props) {
  const { session: accountState, checkSession } =
    useWordPressSession(wordpressBaseUrl);

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
