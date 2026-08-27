"use client";

import React from "react";
import type { BuilderLayoutBlock } from "@/components/dashboard/builderTypes";
import { getUikitHeadingClass, getUikitTextClass } from "@/lib/uikitTokens";
import { typographyProps, typographyRoleClass } from "@/lib/builderTypography";
import { builderLinkTargetProps } from "@/lib/websiteBuilderLinks";
import TypewriterText from "@/components/builder/TypewriterText";
import { decodeHtmlEntities, isRichText, sanitizeHtml } from "@/lib/safeHtml";

type Props = {
  block: BuilderLayoutBlock;
  isCanvas?: boolean;
};

export default function UikitHeading({ block }: Props) {
  const rawBlock = (block ?? {}) as any;
  const Tag = (rawBlock.headingLevel ?? rawBlock.headingElement ?? "h2") as any;
  // `headingSize` is the canonical inspector value. Keep the legacy field as
  // a fallback only; otherwise an old `headingStyle` value can shadow a live
  // Style control update and make the heading appear unresponsive.
  const styleVal = rawBlock.headingSize ?? rawBlock.headingStyle;
  const isImportedYoothemeHeading =
    rawBlock.spacingContract === "yootheme" || String(rawBlock.id ?? "").startsWith("yootheme-");
  // An explicit YOOtheme style equal to the HTML element (for example the
  // imported h4 feature titles) is already represented by the element itself;
  // an omitted style still needs the shared UIkit size token so its line box
  // follows the active global typography.
  const isYoothemeElementStyleHeading =
    isImportedYoothemeHeading &&
    ((styleVal === Tag && typeof Tag === "string" && /^h[1-6]$/.test(Tag)) ||
      (styleVal === undefined && typeof Tag === "string" && /^h[4-6]$/.test(Tag)));
  // YOOtheme's unstyled div titles use the compact muted/meta presentation.
  // Preserve that semantic when an older/local Builder document has lost the
  // explicit text-meta token during normalization.
  const isYoothemeMetaTitle =
    Tag === "div" &&
    (styleVal === undefined || styleVal === "none") &&
    rawBlock.headingColor === "muted";
  const uikitHeadingClass =
    isYoothemeMetaTitle
      ? getUikitTextClass("text-meta")
      : isYoothemeElementStyleHeading
      ? ""
      : styleVal === "none" || styleVal === "inherit"
      ? ""
      : styleVal
      ? styleVal.startsWith("text-")
        ? getUikitTextClass(styleVal)
        : styleVal.startsWith("heading-") || ["h1", "h2", "h3", "h4", "h5", "h6"].includes(styleVal)
        ? `uk-${styleVal}`
        : getUikitHeadingClass(Tag, styleVal)
      : isImportedYoothemeHeading
        ? "uk-margin-remove-top"
        : getUikitHeadingClass(Tag, "default");

  const decorationVal = rawBlock.titleDecoration;
  const decorationClass =
    decorationVal && !["none", "default", "inherit"].includes(decorationVal)
      ? `uk-heading-${decorationVal}`
      : "";

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
  const marginModeVal =
    rawBlock.marginMode ??
    rawBlock.margin ??
    rawBlock.layout?.marginMode ??
    rawBlock.visualStyle?.layout?.marginMode;
  const marginClass =
    marginModeVal && marginModeVal !== "keep-existing" && marginModeVal !== "none" && marginModeVal !== "default"
      ? `uk-margin-${marginModeVal}`
      : marginModeVal === "none"
      ? "uk-margin-remove"
      : "";
  const removeTopClass = (rawBlock.removeTopMargin ?? rawBlock.layout?.removeTopMargin) ? "uk-margin-remove-top" : "";
  const removeBottomClass = (rawBlock.removeBottomMargin ?? rawBlock.layout?.removeBottomMargin) ? "uk-margin-remove-bottom" : "";
  // YOOtheme applies the authored margin to the heading node itself. The
  // Builder shell also carries that spacing contract for sibling flow, so
  // preserve the source node's line-box semantics here as well. In
  // particular, an unqualified imported headline has no heading margin, a
  // small one is 10px, and a div title is vertically marginless.
  const yoothemeTitleMarginClass = isImportedYoothemeHeading
    ? marginModeVal && marginModeVal !== "default" && marginModeVal !== "keep-existing"
      ? marginModeVal === "none"
        ? "uk-margin-remove-vertical"
        : `uk-margin-${marginModeVal}`
      : styleVal
        ? "uk-margin-top uk-margin-remove-bottom"
        : "uk-margin-remove-top uk-margin-bottom"
    : "";

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

  const headingContent = String(rawBlock.headingText ?? rawBlock.title ?? "Build Anything on DevStack");
  const plainHeadingContent = decodeHtmlEntities(headingContent);
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
    yoothemeTitleMarginClass,
    isGradient ? `uikit-text-gradient uikit-text-gradient--${rawBlock.textGradientPreset}` : "",
    rawBlock.showHoverEffect ? "uk-link-heading" : "",
  ]
    .filter(Boolean)
    .join(" ");

  // YOOtheme applies semantic heading colors to the content span, not to the
  // heading element. This matters for `background`: the gradient belongs to
  // the glyphs while the h1–h6 box keeps its normal transparent surface and
  // border geometry. Keep that ownership in the shared renderer so imported
  // and native headings use the same semantic projection.
  const renderHeadingMarkup = () =>
    colorClass
      ? headingHtml !== undefined
        ? <span className={colorClass} dangerouslySetInnerHTML={{ __html: headingHtml }} />
        : <span className={colorClass}>{contentNode}</span>
      : contentNode;

  const customGradientStyle = {
    ...(localTypography.style ?? {}),
    ...(isCustomGradient ? {
        backgroundImage: `linear-gradient(${rawBlock.textGradientCustomAngle ?? 135}deg, ${rawBlock.textGradientCustomStart ?? "#ffffff"}, ${rawBlock.textGradientCustomEnd ?? "#c084fc"})`,
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
      } : {}),
  };

  const contentNode = rawBlock.typewriterEnabled ? (
    <TypewriterText text={plainHeadingContent} phrases={(rawBlock.typewriterPhrases ?? [headingContent]).map((phrase: unknown) => decodeHtmlEntities(String(phrase)))} speed={rawBlock.typewriterSpeed} loop={rawBlock.typewriterLoop !== false} />
  ) : headingHtml !== undefined ? null : (
    plainHeadingContent
  );

  const headingProps = { className: titleClassName, style: customGradientStyle };
  const uncoloredHtml = headingHtml !== undefined && !colorClass;

  return (
    <div
      id={rawBlock.customId || rawBlock.id}
      className={`shop-builder-column-block shop-builder-column-block--heading ${marginClass} ${removeTopClass} ${removeBottomClass} ${maxWidthClass} ${blockAlignClass} ${animationClass} ${visibilityClass} ${rawBlock.customClass ?? ""}`.trim()}
    >
      {uncoloredHtml && !linkUrl ? (
        <Tag {...headingProps} dangerouslySetInnerHTML={{ __html: headingHtml }} />
      ) : (
        <Tag {...headingProps}>
          {linkUrl ? (
            uncoloredHtml ? (
              <a
                href={linkUrl}
                {...builderLinkTargetProps(linkTarget)}
                className="uk-link-reset"
                dangerouslySetInnerHTML={{ __html: headingHtml }}
              />
            ) : (
              <a
                href={linkUrl}
                {...builderLinkTargetProps(linkTarget)}
                className="uk-link-reset"
              >
                {renderHeadingMarkup()}
              </a>
            )
          ) : (
            renderHeadingMarkup()
          )}
        </Tag>
      )}
    </div>
  );
}
