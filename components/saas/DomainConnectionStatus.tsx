"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "@/components/i18n/LanguageProvider";

type DnsCheckStatus =
  | "connected"
  | "waiting_for_dns"
  | "dns_error"
  | "not_configured";

type DnsCheckResponse = {
  domain: string;
  error?: string;
  resolvedIps?: string[];
  serverIp: string | null;
  status: DnsCheckStatus;
  verification?: "application" | "dns" | null;
};

type DomainConnectionStatusProps = {
  domain: string;
  isPrimary: boolean;
  websiteId: string;
};

async function checkDomainDns(websiteId: string, domain: string) {
  const response = await fetch("/api/websites/domain-dns-check", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ websiteId, domain }),
  });

  if (!response.ok) {
    const data = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;
    throw new Error(data?.error || "DNS check failed.");
  }

  return (await response.json()) as DnsCheckResponse;
}

export default function DomainConnectionStatus({
  domain,
  isPrimary,
  websiteId,
}: DomainConnectionStatusProps) {
  const [result, setResult] = useState<DnsCheckResponse | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [didCopy, setDidCopy] = useState(false);
  const { t } = useTranslation();
  const statusLabels: Record<DnsCheckStatus, string> = {
    connected: t("domain.connected"),
    waiting_for_dns: t("domain.waiting"),
    dns_error: t("domain.dnsError"),
    not_configured: t("domain.notConfigured"),
  };

  const status = result?.status ?? "not_configured";
  const serverIp = result?.serverIp;
  const resolvedIps = result?.resolvedIps ?? [];
  const dnsComplete = status === "connected";

  const message = useMemo(() => {
    if (status === "connected") {
      return result?.verification === "application"
        ? "Domain is connected and serving this tenant website."
        : "DNS is pointing to this server.";
    }
    if (status === "waiting_for_dns") {
      return resolvedIps.length > 0
        ? `Resolved IP: ${resolvedIps.join(", ")}. This domain is not yet pointing to this server.`
        : "No IPv4 A record was found yet.";
    }
    if (status === "dns_error") {
      return result?.error || "DNS lookup failed.";
    }
    return "Configure this server's public IP to enable DNS checks.";
  }, [resolvedIps, result?.error, result?.verification, status]);

  async function runCheck() {
    setIsChecking(true);
    setError(null);
    try {
      setResult(await checkDomainDns(websiteId, domain));
    } catch (err) {
      setError(err instanceof Error ? err.message : "DNS check failed.");
    } finally {
      setIsChecking(false);
    }
  }

  useEffect(() => {
    void runCheck();
    // Only run the lightweight DNS check when the displayed domain changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [domain, websiteId]);

  async function copyServerIp() {
    if (!serverIp || typeof navigator === "undefined") return;
    await navigator.clipboard.writeText(serverIp);
    setDidCopy(true);
    window.setTimeout(() => setDidCopy(false), 1400);
  }

  return (
    <div className="saas-domain-connection">
      <div className="saas-domain-connection-header">
        <div>
          <span className="saas-domain-name">{domain}</span>
          {isPrimary && <strong className="saas-domain-primary">{t("domain.primary")}</strong>}
        </div>
        <span className={`saas-domain-status is-${status}`}>
          {isChecking ? t("domain.checking") : statusLabels[status]}
        </span>
      </div>

      <div className="saas-domain-progress" aria-label="Domain setup progress">
        <span className="is-complete">{t("domain.added")}</span>
        <span className={dnsComplete ? "is-complete" : "is-pending"}>
          {t("domain.dnsCheck")}
        </span>
        <span className="is-next">Apache Proxy - Coming Next</span>
        <span className="is-next">SSL Certificate - Coming Next</span>
        <span className="is-next">Website Ready - Coming Next</span>
      </div>

      <p className="saas-domain-message">{error ?? message}</p>

      <div className="saas-domain-instruction">
        <span>
          Point your domain&apos;s A record to:{" "}
          <strong>{serverIp || "SERVER_PUBLIC_IP not configured"}</strong>
        </span>
        <button
          className="saas-auth-secondary-button"
          disabled={!serverIp}
          onClick={copyServerIp}
          type="button"
        >
          {didCopy ? t("domain.copied") : t("domain.copy")}
        </button>
      </div>

      <button
        className="saas-auth-submit"
        disabled={isChecking}
        onClick={runCheck}
        type="button"
      >
        {isChecking ? t("domain.checkingDns") : t("domain.checkDns")}
      </button>
    </div>
  );
}
