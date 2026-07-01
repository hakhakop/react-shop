import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import AccessDenied from "@/components/saas/AccessDenied";
import SaaSShell from "@/components/saas/SaaSShell";
import { getCurrentUser, isSaaSAdmin, readPublicUsers } from "@/lib/auth";
import { getWebsiteCountsByOwner, readWebsites } from "@/lib/websites";
import { loginRedirectFor } from "@/lib/saasRoutes";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const user = await getCurrentUser(await cookies());

  if (!user) {
    redirect(loginRedirectFor("/admin/users"));
  }

  if (!isSaaSAdmin(user)) {
    return <AccessDenied />;
  }

  const [users, websites] = await Promise.all([readPublicUsers(), readWebsites()]);
  const websiteCounts = getWebsiteCountsByOwner(websites);

  return (
    <SaaSShell user={user} title="Users" eyebrow="Admin workspace">
      <section className="saas-panel">
        <h2>Registered SaaS users</h2>
        <div className="saas-users-table" role="table">
          <div className="saas-users-row is-heading" role="row">
            <span>Name</span>
            <span>Email</span>
            <span>Role</span>
            <span>Websites</span>
            <span>Actions</span>
          </div>
          {users.map((item) => (
            <div className="saas-users-row" key={item.id} role="row">
              <span>{item.name}</span>
              <span>{item.email}</span>
              <span>{item.role}</span>
              <span>{websiteCounts.get(item.id) ?? 0}</span>
              <span className="saas-row-actions">
                <Link href={`/admin/users/${item.id}`}>View User</Link>
              </span>
            </div>
          ))}
        </div>
      </section>
    </SaaSShell>
  );
}
