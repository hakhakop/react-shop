import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";
import path from "node:path";

test("Builder document controls reflow against the sidebar container", async () => {
  const css = await readFile(path.join(process.cwd(), "app/styles/dashboard.css"), "utf8");

  expect(css).toContain("container-name: builder-document-header");
  expect(css).toContain("@container builder-document-header (max-width: 900px)");
  expect(css).toContain("@container builder-document-header (max-width: 520px)");
  expect(css).toContain(".builder-document-header .builder-document-language-top {\n  position: static;");
  expect(css).toContain(".builder-document-actions .builder-template-preview-select select");
  expect(css).toContain(".builder-document-actions .builder-canvas-control:not(.builder-icon-only-control)");
});
