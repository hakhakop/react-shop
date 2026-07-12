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
import { T } from "@/components/i18n/LanguageProvider";

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
    <SaaSShell user={user} title={<T k="dashboard.title" />}>
      <div className="saas-phase-one-page saas-dashboard-home">
        {params?.registered === "1" && (
          <section className="saas-auth-success">
            <T k="dashboard.registrationSuccess" />
          </section>
        )}

        <section className="saas-phase-one-intro">
          <div>
            <span className="saas-phase-one-kicker">
              <Sparkles size={14} /> <T k="dashboard.overview" />
            </span>
            <h2><T k="dashboard.heading" /></h2>
            <p><T k="dashboard.description" /></p>
          </div>
          <Link className="saas-phase-one-primary-action" href="/app/websites/new">
            <Plus size={17} /> <T k="websites.create" />
          </Link>
        </section>

        <div className="saas-dashboard-metrics">
          <Link className="saas-dashboard-metric" href="/app/websites">
            <span className="saas-dashboard-metric-icon is-purple"><Globe2 size={20} /></span>
            <div><small><T k="dashboard.totalWebsites" /></small><strong>{websites.length}</strong></div>
            <p><T k="dashboard.totalWebsitesDescription" /></p>
            <ArrowRight className="saas-dashboard-metric-arrow" size={16} />
          </Link>
          <Link className="saas-dashboard-metric" href="/app/websites">
            <span className="saas-dashboard-metric-icon is-green"><CheckCircle2 size={20} /></span>
            <div><small><T k="dashboard.activeWebsites" /></small><strong>{activeWebsites.length}</strong></div>
            <p><T k="dashboard.activeWebsitesDescription" /></p>
            <ArrowRight className="saas-dashboard-metric-arrow" size={16} />
          </Link>
          <Link className="saas-dashboard-metric" href="/app/websites">
            <span className="saas-dashboard-metric-icon is-amber"><Clock3 size={20} /></span>
            <div><small><T k="dashboard.inProgress" /></small><strong>{creatingWebsites.length}</strong></div>
            <p><T k="dashboard.inProgressDescription" /></p>
            <ArrowRight className="saas-dashboard-metric-arrow" size={16} />
          </Link>
        </div>

        <div className="saas-dashboard-main-grid">
          {websites.length === 0 ? (
            <section className="saas-phase-one-empty-state">
              <span className="saas-phase-one-empty-icon"><Globe2 size={28} /></span>
              <div>
                <h2><T k="dashboard.firstWebsite" /></h2>
                <p><T k="dashboard.firstWebsiteDescription" /></p>
              </div>
              <Link className="saas-phase-one-primary-action" href="/app/websites/new">
                <Plus size={17} /> <T k="websites.create" />
              </Link>
            </section>
          ) : (
            <section className="saas-phase-one-section saas-dashboard-websites-overview">
              <div className="saas-phase-one-section-heading">
                <div>
                  <span><T k="dashboard.portfolio" /></span>
                  <h2><T k="websites.title" /></h2>
                  <p><T k="dashboard.chooseWebsite" /></p>
                </div>
                <Link className="saas-phase-one-secondary-action" href="/app/websites">
                  <T k="dashboard.viewAll" /> <ArrowRight size={15} />
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
                  <small><T k="dashboard.currentPackage" /></small>
                  <strong>{user.subscription?.packageName ?? <T k="common.notSelected" />}</strong>
                </div>
                <span className="saas-subscription-chevron" aria-hidden="true">⌄</span>
              </summary>
              <div className="saas-subscription-details">
                <p>{user.subscription?.priceText ?? "Contact support to select a package."}</p>
                <div>
                  <small><T k="dashboard.websiteRequest" /></small>
                  <strong>{user.onboarding?.websiteName ?? <T k="common.notSubmitted" />}</strong>
                  <p>{user.onboarding?.businessDescription ?? "Complete your setup information."}</p>
                </div>
                <Link href="/app/settings">
                  <T k="dashboard.manageAccount" /> <ArrowRight size={14} />
                </Link>
              </div>
            </details>

            <Link className="saas-dashboard-quick-link" href="/app/websites">
              <span><Globe2 size={17} /> <T k="dashboard.manageWebsites" /></span>
              <ArrowRight size={15} />
            </Link>
            <Link className="saas-dashboard-quick-link" href="/app/settings">
              <span><CreditCard size={17} /> <T k="dashboard.accountSettings" /></span>
              <ArrowRight size={15} />
            </Link>
          </aside>
        </div>
      </div>
    </SaaSShell>
  );
}
