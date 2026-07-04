import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
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
      {websites.length === 0 ? (
        <section className="saas-empty-state">
          <span>No websites yet</span>
          <p>
            Your hosted React websites will appear here after you create the
            first project.
          </p>
          <Link className="saas-auth-submit" href="/app/websites/new">
            Create Website
          </Link>
        </section>
      ) : (
        <section className="saas-panel">
          <div className="saas-panel-heading">
            <h2>Your websites</h2>
            <Link className="saas-auth-submit" href="/app/websites/new">
              Create Website
            </Link>
          </div>
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
                  <Link href={previewHref}>Open Website</Link>
                  <Link href={`/app/websites/${getWebsiteRouteSegment(website)}/settings`}>
                    Settings
                  </Link>
                  <a
                    href={`/api/websites/${getWebsiteRouteSegment(website)}/export-backup`}
                  >
                    Export Backup
                  </a>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </SaaSShell>
  );
}
