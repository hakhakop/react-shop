import {
  PageBuilderBlock,
  HeroLayoutBlock,
  ProductGridLayoutBlock,
  PromoStripLayoutBlock,
  BadgeGridLayoutBlock,
} from "../lib/pageBuilder";

import HeroBlock from "./blocks/HeroBlock";
import ProductGridBlock from "./blocks/ProductGridBlock";
import { HomePerksGrid, Perk } from "./HomePerks";

function mapBadgeGridToPerks(block: BadgeGridLayoutBlock): Perk[] {
  return (block.bgItems ?? []).map((item, index) => ({
    id: item.bgId ?? `perk-${index}`,
    label: item.bgLabel ?? "",
    title: item.bgTitle ?? "",
    body: item.bgBody ?? "",
  }));
}

function coerceColumnsDesktop(
  value?: number | string | (number | string)[] | null
): 2 | 3 | 4 | undefined {
  let raw: number | string | undefined;

  if (Array.isArray(value)) {
    raw = value[0];
  } else {
    raw = value ?? undefined;
  }

  const n =
    typeof raw === "string"
      ? parseInt(raw, 10)
      : typeof raw === "number"
      ? raw
      : undefined;

  return n === 2 || n === 3 || n === 4 ? (n as 2 | 3 | 4) : undefined;
}

function getPromoVariantClass(variant?: string | null) {
  switch (variant) {
    case "accent":
      return "bg-[var(--accent-soft,rgba(255,160,122,0.12))] text-[var(--accent-strong,#ff7a3c)]";
    case "soft":
      return "bg-[var(--surface-soft,#f5f5f5)] text-[var(--text-main,#111827)]";
    case "default":
    default:
      return "bg-[var(--primary-soft,rgba(59,130,246,0.12))] text-[var(--primary-strong,#1d4ed8)]";
  }
}

function PromoStripBlockView({ block }: { block: PromoStripLayoutBlock }) {
  if (!block.psText) return null;

  const variantClass = getPromoVariantClass(block.psVariant ?? "default");

  return (
    <div
      className={`w-full ${variantClass} rounded-xl px-4 py-3 md:px-6 md:py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-4`}
    >
      <div className="flex flex-col gap-1">
        <p className="text-sm md:text-base font-medium">{block.psText}</p>
        {block.psSubtext && (
          <p className="text-xs md:text-sm opacity-80">{block.psSubtext}</p>
        )}
      </div>

      {block.psCtaLabel && block.psCtaUrl && (
        <a
          href={block.psCtaUrl}
          className="inline-flex items-center justify-center text-xs md:text-sm font-medium px-3 py-2 rounded-full border border-white/40 hover:bg-white/10 transition whitespace-nowrap"
        >
          {block.psCtaLabel}
        </a>
      )}
    </div>
  );
}

export default async function PageRenderer({
  blocks,
}: {
  blocks: PageBuilderBlock[];
}) {
  return (
    <>
      {blocks.map((block, i) => {
        if (
          (block as PageBuilderBlock).__typename ===
          "PageBuilderLayoutPageBuilderBadgeGridLayoutLayout"
        ) {
          console.log(
            "[BadgeGrid] bgColumnsDesktop =",
            (block as any).bgColumnsDesktop
          );
        }

        switch (block.__typename) {
          case "PageBuilderLayoutPageBuilderHeroLayout":
            return <HeroBlock key={i} block={block as HeroLayoutBlock} />;

          case "PageBuilderLayoutPageBuilderProductGridLayout":
            return (
              <ProductGridBlock
                key={i}
                block={block as ProductGridLayoutBlock}
              />
            );

          case "PageBuilderLayoutPageBuilderPromoStripLayout":
            return (
              <PromoStripBlockView
                key={i}
                block={block as PromoStripLayoutBlock}
              />
            );

          case "PageBuilderLayoutPageBuilderBadgeGridLayoutLayout":
            return (
              <HomePerksGrid
                key={i}
                items={mapBadgeGridToPerks(block as BadgeGridLayoutBlock)}
                columnsDesktop={coerceColumnsDesktop(
                  (block as BadgeGridLayoutBlock).bgColumnsDesktop
                )}
              />
            );

          default:
            return (
              <div key={i} style={{ padding: 20, opacity: 0.4 }}>
                Unknown block: {(block as PageBuilderBlock).__typename}
              </div>
            );
        }
      })}
    </>
  );
}