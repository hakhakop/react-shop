import { test, expect } from "@playwright/test";
import { getCmsConnection } from "@/lib/cmsConnection";

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
