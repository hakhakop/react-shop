import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import AccessDenied from "@/components/saas/AccessDenied";
import SaaSShell from "@/components/saas/SaaSShell";
import { getCurrentUser, isSaaSSuperAdmin } from "@/lib/auth";
import { loginRedirectFor } from "@/lib/saasRoutes";
import {
  createSubscriptionPackage,
  deleteSubscriptionPackage,
  packageFeaturesText,
  readSubscriptionPackages,
  updateSubscriptionPackage,
} from "@/lib/subscriptions";

export const dynamic = "force-dynamic";

type AdminPackagesPageProps = {
  searchParams?: Promise<{ error?: string; saved?: string }>;
};

async function requireSuperAdmin() {
  const user = await getCurrentUser(await cookies());
  if (!user) redirect(loginRedirectFor("/admin/packages"));
  if (!isSaaSSuperAdmin(user)) return null;
  return user;
}

async function createPackageAction(formData: FormData) {
  "use server";

  const user = await requireSuperAdmin();
  if (!user) redirect("/admin/packages?error=access");

  const result = await createSubscriptionPackage(Object.fromEntries(formData));
  if ("error" in result) {
    redirect(`/admin/packages?error=${encodeURIComponent(result.error ?? "Package could not be created.")}`);
  }

  revalidatePath("/admin/packages");
  revalidatePath("/register");
  redirect("/admin/packages?saved=created");
}

async function updatePackageAction(formData: FormData) {
  "use server";

  const user = await requireSuperAdmin();
  if (!user) redirect("/admin/packages?error=access");

  const id = String(formData.get("id") ?? "");
  const result = await updateSubscriptionPackage(id, Object.fromEntries(formData));
  if ("error" in result) {
    redirect(`/admin/packages?error=${encodeURIComponent(result.error ?? "Package could not be updated.")}`);
  }

  revalidatePath("/admin/packages");
  revalidatePath("/register");
  redirect("/admin/packages?saved=updated");
}

async function deletePackageAction(formData: FormData) {
  "use server";

  const user = await requireSuperAdmin();
  if (!user) redirect("/admin/packages?error=access");

  await deleteSubscriptionPackage(String(formData.get("id") ?? ""));
  revalidatePath("/admin/packages");
  revalidatePath("/register");
  redirect("/admin/packages?saved=deleted");
}

export default async function AdminPackagesPage({
  searchParams,
}: AdminPackagesPageProps) {
  const user = await getCurrentUser(await cookies());
  const params = await searchParams;

  if (!user) {
    redirect(loginRedirectFor("/admin/packages"));
  }

  if (!isSaaSSuperAdmin(user)) {
    return <AccessDenied />;
  }

  const packages = await readSubscriptionPackages();

  return (
    <SaaSShell
      user={user}
      title="Subscription Packages"
      eyebrow="Super Admin"
      actionHref="/admin/users"
      actionLabel="Users"
    >
      {params?.error && <p className="saas-auth-error">{params.error}</p>}
      {params?.saved && <p className="saas-auth-success">Package {params.saved}.</p>}

      <section className="saas-panel">
        <div className="saas-panel-heading">
          <div>
            <h2>Create package</h2>
            <p>Active packages appear on public registration.</p>
          </div>
        </div>
        <form action={createPackageAction} className="saas-settings-form">
          <PackageFields />
          <button className="saas-auth-submit" type="submit">
            Create Package
          </button>
        </form>
      </section>

      <section className="saas-panel">
        <div className="saas-panel-heading">
          <div>
            <h2>Packages</h2>
            <p>{packages.length} packages configured.</p>
          </div>
        </div>

        <div className="saas-admin-package-list">
          {packages.map((item) => (
            <article className="saas-admin-package-card" key={item.id}>
              <form action={updatePackageAction} className="saas-settings-form">
                <input name="id" type="hidden" value={item.id} />
                <PackageFields item={item} />
                <button className="saas-auth-submit" type="submit">
                  Save Package
                </button>
              </form>
              <form action={deletePackageAction}>
                <input name="id" type="hidden" value={item.id} />
                <button className="saas-auth-secondary-button" type="submit">
                  Delete Package
                </button>
              </form>
            </article>
          ))}
        </div>
      </section>
    </SaaSShell>
  );
}

function PackageFields({
  item,
}: {
  item?: {
    name: string;
    description: string;
    priceText: string;
    type: string;
    features: string[];
    displayOrder: number;
    isActive: boolean;
  };
}) {
  return (
    <>
      <label className="saas-auth-field">
        <span>Package name</span>
        <input name="name" required defaultValue={item?.name ?? ""} />
      </label>
      <label className="saas-auth-field">
        <span>Package type</span>
        <input
          name="type"
          required
          defaultValue={item?.type ?? "Business Website"}
          list="package-types"
        />
        <datalist id="package-types">
          <option value="Business Website" />
          <option value="Website + Blog" />
          <option value="E-Commerce" />
        </datalist>
      </label>
      <label className="saas-auth-field">
        <span>Price / period text</span>
        <input name="priceText" required defaultValue={item?.priceText ?? ""} />
      </label>
      <label className="saas-auth-field">
        <span>Display order</span>
        <input
          name="displayOrder"
          type="number"
          defaultValue={item?.displayOrder ?? 100}
        />
      </label>
      <label className="saas-auth-field saas-field-wide">
        <span>Short description</span>
        <textarea name="description" required rows={3} defaultValue={item?.description ?? ""} />
      </label>
      <label className="saas-auth-field saas-field-wide">
        <span>Features / benefits</span>
        <textarea
          name="featuresText"
          required
          rows={5}
          defaultValue={item ? packageFeaturesText(item) : ""}
        />
      </label>
      <label className="saas-toggle-field saas-field-wide">
        <input
          name="isActive"
          type="checkbox"
          defaultChecked={item?.isActive ?? true}
        />
        <span>Active on public registration</span>
      </label>
    </>
  );
}
