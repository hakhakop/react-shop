"use client";

import { useEffect, useRef, useState } from "react";

type FluentFormClientProps = {
  formId?: string | number | null;
  title?: string | null;
  previewMode?: boolean;
};

type FluentFormPayload = {
  html?: string;
  scripts?: string[];
  styles?: string[];
  inlineScripts?: string[];
  sourceUrl?: string;
  diagnostics?: {
    expectsPhoneField?: boolean;
    rendersPhoneField?: boolean;
  };
  message?: string;
};

type FluentFormSubmitPayload = {
  message?: string;
  errors?: Record<string, unknown>;
};

type FluentConditionalRule = {
  field?: string;
  value?: string | number | boolean;
  operator?: string;
};

type FluentConditional = {
  type?: "all" | "any";
  status?: boolean;
  conditions?: FluentConditionalRule[];
};

type FluentFormConfig = {
  conditionals?: Record<string, FluentConditional>;
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

const fluentAssetPromises = new Map<string, Promise<void>>();

function resolveAssetUrl(src: string, sourceUrl?: string) {
  try {
    return new URL(src, sourceUrl || window.location.origin).toString();
  } catch {
    return src;
  }
}

function loadAsset(tagName: "script" | "link", src: string, sourceUrl?: string) {
  const resolvedSrc = resolveAssetUrl(src, sourceUrl);
  const key = `${tagName}:${resolvedSrc}`;
  const existingPromise = fluentAssetPromises.get(key);
  if (existingPromise) return existingPromise;

  const promise = new Promise<void>((resolve, reject) => {
    const existing = Array.from(
      document.querySelectorAll<HTMLElement>("[data-fluent-form-asset]")
    ).find((element) => element.dataset.fluentFormAsset === key);

    if (existing) {
      if (
        existing.dataset.fluentFormLoaded === "true" ||
        (existing instanceof HTMLLinkElement && existing.sheet)
      ) {
        resolve();
        return;
      }
      existing.remove();
    }

    const asset = document.createElement(tagName);
    asset.dataset.fluentFormAsset = key;
    asset.addEventListener(
      "load",
      () => {
        asset.dataset.fluentFormLoaded = "true";
        resolve();
      },
      { once: true }
    );
    asset.addEventListener(
      "error",
      () => reject(new Error(`Could not load Fluent Forms asset: ${resolvedSrc}`)),
      { once: true }
    );

    if (tagName === "link") {
      const link = asset as HTMLLinkElement;
      link.rel = "stylesheet";
      link.href = resolvedSrc;
      document.head.appendChild(link);
      return;
    }

    const script = asset as HTMLScriptElement;
    script.src = resolvedSrc;
    script.async = false;
    document.body.appendChild(script);
  });

  fluentAssetPromises.set(key, promise);
  promise.catch(() => fluentAssetPromises.delete(key));
  return promise;
}

function parseFluentFormConfig(scripts: string[]) {
  for (const code of scripts) {
    const assignment = code.match(
      /window\.fluent_form_[\w]+\s*=\s*({[\s\S]*?})\s*;?\s*$/
    );
    if (!assignment?.[1]) continue;

    try {
      return JSON.parse(assignment[1]) as FluentFormConfig;
    } catch {
      // Ignore unrelated or malformed inline scripts from WordPress.
    }
  }

  return null;
}

function getFieldValues(form: HTMLFormElement, fieldName: string) {
  const fields = Array.from(
    form.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(
      "input, select, textarea"
    )
  ).filter(
    (field) =>
      field.name === fieldName ||
      field.name === `${fieldName}[]` ||
      field.dataset.name === fieldName
  );

  return fields.flatMap((field) => {
    if (
      (field instanceof HTMLInputElement &&
        (field.type === "checkbox" || field.type === "radio")) &&
      !field.checked
    ) {
      return [];
    }
    return [field.value];
  });
}

function matchesConditionalRule(form: HTMLFormElement, rule: FluentConditionalRule) {
  const fieldName = rule.field?.trim();
  if (!fieldName) return false;

  const values = getFieldValues(form, fieldName);
  const expected = String(rule.value ?? "");
  const operator = rule.operator || "=";

  if (operator === "!=") return values.every((value) => value !== expected);
  if (operator === "contains") {
    return values.some((value) => value.includes(expected));
  }
  if (operator === "not_contains") {
    return values.every((value) => !value.includes(expected));
  }
  if ([">", ">=", "<", "<="].includes(operator)) {
    const expectedNumber = Number(expected);
    return values.some((value) => {
      const actualNumber = Number(value);
      if (!Number.isFinite(actualNumber) || !Number.isFinite(expectedNumber)) {
        return false;
      }
      if (operator === ">") return actualNumber > expectedNumber;
      if (operator === ">=") return actualNumber >= expectedNumber;
      if (operator === "<") return actualNumber < expectedNumber;
      return actualNumber <= expectedNumber;
    });
  }

  return values.some((value) => value === expected);
}

function initializeConditionalFields(
  form: HTMLFormElement,
  conditionals?: Record<string, FluentConditional>
) {
  if (!conditionals || !Object.keys(conditionals).length) return () => undefined;

  const evaluate = () => {
    Object.entries(conditionals).forEach(([fieldName, conditional]) => {
      if (conditional.status === false) return;

      const targetField = Array.from(
        form.querySelectorAll<HTMLElement>("input, select, textarea, [data-name]")
      ).find(
        (field) =>
          field.getAttribute("name") === fieldName ||
          field.getAttribute("name") === `${fieldName}[]` ||
          field.dataset.name === fieldName
      );
      const target = targetField?.closest<HTMLElement>(".ff-el-group");
      if (!target) return;

      const rules = (conditional.conditions ?? []).filter((rule) => rule.field);
      const visible = rules.length
        ? conditional.type === "all"
          ? rules.every((rule) => matchesConditionalRule(form, rule))
          : rules.some((rule) => matchesConditionalRule(form, rule))
        : true;

      target.hidden = !visible;
      target.classList.toggle("ff-conditional-visible", visible);
      target.setAttribute("aria-hidden", String(!visible));
    });
  };

  const handleReset = () => window.setTimeout(evaluate, 0);
  form.addEventListener("input", evaluate);
  form.addEventListener("change", evaluate);
  form.addEventListener("reset", handleReset);
  evaluate();

  return () => {
    form.removeEventListener("input", evaluate);
    form.removeEventListener("change", evaluate);
    form.removeEventListener("reset", handleReset);
  };
}

function initializePhoneFields(host: HTMLElement) {
  const phoneInputs = host.querySelectorAll<HTMLInputElement>(
    "input.ff-el-phone, input[type='tel'][name='phone']"
  );
  const fluentWindow = window as typeof window & {
    intlTelInput?: (input: HTMLInputElement, options?: Record<string, unknown>) => unknown;
  };

  phoneInputs.forEach((input) => {
    if (input.dataset.fluentPhoneInitialized === "true") return;
    if (input.closest(".iti")) {
      input.dataset.fluentPhoneInitialized = "true";
      return;
    }
    if (typeof fluentWindow.intlTelInput !== "function") return;

    fluentWindow.intlTelInput(input, {
      autoPlaceholder: "aggressive",
      formatOnDisplay: true,
      nationalMode: true,
      separateDialCode: false,
    });
    input.dataset.fluentPhoneInitialized = "true";
  });
}

export default function FluentFormClient({
  formId,
  title,
  previewMode = false,
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
    if (previewMode || !host || !safeFormId) return;

    let cancelled = false;
    let cleanupConditionalFields: () => void = () => undefined;
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
      .then(async (payload) => {
        if (cancelled) return;

        await Promise.all(
          (payload.styles ?? []).map((href) =>
            loadAsset("link", href, payload.sourceUrl)
          )
        );
        if (cancelled) return;

        const template = document.createElement("template");
        template.innerHTML = payload.html ?? "";
        const embeddedScripts = Array.from(
          template.content.querySelectorAll<HTMLScriptElement>("script")
        );
        const embeddedInlineScripts: string[] = [];
        const embeddedExternalScripts: string[] = [];

        embeddedScripts.forEach((script) => {
          if (script.src) embeddedExternalScripts.push(script.src);
          else embeddedInlineScripts.push(script.textContent ?? "");
          script.remove();
        });

        const formConfig = parseFluentFormConfig(embeddedInlineScripts);

        host.replaceChildren(template.content.cloneNode(true));
        host.querySelectorAll(".ff-form-loading").forEach((element) => {
          element.classList.remove("ff-form-loading");
        });

        const form = host.querySelector<HTMLFormElement>("form.frm-fluent-form");
        cleanupConditionalFields = form
          ? initializeConditionalFields(form, formConfig?.conditionals)
          : () => undefined;

        for (const src of new Set([
          ...embeddedExternalScripts,
          ...(payload.scripts ?? []),
        ])) {
          try {
            await loadAsset("script", src, payload.sourceUrl);
          } catch (error) {
            console.warn(error);
          }
        }
        if (cancelled) {
          cleanupConditionalFields();
          return;
        }

        initializePhoneFields(host);
        host.dataset.fluentConditionals = formConfig?.conditionals
          ? "initialized"
          : "unavailable";

        if (
          payload.diagnostics?.expectsPhoneField &&
          !payload.diagnostics.rendersPhoneField
        ) {
          host.dataset.phoneFieldMissingFromSource = "true";
          console.warn(
            `Fluent Form ${safeFormId} expects a phone field, but WordPress did not include its markup.`
          );
        }
        setStatus("ready");
      })
      .catch((error: Error) => {
        if (cancelled) return;
        setStatus("error");
        setMessage(error.message);
      });

    return () => {
      cancelled = true;
      cleanupConditionalFields();
    };
  }, [previewMode, safeFormId]);

  useEffect(() => {
    const host = hostRef.current;
    if (previewMode || !host || status !== "ready" || !safeFormId) return;

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
  }, [previewMode, safeFormId, status]);

  if (previewMode) {
    return (
      <div className="shop-builder-fluent-form" data-preview-mode="true">
        {title && <h3>{title}</h3>}
        <div className="builder-preview-form-lines" aria-hidden="true">
          <i />
          <i />
          <i />
          <b />
        </div>
      </div>
    );
  }

  if (!safeFormId) {
    return (
      <div className="shop-builder-fluent-form-empty">
        Add a Fluent Forms form ID to render the WordPress form here.
      </div>
    );
  }

  return (
    <div
      className="shop-builder-fluent-form"
      data-form-id={safeFormId}
      data-status={status}
    >
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
