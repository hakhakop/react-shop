import { test, expect } from "@playwright/test";
import { resolveWordPressMediaUrl } from "@/lib/builderMediaUrls";
import { getCmsConnection } from "@/lib/cmsConnection";
import { getWordPressMediaOrigin } from "@/lib/wordpressUrl";
import type { SaaSWebsite } from "@/lib/websites";

function website(input: Partial<SaaSWebsite>): SaaSWebsite {
  return {
    id: "tenant-id",
    ownerId: "owner-id",
    name: "Tenant",
    slug: "tenant",
    type: "business",
    domain: null,
    primaryDomain: null,
    domains: [],
    description: "",
    timeZone: "Asia/Yerevan",
    language: "hy",
    primaryLanguage: "hy",
    enabledLanguages: ["hy"],
    status: "creating",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...input,
  };
}

test("tenant-scoped CMS resolution does not inherit the global connection", () => {
  const unconfigured = getCmsConnection({});
  expect(unconfigured.siteUrl).toBe("");
  expect(unconfigured.graphqlUrl).toBe("");

  const explicit = getCmsConnection({
    cmsConnection: { siteUrl: "https://tenant.example" },
  });
  expect(explicit.siteUrl).toBe("https://tenant.example");
  expect(explicit.graphqlUrl).toBe("https://tenant.example/graphql");
});

test("tenant media origin falls back to its own canonical domain", () => {
  const origin = getWordPressMediaOrigin(website({ slug: "domain-isolation-a" }));
  expect(origin).toBe("https://domain-isolation-a.webpages.am");
  expect(resolveWordPressMediaUrl(
    "https://circle.webpages.am/wp-content/uploads/yootheme/hero.jpg",
    origin,
  )).toBe(
    "https://domain-isolation-a.webpages.am/wp-content/uploads/yootheme/hero.jpg",
  );
});

test("explicit CMS and custom tenant domains keep their precedence", () => {
  expect(getWordPressMediaOrigin(website({
    slug: "circle",
    primaryDomain: "circle.webpages.am",
    domains: ["circle.webpages.am"],
    cmsConnection: { siteUrl: "https://circle.webpages.am" } as SaaSWebsite["cmsConnection"],
  }))).toBe("https://circle.webpages.am");

  expect(getWordPressMediaOrigin(website({
    slug: "tenant",
    domain: "shop.example",
    primaryDomain: "shop.example",
    domains: ["shop.example"],
  }))).toBe("https://shop.example");
});
