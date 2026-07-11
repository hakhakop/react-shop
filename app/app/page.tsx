import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  CreditCard,
  Globe2,
  Plus,
  Sparkles,
} from "lucide-react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import SaaSShell from "@/components/saas/SaaSShell";
import { getCurrentUser } from "@/lib/auth";
import { getWebsitesForOwner } from "@/lib/websites";
import { loginRedirectFor } from "@/lib/saasRoutes";
import { getDefaultWebsiteBuilderLinks } from "@/lib/websiteBuilderLinks.server";

export const dynamic = "force-dynamic";

type AppDashboardPageProps = {
  searchParams?: Promise<{ registered?: string }>;
};

export default async function AppDashboardPage({
  searchParams,
}: AppDashboardPageProps) {
  const user = await getCurrentUser(await cookies());
  const params = await searchParams;

  if (!user) {
    redirect(loginRedirectFor("/app"));
  }

  const websites = await getWebsitesForOwner(user.id);
  const activeWebsites = websites.filter(
    (website) => website.status === "active",
  );
  const creatingWebsites = websites.filter(
    (website) => website.status === "creating",
  );
  const websiteCards = await Promise.all(
    websites.slice(0, 3).map(async (website) => ({
      website,
      ...(await getDefaultWebsiteBuilderLinks(website)),
    })),
  );

  return (
    <SaaSShell user={user} title="Dashboard">
      <div className="saas-phase-one-page saas-dashboard-home">
        {params?.registered === "1" && (
          <section className="saas-auth-success">
            Your subscription request has been received. We will prepare and configure
            your website within 24 hours.
          </section>
        )}

        <section className="saas-phase-one-intro">
          <div>
            <span className="saas-phase-one-kicker">
              <Sparkles size={14} /> Website overview
            </span>
            <h2>Everything you own, in one calm workspace.</h2>
            <p>
              Manage your websites, monitor their status, and continue building
              from where you left off.
            </p>
          </div>
          <Link className="saas-phase-one-primary-action" href="/app/websites/new">
            <Plus size={17} /> Create Website
          </Link>
        </section>

        <div className="saas-dashboard-metrics">
          <Link className="saas-dashboard-metric" href="/app/websites">
            <span className="saas-dashboard-metric-icon is-purple"><Globe2 size={20} /></span>
            <div><small>Total Websites</small><strong>{websites.length}</strong></div>
            <p>Everything connected to your account.</p>
            <ArrowRight className="saas-dashboard-metric-arrow" size={16} />
          </Link>
          <Link className="saas-dashboard-metric" href="/app/websites">
            <span className="saas-dashboard-metric-icon is-green"><CheckCircle2 size={20} /></span>
            <div><small>Active Websites</small><strong>{activeWebsites.length}</strong></div>
            <p>Live and ready for visitors.</p>
            <ArrowRight className="saas-dashboard-metric-arrow" size={16} />
          </Link>
          <Link className="saas-dashboard-metric" href="/app/websites">
            <span className="saas-dashboard-metric-icon is-amber"><Clock3 size={20} /></span>
            <div><small>In Progress</small><strong>{creatingWebsites.length}</strong></div>
            <p>Drafts currently being prepared.</p>
            <ArrowRight className="saas-dashboard-metric-arrow" size={16} />
          </Link>
        </div>

        <div className="saas-dashboard-main-grid">
          {websites.length === 0 ? (
            <section className="saas-phase-one-empty-state">
              <span className="saas-phase-one-empty-icon"><Globe2 size={28} /></span>
              <div>
                <h2>Your first website starts here.</h2>
                <p>Create a website and it will appear in this workspace.</p>
              </div>
              <Link className="saas-phase-one-primary-action" href="/app/websites/new">
                <Plus size={17} /> Create Website
              </Link>
            </section>
          ) : (
            <section className="saas-phase-one-section saas-dashboard-websites-overview">
              <div className="saas-phase-one-section-heading">
                <div>
                  <span>Your portfolio</span>
                  <h2>My Websites</h2>
                  <p>Choose a website to continue building.</p>
                </div>
                <Link className="saas-phase-one-secondary-action" href="/app/websites">
                  View all <ArrowRight size={15} />
                </Link>
              </div>
              <div className="saas-dashboard-website-list">
                {websiteCards.map(({ website, builderHref }) => (
                  <Link href={builderHref} key={website.id}>
                    <span className={`saas-phase-one-status is-${website.status}`}>
                      {website.status}
                    </span>
                    <div>
                      <h3>{website.name}</h3>
                      <p>{website.description || `/${website.slug}`}</p>
                    </div>
                    <span className="saas-dashboard-website-arrow" aria-hidden="true">
                      <ArrowRight size={17} />
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          <aside className="saas-dashboard-account-column">
            <details className="saas-subscription-summary">
              <summary>
                <span className="saas-dashboard-metric-icon is-blue"><CreditCard size={19} /></span>
                <div>
                  <small>Current package</small>
                  <strong>{user.subscription?.packageName ?? "Not selected"}</strong>
                </div>
                <span className="saas-subscription-chevron" aria-hidden="true">⌄</span>
              </summary>
              <div className="saas-subscription-details">
                <p>{user.subscription?.priceText ?? "Contact support to select a package."}</p>
                <div>
                  <small>Website request</small>
                  <strong>{user.onboarding?.websiteName ?? "Not submitted"}</strong>
                  <p>{user.onboarding?.businessDescription ?? "Complete your setup information."}</p>
                </div>
                <Link href="/app/settings">
                  Manage account <ArrowRight size={14} />
                </Link>
              </div>
            </details>

            <Link className="saas-dashboard-quick-link" href="/app/websites">
              <span><Globe2 size={17} /> Manage websites</span>
              <ArrowRight size={15} />
            </Link>
            <Link className="saas-dashboard-quick-link" href="/app/settings">
              <span><CreditCard size={17} /> Account settings</span>
              <ArrowRight size={15} />
            </Link>
          </aside>
        </div>
      </div>
    </SaaSShell>
  );
}
