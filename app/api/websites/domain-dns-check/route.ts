import dns from "node:dns/promises";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import {
  canAccessWebsiteBuilder,
  getWebsiteById,
  normalizeWebsiteDomain,
} from "@/lib/websites";

export const dynamic = "force-dynamic";

type DnsCheckStatus =
  | "connected"
  | "waiting_for_dns"
  | "dns_error"
  | "not_configured";

type DomainVerification = "application" | "dns" | null;

function getConfiguredServerIp() {
  return (
    process.env.WEBSITE_SERVER_PUBLIC_IP ??
    process.env.SERVER_PUBLIC_IP ??
    process.env.PUBLIC_SERVER_IP ??
    process.env.NEXT_PUBLIC_SERVER_PUBLIC_IP ??
    ""
  ).trim();
}

function response(
  status: DnsCheckStatus,
  payload: {
    domain: string;
    error?: string;
    resolvedIps?: string[];
    serverIp: string | null;
    verification?: DomainVerification;
  },
) {
  return NextResponse.json({
    status,
    ...payload,
  });
}

async function domainServesWebsite(domain: string, websiteId: string) {
  try {
    const verificationUrl = new URL(
      "/api/websites/domain-verification",
      `https://${domain}`,
    );
    const verificationResponse = await fetch(verificationUrl, {
      cache: "no-store",
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(6000),
    });
    if (!verificationResponse.ok) return false;

    const payload = (await verificationResponse.json()) as {
      connected?: unknown;
      websiteId?: unknown;
    };
    return payload.connected === true && payload.websiteId === websiteId;
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser(request.cookies);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as {
    domain?: unknown;
    websiteId?: unknown;
  } | null;
  const websiteId =
    typeof body?.websiteId === "string" ? body.websiteId.trim() : "";
  const domain = normalizeWebsiteDomain(body?.domain);

  if (!websiteId || !domain) {
    return NextResponse.json({ error: "Missing domain." }, { status: 400 });
  }

  const website = await getWebsiteById(websiteId);
  if (!website || !canAccessWebsiteBuilder(user, website)) {
    return NextResponse.json({ error: "Access denied." }, { status: 403 });
  }

  if (!website.domains.includes(domain)) {
    return NextResponse.json({ error: "Domain not found." }, { status: 404 });
  }

  const serverIp = getConfiguredServerIp();
  const servesWebsite = await domainServesWebsite(domain, website.id);

  try {
    const records = await dns.lookup(domain, { all: true, family: 4 });
    const resolvedIps = Array.from(new Set(records.map((record) => record.address)));

    if (servesWebsite) {
      return response("connected", {
        domain,
        resolvedIps,
        serverIp: serverIp || null,
        verification: "application",
      });
    }

    if (serverIp && resolvedIps.includes(serverIp)) {
      return response("connected", {
        domain,
        resolvedIps,
        serverIp,
        verification: "dns",
      });
    }

    if (!serverIp) {
      return response("not_configured", {
        domain,
        resolvedIps,
        serverIp: null,
      });
    }

    return response("waiting_for_dns", { domain, resolvedIps, serverIp });
  } catch (error) {
    if (servesWebsite) {
      return response("connected", {
        domain,
        resolvedIps: [],
        serverIp: serverIp || null,
        verification: "application",
      });
    }

    return response("dns_error", {
      domain,
      error: error instanceof Error ? error.message : "DNS lookup failed.",
      resolvedIps: [],
      serverIp,
    });
  }
}
