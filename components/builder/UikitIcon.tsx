"use client";

import type { BuilderLayoutBlock } from "@/components/dashboard/builderTypes";
import { builderLinkTargetProps } from "@/lib/websiteBuilderLinks";
import { WebPagesIcon } from "@/components/builder/WebPagesIcon";

type Props = {
  block: any;
};

export default function UikitIcon({ block }: Props) {
  const rawBlock = (block ?? {}) as any;
  const iconName = rawBlock.iconName ?? rawBlock.icon ?? "star";
  const iconSize = rawBlock.iconSize ?? 32;
  const colorScheme = rawBlock.iconColorScheme ?? "primary";
  const linkUrl = rawBlock.buttonUrl ?? rawBlock.imageLinkUrl;
  const linkTarget = rawBlock.buttonTarget ?? rawBlock.imageLinkTarget ?? "_self";

  const marginClass = rawBlock.margin && rawBlock.margin !== "none" ? `uk-margin-${rawBlock.margin}` : "";
  const textAlignClass = rawBlock.textAlign && rawBlock.textAlign !== "none" ? `uk-text-${rawBlock.textAlign}` : "";
  const animationClass = rawBlock.animation && rawBlock.animation !== "none" ? `uk-animation-${rawBlock.animation}` : "";
  const visibilityClass = rawBlock.visibility && rawBlock.visibility !== "always" ? `uk-${rawBlock.visibility}` : "";

  const iconContent = (
    <span
      className={`shop-builder-icon-wrapper uk-text-${colorScheme}`.trim()}
      style={{ display: "inline-flex", alignItems: "center" }}
    >
      <WebPagesIcon name={iconName as any} size={iconSize} />
    </span>
  );

  return (
    <div
      id={rawBlock.customId || rawBlock.id}
      className={`shop-builder-column-block shop-builder-column-block--icon ${marginClass} ${textAlignClass} ${animationClass} ${visibilityClass} ${rawBlock.customClass ?? ""}`.trim()}
      style={{ textAlign: rawBlock.textAlign ?? "left" }}
    >
      {linkUrl ? (
        <a href={linkUrl} {...builderLinkTargetProps(linkTarget)}>
          {iconContent}
        </a>
      ) : (
        iconContent
      )}
    </div>
  );
}
