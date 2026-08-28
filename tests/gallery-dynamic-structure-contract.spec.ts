import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";
import path from "node:path";

test("Structure recognizes Gallery item Dynamic Content", async () => {
  const source = await readFile(
    path.join(process.cwd(), "components/dashboard/BuilderWireframePanel.tsx"),
    "utf8",
  );

  expect(source).toContain("block.galleryItems?.some((item)");
  expect(source).toContain("hasDynamicContent(item as unknown as Record<string, unknown>)");
});
