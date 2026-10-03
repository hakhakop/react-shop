/** Canonical reusable Builder Layout Library categories. */
export type LayoutLibraryType =
  | "page"
  | "header"
  | "footer"
  | "section"
  | "row"
  | "element";

export type BuilderLibraryImportSource = "webpages" | "yootheme";

export type BuilderLibraryImportFormat = {
  source: BuilderLibraryImportSource;
  templateType?: LayoutLibraryType;
};

const layoutLibraryTypes = new Set<LayoutLibraryType>([
  "page",
  "header",
  "footer",
  "section",
  "row",
  "element",
]);

/** Identify our portable Builder template export versus a YOOtheme layout JSON. */
export function resolveBuilderLibraryImportFormat(value: unknown): BuilderLibraryImportFormat {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return { source: "yootheme" };
  }
  const root = value as Record<string, unknown>;
  const wrapped = root.template && typeof root.template === "object" && !Array.isArray(root.template)
    ? root.template as Record<string, unknown>
    : root;
  const sections = Array.isArray(wrapped.sections) ? wrapped.sections : null;
  const firstSection = sections?.[0] && typeof sections[0] === "object"
    ? sections[0] as Record<string, unknown>
    : null;
  const isBuilderExport = root.exportType === "webpages-builder-template" || Boolean(
    sections && (
      typeof wrapped.templateType === "string" ||
      (typeof firstSection?.kind === "string" && typeof firstSection.visible === "boolean")
    ),
  );
  const templateType = typeof wrapped.templateType === "string" && layoutLibraryTypes.has(wrapped.templateType as LayoutLibraryType)
    ? wrapped.templateType as LayoutLibraryType
    : undefined;
  return { source: isBuilderExport ? "webpages" : "yootheme", templateType };
}
