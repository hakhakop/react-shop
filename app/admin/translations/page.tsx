import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import TranslationsManager from "@/components/admin/TranslationsManager";
import { T } from "@/components/i18n/LanguageProvider";
import AccessDenied from "@/components/saas/AccessDenied";
import SaaSShell from "@/components/saas/SaaSShell";
import { getCurrentUser, isSaaSSuperAdmin } from "@/lib/auth";
import { loadAllMessages } from "@/lib/i18n.server";
import { loginRedirectFor } from "@/lib/saasRoutes";

export const dynamic = "force-dynamic";

export default async function AdminTranslationsPage() {
  const user = await getCurrentUser(await cookies());
  if (!user) redirect(loginRedirectFor("/admin/translations"));
  if (!isSaaSSuperAdmin(user)) return <AccessDenied />;

  const messages = await loadAllMessages();

  return (
    <SaaSShell
      actionHref="/admin"
      actionLabel={<T k="translations.actionAdminHome" />}
      eyebrow={<T k="translations.eyebrow" />}
      title={<T k="translations.title" />}
      user={user}
    >
      <div className="saas-phase-one-page">
        <section className="saas-phase-one-intro">
          <div>
            <span className="saas-phase-one-kicker"><T k="translations.kicker" /></span>
            <h2><T k="translations.managerTitle" /></h2>
            <p><T k="translations.managerDescription" /></p>
          </div>
        </section>
        <TranslationsManager initialMessages={messages} />
      </div>
    </SaaSShell>
  );
}
