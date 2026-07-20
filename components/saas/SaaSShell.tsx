import Link from "next/link";
import LogoutButton from "@/components/auth/LogoutButton";
import ThemeToggle from "@/components/ThemeToggle";
import LanguageSwitcher from "@/components/i18n/LanguageSwitcher";
import SaaSI18nProvider from "@/components/i18n/SaaSI18nProvider";
import { T } from "@/components/i18n/LanguageProvider";
import { isSaaSAdmin, isSaaSSuperAdmin, type PublicSaaSUser } from "@/lib/auth";

type SaaSShellProps = {
  user: PublicSaaSUser;
  title: React.ReactNode;
  eyebrow?: React.ReactNode;
  actionHref?: string;
  actionLabel?: React.ReactNode;
  children: React.ReactNode;
};

const appLinks = [
  { href: "/app", label: <T k="dashboard.title" /> },
  { href: "/app/websites", label: <T k="websites.title" /> },
  { href: "/app/settings", label: <T k="common.settings" /> },
];

export default function SaaSShell({
  user,
  title,
  eyebrow = <T k="dashboard.workspace" />,
  actionHref = "/app/websites",
  actionLabel = <T k="websites.title" />,
  children,
}: SaaSShellProps) {
  const canUseAdmin = isSaaSAdmin(user);
  const canManagePackages = isSaaSSuperAdmin(user);

  return (
    <SaaSI18nProvider userLocale={user.language} persistForUser>
    <main className="saas-shell">
      <aside className="saas-shell-sidebar">
        <Link className="saas-shell-brand" href="/app">
          <span>WebPages</span>
          <strong><T k="dashboard.title" /></strong>
        </Link>

        <nav className="saas-shell-nav" aria-label="SaaS navigation">
          {appLinks.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
          {canUseAdmin && (
            <>
              <span className="saas-shell-nav-label"><T k="navigation.admin" /></span>
              <Link href="/admin"><T k="navigation.adminHome" /></Link>
              {canManagePackages && <Link href="/admin/packages"><T k="navigation.packages" /></Link>}
              {canManagePackages && <Link href="/admin/translations"><T k="navigation.translations" /></Link>}
              <Link href="/admin/websites"><T k="navigation.allWebsites" /></Link>
              <Link href="/admin/users"><T k="navigation.users" /></Link>
            </>
          )}
        </nav>

      </aside>

      <section className="saas-shell-main">
        <header className="saas-shell-header">
          <div>
            <span>{eyebrow}</span>
            <h1>{title}</h1>
          </div>
          <div className="saas-shell-header-actions">
            <LanguageSwitcher />
            <ThemeToggle variant="ghost" size="md" />
            <Link className="saas-shell-header-link" href={actionHref}>
              {actionLabel}
            </Link>
            <div className="saas-shell-account">
              <div className="saas-shell-account-copy">
                <span>{user.name}</span>
                <small>{user.email}</small>
              </div>
              <LogoutButton />
            </div>
          </div>
        </header>
        {children}
      </section>
    </main>
    </SaaSI18nProvider>
  );
}
