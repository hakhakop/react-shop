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
        setError(data.error ?? "Authentication failed.");
        return;
      }

      if (isRegister) {
        setSuccess(
          data.message ??
            "Your subscription request has been received. We will prepare and configure your website within 24 hours.",
        );
        router.push(`${nextPath}${nextPath.includes("?") ? "&" : "?"}registered=1`);
      } else {
        router.push(nextPath);
      }
      router.refresh();
    } catch {
      setError("Could not reach the auth service. Please try again.");
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
            {isRegister ? "Your website service" : "Secure workspace"}
          </span>
          <h2>{isRegister ? "A professional website, without the complexity." : "Welcome back to your websites."}</h2>
          <p>{isRegister ? "Choose your package, tell us about your business, and we’ll prepare the rest." : "Continue building, publishing, and managing from one calm dashboard."}</p>
        </div>
        <ul>
          <li><Check size={14} /> Secure account access</li>
          <li><Check size={14} /> Your websites in one place</li>
          <li><Check size={14} /> Support when you need it</li>
        </ul>
        <span className="saas-auth-trust"><ShieldCheck size={15} /> WebPages managed service</span>
      </aside>

      <div className="saas-auth-form-main">
        <div className="saas-auth-heading">
          <span>{isRegister ? "Get started" : "SaaS dashboard"}</span>
          <h1>{isRegister ? "Request your website" : "Sign in"}</h1>
          <p>
            {isRegister
              ? "Select a package and share the details needed for setup."
              : "Enter your account details to continue."}
          </p>
        </div>

      {isRegister && (
        <section className="saas-onboarding-section">
          <div className="saas-onboarding-section-heading">
            <span>Subscription</span>
            <h2>Select a package</h2>
          </div>
          {packages.length === 0 ? (
            <p className="saas-auth-error">
              No active subscription packages are available yet.
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
                  <b>{selectedPackageId === item.id ? <><Check size={13} /> Selected</> : "Select"}</b>
                </label>
              ))}
            </div>
          )}
        </section>
      )}

      <section className={isRegister ? "saas-onboarding-form-grid" : ""}>
        {isRegister && (
          <div className="saas-onboarding-section-heading saas-field-wide">
            <span>Account</span>
            <h2>Your details</h2>
          </div>
        )}

        {isRegister && (
          <label className="saas-auth-field">
            <span>Full name</span>
            <input
              autoComplete="name"
              name="name"
              placeholder="Your name"
              required
              maxLength={80}
            />
          </label>
        )}

        <label className="saas-auth-field">
          <span>Email</span>
          <input
            autoComplete="email"
            name="email"
            placeholder="you@example.com"
            required
            type="email"
          />
        </label>

        <label className="saas-auth-field">
          <span>Password</span>
          <input
            autoComplete={isRegister ? "new-password" : "current-password"}
            name="password"
            minLength={8}
            placeholder="At least 8 characters"
            required
            type="password"
          />
        </label>

        {isRegister && (
          <>
            <div className="saas-onboarding-section-heading saas-field-wide">
              <span>Business Information</span>
              <h2>Company profile</h2>
            </div>
            <label className="saas-auth-field">
              <span>Company / Business name</span>
              <input name="companyName" required maxLength={120} />
            </label>
            <label className="saas-auth-field">
              <span>Logo upload</span>
              <input accept="image/*" name="logo" type="file" />
            </label>
            <label className="saas-auth-field">
              <span>Business category / industry</span>
              <input name="businessCategory" required maxLength={100} />
            </label>
            <label className="saas-auth-field">
              <span>Phone</span>
              <input autoComplete="tel" name="phone" required maxLength={60} />
            </label>
            <label className="saas-auth-field">
              <span>Public business email</span>
              <input name="publicEmail" required type="email" />
            </label>
            <label className="saas-auth-field">
              <span>Address</span>
              <input name="address" maxLength={180} />
            </label>
            <label className="saas-auth-field">
              <span>Facebook link</span>
              <input name="facebookUrl" maxLength={240} />
            </label>
            <label className="saas-auth-field">
              <span>Instagram link</span>
              <input name="instagramUrl" maxLength={240} />
            </label>
            <div className="saas-onboarding-section-heading saas-field-wide">
              <span>Website Request</span>
              <h2>Setup information</h2>
            </div>
            <label className="saas-auth-field">
              <span>Website name</span>
              <input name="websiteName" required maxLength={100} />
            </label>
            <label className="saas-auth-field">
              <span>Preferred domain</span>
              <input name="preferredDomain" maxLength={120} />
            </label>
            <label className="saas-auth-field saas-field-wide">
              <span>Short business description</span>
              <textarea name="businessDescription" required rows={4} />
            </label>
            <label className="saas-auth-field saas-field-wide">
              <span>Preferred colors / style notes</span>
              <textarea name="styleNotes" rows={3} />
            </label>
            <label className="saas-auth-field saas-field-wide">
              <span>Additional notes</span>
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
          ? "Please wait..."
          : isRegister
            ? "Submit subscription request"
            : "Log in"}
        {!isSubmitting && <ArrowRight size={16} />}
      </button>

      <p className="saas-auth-switch">
        {isRegister ? "Already have an account?" : "Don’t have an account?"}{" "}
        <Link href={isRegister ? "/login" : "/register"}>
          {isRegister ? "Login" : "Create one"}
        </Link>
      </p>
      </div>
    </form>
  );
}
