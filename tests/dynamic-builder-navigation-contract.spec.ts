import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";
import path from "node:path";

test("normal DashboardBuilder owns strict ?document navigation and save", async () => {
  const source = await readFile(
    path.join(process.cwd(), "components/dashboard/DashboardBuilder.tsx"),
    "utf8",
  );
  expect(source).toContain('searchParams.get("document")');
  expect(source).toContain('document: requestedDocument');
  expect(source).toContain('action: "save", documentId: activeDynamicDocumentId');
  expect(source).toContain('!requestedRoutingTemplate && !payload.layout.page?.startsWith("dynamic:")');
  expect(source.includes("normalizeBuilderLayoutKey(requestedDocument")).toBe(false);
});

test("Builder API distinguishes strict document mode from legacy key mode", async () => {
  const source = await readFile(
    path.join(process.cwd(), "app/api/builder-layouts/route.ts"),
    "utf8",
  );
  const documentBranch = source.indexOf('searchParams.get("document")');
  const legacyNormalization = source.indexOf("normalizeBuilderLayoutKey(");
  expect(documentBranch).toBeGreaterThan(-1);
  expect(legacyNormalization).toBeGreaterThan(documentBranch);
  expect(source).toContain('action?: "create" | "save" | "duplicate"');
  expect(source).toContain("deleteDynamicBuilderDocument");
});
