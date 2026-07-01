import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AccessDenied from "@/components/saas/AccessDenied";
import SaaSShell from "@/components/saas/SaaSShell";
import { getCurrentUser } from "@/lib/auth";
import { loginRedirectFor } from "@/lib/saasRoutes";
import {
  canAccessWebsiteBuilder,
  getWebsiteById,
  updateWebsiteSettings,
  validateWebsiteSettingsInput,
  type WebsiteStatus,
} from "@/lib/websites";

export const dynamic = "force-dynamic";

type WebsiteSettingsPageProps = {
  params: Promise<{
    websiteId: string;
  }>;
  searchParams?: Promise<{
    error?: string;
    saved?: string;
  }>;
};

const settingsSections = [
  "General",
  "Branding",
  "Domains",
  "SEO",
  "Members",
  "Advanced",
];

const futureCards = [
  { title: "Branding", description: "Logo, favicon, colors, and brand assets." },
  { title: "Logo", description: "Upload and manage the main website logo." },
  { title: "Favicon", description: "Set browser and mobile shortcut icons." },
  { title: "Domains", description: "Connect custom domains and DNS later." },
  { title: "SEO", description: "Default metadata and search appearance." },
  { title: "Members", description: "Invite teammates and manage access." },
];

async function saveWebsiteSettingsAction(formData: FormData) {
  "use server";

  const websiteId = String(formData.get("websiteId") ?? "");
  const user = await getCurrentUser(await cookies());
  const errorRedirect = (message: string): never => {
    const params = new URLSearchParams({ error: message });
    redirect(`/app/websites/${websiteId}/settings?${params.toString()}`);
  };

  if (!user) {
    redirect(loginRedirectFor(`/app/websites/${websiteId}/settings`));
  }

  const website = await getWebsiteById(websiteId);
  if (!website || !canAccessWebsiteBuilder(user, website)) {
    errorRedirect("Access denied.");
  }

  const parsed = validateWebsiteSettingsInput({
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description"),
    timeZone: formData.get("timeZone"),
    language: formData.get("language"),
    status: formData.get("status"),
  });

  if ("error" in parsed && parsed.error) {
    errorRedirect(parsed.error);
  }

  const settings = parsed as {
    name: string;
    slug: string;
    description: string;
    timeZone: string;
    language: string;
    status: WebsiteStatus;
  };

  const result = await updateWebsiteSettings({ websiteId, ...settings });
  if ("error" in result) {
    errorRedirect(result.error ?? "Website settings could not be saved.");
  }

  redirect(`/app/websites/${websiteId}/settings?saved=1`);
}

export default async function WebsiteSettingsPage({
  params,
  searchParams,
}: WebsiteSettingsPageProps) {
  const [{ websiteId }, user, query] = await Promise.all([
    params,
    getCurrentUser(await cookies()),
    searchParams,
  ]);

  if (!user) {
    redirect(loginRedirectFor(`/app/websites/${websiteId}/settings`));
  }

  const website = await getWebsiteById(websiteId);
  if (!website || !canAccessWebsiteBuilder(user, website)) {
    return <AccessDenied />;
  }

  return (
    <SaaSShell user={user} title="Website Settings" eyebrow={website.name}>
      <div className="saas-settings-layout">
        <aside className="saas-settings-sidebar" aria-label="Website settings">
          {settingsSections.map((section) => (
            <a
              key={section}
              className={section === "General" ? "is-active" : ""}
              href={`#${section.toLowerCase()}`}
            >
              {section}
              {section !== "General" && <span>Soon</span>}
            </a>
          ))}
        </aside>

        <div className="saas-settings-content">
          <section className="saas-panel" id="general">
            <div className="saas-panel-heading">
              <div>
                <h2>General</h2>
                <p>Manage the basic identity and status of this website.</p>
              </div>
            </div>

            <form className="saas-settings-form" action={saveWebsiteSettingsAction}>
              <input type="hidden" name="websiteId" value={website.id} />

              <label className="saas-auth-field">
                <span>Website Name</span>
                <input
                  name="name"
                  required
                  maxLength={100}
                  defaultValue={website.name}
                />
              </label>

              <label className="saas-auth-field">
                <span>Website Slug</span>
                <input
                  name="slug"
                  required
                  minLength={3}
                  maxLength={60}
                  pattern="[a-z0-9]+(-[a-z0-9]+)*"
                  defaultValue={website.slug}
                />
              </label>

              <label className="saas-auth-field saas-field-wide">
                <span>Website Description</span>
                <textarea
                  name="description"
                  maxLength={240}
                  rows={4}
                  defaultValue={website.description}
                  placeholder="Short internal description for this website."
                />
              </label>

              <label className="saas-auth-field">
                <span>Website Time Zone</span>
                <select name="timeZone" defaultValue={website.timeZone}>
                  <option value="Asia/Yerevan">Asia/Yerevan</option>
                  <option value="UTC">UTC</option>
                  <option value="Europe/Paris">Europe/Paris</option>
                  <option value="America/New_York">America/New_York</option>
                </select>
              </label>

              <label className="saas-auth-field">
                <span>Website Language</span>
                <select name="language" defaultValue={website.language}>
                  <option value="hy">Armenian</option>
                  <option value="en">English</option>
                  <option value="ru">Russian</option>
                </select>
              </label>

              <label className="saas-auth-field">
                <span>Website Status</span>
                <select
                  name="status"
                  defaultValue={
                    website.status === "creating" ? "maintenance" : website.status
                  }
                >
                  <option value="active">Active</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="suspended">Suspended</option>
                </select>
              </label>

              {query?.error && <p className="saas-auth-error">{query.error}</p>}
              {query?.saved && (
                <p className="saas-auth-success">Website settings saved.</p>
              )}

              <button className="saas-auth-submit" type="submit">
                Save Changes
              </button>
            </form>
          </section>

          <section className="saas-settings-placeholder-grid">
            {futureCards.map((card) => (
              <article className="saas-settings-placeholder" key={card.title}>
                <span>{card.title}</span>
                <p>{card.description}</p>
                <strong>Coming Soon</strong>
              </article>
            ))}
          </section>
        </div>
      </div>
    </SaaSShell>
  );
}
