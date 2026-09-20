import Link from "next/link";
import { ArrowLeft, ArrowRight, LayoutTemplate } from "lucide-react";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import StorefrontBuilderRenderer from "@/components/builder/StorefrontBuilderRenderer";
import { getCurrentUser } from "@/lib/auth";
import { loginRedirectFor } from "@/lib/saasRoutes";
import { createStarterWebsiteData, getStarterWebsite, isStarterWebsiteId, type StarterWebsiteId } from "@/lib/starterWebsites";
import { getGlobalStarter } from "@/lib/globalStarters";

export const dynamic = "force-dynamic";

export default async function TemplatePreviewPage({
  params,
}: {
  params: Promise<{ starterId: string }>;
}) {
  const { starterId } = await params;
  const globalStarter = isStarterWebsiteId(starterId)
    ? null
    : await getGlobalStarter(starterId);
  if (!isStarterWebsiteId(starterId) && !globalStarter) notFound();

  if (globalStarter) {
    redirect(
      `/app/websites/${encodeURIComponent(globalStarter.sourceWebsiteId)}/preview?globalStarterId=${encodeURIComponent(starterId)}`,
    );
  }

  const staticStarterId = starterId as StarterWebsiteId;
  const starter = getStarterWebsite(staticStarterId);
  const starterData = createStarterWebsiteData({ starterId: staticStarterId, websiteName: starter.name });
  const layout = starterData.layouts.home;
  if (!layout) notFound();

  const user = await getCurrentUser(await cookies());
  const destination = `/app/websites/new?starterId=${encodeURIComponent(starter.id)}`;
  const startHref = user ? destination : loginRedirectFor(destination);

  return (
    <div className="saas-phase-one-page saas-websites-page">
      <section className="saas-phase-one-intro is-compact">
        <div>
          <Link className="saas-shell-header-link" href="/templates"><ArrowLeft size={15} /> Templates</Link>
          <span className="saas-phase-one-kicker"><LayoutTemplate size={14} /> Starter preview</span>
          <h1>{starter.name}</h1>
          <p>{starter.description}</p>
        </div>
        <Link className="saas-phase-one-primary-action" href={startHref}>
          Start with this template <ArrowRight size={16} />
        </Link>
      </section>
      <StorefrontBuilderRenderer layout={layout} page="home" shellSettings={starterData.shell} />
    </div>
  );
}
