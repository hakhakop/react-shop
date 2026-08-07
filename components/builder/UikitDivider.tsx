"use client";

import type { BuilderLayoutBlock } from "@/components/dashboard/builderTypes";
import { getUikitDividerClass } from "@/lib/uikitTokens";

type Props = {
  block: any;
};

export default function UikitDivider({ block }: Props) {
  const rawBlock = (block ?? {}) as any;
  const dividerStyle = rawBlock.dividerStyle || rawBlock.preset || "icon";
  const dividerClass = getUikitDividerClass(dividerStyle);

  const marginClass = rawBlock.margin && rawBlock.margin !== "none" ? `uk-margin-${rawBlock.margin}` : "uk-margin";
  const animationClass = rawBlock.animation && rawBlock.animation !== "none" ? `uk-animation-${rawBlock.animation}` : "";
  const visibilityClass = rawBlock.visibility && rawBlock.visibility !== "always" ? `uk-${rawBlock.visibility}` : "";

  return (
    <div
      id={rawBlock.customId || rawBlock.id}
      className={`shop-builder-column-block shop-builder-column-block--divider ${marginClass} ${animationClass} ${visibilityClass} ${rawBlock.customClass ?? ""}`.trim()}
    >
      <hr className={dividerClass} />
    </div>
  );
}
