import Link from "next/link";
import {
  Clock3,
  CreditCard,
  Download,
  ExternalLink,
  Globe2,
  LayoutDashboard,
  Plus,
  Settings2,
  ShieldCheck,
} from "lucide-react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import DeleteWebsiteButton from "@/components/saas/DeleteWebsiteButton";
import GoLiveButton from "@/components/saas/GoLiveButton";
import SaaSShell from "@/components/saas/SaaSShell";
import { getCurrentUser } from "@/lib/auth";
import { getWebsiteRouteSegment, getWebsitesForOwner } from "@/lib/websites";
import { loginRedirectFor } from "@/lib/saasRoutes";
import { getDefaultWebsiteBuilderLinks } from "@/lib/websiteBuilderLinks.server";
import { T } from "@/components/i18n/LanguageProvider";
import { readActiveSubscriptionPackages } from "@/lib/subscriptions";

export const dynamic = "force-dynamic";

function getLifecycleStatus(
  status: string,
  lastPublishedAt?: string,
  primaryDomain?: string | null,
) {
  if (status === "active" && primaryDomain) {
    return { label: "Live", tone: "live" };
  }
  if (lastPublishedAt) return { label: "Published", tone: "published" };
  return { label: "Draft", tone: "draft" };
}

function formatRelativePublication(value?: string) {
  if (!value) return "Not published yet";
  const timestamp = new Date(value).getTime();
  if (!Number.isFinite(timestamp)) return "Not published yet";

  const elapsed = Math.max(0, Date.now() - timestamp);
  const minutes = Math.floor(elapsed / 60_000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  if (hours < 48) return "Yesterday";

  const days = Math.floor(hours / 24);
  return `${days} days ago`;
}

export default async function WebsitesPage() {
  const user = await getCurrentUser(await cookies());

  if (!user) {
    redirect(loginRedirectFor("/app/websites"));
  }

  const [websites, subscriptionPackages] = await Promise.all([
    getWebsitesForOwner(user.id),
    readActiveSubscriptionPackages(),
  ]);
  const showRootWebsite = user.role === "super_admin";
  const singleLegacyLiveWebsite =
    websites.filter((website) => website.status === "active").length === 1
      ? websites.find((website) => website.status === "active")
      : undefined;
  const websiteCards = await Promise.all(
    websites.map(async (website) => {
      const links = await getDefaultWebsiteBuilderLinks(website);
      const plan =
        website.plan ??
        (website.id === singleLegacyLiveWebsite?.id && user.subscription
          ? {
              packageId: user.subscription.packageId,
              packageName: user.subscription.packageName,
              packageType: user.subscription.packageType,
              priceText: user.subscription.priceText,
              activatedAt: user.subscription.requestedAt,
            }
          : undefined);
      return {
        website,
        plan,
        ...links,
      };
    }),
  );

  return (
    <SaaSShell user={user} title={<T k="websites.title" />}>
      <div className="saas-phase-one-page saas-websites-page">
        <section className="saas-phase-one-intro">
          <div>
            <span className="saas-phase-one-kicker">
              <Globe2 size={14} /> <T k="websites.portfolio" />
            </span>
            <h2><T k="websites.heading" /></h2>
            <p><T k="websites.description" /></p>
          </div>
          <Link className="saas-phase-one-primary-action" href="/app/websites/new">
            <Plus size={17} /> <T k="websites.create" />
          </Link>
        </section>

        {websiteCards.length === 0 && !showRootWebsite ? (
          <section className="saas-phase-one-empty-state">
            <span className="saas-phase-one-empty-icon"><Globe2 size={28} /></span>
            <div>
              <h2>Create your first website</h2>
              <p>Start with a template and make it yours in the Builder. No subscription required.</p>
            </div>
            <Link className="saas-phase-one-primary-action" href="/app/websites/new">
              <Plus size={17} /> <T k="websites.create" />
            </Link>
          </section>
        ) : (
          <section className="saas-phase-one-section saas-websites-portfolio">
            <div className="saas-phase-one-section-heading">
              <div>
                <span>Websites</span>
                <h2>Your portfolio</h2>
                <p>{websiteCards.length + (showRootWebsite ? 1 : 0)} website{websiteCards.length + (showRootWebsite ? 1 : 0) === 1 ? "" : "s"} in this workspace.</p>
              </div>
            </div>
            <div className="saas-premium-website-grid">
            {showRootWebsite && (
              <article className="saas-premium-website-card is-root" key="root-website">
                <div className="saas-premium-website-visual">
                  <span className="saas-premium-website-monogram">WP</span>
                  <span className="saas-phase-one-status is-active">Main website</span>
                  <div>
                    <small>WebPages platform</small>
                    <strong>Built for businesses that move forward.</strong>
                  </div>
                </div>
                <div className="saas-premium-website-body">
                  <div className="saas-premium-website-heading">
                    <div>
                      <span className="saas-premium-website-icon"><ShieldCheck size={20} /></span>
                      <div><h3>WebPages Root Website</h3><p><Globe2 size={13} /> webpages.am</p></div>
                    </div>
                    <small>Undeletable</small>
                  </div>
                  <p className="saas-premium-website-description">
                    The public platform website, managed separately from tenant websites.
                  </p>
                  <div className="saas-premium-website-actions">
                    <Link className="is-primary" href="/dashboard?page=home"><LayoutDashboard size={15} /> Builder</Link>
                    <Link href="/"><ExternalLink size={15} /> Preview</Link>
                  </div>
                </div>
              </article>
            )}
            {websiteCards.map(({ website, plan, builderHref, previewHref }) => {
              const lifecycle = getLifecycleStatus(
                website.status,
                website.lastPublishedAt,
                website.primaryDomain,
              );
              const isLive = lifecycle.tone === "live";
              return (
                <article className="saas-premium-website-card is-control-center" key={website.id}>
                <div className="saas-premium-website-visual">
                  <span className="saas-premium-website-monogram">
                    {website.name.slice(0, 2).toUpperCase()}
                  </span>
                  <span className={`saas-phase-one-status is-${lifecycle.tone}`}>
                    {lifecycle.label}
                  </span>
                  <div>
                    <small>{website.type === "e-commerce" ? <T k="websites.ecommerce" /> : <T k="websites.business" />}</small>
                    <strong>{website.description || "Your website, ready to evolve."}</strong>
                  </div>
                </div>
                <div className="saas-premium-website-body">
                  <div className="saas-premium-website-heading">
                    <div>
                      <span className="saas-premium-website-icon"><Globe2 size={20} /></span>
                      <div>
                        <h3>{website.name}</h3>
                        <p>{website.description || "Ready for your next update."}</p>
                      </div>
                    </div>
                    <small>{website.type === "e-commerce" ? "Online store" : "Business website"}</small>
                  </div>
                  <dl className="saas-website-control-facts">
                    <div>
                      <dt><Globe2 size={14} /> Domain</dt>
                      <dd className={!isLive ? "is-empty" : undefined}>
                        {isLive && website.primaryDomain ? website.primaryDomain : "Not live yet"}
                      </dd>
                    </div>
                    <div>
                      <dt><CreditCard size={14} /> Active plan</dt>
                      <dd className={!plan ? "is-empty" : undefined}>
                        {plan?.packageName || "No active plan"}
                      </dd>
                    </div>
                    <div>
                      <dt><Clock3 size={14} /> Last published</dt>
                      <dd className={!website.lastPublishedAt ? "is-empty" : undefined}>
                        {formatRelativePublication(website.lastPublishedAt)}
                      </dd>
                    </div>
                  </dl>
                  <div className="saas-premium-website-actions">
                    <div className="saas-website-primary-actions">
                      <Link className="is-edit-primary" href={builderHref}><LayoutDashboard size={15} /> Edit Website</Link>
                      <Link href={previewHref}><ExternalLink size={15} /> Preview Website</Link>
                      <GoLiveButton
                        websiteId={website.id}
                        websiteSlug={website.slug}
                        websiteName={website.name}
                        packages={subscriptionPackages}
                        isLive={isLive}
                        activePackageId={plan?.packageId}
                        activeDomain={website.primaryDomain ?? undefined}
                      />
                    </div>
                    <div className="saas-website-management-actions" aria-label="Website management">
                      <Link href={`/app/websites/${getWebsiteRouteSegment(website)}/settings`}><Settings2 size={15} /> <T k="common.settings" /></Link>
                      <a href={`/api/websites/${getWebsiteRouteSegment(website)}/export-backup`} title="Export backup"><Download size={15} /><span><T k="common.export" /></span></a>
                      <DeleteWebsiteButton
                        websiteId={getWebsiteRouteSegment(website)}
                        websiteName={website.name}
                      />
                    </div>
                  </div>
                </div>
                </article>
              );
            })}
            </div>
          </section>
        )}
      </div>
    </SaaSShell>
  );
}
