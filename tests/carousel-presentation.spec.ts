import { test, expect } from "@playwright/test";
import { resolveCarouselPresentation } from "@/lib/carouselPresentation";

test("Slider presentation resolves Global Slider and Image defaults once for both surfaces", () => {
  const resolved = resolveCarouselPresentation(
    { arrowStyle: "inherit", paginationPosition: "top" },
    [{ id: "slide-1", imageUrl: "/image.jpg", imageFit: "inherit" }],
    {
      sliderArrowStyle: "minimal-light",
      sliderArrowPosition: "outer",
      sliderDotnavStyle: "fraction",
      sliderDotnavPosition: "bottom",
      imageDefaultFit: "natural",
      imageDefaultRatio: "natural",
      imageDefaultBorder: "none",
      imageDefaultShadow: "none",
      imageDefaultAlignment: "center",
      imageDefaultLoading: "lazy",
    } as any,
  );

  expect(resolved.settings).toMatchObject({
    arrowStyle: "minimal-light",
    arrowPosition: "outer",
    paginationStyle: "fraction",
    paginationPosition: "top",
  });
  expect(resolved.slides[0]).toMatchObject({
    id: "slide-1",
    imageFit: "natural",
    imageRatio: "natural",
    imageLoading: "lazy",
  });
});
