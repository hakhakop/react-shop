import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AccessDenied from "@/components/saas/AccessDenied";
import SaaSShell from "@/components/saas/SaaSShell";
import { getCurrentUser, isSaaSAdmin } from "@/lib/auth";
import { loginRedirectFor } from "@/lib/saasRoutes";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const user = await getCurrentUser(await cookies());

  if (!user) {
    redirect(loginRedirectFor("/admin"));
  }

  if (!isSaaSAdmin(user)) {
    return <AccessDenied />;
  }

  return (
    <SaaSShell user={user} title="Admin" eyebrow="Admin workspace">
      <section className="saas-dashboard-card">
        <span>Users</span>
        <strong>SaaS users</strong>
        <p>Review registered dashboard users and their roles.</p>
        <Link href="/admin/users">Manage users</Link>
      </section>
      <section className="saas-dashboard-card">
        <span>Websites</span>
        <strong>All websites</strong>
        <p>Review websites across every SaaS customer account.</p>
        <Link href="/admin/websites">View websites</Link>
      </section>
    </SaaSShell>
  );
}
