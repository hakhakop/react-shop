// components/PageRenderer.tsx
import { Container } from "./layout/Container";
import { PageSection } from "./layout/PageSection";

import HeroBlock from "./blocks/HeroBlock";
import ProductGridBlock from "./blocks/ProductGridBlock";
import CarouselBlock from "./blocks/CarouselBlock";
import { HomePerksGrid, Perk } from "./HomePerks";

import {
  HeroLayoutBlock,
  ProductGridLayoutBlock,
  PromoStripLayoutBlock,
  BadgeGridLayoutBlock,
  CarouselLayoutBlock,
  PageBuilderBlock,
} from "../lib/pageBuilder";

function mapBadgeGridToPerks(block: BadgeGridLayoutBlock): Perk[] {
  return (block.bgItems ?? []).map((item, index) => ({
    id: item.bgId ?? `perk-${index}`,
    label: item.bgLabel ?? "",
    title: item.bgTitle ?? "",
    body: item.bgBody ?? "",
  }));
}

function coerceColumnsDesktop(
  value?: number | string | null
): 2 | 3 | 4 | undefined {
  const n =
    typeof value === "string"
      ? parseInt(value, 10)
      : typeof value === "number"
      ? value
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

function pickFirstString(value: unknown): string | undefined {
  if (Array.isArray(value)) {
    const first = value[0];
    return typeof first === "string" ? first : undefined;
  }

  return typeof value === "string" ? value : undefined;
}

export default async function PageRenderer({
  blocks,
}: {
  blocks: PageBuilderBlock[];
}) {
  return (
    <>
      {blocks.map((block, i) => {
        const typename = block.__typename;

        const raw = block as any;

        const sectionBackground = pickFirstString(
          raw.sectionBackground ??
            raw.sectionbackground ??
            raw.sectionSettings?.sectionBackground ??
            raw.sectionSettings?.sectionbackground
        );

        const sectionTopSpacing = pickFirstString(
          raw.sectionTopSpacing ??
            raw.sectiontopspacing ??
            raw.sectionSettings?.sectionTopSpacing ??
            raw.sectionSettings?.sectiontopspacing
        );

        const sectionBottomSpacing = pickFirstString(
          raw.sectionBottomSpacing ??
            raw.sectionbottomspacing ??
            raw.sectionSettings?.sectionBottomSpacing ??
            raw.sectionSettings?.sectionbottomspacing
        );

        console.log("[PageRenderer] block1", {
          index: i,
          typename,
          sectionBackground,
          sectionTopSpacing,
          sectionBottomSpacing,
          rawSectionSettings: raw.sectionSettings,
        });

        switch (typename) {
          case "PageBuilderLayoutPageBuilderHeroLayout":
            return (
              <PageSection
                key={i}
                backgroundVariant={sectionBackground}
                topSpacing={sectionTopSpacing || (i === 0 ? "large" : "medium")}
                bottomSpacing={sectionBottomSpacing}
              >
                <Container size="wide">
                  <HeroBlock block={block as HeroLayoutBlock} />
                </Container>
              </PageSection>
            );

          case "PageBuilderLayoutPageBuilderProductGridLayout":
            return (
              <PageSection
                key={i}
                backgroundVariant={sectionBackground || "soft"}
                topSpacing={sectionTopSpacing}
                bottomSpacing={sectionBottomSpacing || "large"}
              >
                <Container size="wide">
                  <ProductGridBlock block={block as ProductGridLayoutBlock} />
                </Container>
              </PageSection>
            );

          case "PageBuilderLayoutPageBuilderPromoStripLayout":
            return (
              <PageSection
                key={i}
                backgroundVariant={sectionBackground || "primary"}
                topSpacing={sectionTopSpacing || "small"}
                bottomSpacing={sectionBottomSpacing || "small"}
              >
                <Container size="default">
                  <PromoStripBlockView block={block as PromoStripLayoutBlock} />
                </Container>
              </PageSection>
            );

            
          case "PageBuilderLayoutPageBuilderBadgeGridLayoutLayout":
            return (
              <PageSection
                key={i}
                backgroundVariant={sectionBackground || "default"}
                topSpacing={sectionTopSpacing || "medium"}
                bottomSpacing={sectionBottomSpacing || "large"}
              >
                <Container size="default">
                  <HomePerksGrid
                    items={mapBadgeGridToPerks(block as BadgeGridLayoutBlock)}
                    columnsDesktop={coerceColumnsDesktop(
                      (block as BadgeGridLayoutBlock).bgColumnsDesktop
                    )}
                  />
                </Container>
              </PageSection>
            );

          case "PageBuilderLayoutPageBuilderCarouselLayoutLayout": {
            console.log("[PageRenderer] CAROUSEL BLOCK RAW", block);

            const rawCarousel = block as any;
            console.log("[PageRenderer] rawCarousel", rawCarousel);

            const slides = (rawCarousel.slides || []).map((s: any, idx: number) => ({
              id: s.slideId || String(idx),
              imageUrl: s.image?.node?.sourceUrl || "",
              imageAlt: s.image?.node?.altText || null,
              title: s.title,
              subtitle: s.subtitle,
              text: s.text,
              buttonLabel: s.buttonLabel,
              buttonUrl: s.buttonUrl,
              badge: s.badge,
            }));
            console.log("[PageRenderer] slides after mapping", slides);

            const settings = rawCarousel.carouselSettings
              ? {
                  variant: rawCarousel.carouselSettings.variant || "basic",
                  loop: rawCarousel.carouselSettings.loop ?? true,
                  autoplay: rawCarousel.carouselSettings.autoplay ?? true,
                  autoplayDelayMs:
                    rawCarousel.carouselSettings.autoplayDelayMs ?? 5000,
                  align:
                    rawCarousel.carouselSettings.align === "center"
                      ? ("center" as const)
                      : ("start" as const),
                  dragFree: rawCarousel.carouselSettings.dragFree ?? false,
                }
              : undefined;
            console.log("[PageRenderer] carousel settings", settings);

            return (
              <PageSection
                key={i}
                backgroundVariant={sectionBackground}
                topSpacing={sectionTopSpacing}
                bottomSpacing={sectionBottomSpacing}
              >
                <Container size="wide">
                  <CarouselBlock
                    block={block as CarouselLayoutBlock}
                    slides={slides}
                    settings={settings}
                  />
                </Container>
              </PageSection>
            );
          }

          default:
            return (
              <PageSection
                key={i}
                backgroundVariant={sectionBackground || "default"}
                topSpacing={sectionTopSpacing || "medium"}
                bottomSpacing={sectionBottomSpacing || "medium"}
              >
                <Container size="default">
                  <div className="opacity-50 text-sm">
                    Unknown block: {typename}
                  </div>
                </Container>
              </PageSection>
            );
        }
      })}
    </>
  );
}