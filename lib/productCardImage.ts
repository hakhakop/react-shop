import type { CSSProperties } from "react";

export type ProductImageFit = "contain" | "cover" | "fill";
export type ProductImageRatio = "auto" | "square" | "4:5" | "3:4";

export function getProductImageStyleVars(
  fit?: ProductImageFit | null,
  ratio?: ProductImageRatio | null,
): CSSProperties {
  const style: CSSProperties & Record<string, string> = {};

  if (fit === "contain" || fit === "cover" || fit === "fill") {
    style["--product-image-object-fit"] = fit;
  }

  if (ratio && ratio !== "auto") {
    style["--product-image-height"] = "auto";
    style["--product-image-aspect-ratio"] =
      ratio === "square" ? "1 / 1" : ratio === "4:5" ? "4 / 5" : "3 / 4";
  }

  return style;
}
