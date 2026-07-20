"use client";

import Link from "next/link";
import {
  ArrowRight,
  Check,
  Globe2,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import ThemeToggle from "@/components/ThemeToggle";
import LanguageSwitcher from "@/components/i18n/LanguageSwitcher";
import { useTranslation } from "@/components/i18n/LanguageProvider";

type AuthMode = "login" | "register";

type AuthFormProps = {
  mode: AuthMode;
  nextPath?: string;
};

export default function AuthForm({
  mode,
  nextPath = "/app",
}: AuthFormProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isRegister = mode === "register";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    try {
      const response = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        ...(isRegister
          ? { body: formData }
          : {
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email: String(formData.get("email") ?? ""),
                password: String(formData.get("password") ?? ""),
              }),
            }),
      });
      const data = (await response.json()) as {
        error?: string;
        message?: string;
      };

      if (!response.ok) {
        setError(data.error ?? t("auth.failed"));
        return;
      }

      if (isRegister) {
        setSuccess(
          data.message ??
            t("dashboard.registrationSuccess"),
        );
        router.push(`${nextPath}${nextPath.includes("?") ? "&" : "?"}registered=1`);
      } else {
        router.push(nextPath);
      }
      router.refresh();
    } catch {
      setError(t("auth.unreachable"));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      className={`saas-auth-card${isRegister ? " saas-auth-card--onboarding" : ""}`}
      onSubmit={handleSubmit}
    >
      <div className="saas-auth-theme-toggle">
        <LanguageSwitcher />
        <ThemeToggle variant="ghost" size="md" />
      </div>
      <aside className="saas-auth-showcase">
        <Link className="saas-auth-brand-link" href="/">
          <span><Sparkles size={16} /></span>
          <strong>WebPages</strong>
        </Link>
        <div>
          <span className="saas-auth-showcase-kicker">
            {isRegister ? <Globe2 size={14} /> : <LockKeyhole size={14} />}
            {isRegister ? t("auth.websiteService") : t("auth.secureWorkspace")}
          </span>
          <h2>{isRegister ? t("auth.registerShowcaseTitle") : t("auth.welcomeBack")}</h2>
          <p>{isRegister ? t("auth.registerShowcaseDescription") : t("auth.loginDescription")}</p>
        </div>
        <ul>
          <li><Check size={14} /> {t("auth.secureAccess")}</li>
          <li><Check size={14} /> {t("auth.websitesOnePlace")}</li>
          <li><Check size={14} /> {t("auth.support")}</li>
        </ul>
        <span className="saas-auth-trust"><ShieldCheck size={15} /> {t("auth.managedService")}</span>
      </aside>

      <div className="saas-auth-form-main">
        <div className="saas-auth-heading">
          <span>{isRegister ? t("auth.getStarted") : t("dashboard.title")}</span>
          <h1>{isRegister ? t("auth.createAccount") : t("auth.login")}</h1>
          <p>
            {isRegister
              ? t("auth.registerQuickDetails")
              : t("auth.accountDetails")}
          </p>
        </div>

      <section className={isRegister ? "saas-onboarding-form-grid" : ""}>

        {isRegister && (
          <label className="saas-auth-field">
            <span>{t("auth.fullName")}</span>
            <input
              autoComplete="name"
              name="name"
              placeholder={t("auth.yourName")}
              required
              maxLength={80}
            />
          </label>
        )}

        <label className="saas-auth-field">
          <span>{t("common.email")}</span>
          <input
            autoComplete="email"
            name="email"
            placeholder="you@example.com"
            required
            type="email"
          />
        </label>

        <label className="saas-auth-field">
          <span>{t("auth.password")}</span>
          <input
            autoComplete={isRegister ? "new-password" : "current-password"}
            name="password"
            minLength={8}
            placeholder={t("auth.passwordHint")}
            required
            type="password"
          />
        </label>

      </section>

      {error && <p className="saas-auth-error">{error}</p>}
      {success && <p className="saas-auth-success">{success}</p>}

      <button
        className="saas-auth-submit"
        disabled={isSubmitting}
        type="submit"
      >
        {isSubmitting
          ? t("auth.submitting")
          : isRegister
            ? t("auth.startFree")
            : t("auth.submitLogin")}
        {!isSubmitting && <ArrowRight size={16} />}
      </button>

      <p className="saas-auth-switch">
        {isRegister ? t("auth.haveAccount") : t("auth.needAccount")}{" "}
        <Link href={isRegister ? "/login" : "/register"}>
          {isRegister ? t("auth.goToLogin") : t("auth.goToRegister")}
        </Link>
      </p>
      </div>
    </form>
  );
}
