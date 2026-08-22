import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Globe2, Settings2 } from "lucide-react";
import AccessDenied from "@/components/saas/AccessDenied";
import DomainConnectionStatus from "@/components/saas/DomainConnectionStatus";
import SaaSShell from "@/components/saas/SaaSShell";
import { T } from "@/components/i18n/LanguageProvider";
import { getCurrentUser, isSaaSAdmin, isSaaSSuperAdmin } from "@/lib/auth";
import { loginRedirectFor } from "@/lib/saasRoutes";
import {
  createStoredWebsiteBackup,
  listWebsiteBackups,
  restoreStoredWebsiteBackup,
  restoreWebsiteBackup,
} from "@/lib/websiteBackup";
import {
  getCmsConnection,
  type CmsConnection,
} from "@/lib/cmsConnection";
import { savePersistedRootCmsConnection } from "@/lib/cmsConnectionRoot.server";
import {
  addWebsiteDomain,
  canAccessWebsiteBuilder,
  getWebsiteById,
  getWebsiteByIdOrSlug,
  getWebsiteRouteSegment,
  isRootWebsiteIdentifier,
  removeWebsiteDomain,
  setWebsitePrimaryDomain,
  updateWebsiteDomain,
  updateWebsiteCmsConnection,
  updateWebsiteSettings,
  validateWebsiteCmsConnectionInput,
  validateWebsiteSettingsInput,
  type WebsiteStatus,
  type WebsiteType,
  type SaaSWebsite,
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
    backupCreated?: string;
    backupRestored?: string;
    cmsSaved?: string;
    ecommerceSaved?: string;
    restoreSource?: string;
    saved?: string;
  }>;
};

type SettingSection = {
  title: string;
  id?: string;
  available: boolean;
};

const baseSettingsSections: SettingSection[] = [
  { title: "General", available: true },
  { title: "Branding", available: false },
  { title: "Domains", available: true },
  { title: "SEO", available: false },
  { title: "Members", available: false },
  { title: "Advanced", available: true },
];

const futureCards = [
  { title: "Branding", description: "Logo, favicon, colors, and brand assets." },
  { title: "Logo", description: "Upload and manage the main website logo." },
  { title: "Favicon", description: "Set browser and mobile shortcut icons." },
  { title: "SEO", description: "Default metadata and search appearance." },
  { title: "Members", description: "Invite teammates and manage access." },
];

function rootWebsiteSettingsView(): SaaSWebsite {
  return {
    id: "root",
    ownerId: "root",
    name: "WebPages Root Website",
    slug: "root-website",
    type: "business",
    domain: "webpages.am",
    primaryDomain: "webpages.am",
    domains: ["webpages.am"],
    description: "The public WebPages platform website.",
    timeZone: "Asia/Yerevan",
    language: "hy",
    primaryLanguage: "hy",
    enabledLanguages: ["hy", "en", "ru"],
    status: "active",
    createdAt: "",
    updatedAt: "",
    cmsConnection: getCmsConnection(),
  };
}

function formatBackupSize(sizeBytes: number) {
  if (sizeBytes < 1024) return `${sizeBytes} B`;
  if (sizeBytes < 1024 * 1024) return `${Math.round(sizeBytes / 1024)} KB`;
  return `${(sizeBytes / 1024 / 1024).toFixed(1)} MB`;
}

function formatBackupDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function getAdminBaseUrl(value: string) {
  if (!value) return "";
  return value.replace(/\/+$/, "").replace(/\/wp-admin$/i, "");
}

function getWordPressAdminLink(value: string, path: string) {
  const baseUrl = getAdminBaseUrl(value);
  return baseUrl ? `${baseUrl}/wp-admin/${path}` : "";
}

