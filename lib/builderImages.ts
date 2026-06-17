export type BuilderImageFit = "contain" | "cover" | "fill";
export type BuilderImageRatio = "auto" | "square" | "4:5" | "3:4";

export function getBuilderImageAspectRatio(
  ratio?: BuilderImageRatio | string | null,
): string | undefined {
  if (ratio === "square") return "1 / 1";
  if (ratio === "4:5") return "4 / 5";
  if (ratio === "3:4") return "3 / 4";
  return undefined;
}

export function getBuilderImageObjectFit(
  fit?: BuilderImageFit | string | null,
): BuilderImageFit {
  if (fit === "contain" || fit === "fill") return fit;
  return "cover";
}
