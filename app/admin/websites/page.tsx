import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Download,
  ExternalLink,
  Globe2,
  LayoutDashboard,
  Settings2,
  UserRound,
} from "lucide-react";
import AccessDenied from "@/components/saas/AccessDenied";
import DeleteWebsiteButton from "@/components/saas/DeleteWebsiteButton";
import SaaSShell from "@/components/saas/SaaSShell";
import { getCurrentUser, isSaaSAdmin, readPublicUsers } from "@/lib/auth";
import { getWebsiteRouteSegment, readWebsites } from "@/lib/websites";
import { loginRedirectFor } from "@/lib/saasRoutes";
import { getDefaultWebsiteBuilderLinks } from "@/lib/websiteBuilderLinks.server";

export const dynamic = "force-dynamic";

export default async function AdminWebsitesPage() {
  const user = await getCurrentUser(await cookies());

  if (!user) {
    redirect(loginRedirectFor("/admin/websites"));
  }

  if (!isSaaSAdmin(user)) {
    return <AccessDenied />;
  }

  const [websites, users] = await Promise.all([readWebsites(), readPublicUsers()]);
  const usersById = new Map(users.map((item) => [item.id, item]));
  const websiteRows = await Promise.all(
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
      user={user}
      title="All Websites"
      eyebrow="Admin workspace"
      actionHref="/admin/users"
      actionLabel="Users"
    >
      <div className="saas-phase-one-page saas-admin-websites-page">
        <section className="saas-phase-one-intro is-compact">
          <div>
            <span className="saas-phase-one-kicker"><Globe2 size={14} /> Platform portfolio</span>
            <h2>Every tenant, clearly organized.</h2>
            <p>Open a website, its owner, or its settings directly from one compact overview.</p>
          </div>
        </section>

        <section className="saas-admin-management-main">
          <div className="saas-phase-one-section-heading">
            <div>
              <span>Tenant websites</span>
              <h2>All Websites</h2>
              <p>{websites.length} website{websites.length === 1 ? "" : "s"} across the platform.</p>
            </div>
          </div>
        {websites.length === 0 ? (
          <div className="saas-admin-compact-empty">No websites have been created yet.</div>
        ) : (
          <div className="saas-admin-website-list">
            {websiteRows.map(({ website, builderHref, previewHref }) => {
              const owner = usersById.get(website.ownerId);
              return (
                <article
                  className="saas-admin-website-row"
                  key={website.id}
                >
                  <span className="saas-admin-website-icon"><Globe2 size={19} /></span>
                  <div className="saas-admin-website-identity">
                    <Link href={`/app/websites/${getWebsiteRouteSegment(website)}/settings`}>
                      {website.name}
                    </Link>
                    <small>{website.primaryDomain || `/${website.slug}`}</small>
                  </div>
                  <Link className="saas-admin-owner-link" href={owner ? `/admin/users/${owner.id}` : "/admin/users"}>
                    <UserRound size={14} /> {owner?.email ?? "Unknown owner"}
                  </Link>
                  <div className="saas-admin-website-state">
                    <span className={`saas-phase-one-status is-${website.status}`}>{website.status}</span>
                    <small>{new Date(website.createdAt).toLocaleDateString()}</small>
                  </div>
                  <div className="saas-row-actions">
                    <Link href={builderHref}><LayoutDashboard size={14} /> Builder</Link>
                    <Link href={previewHref}><ExternalLink size={14} /> Preview</Link>
                    <Link href={`/app/websites/${getWebsiteRouteSegment(website)}/settings`}><Settings2 size={14} /> Settings</Link>
                    <a href={`/api/websites/${getWebsiteRouteSegment(website)}/export-backup`}><Download size={14} /> Export</a>
                    <DeleteWebsiteButton
                      websiteId={getWebsiteRouteSegment(website)}
                      websiteName={website.name}
                    />
                  </div>
                </article>
              );
            })}
          </div>
        )}
        </section>
      </div>
    </SaaSShell>
  );
}
