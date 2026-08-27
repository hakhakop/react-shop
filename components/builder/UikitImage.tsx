"use client";

import type { BuilderLayoutBlock } from "@/components/dashboard/builderTypes";
import type { BuilderShellSettings } from "@/lib/builderShell";
import { resolveAppearanceValue } from "@/lib/globalStyleTokens";
import {
  resolveUikitImageSemantics,
  getUikitImageStyle,
  getUikitImageAttributes,
  getUikitImageClass,
  getUikitSvgColor,
  getUikitSvgColorClass,
  getUikitHeadingClass,
  getUikitTextClass,
  getUikitMarginClass,
  getUikitButtonClass,
} from "@/lib/uikitTokens";
import { typographyRoleClass } from "@/lib/builderTypography";
import { builderLinkTargetProps } from "@/lib/websiteBuilderLinks";
import { decodeHtmlEntities, sanitizeHtml } from "@/lib/safeHtml";
import { Image as ImageIcon } from "lucide-react";
import Image from "next/image";
import UikitStylableSvg from "@/components/builder/UikitStylableSvg";

type Props = {
  block: any;
  isCanvas?: boolean;
  shellSettings?: Partial<BuilderShellSettings>;
};

export default function UikitImage({ block, isCanvas, shellSettings }: Props) {
  const rawBlock = (block ?? {}) as any;
  const primaryImageUrl = rawBlock.imageUrl?.trim() || "";
  const hoverImageUrl = rawBlock.hoverImageUrl?.trim() || "";
  const primaryVideoUrl = rawBlock.videoUrl?.trim() || "";
  const hoverVideoUrl = rawBlock.hoverVideoUrl?.trim() || "";
  const hasPrimaryImage = Boolean(primaryImageUrl);
  const hasHoverImage = Boolean(hoverImageUrl);
  const hasPrimaryVideo = Boolean(primaryVideoUrl);
  const hasHoverVideo = Boolean(hoverVideoUrl);
  const isImportedYoothemeImage = rawBlock.spacingContract === "yootheme" || String(rawBlock.id ?? "").startsWith("yootheme-");
  const isImportedYoothemeOverlay = isImportedYoothemeImage && rawBlock.kind === "overlay";
  // YOOtheme exports visible text fields as HTML entities. Decode at the
  // renderer boundary as well as during import so legacy saved documents are
  // repaired without requiring a re-import.
  const imageAlt = decodeHtmlEntities(String(rawBlock.imageAlt ?? ""));
  const overlayTitle = decodeHtmlEntities(String(rawBlock.title ?? ""));
  const overlayMeta = decodeHtmlEntities(String(rawBlock.meta ?? ""));
  const overlayLinkText = decodeHtmlEntities(String(rawBlock.linkText ?? ""));
  const overlayBody = rawBlock.body ? sanitizeHtml(String(rawBlock.body)) : "";
  const overlayAriaLabel = decodeHtmlEntities(String(rawBlock.linkAriaLabel ?? ""));
  const imageCaption = decodeHtmlEntities(String(rawBlock.imageCaption ?? ""));
  const resolveString = (
    local: unknown,
    global: string | undefined,
    componentDefault: string,
  ) =>
    resolveAppearanceValue({
      local: typeof local === "string" ? local : undefined,
      global,
      componentDefault,
    }).value;
  const localImageShape =
    typeof rawBlock.imageShape === "string"
      ? rawBlock.imageShape
      : ["rounded", "circle", "pill"].includes(rawBlock.imageBorder)
        ? rawBlock.imageBorder
        : undefined;
  // Pre-Phase-5 imports wrote numeric YOOtheme image_width only to the
  // legacy max-width alias and stored `auto` here. Promote that value at the
  // canonical media boundary so the media composition box, not just its img,
  // retains the source width and can overflow a positioned column.
  const canonicalImageWidth =
    rawBlock.imageWidth && rawBlock.imageWidth !== "auto"
      ? rawBlock.imageWidth
      : typeof rawBlock.imageMaxWidth === "number" && rawBlock.imageMaxWidth > 0
        ? String(rawBlock.imageMaxWidth)
        : rawBlock.imageWidth;
  const legacyIntrinsicWidth = Number.parseFloat(String(canonicalImageWidth ?? ""));
  const legacyIntrinsicHeight = Number.parseFloat(String(rawBlock.imageHeight ?? ""));
  const intrinsicWidth = Number(rawBlock.imageIntrinsicWidth) || (isImportedYoothemeOverlay ? legacyIntrinsicWidth : 0);
  const intrinsicHeight = Number(rawBlock.imageIntrinsicHeight) || (isImportedYoothemeOverlay ? legacyIntrinsicHeight : 0);
  const intrinsicAspectRatio = intrinsicWidth > 0 && intrinsicHeight > 0 ? `${intrinsicWidth} / ${intrinsicHeight}` : undefined;
  const resolvedImageBlock = {
    ...rawBlock,
    imageRatio: resolveString(rawBlock.imageRatio, shellSettings?.imageDefaultRatio, "natural"),
    imageFit: isImportedYoothemeImage && rawBlock.kind === "overlay" && rawBlock.imageHeight
      ? resolveString(rawBlock.imageFit, undefined, "cover")
      : resolveString(rawBlock.imageFit, shellSettings?.imageDefaultFit, "natural"),
    imageShape: resolveString(localImageShape, shellSettings?.imageDefaultBorder, "none"),
    imageShadow: resolveString(rawBlock.imageShadow, shellSettings?.imageDefaultShadow, "none"),
    imageWidth: canonicalImageWidth,
    imageHeight: isImportedYoothemeOverlay ? undefined : rawBlock.imageHeight,
    imageLoading: resolveString(rawBlock.imageLoading, shellSettings?.imageDefaultLoading, "lazy"),
  };
  const imageSemantics = resolveUikitImageSemantics(resolvedImageBlock);
  const imageLoading =
    resolvedImageBlock.imageLoading === "eager" ? "eager" : "lazy";
  const imageStyle = getUikitImageStyle(imageSemantics);
  const mediaObjectFit = isImportedYoothemeOverlay
    ? rawBlock.imageFit === "contain" || rawBlock.imageFit === "fill"
      ? rawBlock.imageFit
      : "cover"
    : imageStyle.objectFit;
  const mediaAspectRatio = intrinsicAspectRatio ?? imageStyle.aspectRatio;
  const mediaMinHeight = rawBlock.imageMinHeight
    ? /^\d+(?:\.\d+)?$/.test(String(rawBlock.imageMinHeight))
      ? `${rawBlock.imageMinHeight}px`
      : String(rawBlock.imageMinHeight)
    : undefined;
  const hasMediaFrame = Boolean(mediaAspectRatio || imageStyle.height || mediaMinHeight);
  const imageAuthoredMaxWidth = imageStyle.maxWidth ?? (rawBlock.imageMaxWidth ? `${rawBlock.imageMaxWidth}px` : undefined);
  const generalPosition = rawBlock.visualStyle?.layout?.position;
  const allowsPositionedOverflow = generalPosition === "absolute" || generalPosition === "fixed";
  const imageAttributes = getUikitImageAttributes(imageSemantics);
  const imageClass = `${getUikitImageClass(imageSemantics)} el-image`.trim();
  const imageAlignmentClass = imageSemantics.alignment &&
    ["left", "center", "right"].includes(imageSemantics.alignment)
    ? `uk-align-${imageSemantics.alignment}`
    : "";
  const isBottomShadow =
    imageSemantics.shadow === "bottom" ||
    rawBlock.imageShadow === "bottom" ||
    rawBlock.imageBoxShadow === "bottom" ||
    rawBlock.imageBoxDecoration === "shadow" ||
    rawBlock.boxDecoration === "shadow" ||
    rawBlock.visualStyle?.effects?.shadow === "bottom" ||
    rawBlock.visualStyle?.effects?.boxDecoration === "shadow";
  const imageDecorationClass =
    rawBlock.imageBoxDecoration &&
    rawBlock.imageBoxDecoration !== "none" &&
    rawBlock.imageBoxDecoration !== "shadow"
      ? `tm-box-decoration-${rawBlock.imageBoxDecoration} uk-inline`
      : "";
  const imageHoverShadow = rawBlock.imageHoverBoxShadow ?? rawBlock.imageHoverShadow;
  const imageHoverShadowClass =
    imageHoverShadow && imageHoverShadow !== "none"
      ? `uk-box-shadow-hover-${imageHoverShadow}`
      : "";
  const isPlaceholder = !hasPrimaryImage && !hasHoverImage && !hasPrimaryVideo && !hasHoverVideo;
  // Framed media deliberately clips cover/ratio content. An explicit element
  // Advanced stylesheet may intentionally move `.el-image` outside that frame
  // (as the YOOtheme play control does), so only that opted-in case may paint
  // beyond the media box.
  const hasAdvancedCss = Boolean(rawBlock.visualStyle?.customCss ?? rawBlock.customCss);
  // A width-only YOOtheme image has no authored frame. Rendering it through
  // Next Image's fixed 1200×800 placeholder dimensions creates a synthetic
  // 3:2 ratio before the real asset can define its natural geometry.
  const usesIntrinsicGeometry = !imageStyle.aspectRatio && !imageStyle.height;
  const preserveIntrinsicImageSize =
    !imageStyle.width && !imageStyle.height && !imageStyle.aspectRatio;
  const isStylableSvg = rawBlock.imageSvgInline === true && /\.svg(?:[?#].*)?$/i.test(primaryImageUrl);
  // YOOtheme only turns Image sizing into a frame when width, height, or
  // ratio is authored. A site-level Image-fit default must not turn an
  // otherwise un-sized inline SVG into width:100% / height:100% media.
  // Keep the source SVG's intrinsic root/viewBox geometry in that case.
  const preserveIntrinsicSvgSize = isStylableSvg
    && !imageStyle.width
    && !imageStyle.height
    && !imageStyle.aspectRatio;
  const svgColor = getUikitSvgColor(rawBlock.imageSvgColor);
  const svgColorClass = getUikitSvgColorClass(rawBlock.imageSvgColor);
  const imageTextColorClass = rawBlock.imageTextColor && rawBlock.imageTextColor !== "none" ? `uk-text-${rawBlock.imageTextColor}` : "";
  const imageInverseClass = rawBlock.imageInverse === true ? "uk-light" : "";
  const imageSvgAnimateClass = rawBlock.imageSvgAnimate === true ? "uk-animation-stroke" : "";
  const usesContextualSvgColor = Boolean(svgColorClass);
  const fallbackImage = usesIntrinsicGeometry ? (
    <img className={imageClass} src={primaryImageUrl} alt={imageAlt} loading={imageLoading} {...imageAttributes} style={{ width: preserveIntrinsicImageSize ? "auto" : "100%", maxWidth: preserveIntrinsicImageSize ? "100%" : undefined, height: hasMediaFrame ? "100%" : "auto", objectFit: mediaObjectFit as any, objectPosition: imageStyle.objectPosition }} />
  ) : (
    <Image className={imageClass} src={primaryImageUrl} alt={imageAlt} width={1200} height={800} loading={imageLoading} {...imageAttributes} style={{ width: "100%", height: hasMediaFrame ? "100%" : "auto", objectFit: mediaObjectFit as any, objectPosition: imageStyle.objectPosition, ...(imageStyle.position ? { position: imageStyle.position as any, inset: imageStyle.inset } : {}) }} />
  );
  const renderImage = () => isStylableSvg ? (
    <UikitStylableSvg
      src={primaryImageUrl}
      alt={imageAlt}
      className={`${imageClass} ${svgColorClass} ${imageSvgAnimateClass}`.trim()}
      color={usesContextualSvgColor ? undefined : svgColor}
      fit={preserveIntrinsicSvgSize
        ? "contain"
        : imageSemantics.fit === "cover" || imageSemantics.fit === "fill"
          ? imageSemantics.fit
          : "contain"}
      loading={imageLoading}
      preserveIntrinsicSize={preserveIntrinsicSvgSize}
      fallback={fallbackImage}
      style={{
        width: preserveIntrinsicSvgSize ? undefined : "100%",
        height: imageStyle.height || imageStyle.aspectRatio ? "100%" : preserveIntrinsicSvgSize ? undefined : "auto",
        aspectRatio: mediaAspectRatio,
        position: imageStyle.position,
        inset: imageStyle.inset,
      }}
    />
  ) : fallbackImage;

  const marginClass = rawBlock.margin && rawBlock.margin !== "none" ? `uk-margin-${rawBlock.margin}` : "";
  const animationClass = rawBlock.animation && rawBlock.animation !== "none" ? `uk-animation-${rawBlock.animation}` : "";
  const visibilityClass = rawBlock.visibility && rawBlock.visibility !== "always" ? `uk-${rawBlock.visibility}` : "";
  const hasOverlayContent = Boolean(rawBlock.overlayMode || rawBlock.overlayStyle || overlayTitle || overlayMeta || overlayBody || overlayLinkText);
  const overlayPositionClass = rawBlock.overlayPosition && rawBlock.overlayPosition !== "center"
    ? `uk-position-${String(rawBlock.overlayPosition).replaceAll("-", "-")}`
    : "uk-position-center";
  const overlayStyleClass = rawBlock.overlayStyle && rawBlock.overlayStyle !== "none"
    ? `uk-${rawBlock.overlayStyle}`
    : "";
  const overlayPaddingClass = rawBlock.overlayPadding && rawBlock.overlayPadding !== "default"
    ? `uk-padding-${rawBlock.overlayPadding}`
    : "uk-padding";
  const overlayMarginClass = rawBlock.overlayMargin && rawBlock.overlayMargin !== "none"
    ? `uk-margin-${rawBlock.overlayMargin}`
    : "";
  const overlayTransitionClass = rawBlock.overlayHover
    ? rawBlock.overlayTransition && rawBlock.overlayTransition !== "fade"
      ? `uk-transition-${rawBlock.overlayTransition}`
      : "uk-transition-fade"
    : "";
  const overlayTextClass = rawBlock.overlayTextColor && rawBlock.overlayTextColor !== "none"
    ? `uk-text-${rawBlock.overlayTextColor}`
    : "";
  const textUtilityClass = (value: unknown) => {
    if (typeof value !== "string") return "";
    const normalized = value.trim().toLowerCase();
    if (!normalized || ["none", "default", "inherit"].includes(normalized)) return "";
    return normalized.startsWith("uk-text-") ? normalized : `uk-text-${normalized}`;
  };
  const overlayTextAlignClass = ["left", "center", "right", "justify"].includes(rawBlock.textAlign)
    ? `uk-text-${rawBlock.textAlign}`
    : "";
  const titleClass = rawBlock.titleStyle && rawBlock.titleStyle !== "none" ? `uk-${rawBlock.titleStyle}` : "";
  const metaClass = rawBlock.metaStyle && rawBlock.metaStyle !== "none" ? `uk-${rawBlock.metaStyle}` : "uk-text-meta";
  const contentClass = rawBlock.contentStyle && rawBlock.contentStyle !== "none" ? `uk-${rawBlock.contentStyle}` : "";
  const titleDecorationClass = rawBlock.titleDecoration && !["none", "default", "inherit"].includes(rawBlock.titleDecoration)
    ? `uk-heading-${rawBlock.titleDecoration}`
    : "";
  const overlayTitleClass = [
    titleClass || getUikitHeadingClass(rawBlock.titleElement || "h3", rawBlock.titleStyle),
    typographyRoleClass(rawBlock.titleTypographyRole),
    textUtilityClass(rawBlock.titleColor),
    titleDecorationClass,
  ].filter(Boolean).join(" ");
  const overlayMetaClass = [
    metaClass || getUikitTextClass("meta"),
    typographyRoleClass(rawBlock.metaTypographyRole),
    textUtilityClass(rawBlock.metaColor),
  ].filter(Boolean).join(" ");
  const overlayContentClass = [contentClass, typographyRoleClass(rawBlock.contentTypographyRole)].filter(Boolean).join(" ");
  const OverlayTitleElement = ["h1", "h2", "h3", "h4", "h5", "h6"].includes(rawBlock.titleElement) ? rawBlock.titleElement : "div";
  const OverlayMetaElement = ["h1", "h2", "h3", "h4", "h5", "h6", "div", "span", "p"].includes(rawBlock.metaElement) ? rawBlock.metaElement : "div";
  const OverlayElement = ["div", "address", "article", "aside", "footer", "header", "hgroup", "nav", "section"].includes(rawBlock.htmlElement) ? rawBlock.htmlElement : "div";
  const overlayItemMarginClass = (value: unknown, importedDefault: boolean) => {
    if (!importedDefault) return getUikitMarginClass(typeof value === "string" ? value : undefined);
    const normalized = String(value ?? "").trim().toLowerCase();
    if (normalized === "none" || normalized === "remove" || normalized === "remove-vertical") {
      return "uk-margin-remove-top uk-margin-remove-bottom";
    }
    if (["small", "medium", "large", "xlarge"].includes(normalized)) {
      return `uk-margin-${normalized}-top uk-margin-remove-bottom`;
    }
    return "uk-margin-top uk-margin-remove-bottom";
  };
  const importedOverlayItem = isImportedYoothemeOverlay;
  const titleMarginClass = overlayItemMarginClass(rawBlock.titleMarginTop, importedOverlayItem);
  const metaMarginClass = overlayItemMarginClass(rawBlock.metaMarginTop, importedOverlayItem);
  const contentMarginClass = overlayItemMarginClass(rawBlock.contentMarginTop, importedOverlayItem);
  const linkMarginClass = overlayItemMarginClass(rawBlock.linkMarginTop, importedOverlayItem);
  const transitionClass = (value: unknown) => value && value !== "none" ? `uk-transition-${String(value)}` : "";
  const titleTransitionClass = rawBlock.overlayHover ? transitionClass(rawBlock.titleTransition) : "";
  const metaTransitionClass = rawBlock.overlayHover ? transitionClass(rawBlock.metaTransition) : "";
  const contentTransitionClass = rawBlock.overlayHover ? transitionClass(rawBlock.contentTransition) : "";
  const linkTransitionClass = rawBlock.overlayHover ? transitionClass(rawBlock.linkTransition) : "";
  const titleHoverClass = rawBlock.titleHoverStyle === "heading-link" ? "uk-link-heading" : rawBlock.titleHoverStyle === "default-link" ? "uk-link-reset" : "";
  const hoverImageTransitionClass = rawBlock.imageTransition === "scale-up"
    ? "uk-transition-scale-up"
    : rawBlock.imageTransition === "scale-down"
      ? "uk-transition-scale-down"
      : "uk-transition-fade";

  if (isPlaceholder && !isCanvas) {
    return null;
  }

  return (
    <OverlayElement
      id={rawBlock.customId || rawBlock.id}
      className={`shop-builder-column-block shop-builder-column-block--image ${isImportedYoothemeImage ? "shop-builder-column-block--image-yootheme" : ""} ${marginClass} ${animationClass} ${visibilityClass} ${rawBlock.customClass ?? ""}`.trim()}
      style={{ display: "block" }}
    >
      <figure
        className={`shop-builder-image-figure ${isBottomShadow ? "uk-box-shadow-bottom" : ""} ${imageAlignmentClass} ${imageTextColorClass} ${imageInverseClass}`.trim()}
        style={{
          display: "inline-block",
          maxWidth: allowsPositionedOverflow
            ? imageAuthoredMaxWidth
            : imageAuthoredMaxWidth
              ? `min(100%, ${imageAuthoredMaxWidth})`
              : "100%",
          width: allowsPositionedOverflow
            ? imageStyle.width ?? (!imageStyle.aspectRatio ? "fit-content" : undefined)
            : imageStyle.width
              ? `min(${imageStyle.width}, 100%)`
              : (!imageStyle.aspectRatio ? "fit-content" : undefined),
          height: rawBlock.imageHeight === "viewport" ? "100vh" : rawBlock.imageHeight === "column" ? "100%" : isImportedYoothemeOverlay ? undefined : imageStyle.height,
          minHeight: mediaMinHeight,
        }}
      >
        <div
          className={`shop-builder-image-media ${imageDecorationClass} ${isBottomShadow ? "uk-box-shadow-bottom" : ""} ${imageHoverShadowClass} ${hasAdvancedCss ? "has-advanced-css" : ""} ${rawBlock.overlayHover || hasHoverImage || hasHoverVideo ? "uk-transition-toggle" : ""} ${mediaAspectRatio ? "uk-cover-container" : ""} ${
            isPlaceholder ? "is-empty" : ""
          }`.trim()}
          data-image-ratio={mediaAspectRatio ? "true" : undefined}
          style={{
            aspectRatio: mediaAspectRatio,
            width: "100%",
            height: rawBlock.imageHeight === "viewport" ? "100vh" : rawBlock.imageHeight === "column" ? "100%" : isImportedYoothemeOverlay ? undefined : imageStyle.height,
            minHeight: mediaMinHeight,
            position: hasOverlayContent || hasHoverImage || mediaAspectRatio ? "relative" : undefined,
          }}
        >
          {!isPlaceholder ? (
            <>
              {hasPrimaryImage && rawBlock.imageLinkUrl ? (
                <a className="el-link" href={rawBlock.imageLinkUrl} {...builderLinkTargetProps(rawBlock.imageLinkTarget)}>
                  {renderImage()}
                </a>
              ) : hasPrimaryImage ? (
                renderImage()
              ) : null}
              {hasPrimaryVideo && (
                <video className="shop-builder-image-primary-video uk-position-cover" src={primaryVideoUrl} autoPlay muted loop playsInline aria-label={imageAlt || undefined} style={{ width: "100%", height: "100%", objectFit: mediaObjectFit as any, objectPosition: imageStyle.objectPosition }} />
              )}
              {hasHoverImage && (
                <img
                  className={`shop-builder-image-hover-media uk-position-cover ${hoverImageTransitionClass}`}
                  src={hoverImageUrl}
                  alt=""
                  aria-hidden="true"
                  loading="lazy"
                  style={{ objectFit: mediaObjectFit as any, objectPosition: rawBlock.imageHoverFocalPoint ?? imageStyle.objectPosition }}
                />
              )}
              {hasHoverVideo && (
                <video className={`shop-builder-image-hover-video uk-position-cover ${hoverImageTransitionClass}`} src={hoverVideoUrl} autoPlay muted loop playsInline aria-hidden="true" style={{ width: "100%", height: "100%", objectFit: mediaObjectFit as any, objectPosition: rawBlock.imageHoverFocalPoint ?? imageStyle.objectPosition }} />
              )}
              {hasOverlayContent && (
                <div
                  className={`shop-builder-image-overlay ${rawBlock.overlayMode === "caption" ? "shop-builder-image-overlay--caption" : "uk-position-cover"}`.trim()}
                  data-overlay-mode={rawBlock.overlayMode ?? "cover"}
                  data-overlay-animate-background={rawBlock.overlayAnimateBackground ? "true" : undefined}
                >
                  <div className={`shop-builder-image-overlay-background uk-position-cover ${overlayStyleClass} ${overlayTransitionClass}`.trim()} />
                  <div className={`shop-builder-image-overlay-content uk-position-absolute ${overlayPositionClass} ${overlayPaddingClass} ${overlayMarginClass} ${overlayTextClass} ${overlayTextAlignClass} ${rawBlock.overlayExpandContent ? "uk-width-1-1" : ""} ${rawBlock.overlayMaxWidth && rawBlock.overlayMaxWidth !== "none" ? `uk-width-${rawBlock.overlayMaxWidth}` : ""}`.trim()}>
                    {overlayMeta && rawBlock.metaAlignment === "above-title" && <OverlayMetaElement className={`shop-builder-image-overlay-meta el-meta ${overlayMetaClass} ${metaTransitionClass} ${metaMarginClass}`.trim()}>{overlayMeta}</OverlayMetaElement>}
                    {overlayTitle && (rawBlock.titleLink && rawBlock.imageLinkUrl
                      ? <OverlayTitleElement className={`shop-builder-image-overlay-title el-title ${overlayTitleClass} ${titleTransitionClass} ${titleHoverClass} ${titleMarginClass}`.trim()}><a href={rawBlock.imageLinkUrl} {...builderLinkTargetProps(rawBlock.imageLinkTarget)}>{overlayTitle}</a></OverlayTitleElement>
                      : <OverlayTitleElement className={`shop-builder-image-overlay-title el-title ${overlayTitleClass} ${titleTransitionClass} ${titleHoverClass} ${titleMarginClass}`.trim()}>{overlayTitle}</OverlayTitleElement>)}
                    {overlayMeta && rawBlock.metaAlignment !== "above-title" && rawBlock.metaAlignment !== "below-content" && <OverlayMetaElement className={`shop-builder-image-overlay-meta el-meta ${overlayMetaClass} ${metaTransitionClass} ${metaMarginClass}`.trim()}>{overlayMeta}</OverlayMetaElement>}
                    {overlayBody && <div className={`shop-builder-image-overlay-body ${overlayContentClass} ${contentTransitionClass} ${contentMarginClass}`.trim()} dangerouslySetInnerHTML={{ __html: overlayBody }} />}
                    {overlayMeta && rawBlock.metaAlignment === "below-content" && <OverlayMetaElement className={`shop-builder-image-overlay-meta el-meta ${overlayMetaClass} ${metaTransitionClass} ${metaMarginClass}`.trim()}>{overlayMeta}</OverlayMetaElement>}
                    {overlayLinkText && rawBlock.imageLinkUrl && (
                      <a className={`shop-builder-image-overlay-link ${String(rawBlock.linkStyle || "default").startsWith("link") ? `uk-${rawBlock.linkStyle}` : getUikitButtonClass(rawBlock.linkStyle || "default", rawBlock.linkSize)} ${rawBlock.linkFullWidth ? "uk-width-1-1" : ""} ${linkTransitionClass} ${linkMarginClass}`.trim()} href={rawBlock.imageLinkUrl} {...builderLinkTargetProps(rawBlock.imageLinkTarget)} aria-label={overlayAriaLabel || undefined}>
                        {overlayLinkText}
                      </a>
                    )}
                  </div>
                  {rawBlock.linkOverlay && rawBlock.imageLinkUrl && (
                    <a className="shop-builder-image-overlay-hitarea" href={rawBlock.imageLinkUrl} {...builderLinkTargetProps(rawBlock.imageLinkTarget)} aria-label={overlayAriaLabel || overlayTitle || imageAlt || "Open image"} />
                  )}
                </div>
              )}
            </>
          ) : isCanvas ? (
            <div
              className="builder-media-placeholder-container"
              style={{ minHeight: "180px" }}
            >
              <div className="builder-media-placeholder-content">
                <div className="builder-media-placeholder-icon-frame">
                  <ImageIcon size={24} />
                </div>
                <h4 className="builder-media-placeholder-title">Select an image</h4>
                <p className="builder-media-placeholder-subtitle">
                  Upload or select from media library
                </p>
              </div>
            </div>
          ) : null}
        </div>
        {imageCaption && (
          <figcaption className="uk-text-meta uk-margin-small-top">{imageCaption}</figcaption>
        )}
      </figure>
    </OverlayElement>
  );
}
