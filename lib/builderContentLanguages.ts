import type { BuilderLayoutBlock, BuilderSection } from "@/components/dashboard/builderTypes";

const TRANSLATABLE_FIELDS = new Set([
  "eyebrow", "title", "subtitle", "body", "text", "label", "badge", "meta",
  "buttonLabel", "secondaryButtonLabel",
  "headingText", "dateLabel", "imageAlt", "imageCaption", "caption",
  "description", "ctaLabel", "items", "tableHeadings", "tableRows",
  "typewriterPhrases",
]);

type TranslatableEntity = {
  contentTranslations?: Record<string, Record<string, unknown>>;
  [key: string]: unknown;
};

export function resolveContentEntity<T extends TranslatableEntity>(
  entity: T,
  language: string,
  primaryLanguage: string,
): T {
  if (language === primaryLanguage || !entity) return entity;
  const translated = Object.fromEntries(
    Object.entries(entity.contentTranslations?.[language] ?? {}).filter(
      ([, value]) => value !== undefined && value !== null,
    ),
  );
  return { ...entity, ...translated };
}

export function applyContentPatch<T extends TranslatableEntity>(
  entity: T,
  patch: Partial<T>,
  language: string,
  primaryLanguage: string,
): T {
  if (language === primaryLanguage) return { ...entity, ...patch };
  const shared: Record<string, unknown> = {};
  const translated: Record<string, unknown> = {
    ...(entity.contentTranslations?.[language] ?? {}),
  };
  Object.entries(patch).forEach(([key, value]) => {
    if (!TRANSLATABLE_FIELDS.has(key)) {
      shared[key] = value;
    } else if (value === undefined || value === null) {
      delete translated[key];
    } else {
      translated[key] = value;
    }
  });
  return {
    ...entity,
    ...shared,
    contentTranslations: {
      ...(entity.contentTranslations ?? {}),
      [language]: {
        ...translated,
      },
    },
  } as T;
}

export function resolveContentSections(
  sections: BuilderSection[],
  language: string,
  primaryLanguage: string,
) {
  return sections.map((section): BuilderSection => {
    const localized = resolveContentEntity(section, language, primaryLanguage);
    return {
      ...localized,
      layoutItems: localized.layoutItems?.map((item) => {
        const resolveBlock = (block: BuilderLayoutBlock): BuilderLayoutBlock =>
          (() => {
            const localizedBlock = resolveContentEntity(block, language, primaryLanguage);
            return {
              ...localizedBlock,
              slides: localizedBlock.slides?.map((entry) => resolveContentEntity(entry, language, primaryLanguage)),
              badges: localizedBlock.badges?.map((entry) => resolveContentEntity(entry, language, primaryLanguage)),
              gridItems: localizedBlock.gridItems?.map((entry) => resolveContentEntity(entry, language, primaryLanguage)),
              buttons: localizedBlock.buttons?.map((entry) => resolveContentEntity(entry, language, primaryLanguage)),
            } as BuilderLayoutBlock;
          })();
        return {
          ...item,
          blocks: item.blocks?.map(resolveBlock),
          nestedLayout: item.nestedLayout
            ? {
                ...item.nestedLayout,
                rows: item.nestedLayout.rows.map((row) => ({
                  ...row,
                  columns: row.columns.map((column) => ({
                    ...column,
                    blocks: column.blocks.map(resolveBlock),
                  })),
                })),
              }
            : undefined,
        };
      }),
      slides: localized.slides?.map((entry) => resolveContentEntity(entry, language, primaryLanguage)),
      badges: localized.badges?.map((entry) => resolveContentEntity(entry, language, primaryLanguage)),
    } as BuilderSection;
  });
}

export function isUsingPrimaryFallback(
  entity: TranslatableEntity | null | undefined,
  language: string,
  primaryLanguage: string,
) {
  if (language === primaryLanguage || !entity) return false;
  const translated = entity.contentTranslations?.[language] ?? {};
  return Object.keys(entity).some(
    (key) =>
      TRANSLATABLE_FIELDS.has(key) &&
      entity[key] !== undefined &&
      translated[key] === undefined,
  );
}
