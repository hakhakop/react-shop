import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AuthForm from "@/components/auth/AuthForm";
import { getCurrentUser } from "@/lib/auth";
import { getSafeNextPath } from "@/lib/saasRoutes";
import SaaSI18nProvider from "@/components/i18n/SaaSI18nProvider";

export const dynamic = "force-dynamic";

type RegisterPageProps = {
  searchParams?: Promise<{ next?: string }>;
};

export default async function RegisterPage({
  searchParams,
}: RegisterPageProps) {
  const user = await getCurrentUser(await cookies());
  const nextPath = getSafeNextPath((await searchParams)?.next);

  if (user) {
    redirect(nextPath);
  }

  return (
    <SaaSI18nProvider><main className="saas-auth-page">
      <AuthForm mode="register" nextPath={nextPath} />
    </main></SaaSI18nProvider>
  );
}
