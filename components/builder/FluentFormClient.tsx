"use client";

import { useEffect, useRef, useState } from "react";

type FluentFormClientProps = {
  formId?: string | number | null;
  title?: string | null;
};

type FluentFormPayload = {
  html?: string;
  scripts?: string[];
  styles?: string[];
  message?: string;
};

type FluentFormSubmitPayload = {
  message?: string;
  errors?: Record<string, unknown>;
};

function assignNestedValue(
  target: Record<string, unknown>,
  fieldName: string,
  value: FormDataEntryValue
) {
  const path = fieldName
    .replace(/\]/g, "")
    .split("[")
    .map((part) => part.trim())
    .filter(Boolean);

  if (!path.length || value instanceof File) return;

  let cursor = target;
  path.forEach((part, index) => {
    if (index === path.length - 1) {
      const existingValue = cursor[part];
      if (Array.isArray(existingValue)) {
        existingValue.push(value);
      } else if (existingValue != null) {
        cursor[part] = [existingValue, value];
      } else {
        cursor[part] = value;
      }
      return;
    }

    if (
      !cursor[part] ||
      typeof cursor[part] !== "object" ||
      Array.isArray(cursor[part])
    ) {
      cursor[part] = {};
    }

    cursor = cursor[part] as Record<string, unknown>;
  });
}

function formDataToObject(formData: FormData) {
  const data: Record<string, unknown> = {};

  formData.forEach((value, key) => {
    assignNestedValue(data, key, value);
  });

  return data;
}

function getSubmitMessage(payload: FluentFormSubmitPayload) {
  if (typeof payload.message === "string" && payload.message.trim()) {
    return payload.message;
  }

  if (payload.errors && typeof payload.errors === "object") {
    return "Please check the highlighted fields and try again.";
  }

  return "Thanks, your form was submitted.";
}

function appendAssetOnce(tagName: "script" | "link", key: string, src: string) {
  if (!src || document.querySelector(`[data-fluent-form-asset="${key}"]`)) return;

  if (tagName === "link") {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = src;
    link.dataset.fluentFormAsset = key;
    document.head.appendChild(link);
    return;
  }

  const script = document.createElement("script");
  script.src = src;
  script.async = false;
  script.dataset.fluentFormAsset = key;
  document.body.appendChild(script);
}

export default function FluentFormClient({
  formId,
  title,
}: FluentFormClientProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">(
    "idle"
  );
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [submitMessage, setSubmitMessage] = useState("");
  const [message, setMessage] = useState("");
  const safeFormId = formId != null ? String(formId).trim() : "";

  useEffect(() => {
    const host = hostRef.current;
    if (!host || !safeFormId) return;

    let cancelled = false;
    setStatus("loading");
    setSubmitStatus("idle");
    setSubmitMessage("");
    setMessage("");
    host.innerHTML = "";

    fetch(`/api/fluent-forms/render?formId=${encodeURIComponent(safeFormId)}`, {
      cache: "no-store",
    })
      .then(async (response) => {
        const payload = (await response.json()) as FluentFormPayload;
        if (!response.ok) {
          throw new Error(payload.message || "Fluent Form could not be rendered.");
        }
        return payload;
      })
      .then((payload) => {
        if (cancelled) return;

        (payload.styles ?? []).forEach((href) =>
          appendAssetOnce("link", `style:${href}`, href)
        );
        host.innerHTML = payload.html ?? "";

        const inlineScripts = Array.from(host.querySelectorAll("script"));
        inlineScripts.forEach((script, index) => {
          const nextScript = document.createElement("script");
          Array.from(script.attributes).forEach((attribute) => {
            nextScript.setAttribute(attribute.name, attribute.value);
          });
          nextScript.text = script.text;
          nextScript.dataset.fluentFormAsset = `inline:${safeFormId}:${index}`;
          script.replaceWith(nextScript);
        });

        (payload.scripts ?? []).forEach((src) =>
          appendAssetOnce("script", `script:${src}`, src)
        );
        setStatus("ready");
      })
      .catch((error: Error) => {
        if (cancelled) return;
        setStatus("error");
        setMessage(error.message);
      });

    return () => {
      cancelled = true;
    };
  }, [safeFormId]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host || status !== "ready" || !safeFormId) return;

    const form = host.querySelector<HTMLFormElement>("form.frm-fluent-form");
    if (!form) return;

    const handleSubmit = async (event: SubmitEvent) => {
      event.preventDefault();

      const submitter = event.submitter as HTMLButtonElement | null;
      const originalSubmitterText = submitter?.textContent ?? "";

      setSubmitStatus("submitting");
      setSubmitMessage("");
      submitter?.setAttribute("disabled", "true");
      if (submitter) submitter.textContent = "Submitting...";

      try {
        const response = await fetch("/api/fluent-forms/submit", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            formId: safeFormId,
            data: formDataToObject(new FormData(form)),
          }),
        });
        const payload = (await response.json()) as FluentFormSubmitPayload;

        if (!response.ok) {
          throw new Error(getSubmitMessage(payload));
        }

        form.reset();
        setSubmitStatus("success");
        setSubmitMessage(getSubmitMessage(payload));
      } catch (error) {
        setSubmitStatus("error");
        setSubmitMessage(
          error instanceof Error
            ? error.message
            : "The form could not be submitted. Please try again."
        );
      } finally {
        submitter?.removeAttribute("disabled");
        if (submitter) submitter.textContent = originalSubmitterText;
      }
    };

    form.addEventListener("submit", handleSubmit);

    return () => {
      form.removeEventListener("submit", handleSubmit);
    };
  }, [safeFormId, status]);

  if (!safeFormId) {
    return (
      <div className="shop-builder-fluent-form-empty">
        Add a Fluent Forms form ID to render the WordPress form here.
      </div>
    );
  }

  return (
    <div className="shop-builder-fluent-form" data-form-id={safeFormId}>
      {title && <h3>{title}</h3>}
      {status === "loading" && (
        <div className="shop-builder-fluent-form-empty">Loading form...</div>
      )}
      {status === "error" && (
        <div className="shop-builder-fluent-form-error">{message}</div>
      )}
      <div ref={hostRef} className="shop-builder-fluent-form-host" />
      {submitStatus !== "idle" && submitStatus !== "submitting" && (
        <div
          className={`shop-builder-fluent-form-submit-message shop-builder-fluent-form-submit-message--${submitStatus}`}
          role={submitStatus === "error" ? "alert" : "status"}
        >
          {submitMessage}
        </div>
      )}
    </div>
  );
}
