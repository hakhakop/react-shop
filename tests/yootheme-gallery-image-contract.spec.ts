import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { resolveYoothemeLess } from "@/lib/yoothemeLessImporter";
import { getUikitGlobalsCssVars } from "@/lib/uikitGlobals";

test("imported Gallery composes only truthful Image controls and preserves source dimension semantics", () => {
  const panel = readFileSync(resolve(process.cwd(), "components/dashboard/inspector/panels/GalleryCapabilityPanel.tsx"), "utf8");
  const gallery = readFileSync(resolve(process.cwd(), "components/builder/UikitGallery.tsx"), "utf8");

  expect(panel).toContain("showFrameControls={!isImportedYoothemeGallery}");
  expect(panel).toContain("showFocalPoint={!isImportedYoothemeGallery}");
  expect(panel).toContain("showAlignment={!isImportedYoothemeGallery}");
  expect(panel).toContain("showDecoration={!isImportedYoothemeGallery}");
  expect(panel).toContain("DynamicContentInspectorGroup");
  expect(panel).toContain('dynamicBinding("imageUrl")');
  expect(panel).toContain('dynamicBinding("content")');
  expect(panel).toContain('dynamicBinding("linkUrl")');
  expect(gallery).toContain("resolveGalleryImageAspectRatio(rawBlock.imageWidth, rawBlock.imageHeight)");
  expect(gallery).toContain("resolveGalleryImageIntrinsicDimensions(rawBlock.imageWidth, rawBlock.imageHeight)");
  expect(gallery).toContain('width={isYoothemeGallery ? importedIntrinsicDimensions?.width : undefined}');
  expect(gallery).toContain('height={isYoothemeGallery ? importedIntrinsicDimensions?.height : undefined}');
  expect(gallery).toContain('width: isYoothemeGallery ? "auto" : "100%"');
  expect(gallery).toContain('height: isYoothemeGallery ? "auto"');
  expect(gallery).toContain('className="shop-builder-gallery-image-placeholder"');
  expect(gallery).toContain('isYoothemeGallery ? baseGridClass.replace("uk-grid-match", "").trim()');
  expect(gallery).not.toContain('aspectRatio: `${importedImageWidth} / ${importedImageHeight}`');
  expect(gallery).not.toContain("const importedHasAspectRatio");
  expect(gallery).toContain("uk-child-width-1-");
  expect(gallery).toContain('replace("shop-builder-uikit-grid--column-center", "")');
  expect(gallery).toContain("uk-margin-remove-first-child");
  expect(gallery).toContain("overlayPositionClass");
  expect(gallery).toContain("overlayPaddingClass");
});

test("Circle Gallery glass overlay remains owned by imported global UIkit tokens", () => {
  const imported = resolveYoothemeLess([{ name: "master-circle/_import.less", precedence: 1, content: `
    @overlay-default-background: rgba(255,255,255,0.15);
    @overlay-default-backdrop-filter: blur(15px);
    @overlay-primary-backdrop-filter: blur(15px);
  ` }]);
  expect(imported.shellSettings).toMatchObject({
    overlayDefaultBackground: "rgba(255, 255, 255, 0.15)",
    overlayDefaultBackdropFilter: "blur(15px)",
    overlayPrimaryBackdropFilter: "blur(15px)",
  });
  expect(getUikitGlobalsCssVars(imported.shellSettings)).toMatchObject({
    "--uk-overlay-default-background": "rgba(255, 255, 255, 0.15)",
    "--uk-overlay-default-backdrop-filter": "blur(15px)",
    "--uk-overlay-primary-backdrop-filter": "blur(15px)",
  });
});
