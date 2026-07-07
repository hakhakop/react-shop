import { cookies } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import AccessDenied from "@/components/saas/AccessDenied";
import SaaSShell from "@/components/saas/SaaSShell";
import { findUserById, getCurrentUser, isSaaSAdmin, toPublicUser } from "@/lib/auth";
import { getWebsiteRouteSegment, getWebsitesForOwner } from "@/lib/websites";
import { loginRedirectFor } from "@/lib/saasRoutes";
import { getDefaultWebsiteBuilderLinks } from "@/lib/websiteBuilderLinks.server";

export const dynamic = "force-dynamic";

type AdminUserDetailPageProps = {
  params: Promise<{
    userId: string;
  }>;
};

export default async function AdminUserDetailPage({
  params,
}: AdminUserDetailPageProps) {
  const [{ userId }, currentUser] = await Promise.all([
    params,
    getCurrentUser(await cookies()),
  ]);

  if (!currentUser) {
    redirect(loginRedirectFor(`/admin/users/${userId}`));
  }

  if (!isSaaSAdmin(currentUser)) {
    return <AccessDenied />;
  }

  const user = await findUserById(userId);
  if (!user) {
    return (
      <SaaSShell
        user={currentUser}
        title="User Not Found"
        eyebrow="Admin workspace"
        actionHref="/admin/users"
        actionLabel="Users"
      >
        <section className="saas-empty-state">
          <span>User not found</span>
          <p>This SaaS user does not exist or was removed.</p>
          <Link className="saas-auth-submit" href="/admin/users">
            Back to Users
          </Link>
        </section>
      </SaaSShell>
    );
  }

  const publicUser = toPublicUser(user);
  const onboarding = publicUser.onboarding;
  const subscription = publicUser.subscription;
  const websites = await getWebsitesForOwner(publicUser.id);
  const websiteCards = await Promise.all(
    websites.map(async (website) => {
      const links = await getDefaultWebsiteBuilderLinks(website);
      return {
        website,
        ...links,
      };
    }),
  );

  return (
    <SaaSShell
      user={currentUser}
      title={publicUser.name}
      eyebrow="Admin user detail"
      actionHref="/admin/users"
      actionLabel="Users"
    >
      <section className="saas-panel">
        <div className="saas-panel-heading">
          <div>
            <h2>User info</h2>
            <p>{publicUser.email}</p>
          </div>
          <Link className="saas-auth-submit" href="/admin/users">
            Back to Users
          </Link>
        </div>

        <div className="saas-dashboard-grid">
          <article className="saas-dashboard-card">
            <span>Role</span>
            <strong>{publicUser.role}</strong>
            <p>Current SaaS access level.</p>
          </article>
          <article className="saas-dashboard-card">
            <span>Websites</span>
            <strong>{websites.length}</strong>
            <p>Owned website records.</p>
          </article>
          <article className="saas-dashboard-card">
            <span>Package</span>
            <strong>{subscription?.packageName ?? "Not selected"}</strong>
            <p>{subscription?.priceText ?? "No subscription request is stored."}</p>
          </article>
          <article className="saas-dashboard-card">
            <span>Created</span>
            <strong>{new Date(publicUser.createdAt).toLocaleDateString()}</strong>
            <p>User registration date.</p>
          </article>
        </div>
      </section>

      <section className="saas-panel">
        <div className="saas-panel-heading">
          <div>
            <h2>Subscription and Onboarding</h2>
            <p>Details submitted during registration for manual setup.</p>
          </div>
        </div>

        <div className="saas-dashboard-grid">
          <article className="saas-dashboard-card">
            <span>Subscription</span>
            <strong>{subscription?.packageName ?? "Not selected"}</strong>
            <p>{subscription?.packageType ?? "Package switching is not implemented."}</p>
          </article>
          <article className="saas-dashboard-card">
            <span>Requested</span>
            <strong>
              {subscription
                ? new Date(subscription.requestedAt).toLocaleDateString()
                : "Not available"}
            </strong>
            <p>{subscription?.priceText ?? "No price text stored."}</p>
          </article>
        </div>

        {onboarding ? (
          <>
            {onboarding.logoUrl && (
              <div className="saas-logo-preview">
                <Image src={onboarding.logoUrl} alt="" width={96} height={96} />
                <div>
                  <span>Business logo</span>
                  <p>{onboarding.logoUrl}</p>
                </div>
              </div>
            )}
            <dl className="saas-account-details saas-account-details--grid">
              <DetailItem label="Company / Business name" value={onboarding.companyName} />
              <DetailItem label="Business category" value={onboarding.businessCategory} />
              <DetailItem label="Phone" value={onboarding.phone} />
              <DetailItem label="Public business email" value={onboarding.publicEmail} />
              <DetailItem label="Address" value={onboarding.address} />
              <DetailItem label="Website name" value={onboarding.websiteName} />
              <DetailItem label="Preferred domain" value={onboarding.preferredDomain} />
              <DetailItem label="Facebook" value={onboarding.facebookUrl} />
              <DetailItem label="Instagram" value={onboarding.instagramUrl} />
              <DetailItem
                label="Short business description"
                value={onboarding.businessDescription}
                wide
              />
              <DetailItem
                label="Preferred colors / style notes"
                value={onboarding.styleNotes}
                wide
              />
              <DetailItem
                label="Additional notes"
                value={onboarding.additionalNotes}
                wide
              />
            </dl>
          </>
        ) : (
          <p>This user does not have onboarding details yet.</p>
        )}
      </section>

      <section className="saas-panel">
        <div className="saas-panel-heading">
          <h2>Owned Websites</h2>
        </div>

        {websites.length === 0 ? (
          <p>This user does not own any websites yet.</p>
        ) : (
          <div className="saas-website-grid">
            {websiteCards.map(({ website, builderHref, previewHref }) => (
              <article className="saas-website-card" key={website.id}>
                <span>{website.status}</span>
                <h3>{website.name}</h3>
                {website.description && <p>{website.description}</p>}
                <p>Slug: /{website.slug}</p>
                <small>
                  Created {new Date(website.createdAt).toLocaleDateString()}
                </small>
                <div className="saas-website-actions">
                  <Link href={builderHref}>
                    Open Builder
                  </Link>
                  <Link href={previewHref}>
                    Preview
                  </Link>
                  <Link href={`/app/websites/${getWebsiteRouteSegment(website)}/settings`}>
                    Settings
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </SaaSShell>
  );
}

function DetailItem({
  label,
  value,
  wide = false,
}: {
  label: string;
  value: string;
  wide?: boolean;
}) {
  return (
    <div className={wide ? "saas-field-wide" : undefined}>
      <dt>{label}</dt>
      <dd>{value || "Not provided"}</dd>
    </div>
  );
}
