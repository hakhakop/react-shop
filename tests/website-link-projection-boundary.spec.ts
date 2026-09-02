import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";
import path from "node:path";

test("website-authored renderers share one projection boundary", async () => {
  const read = (file: string) => readFile(path.join(process.cwd(), file), "utf8");
  const [links, header, renderer, frontend, footer, builder, fallback, saasEntry, adminBar] = await Promise.all([
    read("lib/scopedPreviewLinks.ts"),
    read("components/HeaderNav.tsx"),
    read("components/builder/StorefrontBuilderRenderer.tsx"),
    read("components/website/WebsiteFrontend.tsx"),
    read("components/FooterShell.tsx"),
    read("components/dashboard/DashboardBuilder.tsx"),
    read("components/builder/ScopedPreviewLinkRouter.tsx"),
    read("components/HeaderSaaSEntry.tsx"),
    read("components/FrontendAdminBar.tsx"),
  ]);

  expect(links).toContain("export function projectWebsiteHref");
  expect(links).toContain("export function projectWebsiteAuthoredLinks");
  expect(header).toContain("projectWebsiteHref(href");
  expect(renderer).toContain("projectWebsiteAuthoredLinks(authoredLayout");
  expect(frontend).toContain("websiteLinkProjection={websiteLinkProjection}");
  expect(footer).toContain("websiteLinkProjection={websiteLinkProjection}");
  expect(builder).toContain("projectWebsiteAuthoredLinks(headerContextSections");
  expect(fallback).toContain("projectWebsiteHref(href");
  expect(fallback).toContain('data-website-link-owner="application"');
  expect(saasEntry).toContain('data-website-link-owner="application"');
  expect(adminBar).toContain('data-website-link-owner="application"');
});
