import Image from "next/image";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ExternalLink, Globe2, LayoutTemplate, Settings2 } from "lucide-react";
import AccessDenied from "@/components/saas/AccessDenied";
import GlobalStarterManager from "@/components/saas/GlobalStarterManager";
import SaaSShell from "@/components/saas/SaaSShell";
import { getCurrentUser, isSaaSAdmin } from "@/lib/auth";
import { loginRedirectFor } from "@/lib/saasRoutes";
import { readGlobalStarters } from "@/lib/globalStarters";
import { getWebsiteRouteSegment, readWebsites } from "@/lib/websites";
import { getDefaultWebsiteBuilderLinks } from "@/lib/websiteBuilderLinks.server";

export const dynamic = "force-dynamic";

type GlobalStartersPageProps = {
  searchParams?: Promise<{ starterId?: string }>;
};

export default async function AdminGlobalStartersPage({
  searchParams,
}: GlobalStartersPageProps) {
  const user = await getCurrentUser(await cookies());

  if (!user) {
    redirect(loginRedirectFor("/admin/global-starters"));
  }

  if (!isSaaSAdmin(user)) {
    return <AccessDenied />;
  }

  const params = await searchParams;
  const [globalStarters, websites] = await Promise.all([
    readGlobalStarters(),
    readWebsites(),
  ]);
  const websitesById = new Map(websites.map((website) => [website.id, website]));
  const starterRows = (
    await Promise.all(
      globalStarters.map(async (starter) => {
        const sourceWebsite = websitesById.get(starter.sourceWebsiteId);
        if (!sourceWebsite) return null;
        return {
          starter,
          sourceWebsite,
          links: await getDefaultWebsiteBuilderLinks(sourceWebsite),
        };
      }),
    )
  ).filter((row): row is NonNullable<typeof row> => row !== null);

  return (
    <SaaSShell
      user={user}
      title="Global Starters"
      eyebrow="Platform administration"
      actionHref="/admin/websites"
      actionLabel="Websites"
    >
      <div className="saas-phase-one-page saas-admin-global-starters-page">
        <section className="saas-phase-one-intro is-compact">
          <div>
            <span className="saas-phase-one-kicker"><LayoutTemplate size={14} /> Public catalog</span>
            <h2>Global Starters</h2>
            <p>Manage reusable designs while keeping each source website editable in the normal Builder.</p>
          </div>
          <Link className="saas-phase-one-secondary-action" href="/admin/websites">
            <Globe2 size={15} /> View Websites
          </Link>
        </section>

        <section className="saas-admin-management-main saas-admin-global-starters-main">
          <div className="saas-phase-one-section-heading">
            <div>
              <span>Starter catalog</span>
              <h2>Published and unpublished starters</h2>
              <p>{starterRows.length} Global Starter{starterRows.length === 1 ? "" : "s"} connected to ordinary tenant websites.</p>
            </div>
          </div>

          {starterRows.length === 0 ? (
            <div className="saas-admin-compact-empty">
              No Global Starters yet. Designate a source website from the Websites page.
            </div>
          ) : (
            <div className="saas-admin-global-starter-catalog-list">
              {starterRows.map(({ starter, sourceWebsite, links }) => (
                <article
                  className={`saas-admin-global-starter-catalog-item ${params?.starterId === starter.id ? "is-focused" : ""}`}
                  key={starter.id}
                >
                  <div className="saas-admin-global-starter-catalog-preview">
                    {starter.previewImageUrl ? (
                      <Image
                        src={starter.previewImageUrl}
                        alt=""
                        width={320}
                        height={200}
                        unoptimized
                      />
                    ) : (
                      <LayoutTemplate size={28} aria-hidden="true" />
                    )}
                  </div>
                  <div className="saas-admin-global-starter-catalog-editor">
                    <GlobalStarterManager
                      websiteId={sourceWebsite.id}
                      websiteName={sourceWebsite.name}
                      starter={starter}
                      initialExpanded={params?.starterId === starter.id}
                    />
                  </div>
                  <aside className="saas-admin-global-starter-catalog-source">
                    <span>Source website</span>
                    <Link href={`/app/websites/${getWebsiteRouteSegment(sourceWebsite)}/settings`}>
                      {sourceWebsite.name}
                    </Link>
                    <div className="saas-row-actions">
                      <Link href={`/templates/${encodeURIComponent(starter.id)}`}>
                        <ExternalLink size={13} /> Preview
                      </Link>
                      <Link href={links.builderHref}>
                        <LayoutTemplate size={13} /> Builder
                      </Link>
                      <Link href={`/app/websites/${getWebsiteRouteSegment(sourceWebsite)}/settings`}>
                        <Settings2 size={13} /> Settings
                      </Link>
                    </div>
                  </aside>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </SaaSShell>
  );
}
