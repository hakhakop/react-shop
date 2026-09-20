import Link from "next/link";
import { Clock3 } from "lucide-react";

export default function WebsiteReadinessNotice({
  websiteName,
  publicSurface = false,
}: {
  websiteName: string;
  publicSurface?: boolean;
}) {
  return (
    <div className="saas-phase-one-page saas-website-readiness-page">
      <section className="saas-phase-one-empty-state saas-website-readiness-card">
        <span className="saas-phase-one-empty-icon"><Clock3 size={28} /></span>
        <div>
          <span className="saas-phase-one-kicker">Website setup</span>
          <h1>Creating your website…</h1>
          <p>
            We’re setting everything up for <strong>{websiteName}</strong>. You’ll be able to start editing when your website is ready.
          </p>
        </div>
        <Link className="saas-phase-one-secondary-action" href={publicSurface ? "/" : "/app/websites"}>
          {publicSurface ? "Back to WebPages" : "Back to My Websites"}
        </Link>
      </section>
    </div>
  );
}
