"use client";

import { useEffect, useRef } from "react";

type EmbedSectionClientProps = {
  mode?: string | null;
  code?: string | null;
  url?: string | null;
  height?: number | null;
  title?: string | null;
};

export default function EmbedSectionClient({
  mode,
  code,
  url,
  height,
  title,
}: EmbedSectionClientProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const safeHeight =
    typeof height === "number" && height >= 120 && height <= 1200 ? height : 420;

  useEffect(() => {
    if (mode !== "code" || !hostRef.current) return;

    const host = hostRef.current;
    host.innerHTML = code ?? "";

    const scripts = Array.from(host.querySelectorAll("script"));
    scripts.forEach((script) => {
      const nextScript = document.createElement("script");

      Array.from(script.attributes).forEach((attribute) => {
        nextScript.setAttribute(attribute.name, attribute.value);
      });

      nextScript.text = script.text;
      script.replaceWith(nextScript);
    });
  }, [code, mode]);

  if (mode === "iframe" && url) {
    return (
      <iframe
        className="shop-builder-embed-frame"
        src={url}
        title={title ?? "Embedded content"}
        style={{ minHeight: safeHeight }}
        loading="lazy"
      />
    );
  }

  if (mode === "code" && code) {
    return <div ref={hostRef} className="shop-builder-embed-code" />;
  }

  return (
    <div className="shop-builder-embed-empty">
      Embed content has not been configured.
    </div>
  );
}
