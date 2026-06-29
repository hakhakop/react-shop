import Link from "next/link";

export default function AccessDenied() {
  return (
    <main className="saas-auth-page">
      <section className="saas-auth-card">
        <div className="saas-auth-heading">
          <span>Access denied</span>
          <h1>Admin only</h1>
          <p>Your SaaS account does not have permission to view this area.</p>
        </div>
        <Link className="saas-auth-submit" href="/app">
          Back to dashboard
        </Link>
      </section>
    </main>
  );
}
