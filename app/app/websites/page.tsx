import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import SaaSShell from "@/components/saas/SaaSShell";
import { getCurrentUser } from "@/lib/auth";
import { getWebsitesForOwner } from "@/lib/websites";
import { loginRedirectFor } from "@/lib/saasRoutes";

export const dynamic = "force-dynamic";

export default async function WebsitesPage() {
  const user = await getCurrentUser(await cookies());

  if (!user) {
    redirect(loginRedirectFor("/app/websites"));
  }

  const websites = await getWebsitesForOwner(user.id);

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
            {websites.map((website) => (
              <article className="saas-website-card" key={website.id}>
                <span>{website.status}</span>
                <h3>{website.name}</h3>
                <p>Slug: /{website.slug}</p>
                <small>
                  Created {new Date(website.createdAt).toLocaleDateString()}
                </small>
                <div className="saas-website-actions">
                  <button type="button">Open Builder</button>
                  <button type="button">Open Website</button>
                  <button type="button">Settings</button>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </SaaSShell>
  );
}
