import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, updateUserSubscription } from "@/lib/auth";
import { findSubscriptionPackageById } from "@/lib/subscriptions";
import { activateWebsite, addWebsiteDomain, canAccessWebsiteBuilder, getWebsiteByIdOrSlug } from "@/lib/websites";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest, { params }: { params: Promise<{ websiteId: string }> }) {
  const user = await getCurrentUser(request.cookies);
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const website = await getWebsiteByIdOrSlug((await params).websiteId);
  if (!website || !canAccessWebsiteBuilder(user, website)) return NextResponse.json({ error: "Website not found." }, { status: 404 });
  const body = await request.json() as { packageId?: string; domainMode?: string; domain?: string };
  const selectedPackage = body.packageId ? await findSubscriptionPackageById(body.packageId) : null;
  if (!selectedPackage?.isActive) return NextResponse.json({ error: "Choose an active subscription." }, { status: 400 });

  const requestedDomain = body.domainMode === "subdomain" ? `${website.slug}.webpages.am` : String(body.domain ?? "").trim();
  if (!requestedDomain) return NextResponse.json({ error: "Choose or enter a domain." }, { status: 400 });
  if (!website.domains.includes(requestedDomain.toLowerCase())) {
    const domainResult = await addWebsiteDomain({ websiteId: website.id, domain: requestedDomain });
    if ("error" in domainResult) return NextResponse.json({ error: domainResult.error }, { status: 400 });
  }
  await updateUserSubscription(user.id, { packageId: selectedPackage.id, packageName: selectedPackage.name, packageType: selectedPackage.type, priceText: selectedPackage.priceText, requestedAt: new Date().toISOString() });
  await activateWebsite({ websiteId: website.id });
  return NextResponse.json({ ok: true, domain: requestedDomain });
}
