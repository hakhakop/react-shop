import { cookies } from "next/headers";
import Image from "next/image";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import SaaSShell from "@/components/saas/SaaSShell";
import {
  getCurrentUser,
  updateUserOnboarding,
  validateOnboardingInput,
} from "@/lib/auth";
import { saveOnboardingLogo } from "@/lib/onboardingUploads";
import { loginRedirectFor } from "@/lib/saasRoutes";

export const dynamic = "force-dynamic";

type AppSettingsPageProps = {
  searchParams?: Promise<{ saved?: string; error?: string }>;
};

async function updateOnboardingAction(formData: FormData) {
  "use server";

  const user = await getCurrentUser(await cookies());
  if (!user) redirect(loginRedirectFor("/app/settings"));

  const submittedLogo = formData.get("logo");
  const logoResult = await saveOnboardingLogo(
    submittedLogo instanceof File ? submittedLogo : null,
  );
  if ("error" in logoResult) {
    redirect(`/app/settings?error=${encodeURIComponent(logoResult.error ?? "Logo could not be uploaded.")}`);
  }

  const onboarding = validateOnboardingInput(
    Object.fromEntries(formData),
    logoResult.logoUrl || user.onboarding?.logoUrl || "",
  );
  if ("error" in onboarding) {
    redirect(`/app/settings?error=${encodeURIComponent(onboarding.error ?? "Profile could not be saved.")}`);
  }

  const result = await updateUserOnboarding(user.id, onboarding);
  if ("error" in result) {
    redirect(`/app/settings?error=${encodeURIComponent(result.error ?? "Profile could not be saved.")}`);
  }

  revalidatePath("/app");
  revalidatePath("/app/settings");
  redirect("/app/settings?saved=profile");
}

export default async function AppSettingsPage({
  searchParams,
}: AppSettingsPageProps) {
  const user = await getCurrentUser(await cookies());
  const params = await searchParams;

  if (!user) {
    redirect(loginRedirectFor("/app/settings"));
  }

  const onboarding = user.onboarding;
  const subscription = user.subscription;

  return (
    <SaaSShell user={user} title="Account Settings">
      {params?.error && <p className="saas-auth-error">{params.error}</p>}
      {params?.saved && <p className="saas-auth-success">Profile saved.</p>}

      <section className="saas-panel">
        <h2>Account information</h2>
        <dl className="saas-account-details">
          <div>
            <dt>Name</dt>
            <dd>{user.name}</dd>
          </div>
          <div>
            <dt>Email</dt>
            <dd>{user.email}</dd>
          </div>
          <div>
            <dt>Role</dt>
            <dd>{user.role}</dd>
          </div>
          <div>
            <dt>Created</dt>
            <dd>{new Date(user.createdAt).toLocaleDateString()}</dd>
          </div>
        </dl>
      </section>

      <section className="saas-panel">
        <div className="saas-panel-heading">
          <div>
            <h2>Subscription</h2>
            <p>Package switching is not available in onboarding v1.</p>
          </div>
        </div>
        <div className="saas-dashboard-grid">
          <article className="saas-dashboard-card">
            <span>Package</span>
            <strong>{subscription?.packageName ?? "Not selected"}</strong>
            <p>{subscription?.packageType ?? "Contact support to choose a package."}</p>
          </article>
          <article className="saas-dashboard-card">
            <span>Price / period</span>
            <strong>{subscription?.priceText ?? "Contact support"}</strong>
            <p>
              {subscription
                ? `Requested ${new Date(subscription.requestedAt).toLocaleDateString()}`
                : "A support teammate can attach a package manually."}
            </p>
          </article>
        </div>
      </section>

      <section className="saas-panel">
        <div className="saas-panel-heading">
          <div>
            <h2>Business Information</h2>
            <p>Update the details used to prepare and configure your website.</p>
          </div>
        </div>

        {onboarding?.logoUrl && (
          <div className="saas-logo-preview">
            <Image src={onboarding.logoUrl} alt="" width={96} height={96} />
            <div>
              <span>Current logo</span>
              <p>Upload a new file below to replace it.</p>
            </div>
          </div>
        )}

        <form action={updateOnboardingAction} className="saas-settings-form">
          <label className="saas-auth-field">
            <span>Company / Business name</span>
            <input name="companyName" required defaultValue={onboarding?.companyName ?? ""} />
          </label>
          <label className="saas-auth-field">
            <span>Logo</span>
            <input accept="image/*" name="logo" type="file" />
          </label>
          <label className="saas-auth-field">
            <span>Business category</span>
            <input name="businessCategory" required defaultValue={onboarding?.businessCategory ?? ""} />
          </label>
          <label className="saas-auth-field">
            <span>Phone</span>
            <input name="phone" required defaultValue={onboarding?.phone ?? ""} />
          </label>
          <label className="saas-auth-field">
            <span>Public business email</span>
            <input name="publicEmail" required type="email" defaultValue={onboarding?.publicEmail ?? ""} />
          </label>
          <label className="saas-auth-field">
            <span>Address</span>
            <input name="address" defaultValue={onboarding?.address ?? ""} />
          </label>
          <label className="saas-auth-field">
            <span>Facebook link</span>
            <input name="facebookUrl" defaultValue={onboarding?.facebookUrl ?? ""} />
          </label>
          <label className="saas-auth-field">
            <span>Instagram link</span>
            <input name="instagramUrl" defaultValue={onboarding?.instagramUrl ?? ""} />
          </label>
          <div className="saas-onboarding-section-heading saas-field-wide">
            <span>Website Request / Setup Information</span>
            <h2>Website details</h2>
          </div>
          <label className="saas-auth-field">
            <span>Website name</span>
            <input name="websiteName" required defaultValue={onboarding?.websiteName ?? ""} />
          </label>
          <label className="saas-auth-field">
            <span>Preferred domain</span>
            <input name="preferredDomain" defaultValue={onboarding?.preferredDomain ?? ""} />
          </label>
          <label className="saas-auth-field saas-field-wide">
            <span>Short business description</span>
            <textarea name="businessDescription" required rows={4} defaultValue={onboarding?.businessDescription ?? ""} />
          </label>
          <label className="saas-auth-field saas-field-wide">
            <span>Preferred colors / style notes</span>
            <textarea name="styleNotes" rows={3} defaultValue={onboarding?.styleNotes ?? ""} />
          </label>
          <label className="saas-auth-field saas-field-wide">
            <span>Additional notes</span>
            <textarea name="additionalNotes" rows={3} defaultValue={onboarding?.additionalNotes ?? ""} />
          </label>
          <button className="saas-auth-submit" type="submit">
            Save Profile
          </button>
        </form>
      </section>
    </SaaSShell>
  );
}
