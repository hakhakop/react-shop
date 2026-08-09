"use client";

import React from "react";
import type { BuilderLayoutBlock } from "@/components/dashboard/builderTypes";
import { getUikitHeadingClass, getUikitTextClass } from "@/lib/uikitTokens";
import { typographyProps, typographyRoleClass } from "@/lib/builderTypography";
import { builderLinkTargetProps } from "@/lib/websiteBuilderLinks";
import TypewriterText from "@/components/builder/TypewriterText";
import { isRichText, sanitizeHtml } from "@/lib/safeHtml";

type Props = {
  block: BuilderLayoutBlock;
  isCanvas?: boolean;
};

export default function UikitHeading({ block }: Props) {
  const rawBlock = (block ?? {}) as any;
  const Tag = (rawBlock.headingLevel ?? rawBlock.headingElement ?? "h2") as any;
  const styleVal = rawBlock.headingStyle ?? rawBlock.headingSize;
  const uikitHeadingClass =
    styleVal && styleVal !== "none" && styleVal !== "inherit"
      ? styleVal.startsWith("text-")
        ? getUikitTextClass(styleVal)
        : styleVal.startsWith("heading-") || ["h1", "h2", "h3", "h4", "h5", "h6"].includes(styleVal)
        ? `uk-${styleVal}`
        : getUikitHeadingClass(Tag, styleVal)
      : getUikitHeadingClass(Tag, "default");

  const decorationClass = rawBlock.titleDecoration ? `uk-heading-${rawBlock.titleDecoration}` : "";

  // Alignment
  const textAlignVal = rawBlock.layout?.textAlign ?? rawBlock.textAlign ?? rawBlock.headingAlign;
  const alignClass = textAlignVal ? `uk-text-${textAlignVal}` : "";

  // Color
  const headingColorVal = rawBlock.headingColor ?? rawBlock.color;
  const colorClass =
    headingColorVal && headingColorVal !== "none" && headingColorVal !== "default"
      ? headingColorVal.startsWith("uk-text-")
        ? headingColorVal
        : `uk-text-${headingColorVal}`
      : "";

  // Typography Role
  const typographyRole = rawBlock.headingTypographyRole ?? rawBlock.titleTypographyRole;
  const roleClass = typographyRoleClass(typographyRole);
  // Local typography is intentionally resolved here, in the shared Heading
  // renderer used by the canvas and published frontend. Global/component
  // values continue to come from the root UIkit variables when absent.
  const localTypography = typographyProps(rawBlock.typography, "title");

  // Margin
  const marginModeVal = rawBlock.marginMode ?? rawBlock.margin ?? rawBlock.layout?.marginMode;
  const marginClass =
    marginModeVal && marginModeVal !== "keep-existing" && marginModeVal !== "none" && marginModeVal !== "default"
      ? `uk-margin-${marginModeVal}`
      : marginModeVal === "none"
      ? "uk-margin-remove"
      : "";
  const removeTopClass = (rawBlock.removeTopMargin ?? rawBlock.layout?.removeTopMargin) ? "uk-margin-remove-top" : "";
  const removeBottomClass = (rawBlock.removeBottomMargin ?? rawBlock.layout?.removeBottomMargin) ? "uk-margin-remove-bottom" : "";

  // Max Width & Block Align
  const maxWidthVal = rawBlock.maxWidth ?? rawBlock.visualStyle?.effects?.maxWidth ?? rawBlock.layout?.maxWidth;
  const maxWidthBpVal = rawBlock.maxWidthBreakpoint ?? rawBlock.layout?.maxWidthBreakpoint;
  const maxWidthClass =
    maxWidthVal && maxWidthVal !== "none"
      ? maxWidthBpVal && maxWidthBpVal !== "always"
        ? `uk-width-${maxWidthVal}@${maxWidthBpVal}`
        : `uk-width-${maxWidthVal}`
      : "";
  const blockAlignVal = rawBlock.elementAlign ?? rawBlock.blockAlign ?? rawBlock.layout?.blockAlign;
  const blockAlignClass =
    blockAlignVal && blockAlignVal !== "none"
      ? blockAlignVal === "center"
        ? "uk-margin-auto"
        : blockAlignVal === "right"
        ? "uk-margin-auto-left"
        : ""
      : "";

  // Animation & Visibility
  const animPreset = typeof rawBlock.animation === "string" ? rawBlock.animation : rawBlock.animation?.preset ?? rawBlock.layout?.animation;
  const animationClass = animPreset && animPreset !== "none" && animPreset !== "inherit" ? `uk-animation-${animPreset}` : "";
  const visibilityVal = rawBlock.visibilityMode ?? rawBlock.visibility ?? rawBlock.layout?.visibilityMode;
  const visibilityClass = visibilityVal && visibilityVal !== "always" ? `uk-${visibilityVal}` : "";

  // Text Gradient
  const isGradient = rawBlock.textGradientPreset && rawBlock.textGradientPreset !== "none";
  const isCustomGradient = rawBlock.textGradientPreset === "custom";

  const linkUrl = rawBlock.buttonUrl ?? rawBlock.imageLinkUrl;
  const linkTarget = rawBlock.buttonTarget ?? rawBlock.imageLinkTarget ?? "_self";

  const headingContent = rawBlock.headingText ?? rawBlock.title ?? "Build Anything on DevStack";
  const normalizedHeadingContent = headingContent.replace(/<\/br\s*>/gi, "<br>");
  const headingHtml = isRichText(normalizedHeadingContent)
    ? sanitizeHtml(normalizedHeadingContent, { FORBID_ATTR: ["style"] })
    : undefined;

  const titleClassName = [
    "shop-builder-title",
    uikitHeadingClass,
    decorationClass,
    roleClass,
    localTypography.className,
    alignClass,
    colorClass,
    isGradient ? `uikit-text-gradient uikit-text-gradient--${rawBlock.textGradientPreset}` : "",
    rawBlock.showHoverEffect ? "uk-link-heading" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const customGradientStyle = {
    ...(localTypography.style ?? {}),
    ...(isCustomGradient ? {
        backgroundImage: `linear-gradient(${rawBlock.textGradientCustomAngle ?? 135}deg, ${rawBlock.textGradientCustomStart ?? "#ffffff"}, ${rawBlock.textGradientCustomEnd ?? "#c084fc"})`,
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
      } : {}),
  };

  const contentNode = rawBlock.typewriterEnabled ? (
    <TypewriterText text={headingContent} phrases={rawBlock.typewriterPhrases ?? [headingContent]} speed={rawBlock.typewriterSpeed} loop={rawBlock.typewriterLoop !== false} />
  ) : headingHtml !== undefined ? null : (
    headingContent
  );

  const innerNode = linkUrl ? (
    <a
      href={linkUrl}
      {...builderLinkTargetProps(linkTarget)}
      className="uk-link-reset"
      {...(headingHtml !== undefined ? { dangerouslySetInnerHTML: { __html: headingHtml } } : {})}
    >
      {headingHtml === undefined ? contentNode : null}
    </a>
  ) : headingHtml !== undefined ? null : (
    contentNode
  );

  return (
    <div
      id={rawBlock.customId || rawBlock.id}
      className={`shop-builder-column-block shop-builder-column-block--heading ${marginClass} ${removeTopClass} ${removeBottomClass} ${maxWidthClass} ${blockAlignClass} ${animationClass} ${visibilityClass} ${rawBlock.customClass ?? ""}`.trim()}
    >
      {headingHtml !== undefined && !linkUrl ? (
        <Tag className={titleClassName} style={customGradientStyle} dangerouslySetInnerHTML={{ __html: headingHtml }} />
      ) : (
        <Tag className={titleClassName} style={customGradientStyle}>
          {innerNode}
        </Tag>
      )}
    </div>
  );
}
