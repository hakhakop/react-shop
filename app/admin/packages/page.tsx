import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { CreditCard, Plus, Settings2 } from "lucide-react";
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
      <div className="saas-phase-one-page saas-admin-packages-page">
        {params?.error && <p className="saas-auth-error">{params.error}</p>}
        {params?.saved && <p className="saas-auth-success">Package {params.saved}.</p>}

        <section className="saas-phase-one-intro is-compact">
          <div>
            <span className="saas-phase-one-kicker"><CreditCard size={14} /> Subscription catalog</span>
            <h2>Packages that stay out of the way.</h2>
            <p>Review the catalog at a glance. Open a package only when you need to edit it.</p>
          </div>
        </section>

        <div className="saas-admin-management-grid">
          <section className="saas-admin-management-main">
            <div className="saas-phase-one-section-heading">
              <div>
                <span>Available packages</span>
                <h2>Subscription packages</h2>
                <p>{packages.length} package{packages.length === 1 ? "" : "s"} configured.</p>
              </div>
            </div>

            {packages.length === 0 ? (
              <div className="saas-admin-compact-empty">No packages configured yet.</div>
            ) : (
              <div className="saas-admin-package-accordion">
                {packages.map((item) => (
                  <details className="saas-admin-package-item" key={item.id}>
                    <summary>
                      <span className="saas-admin-package-icon"><CreditCard size={18} /></span>
                      <div>
                        <strong>{item.name}</strong>
                        <small>{item.type} · {item.priceText}</small>
                      </div>
                      <span className={`saas-phase-one-status ${item.isActive ? "is-active" : "is-suspended"}`}>
                        {item.isActive ? "Active" : "Inactive"}
                      </span>
                      <span className="saas-admin-edit-hint"><Settings2 size={14} /> Edit</span>
                    </summary>
                    <div className="saas-admin-package-editor">
                      <form action={updatePackageAction} className="saas-settings-form">
                        <input name="id" type="hidden" value={item.id} />
                        <PackageFields item={item} />
                        <button className="saas-auth-submit" type="submit">Save Package</button>
                      </form>
                      <form action={deletePackageAction}>
                        <input name="id" type="hidden" value={item.id} />
                        <button className="saas-auth-secondary-button is-danger" type="submit">Delete Package</button>
                      </form>
                    </div>
                  </details>
                ))}
              </div>
            )}
          </section>

          <aside className="saas-admin-management-side">
            <details className="saas-admin-create-panel">
              <summary><Plus size={16} /> Create package</summary>
              <form action={createPackageAction} className="saas-settings-form">
                <PackageFields />
                <button className="saas-auth-submit" type="submit">Create Package</button>
              </form>
            </details>
            <p>Active packages appear on public registration.</p>
          </aside>
        </div>
      </div>
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
