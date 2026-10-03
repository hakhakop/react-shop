import type { BuilderSavedTemplate } from "@/components/dashboard/builderTypes";
import { mapYoothemeStaticContent } from "@/lib/yoothemePageImport";

const CURRENT_YOOTHEME_TEMPLATE_MAPPER_VERSION = 1;

/**
 * Upgrade imported Library snapshots through explicit, targeted migrations.
 * The preserved source supplies missing canonical values without replacing
 * unrelated Builder state with a fresh importer projection.
 */
export function resolveSavedTemplateForApply(template: BuilderSavedTemplate): BuilderSavedTemplate {
  if (!template.sourceImport) return template;

  if (template.sourceImport.format === "webpages-builder-json") {
    const root = template.sourceImport.payload;
    if (!root || typeof root !== "object" || Array.isArray(root)) return template;
    const rootObject = root as Record<string, unknown>;
    const imported = rootObject.template && typeof rootObject.template === "object" && !Array.isArray(rootObject.template)
      ? rootObject.template as Record<string, unknown>
      : rootObject;
    return Array.isArray(imported.sections)
      ? { ...template, sections: imported.sections as BuilderSavedTemplate["sections"] }
      : template;
  }
  if (template.sourceImport.format !== "yootheme-json") return template;

  const appliedVersion = template.sourceImport.mapperVersion ?? 0;
  if (appliedVersion >= CURRENT_YOOTHEME_TEMPLATE_MAPPER_VERSION) return template;

  const mapping = mapYoothemeStaticContent(template.sourceImport.payload);
  if (mapping.sections.length === 0) return template;

  // Migration 1 repairs YOOtheme's width_expand mapping without replacing the
  // saved composition. Only authored one-sided values are allowed to override
  // the old normalized value; all other section and element data stays intact.
  const migratedSections = template.sections.map((section, index) => {
    const imported = mapping.sections.find((candidate) => candidate.id === section.id)
      ?? mapping.sections[index];
    const expandOneSide = imported?.expandOneSide;
    return expandOneSide === "left" || expandOneSide === "right"
      ? { ...section, expandOneSide }
      : section;
  });

  return { ...template, sections: migratedSections };
}
