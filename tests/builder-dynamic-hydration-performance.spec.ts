import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

test("Builder hydration reuses its server projection instead of refetching it on mount", () => {
  const builder = readFileSync(
    resolve(process.cwd(), "components/dashboard/DashboardBuilder.tsx"),
    "utf8",
  );

  expect(builder).toContain("initialProjectionMatchesAuthoredState ? dynamicContentSignature : null");
  expect(builder).toContain("initialProjectionMatchesAuthoredState ? builderState.page : null");
});

test("Builder iframe defers dynamic materialization to its parent projection", () => {
  const frontend = readFileSync(
    resolve(process.cwd(), "components/website/WebsiteFrontend.tsx"),
    "utf8",
  );

  expect(frontend).toContain("resolvedMediaLayout && !builderIframeSelection");
});
