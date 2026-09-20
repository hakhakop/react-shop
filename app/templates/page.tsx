import Link from "next/link";
import { ArrowRight, Eye, LayoutTemplate } from "lucide-react";
import { cookies } from "next/headers";
import { getCurrentUser } from "@/lib/auth";
import { loginRedirectFor } from "@/lib/saasRoutes";
import { starterWebsiteLibrary } from "@/lib/starterWebsites";

export const dynamic = "force-dynamic";

export default async function TemplatesPage() {
  const user = await getCurrentUser(await cookies());

  return (
    <div className="saas-phase-one-page saas-websites-page">
      <section className="saas-phase-one-intro">
        <div>
          <span className="saas-phase-one-kicker"><LayoutTemplate size={14} /> Start with a direction</span>
          <h1>Templates for the next version of your website.</h1>
          <p>Choose a considered starting point, preview it, and continue directly into the visual Builder.</p>
        </div>
        <Link className="saas-phase-one-primary-action" href="/app/websites/new">
          Create Website <ArrowRight size={16} />
        </Link>
      </section>

      <section className="saas-premium-website-grid" aria-label="WebPages templates">
        {starterWebsiteLibrary.map((starter) => {
          const destination = `/app/websites/new?starterId=${encodeURIComponent(starter.id)}`;
          const startHref = user ? destination : loginRedirectFor(destination);
          return (
            <article className="saas-premium-website-card is-control-center" key={starter.id}>
              <div className="saas-premium-website-visual">
                <span className="saas-premium-website-monogram">{starter.name.slice(0, 2).toUpperCase()}</span>
                <div>
                  <small>WebPages starter</small>
                  <strong>{starter.name}</strong>
                </div>
              </div>
              <div className="saas-premium-website-body">
                <div className="saas-premium-website-heading">
                  <div>
                    <span className="saas-premium-website-icon"><LayoutTemplate size={19} /></span>
                    <div><h2>{starter.name}</h2><p>Editable in the WebPages Builder</p></div>
                  </div>
                </div>
                <p className="saas-premium-website-description">{starter.description}</p>
                <span className={`saas-starter-preview saas-starter-preview--${starter.preview.tone}`} aria-hidden="true">
                  {starter.preview.rows.map((width, index) => <i key={index} style={{ width: `${width}%` }} />)}
                </span>
                <div className="saas-premium-website-actions">
                  <Link href={`/templates/${starter.id}`}><Eye size={15} /> Preview</Link>
                  <Link className="is-primary" href={startHref}>Start with this template <ArrowRight size={15} /></Link>
                </div>
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
}
