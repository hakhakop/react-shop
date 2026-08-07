"use client";

import React from "react";
import type { BuilderLayoutBlock } from "@/components/dashboard/builderTypes";
import { CalendarDays } from "lucide-react";
import { Typog } from "@/components/builder/BuilderRenderHelpers";
import BuilderLineBreakText from "@/components/builder/BuilderLineBreakText";

type Props = {
  block: BuilderLayoutBlock;
};

export default function UikitDatePicker({ block }: Props) {
  const rawBlock = (block ?? {}) as any;

  const marginClass = rawBlock.margin && rawBlock.margin !== "none" ? `uk-margin-${rawBlock.margin}` : "";
  const animationClass = rawBlock.animation && rawBlock.animation !== "none" ? `uk-animation-${rawBlock.animation}` : "";
  const visibilityClass = rawBlock.visibility && rawBlock.visibility !== "always" ? `uk-${rawBlock.visibility}` : "";

  return (
    <div
      id={rawBlock.customId || rawBlock.id}
      className={`shop-builder-column-block shop-builder-column-block--date-picker ${marginClass} ${animationClass} ${visibilityClass} ${rawBlock.customClass ?? ""}`.trim()}
    >
      <CalendarDays size={24} />
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
      <label>
        <span>{rawBlock.dateLabel ?? "Preferred date"}</span>
        <input type="date" className="uk-input" />
      </label>
    </div>
  );
}
