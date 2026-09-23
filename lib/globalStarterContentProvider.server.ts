import type {
  DynamicContentValueMap,
  DynamicContentValueType,
  DynamicItemContext,
} from "@/lib/dynamicContent";
import { listPublicGlobalStarters } from "@/lib/globalStarters";

const contextValue = <Type extends DynamicContentValueType>(
  type: Type,
  value: DynamicContentValueMap[Type],
) => ({ type, value }) as DynamicItemContext["fields"][string];

const integerQuery = (value: unknown, fallback: number) => {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : fallback;
};

/**
 * Public, provider-normalized Global Starter data for Builder repeaters.
 * The source website is intentionally never included in this projection.
 */
export async function resolveGlobalStarterContexts({ descriptor }: {
  descriptor: { mode: "single" | "collection"; query?: Record<string, unknown> };
}): Promise<DynamicItemContext[]> {
  const starters = await listPublicGlobalStarters();
  const query = descriptor.query ?? {};
  const start = integerQuery(query.start, 0);
  const requestedQuantity = integerQuery(query.quantity, starters.length);
  const quantity = requestedQuantity > 0 ? requestedQuantity : starters.length;

  return starters.slice(start, start + quantity).map((starter) => {
    const publicUrl = `/templates/${encodeURIComponent(starter.id)}`;
    const startUrl = `/app/websites/new?starterId=${encodeURIComponent(starter.id)}`;
    return {
      id: starter.id,
      fields: {
        title: contextValue("string", starter.name),
        description: contextValue("richText", starter.description),
        category: contextValue("string", starter.category),
        meta: contextValue("richText", `<a class="uk-link-text" href="${publicUrl}">Preview this template</a>`),
        ...(starter.previewImageUrl ? { previewImageUrl: contextValue("url", starter.previewImageUrl) } : {}),
        ...(starter.hoverImageUrl ? { hoverImageUrl: contextValue("url", starter.hoverImageUrl) } : {}),
        ...(starter.hoverVideoUrl ? { hoverVideoUrl: contextValue("url", starter.hoverVideoUrl) } : {}),
        publicUrl: contextValue("url", publicUrl),
        previewUrl: contextValue("url", publicUrl),
        startUrl: contextValue("url", startUrl),
      },
    } satisfies DynamicItemContext;
  });
}
