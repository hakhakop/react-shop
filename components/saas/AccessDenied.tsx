import Link from "next/link";
import SaaSI18nProvider from "@/components/i18n/SaaSI18nProvider";
import { T } from "@/components/i18n/LanguageProvider";

export default function AccessDenied() {
  return (
    <SaaSI18nProvider><main className="saas-auth-page">
      <section className="saas-auth-card">
        <div className="saas-auth-heading">
          <span><T k="errors.accessDenied" /></span>
          <h1><T k="errors.adminOnly" /></h1>
          <p><T k="errors.noPermission" /></p>
        </div>
        <Link className="saas-auth-submit" href="/app">
          <T k="errors.backToDashboard" />
        </Link>
      </section>
    </main></SaaSI18nProvider>
  );
}
