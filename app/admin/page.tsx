import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AccessDenied from "@/components/saas/AccessDenied";
import SaaSShell from "@/components/saas/SaaSShell";
import { getCurrentUser, isSaaSAdmin, readPublicUsers } from "@/lib/auth";
import { loginRedirectFor } from "@/lib/saasRoutes";
import { readSubscriptionPackages } from "@/lib/subscriptions";
import { readGlobalStarters } from "@/lib/globalStarters";
import { readWebsites } from "@/lib/websites";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const user = await getCurrentUser(await cookies());

  if (!user) {
    redirect(loginRedirectFor("/admin"));
  }

  if (!isSaaSAdmin(user)) {
    return <AccessDenied />;
  }

  const [users, websites, packages, globalStarters] = await Promise.all([
    readPublicUsers(),
    readWebsites(),
    readSubscriptionPackages(),
    readGlobalStarters(),
  ]);
  const activeWebsites = websites.filter((website) => website.status === "active");
  const activePackages = packages.filter((item) => item.isActive);
  const creatingWebsites = websites.filter(
    (website) =>
      website.status === "creating" ||
      website.status === "preparing" ||
      website.status === "maintenance",
  );

  return (
    <SaaSShell
      user={user}
      title="Platform Administration"
      eyebrow="Platform administration"
      actionHref="/admin/websites"
      actionLabel="Websites"
    >
      <section className="saas-dashboard-card">
        <span>Customers</span>
        <strong>{users.length}</strong>
        <p>Review registered dashboard users and their roles.</p>
        <Link href="/admin/users">Manage customers</Link>
      </section>
      <section className="saas-dashboard-card">
        <span>Websites</span>
        <strong>{websites.length}</strong>
        <p>Review websites across every SaaS customer account.</p>
        <Link href="/admin/websites">View websites</Link>
      </section>
      <section className="saas-dashboard-card">
        <span>Global Starters</span>
        <strong>{globalStarters.filter((starter) => starter.enabled).length}</strong>
        <p>Manage the public starter catalog and its source websites.</p>
        <Link href="/admin/global-starters">Manage Global Starters</Link>
      </section>
      {user.role === "super_admin" && (
        <section className="saas-dashboard-card">
          <span>Packages</span>
          <strong>{activePackages.length}</strong>
          <p>Active subscription packages shown during registration.</p>
          <Link href="/admin/packages">Manage packages</Link>
        </section>
      )}
      <section className="saas-dashboard-card">
        <span>Active</span>
        <strong>{activeWebsites.length}</strong>
        <p>Active websites across the platform.</p>
        <Link href="/admin/websites">Open website list</Link>
      </section>
      <section className="saas-dashboard-card">
        <span>Creating / Maintenance</span>
        <strong>{creatingWebsites.length}</strong>
        <p>Websites still being prepared or maintained.</p>
        <Link href="/admin/websites">Review websites</Link>
      </section>
    </SaaSShell>
  );
}
