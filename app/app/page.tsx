import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import SaaSShell from "@/components/saas/SaaSShell";
import { getCurrentUser } from "@/lib/auth";
import { getWebsitesForOwner } from "@/lib/websites";
import { loginRedirectFor } from "@/lib/saasRoutes";

export const dynamic = "force-dynamic";

export default async function AppDashboardPage() {
  const user = await getCurrentUser(await cookies());

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

  return (
    <SaaSShell user={user} title="Dashboard">
      {websites.length === 0 ? (
        <section className="saas-empty-state">
          <span>Welcome to WebPages</span>
          <p>Create your first website.</p>
          <Link className="saas-auth-submit" href="/app/websites/new">
            Create Website
          </Link>
        </section>
      ) : (
        <div className="saas-dashboard-grid">
          <section className="saas-dashboard-card">
            <span>Total Websites</span>
            <strong>{websites.length}</strong>
            <p>All websites connected to your WebPages account.</p>
            <Link href="/app/websites">View websites</Link>
          </section>
          <section className="saas-dashboard-card">
            <span>Active Websites</span>
            <strong>{activeWebsites.length}</strong>
            <p>Websites that are live and ready for visitors.</p>
            <Link href="/app/websites">Open list</Link>
          </section>
          <section className="saas-dashboard-card">
            <span>Draft / Creating Websites</span>
            <strong>{creatingWebsites.length}</strong>
            <p>Websites being prepared for future provisioning.</p>
            <Link href="/app/websites/new">Create Website</Link>
          </section>
        </div>
      )}
    </SaaSShell>
  );
}
