import Link from "next/link";
import LogoutButton from "@/components/auth/LogoutButton";
import { isSaaSAdmin, type PublicSaaSUser } from "@/lib/auth";

type SaaSShellProps = {
  user: PublicSaaSUser;
  title: string;
  eyebrow?: string;
  children: React.ReactNode;
};

const appLinks = [
  { href: "/app", label: "Dashboard" },
  { href: "/app/websites", label: "My Websites" },
  { href: "/app/settings", label: "Settings" },
];

export default function SaaSShell({
  user,
  title,
  eyebrow = "SaaS workspace",
  children,
}: SaaSShellProps) {
  const canUseAdmin = isSaaSAdmin(user);

  return (
    <main className="saas-shell">
      <aside className="saas-shell-sidebar">
        <Link className="saas-shell-brand" href="/app">
          <span>WebPages</span>
          <strong>Dashboard</strong>
        </Link>

        <nav className="saas-shell-nav" aria-label="SaaS navigation">
          {appLinks.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
          {canUseAdmin && (
            <>
              <span className="saas-shell-nav-label">Admin</span>
              <Link href="/admin">Admin Home</Link>
              <Link href="/admin/websites">Websites</Link>
              <Link href="/admin/users">Users</Link>
            </>
          )}
        </nav>

        <div className="saas-shell-user">
          <span>{user.name}</span>
          <small>{user.email}</small>
          <LogoutButton />
        </div>
      </aside>

      <section className="saas-shell-main">
        <header className="saas-shell-header">
          <div>
            <span>{eyebrow}</span>
            <h1>{title}</h1>
          </div>
          <Link className="saas-shell-header-link" href="/dashboard">
            Builder
          </Link>
        </header>
        {children}
      </section>
    </main>
  );
}
