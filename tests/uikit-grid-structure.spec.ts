import { expect, test } from "@playwright/test";
import { resolveUikitGridStructure, uikitGridAttribute } from "@/lib/uikitGridStructure";
import { mapYoothemeStaticContent } from "@/lib/yoothemePageImport";

test("Grid importer preserves UIkit masonry/parallax options through the canonical structure owner", () => {
  const mapped = mapYoothemeStaticContent({
    type: "layout", children: [{ type: "section", children: [{ type: "row", children: [{ type: "column", children: [{ type: "grid", props: {
      grid_masonry: "next", grid_parallax: "150", grid_parallax_justify: "true",
      grid_parallax_start: "10vh", grid_parallax_end: "bottom",
    }, children: [] }] }] }] }],
  } as any);
  const block = mapped.sections[0]?.layoutItems?.[0]?.blocks[0] as any;
  expect(block).toMatchObject({ gridMasonry: "next", gridParallax: 150, gridParallaxJustify: true, gridParallaxStart: "10vh", gridParallaxEnd: "bottom" });
  expect(uikitGridAttribute(resolveUikitGridStructure(block))).toBe(
    "masonry: next; parallax: 150; parallax-justify: true; parallax-start: 10vh; parallax-end: bottom",
  );
});

test("masonry suppresses UIkit flex alignment without discarding the persisted source values", () => {
  const structure = resolveUikitGridStructure({ gridMasonry: "pack", centerColumns: true, centerRows: true });
  expect(structure).toMatchObject({ masonry: "pack", centerColumns: false, centerRows: false });
});
