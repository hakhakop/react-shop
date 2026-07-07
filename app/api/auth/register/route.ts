import { NextRequest, NextResponse } from "next/server";
import {
  authCookieMaxAge,
  authCookieName,
  createSessionToken,
  createUser,
  toPublicUser,
  validateOnboardingInput,
  validateRegistrationInput,
} from "@/lib/auth";
import { saveOnboardingLogo } from "@/lib/onboardingUploads";
import { findSubscriptionPackageById } from "@/lib/subscriptions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  let logoFile: File | null = null;

  try {
    const contentType = request.headers.get("content-type") ?? "";
    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      body = Object.fromEntries(formData.entries());
      const submittedLogo = formData.get("logo");
      logoFile = submittedLogo instanceof File ? submittedLogo : null;
    } else {
      body = (await request.json()) as Record<string, unknown>;
    }
  } catch {
    return NextResponse.json({ error: "Invalid registration body." }, { status: 400 });
  }

  const parsed = validateRegistrationInput(body);
  if ("error" in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const packageId =
    typeof body.packageId === "string" ? body.packageId.trim() : "";
  const selectedPackage = packageId
    ? await findSubscriptionPackageById(packageId)
    : null;

  if (!selectedPackage || !selectedPackage.isActive) {
    return NextResponse.json(
      { error: "Select an active subscription package." },
      { status: 400 },
    );
  }

  const logoResult = await saveOnboardingLogo(logoFile);
  if ("error" in logoResult) {
    return NextResponse.json({ error: logoResult.error }, { status: 400 });
  }

  const onboarding = validateOnboardingInput(body, logoResult.logoUrl);
  if ("error" in onboarding) {
    return NextResponse.json({ error: onboarding.error }, { status: 400 });
  }

  const result = await createUser({
    ...parsed,
    subscription: {
      packageId: selectedPackage.id,
      packageName: selectedPackage.name,
      packageType: selectedPackage.type,
      priceText: selectedPackage.priceText,
      requestedAt: new Date().toISOString(),
    },
    onboarding,
  });
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 409 });
  }

  const response = NextResponse.json(
    {
      user: toPublicUser(result.user),
      message:
        "Your subscription request has been received. We will prepare and configure your website within 24 hours.",
    },
    { status: 201 },
  );

  response.cookies.set(authCookieName, createSessionToken(result.user.id), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: authCookieMaxAge,
  });

  return response;
}