function getCmsActionLinks(cms: CmsConnection) {
  const siteUrl = cms.siteUrl;
  const wordpressAdminUrl =
    cms.adminUrl ||
    getWordPressAdminLink(siteUrl, "");
  const wooCommerceAdminUrl =
    cms.adminUrl ||
    getWordPressAdminLink(siteUrl, "admin.php?page=wc-admin");
  return [
    { label: "Open CMS", href: wordpressAdminUrl || siteUrl },
    { label: "Open WooCommerce", href: wooCommerceAdminUrl },
    {
      label: "Open Products",
      href: getWordPressAdminLink(siteUrl, "edit.php?post_type=product"),
    },
    {
      label: "Open Orders",
      href: getWordPressAdminLink(siteUrl, "edit.php?post_type=shop_order"),
    },
    {
      label: "Open Settings",
      href: getWordPressAdminLink(siteUrl, "admin.php?page=wc-settings"),
    },
  ];
}

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

  const targetWebsite = await getWebsiteById(websiteId);
  if (!targetWebsite) {
    return errorRedirect("Access denied.");
  }
  if (!canAccessWebsiteBuilder(user, targetWebsite)) {
    return errorRedirect("Access denied.");
  }

  const parsed = validateWebsiteSettingsInput({
    name: formData.get("name"),
    slug: formData.get("slug"),
    type:
      user.role === "super_admin" ? formData.get("type") : targetWebsite.type,
    description: formData.get("description"),
    timeZone: formData.get("timeZone"),
    language: formData.get("language"),
    primaryLanguage: formData.get("primaryLanguage"),
    enabledLanguages: formData.getAll("enabledLanguages"),
    status: formData.get("status"),
  });

  if ("error" in parsed && parsed.error) {
    errorRedirect(parsed.error);
  }

  const settings = parsed as {
    name: string;
    slug: string;
    type: WebsiteType;
    description: string;
    timeZone: string;
    language: string;
    primaryLanguage: "hy" | "en" | "ru";
    enabledLanguages: ("hy" | "en" | "ru")[];
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

async function saveWebsiteCmsConnectionAction(formData: FormData) {
  "use server";

  const websiteId = String(formData.get("websiteId") ?? "");
  const user = await getCurrentUser(await cookies());
  const errorRedirect = (message: string): never => {
    const params = new URLSearchParams({ error: message });
    redirect(
      `/app/websites/${websiteId}/settings?${params.toString()}#cms-connection`,
    );
  };

  if (!user) {
    redirect(loginRedirectFor(`/app/websites/${websiteId}/settings`));
  }

  if (isRootWebsiteIdentifier(websiteId)) {
    if (!isSaaSSuperAdmin(user)) return errorRedirect("Access denied.");
    const existingConnection = getCmsConnection();
    const submittedSecret = String(formData.get("wooCommerceConsumerSecret") ?? "").trim();
    const clearSecret = formData.get("clearWooCommerceConsumerSecret") === "on";
    const submittedPassword = String(formData.get("wordpressApplicationPassword") ?? "").trim();
    const clearPassword = formData.get("clearWordpressApplicationPassword") === "on";
    const parsed = validateWebsiteCmsConnectionInput({
      provider: formData.get("provider") || "wordpress",
      siteUrl: formData.get("siteUrl") || formData.get("wordpressCmsUrl"),
      graphqlUrl: formData.get("graphqlUrl") || formData.get("wordpressGraphqlUrl"),
      adminUrl: formData.get("adminUrl") || formData.get("wordpressAdminUrl"),
      wooCommerceApiUrl: formData.get("wooCommerceApiUrl") || formData.get("wooCommerceRestApiUrl"),
      wordpressUsername: formData.get("wordpressUsername") || formData.get("wordpressAdminUser"),
      wordpressApplicationPassword: clearPassword ? "" : submittedPassword || existingConnection.wordpressApplicationPassword,
      wooCommerceConsumerKey: formData.get("wooCommerceConsumerKey"),
      wooCommerceConsumerSecret: clearSecret ? "" : submittedSecret || existingConnection.wooCommerceConsumerSecret,
      storeStatusNotes: formData.get("storeStatusNotes"),
      technicalNotes: formData.get("technicalNotes"),
    });
    if ("error" in parsed && parsed.error) return errorRedirect(parsed.error);
    await savePersistedRootCmsConnection(parsed as CmsConnection);
    redirect("/app/websites/root/settings?cmsSaved=1#cms-connection");
  }

  const targetWebsite = await getWebsiteById(websiteId);
  if (!targetWebsite) {
    return errorRedirect("Access denied.");
  }
  if (!canAccessWebsiteBuilder(user, targetWebsite)) {
    return errorRedirect("Access denied.");
  }

  const existingConnection = targetWebsite.cmsConnection;

  const submittedSecret = String(
    formData.get("wooCommerceConsumerSecret") ?? "",
  ).trim();
  const clearSecret = formData.get("clearWooCommerceConsumerSecret") === "on";

  const submittedPassword = String(
    formData.get("wordpressApplicationPassword") ?? "",
  ).trim();
  const clearPassword = formData.get("clearWordpressApplicationPassword") === "on";

  const parsed = validateWebsiteCmsConnectionInput({
    provider: formData.get("provider") || "wordpress",
    siteUrl: formData.get("siteUrl") || formData.get("wordpressCmsUrl"),
    graphqlUrl: formData.get("graphqlUrl") || formData.get("wordpressGraphqlUrl"),
    adminUrl: formData.get("adminUrl") || formData.get("wordpressAdminUrl"),
    wooCommerceApiUrl: formData.get("wooCommerceApiUrl") || formData.get("wooCommerceRestApiUrl"),
    wordpressUsername: formData.get("wordpressUsername") || formData.get("wordpressAdminUser"),
    wordpressApplicationPassword: clearPassword
      ? ""
      : submittedPassword || existingConnection?.wordpressApplicationPassword || "",
    wooCommerceConsumerKey: formData.get("wooCommerceConsumerKey"),
    wooCommerceConsumerSecret: clearSecret
      ? ""
      : submittedSecret || existingConnection?.wooCommerceConsumerSecret || "",
    storeStatusNotes: formData.get("storeStatusNotes"),
    technicalNotes: formData.get("technicalNotes"),
  });

  if ("error" in parsed && parsed.error) {
    errorRedirect(parsed.error);
  }

  const result = await updateWebsiteCmsConnection({
    websiteId,
    cmsConnection: parsed as CmsConnection,
  });

  if ("error" in result) {
    errorRedirect(result.error ?? "CMS Connection settings could not be saved.");
  }

  const savedWebsite = "website" in result && result.website
    ? result.website
    : targetWebsite;
  redirect(
    `/app/websites/${getWebsiteRouteSegment(savedWebsite)}/settings?cmsSaved=1#cms-connection`,
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

async function createWebsiteBackupAction(formData: FormData) {
  "use server";

  const websiteId = String(formData.get("websiteId") ?? "");
  const user = await getCurrentUser(await cookies());
  const errorRedirect = (message: string): never => {
    const params = new URLSearchParams({ error: message });
    redirect(`/app/websites/${websiteId}/settings?${params.toString()}#advanced`);
  };

  if (!user) {
    redirect(loginRedirectFor(`/app/websites/${websiteId}/settings`));
  }

  const website = await getWebsiteById(websiteId);
  if (!website || !canAccessWebsiteBuilder(user, website)) {
    errorRedirect("Access denied.");
  }
  const targetWebsite = website!;

  await createStoredWebsiteBackup(targetWebsite);

  redirect(
    `/app/websites/${getWebsiteRouteSegment(targetWebsite)}/settings?backupCreated=1#advanced`,
  );
}

async function restoreExistingWebsiteBackupAction(formData: FormData) {
  "use server";

  const websiteId = String(formData.get("websiteId") ?? "");
  const backupId = String(formData.get("backupId") ?? "");
  const user = await getCurrentUser(await cookies());
  const errorRedirect = (message: string): never => {
    const params = new URLSearchParams({
      error: message,
      restoreSource: "existing",
    });
    redirect(`/app/websites/${websiteId}/settings?${params.toString()}#advanced`);
  };

  if (!user) {
    redirect(loginRedirectFor(`/app/websites/${websiteId}/settings`));
  }

  const website = await getWebsiteById(websiteId);
  if (!website || !canAccessWebsiteBuilder(user, website)) {
    errorRedirect("Access denied.");
  }
  const targetWebsite = website!;

  if (!backupId) {
    errorRedirect("Choose a backup to restore.");
  }

  if (formData.get("confirmRestore") !== "on") {
    errorRedirect("Confirm restore before restoring a backup.");
  }

  try {
    await restoreStoredWebsiteBackup({ website: targetWebsite, backupId });
  } catch (error) {
    errorRedirect(
      error instanceof Error ? error.message : "Backup could not be restored.",
    );
  }

  redirect(
    `/app/websites/${getWebsiteRouteSegment(targetWebsite)}/settings?backupRestored=1&restoreSource=existing#advanced`,
  );
}

async function restoreWebsiteBackupAction(formData: FormData) {
  "use server";

  const websiteId = String(formData.get("websiteId") ?? "");
  const user = await getCurrentUser(await cookies());
  const errorRedirect = (message: string): never => {
    const params = new URLSearchParams({
      error: message,
      restoreSource: "upload",
    });
    redirect(`/app/websites/${websiteId}/settings?${params.toString()}#advanced`);
  };

  if (!user) {
    redirect(loginRedirectFor(`/app/websites/${websiteId}/settings`));
  }

  const website = await getWebsiteById(websiteId);
  if (!website || !canAccessWebsiteBuilder(user, website)) {
    errorRedirect("Access denied.");
  }
  const targetWebsite = website!;

  if (formData.get("confirmRestore") !== "on") {
    errorRedirect("Confirm restore before uploading a backup.");
  }

  const fileEntry = formData.get("backupFile");
  if (!(fileEntry instanceof File) || fileEntry.size === 0) {
    errorRedirect("Choose a WebPages backup JSON file.");
  }
  const backupFile = fileEntry as File;

  if (!backupFile.name.toLowerCase().endsWith(".json")) {
    errorRedirect("Backup file must be a .json file.");
  }

  try {
    await restoreWebsiteBackup({
      website: targetWebsite,
      backup: JSON.parse(await backupFile.text()),
    });
  } catch (error) {
    errorRedirect(
      error instanceof Error ? error.message : "Backup could not be restored.",
    );
  }

  redirect(
    `/app/websites/${getWebsiteRouteSegment(targetWebsite)}/settings?backupRestored=1&restoreSource=upload#advanced`,
  );
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

  const isRootWebsite = isRootWebsiteIdentifier(websiteId);
  const website = isRootWebsite
    ? rootWebsiteSettingsView()
    : await getWebsiteByIdOrSlug(websiteId);
  if (!website || (isRootWebsite
    ? !isSaaSSuperAdmin(user)
    : !canAccessWebsiteBuilder(user, website))) {
    return <AccessDenied />;
  }
  const backups = isRootWebsite ? [] : await listWebsiteBackups(website.id);
  const settingsSections = isRootWebsite
    ? [{ title: "CMS Connection", id: "cms-connection", available: true }]
    : [
        ...baseSettingsSections.slice(0, 3),
        { title: "CMS Connection", id: "cms-connection", available: true },
        ...baseSettingsSections.slice(3),
      ];
  const websiteRouteSegment = getWebsiteRouteSegment(website);
  const restoreSource = query?.restoreSource === "upload" ? "upload" : "existing";
  const cmsConnection = getCmsConnection(isRootWebsite ? undefined : website);
  const cmsActionLinks = getCmsActionLinks(cmsConnection).filter(
    (item) => item.href,
  );

  return (
    <SaaSShell
      user={user}
      title={<T k="websites.websiteSettings" />}
      eyebrow={website.name}
      actionHref={isSaaSAdmin(user) ? "/admin/websites" : "/app/websites"}
      actionLabel={isSaaSAdmin(user) ? <T k="navigation.allWebsites" /> : <T k="websites.title" />}
    >
      <div className="saas-phase-one-page saas-website-settings-page">
        <section className="saas-phase-one-intro is-compact">
          <div>
            <span className="saas-phase-one-kicker"><Settings2 size={14} /> <T k="websites.configuration" /></span>
            <h2>{website.name}</h2>
            <p><Globe2 size={14} /> {website.primaryDomain || `/${website.slug}`} · {website.type === "e-commerce" ? "E-Commerce" : "Business"} website</p>
          </div>
          <span className={`saas-phase-one-status is-${website.status}`}>{website.status}</span>
        </section>

        <div className="saas-settings-layout">
        <aside className="saas-settings-sidebar" aria-label="Website settings">
          {settingsSections.map((section) => (
            <a
              key={section.title}
              className={section.title === "General" ? "is-active" : ""}
              href={`#${section.id || section.title.toLowerCase().replace(/\s+/g, "-")}`}
            >
              {section.title}
              {!section.available && <span><T k="common.soon" /></span>}
            </a>
          ))}
        </aside>

        <div className="saas-settings-content">
          {!isRootWebsite && (
          <div>
          <section className="saas-panel" id="general">
            <div className="saas-panel-heading">
              <div>
                <h2><T k="settings.general" /></h2>
                <p><T k="settings.generalDescription" /></p>
              </div>
            </div>

            <form className="saas-settings-form" action={saveWebsiteSettingsAction}>
              <input type="hidden" name="websiteId" value={website.id} />

              <label className="saas-auth-field">
                <span><T k="settings.websiteName" /></span>
                <input
                  name="name"
                  required
                  maxLength={100}
                  defaultValue={website.name}
                />
              </label>

              <label className="saas-auth-field">
                <span><T k="websites.slug" /></span>
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
                <span><T k="websites.descriptionLabel" /></span>
                <textarea
                  name="description"
                  maxLength={240}
                  rows={4}
                  defaultValue={website.description}
                  placeholder="Short internal description for this website."
                />
              </label>

              <label className="saas-auth-field">
                <span><T k="websites.timeZone" /></span>
                <select name="timeZone" defaultValue={website.timeZone}>
                  <option value="Asia/Yerevan">Asia/Yerevan</option>
                  <option value="UTC">UTC</option>
                  <option value="Europe/Paris">Europe/Paris</option>
                  <option value="America/New_York">America/New_York</option>
                </select>
              </label>

              <label className="saas-auth-field">
                <span><T k="websites.primaryLanguage" /></span>
                <select name="primaryLanguage" defaultValue={website.primaryLanguage}>
                  <option value="hy">Armenian</option>
                  <option value="en">English</option>
                  <option value="ru">Russian</option>
                </select>
              </label>

              <fieldset className="saas-auth-field">
                <span><T k="websites.enabledLanguages" /></span>
                {(["hy", "en", "ru"] as const).map((language) => (
                  <label key={language}>
                    <input
                      type="checkbox"
                      name="enabledLanguages"
                      value={language}
                      defaultChecked={website.enabledLanguages.includes(language)}
                    />
                    {language === "hy" ? "Հայերեն" : language === "en" ? "English" : "Русский"}
                  </label>
                ))}
              </fieldset>

              <label className="saas-auth-field">
                <span><T k="websites.status" /></span>
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

              {user.role === "super_admin" ? (
                <label className="saas-auth-field">
                  <span><T k="websites.type" /></span>
                  <select name="type" defaultValue={website.type}>
                    <option value="business">Business</option>
                    <option value="e-commerce">E-Commerce</option>
                  </select>
                </label>
              ) : (
                <div className="saas-readonly-field">
                  <span><T k="websites.type" /></span>
                  <strong>
                    {website.type === "e-commerce" ? "E-Commerce" : "Business"}
                  </strong>
                </div>
              )}

              {query?.error && <p className="saas-auth-error">{query.error}</p>}
              {query?.saved && (
                <p className="saas-auth-success"><T k="websites.saved" /></p>
              )}

              <button className="saas-auth-submit" type="submit">
                <T k="websites.saveChanges" />
              </button>
            </form>
          </section>

          <section className="saas-panel" id="domains">
            <div className="saas-panel-heading">
              <div>
                <h2><T k="settings.domain" /></h2>
                <p><T k="settings.domainsDescription" /></p>
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
                        <span><T k="domain.label" /></span>
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
                        <strong><T k="domain.primary" /></strong>
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
              <p><T k="settings.noDomains" /></p>
            )}

            <form className="saas-settings-form" action={addWebsiteDomainAction}>
              <input type="hidden" name="websiteId" value={website.id} />
              <label className="saas-auth-field saas-field-wide">
                <span><T k="domain.label" /></span>
                <input
                  name="domain"
                  required
                  placeholder="clientdomain.am"
                  autoComplete="off"
                />
              </label>
              {query?.domainSaved && (
                <p className="saas-auth-success"><T k="settings.domainAdded" /></p>
              )}
              {query?.domainUpdated && (
                <p className="saas-auth-success"><T k="settings.domainUpdated" /></p>
              )}
              <button className="saas-auth-submit" type="submit">
                Add Domain
              </button>
            </form>
          </section>
          </div>
          )}

            <details
              className="saas-settings-disclosure"
              id="cms-connection"
              open={Boolean(query?.cmsSaved || query?.ecommerceSaved)}
            >
              <summary>
                <div>
                  <h2><T k="settings.cmsConnection" /></h2>
                  <p>
                    Store backend links and WordPress/WooCommerce connection details.
                  </p>
                </div>
                <span><T k="settings.openSettings" /></span>
              </summary>

              <div className="saas-settings-disclosure-body">

              {cmsActionLinks.length > 0 ? (
                <div className="saas-ecommerce-actions">
                  {cmsActionLinks.map((item) => (
                    <a
                      className="saas-auth-secondary-button"
                      href={item.href}
                      key={item.label}
                      rel="noreferrer"
                      target="_blank"
                    >
                      {item.label}
                    </a>
                  ))}
                </div>
              ) : (
                <p>Save the CMS and WooCommerce URLs to enable quick links.</p>
              )}

              <form
                className="saas-settings-form"
                action={saveWebsiteCmsConnectionAction}
              >
                <input type="hidden" name="websiteId" value={website.id} />
                <input type="hidden" name="provider" value={cmsConnection.provider || "wordpress"} />

                <label className="saas-auth-field">
                  <span>WordPress CMS Site URL</span>
                  <input
                    name="siteUrl"
                    required
                    defaultValue={cmsConnection.siteUrl}
                    placeholder="https://client-store.com"
                  />
                </label>

                <label className="saas-auth-field">
                  <span>WordPress GraphQL URL</span>
                  <input
                    name="graphqlUrl"
                    defaultValue={cmsConnection.graphqlUrl}
                    placeholder="https://client-store.com/graphql"
                  />
                </label>

                <label className="saas-auth-field">
                  <span>WordPress Admin URL</span>
                  <input
                    name="adminUrl"
                    defaultValue={cmsConnection.adminUrl}
                    placeholder="https://client-store.com/wp-admin"
                  />
                </label>

                <label className="saas-auth-field">
                  <span>WooCommerce REST API Base URL</span>
                  <input
                    name="wooCommerceApiUrl"
                    defaultValue={cmsConnection.wooCommerceApiUrl}
                    placeholder="https://client-store.com/wp-json/wc/v3"
                  />
                </label>

                <label className="saas-auth-field">
                  <span>WordPress Username / Email</span>
                  <input
                    name="wordpressUsername"
                    required
                    defaultValue={cmsConnection.wordpressUsername}
                    autoComplete="off"
                  />
                </label>

                <label className="saas-auth-field">
                  <span>WordPress Application Password</span>
                  <input
                    name="wordpressApplicationPassword"
                    type="password"
                    autoComplete="new-password"
                    placeholder={
                      cmsConnection.wordpressApplicationPassword
                        ? "Saved password hidden; enter a new one to replace"
                        : "Optional application password"
                    }
                  />
                </label>

                <label className="saas-toggle-field">
                  <input name="clearWordpressApplicationPassword" type="checkbox" />
                  <span>Clear saved application password</span>
                </label>

                <label className="saas-auth-field">
                  <span>WooCommerce Consumer Key</span>
                  <input
                    name="wooCommerceConsumerKey"
                    defaultValue={cmsConnection.wooCommerceConsumerKey}
                    autoComplete="off"
                  />
                </label>

                <label className="saas-auth-field">
                  <span>WooCommerce Consumer Secret</span>
                  <input
                    name="wooCommerceConsumerSecret"
                    type="password"
                    autoComplete="new-password"
                    placeholder={
                      cmsConnection.wooCommerceConsumerSecret
                        ? "Saved secret hidden; enter a new one to replace"
                        : "Optional consumer secret"
                    }
                  />
                </label>

                <label className="saas-toggle-field">
                  <input name="clearWooCommerceConsumerSecret" type="checkbox" />
                  <span>Clear saved consumer secret</span>
                </label>

                <label className="saas-auth-field saas-field-wide">
                  <span>Store Status Notes</span>
                  <textarea
                    name="storeStatusNotes"
                    rows={4}
                    defaultValue={cmsConnection.storeStatusNotes}
                  />
                </label>

                <label className="saas-auth-field saas-field-wide">
                  <span>Additional Technical Notes</span>
                  <textarea
                    name="technicalNotes"
                    rows={4}
                    defaultValue={cmsConnection.technicalNotes}
                  />
                </label>

                {(query?.cmsSaved || query?.ecommerceSaved) && (
                  <p className="saas-auth-success"><T k="settings.cmsConnectionSaved" /></p>
                )}
                {query?.error && (
                  <p className="saas-auth-error">{query.error}</p>
                )}

                <button className="saas-auth-submit" type="submit">
                  Save CMS Connection
                </button>
              </form>
              </div>
            </details>

          {!isRootWebsite && <details
            className="saas-settings-disclosure"
            id="advanced"
            open={Boolean(query?.backupCreated || query?.backupRestored || query?.restoreSource)}
          >
            <summary>
              <div>
                <h2><T k="settings.backups" /></h2>
                <p><T k="settings.manageBackups" /></p>
              </div>
              <span><T k="settings.openBackups" /></span>
            </summary>

            <div className="saas-settings-disclosure-body">

            <div className="saas-backup-restore-grid">
              <div className="saas-backup-panel">
                <div className="saas-backup-panel-heading">
                  <div>
                    <h3><T k="settings.backups" /></h3>
                    <p><T k="settings.backupsDescription" /></p>
                  </div>
                  <form action={createWebsiteBackupAction}>
                    <input type="hidden" name="websiteId" value={website.id} />
                    <button className="saas-auth-submit" type="submit">
                      Create New Backup
                    </button>
                  </form>
                </div>

                {query?.backupCreated && (
                  <p className="saas-auth-success"><T k="settings.backupCreated" /></p>
                )}

                {backups.length > 0 ? (
                  <div className="saas-backup-table">
                    <div className="saas-backup-row is-heading">
                      <span><T k="settings.dateCreated" /></span>
                      <span><T k="settings.version" /></span>
                      <span><T k="settings.size" /></span>
                      <span><T k="common.actions" /></span>
                    </div>
                    {backups.map((backup, index) => (
                      <div className="saas-backup-row" key={backup.id}>
                        <span>
                          <strong>{formatBackupDate(backup.createdAt)}</strong>
                          {index === 0 ? <small><T k="settings.latest" /></small> : null}
                        </span>
                        <span>v{backup.exportVersion}</span>
                        <span>{formatBackupSize(backup.sizeBytes)}</span>
                        <span className="saas-backup-actions">
                          <a
                            className="saas-auth-secondary-button"
                            href={`/api/websites/${websiteRouteSegment}/backups/${encodeURIComponent(backup.id)}`}
                          >
                            Download
                          </a>
                          <button
                            className="saas-auth-secondary-button"
                            type="button"
                            disabled
                          >
                            More
                          </button>
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p><T k="settings.noBackups" /></p>
                )}

                <p className="saas-backup-note">
                  A maximum of 5 backups are kept. Creating a new backup will
                  remove the oldest one.
                </p>
              </div>

              <div className="saas-backup-panel">
                <div className="saas-backup-panel-heading">
                  <div>
                    <h3><T k="settings.restore" /></h3>
                    <p><T k="settings.restoreDescription" /></p>
                  </div>
                </div>

                <div className="saas-restore-tabs" role="tablist">
                  <a
                    className={restoreSource === "existing" ? "is-active" : ""}
                    href={`/app/websites/${websiteRouteSegment}/settings?restoreSource=existing#advanced`}
                  >
                    From Existing Backups
                  </a>
                  <a
                    className={restoreSource === "upload" ? "is-active" : ""}
                    href={`/app/websites/${websiteRouteSegment}/settings?restoreSource=upload#advanced`}
                  >
                    Upload from Computer
                  </a>
                </div>

                {restoreSource === "existing" ? (
                  <form
                    className="saas-settings-form"
                    action={restoreExistingWebsiteBackupAction}
                  >
                    <input type="hidden" name="websiteId" value={website.id} />
                    <label className="saas-auth-field saas-field-wide">
                      <span><T k="settings.selectBackup" /></span>
                      <select name="backupId" required defaultValue="">
                        <option value="" disabled>
                          Choose a backup...
                        </option>
                        {backups.map((backup) => (
                          <option key={backup.id} value={backup.id}>
                            {formatBackupDate(backup.createdAt)} - v
                            {backup.exportVersion} - {formatBackupSize(backup.sizeBytes)}
                          </option>
                        ))}
                      </select>
                    </label>
                    <p className="saas-backup-warning">
                      This will replace the current website design/pages. A
                      safety backup will be created before restoring.
                    </p>
                    <label className="saas-auth-field saas-field-wide">
                      <span><T k="settings.confirmRestore" /></span>
                      <input name="confirmRestore" type="checkbox" required />
                    </label>
                    {query?.backupRestored && restoreSource === "existing" && (
                      <p className="saas-auth-success"><T k="settings.backupRestored" /></p>
                    )}
                    {query?.error && restoreSource === "existing" && (
                      <p className="saas-auth-error">{query.error}</p>
                    )}
                    <button className="saas-auth-submit" type="submit">
                      Restore Selected Backup
                    </button>
                  </form>
                ) : (
                  <form
                    className="saas-settings-form"
                    action={restoreWebsiteBackupAction}
                    encType="multipart/form-data"
                  >
                    <input type="hidden" name="websiteId" value={website.id} />
                    <label className="saas-auth-field saas-field-wide">
                      <span><T k="settings.uploadBackup" /></span>
                      <input
                        name="backupFile"
                        type="file"
                        accept=".json,application/json"
                        required
                      />
                    </label>
                    <p className="saas-backup-warning">
                      This will replace the current website design/pages. A
                      safety backup will be created before restoring.
                    </p>
                    <label className="saas-auth-field saas-field-wide">
                      <span><T k="settings.confirmRestore" /></span>
                      <input name="confirmRestore" type="checkbox" required />
                    </label>
                    {query?.backupRestored && restoreSource === "upload" && (
                      <p className="saas-auth-success"><T k="settings.backupRestored" /></p>
                    )}
                    {query?.error && restoreSource === "upload" && (
                      <p className="saas-auth-error">{query.error}</p>
                    )}
                    <button className="saas-auth-submit" type="submit">
                      Restore Uploaded Backup
                    </button>
                  </form>
                )}
              </div>
            </div>

            <p className="saas-backup-safety">
              Your safety is our priority. Before any restore, a safety backup
              of your current data will be created automatically.
            </p>
            </div>
          </details>}

          <section className="saas-settings-future-list" aria-label="Future settings">
            {futureCards.map((card) => (
              <div id={card.title.toLowerCase()} key={card.title}>
                <span>{card.title}</span>
                <p>{card.description}</p>
                <strong><T k="common.soon" /></strong>
              </div>
            ))}
          </section>
        </div>
        </div>
      </div>
    </SaaSShell>
  );
}
