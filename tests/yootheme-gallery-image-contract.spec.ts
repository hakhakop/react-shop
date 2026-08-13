import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

test("imported Gallery composes only truthful Image controls and preserves source dimension semantics", () => {
  const panel = readFileSync(resolve(process.cwd(), "components/dashboard/inspector/panels/GalleryCapabilityPanel.tsx"), "utf8");
  const gallery = readFileSync(resolve(process.cwd(), "components/builder/UikitGallery.tsx"), "utf8");

  expect(panel).toContain("showFrameControls={!isImportedYoothemeGallery}");
  expect(panel).toContain("showFocalPoint={!isImportedYoothemeGallery}");
  expect(panel).toContain("showAlignment={!isImportedYoothemeGallery}");
  expect(panel).toContain("showDecoration={!isImportedYoothemeGallery}");
  expect(gallery).toContain("const importedHasBothDimensions");
  expect(gallery).toContain('importedHasBothDimensions ? "cover" : imageStyle.objectFit');
  expect(gallery).toContain('importedImageHeight ?? "auto"');
});
