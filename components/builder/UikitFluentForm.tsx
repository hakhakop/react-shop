"use client";

import React from "react";
import FluentFormClient from "@/components/builder/FluentFormClient";
import BuilderLineBreakText from "@/components/builder/BuilderLineBreakText";
import { Typog } from "@/components/builder/BuilderRenderHelpers";

type Props = {
  block: any;
  isCanvas?: boolean;
};

export default function UikitFluentForm({ block, isCanvas }: Props) {
  const rawBlock = (block ?? {}) as any;
  const formId = rawBlock.fluentFormId || "1";

  const marginClass = rawBlock.margin && rawBlock.margin !== "none" ? `uk-margin-${rawBlock.margin}` : "";
  const animationClass = rawBlock.animation && rawBlock.animation !== "none" ? `uk-animation-${rawBlock.animation}` : "";
  const visibilityClass = rawBlock.visibility && rawBlock.visibility !== "always" ? `uk-${rawBlock.visibility}` : "";

  return (
    <div
      id={rawBlock.customId || rawBlock.id}
      className={`shop-builder-column-block shop-builder-column-block--fluent-form ${marginClass} ${animationClass} ${visibilityClass} ${rawBlock.customClass ?? ""}`.trim()}
    >
      {rawBlock.title && (
        <Typog as="h3" typography={rawBlock.typography} className="uk-margin-small-bottom">
          <BuilderLineBreakText text={rawBlock.title} />
        </Typog>
      )}
      <FluentFormClient
        formId={formId}
        title={rawBlock.showFormTitle !== false ? rawBlock.title : undefined}
        previewMode={isCanvas}
      />
    </div>
  );
}
