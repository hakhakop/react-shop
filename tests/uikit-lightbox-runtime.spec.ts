import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

test("shared UIkit Lightbox bridge owns the imperative lifecycle and imported Gallery uses it conditionally", () => {
  const bridge = readFileSync(resolve(process.cwd(), "components/builder/useUikitLightboxRuntime.ts"), "utf8");
  const gallery = readFileSync(resolve(process.cwd(), "components/builder/UikitGallery.tsx"), "utf8");

  expect(bridge).toContain('import("uikit")');
  expect(bridge).toContain('import("uikit/dist/js/uikit-icons")');
  expect(bridge).toContain("UIkit.lightbox(rootRef.current, { toggle })");
  expect(bridge).toContain("instance?.$destroy?.()");
  expect(bridge).toContain("iconsRegistered");

  expect(gallery).toContain("useUikitLightboxRuntime(gridRef");
  expect(gallery).toContain("enabled: usesYoothemeLightbox");
  expect(gallery).toContain('const usesYoothemeLightbox = isYoothemeGallery && rawBlock.enableLightbox === true;');
  expect(gallery).toContain('data-uk-lightbox={usesYoothemeLightbox ? "toggle: a[data-type];" : undefined}');
  expect(gallery).toContain('data-type="image"');
  expect(gallery).toContain("const lightboxUrl = itemUrl || item.imageUrl;");
  expect(gallery).toContain("const usesYoothemeOverlayLink = isYoothemeGallery && rawBlock.overlayLink === true;");
  expect(gallery).toContain("const hasOverlayLink = usesYoothemeOverlayLink && Boolean(overlayLinkUrl);");
  expect(gallery).toContain('className="el-overlay-link uk-position-cover"');
  expect(gallery).toContain("!usesYoothemeLightbox && hasAction");
  expect(gallery).toContain("const isLightbox = !isYoothemeGallery && rawBlock.enableLightbox !== false;");
});
