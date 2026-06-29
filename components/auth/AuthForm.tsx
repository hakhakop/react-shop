"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

type AuthMode = "login" | "register";

type AuthFormProps = {
  mode: AuthMode;
  nextPath?: string;
};

export default function AuthForm({ mode, nextPath = "/app" }: AuthFormProps) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isRegister = mode === "register";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const payload = {
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
      ...(isRegister ? { name: String(formData.get("name") ?? "") } : {}),
    };

    try {
      const response = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(data.error ?? "Authentication failed.");
        return;
      }

      router.push(nextPath);
      router.refresh();
    } catch {
      setError("Could not reach the auth service. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="saas-auth-card" onSubmit={handleSubmit}>
      <div className="saas-auth-heading">
        <span>SaaS dashboard</span>
        <h1>{isRegister ? "Create your account" : "Welcome back"}</h1>
        <p>
          {isRegister
            ? "Register for the React dashboard workspace."
            : "Log in to your React dashboard workspace."}
        </p>
      </div>

      {isRegister && (
        <label className="saas-auth-field">
          <span>Name</span>
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

      {error && <p className="saas-auth-error">{error}</p>}

      <button className="saas-auth-submit" disabled={isSubmitting} type="submit">
        {isSubmitting
          ? "Please wait..."
          : isRegister
            ? "Create account"
            : "Log in"}
      </button>

      <p className="saas-auth-switch">
        {isRegister ? "Already have an account?" : "Don’t have an account?"}{" "}
        <Link href={isRegister ? "/login" : "/register"}>
          {isRegister ? "Login" : "Create one"}
        </Link>
      </p>
    </form>
  );
}
