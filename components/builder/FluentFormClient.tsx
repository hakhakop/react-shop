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
  const [message, setMessage] = useState("");
  const safeFormId = formId != null ? String(formId).trim() : "";

  useEffect(() => {
    const host = hostRef.current;
    if (!host || !safeFormId) return;

    let cancelled = false;
    setStatus("loading");
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
    </div>
  );
}
