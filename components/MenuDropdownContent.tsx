"use client";

import { useEffect, useState } from "react";
import { ContentLayoutBlock } from "@/components/builder/StorefrontBuilderRenderer";
import { menuDropdownRenderLayout, type MenuDropdownContent as Dropdown } from "@/lib/menuDropdownLayout";
import type { BuilderLayout, BuilderLayoutKey } from "@/lib/builderLayouts";
import type { BuilderShellSettings } from "@/lib/builderShell";
import { projectWebsiteAuthoredLinks, type WebsiteLinkProjection } from "@/lib/scopedPreviewLinks";

export default function MenuDropdownContent({ content, initialSections, initialSignature, initialWarnings, draft, websiteId, page, shellSettings, linkProjection }: {
  content: Dropdown; initialSections?: BuilderLayout["sections"]; initialSignature?: string;
  initialWarnings?: string[];
  draft?: boolean; websiteId?: string; page?: BuilderLayoutKey; shellSettings: Partial<BuilderShellSettings>;
  linkProjection?: WebsiteLinkProjection;
}) {
  const signature = JSON.stringify(content);
  const [resolved, setResolved] = useState<{ signature: string; sections: BuilderLayout["sections"]; warnings: string[] } | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!draft || signature === initialSignature) return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const query = websiteId ? `?websiteId=${encodeURIComponent(websiteId)}` : "";
        const response = await fetch(`/api/builder-layouts/preview${query}`, {
          method: "POST", headers: { "Content-Type": "application/json" }, signal: controller.signal,
          body: JSON.stringify({ layout: menuDropdownRenderLayout([JSON.parse(signature)]) }),
        });
        if (!response.ok) throw new Error("Dropdown preview could not be resolved.");
        const result = await response.json();
        if (!controller.signal.aborted) { setResolved({ signature, sections: result.renderLayout.sections, warnings: (result.dynamicContentDiagnostics ?? []).flatMap((item: { message?: string }) => item.message ? [item.message] : []) }); setError(""); }
      } catch { if (!controller.signal.aborted) setError("Dropdown preview could not be refreshed. Showing the last resolved content."); }
    }, 200);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [draft, websiteId, signature, initialSignature]);
  const sections = resolved?.signature === signature ? resolved.sections
    : initialSignature === signature ? initialSections : resolved?.sections ?? initialSections;
  const authoredBlocks = sections?.flatMap(section => section.rows?.flatMap(row => row.columns.flatMap(column => column.elements ?? [])) ?? []) ?? [content];
  const blocks = linkProjection ? projectWebsiteAuthoredLinks(authoredBlocks, linkProjection) : authoredBlocks;
  return <>
    {draft && error && <p role="alert">{error}</p>}
    {draft && [...new Set(resolved?.signature === signature ? resolved.warnings : initialWarnings ?? [])].map(warning => <p key={warning} role="status">{warning}</p>)}
    {blocks.map(block => <ContentLayoutBlock key={block.id} block={block} breadcrumbItems={[]} page={page} shellSettings={shellSettings} />)}
  </>;
}
