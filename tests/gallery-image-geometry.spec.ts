import { expect, test } from "@playwright/test";
import {
  resolveGalleryImageAspectRatio,
  resolveGalleryImageIntrinsicDimensions,
} from "@/lib/galleryImageGeometry";

test("YOOtheme Gallery dimensions produce a valid unitless CSS ratio", () => {
  expect(resolveGalleryImageAspectRatio(610, 610)).toBe("610 / 610");
  expect(resolveGalleryImageAspectRatio("610px", "405px")).toBe("610 / 405");
});

test("unsupported dimensions do not create an invalid aspect ratio", () => {
  expect(resolveGalleryImageAspectRatio("100%", "auto")).toBeUndefined();
});

test("YOOtheme dimensions remain intrinsic image attributes", () => {
  expect(resolveGalleryImageIntrinsicDimensions(610, 610)).toEqual({ width: 610, height: 610 });
  expect(resolveGalleryImageIntrinsicDimensions("610px", "405px")).toEqual({ width: 610, height: 405 });
  expect(resolveGalleryImageIntrinsicDimensions("100%", "auto")).toBeUndefined();
});
