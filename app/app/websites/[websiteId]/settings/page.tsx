import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AccessDenied from "@/components/saas/AccessDenied";
import DomainConnectionStatus from "@/components/saas/DomainConnectionStatus";
import SaaSShell from "@/components/saas/SaaSShell";
import { getCurrentUser, isSaaSAdmin } from "@/lib/auth";
import { loginRedirectFor } from "@/lib/saasRoutes";
import {
  addWebsiteDomain,
  canAccessWebsiteBuilder,
  getWebsiteById,
  getWebsiteByIdOrSlug,
  getWebsiteRouteSegment,
  removeWebsiteDomain,
  setWebsitePrimaryDomain,
  updateWebsiteDomain,
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
    domainSaved?: string;
    domainUpdated?: string;
    error?: string;
    saved?: string;
  }>;
};

const settingsSections = [
  { title: "General", available: true },
  { title: "Branding", available: false },
  { title: "Domains", available: true },
  { title: "SEO", available: false },
  { title: "Members", available: false },
  { title: "Advanced", available: false },
];

const futureCards = [
  { title: "Branding", description: "Logo, favicon, colors, and brand assets." },
  { title: "Logo", description: "Upload and manage the main website logo." },
  { title: "Favicon", description: "Set browser and mobile shortcut icons." },
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

  if (!("website" in result) || !result.website) {
    errorRedirect("Website settings could not be saved.");
  }

  redirect(
    `/app/websites/${getWebsiteRouteSegment(result.website!)}/settings?saved=1`,
  );
}

async function addWebsiteDomainAction(formData: FormData) {
  "use server";

  const websiteId = String(formData.get("websiteId") ?? "");
  const domain = String(formData.get("domain") ?? "");
  const user = await getCurrentUser(await cookies());
  const errorRedirect = (message: string): never => {
    const params = new URLSearchParams({ error: message });
    redirect(`/app/websites/${websiteId}/settings?${params.toString()}#domains`);
  };

  if (!user) {
    redirect(loginRedirectFor(`/app/websites/${websiteId}/settings`));
  }

  const website = await getWebsiteById(websiteId);
  if (!website || !canAccessWebsiteBuilder(user, website)) {
    errorRedirect("Access denied.");
  }

  const result = await addWebsiteDomain({ websiteId, domain });
  if ("error" in result) {
    errorRedirect(result.error ?? "Domain could not be added.");
  }

  if ("website" in result && result.website) {
    redirect(
      `/app/websites/${getWebsiteRouteSegment(result.website)}/settings?domainSaved=1#domains`,
    );
  }

  errorRedirect("Domain could not be added.");
}

async function setPrimaryDomainAction(formData: FormData) {
  "use server";

  const websiteId = String(formData.get("websiteId") ?? "");
  const domain = String(formData.get("domain") ?? "");
  const user = await getCurrentUser(await cookies());
  const errorRedirect = (message: string): never => {
    const params = new URLSearchParams({ error: message });
    redirect(`/app/websites/${websiteId}/settings?${params.toString()}#domains`);
  };

  if (!user) {
    redirect(loginRedirectFor(`/app/websites/${websiteId}/settings`));
  }

  const website = await getWebsiteById(websiteId);
  if (!website || !canAccessWebsiteBuilder(user, website)) {
    errorRedirect("Access denied.");
  }

  const result = await setWebsitePrimaryDomain({ websiteId, domain });
  if ("error" in result) {
    errorRedirect(result.error ?? "Primary domain could not be changed.");
  }

  redirect(`/app/websites/${websiteId}/settings?domainUpdated=1#domains`);
}

async function removeWebsiteDomainAction(formData: FormData) {
  "use server";

  const websiteId = String(formData.get("websiteId") ?? "");
  const domain = String(formData.get("domain") ?? "");
  const user = await getCurrentUser(await cookies());
  const errorRedirect = (message: string): never => {
    const params = new URLSearchParams({ error: message });
    redirect(`/app/websites/${websiteId}/settings?${params.toString()}#domains`);
  };

  if (!user) {
    redirect(loginRedirectFor(`/app/websites/${websiteId}/settings`));
  }

  const website = await getWebsiteById(websiteId);
  if (!website || !canAccessWebsiteBuilder(user, website)) {
    errorRedirect("Access denied.");
  }

  const result = await removeWebsiteDomain({ websiteId, domain });
  if ("error" in result) {
    errorRedirect(result.error ?? "Domain could not be removed.");
  }

  redirect(`/app/websites/${websiteId}/settings?domainUpdated=1#domains`);
}

