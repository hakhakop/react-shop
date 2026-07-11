import Link from "next/link";
import {
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
import SaaSShell from "@/components/saas/SaaSShell";
import { getCurrentUser } from "@/lib/auth";
import { getWebsiteRouteSegment, getWebsitesForOwner } from "@/lib/websites";
import { loginRedirectFor } from "@/lib/saasRoutes";
import { getDefaultWebsiteBuilderLinks } from "@/lib/websiteBuilderLinks.server";

export const dynamic = "force-dynamic";

export default async function WebsitesPage() {
  const user = await getCurrentUser(await cookies());

  if (!user) {
    redirect(loginRedirectFor("/app/websites"));
  }

  const websites = await getWebsitesForOwner(user.id);
  const showRootWebsite = user.role === "super_admin";
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
    <SaaSShell user={user} title="My Websites">
      <div className="saas-phase-one-page saas-websites-page">
        <section className="saas-phase-one-intro">
          <div>
            <span className="saas-phase-one-kicker">
              <Globe2 size={14} /> Website portfolio
            </span>
            <h2>Every website, beautifully organized.</h2>
            <p>
              Open the Builder, preview your work, or manage each website from
              one focused workspace.
            </p>
          </div>
          <Link className="saas-phase-one-primary-action" href="/app/websites/new">
            <Plus size={17} /> Create Website
          </Link>
        </section>

        {websiteCards.length === 0 && !showRootWebsite ? (
          <section className="saas-phase-one-empty-state">
            <span className="saas-phase-one-empty-icon"><Globe2 size={28} /></span>
            <div>
              <h2>No websites yet.</h2>
              <p>Your websites will appear here after you create your first project.</p>
            </div>
            <Link className="saas-phase-one-primary-action" href="/app/websites/new">
              <Plus size={17} /> Create Website
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
            {websiteCards.map(({ website, builderHref, previewHref }) => (
              <article className="saas-premium-website-card" key={website.id}>
                <div className="saas-premium-website-visual">
                  <span className="saas-premium-website-monogram">
                    {website.name.slice(0, 2).toUpperCase()}
                  </span>
                  <span className={`saas-phase-one-status is-${website.status}`}>
                    {website.status}
                  </span>
                  <div>
                    <small>{website.type === "e-commerce" ? "E-Commerce website" : "Business website"}</small>
                    <strong>{website.description || "Your website, ready to evolve."}</strong>
                  </div>
                </div>
                <div className="saas-premium-website-body">
                  <div className="saas-premium-website-heading">
                    <div>
                      <span className="saas-premium-website-icon"><Globe2 size={20} /></span>
                      <div>
                        <h3>{website.name}</h3>
                        <p><Globe2 size={13} /> {website.primaryDomain || `/${website.slug}`}</p>
                      </div>
                    </div>
                    <small>Created {new Date(website.createdAt).toLocaleDateString()}</small>
                  </div>
                  <div className="saas-premium-website-actions">
                    <Link className="is-primary" href={builderHref}><LayoutDashboard size={15} /> Builder</Link>
                    <Link href={previewHref}><ExternalLink size={15} /> Preview</Link>
                    <Link href={`/app/websites/${getWebsiteRouteSegment(website)}/settings`}><Settings2 size={15} /> Settings</Link>
                    <a href={`/api/websites/${getWebsiteRouteSegment(website)}/export-backup`} title="Export backup"><Download size={15} /><span>Export</span></a>
                    <DeleteWebsiteButton
                      websiteId={getWebsiteRouteSegment(website)}
                      websiteName={website.name}
                    />
                  </div>
                </div>
              </article>
            ))}
            </div>
          </section>
        )}
      </div>
    </SaaSShell>
  );
}
