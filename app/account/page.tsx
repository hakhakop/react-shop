import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import LogoutButton from "@/components/auth/LogoutButton";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const user = await getCurrentUser(await cookies());

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="saas-auth-page">
      <section className="saas-auth-card saas-account-card">
        <div className="saas-auth-heading">
          <span>SaaS account</span>
          <h1>{user.name}</h1>
          <p>You are signed in to the React dashboard account system.</p>
        </div>

        <dl className="saas-account-details">
          <div>
            <dt>Email</dt>
            <dd>{user.email}</dd>
          </div>
          <div>
            <dt>Role</dt>
            <dd>{user.role}</dd>
          </div>
          <div>
            <dt>Created</dt>
            <dd>{new Date(user.createdAt).toLocaleDateString()}</dd>
          </div>
        </dl>

        <div className="saas-account-actions">
          <Link className="saas-auth-submit" href="/app">
            Open dashboard
          </Link>
          <LogoutButton />
        </div>
      </section>
    </main>
  );
}
