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
import type { SubscriptionPackage } from "@/lib/subscriptions";

type AuthMode = "login" | "register";

type AuthFormProps = {
  mode: AuthMode;
  nextPath?: string;
  packages?: SubscriptionPackage[];
};

export default function AuthForm({
  mode,
  nextPath = "/app",
  packages = [],
}: AuthFormProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPackageId, setSelectedPackageId] = useState(
    packages[0]?.id ?? "",
  );
  const isRegister = mode === "register";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    if (isRegister) {
      formData.set("packageId", selectedPackageId);
    }

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
          <h2>{isRegister ? t("auth.registerHeading") : t("auth.welcomeBack")}</h2>
          <p>{isRegister ? t("auth.registerDescription") : t("auth.loginDescription")}</p>
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
          <h1>{isRegister ? t("auth.register") : t("auth.login")}</h1>
          <p>
            {isRegister
              ? t("auth.setupDetails")
              : t("auth.accountDetails")}
          </p>
        </div>

      {isRegister && (
        <section className="saas-onboarding-section">
          <div className="saas-onboarding-section-heading">
            <span>{t("auth.subscription")}</span>
            <h2>{t("auth.selectPackage")}</h2>
          </div>
          {packages.length === 0 ? (
            <p className="saas-auth-error">
              {t("auth.noPackages")}
            </p>
          ) : (
            <div className="saas-package-grid">
              {packages.map((item) => (
                <label
                  className="saas-package-card"
                  data-selected={selectedPackageId === item.id}
                  key={item.id}
                >
                  <input
                    checked={selectedPackageId === item.id}
                    name="packageId"
                    onChange={() => setSelectedPackageId(item.id)}
                    required
                    type="radio"
                    value={item.id}
                  />
                  <span>{item.type}</span>
                  <strong>{item.name}</strong>
                  <small>{item.priceText}</small>
                  <p>{item.description}</p>
                  <ul>
                    {item.features.map((feature) => (
                      <li key={feature}>{feature}</li>
                    ))}
                  </ul>
                  <b>{selectedPackageId === item.id ? <><Check size={13} /> {t("common.selected")}</> : t("common.select")}</b>
                </label>
              ))}
            </div>
          )}
        </section>
      )}

      <section className={isRegister ? "saas-onboarding-form-grid" : ""}>
        {isRegister && (
          <div className="saas-onboarding-section-heading saas-field-wide">
            <span>{t("auth.account")}</span>
            <h2>{t("auth.yourDetails")}</h2>
          </div>
        )}

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

        {isRegister && (
          <>
            <div className="saas-onboarding-section-heading saas-field-wide">
              <span>{t("settings.businessInformation")}</span>
              <h2>{t("auth.companyProfile")}</h2>
            </div>
            <label className="saas-auth-field">
              <span>{t("settings.companyName")}</span>
              <input name="companyName" required maxLength={120} />
            </label>
            <label className="saas-auth-field">
              <span>{t("auth.logoUpload")}</span>
              <input accept="image/*" name="logo" type="file" />
            </label>
            <label className="saas-auth-field">
              <span>{t("auth.businessCategory")}</span>
              <input name="businessCategory" required maxLength={100} />
            </label>
            <label className="saas-auth-field">
              <span>{t("common.phone")}</span>
              <input autoComplete="tel" name="phone" required maxLength={60} />
            </label>
            <label className="saas-auth-field">
              <span>{t("settings.publicEmail")}</span>
              <input name="publicEmail" required type="email" />
            </label>
            <label className="saas-auth-field">
              <span>{t("common.address")}</span>
              <input name="address" maxLength={180} />
            </label>
            <label className="saas-auth-field">
              <span>{t("settings.facebook")}</span>
              <input name="facebookUrl" maxLength={240} />
            </label>
            <label className="saas-auth-field">
              <span>{t("settings.instagram")}</span>
              <input name="instagramUrl" maxLength={240} />
            </label>
            <div className="saas-onboarding-section-heading saas-field-wide">
              <span>{t("auth.websiteRequest")}</span>
              <h2>{t("auth.setupInformation")}</h2>
            </div>
            <label className="saas-auth-field">
              <span>{t("settings.websiteName")}</span>
              <input name="websiteName" required maxLength={100} />
            </label>
            <label className="saas-auth-field">
              <span>{t("settings.preferredDomain")}</span>
              <input name="preferredDomain" maxLength={120} />
            </label>
            <label className="saas-auth-field saas-field-wide">
              <span>{t("settings.shortDescription")}</span>
              <textarea name="businessDescription" required rows={4} />
            </label>
            <label className="saas-auth-field saas-field-wide">
              <span>{t("settings.styleNotes")}</span>
              <textarea name="styleNotes" rows={3} />
            </label>
            <label className="saas-auth-field saas-field-wide">
              <span>{t("settings.additionalNotes")}</span>
              <textarea name="additionalNotes" rows={3} />
            </label>
          </>
        )}
      </section>

      {error && <p className="saas-auth-error">{error}</p>}
      {success && <p className="saas-auth-success">{success}</p>}

      <button
        className="saas-auth-submit"
        disabled={isSubmitting || (isRegister && packages.length === 0)}
        type="submit"
      >
        {isSubmitting
          ? t("auth.submitting")
          : isRegister
            ? t("auth.submitRegister")
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
