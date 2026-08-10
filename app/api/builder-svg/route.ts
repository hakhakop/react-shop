import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import { NextResponse } from "next/server";

const MAX_SVG_BYTES = 1_000_000;

const privateIp = (address: string) => {
  const normalized = address.toLowerCase();
  if (normalized === "::1" || normalized.startsWith("fc") || normalized.startsWith("fd") || normalized.startsWith("fe80:")) return true;
  const mapped = normalized.replace(/^::ffff:/, "");
  const parts = mapped.split(".").map(Number);
  if (parts.length !== 4 || parts.some((part) => !Number.isFinite(part))) return false;
  const [a, b] = parts;
  return a === 10 || a === 127 || a === 0 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168);
};

async function safeRemoteUrl(raw: string) {
  const url = new URL(raw);
  if (url.protocol !== "https:") throw new Error("Only HTTPS SVG sources are supported");
  if (url.username || url.password || url.port) throw new Error("Invalid SVG source authority");
  const addresses = isIP(url.hostname)
    ? [{ address: url.hostname }]
    : await lookup(url.hostname, { all: true, verbatim: true });
  if (!addresses.length || addresses.some(({ address }) => privateIp(address))) throw new Error("Private SVG sources are not allowed");
  return url;
}

export async function GET(request: Request) {
  try {
    let target = await safeRemoteUrl(new URL(request.url).searchParams.get("url") ?? "");
    let response: Response | undefined;
    for (let redirects = 0; redirects < 4; redirects += 1) {
      response = await fetch(target, { redirect: "manual", signal: AbortSignal.timeout(8_000) });
      if (![301, 302, 303, 307, 308].includes(response.status)) break;
      const location = response.headers.get("location");
      if (!location) throw new Error("Invalid SVG redirect");
      target = await safeRemoteUrl(new URL(location, target).href);
    }
    if (!response?.ok) return NextResponse.json({ error: "SVG source unavailable" }, { status: 502 });
    const declaredLength = Number(response.headers.get("content-length") ?? 0);
    if (declaredLength > MAX_SVG_BYTES) return NextResponse.json({ error: "SVG source too large" }, { status: 413 });
    const body = await response.text();
    if (body.length > MAX_SVG_BYTES || !/<svg[\s>]/i.test(body)) {
      return NextResponse.json({ error: "Invalid SVG source" }, { status: 415 });
    }
    return new NextResponse(body, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return NextResponse.json({ error: "Invalid SVG source" }, { status: 400 });
  }
}
