import { cookies } from "next/headers";
import crypto from "node:crypto";
import { redirect } from "next/navigation";
import SaaSShell from "@/components/saas/SaaSShell";
import WebsiteCreationWizard from "@/components/saas/WebsiteCreationWizard";
import { getCurrentUser } from "@/lib/auth";
import { createWebsite, normalizeWebsiteType, validateWebsiteInput } from "@/lib/websites";
import { loginRedirectFor } from "@/lib/saasRoutes";
import { isStarterWebsiteId, starterWebsiteLibrary } from "@/lib/starterWebsites";
import { saveOnboardingLogo } from "@/lib/onboardingUploads";
import { T } from "@/components/i18n/LanguageProvider";

export const dynamic = "force-dynamic";

export type WebsiteCreationResult =
  | { ok: true; websiteId: string; websiteSlug: string; redirectTo: string }
  | { ok: false; error: string };

async function createWebsiteAction(formData: FormData): Promise<WebsiteCreationResult> {
  "use server";
  const user = await getCurrentUser(await cookies());
  if (!user) return { ok: false, error: "Your session expired. Sign in and try again." };

  const name = String(formData.get("name") ?? "");
  const suggestedSlug = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 52);
  const parsed = validateWebsiteInput({ name, slug: suggestedSlug.length >= 3 ? suggestedSlug : `site-${Date.now().toString(36)}` });
  if ("error" in parsed) return { ok: false, error: String(parsed.error ?? "Invalid website details") };

  const starterValue = formData.get("starterId");
  const starterId = isStarterWebsiteId(starterValue) ? starterValue : "modern-business";
  const logo = formData.get("logo");
  const logoResult = await saveOnboardingLogo(logo instanceof File ? logo : null);
  if ("error" in logoResult) return { ok: false, error: String(logoResult.error ?? "Logo upload failed") };

  const category = String(formData.get("websiteCategory") ?? "Business");
  const result = await createWebsite({
    ownerId: user.id,
    ...parsed,
    type: normalizeWebsiteType(category === "Online Store" ? "e-commerce" : "business"),
    starterId,
    websiteCategory: category,
    companyName: String(formData.get("companyName") ?? ""),
    personName: String(formData.get("personName") ?? ""),
    description: String(formData.get("description") ?? ""),
    logoUrl: logoResult.logoUrl,
    contactPhone: String(formData.get("phone") ?? ""),
    contactEmail: String(formData.get("contactEmail") ?? ""),
    socialLinks: String(formData.get("socialLinks") ?? ""),
    creationRequestId: String(formData.get("creationRequestId") ?? ""),
  });
  if ("error" in result) return { ok: false, error: String(result.error ?? "Website creation failed") };

  const redirectTo = `/app/websites/${result.website.slug}/builder?created=1`;
  return {
    ok: true,
    websiteId: result.website.id,
    websiteSlug: result.website.slug,
    redirectTo,
  };
}

export default async function NewWebsitePage({ searchParams }: { searchParams?: Promise<{ error?: string }> }) {
  const user = await getCurrentUser(await cookies());
  if (!user) redirect(loginRedirectFor("/app/websites/new"));
  const params = await searchParams;
  return (
    <SaaSShell user={user} title={<T k="wizard.title" />}>
      <WebsiteCreationWizard action={createWebsiteAction} creationRequestId={crypto.randomUUID()} error={params?.error} starters={starterWebsiteLibrary.map(({ id, name, description, preview }) => ({ id, name, description, preview }))} />
    </SaaSShell>
  );
}
