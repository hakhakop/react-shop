import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import AccessDenied from "@/components/saas/AccessDenied";
import SaaSShell from "@/components/saas/SaaSShell";
import { getCurrentUser, isSaaSAdmin, readPublicUsers } from "@/lib/auth";
import { readWebsites } from "@/lib/websites";
import { loginRedirectFor } from "@/lib/saasRoutes";

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

  return (
    <SaaSShell user={user} title="All Websites" eyebrow="Admin workspace">
      <section className="saas-panel">
        <h2>All Websites</h2>
        {websites.length === 0 ? (
          <p>No websites have been created yet.</p>
        ) : (
          <div className="saas-users-table" role="table">
            <div className="saas-users-row saas-users-row--websites is-heading" role="row">
              <span>Name</span>
              <span>Owner</span>
              <span>Status</span>
              <span>Created</span>
              <span>Actions</span>
            </div>
            {websites.map((website) => {
              const owner = usersById.get(website.ownerId);
              return (
                <div
                  className="saas-users-row saas-users-row--websites"
                  key={website.id}
                  role="row"
                >
                  <span>{website.name}</span>
                  <span>{owner?.email ?? "Unknown owner"}</span>
                  <span>{website.status}</span>
                  <span>{new Date(website.createdAt).toLocaleDateString()}</span>
                  <span className="saas-row-actions">
                    <Link href={`/app/websites/${website.id}/builder`}>
                      Builder
                    </Link>
                    <Link href={`/app/websites/${website.id}/settings`}>
                      Settings
                    </Link>
                    <Link href={`/app/websites/${website.id}/preview`}>
                      Preview
                    </Link>
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </SaaSShell>
  );
}
