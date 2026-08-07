"use client";

import React, { CSSProperties } from "react";
import type { BuilderLayoutBlock } from "@/components/dashboard/builderTypes";
import { getUikitBadgeClass } from "@/lib/uikitTokens";
import { RenderChecklist, Typog } from "@/components/builder/BuilderRenderHelpers";
import BuilderLineBreakText from "@/components/builder/BuilderLineBreakText";

type Props = {
  block: BuilderLayoutBlock;
};

export default function UikitBadgeGrid({ block }: Props) {
  const rawBlock = (block ?? {}) as any;
  const badges = rawBlock.badges?.length
    ? rawBlock.badges
    : [
        {
          id: "one",
          label: "01",
          title: "Fast setup",
          body: "Reusable settings.",
        },
        {
          id: "two",
          label: "02",
          title: "Clean blocks",
          body: "Flat nested sections.",
        },
      ];

  const marginClass = rawBlock.margin && rawBlock.margin !== "none" ? `uk-margin-${rawBlock.margin}` : "";
  const animationClass = rawBlock.animation && rawBlock.animation !== "none" ? `uk-animation-${rawBlock.animation}` : "";
  const visibilityClass = rawBlock.visibility && rawBlock.visibility !== "always" ? `uk-${rawBlock.visibility}` : "";

  return (
    <div
      id={rawBlock.customId || rawBlock.id}
      className={`shop-builder-column-block shop-builder-column-block--badges ${marginClass} ${animationClass} ${visibilityClass} ${rawBlock.customClass ?? ""}`.trim()}
    >
      {rawBlock.title && (
        <Typog as="h3" typography={rawBlock.typography}>
          <BuilderLineBreakText text={rawBlock.title} />
        </Typog>
      )}
      {rawBlock.body && (
        <Typog as="p" typography={rawBlock.typography}>
          {rawBlock.body}
        </Typog>
      )}
      <div
        className="shop-builder-column-badges"
        style={
          {
            "--builder-column-badge-columns": rawBlock.columns ?? 2,
          } as CSSProperties
        }
      >
        {badges.map((badge: any, index: number) => (
          <article key={badge.id ?? index}>
            {badge.label && <span className={getUikitBadgeClass(badge.style ?? "primary")}>{badge.label}</span>}
            {badge.title && (
              <Typog as="strong" typography={rawBlock.typography}>
                <BuilderLineBreakText text={badge.title} />
              </Typog>
            )}
            {badge.body && (
              <Typog as="p" typography={rawBlock.typography}>
                {badge.body}
              </Typog>
            )}
            {badge.items && badge.items.length > 0 && (
              <RenderChecklist
                items={badge.items}
                iconName={badge.listIcon || "check"}
                colorScheme={badge.listIconColorScheme || "default"}
                typography={rawBlock.typography}
                iconSize={badge.listIconSize}
              />
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
