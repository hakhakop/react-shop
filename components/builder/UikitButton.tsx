"use client";

import type { BuilderLayoutBlock } from "@/components/dashboard/builderTypes";
import { getUikitButtonClass } from "@/lib/uikitTokens";
import { builderLinkTargetProps } from "@/lib/websiteBuilderLinks";

type Props = {
  block: any;
};

export default function UikitButton({ block }: Props) {
  const rawBlock = (block ?? {}) as any;
  const marginClass = rawBlock.margin && rawBlock.margin !== "none" ? `uk-margin-${rawBlock.margin}` : "";
  const textAlignClass = rawBlock.textAlign && rawBlock.textAlign !== "none" ? `uk-text-${rawBlock.textAlign}` : "";
  const animationClass = rawBlock.animation && rawBlock.animation !== "none" ? `uk-animation-${rawBlock.animation}` : "";
  const visibilityClass = rawBlock.visibility && rawBlock.visibility !== "always" ? `uk-${rawBlock.visibility}` : "";

  const alignFlexClass =
    rawBlock.buttonAlign === "center" || rawBlock.textAlign === "center"
      ? "uk-flex-center"
      : rawBlock.buttonAlign === "right" || rawBlock.textAlign === "right"
      ? "uk-flex-right"
      : "uk-flex-left";

  const isStacked = rawBlock.buttonsLayout === "stacked";
  const buttonsList = rawBlock.buttons ?? [];

  return (
    <div
      id={rawBlock.customId || rawBlock.id}
      className={`shop-builder-column-block shop-builder-column-block--button ${marginClass} ${textAlignClass} ${animationClass} ${visibilityClass} ${rawBlock.customClass ?? ""}`.trim()}
    >
      <div
        className={`uk-flex uk-flex-wrap ${alignFlexClass} ${isStacked ? "uk-flex-column" : "uk-flex-middle"}`.trim()}
        style={{ gap: rawBlock.buttonGap || "0.75rem" }}
      >
        {rawBlock.buttonLabel && (
          <a
            className={getUikitButtonClass(rawBlock.buttonStyle ?? "primary", rawBlock.size)}
            href={rawBlock.buttonUrl || "#"}
            {...builderLinkTargetProps(rawBlock.buttonTarget)}
          >
            {rawBlock.buttonLabel}
          </a>
        )}
        {buttonsList.map((btn: any, btnIdx: number) => (
          <a
            key={btn.id ?? btnIdx}
            className={getUikitButtonClass(btn.style ?? rawBlock.buttonStyle ?? "primary", btn.size ?? rawBlock.size)}
            href={btn.url || "#"}
            {...builderLinkTargetProps(btn.target)}
          >
            {btn.label || btn.text || `Button ${btnIdx + 1}`}
          </a>
        ))}
      </div>
    </div>
  );
}
