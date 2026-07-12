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
import { T } from "@/components/i18n/LanguageProvider";

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
    <SaaSShell user={user} title={<T k="settings.title" />}>
      {params?.error && <p className="saas-auth-error">{params.error}</p>}
      {params?.saved && <p className="saas-auth-success"><T k="settings.profileSaved" /></p>}

      <section className="saas-panel">
        <h2><T k="settings.accountInformation" /></h2>
        <dl className="saas-account-details">
          <div>
            <dt><T k="common.name" /></dt>
            <dd>{user.name}</dd>
          </div>
          <div>
            <dt><T k="common.email" /></dt>
            <dd>{user.email}</dd>
          </div>
          <div>
            <dt><T k="settings.role" /></dt>
            <dd>{user.role}</dd>
          </div>
          <div>
            <dt><T k="common.created" /></dt>
            <dd>{new Date(user.createdAt).toLocaleDateString()}</dd>
          </div>
        </dl>
      </section>

      <section className="saas-panel">
        <div className="saas-panel-heading">
          <div>
            <h2><T k="settings.subscription" /></h2>
            <p>Package switching is not available in onboarding v1.</p>
          </div>
        </div>
        <div className="saas-dashboard-grid">
          <article className="saas-dashboard-card">
            <span><T k="settings.package" /></span>
            <strong>{subscription?.packageName ?? <T k="common.notSelected" />}</strong>
            <p>{subscription?.packageType ?? "Contact support to choose a package."}</p>
          </article>
          <article className="saas-dashboard-card">
            <span><T k="settings.pricePeriod" /></span>
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
            <h2><T k="settings.businessInformation" /></h2>
            <p><T k="settings.businessDescription" /></p>
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
            <span><T k="settings.companyName" /></span>
            <input name="companyName" required defaultValue={onboarding?.companyName ?? ""} />
          </label>
          <label className="saas-auth-field">
            <span><T k="settings.logo" /></span>
            <input accept="image/*" name="logo" type="file" />
          </label>
          <label className="saas-auth-field">
            <span><T k="settings.businessCategory" /></span>
            <input name="businessCategory" required defaultValue={onboarding?.businessCategory ?? ""} />
          </label>
          <label className="saas-auth-field">
            <span><T k="common.phone" /></span>
            <input name="phone" required defaultValue={onboarding?.phone ?? ""} />
          </label>
          <label className="saas-auth-field">
            <span><T k="settings.publicEmail" /></span>
            <input name="publicEmail" required type="email" defaultValue={onboarding?.publicEmail ?? ""} />
          </label>
          <label className="saas-auth-field">
            <span><T k="common.address" /></span>
            <input name="address" defaultValue={onboarding?.address ?? ""} />
          </label>
          <label className="saas-auth-field">
            <span><T k="settings.facebook" /></span>
            <input name="facebookUrl" defaultValue={onboarding?.facebookUrl ?? ""} />
          </label>
          <label className="saas-auth-field">
            <span><T k="settings.instagram" /></span>
            <input name="instagramUrl" defaultValue={onboarding?.instagramUrl ?? ""} />
          </label>
          <div className="saas-onboarding-section-heading saas-field-wide">
            <span>Website Request / Setup Information</span>
            <h2><T k="settings.websiteDetails" /></h2>
          </div>
          <label className="saas-auth-field">
            <span><T k="settings.websiteName" /></span>
            <input name="websiteName" required defaultValue={onboarding?.websiteName ?? ""} />
          </label>
          <label className="saas-auth-field">
            <span><T k="settings.preferredDomain" /></span>
            <input name="preferredDomain" defaultValue={onboarding?.preferredDomain ?? ""} />
          </label>
          <label className="saas-auth-field saas-field-wide">
            <span><T k="settings.shortDescription" /></span>
            <textarea name="businessDescription" required rows={4} defaultValue={onboarding?.businessDescription ?? ""} />
          </label>
          <label className="saas-auth-field saas-field-wide">
            <span><T k="settings.styleNotes" /></span>
            <textarea name="styleNotes" rows={3} defaultValue={onboarding?.styleNotes ?? ""} />
          </label>
          <label className="saas-auth-field saas-field-wide">
            <span><T k="settings.additionalNotes" /></span>
            <textarea name="additionalNotes" rows={3} defaultValue={onboarding?.additionalNotes ?? ""} />
          </label>
          <button className="saas-auth-submit" type="submit">
            <T k="settings.saveProfile" />
          </button>
        </form>
      </section>
    </SaaSShell>
  );
}