async function editWebsiteDomainAction(formData: FormData) {
  "use server";

  const websiteId = String(formData.get("websiteId") ?? "");
  const currentDomain = String(formData.get("currentDomain") ?? "");
  const nextDomain = String(formData.get("nextDomain") ?? "");
  const user = await getCurrentUser(await cookies());
  const errorRedirect = (message: string): never => {
    const params = new URLSearchParams({ error: message });
    redirect(`/app/websites/${websiteId}/settings?${params.toString()}#domains`);
  };

  if (!user) {
    redirect(loginRedirectFor(`/app/websites/${websiteId}/settings`));
  }

  const website = await getWebsiteById(websiteId);
  if (!website || !canAccessWebsiteBuilder(user, website)) {
    errorRedirect("Access denied.");
  }

  const result = await updateWebsiteDomain({
    websiteId,
    currentDomain,
    nextDomain,
  });
  if ("error" in result) {
    errorRedirect(result.error ?? "Domain could not be updated.");
  }

  redirect(`/app/websites/${websiteId}/settings?domainUpdated=1#domains`);
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

  const website = await getWebsiteByIdOrSlug(websiteId);
  if (!website || !canAccessWebsiteBuilder(user, website)) {
    return <AccessDenied />;
  }

  return (
    <SaaSShell
      user={user}
      title="Website Settings"
      eyebrow={website.name}
      actionHref={isSaaSAdmin(user) ? "/admin/websites" : "/app/websites"}
      actionLabel={isSaaSAdmin(user) ? "All Websites" : "My Websites"}
    >
      <div className="saas-settings-layout">
        <aside className="saas-settings-sidebar" aria-label="Website settings">
          {settingsSections.map((section) => (
            <a
              key={section.title}
              className={section.title === "General" ? "is-active" : ""}
              href={`#${section.title.toLowerCase()}`}
            >
              {section.title}
              {!section.available && <span>Soon</span>}
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

          <section className="saas-panel" id="domains">
            <div className="saas-panel-heading">
              <div>
                <h2>Domains</h2>
                <p>Add custom domains manually. DNS and SSL automation come later.</p>
              </div>
            </div>

            {website.domains.length > 0 ? (
              <div className="saas-domain-list">
                {website.domains.map((domain) => (
                  <div
                    className="saas-domain-item"
                    key={domain}
                    data-primary={domain === website.primaryDomain ? "true" : "false"}
                  >
                    <DomainConnectionStatus
                      domain={domain}
                      isPrimary={domain === website.primaryDomain}
                      websiteId={website.id}
                    />

                    <form
                      className="saas-domain-edit-form"
                      action={editWebsiteDomainAction}
                    >
                      <input type="hidden" name="websiteId" value={website.id} />
                      <input type="hidden" name="currentDomain" value={domain} />
                      <label className="saas-auth-field">
                        <span>Domain</span>
                        <input
                          name="nextDomain"
                          required
                          defaultValue={domain}
                          autoComplete="off"
                        />
                      </label>
                      <button className="saas-auth-secondary-button" type="submit">
                        Save
                      </button>
                    </form>

                    <div className="saas-domain-actions">
                      {domain === website.primaryDomain ? (
                        <strong>Primary</strong>
                      ) : (
                        <form action={setPrimaryDomainAction}>
                          <input type="hidden" name="websiteId" value={website.id} />
                          <input type="hidden" name="domain" value={domain} />
                          <button
                            className="saas-auth-secondary-button"
                            type="submit"
                          >
                            Set Primary
                          </button>
                        </form>
                      )}

                      <form action={removeWebsiteDomainAction}>
                        <input type="hidden" name="websiteId" value={website.id} />
                        <input type="hidden" name="domain" value={domain} />
                        <button
                          className="saas-auth-secondary-button"
                          type="submit"
                        >
                          Remove
                        </button>
                      </form>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p>No custom domains connected yet.</p>
            )}

            <form className="saas-settings-form" action={addWebsiteDomainAction}>
              <input type="hidden" name="websiteId" value={website.id} />
              <label className="saas-auth-field saas-field-wide">
                <span>Domain</span>
                <input
                  name="domain"
                  required
                  placeholder="clientdomain.am"
                  autoComplete="off"
                />
              </label>
              {query?.domainSaved && (
                <p className="saas-auth-success">Domain added.</p>
              )}
              {query?.domainUpdated && (
                <p className="saas-auth-success">Domain settings updated.</p>
              )}
              <button className="saas-auth-submit" type="submit">
                Add Domain
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
