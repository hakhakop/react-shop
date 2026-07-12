import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import SaaSShell from "@/components/saas/SaaSShell";
import { getCurrentUser } from "@/lib/auth";
import {
  createWebsite,
  normalizeWebsiteType,
  validateWebsiteInput,
} from "@/lib/websites";
import { loginRedirectFor } from "@/lib/saasRoutes";
import { T } from "@/components/i18n/LanguageProvider";

export const dynamic = "force-dynamic";

type NewWebsitePageProps = {
  searchParams?: Promise<{
    error?: string;
    name?: string;
    slug?: string;
  }>;
};

async function createWebsiteAction(formData: FormData) {
  "use server";

  const user = await getCurrentUser(await cookies());
  if (!user) {
    redirect(loginRedirectFor("/app/websites/new"));
  }

  const parsed = validateWebsiteInput({
    name: formData.get("name"),
    slug: formData.get("slug"),
  });

  if ("error" in parsed) {
    const params = new URLSearchParams({
      error: String(parsed.error),
      name: String(formData.get("name") ?? ""),
      slug: String(formData.get("slug") ?? ""),
    });
    redirect(`/app/websites/new?${params.toString()}`);
  }

  const result = await createWebsite({
    ownerId: user.id,
    type: normalizeWebsiteType(
      user.subscription?.packageType === "E-Commerce" ? "e-commerce" : "business",
    ),
    ...parsed,
  });

  if ("error" in result) {
    const params = new URLSearchParams({
      error: String(result.error),
      name: parsed.name,
      slug: parsed.slug,
    });
    redirect(`/app/websites/new?${params.toString()}`);
  }

  redirect("/app/websites");
}

export default async function NewWebsitePage({
  searchParams,
}: NewWebsitePageProps) {
  const user = await getCurrentUser(await cookies());

  if (!user) {
    redirect(loginRedirectFor("/app/websites/new"));
  }

  const params = (await searchParams) ?? {};

  return (
    <SaaSShell user={user} title={<T k="websites.create" />}>
      <form className="saas-auth-card saas-website-form" action={createWebsiteAction}>
        <div className="saas-auth-heading">
          <span><T k="websites.new" /></span>
          <h1><T k="websites.create" /></h1>
          <p><T k="websites.newDescription" /></p>
        </div>

        <label className="saas-auth-field">
          <span><T k="common.name" /></span>
          <input
            name="name"
            placeholder="My Website"
            required
            maxLength={100}
            defaultValue={params.name ?? ""}
          />
        </label>

        <label className="saas-auth-field">
          <span><T k="websites.slug" /></span>
          <input
            name="slug"
            placeholder="my-website"
            required
            minLength={3}
            maxLength={60}
            pattern="[a-z0-9]+(-[a-z0-9]+)*"
            defaultValue={params.slug ?? ""}
          />
        </label>

        {params.error && <p className="saas-auth-error">{params.error}</p>}

        <button className="saas-auth-submit" type="submit">
          <T k="websites.create" />
        </button>
      </form>
    </SaaSShell>
  );
}
