export type BuilderImageFit = "contain" | "cover" | "fill";
export type BuilderImageRatio = "auto" | "square" | "4:5" | "3:4" | "16:9" | "16:10";

export function getBuilderImageAspectRatio(
  ratio?: BuilderImageRatio | string | null,
): string | undefined {
  if (ratio === "square" || ratio === "1:1") return "1 / 1";
  if (ratio === "4:5") return "4 / 5";
  if (ratio === "3:4") return "3 / 4";
  if (ratio === "16:9") return "16 / 9";
  if (ratio === "16:10") return "16 / 10";
  if (ratio === "auto") return undefined;
  return "16 / 9";
}

export function getBuilderImageObjectFit(
  fit?: BuilderImageFit | string | null,
): BuilderImageFit {
  if (fit === "contain" || fit === "fill") return fit;
  return "cover";
}
